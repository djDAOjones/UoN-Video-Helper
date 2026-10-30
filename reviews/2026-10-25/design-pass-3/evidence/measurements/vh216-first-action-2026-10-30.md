<!-- markdownlint-disable -->
# VH-216's before and after: the first action in the first screen, 30 October 2026

This is [VH-216](../../../../../project/items/VH-216.md)'s stage-rule measure for pass 3's V-18. At the base, the file button stood below the first screen in Malay at 1280 × 900 and in all three languages at 320 × 568. The owner chose the remedy, "Promises + switch (Recommended)": the five promises and the Staff/Student switch move below step 1, in one order at every width, with no CSS `order`, no script, no words changed and nothing added.

**The result: four of the six cases are now inside the first screen, and two are short.** Chinese is 159 px short and Malay 260 px short at 320 × 568. Those two are a report to the owner, not a stop (section 3).

There is no walker diff, on his word ("Yes, leave them"), so one instrument revision, `17727d3522f7270d`, holds for the before and the after. As he was told, two S-03 rows therefore fail in every reached after cell, because they pin the old page (section 4). The records are in [`vh216-records-2026-10-30/`](vh216-records-2026-10-30/) (section 11).

## 1. Provenance

| | Before | After |
| --- | --- | --- |
| Source | the checkout at `3741193` (VH-215), clean: porcelain 0 lines, diff hash `da39a3ee5e6b4b0d` (the empty diff's) | the checkout at `3741193` with the candidate's working-tree diff, 12 modified files, unstaged: diff hash `7cd34e86be434481`, the same in all four after groups |
| Instrument | revision `17727d3522f7270d` | the same |
| Six cases | `rings-179.mjs v18`, unchanged | the same |
| Cells | VH-216 #1's `vh216-driver.mjs`, which runs the pass's `matrix.mjs` unchanged on a plan declared in memory, with a read-only probe on each scenario's `afterMode` | the same file, unchanged (sha1 `6dd723e4207ad18f1dafb161c00ff46bec82c152`) |
| Tab | `vh216-tab.mjs`, a separate traversal, since S-03's Tab row stops at the file chooser | the same file, unchanged (sha1 `462c697bcb4d069f1c3e9a4296c53ebfef01207a`) |
| Serving | Vite at :5181, headless Chrome on CDP :9251, one Chrome profile | the same |
| Fixtures and faults | none: S-03 and S-144 run no job and declare `fixtures: []` | the same |

No before cell comes from VH-199's records. Its instrument revision is `2e7b0c044ce11f2b`, `src/styles/app.css` has moved since `a3039c3`, and its records hold no w640 cell and S-144 only at en-GB, w320, light. So every before cell is walked on the base.

## 2. The runs, their power and their load

The cells are the stage rule's: S-03 and S-144, at 1280, 640, 375 and 320 px, in en-GB, zh-Hans and ms-MY, in light, dark, forced light, forced dark and the 32 px font in light: 120 cells a side. Added to these are the six painted readings and a Tab traversal of 60.

| Group | When (UTC) | Records | Power | Load (1 min): median, peak | Samples at 8 or above |
| --- | --- | --- | --- | --- | --- |
| six-before (VH-216 #1) | 09:55:47–09:56:09 | 6 | AC, 100%, power mode 2 | 4.66, 4.66 (the run's own range 4.66–5.99) | 0 of 1 |
| before-s03 | 10:26:07–10:31:55 | 60, 58 reached | AC, 100%, power mode 2 | 5.77, 14.17 | 4 of 12 (10:26:37–10:28:07) |
| before-s144 | 10:32:02–10:36:08 | 60, 58 reached | AC, 100%, power mode 2 | 5.40, 5.79 | 0 of 9 |
| before-tab | 10:36:26–10:41:13 | 60 | AC, 100%, power mode 2 | 5.30, 6.55 | 0 of 10 |
| six-after | 10:46:00–10:46:17 | 6 | AC, 100%, power mode 2 | 7.33, 7.33 | 0 of 1 |
| after-s03 | 10:46:18–10:52:07 | 60, 58 reached | AC, 100%, power mode 2 | 7.43, 20.58 | 5 of 12 (10:49:49–10:51:49) |
| after-s144 | 10:56:09–11:00:15 | 60, 58 reached | AC, 100%, power mode 2 | 8.09, 10.66 | 5 of 9 (10:56:39–10:58:39) |
| after-tab | 11:00:17–11:05:16 | 60 | AC, 100%, power mode 2 | 106.53, 146.98 | 9 of 10 (11:00:47–11:04:47) |

- **Power.** The owner's rule is a before and its after in one power mode. Both ran on AC at 100%, power mode 2.
- **Load.** It rose above 8 from another process, not this item's, in four groups. Each group started below 8. These readings are layout, DOM and focus order, with no job and no duration, and each side matches the other apart from the two rows and the Tab order in section 4. **No group was re-run, on Orchestrator #32's ruling of 2026-10-30:** "No re-run. Your judgement stands: these readings are layout, DOM and focus order with no job or duration, and each side matches apart from W1, W2 and the Tab order." Codex's blind check is asked to judge this point.
- **Exit codes.** The Tab groups exited 0. The S-03 and S-144 font32 jobs exited 1 on both sides, because their manifests say `whole: false` for the two unreached cells each (section 5). Each group's `conditions.txt` and 30-second `.load.log.txt` are in the records.

## 3. The six cases

The file button's painted top and bottom, against the fold. VH-216 #1 read the before and VH-216 #2 the after, by the same script. Nothing scrolled in any of the six.

| Language | View | Before | After | Moved up |
| --- | --- | --- | --- | --- |
| en-GB | 1280 × 900 | 630–674, inside | 336–380, **inside** | 294 px |
| zh-Hans | 1280 × 900 | 780–824, inside | 507–551, **inside** | 273 px |
| ms-MY | 1280 × 900 | 870–914, short by 14 px | 528–572, **inside** | 342 px |
| en-GB | 320 × 568 | 930–974, short by 406 px | 496–540, **inside** | 434 px |
| zh-Hans | 320 × 568 | 1025–1069, short by 501 px | 683–727, **short by 159 px** | 342 px |
| ms-MY | 320 × 568 | 1267–1311, short by 743 px | 784–828, **short by 260 px** | 483 px |

**The shortfall goes to the owner.** No word was shortened, no spacing tightened and the translation notice not moved: "Also the translation notice" was an option he didn't take. This table chooses no remedy for it.

**V-18's readings, as history only,** at `a3039c3`: 650–694, 800–844 and 890–934 at 1280 × 900; 950–994, 1,045–1,089 and 1,287–1,331 at 320 × 568.

**375 × 667 is not walked.** It isn't one of the six, and `VIEWS.w375` is 375 × 812. As arithmetic on the 812 px layout, and for the input's box and not the painted button, the after's boxes at w375 in light are 448–500 (en-GB), 616–668 (zh-Hans, 1 px past 667) and 661–713 (ms-MY, 46 px past 667). The before's are 814–866, 913–965 and 1,075–1,127.

## 4. What moved between before and after

Compared cell by cell by `compare-2.mjs` (`compare-s03.txt`, `compare-s144.txt`, `compare-tab.txt`). **The two rows below are the only rows or instruments that moved.**

| Row | Scenario | Before | After | Cells | Why |
| --- | --- | --- | --- | --- | --- |
| "Tab from the top: skip link, Page language, (the notice's link)…" (W1) | S-03 | pass | **fail** | all 58 reached | it pins the old order, on the owner's "Yes, leave them" |
| "the owner's five promises, in order" (W2) | S-03 | pass | **fail** | all 58 reached | its selector, `.lede > ul > li`, stops matching when the list leaves `.lede` |

W1's readings, from every reached after cell:

| Languages | Cells | `stops` | `want` |
| --- | --- | --- | --- |
| en-GB | 19 | skip link, page language, choose file | skip link, page language, format ?, video type, choose file |
| zh-Hans, ms-MY | 39 | skip link, page language, notice link, choose file | skip link, page language, notice link, format ?, video type, choose file |

W1 breaks at the file chooser, so it is not a whole Tab reading: section 6 gives that. W2 has no reading of its own after, so the driver's probe reads the promises instead (section 7).

S-144: **all 60 cells unmoved.**

**Already failing on the base, the same after, and not this item's fix:**

| Row or instrument | S-03 | S-144 | Note |
| --- | --- | --- | --- |
| "About the video format" 44 x 44 (S-03's row) | fail, 58 | — | as Codex's design check expected |
| `targets`, `type` | fail, 58 | fail, 58 | |
| `formatTip` | fail, 58 | — | |
| `overflow` | fail, 3 | fail, 3 | w320 font32, all three languages: the condition V-50 names, which VH-209 holds |
| "nothing off the page with the tip open" | — | fail, 3 | the same three cells |
| `focus` | fail, 4 | pass, 58 | S-03: w320 font32 in three languages, and zh-Hans w375 font32 |
| `contrastExtra` | cannot-determine, 4 | cannot-determine, 4 | those same four font32 cells |
| `measure` | cannot-determine, 9 | cannot-determine, 9 | zh-Hans at w1280 and w640 |

## 5. Four cells not reached, before and after

| Scenario | Language | View, mode | Reached | Window read, against 375 × 812 |
| --- | --- | --- | --- | --- |
| S-03, S-144 | en-GB | w375, font32 | no, before and after | 394 × 854 |
| S-03, S-144 | ms-MY | w375, font32 | no, before and after | 448 × 971 |

So **116 of the 120 cells are reached on each side**, and the same 116. In those four, the runner marks the cell failed before its instruments run, so they hold no instrument outcome on either side. The window, read by the probe and by the Tab traversal, widens at the 32 px font in these two languages at 375 px, and zh-Hans at the same width and font stays at 375 × 812. This is a finding on the base that the move doesn't change. It isn't fixed here. **No link to VH-209 is claimed:** that item names S-113 at 320 and 401 px, and this cause has not been traced.

## 6. The orders

**DOM and reading order,** one in all 120 cells of each side, read by the probe:

- Before: title, lede, promises, privacy, browser note, switch, step 1, steps 2–6, announcer, errors, dev.
- After: title, lede, privacy, browser note, step 1, switch, steps 2–6, announcer, errors, promises, dev.

This is the owner's order: "header, title, privacy line, "1. Choose a video", the switch, then the promises, with steps 2–6 between them once a video is read". Errors captured stands between step 6 and the promises when it shows. His words name no errors panel, and this placement is a point Codex's blind check is asked to judge.

**Heading order:** the same in 120 of 120 cells. The headings shown on the empty page begin H1 "UoN Video Helper", H2 "1. Choose a video".

**Tab order,** by `vh216-tab.mjs`, 60 cells a side, errors 0, reverse the same as forward in all 60 on both sides:

| | Forward | Cells |
| --- | --- | --- |
| Before | skip link, page language, format ?, video type, choose file, footer's first stop | 20 |
| Before | skip link, page language, notice link, format ?, video type, choose file, footer's first stop | 40 |
| After | skip link, page language, choose file, video type, format ?, footer's first stop | 20 |
| After | skip link, page language, notice link, choose file, video type, format ?, footer's first stop | 40 |

DOM, reading and Tab order agree. `grep -n 'order:' src/styles/app.css`, `border` excluded, finds none, and a new test holds that.

## 7. The promises, the "?" and its tip

- **The promises,** by the probe, in all 120 after cells: five items, in order, their words the same as the before's, square bullets, the parent `main`, the list's own class `promises`. The privacy line is still in `.lede` in all 120.
- **The "?" and its tip,** by the Tab traversal, in all 60 cells a side: Enter and Space open it with focus staying on the "?"; Tab and Shift+Tab move on and close it; Escape closes it with focus on the "?"; a click on its text leaves it open and a click on its title closes it. `tipOk` is true in all 120 readings, as VH-184 left it.
- **S-144,** in all 60 cells a side: focus on `format-help-button` and the tip shown, unmoved.

## 8. WCAG, re-checked for what VH-216 touched

| Criterion | Reading | Result |
| --- | --- | --- |
| 1.3.1 Info and relationships | `ax` passes in all 58 reached cells of each scenario, before and after; still a `ul` of five `li`; the switch's `fieldset`, `legend` and description unchanged; the same headings | holds |
| 1.3.2 Meaningful sequence | the DOM order is the reading order, one at every width; no CSS `order` and no script moving nodes | holds |
| 1.4.4 Resize text | at the 32 px font the same rows and instruments fail or pass before and after, apart from W1 and W2; `overflow` fails at w320 in three cells on both sides (the condition V-50 names, VH-209's); four cells aren't reached on either side (section 5) | unchanged by this item |
| 1.4.10 Reflow | `overflow` passes at 320 px in every default-font cell, before and after; its three failures are the 32 px font's | holds at the criterion's width |
| 2.4.3 Focus order | section 6's Tab order is the DOM order, forward and reverse | holds |
| 2.4.6 Headings and labels | the same headings and labels in 120 of 120 cells; no word changed | holds |

**Tokens.** `.lede ul` became `.promises` with its declarations unchanged, and `.lede ul + p` was removed as dead. No new token, literal or breakpoint. No control, checkbox or element added (`strings-proof.txt`: 337 elements on each side). The progress bar is untouched.

## 9. The tests and the words

**Tests that state the old order changed to the new one; none deleted or skipped.** 83 files, 1,626 passed, 1 skipped, against the base's 1,623 and 1. Typecheck and eslint are clean on the changed files.

- `test/screen-text.test.ts`: the list is read from `ul.promises`; "no lead-in sentence" reads the markup before the list, so it can still fail; the "?" is scoped in the list; "sits above Step 1" became the whole order (each mark once, ascending; the list in `main`, in no section or fieldset) and a kept "outside every fieldset the job lock disables".
- `test/stylesheet.test.ts`: `.promises`, and a new test that no rule uses `order`.
- `src/i18n/tables.test.ts`: the 13 moved rows' where-cells and `progress.job`'s note equal in the sheet and the filled sheet; the privacy line and browser note stay "Under the page heading".

**No string changed** (`strings-proof.txt`, by `strings-proof-2.mjs`): `en-GB.ts` differs by one comment; `zh-Hans.ts` and `ms-MY.ts` are identical; `index.html` holds the same 124 `data-i18n` keys, the same `data-i18n-attr`, the same tags and counts and the same words. In the filled sheet, 14 rows change, in their "where" cell or, for `progress.job`, its note, and no translated word. The delivered `VH-105-strings.csv` and `.xlsx` stay.

**`docs/`:** the three substitutions he approved and nothing else (`docs-word-diff.txt`); 8,125 words by `tools/ledger.mjs`, budget 8,200.

## 10. What these cells do not walk

- **The empty page only.** S-03 and S-144 declare no file, so steps 2–6 are hidden in every cell. The markup is one static order and test `sits below Step 1…` pins it, but the order and Tab order with a video read, and the five states, are not walked here.
- **The onset tip's mutual exclusion** with the format tip is not walked. `toggletip.ts` changed by a comment alone.
- **The risk that the promises sound like confirmations** when they follow a blocked, silent or finished video. That is a stated risk of the owner's chosen order, not a measured one; no word may change, and both placements carry it. So is the risk that a person who doesn't scroll on a phone sees no account of what the tool does until later.
- **Whether a later item measures these cells:** `PLANS.matrix()`, checked by loading the plan, holds no w640 cell of S-03 and no S-144 outside en-GB, w320, light; S-144p's reading is the input's box. Nothing here relies on a later item to cover them.
- **A screen reader's speech:** read as exposure and order, not listened to.
- **What a heading reader takes the switch and the promises to belong to.** They stand outside every `section`, and on the empty page the last heading before them is H2 "1. Choose a video"; at the base they followed H1. The table does not claim what a heading reader makes of that. A heading of their own would be a new element and new words, so nothing here changes it. A person's check.

## 11. The records folder

- **The walks, one cell per line:** `before-s03.outcomes.jsonl`, `after-s03.outcomes.jsonl`, `before-s144.outcomes.jsonl`, `after-s144.outcomes.jsonl`, by `records-2.mjs`: status, reached, each instrument's outcome, each row with its `stops` and `want`.
- **The probe and the Tab lines:** `<group>.probe-*.jsonl`, `<group>.tab-*.jsonl`.
- **The six:** `six-before.summary.json`, `six-after.summary.json`.
- **Provenance:** each run's `manifest.json` and `run.json`, each group's `conditions.txt`, `.load.log.txt` and `.launcher.log.txt`. Their launcher logs say "walk-1 exit", `go-1.sh`'s string, in `go-2.sh`'s runs too.
- **The compares and proofs:** `compare-s03.txt`, `compare-s144.txt`, `compare-tab.txt`, `strings-proof.txt`, `docs-word-diff.txt`.
- **The scripts,** each kept as `.txt`: `vh216-driver.mjs`, `vh216-tab.mjs`, `proof-1.mjs`, `walk-1.sh`, `go-1.sh`, `walk-2.sh`, `go-2.sh` (these two differ from `-1` only in the lock owner and the script run), `readback-2.mjs`, `compare-2.mjs`, `records-2.mjs`, `strings-proof-2.mjs`.
- **`sources.txt`** gives each file's sha1 and its source in the side folder. The per-cell records, screenshots, Chrome's and Vite's logs stay out.

## 12. The repair after the walks

Claude's verdict and Codex's blind check, between them, found comments the move had made false and two test points. All walks above stand on diff hash `7cd34e86be434481`. The candidate after the repair is diff hash `9c9e1908b82afe91`; the change between them is `repair-1.diff.txt` in the records:

- **Comments, their words only:** `src/ui/system-check.ts`, `src/config/video-kind.ts`, `src/styles/tokens.carbon.css`, `test/readability.test.ts`.
- **Tests, no assertion changed:** in `src/i18n/tables.test.ts`, the VH-216 sheet test in its own `describe`, out of VH-212's; in `test/stylesheet.test.ts`, the `order` test's title.

**No re-walk:** no rendered byte, element, string, selector or declaration changed, and `strings-proof-2.mjs` gives the same output on the repaired tree.

A second repair followed Codex's re-check, the candidate then being diff hash `23aedfe476a941e8`, the change `repair-2.diff.txt`: one comment in `src/styles/app.css` and one `describe` title in `test/stylesheet.test.ts`, each for the same reason and with the same result, so no re-walk. It also takes back a reason §10's added bullet had claimed.
