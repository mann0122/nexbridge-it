#!/usr/bin/env node
/**
 * Builds the NexBridge-IT letterhead as a Word file (D-071).
 *
 *   npm run brief                               → print/brief/NexBridge-IT_Briefbogen.docx
 *   node print/brief/build-brief.mjs <variant> <out.docx>   (variants: see VARIANTS)
 *
 * Needs the `docx` and `jszip` devDependencies. The artwork and fonts come from
 * make-assets.py, whose outputs are committed, so this script needs no Python.
 *
 * Everything is designed except the letter's text. The body is one highlighted [Text]
 * placeholder; what the writer types there picks up the house styles defined below.
 *
 * Layout is DIN 5008 Form B on A4 (sources: docs/research/letterhead-din5008.md): letterhead
 * zone 0–45 mm, address field 20 mm from the left and 45 mm from the top (85 × 45 mm: the return
 * line in the last of five 3.54 mm lines, then six 4.55 mm address lines, text on the 25 mm
 * writing line), information block from x 125 / y 50, Betreff at about y 98.5, fold marks at
 * 105/210 mm, hole mark at 148.5 mm, writing area 25–190 mm. Everything that never changes per
 * letter — bands, strips, lockup, offer line, footer contact line, marks — is one page-sized SVG
 * in the header, so it sits exactly in every renderer. Everything a writer edits is live text.
 *
 * Brand: the tokens and fonts of docs/07-brand-kit.md. The drawing-office register is left on the
 * founder's direction (D-071): no mono labels, no title block. Fonts are embedded, so the letter
 * prints in the house type on a PC that has never seen Archivo.
 *
 * Placeholders are written as [Text in Klammern] and highlighted yellow — they must all be gone
 * before a letter leaves the house.
 */
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import {
  AlignmentType, BorderStyle, CharacterSet, Document, Footer, Header, HeightRule,
  HorizontalPositionRelativeFrom, ImageRun, LevelFormat, LineRuleType, Packer, PageNumber,
  Paragraph, TabStopType, Table, TableCell, TableLayoutType, TableRow, TextRun, TextWrappingType,
  VerticalPositionRelativeFrom, WidthType,
} from 'docx';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(HERE, p));

// ─── variants — artwork from make-assets.py; the page number sits in the follow-page header
// at the height of that page's lockup baseline, in a colour that reads on its ground. ───────
const VARIANTS = {
  nocturne: { label: 'E · Nocturne', pageNo: { color: '8B959E', headerMm: 7.25 } },    // steel on graphite, on the lockup baseline
  schwung: { label: 'D · Schwung', pageNo: { color: '5B6770', headerMm: 23.5 } },       // steel-deep on paper, on the lockup baseline
  graphitband: { label: 'A · Graphitband', pageNo: { color: '8B959E', headerMm: 9.0 } },     // steel on graphite
  signallinie: { label: 'B · Signallinie', pageNo: { color: '5B6770', headerMm: 14.2 } },    // steel-deep on paper
  seitenleiste: { label: 'C · Seitenleiste', pageNo: { color: '5B6770', headerMm: 14.2 } },
};
const DEFAULT_VARIANT = 'nocturne';
const variant = process.argv[2] ?? DEFAULT_VARIANT;
const out = process.argv[3] ?? path.join(HERE, 'NexBridge-IT_Briefbogen.docx');
// A design draft from outside the repo: BRIEF_VARIANT_JSON names a JSON file shaped like a
// VARIANTS entry, plus `assetsDir` (where <variant>-seite1.svg etc. live) and optional colours.
if (process.env.BRIEF_VARIANT_JSON) VARIANTS[variant] = JSON.parse(fs.readFileSync(process.env.BRIEF_VARIANT_JSON, 'utf8'));
if (!VARIANTS[variant]) {
  console.error(`unknown variant "${variant}" — one of: ${Object.keys(VARIANTS).join(', ')}`);
  process.exit(1);
}
const V = VARIANTS[variant];
const ART = V.assetsDir ?? path.join(HERE, 'assets');

// ─── units ─────────────────────────────────────────────────────────────────────────────
const mm = (v) => Math.round(v * 56.6929);          // millimetres → twips
const pt = (v) => Math.round(v * 20);               // points → twips
const half = (v) => Math.round(v * 2);              // points → half-points (font sizes)
const px = (v) => (v / 25.4) * 96;                  // millimetres → CSS px (docx-js image size)

// ─── brand tokens (docs/07-brand-kit.md §2, §3) ───────────────────────────────────────
const C = { graphite: '14171A', steelDeep: '5B6770' };
const F = { text: 'Archivo', heading: 'Archivo SemiExpanded SemiBold' };
const TEXT_PT = 10;                                  // Archivo runs large; 10 pt reads like 11 pt Arial
const LEAD_PT = 14;

// ─── facts — single sources: website/src/config/site.ts, D-029, D-068 ─────────────────
// make-assets.py carries the same facts in the footer artwork; change both in one commit.
const SITE = {
  name: 'NexBridge-IT',
  people: ['P Knopp', 'M Vaghani'],
  city: 'Walldorf',
  phone: '+49 173 9044077',         // site.ts phoneE164, in the DIN 5008 international form
  email: 'nexbridge-it@mailbox.org',
  web: 'nexbridge-it.com',
};

// ─── helpers ──────────────────────────────────────────────────────────────────────────
function runs(text, opts = {}) {
  return text.split(/(\[[^\]]+\])/).filter(Boolean).map((part) => new TextRun({
    text: part, ...opts, ...(part.startsWith('[') ? { highlight: 'yellow' } : {}),
  }));
}
/** Small uppercase label with open tracking — the premium caption grade. */
const label = (text, sizePt = 5.8) => new TextRun({
  text, font: F.heading, size: half(sizePt), color: V.labelColor ?? C.steelDeep, allCaps: true, characterSpacing: Math.round(0.12 * sizePt * 20),
});
const exact = (linePt, before = 0, after = 0) => ({
  line: pt(linePt), lineRule: LineRuleType.EXACT, before: pt(before), after: pt(after),
});
const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE };
function cell(widthMm, children, extra = {}) {
  return new TableCell({
    width: { size: mm(widthMm), type: WidthType.DXA },
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    borders: { top: NONE, bottom: NONE, left: NONE, right: NONE },
    children,
    ...extra,
  });
}

function pageArt(file, description, extraRuns = []) {
  return new Paragraph({
    spacing: exact(10),
    tabStops: [{ type: TabStopType.RIGHT, position: mm(165) }],
    children: [new ImageRun({
      type: 'svg',
      data: fs.readFileSync(path.join(ART, `${file}.svg`)),
      fallback: { type: 'png', data: fs.readFileSync(path.join(ART, `${file}.png`)) },
      transformation: { width: px(210), height: px(297) },
      altText: { title: 'NexBridge-IT', description, name: file },
      floating: {
        horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 0 },
        verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: 0 },
        wrap: { type: TextWrappingType.NONE },
        behindDocument: true,
        allowOverlap: true,
        lockAnchor: true,
      },
    }), ...extraRuns],
  });
}

// ─── address field and information block (one exact-height table row, 45 → 90 mm) ────
const ADDR_INSET = 5;
const ZONE1 = { lines: 5, pitch: 17.7 / 5 };
const ZONE2 = { lines: 6, pitch: 27.3 / 6 };

function addressAndInfo() {
  const recipient = ['[Firma]', '[Frau Vorname Nachname]', '[Straße Hausnummer]', '[PLZ Ort]'];
  const zone1 = new Paragraph({
    spacing: { line: mm(ZONE1.pitch), lineRule: LineRuleType.EXACT, before: mm(ZONE1.pitch * (ZONE1.lines - 1)), after: 0 },
    children: [new TextRun({ text: `${SITE.name} · ${SITE.city}`, size: half(6.5), color: V.returnColor ?? C.steelDeep })],
  });
  const zone2 = Array.from({ length: ZONE2.lines }, (_, i) => new Paragraph({
    spacing: { line: mm(ZONE2.pitch), lineRule: LineRuleType.EXACT, before: 0, after: 0 },
    children: runs(recipient[i] ?? ''),
  }));
  // Starts 5 mm below the field's top — as spacing, not a cell margin: LibreOffice applies one
  // cell's top margin to the whole row.
  const info = [['Telefon', SITE.phone], ['E-Mail', SITE.email], ['Web', SITE.web], ['Datum', '[TT.MM.JJJJ]']];
  const infoBlock = info.flatMap(([k, v], i) => [
    new Paragraph({ spacing: { line: pt(8), lineRule: LineRuleType.EXACT, before: i === 0 ? mm(5) : 0, after: 0 }, children: [label(k)] }),
    new Paragraph({ spacing: exact(11, 0, 4), children: runs(v, { size: half(8.5) }) }),
  ]);
  return new Table({
    layout: TableLayoutType.FIXED,
    indent: { size: -mm(ADDR_INSET), type: WidthType.DXA },
    width: { size: mm(170), type: WidthType.DXA },
    columnWidths: [mm(85), mm(20), mm(65)],
    borders: noBorders,
    rows: [new TableRow({
      height: { value: mm(45), rule: HeightRule.EXACT },
      cantSplit: true,
      children: [
        cell(85, [zone1, ...zone2], { margins: { top: 0, bottom: 0, left: mm(ADDR_INSET), right: 0 } }),
        cell(20, [new Paragraph({ children: [] })]),
        cell(65, infoBlock),
      ],
    })],
  });
}

// ─── closing: Grußformel, room to sign, the two names (no titles, as in the e-mail signatures)
function signatures() {
  const sig = (name) => cell(82.5, [
    ...Array.from({ length: 3 }, () => new Paragraph({ spacing: exact(LEAD_PT), children: [] })),
    new Paragraph({ spacing: exact(LEAD_PT), children: [new TextRun({ text: name })] }),
  ]);
  return [
    new Paragraph({ spacing: exact(LEAD_PT, LEAD_PT, 0), keepNext: true, children: [new TextRun('Mit freundlichen Grüßen')] }),
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: mm(165), type: WidthType.DXA },
      columnWidths: [mm(82.5), mm(82.5)],
      borders: noBorders,
      rows: [new TableRow({ cantSplit: true, children: SITE.people.map(sig) })],
    }),
  ];
}

// ─── styles the writer uses in the body ───────────────────────────────────────────────
const styles = {
  default: {
    document: {
      run: { font: F.text, size: half(TEXT_PT), color: C.graphite, language: { value: 'de-DE' } },
      paragraph: { spacing: exact(LEAD_PT, 0, 9) },
    },
  },
  paragraphStyles: [
    { id: 'Betreff', name: 'Betreff', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { font: F.heading, size: half(11.5) }, paragraph: { spacing: exact(15, 24, 24), keepNext: true } },
    { id: 'Zwischenueberschrift', name: 'Zwischenüberschrift', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { font: F.heading, size: half(TEXT_PT) }, paragraph: { spacing: exact(LEAD_PT, 9, 3), keepNext: true } },
    { id: 'Aufzaehlung', name: 'Aufzählung', basedOn: 'Normal', quickFormat: true,
      paragraph: { spacing: exact(LEAD_PT, 0, 3), numbering: { reference: 'nb-dash', level: 0 } } },
  ],
  characterStyles: [
    { id: 'Hervorhebung', name: 'Hervorhebung', basedOn: 'DefaultParagraphFont', quickFormat: true, run: { bold: true } },
  ],
};
const numbering = {
  config: [{
    reference: 'nb-dash',
    levels: [{
      level: 0, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: mm(5), hanging: mm(5) } }, run: { color: C.steelDeep } },
    }],
  }],
};

// ─── the document ─────────────────────────────────────────────────────────────────────
const fonts = [
  ['Archivo', 'Archivo-Regular.ttf'],
  [F.heading, 'Archivo-SemiExpanded-SemiBold.ttf'],
].map(([name, file]) => ({ name, data: read(`fonts/${file}`), characterSet: CharacterSet.ANSI }));

const pageNumber = new TextRun({
  children: ['\t', 'Seite ', PageNumber.CURRENT, ' von ', PageNumber.TOTAL_PAGES],
  size: half(7.5), color: V.pageNo.color,
});

const doc = new Document({
  creator: SITE.name,
  title: 'NexBridge-IT – Briefbogen',
  description: `Briefbogen nach DIN 5008 Form B · ${V.label}`,
  fonts,
  styles,
  numbering,
  hyphenation: { autoHyphenation: true, hyphenationZone: mm(6), consecutiveHyphenLimit: 2, doNotHyphenateCaps: true },
  sections: [{
    properties: {
      titlePage: true,
      page: {
        size: { width: mm(210), height: mm(297) },
        margin: { top: mm(45), bottom: mm(22), left: mm(25), right: mm(20), header: mm(V.pageNo.headerMm), footer: mm(8) },
      },
    },
    headers: {
      first: new Header({ children: [pageArt(`${variant}-seite1`, 'Briefkopf und Fußzeile NexBridge-IT mit Falz- und Lochmarken')] }),
      // DIN 5008 numbers pages from page 2 on — so only the follow-page header carries it.
      default: new Header({ children: [pageArt(`${variant}-folgeseite`, 'Kopf und Fußzeile der Folgeseiten NexBridge-IT', [pageNumber])] }),
    },
    footers: {
      first: new Footer({ children: [new Paragraph({ children: [] })] }),
      default: new Footer({ children: [new Paragraph({ children: [] })] }),
    },
    children: [
      addressAndInfo(),
      new Paragraph({ style: 'Betreff', children: runs('[Betreff]') }),
      new Paragraph({ children: runs('[Sehr geehrte Damen und Herren,]') }),
      new Paragraph({ children: runs('[Text]') }),
      ...signatures(),
    ],
  }],
});

// ─── repair: what docx-js 9.7.1 gets wrong, fixed after packing ───────────────────────
/** ECMA-376 font obfuscation: XOR the first 32 bytes with the GUID's bytes, read from the end. */
function obfuscate(ttf, guid) {
  const hex = guid.replace(/[{}-]/g, '');
  const key = Array.from({ length: 16 }, (_, i) => parseInt(hex.slice(30 - 2 * i, 32 - 2 * i), 16));
  const buf = Buffer.from(ttf);
  for (let i = 0; i < 32; i++) buf[i] ^= key[i % 16];
  return buf;
}

/**
 * docx-js writes things the OOXML schema rejects, one of which breaks the embedded fonts, and it
 * cannot embed a bold face. Fixed here so the generator above stays plain docx-js. The docx
 * skill's scripts/office/validate.py must report no errors after this.
 *  1. w:fontKey GUIDs in lowercase hex — the schema wants uppercase, and a strict reader derives
 *     the wrong de-obfuscation key, so the type falls back (LibreOffice set every run in a
 *     substitute face until this was fixed).
 *  2. no w:embedTrueTypeFonts — without it Word drops the embedded fonts the first time someone
 *     edits the letter and saves it.
 *  3. settings children out of schema order; w:highlightCs, which transitional run properties
 *     do not allow.
 *  4. PAGE/NUMPAGES fields as one run holding begin, code, separator and end, with no cached
 *     result — LibreOffice then sets the number in the default face. Rewritten the way Word
 *     writes fields: one element per run, each with the run's formatting, result 1.
 *  5. Archivo's bold face (wght 600, see make-assets.py) added as w:embedBold, so Ctrl+B and the
 *     Hervorhebung style give the house semibold, not a synthesised bold.
 */
async function repair(buf) {
  const zip = await JSZip.loadAsync(buf);

  const boldKey = `{${randomUUID().toUpperCase()}}`;
  zip.file('word/fonts/font-archivo-bold.odttf', obfuscate(read('fonts/Archivo-Bold.ttf'), boldKey));
  const rels = await zip.file('word/_rels/fontTable.xml.rels').async('string');
  zip.file('word/_rels/fontTable.xml.rels', rels.replace('</Relationships>',
    '<Relationship Id="rIdArchivoBold" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/font" Target="fonts/font-archivo-bold.odttf"/></Relationships>'));
  const fontTable = (await zip.file('word/fontTable.xml').async('string'))
    .replace(/w:fontKey="\{([0-9a-f-]+)\}"/gi, (_, g) => `w:fontKey="{${g.toUpperCase()}}"`)
    .replace(/(<w:font w:name="Archivo">(?:(?!<\/w:font>).)*?<w:embedRegular[^>]*\/>)/,
      `$1<w:embedBold r:id="rIdArchivoBold" w:fontKey="${boldKey}"/>`);
  if (!fontTable.includes('rIdArchivoBold')) throw new Error('repair: could not attach the Archivo bold face');
  zip.file('word/fontTable.xml', fontTable);

  let settings = await zip.file('word/settings.xml').async('string');
  const take = (tag) => {
    const m = settings.match(new RegExp(`<w:${tag}(?:\\s[^>]*)?/>`));
    if (m) settings = settings.replace(m[0], '');
    return m ? m[0] : '';
  };
  const background = take('displayBackgroundShape');
  const evenOdd = take('evenAndOddHeaders');
  const hyph = ['autoHyphenation', 'consecutiveHyphenLimit', 'hyphenationZone', 'doNotHyphenateCaps'].map(take).join('');
  zip.file('word/settings.xml', settings.replace(/(<w:settings[^>]*>)/, `$1${background}<w:embedTrueTypeFonts/>${hyph}${evenOdd}`));

  const FIELD_RUN = /<w:r>(<w:rPr>(?:(?!<\/w:rPr>).)*<\/w:rPr>)((?:<w:fldChar[^>]*\/>|<w:instrText[^>]*>[^<]*<\/w:instrText>|<w:t[^>]*>[^<]*<\/w:t>|<w:tab\/>)+)<\/w:r>/g;
  const PART = /<w:fldChar[^>]*\/>|<w:instrText[^>]*>[^<]*<\/w:instrText>|<w:t[^>]*>[^<]*<\/w:t>|<w:tab\/>/g;
  for (const name of Object.keys(zip.files).filter((n) => /^word\/(document|header\d*|footer\d*)\.xml$/.test(n))) {
    const xml = await zip.file(name).async('string');
    zip.file(name, xml
      .replace(/<w:highlightCs\b[^>]*\/>/g, '')
      .replace(FIELD_RUN, (whole, rPr, inner) => {
        if (!inner.includes('<w:fldChar')) return whole;
        return inner.match(PART).map((p) => {
          const run = `<w:r>${rPr}${p}</w:r>`;
          return p.includes('fldCharType="separate"') ? `${run}<w:r>${rPr}<w:t>1</w:t></w:r>` : run;
        }).join('');
      }));
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

const buf = await repair(await Packer.toBuffer(doc));
fs.writeFileSync(out, buf);
console.log(`✓ ${path.relative(process.cwd(), out)}  ${V.label}  ${Math.round(buf.length / 1024)} KB`);
