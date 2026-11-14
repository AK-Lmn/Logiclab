# LogicLab logo: Open Frame

The open frame brings one observable block into view. It identifies a calm, precise learning tool without drawing code syntax, a snake, or a laboratory flask. The forest palette continues the existing interface. The outlined LogicLab wordmark uses custom spacing and a square i-dot that echoes the block.

## Use the right file

| Application | Artwork |
| --- | --- |
| Main logo on light backgrounds | `masters/logiclab-horizontal.svg` |
| Main logo on dark backgrounds | `masters/logiclab-horizontal-reversed.svg` |
| Compact vertical placement | `masters/logiclab-stacked.svg` or its reversed version |
| Symbol at 24px or larger | `masters/logiclab-symbol.svg` |
| Symbol below 24px | `masters/logiclab-symbol-small.svg` |
| White symbol on a dark surface | `masters/logiclab-symbol-reversed.svg` |
| Wordmark without a symbol | `masters/logiclab-wordmark.svg` or its reversed version |
| Platform app icon | `masters/logiclab-app-icon.svg`; PNGs in `exports/symbol/` |
| Browser favicon | `exports/symbol/favicon.svg` or `favicon.ico` |
| Black, white, forest, or raster artwork | Corresponding folders under `exports/` |

The standard detached block is inset eight units from the frame's implied corner. The small cut aligns all key edges to the 16px pixel grid. The reversed symbol uses a 31-unit frame instead of 32 units and a 62-unit block instead of 64. Reversed wordmarks use a slightly lighter outlined weight. These are deliberate optical variants; do not redraw them from one another.

## Spacing and minimum sizes

Use one frame thickness as the clear-space unit: 32 units on the 256-unit symbol master. Keep at least that distance between the visible artwork and unrelated elements. For the wordmark alone, use the square i-dot's width as the clear-space unit.

Screen minimums: 16px for the small symbol, 24px for the display symbol, 120px wide for the wordmark, 160px wide for the horizontal lockup, and 140px wide for the stacked lockup. Use the symbol alone when a lockup would be smaller. Recommended print minimum for the symbol is 6mm; physical proofs have not been tested.

The favicon keeps a white small-cut symbol on a forest tile so it remains visible on light and dark browser chrome. App and touch icons use the display artwork on a full-bleed forest background. The symbol occupies 56.25% of the app-icon square, keeping its outer corners inside the central 80% maskable safe circle. Leave platform rounding to the operating system.

## Palette

| Color | HEX | RGB | Approximate CMYK | Use |
| --- | --- | --- | --- | --- |
| Forest | `#193C2A` | 25, 60, 42 | 58, 0, 30, 76 | Primary artwork and tiles |
| Paper | `#E5E1D8` | 229, 225, 216 | 0, 2, 6, 10 | Preferred warm background |
| Interface ink | `#242C25` | 36, 44, 37 | 18, 0, 16, 83 | Header wordmark within the app |
| White | `#FFFFFF` | 255, 255, 255 | 0, 0, 0, 0 | Reversed artwork |
| Black | `#000000` | 0, 0, 0 | 0, 0, 0, 100 | One-color reproduction |

CMYK values are mathematical, unprofiled approximations. A printer must proof the actual stock and output profile. No Pantone match has been assigned. White on Forest measures 12.20:1; interface ink on Paper measures about 11.01:1. Artwork must remain distinguishable in one color and must not convey meaning through color alone.

## Typography and licensing

The wordmark is based on Instrument Sans at weight 550, with optical pair spacing and a custom square i-dot. The reversed wordmark uses weight 525. All final logo lettering is outlined as filled paths. SVG and PNG artwork does not require an installed font.

The interface retains Instrument Sans and DM Mono for normal UI and code. Do not type the logo with a normal text element or replace its outlines with a different font.

The [official Instrument Sans source](https://github.com/Instrument/instrument-sans) and [OFL 1.1 license](https://github.com/google/fonts/blob/main/ofl/instrumentsans/OFL.txt) document the font's provenance. A copy of the original font and its license is retained in `source/` for reproducibility. The font remains under its own license; the logo artwork does not imply endorsement by the typeface authors.

## Avoid

- Do not stretch, skew, rotate, add shadows, outline the shapes, round the corners, or recolor individual pieces.
- Do not move the block, close the open corner, add code brackets, or substitute the old connected-node symbol.
- Do not place forest artwork on a dark background. Use the supplied reversed version.
- Do not put the symbol directly over busy imagery or patterns. Use an approved solid tile or clear background.
- Do not rearrange the spacing or relative size of a supplied lockup.

## Source and application

`mark.json` is the geometric source for the app component, generated SVG favicon, and raster icon routes. `wordmark.json` contains the outlined lettering. `build_identity.py` rebuilds the vector masters from these inputs and the licensed source font. It requires Python 3 with `fonttools`; the web application does not depend on Python font tooling. Run `npm run tokens` after changing mark geometry or palette, then `npm run build` to regenerate the application icons. The token freshness command checks both CSS and the SVG app icon.

The repository retains production artwork, export variants, the source font and license, and the reproducible vector builder. Draft concepts and temporary QA material are excluded.

Trademark clearance, reverse-image clearance, print proofs, embroidery, and broad audience recognition have not been tested. Arrange a professional clearance search before a public brand launch. No trademark ownership or legal clearance is claimed.
