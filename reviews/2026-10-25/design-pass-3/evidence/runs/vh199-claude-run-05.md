<!-- markdownlint-disable -->
<!-- VH-199: Claude's own reading of run-05, saved before Codex's, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-05 — Claude's reading (VH-199 #4, Opus 5.5)

**Provenance.** This is the reading I formed from the records at 00:07–00:15Z on 2026-10-27, before Codex astra was briefed. It was written into hand-over 8's run-05 progress line at that time, and is set out here unrevised. Codex's answer (`vh199-codex-run-05.md`) came later. The comparison is in `vh199-compare-run-05.md`.

Run: `$V/runs/run-05-2026-10-26T20-47-32-904Z-541edc`.

## Whole

Yes. `check-run.mjs`: expected 383 = observed 383, `whole: true`, `problems: []`, keys `fd518996af140300` (expected = observed). 383 records, all `status: ok`, all at revision `2e7b0c044ce11f2b`. Source `a3039c3`, Chrome 156.0.8078.48, no visible-page flag missing.

The walk stopped at 123 records (104 ok, 19 failed) when the Mac left AC. Four records written on battery are kept (hand-over 8 names them). Five resumes followed on AC: +266, +4, +4, +4, +1.

## Attribution

- **47 records in `superseded/`, covering 19 S-92 keys:** the known grouping pattern. In each group the first record is ok. Later modes fail the state predicate, focus on `#trim-end-range`. Each resume recovered one record per group, over four groups (en-GB w1280, en-GB w320, ms-MY w1280, zh-Hans w1280).
- **S-92 "one check after the keys settle":** fails on all 31 records, with `checksAfterLast` 0. The other four asserts pass. The settled verdict arrives (`M.proceed()`), so no user is left without one: not an app rank 1 problem. `STATUS_SINCE` counts `status.checking` entries after the walker's `lastPress`, which is taken after `handleKeys` returns, so the check may have run before the mark. **Attribution unresolved; I leaned to the instrument side.**
- **S-132's player row "an object URL whose metadata loads":** fails with "no focusable control under the host in the tree" in 4 light records (en-GB w1280 and w320, ms-MY and zh-Hans w1280). **I read it as a new app finding for VH-200,** beside S-88's and S-128's player rows.
- **S-113 at font32 scrolls sideways** at w320 and w401 in all three languages (to 444–528 px: the language and video-kind radios, the closing-colour "White", the trim Set buttons). **An app finding for VH-200.**
- **The 32 px ring at font32:** S-110 `#preset-choice input:checked`, 284 of 304 px², in all three languages; S-113 ms-MY w320 `#onset-help-button`, 460 of 464. **Expected**, the known class (S-15, S-24).

## Stop?

Nothing. No app rank 1 problem, no coverage reduction, no instrument fault I could establish.

## Verdict

**Fit**, with S-92's check-count assert left unattributed.
