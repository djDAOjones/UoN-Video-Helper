# Codex astra check — VH-194, spec §9.3 and UI-STANDARDS take Phase 7's corrections, 2026-10-25

Run read-only (`codex exec -m gpt-6-astra -s read-only`) on the candidate diff against e226410, from the brief `codex-astra-vh194-brief-2026-10-25.md`. Its reply, verbatim:

Commit

1. **May — AC1 met: exact wording and scope.** All eight old passages match once in the base and are absent from the candidate; every replacement appears once, word for word with whitespace ignored. S27 is removed. Locations: `docs/01-specification.md:705` (S26), `:731` (S27), `:717` (S28), `:732` (S29), `:763` (S30), `:715` (S31); `UI-STANDARDS.md:241` (U1), `:245` (U2). Applying only these replacements reproduces both complete documents after whitespace normalisation. The raw diff confines wrapping changes to the edited passages.

2. **May — AC2 met: counts agree.** Using the actual `words()` function consumed by the checker, without running the checker or gate (`tools/ledger.mjs:14`):
   - Spec: **8,074 → 8,100**, exactly its limit. S26–S31 total **+26**.
   - UI-STANDARDS: **2,400 → 2,393**, seven below its limit. U1 and U2 total **−7**.

   These match the sheet’s deltas and totals.

3. **May — AC3 met: both follow-ups are appropriate.** `project/wish-list.md:63` correctly captures the overbroad “holds this list” at `docs/01-specification.md:769`: the exceptions set at `test/readability.test.ts:138` covers the short forms, not media content or the chooser’s accessible name. `project/wish-list.md:64` correctly captures the statement’s unnecessarily narrow language scope at `src/i18n/en-GB.ts:906`.

4. **May — No additional contradiction found in the requested sources.** S26 agrees with `UI-STANDARDS.md:208`; S28 and U2 agree on focus hand-on; S29 preserves the remaining person-only evidence without contradicting the statement’s explicitly automated larger-text walk (`src/i18n/en-GB.ts:932`). S31 agrees with the announcement control described at `UI-STANDARDS.md:127`. S30 records the exception to the label/name rule under the explicit exception policy (`UI-STANDARDS.md:196`); it does not claim conformance. Nothing in `project/architecture.md` conflicts with these changes.

5. **May — Ledger accurate; archive verbatim.** The Decision line at `project/decisions.md:23` is true to the diff. The backlog removal, trajectory entry (`project/trajectory.md:26`) and item close (`project/items/VH-194.md:18`, `:33`) agree. The VH-160 entry at `project/decisions-2026-10.md:933` is byte-identical to the removed entry. Other decision text is unchanged; only entry-separating newlines change. The index at `project/archive-index.md:3` correctly records 82 archived entries, with 45 remaining live.

6. **May — AC4 remains externally evidenced.** This completes the requested candidate review. No source or test file changes, deletions or skips appear in the diff. I did not run the gate, as instructed; its green result and the commit’s `Verify:` and `Checked:` lines remain for the external close. No candidate correction is required.

## Disposition

- No musts or shoulds. Points 1 to 6 are Mays that confirm the criteria; nothing to apply. The gate ran green outside the check, and the commit carries the `Verify:` and `Checked:` lines.
