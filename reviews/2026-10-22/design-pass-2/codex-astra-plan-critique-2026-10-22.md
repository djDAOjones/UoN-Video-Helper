<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), critique of the draft plan for the second design pass (VH-170), 2026-10-22, at main 6a207b3, kept as written. What was applied is in plan-2026-10-22.md, "After Codex astra's critique". -->

**Revise before approval.** The draft substantially improves the partnership and correctly treats this as a planned review followed by separately approved fixes. Its main weakness is that a larger matrix could reproduce the previous pass’s overclaims: several instruments do not yet measure what their verdicts imply, the evidence ticket is oversized, and the person checks differ from the specification. Keep the overall sequence, but qualify the instruments first, make transitions and retained work explicit, and bind reviews to identifiable evidence and code. This critique examines `main@6a207b3`, the repository record and retained evidence; it is not a fresh browser walk. Below, `measurements/` means `reviews/2026-10-22/design-pass/evidence/measurements/`, and `walker/` means its `walker/` subdirectory.

**P-01 Judge the journey, not just the inventory — must**

The four lenses are appropriate, but their acceptance criteria favour measurable consistency over the owner’s central question: does the whole page make sense to someone doing the task? Eight roles, fewer styles, aligned edges and a shorter page cannot establish that.

The specification explicitly asks whether a first-time user knows what to do next, and calls out word count and distraction (`docs/01-specification.md:854`). The previous state catalogue already records “Meant to do”, “Competes” and “Repeats” (`reviews/2026-10-20/states-2026-10-20.md:21`).

**Smallest change:** retain those columns and require one synthesis across a default staff journey, a student submission, recovery after failure, and a second video with a retained result. Judge action prominence, decision burden, reading order, unnecessary repetition and continuity between steps. Compare page height with both 20 October and the pass’s frozen starting build, using matching fixtures and disclosure states; height is context, not a target. Treat “13 styles” as a previous observation, not an acceptance threshold: that inventory omitted the code role (`measurements/vh166-type-roles-2026-10-22.md:5`).

**P-02 Turn the catalogue into explicit scenarios and transitions — must**

“Every state” is not yet executable. Several of the 64 rows contain multiple independent behaviours: row 53 includes five save outcomes; row 54 includes four feedback outcomes. A screenshot of each row would leave substantial gaps. The catalogue also contains source-only cases that should not automatically remain source-only.

The highest-value omissions from the explicit scope are:

- Startup pending and blocked; preview unavailable; open Video properties and onset help.
- Previous-result warnings, an unreadable replacement beside a retained result, and saving the previous video while checking the next.
- Save failure, refusal to overwrite the source, download handoff/retry, clipboard failure and an oversized feedback message.
- Switching **video type and video language**, separately from page language, during running and retained-result states.
- Focus remaining where someone is reading when an asynchronous operation finishes.

These are already evidenced or outstanding in catalogue rows 22, 30–31, 50, 52–54 and 57–58, and `project/wish-list.md:51`.

**Smallest change:** give each scenario an ID, setup, expected transition, resulting focus/status and retained values. Map catalogue rows to those IDs. Add targeted landscape/short-height and font-fallback checks; portrait-only testing previously left orientation source-supported (`reviews/2026-10-20/wcag-2026-10-20.md:36`). Replace the ambiguous “key states” selection with a finite list that includes discard, previous result, open disclosures and invalid submission. Avoid a full cross-product of every option: reuse equivalent states with a recorded reason.

**P-03 Qualify the walker before trusting its totals — must**

The current scripts can finish successfully after failed scenarios. `walker/wcag-checks.mjs:261` catches and logs failures; its report discovers whatever JSON files happen to exist (`:287`) and derives passes from those files. `walker/design-walk.mjs:295` likewise logs a failed run and continues. Missing evidence can therefore look like fewer successful measurements.

**Smallest change:** make instrument qualification an acceptance gate before the matrix:

- Declare expected scenarios and assert the actual language, mode and state reached.
- Use a fresh run directory; reject missing, duplicate, stale or failed records.
- Prove detection using a few deliberately failing, temporary browser fixtures: overflow, insufficient focus area and an inaccessible name.
- Give every instrument an explicit “cannot determine” outcome.

Keep a compact manifest containing source commit, instrument revision, browser/OS, viewport, scaling method, fixture identity, expected/observed coverage and unresolved checks. Retain small supporting measurements, not only prose totals. Do not claim the existing walker is preserved “as VH-163 ran it”: VH-165 subsequently changed it in `01cc8d8`. Leave the old bundle untouched and identify the copied revision.

**P-04 Separate enlargement, reflow and font-preference tests — must**

Naming the viewport/DPR runs as proxies is good, but their results must not close browser-enlargement evidence. DPR changes raster density; it does not itself enlarge text. A 320 × 568 viewport also does not reproduce the short viewport obtained by zooming a 1280 × 900 content area to 400%.

Chrome’s default font size at 32 px is a useful **font-preference test**, but it is not isolated text-only zoom here: typography and `--measure: 28rem` both scale with the root size (`src/styles/tokens.carbon.css:43`, `:75`).

**Smallest change:** distinguish four records: narrow-layout reflow; actual Chrome page zoom at 200% and 400%; default-font enlargement; and any synthetic text-only enlargement. For the last, demonstrate that text doubled without proportionately enlarging surrounding geometry. Record actual viewport dimensions and check content and functionality, including dialogs, rather than document width alone. Keep real enlargement unresolved until observed, as the previous audit already required (`reviews/2026-10-20/wcag-2026-10-20.md:42`).

**P-05 Make keyboard and accessibility evidence independent of shortcuts — must**

The proposed AX-tree extension is necessary. The existing `A.ax()` is a DOM inventory filtered through visual visibility, with a home-made name calculation; it is not Chrome’s accessibility tree (`walker/walk.mjs:25`, `:75`, `:112`). The live-region logger records text mutations but not changes to `aria-live`, and cannot establish what a screen reader announces (`:39`, `:55`).

Likewise, existing helpers click fields, assign focus, set file inputs and fall back to assigning select values (`:364`, `:371`, `:387`). The save picker is replaced with an OPFS stub (`:63`). Those methods establish states, not a keyboard-only journey through native dialogs.

**Smallest change:** separate state setup from keyboard verification. The keyboard route must operate controls through keys, with no direct focus/value fallback; an unsupported native interaction stays unverified. Include reverse traversal, native selects/player, dialog entry/exit and focus after cancel, refusal, completion and retry. Capture actual browser AX names, descriptions, values and states, including visually hidden content and the dialog’s background. Test announcement muting and language-switch timing programmatically, while retaining the distinction between DOM changes, accessibility exposure and heard output.

**P-06 Measure rendered focus and target geometry, not inferred substitutes — must**

The draft promises focus area and contrast change but does not specify how it replaces the old false-pass paths. The thumb fallback derives its ring from CSS and returns `inView: true`, with empty clipping and obscuration lists (`walker/wcag-checks.mjs:94`). The report principally checks thickness and adjacent-background contrast, skipping forced-colour contrast (`:336`). Neither establishes changed-pixel area.

Target checks also treat a sufficiently large label bounding box as sufficient and infer an inline-link exception from surrounding text length (`walker/walk.mjs:81`). These are useful screening heuristics, not complete target verification.

**Smallest change:** specify focused/unfocused rendered comparisons, a documented two-pixel-perimeter reference, and the area whose pixels change by at least 3:1. Include both thumbs at endpoints and near overlap, selected segments, the native file button, blue bands and both forced palettes. Judge obscuration separately. Inspect actual clickable areas for wrapped labels and justify exceptions individually. Expand contrast checks beyond ordinary text nodes to input values, placeholders, native/pseudo-element button text and meaningful graphics; the current text walker does not cover all of these (`walker/wcag-checks.mjs:37`).

**P-07 Re-judge applicability and preserve uncertainty — must**

The 86-row table is worthwhile, but a verdict in every row is not sufficient. The baseline contains mixed conclusions such as “met, one control unproven” and “met, with two gaps” (`reviews/2026-10-20/wcag-2026-10-20.md:52`, `:67`). Those must not become inherited passes.

There are two specific traps:

- The toggletip opens on a press, so 1.4.13 was previously inapplicable; its dismissal remains a keyboard/UX question (`reviews/2026-10-20/wcag-2026-10-20.md:51`).
- VH-167’s retained measurement counts one Chinese mixed-script line as 41 characters, then calls it within the criterion using Latin characters as half units (`measurements/vh167-measure-2026-10-22.md:14`, `:24`). The previous critique explicitly rejected that conversion as a normative counting rule.

**Smallest change:** each criterion needs applicability, scoped evidence and any unresolved part. Subtype gaps as defect, accepted limitation or missing evidence. Assess all five parts of 1.4.8, including the user’s colours and enlargement mechanism; preserve raw mixed-script counts and explain the interpretation. A reading-level score is supporting evidence, not a complete judgement of comprehension.

Replace “no finding V-01 to V-39 is found again” with “do not duplicate findings; report regressions or incomplete fixes against their existing IDs.” The progress bar’s essential-content reading is already recorded (`docs/01-specification.md:723`); retain it. The no-new-element rule constrains remedies, not truthful reporting of an unmet criterion.

**P-08 Define a six-fix verification contract — must**

“Each criterion re-checked” is the right commitment, but the plan needs a concrete checklist before execution. The previous summaries contain precisely the limitations this pass should settle.

| Fix | Minimum verification to add |
|---|---|
| **VH-164** | Empty refusal **and valid-message handoff**, copy success/failure, external link, and preservation of the selected video, choices and feedback draft. Distinguish preparing a `mailto:` handoff from observing an email application open; sending is unnecessary. |
| **VH-165** | Both long-name fixtures and the invalid ID across finished, previous and discard states; spacing; both thumb rings in light/dark forced palettes. |
| **VH-166** | All eight roles, including diagnostics, editable values, inline emphasis and links; selected-width reservation, fallback fonts, wrapped footer headings, mobile inset and footer gap. |
| **VH-167** | Raw rendered-line counts, fact notes, choice details and toggletip spacing; narrow containers, enlargement and fallback fonts. |
| **VH-168** | The accepted native-browser-language limitation and translated accessible name still hold; the record remains accurate. This is an accepted limitation, not repaired translation. |
| **VH-169** | Pressed/hover distinction, disabled precedence, band contexts and both forced palettes; keyboard press combined with visible focus. |

Sources include `project/items/VH-166.md:12`, `project/items/VH-167.md:9`, `project/items/VH-168.md:9`, and the explicitly limited VH-164 verification at `project/decisions.md:107`.

The proposed cross-fix effects are sensible. Add **type × measure × fallback/enlargement**, **long text × retained-result/discard geometry**, and **pressed fill × keyboard focus**. Allow “unverified” alongside holds/partial/regressed; unavailable evidence should not be mistaken for a product regression.

**P-09 Add a method checkpoint and bind reviews to a fixed candidate — must**

The six touchpoints are well placed overall. The missing one is before committing to the full evidence run: Codex should review the instrument changes, coverage manifest and a small pilot. Otherwise it joins after the most consequential methodological choices have already consumed the session.

The blind review can be independent of Claude’s **current findings**, but not blind to history when it reads prior findings and fix diffs. Keeping the draft outside the checkout does not prevent findings leaking through item Notes, decisions or measurement commentary. A background reader of a changing checkout also lacks a stable review target.

**Smallest change:** use a fresh review invocation against a frozen source/record snapshot, allow only neutral current-pass material until its output is saved, and describe the blindness precisely. Keep Codex read-only and Claude the sole writer.

For fix checks, review the final candidate diff and evidence before the shipping commit, recording its base and diff identity. Recheck affected changes after substantive revisions; a stale verdict must not certify a new patch. Preserve the verbatim verdict, but obtain a follow-up verdict after a requested repair. For factual disagreement that evidence cannot settle, record “unresolved”; continue unrelated approved items while only the contested remedy waits for the owner.

**P-10 Split evidence preparation from execution; give every stage an exit test — must**

VH-171 combines substantial instrument development, at least 576 light-mode state/language/width combinations before expanding compound states, additional modes, keyboard journeys, six-fix verification and a blind review. Calling it one session is not credible against the record: VH-163’s much smaller first evidence run exhausted a session (`project/items/VH-163.md:50`), and VH-166 and VH-169 each needed a planning handoff before implementation.

**Smallest change:** split VH-171 into instrument qualification and evidence execution. Keep VH-172’s judgement and VH-173’s independent critique separate. Rename VH-175 to **Integrated verification**: individual fix tickets own implementation; VH-175 owns the complete after-run, cross-fix checks and final Codex assessment.

Make closure checkable: expected coverage accounted for; each finding disposed of; each review point accepted, rebutted or owner-decided; each fix linked to verification; remaining limitations linked to existing work. “Every fix item shipped” alone cannot close integrated verification. Save small resumable outputs and concrete `Now` instructions instead of assuming a session will finish the matrix.

**P-11 Make PLAN-7 executable within the record’s budgets — must**

The draft describes tickets but has not yet supplied the records that make them executable. The existing backlog is already about 800 words, against a 1,000-word whole-file budget. Seven detailed stage lines plus future fixes need deliberate space management (`project/profile.md:17`).

**Smallest change:** keep backlog entries short and put criteria in schema-compliant item files. Give PLAN-7 a direction and complete `Items:` line, updated by a subsequent decision when fix IDs are allocated; generate the view as `verbs/plan.md:28` requires. Keep detailed review discussion out of the latest-ten decision slice.

Apply the gate, structural check, digest-rule citation, item-only commit and configured push to **review and planning closes too**, not only fixes (AGENTS rules 6–10). Preserve existing human checks and retire only those actually satisfied. VH-176 must lift only the new Phase 7 block: VH-162 already waits on VH-137 (`project/items/VH-162.md:20`). At close, name the next executable item and reason; Phase 6 is still open, so it must not be accidentally declared complete.

**P-12 Correct and simplify the DSS handoff — must**

The proposed list is useful but differs materially from §13:

- The specification names **VoiceOver + Safari**, not Chrome (`docs/01-specification.md:856`). Chrome may be an additional useful test; substitution requires an owner-approved specification proposal.
- 200% enlargement, 320 px and text-spacing checks are required, in each offered language; they cannot all sit under “If time”.
- Phone and speech-input checks must be completed or explicitly deferred in writing (`:859`).
- Phone checks must include backgrounding, returning to the tab and locating the saved file (`project/items/VH-113.md:25`, `:37`).

**Smallest change:** provide a one-page task script with an app/build link, supplied test clips, expected outcomes and a short reporting template: device/browser/assistive tool, language, task, what happened, what was expected, and whether help was needed. Include retry, retained results, both native selects, the preview, dialog focus return and Announce progress off/on. Link specialist scenarios rather than asking every colleague to run the entire matrix or all four Windows palettes.

Give the actual feedback address, `joe.bell@nottingham.ac.uk` (`src/config/feedback.ts:14`), and ask what was confusing or tiring as well as what failed. Map returned evidence to VH-137, VH-M4, VH-113 and the existing wish lines. Native-language comprehension remains a separate colleague check. The agent pass may close without these results, but it must not claim that §13 criterion 10 or full conformance is complete.

## What is right

- Review first, ticket fixes, then obtain approval before implementation.
- Explicitly revisit all six previous fixes and assess their combined effects.
- Keep independent review, report critique, fix-plan critique, per-fix checks and integrated review.
- Preserve disagreements and let the owner decide unresolved design judgements.
- Consolidate existing interface elements, retain the native chooser decision and keep the progress bar.
- Retain only useful captures and compact evidence, while leaving human verification visibly open.

## What I would ask the owner

1. May PLAN-7 proceed with the evidence ticket split and the instrument-review checkpoint added?
2. Confirm that the pass gates the release cut, while outstanding person checks retain their existing status; no full-conformance claim follows from the agent pass.
3. If Safari is intentionally to be replaced by Chrome for VoiceOver testing, approve that specification change explicitly. Otherwise, keep Safari as recorded and use Chrome additionally where useful.