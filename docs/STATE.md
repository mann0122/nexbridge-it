---
id: state
title: Where things stand
type: state
status: active
owner: partner-b
updated: 2026-10-19
depends_on: [vision, offer, brand, website-spec, decisions, agent-system]
decisions: [D-008, D-009, D-013, D-016, D-018, D-022, D-023, D-024, D-025, D-031, D-036, D-039, D-043, D-046, D-048, D-049, D-050, D-051, D-053, D-054, D-055, D-056, D-057, D-058, D-059, D-062, D-063, D-064, D-065, D-066, D-067, D-068, D-069, D-070, D-071]
cites_history: [D-007]
---

# Where things stand

**This is the session bootstrap.** It loads into every session next to `CLAUDE.md`, so it holds
current state only: what is live and where to read about it. *Why* is in [[decisions]], *which
document* is in [INDEX.md](INDEX.md). `npm run kb` fails when it outgrows its line budget (D-070).
Last reviewed: **2026-10-19**.

## The venture

**NexBridge-IT** builds software that runs business processes by itself for the German
Mittelstand (Automatisierung, KI-Agenten, Dashboards, Individualsoftware); *built in Germany,
GDPR-first, engineering-grade*. **Partner A** (German): sales, network, clients, legal/admin.
**Partner B** (technical): delivery, this repo. Freelance phase: no employees, no outsourcing,
no clients yet. Details → [[vision]].

## Commercial state

| | |
|---|---|
| Clients | **0.** No cases, no logos, no testimonials. Never fabricate proof. |
| Public price | **P1 Prozess-Audit — 295 € Festpreis.** The only price on the website. |
| P2 Umsetzungs-Sprint | No public price. "Angebot nach Umfang", costed from the audit. |
| P3 Betrieb & Ausbau | No public price. "Angebot nach Bedarf". |
| Internal floor prices | **Not agreed.** `TBD:` in [[offer]] — blocks consistent quoting. |

All prices netto zzgl. USt. The client always gets a fixed-price Angebot before build starts.
Any audit price other than 295 € is superseded — D-007's figures are history (D-018). Details → [[offer]].

## Website state

Live on **nexbridge-it.com** (D-025): Astro 7 + Tailwind 4 (D-023) as a Cloudflare static-asset
Worker (D-022) — `website/worker/index.js` serves the teaser films as `206` slices (D-062) and
`worker/stats.js` the two `/api/` stats routes (D-063). German at `/`, English at `/en/`;
client-side navigation behind the drafting-sheet veil (D-039); motion system in `DESIGN.md`.
Deploys are manual: `npx wrangler deploy` from `website/` (D-022).

**Routes.** Sixteen pages plus two vCard endpoints: `/`, `/impressum`, `/datenschutz` and their
EN mirrors; the gated teaser page `/teaser`, `/en/teaser` (D-056; the only nav entry that is a
page rather than an anchor, D-057); the key-gated founders' dashboard `/statistik`, `/en/stats`
(D-063; noindex, sitemap-excluded, in no nav); the NB-VK cards `/karte`, `/karte/p-knopp`,
`/karte/m-vaghani`, their EN mirrors under `/en/card/` and static `/karte/<slug>.vcf` (D-049,
D-068; noindex, sitemap-excluded). `#leistungen`, `#vorgehen`, `#ueber-uns`, `#kontakt` are
homepage anchors, not pages.

**Teaser.** Three films, each behind its own 4-digit code (D-056, D-067), all committed in
`website/public/teaser/` as code-named films, posters and preview loops (D-059; Teaser 1 fitted
to 720p for the 25 MiB cap, the other two 1080p), built by `npm run teaser:assets` (Windows:
`ops/teaser-assets.bat`) from the gitignored `ops/teaser-src/`; a run builds only the films whose
code is set and sweeps only when every code is set (D-067). The codes are in no file. The page is
indexable (robots `Allow: /`, in the sitemap); the film URLs appear nowhere on the site until a
code derives them. The repo is public, so the films are too — open item 12.

**Stats** are live (D-063, on since D-064): a cookieless first-party beacon
(`src/scripts/beacon.ts`) posts page views, named clicks and end-of-page reach (D-065) to
`/api/hit`; rows live in the D1 store `nexbridge-stats` (WEUR). `/statistik` leads with Strom
(D-066; exempt from the drawing-office register — tokens, contrast and reduced-motion still
bind), behind `STATS_KEY`. `statsEnabled` in `site.ts` is `true` and is coupled to Datenschutz
§10, which carries a per-browser opt-out; a daily Worker cron deletes old salts and rows > 24 months.

**Cards.** The physical carrier is final: the CR80 NFC card, master
`print/visitenkarte-nfc/nfc-cr80.html` (D-055; design D back on full-range metallic — on that
surface only, the house texture and contrast laws are suspended, D-054). The paper master
`print/visitenkarte/` (D-053) is retained, superseded. NFC tags and QR codes carry
`nexbridge-it.com/karte/<slug>`, never a vCard (D-054). Card revision 09/2026 (`cards.ts`); phone
numbers are per card (`phoneE164`; P Knopp's is the venture line, D-054). Printing waits on the
DPMA check (item 5) and the machine proof (D-055).

**Letterhead.** `print/brief/NexBridge-IT_Briefbogen.docx` (D-071): DIN 5008 Form B, design A
(graphite band; B and C are alternatives), fonts embedded, body left to the writer. Posting waits on the DPMA check (item 5); a letter to a named
person needs a lawyer's notice under Art. 14 and 21 GDPR (D-071).

**Brand marks.** The logo mark is the folded glider (D-050): favicon, `apple-touch-icon`,
`og.png`, header lockup from `sm` up; canonical geometry in `website/public/logo-mark.svg`,
`website/public/favicon.svg` and `website/src/components/Mark.astro`, guarded by `npm run logo`.
The flow-line stays the motion signature; the wordmark sting (D-046) predates the mark (item 8).
Single sources, stack and the quality bar: `CLAUDE.md`. Spec → [[website-spec]].

## Open items — ranked, owner in brackets

1. **Legal pages need a lawyer's read** [founders] — filled from the founder's documents (D-036);
   open: the Drittland section (Cloudflare), whether the Cloudflare AVV is accepted, two
   Geschäftsführer beside "Einzelunternehmer", whether §8 must name the site's storage keys
   (§ 25 TDDDG), the in-house §10 rewrite (D-064), the locality-only address (D-068; § 5 DDG,
   Art. 13 GDPR) and the low-contrast footnote (D-069). EN versions are unreviewed translations.
2. **Kit line stale** [partner-b] — `docs/07-brand-kit.md` §11 still says "no analytics by
   default"; regenerate, never hand-edit (D-048). Opt out of your own visits on `/statistik`.
3. **Contact form has no endpoint** [founders] — `formEndpoint` is empty; the form falls back to mail (D-013).
4. **Internal P2/P3 floor prices not agreed** [founders] — see the table above.
5. **DPMA trademark check** [partner-a] — precedes any printing or first public post; include the
   generated-mark provenance question in the same pass (D-050, D-051).
6. **`bookingUrl` unset** [founders] — CTAs point at `#kontakt`.
7. **`nexbridge-it.de` status unrecorded** [founders] — D-016 recommended it; log a D-entry if registered.
8. **Mark animation not chosen** [founders] — three takes exist; D-046's sting needs a refresh after.
9. **Mobile Lighthouse performance 89–90** [partner-b] — below the 94 floor (D-043); font
   loading, pre-existing (D-050 gate). Moves up the moment traffic arrives.
10. **On-light cut of the mark undecided** [partner-b] — graphite chip on light material until a
    light-ground variant exists; does not gate the CR80 card.
11. **Card copies of the mark sit outside the drift guard** [partner-b] — `npm run logo` checks
    the three canonical sources only; the plate copy carries one extra path (D-051). Guard or
    replace the copies before the next card change.
12. **The repo is public, so the films are too** [founders] — a range request to
    `raw.githubusercontent.com` returned film bytes (2026-10-04); nothing in the deploy depends
    on the repo being public. `TBD:` make it private, or log a D-entry accepting it. Private also
    closes the history that holds the removed `1234` copy of Teaser 3 (D-067).
13. **Workflow-skill allowlist** [founders] — `using-superpowers` and `brainstorming` claim every
    turn, against the Direct tier (D-070). `TBD:` allowlist them as D-031 did for design skills
    (narrows D-009), or keep D-009 as is.

### Known defects (technical, none blocking)

- The 404 is German-only under the current Cloudflare config (D-024).
- Below `md` the homepage h1 collides („dievon") — one space before the `<br>` in `Hero.astro`;
  customer-facing German, so it goes through `copywriter-de`.
- `npm --prefix website run check` fails on four pre-existing `'heroArrow' is possibly null`
  errors in `website/src/scripts/flowrail.ts`; clear them, then wire `check` into `build` (D-058).

## Blocked / pending

**D-005 — legal vehicle** is the only `PENDING` decision. **Do not raise it** (D-008). Nothing depends on it.

## In flight

**Working principles** (D-070) on `claude/working-principles-research`, PR #4, and the
**letterhead** (D-071) on `claude/intro-letter`, stacked on it — built, awaiting review and merge.

Everything else is merged into `main`, the only long-lived branch: Teaser 3 (D-067, 2026-10-04),
the founder names and Walldorf address (D-068) and the Impressum footnote (D-069, 2026-10-16).
D-068 is deployed (2026-10-16) and, since its commit descends from the Teaser 3 cleanup
(9053941), so is that — `/teaser/d98c34cf53051ce8.mp4` (the retired `1234` copy, D-067) should
answer `404`; confirm once. Whether D-069 is deployed is unverified from this session: after the
next deploy the Impressum must show the footnote. Not yet seen on a real Safari: the first
founder with an iPhone should open `/teaser`, enter a code and confirm it plays (D-062).

## Next

The open items above, in order. A libraries-and-design-principles brief from the founder is due in `DESIGN.md`.
