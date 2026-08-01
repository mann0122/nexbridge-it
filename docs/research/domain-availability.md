---
id: research-domains
title: Research — domain availability
type: research
status: active
owner: partner-b
updated: 2026-08-01
depends_on: []
decisions: [D-016]
cites_history: [D-001, D-014]
---

# Research: domain availability

Method: authoritative registry RDAP (DENIC for `.de`, rdap.org for gTLDs) — not a reseller
lookup. HTTP 200/302 = registered, 404 = free.

> **Unresolved, noted 2026-08-01.** The table below records `nexbridge-it.com` as TAKEN on
> 2026-07-27, yet the site went live on exactly that domain the following day (commit `a15bd67`,
> and `website/src/config/site.ts`). These cannot both be right. Either the founders acquired the
> `.com` after this check, or the RDAP 302 was misread. This is an observation log — the entry
> below is left exactly as it was recorded. Resolution belongs in [[state]] and, once confirmed,
> in a new decision entry. Owner: founders.

## NexBridge-IT — checked 2026-07-27 (current name, D-016)
| Domain | Status |
|---|---|
| **nexbridge-it.de** | **FREE** ✅ — DENIC RDAP 404 |
| **nexbridge-it.io** | **FREE** — rdap.org 404 |
| nexbridge-it.com | **TAKEN** — rdap.org 302 |
| nexbridge.de | TAKEN (the un-hyphenated form; squatted) |
| nexbridge.com | TAKEN |
| nexbridge.io | free (un-hyphenated) |

**Recommendation: register `nexbridge-it.de`.** This is the single best outcome so far — a
plain `.de` is the credibility standard for Mittelstand buyers, and the hyphenated form
sidesteps the squatter holding `nexbridge.de`. Hyphenated `.de` domains are completely normal
in German B2B. Take `nexbridge-it.io` as a cheap defensive secondary if desired.
`.com` is gone, which matters little for a German-market venture.

Still open before registering: DPMA trademark search (register.dpma.de, ~15 min, owner:
Partner A). Availability of a domain says nothing about trademark rights.

## Superseded names (kept for the record)
- **NextBridge** (2026-07-26, never adopted — spelling corrected to NexBridge-IT the next day):
  nextbridge.de TAKEN, .dev TAKEN, .io free.
- **Klarfluss** (working name until 2026-07-26): klarfluss.de TAKEN (parked/reseller),
  klarfluss.com TAKEN, klarfluss.io/.dev/.eu and all compound `.de` forms free.
