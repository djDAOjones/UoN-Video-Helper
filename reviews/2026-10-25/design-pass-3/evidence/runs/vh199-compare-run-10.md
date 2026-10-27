<!-- markdownlint-disable -->
<!-- VH-199: the comparison of Claude's and Codex astra's readings of run-10, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-10 — Claude and Codex astra compared (VH-199 #6)

Claude: `vh199-claude-run-10.md`, written before Codex was briefed. Codex astra: `vh199-codex-run-10.md`, session `01a17c13-30c1-70e3-ab0c-f10583998365`, 06:36:34–06:41:14Z, briefed blind (`vh199-codex-run-10-brief.md`: the run, its logs, the frozen walker, the known classes; not Claude's reading). It ran after the walk ended, with no walk beside it.

## Agreed

- **Whole:** 103 declared (`run.json` and `parts.mjs` `RUNS`), 103 written, all ok, all at `2e7b0c044ce11f2b`, source `a3039c3`, Chrome 156.0.8078.48; no resume, nothing superseded, no missing subject.
- **S-93 ×2 (zh-Hans and ms-MY w320): "exactly one check after the last press" fails:** the check counter (`STATUS_SINCE`), the gap the owner accepted. Not evidence of a missing app check.
- **S-152 ×2: the player rows** (metadata, accessible name "Unable to play media.", control inventory cannot determine): F15b's intended failed playback, the class of S-132; its save subresults pass. Expected for VH-200.
- **S-100 and S-136: the scrubber target rows,** under 2.5.5's user-agent exception.
- **S-21 ×8: `#trim-clear` focus "cannot determine"**, as run-02 reads it: the control is disabled, so focus cannot land. Not an app fault.
- **The declared "cannot determine" readings:** the trim targets (the disc's hit area), the range thumb and track contrast, the mixed-script measure (ten rows) and S-93's thumb focus against the 44 px reference. Unresolved, never counted as passes.
- **Stop: none.** No coverage change, no instrument fault that makes records untrustworthy, no app rank 1 problem.

## Codex only

- All 663 artifacts pass their byte-count and hash checks, and the frozen walker's hashes match.
- S-74's eight logged uncaught errors are F8's deliberate injections.
- S-152's subresults saved 7,469,454 bytes with the limiting warning unchanged.
- The trim target rows: 180 raw "cannot determine", 52 exempt as disabled, 128 counted across 64 records (Claude counted the 64 records).

## Claude only

- S-113's six records hold none of its font32 sideways-scroll mode: that expected finding is not in run-10.

## Disagreed

- **S-21's cause line. Claude cited `src/main.ts:1806`; Codex `src/main.ts:1872`. Settled for Codex on the code:** `:1806` is the reading/unreadable branch, and on a too-short file that reads, `:1872` disables "Use the whole video" because the whole video is already chosen (`trim.range === null`).
- **S-21's name. Claude: "not a fault, the class of S-62's disabled Save"; Codex: "an instrument applicability gap" (the scenario asks for focus on a control the app disables by design).** Settled as both, without conflict: the app is right; the scenario's declared focus target can never be measured in this state, so its row stays "cannot determine". VH-200 reads it as not applicable, never as a pass or a fail; the target belongs on the walker-fix list's notes for VH-203, not a stop.

**Run-10's verdict: whole, 103/103. Codex astra: "Fit with a named gap" (S-93's check counter, S-21's disabled-control focus target, the declared person checks).** No message needed under #9's rule: the check counter is accepted, and the rest are expected classes.
