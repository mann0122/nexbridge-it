# Product

<!-- impeccable:product-schema 1 -->
<!-- Derived from docs/00-vision.md, docs/01-offer.md, docs/02-brand.md, docs/05-decisions.md
     (founder-authored, 2026-07-26). No interview needed: docs answered the material questions.
     Inferred-not-confirmed facts are marked [inferred]. -->

## Platform

web

## Users

Primary: German Mittelstand decision-makers (Geschäftsführer, operations leads; companies
~10–250 employees), reached via Partner A's network or search. Situation: drowning in manual
processes — Excel as database, copy-paste between systems, reporting takes days. Skeptical of
hype, allergic to buzzwords, decide on trust and concrete numbers. Reading context: office
desktop and mobile, daytime [inferred].

## Product Purpose

NexBridge-IT builds software that runs business processes by itself: Automatisierung, KI-Agenten,
Dashboards, Individualsoftware. The website's one job: convert a visiting decision-maker into
an Erstgespräch booking.

## Positioning

"Built in Germany, GDPR-first, engineering-grade." The moat a competitor cannot truthfully copy:
your data and your developer are in Germany — no outsourced delivery, no US-cloud defaults.
The name: the bridge from how you work today to what runs by itself tomorrow.

## Operating Context

Sales flow: Partner A brings warm leads → website validates credibility → Erstgespräch →
P1 Prozess-Audit (295 € Festpreis, the only public price) → P2 Umsetzungs-Sprint (Angebot nach
Umfang) → P3 Betrieb & Ausbau (Angebot nach Bedarf). Prices per D-018; D-007's 1.900 € /
7.500–12.000 € / 1.200 €-per-month figures are superseded and must not be quoted.
Site is bilingual: DE default at `/`, EN at `/en/` (D-010).

## Capabilities and Constraints

Astro static site on a Cloudflare static-asset Worker (D-022), Plausible (cookieless, specced but
not yet installed), no tracking cookies, self-hosted fonts, no third-party requests beyond form
provider. Lighthouse ≥95 all categories, WCAG AA, works at 360px. Undecided: contact form
provider, and whether the domain registration is secured (see docs/STATE.md open item 1).

## Brand Commitments

Name: **NexBridge-IT** — final per D-016, CamelCase wordmark with a signal-orange period.
Palette pinned
(D-003): graphite #14171A, paper #F7F5F0, signal #FF4D00 (rationed: one accent element per
viewport), steel #5B6770. Signature element: the **flow-line** — 2 muted process lines + 1 signal
line converging/branching, scroll-drawn, reduced-motion respected. Voice: klar, präzise, Sie-Form,
outcomes before technology, numbers over adjectives. Banned words: innovativ, ganzheitlich,
revolutionär, disruptiv, Synergien, empty "KI-Lösung". Banned visuals: purple/teal gradients,
glassmorphism, 3D blobs, stock photos, Inter as display, cards in cards, Title Case in German.

## Evidence on Hand

None yet — no clients, cases, logos, or testimonials. NEVER fabricate proof. Until real cases
exist: a clearly labeled demo dashboard ("Musterfirma GmbH", marked as demo) is the only
permitted demonstration. Prices in docs/01-offer.md are real and citable.

## Product Principles

1. Trust before flash: every claim concrete, every number honest, demos labeled.
2. The site demonstrates the craft it sells — precision engineering, visible in execution.
3. One conversion path: every section serves the Erstgespräch booking.
4. German-first in language and cultural credibility; English as equal citizen (D-010).
5. Quiet system, one signature: the flow-line is the single memorable device.

## Accessibility & Inclusion

WCAG AA contrast, keyboard focus visible, prefers-reduced-motion respected, semantic HTML with
correct `lang`, German alt texts on DE pages.
