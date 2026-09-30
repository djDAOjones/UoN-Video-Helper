# Brand assets

The two brand files the app draws, and where they came from.
`src/ui/brand-assets.ts` looks each up by name at build time and uses whichever
it finds, so the app still builds and runs correctly without either — but both
are here now.

| File | What | Without it |
| --- | --- | --- |
| `uon-logo-white.svg` | The white University of Nottingham logo, for the blue header band | The header band is empty |
| `lora-bold.woff2` | Lora Bold, latin subset, for headings | Headings use Georgia, the brand's own substitute |
| `OFL.txt` | Lora's licence, the SIL Open Font License 1.1 | — |

## The logo

`UoN-Logo-Dark.svg`, the white logo from the header of
<https://www.nottingham.ac.uk/> (`/etc.clientlibs/uon/clientlibs/clientlib-v2/resources/images/`),
taken on 2026-09-30 at the maintainer's request and kept byte for byte. It is a
protected trademark: do not redraw, recolour or crop it.

It is drawn as the website draws it: 62 px high, top-left against the window
edge, 12 px of clear blue above and below and 20 px in from the left — the
`--uon-logo-*` tokens in `src/styles/tokens.brand.css`. A different size is the
brand team's call.

## Lora

Lora is the headings typeface on nottingham.ac.uk. This is
`lora-latin-700-normal.woff2` from the `@fontsource/lora` 5.3.0 package on the
npm registry, taken on 2026-09-30 with the maintainer's approval. The package is
not a dependency: only this one file and its licence were copied. Lora is
published under the SIL Open Font License 1.1, which allows it to be bundled and
self-hosted, and `OFL.txt` must stay beside it. Nothing is fetched from a font
service at runtime.

Circular, the brand's body typeface, is licensed and cannot be committed to a
public repository. The body text uses Arial, which is the brand's stated
substitute and is on every machine already.

## Licence

These files are not covered by the repository's MIT licence. See the README's
"Licence and trademarks" section.
