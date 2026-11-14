# LogicLab identity files

Start with the [one-page quick guide](quick-guide.png) and [usage guide](usage-guide.md).

- `masters/`: ten vector masters, with all lettering outlined.
- `exports/`: one-color SVGs, transparent PNGs, favicon/ICO, app and touch icons, maskable icon, webmanifest, and example head markup.
- `source/`: original Instrument Sans font and its OFL license.
- `mark.json`, `wordmark.json`, `build_identity.py`: shared geometry and reproducible outline construction.

The production identity is Open Frame. Draft concepts, presentation boards, and local QA captures are excluded from the repository.

## Social sharing preview

`social-preview.svg` is the outlined source for the approved product-focused sharing card.
The website serves `src/app/opengraph-image.png` (1200 × 630) through Next.js image metadata.
To rebuild, install the same `fonttools` dependency used for the identity masters, then run:

```sh
python brand/build_social_preview.py
node -e "require('sharp')('brand/social-preview.svg').png().toFile('src/app/opengraph-image.png')"
```

All lettering uses the bundled Instrument Sans font and is outlined, so the rendered image
does not depend on machine fonts. After deploying, sharing services may need their cached
preview refreshed. The root layout uses the verified production domain,
`https://loglab.vercel.app`, for absolute image metadata; update `metadataBase` if the domain changes.

To rebuild the vector masters:

```sh
python -m pip install fonttools
python brand/build_identity.py
npm run tokens
npm run build
```

Reversed exports use the dedicated reversed masters. The primary favicon uses the tiled small cut from the generated `src/app/icon.svg`; a transparent small symbol is supplied separately. The primary app and touch icons use `masters/logiclab-app-icon.svg`.

This kit does not include native AI/EPS documents, print proofs, or trademark clearance. SVG masters remain editable vectors.
