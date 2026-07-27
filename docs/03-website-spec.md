# 03 — Website Spec (nextbridge.io)

## Goal
One job: convert a Mittelstand decision-maker (sent by Partner A or via search) into an
Erstgespräch booking. Everything serves that.

## Tech (decided — D-002)
Astro 5 + Tailwind + MDX. Cloudflare Pages. Plausible (cookieless, EU). Contact form via
GDPR-compatible provider with explicit consent checkbox + double opt-in for anything recurring.
Language: bilingual from v1 (D-010) — DE default at `/`, EN at `/en/`, language switcher in
header, hreflang pairs on every page. All copy lives in i18n dictionaries; no hardcoded strings
in components. Fonts self-hosted via Fontsource — no Google Fonts CDN (GDPR).

## Sitemap
- `/` Start
- `/leistungen` (anchors: automatisierung, ki-agenten, dashboards, individualsoftware)
- `/vorgehen` (P1→P2→P3 packages, how we work)
- `/ueber-uns`
- `/kontakt` (form + direct email + optional booking link)
- `/impressum`, `/datenschutz` (required; footer-linked from every page)
- Later: `/cases/<slug>` (MDX per reference case)

## Homepage sections (order)
1. Hero: eyebrow (mono) · H1 "Prozesse, die von selbst laufen." · subline · CTA
   "Erstgespräch vereinbaren" · flow-line signature animation.
2. Problem mirror: 3 concrete Mittelstand pains, written in the client's language.
3. Leistungen: the 4 delivery forms, each with one concrete example outcome.
4. Vorgehen: P1→P2→P3 as a flow (uses flow-line motif) — this IS a sequence, numbering justified.
5. Proof: placeholder for cases/logos — `TBD: real proof only, never invented`. Until then: a
   small live demo dashboard (fake "Musterfirma GmbH" data, labeled as demo).
6. Über uns: two founders, real photos later, one paragraph each, "Made in Baden-Württemberg".
7. Final CTA + footer (Impressum, Datenschutz, contact).

## Copy rules
See docs/02-brand.md voice. Every section: claim → concrete example → number where honest.
No section may ship with lorem ipsum; use `TBD:`-marked realistic drafts via copywriter-de.

## Quality bar (qa-reviewer enforces)
Lighthouse ≥95 (perf/a11y/SEO), WCAG AA contrast, works at 360px, semantic HTML with `lang="de"`,
meta title+description per page, OG image, sitemap.xml + robots.txt, all images with dimensions +
lazy loading, prefers-reduced-motion respected, no console errors, no third-party requests except
Plausible + form provider.

## Legal notes
Impressum + Datenschutzerklärung content: generate skeleton, fill via reputable generator, human
review before launch. Contact form stores nothing beyond transmission; state processing purpose.
