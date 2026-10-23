<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), check of VH-178 (V-46), 2026-10-23, at main 392077f with the working-tree diff; brief: codex-astra-vh178-brief-2026-10-23.md. The reply, verbatim. -->

Commit after the musts below

1. **must — Assert the transition conditions.** `walker/transitions.mjs:67` grades only `landed`. Conditions such as `checkingAtFocus`, `savingAtSettle`, `lockedAtMove` and `savingAtOpen` are merely recorded (`walker/scenarios.mjs:1467`, `:1513`, `:1568`, `:1612`). A reader move or dialogue opening **after settlement** can therefore pass. Require the declared starting focus, timing conditions and verdict before awarding a pass; repeat the affected measurements. Focus is correctly read before the ring instrument runs (`walker/transitions.mjs:47`).

2. **must — Compose F3 and F14.** The storage variant installs F3 before F14 (`walker/scenarios.mjs:1632`), but routing returns after the first matching handler (`walker/faults.mjs:24`). Both intercept the same worker response, so F3 wins and F14 never executes. Apply both preludes, verify their execution and repeat this variant. **F14 alone is fair:** it delays the unchanged verdict’s delivery, preserving the UI transition being tested (`walker/faults.mjs:189`).

3. **must — Complete the non-obscuration evidence.** `vh178-focus-2026-10-23.md:60` explicitly leaves the hand-off’s original viewport position unmeasured; `walker/qualify.mjs:693` scrolls before measuring. Record non-obscuration immediately after the hand-off, before instrument scrolling, to satisfy `project/items/VH-178.md:16`.

4. **must — Supply the gate result and applied digest rules.** The supplied evidence ends at `vh178-focus-2026-10-23.md:65` without either, despite the brief saying the gate result is there. Record the final candidate’s `npm run check` result, including the structural checker, and name the applied digest rules (`project/items/VH-176.md:13`). No existing tests were deleted or skipped in this diff. I ran neither walker nor gate.

5. **may — Keep the application changes.** The job endings and Cancel capture Announce progress correctly (`src/main.ts:2950`, `:3011`, `:3121`). `stepsWithdrawnBy` mirrors the subtrees hidden, including conditional retention of Create/results (`:923`, `:1575`). Storage-recoverable, ready and discouraging verdicts leave surviving setup focus alone (`:1530`, `:1579`). The three settled branches preserve their first successor and add Stop saving only as fallback (`:1593`, `:1616`, `:1627`).

6. **may — Qualify the extraction’s equivalence claim.** `active !== null` admits non-HTML descendants, unlike the former `instanceof HTMLElement` (`src/ui/focus-hand-on.ts:86`). No affected focusable non-HTML descendant exists in the current markup, so I found no current regression. Dialog, reader-moved and initially-on-body guards remain; tests pin these and fallback order (`src/ui/focus-hand-on.test.ts:101`, `:145`). All eight other captures retain their current behaviour: `src/main.ts:1635`, `:1982`, `:2788`, `:2847`, `:3251`, `:3275`, `:3290`, `:3366`.

7. **may — Retain the remaining stage evidence.** The three-language/four-mode results, 238/242 keyboard result and explicit V-40/VH-179 ring exception are recorded (`vh178-focus-2026-10-23.md:24`, `:34`, `:52`). No product element or numeric setting is added; the progress bar, CSS, tokens and `docs/` remain unchanged. The Disposition links the item and evidence correctly (`design-pass-2-2026-10-23.md:700`), subject to repairing the verification gaps above.
