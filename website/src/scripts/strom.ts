/**
 * Strom (D-066) — the founders' funnel as a river of light.
 *
 * One canvas, 2D, two offscreen buffers: a soft riverbed painted at quarter
 * resolution and upscaled (free softness, no ctx.filter), and a decaying
 * particle trail composited with 'lighter' so density literally becomes
 * brightness. Every particle is one visitor (or k visitors — the datum
 * line prints k). The river enters wide and pale, passes four gates, and
 * leaves as one thin thread of signal.
 *
 * THE CONTRACT (the judges' law — no light without a visitor behind it):
 *
 *   population_i  = count_i / k          live particles between gate i and i+1
 *   pass_i        = count_i / count_i-1  the share of arrivals gate i lets through,
 *                                        held exactly by a credit accumulator
 *   k             = max(1, ceil(visitors / 600))  (/240 on a phone), raised
 *                                        only if the pool of 900 (360) would
 *                                        overflow — and printed on the page
 *
 * Population is held by flux: the entry emits count_0/k particles per
 * transit of one gate spacing, each filtering gate passes exactly pass_i of
 * its arrivals, and every segment is one gate spacing long, so the count in
 * segment i settles at count_i/k by construction. The entry reach before
 * gate 1 carries arrivals at the same density (they are the same visitors,
 * not yet counted) — that, and the exit reach, is the only light beyond the
 * sum. An empty range is a dry channel with zero particles. Nothing here
 * runs on a timer: the streamlines meander in SPACE (value noise over
 * position, not time), and the only events are particles crossing gates and
 * polls landing. The tuning knobs are k and the alpha caps below — never
 * particle count, speed, drift or a pulse "to look nice".
 *
 * Engine: gsap.ticker is the one clock (D-030); GSAP tweens drive state
 * objects (the bed, the reveal front, the surge), never the canvas. Stops
 * on document.hidden and off-screen, re-seeded at steady state on return so
 * there is never an empty river filling up. Reduced motion / ?snap: no
 * ticker at all — the bed plus one synchronous still of the population.
 *
 * Coordinates: the simulation runs in flow coordinates (s along the flow,
 * t across it) and maps to the canvas at draw time — across (s→x, t→y) on
 * desktop, down (s→y, t→x) on a phone. One axis flag, not a second path.
 * The canvas never paints outside the band [lo, hi] along t: the text
 * bands are unpainted by construction, and the trail composite is clipped
 * to the band as the hard guarantee.
 */
import { gsap } from './motion';

/* ---- knobs: alpha caps (the only tuning surface besides k) ------------- */
const STREAK_ALPHA: [number, number][] = [
  [0.22, 0.34], // stage 1 — steel, 1px, no halo: the entry mass never whites out
  [0.18, 0.28], // stage 2 — paper, warm white
  [0.18, 0.28], // stage 3 — paper streaks too, each with a signal-soft ember for a core (no halo):
  [0.16, 0.26], //   white with embers, so the one orange thread past gate 4 stays a distinct object
];
const SPRITE_ALPHA = [0.55, 0.9]; // stage 3 — the ember core; stage 4 — signal, the hottest thing on the page
/* The bed's token per segment: steel → paper → paper → signal. The river reads
   steel, white, white with embers, one orange thread. */
const BED_COL = [0, 1, 1, 3];
const BED_ALPHA = [0.07, 0.07, 0.09, 0.36]; // the bed along the flow, per segment
const BED_CORE = [0.08, 0.12, 0.16, 0.6]; // a narrower core repeating the gradient, brighter (0.6, not 0.8: the sparks add to it)
const DRY_ALPHA = 0.06; // a segment with no visitors: steel at 6 %, the 8px floor

/* ---- the data mapping (not knobs) --------------------------------------- */
const K_DIVISOR = { across: 600, down: 240 };
const POOL = { across: 900, down: 360 };
const SPEED = { across: 130, down: 110 }; // px/s, base
const JITTER = 0.12; // ±12 % per particle
const H_MAX = { across: 108, down: 62 }; // band half-height at 100 %
const H_MIN = 8; // the luminous floor
const RAMP = 120; // the fork: the tube narrows over 120px past a filtering gate
const FLASH = { gain: 0.8, time: 0.3 }; // ×1.8 for 300ms as a particle crosses a gate
const FLASH_BOOST = { gain: 0.6, time: 1.0 }; // a changed gate's crossings, for 3s after an update
const FLASH_LEAD = { gain: 1.0, time: 0.6 }; // the first enquiry of the reveal: a 2× halo over 600ms
const DECAY = 0.93; // trail decay per 16.7ms (~0.6s tails), frame-rate independent
const GLOW = { impulse: 0.06, tau: 0.8, cap: 0.4, r: 40 }; // arrival-fed gate glow (the judges' graft)
const LANE_K = 2.5; // 1/s — each particle keeps its own lane, a fraction of the tube's half-height
const DRIFT = 12; // px/s of value-noise meander across the flow
/* A sprite is re-drawn every frame into a trail that decays over ~0.6s, so
   along its path a point accumulates the draws of every frame the sprite
   covered it: a 24px halo at 130px/s stacks ~11 frames deep, a 2px core ~2.
   Live draws are scaled down by exactly that, so the picture on screen
   carries the alpha caps above; the still (one draw, no trail) carries
   them directly. Frame-rate independent because the decay is dt-based. */
const LIVE = { halo: 0.09, core: 0.5 };
const NOISE_SCALE = 0.0013; // FlowField's zoom — long sweeping curves
const DISCARD_VT = 38; // px/s outward drift of a discard, reached over 0.5s
const REVEAL = { front: 2.6, surge: 3.2, surgeFrom: 3.2 };
const BED_MORPH = 0.9;
const LEVELS = 12; // alpha buckets per streak colour, batched into one stroke each

type RGB = [number, number, number];

export interface StromHooks {
  /** The reveal front reached gate g (0..3) — roll the count, raise the name. */
  onFront: (gate: number) => void;
  /** The first enquiry particle crossed gate 4 during the reveal. */
  onLead: () => void;
  /** The reveal ended: `complete` when it ran to its end (rolls may still be
      settling), false when it could not run — hidden tab, reduced motion, a
      resize mid-way — and every text must be final at once. */
  onDone: (complete: boolean) => void;
  /** k changed — visitors per particle for the current data and viewport.
      Fires whenever the flux is recomputed (data, size, breakpoint), so the
      datum line always prints the k the river is actually drawn with. */
  onScale: (k: number) => void;
}

export interface Strom {
  /** New counts: the first call reveals (or paints the still), later calls update. */
  setData: (counts: number[]) => void;
  /** Visitors per particle for the current data and viewport. */
  k: () => number;
  /** Back to an empty, dark canvas. */
  clear: () => void;
  destroy: () => void;
}

/* ---- tokens --------------------------------------------------------------- */

function hexToRgb(hex: string): RGB | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/* Colours resolve from the @theme tokens at mount — same contract as
   FlowField. The fallbacks only exist for a hostile environment where
   getComputedStyle yields nothing; they are the tokens' own values. */
function token(name: string, fallback: RGB): RGB {
  return hexToRgb(getComputedStyle(document.documentElement).getPropertyValue(name).trim()) ?? fallback;
}

/* ---- value noise (FlowField's, reseeded each mount) ----------------------- */

function makeNoise(): (x: number, y: number) => number {
  const perm = new Uint8Array(512);
  const seed = Math.random() * 10000;
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(((Math.sin(seed + i) + 1) / 2) * (i + 1));
    const t = perm[i];
    perm[i] = perm[j];
    perm[j] = t;
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number) => a + t * (b - a);
  const grad = (h: number, x: number, y: number) => {
    const q = h & 3;
    const u = q < 2 ? x : y;
    const v = q < 2 ? y : x;
    return ((q & 1) === 0 ? u : -u) + ((q & 2) === 0 ? v : -v);
  };
  return (x: number, y: number): number => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);
    const A = perm[X] + Y;
    const B = perm[X + 1] + Y;
    return lerp(
      lerp(grad(perm[A], x, y), grad(perm[B], x - 1, y), u),
      lerp(grad(perm[A + 1], x, y - 1), grad(perm[B + 1], x - 1, y - 1), u),
      v,
    );
  };
}

const smooth = (u: number): number => {
  const t = u < 0 ? 0 : u > 1 ? 1 : u;
  return t * t * (3 - 2 * t);
};

/* ---- sprites (pre-baked; no shadowBlur, no ctx.filter) -------------------- */

function bake(size: number, dpr: number, paint: (ctx: CanvasRenderingContext2D, r: number) => void): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.ceil(size * dpr);
  c.height = Math.ceil(size * dpr);
  const ctx = c.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  paint(ctx, size / 2);
  return c;
}

const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/* ---- geometry ------------------------------------------------------------- */

interface Geo {
  down: boolean;
  W: number;
  H: number;
  dpr: number;
  gates: number[]; // along s
  seg: number; // gate spacing — the segment length
  sIn: number;
  sOut: number;
  c: number; // the centreline, along t
  hMax: number;
  lo: number; // the painted band along t
  hi: number;
  fade: number; // a discard dissolves over this distance past the band
  speed: number;
  pool: number;
  kDiv: number;
}

/* Modes of a particle. */
const FLOW = 0;
const DISCARD = 1;
const TRIB = 2;
const DEAD = 3;

export function createStrom(
  canvas: HTMLCanvasElement,
  stage: HTMLElement,
  motionOff: boolean,
  hooks: StromHooks,
  dev = false,
): Strom {
  const ctx = canvas.getContext('2d')!;
  const noise = makeNoise();
  const COL: RGB[] = [
    token('--color-steel', [139, 149, 158]),
    token('--color-paper', [247, 245, 240]),
    token('--color-signal-soft', [245, 85, 8]),
    token('--color-signal', [255, 77, 0]),
  ];
  const DRY = COL[0];

  /* ---- state --------------------------------------------------------- */
  let geo: Geo | null = null;
  let counts = [0, 0, 0, 0];
  let hasData = false;
  let painted = false; // the first picture exists (reveal started or still painted)
  let k = 1;
  let entryRate = 0; // particles per second at the entry
  const pass = [1, 1, 1, 1]; // gate quotas, ≤ 1
  const trib = [0, 0, 0, 0]; // surplus emitters (a stage larger than the one before), particles/s
  const credit = [0, 0, 0, 0];
  const tribCredit = [0, 0, 0, 0];
  let emitCredit = 0;
  const glowE = [0, 0, 0, 0];
  const boostUntil = [0, 0, 0, 0];
  let clock = 0; // seconds of simulation

  /* The bed, tweened by GSAP on every data change: half-heights, alphas,
     core alphas and a dry→token mix per segment. */
  const bed: Record<string, number> = {};
  for (let i = 0; i < 4; i++) {
    bed[`h${i}`] = H_MIN;
    bed[`a${i}`] = DRY_ALPHA;
    bed[`c${i}`] = 0;
    bed[`m${i}`] = 0;
  }
  let bedTween: gsap.core.Tween | null = null;

  /* The reveal. */
  const sim = { front: -1e9, surge: 1 };
  let revealing = false;
  const crossedFront = [false, false, false, false];
  let leadFired = false;
  const tweens: gsap.core.Tween[] = [];

  /* ---- buffers --------------------------------------------------------- */
  let trail: HTMLCanvasElement | null = null;
  let tctx: CanvasRenderingContext2D | null = null;
  let bedCanvas: HTMLCanvasElement | null = null;
  let bctx: CanvasRenderingContext2D | null = null;
  let bedImg: ImageData | null = null;
  let coreSoft: HTMLCanvasElement | null = null;
  let haloSignal: HTMLCanvasElement | null = null;
  let coreSignal: HTMLCanvasElement | null = null;
  let glowSprites: HTMLCanvasElement[] = [];

  /* ---- particles (structure of arrays, pooled, no per-frame allocation) -- */
  let S = new Float32Array(0);
  let T = new Float32Array(0);
  let PS = new Float32Array(0);
  let PT = new Float32Array(0);
  let SP = new Float32Array(0); // speed factor
  let LANE = new Float32Array(0); // -0.92..0.92 of the half-height: the particle's own streamline
  let AL = new Float32Array(0); // 0..1 within the stage's alpha range
  let AGE = new Float32Array(0); // since the last gate crossing
  let FG = new Float32Array(0); // flash gain
  let FT = new Float32Array(0); // flash time
  let DAGE = new Float32Array(0); // since discard / tributary spawn
  let ST = new Int8Array(0); // last gate passed, -1 before gate 1
  let MODE = new Uint8Array(0);
  let free = new Int32Array(0);
  let nFree = 0;

  /* Streak batches: per colour (2) and alpha level, four floats per segment. */
  let batch: Float32Array[] = [];
  let batchN = new Int32Array(0);

  function alloc(pool: number): void {
    S = new Float32Array(pool);
    T = new Float32Array(pool);
    PS = new Float32Array(pool);
    PT = new Float32Array(pool);
    SP = new Float32Array(pool);
    LANE = new Float32Array(pool);
    AL = new Float32Array(pool);
    AGE = new Float32Array(pool);
    FG = new Float32Array(pool);
    FT = new Float32Array(pool);
    DAGE = new Float32Array(pool);
    ST = new Int8Array(pool);
    MODE = new Uint8Array(pool).fill(DEAD);
    free = new Int32Array(pool);
    for (let i = 0; i < pool; i++) free[i] = pool - 1 - i;
    nFree = pool;
    batch = [];
    for (let b = 0; b < 4 * LEVELS; b++) batch.push(new Float32Array(pool * 4));
    batchN = new Int32Array(4 * LEVELS);
  }

  function clearPool(): void {
    const pool = MODE.length;
    MODE.fill(DEAD);
    for (let i = 0; i < pool; i++) free[i] = pool - 1 - i;
    nFree = pool;
  }

  /* ---- geometry ------------------------------------------------------- */

  function measure(): Geo | null {
    const cr = canvas.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    const W = Math.round(cr.width);
    const H = Math.round(cr.height);
    if (W < 40 || H < 40) return null;
    const down = window.matchMedia('(max-width: 639.98px)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2);
    const off = sr.left - cr.left;
    const sw = sr.width;
    if (down) {
      return {
        down,
        W,
        H,
        dpr,
        gates: [90, 240, 390, 540],
        seg: 150,
        sIn: -24,
        sOut: H + 24,
        c: off + 226,
        hMax: H_MAX.down,
        lo: off + 146, // the numbers column is x < 146 of the stage
        hi: W,
        fade: 40, // discards dissolve inside the canvas at 360px: 226+62+40 = 328 of 336
        speed: SPEED.down,
        pool: POOL.down,
        kDiv: K_DIVISOR.down,
      };
    }
    return {
      down,
      W,
      H,
      dpr,
      gates: [0, 1, 2, 3].map((i) => off + sw * (0.125 + 0.25 * i)), // the grid's quarter columns
      seg: sw / 4,
      sIn: -24,
      sOut: W + 24,
      c: 299,
      hMax: H_MAX.across,
      lo: 170, // the count band above, the rate band below
      hi: 428,
      fade: 110,
      speed: SPEED.across,
      pool: POOL.across,
      kDiv: K_DIVISOR.across,
    };
  }

  function rebuild(g: Geo): void {
    canvas.width = Math.floor(g.W * g.dpr);
    canvas.height = Math.floor(g.H * g.dpr);
    ctx.setTransform(g.dpr, 0, 0, g.dpr, 0, 0);

    trail = document.createElement('canvas');
    trail.width = canvas.width;
    trail.height = canvas.height;
    tctx = trail.getContext('2d')!;
    tctx.setTransform(g.dpr, 0, 0, g.dpr, 0, 0);
    tctx.lineWidth = 1;
    tctx.lineCap = 'butt';

    bedCanvas = document.createElement('canvas');
    bedCanvas.width = Math.ceil(g.W / 4);
    bedCanvas.height = Math.ceil(g.H / 4);
    bctx = bedCanvas.getContext('2d')!;
    bedImg = bctx.createImageData(bedCanvas.width, bedCanvas.height);

    // Stage-3 ember: a 3px signal-soft core on a paper streak, no halo.
    coreSoft = bake(6, g.dpr, (c, r) => {
      c.fillStyle = rgba(COL[2], 1);
      c.beginPath();
      c.arc(r, r, 1.5, 0, Math.PI * 2);
      c.fill();
    });
    // Stage-4 sprite: a 4px signal core, a 1px paper-white centre, a 24px
    // radial halo from signal at 0.5 to nothing — the hottest thing here.
    haloSignal = bake(50, g.dpr, (c, r) => {
      const halo = c.createRadialGradient(r, r, 0, r, r, 24);
      halo.addColorStop(0, rgba(COL[3], 0.5));
      halo.addColorStop(0.25, rgba(COL[3], 0.22));
      halo.addColorStop(1, rgba(COL[3], 0));
      c.fillStyle = halo;
      c.fillRect(0, 0, r * 2, r * 2);
    });
    coreSignal = bake(8, g.dpr, (c, r) => {
      c.fillStyle = rgba(COL[3], 1);
      c.beginPath();
      c.arc(r, r, 2, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = rgba(COL[1], 0.9);
      c.beginPath();
      c.arc(r, r, 0.75, 0, Math.PI * 2);
      c.fill();
    });
    // Gate glow: a soft radial brightening in the segment's own bed token,
    // no outline, no bright spot — a Gaussian-like falloff. compose() fits it
    // to the tube's local height, so it is a brightening of the bed, never a
    // disc on it.
    glowSprites = BED_COL.map((j) =>
      bake(GLOW.r * 2, g.dpr, (c, r) => {
        const col = COL[j];
        const grad = c.createRadialGradient(r, r, 0, r, r, r);
        grad.addColorStop(0, rgba(col, 1));
        grad.addColorStop(0.5, rgba(col, 0.35));
        grad.addColorStop(0.8, rgba(col, 0.08));
        grad.addColorStop(1, rgba(col, 0));
        c.fillStyle = grad;
        c.fillRect(0, 0, r * 2, r * 2);
      }),
    );

    if (S.length !== g.pool) alloc(g.pool);
    else clearPool();
  }

  /* ---- the data → the flux --------------------------------------------- */

  function applyCounts(g: Geo): void {
    const V = counts[0];
    // Expected live particles at k = 1: the four segments plus the entry and
    // exit reaches at their neighbouring densities. k rises only if that
    // would overflow the pool — the pool is a budget, the count is the data.
    const entry = (g.gates[0] - g.sIn) / g.seg;
    const exit = (g.sOut - g.gates[3]) / g.seg;
    const units = counts[0] * (1 + entry) + counts[1] + counts[2] + counts[3] * (1 + exit);
    k = Math.max(1, Math.ceil(V / g.kDiv), Math.ceil(units / (g.pool * 0.9)));
    const transit = g.seg / g.speed; // seconds per segment
    // population_0 = count_0 / k particles over one transit → the entry rate.
    entryRate = counts[0] / k / transit;
    pass[0] = 1; // gate 1 is a reading: everyone who arrived passes
    trib[0] = 0;
    for (let i = 1; i < 4; i++) {
      const prev = counts[i - 1];
      // pass_i = count_i / count_i-1, exact over time through the credit accumulator.
      pass[i] = prev > 0 ? Math.min(1, counts[i] / prev) : 0;
      // A stage that grew: the surplus enters at the gate as a tributary.
      trib[i] = Math.max(0, counts[i] - prev) / k / transit;
    }
    hooks.onScale(k);
  }

  function bedTargets(g: Geo): Record<string, number> {
    const V = counts[0];
    const t: Record<string, number> = {};
    for (let i = 0; i < 4; i++) {
      const c = counts[i];
      // LINEAR band with a luminous floor (the judges' graft): h_i = max(8, 110·c_i/c_0).
      // The last stage's presence is its signal core and its sparks, not an inflated band.
      t[`h${i}`] = V > 0 && c > 0 ? Math.max(H_MIN, Math.min(g.hMax, (g.hMax * c) / V)) : H_MIN;
      const dry = c === 0;
      t[`a${i}`] = dry ? DRY_ALPHA : BED_ALPHA[i];
      t[`c${i}`] = dry ? 0 : BED_CORE[i];
      t[`m${i}`] = dry ? 0 : 1;
    }
    return t;
  }

  /* ---- the tube ---------------------------------------------------------- */

  /** Segment index for a position along the flow: -1 before gate 1. */
  function segAt(g: Geo, s: number): number {
    let i = -1;
    while (i < 3 && s >= g.gates[i + 1]) i++;
    return i;
  }

  /** Half-height of the tube at s, following the (tweening) bed. */
  function hAt(g: Geo, s: number): number {
    const i = segAt(g, s);
    if (i <= 0) return bed.h0;
    const u = (s - g.gates[i]) / RAMP;
    if (u >= 1) return bed[`h${i}`];
    const a = bed[`h${i - 1}`];
    return a + (bed[`h${i}`] - a) * smooth(u);
  }

  /* ---- the bed ------------------------------------------------------------ */

  function paintBed(): void {
    const g = geo;
    if (!g || !bctx || !bedImg || !bedCanvas) return;
    const data = bedImg.data;
    data.fill(0);
    const bw = bedCanvas.width;
    const bh = bedCanvas.height;
    const nS = g.down ? bh : bw;
    // Rows/columns inside the band only; a 6px inset keeps the upscale's
    // bilinear smear inside it too.
    const tLo = Math.ceil((g.lo + 6) / 4);
    const tHi = Math.floor((g.hi - 6) / 4);
    for (let is = 0; is < nS; is++) {
      const s = is * 4 + 2;
      // Segment, ramp and the mixed parameters at s.
      const i = segAt(g, s);
      let h: number;
      let A: number;
      let C: number;
      let r: number;
      let gg: number;
      let b: number;
      const colOf = (j: number): RGB => {
        const m = bed[`m${j}`];
        const tok = COL[BED_COL[j]];
        return [DRY[0] + (tok[0] - DRY[0]) * m, DRY[1] + (tok[1] - DRY[1]) * m, DRY[2] + (tok[2] - DRY[2]) * m];
      };
      if (i <= 0) {
        h = bed.h0;
        A = bed.a0;
        C = bed.c0;
        [r, gg, b] = colOf(0);
      } else {
        const u = smooth((s - g.gates[i]) / RAMP);
        const ca = colOf(i - 1);
        const cb = colOf(i);
        h = bed[`h${i - 1}`] + (bed[`h${i}`] - bed[`h${i - 1}`]) * u;
        A = bed[`a${i - 1}`] + (bed[`a${i}`] - bed[`a${i - 1}`]) * u;
        C = bed[`c${i - 1}`] + (bed[`c${i}`] - bed[`c${i - 1}`]) * u;
        r = ca[0] + (cb[0] - ca[0]) * u;
        gg = ca[1] + (cb[1] - ca[1]) * u;
        b = ca[2] + (cb[2] - ca[2]) * u;
      }
      const sig1 = 0.45 * h; // the mist: Gaussian, edges never lines
      const sig2 = 0.2 * h; // the core
      const edge0 = h + 8;
      const edge1 = h + 20;
      for (let it = tLo; it <= tHi; it++) {
        const t = it * 4 + 2;
        const d = Math.abs(t - g.c);
        if (d > edge1) continue;
        const g1 = Math.exp((-0.5 * d * d) / (sig1 * sig1));
        const g2 = Math.exp((-0.5 * d * d) / (sig2 * sig2));
        let a = A * g1 + C * g2 * (1 - A * g1);
        if (d > edge0) a *= 1 - smooth((d - edge0) / (edge1 - edge0));
        if (a <= 0.002) continue;
        const p = (g.down ? it + is * bw : is + it * bw) * 4;
        data[p] = r;
        data[p + 1] = gg;
        data[p + 2] = b;
        data[p + 3] = Math.min(255, Math.round(a * 255));
      }
    }
    bctx.putImageData(bedImg, 0, 0);
  }

  /* ---- particles --------------------------------------------------------- */

  function spawn(g: Geo, s: number, stage: number, mode: number, t?: number): number {
    if (nFree === 0) return -1;
    const i = free[--nFree];
    const h = hAt(g, s);
    LANE[i] = (Math.random() * 2 - 1) * 0.92;
    S[i] = s;
    T[i] = t ?? g.c + LANE[i] * h + (Math.random() * 2 - 1) * 3;
    PS[i] = S[i];
    PT[i] = T[i];
    SP[i] = 1 + (Math.random() * 2 - 1) * JITTER;
    AL[i] = Math.random();
    AGE[i] = 9;
    FG[i] = FLASH.gain;
    FT[i] = FLASH.time;
    DAGE[i] = 0;
    ST[i] = stage;
    MODE[i] = mode;
    return i;
  }

  function kill(i: number): void {
    if (MODE[i] === DEAD) return;
    MODE[i] = DEAD;
    free[nFree++] = i;
  }

  /** The population at steady state — the picture before the first frame. */
  function seedSteady(g: Geo): void {
    clearPool();
    const transit = g.seg / g.speed;
    const regions: [number, number, number, number][] = [
      [g.sIn, g.gates[0], counts[0] / k, -1],
      [g.gates[0], g.gates[1], counts[0] / k, 0],
      [g.gates[1], g.gates[2], counts[1] / k, 1],
      [g.gates[2], g.gates[3], counts[2] / k, 2],
      [g.gates[3], g.sOut, counts[3] / k, 3],
    ];
    for (const [a, b, n, stage] of regions) {
      const len = b - a;
      const count = Math.round((n * len) / g.seg);
      for (let j = 0; j < count; j++) spawn(g, a + Math.random() * len, stage, FLOW);
    }
    for (let i = 0; i < 4; i++) {
      credit[i] = 0;
      tribCredit[i] = 0;
      // The gate glow at its steady level: impulse × arrivals per second × tau.
      const arrivals = (i === 0 ? counts[0] : counts[i - 1]) / k / transit;
      glowE[i] = Math.min(GLOW.cap, arrivals * GLOW.impulse * GLOW.tau);
    }
    emitCredit = 0;
  }

  /** A particle reaches gate g: the reading, the quota, the flash, the glow. */
  function cross(i: number, gate: number): void {
    AGE[i] = 0;
    if (clock < boostUntil[gate]) {
      FG[i] = FLASH_BOOST.gain;
      FT[i] = FLASH_BOOST.time;
    } else {
      FG[i] = FLASH.gain;
      FT[i] = FLASH.time;
    }
    glowE[gate] += GLOW.impulse;
    if (gate === 0) {
      ST[i] = 0;
      return;
    }
    credit[gate] += pass[gate];
    if (credit[gate] >= 1) {
      credit[gate] -= 1;
      ST[i] = gate;
      if (gate === 3 && revealing && !leadFired && sim.front >= geo!.gates[3]) {
        leadFired = true;
        FG[i] = FLASH_LEAD.gain;
        FT[i] = FLASH_LEAD.time;
        hooks.onLead();
      }
    } else {
      MODE[i] = DISCARD;
      DAGE[i] = 0;
    }
  }

  function step(g: Geo, dt: number): void {
    const v = g.speed * sim.surge;
    // Emission at the entry, spread over the frame's travel so a busy range
    // never clumps.
    emitCredit += entryRate * sim.surge * dt;
    while (emitCredit >= 1 && nFree > 0) {
      emitCredit -= 1;
      spawn(g, g.sIn - Math.random() * v * dt, -1, FLOW);
    }
    // Tributaries: a grown stage's surplus enters at its gate from below.
    for (let gate = 1; gate < 4; gate++) {
      if (trib[gate] <= 0) continue;
      tribCredit[gate] += trib[gate] * sim.surge * dt;
      while (tribCredit[gate] >= 1 && nFree > 0) {
        tribCredit[gate] -= 1;
        const s = g.gates[gate] + RAMP * (0.5 + Math.random() * 0.5);
        const i = spawn(g, s, gate, TRIB, g.c + hAt(g, s) + 40 + Math.random() * 20);
        if (i >= 0) AL[i] = Math.random();
      }
    }
    for (let gate = 0; gate < 4; gate++) glowE[gate] *= Math.exp(-dt / GLOW.tau);

    const n = MODE.length;
    for (let i = 0; i < n; i++) {
      const mode = MODE[i];
      if (mode === DEAD) continue;
      const s = S[i];
      const t = T[i];
      PS[i] = s;
      PT[i] = t;
      AGE[i] += dt;
      const h = hAt(g, s);
      const d = t - g.c;
      let vs = v * SP[i];
      let vt = DRIFT * noise(s * NOISE_SCALE, t * NOISE_SCALE);
      if (mode === FLOW) {
        // The lane spring: the particle follows its own streamline, a fixed
        // fraction of the tube's half-height, so the band contracts as one
        // body at a fork and never piles up at an edge. The noise wanders it.
        vt -= LANE_K * (d - LANE[i] * h);
      } else if (mode === DISCARD) {
        DAGE[i] += dt;
        const ramp = Math.min(1, DAGE[i] / 0.5);
        vs *= 1 - 0.4 * ramp;
        // Outward, faster the deeper inside the tube it started, so the
        // spill leaves the fork as one curve rather than a lingering drizzle.
        vt += (DISCARD_VT + 0.35 * Math.max(0, h - d)) * ramp;
      } else {
        // Tributary: rising into the channel along the fork's curve reversed.
        DAGE[i] += dt;
        vt = -(h + 60) / 0.9;
        if (d < LANE[i] * h + 4) MODE[i] = FLOW;
      }
      const ns = s + vs * dt;
      const nt = t + vt * dt;
      S[i] = ns;
      T[i] = nt;
      if (ns > g.sOut) {
        kill(i);
        continue;
      }
      if (MODE[i] === DISCARD) {
        // Dissolved once it has fallen `fade` past the band's edge, and never
        // past the band itself — the text beneath stays clean by construction.
        if (nt - g.c - h > g.fade || nt > g.hi - 8) kill(i);
        continue;
      }
      // A stalled tab may step over two gates at once; a discard stops here.
      while (MODE[i] !== DISCARD && ST[i] < 3 && ns >= g.gates[ST[i] + 1]) cross(i, ST[i] + 1);
    }
  }

  /* ---- drawing ------------------------------------------------------------ */

  function streak(colour: number, alpha: number, x0: number, y0: number, x1: number, y1: number): void {
    if (alpha <= 0.004) return;
    const level = Math.min(LEVELS - 1, Math.round((alpha / 0.72) * (LEVELS - 1)));
    const b = colour * LEVELS + level;
    const n = batchN[b];
    const arr = batch[b];
    if (n * 4 + 4 > arr.length) return;
    arr[n * 4] = x0;
    arr[n * 4 + 1] = y0;
    arr[n * 4 + 2] = x1;
    arr[n * 4 + 3] = y1;
    batchN[b] = n + 1;
  }

  function sprite(kind: number, alpha: number, x: number, y: number, still: boolean): void {
    const t = tctx!;
    if (alpha <= 0.004) return;
    const haloA = alpha * (still ? 1 : LIVE.halo);
    const coreA = alpha * (still ? 1 : LIVE.core);
    if (kind === 2) {
      // The ember: core only, riding a paper streak drawn by the caller.
      t.globalAlpha = Math.min(1, coreA);
      t.drawImage(coreSoft!, x - 3, y - 3, 6, 6);
    } else {
      t.globalAlpha = Math.min(1, haloA);
      t.drawImage(haloSignal!, x - 25, y - 25, 50, 50);
      t.globalAlpha = Math.min(1, coreA);
      t.drawImage(coreSignal!, x - 4, y - 4, 8, 8);
    }
  }

  /* The particle being drawn, handed to drawOne through scope rather than
     a per-particle closure: one function per mount, no allocation per frame. */
  let dI = 0;
  let dMode = 0;
  let dFlash = 1;
  let dFade = 1;
  let dStill = false;
  let dX0 = 0;
  let dY0 = 0;
  let dX1 = 0;
  let dY1 = 0;

  /** One draw of the current particle in one token at weight w. Streaks for
      stages 1–3 and for every discard — stage 3 in paper, with a signal-soft
      ember for a core while it is still in the channel; the signal sprite
      only for the visitors past gate 4. */
  function drawOne(colour: number, w: number): void {
    if (w <= 0.002) return;
    if (colour <= 2 || dMode === DISCARD) {
      const [lo, hi] = STREAK_ALPHA[colour];
      streak(colour === 2 ? 1 : colour, (lo + AL[dI] * (hi - lo)) * dFlash * dFade * w, dX0, dY0, dX1, dY1);
      if (colour === 2 && dMode !== DISCARD) sprite(2, SPRITE_ALPHA[0] * dFlash * dFade * w, dX1, dY1, dStill);
    } else {
      sprite(colour, SPRITE_ALPHA[colour - 2] * dFlash * dFade * w, dX1, dY1, dStill);
    }
  }

  /** Draw every live particle into the trail buffer (additive). */
  function drawParticles(g: Geo, stillLen: number): void {
    const t = tctx!;
    batchN.fill(0);
    const n = MODE.length;
    const front = revealing ? sim.front : Infinity;
    dStill = stillLen > 0;
    for (let i = 0; i < n; i++) {
      const mode = MODE[i];
      if (mode === DEAD) continue;
      const s = S[i];
      if (s > front) continue;
      const st = Math.max(0, ST[i]);
      // Cross-fade over the ramp past a filtering gate: two draws, two tokens,
      // never an in-between hue.
      let u = 1;
      if (ST[i] >= 1) u = smooth((s - g.gates[ST[i]]) / RAMP);
      const age = AGE[i];
      dFlash = age < FT[i] ? 1 + FG[i] * (1 - age / FT[i]) : 1;
      dFade = 1;
      if (mode === DISCARD) {
        const past = T[i] - g.c - hAt(g, s);
        if (past > 0) dFade = Math.max(0, 1 - past / g.fade);
      } else if (mode === TRIB) {
        dFade = Math.max(0.1, 1 - Math.max(0, T[i] - g.c - hAt(g, s)) / 60);
      }
      dI = i;
      dMode = mode;
      dX1 = g.down ? T[i] : s;
      dY1 = g.down ? s : T[i];
      if (dStill) {
        dX0 = g.down ? T[i] : s - stillLen;
        dY0 = g.down ? s - stillLen : T[i];
      } else {
        dX0 = g.down ? PT[i] : PS[i];
        dY0 = g.down ? PS[i] : PT[i];
      }
      drawOne(st, u);
      if (u < 1) drawOne(st - 1, 1 - u);
    }
    t.globalAlpha = 1;
    for (let colour = 0; colour < 4; colour++) {
      for (let level = 0; level < LEVELS; level++) {
        const b = colour * LEVELS + level;
        const count = batchN[b];
        if (count === 0) continue;
        const arr = batch[b];
        t.strokeStyle = rgba(COL[colour], ((level + 0.5) / (LEVELS - 1)) * 0.72);
        t.beginPath();
        for (let j = 0; j < count; j++) {
          t.moveTo(arr[j * 4], arr[j * 4 + 1]);
          t.lineTo(arr[j * 4 + 2], arr[j * 4 + 3]);
        }
        t.stroke();
      }
    }
  }

  /** The visible picture: bed (masked during the reveal), gate glows, trail. */
  function compose(g: Geo): void {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, g.W, g.H);
    ctx.drawImage(bedCanvas!, 0, 0, g.W, g.H);
    if (revealing) {
      // The bed lights up only where the water has reached.
      const f = sim.front;
      const grad = g.down ? ctx.createLinearGradient(0, f - 80, 0, f) : ctx.createLinearGradient(f - 80, 0, f, 0);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, g.W, g.H);
    }
    ctx.globalCompositeOperation = 'lighter';
    for (let gate = 0; gate < 4; gate++) {
      const I = Math.min(GLOW.cap, glowE[gate]) * bed[`m${gate}`];
      if (I <= 0.004) continue;
      if (revealing && g.gates[gate] > sim.front) continue;
      const x = g.down ? g.c : g.gates[gate];
      const y = g.down ? g.gates[gate] : g.c;
      // Fitted to the tube: ≤ 40px along the flow, and across it no wider
      // than the segment the gate opens into (+10px of mist) — at the thread
      // the beat is the thread brightening, not a halo around it.
      const along = GLOW.r;
      const across = Math.min(GLOW.r, bed[`h${gate}`] + 10);
      ctx.globalAlpha = I;
      if (g.down) ctx.drawImage(glowSprites[gate], x - across, y - along, across * 2, along * 2);
      else ctx.drawImage(glowSprites[gate], x - along, y - across, along * 2, across * 2);
    }
    ctx.globalAlpha = 1;
    // The trail, clipped to the band: the hard guarantee that no light ever
    // reaches the text.
    const d = g.dpr;
    if (g.down) {
      const w = g.hi - g.lo;
      ctx.drawImage(trail!, g.lo * d, 0, w * d, g.H * d, g.lo, 0, w, g.H);
    } else {
      const h = g.hi - g.lo;
      ctx.drawImage(trail!, 0, g.lo * d, g.W * d, h * d, 0, g.lo, g.W, h);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function clearTrail(): void {
    if (!tctx || !geo) return;
    tctx.globalCompositeOperation = 'source-over';
    tctx.clearRect(0, 0, geo.W, geo.H);
    tctx.globalCompositeOperation = 'lighter';
  }

  /** One deterministic still of the population: reduced motion and ?snap. */
  function still(): void {
    const g = geo;
    if (!g || !tctx) return;
    seedSteady(g);
    clearTrail();
    tctx.globalCompositeOperation = 'lighter';
    drawParticles(g, 12);
    compose(g);
    painted = true;
  }

  /* ---- the frame ------------------------------------------------------- */

  let running = false;
  let stale = true; // re-seed before the next start (after a stop)
  let onScreen = true;
  let perfN = 0;
  let perfSum = 0;

  function frame(_time: number, deltaMs: number): void {
    const g = geo;
    if (!g || !tctx) return;
    const t0 = dev ? performance.now() : 0;
    const dt = Math.min(50, deltaMs) / 1000; // a stalled tab never tunnels through gates
    clock += dt;
    step(g, dt);
    if (revealing) {
      for (let gate = 0; gate < 4; gate++) {
        if (!crossedFront[gate] && sim.front >= g.gates[gate]) {
          crossedFront[gate] = true;
          hooks.onFront(gate);
        }
      }
    }
    // Trail decay, frame-rate independent.
    tctx.globalCompositeOperation = 'destination-out';
    tctx.fillStyle = `rgba(0,0,0,${1 - Math.pow(DECAY, deltaMs / 16.7)})`;
    tctx.fillRect(0, 0, g.W, g.H);
    tctx.globalCompositeOperation = 'lighter';
    drawParticles(g, 0);
    compose(g);
    if (dev) {
      perfSum += performance.now() - t0;
      if (++perfN === 300) console.info(`strom: ${(perfSum / perfN).toFixed(2)} ms/frame avg over 300 frames at ${g.W}×${g.H}`);
    }
  }

  function start(): void {
    if (running || motionOff || !geo || !hasData || !painted) return;
    if (document.hidden || !onScreen) return;
    if (stale && !revealing) {
      seedSteady(geo);
      clearTrail();
    }
    stale = false;
    running = true;
    gsap.ticker.add(frame);
  }

  function stop(): void {
    if (!running) return;
    running = false;
    stale = true;
    gsap.ticker.remove(frame);
  }

  /* ---- the reveal ------------------------------------------------------ */

  function endReveal(): void {
    if (!revealing) return;
    revealing = false;
    for (const t of tweens) t.kill();
    tweens.length = 0;
    sim.surge = 1;
    hooks.onDone(false);
  }

  function reveal(g: Geo): void {
    revealing = true;
    crossedFront.fill(false);
    leadFired = false;
    sim.front = g.sIn - 100;
    sim.surge = REVEAL.surgeFrom;
    seedSteady(g);
    clearTrail();
    tweens.push(
      gsap.to(sim, {
        front: g.sOut + 100,
        duration: REVEAL.front,
        ease: 'power2.out',
        onComplete: () => {
          // The surge may still be settling; the picture is complete.
          revealing = false;
          crossedFront.fill(true);
          hooks.onDone(true);
        },
      }),
      gsap.to(sim, { surge: 1, duration: REVEAL.surge, ease: 'expo.out' }),
    );
  }

  /* ---- data ---------------------------------------------------------------- */

  function firstPicture(g: Geo): void {
    Object.assign(bed, bedTargets(g));
    paintBed();
    if (motionOff) {
      still();
      hooks.onDone(false);
      return;
    }
    painted = true;
    if (document.hidden || !onScreen) {
      // No reveal for an unseen page: steady state, texts final.
      seedSteady(g);
      clearTrail();
      compose(g);
      hooks.onDone(false);
      stale = true;
      start();
      return;
    }
    stale = false;
    reveal(g);
    start();
  }

  function update(g: Geo, prev: number[]): void {
    // A poll that changed nothing changes nothing: no bed tween, no credit
    // reset, and under reduced motion no re-rolled still — the picture only
    // moves when a reading does.
    if (prev.every((v, i) => v === counts[i])) return;
    const targets = bedTargets(g);
    bedTween?.kill();
    if (motionOff) {
      Object.assign(bed, targets);
      paintBed();
      still();
      return;
    }
    bedTween = gsap.to(bed, { ...targets, duration: BED_MORPH, ease: 'expo.out', onUpdate: paintBed, onComplete: paintBed });
    for (let i = 0; i < 4; i++) if (prev[i] !== counts[i]) boostUntil[i] = clock + 3;
    for (let i = 0; i < 4; i++) {
      credit[i] = 0;
      tribCredit[i] = 0;
    }
    if (!running) {
      // Off-screen or hidden: the next start re-seeds at the new steady state.
      stale = true;
      if (onScreen && !document.hidden) start();
      else {
        seedSteady(g);
        clearTrail();
        compose(g);
      }
    }
  }

  function setData(next: number[]): void {
    const prev = counts;
    counts = [next[0] ?? 0, next[1] ?? 0, next[2] ?? 0, next[3] ?? 0];
    const first = !hasData;
    hasData = true;
    if (!geo) {
      geo = measure();
      if (!geo) return; // hidden: the ResizeObserver brings the first picture
      lastW = geo.W;
      rebuild(geo);
    }
    applyCounts(geo);
    if (first || !painted) firstPicture(geo);
    else update(geo, prev);
  }

  function clear(): void {
    stop();
    endReveal();
    bedTween?.kill();
    bedTween = null;
    hasData = false;
    painted = false;
    counts = [0, 0, 0, 0];
    clearPool();
    if (geo) {
      ctx.clearRect(0, 0, geo.W, geo.H);
      clearTrail();
    }
  }

  /* ---- lifecycle ------------------------------------------------------ */

  function resize(): void {
    const next = measure();
    if (!next) return;
    geo = next;
    lastW = next.W;
    rebuild(next);
    if (!hasData) return;
    if (revealing) endReveal();
    bedTween?.kill();
    bedTween = null;
    applyCounts(next);
    Object.assign(bed, bedTargets(next));
    paintBed();
    if (!painted || motionOff) {
      firstPicture(next);
      return;
    }
    // Same picture, new size: steady state, no catch-up burst.
    stop();
    stale = true;
    start();
    if (!running) {
      seedSteady(next);
      clearTrail();
      compose(next);
    }
  }

  let resizeTimer = 0;
  let lastW = 0;
  const ro = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      // Width changes only: a mobile URL bar fires resize with the width
      // unchanged, and a rebuild mid-scroll is a visible pop (FlowField).
      const w = Math.round(canvas.getBoundingClientRect().width);
      if (w === lastW) return;
      lastW = w;
      resize();
    }, 150);
  });
  ro.observe(stage);

  const io = new IntersectionObserver(
    (entries) => {
      onScreen = entries.some((e) => e.isIntersecting);
      if (onScreen) start();
      else stop();
    },
    { threshold: 0 },
  );
  io.observe(canvas);
  const onVis = () => {
    if (document.hidden) {
      stop();
      if (revealing) endReveal();
    } else start();
  };
  document.addEventListener('visibilitychange', onVis);

  return {
    setData,
    k: () => k,
    clear,
    destroy() {
      stop();
      clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      for (const t of tweens) t.kill();
      tweens.length = 0;
      bedTween?.kill();
      revealing = false;
    },
  };
}
