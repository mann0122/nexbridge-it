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
import math
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
    # Artwork-only cuts: they are set as outlines into the SVGs and never embedded, so they stay
    # in the gitignored cache.
    for key, loc in (('light', {'wght': 300, 'wdth': 100}), ('book', {'wght': 350, 'wdth': 100}),
                     ('medium', {'wght': 500, 'wdth': 100}), ('capsx', {'wght': 500, 'wdth': 116})):
        made[key] = CACHE / f'Archivo-{key}.ttf'
        if not made[key].exists():
            instancer.instantiateVariableFont(TTFont(vf), loc).save(made[key])
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


# ─── D · Schwung ─────────────────────────────────────────────────────────────────────────
# A family of fine, exactly parallel curves sweeps in from beyond the top-right corner and leaves
# the page at the right edge running level — the flow-line's direction, in left, out right. One
# curve is signal; the steel ones darken toward it and rise out of the paper. A smaller echo of
# the same family, turned through 180°, enters at the bottom-left, so the page reads corner to
# corner. The base curve is a quarter ellipse; every other curve is an exact offset of it (point
# plus d · unit normal), so the spacing never changes and no curve can cusp.

class Sweep:
    """Quarter ellipse around (cx, cy), semi-axes a (across) and b (down), facing the page:
    P(t) = (cx - a cos t, cy + b sin t). Curve k is the outward offset by k * step."""

    def __init__(self, cx, cy, a, b, step):
        self.cx, self.cy, self.a, self.b, self.step = cx, cy, a, b, step

    def point(self, t, d):
        c, s = math.cos(t), math.sin(t)
        nx, ny = -c / self.a, s / self.b
        n = math.hypot(nx, ny)
        return self.cx - self.a * c + d * nx / n, self.cy + self.b * s + d * ny / n


def _u(v):
    return f'{round(v * MM, 1):g}'


def bezier_chain(fn, t0, t1, segs):
    """Cubic Bézier chain through fn(t) on [t0, t1], Hermite tangents by central difference."""
    h = 1e-5
    ts = [t0 + (t1 - t0) * i / segs for i in range(segs + 1)]
    pts = [fn(t) for t in ts]
    der = []
    for t in ts:
        (x1, y1), (x2, y2) = fn(t - h), fn(t + h)
        der.append(((x2 - x1) / (2 * h), (y2 - y1) / (2 * h)))
    dt = (t1 - t0) / segs
    d = [f'M{_u(pts[0][0])} {_u(pts[0][1])}']
    for i in range(segs):
        (ax, ay), (bx, by) = pts[i], pts[i + 1]
        (dax, day), (dbx, dby) = der[i], der[i + 1]
        d.append(f'C{_u(ax + dax * dt / 3)} {_u(ay + day * dt / 3)} {_u(bx - dbx * dt / 3)} {_u(by - dby * dt / 3)} '
                 f'{_u(bx)} {_u(by)}')
    return ' '.join(d)


def visible_range(fn, box, lo=-1.2, hi=math.pi / 2 + 1.2, n=6000):
    """Longest contiguous t-run whose points lie inside box (x0, y0, x1, y1)."""
    x0, y0, x1, y1 = box
    best, cur = None, None
    for i in range(n + 1):
        t = lo + (hi - lo) * i / n
        x, y = fn(t)
        if x0 <= x <= x1 and y0 <= y <= y1:
            cur = (cur[0], t) if cur else (t, t)
        elif cur:
            if not best or cur[1] - cur[0] > best[1] - best[0]:
                best = cur
            cur = None
    if cur and (not best or cur[1] - cur[0] > best[1] - best[0]):
        best = cur
    return best


def sweep_family(sw, styles, transform, box, gid, fade=(0.25, 1.0), segs=18):
    """styles: (stroke, width_mm, opacity) per curve, index 0 nearest the corner. Steel curves
    fade from fade[0] where they enter to fade[1] where they leave; the signal curve stays whole."""
    out, defs = [], []
    for k, (stroke, width, opacity) in enumerate(styles):
        fn = lambda t, d=k * sw.step: transform(sw.point(t, d))
        t0, t1 = visible_range(fn, box)
        if stroke != SIGNAL:
            (x0, y0), (x1, y1) = fn(t0), fn(t1)
            defs.append(f'<linearGradient id="{gid}{k}" gradientUnits="userSpaceOnUse" x1="{_u(x0)}" y1="{_u(y0)}" '
                        f'x2="{_u(x1)}" y2="{_u(y1)}"><stop offset="0" stop-color="{stroke}" stop-opacity="{opacity * fade[0]:.2f}"/>'
                        f'<stop offset="1" stop-color="{stroke}" stop-opacity="{opacity * fade[1]:.2f}"/></linearGradient>')
            paint = f'url(#{gid}{k})'
        else:
            paint = stroke
        out.append(f'<path d="{bezier_chain(fn, t0, t1, segs)}" fill="none" stroke="{paint}" '
                   f'stroke-width="{width * MM:.2f}"/>')
    return ([f'<defs>{"".join(defs)}</defs>'] if defs else []) + out


def sweep_styles(n, signal_at, w_steel, w_signal, op_hi=0.9, op_lo=0.3, w_taper=0.06):
    """One curve in signal; steel-deep elsewhere, darkest beside the signal, paling away from it."""
    span = max(signal_at, n - 1 - signal_at) or 1
    out = []
    for k in range(n):
        if k == signal_at:
            out.append((SIGNAL, w_signal, 1.0))
            continue
        f = (abs(k - signal_at) - 1) / max(span - 1, 1)
        out.append((STEEL_DEEP, w_steel - w_taper * f, op_hi + (op_lo - op_hi) * f))
    return out


SWEEP = Sweep(cx=226.0, cy=-22.0, a=125.0, b=42.0, step=2.3)
SWEEP_N, SWEEP_SIGNAL_AT = 9, 6
INFO_X = 125.0   # DIN 5008 information block; the footer hangs from the same axis


def sweep_top(k=1.0, gid='t', limit=45):
    corner = lambda p: (W - k * (W - p[0]), k * p[1])                    # scale about the corner
    return sweep_family(SWEEP, sweep_styles(SWEEP_N, SWEEP_SIGNAL_AT, 0.24, 0.32), corner,
                        (-1.5, -1.5, W + 1.5, limit), gid)


def sweep_echo(k=0.42, gid='e'):
    turned = lambda p: (k * (W - p[0]), H - k * p[1])                    # corner (W, 0) → (0, H)
    return sweep_family(SWEEP, sweep_styles(SWEEP_N, SWEEP_SIGNAL_AT, 0.21, 0.28), turned,
                        (-1.5, 277, W, H + 1.5), gid)


def sweep_footer(f, size=2.2, lead=3.6, base=283.4):
    """Who and where at the information block's axis; how to reach us ending on the right margin."""
    who = [('medium', NAME, GRAPHITE), ('book', PEOPLE, STEEL_DEEP), ('book', f'{CITY}, {REGION}', STEEL_DEEP)]
    reach = [('book', PHONE, STEEL_DEEP), ('book', EMAIL, STEEL_DEEP), ('book', WEB, STEEL_DEEP)]
    x2 = RIGHT - max(text(f[key], s, size, 0, 0, c)[1] for key, s, c in reach)
    out = []
    for x, col in ((INFO_X, who), (x2, reach)):
        for i, (key, s, c) in enumerate(col):
            out += text(f[key], s, size, x, base + i * lead, c)[0]
    return out


def schwung(f):
    """D — a light page: the lockup in its chip, the site's tagline and the offers under it, the
    sweep in the top-right corner and its echo bottom-left, the contacts in two columns. Only line
    ends bleed, so an office printer loses nothing that matters."""
    p1 = sweep_top() + sweep_echo()
    art, _, _, _ = lockup(f, LEFT, 14.5, 5.2, on_dark=False)
    p1 += art
    p1 += text(f['light'], TAGLINE, 3.3, LEFT, 32.6, STEEL_SOFT, tracking_em=-0.005)[0]
    p1 += text(f['capsx'], '  ·  '.join(OFFER).upper(), 1.62, LEFT, 37.6, STEEL_DEEP, tracking_em=0.14)[0]
    p1 += sweep_footer(f) + fold_marks(STEEL)

    p2 = sweep_top(0.55, gid='f', limit=40) + sweep_echo()
    art, _, _, _ = lockup(f, LEFT, 21.0, 4.0, on_dark=False)            # baseline 26.2: build-brief's page number
    p2 += art + sweep_footer(f)
    return page(p1), page(p2)


VARIANTS = {'schwung': schwung, 'graphitband': graphitband, 'signallinie': signallinie, 'seitenleiste': seitenleiste}

if __name__ == '__main__':
    try:
        fonts = build_fonts()
        for name, build in VARIANTS.items():
            first, follow = build(fonts)
            write(f'{name}-seite1', first)
            write(f'{name}-folgeseite', follow)
    except AssertionError as err:
        sys.exit(f'make-assets: {err}')
