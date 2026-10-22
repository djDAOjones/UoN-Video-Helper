<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), blind review for the second design pass (VH-171), 2026-10-22, run against a `git archive` export of eae49ea outside the checkout, kept as written. Its brief is codex-astra-blind-brief-2026-10-22.md. -->

The source shows a more coherent interface, but PLAN-7 should remain open: I found four issues worth carrying into the fix plan, including an incomplete V-33 repair. The principal concern is continuity of keyboard focus when asynchronous work removes controls; the other findings concern reading width, forced-colour focus styling and an inaccurate explanation. The six-fix contract also requires rendered and behavioural evidence this read-only review cannot supply. I inspected the frozen files and test assertions; I did not run the application or gate, change files, or inherit earlier browser passes as current proof. The stylesheet tests explicitly distinguish rule presence from rendered effect (`test/stylesheet.test.ts:4`); Phase 7 already separates this blind review from evidence gathering and integrated verification (`project/backlog.md:39`).

## D-01 Some asynchronous transitions remove focus without a usable successor — rank 2

**Saw**

The existing focus helper is appropriately conditional, but its callers do not cover everything they remove:

- On completion, `fromCancel = focusHeldBy([cancelButton], cancelPressedWithFocus)` captures Cancel alone. The subsequent `setJobInFlight(false)` executes `announceField.hidden = !running`. A person who leaves focus on **Announce progress** therefore gets no hand-off when that checkbox disappears. The failure path hides it similarly.
- A non-recoverable preflight block calls `revealLaterSteps({ setup: recoverable, … })`, hiding the setup controls. The earlier focus capture includes only Stop checking, although a person can have moved into the setup fields while the check runs.
- During J4’s concurrent save/check, a successful check calls `fromStop(acknowledgeButton.hidden ? startButton : acknowledgeButton)`. Create remains disabled while `saveInFlight` is true. The blocked branch instead targets the file input, which is also disabled during saving. The helper calls `target.focus()` without checking whether that successor can receive focus.

These are omissions in the transition logic, not observations of a particular browser’s resulting focus position.

**Standard**

UI-STANDARDS, **Operable**: a transition removing the focused control must pass focus to the control continuing the task, while leaving a reader elsewhere alone (`UI-STANDARDS.md:245`). WCAG **2.4.3 Focus Order**; Nielsen **3, User control and freedom** (`project/digests/nielsen.md:21`).

**Journey or state**

J1/J2 completion; J3 blocked or failed work; J4 concurrent saving and checking. Catalogue rows **14 → 18/29**, **07 → 24**, and **52** (`reviews/2026-10-20/states-2026-10-20.md:36`, `:40`, `:46`, `:51`, `:74`).

**Direction**

Extend the existing conditional hand-off to include the checkbox and any setup subtree being withdrawn. Select an existing, visible, enabled successor after applying the current locks—for example Stop saving while that operation continues. Preserve the existing protection against taking focus from the dialog or someone reading elsewhere. No new element is needed.

**Source**

`src/main.ts:898`, `:1535`, `:1580`, `:1592`, `:1614`, `:2347`, `:2359`, `:2395`, `:2408`, `:2412`, `:2947`, `:3008`, `:3012`, `:3048`.

## D-02 V-33 remains incomplete in the feedback message field — rank 2

**Saw**

The feedback message is a `.textarea`. That class has `width: 100%`, while the dialog can be `40rem` wide. The measure rule covers only:

```css
#title-card-fields .text-input,
#submission-card-fields .text-input,
#submission-card-fields .textarea
```

Consequently, the feedback message field can extend beyond the shared `28rem` reading measure. Its editable text receives the body role, but not the field-width constraint applied elsewhere. The regression test repeats the same restricted selector list.

This establishes an incomplete house-standard repair; it does **not** establish a rendered line exceeding WCAG’s character limit.

**Standard**

UI-STANDARDS, **Perceivable**, requires running text to stop at `--measure` (`UI-STANDARDS.md:208`). VH-167 explicitly includes “the text fields” (`project/items/VH-167.md:9`). PLAN-7 requires every running-text block within the measure (`reviews/2026-10-22/design-pass-2/plan-2026-10-22.md:148`). This belongs to existing **V-33**, not a replacement finding.

**Journey or state**

J3 feedback and recovery; catalogue rows **04** and **54** (`reviews/2026-10-20/states-2026-10-20.md:26`, `:76`).

**Direction**

Apply the existing measure to the feedback textarea, yielding to narrower containers as the card fields already do. Verify a long draft with enlarged text and fallback fonts. Keep the dialog and its controls.

**Source**

`index.html:823`; `src/styles/tokens.carbon.css:75`, `:82`; `src/styles/app.css:1435`, `:1475`, `:1498`, `:1572`; `test/stylesheet.test.ts:343`.

## D-03 The file chooser’s forced-colour focus ring still uses a brand colour — rank 2

**Saw**

The chooser removes its outer outline:

```css
.file-input:focus-visible {
  outline: none;
}
```

Its visible button receives `outline: var(--focus-width) solid var(--focus)`. In forced colours, the unchosen button opts out through `forced-color-adjust: none`, but the explicit system-colour focus override covers `.button`, not `::file-selector-button`.

The final generic `:focus-visible` rule changes the input’s outline colour; it does not replace the pseudo-element’s explicit outline colour. Thus this opted-out button retains the brand focus token instead of the system-colour treatment given to ordinary primary buttons and slider thumbs. Whether it fails the required contrast in a particular Windows palette still needs measurement.

**Standard**

UI-STANDARDS, **Perceivable**, requires opted-out graphics to use system colours (`UI-STANDARDS.md:230`). **Operable** requires rendered focus-area and changed-pixel contrast checks (`UI-STANDARDS.md:241`). Relevant WCAG criteria are **1.4.11**, **2.4.7** and **2.4.13**.

This is a cross-state gap affecting VH-169’s keyboard-focus contract; the distinct pressed fills introduced for **V-39** are present.

**Journey or state**

J1’s initial chooser and J3/J4’s replacement-file route; catalogue rows **01**, **24–25** and **22** (`reviews/2026-10-20/states-2026-10-20.md:23`, `:44`, `:46`).

**Direction**

Give the existing file-button pseudo-element an explicit forced-colour focus treatment, then measure it focused and keyboard-pressed in both light and dark Windows palettes. Retain the native chooser; this does not reopen VH-168’s wording decision.

**Source**

`src/styles/app.css:605`, `:609`, `:1667`, `:1675`, `:1690`, `:1757`, `:1816`; `src/styles/tokens.brand.css:125`, `:173`; `reviews/2026-10-22/design-pass-2/plan-2026-10-22.md:180`.

## D-04 The frame-rate explanation says frames repeat when they are removed — rank 2

**Saw**

The properties panel uses:

```ts
if (Math.abs(video.conform.frameDeltaRatio) > 0.1)
```

and then displays:

> “The output will run at {rate}, so some frames will be repeated.”

The model explicitly defines a negative ratio as frames being dropped. For example, its standard-rate selection maps 120 fps to 60 fps, producing a negative ratio, yet the same repetition sentence is selected. Chinese and Malay carry the same claim. This is semantic parity across three languages, but the shared meaning is wrong for that branch.

**Standard**

Nielsen **1, Visibility of system status**, and **2, Match between system and real world** (`project/digests/nielsen.md:17`). The source panel’s own contract is to explain honestly whether the video will be fine (`src/ui/source-panel.ts:4`).

**Journey or state**

J1, inspecting a chosen video’s properties; catalogue row **57** (`reviews/2026-10-20/states-2026-10-20.md:79`).

**Direction**

Correct the existing sentence according to the direction of the rate change, or use one accurate neutral explanation. Keep any claimed output rate consistent with the selected output settings. No additional warning or control is needed.

**Source**

`src/ui/source-panel.ts:124`; `src/media/framerate.ts:22`, `:32`, `:70`, `:79`; `src/i18n/en-GB.ts:178`; `src/i18n/zh-Hans.ts:115`; `src/i18n/ms-MY.ts:126`; `src/config/presets.ts:220`.

## The six fixes

Verdicts below concern the **whole PLAN-7 contract**. “Unverified” means the source repair is identifiable, but this review cannot establish its required execution or rendering evidence.

| Fix | Verdict | Evidence and limit |
|---|---|---|
| **VH-164 / V-31 — feedback submission** | **Unverified** | The conflicting identifiers are separated: the form lookup is `#feedback-form`, the link lookup `#feedback-form-link`; submit immediately calls `event.preventDefault()`. Empty-message focus, oversized-message refusal and both clipboard outcomes have handlers. The unique-ID assertion is present. The full retained-video/choices/draft and prepared-mailto contract was not executed. `src/main.ts:3405`, `:3492`, `:3523`, `:3544`, `:3592`; `test/screen-text.test.ts:839`. |
| **VH-165 / V-34, V-38 — long text and thumb rings** | **Unverified** | Shared `p, li, dd` wrapping and separate WebKit/Gecko forced-colour thumb selectors are present. That repairs the identified source mechanisms. Long-name/ID geometry with spacing, both palettes and the inset rings’ actual area remain unmeasured here. `src/styles/app.css:36`, `:1395`, `:1757`. |
| **VH-166 / V-32, V-36, V-37 — type and spacing** | **Unverified** | Eight role rules include editable values, emphasis, marks and code; footer headings receive the panel role. The phone inset and shared footer spacing are pinned. Fallback faces, wrapped headings and chosen-segment stability require rendering. `src/styles/app.css:1545`, `:1553`, `:1572`, `:1610`, `:1629`, `:1216`; `test/stylesheet.test.ts:300`, `:322`, `:326`. |
| **VH-167 / V-33 — reading measure** | **Partial** | `28rem`, fact-note/detail caps and toggletip paragraph spacing are present. D-02 identifies an omitted text field. Raw mixed-script line counts, enlargement and fallback-font results remain unverified. The earlier decision itself records a line of **41 when counted one-for-one**, so its half-unit interpretation cannot establish PLAN-7’s raw-count requirement. `src/styles/tokens.carbon.css:75`; `src/styles/app.css:45`, `:1063`, `:1435`; `project/decisions.md:57`; plan `:163`. |
| **VH-168 / V-35 — native chooser limitation** | **Holds** | The record explicitly retains browser-language native wording. The input remains native and is named by the translated step heading. This is a source/record conclusion, not a fresh accessibility-tree observation. `project/decisions.md:35`; `index.html:114`, `:123`, `:128`; `src/i18n/zh-Hans.ts:68`; `src/i18n/ms-MY.ts:76`. |
| **VH-169 / V-39 — pressed states** | **Partial** | Primary, secondary, danger and both chooser appearances have distinct active rules, excluding disabled controls; forced colours invert their pairs. D-03 leaves the keyboard-focus part of the expanded contract incomplete. Actual keyboard presses, the band and both forced palettes remain unverified. `src/styles/app.css:363`, `:377`, `:393`, `:568`, `:584`, `:1683`; `test/stylesheet.test.ts:369`. |

## What held up

The productive hierarchy is coherent in source: panel headings have a larger role than notification titles; notifications share one builder; Create steps down beside a retained result; repeated lifetime guidance is suppressed when the result already carries it. These are substantive improvements, not merely renamed tokens (`src/styles/app.css:1553`, `:1561`; `src/ui/notification.ts:43`; `src/main.ts:2826`, `:2838`).

The catalogue’s competing and repeated content also has several clear resolutions: saving has its own status and stop row; the retained result is explicitly named “Previous video”; its warnings are repainted with it; None shares one explanation rather than repeating it at every lock. These support J4 without restructuring the page (`src/main.ts:2229`, `:2231`, `:3209`, `:3229`; `src/ui/closing-choice.ts:114`).

### Nielsen’s ten, across J1–J4

| Heuristic | Source verdict and evidence |
|---|---|
| **1. Visibility of system status** | Strong source coverage for checking, running and saving; D-04 corrects one inaccurate explanation. Save/check messages have separate regions, and progress distinguishes measured from unmeasured stages. `src/main.ts:1523`, `:3254`; `src/ui/progress.ts:119`, `:133`. |
| **2. Match with the real world** | Failures provide task remedies; output choices describe use rather than codec settings. D-04 is an exception. `src/ui/failure-text.ts:51`; `src/config/presets.ts:42`; `index.html:519`. |
| **3. User control and freedom** | Check, job and save each have a stop; discard has Keep it. D-01 weakens keyboard continuity at their boundaries. `src/main.ts:2274`, `:2301`, `:2781`, `:3115`. |
| **4. Consistency and standards** | Shared notification/type rules and language-independent state descriptors support consistency. The onset options and explanatory terms correspond in all three tables; native chooser wording remains the recorded exception. `src/ui/notification.ts:43`; `src/main.ts:966`; `src/i18n/en-GB.ts:311`; `src/i18n/zh-Hans.ts:247`; `src/i18n/ms-MY.ts:262`; `project/decisions.md:35`. |
| **5. Error prevention** | J2 validates before discarding a previous result; J4 requires an explicit discard choice. Source-file overwrite refusal leaves a recovery route. `src/main.ts:2721`, `:2774`, `:3295`. |
| **6. Recognition rather than recall** | Required submission fields are stated and marked; the previous result names its source and settings; locked closing controls retain explanations. `index.html:329`; `src/ui/title-card-step.ts:123`; `src/main.ts:3215`; `src/ui/closing-choice.ts:65`. |
| **7. Flexibility and efficiency** | Typed trim times accompany handles; choices survive language changes; progress speech is remembered. No extra expert controls are warranted by this source review. `src/ui/trim.ts:46`, `:157`; `src/main.ts:3680`; `src/ui/progress.ts:185`. |
| **8. Aesthetic and minimalist design** | Shared notification anatomy, retired verdicts and suppression of duplicate lifetime prose reduce competition. D-02 is a remaining consistency gap. `src/ui/notification.ts:43`; `src/main.ts:2948`, `:2838`. |
| **9. Error recognition and recovery** | Known failures map to causes and next steps; refused card input receives focus; cancelled/refused saves retain retryability. D-01 identifies missing transition cases. `src/ui/failure-text.ts:51`; `src/main.ts:2631`, `:3287`, `:3376`; `src/ui/failure-text.test.ts:27`. |
| **10. Help and documentation** | Trim format, ID rules, onset explanations and feedback are available in context. Actual novice comprehension remains a person’s check. `index.html:223`, `:381`, `:452`, `:775`; `src/ui/title-card-step.ts:213`. |

### WCAG source coverage

This accounts for the 86 criterion IDs, grouping only criteria sharing evidence. **Met-in-source** is a narrow implementation judgement, not a conformance claim. **Evidence gap** is not a demonstrated failure. Accepted limitations remain gaps.

| Criteria | Scoped judgement and evidence |
|---|---|
| **1.1.1** | **Met-in-source:** logo alternative, named help button and textual colour choices accompany non-text content. `src/ui/brand-assets.ts:63`; `index.html:439`, `:474`. |
| **1.2.1–1.2.3, 1.2.5–1.2.8** | **Accepted conditional limitations:** the preview’s alternatives depend on the supplied recording. No inherited media pass. `index.html:162`; `docs/01-specification.md:738`. |
| **1.2.4, 1.2.9** | **N-a:** this inspected workflow takes a local file, not live media. `index.html:123`, `:162`. |
| **1.3.1, 1.3.2, 1.3.6** | **Met-in-source:** ordered named sections, native groups and associated field labels/errors. Actual reading order remains to be heard. `index.html:65`, `:113`, `:181`, `:319`; `test/screen-text.test.ts:667`. |
| **1.3.3** | **Met-in-source:** corrective instructions name fields and steps rather than relying on colour or shape. `src/i18n/zh-Hans.ts:184`, `:205`; `src/ui/failure-text.ts:56`. |
| **1.3.4** | **Evidence gap:** responsive rules exist; real landscape and short-height operation was not tested. `src/styles/app.css:675`; `docs/01-specification.md:733`. |
| **1.3.5** | **N-a to the inspected fields:** card metadata concerns the video, rather than collecting the operator’s personal profile. `index.html:270`, `:319`. |
| **1.4.1** | **Met-in-source:** selected segments change weight as well as fill; errors have text; disabled controls use additional styling. `src/styles/app.css:408`, `:1610`; `index.html:830`. |
| **1.4.2** | **Met-in-source:** no preview autoplay; handle-driven seeking pauses playback. `index.html:162`; `src/ui/preview-seek.ts:40`. |
| **1.4.3, 1.4.6** | **Evidence gap:** light/dark/band token-pair assertions exist, but they are not a current rendered-text contrast scan. `test/contrast.test.ts:134`. |
| **1.4.4** | **Evidence gap:** actual browser text/page enlargement was not exercised. `docs/01-specification.md:699`, `:728`. |
| **1.4.5, 1.4.9** | **Met-in-source for the authored page:** headings and controls use HTML text; the logo has the logotype exemption. This does not certify the preview’s content. `index.html:35`, `:114`; `src/ui/brand-assets.ts:58`; `docs/01-specification.md:720`. |
| **1.4.7** | **N-a to authored page audio:** playback is the selected video, not an authored background soundtrack. `index.html:162`; `src/ui/preview-seek.ts:40`. |
| **1.4.8** | **Incomplete source implementation plus evidence gaps:** D-02 breaches the adopted measure; all five parts are separated below. `UI-STANDARDS.md:208`; `src/styles/app.css:1498`. |
| **1.4.10, 1.4.12** | **Evidence gap:** wrapping and responsive caps are present; neither proves reflow or spacing survival across all states. `src/styles/app.css:36`, `:675`, `:1435`; `test/stylesheet.test.ts:4`. |
| **1.4.11** | **Evidence gap with D-03 source concern:** component-pair tests and system-colour rules exist; real palette results remain outstanding. `test/contrast.test.ts:143`; `src/styles/app.css:1667`, `:1757`. |
| **1.4.13** | **N-a to hover/focus triggering:** the help opens on activation. Dismissal is nevertheless implemented by the button, Escape and outside click; the text stays in normal flow. `src/main.ts:712`, `:717`, `:721`, `:725`; `src/styles/app.css:1052`. |
| **2.1.1–2.1.3** | **Source support; execution gap:** native controls, keyboard range handling and a native modal provide the intended paths. Selects, modal cycling/escape and complete keyboard journeys need execution. `src/ui/trim.ts:157`; `index.html:414`, `:811`; `src/main.ts:3469`, `:3560`. |
| **2.1.4** | **N-a:** the inspected authored key handling concerns range navigation and Escape, not character shortcuts. `src/ui/trim.ts:163`; `src/main.ts:721`. |
| **2.2.1, 2.2.3** | **Met-in-source:** the documented deadlines concern worker activity, not timed user responses. `src/config/thresholds.ts:13`, `:153`. |
| **2.2.2** | **Met-in-source under the recorded essential-progress reading:** retain the progress bar. `docs/01-specification.md:723`; `src/main.ts:3115`. |
| **2.2.4** | **Met-in-source for routine progress control; speech unverified:** the preference suppresses routine announcements, with outcomes handled separately. `src/ui/progress.ts:158`; `src/main.ts:2979`. |
| **2.2.5, 3.3.8, 3.3.9** | **N-a to the inspected workflow:** local-file processing and feedback contain no authentication step. `index.html:123`, `:811`; `src/main.ts:3523`. |
| **2.2.6** | **N-a to inactivity expiry:** the stated lifetime is the tab/new-job lifetime; operational deadlines are worker deadlines. `index.html:617`; `src/config/thresholds.ts:13`. |
| **2.3.1, 2.3.2** | **Accepted conditional limitations:** flash safety of the selected recording is not established. `docs/01-specification.md:738`. |
| **2.3.3** | **Met-in-source for authored motion:** reduced-motion styling exists; the user’s recording remains separate. `src/styles/app.css:514`; `index.html:162`. |
| **2.4.1, 2.4.2** | **Met-in-source:** skip-link treatment and meaningful translated state titles. Execution of the skip destination remains a keyboard check. `src/styles/app.css:92`; `src/ui/progress.ts:160`, `:166`. |
| **2.4.3** | **Source gap:** D-01. Existing conditional focus protection is sound but incompletely applied. `src/main.ts:898`, `:2947`. |
| **2.4.4, 2.4.9** | **Met-in-source:** inspected help/contact links identify their purpose and new-tab destinations. `src/ui/accessibility-statement.ts:113`, `:119`; `src/i18n/ms-MY.ts:858`. |
| **2.4.5, 2.4.8** | **N-a to a multipage hierarchy:** this is one page with numbered task sections. `index.html:113`, `:537`; `test/screen-text.test.ts:647`. |
| **2.4.6, 2.4.10** | **Met-in-source:** numbered section headings and labelled fields; statement subsections use headings. `index.html:114`, `:237`, `:680`; `test/screen-text.test.ts:380`. |
| **2.4.7, 2.4.11–2.4.13** | **Evidence gap, with D-03:** focus rules exist, but visibility, complete non-obscuration, perimeter area and changed-pixel contrast need rendered checks, particularly overlapping/inset thumbs and forced colours. `src/styles/app.css:108`, `:1386`, `:1395`, `:1667`. |
| **2.5.1, 2.5.7** | **Met-in-source:** file selection accompanies dropping; typed times and Set buttons accompany trim dragging. `src/ui/drop-zone.ts:5`; `index.html:173`, `:181`, `:190`. |
| **2.5.2** | **Met-in-source for inspected actions:** buttons commit on click; trim positions remain reversible through the same controls. Full pointer execution remains untested. `src/main.ts:2721`, `:3115`; `src/ui/trim.ts:157`. |
| **2.5.3** | **Source support; accessible-name verification outstanding:** labels name fields and help; the chooser’s browser wording is the recorded limitation. `index.html:128`, `:439`, `:822`; `project/decisions.md:35`. |
| **2.5.4** | **N-a:** the inspected task controls use file, keyboard and pointer input rather than device motion. `index.html:123`, `:173`, `:190`. |
| **2.5.5, 2.5.8** | **Evidence gap:** 44px button and label-row rules are present. Actual target dimensions, overlap and exceptions still need verification. `src/styles/app.css:346`, `:550`, `:757`, `:792`; `docs/01-specification.md:720`. |
| **2.5.6** | **Evidence gap:** source retains multiple input routes; real concurrent-input and phone behaviour remains untested. `src/styles/app.css:646`; `docs/01-specification.md:733`. |
| **3.1.1, 3.1.2** | **Met-in-source for inspected production language handling:** page language updates; mixed video-language passages and feedback diagnostic passages receive language spans. `src/main.ts:3681`, `:3447`; `src/ui/video-language.ts:95`. |
| **3.1.3, 3.1.5, 3.1.6** | **Human evidence gap:** helpers explain selected terms, but comprehension, translated terminology and any pronunciation-dependent meaning need readers. Machine translations are explicitly marked. `src/config/languages.ts:5`, `:42`; `docs/01-specification.md:731`. |
| **3.1.4** | **Accepted limitations:** file-size units, UoN and codec names remain recorded exceptions, not passes. `docs/01-specification.md:746`, `:751`, `:755`. |
| **3.2.1, 3.2.2, 3.2.5** | **Source support:** changes are handled through activation/input, with conditional focus movement and in-place language repaint. Runtime behaviour remains to be walked. `src/main.ts:898`, `:2659`, `:3657`, `:3680`. |
| **3.2.3, 3.2.4, 3.2.6** | **N-a to a set of pages:** the inspected product is one task page. House consistency and help rules still apply independently. `index.html:113`, `:775`; `project/digests/nielsen.md:23`, `:35`. |
| **3.3.1–3.3.3** | **Met-in-source:** requirements are stated, errors are associated and validation focuses the field to correct. Actual announcement remains unverified. `index.html:329`, `:381`, `:828`; `src/main.ts:2631`, `:3492`. |
| **3.3.4, 3.3.6** | **Met-in-source for prevention paths:** validation precedes discard, discard requires a deliberate choice, source overwrite is refused and email remains reviewable. `src/main.ts:2725`, `:2745`, `:3295`; `index.html:817`. |
| **3.3.5** | **Met-in-source:** task-specific helpers and the existing feedback route. `index.html:223`, `:381`, `:452`, `:775`. |
| **3.3.7** | **Met-in-source:** switching card modes hides rather than clears fields; date updates preserve user edits; language repaint does not replace editable controls. `src/main.ts:2610`, `:3680`; `src/ui/title-card-step.ts:83`, `:92`. |
| **4.1.2** | **Source support:** native controls, named dialog, expanded-state help and explicit required states. Accessibility-tree verification is outstanding. `index.html:329`, `:435`, `:811`; `src/main.ts:714`. |
| **4.1.3** | **Source support; speech evidence gap:** separate source/job/save/page regions and failure/progress announcements exist. Hearing the order, duplication and language-switch timing still requires assistive technology. `index.html:139`, `:553`, `:612`, `:627`; `src/main.ts:1036`, `:2979`, `:3635`. |

## What only a browser or a person can settle

**WCAG 1.4.8 needs five separate outcomes.**

| Part | What source establishes | What remains |
|---|---|---|
| **User-selected foreground/background colours** | System-colour handling exists, with explicit opt-outs; D-03 identifies an incomplete focus treatment. `src/styles/app.css:1648`, `:1660`, `:1667`. | Actual user colour overrides and both Windows palettes, including controls and disclosures. |
| **80-character / 40-CJK measure** | Shared `28rem` caps exist; D-02 identifies an omission. `src/styles/tokens.carbon.css:75`; `src/styles/app.css:36`, `:1498`. | Raw rendered-line counts, retaining mixed Chinese/Latin lines rather than substituting half-unit totals. The earlier 41-character case remains unresolved under this method (`project/decisions.md:57`; plan `:163`). |
| **No justification** | The stylesheet’s text layout uses the shared measure without an authored justification treatment. `src/styles/app.css:31`. | Confirm computed presentation under user styles and fallback fonts. |
| **Line and paragraph spacing** | Body line height is 1.5; paragraph and toggletip gaps use the adopted tokens. `src/styles/tokens.carbon.css:64`, `:68`; `src/styles/app.css:54`, `:1063`. | Confirm paragraph relationships and survival of user spacing overrides, including wrapped headings and dialog contents. |
| **200% enlargement without horizontal scrolling** | Fluid caps and wrapping support it. `src/styles/app.css:36`, `:1435`, `:1475`. | Real enlargement, separately from a narrow viewport or device-scale emulation; also 320px reflow and 400% page zoom. The specification expressly keeps those checks distinct (`docs/01-specification.md:699`, `:728`). |

The remaining browser/person work should exercise the following specific risks:

- **Focus and speech:** D-01’s three transitions; cancellation, refusal, retry and save outcomes; dialog entry, Tab cycle, Escape and return; completion while focus is elsewhere. Listen for outcome announcements during the two frames in which language changes mute other live regions (`src/main.ts:898`, `:2274`, `:3286`, `:3469`, `:3560`, `:3635`).
- **Rendered component states:** rest, hover, keyboard press, focus, disabled and invalid states in light, dark and both forced palettes. Measure changed focus pixels and area—not merely `outline-width`—including overlapping thumb positions (`src/styles/app.css:363`, `:408`, `:1386`, `:1395`, `:1683`).
- **Typography and geometry:** genuinely unavailable Lora, the available CJK fallback faces, long filenames/IDs in finished/previous/discard states, wrapped footer headings and enlarged text. The font loader explicitly supports fallback, while the stylesheet tests have no layout engine (`src/ui/brand-assets.ts:67`; `src/styles/app.css:36`, `:1553`; `test/stylesheet.test.ts:4`).
- **People using the app:** novice understanding of Create’s blockers, the distinction between page/video language, recovery from warnings, and the effort of a second video. Translation parity checks do not establish Chinese or Malay fluency or comprehension; those remain the campus readers’ work (`src/config/languages.ts:5`; `project/backlog.md:50`; `docs/01-specification.md:731`).

## Set aside, with reasons

- **Page structure and switcher placement:** retained as owner-directed. The findings can be addressed within the current structure; folding stages remains a separate recorded item (`src/main.ts:3620`; `project/backlog.md:63`).
- **Accessibility-statement wording:** no replacement wording proposed. VH-137 remains the owner’s review item; the statement is not evidence that an untested criterion passed (`project/backlog.md:33`; `src/i18n/en-GB.ts:901`).
- **Native chooser wording:** V-35/VH-168 remains the explicit limitation. D-03 concerns styling the existing native control, not replacing it (`project/decisions.md:35`).
- **Progress-bar removal or another progress control:** neither is proposed. The essential-progress reading stands, and the existing announcement preference supplies the speech control (`docs/01-specification.md:723`; `src/ui/progress.ts:158`).
- **Previously repaired V-31–V-39:** no duplicate findings are raised. D-02 stays attached to V-33; the other repairs and their remaining verification limits are accounted for in the six-fix table. The plan requires this treatment (`reviews/2026-10-22/design-pass-2/plan-2026-10-22.md:23`).
- **VH-164’s missing item file:** `project/items/VH-164.md` was not present in the export. Its decision and the unique-ID regression assertion supplied the available record (`project/decisions.md:117`; `test/screen-text.test.ts:839`).
- **Full conformance or release approval:** neither follows from this review. Conditional media limitations, abbreviations and human evidence remain separate from fixable defects; the existing Phase 7 evidence, judgement and verification items already own that work (`docs/01-specification.md:728`, `:738`, `:746`; `project/backlog.md:40`).