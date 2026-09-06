# NFC-Karte (CR80) — print master

`nfc-cr80.html` is the production master for the **physical NFC cards** — founder-selected
design "D" (2026-09-06). It supersedes `../visitenkarte/visitenkarte.html` (85×55 paper format)
as the active physical carrier; the paper master stays for a possible later paper run.

## Format

**CR80**: trim **85.6 × 54 mm**, corner radius ~3.18 mm (punched by the card maker),
bleed 3 mm → page **91.6 × 60 mm**. No crop marks. Confirm the exact die with the card
maker before export — some NFC blanks run 86 × 54.

| Page | Side | Content |
|---|---|---|
| 1 | Vorderseite (Kontakt) | Zeichnungskopf — Peter Knopp (`NB-VK-01`), QR → `/karte/peter-knopp`, antenna drawing |
| 2 | Rückseite | Design D — glider + orange wordmark on metallic ground (identical for both) |
| 3 | Vorderseite (Kontakt) | Manush Vaghani (`NB-VK-02`), QR → `/karte/manush-vaghani` |
| 4 | Rückseite | identical to page 2 |

"Vorderseite" here = the contact side (the side people read); tell the shop explicitly which
side the chip/antenna sits under if they ask for a chip-side reference. Revision is
**Stand 09/2026** — one value across digital plate, paper master and this file
(`website/src/config/cards.ts` `CARD_REVISION`).

## Export

Open in Chrome/Edge → Print → *Save as PDF* — margins none, scale 100 %, background
graphics **on**. 4-page vector PDF, fonts embedded.

## Print-shop notes

- Colours are the site's RGB tokens; shop converts to CMYK (coated profile).
- **Machine proof of the back is mandatory**: the metallic ground is two soft radial light
  pools over a near-black ramp — banding/posterization risk on CMYK-over-PVC, and the pools
  may flatten. Fallback is pre-decided: flat graphite `#14171A` back (the design survives —
  glider + wordmark carry it). Proof the signal orange of the mark and wordmark too.
- Smallest type is 1.5 mm (~4.3 pt) mono annotations — requires retransfer or ≥600 dpi
  direct-to-card print; ask which process they use.
- The dashed antenna drawing on the front margin is design, not a die line — say so if the
  shop's preflight flags it.

## NFC — writing the chips

See `../visitenkarte/README.md`, section "NFC — how the chip is meant to work" (researched
2026-08-23). Short version: one NDEF **URL** record per card
(`https://nexbridge-it.com/karte/peter-knopp` / `.../manush-vaghani`), never a vCard record;
write with "NFC Tools", test one card on iPhone **and** Android, then lock — locking is
irreversible.

## Before printing — hard gate

The **DPMA trademark check** (`docs/STATE.md`, open item 5) must precede any printing or
handout. It should include the AI-generated-mark provenance question (D-050).
