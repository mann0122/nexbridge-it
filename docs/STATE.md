---
id: state
title: Where things stand
type: state
status: active
owner: partner-b
updated: 2026-08-01
depends_on: [vision, offer, brand, website-spec, decisions, agent-system]
decisions: [D-016, D-018, D-019, D-022, D-023]
---

# Where things stand

**This is the session bootstrap.** It holds current state only — no history, no rationale. If you
need *why*, read [[decisions]]. If you need *which document*, read [INDEX.md](INDEX.md).
Everything here is traceable to a file or a D-entry; nothing is inferred.

Last reviewed: **2026-08-01**

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

Configured origin **nexbridge-it.com** (`website/src/config/site.ts`), deployed as a Cloudflare
static-asset Worker (D-022). **Registration unconfirmed** — see open item 1; `site.ts:8` still
calls the URL "preview until the domain is registered". Astro 7 + Tailwind 4 (D-023).
Bilingual from day one: German at `/`, English at `/en/`.

**Four routes exist**: `/`, `/en/`, `/impressum`, `/datenschutz`.
The nav links `#leistungen`, `#vorgehen`, `#ueber-uns`, `#kontakt` are homepage anchors, not
pages — temporary, "until dedicated subpages exist"
(`website/src/components/Header.astro:17`). The spec sitemap lists them as planned pages.

Three single sources you must not work around:

- Brand name and URLs → `website/src/config/site.ts`
- Design tokens → `website/src/styles/global.css` `@theme`
- Every user-visible string → `website/src/i18n/ui.ts` (type-enforced: EN cannot drift from DE)

Details → [[website-spec]], visual world → `DESIGN.md`.

## Open items

Ranked. Owner in brackets.

1. **Domain registration is unconfirmed** [founders] — the site is live on `nexbridge-it.com`,
   but [[research-domains]] recorded that domain as TAKEN one day earlier. Also unresolved:
   whether `nexbridge-it.de` (free per D-016, and the stronger choice for Mittelstand buyers)
   was secured. Confirm both, then log a decision entry.
2. **Analytics not installed** [partner-b] — `plausibleDomain` and `cfAnalyticsToken` in
   `site.ts` are both empty; the site makes zero third-party requests. D-013 flags this as
   do-before-driving-traffic.
3. **Contact form has no endpoint** [founders] — `formEndpoint` is empty, so the form falls back
   to the visitor's mail client. Enquiries arrive but are unmeasurable.
4. **Legal pages are skeletons** [founders] — `/impressum` and `/datenschutz` both render
   "Inhalt folgt vor Veröffentlichung." Required before any real traffic.
5. **Internal P2/P3 floor prices not agreed** [founders] — see the table above.
6. **DPMA trademark check** [partner-a] — must precede any printing or first public post.
7. **`bookingUrl` unset** [founders] — CTAs point at `#kontakt` instead.

### Known defects (technical, none blocking)

- `website/wrangler.jsonc:18` sets `not_found_handling: "404-page"`, but no `404.astro` exists,
  so `dist/404.html` is never built and the setting is inert.
- `website/README.md` is still the unmodified Astro starter boilerplate.
- No `/en/impressum` or `/en/datenschutz` — an English visitor lands on German legal pages.

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

**Repo move decided, not executed** (D-019) — target `C:\Users\manus\Projects\nexbridge-it`,
runs via `move-nexbridge.ps1` from a separate PowerShell window. If you are reading this from the
new path, the move is done and this section can go.

## Next

The founder has signalled that a libraries-and-design-principles brief is coming, which will land
in `DESIGN.md`. Until then the sensible next moves are the open items above, in order.
