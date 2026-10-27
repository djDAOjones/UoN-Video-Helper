<!-- markdownlint-disable -->
<!-- VH-199: the brief VH-199's worker gave Codex astra for run-09, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-09 — Codex astra's read-only check (brief from VH-199 #5, 2026-10-27)

You are checking one run of UoN Video Helper's Phase 8, pass 3 evidence matrix (VH-199), read-only. Write nothing anywhere; answer in your final message only. Claude has its own reading of this run; it is not given to you, so that the two can be compared.

## What to read

- The run: `RUN=/private/tmp/claude-501/-Users-joe-Library-CloudStorage-OneDrive-TheUniversityofNottingham--Joe-Bell-UoN-Files-2-Projects-2026-08-24-UoN-Video-Helper/27e7f48d-1fd3-4e4c-8d41-20d6c1cb6ab2/scratchpad/vh199/runs/run-09-2026-10-27T03-48-28-340Z-6d6b18`. It holds `manifest.json`, `digest.md`, `run.json`, one `<scenario>__<lang>__<view>__<mode>.json` per record, `captures/`, and `superseded/` (failed attempts moved aside by each resume, suffixed `~aN`).
- Its logs: `$V/logs/run-09.log` (the walker's output for the walk and every resume) and `$V/logs/run-09-resume.log` (the resume helper's lines), with `V=/private/tmp/claude-501/-Users-joe-Library-CloudStorage-OneDrive-TheUniversityofNottingham--Joe-Bell-UoN-Files-2-Projects-2026-08-24-UoN-Video-Helper/27e7f48d-1fd3-4e4c-8d41-20d6c1cb6ab2/scratchpad/vh199`. Per-group walk logs are under `$V/out/run-09-2026-10-27T03-48-28-340Z-6d6b18/<group>/log.txt`.
- A read-only probe of S-133's setup (en-GB w1280), run on the frozen walker's own modules after the second stop: `/Users/joe/Library/Application Support/Claude/side-session-notes/local_3b5f75f9-b67b-4cc0-9f56-35d3c4d6d28a/vh199-5-probe-s133.mjs`, with its output in `vh199-5-probe-s133.out.txt` beside it. It records each JavaScript dialog the page raises and accepts any after 20 s so that it can end.
- The frozen walker, for attribution: `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/` in this repo (`scenarios.mjs`, `faults.mjs`, `qualify.mjs`, `matrix.mjs`, `runner.mjs`, `phase8.mjs`), with the player proof `reviews/2026-10-25/design-pass-3/evidence/measurements/player-proof-2026-10-25.json`. The app is `src/` and `index.html`. The acceptance criteria are `project/items/VH-199.md`.

## What the run should be

- 330 records declared; instrument revision `2e7b0c044ce11f2b`; source commit `a3039c3`; Chrome 156.0.8078.48. Walked from 03:48Z on 2026-10-27. At 04:13Z records stopped arriving; after 15 minutes with no new record the walker was stopped by hand (04:29Z, exit 143) and Chrome restarted on a fresh profile. Resume 1 started at 04:29Z; at 04:30Z records stopped arriving again, and it was stopped by hand at 04:45Z (exit 143). The run is held there, not whole, so it has no `manifest.json` (the walker writes it at a run's end); read the records, `run.json`, `artifacts.jsonl`, `fixtures.jsonl` and the logs instead. On AC throughout; the machine's 1-min load ran 32–47 (OneDrive, not the walker).
- **Known pattern, not a fault — grouping-type scenarios.** The frozen walker sets a page up once per group; the first record of a group is ok and later modes on the same page can fail their state predicate, each resume recovering one record per group. Earlier runs had S-92, S-95, S-96, S-107, S-128, S-143, S-149, S-150.
- **Known instrument gaps in earlier runs, accepted or held for the owner:** the `fallback` × Fetch-routed fault interaction (run-04's S-107, run-06's S-55c: the `fonts` route of `withholdFonts`, `qualify.mjs:1017`, is first in the router of `faults.mjs:19` and its `match` is always true); the check counter (`STATUS_SINCE`, `scenarios.mjs:1521`, cannot count an identical status text), which fails S-92's "one check after the keys settle" and S-93's "exactly one check after the last press".
- **Expected results that VH-200 judges, not faults:** the 32 px focus ring at the font32 mode; S-149 light's subresults (V-46); S-127's volume ring at 320 px "cannot determine"; transition rings not read where the successor is the reader or the dialog; the player rows of S-88 and S-128; S-59's "focus on the card"; S-132's player rows (F15b's intended state); the native scrubber's target rows (WCAG 2.5.5's user-agent exception); S-113's font32 sideways scroll; S-140n's focus row "cannot determine: no element"; the native overflow button's 2.4.13 rows (2.4.13's user-agent exception, per the player proof); the declared "cannot determine" person checks.

## What to answer

1. **Whole?** Count the declared records (`run.json` and the frozen plan, `parts.mjs` `RUNS`), the records written, ok and failed, and those not yet walked. Is any written record off the revision, or ok while missing a subject its own `expects` declares?
2. **The stalls.** Why did the walk and resume 1 stop producing records, both times? Name the record and step, and the cause, from the logs, the per-group walk logs and the walker's source. Is it the machine, the app, or the instrument? What would let the run be whole?
3. **Attribute** every record that is not ok, every record in `superseded/`, and every failed assert or measurement on an ok record (look inside each record's `instruments`, not only `digest.md`): an app finding (for VH-200), an instrument fault, or a known gap / known pattern as above. One line each, or one line per group where they share a cause. Say what evidence you read.
4. **Stop?** Name anything that should stop the evidence run: an instrument fault that makes records untrustworthy, a coverage reduction, or an app rank 1 problem (a WCAG 2.2 AAA failure that blocks a task, data loss, media egress, or a crash).
5. **Verdict:** one line, "Fit", "Fit with a named gap" (name it) or "Not fit", for run-09 as evidence for VH-199.

Keep the answer under 600 words.
