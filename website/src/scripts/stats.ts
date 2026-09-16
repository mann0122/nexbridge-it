/**
 * Statistics board (D-063, redesigned D-065).
 *
 * Fetches `GET /api/stats?days=<7|30|90>` with `Authorization: Bearer <key>`
 * and renders the founders' datasheet: the Durchlauf-Messbank, the KPI row,
 * one bar chart and seven Positionsliste tables. The Worker answers
 * aggregates only — there is nothing in the JSON that identifies a visitor,
 * and nothing here that could.
 *
 * Every string that arrives is untrusted and reaches the DOM through
 * textContent alone. `render(data)` is a pure function of the parsed JSON,
 * so the board can be checked against a fixture without a Worker
 * (`?fixture` exposes `window.nbStatsRender(json)` for exactly that).
 *
 * The Messbank (D-065) is built like the chart: inline SVG at the
 * container's measured width, one unit per CSS pixel. The builder always
 * writes the FINAL drawing; the motion driver, when motion is on, sets the
 * initial states with gsap.set and tweens to them — from the origin on the
 * first paint, from the previous drawing on a poll. Reduced motion and
 * `?snap` therefore get the complete drawing with no tween at all.
 *
 * "Live" is a 60-second poll (skipped while the tab is hidden), the STAND
 * stamp with seconds and a countdown line — nothing on the bench loops.
 *
 * The key is a courtesy, not a secret: it sits in sessionStorage for the tab
 * and travels as a bearer header. A wrong one gets a 401 and the form back.
 *
 * Registered through onPage: ClientRouter is live (D-039), so an in-flight
 * fetch, an interval, a tween or a ResizeObserver left bound would ride into
 * the next page.
 */
import { gsap, motionOff, onPage, primeDraw } from './motion';

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
    before it (a form can be sent with no tracked click first) — the bench
    draws that honestly instead of assuming monotony. */
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
  /** 25 % — the beam's percent graduation. */
  pct0: Intl.NumberFormat;
  /** 16.09. / 16/09 — axis labels and the range's start. */
  dayShort: Intl.DateTimeFormat;
  /** 16.09.2026 / 16/09/2026 — tooltips, aria labels, the range's end. */
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
    pct0: new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }),
    dayShort: new Intl.DateTimeFormat(locale, { timeZone: 'UTC', day: '2-digit', month: '2-digit' }),
    dayFull: new Intl.DateTimeFormat(locale, { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }),
    // Two-digit year: with six cells in the title block from lg, the full
    // stamp wrapped to a second line in its cell (design gate, D-065).
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

/**
 * The beam's graduation: major ticks at a clean step (about six of them,
 * none past the scale top — the beam ends where the scale ends, like a
 * ruler cut to length) and minor ticks between them, ruler-style: halves
 * under a 2-step, fifths under a 5- or 10-step, none under a 1-step.
 */
function beamTicks(top: number): { step: number; majors: number[]; minors: number[] } {
  const raw = Math.max(top, 1) / 6;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = Math.max(1, Math.round((norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag));
  const majors: number[] = [];
  for (let k = 1; k * step <= top; k++) majors.push(k * step);
  const leading = Math.round(step / Math.pow(10, Math.floor(Math.log10(step))));
  const minorStep = step <= 1 ? 0 : leading === 2 ? step / 2 : step / 5;
  const minors: number[] = [];
  if (minorStep > 0) {
    const ratio = Math.round(step / minorStep);
    for (let k = 1; k * minorStep <= top; k++) if (k % ratio !== 0) minors.push(k * minorStep);
  }
  return { step, majors, minors };
}

/** The bench's derived figures, shared by the drawing and its Positionsliste. */
interface FunnelTexts {
  shares: string[]; // of visitors, per stage
  rates: string[]; // stage i → i+1, three of them
  losses: string[]; // the absolute change, true minus sign
  grows: boolean[]; // a stage that grew reads in graphite
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
const MONO_CH = 8.2; // Fragment Mono 11px + 0.08em tracking, measured off a render — collision estimates only
const STAGE_CH = 8; // Archivo 13px, wdth 112, wght 600 — average glyph, same purpose

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, String(value));
  return el;
}

function svgText(cls: string, x: number, y: number, content: string, anchor: 'start' | 'middle' | 'end' = 'start', dy = ''): SVGTextElement {
  const attrs: Record<string, string | number> = { class: cls, x, y, 'text-anchor': anchor };
  if (dy) attrs.dy = dy;
  const el = svgEl('text', attrs);
  el.textContent = content;
  return el;
}

/** Snap to the pixel centre so 1px hairlines render as one crisp row. */
function snap(v: number): number {
  return Math.round(v - 0.5) + 0.5;
}

/* ------------------------------------------------------------------ */
/* Chart geometry                                                      */
/* ------------------------------------------------------------------ */

const CHART_H = 220;
const PAD_TOP = 34; // room for the HEUTE tick + label, and the max label above it
const PAD_BOTTOM = 26; // the x-label band
const PAD_RIGHT = 6;
const BAR_MAX = 24; // dataviz: thin marks, never the whole slot
const MONO_AXIS_CH = 6.8; // Fragment Mono at 11px, 0.04em — gutter and label stride
const X_LABEL_W = 46; // "16.09." plus air
const TODAY_TICK = 10; // the latest day's extension tick, off the bar's top

interface BarHandlers {
  show: (cx: number, top: number, value: string, label: string) => void;
  hide: () => void;
}

interface ChartDrawing {
  baseline: number;
  bars: { day: string; views: number; fill: SVGRectElement }[];
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
  labels: { views: string; visitors: string; today: string },
  handlers: BarHandlers,
): ChartDrawing {
  svg.replaceChildren();
  svg.setAttribute('viewBox', `0 0 ${width} ${CHART_H}`);

  const n = series.length;
  const max = series.reduce((m, p) => Math.max(m, p.views), 0);
  const ticks = niceTicks(max);
  const tickLabels = ticks.map((v) => fmt.int.format(v));
  const gutter = Math.max(24, Math.ceil(8 + Math.max(0, ...tickLabels.map((s) => s.length)) * MONO_AXIS_CH));
  const plotW = Math.max(0, width - gutter - PAD_RIGHT);
  const baseline = CHART_H - PAD_BOTTOM;
  const plotH = baseline - PAD_TOP;
  const top = ticks.length ? ticks[ticks.length - 1] : 1;
  const y = (v: number) => baseline - (v / top) * plotH;
  const drawing: ChartDrawing = { baseline, bars: [] };

  // Hairline grid at each tick, recessive; the baseline is the same rule.
  for (let i = 0; i < ticks.length; i++) {
    const ty = Math.round(y(ticks[i])) + 0.5;
    svg.append(svgEl('line', { class: 'stats-grid', x1: gutter, x2: width - PAD_RIGHT, y1: ty, y2: ty }));
    svg.append(svgText('stats-axis', gutter - 6, ty, tickLabels[i], 'end', '0.35em'));
  }
  svg.append(svgEl('line', { class: 'stats-grid', x1: gutter, x2: width - PAD_RIGHT, y1: baseline + 0.5, y2: baseline + 0.5 }));

  if (n === 0 || plotW <= 0) return drawing;

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
    svg.append(svgText('stats-axis', x, CHART_H - 8, fmtDay(fmt.dayShort, series[i].day), anchor));
  }

  // Bars. Each is a focusable group: a transparent hit rect the height of
  // the plot (the target is bigger than the mark) over the painted bar. One
  // tab stop for the whole chart — the latest day — and the arrow keys walk
  // the rest (the keydown listener lives in the init, the svg persists).
  const maxIndex = series.reduce((best, p, i) => (p.views >= series[best].views ? i : best), 0);
  let latestTop = baseline;
  for (let i = 0; i < n; i++) {
    const point = series[i];
    const x = Math.floor(gutter + i * slot + (slot - bar) / 2);
    // A day with no views has no bar — except the latest, whose 2px tick on
    // the baseline keeps "today" marked before the first visit lands.
    const yTop = point.views > 0 ? Math.round(y(point.views)) : i === last ? baseline - 2 : baseline;
    if (i === last) latestTop = yTop;
    const dayFull = fmtDay(fmt.dayFull, point.day);
    const value = `${fmt.int.format(point.views)} ${labels.views} · ${fmt.int.format(point.visitors)} ${labels.visitors}`;

    const g = svgEl('g', { class: 'stats-bar', tabindex: i === last ? 0 : -1, role: 'img' });
    g.setAttribute(
      'aria-label',
      `${dayFull}: ${fmt.int.format(point.views)} ${labels.views}, ${fmt.int.format(point.visitors)} ${labels.visitors}`,
    );
    if (i === last) g.dataset.latest = 'true';
    const fill = svgEl('rect', { class: 'stats-bar-fill', x, y: yTop, width: bar, height: baseline - yTop });
    g.append(svgEl('rect', { class: 'stats-bar-hit', x: gutter + i * slot, y: PAD_TOP, width: slot, height: plotH }), fill);
    const cx = centre(i);
    const show = () => handlers.show(cx, yTop, value, dayFull);
    g.addEventListener('pointerenter', show);
    g.addEventListener('focus', show);
    g.addEventListener('pointerleave', handlers.hide);
    g.addEventListener('blur', handlers.hide);
    svg.append(g);
    drawing.bars.push({ day: point.day, views: point.views, fill });
  }

  // The latest day (D-065): not a colour — an extension tick rising off the
  // bar with a direct HEUTE label. It sits at the right edge, so the label
  // is end-anchored and clamped inside the plot. Today is a partial day, so
  // a taller yesterday under the label is the common case: the tick extends
  // to clear the tallest bar the label spans, and the text sits on a paper
  // knockout (qa gate, D-065 — "HEU E" at 360px).
  const tx = Math.round(centre(last)) + 0.5;
  const todayText = labels.today.toLocaleUpperCase();
  const todayX = Math.min(tx + (todayText.length * MONO_CH) / 2, width - PAD_RIGHT);
  const labelLeft = todayX - todayText.length * MONO_CH - 4;
  let clearTop = latestTop;
  for (let i = 0; i < n; i++) {
    const c = centre(i);
    if (c + bar / 2 >= labelLeft && c - bar / 2 <= todayX && series[i].views > 0) {
      clearTop = Math.min(clearTop, Math.round(y(series[i].views)));
    }
  }
  svg.append(svgEl('line', { class: 'stats-hair', x1: tx, x2: tx, y1: latestTop - 2, y2: clearTop - 2 - TODAY_TICK }));
  svg.append(svgText('stats-annot stats-knock', todayX, clearTop - TODAY_TICK - 6, todayText, 'end'));

  // Direct label on the maximum only — the axis and the tooltip carry the
  // rest. When today is the maximum it stacks above the HEUTE label.
  if (max > 0) {
    const cx = Math.min(Math.max(centre(maxIndex), gutter + 14), width - PAD_RIGHT - 14);
    const ly = maxIndex === last ? clearTop - TODAY_TICK - 20 : y(max) - 6;
    svg.append(svgText('stats-axis', cx, ly, fmt.int.format(max), 'middle'));
  }
  return drawing;
}

/* ------------------------------------------------------------------ */
/* The Durchlauf-Messbank (D-065)                                      */
/* ------------------------------------------------------------------ */
/*
 * One graduated beam carries two scales like a caliper: absolute counts on
 * one side, percent of visitors on the other. Four stations, each a slide
 * track with a carriage whose vernier hairline IS the reading; an extension
 * line carries every reading back to the beam, so the value is read off the
 * graduation, never off the end of a bar. A hard-vertex polyline joins the
 * readings — the taper — and the body beneath it is section-hatched. Fixed
 * shelves above the stations carry part number, count and stage name;
 * dimension lines between neighbours carry the rate over the loss, nominal
 * over tolerance. The last station's carriage is the instrument's pointer:
 * the page's one signal element.
 *
 * Across (≥ 560px measured): vertical beam left, stations left→right.
 * Stacked (below): horizontal beam on top, stations as rows top→bottom,
 * the same grammar turned a quarter.
 */

/* Across: y coordinates, one unit per pixel. */
const ACROSS = {
  H: 420,
  part: 14, // shelf: part-number baseline
  count: 46, // shelf: count baseline (28px display)
  name: 66, // shelf: stage-name baseline
  rule: 74, // shelf rule
  top: 100, // scale top = track head (node centre)
  base: 340, // baseline = origin
  dimTop: 343, // dimension extension lines start (3px off the baseline)
  dimLine: 366,
  dimBottom: 386,
  rate: 361, // rate baseline, above the dimension line
  loss: 380, // loss baseline, below it
  datumRule: 392,
  datumText: 409,
  beamX: 56, // minimum; grows with the widest count label
  pctZone: 58, // beam → plot: the percent ticks and labels
  padRight: 8,
  shelfDx: 26, // shelf left edge sits this far left of the station centre
};

/* Stacked: the beam on top, rows beneath, dimensions in a right-hand margin. */
const STACK = {
  H: 520,
  beamY: 30,
  pctText: 18, // percent labels, above the beam
  countText: 52, // count labels, below it
  row0: 70,
  rowH: 100,
  part: 12, // per row, from the row's top
  count: 42,
  name: 60,
  share: 76,
  track: 84,
  labelW: 100, // the fixed label column
  dimW: 72, // the right-hand dimension margin — holds "107,5 %" end-anchored
  datumText1: 493,
  datumText2: 509,
  datumRule: 476,
};

const BENCH_MIN_ACROSS = 560;
const HATCH_ID = 'nb-bench-hatch';
const CLIP_ID = 'nb-bench-clip';

interface BenchLabels {
  part: string;
  datum: string;
  scale: string;
  stages: string[];
  range: string;
  locale: string;
}

/** Everything the motion driver needs to animate from one drawing to the next. */
interface BenchDrawing {
  stacked: boolean;
  width: number;
  top: number;
  counts: number[];
  readings: number[]; // y per station (across) or x (stacked)
  origin: number; // the baseline y (across) or the plot's x0 (stacked)
  head: number; // the track's far end: the scale top y (across) or the plot's x1 (stacked)
  span: number; // the hatch's full extent along the wipe axis
  taperPoints: string;
  hatchPoints: string;
  texts: FunnelTexts;
  els: {
    beam: SVGGElement;
    ticks: SVGElement[]; // in value order, for the stagger from the origin
    tracks: SVGLineElement[];
    carriages: SVGGElement[]; // [3] is the pointer
    exts: SVGLineElement[];
    taper: SVGPolylineElement;
    hatch: SVGRectElement;
    clip: SVGPolygonElement;
    shelves: SVGGElement[];
    counts: SVGTextElement[];
    shares: SVGTextElement[];
    nodes: SVGRectElement[];
    dims: { line: SVGLineElement; arrows: SVGPolygonElement[]; rate: SVGTextElement; loss: SVGTextElement; mid: number; at: number }[];
  };
}

/** The hatch pattern and the clip polygon, shared by both layouts. */
function hatchDefs(points: string): { defs: SVGDefsElement; clip: SVGPolygonElement } {
  const defs = svgEl('defs', {});
  const pattern = svgEl('pattern', {
    id: HATCH_ID,
    patternUnits: 'userSpaceOnUse',
    width: 8,
    height: 8,
    patternTransform: 'rotate(45)',
  });
  pattern.append(svgEl('line', { class: 'stats-hatch-line', x1: 0, y1: 0, x2: 0, y2: 8 }));
  const clipPath = svgEl('clipPath', { id: CLIP_ID });
  const clip = svgEl('polygon', { points });
  clipPath.append(clip);
  defs.append(pattern, clipPath);
  return { defs, clip };
}

function drawBench(svg: SVGSVGElement, funnel: Funnel, width: number, fmt: Fmt, L: BenchLabels): BenchDrawing {
  const counts = [funnel.visitors, funnel.engaged, funnel.reached_end, funnel.enquiries];
  const texts = funnelTexts(counts, fmt);
  svg.replaceChildren();
  return width < BENCH_MIN_ACROSS
    ? buildStacked(svg, counts, texts, width, fmt, L)
    : buildAcross(svg, counts, texts, width, fmt, L);
}

function buildAcross(svg: SVGSVGElement, counts: number[], tx: FunnelTexts, width: number, fmt: Fmt, L: BenchLabels): BenchDrawing {
  const A = ACROSS;
  const up = (s: string) => s.toLocaleUpperCase(L.locale);
  svg.setAttribute('viewBox', `0 0 ${width} ${A.H}`);

  const visitors = counts[0];
  const max = Math.max(...counts);
  const top = max > 0 ? max : 10; // the zero state still shows a 0–10 scale
  const ticks = beamTicks(top);
  const labelW = Math.max(1, ...ticks.majors.map((v) => fmt.int.format(v).length)) * MONO_CH;
  const beamX = Math.max(A.beamX, Math.ceil(12 + labelW + 4)) + 0.5;
  const plotX0 = beamX + A.pctZone;
  const plotX1 = width - A.padRight;
  const plotW = Math.max(0, plotX1 - plotX0);
  const slot = plotW / 4;
  const baseY = A.base + 0.5;
  const topY = A.top + 0.5;
  const plotH = baseY - topY;
  const y = (v: number) => snap(baseY - (v / top) * plotH);
  const cx = (i: number) => Math.round(plotX0 + (i + 0.5) * slot) + 0.5;
  const xs = counts.map((_, i) => cx(i));
  const readings = counts.map(y);
  const taperPoints = xs.map((x, i) => `${x},${readings[i]}`).join(' ');
  // Six points, always: the four readings and the two baseline corners. A
  // constant count is what lets a poll tween `points` (GSAP interpolates
  // number for number) instead of rebuilding — never add or drop a vertex.
  const hatchPoints = `${taperPoints} ${xs[3]},${baseY} ${xs[0]},${baseY}`;

  /* 1. Hatch body, clipped to the wedge under the taper. */
  const { defs, clip } = hatchDefs(hatchPoints);
  const hatch = svgEl('rect', {
    class: 'stats-hatch',
    x: xs[0],
    y: topY,
    width: Math.max(0, xs[3] - xs[0]),
    height: plotH,
    fill: `url(#${HATCH_ID})`,
    'clip-path': `url(#${CLIP_ID})`,
  });
  svg.append(defs, hatch);

  /* 2. Origin datum and the extension lines — beneath everything they serve. */
  svg.append(svgEl('line', { class: 'stats-ext', x1: beamX, x2: plotX1, y1: baseY, y2: baseY }));
  for (const x of xs) svg.append(svgEl('line', { class: 'stats-ext', x1: x, x2: x, y1: A.dimTop + 0.5, y2: A.dimBottom + 0.5 }));
  const exts = readings.map((r, i) => {
    // From the carriage's edge to the beam: the line draws leftwards.
    const el = svgEl('line', { class: 'stats-read', x1: xs[i] - 14, x2: beamX, y1: r, y2: r });
    svg.append(el);
    return el;
  });

  /* 3. The beam: counts ticked left, percent of visitors ticked right. */
  const beam = svgEl('g', { class: 'stats-beam' });
  beam.append(svgEl('line', { class: 'stats-hair', x1: beamX, x2: beamX, y1: baseY, y2: topY }));
  const tickList: { v: number; el: SVGElement }[] = [];
  const addTick = (v: number, el: SVGElement) => {
    beam.append(el);
    tickList.push({ v, el });
  };
  for (const v of [0, ...ticks.majors]) {
    const ty = y(v);
    addTick(v, svgEl('line', { class: 'stats-hair', x1: beamX - 8, x2: beamX, y1: ty, y2: ty }));
    addTick(v, svgText('stats-annot', beamX - 12, ty, fmt.int.format(v), 'end', '0.35em'));
  }
  for (const v of ticks.minors) {
    const ty = y(v);
    addTick(v, svgEl('line', { class: 'stats-hair', x1: beamX - 4, x2: beamX, y1: ty, y2: ty }));
  }
  const pcts = visitors > 0 ? [0, 25, 50, 75, 100] : [0];
  for (const p of pcts) {
    const v = (p / 100) * visitors;
    const ty = y(v);
    addTick(v, svgEl('line', { class: 'stats-hair', x1: beamX, x2: beamX + 8, y1: ty, y2: ty }));
    addTick(v, svgText('stats-annot stats-knock', beamX + 12, ty, up(fmt.pct0.format(p / 100)), 'start', '0.35em'));
  }
  tickList.sort((a, b) => a.v - b.v);
  svg.append(beam);

  /* 4. Tracks, drawn from the baseline upward. */
  const tracks = xs.map((x) => {
    const el = svgEl('line', { class: 'stats-hair', x1: x, x2: x, y1: baseY, y2: topY });
    svg.append(el);
    return el;
  });

  /* 5. The taper: hard vertices, never a curve. */
  const taper = svgEl('polyline', { class: 'stats-taper', points: taperPoints });
  svg.append(taper);

  /* 6. Nodes at the track heads. */
  const nodes = xs.map((x) => {
    const el = svgEl('rect', { class: 'stats-node', x: x - 3.5, y: topY - 3.5, width: 7, height: 7 });
    svg.append(el);
    return el;
  });

  /* 7. Carriages; the last one carries the pointer instead of a vernier. */
  const carriages = readings.map((r, i) => {
    const x = xs[i];
    const g = svgEl('g', { class: 'stats-carriage-g' });
    g.append(svgEl('rect', { class: 'stats-carriage', x: x - 14, y: r - 5, width: 28, height: 10 }));
    if (i === counts.length - 1) {
      g.append(svgEl('path', { class: 'stats-pointer', d: `M${x - 14},${r} L${x - 4},${r - 4} V${r + 4} Z` }));
    } else {
      g.append(svgEl('line', { class: 'stats-vernier', x1: x - 14, x2: x + 14, y1: r, y2: r }));
    }
    svg.append(g);
    return g;
  });

  /* 8. Shelves: fixed positions above each station. The share sits on the
        stage-name row when the shelf is wide enough, else on the part row.
        Capped at half a slot plus the overhang the right padding affords, so
        the fourth shelf ends inside the drawing (design gate, D-065). */
  const shelfW = Math.min(240, Math.floor(slot - 16), Math.floor(slot / 2 + A.shelfDx + A.padRight) - 1);
  const shelves: SVGGElement[] = [];
  const countEls: SVGTextElement[] = [];
  const shareEls: SVGTextElement[] = [];
  counts.forEach((c, i) => {
    const sx = xs[i] - A.shelfDx;
    const g = svgEl('g', { class: 'stats-shelf' });
    const part = `${L.part}.${String(i + 1).padStart(2, '0')}`;
    const name = L.stages[i] ?? '';
    const share = tx.shares[i];
    // The share sits at the shelf's end on the name row, on the part row if
    // only that has room, and nowhere on the shelf if neither does — the
    // beam's percent scale and the Positionsliste carry it. An empty text
    // node keeps E.shares index-aligned for the driver. (Design gate, D-065:
    // at tablet widths it used to fuse with the part number.)
    const shareOnName = name.length * STAGE_CH + share.length * MONO_CH + 12 <= shelfW;
    const shareOnPart = part.length * MONO_CH + share.length * MONO_CH + 12 <= shelfW;
    const shareRow = shareOnName ? A.name : shareOnPart ? A.part : null;
    g.append(svgText('stats-annot', sx, A.part, up(part)));
    const countEl = svgText('stats-count', sx, A.count, fmt.int.format(c));
    g.append(countEl);
    g.append(svgText('stats-stage', sx, A.name, name));
    const shareEl = svgText('stats-annot', sx + shelfW, shareRow ?? A.name, shareRow ? share : '', 'end');
    g.append(shareEl);
    g.append(svgEl('line', { class: 'stats-ext', x1: sx, x2: sx + shelfW, y1: A.rule + 0.5, y2: A.rule + 0.5 }));
    // Leader from the shelf rule to the node.
    g.append(svgEl('line', { class: 'stats-hair', x1: xs[i], x2: xs[i], y1: A.rule + 0.5, y2: topY - 3.5 }));
    svg.append(g);
    shelves.push(g);
    countEls.push(countEl);
    shareEls.push(shareEl);
  });

  /* 9. Dimension band: rate above the line, loss below — nominal over
        tolerance. Closed 8×6 arrowheads at both ends. */
  const dims: BenchDrawing['els']['dims'] = [];
  const dy = A.dimLine + 0.5;
  for (let i = 0; i < counts.length - 1; i++) {
    const xa = xs[i];
    const xb = xs[i + 1];
    const mid = (xa + xb) / 2;
    const ink = tx.grows[i] ? ' stats-ink' : '';
    const line = svgEl('line', { class: 'stats-hair', x1: xa, x2: xb, y1: dy, y2: dy });
    const arrows = [
      svgEl('polygon', { class: 'stats-arrow', points: `${xa},${dy} ${xa + 8},${dy - 3} ${xa + 8},${dy + 3}` }),
      svgEl('polygon', { class: 'stats-arrow', points: `${xb},${dy} ${xb - 8},${dy - 3} ${xb - 8},${dy + 3}` }),
    ];
    const rate = svgText(`stats-annot${ink}`, mid, A.rate, tx.rates[i], 'middle');
    const loss = svgText(`stats-loss${ink}`, mid, A.loss, tx.losses[i], 'middle');
    svg.append(line, ...arrows, rate, loss);
    dims.push({ line, arrows, rate, loss, mid, at: dy });
  }

  /* 10. Datum band. */
  svg.append(svgEl('line', { class: 'stats-ext', x1: 0, x2: width, y1: A.datumRule + 0.5, y2: A.datumRule + 0.5 }));
  svg.append(svgText('stats-annot', 0, A.datumText, `${up(L.datum)} · ${L.range}`));
  svg.append(svgText('stats-annot', width, A.datumText, up(L.scale), 'end'));

  return {
    stacked: false,
    width,
    top,
    counts,
    readings,
    origin: baseY,
    head: topY,
    span: Math.max(0, xs[3] - xs[0]),
    taperPoints,
    hatchPoints,
    texts: tx,
    els: { beam, ticks: tickList.map((t) => t.el), tracks, carriages, exts, taper, hatch, clip, shelves, counts: countEls, shares: shareEls, nodes, dims },
  };
}

function buildStacked(svg: SVGSVGElement, counts: number[], tx: FunnelTexts, width: number, fmt: Fmt, L: BenchLabels): BenchDrawing {
  const S = STACK;
  const up = (s: string) => s.toLocaleUpperCase(L.locale);
  svg.setAttribute('viewBox', `0 0 ${width} ${S.H}`);

  const visitors = counts[0];
  const max = Math.max(...counts);
  const top = max > 0 ? max : 10;
  const ticks = beamTicks(top);
  const plotX0 = S.labelW + 0.5;
  const plotX1 = Math.max(plotX0, width - S.dimW) + 0.5;
  const plotW = Math.max(0, plotX1 - plotX0);
  const beamY = S.beamY + 0.5;
  const x = (v: number) => snap(plotX0 + (v / top) * plotW);
  const trackY = (i: number) => S.row0 + i * S.rowH + S.track + 0.5;
  const ys = counts.map((_, i) => trackY(i));
  const readings = counts.map(x);
  const taperPoints = readings.map((r, i) => `${r},${ys[i]}`).join(' ');
  // Six points, always — see buildAcross.
  const hatchPoints = `${taperPoints} ${plotX0},${ys[3]} ${plotX0},${ys[0]}`;

  /* 1. Hatch body, left of the taper. */
  const { defs, clip } = hatchDefs(hatchPoints);
  const hatch = svgEl('rect', {
    class: 'stats-hatch',
    x: plotX0,
    y: ys[0],
    width: plotW,
    height: ys[3] - ys[0],
    fill: `url(#${HATCH_ID})`,
    'clip-path': `url(#${CLIP_ID})`,
  });
  svg.append(defs, hatch);

  /* 2. Extension lines: readings rise to the beam; dimensions run right. */
  for (const ty of ys) svg.append(svgEl('line', { class: 'stats-ext', x1: plotX1 + 3, x2: width - 4, y1: ty, y2: ty }));
  const exts = readings.map((r, i) => {
    const el = svgEl('line', { class: 'stats-read', x1: r, x2: r, y1: ys[i] - 14, y2: beamY });
    svg.append(el);
    return el;
  });

  /* 3. The beam across the top: counts below, percent above. Labels are
        thinned to a stride that cannot collide at this width. */
  const beam = svgEl('g', { class: 'stats-beam' });
  beam.append(svgEl('line', { class: 'stats-hair', x1: plotX0, x2: plotX1, y1: beamY, y2: beamY }));
  const tickList: { v: number; el: SVGElement }[] = [];
  const addTick = (v: number, el: SVGElement) => {
    beam.append(el);
    tickList.push({ v, el });
  };
  const countLabelW = Math.max(1, ...ticks.majors.map((v) => fmt.int.format(v).length)) * MONO_CH;
  const majorPx = (ticks.step / top) * plotW;
  const countStride = Math.max(1, Math.ceil((countLabelW + 8) / Math.max(majorPx, 1)));
  [0, ...ticks.majors].forEach((v, k) => {
    const tx0 = x(v);
    addTick(v, svgEl('line', { class: 'stats-hair', x1: tx0, x2: tx0, y1: beamY, y2: beamY + 8 }));
    if (k % countStride === 0) addTick(v, svgText('stats-annot stats-knock', tx0, S.countText, fmt.int.format(v), 'middle'));
  });
  for (const v of ticks.minors) {
    const tx0 = x(v);
    addTick(v, svgEl('line', { class: 'stats-hair', x1: tx0, x2: tx0, y1: beamY, y2: beamY + 4 }));
  }
  const pcts = visitors > 0 ? [0, 25, 50, 75, 100] : [0];
  const pctPx = ((0.25 * visitors) / top) * plotW;
  const pctStride = Math.max(1, Math.ceil((5 * MONO_CH + 8) / Math.max(pctPx, 1)));
  pcts.forEach((p, k) => {
    const v = (p / 100) * visitors;
    const tx0 = x(v);
    addTick(v, svgEl('line', { class: 'stats-hair', x1: tx0, x2: tx0, y1: beamY - 8, y2: beamY }));
    if (k % pctStride === 0 || k === pcts.length - 1) {
      addTick(v, svgText('stats-annot stats-knock', tx0, S.pctText, up(fmt.pct0.format(p / 100)), 'middle'));
    }
  });
  tickList.sort((a, b) => a.v - b.v);
  svg.append(beam);

  /* 4. Rows: shelf in the label column, node at the origin, track rightward. */
  const tracks: SVGLineElement[] = [];
  const nodes: SVGRectElement[] = [];
  const shelves: SVGGElement[] = [];
  const countEls: SVGTextElement[] = [];
  const shareEls: SVGTextElement[] = [];
  counts.forEach((c, i) => {
    const rowTop = S.row0 + i * S.rowH;
    const ty = ys[i];
    const track = svgEl('line', { class: 'stats-hair', x1: plotX0, x2: plotX1, y1: ty, y2: ty });
    svg.append(track);
    tracks.push(track);
    const g = svgEl('g', { class: 'stats-shelf' });
    const part = `${L.part}.${String(i + 1).padStart(2, '0')}`;
    g.append(svgText('stats-annot', 0, rowTop + S.part, up(part)));
    const countEl = svgText('stats-count', 0, rowTop + S.count, fmt.int.format(c));
    g.append(countEl);
    g.append(svgText('stats-stage', 0, rowTop + S.name, L.stages[i] ?? ''));
    const shareEl = svgText('stats-annot', 0, rowTop + S.share, tx.shares[i]);
    g.append(shareEl);
    // The shelf rule runs out to the node: rule and leader in one.
    g.append(svgEl('line', { class: 'stats-ext', x1: 0, x2: plotX0 - 3.5, y1: ty, y2: ty }));
    svg.append(g);
    shelves.push(g);
    countEls.push(countEl);
    shareEls.push(shareEl);
  });

  /* 5. The taper, top to bottom. */
  const taper = svgEl('polyline', { class: 'stats-taper', points: taperPoints });
  svg.append(taper);

  ys.forEach((ty) => {
    const el = svgEl('rect', { class: 'stats-node', x: plotX0 - 3.5, y: ty - 3.5, width: 7, height: 7 });
    svg.append(el);
    nodes.push(el);
  });

  /* 6. Carriages, turned a quarter: 10×28, the pointer aims at the beam. */
  const carriages = readings.map((r, i) => {
    const ty = ys[i];
    const g = svgEl('g', { class: 'stats-carriage-g' });
    g.append(svgEl('rect', { class: 'stats-carriage', x: r - 5, y: ty - 14, width: 10, height: 28 }));
    if (i === counts.length - 1) {
      g.append(svgEl('path', { class: 'stats-pointer', d: `M${r},${ty - 14} L${r - 4},${ty - 4} H${r + 4} Z` }));
    } else {
      g.append(svgEl('line', { class: 'stats-vernier', x1: r, x2: r, y1: ty - 14, y2: ty + 14 }));
    }
    svg.append(g);
    return g;
  });

  /* 7. Dimensions, vertical, in the right-hand margin; rate over loss. */
  const dims: BenchDrawing['els']['dims'] = [];
  const dx = width - 8.5;
  for (let i = 0; i < counts.length - 1; i++) {
    const ya = ys[i];
    const yb = ys[i + 1];
    const mid = (ya + yb) / 2;
    const ink = tx.grows[i] ? ' stats-ink' : '';
    const line = svgEl('line', { class: 'stats-hair', x1: dx, x2: dx, y1: ya, y2: yb });
    const arrows = [
      svgEl('polygon', { class: 'stats-arrow', points: `${dx},${ya} ${dx - 3},${ya + 8} ${dx + 3},${ya + 8}` }),
      svgEl('polygon', { class: 'stats-arrow', points: `${dx},${yb} ${dx - 3},${yb - 8} ${dx + 3},${yb - 8}` }),
    ];
    const rate = svgText(`stats-annot${ink}`, width - 14, mid - 3, tx.rates[i], 'end');
    const loss = svgText(`stats-loss${ink}`, width - 14, mid + 11, tx.losses[i], 'end');
    svg.append(line, ...arrows, rate, loss);
    dims.push({ line, arrows, rate, loss, mid, at: dx });
  }

  /* 8. Datum band, two lines at this width. */
  svg.append(svgEl('line', { class: 'stats-ext', x1: 0, x2: width, y1: S.datumRule + 0.5, y2: S.datumRule + 0.5 }));
  svg.append(svgText('stats-annot', 0, S.datumText1, `${up(L.datum)} · ${L.range}`));
  svg.append(svgText('stats-annot', 0, S.datumText2, up(L.scale)));

  return {
    stacked: true,
    width,
    top,
    counts,
    readings,
    origin: plotX0,
    head: plotX1,
    span: ys[3] - ys[0],
    taperPoints,
    hatchPoints,
    texts: tx,
    els: { beam, ticks: tickList.map((t) => t.el), tracks, carriages, exts, taper, hatch, clip, shelves, counts: countEls, shares: shareEls, nodes, dims },
  };
}

/* ------------------------------------------------------------------ */
/* Motion                                                              */
/* ------------------------------------------------------------------ */

/** Roll a formatted integer from one value to another; the tween is returned
    so a timeline can own it. Not countUp: that one is ScrollTrigger-bound. */
function rollNumber(el: Element, from: number, to: number, fmt: Intl.NumberFormat, duration: number): gsap.core.Tween {
  const state = { v: from };
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

/** A token's resolved colour, read from the root — GSAP cannot tween var(). */
function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Entrance (prev = null): the bench assembles from its origin. Update: the
 * carriages slide from the previous readings with the same settle. Both
 * start from a DOM that already holds the final drawing.
 */
function animateBench(d: BenchDrawing, prev: BenchDrawing | null, fmt: Fmt): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  const E = d.els;
  const axis = d.stacked ? 'x' : 'y';
  const scaleAxis = d.stacked ? 'scaleY' : 'scaleX';
  const wipeAttr = d.stacked ? 'height' : 'width';
  const settle = { duration: 0.9, ease: 'expo.out' };
  /* A gauge settles by a constant few pixels and never past its stop. The
     carriage runs past its reading by ≤ 3px in the direction of travel —
     clamped to the room left before the track head or the origin — then
     eases back. back.out was tried first: its overshoot scales with travel,
     so the top carriage rode 17px past its node while Anfragen's settle was
     invisible (design gate, D-065). `offset` is the carriage's transform at
     the start; the reading is transform 0. */
  const settleTo = (el: SVGGElement, offset: number, reading: number, at: number) => {
    const dir = offset > 0 ? -1 : offset < 0 ? 1 : 0; // travel direction in axis units
    // Room left past the reading in that direction: to the head or to the origin.
    const room =
      dir === 0 ? 0 : dir < 0
        ? (d.stacked ? reading - d.origin : reading - d.head)
        : (d.stacked ? d.head - reading : d.origin - reading);
    const over = Math.min(3, Math.max(0, Math.round(room)));
    if (!dir || !over) {
      tl.to(el, { [axis]: 0, ...settle }, at);
      return;
    }
    tl.to(el, { [axis]: dir * over, duration: 0.68, ease: 'expo.out' }, at);
    tl.to(el, { [axis]: 0, duration: 0.22, ease: 'power1.inOut' }, at + 0.68);
  };

  if (!prev) {
    // Tracks draw from the origin outward; the beam's ticks follow.
    E.tracks.forEach(primeDraw);
    tl.to(E.tracks, { strokeDashoffset: 0, duration: 0.6, stagger: 0.08 }, 0);
    gsap.set(E.ticks, { opacity: 0 });
    tl.to(E.ticks, { opacity: 1, duration: 0.25, stagger: 0.02 }, 0.1);
    // Carriages start at the origin and rise to their readings; each
    // extension line draws as its carriage arrives. The pointer comes last.
    E.carriages.forEach((c, i) => gsap.set(c, { [axis]: d.origin - d.readings[i] }));
    // Reading lines are dashed, so they fade in rather than draw (a draw-on
    // would overwrite the dash pattern).
    gsap.set(E.exts, { opacity: 0 });
    for (let i = 0; i < 3; i++) {
      settleTo(E.carriages[i], d.origin - d.readings[i], d.readings[i], 0.3 + 0.1 * i);
      tl.to(E.exts[i], { opacity: 1, duration: 0.5 }, 0.85 + 0.1 * i);
    }
    // Shelves fade up (no blur — SVG text blur is expensive); counts roll.
    gsap.set(E.shelves, { opacity: 0, y: 8 });
    tl.to(E.shelves, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.4);
    E.counts.forEach((el, i) => tl.add(rollNumber(el, 0, d.counts[i], fmt.int, 1.2), 0.5 + 0.1 * i));
    // The taper draws left→right (top→bottom stacked); the hatch wipes in under it.
    primeDraw(E.taper);
    tl.to(E.taper, { strokeDashoffset: 0, duration: 1.0 }, 1.1);
    gsap.set(E.hatch, { attr: { [wipeAttr]: 0 } });
    tl.to(E.hatch, { attr: { [wipeAttr]: d.span }, duration: 1.0, ease: 'power2.out' }, 1.1);
    // Dimension lines grow from their centres; arrowheads fade; the figures
    // resolve on the teleprinter (D-041's one idiom, on numbers that resolve).
    E.dims.forEach((dim, i) => {
      const origin = d.stacked ? `${dim.at} ${dim.mid}` : `${dim.mid} ${dim.at}`;
      gsap.set(dim.line, { [scaleAxis]: 0, svgOrigin: origin });
      gsap.set([dim.arrows, dim.loss], { opacity: 0 });
      tl.to(dim.line, { [scaleAxis]: 1, duration: 0.5 }, 1.2 + 0.1 * i);
      tl.to([dim.arrows, dim.loss], { opacity: 1, duration: 0.3 }, 1.45 + 0.1 * i);
      // Only the rates resolve on the teleprinter — sixteen scrambling
      // numerals at once was noise, not an idiom (design gate, D-065).
      tl.to(dim.rate, { duration: 0.5, scrambleText: { text: d.texts.rates[i], ...SCRAMBLE } }, 1.4 + 0.1 * i);
    });
    // The signal pointer lands last.
    settleTo(E.carriages[3], d.origin - d.readings[3], d.readings[3], 1.5);
    tl.to(E.exts[3], { opacity: 1, duration: 0.5 }, 2.05);
    return tl;
  }

  // Update. Same width by construction (size changes redraw without motion),
  // so only readings and texts differ; unchanged stations do not move.
  if (prev.stacked !== d.stacked || prev.width !== d.width) return tl;
  const graphite = token('--color-graphite');
  const steelDeep = token('--color-steel-deep');
  d.readings.forEach((r, i) => {
    if (prev.readings[i] === r) return;
    gsap.set(E.carriages[i], { [axis]: prev.readings[i] - r });
    settleTo(E.carriages[i], prev.readings[i] - r, r, 0);
    const p = prev.readings[i];
    tl.fromTo(
      E.exts[i],
      { attr: d.stacked ? { x1: p, x2: p } : { y1: p, y2: p } },
      { attr: d.stacked ? { x1: r, x2: r } : { y1: r, y2: r }, ...settle },
      0,
    );
  });
  if (prev.taperPoints !== d.taperPoints) {
    // Legal because both strings carry the same number of numbers (4 and 6
    // points, always) — GSAP tweens them pairwise.
    tl.fromTo(E.taper, { attr: { points: prev.taperPoints } }, { attr: { points: d.taperPoints }, ...settle }, 0);
    tl.fromTo(E.clip, { attr: { points: prev.hatchPoints } }, { attr: { points: d.hatchPoints }, ...settle }, 0);
  }
  d.counts.forEach((c, i) => {
    if (prev.counts[i] === c) return;
    tl.add(rollNumber(E.counts[i], prev.counts[i], c, fmt.int, 0.9), 0);
    // The changed station's node flashes once, then clears back to its class.
    tl.fromTo(E.nodes[i], { fill: graphite }, { fill: steelDeep, duration: 1.2, ease: 'power1.out', clearProps: 'fill' }, 0);
  });
  // Shares and losses simply show their new value (the builder wrote it);
  // only a changed rate re-scrambles.
  E.dims.forEach((dim, i) => {
    if (prev.texts.rates[i] !== d.texts.rates[i]) tl.to(dim.rate, { duration: 0.4, scrambleText: { text: d.texts.rates[i], ...SCRAMBLE } }, 0);
  });
  // A new scale top re-graduates the beam; it fades in rather than jumps.
  if (prev.top !== d.top) tl.from(E.beam, { opacity: 0, duration: 0.4 }, 0);
  return tl;
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
    sheet: scope.querySelector<HTMLElement>('[data-stats-sheet]'),
    rangeOut: scope.querySelector<HTMLElement>('[data-stats-range-out]'),
    fetched: scope.querySelector<HTMLElement>('[data-stats-fetched]'),
    nextOut: scope.querySelector<HTMLElement>('[data-stats-next]'),
    benchBox: scope.querySelector<HTMLElement>('[data-stats-bench-box]'),
    bench: scope.querySelector<SVGSVGElement>('[data-stats-bench]'),
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
  const { form, input, keyError, submit, submitLabel, board, status, sheet, rangeOut, fetched, nextOut } = els;
  const { benchBox, bench, chart, svg, tip, tipValue, tipLabel, empty, refresh, forget, exclude } = els;

  const radios = Array.from(scope.querySelectorAll<HTMLInputElement>('[data-stats-range]'));
  const kpiEls = new Map<string, HTMLElement>();
  for (const el of scope.querySelectorAll<HTMLElement>('[data-stats-kpi]')) kpiEls.set(el.dataset.statsKpi ?? '', el);
  const tbodies = new Map<string, HTMLTableSectionElement>();
  for (const el of scope.querySelectorAll<HTMLTableSectionElement>('[data-stats-rows]')) {
    tbodies.set(el.dataset.statsRows ?? '', el);
  }

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
    device: {
      mobile: ds.labelDeviceMobile ?? '',
      tablet: ds.labelDeviceTablet ?? '',
      desktop: ds.labelDeviceDesktop ?? '',
      unknown: ds.labelDeviceUnknown ?? '',
    },
  };
  const locale = ds.locale ?? 'de-DE';
  const stages = [ds.labelStageVisitors ?? '', ds.labelStageEngaged ?? '', ds.labelStageEnd ?? '', ds.labelStageEnquiries ?? ''];
  const benchLabels: BenchLabels = {
    part: ds.labelPart ?? '',
    datum: ds.labelDatum ?? '',
    scale: ds.labelScale ?? '',
    stages,
    range: '',
    locale,
  };
  const fmt = makeFmt(locale);
  const submitIdle = submitLabel.textContent ?? '';

  let key = recallKey();
  let data: StatsData | null = null;
  let controller: AbortController | null = null;
  let inFlight = false;
  let raf = 0;

  // Drawings and the tweens born outside the page context's synchronous
  // pass — all killed in the cleanup.
  let benchDraw: BenchDrawing | null = null;
  let benchWidth = 0;
  let benchTl: gsap.core.Timeline | null = null;
  let chartBars: Map<string, number> | null = null;
  let chartWidth = 0;
  let chartTween: gsap.core.Tween | null = null;
  const kpiShown = new Map<string, number>();
  const kpiTweens: gsap.core.Tween[] = [];

  // The poll and its countdown.
  let pollTimer = 0;
  let nextAt = 0;
  let countdown = 0;

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

  /**
   * The bench at the box's real width. 'data' animates — the entrance when
   * there is no previous drawing, the update otherwise; 'size' redraws the
   * final state, except that the first drawing after the board is shown
   * (width 0 → real) is the entrance.
   */
  function redrawBench(reason: Reason): void {
    const width = benchBox.clientWidth;
    if (!data || width < 40) return; // hidden (display:none) or not yet laid out
    const prev = benchDraw;
    benchTl?.kill();
    benchTl = null;
    const drawing = drawBench(bench, data.funnel, width, fmt, benchLabels);
    benchDraw = drawing;
    benchWidth = width;
    if (motionOff) return;
    if (!prev) benchTl = animateBench(drawing, null, fmt);
    else if (reason === 'data') benchTl = animateBench(drawing, prev, fmt);
  }

  function redrawChart(reason: Reason): void {
    const width = chart.clientWidth;
    if (!data || width < 40) return;
    handlers.hide();
    chartTween?.kill();
    chartTween = null;
    const drawing = drawChart(svg, data.series, width, fmt, { views: labels.views, visitors: labels.visitors, today: labels.today }, handlers);
    chartWidth = width;
    // New or changed days grow from the baseline; unchanged bars stay.
    if (!motionOff && (reason === 'data' || !chartBars)) {
      const grown = drawing.bars.filter((b) => chartBars?.get(b.day) !== b.views && b.views > 0).map((b) => b.fill);
      if (grown.length) {
        chartTween = gsap.from(grown, { attr: { y: drawing.baseline, height: 0 }, duration: 0.5, stagger: 0.01, ease: 'expo.out' });
      }
    }
    chartBars = new Map(drawing.bars.map((b) => [b.day, b.views]));
  }

  /** KPI figures roll from what is shown to what is new — never blink. */
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

  /** Everything on the sheet, from the JSON alone. */
  function render(next: StatsData): void {
    data = next;
    benchLabels.range = `${fmtDay(fmt.dayShort, next.range.from)}–${fmtDay(fmt.dayFull, next.range.to)}`;
    rangeOut.textContent = benchLabels.range;
    fetched.textContent = fmt.stamp.format(new Date());

    setKpi('views', next.totals.views);
    setKpi('visitors', next.totals.visitors);
    setKpi('events', next.totals.events);

    empty.hidden = next.series.some((p) => p.views > 0);
    redrawBench('data');
    redrawChart('data');

    const f = next.funnel;
    const counts = [f.visitors, f.engaged, f.reached_end, f.enquiries];
    const ft = funnelTexts(counts, fmt);
    const rows: Record<string, string[][]> = {
      // The bench as a table: Stufe · Anzahl · Anteil · Übergang — every
      // figure on the drawing, reachable without reading the drawing.
      funnel: counts.map((c, i) => {
        const step = i === 0 || (ft.rates[i - 1] === '–' && ft.losses[i - 1] === '–') ? '–' : `${ft.rates[i - 1]} · ${ft.losses[i - 1]}`;
        return [stages[i], fmt.int.format(c), ft.shares[i], step];
      }),
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

  function killMotion(): void {
    benchTl?.kill();
    benchTl = null;
    chartTween?.kill();
    chartTween = null;
    for (const t of kpiTweens) t.kill();
    kpiTweens.length = 0;
  }

  /** Back to placeholders — after the key is forgotten, no numbers linger. */
  function clearBoard(): void {
    data = null;
    killMotion();
    bench.replaceChildren();
    benchDraw = null;
    benchWidth = 0;
    svg.replaceChildren();
    chartBars = null;
    chartWidth = 0;
    handlers.hide();
    empty.hidden = true;
    rangeOut.textContent = '–';
    fetched.textContent = '–';
    kpiShown.clear();
    for (const el of kpiEls.values()) el.textContent = '–';
    for (const tbody of tbodies.values()) tbody.replaceChildren();
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
  }

  function currentDays(): Days {
    const value = Number(radios.find((r) => r.checked)?.value);
    return (RANGES as readonly number[]).includes(value) ? (value as Days) : 30;
  }

  /* ---- fetching ----------------------------------------------------- */

  type Outcome = 'ok' | 'unauthorized' | 'error' | 'aborted';

  /**
   * One request, one outcome. The previous render stays on the sheet while
   * this runs — dimmed only on the very first load, when there is nothing
   * but placeholders to dim; a poll says nothing at all unless it fails.
   */
  async function load(silent = false): Promise<Outcome> {
    if (!key) return 'unauthorized';
    controller?.abort();
    const ctl = new AbortController();
    controller = ctl;
    inFlight = true;
    if (!data) sheet.dataset.statsBusy = 'true';
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
    if (ctl.signal.aborted) return 'aborted'; // the newer request owns the sheet now
    inFlight = false;
    delete sheet.dataset.statsBusy;
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

  for (const radio of radios) radio.addEventListener('change', () => void reload());
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

  // Both drawings are built at their container's real width and redrawn
  // when that changes — including the jump from 0 when the board is first
  // shown. The bench box also grows in height as it is drawn, which fires
  // the observer again: the width comparison is what keeps an entrance from
  // being killed by its own first paint.
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (benchBox.clientWidth !== benchWidth) redrawBench('size');
      if (chart.clientWidth !== chartWidth) redrawChart('size');
    });
  });
  observer.observe(benchBox);
  observer.observe(chart);

  // The countdown ticks once a second — information, not motion, so it
  // runs under reduced motion too. Text only.
  countdown = window.setInterval(showCountdown, 1000);

  // A fixture path for checking the drawing without a Worker: `?fixture`
  // exposes render() on window for the console. Nothing else reads it.
  type FixtureWindow = Window & { nbStatsRender?: (json: unknown) => boolean };
  // DEV only: Vite drops the whole branch from the production chunk.
  const fixture = import.meta.env.DEV && new URLSearchParams(window.location.search).has('fixture');
  if (fixture) {
    (window as FixtureWindow).nbStatsRender = (json) => {
      const parsed = parse(json);
      if (!parsed) return false;
      render(parsed);
      return true;
    };
  }

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
    clearInterval(pollTimer);
    clearInterval(countdown);
    killMotion();
    if (fixture) delete (window as FixtureWindow).nbStatsRender;
  };
});
