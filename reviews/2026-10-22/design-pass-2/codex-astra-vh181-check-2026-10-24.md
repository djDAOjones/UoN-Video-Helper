<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), check of VH-181, 2026-10-24, at main f94f465 with the working-tree diff; brief: codex-astra-vh181-brief-2026-10-24.md. The reply, verbatim. -->

Commit after the musts below

1. **must — Measurement coverage is incomplete.** `walker/scenarios.mjs:1446` selects seven scenarios, but S-44 and S-45a/b also display step 4 (`scenarios.mjs:562`). `project/items/VH-181.md:13` requires every record drawing the renamed string. Measure the omitted records, or obtain a recorded owner-approved reduction; correct the exhaustive coverage claim in `vh181-name-2026-10-23.md:7`.

2. **may — Naming and README criteria met.** The heading and legend use the existing help/result noun in each language: `src/i18n/en-GB.ts:128`, `zh-Hans.ts:71`, `ms-MY.ts:79`. Draft markings and supporting edits match. No third user-facing name remains. “Closing card” correctly identifies the still endpoint (`en-GB.ts:340`). `README.md:4` fairly applies “closing graphics” while retaining the separate opening branding.

3. **may — Tests catch the regression; qualify the search claim.** At `src/i18n/tables.test.ts:328`, the help-line checks would fail on all three old tables; the blacklist checks at `:334` would also fail. The three equality checks would already pass. Literal zero-hit searching is **not** met: the deliberate negative fixtures remain at `:322`. Describe `vh181-name-2026-10-23.md:50` as “no production message retains an old name.”

4. **may — Spec criterion met.** `docs/01-specification.md:626` is exactly the approved replacement, and the only `docs/` change. Independently counted: 8,074 words before and after. Approval is recorded at `project/decisions.md:58`.

5. **may — Recorded evidence is internally consistent, subject to point 1.** `vh181-name-2026-10-23.md:11` reports both 105-record runs whole; the instrument totals at `:68` reconcile. Heading measurements cover three languages and four colour modes (`:54`); all six V-18 readings match VH-180 (`:90`). HEAD matches the stated base. Raw runs are scratchpad-only, so their provenance and unchanged per-record outcomes remain reported evidence, not independently verified here.

6. **may — Existing walker plans and callers are unaffected.** `walker/scenarios.mjs:1447` adds 105 records without altering existing plans: smoke 119, matrix 1,454, priority 699 remain unchanged. Exporting `ready` at `:110` changes no implementation; existing named imports remain valid.

7. **may — Remaining stage constraints met.** `index.html:396` changes text only; no control, element, CSS or UI-STANDARDS change appears. Applied digest rules are named at `project/items/VH-181.md:40`; V-45 links its evidence at `design-pass-2-2026-10-23.md:706`. The supplied green gate has nine additional passing cases and no newly skipped/deleted test. I ran neither walker nor gate.
