# Design

<!-- Committed visual world for the NexBridge-IT website. Written per impeccable new-work flow.
     The world was pinned by docs/02-brand.md (D-003); this file renders that commitment
     specific. The brief wins over any skill default. -->

## The world: the German engineering document

Not "dark tech site with orange accent" — that is the category rut this world refuses.
The cultural home is the drawing office of the Mittelstand: technical drawings (DIN 823 title
blocks, dimension lines, part numbering), process schematics (P&ID, signal-flow diagrams),
industrial datasheets. Surfaces read like precision documents: coordinates, hairline rules,
measured annotations, stamped labels. The flow-line is a real, labeled process diagram — a
working schematic, never a decorative squiggle. Everything is drawn, measured, and labeled the
way an engineer would.

## Tokens (single source: website/src/styles/global.css @theme)

- `graphite #14171A` — primary ground (hero, nav, closing sections)
- `graphite-2 #1B1F23` — raised panels on graphite (cards never nest)
- `paper #F7F5F0` — long-form ground (site flips to paper for reading sections); text on graphite
- `signal #FF4D00` — THE accent. Rationed: one signal element per viewport (logo period +
  specced CTA + the signature schematic line are the deliberate exceptions on the hero).
- `steel #8B959E` — secondary TEXT on graphite (brand steel was 3.1:1 — fails AA; this passes 5.9:1)
- `steel-deep #5B6770` — brand steel: borders, muted diagram lines, secondary text on paper
- `steel-soft #39424A` — hairlines on graphite
- `line #D9D4CA` — hairlines on paper
Contrast verified (computed): paper-on-graphite 15.6:1, steel(#8B959E)-on-graphite 5.9:1,
signal-on-graphite 5.4:1, graphite-on-signal 5.4:1 (CTA), graphite-on-paper 15.6:1.
Display size: clamp(2.5rem, 6.5vw, 5.6rem).

## Typography

- **Display + body: Archivo Variable** (self-hosted, Fontsource). Display: weight 600–700,
  width axis 125 (expanded), tight leading (1.02–1.08), tracking -0.02em. Body: width 100,
  weight 400, line-height 1.6, measure 60–72ch. Two weights in UI: 400, 600/700.
- **Data/labels: Fragment Mono** (regular only) — technical annotations, diagram labels,
  coordinates, numbers, the one kicker. Used only for data/measurement/labels, never as
  costume. (IBM Plex Mono from the brand doc's "e.g." was swapped: saturated AI-default face;
  Fragment Mono is the Helvetica-grammar mono that matches Archivo's grotesk system.)
- German typography: „Anführungszeichen", Halbgeviertstrich – no Title Case.

## Composition grammar

- 12-col grid, max-width 1200px, gutter 24px. Annotated margins: pages may carry drawing-frame
  coordinates (A–D / 1–4) in Fragment Mono at viewport edges — quiet, steel, structural.
- Hairline rules (1px steel-soft/line) structure sections like a datasheet; generous whitespace
  between blocks, tight within.
- The title block (Zeichnungskopf) is a recurring device: bordered mini-table with mono labels
  (e.g. PROJEKT / STAND / KONTAKT) — footer and section markers, never a "card".
- No same-size icon-card grids. Content structures: diagrams, annotated lists, measured tables.

## Motion

Signature: the flow-line draws itself left→right (GSAP + ScrollTrigger), muted lines first,
signal line last; a pulse then travels the signal line indefinitely. Exponential ease-out, from
already-visible layouts (no content hidden behind animation). Everything honors
prefers-reduced-motion, and `?snap` renders final states for static capture.

**Premium layer** (added 2026-07-26 on founder direction):
- **Lenis smooth scroll** driven off the GSAP ticker — inertia is the single biggest cue that a
  site was engineered rather than assembled. In-page anchors route through it.
- **Generative flow field** (`FlowField.astro`): value-noise vector field, particles traced as
  streams on canvas, ~6% carrying signal. Painted synchronously on init so the artwork exists
  even where rAF is throttled; live particles animate on top. A directional CSS mask keeps the
  headline area quiet and lets the field build toward the right — the direction of flow.
- **SplitText headline**: characters rise out of blur, 0.022s stagger.
- **Film grain**: inline SVG turbulence, 8-step shift. Texture, not motion — it stays (dimmer)
  under reduced-motion.
- **Crosshair cursor** with magnetic CTAs (`data-magnetic`), fine-pointer devices only.
- **Marquee** annotation band as section divider; pauses on hover.
- **Live sparkline** in the demo dashboard — a demo that stands still proves nothing.

**The focal moment — Wandlung** (`TransformStage.astro`, added 2026-08-02, D-028). One pinned
full-viewport sheet between Problems and Services, 240svh of scroll, where a single particle
object rearranges through three drawn states — re-themed to the AI stack in D-033: *Ihre Systeme*
(a silicon die in plan view) → *Der Agent* (a layered network as a Schaltbild on a dimension line)
→ *Im Betrieb* (a data pipeline in the P&ID duct whose feedback return carries the instrument
tag). Every particle keeps a stable identity across all three, so it reads as one object being
reorganised, never as pictures crossfading. These are AI subjects drawn the way an engineer would
draw them — the glowing brain and the floating node cloud are the category rut and stay banned.
Shapes are line/arc outlines extruded with `twin()`, never a sphere or a blob. Palette is tokens
only, signal rationed to 6.25%, glow off. Composition is a drawing sheet: kicker top-left, drawing
centred, caption and a measured `01 / 03` scale at the foot, DIN frame row B column 2 (the hero
holds A/1).

The mark is a **solid shaded tetrahedron**, depth-sorted so near particles occlude far ones — that
occlusion is what makes the field read as matter rather than as a transparent cloud. Faces are
flat fills from a 16-step ramp mixing one token toward the ground token, so shading can never
invent a hue. Third constraint, alongside the two below: **marks shrink as count rises**
(`size 0.78`, `count 2400`). A 5px pyramid on a 1px path turns a hairline into a caterpillar.

Two constraints, learned by failing first (D-026 → D-027): **the camera must be locked**
(`spinSpeed: 0`, or a drawn outline never faces the viewer and reads as grey dirt), and **it
needs a whole viewport** — behind copy there is no setting that is both legible as a shape and
harmless to the text. This is the page's *only* pinned sequence; a second one would make the site
a showreel.

Budget: ~193 KB JS across the page (65 KB brotli), zero external asset requests.

## Components (as they get built)

- CTA: signal bg, graphite text, weight 600, square corners with 2px radius max, arrow that
  extends on hover. Secondary: 1px steel border, paper text, same geometry.
- Nav: graphite, wordmark left, links center-right, language switch DE/EN as mono toggle,
  CTA right. Mobile: full-screen graphite overlay.
- Focus states: 2px signal outline offset 2px, everywhere.

## Anti-patterns (hard bans from docs/02-brand.md + craft floor)

Purple/teal gradients · glassmorphism · 3D blobs · stock photos · Inter/DM Sans · gradient text
· cards in cards · >1 signal element per viewport · eyebrow-on-every-section · icon-card grids
· colored left-borders >1px · dark-with-neon-glow rendition (offset+blur shadows only, no halos).

## Skill routing (D-031)

Many design skills are installed on this machine. Most were written for a *different* world and
carry prescriptive defaults — their own type scale, their own shadows, their own idea of what a
premium site looks like. Loading one for NexBridge UI work does not add taste, it adds a second
opinion that competes with this file. The brief wins over any skill default; this section names
which skills are allowed to speak at all.

**House flow.** `impeccable` — this document was written per its new-work flow. Design work that
needs a process uses it.

**Motion.** `gsap-core`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-plugins`, `gsap-performance`,
`gsap-utils` — GSAP is the only engine (D-030). `emil-design-eng` for interaction polish and the
invisible details. `animation-vocabulary` to name an effect before building it.
(`gsap-frameworks` is Vue/Svelte lifecycle — not our stack; Astro uses vanilla `<script>`.)

**System.** `design-system` for token architecture — it thinks in primitive → semantic → component,
which is how `global.css` `@theme` is already built.

**Audit.** `review-animations` and `find-animation-opportunities` (read-only, they propose, they
do not edit). `web-perf` against the ~193 KB / 65 KB brotli budget and the Lighthouse ≥ 95 floor.

**Reference only, never prescription.** `ui-ux-pro-max`, `brand`, `design` — large lookup
databases. Consult for a pattern or a precedent; do not adopt their palettes, fonts or defaults.

**Out of world — do not load for NexBridge UI.** Not deleted, just not ours:

| Skill | Why it fights this file |
|---|---|
| `stitch-design-taste` | Generates DESIGN.md files — would overwrite this brief |
| `gpt-taste` | Mandates pinning/stacking/scrubbing throughout; Wandlung is the page's only pinned sequence |
| `apple-design` | Translucent/glass materials — glassmorphism is a hard ban above |
| `minimalist-ui` | Muted pastels and bento grids — signal is rationed, icon-card grids banned |
| `industrial-brutalist-ui` | Nearest cousin, wrong register: analog degradation and military terminal, not a drawing office |
| `high-end-visual-design` | Prescribes its own fonts, shadows and card structures over the tokens |
| `banner-design`, `brandkit`, `imagegen-frontend-web`, `imagegen-frontend-mobile`, `image-to-code`, `slides` | Generated imagery. This world is drawn and measured; stock and generated visuals are banned |

Adding a design skill to the allowed set is a decision — log it. Deleting one is not required.
