<!-- markdownlint-disable -->
# VH-212's before and after: heavy limiting's playback advice in the owner's words, 28 October 2026

This is [VH-212](../../../../../project/items/VH-212.md)'s stage-rule measure for pass 3's F15b. Heavy limiting's detail said "so play the new video before you save it", which a person whose player cannot play the new video (S-152) cannot do. The owner chose the words that replace that clause in Backlog review on 2026-10-27, and VH-212 makes exactly three replacements, nothing else in the detail and no other message:

| Language | Before | After |
| --- | --- | --- |
| en-GB | so play the new video before you save it | so play the new video before you use it |
| zh-Hans (machine) | 所以请在保存之前播放新视频 | 所以请在使用之前播放新视频 |
| ms-MY (machine) | sebelum anda menyimpannya | sebelum anda menggunakannya |

There is no walker diff, so one instrument revision, `198cfe660331f1bf`, holds for the qualification, the before, the proof and the after. The walker's predicates for these scenarios read the served tables (`/src/i18n/<tag>.ts`), so they move with the words. Before the after was walked, a proof drove the walker's own unchanged `limitingRows` on synthetic pages in three languages, and a probe read the served tables (section 7): 54 of 54 cases proved, and the probe OK in en-GB, zh-Hans and ms-MY.

Then every cell was walked before and after. The records are in [`vh212-records-2026-10-28/`](vh212-records-2026-10-28/), with the scripts that made and read them, each run's conditions and load log, and the compare (section 9).

## 1. Provenance

| | Before | After |
| --- | --- | --- |
| Source | the checkout at `b4ec37a` (VH-214), clean: porcelain 0 lines, each run's `run.json` source `dirty: false`, diff hash `e3b0c44298fc1c14` (the empty diff's) | the checkout at `b4ec37a` with the candidate's working-tree diff, ten modified files, unstaged: porcelain 10 lines, `dirty: true`, diff hash `afcc5b4a56f81580` in both runs |
| Instrument | revision `198cfe660331f1bf` | the same |
| Driver | VH-212 #2's `vh212-driver.mjs`, which runs the pass's runner (`matrix.mjs`) unchanged on a plan declared in memory, with a read-only probe after each scenario's state is set | the same file, unchanged (sha1 `a81e80e919eb782bfc0b4f892fa1edf5178f5482`) |
| Serving | Vite at :5181, headless Chrome on CDP :9251, one Chrome profile for every run, at 1280 and 320 CSS px | the same |
| Fixtures and faults | 36 fixtures made by the walker's own fixture script (`fixtures.log.txt`); the faults each scenario declares, F15b in S-152 | the same |
| Coverage | 96 of 96 in each job's manifest, whole, no record off the revision | the same |

The before is walked on this item's base and not taken from VH-199's records, which ran on `a3039c3` at instrument revision `2e7b0c044ce11f2b`, before VH-208 moved the warnings into the card. VH-199's records are the reference column for the line count (section 4.1), read by `vh199-lines-1.py` from the runs outside the repository.

## 2. The runs, their power and their load

The cells are the item's stage rule: S-131, S-132, S-135, S-136, S-137, S-138, S-151 and S-152, in en-GB, zh-Hans and ms-MY at 1280 and 320 px, in light, dark, forced light and forced dark: 192 cells. S-131 and S-132 are the controls, with no heavy warning.

| Run | When (UTC) | Cells | Power | Load (1 min): start / during / end |
| --- | --- | --- | --- | --- |
| qual-1 (the probe's qualification) | 20:22:52–20:24:01 | 4 of 4 | AC, 100%, power mode 2 | 6.52 / 6.77, 5.76 / 5.70 |
| before-1 | 20:24:44–20:41:36 | 192 of 192 | AC, 100%, power mode 2 | 4.89 / median 5.96, at 8 or above at 20:28:14–20:29:45 (peak 20.65) and 20:33:45–20:38:16 (peak 23.01) / 2.73 |
| proof-1 (section 7) | 21:19:07–21:19:43 | 54 of 54 cases, and the probe in three languages | AC, 100%, power mode 2 | 3.93 / — / 4.41 |
| after-1 | 21:41:40–21:58:37 | 192 of 192 | AC, 100%, power mode 2 | 2.76 / median 3.62, peak 6.40, never 8 / 3.63 |

- **Power.** The owner's rule is a before and its after in one power mode. Both ran on AC at 100%, power mode 2, every sample of both load logs.
- **Load, the before.** The load passed 8 in two windows, from another process. VH-212 #2 judged that VH-212's readings are static reads after the asserted state (text and layout), identical across all 24 cells of each scenario and every mode, so no low-load re-run was owed. Orchestrator #22 ruled on it, verbatim: "Your load judgement stands under the Load rule: a re-run is owed only where readings could depend on timing, and static reads that came out identical in all 24 cells of each scenario don't. Record it in the table's notes as you have it."
- **Load, the after.** It never reached 8, so no judgement is owed. The after's readings came out as the before's in every cell but one known timing-dependent row, which moved at low load too (section 5).
- **Every job exited 0** (each run's `conditions.txt`). The loads come from the 30-second `.load.log` of each run.

## 3. What changed: the words, and only the words

Compared cell by cell by `compare-after-1.py` (`compare-after-1.txt`): **192 cells against 192, no finding.**

- **The detail.** In each of the 144 warning cells, the detail read from the card and from the summary equals the before's with the old clause replaced by the new, in the cell's language. The cause, the consequence and the "Next time" advice are unchanged.
- **In five places**, in every language, the after holds the new clause exactly as many times as the before held the old one, and the old one nowhere, with no clause in any other language:

| Scenario | Heavy warning | Detail | Card | `#status` | Body | Served table |
| --- | --- | --- | --- | --- | --- | --- |
| S-131, S-132 (controls) | none | 0 | 0 | 0 | 0 | 1 |
| S-135, S-136, S-137, S-151, S-152 | in the card | 1 | 1 | 1 | 2 | 1 |
| S-138 | in the card | 1 | 1 | 0 | 1 | 1 |

  Each count is the same in all 24 cells of its scenario, before (old clause) and after (new clause). S-138's `#status` holds no clause at the probe's moment, before and after alike; its completion write, read from the mutation log, holds it (section 4.2).
- **The ms-MY caution.** `warnings.cutShort.detail` also holds "sebelum anda menggunakannya". No cut-short item (`p.notification-body "Fail ini mungkin terputus`) is in any of the 64 ms-MY cells, before or after, and no place held the new words in the before, so every ms-MY count is this clause.
- **The rows.** The limiting rows, the scenarios' asserts and S-152's subresults are identical before and after in every cell.

## 4. The readings

### 4.1 The warning's height and line count, beside VH-199's

The detail paragraph's height and the warnings block's (`warnBox`) come from the driver's read-only probe, qualified on fixture pages first (`qual-1`); the line count, box and widest line from the `measure` instrument's item for that paragraph. **VH-199 holds no height**, so its column says "not recorded". Its line counts are read by script from the records of its four colour modes (`vh199-lines-1.txt`).

| Language, width | VH-199: height; lines, box, widest | Before: height; lines, box, widest | After: height; lines, box, widest |
| --- | --- | --- | --- |
| en-GB, 1280 px | not recorded; 4, 448, 448 (12 cells) | 84 px; 4, 448, 448 | 84 px; 4, 448, 448 |
| en-GB, 320 px | not recorded; 9, 185, 184 (12 cells) | 189 px; 9, 185, 184 | 189 px; 9, 185, **177** |
| zh-Hans, 1280 px | not recorded; 3, 448, 448 (12 cells) | 63 px; 3, 448, 448 | 63 px; 3, 448, 448 |
| zh-Hans, 320 px | not recorded; 7, 185, 182 (6 cells) | 147 px; 7, 185, 182 | 147 px; 7, 185, 182 |
| ms-MY, 1280 px | not recorded; 5, 448, 448 (12 cells) | 105 px; 5, 448, 448 | 105 px; 5, 448, 448 |
| ms-MY, 320 px | not recorded; 11, 185, 184 (6 cells) | 231 px; 11, 185, 184 | 231 px; 11, 185, 184 |

- **The same in every mode and warning scenario.** Each before and after value holds in all four modes of S-135 to S-138, S-151 and S-152. The line count by the text's client rects agrees with `measure`'s in every cell. Line height 21 px throughout.
- **The warnings block**, unchanged in all 192 cells: with heavy limiting alone (S-135, S-137, S-152), 149, 299, 128, 236, 170 and 341 px in the table's order; with the metadata warning too (S-136, S-138, S-151), 253, 508, 211, 403, 274 and 613 px. The heading's, the item's, the detail paragraph's and the block's heights and widths are equal before and after: the warning takes the same room.
- **The one change** is en-GB at 320 px: the widest line is 177 px, not 184, in all 24 cells (six scenarios × four modes), and its longest line 29 characters, not 30. "use it" is shorter than "save it"; the paragraph still wraps to nine lines. ms-MY's two extra letters added no line at 320 px.
- **VH-199 agrees with the before** in every cell the two share. Its `font32` cells (a 896 px box) and `spacing` cells (12, 8 and 15 lines at 320 px) are outside this matrix. The controls have no warning in VH-199's records, as in ours.

### 4.2 The live region's write at completion

The completion's write to `#status` is read from the mutation log. This is exposure, not speech. What a screen reader says is the person checklist's task A.

- **After,** in S-135, en-GB: "Your video is ready. Worth knowing about the finished video: The loudest moments were held down hard. To reach the usual level, the tool had to hold down the loudest moments of this recording hard. That can make a voice sound flat or squashed, so play the new video before you use it. Next time, try adjusting how you record the sound." The before is the same line with "save" for "use". zh-Hans and ms-MY carry their detail the same way, with the new clause.
- **Coverage.** The write holds the new clause once and the old one nowhere in all 144 warning cells, in the job's language: S-137's and S-138's in the job's other language, as the before held the old one, since they change the page language after the job. Their rows for the spoken line read cannot-determine by the instrument's design, before and after.
- **No second announcement.** The number of `#status` writes is the same before and after in every one of the 192 cells.
- **With Announce progress off** (S-151), the same line is written: S-151's assert "#status at the completion's own write" passes in 24 of 24, before and after.
- **VH-208's row** "the heavy warning's detail whole after its title, in the line spoken at completion" passes in S-135, S-136, S-151 and S-152 (96 cells), before and after.

### 4.3 S-152's state (F15b)

This is the state the words are for: the finished player cannot play, while the card and Save stay.

- The player's `MediaError` is recorded, and the warning stands first and word for word: the assert and all five subresults pass in 24 of 24, before and after, among them "Save completes as S-62" and "the heavy-limiting warning stands word for word beside 'Saved.'".
- The detail now reads "…so play the new video before you use it…" beside a player that cannot play. In the before it asked them to play it before saving, which they could not do here; the new words hold whether or not the video plays here, as the item asks.

## 5. The instruments, before against after: one known timing-dependent row

Every instrument's outcome is identical before and after in 180 of 192 cells (`tally-1.txt`; per cell in `before-1.outcomes.jsonl` and `after-1.outcomes.jsonl`). The 12 that differ are all S-138's `player` instrument, on its row "paused a second after the card appeared":

| Run | Fails of 24 | Groups that fail (each group's four modes alike) |
| --- | --- | --- |
| before-1 | 16 | all but en-GB 1280 px and ms-MY 320 px |
| after-1 | 20 | all but zh-Hans 1280 px |

- **This is the row VH-208's table records as timing-dependent** (its section 7, on Orchestrator #21's ruling): the row is sampled a second after the card appears, and S-138's next step, F4d's download and then Create's "discard it?" question, races it. The after ran below load 8 throughout and the row still moved, so it reads the walker's timing, not this change, which touches no element. Wish VH-199.1 already names it for the walker change before VH-203's after-run; no new wish line and no walker change here.
- **Unchanged in every cell, before and after:** S-138's "control target" fails in all 24; `targets` and `type` fail in all 192 and `contrastExtra` reads cannot-determine in all 192, the pass's pre-existing findings; `measure` cannot-determine in 40 and `focus` in 32; `ax`, `overflow`, `contrastText`, `footer` and `videoLanguage` pass in all 192.

## 6. WCAG, re-checked for what VH-212 touched

| Criterion | Reading | Result |
| --- | --- | --- |
| 1.4.8 Visual presentation | the detail's `measure` item passes in all 144 warning cells before and after, within the house limit: its longest line 72 characters in en-GB and 69 in ms-MY at 1280 px, 32 glyphs in zh-Hans (limits 80 and 40); line height 21 px on 14 px text; no width, line height or font rule changed. The `type` instrument's page-wide outcome is the same before and after in every cell (section 5) | unchanged; the browser's 200% enlargement is a person's to check, a limitation |
| 1.4.10 Reflow | `overflow` passes in all 96 cells at 320 px, before and after: no horizontal scroll, no offender, nothing clipped or spilling | holds |
| 2.4.6 Headings and labels | the warning's heading is the same text in every cell before and after, and the card's title is unchanged; `ax` passes in 192 of 192 before and after | holds |
| 3.1.5 Reading level | by reading: one plainer verb, "use" for "save" (使用 for 保存, menggunakannya for menyimpannya); no word added, and the en-GB detail is one character shorter | a reading, not a measurement: the change adds no difficulty. The reading level is a person's to confirm (spec §9.3), a limitation; in zh-Hans and ms-MY, machine-translated, it is not shown until a colleague checks the language on the live page (wish VH-105.2) |
| 4.1.3 Status messages | the completion's write to `#status` carries the detail once, with the new clause, in the cell's or the job's language; the same number of writes before and after in every cell; the same line with Announce progress off (S-151) | holds as exposure; what a screen reader says is task A, a limitation |

## 7. The proof and the served-table probe, before the after

`vh212-proof.mjs` (run by `proof-1.sh`) imports the walker's `limitingRows`, `assertRows`, `MX_INIT`, `P8_INIT` and `SCENARIOS` unchanged and draws synthetic pages on the candidate's own origin, so `__mx.msg` reads the served candidate tables. It ran under the walk lock on the candidate, 21:19:07–21:19:43Z, launcher exit 0, AC 100%, power mode 2, load 3.93 to 4.41, commit `b4ec37a` with 10 porcelain lines, revision `198cfe660331f1bf`.

- **The probe:** by the app's own language switch, `window.__mx.msg('warnings.heavyLimiting.detail')` in en-GB, zh-Hans and ms-MY holds the new clause once and the old none, and equals the owner's detail whole; the en-GB heading is the base's (`proof-1.probe.json`).
- **The proof, 54 of 54** (18 a language, `proof-1.proof.json`, `proof-1.proof.log.txt`): the new page with the new table passes; the old page with the new table fails; the old completion line fails the detail row; a heading-only line fails it; a save that keeps the card passes "unchanged after a save" and one that changes it fails; a language change with the new words passes S-137's "then in the new language" and with the old words fails; the completion's detail row is cannot-determine once the language changed, as S-137 and S-138 read by design. Each case's page made exactly one status write.

## 8. What these cells do not walk

The 200% enlargement, the `spacing` and `font32` modes and the 375 px view are outside this item's matrix; VH-212 changes no layout rule, and the warning's geometry is unchanged here (section 4.1). What a screen reader says is the person checklist's task A.

## 9. The records folder

- **The walks, one cell per line:** `before-1.summary.json` and `after-1.summary.json` (by `summarise-1.py`: status, revision, the probe's read, the detail and its clause counts, the geometry, the limiting rows, the completion write's counts and text, the asserts and subresults); the driver's probe lines, `before-1-a.probe.jsonl`, `before-1-b.probe.jsonl`, `after-1-a.probe.jsonl` and `after-1-b.probe.jsonl`; every instrument's outcome and failing rows, `before-1.outcomes.jsonl` and `after-1.outcomes.jsonl` (by `extract-1.py`). The walker's own records, 23 MB a side with their captures and screenshots, stay outside the repository in the side folder, `/Users/joe/UoN-Video-Helper-side/vh212-walk/`.
- **Provenance:** each job's `run.json` and `manifest.json` (`before-1-a.run.json` and on); each run's `conditions.txt`, `.load.log.txt` and `.launcher.log.txt`, the qualification's among them (`qual-1.*`, with its summary and probe lines); `fixtures.log.txt`.
- **The compare and the tallies:** `compare-after-1.txt` and `.json` (by `compare-after-1.py`), `tally-1.txt` (by `tally-1.py`), and VH-199's line counts, `vh199-lines-1.txt` and `.json` (by `vh199-lines-1.py`).
- **The proof:** `proof-1.conditions.txt`, `proof-1.probe.json`, `proof-1.proof.json` and `proof-1.proof.log.txt`. Its synthetic pages, Chrome's and Vite's logs stay out.
- **The scripts,** each kept as `.txt`: `vh212-driver.mjs`, `walk-1.sh` and `go-1.sh` (the qualification and the before), `walk-2.sh` and `go-2.sh` (the after: they differ from `walk-1.sh` and `go-1.sh` only in the lock owner, the script `go-2.sh` runs, its log words and the header comments), `vh212-proof.mjs`, `proof-1.sh`, and the readers `summarise-1.py`, `compare-after-1.py`, `tally-1.py`, `extract-1.py` and `vh199-lines-1.py`.
- **`sources.txt`** gives each file's sha1 and its source in the side folder; every copy matches its source.
