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

## 2026-10-28 — VH-212 — Closes: heavy limiting's advice in the owner's words, true whether or not the new video plays here

**Decision:** VH-212 closes F15b: heavy limiting's detail says "so play the new video before you use it", the owner's words, in place of "so play the new video before you save it", which a person whose player cannot play the new video (S-152) cannot do; the Chinese and Malay are machine translations, marked so. Only that clause changes: no element, state, listener or walker diff. VH-215 is next.

**Rationale:** The owner, in the "Backlog review" chat, 2026-10-27 ~16:18Z, typed by him: "help me resolve VH-212, VH-213, and VH-216"; for VH-212 (VH-211's ask, point 2) he chose, as the tool returned it, ""before you use it" (Recommended)": en-GB "so play the new video before you save it" → "so play the new video before you use it"; zh-Hans "所以请在保存之前播放新视频" → "所以请在使用之前播放新视频"; ms-MY "sebelum anda menyimpannya" → "sebelum anda menggunakannya"; not taken, "before you publish or submit it". At ~18:06Z, in the same chat, Backlog review recorded that he was never shown the ask's longer recommendation ("so play the new video here and listen. If it will not play here, save it and play the saved file before you share it."): his words are Backlog review's option, and they stand. Source: the orchestrators' notes, `plan8-owner-words.md`. Orchestrator #22's ruling at VH-212 #1's check-in: the walker's self-test words, `prove-8.mjs:54`'s `WARN_WORDS`, stay unchanged, since its proof is word-independent and a change is a walker change beyond the criteria (wish VH-212.1); the stale comments in `announce.ts` and `warnings.ts` change to his words. The walker's predicates read the served tables, so none needed a diff, and one instrument revision (`198cfe660331f1bf`) read the before on `b4ec37a` and the after: 192 cells each, 0 findings, 0 notes; S-138's player row moved in 12 cells both ways, the walker's timing, wish VH-199.1's. Claude's verdict, "Commit, after the close's own record", was saved before Codex astra's blind answer, "Commit after the musts below", was opened; its must, 3.1.5's reading level a person's to confirm (spec §9.3; zh-Hans and ms-MY not shown, wish VH-105.2), and its should, the before's load median, were repaired in the table, and the re-check said "Commit". Digest rules: nielsen 9; wcag-2.2-aaa 3.1.5 and 4.1.3. Evidence: `vh212-playback-advice-2026-10-28.md`.

**Supersedes:** none

**Deferred:** VH-203

## 2026-10-28 — VH-214 — Closes: the walk hung, not the page; S-140 and S-140n bounded, no product diff

**Decision:** VH-214 closes VH-193.3 with no product diff: the page refuses "UoN Closing Logo Fade Blue 2025.mov" and N13 before Create, by the pre-flight's `noSourceDecodeHere`, in every cell, so VH-193's ten minutes were its walk's Create test clicking the withdrawn step 6's hidden Create; S-140 and S-140n gain a bound and three accepted outcomes, proved before the after, the approved walker change.

**Rationale:** Before, on `5893d9d`: 12 of 12 groups (three languages, 1280 and 320 px, four modes each) show step 1's block 41–135 ms after the choosing, Create never shown, on Chrome 156.0.8078.48 and .74; the original read only from `samples/`. Replaying `heavy-193.mjs`'s bite routine reproduced the stall: its test `b && !b.hidden && !b.disabled` (`:147`) read the withdrawn step's button as offered, clicked it, and waited for a plan that never comes until the 720 s bound, the page still blocked, the worker logging `Unsupported video codec (sample entry type 'rle ')`. `QT_BOUND` (a verdict within 330 s, the selection's 120 s and 180 s deadlines with 30 s over; a job's end within 900 s; the boot 60 s, the walk's; each snapshot 10 s) and `QT_OUTCOME` judge each scenario: an accepted outcome passes, none by the deadline is the page's hang, a wait at its deadline beside an accepted outcome is the walk's. Each deadline is absolute: a result at or after it is its expiry, and the state at it is judged only from the page's own dated log of the outcome. An answer the page dated in time but the walk took late is late delivery, cannot-determine, the walk's, never the page's; a log that overflowed or changed across the deadline is cannot-determine too. The proof passed 41 of 41 (26 real, 15 job) before the after, which judged 12 of 12 "refused before Create", on AC in the before's power mode. 4.1.3: `#source-status` speaks the block and its next step; 2.4.3 and 3.3.1 hold; no token, control or document change. The same test elsewhere is outside the approval: wish VH-214.1; at the refusal `#page-announcer` also says "You can still set the times" with trimming withdrawn: wish VH-214.2. Codex astra: its blind check and three follow-ups said "Do not close", each point repaired inside the approval; its fourth follow-up said "Close", ruling the deadline timer's one-turn deferral inside the approval and no low-load re-run owed; its close check ran before the commit, its verdict the commit's `Checked:` line. Evidence: `reviews/2026-10-25/design-pass-3/evidence/measurements/vh214-quicktime-2026-10-27.md`.

**Supersedes:** none

**Deferred:** VH-203

## 2026-10-28 — PLAN-8 — VH-213 and VH-214 run beside the main line with walks queued; Codex's blind check alongside Claude's verdict

**Decision:** VH-213 and VH-214 run in their own worktrees beside the main line, one walk or gate at a time by the walk lock; each lands on the orchestrator's go, rebased, gated and re-checked. VH-213 lands before VH-212 or VH-215 starts. Codex's blind check starts alongside Claude's verdict, kept blind.

**Rationale:** The owner, 2026-10-27 ~20:12Z, verbatim: "Yes, pass both to Orchestrator #16: run VH-214 and VH-213 in their own worktrees beside the main line with the walks queued, and start Codex's blind check alongside Claude's verdict, keeping it blind." On power, 2026-10-27 ~22:57Z, verbatim: "Yes, send it to Orchestrator #17 with the conditions: walks run on battery while it is above 50%, stop at a clean point at 50%, a before and its after in the same power mode, and I'll take the battery off Low Power myself." Source of both: the orchestrators' notes, `plan8-owner-words.md`. He was shown the shared files that keep the line serial, the trade-off (a side item measured against the build it branched from, the combination in VH-203's after-run) and about 3–5 h saved from each change. VH-211's PLAN-8 entry is superseded for the build order only: VH-213 and VH-214 no longer wait their turn in it. VH-213 shares `src/i18n/sheet.ts` with VH-212 and `src/workers/job.worker.ts` with VH-215, and VH-203's after-run measures the combination. The blind check never sees Claude's verdict, which is saved before its answer is read. Walks and gates run on AC, or on battery above 50% and not in Low Power, stopping cleanly at 50%, with an item's before and after in the same power mode. The close check before commit is unchanged, so VH-203's stage rule ("Codex astra's check before commit … of the final candidate diff") holds. VH-213 landed first, on 39a56bc; the second side item to land doesn't repeat this.

**Supersedes:** 2026-10-27 — PLAN-8 — The owner's old issues planned: VH-212 to VH-224 for the format "?", A and B, before VH-203; VH-211 closes

**Deferred:** VH-214

## 2026-10-28 — VH-213 — Closes: a whole video with less than 400 ms of sound told so before Create, as a kept part is, on the owner's choice

**Decision:** VH-213 closes wish VH-185.1. An untrimmed source with under one block (`BLOCK_SECONDS`) of decoded sound is a silent job warned before Create, as VH-185 made a kept part, by a third typed reason, `whole-too-little`, in the owner's words; decoded sound decides, and `cut-short` and `ends-early` keep their precedence. Spec §5.4's row covers a whole video. A partly decoded file that ends early is the owner's exception, wish VH-213.1. VH-185's decision is superseded for its untrimmed scope only.

**Rationale:** The owner, in the "Backlog review" chat, 2026-10-27 ~16:18Z, typed by him: "help me resolve VH-212, VH-213, and VH-216"; for VH-213 he chose "Same rule as a trim (Recommended)", not "Refuse before Create", with the item's drafts verbatim. Codex astra's blind check said "Revise": its must 2, the none-decoded control, was measured, and its should 3, the load account, corrected. Its must 1, a partly decoded file that ends early told only that the video is silent after its decoded sound stops, went to the owner. On 2026-10-28 ~09:57Z, in his own turn to Orchestrator #19, he answered verbatim "Yes, all three" to "Go ahead on all three as recommended?", whose first point was "VH-213's must 1, option (a): a wish line for both paths, and VH-213 closes without the repair." A repair would change VH-185's and VH-206's settled precedence for both paths. The re-check said "Commit". The base's test "leaves an untrimmed file as it was" was replaced by whole-file cases, not deleted or skipped. Evidence: `vh213-whole-sub-block-2026-10-27.md`.

**Supersedes:** 2026-10-24 — VH-185 — A kept sound shorter than the meter's 400 ms block is no sound: a silent job, said before Create

**Deferred:** VH-203

## 2026-10-28 — PLAN-8 — VH-225 raised: the app renamed UoN Video Finisher, before VH-203, on the owner's word

**Decision:** VH-225 renames the app UoN Video Finisher, with its repository and Pages address, last before VH-203 so every earlier walk keeps one name and the release contains it; the project folder is VH-226, after VH-204.

**Rationale:** The owner's words, verbatim, typos kept, in the "Backlog review" chat on 2026-10-28 at about 11:50Z, typed by him, relayed to Orchestrator #20 (`plan8-owner-words.md`): "I have an time / change - it is to be called UoN Video Finisher (rather than UoN Video Helper). please add to the backlog and let the orchestrator chat know - the next release must contain the rename". Placed last before VH-203, so every earlier item's walks keep one name and VH-203's after-run measures the renamed page; before VH-204, so the release contains it. The hidden identifiers (the localStorage keys, the OPFS folder, the job name, the package name) are kept unless a migration is proved with no loss, since renaming them otherwise is data loss. The repository question, answered by him in "Backlog review", relayed to Orchestrator #21 and checked by Orchestrator #22 as his own turns: at about 15:00Z, to "Should the GitHub repository and preview web address change to the new name too?", verbatim: "Rename those too"; so the repository and the Pages address are renamed, with vite's base, the branding path, the profile's remote URL and every link to the old address, the repository's own rename a GitHub setting, his click or a session's with his go-ahead at that step, never done unasked. At about 15:18Z, to "Should the project folder on your Mac be renamed too?", whose shown option read "rename the project folder too, but only at a quiet point when no sessions or walks are running, after the release", verbatim: "Yes, at a quiet point". Orchestrator #22's ruling: the folder is not in VH-225's scope, since VH-225 lands before VH-203 and the folder goes after VH-204's release, when nothing runs; it is VH-226, its own line after VH-204, marked `[!]` because its open question is his: whether /Users/joe/UoN-Video-Helper-side follows, asked at its time. VH-225's six criteria and VH-226's one are drafts, which each item's own worker refines before its build, with Codex astra's blind check. Written by a ledger-only commit from the checkout's single writer after VH-208's push, under rule 3. Neither backlog line has a `from` field: the grammar takes only an ID there (`tools/ledger.mjs`, :288), so the owner's source is in the item files and here, as VH-204's line, raised on his word, carries none.

**Supersedes:** none

**Items:** VH-182, VH-183, VH-184, VH-185, VH-186, VH-187, VH-188, VH-189, VH-190, VH-191, VH-192, VH-193, VH-194, VH-196, VH-197, VH-198, VH-205, VH-199, VH-200, VH-201, VH-202, VH-211, VH-206, VH-207, VH-208, VH-212, VH-213, VH-214, VH-215, VH-216, VH-217, VH-209, VH-218, VH-219, VH-210, VH-220, VH-221, VH-222, VH-223, VH-224, VH-225, VH-203, VH-195, VH-204, VH-226

**Deferred:** VH-225, VH-226

## 2026-10-28 — VH-208 — Closes: the finished video's warnings before its player and Save, and heavy limiting's listening sentence in the completion line

**Decision:** VH-208 closes V-52. The output's warnings are the finished card's own content, after its title and lines and before the player, the lifetime line and Save, with no rail of their own, so no notification nests in another, in every paint: a "Previous video", after "Keep it", after a save and after a language change. The completion's live-region write carries heavy limiting's existing detail whole after the titles, Announce progress on or off; other warnings keep their titles alone. No element, no words; VH-193's and VH-192's decisions stand. VH-212 is next.

**Rationale:** Inside the card only, `renderWarnings` draws them content-only: the same region, named by its title, and the same list, as `section.result-warnings` with no `data-kind`, set apart by one token margin (`--spacing-05`). `warningsSpoken` adds `warningText(heavy).detail`, chosen by its code, after the line, so no string is new or split; the write is exposure, and what a screen reader says stays the person checklist's task A. VH-150's pin in `test/screen-text.test.ts` is rewritten to the new order and still forbids one notification nested in another; `announce.test.ts` matches. This supersedes VH-150's entry in the warnings' placement and treatment alone, their own notification after the card; its rule against one notification nested in another stands. The walker's approved changes were proved first at one revision, `a3a4267ad47d8bd5`: `warnBox` qualified in both layouts, the completion check rejecting heading-only speech for heavy limiting, and its `prove-8.mjs` fixture, 85 of 85; and, on the owner's ruling, "Yes, all three" (2026-10-28), S-136's and S-91's asserts changed from "beside the card, not inside it" to "no notification nested in the card", keeping the order check, 14 of 14. Measured before, on `a87e0f5` with the candidate walker overlaid (a `git archive` export, content-checked), and after: 198 cells, the three languages at 1280 and 320 px in four colour modes, on AC at power mode 2 (before-1, on battery, kept as a record), every after cell read below load 8; the player's keys and rings probed before and after. Besides the order, place, heights and completion text, one outcome changed: in 32 cells, where the card now outgrows the viewport, the focus instrument reads the card's own ring cannot-determine, "the clip is cut by the viewport", a limitation, not a pass (wish VH-208.1). S-138's player row is timing-dependent, a 1 s sample racing the walker's own next step: on Orchestrator #21's ruling it stands in the table as such, and its defect is the existing wish VH-199.1 ("the finish+1s player row … sampled before the scenario's next step plays or detaches the player"). S-152's state, F15b's, is recorded; its words are VH-212's. For VH-203's after-run: `heavy-193.mjs:78`'s selector, which the content-only warnings do not match (VH-208.2), and S-91's changed assert, proved on fixtures only (VH-208.3). Claude's verdict was saved before Codex astra's blind answer was opened, "Commit after the musts below"; the compare held nothing for the owner; Codex's re-check of the table's repairs, "Commit after the musts below", resolved musts 1 to 4 and both shoulds, leaving must 5, this close, which Codex astra checked before the commit. UI-STANDARDS unchanged: no rule changed. Evidence: `reviews/2026-10-25/design-pass-3/evidence/measurements/vh208-warnings-2026-10-28.md` and `vh208-records-2026-10-28/`. Digest rules applied: nielsen 1, "status visible and announced", 5 and 6; carbon, "one primary per state"; wcag-2.2-aaa, 4.1.3.

**Supersedes:** 2026-10-22 — VH-150 — The job's state: Show progress withdrawn, a fresh bar, the stop withdrawn, one primary, and pins

**Deferred:** VH-203, VH-212

## 2026-10-27 — VH-207 — Closes: focus handed on when the choosing or an unreadable file takes the focused control away, to the file input or the same control shown again

**Decision:** VH-207 closes V-46. One capture at the top of the file input's change handler hands focus on what the choosing withdraws, "Use the whole video" included, to the file input, and focus in the result to the same control shown again: Save, the player, the card, and the "discard it?" question to the card, as "Keep it" does. One capture in `clearTrim('unreadable')`, where both read failures meet, hands focus in the withdrawn steps to the file input, or to Stop saving. No element, no words, no other caller. The readings stand as walked, on the owner's answer to Codex astra's two held musts. VH-208 is next.

**Rationale:** The two read failures, the worker's failed reply and the exception, both call `clearTrim('unreadable')` and are its only callers with that notice, so the capture sits once, at its top, before `applyControlLock()` disables any control; its `shown` is the one `revealLaterSteps` receives. At the choosing, the capture precedes everything the handler withdraws (the check's Stop and Check again, the read, the verdict, Create's row, and the trim's controls the reading lock disables), since several go before `clearTrim('reading')`. The re-render moves the same `<video>` into a new card, so focus on it drops to the body and is put back on it. Claude's design reading was saved first, then Codex astra's, blind: they agreed on Save, the player, the card and a cleared saved card (the file input); Codex's two other points were taken on the evidence, the question to the card (the successor "Keep it" already names for the same outcome) and the earlier withdrawals built (the item's Intent: "Choosing the file is itself part of the transition"; spec §9.3). Measured before (a `git archive` export of `5893d9d`, the candidate walker overlaid, its source identity content-checked in `before-source-check.json`) and after, 168 cells and the eight routes, with the pass's keyboard instrument: (a) to (d) from the body to the file input ×24 each, (e) from the body to the re-rendered Save ×24, (f1) and (f2) unchanged, rings passing in all four colour modes, the routes as before. The capture is in `main.ts`, which `focus-hand-on.test.ts` cannot reach: the variants are its proof, (c) walking the exception path through F20; what no variant walks is proved by reading. Codex's blind check, "Commit after the musts below", found "Use the whole video" (`#trim-clear`) missing from the choosing's capture: it was added, and a probe from the walker's own modules reads focus on the body ×8 before and on `#file-input` ×8 after (`probe-trimclear-*.json`). Its re-check, "Commit after the musts below", resolved that and the before's source identity, and held two musts that Claude read as met and the evidence could not settle: "by keys", since the variants place focus with the pass's `focusByKeyboard` (a Shift press, then `.focus()`), not by Tab traversal; and the next Tab, read after the ring instrument, which puts focus back on the same element. The owner, 2026-10-27 about 22:57Z, verbatim: "A: accept VH-207's readings as they stand (focus placed by the pass's focusByKeyboard; the next Tab read after the ring instrument, which restores focus) and close it." Nothing was re-walked. Digest rules applied: wcag-2.2-aaa 2.4.3 and "focus appearance"; nielsen 3, user control and freedom.

**Supersedes:** none

**Deferred:** VH-203, VH-208

## 2026-10-27 — VH-206 — Closes: a kept part with too little audio told so in the owner's words, by a typed reason on the existing no-audio warning

**Decision:** VH-206 closes V-51. The `no-audio` warning carries a typed reason, `no-track` or `kept-too-little`, from `analyseSourceAudio`'s own silent result to `warningText`, not a second code, because spec §5.4 has one "No audio track" row and one outcome, and only the cause, and so the way forward, differs. The kept-part case says the owner's words; no track keeps "This video has no audio". VH-207 is next.

**Rationale:** `job.worker.ts` passes `measured`, not the reduced `analysis`, to `detectSourceWarnings`, which takes `AudioAnalysis | KeptSilence | null`: `null` is `no-track`, a `KeptSilence` `kept-too-little`, none decoded included, since the file has a track and keeping more is the recovery. A declared sound that never arrives stays `ends-early`; `cut-short` stays first; `detail` holds no reason; untrimmed files are unchanged, and `BLOCK_SECONDS` and `loudness.ts` are untouched. The words are the item's, verbatim, Chinese and Malay machine-translated as the ask marked them, with translator notes and the strings sheet's rows. Tests: 17 by VH-206 #1 and 3 for Codex's must 1, one per language composing detection and wording for every cause. The walker's S-99 state and wait read the kept-part heading; S-101's and S-153's negative reads reject either note; S-20 is unchanged; each was proved in three languages before the after (45 of 45 reads). 192 pre-flight and 36 job cells were measured on `446f702` and on the candidate, in three languages, two widths and four modes, on AC. The after's high-load groups were re-run at low load and came out identical. S-99, S-100 and the sliver N14 say the new words in all 72 reads. S-20 is unchanged, and S-101, S-153 and both exact blocks say nothing. S-100 and the sliver have one video track and no audio track, and the levelled cells' LUFS are unchanged. WCAG 3.3.1, 3.3.3, 3.1.5 (grade 3.7 and 3.8), 4.1.3, 2.4.6, 1.4.8, 1.4.10 and 1.4.12 are met for the change (`vh206-no-audio-2026-10-27.md`). Spec §5.4's row adds 21 words, so the spec is 8,121 under the new 8,200 budget. Codex astra, blind: "Commit after the musts below"; all four were done, and its compare is beside the table. Wish VH-202.1 retires, paid; VH-201.2 stays open, as only its sliver part is paid here; VH-206.1 records three probes still reading the old heading. Digest rules applied: nielsen 1, 2 and 9; house-conventions "Fail loudly on data loss"; wcag-2.2-aaa 3.1.5 and 4.1.3.

**Supersedes:** none

**Deferred:** VH-203, VH-207

## 2026-10-27 — VH-206 — The spec's budget raised from 8,100 to 8,200 words for three approved rows, on the owner's word

**Decision:** `project/rules.md`'s By task budget for `docs/01-specification.md` rises from 8,100 to 8,200 words, for the approved rows in VH-206, VH-213 and VH-216 only. VH-206's §5.4 row takes 21 (the spec 8,121), leaving 79 for VH-213's widening of that row and VH-216's §9.1 line; every other `docs/` edit still needs the owner's word.

**Rationale:** The owner, in his own turn in Orchestrator #15's chat, about 16:43Z on 2026-10-27, verbatim: "Yes: raise docs/01-specification.md's budget from 8,100 to 8,200 words, for the approved rows in VH-206, VH-213 and VH-216. Record it as a decision." He was answering #15's question "Raise the spec's word budget from 8,100 to 8,200 for Phase 8's approved spec rows?", and had been shown that the spec was exactly 8,100 words at `446f702` by `tools/ledger.mjs`'s count (whitespace words after comments and fences), so §5.4's approved row, which adds words (33 as first drafted, about 4 at the shortest), could not fit within VH-202's "within 8,100 words"; that VH-213 widens the same row and VH-216 changes §9.1; and that the other route was trims elsewhere in `docs/`, each his to approve. VH-206's first worker had stopped there, as its brief required. Recorded in VH-206's commit because VH-206 needs it first. The raise changes only that budget cell; `project/profile.md` and the rest of `project/rules.md` are unchanged, and the approval of each row stays as its own item records it. Of the VH-202 close decision, this supersedes point 8's "within the spec's 8,100 words" limit only; the rest of it stands.

**Supersedes:** 2026-10-27 — VH-202 — Closes: the owner's answer "as reccomended" on all nine points; the owner's addition and scope open VH-211, the format "?" and old issues A and B to plan

**Deferred:** VH-213, VH-216

## 2026-10-27 — PLAN-8 — The owner's old issues planned: VH-212 to VH-224 for the format "?", A and B, before VH-203; VH-211 closes

**Decision:** VH-211 closes, and Phase 8 gains thirteen items before VH-203, built after VH-208 in this order: VH-212 (F15b), VH-213 (VH-185.1), VH-214 (VH-193.3), VH-215 (VH-139.5), VH-216 (V-18), VH-217 (the format "?"), VH-209, VH-218 (VH-186.1), VH-219 (VH-189.1), VH-210, then B's checks, VH-220 to VH-224. Each keeps VH-203's stage rule and none adds a control; VH-212, VH-213, VH-216 and VH-203's sizing wait on the owner's ask.

**Rationale:** The owner's scope, verbatim, in the "Backlog review" chat on 2026-10-27 at 14:51:20Z: "yes to the question mark, and A and B. ensure everything passes UX / design / Accessibility", answering his addition at VH-202's close, "I accept everything, but even old issues should be solved for. we also need to make sure that question mark about file formats looks good". Not taken, their lines standing: C (native readers, screen-reader and listening checks), D (the statement: VH-137, VH-194.1, VH-162.1, VH-116.1) and E (tooling). Planned with `verbs/plan.md` beside Codex astra: Claude's plan saved first, Codex's blind items, the compare, and Codex's critique ("Revise before recording the plan; retain its overall scope, grouping and build order"), applied but for two refusals, all in `reviews/2026-10-25/design-pass-3/` as `vh211-*`. Settled on the record: the "?" at about 8 px with its 44 px target untouched and the overlap measured, as VH-211's criteria put it to the owner; F15b's words true whether the video plays or not, with no listener; one page order at every width recommended for V-18, since a width-dependent DOM order needs CSS `order` (2.4.3, 1.3.2) or script; VH-186.1 and VH-189.1 apart, and B as five check items, the 214 cells in two disjoint batches (108 and 106), to fit one worker each. Held for the owner: VH-213's route, the same rule as a trimmed keep or a refusal before Create (the earlier approval covered a trimmed keep only). Refused from the critique: a row-by-row scenario map in the plan, which is each check item's first step. Held for the owner after Codex's close check: VH-203's after-run outgrows one worker; Claude recommends running it across sessions under its ID, as VH-199 ran, Codex splitting it into bounded items (the ask, point 4). Order: behaviour and words first; V-18's DOM move before the CSS; the "?" before VH-209, qualifying the combined 32 px cells the later items reuse; the narrow-layout CSS, the rings, then the checks on the final build. Nine wish lines promoted whole and three narrowed (VH-153.1, VH-172.1, VH-175.4), each traced in the commit body. The backlog's Phase 8 lines are shortened to fit 1,000 words; each title stands whole in its item file. The ask is `vh211-owner-ask-2026-10-27.md` beside the plan, Codex's close check `vh211-codex-close-2026-10-27.md`. It supersedes VH-202's close on two rulings: point 5, F15b not a finding, now VH-212; and the old issues it routed to a plan, now these items.

**Supersedes:** 2026-10-27 — VH-202 — Closes: the owner's answer "as reccomended" on all nine points; the owner's addition and scope open VH-211, the format "?" and old issues A and B to plan

**Items:** VH-182, VH-183, VH-184, VH-185, VH-186, VH-187, VH-188, VH-189, VH-190, VH-191, VH-192, VH-193, VH-194, VH-196, VH-197, VH-198, VH-205, VH-199, VH-200, VH-201, VH-202, VH-211, VH-206, VH-207, VH-208, VH-212, VH-213, VH-214, VH-215, VH-216, VH-217, VH-209, VH-218, VH-219, VH-210, VH-220, VH-221, VH-222, VH-223, VH-224, VH-203, VH-195, VH-204

**Deferred:** VH-212, VH-213, VH-214, VH-215, VH-216, VH-217, VH-218, VH-219, VH-220, VH-221, VH-222, VH-223, VH-224, VH-203

## 2026-10-27 — VH-202 — Closes: the owner's answer "as reccomended" on all nine points; the owner's addition and scope open VH-211, the format "?" and old issues A and B to plan

**Decision:** VH-202 closes. The owner answered its ask as recommended, so VH-206 to VH-210 go ahead in the plan's order: VH-206 with the approved words and spec §5.4's row (point 8), VH-209 taken at rank 3. The owner's addition and scope ask that old issues be solved, not accepted: V-18's acceptance (point 6) is amended, and VH-211 plans the format "?"'s two changes and groups A and B into fix items before VH-203. VH-203's after-run captures the "?" for the owner, and its integrated check takes "ensure everything passes UX / design / Accessibility" as its bar.

**Rationale:**

- **The answer.** On 2026-10-27, in the "Backlog review" chat (`local_59428ffc-7efd-4ae6-b7ef-bd83074f4596`), the owner answered VH-202's ask, verbatim: "as reccomended, and convery me the 9 point ask here". That chat had asked: "Send "as recommended" for all nine points to Orchestrator #13?", showing the build order, point 2's en-GB words with Codex's alternative marked not recommended, and the other recommendations in short. As the owner asked, it then showed the nine points in full, at about 14:40Z. Orchestrator #13 read that chat's transcript: the words and what was shown match, and the nine points match the ask committed in `f0b4dae`.
- **Each point, as recommended:** (1) the plan approved; (2) Claude's V-51 words, in three languages, as the ask's table gives them; (3) the 400 ms rule kept; (4) V-50 taken at rank 3, as VH-209; (5) F15b not a finding, with VH-208 recording its state; (6) V-18's Phase 7 acceptance stands, and VH-203 measures the button and reports to the owner; (7) the statement's limitation left to VH-137, with no new item; (8) the spec correction, wish VH-202.1, approved within the spec's 8,100-word budget; (9) no controls.
- **The owner's addition,** the same day, in the same chat, verbatim: "I accept everything, but even old issues should be solved for. we also need to make sure that question mark about file formats looks good".
  - "I accept everything" confirms the nine points.
  - "even old issues should be solved for" asks for fixes, not acceptances. It amends point 6, and supersedes PLAN-7's decision of 2026-10-23 in its V-18 acceptance alone: V-18, accepted in Phase 7 as VH-175.4, is to be solved, its remedy still to plan; VH-203 still measures the button. Which other old issues were meant, the scope below settles.
  - "that question mark about file formats looks good" is VH-205's "?" beside the lede's fourth promise: it is to look right, not only measure right. VH-203's after-run now captures it in its states, in the three languages, the colour modes and at the 32 px font, for the owner; a change the owner asks for becomes a fix item before VH-203 closes.
- **The scope, a third message.** Typed by the owner in the Backlog review chat at 14:51:20Z, the same day (Orchestrator #13 checked that chat's transcript), verbatim: "yes to the question mark, and A and B. ensure everything passes UX / design / Accessibility". What was shown, as that chat relayed it:
  - **the "?"** (VH-205), from three screenshots of the preview at `cc12788`, two changes: the gap, 16 px today, to about 8 px (the 44 px `::after` target may then overlap the end of "format."); and an open state, filled dark while `aria-expanded="true"`, like the chosen "Staff video" segment, which the onset "?" takes too, since it shares `.help-button`. Neither touches the target or the words;
  - **group A, page defects:** V-18 (VH-175.4), its 320 × 568 remedy to the owner before it is built; VH-189.1, VH-186.1, VH-139.5, VH-185.1 and VH-193.3; F15b, its words to the owner first;
  - **group B, checks in Chrome:** VH-150.3, VH-153.1, VH-155.2, VH-156.1, VH-158.1, and VH-172.1's 214 unread matrix cells;
  - **not taken:** C, native readers, screen-reader and listening checks; D, the statement, which is VH-137's, and the stale spec and doc lines VH-194.1, VH-162.1 and VH-116.1; E, tooling.

  VH-211 holds this scope, `[ ]`, to plan into fix items before VH-203 with `verbs/plan.md`, Claude first and Codex blind, compared and critiqued; the plan step is the next worker's, and this close plans nothing. "ensure everything passes UX / design / Accessibility" becomes the bar for VH-203's integrated check: that reading is the Backlog review chat's, recorded as such.
- **What goes ahead.** VH-206 takes the approved words verbatim and is unblocked. Point 8 is routed to it, as Orchestrator #13 settled: its Documents criterion now makes spec §5.4's "No audio track" correction for the kept-part case. The owner's approval is narrow: point 8, this one row, within the spec's 8,100 words; no wider `docs/` permission follows. Wish VH-202.1 stays open until that correction is made and verified, then retires. VH-209 is unblocked; VH-207, VH-208 and VH-210 go ahead on the approved plan. The plan's items and order are unchanged, so PLAN-8 takes no note.
- **The record.** Wish VH-201.1 retires: the answer settles its five questions. VH-201.2 stays open for VH-203's after-run. The report's Disposition rows name the items, and the Now lines of VH-202, VH-203 and VH-206 to VH-210 are rewritten.
- **Codex astra,** on the owner's word: the close carries no new judgement, so Codex's check of the close diff before the commit is the comparison.
- **Digest rules:** none applied; no product code and nothing under `docs/` changed here.

**Supersedes:** 2026-10-23 — PLAN-7 — The owner decides the four wish lines: one name for step 4, a forced-colour hover, V-18 accepted, the statement edited once

**Deferred:** VH-206, VH-207, VH-208, VH-209, VH-210, VH-211, VH-203

## 2026-10-27 — VH-202 — Checkpoint: the fix plan, Codex astra's blind fix items compared, its critique applied, one ask to the owner; VH-202 stays open

**Decision:** VH-202 stays open, blocked on the owner's answer to its ask, which a short close step quotes. The plan, the compare, the critique and the ask are done. VH-206's words and VH-209 wait for him; nothing contested is built first, and the approved items need only his approval of the plan.

**Rationale:**

- **The ask** is the fix plan's last section (`reviews/2026-10-25/design-pass-3/fix-plan-2026-10-27.md`, "The owner's ask"): nine points, each with a recommendation. They are the plan and its order; V-51's words in three languages, marked as the owner's to approve as V-45's were; the 400 ms rule (kept); V-50's rank and whether to take it (taken, rank 3, as VH-209); F15b (not a finding); V-18 (the acceptance stands); the statement's limitation (VH-192.1, VH-137's words); the spec correction for V-51 (wish VH-202.1); and no control. The disagreements with Codex carry both positions: VH-201.1's five questions, V-51's words and V-50's place.
- **Codex astra, on the owner's word** ("please also do everything in partnership with codex as a comparison. codex astra should be used liberally but you decide"):
  - Claude's plan was saved first (`claude-fixplan-2026-10-27.md`). Codex then drafted fix items blind, from the report, the source, the schema and VH-203's stage rule (`codex-astra-fixitems-brief-2026-10-27.md`, `codex-astra-fixitems-2026-10-27.md`).
  - Compared in `fixplan-compare-2026-10-27.md`: the same items, order and remedies. Five Codex points were taken: a typed reason for V-51; V-46's capture before `clearTrim`'s lock; VH-150's test and the walker's `warnBox` moved for V-52; more scenarios; and 1.4.12. One was refused: an owner question in VH-208's file.
  - Its critique of the plan, `codex-astra-fixplan-critique-2026-10-27.md` from `codex-astra-fixplan-critique-brief-2026-10-27.md`, said "Approve after the musts below". All five musts were applied and none refused. P-01: VH-207 captures at the choosing too, where the trim's lock and the result's re-render act first. P-02: each before not in VH-199's records is measured on the item's own base, and the 32 px font in the dark and forced modes is qualified first. P-03: the walker's warning checks move with V-51 and V-52. P-04: the plan's approval, not V-51's words, is what the other items wait for. P-05: Codex's V-18 position, provisional until HEAD is measured, is stated as its own.
- **Digest rules applied:** nielsen 1, 2, 5, 6 and 9 ("errors say what next"); wcag-2.2-aaa 2.4.3, 2.4.13 and "every exception recorded"; carbon "one primary per state"; house conventions "Fail loudly on data loss". No product code changed.

**Supersedes:** none

**Deferred:** VH-206, VH-207, VH-208, VH-209, VH-210, VH-203

## 2026-10-27 — PLAN-8 — Pass 3's fix plan: VH-206 to VH-210 for six findings, built after VH-202 and before VH-203

**Decision:** Phase 8 gains five fix items, in this order: VH-206 (V-51, rank 1, in the owner's words), VH-207 (V-46), VH-208 (V-52), VH-209 (V-50, only if the owner takes it) and VH-210 (V-48 and V-49). Each keeps VH-203's stage rule, and none adds a control.

**Rationale:** Planned with `verbs/plan.md` from pass 3's report; the plan is `reviews/2026-10-25/design-pass-3/fix-plan-2026-10-27.md`. The order: V-51 first as the one rank 1, its data path and strings untouched by the CSS that follows; VH-207 leads if its words wait. V-46 next, the one level A failure and a regression, walked by keys before any CSS moves. V-52 third, the finished card's order in `main.ts`, before the CSS reads the card. V-50 before the rings, since V-48's one record is among its six. The rings last, on the final DOM and CSS. V-18 has no fix item; it was accepted in Phase 7 (VH-175.4), and whether that stands is in the ask. The backlog stands at 891 of 1,000 words after these lines.

**Supersedes:** none

**Items:** VH-206, VH-207, VH-208, VH-209, VH-210

**Deferred:** VH-206, VH-207, VH-208, VH-209, VH-210

## 2026-10-27 — VH-201 — Pass 3's report merged: D-05 and D-06 kept as V-51 and V-52, seven findings, Codex astra's blind ranks the same on six, five questions for the owner

**Decision:** VH-201 closes. `design-pass-3-2026-10-27.md` is Pass 3's report: seven findings, none needing a new element. V-51 (D-05) is at rank 1; V-52 (D-06), V-46 (regressed), V-48, V-49 and V-18 (incomplete) at rank 2; V-50 at rank 3. V-51's words wait for the owner. VH-202 is next.

**Rationale:**

- **The merge** (`reviews/2026-10-25/design-pass-3/design-pass-3-2026-10-27.md`, "How it was done"):
  - D-05 is V-51, its own: verified in source and the unit tests (`src/media/audio-plan.ts:120`; `src/media/sub-block-sound.test.ts:61`, `97`), and the notice read in S-99 ×31, whose sliver is encoder priming. A kept sliver of audible sound was not walked.
  - D-06 is V-52, its own: verified in source (`src/main.ts:3285`, `3327`, `3497`) and in S-135's records, the tree's order and the completion write.
  - Codex's V-46 is merged under V-46, regressed (S-149 ×3). None is set aside.
- **V-51's direction:** words the owner approves, carrying the cause, the consequence and a recovery that applies, with the omission's reason carried into the existing warning (`src/workers/job.worker.ts:535`, `src/audio/warnings.ts:92`). No control; the 400 ms threshold stays unless the owner changes it. The report drafts no words.
- **Codex astra**, on the owner's word ("please also do everything in partnership with codex as a comparison. codex astra should be used liberally but you decide"):
  - Claude's ranks were saved first (`ranks-claude-2026-10-27.md`). Codex then ranked blind from a neutral sheet of observations (`findings-neutral-2026-10-27.md`), forbidden every file that carries a rank. Compared in `ranks-compare-2026-10-27.md`: the same rank on six of seven.
  - Its corrections were taken: S-113's Malay record at 320 px reaches 528 px, and V-18's readings are VH-205's before, so its place at HEAD is unmeasured.
  - Three disagreements of judgement go to the owner: V-50 at rank 3 or 2; whether the warning's guidance when the finished video cannot play (F15b) is a finding; and whether the statement's preview-only media limitation is rank 2 debt under VH-192.1.
  - Its critique of the draft, `codex-astra-report-critique-2026-10-27.md`, said "Commit after the musts below". All five musts were applied and none refused: success claims scoped ("at most one filled action"; exposure, not speech); V-51's remedy through the data path; V-50's full list of offenders; the statement and V-50 kept contested; and VH-200's unread readings, the run's conditions and VH-205's labels carried.
- **Carried unchanged to VH-203's after-run:** the four accepted gaps, the 823 finish+1s rows, VH-200.1's three readings, VH-205's "?" with its labels, 1.4.3 and 1.4.6, VH-185's output tracks and V-46's J4 case. What pass 3 lacked besides is wish VH-201.2.
- **For the owner,** wish VH-201.1, for VH-202's ask: V-51's words and threshold, V-50's rank, the failed-playback guidance, V-18's Phase 7 acceptance, and the statement's limitation.
- **No product code changed,** and no page was walked. Digest rules applied:
  - nielsen, "status visible and announced; errors say what next" (V-51, V-52);
  - wcag-2.2-aaa, 2.4.3, 2.4.13 and "every exception recorded";
  - carbon, one primary per state.

**Supersedes:** none

**Deferred:** VH-202, VH-203

## 2026-10-27 — VH-200 — Pass 3 judged: seven draft findings, D-05 at rank 1, V-46 regressed; VH-205's "?" the owner's fix, labelled

**Decision:** VH-200 closes. `judged-2026-10-27.md`, `wcag-2026-10-27.md` and `person-checklist-2026-10-27.md` judge the Phase 8 page from VH-199's evidence. There are seven draft findings and none needs a new element: D-05 at rank 1; D-06, V-46 (regressed), V-48, V-49 and V-18 (incomplete) at rank 2; V-50 at rank 3. VH-201 is next.

**Rationale:**

- **The findings** (`reviews/2026-10-25/design-pass-3/judged-2026-10-27.md`, "Draft findings"):
  - **D-05, rank 1.** "This video has no audio" for real sound kept under one 400 ms block. The cause it states is false, but the notice comes before Create. The words that tell this case apart are the owner's to approve, and the threshold stays. Orchestrator #11 was told at once.
  - **D-06.** The heavy-limiting advice comes after the player and Save.
  - **V-46, regressed.** S-149 ×3: VH-191 moved Video language into the step the read-failure branch withdraws with no hand-on, VH-178's omission.
  - **V-48.** At the 32 px font, the onset "?"'s ring is 460 of 464 px².
  - **V-49.** In the forced palettes, the wrapped Creators team link's ring is lost over the next link.
  - **V-18, incomplete.** The first action sits inside the first screen at 1280 × 900 in English and Chinese, but not in Malay or at 320 px.
  - **V-50, rank 3.** At the 32 px font in a 320 or 401 px window, the choices and the trim's Set buttons push the page sideways (S-113 ×6). No adopted rule asks for it, and step 4's selects stay wish VH-189.1.
- **Read as the instrument's, not the page's:**
  - the 32 px radio ring, measured against a box where it rings a disc;
  - S-81's wrapped statement link, measured against an enclosing box;
  - S-127's player rings, whose background the walker did not read.
  Each is missing evidence for VH-203's after-run, wish VH-200.1.
- **WCAG:**
  - 35 met, 10 met-in-source and 17 n-a;
  - 2 defects (2.4.3, 2.4.13), 11 accepted limitations and 11 missing evidence, 1.4.3 and 1.4.6 among them for the file button's words at the 32 px font;
  - the finish+1s player class, 823 rows, counted as neither pass nor fail.
- **VH-205** is judged as the fix of the owner's finding. Its verdicts are labelled "manually checked in VH-205", "missing" or "to be measured in VH-203's after-run", and text spacing and forced colours are missing.
- **Codex astra**, on the owner's word ("please also do everything in partnership with codex as a comparison"):
  - its blind review is the comparison throughout;
  - it gave blind attributions, blind VH-205 verdicts and blind WCAG and finding verdicts, each compared under four headings;
  - its points on the radio's disc, the onset "?" and Creators ranks, S-127, 1.4.11, 1.4.12, 2.5.5 and 2.5.8 were taken on the evidence, and Claude's 1.4.2 kept on S-126's assert;
  - nothing is held for the owner;
  - its close check, `codex-astra-judged-check-2026-10-27.md.txt`, said "Commit after the musts below". All four musts and both shoulds are applied, and none is refused:
    - must 1: 1.4.3 and 1.4.6 become missing evidence;
    - must 2: S-113's choices and Set buttons are judged as V-50, rank 3, so no blind step;
    - must 3: the checklist's setup order is fixed;
    - must 4: the gate and the checker are recorded on the final content;
    - should 5: 1.4.8's mixed-line and line-height wording;
    - should 6: the statement's +288 px and S-149's next Tab;
    - its may (7) keeps the rest.
- **No product code changed,** and no page was walked or probed. Digest rules applied:
  - wcag-2.2-aaa, 2.4.13 Focus Appearance and "every exception recorded";
  - nielsen 1, 2, 5 and 9;
  - carbon, one look per component kind.

**Supersedes:** none

**Deferred:** VH-201, VH-202, VH-203

## 2026-10-27 — VH-199 — Pass 3's evidence run: 3,207 of 3,219 records and 48 transitions, four gaps the owner accepted, the Phase 8 contract verified, VH-191 regressed

**Decision:** VH-199 closes. The matrix is whole but for four gaps the owner accepted, each measured in VH-203's after-run on a walker fixed as wish VH-199.1. Eighteen digests sit beside VH-176's after-run. The contract: 12 hold, 5 partial, and VH-191 regressed, focus lost when an unreadable file withdraws step 3's Video language. Codex astra drafted the table blind and checked the close. VH-200 is next.

**Rationale:**

- **The account** (`reviews/2026-10-25/design-pass-3/evidence/measurements/matrix-2026-10-27.md`): twelve runs on `a3039c3` at instrument revision `2e7b0c044ce11f2b`, Chrome 156.0.8078.48, every page visible. 3,207 of 3,219 records are ok and the 48 transitions whole. The 12 missing records and one assert are the gaps below. No failed or missing record counts as a pass. The finish+1s player row counts as unverified in all 823 rows that carry it, its 769 nominal passes included, and so do F15b's intended failures (12 records).
- **The four gaps**, with the owner's rulings verbatim:
  - **S-107 `fallback` ×3** (run-04): the walker's `fonts` route takes F1's held worker (`qualify.mjs:1017`, `faults.mjs:19`). "Yes: accept run-04 at 355/358 with the three S-107 fallback records named as a gap, and measure them in VH-203's after-run once the walker is fixed alongside VH-198.1 and VH-198.2."
  - **S-92 ×31 and S-93 ×6, the check count**: the assert reads 0 (`STATUS_SINCE`, `scenarios.mjs:1521`). **S-55c `fallback` ×3** (run-06): the same `fonts` route. One ruling covers both: "Yes: accept both gaps in run-04's pattern. Run-05 stands whole with S-92/S-93's check-count assert named an instrument gap, run-06 is accepted at 335/338 with the three S-55c fallback records named a gap, and VH-203's after-run measures both once the walker is fixed."
  - **S-133 ×6** (run-09 ×4, run-11 ×2), not recorded: `goto` (`walk.mjs:297`) has no `beforeunload` handler. "Yes: accept S-133's 6 records (4 in run-09, 2 in run-11) as a named instrument gap in run-04's pattern, and measure them in VH-203's after-run once the walker is fixed (VH-198.1 plus a beforeunload handler)."
- **The digests:** one per instrument, eighteen, each beside VH-176's after-run on part 1's 699 keys, with every changed reading explained by subject. A timing, readiness or paint difference is "attribution unresolved" (M-05): run-01 ran on battery, and run-11's later records and run-12 in macOS High Power.
- **The contract** (`contract-2026-10-27.md`):
  - **Partial:** VH-182 (S-81's statement link, 1,361 of 1,865 px², passed in VH-176's after-run and fails ×11 since VH-182's contact line wraps it; the shortfall is the enclosing box's perimeter, so the verdict waits for VH-200), VH-183 (the one-check rule), VH-185 (the output's tracks not read), VH-188 (the 32 px ring, 284 of 304, attribution unresolved) and VH-192 (the finish+1s rows, S-133, S-127's controls and their 2.4.13 exceptions).
  - **VH-191 regressed:** `3c20550` moved Video language into `#step-title`, which the read-failure branch withdraws with no hand-on (`clearTrim('unreadable')`, `src/main.ts:1486`, `1500`), so focus on a radio goes to `body` (S-149 ×3). VH-200 judges it with V-46.
  - **Five readings** the contract names and the runs did not take were taken for the close on `a3039c3`: `rings-179.mjs` `v18`, `colours` and `held`; `note-180.mjs`; `name-181.mjs` (`readings-2026-10-27/`).
- **Codex astra**, on the owner's words of 2026-10-27: "is everything being done in partnership with codex? codex astra should be used liberally"; "please also proceed gatelessly as I'm going to bed. only ask if critical"; "please also do everything in partnership with codex as a comparison. codex astra should be used liberally but you decide".
  - Each run from run-05 had a blind attribution, compared with Claude's (`evidence/runs/`, verbatim).
  - The contract table was drafted blind and compared (`contract-compare-2026-10-27.md`). Seven verdicts differed. Codex's VH-182, VH-185, VH-188 and VH-191 were taken, and Claude's VH-187, VH-189 and VH-178 were kept, each with its reason. Codex also found S-133 hidden from VH-192's tally, and S-59's "focus on the card" ×9 to be the walker blurring before its asserts.
  - Its "close concern", VH-185's sub-400 ms rule, is VH-198's D-05, rank 1, already in VH-200's Notes.
  - The close check said "Commit after the musts below" (`codex-astra-close-check-2026-10-27.md.txt`). Its five musts were applied, none refused: the finish+1s class is unverified in all 823 rows, S-98 re-reads VH-184's edge, `#contact-creators` is an existing link VH-182 reworded, the measure's cannot-determine rows are mixed-script lines, and S-127's 2.4.13 rows need their exceptions interpreted. Its three mays were applied too.
- **The record:**
  - wish VH-199.1 is the walker change;
  - VH-172.1 is narrowed to the 214 cells still unrun;
  - VH-192.2 retires, since the player is walked (S-126 to S-134, K-player);
  - VH-203's Notes name the after-run's records;
  - VH-200's Notes point to the held rows.
- **No product code changed.** No capture is committed; the full run stays in `/Users/joe/UoN-Video-Helper-evidence/pass3-vh199`.
- **Digest rule applied**, WCAG 2.2 AAA's "every exception recorded": 2.4.13's and 2.5.5's user-agent exceptions and the declared person checks are named row by row, never counted as passes.

**Supersedes:** none

**Deferred:** VH-200, VH-203

## 2026-10-27 — VH-205 — The lede's "?" drawn at the text's own size with its 44 px target round it, built before Pass 3's fix stage and deployed to the preview

**Decision:** The format "?" beside the fourth promise is a checkbox glyph's square, `--control-size` (20 px at the default font), so every promise keeps the 24 px line; a centred `::after` draws its 44 × 44 px target, so 2.5.5 needs no exception, and the gap beside it and the tip's step down, `--spacing-04`, clear that target. Built now on the owner's word, not in VH-203.

**Rationale:** The owner, in chat on 2026-10-27, first "Keep the "?" fix where it is: judged in VH-200, planned in VH-202, fixed in VH-203.", then, the same morning, "do the fix turbo please and deploy". The remedy is the one VH-200's note of 2026-10-26 proposed, adding no control. Checked in Chrome at 1024 px, light: the five promises 24, 24, 24, 24 and 24 px high (the fourth was 44), the "?" 20 × 20 px, a point 21 px from its centre hits it and 23 px does not, the tip's top 0.65 px below the target, opened and closed by click and by Enter with the ring visible, no console error; at 320 px in English, Chinese and Malay every promise a whole number of lines and no sideways scroll; dark the same; at a 32 px default font the "?" 40 px in a 48 px line. Forced colours were not emulated; the button keeps `.button--secondary`'s forced-colour rules. Turbo, on the owner's word: not walked with the pass's walker and not checked by Codex astra. VH-200 judges VH-199's 44 px row as fixed here, and VH-203's after-run and integrated check measure it once the walker's 2.5.5 reading counts a target drawn round the control (VH-205.1). Digest rule applied: wcag-2.2-aaa, 2.5.5 Target Size (Enhanced). Built in a worktree apart from VH-199's close in the main checkout (rule 3).

**Supersedes:** none

**Deferred:** VH-200, VH-203

## 2026-10-26 — VH-198 — Pass 3's instruments qualified at revision 2e7b0c044ce11f2b: Codex astra's method check and three re-checks, 3,267 records, about 9.8 h

**Decision:** VH-198 closes. The walker is extended for Phase 8, re-proved and qualified at instrument revision `2e7b0c044ce11f2b`, and every page is walked visible. Codex astra's method check gave five points and its first two re-checks four rank 1 musts; all were applied, none refused, and the third re-check said "Fit for VH-199". The matrix is 3,267 records in twelve runs, about 9.8 h, with S-104 source-only. The blind review's D-05 (rank 1), D-06 and V-46 go to VH-200. VH-199 is next.

**Rationale:**

- **Walker.** The design-pass-2 walker was copied byte for byte (`SOURCE.md`, source `4ec3d31`) and extended for each element Phase 8 added: the finished video's player, the second "?", the footer's headings, the limiting warning and Video language. The extension adds S-92 to S-153, S-140n and S-144p; faults F15 to F19 and F4e; and fixtures N6 to N14.
- **Proofs** at `2e7b0c044ce11f2b` (`56e373c`): prove 93/93, prove-172 8/8, prove-8 76/76, player 41/41, the app run 11/11, faults 27/27, fixtures 8 of 9 (N11 the declared exception), prove-resume 12/12, prove-m04 8/8.
- **The visible-page method.** Headless Chrome hid every page but the first: timers throttled to 1 s, media deferred, as Phase 7's later walk pages ran. A record now fails unless its page is visible. Chrome runs with `--disable-backgrounding-occluded-windows`, `--disable-background-timer-throttling` and `--disable-renderer-backgrounding`, and each manifest reads them from the browser process. It is a comparison-method change against VH-176 (M-05): a timing, readiness or paint difference is "attribution unresolved" unless a matched probe settles it.
- **Parts.** 1: 699 · 2: 157 + 48 · 3: 2,131 · 3b: 216 · 4: 16. That is 3,267, the sizing script's 3,298 less S-104's 31, and at least the approved 3,266, so there is no reduction. 3b's +32 are counted as the script counts them, which is more coverage.
- **S-104 is source-only** by its own contingency: N11's duration reads as 10 seconds.
- **The pilot** `pilot3-2026-10-26T09-47-41-142Z-db5c25`: 77 of 77 whole, keys `fdc4e3dd17ebc634`. The qualification runs were part 4 16/16, the transitions 48/48, the route cells 7/7 and the subresults 6/6, at `2cbba731c59d8036`. They stand at the final revision: its only change is the player's ring reading, which only S-127 opts into and none of them calls. The calibration is about 9.8 h (9.83 h) against the script's 11.4 h, which stays the upper bound.
- **The blind review** was saved verbatim before any finding (`dad952b`). D-05 is rank 1: VH-185's "This video has no audio" is said for real sound under one 400 ms block. D-06 is rank 2, and so is V-46/VH-178. They go to VH-200 (its Notes) with three pilot readings:
  - S-15's ring at 32 px, 284 of 304 px²;
  - T-46.1's card past the window;
  - S-149's read-failure branch, with focus left on the body.
- **The method check** said "Fit after the musts below" (`1cd71f2`). M-01 to M-05 were applied at `2d16e337abe51539`.
- **Re-check 1** said "Not fit" (`6df3490`), with three rank 1 musts, all applied at `2cbba731c59d8036`:
  - real declarations carry `expects`;
  - the completion's write is bound to the card's mutation;
  - 2.4.13's area is the ring's own pixels. S-127's volume ring at 320 px moved from pass, by the whole redraw (446 of 384), to "cannot determine", by its own pixels (103 of 384); no record's outcome changed.
- **Re-check 2** said "Not fit" (`6df3490`), with one rank 1 must: an outline drawn whether focused or not passed 2.4.13, its contrast read against the ring-removed image. A ring pixel now counts only where it meets 3:1 against unfocused, for 2.4.7 too, at `2e7b0c044ce11f2b` (`56e373c`). The rerun found two repairs. At 3:1 the ring must also stand at 3:1 (`kr >= 3 && ko >= 3`), because faint removal pixels inside a disclosure had passed M-02's 2.4.7 negative. And the first exception's `ringAny` read a missing field. No outcome changed in the pilot.
- **Re-check 3** said "Fit for VH-199" (`codex-astra-method-recheck-3-2026-10-26.md`). It confirmed the `kr >= 3 && ko >= 3` judgement and found no regression, coverage reduction or qualification run needing a rerun. Its one may goes to wish line VH-198.2: 2.4.7's "cannot determine" words name one comparison where two apply. The outcome is sound and the row carries both counts; changing the words now would move the revision.
- **Records that would have hung.** S-132's "Leave site?" hang is fixed in its setup. Part 4's first attempt hung 21 minutes at J4 in Malay, cause not found. The guard is wish line VH-198.1; VH-199 watches each run, restarts Chrome and resumes.
- **VH-193.2** is narrowed to two absent tests for VH-202, after a 6 of 6 scratch probe.
- **No product code changed.**
- **CI was red on three checkpoints.** The Verify lines of `877f3ab`, `cc5a52b` and `20440da` read "review files only; node tools/check.mjs 0/0". They overstated the gate by omission: `npm run lint` lints the walker, and the full gate did not run on those commits. CI was red on Pages runs 40229271406, 40232548332 and 40233727718 (`Buffer` and `setInterval` undefined; `k`, `APP` and `w` unused). Each failed before deploying, so the preview stayed on the last green build. `d43a7f5`'s lint fixes made run 40234029957 green. History is not rewritten. Since then every commit is gated on exactly what it holds.
- **The owner's gateless word** for Phase 8 decided each point (VH-197's entry).
- **Digest rules applied**, from WCAG 2.2 AAA, as instruments rather than verdicts:
  - 2.4.13, by the ring's own pixels at 3:1 against unfocused, each exception on its own evidence;
  - 2.4.7, by the same pixels;
  - 2.4.11 and 2.4.12, author content only;
  - 2.5.5, the user agent's exception only where no author rule sizes a control;
  - 1.4.6, measured contrast;
  - 2.1.3, keyboard.

  Every exception is recorded: where the user agent draws the player's controls, the exception is named or "cannot determine" is left per control, for VH-200. The Carbon and Nielsen lenses go to VH-200 unchanged.

**Supersedes:** none

**Deferred:** VH-199, VH-200, VH-202

## 2026-10-25 — VH-204 — raised: a new release is cut after Phase 8 closes, and that one goes to Xerte; 0.2.0 is not uploaded

**Decision:** Phase 8 gains VH-204 after VH-195: a release cut once Phase 8 has closed, which the owner uploads to Xerte. 0.2.0 is not uploaded; VH-14 waits on VH-204's package.

**Rationale:** The owner, to orchestrator #5 on 2026-10-25, verbatim: "Wait: cut a new release after Phase 8 closes and I'll upload that one to Xerte." 0.2.0 was cut on 2026-10-24 for Xerte (VH-162), before Phase 8 changed the page (VH-182 to VH-196, and pass 3's fixes to come), so its package is no longer the app. VH-204 repeats VH-162's method: the version on the cut chat's recommendation (0.3.0 unless it argues otherwise), the statement brought up to date where the release needs it, the gate, a tag, a push, then `npm run package:xerte` and the zip's path to the owner. The words are in orchestrator #5's notes, `plan8-owner-words.md`, "VH-14, the Xerte upload". VH-197's commit could not record them, since rule 3 kept it to VH-197's own lines, so they go in as VH-198's first record commit. No product code changed.

**Supersedes:** 2026-10-24 — VH-162 — The cut: 0.2.0 does not wait for VH-137's November review; Xerte is the public home, GitHub Pages the preview

**Deferred:** VH-204, VH-14

## 2026-10-25 — VH-197 — Pass 3's plan approved on the owner's standing word: 3,266 records, about 10.9 h, no reduction

**Decision:** The third pass runs as `reviews/2026-10-25/design-pass-3/` plans it: scenarios to S-154, an eighteen-row Phase 8 contract, and the matrix in five parts by `sizing-2026-10-25.mjs`'s recipes, with Codex astra's ten points applied. VH-198 is next.

**Rationale:** The owner, in this item's chat: "please go gateless where possible, you have my permission to use your recommendations"; relayed by the orchestrator and confirmed to it directly: "Gateless covers the rest of Phase 8: approve VH-197's plan and every later choice on the sessions' recommendations; only stop for me on something the recommendations don't settle, and keep reporting outcomes". The plan is at least as broad as Phase 7's in every dimension. Part 1 holds VH-172's 699 keys and its baseline in every class; part 2 re-verifies VH-178 to VH-181 (205); part 3 walks Phase 8 in full (2,162); part 3b meets VH-199's light-cell criterion (184) and is the only possible cut, not recommended and not taken; part 4 completes the routes (16). The 63 new scenarios, S-92 to S-154, trace to VH-182 to VH-194 and VH-196; S-153 is walked only if fixture N14 can be made, and S-154 is source-only. Codex astra on the draft (`7e520f3`): "Revise", nine musts and one should, saved verbatim (`codex-astra-plan-critique-2026-10-25.md`); all ten applied, none refused, each listed under the plan's "After Codex astra's critique". A scenario check's sixteen errors and six omissions were applied too. VH-193.2's non-finite and lowered-ceiling paths are verified in VH-198, not left to VH-202. No product code changed. Digest rules applied: the three digests are the plan's lenses unchanged; WCAG 2.2 AAA, every exception recorded (the player judged under spec §9.3's recorded exception); Nielsen, no control for power users (the rule that holds binds every remedy).

**Supersedes:** none

**Deferred:** VH-198

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
