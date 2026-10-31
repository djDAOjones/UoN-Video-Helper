<!-- markdownlint-disable -->
# VH-217's before and after: the format "?", 30 October 2026

VH-217's stage-rule measure, one page by `table-1page.mjs`. The records, every one kept, are in [`vh217-records-2026-10-30/`](vh217-records-2026-10-30/).

## Provenance

| | Before | After |
| --- | --- | --- |
| Commit | `bdf6b6d2ab8a` | `bdf6b6d2ab8a` |
| Diff hash | `c2af35959eea2bc7` (1 lines of status) | `87ae1c6b75cce652` (4 lines of status) |
| Instrument revision | `e0a55331a7155cd3` | `e0a55331a7155cd3` |

**Differs between groups:** diff hash: c2af35959eea2bc7, 87ae1c6b75cce652, dd171e2a95f72247.

- `vh217-driver.mjs` sha1 `549bceaf10ee1dac092b2022a62c0bc6f4a93b1e`
- `vh217-states.mjs` sha1 `cde32f11c762b9e378c38d438c879da9e283e26b`
- `proof-combined.mjs` sha1 `5439ab94d02d8b396e76749d258f85aff92beffb`
- `seq.zsh` sha1 `af2f663fb6c98734dd34e0d50a9ef024c1f491db`
- `go.sh` sha1 `3956dcef21244605d7d26983881c45222c777c80`
- `walk.sh` sha1 `5b9e6d3f2d53b91b3113c28500a65745293289b6`
- `jobs.zsh` sha1 `354b6596e6069215f5675a7412bd4bdded551474`

## Runs, power and load

| Group | UTC | Cells, reached | Power | Load median, peak | Samples at 8 or above |
| --- | --- | --- | --- | --- | --- |
| before-a | 12:50:54–13:15:54 | 288, 271 | AC Power, mode 2 | 6.18, 29.63 | 16 of 50 |
| after-a | 17:42:24–18:07:34 | 288, 272 | Battery Power, mode 2 | 22.06, 36.35 | 38 of 51 |
| before-b | 13:15:55–14:01:50 | 288, 268 | AC Power, mode 2 | 7.95, 30.64 | 45 of 92 |
| after-b | 18:07:35–18:53:21 | 288, 268 | Battery Power, AC Power, mode 2 | 7.63, 32.82 | 43 of 92 |
| before-c | 14:02:51–14:39:36 | 288, 264 | AC Power, mode 2 | 5.98, 15.6 | 21 of 74 |
| after-c | 18:53:23–19:30:00 | 288, 264 | AC Power, mode 2 | 10.63, 61.86 | 47 of 74 |
| before-d | 14:39:37–15:22:23 | 288, 264 | AC Power, mode 2 | 6.43, 18.96 | 30 of 86 |
| after-d | 20:04:03–20:46:49 | 288, 264 | AC Power, mode 2 | 8.91, 74.68 | 47 of 86 |
| before-e2 | 16:25:38–17:09:29 | 288, 264 | AC Power, mode 2 | 7.34, 48.46 | 38 of 88 |
| after-e | 20:46:50–21:31:24 | 288, 264 | AC Power, mode 2 | 4.85, 11.51 | 6 of 89 |
| before-states2 | 17:15:02–17:41:44 | probe | AC Power, Battery Power, mode 2 | 4.84, 13.7 | 3 of 54 |
| after-states3 | 23:06:46–23:33:02 | probe | AC Power, mode 2 | 5.62, 10.99 | 5 of 53 |
| before-e (void, set aside) | 15:27:24–15:31:52 | 31, 30 | AC Power, Battery Power, mode 2 | 12.15, 20.02 | 8 of 9 |
| before-states (void, set aside) | 17:13:30–17:13:37 | probe | AC Power, mode 2 | 7.5, 7.5 | 0 of 1 |
| after-states (void, set aside) | 21:31:25–21:52:05 | probe | AC Power, Battery Power, mode 2 | 3.31, 7.57 | 0 of 42 |
| after-states2 (void, set aside) | 22:37:52–23:04:51 | probe | Battery Power, mode 2 | 10.41, 22.23 | 35 of 54 |

## Before → after

Scenario cells: 1440 before (1331 reached), 1440 after (1332 reached); **1437 unmoved**. Not on the other side: 0 after-only, 0 before-only.

| What moved | Cells |
| --- | --- |
| reached: failed/fail → ok/pass | S-141__en-GB__w320__forced-light-font32 |
| overflow: undefined → fail | S-141__en-GB__w320__forced-light-font32 |
| ax: undefined → pass | S-141__en-GB__w320__forced-light-font32 |
| targets: undefined → fail | S-141__en-GB__w320__forced-light-font32 |
| contrastText: undefined → pass | S-141__en-GB__w320__forced-light-font32 |
| contrastExtra: undefined → cannot-determine | S-141__en-GB__w320__forced-light-font32 |
| measure: undefined → pass | S-141__en-GB__w320__forced-light-font32 |
| type: undefined → fail | S-141__en-GB__w320__forced-light-font32 |
| focus: undefined → pass | S-141__en-GB__w320__forced-light-font32 |
| player: undefined → not-applicable | S-141__en-GB__w320__forced-light-font32 |
| formatTip: undefined → fail | S-141__en-GB__w320__forced-light-font32 |
| footer: undefined → pass | S-141__en-GB__w320__forced-light-font32 |
| limiting: undefined → not-applicable | S-141__en-GB__w320__forced-light-font32 |
| videoLanguage: undefined → pass | S-141__en-GB__w320__forced-light-font32 |
| row "the hint word for word": undefined → pass | S-141__en-GB__w320__forced-light-font32 |
| row "the "?" 44 x 44 after its promise's text; the tip under it, in the ite": undefined → fail | S-141__en-GB__w320__forced-light-font32 |
| row "said by its polite region": undefined → pass | S-141__en-GB__w320__forced-light-font32 |
| reached: failed/pass → ok/pass | S-141__ms-MY__w1280__forced-light-font32 |
| contrastExtra: cannot-determine → pass | S-141__ms-MY__w1280__forced-light-font32 |
| row "Escape: closed, focus on the "?"": fail → pass | S-142__zh-Hans__w401__forced-light |
| row "a click on its text keeps it open; a click on the page title closes it": fail → pass | S-142__zh-Hans__w401__forced-light |

Failing alike on both sides, so not moved by this change:

| Instrument or row | Cells |
| --- | --- |
| targets | 1331 |
| type | 1331 |
| formatTip | 403 |
| overflow | 311 |
| row "Tab: closed, focus on Video type's checked radio" | 136 |
| row "Shift+Tab: closed, focus on Page language's radio in English, the noti" | 136 |
| row "the "?" 44 x 44 after its promise's text; the tip under it, in the ite" | 135 |
| row "nothing off the page with the tip open" | 20 |
| focus | 20 |

Page probe, 1440 readings a side: `help` moved in 1440; `promises` moved in 1; `tip` moved in 1; `tipShown` moved in 1; `formatExpanded` moved in 1; `focus` moved in 1.

States probe: 3888 readings before, 3888 after; 1392 unmoved.

| Field | Readings moved | Commonest before → after |
| --- | --- | --- |
| `box.left` | 1800 | 249.44 → 241.44 (296) |
| `box.right` | 1800 | 269.44 → 261.44 (296) |
| `words.gapInkToSquare` | 1636 | 17.85 → 9.85 (776) |
| `words.gapBoxToSquare` | 1636 | 16.45 → 8.45 (1164) |
| `colours.background` | 1408 | rgba(0, 0, 0, 0) → rgb(16, 38, 59) (139) |
| `colours.color` | 1408 | rgb(16, 38, 59) → rgb(255, 255, 255) (352) |
| `contrast.fillOnPage` | 1408 | 21 → 1 (278) |
| `contrast.glyphOnFill` | 1338 | 21 → 19.04 (352) |
| `colours.outline` | 1120 | rgb(16, 38, 59) → rgb(255, 255, 255) (208) |
| `colours.border` | 852 | rgb(16, 38, 59) → rgb(40, 60, 79) (139) |
| `contrast.borderOnPage` | 852 | 21 → 19.04 (139) |
| `words.targetOverInk` | 776 | 0 → 2.15 (776) |
| `words.inkPxHittingTarget` | 776 | 0 → 4 (480) |
| `contrast.ringOnFill` | 576 | 10.32 → 1.36 (72) |
| `colours.adjust` | 426 | auto → none (426) |
| `contrast.ringOnPage` | 288 | 19.04 → 21 (144) |

## Notes

## What the records can't state

**The two changes, read by the `elementFromPoint` probe** (`vh217-states.mjs`, named as the 2.5.5 after-reading because the walker's reading does not count a target drawn round the control, wish VH-205.1; 3,888 readings a side):

| Format "?" at rest, 16 px font | en-GB | ms-MY | zh-Hans |
| --- | --- | --- | --- |
| Ink to square, before → after | 17.85 → 9.85 px | 17.85 → 9.85 px | 26.37 → 18.37 px |
| Character's box to square, before → after | 16.45 → 8.45 px | 16.45 → 8.45 px | 16.45 → 8.45 px |
| Target over the last character's ink | 0 → 2.15 px | 0 → 2.15 px | 0 → 0 px |
| Ink pixels a click there lands on the "?" | 0 → 4 | 0 → 3 or 4 | 0 → 0 |

The Chinese full stop's ink sits at the left of a wide character, so its ink gap stays the widest; its box gap is the same 8.45 px. At the 32 px font, on the same line: 19.67 px in en-GB and ms-MY, 36.73 in zh-Hans, none of the target over the words; wrapped under the words, 12 en-GB, 4 ms-MY and 4 zh-Hans readings, 12.7 px below them, unchanged. The item expected about 4 px of overlap; the ink overlap measured is 2.15 px, and it is reported, not a stop.

**The target:** every point of the 44 × 44 square on the page hits its "?", in all 3,600 readings, both sides, both "?"s. The boxes are unchanged: format 20 × 20 at 16 px and 40 × 40 at 32 px; onset 44 × 44 and 44 × 76. Sideways scroll is unchanged, 708 of 3,600 readings each side, all at the 32 px font (w320, w375, w400, w401), and none at the default font: VH-209's for S-113's six records.

**The open state:** computed colours moved only in the open states: open, focused, hovered, pressed, pressed by key, touch. Glyph on fill, lowest of each: light 8.17 (hover), dark 10.32 (hover); fill on ground, lowest 7.42 (light hover) and 8.93 (dark hover). Forced light 19.04 and forced dark 13.76 to 14.37, Highlight's alpha ignored by the probe: at the 0.8 macOS gives it, composited on the ground, the worst pair is still above 7:1 by arithmetic, not read. The ring on the ground is 13.34 or higher, and CanvasText in forced colours. A disabled open "?" keeps the disabled look in every mode.

**A repair, found in the clips, not by a number.** On the first candidate (`87ae1c6b75cce652`) the open "?" hovered under forced colours showed the token's grey, not Highlight: the (0,4,0) token hover beat the (0,3,0) forced rule, and `forced-color-adjust: none` let it through. Its contrast passed. The forced hover now restates `background: Highlight`, with its test (`dd171e2a95f72247`). `after-states3` re-reads every state on the repaired diff; against `after-states2`, only forced colours' open-hovered and touch-open moved, 148 readings, and only `colours` and `contrast`. Groups a to e stand on the first candidate: those scenario cells were not re-walked, since the repair is one declaration inside one forced hover rule; VH-203's after-run reads the final page.

**WCAG, for what it touched:** 1.4.1 the open state is also `aria-expanded` and the tip itself, not colour alone. 1.4.6 glyph at 7:1 or above, as above. 1.4.10 no new sideways scroll, at default or 32 px. 1.4.11 fills at 3:1 or above against both grounds, as above. 1.4.13 the tip's hover and dismiss behaviour unchanged: Escape and the outside click read as before. 2.4.7 and 2.4.13 ring 2 px, offset 2 px, on both states. 2.5.5 by the probe above. 4.1.2 `aria-expanded` read true open and false closed, unchanged.

**Carbon, "one primary per state":** the filled "?" is a state, as the chosen segment is, and goes when its tip closes. It is no second primary by that reading; the owner sees it in VH-203's captures.

**Failing alike, reported, none edited:** `targets`, `type` and `formatTip`'s row, the walker's own 44 × 44 reading of the format "?" (wish VH-205.1, every reached cell, and S-141's row). `type`: the "?"'s 0.875rem / 1.25 / 600 is on none of the eight roles, every reached cell (wish VH-217.2). S-142's Tab and Shift+Tab neighbours (wish VH-216.1, his "Yes, leave them"). `overflow`, `nothing off the page` at the 32 px font (w320, w400, w401). `focus` on the onset "?" in ms-MY at w320, forced dark, 32 px: 20 cells, 446 px of ring against 464.

**Not reached, alike:** 108 cells a side at w375, 32 px font: the window reads 394 × 854 or wider because the phone emulation widens to the page's overflow, so the walker refuses them (wish VH-217.1). In the probe's same conditions, a mouse click at the "?"'s middle missed in 20 readings on each side, and the keyboard opened all 288; 28 of 48 touch taps opened, the same each side. One more before cell failed to reach, below.

**The three cells that moved,** each better after, none by the change: S-141 en-GB w320 forced-light-font32 (before: state predicate false, load 9 to 13); S-141 ms-MY w1280 forced-light-font32 (before: walk failed, load 12 to 30); S-142 zh-Hans w401 forced-light, Escape and the click rows (before: fail, load 10 to 15). Timing-sensitive cells were read against the load logs, not re-run; after-a ran at load 30 to 34 and reached them.

**Load and power.** Groups ran as high as the table states, from processes not this item's; each group's gate started below 8. Readings are DOM, layout, colour and focus order, with no job or duration timed, on the precedent of VH-216's ruling. Power: mode 2 throughout. `before-states2` moved AC to battery at 17:19:33Z, `after-a` and part of `after-b` ran on battery, `after-states2` on battery: all above 50%, his rule; no group below 82%.

**Void or set aside, kept:** `before-e`, light only, stopped by the Mac's restart; `before-states`, no readings, the job's folder absent; `after-states`, 2,980 readings, Chrome's socket closed within seconds of AC to battery at 21:51:58Z, the Mac then asleep until about 21:59Z. `after-states2` is not void: whole, superseded by the repair.

**Beside the before:** a separate session, now ended, ran Vite on :5173 and a browser pane twice between about 14:15Z and 14:39Z, its estimate, not logged, during before-c and into before-d's start; it touched no file in this checkout. Those groups' moved rows: none.

**`matrix.mjs`'s enlargement count** does not count the combined 32 px modes: a provenance count only; the probe's `rootFontPx` and the record's `seen` read 32 in them. **Not walked:** a real phone, a screen reader, Windows High Contrast. The owner sees the overlap and the look in VH-203's captures.
