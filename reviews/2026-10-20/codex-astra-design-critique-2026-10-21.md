<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), adversarial critique of the design pass draft before commit, VH-143, 2026-10-21, kept as written. Its brief is the first paragraph of the prompt kept in the sessions' notes; what was applied and refused is in design-pass-2026-10-21.md, "After Codex astra's critique", and the decision log ("VH-143"). -->

# Codex astra — critique of the design pass draft, 21 October 2026

The draft identifies several real defects, but I would revise it before committing: retain the concrete failures, narrow the Chinese spacing and card recommendations, remove V-25 and V-26 as mandatory design findings, and qualify the evidence summary. Its Phase 3 routing and owner reservations are broadly sound. The strongest findings remain the repeated explanations, inconsistent save-error treatment and unusably narrow Malay time fields; the weakest turn implementation preferences into standards violations. The rank-3 treatment of explicit consistency and configuration breaches also conflicts with the supplied ranking rule. This critique uses the repository’s standards and inspected captures, not a fresh browser walk. Capture filenames below refer to `reviews/2026-10-20/evidence/`; measurement filenames refer to its `measurements/` directory.

## V-18 — The first action moves below the initial viewport

The displacement is real: `v18-page-top.png` shows Choose file below 900 px. However, Page language is **above the title**, not between the title and Step 1; `src/main.ts:3391` inserts it there. Correct both the finding and opening verdict.

Minimalist design and the first-action criterion justify rank 2 as a discoverability concern. Three selected segments are not three competing primary actions: their native radio semantics and selected treatment are intentional (`src/styles/app.css:1083`).

The owner disposition is correct. Moving Page language into the header is a reasonable recommendation, but the approximately 97 px saving is conditional on the header not growing. It needs a narrow-width proposal before that saving can be promised on phones. The existing header reserves space for the logo alone (`src/styles/app.css:147`).

Verdict: holds with changes — correct the switcher’s position and qualify the proposed height saving; retain rank 2 and owner disposition.

## V-19 — Browser defaults escape the token system

The substantive omissions hold: `.status` leaves its bottom margin unspecified, segmented legends lack the older legend reset, radios retain native margins, and weights and diagnostic font families lack tokens (`src/styles/app.css:399`, `:775`, `:788`, `:1039`, `:1475`). VH-124’s broader typography requirement supports this finding; the narrower literal-length test alone does not cover it.

Two qualifications matter:

- The proposed margin reset does not explain or remove the entire claimed 90 px gap. The heading margin, reserved status height and notification margin also contribute (`src/styles/app.css:242`, `:399`, `:422`). Separate the off-scale margin from the deliberate reservation.
- The token sweep checks numerical membership, not token provenance. It accepts 14 px as a length because that number exists as a font-size token, and accepts literal weights 400/700 while flagging 600 (`token-sweep-2026-10-21.md:9`; `walker/tokens.mjs:133`, `:175`). It therefore cannot substantiate “traces every computed length, type and colour”.

The local resets and named weight/font roles are proportionate. Preserve the empty save-line behaviour and the described-radio alignment override (`src/styles/app.css:276`, `:806`). Extend checks for the missing defaults as well as literal weights.

Verdict: holds with changes — distinguish observed spacing from its causes and describe the sweep accurately; retain rank 2 and VH-145.

## V-20 — None repeats its explanation

The three copies are real, both in `v20-none-three-reasons.png` and the three helpers at `src/ui/closing-choice.ts:67`, `:74` and `:79`. VH-124’s prohibition on visible repetition applies directly.

One shared disabled reason, associated with all affected controls, is the smallest correction. Keep “No University closing will be added”: that states the output consequence, whereas “Not used with None” explains the controls’ state (`src/i18n/en-GB.ts:312`, `:316`). The draft should not imply those two distinct functions are themselves unnecessary duplication.

Rank 2 and VH-144 are appropriate; the cited Phase 3 items do not already own these helper lines.

Verdict: holds.

## V-21 — Download lifetime appears twice

Both messages are painted in the same branch (`src/main.ts:3109`, `:3112`) and both are visible in `v21-download-lifetime-twice.png`. This is independent of the later repaint defect already assigned to VH-141.

Removing only the final sentence of `save.download` preserves the destination, incomplete-download qualification and next action, while retaining the more complete lifetime statement (`src/i18n/en-GB.ts:407`, `:868`). That directly satisfies VH-124 and the status-line rule without changing the delivery model.

Verdict: holds.

## V-22 — Save failure lacks the established error treatment

The source establishes the defect: the catch writes `status.saveFailed` into the compact secondary-colour status paragraph beneath the retained result (`src/main.ts:3154`; `index.html:587`; `src/styles/app.css:399`). The shared notification rule is the strongest standard here. Rank 2 is justified without inventing a demonstrated loss of work.

“Every other failure” is too broad: refusing to overwrite the original also uses the save status line (`src/main.ts:3087`). Describe the inconsistent treatment of this substantive save error, rather than claiming universal consistency elsewhere.

The proposed existing error notification is proportionate. Specify that it clears on retry or a later outcome and is announced once; otherwise the fix could leave a stale error beside a successful save. Source-only verification is honestly disclosed, but the implementation needs a deliberately failed save to verify that lifecycle.

Verdict: holds with changes — narrow the comparison and specify error clearing and announcement; retain rank 2 and VH-141.

## V-23 — Malay trim fields collapse

The finding is stronger than its description. At 320 px both fields measure 26 × 44; at 640 px the digest identifies **only the start field** as 34 × 44 (`desktop-ms-staff-2026-10-21.txt:31`, `:45`).

A 26 px border box does not leave room for two digits: the authored horizontal padding consumes 24 px and the borders another 2 px (`src/styles/app.css:1370`; `src/styles/tokens.carbon.css:35`, `:80`). `v23-ms-trim-fields-320.png` shows effectively empty slivers. This is a value-legibility problem as well as a target-size problem. Use the enabled-state measurement as the primary evidence; the locked-state measurements are supplementary.

Wrapping is the right local remedy. Scope it to the trim rows: `.control-with-help` also contains the onset select and help button (`src/styles/app.css:1000`). Reuse the field-width token without imposing a new layout on every instance of that shared class.

Verdict: holds with changes — correct the 640 px claim, describe the lost text area and scope the wrapping rule; retain rank 2 and VH-144.

## V-24 — Statement lists violate the adopted form

The unstopped entries are present in all three tables (`src/i18n/en-GB.ts:781`, `:828`; `src/i18n/zh-Hans.ts:701`, `:742`; `src/i18n/ms-MY.ts:756`, `:800`). The tests count entries without checking that form (`test/screen-text.test.ts:271`).

VH-124’s acceptance criterion is explicit, so rank 2 follows. Following the GOV.UK model’s structure does not itself establish an exception to this project’s punctuation rule. Capitals where applicable and language-appropriate stops are sufficient; Chinese needs no capitalisation operation.

The owner’s reservation of VH-137 makes the disposition correct. Do not expand this into substantive rewriting of the statement.

Verdict: holds.

## V-25 — Several classes perform similar jobs

The duplicated declarations are real, but they mostly demonstrate **consistent rendered patterns**, not a breach of UI consistency. The two link classes are identical; the two result-line classes are identical (`src/styles/app.css:198`, `:1182`, `:1219`, `:1404`). Neither the Carbon digest nor UI-STANDARDS requires one class name per visual job.

Different helper margins can reflect different placements. The lock note and trim introduction also convey different information, so their coexistence is not a repetition defect (`src/main.ts:381`; `src/styles/app.css:1189`, `:1226`). The disabled switcher-edge issue is explicitly hypothetical because these switchers are never locked.

Optional cleanup could group existing selectors and remove the unused rule. Renaming classes throughout the markup is not the smallest necessary design correction. Any actual intro inconsistency should be demonstrated separately; the unstyled errors introduction is already covered by V-19.

Verdict: does not hold as a mandatory design finding — remove from VH-145’s required scope; any retained consolidation is optional rank-3 maintenance.

## V-26 — Disclosure headings are smaller than their contents

The sizes are correctly reported, but the cited standard does not establish a violation. Both sizes already come from the same scale. The stylesheet explicitly distinguishes a disclosure’s navigation heading from its visual size: “A heading for navigation, not for size” (`src/styles/app.css:885`).

`v26-footer-heading-ramp.png` shows a disclosure bar followed by a prose hierarchy. The different component roles matter; semantic heading level does not by itself require progressively smaller type. Moreover, making the summary 16 px/600 still leaves its subheadings at 16 px/700, so the proposed change does not fully answer the stated weight objection (`src/styles/app.css:877`, `:902`).

Verdict: does not hold as a standards defect — remove the mandatory VH-145 change; retain only as an optional rank-3 visual preference if the owner wants it.

## V-27 — Inconsistent marks within language tables

The core evidence holds: feedback quotation marks vary, equivalent Chinese ongoing statuses use different ellipses, and Malay uses both `emel` and `e-mel` (`src/i18n/en-GB.ts:757`; `src/i18n/zh-Hans.ts:325`; `src/i18n/ms-MY.ts:325`, `:742`). The sheet-and-generator route and VH-142 disposition are appropriate.

The added Chinese spacing prescription is not sufficiently justified:

- `preflight.sizeUpTo` deliberately has no space before `{size}` (`src/i18n/zh-Hans.ts:489`). The VH-122 rationale specifically cites that Step 6 presentation as supporting its decision (`project/decisions.md:220`). Reversing it is not routine sibling matching.
- `{address}`, a number and `{smaller}` do not render the same kind of content. A placeholder boundary alone cannot determine spacing.
- Spec §9 permits each language’s own punctuation (`docs/01-specification.md:571`). English terminal punctuation is therefore a comparison aid, not authority for deleting Chinese stops.

Keep demonstrable within-language inconsistencies, enumerate their keys, and leave ambiguous spacing or sentence-form decisions to the colleague review. Under the supplied rubric, retained **mandatory consistency breaches** belong at rank 2; optional typographic preferences remain polish.

Verdict: holds with changes — narrow the Chinese edits, preserve the VH-122 decision and rank retained standards breaches 2; keep VH-142.

## V-28 — Competing names for the same concept

The “build” instances describe the same operation labelled Create (`src/i18n/en-GB.ts:535`, `:537`, `:698`). “The app” in the video-language helper and feedback details also refers to the same tool (`src/i18n/en-GB.ts:114`, `:752`). The proposed five-leaf correction is small and follows the explicit “Do not create synonyms” rule.

That makes rank 2 the consistent classification under this review’s rubric. The owner disposition for the browser sentence and lede is sensible: their wording is expressly pinned as the maintainer’s (`test/screen-text.test.ts:70`, `:81`). Do not broaden the finding into replacing every occurrence of “audio”; the sweep’s word-family totals do not distinguish terminology from names or quoted promises.

Verdict: holds with changes — rank 2 for the five actionable leaves; retain VH-142 and the owner-reserved wording recommendations.

## V-29 — ID rules are duplicated in copy

The duplication is real across the tables (`src/i18n/en-GB.ts:261`, `:273`; `src/i18n/zh-Hans.ts:206`, `:214`; `src/i18n/ms-MY.ts:222`, `:231`). The configuration rule explicitly calls such literals defects, so rank 3 understates the stated standard.

The proposed direction needs one implementation detail: there is no numeric ID-length constant to pass to the strings, only `/^\d{8}$/u` (`src/config/cards.ts:174`). Define the length once in configuration and derive validation and displayed length from it; otherwise adding a separate display constant merely relocates the duplication. The maximum already has a reusable constant and call-site precedent (`src/config/cards.ts:180`; `src/ui/title-card-step.ts:259`).

VH-140 is the right home because it already owns Submission’s upfront rules.

Verdict: holds with changes — rank 2; make validation and copy share the same configured length; retain VH-140.

## V-30 — Date wrapping and submission-heading hierarchy

The date and caveat breaks are visible in all three cited captures. Keeping the generated date and its caveat in coherent pieces is a reasonable rank-3 readability improvement. The captures do not show the caveat disappearing or changing meaning, so the owner’s “not the submission date” instruction does not itself establish a more serious failure.

The heading prescription is less defensible. The configured heading range explicitly permits 56 px, and a distinguishing gap **already exists**: 0.75 em below the heading versus 0.375 em between fields (`src/config/cards.ts:98`, `:127`; `src/media/title-card.ts:408`). “Keeps 56 and gains the gap” describes something already implemented. Nor is 60 px an existing named next heading step.

Retain the narrow wrapping improvement, including the English/Malay dash-form caveat rather than only “bracketed” notes (`src/i18n/en-GB.ts:284`; `src/i18n/ms-MY.ts:244`). Scope it to generated Submission content; do not make arbitrary staff-entered dates unbreakable. Refit the existing maximum-length samples before adopting any higher heading floor.

Verdict: holds with changes — retain rank 3 and VH-146, but remove the prescribed 60 px floor and the claim that the heading lacks a distinguishing gap.

## Set aside and held up

Several set-asides are sound: wrapping switchers follows the explicit existing treatment; disabled buttons are governed differently from fields; per-step lock notices are required; and the toggletip concern already has a follow-up (`src/styles/app.css:1111`, `:385`; `src/main.ts:381`; `project/wish-list.md:24`). These do not justify reopening owner-reserved structure or sign-offs.

Three reasons need correction:

- **Portrait card spacing:** increasing a shared gap everywhere could cost landscape space, but that does not prove portrait spacing cannot change independently. The renderer already distinguishes portrait layout (`src/media/title-card.ts:251`, `:265`). Keep the conservative set-aside, but replace the supposed impossibility with a judgement about priority and benefit.
- **Discard lifetime:** the discard question repeats the result’s record and states the consequence of restarting; it does not repeat the full lifetime sentence. Its two body lines are the question and summary (`src/main.ts:2599`, `:2611`; `src/i18n/en-GB.ts:397`). The set-aside can stand because the immediate destructive consequence is clear, with that corrected explanation.
- **Focus:** a mouse-initiated capture is inconclusive about keyboard focus. Being a region is not, alone, a sufficient reason to dismiss focus visibility. Cite the actual earlier keyboard evidence, and preserve its unresolved thumb-ring limitation (`wcag-2026-10-20.md:77`).

The “held up” section needs tighter boundaries:

- **Coverage is not equivalent to scenario completion.** `desktop-ms-staff-2026-10-21.txt:68` labels a capture “card-refused” while its title and announcements show processing; its “running” variants include completed results at lines 136 and 148. The English “title-card-refused” capture similarly shows “Analysing audio” (`desktop-en-staff-2026-10-21.txt:176`). Correct these labels and the resulting coverage claim. They do not establish new product defects.
- **The measurements do not prove absence of clipping or count Chinese glyphs.** The walker checks viewport overflow, while line length is estimated from rendered width divided by font size or an average-character width (`walker/walk.mjs:97`–`:103`). Say “no measured viewport overflow” and “within the measured CJK width”; do not turn these proxies into universal guarantees. V-23 itself demonstrates invisible input content without page overflow.
- **Word growth is not attributable from totals alone.** The 27-state sums are correct, but Empty and Ready grew by 65 and 63 words, not approximately 100 (`word-counts-2026-10-21.md:8`, `:15`). Errors captured now coexists with a finished result and the six-step page (`desktop-en-staff-2026-10-21.txt:599`). Its +270 is not evidence of 270 additional error words. “Each said once” also conflicts with V-21.
- **“One filled action per state” is too absolute.** The running action is a secondary Cancel button (`src/main.ts:2052`). The defensible claim is that the inspected main transitions preserve primary-action emphasis where an actionable primary exists.
- **The closing evidence is a simulation of its lettering.** The spike draws words over a settled ordinary closing frame (`src/spike/cards.ts:309`, `:352`, `:357`). This supports the nominal size calculation, not verification of every shipped Internal use only asset. The title-card renderer is genuinely shared; distinguish those two evidence routes.

## Missed

- **D-03’s footer list items were dropped without disposition.** Both contact links remain unstopped `<li>` entries (`index.html:750`; `src/i18n/en-GB.ts:853`). Under VH-124’s literal criterion this is rank 2. Record it alongside V-24, but do not treat footer punctuation as reserved statement wording. Stops outside the links would preserve the action labels; the exact markup pins at `test/screen-text.test.ts:300` would need corresponding updates.
- **The apostrophe inventory is incomplete.** Besides `feedback.whatSentDetail`, the statement contains straight apostrophes in two abilities and its Chinese-font limitation (`src/i18n/en-GB.ts:785`, `:786`, `:796`). The sweep reports five straight apostrophes (`strings-sweep-2026-10-21.md`, “Curly marks in use”). If V-27 claims normalisation, explicitly route these remaining instances to the owner’s VH-137 review.
- **Visible select typography is unadjudicated.** The token sweep repeatedly reports `lineHeight: normal` for `select.select`, whose authored rule uses `font: inherit` (`token-sweep-2026-10-21.md:62`; `src/styles/app.css:974`). Unlike font metrics on transparent radio inputs, this concerns displayed text. V-19 should explain whether it is a necessary native-control treatment or another default to resolve, rather than implying the sweep’s typography findings have all been accounted for.