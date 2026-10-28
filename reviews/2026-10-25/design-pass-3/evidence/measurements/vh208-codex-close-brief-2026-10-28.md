<!-- markdownlint-disable -->

# VH-208 — Codex astra's close check, the brief, 28 October 2026

You are Codex astra, read-only. This is the close check of VH-208 (V-52), a separate run from your blind check and your re-check. Read nothing outside this repository.

## The candidate

The complete close is the uncommitted working tree against `a87e0f5`: `git diff a87e0f5` (17 modified files) plus the untracked files (`git status --porcelain`; `git ls-files --others --exclude-standard` lists 124), all in `reviews/2026-10-25/design-pass-3/evidence/measurements/`: the table `vh208-warnings-2026-10-28.md`, its 113 records in `vh208-records-2026-10-28/`, and ten design, blind and re-check files with their compares (`vh208-*-2026-10-28.md` and `.md.txt`). The candidate is frozen.

Since your re-check, `src/`, `test/` and the walker are unchanged. What is new is the ledger close; the table's §6 and §11, where only the wish IDs VH-208.1 to VH-208.3 were added; and the ten files copied in from the session's notes: the three answers verbatim as `.md.txt`, and the briefs, Claude's design reading and verdict and the compares as `.md`, three with only the provenance header (`<!-- markdownlint-disable -->` and a blank line) added. Their sources are outside this repository: check only that they read as the evidence they claim to be.

## Two rulings, not reopened

- The owner, 2026-10-28 about 09:57Z, verbatim, answering "Go ahead on all three as recommended?": "Yes, all three". It approved S-136's and S-91's asserts changed to "no notification nested in the card", keeping the order check; no other walker change is approved.
- Orchestrator #21, verbatim: "S-138's timing-dependent player row goes in VH-208's table as such. If it is a walker defect, it is a wish line under rule 5 at VH-208's close, not a walker fix in VH-208 (no walker change beyond its criteria)." S-138's defect is put to the existing wish VH-199.1 (`project/wish-list.md`), whose words cover it.

## What to check

1. **Musts 1 to 4 and both shoulds** you resolved at the re-check; note only a regression. **Must 5, the close:** the ledger, the Disposition row, the wish lines and the gate. The gate on exactly this tree, under the walk lock, started at load 5.88 on AC, power mode 2 (17:23Z, 2026-10-28): 83 test files, 1,584 passed, 1 skipped (EBU cases 7 and 8, an `it.skip` from before, VH-27); markdownlint 0 issues; 0 broken links; check-memory 0 structural with the canon's 7 warnings; `node tools/check.mjs` 0 failures and 0 warnings. It runs again after your check, with this brief and your answer added as evidence, the one addition allowed.
2. **The ledger close.**
   - `project/decisions.md`: the new VH-208 close entry, in the file's grammar (heading, Decision, Rationale, Supersedes, Deferred); each claim supported by the table and records.
   - `project/decisions-2026-10.md` and `project/archive-index.md`: `tools/archive.mjs`'s verbatim move of one entry, the oldest live one.
   - `project/backlog.md`: VH-208 struck. `project/trajectory.md`: the new line.
   - `project/items/VH-208.md`: Now and Notes.
   - `reviews/2026-10-25/design-pass-3/design-pass-3-2026-10-27.md`: V-52's Disposition row, with the evidence link, and the "updated at" sentence.
   - `project/wish-list.md`: VH-208.1 (the card's own ring once the card outgrows the viewport, table §6), VH-208.2 (`walker/heavy-193.mjs:78`'s selector), VH-208.3 (S-91's changed assert, for VH-203's after-run).
3. **Rules 5 and 6:** any deferral or follow-up named in the close (the decision, the item, the trajectory line, the table, the commit message) without a line in `project/wish-list.md` or `project/backlog.md`; any open line the work paid off and left open.
4. **The commit message,** below, as drafted: accurate to the diff and the evidence. Its `Verify:` line is the gate re-run; its `Checked:` line takes your verdict as given.
5. **Anything else in the diff** that VH-208 doesn't explain, or any claim in the ledger that the evidence doesn't support.

## The commit message, as drafted

```text
VH-208: the finished video's warnings before its player and Save, the card's own content with no rail of their own; the completion line carries heavy limiting's listening sentence whole; warnBox, the completion check and S-136's and S-91's asserts moved and proved; 198 cells before and after; VH-208 closes, VH-212 next

The output's warnings are drawn as the finished card's own content (renderWarnings' contentOnly: section.result-warnings, the same region named by its title and the same list, with no data-kind and one --spacing-05 margin), after its title and lines and before the player, the lifetime line and Save, in every paint: a "Previous video", after "Keep it", after a save and after a language change. warningsSpoken adds heavy limiting's existing detail whole after the titles, chosen by its code, Announce progress on or off; other warnings keep their titles alone. No element, no words, no other caller; VH-193's and VH-192's decisions stand, and Save stays the one primary. VH-150's pin in test/screen-text.test.ts is rewritten to the new order and still forbids one notification nested in another; announce.test.ts matches.

The walker's approved changes were proved first, at a3a4267ad47d8bd5: warnBox qualified in both layouts, the completion check rejecting heading-only speech for heavy limiting, and its prove-8.mjs fixture, 85 of 85; S-136's and S-91's asserts, on the owner's ruling, 14 of 14. The owner, 2026-10-28 about 09:57Z, verbatim, answering "Go ahead on all three as recommended?": "Yes, all three".

Built and measured by VH-208 #1 to #7: the design checked with Codex astra and compared; the before on a git archive export of a87e0f5, content-checked, and the afters, 198 cells, the player probed before and after; Claude's verdict saved before Codex's blind check, and compared. #8 repaired the table and had it re-checked; the close was made from #8's hand-back. S-152's state, F15b's, is recorded; its words are VH-212's. The card's own ring is a limitation in the 32 cells where the card now outgrows the viewport. Evidence: reviews/2026-10-25/design-pass-3/evidence/measurements/vh208-warnings-2026-10-28.md and vh208-records-2026-10-28/.

S-138's player row is timing-dependent, a 1 s sample racing the walker's own next step: on Orchestrator #21's ruling it stands in the table as such, and its defect is the existing wish VH-199.1. New wish lines: VH-208.1, the card's ring once the card outgrows the viewport; VH-208.2, heavy-193.mjs:78's selector; VH-208.3, S-91's changed assert, walked in VH-203's after-run.

Digest rules applied: nielsen 1, "status visible and announced", 5 and 6; carbon, "one primary per state"; wcag-2.2-aaa, 4.1.3.

Verify: <the gate re-run after this check, on this content plus this brief and your answer>
Checked: gpt-6-astra — <your verdict, as given> — V-52

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

## Your answer

Markdown, under 400 words: a first line `Verdict: <Commit | Commit after the musts below | Revise>`, then numbered musts with file:line, then notes.
