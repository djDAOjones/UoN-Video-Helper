<!-- markdownlint-disable -->
<!-- VH-199: the brief VH-199's worker gave Codex astra for run-06, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-06 — Codex astra's read-only check (brief from VH-199 #4, 2026-10-27)

You are checking one run of UoN Video Helper's Phase 8, pass 3 evidence matrix (VH-199), read-only. Write nothing anywhere; answer in your final message only. Claude has its own reading of this run; it is not given to you, so that the two can be compared.

## What to read

- The run: `RUN=/private/tmp/claude-501/-Users-joe-Library-CloudStorage-OneDrive-TheUniversityofNottingham--Joe-Bell-UoN-Files-2-Projects-2026-08-24-UoN-Video-Helper/27e7f48d-1fd3-4e4c-8d41-20d6c1cb6ab2/scratchpad/vh199/runs/run-06-2026-10-27T00-08-59-773Z-753cf3`. It holds `manifest.json`, `digest.md`, `run.json`, one `<scenario>__<lang>__<view>__<mode>.json` per record, and `superseded/` (failed attempts moved aside by each resume, suffixed `~aN`).
- Its logs: `$V/logs/run-06.log` (the walker's output for the walk and every resume) and `$V/logs/run-06-resume.log` (the resume helper's lines), with `V=/private/tmp/claude-501/-Users-joe-Library-CloudStorage-OneDrive-TheUniversityofNottingham--Joe-Bell-UoN-Files-2-Projects-2026-08-24-UoN-Video-Helper/27e7f48d-1fd3-4e4c-8d41-20d6c1cb6ab2/scratchpad/vh199`. Per-group walk logs are under `$V/out/run-06-2026-10-27T00-08-59-773Z-753cf3/<group>/log.txt`.
- The frozen walker, for attribution: `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/` in this repo (`scenarios.mjs`, `faults.mjs`, `qualify.mjs`, `matrix.mjs`, `runner.mjs`, `phase8.mjs`). The app is `src/` and `index.html`. The acceptance criteria are `project/items/VH-199.md`.

## What the run should be

- 338 records declared; instrument revision `2e7b0c044ce11f2b`; source commit `a3039c3`; Chrome 156.0.8078.48; no visible-page flag missing. Walked 00:09–01:08Z on 2026-10-27, then resumed in place six times until a resume recovered nothing (01:20Z). On AC throughout.
- **Known pattern, not a fault — grouping-type scenarios.** The frozen walker sets a page up once per group; the first record of a group is ok and later modes on the same page can fail their state predicate, each resume recovering one record per group. Earlier runs had S-92, S-107, S-128, S-143, S-149.
- **Known instrument gaps in earlier runs, accepted or held for the owner:** run-04's S-107 fallback records, a `fallback` × Fetch-routed fault interaction (the `fonts` route of `withholdFonts`, `qualify.mjs:1017`, is first in the router of `faults.mjs:19` and its `match` is always true); run-05's S-92 check counter (`STATUS_SINCE`, `scenarios.mjs:1521`, cannot count an identical status text).
- **Expected results that VH-200 judges, not faults:** the 32 px focus ring at the font32 mode; S-149 light's subresults (V-46); S-127's volume ring at 320 px "cannot determine"; transition rings not read where the successor is the reader or the dialog; the player rows of S-88 and S-128; S-59's "focus on the card"; the declared "cannot determine" person checks.

## What to answer

1. **Whole?** Do the counts, keys (`expectedKeysSha256` = `observedKeysSha256`), revision and source say this run is whole? If not, which records keep it from being whole, and is any record off the revision, missing, or ok while missing a subject its own `expects` declares?
2. **Attribute** every record that is not ok, every record in `superseded/`, and every failed assert or measurement on an ok record: an app finding (for VH-200), an instrument fault, or a known gap / known pattern as above. One line each, or one line per group where they share a cause. Say what evidence you read.
3. **Stop?** Name anything that should stop the evidence run: an instrument fault that makes records untrustworthy, a coverage reduction, or an app rank 1 problem (a WCAG 2.2 AAA failure that blocks a task, data loss, media egress, or a crash).
4. **Verdict:** one line, "Fit", "Fit with a named gap" (name it) or "Not fit", for run-06 as evidence for VH-199.

Keep the answer under 600 words.
