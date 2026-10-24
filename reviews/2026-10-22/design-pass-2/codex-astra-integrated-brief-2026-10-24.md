# Codex astra brief — VH-176, the integrated check of the second pass's fixes, 2026-10-24

You are checking the second design pass's four fixes together, read-only, in this repository. This is touchpoint 7 of `reviews/2026-10-22/design-pass-2/plan-2026-10-22.md`. Each fix was checked alone before its commit; this check reads them as one change. Do not run the walker or the gate: their results are in the after-run file and below.

The pass's diff is `git diff 76994b8 HEAD`. VH-172's before-run ran on `76994b8`, and no app code changed between it and `392077f`. HEAD is `ec26c49`. The four fix commits are:

- `7f3ea6e` VH-178 (V-46): focus handed on when a transition takes its control away;
- `4e5be61` VH-179 (V-40, V-41, V-42, V-33, V-44): three focus rings, the feedback message's measure, a forced-colour hover;
- `f94f465` VH-180 (V-47): the frame-rate note;
- `ec26c49` VH-181 (V-45): step 4's one name.

Read in full: the app part of the diff, that is `src/`, `index.html`, `UI-STANDARDS.md`, `docs/` and `README.md` (`git diff 76994b8 HEAD -- src index.html UI-STANDARDS.md docs README.md`). Read the rest by summary: the walker in `reviews/2026-10-22/design-pass-2/evidence/measurements/walker/` and the record in `project/`.

Read against it:

- the after-run, `reviews/2026-10-22/design-pass-2/evidence/measurements/after-run-2026-10-24.md`, with `after-manifest-2026-10-24.json` beside it (every record's outcomes before and after, the change groups, the fix plans' run, the transitions);
- the four fix evidence files in the same folder: `vh178-focus-2026-10-23.md`, `vh179-rings-2026-10-23.md`, `vh180-words-2026-10-23.md`, `vh181-name-2026-10-23.md`;
- the before: `matrix-2026-10-23.md`, `six-fix-verification-2026-10-23.md`, `matrix-manifest-2026-10-23.json`;
- the stage rule, in `project/items/VH-176.md`, and the four fix items `project/items/VH-178.md` to `VH-181.md`;
- the report's Disposition table, in `reviews/2026-10-22/design-pass-2/design-pass-2-2026-10-23.md`;
- the decisions for VH-178 to VH-181 and PLAN-7 in `project/decisions.md`.

What the after-run found, in brief:

- `PLANS.priority`, the same 699 keys as VH-172, whole in four parts, on `ec26c49` clean; the fix plans' 162 other records whole after one resume; VH-178's transitions 48 of 48 pass; V-18's six readings unmoved.
- 118 record outcomes changed, none for the worse: focus fail to pass in 110, fail to "cannot determine" in 2 (V-41's handles at the 32 px font, against the painted disc), contrastExtra "cannot determine" to pass in 6 (VH-172's instrument fault).
- 1,724 rows changed, each placed in a fix or named as run to run. Focus records: 559 / 112 / 20 before, 669 / 0 / 22 after.
- One environment event: the OneDrive checkout touched `src/` mid-run and Vite reloaded; the nine records it broke failed and were measured again on resume.
- The working tree also corrects V-18's Disposition row, which named the retired wish line VH-175.1.

Look for, giving file:line:

1. **A regression between fixes.** Does one fix change what another relies on? In particular:
   - VH-179's `.file-input` room (padding, negative margin, wider box) against VH-178's hand-on to the file input, against the drop zone, and at 320 px;
   - the forced-colour hover rule against VH-169's press and the band's rules;
   - VH-181's renamed strings against the closing's other names and VH-180's note in Video properties.
2. **A fix that undoes another, or an earlier phase's.** VH-111 (focus never taken from a reader or the dialogue), VH-124 (the un-boxed chooser), VH-165 (the forced-colour thumbs), VH-167 (the measure), VH-168 (the native chooser), VH-169 (the pressed state).
3. **Strings out of parity.** The three tables (`src/i18n/en-GB.ts`, `zh-Hans.ts`, `ms-MY.ts`) against the filled sheet `reviews/2026-10-18/VH-105-strings-filled.csv`, `src/i18n/sheet.ts`, `index.html`'s fallbacks and the tests.
4. **A stage-rule breach.** Read the after-run's stage-rule table against the commits (`git log -4 --format=%B`), the evidence and the saved Codex replies in `reviews/2026-10-22/design-pass-2/codex-astra-vh17*` and `codex-astra-vh18*`. VH-181's re-check said "Commit after the musts below", and its one must, recording the coverage reduction, was applied in VH-181's decision without a third check: say whether that decision discharges it.
5. **Anything the after-run left unexplained.** Is each change group in its table rightly placed? Are the run-to-run groups (the landscape glyph reading, the hovered button's text, timing words, motion sampling, the feedback message's ring in dark in the fixes run) honestly named, or does one hide a defect?
6. **The after-run's method.** The priority plan again in place of the full matrix, by the owner's standing instruction; the fix plans' extra records run as one; `vh181-rest` not repeated. Is the coverage claim accurate?

Reply with a verdict line first ("Close", "Close after the musts below", or "Do not close"). Then give numbered points, each marked must or may, each with file:line. Mark whether a must needs an app change or only the record or evidence. Be brief.
