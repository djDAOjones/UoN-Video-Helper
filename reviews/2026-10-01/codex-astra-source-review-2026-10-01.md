# Codex astra source review — 1 October 2026

The source half of VH-104, kept as written. Codex CLI with `gpt-6-astra`, in a
read-only sandbox at commit `46f5b42`, ran independently while Claude walked
the running page; its brief is summarised in [the review](uon-video-helper-ux-review-2026-10-01.md#how-it-was-done).
Only the formatting changed: bold lines that served as headings are headings,
for markdownlint. Every finding here was then re-checked against the browser or
the source, and the review records where each one landed (its
"Disposition" section maps F01–F16 to U-numbers).

---

**The main risks are in transitions and recovery, rather than the five-panel structure.** I found four rank-1 issues and twelve rank-2 issues. The strongest is a discard-confirmation path that can bypass the current trim and device-check gate.

Reviewed source at HEAD `46f5b42`. No files changed, npm scripts or server run, or `samples/` read. This is the source-review contribution; Claude still owns browser evidence, report filing and backlog disposition.

## Findings — ranked most severe first

### F01. Discard confirmation bypasses the current job checks — rank 1

- **Standard:** UI-STANDARDS → Error prevention and recovery; spec §9.1: Create acts on the checked file, range and output choice.
- **Evidence:** `src/main.ts:1317–1320`: `"Discard it and start again"` calls `releaseUnsavedResult()` then `beginJob(file)` directly. Changing Trim sets `jobKeptRange = null` at `src/main.ts:965` without removing that confirmation. `beginJob` reads that value at `src/main.ts:1355` and sends a range only when present at `src/main.ts:1366`.
- **User experience:** After opening the discard question and editing Trim, the user can discard their finished result and start an untrimmed video while the replacement check is pending—or while the trim is invalid.
- **Fix direction:** Invalidate the existing confirmation whenever its selection changes, and make its action pass through the same current-verdict guard as Create.
- **Confidence:** **Verified from source.** Browser reproduction: finish without saving → Create → edit Trim → press the still-present discard action before another verdict arrives.

### F02. The retained result is not identified when another video is chosen — rank 1

- **Standard:** UI-STANDARDS → Recognition over recall, Consistency and Error prevention.
- **Evidence:** `src/main.ts:656–658` preserves and re-renders the previous result after a new selection; its entire identifying summary is `"Finished video — ${formatFileSize(file.size)}."` at `src/main.ts:1505`, followed by `"Save the video"` at `src/main.ts:1536`.
- **User experience:** Under a page now describing video B, the user can save video A without the result panel saying that it belongs to the previous selection.
- **Fix direction:** Identify the retained result locally and explicitly distinguish it from the newly selected video.
- **Confidence:** **Verified from source.**

### F03. A requested animation can silently become a cut — rank 1

- **Standard:** UI-STANDARDS → System status and Recognition over recall; spec §4.3’s selection/result agreement.
- **Evidence:** `src/media/pipeline.ts:352` sets `requestedOrFallback` to `'hard-cut'` when the animation build is unavailable; the explanation is only `log.warn(...)` at lines 353–356. The returned `brandingApplied` records only opening/closing booleans at `src/media/pipeline.ts:738`. `src/main.ts:1512–1517` consequently reports only an entirely missing sequence.
- **User experience:** Someone choosing Fade or Slide can receive a cut while the page still describes their requested animation and announces success.
- **Fix direction:** Preserve the fallback, but report the actual closing treatment beside the finished result before Save.
- **Confidence:** **Verified from source.**

### F04. Successful Save can subsequently be reported as failed — rank 1

- **Standard:** UI-STANDARDS → System status and Error recovery; spec §9.2.
- **Evidence:** `src/main.ts:1589` announces `"Saved."`; lines 1596–1603 clear the retained result and change the button to `"Saved"`. The subsequent cleanup request at line 1604 shares a catch that says `"The video could not be saved. It is still here to try again."` at line 1606.
- **User experience:** If cleanup acknowledgement times out after the file was written, the page falsely reports save failure and offers reassurance about a retry that its disabled Save button cannot provide.
- **Fix direction:** Separate successful delivery from scratch-cleanup failure so cleanup cannot overwrite the save outcome.
- **Confidence:** **Verified from source.**

### F05. Important warnings and recovery details are outside the announcement path — rank 2

- **Standard:** UI-STANDARDS → System status; spec §9.3; WCAG **4.1.3 Status Messages**. Dynamically displayed status warnings need a programmatic announcement route. [W3C guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- **Evidence:** `src/ui/source-panel.ts:223–244` creates an ordinary section containing `"Not carried into the new file"`; `src/ui/warning-text.ts:91–117` similarly creates ordinary warning content. The live source summary at `src/ui/source-panel.ts:206` says only `"Video read. …"`. On completion, `src/main.ts:1394–1398` renders output warnings but announces only `"Your video is ready."`. `renderSourceError` also creates a plain paragraph at `src/ui/source-panel.ts:286–294`.
- **User experience:** A screen-reader user can hear readiness or a generic failure without hearing the lost captions, sound warning, missing branding or specific recovery advice.
- **Fix direction:** Include concise consequential warnings and recovery instructions in the existing live-status announcements without reading the whole page twice.
- **Confidence:** **Verified from source** for the missing announcement wiring; check actual announcement order with a screen reader.

### F06. Startup failure sends novices into technical diagnostics — rank 2

- **Standard:** Spec §10 and §9.2; UI-STANDARDS → Error prevention, Error recovery and user language.
- **Evidence:** `src/main.ts:577`: `"This browser is missing something the tool needs. The system check below says what."`; line 584: `"Background processing did not start. See the system check and the errors below."` The disclosure contains `"Secure context (needed for storage access)"` and `"WebCodecs video encoding"` at lines 410–411. File-input locking at lines 1264–1266 considers only processing and saving.
- **User experience:** A known startup failure leaves file selection available and asks the user to interpret implementation details rather than giving a direct recovery route.
- **Fix direction:** State the specific startup problem and useful next action at Choose, naming Chrome for browser failures and preventing a futile selection when startup is unusable.
- **Confidence:** **Verified from source.**

### F07. Operational errors use the wrong generic recovery — rank 2

- **Standard:** Spec §9.2; UI-STANDARDS → Error prevention and recovery.
- **Evidence:** `src/workers/job.worker.ts:326`: `"Something went wrong while creating the video. Your original file has not been changed."`; line 561: `"Something went wrong checking this file against your device."` Both reach the shared addition at `src/ui/source-panel.ts:292`: `"Your original file has not been changed. You can choose a different one."`
- **User experience:** A device or processing failure tells a lecturer to replace their recording, even when the recording has not been identified as the problem.
- **Fix direction:** Give each known failure class an appropriate recovery, retaining honest uncertainty where the cause is unknown.
- **Confidence:** **Verified from source.**

### F08. The Errors captured panel exposes exceptions instead of explaining their consequences — rank 2

- **Standard:** Spec §9.2; UI-STANDARDS → user language, Minimalist design and System status.
- **Evidence:** `index.html:316`: `"Errors captured"`; `src/main.ts:394–400` renders `"${error.origin} on the ${error.thread} thread"`, the exception message and its stack. The panel at `index.html:315–324` has no live-status role; `"Report this problem"` is its only recovery affordance.
- **User experience:** An unexpected failure can add a technical stack trace without saying whether the job remains usable, whether the original is safe, or what to do before reporting it.
- **Fix direction:** Lead with a concise user-facing consequence and recovery, placing diagnostic detail behind the existing disclosure pattern.
- **Confidence:** **Verified from source.**

### F09. Old readiness and warnings remain after their inputs change — rank 2

- **Standard:** UI-STANDARDS → System status and Recognition over recall.
- **Evidence:** Preset changes hide actions and clear the job values at `src/main.ts:811–817`, but leave the verdict and audio warnings intact. `commitTrim` does likewise at lines 957–968. An invalid trim returns after `"Put the start and end times right in step 2 to continue."`, leaving the old `"Ready to go"` verdict from `src/ui/preflight-panel.ts:18`.
- **User experience:** The page can simultaneously show readiness, outdated estimates or sound warnings, and a message that the current selection cannot proceed.
- **Fix direction:** Withdraw or visibly mark the superseded verdict and warnings until the current selection has been checked.
- **Confidence:** **Verified from source.**

### F10. Progress displays invented precision at both ends — rank 2

- **Standard:** UI-STANDARDS → System status; spec §9.2; Carbon **progress bar**—use indeterminate presentation when measurable progress is unavailable. [Carbon guidance](https://www.carbondesignsystem.com/building-blocks/core/components/progress-bar/guidelines)
- **Evidence:** `src/media/pipeline.ts:317` repeatedly emits `{ stage: 'analysing', fraction: 0 }`; `src/main.ts:1074` always prints a percentage. `src/workers/job.worker.ts:244` emits finishing at `fraction: 1` **before** checking the picture and analysing the finished audio at lines 255–266.
- **User experience:** The user sees audio analysis stuck at 0%, then finishing at 100% while substantial work—and possible failure—remains.
- **Fix direction:** Remove percentages from unmeasured phases and reserve completion for the point at which the result is actually ready.
- **Confidence:** **Verified from source.**

### F11. Cancel does not cover checking or an active streamed save — rank 2

- **Standard:** Spec §9.2, “Cancel is always available”; UI-STANDARDS → User control and freedom.
- **Evidence:** Preflight starts with `"Checking this video against your device…"` at `src/main.ts:729`; Cancel visibility follows only `jobInFlight` at line 1229, and its handler requires `jobCancelId` at line 1459. Saving locks controls at lines 1255–1269, while `src/media/save.ts:128` awaits `file.stream().pipeTo(writable)` without an abort route.
- **User experience:** A long check or save can leave the user waiting with no explicit way to stop that operation, although processing itself is cancellable.
- **Fix direction:** Extend the existing Cancel affordance to these long-running operations with safe cleanup and a clear terminal status.
- **Confidence:** **Verified from source.** Cancelling the native save picker already works; the gap is after streaming begins.

### F12. Mobile detection’s fallback runs in the wrong execution context — rank 2

- **Standard:** Spec §7.3 and §9.4: phones/tablets receive a clear discouragement warning and may acknowledge it.
- **Evidence:** The worker calls `inspectCapabilities()` at `src/workers/job.worker.ts:396`. Its fallback at `src/media/capability.ts:68–71` requires `typeof matchMedia === 'function'` and a coarse pointer; otherwise it returns `'desktop'`. `matchMedia` is a Window API. [API documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia)
- **User experience:** A phone or tablet without a positive `userAgentData.mobile` result can miss the required mobile warning and acknowledgement.
- **Fix direction:** Determine the fallback device characteristics in the main thread and pass the result into the existing capability check.
- **Confidence:** **Needs the browser:** test real supported phones/tablets, especially a device taking the fallback path; desktop viewport resizing alone cannot settle this.

### F13. Editing one trim field can silently erase the other field’s error — rank 2

- **Standard:** UI-STANDARDS → Error prevention and recovery; Recognition over recall.
- **Evidence:** `src/main.ts:830` stores only one `trimFieldProblem`. A valid change to either field sets it to `null` at line 1023; `renderTrim` then rewrites both field values from the last accepted numbers at lines 928–929.
- **User experience:** Entering an invalid start and then a valid end silently replaces the invalid start with its previous value, making the trim appear corrected without the user correcting that boundary.
- **Fix direction:** Retain each field’s pending invalid text and error until that field is corrected or the user explicitly resets the trim.
- **Confidence:** **Verified from source.**

### F14. Some promises ignore the selected trim and branding — rank 2

- **Standard:** UI-STANDARDS → Consistency and System status; spec §9.2.
- **Evidence:** `src/ui/preflight-panel.ts:140–141`: `"it will come out about the same size. The branding and sound levelling are still applied."` This branch checks bitrate capping, not whether most of the recording was trimmed. `src/ui/warning-text.ts:34` promises `"Branding will still be added"` while `src/ui/closing-choice.ts:37` can say `"No University closing will be added."` `src/media/save.ts:166` always suggests `"${trimmed} (branded).mp4"`.
- **User experience:** A trimmed or deliberately unbranded job can be described—and named—as if different choices were made.
- **Fix direction:** Make outcome claims conditional on the actual job, and remove promises that the available context cannot support.
- **Confidence:** **Verified from source.**

### F15. Keyboard focus is not consistently handed on when controls disappear — rank 2

- **Standard:** UI-STANDARDS → logical focus order and User control; WCAG **2.4.3 Focus Order**, subject to browser confirmation. [W3C guidance](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)
- **Evidence:** `"Keep it"` calls `renderResult` at `src/main.ts:1327–1329`, whose first action is `processResult.replaceChildren()` at line 1497; no replacement receives focus. Cancel is disabled on activation at line 1460 and hidden when the job ends at line 1229. By contrast, the explicit focus handovers at lines 1049 and 1184 cover reset and acknowledgement.
- **User experience:** After Keep it or Cancel, a keyboard user may lose their position instead of arriving at Save or the next valid action.
- **Fix direction:** Hand focus to a stable, relevant control when the currently focused control is removed or becomes unavailable.
- **Confidence:** **Needs the browser:** activate these paths using only the keyboard, then inspect focus and the next Tab destination.

### F16. Phone time-entry instructions may request an unavailable character — rank 2

- **Standard:** UI-STANDARDS → contextual guidance and input usability; spec §9.4; WCAG **3.3.2 Labels or Instructions** is the relevant check. [W3C guidance](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)
- **Evidence:** Both time fields use `inputmode="decimal"` at `index.html:125` and `142`, while line 153 instructs `"Minutes and seconds, like 1:05.5."` The parser already accepts plain seconds at `src/ui/trim.ts:36–43`.
- **User experience:** A phone user may be shown a numeric keyboard without a colon while being told to enter a colon-separated time.
- **Fix direction:** Align the keyboard hint and concise instructions with a readily enterable supported format.
- **Confidence:** **Needs the browser:** check the actual keyboards and editing of prefilled times in Chrome on Android and iOS; width emulation is insufficient.

## Copy audit

These are copy candidates, not additional findings. Technical strings inside diagnostic disclosures have lower priority than words on the main journey.

| Evidence and exact wording | Concern / direction |
| --- | --- |
| `src/main.ts:411`: `"WebCodecs video encoding"`; `src/main.ts:410`: `"Secure context (needed for storage access)"` | Implementation vocabulary becomes recovery guidance when startup fails; explain the practical capability or action instead. |
| `src/main.ts:394`: `"${error.origin} on the ${error.thread} thread"` | Runtime terminology in the production error surface; lead with the consequence for the user. |
| `src/main.ts:577`: `"This browser is missing something the tool needs. The system check below says what."` | Vague problem and no direct corrective action. |
| `src/main.ts:584`: `"Background processing did not start. See the system check and the errors below."` | Sends users to diagnostics rather than telling them how to recover. |
| `src/workers/job.worker.ts:561`: `"Something went wrong checking this file against your device."` | No useful cause or next action; the shared “choose a different one” addition may be inappropriate. |
| `src/main.ts:793`: `"The device check did not finish. You can still see what the file is above."` | The second sentence offers information, not a recovery. |
| `src/main.ts:1412`: `"The job did not finish."` | “Job” is internal terminology; neither this nor the shared alternative-file advice explains a timeout recovery. |
| `src/main.ts:1517`: `"The ${missing.join(' and ')} sequence could not be loaded, so it is not in this video. Everything else was applied as asked."` | No next step for obtaining the missing branding; “sequence” also changes the vocabulary used by “Closing branding” and “closing card”. |
| `src/ui/warning-text.ts:47`: `"It measures about ${round(detail['integratedLufs'] ?? Number.NaN)} LUFS"` | Remove the specialist measurement from novice advice; the quiet-recording consequence already explains what matters. |
| `src/ui/warning-text.ts:53`: `"The loudest and quietest parts differ by about ${round(detail['loudnessRangeLu'] ?? Number.NaN)} LU."` | Same issue: a technical unit adds reading effort without informing a permitted decision. |
| `src/ui/warning-text.ts:34`: `"Branding will still be added and the video re-encoded"` | “Re-encoded” is implementation language; the branding promise also conflicts with None. |
| `src/ui/source-panel.ts:180`: `"Levelling needs sound. Branding and re-encoding will still work."` | “Levelling”, “evened out” and “consistent audio levels” describe the same outcome differently. |
| `src/ui/source-panel.ts:143`, `167`, `172`, `194`: `"Video codec"`, `"Audio codec"`, `"Audio sample rate"`, `"Container"` | Technical read-only properties; lower priority because they are disclosed on request, but “Video format”, “Sound format” and fewer rows may serve novices better. |
| `index.html:192`, `200–201`: `"Animation onset"`, `"Over existing"`, `"Over generated freeze frame"` | Specialist/elliptical wording; **these names are explicitly specified in §4.3**, so treat clearer replacements as proposals requiring reconciliation, not an implementation defect. |
| `src/ui/preflight-panel.ts:19`: `"Ready, with one thing to know"` | More than one warning reason can be accumulated at `src/media/preflight.ts:112–128`; remove the count claim. |
| `src/ui/preflight-panel.ts:20`: `"This will work, but it will be slow"` | Overconfident when another line admits an unavailable estimate or possible mobile interruption; describe the recommendation rather than guaranteeing success. |
| `src/ui/preflight-panel.ts:209`: `"This video cannot be processed in this browser."` | Also used for insufficient-storage blocks; attribute the block to its actual cause. |
| `src/ui/preflight-panel.ts:140–141`: `"it will come out about the same size"` | Incorrect implication after substantial trimming; qualify or remove it. |
| `src/media/save.ts:166`: `"${trimmed} (branded).mp4"` | Mislabels the None choice and outputs whose branding failed. |

I found no basis for a blanket sentence-case, label-colon or visible-label/accessibility-name finding. The `?` help button is a symbolic affordance, so its descriptive accessible name is not itself a label mismatch. Native selects and radios should remain native form choices; replacing the colour radios with content-switcher tab semantics would not improve this form.

## VH-97 — should finished stages fold?

**My recommendation is to retain the current default: do not adopt automatic folding on source evidence alone.**

The existing disclosures already hide secondary detail: Video properties (`src/ui/source-panel.ts:252–257`) and System check (`index.html:337–342`). The remaining panels contain the actual decisions and their consequences. Carbon’s accordion guidance supports reducing scrolling for optional content, but cautions against hiding content users need to read in full. [Carbon accordion guidance](https://www.carbondesignsystem.com/building-blocks/core/components/accordion/guidelines)

There is a plausible case for folding **completed setup after Create**, because:

- The preview can occupy `60vh` before its controls (`src/styles/app.css:887–890`).
- The setup controls become disabled during processing (`src/main.ts:1264–1279`).
- Progress and Save remain in the last panel (`index.html:285–312`).

Those facts establish potential redundant scrolling; they do **not** establish that users lose their place.

The ticket’s safeguards remain sound: transitions only on file read, Create and completion; reopening allowed; no folding errors; live regions retained (`pm_skills/project/tickets/VH-97.md:41–54`). Its rejection of advancing on changed controls remains essential (`:58–63`).

Before choosing the port, use Claude’s walkthrough and pilot sessions to establish whether people struggle to find Create, Cancel or Save. Fix the misleading states above first: folding could otherwise conceal their contradictory evidence. Any approved fold must preserve the selected-file identity, trim summary and consequential loss warnings.

## What remains for a person

- **Pilot staff session:** Can a first-time lecturer complete a real Teams recording unaided, understand the two outputs, distinguish Cut from None, and explain what Save will save?
- **Trim understanding:** The player remains a preview of the source; the only `currentTime` uses in the UI are reads for “Set … here” (`src/main.ts:1033`, `1039`). Check whether users expect dragging a boundary to seek or preview only the kept range.
- **Trust and warning comprehension:** Do staff understand caption loss, silence/noise advice, and the difference between “ready” and “saved” without interpreting warnings as refusals?
- **Assistive technology:** Check announcement completeness and frequency, focus after transitions, native player operation, speech-input names and overlapping slider handles.
- **Rendered accessibility:** Confirm contrast, focus appearance, reflow and text-spacing behaviour in both themes and at zoom; source tokens alone do not certify WCAG conformance.
- **Real mobile devices:** Confirm F12 and F16, readable controls, touch precision and warning acknowledgement.
- **Real save/environment behaviour:** Verify picker cancellation, denied permissions, disk failure, fallback download completion, sleep/wake, reload warnings and managed-machine email handoff.
- **VH-97 decision:** Observe actual scrolling, missed actions and mistaken stage assumptions before approving a fold.

Two points are deliberately **set aside**, rather than turned into findings:

- The `target-missed` copy exists at `src/ui/warning-text.ts:69–72`, but I found no production caller of `detectOutputWarning`; the worker instead rejects failed output verification (`src/workers/job.worker.ts:266–273`). Do not count that advisory as a reached UI state or weaken verification to make it reachable.
- The browser-owned video controls are not automatically a 44px-target failure: WCAG **2.5.5** includes an exception for unmodified user-agent controls. Their practical accessibility still needs checking. [W3C criterion](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)

**Handoff:** F01–F16 are proposed review records for Claude to reproduce where indicated, merge with walkthrough findings, and either backlog or explicitly set aside. VH-104 is not closed by this source review alone.
