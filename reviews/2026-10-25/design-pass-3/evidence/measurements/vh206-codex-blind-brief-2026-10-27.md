<!-- markdownlint-disable -->

# VH-206 — Codex astra's blind check, the brief, 27 October 2026

You are Codex astra, checking VH-206 read-only and blind. Claude Code built it; its own verdict and any compare are deliberately kept from you. They are not in this repository, so don't look for them, and don't read anything outside this repository. Judge from the evidence below alone.

## What VH-206 is

`project/items/VH-206.md` is the contract: read it in full. Each acceptance criterion holds. In short, it fixes pass 3's V-51. A trimmed part kept with less than one 400 ms gating block of sound became "This video has no audio" (VH-185). That is untrue when the part holds a little real sound. The kept-part case must now be told apart, in the owner's approved words, in three languages. A source with no audio track keeps today's words.

## The candidate

- Base: `446f702`. The candidate is the uncommitted working tree: `git diff 446f702 -- src reviews/2026-10-18 reviews/2026-10-25/design-pass-3/evidence/measurements/walker docs project/rules.md`.
- The code path is `src/workers/job.worker.ts` → `src/audio/warnings.ts` → `src/ui/warning-text.ts`. The words are in `src/i18n/en-GB.ts`, `zh-Hans.ts` and `ms-MY.ts`, with notes in `src/i18n/sheet.ts` and the row in `reviews/2026-10-18/VH-105-strings-filled.csv`. The tests are `src/audio/warnings.test.ts`, `src/ui/warning-text.test.ts`, `src/media/sub-block-sound.test.ts` and `src/i18n/tables.test.ts`. Read `src/media/audio-plan.ts` (`keptTooLittleSound`, `analyseSourceAudio`) for context.
- The walker: three predicate moves in `walker/scenarios.mjs` (S-99, S-101, S-153). S-20 is left unchanged.
- The spec: one row in `docs/01-specification.md` §5.4, "No audio track". `project/rules.md`'s By task budget for the spec is raised from 8,100 to 8,200, on the owner's word (the newest VH-206 entry in `project/decisions.md`, the budget one; read only that entry).
- The gate, `npm run check`, ran green on the code and tests before the walker, spec and rules edits. Don't run it; you are read-only.

## The evidence

- The table: `reviews/2026-10-25/design-pass-3/evidence/measurements/vh206-no-audio-2026-10-27.md`, the before (on `446f702`) and after (on the candidate) per cell, the predicate proof and the WCAG re-check.
- The records: `reviews/2026-10-25/design-pass-3/evidence/measurements/vh206-records-2026-10-27/`, JSON per cell, the summaries, the probe and the fixtures script.

## What to judge, each with file and line or record

1. **Each acceptance criterion:** met, not met or not shown.
2. **The code:**
   - Is the reason carried correctly through the worker?
   - Is the precedence of `cut-short` and `ends-early` unchanged?
   - Does a trimmed keep with no decoded sound go with the kept-part case?
   - Does a declared sound that never arrives stay `ends-early`?
   - Does `detail` stay free of the reason?
   - Is an untrimmed file unchanged?
   - Is `src/audio/loudness.ts` untouched?
   - Find any defect or missed path.
3. **The words:** verbatim against the item in all three languages, with the notes and the CSV row consistent.
4. **The tests:** do they pin each case the item lists, in each language? Is any test weakened, deleted or skipped?
5. **The walker:** only the three approved moves, S-20 unchanged, and each move proved before the after was read.
6. **The spec row:** true to the code, and the only `docs/` change. Is the spec within 8,200 (`node tools/ledger.mjs` counts whitespace words after comments and fences)?
7. **The measurements:**
   - Does the after show the new words where expected, and the old ones for S-20?
   - Do S-101, S-153 and the exact blocks still say nothing, with the jobs and output tracks unchanged?
   - Is there any regression in lines, overflow, measure or spoken text?
   - Is anything unmeasured that the item requires?
8. **WCAG:** 3.3.1, 3.3.3, 3.1.5, 4.1.3, 2.4.6, 1.4.8, 1.4.10 and 1.4.12, as the table claims them.

## Your answer

Markdown, under 700 words:

- a first line `Verdict: <Commit | Commit after the musts below | Revise>`;
- then numbered **musts** (each a defect with file:line and the fix), **shoulds**, and **notes**;
- then one line per acceptance criterion: met, not met or not shown.
