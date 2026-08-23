---
id: brand-kit
title: Brand kit (portable, single file)
type: knowledge
status: active
owner: partner-b
updated: 2026-08-23
depends_on: [brand, website-spec]
decisions: [D-003, D-016, D-030, D-043, D-047, D-050]
---

# NexBridge-IT — Brand Kit

**What this is.** The complete design system in one portable file: identity, colour,
typography, layout, components, data visualization, icons, motion, voice, bans.
Written to be **fed to external tools** (AI builders, design apps, form services,
dashboard themers) and to brief anyone building anything NexBridge-IT-branded.

**How to use this file (for tools and people alike):** apply every value exactly as
written; treat the bans in §10 as hard constraints; where a value is not given, do
not invent one — leave it unstyled or ask. The YAML block above this heading is
internal repository metadata — ignore or strip it when pasting the kit elsewhere.

*Internal note (repo maintainers only): this is a derived artefact. Sources of truth
are the site's token sheet, DESIGN.md, the brand doc and the component code — change
those, then regenerate this file; never hand-edit values here. Every value was
extracted from source and survived an adversarial audit against it.*

---

## 1 · Identity

| | |
|---|---|
| Name | **NexBridge-IT** — CamelCase, exactly this spelling ("Nex", not "Next") |
| Wordmark | `NexBridge-IT` + a **signal-orange period**: `NexBridge-IT.` The period is the brand's one accent atom |
| Domain | nexbridge-it.com |
| Email | nexbridge-it@mailbox.org |
| Home | **Baden-Württemberg, Germany** — founded 2026. This is the stamped location (title blocks, footer, founders line: „Gegründet 2026 in Baden-Württemberg"). Berlin is only where the mail provider sits — never place the venture there |
| Positioning | **Built in Germany, GDPR-first, engineering-grade.** In customer copy the third term becomes „übergabefertig dokumentiert" / "documented for handover" — deliberate register shift, carry both |
| Promise | „Wir bauen Software, die Ihre Prozesse von selbst laufen lässt." |
| Offer names | Automatisierung · KI-Agenten · Dashboards · Individualsoftware (EN: Automation · AI agents · Dashboards · Custom applications) |
| Part numbers | `NB-` prefix: NB-01 Automatisierung, NB-02 KI-Agenten, NB-03 Dashboards, NB-04 Individualsoftware |
| Audience | German Mittelstand decision-makers (Geschäftsführer, operations leads; ~10–250 employees). Sceptical of hype, allergic to buzzwords; decide on trust and concrete numbers |

**The world.** Not "dark tech site with orange accent" — that is the category rut this
brand refuses. The cultural home is the **German drawing office**: technical drawings
(DIN title blocks, dimension lines, part numbering), process schematics (P&ID,
signal-flow), industrial datasheets. Surfaces read like precision documents —
coordinates, hairline rules, measured annotations, stamped labels. Everything is drawn,
measured and labelled the way an engineer would.

---

## 2 · Colour

Eight tokens. **The names in this table are canonical**: `steel` is the lighter
`#8B959E`; the darker `#5B6770` is `steel-deep`. (Older internal material used
"steel" for the darker value — this table wins.)

| Token | Hex | Role |
|---|---|---|
| `graphite` | `#14171A` | Primary ground: hero, nav, closing sections. Also the browser theme-color |
| `graphite-2` | `#1B1F23` | Raised panels on graphite (cards never nest). Only 1.09:1 against graphite — panels need hairline borders, never rely on the ground difference |
| `paper` | `#F7F5F0` | Long-form reading ground; primary text on graphite |
| `signal` | `#FF4D00` | **THE accent. Strictly rationed** — see rules below |
| `steel` | `#8B959E` | Secondary text **on graphite only** |
| `steel-deep` | `#5B6770` | Secondary text **on paper**; borders and muted diagram lines everywhere |
| `steel-soft` | `#39424A` | Hairlines on graphite — never text |
| `line` | `#D9D4CA` | Hairlines on paper — never text |

**Contrast, computed** (WCAG ratios from the hex values):

| Pair | Ratio | Verdict |
|---|---|---|
| paper on graphite / graphite on paper | 16.51:1 | AA+ (body) |
| paper on graphite-2 | 15.21:1 | AA+ |
| steel on graphite | 5.90:1 | AA (body) |
| steel on graphite-2 | 5.44:1 | AA (body) |
| signal on graphite / graphite on signal (the CTA) | 5.41:1 | AA (large/bold) |
| steel-deep on paper | 5.33:1 | AA (body) |
| steel-deep on graphite | 3.10:1 | large text / non-text boundaries only |
| signal on paper | ≈3.05:1 | large text only — signal text belongs on graphite |
| steel on paper | 2.80:1 | **never text on paper** |
| steel-soft on graphite | 1.76:1 | hairline only |
| line on paper | 1.36:1 | hairline only |

**The signal ration — the system's first law.** One signal element per viewport. The
ration counts *elements*, not pixels. Sanctioned exceptions, each argued and logged:
the hero carries logo period + CTA + the schematic's signal line as its deliberate set;
icons are annotations, not elements, and **never** take signal; washes (a cursor trail at
0.45 alpha) tint rather than compete; a travelling element may *replace* its resting
twin 1:1 but never duplicate it. When a section owns its own signal moment, other
signal carriers yield (the site dims its flowrail — §8 — to 0.2 opacity there).

**There is no green, no red, no yellow.** Success states are calm paper text; errors
are signal; warnings do not exist as a colour. Any tool that wants a status palette
gets these three answers.

**States.** Selection: signal background, graphite text — inverts to graphite/paper on
paper sections. Focus: `2px solid signal, outline-offset 2px`, everywhere, no exceptions.

---

## 3 · Typography

Two families, both self-hosted (Fontsource; **no Google Fonts CDN — GDPR commitment**):

- **Archivo Variable** (`@fontsource-variable/archivo/wdth.css`, v5.3.0) — display AND
  body. The **width axis is the hierarchy instrument**; weight barely moves.
- **Fragment Mono** (`@fontsource/fragment-mono`, v5.3.0, regular 400 only) — data,
  labels, annotations, numbers, kickers. Never as costume, never body text.

| Grade | Width | Weight | Tracking | Size |
|---|---|---|---|---|
| Display (hero H1 only) | **125%** | 700 | −0.02em | `clamp(2.5rem, 6.5vw, 5.6rem)`, leading 1.04 |
| Section H2 | 125% | 700 | −0.02em | `clamp(1.9rem, 3.6vw, 3rem)` |
| Closing H2 | 125% | 700 | −0.02em | `clamp(2.2rem, 4.4vw, 3.6rem)` |
| H3 / list titles | **112%** | 600 | — | 1.5rem |
| Wordmark | **112%** | 600 | −0.01em | 1.35rem in the header |
| Body | 100% | 400 | — | 1rem–1.125rem, leading ~1.6 (spec; shipped uses 1.5 base / 1.625 relaxed), measure 60–72ch |
| Annotation (labels, kickers) | mono | 400 | **+0.08em** | 0.6875rem (11px), UPPERCASE |
| Data values | mono | 400 | — | 0.8125rem (13px), **sentence case** |

**The two mono grades matter.** Labels are small, tracked, uppercase (STANDORT).
Values are larger, untracked, sentence case („Baden-Württemberg", „295 € Festpreis",
the email address). Uppercasing a value — „295 € FESTPREIS" — is the wrong register.

Two weights in UI, maximum: 400 and 600/700. Display text uses `text-wrap: balance`.
Only the hero gets the full display size — **every other section heading is the
smaller H2 grade**; hero-scale headlines on every section is the most common way to
get this brand wrong.

**German typography:** „Anführungszeichen“ (U+201E…U+201C), Halbgeviertstrich – für
Einschübe, **no Title Case, ever**. Dash convention differs by language: German uses
the en dash (–), English copy uses the em dash (—). Numbers format de-DE: 1.482 (not
1,482); dates stamp as MM/YYYY („08/2026").

**Banned typefaces:** Inter, DM Sans, generic defaults. Rejected monos: IBM Plex Mono,
Space Grotesk ("saturated AI-default faces").

---

## 4 · Layout & composition

- **Grid:** 12 columns, max-width **1200px**, gutter **24px**.
- **Vertical rhythm:** content sections `80px / 112px` padding (mobile / desktop);
  the closing section breathes more: `96px / 128px`; hero `64–96px` top. Inside a
  section: kicker → 16px → H2 → 48px → content. Generous between blocks, tight within.
- **Corners:** 2px radius maximum, anywhere. Butt caps, miter joins on every stroke —
  nothing on this brand rounds (one exception: the live-badge dot, §5).
- **Hairlines:** 1px, `steel-soft` on graphite / `line` on paper. They structure a page
  like a datasheet.
- **Surfaces:** graphite ground carries an optional graph-paper texture — two
  1px white lines at 2.5% opacity, **48px cell**. Long-form passages flip to paper.
- **The Zeichnungskopf (title block):** the recurring structural device — a bordered
  mini-table of mono labels and values (shipped set: PROJEKT / STANDORT / KONTAKT /
  STAND). Footer, section markers, the 404's status stamp. It carries data; it is
  **never a card**.
- **Drawing-frame coordinates:** pages may carry quiet A–D / 1–4 frame coordinates in
  mono at viewport edges (the hero ships one cell, A×1, desktop only).
- **Anchor offset:** sticky header is 64px; anchor targets use `scroll-margin-top: 5rem`.
- **Content structures:** diagrams, annotated lists, measured tables. **No same-size
  icon-card grids. Cards never nest.**

**Z-index registry** (the shipped stack): content < cursor ribbon + travelling rail
(30) < header + mobile menu (40) < transient effects (44–45) < skip link + the
drafting-sheet page-transition cover (50) < its falling-arrowhead debris (55) < film
grain, a full-screen texture overlay (60) < the custom crosshair cursor (70).

---

## 5 · Components

**Primary CTA.** Signal background, graphite text, weight 600, radius ≤2px.
Padding **24px horizontal × 14px vertical** (large: 28px × 16px), 12px gap to a drawn
arrow icon: a 2.5-weight shaft that **extends on hover** into a fixed filled head
(shaft scales 0.6→1; both parts travel 4.2 viewBox units on the icon's 24-unit grid,
so the joint holds). Magnetic cursor attraction on fine pointers, strength ~0.3
(fraction of pointer offset).

**Secondary CTA.** Same geometry, transparent, paper text, 1px border: resting
`steel-soft`, warming to `steel` on hover.

**Nav/header.** Sticky, graphite, 64px, hairline bottom border. Wordmark left (112%
grade, the period in signal). Links in `steel`, warming to paper, with a **drawn
underline**: background-gradient 0%→100% width, 240ms `cubic-bezier(0.16,1,0.3,1)`;
current page rests drawn. Language toggle: bordered mono chip `DE → EN` with a world
icon. Mobile menu: full-screen graphite sheet with graph texture, display-grade links.

**Forms.** Transparent inputs, 1px `steel-deep` border (3.10:1 — meets non-text
contrast), paper text, padding **12px vertical × ~14px horizontal**; border warms on
hover; the global signal
focus ring stays (never suppressed). Errors: message line in signal below the field +
the whole field border turns signal — **never a thick left tab** (banned). **Success
is calm:** the status line turns from steel to paper text. No green exists in this
system, no success icon, no toast. Consent checkbox: native, `accent-color: signal`.
Honeypot field off-screen for bots. Status line is `aria-live="polite"`.

**Data visualization** (the house dashboard grammar — Dashboards is a core offer):

- **Comparison bars:** baseline/before in `steel-deep`, improved/after in `signal` —
  the only two series colours. There is no multi-hue chart palette; more series =
  more steel tones, signal stays reserved for *the* number that improved.
- **KPI figures:** display-grade Archivo with `tabular-nums`, counting up 1.8s on
  entry; label beneath in the 11px mono annotation grade.
- **Sparkline:** 1.5-weight signal stroke over a signal fill at 0.07 opacity.
- **Live badge:** a small pulsing signal dot — deliberately the system's **only
  rounded element** — next to a mono label.
- **The sheet:** charts sit on a hairline-bordered panel with a mono header strip,
  stamped like a drawing („DEMO" plate); on paper ground, `line` hairlines.
- Fictional data is always labelled: „Musterfirma GmbH · fiktive Daten".

**Dimension row** (list-row hover idiom): 1px signal lines draw across the row from
opposite ends (420ms, the house curve) and a mono tick chip (10px, graphite plate)
fades in top-right after 180ms — a CAD selection, not a highlight.

**Footer.** A four-cell Zeichnungskopf (`dl` with hairline dividers): PROJEKT /
STANDORT / KONTAKT / STAND — 13px mono sentence-case values, then a legal bar
(©, Impressum, Datenschutz).

---

## 6 · Icon grammar

Inline SVG, zero JS, zero dependencies. The rules are binding:

- **Strokes:** butt caps, miter joins, never round. Weight **1.5 on a 24-unit grid**
  (2 on a 32 grid). **2.5 is the action weight** and belongs to the flow-line family
  alone: the schematic's signal line, its continuations, and the CTA arrow's shaft.
  No third weight exists.
- **Colour:** `stroke="currentColor"` only — steel-deep on paper, steel on graphite,
  **never signal**.
- **Size:** annotation grade 14–20px, inline in row/label grammar like part symbols on
  a drawing. Shipped: the four service part symbols are **uniform 16px** (dropped from
  20 so the part number stays primary); CTA arrow 18, plug 15, world 14.
- **Trigger:** a bare `data-icon-hover` attribute on the interactive parent; CSS fires
  on its `:hover` and `:focus-visible`. Never on the SVG — the link is the hit area.
- **Motion:** single-shot and reversible: **420ms `cubic-bezier(0.16,1,0.3,1)` in,
  200ms ease out** (the house curve — icons and dimension lines read as one event).
  Every rule carries the `prefers-reduced-motion` off-switch.
- **Rest state is the complete drawing:** draw-on-hover paths use `pathLength="1"` +
  dasharray and rest fully drawn, so no-JS, reduced-motion and static capture all show
  finished icons.
- **No icon without a real placement.** Add an icon only where a concrete use exists;
  never build inventory speculatively.

Shipped inventory: **gear** (NB-01; rotor indexes one tooth of eight — a mechanism
advancing, not a spinner) · **network Schaltbild** (NB-02; 2-3-1 node ranks, edges
redraw left→right — drawn in-house; the lucide brain is this category's rut and is
refused) · **dashboard** (NB-03; four panels rotate places) · **code brackets**
(NB-04; brackets spread ±1.5px) · **plug** (contact; halves close, gap ticks fade) ·
**world** (language; meridians redraw, globe still) · **CTA arrow** (the action line).

---

## 7 · The flow-line — the one memorable device

Muted process lines (1.5, steel-deep) converge into **one signal line (2.5)** ending in
a filled arrowhead — **two** inputs in the closing bookend, **three** in
the hero schematic (labelled inputs → a NEXBRIDGE-IT block → „läuft von selbst").
The hero draws itself on page load; the closing bookend draws on scroll. A pulse then
travels the signal line forever. It appears in the hero and the closing bookend — and
its *continuation* rides the whole page as a travelling rail that
plugs into the footer. Since D-050 the flow-line is **not** the logo: it is the brand's
behaviour, the mark is the brand's object. Everything else stays quiet.

Reusable closing signature (300×76):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 76" fill="none">
  <path d="M0 12 H130 C 190 12, 200 38, 248 38" stroke="#5B6770" stroke-width="1.5"/>
  <path d="M0 64 H130 C 190 64, 200 38, 248 38" stroke="#5B6770" stroke-width="1.5"/>
  <path d="M248 38 H292" stroke="#FF4D00" stroke-width="2.5"/>
  <path d="M300 38 L286 31 V45 Z" fill="#FF4D00"/>
</svg>
```

**The standalone mark is the folded glider (D-050), not a flow-line drawing.** A flat
sheet folded into something that flies by itself: signal `#FF4D00` body, paper
`#F7F5F0` underside, flat vector, ratio 1.692:1, no background. Ground must be dark —
on a light material put it in a graphite chip. Never recolour, outline, rotate, mirror,
skew or rebuild it from a raster; copy the geometry, do not redraw it. Favicon
(32×32, graphite ground) as shipped:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#14171A"/>
  <g transform="translate(1.5,7.43) scale(0.025326) translate(-447.62,-682.21)">
    <path fill="#FF4D00" d="M 1558.8 691.6 C 1563.7 689.6 1566.1 688.5 1571.5 687.8 C 1565.6 691.6 1560.1 694.3 1553.8 697.4 C 1328.9 827.3 1106.7 962 887.5 1101.4 C 785.7 1164.3 684.3 1227.8 583.2 1291.8 C 548.4 1314.1 516.4 1336.5 482.3 1359 L 750.9 1046.2 L 814.3 972.6 C 823.7 961.7 833.6 947.9 845 939 C 854 932 960.9 897 981.8 889.8 L 1349.4 763.9 C 1396.7 748.2 1443.8 732.1 1490.7 715.5 C 1509.5 709 1530.9 702.9 1549.1 695.6 L 1558.8 691.6 z"/>
    <path fill="#FF4D00" d="M 1576 682.2 C 1570.9 685.3 1565.2 686.4 1559.4 688 L 1553.1 689.4 C 1534.6 695.3 1512.3 700.9 1493.2 706.4 C 1462.1 715.3 1431 724.5 1400 733.8 L 1002.5 852.9 C 944.7 869.8 887.1 887.1 829.6 904.8 C 785.2 866.3 731.2 819.9 685.3 784.2 C 711.5 779 756.2 775.5 784.2 772.4 L 956.1 752.5 L 1558.3 683.5 C 1560.2 683 1573.3 682.4 1576 682.2 z"/>
    <path fill="#F7F5F0" d="M 1278.3 896.3 C 1311.2 907.9 1343.7 920.8 1376.7 932.3 C 1382.3 934.3 1388.5 936.5 1394 938.8 C 1329.7 971 1259.4 1002.1 1193.9 1033.1 L 725.6 1252.8 L 598.8 1312.5 C 577.6 1322.5 554.3 1332.9 533.5 1343.3 L 532.4 1341.3 C 569.9 1321.6 611.7 1296.4 648.5 1275 C 740.1 1221.5 831.1 1167.2 921.7 1112.1 L 1158.2 969.7 C 1197.5 946 1239.9 921.1 1278.3 896.3 z"/>
    <path fill="#FF4D00" d="M 1592.1 691.9 L 1592.7 692.7 C 1590.7 696.4 1586.2 701.5 1583.4 704.8 C 1522.5 778 1465.4 854.6 1405.3 928.3 L 1339.7 897.6 C 1328.1 891.8 1317.2 886.5 1305.4 881.3 C 1332.2 863 1360.3 845.9 1387.6 828.3 L 1503.7 753 C 1528.7 736.6 1571 710.5 1592.1 691.9 z"/>
    <path fill="#FF4D00" d="M 460.1 783.3 C 495.5 771.6 534.1 761 570.1 749.7 L 663.6 721.3 C 672.4 718.6 719.5 702.7 725.9 704.2 C 776.1 715.9 828.9 736.3 879.5 745.2 C 832.9 752 773.9 755.2 726.3 759.4 C 638.9 767.5 551.5 776.2 464.2 785.6 C 460.8 786.3 451.5 787.1 447.6 787.5 C 452.2 785.6 455.3 784.7 460.1 783.3 z"/>
  </g>
</svg>
```

Below ~20px the fold closes up; the 16px browser tab is a knowing exception, everything
we control stays at 20px or above.

Lockups: (1) mark + wordmark + accent period — the primary lockup, mark left, gap ≈ 0.5×
the mark height; (2) mark alone — avatar, app icon, stamp, browser tab; (3) wordmark
alone — running text, mobile header, legal documents; (4) wordmark in a thin-bordered
plate for stamps/invoices.

**OG/social image (1200×630)** — the shipped composition is the banner template:
hairline frame inset on graphite · the primary lockup (mark + wordmark + signal period)
top-left · paper
display headline at ~two-thirds height · a rule running steel on its left half into a
signal arrowhead on the right · the mono uppercase offer list along the bottom.
Reuse this composition for social assets; do not invent per-asset layouts.

---

## 8 · Motion

**Principles before values:**

1. **One engine, one clock.** On the production site that engine is GSAP, with
   smooth-scroll and every canvas riding its single ticker. In any other medium the
   rule transfers as: exactly one animation system, no competing frame loops, and the
   timings below.
2. **Reduced motion is law.** Every effect gates on `prefers-reduced-motion` and
   renders a finished state instead. Grain is the one exception that *stays* —
   dimmer, static — because it is texture, not motion.
3. **From already-visible layouts.** Markup ships visible; JS hides just before
   animating, so a failed script leaves a readable page, and the no-JS page is
   byte-identical.
4. **Scrubbed and reversible, never pinned.** No pinned scroll sequences (one was
   built, iterated four times, and removed).
5. **One ornamental loop:** the flow-line pulse. The demo sparkline also runs
   perpetually while on screen — it is simulated *live data*, not ornament („a demo
   that stands still proves nothing"), and pauses off-screen. Three quiet CSS texture
   cycles coexist (marquee band 38s, grain shift 700ms steps, live-dot 2.2s).
   Nothing else may loop.
6. **Two generative canvases, and two is the limit** (hero flow field + cursor ribbon).
7. **Decoration may never error.** WebGL effects are gated, caught, and fall back;
   route transitions are DOM/SVG *by decision* because WebGL-less visitors are real.

**The house curve:** in 420ms `cubic-bezier(0.16, 1, 0.3, 1)`, out 200ms ease.
Underlines 240ms of the same bezier. Reveals: rise 34px out of 6px blur, 1s
`expo.out`, stagger 0.085, triggered at 80% viewport. Drawn strokes: 1.2s `expo.out`.
Counters: 1.8s `expo.out`. The pulse: 2.2s `power1.inOut`, 3.2s rest between runs.
Smooth scroll: 1.05s exponential ease-out, anchor offset −80px.

**Signature choreography** (what makes the site feel engineered — all scrubbed, all
reversible, all reduced-motion-safe):

- **Hero:** headline characters rise out of blur (0.022s stagger); the schematic draws
  itself inputs→block→output; the pulse begins.
- **Route transitions:** a graphite **drafting sheet** slides across left→right
  (0.42s), a hairline frame draws, a title block stamps the target path + sheet
  number + date; the swap happens under cover; the sheet exits right (0.56s).
  Back/forward swaps bare; DE↔EN is a 250ms hairline scan with scroll carried over.
- **Hero dispersion:** leaving the hero disperses the flow field along its own
  vectors; scrolling back re-forms it. Route exits fire it as a 0.45s blast.
- **Section seams:** boundaries are drafting operations — seam rules draw along
  existing borders, ground-wipes confined to a 4.5rem band where graphite and paper
  trade, the marquee couples to scroll velocity (rate clamped 0.6–2.5), one
  ScrambleText moment. All furniture steel/line/graphite — zero signal.
- **Flowrail:** the schematic's arrowhead detaches on first scroll and rides the right
  gutter down the whole page as a continuing signal line, plugging into the footer;
  it yields to 0.2 opacity where sections own their signal; on route exit it retracts
  and the head bursts into 18–28 arrowheads that fall under gravity over the veil.
- **Wordmark drop:** once per page-load, the wordmark's period lifts off, ticks
  across the name (200ms per glyph — a measuring probe, not a bouncing ball),
  staircases down the hero copy, lands on the signal line's origin and **becomes the
  pulse**, trailing a fading afterimage (alpha 0.32→0). Bails cleanly on scroll,
  resize, or menu-open.

---

## 9 · Voice

**German first. Sie-Form, always.** Klar, präzise, ohne Buzzwords. Short sentences,
one idea each. Active voice. **Outcomes before technology. Numbers over adjectives:**
„40 Stunden pro Monat zurück" beats „Effizienzsteigerung". Natural German, never
translated English, no Denglisch. No exclamation marks in body copy. No Title Case.
No emoji on customer-facing surfaces.

**Banned words:** innovativ · ganzheitlich · revolutionär · disruptiv · Synergien ·
„KI-Lösung" as an empty phrase.

**The annotation register.** Labels and kickers read like a technical drawing, in mono,
uppercase, middot-separated: „Positionsliste · bekannte Störstellen" ·
„Leistungen · NB-01–NB-04" · „Vorgehen · Phase 1→3" · „Demo · Musterfirma GmbH ·
fiktive Daten" · „Über uns · gegründet 2026". Steps are stamped like revisions:
„01 · 30 Minuten", „05 · laufend". Problems are „Pos. A/B/C" in a parts list.
**The mono kicker is the standard section opener** — the closing section deliberately
omits it (see §10 on the eyebrow ban).

**Meta pattern:** `NexBridge-IT – <benefit clause>` (DE, en dash) /
`NexBridge-IT — <benefit clause>` (EN, em dash).

**Microcopy tone** (shipped examples): „Danke – Ihre Anfrage ist unterwegs. Wir melden
uns innerhalb eines Werktags." · „Bitte setzen Sie noch den Haken – ohne Zustimmung
dürfen wir Ihre Anfrage nicht bearbeiten." · Trust lines: „Antwort innerhalb eines
Werktags" / „Kein Verkaufsgespräch" / „Ihre Angaben bleiben bei uns".

**The evidence rule.** There are no clients, cases, logos or testimonials yet.
**Never fabricate proof.** The only permitted demonstration is a dashboard explicitly
labelled „Musterfirma GmbH · fiktive Daten". Never invent prices, legal text, client
names, or statistics — unknowns are marked `TBD:` and left alone.

---

## 10 · Hard bans (the complete list)

Purple/teal gradients · glassmorphism · 3D blobs · stock photos (handshakes, laptops) ·
Inter/DM Sans, Inter as display · gradient text · cards inside cards · more than one
signal element per viewport · the generic small-caps eyebrow habit (the house mono
kicker opens most sections by design — the ban means: no decorative eyebrow slapped on
*everything*; the closing section stays quiet) · same-size icon-card grids · coloured
left-borders over 1px · dark-with-neon-glow (offset+blur shadows only, no halos) ·
round caps/joins (sole exception: the live-badge dot) · Title Case in German · emoji
in customer copy · lorem ipsum · invented numbers, clients, testimonials · green
success states (success is calm paper text).

---

## 11 · Performance envelope

**Portable floors — apply to anything built in this brand:** zero third-party
requests (fonts self-hosted, no CDNs, no analytics by default — a GDPR commitment,
and adding any external request is a decision, not a detail) · WCAG AA contrast ·
works at 360px width · Lighthouse floors where applicable: desktop performance ≥95,
mobile performance ≥94, accessibility/SEO ≥95.

*Site context: the production homepage currently loads ≈223 KB raw JS plus a deferred
50 KB WebGL chunk, and its mobile score sits exactly on the 94 floor — zero headroom,
so anything added to the site itself gets measured first. These figures describe the
website, not a budget for external assets.*

---

## 12 · Starter tokens (copy-paste)

```css
:root {
  --color-graphite: #14171a;   /* primary ground */
  --color-graphite-2: #1b1f23; /* raised panels — hairline-bordered, never nested */
  --color-paper: #f7f5f0;      /* reading ground; text on graphite */
  --color-signal: #ff4d00;     /* THE accent — one element per viewport */
  --color-steel: #8b959e;      /* secondary text on graphite ONLY */
  --color-steel-deep: #5b6770; /* text on paper; borders everywhere */
  --color-steel-soft: #39424a; /* hairlines on graphite — never text */
  --color-line: #d9d4ca;       /* hairlines on paper — never text */

  --font-sans: 'Archivo Variable', system-ui, sans-serif; /* width axis 100–125 */
  --font-mono: 'Fragment Mono', ui-monospace, monospace;   /* regular only */
  --text-display: clamp(2.5rem, 6.5vw, 5.6rem);
  --text-h2: clamp(1.9rem, 3.6vw, 3rem);

  --ease-house: cubic-bezier(0.16, 1, 0.3, 1); /* 420ms in / 200ms ease out */
}

body { font-family: var(--font-sans); font-stretch: 100%;
       color: var(--color-paper); background: var(--color-graphite); }

/* The width axis is the hierarchy — these four classes ARE the type system. */
.type-display  { font-stretch: 125%; font-weight: 700; letter-spacing: -0.02em;
                 line-height: 1.04; text-wrap: balance; }
.type-wordmark { font-stretch: 112%; font-weight: 600; letter-spacing: -0.01em; }
.type-subhead  { font-stretch: 112%; font-weight: 600; }
.type-annot    { font-family: var(--font-mono); font-size: 0.6875rem;
                 letter-spacing: 0.08em; text-transform: uppercase; }

:focus-visible { outline: 2px solid var(--color-signal); outline-offset: 2px; }
::selection { background: var(--color-signal); color: var(--color-graphite); }
```

*Generated from the NexBridge-IT design sources (the brand definition, the website
specification, the site's token sheet and component code), 2026-08-23. Every value is
exact, none estimated. If this file conflicts with a newer copy of the kit, the newer
copy wins.*
