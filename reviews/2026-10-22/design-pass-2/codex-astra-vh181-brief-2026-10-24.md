# Codex astra brief — VH-181, one name for step 4 (V-45), 2026-10-24

You are checking one fix item's candidate diff in this repository, read-only. The base is commit f94f465. The candidate is the working tree against HEAD: `git diff`, plus two new files, `reviews/2026-10-22/design-pass-2/evidence/measurements/walker/name-181.mjs` and `reviews/2026-10-22/design-pass-2/evidence/measurements/vh181-name-2026-10-23.md` (the item names the file with the 23rd). Do not run the walker or the gate: their results are in the evidence file and below.

The item is `project/items/VH-181.md`: read its acceptance criteria in full. For the stage rule every fix keeps, read `project/items/VH-176.md`. The finding is V-45 in `reviews/2026-10-22/design-pass-2/design-pass-2-2026-10-23.md`, with its Disposition row. The owner's ruling is the `project/decisions.md` entry "2026-10-23 — PLAN-7 — The owner decides the four wish lines". It approves the one `docs/01-specification.md` edit.

What the candidate does, in brief:

- `src/i18n/en-GB.ts`: `steps.closing` and `closing.legend` read "Closing graphics".
- `reviews/2026-10-18/VH-105-strings-filled.csv`: the two rows' English, Chinese (结尾图形) and Malay ("Grafik penutup"), with "VH-181: Chinese and Malay drafted by the agent" added to the last column. `scripts/strings-table.mjs` regenerated `src/i18n/zh-Hans.ts` and `src/i18n/ms-MY.ts` from it, and each differs by those two messages. The two terms are the nouns the step's own lines already use, in `closing.helpExistingText`, `helpFreezeText` and the result lines. The sheet's "where it shows" column is left as the translator was sent it.
- `index.html`'s two fallbacks, `src/i18n/sheet.ts:122`'s row label, and `test/screen-text.test.ts:655`'s step titles.
- `README.md`'s product line now reads "approved opening branding and closing graphics". "Opening branding" is kept because the title card is not closing graphics, and opening graphics are an icebox item (VH-23).
- `docs/01-specification.md:626` reads "4. **Closing graphics** — animation type, onset and colour (§4.3)." The spec stays at 8,074 of its 8,100 words.
- `src/i18n/tables.test.ts`: a describe of three checks, each run in three languages:
  - the heading and the legend match;
  - the step's name occurs in both onset help lines;
  - no message holds any of the three old names.
- The walker:
  - `PLANS.vh181` in `scenarios.mjs`, 105 records over seven existing scenarios, with no new scenario;
  - `ready` exported, for `name-181.mjs`;
  - `name-181.mjs`, which reads the heading, the legend, the accessible names and the name counts.
- The report's V-45 Disposition row; the item's Now and Notes.

The other names the page uses for the closing, read and kept:

- "closing card" (结束卡, "kad penutup") is the still card a Cut goes to. It is part of the graphics, not a second name for them.
- "branding" in the intro, the promises and the audio-only error names everything the tool adds.
- "Closing the tab" is a verb.

The gate, `npm run check`, is green on this candidate:

- 81 test files: 1,523 passed and 1 skipped (the existing EBU 3341 cases 7 and 8). At the base it was 1,514; the nine new test cases are the difference.
- Lint, docs:lint and links: 0 issues.
- `node tools/check.mjs`: 0 failures, 0 warnings.

Check, giving file:line:

1. Each acceptance criterion: met, or not, and why. In particular:
   - Does each language now have one name for the step, the same noun its lines use?
   - Is any third name for the same thing left in `src/`, `index.html` or `README.md`?
   - Is "closing card" rightly a different thing?
   - Is the spec edit exactly the approved line and nothing else in `docs/`?
   - Could the new tests fail on the old strings?
2. The README wording: is it a fair reading of "the product line takes the same name"?
3. Is the evidence sound?
   - the before taken on the base;
   - the 105 records whole with no outcome changed;
   - the heading's lines and contrast in three languages and four colour modes;
   - V-18's six readings.
4. The walker change: do the pass's declared plans keep their counts, and is anything that imports `scenarios.mjs` affected by exporting `ready`?
5. The stage rule:
   - no control or element added;
   - no CSS changed;
   - UI-STANDARDS untouched (no rule changes);
   - the digest rules named at close.

Reply with a verdict line first ("Commit", "Commit after the musts below", or "Do not commit"). Then give numbered points, each marked must or may, each with file:line. Be brief.
