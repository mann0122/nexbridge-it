---
id: brand
title: Brand
type: knowledge
status: active
owner: partner-b
updated: 2026-08-01
depends_on: [vision]
decisions: [D-003, D-016]
cites_history: [D-001, D-014]
---

# 02 — Brand

## Name
**NexBridge-IT** (decided 2026-07-27 per D-016, superseding the working names Klarfluss and
NextBridge). Meaning: the bridge from how a company works today to what runs by itself tomorrow —
and the bridge between systems that do not talk to each other. Both readings are
literally what the hero schematic draws.
Wordmark: `NexBridge-IT` in CamelCase with a signal-orange period (#FF4D00).

Domain: the site is live on **nexbridge-it.com** — the single source is
`website/src/config/site.ts`, not this file.
`TBD:` [[research-domains]] recorded nexbridge-it.com as TAKEN on 2026-07-27, the day before the
site went live on it. Founders must confirm which registration actually holds, and whether
nexbridge-it.de — free per D-016 and the stronger choice for Mittelstand buyers — was secured.
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
| signal      | #FF4D00  | ONE accent: CTAs, active states, flow-line |
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
(draws left→right, respects prefers-reduced-motion). Appears in hero, section dividers, and the
logo mark. This is the one memorable device — everything else stays quiet.

## Logo directions
1. Wordmark `NexBridge-IT` with accent period; flow-line runs under the wordmark.
2. Standalone mark: two muted lines converging into one signal line — the bridge,
   and the favicon (currently shipped in website/public/favicon.svg).
3. Wordmark inside a thin-bordered plate for stamps/invoices.

## Anti-patterns (design-critic enforces)
Purple/teal gradients; glassmorphism; 3D blobs; stock photos of handshakes/laptops; Inter as
display; cards nested in cards; more than one accent color per viewport; Title Case in German copy;
emoji in customer-facing surfaces.
