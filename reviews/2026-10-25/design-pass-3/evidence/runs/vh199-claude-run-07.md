<!-- markdownlint-disable -->
<!-- VH-199: Claude's own reading of run-07, saved before Codex's, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-07 — Claude's reading (VH-199 #5, Opus 5.5)

Formed from the records at 02:48–03:00Z on 2026-10-27, before Codex astra was briefed on run-07.

Run: `$V/runs/run-07-2026-10-27T01-23-38-939Z-41d41a`.

## Whole

**Yes: 355/355, whole.** `check-run.mjs` reads:
- expected 355, observed 355, keys `514a0f59c9a0833f` (expected = observed);
- `whole: true`, `problems: []`;
- 355 `ok`, all at revision `2e7b0c044ce11f2b`;
- source `a3039c3`, Chrome 156.0.8078.48, no visible-page flag missing.

Walked from 01:23:38Z (VH-199 #4: 2 records, stopped by hand at 01:25:38Z). Resume 1, 01:36–02:43:02Z, added +325. Resumes 2–6, 02:43–02:48:40Z, added +9, +7, +7, +4 and +1, and the last made it whole. Every start and resume was on AC with Low Power off. The 1-min load was 21.5 at resume 1, 3.1–13.0 over resumes 2–6, and 6.0 at the end. None of it was ours.

## Attribution

- **65 attempts in `superseded/` over 28 keys**, all now ok. Both scenarios are new grouping-type scenarios. The first record of each group is ok and the later modes fail the state predicate; the resumes recover them one per group.
  - **S-96**, "Onset help closed by Shift+Tab": 47 attempts over 19 keys. The later modes fail `!M.vis('#onset-help') && focus on #closing-onset`. This is S-95's mechanism: `matrix.mjs` blurs focus after each measurement.
  - **S-150**, "A job made with focus on Announce progress": 18 attempts over 9 keys. Dark and both forced modes in three languages fail `M.finished() && focus on the finished card && player present`. Light, each group's first record, is ok.
- **S-93's "exactly one check after the last press"** fails on all 4 S-93 records (en-GB w1280 and w320, ms-MY w1280, zh-Hans w1280). The other asserts pass. This is the named check-count gap, an instrument gap (`STATUS_SINCE`, `scenarios.mjs:1521`). The plan holds 4 S-93 records in run-07 and 2 in run-10, not 5 and 3 as hand-over 9 said.
- **S-83's `#contact-creators` 2.4.13 ring in both forced palettes, only where the link wraps to two lines:**
  - en-GB w320 forced-dark and forced-light: 1,108 of 1,264 px² at 3:1.
  - ms-MY w1280 forced-dark and forced-light: 1,595 of 1,968 px².

  The same wrapped link passes in dark, spacing and zoom (1,328 of 1,264; 2,032 of 1,968). Single-line, it passes in forced (1,664 of 1,602; 2,016 of 1,952).

  The capture (`captures/S-83__en-GB__w320__forced-dark__focus-2-contact-creators-on.png`) shows a whole ring whose lower edge runs over the next link's text, "Students: get help through Self…". In forced colours that text's colour is not 3:1 from the ring's. **This is new: a candidate app finding for VH-200** (2.4.13 AAA, forced colours, a Phase 8 footer element). It is not rank 1: the ring is visible, best ratio 9.1, and nothing is blocked. It is not an instrument fault: the ring's pixels are read the same way as everywhere else, and every other footer row passes.
- **158 native-scrubber target rows** (`slider "video time scrubber"`, 161 × 24 px hit run): S-127 78, S-114 31, S-55a 25, S-150 12, S-54d 8, S-72a 3, S-153 1. Every row carries `uaException`. They are expected, under WCAG 2.5.5's user-agent exception.
- **39 S-127 rows of 2.4.13 on `button "show more media controls"`**, the native overflow button, where `exceptions.userAgentOnly.holds` is true ("no author selector reaches ::-internal-media-controls-overflow-button"). This is the player proof's known class (`player-proof-2026-10-25.json`: 2.4.13's first exception; the ring cannot be isolated). It is expected, and the first run to walk S-127.
- **No other failing measurement** on any ok record. No record is ok while missing a subject it expects; the manifest's `whole: true` checks that.

## Stop?

Nothing should stop the evidence run: no coverage reduction, no instrument fault, no app rank 1 problem, no walker change, and HEAD and the tree did not move.

## Verdict

**Fit as evidence for VH-199.** S-93's check-count assert is the named gap already held for the owner. S-83's forced-colour footer ring goes to VH-200 as a new candidate finding.
