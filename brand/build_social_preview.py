"""Build outlined social artwork; rasterize with Sharp (see brand/README.md)."""
from pathlib import Path
import xml.etree.ElementTree as ET

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[1]
PAPER, FOREST = '#e5e1d8', '#193c2a'
parts = []


def rect(x, y, w, h, fill, radius=0, stroke='none'):
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}"/>')


def text(value, x, y, size, color=FOREST, weight=500, centered=False, mono=False):
    font = instantiateVariableFont(TTFont(ROOT / 'brand/source/InstrumentSans.ttf'),
                                   {'wght': weight, 'wdth': 100})
    glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
    scale = size / font['head'].unitsPerEm
    advances = [size * .62 if mono else glyphs[cmap[ord(c)]].width * scale for c in value]
    if centered:
        x -= sum(advances) / 2
    pen = SVGPathPen(glyphs)
    for c, advance in zip(value, advances):
        glyphs[cmap[ord(c)]].draw(TransformPen(pen, (scale, 0, 0, -scale, x, y)))
        x += advance
    parts.append(f'<path fill="{color}" d="{pen.getCommands()}"/>')


rect(0, 0, 1200, 630, PAPER)
logo = ET.parse(ROOT / 'brand/masters/logiclab-horizontal.svg').getroot()
parts.append('<g transform="translate(423 35) scale(.3284)">')
for child in logo:
    if child.tag.endswith('path'):
        parts.append(ET.tostring(child, encoding='unicode').replace('ns0:', '').replace(':ns0', ''))
parts.append('</g>')
text('See your Python code think.', 600, 180, 52, weight=650, centered=True)
text('Python, step by step', 600, 221, 25, centered=True)

# A plausible completed update during the third loop iteration: n=2, total=3.
rect(64, 260, 1072, 310, FOREST, 18)
for x in (92, 116, 140):
    parts.append(f'<circle cx="{x}" cy="283" r="5" fill="{PAPER}"/>')
text('example.py', 178, 290, 16, PAPER)
text('STEP 8 / 9', 1010, 290, 15, PAPER)
rect(806, 306, 330, 202, '#f2efe8')
text('Variables', 834, 342, 23, weight=650)
for y, label, value in ((360, 'n', '2'), (420, 'total', '3')):
    rect(830, y, 282, 46, PAPER, 8, '#b9c0b4')
    text(label, 848, y + 31, 23, mono=True)
    text(value, 1068, y + 31, 23, mono=True)
rect(160, 431, 616, 48, '#344d3c', 8)
for i, (line, y) in enumerate((('total = 0', 360), ('for n in range(3):', 410), ('    total += n', 463)), 1):
    text(str(i), 101, y, 23, '#bdcbbf', mono=True)
    text(line, 184, y, 27, '#edf1e8', mono=True)
parts.append('<path d="M168 445l10 9-10 9z" fill="#bce5c5"/>')
rect(64, 508, 1072, 62, '#dad5ca', 0)
parts.append(f'<path d="M101 530h3v20h-3zm17 0v20l-14-10z M156 530v20l16-10z M211 530v20l14-10zm14 0h3v20h-3z" fill="{FOREST}"/>')
text('Explore every step', 268, 547, 18)
for i in range(5):
    x = 713 + i * 79
    rect(x, 522, 58, 34, FOREST if i == 2 else PAPER, 7, '#8a9789')
    text(str(i + 1), x + 29, 547, 22, PAPER if i == 2 else FOREST, centered=True)

output = ROOT / 'brand/social-preview.svg'
output.write_text('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">\n'
                  '<title>LogicLab — See your Python code think.</title>\n' + '\n'.join(parts) + '\n</svg>\n')
print(output)
