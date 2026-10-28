<!-- markdownlint-disable -->

# VH-213 — Codex astra's close check, the brief, 28 October 2026

You are Codex astra, making VH-213's close check, read-only. This is a separate run after your blind check and your re-check: it checks the complete close candidate before the commit. Claude Code's own verdict and the compare of the two are deliberately kept from you. Their copies are in the candidate, in the measurements folder: `vh213-claude-verdict-2026-10-27.md` (sha1 `23f30fc8aa550761341ef72bbb13227cb2f88c85`) and `vh213-codex-compare-2026-10-28.md` (sha1 `225adb97eaf4048f0f12148e1f33f6b533d5bfd0`). **Don't open either.** They are named only so that you know they are part of the candidate. Don't read anything outside this repository (no parent folder, no other worktree). Judge from the evidence below alone. You are read-only: run nothing that writes, and not the gate.

## What VH-213 is

`project/items/VH-213.md` is the contract, and each of its acceptance criteria holds. A whole (untrimmed) video with under one 400 ms block of decoded sound is warned before Create, then made with no audio, the original untouched. This was the owner's choice, 2026-10-27 ~16:18Z, "Same rule as a trim (Recommended)".

## Your earlier checks, and what has happened since

- Your blind check (`reviews/2026-10-25/design-pass-3/evidence/measurements/vh213-codex-blind-brief-2026-10-28.md`, answer `…/vh213-codex-blind-2026-10-28.md.txt`) said "Revise". Your re-check (`…/vh213-codex-recheck-brief-2026-10-28.md`, answer `…/vh213-codex-recheck-2026-10-28.md.txt`) said "Commit", with no musts and no shoulds, and named as owed at close: the ledger, the gate, this close check, the linkage and the sizing. Read both answers.
- Must 1 of your blind check went to the owner. On 2026-10-28 ~09:57Z he answered verbatim "Yes, all three" to "Go ahead on all three as recommended?", whose first point was "VH-213's must 1, option (a): a wish line for both paths, and VH-213 closes without the repair." Don't re-argue his choice. Judge only whether it is recorded truly.
- **Since your re-check, only the ledger and the report's Disposition row have changed.** The 16 tracked files you re-checked are byte-identical in their diff against `5893d9d`. The 8 tracked files changed since are `project/archive-index.md`, `project/backlog.md`, `project/decisions-2026-10.md`, `project/decisions.md`, `project/items/VH-213.md`, `project/trajectory.md`, `project/wish-list.md` and `reviews/2026-10-25/design-pass-3/design-pass-3-2026-10-27.md`. Among the untracked files, the copies of your re-check brief and answer were added beside the table, and the compare's and Claude's verdict's copies were added to, which is why you must not open them. The table and its records are meant to be as you re-checked them: check that they are.
- **The gate ran on exactly this candidate** under the walk lock, on AC (87%, power mode 2), starting at a 1-minute load of 6.82. `npm run check` was green: 83 test files, 1,598 passed, 1 skipped (EBU 7 and 8, pre-existing; the base had 1,582 passed, 1 skipped); markdownlint 0 issues; links 0 broken; check-memory 0 structural failures. `node tools/check.mjs` reported 0 failures and 1 warning, the existing VH-122 `samples/CULT2011.mp4`, which an existing line already covers.

## The candidate

- Base `5893d9d`. The candidate is the uncommitted working tree: `git diff 5893d9d` (24 tracked files, nothing staged; `git diff 5893d9d --binary | shasum` should begin `23b9041d1c85`, so check that it does), plus 74 untracked files. Those are the table `…/measurements/vh213-whole-sub-block-2026-10-27.md`, its records folders `…/vh213-records-2026-10-27/` (52 files) and `…/vh213-records-2026-10-28/` (15 files), and the six copies beside the table: your blind and re-check briefs and answers, and the two files you must not open.
- A frozen copy of this candidate is kept outside the repository; don't look for it.

## What to judge, each with file and line

1. **The ledger edits**, against `AGENTS.md` rules 4, 5 and 6, and the grammar in each file's header comment:
   - `project/decisions.md`: the new entry `2026-10-28 — VH-213 — Closes: …`, newest first. Check its Decision, Rationale, Supersedes and Deferred lines. Its Supersedes should name VH-185's 2026-10-24 heading exactly, for the untrimmed scope only. Are its quotes of the owner true to the item's Notes and to your re-check brief?
   - `project/decisions-2026-10.md` and `project/archive-index.md`: `tools/archive.mjs` moved one entry out of the slice. Was it moved verbatim, and does the index list it?
   - `project/backlog.md`: is VH-213's line struck by the file's convention?
   - `project/trajectory.md`: is there one line, `- ID — outcome (date) — see decisions`, at the end of Phase 8, and does it state the outcome truly?
   - `project/wish-list.md`: is wish VH-213.1 a fair record of your blind must 1 and of the owner's answer, for both paths?
   - `project/items/VH-213.md`: check its Now and Notes, and the new "Sized, at close" line against the item's Sized criterion.
   - `reviews/2026-10-25/design-pass-3/design-pass-3-2026-10-27.md`: does VH-213's Disposition row name the item and its evidence file?
   - Rule 5: does any deferral, follow-up or "later" in these lines lack its own backlog or wish line? Does wish VH-185.1's retirement have a trace?
2. **The ledger quotes no close verdict, by design.** The decision says "The re-check said "Commit"" and quotes no verdict of this check. That is because this check's verdict doesn't exist until after the candidate is frozen. It goes only in the commit's `Checked:` line, `Checked: gpt-6-astra — <your verdict as given> — VH-185.1`. Don't count its absence as a defect.
3. **No test deleted or skipped.** The base's test "leaves an untrimmed file as it was" (`src/media/sub-block-sound.test.ts` on `5893d9d`) was replaced by whole-file cases. Is that true, and is nothing else removed or skipped?
4. **Each acceptance criterion** of the item, Sized included: met, not met, or owed at commit. What is owed at commit is the commit's `Verify:` and `Checked:` lines and the body, which quotes the owner's two answers with their sources and names the digest rules (nielsen 1, "status visible and announced", and 9, "errors say what next"; house-conventions "Fail loudly on data loss", with the rules' "warns before processing starts").
5. **The whole candidate once more:** is anything in the tracked diff, the untracked files or the records wrong, missing, unproved, or inconsistent with the ledger?

## Your answer

Markdown, under 600 words:

- a first line `Verdict: <Commit | Commit after the musts below | Revise>`, where "Commit" means fit to commit as it stands;
- then numbered **musts** (each a defect with file:line and the fix), **shoulds** and **notes**;
- then one line per acceptance criterion from point 4.
