<!-- markdownlint-disable -->
<!-- VH-199: the brief VH-199's worker gave Codex astra for run-09-part, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-09's part — Codex astra's read-only check (brief from VH-199 #6, 2026-10-27)

You are checking one run of UoN Video Helper's Phase 8, pass 3 evidence matrix (VH-199), read-only. Write nothing anywhere; answer in your final message only. Claude has its own reading of this run; it is not given to you, so that the two can be compared.

## What to read

With `V=/private/tmp/claude-501/-Users-joe-Library-CloudStorage-OneDrive-TheUniversityofNottingham--Joe-Bell-UoN-Files-2-Projects-2026-08-24-UoN-Video-Helper/27e7f48d-1fd3-4e4c-8d41-20d6c1cb6ab2/scratchpad/vh199`:
- **The part:** `PART=$V/runs/run-09-part-2026-10-27T05-04-47-007Z-e6d366`. It holds `manifest.json`, `digest.md`, `run.json`, one `<scenario>__<lang>__<view>__<mode>.json` per record, `captures/`, `artifacts.jsonl`, `fixtures.jsonl`, and `superseded/` (failed attempts moved aside by each resume, suffixed `~aN`).
- **Run-09's first dir:** `FIRST=$V/runs/run-09-2026-10-27T03-48-28-340Z-6d6b18`. It was stopped by hand twice, so it has no `manifest.json`; read its records, `run.json` and `superseded/`.
- **The logs:** `$V/logs/run-09-part.log` (the walker's output for the part's walk and every resume) and `$V/logs/run-09-part-resume.log` (the resume helper's lines); `$V/logs/run-09.log` and `$V/logs/run-09-resume.log` for the first dir. Per-group walk logs are under `$V/out/run-09-part-2026-10-27T05-04-47-007Z-e6d366/<group>/log.txt`.
- **The frozen walker,** for attribution: `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/` in this repo (`scenarios.mjs`, `faults.mjs`, `qualify.mjs`, `matrix.mjs`, `runner.mjs`, `phase8.mjs`, `parts.mjs`), with the player proof `reviews/2026-10-25/design-pass-3/evidence/measurements/player-proof-2026-10-25.json`. The app is `src/` and `index.html`. The acceptance criteria are `project/items/VH-199.md`.

## What the run should be

- **Why there are two dirs.** Run-09's first walk stalled twice in S-133's setup and was held at 123 ok, 13 failed and 194 not walked. The orchestrator ruled: S-133's records are held for the owner as a named instrument gap (its setup reloads after an unsaved result; the app's designed "Leave site?" dialog then blocks the frozen walker's `goto`, which has no dialog handler); the rest of run-09 is walked as a second dir with the walker's own subset mode, `node matrix.mjs run-09 S-119 S-120 S-146 S-152 S-03 S-15 S-40 S-47a S-48 S-58 S-63-LW S-77 S-45b S-79a S-81 S-50 S-68`, with no walker change.
- **The reconcile rule.** Each of run-09's 330 declared records counts once across the two dirs. The part's attempt supersedes the first dir's for any id in both. S-133's records stay not walked, held.
- **The part:** instrument revision `2e7b0c044ce11f2b`; source commit `a3039c3`; Chrome 156.0.8078.48. Walked from 05:04:47Z on 2026-10-27, then resumed in place by the helper until whole. On AC throughout; the machine's 1-min load ran about 38–80 (OneDrive, not the walker).
- **Known pattern, not a fault — grouping-type scenarios.** The frozen walker sets a page up once per group; the first record of a group is ok and later modes on the same page can fail their state predicate, each resume recovering one record per group. Earlier runs had S-92, S-95, S-96, S-107, S-117, S-120, S-128, S-143, S-149, S-150.
- **Known instrument gaps, accepted by the owner or held:** the `fallback` × Fetch-routed fault interaction (run-04's S-107, run-06's S-55c: the `fonts` route of `withholdFonts`, `qualify.mjs:1017`, is first in the router of `faults.mjs:19` and its `match` is always true); the check counter (`STATUS_SINCE`, `scenarios.mjs:1521`, cannot count an identical status text), which fails S-92's and S-93's check-count asserts; S-133's missing `beforeunload` handling (held, 6 records across run-09 and run-11); the finish+1s player row "paused a second after the card appeared" reading `player: false` when the scenario's next step has detached the player (`phase8.mjs:77`; S-88, S-109, S-128, S-138), which VH-200 counts as unverified.
- **Expected results that VH-200 judges, not faults:** the 32 px focus ring at the font32 mode; S-149 light's subresults (V-46); S-127's volume ring at 320 px "cannot determine"; transition rings not read where the successor is the reader or the dialog; the player rows of S-88 and S-128; S-59's "focus on the card"; S-132's player rows (F15b's intended state); the native scrubber's target rows (WCAG 2.5.5's user-agent exception); S-113's font32 sideways scroll; S-140n's focus row "cannot determine: no element"; the native overflow button's 2.4.13 rows (2.4.13's user-agent exception, per the player proof); the declared "cannot determine" person checks; S-102's sub-400 ms sound reaching the loudness refusal (the existing wish line VH-185.1).

## What to answer

1. **Whole?** Count the part's declared records (its `run.json`, and the frozen plan, `parts.mjs` `RUNS` filtered to the 17 ids), the records written, ok and failed. Is any record off the revision, or ok while missing a subject its own `expects` declares?
2. **The reconcile.** Using both dirs and `parts.mjs` `RUNS`' run-09 (330 records), does each declared record count exactly once under the rule above? Give the per-dir counts, name what the part supersedes in the first dir, and name the records held. Is any record missing, double-counted, or counted from a failed attempt?
3. **Attribute** every record in the part's `superseded/`, and every failed or "cannot determine" assert or measurement on an ok record (look inside each record's `instruments`, not only `digest.md`): an app finding (for VH-200), an instrument fault, or a known gap / known pattern as above. One line each, or one line per group where they share a cause. Say what evidence you read.
4. **Stop?** Name anything that should stop the evidence run: an instrument fault that makes records untrustworthy, a coverage reduction beyond the ruled hold, or an app rank 1 problem (a WCAG 2.2 AAA failure that blocks a task, data loss, media egress, or a crash).
5. **Verdict:** one line, "Fit", "Fit with a named gap" (name it) or "Not fit", for run-09 (the two dirs together, under the rule) as evidence for VH-199.

Keep the answer under 600 words.
