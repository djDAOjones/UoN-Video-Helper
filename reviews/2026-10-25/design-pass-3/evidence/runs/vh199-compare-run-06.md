<!-- markdownlint-disable -->
<!-- VH-199: the comparison of Claude's and Codex astra's readings of run-06, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-06 — Claude and Codex astra compared (VH-199 #4)

Claude: `vh199-claude-run-06.md` (written before Codex was briefed). Codex astra: `vh199-codex-run-06.md` (session `01a17af6-08dd-7f53-8294-079c2dfe6cac`).

## Agreed

- Not whole: 335/338, keys `a03ac8db01629e9b` both ways, every record (and every superseded attempt) at `2e7b0c044ce11f2b`, source `a3039c3`, Chrome 156.0.8078.48, no flag missing.
- The three `S-55c__*__w1280__fallback` records are the known `fallback` × Fetch-routed gap. The `fonts` route is first with an always-true match, and F6b's `*closing-*` pattern pauses `closing-choice.ts`, so the app never boots. These cells are unmeasured, not an app failure.
- The 47 S-95 attempts over 19 keys are the grouping pattern, all recovered.
- No failed assert or counted measurement on any ok record. No stop, no coverage reduction, no app rank 1 problem.
- Verdict: fit, with the S-55c fallback records named as a gap.

## Codex only

- All 40 frozen walker file hashes match.
- S-95's later records have focus on `body`, because `matrix.mjs` blurs focus after each measurement: the grouping pattern's mechanism.
- 66 raw player-target failures in S-30, S-53, S-54a, S-54c, S-55c, S-70b, S-136 and S-139. Each is the native scrubber's 161 × 24 px hit run, exempt under WCAG 2.5.5's user-agent exception. That is why my count of `fail` outcomes found none. Expected evidence for VH-200.
- S-140n's focus row "cannot determine: no element", the QuickTime fixture refused at read as designed.
- S-137's two limiting uncertainties after a language change, with their direct asserts passing.

## Claude only

- A read-only probe per record (`vh199-4-probe-s55c.mjs`): routes [fonts, F6], F6b saw nothing, the only non-font request failed was `closing-choice.ts`, in all three languages.

## Disagreed

- None. Claude named S-95's predicate (focus not on `#closing-colour input:checked`); Codex named where focus was (`body`) and why. The two are consistent.
