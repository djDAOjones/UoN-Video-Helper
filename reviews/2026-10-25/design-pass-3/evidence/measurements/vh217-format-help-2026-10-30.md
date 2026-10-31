<!-- markdownlint-disable -->
# VH-217's before and after: the format "?", 30 October 2026

VH-217's stage-rule measure, one page by `table-1page.mjs`. The records are in [`vh217-records-2026-10-30/`](vh217-records-2026-10-30/): each cell's outcomes and rows, the probes, states and logs whole, and in `detail/` the whole record of each moved or named failing cell.

## Provenance

| | Before | After |
| --- | --- | --- |
| Commit | `bdf6b6d2ab8a` | `bdf6b6d2ab8a` |
| Diff hash | `c2af35959eea2bc7` (1 lines of status) | `87ae1c6b75cce652` (4 lines of status) |
| Instrument revision | `e0a55331a7155cd3` | `e0a55331a7155cd3` |

**Differs between groups:** diff hash: c2af35959eea2bc7, 87ae1c6b75cce652, dd171e2a95f72247, ea2ca5648c341917.

- `vh217-driver.mjs` sha1 `549bceaf10ee1dac092b2022a62c0bc6f4a93b1e`
- `vh217-states.mjs` sha1 `cde32f11c762b9e378c38d438c879da9e283e26b`
- `vh217-states2.mjs.txt` sha1 `9b2eac6c8738ac318543cce3870fcefab60757f4`
- `proof-combined.mjs` sha1 `5439ab94d02d8b396e76749d258f85aff92beffb`
- `proof-combined.proof2.log.txt` sha1 `97b402032291c7799a9427230b353480881eb586`
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
| before-font32 | 23:55:52–00:00:37 | probe | AC Power, mode 2 | 5.46, 8.46 | 1 of 10 |
| after-font32 | 00:00:39–00:05:23 | probe | AC Power, mode 2 | 4.58, 6.36 | 0 of 10 |
| before-e (set aside) | 15:27:24–15:31:52 | 31, 30 | AC Power, Battery Power, mode 2 | 12.15, 20.02 | 8 of 9 |
| before-states (set aside) | 17:13:30–17:13:37 | probe | AC Power, mode 2 | 7.5, 7.5 | 0 of 1 |
| after-states (set aside) | 21:31:25–21:52:05 | probe | AC Power, Battery Power, mode 2 | 3.31, 7.57 | 0 of 42 |
| after-states2 (set aside) | 22:37:52–23:04:51 | probe | Battery Power, mode 2 | 10.41, 22.23 | 35 of 54 |

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
| `box.left` | 1800 | 249.44 → 241.44 (252) |
| `box.right` | 1800 | 269.44 → 261.44 (252) |
| `words.gapInkToSquare` | 1548 | 17.85 → 9.85 (600) |
| `words.gapBoxToSquare` | 1548 | 16.45 → 8.45 (900) |
| `colours.background` | 1408 | rgba(0, 0, 0, 0) → rgb(16, 38, 59) (139) |
| `colours.color` | 1408 | rgb(16, 38, 59) → rgb(255, 255, 255) (352) |
| `contrast.fillOnPage` | 1408 | 21 → 1 (278) |
| `contrast.glyphOnFill` | 1338 | 21 → 19.04 (352) |
| `colours.outline` | 1120 | rgb(16, 38, 59) → rgb(255, 255, 255) (208) |
| `colours.border` | 852 | rgb(16, 38, 59) → rgb(40, 60, 79) (139) |
| `contrast.borderOnPage` | 852 | 21 → 19.04 (139) |
| `words.targetOverInk` | 600 | 0 → 2.15 (600) |
| `words.inkPxHittingTarget` | 600 | 0 → 4 (348) |
| `contrast.ringOnFill` | 576 | 10.32 → 1.36 (72) |
| `colours.adjust` | 426 | auto → none (426) |
| `contrast.ringOnPage` | 288 | 19.04 → 21 (144) |

## Notes

## What the records can't state

**This page replaces its first version,** [`vh217-format-help-first-2026-10-30.md`](vh217-format-help-first-2026-10-30.md), kept unchanged, which Codex's blind check read and corrected. Records were only added: `sources-first.txt` and `table-1page-first.mjs` are the first version's.

**The probe, corrected on Codex's must.** The first states probe (`vh217-states.mjs`) lost the 32 px font. `Page.captureScreenshot` with `captureBeyondViewport: true` drops `Page.setFontSizes`, so at w1280 and w320, where it took clips, each 32 px condition read 32 px at rest and 16 px for the rest: 528 readings a side, and every clip of those conditions, were not what they were labelled. `vh217-states2.mjs` takes its clips inside the viewport, around the "?"'s item and tip, and stops a condition whose root font is not its mode's. It re-read those 24 conditions on each side: `before-font32`, on a clone of the base with the walker's change alone (diff hash `c2af35959eea2bc7`, as the before), and `after-font32`. 624 readings each, 0 errors, 0 at the wrong font; they replace the first readings below, which stay in the records. The walker's own instruments kept the font: all 1,440 page probes a side, and each reached 32 px cell's target reads 40 × 40.

**The two changes, read by the `elementFromPoint` probe,** named as the 2.5.5 after-reading because the walker's reading does not count a target drawn round the control (wish VH-205.1). 3,888 readings a side:

| Format "?" at rest, 16 px font | en-GB | ms-MY | zh-Hans |
| --- | --- | --- | --- |
| Ink to square, before → after | 17.85 → 9.85 px | 17.85 → 9.85 px | 26.37 → 18.37 px |
| Character's box to square, before → after | 16.45 → 8.45 px | 16.45 → 8.45 px | 16.45 → 8.45 px |
| Target over the last character's ink | 0 → 2.15 px | 0 → 2.15 px | 0 → 0 px |
| Ink pixels on the middle line where a click lands on the "?" | 0 → 4 | 0 → 3 or 4 | 0 → 0 |

The Chinese full stop's ink sits at the left of a wide character, so its ink gap stays the widest; its box gap is the same 8.45 px. So "about 8 px" holds by the box in all three, by the ink in two. At the 32 px font, on the same line: 19.67 px in en-GB and ms-MY, 36.73 in zh-Hans, none of the target over the words; wrapped under the words, 12 en-GB, 4 ms-MY and 4 zh-Hans of the rest-state conditions, 12.7 px below them, the same each side. The item expected about 4 px of overlap; 2.15 px of ink measured, reported, not a stop.

**The target:** every sampled point of the 44 × 44 square that lies on the page hits its "?", a 2 px grid of 484 points, in all 3,600 readings, both sides, both "?"s. Boxes unchanged: format 20 × 20 at 16 px and 40 × 40 at 32 px; onset 44 × 44 and 44 × 76. Sideways scroll is unchanged: none at the default font; at the 32 px font, 972 of 3,600 readings each side (w320, w375, w400, w401). VH-209's item covers S-113's six records at 320 and 401 px, not this cross.

**The open state:** computed colours moved only in the open states: open, focused, hovered, pressed, pressed by key, touch. Glyph on fill, lowest: light 8.17, dark 10.32, both on hover. Fill on ground, lowest: light 7.42, dark 8.93. Forced colours: the probe ignores Highlight's 0.8 alpha; composited by arithmetic, not read, glyph on fill is 11.30 in forced light and 8.73 in forced dark at the lowest. A disabled open "?" keeps the disabled look in every mode. A press under forced colours inverts, so its fill is 1:1 with the ground and its Highlight border marks the control.

**A repair, found in the clips, not by a number.** On the first candidate (`87ae1c6b75cce652`) the open "?" hovered under forced colours showed the token's grey, not Highlight: the (0,4,0) token hover beat the (0,3,0) forced rule, and `forced-color-adjust: none` let it through. Its contrast passed. The forced hover now restates `background: Highlight`, with its test (`dd171e2a95f72247`). `after-states3` re-reads every state on the repaired diff; against `after-states2`, only forced colours' open-hovered and touch-open moved, 148 readings, only `colours` and `contrast`. Groups a to e stand on the first candidate, not re-walked, since the repair is one declaration in one forced hover rule; `after-font32` is on the final diff (`ea2ca5648c341917`), which adds only a test's title and its comment.

**WCAG, for what it touched.** 1.4.1: the open state is also the tip itself on the screen, and `aria-expanded` to a screen reader. 1.4.6: 7:1 or above, as above. 1.4.10: no scroll at the default font, none new at 32 px. 1.4.11: each fill at 3:1 or above against both grounds in light and dark; under forced colours the pressed state's border marks it, as above. 1.4.13: not applicable, since the tip opens on activation, not on hover or focus; Escape and the outside click are unchanged. 2.4.7: visible on both states. 2.4.13: ring 2 px, offset 2 px, 13.34:1 or higher on the ground; the onset "?" in ms-MY at w320 and 32 px fails, below. 2.5.5: by the probe above. 4.1.2: `aria-expanded` true open and false closed, as before.

**Carbon, "one primary per state":** the filled "?" is a state, as the chosen segment is, and goes when its tip closes.

**Does it look good.** Clips read by Claude and Codex at the default font, and by Claude at 32 px from `vh217-states2.mjs`: en-GB, zh-Hans and ms-MY, rest and open, 1280 and 320 px, light, dark and forced. Not committed; they stay in the walk folder. At w320 and 32 px the onset's field is cramped on both sides, and not good: "Plays" collides with the "?" and the select shows "Th" (VH-219's item names step 4's selects).

**Failing alike, reported, none edited:** `targets` and `formatTip`'s row are the walker's 44 × 44 reading of the format "?" (wish VH-205.1), every reached cell, with S-141's row. `type`: the "?"'s 0.875rem / 1.25 / 600 is on none of the eight roles, every reached cell (wish VH-217.2). S-142's Tab and Shift+Tab neighbours (wish VH-216.1, his "Yes, leave them"). `overflow` and "nothing off the page" at the 32 px font (w320, w400, w401). `focus` on the onset "?": 20 cells, S-17, S-97, S-98, S-113 and S-143, ms-MY, w320, all four 32 px modes, 444 to 460 px² at 3:1 against 464, by mode, within 2 px each side (`detail/`), VH-210's by its title.

**Not reached, alike:** 108 cells a side at w375 and the 32 px font, of 120: the phone emulation widens to the page's overflow, the window reads 394 × 854 or wider, and the walker refuses them. All 1,440 cells were attempted; this is a shortfall in coverage, not 108 passes; VH-209's and VH-210's measures name this width and font and would meet the same refusal (wish VH-217.4). The probe read those conditions: a mouse click at the "?"'s middle missed in 20 readings each side, 28 of 48 touch taps opened, and the keyboard opened all 288.

**The three cells that moved,** each better after: S-141 en-GB w320 forced-light-font32 (before: state predicate false, load 9 to 13); S-141 ms-MY w1280 forced-light-font32 (before: walk failed, load 12 to 30); S-142 zh-Hans w401 forced-light, Escape and the click rows (before: fail, load 10 to 15). These timing-sensitive cells were read against the load logs, not re-run. Load is a plausible cause, not a shown one; their whole records are in `detail/`.

**Load and power.** Groups ran as high as the table states, from processes not this item's; each group's gate started below 8. Readings are DOM, layout, colour and focus order, with no job or duration timed, on the precedent of VH-216's ruling. Power: mode 2 throughout. `before-states2` moved AC to battery at 17:19:33Z, on his move; `after-a`, part of `after-b`, `after-states2` and part of `after-states3` ran on battery: all above 50%, his rule, the lowest 80%.

**Set aside, kept:** `before-e`, light only, stopped by the Mac's restart; `before-states`, no readings, the job's folder absent; `after-states`, 2,980 readings, Chrome's socket closed within seconds of AC to battery at 21:51:58Z, the Mac then asleep until about 21:59Z; `after-states2`, whole, superseded by the repair.

**Beside the before:** a separate session, now ended, ran Vite on :5173 and a browser pane twice between about 14:15Z and 14:39Z, its estimate, not logged, during before-c and into before-d's start; it touched no file in this checkout. Neither group has a moved row.

**The combined modes:** `proof-combined.mjs`'s run at 12:45Z, before the before, all passing: `proof-combined.proof2.log.txt`. `matrix.mjs`'s enlargement count does not count them, a provenance count only; each cell's `seen` reads 32.

**For VH-203, not this item's: the walker's own 32 px page captures have the same fault.** `pageShot` (`qualify.mjs:954`) and `walk.mjs:435` and `:446` use `captureBeyondViewport: true`, so `S-141__en-GB__w1280__font32__page.png` is the page at 16 px on a canvas 2,860 px tall, half of it empty. The readings are not affected; what a person sees is. The walker stays as it is, on his word (wish VH-217.5).

**Not walked:** a real phone, a screen reader, Windows High Contrast.
