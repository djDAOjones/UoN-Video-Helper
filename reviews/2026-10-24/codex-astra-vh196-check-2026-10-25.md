# Codex astra check — VH-196, the lede's five promises and the format "?", 2026-10-25

Model gpt-6-astra, read-only, on the brief `codex-astra-vh196-brief-2026-10-25.md`. Its reply, verbatim but for its file links, kept as code:

Commit after the musts below

1. **must — Fix the walker’s whitespace normalization.** In `tip-196.mjs:39` and line 46, use `/\s+/g`, not `/\\s+/g`, inside `String.raw`. The current expressions match literal backslash-s sequences. Runtime translation currently masks this, but wrapped text can produce false failures.

2. **may — AC1 met; strengthen the hint assertion.** `index.html:50` and `src/i18n/en-GB.ts:81` contain the five promises and complete hint exactly as recorded, after whitespace normalization. `test/screen-text.test.ts:81` pins all five promises; line 102 pins only the hint’s MP4 clause. Optionally pin the complete hint too.

3. **may — AC2 met; onset behaviour unchanged.** `src/main.ts:718` preserves all four listeners. Each closure owns its button and tip. Focusing or clicking the other button correctly dismisses the previous tip; Escape cannot open either or steal focus from the other control.

4. **may — Markup sound.** `index.html:53` legally contains the button and both divs within one `li`; the list remains five items. The live wrapper stays exposed while its child is hidden. One ordinary Tab stop precedes Video type; the tip adds none. Actual screen-reader announcement remains a browser/AT check.

5. **may — AC3 met on the supplied gate result.** `test/readability.test.ts:118` adds only the literal apposition. HTML whitespace is collapsed at line 62, so both copies match. `EXCEPTED` is unchanged. This retains the existing file-wide substring check, rather than checking each MP4 occurrence separately.

6. **may — AC5 met on source and supplied gate evidence.** `src/i18n/zh-Hans.ts:40` and `src/i18n/ms-MY.ts:40` preserve the intended sense and established terms: 结尾图形, grafik penutup, 修剪 and memotong/Potong. No substantive mistranslation found.

7. **may — Sheet and stage scope hold.** `VH-105-strings-filled.csv:10` has exactly three replaced rows and four additions; all seven match the tables and `sheetRows()` metadata and carry draft marks. Nothing unrelated changed. The sole added control is the approved “?”; CSS reuses an existing token.

8. **may — AC4 and AC6 evidence boundary.** `project/items/VH-196.md:12` requires measurements and Chrome evidence gathered separately, so those are not independently verified here. The reported green gate is accepted; no new skip or deleted test appears. Review is complete; close metadata remains the writer’s. Applicable digest rules: Carbon pattern/token reuse, Nielsen consistency/minimalism, and WCAG keyboard operation/target size.

What was done: the must checked. `tip-196.mjs` holds `/\s+/g` at lines 39 and 46, and a re-run passed 36 of 36. The may on the hint was taken: `test/screen-text.test.ts` now pins the whole hint. The other mays need no change.
