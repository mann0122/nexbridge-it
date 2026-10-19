# Briefbogen — the NexBridge-IT letterhead

`NexBridge-IT_Briefbogen.docx` is the company letterhead as a Word file (D-071). Everything is
designed except the letter's text: open it, replace the highlighted placeholders, write the body.

The design is **E · Nocturne**. The founder asked for a design that was more elegant and beautiful, so six directions were drawn in parallel; the founder picked this one. It is a
marketing surface, so it leaves the drawing-office register of the website on the founder's
direction (D-071): no mono labels, no title block. The brand's colours and type still bind.

- **Top band:** slim graphite (32.5 mm), lit very slightly from above. The glider in its native
  colours next to the wordmark with its orange period; on the same baseline, right-aligned, the
  site's tagline "Prozesse, die von selbst laufen." in Archivo Light.
- **The flow-line:** three fine steel lines fade in from the left edge, converge, and hand over
  to one thin orange line that grows out of nothing and runs off the right edge. The four
  offers ride on it in small tracked capitals.
- **Address field** for a left-window envelope, with the small return line above it, and the
  **information block** on the right: Telefon, E-Mail, Web, Datum.
- **Footer:** light, so the page breathes — a fine rule with a short orange tick where it
  starts, and the contact line under it.
- **Page 2 onward:** a 22 mm band with a smaller lockup, the same flow-line and "Seite x von y"
  on the lockup's baseline.
- **Fold and hole marks** on the left edge.

The other directions are still built by the same generator and can replace E with one argument:
**D · Schwung** (sweeping curves in the top-right corner, a white page), **A · Graphitband**,
**B · Signallinie** and **C · Seitenleiste**. See "Other variants" below.

The fonts (Archivo regular and semibold, Archivo SemiExpanded for the subject line) are
**embedded**, so the letter prints in the house type on a PC that has never had Archivo
installed. The file passes the OOXML schema check (`scripts/office/validate.py` of the docx
skill).

## Writing a letter

1. Replace everything in **[yellow brackets]**: recipient, date, Betreff, salutation, and
   `[Text]` with your letter. Nothing highlighted may leave the house.
2. Type the body in the **Normal** style. For structure, use the styles in Word's style
   gallery — they keep the letter in the house type:

   | Style | For |
   |---|---|
   | `Betreff` | the subject line (already set) |
   | `Zwischenüberschrift` | a short heading inside the letter |
   | `Aufzählung` | lists, with an en dash |
   | `Hervorhebung` | a word or phrase in semibold (Ctrl+B does the same) |

3. The recipient block has six lines, and the company goes first. Keep the address inside
   the field: that is the envelope window.
4. Sign above the two printed names. Delete a name if only one of you signs.
5. Fold at the two short marks on the left (105 mm, 210 mm). The address then shows in a
   **DL** or **C6/5** window envelope (window on the left). The middle mark is for the hole punch.

Word keeps the fonts embedded when you save (the file is set to do so). Text copied into another
document loses them.

## Printing

- **The band runs to the paper edge.** An office printer cannot print the outer 3–5 mm, so it
  leaves a thin white margin around the band. For letters that look premium, have the
  letterhead printed by a print shop and print each letter onto that paper — or send the letter
  as a PDF (Word: *Datei → Exportieren → PDF*), which keeps the band to the edge. The fine
  steel lines in the band are 0.2 mm; a cheap laser may print them faint.
- **D · Schwung** is the variant for an office printer: only line ends that leave the page
  anyway run off the paper.
- Print at **100 % / actual size**, never "fit to page": the address field and the marks are
  measured from the paper edge.

## Before the first letter goes out

- **DPMA trademark check** (`docs/STATE.md`, open item 5) gates any printing and the first
  public use of the brand.
- **Return line.** It reads `NexBridge-IT · Walldorf`, because the street address left every
  surface with D-068. Deutsche Post cannot return an undeliverable letter to a town alone.
- **Letters to a named person** are direct marketing under GDPR: the first letter has to point
  out the right to object (Art. 21(4)) and say where the address came from (Art. 14). That is
  legal text, so it comes from a lawyer or a generator (CLAUDE.md rules 1 and 4). Letters to a
  GmbH's "Geschäftsführung" without a name are arguably outside it, but not for sole traders.
  Details and sources: `docs/research/letterhead-din5008.md`.

## Changing the letterhead

Contact data lives in two places that must change together: the top of `build-brief.mjs` (the
live text) and the top of `make-assets.py` (the footer artwork). Both mirror
`website/src/config/site.ts`. Then:

```
pip install fonttools uharfbuzz cairosvg     # once; only make-assets.py needs Python
python3 print/brief/make-assets.py           # only if artwork or fonts changed
npm run brief
```

- `fonts/` — static instances of the Archivo variable font (wdth 100 · wght 400, its linked
  bold at wght 600, and wdth 112 · wght 600), subset to Latin. SIL OFL 1.1, no Reserved Font
  Name; the licence is next to them. The artwork of D and E also uses Archivo Light, Book,
  Medium and two wider Mediums; those are set as outlines only, never embedded, and are built into the gitignored
  `.cache/` from the same variable font.
- `assets/<variant>-seite1.svg`, `-folgeseite.svg` — everything that never changes per letter:
  bands, strips, lockup, offer line, footer contact line, marks. The glider comes from
  `website/public/logo-mark.svg` (dark ground) or `website/public/favicon.svg` (the chip, light
  ground), read at build time and never redrawn. Text is stored as outlines, so it looks
  identical everywhere. Each SVG has a 300 dpi PNG twin, the raster fallback Word needs.

`build-brief.mjs` also repairs five defects of docx-js 9.7.1 after packing (font keys,
embedding flag, settings order, page-number fields, the bold face); the comment above
`repair()` says why each one matters.

## Other variants

```
node print/brief/build-brief.mjs schwung      print/brief/NexBridge-IT_Briefbogen.docx
node print/brief/build-brief.mjs graphitband  print/brief/NexBridge-IT_Briefbogen.docx
node print/brief/build-brief.mjs signallinie  print/brief/NexBridge-IT_Briefbogen.docx
node print/brief/build-brief.mjs seitenleiste print/brief/NexBridge-IT_Briefbogen.docx
```

To make one of them the default, change `DEFAULT_VARIANT` in `build-brief.mjs` and log it.

## Layout reference (mm from the top-left corner)

| Element | Position |
|---|---|
| Top band (E) | 0–32.5 graphite; lockup from y 8.2, tagline on its baseline; signal line at y 24.2 from x 84, full from x 148; follow pages 0–22, line at y 16.6 |
| Footer (E) | rule at y 281 from x 25 to 190 with a 4 mm signal tick, contact line at y 286.6 |
| Sweep (D) | top-right corner, inside y 0–45 (follow pages: 0.55 scale, inside 0–40) |
| Lockup · tagline · offers (D) | chip from y 14.5 · baseline 32.6 · baseline 37.6, all from x 25 |
| Top band (A) | 0–38 graphite, signal strip 36.2–38 from x 128; follow pages 0–22, strip 20.6–22 |
| Address field | x 20–105, y 45–90; text from x 25 |
| — return line | last of five 3.54 mm lines, ending at y 62.7 |
| — address | six 4.55 mm lines, y 62.7–90 |
| Information block | x 125–190, from y 50 |
| Betreff | from about y 98.5 |
| Writing area | x 25–190, body ends at y 275 |
| Fold marks · hole mark | y 105 and 210 · y 148.5 |
| Footer (D) | contacts from x 125, baselines 283.4 / 287 / 290.6; echo bottom-left from y 277 |
| Footer band (A) | 282–297 graphite, signal strip 282–283.8 from x 0 to 82, contact line at y 291.2 |
