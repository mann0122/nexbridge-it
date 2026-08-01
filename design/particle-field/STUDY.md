# particle-field — brand study

Source: `Scrolling particle brain effect.zip` (vendored 2026-08-02). Upstream API reference is
kept verbatim in `README.upstream.md`. Open `index.html` in a browser to see the brand-tuned
version — no server, no build step.

**Status: shipping, as the homepage's `Wandlung` stage (D-028).** It first went behind the
Vorgehen section (D-026), was reviewed against real screenshots and reverted the same day
(D-027); the second attempt built it a pinned full-viewport sheet of its own and works. Read
"What the first attempt taught us" before touching it — both constraints there are load-bearing.
This folder stays the lab: pristine upstream library, the patched production copy, the brand
preset, a tuned demo and this study. `design/` is outside the Astro build; the live copies live
in `website/src/scripts/vendor/` and `website/src/components/TransformStage.astro`.

---

## Verdict

Unusually good fit, on a technicality that turns out to matter: this library's shape-authoring
API is *the same grammar as a technical drawing*. You write shapes as line and arc segments in
unit space and extrude them with `twin()` — which is exactly how `DESIGN.md` describes the visual
world ("drawn, measured, and labeled the way an engineer would"). Most particle libraries give
you spheres and blobs, which are a named anti-pattern here. This one ships a **suspension
bridge** as a stock shape.

But it must not go in the hero, it needs four brand corrections before it is legal, and the
library has two production gaps it does not admit to. Details below.

---

## What it actually is

1500 particles, each a real 3D triangle facet that tumbles on two axes and is projected
per-vertex through a yaw/pitch camera with a perspective divide. Not sprites — actual geometry.

The trick that makes it look engineered rather than decorative is in `_buildParticles`: each
particle gets six random numbers from a deterministic hash (`particle-field.js:286`) and keeps
them for its whole life. Every shape is a pure function of those six numbers, so **the same
particle always lands in the same place in every shape**. Morphing between two shapes is then a
straight interpolation per particle, and it reads as one object physically rearranging itself
rather than two images crossfading. That single decision is the whole effect.

Scroll drives it: each `[data-pf-stage]` section is an anchor, and a shape fully settles when its
section is centred in the viewport (`onScroll`, `particle-field.js:341`).

---

## Why it fits this brand

- **The shape vocabulary is already engineering.** `bridge`, `gear`, `network`, `steps`, `chart`,
  `dial` — drawing-office objects, not the usual blob soup.
- **`bridge` is the brand metaphor**, and it is genuinely well drawn: towers, deck, hangers, and
  a parabolic main cable, extruded into two planes.
- **`fromOutline` + `line`/`arc`/`poly`/`rect`/`twin` is P&ID grammar.** I used it in
  `nexbridge-preset.js` to author three shapes that do not exist upstream: a signal-flow
  schematic with feedback path and instrument tag bubbles, a dimensioned part with real dimension
  lines and arrow terminators, and the Zeichnungskopf title block with drawing-frame corner ticks.
  All three are the site's existing flat vocabulary, given depth.

---

## What violates the brand — corrected in `nexbridge-preset.js`

| Upstream default | Why it fails | Correction |
|---|---|---|
| `colors` teal `#29D9A8` + amber `#FFB829` | "Purple/teal gradients" is a hard ban in `DESIGN.md` | Palette rebuilt from `@theme` tokens only |
| Signal would be ~17% of particles | Rule is one signal element per viewport; `FlowField` rations at 6% | 1 entry in 16 = **6.25%**, verified |
| `glow: true` → `shadowBlur` halos | "dark-with-neon-glow rendition … no halos" | `glow: false` in the preset defaults |
| `sphere` / `torus` / `helix` built-ins | "3D blobs" is a named anti-pattern | Never referenced; do not use them |
| `ParticleField.reveal()` | Sets `opacity:0` inline and **re-hides sections on scroll-out**. Breaks "from already-visible layouts" and `global.css`'s no-JS-safe contract | Not used. `revealGroup()` in `src/scripts/motion.ts` is the correct mechanism |

The canvas is also decorative and must carry `aria-hidden="true"`, as `FlowField.astro` already does.

---

## Performance

Measured, not estimated:

| | raw | gzip | brotli |
|---|---|---|---|
| `particle-field.js` | 19.9 KB | 6.3 KB | 5.5 KB |
| `nexbridge-preset.js` | 6.3 KB | 2.4 KB | 2.0 KB |

Bytes are a non-issue against the ~176 KB JS budget. **The cost is CPU, not transfer.** At 1200
particles in `triangle` style the loop does ~1200 stroked paths and ~3600 vertex projections per
frame — materially heavier than `FlowField`'s ~140 line segments. Lighthouse ≥ 95 on performance
is a definition-of-done, so the demo carries a live FPS readout to make this checkable rather
than a matter of opinion.

Mitigations already in the preset: `glow: false` (canvas shadow blur is the single most expensive
part), `count` 640 on mobile / 1200 desktop, `spinSpeed` 0.55.

---

## Where it should go

**Not the hero.** `Hero.astro` already renders `FlowField.astro`, which is tuned, brand-specific,
painted synchronously so the artwork survives throttled rAF, and carries the "Fluss" metaphor.
Two generative particle systems in one viewport is two focal points and a blown signal ration.
Replacing it would trade a bespoke piece for a configured library — a downgrade in exactly the
dimension we sell.

Ranked, then:

**1. The planned subpages — strongest.** `STATE.md` records that `#leistungen` and `#vorgehen` are
homepage anchors "until dedicated subpages exist", and the spec sitemap lists them as planned.
Those pages are greenfield: no `FlowField`, no competing hero. A `/vorgehen` page whose scroll
morphs *scatter → bridge → schematic → title block* **is** the process, told in the brand's own
drawing grammar. It gives those pages a reason to exist beyond more text, and it is the
"engineering-grade" proof the positioning claims rather than asserts.

**2. The `Process` section on the homepage — good and tightly scoped.** Three phases, three
shapes, canvas positioned inside the section rather than fixed to the viewport, `intensity`
dropped to ~0.5 behind copy. `DESIGN.md`'s signature motion is already a flow-line that draws
itself on scroll; this is the same idea with depth, and the phases are genuinely sequential so
the morph means something.

**3. A dedicated P1 Prozess-Audit page — the commercial case.** The audit is the only thing with
a public price (295 €, `STATE.md`) and therefore the only page that has to actually sell. Field
morphs from a scattered volume, through the schematic, to the title block: the process today,
what we map, what you receive. The artwork carries the argument.

---

## The premium move

The effect stops looking like a plugin the moment the shapes are *ours*. Two things do most of
the work:

1. **Assemble the wordmark.** `fromOutline` accepts any flat outline, so the final stage of a
   scroll can be the NexBridge-IT mark — or just the logo period — constructed out of 1200
   tumbling facets and then held. That is the memorable beat, and it is unmistakably bespoke.
2. **Let the last shape hold, not resolve into nothing.** The library keeps the final stage
   parked. Ending on the Zeichnungskopf reads as a document being stamped and filed, which is the
   brand's whole posture.

The discipline that keeps this premium rather than templated: **one pinned sequence per page,
maximum**, and the hero field and this field must never share a viewport. The homepage already
carries grain, a custom cursor, a marquee, dimension-line hovers, a live sparkline and
`FlowField`; `#wandlung` earns its place because it is a beat the page was missing, not another
layer on a beat it already had. A second pinned sequence would make the site a showreel.

---

## What the first attempt taught us

D-026 put the field behind the homepage's three Vorgehen phases. It was built, rendered in a
headless browser and reverted the same day. Two things came out of it that are worth more than
the integration was.

**1. Lock the camera — this is not optional and is not in the upstream docs.** With any
`spinSpeed > 0` the camera orbits continuously, so at section scale a drawn outline almost never
faces the viewer and the whole field reads as a cloud of grey specks. It looks like dirt, not
engineering. Setting `spinSpeed: 0` made the shapes legible immediately — the dimensioned part
resolved into a recognisable outline with its bore circles and dimension line. Scroll still turns
the object, because yaw is *also* a function of stage position (`pos * 0.35`), so locking the
spin does not make it static. Upstream's demo hides this because its shapes fill the viewport.

**2. The effect needs a layout designed around it.** The Vorgehen section's copy spans the full
grid — title, note column and price column — leaving no empty region for artwork. Every setting
was one of two failures:

| Setting | Result |
|---|---|
| faint enough to leave the copy alone | reads as dirt on the screen, no shape legible |
| strong enough to read as a shape | particles crawl across the price column |

There is no value in between, because the text occupies the whole width. `295 € Festpreis` is the
only price on the site, so degrading it for a background effect is a bad trade. The section was
picked as the smallest, safest change; small is not the same as suitable.

Mobile was worse and got disabled outright: below 768px the section is one column of text edge to
edge, so the field lands directly on the body copy.

**Consequence for the next attempt:** give it an empty column or half a viewport, `spinSpeed: 0`,
and let the shape be large enough to resolve. That is a page built around the effect — the
`/vorgehen` option ranked first above — not a retrofit behind dense copy.

---

## Production copy

`particle-field.production.js` in this folder is the patched, integration-ready library and
**differs from `particle-field.js`**, which is kept pristine for diffing against upstream. Three
marked `NEXBRIDGE PATCH` blocks, each closing a gap `FlowField.astro` already handled:

1. **`pause()` / `resume()`** — upstream runs its rAF loop unconditionally, off-screen and in
   background tabs. `ProcessField.astro` gates on intersection *and* visibility together, so
   returning to the tab does not restart a field nowhere near the viewport.
2. **Debounced resize (150 ms)** — upstream re-measures every anchor via `getBoundingClientRect`
   on every resize event; mobile URL-bar chrome fires that mid-scroll.
3. **Brand-safe defaults** — `DEFAULTS.colors` was teal + amber and `glow` was `true`. The preset
   always overrode both, but dead banned hex should not sit in the shipped bundle, and the
   library should fail safe if anyone calls `init()` without the preset.

Measured when it was integrated: the component chunk was 14.4 KB raw / 4.9 KB brotli, taking
homepage JS from ~178 KB to ~192 KB raw (65.1 KB brotli). Budget is not what killed it.

Still open: the `mousemove` listener attaches on touch devices where it does nothing, and the
reduced-motion / `?snap` path is wired but has never been checked against a real static capture.

---

## Status

**Live as `#wandlung`** — a pinned full-viewport stage between Problems and Services, D-028. The
answer to D-027 was not to find empty space on the page but to *build* it: the section is 240svh
of scroll holding one sheet, and the field owns the whole viewport.

Shapes in the shipped stage: `fragments` → `bridge` → `schematic`. `fragments` was written for
this — the stock `scatter` disperses across the entire viewport, reads as dust rather than
chaos, and lands on the caption.

Still unbuilt and still worth doing: a `/vorgehen` subpage and a P1 audit page. Both would need
their own decision, and the site should not grow a second pinned sequence — one focal moment is
a system, two is a showreel.

Also open: the `mousemove` listener attaches on touch devices where it does nothing.
