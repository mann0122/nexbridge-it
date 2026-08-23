---
id: state
title: Where things stand
type: state
status: active
owner: partner-b
updated: 2026-08-23
depends_on: [vision, offer, brand, website-spec, decisions, agent-system]
decisions: [D-016, D-018, D-022, D-023, D-025, D-036, D-037, D-038, D-039, D-040, D-041, D-042, D-043, D-044, D-045, D-046, D-047, D-048, D-049]
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
business cards (D-046) — `/karte`, `/karte/peter-knopp`, `/karte/manush-vaghani`, their EN
mirrors under `/en/card/`, and static `/karte/<slug>.vcf` endpoints. Card routes are noindex
and sitemap-excluded: handouts, not landing pages. The nav links `#leistungen`, `#vorgehen`,
`#ueber-uns`, `#kontakt` are homepage anchors, not
pages — temporary, "until dedicated subpages exist"
(`website/src/components/Header.astro:17`). The spec sitemap lists them as planned pages.

The digital card plate carries the founder's company mark — the arrowhead-contrail (D-047) —
engraved in the `.card-mark` slot. The physical card print masters live in
`print/visitenkarte/` (NB-VK-01/02; their QR codes point at the card routes) and still carry
the old flow-mark vocabulary; they must be reconciled with the digital plate before printing.
Printing is gated on the DPMA trademark check — open item 5.

Three single sources you must not work around:

- Brand name and URLs → `website/src/config/site.ts`
- Design tokens → `website/src/styles/global.css` `@theme`
- Every user-visible string → `website/src/i18n/ui.ts` (type-enforced: EN cannot drift from DE)

Details → [[website-spec]], visual world → `DESIGN.md`.

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
   Should include the AI-generated-mark provenance question in one pass (D-047).
6. **`bookingUrl` unset** [founders] — CTAs point at `#kontakt` instead.
7. **`nexbridge-it.de` status unrecorded** [founders] — D-016 recommended it as the stronger
   choice for Mittelstand buyers. Not blocking; log a D-entry if it gets registered.

### Known defects (technical, none blocking)

- The 404 is German-only and cannot be otherwise under the current Cloudflare config (D-024);
  an English visitor at `/en/tippfehler` gets the German page.

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

The business-card work — print masters, the digital card-object redesign (D-046), and the
company mark on the plate plus texture calibration (D-047) — is
complete on worktree branch `claude/business-nfc-card-design-4d2727`, awaiting merge.
Nothing else is in flight; `main` stays the only long-lived branch.

## Next

The open items above, in order. The founder has signalled that a libraries-and-design-
principles brief is coming, which will land in `DESIGN.md`.
