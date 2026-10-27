<!-- markdownlint-disable -->
<!-- VH-199: the brief VH-199's worker gave Codex astra for run-05, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-05 — Codex astra's read-only check (brief from VH-199 #4, 2026-10-27)

You are checking one run of UoN Video Helper's Phase 8, pass 3 evidence matrix (VH-199), read-only. Write nothing anywhere; answer in your final message only.

## What to read

- The run: `RUN=/private/tmp/claude-501/-Users-joe-Library-CloudStorage-OneDrive-TheUniversityofNottingham--Joe-Bell-UoN-Files-2-Projects-2026-08-24-UoN-Video-Helper/27e7f48d-1fd3-4e4c-8d41-20d6c1cb6ab2/scratchpad/vh199/runs/run-05-2026-10-26T20-47-32-904Z-541edc`. It holds `manifest.json`, `digest.md`, `run.json`, one `<scenario>__<lang>__<view>__<mode>.json` per record, and `superseded/` (failed attempts moved aside by each resume, suffixed `~aN`).
- Its logs: `$V/logs/run-05.log` (the walker's output for the walk and every resume) and `$V/logs/run-05-resume.log` (the resume helper's lines), with `V=/private/tmp/claude-501/-Users-joe-Library-CloudStorage-OneDrive-TheUniversityofNottingham--Joe-Bell-UoN-Files-2-Projects-2026-08-24-UoN-Video-Helper/27e7f48d-1fd3-4e4c-8d41-20d6c1cb6ab2/scratchpad/vh199`.
- The frozen walker, for attribution: `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/` in this repo (`scenarios.mjs`, `matrix.mjs`, `runner.mjs`, `parts.mjs`). The app is `src/` and `index.html`. The acceptance criteria are `project/items/VH-199.md`.

## What the run should be

- 383 records expected, all `status: ok`, `whole: true`, `problems: []`; instrument revision `2e7b0c044ce11f2b`; source commit `a3039c3`; Chrome 156.0.8078.48; no visible-page flag missing.
- Walked 20:47–21:00Z on 2026-10-26, stopped at 123 records when the Mac left AC power (four records written on battery at 21:00 are kept: S-121 zh-Hans w1280 forced-light, forced-dark, font32, and S-121 zh-Hans w375 light). Resumed in place five times, 23:24Z–00:07Z, on AC.
- **Known pattern, not a fault — grouping-type scenarios.** The frozen walker sets a page up once per group; the first record of a group is ok and later modes on the same page can fail their state predicate, each resume recovering one record per group. In run-05 that is S-92 (focus on `#trim-end-range`). Earlier runs had S-107, S-128, S-143, S-149.
- **Known gap elsewhere (not in this run):** S-107's fallback records in run-04, a `fallback` × Fetch-routed fault interaction in the instruments, accepted by the owner.
- **Expected results that VH-200 judges, not faults:** the 32 px focus ring at the font32 mode (284 of 304 px² and similar); S-149 light's subresults (V-46); S-127's volume ring at 320 px "cannot determine"; transition rings not read where the successor is the reader or the dialog; the player rows of S-88 and S-128; S-59's "focus on the card".

## What I found (check it, don't take it)

Measurement fails on ok records, from `digest.md`: S-92 "one check after the keys settle" on all 31 records (`checksAfterLast` 0); S-132's player row "an object URL whose metadata loads" in 4 light records; S-113 at font32 scrolling sideways at w320 and w401; the 32 px ring on S-110 font32 and S-113 ms-MY w320 font32.

## What to answer

1. **Whole?** Do the counts, keys (`expectedKeysSha256` = `observedKeysSha256`), revision and source say this run is whole? Is any record off the revision, missing, or ok while missing a subject its own `expects` declares?
2. **Attribute** every record in `superseded/` and every failed assert or measurement line in `digest.md`: an app finding (for VH-200), an instrument fault, or a known gap / known pattern as above. One line each, or one line per group where they share a cause. Say what evidence you read.
3. **Stop?** Name anything that should stop the evidence run: an instrument fault that makes records untrustworthy, a coverage reduction, or an app rank 1 problem (a WCAG 2.2 AAA failure that blocks a task, data loss, media egress, or a crash).
4. **Verdict:** one line, "Fit" or "Not fit", for run-05 as evidence for VH-199.

Keep the answer under 600 words.
