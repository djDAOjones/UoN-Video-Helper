<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), critique of the merged report for the second design pass (VH-174, PLAN-7 touchpoint 4), 2026-10-23, at main 933404c with the draft design-pass-2-2026-10-23.md uncommitted, kept as written. Its brief is codex-astra-report-brief-2026-10-23.md; what was applied, refused or sent to the owner is in design-pass-2-2026-10-23.md, "After Codex astra's critique". -->

Commit after the musts below

References below use `B/` for `reviews/2026-10-22/design-pass-2/`, `M/` for its `evidence/measurements/`, and **draft** for `B/design-pass-2-2026-10-23.md`. Scratchpad references identify the session directory recorded at `B/codex-astra-report-brief-2026-10-23.md:15`. I inspected source and retained evidence; I did not rerun the browser checks or change files.

## R-01 The weighted count is not WCAG’s prescribed counting method — must

**Saw.** The draft calls its weighted calculation “the standard’s own”, says the Understanding rules out the strict reading, and therefore passes all 86 records (`draft:481–496`). The supplied Understanding first states the character/glyph limits, then explains the approximate difference in character widths; it supplies no mixed-script arithmetic (`scratchpad/vh174/wcag/visual-presentation.html:39–47`). The project digest likewise records a character/glyph limit, not a weighted sum (`project/digests/wcag-2.2-aaa.md:38–44`).

The normative criterion requires a mechanism for achieving the specified presentation. It does not prescribe the draft’s weighted formula. The Understanding’s rationale cannot establish that formula as a requirement or conclusively exclude another interpretation. Conversely, neither document says that a single CJK character automatically subjects any otherwise Latin line to 40 characters. [WCAG 1.4.8](https://www.w3.org/TR/WCAG22/#visual-presentation), [Understanding 1.4.8](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html).

**Why it matters.** The draft acknowledges that extending the ratio to mixed lines is judgement, while already treating that extension as settled evidence of conformance. Those positions are incompatible. The instrument deliberately leaves these records unresolved (`M/digest-measure-2026-10-23.md:10–24`).

**Smallest report change.** Remove the claim that WCAG supplies or mandates weighted counting. Preserve the raw and weighted results, and mark this part of 1.4.8 unresolved unless the report establishes an alternative mechanism. Existing narrow-window evidence may support that route: WCAG explicitly offers reflow when the viewing window is narrowed as a sufficient technique. Excessive default line counts alone do not prove that the complete criterion fails. [Technique G204](https://www.w3.org/WAI/WCAG22/Techniques/general/G204).

Until that argument is established, carry **1.4.8 as an evidence gap**, rather than declaring 86 confirmed defects or 86 confirmed passes. If this is the only changed criterion, the summary becomes 39 met and 19 gaps, including five missing-evidence gaps (`B/wcag-2026-10-23.md:134–139`). The owner may choose a conservative presentation policy or accept a design limitation; that decision cannot make an unsupported standards claim true.

## R-02 The disagreement ledger misclassifies VH-169 and V-43 — must

**Saw.** VH-169 is “settled by evidence” because all 54 controls supposedly retain their ring in every palette (`draft:434`). The evidence actually contains **54 enabled observations across 28 records**, and its keyboard-ring predicate checks `:focus-visible` and an outline style. The pixel comparison measures the whole control changing under Space; it does not isolate the ring’s visibility against the pressed background (`M/six-fix-verification-2026-10-23.md:28–32`; `M/walker/qualify.mjs:802`, `:827–836`).

Moreover, the live check **confirms** D-03’s retained brand colour; it does not refute it (`scratchpad/vh174/live-results-2026-10-23.json:4–5`). Whether that defect belongs outside the six-fix verdict is a scope judgement. The contract explicitly includes keyboard focus and the interaction between pressed fill and focus ring (`B/plan-2026-10-22.md:180–184`).

Separately, the draft attributes “not a defect” to my blind review on V-43 (`draft:553–557`). My actual verdict was **accessible-name verification outstanding**, with the browser wording recorded as a limitation (`B/codex-astra-blind-review-2026-10-22.md:206`). That was an evidence limit, not a judgement rejecting a subsequently demonstrated mismatch.

**Why it matters.** These errors reverse the disagreement rule: a scope disagreement becomes a settled fact, while a previously unanswered factual question becomes an invented disagreement of judgement (`B/plan-2026-10-22.md:207–215`).

**Smallest report change.**

- For VH-169, retain the verified pressed-fill results but mark the keyboard-focus clause unverified or the overall contract partial until the held-key captures establish visible focus. Record Claude’s narrower “holds, with V-40 separate” position as a scope judgement if retained.
- Replace “54 controls in every palette” with “54 enabled observations across the sampled palettes”.
- Remove the purported V-43 disagreement. I now accept the reported mismatch as grounds for the rank-2 finding under the house label/name rule. The new AX evidence supplies what the blind review lacked (`B/judged-2026-10-23.md:519–529`; `UI-STANDARDS.md:115–116`).
- Keep V-43’s remedy conditional on testing and the owner’s decision. Self-reference in `aria-labelledby` is a proposed experiment, not an established solution; the draft correctly says “If Chrome computes it” (`draft:298–303`).

## R-03 The focus directions need to preserve successors and contrast — must

**Saw.** Three proposed directions are incomplete:

- **V-46:** the helper’s proposed universal order—Stop saving, Create, chooser—omits existing task-specific successors (`draft:178–181`). Current callers deliberately choose Continue anyway, Check again, the result, or a focusable failure explanation (`src/main.ts:1614`, `:1625`, `:2960`, `:2998–3002`, `:3050`).
- **V-40:** drawing the current ring inward is offered as an alternative to padding (`draft:223–228`). In light mode, the file button’s normal fill and focus ring are the **same token colour**. Moving that ring onto the fill would remove its contrast (`src/styles/app.css:558`, `:609–611`; `src/styles/tokens.brand.css:123–125`).
- **V-42:** moving the white ring onto Highlight changes its background, so placement alone cannot guarantee contrast (`draft:272–275`). The ring remains white while the selected face takes Highlight; the recorded dark emulation supplies a bright cyan Highlight (`src/styles/app.css:1771–1774`, `:1811–1812`; `src/styles/tokens.brand.css:202`; `scratchpad/vh174/live-results-2026-10-23.json:5`).

**Why it matters.** These directions could repair the reported symptom while introducing a different focus failure. The adopted rule requires rendered area and contrast, not merely a declared outline or an enabled destination (`UI-STANDARDS.md:241–247`).

**Smallest report change.** For V-46, preserve each caller’s preferred successor and add a visible, enabled fallback after locks are applied; Stop saving is the concurrent-save fallback, not a replacement for every caller’s destination. Keep the existing dialog and reader protections.

For V-40, recommend the demonstrated padding approach, or explicitly require an inward ring’s colour and area to be redesigned for its background. For V-42, require a contrasting system-colour treatment on the selected face, with both palettes measured; inset placement alone is insufficient.

Also replace “put back at the top of the page” with “DOM focus falls to the body”. The retained checks establish `activeElement`, not scroll position, the next Tab destination, or a screen reader’s reading position (`draft:167`; `scratchpad/vh174/live.mjs:9`, `:34–40`, `:121–129`).

## R-04 V-47 cannot promise the selected output rate through strings alone — must

**Saw.** V-47 correctly identifies both the reversed explanation and the preset mismatch, but its Direction requires an accurate selected-output rate while restricting the repair to strings and parity testing (`draft:310–335`). The renderer receives only the source report and interpolates `video.conform.frameRate`; it receives neither the selected preset nor the final output shape (`src/ui/source-panel.ts:114–127`, `:206–209`). Changing the preset reruns preflight without repainting that source report (`src/main.ts:1646–1667`).

The rank explanation also says no choice turns on the note and nothing is lost (`draft:329–330`). The supplied rubric includes misleading a novice or losing trust, independently of losing work (`B/codex-astra-report-brief-2026-10-23.md:26`). The false promise concerns precisely the output whose quality the person is choosing (`src/config/presets.ts:42–63`).

**Why it matters.** A parity test can prove that all languages repeat the same mistake. It cannot establish that a displayed rate follows the chosen output.

**Smallest report change.** Permit the small renderer change needed for either an accurate neutral sentence without a promised rate, or a sentence derived from the effective output rate and refreshed when the preset changes. If the numerical claim remains, require behavioural checks covering upward and downward conversion and both presets, alongside translation parity.

I recommend **rank 1 under the supplied rubric**, revising my blind rank-2 judgement. Preserve Claude’s rank-2 position for the owner; remove “no choice turns on it” as an asserted fact. V-47 still belongs in VH-175 and needs no additional control (`B/codex-astra-blind-review-2026-10-22.md:100`, `:124–126`; `draft:580`).

## R-05 Coverage is mostly accurate, but the summary still overclaims — must

**Saw.** The principal totals and the 821-cell and 245-reading gaps are accurately carried forward (`draft:86–106`; `M/matrix-2026-10-23.md:46–67`). Several qualifications are missing or contradicted elsewhere:

- “Where the run measured, AAA held” contradicts the measured focus failures (`draft:53`; `M/digest-focus-2026-10-23.md:10–29`). A disclaimer about conformance does not repair that sentence.
- The opening attaches three languages, seven views and eight modes to the keyboard result, although keyboard routes ran in light mode only, and J2–J4 only in English at 1280 (`draft:20–23`; `M/digest-keys-2026-10-23.md:15–24`; `M/matrix-2026-10-23.md:28`).
- “Each state has one filled action” is false during processing; the judgement explicitly records none there (`draft:19–20`, `:500–501`; `B/judged-2026-10-23.md:97–100`).
- The manifest retains limits for transient-state capture, keyboard operation of the enlarged dialog, synthetic text-only enlargement, and the skip link’s contrast and target when shown. These are not all stated in How it was done (`M/matrix-manifest-2026-10-23.json:1`, `unresolved.manual`; `draft:98–115`).
- The person checklist does **not** carry a native-reader translation task. Task E expressly says readers need not judge translations (`draft:110–115`; `B/person-checklist-2026-10-23.md:57–70`).
- “Every one” of the mixed lines being at most 448 px ignores the enlarged-font records: the notice reaches 758 px against an 896 px measure (`draft:491`; `M/digest-measure-2026-10-23.md:24`).

**Why it matters.** These are precisely the boundaries a reader needs to distinguish measured success, an accepted exception, and missing evidence.

**Smallest report change.** Replace the blanket AAA sentence with the named passing measurements and explicit focus exceptions. Separate keyboard coverage from the per-record instruments. Say “at most one filled action”, with running’s secondary Cancel. Add a compact list of the omitted manifest limits and identify the native-reader work separately, rather than claiming A–G covers it.

For target size, distinguish the 19,166 measured passes from the 953 indeterminate rows, including the thumb exceptions and enlarged textarea; the linked WCAG table discusses the equivalent-control exception, but the raw instrument did not pass those rows (`M/digest-targets-2026-10-23.md:10–30`; `B/wcag-2026-10-23.md:99`). Keep VH-172.1 and VH-173.1: their existing wish lines correctly own the outstanding matrix/readings and undrawn-role checks (`project/wish-list.md:58–59`).

## R-06 V-18’s proposed move does not address the whole finding — must

**Saw.** V-18 covers Chinese and Malay desktop placement **and all three languages at 320 px**, but its only concrete remedy moves the translation notice into the lede (`draft:344–358`). English has no such notice. In the translated pages, both its current and proposed positions remain above the chooser; no proposed-layout measurement establishes the height saved (`B/judged-2026-10-23.md:375–395`; `src/ui/language-switcher.ts:140`; `index.html:43–92`).

**Why it matters.** The proposed change cannot resolve the English narrow-screen case, and its benefit elsewhere remains unmeasured. Routing it as V-18’s remedy risks closing the same incomplete fix again.

**Smallest report change.** Retain V-18 at rank 2 as the existing friction finding, but label notice relocation a **partial proposal with unmeasured benefit**. State that V-18 remains open unless the agreed outcome covers its remaining narrow-screen cases, or the owner explicitly accepts those cases. Do not prescribe restructuring or move either switcher without the owner’s decision (`draft:581`; `B/codex-astra-report-brief-2026-10-23.md:28`).

## R-07 Rank-3 proposals must not simultaneously be named-standard defects — must

**Saw.** V-44 cites Carbon interaction states and V-45 cites the explicit prohibition on synonymous terminology, yet both are classified as polish and routed to wishes (`draft:393–414`, `:583–584`). The supplied rubric makes a breach of a named standard rank 2 (`B/codex-astra-report-brief-2026-10-23.md:26`). The same distinction was required in the previous critique (`reviews/2026-10-22/design-pass/codex-astra-design-critique-2026-10-22.md:145–151`).

**Why it matters.** Neither implementation size nor the absence of a WCAG failure makes a standard breach optional polish.

**Smallest report change.** Make the classification explicit:

- **V-44:** the evidence proves identical rest and hover paint under forced colours. It does not, by itself, prove that the cited Carbon checklist requires a distinct authored hover in those palettes. Keep rank 3 if this is an optional enhancement to an intentionally adapted state treatment; otherwise establish the requirement and use rank 2 (`M/matrix-2026-10-23.md:103`; `src/styles/app.css:1679–1687`; `project/digests/carbon.md:40–45`).
- **V-45:** if retained as a violation of the house consistency rule, use rank 2 and route it through VH-175, with the specification change reserved to the owner. Alternatively, explain why “branding” and “graphics” are acceptable distinctions and present renaming solely as an optional proposal (`UI-STANDARDS.md:150–154`; `docs/01-specification.md:626`).

Keep both positions where judgement remains contested. Do not silently preserve the headline counts by choosing the lower rank (`draft:47–51`; `project/items/VH-174.md:12`).

## What held up

The D-to-V mapping preserves all four substantive findings. The retained checks support the following conclusions:

| Finding | Verification and merge |
|---|---|
| **D-01 → V-46** | The completion case is exercised by `scratchpad/vh173/spot.mjs:36–42` and recorded at `B/judged-2026-10-23.md:115–120`. `d01b` captures focus inside setup before its withdrawal; `d01c2` confirms checking and saving overlap, then body focus with Create disabled and Stop saving available (`scratchpad/vh174/live.mjs:21–40`, `:101–129`; `live-results-2026-10-23.json:2–3`). The source explains all three mechanisms (`src/main.ts:1535–1614`, `:2359`, `:2947`). Keeping a separate finding is right. |
| **D-02 → V-33** | The textarea is omitted from the measure selector, and the stylesheet test repeats that omission (`src/styles/app.css:1435–1439`, `:1498–1501`; `test/stylesheet.test.ts:343–345`). The six rendered records support the width breach (`B/judged-2026-10-23.md:404–414`). Rank 2, the house standard and the existing-ID merge are right. Restore the blind review’s enlarged-text and fallback verification alongside the selector test (`B/codex-astra-blind-review-2026-10-22.md:60`; `draft:378`). |
| **D-03 → V-40** | The pseudo-element’s explicit brand outline survives the generic forced-colour rule; the live readings confirm it (`src/styles/app.css:609–611`, `:1668–1677`, `:1816–1817`; `scratchpad/vh174/live.mjs:61–78`; `live-results-2026-10-23.json:4–5`). Merging colour and clipping is reasonable, provided both remain separately verifiable. The draft correctly distinguishes the house-rule breach from an unshown failing real palette (`draft:206–221`). |
| **D-04 → V-47** | Both source-rate examples and unchanged Smaller-preset sentences are recorded (`scratchpad/vh174/live.mjs:83–95`; `live-results-2026-10-23.json:6–7`). The output-rate calculation independently establishes the cap (`src/config/presets.ts:220–223`). These checks verify the DOM sentences and source logic; they are not an encoded-output measurement. Keeping a separate finding is right. |

V-40, V-41 and V-42 have supported rank-2 focus findings and appropriate principal standards. V-41’s fixed-size thumb/rem-sized disc mechanism is particularly clear, and its direction addresses that mechanism without another element (`M/digest-focus-2026-10-23.md:26–31`; `src/styles/app.css:1351–1360`, `:1395–1398`; `draft:248–254`).

The remaining six-fix verdicts are substantially supported:

| Fix | Assessment |
|---|---|
| **VH-164** | **Holds within the stated contract.** The evidence covers refusal, prepared mailto, copy outcomes, form link and retained values; it does not claim an email application opened (`M/six-fix-verification-2026-10-23.md:11–15`). |
| **VH-165** | **Holds on the stated visible-disc interpretation.** The long-text checks and both forced palettes are retained. Using the visible subcomponent is defensible under WCAG; V-41 remains a separate enlargement defect (`M/six-fix-verification-2026-10-23.md:16–17`; `src/styles/app.css:1351–1360`; [Focus Appearance, note 1](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)). |
| **VH-166** | **Partial.** The missing code role is accurately retained as unverified (`M/six-fix-verification-2026-10-23.md:18–22`). |
| **VH-167** | **Partial.** V-33 and the undrawn fact note justify that verdict; mixed-script compliance remains subject to R-01 (`M/six-fix-verification-2026-10-23.md:23–26`). |
| **VH-168** | **Holds for its original record/name contract.** V-43 is an additional issue, not evidence that the recorded browser-language limitation ceased to hold (`M/six-fix-verification-2026-10-23.md:27`; `project/decisions.md:65–67`). |
| **VH-169** | **Pressed behaviour supported; expanded focus contract not yet settled**, for R-02’s reasons (`M/walker/qualify.mjs:827–836`). |

The report follows the required structure and preserves the progress bar, native chooser, statement-wording reservation and separate person checklist (`project/items/VH-174.md:10`; `draft:498–539`). The digest rules applied here are WCAG’s presentation mechanism and rendered focus requirements, Nielsen’s truthful status and consistent terminology, and Carbon’s component-state review (`project/digests/wcag-2.2-aaa.md:27–44`; `project/digests/nielsen.md:17–24`; `project/digests/carbon.md:40–45`).

## For the owner

- **Mixed-script presentation policy:** I favour raw counts against 40 for Chinese prose containing embedded Latin text; Claude favours weighted counting, but neither policy decision alone establishes the WCAG mechanism claim (`draft:547–552`; `B/judged-2026-10-23.md:338–365`).
- **VH-169’s scope:** I would retain a partial verdict for the expanded keyboard-focus contract; Claude calls it holds with the ring defect assigned separately to V-40 (`draft:434`; `B/plan-2026-10-22.md:180–184`).
- **V-47’s rank:** I recommend rank 1 because the output explanation demonstrably misleads, revising my blind rank 2; Claude retains rank 2 because no work is lost (`draft:329–330`; `B/codex-astra-blind-review-2026-10-22.md:100`; `B/codex-astra-report-brief-2026-10-23.md:26`).
- **V-45’s rank and disposition:** I recommend rank 2 if the report retains its asserted house-standard violation, with any specification amendment awaiting your decision; Claude treats it as rank-3 polish for a wish line (`draft:409–414`, `:584`; `UI-STANDARDS.md:150–154`).
