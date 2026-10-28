<!-- markdownlint-disable -->

# VH-213 — Codex astra's re-check, the brief, 28 October 2026

You are Codex astra, re-checking VH-213 read-only. This is a separate run after your blind check. Claude Code's own verdict and the compare of the two are deliberately kept from you. Their copies are in the measurements folder (`vh213-claude-verdict-2026-10-27.md`, `vh213-codex-compare-2026-10-28.md`): **don't open either.** Don't read anything outside this repository (no parent folder, no other worktree). Judge from the evidence below alone. You are read-only: run nothing that writes, and not the gate.

## What VH-213 is

`project/items/VH-213.md` is the contract, and each of its acceptance criteria holds. A whole (untrimmed) video with under one 400 ms block of decoded sound is warned before Create, then made with no audio, the original untouched. This was the owner's choice, 2026-10-27, "Same rule as a trim (Recommended)". The item's ledger lines (its Notes, the `[!]`, the backlog, the trajectory, the decision and the wish line) are not yet written. They come at close, with a separate close check.

## Your blind check, and what has happened since

Your blind brief is `reviews/2026-10-25/design-pass-3/evidence/measurements/vh213-codex-blind-brief-2026-10-28.md` and your answer is `…/vh213-codex-blind-2026-10-28.md.txt` (read both). Your verdict was "Revise", with must 1, must 2 and should 3:

1. **Must 2, the none-decoded control:** repaired by a new fixture and cell, `whole-none`, walked before and after. The table's new §6 has it, and its records are in `…/measurements/vh213-records-2026-10-28/` (15 files, with sha256s in §6).
2. **Should 3, the load account:** the table's §1 load judgement is rewritten, and its Main run row notes the end check.
3. **Must 1, a partly decoded file that ends early:** the owner decided it, 2026-10-28 ~09:57Z, verbatim: "Yes, all three". He was answering "Go ahead on all three as recommended?", whose first point was "VH-213's must 1, option (a): a wish line for both paths, and VH-213 closes without the repair." So no code, test, word or walker change is made for it. One wish line, VH-213.1, is to be added to `project/wish-list.md` at the ledger step, for both paths: when a job will be silent and the file ends early, the note says the whole new video has no audio. The table's §7 records this. Don't re-argue the owner's choice. Judge only whether it is recorded truly and whether anything else in the candidate depends on the repair.
4. **Added since the blind run, besides the above:** the table's §7; a correction in §3 (en-GB longest line at 320 px, 33 → 31); and the copies of your blind brief and answer beside the table (with the two files you must not open).

The tracked diff is unchanged since your blind run. `git diff 5893d9d --binary | shasum` should still begin `cd985a8d4dcf`; check that it does.

## The candidate

- Base `5893d9d`. The candidate is the uncommitted working tree: `git diff 5893d9d` (16 tracked files, nothing staged), plus the untracked files, which are the table, its two records folders and the copies above.
- The table: `reviews/2026-10-25/design-pass-3/evidence/measurements/vh213-whole-sub-block-2026-10-27.md`. Read it whole, and §§1, 3, 6 and 7 closely.
- The new records: `…/vh213-records-2026-10-28/`: the three `whole-none` runs (`before-none-*`, `before-none-batt-*`, `after-none-batt-*`), the fixture proof `fixtures-proof.vh213-5.json`, `whole-aac-empty-boxes.txt`, and the scripts as run (`.txt`). `servers.sh` is the 27 October folder's.
- The earlier records: `…/vh213-records-2026-10-27/` (52 files, unchanged).
- The walks ran under the project's Power rule: on AC, or on battery above 50% and not in Low Power, with an item's before and after in the same power mode.

## What to judge, each with file and line or record

1. **Must 2's repair.**
   - Is the fixture's "none decoded" proved independently of app code (by ffprobe and ffmpeg)?
   - Is the cell declared before any after read, walked before (base export) and after (candidate) in en-GB, zh-Hans and ms-MY at 1280 and 320 px, each reading the four modes, with the output's tracks read?
   - Do the records show what §6 says, before and after?
   - Are the pair's two sides in the same power mode? Is any measurement across a change of power or load left unflagged?
   - Is the instrument change between the AC before and the battery pair (the power gate only) stated truly, and does it matter?
   - Is the item's "none decoded" control now met?
2. **Should 3's fix.** Check §1's load judgement and Main run row against `vh213-records-2026-10-27/before-run.json` and `after-run.json`. Is it now true and complete?
3. **Must 1's disposition.** Is it recorded truly in §7? Does anything in the candidate still promise or depend on the repair? Is the wish line, as worded, a fair record of your must 1 for both paths?
4. **Everything added since your blind check:** the §3 correction (check it against the records), §7, the records folder and its sha256s (re-hash them), and the links. Is anything wrong, missing or unproved?
5. **Each acceptance criterion** that your blind answer judged "not met" or "not shown": now met, not met, or owed at close (the ledger, the gate, the close check, the linkage).

## Your answer

Markdown, under 600 words:

- a first line `Verdict: <Commit | Commit after the musts below | Revise>`, where "Commit" means fit to go on to the ledger and the close check;
- then numbered **musts** (each a defect with file:line and the fix), **shoulds** and **notes**;
- then one line each for must 2, should 3 and must 1: repaired, fixed or disposed of truly, or not, and why;
- then one line per criterion from point 5.
