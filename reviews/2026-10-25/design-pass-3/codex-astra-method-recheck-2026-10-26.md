<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), re-check of the method check for the third design pass (VH-198) after M-01 to M-05, 2026-10-26, run read-only in the repository's working tree at ddc3d15, from 07:42 to 07:50, exit 0; brief: codex-astra-method-recheck-brief-2026-10-26.md. The reply, verbatim, but that each "](" of its file links is written "]\(" so the link checker reads them as text. -->

Not fit

- **Must — rank 1, M-01:** Production declarations never populate `expects`; missing subjects therefore still pass verification. Only the synthetic proof supplies expectations. Wire them into real declarations and prove a dropped subject fails. ([matrix.mjs:175]\(<reviews/2026-10-25/design-pass-3/evidence/measurements/walker/matrix.mjs#L175>), [runner.mjs:165]\(<reviews/2026-10-25/design-pass-3/evidence/measurements/walker/runner.mjs#L165>))

- **Must — rank 1, M-01:** Completion remains a one-second timestamp heuristic. In memory, a warning written 500 ms earlier, with **no completion write**, passes every limiting row. Bind the announcement to the completion mutation and add this negative beside a passing twin. ([phase8.mjs:729]\(<reviews/2026-10-25/design-pass-3/evidence/measurements/walker/phase8.mjs#L729>))

- **Must — rank 1, M-02:** 2.4.13 still counts the entire focus/unfocus redraw. In memory, absent-ring evidence with sufficient disclosure redraw returns `pass`; the suppression proof checks only 2.4.7. Require established indicator pixels or “cannot determine”, and qualify this distinction. This applies the WCAG digest’s 2.4.13 rule. ([phase8.mjs:546]\(<reviews/2026-10-25/design-pass-3/evidence/measurements/walker/phase8.mjs#L546>), [prove-8.mjs:291]\(<reviews/2026-10-25/design-pass-3/evidence/measurements/walker/prove-8.mjs#L291>))

- **May:** Retain the remaining repairs. M-01’s bite/footer fixes and M-03–M-05 are applied as intended; the saved negatives and twins support their stated checks. Revision `2d16e337abe51539` recomputes over 40 files; I found no coverage reduction or further provenance hole. ([instruments-2026-10-25.md:493]\(<reviews/2026-10-25/design-pass-3/evidence/measurements/instruments-2026-10-25.md#L493>))

- **May:** Leave the stall guard to VH-198.1 for a **watched** VH-199 run. The documented stop/restart/resume procedure is adequate; retain the interruption and unresolved cause. A guard need not precede VH-199. ([instruments-2026-10-25.md:699]\(<reviews/2026-10-25/design-pass-3/evidence/measurements/instruments-2026-10-25.md#L699>))
