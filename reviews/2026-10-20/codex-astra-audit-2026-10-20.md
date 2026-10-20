# Codex astra — the page audited again, 20 October 2026

The independent source half of the audit in
[uon-video-helper-audit-2026-10-20.md](uon-video-helper-audit-2026-10-20.md),
by Codex astra (`gpt-6-astra`, read-only, blind from the same brief, run while
the live walk ran), kept as written. Its C-numbers map to V-numbers in that
report; its regression, state and criterion tables were each checked against
the live page and are adopted or corrected there. Only this heading was added.

---

## UoN Video Helper — the page audited again

Read-only source audit of `d38ee79`, 20 October 2026.

## 1. Verdict

The page is substantially clearer than the one first audited on 1 October: failures have useful remedies, progress has named stages, Save has its own status line, and the original file and retained result are protected more carefully. The new features nevertheless introduce an important gap in result identity, unexplained differences between editable choices and the job already running, missing instructions in the submission form, and defects in translated content. Several previously identified transition problems also remain. I would keep VH-124 awaiting sign-off and would not treat this source review as evidence of complete AA or AAA conformance. The remaining work includes both source corrections and the already required human walk. Sources: `src/main.ts:1411`, `src/main.ts:2727`, `src/main.ts:2971`, `src/ui/progress.ts:110`, `project/backlog.md:23`, `docs/01-specification.md:831`.

## 2. Findings

This repeats the October method: walk from Choose to Save as a first-time member of staff; examine the whole page in each state; ask what is on screen, what the person should do, what competes, what repeats and what should change. The reference widths remain desktop 1280 × 900, phone 390 × 844, and 320 CSS pixels for reflow. This time the walk is **from source only**, across English, Simplified Chinese and Bahasa Malaysia, both video types, title-card states and every closing configuration. I did not run the app, build or tests, inspect anything outside this repository, or change files. Rendered fit, native controls, actual announcements and perceived hierarchy remain browser or human judgements. Method sources: `reviews/2026-10-01/uon-video-helper-ux-review-2026-10-01.md:25`, `reviews/2026-10-01/vh-124/README.md:16`.

The ranks are unchanged:

- **1:** a novice is blocked, misled, or could lose work or trust.
- **2:** real friction, or a breach of a named standard.
- **3:** polish.

The standards remain the specification, the named headings in `UI-STANDARDS.md`, Carbon’s component, productive-style and token rules, Nielsen’s ten heuristics, and WCAG 2.2 A–AAA. Carbon’s AA defaults do not lower this project’s AAA requirement. Sources: `project/profile.md:33`, `project/digests/carbon.md:18`, `project/digests/carbon.md:29`, `project/digests/nielsen.md:17`, `docs/01-specification.md:675`.

### C-01 — The finished record cannot distinguish the new kinds of card

**Saw:** The result says “a 5-second title card” for both a staff card and a submission card. Its record stores only `titleCard: boolean`. Although it stores the video language, that language affects the summary only when it supplies the quoted Internal use only closing. With **None**, two submission videos with different languages can have the same visible record. A staff card and a submission card can also be described identically.

This reopens A-05’s problem for the new choices: the controls can change while an older result remains, but the result does not carry enough visible identity to distinguish those versions.

**Standard:** Spec §9.1, the immutable result and discard summary; UI-STANDARDS **Recognition over recall**; Nielsen 6, **Recognition rather than recall**.

**Direction:** Record and show the card kind and the video language alongside the existing job facts. Keep the prohibition on copying the card’s private words into the record.

**Source:** `src/ui/result-summary.ts:29`, `src/ui/result-summary.ts:71`, `src/ui/result-summary.ts:114`, `src/main.ts:2727`, `src/main.ts:3015`, `src/i18n/en-GB.ts:435`; standard: `docs/01-specification.md:626`, `UI-STANDARDS.md:158`.

**Rank:** 1.

### C-02 — The two video switches change the page without saying which job they affect

**Saw:** “Video type” and “Video language” remain usable during creation and saving. Changing them immediately changes Step 3 and the closing explanation. The running job retains its original choices. The visible helper says only: “Words the app adds to your video are in this language.”

The distinction between this job and the next job is explained in code comments, but not beside the controls. A novice can change to Student submission, see its locked title card, and reasonably expect the current output to contain it.

**Standard:** UI-STANDARDS **System status** and **Recognition over recall**; Nielsen 1, **Visibility of system status**, and 6, **Recognition rather than recall**. Spec §9.1 explicitly permits these switches to remain available, so locking them is not the remedy.

**Direction:** While a job or retained result exists, say beside these choices that changes apply to the next video made. Identify the current job’s type and language with its progress/result.

**Source:** `src/main.ts:604`, `src/main.ts:620`, `src/main.ts:646`, `src/main.ts:2704`, `src/i18n/en-GB.ts:97`, `src/i18n/en-GB.ts:109`; standards: `docs/01-specification.md:578`, `UI-STANDARDS.md:117`, `UI-STANDARDS.md:158`.

**Rank:** 2.

### C-03 — Step 3 does not state its different completion rules before refusing Create

**Saw:** Staff see “Title”, “Department”, “Authors” and “Date”, without being told that the fields are individually optional. Submission users see four fields without a visible “all fields required” instruction or required-state markup. The three text fields are checked for emptiness only when Create is pressed. “A student submission always has a title card” explains the locked checkbox, not the compulsory fields.

The ID helper is useful and specific; the other completion rules should be equally discoverable.

**Standard:** WCAG **3.3.2 Labels or Instructions — A**; UI-STANDARDS **Content and form**, **Error prevention and recovery**, and **Understandable**; Nielsen 5, **Error prevention**.

**Direction:** State the staff rule beside the fields: use any fields, with at least one needed when the card is on. State that all submission fields are required, and expose their required state programmatically.

**Source:** `index.html:243`, `index.html:258`, `index.html:304`, `index.html:351`, `src/ui/title-card-step.ts:224`, `src/main.ts:2427`, `src/main.ts:2482`, `src/i18n/en-GB.ts:232`; standards: `UI-STANDARDS.md:106`, `UI-STANDARDS.md:150`, `UI-STANDARDS.md:255`.

**Rank:** 2.

### C-04 — The new Student ID box misses the disabled-field treatment

**Saw:** During creation or saving, the title-card fieldset is disabled and the step says “Locked while your video is being made” or saved. The neighbouring text inputs lose their fill and acquire a dashed edge. The Student ID `textarea` retains the authored live-field background and solid border: the disabled selector covers `.select` and `.text-input`, but not `.textarea`.

This is a source-established omission in the house treatment. Its precise appearance still needs checking in Chrome and forced colours.

**Standard:** UI-STANDARDS **Operable**: “Disabled reads as disabled at a glance: a field or segment loses its fill and takes a dashed edge”; Carbon interaction-state consistency.

**Direction:** Apply the same disabled-field treatment to the submission textarea, retaining readable text and the existing lock explanation.

**Source:** `index.html:352`, `src/main.ts:2256`, `src/styles/app.css:991`, `src/styles/app.css:1451`; standard: `UI-STANDARDS.md:245`, `project/digests/carbon.md:36`.

**Rank:** 2.

### C-05 — Translated feedback guidance is marked as English

**Saw:** When email cannot carry every diagnostic line, the disclosure inserts the translated sentence equivalent to “Too long for the email, so only in ‘Copy message and details’”. That sentence is inserted as plain text into the same `<pre lang="en-GB">` as the English diagnostics.

On the Chinese and Malay pages, the guidance therefore has the wrong programmatic language. The surrounding page language does not override the explicit English declaration.

**Standard:** WCAG **3.1.2 Language of Parts — AA**; spec §9.3, page and part language; UI-STANDARDS **Robust**.

**Direction:** Put the translated guidance outside the English diagnostics block, or render separately marked language spans. Keep the diagnostic content itself marked as English.

**Source:** `index.html:798`, `src/ui/feedback.ts:242`, `src/main.ts:3229`, `src/i18n/zh-Hans.ts:694`, `src/i18n/ms-MY.ts:749`; standards: `docs/01-specification.md:697`, `UI-STANDARDS.md:262`.

**Rank:** 2.

### C-06 — Two Chinese save messages promise viewing where the page offers saving

**Saw:** The Chinese `saveStopped` and `notSaved` messages end with “您可以随时观看” — “you can watch it at any time”. The retained finished result offers Save, not a finished-video player. The page’s player still shows the original recording.

There is also a terminology mismatch: Step 6 is “创造”, while its action is “制作视频”. This is the new-language counterpart of U-23’s concern about consistent task words, not a request to reconsider the settled English labels.

**Standard:** Spec §9.2, plain language and truthful outcomes; UI-STANDARDS **Consistency**; Nielsen 2, **Match between the system and the real world**, and 4, **Consistency and standards**.

**Direction:** Make the save messages say that the finished video remains available to save again. Use the same video-making term for Step 6 and its action, and have a Chinese-speaking colleague check these paths in context.

**Source:** `src/i18n/zh-Hans.ts:71`, `src/i18n/zh-Hans.ts:311`, `src/i18n/zh-Hans.ts:331`, `src/main.ts:2971`, `src/main.ts:1658`, `src/i18n/en-GB.ts:197`; standards: `docs/01-specification.md:647`, `UI-STANDARDS.md:144`.

**Rank:** 2.

### C-07 — The accessibility statement gives an inconsistent account of its evidence

**Saw:** The statement says “Only automated checks have been run so far”, then “We have also checked it by hand in Chrome, at computer and phone widths”. It says the reading level of “the words” is checked whenever code changes, including on the translated pages, but that test imports and measures the English table. It describes the next tests as not yet chosen, while the specification already requires a complete accessibility walk.

The repository records the owner’s WAVE result; that is provenance for the statement, not a criterion-by-criterion result for the current page.

**Standard:** Spec §9.3 and §13, evidence or recorded limitations; UI-STANDARDS **Help and contextual guidance** and **System status**; Nielsen 1, **Visibility of system status**, and 10, **Help and documentation**.

**Direction:** Distinguish automated checks, manual layout checks and outstanding assistive-technology/user checks. Scope the reading-level claim to English, describe the required checks accurately, and tie the partial-compliance statement to actual limitations and criteria.

**Source:** `src/i18n/en-GB.ts:814`, `src/i18n/en-GB.ts:818`, `src/i18n/en-GB.ts:826`, `src/i18n/zh-Hans.ts:731`, `src/i18n/ms-MY.ts:787`, `test/readability.test.ts:20`, `test/readability.test.ts:31`, `src/config/accessibility.ts:19`; standards: `docs/01-specification.md:677`, `docs/01-specification.md:831`.

**Rank:** 2.

### C-08 — The decode-damage warning mixes a completed action with a future one

**Saw:** Before Create, its heading says “A damaged moment has been silenced”, while its body says the fraction of a second “will be silent instead”. The original remains unchanged and its preview is still the original. The listed times are source-file times, but the warning does not name that clock.

The body contains the necessary explanation; the heading and time label should agree with it.

**Standard:** UI-STANDARDS **System status** and **Content and form**; Nielsen 1, **Visibility of system status**, and 2, **Match between the system and the real world**.

**Direction:** Before creation, say that damaged sound will be silenced in the new video. Identify the listed positions as times in the original recording.

**Source:** `src/i18n/en-GB.ts:578`, `src/ui/warning-text.ts:33`, `src/audio/decode-damage.ts:87`, `src/main.ts:1505`, `src/i18n/en-GB.ts:197`; standards: `UI-STANDARDS.md:106`, `UI-STANDARDS.md:117`.

**Rank:** 3.

## 3. Regression table

Here, **holds** means the earlier remedy or accepted disposition still holds in source; **regressed** means a resolved principle has been broken again; **partly** means the remedy is incomplete or its required evidence remains outstanding; **superseded** means the earlier state or requirement no longer applies. A source-based “holds” is not a claim that I reran the October browser check.

### U-01 to U-25

| ID | Judgement | Evidence |
| --- | --- | --- |
| U-01 — Late failure of the Teams recording | holds | An unlevellable predicted plan is refused before encoding. The final output check remains. This does not establish the sound quality of the Teams output by ear. `src/media/pipeline.ts:346`, `src/workers/job.worker.ts:284`, `project/wish-list.md:20`. |
| U-02 — Discard action outlives its question | holds | Changes withdraw the question; starting checks the current file/busy/card state. Its spoken words are withdrawn too. `src/main.ts:2024`, `src/main.ts:2569`, `src/main.ts:2593`, `project/trajectory.md:14`. |
| U-03 — Previous Save appears to belong to the next file | holds | Previous versus Finished is derived from the source identity, and the record retains its source name. New-choice identity is separately regressed under A-05/C-01. `src/main.ts:3012`, `src/ui/result-summary.ts:114`. |
| U-04 — Ready outlives its facts | partly | Verdict and sound notes are withdrawn, but a storage refusal in `sourceBlock` remains during retry until success. `src/main.ts:874`, `src/main.ts:1423`, `src/main.ts:1498`. |
| U-05 — Undecodable file offered all setup steps | holds | Block is beside Choose; setup is hidden except where it can resolve storage, and a previous Save remains reachable. `src/main.ts:1465`. |
| U-06 — Wrong next step after failure | holds | Cause-specific, translated remedies cover input, capability, storage, encoder and output failures. `src/ui/failure-text.ts:51`, `src/ui/failure-text.ts:111`, `src/workers/job.worker.ts:328`. |
| U-07 — Frozen 0%, premature 100% | partly | Unmeasured stages are indeterminate and Checking is separate. Encoding still directly displays its fraction, which can fill/round to 100% before checking; the literal “bar full only when ready” rule is stronger. `src/ui/progress.ts:119`, `src/main.ts:1923`, `src/workers/job.worker.ts:263`, `docs/01-specification.md:654`. |
| U-08 — Every percentage announced | holds | Stages and three milestones; Announce progress can suppress routine speech. Time left joins milestones only. `src/ui/progress.ts:137`, `src/ui/progress.ts:158`, `index.html:568`. |
| U-09 — Focus dropped at transitions | holds | Conditional handover checks whether the outgoing control still owns focus and avoids taking it from feedback. `src/main.ts:824`, `src/main.ts:2789`, `src/main.ts:3162`. |
| U-10 — Consequential information not announced | partly | Losses, sound warnings, output changes and failures have spoken forms. Preview failure and uncaught-error disclosure still lack an explicit announcement at their handlers. `src/ui/announce.ts:24`, `src/main.ts:2822`, `src/main.ts:1872`, `src/main.ts:952`. |
| U-11 — Forced-colour controls disappear | holds | Explicit system-colour treatment exists for sliders, segments and progress. Real Windows verification remains outstanding. `src/styles/app.css:1497`, `src/styles/app.css:1534`, `project/wish-list.md:33`. |
| U-12 — Swatches and disabled states misleading | regressed | Swatches remain rectangular and existing disabled fields are treated distinctly. The new disabled Student ID textarea misses that treatment: C-04. `src/styles/app.css:1202`, `src/styles/app.css:991`, `src/styles/app.css:1451`. |
| U-13 — Two primary actions after completion | holds | Create becomes secondary while a result stands; Save is the result’s primary action. `src/main.ts:2676`, `src/main.ts:2999`. |
| U-14 — Fade/Slide silently becomes Cut | holds | Requested and applied closing are compared, visibly explained and announced. `src/ui/result-summary.ts:97`, `src/main.ts:3016`, `src/main.ts:2822`. |
| U-15 — Cleanup turns Saved into save failure | holds | Delivery and cleanup have separate error handling; cleanup failure is logged. `src/main.ts:3117`, `src/main.ts:3145`. |
| U-16 — iPhone/iPad warning detection | holds | Device classification is taken on the main thread and passed to preflight; download guidance handles touch-capable “Macintosh” iPads. Device testing remains required. `src/main.ts:1047`, `src/main.ts:1430`, `src/ui/save-text.ts:24`. |
| U-17 — Invalid time silently reverts | holds | Field-specific invalid text is retained; rendering avoids overwriting invalid/active input. `src/main.ts:1589`, `src/main.ts:1705`, `src/main.ts:1835`. |
| U-18 — No stop for check/save | holds | Separate stop handlers exist for selection checking and streaming saving. A browser-owned download remains a different route. `src/main.ts:2138`, `src/main.ts:2164`, `src/media/save.ts:117`. |
| U-19 — Phone verdict overpromises | holds | Mobile risk leads the verdict; continuation is explicit and secondary; coarse-pointer drop hint is hidden. `src/ui/preflight-panel.ts:64`, `src/main.ts:2064`, `src/styles/app.css:623`. |
| U-20 — Decimal keyboard cannot enter requested time | holds | Helper and parser accept seconds as well as colon-separated time. The new multi-ID keyboard is a separate human check. `src/i18n/en-GB.ts:205`, `src/ui/trim.ts:46`, `index.html:358`. |
| U-21 — Locked steps lack explanation | holds | Every affected step receives the job/save lock note; submission and closing-specific locks have their own reasons. `src/main.ts:2256`, `src/main.ts:2455`, `src/ui/closing-choice.ts:98`. |
| U-22 — False precision and silent tab | holds | Estimates are rounded; the tab names stage/outcome; new remaining time is rounded and kept out of the title. `src/ui/progress.ts:78`, `src/ui/progress.ts:160`, `src/main.ts:1937`. |
| U-23 — Novice-unfriendly/inconsistent words | regressed | English explanations remain, but new Chinese copy changes meaning and uses inconsistent making terminology: C-06. `src/i18n/en-GB.ts:170`, `src/i18n/zh-Hans.ts:71`, `src/i18n/zh-Hans.ts:331`. |
| U-24 — Claims the job does not fulfil | partly | Output naming and trimmed-size advice are conditional. New Chinese save copy promises viewing of the finished result where no such player exists: C-06. `src/main.ts:3066`, `src/ui/preflight-panel.ts:217`, `src/i18n/zh-Hans.ts:331`. |
| U-25 — Completion repeated; no next step | holds | Verdict/completion speech is separated from visible panels. Save and download routes supply next steps on the dedicated save line. `src/main.ts:2822`, `src/main.ts:3109`, `src/main.ts:3117`, `index.html:587`. |

### A-01 to A-20

| ID | Judgement | Evidence |
| --- | --- | --- |
| A-01 — Weak accessibility target | holds | Every applicable AAA criterion is required; exceptions are limitations, not passes. `docs/01-specification.md:677`. |
| A-02 — No accessibility acceptance criterion | holds | §13 now names the complete state/language/assistive-technology walk. Its execution is still outstanding. `docs/01-specification.md:831`, `docs/01-specification.md:855`. |
| A-03 — Session lifetime and staying awake | holds | Pre-create, running and retained-result notices accompany leave protection for jobs, saves and unsaved results. `index.html:593`, `src/main.ts:2189`, `src/main.ts:2991`. |
| A-04 — Save routes and what follows | partly | Completed writes and downloads are distinguished, with next steps. A re-render of a delivered download resets its lifetime wording to “until you save”, because `lifetimeOf` starts as `unsaved`. `src/main.ts:2997`, `src/main.ts:3091`, `src/ui/save-text.ts:24`. |
| A-05 — Immutable result identity | regressed | Original job facts remain immutable, but card kind and video language are not adequately represented: C-01. `src/main.ts:2727`, `src/ui/result-summary.ts:114`. |
| A-06 — Announcement consent and competing updates | partly | Routine speech has a user control and milestone policy. Visible auto-updates have no separate pause/hide policy; full announcement ordering remains untested. `index.html:568`, `src/ui/progress.ts:137`, `project/wish-list.md:35`. |
| A-07 — Hand focus on without taking it | holds | Conditional focus handover guards unrelated reading and the open dialog. `src/main.ts:824`. |
| A-08 — Text presentation, enlargement and reflow | partly | Measures, wrapping and overrides are supported in CSS. Complete new-state/three-language acceptance is not established. `src/styles/app.css:35`, `src/styles/app.css:1129`, `docs/01-specification.md:689`, `project/wish-list.md:28`. |
| A-09 — Quantified focus appearance | partly | The standard now specifies geometry and changed-pixel contrast; the colour test still does not establish rendered geometry or overlap. `UI-STANDARDS.md:235`, `test/contrast.test.ts:121`, `src/styles/app.css:1350`. |
| A-10 — Reading level, terms and abbreviations | partly | English has a readability gate and explicit abbreviation exceptions. Native-language reading-level review is pending; the statement overstates coverage. `test/readability.test.ts:20`, `test/readability.test.ts:111`, `docs/01-specification.md:723`, `project/wish-list.md:29`. |
| A-11 — Recheck cost unbounded by measurement | partly | Rechecks are debounced and cancellable. The specification explicitly says the longest-recording timing has not been taken. `src/config/trim.ts:42`, `src/main.ts:2138`, `docs/01-specification.md:456`. |
| A-12 — Chrome presented as a guarantee | holds | Pending, not-passed and passed messages are distinct; block remedies depend on context. `src/i18n/en-GB.ts:90`, `src/ui/failure-text.ts:111`, `src/ui/preflight-panel.ts:49`. |
| A-13 — Feedback contract and reply promise | holds | §9.2 specifies user-reviewed email and copying; feedback remains available during work. `docs/01-specification.md:668`, `index.html:735`, `src/ui/feedback.ts:210`. |
| A-14 — Caption loss without publishing consequence | partly | Detected captions receive clear publishing guidance. The unscanned-container warning still stops at “will not be carried over”. `src/ui/source-panel.ts:73`, `src/i18n/en-GB.ts:185`, `src/i18n/en-GB.ts:188`. |
| A-15 — Uncontrolled preview treated as exempt | holds | The specification records conditional media/flash limitations and does not count them as passes. The statement’s shorter account needs broadening. `docs/01-specification.md:715`, `src/i18n/en-GB.ts:797`. |
| A-16 — Error placement unspecified | holds | §9.2 now requires local, associated errors; trim and card errors follow that pattern. Missing advance instructions are C-03. `docs/01-specification.md:661`, `index.html:188`, `index.html:316`, `src/main.ts:2482`. |
| A-17 — Language switch as a state transition | partly | Radios retain focus, page language changes, and state is repainted in place. Language-of-parts fails in feedback: C-05. `src/ui/language-switcher.ts:64`, `src/main.ts:3430`, `src/main.ts:3453`, `src/ui/feedback.ts:242`. |
| A-18 — Trim keyboard step does not scale | partly | Page Up/Down remains ten seconds; typed time provides the practical alternative. The proposed scaling remains explicitly parked. `src/config/trim.ts:34`, `src/ui/trim.ts:157`, `project/wish-list.md:19`. |
| A-19 — Original preview unexplained | holds | The text identifies the original; valid trim changes now seek it while paused. `src/i18n/en-GB.ts:197`, `src/main.ts:1798`, `src/ui/preview-seek.ts:25`. |
| A-20 — Ambiguous feedback “size” and reply wording | holds | The disclosure identifies picture-size information and exposes the actual outgoing details; no new service promise is introduced. `index.html:789`, `src/ui/feedback.ts:111`, `src/main.ts:3229`. |

### VH-124 states 01–29

| State | Judgement | Evidence |
| --- | --- | --- |
| 01 Empty | partly | One primary chooser and no resting-status echo remain. Startup pending still disables it without a local pending explanation; the lede’s lead-in is still parked. `index.html:105`, `src/main.ts:1203`, `project/wish-list.md:22`. |
| 02 Drag held | holds | Held/refused states are explicit and the drop remains a picker alternative. `src/ui/drop-zone.ts:98`. |
| 03 Drop refused | holds | Local alert and actionable refusal remain. `index.html:124`, `src/ui/drop-zone.ts:63`. |
| 04 Feedback | partly | Native dialog and fallback routes remain. The old three-button/long-label layout still needs rendered judgement; C-05 adds a language defect. `index.html:766`, `index.html:800`, `src/ui/feedback.ts:242`. |
| 05 Errors captured | partly | Common notification styling exists, but revealing the panel is still not explicitly announced. `src/main.ts:952`, `index.html:597`. |
| 06 Reading | holds | Local Reading status; old setup is withdrawn while a new file is inspected; retained output survives. `src/main.ts:1289`, `src/main.ts:1334`. |
| 07 Checking | partly | Checking and Stop are clear. The large original preview and technical read summary remain; no measured recheck-progress figure is supplied. `src/main.ts:1423`, `src/ui/source-panel.ts:190`, `src/styles/app.css:1236`. |
| 08 Ready | holds | Verdict panel, one primary Create and local lifetime guidance; completion announcement is not another visible verdict. `src/main.ts:1504`, `src/main.ts:2676`, `index.html:593`. |
| 09 Help open | partly | In-flow help and Escape/outside dismissal remain. Tab dismissal and warning-like appearance are still parked. `src/main.ts:667`, `project/wish-list.md:24`. |
| 10 Trim invalid | holds | Per-field errors, range error at End, distant correction line and no valid Create route. `src/main.ts:1617`, `src/main.ts:1716`, `src/main.ts:1762`. |
| 11 Check after trim | partly | Fresh verdict is withdrawn and recheck is cancellable; an earlier storage block remains while rechecking. `src/main.ts:1762`, `src/main.ts:874`, `src/main.ts:1498`. |
| 12 Check stopped | holds | “Check stopped.” and Check again, without the old explanatory echo. `src/main.ts:2138`, `src/i18n/en-GB.ts:376`. |
| 13 Discouraged | holds | Risk leads; Continue anyway remains an explicit secondary action. `src/ui/preflight-panel.ts:64`, `src/main.ts:2064`. |
| 14 Running | partly | Stale verdict/Create/lifetime furniture is removed; named progress leads. The new live switches do not explain their next-job scope: C-02. `src/main.ts:2754`, `src/main.ts:2210`, `src/main.ts:604`. |
| 15 Cancelling | partly | Speech cannot overwrite Cancelling, but stage text, bar, time left and tab title can still update. `src/main.ts:1900`, `src/main.ts:1918`, `src/main.ts:2929`. |
| 16 Cancelled | holds | Reassurance and retry remain; job controls are unlocked after settlement. `src/main.ts:2831`, `src/main.ts:2875`. |
| 17 Ready, sound notes | holds | Common advisory anatomy, visible explanation and spoken titles remain. New damage wording is C-08. `src/ui/warning-text.ts:78`, `src/ui/announce.ts:40`. |
| 18 Finished | regressed | Save leads and the result carries its record, but that record cannot distinguish the new card variants: C-01. `src/main.ts:2971`, `src/ui/result-summary.ts:114`. |
| 19 Discard question | regressed | Danger styling, question focus and two choices remain; the shared record inherits C-01. `src/main.ts:2593`, `src/main.ts:2649`. |
| 20 Saving | holds | Save disables, Stop takes over, and saving has its own status writer. `src/main.ts:3036`, `index.html:587`. |
| 21 Saved | holds | Stop/locks end at delivery; cleanup cannot change the saved outcome. `src/main.ts:3117`, `src/main.ts:3139`. |
| 22 Previous video | partly | Identity and separate save status survive, but output warnings remain outside the retained result and are cleared on new selection. `src/main.ts:1988`, `src/main.ts:1310`, `src/main.ts:2811`. |
| 23 Download handed off | partly | Handoff uncertainty and destination guidance remain. Re-rendering resets the delivered lifetime sentence. `src/main.ts:2997`, `src/main.ts:3097`. |
| 24 Blocked file | holds | Specific block is local to Choose; only useful setup and a previous Save survive. `src/main.ts:1465`. |
| 25 Unreadable | partly | Both failure paths announce recovery. The chooser’s selected/secondary treatment is set before inspection and is not reset by unreadable failure. `src/main.ts:1299`, `src/main.ts:1373`, `src/main.ts:1388`, `src/styles/app.css:555`. |
| 26 Too short | holds | Trim’s unavailability is explained; it does not itself refuse creation. `src/main.ts:1658`, `src/i18n/en-GB.ts:210`. |
| 27 Silent | holds | Advisory explains that creation continues without sound and asks the user to check unexpected silence before publication. `src/i18n/en-GB.ts:572`. |
| 28 Storage block | partly | Setup and Check again provide a real recovery route. The old refusal is cleared only after a successful recheck. `src/main.ts:1483`, `src/main.ts:1498`. |
| 29 Failed | partly | Cause-specific recovery and spoken explanation remain. Watchdog settlement hides progress, but “being made” lock/notice state persists until settlement ends. `src/main.ts:2840`, `src/main.ts:2850`, `src/main.ts:2256`. |

## 4. The page, state by state

These are distinct presentations and transitions, rather than every possible combination of input text. Unless a row says otherwise, it applies to all three page languages and both reference widths. “Keep” means keep the source design; it does not certify rendered appearance.

The whole-page frame now places Page language, its conditional machine-translation notice, the title/introduction, Video type and Video language before Choose. That order is shared at desktop and phone widths. The switchers wrap and reserve their bold width; the source cannot establish whether a first-time phone user finds Choose promptly. Sources: `src/main.ts:3388`, `index.html:35`, `index.html:65`, `index.html:88`, `src/styles/app.css:1129`, `src/styles/app.css:1163`.

| On screen | Meant to do | Competes | Repeats | Change |
| --- | --- | --- | --- | --- |
| **01 Empty.** Introduction, selectors, primary native chooser, desktop drop hint. `index.html:35`, `index.html:105`, `src/styles/app.css:623`. | Choose a recording. | Three selectors precede the first file action; translated pages add a notice. | The parked introductory lead-in. | Keep the chooser hierarchy; assess first-action findability with staff. |
| **02 Drag held.** Drop zone changes state and invites release. `src/ui/drop-zone.ts:98`. | Drop the file. | Nothing new. | None material. | Keep. |
| **03 Drop refused.** Local alert for wrong count/type or unavailable action. `index.html:124`, `src/ui/drop-zone.ts:63`. | Correct the drop or use the picker. | Existing file/result may remain. | Necessary recovery context. | Keep the existing selection intact. |
| **04 Feedback open.** Message, details disclosure and three actions in a native dialog. `index.html:766`. | Write, review, open email or copy. | Three long action labels at phone width. | Copy route is named in help as well as its button. | Judge wrapping in Chrome; correct C-05. |
| **05 Errors captured.** Error panel and English technical disclosure. `index.html:597`, `src/main.ts:952`. | Read the plain explanation and report. | Footer feedback offers the same destination. | Local report action is useful repetition. | Announce the newly exposed consequential error. |
| **06 Reading.** “Reading the video…” at Choose; setup withdrawn. `src/main.ts:1302`, `src/main.ts:1323`. | Wait, or choose another file. | Previous result may remain. | No redundant resting instruction. | Keep distinct from Checking. |
| **07 Checking.** Source summary, original preview and setup; Checking and Stop at Create. `src/main.ts:1350`, `src/main.ts:1423`. | Wait or stop. | All setup, including the new card fields, is visible; preview can occupy 60vh. | Summary repeats selected property facts intentionally. | Keep useful setup; verify recheck duration and page hierarchy. |
| **08 Ready.** Verdict, estimates, primary Create, lifetime note. `src/main.ts:1504`, `index.html:593`. | Review choices and create. | Sound notes when present. | Spoken verdict is not a visible duplicate. | Keep. |
| **09 Help open.** Animation-onset explanation in flow. `src/main.ts:667`, `index.html:428`. | Read and return to onset. | Expands an already long setup page. | Examples reinforce the result line. | Resolve the existing dismissal/appearance wish, not a new redesign. |
| **10 Trim invalid.** Local text error, invalid state and Step 6 correction. `src/main.ts:1716`. | Correct the named time/range. | Distant Create section remains relevant. | The Step 6 pointer is useful repetition. | Keep invalid text until corrected. |
| **11 Rechecking after trim/preset.** Checking, Stop, changed kept range. `src/main.ts:1548`, `src/main.ts:1762`. | Wait or stop. | An old storage block can remain above. | Old refusal contradicts the current attempt. | Clear the old block at retry start. |
| **12 Check stopped.** “Check stopped.” and Check again. `src/main.ts:2138`. | Check again or change setup. | No obsolete verdict. | None material. | Keep. |
| **13 Discouraged.** Long-job/mobile risk and Continue anyway. `src/ui/preflight-panel.ts:64`, `src/main.ts:2064`. | Decide whether to proceed. | Risk explanation, estimates and setup. | Reassurance is justified. | Keep continuation secondary; test comprehension on real phones. |
| **14 Running.** Getting ready → Analysing audio → Encoding video → Finishing the file → Checking the file; Cancel, lock notes and announcement control. `src/ui/progress.ts:110`, `src/main.ts:2210`. | Wait or cancel. | Locked setup above; live video selectors. | Visible stage has a controlled spoken counterpart. | Explain next-job switches; verify the full-bar rule. |
| **15 Cancelling.** Cancelling and disabled Cancel. `src/main.ts:2929`. | Wait for cancellation to settle. | Old stage, bar and remaining time can still update. | Two incompatible accounts of the current task. | Stop all ordinary progress presentation once cancellation is requested. |
| **16 Cancelled.** Nothing saved/original unchanged; Create returns. `src/main.ts:2831`. | Adjust or create again. | Retained setup is useful. | Required reassurance. | Keep. |
| **17 Ready with sound notes.** Advisory titles, explanations and continuation reassurance. `src/ui/warning-text.ts:78`. | Understand limitations, then decide. | Verdict and warning are both panels. | “None of these stop you” distinguishes warning from refusal. | Keep consequences visible; verify spoken order. |
| **18 Finished.** Result record, lifetime and primary Save; quieter Create. `src/main.ts:2971`. | Save this result. | Controls may already describe another configuration. | Completion speech and result title serve different channels. | C-01; keep warnings attached to the result. |
| **19 Discard question.** Unsaved/download-specific question, record, Discard and Keep. `src/main.ts:2593`. | Make an explicit choice. | Next-job controls remain visible. | Record is necessary decision context. | C-01; retain safe question focus and explicit alternatives. |
| **20 Saving.** Save disabled; dedicated Saving line; Stop saving; locks. `src/main.ts:3036`. | Complete/cancel the native picker, then wait or stop the stream. | A next-file check may also be running. | Separate status lines are justified. | Keep each message beside its own work. |
| **21 Saved.** Saved next-step sentence and spent Save. `src/main.ts:3117`. | Check/use the file or choose another. | Cleanup is intentionally silent. | Saved button and destination guidance reinforce state. | Keep; do not let late cleanup alter newer UI state. |
| **22 Previous result.** Previous heading and old record beneath another source’s state. `src/main.ts:3012`. | Save the old result or continue with the new source. | Two files, intentionally. | Separate records are necessary. | Preserve old output warnings and resolve C-01. |
| **23 Download handed off.** Download destination, uncertainty, retained result and Save/retry. `src/main.ts:3091`, `src/ui/save-text.ts:24`. | Check the browser download. | Result lifetime can disagree after re-render. | Tab-loss context remains necessary. | Initialise lifetime wording from `kept.delivered`. |
| **24 File blocked.** Cause and remedy beside Choose; useful setup/previous Save only. `src/main.ts:1465`. | Follow the cause-specific remedy. | Previous Save is legitimate. | Spoken form accompanies one visible block. | Keep. |
| **25 Unreadable.** Local failure, source-safe reassurance and another-file/re-export route. `src/main.ts:1373`, `src/ui/failure-text.ts:54`. | Choose a usable file. | Previous result may remain. | Trim-unavailable text can add a second failure account. | Restore choosing emphasis when it is the main task. |
| **26 Too short to trim.** Disabled trim controls and length explanation. `src/i18n/en-GB.ts:210`, `src/main.ts:2256`. | Continue without trimming. | Unavailable controls occupy space. | Reason is useful, not surplus. | Keep distinction between cannot trim and cannot create. |
| **27 No sound.** Advisory says the rest of the job continues without sound. `src/i18n/en-GB.ts:572`. | Continue, or check an unexpectedly silent recording. | Other sound notes should not imply levelling occurred. | Publication check is necessary. | Keep. |
| **28 Storage block.** Storage remedy at Choose; trim/preset still usable; Check again. `src/main.ts:1483`. | Keep less, choose Smaller, or free space and retry. | Old refusal remains during retry. | Recovery is repeated at Create usefully. | Clear spent refusal when retry begins. |
| **29 Job failed.** Cause-specific failure and safe next step; original unchanged. `src/ui/failure-text.ts:51`, `src/main.ts:2840`. | Retry, change setup or report, according to cause. | Create can be the wrong apparent next action for a report-only failure. | Safety reassurance stays. | Preserve cause-specific remedies; do not call every failure “try again”. |
| **30 Startup pending.** Disabled chooser; pending browser/system checks. `src/main.ts:1203`, `src/ui/system-check.ts:43`. | Wait. | A disabled first action without a local waiting explanation. | None useful at Choose. | Supply a short local pending state. |
| **31 Startup blocked.** Chooser remains disabled; local reason; System check exposes failures. `src/main.ts:1206`, `src/ui/failure-text.ts:111`. | Follow the browser/storage/startup remedy. | Technical check detail below. | Local reason and diagnostic facts serve different purposes. | Keep specific recovery. |
| **32 Video properties open / losses present.** Property list; losses remain outside disclosure. `src/ui/source-panel.ts:53`, `src/ui/source-panel.ts:211`. | Inspect facts or understand lost content. | Dense technical facts can distract from setup. | Summary/property overlap is intentional. | Keep losses visible; add publishing consequence to the unscanned-caption case. |
| **33 System check open.** Named checks, word marks and values. `index.html:630`, `src/ui/system-check.ts:43`. | Understand support or report a block. | Long row labels at narrow width. | Status marks and words deliberately avoid colour-only meaning. | Existing shorter-label wish remains; verify phone/zoom fit. |
| **34 Preview unavailable.** “You can still set the times”; Set here controls unavailable. `src/main.ts:1872`, `src/i18n/en-GB.ts:198`. | Use typed times/handles. | Native player may show its own error. | Two explanations may coexist. | Announce the app’s new limitation and retain alternatives. |
| **35 Check failed → retry.** Failure remedy and Check again; retry replaces the failure panel. `src/main.ts:1522`, `src/main.ts:2151`. | Retry or report repeated failure. | Any old `sourceBlock` remains a separate concern. | Failure and next action reinforce one another. | Keep panel replacement; clear all obsolete block presentation. |
| **36 Changed closing / output warning.** Actual-versus-requested closing and metadata warning. `src/main.ts:3016`, `src/main.ts:2811`. | Understand the file before saving. | Warning is outside the retained result. | Requested and actual facts are necessary. | Preserve both with the result after another selection. |
| **37 Save stopped / picker cancelled.** Result retained; save-status sentence; Save restored. `src/main.ts:3078`, `src/i18n/en-GB.ts:381`. | Save again when ready. | None should imply the result was lost. | Retention reassurance is useful. | Correct Chinese viewing promise, C-06. |
| **38 Original selected as save destination.** Refusal asks for another name/folder. `src/media/save.ts:147`, `src/i18n/en-GB.ts:383`. | Choose a different destination. | Native picker context. | Original-safety reassurance is warranted. | Keep. |
| **39 Save failure.** Could not save; result remains available. `src/main.ts:3152`. | Retry or report. | A successfully completed write must not receive this state. | Retention reassurance is useful. | Keep delivery separate from cleanup. |
| **40 Feedback validation and handoff.** Empty-message error, email handoff, too-long/copy guidance and copied/could-not-copy status. `src/main.ts:3267`, `src/main.ts:3309`, `src/ui/feedback.ts:210`. | Correct, review and send through the user’s own app. | Diagnostics and several recovery actions. | Repeating the destination is useful. | C-05; verify manual-copy usability and native mail return. |
| **41 Worker timeout settling.** Failure visible, progress hidden, controls still locked until settlement. `src/main.ts:2850`. | Wait for safe release, then recover. | Lock text still says the video is being made. | Failure and making state conflict. | Say that stopping is completing while retaining the safety lock. |
| **42 Page language.** English / 简体中文 / Bahasa Malaysia native radios. `src/ui/language-switcher.ts:64`. | Choose the page language. | Video language is a second, different language choice. | Autonyms correctly repeat in both selectors. | Keep distinct labels and stable widths; test language announcements. |
| **43 Machine-translation note.** Info panel and email wording route on Chinese/Malay only. `src/ui/language-switcher.ts:125`. | Understand translation status; report wording. | It precedes the title and first task. | Statement repeats the limitation elsewhere appropriately. | Keep disclosure; judge its visual weight at phone width. |
| **44 Staff video side.** Optional card; closing/internal choice belongs to the user. `src/main.ts:608`, `src/main.ts:2455`. | Make a staff video. | The result of a prior submission may remain. | Closing consequence also appears in Step 4. | C-01/C-02. |
| **45 Student submission side.** Submission fields replace staff fields; title card and Internal use only are locked on where applicable. `src/main.ts:2455`, `src/ui/closing-choice.ts:98`. | Complete submission details. | A long compulsory step replaces a short optional one. | Locked-checkbox explanations are necessary. | C-03; retain each side’s typed values. |
| **46 Video language.** Same three autonyms; follows page until explicitly chosen, then remembered. `src/main.ts:478`, `src/main.ts:628`. | Choose the language of app-added video words. | Page language and user-entered words differ. | Helper usefully says typed words are kept. | Explain next-job scope, C-02; identify it in the result, C-01. |
| **47 Staff title card off.** Add a title card unchecked; fields hidden. `src/main.ts:2455`. | Continue without a card, or enable it. | No hidden-field burden. | Intro explains the five-second effect. | Keep. |
| **48 Staff card on / empty title.** Four fields; date filled automatically. `src/main.ts:2506`, `src/main.ts:2467`. | Enter any desired card content. | “Title” can be empty while the date alone makes a valid card. | Date helper is useful. | State the optional-field/minimum-content rule, C-03. |
| **49 Staff card filled / field full.** Values retained; fit checked; “rest was not added” at a limit. `src/main.ts:2410`, `src/main.ts:2520`. | Review and continue, or shorten. | Full-field note and fit error can concern the same field. | Refusal takes precedence, correctly. | Keep composition-aware handling; verify paste/IME and spoken feedback. |
| **50 Staff card refused.** All-empty error by checkbox or fit error by field; Step 6 pointer; focus to a field. `src/main.ts:2482`. | Add content, shorten it, or switch the card off. | Error at the checkbox and focus at Title are separated in the empty case. | Step 6 pointer is useful. | C-03; verify that the focused field is heard with sufficient error context. |
| **51 Submission locked / empty.** Checked disabled card box with reason; four empty fields. `index.html:304`, `src/main.ts:2455`. | Fill all required details. | Requiredness is not stated in advance. | The locked-card reason does not explain the fields. | C-03. |
| **52 Submission refused.** Missing field, wrong/duplicate/too many IDs, or fit refusal; focus to first problem. `src/ui/title-card-step.ts:199`, `src/main.ts:2482`. | Correct the named field. | Several errors can appear together. | Local and Step 6 guidance is justified. | Keep specificity; test eight-ID entry on phone keyboards. |
| **53 Submission filled.** Values, kept running time and card-made date explanation. `src/main.ts:2443`, `src/ui/title-card-step.ts:275`. | Review, then create. | Card date and submission date could otherwise be confused. | The explicit distinction earns its place. | Keep; verify output and language with a person. |
| **54 Internal use only — staff toggle.** Optional checkbox and quoted closing words. `src/main.ts:555`, `src/ui/closing-choice.ts:36`. | Choose whether the closing bears the restriction. | Video type and closing text both explain the consequence. | Useful near the action, but assess whole-page weight. | Keep the quote’s own language marking. |
| **55 Internal use only — locked.** Checked for submissions; unavailable with None, with a reason. `src/ui/closing-choice.ts:98`. | Understand why it cannot change. | Checked-but-inoperative under None needs the reason. | Reason and “no closing” result are complementary. | Keep both explanations. |
| **56 Closing None.** No University closing; dependent controls unavailable. `src/ui/closing-choice.ts:36`, `src/main.ts:555`. | Continue without a closing. | Title card can still be on. | “No closing” must not imply “no title card”. | Keep distinct opening-card and closing language. |
| **57 Cut, blue or white.** Cut to selected closing card; added duration; onset unavailable. `src/i18n/en-GB.ts:312`, `src/i18n/en-GB.ts:320`. | Choose colour/internal wording, then continue. | Disabled onset still occupies space. | Local reason is necessary. | Keep. |
| **58 Fade over existing, blue or white.** Result says the last second is covered as the closing builds. `src/i18n/en-GB.ts:334`. | Accept or change the overlap. | Technical onset label needs its explanation. | Result line supplies the consequence. | Keep; assess long selected text at narrow width. |
| **59 Fade over freeze, blue or white.** Last frame held; nothing covered; added duration. `src/i18n/en-GB.ts:324`. | Accept or change the freeze. | Long onset option at phone width. | Help and result explain different levels of detail. | Keep; verify fit and output expectation. |
| **60 Slide over existing, blue or white.** Slide covers the last second as it builds. `src/i18n/en-GB.ts:334`. | Accept or change overlap. | Same onset-language burden as Fade. | Consequence is useful. | Keep. |
| **61 Slide over freeze, blue or white.** Held last frame; no original material covered. `src/i18n/en-GB.ts:324`. | Accept or change freeze. | Long option at phone width. | Necessary consequence. | Keep. |
| **62 Larger / better or Smaller / reduced.** Purpose-labelled radio choices; change triggers recheck. `index.html:489`, `src/main.ts:1548`. | Choose destination-appropriate output. | Recheck delays further action. | No invented extra result sentence. | Keep the settled names; test understanding with staff. |
| **63 Accessibility statement open.** Abilities, limitations, contact, compliance, evidence, plans and dates. `index.html:646`, `src/ui/accessibility-statement.ts:100`. | Assess suitability or obtain help. | Long footer expansion. | Some browser/translation information repeats usefully. | C-07; retain headings and clearly labelled new-tab link. |
| **64 Footer contacts.** Creators team and learning content team email links. `index.html:748`, `src/config/feedback.ts:22`. | Obtain help. | Two named teams currently share the owner’s address. | Three help routes may look more distinct than their destination. | Retain the approved fallback; make interim routing clear when reviewed. |
| **65 Decode-damage warning.** Advisory with up to five distinct source times and a remaining count. `src/ui/warning-text.ts:33`. | Understand the silence that will be inserted. | Long explanation among other sound notes. | Heading/body tense disagrees. | C-08; listen and check spoken time comprehension. |
| **66 Time left.** Reserved line below Encoding; appears after sufficient measured encoding time; absent in other stages. `src/ui/progress.ts:67`, `src/main.ts:1911`, `src/styles/app.css:730`. | Estimate the remaining encode wait. | Finishing and Checking still follow. | Spoken only with milestones. | Keep bounded scope; verify long-job stability and cancellation presentation. |
| **67 Save line alongside another check.** Save’s own live line under its result; next-source verdict elsewhere. `index.html:587`, `src/main.ts:784`, `src/main.ts:3046`. | Track two independent operations. | Two live regions can speak near one another. | Separate status is necessary. | Keep ownership; verify announcement order with a screen reader. |
| **68 Switch while running or retaining output.** New type/language visible; old job continues unchanged. `src/main.ts:604`, `src/main.ts:620`. | Configure the next job without losing this one. | Current controls and current output describe different things. | No visible explanation of that difference. | C-01/C-02. |

## 5. WCAG 2.2 — all 86 criteria

This table judges the built page’s source, not merely whether a requirement exists.

- **met:** source establishes the relevant authored behaviour.
- **met-with-evidence:** a specific implementation, inspected pin or recorded check is named. Tests cited here were **read, not run**.
- **gap:** an implementation gap, conditional media limitation, or explicitly identified evidence gap. These are distinguished in the explanation.
- **n-a:** the criterion’s triggering content or process is absent.

These judgements do not turn incomplete browser/assistive-technology coverage into a conformance claim. The required acceptance scope is `docs/01-specification.md:831`.

| Criterion | Level | Judgement and evidence |
| --- | --- | --- |
| **1.1.1 Non-text Content** | A | **met-with-evidence** — logo has a text alternative; swatches have text labels; decorative marks do not carry the sole meaning. `src/ui/brand-assets.ts:55`, `index.html:445`. |
| **1.2.1 Audio-only and Video-only, prerecorded** | A | **gap — conditional media** — a silent-video preview may require an alternative which the app does not provide. `index.html:154`, `docs/01-specification.md:715`. |
| **1.2.2 Captions, prerecorded** | A | **gap — conditional media** — the selected preview is not assured captions; warning about export loss is not a preview alternative. `index.html:154`, `src/ui/source-panel.ts:73`. |
| **1.2.3 Audio Description or Media Alternative** | A | **gap — conditional media** — visually conveyed information in the preview may lack an alternative. `index.html:154`, `docs/01-specification.md:715`. |
| **1.2.4 Captions, live** | AA | **n-a** — local recordings, not a live-media service. `index.html:115`, `src/main.ts:1658`. |
| **1.2.5 Audio Description, prerecorded** | AA | **gap — conditional media** — descriptions are not assured for the selected recording. `index.html:154`, `docs/01-specification.md:715`. |
| **1.2.6 Sign Language, prerecorded** | AAA | **gap — conditional media** — no sign-language version is supplied for speech in the preview. `index.html:154`. |
| **1.2.7 Extended Audio Description** | AAA | **gap — conditional media** — applicability depends on the recording; no extended-description provision or assessment is made. `index.html:154`, `docs/01-specification.md:715`. |
| **1.2.8 Media Alternative, prerecorded** | AAA | **gap — conditional media** — no complete text alternative is assured. `index.html:154`. |
| **1.2.9 Audio-only, live** | AAA | **n-a** — no live audio presentation. `index.html:115`, `src/workers/job.worker.ts:198`. |
| **1.3.1 Info and Relationships** | A | **met-with-evidence** — native fieldsets, labels, headings, descriptions and property lists express the authored relationships. Required instructions are separately deficient under 3.3.2. `index.html:65`, `index.html:228`, `index.html:304`, `src/ui/source-panel.ts:211`. |
| **1.3.2 Meaningful Sequence** | A | **met** — DOM order follows selectors, six steps, result and support; the result precedes its save-status/actions. `index.html:65`, `index.html:105`, `index.html:580`, `index.html:623`. |
| **1.3.3 Sensory Characteristics** | A | **met** — instructions name actions and controls; colour choices have words rather than colour-only directions. `index.html:171`, `index.html:445`, `src/i18n/en-GB.ts:383`. |
| **1.3.4 Orientation** | AA | **met** — no orientation lock; layout uses fluid width and wrapping. Physical-device fit remains a separate check. `index.html:5`, `src/styles/app.css:211`, `src/styles/app.css:955`. |
| **1.3.5 Identify Input Purpose** | AA | **n-a** — these are card-content, recording and feedback fields, not fields specifically collecting the enumerated personal-data purposes about the current user. Student IDs are not authentication here. `index.html:258`, `index.html:304`, `index.html:777`. |
| **1.3.6 Identify Purpose** | AAA | **met-with-evidence** — landmarks, native control types, fieldsets and named regions identify purpose programmatically. `index.html:18`, `index.html:30`, `index.html:65`, `src/ui/notification.ts:43`. |
| **1.4.1 Use of Color** | A | **met-with-evidence** — selected segments also change weight; errors have words; checks have word marks; swatches have labels. `src/styles/app.css:1081`, `src/i18n/en-GB.ts:715`, `index.html:445`. |
| **1.4.2 Audio Control** | A | **met** — original preview has native controls and does not autoplay; trim seeks pause it. `index.html:154`, `src/ui/preview-seek.ts:25`. |
| **1.4.3 Contrast, minimum** | AA | **met-with-evidence** — authored text uses the light/dark/brand token pairs enumerated by the contrast pin; no current test run claimed. `src/styles/tokens.brand.css:41`, `test/contrast.test.ts:95`, `test/contrast.test.ts:129`. |
| **1.4.4 Resize Text** | AA | **gap — evidence** — fluid/relative styling supports enlargement, but all new controls, dialogs and translations at 200% have not been established by this review or the outstanding acceptance record. `src/styles/app.css:955`, `src/styles/app.css:1428`, `project/wish-list.md:28`. |
| **1.4.5 Images of Text** | AA | **met** — authored page text is HTML; the supplied UI logo has the logotype exception. Generated output cards are not used as substitutes for the page’s text controls. `index.html:35`, `index.html:258`, `src/ui/brand-assets.ts:55`. |
| **1.4.6 Contrast, enhanced** | AAA | **met-with-evidence** — the inspected contrast pin requires 7:1 for enumerated text pairs in light, dark and brand contexts. This is bounded token evidence, not a new rendered test. `test/contrast.test.ts:95`, `test/contrast.test.ts:134`. |
| **1.4.7 Low or No Background Audio** | AAA | **n-a** — no authored prerecorded audio-only presentation; the user’s video preview is not this criterion’s audio-only case. `index.html:154`. |
| **1.4.8 Visual Presentation** | AAA | **gap — evidence/presentation** — 55ch/40em measures, 1.5 line height and overridable spacing help. Complete user-adjustment and enlarged-text behaviour across the page is unverified; help paragraphs still use a smaller gap. `src/styles/app.css:35`, `src/styles/app.css:54`, `src/styles/app.css:1030`, `src/styles/tokens.carbon.css:52`. |
| **1.4.9 Images of Text, no exception** | AAA | **met** — page text remains text; the logo uses WCAG’s essential logotype allowance. `src/ui/brand-assets.ts:55`, `docs/01-specification.md:709`. |
| **1.4.10 Reflow** | AA | **gap — evidence** — wrapping and narrow-screen rules exist, but every new state at 320 CSS pixels, including long translated controls and disclosures, is not established. `src/styles/app.css:654`, `src/styles/app.css:1129`, `docs/01-specification.md:831`. |
| **1.4.11 Non-text Contrast** | AA | **met-with-evidence** — component/progress token pairs are explicitly pinned and forced-colour paint is provided. Real Windows rendering remains outstanding. `test/contrast.test.ts:117`, `src/styles/app.css:1497`. |
| **1.4.12 Text Spacing** | AA | **gap — evidence** — text can wrap and rules generally permit overrides, but the complete spacing-override matrix has not been demonstrated, especially for switchers, field/button rows and the dialog. `src/styles/app.css:1000`, `src/styles/app.css:1156`, `src/styles/app.css:1428`, `docs/01-specification.md:834`. |
| **1.4.13 Content on Hover or Focus** | AA | **n-a** — authored help opens by activation, not merely hover/focus. `src/main.ts:667`. |
| **2.1.1 Keyboard** | A | **met-with-evidence** — native controls plus explicit trim keys and typed alternatives; the earlier keyboard walk is recorded, but new-state AT verification remains pending. `src/ui/trim.ts:157`, `index.html:171`, `reviews/2026-10-01/vh-124/README.md:109`. |
| **2.1.2 No Keyboard Trap** | A | **met-with-evidence** — native dialog supplies modal containment with a Close action; help has Escape dismissal; no authored trap found. Native player/dialog behaviour still needs the human walk. `index.html:766`, `index.html:805`, `src/main.ts:677`. |
| **2.1.3 Keyboard, no exception** | AAA | **met-with-evidence** — picker substitutes for dropping; typing and buttons substitute for dragging; language and type choices are native radios. `index.html:115`, `index.html:171`, `src/ui/language-switcher.ts:64`. |
| **2.1.4 Character Key Shortcuts** | A | **n-a** — authored shortcuts use navigation keys/Escape, not unmodified character shortcuts. `src/ui/trim.ts:157`, `src/main.ts:677`. |
| **2.2.1 Timing Adjustable** | A | **met** — no deadline for user entry or confirmation; processing/watchdog timers govern work, not timed user responses. `src/main.ts:2593`, `src/config/thresholds.ts:37`. |
| **2.2.2 Pause, Stop, Hide** | A | **gap — applicability/evidence** — routine speech can be suppressed, but visible progress/time updates have no independent hide/frequency control. Establish and document any essential-progress exception; cancelling the underlying job is not by itself that analysis. `index.html:568`, `src/main.ts:1900`, `UI-STANDARDS.md:252`. |
| **2.2.3 No Timing** | AAA | **met** — no timed user decision; original preview is controllable and trim accepts typed values. `index.html:154`, `index.html:171`, `src/main.ts:2593`. |
| **2.2.4 Interruptions** | AAA | **met-with-evidence** — user setting suppresses routine stage/milestone speech; control-result text is read on demand, while consequential outcomes remain available. `src/ui/progress.ts:158`, `index.html:568`, `docs/01-specification.md:698`. |
| **2.2.5 Re-authenticating** | AAA | **n-a** — no app authentication/session re-entry process. `index.html:30`, `src/main.ts:1289`. |
| **2.2.6 Timeouts** | AAA | **n-a** — no user-inactivity expiry found; the worker/read-lease timers are operational limits. Tab lifetime is separately disclosed. `src/workers/retained.ts:58`, `src/main.ts:2189`, `src/main.ts:2991`. |
| **2.3.1 Three Flashes or Below Threshold** | A | **gap — conditional media** — the selected recording is not assessed for flashes. No autoplay does not establish flash safety. `index.html:154`, `docs/01-specification.md:715`. |
| **2.3.2 Three Flashes** | AAA | **gap — conditional media** — same unevaluated preview limitation. `index.html:154`, `docs/01-specification.md:715`. |
| **2.3.3 Animation from Interactions** | AAA | **met-with-evidence** — authored non-essential CSS movement honours reduced motion; preview seeking is the requested task feedback. `src/styles/app.css:496`, `src/ui/preview-seek.ts:25`. |
| **2.4.1 Bypass Blocks** | A | **met** — skip link targets main content. `index.html:18`, `index.html:30`. |
| **2.4.2 Page Titled** | A | **met** — descriptive title, translated with stage/outcome state. `index.html:6`, `src/main.ts:1937`, `src/ui/progress.ts:160`. |
| **2.4.3 Focus Order** | A | **met-with-evidence** — source order follows the task; disappearing controls use guarded handover; card refusal focuses a relevant field. `src/main.ts:824`, `src/main.ts:2482`, `src/main.ts:3162`. |
| **2.4.4 Link Purpose, in context** | A | **met** — support, translation and advice links identify their purpose; the external advice link says new tab. Interim team routing is a content issue to review. `src/ui/language-switcher.ts:142`, `src/ui/accessibility-statement.ts:119`, `index.html:748`. |
| **2.4.5 Multiple Ways** | AA | **n-a** — a single page/process, not a set requiring alternative navigation routes. `index.html:30`, `index.html:105`. |
| **2.4.6 Headings and Labels** | AA | **met** — numbered task headings, visible labels and statement subheadings describe their sections. C-03 concerns missing instructions, rather than absent field names. `index.html:105`, `index.html:258`, `index.html:669`. |
| **2.4.7 Focus Visible** | AA | **met-with-evidence** — authored focus styles cover controls, segmented radios and slider thumbs. Visibility at overlap/extreme layouts remains part of the following evidence gaps. `src/styles/app.css:108`, `src/styles/app.css:1089`, `src/styles/app.css:1350`. |
| **2.4.8 Location** | AAA | **n-a** — no location within a page set; numbered steps identify the single process. `index.html:105`, `index.html:517`. |
| **2.4.9 Link Purpose, link only** | AAA | **met** — standalone link text names its email/help destination or action, including the advice service and new tab. `src/i18n/en-GB.ts:75`, `src/i18n/en-GB.ts:810`, `src/i18n/en-GB.ts:850`. |
| **2.4.10 Section Headings** | AAA | **met** — task sections and the long accessibility statement have headings; short notices are named regions. `index.html:147`, `index.html:228`, `index.html:669`, `src/ui/notification.ts:43`. |
| **2.4.11 Focus Not Obscured, minimum** | AA | **gap — evidence** — no sticky page bands, but complete translated, enlarged, dialog and overlapping-thumb states have not been checked here. `src/styles/app.css:211`, `src/styles/app.css:1336`, `src/styles/app.css:1428`. |
| **2.4.12 Focus Not Obscured, enhanced** | AAA | **gap — evidence** — full visibility of the entire focused control needs the rendered matrix, not merely non-sticky layout. `src/styles/app.css:1336`, `docs/01-specification.md:831`. |
| **2.4.13 Focus Appearance** | AAA | **gap — evidence** — 2px rules and token contrast exist, but changed-pixel area/contrast of rendered indicators, notably inset circular thumbs, is not established. `src/styles/app.css:1350`, `src/styles/tokens.carbon.css:83`, `test/contrast.test.ts:121`. |
| **2.5.1 Pointer Gestures** | A | **met** — single-pointer alternatives exist for dropping and trimming. `index.html:115`, `index.html:171`, `index.html:182`. |
| **2.5.2 Pointer Cancellation** | A | **met** — committed actions use click; trim adjustments remain correctable and do not themselves create/discard an output. `src/main.ts:1798`, `src/main.ts:2569`, `src/main.ts:2593`. |
| **2.5.3 Label in Name** | A | **met-with-evidence** — visible labels name native inputs and buttons; the symbol help button has an explicit descriptive name. `index.html:171`, `index.html:419`, `src/ui/language-switcher.ts:68`. |
| **2.5.4 Motion Actuation** | A | **n-a** — no device-motion or user-motion command route. Authored commands use normal form/pointer/keyboard events. `src/main.ts:1798`, `src/main.ts:2569`. |
| **2.5.5 Target Size, enhanced** | AAA | **met-with-evidence** — authored buttons, segment faces, links requiring a standalone target and thumbs use the 44px floor; native player controls and inline text links have the stated exceptions. `src/styles/app.css:337`, `src/styles/app.css:1070`, `src/styles/app.css:1182`, `src/styles/app.css:1306`, `docs/01-specification.md:709`. |
| **2.5.6 Concurrent Input Mechanisms** | AAA | **met** — keyboard, pointer and native text-entry routes coexist; coarse-pointer styling hides only a hint, not an input route. `src/styles/app.css:623`, `src/main.ts:1798`, `src/main.ts:1818`. |
| **2.5.7 Dragging Movements** | AA | **met** — picker, typed times and Set here buttons provide non-drag alternatives. `index.html:115`, `index.html:171`, `index.html:182`. |
| **2.5.8 Target Size, minimum** | AA | **met-with-evidence** — authored target rules exceed the 24px minimum; native/inline exceptions remain bounded. `src/styles/tokens.carbon.css:91`, `src/styles/app.css:337`, `src/styles/app.css:1070`. |
| **3.1.1 Language of Page** | A | **met** — initial English declaration is replaced with the selected page language before repaint/announcement. `index.html:2`, `src/main.ts:3453`. |
| **3.1.2 Language of Parts** | AA | **gap — implementation** — autonyms, quoted closing words and English diagnostics are marked, but translated feedback guidance is inserted into the English block. C-05. `src/ui/language-switcher.ts:70`, `src/ui/video-language.ts:69`, `index.html:798`, `src/ui/feedback.ts:242`. |
| **3.1.3 Unusual Words** | AAA | **gap — coverage** — several technical terms have supporting meanings, but this does not establish complete equivalent definitions across the new translated surfaces. Native contextual review remains outstanding. `src/i18n/en-GB.ts:170`, `src/i18n/en-GB.ts:716`, `project/wish-list.md:29`. |
| **3.1.4 Abbreviations** | AAA | **gap — accepted limitations** — file-size units, UoN and the named codecs remain unexpanded by explicit decision. They are not passes. `docs/01-specification.md:723`, `docs/01-specification.md:728`, `docs/01-specification.md:732`. |
| **3.1.5 Reading Level** | AAA | **gap — evidence/content** — the inspected gate measures English with a rough formula; Chinese/Malay reading level is not established, and C-06 demonstrates a meaning error. `test/readability.test.ts:20`, `test/readability.test.ts:97`, `src/i18n/zh-Hans.ts:331`, `project/wish-list.md:29`. |
| **3.1.6 Pronunciation** | AAA | **n-a** — no identified authored term whose meaning depends on pronunciation; native review may change this judgement for translations. `src/i18n/en-GB.ts:37`, `src/i18n/zh-Hans.ts:71`, `src/i18n/ms-MY.ts:79`. |
| **3.2.1 On Focus** | A | **met** — focusing a control does not start work or navigate; actions require activation/change. `src/main.ts:608`, `src/main.ts:646`, `src/main.ts:2569`. |
| **3.2.2 On Input** | A | **met** — choice changes update in-page configuration; they do not unexpectedly submit or navigate. The scope explanation is nevertheless deficient under C-02. `src/main.ts:608`, `src/main.ts:646`, `src/main.ts:1548`. |
| **3.2.3 Consistent Navigation** | AA | **n-a** — no repeated navigation across separate pages. The language variants repaint one ordered page. `src/main.ts:3453`. |
| **3.2.4 Consistent Identification** | AA | **met** — repeated actions are composed from shared message keys and reusable controls. The Chinese heading/action wording still breaches the stronger local consistency rule in C-06. `src/main.ts:2046`, `src/main.ts:2090`, `src/main.ts:3465`. |
| **3.2.5 Change on Request** | AAA | **met-with-evidence** — changes follow explicit activation; asynchronous focus handover is conditional and avoids unrelated dialog work. `src/main.ts:824`, `src/main.ts:3430`. |
| **3.2.6 Consistent Help** | A | **n-a** — no set of pages with repeated help; within this page, help remains in the footer throughout work. `index.html:735`, `index.html:748`. |
| **3.3.1 Error Identification** | A | **met-with-evidence** — trim/card/feedback errors identify the issue in text, with field invalid states and descriptions where appropriate. `src/main.ts:1716`, `src/main.ts:2399`, `src/main.ts:2424`, `src/main.ts:3267`. |
| **3.3.2 Labels or Instructions** | A | **gap — implementation** — title/submission completion requirements are not stated before refusal, and submission inputs do not expose required state. C-03. `index.html:258`, `index.html:304`, `src/ui/title-card-step.ts:224`. |
| **3.3.3 Error Suggestion** | AA | **met** — named fields, valid formats, shorten/retry/change-output/report routes are supplied. `src/ui/trim.ts:63`, `src/ui/title-card-step.ts:249`, `src/ui/failure-text.ts:51`. |
| **3.3.4 Error Prevention, legal/financial/data** | AA | **met-with-evidence** — discard requires confirmation; saving checks against the source destination; email is reviewed in the user’s mail app. `src/main.ts:2593`, `src/media/save.ts:147`, `src/ui/feedback.ts:210`. |
| **3.3.5 Help** | AAA | **met** — contextual trim/onset/ID help and feedback/support routes exist. Their specific content defects are recorded separately. `index.html:215`, `index.html:428`, `index.html:361`, `index.html:735`. |
| **3.3.6 Error Prevention, all** | AAA | **met-with-evidence** — creation validates trim/card input; destructive replacement is confirmed; feedback remains reviewable before sending. `src/main.ts:2569`, `src/main.ts:2482`, `src/main.ts:2593`, `src/ui/feedback.ts:210`. |
| **3.3.7 Redundant Entry** | A | **met** — mode changes retain each side’s fields; unticking a card retains its words; language repaint retains values and draft state. `src/main.ts:2282`, `src/main.ts:2455`, `src/main.ts:3453`. |
| **3.3.8 Accessible Authentication, minimum** | AA | **n-a** — no authentication step in the audited application. Institutional hosting authentication is outside this source page. `index.html:30`, `project/profile.md:26`. |
| **3.3.9 Accessible Authentication, enhanced** | AAA | **n-a** — same boundary: no app authentication or cognitive test. `index.html:30`, `project/profile.md:26`. |
| **4.1.2 Name, Role, Value** | A | **met-with-evidence** — native form controls expose state; ranges have meaningful value text; disclosures and the dialog use native elements. C-04 is a visual disabled-state defect, not a missing native disabled state. `index.html:165`, `src/ui/trim.ts:143`, `index.html:646`, `index.html:766`. |
| **4.1.3 Status Messages** | AA | **gap — implementation** — main progress/result/save paths have live status, but preview failure and newly captured uncaught errors lack an explicit status announcement. `index.html:131`, `index.html:533`, `index.html:587`, `src/main.ts:1872`, `src/main.ts:952`. |

SC 4.1.1 Parsing is not an additional WCAG 2.2 criterion; it is therefore not an omitted row.

### What §9.3 should record

The existing exception structure is substantially better than on 1 October. It should remain a record of limitations, with criterion, reason, impact, mitigation and owner decision—not a means of marking a failed criterion as met. `docs/01-specification.md:677`.

| Record | Required treatment |
| --- | --- |
| **User-selected preview media** | Retain the conditional limitations for 1.2.1, 1.2.2, 1.2.3, 1.2.5–1.2.8, 2.3.1 and 2.3.2. Make the list precise: live captions, 1.2.4, are not applicable to this input. Keep the distinction between partial-conformance discussion and flash non-interference. `docs/01-specification.md:715`, `index.html:154`. |
| **File-size units, UoN and named codecs** | Keep the three recorded 3.1.4 exceptions with their existing reasons, impacts, mitigations and decisions. A closed disclosure is not itself an exemption. `docs/01-specification.md:723`, `docs/01-specification.md:728`, `docs/01-specification.md:732`. |
| **Current A/AA source defects** | If C-03, C-05 or the missing status announcements remain, record the affected criteria—3.3.2 A, 3.1.2 AA and 4.1.3 AA—and the concrete user impact and planned remedy. This report does not supply an owner acceptance decision. `index.html:304`, `src/ui/feedback.ts:242`, `src/main.ts:1872`, `src/main.ts:952`. |
| **Visible automatic updates** | Resolve the 2.2.2 applicability question explicitly: provide a suitable presentation control or document why the relevant updates are essential. Do not substitute the speech checkbox or loss of the whole job for that assessment. `src/main.ts:1900`, `index.html:568`. |
| **Unverified visual and language requirements** | Record missing evidence for enlargement, reflow, spacing, complete focus visibility/appearance and translated reading/terminology assessment as outstanding acceptance limitations. They are not proven failures merely because this review did not run a browser, and not passes merely because CSS tokens exist. `docs/01-specification.md:831`, `project/wish-list.md:28`, `project/wish-list.md:29`. |
| **WCAG’s own exceptions** | Keep native video target-size and logotype allowances separate from project exceptions. No new owner waiver is needed for the exceptions WCAG itself grants. `docs/01-specification.md:709`. |

### Accessibility statement: claim check

The statement’s **“partially compliant with WCAG 2.2 AA”** remains a cautious description, but its explanation is inadequate. Incomplete testing alone does not identify which requirements fail, and several listed limitations concern compatibility or AAA rather than a demonstrated AA failure. This audit identifies concrete A/AA problems and conditional media limitations that should underpin the statement’s account. It does not establish full AA conformance. Sources: `src/i18n/en-GB.ts:812`, `docs/01-specification.md:677`, `index.html:304`, `src/ui/feedback.ts:242`.

| Statement claim | Check against this audit |
| --- | --- |
| **Built for Chrome on a computer; other browsers may not work** | Supported as the product’s compatibility boundary. It is not, by itself, a failed WCAG criterion. The capability messaging is conditional rather than a universal Chrome guarantee. `project/profile.md:24`, `src/i18n/en-GB.ts:90`, `src/i18n/en-GB.ts:794`. |
| **Chinese and Malay are machine translations being checked by colleagues** | Machine status is supported by configuration and the publication decision. The record still carries native review as outstanding; the returned workbook did not constitute human corrections. The present-tense checking claim should match actual reviewer activity. `src/config/languages.ts:42`, `project/decisions.md:60`, `project/wish-list.md:29`, `src/i18n/en-GB.ts:795`. |
| **Chinese uses the computer’s own font and may differ** | Supported by the fallback stack. Font variation is a risk to test, not automatically non-compliance. Card fit and page fit need checking with the deployed fonts. `src/styles/tokens.brand.css:92`, `src/styles/tokens.brand.css:138`, `src/main.ts:2347`, `src/i18n/en-GB.ts:796`. |
| **Preview captions and flashing depend on the recording** | Correct, but incomplete: descriptions, sign language and a complete media alternative can also be missing. No autoplay does not establish flash safety. `src/i18n/en-GB.ts:797`, `docs/01-specification.md:715`, `index.html:154`. |
| **Some file-size and format abbreviations are unexpanded** | Correct and recorded under 3.1.4 AAA. UoN is another accepted example. These exceptions do not explain partial AA compliance on their own. `src/i18n/en-GB.ts:798`, `docs/01-specification.md:723`. |
| **Keyboard and screen-reader use** | Native semantics and guarded transitions provide substantial source support. Complete new-state AT evidence is absent, and some consequential updates are not announced. Do not turn “should be able to” into a verified claim yet. `src/main.ts:824`, `src/main.ts:1872`, `project/wish-list.md:30`, `project/wish-list.md:31`. |
| **200% zoom, own colours/high contrast and reduced movement** | CSS supports these aims. Reduced motion has an explicit rule; complete enlargement/forced-colour rendering still needs the required matrix. `src/styles/app.css:496`, `src/styles/app.css:1497`, `project/wish-list.md:28`. |
| **Plain words and strong contrast** | The token contrast evidence is useful. Plain-language coverage is narrower: the reading test is English-only and C-06 is a concrete translated meaning defect. `test/contrast.test.ts:129`, `test/readability.test.ts:20`, `src/i18n/zh-Hans.ts:331`. |
| **WAVE, 10 out of 10, 18 October** | The date and score are recorded as owner-supplied facts. No inspectable criterion report is supplied by `accessibility.ts`; this audit cannot validate the score or treat it as AA evidence. Preserve the provenance and identify the actual tool/report behind the number. `src/config/accessibility.ts:19`, `project/decisions.md:342`. |
| **Only automated checks / also checked by hand** | Inconsistent without qualification. Separate automated accessibility checks, manual layout work and the outstanding AT/user walk. C-07. `src/i18n/en-GB.ts:814`, `src/i18n/en-GB.ts:822`. |
| **Next tests not chosen** | This may describe scheduling, but the acceptance categories are already required. Say they are outstanding and distinguish them from optional additional tools. `src/i18n/en-GB.ts:826`, `docs/01-specification.md:831`, `project/backlog.md:34`. |
| **Contact and dates** | The owner’s address is consistently reused; preparation is 18 October and next review 18 November. The advice link opens a new tab and says so. These are supported implementation facts, not an assessment of the external service or legal wording. `src/config/accessibility.ts:14`, `src/config/accessibility.ts:30`, `src/ui/accessibility-statement.ts:119`. |
| **Equivalent translated statement** | Both translated tables carry the same substantive claims, including the evidence inconsistency. Correct the claims in all three tables; native wording review remains separate. `src/i18n/zh-Hans.ts:696`, `src/i18n/ms-MY.ts:751`. |

## 6. What only a person can judge

The October list remains necessary. None of the following is claimed as completed by this audit.

1. **Three to five first-time staff, using their own recordings unaided.** Retain the original observations: finding Create and Save, understanding Cut/None and Larger/Smaller, expectations of the preview, whether warnings seem to prohibit continuation, and finding the downloaded file. Add the distinction between page language and video language, the two video types, optional versus compulsory card fields, and whether changes during a job are understood to affect the next one. Sources: `reviews/2026-10-01/uon-video-helper-ux-review-2026-10-01.md:678`, `src/main.ts:604`, `src/main.ts:620`, `index.html:228`.

2. **NVDA with Chrome, and VoiceOver with Safari and Chrome.** Repeat the full focus and announcement walk, including both trim handles and the native player. Add all three language selectors, machine-translation notice, foreign-language closing quotes and auto-filled dates, card limits/refusals, submission IDs, concurrent check/save statuses, decode-damage times and the time-left milestones. Listen for omissions and competing announcements, not merely the presence of live regions. Sources: `reviews/2026-10-01/uon-video-helper-ux-review-2026-10-01.md:683`, `project/wish-list.md:28`, `project/wish-list.md:30`, `project/wish-list.md:31`, `project/wish-list.md:32`, `project/wish-list.md:33`, `project/wish-list.md:35`.

3. **Real phones: Chrome on Android and Safari on iPhone, including iPad behaviour where supported.** Retain capability warning, trim keyboard, touch, backgrounding and save/retrieval checks. Add eight student IDs: the field requests a numeric keyboard while its accepted separators are spaces, commas or new lines. Source alone cannot establish which separator keys each actual keyboard offers. Also check long Malay labels, the freeze-frame option and the feedback dialog with the keyboard open. Sources: `reviews/2026-10-01/uon-video-helper-ux-review-2026-10-01.md:686`, `index.html:358`, `src/ui/title-card-step.ts:184`, `src/styles/app.css:1400`, `src/styles/app.css:1428`.

4. **Native Chinese and Malay review in the task, not just a string sheet.** Check terminology, tone, reading level, dates, units, student identifiers and error recovery. Include switching page language during invalid input, while a result is retained and while feedback is drafted; test Chinese composition, full-width input and paste at field limits. Sources: `project/wish-list.md:29`, `src/main.ts:2553`, `src/ui/title-card-step.ts:184`, `src/main.ts:3453`.

5. **Speech input with Voice Control or Dragon.** Carry forward Create, Set start here and the question-mark help button; add repeated language names in two different groups, the locked card controls and all submission fields. Sources: `reviews/2026-10-01/uon-video-helper-ux-review-2026-10-01.md:689`, `src/ui/language-switcher.ts:64`, `index.html:304`, `index.html:419`.

6. **Real Windows contrast themes and the complete visual matrix.** Check light/dark/forced colours, 200% text enlargement, 320px reflow, text-spacing overrides, focus-ring area and overlapping thumbs. Add all switcher choices, the disabled ID textarea, open statement and long translated disclosures. Token tests cannot settle these rendered questions. Sources: `reviews/2026-10-01/uon-video-helper-ux-review-2026-10-01.md:691`, `docs/01-specification.md:831`, `src/styles/app.css:1350`, `src/styles/app.css:1451`.

7. **Managed University Windows laptop.** Retain OneDrive-folder saving, email handoff, clipboard fallback, wake protection, sleep/background behaviour and return to the page. Exercise a previous-result save while the next recording is checked, and delayed cleanup after a completed write. Sources: `reviews/2026-10-01/uon-video-helper-ux-review-2026-10-01.md:693`, `src/main.ts:3036`, `src/main.ts:3139`, `src/main.ts:3164`.

8. **The produced video and sound.** Watch staff and submission cards at full size in every language, including portrait output, maximum field lengths and eight IDs; inspect every closing/internal variant. Listen to the heavily limited Teams output and the decode-damage silence boundaries. Watch remaining-time stability on a recording of at least half an hour, including the subsequent Finishing and Checking stages. Sources: `project/wish-list.md:20`, `project/wish-list.md:30`, `project/wish-list.md:31`, `project/wish-list.md:32`, `project/wish-list.md:35`.

## 7. Set aside, with reasons

- **Folding the setup steps or replacing this with a wizard.** Page length alone does not establish that staff lose their place. The old recommendation remains: resolve contradictory states and observe use before promoting VH-97. `reviews/2026-10-01/uon-video-helper-ux-review-2026-10-01.md:656`, `project/backlog.md:45`.

- **Renaming the settled closing and output choices.** Animation onset, the freeze-frame option, Cut/None and Larger/Smaller are established choices with explanatory text. Their comprehension belongs in the pilot; the concrete Chinese inconsistencies in C-06 are a different matter. `reviews/2026-10-01/uon-video-helper-ux-review-2026-10-01.md:641`, `src/i18n/en-GB.ts:300`, `src/i18n/en-GB.ts:347`.

- **Reopening the universal notification component solely on stylistic grounds.** The earlier critique disputed it, but the current house standard explicitly adopts it. This report judges whether the result, confirmation, warning and failure retain their distinct purpose and actions. `reviews/2026-10-01/vh-124/codex-astra-critique-2026-10-01.md:77`, `UI-STANDARDS.md:215`, `src/ui/notification.ts:43`.

- **Removing required reassurance as repetition.** Original-file safety, unsaved-result lifetime, download uncertainty and nonblocking-warning explanations answer different consequential questions. They should remain near the relevant action. `docs/01-specification.md:626`, `docs/01-specification.md:637`, `docs/01-specification.md:665`.

- **Demanding a finished-card or closing preview as part of this audit.** The current preview is explicitly the original. A closing preview already has its own open item; this audit does not expand that scope. `src/i18n/en-GB.ts:197`, `project/backlog.md:51`.

- **Treating the shared footer email address as an accidental routing bug.** Both team links deliberately use the owner’s address until team addresses are supplied. That is recorded and has an existing review item. The interim recipient should be clear to the user, but this review cannot infer that the owner does not handle those enquiries. `src/config/feedback.ts:16`, `project/decisions.md:340`, `project/backlog.md:34`.

- **Treating machine translation or a different Chinese font as an automatic blanket WCAG exception.** Both require contextual assessment. C-05 and C-06 identify concrete problems; other untranslated meaning, pronunciation or fit concerns remain human checks rather than invented failures. `src/config/languages.ts:42`, `src/styles/tokens.brand.css:92`, `project/wish-list.md:29`.

- **Native player target dimensions as an authored-control defect.** The native-control exception remains applicable. It does not exempt the preview’s media content or prove keyboard, caption or flash accessibility. `docs/01-specification.md:709`, `docs/01-specification.md:715`.

- **The unused target-missed warning as a reachable page state.** The worker verifies the output and refuses failed loudness/peak results. A dormant wording branch is not evidence that the page currently offers such a result. `src/ui/warning-text.ts:70`, `src/workers/job.worker.ts:284`.

- **New claims about DSP correctness, encoding performance, HDR treatment, network egress or external legal/service wording.** This is the requested page audit. No media was processed, external destination inspected or acceptance gate run; the relevant existing checks and owner tasks are not silently replaced by source inference. `docs/01-specification.md:827`, `docs/01-specification.md:851`, `project/backlog.md:35`, `project/backlog.md:50`.
