<!-- markdownlint-disable -->

# VH-212 — Codex astra's re-check, the brief, 28 October 2026

You are Codex astra, re-checking VH-212 read-only after a repair. Your blind check (earlier today) answered "Commit after the musts below" with one must and one should, both on the measurement table. Claude Code has repaired those two points, and nothing else has changed. Check the repair only, and anything added since your check. Never write or change any file.

## What you may read
- **This repository** (your working directory), tracked and untracked, and `git` read-only.
- **Outside it, only:** `/Users/joe/UoN-Video-Helper-side/vh212-walk/` (the walk's records, read by `grep`, `head` and line ranges; skip `chrome-profile/`), and `/Users/joe/UoN-Video-Helper-side/vh212-wip-4/untracked/reviews/2026-10-25/design-pass-3/evidence/measurements/vh212-playback-advice-2026-10-28.md`, the table as it stood at your check.
- **Nothing else** in `/Users/joe/UoN-Video-Helper-side/` (no brief, hand-over, progress note, verdict or compare). **Never read any folder under `/Users/joe/Library/Application Support/Claude/side-session-notes/`.**

## Your two points, as you gave them
1. **Must:** "Correct 3.1.5 in the measurement table. It currently says "holds" for all three languages based on the agent's reading. Specification §9.3 explicitly reserves translated terms and reading level for a person. Retain the textual assessment, but record Chinese and Malay reading-level validation as not shown—a limitation, linked to existing wish VH-105.2. Re-check that correction before commit."
2. **Should:** "Correct the table's before-load median at line 36: the 34 samples in `before-1.load.log.txt` have median 5.955, approximately 5.96, not 5.92. This does not change the settled load judgement."

## The repair
- The table `reviews/2026-10-25/design-pass-3/evidence/measurements/vh212-playback-advice-2026-10-28.md` (untracked) changed at two lines only: `diff` it against the copy named above (expect `36c36` and `118c118`).
  - `:36`, §2: the before's median now 5.96.
  - `:118`, §6, 3.1.5's result: "a reading, not a measurement: the change adds no difficulty. The reading level is a person's to confirm (spec §9.3), a limitation; in zh-Hans and ms-MY, machine-translated, it is not shown until a colleague checks the language on the live page (wish VH-105.2)".
- **Nothing added since your check:** `git diff b4ec37a` is unchanged (the ten files), the records in `vh212-records-2026-10-28/` unchanged (50 files; their sha1s in its `sources.txt`), and `git status --porcelain` the same 12 lines.

## What to check
1. Whether each point is repaired: the 3.1.5 row against `docs/01-specification.md` §9.3 (`:730–736`) and wish VH-105.2 (`project/wish-list.md`); the median against `vh212-records-2026-10-28/before-1.load.log.txt`.
2. That nothing else changed in the table, the tracked diff or the records.
3. Whether the repaired 3.1.5 row now fits the rest of §6 and §8 (limitations recorded, never as passed).

## Answer
Under 300 words. Each remaining must and should, separately. End with one line: `Verdict: <Commit | Commit after the musts below | Do not commit>`.
