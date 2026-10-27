<!-- markdownlint-disable -->
<!-- VH-199: the comparison of Claude's and Codex astra's readings of run-08, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-08 — Claude and Codex astra compared (VH-199 #5)

Claude: `vh199-claude-run-08.md`, written before Codex was briefed. Codex astra: `vh199-codex-run-08.md`, session `01a17bb1-d82b-7701-8a47-94b218aa6887`, 04:50–04:55Z. It was deferred from 03:49Z because the 1-min load stayed over 20 for 40 min, and it ran after run-09 was stopped.

## Agreed

- **Whole:** 367/367 ok, keys `b19da56e9fbbd144` both ways, every record (superseded included) at `2e7b0c044ce11f2b`, source `a3039c3`, Chrome 156.0.8078.48, no flag missing.
- **S-117's 47 attempts over 19 keys** are the grouping pattern: focus blurred to `body`, all recovered.
- **S-108's font32 ring,** 284 of 304 px² in three languages, is the expected 32 px class for VH-200.
- **S-145's `#contact-creators` ring in both forced palettes,** 1,108 of 1,264 and 1,595 of 1,968 px², is an app finding for VH-200 under 2.4.13. Codex reproduced the pixel counts from the captures and found the missing bottom-outline pixels. It is the same finding as run-07's S-83.
- **S-88 (5) and S-138 (3), "paused a second after the card appeared"** (`player: false`): neither playback nor an app failure.
- **The 161 native-scrubber target rows** are expected, under the 2.5.5 user-agent exception.
- No stop, no coverage reduction, no instrument fault, no app rank 1 problem.

## Codex only

- **S-138's mechanism:** the one-second callback runs while the discard question briefly replaces the finished card. Mutation histories show the removal and the restoration, and the later presence, metadata and no-autoplay rows pass. Claude has not re-checked this, but it is consistent with S-138's en-GB w1280 record passing the row.
- **S-138's four completion-announcement comparisons** after the language change are "cannot determine", as declared.
- **S-75's uncaught errors** in the log are F8's deliberate injections.
- **176 failed rows in all:** 161 + 3 + 4 + 5 + 3. All 2,423 capture hashes and sizes verify.

## Claude only

- S-117 is named as a new grouping-type scenario, and S-24, the canary, is ok here (ms-MY w1280 light) with the load at 28–108.

## Disagreed

- **The verdict's wording:** Claude said "Fit" and Codex "Fit with a named gap (the delayed finish+1s player-pause observation in S-88 and S-138)". **Settled as Codex's wording.**
  - The rows are already in the expected class (S-88's and S-128's player rows), so this is not a new escalation.
  - Codex's point is right: these rows establish neither an autoplay pass nor an app failure, and VH-200 must count them as neither.
  - S-109's 13 rows in run-09 belong to the same class.

**Run-08's verdict: fit, with the finish+1s player-pause observation named as a gap (the existing S-88 class). S-145 repeats run-07's new VH-200 finding.**
