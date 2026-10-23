# Codex astra brief — VH-180, a true frame-rate note (V-47), 2026-10-24

You are checking one fix item's candidate diff in this repository, read-only. Base: commit 4e5be61. The candidate is the working tree against HEAD: `git diff` plus the new files `reviews/2026-10-22/design-pass-2/evidence/measurements/walker/note-180.mjs` and `reviews/2026-10-22/design-pass-2/evidence/measurements/vh180-words-2026-10-23.md` (the item names the file with the 23rd). Do not run the walker or the gate; their results are in the evidence file and below.

The item is `project/items/VH-180.md`; read its acceptance criteria in full, and `project/items/VH-176.md` for the stage rule every fix keeps. The finding is V-47 in `reviews/2026-10-22/design-pass-2/design-pass-2-2026-10-23.md` (and its Disposition row); your blind review's D-04 is in `codex-astra-blind-review-2026-10-22.md`, and your fix-plan critique's F-05 in `codex-astra-fixplan-critique-2026-10-23.md`. V-45 left this item for VH-181 on the owner's ruling (the newest entry of `project/decisions.md` but two), so the step 4 names, `index.html`'s fallbacks and `sheet.ts:433` are not in scope.

What the candidate does, in brief:

- `src/i18n/en-GB.ts`: `source.outputRate` is "To reach a standard frame rate, some frames will be repeated or left out.", no placeholder, with a one-line doc comment.
- `reviews/2026-10-18/VH-105-strings-filled.csv`: the row's English, Chinese and Malay; its placeholder note emptied; the last column "VH-180: Chinese and Malay drafted by the agent". `src/i18n/zh-Hans.ts` and `src/i18n/ms-MY.ts` are regenerated from it by `scripts/strings-table.mjs`; each differs by that one message.
- `src/ui/source-panel.ts`: the one call reads `source.outputRate` as a string; the 10% threshold is kept; a comment line says why it names no rate.
- `src/ui/source-panel.test.ts`: a describe of five tests: conformed up (45 to 50) and down (120 to 60) each give the sentence; no digit in it; the tenth-of-a-percent boundary gives no note; beside `variesNote`, the two sentences once each.
- The walker: `S-16-45` and `S-16-120` in `scenarios.mjs`, flagged `fixOnly` and filtered out of `scenarioIds()`, so `PLANS.smoke`, `priority` and `matrix` keep their counts (120, 699, 1,454); `PLANS.vh180`, 150 records; `note-180.mjs` reads the row under Larger and Smaller; `fixtures.sh` makes the two sources.
- The report's V-47 Disposition row; the item's Now and Notes.

One deliberate departure: the item's English draft was "The output will run at a standard frame rate, so some frames will be repeated or left out." The item says it is checked beside `variesNote`, which ends "The output will use a steady frame rate, which keeps audio and picture in step.", so that the two do not say the same thing twice. Joined, the draft did; so the sentence starts from the frames instead.

The gate, `npm run check`, is green on this candidate: 81 test files, 1,514 passed, 1 skipped (the existing EBU 3341 cases 7 and 8); lint, docs:lint and links 0 issues; `node tools/check.mjs` 0 failures, 0 warnings. At the base it was 1,509 passed; the five new tests are the difference.

Check, with file:line:

1. Each acceptance criterion: met, or not, and why. In particular: is the sentence true in every case the note is raised (conformed up, conformed down, under Smaller's 30 fps cap, a variable-rate source), and does it name no rate in any language; is the call site the only source change, with the threshold, the presets and the renderer untouched; are the Chinese and Malay faithful to the English and consistent with `variesNote`'s words; are the tests real (could they fail on the old string or the old call).
2. The departure from the draft: a fair reading of "checked beside `variesNote`", or should the draft stand?
3. Is the evidence sound: the before taken on the base, the two sources made outside `samples/`, the 150 records whole with no outcome changed, the note's lines within the measure at 1280 and 320 px, the V-18 readings, and the leaf counts.
4. The walker change: does `fixOnly` keep the pass's declared plans as they were, and is anything else in the walker that iterates `SCENARIOS` affected?
5. The stage rule: no control or element added, the progress bar kept, no CSS changed, `docs/` untouched, UI-STANDARDS untouched (no rule changes), the digest rules named at close.

Reply with a verdict line first ("Commit", "Commit after the musts below", or "Do not commit"), then numbered points, each marked must or may, each with file:line. Be brief.
