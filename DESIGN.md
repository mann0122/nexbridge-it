# Design

<!-- Committed visual world for the klarfluss website. Written per impeccable new-work flow.
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
Budget: ~176 KB JS across the page, zero external asset requests.

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
