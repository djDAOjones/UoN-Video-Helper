# Phase 8 wording sheet — 2026-10-24

The words and spec corrections for Phase 8, the owner's UX pass (PLAN-8, `project/decisions.md`, 2026-10-24). English only: the Chinese and Malay rows are machine drafts made at build time, through `scripts/strings-table.mjs`, and marked so for a native reader. Nothing here is applied until the owner approves it. Each item builds only from its approved rows.

Build order: VH-183, VH-184, VH-185 (no new words, start first), then VH-186, VH-187, VH-188, VH-189, VH-190, VH-182, VH-191, VH-192, VH-193, VH-194, and VH-195, the phase close. The spec stays within its 8,100 words at every step in that order.

## The owner's questions

Status at 2026-10-24. The owner's words are quoted verbatim in PLAN-8's Rationale.

| Question | Status | What was settled |
| --- | --- | --- |
| Q1, where problem reports go | Settled | "Problem reports go to `UI-Learning-Content@nottingham.ac.uk`." `FEEDBACK_ADDRESS` takes that address (VH-182). |
| Q1a, the other places that give the owner's address | Settled: "(agree)" | The statement's "Feedback and contact" line moves to the learning content team. The machine-translation note (`TRANSLATION_FEEDBACK_ADDRESS`) stays with the owner until the native readers' corrections arrive (VH-105.2). |
| Q2, the student link | Settled: "Yes" | `https://selfservice.nottingham.ac.uk`, link text "Self Service". |
| Q3, watching the finished video | Settled: option A | A plain native player in the finished card (VH-192). A new element, not a new kind of control, and no new words. |
| Q4, the two language switches | Settled: option 1 | Video language moves into step 3, locked with step 3 while a video is made (VH-191). |
| Q5, the preset names | **Being worked out** | Names that say what each output is for. See round 2. B6 and S1–S10 are provisional. |
| Q6, heavy limiting | **Being worked out** | The approach, the threshold and advice for the user. See round 2. B11 and S25 are provisional. |
| Q7, staff and student routes | **Being worked out** | How the footer's help and problem routes divide between staff and students. See round 2. The VH-182 help-route rows are provisional. |
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
- The three promises become "Adds the University's approved branding.", "Levels the audio so it is easy to hear." and "Makes a video file sized for where you will use it." This avoids "MP4", an abbreviation the readability list lacks.
- `app.description` → "Add the University of Nottingham's approved branding to a video, level its audio, and get a file sized for where you will use it, without uploading it anywhere."

### B5 — VH-187 — the browser note

`browserNote.pending` and `browserNote.passed` are removed. `browserNote.notPassed` is unchanged and shown only when a check fails or warns (Q8's condition). A fail or warn already seen takes precedence over checks still pending. Step 1's "Checking whether this browser can run the tool…" covers the pending state.

### B6 — VH-188 — the preset names (*provisional: round 2's Q5*)

- labels: "Larger / better" → "Best quality"; "Smaller / reduced" → "Smaller file"
- details: "For EchoVideo or YouTube etc." → "For EchoVideo, YouTube, and similar sites."; "For Moodle assignment uploads, messaging, or email etc." → "For Moodle assignment uploads, messages, and email."
- New prose for the record's {output}: "at best quality" and "as a smaller file", so the record reads "Made from X: the whole video (4 minutes), at best quality, a cut to…"

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
- Help links (*provisional: round 2's Q7*): creators → "Staff: ask in the Creators team on Teams (new tab)"; new `selfService` → "Students: get help through Self Service (new tab)". learningContent ("Email the learning content team") and feedbackForm are unchanged; `contact.intro` is removed.
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

### B11 — VH-193 — the heavy-limiting warning (*provisional: round 2's Q6*)

New warning `heavyLimiting`: heading "The loudest moments will be held down hard"; detail "Much of this recording is quiet next to its loudest moments. To bring it to the usual level, the tool will hold those moments down hard, which can make the voice sound flat or squashed. Listen to the new video before you use it."

## Spec corrections

Drafts for the owner, never applied before approval (`docs/` is protected). Each is applied in its item's commit. Applied together they take `docs/01-specification.md` from 8,074 to 8,100 of its 8,100 words, and `UI-STANDARDS.md` from 2,406 to 2,399 of its 2,400 (U2 is the trade U1 alone could not make). The deltas assume the recommended options: round 2's answers may change S1–S10 and S25, and a changed correction is redrafted here first. S23 was a no-op and is left off. S31 trades 28 words from §9.3's announcement contingency, which Announce progress resolved. S21 renames "The preview's content" to "The players' content" and covers the finished video's own additions, the title or submission card and the closing graphics, apart from the user's recording. Old text is matched with its line wrapping ignored: words separated by any whitespace.

**S1** — VH-188 — `docs/01-specification.md`, under “6. Video outputs” — -11 words — *provisional: round 2 may change it*

Old:

```text
the code's ids, and older references in these documents, call them "best quality" (`best`) and "smaller file" (`smaller`).
```

New:

```text
the code's ids are `best` and `smaller`.
```

**S2** — VH-188 — `docs/01-specification.md`, the heading itself — -1 words — *provisional: round 2 may change it*

Old:

```text
### 6.1 "Larger / better" — for EchoVideo or YouTube
```

New:

```text
### 6.1 "Best quality" — for EchoVideo or YouTube
```

**S3** — VH-188 — `docs/01-specification.md`, under “6.1 "Larger / better" — for EchoVideo or YouTube” — +1 words — *provisional: round 2 may change it*

Old:

```text
("For EchoVideo or YouTube etc." on screen)
```

New:

```text
("For EchoVideo, YouTube, and similar sites." on screen)
```

**S4** — VH-188 — `docs/01-specification.md`, under “6.1 "Larger / better" — for EchoVideo or YouTube” — -1 words — *provisional: round 2 may change it*

Old:

```text
above what "Smaller / reduced" asks of slides.
```

New:

```text
above what "Smaller file" asks of slides.
```

**S5** — VH-188 — `docs/01-specification.md`, the heading itself — -1 words — *provisional: round 2 may change it*

Old:

```text
### 6.2 "Smaller / reduced" — for Moodle
```

New:

```text
### 6.2 "Smaller file" — for Moodle
```

**S6** — VH-188 — `docs/01-specification.md`, under “6.2 "Smaller / reduced" — for Moodle assignment uploads, messaging or email” — -1 words — *provisional: round 2 may change it*

Old:

```text
("For Moodle assignment uploads, messaging, or email etc." on screen)
```

New:

```text
("For Moodle assignment uploads, messages, and email." on screen)
```

**S7** — VH-188 — `docs/01-specification.md`, under “6.2 "Smaller / reduced" — for Moodle assignment uploads, messaging or email” — -1 words — *provisional: round 2 may change it*

Old:

```text
"Larger / better" is *anchored*
```

New:

```text
"Best quality" is *anchored*
```

**S8** — VH-188 — `docs/01-specification.md`, under “9.1 Workflow” — -2 words — *provisional: round 2 may change it*

Old:

```text
— "Larger / better" or "Smaller / reduced"
```

New:

```text
— "Best quality" or "Smaller file"
```

**S9** — VH-188 — `docs/01-specification.md`, under “10. Browser support” — -1 words — *provisional: round 2 may change it*

Old:

```text
1080p25 "Larger / better"
```

New:

```text
1080p25 "Best quality"
```

**S10** — VH-188 — `docs/01-specification.md`, under “13. Acceptance criteria” — -1 words — *provisional: round 2 may change it*

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

**S25** — VH-193 — `docs/01-specification.md`, under “5.4 Audio-quality warnings” — +15 words — *provisional: round 2 may change it*

Old:

```text
| No audio track | Source has no audio stream |
```

New:

```text
| No audio track | Source has no audio stream |
| Heavy limiting | Landing −16 LUFS needs over 6 LU of limiting (`HEAVY_LIMITING_LU`) |
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
