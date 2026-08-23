---
id: brand
title: Brand
type: knowledge
status: active
owner: partner-b
updated: 2026-08-23
depends_on: [vision]
decisions: [D-003, D-016, D-025, D-046, D-050]
cites_history: [D-001, D-014]
---

# 02 — Brand

## Name
**NexBridge-IT** (decided 2026-07-27 per D-016, superseding the working names Klarfluss and
NextBridge). Meaning: the bridge from how a company works today to what runs by itself tomorrow —
and the bridge between systems that do not talk to each other. Both readings are
literally what the hero schematic draws.
Wordmark: `NexBridge-IT` in CamelCase with a signal-orange period (#FF4D00).

Domain: **nexbridge-it.com**, registered to us (D-025). The single source is
`website/src/config/site.ts`, not this file.
`TBD:` DPMA check + social handles before first public post. Part numbers use the `NB-` prefix.

## Voice
Klar, präzise, ohne Buzzwords. Sie-Form. Short sentences. Outcomes before technology.
Banned words in customer copy: innovativ, ganzheitlich, revolutionär, disruptiv, Synergien,
"KI-Lösung" as empty phrase. Numbers over adjectives. We show diagrams and demos, not stock photos.

## Palette — ACTIVE: A (Signal) — decided, see D-003

### A — Signal (dark, engineering)
| Token       | Hex      | Use |
|-------------|----------|-----|
| graphite    | #14171A  | primary background |
| paper       | #F7F5F0  | text on dark, light sections background |
| signal      | #FF4D00  | ONE accent: logo lockup, CTAs, active states, flow-line |
| steel       | #5B6770  | secondary text, borders, muted UI |
Rules: signal is rationed — one accent element per viewport. Long-form content sections flip to
paper background with graphite text so the site is not wall-to-wall dark. CTA = signal bg +
graphite text (AA for large/bold text).

## Typography — FINAL (picked 2026-07-26 via Impeccable procedure, see DESIGN.md)
- Display + body: **Archivo Variable** (self-hosted). Display at width 125% (expanded),
  weight 700, tight leading; body at width 100%, weight 400. Two weights max in UI.
- Data/labels: **Fragment Mono** (regular) — annotations, diagram labels, kicker, numbers.
  (IBM Plex Mono rejected: saturated AI-default face; Space Grotesk likewise.)
- Banned stays banned: Inter, DM Sans, generic defaults.

## Signature element
The **flow-line**: 2 muted process lines + 1 accent line converging/branching, animated on scroll
(draws left→right, respects prefers-reduced-motion). Appears in the hero schematic, the flowrail
(D-044) and the CTA arrow (D-043); the D-041 section seams share its left→right grammar but
carry no signal — they are drafting rules, not the flow-line. Since D-050 it is no longer the logo: the flow-line is the brand's *behaviour*, the mark
is the brand's *object*. This is still the one memorable on-page device — everything else stays quiet.

## Logo directions

**The mark (D-050): the folded glider.** A flat sheet folded into something that flies by itself.
Two colours only — signal `#FF4D00` body, paper `#F7F5F0` underside — flat vector, butt-clean
edges, ratio 1.692:1, no background. Canonical files, which must never drift apart:

Three **vector sources** carry the geometry and must stay byte-identical (`npm run logo` fails if
they drift); two **rasters** are rendered from them and must be re-exported whenever it changes:

| Kind | Use | File |
|---|---|---|
| vector | Press / partner asset, transparent | `website/public/logo-mark.svg` |
| vector | Browser tab, graphite ground | `website/public/favicon.svg` |
| vector | In-app (tokens, never raw hex) | `website/src/components/Mark.astro` |
| raster | iOS home screen | `website/public/apple-touch-icon.png` |
| raster | Social card | `website/public/og.png` |

Lockups:
1. **Primary lockup** — mark + wordmark `NexBridge-IT` + signal period, mark left, centred on the
   wordmark's line box, gap ≈ 0.5× the mark's height. Shipped in the site header from `sm` up;
   below that the wordmark stands alone — a composition choice with the measurement behind it in
   D-050, not a law of nature.
2. **Mark alone** — avatar, app icon, stamp, and the browser tab. Below ~20px the folded underside
   closes up; the 16px tab icon is a knowing exception, because a tab icon is a recognition cue,
   not a reproduction. Everything we control stays at 20px or above.
3. **Wordmark alone** — running text, mobile header, legal documents.
4. Wordmark inside a thin-bordered plate for stamps/invoices (unchanged).
5. **Animated sting lockup (D-046)** — off-site collateral only (video intros, social): the
   flow-line ruling right into the CTA-grammar filled arrowhead + wordmark + signal period. It
   predates the mark and does not show the glider; it needs a refresh once the mark's own
   animation is chosen.

**Ground: graphite.** The underside facet is `paper`, so on a paper ground the fold stops reading
and the mark drops to one colour. On light material, place it in a graphite chip. An on-light cut
(underside in graphite or steel-deep) is `TBD:` — decide it before any print run.

Clear space: one mark-height on every side **when the mark sits in someone else's layout**. Our own
containers have their own artboards: inside the lockup the gap is 0.5×, and square icon containers
hold the mark at ~90% width, optically centred. Never recolour, outline, rotate, mirror, skew, add
effects or a drop shadow, re-stack the facets, place it on a busy ground, or rebuild it from a
raster — always use the vector sources above.

`TBD:` DPMA check still gates printing and the first public post (see [[state]]).

## Anti-patterns (design-critic enforces)
Purple/teal gradients; glassmorphism; 3D blobs; stock photos of handshakes/laptops; Inter as
display; cards nested in cards; more than one accent color per viewport; Title Case in German copy;
emoji in customer-facing surfaces.
