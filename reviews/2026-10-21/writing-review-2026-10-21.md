# Writing review, 21 October 2026: the English page text

A proposal for the owner. No source file was changed. Reviewed: `src/i18n/en-GB.ts` and the static text in `index.html`, against `write-for-the-reader` and the house voice, in review mode. The owner's decisions of 21 October are treated as applied, so proposed text says "closing graphics".

## 1. Verdict

The page already meets most of the standard, because errors say what happened, that the original is safe, and what to do next, and conditions usually come before the step they limit. Six changes fix real errors (a broken sentence, a misplaced "it", a confusing "must" sentence, and two claims wider than the facts). The rest are unclear pronouns, colon and dash pivots, and phrasal verbs; all other text needs no edit.

## 2. Proposed changes

Rank 1 is a barrier or an error of meaning, rank 2 a clear gain, rank 3 polish. Every new word passes the test "does it say everything the old one did, here?"

| Rank | Key | Current | Proposed | Reason |
| --- | --- | --- | --- | --- |
| 1 | `preflight.reasons.veryLongJobUnknown`, `longJobUnknown` | "This will take about a long time." / "…about a while." | "This will take a long time." / "…a while." | "About" belongs to the version with a figure; without one the sentence breaks. |
| 1 | `source.losses.captionsConsequence` | "…so wherever you publish it must supply captions. EchoVideo makes its own after upload — check them. A file sent directly needs captions added by you." | "…so captions must come from wherever you publish it. EchoVideo makes its own captions after upload, so check them. If you send the file directly, add captions yourself." | "publish it must" makes the reader reread; the dash hides "so"; the last sentence hides who acts. The "must" is the author's but does not say what binds it, so the owner may name a policy; we have not assumed one. |
| 1 | `failure.unreadable.notAVideo` | "It needs to be a video file — one whose name ends .mp4, .mov, .mkv or .webm — and it may be damaged." | "It may not be a video file, or it may be damaged. A video file's name usually ends .mp4, .mov, .mkv, or .webm." | "And" joins a possible cause to a requirement, so damage reads as part of the requirement. "Usually" keeps the claim at its scope (the picker also takes .m4v). Serial comma. |
| 1 | `failure.tryAgain`, `unlevellable.next`, `encoderRefused.next`, `checkFailed.next`, `startup.workerNotStarted`, `captured` | "If it happens again, report it with the Send feedback button — the details it adds will help." | "If the problem happens again, report it with the Send feedback button, which adds details that will help." ("Report the problem" where "it" has no noun.) | These follow "Your original file has not been changed", so "report it" first reads as the file; one sentence also uses "it" for the problem and the button. Repeat the noun. |
| 1 | `result.lifetime`, `create.note` | "It is kept here only until you save it or close this tab." | "It is not saved yet. It stays here until you start another video or close this tab." (`create.note` alike, plus "Save it before then.") | Saving does not remove the video, as `result.lifetimeDelivered` and `save.download` say it stays. Owner to confirm the intent was "your only copy is here until you save it". |
| 1 | `statement.compliance.text` | "Only automated checks have been run so far…" | "Only automated checks, and our own checks by hand while building it, have been run so far…" | `statement.testing.manual` says "We have also checked it by hand", which contradicts "only". |
| 2 | `trim.intro`, `trim.unreadable`, `result.endedEarly.*` | "…as it is now: the sound is levelled…" / "There is no video to trim: that file…" / "…ends early: its picture stops at…" | "…as it is now, because the sound is levelled and the closing graphics added when the video is made." / "…to trim, because that file…" / "…ends early. Its picture stops at…" | No colon pivots, so a reason takes "because"; a detail is its own sentence, as in `warnings.endsEarly`. The test's pinned words still match. |
| 2 | `preflight.reasons.longJob`, `longJobUnknown` | "Keep this tab open while it runs — closing it stops the job." | "Keep this tab open while the job runs, because closing the tab stops the job." | Two "it"s with two referents, the job then the tab; the dash hides "because". |
| 2 | `browserNote.pending` | "…for Chrome, other browsers may not work." | "…for Chrome, so other browsers may not work." | A comma splice; "so" names the link. |
| 2 | `browserNote.notPassed` | "…has not passed all of its checks." | "…has not passed all the checks for it to run." | "Its" points at "this browser". Uses the owner's own `passed` wording. |
| 2 | `choose.drop.notVideo` | "Drop a video — a file whose name ends .mp4 or .mov, say — or choose one above." | "Drop a video file, such as one whose name ends .mp4 or .mov, or choose one above." | "Say" for "for example" is an idiom. The pinned words stay. |
| 2 | `status.saved`, `save.download` | "Check it where you saved it, then upload it where it is going —" | "Open the saved file to check it, then upload it to where you will use it," | "Where it is going" is an idiom naming no place, in a chain of four "it"s. |
| 2 | `source.losses.uncheckedDetail` | "…cannot be checked for them. If yours has them…" | "…cannot be checked for caption or chapter tracks. If your file has them…" | "Them" refers to a separate title line a screen reader may not join to it. |
| 2 | `source.losses.keepOriginals`, end of `extraTracksDetail` | "If you need the originals, keep this file alongside." / "…keep the original alongside." | "If you need the original tracks, keep this file alongside the new one." / "…keep the original file alongside the new one." | "The originals" could be files or tracks; "alongside" has no object. |
| 2 | `warnings.veryQuiet.detail` | "Levelling will bring it up — but turning up quiet speech turns up whatever else was in the room too." | "Levelling will raise its level, but raising quiet speech also raises any other sound recorded in the room." | "Bring up" and "turn up" are phrasal verbs whose meaning shifts ("bring up" also means "mention"). |
| 2 | `trim.correctToContinue`, `titleCard.correctToContinue`, `failure.badTrim.next` | "Put the start and end times right in step 2…" | "Correct the start and end times in step 2…" (step 3 alike) | "Put right" is an idiom; "correct" is common, precise, and shared across languages. |
| 2 | `warnings.metadataLost.heading`, `.detail` | "The file's title and date could not be copied across" / "…a title, author or date, … — you can still add them…" | "The file's title, author, and date could not be copied across" / "…a title, author, or date, … You can still add them…" | The heading is narrower than the detail and the warning, which covers every tag. Serial comma; no dash. |
| 2 | `feedback.someOmitted` | "…the copy has them all." | "…"Copy message and details" includes them all." | The reader has made no "copy"; name the button. |
| 2 | `trim.problem.notTimes` | "The start or end of the video is not a time." | "The start or end time could not be read as a time." | The start of a video is always a time; the fault is the typed value. |
| 3 | `source.variesNote`, `titleCard.submission.idsHelper` (and `index.html`), `feedback.whatSentDetail` | "Teams, Zoom and screen capture" / "spaces, commas or new lines" / "picture size and format" | "Teams, Zoom, and screen capture" / "spaces, commas, or new lines" / "picture size, and format" | The serial comma in every list of three. The last breaks a test (section 4). |
| 3 | `preflight.reasons.veryLongJob`, `estimateUnavailable`, `failure.unreadable.tookTooLong`, `statement.enforcement.text`, `feedback.tooLong` | "carry on" / "work out" / "ran into a problem" / "get in touch with" / "in one go" | "continue" / "estimate" / "had a problem" / "contact" / (delete) | Phrasal verbs and idioms with a precise common equal. "Continue" is the page's own word; "contact" is the GOV.UK model's. |
| 3 | `titleCard.submission.idTwice`, `idsTooMany`, `failure.encoderRefused.next` | "Take one out." / "The card takes up to {max}." / "the other output" | "Remove one." / "The card holds up to {max}." / "the other option" | "Take" is general-purpose; "output" here means the option, not the file. |
| 3 | `status.refusedSource`, `preflight.reasons.storageUnknown` | "…or folder — this tool never changes…" / "…nothing is saved — your original…" | "…or folder, because this tool never changes…" / "…nothing is saved. Your original…" | A dash pivot hides the link. |
| 3 | `statement.plans.items[2]` | "zooming in to 400%, and a screen 320 pixels wide" | "zooming in to 400%, and using a screen 320 pixels wide" | Parallel form: each item completes "We are thinking of:". |

Not proposed: `statement.contact.text` and `statement.about.dates` still name Joe Bell now that `covers` does not and the footer points to the teams. Whether they follow is the owner's call.

## 3. Patterns to keep

- Every failure says what happened, that the original is unchanged, and what to do next, in that order.
- Figures carry their meaning beside them: "samples a second", "student ID (identity) number", "level AA, the middle of their three levels".
- A condition comes before its step: "If you are browsing privately, an ordinary window usually works".
- Hedges sit at the claim, with the reason: "It was probably saved in a format made for editing software".
- Warnings say what the tool cannot do: "This tool does not remove noise".
- Controls are named as they appear on screen ("the Send feedback button"), and steps by number.
- "Must" is rare; every key is a whole sentence, never assembled from parts.
- `progress.jobNotice` is a model: the instruction, then its consequence, in two short sentences.

## 4. Where the skills disagree with a project rule

- The readability gate (Flesch–Kincaid, grade 10) counts long words as harder, whereas the owner's rule is that precision beats shortness. Run the gate on "correct", "estimate", and "contact"; a failure wants a shorter sentence, not a word that says less.
- `test/readability.test.ts` pins "picture size and format", which blocks the serial comma in `feedback.whatSentDetail`; the test and the string would change in one commit.
- Spec 9.2 fixes "Analysing audio" and the lede says "audio levels", while the rest of the page says "sound". UI-STANDARDS forbids synonyms for one concept, but the owner's rule favours "audio" as a word shared across languages. The owner's choice; nothing proposed.
- `write-for-the-reader` says never to certify conformance, but the statement self-certifies "partially compliant". That is the owner's recorded decision; nothing proposed.
- No conflict was found between the skills and the owner's decisions of 21 October.
