---
id: website-spec
title: Website spec
type: spec
status: active
owner: partner-b
updated: 2026-09-16
depends_on: [offer, brand]
decisions: [D-002, D-010, D-013, D-017, D-022, D-023, D-043, D-056, D-057, D-062, D-063, D-064]
---

# 03 — Website Spec (nexbridge-it.com)

## Goal
One job: convert a Mittelstand decision-maker (sent by Partner A or via search) into an
Erstgespräch booking. Everything serves that.

## Tech (D-002, superseded on three points by D-022, D-023 and D-063)
**Astro 7 + Tailwind 4 + MDX** — D-002 said Astro 5; `website/package.json` is authoritative.
Deployed as a **Cloudflare static-asset Worker** (`website/wrangler.jsonc`, D-022), not Pages;
custom domains are attached in the dashboard, not via `routes`. Analytics are **first-party**
(D-063, supersedes the Plausible plan): a cookieless beacon posts to `/api/hit` on the site's own
Worker, rows live in D1, and `/statistik` reads the aggregates behind a key. **Live since
2026-09-16** (D-064): `statsEnabled` in `src/config/site.ts` is `true` and is coupled to
Datenschutz §10, which describes the mechanism. The `plausibleDomain` / `cfAnalyticsToken`
slots remain as the two off-the-shelf fallbacks.
Contact form via GDPR-compatible provider with explicit consent checkbox + double opt-in for
anything recurring.
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
- `/teaser` (+ `/en/teaser`) — two advertisement films behind a 4-digit courtesy gate,
  nav-linked. **Built and deployed** (2026-09-15), unlike the four entries above it, which are
  still homepage anchors. The videos are the one path served by a Worker script (D-062). Films are self-hosted so the zero-third-party-request property holds (D-056).
- `/statistik` (+ `/en/stats`) — the founders' stats dashboard (D-063): `noindex`, excluded
  from `sitemap-index.xml` (`astro.config.mjs` filter), in no nav, key-gated. Internal, not a
  visitor route. Live — see Tech above; status lives in STATE.
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
See [[brand]] voice. Every section: claim → concrete example → number where honest.
No section may ship with lorem ipsum; use `TBD:`-marked realistic drafts via copywriter-de.

## Quality bar (qa-reviewer enforces)
Lighthouse ≥95 (a11y/SEO/desktop perf) and ≥94 mobile perf (re-based by D-043 — this line said
≥95 across the board until 2026-09-15), WCAG AA contrast, works at 360px, semantic HTML with `lang="de"`,
meta title+description per page, OG image, sitemap.xml + robots.txt, all images with dimensions +
lazy loading, prefers-reduced-motion respected, no console errors, no third-party requests except
the form provider — the stats beacon is same-origin (D-063).

## Legal notes
Impressum + Datenschutzerklärung content: generate skeleton, fill via reputable generator, human
review before launch. Contact form stores nothing beyond transmission; state processing purpose.
