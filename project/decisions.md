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
