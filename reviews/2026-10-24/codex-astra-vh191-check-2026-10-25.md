# Codex astra check — VH-191, 2026-10-25

Model `gpt-6-astra`, read-only, on the candidate against 330a7ad. The brief is `codex-astra-vh191-brief-2026-10-25.md`.

## Check

Commit after the musts below

1. **Must — strengthen the walker’s result-language assertion.** `reviews/2026-10-22/design-pass-2/evidence/measurements/walker/lang-191.mjs:185` checks only the prefix before `{language}`. A result saying “Video language: English.” would pass when Chinese was picked. Assert the complete sentence with the expected language name, and its absence when the job’s language equals the page’s. Also exercise a page-language change during an unpicked, locked job: the displayed choice should follow the page, while the progress and result retain the language captured at job start.

2. **Must — complete the acceptance evidence and close before committing.** Against `project/items/VH-191.md:9`:

   | Criterion | Assessment |
   | --- | --- |
   | Owner’s Q4 choice quoted at close | **Not yet met:** no VH-191 close is present. Include the recorded Q4 answer and the precise placement choice A. |
   | Placement, B9 wording, persistence, following, locking and job record | **Met by source inspection.** The external flows support persistence and processing behaviour; strengthen their identity assertion as above. |
   | No added control; label, name and keyboard behaviour preserved | **Met.** The existing fieldset moves; native radios retain their names and labels. |
   | Exact S19; specification within 8,100 words | **Met in the candidate:** 8,047 words. Commit inclusion remains outstanding. |
   | Approved English, marked translation drafts, complete key migration, green table tests | **Content requirements met.** Table-test success was not supplied to this review. |
   | Chrome matrix, gate, digest citation and review recorded | **Partly met.** The newly supplied evidence records 36 matrix cases and three flows passing. Record the external gate result, digest rules and required `Checked:` line at close. |

   The changed tests replace obsolete placement expectations with the approved behaviour; I found no test skipped to accommodate the change.

3. **Should — remove the remaining stale placement and locking comments.** These still describe the old arrangement:

   - `src/styles/app.css:1202`: Video language “under” Video type.
   - `src/ui/result-summary.ts:188`: “neither switch is locked”.
   - `index.html:611`, `src/main.ts:2963` and `src/i18n/en-GB.ts:574`: the video switches above remain live or may change.

   No remaining `videoLanguage.nextVideo` reference or `#video-next` inside `#video-language` was found in the requested scope. The remaining “above Step 1” and “never locked” descriptions of **Video type** are correct. README, the specification, UI-STANDARDS and architecture contain no further placement correction needed for this move.

4. **May — retain the lock implementation.** `src/main.ts:2440` assigns both fieldsets from the same `locked` value, with no competing assignments. Job completion, cancellation and failure release through `setJobInFlight(false)`; save outcomes release through `setSaveInFlight(false)`, including its `finally`. Start-up settlement uses the same function; neither fieldset independently locks for a pending start-up check, and step 3 is initially hidden.

   I found no new focus-stranding path: Create/Discard starts synchronously and hands focus to Cancel; Save locks synchronously and hands focus to Stop saving. A blocking pre-flight already captures focus within the whole withdrawn step, which now includes Video language.

   Following Page language while disabled is **acceptable and required by the retained “until picked” contract**, not a must-fix. `src/main.ts:3735` repaints the selection and automatic date, while the job uses its captured `wordsLanguage` and record.

5. **May — retain the accessibility structure.** `index.html:246` gives step 3 its `h2`, followed at runtime by the lock note and two sibling fieldsets. The visible Video language legend names its group; it need not become another heading. Native keyboard order reaches its radio group before the title-card controls.

   Video type still describes itself through `video-kind-result video-next`; Video language describes itself through its helper alone. The next-video text therefore remains available on Video type without the stale description on Video language. Actual screen-reader announcement remains a person’s check, as the supplied evidence acknowledges.

6. **May — retain the specification correction unchanged.** `docs/01-specification.md:587` matches S19 exactly after normalising line wrapping. The only specification change is that replacement. The later step-3 date behaviour, job-record wording and §10 remain compatible; no further correction is needed for Video language’s placement or lock.

7. **May — retain the translations and filled-sheet changes.** `src/i18n/zh-Hans.ts:67` and `src/i18n/ms-MY.ts:68` preserve the intended sense and existing terminology: 标题卡 / kad tajuk, 结尾图形 / grafik penutup, 视频类型 / jenis video.

   Read-only comparisons confirmed that all five changed CSV rows match `sheetRows()` in key, location, English and notes. Both complete translated tables match regeneration from the filled sheet, with no missing translation. The old key is removed throughout, draft markings are present, and no unrelated CSV row changed.

8. **Should — tighten the walker’s other claims.** In `reviews/2026-10-22/design-pass-2/evidence/measurements/walker/lang-191.mjs:52`, dimensions are rounded before testing the 44 px minimum, so 43.6 px passes. Compare raw dimensions. The placement predicate also accepts a missing lock note through `!note`, and accessibility checks inspect radio names but not the fieldset’s accessible name/description. Directly focusing the radio and pressing ArrowRight does not prove the surrounding Tab order. Save, cancel and failure paths are not exercised by this walker; its report should distinguish source-traced coverage from browser-observed coverage.

Digest rules applied: Carbon’s existing component/token reuse; Nielsen 4, 5 and 8; WCAG keyboard and target-size requirements; house conventions’ invariant-focused testing.

Read-only review against `330a7ad`. I changed no files and ran neither the walker nor the gate.

## What the build did with it

- Must 1: the walker now asserts the result's whole `result.videoLanguage` sentence with the picked language's own name. A new flow, `unpicked`, runs an unpicked job on the 30-second fixture and changes the page language while the job runs. The shown choice follows the page, still disabled, while the progress line keeps the job's starting language. The result names that language in full on the other page and names none back on the job's own page.
- Must 2, the close: this item's decision quotes the owner's Q4 answer and his placement choice A. It is followed by the trajectory line, the backlog strike, the item file, and the commit's `Verify:` and `Checked:` lines.
- Should 3: the five stale comments now say that Video type stays live and that Video language, locked with step 3, follows the page's language until picked: `app.css`, `result-summary.ts`, `index.html`'s `#process-job`, `main.ts` beside it, and `en-GB.ts`'s `progress.job`.
- Should 8: the walker compares raw target sizes with 44 px, and requires step 3's lock note to sit before the group. It also reads the group's own accessible name (its legend) and description (its helper) from Chrome's tree. The flow saves, and an observer records that the group was disabled during the save and freed after it. The walker's header separates what the browser observed from what was traced in source only: the release on a cancel or a failure, and the Tab order.
