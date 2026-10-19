#!/usr/bin/env python3
"""
Builds the static inputs of the NexBridge-IT letterhead (D-071): the fonts Word embeds and
the page artwork of each design variant. Run it only when the logo, the fonts or a variant's
artwork change; its outputs are committed, so `npm run brief` never needs Python.

    pip install fonttools uharfbuzz cairosvg
    python3 print/brief/make-assets.py

Fonts (print/brief/fonts/). "Archivo" is a style-linked pair — Regular (wdth 100, wght 400)
and a "Bold" face that is really wght 600, so Ctrl+B in Word gives the house semibold instead
of a smeared fake bold. "Archivo SemiExpanded SemiBold" (wdth 112, wght 600) carries the
subject line and headings. All are static instances of the SIL OFL variable font (no Reserved
Font Name; the licence ships next to them), subset to Latin.

Artwork (print/brief/assets/<variant>-seite1.svg and -folgeseite.svg, each with a 300 dpi PNG
twin, the raster fallback Word needs for SVG). Everything that never changes per letter is
artwork: bands, strips, the lockup, the offer line, the footer contact line, fold marks. Text in
the artwork is set with HarfBuzz from the font instances and stored as outlines, so it looks the
same on every machine. The glider is read from the canonical sources at build time and never
redrawn: website/public/logo-mark.svg on a dark ground, website/public/favicon.svg (the glider
in its graphite chip) on a light one, as docs/02-brand.md requires.

The variants leave the drawing-office register on the founder's direction (D-071, like D-066):
no mono labels, no title block, no datasheet hairlines. Brand tokens and fonts still bind.
"""
import re
import sys
import urllib.request
from pathlib import Path

import cairosvg
import uharfbuzz as hb
from fontTools import subset
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
FONTS = HERE / 'fonts'
ASSETS = HERE / 'assets'
CACHE = HERE / '.cache'  # gitignored download cache for the variable source font
VF_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/archivo/Archivo%5Bwdth%2Cwght%5D.ttf'

# Brand tokens — docs/07-brand-kit.md §2. No hex value from anywhere else.
GRAPHITE, GRAPHITE_2, PAPER, SIGNAL = '#14171A', '#1B1F23', '#F7F5F0', '#FF4D00'
STEEL, STEEL_DEEP, STEEL_SOFT, LINE = '#8B959E', '#5B6770', '#39424A', '#D9D4CA'

UNICODES = (
    list(range(0x20, 0x7F)) + list(range(0xA0, 0x180)) + list(range(0x2010, 0x2028))
    + list(range(0x2030, 0x203B)) + [0x20AC, 0x2122, 0x2190, 0x2191, 0x2192, 0x2193, 0x2212, 0x2022]
)
MM = 10  # SVG user units per millimetre
W, H = 210, 297
LEFT, RIGHT = 25, 190          # writing area
FOLD_1, HOLE, FOLD_2 = 105, 148.5, 210

# Facts on the artwork — mirror website/src/config/site.ts (and D-029, D-068).
NAME, PEOPLE, CITY, REGION = 'NexBridge-IT', 'P Knopp · M Vaghani', 'Walldorf', 'Baden-Württemberg'
PHONE, EMAIL, WEB = '+49 173 9044077', 'nexbridge-it@mailbox.org', 'nexbridge-it.com'
OFFER = ('Automatisierung', 'KI-Agenten', 'Dashboards', 'Individualsoftware')


# ─── fonts ────────────────────────────────────────────────────────────────────────────
def rename(font, family, style='Regular'):
    ps = re.sub(r'[^A-Za-z0-9-]', '', family.replace(' ', '')) + f'-{style}'
    full = family if style == 'Regular' else f'{family} {style}'
    table = font['name']
    for rec in list(table.names):
        if rec.nameID in (16, 17, 21, 22, 25):
            table.removeNames(nameID=rec.nameID)
    for pid, eid, lid in ((3, 1, 0x409), (1, 0, 0)):
        table.setName(family, 1, pid, eid, lid)
        table.setName(style, 2, pid, eid, lid)
        table.setName(f'{full};NexBridge-IT letter subset', 3, pid, eid, lid)
        table.setName(full, 4, pid, eid, lid)
        table.setName(ps, 6, pid, eid, lid)
    bold = style == 'Bold'
    os2 = font['OS/2']
    # The outlines carry the real weight (600 for the bold face); the flags only tell Word which
    # face of the family a run asks for, so it never synthesises a fake bold.
    os2.usWeightClass = 700 if bold else 400
    os2.fsSelection = (os2.fsSelection & ~0b1100001) | (0b100000 if bold else 0b1000000)
    font['head'].macStyle = 1 if bold else 0
    for tag in ('STAT', 'DSIG'):
        if tag in font:
            del font[tag]


def build_fonts():
    FONTS.mkdir(exist_ok=True)
    CACHE.mkdir(exist_ok=True)
    vf = CACHE / 'Archivo-VF.ttf'
    if not vf.exists():
        print('downloading the Archivo variable font')
        urllib.request.urlretrieve(VF_URL, vf)
    opts = subset.Options()
    opts.layout_features, opts.name_IDs, opts.name_languages = ['*'], ['*'], ['*']
    opts.notdef_outline, opts.glyph_names = True, False
    made = {}
    for key, family, style, loc, fname in (
        ('text', 'Archivo', 'Regular', {'wght': 400, 'wdth': 100}, 'Archivo-Regular.ttf'),
        ('strong', 'Archivo', 'Bold', {'wght': 600, 'wdth': 100}, 'Archivo-Bold.ttf'),
        ('head', 'Archivo SemiExpanded SemiBold', 'Regular', {'wght': 600, 'wdth': 112}, 'Archivo-SemiExpanded-SemiBold.ttf'),
    ):
        font = instancer.instantiateVariableFont(TTFont(vf), loc)
        rename(font, family, style)
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=UNICODES)
        sub.subset(font)
        font.save(FONTS / fname)
        made[key] = FONTS / fname
        print(f'  font  {(FONTS / fname).relative_to(ROOT)}  {(FONTS / fname).stat().st_size // 1024} KB')
    return made


# ─── drawing primitives ───────────────────────────────────────────────────────────────
def text(font_path, s, size_mm, x_mm, baseline_mm, fill, tracking_em=0.0, anchor='start', colors=None):
    """Shape `s` with HarfBuzz; return SVG paths and the run width in mm."""
    hbfont = hb.Font(hb.Face(hb.Blob.from_file_path(str(font_path))))
    buf = hb.Buffer()
    buf.add_str(s)
    buf.guess_segment_properties()
    hb.shape(hbfont, buf, {'kern': True, 'liga': True})
    tt = TTFont(font_path)
    upem, glyphs, order = tt['head'].unitsPerEm, tt.getGlyphSet(), tt.getGlyphOrder()
    scale = size_mm * MM / upem
    track = tracking_em * upem
    width = (sum(p.x_advance + track for p in buf.glyph_positions) - track) * scale / MM
    x0 = x_mm * MM - {'start': 0, 'middle': width * MM / 2, 'end': width * MM}[anchor]
    pen_x, out = 0.0, []
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        pen = SVGPathPen(glyphs)
        glyphs[order[info.codepoint]].draw(TransformPen(pen, (
            scale, 0, 0, -scale, x0 + (pen_x + pos.x_offset) * scale, baseline_mm * MM - pos.y_offset * scale)))
        d = re.sub(r'-?\d+\.\d+', lambda n: f'{float(n.group()):.1f}', pen.getCommands())  # 0.01 mm is plenty
        if d:
            out.append(f'<path fill="{(colors or {}).get(info.cluster, fill)}" d="{d}"/>')
        pen_x += pos.x_advance + track
    return out, width


def cap_height(font_path):
    tt = TTFont(font_path)
    return tt['OS/2'].sCapHeight / tt['head'].unitsPerEm


def rect(x, y, w, h, fill):
    return f'<rect x="{x * MM:.1f}" y="{y * MM:.1f}" width="{w * MM:.1f}" height="{h * MM:.1f}" fill="{fill}"/>'


def svg_inner(path):
    src = path.read_text()
    inner = re.search(r'<svg[^>]*>(.*)</svg>', src, re.S).group(1)
    return re.sub(r'<!--.*?-->', '', inner, flags=re.S).strip(), re.search(r'viewBox="([^"]+)"', src).group(1)


def mark_native(x_mm, y_mm, height_mm):
    """The glider on a dark ground: website/public/logo-mark.svg, geometry untouched."""
    inner, vb = svg_inner(ROOT / 'website/public/logo-mark.svg')
    vw, vh = (float(v) for v in vb.split()[2:])
    assert abs(vw / vh - 1.692) < 0.01, 'logo-mark.svg is no longer the 1.692:1 glider this layout assumes'
    s = height_mm * MM / vh
    return f'<g transform="translate({x_mm * MM:.2f},{y_mm * MM:.2f}) scale({s:.6f})">{inner}</g>', vw / vh * height_mm


def mark_chip(x_mm, y_mm, side_mm):
    """The glider on a light ground: website/public/favicon.svg — the mark in its graphite chip."""
    inner, vb = svg_inner(ROOT / 'website/public/favicon.svg')
    assert vb == '0 0 32 32', 'favicon.svg is no longer the 32×32 chip this layout assumes'
    return f'<g transform="translate({x_mm * MM:.2f},{y_mm * MM:.2f}) scale({side_mm * MM / 32:.5f})">{inner}</g>'


def lockup(fonts, x, top, mark_h, on_dark):
    """Mark + wordmark + signal period. The mark is 1.35 × the wordmark's cap height, as in the
    site header (Header.astro: a 20 px mark against a 21.6 px wordmark)."""
    head = fonts['head']
    cap = cap_height(head)
    if on_dark:
        art, mark_w = mark_native(x, top, mark_h)
        obj_w, obj_h = mark_w, mark_h
        gap = 0.5 * mark_h                                   # D-050
    else:
        side = mark_h * 32 / 17.14                           # the chip whose glider is mark_h tall
        art, obj_w, obj_h = mark_chip(x, top, side), side, side
        gap = 0.4 * side                                     # on a solid chip 0.5 × read as two objects
    size = mark_h / 1.35 / cap
    baseline = top + obj_h / 2 + cap * size / 2              # centred on the cap band
    word = f'{NAME}.'
    paths, width = text(head, word, size, x + obj_w + gap, baseline, PAPER if on_dark else GRAPHITE,
                        tracking_em=-0.01, colors={len(word) - 1: SIGNAL})
    return [art] + paths, obj_w + gap + width, baseline, size


def flow_line(x0, x1, cy, spread=3.2):
    """The brand's flow-line (docs/07-brand-kit.md §7) drawn flat for a letterhead: two muted
    process lines run in, converge, and leave as the one signal line ending in a filled arrowhead.
    Same grammar as the closing signature — 1.5 : 2.5 stroke ratio, butt caps, miter joins — at a
    proportion that fits beside the lockup instead of the signature's 300 × 76 box."""
    run = x1 - x0
    xm, xc, head = x0 + 0.52 * run, x0 + 0.80 * run, 4.2
    m = lambda v: f'{v * MM:.1f}'
    curve = lambda y: (f'M{m(x0)} {m(y)} H{m(xm)} C {m(xm + 0.6 * (xc - xm))} {m(y)}, '
                       f'{m(xm + 0.6 * (xc - xm))} {m(cy)}, {m(xc)} {m(cy)}')
    return (f'<g fill="none" stroke-linecap="butt" stroke-linejoin="miter">'
            f'<path d="{curve(cy - spread)}" stroke="{STEEL_DEEP}" stroke-width="{0.33 * MM:.2f}"/>'
            f'<path d="{curve(cy + spread)}" stroke="{STEEL_DEEP}" stroke-width="{0.33 * MM:.2f}"/>'
            f'<path d="M{m(xc)} {m(cy)} H{m(x1 - head + 0.3)}" stroke="{SIGNAL}" stroke-width="{0.55 * MM:.2f}"/>'
            f'<path d="M{m(x1)} {m(cy)} L{m(x1 - head)} {m(cy - 1.9)} V{m(cy + 1.9)} Z" fill="{SIGNAL}" stroke="none"/></g>')


def fold_marks(color):
    return [f'<path d="M{5 * MM} {y * MM:.1f} h{length * MM}" stroke="{color}" stroke-width="2" fill="none"/>'
            for y, length in ((FOLD_1, 4), (HOLE, 6), (FOLD_2, 4))]


def offer_line(fonts, x, baseline, fill, anchor='end', size=2.3, rows=2):
    out = []
    groups = (OFFER[:2], OFFER[2:]) if rows == 2 else (OFFER,)
    for i, group in enumerate(groups):
        p, _ = text(fonts['head'], '  ·  '.join(group).upper(), size, x, baseline - (len(groups) - 1 - i) * size * 1.7,
                    fill, tracking_em=0.12, anchor=anchor)
        out += p
    return out


def contact_lines(fonts, y, fill, sep_fill, x_left=LEFT, x_right=RIGHT, size=2.45):
    """Footer contact: company and place left, reachability right — one quiet line each side."""
    left, _ = text(fonts['text'], f'{NAME}  ·  {PEOPLE}  ·  {CITY}, {REGION}', size, x_left, y, fill)
    right, _ = text(fonts['text'], f'{PHONE}  ·  {EMAIL}  ·  {WEB}', size, x_right, y, fill, anchor='end')
    return left + right


def page(body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}mm" height="{H}mm" viewBox="0 0 {W * MM} {H * MM}">\n'
            + '\n'.join(body) + '\n</svg>\n')


def write(name, svg):
    ASSETS.mkdir(exist_ok=True)
    (ASSETS / f'{name}.svg').write_text(svg)
    cairosvg.svg2png(bytestring=svg.encode(), write_to=str(ASSETS / f'{name}.png'), dpi=300)
    print(f'  art   print/brief/assets/{name}.svg (+ .png)')


# ─── variants ─────────────────────────────────────────────────────────────────────────
# Each returns (first page, follow page). Footer geometry must match FOOTER in build-brief.mjs.

TAGLINE = 'Prozesse, die von selbst laufen.'   # the site's hero line (ui.ts hero.h1a + hero.h1b)


def band_flow(band_h, strip_h, x_merge, lines_y, width=0.32):
    """The flow-line told by the band itself: two fine process lines enter from the left edge,
    sweep down and merge into the signal strip, which leaves at the right edge — the output."""
    cy = band_h - strip_h / 2                                  # the strip closes the band from inside
    m = lambda v: f'{v * MM:.1f}'
    bend = x_merge - 34
    paths = [f'<path d="M0 {m(y)} H{m(bend)} C {m(bend + 20)} {m(y)}, {m(x_merge - 12)} {m(cy)}, {m(x_merge)} {m(cy)}" '
             f'stroke="{STEEL_DEEP}" stroke-width="{width * MM:.2f}" fill="none" stroke-linecap="butt"/>' for y in lines_y]
    return paths + [rect(x_merge, band_h - strip_h, W - x_merge, strip_h, SIGNAL)]


def graphitband(f):
    """A — a graphite band across the top: the glider in its native colours with the wordmark, the
    site's tagline and the offers on the right, and the flow-line — two fine lines that merge into
    the signal strip leaving at the right edge. The footer band answers with a strip on the left.
    Full bleed: best from a print shop or as PDF; an office printer leaves white at the edges."""
    band, strip = 38, 1.8
    p1 = [rect(0, 0, W, band, GRAPHITE)]
    p1 += band_flow(band, strip, 128, (27.5, 31.5))
    art, _, base, _ = lockup(f, LEFT, 11, 9, on_dark=True)
    p1 += art
    tag, _ = text(f['head'], TAGLINE, 3.3, RIGHT, base, PAPER, tracking_em=-0.005, anchor='end')
    p1 += tag + offer_line(f, RIGHT, band - strip - 3.4, STEEL, size=1.9)   # the offers ride the output
    p1 += [rect(0, 282, W, 15, GRAPHITE), rect(0, 282, 82, strip, SIGNAL)]
    p1 += contact_lines(f, 291.2, STEEL, STEEL)
    p1 += fold_marks(STEEL_DEEP)

    band2 = 22
    p2 = [rect(0, 0, W, band2, GRAPHITE)]
    p2 += band_flow(band2, 1.4, 128, (15.5, 18.5), width=0.28)
    art, _, _, _ = lockup(f, LEFT, 6.5, 6, on_dark=True)
    p2 += art + [rect(0, 282, W, 15, GRAPHITE), rect(0, 282, 82, strip, SIGNAL)]
    p2 += contact_lines(f, 291.2, STEEL, STEEL)
    return page(p1), page(p2)


def signallinie(f):
    """B — a light page. The lockup in its chip, the brand's flow-line signature running out of
    the offer line to the right margin, and a graphite rule with a signal end inside the printable
    area above the contact line. Nothing bleeds, so any office printer reproduces it."""
    p1 = []
    top, mark_h = 15, 5.6
    art, lock_w, base, size = lockup(f, LEFT, top, mark_h, on_dark=False)
    p1 += art
    chip = mark_h * 32 / 17.14
    p1.append(flow_line(LEFT + lock_w + 9, RIGHT, top + chip / 2))   # runs out of the wordmark
    p1 += offer_line(f, LEFT, 33.5, STEEL_DEEP, anchor='start', size=2.2, rows=1)
    p1 += [rect(LEFT, 281, RIGHT - LEFT - 30, 0.9, GRAPHITE), rect(RIGHT - 30, 281, 30, 0.9, SIGNAL)]
    p1 += contact_lines(f, 287.2, STEEL_DEEP, STEEL_DEEP, size=2.35)
    p1 += fold_marks(STEEL_DEEP)
    p2 = []
    art, _, _, _ = lockup(f, LEFT, 12, 4, on_dark=False)
    p2 += art + [rect(LEFT, 281, RIGHT - LEFT - 30, 0.9, GRAPHITE), rect(RIGHT - 30, 281, 30, 0.9, SIGNAL)]
    p2 += contact_lines(f, 287.2, STEEL_DEEP, STEEL_DEEP, size=2.35)
    return page(p1), page(p2)


def seitenleiste(f):
    """C — a graphite strip down the left edge with a signal accent beside the letterhead and the
    fold marks in paper on the strip; a light page with the lockup in its chip. The strip bleeds:
    best from a print shop or as PDF."""
    strip = 13
    p1 = [rect(0, 0, strip, H, GRAPHITE), rect(strip, 0, 1.4, 45, SIGNAL)]
    art, _, base, _ = lockup(f, LEFT, 15, 5.6, on_dark=False)
    p1 += art + offer_line(f, RIGHT, base, STEEL_DEEP)
    p1 += contact_lines(f, 287.2, STEEL_DEEP, STEEL_DEEP, size=2.35)
    p1 += fold_marks(PAPER)
    p2 = [rect(0, 0, strip, H, GRAPHITE), rect(strip, 0, 1.4, 24, SIGNAL)]
    art, _, _, _ = lockup(f, LEFT, 12, 4, on_dark=False)
    p2 += art + contact_lines(f, 287.2, STEEL_DEEP, STEEL_DEEP, size=2.35)
    return page(p1), page(p2)


VARIANTS = {'graphitband': graphitband, 'signallinie': signallinie, 'seitenleiste': seitenleiste}

if __name__ == '__main__':
    try:
        fonts = build_fonts()
        for name, build in VARIANTS.items():
            first, follow = build(fonts)
            write(f'{name}-seite1', first)
            write(f'{name}-folgeseite', follow)
    except AssertionError as err:
        sys.exit(f'make-assets: {err}')
