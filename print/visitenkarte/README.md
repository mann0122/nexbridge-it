# Visitenkarte — print masters

`visitenkarte.html` is the single print master for both founders' business cards. It is fully
self-contained: the brand fonts (Archivo Variable with the width axis, Fragment Mono) are
embedded as data URIs, and the two QR codes are inline vectors. Open it in a browser to preview;
print it to get the production PDF.

## What is on it

| Page | Side | Content |
|---|---|---|
| 1 | Front | Wordmark + company mark (D-047, full brand colors; identical for both founders) |
| 2 | Back | Zeichnungskopf — Peter Knopp (`NB-VK-01`), QR → `/karte/peter-knopp` |
| 3 | Front | identical to page 1 |
| 4 | Back | Zeichnungskopf — Manush Vaghani (`NB-VK-02`), QR → `/karte/manush-vaghani` |

All contact data mirrors `website/src/config/site.ts` (D-036 Impressum data, venture phone and
mailbox). If a value changes there, change it here by editing the HTML directly — the file is
the master; there is no generator to re-run in the repo.

## Exporting the production PDF

1. Open `visitenkarte.html` in Chrome or Edge.
2. Print → *Save as PDF* with: **Margins: none · Scale: 100% · Background graphics: on**.
3. The result is a 4-page vector PDF, one card side per page, fonts embedded.

Page geometry: **trim 85 × 55 mm, bleed 3 mm on all sides → page size 91 × 61 mm.**
No crop marks are included — tell the print shop the trim size and that bleed is built in.
The dashed line visible in the browser is a screen-only trim preview; it does not print.

## Print-shop notes

- Colours are the website's RGB tokens (graphite `#14171A`, paper `#F7F5F0`, signal `#FF4D00`,
  steel `#5B6770`/`#8B959E`). Ask the shop to convert to CMYK with a standard coated profile;
  check a proof of the signal orange — and specifically of the company mark on the front, now
  the largest signal-orange area we print.
- The mark's wedges and contrail are knockouts inside a full-bleed near-black solid — ask the
  shop about trapping; expect slight wedge-tip rounding. Confirm the profile's total-ink limit
  for the full-bleed graphite solid.
- The smallest type is ~3.7 pt annotation text; that needs offset or high-resolution digital
  print, not low-end gang printing.
- **NFC variant:** any card maker offering NFC PVC cards can produce these; an **NTAG213** chip
  (or larger) is plenty — the stored URL is under 50 bytes. Write the founder's card URL
  (`https://nexbridge-it.com/karte/peter-knopp` / `.../manush-vaghani`) as an NDEF URL record
  with any NFC-writing app (e.g. "NFC Tools": *Write → Add record → URL → Write*), then use the
  app's **lock** function so the tag cannot be overwritten. The QR on the printed back is the
  fallback for phones with NFC off.

## Before printing — hard gate

The **DPMA trademark check is still open** (`docs/STATE.md`, open item 5) and must precede any
printing or handout of these cards. Design work is done; production waits for that check.
