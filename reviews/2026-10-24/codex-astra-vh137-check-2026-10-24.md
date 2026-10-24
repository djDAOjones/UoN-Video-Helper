<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), check of VH-137's 0.2.0 edits, 2026-10-24, at main 452334e with the working-tree diff; brief: codex-astra-vh137-brief-2026-10-24.md. The reply, verbatim but for its links, which pointed at absolute paths on this Mac and are given here as repo-relative paths. Its one must, the Chrome check, is recorded in project/items/VH-137.md's last note. -->

Commit after the musts below

1. **must — Record the candidate’s Chrome check.** `project/items/VH-137.md:22` explicitly requires checking all three languages. Neither the diff nor the brief supplies that result. Run it, or cite an existing candidate-specific check: the new limitation, testing paragraph, three dates and language switching. This is the only blocker I found.

2. **may — English passes.** B1, amended B2 and B3 match the approved wording, allowing the stated typography differences: `src/i18n/en-GB.ts:887`, lines 913 and 936.

3. **may — Translations pass.** No sense error found in B1–B3. Chinese uses “选择一个视频” and “中文和马来文页面”; Malay uses “Pilih video” and “halaman bahasa Cina dan Bahasa Malaysia”, matching their existing terminology. Both preserve the automated nature, main-state scope and emulated contrast mode: `src/i18n/zh-Hans.ts:754`, lines 777 and 797; `src/i18n/ms-MY.ts:812`, lines 836 and 857.

4. **may — Date wiring passes source review.** Every language contains each placeholder exactly once. The updated date receives its own `<time datetime="2026-10-24">`, formats through the current locale and repaints with language changes: `src/ui/accessibility-statement.ts:125`. The formatter uses `Intl.DateTimeFormat` with UTC: `src/i18n/intl.ts:129`. Prepared and next-review dates remain unchanged; the tests enforce written ≤ updated < review.

5. **may — Scope and claims pass.** No v1, full-conformance or human-testing claim is introduced. “Partially compliant”, the four required tests, two optional tests and machine-translation limitation remain unchanged in all three tables. The markup adds the approved list item and paragraph; B3 adds its inline date element. See `index.html:722` and line 752.

6. **may — VH-175.2 retirement is justified.** B1 discloses the browser-language limitation and gives the speech-input workaround using the actual step name. That pays the statement-writing task; it does not claim the underlying label mismatch is fixed. The retirement is recorded at `project/decisions.md:25`, while the separate specification follow-up remains at `project/wish-list.md:62`.

7. **may — No other blocker found.** CSV changes are confined to the two additions, date sentence and six-line note. VH-145 was archived verbatim, leaving 45 live decisions. Applied house-conventions’ minimal-change/config rules and Nielsen 4, 8 and 10. I accepted the supplied gate results and did not rerun either gate.