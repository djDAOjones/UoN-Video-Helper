<!-- markdownlint-disable -->
<!-- VH-199: the brief VH-199's worker gave Codex astra for run-07, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-07 — Codex astra's read-only check (brief from VH-199 #5, 2026-10-27)

You are checking one run of UoN Video Helper's Phase 8, pass 3 evidence matrix (VH-199), read-only. Write nothing anywhere; answer in your final message only. Claude has its own reading of this run; it is not given to you, so that the two can be compared.

## What to read

- The run: `RUN=/private/tmp/claude-501/-Users-joe-Library-CloudStorage-OneDrive-TheUniversityofNottingham--Joe-Bell-UoN-Files-2-Projects-2026-08-24-UoN-Video-Helper/27e7f48d-1fd3-4e4c-8d41-20d6c1cb6ab2/scratchpad/vh199/runs/run-07-2026-10-27T01-23-38-939Z-41d41a`. It holds `manifest.json`, `digest.md`, `run.json`, one `<scenario>__<lang>__<view>__<mode>.json` per record, `captures/`, and `superseded/` (failed attempts moved aside by each resume, suffixed `~aN`).
- Its logs: `$V/logs/run-07.log` (the walker's output for the walk and every resume) and `$V/logs/run-07-resume.log` (the resume helper's lines), with `V=/private/tmp/claude-501/-Users-joe-Library-CloudStorage-OneDrive-TheUniversityofNottingham--Joe-Bell-UoN-Files-2-Projects-2026-08-24-UoN-Video-Helper/27e7f48d-1fd3-4e4c-8d41-20d6c1cb6ab2/scratchpad/vh199`. Per-group walk logs are under `$V/out/run-07-2026-10-27T01-23-38-939Z-41d41a/<group>/log.txt`.
- The frozen walker, for attribution: `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/` in this repo (`scenarios.mjs`, `faults.mjs`, `qualify.mjs`, `matrix.mjs`, `runner.mjs`, `phase8.mjs`), with the player proof `reviews/2026-10-25/design-pass-3/evidence/measurements/player-proof-2026-10-25.json`. The app is `src/` and `index.html`. The acceptance criteria are `project/items/VH-199.md`.

## What the run should be

- 355 records declared; instrument revision `2e7b0c044ce11f2b`; source commit `a3039c3`; Chrome 156.0.8078.48; no visible-page flag missing. Walked from 01:23Z on 2026-10-27 and stopped by hand after 2 records (01:25Z, exit 143), then resumed in place six times (01:36Z to 02:48Z) until whole. On AC throughout.
- **Known pattern, not a fault — grouping-type scenarios.** The frozen walker sets a page up once per group; the first record of a group is ok and later modes on the same page can fail their state predicate, each resume recovering one record per group. Earlier runs had S-92, S-95, S-107, S-128, S-143, S-149.
- **Known instrument gaps in earlier runs, accepted or held for the owner:** the `fallback` × Fetch-routed fault interaction (run-04's S-107, run-06's S-55c: the `fonts` route of `withholdFonts`, `qualify.mjs:1017`, is first in the router of `faults.mjs:19` and its `match` is always true); the check counter (`STATUS_SINCE`, `scenarios.mjs:1521`, cannot count an identical status text), which fails S-92's "one check after the keys settle" and S-93's "exactly one check after the last press".
- **Expected results that VH-200 judges, not faults:** the 32 px focus ring at the font32 mode; S-149 light's subresults (V-46); S-127's volume ring at 320 px "cannot determine"; transition rings not read where the successor is the reader or the dialog; the player rows of S-88 and S-128; S-59's "focus on the card"; S-132's player rows (F15b's intended state); the native scrubber's target rows (WCAG 2.5.5's user-agent exception); S-113's font32 sideways scroll; S-140n's focus row "cannot determine: no element"; the declared "cannot determine" person checks.

## What to answer

1. **Whole?** Do the counts, keys (`expectedKeysSha256` = `observedKeysSha256`), revision and source say this run is whole? If not, which records keep it from being whole, and is any record off the revision, missing, or ok while missing a subject its own `expects` declares?
2. **Attribute** every record that is not ok, every record in `superseded/`, and every failed assert or measurement on an ok record (look inside each record's `instruments`, not only `digest.md`): an app finding (for VH-200), an instrument fault, or a known gap / known pattern as above. One line each, or one line per group where they share a cause. Say what evidence you read.
3. **Stop?** Name anything that should stop the evidence run: an instrument fault that makes records untrustworthy, a coverage reduction, or an app rank 1 problem (a WCAG 2.2 AAA failure that blocks a task, data loss, media egress, or a crash).
4. **Verdict:** one line, "Fit", "Fit with a named gap" (name it) or "Not fit", for run-07 as evidence for VH-199.

Keep the answer under 600 words.
