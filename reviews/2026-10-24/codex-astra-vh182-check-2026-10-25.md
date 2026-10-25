# Codex astra check — VH-182, 2026-10-25

Model `gpt-6-astra`, read-only, on the candidate against 773f479 (56fb631 plus a records-only PLAN-8 commit). The brief is `codex-astra-vh182-brief-2026-10-25.md`.

## Check

Commit after the musts below

1. **Must — Complete the VH-182 close.** The implementation meets acceptance criteria 1–8. Criterion 9 still needs the close record: VH-182 remains open at `project/backlog.md:40`. Record the outcome, applied digest rules, supplied gate result (**1546 passed; the existing EBU skip unchanged**), and this review in the commit’s `Checked:` line. Retire VH-160.1 as required by the item. This is a record requirement; I found no blocking application defect.

2. **Should — Tighten the walker’s destination check.** At `reviews/2026-10-22/design-pass-2/evidence/measurements/walker/footer-182.mjs:77`, `startsWith()` accepts any Teams team and accepts extra path, query or hostname suffixes on Self Service. Compare complete, normalised URLs against the approved destinations. The current application and recorded URLs are correct; the assertion is weaker than the evidence report claims.

3. **Should — Address the walker’s accessibility blind spots.** At `footer-182.mjs:60`, `box.querySelectorAll()` excludes `.footer-help` itself, so adding a landmark role to that container would pass. At lines 50 and 80, it checks `textContent` and height, but not accessible names or target width. An overriding `aria-labelledby` or a narrow target can therefore pass. Check the container too, both target dimensions, and accessible names. At line 144, `requestSubmit()` also bypasses the actual **Open email app** button; activating that button would test its wiring.

4. **Should — Correct the remaining static recipient description.** `index.html:857` still says “Your message goes to the maintainer”. The running application replaces it with the correct address at `src/main.ts:3461`, so this is stale fallback text, not a live routing defect. The accessibility-config comment and feedback-test description were corrected during this review.

5. **May — Retain the implementation; acceptance audit follows.** Criteria are numbered in their order in `project/items/VH-182.md:9`.

   | Criterion | Assessment |
   |---|---|
   | 1. Approved grouping and persistent routes | **Met.** `index.html:821` has the approved heading, questions and route order. No disclosure, panel or Video-type dependency was added. |
   | 2. Remove learning-content route | **Met.** Its link, handler, constant and translation keys are gone. The Creators note is updated at `src/i18n/sheet.ts:504`; assertions change at `test/screen-text.test.ts:488`. |
   | 3. Self Service | **Met.** Config supplies the HTTPS address; `src/main.ts:3653` applies `_blank` and `noopener noreferrer`; `README.md:37` documents it. |
   | 4. Recipient and statement | **Met.** `src/config/feedback.ts:15` supplies the team address, inherited by the statement. All three contact sentences name the team; Joe Bell remains the reviewer and translation recipient. |
   | 5. Rename button and errors | **Met.** Both dialog labels and all five errors use the approved name. The subject changes; “Report this problem” remains. |
   | 6. Independent link names | **Met.** Each anchor contains its destination and new-tab wording; the questions are separate headings (`index.html:822`). |
   | 7. Specification | **Met in the candidate.** `docs/01-specification.md:679` and `:806` contain exactly S22 and S24, ignoring wrapping. **8,045 words**, within 8,100. |
   | 8. Translation pipeline | **Met.** All 29 changed CSV rows match `sheetRows()` in every metadata field. Both translated tables exactly match regeneration from the filled sheet. All 15 new or changed translation rows are marked as agent drafts. |
   | 9. Verification and close | **Browser evidence met; close pending.** The supplied JSON contains 36 passing matrix cases and three passing email flows. Gate success is supplied by the brief; record requirements remain under point 1. |

6. **May — No further wording or accessibility correction found.** The new `h2` is a peer of the two disclosure headings, with three subordinate `h3`s; the unlabelled `div` adds no landmark. Recorded targets are at least **44 px high and 106 px wide**, with **14.31:1** minimum measured heading/link contrast outside forced colours. The supplied 320 px screenshot shows readable wrapping.

   Chinese **报告问题** and Malay **Laporkan masalah** match their button names in all five errors. New-tab wording matches the existing enforcement link; team terminology is retained consistently (`zh-Hans.ts:775, 780, 825`; `ms-MY.ts:826, 832, 879`). I found no wrong sense requiring correction. Applicable digest rules: WCAG **2.4.9, 2.4.10 and 2.5.5**, Carbon’s existing typography/spacing roles, and Nielsen **6 and 10**.

7. **May — Scope and residual-reference checks are clear.** No obsolete “Send feedback”, removed key, constant or handler remains in the requested source/document scope except intentional negative assertions in tests. The spec’s remaining “maintainer” sentence concerns the response promise, not the recipient; no additional contact contradiction was found. No unrelated CSV row changed.

   Reviewed the working tree against `773f479`; the intervening commit after `56fb631` changes project records only. No files were edited, and neither the walker nor gate was run, as instructed.

## What was done with the check

- Must 1, the close: this item's decision, trajectory line and backlog strike, and the commit's `Verify:` and `Checked:` lines. VH-160.1 was already retired by PLAN-8 ("promoted to VH-182"), so no wish line is open to retire.
- Should 2: the walker compares each link's resolved `href` with the whole approved URL.
- Should 3: the walker checks the container itself (a `div` with no role or label), each target's width as well as its height, that no route is named by `aria-label`, `aria-labelledby`, `title` or `role`, and each route's accessible name from Chrome's tree against its key; the flow presses the real Open email app button. Re-run: 39 of 39.
- Should 4: the dialog's no-script intro says "the learning content team", not "the maintainer"; the gate re-ran green.
