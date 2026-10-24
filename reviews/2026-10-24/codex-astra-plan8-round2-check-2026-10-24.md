<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), check of PLAN-8 round 2 and the sheet's approval, 2026-10-24, at main 57bf247 with the working-tree diff; brief: codex-astra-plan8-round2-brief-2026-10-24.md. The reply, verbatim but for its links, set as code references. Both musts are applied: VH-193, B11 and round 2's Q6 send the warning through the pipeline's outputWarnings, with the bite carried unrounded out of AudioPlan; S32 corrects §5.4's introduction and S25's row is shorter, so the spec ends at 8,100. The should is applied to VH-182 and the could to the sheet's and VH-194's UI-STANDARDS totals (2,400 to 2,393). -->

**Commit after the musts below.**

1. **Must — specify the live warning path.** `VH-193.md:9` relies on `detectOutputWarning`, which has no production caller; failed output loudness currently rejects the file. Correct VH-193, B11 and Q6 to explicitly connect the detector through `pipeline.outputWarnings` → worker → result and announcement. Carry the unrounded, pre-codec limiter bite out of `AudioPlan`; preserve output verification.

2. **Must — correct §5.4’s introduction in S25.** `Wording sheet:429` adds an after-job row but leaves the introduction saying all warnings derive from source analysis and appear before processing. Extend the draft to distinguish source warnings from output warnings, keeping the spec within 8,100 words.

3. **Should — include the remaining footer dependencies.** `VH-182.md:10` should also name `test/screen-text.test.ts:421–449`, which asserts the removed link, constant and old feedback address, and `src/i18n/sheet.ts:476`, whose Creators translation note references the removed key. Update those assertions and instructions during implementation.

4. **Could — fix the UI-STANDARDS totals.** `Wording sheet:105` should say **2,400 → 2,393**, using the ledger’s counting rule, which excludes fenced blocks.

Otherwise, the settled wording, preset sentence forms, WCAG digest’s 2.4.9 link-purpose rule, ledger traces and element limits check out. All 32 replacements match once; the spec ends at **8,098 words**, within budget throughout build order.

Read-only review; no gate or build run.