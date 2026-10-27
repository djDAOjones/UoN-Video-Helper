<!-- markdownlint-disable -->
<!-- VH-199: the comparison of Claude's and Codex astra's readings of run-05, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-05 — Claude and Codex astra compared (VH-199 #4)

Claude: `vh199-claude-run-05.md` (formed before Codex was briefed). Codex astra: `vh199-codex-run-05.md` (session `01a17acc-c739-7a40-9bbe-91303c994cfa`).

## Agreed

- Whole: 383/383 ok, keys `fd518996af140300`, revision `2e7b0c044ce11f2b`, source `a3039c3`, Chrome 156.0.8078.48, no flag missing.
- The 47 superseded records over 19 S-92 keys are the grouping pattern: focus not on `#trim-end-range`, recovered one per group per resume.
- S-113's font32 overflow at w320 and w401 in all three languages is an app finding for VH-200.
- The S-110 and S-113 font32 rings (284/304, 460/464) are expected 2.4.13 area measurements, not instrument faults.
- No app rank 1 problem, no coverage reduction.

## Codex only

- Read the S-92 mutation captures: all 31 show "Checking", then a settled verdict.
- Reproduced the false zero with an in-memory probe of the frozen observer.
- Checked the four kept battery records' timestamps.

## Claude only

- None of substance. My "no user left without a verdict" point for S-92 is consistent with Codex's captures.

## Disagreed, and settled

1. **S-92 "one check after the keys settle": an instrument fault (Codex), not left unresolved (Claude).** Settled for Codex, on the source.
   - `phase8.mjs:85` pushes a status entry only when the text changes.
   - `src/main.ts:1534` sets "Checking" on the first press, before the walker's `lastPress` mark, and `:1904–1912` sets the same text again for the delayed recheck.
   - So no entry follows the mark, and the counter cannot count the recheck.
   - My timing reading named the right side, the instrument, but not the cause.
2. **Run-05's verdict: "Not fit" (Codex), "Fit" (Claude).** Held for Orchestrator #8 and the owner. The records are whole and every other reading stands, but one declared assert cannot establish its claim. I recommended run-04's pattern: keep the run, and name the S-92 and S-93 check-count assert a gap for VH-203's after-run once the walker is fixed. Messaged at 00:5xZ.
3. **S-132's player rows: the expected F15b fault injection (Codex), not a new app finding (Claude).** Settled for Codex, on the source.
   - S-132 is "A failed playback".
   - F15b (`faults.mjs:230–234`) revokes every non-source object URL on purpose, so `MediaError 4` and Chrome's "Unable to play media." are the state the scenario asks for.
   - My reading missed the fault. It is not a VH-200 finding.
