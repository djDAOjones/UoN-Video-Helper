<!-- markdownlint-disable -->
<!-- VH-199: Codex astra's blind attribution of run-06 (codex exec -m gpt-6-astra -s read-only), from vh199-codex-run-06-brief.md; the reply, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

**Whole?** No: 338 declared and observed, but **335 ok and three failed**. Independently rerunning the read-only verifier confirms both key hashes are `a03ac8db01629e9b`; only these records prevent wholeness:

`S-55c__{en-GB,zh-Hans,ms-MY}__w1280__fallback`.

Nothing is missing, duplicated, stale or off revision. All 338 current and 65 superseded records use `2e7b0c044ce11f2b`; all 40 frozen walker file hashes match. Provenance records clean source `a3039c3`, Chrome `156.0.8078.48`, and no missing visible-page flags. No ok record omits a subject row required by its own or the run’s `expects`.

**Attribution.** I checked the manifest, declaration, digest, all current and superseded records, both run logs, affected group logs, and the relevant walker and app source.

- **S-55c: three current failures plus 18 superseded attempts — known instrument gap.** All seven attempts per language time out at boot. This is the known fallback × Fetch-routing interaction: `matrix.mjs` installs fonts first; `qualify.mjs:1017` gives that route an unconditional match; `faults.mjs:19` dispatches to the first matching route. F6b’s broad `*closing-*` interception includes the app’s `closing-choice` module import, which the fonts handler then blocks. These are unmeasured cells, not app failures.
- **S-95: all 47 superseded attempts, covering 19 keys — known grouping pattern.** Every failure is a later record in its group, with focus on `body`. The scenario requires focus on the checked colour radio, while `matrix.mjs` explicitly blurs focus after measurement. Fresh setups recover all 19 keys; none remains failed.
- **66 raw player-target failures — expected, explicitly exempt measurement evidence for VH-200.** These occur in S-30 (6), S-53 (14), S-54a (3), S-54c (8), S-55c (22), S-70b (8), S-136 (4), and S-139 (1). Each is the native time scrubber’s measured 161 × 24 px hit run, carrying the user-agent sizing exception. `phase8.mjs` and the app’s native player construction support that attribution. Applied digest rule: WCAG **2.5.5’s user-agent exception**.
- **No other failed assertions or measurements on ok records:** zero counted failures across every instrument.
- **Explicit unresolved measurements remain honest:** S-140n’s expected focus row says “cannot determine: no element” because the unsupported QuickTime fixture is blocked before a result exists. Its recorded outcome permits that branch. S-137’s 31 records retain two limiting-measurement uncertainties after changing language; their direct unchanged-after-save and translated-warning assertions pass. Declared person checks remain unresolved.

**Stop?** No new stop condition is evidenced: no fault contaminating the retained ok records, no undeclared coverage reduction, and no demonstrated app rank 1 problem. The three S-55c cells must remain named gaps and must never count as passes. The final resume recovered nothing, so stopping retries was appropriate.

**Fit with a named gap — S-55c fallback × F6b boot failure at 1280 px in all three languages.**