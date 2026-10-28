<!-- markdownlint-disable -->

# VH-213 — Codex astra's blind check, the brief, 28 October 2026

You are Codex astra, checking VH-213 read-only and blind. Claude Code built and measured it; its own verdict and any compare are deliberately kept from you. They are not in this repository, so don't look for them, and don't read anything outside this repository (no parent folder, no other worktree). Judge from the evidence below alone.

## What VH-213 is

`project/items/VH-213.md` is the contract: read it in full. Each acceptance criterion holds. In short, it closes wish VH-185.1. VH-185 made a trimmed keep with under one 400 ms gating block of decoded sound a silent job warned before Create, and VH-206 gave that case true words by a typed reason. A whole (untrimmed) video with under one block of sound still reached the loudness refusal late (S-102). The owner chose, 2026-10-27 ~16:18Z, verbatim: "Same rule as a trim (Recommended)": a whole video with under 400 ms of sound is warned before Create, then made with no audio, the original untouched; spec §5.4's row widened to match; the words are the item's drafts verbatim (zh-Hans and ms-MY machine translations, marked so). Not taken: "Refuse before Create". The item's ledger lines (its Notes, the `[!]`, the backlog, trajectory and decision) are not yet written; they come at close and get a separate check.

## The candidate

- Base: `5893d9d`. The candidate is the uncommitted working tree: `git diff 5893d9d` (16 tracked files, nothing staged), plus 53 untracked files, the table and its records (below).
- The code path: `src/media/audio-plan.ts` (`keptTooLittleSound`, `analyseSourceAudio` and its caller) → `src/workers/job.worker.ts` → `src/audio/warnings.ts` → `src/ui/warning-text.ts`. The words: `src/i18n/en-GB.ts`, `zh-Hans.ts`, `ms-MY.ts`, notes in `src/i18n/sheet.ts`, the row in `reviews/2026-10-18/VH-105-strings-filled.csv`. Tests: `src/media/sub-block-sound.test.ts` (with `test/helpers/pcm-mp4.ts`), `src/audio/warnings.test.ts`, `src/ui/warning-text.test.ts`, `src/i18n/tables.test.ts`.
- `src/audio/loudness.ts` is protected: `BLOCK_SECONDS` may be read, never changed.
- The walker: the one approved change, S-102's predicate in `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/scenarios.mjs`, made to require the chosen outcome and to read the output file's tracks; any other walker change was forbidden.
- The spec: one row in `docs/01-specification.md` §5.4 (VH-206's kept-part row widened to a whole video). Its budget is 8,200 words (`project/rules.md`, By task; the VH-206 budget entry in `project/decisions.md`, read only that entry); at least 2 words must stay free under 8,200 for another approved item.
- The gate, `npm run check`, runs at close. Don't run it, or anything that writes; you are read-only.

## The evidence

- The table: `reviews/2026-10-25/design-pass-3/evidence/measurements/vh213-whole-sub-block-2026-10-27.md`: provenance, the load judgement, the fixtures and their proofs, S-102's predicate and its proof, before (a `git archive` export of `5893d9d`) and after (the candidate) per cell, the words, lines, jobs and output tracks, and the WCAG re-check.
- The records: `…/measurements/vh213-records-2026-10-27/`, 52 files: JSON per cell for the before, the main after and its low-load re-run (`after-rerun-*`), the summaries, the predicate proof, the fixture proofs, the reading grades and the scripts (`.mjs.txt`, `.sh.txt`), each with its sha256 in the table.

## What to judge, each with file and line or record

1. **Each acceptance criterion:** met, not met or not shown.
2. **The code:**
   - Does an untrimmed source with under one block of decoded sound get the warning before Create and a silent job that finishes, with the source untouched?
   - Does decoded sound decide, never padded silence? Does a track whose declared sound never arrives stay `ends-early`? Is the precedence of `cut-short` and `ends-early` unchanged?
   - Is the reason carried three ways, whole video, kept part and no track, through the worker to the words?
   - Are VH-206's trimmed cases and the no-track words unchanged? Is `loudness.ts` untouched?
   - Find any defect or missed path.
3. **The words:** verbatim against the item in all three languages, machine translations marked, with the notes, the CSV row and the regenerated sheet consistent.
4. **The tests:** do they pin each whole-file case the item lists (no track, none decoded, just under, exactly and just over one block) and the words in each language?
   - **The replaced test.** The base's case "leaves an untrimmed file as it was" in `src/media/sub-block-sound.test.ts` no longer exists in that form. Judge, from `git diff 5893d9d -- src/media/sub-block-sound.test.ts`, whether it was replaced by cases that pin the new behaviour (allowed) or deleted, skipped or weakened (rule 7 forbids it). Is any other test weakened, deleted or skipped?
5. **The walker:** only S-102's predicate changed; S-20, S-99, S-101 and S-153 unchanged; the change proved before the after was read.
6. **The spec row:** true to the code, the only `docs/` change, within 8,200 with at least 2 words free (`node tools/ledger.mjs` counts whitespace words after comments and fences; you may read it, not run anything that writes).
7. **The measurements:**
   - Do S-102 and whole-390 show the whole-video words, finish, and give an output with video and no audio? Are whole-400 and whole-410 levelled with sound and no note? Does S-20 keep its no-track words, and S-99, S-101 and S-153 read unchanged?
   - **whole-cut** (PCM, an index declaring 10 s, 320 ms of sound arriving): judge its before and after outcome against the item's "a track whose declared sound never arrives stays `ends-early`". Is the after true to what the person is told, and is it a change the item allows?
   - Is there any regression in lines, overflow, measure or spoken text? Is anything the item requires unmeasured?
8. **The load judgement:** the after's main run had 45 of 54 groups above the probe's flag line (1-minute load 8) and was re-walked whole at low load; the before's 5 flagged groups (8.10–9.72) were not re-walked. Is that sound? Are the before and after in the same power mode, and is any measurement taken across a change of power or load left unflagged?
9. **WCAG:** 1.4.8, 2.4.6, 3.1.5 and 4.1.3 (and 1.4.10 as read), as the table claims them. Tokens: no literal outside `src/config/` or a token, and no control or element added.

## Your answer

Markdown, under 800 words:

- a first line `Verdict: <Commit | Commit after the musts below | Revise>`;
- then numbered **musts** (each a defect with file:line and the fix), **shoulds**, and **notes**;
- then one line each for the replaced test, whole-cut and the load judgement: sound or not, and why;
- then one line per acceptance criterion: met, not met or not shown.
