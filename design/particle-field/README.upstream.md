# particle-field

Scroll-morphing 3D triangle particle field. One canvas, zero dependencies, no build step.

```
particle-field/
├─ particle-field.js   ← the effect (the only file you need)
├─ index.html          ← working demo / copy-paste reference
└─ README.md
```

Open `index.html` in a browser (or Live Server in VS Code) to see it running.

---

## Install

```html
<canvas id="field"></canvas>
<script src="particle-field.js"></script>
<script>
  ParticleField.init({ canvas: '#field' });
</script>
```

Required canvas CSS — it must sit behind your content and never eat clicks:

```css
#field {
  position: fixed; inset: 0;
  width: 100vw; height: 100vh;
  display: block; z-index: 0; pointer-events: none;
}
main { position: relative; z-index: 2; }
```

## How the scroll works

Mark the sections that should each own a shape:

```html
<section data-pf-stage>…</section>
<section data-pf-stage>…</section>
```

Anchor *N* pairs with `stages[N]`. A shape fully settles when its section is
centred in the viewport, and morphs continuously in between. No anchors in the
DOM? It falls back to plain page-scroll percentage.

## Options

| Option | Default | What it does |
|---|---|---|
| `canvas` | – | Element or selector. **Required.** |
| `sectionSelector` | `'[data-pf-stage]'` | Scroll anchors, document order. |
| `stages` | 5 shapes | `[{ shape, x, intensity, name }]` — see below. |
| `colors` | teal/amber/white/slate | Sampled per particle. Repeat a hex to weight it. |
| `count` | `1500` | Particles drawn. Max 2400. Mobile: try 700. |
| `style` | `'triangle'` | `'triangle'` (outline) · `'filled'` · `'dot'`. |
| `size` | `1` | Particle size multiplier. |
| `opacity` | `1` | Overall field opacity multiplier. |
| `glow` | `true` | Bloom on near particles. Set `false` for a flatter look. |
| `spinSpeed` | `1` | Camera orbit + facet tumble. `0` freezes rotation. |
| `morphEase` | `0.06` | Shape-transition smoothing. `0.02` slow, `0.15` snappy. |
| `pointerParallax` | `1` | Mouse camera nudge. `0` to disable. |
| `respectReducedMotion` | `true` | Freezes motion under `prefers-reduced-motion`. |
| `onProgress` | – | `(scroll0to1, stageName, stageIndexFloat) => {}`. |

### Stage entry

```js
{ shape: 'gear', x: 0.70, intensity: 0.55 }
```

- `shape` — a built-in name or your own function.
- `x` — horizontal anchor, `0` left … `1` right. Park the shape opposite your text.
- `intensity` — field brightness for that section. Drop to `0.4–0.6` over text-heavy sections so copy stays readable.

### Built-in shapes

`bridge` · `network` · `gear` · `steps` · `chart` · `pair` · `dial` · `scatter` · `sphere` · `cube` · `torus` · `helix`

## Custom shapes

A shape is a function returning world coordinates centred on the origin:

```js
function ring(q, W, H) {
  var m = Math.min(W, H) * 0.3;
  var a = q.r[0] * Math.PI * 2;      // q.r = 6 stable random numbers, 0..1
  return [Math.cos(a) * m, Math.sin(a) * m, 0];
}

ParticleField.init({ canvas: '#field', stages: [{ shape: ring, x: 0.5 }] });
```

`q.r[0..5]` are fixed per particle, so the same particle always lands in the same
spot of a shape — that is what makes the morph read as one object rearranging.

### From a flat outline

Draw with line and arc segments in unit space (about `-0.5 … 0.5`), then extrude:

```js
var P = ParticleField;
var logo = P.fromOutline(
  [].concat(
    P.rect(-0.3, -0.2, 0.3, 0.2),
    [P.arc(0, 0, 0.12, 0, Math.PI * 2)],
    P.poly([[-0.3, 0.2], [0, 0.4], [0.3, 0.2]])
  ),
  0.8,            // scale, relative to min(viewport w, h)
  P.twin(0.08)    // depth: mirror into two planes 0.08 apart (omit for flat)
);

P.init({ canvas: '#field', stages: [{ shape: logo, x: 0.5 }] });
```

Helpers: `P.line(x1,y1,x2,y2)` · `P.arc(cx,cy,r,a0,a1)` · `P.poly([[x,y],…])` · `P.rect(x0,y0,x1,y1)` · `P.twin(depth)` · `P.fromOutline(prims, scale, depthFn, jitter)`.

## Runtime API

```js
var field = ParticleField.init({ canvas: '#field' });

field.set({ count: 800, style: 'dot', spinSpeed: 0.4 });  // live options
field.setStages([{ shape: 'torus', x: 0.5 }, { shape: 'cube', x: 0.5 }]);
field.measure();   // call after you add/remove/resize sections
field.destroy();   // remove listeners + stop the loop
```

## Section fade-in (optional)

```html
<section data-pf-stage data-pf-reveal>…</section>
```
```js
ParticleField.reveal('[data-pf-reveal]');
// ParticleField.reveal('[data-pf-reveal]', { distance: 22, duration: 800, threshold: 0.12 });
```

## Framework notes

**React** — start in an effect, destroy on cleanup:

```jsx
useEffect(() => {
  const f = ParticleField.init({ canvas: canvasRef.current });
  return () => f.destroy();
}, []);
```

**Next.js / SSR** — the module touches `window`; load it client-side only
(`dynamic(..., { ssr: false })` or inside `useEffect`).

**Vue** — `onMounted` to init, `onBeforeUnmount` to `destroy()`.

## Performance

- One canvas, one rAF loop, no allocations per frame; DPR capped at 2.
- `count` is the main dial. 1500 is comfortable on desktop; use ~700 under 768px.
- `glow: false` is the cheapest win — canvas shadow blur is the costliest part.
- Cut `count` and set `spinSpeed: 0.3` on low-power devices if you detect them.

## Browser support

Any browser with `<canvas>` 2D and `IntersectionObserver` (only needed for
`reveal`). No polyfills required for evergreen browsers.
