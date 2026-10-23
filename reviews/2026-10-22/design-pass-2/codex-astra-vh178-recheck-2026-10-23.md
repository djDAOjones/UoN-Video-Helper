<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), re-check of VH-178 (V-46) after its four musts, 2026-10-23, at main 392077f with the working-tree diff; brief: codex-astra-vh178-recheck-brief-2026-10-23.md. The reply, verbatim. -->

Commit

1. **must — Met.** Transition assertions and `noDetour` now determine pass/fail; save, reader-move and dialogue timing are enforced. `walker/transitions.mjs:52`, `:73`; `walker/scenarios.mjs:1610`, `:1627`, `:1641`.

2. **must — Met.** Worker preludes compose in insertion order; release removes only its own prelude. The storage variant requires both faults, and repeat checks are recorded. `walker/faults.mjs:46`, `:61`; `walker/scenarios.mjs:1669`; `vh178-focus-2026-10-23.md:13`.

3. **must — Met.** Viewport bounds and five-point coverage are read before instrument scrolling; the repeated measurements report their results. This remains sampled non-obscuration evidence. `walker/scenarios.mjs:1442`; `vh178-focus-2026-10-23.md:28`, `:64`.

4. **must — Met.** The evidence records the final candidate’s green gate, zero structural failures/warnings, and applied WCAG, Nielsen and house rules. The skipped test is explicitly pre-existing. `vh178-focus-2026-10-23.md:69`.

5. **may — Keep the application changes.** No new regression found; the extraction’s non-HTML distinction is now documented. `src/ui/focus-hand-on.ts:83`; `src/main.ts:1579`, `:2950`, `:3011`. Read-only review against `392077f`; I ran neither walker nor gate.
