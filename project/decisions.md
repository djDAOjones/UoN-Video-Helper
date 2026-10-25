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

## 2026-10-25 — VH-194 — Spec §9.3 and UI-STANDARDS take Phase 7's five corrections, S26 to S31, U1 and U2, verbatim

**Decision:** Spec §9.3 counts a CJK glyph as two, hands focus on by the transition, narrows the thumbs' person-only check, records the file chooser's exception and names "Announce progress"; UI-STANDARDS adds a larger default font to 2.4.13's conditions. Documents only, as the owner approved the sheet.

**Rationale:** The owner approved the wording sheet on 2026-10-24, "all seems good." (PLAN-8 — the sheet approved), promoting VH-177.1 to VH-177.5. Each old text matched once with its wrapping ignored, and each new text is in place word for word. The ledger's count takes the spec from 8,074 to 8,100 of 8,100 and UI-STANDARDS from 2,400 to 2,393 of 2,400, as the sheet said. The readability test's list and the statement were read against S29 and S30: neither is contradicted, but two gaps are wish lines, VH-194.1 (§9.3's "holds this list" now follows the file chooser, which the test does not hold) and VH-194.2 (the statement names only the Chinese and Malay pages for the file chooser). Codex astra: "Commit", with no musts (`reviews/2026-10-24/codex-astra-vh194-check-2026-10-25.md`). Digest rules applied: WCAG 2.2 AAA, every exception recorded (2.5.3) and focus appearance's conditions (2.4.13); Nielsen 3, focus handed on, never taken.

**Supersedes:** none

**Deferred:** VH-197

## 2026-10-25 — VH-193 — A warning with the finished video when levelling needed over 3 LU of limiting, measured in the job; first, and unchanged after a save

**Decision:** The plan carries the limiter's measured bite, unrounded: the unlimited chain plus the solved gain, less the last limited pass before the codec. Over `HEAVY_LIMITING_LU` = 3, the finished video shows B11's warning, first among its warnings and spoken with it, and a save leaves it as it is (the owner's 1A and 2A). Spec §5.4 takes S25 and S32.

**Rationale:** The owner on the open points, verbatim: "1A and 2A: heavy limiting first, before the metadata warning; after a save the warning stays as it is, with no new words". The solver returns the gain it last measured, so the last limited pass ran at that gain (`gain-solve.ts`). A non-finite pass gives no bite. `detectProductionWarnings` returns the post-processing warnings in that order, and the pipeline's `outputWarnings` carries them through the worker as before. Measured in Chrome (`reviews/2026-10-24/vh193-heavy-2026-10-25.md`): the Teams recording bites 7.94 LU and warns. Every lecture, edited piece and phone clip bites 0.00 to 2.42 LU and does not. Three files have no audio and five branding assets have no audio stream. C0413.MP4, an unedited studio interview camera original with a 19.2 LU range, bites 5.17 LU and warns. It went to the owner under the item's criterion, and his answer, verbatim: "it's not typical, so ship as is". The matrix passed 36 of 36, the under-threshold cells 3 of 3, and the completed-save flows 3 of 3. The Chinese and Malay rows are agent drafts. Codex astra: "Commit after the musts below". Its three musts are done: the evidence; the corpus walker's rounding, skips and silent jobs; and a save proven complete. Its translation flags are taken. The rest is wish lines VH-193.1 and VH-193.2 (`reviews/2026-10-24/codex-astra-vh193-check-2026-10-25.md`). Digest rules applied: Nielsen 1 (the cost of processing is visible before the save) and 9 (a cause and a way forward, without blame); Carbon's existing notification pattern, with no new control; WCAG 2.2 AAA 4.1.3 (the warning is spoken with the result); house conventions, numbers in `src/config/`.

**Supersedes:** none

**Deferred:** VH-194

## 2026-10-25 — VH-192 — The finished video plays in its card while it is unsaved, after the card's lines and before the lifetime line and Save

**Decision:** The finished card holds the browser's own player over the job's working file, named by the card's title, loading metadata only and never autoplaying, with no new words (B10). It stays while the video is unsaved, a "Previous video" and a download included, and leaves the card once a save completes, before the clean-up removes its file. Spec §9.1 and §9.3 take S20 and S21.

**Rationale:** Q3, the owner's answer: "proceed with your recommendation", option A, a plain player in the finished card. On the two open points, verbatim: "1A and 2A: the player shows only while the video is unsaved and leaves the card once a save completes; it sits after the card's lines, before the lifetime line and Save". One player and one object URL are made per job, over the OPFS `File` the save reads, so nothing is read whole. They are reused when the same job re-renders ("Keep it", another file chosen) and released (pause, `src` dropped, URL revoked) on Discard and before a completed save's `discard`. Focus on the player then goes to the card. A closed tab's URLs end with the document; a `pagehide` revoke would break a restore from the back-forward cache. The save's clean-up rule is unchanged. Focus at a job's end stays on the card (VH-178). Nothing reads the player: a failed playback leaves the result, Save and the record as they were. Media (1.2.x, 2.3.x): the added title or submission card is one still picture over silence, and the closing graphics are silent with their recorded cut, fade or slide. Neither adds a flashing mechanism, and their words are chosen on the page. They sit under S21's accepted limitation, which does not claim 1.2.x conformance. The statement's preview-only line is wish line VH-192.1. Chrome: `player-192.mjs`, 36 matrix cases and 9 flows (`reviews/2026-10-24/vh192-player-2026-10-25.md`). Codex astra: "Commit after the musts below". Its three musts are done (the close, this media assessment, and a check that the player plays the new video, not the original), and its shoulds are taken in part, the rest going to VH-198 as wish line VH-192.2 (`reviews/2026-10-24/codex-astra-vh192-check-2026-10-25.md`). Digest rules applied: WCAG 2.2 AAA's media line (1.2.x under S21's recorded exception) and 2.4.3 focus order; Carbon, no autoplay and the notification's existing spacing tokens; Nielsen 1 and 3 (see the result, and leave it before saving); house conventions, streaming everywhere.

**Supersedes:** none

**Deferred:** VH-193

## 2026-10-25 — VH-191 — Video language moves to the top of step 3, before the title card choice, and locks with step 3; the next-video line is Video type's alone

**Decision:** The Video language choice moves from under Video type to the top of step 3, under its heading and the lock note and before the title card choice, outside that group. It stays in view with the card off or on and on a student submission. It locks with step 3 while a video is made or saved. `#video-next` moves into Video type with B9's words as `videoKind.nextVideo`, and `videoLanguage.nextVideo` is gone. Spec §9.1 takes S19.

**Rationale:** Q4, the owner's answer: "proceed with your reccomendation", which was option 1, Video language into step 3. On the placement, his words, verbatim: "A: Video language at the top of step 3, under the heading, before the title card choice". The fieldset moved unchanged: the same native radios, label, accessible name and keyboard. It keeps its remembered pick and follows the page's language until someone picks one. `applyControlLock` disables it beside `titleCardChoice`, so a save, a cancel and a failure free it on the same path. The line that moved `#video-next` under Video type when the language choice was hidden is gone. A page-language change during a job still moves the shown choice when nobody has picked one, as the date field in the same locked step already does, while the job keeps the language it started with. Codex astra called that "required by the retained 'until picked' contract". Both English strings were graded first: 6.7 and 3.8. The Chinese and Malay rows are agent drafts, marked as such. Chrome: `lang-191.mjs`, 36 matrix cases and 6 flows (`reviews/2026-10-24/vh191-lang-2026-10-25.md`). Codex astra: "Commit after the musts below". Its two musts, a whole-sentence check of the result's language and this close, are done, and both shoulds were taken (`reviews/2026-10-24/codex-astra-vh191-check-2026-10-25.md`). This supersedes VH-132 in placement and locking only, as PLAN-8 records. Digest rules applied: Nielsen 2 (the choice sits where its words are used) and 5 (two look-alike switches told apart); WCAG 1.3.1 and 3.3.2 (legend and helper tie to the group), 2.1.1 (native radios), 2.5.5 (44 px); Carbon, the existing segmented control and type roles.

**Supersedes:** none

**Deferred:** VH-192

## 2026-10-25 — VH-182 — The footer's routes grouped by need under "Help and feedback"; Send feedback renamed Report a problem, and problem reports go to the learning content team

**Decision:** The footer's routes sit under one `h2`, "Help and feedback", in three groups, each an `h3` question: staff's Creators team and students' Self Service links; the Report a problem button; the feedback form. The group stays unboxed in the band, as the links were, following the owner's standing rule that the app adds no control. `FEEDBACK_ADDRESS` is the learning content team's, the email link to it leaves the footer, and the button, dialog, five errors and statement take the sheet's words.

**Rationale:** The words are the sheet's VH-182 rows and Q7 option 1, with the owner's changes. Every new English string was graded first and all pass; `statement.contact.text` is the highest at 9.5. Hand-over 8 asked whether the group should be unboxed or a panel like the two disclosures. The orchestrator answered: unboxed, since a panel or disclosure would add a control. The group is a `div`, so the footer gains no landmark. Its `h2` takes the panel heading role and its `h3`s the section heading role, so no new token is needed. `SELF_SERVICE_URL` is new and `LEARNING_CONTENT_TEAM_ADDRESS` is gone. The statement's contact follows `FEEDBACK_ADDRESS`, and "About this statement" still names Joe Bell. The README gains a "Help and feedback" section listing the four routes. Spec §9.2 and §11 take S22 and S24, which carry VH-160.1; the spec stays within 8,100 words. The Chinese and Malay rows are drafted by the agent and marked so. Chrome: `footer-182.mjs` passes 36 matrix cases and 3 flows (`reviews/2026-10-24/vh182-footer-2026-10-25.md`). Codex astra: "Commit after the musts below". Its must was this close. All three shoulds were taken: exact URLs, accessible names, target widths and the container in the walker, and the dialog's no-script intro. Digest rules applied: WCAG 2.4.9 (each link says alone where it goes), 2.4.10 (section headings) and 2.5.5 (44 px targets); Nielsen 4 (one name per route) and 10 (help findable in one place); Carbon, the existing type roles.

**Supersedes:** none

**Deferred:** VH-191

## 2026-10-25 — PLAN-8 — Phase 8 ends with a third full design, UX and accessibility pass, VH-197 to VH-203, in Phase 7's stages, before VH-195 closes it

**Decision:** After VH-194, Phase 8 runs a third pass as thorough as Phase 7's: plan, re-proved instruments with Codex astra's blind review, the evidence run, judging, the merged report, the fix plan, and the fixes with an after-run and integrated check. VH-195 keeps only the close, as VH-177 did. The owner asked for an analysis "as thorough as before".

**Rationale:** The owner asked: "does phase 8 include a concluding analysis of design, UX, and accessibility? It should include one equivalent to that which started that work, to ensure things are all good. add to the backlog if needed (it must be as thorough as before)". It did not: VH-195 held one walk of the four journeys and one Codex check, against Phase 7's eight stages (VH-170 to VH-177). The work that started Phase 8 is Phase 7's second pass, whose wish lines and held-back findings Phase 8 builds; so VH-197 to VH-203 repeat VH-170 to VH-176 one for one, item file to item file, on the Phase 8 build, as `design-pass-3`. Two things are new: a Phase 8 contract replaces the six-fix contract, one row per Phase 8 item plus Phase 7's fixes VH-178 to VH-181; and the walker gains the elements Phase 8 added (the native player, the second toggletip, the footer's headings, the limiting warning, Video language in step 3), with one more planted failure for the player. The matrix is no smaller than VH-172's run, the "before" the owner meant; any further reduction is the owner's call. VH-195's walk and integrated check move into VH-203's after-run and check, and it takes VH-177's close criteria. VH-172.1's 641 unrun cells stay a wish line, unchanged. The backlog stands at 996 of 1,000 words after these lines.

**Supersedes:** 2026-10-24 — PLAN-8 — Phase 8, the owner's UX pass: thirteen pieces, VH-182 to VH-195, one wording sheet; Q5 to Q7 worked out in round 2

**Items:** VH-182, VH-183, VH-184, VH-185, VH-186, VH-187, VH-188, VH-189, VH-190, VH-191, VH-192, VH-193, VH-194, VH-196, VH-197, VH-198, VH-199, VH-200, VH-201, VH-202, VH-203, VH-195

**Deferred:** VH-197, VH-198, VH-199, VH-200, VH-201, VH-202, VH-203

## 2026-10-25 — VH-190 — "Create the video again" beside the chosen file's finished video; beside a "Previous video" it reads "Create the video"

**Decision:** Create reads B8's `create.again`, "Create the video again", while a finished video made from the file now chosen is on screen, saved or not; at every other time, a "Previous video" included, it reads "Create the video", the owner's choice A. One helper, `labelCreate()`, sets it at boot, on a language change and on every change of the result's state. The emphasis rule and the discard question are unchanged.

**Rationale:** B8 says "used while a finished video is on screen", which read literally also covers an unsaved video left as "Previous video — {size}" after another file is chosen, where Create makes a different video. A and B went to the owner through the orchestrator. His words, verbatim: "A: "Create the video again" only while the video on screen was made from the file now chosen; beside a "Previous video" it reads "Create the video"". So the label reads `resultOfChosenFile()`, apart from the emphasis rule `resultOnScreen()`, which keeps Create secondary beside any unsaved video, as before. Codex astra: "Commit after the musts below". Its musts: a saved result made again and then failed or cancelled kept "again", so `beginJob` now relabels after clearing the result; a saved previous video read differently from an unsaved one, which A settles; and the walker's checks were strengthened. `savedResultFor` moved up beside `unsavedResult` so the boot call can read it. Spec §12's "Create the video" names the first press; the sheet lists no correction for B8. Chinese and Malay drafted by the agent, in `result.endedEarly.next`'s own words. Chrome: `again-190.mjs` (`reviews/2026-10-24/vh190-again-2026-10-25.md`). Digest rules applied: Nielsen 1 (the button says what it will do now) and 5 (the discard question kept); WCAG 2.5.3 and 4.1.2 (the accessible name is the label), 3.2.1 (a relabel moves no focus); Carbon, one primary per state, unchanged.

**Supersedes:** none

**Deferred:** VH-182

## 2026-10-25 — VH-196 — The lede's five promises in the owner's words, and a "?" beside "Saves in a reliable format." that explains MP4

**Decision:** The lede lists the owner's five promises. Beside the fourth, a "?" toggletip named "About the video format" holds his MP4 hint, wired with the onset "?"'s own code (`wireToggletip`). MP4's recorded meaning also accepts the hint's own "an MP4, the most interoperable video format", the owner's choice A. The spec needs no correction: it describes no lede.

**Rationale:** The hint passed the reading grade (5.3) but failed the abbreviation check in `index.html`, whose text has no ".mp4". Options A, B and C went to the owner through the orchestrator. A was recognise the hint's apposition, B was no no-script English for the tip, and C was a reword. His words, verbatim: "A, and accept "About the video format" as the "?" name". So `MEANINGS.MP4` in `test/readability.test.ts` is `/\.mp4|an MP4, the most interoperable video format/`, tight to that phrasing, and nothing joins `EXCEPTED`. The name was the build's proposal, 4 words, ungraded. The orchestrator asked for a spec correction "in the S17 area", but `docs/01-specification.md` holds no lede or promise list, and S17 is the browser note. The orchestrator then said this was its mistake, so no promise list is added to the spec. The file button moves down 68 to 116 px, about where it was before VH-187 raised it. At 1280 by 900 in English it is still in the first screen (`reviews/2026-10-24/vh196-lede-2026-10-25.md`). Chrome: `tip-196.mjs` 36 of 36, `tip-184.mjs` 36 of 36 (the onset "?" unchanged), `top-187.mjs` 99 of 99. At 32 px text, 375 and 320 px overflow from the video type's segments and the statement's heading, not the lede (VH-189.1). Chinese and Malay drafted by the agent. Codex astra: "Commit after the musts below". Its must, the walker's whitespace pattern, was checked and the walker re-run, and its may to pin the whole hint was taken. Digest rules applied: WCAG 2.1.1 and 4.1.2 (a button that discloses by keyboard, with its state and name), 2.5.8 and 2.5.5 (44 px), 3.1.4 (the abbreviation's meaning beside it); Nielsen 10 (help in place, on demand); Carbon, the existing toggletip pattern and tokens.

**Supersedes:** none

**Deferred:** VH-190

## 2026-10-25 — VH-196 — raised: the lede's five promises in the owner's words, and an MP4 hint beside promise 4, his own exception to the no-new-control rule

**Decision:** Phase 8 gains VH-196, built next, before VH-190. The lede's list becomes the owner's five promises, verbatim: "1. Lets you trim unwanted footage from the start and end. 2. Adds opening and closing graphics. 3. Evens out the audio level for better audience experience. 4. Saves in a reliable format. (?) 5. Makes the file the right size for your purpose." The "?" is a toggletip in the onset toggletip's pattern, holding the hint he accepted. It is a new control, his own request.

**Rationale:** He raised the gap himself: "the intro text mentions all the features except for the trimming - users, especially novices, will be suprised by it". On the hint: "I want to keep mp4 and interoperable." Its text, proposed by the orchestrator and accepted by him: "Videos come in many formats. Some play on one device but not another, or do not work with some apps. This tool saves your video as an MP4, the most interoperable video format. That means it plays on almost any phone, computer or website." His revised set supersedes his earlier "final set". Promise 3 also replaces VH-187's "Levels audio for consistent listening experience." Every line passes the readability gate (2.5, under 8 words, 8.9, under 8 words, 2.3; the hint 5.3). His words and the full exchange are in orchestrator #3's notes, `plan8-owner-words.md`, "VH-196" and "VH-196 revised". Phase 8's rule is that the app stays simple, with no control beyond the approved sheet; the "?" is the owner's exception, asked for in his own words: "I also wouldn't mind a question mark with hover hint that explains the problem with variety of formats". It discloses on click, Enter or Space, never by hover alone, as VH-124 and VH-184 settled for the onset "?".

**Supersedes:** 2026-10-24 — VH-187 — The top of the page: plain promises, the owner's promise 2, the browser note only when a check has not passed

**Deferred:** VH-196

## 2026-10-25 — VH-189 — Step 4's labels in the result line's plain words; below about 400 px the "?" sits beside "Plays over"

**Decision:** Step 4 takes B7's words: "No closing graphics", "Plays over", "The last second of video" and "A held last frame", the "?" named "About what the graphics play over", and "Not used without closing graphics."; spec §4.3 takes S11 to S16. Below about 400 px the "?" moves up beside the label, CSS only, as the owner chose: "Yes — option 2: below about 400 px, the "?" moves up beside the label ("Plays over [?]")".

**Rationale:** On 7632411, with the "?" beside the onset select, the select left 116 px for text at 320 px. The old "Over generated freeze frame" was clipped at 375 and 320 px, and the new "The last second of video" (152 px) was still clipped at 320 px. Three options went to the owner through the orchestrator. Under `@media (max-width: 25rem)` the onset field is a grid and `.control-with-help` is `display: contents`, so the select gets the field's whole width: 168 px at 320 px. The markup is unchanged, so the focus order stays the select, then the "?", then its text. The Malay draft for A held last frame became "Bingkai akhir ditahan" so that it fits. Every new English string was graded before the build and all pass. 72 Chrome cases pass (`reviews/2026-10-24/vh189-labels-2026-10-25.md`): labels match their accessible names, every option fits, the "?" is in its place on each side of 400 px, Tab and Escape behave, and the tip opens under the select. Codex astra: "Commit after the musts below"; its musts are done: the walker asks the page's own query (25rem follows the text size), a 32 px text run is recorded, and this close. Its two mays, a sheet note and a test description, are taken. With 32 px text, every select clips at 401 px and below, the type select included: that is beyond 1.4.4 and 1.4.10, and it is wish line VH-189.1. Digest rules applied: WCAG 2.5.3 (label in name) and 1.4.10 (reflow, no clipped value at 320 px); Nielsen 2 (the user's words, as the result line already says them).

**Supersedes:** none

**Deferred:** VH-190

## 2026-10-24 — VH-188 — The outputs named for what each is and is for; short forms for sentences and the record, which drops the purpose

**Decision:** The two outputs take B6's names and details, "High quality, for publishing" and "Smaller file, for assignments and sharing", in `index.html`, the tables and `PRESETS[id].label`. Sentences that name one take new `preset.inSentence.*` ("high quality", "the smaller file"). The record's `{output}` takes new `preset.inRecord.*` ("high quality", "a smaller file"), without the purpose, as B6 allows. Spec §6, §9.1, §10 and §13 take S1 to S10.

**Rationale:** With the purpose, the record read "…from 0:30.0 to 2:30.0, a smaller file, for assignments and sharing, the white closing graphics…": its comma list of part, output and closing gained what reads as a fourth item. Every new English string was graded by `readingGrade` before the build, and all pass (most are under the eight-word prose threshold). The four sentences that name an output are composed in three languages and checked in Chrome; the slides line needs a high-bitrate screen recording no fixture is, so its unit test draws it. Two Chinese sentences lost the quotation marks or spaces round `{smaller}`, now words in the sentence. 45 Chrome cases pass (`reviews/2026-10-24/vh188-preset-2026-10-24.md`); the longer English name takes two lines at 375 and 320 px. Codex astra: "Commit after the musts below"; its musts, a stale comment in `index.html` and this close, are done. Digest rules applied: Nielsen 2 (the user's words: what the file is and what it is for) and 4 (one name per output, one short form per use).

**Supersedes:** none

**Deferred:** VH-189

## 2026-10-24 — VH-187 — The top of the page: plain promises, the owner's promise 2, the browser note only when a check has not passed

**Decision:** The lede loses its lead-in, and its promises and `app.description` take the sheet's B4 words, but promise 2 is the owner's own, "Levels audio for consistent listening experience." The browser note shows `browserNote.notPassed` only when a check fails or warns, which outranks a check still pending; otherwise it is hidden, and `pending` and `passed` are gone. Spec §10 takes S17 and S18.

**Rationale:** The sheet's promise 2, "Levels the audio for a consistent listening experience.", scored grade 11.1 against `test/readability.test.ts`'s limit of 10. Asked through the orchestrator to choose between an exception (A), his original words (B) and "a steady listening experience" (C), the owner chose B, verbatim: "Levels audio for consistent listening experience." At six words it is under the test's prose threshold, so no exception was added. `browserNote` returns null when nothing is to be said, and `#browser-note` starts hidden and empty. A page without scripts now says nothing about Chrome above step 1; the statement still says the tool is built for Chrome, and nothing runs without scripts anyway. On a passing load the file button rises 80 to 128 px in three languages at four sizes, never lower, and 99 Chrome cases pass (`reviews/2026-10-24/vh187-top-2026-10-24.md`). The VH-153 test that compared the three sentences now checks the one left. Codex astra: "Commit after the musts below"; its must, this close, is done, and its may on a comment's timing is applied. Digest rules applied: Nielsen 1 (status said where it is true, not twice) and 8 (nothing above step 1 that is not needed); WCAG 3.1.5 by the readability gate, and 1.4.10 re-checked at 320 px.

**Supersedes:** none

**Deferred:** VH-188

## 2026-10-24 — VH-186 — The System check's labels shortened, a fact not read said with a capital alone, the unchecked caption warning completed

**Decision:** The four System check labels take the sheet's B1 words; Video properties says a fact it could not read as "Unknown" or "Less than a second", from new keys `format.alone.*`, and every sentence keeps the lower-case form; the unchecked caption warning goes on with the scanned one's caption passage. A trim handle's spoken place stays lower-case beside "the beginning" and "the end".

**Rationale:** The sheet's B1 to B3, approved by the owner. The four format helpers take an optional `Placement` (default in a sentence), and only `buildRows` passes `'alone'`; every call site is listed in `reviews/2026-10-24/vh186-words-2026-10-24.md`. The build's check of `estimateWords` found a non-finite estimate would say "about unknown", so it now says the existing sentence without a time. The Chinese and Malay are the agent's drafts, marked in the filled sheet. At 320 px the English labels take 2, 3, 2 and 2 lines, from 4, 4, 3 and 3. 72 Chrome cases pass. Codex astra: "Commit after the musts below"; its musts, `formatApproximateDuration` in the call-site list and this close, are done, and two comments that named the handles were corrected. The worker row's break inside its words at 320 px is a layout defect, left as VH-186.1.

**Supersedes:** none

**Deferred:** VH-187

## 2026-10-24 — VH-185 — A kept sound shorter than the meter's 400 ms block is no sound: a silent job, said before Create

**Decision:** A trimmed part whose decoded sound is shorter than `BLOCK_SECONDS` (now exported from `src/audio/loudness.ts`) is a silent keep: pre-flight shows the existing "This video has no audio" and the job runs with no audio track, so the output check no longer refuses it after the encode. Untrimmed files are out of scope, unchanged, as wish line VH-185.1.

**Rationale:** VH-139's case (sound from 4 s, kept 0:00–0:04, 21 ms of AAC priming) failed "invalid-measurement" after the whole encode. `traverse` now counts decoded, kept frames apart from gap-fill; `analyseSourceAudio` and `planAudio` return a `KeptSilence` carrying the decode's end, because returning `null` made pre-flight say "The file ends early … at 0:00" in place of no-audio, and the result would have said the same. The untrimmed guard stays as an earlier Codex review set it, since the item and its case are a trim's and the no-audio words are unproven for a whole short track. The output carries no audio for the sliver. Tests reproduce the case and failed before the fix; 400 ms and more still levels; the EBU harness passes unchanged. 42 Chrome cases pass (`reviews/2026-10-24/vh185-sliver-2026-10-24.md`). Codex astra: "Commit after the musts below"; its must, that pre-flight and the job judge different ranges (the job's cuts sit on frame edges), is fixed by one `keptRangeOnFrames` for both, with a regression test and 9 Chrome cases re-run.

**Supersedes:** none

**Deferred:** VH-186

## 2026-10-24 — VH-184 — The onset toggletip closes when focus moves on, and is edged as help, not a notification

**Decision:** Focus arriving anywhere outside the "?" and its text closes the toggletip, so Tab and Shift+Tab never leave it open; Escape closes it and returns focus to the "?" unless focus is on a control elsewhere. Its edge becomes 1 px all round in the existing `--border-subtle`, not the notification's 4 px rail.

**Rationale:** The rules live in `src/ui/toggletip.ts`, tested with stand-ins. On the base, Tab and Shift+Tab left it open. After, 36 Chrome cases (three languages, 1280, 375 and 320 px, four colour modes) pass: Tab and Shift+Tab reach the same control as with it closed, a click on its text keeps it open, a click elsewhere closes it; the edge is 4.08 and 3.91:1 in light, 4.71 and 5.53:1 in dark, 21:1 forced (`reviews/2026-10-24/vh184-toggletip-2026-10-24.md`). Nothing a screen reader hears changed. Codex astra: "Commit after the musts below"; its must was this close, its may on the runner applied.

**Supersedes:** none

**Deferred:** VH-185

## 2026-10-24 — VH-183 — The keyboard trim's Page step: max(10 s, 1% of the video)

**Decision:** Page Up and Page Down move a trim handle by the larger of 10 s and 1% of the video, from `TRIM_PAGE_STEP_SECONDS` and a new `TRIM_PAGE_STEP_FRACTION` in `src/config/trim.ts`, so an hour is crossed in a hundred presses. The arrows, Home, End and what a handle says are unchanged.

**Rationale:** `trimKeyTarget` takes the duration from its one caller. Three new cases cover an hour (36 s), the 1,000 s crossover and the clamp at both ends of a long video. In Chrome, 72 cases (130 s and 3,600 s, three languages, 1280, 375 and 320 px, four colour modes) matched exactly, with focus held and `aria-valuetext` unchanged (`reviews/2026-10-24/vh183-page-step-2026-10-24.md`). Codex astra: "Commit after the musts below"; its one must was this close-out, and its may, the run's readings kept, applied. Digest rules: WCAG 2.1.3 Keyboard (No Exception); Nielsen 7.

**Supersedes:** none

**Deferred:** none

## 2026-10-24 — PLAN-8 — the sheet approved: round 2's Q5 to Q7 on its recommendations, with four wording changes of the owner's

**Decision:** The owner approved the Phase 8 wording sheet and round 2, so every Phase 8 item builds from the sheet's final words. Q5: "High quality, for publishing" and "Smaller file, for assignments and sharing". Q6: a measured warning after the job above 3 LU of limiting. Q7: help links labelled "Staff:" or "Students:", none following the Video type. The owner's four changes are the final words.

**Rationale:** The owner, verbatim: "all seems good." Then: "replace "Next time, speak close to the microphone, and keep it away from the keyboard and the desk." with "Try adjusting the way you handle sound" or words to that effect, but be less specific." / "change "Levels the audio so it is easy to hear." to "Levels audio for consistent listening experience". Change "Makes a video file sized for where you will use it." to "Makes a video file sized and formatted for your intended use"." / the help group to "Staff: ask in the Creators team on Teams (new tab) / Students: get help through Self Service (new tab)" / "change "Fill in the feedback form (new tab)" to something like "Please let us know by filling in the feedback form (new tab)" or words to similar effect (warm and encouraging to send feedback)". The settled words, within "words to that effect": "Next time, try adjusting how you record the sound."; "Levels the audio for a consistent listening experience."; "Makes a video file sized and formatted for your intended use."; "Please tell us what you think in the feedback form (new tab)", which still says alone where it goes (2.4.9). "Email the learning content team" leaves the footer; problem reports still reach that team through Report a problem, and the statement's contact still moves to it (Q1a). Round 2's VH-193 criterion is corrected: the limiter's bite is `afterChainLufs` + the solved gain − `limitedLufs`. S1–S10 and S25 are redrafted, and S32 corrects §5.4's introduction for the after-job rows; all corrections together take the spec to 8,100 of 8,100 words. Codex astra: "Commit after the musts below"; both musts (the warning through the pipeline's `outputWarnings`, since `detectOutputWarning` has no production caller; S32), its should and its could are applied. Working: the sheet's Round 2 section.

**Supersedes:** none

**Items:** VH-182, VH-186, VH-187, VH-188, VH-189, VH-190, VH-191, VH-192, VH-193, VH-194

**Deferred:** VH-186, VH-187, VH-188, VH-189, VH-190, VH-182, VH-191, VH-192, VH-193, VH-194

## 2026-10-24 — PLAN-8 — Phase 8, the owner's UX pass: thirteen pieces, VH-182 to VH-195, one wording sheet; Q5 to Q7 worked out in round 2

**Decision:** Phase 8 addresses the wish lines the owner named and the four held back, as VH-182 to VH-195 in build order, with every new word and spec correction on one sheet. VH-183 to VH-185 need no new words and start first. The owner settled Q1a, Q2, Q3, Q4 and Q8; Q5, Q6 and Q7 are worked out in round 2. The only new elements are one native player and the footer's headings and Self Service link.

**Rationale:** The owner, verbatim (the two addresses set as code for the Markdown lint), to the orchestrator's nine: "students cannot open the Creators team on Teams, they should use `http://selfservice.nottingham.ac.uk` ." / "standing permission carries on for running sessions" / "lets address everything, including the four not on the list"; later the same day, "Problem reports go to `UI-Learning-Content@nottingham.ac.uk`." That is VH-182's answer 1, students cannot open the Creators team and use Self Service, and its answer 2. The sheet's answers, verbatim: Q1a "(agree)": the statement's contact moves to the learning content team, the translation note stays with the owner; Q2 `https://selfservice.nottingham.ac.uk`, "Self Service": "Yes"; Q3 "proceed with your recommendation", a plain player in the finished card; Q4 "proceed with your reccomendation", Video language into step 3; Q5 "saying if it's for assignment upload or quick sharing, which would be small, or public dissemination, which would be high quality. do some work to figure out what this should be."; Q6 "do some work to figure out best approach. maybe offer some advice to the user."; Q7 "It is, but more for staff. Students should use the IT support route. We need to figure out staff vs student paths. It's not terminal to have the staff routes exposed to students."; Q8 "ok! so long we alert folks if they're browser fails checks.", now VH-187's criterion that a failing or warning browser still sees `browserNote.notPassed`. VH-182.6, the player, is the owner's call on top of the simplicity rule: a new element, not a new kind of control. Corrections S1 to S31 (S23 a no-op) and U1 are drafts for the owner, never applied before approval; together they take the spec from 8,074 to 8,096 of its 8,100 words and UI-STANDARDS from 2,406 to 2,404, on the recommended options, so round 2's answers may change S1 to S10 and S25. Traces, each promoted with the reason that it is one of the pieces the owner asked addressed:
INTAKE.1 — promoted to VH-183 — the Page step;
INTAKE.6 — promoted to VH-184 — the toggletip;
VH-139.6 — promoted to VH-185 — the late sliver;
INTAKE.5 — promoted to VH-186 — the System check labels;
INTAKE.7 — promoted to VH-186 — the standalone values;
VH-138.5 — promoted to VH-186 — the caption warning;
INTAKE.4 — promoted to VH-187 — the lead-in;
VH-182.5 — promoted to VH-187 — the promises;
VH-182.1 — promoted to VH-187 — the browser note;
VH-182.4 — promoted to VH-188 — the preset names;
VH-182.3 — promoted to VH-189 — step 4's labels;
VH-182.7 — promoted to VH-190 — Create again;
VH-160.1 — promoted to VH-182 — S22 and S24 carry it;
VH-182.2 — promoted to VH-191 — the language switches;
VH-182.6 — promoted to VH-192 — the player;
INTAKE.3 — promoted to VH-193 — the limiting note;
VH-177.1 — promoted to VH-194 — S30;
VH-177.2 — promoted to VH-194 — S26 and S27;
VH-177.3 — promoted to VH-194 — S28;
VH-177.4 — promoted to VH-194 — S29;
VH-177.5 — promoted to VH-194 — U1.
INTAKE.2 stays a wish line: only a person listening can judge the Teams output. It supersedes VH-132 only in where Video language sits and in its never being locked: Q4 moves it into step 3, locked with step 3, once the owner approves S19 (Codex astra's must). INTAKE.5's other half, the explanation moved into the value, is retired: a value says only whether its check passed, and a failed check is said above step 1 by the browser note (Q8) (sheet B1).

**Supersedes:** 2026-10-19 — VH-132 — Video language sits under Video type, follows the page until chosen, and is remembered

**Items:** VH-182, VH-183, VH-184, VH-185, VH-186, VH-187, VH-188, VH-189, VH-190, VH-191, VH-192, VH-193, VH-194, VH-195

**Deferred:** VH-183, VH-184, VH-185, VH-186, VH-187, VH-188, VH-189, VH-190, VH-182, VH-191, VH-192, VH-193, VH-194, VH-195

## 2026-10-24 — VH-162 — The cut: 0.2.0 does not wait for VH-137's November review; Xerte is the public home, GitHub Pages the preview

**Decision:** 0.2.0 is cut now, tagged `v0.2.0`, and its Xerte zip built from the tagged commit for the owner to upload (VH-14). The statement was brought up to date first (VH-137, `d926bd3`) and its 18 November review stays. The brief, the profile and D5 now say Xerte is the public home and GitHub Pages the unadvertised preview from `main`.

**Rationale:** This answers the question VH-177's entry left with the owner. The owner, in a separate chat on 2026-10-24: "lets release 0.2.0 and update accessibility statement as appropiate. another review in november", and on the drafts, "all reccomendations approved"; relayed by the orchestrator with "cut now. here is some optional direction, your call if pushback:". The brief and profile are owner-signed, so their words are the owner's approved drafts A1 to A5, applied verbatim; D5 gains "Answered 2026-10-22 (PLAN-6)", the owner's call in PLAN-6. `package.json` and the lockfile's root take 0.2.0 through `npm version`, which touched nothing else; no dependency changed. 0.2.0 is a release before v1: spec §13 criterion 10 is a person's walk and criterion 1's EchoVideo upload is unconfirmed, and nothing on the page claims v1 or full conformance. DEV-INFRASTRUCTURE.md's Deployment and Xerte sections still call Xerte the intended home and D5 open; that is wish line VH-162.1, outside the approved wording. It supersedes PLAN-6 only in its timing condition, that the release ships once the statement review ships: the review now follows 0.2.0 (Codex astra's must).

**Supersedes:** 2026-10-22 — PLAN-6 — The public release: 0.2.0 on Xerte, Phase 5 then Phase 6, the feedback form beside what exists

**Deferred:** VH-14, VH-137

## 2026-10-24 — VH-137 — The statement brought up to date for 0.2.0: the file chooser's limitation, October's automated check, an updated date; the November review stays

**Decision:** The statement gains, in all three languages, a sixth limitation (the browser's Choose File button), a line under How we tested for October's automated check of "the page's main states", and "updated on" 24 October. "Partially compliant", the tests not yet run and the 18 November review stand, so VH-137 stays open for that review.

**Rationale:** The owner, in a separate chat on 2026-10-24: "lets release 0.2.0 and update accessibility statement as appropiate. another review in november", and on the drafted wording, "all reccomendations approved"; relayed by the orchestrator with "cut now. here is some optional direction, your call if pushback:". The words are the approved drafts B1 to B3 with one change, the orchestrator's on that leave: the draft's "went through every part of the page" became "went through the page's main states", because VH-172 ran a prioritised matrix (699 records whole, 821 cells unrun) and VH-172.1 keeps 641 cells never re-read, so "every part" overstated what was checked. B1 pays wish line VH-175.2 (V-43, 2.5.3), which retires. `STATEMENT_UPDATED_DATE` is a new date in `src/config/accessibility.ts`, written by `Intl` like the others; `STATEMENT_PREPARED_DATE` and `STATEMENT_NEXT_REVIEW_DATE` are unchanged. The Chinese and Malay are the agent's drafts, through the filled sheet and `scripts/strings-table.mjs`; the machine-translation limitation covers them. No control or element is added beyond a list item and a paragraph in the statement.

**Supersedes:** none

**Deferred:** VH-137

## 2026-10-24 — VH-177 — Phase 7 closes: eleven items shipped against PLAN-7 and the close itself; VH-162's Phase 7 block lifted, and VH-162 is next on the owner's call

**Decision:** Phase 7 closes: VH-170 to VH-176 and VH-178 to VH-181 have shipped, none moved, and VH-177 ships with this close. The Disposition table is final, VH-137 has six notes for the owner's review, and the person checklist says what each check settles. VH-162's Phase 7 block is lifted, and VH-162 is the next item. It waits on the owner's call: does 0.2.0 wait for VH-137's review on 18 November?

**Rationale:** PLAN-7's Items lines name twelve items: VH-170 to VH-177, VH-178 to VH-180 (the fix plan) and VH-181 (the owner's four wish lines). Each of the eleven before this close has a trajectory line and a commit (VH-170's is `eae49ea`), none has a backlog line, and each item file's Now says shipped. The person checklist claims neither §13 criterion 10 nor full conformance. No wish line is retired, because the evidence fully satisfies none: VH-150.2 needs a person's screen reader, and the cells VH-150.3 and VH-153.1 still need are among VH-172.1's 641. VH-177.1 to VH-177.4 draft the spec §9.3 corrections the pass found for the owner. VH-177.5 is UI-STANDARDS' 2.4.13 conditions, since the file is at its 2,400 words. VH-162 is next because it is the only Phase 6 item an agent can run. Its own Now leaves the timing to the owner. VH-137 and VH-14 are the owner's work. Decided on the owner's standing instruction, "work through to the end of VH-177, archive and spawn as you go, proceed with your recommendations, universal permission is granted": (a) VH-162 is marked [!] with that call as its blocker, in place of the Phase 7 one; (b) VH-137's Now is left as the owner's. Local recall, from the record alone, before editing, scored 7/8 (2,2,2,1):

1. VH-179, VH-180, VH-181 and VH-176, from trajectory.md's Phase 7 lines and their decision headings.
2. VH-180: the frame-rate note names no rate, because a fast source has frames dropped and Smaller caps the rate again (V-47).
3. The wish list's open lines (person checks, VH-172.1's 641 cells, VH-175.2 for VH-137, VH-175.4 and VH-181.1 for native readers), backlog Next (VH-13, VH-161, VH-17, VH-113), and VH-137 for the owner's review.
4. VH-162, in Phase 6. This scored 1, as Codex astra found. Before the edits, the open item was VH-177 in Phase 7, and VH-162 was only its successor. The repaired answer: VH-177, in Phase 7, and after it VH-162, in Phase 6, on the owner's call. The recheck scored 8/8 (2,2,2,2) and is a separate trajectory line.

Codex astra checked the candidate and said "Close after the musts below". Its two musts were applied: this recall, and task H in the checklist narrowed to corrections toward VH-105.2. So were its mays on the counts, on tasks A and C, and on VH-M4's outstanding sessions. Its re-check verdict is in the commit.

This check ran in the session that wrote the record, not in a fresh one, so it does not prove a handoff.

**Supersedes:** none

**Deferred:** VH-162, VH-137

## 2026-10-24 — VH-176 — The second pass verified whole: the stage rule held, the after-run with no regression, Codex astra's integrated check

**Decision:** VH-176 closes on `after-run-2026-10-24.md`. It walked `PLANS.priority` again, in place of the full matrix, plus the 162 other records of the fix plans. It found no regression and explained every change. Each of VH-178 to VH-181 kept the stage rule. Codex astra's two record musts were applied. The 641 unrun matrix cells stay with wish line VH-172.1.

**Rationale:** On `ec26c49`, the same 699 keys as VH-172 were walked whole in 2 h 58 min. 118 outcomes changed, none for the worse, and focus fails went from 112 to 0. Each of the 1,724 changed rows traces to one of V-40, V-41, V-42, V-33, V-44 and V-45, to VH-172's own instrument fault, or to run-to-run variation. The six earlier fixes hold, the 48 VH-178 transitions pass, and V-18 is unmoved. The gate is green at 1,523 tests. Codex astra said "Close after the musts below". The musts were the unrun count, 821 to 641, and VH-181's criterion traced to its decision. The re-check said "Close". Decided on the owner's standing instruction, "work through to the end of VH-177, archive and spawn as you go, proceed with your recommendations, universal permission is granted":
(a) the priority plan again, so before and after are the same 699 records in under three hours;
(b) the fix plans' extra records walked as one run, with VH-181's `vh181-rest` not repeated on unchanged code;
(c) the musts applied in VH-181's Notes and VH-172.1, where Codex named them, with V-18's stale Disposition link corrected.

**Supersedes:** none

**Deferred:** VH-177

## 2026-10-24 — VH-181 — One name for step 4: “Closing graphics” in three languages, spec §6 to match

**Decision:** Step 4's heading and legend become "Closing graphics", 结尾图形 and "Grafik penutup", the noun the step's own lines use. `index.html`, `sheet.ts`, the README and spec §6 follow. "Closing card" and "branding" keep their own meanings. The other 82 scenarios that draw step 4 are walked in light at 320 px only (V-45).

**Rationale:** The owner ruled on 23 October: "use “Closing graphics” everywhere, with the specification’s §6 line changed to match." Afterwards the old names occur 0 times on the page in three languages, and each table says the noun 35 times. The Malay heading at 320 px goes from two lines to one. Across 351 records, no instrument's outcome changed: 105 in four modes, plus 246 for Codex's must. V-18's six readings are unmoved. The spec stays at 8,074 words. Nine new parity cases pass. Codex astra twice said "Commit after the musts below". Its coverage must was applied; its re-check called the reduction sound and asked that it be recorded here. Evidence: `vh181-name-2026-10-23.md`. Decided on the owner's standing instruction, "work through to the end of VH-177, archive and spawn as you go, proceed with your recommendations, universal permission is granted":
(a) the coverage reduction above, because the change is strings only and the seven scenarios walked in every cell read the same in each;
(b) the Chinese and Malay names are the agent's drafts;
(c) the README reads "opening branding and closing graphics", since the title card is not closing graphics and opening graphics is VH-23;
(d) the filled sheet's "where it shows" column stays as the translator was sent it. The closing card's two Chinese forms go to a native reader, as wish line VH-181.1.

**Supersedes:** none

**Deferred:** none

## 2026-10-24 — VH-180 — A true frame-rate note: one neutral sentence that names no rate

**Decision:** `source.outputRate` becomes one sentence in each language, naming no rate and true whether frames are repeated or dropped: "To reach a standard frame rate, some frames will be repeated or left out." The call site reads it as a string. The threshold, the presets and the renderer stay as they were (V-47).

**Rationale:** Before, at 4e5be61, a 120 fps source read "The output will run at 60 frames a second, so some frames will be repeated". It read that under Larger and under Smaller's 30 fps cap. After, the 45 fps and 120 fps sources read the neutral sentence under both presets in three languages. The 150 walker records are whole, and no outcome changed. The note stays within 448 px at 1280 and 320, at contrast 7.58–21. V-18's six readings are unmoved. Five new tests pass: up, down, no digit, the 10% boundary, and beside `variesNote`. Codex astra said "Commit after the musts below". Its must (name the digest rules) and its boundary-test may were applied, and the re-check said "Commit". Evidence: `vh180-words-2026-10-23.md`. Decided on the owner's standing instruction, "work through to the end of VH-177, archive and spawn as you go, proceed with your recommendations, universal permission is granted":
(a) the English opening departs from the item's draft, which would repeat `variesNote`'s "The output will use a steady frame rate";
(b) the Chinese and Malay take `variesNote`'s term for frame rate (帧速率, kadar bingkai), as the agent's drafts, marked in the sheet;
(c) the two fixture scenarios are `fixOnly`, so VH-176's plans keep VH-172's counts.

**Supersedes:** none

**Deferred:** none

## 2026-10-23 — VH-179 — Three focus rings drawn whole, the feedback message to the measure, a forced-colour hover

**Decision:** The chooser keeps its ring's room inside its own box, given back by margin, with a CanvasText ring under forced colours. The handles' disc takes px tokens. The band's ring sits 3 px inside the face in a system colour. The feedback message is capped at the measure. Forced-colour hover changes only the border, to HighlightText (V-40–V-42, V-33, V-44).

**Rationale:** Before, at 7f3ea6e, the chooser's ring failed in 115 records (88/640). After, it passes at 704/640, focused and held, in three languages and four colour modes, and the button is unmoved in V-18's six readings. At the 32 px font the handles read 0 before and 230 after, against the painted disc's 157. The band failed in forced-light (416–724) and now passes at 714–1,080. The message's widest line went from 524–541 to 409–420, within 448. Hover against rest went from 0 to 296–532 px² at 3:1. The VH-178 hand-off passes in 12 cells. Codex astra said "Commit"; its one geometry may was applied, and the re-check said "Commit". Evidence: `vh179-rings-2026-10-23.md`. Decided on the owner's standing instruction, "work through to the end of VH-177, archive and spawn as you go, proceed with your recommendations, universal permission is granted": (a) the band's ring is 3 px, not 2, because a 2 px ring inside the border falls short of 2.4.13's area; (b) the hover border is HighlightText, because CanvasText and ButtonText read 1.2–1.4:1 on Highlight; (c) the chosen chooser's hover, which already changes, is left alone; (d) UI-STANDARDS gains the forced-colour ring and hover rule, its words traded in the Carbon-first bullets. A real Windows theme, a real 32 px setting and Firefox's thumb go to VH-177's person checklist.

**Supersedes:** none

**Deferred:** VH-177

## 2026-10-23 — VH-178 — Focus passes on when finished work takes its control away: every control named, a successor that can take focus

**Decision:** Each `focusHeldBy` caller names every control its transition removes: Announce progress with Cancel, and the withdrawn steps in the blocking branch only. The hand-on focuses the first successor that can take focus, Stop saving during a save. The rule moves to `src/ui/focus-hand-on.ts`; no element is added (V-46).

**Rationale:** Before, at 392077f, all three cases left focus on the body. After, they reach the result, the file input and Stop saving in 36 cells, three languages by four colour modes, placed by keys. Each cell asserts its declared conditions and finds the successor in the window and uncovered. The variants were walked: every ending, a reader moving, the dialogue open, and the ready and storage verdicts that keep focus. The routes pass 238 of 242 as before, with S-72a and S-72b held. Thirteen unit tests pin the rule. The file input's ring still fails (V-40, VH-179). Codex astra's check said "Commit after the musts below"; all four musts were applied and its re-check said "Commit". Evidence: `vh178-focus-2026-10-23.md`. Decided on the owner's standing instruction, "work through to the end of VH-177, archive and spawn as you go, proceed with your recommendations, universal permission is granted": (a) a walker fault, F14, holds the check's answer for 8 s so keys can reach Start time, since `prores-1080p.mov` blocks about 20 ms after its check starts; (b) the fallback is each caller's ordered choice, not one rule in the helper; (c) Cancel's click counts focus on Announce progress as held; (d) the module has no line in `project/architecture.md`, whose `ui/` map lists only some modules.

**Supersedes:** none

**Deferred:** VH-179, VH-176

## 2026-10-23 — PLAN-7 — The owner decides the four wish lines: one name for step 4, a forced-colour hover, V-18 accepted, the statement edited once

**Decision:** VH-175.3 becomes VH-181: step 4 is "Closing graphics" everywhere, spec §6 to match. VH-174.1 joins VH-179 as a border-only hover in a system colour. VH-175.1 retires with V-18 accepted, and a native reader's wording waits as VH-175.4. VH-175.2 waits for VH-137. The owner decided each.

**Rationale:** The owner's words of 2026-10-23, verbatim. On VH-175.3: "use “Closing graphics” everywhere, with the specification’s §6 line changed to match. It’s what the step’s own lines already say, and having two names breaks the project’s “no synonyms” rule." On VH-174.1: "add a border-only hover change in a system colour. It’s cheap, it helps people who use Windows contrast themes, and it touches the same CSS area as VH-179." On VH-175.1: "leave it as accepted. The only remaining fix is shorter Chinese and Malay wording, which needs a native reader, so wait for one." On VH-175.2: "leave it for VH-137’s review of the statement, so that text is only edited once." The owner approves the one `docs/01-specification.md` edit; it swaps two words for two, so the spec stays at 8,074 of its 8,100. It supersedes VH-148's sign-off (2026-10-21) for step 4's name alone, where the legend "Closing branding" stayed. For V-44 it decides what VH-174 left to the owner when it refused R-07. VH-181's Chinese and Malay rows are the agent's drafts. VH-181 goes before VH-176, so Codex astra's integrated check reads it with the rest. Campus colleagues are being asked for the native reading. The start notice showed 8576616's handover held by a chat opened at 19:26 UTC. That chat was the owner's advice-only chat ("no action"); it made no edit and the owner archived it. So this chat took the handover on the owner's standing instruction: "work through to the end of VH-177, archive and spawn as you go, proceed with your recommendations, universal permission is granted".

**Supersedes:** 2026-10-21 — VH-148 — The owner’s sign-off changes, including the footer

**Deferred:** VH-181, VH-179, VH-137

**Items:** VH-181

## 2026-10-23 — PLAN-7 — The fix plan: VH-178 to VH-180 for seven findings; the owner's ask decided on the standing instruction

**Decision:** Three fix items join Phase 7 before VH-176. VH-178 fixes the focus successor (V-46). VH-179 draws the three rings whole and brings the feedback field to the measure (V-40, V-41, V-42, V-33). VH-180 fixes the frame-rate note (V-47). The owner's choices are decided on the owner's standing instruction, and none adds a control.

**Rationale:** The owner's words of 2026-10-23: "work through to the end of VH-177, archive and spawn as you go, proceed with your recommendations, universal permission is granted". Decided under them, with both positions in `reviews/2026-10-22/design-pass-2/fix-plan-2026-10-23.md`. The fix plan is approved. Mixed Chinese and Latin lines take the weighted reading (a glyph counts as two against 80), so 1.4.8 is met by G204; Codex had counted raw against 40. V-47 is rank 2, since nothing is lost (Codex said 1), and gets one neutral sentence. V-43 extends VH-168's limitation to 2.5.3 with no page change, and its wording goes to VH-137 (VH-175.2). V-18 is accepted, since no element may move; a native reader's wording is VH-175.1. V-45 is not decided here: both of its names are the owner's own (VH-148), so it is VH-175.3. V-44 is VH-174.1. Codex's verdict, as given: "Approve after the musts below" (`codex-astra-fixplan-critique-2026-10-23.md`); F-01 to F-05 applied, none refused. Order: VH-178 first, the one level A failure and the one behaviour change; VH-179 next, the CSS that can move layout; VH-180 last, the strings, measured on the final CSS. Standards: wcag-2.2-aaa, carbon, nielsen digests.

**Supersedes:** none

**Items:** VH-178, VH-179, VH-180

**Deferred:** VH-178, VH-179, VH-180, VH-176

## 2026-10-23 — VH-174 — The report merged: D-01 and D-04 become V-46 and V-47, D-02 and D-03 merge; Codex's seven points applied but one

**Decision:** `design-pass-2-2026-10-23.md` merges Codex's blind review and VH-173's judging into ten findings at rank 2 or 3. It applies R-01 to R-06, applies R-07 for V-45 and refuses it for V-44. Two judgement calls go to VH-175's ask: the mixed-script line count and V-47's rank. Each point was settled by live evidence or source.

**Rationale:** Codex's verdict, as given: "Commit after the musts below" (`codex-astra-report-critique-2026-10-23.md`, from `codex-astra-report-brief-2026-10-23.md`). D-01 became V-46, with all three cases confirmed live (focus falls to the body). D-02 merged into V-33. D-03 merged into V-40. D-04 became V-47, confirmed live with a 120 fps file and under the Smaller preset. R-01: 1.4.8 is met by mechanism (G204), and the 86 mixed lines stay unresolved against the house rule. R-02: VH-169 is partial. R-06: V-18's remedy is the owner's. R-07 is refused for V-44 because no adopted rule asks for an authored hover inside a forced palette (wish line VH-174.1). V-45 was raised to rank 2. Standards: wcag-2.2-aaa, nielsen, carbon digests. No product code changed.

**Supersedes:** none

**Deferred:** VH-175

## 2026-10-23 — VH-173 — The review judged: eight draft findings, none rank 1, none adding a control; WCAG 18 gaps typed

**Decision:** VH-173 judges the pass in `judged-2026-10-23.md` and `wcag-2026-10-23.md`: V-18 and V-33 incomplete, V-40 to V-43 at rank 2, and V-44 and V-45 at rank 3; it adds no control; because the matrix and source settle each one.

**Rationale:** Findings: V-18, the first action below the first screen in Chinese and Malay at 1280 px and in all three at 320 px; V-33, the feedback field's lines of 524–541 px; V-40, the file button's ring clipped, 110 records; V-41, the thumbs' ring lost at a 32 px font; V-42, the switcher's ring under forced-light; V-43, "Choose File" not in the input's name (it reopens part of VH-168, so it is for the owner); V-44, no hover under forced colours; V-45, "Closing branding" against "closing graphics". WCAG: 40 met, 11 met-in-source, 17 n-a, 18 gaps (4 defects: 1.4.11, 2.4.3 with D-01, 2.4.13, 2.5.3; 10 accepted limitations; 4 missing evidence: 2.1.1, 2.1.3, 3.1.3, 3.1.5). 1.4.8 is met on a stated reading, a CJK glyph counted as two against 80; counting one against 40 fails 86 records, and VH-174 tests the reading. D-01's first case was confirmed live. D-01 to D-04 merge in VH-174. Nielsen: seven hold; 4, 8 and 9 hold with exceptions. Person checklist: `person-checklist-2026-10-23.md`. Unrun cells and missing fixtures: VH-172.1, VH-173.1. Standards: wcag-2.2-aaa, nielsen, carbon digests. No product code changed.

**Supersedes:** none

**Deferred:** VH-174

## 2026-10-23 — VH-172 — The evidence run: a prioritised matrix, 699 records whole, in place of the full 1,454; the six fixes hold or hold in part, none regressed

**Decision:** VH-172 runs a prioritised matrix in resumable parts instead of the plan's full matrix: every scenario once in its base cell, the language, width, mode and enlargement variants only where a check depends on them, and the six-fix cells in full. The 821 cells left unrun are listed by class with their reasons, and `PLANS.matrix` stays declared for a later run. Because the full run is about 11.6 hours on a laptop that moves between places and would be broken repeatedly, the orchestrator recommended this reduction, and the owner's standing instruction lets it proceed.

**Rationale:** The owner's instruction of 2026-10-23: "work through to the end of VH-177, archive and spawn as you go, proceed with your recommendations, universal permission is granted". Codex's method check set no must on the matrix's size (M-01 to M-08 concern the instruments), so no disagreement with Codex arises. `PLANS.priority` ran 699 of 699 records whole in 2 h 20 min: 633 matrix cells and 66 six-fix cells, with none failed, missing, stale or out of view (`reviews/2026-10-22/design-pass-2/evidence/measurements/matrix-2026-10-23.md`, `matrix-manifest-2026-10-23.json`, eleven `digest-*-2026-10-23.md`). Three instrument faults were fixed and their records re-measured: the phone signal, a setup hover spoiling the file button's glyph reading, and the footer's scroll at the 32 px font. The 245 file-button text readings from parts 1–3 left "cannot determine" are a named gap; the 32 re-measured all pass. Two instruments were added, `pressed` and `type`, each proved 8 of 8. The six-fix table is in `six-fix-verification-2026-10-23.md`. VH-164 holds. VH-165 is partial: the forced-light thumb ring is to judge. VH-166 is partial: no walked state draws the code role. VH-167 holds; no state draws a fact note. VH-168 holds. VH-169 holds, 64 of 64 presses. Nothing is judged a finding here; VH-173 judges. No product code changed.

**Supersedes:** none

**Deferred:** VH-173

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
