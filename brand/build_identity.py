import html
import json
import math
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[1]


def number(value):
    return f'{float(value):.2f}'.rstrip('0').rstrip('.') or '0'


def outlined_wordmark(weight):
    font = instantiateVariableFont(
        TTFont(ROOT / 'brand/source/InstrumentSans.ttf'),
        {'wght': weight, 'wdth': 100}, inplace=False,
    )
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    cap = font['OS/2'].sCapHeight
    xheight = font['OS/2'].sxHeight
    position = 0
    pieces = []
    bounds = BoundsPen(glyphs)
    spacing = [-18, -12, -10, -6, -4, -22, -10, 0]

    def draw_letter(index, char, pen):
        target = TransformPen(pen, (1, 0, 0, -1, pieces[index][0], cap))
        if char == 'i':
            advance = font['hmtx'][cmap[ord(char)]][0]
            stem = 112 if weight >= 550 else 106
            dot = 120 if weight >= 550 else 116
            for left, bottom, width, height in (
                ((advance - stem) / 2, 0, stem, xheight),
                ((advance - dot) / 2, cap - dot + 8, dot, dot),
            ):
                target.moveTo((left, bottom))
                target.lineTo((left + width, bottom))
                target.lineTo((left + width, bottom + height))
                target.lineTo((left, bottom + height))
                target.closePath()
        else:
            glyphs[cmap[ord(char)]].draw(target)

    for index, char in enumerate('LogicLab'):
        pieces.append((position, char))
        draw_letter(index, char, bounds)
        position += font['hmtx'][cmap[ord(char)]][0] + spacing[index]

    x0, y0, x1, y1 = bounds.bounds
    pen = SVGPathPen(glyphs, ntos=number)
    shifted = TransformPen(pen, (1, 0, 0, 1, 16 - x0, 16 - y0))
    for index, (_, char) in enumerate(pieces):
        draw_letter(index, char, shifted)
    return {
        'viewBox': f'0 0 {number(x1 - x0 + 32)} {number(y1 - y0 + 32)}',
        'width': round(x1 - x0 + 32, 2),
        'height': round(y1 - y0 + 32, 2),
        'path': pen.getCommands(),
    }


def svg(viewbox, body, title):
    _, _, width, height = viewbox.split()
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" '
        f'width="{width}" height="{height}" role="img" aria-labelledby="title">\n'
        f'  <title id="title">{html.escape(title)}</title>\n{body}\n</svg>\n'
    )


def main():
    mark = json.loads((ROOT / 'brand/mark.json').read_text())
    tokens = json.loads((ROOT / 'tokens/colors.json').read_text())
    forest = tokens['semantic']['action']['primary']['$value']
    wordmark = outlined_wordmark(550)
    reverse_wordmark = outlined_wordmark(525)
    (ROOT / 'brand/wordmark.json').write_text(json.dumps(wordmark, indent=2) + '\n')
    target = ROOT / 'brand/masters'
    target.mkdir(exist_ok=True)

    def save(name, viewbox, body, label):
        (target / f'logiclab-{name}.svg').write_text(svg(viewbox, body, label), encoding='utf-8')

    for name, geometry, color in (
        ('symbol', mark['display'], forest),
        ('symbol-small', mark['small'], forest),
        ('symbol-reversed', mark['reverse'], '#ffffff'),
    ):
        save(name, mark['viewBox'], f'  <path fill="{color}" d="{geometry}"/>', 'LogicLab symbol')

    for suffix, color, letters, geometry in (
        ('', forest, wordmark, mark['display']),
        ('-reversed', '#ffffff', reverse_wordmark, mark['reverse']),
    ):
        save(f'wordmark{suffix}', letters['viewBox'],
             f'  <path fill="{color}" d="{letters["path"]}"/>', 'LogicLab wordmark')
        scale = .18
        width = math.ceil(320 + letters['width'] * scale)
        ty = round((256 - letters['height'] * scale) / 2, 2)
        save(f'horizontal{suffix}', f'0 0 {width} 256',
             f'  <path fill="{color}" d="{geometry}"/>\n'
             f'  <path fill="{color}" transform="translate(288 {ty}) scale({scale})" d="{letters["path"]}"/>',
             'LogicLab horizontal logo')
        stack_scale = .08
        stack_x = round((400 - letters['width'] * stack_scale) / 2, 2)
        save(f'stacked{suffix}', '0 0 400 256',
             f'  <path fill="{color}" transform="translate(120 0) scale(.625)" d="{geometry}"/>\n'
             f'  <path fill="{color}" transform="translate({stack_x} 166) scale({stack_scale})" d="{letters["path"]}"/>',
             'LogicLab stacked logo')

    save('app-icon', mark['viewBox'],
         f'  <path fill="{forest}" d="M0 0H256V256H0Z"/>\n'
         f'  <path fill="#ffffff" transform="translate(32 32) scale(.75)" d="{mark["reverse"]}"/>',
         'LogicLab app icon')
    print(f'Built ten logo masters. Wordmark: {wordmark["width"]} x {wordmark["height"]} units.')


if __name__ == '__main__':
    main()
