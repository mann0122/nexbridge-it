/**
 * Statistics board (D-063).
 *
 * Fetches `GET /api/stats?days=<7|30|90>` with `Authorization: Bearer <key>`
 * and renders the founders' datasheet: the KPI row, one bar chart and six
 * tables. The Worker (lane A) answers aggregates only — there is nothing in
 * the JSON that identifies a visitor, and nothing here that could.
 *
 * Every string that arrives is untrusted and reaches the DOM through
 * textContent alone. `render(data)` is a pure function of the parsed JSON,
 * so the board can be checked against a fixture without a Worker.
 *
 * The key is a courtesy, not a secret: it sits in sessionStorage for the tab
 * and travels as a bearer header. A wrong one gets a 401 and the form back.
 *
 * Registered through onPage: ClientRouter is live (D-039), so an in-flight
 * fetch or a ResizeObserver left bound would ride into the next page.
 */
import { onPage } from './motion';

const KEY_STORE = 'nb.stats.key';
const OFF_STORE = 'nb.stats.off';
const RANGES = [7, 30, 90] as const;
type Days = (typeof RANGES)[number];

/* ------------------------------------------------------------------ */
/* The API contract, parsed defensively                                */
/* ------------------------------------------------------------------ */

interface DayPoint {
  day: string;
  views: number;
  visitors: number;
}

interface StatsData {
  range: { from: string; to: string; days: number };
  totals: { views: number; visitors: number; events: number };
  series: DayPoint[];
  pages: { path: string; views: number; visitors: number }[];
  referrers: { ref: string; views: number }[];
  countries: { country: string; visitors: number }[];
  devices: { device: string; visitors: number }[];
  langs: { lang: string; views: number }[];
  events: { event: string; value: string; count: number }[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** A finite number or 0 — a count the API mangled is not a count. */
function num(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function list<T>(value: unknown, map: (row: Record<string, unknown>) => T): T[] {
  return Array.isArray(value) ? value.filter(isRecord).map(map) : [];
}

/** The JSON coerced into the contract's shape, or null when it is not an object. */
function parse(json: unknown): StatsData | null {
  if (!isRecord(json)) return null;
  const range = isRecord(json.range) ? json.range : {};
  const totals = isRecord(json.totals) ? json.totals : {};
  return {
    range: { from: str(range.from), to: str(range.to), days: num(range.days) },
    totals: { views: num(totals.views), visitors: num(totals.visitors), events: num(totals.events) },
    series: list(json.series, (r) => ({ day: str(r.day), views: num(r.views), visitors: num(r.visitors) })),
    pages: list(json.pages, (r) => ({ path: str(r.path), views: num(r.views), visitors: num(r.visitors) })),
    referrers: list(json.referrers, (r) => ({ ref: str(r.ref), views: num(r.views) })),
    countries: list(json.countries, (r) => ({ country: str(r.country), visitors: num(r.visitors) })),
    devices: list(json.devices, (r) => ({ device: str(r.device), visitors: num(r.visitors) })),
    langs: list(json.langs, (r) => ({ lang: str(r.lang), views: num(r.views) })),
    events: list(json.events, (r) => ({ event: str(r.event), value: str(r.value), count: num(r.count) })),
  };
}

/* ------------------------------------------------------------------ */
/* Storage — guarded, like teaser.ts: privacy modes throw outright     */
/* ------------------------------------------------------------------ */

function recallKey(): string | null {
  try {
    return sessionStorage.getItem(KEY_STORE);
  } catch {
    return null;
  }
}

function rememberKey(key: string): void {
  try {
    sessionStorage.setItem(KEY_STORE, key);
  } catch {
    /* costs one re-entry of the key — never an error */
  }
}

function forgetKey(): void {
  try {
    sessionStorage.removeItem(KEY_STORE);
  } catch {
    /* nothing to forget */
  }
}

/** The per-browser "do not count me" flag the beacon (lane B) reads. */
function readOff(): boolean {
  try {
    return localStorage.getItem(OFF_STORE) === '1';
  } catch {
    return false;
  }
}

function writeOff(on: boolean): void {
  try {
    if (on) localStorage.setItem(OFF_STORE, '1');
    else localStorage.removeItem(OFF_STORE);
  } catch {
    /* the checkbox still shows what was asked; the next beacon simply counts */
  }
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

interface Fmt {
  int: Intl.NumberFormat;
  /** 16.09. / 16/09 — axis labels and the range's start. */
  dayShort: Intl.DateTimeFormat;
  /** 16.09.2026 / 16/09/2026 — tooltips, aria labels, the range's end. */
  dayFull: Intl.DateTimeFormat;
  /** Fetched-at, in the viewer's own time. */
  stamp: Intl.DateTimeFormat;
}

function makeFmt(locale: string): Fmt {
  // The series carries UTC days; formatting them in UTC keeps a day from
  // sliding into its neighbour for a viewer west of Greenwich.
  return {
    int: new Intl.NumberFormat(locale),
    dayShort: new Intl.DateTimeFormat(locale, { timeZone: 'UTC', day: '2-digit', month: '2-digit' }),
    dayFull: new Intl.DateTimeFormat(locale, { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }),
    stamp: new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

/** A 'YYYY-MM-DD' UTC day as a Date, or null when the API sent something else. */
function utcDay(day: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const date = new Date(`${day}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function fmtDay(fmt: Intl.DateTimeFormat, day: string): string {
  const date = utcDay(day);
  return date ? fmt.format(date) : day;
}

/**
 * Y-axis ticks at clean integer steps (1, 2, 5 × 10^k), about four of them,
 * the last one at or above the maximum so every bar fits under it.
 */
function niceTicks(max: number): number[] {
  if (max <= 0) return [];
  const raw = max / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = Math.max(1, (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag);
  const ticks: number[] = [];
  for (let v = step; v < max + step; v += step) ticks.push(v);
  return ticks;
}

/* ------------------------------------------------------------------ */
/* Chart geometry                                                      */
/* ------------------------------------------------------------------ */

const SVG_NS = 'http://www.w3.org/2000/svg';
const CHART_H = 220;
const PAD_TOP = 18; // room for the one direct label above the tallest bar
const PAD_BOTTOM = 26; // the x-label band
const PAD_RIGHT = 6;
const BAR_MAX = 24; // dataviz: thin marks, never the whole slot
const MONO_CH = 6.8; // Fragment Mono at 11px, measured — for gutter and label stride
const X_LABEL_W = 46; // "16.09." plus air

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, String(value));
  return el;
}

interface BarHandlers {
  show: (cx: number, top: number, value: string, label: string) => void;
  hide: () => void;
}

/**
 * Draw the views-per-day chart at the given pixel width. One viewBox unit is
 * one CSS pixel, so text is never stretched — the caller re-runs this from a
 * ResizeObserver instead of letting the browser scale the drawing.
 */
function drawChart(
  svg: SVGSVGElement,
  series: DayPoint[],
  width: number,
  fmt: Fmt,
  labels: { views: string; visitors: string },
  handlers: BarHandlers,
): void {
  svg.replaceChildren();
  svg.setAttribute('viewBox', `0 0 ${width} ${CHART_H}`);

  const n = series.length;
  const max = series.reduce((m, p) => Math.max(m, p.views), 0);
  const ticks = niceTicks(max);
  const tickLabels = ticks.map((v) => fmt.int.format(v));
  const gutter = Math.max(24, Math.ceil(8 + Math.max(0, ...tickLabels.map((s) => s.length)) * MONO_CH));
  const plotW = Math.max(0, width - gutter - PAD_RIGHT);
  const baseline = CHART_H - PAD_BOTTOM;
  const plotH = baseline - PAD_TOP;
  const top = ticks.length ? ticks[ticks.length - 1] : 1;
  const y = (v: number) => baseline - (v / top) * plotH;

  // Hairline grid at each tick, recessive; the baseline is the same rule.
  for (let i = 0; i < ticks.length; i++) {
    const ty = Math.round(y(ticks[i])) + 0.5;
    svg.append(svgEl('line', { class: 'stats-grid', x1: gutter, x2: width - PAD_RIGHT, y1: ty, y2: ty }));
    const text = svgEl('text', { class: 'stats-axis', x: gutter - 6, y: ty, dy: '0.35em', 'text-anchor': 'end' });
    text.textContent = tickLabels[i];
    svg.append(text);
  }
  svg.append(svgEl('line', { class: 'stats-grid', x1: gutter, x2: width - PAD_RIGHT, y1: baseline + 0.5, y2: baseline + 0.5 }));

  if (n === 0 || plotW <= 0) return;

  const slot = plotW / n;
  const gap = slot >= 4 ? 2 : 1;
  // Floored, not rounded: with an integer gap this keeps the paper gap
  // between every pair of bars — rounding up let two neighbouring days fuse
  // into one double-width bar at 90 days on a phone (design gate, D-063).
  const bar = Math.max(1, Math.floor(Math.min(BAR_MAX, slot - gap)));
  const centre = (i: number) => gutter + i * slot + slot / 2;

  // Sparse x labels: every day for a week, otherwise every seventh — widened
  // until neighbours cannot touch. The first and last days are always named,
  // anchored to the plot's edges; a middle label is centred on its bar, so it
  // must clear a full label width plus the edge label's own width — the
  // stride alone measures centre to centre and let "11.09.16.09." happen.
  const last = n - 1;
  const left = gutter;
  const right = gutter + n * slot;
  let stride = Math.max(n > 7 ? 7 : 1, Math.ceil(X_LABEL_W / slot));
  if (n > 7) stride = Math.ceil(stride / 7) * 7;
  const labelAt: number[] = [0];
  for (let i = stride; i < last; i += stride) {
    const c = centre(i);
    if (c - X_LABEL_W / 2 >= left + X_LABEL_W + 4 && c + X_LABEL_W / 2 <= right - X_LABEL_W - 4) labelAt.push(i);
  }
  if (last > 0) labelAt.push(last);

  for (const i of labelAt) {
    const anchor = i === 0 ? 'start' : i === last ? 'end' : 'middle';
    const x = i === 0 ? left : i === last ? right : centre(i);
    const text = svgEl('text', { class: 'stats-axis', x, y: CHART_H - 8, 'text-anchor': anchor });
    text.textContent = fmtDay(fmt.dayShort, series[i].day);
    svg.append(text);
  }

  // Bars. Each is a focusable group: a transparent hit rect the height of
  // the plot (the target is bigger than the mark) over the painted bar. One
  // tab stop for the whole chart — the latest day — and the arrow keys walk
  // the rest (the keydown listener lives in the init, the svg persists).
  const maxIndex = series.reduce((best, p, i) => (p.views >= series[best].views ? i : best), 0);
  for (let i = 0; i < n; i++) {
    const point = series[i];
    const x = Math.floor(gutter + i * slot + (slot - bar) / 2);
    // A day with no views has no bar — except the latest, whose 2px tick on
    // the baseline keeps "today" marked before the first visit lands.
    const yTop = point.views > 0 ? Math.round(y(point.views)) : i === last ? baseline - 2 : baseline;
    const dayFull = fmtDay(fmt.dayFull, point.day);
    const value = `${fmt.int.format(point.views)} ${labels.views} · ${fmt.int.format(point.visitors)} ${labels.visitors}`;

    const g = svgEl('g', { class: 'stats-bar', tabindex: i === last ? 0 : -1, role: 'img' });
    g.setAttribute(
      'aria-label',
      `${dayFull}: ${fmt.int.format(point.views)} ${labels.views}, ${fmt.int.format(point.visitors)} ${labels.visitors}`,
    );
    if (i === last) g.dataset.latest = 'true';
    g.append(
      svgEl('rect', { class: 'stats-bar-hit', x: gutter + i * slot, y: PAD_TOP, width: slot, height: plotH }),
      svgEl('rect', { class: 'stats-bar-fill', x, y: yTop, width: bar, height: baseline - yTop }),
    );
    const cx = centre(i);
    const show = () => handlers.show(cx, yTop, value, dayFull);
    g.addEventListener('pointerenter', show);
    g.addEventListener('focus', show);
    g.addEventListener('pointerleave', handlers.hide);
    g.addEventListener('blur', handlers.hide);
    svg.append(g);
  }

  // Direct label on the maximum only — the axis and the tooltip carry the rest.
  if (max > 0) {
    const cx = Math.min(Math.max(centre(maxIndex), gutter + 14), width - PAD_RIGHT - 14);
    const text = svgEl('text', { class: 'stats-axis', x: cx, y: y(max) - 6, 'text-anchor': 'middle' });
    text.textContent = fmt.int.format(max);
    svg.append(text);
  }
}

/* ------------------------------------------------------------------ */
/* Tables                                                              */
/* ------------------------------------------------------------------ */

function fillRows(tbody: HTMLTableSectionElement, rows: string[][], cols: number): void {
  tbody.replaceChildren();
  if (rows.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.className = 'stats-td stats-td-id';
    td.colSpan = cols;
    td.textContent = '–';
    tr.append(td);
    tbody.append(tr);
    return;
  }
  for (const row of rows) {
    const tr = document.createElement('tr');
    row.forEach((cell, i) => {
      const td = document.createElement('td');
      td.className = i === 0 ? 'stats-td stats-td-id' : 'stats-td stats-td-num';
      td.textContent = cell;
      tr.append(td);
    });
    tbody.append(tr);
  }
}

/* ------------------------------------------------------------------ */

onPage(() => {
  const foundScope = document.querySelector<HTMLElement>('[data-stats-scope]');
  if (!foundScope) return; // every other page
  const scope = foundScope;

  const found = {
    form: scope.querySelector<HTMLFormElement>('[data-stats-key-form]'),
    input: scope.querySelector<HTMLInputElement>('[data-stats-key-input]'),
    keyError: scope.querySelector<HTMLElement>('[data-stats-key-error]'),
    // Cta.astro renders the submit and forwards no data attributes, so the
    // form's own submit button is the handle (TeaserGrid does the same).
    submit: scope.querySelector<HTMLButtonElement>('[data-stats-key-form] button[type="submit"]'),
    submitLabel: scope.querySelector<HTMLElement>('[data-stats-key-submit-label]'),
    board: scope.querySelector<HTMLElement>('[data-stats-board]'),
    status: scope.querySelector<HTMLElement>('[data-stats-status]'),
    sheet: scope.querySelector<HTMLElement>('[data-stats-sheet]'),
    rangeOut: scope.querySelector<HTMLElement>('[data-stats-range-out]'),
    fetched: scope.querySelector<HTMLElement>('[data-stats-fetched]'),
    chart: scope.querySelector<HTMLElement>('[data-stats-chart]'),
    svg: scope.querySelector<SVGSVGElement>('[data-stats-svg]'),
    tip: scope.querySelector<HTMLElement>('[data-stats-tip]'),
    tipValue: scope.querySelector<HTMLElement>('[data-stats-tip-value]'),
    tipLabel: scope.querySelector<HTMLElement>('[data-stats-tip-label]'),
    empty: scope.querySelector<HTMLElement>('[data-stats-empty]'),
    refresh: scope.querySelector<HTMLButtonElement>('[data-stats-refresh]'),
    forget: scope.querySelector<HTMLButtonElement>('[data-stats-forget]'),
    exclude: scope.querySelector<HTMLInputElement>('[data-stats-exclude]'),
  };
  if (Object.values(found).some((el) => el === null)) return;
  /* Re-bound through one object after the guard so the non-null types
     survive into the handlers below (teaser.ts, same lesson). The guard
     above checked every member, which is what the assertion states. */
  const els = found as { [K in keyof typeof found]: NonNullable<(typeof found)[K]> };
  const { form, input, keyError, submit, submitLabel, board, status, sheet, rangeOut, fetched, chart, svg } = els;
  const { tip, tipValue, tipLabel, empty, refresh, forget, exclude } = els;

  const radios = Array.from(scope.querySelectorAll<HTMLInputElement>('[data-stats-range]'));
  const kpiEls = new Map<string, HTMLElement>();
  for (const el of scope.querySelectorAll<HTMLElement>('[data-stats-kpi]')) kpiEls.set(el.dataset.statsKpi ?? '', el);
  const tbodies = new Map<string, HTMLTableSectionElement>();
  for (const el of scope.querySelectorAll<HTMLTableSectionElement>('[data-stats-rows]')) {
    tbodies.set(el.dataset.statsRows ?? '', el);
  }

  const labels = {
    loading: scope.dataset.labelLoading ?? '',
    network: scope.dataset.labelNetwork ?? '',
    checking: scope.dataset.labelChecking ?? '',
    wrong: scope.dataset.labelWrong ?? '',
    views: scope.dataset.labelViews ?? '',
    visitors: scope.dataset.labelVisitors ?? '',
    direct: scope.dataset.labelDirect ?? '',
    device: {
      mobile: scope.dataset.labelDeviceMobile ?? '',
      tablet: scope.dataset.labelDeviceTablet ?? '',
      desktop: scope.dataset.labelDeviceDesktop ?? '',
      unknown: scope.dataset.labelDeviceUnknown ?? '',
    },
  };
  const fmt = makeFmt(scope.dataset.locale ?? 'de-DE');
  const submitIdle = submitLabel.textContent ?? '';

  let key = recallKey();
  let data: StatsData | null = null;
  let controller: AbortController | null = null;
  let raf = 0;

  /* ---- tooltip ------------------------------------------------------ */

  const handlers: BarHandlers = {
    show(cx, top, value, label) {
      tipValue.textContent = value;
      tipLabel.textContent = label;
      tip.hidden = false;
      const half = tip.offsetWidth / 2;
      const width = chart.clientWidth;
      tip.style.left = `${Math.min(Math.max(cx, half), Math.max(half, width - half))}px`;
      // Above the bar, unless there is no room — then pinned to the top edge.
      const pinned = top - 6 - tip.offsetHeight < 0;
      tip.classList.toggle('stats-tip-pinned', pinned);
      tip.style.top = pinned ? '0px' : `${top - 6}px`;
    },
    hide() {
      tip.hidden = true;
    },
  };

  /* ---- rendering ---------------------------------------------------- */

  function deviceLabel(device: string): string {
    if (device === 'mobile' || device === 'tablet' || device === 'desktop') return labels.device[device];
    return labels.device.unknown;
  }

  function redrawChart(): void {
    const width = chart.clientWidth;
    if (!data || width < 40) return; // hidden (display:none) or not yet laid out
    handlers.hide();
    drawChart(svg, data.series, width, fmt, { views: labels.views, visitors: labels.visitors }, handlers);
  }

  /** Everything on the sheet, from the JSON alone. */
  function render(next: StatsData): void {
    data = next;
    rangeOut.textContent = `${fmtDay(fmt.dayShort, next.range.from)}–${fmtDay(fmt.dayFull, next.range.to)}`;
    fetched.textContent = fmt.stamp.format(new Date());

    kpiEls.get('views')?.replaceChildren(fmt.int.format(next.totals.views));
    kpiEls.get('visitors')?.replaceChildren(fmt.int.format(next.totals.visitors));
    kpiEls.get('events')?.replaceChildren(fmt.int.format(next.totals.events));

    empty.hidden = next.series.some((p) => p.views > 0);
    redrawChart();

    const rows: Record<string, string[][]> = {
      pages: next.pages.map((r) => [r.path, fmt.int.format(r.views), fmt.int.format(r.visitors)]),
      referrers: next.referrers.map((r) => [r.ref || labels.direct, fmt.int.format(r.views)]),
      countries: next.countries.map((r) => [r.country || '–', fmt.int.format(r.visitors)]),
      devices: next.devices.map((r) => [deviceLabel(r.device), fmt.int.format(r.visitors)]),
      langs: next.langs.map((r) => [r.lang || '–', fmt.int.format(r.views)]),
      events: next.events.map((r) => [r.value ? `${r.event}:${r.value}` : r.event, fmt.int.format(r.count)]),
      // The chart's table view, newest day first — every number the tooltip
      // shows, reachable without hovering (dataviz: tooltips never gate).
      days: next.series
        .slice()
        .reverse()
        .map((p) => [fmtDay(fmt.dayFull, p.day), fmt.int.format(p.views), fmt.int.format(p.visitors)]),
    };
    for (const [id, tbody] of tbodies) {
      fillRows(tbody, rows[id] ?? [], Number(tbody.dataset.statsCols) || 2);
    }
  }

  /** Back to placeholders — after the key is forgotten, no numbers linger. */
  function clearBoard(): void {
    data = null;
    svg.replaceChildren();
    handlers.hide();
    empty.hidden = true;
    rangeOut.textContent = '–';
    fetched.textContent = '–';
    for (const el of kpiEls.values()) el.textContent = '–';
    for (const tbody of tbodies.values()) tbody.replaceChildren();
  }

  /* ---- states ------------------------------------------------------- */

  function showKeyError(message: string): void {
    keyError.hidden = false;
    keyError.textContent = message;
  }

  function clearKeyError(): void {
    keyError.hidden = true;
    keyError.textContent = '';
  }

  function showForm(message?: string): void {
    board.hidden = true;
    form.hidden = false;
    input.value = '';
    if (message) showKeyError(message);
    else clearKeyError();
    input.focus();
  }

  function showBoard(): void {
    form.hidden = true;
    board.hidden = false;
  }

  function currentDays(): Days {
    const value = Number(radios.find((r) => r.checked)?.value);
    return (RANGES as readonly number[]).includes(value) ? (value as Days) : 30;
  }

  /* ---- fetching ----------------------------------------------------- */

  type Outcome = 'ok' | 'unauthorized' | 'error' | 'aborted';

  /**
   * One request, one outcome. The previous render stays on the sheet at
   * reduced opacity while this runs — no skeleton, no layout jump.
   */
  async function load(): Promise<Outcome> {
    if (!key) return 'unauthorized';
    controller?.abort();
    const ctl = new AbortController();
    controller = ctl;
    sheet.dataset.statsBusy = 'true';
    status.textContent = labels.loading;

    let outcome: Outcome = 'error';
    try {
      const res = await fetch(`/api/stats?days=${currentDays()}`, {
        headers: { Authorization: `Bearer ${key}` },
        cache: 'no-store',
        signal: ctl.signal,
      });
      if (res.status === 401) {
        outcome = 'unauthorized';
      } else if (res.ok) {
        const parsed = parse(await res.json());
        if (parsed) {
          render(parsed);
          outcome = 'ok';
        }
      }
    } catch {
      // Offline, blocked, malformed JSON — or superseded by a newer request.
      outcome = ctl.signal.aborted ? 'aborted' : 'error';
    }
    if (ctl.signal.aborted) return 'aborted'; // the newer request owns the sheet now
    delete sheet.dataset.statsBusy;
    status.textContent = outcome === 'error' ? labels.network : '';
    return outcome;
  }

  /** Board-state reload: a 401 means the key was rotated under us. */
  async function reload(): Promise<void> {
    const outcome = await load();
    if (outcome === 'unauthorized') {
      forgetKey();
      key = null;
      clearBoard();
      showForm(labels.wrong);
    }
  }

  /* ---- wiring ------------------------------------------------------- */

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const typed = input.value.trim();
    if (!typed) {
      input.focus();
      return;
    }
    submit.disabled = true;
    submitLabel.textContent = labels.checking;
    clearKeyError();
    key = typed;

    const outcome = await load();
    submit.disabled = false;
    submitLabel.textContent = submitIdle;
    if (outcome === 'ok') {
      rememberKey(typed);
      showBoard();
    } else if (outcome === 'unauthorized') {
      key = null;
      showKeyError(labels.wrong);
      input.select();
    } else if (outcome === 'error') {
      key = null;
      showKeyError(labels.network);
    }
  });

  for (const radio of radios) radio.addEventListener('change', () => void reload());
  refresh.addEventListener('click', () => void reload());

  forget.addEventListener('click', () => {
    controller?.abort();
    forgetKey();
    key = null;
    clearBoard();
    showForm();
  });

  exclude.checked = readOff();
  exclude.addEventListener('change', () => writeOff(exclude.checked));

  // Chart keyboard model: arrows walk the days (focus moves the tooltip with
  // it), Home/End jump, Escape dismisses the tooltip without leaving the bar
  // (SC 1.4.13). The bars are rebuilt on every draw; the svg is not.
  svg.addEventListener('keydown', (event) => {
    const bars = Array.from(svg.querySelectorAll<SVGGElement>('.stats-bar'));
    const at = bars.findIndex((b) => b === document.activeElement);
    if (at < 0) return;
    let next = -1;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(0, at - 1);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(bars.length - 1, at + 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = bars.length - 1;
    else if (event.key === 'Escape') {
      handlers.hide();
      return;
    }
    if (next < 0) return;
    event.preventDefault();
    // Roving tabindex: the bar the visitor left last is where Tab returns.
    bars[at].tabIndex = -1;
    bars[next].tabIndex = 0;
    bars[next].focus();
  });

  // The chart is drawn at the container's real width and redrawn when that
  // changes — including the jump from 0 when the board is first shown.
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(redrawChart);
  });
  observer.observe(chart);

  if (key) {
    showBoard();
    void reload();
  } else {
    form.hidden = false;
    board.hidden = true;
  }

  return () => {
    controller?.abort();
    observer.disconnect();
    cancelAnimationFrame(raf);
  };
});
