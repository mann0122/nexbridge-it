# Research: domain availability

Method: authoritative registry RDAP (DENIC for `.de`, rdap.org for gTLDs) — not a reseller
lookup. HTTP 200 = registered, 404 = free.

## NextBridge — checked 2026-07-26 (name decided this day, supersedes Klarfluss)
| Domain | Status |
|---|---|
| nextbridge.de | **TAKEN** — DENIC RDAP returns 200 |
| nextbridge.dev | **TAKEN** — RDAP redirects (302) |
| nextbridge.io | free at time of check |
| nextbridge.eu | inconclusive — rdap.org does not authoritatively serve `.eu`; verify at EURid |

Not yet checked: `.com`, `.net`, `.software`, `.gmbh`, compound German forms
(`nextbridge-software.de`, `nextbridge-it.de`, …). Compound `.de` domains are completely
normal in German B2B and are worth checking before settling for a gTLD.

**Recommendation:** verify `.eu` and `.com` at EURid/Verisign, and check the compound `.de`
forms. For a German Mittelstand audience a `.de` (even compound) outranks `.io` on trust;
`.io` reads as a tech-product domain. Register nothing before the DPMA trademark check
(register.dpma.de, ~15 min — owner: Partner A). "NextBridge" is a common English compound,
so a trademark collision is materially more likely than it was for an invented German word.

## Klarfluss — checked 2026-07-26 (working name, RETIRED, kept for the record)
klarfluss.de was **taken** (parked, redirecting to a reseller product); klarfluss.com taken;
klarfluss.io/.dev/.eu and all compound `.de` forms free. Superseded by the rename.
