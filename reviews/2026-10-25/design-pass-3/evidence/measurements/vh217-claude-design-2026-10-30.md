<!-- markdownlint-disable -->

# VH-217 — Claude's design, saved 2026-10-30, before Codex's design answer is opened

## The product change (CSS and its pins; no element, string, listener, token value or spec change)
1. **The gap.** `.promise-with-help .help-button` `margin-left: var(--spacing-02)`, from `--spacing-04`. Rem-based, so it scales with the font. With the collapsed space, about 8 px, read as ink to square by the probe. `::after` untouched. Overlap of the target with "format." measured by `elementFromPoint`.
2. **The open state**, placed after `.help-button` (`app.css`, past `.button--secondary:hover`):
   - `.help-button[aria-expanded="true"]:not(:disabled)`: `background: var(--interactive); color: var(--text-on-interactive)`; the border is already `--interactive` from `.button--secondary`, so unset.
   - `…:hover`: `--interactive-hover`. `…:active`: `--interactive-active`. Specificity (0,3,0)+ beats `.button--secondary:hover` (0,2,0) and `.button--secondary:active:not(:disabled)` (0,3,0, earlier, and the open pressed rule is 0,4,0).
   - `:not(:disabled)` is how the disabled rule "still wins": the open rules do not apply to a disabled button, so `.button--secondary:disabled` paints it whatever its `aria-expanded`.
   - The border stays at rest `--interactive`; on hover or press the fill moves and the border stays one step apart, as a primary button's transparent border lets the fill show. Decision: set `border-color` to the same token in hover and active pairs, so no 1 px rim of a different blue. Three rules carry border-color.
3. **Forced colours**, in the existing block beside the primary's rules: `forced-color-adjust: none; border-color: Highlight; background: Highlight; color: HighlightText`, with `:focus-visible { outline-color: CanvasText }` (the primary's V-40: an opted-out element keeps the brand ring otherwise), `:hover { border-color: HighlightText }` (V-44) and `:active` inverted (VH-169), each with specificity past `.button--secondary:not(:disabled):active`.
4. **Words:** the comment at `app.css` :1113 and the test's description at `stylesheet.test.ts` :286 corrected: the tip's step clears the target; the gap no longer does at the default font.
5. **Tests.** `test/stylesheet.test.ts`: the margin; the three open rules with tokens; the forced block's four; order against `.button--secondary:hover`; `:not(:disabled)` on each. `test/contrast.test.ts`: a named pin of the three glyph-on-fill pairs in light and dark at 7:1 (the pairs exist in the general list; the pin names the "?" and asserts 7:1 for both palettes).
6. UI-STANDARDS: read for a rule that changes. None expected.

## Carbon: "one primary per state"
Filled dark while open is a selected state, as the chosen segment is, not an action ranked above Create. Inside a toggle's on state; it goes when closed. At most one "?" is open at a time (S-143). I hold it is not a second primary. Risk: with the tip open in step 4 before Create, a dark small square sits above the blue Create: the eye goes to Create by size and words. Codex weighs it.

## Other WCAG readings
1.4.1: the open state differs by fill and by the tip below, not colour alone. 1.4.6: 7:1 pins. 1.4.10: the gap shrinks, so 320 px cannot get worse by width; read. 1.4.11: the fill against the page is at least 3:1 (`--interactive` on layer tokens are pinned). 1.4.13: the tip opens by click, not hover: unchanged. 2.4.7 and 2.4.13: the ring is offset from the square, so its neighbour is the page, not the fill; in forced colours the ring is set to CanvasText. 2.5.5: walker reading excludes a drawn target (wish VH-205.1), so the `elementFromPoint` probe is named as the after-reading. 4.1.2: name, role, `aria-expanded` unchanged. 2.5.8 is met: no other target within; "format." is text, not a control, so overlap costs only a click on 4 px of words opening the tip.

## The verification change the item names
`qualify.mjs` only: three new mode names, `dark-font32`, `forced-light-font32`, `forced-dark-font32`; `setMode` derives forced, dark and font from the name; `assertReached`'s table gains the three and its 32 px check is `endsWith('font32')`. `font32`, `light`, `dark` and the forced modes unchanged: `setMode` sends the same protocol calls for them, and a proof shows it. Walker revision moves once, to one new revision before and after: `$REV` is the start block's, then `$REV2` throughout. Proof outside the walker (`$S/vh217-walk/proof-combined.mjs`): each new mode reaches root 32 px and the right media; a wrong expectation is refused by `assertReached`; old modes byte-same on the wire. Named for VH-209, VH-218, VH-219 and VH-210 to reuse.

## The walks
Full cross as the stage rule names it, no reduction:
- **Scenarios by `matrix.mjs` unchanged, plans in memory:** 10 scenarios (S-17, S-95, S-96, S-97, S-98, S-113, S-141, S-142, S-143, S-144) × 3 languages × 6 widths (w1280, w640, w401, w400, w375, w320) × 8 modes (light, dark, forced-light, forced-dark, each at 16 and 32 px) = 1,440 cells a side, with each one's `S-…` assertions. A scenario's `langs`/`views` are read by the walker's own plans only, so a plan in memory declares it beyond them, as VH-216 did. Focus-state scenarios (S-95, S-96, S-141, S-143, S-144) one plan per mode, since instruments blur.
- **The "?" states probe**, `vh217-states.mjs` outside the walker, on walker imports (`Walk`, `setViewport`, `setMode`, `key`, `MX_INIT`, `QUAL_INIT`): each "?" (format, onset) in each of 144 conditions, in five states (rest, hovered, focused, open, pressed; open also hovered and pressed, since those are the new rules): computed colours, border, outline, glyph-on-fill contrast, box, target by `elementFromPoint` on a 2 px grid over the 44 px square (the named 2.5.5 after-reading), overlap with the last text glyph, ink to square by Range and `measureText`, line height of the promise against the others, `scrollWidth`, tip box. 144 × 2 × 5 (+2) readings.
- **Before: every cell on the base** (the `PLAN-8:` commit, with the qualified walker), not VH-199's. The conditions differ by VH-216's move and the revision, and walking them all is the stricter reading of the item's "every other before cell". Same driver, same power mode.
- Expected to fail alike on both sides (his "Yes, leave them"): S-142's Tab and Shift+Tab neighbours, S-143, as wish VH-216.1 lists.
- Clips: en-GB, zh-Hans, ms-MY, rest/open, 1280/320, light/dark/forced, default and 32 px: read by Claude for "looks good" and not committed.

## Open points for judgement
The overlap's reading (about 4 px expected at 16 px). Whether the rim needs its own rule. Whether 2.5.5 by the probe satisfies the item.
