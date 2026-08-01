/*!
 * particle-field.js — scroll-morphing 3D triangle particle field
 * Zero dependencies. ~1 canvas, requestAnimationFrame, no build step.
 *
 *   <canvas id="pf"></canvas>
 *   <script src="particle-field.js"></script>
 *   <script>ParticleField.init({ canvas: '#pf' });</script>
 *
 * Docs: README.md
 *
 * ---------------------------------------------------------------------------
 * NEXBRIDGE PRODUCTION COPY — patched. The pristine upstream file is kept at
 * design/particle-field/particle-field.js for diffing. Two patches, both
 * marked `NEXBRIDGE PATCH` below, both closing gaps FlowField.astro already
 * handles:
 *   1. pause()/resume() — upstream runs its rAF loop unconditionally, even
 *      when the canvas is off-screen or the tab is hidden.
 *   2. debounced resize — upstream re-measures every anchor on every resize
 *      event; mobile URL-bar show/hide fires that mid-scroll.
 * ---------------------------------------------------------------------------
 */
(function (root) {
  'use strict';

  var PI = Math.PI;
  var TRI = [[1, 0], [-0.5, 0.866], [-0.5, -0.866]];

  /* ------------------------------------------------------------------ *
   * Outline primitives — author a shape as line + arc segments in unit
   * space (roughly -0.5..0.5). `fromOutline` turns them into a sampler
   * that distributes particles evenly along the total path length.
   * ------------------------------------------------------------------ */

  function L(x1, y1, x2, y2) { return ['L', x1, y1, x2, y2]; }
  function A(cx, cy, r, a0, a1) { return ['A', cx, cy, r, a0, a1]; }

  function poly(pts) {
    var out = [];
    for (var i = 0; i < pts.length - 1; i++) out.push(L(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]));
    return out;
  }
  function rect(x0, y0, x1, y1) {
    return poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]);
  }

  /** Depth function: mirrors the outline into two parallel planes (an extrusion). */
  function twin(d) {
    return function (q) { return (q.r[2] < 0.5 ? -d : d) + (q.r[3] - 0.5) * 0.014; };
  }

  /**
   * fromOutline(prims, scale, depthFn, jitter) -> sampler(q, W, H) -> [x, y, z]
   * Coordinates are world units centred on the origin; the renderer places them.
   */
  function fromOutline(prims, scale, depthFn, jitter) {
    var cum = [], total = 0;
    for (var i = 0; i < prims.length; i++) {
      var p = prims[i];
      total += p[0] === 'L' ? Math.hypot(p[3] - p[1], p[4] - p[2]) : Math.abs(p[5] - p[4]) * p[3];
      cum.push(total);
    }
    return function (q, W, H) {
      var m = Math.min(W, H) * scale;
      var tgt = q.r[0] * total, k = 0;
      while (k < cum.length - 1 && cum[k] < tgt) k++;
      var prev = k === 0 ? 0 : cum[k - 1];
      var sg = prims[k];
      var u = (tgt - prev) / Math.max(1e-6, cum[k] - prev);
      var x, y;
      if (sg[0] === 'L') { x = sg[1] + (sg[3] - sg[1]) * u; y = sg[2] + (sg[4] - sg[2]) * u; }
      else { var a = sg[4] + (sg[5] - sg[4]) * u; x = sg[1] + Math.cos(a) * sg[3]; y = sg[2] + Math.sin(a) * sg[3]; }
      var j = jitter == null ? 0.006 : jitter;
      x += (q.r[4] - 0.5) * j;
      y += (q.r[5] - 0.5) * j;
      return [x * m, y * m, (depthFn ? depthFn(q) : 0) * m];
    };
  }

  /* ------------------------------------------------------------------ *
   * Built-in shapes
   * ------------------------------------------------------------------ */

  var bridgePrims = (function () {
    var p = [];
    function cable(x0, x1, yTop, yLow, n) {
      var pts = [];
      for (var i = 0; i <= n; i++) {
        var u = i / n, x = x0 + (x1 - x0) * u;
        pts.push([x, yTop + (yLow - yTop) * (1 - Math.pow(2 * u - 1, 2))]);
      }
      return pts;
    }
    p.push(L(-0.46, 0.09, 0.46, 0.09), L(-0.46, 0.115, 0.46, 0.115));
    [-0.18, 0.18].forEach(function (tx) {
      p.push(L(tx, 0.115, tx, -0.27), L(tx - 0.02, 0.115, tx - 0.02, -0.27),
             L(tx - 0.02, -0.18, tx, -0.18), L(tx - 0.02, -0.05, tx, -0.05),
             L(tx - 0.01, 0.115, tx - 0.01, 0.30));
    });
    var mid = cable(-0.18, 0.18, -0.27, -0.02, 16);
    p = p.concat(poly(mid));
    mid.forEach(function (pt, i) { if (i % 2 === 0) p.push(L(pt[0], pt[1], pt[0], 0.09)); });
    p = p.concat(poly([[-0.46, 0.04], [-0.34, -0.10], [-0.18, -0.27]]),
                 poly([[0.46, 0.04], [0.34, -0.10], [0.18, -0.27]]));
    [-0.40, -0.30, 0.30, 0.40].forEach(function (x) { p.push(L(x, -0.02, x, 0.09)); });
    p.push(L(-0.46, 0.115, -0.46, 0.22), L(0.46, 0.115, 0.46, 0.22));
    return p;
  })();

  var stepsPrims = [].concat(
    rect(-0.40, 0.08, -0.16, 0.24),
    rect(-0.12, -0.06, 0.12, 0.24),
    rect(0.16, -0.24, 0.40, 0.24),
    [L(-0.46, 0.255, 0.46, 0.255)],
    poly([[-0.28, 0.02], [0.00, -0.12], [0.28, -0.30]]),
    poly([[0.20, -0.30], [0.28, -0.30], [0.28, -0.22]])
  );

  var gearPrims = (function () {
    var p = [A(0, 0, 0.30, 0, PI * 2), A(0, 0, 0.13, 0, PI * 2), A(0, 0, 0.05, 0, PI * 2)];
    var n = 12;
    for (var i = 0; i < n; i++) {
      var a0 = (i / n) * PI * 2 - 0.10, a1 = (i / n) * PI * 2 + 0.10;
      p = p.concat(poly([
        [Math.cos(a0) * 0.30, Math.sin(a0) * 0.30],
        [Math.cos(a0) * 0.375, Math.sin(a0) * 0.375],
        [Math.cos(a1) * 0.375, Math.sin(a1) * 0.375],
        [Math.cos(a1) * 0.30, Math.sin(a1) * 0.30]
      ]));
      var a = (i / n) * PI * 2;
      if (i % 2 === 0) p.push(L(Math.cos(a) * 0.05, Math.sin(a) * 0.05, Math.cos(a) * 0.13, Math.sin(a) * 0.13));
    }
    return p;
  })();

  var chartPrims = (function () {
    var p = [L(-0.42, 0.26, 0.42, 0.26), L(-0.42, -0.28, -0.42, 0.26)];
    var ys = [0.18, 0.20, 0.12, 0.14, 0.04, 0.06, -0.06, -0.12, -0.10, -0.22], line = [];
    ys.forEach(function (y, i) { line.push([-0.40 + (i / (ys.length - 1)) * 0.80, y]); });
    p = p.concat(poly(line));
    line.forEach(function (pt, i) {
      if (i % 2 === 0) p = p.concat(rect(pt[0] - 0.028, 0.26 - (0.26 - pt[1]) * 0.42, pt[0] + 0.028, 0.26));
    });
    [-0.14, 0.00, 0.14].forEach(function (y) {
      for (var k = 0; k < 7; k++) p.push(L(-0.40 + k * 0.12, y, -0.34 + k * 0.12, y));
    });
    return p;
  })();

  /* volumetric shapes (defined directly in 3D) */

  var network = (function () {
    var hubs = [[-0.27, -0.17, 0.21], [0.27, -0.17, -0.21], [-0.27, 0.17, -0.21], [0.27, 0.17, 0.21]];
    var edges = [];
    for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) edges.push([hubs[i], hubs[j]]);
    return function (q, W, H) {
      var m = Math.min(W, H) * 0.80;
      if (q.r[0] < 0.55) {
        var h = hubs[Math.floor(q.r[1] * 4) % 4];
        var a = q.r[2] * PI * 2, b = Math.acos(2 * q.r[3] - 1), rr = 0.08 * (0.7 + q.r[4] * 0.3);
        return [(h[0] + Math.sin(b) * Math.cos(a) * rr) * m,
                (h[1] + Math.sin(b) * Math.sin(a) * rr) * m,
                (h[2] + Math.cos(b) * rr) * m];
      }
      var e = edges[Math.floor(q.r[1] * edges.length) % edges.length], u = q.r[2];
      return [(e[0][0] + (e[1][0] - e[0][0]) * u) * m,
              (e[0][1] + (e[1][1] - e[0][1]) * u) * m,
              (e[0][2] + (e[1][2] - e[0][2]) * u) * m];
    };
  })();

  function pair(q, W, H) {
    var m = Math.min(W, H) * 0.68, a = q.r[1] * PI * 2;
    if (q.r[0] < 0.52) {
      var side = q.r[2] < 0.5 ? -0.19 : 0.19;
      var b = Math.acos(2 * q.r[3] - 1), rr = 0.13 * (0.76 + q.r[4] * 0.24);
      return [(side + Math.sin(b) * Math.cos(a) * rr) * m, Math.sin(b) * Math.sin(a) * rr * m, Math.cos(b) * rr * m];
    }
    var R = 0.33 + (q.r[4] - 0.5) * 0.02, dir = q.r[2] < 0.5 ? 1 : -1;
    return [Math.cos(a) * R * m, Math.sin(a) * R * 0.60 * m, dir * Math.sin(a) * R * 0.52 * m];
  }

  function dial(q, W, H) {
    var m = Math.min(W, H) * 0.72, a = q.r[1] * PI * 2;
    if (q.r[2] < 0.07) { var rr = 0.07 * q.r[3]; return [Math.cos(a) * rr * m, Math.sin(a) * rr * m, 0]; }
    var which = Math.floor(q.r[0] * 3) % 3;
    var R = (0.30 + (q.r[4] - 0.5) * 0.014) * (which === 2 ? 0.76 : 1);
    var c = Math.cos(a) * R * m, s = Math.sin(a) * R * m;
    if (which === 0) return [c, s, 0];
    if (which === 1) return [c, 0, s];
    return [0, c, s];
  }

  function scatter(q, W, H) {
    return [(q.r[0] - 0.5) * 1.15 * W, (q.r[1] - 0.5) * 1.15 * H, (q.r[2] - 0.5) * Math.min(W, H) * 0.95];
  }

  function sphere(q, W, H) {
    var m = Math.min(W, H) * 0.34;
    var a = q.r[0] * PI * 2, b = Math.acos(2 * q.r[1] - 1), r = Math.pow(q.r[2], 0.28);
    return [Math.sin(b) * Math.cos(a) * r * m, Math.sin(b) * Math.sin(a) * r * m, Math.cos(b) * r * m];
  }

  function cube(q, W, H) {
    var m = Math.min(W, H) * 0.30;
    var f = Math.floor(q.r[0] * 6), u = (q.r[1] - 0.5) * 2, v = (q.r[2] - 0.5) * 2;
    var c = [[u, v, 1], [u, v, -1], [u, 1, v], [u, -1, v], [1, u, v], [-1, u, v]][f % 6];
    return [c[0] * m, c[1] * m, c[2] * m];
  }

  function torus(q, W, H) {
    var m = Math.min(W, H) * 0.30;
    var a = q.r[0] * PI * 2, b = q.r[1] * PI * 2, tube = 0.30;
    return [(1 + tube * Math.cos(b)) * Math.cos(a) * m, (1 + tube * Math.cos(b)) * Math.sin(a) * m, tube * Math.sin(b) * m];
  }

  function helix(q, W, H) {
    var m = Math.min(W, H) * 0.30;
    var strand = q.r[0] < 0.5 ? 0 : PI, u = q.r[1];
    var a = u * PI * 4 + strand;
    return [Math.cos(a) * m * 0.55, (u - 0.5) * m * 1.7, Math.sin(a) * m * 0.55];
  }

  var shapes = {
    bridge: fromOutline(bridgePrims, 0.80, twin(0.09)),
    steps: fromOutline(stepsPrims, 0.66, twin(0.08)),
    gear: fromOutline(gearPrims, 0.62, twin(0.055)),
    chart: fromOutline(chartPrims, 0.70, twin(0.05)),
    network: network,
    pair: pair,
    dial: dial,
    scatter: scatter,
    sphere: sphere,
    cube: cube,
    torus: torus,
    helix: helix
  };

  /* ------------------------------------------------------------------ *
   * Engine
   * ------------------------------------------------------------------ */

  var DEFAULTS = {
    canvas: null,                       // element or selector (required)
    sectionSelector: '[data-pf-stage]', // scroll anchors, in document order
    stages: [                           // one per anchor: shape + screen position
      { shape: 'bridge',  x: 0.70, intensity: 1.00 },
      { shape: 'scatter', x: 0.50, intensity: 0.45 },
      { shape: 'network', x: 0.30, intensity: 0.60 },
      { shape: 'gear',    x: 0.70, intensity: 0.55 },
      { shape: 'dial',    x: 0.50, intensity: 0.85 }
    ],
    /* NEXBRIDGE PATCH 3: upstream's demo palette is teal #29D9A8 + amber
       #FFB829 and glow:true — a banned gradient pair and banned halos. The
       preset always overrides both, but dead banned hex must not ship in the
       bundle, and the library should fail safe if anyone calls init() raw.
       Values are the @theme tokens; signal stays rationed at 1 in 16. */
    colors: [
      '#F7F5F0', '#8B959E', '#8B959E', '#5B6770',
      '#F7F5F0', '#8B959E', '#5B6770', '#8B959E',
      '#FF4D00', '#8B959E', '#5B6770', '#F7F5F0',
      '#8B959E', '#5B6770', '#8B959E', '#F7F5F0'
    ],
    count: 1500,       // particles drawn (max 2400)
    style: 'triangle', // 'triangle' | 'filled' | 'dot'
    size: 1,           // particle size multiplier
    opacity: 1,        // overall field opacity multiplier
    glow: false,       // NEXBRIDGE PATCH 3: no halos (DESIGN.md anti-pattern)
    spinSpeed: 1,      // camera orbit + particle tumble speed (0 = frozen)
    morphEase: 0.06,   // 0.02 slow / 0.15 snappy shape transition
    pointerParallax: 1,
    respectReducedMotion: true
  };

  var MAX = 2400;

  function ParticleFieldInstance(opts) {
    var o = {};
    for (var k in DEFAULTS) o[k] = DEFAULTS[k];
    for (var k2 in opts) o[k2] = opts[k2];
    this.o = o;

    var cv = typeof o.canvas === 'string' ? document.querySelector(o.canvas) : o.canvas;
    if (!cv) throw new Error('[ParticleField] canvas not found: ' + o.canvas);
    this.cv = cv;
    this.ctx = cv.getContext('2d');

    this.reduced = o.respectReducedMotion &&
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.pos = 0; this.target = 0;
    this.mx = 0; this.my = 0; this.mxE = 0; this.myE = 0;
    this.W = 0; this.H = 0;
    this.centers = [];
    this.progress = 0;
    this.paused = false; /* NEXBRIDGE PATCH 1 */

    this._buildParticles();
    this._resolveStages();
    this._bind();
    this.resize();
    this.onScroll();
    this._loop = this._loop.bind(this);
    this.raf = requestAnimationFrame(this._loop);
  }

  ParticleFieldInstance.prototype._buildParticles = function () {
    var P = this.o.colors, parts = [];
    function rnd(i, s) { var x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); }
    for (var i = 0; i < MAX; i++) {
      parts.push({
        r: [rnd(i, 1), rnd(i, 2), rnd(i, 3), rnd(i, 4), rnd(i, 5), rnd(i, 6)],
        depth: 0.22 + rnd(i, 7) * 0.78,
        color: P[Math.floor(rnd(i, 8) * P.length)],
        rot: rnd(i, 9) * PI * 2,
        rot2: rnd(i, 12) * PI * 2,
        spin: (rnd(i, 10) - 0.5) * 0.85,
        spin2: (rnd(i, 13) - 0.5) * 0.65
      });
    }
    this.parts = parts;
  };

  ParticleFieldInstance.prototype._resolveStages = function () {
    this.stages = this.o.stages.map(function (s) {
      var fn = typeof s.shape === 'function' ? s.shape : shapes[s.shape];
      if (!fn) throw new Error('[ParticleField] unknown shape: ' + s.shape);
      return { f: fn, x: s.x == null ? 0.5 : s.x, k: s.intensity == null ? 1 : s.intensity, name: s.name || s.shape };
    });
    if (this.stages.length < 2) this.stages.push(this.stages[0]);
  };

  /** Swap the stage list at runtime (e.g. different shapes per page). */
  ParticleFieldInstance.prototype.setStages = function (stages) {
    this.o.stages = stages;
    this._resolveStages();
    this.measure();
    this.onScroll();
  };

  ParticleFieldInstance.prototype.set = function (patch) {
    for (var k in patch) this.o[k] = patch[k];
    if (patch.colors) this._buildParticles();
    if (patch.stages) this.setStages(patch.stages);
  };

  ParticleFieldInstance.prototype.measure = function () {
    var els = document.querySelectorAll(this.o.sectionSelector);
    this.centers = Array.prototype.map.call(els, function (el) {
      var r = el.getBoundingClientRect();
      return r.top + window.scrollY + r.height / 2;
    });
  };

  ParticleFieldInstance.prototype.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = this.cv.clientWidth; this.H = this.cv.clientHeight;
    this.cv.width = Math.round(this.W * dpr);
    this.cv.height = Math.round(this.H * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.measure();
  };

  ParticleFieldInstance.prototype.onScroll = function () {
    var n = this.stages.length;
    if (!this.centers.length) this.measure();
    var c = this.centers, t = 0;
    if (c.length > 1) {
      var vc = window.scrollY + window.innerHeight / 2;
      if (vc <= c[0]) t = 0;
      else if (vc >= c[c.length - 1]) t = c.length - 1;
      else {
        for (var i = 0; i < c.length - 1; i++) {
          if (vc >= c[i] && vc <= c[i + 1]) { t = i + (vc - c[i]) / (c[i + 1] - c[i]); break; }
        }
      }
    } else {
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      t = (window.scrollY / max) * (n - 1);
    }
    this.target = Math.max(0, Math.min(n - 1, t));
    var mx = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    this.progress = Math.min(1, Math.max(0, window.scrollY / mx));
    if (this.o.onProgress) {
      var idx = Math.round(this.target);
      this.o.onProgress(this.progress, this.stages[idx] ? this.stages[idx].name : '', this.target);
    }
  };

  /* NEXBRIDGE PATCH 1: stop the loop when the field is off-screen or the tab
     is hidden. Never gates whether the field exists, only whether it moves. */
  ParticleFieldInstance.prototype.pause = function () {
    if (this.paused) return;
    this.paused = true;
    cancelAnimationFrame(this.raf);
  };

  ParticleFieldInstance.prototype.resume = function () {
    if (!this.paused) return;
    this.paused = false;
    this.raf = requestAnimationFrame(this._loop);
  };

  ParticleFieldInstance.prototype._bind = function () {
    var self = this;
    /* NEXBRIDGE PATCH 2: debounce resize — resize() re-measures every anchor
       via getBoundingClientRect, and mobile URL-bar chrome fires this while
       the user is mid-scroll. 150ms matches FlowField.astro. */
    this._resizeTimer = 0;
    this._onResize = function () {
      clearTimeout(self._resizeTimer);
      self._resizeTimer = setTimeout(function () { self.resize(); }, 150);
    };
    this._onScrollEv = function () { self.onScroll(); };
    this._onMove = function (e) {
      self.mx = e.clientX / window.innerWidth - 0.5;
      self.my = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('resize', this._onResize);
    window.addEventListener('scroll', this._onScrollEv, { passive: true });
    window.addEventListener('mousemove', this._onMove, { passive: true });
  };

  ParticleFieldInstance.prototype._loop = function (ts) {
    var o = this.o, ctx = this.ctx, W = this.W, H = this.H;
    var t = this.reduced ? 0 : ts / 1000;
    var spd = this.reduced ? 0 : o.spinSpeed;

    this.pos += (this.target - this.pos) * o.morphEase;
    this.mxE += (this.mx - this.mxE) * 0.05;
    this.myE += (this.my - this.myE) * 0.05;

    var n = this.stages.length;
    var si = Math.max(0, Math.min(n - 2, Math.floor(this.pos)));
    var raw = Math.min(1, Math.max(0, this.pos - si));
    var st = raw * raw * (3 - 2 * raw);
    var A2 = this.stages[si], B2 = this.stages[si + 1];
    var intensity = (A2.k + (B2.k - A2.k) * st) * o.opacity;

    var yaw = t * 0.26 * spd + this.pos * 0.35 + this.mxE * 0.55 * o.pointerParallax;
    var pitch = 0.15 * Math.sin(t * 0.19 * spd) + 0.06 + this.myE * 0.4 * o.pointerParallax;
    var cyw = Math.cos(yaw), syw = Math.sin(yaw), cpt = Math.cos(pitch), spt = Math.sin(pitch);

    var FOV = Math.min(W, H) * 1.3;
    var ox = W * (A2.x + (B2.x - A2.x) * st), oy = H * 0.5;
    var live = Math.max(50, Math.min(MAX, Math.round(o.count)));
    var isDot = o.style === 'dot', isFill = o.style === 'filled';

    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;

    for (var i = 0; i < live; i++) {
      var q = this.parts[i];
      var a = A2.f(q, W, H), b = B2.f(q, W, H);
      var drift = 2.5 + q.depth * 4;
      var wx = a[0] + (b[0] - a[0]) * st + Math.sin(t * 0.24 + q.r[0] * 12) * drift;
      var wy = a[1] + (b[1] - a[1]) * st + Math.cos(t * 0.21 + q.r[1] * 12) * drift;
      var wz = (a[2] || 0) + ((b[2] || 0) - (a[2] || 0)) * st + Math.sin(t * 0.19 + q.r[2] * 12) * drift;

      var x1 = wx * cyw + wz * syw, z1 = wz * cyw - wx * syw;
      var y1 = wy * cpt - z1 * spt, z2 = wy * spt + z1 * cpt;
      var per = FOV / Math.max(FOV * 0.3, FOV + z2);
      var sx = ox + x1 * per, sy = oy + y1 * per;
      if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) continue;

      var s0 = (1.5 + q.depth * 3.4) * o.size;
      var near = Math.max(0, Math.min(1, (per - 0.62) / 0.85));
      ctx.globalAlpha = Math.min(1, (0.10 + q.depth * 0.34 + near * 0.46) * intensity);
      ctx.strokeStyle = q.color;
      ctx.fillStyle = q.color;
      var hot = o.glow && near > 0.66;
      ctx.shadowBlur = hot ? 9 : 0;
      if (hot) ctx.shadowColor = q.color;

      if (isDot) {
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.4, s0 * per * 0.36), 0, PI * 2);
        ctx.fill();
      } else {
        // real facet: own tumble on two axes, camera transform, projected per vertex
        var pa = q.rot + t * q.spin * spd, pb = q.rot2 + t * q.spin2 * spd;
        var cpa = Math.cos(pa), spa = Math.sin(pa), cpb = Math.cos(pb), spb = Math.sin(pb);
        ctx.beginPath();
        for (var k = 0; k < 3; k++) {
          var vx = TRI[k][0] * s0, vy = TRI[k][1] * s0;
          var ty = vy * cpb, tz = vy * spb;
          var tx2 = vx * cpa + tz * spa, tz2 = tz * cpa - vx * spa;
          var ex = tx2 * cyw + tz2 * syw, ez = tz2 * cyw - tx2 * syw;
          var ey = ty * cpt - ez * spt, ez2 = ty * spt + ez * cpt;
          var vp = FOV / Math.max(FOV * 0.3, FOV + z2 + ez2);
          var fx = ox + (x1 + ex) * vp, fy = oy + (y1 + ey) * vp;
          if (k === 0) ctx.moveTo(fx, fy); else ctx.lineTo(fx, fy);
        }
        ctx.closePath();
        if (isFill) ctx.fill(); else ctx.stroke();
      }
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    this.raf = requestAnimationFrame(this._loop);
  };

  ParticleFieldInstance.prototype.destroy = function () {
    cancelAnimationFrame(this.raf);
    clearTimeout(this._resizeTimer); /* NEXBRIDGE PATCH 2 */
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('scroll', this._onScrollEv);
    window.removeEventListener('mousemove', this._onMove);
    this.ctx.clearRect(0, 0, this.W, this.H);
  };

  /* ------------------------------------------------------------------ *
   * Optional: fade sections in as they enter the viewport
   * ------------------------------------------------------------------ */
  function reveal(selector, opt) {
    opt = opt || {};
    var dist = opt.distance || 22, dur = opt.duration || 800;
    var els = document.querySelectorAll(selector || '[data-pf-reveal]');
    if (!('IntersectionObserver' in window)) return null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var el = e.target;
        el.style.transition = 'opacity ' + dur + 'ms cubic-bezier(.16,1,.3,1), transform ' + dur + 'ms cubic-bezier(.16,1,.3,1)';
        el.style.opacity = e.isIntersecting ? '1' : '0';
        el.style.transform = e.isIntersecting ? 'translateY(0)' : 'translateY(' + dist + 'px)';
      });
    }, { threshold: opt.threshold == null ? 0.12 : opt.threshold });
    Array.prototype.forEach.call(els, function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(' + dist + 'px)';
      io.observe(el);
    });
    return io;
  }

  var ParticleField = {
    init: function (opts) { return new ParticleFieldInstance(opts); },
    shapes: shapes,
    reveal: reveal,
    // shape-authoring helpers
    fromOutline: fromOutline,
    line: L, arc: A, poly: poly, rect: rect, twin: twin
  };

  root.ParticleField = ParticleField;
  if (typeof module !== 'undefined' && module.exports) module.exports = ParticleField;
})(typeof window !== 'undefined' ? window : this);
