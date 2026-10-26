<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), second re-check of the method check for the third design pass (VH-198) after the first re-check's three musts, 2026-10-26, run read-only in the repository's working tree at ddc3d15 with the uncommitted walker diff (instrument revision 2cbba731c59d8036), from 09:14 to 09:20, exit 0; brief: codex-astra-method-recheck-2-brief-2026-10-26.md. The reply, verbatim, but that each "](" of its file links is written "]\(" so the link checker reads them as text. -->

Not fit

- **Must — rank 1, M-02:** Must 3 fixes the redraw false pass but introduces another: contrast is measured against the ring-suppressed focused image. In memory, an unchanged 184-pixel outline passes despite zero focused/unfocused change; HEAD rejects it, and its focus-only twin passes both. Apply the WCAG digest’s 2.4.13 rule: count isolated indicator pixels meeting 3:1 against their **unfocused** state. Add that negative and twin. (`walker/phase8.mjs:553`, `:275`; existing proofs: `walker/prove-8.mjs:322`.)

- **May — must 1 met, M-01:** Real declarations now supply expectations. The dropped-subject/step negatives and complete twins challenge the original omission. No spurious expectation failure found; an additional in-memory pressed-control omission also fails correctly. (`walker/matrix.mjs:59`, `:197`; `walker/prove.mjs:252`.)

- **May — must 2 met, M-01:** Completion is bound to the card’s mutation and requires the ready sentence. Both new negatives fail and their twin passes, confirmed in memory. (`walker/phase8.mjs:66`, `:739`; `walker/prove-8.mjs:224`.)

- **May:** No other regression or coverage reduction found. Revision `2cbba731c59d8036` recomputes over 40 files; retain the watched-run stall procedure and VH-198.1 deferral. (`walker/runner.mjs:235`; `instruments-2026-10-25.md:705`, `:850`.)
