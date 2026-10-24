# Phase 8 wording sheet — 2026-10-24

The words and spec corrections for Phase 8, the owner's UX pass (PLAN-8, `project/decisions.md`, 2026-10-24). English only: the Chinese and Malay rows are machine drafts made at build time, through `scripts/strings-table.mjs`, and marked so for a native reader. The owner approved the sheet on 2026-10-24, "all seems good.", with four wording changes of the owner's own, shown here as the final words (PLAN-8 — the sheet approved, `project/decisions.md`). Each item builds only from these rows.

Build order: VH-183, VH-184, VH-185 (no new words, start first), then VH-186, VH-187, VH-188, VH-189, VH-190, VH-182, VH-191, VH-192, VH-193, VH-194, and VH-195, the phase close. The spec stays within its 8,100 words at every step in that order.

## The owner's questions

All settled at 2026-10-24. The owner's words are quoted verbatim in PLAN-8's Rationale and in the approval's.

| Question | Status | What was settled |
| --- | --- | --- |
| Q1, where problem reports go | Settled | "Problem reports go to `UI-Learning-Content@nottingham.ac.uk`." `FEEDBACK_ADDRESS` takes that address (VH-182). |
| Q1a, the other places that give the owner's address | Settled: "(agree)" | The statement's "Feedback and contact" line moves to the learning content team. The machine-translation note (`TRANSLATION_FEEDBACK_ADDRESS`) stays with the owner until the native readers' corrections arrive (VH-105.2). |
| Q2, the student link | Settled: "Yes" | `https://selfservice.nottingham.ac.uk`, link text "Self Service". |
| Q3, watching the finished video | Settled: option A | A plain native player in the finished card (VH-192). A new element, not a new kind of control, and no new words. |
| Q4, the two language switches | Settled: option 1 | Video language moves into step 3, locked with step 3 while a video is made (VH-191). |
| Q5, the preset names | Settled: round 2's option 1 | "High quality, for publishing" and "Smaller file, for assignments and sharing" (B6, S1–S10). |
| Q6, heavy limiting | Settled: round 2's option 1 | A measured warning after the job, above 3 LU of limiting (`HEAVY_LIMITING_LU`), with general advice for next time in the owner's words (B11, S25, S32). |
| Q7, staff and student routes | Settled: round 2's option 1 | Each help link says "Staff:" or "Students:", every route always shows, and nothing follows the Video type. The owner took "Email the learning content team" out of the footer (the VH-182 rows). |
| Q8, the browser note | Settled, with a condition | Accepted, "so long we alert folks if they're browser fails checks": `browserNote.notPassed` still shows above step 1 when any check fails or warns, now a VH-187 criterion. The statement's first limitation still says the tool is designed for Chrome. |

## Strings, old → new

### B1 — VH-186 — `systemCheck.rows`

- secure: "Secure connection (needed for storage access)" → "Secure connection"
- webcodecs: "Video processing in the browser (WebCodecs)" → "Video processing (WebCodecs)"
- h264: "Video format the tool makes (H.264)" → "Output video format (H.264)"
- aac: "Audio format the tool makes (AAC)" → "Output audio format (AAC)"
- opfs and worker are unchanged.
- INTAKE.5 also asked for each explanation to move into the row's value. The sheet recommends retiring that half: the values stay "checking", "available" and "not available", and a failed check is said above step 1 by the browser note (Q8). The owner may ask for value rows instead.

### B2 — VH-186 — standalone values

Shown alone, "unknown" and "less than a second" become "Unknown" and "Less than a second", as new keys `format.alone.*`. Inside a sentence they stay lower-case. `estimateWords` can put `format.unknown` inside "about …"; the build checks this.

### B3 — VH-186 — the unscanned caption warning

`uncheckedDetail` is unchanged, and the existing `captionsConsequence` passage follows it, as in the scanned warning. No new sentence.

### B4 — VH-187 — the lede

- `lede.intro` ("This tool does the following to your video:") is removed.
- The three promises become "Adds the University's approved branding.", "Levels the audio for a consistent listening experience." and "Makes a video file sized and formatted for your intended use." The second and third are the owner's words. This avoids "MP4", an abbreviation the readability list lacks.
- `app.description` → "Add the University of Nottingham's approved branding to a video, level its audio, and get a video file sized and formatted for your intended use, without uploading it anywhere."

### B5 — VH-187 — the browser note

`browserNote.pending` and `browserNote.passed` are removed. `browserNote.notPassed` is unchanged and shown only when a check fails or warns (Q8's condition). A fail or warn already seen takes precedence over checks still pending. Step 1's "Checking whether this browser can run the tool…" covers the pending state.

### B6 — VH-188 — the preset names (Q5, option 1)

- labels: "Larger / better" → "High quality, for publishing"; "Smaller / reduced" → "Smaller file, for assignments and sharing". The legend "File size / quality" stays.
- details: "For EchoVideo or YouTube etc." → "For EchoVideo, YouTube, and similar sites."; "For Moodle assignment uploads, messaging, or email etc." → "For Moodle assignment uploads, email, and messages."
- New prose for the record's {output}: "high quality, for publishing" and "a smaller file, for assignments and sharing", so the record reads "Made from X: the whole video (4 minutes), high quality, for publishing, a cut to…". VH-188's build checks the commas read well, and may drop the purpose from the record if they do not.
- New keys `preset.inSentence.*` for the sentences that name a preset ({smaller}, {best}): "the smaller file" and "high quality". So "…keep less of the video, choose the smaller file, or free some space…" and "…If it is mostly camera footage, choose high quality instead."

### B7 — VH-189 — step 4's labels

- `types.none`: "None" → "No closing graphics"
- `onsetLabel`: "Animation onset" → "Plays over"
- onsets: "Over existing" → "The last second of video"; "Over generated freeze frame" → "A held last frame"
- `helpLabel` → "About what the graphics play over"
- `helpExistingTerm` and `helpFreezeTerm` take the new option names; `helpExistingText` → "— the closing graphics cover it as they build."; `helpFreezeText` is unchanged
- `notUsedWith.none`: "Not used with None." → "Not used without closing graphics."
- "Animation type", Cut, Fade, Slide and the fallback strings are unchanged.

### B8 — VH-190 — Create again

New key `create.again`, "Create the video again", used while a finished video is on screen. The existing discard question guards it.

### VH-182 — the footer, the dialog, the statement

- New headings: `footer.heading` "Help and feedback"; groups "Need help using the tool?", "Something not working?" and "What do you think of the tool?".
- Help links (Q7, option 1, with the owner's change): under "Need help using the tool?", only creators → "Staff: ask in the Creators team on Teams (new tab)" and new `selfService` → "Students: get help through Self Service (new tab)", staff first. The owner took learningContent ("Email the learning content team") out of the footer: its link and key go. Problem reports still reach that team through Report a problem, and the statement's contact line still moves to it (Q1a). `contact.intro` is removed.
- feedbackForm, under "What do you think of the tool?" (the owner's change): "Fill in the feedback form (new tab)" → "Please tell us what you think in the feedback form (new tab)". It still says alone where it goes and how it opens (2.4.9). Report a problem and the feedback form are for everyone, unlabelled.
- `feedback.open` and `feedback.heading` → "Report a problem".
- The five errors that name the button, in full:
  - unlevellable.next: "Report the problem with the Send feedback button, which adds details that will help." → "Use the Report a problem button, which adds details that will help."
  - encoderRefused.next: "Try the other option under File size / quality. If the problem happens again, report it with the Send feedback button, which adds details that will help." → "…report it with the Report a problem button, which adds details that will help."
  - checkFailed.next: "Press Check again to run the check once more. If the check fails again, report the problem with the Send feedback button." → "Press Check again to run the check once more. If the check fails again, use the Report a problem button."
  - tryAgain: "Try again. If the problem happens again, report it with the Send feedback button, which adds details that will help." → "…report it with the Report a problem button, which adds details that will help."
  - startup.workerNotStarted: "…Reload the page. If the problem happens again, report it with the Send feedback button." → "…report it with the Report a problem button."
  - The build checks each key name against `src/i18n/en-GB.ts`.
- `FEEDBACK_SUBJECT` → "UoN Video Helper problem report"; `FEEDBACK_ADDRESS` → `UI-Learning-Content@nottingham.ac.uk` (Q1).
- `statement.contact.text`: "If you find a problem with this tool, or need its information in another way, email Joe Bell at {address}." → "If you find a problem with this tool, or need its information in another way, email the learning content team at {address}." (Q1a). The address follows `FEEDBACK_ADDRESS` through `ACCESSIBILITY_CONTACT_ADDRESS`. "About this statement" keeps "Joe Bell reviewed it."
- New config `SELF_SERVICE_URL` = `https://selfservice.nottingham.ac.uk` (Q2); the README lists it. The Errors panel's "Report this problem" stays.

### B9 — VH-191 — Video language in step 3 (Q4, option 1)

- `videoLanguage.helper` → "Words the tool adds to your video, on the title card and the closing graphics, are in this language."
- `nextVideo` → "Changes to the video type apply to the next video you make."

### B10 — VH-192 — the player (Q3, option A)

No new words: the player is named by the card's heading.

### B11 — VH-193 — the heavy-limiting warning (Q6, option 1)

New after-job warning `heavyLimiting`, shown and spoken with the finished video, through the pipeline's `outputWarnings` (`src/media/pipeline.ts`), the worker and the job's result, as the carried-metadata warning is: heading "The loudest moments were held down hard"; detail "To reach the usual level, the tool had to hold down the loudest moments of this recording hard. That can make a voice sound flat or squashed, so play the new video before you save it. Next time, try adjusting how you record the sound." The last sentence is the owner's change, less specific than round 2's draft.

## Spec corrections

Approved by the owner on 2026-10-24 (`docs/` is protected, so none is applied before its item). Each is applied in its item's commit. Applied together they take `docs/01-specification.md` from 8,074 to 8,100 of its 8,100 words, and `UI-STANDARDS.md` from 2,400 to 2,393 of its 2,400 by the ledger's count, which leaves out fenced blocks (U2 is the trade U1 alone could not make). S1–S10 and S25 are round 2's redrafts, for Q5's and Q6's options 1, and S32 corrects §5.4's introduction for the after-job rows (Codex astra's must); S25's row is shorter to pay for it; under Q5 the spec calls each output by its first two words after §6 names it in full, so the longer names cost no words in running text. S23 was a no-op and is left off. S31 trades 28 words from §9.3's announcement contingency, which Announce progress resolved. S21 renames "The preview's content" to "The players' content" and covers the finished video's own additions, the title or submission card and the closing graphics, apart from the user's recording. Old text is matched with its line wrapping ignored: words separated by any whitespace.

**S1** — VH-188 — `docs/01-specification.md`, under “6. Video outputs” — -4 words

Old:

```text
The headings below are the names on screen; the code's ids, and older references in these documents, call them "best quality" (`best`) and "smaller file" (`smaller`).
```

New:

```text
The headings below are the names on screen, called here by their first two words; the code's ids are `best` and `smaller`.
```

**S2** — VH-188 — `docs/01-specification.md`, the heading itself — -4 words

Old:

```text
### 6.1 "Larger / better" — for EchoVideo or YouTube
```

New:

```text
### 6.1 "High quality, for publishing"
```

**S3** — VH-188 — `docs/01-specification.md`, under “6.1 "Larger / better" — for EchoVideo or YouTube” — +1 words

Old:

```text
("For EchoVideo or YouTube etc." on screen)
```

New:

```text
("For EchoVideo, YouTube, and similar sites." on screen)
```

**S4** — VH-188 — `docs/01-specification.md`, under “6.1 "Larger / better" — for EchoVideo or YouTube” — -1 words

Old:

```text
above what "Smaller / reduced" asks of slides.
```

New:

```text
above what "Smaller file" asks of slides.
```

**S5** — VH-188 — `docs/01-specification.md`, the heading itself — -5 words

Old:

```text
### 6.2 "Smaller / reduced" — for Moodle assignment uploads, messaging or email
```

New:

```text
### 6.2 "Smaller file, for assignments and sharing"
```

**S6** — VH-188 — `docs/01-specification.md`, under “6.2 "Smaller / reduced" — for Moodle assignment uploads, messaging or email” — -1 words

Old:

```text
("For Moodle assignment uploads, messaging, or email etc." on screen)
```

New:

```text
("For Moodle assignment uploads, email, and messages." on screen)
```

**S7** — VH-188 — `docs/01-specification.md`, under “6.2 "Smaller / reduced" — for Moodle assignment uploads, messaging or email” — -1 words

Old:

```text
"Larger / better" is *anchored*
```

New:

```text
"High quality" is *anchored*
```

**S8** — VH-188 — `docs/01-specification.md`, under “9.1 Workflow” — -2 words

Old:

```text
— "Larger / better" or "Smaller / reduced"
```

New:

```text
— "High quality" or "Smaller file"
```

**S9** — VH-188 — `docs/01-specification.md`, under “10. Browser support” — -1 words

Old:

```text
1080p25 "Larger / better"
```

New:

```text
1080p25 "High quality"
```

**S10** — VH-188 — `docs/01-specification.md`, under “13. Acceptance criteria” — -1 words

Old:

```text
in the "Smaller / reduced" output
```

New:

```text
in the "Smaller file" output
```

**S11** — VH-189 — `docs/01-specification.md`, under “4.3 Conforming to the source, and the three boundary modes” — +5 words

Old:

```text
*Animation type* is Cut, Fade, Slide or None; *Animation onset* is Over existing or Over generated freeze frame, and means something only for Fade and Slide;
```

New:

```text
*Animation type* is Cut, Fade, Slide or No closing graphics; *Plays over* is The last second of video or A held last frame, and means something only for Fade and Slide;
```

**S12** — VH-189 — `docs/01-specification.md`, under “4.3 Conforming to the source, and the three boundary modes” — +1 words

Old:

```text
| Type | Onset | Result |
```

New:

```text
| Type | Plays over | Result |
```

**S13** — VH-189 — `docs/01-specification.md`, under “4.3 Conforming to the source, and the three boundary modes” — +3 words

Old:

```text
| Fade or Slide | Over existing | over picture |
```

New:

```text
| Fade or Slide | The last second of video | over picture |
```

**S14** — VH-189 — `docs/01-specification.md`, under “4.3 Conforming to the source, and the three boundary modes” — +0 words

Old:

```text
| Fade or Slide | Over generated freeze frame | over freeze frame |
```

New:

```text
| Fade or Slide | A held last frame | over freeze frame |
```

**S15** — VH-189 — `docs/01-specification.md`, under “4.3 Conforming to the source, and the three boundary modes” — +2 words

Old:

```text
| None | — | no closing |
```

New:

```text
| No closing graphics | — | no closing |
```

**S16** — VH-189 — `docs/01-specification.md`, under “4.3 Conforming to the source, and the three boundary modes” — +1 words

Old:

```text
— onset under Cut or None, colour under None —
```

New:

```text
— Plays over under Cut, both under No closing graphics —
```

**S17** — VH-187 — `docs/01-specification.md`, under “10. Browser support” — -33 words

Old:

```text
**The app is designed and built for Chrome, and says so** before anything is chosen — and says what the load-time support check found, so a browser that has passed is not turned away (VH-98, 2026-09-30; revised 2026-10-01, VH-121). One sentence in three forms: "This tool is designed and built for Chrome, so other browsers may not work" until the checks land; "…and this browser has passed the checks for it to run" when every check passes; "…and this browser has not passed all the checks for it to run. The system check at the foot of the page says what is missing" otherwise.
```

New:

```text
**The app is designed and built for Chrome, and says so** above step 1 when the load-time support check has not passed, in the words "This tool is designed and built for Chrome, and this browser has not passed all the checks for it to run. The system check at the foot of the page says what is missing." When it passes, the system check alone says so (VH-98, VH-121, VH-182.1).
```

**S18** — VH-187 — `docs/01-specification.md`, under “10. Browser support” — -2 words

Old:

```text
runs if the support check passes, and the page says so when it does
```

New:

```text
runs if the support check passes, and the system check says so
```

**S19** — VH-191 — `docs/01-specification.md`, under “9.1 Workflow” — +2 words

Old:

```text
Under it, "Video language" chooses the language of the words the app adds to the video (VH-132). It shows the page's language until someone picks one, then keeps the pick when the page's changes; it too is remembered and never locked, and a job reads it at its start. While a video is made or shown, a line under the switches says a change is for the next video (VH-140).
```

New:

```text
In step 3, "Video language" chooses the language of the words the app adds to the video (VH-132, VH-182.2). It shows the page's language until someone picks one, then keeps the pick when the page's changes; it is remembered, locked with step 3, and read by a job at its start. While a video is made or shown, a line under the switch says a change is for the next video (VH-140).
```

**S20** — VH-192 — `docs/01-specification.md`, under “9.1 Workflow” — +8 words

Old:

```text
and "Save the video" when it is done.
```

New:

```text
and "Save the video" when it is done; the finished video plays in its card (VH-182.6).
```

**S21** — VH-192 — `docs/01-specification.md`, under “9.3 Accessibility” — +4 words

Old:

```text
- **The preview's content** (1.2.1–1.2.8, 2.3.1–2.3.2). *Reason:* it is the user's own recording, outside the page's control. *Impact:* its captions, descriptions and flash safety are whatever the recording has; a statement of partial conformance for third-party content acknowledges that non-conformance rather than excusing it. *Mitigation:* nothing autoplays, and the controls are the user agent's; any media the app itself supplied would need alternatives of its own.
```

New:

```text
- **The players' content** (1.2.1–1.2.8, 2.3.1–2.3.2). *Reason:* it is the user's own recording, outside the page's control. *Impact:* its captions, descriptions and flash safety are whatever the recording has; a statement of partial conformance for third-party content acknowledges that non-conformance rather than excusing it. *Mitigation:* nothing autoplays, and the controls are the user agent's; the finished video's added cards are silent, and their words are chosen on this page (VH-182.6).
```

**S22** — VH-182 — `docs/01-specification.md`, under “9.2 Principles” — +8 words

Old:

```text
included. Feedback is prepared as an email the user sends
```

New:

```text
included, grouped by need: help, a problem, an opinion. "Report a problem" prepares an email the user sends
```

**S24** — VH-182 — `docs/01-specification.md`, under “11. Non-functional requirements” — +5 words

Old:

```text
one outbound route is feedback (§9.2)
```

New:

```text
one outbound route the app prepares is a problem report (§9.2)
```

**S25** — VH-193 — `docs/01-specification.md`, under “5.4 Audio-quality warnings” — +11 words

Old:

```text
| No audio track | Source has no audio stream |
```

New:

```text
| No audio track | Source has no audio stream |
| Heavy limiting | Post-processing limiting over 3 LU (`HEAVY_LIMITING_LU`) |
```

**S32** — VH-193 — `docs/01-specification.md`, under “5.4 Audio-quality warnings” — +4 words

Old:

```text
Derived from the Section 5.2 analysis pass and shown **before** processing.
```

New:

```text
From the Section 5.2 analysis pass, shown **before** processing; post-processing rows, with the finished video.
```

**S26** — VH-194 — `docs/01-specification.md`, under “9.3 Accessibility” — +5 words

Old:

```text
running text no wider than 80 characters (40 glyphs for CJK);
```

New:

```text
running text no wider than 80 characters (a CJK glyph counted as two, mixed lines too);
```

**S27** — VH-194 — `docs/01-specification.md`, under “9.3 Accessibility” — -5 words

Old:

```text
the Chinese 40-glyph measure (1.4.8);
```

New:

(removed)

**S28** — VH-194 — `docs/01-specification.md`, under “9.3 Accessibility” — +2 words

Old:

```text
a control that removes or disables itself names its successor;
```

New:

```text
a transition that removes or disables the focused control names its successor;
```

**S29** — VH-194 — `docs/01-specification.md`, under “9.3 Accessibility” — +6 words

Old:

```text
the slider thumbs' inset focus ring (2.4.13);
```

New:

```text
the slider thumbs' focus ring in Firefox and at a larger font (2.4.13);
```

**S30** — VH-194 — `docs/01-specification.md`, under “9.3 Accessibility” — +46 words

Old:

```text
*Decision:* accepted, maintainer, 2026-10-20.

`test/readability.test.ts`
```

New:

```text
*Decision:* accepted, maintainer, 2026-10-20.
- **The file chooser** (2.5.3). *Reason:* it is the browser's own, and translating it needs a new element. *Impact:* its "Choose File" follows the browser's language and is not in its name. *Mitigation:* the step's heading, "Choose a video", names it. *Decision:* accepted, VH-168 and PLAN-7.

`test/readability.test.ts`
```

**S31** — VH-194 — `docs/01-specification.md`, under “9.3 Accessibility” — -28 words

Old:

```text
Routine progress announcements can be postponed by the user (2.2.4); if that control cannot be made plain enough for a novice, stage changes and the outcome alone are announced and that reading is recorded below as the exception.
```

New:

```text
Routine progress announcements can be postponed (2.2.4), with "Announce progress".
```

**U2** — VH-194 — `UI-STANDARDS.md`, under “Operable” — -5 words

Old:

```text
- When a transition removes the control that has focus, focus passes to the control that continues the task; it never leaves where a user has gone to read (VH-111).
```

New:

```text
- When a transition removes the focused control, focus passes to the one that continues the task, never away from where a user reads (VH-111).
```

**U1** — VH-194 — `UI-STANDARDS.md`, under “Operable” — -2 words

Old:

```text
in light, dark, a blue band and forced colours, not only as a token pair.
```

New:

```text
in light, dark, a blue band, forced colours and a larger default font.
```

## Round 2 — Q5, Q6 and Q7 worked out

The owner asked for these three to be worked out (PLAN-8). Each had options and one recommendation, and none adds a control. The owner approved every recommendation on 2026-10-24, "all seems good." The final words, with the owner's changes, are rows B6 and B11, the VH-182 rows and corrections S1–S10, S25 and S32 above; this section keeps the working.

### Q5 — the preset names: say what each output is for

**What the record says.** Spec §6 presents the outputs "by purpose, not by technique" (VH-85), and the brief's Direction asks for "two purpose-named outputs". §6.1's destinations re-encode on ingest (EchoVideo, YouTube), so they get the higher quality. §6.2's files "are sent and downloaded as they are": Moodle assignment uploads, messages, email, OneDrive and SharePoint. The owner's words map onto that split: "assignment upload or quick sharing, which would be small, or public dissemination, which would be high quality". "Best" overstates §6.1, which is anchored to the source and never above it, so "High quality" is the truer word. The names are also put into sentences as they stand ("…keep less of the video, choose {smaller}, or free some space"), so a sentence needs its own short form.

**Options.**

1. **Quality and purpose together** (recommended). Labels "High quality, for publishing" and "Smaller file, for assignments and sharing". Each says both what it is and what it is for, and "assignments" is the word a student is looking for. The details name the destinations.
2. **Purpose only.** Labels "For publishing" and "For assignments and sharing", with size and quality in the details. It reads well as a choice but badly in a sentence ("choose For assignments and sharing"), and the legend "File size / quality" would no longer match.
3. **Quality only**, the first draft: "Best quality" and "Smaller file", with the purpose only in the details. It is the shortest, but the owner asked for the purpose in the name.

**Recommendation: option 1, approved.** Its rows are now B6, and S1–S10 are redrafted for it.

- Not recommended, and not on the list: preselecting the smaller file for a student submission. It would tie the output to the Video type, which the spec does not, and change a default nobody has asked to change.

### Q6 — heavy limiting: the best approach, the threshold, and advice

**What the record says.** The 29-minute Teams recording (VH-106, `GAIN_SOLVE` in `src/config/audio.ts`) needs about 12 dB of gain to reach −16 LUFS, and its limiter then removes about 8 LU to hold the ceiling: loudness against gain ran −18.12, −17.38, −16.76, −16.38 and −16.04 LUFS at 4, 6, 8, 10 and 12 dB. On a corpus lecture the limiter takes "a few tenths of a LU"; the real lecture behind VH-50 came out 0.75 LU low before the solve allowed for it. INTAKE.2, a person listening to the Teams output, has not been done, so nobody has yet judged by ear where limiting starts to sound bad. Each job already measures the limiter's bite exactly: the gain solve logs `afterChainLufs` (the chain without gain or limiter) and `limitedLufs` (the chain that runs, at the solved gain), so the bite is `afterChainLufs` + the gain − `limitedLufs`. VH-193's criterion compared `afterChainLufs` with `limitedLufs` alone, which leaves out the gain; round 2 corrects it. The app already shows warnings that can only be known afterwards with the finished video, through the pipeline's `outputWarnings`: the carried-metadata warning. `detectOutputWarning`, §5.4's "Target not reached", has no production caller; a missed target fails the output check instead (Codex astra's check).

**Options.**

1. **Measured, after the job** (recommended). When the job's measured bite is over the threshold, the finished video carries one more after-the-job warning, pushed onto the pipeline's `outputWarnings` beside the carried-metadata warning. It is exact, costs nothing, and raises no false alarm. With VH-192's player the person can listen in the card before saving, which is the check that matters. It is said after Create rather than before, but before Create there is nothing in the tool a person could do about it.
2. **Predicted, before Create.** An estimate from the analysis pass: how far the true peak stands above the integrated loudness, against the room between the target and the limiter's ceiling. It is said earlier, but it is a guess. One door slam or desk knock raises the true peak without making the voice sound squashed, so it would warn on ordinary lectures, and the estimate has no measured case to calibrate it against but one.
3. **Both.** A prediction before Create and the measured figure after it. Two warnings for one cause, twice the words, and the first one can be wrong. Not recommended.

**Threshold: 3 LU**, as `HEAVY_LIMITING_LU` in `src/config/audio.ts`. It is four times the most a corpus lecture has lost (0.75 LU), so a typical lecture never sees it, and well under the Teams case's 8 LU, so a recording half as hard is still caught. A bite of 3 LU means the limiter is turning down a large share of the speech, not just a few peaks. VH-193's close lists every corpus file's bite. INTAKE.2's listening can move the number later, as a config change with a decision.

**Advice for the user.** The tool cannot fix this after recording, so the advice is for the next one. Heavy limiting comes from sounds much louder than the voice: a desk knock, a keyboard, plosives, or one speaker much louder than the rest of a meeting. Round 2 drafted specific advice about the microphone, the keyboard and the desk; the owner asked for it to be less specific, since no one piece of advice fits every cause, so the warning says only to try adjusting how the sound is recorded.

- Approved: its words are now B11, with the owner's last sentence.
- VH-193 changes with it: the prediction becomes a measurement from the job, there is no pre-flight row, and its Teams criterion becomes "on the Teams recording the warning shows, and its figure is the job's logged bite", which is `afterChainLufs` + the solved gain − `limitedLufs`.

### Q7 — staff and student routes

**What the record says.** The owner: "students cannot open the Creators team on Teams"; the learning content team "is, but more for staff. Students should use the IT support route"; and "It's not terminal to have the staff routes exposed to students." Problem reports go to the learning content team (Q1), and the report's email carries the details that help find a fault in the tool, so that route is the same for everyone. The feedback form asks what anyone thinks of the tool. So only "Need help using the tool?" divides: staff have the Creators team and the learning content team, and students have Self Service. The page already asks "Video type", Staff video or Student submission, but that answer describes the video and its closing graphics, not the person: staff test the student side, and the default is Staff video, so a student who has not reached the switch would be told the wrong route.

**Options.**

1. **Label each route** (recommended). The footer shows every route all the time, and each help link says who it is for. Nothing depends on the Video type, nothing moves, and no one is shown a route only after making a choice.
2. **Follow the Video type.** Show only the staff help routes under Staff video and only Self Service under Student submission. It hides routes behind a choice made for another reason, the footer changes as the switch moves (Nielsen's consistency), and a student on the default sees no route of their own.
3. **Order by the Video type.** Show every route, with the chosen side's first. The order changes as the switch moves, and it still guesses who the person is from the video.

**Recommendation: option 1, approved.** Its rows are now the VH-182 section's help links, with the owner's changes.

- Approved, with the owner's change: "Need help using the tool?" holds only "Staff: ask in the Creators team on Teams (new tab)" and "Students: get help through Self Service (new tab)", staff first, since the tool is mainly for staff. "Email the learning content team" leaves the footer; problem reports still reach that team through Report a problem.
- For everyone, unlabelled: "Something not working?" with "Report a problem", and "What do you think of the tool?" with the feedback form, now "Please tell us what you think in the feedback form (new tab)" in the owner's words.
- Each link still says alone who it is for, where it goes and how it opens (2.4.9). No correction to the spec: S22's "grouped by need: help, a problem, an opinion" holds.
