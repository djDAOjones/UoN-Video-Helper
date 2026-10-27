<!-- markdownlint-disable -->

# VH-207 — Codex astra's blind check, the brief, 27 October 2026

You are Codex astra, checking VH-207 read-only and blind. Claude Code built it; its own verdict and any compare are deliberately kept from you. They are not in this repository, so don't look for them, and don't read anything outside this repository. Judge from the evidence below alone.

## What VH-207 is
`project/items/VH-207.md` is the contract: read it in full; every acceptance criterion holds. It fixes pass 3's V-46: focus lost to the page when an unreadable file withdraws the step that holds it, and when the choosing itself disables or replaces the focused control.

## The candidate
The uncommitted working tree against its base `5893d9d`: `git diff 5893d9d` (`src/main.ts`; the walker's `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/scenarios.mjs` and `faults.mjs`, the variants S-149a to S-149f and the fault F20, the only walker changes the owner approved) plus the untracked evidence (`git status --porcelain`): the table `reviews/2026-10-25/design-pass-3/evidence/measurements/vh207-focus-2026-10-27.md` and its records in `vh207-records-2026-10-27/` beside it (before and after per-variant JSON, the summaries as `.md.txt`, the proof of F20 and the variants, the driver and scripts as `.txt`, each run's `run.json` and `manifest.json`). The ledger edits are not made yet; don't judge them.

## What to check
1. Each acceptance criterion: met, not met, or not shown, with the evidence (file and line, or record).
2. The code: the capture at the choosing (before anything is withdrawn) and its successors; the capture in `clearTrim('unreadable')` and why once there; the guards (`src/ui/focus-hand-on.ts`); that no other `focusHeldBy` caller, nor `renderResult`, `clearResult`, "Keep it" or `withdrawDiscardQuestion`, changes behaviour; any defect (ordering, a stale reference, a successor that cannot take focus, TypeScript or lint risk).
3. The walker: the variants and F20 as the criteria declare them, proved before the after; no other walker change; the readings taken before any instrument moves focus.
4. The measurement: before and after whole for every cell the stage rule lists, the provenance (the before was walked on an export; say if that is a problem), the rings (2.4.13), the routes, and the WCAG re-check (2.1.1, 2.4.3, 2.4.7, 2.4.11, 2.4.12, 2.4.13, 4.1.3).
5. Scope: anything built beyond the criteria, or anything the criteria ask for that is missing.

## Answer
Under 800 words. List each must (a defect or an unmet criterion that blocks a commit) and each should, separately. End with one line: `Verdict: <Commit | Commit after the musts below | Do not commit>`.
