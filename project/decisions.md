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

## 2026-10-21 — VH-143 — The design pass: 13 findings, none at rank 1; five join Phase 3, six become Phase 4, two go to the owner

**Decision:** the design pass stands as `reviews/2026-10-20/design-pass-2026-10-21.md`, V-18 to V-30; V-21 and V-22 join VH-141, V-27 and V-28 VH-142, V-29 VH-140, by dated notes; five become Phase 4; V-18, V-24 and V-26 are the owner's wish lines — taken gateless, because no line should change twice and the owner reserved those three.

**Rationale:** The walk ran all thirteen scenarios in one run (08:31–08:44 BST, after the Mac's sleep from 01:53 stopped the first): seven views, three languages, both switch positions, a card off and on, every closing, 37 cards drawn at four shapes. A token sweep, word counts, a string sweep and nine before-and-after pairs measured it; four Claude subagents read them, the cards, the captures and the source; Codex astra reviewed blind (D-01 to D-05, all verified, mapped to V-19, V-20, V-21, V-22, V-24 and V-27), then critiqued the draft: applied in full but for its ranks — V-27, V-28 and V-29 stay at 3, as the audit's V-16 and V-17 rank naming and form slips that mislead no one; V-25 and V-30 were narrowed, V-26 moved to the owner, and V-27's placeholder spacing left to the colleague. V-23, Malay's 26 px time fields at 320 px, was in the 20 October walk's own digest and missing from its audit. Set aside with reasons: the toggletip's rail (an existing wish line), the switchers' wrap at 320 px (VH-105's choice), the native file input's truncated name, disabled buttons' fill (VH-112's, a wish line for the walk-through), one lock note per locked step, focus on a mouse-started job, the status lines' over-limit rows (a measuring artefact), the cards' worst-case sizes VH-127 decided, "etc." (spec §6), and the failed-state pair (its fixture finished). VH-139's branch (closed at b3b7c2b) is merged at Phase 3's start, as the owner's 09:04 word (the entry above) has it.

**Supersedes:** none

**Deferred:** VH-140, VH-141, VH-142, VH-144, VH-145, VH-146

## 2026-10-21 — VH-143 — The owner's word at 01:46 BST: resume, permission for everything, Codex as project partner

**Decision:** the run continues on the owner's word of 01:46 BST: "resume! you have permission for everything. use the model you think most appropriate and use codex as project partner" — the session picks its model and Codex astra reviews every item — because the owner said so in chat, and the record lacked it.

**Rationale:** Relayed by the run's first session to the second after the second had closed, in its addendum in the sessions' shared folder, and recorded at this, the next close, as the close verb's step 4 asks. Nothing in the overnight instruction changes. The third session began on Claude Fable 5.1; when the Fable usage limit stopped its subagents at about 08:50 BST, the owner said "Resume" and the session went on, and closed, on Claude Opus 5.5.

**Supersedes:** none

**Deferred:** none

## 2026-10-21 — VH-139 — A file that ends early: each track held to its own last declared packet, said before Create and beside the record

**Decision:** a track whose decode stops more than 1 s (`ENDS_EARLY_MARGIN_SECONDS`) short of its own last declared packet in the part kept — that packet's start when its bytes are in the file, its declared end when they are not — has ended early: pre-flight's analysis pass says so of the sound before Create, the encode says so of both tracks beside the record, and the record gives the length made; the Chinese and Malay are the agent's drafts, for the owner's approval — because V-01's file was made and recorded as whole with nothing said, the silent loss the rules call the worst outcome.

**Rationale:** Held to its own track, so a sound that legitimately starts late, stops early or differs from the picture raises nothing; to the last packet's start when its bytes arrived, because an MP4 gives the packet before a hole the hole's length (the PCM test file's `[0.5, 1.5]` before a 1 s hole); to its declared end when they did not, so a cut that took only a long final frame is still a cut; and the packet is found just inside the exclusive out-point, so one starting at it is not kept — the last two from Codex astra's review, each with a failing test, re-checked in Chrome. Only passes that decode the whole kept part can know the tail: pre-flight's analysis pass for the sound (`decodedEndSeconds`), the encode's lanes for both; the 3-second probe and the output check are unchanged. The note gives clock times as decode damage and the trim's fields do ("Its sound stops at 0:20 of 0:30"), not the criterion's "20 s of 30", so the page has one time format; the record reuses `result.keptPart` for the length made ("21 seconds of 30 seconds, from 0:00.0 to 0:21.0"), and the line beside it adds that the last picture is held until a closing when one follows. The discard question joins the record and its lines with the table's sentence gap. Checked in Chrome with the audit's fixture, trimmed and not, with and without a closing, the whole and silent controls, and the made file read back at 21.0 s of picture; Matroska and WebM cut short declare only what is readable, so the check cannot see them (wish line). Standards applied (rule 8): Nielsen 1, 4 and 9; WCAG 4.1.3, the note and line announced with the verdict and the ready status; UI-STANDARDS System status; Carbon's inline notification, reused; house rules: numbers in `src/config/`, fail loudly on data loss, units in identifiers, tests by category, no new dependency. Item file: VH-139, with the drafts and Codex astra's findings.

**Supersedes:** none

**Deferred:** none

## 2026-10-21 — VH-143 — The owner's overnight instruction: a design pass, then Phases 3 and 4, gateless

**Decision:** the overnight run is authorised and gateless: VH-143, the design pass, then Phase 3 (PLAN-3, approved) with VH-139 merged from its own session, then Phase 4 (PLAN-4, its sign-off pre-approved), then the morning report; wherever the record or a verb would stop for the owner, the session takes the conservative choice, records it as taken gateless, and carries on — because the owner said so in chat on 2026-10-21.

**Rationale:** The owner's words, quoted: "provide a prompt that will conduct a whole design pass, then implement the implementation phases, I will approve use of fable with extra effort. it needs to be gateless as I am going to bed, and I hope it can be ready in the morning"; earlier the same night: "approve PLAN-3 and start VH-139". The prompt they produced is kept verbatim as `reviews/2026-10-20/overnight-prompt-2026-10-21.md` and is the run's instruction. Conservative means the smallest change that meets the standard, existing components, tokens and words before new ones, and nothing the owner has reserved: the three switchers above step 1 and folding (VH-97), the sign-offs of VH-124 and VH-113, VH-137 and V-09, the date-only title card, and anything the brief's Direction does not cover — each becomes a `[!]` or wish line with a recommendation. Hard limits: no new runtime dependency; `docs/*.md` never edited; the EBU harness re-run if a protected audio file changes; no test deleted, skipped or weakened; nothing written to `samples/`; nothing destructive; never a push or merge to `main`, which publishes the pilot. New Chinese and Malay strings are drafted as machine translation, as the VH-122, VH-127 and VH-128 decisions did, and listed in the morning report for approval. The work is on branch `claude/overnight-design-and-phases` in the worktree `.claude/worktrees/overnight`, from VH-138's close (5f23af6); each session that passes the profile's Session line closes with a hand-off note in `reviews/2026-10-20/` and a Session-end line, and starts the next session itself. After 07:00 UK time no new item starts.

**Supersedes:** none

**Deferred:** none

## 2026-10-21 — PLAN-3 — The owner signs off Phase 3, and VH-139 starts

**Decision:** PLAN-3 stands as recorded and VH-139 runs now; VH-140 starts only on the owner's next word — because the owner said "approve PLAN-3 and start VH-139" in chat on 2026-10-21.

**Rationale:** The words reached this session through the VH-138 session that planned the phase, which started VH-139 in its own worktree from VH-138's close (5f23af6, branch `claude/nifty-jepsen-850e8e`, not yet merged to `main`) and set that the session stops after VH-139. The sign-off covers the plan's order and items as PLAN-3's entry lists them; it is not a standing word like PLAN-2's, so open questions in later items still go to the owner.

**Supersedes:** none

**Deferred:** none

## 2026-10-21 — PLAN-3 — Phase 3: what the second audit found

**Decision:** Phase 3 is VH-139 (a file that ends early), VH-140 (the record, the switches, Step 3's rules), VH-141 (nine small page defects) and VH-142 (the words), in that order, each with a file carrying its findings' clauses, run only on the owner's sign-off — because the 20 October audit found two rank-1 and thirteen rank-2 shortfalls against the 1 October standard, all the page's to fix but the date-only card, which is the owner's question.

**Rationale:** the findings answered: V-01 by VH-139; V-02, V-05, V-06 by VH-140; V-03, V-04, V-07, V-10, V-11, V-12, V-13, V-14, V-15 by VH-141; V-08, V-16, V-17 by VH-142. Deferred as wish lines (rule 5): V-09, the statement's contradictions, to the owner's VH-137; the date-only card as the owner's question; the spec's §7.2, §5.4 and §9.3 corrections, which the owner approves; the person's checks the audit could not make; A-14's unscanned-container wording. VH-139 goes first because it is the one rank-1 finding the page can fix without a design decision (V-02's fix is a wording change but shares VH-140 with the switches' line). Direction: Phase 3 brings the page back to the 1 October standard on its new surfaces; nothing in it is new design, and VH-124 and VH-113 stay the owner's to sign off. The plan is written so another harness could run it from the record: each item's file names its clauses, sources and evidence.

**Supersedes:** none

**Items:** VH-139, VH-140, VH-141, VH-142

**Deferred:** none

## 2026-10-21 — VH-138 — The page audited again: 17 findings, two at rank 1, with the ranks and tables as Codex astra's critique left them

**Decision:** the audit stands as `reviews/2026-10-20/`: 17 findings, 2 at rank 1, 13 at rank 2, 2 at rank 3; 20 of 25 UX findings hold, 10 of 20 spec findings, 16 of 29 states; all 86 WCAG criteria judged live; the item is VH-138 and the plan PLAN-3, not the brief's VH-133 and PLAN-2 — because main already held those IDs when the session opened (rule 3), and because every finding was reproduced live or verified in source and then argued against by Codex astra before commit.

**Rationale:** the method is the 1 October one, rebuilt: headless Chrome 155 over CDP, real file input, drags, keys and touches, a stub save dialog writing into OPFS, ffmpeg fixtures only, in three languages, both switch positions, with and without a card, every closing, at 1280, 390 and 320 px, a 640 px stand-in for 200%, text spacing, light, dark and forced colours; Codex astra blind from the same brief, then an adversarial critique in three parts (one call could not finish inside the sandbox's ten-minute cap). The walker and digests are kept in `evidence/measurements/` because the critique showed the bundle was not self-contained without them. The sandbox could not start Chrome or bind a port, so Chrome and the walker ran in the owner's Terminal panel; `codex` ran through the settings' exclusion only as a plain command with the brief inline. Applied from the critique: V-02 (the record) restored to rank 1, since "Previous video" names only a different file; V-11 (a previous video's warnings lost) and V-12 (focus dropped at a save's completion) added from source; V-13, V-14 and V-15 raised to rank 2 as status breaches; V-01's standard narrowed (§13 criterion 2 is loudness) and its direction rewritten around each track's decoded extent, the probe unable to certify the tail; V-04 extended to every re-draw and its 3.2.4 citation dropped; V-07 marked reproducible with a long draft; V-08 as a house rule, not WCAG 3.2.4; V-09's two over-claims removed (an unreturned workbook does not show no one is reading; only the reading-level gate is English-only); V-10 given a live route that exists before a file is read and the focus point; V-17's source corrected to `failure.captured`; the WCAG rows for 1.4.4, 1.4.8, 2.1.1, 2.4.13, 2.3.3, 2.5.2 and 3.2.4 narrowed to what the method shows, the §9.3 list split into four kinds, the statement rows qualified (announcements present, screen readers unverified; the reading gate's reach; colleagues' review unconfirmed; UoN omitted; WAVE owner-reported); the regression totals recounted; U-01 marked unverified here; A-05 and states 18 and 19 regressed; U-24 and A-17 as new breaches; A-18 and state 09 as accepted deferrals; states 06, 12, 21, 22, 25 and 29 corrected; the missing recovery states added as source-only rows; the heights given their conditions; the verdict's "every" claims narrowed. Withdrawn at the critique's objection: the first draft's V-02, a date-only card as a defect, because spec §9.1 step 3 fills the date and refuses only a card with nothing on it, which `isCardEmpty` implements; it is the owner's question, a wish line. Refused: raising V-16 (the damage note's tense) to rank 2, since the body says "will" and the harm is polish; the unreadable-replacement path as a finding of its own, unobserved here and carried in VH-141's clause instead. Standards applied (rule 8): the WCAG 2.2 AAA digest's 1.4.6, 2.5.5, 2.4.13, 2.1.3, 2.2.4, 1.4.8 and 3.3.6 lines; Nielsen's 1, 4, 5 and 6; Carbon's interaction states and one primary per state. The brief's note that VH-116 might change the time estimate was moot: VH-116 had closed. VH-124 and VH-113 are not closed by this item; the bundle is evidence for the owner's walk-through.

**Supersedes:** none

**Deferred:** none

## 2026-10-20 — PLAN-2 — Phase 2 closes with VH-136; no unblocked item follows, so the next is the owner's

**Decision:** Phase 2 closed on 2026-10-20 with every PLAN-2 item shipped, its backlog heading now "Phase 2 — … — CLOSED 2026-10-20"; no open, unblocked line remains in Current or Next, so the owner names the next item, and PLAN-2's standing word, given for this phase only, ends with it — because VH-17, VH-124, VH-113 and every Standing line wait on the owner, and Next's VH-13 waits on VH-M2.

**Rationale:** Reconciled against PLAN-2's Items (VH-133, VH-134, VH-135, VH-136): each has its line under Phase 2 in project/trajectory.md, and none is open in project/backlog.md; PLAN-2's deferral, VH-137, sits under Standing, due 2026-11-18. Recall, local (this session, from the record alone, not a fresh session): 1, project/trajectory.md under Phase 2, newest first: VH-136, VH-135, VH-134, VH-133 — 2; 2, "2026-10-20 — VH-133 — The returned workbook's changes are Google's re-run, not corrections; nothing is merged", because every changed cell is still an unedited GOOGLETRANSLATE formula on unchanged English — 2; 3, deferred: VH-137 under Standing in project/backlog.md, project/wish-list.md's open lines, this phase's among them (VH-135's and VH-136's person checks), and the backlog's Icebox — 2; 4, no next open item: Current and Next hold only lines blocked on the owner, as this entry records — 2.

**Supersedes:** none

**Deferred:** none
