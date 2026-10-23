# Codex astra brief — VH-178 re-check after your musts, 2026-10-23

You checked VH-178's candidate from `codex-astra-vh178-brief-2026-10-23.md` and replied "Commit after the musts below" (`codex-astra-vh178-check-2026-10-23.md`). Read-only, base 392077f, the candidate the working tree against HEAD as before. Do not run the walker or the gate.

What changed for your points:

1. **The transition conditions asserted.** Each entry in `TRANSITIONS` (`reviews/2026-10-22/design-pass-2/evidence/measurements/walker/scenarios.mjs`, from "VH-178: the transitions") declares `asserts`; `walker/transitions.mjs` passes a record only when focus landed, every assert holds and focus entered nothing on the way but where it ended (`noDetour`). The save variants assert Stop saving was pressed with focus on it; the reader's move and the dialogue's opening assert the locks or the save were still on. Every measurement was taken again with them.
2. **F3 and F14 composed.** `walker/faults.mjs` `workerPrelude` now puts every prelude on one route (`worker-prelude`), joined in the order set; releases drop their own prelude. T-46e-storage asserts both preludes were seen; `faults.mjs check F3 F9 F10 F12` passes 4 of 4 and J3 (F3 and F12 set and released) 37 of 37 after the change.
3. **Not obscured, read in place.** `readFocus` reads, before anything scrolls, whether the focused control is wholly in the window and how many of five points in it another element covers.
4. **The gate and the digest rules** are in the evidence file's new section "The gate and the standards applied".
<!-- markdownlint-disable-next-line MD029 -->
6. Your may: the module notes the `instanceof HTMLElement` difference (`src/ui/focus-hand-on.ts`), and so does the evidence file.

The evidence file is `reviews/2026-10-22/design-pass-2/evidence/measurements/vh178-focus-2026-10-23.md`; the item's Notes record the check (`project/items/VH-178.md`).

Check that each must is met and that the repair introduced nothing wrong. Reply with a verdict line first ("Commit", "Commit after the musts below", or "Do not commit"), then numbered points, each marked must or may, each with file:line. Be brief.
