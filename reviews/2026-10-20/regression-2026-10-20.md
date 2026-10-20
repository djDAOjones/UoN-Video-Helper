# Regression table — 20 October 2026

Every finding of 1 October and every VH-124 state, judged on the live page at
`d38ee79`. **Holds** — the remedy or the accepted disposition still stands.
**Regressed** — a resolved principle is broken again. **Partly** — the
remedy is incomplete, or its evidence still needs a person. **Superseded** —
the state or the requirement no longer exists in that form. Evidence names a
capture under the walker's output (copied to `evidence/` where a finding
cites it), a source line, or a decision.

## U-01 to U-25 (VH-104)

| ID | Judgement | Evidence |
| --- | --- | --- |
| U-01 A Teams recording fails at the last step | holds | An unlevellable plan is refused before the encode (`src/media/pipeline.ts`, `src/workers/job.worker.ts`); the Teams recording itself was not run here (no sample is used), and its sound by ear is a wish line (VH-106). |
| U-02 Discard outlives its question | holds | Every change withdraws the question and its spoken words; VH-135's Chrome check of 2026-10-20 reproduced it; `withdrawDiscardQuestion` in `src/main.ts`. Not re-run here. |
| U-03 The previous video's Save under the next | holds | `v05-previous-video-record.png`: "Previous video — 21.5 MB" with its record, under the new file's verdict. |
| U-04 Ready outlives the facts | partly | The verdict is withdrawn when a job starts (`held-running.png`) and when a trim changes (`10-check-after-trim`); a storage block stays while its re-check runs (source `src/main.ts:1494-1500`): V-14. |
| U-05 A blocked file offered every step | holds | `held-blocked-file.png`: the block beside Choose, steps 2–6 withdrawn, "Export it again as an MP4" for someone already in Chrome. |
| U-06 Failures give the wrong next step | holds | `36-unreadable`: what happened, the original safe, what next. The failed-job state could not be reached with a fixture (see V-01); its words are read in `src/ui/failure-text.ts`. |
| U-07 0% then 100% too soon | holds | "Analysing audio" shows no percentage; the encode shows one and is capped at 0.98 (`src/media/pipeline.ts:650`); "Finishing the file" and "Checking the file" are stages; "Your video is ready." is the end (`27-finished.json`). Codex astra's "partly" is corrected by the cap. |
| U-08 Every percent announced | holds | The job speaks its stages, three milestones and the outcome (`27-finished.json`); "Announce progress" postpones the routine ones. |
| U-09 Focus dropped at Create, Cancel and finish | holds | Focus to Cancel at start, to Create after a cancel, to the result at finish, to the question, back after Keep it, to Stop saving (`activeElement` in `23`, `26`, `27`, `28`, `29`, `30`). |
| U-10 What would change the mind is not announced | partly | Losses are in the read announcement (`39-captioned`), sound notes in the verdict's (`38-silent`, `40-quiet`); the Errors captured panel's reveal is not announced (`45-errors-captured.json`, empty live log) and nor is a preview that cannot play (source): V-11. |
| U-11 Forced colours lose the slider and the colour choice | holds | `held-focus-start-handle-forced.png`, `held-focus-colour-white-forced.png`, `held-switchers-focused-forced.png`: thumbs, fill and chosen segments in `Highlight`. Emulated; a real Windows theme is the owner's. |
| U-12 Swatches like checkboxes; disabled looks live | regressed | The swatches and the disabled selects and inputs hold; the new Student ID box keeps its live fill and solid edge while locked: V-03. |
| U-13 Two primary buttons | holds | `held-finished.png`: Save filled inside the result, Create outlined below. |
| U-14 A chosen Fade can become a cut | holds | `closingOutcomeText` in `src/ui/result-summary.ts` names a fallback; not reproducible with the clips loading. |
| U-15 Saved overwritten by a clean-up failure | holds | Delivery and clean-up handled apart (`src/main.ts:3117`, `:3145`). Source. |
| U-16 The phone warning can miss iPhones | holds | The class is decided on the main thread (`src/main.ts:1047`); the emulated phone got its verdict (`held-phone-discouraged.png`). Real devices are VH-113's. |
| U-17 A bad time silently reverts | holds | `held-trim-invalid.png`: "abc" kept with its error beside the field; the no-revert rule in `src/main.ts:1589`. |
| U-18 No Cancel for the check or the save | holds | `held-check-stopped.png` ("Check stopped." with Check again); `30-saving` (Stop saving). |
| U-19 The phone verdict overpromises | holds | `held-phone-discouraged.png`: "This may not finish on a phone or tablet" leads; "Continue anyway" outlined; no drop hint on touch (`phone/01-empty.txt`). |
| U-20 The phone keyboard cannot type the format | holds | "Minutes and seconds, like 1:05.5, or seconds, like 65.5."; `inputmode="decimal"`. The ID box's numeric keyboard is a person's check. |
| U-21 Locked steps do not say why | holds | "Locked while your video is being made." in steps 2–5 (`23-running.txt`). |
| U-22 Estimates to the second; a silent tab | holds | "This should take about 4 minutes."; titles "Encoding video — …", "Ready — …", "Cancelled — …" (`titles` in the JSON files). |
| U-23 Words a novice does not use | regressed in Chinese | English holds ("This recording is very quiet", no units); the Chinese page heads step 6 "创造" and labels its button "制作视频", and two save messages promise viewing: V-09. |
| U-24 Claims the job does not make | partly | The record is conditional ("no University closing", `closings/none-finished.txt`); the Chinese save messages claim a viewing the page does not offer: V-09. |
| U-25 Said twice, then nothing | holds | The verdict is spoken only (`07-ready.txt` has no "Device check complete"); "Saved. Check it where you saved it, then upload it … or choose another video in step 1." |

## A-01 to A-20 (the spec gap review)

| ID | Judgement | Evidence |
| --- | --- | --- |
| A-01 §9.3 promised less than the rulebook | holds | §9.3 as it stands: AAA by default, each exception with four fields. |
| A-02 No accessibility acceptance criterion | holds | §13 criterion 10; its walk is still the owner's to run (VH-M4, VH-137). |
| A-03 What keeps a job alive, what survives a reload | holds | "Keep this tab visible and your computer awake … Closing the tab ends the job." at every start; the lifetime line before Create and beside the result; the download's own lifetime (`held-phone-download.png`). |
| A-04 After Save, and the two routes | partly | Both routes end in their own sentence with what next; after a download, Keep it re-renders the result with "until you save it" under a save line saying "until you start another one": V-04. |
| A-05 A result needs its own choices | partly | File, part kept, output and closing are in the record and fixed; the title card is "a 5-second title card" whatever its kind, and the video language shows only through the quoted closing words: V-05. |
| A-06 Three live regions; 2.2.4 is consent | partly | The trim and closing result lines are read on demand, not announced (walk logs show no entry for them); "Announce progress" is the 2.2.4 control; the visible auto-updates' 2.2.2 position is unrecorded (WCAG table). |
| A-07 Focus handed on, never taken | holds | Finish moved focus to the result only from Cancel, which the finish removed (`27-finished.json`). |
| A-08 Running text long; enlargement and reflow unchecked | partly | Measured here: 65 characters at most in English and Malay, no overflow at 320 px, 200% or under spacing overrides, in every state and language; the Chinese 40-glyph measure is still a person's (VH-105's wish line); no gate holds any of it. |
| A-09 Focus appearance unwritten and unmeasured | partly | The rule is in UI-STANDARDS; measured here on 18 controls in three themes (`focus-rings/rings.json`); no test holds it. |
| A-10 Plain language unmeasured | partly | The English gate; the translations unreviewed, and V-09 a meaning error. |
| A-11 Every trim change re-runs the analysis | partly | The re-check shows "Checking…" with Stop (`held-check-stopped.png`); the bound is still untimed (§7.1 says so). |
| A-12 The browser line promises what it cannot | holds | "and this browser has passed the checks for it"; the blocked file's remedy fits its cause. |
| A-13 Feedback absent from the spec | holds | §9.2 carries it; "Send feedback" on every state, in the running state too (`23-running.txt`). |
| A-14 The caption warning stops short | partly | Detected captions get the EchoVideo guidance (`held-captioned.png`); the unscanned-container warning stops at "will not be carried over" (`src/i18n/en-GB.ts`, Codex astra). |
| A-15 The preview is content the page does not control | holds | §9.3 records it; the statement names captions and flashing but not descriptions (WCAG table, statement check). |
| A-16 Errors said, not placed | holds | §9.2 carries it; every error seen sat beside its control. |
| A-17 The language switch as a transition | partly | Segments carry their own `lang`; the switch is announced ("Page language: 简体中文."); state survives (`zh-sub-*`); the feedback dialog's translated line sits in the English block: V-08. |
| A-18 The trim keys do not scale | partly | Page keys still 10 s; a wish line stands. |
| A-19 The preview plays the original, unsaid | holds | Step 2's intro says it (`07-ready.txt`). |
| A-20 "size" in the feedback dialog | holds | "your video's length, picture size and format" (`04-feedback.txt`). |

## VH-124's states, 01 to 29

| State | Judgement | Evidence |
| --- | --- | --- |
| 01 Empty | partly | One filled chooser, no resting status, the promises capitalised (`held-empty.png`); the lede's lead-in is still parked; the page now opens with three switchers above the title's steps (1,531 px tall, 951 on 1 October). Startup pending is unexplained beside the disabled chooser: V-16. |
| 02 Drag held | holds | `02-drag-held`: the zone solid with "Let go to read this video." |
| 03 Drop refused | holds | `03-drop-refused`: "That is not a video file…" in place. |
| 04 Feedback | partly | `held-feedback.png`: the dialog, its Tab cycle closed; the translated guidance line is V-08. |
| 05 Errors captured | partly | `v11-errors-captured-unannounced.png`: the notification component; its reveal unannounced (V-11) and two names for reporting (V-13). |
| 06 Reading | holds | `05-reading`: "Reading the video…" at Choose. |
| 07 Checking | holds | `06-checking`: "Checking this video against your device…" with Stop the check. |
| 08 Ready | holds | `held-ready.png`: the verdict as a notification, one filled Create, the lifetime line, the verdict spoken only. |
| 09 Help open | partly | `held-help-open.png`: in flow; its Tab dismissal and warning-like rail are still a wish line. |
| 10 Trim invalid | holds | `held-trim-invalid.png`: the error beside its field; step 6 says "Put the start and end times right in step 2 to continue." |
| 11 Check after trim | partly | `10-check-after-trim`: the verdict withdrawn; a storage block would stay: V-14. |
| 12 Check stopped | holds | `held-check-stopped.png`: "Check stopped." and Check again, focus on Check again. |
| 13 Discouraged | holds | `held-phone-discouraged.png`: the risk leads, "Continue anyway" outlined. |
| 14 Running | partly | `held-running.png`: no verdict, no Create, the bar and stage then Cancel; the switches above still change the next job with no word that they do: V-06. |
| 15 Cancelling | partly | "Cancelling…" then "Cancelled." 9 ms apart here; the stage line, bar, time left and title can still move in that window (source): V-15. |
| 16 Cancelled | holds | `26-cancelled`: the sentence, Create back with focus. |
| 17 Ready with sound notes | holds | `40-quiet`, `38-silent`: one notification each, the reassurance line, spoken with the verdict. V-12 is the new damage note's heading. |
| 18 Finished | partly | `held-finished.png`: the result leads with its record and Save; the record cannot tell the new card kinds apart: V-05. |
| 19 Discard question | holds, carrying V-05 | `held-discard-question.png`: danger Discard, Keep it, focus on the question, spoken once. |
| 20 Saving | holds | `30-saving`: "Saving…" on its own line, Stop saving, focus on it. |
| 21 Saved | holds | `held-saved.png`: "Saved. Check it where you saved it …", the button spent. |
| 22 Previous video | holds | `v05-previous-video-record.png`. |
| 23 Download handed off | partly | `held-phone-download.png`: the destination and uncertainty; the result's lifetime reverts after Keep it: V-04. |
| 24 Blocked file | holds | `held-blocked-file.png`: once in the box, spoken once. |
| 25 Unreadable | holds | `36-unreadable`: the failure box; status spoken only. |
| 26 Too short | holds | `37-too-short`: trim disabled with its reason. |
| 27 Silent | holds | `38-silent`: "This video has no sound" with the publishing check. |
| 28 Storage block | partly | Not reproducible here (the worker's estimate); the old refusal stays until a re-check passes (source): V-14. |
| 29 Failed | partly | Not reached with a fixture (the cut-short file produced a video instead: V-01); the failure words are read in source; the settling window's locks are as 1 October left them. |
