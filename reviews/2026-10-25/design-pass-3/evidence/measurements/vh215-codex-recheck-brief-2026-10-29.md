<!-- markdownlint-disable -->

# VH-215 — Codex astra's re-check, the brief, 30 October 2026

You are Codex astra, re-checking VH-215 read-only after a repair. Your blind check (earlier today) answered "Verdict: Commit", "Musts: None", with one should, on the measurement table's description of the release guard's test. Claude Code has repaired the table at two lines for it, and nothing else has changed. Check the repair only, and anything added since your check. Never write or change any file; run no tests, builds or installs.

## What you may read
- **This repository** (your working directory): its tracked tree and the three untracked files of the candidate, and `git` read-only. Read nothing under `node_modules/`, `dist/` or `.claude/`, and nothing inside `.git/` except by git's own read commands.
- **Outside it, only these, in `/Users/joe/UoN-Video-Helper-side/`:** `vh215-walk/table-12/vh215-card-length-2026-10-29.md`, the repaired table; its records in `vh215-walk/table-12/vh215-records-2026-10-29/`, read by `grep`, `head` and line ranges, with `sources.txt` giving each copy's sha1; and `vh215-codex-blind-table.md`, the table as you checked it.
- **Nothing else** in `/Users/joe/UoN-Video-Helper-side/` (no brief, hand-over, progress note, verdict, compare, save or other item's files). **Never read any folder under `/Users/joe/Library/Application Support/Claude/side-session-notes/`.**

## Your point, as you gave it
**Should:** "Strengthen the release-guard regression. `src/media/ends-early.test.ts:424` supplies the shorter encode span directly and checks `cardTellsMade`; it does not exercise worker refusal, non-retention or workspace disposal. Those paths are correctly connected in source, but removing the worker’s guard would leave this test green. Describe the present evidence as a predicate regression; record a worker-path regression as a wish if deferred."

## The repair
- **The table** changed at two lines only. Its sha1 is now `8473f38f7739ca2af207c0a81fbb441587ddc50f` (181 lines). `diff` the copy you checked against it: expect `56c56`, `147c147` and `170c170`. Line 147 differed already at your check: your copy reduced that §5 bullet to the settled design's facts.
  - §3 `:56` now ends: "…and the guard's predicate regression, where the last declared packet arrived but the encode's span is shorter, so the guard's comparison, `cardTellsMade`, refuses; the worker's refusal itself is read from its code, not run (section 7)."
  - §7 `:170` now reads: "The two refusals, a job with no span and the release guard, are not walked: no walk cell or proof case refuses. The guard's comparison is proved by its Node predicate regression (`cardTellsMade`); the worker's refusal, the output not retained and the workspace disposed are read from the worker, not run by any test, a wish line at the close (sections 3 and 6)."
- **The wish line, deferred as your should allows, for the close's wish-list** (no new test is written now): "a regression through the worker's path for the release guard: a Submission job whose encode's span prints other than its card is refused at `job.worker.ts:278`, nothing is retained and the workspace is disposed, proved through the worker, not the predicate alone."
- **Nothing else added since your check:** `git diff 7750acb852a81979511ea481e6c2b18dcdda5ee4` is unchanged (the twelve files; `git diff --binary | shasum` gives `c5c3d0dbc873982b1616e12b97cd221b3f3c4d30`), nothing staged, the same three untracked files, `git status --porcelain` the same 15 lines; the records (85 copies) and `sources.txt` (sha1 `b0ec4ff8118a203dc60b45f3e035ac1e60ececdd`) unchanged.

## What to check
1. Whether the should is met: the two lines against `src/media/ends-early.test.ts:410–437` and `src/workers/job.worker.ts` (the guard at `:278`, disposal in its catch), so that the table describes the present evidence as a predicate regression and the worker's path as read, not run; and whether the wish line's words are right and enough for "record a worker-path regression as a wish if deferred".
2. That nothing else changed in the table, the tracked diff, the untracked files or the records.
3. Whether the two lines fit the rest of the table: §3 `:54`, §5 `:147`, §6's 4.1.3 row (`:159`) and §7.

## Answer
Under 300 words. Each remaining must and should, separately. End with one line: `Verdict: <Commit | Commit after the musts below | Do not commit>`.
