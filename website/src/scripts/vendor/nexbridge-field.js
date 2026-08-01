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

  var PALETTE = [
    PAPER, STEEL, STEEL, DEEP,
    PAPER, STEEL, DEEP, STEEL,
    SIGNAL, // the only one
    STEEL, DEEP, PAPER,
    STEEL, DEEP, STEEL, PAPER
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

  var SHAPES = {
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
    style: 'triangle',
    glow: false,
    spinSpeed: 0.55,
    morphEase: 0.05,
    size: 0.92,
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
    if (cfg.count == null) cfg.count = root.innerWidth < 768 ? 640 : 1200;

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
