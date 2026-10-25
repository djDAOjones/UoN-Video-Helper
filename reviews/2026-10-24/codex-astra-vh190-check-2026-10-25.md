# Codex astra check — VH-190, 2026-10-25

Model `gpt-6-astra`, read-only, on the candidate against 28db91e. The brief is `codex-astra-vh190-brief-2026-10-25.md`.

## First check

Commit after the musts below

1. **Must — AC1 fails after restarting a saved result.** `src/main.ts:2877` clears `savedResultFor` without relabelling. If that job fails or is cancelled, `src/main.ts:3083` reveals Create still labelled “Create the video again”, although no finished result remains. Relabel when clearing the saved state; cover both outcomes.

2. **Must — AC1 also fails when saving a previous result.** Finish A, choose B, then save A. `src/main.ts:3368` clears `unsavedResult`; the predicate at `src/main.ts:2158` rejects saved A because B is selected. The label becomes “Create the video” while A’s finished card remains. The label’s predicate must describe the displayed result, independently of the existing emphasis rule.

3. **May — AC2 is met; the remaining ordinary paths are sound.** The discard guard remains at `src/main.ts:2768`. Keep and ended-early results reach `renderResult()` and its relabel at `src/main.ts:3432`; Discard relabels through `src/main.ts:2853`. Failed, cancelled or refused saves retain the result; fallback downloading keeps the predicate true. File changes relabel at `src/main.ts:1417`, and language changes, including mid-job, at `src/main.ts:3729`.

4. **May — declaration move is safe.** `src/main.ts:2154` initializes `savedResultFor` before the boot call at `src/main.ts:2284`; `fileInput` and `startButton` are already initialized. No pre-existing intervening read depends on its former declaration position. No new temporal-dead-zone risk found.

5. **May — AC3 is supported structurally, but speech timing is unverified.** `src/main.ts:2282` changes only the existing button’s text, preserving focus. Its container at `index.html:642` has no live-region ancestor, and relabelling makes no announcement call. An accessibility-tree snapshot does not establish what a screen reader actually speaks when an already-focused button changes name.

6. **May — AC4 is met on inspection and the supplied green gate.** English is exactly B8 (`src/i18n/en-GB.ts:396`). Chinese (`src/i18n/zh-Hans.ts:335`) and Malay (`src/i18n/ms-MY.ts:350`) mean creating again and match their ended-early wording. `reviews/2026-10-18/VH-105-strings-filled.csv:203` matches `sheetRows()`’s key, English, Step 6 location and note; drafts are marked. Only that CSV row and one entry per translated table changed; no key or test was removed.

7. **Must — strengthen the walker’s pass conditions.** `reviews/2026-10-22/design-pass-2/evidence/measurements/walker/again-190.mjs:100` never checks `before.lang` or `after.lang` against the requested language: a failed Chinese/Malay switch can pass entirely in English. Add those assertions and the two failing sequences above. Also, `:40` checks only horizontal self-overflow, missing vertical/ancestor clipping; `:120` does not prove the saved result remains displayed; `:127` exits successfully even with failed records.

8. **Must — AC5 remains a close condition** (`project/items/VH-190.md:13`). Attach the separately gathered Chrome evidence, name the applied digest rules—Nielsen 1/4/8 fit—and include `Checked:` and the supplied gate result in the commit: 1544 passed, one inherited EBU skip. I ran neither walker nor gate and changed nothing.

## Re-check, after musts 1, 2 (the owner's choice A) and 7

Commit after the musts below

1. **Must — 7 is not fully met.** `again-190.mjs:165` can pass its “saved previous video” case after a failed or cancelled save: `walk.mjs:575` accepts any settled save message, and the remaining predicates also hold while unsaved. Assert that Save reads `create.saved` and is disabled; also assert secondary before saving and primary afterwards. The added language, result-standing, clipping and non-zero-exit checks are present.

2. **May — 1 is met.** `src/main.ts:2887–2893` clears saved-result identity and refreshes label/emphasis before processing. Failure or cancellation therefore returns **“Create the video”**, primary.

3. **May — 2 is met; no further label defect found.** `src/main.ts:2165` separates source matching from the unchanged emphasis rule at `2157`. Keep rerenders and relabels (`2836`, `3445`); failed saves retain the source (`3410`); language changes relabel (`3742`). Same-file reselection follows the result heading’s existing **File-object identity** (`3258`): a fresh object yields “Previous video” and “Create the video” consistently.

4. **May — update the translator note.** `src/i18n/sheet.ts:453` and the filled CSV’s `create.again` row still say any finished video; narrow that description to the chosen file’s result.

Read-only review against `28db91e`; walker and gate not run.

## What was done with the re-check

Must 1: the walker proves each save went, the result's button reading `create.saved`, disabled, and the `previous` flow checks Create secondary before the save and primary after. The nine flows were re-run, 9 of 9. May 4 was taken: the translator note for `create.again` now says the chosen file's video, never a previous one.
