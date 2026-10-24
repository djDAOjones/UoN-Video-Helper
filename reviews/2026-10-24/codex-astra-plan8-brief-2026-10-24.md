# Codex astra brief — PLAN-8, the Phase 8 plan, 2026-10-24

You are checking a planning commit in this repository, read-only. The base is commit b7937c2 (VH-182 raised). The candidate is the working tree against HEAD: `git diff` and the untracked files `project/items/VH-183.md` to `VH-195.md` and `reviews/2026-10-24/phase-8-wording-sheet-2026-10-24.md`, plus this brief. Do not run the gate or build anything. Nothing in `src/` or `docs/` changes in this commit, by design.

The plan: Phase 8, the owner's UX pass, as thirteen pieces, VH-182 to VH-195, in a fixed build order, with every new word and every spec correction on one wording sheet. The owner's words and answers are quoted verbatim in the new `project/decisions.md` entry "2026-10-24 — PLAN-8". The owner settled Q1a, Q2, Q3, Q4 and Q8; Q5, Q6 and Q7 are marked "being worked out" for a round 2, and their items (VH-188, VH-193, VH-182) stay `[!]`. VH-183 to VH-185 are `[ ]` and start first. The other items stay `[!]` on the sheet's approval, since the owner approves every edit to `docs/` and has not yet seen the string rows. The owner's standing rule is that the app stays simple: the only new elements allowed are the player (VH-192), the footer's headings and the Self Service link (VH-182).

Spec corrections S1 to S31 and U1 on the sheet were produced by a script against the current `docs/01-specification.md` and `UI-STANDARDS.md`; each matched exactly once on a scratch copy, and together they take the spec from 8,074 to 8,096 of its 8,100 words.

Please judge, with file:line references:

1. Each owner answer is recorded faithfully and verbatim, and applied where it changes an item: Q1/Q1a and Q2 in VH-182, Q3 in VH-192, Q4 in VH-191, Q8's condition as a VH-187 criterion that `browserNote.notPassed` still shows when a check fails or warns (compare `src/ui/system-check.ts`).
2. The sheet's rows are consistent with the items and the current strings in `src/i18n/en-GB.ts` and `src/config/feedback.ts`; the provisional rows (B6, B11, the VH-182 help links, S1–S10, S25) are marked so.
3. The spec corrections' old text is quoted exactly from the current docs, each placed under the right section and item, and none is applied.
4. The ledger obeys AGENTS.md rules 3 to 6: the backlog's Phase 8 lines and blockers, the 21 wish lines removed (INTAKE.2 kept) with each traced in the decision's Rationale (the commit body will also carry one trace line per wish), the decision's Items and Deferred lines, the archive move.
5. Anything that adds a control or element beyond the three agreed, or re-scopes an item.
6. Anything that should block the commit.

Reply with a one-line verdict first ("Commit", "Commit after the musts below" or "Do not commit"), then numbered points, each marked must, should or may.
