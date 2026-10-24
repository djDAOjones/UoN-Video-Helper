# Codex astra re-check brief — VH-181, one name for step 4 (V-45), 2026-10-24

You checked VH-181's candidate from `codex-astra-vh181-brief-2026-10-24.md`. Your reply is `codex-astra-vh181-check-2026-10-24.md` ("Commit after the musts below"). This check is read-only again. The base is f94f465, and the candidate is the working tree against HEAD. Do not run the walker or the gate.

What changed since:

- **Your must 1 (coverage).** `walker/scenarios.mjs` gains `PLANS['vh181-rest']`, 246 records. These are the 82 other scenarios whose VH-172 priority records hold `h2#closing-heading`, S-44 and S-45a/b among them. Each runs once in each language, in light at 320 px, or at its own view (S-26a and S-26b at 375 px).
  - The before was walked on the base: `git archive f94f465` was served by a second Vite on :5174, then stopped.
  - The after was walked on the candidate.
  - Both runs are whole (246 of 246) and pass `runner.mjs --verify`. No instrument's outcome changes.
  - The heading reads as it does in the first 105 records: Malay at 320 px goes from two lines to one. In S-78k it is inert under the feedback dialog's backdrop, before and after.
  - `vh181-name-2026-10-23.md` now describes the two plans and the cells not walked: these 82 in dark, the forced palettes and at 1280. It also has a section for the 246 records, and 1.4.8 now reads "all 351 records". The pass's plans keep their counts (smoke 120, priority 699, matrix 1,454).
- **Your may 3.** The evidence says the old names remain only in `src/i18n/tables.test.ts`, as the list the new check refuses, and its list of checks says "no message in the three tables".
- `project/items/VH-181.md` gains a Notes line for both points. Nothing in `src/`, `index.html`, `README.md` or `docs/` changed since your check.
- The gate is green again: 81 test files, 1,523 passed and 1 skipped. `node tools/check.mjs` gives 0 failures and 0 warnings.

Check, giving file:line: are both points met, and does anything in your first reply now stand differently? Is covering the 82 scenarios at 320 px in light alone, rather than in all four colour modes, a sound reduction for a string-only change? Reply with a verdict line first ("Commit", "Commit after the musts below", or "Do not commit"), then numbered points, each marked must or may. Be brief.
