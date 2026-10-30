<!-- markdownlint-disable -->

# VH-215 — Claude's verdict and Codex astra's blind check, compared, 30 October 2026

VH-215 #19 (Claude Code), for Orchestrator #30, in step 6's (6b).

**When each was saved.**
- **Codex's brief** `vh215-codex-blind-brief.md` (sha1 `2570e1acaa8f5828b0a63b1469523134e55c08f9`, 55 lines) and its table copy `vh215-codex-blind-table.md` (sha1 `1f767728e77f8b597d43907cb6182545523991f7`, 181 lines) were saved by #18 before Codex started (the copy at 02:34:26Z). The copy's `diff` against the table (`vh215-walk/table-12/vh215-card-length-2026-10-29.md`, sha1 `602ab8be…`) is `147c147` alone: the §5 bullet "How the picture's read was settled", reduced to the settled design's facts as "The picture's read, as built".
- **Codex started** at 02:36:19Z (PID 65863), from the repository by `cd`, `-s read-only`, prompt on stdin.
- **Claude's verdict** `vh215-claude-verdict.md` was saved before Codex's answer was opened. Part 1 was saved at 02:08:10Z (#17, its first 78 lines, sha1 `a0912620…`). The whole was first saved at 02:37:48Z (#18), and one clause of part 2's second nit was corrected at 02:37:56Z, giving sha1 `50d7777558a39235c6fb3569fd2d000dbdbeb0d5`, 125 lines. #19 checked those sha1s at 03:07:31Z, before opening the answer.
- **Codex ended** by 02:45:24Z. Its answer `vh215-codex-blind.md` was saved at 02:45:22Z (its modification time; sha1 `6b011d50a5f09b8224b075713bda5b5f849fb7ed`, 29 lines, 717 words). #19 opened it at 03:07:38Z.
- **Its log** was checked by `grep` of the side folder's paths only. Codex's 27 commands read nothing in the side folder outside its brief's list: the candidate's copies, the table copy and the records under `table-12/`, `sed -n '29,81p'` of the progress notes (the route's trace) and the owner's lines of `plan8-owner-words.md`. The verdict, the design's readings and compares, the hand-overs, the briefs and `side-session-notes/` were never read; that folder's one hit is the brief's own prohibition, echoed. The other side-folder paths in the log are inside the records' printed text.
- This compare was saved at 03:10Z.

**The verdicts.** Claude: "Commit, after the close's own record", no must, failing points none. Codex: "Verdict: Commit", "Musts: None", one should.

## Agreed

- **The route found first, and bounded.** The trace precedes the build. On the largest whole file the index's read takes 2 ms; on the 2.81 GB cut the streamed packet read (C) takes 1,440 ms. The read branches on `lastPacketArrived` alone, never the container (`ends-early.ts:134`). It holds a running end, not the file, with no added decode or remux. (Claude: part 1, the criteria's first row and the `ends-early.ts` bullet.)
- **Never knowingly false.** Pre-flight joins the picture's end and the sound's decoded end outside the audio timer, frame-aligned as the pipeline places the range (`job.worker.ts:594`). The pipeline returns the encode's raw span, without the card, the closing or the held picture (`pipeline.ts:893`; must 5). The Submission-only guard (`job.worker.ts:278`) precedes retention and posting, and a mismatch reaches disposal (`:360`). An unknown span gives an empty time and the existing `failure.unknown` before the draw (`:247`). There is no fallback to the declared length and no release with a warning. (Claude: part 1's second row, and the worker's and pipeline's bullets.)
- **The tests.** Each side's `proof.jsonl` holds ten cases: eight cut-MP4 cases (whole and trimmed × `best` and `smaller` × a closing on and off), the whole-file control and the keep ending before the damage. The decoded cards go from 0:30 and 0:20 to 0:21 and 0:16; the controls stay unchanged. The Node additions use the sibling helper with no mocked WebCodecs. Nothing was deleted, skipped or weakened. (Claude: part 1's third row; part 2's "The correction".)
- **No spec change; the documents.** Calibration, `keptSeconds`, the estimate's inputs and the warnings' 1 s margin keep their meanings. No UI-STANDARDS rule changes, and no `docs/` edit or wish is owed. **O4 is placed here.** Claude's O4 reads §7.1's re-check sentence ("grows with the kept audio") as unchanged in meaning. On a cut MP4, the re-check now also streams the kept picture packets, the held point's accepted cost, and §7.1 sets no figure. Codex: "Spec §7.1 and line 128 need no correction for this implementation", answering its brief's point 9, which asked exactly that (`vh215-codex-blind-brief.md:50`). So both read no meaning change: there is no spec-change stop and no wish line. (Claude: part 1's fourth row and O4.)
- **VH-203's measurements.** There are 96 cells a side and 72 re-run cells. The before ran on the base; the candidate's diff hash and untracked copies match the source records; all 85 copies match `sources.txt`. The job times, load windows, ranges, proof scores and route figures agree with the records. VH-199's column is rightly "not measured". Power, the re-run's substitutions and the load rulings are recorded. (Claude: part 2's table.)
- **WCAG.** §6 with `instr-13.txt` and `exposure-13b.txt` supports unchanged relationships, headings, words, and live-region text and node writes. The reading level and actual speech stay limits, not passes (spec §9.3). The existing page-wide instrument failures are disclosed. (Claude: part 2, "The WCAG re-check holds".)
- **Tokens and controls.** There is no CSS, config, markup, control, checkbox, listener or dependency change, and the progress bar is kept. The token files stay separate. The formatter moved unchanged. The log's rounding is unit rounding, not a threshold. (Claude: part 1's fifth row.)
- **The page.** Three consumers take the verdict's span: the fit (`main.ts:2659`), the filled line (`:2723`) and the request (`:3049`). A file, preset or committed-trim change clears it; the range comparison withdraws it while a handle moves; the selection checks reject stale replies; a language repaint cannot bring back the declared length. "Checking…", cancellation and the words are unchanged. (Claude: part 1's `main.ts` bullets.)
- **The walker.** The walker adds only the four scenarios and their plan; S-23's Staff-ready scenario is kept and S-22 is untouched. `card-215.mjs` reads the output's decoded pixels against varied reference renders, with no OCR or dependency. Every conditions record names revision `17727d3522f7270d`, and the saved scripts, recipes and hashes let the runs be repeated. (Claude: musts 8 and 9; part 2, "The records let the proof be re-run".)
- **The digest rules:** house-conventions' "Fail loudly on data loss" and "Streaming everywhere", and nielsen 1's "status visible and announced", applied.
- **At the close:** the rebase onto `267cb91…`; the settled-machine gate and `node tools/check.mjs`; the item, backlog, trajectory and decision with the owner's scope quoted; this check and its brief kept; the table and records copied; the report's row "The owner's old issues" linked; deferred work recorded, among it table §7's S-22 Submission follow-up (hand-over 6's wish line). (Claude: "For the close".)
- **O3's fact.** Both read the refusals as proved as functions in Node and by reading the worker, with no run exercising one. Codex: "Those paths are correctly connected in source". Claude: O3 ("proved as functions, not as runs") and part 2's "O3 against the evidence". O3's consequence is Codex only, point 1.

## Codex only

1. **Should: the guard's regression is a predicate regression.**
   - **Codex's point.** The test at `ends-early.test.ts:424` hands the shorter span to `cardTellsMade` directly. It does not exercise the worker's refusal, non-retention or disposal: "removing the worker's guard would leave this test green." "Describe the present evidence as a predicate regression; record a worker-path regression as a wish if deferred."
   - **Claude checked it: so.** Lines 424–437 call `declaredExtent`, `madeSpanSeconds`, `formatClockTime` and `cardTellsMade`, and nothing of the worker. The worker's own guard call is `job.worker.ts:278`.
   - **What Claude's verdict missed.** It had the fact (O3). But it accepted the table's words as they stand: §3 `:56`, "the guard's regression, … so the guard refuses", and §7 `:170`, "the guard is proved by its Node regression". And it owed no wish line beyond hand-over 6's two.
   - **Adopted, in two parts,** since the evidence settles it:
     - **a table repair** at those two lines, saying that the Node regression proves the guard's comparison (`cardTellsMade`), and that the worker's refusal, the output not retained and the workspace disposed are read from the worker, not run;
     - **a wish line** carried to the close: a worker-path regression for the release guard. A Submission job whose encode's span prints other than its card is refused, nothing is retained and the workspace is disposed, proved through the worker. It is deferred as the should allows, since building it now would be a source change under must 7 with its own evidence to re-run.
   - **Not yet made:** the repair is made only on a resume message (below).
2. **Sizing: "complete session-by-session budget compliance is not shown"** by the material Codex was allowed to read. Codex judges the scope only, as Claude's "Sized" row does. Nothing is owed, as in VH-212's compare, point 4.

## Claude only

1. **O1, O2 and O5,** none raised by Codex, each needing no change. O1 is the read's fallback for a keep starting past the damage: streamed, and bounded by C's cost. O2 is the first `src/media/` import from `src/ui/`, of a pure module, with no written rule against it and its reason recorded. O5 is a trimmed whole file at a half-second edge, which prints the frame-aligned length made.
2. **S-23wn ms-MY 320's 1,059 ms,** within the scenario's before range and covered by #26's ruling 1. Codex records the load rulings as recorded, not this job by name.
3. **Two nits, no change:** the table names the side folder by its absolute path in prose, not as a link (§8 `:175`), as VH-212's table does; and the per-cell readings are summarised by scenario, with each cell's line in the linked checks.

## Disagreed

None. Codex's should is a point Claude's verdict missed, and the test's own lines settle it. Nothing is held for the owner.

## The repair owed, then the re-check (not started: each only on a resume message)

- **The table repair,** in place in `vh215-walk/table-12/vh215-card-length-2026-10-29.md`, at two lines only. The blind copy and `sources.txt` stay as they are, and no record is added. Its new sha1 is recorded. The words proposed:
  - §3 `:56`: "…and the guard's regression, where the last declared packet arrived but the encode's span is shorter, so the guard refuses." becomes "…and the guard's predicate regression, where the last declared packet arrived but the encode's span is shorter, so the guard's comparison, `cardTellsMade`, refuses; the worker's refusal itself is read from its code, not run (section 7)."
  - §7 `:170`: "…no walk cell or proof case refuses, and the guard is proved by its Node regression (sections 3 and 6)." becomes "…no walk cell or proof case refuses. The guard's comparison is proved by its Node predicate regression (`cardTellsMade`); the worker's refusal, the output not retained and the workspace disposed are read from the worker, not run by any test, a wish line at the close (sections 3 and 6)."
- **Claude's reading of the repair,** saved first; then **Codex's re-check** of the two lines and the wish line under `recheck`, from its own saved brief, with the follow-up verdict kept here.
- **Then the table's copy into `$M` (m),** sha1-equal to the repaired table.
- **The wish lines the close owes:** hand-over 6's two (specific words for the guard's refusal; S-22 read as Student submission in VH-203's after-run), and this compare's one (a worker-path regression for the release guard).

**Result at (g):** Claude "Commit, after the close's own record"; Codex "Commit". One should is adopted, with a two-line table repair, a re-check and a wish line owed, so (g) is not clean.

## The repair, then the re-check

On #30's ruling at (g) ("Codex's should is adopted on your recommendation. It is a table repair the brief provides for, not an owner hold, and not a source repair: no new test is written now").

### Claude's reading of the repair (saved 03:13:08Z, before the re-check started)

- **What changed.** The table `vh215-walk/table-12/vh215-card-length-2026-10-29.md` changed at two lines only, with the words proposed above, made at 03:12:31Z with the table's own straight apostrophes restored at 03:12:47Z. Its sha1 went from `602ab8bead2d73ef27274647c4c01e6a53542634` to `8473f38f7739ca2af207c0a81fbb441587ddc50f` (181 lines, 6,196 words; an intermediate `3e3bebcf…`, with two curly apostrophes, stood for 16 s and was never used). Its `diff` against the table as #16 left it is `56c56` and `170c170`; against the blind copy, `56c56`, `147c147` and `170c170`. `sources.txt` (`b0ec4ff8…`) and the 85 records are unchanged, and no record is added. Nothing in `$R` changed: the tree checks pass.
- **§3 `:56`** now says the guard's test is a "predicate regression": the guard's comparison, `cardTellsMade`, refuses, and the worker's refusal itself is read from its code, not run, pointing to section 7. That is what `ends-early.test.ts:424–437` proves: it calls `cardTellsMade` on a card and the encode's span, and nothing of the worker.
- **§7 `:170`** now says the guard's comparison is proved by its Node predicate regression, and that the worker's refusal, the output not retained and the workspace disposed are read from the worker (`job.worker.ts:278`, with disposal in the existing catch), not run by any test, with a wish line owed at the close. Both refusals stay "not walked".
- **What else was checked.** The table's other mentions read true as they stand. §3 `:54` describes what the worker does, not how it is proved. §6's 4.1.3 row (`:159`) says only that no walk cell or proof case refuses. §5 `:147` names the re-check's adopted should, "the guard's regression test", which is its name in the design's record.
- **The wish line,** for the close (with hand-over 6's two): a regression through the worker's path for the release guard, in which a Submission job whose encode's span prints other than its card is refused at `job.worker.ts:278`, nothing is retained and the workspace is disposed, proved through the worker, not the predicate alone.
- **My reading:** the should is met by the description now, and by the wish line at the close. Nothing else is owed. The verdict's "Commit, after the close's own record" stands.

### The re-check's follow-up verdict, kept

- **Codex `recheck`** ran 03:13:37–03:15:41Z (PID 69471) from `vh215-codex-recheck-brief.md` (sha1 `b5910e068a2fc0472499522fedf44270c231b795`). Its answer `vh215-codex-recheck.md` (sha1 `d4ef05163f68e111cf6d443c3a2616ca4a1eccad`, 208 words) was saved at 03:15:41Z and opened at 03:15:45Z, after Claude's reading above was saved (03:13:08Z). Its log's 11 commands read nothing in the side folder beyond the repaired table, its records under `table-12/` and the blind copy.
- **"Remaining musts: None." "Remaining shoulds: None beyond recording the supplied wish at close, as proposed." "Verdict: Commit".**
  - Lines 56 and 170 "correctly identify a predicate regression", with the worker's refusal, non-retention and disposal "established by source inspection, not that test".
  - The wish line is "accurate and sufficient for recording at close".
  - The repaired lines fit §3 `:54`. §5 `:147` and §6 `:159` "use broader shorthand but refer to §3, whose explicit qualification, reinforced by §7, makes the evidence's scope clear".
  - The table's sha1, its 181 lines and its `diff` (`56c56`, `147c147`, `170c170`) match. HEAD, the twelve-file diff and its sha1, nothing staged and the 15 status lines match. `sources.txt` and all 85 copies match.
- **Agreed** with Claude's reading of the repair on every point. Codex noted that `clock-time.ts`'s and `picture-pcm-mp4.ts`'s unchanged contents could not be confirmed from its permitted evidence. Claude confirmed them at 03:15:56Z: `3ffd6e247b85633496616a978728b9ff2cd5b50c` and `cc9563101b3c4360a6c3743536874192afcb55a8`, equal to `vh215-wip-18/manifest.txt`'s entries, with the tree checks passing.
- **Result:** Claude "Commit, after the close's own record"; Codex "Commit". Nothing is held for the owner. Step 6 is done. The table's copy into `$M` (m) takes the repaired table, `8473f38f…`. The close carries three wish lines: hand-over 6's two, and this compare's worker-path regression for the release guard.
