# Codex astra — spec gap review for UX and accessibility, 1 October 2026

The independent source-and-spec half of the review in
[spec-ux-accessibility-gaps-2026-10-01.md](spec-ux-accessibility-gaps-2026-10-01.md),
by Codex astra (`gpt-6-astra`, read-only) from the brief below the line, kept as
written. Its S-/T-numbers map to A-numbers in that report; its criterion table
is adopted there.

---

Band 6 addresses the previous review’s app defects, but completing its current “Done when” clauses would not establish excellent UX or WCAG 2.2 AAA. The main omissions are measurable accessibility acceptance, user control over interruptions, text customisation, safe focus behaviour, complete save/reload guidance, result identity, and multilingual interaction checks. The specification’s weaker accessibility wording also omits the exception discipline already settled in D6. This review covers commit `1b2fb92`; findings below concern requirements and ticket coverage, not a new running-app audit.

## Spec and standards findings

### S-01 Make the accessibility target enforceable

**Where:** Spec §9.3 and §13; UI-STANDARDS “Design review gate”.

**Says:** “WCAG 2.2 AA minimum, AAA where achievable.”

**Gap:** “Where achievable” does not require the documented, argued exceptions demanded by the rulebook. D6 already resolves the intended policy; this needs reconciliation, not another target decision. Section 13 can pass without an accessibility assessment.

**Proposed correction:** “AA is the minimum; every applicable AAA criterion is required by default, with each exception recording the affected criterion, reason, user impact, mitigation and maintainer decision. Acceptance includes a criterion-by-criterion assessment of the complete workflow and supported language variants; an accepted exception is not a passed criterion or a full AAA conformance claim.”

**Source:** `docs/01-specification.md:530`, `docs/01-specification.md:584`, `docs/03-open-decisions.md:106`, `AGENTS.md:190`, `UI-STANDARDS.md:185`, `UI-STANDARDS.md:289`. WCAG distinguishes achieved conformance from progress towards a higher level: [W3C conformance guidance](https://www.w3.org/WAI/WCAG22/Understanding/conformance).

**Rank:** 2.

### S-02 Specify text customisation, zoom and reflow

**Where:** Spec §9.3–§9.4; UI-STANDARDS “Perceivable”; SC 1.4.4, 1.4.8, 1.4.10, 1.4.12.

**Says:** “Responsive and fully readable on phones and tablets”; otherwise silent on measurable text adaptation.

**Gap:** Responsive layout and dark mode do not establish AAA visual presentation. The requirements omit user-selected text/background colours, adjustable line lengths and paragraph spacing, text enlargement, and preservation under spacing overrides. Chinese adds the 40-glyph provision. Existing CSS and tests cannot establish these outcomes.

**Proposed correction:** “Provide or support an identified user-agent mechanism for all SC 1.4.8 text-presentation adjustments, including colours, line length, spacing and enlargement; brand rules must yield to user accessibility overrides. Verify every workflow state at 200% text enlargement, 320 CSS-pixel reflow and the SC 1.4.12 spacing overrides, including translated copy, dialogs and errors.”

**Source:** `src/styles/app.css:148`, `src/styles/app.css:156`, `src/styles/app.css:162`, `src/styles/app.css:745`, `src/styles/app.css:1110`; `test/stylesheet.test.ts:4`. [Visual presentation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html), [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [text spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html).

**Rank:** 2.

### S-03 Define focus appearance beyond “visible”

**Where:** Spec §9.3; UI-STANDARDS “Operable” and “Design review gate”; SC 2.4.13.

**Says:** “Focus indicators must be visible and not obscured by sticky headers or overlays.”

**Gap:** The standards omit the measurable AAA focus-area and focused/unfocused contrast requirements. The contrast test compares focus tokens with surfaces; it does not measure the rendered indicator’s area or the pixels changed by focus. This is an acceptance gap, not a demonstrated failure of the existing rings.

**Proposed correction:** “Author-styled focus indicators must satisfy SC 2.4.13’s minimum indicator area and 3:1 contrast between the same pixels in focused and unfocused states. Verify the rendered indicators on buttons, segments, slider thumbs and dialog controls in every colour context, alongside complete focus non-obscuration.”

**Source:** `UI-STANDARDS.md:200`, `UI-STANDARDS.md:278`, `src/styles/app.css:73`, `src/styles/app.css:834`, `src/styles/app.css:997`, `test/contrast.test.ts:114`. [Focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html).

**Rank:** 2.

### S-04 User control must govern announcements and asynchronous focus

**Where:** Spec §9.3; UI-STANDARDS “System status” and “Understandable”; SC 2.2.4, 3.2.5.

**Says:** “screen-reader-announced progress via a polite live region”; “No unexpected context changes on focus or input.”

**Gap:** Fewer announcements remain unsolicited interruptions unless users can suppress or postpone them. The context-change rule also omits asynchronous completion: VH-111’s unconditional focus transfer could interrupt someone typing feedback. “Polite” governs announcement priority, not user consent.

**Proposed correction:** “Users can suppress or postpone routine progress announcements while retaining an accessible way to inspect current status; consequential warnings remain available. Move focus when an explicit action removes its focused control, but asynchronous completion must not take focus from another task or open dialog without user request or an opt-out mechanism.”

**Source:** `index.html:296`, `index.html:343`, `src/main.ts:1072`, `src/main.ts:1391`, `src/main.ts:1676`, `pm_skills/project/backlog.md:165`, `pm_skills/project/backlog.md:176`. [Interruptions](https://www.w3.org/WAI/WCAG22/Understanding/interruptions.html), [change on request](https://www.w3.org/WAI/WCAG22/Understanding/change-on-request.html).

**Rank:** 2.

### S-05 Define what Save establishes, and how users find the file

**Where:** Spec §9.1 step 5 and §9.4.

**Says:** “‘Save the video’ when it is done.”

**Gap:** There is no contractual distinction between a completed picker write and a download handed to the browser. VH-114’s sentence after “Saved” does not cover the fallback, which never reaches that message. Phone users need a verified retrieval route, not an assumed folder or an implication that publishing has happened.

**Proposed correction:** “Distinguish creation, saving, completed file writes and browser download hand-off; never claim a fallback download has completed when the app cannot observe completion. Give the output name, destination information actually known, tested phone/download retrieval guidance, and the next steps to check the file, publish it separately or choose another video.”

**Source:** `src/media/save.ts:126`, `src/media/save.ts:147`, `src/main.ts:1558`, `src/main.ts:1568`, `src/main.ts:1586`, `src/main.ts:1589`, `pm_skills/project/backlog.md:213`.

**Rank:** 1.

### S-06 Explain session lifetime before users can lose work

**Where:** Spec §7.3, §7.5 and §9.1.

**Says:** “Register a `beforeunload` warning while a job is running.”

**Gap:** The source protects streaming saves and unsaved results too, but neither document defines what survives reload, closing or browser suspension. The keep-tab-open notice is tied to long jobs even though short jobs and unsaved outputs also depend on the tab. A wake lock is best effort and failure is currently logged quietly.

**Proposed correction:** “Before processing, explain that the tab holds the current work, that reload/closure does not resume the job or restore an unsaved result, and that the original remains unchanged; repeat the relevant warning while a result awaits saving. Request wake protection during processing and streaming saves, warn before leaving whenever work is at risk, and explain that device sleep, browser suspension or denied wake protection can still interrupt the task.”

**Source:** `docs/01-specification.md:419`, `docs/01-specification.md:431`, `src/core/keep-awake.ts:43`, `src/core/keep-awake.ts:85`, `src/core/keep-awake.ts:123`, `src/main.ts:1141`, `src/media/opfs.ts:177`.

**Rank:** 1.

### S-07 A result needs its own choices, not just its source filename

**Where:** Spec §9.1; UI-STANDARDS “Recognition over recall”.

**Says:** Silent on result identity and repeat-use state.

**Gap:** VH-107 requires naming the previous source, but two outputs from the same source can have different trims, presets and closing choices. Naming that source alone still permits saving the wrong version. The retained result presently contains neither the trim nor the output preset.

**Proposed correction:** “Keep each result associated with an immutable summary of its source, kept range, output choice and requested/applied closing, distinct from the controls for the next job. Choosing another source resets trim to the whole video, makes retained choices clear, and preserves the previous result until an explicit save/discard decision.”

**Source:** `src/main.ts:619`, `src/main.ts:646`, `src/main.ts:886`, `src/main.ts:1121`, `src/main.ts:1505`, `pm_skills/project/backlog.md:128`.

**Rank:** 1.

### S-08 “Plain language” needs definitions and a reading-level criterion

**Where:** Spec §9.2; UI-STANDARDS “Content and form” and “Help”; SC 3.1.3–3.1.5.

**Says:** “Plain language throughout”; “Use user language, not implementation terms.”

**Gap:** Removing LUFS and codec words from the main path does not address specialised terms elsewhere. “Animation onset”, “frame”, “track”, “container”, “mono”, “fps”, “kHz” and file-size abbreviations need understandable meanings where retained. A closed disclosure is still page content. No reading-level assessment is required.

**Proposed correction:** “Replace unnecessary jargon and provide accessible meanings or expansions for retained specialist words and abbreviations throughout the interface, including disclosures. Assess explanatory copy against lower-secondary reading ability and provide simpler supporting content where needed, with equivalent native-language review for translations.”

**Source:** `index.html:192`, `index.html:220`, `src/ui/source-panel.ts:140`, `src/ui/source-panel.ts:167`, `src/ui/format.ts:44`, `src/ui/format.ts:62`, `test/screen-text.test.ts:27`. [Unusual words](https://www.w3.org/WAI/WCAG22/Understanding/unusual-words.html), [abbreviations](https://www.w3.org/WAI/WCAG22/Understanding/abbreviations.html), [reading level](https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html).

**Rank:** 2.

### S-09 Specify language switching as an accessible state transition

**Where:** Spec §9; UI-STANDARDS “Understandable”; SC 3.1.1, 3.1.2, 3.2.5, 4.1.2.

**Says:** Silent. VH-105 supplies part of the future contract.

**Gap:** VH-105 already requires changing page `lang`, retaining video/trim/running jobs, local persistence and native review. Missing are language identification on switch options and retained English passages, focus and selection semantics, unsaved-result/draft preservation, and agreement between translated time display and accepted input.

**Proposed correction:** “A keyboard-, touch- and speech-operable language selector exposes its selected state and each option’s language, updates page language before announcements, and marks retained foreign-language passages appropriately. Switching preserves focus, pending input/errors, every job choice, unsaved results and feedback drafts; displayed time formats and examples remain accepted by the parser.”

**Source:** `index.html:2`, `index.html:357`, `src/ui/trim.ts:20`, `src/ui/trim.ts:36`, `src/main.ts:1141`, `src/main.ts:1653`, `pm_skills/project/backlog.md:215`. [Language of parts](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html).

**Rank:** 2.

### S-10 Caption-loss warnings need a publishing consequence

**Where:** Spec §8.1–§8.3 and §9.1.

**Says:** “no caption reaches the output”; captions are generated by EchoVideo after upload.

**Gap:** The first statement needs to distinguish separate caption tracks from captions already drawn into the picture. The EchoVideo workflow does not cover direct sharing, and retaining the original alongside does not make the new MP4 accessible. Extra discarded audio/video tracks could also contain accessibility alternatives.

**Proposed correction:** “The app does not create or preserve separate caption tracks; captions already in the picture remain picture content, subject to the chosen trim and closing overlay, and a negative track scan is not an accessibility assessment. Before publication, users must check the resulting video and arrange the captions and other alternatives its destination requires; loss guidance must explain this consequence without requiring caption authoring in this app.”

**Source:** `docs/01-specification.md:456`, `docs/01-specification.md:463`, `src/ui/source-panel.ts:55`, `src/ui/source-panel.ts:72`, `src/ui/source-panel.ts:185`, `src/media/pipeline.ts:539`. [Prerecorded captions](https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html).

**Rank:** 1.

### S-11 User-selected preview media cannot receive a blanket exemption

**Where:** Spec §9.1–§9.3 and §13; UI-STANDARDS “Motion discipline”; SC 1.2.1–1.2.8, 2.3.1–2.3.2.

**Says:** “a preview in the browser’s own player”; “No content flashing more than 3 times per second.”

**Gap:** A user-selected recording is prerecorded media presented on the page. Native controls do not supply missing captions, descriptions, sign interpretation or a media alternative, and user-initiated playback does not establish flash safety. This is a scope/evidence gap; no particular recording is declared inaccessible here.

**Proposed correction:** “Evaluate media criteria conditionally for the recording shown in the preview, recording absent or unevaluated alternatives and flash safety as limitations rather than ‘not applicable’. Distinguish interface accessibility targets from full-page and exported-media conformance, and require suitable alternatives and flash checks for any app-supplied instructional media.”

**Source:** `index.html:102`, `src/main.ts:886`, `test/screen-text.test.ts:346`, `UI-STANDARDS.md:171`. Full-page claims cannot simply exclude the player: [conformance guidance](https://www.w3.org/WAI/WCAG22/Understanding/conformance); [three flashes](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes.html).

**Rank:** 2.

### S-12 Recommend Chrome without promising an untested outcome

**Where:** Spec §7.3 and §10.

**Says:** “name Chrome as the one that will work”.

**Gap:** The specification mandates a certainty its per-configuration capability checks cannot establish. VH-108 corrects the decode-block remedy, but equivalent promises remain for encoding and working storage. Managed-device restrictions and unavailable disk space are not resolved merely by naming a browser.

**Proposed correction:** “Describe Chrome on a computer as the supported recommendation, not a guarantee that this file and device will work. Each block must distinguish the tested cause and offer an applicable recovery or support route, including when the user already uses Chrome or cannot change browser.”

**Source:** `docs/01-specification.md:421`, `docs/01-specification.md:555`, `src/media/capability.ts:108`, `src/media/capability.ts:149`, `src/ui/preflight-panel.ts:27`, `src/ui/preflight-panel.ts:40`, `pm_skills/project/backlog.md:145`.

**Rank:** 2.

### S-13 Promote the feedback route into the product contract

**Where:** Spec §9; UI-STANDARDS “Help and contextual guidance” and “Diagnostics affordance”.

**Says:** Spec silent; standards describe the production diagnostics reader.

**Gap:** Useful behaviour exists only in source: feedback during a job, visible recipient/details, email hand-off and clipboard/manual-copy fallback. The specification does not guarantee these routes or identify accessibility support. The dialog promises a reply without a documented service commitment.

**Proposed correction:** “Provide an accessible feedback and accessibility-help route throughout the workflow, including blocked and running states, with an identified recipient and an alternative when email hand-off or clipboard access fails. Explain and expose the diagnostic details before hand-off, preserve the draft and job, and state only support-response commitments the maintainer has established.”

**Source:** `index.html:343`, `index.html:360`, `index.html:378`, `src/main.ts:1676`, `src/main.ts:1733`, `src/main.ts:1757`, `src/ui/feedback.ts:96`, `UI-STANDARDS.md:253`.

**Rank:** 2.

## Ticket findings

### T-01 Add an owner for the complete accessibility acceptance record

**VH item:** No Band 6 item owns S-01 or the complete criterion matrix.

**Missing clause:** “Done when the specification/standards corrections have a maintainer disposition, every applicable criterion has evidence or a recorded limitation, and the complete workflow is checked with the agreed assistive-technology/device matrix.”

VH-M4 mentions screen readers, speech input, phones and high contrast in its intent, but its “Done when” requires only three staff observations and filing findings. Those other checks need explicit completion or deferral: `pm_skills/project/backlog.md:290`.

### T-02 Extend the visual checks beyond forced colours

**VH item:** VH-112, with VH-113 and VH-105.

**Missing clause:** “Verify rendered focus area and focused/unfocused contrast, complete non-obscuration, text enlargement, reflow, spacing overrides and supported text customisation across all states and languages.”

This adds S-02/S-03; it does not repeat U-11’s forced-colours defect. Current boundary: `pm_skills/project/backlog.md:187`.

### T-03 Milestone announcements alone do not close 2.2.4

**VH item:** VH-109.

**Missing clause:** “Users can suppress/postpone routine announcements and inspect current progress on demand without cancelling processing; any applicable pause/hide requirement for updating presentation is also satisfied.”

“Stages and a few milestones” leaves S-04 open: `pm_skills/project/backlog.md:165`.

### T-04 Make focus hand-offs conditional and finish U-10’s coverage

**VH item:** VH-111.

**Missing clause:** “Completion does not steal focus from feedback or another active task; disappearing focused controls receive a deliberate successor. Check announcements for pre-flight sound warnings, output warnings, missing/substituted branding and save outcomes, as well as caption counts and failure advice.”

The current “Done when” names only read-loss counts and failure advice, despite the broader intent. See `pm_skills/project/backlog.md:173`, `pm_skills/project/backlog.md:176`; S-04.

### T-05 Retain an output’s complete identity

**VH item:** VH-107.

**Missing clause:** “The retained result and discard question identify the original job’s trim, preset and closing choices, including when the source filename is unchanged; changing current controls never relabels that result.”

This closes S-07 beyond “names its file as the previous video”: `pm_skills/project/backlog.md:130`.

### T-06 Cover both save routes through retrieval

**VH item:** VH-107, VH-113 and VH-114.

**Missing clause:** “Exercise picker success/cancellation/failure and download fallback; distinguish hand-off from completion, retain retry where possible, and let a novice locate the correct file on each tested phone. Starting another video during an unconfirmed download explains the consequence; successful saving explains separate publication.”

A sentence after “Saved” misses the fallback branch entirely. See `pm_skills/project/backlog.md:200`, `pm_skills/project/backlog.md:213`; S-05.

### T-07 Assign session-loss and wake-protection guidance

**VH item:** Unowned in Band 6; extend VH-113 for devices, with explicit lifecycle ownership.

**Missing clause:** “State what survives reload/closure, show keep-open guidance independently of estimate length, and verify denied/released wake locks, backgrounding and return-to-tab outcomes without promising recovery.”

VH-110’s cancellable check/save work does not cover this. See `pm_skills/project/backlog.md:154`; S-06.

### T-08 Include definitions and reading ability in the copy pass

**VH item:** VH-114.

**Missing clause:** “Review all user-reachable copy, including technical disclosures, for unexplained specialised terms and abbreviations; supply meanings where retained and assess lower-secondary readability. Keep necessary time/file-size information understandable rather than deleting useful units indiscriminately.”

See `pm_skills/project/backlog.md:211`; S-08. This extends, rather than re-reports, U-23.

### T-09 Test multilingual behaviour, not only translation completeness

**VH item:** VH-105.

**Missing clause:** “Verify selector semantics, language-of-parts, focus retention, pending invalid input, unsaved output, all choices and feedback drafts; translated displayed times round-trip through input parsing. Test persisted preference failure, CJK font fallback, expanded text, screen-reader language changes and keyboard/touch/speech operation.”

The current key-parity, page-`lang`, job-preservation and native-review clauses should remain. See `pm_skills/project/backlog.md:237`; S-09.

### T-10 Assign media-accessibility limitations and publishing guidance

**VH item:** No complete owner; VH-111 owns announcing loss, VH-114 can own the wording.

**Missing clause:** “Document preview-media applicability and limitations for the relevant A–AAA criteria; distinguish separate caption tracks from captions in the picture and give destination-appropriate accessibility follow-through after export.”

Announcing a loss does not resolve S-10/S-11. See `pm_skills/project/backlog.md:177`.

### T-11 Generalise capability recovery beyond the decode block

**VH item:** VH-108 and VH-110.

**Missing clause:** “Every browser/storage/encoding block avoids an unconditional Chrome guarantee, handles the user already being in Chrome, and offers an actionable route when switching browser is unavailable.”

See `pm_skills/project/backlog.md:145`, `pm_skills/project/backlog.md:154`; S-12.

### T-12 Make feedback part of acceptance

**VH item:** No Band 6 owner; VH-105 necessarily affects it.

**Missing clause:** “Verify feedback during processing and blocked states, keyboard/modal focus return, retained drafts, disclosed details, email-app absence and clipboard failure; the selected-language help remains understandable and response expectations match the support owner’s commitment.”

See `index.html:357`, `src/main.ts:1733`, `src/main.ts:1757`; S-13.

## WCAG 2.2 criterion table

All **86 current criteria** are listed in order against [WCAG 2.2](https://www.w3.org/TR/WCAG22/). **Met** means sufficiently required by the specification/standards, not verified in the running app. **Met-in-source** means source establishes the relevant behaviour despite a missing explicit requirement. **Gap** includes missing acceptance requirements and conditional media limitations; it does not automatically mean a reproduced app failure. **N-a** records the current applicability boundary.

| Criterion | Level | Verdict | Note |
| --- | --- | --- | --- |
| 1.1.1 Non-text Content | A | met | Text alternatives required: `UI-STANDARDS.md:195`; logo alternative: `src/ui/brand-assets.ts:52`. |
| 1.2.1 Audio-only and Video-only, prerecorded | A | gap | Silent-video preview can apply; alternatives unspecified. S-11/T-10; `index.html:102`. Audio-only input refused: `src/media/inspect.ts:229`. |
| 1.2.2 Captions, prerecorded | A | gap | No guarantee of captions in the selected preview; publishing limitation needs explicit treatment. S-10/S-11/T-10. |
| 1.2.3 Audio Description or Media Alternative | A | gap | Selected recording may need visual information described; no documented provision or assessment. S-11/T-10. |
| 1.2.4 Captions, live | AA | n-a | Local prerecorded files only; no live-media input: `index.html:70`, `src/main.ts:886`. |
| 1.2.5 Audio Description, prerecorded | AA | gap | Conditional on visual information absent from sound; no assessment contract. S-11/T-10. |
| 1.2.6 Sign Language, prerecorded | AAA | gap | Prerecorded speech may be previewed without sign interpretation; cannot blanket-exempt it. S-11/T-10. |
| 1.2.7 Extended Audio Description | AAA | gap | Conditional where ordinary pauses are insufficient; no applicability assessment. S-11/T-10. |
| 1.2.8 Media Alternative, prerecorded | AAA | gap | No complete text alternative assured for selected video. S-11/T-10. |
| 1.2.9 Audio-only, live | AAA | n-a | No live audio; audio-only files are refused: `src/media/inspect.ts:229`. |
| 1.3.1 Info and Relationships | A | met | Semantic HTML, labels and landmarks required: `UI-STANDARDS.md:109`, `UI-STANDARDS.md:195`, `UI-STANDARDS.md:219`. |
| 1.3.2 Meaningful Sequence | A | met | Ordered workflow and logical focus required: `docs/01-specification.md:495`, `UI-STANDARDS.md:201`. |
| 1.3.3 Sensory Characteristics | A | met-in-source | Instructions use named controls/actions rather than shape or location alone: `index.html:98`, `index.html:219`. |
| 1.3.4 Orientation | AA | met-in-source | No orientation restriction; responsive wrapping: `index.html:5`, `src/styles/app.css:705`. Real-device check remains. |
| 1.3.5 Identify Input Purpose | AA | n-a | No fields collecting the enumerated personal-data purposes; feedback is free text: `index.html:366`. |
| 1.3.6 Identify Purpose | AAA | met | Semantic controls and named regions required: `UI-STANDARDS.md:195`, `UI-STANDARDS.md:219`; examples at `index.html:62`. |
| 1.4.1 Use of Color | A | met | Explicit prohibition: `UI-STANDARDS.md:193`; existing swatch defects remain VH-112’s work. |
| 1.4.2 Audio Control | A | met-in-source | Preview does not autoplay and has native controls: `index.html:102`, `test/screen-text.test.ts:346`. |
| 1.4.3 Contrast, minimum | AA | met | Stronger text requirement already specified: `UI-STANDARDS.md:191`. |
| 1.4.4 Resize Text | AA | gap | No explicit enlargement acceptance across all states. S-02/T-02; relative tokens alone are insufficient evidence. |
| 1.4.5 Images of Text | AA | met-in-source | App text is HTML; supplied UI image is the logo: `index.html:30`, `src/ui/brand-assets.ts:47`. |
| 1.4.6 Contrast, enhanced | AAA | met | Explicit 7:1/4.5:1 contract: `UI-STANDARDS.md:191`; enumerated pairs tested at `test/contrast.test.ts:131`. |
| 1.4.7 Low or No Background Audio | AAA | n-a | No prerecorded audio-only presentation; video audio is outside this criterion’s specific scope. `src/media/inspect.ts:229`. |
| 1.4.8 Visual Presentation | AAA | gap | No identified mechanism covering all presentation adjustments. S-02/T-02. |
| 1.4.9 Images of Text, no exception | AAA | met-in-source | HTML text; logo uses the essential-presentation exception: `src/ui/brand-assets.ts:47`. |
| 1.4.10 Reflow | AA | gap | “Responsive” lacks a complete-state measurable acceptance condition. S-02/T-02. |
| 1.4.11 Non-text Contrast | AA | met-in-source | Author colours include tested borders/progress: `test/contrast.test.ts:114`; forced-colours remediation already VH-112. |
| 1.4.12 Text Spacing | AA | gap | No regression acceptance for overrides across every state/language. S-02/T-02. |
| 1.4.13 Content on Hover or Focus | AA | n-a | Current help opens by activation, not hover/focus: `src/main.ts:276`. Reassess if tooltips are introduced. |
| 2.1.1 Keyboard | A | met | All functionality required to work by keyboard: `UI-STANDARDS.md:200`. |
| 2.1.2 No Keyboard Trap | A | met | Explicit no-trap rule: `UI-STANDARDS.md:200`; native player/dialog still require manual verification. |
| 2.1.3 Keyboard, no exception | AAA | met | Rule covers all functionality without a path-dependent exception: `UI-STANDARDS.md:200`; trim alternatives at `index.html:119`. |
| 2.1.4 Character Key Shortcuts | A | n-a | No authored single-character shortcuts; handlers use Escape/navigation keys: `src/main.ts:285`, `src/ui/trim.ts:120`. |
| 2.2.1 Timing Adjustable | A | met-in-source | No deadline for user input/decisions; worker timers monitor processing: `src/core/watchdog.ts:21`, `src/main.ts:1305`. |
| 2.2.2 Pause, Stop, Hide | A | met | Explicit requirement at `UI-STANDARDS.md:207`; T-03 ensures presentation control is not confused with cancelling a job. |
| 2.2.3 No Timing | AAA | met-in-source | No timed user response; preview can pause and trim accepts typed times: `index.html:102`, `index.html:119`. |
| 2.2.4 Interruptions | AAA | gap | Reducing announcement frequency supplies no user suppression mechanism. S-04/T-03. |
| 2.2.5 Re-authenticating | AAA | n-a | App has no authenticated session. Reassess if hosting adds authentication to the process; spec §3.1. |
| 2.2.6 Timeouts | AAA | n-a | No user-inactivity expiry found; worker-silence/read-lease timers are different. `src/core/watchdog.ts:21`, `src/workers/retained.ts:58`. |
| 2.3.1 Three Flashes or Below Threshold | A | gap | UI rule is stronger, but selected preview media is unevaluated; non-interference still matters. S-11/T-10. |
| 2.3.2 Three Flashes | AAA | gap | No flash-safety evidence for arbitrary preview content; autoplay prevention is not that evidence. S-11/T-10. |
| 2.3.3 Animation from Interactions | AAA | met | Non-essential motion can be reduced/disabled: `UI-STANDARDS.md:286`, `src/styles/app.css:357`. |
| 2.4.1 Bypass Blocks | A | met-in-source | Skip link and main target exist: `index.html:13`, `index.html:25`. |
| 2.4.2 Page Titled | A | met-in-source | Descriptive title: `index.html:6`; VH-109’s progress title is an additional improvement. |
| 2.4.3 Focus Order | A | met | Logical order required: `UI-STANDARDS.md:201`; existing transition defects owned by VH-111, refined by T-04. |
| 2.4.4 Link Purpose, in context | A | met | Stronger standalone-link rule: `UI-STANDARDS.md:194`. |
| 2.4.5 Multiple Ways | AA | n-a | One production page, not a set of navigable pages; numbered panels are one process: `index.html:62`. |
| 2.4.6 Headings and Labels | AA | met | Visible meaningful labels and headings required: `UI-STANDARDS.md:109`, `UI-STANDARDS.md:195`. |
| 2.4.7 Focus Visible | AA | met | Explicit requirement and focus styling: `UI-STANDARDS.md:201`, `src/styles/app.css:73`. |
| 2.4.8 Location | AAA | n-a | No location within a page set; single-page steps already identify workflow position: `index.html:63`. |
| 2.4.9 Link Purpose, link only | AAA | met | Explicit standalone meaning requirement: `UI-STANDARDS.md:194`, `UI-STANDARDS.md:282`. |
| 2.4.10 Section Headings | AAA | met | Substantial content must use headings: `UI-STANDARDS.md:195`; numbered sections in `index.html:63`. |
| 2.4.11 Focus Not Obscured, minimum | AA | met | Stronger non-obscuration rule: `UI-STANDARDS.md:201`; non-sticky bands at `UI-STANDARDS.md:78`. |
| 2.4.12 Focus Not Obscured, enhanced | AAA | met | “Not obscured” is the applicable requirement; verify whole components, including dialog/overlapping-thumb states. `UI-STANDARDS.md:201`; T-02. |
| 2.4.13 Focus Appearance | AAA | gap | Quantitative geometry and changed-pixel contrast omitted. S-03/T-02. |
| 2.5.1 Pointer Gestures | A | met | Simple alternatives required: `UI-STANDARDS.md:205`; picker and typed trim routes in `index.html:70`, `index.html:119`. |
| 2.5.2 Pointer Cancellation | A | met-in-source | Actions use click handlers; trim changes remain correctable: `src/main.ts:1283`, `src/main.ts:985`, `src/main.ts:1043`. |
| 2.5.3 Label in Name | A | met | Explicit visible-label/accessibility-name rule: `UI-STANDARDS.md:110`. |
| 2.5.4 Motion Actuation | A | n-a | No device-motion or user-motion actuation in the source interaction model. |
| 2.5.5 Target Size, enhanced | AAA | met | Explicit 44 × 44 rule with exceptions: `UI-STANDARDS.md:203`; thumb target at `src/styles/app.css:957`. |
| 2.5.6 Concurrent Input Mechanisms | AAA | met-in-source | Native controls and unconditional keyboard/click routes; no modality lock: `index.html:119`, `src/main.ts:997`. |
| 2.5.7 Dragging Movements | AA | met | Click/tap alternatives required: `UI-STANDARDS.md:161`; typed trim and picker routes are specified. |
| 2.5.8 Target Size, minimum | AA | met | Stronger 44 × 44 requirement already applies: `UI-STANDARDS.md:203`. |
| 3.1.1 Language of Page | A | met-in-source | English declared: `index.html:2`; VH-105 already requires updating it, S-09 brings this into the spec. |
| 3.1.2 Language of Parts | AA | gap | Prospective VH-105 gap: selector autonyms and retained English passages need language identification. S-09/T-09; no present multilingual defect claimed. |
| 3.1.3 Unusual Words | AAA | gap | Retained specialised language lacks a complete definitions requirement. S-08/T-08. |
| 3.1.4 Abbreviations | AAA | gap | Reachable technical/file-size abbreviations lack an expansion/meaning mechanism. S-08/T-08. |
| 3.1.5 Reading Level | AAA | gap | “Plain language” lacks assessment and simpler-content provision. S-08/T-08. |
| 3.1.6 Pronunciation | AAA | n-a | No identified current term whose meaning depends on pronunciation; reassess translated copy with native reviewers. |
| 3.2.1 On Focus | A | met | Explicit prohibition: `UI-STANDARDS.md:212`. |
| 3.2.2 On Input | A | met | Explicit predictable-input rule: `UI-STANDARDS.md:212`; current selects do not navigate. |
| 3.2.3 Consistent Navigation | AA | n-a | No repeated navigation across a set of pages. Preserve order across planned language variants under S-09. |
| 3.2.4 Consistent Identification | AA | met | Explicit same-concept/same-word rule: `UI-STANDARDS.md:141`; VH-114 owns existing vocabulary inconsistency. |
| 3.2.5 Change on Request | AAA | gap | Asynchronous focus changes not covered; VH-111’s remedy needs qualification. S-04/T-04. |
| 3.2.6 Consistent Help | A | n-a | No repeated help across multiple pages; stable in-page feedback already exists at `index.html:343`. |
| 3.3.1 Error Identification | A | met | Specific textual errors linked to controls required: `UI-STANDARDS.md:149`; existing trim defect is VH-108. |
| 3.3.2 Labels or Instructions | A | met | Explicit labels/instruction rules: `UI-STANDARDS.md:109`, `UI-STANDARDS.md:214`. |
| 3.3.3 Error Suggestion | AA | met | Errors must supply the next step: `docs/01-specification.md:522`, `UI-STANDARDS.md:149`; VH-110 owns current defects. |
| 3.3.4 Error Prevention, legal/financial/data | AA | met | Confirmation or reliable undo required for destruction: `UI-STANDARDS.md:136`; source overwrite guard at `src/media/save.ts:118`. |
| 3.3.5 Help | AAA | met | Contextual, task-focused help explicitly required: `UI-STANDARDS.md:177`; S-05/S-08/S-13 specify missing workflow detail. |
| 3.3.6 Error Prevention, all | AAA | met-in-source | Trim inputs are checked; feedback is reviewed before external sending: `src/ui/trim.ts:55`, `src/main.ts:1733`, `index.html:361`. |
| 3.3.7 Redundant Entry | A | met-in-source | No required repeat entry in the normal process; selections feed the job and feedback text remains in its field. `src/main.ts:1352`, `src/main.ts:1653`. |
| 3.3.8 Accessible Authentication, minimum | AA | n-a | No authentication or cognitive authentication test in this app; reassess hosting integration. |
| 3.3.9 Accessible Authentication, enhanced | AAA | n-a | Same current boundary: no authentication. An institutional login would need its own assessment. |
| 4.1.2 Name, Role, Value | A | met | Explicit semantic/custom-widget contract: `UI-STANDARDS.md:219`; language selector must inherit it under T-09. |
| 4.1.3 Status Messages | AA | met | Explicit programmatic-status requirement: `UI-STANDARDS.md:121`, `UI-STANDARDS.md:220`; T-04 completes ticket coverage. |

SC **4.1.1 Parsing was removed from WCAG 2.2**; it is not an additional applicable criterion or an exception needing approval.

## Set aside

- **Re-reporting U-01–U-25.** Their app defects remain assigned. The findings above identify missing requirements or incomplete acceptance clauses, including where a proposed remedy would still fall short.
- **Treating existing tests as accessibility certification.** `test/contrast.test.ts:95` checks enumerated token pairs; `test/screen-text.test.ts:27` checks static text; `test/stylesheet.test.ts:4` explicitly disclaims computed-layout verification.
- **Declaring real-device or assistive-technology success.** No screen reader, phone, speech-input system or running app was exercised in this review. Native-player operation, announcement ordering, focus visibility, mobile retrieval and managed-device feedback remain manual checks.
- **Demanding new codec, caption-authoring or editing features.** S-10/S-11 require honest boundaries, accessible follow-through and criterion dispositions; they do not reopen WebCodecs or the one-way workflow.
- **Calling reload or OS suspension a WCAG inactivity timeout.** They are important UX hazards under S-06, but no authored user-inactivity deadline was found. Worker-silence monitoring and lease expiry are not equivalent: `src/core/watchdog.ts:21`, `src/workers/retained.ts:58`.
- **Requiring a new confirmation for every action.** SC 3.3.6 permits checking or reversibility as alternatives. Existing validation and email review should be preserved, not buried under unnecessary dialogs.
- **Rejecting native player targets for being small.** Unmodified user-agent controls have relevant exceptions. Their practical keyboard/AT usability still needs testing.
- **Demanding a custom accessibility settings panel.** User-agent mechanisms can satisfy text customisation where supported and verified. Access to announcements and presentation is distinct from exposing encoding settings.
- **Reopening agreed labels, folding stages or adding a branding preview.** Their usefulness needs the already-planned staff observations. S-08 requires understandable meanings, not automatic replacement of maintainer-approved wording.
- **Build, runtime and memory changes.** None were made. The quality gate was not run: this was a read-only specification review, and its build/test tooling requires filesystem writes. The working tree remained clean.
- **Output delivery.** No `-o` path was supplied, and this session has read-only filesystem access. The complete Markdown review is provided here; no report file was written.
