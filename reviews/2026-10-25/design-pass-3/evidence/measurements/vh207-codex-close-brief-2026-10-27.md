<!-- markdownlint-disable -->

# VH-207 — Codex astra's close check, the brief, 27 October 2026

You are Codex astra, read-only. This is the close check of VH-207, a separate run from your blind check and your re-check. Read nothing outside this repository.

## The candidate

The complete close diff is the uncommitted working tree against `5893d9d`: `git diff 5893d9d` (ten modified files) plus the untracked files (`git status --porcelain`; `git ls-files --others --exclude-standard` lists 65), all in `reviews/2026-10-25/design-pass-3/evidence/measurements/`: the table `vh207-focus-2026-10-27.md`, its records in `vh207-records-2026-10-27/`, and the design, blind and re-check files with their compares. The candidate is frozen. `src/main.ts` and the two walker files are unchanged since your re-check; what is new since then is the ledger close and the compare's last section.

## The owner's ruling: musts 2 and 3 are not reopened

Your re-check held must 2 ("by keys": the variants place focus with the pass's `focusByKeyboard`, not Tab traversal) and must 3 (the next Tab read after the ring instrument). Claude read both as met, and the evidence could not settle it, so they went to the owner. The owner, 2026-10-27 about 22:57Z, verbatim: "A: accept VH-207's readings as they stand (focus placed by the pass's focusByKeyboard; the next Tab read after the ring instrument, which restores focus) and close it." Check the close against that ruling; do not reopen musts 2 and 3.

## What to check

1. **Musts 1, 4 and 5.** Must 1 (`#trim-clear`) and must 4 (the before's source identity) you resolved at the re-check; note only a regression. Must 5, the gate on this candidate: `npm run check` was green on exactly this tree, started at load 6.59 on AC (23:25Z, 2026-10-27): 83 test files, 1,582 passed, 1 skipped (EBU cases 7 and 8, an `it.skip` from before); markdownlint 0 issues; 0 broken links; check-memory 0 structural with the canon's 7 warnings; `node tools/check.mjs` 0 failures and 0 warnings. It runs again after your check, with this brief and your answer added as evidence, the one addition allowed.
2. **The owner's answer, recorded verbatim and accurately,** in the compare (`vh207-codex-compare-2026-10-27.md`, its last section), the item's Notes (`project/items/VH-207.md`) and the decision entry's Rationale; and nowhere stated as more than he said.
3. **The ledger close.**
   - `project/decisions.md`: the new VH-207 close entry, in the file's grammar (heading, Decision, Rationale, Supersedes, Deferred); its claims supported by the table and records.
   - `project/decisions-2026-10.md` and `project/archive-index.md`: `tools/archive.mjs`'s verbatim move of one entry, VH-171's.
   - `project/backlog.md`: VH-207 struck. `project/trajectory.md`: the new line.
   - `project/items/VH-207.md`: Now and Notes.
   - `reviews/2026-10-25/design-pass-3/design-pass-3-2026-10-27.md`: V-46's Disposition row, with the evidence link, and the "updated at" sentence.
   - Any deferral or follow-up named in the close without a line in `project/wish-list.md` or `project/backlog.md` (AGENTS.md rule 5), or a wish line the work paid off and left open (rule 6).
4. **The commit message,** below, as drafted: accurate to the diff and the evidence, and the owner's answer verbatim. Its `Verify:` line is the gate result above; its `Checked:` line takes your verdict as given.
5. **Anything else in the diff** that VH-207 doesn't explain, or any claim in the ledger that the evidence doesn't support.

## The commit message, as drafted

```text
VH-207: focus handed on when the choosing or an unreadable file takes the focused control away — to the file input, or the same control re-rendered; "Use the whole video" captured; S-149a to S-149f and F20 proved; 168 cells and the eight routes before and after; the readings as walked, on the owner's answer; VH-207 closes, VH-208 next

One capture at the top of the file input's change handler hands focus on what the choosing withdraws (the check's Stop and Check again, the read, the verdict, Create's row, and the trim's controls the reading lock disables, "Use the whole video" included) to the file input, and focus in the result to the same control shown again: Save, the player, the card, and the "discard it?" question to the card. One capture at the top of clearTrim('unreadable'), where the failed reply and the exception meet, hands focus in the withdrawn steps to the file input, or to Stop saving. No element, no words, no other caller of focusHeldBy changed. The capture is in main.ts, which focus-hand-on.test.ts cannot reach, so the walker's variants are its proof, (c) walking the exception path through F20; the player, card, question and earlier withdrawals are proved by reading.

Built by VH-207 #1, which added and proved the walker's variants S-149a to S-149f and the fault F20, the only walker changes approved, and walked the before on a git archive export of 5893d9d. Resumed by VH-207 #2: the design put to Codex astra blind first, its two points taken; the build; the after walk; Codex's blind check and its re-check, which resolved "Use the whole video" (added, and probed ×8 before and after) and the before's source identity, and held two musts the evidence could not settle. Closed by VH-207 #3 on the owner's answer. Evidence: reviews/2026-10-25/design-pass-3/evidence/measurements/vh207-focus-2026-10-27.md and vh207-records-2026-10-27/.

The owner, 2026-10-27 about 22:57Z, verbatim: "A: accept VH-207's readings as they stand (focus placed by the pass's focusByKeyboard; the next Tab read after the ring instrument, which restores focus) and close it."

Digest rules applied: wcag-2.2-aaa 2.4.3 and "focus appearance"; nielsen 3, user control and freedom.

Verify: <the gate re-run after this check, on this content plus this brief and your answer>
Checked: gpt-6-astra — <your verdict, as given> — V-46

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

## Your answer

Markdown, under 400 words: a first line `Verdict: <Commit | Commit after the musts below | Revise>`, then numbered musts with file:line, then notes.
