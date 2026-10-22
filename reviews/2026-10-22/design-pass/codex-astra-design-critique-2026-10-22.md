<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), adversarial critique of the VH-163 design pass draft before commit, 2026-10-22, at main 2c0496e with the draft uncommitted, kept as written. Its brief is critique-brief in the session notes; what was applied and refused is in design-pass-2026-10-22.md, "After Codex astra's critique". -->

**Revise before commit.** V-31–V-34 contain substantial, supported findings. V-35 identifies a real language mismatch, but its recommended remedy contradicts the owner’s rule. V-36–V-39 need more consistent ranking and clearer boundaries. The strongest corrections concern the Carbon references, the certainty attached to `28rem`, and claims of accessibility verification.

This critique examines `main@2c0496e`, the uncommitted draft, repository sources and retained captures. It does not claim a fresh browser or assistive-technology walk. No files were changed.

For references below, **draft** means `reviews/2026-10-22/design-pass/design-pass-2026-10-22.md`; **inventory** and **checks** mean `inventory-before-2026-10-22.md` and `wcag-checks-2026-10-22.md` under that bundle’s `evidence/measurements/`; **walker/** means its accompanying scripts.

**V-31 holds at rank 1; the shipped correction is appropriately small.**

The current link and form have separate IDs (`index.html:785`, `:812`), and the submit listener now reaches the form (`src/main.ts:3405`, `:3523`). The static-markup uniqueness test exists (`test/screen-text.test.ts:839`). Commit `04956b3` supports the disposition.

Qualify the outcome evidence. The recorded live verification exercised empty-message refusal and the external link; it explicitly did **not** open the email application (`project/decisions.md:25`). “The submit wiring is repaired” is established; a completed email-opening workflow was not observed.

Likewise, the pre-fix reload could lose the selected file and volatile work, but “every choice” is unnecessarily absolute. Running jobs, saves and unsaved results have leave-warning conditions (`src/main.ts:2326`), and remembered preferences have their own persistence. None of that reduces rank 1: losing an unprotected feedback draft or selected video is sufficient.

**V-32 holds at rank 2, but the role table needs correction before it can direct implementation.**

The underlying mismatch is real. Panel headings omit line height (`src/styles/app.css:259`); footer `h2`s inherit the disclosure’s font (`:886`, `:900`); statement `h3`s use 16/20/700 (`:916`); switcher legends use 16/24/700 (`:1167`). The strongest authority is VH-163’s explicit requirement for complete roles and consistent same-level headings (`project/items/VH-163.md:13`).

That distinguishes this finding from the earlier V-26. The previous critique correctly rejected a universal rule that semantic heading level must determine visual size (`reviews/2026-10-20/codex-astra-design-critique-2026-10-21.md:89`). Here the owner has supplied a more specific design criterion. State that distinction; do not present V-26’s preference as a newly discovered general accessibility rule.

Three corrections are necessary:

- **Separate measured styles from source-derived styles.** The inventory’s 16 rows comprise nine non-CJK tuples and seven CJK-stack variants; they do not include monospace (`inventory:25`–`:40`). Ten authored combinations is the blind source review’s count, including code. “The inventory finds … 10 authored ones and their Chinese twins” conflates those inventories.
- **Do not force the result to eight by omitting uses.** Text inputs and textareas currently inherit 16/24, whereas the proposed Supporting row says “control text” at 14/21 (`app.css:1434`, `:1519`). Specify that editable text stays at 16 px if that is intended. Inline links should inherit their surrounding role, not all become 16 px.
- **Account for semantic emphasis.** `<strong>` appears in the no-audio status and onset help (`src/main.ts:870`; `index.html:454`, `:458`). The proposed 14/21/700 role lists only status marks. Decide whether these existing bold passages retain that composition or take the compact-emphasis weight; preserve their semantic emphasis. Otherwise “one per role” remains incomplete.

The named Carbon tokens are real, but their definitions are not the proposed local compositions:

| Reference | Carbon size / line height / weight | Classification |
|---|---:|---|
| `heading-04` | 28/36/400 | Productive |
| `heading-03` | 20/28/400 | Productive |
| `heading-compact-02` | 16/22/600 | Expressive |
| `body-02` | 16/24/400 | Expressive |
| `body-compact-01` | 14/18/400 | Productive |
| `helper-text-01` | 12/16/400 | Productive |
| `heading-compact-01` | 14/18/600 | Productive |
| `code-01` | 12/16/400 | Productive |

These definitions come from [Carbon’s type sets](https://www.carbondesignsystem.com/building-blocks/foundations/typography/type-sets). Thus the draft’s claim that every row adapts a **productive** reference is false. Describe 16/24 body and section text as enlarged productive adaptations if retaining that policy; distinguish their resemblance to expressive tokens.

**20/25 is arithmetically correct for the existing 1.25 token, but it is not Carbon’s `heading-03`.** Prefer 20/28 for the panel-heading proposal, retaining the brand’s loaded 700 face. Alternatively, justify 20/25 explicitly as a local adaptation and verify multiline headings. Merely reusing an existing token is insufficient design justification. The same distinction applies to 28/35 versus Carbon’s 28/36. Shorter heading leading is not automatically a WCAG failure.

The Arial claim is substantially sound **when actual conventional Arial is used**. Microsoft lists regular and bold upright faces, and CSS matching selects the available heavier face for a missing requested weight above 500; consequently 600 and 700 can both use Arial Bold. [Arial family](https://learn.microsoft.com/en-us/typography/font-list/arial), [CSS font matching](https://www.w3.org/TR/css-fonts-4/#font-style-matching).

But a computed stack beginning with Arial does not prove which face rendered each glyph. The fallback stacks expressly permit other Latin and CJK fonts (`tokens.brand.css:81`, `:93`, `:139`). Qualify the statement rather than asserting identical rendering across devices. Also say the **typographic tuple** differs only in leading: the disclosure’s chevron, padding and surrounding layout still distinguish it visually.

Grouping existing selectors is proportionate. Keep tracking explicitly defined as the local choice, preserve selected-segment width reservation (`app.css:1233`), and make the footer decision explicit rather than promising eight styles while leaving its composition unresolved.

**V-33 holds at rank 2; `28rem` is a plausible candidate, not a demonstrated optimum or conformance guarantee.**

The source explains the measured widths: `55ch` and `40em` resolve at the consuming element’s font size (`tokens.carbon.css:72`; `app.css:36`, `:45`). The recorded 489.4/428.2 and 640/560 differences are valid (`inventory:174`–`:180`).

Call this a **prose-measure change**, not a content-column change. The main content column remains 912 px in all three languages (`inventory:183`).

The draft’s scaling arithmetic, using its existing sample maxima, is approximately:

| Language | At 16 px and 448 px | At 14 px and 448 px |
|---|---:|---:|
| English | `70 × 448 / 489.4 ≈ 64.1` characters | `73 × 448 / 428.2 ≈ 76.4` |
| Malay | `69 × 448 / 489.4 ≈ 63.2` characters | `67 × 448 / 428.2 ≈ 70.1` |
| Chinese, full-em glyphs | `448 / 16 = 28` | `448 / 14 = 32` |

The inputs are recorded at `checks:209`–`:214`. These are **estimates**, not new rendered-line measurements. Word wrapping is discrete, and a sample’s longest line does not establish a font’s maximum character density.

Therefore:

- Delete “the widest single width”. Even the same approximation gives about 79.1 English characters at `29rem`.
- Describe 469 px as the extrapolated threshold from this particular 73-character sample: `80 × 428.2 / 73 ≈ 469.3`. It is not a universal boundary beyond which 1.4.8 fails.
- Correct “helper text gains 20 px”: English and Malay gain approximately 20 px; Chinese helper text **loses 112 px**.
- Restore the blind review’s qualification: `28rem` is a starting value for browser verification (`codex-astra-design-review-2026-10-22.md:151`).

The Chinese “46 counts as 40” explanation also needs restraint. The walker assigns every non-CJK character half a unit (`walker/wcag-checks.mjs:84`). That is a width proxy, not a normative WCAG counting rule. The report itself flags one over-limit line (`checks:212`, `:220`). Retain the raw result and explain the mixed-script interpretation instead of silently converting it into a pass. WCAG specifies a mechanism for the stated presentation, including the width limit; it does not prescribe this half-character algorithm. [WCAG 1.4.8 explanation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html).

The uncovered `.fact-note` is a valid source concern: it is a smaller span inside the measured `dd` (`src/ui/source-panel.ts:238`; `app.css:666`). However, the 46-glyph case is not established by the retained walk. Open the relevant Video properties disclosure with the long frame-rate explanation before describing an observed failure. The current line counter also attributes descendant text to its enclosing block’s font size (`walker/wcag-checks.mjs:78`–`:84`).

Retiring the separate CJK **measure** is sound if the shared width passes verification. Remove only the measure override at `app.css:45`; retain the Chinese font stacks and language-specific font application (`tokens.brand.css:139`; `app.css:71`). A common cap does not imply identical rendered widths inside differently sized containers.

Using the existing paragraph-gap token in the toggletip is a small, justified correction (`app.css:1073`; `UI-STANDARDS.md:202`). Keep the complete 1.4.8 mechanism requirement distinct from this local default-spacing rule.

**V-34 holds at rank 2 and should be implemented early. Its explanation of the missed detection is wrong.**

The retained finished-result and ID-error captures visibly show text escaping its box. The source preserves the filename and invalid token without emergency wrapping (`src/ui/result-summary.ts:168`; `src/ui/title-card-step.ts:200`, `:291`; `app.css:465`, `:1537`). This is a demonstrated reflow defect, independent of the earlier native-picker truncation exception.

`overflow-wrap: anywhere` is the appropriate minimal direction. It preserves the string, introduces emergency breaks and participates in minimum-content sizing; it does not insert hyphens or split grapheme clusters. [CSS overflow wrapping](https://www.w3.org/TR/css-text-3/#overflow-wrap-property).

Specify its placement: the shared authored-prose rule around `app.css:36`, extended to uncovered prose spans where needed. That covers notification paragraphs, status text and field errors without a universal rule affecting every control. Check existing wrapping overrides when consolidating. “The token stays whole” should mean **all characters remain**, not that it remains visually unbroken.

The central methodological correction is this: **the checker already measures document scroll width** (`walker/wcag-checks.mjs:54`; `walker/walk.mjs:104`). It would detect the reported 1,425 px document in a 320 px viewport. The missing ingredient was the long-input scenario, not simply the absence of text-range inspection.

Add the long-name and invalid-ID fixtures to the walk, retain the document-width assertion, and use range checks to catch local spill that does not enlarge the document. Do not promise that a range checker alone prevents recurrence.

The two captures support finished-result and ID-error cases. Previous-result, discard and text-spacing dimensions need retained measurements or explicitly remain verification requirements. “Checked” in the Direction is ambiguous about work already done. Also, the walker is not part of `npm run check` (`package.json:29`); replace “the gate’s walk” with the actual manual/browser verification route.

**V-35’s observation holds; rank 2 is defensible as translation friction, but neither option is presently a complete fix plan.**

The Chinese and Malay captures establish English browser-generated chooser text. They do not establish that everyone changing page language has a differently configured browser. Remove that assertion at `draft:294`.

Do not imply a demonstrated WCAG 3.1.2 failure merely because the native control displays another language. The author-provided accessible label already comes from the translated heading (`index.html:128`). The criterion concerns programmatically determinable language; the screenshot alone does not establish how browser-generated text is exposed. [WCAG Language of Parts](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html). Nielsen 2 and the translation objective are stronger grounds.

The first option explicitly adds a `label`. **One visible button is not equivalent to no new element.** It also changes markup, strings and status rendering, beyond the CSS-only fix boundary (`project/items/VH-163.md:5`, `:25`). Under the standing rule, it cannot be the default implementation recommendation.

If the owner explicitly authorises that exception, the proposal must address:

- The existing `aria-labelledby="choose-heading"` overrides an associated label as the accessible name. A new visible “Choose file” label needs matching accessible naming.
- The visible proxy needs the input’s focus, disabled and primary/secondary states, including forced colours.
- Moving the filename only into the successful read line loses its visible location during reading or failed inspection. Selection currently changes that status immediately (`src/main.ts:1399`).
- The read line is live (`index.html:139`), so adding the filename changes announcements. Its current content is simply “Video read.”, not an existing filename template (`src/i18n/en-GB.ts:155`; `src/ui/source-panel.ts:193`).

The native option obeys the no-new-element rule, but documenting a limitation does not fix the friction. Nor should it automatically become a WCAG exception in the public statement. Record the accurately scoped browser-language limitation in the design decision; route any necessary statement wording through VH-137.

Recommend retaining the native control under the current rule. Keep a replacement conditional on an explicit owner exception and a complete interaction specification.

**V-36 is appropriately an owner proposal at rank 3, with a clearer exception boundary.**

The geometry is supported (`inventory:190`–`:196`), and the 20 px inset is an explicit brand rule (`UI-STANDARDS.md:82`; `tokens.brand.css:100`). Carbon’s grid does not independently prove that every outer edge must coincide.

Keeping the desktop logo at the window edge is a reasonable recommendation. Mobile alignment at 24 px is also plausible, but it still changes the existing rule. Absence of a recorded mobile measurement does not supply approval.

Define the breakpoint in relation to the content column’s actual width cap (`app.css:228`; `tokens.carbon.css:76`); the existing 34rem breakpoint controls other relationships. Record the desktop exception to VH-163’s shared-gutter criterion and the owner’s mobile choice. Do not reopen VH-154’s switcher location.

**V-37 mixes a credible consistency issue with relationships that are not equivalent.**

Footer panel separation is 16 px against the main panels’ 24 px (`app.css:176`, `:252`). If judged a breach of VH-163’s common panel rhythm, it is **rank 2**, regardless of implementation cost. If the footer’s compact grouping is intentionally retained, explain that component-specific exception.

The None example is mischaracterised. `#closing-none-reason` explains **three controls**, not just the immediately preceding checkbox (`index.html:427`, `:465`, `:496`, `:504`; `src/ui/closing-choice.ts:114`). The 16 px separation includes the preceding `.field` margin (`app.css:526`). Reducing the helper’s own margin will not necessarily produce an 8 px gap.

Either retain the spacing as a shared-group explanation or demonstrate why it harms grouping. Do not undo V-20’s consolidation by treating the line as an ordinary checkbox helper.

The finding also leaves its 28 px disclosure-heading-to-body gap without a disposition. That gap includes summary hit-area padding (`app.css:886`, `:894`), unlike a plain heading margin. Explicitly retain it for that reason or propose a correction that preserves the target area.

Taking justified typography-adjacent spacing work with VH-166 is reasonable. “It is cheap and touches the same file” is not sufficient scope justification.

**V-38 holds, but belongs at rank 2.**

The invalid mixed-engine selector list is present (`app.css:1653`), and the recorded CSSOM observation supports Chrome dropping it (`checks:219`). Splitting it into two rules follows the existing pattern at `app.css:1414` and adds no element.

The supplied rubric makes a breach of a named standard rank 2. Here the project expressly requires system colours for these opted-out controls (`UI-STANDARDS.md:224`), while `.range-slider` disables automatic colour adjustment (`app.css:1566`). Passing in one emulated palette does not turn this into polish.

Keep the distinction: the lost rule is established; a failing real-palette contrast example is not. Verify contrasting light and dark palettes, and retain the existing limitation around the thumb’s inset focus-area assessment. Route this as an explicit accessibility repair, not an optional typography accompaniment.

**V-39 holds as a Carbon state mismatch; rank 3 and a wish-only route do not follow the rubric.**

The button rules provide hover, focus and disabled treatments but no authored active treatment (`app.css:354`–`:414`, `:552`–`:606`). Carbon explicitly defines active-state tokens for its button variants. [Carbon button specifications](https://www.carbondesignsystem.com/building-blocks/core/components/button/specifications).

That supports rank 2 under the adopted Carbon standard and VH-163’s controls-and-states criterion (`project/items/VH-163.md:18`). It does not establish a separate WCAG failure or prove that users perceive no immediate response. Nielsen 1 is supporting context.

Adding a state to an existing button adds no control or element. “More than a consolidation” therefore does not justify deferral by itself. Either plan the state correction or record an explicit accepted deviation.

Do not prescribe a new token before checking whether existing roles can supply a distinct, accessible state. Any new colour roles must cover light, dark **and blue-band** contexts, plus forced colours (`tokens.brand.css:154`, `:181`). Apply the right mapping to the local outlined secondary treatment; Carbon calls the corresponding outlined anatomy tertiary. Retain disabled precedence. Store the reported mouse-down measurements, which currently have no named evidence artifact.

**“What held up” needs narrower claims.**

Several statements exceed or contradict the evidence:

- **“No view scrolls sideways” contradicts V-34** (`draft:430`). Restrict this to the ordinary fixtures in the baseline inventory.
- **“Every value a token” needs its structural exemptions.** The stylesheet test explicitly exempts several techniques and geometrical values (`test/stylesheet.test.ts:82`). The 20 px brand inset and automatic centring are also separately classified (`inventory:552`).
- **The four cited left edges are examples, not an exhaustive inventory.** The actual table records more within several panels (`inventory:213`, `:217`, `:221`). Their component anatomy is a valid reason to retain them.
- **One filled action does not lead every state.** Running uses secondary Cancel, as the last pass already stated (`reviews/2026-10-20/design-pass-2026-10-21.md:568`; `src/main.ts:2347`).
- **The numerical totals are scoped measurements.** Contrast covers selected staff states in light/dark; targets cover 1280/375; spacing has 18 measurements; the 27 figure belongs to baseline overflow (`checks:5`, `:9`, `:16`, `:23`, `:58`). Do not combine them into a blanket AAA result.
- **640 px at DPR 2 is a zoom-layout proxy.** It does not exercise browser zoom or prove 200% text enlargement (`walker/walk.mjs:250`). The previous audit preserved exactly this limitation.
- **111 keyboard stops do not prove complete focus conformance.** They cover English empty/ready states at desktop. Forced-colour contrast is not judged; thumb visibility/obscuration fields are assumed in the fallback; the report checks outline thickness rather than computing changed-pixel area (`walker/wcag-checks.mjs:94`–`:101`, `:224`, `:336`).

The Nielsen table is useful as a source-supported assessment. “End to end, checked against the walk” overstates scenario coverage. The new design script stops at Finished and omits several relevant surfaces: saved/downloaded, previous result, discard, feedback, captured errors, open onset help and open source properties (`walker/design-walk.mjs:134`–`:187`). These omissions matter directly to the proposed type and measure changes.

**“Set aside” contains a material misstatement about screen-reader evidence.**

The 20 October audit did **not** establish a screen-reader walk. It explicitly distinguishes programmatic announcements from heard output and records real screen readers as unverified (`reviews/2026-10-20/wcag-2026-10-20.md:19`, `:130`, `:147`). Correct `draft:462`–`:463` and link the existing human-verification follow-ups.

“Nothing this pass proposes changes what is announced” is also false if V-35 adds a filename to a live status line or changes the chooser’s labelling.

Setting aside exhaustive device-font and native-video-control testing is reasonable, but it must remain an evidence limitation. V-32’s face claims and V-33’s measure calculations still need representative fallback-font verification. Likewise, reserving statement wording for VH-137 is sound; it is not a reason to omit its typography from the fix checks.

**The four proposed items have a sensible dependency order, but do not yet constitute an adequate plan.**

| Item | Assessment |
|---|---|
| **VH-165 — wrapping** | Well cut and rightly first: demonstrated reflow failure, small CSS correction, adversarial fixtures required. |
| **VH-166 — type roles** | Correct before measure verification. Complete the selector mapping and Carbon adaptations. Include only explicitly accepted spacing/grid work; do not hide unrelated accessibility repairs inside it. |
| **VH-167 — measure** | Correct after typography settles. Carry `28rem` as a candidate, actual line measurements, uncovered spans, toggletip spacing and the updated standards/test contract. |
| **VH-168 — file chooser** | Conditional. The recommended implementation violates the current boundary. Resolve native retention versus an expressly authorised replacement before calling it an executable fix item. |

V-38 needs an explicit mandatory accessibility disposition, and V-39 needs a planned correction or recorded deviation. Accepted V-37 consistency work must also use the supplied rank definition. Do not preserve the headline “four rank 2 findings” by classifying standard breaches as polish.

The ledger currently contains neither VH-165–VH-168 item files nor their backlog entries; PLAN-6’s Items line names only VH-163 (`project/decisions.md:39`; `project/backlog.md:34`). Say **proposed**, not **planned**, until the required planning records exist. Unaccepted proposals and deferrals need their own ledger lines.

Before committing, change these in priority order:

1. Correct the screen-reader, zoom, focus and universal-pass claims; distinguish observed, source-supported and untested cases.
2. Resolve V-35 against the no-new-element rule and remove the unsupported WCAG attribution.
3. Correct V-32’s Carbon mappings, heading leading, inventory count and incomplete role coverage.
4. Recast `28rem` as a verified-later candidate; correct the three-language arithmetic and mixed-script counting claim.
5. Correct V-34’s missed-scenario explanation and specify shared-prose placement plus retained regression evidence.
6. Re-rank and route V-37–V-39 consistently; explicitly dispose of the shared None reason and disclosure spacing.
7. Complete the owner-approved item records and deferral lines, then update the verdict counts, restore numerical finding order, replace `PENDING-CRITIQUE`, and run the required closing checks.