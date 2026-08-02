/*!
 * particle-field.js — scroll-morphing 3D particle field
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
 * design/particle-field/particle-field.js for diffing. Patches are marked
 * `NEXBRIDGE PATCH` below:
 *   1. pause()/resume() — upstream runs its rAF loop unconditionally, even
 *      when the canvas is off-screen or the tab is hidden.
 *   2. debounced resize — upstream re-measures every anchor on every resize
 *      event; mobile URL-bar show/hide fires that mid-scroll.
 *   3. brand-safe defaults — upstream ships a teal/amber demo palette and
 *      glow:true, both banned. Dead banned hex must not reach the bundle.
 *   4. allocation-free sampling — samplers take an optional out-param and
 *      fromOutline caches its path resolution, which is a pure function of
 *      the particle's fixed randoms. Upstream allocated two arrays per
 *      particle per frame and rescanned every path segment per particle.
 *   5. depth sort + the 'solid' style — a painter's-algorithm counting sort
 *      and a shaded tetrahedron mark, so the field reads as one solid object
 *      instead of a transparent cloud.
 * ---------------------------------------------------------------------------
 */
(function (root) {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;
  var TRI = [[1, 0], [-0.5, 0.866], [-0.5, -0.866]];
  var MAX = 16000;

  /* Regular tetrahedron on alternating cube corners, circumradius 1 so it is
     the same visual weight as TRI and `size` keeps its meaning. Winding is
     outward-CCW; all four face normals were checked against their centroids. */
  var K = 0.5773502691896258; // 1/sqrt(3)
  var TET = [K, K, K, K, -K, -K, -K, K, -K, -K, -K, K];
  var TET_F = [0, 1, 2, 0, 2, 3, 0, 3, 1, 1, 3, 2];
  var TET_NLEN = 2.309401076758503; // |e1 x e2|, identical for all four faces

  /* Light fixed in EYE space, not world space. Yaw is driven by scroll, so a
     world-fixed lamp would swing whole faces bright<->dark as the reader
     scrolls — exactly the legibility failure this effect was rebuilt to avoid.
     Up and to the left, slightly in front of the sheet. */
  var LX = -0.42, LY = -0.58, LZ = -0.70;

  var SHADES = 16;
  /* Floor and the two ramp terms below are set so a mid-facing face at mid
     depth lands around 80% of the token colour. Tuned against the render: a
     physically "correct" Lambert falloff on a dark ground puts most faces so
     close to the ground colour that the drawing disappears. */
  var SHADE_FLOOR = 0.18;
  var LIT_BASE = 0.62, LIT_RANGE = 0.38;      // ambient .. full lambert
  var AERIAL_BASE = 0.78, AERIAL_RANGE = 0.22; // far .. near

  var TMP = [0, 0, 0];

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
   * fromOutline(prims, scale, depthFn, jitter) -> sampler(q, W, H, out) -> [x,y,z]
   *
   * NEXBRIDGE PATCH 4. Two changes from upstream, both invisible to callers:
   *   - optional `out` param, written in place and returned (see `sample`);
   *   - the path walk is cached. Which segment a particle lands on, and where
   *     along it, is a pure function of q.r[] and never changes; only the
   *     screen scale does. Upstream rescanned ~50 segments per particle per
   *     frame and recomputed the arc trig with it.
   */
  function fromOutline(prims, scale, depthFn, jitter) {
    var cum = [], total = 0;
    for (var i = 0; i < prims.length; i++) {
      var p = prims[i];
      total += p[0] === 'L' ? Math.hypot(p[3] - p[1], p[4] - p[2]) : Math.abs(p[5] - p[4]) * p[3];
      cum.push(total);
    }
    var j = jitter == null ? 0.006 : jitter;
    var cache = null, seen = null;

    function resolve(q, out) {
      var tgt = q.r[0] * total, k = 0;
      while (k < cum.length - 1 && cum[k] < tgt) k++;
      var prev = k === 0 ? 0 : cum[k - 1];
      var sg = prims[k];
      var u = (tgt - prev) / Math.max(1e-6, cum[k] - prev);
      var x, y;
      if (sg[0] === 'L') { x = sg[1] + (sg[3] - sg[1]) * u; y = sg[2] + (sg[4] - sg[2]) * u; }
      else { var a = sg[4] + (sg[5] - sg[4]) * u; x = sg[1] + Math.cos(a) * sg[3]; y = sg[2] + Math.sin(a) * sg[3]; }
      out[0] = x + (q.r[4] - 0.5) * j;
      out[1] = y + (q.r[5] - 0.5) * j;
      out[2] = depthFn ? depthFn(q) : 0;
    }

    var fn = function (q, W, H, out) {
      out = out || [0, 0, 0];
      var m = Math.min(W, H) * scale;
      var i = q.i;
      if (i == null) { // synthetic particle, no stable index — resolve directly
        resolve(q, out);
        out[0] *= m; out[1] *= m; out[2] *= m;
        return out;
      }
      if (!cache) { cache = new Float32Array(MAX * 3); seen = new Uint8Array(MAX); }
      var b = i * 3;
      if (!seen[i]) {
        resolve(q, TMP);
        cache[b] = TMP[0]; cache[b + 1] = TMP[1]; cache[b + 2] = TMP[2];
        seen[i] = 1;
      }
      out[0] = cache[b] * m; out[1] = cache[b + 1] * m; out[2] = cache[b + 2] * m;
      return out;
    };
    // Exposed so the lab can stroke the ideal outline under the particles.
    fn.prims = prims;
    fn.scale = scale;
    return fn;
  }

  /**
   * fromFill(prims, scale, opts) -> sampler(q, W, H, out)
   *
   * `fromOutline` distributes along path LENGTH, so a shape is always a
   * wireframe — adding particles only thickens the lines, it never gives the
   * form mass. This fills the interior instead: rasterise the outline once,
   * keep every covered pixel, and let each particle claim one.
   *
   * opts.thickness  half-depth of the lens profile (unit space, default 0.10)
   * opts.carve      prims stroked out of the fill, so a groove reads as a gap
   *                 in the particle mass — how the brain gets its sulci
   * opts.carveWidth stroke width for those, in unit space
   * opts.res        raster resolution on the long side (default 240)
   */
  function fromFill(prims, scale, opts) {
    opts = opts || {};
    var thick = opts.thickness == null ? 0.10 : opts.thickness;
    var jit = opts.jitter == null ? 0.004 : opts.jitter;
    var RES = opts.res || 240;
    var fallback = fromOutline(prims, scale, twin(thick), jit);

    var built = false, pts = null, nPts = 0;
    var rw = 0, sc = 1, minX = 0, minY = 0, ccx = 0, ccy = 0, maxR = 1;
    var cache = null, seen = null;

    function bounds() {
      var a = 1e9, b = 1e9, c = -1e9, d = -1e9, i, s;
      for (i = 0; i < prims.length; i++) {
        s = prims[i];
        if (s[0] === 'L') {
          a = Math.min(a, s[1], s[3]); c = Math.max(c, s[1], s[3]);
          b = Math.min(b, s[2], s[4]); d = Math.max(d, s[2], s[4]);
        } else {
          a = Math.min(a, s[1] - s[3]); c = Math.max(c, s[1] + s[3]);
          b = Math.min(b, s[2] - s[3]); d = Math.max(d, s[2] + s[3]);
        }
      }
      return [a, b, c, d];
    }

    /* Segments arrive as a flat list, so start a new subpath whenever one does
       not continue from the previous endpoint. Without this every shape is one
       tangled path and evenodd fills the wrong regions. */
    function trace(g, list, k) {
      var lx = NaN, ly = NaN, i, s;
      for (i = 0; i < list.length; i++) {
        s = list[i];
        if (s[0] === 'L') {
          if (Math.abs(s[1] - lx) > 1e-6 || Math.abs(s[2] - ly) > 1e-6) g.moveTo(k(s[1], 0), k(s[2], 1));
          g.lineTo(k(s[3], 0), k(s[4], 1));
          lx = s[3]; ly = s[4];
        } else {
          g.moveTo(k(s[1] + s[3], 0), k(s[2], 1));
          g.arc(k(s[1], 0), k(s[2], 1), s[3] * sc, s[4], s[5]);
          lx = NaN; ly = NaN;
        }
      }
    }

    function build() {
      built = true;
      if (typeof document === 'undefined') return; // Node harness: no canvas
      var bb = bounds();
      minX = bb[0]; minY = bb[1];
      var w = bb[2] - bb[0], h = bb[3] - bb[1];
      var span = Math.max(w, h) || 1;
      sc = RES / span;
      rw = Math.max(8, Math.ceil(w * sc));
      var rh = Math.max(8, Math.ceil(h * sc));
      var cv = document.createElement('canvas');
      cv.width = rw; cv.height = rh;
      var g = cv.getContext('2d');
      var map = function (v, axis) { return axis ? (v - minY) * sc : (v - minX) * sc; };

      g.fillStyle = '#fff';
      g.beginPath();
      trace(g, prims, map);
      // evenodd by default so nested outlines (a die cavity) stay holes;
      // nonzero when overlapping lobes should union instead (the brain).
      g.fill(opts.rule || 'evenodd');

      if (opts.carve && opts.carve.length) {
        g.globalCompositeOperation = 'destination-out';
        g.strokeStyle = '#fff';
        g.lineWidth = Math.max(1.5, (opts.carveWidth || 0.012) * sc);
        g.lineCap = 'round';
        g.beginPath();
        trace(g, opts.carve, map);
        g.stroke();
        g.globalCompositeOperation = 'source-over';
      }

      var d = g.getImageData(0, 0, rw, rh).data;
      var list = [], n = rw * rh, i;
      for (i = 0; i < n; i++) if (d[i * 4 + 3] > 128) list.push(i);
      nPts = list.length;
      if (!nPts) return;
      pts = Int32Array.from(list);

      // centroid and radius, for the lens depth profile
      var sx = 0, sy = 0;
      for (i = 0; i < nPts; i++) { sx += pts[i] % rw; sy += (pts[i] / rw) | 0; }
      ccx = sx / nPts; ccy = sy / nPts;
      var m = 0;
      for (i = 0; i < nPts; i++) {
        var dx = (pts[i] % rw) - ccx, dy = ((pts[i] / rw) | 0) - ccy;
        var r2 = dx * dx + dy * dy;
        if (r2 > m) m = r2;
      }
      maxR = Math.sqrt(m) || 1;
    }

    function resolve(q, out) {
      var idx = pts[Math.min(nPts - 1, (q.r[0] * nPts) | 0)];
      var gx = idx % rw, gy = (idx / rw) | 0;
      var dx = gx - ccx, dy = gy - ccy;
      var r = Math.sqrt(dx * dx + dy * dy) / maxR;
      if (r > 1) r = 1;
      // lens, not slab: the form reads round instead of like two flat sheets
      var half = thick * Math.sqrt(1 - r * r);
      out[0] = minX + (gx + 0.5) / sc + (q.r[4] - 0.5) * jit;
      out[1] = minY + (gy + 0.5) / sc + (q.r[5] - 0.5) * jit;
      out[2] = (q.r[2] < 0.5 ? -1 : 1) * half * (0.35 + 0.65 * q.r[3]);
    }

    var fn = function (q, W, H, out) {
      out = out || [0, 0, 0];
      if (!built) build();
      if (!nPts) return fallback(q, W, H, out);
      var m = Math.min(W, H) * scale;
      var i = q.i;
      if (i == null) { resolve(q, out); out[0] *= m; out[1] *= m; out[2] *= m; return out; }
      if (!cache) { cache = new Float32Array(MAX * 3); seen = new Uint8Array(MAX); }
      var b = i * 3;
      if (!seen[i]) {
        resolve(q, TMP);
        cache[b] = TMP[0]; cache[b + 1] = TMP[1]; cache[b + 2] = TMP[2];
        seen[i] = 1;
      }
      out[0] = cache[b] * m; out[1] = cache[b + 1] * m; out[2] = cache[b + 2] * m;
      return out;
    };
    fn.prims = prims;
    fn.scale = scale;
    return fn;
  }

  /**
   * Bridges old and new sampler contracts. A converted sampler writes `out`
   * and returns it (one reference compare, free); a legacy one that still
   * returns a fresh array is copied across. Both keep working, which matters
   * because user shapes and the standalone demo rely on the return form.
   */
  function sample(fn, q, W, H, out) {
    var r = fn(q, W, H, out);
    if (r !== out) { out[0] = r[0]; out[1] = r[1]; out[2] = r[2] || 0; }
    return out;
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
    var p = [A(0, 0, 0.30, 0, TAU), A(0, 0, 0.13, 0, TAU), A(0, 0, 0.05, 0, TAU)];
    var n = 12;
    for (var i = 0; i < n; i++) {
      var a0 = (i / n) * TAU - 0.10, a1 = (i / n) * TAU + 0.10;
      p = p.concat(poly([
        [Math.cos(a0) * 0.30, Math.sin(a0) * 0.30],
        [Math.cos(a0) * 0.375, Math.sin(a0) * 0.375],
        [Math.cos(a1) * 0.375, Math.sin(a1) * 0.375],
        [Math.cos(a1) * 0.30, Math.sin(a1) * 0.30]
      ]));
      var a = (i / n) * TAU;
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

  /* volumetric shapes (defined directly in 3D) — all out-param, no allocation */

  var network = (function () {
    var hubs = [[-0.27, -0.17, 0.21], [0.27, -0.17, -0.21], [-0.27, 0.17, -0.21], [0.27, 0.17, 0.21]];
    var edges = [];
    for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) edges.push([hubs[i], hubs[j]]);
    return function (q, W, H, out) {
      out = out || [0, 0, 0];
      var m = Math.min(W, H) * 0.80;
      if (q.r[0] < 0.55) {
        var h = hubs[Math.floor(q.r[1] * 4) % 4];
        var a = q.r[2] * TAU, b = Math.acos(2 * q.r[3] - 1), rr = 0.08 * (0.7 + q.r[4] * 0.3);
        out[0] = (h[0] + Math.sin(b) * Math.cos(a) * rr) * m;
        out[1] = (h[1] + Math.sin(b) * Math.sin(a) * rr) * m;
        out[2] = (h[2] + Math.cos(b) * rr) * m;
        return out;
      }
      var e = edges[Math.floor(q.r[1] * edges.length) % edges.length], u = q.r[2];
      out[0] = (e[0][0] + (e[1][0] - e[0][0]) * u) * m;
      out[1] = (e[0][1] + (e[1][1] - e[0][1]) * u) * m;
      out[2] = (e[0][2] + (e[1][2] - e[0][2]) * u) * m;
      return out;
    };
  })();

  function pair(q, W, H, out) {
    out = out || [0, 0, 0];
    var m = Math.min(W, H) * 0.68, a = q.r[1] * TAU;
    if (q.r[0] < 0.52) {
      var side = q.r[2] < 0.5 ? -0.19 : 0.19;
      var b = Math.acos(2 * q.r[3] - 1), rr = 0.13 * (0.76 + q.r[4] * 0.24);
      out[0] = (side + Math.sin(b) * Math.cos(a) * rr) * m;
      out[1] = Math.sin(b) * Math.sin(a) * rr * m;
      out[2] = Math.cos(b) * rr * m;
      return out;
    }
    var R = 0.33 + (q.r[4] - 0.5) * 0.02, dir = q.r[2] < 0.5 ? 1 : -1;
    out[0] = Math.cos(a) * R * m;
    out[1] = Math.sin(a) * R * 0.60 * m;
    out[2] = dir * Math.sin(a) * R * 0.52 * m;
    return out;
  }

  function dial(q, W, H, out) {
    out = out || [0, 0, 0];
    var m = Math.min(W, H) * 0.72, a = q.r[1] * TAU;
    if (q.r[2] < 0.07) {
      var rr = 0.07 * q.r[3];
      out[0] = Math.cos(a) * rr * m; out[1] = Math.sin(a) * rr * m; out[2] = 0;
      return out;
    }
    var which = Math.floor(q.r[0] * 3) % 3;
    var R = (0.30 + (q.r[4] - 0.5) * 0.014) * (which === 2 ? 0.76 : 1);
    var c = Math.cos(a) * R * m, s = Math.sin(a) * R * m;
    if (which === 0) { out[0] = c; out[1] = s; out[2] = 0; }
    else if (which === 1) { out[0] = c; out[1] = 0; out[2] = s; }
    else { out[0] = 0; out[1] = c; out[2] = s; }
    return out;
  }

  function scatter(q, W, H, out) {
    out = out || [0, 0, 0];
    out[0] = (q.r[0] - 0.5) * 1.15 * W;
    out[1] = (q.r[1] - 0.5) * 1.15 * H;
    out[2] = (q.r[2] - 0.5) * Math.min(W, H) * 0.95;
    return out;
  }

  function sphere(q, W, H, out) {
    out = out || [0, 0, 0];
    var m = Math.min(W, H) * 0.34;
    var a = q.r[0] * TAU, b = Math.acos(2 * q.r[1] - 1), r = Math.pow(q.r[2], 0.28);
    out[0] = Math.sin(b) * Math.cos(a) * r * m;
    out[1] = Math.sin(b) * Math.sin(a) * r * m;
    out[2] = Math.cos(b) * r * m;
    return out;
  }

  function cube(q, W, H, out) {
    out = out || [0, 0, 0];
    var m = Math.min(W, H) * 0.30;
    var f = Math.floor(q.r[0] * 6) % 6, u = (q.r[1] - 0.5) * 2, v = (q.r[2] - 0.5) * 2;
    // switch, not an array-of-arrays literal: upstream allocated 7 arrays per call
    switch (f) {
      case 0: out[0] = u; out[1] = v; out[2] = 1; break;
      case 1: out[0] = u; out[1] = v; out[2] = -1; break;
      case 2: out[0] = u; out[1] = 1; out[2] = v; break;
      case 3: out[0] = u; out[1] = -1; out[2] = v; break;
      case 4: out[0] = 1; out[1] = u; out[2] = v; break;
      default: out[0] = -1; out[1] = u; out[2] = v;
    }
    out[0] *= m; out[1] *= m; out[2] *= m;
    return out;
  }

  function torus(q, W, H, out) {
    out = out || [0, 0, 0];
    var m = Math.min(W, H) * 0.30;
    var a = q.r[0] * TAU, b = q.r[1] * TAU, tube = 0.30;
    out[0] = (1 + tube * Math.cos(b)) * Math.cos(a) * m;
    out[1] = (1 + tube * Math.cos(b)) * Math.sin(a) * m;
    out[2] = tube * Math.sin(b) * m;
    return out;
  }

  function helix(q, W, H, out) {
    out = out || [0, 0, 0];
    var m = Math.min(W, H) * 0.30;
    var strand = q.r[0] < 0.5 ? 0 : PI, u = q.r[1];
    var a = u * PI * 4 + strand;
    out[0] = Math.cos(a) * m * 0.55;
    out[1] = (u - 0.5) * m * 1.7;
    out[2] = Math.sin(a) * m * 0.55;
    return out;
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
   * Shade ramps — NEXBRIDGE PATCH 5
   *
   * Flat shading needs one fill colour per (colour, brightness) pair. Build
   * them once: each entry is a linear mix between exactly one palette token
   * and the GROUND colour, so no ramp can introduce a hue that is not already
   * in the design system, and every face is a flat fill — not a gradient.
   * The strings are identity-stable, so the canvas colour parser caches them.
   * ------------------------------------------------------------------ */

  function hexToRgb(h) {
    h = String(h).trim().replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n) || h.length !== 6) return null;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function buildRamp(color, ground) {
    var c = hexToRgb(color), g = hexToRgb(ground), out = [], i;
    if (!c || !g) { // non-hex colour: no shading rather than a wrong colour
      for (i = 0; i < SHADES; i++) out.push(color);
      return out;
    }
    for (i = 0; i < SHADES; i++) {
      var k = SHADE_FLOOR + (1 - SHADE_FLOOR) * (i / (SHADES - 1));
      out.push('rgb(' + Math.round(g[0] + (c[0] - g[0]) * k) + ','
                      + Math.round(g[1] + (c[1] - g[1]) * k) + ','
                      + Math.round(g[2] + (c[2] - g[2]) * k) + ')');
    }
    return out;
  }

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
    ground: '#14171A',   // what shading mixes toward; set from --color-graphite
    count: 1500,         // particles drawn (max 4000)
    style: 'triangle',   // 'solid' | 'triangle' | 'filled' | 'dot'
    size: 1,             // particle size multiplier
    sizeVar: 0.55,       // spread of mark sizes; a few large marks carry the texture
    hollow: false,       // stroke the tetra faces instead of filling them
    opacity: 1,          // overall field opacity multiplier
    glow: false,         // NEXBRIDGE PATCH 3: no halos (DESIGN.md anti-pattern)
    spinSpeed: 1,        // camera orbit + particle tumble speed (0 = frozen)
    morphEase: 0.06,     // 0.02 slow / 0.15 snappy shape transition
    pointerParallax: 1,
    respectReducedMotion: true,
    maxDpr: 2,           // canvas backing-store cap; 1.5 halves the fill cost
    depthSort: true,     // painter's algorithm — required for 'solid' to read
    backfaceCull: true,  // diagnostics may switch this off
    lodPx: 2.0,          // below this projected size, one flat facet will do
    ghost: false         // stroke the ideal outline under the field (lab only)
  };

  var BUCKETS = 512;

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

    /* Scratch, allocated once. The loop must not allocate. */
    this.sa = [0, 0, 0];
    this.sb = [0, 0, 0];
    this.px = new Float32Array(MAX);
    this.py = new Float32Array(MAX);
    this.pz = new Float32Array(MAX);
    this.pper = new Float32Array(MAX);
    this.psx = new Float32Array(MAX);
    this.psy = new Float32Array(MAX);
    this.pbk = new Int32Array(MAX);
    this.vis = new Int32Array(MAX);
    this.order = new Int32Array(MAX);
    this.counts = new Int32Array(BUCKETS);
    this.start = new Int32Array(BUCKETS);
    this.vex = new Float64Array(4);
    this.vey = new Float64Array(4);
    this.vez = new Float64Array(4);
    this.vsx = new Float64Array(4);
    this.vsy = new Float64Array(4);

    this.parts = [];
    this._ramps = {};

    this._resolveStages();
    this._bind();
    this.resize();
    this.onScroll();
    this._loop = this._loop.bind(this);
    this.raf = requestAnimationFrame(this._loop);
  }

  function rnd(i, s) { var x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); }

  ParticleFieldInstance.prototype._ramp = function (color) {
    var key = color + '|' + this.o.ground;
    var r = this._ramps[key];
    if (!r) { r = this._ramps[key] = buildRamp(color, this.o.ground); }
    return r;
  };

  /**
   * Build particles lazily and grow on demand. `rnd(i, s)` is a pure function
   * of the index, so appending produces exactly the particles a full build
   * would have — identity, palette distribution and the fromOutline caches all
   * stay valid. Building all of MAX up front was a long task in the load
   * window for a field that lives below the fold.
   */
  ParticleFieldInstance.prototype._ensure = function (n) {
    var parts = this.parts;
    if (parts.length >= n) return;
    var P = this.o.colors;
    for (var i = parts.length; i < n; i++) {
      var color = P[Math.floor(rnd(i, 8) * P.length)];
      var rot = rnd(i, 9) * TAU, rot2 = rnd(i, 12) * TAU;
      var p0 = rnd(i, 1) * 12, p1 = rnd(i, 2) * 12, p2 = rnd(i, 3) * 12;
      parts.push({
        i: i,
        r: [rnd(i, 1), rnd(i, 2), rnd(i, 3), rnd(i, 4), rnd(i, 5), rnd(i, 6)],
        depth: 0.22 + rnd(i, 7) * 0.78,
        color: color,
        ramp: this._ramp(color),
        rot: rot,
        rot2: rot2,
        spin: (rnd(i, 10) - 0.5) * 0.85,
        spin2: (rnd(i, 13) - 0.5) * 0.65,
        svRaw: rnd(i, 14), // drives the size spread; skewed in the loop
        /* Tumble at spinSpeed 0 is constant — production's case. */
        crot: Math.cos(rot), srot: Math.sin(rot),
        crot2: Math.cos(rot2), srot2: Math.sin(rot2),
        /* Drift phases, so sin(t*w + p) expands to per-frame scalars times
           these constants instead of three trig calls per particle per frame. */
        cp0: Math.cos(p0), sp0: Math.sin(p0),
        cp1: Math.cos(p1), sp1: Math.sin(p1),
        cp2: Math.cos(p2), sp2: Math.sin(p2)
      });
    }
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
    // Colours and ground both invalidate every particle's ramp; rebuilding
    // lazily keeps the deterministic identity.
    if (patch.colors || patch.ground) { this._ramps = {}; this.parts = []; }
    if (patch.stages) this.setStages(patch.stages);
    if (patch.maxDpr) this.resize();
  };

  ParticleFieldInstance.prototype.measure = function () {
    var els = document.querySelectorAll(this.o.sectionSelector);
    this.centers = Array.prototype.map.call(els, function (el) {
      var r = el.getBoundingClientRect();
      return r.top + window.scrollY + r.height / 2;
    });
  };

  ParticleFieldInstance.prototype.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, this.o.maxDpr);
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

  /** Lab diagnostic: stroke the ideal outline so you can see whether particle
      mass is wandering off the drawn path. 2D only — it ignores camera yaw. */
  ParticleFieldInstance.prototype._drawGhost = function (fn, ox, oy) {
    var prims = fn && fn.prims;
    if (!prims) return;
    var ctx = this.ctx, m = Math.min(this.W, this.H) * fn.scale;
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#FF4D00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var i = 0; i < prims.length; i++) {
      var s = prims[i];
      if (s[0] === 'L') { ctx.moveTo(ox + s[1] * m, oy + s[2] * m); ctx.lineTo(ox + s[3] * m, oy + s[4] * m); }
      else { ctx.moveTo(ox + (s[1] + s[3]) * m, oy + s[2] * m); ctx.arc(ox + s[1] * m, oy + s[2] * m, s[3] * m, s[4], s[5]); }
    }
    ctx.stroke();
    ctx.restore();
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
    var FOVMIN = FOV * 0.3;
    var ox = W * (A2.x + (B2.x - A2.x) * st), oy = H * 0.5;
    var live = Math.max(50, Math.min(MAX, Math.round(o.count) || 50));
    this._ensure(live);

    var style = o.style;
    var isDot = style === 'dot', isFill = style === 'filled', isSolid = style === 'solid';
    var size = o.size, glowOn = o.glow, lodPx = o.lodPx, cullOn = o.backfaceCull;
    var sizeVar = o.sizeVar, hollow = o.hollow;
    var parts = this.parts, sa = this.sa, sb = this.sb;
    var px = this.px, py = this.py, pz = this.pz, pper = this.pper;
    var psx = this.psx, psy = this.psy, pbk = this.pbk, vis = this.vis, order = this.order;
    var counts = this.counts, start = this.start;
    var vex = this.vex, vey = this.vey, vez = this.vez, vsx = this.vsx, vsy = this.vsy;

    /* Drift by the angle-sum identity: the time terms are per-frame scalars,
       the phase terms are per-particle constants baked in at build time. Same
       arithmetic result, three fewer trig calls per particle per frame. */
    var sA = Math.sin(t * 0.24), cA = Math.cos(t * 0.24);
    var sB = Math.sin(t * 0.21), cB = Math.cos(t * 0.21);
    var sC = Math.sin(t * 0.19), cC = Math.cos(t * 0.19);

    // Only sample the second shape when the morph is actually between stages.
    var onlyA = st < 1e-4, onlyB = st > 1 - 1e-4;

    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    if (!glowOn) ctx.shadowBlur = 0;
    if (o.ghost) this._drawGhost(onlyB ? B2.f : A2.f, ox, oy);

    /* ---- pass A: sample, transform, project, cull, bucket ---------------- */
    var i, k, nVis = 0;
    var invSpan = 1 / (FOV * 1.6);
    if (o.depthSort) for (i = 0; i < BUCKETS; i++) counts[i] = 0;

    for (i = 0; i < live; i++) {
      var q = parts[i];
      var ax, ay, az;
      if (onlyB) { sample(B2.f, q, W, H, sb); ax = sb[0]; ay = sb[1]; az = sb[2]; }
      else if (onlyA) { sample(A2.f, q, W, H, sa); ax = sa[0]; ay = sa[1]; az = sa[2]; }
      else {
        sample(A2.f, q, W, H, sa);
        sample(B2.f, q, W, H, sb);
        ax = sa[0] + (sb[0] - sa[0]) * st;
        ay = sa[1] + (sb[1] - sa[1]) * st;
        az = sa[2] + (sb[2] - sa[2]) * st;
      }

      var drift = 2.5 + q.depth * 4;
      var wx = ax + (sA * q.cp0 + cA * q.sp0) * drift;
      var wy = ay + (cB * q.cp1 - sB * q.sp1) * drift;
      var wz = az + (sC * q.cp2 + cC * q.sp2) * drift;

      var x1 = wx * cyw + wz * syw, z1 = wz * cyw - wx * syw;
      var y1 = wy * cpt - z1 * spt, z2 = wy * spt + z1 * cpt;
      var den = FOV + z2; if (den < FOVMIN) den = FOVMIN;
      var per = FOV / den;
      var sx = ox + x1 * per, sy = oy + y1 * per;
      if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) continue;

      px[i] = x1; py[i] = y1; pz[i] = z2; pper[i] = per; psx[i] = sx; psy[i] = sy;
      if (o.depthSort) {
        var b = (z2 * invSpan + 0.5) * (BUCKETS - 1) | 0;
        if (b < 0) b = 0; else if (b >= BUCKETS) b = BUCKETS - 1;
        pbk[i] = b; counts[b]++;
      }
      vis[nVis++] = i;
    }

    /* ---- counting sort: far bucket first, so near particles paint last --- */
    if (o.depthSort) {
      var pos2 = 0;
      for (k = BUCKETS - 1; k >= 0; k--) { start[k] = pos2; pos2 += counts[k]; }
      for (k = 0; k < nVis; k++) { var ii = vis[k]; order[start[pbk[ii]]++] = ii; }
    } else {
      for (k = 0; k < nVis; k++) order[k] = vis[k];
    }

    /* ---- pass B: draw ---------------------------------------------------- */
    // Solid faces carry their depth cue in the shade ramp, so alpha is a
    // per-frame constant. That is what lets a near particle actually occlude
    // the one behind it instead of blending with it.
    if (isSolid) ctx.globalAlpha = Math.min(1, intensity);

    for (k = 0; k < nVis; k++) {
      i = order[k];
      var p = parts[i];
      var X1 = px[i], Y1 = py[i], Z2 = pz[i], PER = pper[i];
      /* Skewed so most marks stay small and a handful are markedly large —
         that scatter of big marks is most of the field's texture. */
      var s0 = (1.5 + p.depth * 3.4) * size *
        (1 + sizeVar * (Math.pow(p.svRaw, 2.4) * 2.6 - 0.35));
      var near = (PER - 0.62) / 0.85; if (near < 0) near = 0; else if (near > 1) near = 1;

      if (!isSolid) {
        ctx.globalAlpha = Math.min(1, (0.10 + p.depth * 0.34 + near * 0.46) * intensity);
        if (glowOn) {
          var hot = near > 0.66;
          ctx.shadowBlur = hot ? 9 : 0;
          if (hot) ctx.shadowColor = p.color;
        }
      }

      if (isDot) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(psx[i], psy[i], Math.max(0.4, s0 * PER * 0.36), 0, TAU);
        ctx.fill();
        continue;
      }

      // particle tumble; constant when the camera is locked, which is production
      var cpa, spa, cpb, spb;
      if (spd === 0) { cpa = p.crot; spa = p.srot; cpb = p.crot2; spb = p.srot2; }
      else {
        var pa = p.rot + t * p.spin * spd, pb = p.rot2 + t * p.spin2 * spd;
        cpa = Math.cos(pa); spa = Math.sin(pa); cpb = Math.cos(pb); spb = Math.sin(pb);
      }

      if (isSolid && s0 * PER >= lodPx) {
        /* Four vertices, four faces. Each vertex gets its own perspective
           divide — that is what makes this a solid rather than a billboard. */
        for (var v = 0; v < 4; v++) {
          var vx = TET[v * 3] * s0, vy = TET[v * 3 + 1] * s0, vz = TET[v * 3 + 2] * s0;
          var t1y = vy * cpb - vz * spb, t1z = vy * spb + vz * cpb;
          var t2x = vx * cpa + t1z * spa, t2z = t1z * cpa - vx * spa;
          var ex = t2x * cyw + t2z * syw, ez = t2z * cyw - t2x * syw;
          var ey = t1y * cpt - ez * spt, ez2 = t1y * spt + ez * cpt;
          var vden = FOV + Z2 + ez2; if (vden < FOVMIN) vden = FOVMIN;
          var vp = FOV / vden;
          vex[v] = ex; vey[v] = ey; vez[v] = ez2;
          vsx[v] = ox + (X1 + ex) * vp;
          vsy[v] = oy + (Y1 + ey) * vp;
        }

        var invN = 1 / (TET_NLEN * s0 * s0);
        var aerial = AERIAL_BASE + AERIAL_RANGE * near;
        for (var f = 0; f < 4; f++) {
          var i0 = TET_F[f * 3], i1 = TET_F[f * 3 + 1], i2 = TET_F[f * 3 + 2];
          var e1sx = vsx[i1] - vsx[i0], e1sy = vsy[i1] - vsy[i0];
          var e2sx = vsx[i2] - vsx[i0], e2sy = vsy[i2] - vsy[i0];
          // Front-facing under a y-down, +z-away frame is a negative 2D cross.
          if (cullOn && e1sx * e2sy - e1sy * e2sx >= 0) continue;

          var e1x = vex[i1] - vex[i0], e1y = vey[i1] - vey[i0], e1z = vez[i1] - vez[i0];
          var e2x = vex[i2] - vex[i0], e2y = vey[i2] - vey[i0], e2z = vez[i2] - vez[i0];
          var nx = e1y * e2z - e1z * e2y;
          var ny = e1z * e2x - e1x * e2z;
          var nz = e1x * e2y - e1y * e2x;
          // -z points at the viewer; flip so the lit side is the visible side
          if (nz > 0) { nx = -nx; ny = -ny; nz = -nz; }
          var ndl = (nx * LX + ny * LY + nz * LZ) * invN;
          if (ndl < 0) ndl = 0;
          var idx = ((LIT_BASE + LIT_RANGE * ndl) * aerial * (SHADES - 1) + 0.5) | 0;
          if (idx < 0) idx = 0; else if (idx >= SHADES) idx = SHADES - 1;

          ctx.beginPath();
          ctx.moveTo(vsx[i0], vsy[i0]);
          ctx.lineTo(vsx[i1], vsy[i1]);
          ctx.lineTo(vsx[i2], vsy[i2]);
          if (hollow) { ctx.strokeStyle = p.ramp[idx]; ctx.closePath(); ctx.stroke(); }
          else { ctx.fillStyle = p.ramp[idx]; ctx.fill(); }
        }
        continue;
      }

      /* Flat facet: the legacy triangle, and the LOD fallback for solid — at
         a few pixels the shading of a tetrahedron is imperceptible. */
      if (isSolid) {
        var lodIdx = (0.86 * (AERIAL_BASE + AERIAL_RANGE * near) * (SHADES - 1) + 0.5) | 0;
        if (lodIdx < 0) lodIdx = 0; else if (lodIdx >= SHADES) lodIdx = SHADES - 1;
        ctx.fillStyle = p.ramp[lodIdx];
      } else if (isFill) ctx.fillStyle = p.color;
      else ctx.strokeStyle = p.color;

      // `tv`, not `k`: k is the outer draw-order index and reusing it here
      // would silently restart the whole pass.
      ctx.beginPath();
      for (var tv = 0; tv < 3; tv++) {
        var tvx = TRI[tv][0] * s0, tvy = TRI[tv][1] * s0;
        var ty = tvy * cpb, tz = tvy * spb;
        var tx2 = tvx * cpa + tz * spa, tz2 = tz * cpa - tvx * spa;
        var tex = tx2 * cyw + tz2 * syw, tez = tz2 * cyw - tx2 * syw;
        var tey = ty * cpt - tez * spt, tez2 = ty * spt + tez * cpt;
        var tden = FOV + Z2 + tez2; if (tden < FOVMIN) tden = FOVMIN;
        var tvp = FOV / tden;
        var fx = ox + (X1 + tex) * tvp, fy = oy + (Y1 + tey) * tvp;
        if (k === 0) ctx.moveTo(fx, fy); else ctx.lineTo(fx, fy);
      }
      if (isFill || isSolid) ctx.fill();
      else { ctx.closePath(); ctx.stroke(); }
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
    fromFill: fromFill,
    line: L, arc: A, poly: poly, rect: rect, twin: twin
  };

  root.ParticleField = ParticleField;
  if (typeof module !== 'undefined' && module.exports) module.exports = ParticleField;
})(typeof window !== 'undefined' ? window : this);
