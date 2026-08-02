/*!
 * nexbridge-preset.js — NexBridge-IT brand configuration for particle-field.js
 *
 * The upstream library ships a teal/amber demo palette with bloom enabled.
 * Both are hard bans in DESIGN.md. This file is the brand-legal wrapper:
 * corrected palette, rationed signal, glow off, plus custom shapes authored
 * in the drawing-office grammar the brand world actually uses.
 *
 * Load AFTER particle-field.js. Exposes window.NexBridgeField.
 */
(function (root) {
  'use strict';

  var P = root.ParticleField;
  if (!P) throw new Error('[nexbridge-preset] load particle-field.js first');

  var TAU = Math.PI * 2;

  /* ------------------------------------------------------------------ *
   * Palette — tokens from website/src/styles/global.css @theme.
   *
   * The library samples this array uniformly, one entry per particle, so
   * the array IS the mix ratio. Signal appears once in sixteen (6.25%),
   * matching FlowField.astro's 6% ration and honouring the DESIGN.md rule
   * that signal is the scarcest thing on the page. Do not add a second
   * signal entry "for balance" — that is exactly the failure mode.
   * ------------------------------------------------------------------ */
  /* Resolved from the @theme tokens so editing a token actually moves the
     field. The literals are only a fallback for contexts without the
     stylesheet — the standalone demo in this folder. */
  function token(name, fallback) {
    try {
      var v = getComputedStyle(root.document.documentElement).getPropertyValue(name);
      return (v || '').trim() || fallback;
    } catch (e) {
      return fallback;
    }
  }

  var PAPER = token('--color-paper', '#F7F5F0');
  var STEEL = token('--color-steel', '#8B959E');
  var DEEP = token('--color-steel-deep', '#5B6770');
  var SIGNAL = token('--color-signal', '#FF4D00');

  var GROUND = token('--color-graphite', '#14171A');

  /* Intermediate tints, mixed from the tokens themselves — a wider tonal range
     without importing a hue the design system does not own. A @theme edit
     still moves every one of them. */
  function rgbOf(h) {
    h = String(h).trim().replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, k) {
    var x = rgbOf(a), y = rgbOf(b);
    function c(i) { return Math.round(x[i] + (y[i] - x[i]) * k); }
    return 'rgb(' + c(0) + ',' + c(1) + ',' + c(2) + ')';
  }
  var T1 = mix(PAPER, STEEL, 0.5);
  var T2 = mix(STEEL, DEEP, 0.5);
  var T3 = mix(DEEP, GROUND, 0.35);

  /* 18 entries, one of them signal — 5.6% by count. Verify by AREA once the
     mark count changes; filled faces read heavier than strokes. */
  var PALETTE = [
    PAPER, T1, STEEL, T2, DEEP, T3,
    PAPER, T1, STEEL, T2, DEEP,
    SIGNAL, // the only one
    T1, STEEL, T2, DEEP, T1, STEEL
  ];

  /* ------------------------------------------------------------------ *
   * Custom shapes — authored as line/arc outlines in unit space and
   * extruded with twin(), which is the same grammar as a technical
   * drawing: no blobs, no spheres, everything measured.
   * ------------------------------------------------------------------ */

  /* Signal-flow schematic in the P&ID tradition: three process blocks,
     directed connectors with arrowheads, instrument tag bubbles, and a
     feedback return path. This is the brand's "working schematic". */
  var schematicPrims = [].concat(
    P.rect(-0.44, -0.09, -0.24, 0.09),
    P.rect(-0.10, -0.09, 0.10, 0.09),
    P.rect(0.24, -0.09, 0.44, 0.09),
    [P.line(-0.24, 0, -0.10, 0), P.line(0.10, 0, 0.24, 0)],
    P.poly([[-0.145, -0.028], [-0.10, 0], [-0.145, 0.028]]),
    P.poly([[0.195, -0.028], [0.24, 0], [0.195, 0.028]]),
    // feedback return: right block back round to the left block
    P.poly([[0.34, 0.09], [0.34, 0.26], [-0.34, 0.26], [-0.34, 0.09]]),
    P.poly([[-0.368, 0.148], [-0.34, 0.09], [-0.312, 0.148]]),
    // instrument tag bubbles, stemmed to each block
    [P.arc(-0.34, -0.205, 0.055, 0, TAU)],
    [P.arc(0.00, -0.205, 0.055, 0, TAU)],
    [P.arc(0.34, -0.205, 0.055, 0, TAU)],
    [P.line(-0.34, -0.15, -0.34, -0.09),
     P.line(0.00, -0.15, 0.00, -0.09),
     P.line(0.34, -0.15, 0.34, -0.09)]
  );

  /* Zeichnungskopf (DIN 823 title block): the recurring brand device —
     a bordered mini-table, never a "card". */
  var titleBlockPrims = [].concat(
    P.rect(-0.46, -0.15, 0.46, 0.15),
    [P.line(-0.46, -0.05, 0.46, -0.05), P.line(-0.46, 0.05, 0.46, 0.05)],
    [P.line(-0.16, -0.15, -0.16, 0.15), P.line(0.14, -0.15, 0.14, 0.15)],
    // drawing-frame corner ticks, the annotated margin in miniature
    [P.line(-0.50, -0.19, -0.42, -0.19), P.line(-0.50, -0.19, -0.50, -0.11),
     P.line(0.50, -0.19, 0.42, -0.19), P.line(0.50, -0.19, 0.50, -0.11),
     P.line(-0.50, 0.19, -0.42, 0.19), P.line(-0.50, 0.19, -0.50, 0.11),
     P.line(0.50, 0.19, 0.42, 0.19), P.line(0.50, 0.19, 0.50, 0.11)]
  );

  /* Dimensioned part: an outline carrying real dimension lines with
     arrow terminators and extension lines — "drawn, measured, labeled". */
  var dimensionedPrims = [].concat(
    P.poly([[-0.30, 0.12], [-0.30, -0.12], [0.06, -0.12], [0.30, 0.02], [0.30, 0.12], [-0.30, 0.12]]),
    [P.arc(-0.16, 0.00, 0.06, 0, TAU)],
    [P.arc(0.14, 0.06, 0.04, 0, TAU)],
    // dimension line below, with extension lines and arrow terminators
    [P.line(-0.30, 0.20, 0.30, 0.20),
     P.line(-0.30, 0.14, -0.30, 0.24),
     P.line(0.30, 0.14, 0.30, 0.24)],
    P.poly([[-0.26, 0.176], [-0.30, 0.20], [-0.26, 0.224]]),
    P.poly([[0.26, 0.176], [0.30, 0.20], [0.26, 0.224]]),
    // vertical dimension on the left
    [P.line(-0.38, -0.12, -0.38, 0.12),
     P.line(-0.42, -0.12, -0.34, -0.12),
     P.line(-0.42, 0.12, -0.34, 0.12)]
  );

  /* Ist-Zustand: parts that never connect. Deliberately bounded — the stock
     `scatter` disperses across the whole viewport, which reads as dust and
     lands on the caption. Separate assemblies with gaps between them read as
     "verteilt auf Köpfe, Dateien und Systeme" and morph cleanly into a span. */
  var fragmentPrims = [].concat(
    P.rect(-0.44, -0.28, -0.26, -0.14),
    P.rect(-0.12, -0.32, 0.04, -0.20),
    P.rect(0.20, -0.26, 0.42, -0.10),
    P.rect(-0.40, 0.00, -0.22, 0.15),
    P.rect(-0.08, 0.04, 0.10, 0.22),
    P.rect(0.24, 0.06, 0.42, 0.21),
    P.rect(-0.18, -0.08, -0.02, 0.00),
    [P.arc(0.15, -0.08, 0.052, 0, TAU)],
    [P.arc(-0.32, 0.26, 0.045, 0, TAU)],
    [P.arc(0.33, -0.01, 0.038, 0, TAU)]
  );

  /* ------------------------------------------------------------------ *
   * The AI stack, drawn in the drawing office — D-030.
   *
   * The temptation with "make it look like AI" is the glowing brain and the
   * floating node cloud. Both are the category rut, and both are banned here.
   * These are the same subjects rendered the way an engineer would draw them:
   * a die in plan view, a network as a Schaltbild on a dimension line, a
   * pipeline in the P&ID duct. Unmistakably a tech company, still this one.
   * ------------------------------------------------------------------ */

  /* Silizium-Die im Gehäuse, plan view. The three nested rectangles are over
     half the path length, so the silhouette dominates and the pins stay pins
     instead of eating the particle budget. */
  var diePrims = (function () {
    var p = [].concat(
      P.rect(-0.300, -0.225, 0.300, 0.225),   // package body
      P.rect(-0.175, -0.125, 0.175, 0.125),   // die cavity
      P.rect(-0.070, -0.050, 0.070, 0.050)    // core block
    );
    p.push(P.arc(-0.300, 0, 0.038, -Math.PI / 2, Math.PI / 2));   // pin-1 notch
    p.push(P.line(-0.175, -0.088, 0.175, -0.088));                // internal bus
    p.push(P.line(-0.175, 0.088, 0.175, 0.088));
    p.push(P.line(-0.175, -0.020, -0.070, -0.020));
    p.push(P.line(0.070, -0.020, 0.175, -0.020));
    p.push(P.line(-0.175, 0.020, -0.070, 0.020));
    p.push(P.line(0.070, 0.020, 0.175, 0.020));
    p = p.concat(                                                  // bond routing
      P.poly([[-0.175, -0.105], [-0.240, -0.105], [-0.240, -0.165]]),
      P.poly([[-0.175, 0.105], [-0.240, 0.105], [-0.240, 0.165]]),
      P.poly([[0.175, -0.105], [0.240, -0.105], [0.240, -0.165]]),
      P.poly([[0.175, 0.105], [0.240, 0.105], [0.240, 0.165]])
    );
    for (var k = 0; k < 8; k++) {                                  // pin rows
      var y = -0.175 + k * 0.050;
      p.push(P.line(-0.300, y, -0.368, y));
      p.push(P.line(0.300, y, 0.368, y));
    }
    return p;
  })();

  /* Neuronales Netz als Schaltbild. Edges are pruned to near neighbours: a
     fully connected 4-5-5-3 is a grey mesh at particle resolution, not a
     diagram. The dimension line with per-layer ticks along the bottom is what
     keeps this an engineering drawing rather than a sci-fi brain — do not
     drop it. */
  var netPrims = (function () {
    /* Deliberately sparse. A 4-5-5-3 net with 30 edges renders as a grey mesh
       at particle resolution — the layers vanish. Fewer, bigger nodes with
       wider gaps keep the columnar structure legible, which is the only thing
       that makes this read as a network rather than a cloud. */
    var LX = [-0.38, -0.13, 0.13, 0.38], LN = [3, 4, 4, 2];
    var GAP = 0.160, NR = 0.052, YOFF = -0.030;
    var nodes = [], p = [], l, i, j;
    for (l = 0; l < 4; l++) {
      var col = [], n = LN[l], y0 = -((n - 1) / 2) * GAP + YOFF;
      for (i = 0; i < n; i++) col.push([LX[l], y0 + i * GAP]);
      nodes.push(col);
    }
    for (l = 0; l < 3; l++) {
      for (i = 0; i < nodes[l].length; i++) {
        for (j = 0; j < nodes[l + 1].length; j++) {
          var a0 = nodes[l][i], b0 = nodes[l + 1][j];
          if (Math.abs(a0[1] - b0[1]) > GAP * 1.15) continue;
          var dx = b0[0] - a0[0], dy = b0[1] - a0[1], len = Math.sqrt(dx * dx + dy * dy);
          var ux = dx / len, uy = dy / len;
          // trimmed to the node radius so edges do not smear into the circles
          p.push(P.line(a0[0] + ux * NR, a0[1] + uy * NR, b0[0] - ux * NR, b0[1] - uy * NR));
        }
      }
    }
    for (l = 0; l < 4; l++) {
      for (i = 0; i < nodes[l].length; i++) p.push(P.arc(nodes[l][i][0], nodes[l][i][1], NR, 0, TAU));
    }
    for (i = 0; i < LN[0]; i++) p.push(P.line(-0.460, nodes[0][i][1], -0.360 - NR, nodes[0][i][1]));
    for (i = 0; i < LN[3]; i++) p.push(P.line(0.360 + NR, nodes[3][i][1], 0.460, nodes[3][i][1]));
    p.push(P.line(-0.360, 0.265, 0.360, 0.265));                   // layer axis
    for (l = 0; l < 4; l++) p.push(P.line(LX[l], 0.235, LX[l], 0.295));
    return p;
  })();

  /* Datenstrecke im P&ID-Duktus: Quelle, Puffer, Transformation, Senke —
     gerichtet, mit Paketen auf der Strecke, Prüfzweig und einem Rückführpfad,
     der den Instrumentenkreis trägt. Das Monitoring, gezeichnet. */
  var pipelinePrims = (function () {
    var SX = [-0.375, -0.125, 0.125, 0.375], HW = 0.075, HH = 0.078;
    var p = [], i;
    for (i = 0; i < 4; i++) p = p.concat(P.rect(SX[i] - HW, -HH, SX[i] + HW, HH));
    p.push(P.line(-0.165, -HH, -0.165, HH));                       // queue dividers
    p.push(P.line(-0.125, -HH, -0.125, HH));
    p.push(P.line(-0.085, -HH, -0.085, HH));
    p = p.concat(P.poly([[0.050, HH], [0.200, -HH]]));             // transform diagonal
    p.push(P.line(0.300, -0.040, 0.450, -0.040));                  // store rule
    for (i = 0; i < 3; i++) {
      var x0 = SX[i] + HW, x1 = SX[i + 1] - HW, xm = (x0 + x1) / 2;
      p.push(P.line(x0, 0, x1, 0));
      p = p.concat(P.poly([[x1 - 0.032, -0.024], [x1, 0], [x1 - 0.032, 0.024]]));
      p = p.concat(P.rect(xm - 0.016, -0.016, xm + 0.016, 0.016));  // packet in flight
    }
    p.push(P.line(-0.480, 0.000, -0.450, 0.000));                  // inlet terminator
    p.push(P.line(-0.480, -0.030, -0.480, 0.030));
    p.push(P.line(0.450, 0.000, 0.480, 0.000));                    // outlet terminator
    p.push(P.line(0.480, -0.030, 0.480, 0.030));
    p = p.concat(P.poly([[0.375, -HH], [0.375, -0.250], [-0.375, -0.250], [-0.375, -HH]]));
    p = p.concat(P.poly([[-0.403, -0.192], [-0.375, -HH], [-0.347, -0.192]]));
    p.push(P.arc(0, -0.322, 0.052, 0, TAU));                       // instrument tag
    p.push(P.line(0.000, -0.270, 0.000, -0.250));
    p.push(P.line(-0.026, -0.322, 0.026, -0.322));
    p.push(P.line(0.000, -0.348, 0.000, -0.296));
    p = p.concat(P.rect(0.050, 0.205, 0.200, 0.310));              // check branch
    p.push(P.line(0.125, HH, 0.125, 0.205));
    p = p.concat(P.poly([[0.097, 0.147], [0.125, 0.205], [0.153, 0.147]]));
    p = p.concat(P.poly([[0.200, 0.2575], [0.290, 0.2575], [0.290, 0.000]]));
    p = p.concat(P.poly([[0.266, 0.030], [0.290, 0.000], [0.314, 0.030]]));
    return p;
  })();

  /* ------------------------------------------------------------------ *
   * The brain — D-034, founder-directed.
   *
   * A brain is a "3D blob" under DESIGN.md's anti-patterns and is the most
   * reused image in AI marketing. What keeps this one ours is that it is
   * FILLED rather than outlined (so it has real mass, which is the whole
   * point) and that its sulci are carved as grooves in the particle body
   * instead of painted on — plus a dimension line under it, so the sheet
   * still reads as a drawing rather than a poster.
   * ------------------------------------------------------------------ */
  var brainPrims = (function () {
    // cortex, closed profile facing left
    var cortex = P.poly([
      [-0.42, -0.02], [-0.41, -0.12], [-0.36, -0.21], [-0.28, -0.28],
      [-0.19, -0.32], [-0.09, -0.34], [0.02, -0.34], [0.13, -0.31],
      [0.23, -0.26], [0.31, -0.18], [0.36, -0.08], [0.37, 0.02],
      [0.34, 0.11], [0.28, 0.17], [0.20, 0.20], [0.12, 0.20],
      [0.04, 0.22], [-0.05, 0.24], [-0.14, 0.24], [-0.23, 0.21],
      [-0.31, 0.16], [-0.38, 0.09], [-0.42, 0.03], [-0.42, -0.02]
    ]);
    var cerebellum = P.poly([
      [0.18, 0.14], [0.28, 0.14], [0.35, 0.19], [0.37, 0.27],
      [0.33, 0.34], [0.24, 0.37], [0.15, 0.35], [0.10, 0.29],
      [0.11, 0.20], [0.18, 0.14]
    ]);
    var stem = P.poly([
      [0.06, 0.24], [0.12, 0.26], [0.14, 0.38], [0.10, 0.44],
      [0.04, 0.43], [0.03, 0.31], [0.06, 0.24]
    ]);
    // dimension line as thin filled bars, so the fill sampler can see it
    /* No dimension line here, deliberately. It was tried: at this scale it
       lands inside the canvas mask's bottom fade and scatters as debris across
       the caption. The DIN frame and the `01 / 03` scale already carry the
       drawing-sheet framing for this state. */
    return [].concat(cortex, cerebellum, stem);
  })();

  /* Carved out of the fill, not drawn on top: a groove reads as a gap in the
     particle body, which is how a brain actually shows its folds. */
  var brainSulci = [].concat(
    P.poly([[-0.30, -0.16], [-0.18, -0.12], [-0.08, -0.18], [0.02, -0.13]]),
    P.poly([[-0.24, -0.02], [-0.10, 0.02], [0.02, -0.04], [0.14, 0.01]]),
    P.poly([[-0.14, -0.26], [-0.04, -0.22], [0.06, -0.26], [0.16, -0.20]]),
    P.poly([[0.10, -0.10], [0.20, -0.06], [0.28, -0.12]]),
    P.poly([[-0.34, 0.06], [-0.22, 0.10], [-0.10, 0.06]]),
    P.poly([[0.04, 0.09], [0.13, 0.12], [0.21, 0.08]])
  );

  var SHAPES = {
    /* The one filled shape. `nonzero` so the cerebellum and stem union with
       the cortex instead of XOR-ing holes into it. */
    brain: P.fromFill(brainPrims, 0.84, {
      rule: 'nonzero',
      thickness: 0.115,
      carve: brainSulci,
      // wide enough that the groove survives both the raster and the jitter —
      // at 0.016 the particle mass simply closed over it
      carveWidth: 0.032,
      jitter: 0.003,
      res: 260
    }),
    /* Jitter drops from the 0.006 default to 0.004 for the AI-stack shapes:
       what was invisible under a 1px stroke becomes a fuzzy three-particle
       band under solid pyramids. */
    die: P.fromOutline(diePrims, 0.92, P.twin(0.050), 0.002),
    neuralnet: P.fromOutline(netPrims, 0.88, P.twin(0.055), 0.002),
    pipeline: P.fromOutline(pipelinePrims, 0.90, P.twin(0.050), 0.002),
    schematic: P.fromOutline(schematicPrims, 0.86, P.twin(0.055)),
    titleblock: P.fromOutline(titleBlockPrims, 0.92, P.twin(0.05)),
    dimensioned: P.fromOutline(dimensionedPrims, 0.78, P.twin(0.06)),
    // Looser jitter: these edges are meant to look unfinished, not machined.
    fragments: P.fromOutline(fragmentPrims, 0.90, P.twin(0.07), 0.022)
  };

  /* ------------------------------------------------------------------ *
   * Brand-legal defaults.
   *   glow:false  — DESIGN.md bans halos; offset+blur shadows only.
   *   style:'triangle' — outline facets read as drawn, not rendered.
   *   Never use the sphere / torus / helix built-ins: "3D blobs" is a
   *   named anti-pattern.
   * ------------------------------------------------------------------ */
  var BASE = {
    colors: PALETTE,
    ground: token('--color-graphite', '#14171A'), // what shading mixes toward
    style: 'solid',
    glow: false,
    spinSpeed: 0.55,
    morphEase: 0.05,
    /* Marks get SMALLER as count goes up. Each particle is solid 3D matter,
       but the aggregate has to stay a drawn diagram — a 5px pyramid on a 1px
       path turns a hairline into a caterpillar. */
    size: 0.62,
    sizeVar: 0.55,
    maxDpr: 1.5,
    pointerParallax: 0.6,
    respectReducedMotion: true
  };

  /* The homepage narrative from index.astro's DIRECTION CONTRACT:
     generic chaos → converged through NexBridge-IT → one clean schematic. */
  var STORY_STAGES = [
    { shape: 'scatter', x: 0.62, intensity: 0.55, name: 'Chaos' },
    { shape: 'bridge', x: 0.66, intensity: 0.95, name: 'Brücke' },
    { shape: SHAPES.schematic, x: 0.58, intensity: 0.80, name: 'Schema' }
  ];

  function init(opts) {
    opts = opts || {};
    var cfg = {};
    for (var k in BASE) cfg[k] = BASE[k];
    for (var k2 in opts) cfg[k2] = opts[k2];

    // Honour the site-wide ?snap convention alongside prefers-reduced-motion.
    var snap = root.location && new URLSearchParams(root.location.search).has('snap');
    if (snap) cfg.spinSpeed = 0;

    // Mobile budget: the library's own guidance is ~700 under 768px.
    if (cfg.count == null) cfg.count = root.innerWidth < 768 ? 3000 : 9000;

    return P.init(cfg);
  }

  root.NexBridgeField = {
    init: init,
    palette: PALETTE,
    shapes: SHAPES,
    storyStages: STORY_STAGES,
    base: BASE
  };
})(typeof window !== 'undefined' ? window : this);
