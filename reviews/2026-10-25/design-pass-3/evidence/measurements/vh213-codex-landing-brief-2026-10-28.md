<!-- markdownlint-disable -->

# VH-213 — Codex astra's landing re-check, the brief, 28 October 2026

You are Codex astra, making VH-213's landing re-check, read-only. This is a separate run after your close check, which said "Commit". Claude Code's own verdict and the compare are deliberately kept from you: their copies, `reviews/2026-10-25/design-pass-3/evidence/measurements/vh213-claude-verdict-2026-10-27.md` and `…/vh213-codex-compare-2026-10-28.md`, are unchanged since your close check. **Don't open either.** Don't read anything outside this repository. You are read-only: run nothing that writes, and not the gate.

## What happened

VH-213's one commit was checked on base `5893d9d` (your close check: `…/measurements/vh213-codex-close-brief-2026-10-28.md` and `…/vh213-codex-close-2026-10-28.md.txt`). The orchestrator's landing go named origin/main `39a56bc` (VH-225's ledger-only PLAN-8 entry, over VH-208's `905e103` and VH-207's `a87e0f5`), and said VH-213 is the first side item to land. So the commit was rebased onto `39a56bc` and is now `HEAD`, with one uncommitted addition, the table's §8 "Landing".

## What to judge (the rebased diff against `39a56bc`: `git diff 39a56bc`, 103 files; `git diff 39a56bc --binary | shasum` should begin `b71b2ceb834f`)

1. **What the rebase changed.** Conflicts arose only in `project/decisions.md`, `project/decisions-2026-10.md`, `project/archive-index.md`, `project/trajectory.md` and `project/wish-list.md`. They were resolved by keeping every landed item's lines as they landed, with VH-213's lines placed by rules 4 and 6: the decisions files are taken from `39a56bc`, VH-213's entry is added on top, and `tools/archive.mjs` was re-run (it moved 2 entries); in the trajectory and the wish list, VH-213's line follows the landed ones. Check that no landed item's line was lost or altered, and that the archive moves are verbatim. Also check that VH-213's own code, tests and walker lines are unchanged by the rebase: for each file outside `project/`, compare `git diff 5893d9d 085db12 -- <file>` with `git diff 39a56bc HEAD -- <file>`, ignoring line numbers. `085db12` is the pre-rebase commit, still in the object store. `walker/scenarios.mjs` and `src/ui/warning-text.ts` merged beside VH-208's lines: check them closely.
2. **Added since your close check** (side-contract Close step 4, as the first side item to land):
   - the decision `2026-10-28 — PLAN-8 — VH-213 and VH-214 run beside the main line with walks queued; Codex's blind check alongside Claude's verdict`. Its Supersedes is VH-211's PLAN-8 heading, for the build order only. Its Decision line was shortened to fit the 1,000-word slice, and its detail is in the Rationale. Check its quotes, its claims and its Supersedes. The owner's words it quotes are the ~20:12Z and ~22:57Z entries of the orchestrators' notes, which are outside this repository, so judge them for consistency with the record only;
   - the order lines reconciled, one each: the Now "Next step" of `project/items/VH-212.md`, `VH-213.md`, `VH-214.md` and `VH-215.md`;
   - the table's §8 "Landing": is it true?
3. **Anything wrong, missing or inconsistent** in the rebased candidate, against the landed record (VH-208's and VH-225's entries, the backlog's VH-225 and VH-226 lines).

The gate ran on this candidate under the walk lock (AC, load 5.67): 83 test files, 1,600 passed, 1 skipped (EBU 7 and 8, pre-existing); markdownlint 0 issues; links 0 broken; `node tools/check.mjs` 0 failures, 1 warning (VH-122's `samples/CULT2011.mp4`, ignored by git and so absent from this worktree). The ledger quotes no verdict of this check, by design: it goes only in the commit's `Checked:` line.

## Your answer

Markdown, under 500 words: a first line `Verdict: <Commit | Commit after the musts below | Revise>`, where "Commit" means fit to amend and push as it stands; then numbered **musts** (defect, file:line, fix), **shoulds** and **notes**.
