<!-- markdownlint-disable -->

# VH-216 — Codex astra's re-check of the repair, the brief, 30 October 2026

You are Codex astra, re-checking VH-216's repair read-only. Your blind check returned "Commit after the musts below"; its answer is `/Users/joe/UoN-Video-Helper-side/vh216-codex-blind.md`. Your should points on `src/ui/system-check.ts:56`, the VH-216 sheet test's `describe` and the CSS test's title were taken, with others found by Claude, and the repair has been made. Your other musts are for the close, which you will check separately. Never write or change any file.

## What you may read
- **This repository** (your working directory), tracked and untracked, and `git` read-only.
- **Outside it, only:** `/Users/joe/UoN-Video-Helper-side/vh216-codex-blind.md`, and in `/Users/joe/UoN-Video-Helper-side/vh216-walk/`: `repair-1.diff`, `strings-proof-2.txt`, `strings-proof-3.txt`.
- **Nothing else in `/Users/joe/UoN-Video-Helper-side/`.** **Never read any folder under `/Users/joe/Library/Application Support/Claude/side-session-notes/`.**

## The repair
The candidate: `git diff 3741193`, now 16 modified files; hash `git diff --binary | shasum -a 1 | cut -c1-16` is `9c9e1908b82afe91`. Before the repair it was `7cd34e86be434481`, on which every walk stands. The change between them is `vh216-walk/repair-1.diff`:
- **Comments, their words only:** `src/ui/system-check.ts:56`, `src/config/video-kind.ts:2`, `src/styles/tokens.carbon.css:104`, `test/readability.test.ts:116`.
- **Tests, no assertion changed:** `src/i18n/tables.test.ts`, the sheet test in its own `describe`; `test/stylesheet.test.ts`, the `order` test's title.
- **The table,** `reviews/2026-10-25/design-pass-3/evidence/measurements/vh216-first-action-2026-10-30.md`: one added bullet in §10 (the heading outline), and an added §12. `vh216-records-2026-10-30/` gains `repair-1.diff.txt` and one line in `sources.txt`. Nothing else rewritten.
- **Run:** typecheck 0; eslint on the changed test and source files 0; four test files, 223 passed. The full gate is at the close.

## What to check
1. The repair is what it says: every changed line in `repair-1.diff` is a comment, a test's title or `describe` wrapping or the moved test verbatim; no assertion, rendered byte, element, string, selector or declaration changed, so the walks on `7cd34e86be434481` still stand and no re-walk is owed.
2. Each new comment is true of the new order.
3. **A sweep:** any other comment in `src`, `test`, `scripts`, `tools` or `index.html`, in these or other files, that the move makes false: "lede", "above", "under", "top of the page", "the promises". Keys like `lede.promises` are names, not statements, and stay. Don't go beyond these points.
4. §10's added bullet and §12: accurate?

## Answer
Under 300 words. Each must and should, separately. End with one line: `Verdict: <Commit | Commit after the musts below | Do not commit>`, the verdict covering the candidate as repaired, with the ledger's close still to come.
