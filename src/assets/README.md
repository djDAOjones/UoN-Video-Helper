# Brand assets

Two files belong here and neither is in the repository yet. Both are optional
at build time: `src/ui/brand-assets.ts` looks for them by name, uses whichever
it finds, and the app builds and runs correctly without either.

| File | What | Until it is here |
| --- | --- | --- |
| `uon-logo-white.svg` (or `.png`) | The white-out University of Nottingham logo, for the blue header band | The header shows the app's name alone |
| `lora-bold.woff2` | Lora Bold, for headings | Headings use Georgia, the brand's own substitute |

## The logo

From the brand team's library, linked from
<https://www.nottingham.ac.uk/brand/visual/logos.aspx>. Do not copy it from the
website, redraw it, recolour it or crop it: it is a protected trademark. The
white-out version is the one for a Nottingham Blue ground.

It is shown 50 px high — the brand's narrowest tier — with an exclusion zone of
half that on every side, from `--uon-logo-height` in
`src/styles/tokens.brand.css`. A larger tier is the brand team's call.

## Lora

Lora is published under the SIL Open Font License 1.1, which allows it to be
bundled and self-hosted; keep the licence text beside the file as `OFL.txt`.
Only the bold weight is used. Nothing is fetched from a font service at
runtime — the app's promise is that it makes no request that is not its own.

Circular, the brand's sans, is licensed and cannot be committed to a public
repository. The body text uses Arial, which is the brand's stated substitute.

## Licence

These files are not covered by the repository's MIT licence. See the README's
"Licence and trademarks" section.
