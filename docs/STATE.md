---
id: state
title: Where things stand
type: state
status: active
owner: partner-b
updated: 2026-09-15
depends_on: [vision, offer, brand, website-spec, decisions, agent-system]
decisions: [D-016, D-018, D-022, D-023, D-025, D-036, D-037, D-038, D-039, D-040, D-041, D-042, D-043, D-044, D-045, D-049, D-050, D-051]
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
Deployed as a Cloudflare static-asset Worker (D-022). Astro 7 + Tailwind 4 (D-023).
Bilingual from day one: German at `/`, English at `/en/`. Navigation is client-side behind a
drafting-sheet transition veil (D-039); the motion system is documented in `DESIGN.md`.

**Eight routes exist**: `/`, `/en/`, `/impressum`, `/datenschutz`, `/en/impressum`,
`/en/datenschutz`, `/teaser`, `/en/teaser`.
The nav links `#leistungen`, `#vorgehen`, `#ueber-uns`, `#kontakt` are homepage anchors, not
pages — temporary, "until dedicated subpages exist"
(`website/src/components/Header.astro:18`). The spec sitemap lists them as planned pages.
`Teaser` is the exception: a real page, and the first one in the nav (D-050).

`/teaser` holds the two advertisement films behind a 4-digit courtesy gate (D-049) — a
blurred silent loop on hover, the full film after a code. **The films are not in the repo
yet**: the mechanism ships, the assets do not. Until they land the cards render as empty
drawing sheets reading "Film folgt", and the site builds and deploys normally.
The *page* is public: nav-linked, `Allow: /` in `robots.txt`, and emitted into
`sitemap-index.xml` like every other route — D-049's "not indexed" is about the film URLs,
which appear nowhere until a correct code derives them, not about `/teaser` itself.

Four single sources you must not work around:

- Brand name and URLs → `website/src/config/site.ts`
- Design tokens → `website/src/styles/global.css` `@theme`
- Every user-visible string → `website/src/i18n/ui.ts`. EN cannot drift from DE — but only
  because of the `AssertKeys` guard at the foot of that file, and only when someone runs
  `npm --prefix website run check`. The `satisfies` line alone never enforced it (D-051).
- Teaser asset identity → `website/src/config/teasers.ts` (D-050; file identity only, no
  strings, no codes)

Details → [[website-spec]], visual world → `DESIGN.md`.

## Open items

Ranked. Owner in brackets.

1. **Legal pages need a lawyer's read** [founders] — both are filled with the founder's own
   documents (D-036) and no longer block traffic. Four points were left for a professional
   rather than guessed at: the Drittland section now that Cloudflare is named, whether the
   Cloudflare AVV is actually accepted in the account, the Impressum naming two
   Geschäftsführer alongside "Einzelunternehmer", and — new with D-049 — whether §8
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
5. **Teaser films not generated** [founders] — `/teaser` is live but empty. Drop the two
   source films into `ops/teaser-src/` as `NBIT1` (Rathaus) and `NBG1` (general), then run
   `TEASER_1_CODE=… TEASER_2_CODE=… npm run teaser:assets` and commit
   `website/public/teaser/`. The codes never enter the repo — they live in the founders'
   shell and in the conversations where they are handed out. Rotating a code means re-running
   the script; it retires the old file. See D-049.
6. **DPMA trademark check** [partner-a] — must precede any printing or first public post.
7. **`bookingUrl` unset** [founders] — CTAs point at `#kontakt` instead.
8. **`nexbridge-it.de` status unrecorded** [founders] — D-016 recommended it as the stronger
   choice for Mittelstand buyers. Not blocking; log a D-entry if it gets registered.

### Known defects (technical, none blocking)

- The 404 is German-only and cannot be otherwise under the current Cloudflare config (D-024);
  an English visitor at `/en/tippfehler` gets the German page.
- `npm --prefix website run check` reports four `'heroArrow' is possibly null` errors in
  `website/src/scripts/flowrail.ts` (D-044). Pre-existing, not runtime bugs — but they are why
  `check` is not yet wired into `build` (D-051). Clear them, then gate the build on it.

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

The gated teaser page (D-049, D-050) — mechanism built, waiting on the two films and their
codes from the founders (open item 5). The motion upgrade (D-038…D-042), the icon vocabulary
(D-043) and the flowrail (D-044) are merged and live; the WebGL hero-dissolve experiment was
killed on the founder's verdict (D-045) and its branch is deleted. `main` is still the only
long-lived branch — the teaser work is a feature branch heading for a PR.

## Next

The open items above, in order. The founder has signalled that a libraries-and-design-
principles brief is coming, which will land in `DESIGN.md`.
