<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), blind design review for VH-143, 2026-10-21, kept as written. Its brief is codex-astra-design-brief-2026-10-21.md. -->

# Codex astra — blind design review, 21 October 2026

The page retains much of the 1 October design: a restrained type scale, numbered steps, shared notifications and a clear change of emphasis from Create to Save. It does **not yet meet that standard consistently**. The strongest remaining design defects are incomplete control of browser-supplied styling, repeated explanations, inconsistent list formatting and a save failure that lacks the established error treatment. These are local corrections, not grounds for restructuring or folding the page. This is a source review for VH-143; it makes no new rank-1 finding and does not repeat V-01–V-17. The benchmark is VH-124’s acceptance criterion and “Across every state”, rather than a claim that passing the existing tests establishes design quality. Sources: `project/items/VH-124.md:9`; `reviews/2026-10-01/vh-124/README.md:54`; `docs/01-specification.md:838`.

## D-01 The token boundary stops before the browser’s styling begins — rank 2

**Saw.** Authored dimensions generally use tokens, but several visual decisions remain outside that system:

- `.status` sets `margin-top`, font size and minimum height, but leaves its bottom margin to the browser. With the usual paragraph margin of `1em`, its 14 px text produces a 14 px bottom margin, outside the declared spacing scale. The newer empty save line resets its top margin and minimum height, not that bottom margin.
- `.choice .label { padding: 0; }` resets legends inside the older choice groups. The three newer `.segmented` switchers have no equivalent legend reset, so their label inset remains browser-supplied.
- `.radio input` sets width and height without resetting native margins; the checkbox explicitly uses `margin: 0`. The controls therefore do not establish their alignment in the same way.
- Weights remain literals: `font-weight: 700` for panel headings and `600` for notification titles, disclosure summaries and selected segments. The two token files define sizes and families, but no weight roles.
- The notification and feedback `<pre>` rules specify size without a font-family token. Their monospace face remains the browser’s choice.

The button, select, textarea and dialog rules also leave corner treatment unspecified. That is an uncontrolled dependency, not evidence that every browser actually draws rounded corners. The stylesheet test examines declarations that exist; it cannot detect styling supplied because a declaration is absent.

**Standard.** VH-124 requires layout, spacing and type to come from the two token files. Carbon’s digest requires its spacing scale and productive type styles. UI-STANDARDS’ “Perceivable” rules require token-based dimensions and line heights; Design review gate points 1, 2 and 9 require a deliberate component and state treatment.

**Direction.** Complete the shared component defaults: explicitly set paragraph margins, segmented-legend padding and radio margins; establish square corners where that is the intended component shape; name the existing weight roles in the token system. Either give diagnostic monospace an explicit token or record its exception. Preserve native interaction and documented browser-owned video controls. Extend the existing token check to cover weights and these component defaults, rather than merely adding more literal-value searches.

**Source.** `src/styles/app.css:276`, `src/styles/app.css:399`, `src/styles/app.css:775`, `src/styles/app.css:788`, `src/styles/app.css:1039`, `src/styles/app.css:245`, `src/styles/app.css:444`, `src/styles/app.css:1086`, `src/styles/app.css:469`, `src/styles/app.css:1475`; `src/styles/tokens.carbon.css:31`; `src/styles/tokens.brand.css:81`; `test/stylesheet.test.ts:79`; `project/digests/carbon.md:25`, `project/digests/carbon.md:42`; `UI-STANDARDS.md:210`.

## D-02 Two states explain the same thing more than once — rank 2

**Saw.** Selecting None produces three copies of **“Not used with None.”** The onset, colour and Internal use only helpers independently return and display the same sentence.

The download state repeats the result’s lifetime:

> “It stays here until you start another video or close this tab.”

and, beneath it:

> “The video stays here until you start another one.”

Both are deliberately painted in the same download branch. This finding concerns simultaneous repetition, independently of V-04’s later repaint problem.

**Standard.** VH-124: “no visible line repeats another in view”. UI-STANDARDS’ aesthetic/minimalist and status-line rules require information to be said once where it is already visible. Nielsen heuristic 8 requires each element to earn its place.

**Direction.** Under None, show one shared reason for the three disabled controls and retain their accessible description associations. Keep the distinct sentence explaining that no closing will be added. For downloads, retain the result’s complete lifetime sentence and remove the repeated lifetime sentence from the download message; retain its destination, unfinished-download qualification and next action.

**Source.** `src/ui/closing-choice.ts:67`, `src/ui/closing-choice.ts:74`, `src/ui/closing-choice.ts:79`; `src/main.ts:555`; `src/i18n/en-GB.ts:312`, `src/i18n/en-GB.ts:407`, `src/i18n/en-GB.ts:868`; `src/main.ts:3109`; `project/items/VH-124.md:9`; `UI-STANDARDS.md:222`; `project/digests/nielsen.md:31`.

## D-03 The new lists do not follow the capital-and-full-stop rule — rank 2

**Saw.** The statement contains eleven unstopped list entries in each language: five abilities and six possible future tests. English examples include:

> “use it with a keyboard alone”

> “using the tool with a keyboard alone”

The corresponding Malay entries also begin in lower case. Chinese entries such as **“仅使用键盘操作本工具”** lack their terminal `。`. The statement’s limitations list, by contrast, already uses complete, stopped entries.

The two footer contact links are also rendered as list items without terminal punctuation. They are clear action labels, but the resulting list does not satisfy VH-124’s literal “every list item” criterion.

The current tests pin the opening bullets and count the statement’s list entries; they do not apply that formatting rule to the newer lists.

**Standard.** VH-124 explicitly requires every list item and sentence to start with a capital and end with a full stop. UI-STANDARDS requires consistent language and presentation. Chinese capitalisation is inapplicable; its punctuation convention is not.

**Direction.** Apply the mechanical formatting rule to the prose lists: initial capitals where the language has case, and the appropriate terminal stop. Footer list punctuation can sit outside the links, preserving their existing action labels. This does not require rewriting the statement’s claims, choosing its future tests or resolving VH-137.

**Source.** `src/i18n/en-GB.ts:781`, `src/i18n/en-GB.ts:828`; `src/i18n/zh-Hans.ts:701`, `src/i18n/zh-Hans.ts:742`; `src/i18n/ms-MY.ts:756`, `src/i18n/ms-MY.ts:800`; `index.html:750`; `test/screen-text.test.ts:70`, `test/screen-text.test.ts:271`; `project/items/VH-124.md:9`; `UI-STANDARDS.md:144`.

## D-04 Save failure loses the established error hierarchy — rank 2

**Saw.** A failed save calls:

```ts
setSaveStatus(() => t().status.saveFailed)
```

The words are useful—**“The video could not be saved. It is still here to try again.”**—but they appear in the same secondary-colour, compact paragraph used for “Saving…” and “Saved.” The retained result remains a success notification above it.

Other substantial failures use `notification({ kind: 'error', ... })`, with a title and supporting recovery text. The save failure therefore changes the visual meaning of an error at the final delivery step.

**Standard.** UI-STANDARDS’ single-inline-notification rule; Carbon’s component-first rule; Nielsen heuristic 9, recognising and recovering from errors; Design review gate point 9, considering error states rather than styling only successful progress.

**Direction.** Use the existing error notification for a failed save beside the retained result, reusing the two existing sentences as title and recovery text. Keep ordinary saving, cancellation and successful-save updates in the separate save status channel. Preserve the retry action and avoid a second visible copy in its live announcement.

**Source.** `src/main.ts:3152`; `src/i18n/en-GB.ts:386`; `index.html:587`; `src/styles/app.css:399`; `src/main.ts:2985`; `src/ui/source-panel.ts:265`; `src/ui/notification.ts:43`; `UI-STANDARDS.md:215`; `project/digests/carbon.md:18`; `project/digests/nielsen.md:33`.

## D-05 Mechanical language formatting varies within each table — rank 3

**Saw.** The inconsistency is verifiable without judging translation quality:

| Table | Inconsistent treatment |
|---|---|
| English | New card and closing copy uses typographic quotation marks, as in `“{words}”`; feedback instructions retain straight quotes around `"Copy message and details"` and `"What will be sent with it"`. |
| Chinese | Checking and stopping a save end in `……`; cancelling and saving end in `…`. Equivalent ongoing-status labels therefore have different punctuation. |
| Malay | The machine-translation notice and feedback dialog use `e-mel`; the Smaller preset description uses `emel`. |

**Standard.** UI-STANDARDS’ consistency rules and Nielsen heuristic 4: the same meaning should receive the same wording and treatment. Spec §9 requires language-specific punctuation and formatting.

**Direction.** Normalise these mechanical choices using conventions already present in each table: typographic quotes, one Chinese ellipsis convention, and the established Malay spelling. Make the corrections through the translation source and regeneration route named in the generated tables. Leave idiom, tone and semantic correctness to native reviewers.

**Source.** `src/i18n/en-GB.ts:104`, `src/i18n/en-GB.ts:757`, `src/i18n/en-GB.ts:763`; `src/i18n/zh-Hans.ts:325`; `src/i18n/ms-MY.ts:36`, `src/i18n/ms-MY.ts:325`, `src/i18n/ms-MY.ts:732`; `src/i18n/zh-Hans.ts:1`; `UI-STANDARDS.md:144`; `project/digests/nielsen.md:23`; `docs/01-specification.md:568`.

## What held up

**The underlying hierarchy remains coherent.** The declared scale is 28 px for the page title, 20 px for step headings, 16 px for body text and compact statement subheadings, and 14 px for controls and supporting information. Panels consistently use 24 px padding and separation. The statement uses 32 px before subheadings, 8 px after them and the existing paragraph-gap token. D-01 concerns incomplete control of that system, rather than a need for a different scale. Sources: `src/styles/tokens.carbon.css:31`; `src/styles/app.css:160`, `src/styles/app.css:235`, `src/styles/app.css:902`.

**The new surfaces mostly reuse the right components.**

| Surface | Source-based design judgment |
|---|---|
| Page language, Video type and Video language | One segmented-radio treatment, visible legends and native inputs. Both language selectors share their builder. Selected labels reserve their heavier width, avoiding movement when selected. The three selected blue faces add substantial emphasis before Step 1, but they represent selections rather than three extra primary actions. Sources: `src/ui/language-switcher.ts:64`; `index.html:65`, `index.html:88`; `src/styles/app.css:1083`, `src/styles/app.css:1129`; `test/stylesheet.test.ts:124`. |
| Machine-translation notice | Uses the existing information notification and a self-describing correction link. Its treatment is consistent with other information; its prominence above the title is a structural consideration reserved to the owner. Sources: `src/ui/language-switcher.ts:125`; `src/main.ts:3388`; `src/styles/app.css:1176`. |
| Staff and Student submission fields | Existing input, textarea, checkbox, helper and field-error treatments. Field-specific refusals belong beside the offending field; turning each into a full notification would weaken that association. Sources: `index.html:243`, `index.html:304`; `src/main.ts:2410`; `src/styles/app.css:1463`. |
| Closings and Internal use only | Existing select, segment and checkbox components. The result sentence describes the consequence, including whether the closing covers the last second. D-02 is the new duplication under None. Sources: `index.html:391`, `index.html:472`; `src/ui/closing-choice.ts:45`. |
| Verdict, losses, warnings and decode damage | Share the notification anatomy. Decode damage is an item in the warning collection, not another bespoke panel. Its times are bounded and deduplicated. Sources: `src/ui/preflight-panel.ts:144`; `src/ui/source-panel.ts:218`; `src/ui/warning-text.ts:29`, `src/ui/warning-text.ts:45`, `src/ui/warning-text.ts:85`. |
| Statement and footer | The statement correctly uses a prose disclosure rather than a notification. Its summary shares the System check treatment, and its internal headings use productive body typography. Sources: `src/styles/app.css:873`, `src/styles/app.css:902`; `index.html:646`. |
| Trim preview | The preview is deliberately large but capped at `60vh`. Moving a handle pauses playback and resolves to the latest requested frame, supporting the trimming task rather than adding continuous movement. Sources: `src/styles/tokens.carbon.css:73`; `src/styles/app.css:1236`; `src/ui/preview-seek.ts:25`. |
| Save line and time left | Separate save and job channels prevent competing processes from overwriting one another. Time left has a reserved line, is rounded, and is announced at milestones rather than every update. D-04 concerns error emphasis, not removal of the save channel. Sources: `index.html:556`, `index.html:581`; `src/styles/app.css:724`; `src/ui/progress.ts:78`, `src/ui/progress.ts:139`. |

**The primary action still changes with the task.** Create disappears during processing; Cancel remains. With a retained result, Create becomes secondary and Save carries the emphasis. The discard question uses the danger treatment and receives focus as a question. Sources: `src/main.ts:2210`, `src/main.ts:2676`, `src/main.ts:2611`; `UI-STANDARDS.md:220`.

**Word count and distraction.** The following are approximate counts of application-owned visible English copy reconstructed from source, not new browser measurements. They include headings, labels, selected options and the closed footer; exclude entered values, browser-owned file/player text, development text, hidden announcements and closed disclosure contents. The reference case is a six-minute staff video, Cut/blue closing, Larger / better, no warnings, with a four-minute estimate and 303 MB estimate.

| State | Approximate words |
|---|---:|
| Empty / reading the first file | 137 / 140 |
| Checking / check stopped | 302 / 297 |
| Ready, staff card off / on | 325 / 344 |
| Staff card empty and refused | 337 |
| Student submission ready / four missing-field refusals | 410 / 416 |
| Ready, None closing / Internal use only enabled | 328 / 334 |
| Ready, onset help open / preview unavailable | 369 / 339 |
| Encoding, with time left / cancelled | 369 / 320 |
| Finished / saving / saved | 333 / 364 / 339 |
| Download handed off / save failed | 370 / 346 |
| Save stopped or picker cancelled / original-file overwrite refused | 344 / 352 |
| Statement opened | Adds about 490 |
| Feedback dialog, details closed | About 37 in the dialog |

Sources for these compositions: `src/i18n/en-GB.ts:54`, `src/i18n/en-GB.ts:117`, `src/i18n/en-GB.ts:235`, `src/i18n/en-GB.ts:354`, `src/i18n/en-GB.ts:403`, `src/i18n/en-GB.ts:475`, `src/i18n/en-GB.ts:744`, `src/i18n/en-GB.ts:775`; `src/main.ts:2210`, `src/main.ts:2971`; `src/ui/result-summary.ts:114`. Warning, loss, block and failure totals depend on the actual reasons and tracks; their source deliberately composes those reasons rather than imposing one fixed message length. Sources: `src/ui/preflight-panel.ts:169`; `src/ui/source-panel.ts:218`; `src/ui/warning-text.ts:78`.

The three switchers and their helpers contribute about **47 English words before Step 1**. Translated pages add the machine notice: approximately 25 Malay words or 39 Han characters plus its address. This is meaningful reading burden. The recorded ready-page growth from **2,765 to 3,722 px—about 35%—** reinforces the need to remove repetition, but neither height nor word count alone establishes that a useful control should disappear. The specification sets no numeric word budget. Sources: `src/i18n/en-GB.ts:61`, `src/i18n/en-GB.ts:97`; `src/i18n/ms-MY.ts:30`; `src/i18n/zh-Hans.ts:30`; `reviews/2026-10-20/states-2026-10-20.md:15`; `docs/01-specification.md:838`.

**The Chinese statement receives the intended measure.** Its long paragraphs and list items inherit `:lang(zh)` and therefore use `--measure-cjk: 40em`; the statement does not override that width. Body line height remains 1.5 and paragraph separation uses the shared token. This supports a 40-full-width-glyph measure; it does not prove every mixed Chinese/Latin line contains at most forty characters. Sources: `src/styles/app.css:44`, `src/styles/app.css:898`; `src/styles/tokens.carbon.css:52`, `src/styles/tokens.carbon.css:62`; `src/i18n/zh-Hans.ts:697`; `project/digests/wcag-2.2-aaa.md:37`.

**The generated cards have a deliberate type system.** Staff titles use a 104-to-56 range and supporting fields 64-to-56; submission headings use 80-to-56, with regular labels and bold values at 56. Sizes scale from the frame’s shorter side. Fitting wraps, then shrinks within the role’s range, then refuses rather than clipping or shrinking below the floor. Chinese opening and closing punctuation is kept with its neighbouring text. Sources: `src/config/cards.ts:50`; `src/media/title-card.ts:245`, `src/media/title-card.ts:411`, `src/media/title-card.ts:130`.

The closing’s 100 px lettering is authored in the 16:9 asset. Its resulting size, normalised to a 1080 px shorter output side, is:

| Output shape | Title-card minimum | Internal-use closing lettering |
|---|---:|---:|
| 16:9 | 56 px | 100 px |
| 9:16 | 56 px | 56.25 px |
| 3:4 | 56 px | 56.25 px |
| 4:3 | 56 px | 75 px |

Those rules apply across English, Chinese and Malay; the words come from the language tables. The submission field line height of 1.25 is explicitly justified in the card configuration, rather than accidentally inherited from the GUI. These calculations establish the sizing contract, not the optical quality of every rendered string. Sources: `src/config/cards.ts:107`, `src/config/cards.ts:206`; `src/media/title-card.ts:250`; `src/ui/title-card-step.ts:275`; `scripts/build-branding.mjs:19`.

## Set aside, with reasons

- **Owner-reserved decisions.** No direction is given here on moving the three switchers, folding, VH-97, the statement’s substantive wording or claims, accepting a date-only card, or signing off VH-124/VH-113. D-03 identifies formatting without selecting new statement content. The date-only result follows the current optional-field rule. Sources: `project/items/VH-143.md:9`; `project/items/VH-124.md:10`; `docs/01-specification.md:601`; `src/ui/title-card-step.ts:83`.

- **Translation meaning.** The Chinese and Malay verdict remains the native reviewers’. D-05 is confined to punctuation and identical-word consistency. The generated tables explicitly identify their translation source and provisional status. Sources: `src/i18n/zh-Hans.ts:1`; `src/i18n/ms-MY.ts:1`.

- **Numbers and units.** Numeric message parameters, durations, file sizes, percentages and dates generally use the shared `Intl` route. Resolution deliberately passes ungrouped integer strings; trim and card clock times use fixed syntax. Those are not evidence of a visible formatting defect in the three present languages, and changing the trim format independently of its parser would be inappropriate. Sources: `src/i18n/compile.ts:115`; `src/ui/format.ts:91`, `src/ui/format.ts:104`; `src/ui/progress.ts:133`; `src/ui/title-card-step.ts:73`; `src/ui/trim.ts:30`; `src/ui/trim.test.ts:21`.

- **Native elements and documented exceptions.** `details`/`summary` have an authored disclosure treatment; fieldsets have explicit structural resets, with the legend omission identified in D-01. Dialog, select, textarea and `pre` were considered there. The video player’s browser-owned controls are a recorded exception. No `<hr>` surface is instantiated in the reviewed page markup. Sources: `src/styles/app.css:825`, `src/styles/app.css:769`, `src/styles/app.css:1428`, `src/styles/app.css:974`, `src/styles/app.css:1451`, `src/styles/app.css:1475`; `index.html:1`; `docs/01-specification.md:709`.

- **A source review is not the fourteen-point gate’s rendered sign-off.** For each surface above, the component choice, custom rationale, heuristic risks, labels, links, state handling, motion policy and prevention mechanisms were considered—gate points 1–3, 7–9 and 11–12. Contrast, actual focus appearance, computed target geometry and assistive-technology operation still require rendered evidence—points 4–6 and 10. Documented exceptions were considered under point 13. Diagnostics remain development-only, use the shared button treatment and give copy feedback, satisfying the source portion of point 14. No fresh browser pass or green gate is claimed. Sources: `UI-STANDARDS.md:314`; `test/stylesheet.test.ts:1`; `src/styles/app.css:491`, `src/styles/app.css:1488`; `src/main.ts:3492`.