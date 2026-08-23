---
id: state
title: Where things stand
type: state
status: active
owner: partner-b
updated: 2026-08-23
depends_on: [vision, offer, brand, website-spec, decisions, agent-system]
decisions: [D-016, D-018, D-022, D-023, D-025, D-036, D-037, D-038, D-039, D-040, D-041, D-042, D-043, D-044, D-045, D-046, D-049, D-050, D-051, D-052, D-053, D-054]
---

# Where things stand

**This is the session bootstrap.** It holds current state only — no history, no rationale. If you
need *why*, read [[decisions]]. If you need *which document*, read [INDEX.md](INDEX.md).
Everything here is traceable to a file or a D-entry; nothing is inferred.

Last reviewed: **2026-08-23**

## The venture in five lines

**NexBridge-IT** builds software that runs business processes by itself for the German
Mittelstand: Automatisierung, KI-Agenten, Dashboards, Individualsoftware. Positioning: *built in
Germany, GDPR-first, engineering-grade*. Two founders — **Partner A** (German: sales, network,
client relationships, legal/admin) and **Partner B** (technical: solution design, delivery, this
repo). Currently in the **freelance phase**: no employees, no outsourcing, no clients yet.
Details → [[vision]].

## Commercial state

| | |
|---|---|
| Clients | **0.** No cases, no logos, no testimonials. Never fabricate proof. |
| Public price | **P1 Prozess-Audit — 295 € Festpreis.** The only price on the website. |
| P2 Umsetzungs-Sprint | No public price. "Angebot nach Umfang", costed from the audit. |
| P3 Betrieb & Ausbau | No public price. "Angebot nach Bedarf". |
| Internal floor prices | **Not agreed.** `TBD:` in [[offer]] — blocks consistent quoting. |

All prices netto zzgl. USt. The client always gets a fixed-price Angebot before build starts.
Any audit price other than 295 € is superseded — D-007's figures are history. Details → [[offer]].

## Website state

Live on **nexbridge-it.com** — domain registered to us, confirmed by the founder (D-025).
Deployed as a Cloudflare static-asset Worker (D-022). Astro 7 + Tailwind 4 (D-023).
Bilingual from day one: German at `/`, English at `/en/`. Navigation is client-side behind a
drafting-sheet transition veil (D-039); the motion system is documented in `DESIGN.md`.

**Twelve pages plus two vCard endpoints exist**: the six original routes (`/`, `/en/`,
`/impressum`, `/datenschutz`, `/en/impressum`, `/en/datenschutz`) plus the NB-VK digital
business cards (D-049) — `/karte`, `/karte/peter-knopp`, `/karte/manush-vaghani`, their EN
mirrors under `/en/card/`, and static `/karte/<slug>.vcf` endpoints. Card routes are noindex
and sitemap-excluded: handouts, not landing pages. The nav links `#leistungen`, `#vorgehen`,
`#ueber-uns`, `#kontakt` are homepage anchors, not
pages — temporary, "until dedicated subpages exist"
(`website/src/components/Header.astro:17`). The spec sitemap lists them as planned pages.

The card routes are also the **NFC destination**: tags carry `nexbridge-it.com/karte/<slug>`,
the same URL the printed QR codes encode, and never a vCard record (D-054). The digital plate
carries the company mark (D-050) engraved in one ink in the `.card-mark` slot (D-051), and the
print masters in `print/visitenkarte/` (NB-VK-01/02) now carry the same mark in full brand
colours on both fronts (D-053) — digital and physical are reconciled. Printing is gated on the
DPMA trademark check — open item 5.

The plate's material is a founder override (D-054): full-range metallic, a live 26s drift that
rests under `prefers-reduced-motion`, and the house texture laws (light-only pools, crush and
opacity ceilings, AA discipline for small ink) suspended **on that surface only** — small ink on
the plate can fall below 4.5:1 in the darkest pools. A knowing, logged trade; the site's contrast
law stands everywhere else. Each card carries its own phone number (`cards.ts` `phoneE164`).

Three single sources you must not work around:

- Brand name and URLs → `website/src/config/site.ts`
- Design tokens → `website/src/styles/global.css` `@theme`
- Every user-visible string → `website/src/i18n/ui.ts` (type-enforced: EN cannot drift from DE)

Details → [[website-spec]], visual world → `DESIGN.md`.

The brand has a **logo mark** since D-050: the folded glider. It **ships** in the favicon, the
`apple-touch-icon`, the `og.png` social card and the header lockup (from `sm` up — phones keep the
wordmark alone), and is live on nexbridge-it.com. Canonical geometry sits in `website/public/logo-mark.svg`,
`website/public/favicon.svg` and `website/src/components/Mark.astro`; they must not drift.
The flow-line was *not* retired — it stays the motion signature (hero schematic, flowrail, seams).

An official **animated wordmark sting** exists since D-046 — Higgsfield-generated (16:9, plus 1:1
and 9:16 cuts), resolving onto the wordmark lockup, which ends in the CTA-grammar arrowhead.
Off-site collateral only (video intros, social). It predates the mark, so it does not show the
glider yet; the mark's own animation is drafted but **not chosen** (three takes exist).

## Open items

Ranked. Owner in brackets.

1. **Legal pages need a lawyer's read** [founders] — both are filled with the founder's own
   documents (D-036) and no longer block traffic. Three points were left for a professional
   rather than guessed at: the Drittland section now that Cloudflare is named, whether the
   Cloudflare AVV is actually accepted in the account, and the Impressum naming two
   Geschäftsführer alongside "Einzelunternehmer". The English versions are convenience
   translations and are unreviewed.
2. **Analytics not installed** [partner-b] — `plausibleDomain` and `cfAnalyticsToken` in
   `site.ts` are both empty; the site makes zero third-party requests. D-013 flags this as
   do-before-driving-traffic.
3. **Contact form has no endpoint** [founders] — `formEndpoint` is empty, so the form falls back
   to the visitor's mail client. Enquiries arrive but are unmeasurable.
4. **Internal P2/P3 floor prices not agreed** [founders] — see the table above.
5. **DPMA trademark check** [partner-a] — must precede any printing or first public post.
   Should include the generated-mark provenance question in one pass (origin recorded in D-050,
   consequence logged in D-051).
6. **`bookingUrl` unset** [founders] — CTAs point at `#kontakt` instead.
7. **`nexbridge-it.de` status unrecorded** [founders] — D-016 recommended it as the stronger
   choice for Mittelstand buyers. Not blocking; log a D-entry if it gets registered.
8. **Mark animation not chosen** [founders] — the glider has no animated sting yet; three takes
   exist and none is picked, and D-046's animated wordmark predates the mark, so it shows the
   flow-line lockup rather than the glider and needs a refresh once one is chosen.
9. **Mobile Lighthouse performance 89–90** [partner-b] — below the 94 floor CLAUDE.md and D-043
   set. Measured across four consecutive runs during the D-050 gate; **pre-existing and unrelated
   to the mark** (font loading). Ranked here, not higher, only because no traffic reaches the site
   yet — it moves up the moment it does.
10. **On-light cut of the mark undecided** [partner-b] — the underside facet is `paper`, so the
   mark needs a graphite chip on light material until a light-ground variant exists. Gates print.
11. **The card copies of the mark sit outside the drift guard** [partner-b] — `npm run logo`
   checks the three canonical vector sources only; the card plate and the print master carry
   their own 0-origin copy, and the plate's copy still has one sub-resolvable path the canonical
   mark does not. `TBD:` guard them or replace them — see D-051, before the next card round.

### Known defects (technical, none blocking)

- The 404 is German-only and cannot be otherwise under the current Cloudflare config (D-024);
  an English visitor at `/en/tippfehler` gets the German page.
- Below the `md` breakpoint the homepage h1 renders as „Prozesse, dievon selbst laufen." —
  `Hero.astro` writes `Prozesse, die<br class="hidden md:block">von selbst laufen.`, so when the
  break is hidden the two words collide. Pre-existing on `main`, found during the D-050 gate; the
  fix is one space before the `<br>`, and it touches customer-facing German, so it goes through
  `copywriter-de` on its own branch.
- One card page dials two numbers. The „Tel." row and the .vcf follow the person
  (`cards.ts` `phoneE164`, D-054), but the second-rank „Anrufen" button in
  `website/src/components/CardPage.astro:208` still reads `SITE.phoneE164`, so on Manush
  Vaghani's card it calls the venture line. One-line fix, not taken here because this pass is a
  merge reconciliation.

## Blocked / pending

**D-005 — legal vehicle** is the only `PENDING` decision. **Do not raise it** — see D-008.
No current work depends on it.

## Working rules that bite most often

Full constitution in `CLAUDE.md`. The four that catch people out:

1. **Never invent** prices, legal text, client names, testimonials, or statistics. Unknowns are
   marked `TBD:` and left alone.
2. **German customer-facing copy goes through `copywriter-de`.** Sie-Form, no Title Case.
3. **UI changes go through `design-critic`** before commit.
4. **Lasting decisions get appended to [[decisions]] in the same commit.** The log is
   append-only — supersede, never edit history.

## In flight

Nothing. Everything is merged into `main`, the only long-lived branch: the logo mark
(D-050) — favicon, apple-touch-icon, og.png, header lockup, `Mark.astro` and `npm run logo` —
the animated wordmark sting (D-046), the wordmark drop (D-047), and the complete NB-VK card
system: the digital cards (D-049), the mark engraved on the card plate (D-051), the plate
recomposition (D-052), the mark on the print fronts (D-053) and the founder's full-metallic
override with per-person phone numbers and the NFC hosting decision (D-054).

## Next

The open items above, in order. The founder has signalled that a libraries-and-design-
principles brief is coming, which will land in `DESIGN.md`.
