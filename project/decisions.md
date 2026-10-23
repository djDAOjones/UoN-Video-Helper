# Decisions

<!-- Newest first. Never edit an old entry; supersede it. Rule 1 reads
     exactly the latest ten entries' heading, Decision line and Deferred
     line, newest first. The Decision line states the what and its
     one-line why; Rationale holds evidence and detail, read on demand.
     The slice fails at close over 1,000 words. Entries the migration
     inventory lists are inherited and read as heading and Deferred
     line only; this ledger inherits none — the canon decision log is
     frozen under pm_skills/ and indexed by project/history.md. Grammar:
     ## YYYY-MM-DD — ID — title
     **Decision:** what was decided and its one-line why.
     **Rationale:** evidence and detail, in the terms another session
     would need.
     **Supersedes:** YYYY-MM-DD — ID — title, or "none".
     Optional **Deferred:** comma-separated target IDs, or "none".
     Budget 45 live entries: when the validator warns, tools/archive.mjs
     moves the oldest entries verbatim to project/decisions-YYYY-MM.md,
     beside this file, listed in project/archive-index.md. -->

## 2026-10-23 — VH-171 — The instruments qualified: Codex astra's eight musts applied, VH-172's setups merged, S-25 reached by a worker clock

**Decision:** VH-171 ships with all eight of Codex astra's method-check musts, M-01 to M-08, applied and none refused, VH-172's scenario setups merged into the walker, N5 added, and S-25's slow verdict reached by a new fault, F13, the worker's clock at twice real time, because CPU throttling cannot reach the worker and the 21,600 s still never settled; the instruments are fit for the matrix.

**Rationale:** Codex's verdict, as given: "Fit after the musts below" (`reviews/2026-10-22/design-pass-2/codex-astra-method-check-2026-10-23.md`). Each must's application is in `instruments-2026-10-22.md` under "Codex astra's method check, applied (23 October)"; proofs 77 of 77, faults 17 of 17 and F13, pilot 2 43 of 43 whole, smoke 119 of 119 whole across a run and a part run (`smoke-2026-10-23.json`). F13 is an instrument, not a product change; it was accepted on the owner's standing instruction of 2026-10-23: "work through to the end of VH-177, archive and spawn as you go, proceed with your recommendations, universal permission is granted". Limits kept for a person: range thumb and track contrast; the dialog used by keys at enlargement; Chrome's own page zoom. Candidate findings for VH-173 are listed in the instruments file, none judged here. No product code changed.

**Supersedes:** none

**Deferred:** VH-172

## 2026-10-22 — PLAN-7 — A second design, UX and accessibility pass, with Codex astra as partner at every stage, gates the cut

**Decision:** Phase 7, a second whole-page pass judged as four journeys and every scenario, in three languages, three widths, enlargement, dark and forced colours and by keyboard alone, runs as eight stage items, VH-170 to VH-177, before VH-162; Codex astra checks the plan, reviews blind, checks the method, critiques the report and the fix plan, checks every fix before commit and checks the fixes together; because the owner asked for it, with Codex as a full partner.

**Rationale:** The owner's words: "lets design and run another full design / ux / accessibility pass. thorough planning and ticketed before execution". Told that in VH-163 Codex reviewed blind and critiqued the report but checked none of VH-164 to VH-169, the owner wanted Codex as a full partner. The plan is `reviews/2026-10-22/design-pass-2/plan-2026-10-22.md`. Codex critiqued the draft at `6a207b3` ("Revise before approval", twelve points, all must) and all twelve are applied, P-04 qualified: the instruments are qualified before the matrix, the evidence stage split in two, the blind review run on a frozen snapshot, the six fixes verified to a contract, VoiceOver with Safari kept as spec §13 names it. A disagreement of fact is settled by evidence or recorded unresolved; one of judgement goes to the owner, and only that remedy waits. The owner's rule holds: consolidate, no new control, checkbox or element, the progress bar kept. Person checks for Disability Support Services keep their status; the pass claims neither §13 criterion 10 nor full conformance. VH-162 carries "blocked: Phase 7"; VH-137 and VH-14 are unaffected. Fix items join the Items line in VH-175's entry. The owner approved in chat on 2026-10-22, answering three questions: "Approve", "Before the cut" and "Keep as planned".

**Supersedes:** none

**Items:** VH-170, VH-171, VH-172, VH-173, VH-174, VH-175, VH-176, VH-177

**Deferred:** VH-171, VH-172, VH-173, VH-174, VH-175, VH-176, VH-177

## 2026-10-22 — VH-168 — The file chooser stays native: its words follow the browser's language, its name the page's

**Decision:** Choose file keeps the browser's own file input, so its button and "No file chosen" stay in the browser's language on a Chinese or Malay page, while its accessible name, the step heading, follows the page's; no page change, because translating those words needs a new element, which the owner's simplicity rule rules out.

**Rationale:** The owner's words, in VH-163's closing decision: "Keep the browser's own file chooser and record the limitation." Chrome draws both phrases inside the native input and CSS cannot change them. Checked in Chrome 155 with the browser in English: in all three page languages the input's accessible name is the step heading ("1. Choose a video", "1. 选择一个视频", "1. Pilih video") and its value "No file chosen", the browser's words. Neither record claims otherwise: spec §9 says the page repaints in the chosen language and §9.2 checks every string the page can show, which the browser's own words are not; the accessibility statement's five limitations do not mention the chooser and claim nothing about it. So no correction is proposed to either. Evidence: `reviews/2026-10-22/design-pass/evidence/v35-1280-zh-file-input.png`, `…/v35-1280-ms-file-input.png`. Standards: wcag-2.2-aaa 3.1.2 (the page's parts carry their language; the input's words are the browser's); nielsen 4 (one Choose file, as every page has it); carbon one primary per state.

**Supersedes:** none

**Deferred:** none

## 2026-10-22 — VH-169 — A pressed state for each button kind: a fill of its own, never hover's; forced colours inverted

**Decision:** each button kind held down takes its own fill from three new roles, `--interactive-active`, `--layer-active` and `--button-danger-active`, never when disabled; forced colours invert the pair; segments need none; because held down, every button drew its hover fill (V-39).

**Rationale:** The next step past each hover fails 7:1 (blue-60 under white 4.21:1, blue-40 under Nottingham Blue 6.39:1, red-40 6.50:1), so pressed takes new roles. Light: the primary blue-90 (white 11.35:1), a secondary blue-20 (Nottingham Blue 10.32:1), Discard red-90 (white 15.22:1, darker than rest, as Carbon's danger press). Dark and the band: the primary blue-10 (12.66:1, between Portland Stone at rest and blue-20 hovered), a secondary blue-80 (Portland Stone 7.58:1), Discard red-10 (14.02:1). Forced colours: a primary or the unchosen Choose file turns HighlightText with Highlight words; a secondary or the chosen Choose file ButtonText with ButtonFace words, `forced-color-adjust: none` on the pressed state only. A segment needs none: a press ends in the chosen fill, the strongest state it has. Measured with real CDP mouse presses in Chrome 155 at 1280 px, nine kinds, light, dark and forced, in three languages: 81 presses matched `:active` and drew the hover fill before, and 81 a fill of their own after; Use the whole video, disabled, held down keeps its rest look in every theme. Evidence: `reviews/2026-10-22/design-pass/evidence/measurements/vh169-pressed-2026-10-22.md`. Standards: wcag-2.2-aaa 1.4.6, 1.4.11, 2.4.13; carbon tokens and component states; nielsen 1.

**Supersedes:** none

**Deferred:** none

## 2026-10-22 — VH-167 — One reading measure, 28rem, for every size and language; counted, no line over 1.4.8's limits

**Decision:** `--measure` is `28rem` (448 px), one width for running text of every size and language, the owner's starting value kept because the counted lines read well in all three languages; `--measure-cjk` and its `:lang(zh)` rule are retired; the measure caps `.fact-note` and `.radio-detail` as it caps the text fields; the toggletip's paragraphs take `--paragraph-gap`; because `55ch` and `40em` resolved against each element's own font and stopped one column's text at four widths (V-33).

**Rationale:** Counted in Chrome 155 at 1280 px, empty, ready and finished, with the longest fact note probed: English 63 characters at 16 px and 78 at 14 px (before 70 and 79), Malay 63 and 70 (69 and 72), Chinese 29 glyphs at 16 px (40) and, at 14 px, 32 in full-width equivalents (43.5): the one line at 41 counted one for one holds a file name. Before, two Chinese lines passed 40: the uncapped fact note (48) and that notification (47). At 375 px the column is narrower than the measure and nothing changes. Body, helper, notification and fact-note text all stop at 448 px in every language, where they stopped at 489, 428, 640 and 560. At 320 px and at 200 % no sideways scroll, and walk.mjs's 1.4.12 sheet clips nothing. English helper text at 78 is the nearest to 80; a longer English notification line is the thing to watch. Evidence: `reviews/2026-10-22/design-pass/evidence/measurements/vh167-measure-2026-10-22.md`. VH-105's Chinese measure is withdrawn; its Chinese faces stay. Standards: wcag-2.2-aaa 1.4.8 (80 characters, 40 CJK glyphs, a blank line between paragraphs), 1.4.10, 1.4.12; carbon tokens, not literals; nielsen 4.

**Supersedes:** none

**Deferred:** none

## 2026-10-22 — VH-166 — One type set: eight roles, each one rule; the footer's headings at Lora 20; the band's phone inset and the footer's gap

**Decision:** the page's text takes eight roles, each one rule in `app.css` after the components and before forced colours, naming every selector that wears it, and no component rule sets its own size, weight or line height; every `h2`, the footer's two included, is the panel heading, Lora 20/28/700 on a new `--line-height-heading-03: 1.4`; the switchers' legends, notification titles and the statement's `h3` are one section heading, 16/24/600; below the 60rem layout width the header band takes the column's 24 px inset (the desktop logo stays 20 px from the window); the footer's panels take `.panel`'s 24 px; because the owner approved V-32, V-36 and V-37 in VH-163's closing decision.

**Rationale:** Roles: page title 28/35/700 (`heading-04`), panel heading 20/28/700 (`heading-03`), section heading 16/24/600 (like `heading-compact-02`), body and editable text 16/24/400 (like `body-02`), supporting 14/21/400 (`body-compact-01`), compact emphasis 14/21/600 (`heading-compact-01`; a chosen segment, a notification item's title, Help, `strong` in compact text), status mark 14/21/700 (VH-151), code mono 14/21/400 (`code-01`); local adaptations in the brand's faces, tracking `normal`. The footer's `h2`s lose `font: inherit` and the summary its 16/600; the file chooser's button keeps `font: inherit` and stays out of the lists (V-38). The legends fall from 700 to 600, which Arial draws as one Bold, and stay larger than their 14 px segments, as VH-148 asked. The design walk before and after on the same build, 33 captures each: type changed only where planned; each step 2 px shorter, each footer bar 4 px taller (52 px), the footer 24 px taller; at 375 px the logo and the page language 4 px right; at 375 px the English System check and the Malay statement headings wrap to two lines; no sideways scroll. The inventory falls from 16 styles to 13, one per heading kind (`reviews/2026-10-22/design-pass/evidence/measurements/vh166-type-roles-2026-10-22.md`). With 1.4.12 spacing in Chrome at 1280 px no heading clips. Only VH-148's 16 px footer headings clause is superseded. UI-STANDARDS names the roles and the band's phone inset, the brand rule's exception, at 2,396 of 2,400 words. Standards: carbon productive type and the spacing scale; nielsen 4; wcag-2.2-aaa 1.4.6 (no colour changed), 1.4.10, 1.4.12, 2.5.5 (the bars stay one target).

**Supersedes:** 2026-10-21 — VH-148 — The owner’s sign-off changes, including the footer

**Deferred:** none

## 2026-10-22 — VH-165 — Running text breaks a word longer than its line; the thumbs' forced-colour ring is one rule per engine

**Decision:** `overflow-wrap: anywhere` joins the shared running-text rule (`p, li, dd`), so a file name or student ID with no space breaks where it must and every other word still breaks only at a space; the forced-colours focus-ring rule for the trim handles is split into one rule per engine, because Chrome dropped the joint rule whole and the ring never took `CanvasText`.

**Rationale:** Every place V-34 named is a `p` (the notification bodies, the field errors, the status lines), so the one shared rule covers them and no control takes the wrap; no clipping, ellipsis or `break-all`. The design walk gains `en-long-320`, `zh-long-320` and `ms-long-320` with the long-name and long-ID fixtures and a text-range spill check beside the document-width check. Before, in English: the finished, discard and previous states 1,425 px wide at 320 px (1,601 spaced), the underscored name 421, the ID error 837. After: 108 measurements in three languages, six states, light, dark and forced colours, with and without 1.4.12 spacing, all 320 px with no spill (`reviews/2026-10-22/design-pass/evidence/measurements/vh165-long-names-2026-10-22.md`). The same walk with ordinary names at 1280 and 375 px (English, Chinese at 1280, Malay at 375) left every element's box and line count unchanged in 21 states. The thumb rule now appears in Chrome's CSSOM and the focused thumb's ring computes to `CanvasText`, near-black in a light forced palette and white in a dark one. Standards: wcag-2.2-aaa 1.4.10 and 1.4.12, 2.4.13; nielsen 9.

**Supersedes:** none

**Deferred:** none

## 2026-10-22 — VH-163 — The owner approves the five design fixes: footer headings at Lora 20, a 28rem measure, the native file chooser, V-36 and V-37 in VH-166

**Decision:** the owner approves PLAN-6's five design-fix items in its order, and VH-163 closes: VH-166 gives the footer's two headings the panel heading look (Lora 20) and takes V-36's phone inset and V-37's footer gap; VH-167 starts the measure at 28rem and confirms it by line count in the browser; VH-168 keeps the browser's own file chooser and records the limitation, so it becomes record-only with no page change; because these are the owner's answers to the five questions in VH-163's Now.

**Rationale:** The owner's words, relayed from the orchestrator chat on 2026-10-22: "Approve the five fix items. Footer headings match the steps (Lora 20). Start the measure at 28rem and confirm by line count. Keep the browser's own file chooser and record the limitation. Fold V-36 and V-37 into VH-166. Start building in a fresh chat." VH-166's criteria lose their "if the owner takes them" branches; VH-167's value is a start, so the 1.4.8 line count may move it, and a change from 28rem is recorded at its close; VH-168's label branch is withdrawn under the no-new-element rule, so it records the limitation in a decision and corrects the spec or statement only where they claim the chooser is translated. VH-165 starts now.

**Supersedes:** 2026-10-22 — PLAN-6 — The design pass's fixes: five Phase 6 items ahead of the cut, each waiting on the owner's approval

**Deferred:** VH-165, VH-166, VH-167, VH-169, VH-168

## 2026-10-22 — PLAN-6 — The design pass's fixes: five Phase 6 items ahead of the cut, each waiting on the owner's approval

**Decision:** VH-163's rank 2 findings become five Phase 6 items after VH-163 and before VH-162, in this order: VH-165 (long words wrap; the thumbs' forced-colour ring), VH-166 (one type set), VH-167 (one reading measure), VH-169 (a pressed state), VH-168 (the file chooser, on the owner's ruling); none is built until the owner approves, because PLAN-6 of this date asked for the plan first.

**Rationale:** VH-165 first: a measured 1.4.10 failure and a dropped forced-colours rule, two small CSS repairs. VH-166 before VH-167: the measure is counted on the type roles it will carry. VH-169 after them, as it may add a colour role. VH-168 last: under the no-new-element rule the pass recommends the native chooser with the limitation recorded; a label is the owner's exception to make. The rank 3 findings are proposals inside VH-166: V-36's phone inset and V-37's footer gap, each a wish line if not taken. Questions in the owner's ask: the plan, the footer's two headings, the measure's value (28rem proposed), the file chooser, and V-36 and V-37.

**Supersedes:** none

**Items:** VH-165, VH-166, VH-167, VH-169, VH-168

**Deferred:** none

## 2026-10-22 — VH-163 — The design pass: 9 findings, V-31 shipped, six at rank 2 planned, two rank 3 proposals to the owner

**Decision:** the design pass stands as `reviews/2026-10-22/design-pass/design-pass-2026-10-22.md`, V-31 to V-39, with Codex astra's blind review and critique kept as written: V-31 shipped as VH-164; V-32 to V-35, V-38 and V-39 at rank 2 become PLAN-6's five design-fix items; V-36 and V-37 at rank 3 go to the owner; VH-163 stays open until the owner approves the plan, because the item requires that approval before any fix is built.

**Rationale:** The walker measured 33 captures in three languages at 1280 and 375 px, light, dark and forced colours: nine text tuples and seven Chinese twins, prose at 489 px beside helpers at 428 (640 and 560 in Chinese), every gap on the scale. Live checks confirmed V-34 (a long file name scrolls the page sideways at 320 px), V-35 (the chooser's English words in a Chinese or Malay page) and V-39 (pressed looks hovered). Codex's critique was applied but for raising V-37's footer gap to rank 2: a gap in a band of its own misleads no one. It corrected the pass's scope claims, its Carbon references (two are expressive), the panel heading to 20/28, 28rem to a candidate, V-34's cause (no long-name fixture), and V-35's recommendation to the native chooser under the owner's rule. Standards: Nielsen 1, 2, 4 and 9; WCAG 1.4.8, 1.4.10, 1.4.12, 2.4.13; Carbon productive type and button states.

**Supersedes:** none

**Deferred:** VH-165, VH-166, VH-167, VH-168, VH-169

## 2026-10-22 — VH-164 — The feedback form link takes its own ID, so Open email app opens the email again

**Decision:** VH-160's footer link becomes `#feedback-form-link`, leaving `#feedback-form` to the dialog's form, and a test holds every ID in the page to one use, because with two `#feedback-form`s the form's lookup found the link, Open email app submitted the form natively and the page reloaded, losing the draft, a chosen video and every choice; the owner chose to fix it at once, ahead of VH-163's plan.

**Rationale:** Codex astra's blind review for VH-163 found it in source (`required<HTMLFormElement>('#feedback-form')` took the first match, the link VH-160 put above the dialog), and it was reproduced in Chrome on `5e3de2b`: an empty Open email app went to `/?` with the dialog gone. After the fix, the same click keeps the page, shows "Write a message first." and moves focus to the message; the link still opens the form's plain address in a new tab with no referrer. VH-160's test pinned the link's markup with the duplicate ID, so it now pins `feedback-form-link`. The email app itself was not opened from the browser pane. Live on the pilot from `f95599b` until this push. Standards: Nielsen 3 and 5 (nielsen digest); UI-STANDARDS → Error prevention and recovery.

**Supersedes:** none

**Deferred:** none

## 2026-10-22 — PLAN-6 — VH-163, a design pass, joins Phase 6 before the cut; its fixes are planned as items ahead of VH-162

**Decision:** VH-163, a design pass for one type scale, one reading measure and one grid, judged for design, UX and WCAG 2.2 AAA in all three languages, sits in Phase 6 before VH-162; it reviews, with Codex's blind review and critique, then plans its rank 1 and 2 fixes as Phase 6 items ahead of the cut for the owner to approve, adding no control; because the owner asked for it and chose this in chat.

**Rationale:** The owner asked in chat on 2026-10-22: "I want to do another design pass. I am seeing an [un]necessary variety of font styling, text section width, etc. can you create a work item / ticket that will thoroughly review to make it excellent from a design an UX perspective (and accessibility of course)." Asked three questions, the owner answered: "Before the cut (Recommended)", "Yes, blind then critique (Recommended)" and "Review, then a fix phase (Recommended)". A first look at the empty page in Chrome found nine text styles in two faces, three left edges besides the column's, running text at 489 px beside helpers at 428 px (55ch follows the font size), the Chinese column 151 px wider, and the header band's 20 px inset beside the main column's 24 px at 375 px; the evidence is in VH-163's notes. VH-143 found the tokens held; this pass judges how they combine, so V-18 to V-30 are not re-found. The owner's rule that the page stays simple holds: consolidation only, the progress bar kept. VH-162 now starts once VH-137, VH-163 and its fix items ship; whether it also waits for the statement review on 18 November is still the owner's.

**Supersedes:** none

**Items:** VH-163

**Deferred:** none

## 2026-10-22 — VH-137 — The statement's contradictions and its two lists corrected ahead of the owner's review

**Decision:** VH-137's agent part ships before the owner's review, on the owner's relayed "approve all, proceed": the statement's seven V-09 contradictions are corrected and its eleven list items take a capital and their language's stop, with curly apostrophes, in all three languages; the next tests split into the four spec §13 needs and two optional ones, so `statement.plans` gains `optionalIntro` and `optionalItems`; the dates, the chosen tests and the review stay the owner's, so the item stays open.

**Rationale:** The owner's word, relayed from the orchestrator chat on 2026-10-22: "approve all, proceed", answering whether to apply VH-137's agent part now. Each V-09 point and its words: "only automated checks" is gone, and "partially compliant" is tied to the parts listed under "How accessible this tool is" and to no one having yet tested it with a screen reader or other assistive technology (V-06, V-07 and V-10, which the audit named, are fixed by VH-140, VH-141 and VH-149); the reading level is "of the English words"; the hand checks say "in all three languages"; the preview's limitation names audio description and other alternatives; "UoN stands for University of Nottingham" joins the short forms; the colleagues "we are asking" replaces "are checking", with "some words may be wrong until they do"; the four tests §13 criterion 10 needs are "We need them before we can say the tool fully meets the guidelines", and axe or Lighthouse and the staff session sit under "We are also thinking of:". The V-24 recommendation is applied as worded. The short-forms line was split into three sentences because one read at grade 12. The Chinese and Malay are the agent's drafts, marked in the sheet. Checked in Chrome at 375 px in all three languages: the five, four and two items, no straight apostrophe, no empty line, no sideways scroll. Standards: WCAG 2.2 AAA digest, 3.1.5 reading level; Nielsen's error prevention, in a statement that no longer contradicts itself.

**Supersedes:** none

**Deferred:** none

## 2026-10-22 — VH-159 — Spec §5.4 gains the cut-short row for VH-158's warning, as the owner approved it

**Decision:** VH-159.1's draft row is applied to spec §5.4 as worded, after File ends early, because the owner approved it: the spec is 8,074 words, inside its 8,100 budget, so the budget stands.

**Rationale:** The owner's word, relayed from the orchestrator chat on 2026-10-22: "approve all, proceed", answering VH-159.1 among the open questions; the relay quoted the row and asked for it to be applied within the 8,100-word budget. The row's words match the page: the warning is said first among the warnings, "The video file is shorter than expected" (VH-158), and the margin is `ENDS_EARLY_MARGIN_SECONDS`. VH-159.1 is retired, paid.

**Supersedes:** none

**Deferred:** none

## 2026-10-22 — VH-160 — The feedback form is one link under Send feedback, its plain address from config, in a new tab

**Decision:** a link on its own line directly under Send feedback, above the help links, says "Fill in the feedback form (new tab)" (填写反馈表（在新标签页中打开）, "Isi borang maklum balas (dibuka dalam tab baharu)") and opens `FEEDBACK_FORM_URL` in `src/config/feedback.ts` in a new tab with no referrer, because the owner asked for the form near the page's foot and wants the page simple; Send feedback and the help links are unchanged.

**Rationale:** The link takes `.footer-contact-link`, so it is a 44 px target with the band's link colours and needs no new token; its paragraph takes the button's existing `--spacing-05` margin. The address is set once in `main.ts`, plain: a test pins it whole and holds it to no query and no fragment, so nothing from the page, the file or the build can travel with it (rules, no media egress). A new tab is not leaving the page, so Chrome fires no `beforeunload` and a running job raises no "Leave site?"; the click was checked in the browser pane with a counting listener (0). Checked in Chrome at 1280, 375 and 320 px in English, Chinese and Malay, light and dark: 44 px, 48 px where the Malay wraps at 375 and 320, no sideways scroll; forced colours checked in headless Chrome at 1280 px in all three, where the link takes the same LinkText as the team links. The Chinese and Malay are the agent's drafts, marked in the sheet for the campus colleagues (VH-105.2). Spec §9.2 and §11 still name the email as the one feedback route; the correction is drafted as VH-160.1 for the owner. Standards: WCAG 2.5.5 and 2.4.9 (wcag-2.2-aaa digest); Nielsen's minimalist design (nielsen digest).

**Supersedes:** none

**Deferred:** none

## 2026-10-22 — PLAN-5 — Phase 5 closes with its ten items shipped; Phase 6 starts with VH-160, the feedback form link

**Decision:** Phase 5 closes with VH-150 to VH-159 shipped, reconciled against PLAN-5's two entries of 2026-10-22. Phase 6's first item is VH-160, the feedback form link, because it is first in PLAN-6's order and is the only Phase 6 item with nothing blocking it: VH-137 waits on the owner's review, VH-162 cuts a release that includes both, and VH-14 is the owner's upload.

**Rationale:** PLAN-5 named VH-150 to VH-153, then the owner's answers added VH-154 to VH-159. Each of the ten has a trajectory line under Phase 5, none has a backlog line, and the eight item files say shipped (VH-158 and VH-159 have none). What a person or the owner still has to do is on the wish list, not hidden in the phase: VH-150.2, VH-150.3, VH-153.1, VH-155.2, VH-156.1 and VH-158.1 are checks, and VH-159.1 is the draft §5.4 row for VH-158's warning. Local recall, from the record alone, before editing, scored 8/8 (2,2,2,2):

1. VH-156, VH-157, VH-158 and VH-159, from trajectory.md's Phase 5 lines and their decision headings.
2. VH-157: the date no longer counts towards a filled card, because it fills itself.
3. The wish list's open lines (person checks, translations, VH-159.1, the infrastructure the owner deferred), and backlog Next (VH-13, VH-161, VH-17, VH-113), per PLAN-6's Deferred line.
4. VH-160, in Phase 6.

This check ran in the session that wrote the record, not in a fresh one, so it does not prove a handoff. VH-160 also drafts the correction for spec §9.2 and §11, which name email as the one feedback route, as a wish line for the owner (PLAN-6).

**Supersedes:** none

**Deferred:** none

## 2026-10-22 — VH-159 — The spec says what Phase 5 ships: eight approved rows applied, its budget raised to 8,100 words

**Decision:** the eight approved spec rows are applied to §5.4, §6.2, §7.2, §9.1, §9.2, §9.3 and §10, each in the page's shipped words, and rules.md's routed budget for the spec rises from 7,800 to 8,100 words, because the rows bring it to 8,031 and the owner allowed up to 8,500.

**Rationale:** The owner's words in chat on 2026-10-22: "Approve VH-150.1, VH-155.1 and VH-157.1 as worded, and raise the spec budget to what the approved rows need, up to 8,500 words. Start VH-159." The earlier approvals are PLAN-5's "yes to all" (VH-139.1, VH-140.1, VH-142.1, VH-148.1, VH-138.3). Rows applied:

- §5.4: VH-142.1's damage-row ending; VH-139.1's "File ends early" row.
- §6.2: VH-148.1's heading and the helper's words.
- §7.2: VH-139.1's check.
- §9.1: VH-140.1's line under the switches, Step 3's rule and the record naming the card and a video language; VH-148.1's read outcome; VH-157.1's "no title, department or authors".
- §9.2: VH-140.1's line naming the job's type and language beside the progress.
- §9.3: VH-150.1's 2.2.2 reading, replacing VH-141.1; VH-138.3's evidence limitations.
- §10: VH-155.1's "This tool" and VH-148.1's "the checks for it to run".

Each sentence was read against the shipped code: `ends-early.ts` and `ENDS_EARLY_MARGIN_SECONDS`, `runningJobText`, `summaryWithCard`, `nextVideo`, both `fieldsRule` strings, `browserNote`, `readSummary`, `decodeDamage`, and the absence of any Show progress control. Four words follow later shipped wording, not the draft: "sound" is "audio" in VH-139.1's rows and "No sound." is "No audio." (VH-155), "original recording" is "original video" (VH-156), and §10 quotes the three browser sentences as VH-153 left them ("so other browsers", "all the checks"). VH-138.3's defects while they stand (3.3.2, 3.1.2, 4.1.3, two 2.4.3 hand-offs) are not listed, because VH-140 and VH-141 fixed them; what only a person can confirm is in the new evidence paragraph. VH-158's cut-short warning has no §5.4 row and none was approved, so VH-159.1 drafts one. 274 words added; 8,100 leaves 69. No code changed. Applied: the rules file's protected-paths line (`docs/*.md` changes only by owner-approved wording) and wcag-2.2-aaa's Exceptions recorded: 2.2.2 is read as essential, not excepted, so the digest gains no exception.

**Supersedes:** 2026-10-20 — PLAN-2 — The spec's budget rises to 7,800; the Always section drops two lines the profile holds; the Xerte link opens a new tab

**Deferred:** none

## 2026-10-22 — VH-158 — A cut-short Matroska or WebM file is said from its own bytes: a Segment or a last element past the file's end

**Decision:** a Matroska or WebM file is said to be cut short, as the first warning before processing ("The video file is shorter than expected", "…Check the new video before you use it…"), when its last element runs past the file's end, or when its declared Segment size does and its Duration is absent or missed by more than `ENDS_EARLY_MARGIN_SECONDS`; the check reads 1 KB at the start and a tail window of 4 MiB doubling to 32 MiB, never the whole file, in `src/media/matroska-cut.ts`, with no new dependency; a file of unknown sizes and no Duration cut exactly between two elements cannot be told and is not said.

**Rationale:** The owner's VH-139.4 answer (PLAN-5, 2026-10-22) asked for this if a reliable signal exists. Research (`reviews/2026-10-22/vh158-matroska-cut-research.md`): Mediabunny builds a Matroska file's packet list only from what it can read and drops a partial last cluster without a word, so VH-139's index check never fires for one; its Segment size and Cues are private, and only Duration is public. On 60 files (ffmpeg MKV and WebM with Cues at either end, pipe and live output, two crashed recordings, two real Chrome 152 MediaRecorder files, the repo's eight closing WebMs, and 41 cut copies), the shipped module raised nothing on all 19 whole files or the 3 that lost only their trailing Cues, and said 33 of 38 cuts: every cut through an element, every cluster-boundary cut of a known-size file. The five missed are cuts exactly between two elements of unknown-size files: four with no Duration, where no signal exists, and one ffmpeg pipe file with Duration, left unsaid because Duration alone could falsely flag a whole file a tool trimmed without rewriting it. A cluster's start is found by its ID followed by a Timestamp, so a compressed frame's four bytes cannot pose as one. The warning names no times, since such a file declares none, and says to check the new video. Tests: 13 in `matroska-cut.test.ts` on Matroska built in memory (`test/helpers/pcm-mkv.ts`), two in `warnings.test.ts`. Two strings added, with Chinese and Malay drafted by the agent and marked in the sheet; reading grade 4.4. Standards (rule 8): the rules' "silent data loss is the worst outcome" and "streaming, not buffering"; Nielsen 1 and 9; WCAG 3.3.1 as the warnings list already says it; house conventions, regression tests by category and numbers in `src/config/`. No dependency changed. Not checked by a second model.

**Supersedes:** none

**Deferred:** none

## 2026-10-22 — VH-157 — A title card with only the date stops Create as an empty one does; Title is marked and told why

**Decision:** `isCardEmpty` no longer counts the date, because it fills itself, so a ticked staff card with no title, department or authors stops Create with the existing empty-card refusal: the line beside the box says "Type a title, department, or authors, or untick Add a title card.", the status line says "Correct the title card in step 3 to continue.", and focus moves to Title, which is now marked invalid and names that line in its description; the rule line says first "Type a title, department, or authors to make a card."; no control is added.

**Rationale:** The owner's VH-138.1 answer (PLAN-5, 2026-10-22) asked for a warning and the accessible course, with focus to the field; in chat on 2026-10-22 they chose "Stop Create" over a warning that lets the card through on a second press, which would be a hidden mode the person must remember. Student submission already refuses this way (each empty field said beside it, the same status line, focus to the first), so both kinds now agree; Submission is unchanged. A date typed by hand, such as "Spring term", is still only a date. Chrome at 1280 px: date-only Create refused with the line, the status, focus and `aria-invalid` on Title; typing in Department clears all three; Chinese and Malay lines read; Submission's four lines and focus to Assignment unchanged. Two strings changed, with Chinese and Malay drafted by the agent and marked in the sheet; reading grades 6.8 and 4.8. Spec §9.1 step 3's "nothing on it" now means no title, department or authors: VH-157.1 for the owner. Standards (rule 8): WCAG 3.3.1, 3.3.3 and 3.3.6 from the AAA digest; Nielsen 5 and 9; UI-STANDARDS, validation near the relevant control; house conventions, regression tests by category. No dependency changed. Not checked by a second model.

**Supersedes:** 2026-10-21 — VH-140 — The record names the card and a video language not the page's; a line says a switch is for the next video; Step 3 says its rule first

**Deferred:** none

## 2026-10-22 — VH-156 — The writing review's proposals applied; the decode-damage detail says "video" and "undamaged audio", never "recording"

**Decision:** the 20 proposals VH-153 had not applied are applied to `en-GB.ts` and `index.html` as the review worded them, with "audio" where they name it; the decode-damage detail says "the original video", "not from your video" and "louder than undamaged audio can be"; Chinese and Malay rows whose meaning changed are redrafted as the agent's drafts, and rows where only an English idiom or comma changed keep their translation; the enforcement sentence says "you can contact the {service} for help", because "contact" alone put it over the reading-grade limit.

**Rationale:** The owner's "approved" (PLAN-4.1) and PLAN-5.2's words (PLAN-5, 2026-10-22). VH-153 had applied `trim.intro`, `browserNote.pending`, `browserNote.notPassed` and `failure.captured`, so those four stand. 47 rows changed: 30 with Chinese and Malay drafts, `statement.plans.items.2` with Malay alone. The review's section 4 predicted the gate on "contact": 10.4 against a limit of 10; "for help" brings it to 9.8 and is true of the advisory service. The Chinese ends-early lines drop their colon for a full stop, as the English does. `inspect.ts` and `kept-range.ts` carry English copies of two errors in their thrown messages; they now say the same words. Seven test files pinned the old words; each now pins the new, and "picture size, and format" changed with its string. The spec quotes none of the changed words (§8.3's "destination must supply captions" and §7's "spaces, commas or new lines" are its own prose). VH-122's entry is superseded for its English detail's words only. Chrome, three languages: the rows a loaded file reaches; the rest VH-156.1. Standards: UI-STANDARDS, the same words for the same concepts and errors that say what next; Nielsen 9; WCAG 3.1.5; house conventions, strings through the sheet, regression tests by category, minimal change. No dependency changed. Not checked by a second model.

**Supersedes:** 2026-10-20 — VH-122 — The decode-damage words stand, the Chinese without a space after 在, and §5.4 gains its row first

**Deferred:** none

## 2026-10-22 — VH-155 — "Audio" for the file's audio in all three languages; "sound" only for a noise or a verb; "This tool" opens the browser sentence

**Decision:** 36 rows say "audio" (音频, "audio") where they said "sound" (声音, "bunyi") for the file's audio, and the three browser sentences open "This tool" (此工具, "Alat ini"); "sound" stays for a noise in the room, for "silent" and as a verb; string keys such as `noSound` and `soundHeading` keep their names, so only words change; VH-156 writes any proposal that names the audio with "audio".

**Rationale:** The owner's "audio and tool" (VH-143.3, PLAN-5, 2026-10-22), against UI-STANDARDS' one word per concept. Kept as "sound": `warnings.noisy.detail` and `warnings.veryQuiet.detail` (noises in the room), `warnings.targetMissed.detail` (the verb), Chinese 没有声音 for "silent" and 这段录音声音很小 for "very quiet". Chinese 音轨 already meant an audio track and stays; 声音通道 becomes 音频声道. The filled sheet is CRLF, not LF as VH-153's hand-over said; it is written back CRLF, and the sheet's Step 6 group heading follows. Spec §10 still quotes "This app", a correction for the owner (VH-155.1). Chrome, three languages: the browser sentence, the trim intro and Video properties' audio rows with the sample `AMCS3059`; the rows only a job, a warning or a failure reaches, VH-155.2. Standards: UI-STANDARDS, the same word for the same concept; Nielsen 2 and 4; house conventions, strings through the sheet, minimal change. No dependency changed. Not checked by a second model.

**Supersedes:** none

**Deferred:** none

## 2026-10-22 — VH-154 — Page language moves into the header band, on the right; on the band's blue its focus ring stays white under forced colours

**Decision:** the page's language switcher is appended to the header band, right of the logo, with its label beside the segments from 34rem up and above them below that; the machine-translation note stays in `main` above the heading; under forced colours the band keeps its brand colours, so the switcher's focus ring there is the band's `--focus` white, not a system colour — the one token in the forced-colours block, because a system colour on a blue the theme does not repaint can fall below 3:1.

**Rationale:** The owner agreed V-18's recommendation (VH-143.1, PLAN-5, 2026-10-22). At 1280 × 900 the band stays 87 px and "Choose file" moves from about 916 px to 846 px, inside the first screen. At 390 px the band wraps the switcher under the logo and the heading lands where it did before (about 211 px), so the phone gains nothing and loses nothing, as V-18 warned. At 280 px nothing scrolls sideways. A floated legend is laid out as a box in the fieldset's content, so the segments sit beside it; below 34rem, the breakpoint the facts list already uses, it unfloats so the segments keep the whole width. Headless Chrome over CDP with forced colours emulated, light and dark: the band stays Nottingham Blue, the segments take ButtonFace and Highlight, the label stays light on blue, and a keyboard Tab from the top reaches the skip link first and then the chosen radio, whose ring is 2 px solid white. The Chinese page shows the note above the heading and says the switch in the live line. Standards: UI-STANDARDS, roles inside a band and forced colours (the ring's exception recorded here); WCAG 2.4.13, 1.4.10 and 2.4.1; Nielsen 8; Carbon, tokens, not literals; house conventions, minimal change and regression tests by category. No string, colour token or dependency changed. Not checked by a second model.

**Supersedes:** none

**Deferred:** none

## 2026-10-22 — VH-153 — The words after VH-148 agree; the four shared rows take the approved words once, here

**Decision:** `trim.intro`, `browserNote.pending`, `browserNote.notPassed` and `failure.captured` take the writing review's approved words in this item, with VH-153's fixes and PLAN-5.1's Chinese, so VH-156 applies the other proposals and leaves these four as they stand; a failed save is said from `saveFailedWhat` and `saveFailedNext`, and `saveFailed` and `source.variableFrameRate` are retired.

**Rationale:** VH-153's Now, and the owner's "approved" for all 24 proposals (PLAN-5, 2026-10-22). R2-7 keeps "are added", which the review's text dropped. R2-8: Chinese 此应用专为 Chrome 浏览器设计和构建 and Malay "direka bentuk … pemeriksaan" open all three sentences, pinned for every table. R2-9: only the English said "(opens in a new tab)"; the Chinese and Malay already used their statement link's phrase, now pinned beside it. R2-10: `sheet.ts` gains where-lines for the four continuation rows and a note for `idsHelperNext`; `{max}` is explained once; its variant notes say "closing graphics"; the Creators team row says it opens Teams in a new tab; `statement.covers` loses the Joe Bell note VH-148's cut left behind. The filled sheet's English and notes columns are synced from `sheet.ts` (54 rows), its `where` column only for the rows changed, as it holds older step numbers; the repeated note was the save rows' doubled VH-141 mark, and `trim.intro`'s broken mark is re-quoted. Chinese stopped saves say 您随时可以保存, still an offer. Chrome, three languages: the passed browser sentence, the trim intro, the footer link, the smaller output's line; the rest VH-153.1. Standards: UI-STANDARDS, the same words for the same concepts and link text that stands alone; Nielsen 4; WCAG 2.4.9; house conventions, strings through the sheet, regression tests by category, minimal change. No dependency changed. Not checked by a second model.

**Supersedes:** none

**Deferred:** none

## 2026-10-22 — VH-152 — Three test-only functions retired; the read line's words come from `readLine()`

**Decision:** `summarise()`, `closingResultText()` and `studentIdsHelperText()` are retired, and their assertions now test `readLine()`, `closingResultLines()` and `studentIdsHelperLines()`, which the page calls. A Submission date template the renderer cannot split wraps as ordinary text, because one unbreakable piece would be refused with an error that no edit clears.

**Rationale:** R2-12 and R2-13, and the rank-3 VH-146 and VH-144 findings, in `reviews/2026-10-22/claude-review-of-codex-run.md`. `readLine()` returns the read sentence and "No sound." apart, because the page draws the second in bold. The test that joins the closing lines joins them as the retired function did, so every sentence assertion stands unchanged. The mutation was reproduced before the fix: it failed for English and Malay only. `spike-cards.html` was re-run because `title-card.ts` changed: ALL PASS. Standards: house conventions, regression tests by category, no hollow tests, minimal change; UI-STANDARDS, a disabled control explains itself; WCAG 1.3.1. No change a user can see, and no string or dependency changed. Not checked by a second model.

**Supersedes:** none

**Deferred:** none

## 2026-10-22 — VH-151 — Disabled controls look disabled; the status mark gets its own weight role

**Decision:** a system check's pass or fail mark takes `--type-weight-mark` (700), a role of its own, because it is a status glyph, not a heading. The fix that keeps a locked, invalid textarea's dashed edge, `:not(:disabled)` on the invalid rule, also applies to the text field, which had the same defect.

**Rationale:** R2-6, R2-11 and the rank-3 page and VH-145 findings of `reviews/2026-10-22/claude-review-of-codex-run.md`, as VH-151's criteria name them. `:not(:disabled)` on the invalid rule was chosen over another selector in the disabled group, which kept that group and its VH-150 pin unchanged. Before the fix, the old trim rule held the field at 192 px in a 182 px row at 280 px. It overflowed its row but stayed short of the page edge, so a narrower frame would have scrolled, as the review's arithmetic said. Headless Chrome was driven over CDP, with forced colours emulated, an 18 px default font set and the sample `AMCS3059` read; the measurements are in `reviews/2026-10-22/vh151-browser.json`. VH-150.3's states needed a finished or failed job, and this walk reached none of them, so that line stands. Standards: UI-STANDARDS, disabled reads as disabled and forced colours; WCAG 1.4.10 and 2.5.5; Carbon, tokens, not literals; house conventions, regression tests by category and minimal change. No colour changes except the arrow's, no string and no dependency changed. Not checked by a second model.

**Supersedes:** none

**Deferred:** none

## 2026-10-22 — VH-150 — The job's state: Show progress withdrawn, a fresh bar, the stop withdrawn, one primary, and pins

**Decision:** Show progress leaves the page on the owner's word, so the moving progress relies on spec §9.3's reading of WCAG 2.2.2 that it is essential (VH-150.1, for the owner); once the worker settles after a watchdog failure, the job's line says the failure alone, heard once more, which tells a screen-reader user the stop is over; step 1's line stays empty while a withdrawn block is re-checked and gets "Video read." back once, from whatever settles next.

**Rationale:** The owner's words in chat on 2026-10-22, recorded in PLAN-5: "Withdraw it" and "No, Save stays the one primary"; the start relayed by the orchestrator session: "yes, please proceed". R2-1: emptying the line was the other choice, but nothing then said Create was back; the failure's own sentence ends on its next step, so no new string. R2-2: `resetProgress` at the start of every job. R2-3: `clearTrim('unreadable')` restores the chooser's emphasis only when no result stands. R2-4: markup, the three tables, the filled sheet's two rows and `main.ts` lose it; the title goes back to `setTitle('stage')`; V-14 is held by `onStage`'s guard and `hideProgress` on Cancel and failure. R2-5: pins in `test/screen-text.test.ts` ("the job's state (VH-150)") and `test/stylesheet.test.ts`. Rank 3: a result's warnings are a sibling notification without `warnings.reassurance` (`renderWarnings`' new `reassure` option); the dead restore in `runPreflight` became `payReadLine`, called by a clear verdict, a trim to correct, a failed or stopped check, and cancelled by a block that holds; the redundant `!cancelRequested` went; the preview's error hands focus to the field of the Set button that held it. Gate green: 79 files, 1,427 passed, the one existing EBU skip. Chrome, 1280 px, English, a recorded WebM: a second job opened at value 0 with no words; an unreadable file beside an unsaved result left Save the only primary; a finished result's two children are siblings, none nested; Set end here's focus went to the end field. Not reached: a watchdog failure, a storage block, warnings on a result, 375 px, Chinese and Malay (VH-150.3). Retired: VH-141.1 — retired — Show progress is withdrawn; VH-150.1 drafts the reading that replaces it. VH-141.2 — retired — "try Show progress" is gone; VH-150.2 replaces it. Standards: UI-STANDARDS, one primary button per state and System status; Nielsen 7, power features that do not burden beginners, and 1; WCAG 2.2.2, 2.4.3 and 4.1.3; house conventions, regression tests by category, strings through the sheet, minimal change. No new token, string or dependency. Not checked by a second model.

**Supersedes:** none

**Deferred:** none

## 2026-10-22 — PLAN-6 — The public release: 0.2.0 on Xerte, Phase 5 then Phase 6, the feedback form beside what exists

**Decision:** the backlog's Current milestone is now the public release, 0.2.0, a release before v1. It is Phase 5 as approved, then Phase 6: VH-160 (the feedback form link), VH-137 (the statement's review), VH-162 (the release cut) and VH-14 (Xerte live). Xerte is the public home, GitHub Pages stays as the unadvertised preview, and the form replaces nothing. These are the owner's answers in chat on 2026-10-22. Person checks, translations, the device envelope and the limits follow the release and do not hold it.

**Rationale:** The owner's answers in chat on 2026-10-22, to four questions:

- Home: "Xerte; Pages stays as preview" — Xerte is the advertised address, and Pages keeps publishing from `main` with no infrastructure change. This answers VH-14's open question, whether Pages stays up once Xerte is live.
- Version: "Before v1, 0.2.0" — the release ships once Phase 5, the form link and the statement review ship. Spec §13 is not claimed: criterion 10's walk (the Disability Support Services colleagues) and criterion 1's EchoVideo upload (VH-70) follow. The machine-translation note and "partially compliant" stay true.
- Form: "Replaces nothing" — Send feedback stays for problem reports, because its email carries the build and recent log lines. The Creators team and learning content team links stay for help. The form is one footer link under Send feedback, not a control, because the owner wants the page simple.
- Handover: "I think it has finished but I'm not sure" — the chat that claimed the 09:06 UTC end, "VH-150 #1 · 10:06", had been idle since 09:11 UTC, with no commit and a clean tree at `c441dbb`, so this session wrote.

How every open line was sorted:

- **In the release:**
  - Phase 5, VH-150 to VH-159, unchanged in order, with VH-141.1's approval inside VH-150.
  - VH-160, new.
  - VH-137, because a public statement must not contradict itself. Its review absorbs VH-138.2 and VH-143.2.
  - VH-162, new.
  - VH-14, its offline-cache clause split off to VH-161.
- **After the release (Next):** VH-13 (blocked on VH-M2), VH-161, VH-17 and VH-113, the last two the owner's.
- **Icebox:** unchanged.
- **Owner-only, not gating the release:**
  - VH-M2, VH-M4, VH-70 and INTAKE.2;
  - the person checks, VH-105.1, VH-122.1, VH-127.1, VH-128.1, VH-135.1, VH-136.1, VH-138.4, VH-139.2, VH-139.3, VH-141.2 and VH-148.2, which go to the Disability Support Services colleagues;
  - the translations, VH-105.2 and VH-143.4, which go to the campus colleagues.
- **Kept on the wish list for after the release:**
  - INTAKE.1 and INTAKE.3 to INTAKE.7, VH-138.5, VH-139.5 and VH-139.6;
  - the infrastructure the owner deferred: INTAKE.8, V3-HARNESS.1, V31-UPGRADE.1, VH-116.1 and VH-147.1.

Spec §9.2 and §11 name the email as the one feedback route. VH-160 drafts that correction as a wish line, because `docs/` is the owner's. The empty Band 3 and Band 6 headings are gone, with VH-17 and VH-113 now in Next.

**Supersedes:** none

**Items:** VH-160, VH-137, VH-162, VH-14

**Deferred:** VH-161, VH-13, VH-17, VH-113

## 2026-10-22 — PLAN-5 — The owner's answers of 22 October: six more Phase 5 items, the spec rows approved, the infrastructure deferred

**Decision:** Phase 5 gains six items after VH-153, each from an owner answer in chat on 2026-10-22: VH-154 (Page language into the header band), VH-155 ("audio", not "sound", and "This tool"), VH-156 (the writing review's 24 proposals), VH-157 (a title card with nothing typed), VH-158 (a cut-short Matroska or WebM file said) and VH-159 (the approved spec rows applied); the internal infrastructure waits until the app settles; VH-14's Xerte upload is the owner's, today.

**Rationale:** The owner's words, answering the orchestrator chat's list of open questions:

- VH-143.1, the frame above step 1: "agreed" — the recommendation stands: Page language moves into the header band on the right, the two video switchers stay under the lede. Promoted to VH-154.
- VH-143.3, "audio" or "sound", "This app" or "This tool": "audio and tool" — the page says "audio" for the one concept, where it now says "sound" (the writing review §4 notes the owner's rule favours "audio" as a word shared across languages), and the browser sentence says "This tool". Promoted to VH-155.
- PLAN-4.1, the writing review's 24 proposals: "approved". Promoted to VH-156, with PLAN-5.1 (the Chinese `failure.captured`) in the same change; VH-153 still changes its four shared rows once, as its Now says.
- VH-138.1, a title card with only the date: "perhaps a warning and any other recommended good UX and accessible friendly course of action (focus attention or control to that parameter?)" — a date-only card is not made silently; the agent recommends the accessible pattern at VH-157's start, with focus moved to the card's first field. Promoted to VH-157.
- VH-139.4, a cut-short Matroska or WebM file: "yes, something along the lines of 'the video file is shorter than expected, please check it before using'". Mediabunny's index declares only what it can read, so VH-158 first establishes a reliable signal; if none exists, it reports back rather than guessing. Promoted to VH-158.
- PLAN-5.2, the two "recordings": "use 'video' for the person's own thing, as the rest of the app already does ('Your video is ready', 'Creating your video'), and describe the technical limit without the word 'recording' at all." Folded into VH-156.
- The spec approvals: "yes to all" — VH-139.1, VH-140.1, VH-142.1, VH-148.1 and VH-138.3, applied by VH-159 last in the phase so the spec says what Phase 5 ships. The spec stands at 7,757 of 7,800 words, so VH-159 may need a budget decision; VH-141.1 waits for VH-150's replacement draft.
- Housekeeping, V31-UPGRADE.1, INTAKE.8 and V3-HARNESS.1: "defer all internal infrastructure such as 3.1 upgrade. we will look at this once the app is settled." The three lines, and VH-147.1, stay on the wish list.
- Announce progress: "done" — PLAN-5's entry above stands: Announce progress stays.
- VH-14: "this is happening today, via Xerte". The person checks (NVDA, VoiceOver, Windows contrast themes, the Teams link, `samples/`) go to colleagues in Disability Support Services, and the translations to campus colleagues, both on the owner's asking; their wish lines stay open until a result comes back.

**Supersedes:** none

**Deferred:** none

## 2026-10-22 — PLAN-5 — Phase 5: what the review of the Codex run found

**Decision:** Phase 5 is four items, in this order, each with a file: VH-150 (the job's state), VH-151 (disabled controls and the trim field), VH-152 (tests that guard what the page draws) and VH-153 (the words). Together they answer the review of Codex's 21 October run. Show progress is withdrawn, and Save stays the only primary button beside an unsaved result. The owner made both calls in chat on 2026-10-22 and approved the plan, with Phase 5 first.

**Rationale:** The review is `reviews/2026-10-22/claude-review-of-codex-run.md`; R2-n is finding n under its Rank 2.

The owner's answers in chat on 2026-10-22:

- on Show progress: "Withdraw it";
- on the two primary buttons: "No, Save stays the one primary";
- on the next phase: "Phase 5 first";
- on the draft: "Approve and write it".

Another session later relayed a request to remove Announce progress too. Asked here, the owner answered "No, keep Announce progress", so it stays, with its remembered choice.

Show progress is withdrawn under the Nielsen digest's rule 7, power features that do not burden beginners. The page then relies on WCAG 2.2.2's reading that a job's progress is essential, and VH-150 drafts that reading for spec §9.3 as a wish line for the owner. Save stays the only primary under UI-STANDARDS' rule of one primary button per state.

All 13 rank-2 findings go to Phase 5:

- R2-1 to R2-5 to VH-150;
- R2-6 and R2-11 to VH-151;
- R2-12 and R2-13 to VH-152;
- R2-7 to R2-10 to VH-153.

Of the 30 rank-3 findings:

- **21 fold into the item whose files they touch**, each named in that item's criteria.
- **Two become wish lines:**
  - PLAN-5.1: the Chinese `failure.captured` repeats 报告此问题. It follows the writing review's verdict on the English row, so the row changes once.
  - PLAN-5.2: the decode-damage detail's two "recordings", which are the owner's wording.
- **Seven are disposed of here:**
  - VH-145's Decision line says colours were kept, but the errors intro moved to secondary text through `.step-intro`. That was asked for and is AAA. It is recorded here because entries are never edited.
  - The worst Chinese 4:3 card's 1 px of headroom is dropped. An over-wide piece is refused at its field and never clipped, and VH-128.1 already asks a person to make the card on a real display.
  - The readability parser now splits `radio-detail` and `helper-line` spans into passages. This is dropped as defensible, because they are laid out as separate lines. It is a measurement change, recorded here for the owner.
  - The blank lines between Phase 3's and Phase 4's trajectory items were paid off by V31-UPGRADE's reorder.
  - "Taken gateless" given as a Decision line's why is dropped. Entries are never edited, and this phase is not gateless.
  - PLAN-4 named no next phase. This entry answers that.
  - VH-124's 1,588-word item file is dropped. A shipped item's file stays as it is, and the warning comes from check:memory, which INTAKE.8 proposes retiring.

The order:

1. VH-150 first. A user sees its defects, and it carries the owner's two calls.
2. VH-151 second. Its defects can be seen too, and all of them are in the stylesheet.
3. VH-152 third. It changes only tests and nothing a user sees.
4. VH-153 last. VH-150 removes strings and may add some, whose notes VH-153 then matches once. PLAN-4.1, the writing review, rewords `trim.intro`, `browserNote.pending`, `browserNote.notPassed` and `failure.captured`, and the owner may judge those rows first.

This supersedes VH-141's entry in part. Its Show progress checkbox is withdrawn, and V-15's restored chooser emphasis does not apply while an unsaved result stands. VH-141.1 and VH-141.2 stay until VH-150 replaces them with what ships.

VH-149.1 is promoted into the four items. None of the writing review's 24 proposals is applied. Nothing in Phase 5 adds a runtime dependency or edits `docs/`. The owner starts VH-150.

**Supersedes:** 2026-10-21 — VH-141 — State changes retain their meaning and hand focus on

**Items:** VH-150, VH-151, VH-152, VH-153

**Deferred:** none

## 2026-10-22 — V31-UPGRADE — The project runs pm-next v3.1: tools, verbs and the start-notice hook replaced as a set, the record kept

**Decision:** the project runs pm-next v3.1 (PM-Skills lab b5c6f4b) from the commit carrying this entry — its twelve tools and four verbs, the item schema's Now section, the start notice as a third session hook — and, each in a commit of its own after it, the wish lines take permanent IDs, each trajectory phase goes oldest first, and the WCAG 2.2 AAA digest takes v3's repair; because the owner's relayed word of 2026-10-21 approved v3.1 and asked for the upgrade, after this project's day-21 reading was sealed.

**Rationale:** The lab's V31-FIELD-1, by v3.1's upgrade route (lab/next-v31/CHANGELOG.md, "Existing installations — v3 to v3.1", and the lab's V31-DEPLOY procedure). The archived decisions and their index moved beside decisions.md, project/archive/decisions-2026-10.md to project/decisions-2026-10.md and project/archive/INDEX.md to project/archive-index.md, in a commit of its own (36736be), and v3.1's migrate tool was committed alone (8ff2f0f), both before the snapshot. The snapshot at 8ff2f0f, against the pinned build 155f145: 905 tracked files; 25 open and 38 shipped lines, 65 decision entries, 40 wish lines, 51 item files, 5 digests, 2 archive files. Its inventory, project/migration/upgrade-v3.1.json, sits beside the canon migration's inventory and census, kept byte for byte. `node tools/migrate.mjs --verify --upgrade v3.1` before the commit: migrate: 0 failure(s), 2 warning(s) — that no commit was named yet, and that .claude/settings.json changed, the hook merge this route calls for, on the owner's word below. project/items/_schema.md was v3's unedited copy and takes v3.1's (V31-NOW). `node tools/harness.mjs --hooks-only --harness claude` merged the start notice (tools/handover.mjs on SessionStart startup and clear) into .claude/settings.json as a third group, every other setting kept, the note's dashes re-serialised as characters; .claude/settings.intake.json, for intake only, is unchanged. The Session line stays at 200k. The comments in wish-list.md, decisions.md and trajectory.md now state v3.1's wish-line form, the archive's place and the order within a phase; structure.md's tools and verbs rows name v3.1's set. The profile, rules file and brief are unchanged and keep the owner's signatures; the profile's Gate line, "the v3 checker", still names the v3 family's checker, and a wording correction is proposed to the owner in the pull request. Between this commit and the stamp, v3.1's checker fails each of the 40 unstamped wish lines, as V31-WISH-IDS's note foresees. This entry supersedes the intake's in its build clause only, "pm-next v3's (PM-Skills-lab commit 155f145)"; the rest of it stands. Authority: the owner's words of 2026-10-21 in the lab's orchestrator chat, relayed and not seen by him in this chat: "I approve all the 3.1 aspects and want AI to proceed through to the upgrade as much as possible, proceeding on the basi of recommendations." (01:05 BST) and "you have permission for everything including model changes, proceed" (about 01:10). The pull request is his to merge; it was rebuilt on main b07f1b2, after the overnight runs' and VH-149's 23 commits, on his word of 2026-10-22, relayed: "Rebuild both pull requests now anyway, accepting that they may conflict again before I merge." Local edits, each disposed:

- Migration edit: tools/migrate.mjs — re-applied — v3.1's copy, committed alone before the snapshot

**Supersedes:** 2026-10-01 — INTAKE — UoN Video Helper adopts pm-next v3 from canon 4.9.2

**Deferred:** none

## 2026-10-22 — VH-149 — The Codex run reviewed: five rank-1 defects fixed, the rest to the owner

**Decision:** a visually hidden polite region, `#page-announcer`, now says Errors captured and a refused preview. Step 1's line keeps its own words, because writing them there wiped a blocked start-up's reason and the bold "No sound.". The weakened save pin, the broken Chinese and Malay sentences and the rewritten statement sentence are put back. The review's rank-2 and rank-3 findings wait for the owner.

**Rationale:** The review is `reviews/2026-10-22/claude-review-of-codex-run.md`: five rank-1, 13 rank-2 and about 25 rank-3 findings across the eight commits, gate green at `25a4a8f`, and the live pilot checked at 1280 and 375 px in three colour modes. A new region rather than appending to step 1's line: the line is painted by several writers, and V-10 asked for a region on the page in every state. Errors captured is said as the panel appears, as V-10's words have it, not for each error under it. The region is emptied on a change of language rather than repainted, so it neither lingers in the old language nor speaks again. The statement sentences are restored as they stood before VH-148, which is what its criterion asked. Standards: UI-STANDARDS, System status; Nielsen 1, 4 and 9; WCAG 4.1.3; house conventions, regression tests by category, strings through the sheet, minimal change. A person's screen-reader check stays on VH-141's existing wish line. Not checked by a second model.

**Supersedes:** none

## 2026-10-21 — PLAN-4 — Phase 4 and the authorised Codex run close

**Decision:** Phase 4 closes with VH-144, VH-145 and VH-146 shipped, reconciled against its Items list. The authorised run and its report are complete. No next phase is approved: VH-13 in Next remains blocked by VH-M2, so further implementation order needs owner direction.

**Rationale:** VH-144 pays V-20/V-23, VH-145 V-19/V-25, and VH-146 V-30 without changing the card floor or words. Local recall before editing scored 8/8 (2,2,2,2): latest implementation closes VH-146/VH-145/VH-144/VH-142 are anchored by their close headings and Phase 4/3 trajectory; VH-144’s shared reason and field width provide the phase decision and why; wish-list/backlog locate human, spec and maintainer deferrals; the handoff’s six-step run and backlog’s blocked Next establish the absence of an approved next phase. This is local, not a fresh-session handoff. The report and changed translation-key list are in reviews/2026-10-21; the reserved writing review is explicitly captured as a wish line. Milestone audit again finds zero runtime and 14 development findings (10 high, 1 moderate, 3 low), covered by the existing V3-HARNESS audit wish. No dependencies changed. House conventions: milestone audit, complete ledger and retained verification evidence. Known missing-sample and frozen-canon warnings remain covered by their existing wishes. Taken gateless under the handoff; no second-model review or human acceptance is claimed.

**Supersedes:** none

**Deferred:** none

## 2026-10-21 — VH-146 — Generated dates and caveats stay whole

**Decision:** Submission’s generated date and its complete caveat each wrap as one piece, while staff-typed dates keep ordinary breaks. The existing three templates and card words stay unchanged — the narrow renderer change requested by V-30, taken gateless.

**Rationale:** CardRun can mark an indivisible phrase; Submission splits only its generated em-dash/full-width-bracket templates into date, original spacing and caveat. An unrecognised future template stays whole. Regression tests use all three actual language tables, prove separate whole date/note lines and refusal below their width, and retain staff-date wrapping. The walker’s cards scenario reports ALL PASS: 37 clips kept in reviews/2026-10-21/vh146-cards, every logged size at least 56 px per 1080 (28 pt at PowerPoint size), with 4K equivalence. The worst 4:3 Chinese card has 1 px/1080 spare, as logged; no floor or limit changed. Chrome’s 18 language/width/theme combinations also accept the Submission form. Standards: Carbon productive typography; Nielsen 2 and 4; WCAG 1.4.4/1.4.10 and the project’s card type floor; house conventions, renderer regression and browser spike. Existing VH-127/VH-128 wishes cover full-size human viewing and screen readers. Known sample and frozen-canon warnings keep their existing follow-ups.

**Supersedes:** none

**Deferred:** none

## 2026-10-21 — VH-145 — Browser defaults meet the token system

**Decision:** status spacing, legend padding, radio margins, select line height, fieldset shrinkage, dialog gutters and error-intro spacing are explicit; type roles name regular, semibold and bold, diagnostics name their monospace face, and identical rules are grouped. Taken gateless as the specified token-boundary repair, preserving existing type weights and colours.

**Rationale:** The 700 heading role from VH-148 is reused; body 400 and emphasis 600 complete the roles. The monospace token keeps the existing platform face. Selects compute to 21 px line height, so no native exception is needed. The dialog overrides the browser’s max-width, fixing its 19 px phone gutter to 16 px. The status reserves one compact line (21 px), with zero bottom margin and the empty save reset preserved. Chrome captured 72 states across three languages, four widths and three themes, compared with a 24-state pre-change baseline and the design-pass evidence. Its spacing sweep leaves only structural automatic centring margins; no off-scale padding or gap remains. Tests retain the switcher’s equal reserved weight and reject literals or missing resets. Standards: Carbon productive spacing and type roles; WCAG 1.4.8, 1.4.10 and 2.5.5; Nielsen 4 and 8; house conventions, two token systems and category tests. Real zoom and Windows themes remain on existing audit wishes; known checker warnings keep their existing follow-ups.

**Supersedes:** none

**Deferred:** none

## 2026-10-21 — VH-144 — One None reason and readable trim times

**Decision:** None shares one explanation beneath its three locked closing controls, each linked to it; Cut keeps its onset explanation. The two trim rows wrap their buttons before their time fields fall below the existing 12 rem minimum — the smallest change satisfying the two design findings, taken gateless.

**Rationale:** Existing strings and disable rules remain authoritative; visibleClosingReasons groups only their presentation. The closing result is unchanged. The trim-only class leaves onset’s help row alone and introduces no token. Chrome passed three languages, 1280/375/320/640 px, light/dark/forced colours, both video kinds and enabled/disabled field presentations: no horizontal scroll, fields at least 192 px, field/button targets at least 44 px. Notes record evidence and the limits of emulation. Standards: Carbon helper-text grouping and spacing tokens; Nielsen 4 and 8; WCAG 1.3.1 and 2.5.5; house conventions, category regression tests. Real zoom, assistive technology and Windows themes remain on existing VH-138/VH-148 wish lines; known sample and frozen-canon warnings retain their existing follow-ups.

**Supersedes:** none

**Deferred:** none

## 2026-10-21 — PLAN-3 — Phase 3 reconciled and closed

**Decision:** Phase 3 closes with all four planned items shipped: VH-139, VH-140, VH-141 and VH-142. Phase 4 starts with VH-144 because the repeated closing reason and narrow time fields are direct, small user-facing defects; the authorised run continues.

**Rationale:** Reconciled against “Phase 3: what the second audit found”, Items VH-139–142: early-ending files, truthful records and switches, the nine state defects plus V-21/V-22, and the wording corrections all have close entries and trajectory lines. The reserved accessibility statement, date-only card, spec proposals, human checks and unscanned-container warning remain on their existing wish/backlog lines. Local recall before editing scored 8/8 (2,2,2,2): latest closes VH-142, VH-141, VH-148, VH-124 are anchored by their newest close headings in decisions and the Phase 3/Owner’s sign-off trajectory; VH-141’s Show progress decision answers why; wish-list and backlog locate deferrals; PLAN-4’s “Phase 4: what the design pass found” and backlog locate VH-144 and its order. This is local evidence, not a fresh-session handoff. Milestone audit: 14 development findings (10 high, 1 moderate, 3 low), zero runtime findings; the existing V3-HARNESS audit wish covers them, with no dependency change. House conventions: milestone audit and complete ledger. Known checker warnings remain linked as at VH-142’s close. Taken gateless under the whole-run handoff.

**Supersedes:** none

**Deferred:** none

## 2026-10-21 — VH-142 — Save, damage and feedback wording agree with the page

**Decision:** the Chinese save refusals offer saving again, Step 6 uses 制作 throughout, decode-damage wording is future tense with original-recording times, and captured errors name Report this problem. The approved quotation, ellipsis, bracket and terminology corrections ship through the sheet — taken gateless within the item’s form-only scope.

**Rationale:** No writing-review proposal or reserved statement, lede or browser wording is applied. The tool/job terminology uses the existing page vocabulary; Chinese and Malay changes are agent drafts. Regression tests hold the damage tense and time reference, button names, table quotation marks, Chinese ellipses and save meaning. Chrome checks the warning, captured-error guidance, cancelled save and feedback copy in all 18 required combinations. Standards: Nielsen 1, 2 and 4 (state, user language and consistency); Carbon content and error guidance; WCAG 3.1.5 and 3.3.2; house conventions, sheet-generated translations and category tests. The protected spec’s damage row has a proposed correction in the wish-list. The existing campus review, real-corpus and frozen-canon wishes cover human wording review and known checker warnings.

**Supersedes:** none

**Deferred:** none

## 2026-10-21 — VH-141 — State changes retain their meaning and hand focus on

**Decision:** the nine state defects and V-21/V-22 close: result lifetime and warnings survive redraws; translated guidance has its own language; errors and preview failures announce; save focus moves before cleanup; stale blocks and progress withdraw; startup and unreadable replacement say their state. A separate Show progress checkbox hides automatic visual updates, retaining the existing announcement switch — the conservative, gateless reading of WCAG 2.2.2.

**Rationale:** Result warnings belong to the retained file. The failed-save box uses the existing message’s two sentences, with one spoken copy, and clears on retry. Cancel and watchdog failure suppress late stages while keeping terminal replies and safety locks. The watchdog’s stopping message replaces keep-awake advice. New strings pass through the sheet as agent drafts. Chrome checks real codecs and OPFS with controlled reply delays and save failures, plus the 18 language/width/colour combinations; Notes distinguish browser evidence from human listening. Standards: Carbon disabled-field and error-notification patterns; Nielsen 1, 5 and 9; WCAG 2.2.2, 2.4.3, 3.1.2 and 4.1.3; house conventions, regression tests and tokens. The spec proposal and human checks are wish lines. Existing sample and frozen-canon warnings stay covered by VH-139’s corpus and INTAKE’s retirement wishes. The owner’s explicit whole-run instruction takes precedence over the close verb’s compaction stop; subsequent items continue in this sole-writer worktree under the recorded handoff.

**Supersedes:** none

**Deferred:** none

## 2026-10-21 — VH-148 — The owner’s sign-off changes, including the footer

**Decision:** the owner’s thirteen handoff clauses ship: clearer group headings, closing graphics named throughout, separate helper facts, a short read outcome with bold no-sound, hatched cut regions, inset select arrows, Moodle in Smaller’s helper, the shorter statement, Teams and the team email, dashed disabled buttons and 16 px footer headings — because these are the owner’s conditions for VH-124’s sign-off.

**Rationale:** The native selects keep their menus and keyboard behaviour inside an arrow wrapper; `--type-weight-heading` belongs to Carbon’s type roles. The trim uses existing brand surface/divider colours against the kept interactive fill, with contrast pinned at 3:1; forced colours use a solid CanvasText kept section because Highlight is translucent in Chrome. Helper facts are separate spans, preserving language-of-parts markup. The read live region keeps both sentences, with No sound in `strong`; properties keep their figures. Footer labels have no stop, the explicit VH-124 label exception. Feedback and accessibility contacts retain the owner’s address. All changed keys are listed in VH-148’s notes; translations are agent drafts through the sheet. Conservative implementation choices taken gateless under the handoff. Standards: Carbon productive type, native select and tokens; Nielsen 1, 2, 4 and 8; WCAG 1.3.1, 1.4.11, 2.4.9, 2.5.5 and 4.1.3; house conventions, named config destinations and regression tests. Chrome’s 18 combinations passed; human screen-reader and Windows-theme checks remain on the wish line. The existing missing-sample checker warning is covered by VH-139’s corpus wish line. VH-137’s footer-address debt is paid. Retired the wish line “The owner's walk-through of VH-124 judges three readings from the design pass”: all three accepted recommendations ship here.

**Supersedes:** none

**Deferred:** none

## 2026-10-21 — VH-124 — The owner’s walk-through is closed by VH-148

**Decision:** VH-124 closes with VH-148 — the owner signed off the page subject to the changes now implemented, with the three design-pass recommendations accepted.

**Rationale:** The owner’s words are in VH-148’s notes and its handoff; the original state audit remains in reviews/2026-10-01/vh-124. No further signature is inferred. The wider human acceptance walks stay with VH-M4 and the existing wish lines.

**Supersedes:** none

**Deferred:** none

## 2026-10-21 — VH-148 — Codex builds while Claude usage is paused: VH-148, then Phase 3 and Phase 4, each closed by the contract

**Decision:** Codex (`codex exec`, gpt-6-astra) is the writer in `.claude/worktrees/overnight` for VH-148 and then the run's approved items, VH-141, VH-142, Phase 3's close, VH-144, VH-145 and VH-146, each built, checked, closed and pushed by the contract, one at a time; Claude Code writes nothing there meanwhile; the writing review (`reviews/2026-10-21/writing-review-2026-10-21.md`) waits for the owner and is not built — because the owner said in chat on 2026-10-21 "we need to pause claude model usage due to nearly running out for the week. you can continue to blitz chatgpt as lots of usage left".

**Rationale:** The profile's Handoff line has Claude Code execute and Codex review read-only; the owner's word sets that aside for this run only, as the 01:46 word made Codex the project partner. One writer per checkout holds, because the Claude build agent was stopped before it changed a file. A Codex item has no second model's check, so its commit omits the `Checked:` line rather than claiming one. The brief is `reviews/2026-10-21/codex-handoff-2026-10-21.md`. VH-124 closes inside VH-148, on the owner's sign-off in chat on 2026-10-21, quoted in VH-148's notes.

**Supersedes:** none

**Deferred:** VH-148, VH-141, VH-142, VH-144, VH-145, VH-146

## 2026-10-21 — VH-147 — Claude Code sessions run without a project sandbox, as Vinyl Sorting's do; `.claude/settings.json` keeps only the session hooks

**Decision:** `.claude/settings.json` holds only the two session hooks and `autoMemoryEnabled: false`; the project sandbox, its network allowlist, the permission denies and `excludedCommands` are removed, so Claude Code sessions run under the owner's user-level settings as Vinyl Sorting's do — because the sandbox sent headless Chrome, Vite and the walker to the owner's Terminal panel and made every Codex and gh call ask, stalling the audits and overnight runs, and the owner chose Vinyl Sorting's configuration, keeping the hooks, over loosening the sandbox (chat, 2026-10-21).

**Rationale:** The sessions' own words, 2026-10-19 to 2026-10-21 (VH-126, VH-133, VH-138, overnight runs 02–04): the sandbox "cannot start Chrome (singleton socket dir denied), cannot bind ports, and refused curl to localhost". Codex and gh, excluded from the sandbox by V3-HARNESS, went through the permission check, which `autoAllowBashIfSandboxed` does not cover. Item checks through VH-136 never hit this, because `preview_start` and the in-app browser run outside the Bash sandbox; the scripted headless-Chrome walker did. A narrower change (local binding, `127.0.0.1` on the Network line, a scoped Unix-socket path, read-only allow rules for Codex and gh) was drafted, scored and set aside. Vinyl Sorting has no `.claude/settings.json`, only an uncommitted `settings.local.json` of allow rules and a committed `launch.json`; this project now matches it but for the hooks, which stay because rule 1's re-read after a compaction and the context watcher depend on them. What is lost: the read and write denies on the secret folders, the token environment-variable denies, the network allowlist (the profile's Network line is now an instruction to Claude Code sessions, not enforced), and the `curl`, `wget`, `brew`, `npx -y`, `pip install`, `git clone`, WebFetch, WebSearch and cloud-tool denies. How many prompts remain depends on the owner's user-level settings and each session's permission mode, neither of which is in this repository. `tools/harness.mjs` regenerates this file with `--hooks-only` from now on; a full regeneration would restore the sandbox, and needs a decision first. `.claude/settings.intake.json` and Codex's own settings are unchanged. Takes effect in a session started after the commit. Landed on `main` on 2026-10-22, after V31-UPGRADE, by `tools/harness.mjs --hooks-only`, which also carries v3.1's start-notice hook (`tools/handover.mjs`).

**Supersedes:** 2026-10-05 — V3-HARNESS — Codex runs outside the sandbox, like gh

**Deferred:** none

## 2026-10-21 — VH-140 — The record names the card and a video language not the page's; a line says a switch is for the next video; Step 3 says its rule first

**Decision:** the record and the discard question say "a 5-second staff title card" or "a 5-second submission card" and add "Video language: …" when it is not the page's; while a video is made or shown, a line under the switches says a change is for the next video, and the progress names the job's own type and language; Step 3 states its side's rule, with `aria-required` on Submission's fields; the ID's length and count come from config — taken gateless as the smallest change meeting the criteria (Nielsen 1 and 6, WCAG 3.3.2), the Chinese and Malay as the agent drafted them.

**Rationale:** Judgement calls, each the conservative reading: the record names the video language as the setting whenever it differs from the page's, even with no app-drawn words, so it never claims words a video may lack; the job's line under the progress always names both choices and hides with the progress, the record then carrying them; the staff rule shows only while its box is ticked, one line `#title-card-rule` under the box serving both sides; the next-video line `#video-next` sits last in the Video language group and is described by both groups, moving under Video type when the language choice is hidden; "Type one to eight" became "Type up to {max}", a figure from config not being a word; `STUDENT_ID_DIGITS` in `src/config/cards.ts` builds `STUDENT_ID_PATTERN`. Nine strings changed or added in all three tables through the sheet, the Chinese and Malay marked as the agent's drafts. Checked in headless Chrome 155 with the walker's `vh140` scenarios, at 1280 × 900 and 390 × 844 with mobile emulation, in all three languages, staff and submission, each through a running job to its result: 42 states, every line where the criteria put it, `aria-required` on all four fields, no horizontal scroll. Built by a Claude Opus 5.5 subagent, reviewed and checked by the session. UI-STANDARDS rules applied: Recognition over recall, System status, Content and form; the carbon digest's helper-text pattern, tokens only.

**Supersedes:** none

**Deferred:** none

## 2026-10-21 — VH-143 — The owner's word at 09:04 BST: "resume" — the run goes on past 07:00

**Decision:** the overnight run goes on past the 07:00 line: VH-139 merged, Phase 3, Phase 4, then the morning report, each item closed with Codex astra's review — because the owner said "resume" in chat at 09:04 BST, told the run would otherwise stop at the report.

**Rationale:** At about 08:40 BST the owner was told, in their own session, that past 07:00 the run would finish VH-143, write the morning report and stop, and that they should say so if they wanted Phase 3 built today; they switched that session to Claude Opus 5.5 and replied "resume". That session relayed the word verbatim to the third session, whose own chat had the owner's "Resume" on switching it to Claude Opus 5.5 after the Fable usage limit. The overnight prompt's rule gives the owner's word precedence over the 07:00 line when they speak. The profile's Session line is unchanged: a session past it ends at its next close and hands off.

**Supersedes:** none

**Deferred:** VH-139, VH-140, VH-141, VH-142, VH-144, VH-145, VH-146

## 2026-10-21 — PLAN-4 — Phase 4: what the design pass found

**Decision:** Phase 4 is VH-144 (two page defects), VH-145 (the token boundary) and VH-146 (the Submission card's date), in that order, after Phase 3, each with a file; signed off gateless — because the owner's overnight instruction pre-approved PLAN-4, and no Phase 3 item's lines hold these findings.

**Rationale:** The findings answered: V-20 and V-23 by VH-144; V-19 and V-25 (narrowed) by VH-145; V-30 (narrowed) by VH-146. VH-144 goes first: two rank-2 defects every user who reaches them sees, each the smallest change. VH-145 second: a stylesheet-wide change, made once Phase 3's page fixes have landed so no rule is changed twice. VH-146 last: a renderer change that needs `spike-cards.html` re-run. Deferred as wish lines (rule 5): V-18, the frame above step 1; V-24, the statement's lists, to VH-137; V-28's two maintainer's sentences; V-27's form questions for the colleagues; and three readings for the VH-124 walk-through: V-26's footer headings, a disabled button's edge, the stop on a list of links. Nothing in Phase 4 is new design, adds a runtime dependency or edits `docs/`. Taken gateless on the owner's instruction of 2026-10-21 (the VH-143 entry below), the conservative reading being the smallest change that meets each standard with the tokens, components and words the page already has.

**Supersedes:** none

**Items:** VH-144, VH-145, VH-146

**Deferred:** none
