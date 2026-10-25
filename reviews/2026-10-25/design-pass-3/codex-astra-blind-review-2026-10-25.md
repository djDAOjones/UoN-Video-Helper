<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), blind review for the third design pass (VH-198), 2026-10-25, run against a `git archive` export of 099949c outside the checkout, kept as written. Its brief is codex-astra-blind-brief-2026-10-25.md. -->

The export is coherent enough to continue pass 3, but it does not support closing Phase 8. I found two new concerns: VH-185 describes deliberately omitted, real audio as absent, and VH-193 puts its “play before saving” advice after Save in the reading order. I also found an incomplete VH-178 / V-46 focus hand-off when a replacement file proves unreadable. The footer hierarchy, shared toggletips, moved Video language control, result identity and language parity hold up in source. Rendered accessibility and native-player behaviour remain unverified; neither earlier Codex checks nor Phase 7’s measurements establish them for this export. (`src/media/audio-plan.ts:120`; `src/i18n/en-GB.ts:671`; `src/main.ts:3327`, `3497`, `1767`; `index.html:259`, `822`; `reviews/2026-10-25/design-pass-3/plan-2026-10-25.md:303`.)

## D-05 VH-185 calls omitted sound “no audio” — rank 1

**Saw.** The new rule is:

> `return range !== null && traversal.decodedFrames / sampleRate < BLOCK_SECONDS`

Those frames are explicitly defined as decoded source sound, excluding gap-fill. The rule therefore covers genuine sound shorter than 400 ms, not only encoder priming. Planning returns a silent keep, and the job omits its audio track. Yet the existing warning says:

> “This video has no audio”

and:

> “There is no audio to level…”

The supplied test includes 50 ms of actual generated sound and expects it to become a silent keep. Another distinguishes 390 ms from 410 ms. The original remains safe, but the explanation attributes the missing sound to the recording rather than explaining the app’s decision. A person hearing sound in the original preview can reasonably distrust the result. (`src/media/audio-plan.ts:104`, `120`, `347`; `src/media/sub-block-sound.test.ts:61`, `97`; `src/i18n/en-GB.ts:670`.)

**Standard.** Nielsen 1, visibility of system status, and 2, match with the real world; UI-STANDARDS’ plain-language and error-recovery rules. VH-185 itself expressly requires raising the wording issue if this sentence is untrue. (`project/digests/nielsen.md:17`; `UI-STANDARDS.md:112`, `156`; `project/items/VH-185.md:10`.)

**Journey or state.** J1, trimming a staff video before Create; J3, understanding an unexpected silent result. Catalogue row 27, “A silent source”, now also represents a materially different condition; Phase 8 scenarios S-99–S-102 cover the new branch. (`reviews/2026-10-25/design-pass-3/plan-2026-10-25.md:55`; `reviews/2026-10-20/states-2026-10-20.md:49`; `reviews/2026-10-25/design-pass-3/contract-2026-10-25.md:28`.)

**Direction.** Reuse the existing warning. For this branch, say that the kept part contains too little audio to level and that the new video will omit it; point to keeping more of the original if that sound matters. Preserve the existing wording for genuinely absent audio. This needs an owner-approved wording distinction under VH-185’s existing criterion, not another control or a change to the approved processing threshold.

**Source.** `src/media/audio-plan.ts:100`, `115`, `347`; `src/media/sub-block-sound.test.ts:61`; `src/i18n/en-GB.ts:670`; equivalent wording in `src/i18n/zh-Hans.ts:551` and `src/i18n/ms-MY.ts:590`.

## D-06 VH-193’s advice arrives after the action it should inform — rank 2

**Saw.** The warning tells the person:

> “…play the new video before you save it.”

But the finished card receives its player and lifetime line, then its Save action. The warning container follows the entire card:

> `processResult.replaceChildren(heading, resultWarnings)`

The completion announcement does not repair that sequence: `warningsSpoken` maps each warning to `.heading` only. Thus a reader reaches the player and Save before the listening advice, and the automatic announcement gives the problem’s title without the requested precaution. This matters more now that saving successfully removes the player. (`src/i18n/en-GB.ts:722`; `src/main.ts:3285`, `3327`, `3441`, `3497`; `src/ui/announce.ts:42`.)

**Standard.** Nielsen 5, error prevention, and 6, recognition rather than recall; UI-STANDARDS’ requirement to put useful context where the decision is made. VH-193’s stated purpose is disclosure before saving. This is a UX finding; heavy limiting is an output advisory, so its placement alone does not establish a WCAG 3.3.3 input-error failure. (`project/digests/nielsen.md:25`; `UI-STANDARDS.md:164`; `project/items/VH-193.md:5`.)

**Journey or state.** J1, review and save; J3, evaluate a warning. Catalogue rows 18, “Finished”, and 50, changed closing/output warnings; Phase 8 S-135–S-138 and S-151. (`reviews/2026-10-20/states-2026-10-20.md:40`, `72`; `reviews/2026-10-25/design-pass-3/contract-2026-10-25.md:36`.)

**Direction.** Put the existing warning content before the player and Save in the result’s reading order, using one notification treatment rather than nested rails. Include the existing listening instruction in the consequential completion announcement. Keep Save available and preserve the owner’s unchanged-after-save wording decision. No checkbox, acknowledgement or additional element is needed.

**Source.** `src/main.ts:3273`, `3285`, `3325`, `3327`, `3494`; `src/ui/announce.ts:35`; `src/i18n/en-GB.ts:719`; `project/items/VH-193.md:36`.

## V-46 / VH-178 Unreadable replacements still withdraw focused setup controls — rank 2

*This is an incomplete fix under the existing finding, originally D-01; it receives no new D-number.*

**Saw.** While a replacement is being inspected, existing setup steps remain present. `applyControlLock` locks their fields only for a job or save:

> `const locked = jobInFlight || saveInFlight`

A person can therefore move into Video language, title-card fields or other setup controls during inspection. Both inspection-failure paths call:

> `clearTrim('unreadable')`

That function hides the setup steps:

> `revealLaterSteps({ setup: false, create: resultStanding })`

Neither path captures their focused control or names a successor. The preflight-block path has the necessary hand-off; this earlier failure path does not. (`src/main.ts:1352`, `1486`, `1500`, `1767`, `2441`.)

**Standard.** WCAG 2.4.3 Focus Order; the explicit requirement that a transition removing or disabling the focused control names its successor. (`docs/01-specification.md:717`; `src/ui/focus-hand-on.ts:1`.)

**Journey or state.** J4, choosing an unreadable second video while the first result is retained; also J3 without a retained result. Catalogue rows 22, “Previous video”, and 25, “Unreadable file”. Video language’s move into step 3 adds its radios to the affected controls. (`reviews/2026-10-20/states-2026-10-20.md:44`, `47`; `index.html:259`.)

**Direction.** Apply the existing `focusHeldBy` / `stepsWithdrawnBy` pattern before this withdrawal, then hand displaced focus to the available file chooser. Preserve focus elsewhere and in the feedback dialog. Cover both the failed reply and exception path.

**Source.** `src/main.ts:939`, `1481`, `1495`, `1756`, `2440`; `src/ui/focus-hand-on.ts:71`. The helper tests cover its behaviour, while the unreadable-state structural test checks primary emphasis rather than this missing call. (`src/ui/focus-hand-on.test.ts:74`; `test/screen-text.test.ts:297`.)

## Nielsen’s ten

“Supported” below means supported by this export’s source, not demonstrated in a running browser.

| Heuristic | Verdict | Evidence across the journeys |
|---|---|---|
| 1. Visibility of system status | **Partial** | File, job and save have separate status channels; stage percentages are used only where measured. D-05 makes one source warning misleading. (`src/main.ts:822`, `846`, `865`; `src/ui/progress.ts:119`; `src/i18n/en-GB.ts:671`.) |
| 2. Match with the real world | **Partial** | Purpose-led output names and “Plays over” explain choices in familiar terms. “No audio” conflates absence with deliberate omission. (`src/i18n/en-GB.ts:321`, `382`, `670`.) |
| 3. User control and freedom | **Partial** | Check, job and save can be stopped; Keep restores the retained result; typed card fields survive switching. The unreadable-replacement focus route remains incomplete. (`src/main.ts:2320`, `2347`, `2831`, `2657`, `1767`.) |
| 4. Consistency and standards | **Supported; rendered consistency unverified** | Both tips use one implementation and style; step 4 uses one heading/legend name; presets have deliberate label, sentence and record forms. (`src/main.ts:715`, `742`; `src/styles/app.css:1094`; `src/i18n/en-GB.ts:138`, `318`, `379`.) |
| 5. Error prevention | **Partial** | Trim/card validation, capability blocks and discard confirmation precede work. D-06 puts the listening precaution after Save. (`src/main.ts:1520`, `2678`, `2792`, `3327`.) |
| 6. Recognition rather than recall | **Partial** | Result records preserve the source, kept interval, output and actual closing; “again” follows source identity. The listening advice should precede the actions it explains. (`src/ui/result-summary.ts:168`; `src/main.ts:2162`, `2288`, `3497`.) |
| 7. Flexibility and efficiency | **Supported in source** | Long-video Page steps scale with duration; typed times remain available; presets and retained values reduce the cost of another video. (`src/ui/trim.ts:164`; `index.html:190`, `212`; `src/main.ts:654`.) |
| 8. Aesthetic and minimalist design | **Supported structurally; geometry unverified** | The passing browser note disappears, help stays disclosed, lifetime text is not repeated beside a result, and Create becomes secondary beside Save. The warning/action ordering is the remaining competition identified here. (`src/ui/system-check.ts:71`; `src/main.ts:2926`, `2915`; `src/styles/app.css:1094`.) |
| 9. Recognise, diagnose and recover from errors | **Partial** | Failure mappings provide cause-specific recovery and original-file reassurance; failed saves retain a retry. D-05 supplies the wrong explanation for omitted audio. Native-player recovery needs a live check. (`src/ui/failure-text.ts:51`, `93`; `src/main.ts:3463`; `src/main.ts:2870`.) |
| 10. Help and documentation | **Supported in source** | Footer questions distinguish staff help, student help, problems and opinions. Both report buttons open the same dialog; local format and trim help explain their controls. (`index.html:822`; `src/main.ts:3665`; `index.html:55`, `234`, `463`.) |

## Phase 8 contract

These are current-source verdicts. **Holds** does not inherit the contract’s earlier pixel measurements or browser results. **Partial** identifies an actual gap or a substantial required behaviour that source cannot establish.

| Contract row | Verdict | Current evidence and limit |
|---|---|---|
| VH-182 — footer and reporting | **Holds in source** | One `h2`, three `h3`s, correct route order, plain link names and shared report dialog. Addresses come from config; links open safely in new tabs. Actual target dimensions and wrapping remain unverified. (`index.html:822`; `src/config/feedback.ts:15`, `24`, `35`; `src/main.ts:3694`.) |
| VH-183 — keyboard Page step | **Holds in source** | `max(10 s, duration × .01)`, bounds, arrows and Home/End are explicit; each handled key commits the trim. (`src/ui/trim.ts:170`; `src/config/trim.ts:31`, `37`, `45`; `src/main.ts:1945`.) |
| VH-184 — onset toggletip | **Holds in source** | Outside focus/click dismisses; Escape is conditional; one neutral border replaces the notification rail. (`src/main.ts:715`; `src/ui/toggletip.ts:25`, `34`; `src/styles/app.css:1094`.) |
| VH-185 — short kept sound | **Partial** | The threshold and shared planning behaviour are present; exact-block and frame-placement cases have tests. The warning’s truthfulness fails the item’s own condition: D-05. (`src/media/audio-plan.ts:120`, `350`; `src/media/sub-block-sound.test.ts:85`, `97`; `project/items/VH-185.md:10`.) |
| VH-186 — shorter labels and facts | **Holds in source** | Shortened check labels, standalone capitals and unchecked-caption consequences are present. Narrow worker-row layout remains VH-186.1. (`src/i18n/en-GB.ts:821`, `999`; `src/ui/source-panel.ts:73`; `project/wish-list.md:55`.) |
| VH-187 — top of page/browser note | **Partial** | Fail/warn outranks pending; otherwise the note is absent. Final chooser position after VH-196 and VH-191 is unverified. (`src/ui/system-check.ts:71`; `src/main.ts:808`; contract:89.) |
| VH-188 — output names | **Holds in source** | Labels, explanatory details and prose forms agree with the approved scheme; result summaries read `inRecord`. Rendered line counts are unverified. (`src/i18n/en-GB.ts:379`; `src/ui/result-summary.ts:172`; `index.html:545`.) |
| VH-189 — closing labels | **Partial** | Labels, options, lock reasons and the responsive grid are present. Native-select text fit and the known enlarged narrow layout remain unverified. (`src/i18n/en-GB.ts:317`; `src/styles/app.css:1051`; `project/wish-list.md:56`.) |
| VH-190 — Create again | **Holds in source** | Same-source identity controls the label; retained results control secondary emphasis; starting a remake clears the saved identity before cancellation/failure can return. (`src/main.ts:2162`, `2288`, `2915`, `2930`.) |
| VH-191 — Video language first | **Holds in source, with VH-178 interaction incomplete** | The fieldset precedes the title-card choice, locks for jobs/saves and retains its preference rules. The unreadable-file withdrawal lacks focus recovery. (`index.html:259`; `src/main.ts:517`, `681`, `2458`, `1767`.) |
| VH-192 — finished player | **Partial** | Correct finished-file URL, native controls, metadata preload, shared element, accessible-name reference and release sequence. Native keyboard operation, redraw playback, error presentation and save-time focus need a browser. (`src/main.ts:2870`, `2890`, `3285`, `3440`.) |
| VH-193 — limiting warning | **Partial** | Production propagation, unrounded threshold, order and retained warning data hold. D-06 weakens prevention. Non-finite and lowered-ceiling integration still lack the contract’s requested demonstration. (`src/media/audio-plan.ts:467`; `src/media/pipeline.ts:873`; `src/audio/warnings.test.ts:207`; `project/wish-list.md:61`.) |
| VH-194 — standards corrections | **Partial** | The required current wording is present. This export cannot verify the historical “documents only” diff, and I did not run the budget checker. (`docs/01-specification.md:703`, `717`, `740`; `UI-STANDARDS.md:208`; contract:37.) |
| VH-196 — five promises and MP4 tip | **Partial** | Five approved promises, named button, polite wrapper and shared tip behaviour hold. Final height, line counts and enlarged fit remain unverified. (`index.html:50`; `src/i18n/en-GB.ts:79`; `src/main.ts:743`; contract:38.) |
| VH-178 — focus hand-off | **Partial** | Original job-ending, blocked-preflight and save-overlap protections are present. The unreadable-replacement branch remains incomplete under V-46. (`src/main.ts:1595`, `1632`, `3040`, `1767`.) |
| VH-179 — rings, measure and hover | **Partial** | Ring room, fixed-size thumb artwork, forced-colour rings, feedback measure and distinct hover/press rules remain. Their actual areas, clipping and contrast in the changed states need rendering. (`src/styles/app.css:537`, `1451`, `1492`, `1742`, `1880`; `test/stylesheet.test.ts:386`.) |
| VH-180 — neutral frame-rate note | **Holds in source** | The note promises no numeric output rate and allows repetition or omission under either preset. (`src/ui/source-panel.ts:132`; `src/i18n/en-GB.ts:189`; `src/i18n/zh-Hans.ts:122`; `src/i18n/ms-MY.ts:127`.) |
| VH-181 — Closing graphics name | **Holds in source** | Heading and legend agree in all three tables; new references use the same noun. The already-recorded Chinese closing-card variation remains separate. (`src/i18n/en-GB.ts:138`, `318`; `src/i18n/zh-Hans.ts:78`, `245`; `src/i18n/ms-MY.ts:80`, `255`; contract:42.) |

Here, **contract:n** means `reviews/2026-10-25/design-pass-3/contract-2026-10-25.md:n`.

The contract’s cross-item effects resolve as follows:

| Interaction | Assessment |
|---|---|
| Player ↔ discard ↔ focus | Keep reuses the retained player and focuses the restored card; Discard releases it. Opening the question removes the card but does not explicitly pause the player, so the required pause depends on native media removal behaviour and needs testing. (`src/main.ts:2831`, `2849`, `2871`, `2902`.) |
| Limiting + metadata ↔ previous result/download/language | Both travel with `kept.warnings`; repaint preserves producer order. Completion speaks titles independently of Announce progress. Actual delivery by assistive technology remains unverified. (`src/audio/warnings.ts:201`; `src/main.ts:3058`, `3072`, `3325`, `3395`.) |
| Video language ↔ page language/date/job | Unpicked follows the page, picked persists, untouched dates refill, and the job snapshots its own language. Locked controls can therefore display the next language while the running record preserves the original one, as the contract specifies. (`src/main.ts:517`, `699`, `2948`, `3789`; `src/ui/title-card-step.ts:92`; `src/ui/result-summary.ts:178`.) |
| Two tips ↔ narrow layout | Shared dismissal logic is independently wired. The onset button moves visually at `25rem`; its DOM position remains after the select. Native keyboard and visual-order usability at the breakpoint remain live checks. (`src/main.ts:715`, `742`; `src/styles/app.css:1051`; `index.html:450`, `463`.) |
| Create again ↔ discard/cancel/failure | The question preserves the retained source identity; beginning a job clears it and relabels Create. (`src/main.ts:2162`, `2793`, `2930`.) |
| Video language ↔ blocked/unreadable source | Preflight blocking captures withdrawn steps, including the moved radios. Inspection failure does not: V-46 above. (`src/main.ts:939`, `1595`, `1767`.) |
| Two report openers ↔ dialog return | Both call `openFeedback`; `showModal` and native close provide the mechanism. Return to each actual opener must be checked live. (`src/main.ts:3571`, `3662`, `3665`.) |
| Longer email address/subject ↔ clipping | Length is calculated from the complete encoded URL, so the new fixed overhead is included. Details are removed before the person’s message; oversized messages retain the copy route. (`src/ui/feedback.ts:207`; `src/config/feedback.ts:15`, `35`, `56`; `src/main.ts:3629`.) |
| Silent keep ↔ limiting/name | No audio plan means no limiting bite; the job’s `audioIncluded` feeds the result outcome used for naming. D-05 concerns disclosure, not a spurious limiting warning. (`src/media/pipeline.ts:348`, `873`; `src/main.ts:3049`.) |
| Closing labels ↔ one name | New labels and help preserve the heading/legend noun; no new English synonym was introduced. (`src/i18n/en-GB.ts:130`, `138`, `318`, `320`, `340`.) |
| Lede ↔ chooser position | Three changes affect the height before step 1; source cannot establish their net rendered result. Keep this under V-18 rather than creating a new finding. (contract:89; `index.html:50`, `259`.) |
| Output names ↔ frame-rate/standalone facts | Record prose and source facts are independent; the neutral rate note does not depend on either renamed output. (`src/ui/result-summary.ts:172`; `src/ui/source-panel.ts:118`, `132`.) |
| Page steps ↔ recheck | Commit withdraws the old verdict immediately and schedules a settled-range check after 500 ms; source supports the intended coalescing. (`src/main.ts:1884`, `1945`; `src/config/trim.ts:53`.) |
| Player ↔ F4e fault injection | The player now creates an earlier object URL. The save-failure probe must be armed after the player exists; otherwise it tests player creation instead of saving. (`src/main.ts:2878`; contract:97.) |

## What held up

The authored visual system remains disciplined. The eight type roles are centralised; the footer’s main heading uses the panel role and its questions use the section role. Both tips share their border, padding, text treatment and button size. The finished player shares the preview’s width and height cap and has a token-based top gap inside the card. These are sound source-level foundations for hierarchy, alignment and rhythm, although they do not prove the resulting pixels. (`src/styles/app.css:1592`, `1612`, `1621`, `1086`, `1094`, `1330`; `src/styles/tokens.carbon.css:42`, `87`.)

I independently recalculated the colour pairs enumerated by the contrast test: all 20 text pairs and eight interface/focus pairs meet their thresholds in each of light, dark and the blue band. Minimum text ratios were **7.416:1**, **7.581:1** and **7.581:1** respectively; minimum interface-pair ratios were **3.826:1**, **5.532:1** and **5.532:1**. This verifies those token pairs, not every rendered state or native-player control. (`test/contrast.test.ts:95`, `121`; `src/styles/tokens.brand.css:114`, `161`, `191`.)

I also independently checked all three language objects: each contains **521 string leaves**, with matching keys and placeholders. Closing heading/legend names and both onset option/help terms agree within each language. This supports parity, not fluency or reading level. The gate already pins those distinctions, static bindings and preset/config agreement. (`src/i18n/en-GB.ts:37`; `src/i18n/zh-Hans.ts:14`; `src/i18n/ms-MY.ts:14`; `src/i18n/tables.test.ts:35`, `54`, `109`.)

The four journeys have coherent next-action rules:

| State | Intended next action and source support |
|---|---|
| Empty / startup blocked | Choose once startup allows it; otherwise the local explanation supplies recovery. (`src/main.ts:1302`, `2454`.) |
| Checking / stopped check | Stop the check, then Check again; the settled verdict replaces the check’s controls. (`src/main.ts:2294`, `2320`, `2334`.) |
| Invalid trim / invalid card | Correct the identified field; card refusal focuses the first problem. (`src/main.ts:1884`, `2678`; `index.html:190`, `212`.) |
| Discouraged | Continue anyway explicitly acknowledges the warning, then exposes Create. (`src/main.ts:2236`.) |
| Running / cancelling | Cancel remains the exit; late progress cannot restart the stopped presentation. (`src/main.ts:2030`, `2393`.) |
| Finished / previous video | Save leads; Create is secondary and “again” depends on the chosen source, not merely a visible result. (`src/main.ts:2162`, `2915`, `3292`.) |
| Unsaved remake | Existing discard question names the result being lost; Keep restores it. (`src/main.ts:2792`, `2831`.) |
| Save cancelled, refused or failed | Retain the result and allow saving again; download hand-off is distinguished from a completed write. (`src/main.ts:3382`, `3395`, `3463`; `src/ui/save-text.ts:29`.) |

State competition is generally reduced deliberately: the spent preflight verdict disappears at job completion; save status cannot overwrite the next file’s check; the lifetime note is not repeated beside a result; output warnings are siblings rather than nested notification rails. D-06 identifies where that last consolidation now puts consequential advice too late. (`src/main.ts:3044`, `846`, `2926`, `3286`.)

The focus transitions warrant distinct verdicts rather than one general “focus passes” claim:

| Transition | Source verdict |
|---|---|
| Create or Discard → running | Captures the departing action and hands on to Cancel. (`src/main.ts:2933`.) |
| Cancel settles → Create | Captures Cancel/Announce progress and uses Create as successor after unlock. (`src/main.ts:3040`, `3086`, `3141`.) |
| Job completes → result | Captures displaced job controls; result is focusable with `tabIndex=-1`; focus elsewhere is preserved. (`src/main.ts:3040`, `3053`, `3277`; `src/ui/focus-hand-on.ts:89`.) |
| Job fails → explanation | Both reply and exception routes prepare a focusable explanation. (`src/main.ts:3091`, `3101`, `3112`.) |
| Card refusal → first invalid field | Explicit, with invalid state and associated error text. (`src/main.ts:2601`, `2678`.) |
| Preflight blocks → chooser | Withdrawn setup is captured before hiding; the moved language control is included through its step. (`src/main.ts:939`, `1595`.) |
| Inspection fails → chooser | **Incomplete: V-46.** (`src/main.ts:1486`, `1767`.) |
| Retry/check ends during a save | Successor list includes Stop saving when Create cannot take focus. (`src/main.ts:1632`; `src/ui/focus-hand-on.ts:51`.) |
| Keep → retained card | Explicit capture before replacing the question. (`src/main.ts:2833`.) |
| Save completes while player has focus | Explicit player capture before release, then hand-off to card. Native internal-control focus representation is unverified. (`src/main.ts:3440`, `3452`.) |
| Dialog opens/closes during work | Native modal mechanism; the hand-off helper refuses to steal focus while it is open. Actual opener return and keyboard cycle require a browser. (`src/main.ts:3571`, `3663`; `src/ui/focus-hand-on.ts:90`.) |

### WCAG 2.2 comparison

The table covers the plan’s 86 criteria, grouping criteria only where their verdict and evidence are shared. **S** = met in the inspected source; **E** = gap in current evidence; **D** = defect; **L** = accepted limitation, not a pass; **N/A** = not applicable here. An **S + E** verdict identifies a sound authored mechanism whose complete operation still requires rendering or assistive technology.

**P7:n** denotes `reviews/2026-10-22/design-pass-2/wcag-2026-10-23.md:n`. Its verdict column is historical evidence, not inherited conformance.

| Criterion | Phase 7 | This export: verdict and evidence |
|---|---|---|
| 1.1.1 Non-text Content | Met, P7:35 | **S + E.** Logo alternative and finished-player name are present; native control names need inspection. (`src/ui/brand-assets.ts:63`; `src/main.ts:2882`.) |
| 1.2.1, 1.2.2, 1.2.3, 1.2.5, 1.2.6, 1.2.7, 1.2.8 Prerecorded media alternatives | L, P7:36–43 | **L.** Both players fall under the recorded content limitation. Silent added cards and no autoplay do not supply missing captions, descriptions, signing or alternatives. (`docs/01-specification.md:740`; `src/main.ts:2870`.) |
| 1.2.4, 1.2.9 Live media | N/A, P7:39,44 | **N/A.** The new player reads a finished local file, not a live stream. (`src/main.ts:2878`.) |
| 1.3.1 Info and Relationships | Met, P7:45 | **S + E.** New footer heading levels, language legend/helper and named player are explicit; spoken relationships need AT. (`index.html:259`, `822`; `src/main.ts:2882`.) |
| 1.3.2 Meaningful Sequence | Met, P7:46 | **S + E.** Language precedes title-card choices; narrow help layout needs a visual/keyboard check. D-06 is a preventive-order concern, not by itself proof that the page’s meaning is lost. (`index.html:259`; `src/styles/app.css:1051`; `src/main.ts:3327`.) |
| 1.3.3 Sensory Characteristics | S, P7:47 | **S.** Instructions name controls, steps and actions rather than relying solely on position or appearance. (`src/i18n/en-GB.ts:250`, `277`, `784`.) |
| 1.3.4 Orientation | Met, P7:48 | **E.** Responsive player sizing is present; landscape controls and fullscreen behaviour need real devices. (`src/styles/app.css:1330`; `src/main.ts:2877`.) |
| 1.3.5 Identify Input Purpose | N/A, P7:49 | **N/A in inspected fields.** These describe video/card content; no newly introduced field requests a listed personal-input purpose. (`index.html:300`, `349`, `862`.) |
| 1.3.6 Identify Purpose | Met, P7:50 | **S.** Header, main and footer remain semantic; help grouping does not manufacture another landmark. (`index.html:26`, `30`, `684`, `822`.) |
| 1.4.1 Use of Color | Met, P7:51 | **S.** Warnings have words; selected segments also change weight; locks have text and disabled semantics. (`src/ui/warning-text.ts:105`; `src/styles/app.css:1671`; `src/main.ts:2442`.) |
| 1.4.2 Audio Control | S, P7:52 | **S + E.** Neither player autoplays; native controls are requested. Their operation requires a browser. (`index.html:173`; `src/main.ts:2875`.) |
| 1.4.3 Contrast Minimum; 1.4.6 Contrast Enhanced | Met, P7:53,56 | **S for recalculated authored pairs; E for rendering/native UI.** New footer and tip text use existing compliant roles. (`test/contrast.test.ts:95`; `src/styles/app.css:1612`, `1643`; `src/main.ts:2875`.) |
| 1.4.4 Resize Text | Met, P7:54 | **E.** Rem sizing is present, but changed states need actual enlargement. Known narrow/font-32 cases remain VH-189.1. (`src/styles/tokens.carbon.css:43`; `project/wish-list.md:56`.) |
| 1.4.5 Images of Text; 1.4.9 Images of Text, No Exception | S, P7:55,64 | **S for page UI; E for the added cards within the new player.** Labels remain HTML and the logo has its logotype exemption. The cards are rasterised video text; their accessible equivalent must not be inferred merely from being silent. (`index.html:822`; `src/ui/title-card-step.ts:175`, `306`; `docs/01-specification.md:721`, `745`.) |
| 1.4.7 Low or No Background Audio | N/A, P7:57 | **N/A to authored audio-only presentation.** Branding is silent; the new element presents video. (`docs/01-specification.md:219`; `src/main.ts:2873`.) |
| 1.4.8 Visual Presentation | Met on stated reading, P7:58 | **S for relevant CSS mechanisms; E overall.** All five parts are separated below. (`UI-STANDARDS.md:208`.) |
| 1.4.10 Reflow | Met, P7:65 | **E.** Width caps, wrapping and the narrow help grid support reflow, but changed cards, footer, tips and native controls need 320 CSS px testing. (`src/styles/app.css:36`, `1051`, `1330`, `1533`.) |
| 1.4.11 Non-text Contrast | D/E, P7:66 | **S for token pairs; E for painted components.** Fixed thumb artwork and forced-colour rules address V-41 in source; no new pixel verdict is claimed. (`src/styles/tokens.carbon.css:113`; `src/styles/app.css:1813`; `test/contrast.test.ts:121`.) |
| 1.4.12 Text Spacing | Met, P7:67 | **E.** Text generally wraps and spacing is tokenised, but override survival in the changed states is unmeasured. (`src/styles/app.css:36`, `54`, `1094`; `src/styles/tokens.carbon.css:64`.) |
| 1.4.13 Content on Hover or Focus | N/A, P7:68 | **N/A for both tips:** they open on activation, not merely hover or focus. Their dismissal and persistence mechanisms are nevertheless present. (`src/main.ts:721`, `723`, `731`, `735`, `742`.) |
| 2.1.1 Keyboard; 2.1.3 Keyboard, No Exception | E, P7:69,71 | **E.** Native buttons/radios and explicit trim keys support operation; new player internals and select popups remain untested. (`src/ui/trim.ts:164`; `src/main.ts:2875`; `index.html:443`.) |
| 2.1.2 No Keyboard Trap | Met, P7:70 | **E.** Native modal and media controls require a complete forward/backward keyboard route. (`index.html:851`; `src/main.ts:3571`, `2875`.) |
| 2.1.4 Character Key Shortcuts | N/A, P7:72 | **N/A for authored shortcuts; E for native media shortcuts.** Authored keys are arrows, Page/Home/End and Escape. (`src/ui/trim.ts:172`; `src/main.ts:723`.) |
| 2.2.1 Timing Adjustable; 2.2.3 No Timing | S, P7:73,75 | **S.** The timed trim operation schedules computation; it is not a deadline for the person. (`src/config/trim.ts:48`; `src/main.ts:1884`.) |
| 2.2.2 Pause, Stop, Hide | Met on essential reading, P7:74 | **S on the recorded essential-progress reading; E for player operation.** Keep the progress bar. The player is user-started and has native pause; this is separate from the media-alternative and flash limitations. (`docs/01-specification.md:725`; `src/main.ts:2875`; `src/styles/app.css:509`.) |
| 2.2.4 Interruptions | Met, P7:76 | **S + E.** Routine progress can be suppressed; completion and warning titles still enter the status region. Actual announcement timing needs AT. (`src/ui/progress.ts:158`; `src/main.ts:3072`.) |
| 2.2.5 Re-authenticating | N/A, P7:77 | **N/A.** No authentication step in the local workflow. (`docs/01-specification.md:583`.) |
| 2.2.6 Timeouts | N/A, P7:78 | **N/A to inactivity expiry.** Tab lifetime is explicitly disclosed; it is not an inactivity timer. (`src/i18n/en-GB.ts:395`, `451`.) |
| 2.3.1 Flash Threshold; 2.3.2 Three Flashes | L, P7:79–80 | **L.** The recording’s flash safety remains the explicit exception; never autoplaying is mitigation, not a pass. (`docs/01-specification.md:740`.) |
| 2.3.3 Animation from Interactions | Met, P7:81 | **S for authored CSS; E for native presentation.** Reduced-motion override remains. (`src/styles/app.css:509`; `src/main.ts:2875`.) |
| 2.4.1 Bypass Blocks | Met, P7:82 | **S + E.** Skip link precedes the header; its visible focus state and landing need a browser. (`index.html:18`, `30`.) |
| 2.4.2 Page Titled | S, P7:83 | **S.** Page/state titles use the current language and outcome. (`src/ui/progress.ts:165`; `src/i18n/en-GB.ts:578`.) |
| 2.4.3 Focus Order | D, P7:84 | **D: V-46 incomplete.** The original repaired routes are present, but unreadable inspection still withdraws focused setup. New player routes are additionally E. (`src/main.ts:1767`, `3040`, `3440`.) |
| 2.4.4 Link Purpose in Context; 2.4.9 Link Purpose, Link Only | Met, P7:85,90 | **S.** Footer routes name audience, destination and new-tab behaviour without depending on their headings. (`index.html:827`, `830`, `841`.) |
| 2.4.5 Multiple Ways; 2.4.8 Location | N/A, P7:86,89 | **N/A.** This is a single workflow page. (`index.html:30`, `124`, `565`.) |
| 2.4.6 Headings and Labels | Met, P7:87 | **S + E.** Footer questions and video-language legend are explicit; actual accessibility-tree/native naming remains to be read. (`index.html:260`, `823`; `src/main.ts:2882`.) |
| 2.4.7 Focus Visible | Met, P7:88 | **S for author rules; E overall.** Global focus styling exists, but native media and the taller result card need inspection. (`src/styles/app.css:107`; `src/main.ts:3277`.) |
| 2.4.10 Section Headings | Met, P7:91 | **S.** Help and feedback has a real `h2`; all three route groups have real `h3`s. (`index.html:823`, `824`, `833`, `839`.) |
| 2.4.11 Focus Not Obscured, Minimum; 2.4.12 Enhanced | Met, P7:92–93 | **E.** No sticky-band mechanism is introduced, but tall player/card and small-dialog views require actual focus visibility checks. (`test/stylesheet.test.ts:41`; `src/styles/app.css:1330`, `1533`.) |
| 2.4.13 Focus Appearance | D, P7:94 | **S for the V-40–V-42 repairs; E for current painted area/contrast.** Native-player indicators need inspection and any UA exception must be established separately. (`src/styles/app.css:537`, `1451`, `1880`; `test/stylesheet.test.ts:386`.) |
| 2.5.1 Pointer Gestures | S, P7:95 | **S for authored UI; E for native media.** File selection and typed trim alternatives remain. (`index.html:135`, `190`, `212`; `src/main.ts:2875`.) |
| 2.5.2 Pointer Cancellation | S, P7:96 | **S for authored activation; E for native media.** Buttons use click handlers; media controls remain browser-owned. (`src/main.ts:721`, `3340`; `src/ui/drop-zone.ts:150`.) |
| 2.5.3 Label in Name | D, P7:97 | **L for V-43 under VH-168; S for changed authored labels.** Footer and Create names are their text; the native chooser remains reserved. (`index.html:139`, `835`; `src/main.ts:2290`; `docs/01-specification.md:738`.) |
| 2.5.4 Motion Actuation | N/A, P7:98 | **N/A to authored controls.** No new motion-operated action is introduced by the player construction. (`src/main.ts:2870`.) |
| 2.5.5 Target Size Enhanced; 2.5.8 Minimum | Met, P7:99,102 | **S for declared author floors; E for rendered targets.** Buttons/help use the 44 px token; footer links have minimum height. Native-video targets receive WCAG’s UA-control exemption, not a measured 44 px pass. (`src/styles/app.css:210`, `341`, `1086`; `docs/01-specification.md:721`.) |
| 2.5.6 Concurrent Input Mechanisms | S, P7:100 | **S + E.** Native controls and file/trim alternatives remain; real touch-plus-keyboard use is untested. (`index.html:135`, `173`, `190`; `src/main.ts:2875`.) |
| 2.5.7 Dragging Movements | Met, P7:101 | **S for authored trim/drop; E for media scrubbing.** Time fields and Set buttons provide alternatives. (`index.html:190`, `201`, `212`, `223`.) |
| 3.1.1 Language of Page | Met, P7:103 | **S.** Page language is updated during repaint. (`src/main.ts:3782`.) |
| 3.1.2 Language of Parts | S, P7:104 | **S + E.** Language names and quoted video-language runs carry `lang`; diagnostics stay English. Native control language needs observation. (`src/ui/language-switcher.ts:71`; `src/ui/video-language.ts:100`; `index.html:879`.) |
| 3.1.3 Unusual Words | E, P7:105 | **E.** MP4 and closing help provide explanations; adequacy of translated terms needs native readers. (`src/i18n/en-GB.ts:89`, `323`; `src/config/languages.ts:42`.) |
| 3.1.4 Abbreviations | L, P7:106 | **L for recorded units/name/codecs; S for added MP4 explanation mechanism.** (`docs/01-specification.md:748`, `753`, `757`; `src/i18n/en-GB.ts:91`.) |
| 3.1.5 Reading Level | E, P7:107 | **E.** Key parity and English readability tests cannot establish comprehension of new translated help/warnings. (`src/i18n/tables.test.ts:35`; `src/i18n/zh-Hans.ts:600`; `src/i18n/ms-MY.ts:640`.) |
| 3.1.6 Pronunciation | N/A, P7:108 | **N/A provisionally; native-reader confirmation remains.** New translated text has not acquired pronunciation assistance. (`src/i18n/zh-Hans.ts:47`; `src/i18n/ms-MY.ts:47`.) |
| 3.2.1 On Focus | Met, P7:109 | **S for authored behaviour.** Focus dismisses help; it does not initiate a job or navigation. (`src/main.ts:731`.) |
| 3.2.2 On Input | Met, P7:110 | **S + E.** Switches update settings in place; jobs snapshot choices. Announced experience needs AT. (`src/main.ts:654`, `692`, `2944`.) |
| 3.2.3 Consistent Navigation; 3.2.4 Consistent Identification; 3.2.6 Consistent Help | N/A, P7:111–114 | **N/A to repeated-page requirements.** Within this page, shared tips and reporting remain consistent. (`src/main.ts:742`, `3665`.) |
| 3.2.5 Change on Request | Met, P7:113 | **S + E.** Hand-off guards preserve focus elsewhere and in the dialog; the known missing hand-off is recorded at 2.4.3. (`src/ui/focus-hand-on.ts:89`; `src/main.ts:1767`.) |
| 3.3.1 Error Identification | Met, P7:115 | **S for input validation.** Invalid fields receive text and `aria-invalid`. Heavy limiting is not identified as an input error. (`src/main.ts:2589`, `2601`; `src/audio/warnings.ts:201`.) |
| 3.3.2 Labels or Instructions | Met, P7:116 | **S.** Video-language scope, required submission fields and trim format are supplied before submission. (`index.html:261`, `349`, `234`.) |
| 3.3.3 Error Suggestion | Met, P7:117 | **S for validation/recovery; D-05/D-06 remain UX concerns.** Field errors name corrections; limiting advice supplies a current listening action and deliberately general future advice. (`src/i18n/en-GB.ts:272`, `295`, `722`; `project/items/VH-193.md:34`.) |
| 3.3.4 Error Prevention, Legal/Financial/Data | Met, P7:118 | **S + E.** Discard is confirmed and source-file overwrite refusal is handled; actual save-dialog behaviour needs a browser. (`src/main.ts:2792`, `3391`.) |
| 3.3.5 Help | Met, P7:119 | **S.** Existing help slots explain trim, closing and format; footer routes now separate needs. (`index.html:234`, `476`, `66`, `822`.) |
| 3.3.6 Error Prevention, All | Met, P7:120 | **S for authored mechanisms; E for end-to-end use.** Validation precedes work, discard asks first, email is handed to the person’s app for review. No new limiting acknowledgement is required by this evidence. (`src/main.ts:2678`, `2792`, `3625`; `src/i18n/en-GB.ts:854`.) |
| 3.3.7 Redundant Entry | Met, P7:121 | **S.** Switches hide rather than erase card values; language refill preserves an edited/cleared date. (`src/main.ts:2657`; `src/ui/title-card-step.ts:92`.) |
| 3.3.8, 3.3.9 Accessible Authentication | N/A, P7:122–123 | **N/A.** No app authentication in the workflow. External help destinations are not evaluated here. (`docs/01-specification.md:583`; `src/config/feedback.ts:18`, `24`.) |
| 4.1.2 Name, Role, Value | Met, P7:125 | **S for author markup; E for native/AT exposure.** Named video, native fieldsets and tip expanded state are explicit. (`src/main.ts:2882`, `715`; `index.html:259`.) |
| 4.1.3 Status Messages | Met, P7:126 | **S + E.** Separate live regions and unconditional result announcement remain. Native speech delivery, simultaneous save/check messages and language-change suppression need AT. (`index.html:581`, `641`; `src/main.ts:3072`, `3736`.) |

For **1.4.8**, the five parts and the three width readings must remain separate:

| Part | Current judgment |
|---|---|
| User-chosen foreground/background | **E.** System-colour rules support forced colours, while the header deliberately retains brand colours. Real user overrides, including outside forced-colours mode, need testing. (`src/styles/app.css:1709`, `1721`; P7:59.) |
| Width | **S for the 28rem cap; E for line results.** Raw Latin/CJK/mixed-script counts are unmeasured. The house calculation—CJK glyph counted twice against 80—is a separate test. G204’s resize/reflow mechanism is a third assessment; neither the cap nor a weighted count proves it. (`src/styles/tokens.carbon.css:70`; `src/styles/app.css:36`, `1492`; `UI-STANDARDS.md:208`; P7:60.) |
| No justification | **S.** The running-text rules do not introduce justified text. (`src/styles/app.css:36`, `1592`; P7:61.) |
| Line and paragraph spacing | **S for the documented implementation; E for changed rendering/overrides.** Body spacing is 1.5; paragraph gaps use the shared token, including the two-paragraph onset tip. Judge against §9.3’s recorded top-to-top reading, not an invented new spacing rule. (`src/styles/tokens.carbon.css:61`; `src/styles/app.css:54`, `1107`; `docs/01-specification.md:706`; P7:62.) |
| 200% enlargement without horizontal line scrolling | **E.** Requires actual text enlargement at a full-screen window; a 320 px viewport and a 32 px default font are distinct tests. (`UI-STANDARDS.md:214`; `docs/01-specification.md:703`; P7:63.) |

## What only a browser or a person can settle

- **Native player operation and focus:** Tab/Shift+Tab through each control, names and values, seeking, pause, fullscreen, focus indicators, and save completion while a native control owns focus. Test the finished player independently of the trim preview. The source’s host-level focus capture is promising, not proof of how each browser exposes its internal controls. (`src/main.ts:2870`, `3440`; contract:35.)

- **Player lifetime across DOM changes:** open discard while playing; Keep; choose another file while playing; change page language; stop, cancel, refuse and fail a save; complete a save; navigate away/back. Verify pauses, current time, one URL, revocation and preserved warnings. Reusing the same element does not itself prove uninterrupted playback after moving it between cards. (`src/main.ts:1444`, `2849`, `3285`, `2890`; `project/wish-list.md:59`.)

- **Failed finished playback:** source installs no app-level player error recovery in `resultPlayerFor`. A browser must show whether its own error presentation is understandable and whether the person can still save and check locally. Do not record this as a demonstrated silent failure, or as satisfactory recovery, without observing it. (`src/main.ts:2870`; `src/i18n/en-GB.ts:430`; contract:35.)

- **Rendered design and enlargement:** final chooser position; all eight roles in changed states; one gap per relation; footer wrapping; both tips at the breakpoint; long result names; both warnings; native controls at 320 px, short height, actual zoom and text-spacing overrides. Check light, dark and real Windows contrast themes. (`src/styles/app.css:1051`, `1330`, `1533`, `1592`; contract:38–40.)

- **Assistive technology:** consequential announcements with progress off, simultaneous check/save messages, unreadable-file focus recovery, dialog return from both openers, and language changes while a result or tip is present. The two-frame live-region quieting cannot be validated by inspecting DOM text alone. (`src/main.ts:3072`, `3665`, `3736`; `docs/01-specification.md:859`.)

- **Audio and human comprehension:** listen to heavily limited output; verify whether the warning helps a novice make a decision; have native readers assess Chinese and Malay terms and reading level. Exercise both output warnings together and the producer’s non-finite/lowered-ceiling paths. Existing tests cover threshold/order and one measured planning case, not the whole requested integration. (`src/audio/warnings.test.ts:207`; `src/media/sub-block-sound.test.ts:123`; `src/media/audio-plan.ts:442`, `467`; `project/wish-list.md:60`, `61`.)

## Set aside, with reasons

- **Previously identified defects retain their identities.** V-40–V-42’s ring repairs, V-33/D-02’s feedback measure, V-44’s forced-colour hover, V-45’s closing name and V-47/D-04’s rate wording are present in source. They are not new findings. V-46 remains the incomplete fix described above. (`src/styles/app.css:537`, `1451`, `1492`, `1749`, `1880`; `src/i18n/en-GB.ts:138`, `189`; `src/main.ts:1767`.)

- **Reserved owner decisions remain reserved.** No restructuring of the page or movement of switchers is proposed. V-18’s final geometry remains unverified. The lede’s five promises are the owner’s VH-196 wording. The native chooser’s label/name limitation remains VH-168/V-43. (`reviews/2026-10-25/design-pass-3/plan-2026-10-25.md:34`; contract:38–40; `project/decisions.md:414`.)

- **Statement wording is not reopened here.** Its preview-only limitation description is already VH-192.1, and its chooser-language scope is VH-194.2, routed to VH-137. These prevent treating the statement as evidence that the finished player was fully covered; they do not need new D-identities. (`src/i18n/en-GB.ts:904`, `906`; `project/wish-list.md:58`, `64`.)

- **Existing follow-ups are not rediscovered.** Worker-row wrapping is VH-186.1; enlarged narrow layouts are VH-189.1; the untrimmed sub-block audio case is VH-185.1; the QuickTime Animation hang is VH-193.3. D-05 concerns the newly adopted trimmed-audio explanation, not that separate untrimmed case. (`project/wish-list.md:54`, `55`, `56`, `62`.)

- **Accepted limitations are not passes.** Media alternatives and flash safety stay under §9.3’s recorded player-content exception. The progress bar stays under its separate essential-content reading. No new control is proposed to resolve either. (`docs/01-specification.md:725`, `740`.)

- **Verification scope:** this was source and markup review of the frozen export. I ran read-only language-parity, ID and token-contrast calculations; I did not run the application, the Vitest gate, the structural/budget checker or any browser matrix. Structural tests themselves explicitly distinguish rule presence from computed effects. No file was changed. (`test/stylesheet.test.ts:1`; `test/screen-text.test.ts:1`; `project/profile.md:25`.)
