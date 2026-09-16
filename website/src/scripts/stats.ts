/**
 * Statistics board (D-063), rebuilt as STROM (D-066).
 *
 * Fetches `GET /api/stats?days=<7|30|90>` with `Authorization: Bearer <key>`
 * and renders the founders' dashboard: the river (scripts/strom.ts) with its
 * counts, shares and rates as DOM text, the totals sentence, the datum line,
 * Der Pegel (the daily series as a water level) and the six Zuläufe ledgers.
 * The Worker answers aggregates only — there is nothing in the JSON that
 * identifies a visitor, and nothing here that could.
 *
 * Every string that arrives is untrusted and reaches the DOM through
 * textContent alone (a path's title attribute is the one attribute, set as
 * a property). `render(data)` is a pure function of the parsed JSON, so the
 * board can be checked against a fixture without a Worker: in DEV,
 * `?fixture` exposes `window.nbStatsRender(json)`, and `?fixture=seed` /
 * `?fixture=empty` render a built-in one straight away.
 *
 * Motion: the river runs on gsap.ticker; the texts are driven by its hooks —
 * on the first data the reveal front crosses each gate and that gate's
 * count rolls, name and share rise, the rate behind it resolves on the
 * teleprinter; the Anfragen count rolls, in signal, as the first enquiry
 * particle crosses gate 4. Later data is an update: changed counts roll,
 * changed rates re-scramble, unchanged stations do not move. Reduced motion
 * and `?snap` get the complete picture with no tween at all; the countdown
 * still ticks (information, not motion).
 *
 * "Live" is a 60-second poll (skipped while the tab is hidden), the STAND
 * stamp with seconds and a countdown on the datum line.
 *
 * The key is a courtesy, not a secret: it sits in sessionStorage for the tab
 * and travels as a bearer header. A wrong one gets a 401 and the form back.
 *
 * Registered through onPage: ClientRouter is live (D-039), so an in-flight
 * fetch, an interval, a tween, the river's ticker callback or an observer
 * left bound would ride into the next page.
 */
import { gsap, motionOff, onPage, primeDraw } from './motion';
import { createStrom, type Strom } from './strom';

const KEY_STORE = 'nb.stats.key';
const OFF_STORE = 'nb.stats.off';
const RANGES = [7, 30, 90] as const;
const POLL_MS = 60_000;
type Days = (typeof RANGES)[number];

/* ------------------------------------------------------------------ */
/* The API contract, parsed defensively                                */
/* ------------------------------------------------------------------ */

interface DayPoint {
  day: string;
  views: number;
  visitors: number;
}

/** Four distinct-visitor counts over the range. A stage MAY exceed the one
    before it (a form can be sent with no tracked click first) — the river
    draws that honestly as a tributary instead of assuming monotony. */
interface Funnel {
  visitors: number;
  engaged: number;
  reached_end: number;
  enquiries: number;
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
  funnel: Funnel;
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
  const funnel = isRecord(json.funnel) ? json.funnel : {};
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
    funnel: {
      visitors: num(funnel.visitors),
      engaged: num(funnel.engaged),
      reached_end: num(funnel.reached_end),
      enquiries: num(funnel.enquiries),
    },
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

/** The per-browser "do not count me" flag the beacon reads. */
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
  /** 35,4 % / 35.4% — shares and conversion rates; whole numbers stay whole (100 %). */
  pct: Intl.NumberFormat;
  /** 16.09. / 16/09 — the Pegel's two dates. */
  dayShort: Intl.DateTimeFormat;
  /** 16.09.2026 / 16/09/2026 — tooltips, aria labels, the days table. */
  dayFull: Intl.DateTimeFormat;
  /** Fetched-at, in the viewer's own time, to the second: the STAND stamp. */
  stamp: Intl.DateTimeFormat;
}

function makeFmt(locale: string): Fmt {
  // The series carries UTC days; formatting them in UTC keeps a day from
  // sliding into its neighbour for a viewer west of Greenwich.
  return {
    int: new Intl.NumberFormat(locale),
    pct: new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 1 }),
    dayShort: new Intl.DateTimeFormat(locale, { timeZone: 'UTC', day: '2-digit', month: '2-digit' }),
    dayFull: new Intl.DateTimeFormat(locale, { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }),
    stamp: new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
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

/** The river's derived figures, shared by the object and its table. */
interface FunnelTexts {
  shares: string[]; // of visitors, per stage
  rates: string[]; // stage i → i+1, three of them
  losses: string[]; // the absolute change, true minus sign
  grows: boolean[]; // a stage that grew reads in paper
}

function funnelTexts(counts: number[], fmt: Fmt): FunnelTexts {
  const visitors = counts[0];
  const shares = counts.map((c) => (visitors > 0 ? fmt.pct.format(c / visitors) : '–'));
  const rates: string[] = [];
  const losses: string[] = [];
  const grows: boolean[] = [];
  for (let i = 1; i < counts.length; i++) {
    const prev = counts[i - 1];
    const delta = counts[i] - prev;
    rates.push(prev > 0 ? fmt.pct.format(counts[i] / prev) : '–');
    if (prev === 0 && counts[i] === 0) losses.push('–');
    else losses.push(delta < 0 ? `−${fmt.int.format(-delta)}` : delta > 0 ? `+${fmt.int.format(delta)}` : '±0');
    grows.push(delta > 0);
  }
  return { shares, rates, losses, grows };
}

/* ------------------------------------------------------------------ */
/* SVG helpers                                                         */
/* ------------------------------------------------------------------ */

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, String(value));
  return el;
}

function svgText(cls: string, x: number, y: number, content: string, anchor: 'start' | 'middle' | 'end' = 'start'): SVGTextElement {
  const el = svgEl('text', { class: cls, x, y, 'text-anchor': anchor });
  el.textContent = content;
  return el;
}

/* ------------------------------------------------------------------ */
/* Der Pegel                                                           */
/* ------------------------------------------------------------------ */
/*
 * The daily series as a water level: views as a straight paper polyline
 * over a fill that fades from steel 18 % to nothing, visitors as a steel
 * polyline inside it, a blurred duplicate of the views path behind it as
 * the only glow. Direct labels at the right ends, the latest day a paper
 * dot with "heute", the first and last dates only — no axes, no gridlines,
 * no legend, and linear segments always: a smoothed curve would invent days.
 */

const PEGEL = { padTop: 20, padBottom: 22, padLeft: 4, padRight: 100 };
const FILL_ID = 'nb-pegel-fill';

interface BarHandlers {
  show: (cx: number, top: number, value: string, label: string) => void;
  hide: () => void;
}

interface PegelDrawing {
  n: number;
  width: number;
  points: { views: string; visitors: string; fill: string };
  dot: { x: number; y: number };
  labelY: { views: number; visitors: number; today: number };
  els: {
    fill: SVGPolygonElement;
    glow: SVGPolylineElement;
    views: SVGPolylineElement;
    visitors: SVGPolylineElement;
    dot: SVGCircleElement;
    texts: SVGTextElement[];
    labelViews: SVGTextElement;
    labelVisitors: SVGTextElement;
    labelToday: SVGTextElement;
  };
}

function drawPegel(
  svg: SVGSVGElement,
  series: DayPoint[],
  width: number,
  height: number,
  fmt: Fmt,
  labels: { views: string; visitors: string; today: string },
  handlers: BarHandlers,
): PegelDrawing | null {
  svg.replaceChildren();
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const n = series.length;
  if (n === 0) return null;

  const max = series.reduce((m, p) => Math.max(m, p.views, p.visitors), 0);
  const plotW = Math.max(0, width - PEGEL.padLeft - PEGEL.padRight);
  const baseline = height - PEGEL.padBottom;
  const plotH = baseline - PEGEL.padTop;
  const x = (i: number) => PEGEL.padLeft + (n > 1 ? (i * plotW) / (n - 1) : plotW / 2);
  const y = (v: number) => baseline - (max > 0 ? v / max : 0) * plotH;
  const r1 = (v: number) => Math.round(v * 10) / 10;

  const viewsPts = series.map((p, i) => `${r1(x(i))},${r1(y(p.views))}`).join(' ');
  const visitorsPts = series.map((p, i) => `${r1(x(i))},${r1(y(p.visitors))}`).join(' ');
  const fillPts = `${viewsPts} ${r1(x(n - 1))},${baseline} ${r1(x(0))},${baseline}`;

  // The fill's gradient: a token via the style attribute, never a hex.
  const defs = svgEl('defs', {});
  const grad = svgEl('linearGradient', { id: FILL_ID, x1: 0, y1: 0, x2: 0, y2: 1 });
  const s0 = svgEl('stop', { offset: 0, 'stop-opacity': 0.18 });
  s0.style.stopColor = 'var(--color-steel)';
  const s1 = svgEl('stop', { offset: 1, 'stop-opacity': 0 });
  s1.style.stopColor = 'var(--color-steel)';
  grad.append(s0, s1);
  defs.append(grad);
  svg.append(defs);

  const fill = svgEl('polygon', { class: 'stats-pegel-fill', points: fillPts, fill: `url(#${FILL_ID})` });
  const glow = svgEl('polyline', { class: 'stats-pegel-line stats-pegel-glow', points: viewsPts });
  const visitors = svgEl('polyline', { class: 'stats-pegel-line stats-pegel-visitors', points: visitorsPts });
  const views = svgEl('polyline', { class: 'stats-pegel-line stats-pegel-views', points: viewsPts });
  svg.append(fill, glow, visitors, views);

  // Per-day hit targets: the whole slot, plot-height tall, a 1px paper
  // cursor line on hover/focus. One tab stop — the latest day — and the
  // arrow keys walk the rest (the keydown listener lives in the init).
  const last = n - 1;
  const slot = n > 1 ? plotW / (n - 1) : plotW;
  for (let i = 0; i < n; i++) {
    const p = series[i];
    const cx = x(i);
    const dayFull = fmtDay(fmt.dayFull, p.day);
    const value = `${fmt.int.format(p.views)} ${labels.views} · ${fmt.int.format(p.visitors)} ${labels.visitors}`;
    const g = svgEl('g', { class: 'stats-bar', tabindex: i === last ? 0 : -1, role: 'img' });
    g.setAttribute('aria-label', `${dayFull}: ${fmt.int.format(p.views)} ${labels.views}, ${fmt.int.format(p.visitors)} ${labels.visitors}`);
    if (i === last) g.dataset.latest = 'true';
    const x0 = i === 0 ? PEGEL.padLeft : cx - slot / 2;
    const x1 = i === last ? PEGEL.padLeft + plotW : cx + slot / 2;
    g.append(
      svgEl('rect', { class: 'stats-bar-hit', x: r1(x0), y: PEGEL.padTop, width: r1(Math.max(1, x1 - x0)), height: plotH }),
      svgEl('line', { class: 'stats-bar-cursor', x1: r1(cx), x2: r1(cx), y1: PEGEL.padTop, y2: baseline }),
    );
    const yTop = y(p.views);
    const show = () => handlers.show(cx, yTop, value, dayFull);
    g.addEventListener('pointerenter', show);
    g.addEventListener('focus', show);
    g.addEventListener('pointerleave', handlers.hide);
    g.addEventListener('blur', handlers.hide);
    svg.append(g);
  }

  // The latest day: a paper dot, "heute" beside it (above-left, or below
  // when the day is the maximum and there is no room above).
  const dx = x(last);
  const dy = y(series[last].views);
  const dot = svgEl('circle', { class: 'stats-pegel-dot', cx: r1(dx), cy: r1(dy), r: 2.5 });
  // "heute" sits on the side the line does not come from: above-left when
  // the last day rises into the dot, below-left when it falls into it — and
  // never outside the plot.
  const prevY = n > 1 ? y(series[n - 2].views) : dy;
  let todayY = prevY >= dy ? dy - 11 : dy + 16;
  if (todayY < PEGEL.padTop - 4) todayY = dy + 16;
  else if (todayY > baseline + 4) todayY = dy - 11;
  const labelToday = svgText('stats-pegel-text', r1(dx - 6), r1(todayY), labels.today, 'end');

  // Direct labels at the right ends: the latest day's values. Pushed apart
  // when the two lines end close together.
  let vy = dy + 4;
  let sy = y(series[last].visitors) + 4;
  if (Math.abs(vy - sy) < 13) sy = vy + 13;
  const clampY = (v: number) => Math.min(baseline + 4, Math.max(PEGEL.padTop - 6, v));
  vy = clampY(vy);
  sy = clampY(sy);
  const labelViews = svgText('stats-pegel-text is-paper', r1(dx + 9), r1(vy), `${labels.views} ${fmt.int.format(series[last].views)}`);
  const labelVisitors = svgText('stats-pegel-text', r1(dx + 9), r1(sy), `${labels.visitors} ${fmt.int.format(series[last].visitors)}`);

  // Only the first and last dates under the line.
  const texts: SVGTextElement[] = [];
  texts.push(svgText('stats-pegel-text', PEGEL.padLeft, height - 6, fmtDay(fmt.dayShort, series[0].day), 'start'));
  if (n > 1) texts.push(svgText('stats-pegel-text', r1(x(last)), height - 6, fmtDay(fmt.dayShort, series[last].day), 'end'));
  svg.append(dot, labelToday, labelViews, labelVisitors, ...texts);

  return {
    n,
    width,
    points: { views: viewsPts, visitors: visitorsPts, fill: fillPts },
    dot: { x: dx, y: dy },
    labelY: { views: vy, visitors: sy, today: todayY },
    els: { fill, glow, views, visitors, dot, texts, labelViews, labelVisitors, labelToday },
  };
}

/* ------------------------------------------------------------------ */
/* Motion helpers                                                      */
/* ------------------------------------------------------------------ */

/** Roll a formatted integer from one value to another; the tween is returned
    so the caller can kill it. Not countUp: that one is ScrollTrigger-bound. */
function rollNumber(el: Element, from: number, to: number, fmt: Intl.NumberFormat, duration: number): gsap.core.Tween {
  const state = { v: from };
  // The first onUpdate lands on the next tick; the start value is written
  // now so a count never shows its placeholder for a frame.
  el.textContent = fmt.format(Math.round(from));
  return gsap.to(state, {
    v: to,
    duration,
    ease: 'expo.out',
    onUpdate: () => {
      el.textContent = fmt.format(Math.round(state.v));
    },
    onComplete: () => {
      el.textContent = fmt.format(to);
    },
  });
}

const SCRAMBLE = { chars: '0123456789', speed: 0.4 };

/* ------------------------------------------------------------------ */
/* Tables                                                              */
/* ------------------------------------------------------------------ */

interface Row {
  cells: string[];
  /** This row's share of the list's top value, 0..1 — the light trace. */
  share: number;
}

function fillRows(tbody: HTMLTableSectionElement, rows: Row[], cols: number): void {
  tbody.replaceChildren();
  // The Aktionen ledger flows its rows top→bottom across CSS grid columns
  // (one, two or three by breakpoint); the row count per column is set here
  // because CSS cannot ceil. Explicit roles keep the table a table for
  // assistive tech once its rows are grid items (the markup sets them too).
  const n = Math.max(1, rows.length);
  tbody.style.setProperty('--rows-1', String(n));
  tbody.style.setProperty('--rows-2', String(Math.ceil(n / 2)));
  tbody.style.setProperty('--rows-3', String(Math.ceil(n / 3)));
  if (rows.length === 0) {
    const tr = document.createElement('tr');
    tr.setAttribute('role', 'row');
    const td = document.createElement('td');
    td.setAttribute('role', 'cell');
    td.className = 'stats-td stats-td-id';
    td.colSpan = cols;
    td.textContent = '–';
    tr.append(td);
    tbody.append(tr);
    return;
  }
  rows.forEach((row, r) => {
    const tr = document.createElement('tr');
    tr.setAttribute('role', 'row');
    tr.className = r === 0 && row.share > 0 ? 'stats-row is-lead' : 'stats-row';
    tr.style.setProperty('--share', row.share.toFixed(3));
    row.cells.forEach((cell, i) => {
      const td = document.createElement('td');
      td.setAttribute('role', 'cell');
      td.className = i === 0 ? 'stats-td stats-td-id' : 'stats-td stats-td-num';
      td.textContent = cell;
      // A truncated path carries its full text in the title (a property,
      // never markup).
      if (i === 0) td.title = cell;
      tr.append(td);
    });
    tbody.append(tr);
  });
}

/** Rows for a ranked list: the identifier, the formatted counts, the share. */
function ranked(items: { id: string; values: number[] }[], fmt: Fmt): Row[] {
  const top = items.reduce((m, it) => Math.max(m, it.values[0] ?? 0), 0);
  return items.map((it) => ({
    cells: [it.id, ...it.values.map((v) => fmt.int.format(v))],
    share: top > 0 ? Math.max(0, Math.min(1, (it.values[0] ?? 0) / top)) : 0,
  }));
}

/* ------------------------------------------------------------------ */
/* DEV fixtures                                                        */
/* ------------------------------------------------------------------ */

/** A built-in reading for checking the picture without a Worker (DEV only —
    Vite drops the whole function from the production chunk). `seed`
    mirrors the local database; `empty` is a range with nobody in it. */
function fixture(days: number, mode: 'seed' | 'empty'): unknown {
  const to = new Date(Date.UTC(2026, 8, 16));
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(to.getTime() - i * 86400000);
    const views = mode === 'empty' ? 0 : Math.max(0, Math.round(30 + 18 * Math.sin(i / 2.6) + (i % 7 === 0 ? 14 : 0) + (i === 9 ? 26 : 0)));
    series.push({ day: d.toISOString().slice(0, 10), views, visitors: Math.round(views * 0.62) });
  }
  const views = series.reduce((t, p) => t + p.views, 0);
  const visitors = series.reduce((t, p) => t + p.visitors, 0);
  const empty = mode === 'empty';
  return {
    range: { from: series[0].day, to: '2026-09-16', days },
    totals: { views, visitors, events: empty ? 0 : 89 },
    series,
    pages: empty ? [] : [{ path: '/', views: 141, visitors: 98 }, { path: '/teaser', views: 42, visitors: 30 }, { path: '/en/', views: 19, visitors: 15 }, { path: '/karte/manush-vaghani', views: 12, visitors: 9 }, { path: '/en/card/peter-knopp/eine-sehr-lange-adresse-die-nicht-die-seite-verbreitern-darf', views: 1, visitors: 1 }],
    referrers: empty ? [] : [{ ref: '', views: 120 }, { ref: 'www.linkedin.com', views: 44 }, { ref: 'www.google.com', views: 31 }],
    countries: empty ? [] : [{ country: 'DE', visitors: 130 }, { country: 'AT', visitors: 9 }, { country: 'CH', visitors: 6 }],
    devices: empty ? [] : [{ device: 'desktop', visitors: 90 }, { device: 'mobile', visitors: 51 }, { device: 'tablet', visitors: 4 }],
    langs: empty ? [] : [{ lang: 'de', views: 190 }, { lang: 'en', views: 30 }],
    events: empty ? [] : [{ event: 'cta', value: 'hero', count: 14 }, { event: 'cta', value: 'closing', count: 6 }, { event: 'teaser', value: 'unlock', count: 3 }],
    funnel: empty ? { visitors: 0, engaged: 0, reached_end: 0, enquiries: 0 } : { visitors: 263, engaged: 93, reached_end: 45, enquiries: 4 },
  };
}

/* ------------------------------------------------------------------ */

type Reason = 'data' | 'size';

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
    toggles: scope.querySelector<HTMLElement>('[data-stats-toggles]'),
    ink: scope.querySelector<HTMLElement>('[data-stats-range-ink]'),
    fetched: scope.querySelector<HTMLElement>('[data-stats-fetched]'),
    nextOut: scope.querySelector<HTMLElement>('[data-stats-next]'),
    scaleOut: scope.querySelector<HTMLElement>('[data-stats-scale]'),
    stage: scope.querySelector<HTMLElement>('[data-stats-stage]'),
    canvas: scope.querySelector<HTMLCanvasElement>('[data-stats-canvas]'),
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
     survive into the handlers below (teaser.ts, same lesson). */
  const els = found as { [K in keyof typeof found]: NonNullable<(typeof found)[K]> };
  const { form, input, keyError, submit, submitLabel, board, status, toggles, ink, fetched, nextOut, scaleOut } = els;
  const { stage, canvas, chart, svg, tip, tipValue, tipLabel, empty, refresh, forget, exclude } = els;

  const radios = Array.from(scope.querySelectorAll<HTMLInputElement>('[data-stats-range]'));
  const kpiEls = new Map<string, HTMLElement>();
  for (const el of scope.querySelectorAll<HTMLElement>('[data-stats-kpi]')) kpiEls.set(el.dataset.statsKpi ?? '', el);
  const tbodies = new Map<string, HTMLTableSectionElement>();
  for (const el of scope.querySelectorAll<HTMLTableSectionElement>('[data-stats-rows]')) {
    tbodies.set(el.dataset.statsRows ?? '', el);
  }
  const q = <T extends Element>(sel: string, i: number) => scope.querySelector<T>(`[${sel}="${i}"]`);
  const countEls = [0, 1, 2, 3].map((i) => q<HTMLElement>('data-stats-count', i));
  const nameEls = [0, 1, 2, 3].map((i) => q<HTMLElement>('data-stats-name', i));
  const shareEls = [0, 1, 2, 3].map((i) => q<HTMLElement>('data-stats-share', i));
  const rateEls = [0, 1, 2].map((i) => q<HTMLElement>('data-stats-rate', i));
  const rateValEls = [0, 1, 2].map((i) => q<HTMLElement>('data-stats-rate-val', i));
  const rateLossEls = [0, 1, 2].map((i) => q<HTMLElement>('data-stats-rate-loss', i));
  if ([...countEls, ...nameEls, ...shareEls, ...rateEls, ...rateValEls, ...rateLossEls].some((el) => el === null)) return;
  const counts = countEls as HTMLElement[];
  const names = nameEls as HTMLElement[];
  const shares = shareEls as HTMLElement[];
  const rates = rateEls as HTMLElement[];
  const rateVals = rateValEls as HTMLElement[];
  const rateLosses = rateLossEls as HTMLElement[];

  const ds = scope.dataset;
  const labels = {
    loading: ds.labelLoading ?? '',
    network: ds.labelNetwork ?? '',
    checking: ds.labelChecking ?? '',
    wrong: ds.labelWrong ?? '',
    views: ds.labelViews ?? '',
    visitors: ds.labelVisitors ?? '',
    direct: ds.labelDirect ?? '',
    today: ds.labelToday ?? '',
    next: ds.labelNext ?? '',
    arrow: ds.labelArrow ?? '',
    scaleOne: ds.labelScaleOne ?? '',
    scaleMany: ds.labelScaleMany ?? '',
    device: {
      mobile: ds.labelDeviceMobile ?? '',
      tablet: ds.labelDeviceTablet ?? '',
      desktop: ds.labelDeviceDesktop ?? '',
      unknown: ds.labelDeviceUnknown ?? '',
    },
  };
  const locale = ds.locale ?? 'de-DE';
  const fmt = makeFmt(locale);
  const submitIdle = submitLabel.textContent ?? '';
  const dev = import.meta.env.DEV;

  let key = recallKey();
  let data: StatsData | null = null;
  let controller: AbortController | null = null;
  let inFlight = false;
  let raf = 0;

  // The funnel texts as shown (null until the first data) and every tween
  // born outside the page context's synchronous pass — killed in the cleanup.
  let shownCounts: number[] | null = null;
  let shownTexts: FunnelTexts | null = null;
  let pendingTexts: { counts: number[]; ft: FunnelTexts } | null = null;
  const textTweens: gsap.core.Tween[] = [];
  let leadFallback = 0;
  let settleTimer = 0;
  let leadRolled = false;
  let pegel: PegelDrawing | null = null;
  let pegelWidth = 0;
  let pegelTl: gsap.core.Timeline | null = null;
  const kpiShown = new Map<string, number>();
  const kpiTweens: gsap.core.Tween[] = [];
  let inkTween: gsap.core.Tween | null = null;

  // The poll and its countdown.
  let pollTimer = 0;
  let nextAt = 0;
  let countdown = 0;

  /* ---- the funnel texts --------------------------------------------- */

  function killTextTweens(): void {
    for (const t of textTweens) t.kill();
    textTweens.length = 0;
    clearTimeout(leadFallback);
    leadFallback = 0;
    clearTimeout(settleTimer);
    settleTimer = 0;
  }

  function setRate(i: number, ft: FunnelTexts, scramble: boolean): void {
    const text = ft.rates[i] === '–' ? '–' : `${labels.arrow} ${ft.rates[i]}`;
    rateLosses[i].textContent = ft.losses[i] === '–' ? '' : ft.losses[i];
    rates[i].classList.toggle('is-growth', ft.grows[i]);
    if (scramble && !motionOff) {
      textTweens.push(gsap.to(rateVals[i], { duration: 0.5, scrambleText: { text, ...SCRAMBLE } }));
    } else {
      rateVals[i].textContent = text;
    }
  }

  /** Every text on the object at its final value, no motion. */
  function finalizeTexts(): void {
    if (!pendingTexts) return;
    const { counts: c, ft } = pendingTexts;
    killTextTweens();
    c.forEach((v, i) => {
      counts[i].textContent = fmt.int.format(v);
      shares[i].textContent = ft.shares[i];
    });
    for (let i = 0; i < 3; i++) setRate(i, ft, false);
    gsap.set([...counts, ...names, ...shares], { opacity: 1, y: 0, clearProps: 'opacity,transform' });
    shownCounts = c.slice();
    shownTexts = ft;
    pendingTexts = null;
    leadRolled = true;
  }

  /** The gate the reveal front just crossed. */
  function frontAt(g: number): void {
    if (!pendingTexts) return;
    const { counts: c, ft } = pendingTexts;
    shares[g].textContent = ft.shares[g];
    textTweens.push(gsap.to([names[g], shares[g]], { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }));
    if (g < 3) {
      gsap.set(counts[g], { opacity: 1 });
      textTweens.push(rollNumber(counts[g], 0, c[g], fmt.int, 1.2));
    } else if (c[3] === 0) {
      // Nothing will ever cross gate 4: the signal count reads 0 now.
      leadRolled = true;
      counts[3].textContent = fmt.int.format(0);
      textTweens.push(gsap.to(counts[3], { opacity: 1, duration: 0.6 }));
    } else {
      // The Anfragen count waits for the first enquiry particle; a spark
      // arrives within a second at today's numbers, but never later than this.
      leadFallback = window.setTimeout(leadAt, 2000);
    }
    if (g >= 1) setRate(g - 1, ft, true);
  }

  /** The first enquiry particle crossed gate 4: the signal count rolls last. */
  function leadAt(): void {
    if (leadRolled || !pendingTexts) return;
    leadRolled = true;
    clearTimeout(leadFallback);
    gsap.set(counts[3], { opacity: 1 });
    textTweens.push(rollNumber(counts[3], 0, pendingTexts.counts[3], fmt.int, 1.2));
  }

  /** The reveal ended. Complete: the rolls and rises still running finish on
      their own and everything is made final once they have — the Anfragen
      count may still be waiting for its spark. Not complete: final now. */
  function revealDone(complete: boolean): void {
    if (!pendingTexts) return;
    if (!complete) {
      finalizeTexts();
      return;
    }
    const { counts: c, ft } = pendingTexts;
    shownCounts = c.slice();
    shownTexts = ft;
    settleTimer = window.setTimeout(finalizeTexts, 2600);
  }

  const strom: Strom = createStrom(canvas, stage, motionOff, { onFront: frontAt, onLead: leadAt, onDone: revealDone, onScale: showScale }, dev);

  /** New funnel figures: the reveal's initial states, or an update. */
  function showFunnel(c: number[]): void {
    const ft = funnelTexts(c, fmt);
    if (motionOff || shownCounts === null) {
      if (motionOff) {
        pendingTexts = { counts: c, ft };
        finalizeTexts();
      } else {
        // First data with motion: hide the texts; the river's hooks reveal them.
        pendingTexts = { counts: c, ft };
        leadRolled = false;
        gsap.set([...counts, ...names, ...shares], { opacity: 0 });
        gsap.set([...names, ...shares], { y: 8 });
        for (let i = 0; i < 3; i++) {
          rateVals[i].textContent = '';
          rateLosses[i].textContent = '';
        }
      }
      strom.setData(c);
      return;
    }
    // Update: changed counts roll, changed rates re-scramble, the rest is set.
    const prev = shownCounts;
    const prevTexts = shownTexts;
    // A reveal still settling is cut short: its texts are final before the
    // update moves them.
    if (pendingTexts) finalizeTexts();
    killTextTweens();
    c.forEach((v, i) => {
      shares[i].textContent = ft.shares[i];
      if (prev[i] !== v) textTweens.push(rollNumber(counts[i], prev[i], v, fmt.int, 0.9));
      else counts[i].textContent = fmt.int.format(v);
    });
    for (let i = 0; i < 3; i++) setRate(i, ft, prevTexts?.rates[i] !== ft.rates[i]);
    shownCounts = c.slice();
    shownTexts = ft;
    strom.setData(c);
  }

  /* ---- tooltip ------------------------------------------------------ */

  const handlers: BarHandlers = {
    show(cx, top, value, label) {
      tipValue.textContent = value;
      tipLabel.textContent = label;
      tip.hidden = false;
      const half = tip.offsetWidth / 2;
      const width = chart.clientWidth;
      tip.style.left = `${Math.min(Math.max(cx, half), Math.max(half, width - half))}px`;
      // Above the point, unless there is no room — then pinned to the top edge.
      const pinned = top - 8 - tip.offsetHeight < 0;
      tip.classList.toggle('stats-tip-pinned', pinned);
      tip.style.top = pinned ? '0px' : `${top - 8}px`;
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

  /**
   * The Pegel at the container's real width. 'data' animates — the draw-in
   * when there is no previous drawing or the day count changed, the points
   * tween otherwise; 'size' redraws the final state.
   */
  function redrawPegel(reason: Reason): void {
    const width = chart.clientWidth;
    const height = svg.clientHeight || 160;
    if (!data || width < 40) return;
    handlers.hide();
    const prev = pegel;
    pegelTl?.kill();
    pegelTl = null;
    const drawing = drawPegel(svg, data.series, width, height, fmt, { views: labels.views, visitors: labels.visitors, today: labels.today }, handlers);
    pegel = drawing;
    pegelWidth = width;
    if (!drawing || motionOff) return;
    const E = drawing.els;
    if (reason === 'size') return;
    if (!prev || prev.n !== drawing.n || prev.width !== drawing.width) {
      // Draw-in: the lines stroke themselves left→right, the fill and the
      // labels follow.
      const tl = gsap.timeline();
      for (const line of [E.glow, E.visitors, E.views]) primeDraw(line);
      tl.to([E.glow, E.views], { strokeDashoffset: 0, duration: 1.0, ease: 'power2.out' }, 0);
      tl.to(E.visitors, { strokeDashoffset: 0, duration: 1.0, ease: 'power2.out' }, 0.1);
      tl.from(E.fill, { opacity: 0, duration: 0.8, ease: 'power2.out' }, 0.3);
      tl.from([E.dot, E.labelToday, E.labelViews, E.labelVisitors, ...E.texts], { opacity: 0, duration: 0.5, stagger: 0.04 }, 0.8);
      pegelTl = tl;
      return;
    }
    // A poll with the same days: the level moves. Legal because both point
    // strings carry the same number of numbers — GSAP tweens them pairwise.
    const settle = { duration: 0.9, ease: 'expo.out' };
    const tl = gsap.timeline();
    if (prev.points.views !== drawing.points.views) {
      tl.fromTo(E.views, { attr: { points: prev.points.views } }, { attr: { points: drawing.points.views }, ...settle }, 0);
      tl.fromTo(E.glow, { attr: { points: prev.points.views } }, { attr: { points: drawing.points.views }, ...settle }, 0);
      tl.fromTo(E.fill, { attr: { points: prev.points.fill } }, { attr: { points: drawing.points.fill }, ...settle }, 0);
      tl.fromTo(E.dot, { attr: { cy: prev.dot.y } }, { attr: { cy: drawing.dot.y }, ...settle }, 0);
      tl.fromTo(E.labelViews, { attr: { y: prev.labelY.views } }, { attr: { y: drawing.labelY.views }, ...settle }, 0);
      tl.fromTo(E.labelToday, { attr: { y: prev.labelY.today } }, { attr: { y: drawing.labelY.today }, ...settle }, 0);
    }
    if (prev.points.visitors !== drawing.points.visitors) {
      tl.fromTo(E.visitors, { attr: { points: prev.points.visitors } }, { attr: { points: drawing.points.visitors }, ...settle }, 0);
      tl.fromTo(E.labelVisitors, { attr: { y: prev.labelY.visitors } }, { attr: { y: drawing.labelY.visitors }, ...settle }, 0);
    }
    pegelTl = tl;
  }

  /** Totals roll from what is shown to what is new — never blink. */
  function setKpi(id: string, value: number): void {
    const el = kpiEls.get(id);
    if (!el) return;
    const from = kpiShown.get(id);
    kpiShown.set(id, value);
    if (motionOff || from === value) {
      el.textContent = fmt.int.format(value);
      return;
    }
    kpiTweens.push(rollNumber(el, from ?? 0, value, fmt.int, from === undefined ? 1.2 : 0.9));
  }

  /** The datum line's written contract, fed by the river itself whenever it
      recomputes k (data, size, breakpoint) — never read ahead of it. */
  function showScale(k: number): void {
    scaleOut.textContent = k === 1 ? labels.scaleOne : labels.scaleMany.replace('{k}', fmt.int.format(k));
  }

  /** Everything on the board, from the JSON alone. */
  function render(next: StatsData): void {
    data = next;
    fetched.textContent = fmt.stamp.format(new Date());

    setKpi('views', next.totals.views);
    setKpi('visitors', next.totals.visitors);
    setKpi('events', next.totals.events);

    const f = next.funnel;
    const c = [f.visitors, f.engaged, f.reached_end, f.enquiries];
    showFunnel(c);

    empty.hidden = next.series.some((p) => p.views > 0);
    redrawPegel('data');

    const ft = funnelTexts(c, fmt);
    const stageNames = names.map((el) => el.textContent ?? '');
    const rows: Record<string, Row[]> = {
      // The river as a table: Stufe · Anzahl · Anteil · Zur Vorstufe — every
      // figure on the object, reachable without reading the object.
      funnel: c.map((v, i) => {
        const step = i === 0 || (ft.rates[i - 1] === '–' && ft.losses[i - 1] === '–') ? '–' : `${ft.rates[i - 1]} · ${ft.losses[i - 1]}`;
        return { cells: [stageNames[i], fmt.int.format(v), ft.shares[i], step], share: 0 };
      }),
      pages: ranked(next.pages.map((r) => ({ id: r.path, values: [r.views, r.visitors] })), fmt),
      referrers: ranked(next.referrers.map((r) => ({ id: r.ref || labels.direct, values: [r.views] })), fmt),
      countries: ranked(next.countries.map((r) => ({ id: r.country || '–', values: [r.visitors] })), fmt),
      devices: ranked(next.devices.map((r) => ({ id: deviceLabel(r.device), values: [r.visitors] })), fmt),
      langs: ranked(next.langs.map((r) => ({ id: r.lang || '–', values: [r.views] })), fmt),
      events: ranked(next.events.map((r) => ({ id: r.value ? `${r.event}:${r.value}` : r.event, values: [r.count] })), fmt),
      // The Pegel's table view, newest day first — every number the tooltip
      // shows, reachable without hovering (dataviz: tooltips never gate).
      days: next.series
        .slice()
        .reverse()
        .map((p) => ({ cells: [fmtDay(fmt.dayFull, p.day), fmt.int.format(p.views), fmt.int.format(p.visitors)], share: 0 })),
    };
    for (const [id, tbody] of tbodies) {
      fillRows(tbody, rows[id] ?? [], Number(tbody.dataset.statsCols) || 2);
    }
  }

  function killMotion(): void {
    killTextTweens();
    pegelTl?.kill();
    pegelTl = null;
    for (const t of kpiTweens) t.kill();
    kpiTweens.length = 0;
    inkTween?.kill();
    inkTween = null;
  }

  /** Back to placeholders — after the key is forgotten, no numbers linger. */
  function clearBoard(): void {
    data = null;
    killMotion();
    strom.clear();
    pendingTexts = null;
    shownCounts = null;
    shownTexts = null;
    for (let i = 0; i < 4; i++) {
      counts[i].textContent = '–';
      shares[i].textContent = '–';
    }
    for (let i = 0; i < 3; i++) {
      rateVals[i].textContent = '';
      rateLosses[i].textContent = '';
      rates[i].classList.remove('is-growth');
    }
    gsap.set([...counts, ...names, ...shares], { clearProps: 'opacity,transform' });
    svg.replaceChildren();
    pegel = null;
    pegelWidth = 0;
    handlers.hide();
    empty.hidden = true;
    fetched.textContent = '–';
    scaleOut.textContent = '–';
    kpiShown.clear();
    for (const el of kpiEls.values()) el.textContent = '–';
    for (const tbody of tbodies.values()) tbody.replaceChildren();
  }

  /* ---- the range underline ------------------------------------------ */

  function moveInk(animate: boolean): void {
    const checked = radios.find((r) => r.checked);
    const label = checked?.closest<HTMLElement>('.stats-toggle');
    if (!label) return;
    const x = label.offsetLeft;
    const width = label.offsetWidth;
    inkTween?.kill();
    if (!animate || motionOff) {
      gsap.set(ink, { x, width });
      return;
    }
    inkTween = gsap.to(ink, { x, width, duration: 0.5, ease: 'expo.out' });
  }

  /* ---- the poll ----------------------------------------------------- */

  function showCountdown(): void {
    if (!nextAt) {
      nextOut.textContent = '–';
      return;
    }
    const s = Math.max(0, Math.ceil((nextAt - Date.now()) / 1000));
    nextOut.textContent = labels.next.replace('{s}', fmt.int.format(s));
  }

  /** Sixty seconds after the last answer; a hidden tab skips its turn. */
  function armPoll(): void {
    clearInterval(pollTimer);
    nextAt = Date.now() + POLL_MS;
    showCountdown();
    pollTimer = window.setInterval(() => {
      nextAt = Date.now() + POLL_MS;
      if (document.hidden || !key || board.hidden || inFlight) return;
      void reload(true);
    }, POLL_MS);
  }

  function disarmPoll(): void {
    clearInterval(pollTimer);
    pollTimer = 0;
    nextAt = 0;
    showCountdown();
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
    moveInk(false);
  }

  function currentDays(): Days {
    const value = Number(radios.find((r) => r.checked)?.value);
    return (RANGES as readonly number[]).includes(value) ? (value as Days) : 30;
  }

  /* ---- fetching ----------------------------------------------------- */

  type Outcome = 'ok' | 'unauthorized' | 'error' | 'aborted';

  /**
   * One request, one outcome. The previous render stays on the board while
   * this runs — dimmed only on the very first load, when there is nothing
   * but placeholders to dim; a poll says nothing at all unless it fails.
   */
  async function load(silent = false): Promise<Outcome> {
    if (!key) return 'unauthorized';
    controller?.abort();
    const ctl = new AbortController();
    controller = ctl;
    inFlight = true;
    if (!data) board.dataset.statsBusy = 'true';
    if (!silent) status.textContent = labels.loading;

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
    if (ctl.signal.aborted) return 'aborted'; // the newer request owns the board now
    inFlight = false;
    delete board.dataset.statsBusy;
    status.textContent = outcome === 'error' ? labels.network : '';
    if (outcome === 'ok') armPoll();
    return outcome;
  }

  /** Board-state reload: a 401 means the key was rotated under us. */
  async function reload(silent = false): Promise<void> {
    const outcome = await load(silent);
    if (outcome === 'unauthorized') {
      forgetKey();
      key = null;
      disarmPoll();
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

  for (const radio of radios) {
    radio.addEventListener('change', () => {
      moveInk(true);
      void reload();
    });
  }
  refresh.addEventListener('click', () => void reload());

  forget.addEventListener('click', () => {
    controller?.abort();
    inFlight = false;
    forgetKey();
    key = null;
    disarmPoll();
    clearBoard();
    showForm();
  });

  exclude.checked = readOff();
  exclude.addEventListener('change', () => writeOff(exclude.checked));

  // Pegel keyboard model: arrows walk the days (focus moves the tooltip with
  // it), Home/End jump, Escape dismisses the tooltip without leaving the day
  // (SC 1.4.13). The hit groups are rebuilt on every draw; the svg is not.
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
    // Roving tabindex: the day the visitor left last is where Tab returns.
    bars[at].tabIndex = -1;
    bars[next].tabIndex = 0;
    bars[next].focus();
  });

  // The Pegel is built at its container's real width and redrawn when that
  // changes — including the jump from 0 when the board is first shown. The
  // river watches its own stage (scripts/strom.ts).
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (chart.clientWidth !== pegelWidth) redrawPegel(pegel ? 'size' : 'data');
      if (!board.hidden) moveInk(false);
    });
  });
  observer.observe(chart);
  observer.observe(toggles);
  void document.fonts?.ready.then(() => {
    if (!board.hidden) moveInk(false);
  });

  // The countdown ticks once a second — information, not motion, so it
  // runs under reduced motion too. Text only.
  countdown = window.setInterval(showCountdown, 1000);

  // DEV only: `?fixture` exposes render() on window for the console;
  // `?fixture=seed` / `?fixture=empty` render a built-in reading at once,
  // with no key and no Worker. Vite drops the whole branch from the
  // production chunk.
  type FixtureWindow = Window & { nbStatsRender?: (json: unknown) => boolean };
  const fixtureParam = dev ? new URLSearchParams(window.location.search).get('fixture') : null;
  const fixtureOn = dev && fixtureParam !== null;
  if (fixtureOn) {
    (window as FixtureWindow).nbStatsRender = (json) => {
      const parsed = parse(json);
      if (!parsed) return false;
      render(parsed);
      return true;
    };
  }

  if (fixtureOn && (fixtureParam === 'seed' || fixtureParam === 'empty')) {
    showBoard();
    const parsed = parse(fixture(currentDays(), fixtureParam));
    if (parsed) render(parsed);
    for (const radio of radios) {
      radio.addEventListener('change', () => {
        const again = parse(fixture(currentDays(), fixtureParam));
        if (again) render(again);
      });
    }
  } else if (key) {
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
    clearInterval(pollTimer);
    clearInterval(countdown);
    killMotion();
    strom.destroy();
    if (fixtureOn) delete (window as FixtureWindow).nbStatsRender;
  };
});
