# Visitenkarte — print masters

`visitenkarte.html` is the single print master for both founders' business cards. It is fully
self-contained: the brand fonts (Archivo Variable with the width axis, Fragment Mono) are
embedded as data URIs, and the two QR codes are inline vectors. Open it in a browser to preview;
print it to get the production PDF.

## What is on it

| Page | Side | Content |
|---|---|---|
| 1 | Front | Wordmark + company mark (the folded glider, D-050; on print in full brand colors per D-053 — identical for both founders) |
| 2 | Back | Zeichnungskopf — Peter Knopp (`NB-VK-01`), QR → `/karte/peter-knopp` |
| 3 | Front | identical to page 1 |
| 4 | Back | Zeichnungskopf — Manush Vaghani (`NB-VK-02`), QR → `/karte/manush-vaghani` |

All contact data mirrors `website/src/config/site.ts` (D-036 Impressum data, venture address and
mailbox) — **except the phone number, which is per person** and mirrors
`website/src/config/cards.ts` `phoneE164` (D-054): Peter Knopp carries the venture line
`+49 173 9044077`, Manush Vaghani his own `+49 176 85919025`. If a value changes in either
config, change it here by editing the HTML directly — the file is the master; there is no
generator to re-run in the repo.

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
## NFC — how the chip is meant to work

Researched and source-checked 2026-08-23 against Apple/Google developer documentation.

- **What goes on the chip: the card URL, nothing else.** One NDEF **URL** record —
  `https://nexbridge-it.com/karte/peter-knopp` or `.../manush-vaghani`. Under 50 bytes, so
  **NTAG213** (144 bytes usable) is plenty; NTAG216 buys nothing here.
- **Never write a vCard record to the chip.** iPhone background tag reading supports only
  URL, `mailto:`, `sms:`, `tel:`, FaceTime, Maps and HomeKit records — a vCard record is
  silently ignored. The URL already serves the .vcf behind „Kontakt speichern", which is the
  correct path for both platforms.
- **Writing:** app "NFC Tools" (wakdev, free, iOS + Android) → *Write → Add record → URL* →
  the card URL → *Write*. Then *Other → Lock tag*. **Locking is irreversible**: write and test
  ONE card on both an iPhone and an Android phone before locking the batch.
- **What the recipient experiences:** iPhone XS and newer reads the tag in the background with
  no app and no setup. On Android 16+ a URL tag raises `ACTION_VIEW`, and from **Android 17 the
  phone shows a notification the recipient must tap** rather than opening the page directly —
  one extra tap, worth knowing before it surprises someone.
- **The QR on the back is an equal partner, not a fallback** — it works on every camera phone
  regardless of NFC state, and needs no antenna hunting.
- **Phone-to-phone tapping is not a thing.** iOS cannot emulate an NFC tag for contact sharing
  (Apple's HCE and NFC/SE programs exclude this use case), and the Android equivalent is too
  unreliable to use in front of a client. Commercial "digital business card" vendors sell
  physical cards for exactly this reason. Hand over a card, or send the link from the share
  sheet.
- **Wallet passes (Apple/Google) are not a handover mechanism**: nothing can be pushed into
  another person's wallet — they must tap "Add" — and a pass cannot be NFC-tapped by a
  customer's phone. Revisit when iOS 27 ships tappable pass buttons (`featuredActions`).

## Before printing — hard gate

The **DPMA trademark check is still open** (`docs/STATE.md`, open item 5) and must precede any
printing or handout of these cards. Design work is done; production waits for that check.
