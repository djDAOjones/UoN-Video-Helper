<!-- markdownlint-disable -->
<!-- VH-199: the brief VH-199's worker gave Codex astra for run-11-part, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-11's part — Codex astra's read-only check (brief from VH-199 #7, 2026-10-27)

You are checking one run of UoN Video Helper's Phase 8, pass 3 evidence matrix (VH-199), read-only. Write nothing anywhere; answer in your final message only. Claude has its own reading of this run; it is not given to you, so that the two can be compared.

## What to read

With `V=/private/tmp/claude-501/-Users-joe-Library-CloudStorage-OneDrive-TheUniversityofNottingham--Joe-Bell-UoN-Files-2-Projects-2026-08-24-UoN-Video-Helper/27e7f48d-1fd3-4e4c-8d41-20d6c1cb6ab2/scratchpad/vh199`:
- **The part:** `PART=$V/runs/run-11-part-2026-10-27T09-12-14-585Z-f0fb63`. It holds `manifest.json`, `digest.md`, `run.json`, one `<scenario>__<lang>__<view>__<mode>.json` per record, `captures/`, `artifacts.json`, `artifacts.jsonl`, `fixtures.jsonl`, and `superseded/` (failed attempts moved aside by any resume, suffixed `~aN`).
- **The logs:** `$V/logs/run-11-part.log` (the walker's output for the walk and any resume) and `$V/logs/run-11-part-resume.log` (the helper's lines). Per-group walk logs are under `$V/out/run-11-part-2026-10-27T09-12-14-585Z-f0fb63/<group>/log.txt`.
- **The frozen walker,** for attribution: `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/` in this repo (`scenarios.mjs`, `faults.mjs`, `qualify.mjs`, `matrix.mjs`, `runner.mjs`, `phase8.mjs`, `parts.mjs`), with the player proof `reviews/2026-10-25/design-pass-3/evidence/measurements/player-proof-2026-10-25.json`. The app is `src/` and `index.html`. The acceptance criteria are `project/items/VH-199.md`. Earlier runs are in `$V/runs/` for comparison.

## What the run should be

- **Why run-11 is a part.** Run-11 holds two S-133 records (zh-Hans w320 and ms-MY w320, light). S-133's setup reloads the page after an unsaved result; the app's designed "Leave site?" dialog then blocks the frozen walker's `goto`, which has no dialog handler, and the run stalls. The orchestrator ruled that run-11 is walked as a part from the start without S-133, with the walker's own subset mode: `node matrix.mjs run-11 S-06b S-09 S-10 S-18 S-20 S-25a S-25b S-26a S-27 S-29 S-32 S-35 S-38 S-39 S-ID2 S-44 S-73 S-87 S-118 S-132 S-138 S-151` (22 ids), with no walker change.
- **The reconcile rule.** Each of run-11's declared records (`parts.mjs` `RUNS`, run-11) counts once: from the part, or as held. S-133's records stay not walked, held as a named instrument gap the owner has accepted (6 records across run-09 and run-11).
- **The part:** instrument revision `2e7b0c044ce11f2b`; source commit `a3039c3`; Chrome 156.0.8078.48. Walked from 09:12:14Z to 09:44:48Z on 2026-10-27 by a helper that resumes in place until whole. On AC throughout. The machine's 1-min load ran about 12–42 (OneDrive, not the walker). The Mac's AC power mode moved from normal to High Power at some point during the walk; Low Power stayed off.
- **Known pattern, not a fault — grouping-type scenarios.** The frozen walker sets a page up once per group; the first record of a group is ok and later modes on the same page can fail their state predicate, each resume recovering one record per group. Earlier runs had S-92, S-95, S-96, S-107, S-117, S-120, S-128, S-143, S-149, S-150.
- **Known instrument gaps, accepted by the owner:** the `fallback` × Fetch-routed fault interaction (run-04's S-107, run-06's S-55c: the `fonts` route of `withholdFonts`, `qualify.mjs:1017`, is first in the router of `faults.mjs:19` and its `match` is always true); the check counter (`STATUS_SINCE`, `scenarios.mjs:1521`, cannot count an identical status text), which fails S-92's and S-93's check-count asserts; S-133's missing `beforeunload` handling (6 records held across run-09 and run-11).
- **A known instrument class:** the finish+1s player row "paused a second after the card appeared" reading `player: false` when the scenario's next step has detached the player (`phase8.mjs:77`; S-88, S-109, S-128, S-138), which VH-200 counts as unverified.
- **Expected results that VH-200 judges, not faults:** the 32 px focus ring at the font32 mode; S-149 light's subresults (V-46); S-127's volume ring at 320 px "cannot determine"; transition rings not read where the successor is the reader or the dialog; the player rows of S-88 and S-128; S-59's "focus on the card"; S-132's and S-152's player rows (F15b's intended state); the native scrubber's target rows (WCAG 2.5.5's user-agent exception); S-113's font32 sideways scroll; S-140n's focus row "cannot determine: no element"; S-21's disabled-control focus target "cannot determine"; the native overflow button's 2.4.13 rows (2.4.13's user-agent exception, per the player proof); the declared "cannot determine" person checks; S-102's sub-400 ms sound reaching the loudness refusal (the existing wish line VH-185.1).

## What to answer

1. **Whole?** Count the part's declared records (its `run.json`, and the frozen plan, `parts.mjs` `RUNS` filtered to the 22 ids), the records written, ok and failed. Is any record off the revision, or ok while missing a subject its own `expects` declares?
2. **The reconcile.** Using the part and `parts.mjs` `RUNS`' run-11, does each declared record count exactly once under the rule above? Name the records held. Is any record missing, double-counted, or counted from a failed attempt?
3. **Attribute** every record that is not ok, every record in `superseded/`, and every failed or "cannot determine" assert or measurement on an ok record (look inside each record's `instruments`, not only `digest.md`), and anything notable in the logs: an app finding (for VH-200), an instrument fault, or a known gap / known pattern as above. One line each, or one line per group where they share a cause. Say what evidence you read.
4. **Stop?** Name anything that should stop the evidence run: an instrument fault that makes records untrustworthy, a coverage reduction beyond the ruled hold, or an app rank 1 problem (a WCAG 2.2 AAA failure that blocks a task, data loss, media egress, or a crash).
5. **Verdict:** one line, "Fit", "Fit with a named gap" (name it) or "Not fit", for run-11 (the part with S-133's 2 held, under the rule) as evidence for VH-199.

Keep the answer under 600 words.
