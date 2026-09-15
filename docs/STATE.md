---
id: state
title: Where things stand
type: state
status: active
owner: partner-b
updated: 2026-09-15
depends_on: [vision, offer, brand, website-spec, decisions, agent-system]
decisions: [D-016, D-018, D-022, D-023, D-025, D-036, D-037, D-038, D-039, D-040, D-041, D-042, D-043, D-044, D-045, D-046, D-049, D-050, D-051, D-052, D-053, D-054, D-055, D-056, D-057, D-058, D-059, D-060, D-061, D-062]
cites_history: [D-007]
---

# Where things stand

**This is the session bootstrap.** It holds current state only — no history, no rationale. If you
need *why*, read [[decisions]]. If you need *which document*, read [INDEX.md](INDEX.md).
Everything here is traceable to a file or a D-entry; nothing is inferred.

Last reviewed: **2026-09-15**

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
Deployed as a Cloudflare static-asset Worker (D-022) with one script, `website/worker/index.js`,
that serves only the teaser videos — as `206` slices, which Safari needs (D-062). Astro 7 +
Tailwind 4 (D-023).
Bilingual from day one: German at `/`, English at `/en/`. Navigation is client-side behind a
drafting-sheet transition veil (D-039); the motion system is documented in `DESIGN.md`.

**Fourteen pages plus two vCard endpoints exist**: the six original routes (`/`, `/en/`,
`/impressum`, `/datenschutz`, `/en/impressum`, `/en/datenschutz`), the gated teaser page
(`/teaser`, `/en/teaser` — D-056), plus the NB-VK digital business cards (D-049) — `/karte`,
`/karte/peter-knopp`, `/karte/manush-vaghani`, their EN mirrors under `/en/card/`, and static
`/karte/<slug>.vcf` endpoints. Card routes are noindex and sitemap-excluded: handouts, not
landing pages. The nav links `#leistungen`, `#vorgehen`, `#ueber-uns`, `#kontakt` are homepage
anchors, not pages — temporary, "until dedicated subpages exist"
(`website/src/components/Header.astro:19`). The spec sitemap lists them as planned pages.
`Teaser` is the exception: a real page, and the first one in the nav (D-057).

`/teaser` holds the two advertisement films behind a 4-digit courtesy gate (D-056) — a
blurred silent loop on hover, the full film after a code. **Both films are in the repo**
(D-059): `website/public/teaser/` carries the two code-named films, the posters and the
preview loops, built by `ops/teaser-assets.bat` / `npm run teaser:assets` from the founder's
source films in the gitignored `ops/teaser-src/`. Teaser 1 is the Rathaus film (NBIT1, 2:10,
fitted to 720p for the 25 MiB cap), Teaser 2 the general film (NBG1, 1:20, 1080p). The codes
are in no file; the founders hold them. Rotating a code means re-running the script, which
retires the old file.
The *page* is public: nav-linked, `Allow: /` in `robots.txt`, and emitted into
`sitemap-index.xml` like every other route — D-056's "not indexed" is about the film URLs,
which appear nowhere until a correct code derives them, not about `/teaser` itself.

The card routes are also the **NFC destination**: tags carry `nexbridge-it.com/karte/<slug>`,
the same URL the printed QR codes encode, and never a vCard record (D-054). The **physical
carrier is final** (D-055): the CR80 NFC card, master `print/visitenkarte-nfc/nfc-cr80.html`
(NB-VK-01/02) — founder-picked design D on the back (glider 34 mm + signal wordmark with paper
period on the dark metallic ground) and the Zeichnungskopf contact side on a light pastel-peach
metallic ramp, with no revision date on the plate. The 85 × 55 paper master
(`print/visitenkarte/`, D-053) is retained but superseded as the active physical carrier. The
digital plate carries the company mark (D-050) engraved in one ink in the `.card-mark` slot
(D-051); card revision is unified at 09/2026 (`cards.ts` `CARD_REVISION`). Printing is gated
on the DPMA trademark check — open item 5 — plus the mandatory both-sides machine proof (D-055).

The plate's material is a founder override (D-054): full-range metallic, a live 26s drift that
rests under `prefers-reduced-motion`, and the house texture laws (light-only pools, crush and
opacity ceilings, AA discipline for small ink) suspended **on that surface only** — small ink on
the plate can fall below 4.5:1 in the darkest pools. A knowing, logged trade; the site's contrast
law stands everywhere else. Each card carries its own phone number (`cards.ts` `phoneE164`).

Four single sources you must not work around:

- Brand name and URLs → `website/src/config/site.ts`
- Design tokens → `website/src/styles/global.css` `@theme`
- Every user-visible string → `website/src/i18n/ui.ts`. EN cannot drift from DE — but only
  because of the `AssertKeys` guard at the foot of that file, and only when someone runs
  `npm --prefix website run check`. The `satisfies` line alone never enforced it (D-058).
- Teaser asset identity → `website/src/config/teasers.ts` (D-057; file identity only, no
  strings, no codes)

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
   documents (D-036) and no longer block traffic. Four points were left for a professional
   rather than guessed at: the Drittland section now that Cloudflare is named, whether the
   Cloudflare AVV is actually accepted in the account, the Impressum naming two
   Geschäftsführer alongside "Einzelunternehmer", and — new with D-056 — whether §8
   *"Cookies und ähnliche Technologien"* (`website/src/i18n/legal.ts:144`) has to name the
   teaser's `sessionStorage` entry. Its text currently denies cookies only, which stays
   literally true; the heading covers similar technologies, and § 25 TDDDG is a lawyer's
   call, not ours. `TBD:` legal review — no one here may draft that sentence (CLAUDE.md
   rule 4). The English versions are convenience translations and are unreviewed.
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
   mark needs a graphite chip on light material until a light-ground variant exists. Does not
   gate the CR80 card (D-055), whose mark sits on the dark back only; gates any future
   light-ground application.
11. **The card copies of the mark sit outside the drift guard** [partner-b] — `npm run logo`
   checks the three canonical vector sources only; the card plate and both print masters
   (paper, and CR80 per D-055) carry their own 0-origin copy, and the plate's copy still has
   one sub-resolvable path the canonical mark does not. `TBD:` guard them or replace them —
   see D-051, before the next card change.

### Known defects (technical, none blocking)

- The 404 is German-only and cannot be otherwise under the current Cloudflare config (D-024);
  an English visitor at `/en/tippfehler` gets the German page.
- Below the `md` breakpoint the homepage h1 renders as „Prozesse, dievon selbst laufen." —
  `Hero.astro` writes `Prozesse, die<br class="hidden md:block">von selbst laufen.`, so when the
  break is hidden the two words collide. Pre-existing on `main`, found during the D-050 gate; the
  fix is one space before the `<br>`, and it touches customer-facing German, so it goes through
  `copywriter-de` on its own branch.
- `npm --prefix website run check` reports four `'heroArrow' is possibly null` errors in
  `website/src/scripts/flowrail.ts` (D-044). Pre-existing, not runtime bugs — but they are why
  `check` is not yet wired into `build` (D-058). Clear them, then gate the build on it.

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

Nothing. Everything is merged into `main`, the only long-lived branch: the logo mark (D-050),
the animated wordmark sting (D-046), the wordmark drop (D-047), the complete NB-VK card system
(D-049, D-051…D-055) and the gated teaser page with both films (D-056…D-062). The teaser was
built in the cloud against an older `main` and numbered D-049…D-051 there; those entries were
renumbered to D-056…D-058 when `main` was merged in. **Deployed**: nexbridge-it.com serves the
teaser page and both films since 2026-09-15 (deploys are manual — `npx wrangler deploy` from
`website/`, D-022). Not yet seen on a real Safari — the first founder with an iPhone should
open `/teaser`, enter a code and confirm the film plays (D-062).

## Next

The open items above, in order. The founder has signalled that a libraries-and-design-
principles brief is coming, which will land in `DESIGN.md`.
