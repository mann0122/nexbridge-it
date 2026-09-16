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
- `signal #FF4D00` — THE accent. Rationed: one signal element per viewport. The **sticky logo
  lockup is a standing exception counted out of the ration site-wide** — it is the logo, it rides
  every route, and per-section signal budgets are counted *below* the header. On the hero, below the
  header, the specced CTA and the signature schematic line are the two named exceptions.
  Consequence, written down so it is not re-litigated: **a signal CTA in the nav is now blocked** —
  it would put a second permanent signal element in the sticky bar. Widened from "logo period" by
  D-050, when the logo gained a mark.
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

**Route transitions** (D-039): navigation is client-side (Astro ClientRouter) and reads as a
drawing change, never a SaaS cross-fade (the browser's own is disabled). A graphite drafting
sheet slides across the board left→right — the flow-line's direction — a hairline frame draws
in, a Zeichnungskopf stamps the target path, sheet number (the veil's one signal element) and
date; the swap happens under cover; the sheet exits right so content is revealed in reading
direction. Navigation waits only for the cover (0.42s). History traversals swap bare. DE↔EN is
a 250ms hairline scan with the scroll position carried over — same drawing, new annotation
layer. The veil is DOM/SVG by decision: it must work where WebGL does not.

**Hero dispersion** (D-040): leaving the hero disperses the flow field — scroll-scrubbed, the
flow vectors mix toward a radial impulse, streaks lengthen, the field evaporates; scrolling
back re-forms it. Route exits fire the same machinery as a 0.45s blast under the veil. The
effect lives inside the canvas the hero already owns — no third canvas, no new library — and
D-035's lessons still govern anything beyond it.

**Section seams** (D-041): the eight homepage boundaries are drafting operations — seam rules
that draw themselves along existing border lines (one numeral tick rides the first), ground-
wipes confined to a 4.5rem seam band where graphite and paper trade places, the marquee
conveyor coupling to scroll velocity, one ScrambleText teleprinter moment, differential
parallax at one boundary. Three motifs recurring, not eight gimmicks; one boundary is quiet on
purpose. All seam furniture is steel/line/graphite — no signal — built by JS so the no-JS page
is unchanged. Scrubbed and reversible everywhere; still nothing pinned.

**Flowrail** (D-044): the schematic's exit arrow detaches on the first scroll and travels the
whole document — one signal line at the action-line weight (2.5: legal here because the rail
*is* `flow-out-main` continued, not a new user of the weight), riding the hero DIN frame's
edge and then the right px-6 gutter, with inward circuit-trace jogs at the seams where the
gutter affords them, plugging into the footer Zeichnungskopf. Fully scrubbed — scroll back and
the signal returns to the schematic. The ration bends, not breaks: the rail is the flow-line —
the one memorable device — extended, and it **yields to 0.2 opacity** wherever a section owns
its own signal (Process's scroll line, Contact's CTA + closing schematic); Demo's sparkline is
annotation-grade and is consciously not yielded to. On route exit the rail retracts and the
arrowhead **bursts into 18–28 same-species arrowheads** that fall under Physics2D gravity over
the drafting-sheet veil and vanish — this amends D-039's "the sheet number is the veil's single
signal element": during the ~1.2s shower, the debris is the second, by design and founder
order. JS-built; no-JS and `?snap` pages are byte-identical.

**Wordmark drop** (D-047): once per page-load, after the schematic finishes drawing, the
wordmark's signal period lifts off and indexes across the name — constant hop height,
constant 200ms rhythm, a measuring probe, not a bouncing ball; the letters never move —
then descends the hero copy in a staircase (one contact per text line, stepping rightward),
lands on the signal line's origin and **becomes the first pulse**. A fading afterimage
trails it (ghosts on the one ticker, alpha 0.32 → 0, self-removing). The flying dot
replaces the resting period 1:1, so the ration's element count never rises, and the
sequence *ends in* the flow-line pulse — still the site's only loop. Router remounts
decline (F5 replays); scroll, resize, rotation or the mobile menu opening mid-flight bail
cleanly to the normal pulse; small viewports where the merge point sits below the fold
skip honestly. JS-built; no-JS and `?snap` pages unchanged.

**No pinned scroll sequence.** A morphing particle stage was built and removed across
D-026 → D-035; the reasoning is in the log and is worth reading before proposing another one.
`FlowField` in the hero was the page's only generative canvas until D-037 admitted the `Ribbons`
cursor trail. **Two now, and two is the limit.** The trail cleared a bar the stage never did: it
is bound to the visitor's own hand instead of being asked to carry meaning, it costs no layout
space, and it is rationed to a wash rather than an object. Read D-035 before proposing a third.
D-040's dispersion is not a third canvas — it is the first canvas, dispersing.

Budget (D-042, re-based by D-043, D-044 and D-047): **224.3 KB JS raw / 76.3 KB brotli** first
load, plus the deferred **50 KB raw / 12 KB brotli** `ogl` chunk fetched only once the cursor
trail's gates pass. **D-050 leaves JS untouched** — the mark is markup, not a script. Homepage
document **56.6 KB raw / 12.5 KB gzip** (56,634 / 12,474 bytes), re-measured for D-050
against the same page with the mark stripped out: **54.2 KB raw / 11.4 KB gzip**. So the
mark costs **2.48 KB raw / 1.06 KB gzip per document**, after rounding its path coordinates
to one decimal — no visible change, 15% smaller. It ships on every route including mobile, where
CSS hides it: the price of one geometry with no extra request, paid knowingly. Zero external asset
requests. Lighthouse: desktop 100/100/100, **mobile 94/100/100 — the performance floor is 94 since
D-043** (the founder traded the point for the icon vocabulary; the page had an unrounded 0.947
before, i.e. zero headroom, exactly as D-042 warned). A11y/SEO floors stay 95. During the D-050
gate a preview build measured mobile **89–90** on the pre-merge tree — font loading, not the mark —
which is why it is an open item in [[state]] rather than a silent regression; re-measure on the
merged tree before treating the 94 as held. Measure before raising any
of these numbers — D-042's warning about spending headroom that does not exist now applies
at 94.

## The mark (D-050)

The **folded glider** — a flat sheet folded into something that flies by itself. Two colours
(signal body, paper underside), flat vector, 1.692:1, no background. It is the brand's *object*;
the flow-line is the brand's *behaviour*, and neither replaces the other.

- **Three vector sources** carry the geometry — `public/logo-mark.svg`, `public/favicon.svg`,
  `src/components/Mark.astro` — and their path data must stay byte-identical. **Two rasters are
  rendered from them** and must be re-exported whenever the geometry changes:
  `public/apple-touch-icon.png` (180x180) and `public/og.png` (1200x630). `npm run logo` enforces
  the identical-paths rule and fails on drift; run it beside `npm run kb`.
- **Ground: dark only, for now.** The underside facet is `paper`, so on a paper ground it stops
  reading as a fold and the mark drops to one colour. Until an on-light cut is decided, place the
  mark on graphite — on paper, put it in a graphite chip. Open item, not an oversight.
- **Below 20px the fold closes up.** The browser tab is exactly that case and is not ours to
  choose: at 16px the mark reads as an orange dart with a paper sliver. Accepted deliberately — a
  tab icon is a recognition cue, not a reproduction. Anything we *do* control stays 20px or more.
- `Mark.astro` is a **brand element, not an icon**: it is filled, it is signal-coloured, and it
  therefore sits outside the D-043 icon contract (currentColor + strokes + never signal), which
  continues to govern annotation icons only. That is why it lives at components root.
- In the header it appears from `sm` up, at 20px — the floor above, held — inside the lockup link; it lifts and drifts
  right on hover **and on focus-visible** beside the period's lift — one gesture in two parts,
  both off under `prefers-reduced-motion`. It is centred on the wordmark's line box.
- Below 640px the header renders exactly as it did before the mark. That is a **composition
  choice, not physics**: measured at 360px the lockup leaves 2.9px of slack, which is not a
  margin, and the alternative — shrinking the wordmark of a company nobody has heard of yet —
  costs more than it buys. Revisit it with the header, not with the logo.
- The mark is drawn geometry in the repo, so the generated-imagery ban below is untouched: that
  ban governs illustrative and photographic content on the page, not the logo. The mark's origin
  (a vector model, then hand-cleaned) is recorded in D-050 rather than hidden.

## Components (as they get built)

- CTA: signal bg, graphite text, weight 600, square corners with 2px radius max, arrow that
  extends on hover — real geometry since D-043: `Cta.astro` wraps the shell,
  `icons/CtaArrow.astro` draws a 2.5-weight shaft that lengthens into a fixed filled head.
  Secondary: 1px steel border, paper text, same geometry.
- Nav: graphite, **logo lockup** left (mark + wordmark + period, mark from `sm` up), links
  center-right, language switch DE/EN as mono toggle. A signal CTA in the nav is blocked by the
  ration — see the token note above (D-050). Mobile: full-screen graphite overlay.
- Focus states: 2px signal outline offset 2px, everywhere.
- Teaser card (D-056): an uninked drawing sheet — 16:9 image area over a Zeichnungskopf that
  carries the name, the part number and a status field with the lock mark. The silent preview
  loop sits *inside* the image area under `blur(14px) grayscale(1) contrast(0.95)` and a 0.74
  graphite scrim (tuned against the real posters, D-061): motion reads, content does not. The title block is **solid** graphite, never a scrim
  over the film — a translucent band would hand its contrast to whatever frame was showing.
  All furniture is steel: two cards share a viewport, so neither may spend the signal. The
  card is a `<button>`; the unlock `<dialog>` is shared by both, and its submit CTA is that
  viewport's one signal element — so the error line is **steel**, not signal and not a signal
  rule. A 1px signal rule was tried and failed the gate: the ban on coloured left-borders
  wider than 1px is about the alert-tab *shape*, and passing it buys no exemption from the
  ration, which is a separate rule whose only sanctioned relief is being a wash rather than
  an object. The plate is `grayscale(1)` for the same reason — partial saturation still puts
  a full-card field of unchosen colour in the viewport, and an uninked sheet is not in colour.

- Stats board (D-063): the founders' datasheet at `/statistik` — one bordered document on
  paper, like the demo dashboard: Zeichnungskopf, a KPI row in proportional display figures, a
  bar chart of views per day drawn as inline SVG at the container's measured width (bars ≤ 24px,
  square-ended, steel-deep, a 2px paper gap that survives 90 days on a phone), and Positionsliste
  tables. The **latest day's bar is the sheet's one signal element** — the live dot in datasheet
  form, kept as a 2px tick when today has no views yet. Text on paper is graphite or steel-deep
  only; the tooltip is a graphite plate so its paper and steel inks keep the verified contrasts.
  One tab stop on the chart, arrows walk the days, Escape dismisses the tooltip; every number the
  tooltip shows is also in a table. Its CSS is a page-scoped sheet (`styles/stats.css`), not a
  colocated block and not in the shared sheet — two founder-only routes do not tax every visitor.

### Icon grammar (D-043, supersedes D-032's zero-icon rule)

One `.astro` file per icon in `website/src/components/icons/`, inline SVG, no JS, no deps.
The rules D-032 demanded, now binding:

- **Strokes**: butt caps, miter joins — never `round`, nothing else on the site rounds. Weight
  1.5 on the 24-unit grid (2 on a 32 grid); **2.5 belongs to the CTA arrow's action line only**,
  mirroring the flow-line's muted/action weight pair. No third weight, ever.
- **Colour**: `stroke="currentColor"` and nothing else — steel-deep on paper, steel on graphite,
  **never signal** (the ration counts elements; icons are not elements, they are annotations).
- **Size**: annotation grade, 14–20px, inline in row/label grammar like part symbols on a
  drawing. The icon-card-grid ban stands untouched.
- **Trigger**: a bare `data-icon-hover` attribute on the interactive parent; CSS fires on its
  `:hover` and `:focus-visible`. Never on hovering the SVG itself — the link is the hit area.
- **The one exemption**: the single filled, signal-coloured SVG in the UI is
  `components/Mark.astro`, the brand mark (D-050). Nothing under `components/icons/` may be filled
  or signal-coloured, at any size, for any reason.
- **Motion**: single-shot and reversible, 420ms `cubic-bezier(0.16,1,0.3,1)` in / 200ms ease
  out (the `.dim-row` curve, so icon and dimension lines read as one event). No infinite loops —
  the flow-line pulse remains the site's only loop. Every rule carries the
  `prefers-reduced-motion: reduce` off-switch.
- **Rest state is the complete drawing**: draw-on-hover icons use `pathLength="1"` + dasharray
  and rest fully drawn, so no-JS, reduced-motion and `?snap` all render finished icons.
- Styles live in the **D-043 icon system section of `global.css`**, namespaced `icn-<name>-*` —
  one cached external sheet. Colocated `<style is:global>` blocks were tried first and measurably
  cost the Lighthouse-95 floor: they split into a second render-blocking CSS chunk, and inlining
  that chunk duplicated ~6 KB into every document (qa gate, interleaved runs). Geometry stays in
  the component; motion lives with the other shared idioms.
- **No icon without a call site** (D-032's lesson) — port on placement, never on speculation.

## Anti-patterns (hard bans from docs/02-brand.md + craft floor)

Purple/teal gradients · glassmorphism · 3D blobs · stock photos · Inter/DM Sans · gradient text
· cards in cards · >1 signal element per viewport · eyebrow-on-every-section · icon-card grids
· colored left-borders >1px · dark-with-neon-glow rendition (offset+blur shadows only, no halos).

The signal ration counts *elements*. The `Ribbons` trail (D-037) is held under it by being a
wash and not an object: 0.45 alpha at 18px, so it tints rather than competes: it adds no countable
element, and the hero's budget is still the two named exceptions in the token note above. Raising either number breaks the ration and the
copy underneath — that is the whole reason both are pinned in the mount, not left to defaults.

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
do not edit). `web-perf` against the budget in the Motion section above — one budget, stated
once — and the Lighthouse ≥ 95 floor, which held at D-042 with no headroom.

**Reference only, never prescription.** `ui-ux-pro-max`, `brand`, `design` — large lookup
databases. Consult for a pattern or a precedent; do not adopt their palettes, fonts or defaults.

**Out of world — do not load for NexBridge UI.** Not deleted, just not ours:

| Skill | Why it fights this file |
|---|---|
| `stitch-design-taste` | Generates DESIGN.md files — would overwrite this brief |
| `gpt-taste` | Mandates pinning/stacking/scrubbing throughout; this page has no pinned sequence |
| `apple-design` | Translucent/glass materials — glassmorphism is a hard ban above |
| `minimalist-ui` | Muted pastels and bento grids — signal is rationed, icon-card grids banned |
| `industrial-brutalist-ui` | Nearest cousin, wrong register: analog degradation and military terminal, not a drawing office |
| `high-end-visual-design` | Prescribes its own fonts, shadows and card structures over the tokens |
| `banner-design`, `brandkit`, `imagegen-frontend-web`, `imagegen-frontend-mobile`, `image-to-code`, `slides` | Generated imagery. This world is drawn and measured; stock and generated visuals are banned |

Adding a design skill to the allowed set is a decision — log it. Deleting one is not required.
