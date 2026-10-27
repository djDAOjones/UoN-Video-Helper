<!-- markdownlint-disable -->
<!-- VH-199: Claude's own reading of run-08, saved before Codex's, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-08 — Claude's reading (VH-199 #5, Opus 5.5)

Formed from the records at 03:48–04:00Z on 2026-10-27, before Codex astra was briefed on run-08.

Run: `$V/runs/run-08-2026-10-27T02-49-02-205Z-c2d97d`.

## Whole

**Yes: 367/367, whole.** `check-run.mjs` reads:
- expected 367, observed 367, keys `b19da56e9fbbd144` (expected = observed);
- `whole: true`, `problems: []`;
- 367 `ok`, all at revision `2e7b0c044ce11f2b`;
- source `a3039c3`, Chrome 156.0.8078.48, no visible-page flag missing.

Walked 02:49:02–03:41:12Z with 348 ok. Five resumes, 03:41–03:48:06Z, added +6, +4, +4, +4 and +1, and the last made it whole. Every start and resume was on AC with Low Power off. The 1-min load was 6.1 at the start. It rose to 28.5 by 03:30Z, was 108.5 at resume 1 and 57–80 over resumes 2–5, and 52.2 at the end. It was OneDrive and `fileproviderd`, none of it ours. **S-24, the canary,** has one record here (ms-MY w1280 light), and it is ok.

## Attribution

- **47 attempts in `superseded/` over 19 keys, all S-117,** "Create's label through a page-language change". This is a new grouping-type scenario, all recovered. The first record of each group is ok. The later modes fail `M.finished() && Create reads create.again && focus on Create`, because `matrix.mjs` blurs focus after each measurement.
- **S-145's `#contact-creators` 2.4.13 ring in both forced palettes where the link wraps:** en-GB w320, 1,108 of 1,264 px²; ms-MY w1280, 1,595 of 1,968. These are the same element and figures as run-07's S-83: the ring's lower edge runs over the next link's text. **An app finding for VH-200, not rank 1.**
- **S-108's `#preset-choice input:checked` at font32,** in all three languages: 284 of 304 px². This is the expected 32 px ring, the class of S-15 and S-110.
- **S-88 (5 records) and S-138 (3 records): the player row "paused a second after the card appeared"** finds no player at finish+1s (`player: false`). S-88's rows are expected for VH-200. S-138, "Both warnings on a retained result", **joins that class.** Its en-GB w1280 record passes the row, and its own assert passes on all four records.
- **161 native-scrubber target rows** (161 × 24 px hit run) over S-126, S-117, S-129, S-63, S-63-W, S-67, S-138, S-151, S-65 and S-101. Every row carries `uaException`. They are expected, under 2.5.5's user-agent exception.
- **No other failing measurement or assert** on any ok record. `whole: true` checks that no record is ok while missing a subject it expects.

## Stop?

Nothing should stop the evidence run: no coverage reduction, no instrument fault, no app rank 1 problem, no walker change, and HEAD and the tree did not move. The high load was outside the run, and S-24 is ok.

## Verdict

**Fit as evidence for VH-199.** S-145's forced-colour footer ring repeats run-07's new VH-200 finding.
