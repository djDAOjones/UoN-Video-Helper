# The scenarios — VH-171, draft, 22 October 2026

The page is described as it stands at `eae49ea`. The rows were then checked
against the source at `fc50023` (`scenario-check-2026-10-22.md`) and corrected;
`src/` is the same at both. The catalogue
(`reviews/2026-10-20/states-2026-10-20.md`) was taken at `d38ee79`. Each of its
64 rows maps to one or more scenarios, S-01 to S-91. A row holding several
behaviours becomes several scenarios: row 53 becomes S-66 to S-70 and row 54
becomes S-77 to S-80. The plan's additions are marked "+". Every scenario is
walked, or it says why it is source-only. None is source-only by default. An
equivalent state reuses another scenario, with the reason recorded, so there
is no full cross-product. "Meant to do", "Competes" and "Repeats" carry the
catalogue's words, shortened and corrected where the page has changed.
"Choices" means Video type, Video language, trim, card, closing and preset.
"Focus held" means `focusHeldBy` (`src/main.ts:898`). It moves focus only if
focus was on the control the change removes. Otherwise focus stays where the
person is reading.

**The walker this needs.** The base is VH-163's walker: `walk.mjs`,
`design-walk.mjs` and `fixtures.sh`. A capture name in the table, such as
`en-staff 07`, is that walker's existing step: `desktop-en-staff` and
`phone-en-staff` in `walk.mjs`. Walking the rest needs these declared faults,
kept apart from the keyboard route:

- **F1:** the worker's script held with CDP `Fetch.requestPaused`. The ping's
  deadline is 5 s (`main.ts:1155`), so the pending state is captured inside
  it. Held past it, the page turns to the blocked `workerNotStarted` variant
  (`main.ts:1324–1335`).
- **F2:** an init script that removes `VideoEncoder`.
- **F3:** the worker's storage estimate reports a set quota, by F9's route
  (`Storage.overrideQuotaForOrigin` changes nothing in a walk's own browser
  context, probed). S-56 and S-57 need a working-space write that fails
  part-way; not yet written.
- **F4:** variants of the existing `showSaveFilePicker` stub (`walk.mjs:63`):
  - a; it throws `AbortError`.
  - b; its writable is slow.
  - c; its handle's `getFile()` returns the chosen source file.
  - d; `createWritable` rejects. `saveFile` turns any error but `AbortError`
    into a download (`src/media/save.ts:178–196`), so d gives S-70's
    download hand-off, not a failure.
  - e; no save picker (`showSaveFilePicker` removed) and an init script whose
    `URL.createObjectURL` throws. It is the only way `saveFile` throws
    (`save.ts:193`), so the `catch` at `main.ts:3361` shows "could not be
    saved". The throw must spare the preview's own object URL
    (`main.ts:1764`), or the read fails first.
- **F5:** clipboard permission granted or denied (`Browser.setPermission`),
  paired with `Emulation.setFocusEmulationEnabled`. Headless Chrome refuses
  the clipboard to a document without focus.
- **F6:** the closing graphics' URLs blocked (`fetch` at `src/media/branding.ts:261`):
  - a; only `closing-onset-*.webm`, which gives `fellBackToCut`.
  - b; every closing graphic URL, onset and tail, which gives `notLoaded`.
- **F7:** the preview's `error` event dispatched. No fixture is known that
  the player refuses and the job accepts.
- **F8:** an `ErrorEvent` dispatched (`walk.mjs:789`).
- **F9:** the worker's storage estimate rejects. The estimate runs in the
  worker (`src/media/capability.ts:157–184`), so a page init script cannot
  reach it. The worker module's response is rewritten over CDP `Fetch`, with
  the fault put before its code.
- **F10:** the pre-flight throws, by F9's route. A worker prelude makes one
  call the check needs throw an unclassified error, which the worker reports
  as `check-failed` (`src/workers/job.worker.ts:620–625`). The pilot names
  the call.
- **F11:** the job's messages dropped once it runs, by F9's route. The page's
  watchdog stops the job after 120 s of silence (`WORKER_SILENCE_LIMIT_MS`,
  `src/config/thresholds.ts:37`). The locks then hold until the worker
  answers, or 10 s (`main.ts:3088`).

It also needs four new fixtures:

- **N1:** a cut-short MKV.
- **N2:** a long, low-cost 1080p still-image MP4, sized in the pilot to estimate
  20–60 minutes and over 60 minutes (`src/config/thresholds.ts:82`). CPU
  throttling is the fallback.
- **N3:** a float-PCM file with a burst above +6 dBFS.
- **N4:** a clip under 1 s, shorter than the closing's 1 s onset
  (`src/config/branding.ts:51`), for S-55's freeze fallback
  (`src/media/branding.ts:201`). A trim cannot make one: it keeps at least
  3 s. The pilot confirms the page reads it.

**Changed since `d38ee79`, carried into the cells below:**

- Page language is in the header band (VH-154).
- Show progress was added and then withdrawn (VH-141, VH-150). Announce
  progress stays.
- A line says that a switch applies to the next video (VH-140).
- The job line names the job's choices.
- A staff card with only the date is now refused (VH-157).
- An unreadable file now withdraws steps 2–5. Create stays only beside a
  result (`src/main.ts:1749`).
- A file that ends early is now said (VH-139, VH-158).
- A storage block clears when the re-check starts (`src/main.ts:948`).
- Errors captured is announced and names its own button (VH-149).
- The result's warnings and its download line now hold (VH-141).
- The footer has a feedback form link (VH-160) and a Teams link for the
  creators team.

No catalogue row has gone from the page. Three behaviours inside rows are
retired, and the scenario that replaced each one says so: the date-only card
being made (S-37), the cut-short file said as whole (S-22), and the steps
standing beside an unreadable file (S-30).

| ID | Row(s) | Journey | Scenario | Setup | Expected transition | Focus after | Status (visible / announced) | Values kept | Meant to do | Competes | Repeats | Walk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S-01 | 30 | — | Startup pending | Load; worker held (F1), captured inside the 5 s ping deadline (`main.ts:1155`) | Chooser disabled until the checks settle (`main.ts:2409`) | Unmoved | Step 1: "Checking whether this browser can run the tool…" (`main.ts:1289`); "System check — checking" / the step 1 line is live | — | Wait | — | — | walked, F1; held past 5 s, the page turns blocked (`workerNotStarted`) and Errors captured appears (`main.ts:1324–1335`), a second blocked variant recorded beside S-02 |
| S-02 | 31 | J3 | Startup blocked | Load with F2 | The chooser stays disabled; the reason goes beside it; System check opens (`main.ts:794`) | Unmoved | The reason; the browser sentence "has not passed"; the failing rows / the reason, said once | — | Follow the remedy | — | — | walked, F2 |
| S-03 | 01 | J1 | Empty | Load | — | Body; Tab reaches the skip link, Page language, Video type, Video language, Choose file | Lede; three switchers; "Choose a video" over one filled button, "Or drop it here." / none | Remembered language, side and video language | Choose a file | Three questions before the first action, though Page language is now in the band | The lede's lead-in (parked) | walked (en-staff 01) |
| S-04 | 32, 63 | — | Page language switched | S-03 or any later state; choose zh-Hans | The page repaints in place; other live regions are quiet for two frames (`main.ts:3635`) | Stays on the radio | Everything in the new language / "页面语言：简体中文。" once, said in the language chosen (`main.ts:3664`; `src/i18n/zh-Hans.ts:32`) | Video, trim, choices, job, result, feedback draft | Choose the page's language | Its three names look like Video language's | The names, twice, rightly | walked (zh-sub, ms-staff) |
| S-05 | 33 | — | Machine-translation notice | zh-Hans or ms-MY | The notice above the title | — | "Machine translation — …"; "Email better wording to …" / none | — | Read once | It sits above the title | — | walked (zh-sub 01) |
| S-06 | 64 | — | Remembered language and side; statement by its address | Choose zh + Submission, then reload; load `#accessibility-statement` | `lang` and the side are read as the module loads (`main.ts:251`, 634), before the first paint; the statement opens for its fragment (`main.ts:3584`) | Unmoved | Chinese page; Submission chosen / none | Language, side, video language | Carry on | — | — | walked (remembered-language) |
| S-07 | 34 | J2 | Video type | Choose Student submission | Step 3 shows the submission card; Internal use only is locked on | Stays on the radio | "If the video has closing graphics, they say 'Internal use only'." / none | Staff card kept for the way back | Say what the video is | — | — | walked (en-sub 01) |
| S-08 | 35 | — | Video language | Choose ms-MY on an English page | Card and closing words follow | Stays on the radio | Two helper lines / none | Typed text as typed | Choose the words' language | Looks like Page language | — | walked (en-sub 07, `video-language-changed`) |
| S-09 | 02 | J1 | Drag held | Drag a video over the zone, no drop | The zone turns solid with a ring | Unmoved | "Let go to read this video." / none | — | Drop | — | — | walked (en-staff 02) |
| S-10 | 03 | — | Drop refused: not a video | Drop `notvideo.mp4` as text/plain | Refused; nothing read | Unmoved | "That is not a video file. …" / said (role alert) | Previous state | Choose a file | — | — | walked (en-staff 03) |
| S-11 | 03 | J4 | Drop refused while busy | Drop during S-48 | Refused | Unmoved | "A video is being made. Cancel it, or wait …" / said | Job | Wait | — | — | walked (new step) |
| S-12 | 06 | J1 | Reading | Choose `lecture-360s` | The verdict, trim and result are cleared | Stays on the chooser | "Reading the video…" / said | Choices, apart from the trim | Wait | — | — | walked (en-staff 05) |
| S-13 | 06 | J4 | Reading a replacement beside a kept result | S-53 unsaved; choose `lecture-60s` | The result is redrawn as the previous video; steps stand | Stays on the chooser | "Reading the video…" / said | Result, choices | Wait | Two files in view | — | walked (new step): the replacement's read, captured before it settles; design-walk's `previous-longname` is the settled S-63 state. The catalogue's source-only half |
| S-14 | 07 | J1 | Checking | After S-12 | Steps 2–6 shown; "Stop the check" offered | Stays on the chooser | Read line; "Checking this video against your device…" / both said | — | Wait | Five open steps; preview up to 60vh | — | walked (en-staff 06) |
| S-15 | 08 | J1 | Ready | After S-14 | Verdict; Create filled; the lifetime note | Create, if held on Stop (`main.ts:1614`) | "Ready to go — about 4 minutes … up to 303 MB" / "Device check complete. Ready to go." | — | Create | — | — | walked (en-staff 07) |
| S-16 | 57 | — | Video properties open; losses | Choose `captioned-12s`; open Video properties | The rows show; the losses box sits above them | Stays on the summary | "This file has 1 caption track …" / the count said with the read line | — | Inspect; understand the loss | — | — | walked (en-staff 39 + open) |
| S-17 | 09 | J1 | Onset help open | S-15; press About animation onset | The toggletip opens in flow; Escape or a click outside closes it (`main.ts:712`) | Stays on the button | Two terms / `aria-expanded` | — | Read, return | Expands the page | — | walked (en-staff 08) |
| S-18 | 17 | — | Sound notes: quiet | Choose `quiet-30s` | The verdict, then the notes | As S-15 | "Worth knowing about the audio — This recording is very quiet …" / said after the verdict | — | Create | — | — | walked (en-staff 40) |
| S-19 | 17 | — | Sound notes: loud | Choose `loud-30s` | As S-18 | As S-15 | "The audio may be distorted in places" / said | — | Create | — | — | walked (en-staff 41) |
| S-20 | 27 | — | No audio | Choose `silent-10s` | Read line, then note | As S-15 | "Video read." **"No audio."**; "This video has no audio — …" / said | — | Create | — | — | walked (en-staff 38) |
| S-21 | 26 | — | Too short | Choose `short-2s` | Trim locked | As S-15 | "It is shorter than 3 seconds, so it cannot be trimmed." / none | — | Continue | — | — | walked (en-staff 37) |
| S-22 | 61 | J3 | File ends early (MP4) | Choose `truncated-30s` | Warning before Create; the record says what was made (VH-139) | As S-15 | "The file ends early — Its audio stops at 0:20 of 0:30 …" / said | — | Find a complete copy, or continue | — | — | walked (en-staff 43); "the page sees no problem" retired, VH-139 |
| S-23 | 61, + | — | Cut-short MKV | Choose N1 | Said first among the warnings (VH-158) | As S-15 | "The video file is shorter than expected" / said | — | As S-22 | — | — | walked, N1 |
| S-24 | 62, + | — | Long job, 20–60 min | Choose N2, sized for this band | Warn verdict | As S-15 | "Ready, with one thing to know — This will take about … Keep this tab open …" / said | — | Create | — | — | walked, N2 |
| S-25 | 62 | — | Very long job; acknowledged | N2 over 60 min; press Continue anyway | Discourage; Continue anyway takes Create's place; pressing it shows Create | Create (`main.ts:2207`) | "This will work, but it will be slow" / said | — | Decide | — | — | walked, N2 |
| S-26 | 13 | — | Phone discouraged | `phone-en-staff`; `lecture-60s` | As S-25 for a phone | Create after Continue anyway | "This may not finish on a phone or tablet" … / said | — | Decide | — | — | walked (phone 02, 03) |
| S-27 | 60 | — | Decode damage | Choose N3 | A note with its times | As S-15 | "A damaged moment will be silenced — At 0:12 …" / said | — | Understand the silence | — | — | walked, N3; source-only if Chrome clamps the burst, with that reason recorded |
| S-28 | 24 | J3 | Blocked file | Choose `prores-1080p.mov` | The block goes beside the chooser; steps 2–6 withdrawn (`main.ts:1580`) | The chooser, if held on Stop (`main.ts:1592`) | "This cannot run here — … Export it again as an MP4 …" / said once | — | Re-export | — | — | walked (en-staff 35) |
| S-29 | 25 | J3 | Unreadable, no result | After S-28; choose `notvideo.mp4` | Failure at step 1; steps withdrawn; the chooser leads again | Stays on the chooser | "This file could not be read as a video. …" / said | — | Choose another | — | — | walked (en-staff 36) |
| S-30 | 25 | J4 | Unreadable beside a kept result | S-53 unsaved; choose `notvideo.mp4` | Steps 2–5 withdrawn; Create stays with the result; Save stays the one primary (`main.ts:1749`) | Stays on the chooser | As S-29 / said | Result | Choose another, or save | Two outcomes in view | — | walked (new step); "steps stand, Create empty" retired, VH-150 |
| S-31 | 28 | J3 | Storage block | Quota below need (F3); choose `lecture-360s` | Block at step 1; trim and preset still usable; Check again | The chooser, if held on Stop | The remedy; "Keep less … choose Smaller … then press Check again." / said | Choices | Free space, keep less, or Smaller | — | — | walked, F3 |
| S-32 | 58 | — | Preview unavailable | S-15; F7 | Note shown; Set start and Set end locked | The time field, if held on a Set button (`main.ts:1980`) | "A preview is not available for this file. You can still set the times." / said (`main.ts:1982`) | Trim | Use typed times | — | — | walked, F7 |
| S-33 | 10 | — | Trim invalid | Type `abc` in Start time, then Tab | Error beside the field; no verdict, no Create | Set start here, the next control (`index.html:190`) | "Write the start time as minutes and seconds …"; step 6: "Correct the start and end times in step 2 to continue." / said | Typed text | Correct the start | — | Step 6 restates step 2 (required) | walked (en-staff 09) |
| S-34 | 11 | — | Check after a trim | Type `0:05`, then Tab | Verdict withdrawn; re-check; an old block clears | Unmoved | "Checking this video against your device…" (`main.ts:1886`); Stop the check / said | Trim | Wait | — | — | walked (en-staff 10) |
| S-35 | 12 | J3 | Check stopped; Check again | During S-34, press Stop the check | Stopped; Check again offered | Check again (`main.ts:2285`); on pressing, Stop | "Check stopped." / said | Trim | Check again | — | — | walked (en-staff 13) |
| S-36 | 36, 40 | J1 | Staff card off | S-15 | — | — | The intro alone; the rule line is empty while the box is unticked (`src/ui/title-card-step.ts:123–126`, `main.ts:2606`) / none | Typed values while unticked | Continue, or tick | — | — | walked (staff-card 08) |
| S-37 | 37, 38 | J1 | Staff card on; refused empty or date-only | Tick; press Create with the date only, then with it cleared | Refused both times (VH-157) | Title (`main.ts:2646`) | "Type a title, department, or authors, or untick Add a title card."; step 6 line / said | The date | Type, or untick | Error at the box, focus at Title | — | walked (staff-card 01, 03, 04; new step): the date-only refusal, captured after the first Create, since step 02 runs only if a job started. "A date-only card is made" retired, VH-157 |
| S-38 | 39 | — | Staff field full | Type past the limit in Title | Text held at the limit | Unmoved | "This field is full, so the rest was not added." / said | Typed text | Shorten | — | — | walked (staff-card 05) |
| S-39 | 40 | J1 | Staff card filled | Type Title, Department and Authors | — | Unmoved | Values; the record will say "a 5-second staff title card" / none | Values through untick and tick | Create | — | — | walked (staff-card 06, 08) |
| S-40 | 41 | J2 | Submission, empty | S-07 after S-15 | Box ticked and locked; four fields | Unmoved | "A student submission always has a title card."; "All four fields are needed."; running-time line / none | Staff card | Fill four fields | Fixed: the rule now comes first (V-06) | — | walked (en-sub 03) |
| S-41 | 42 | J2 | Submission refused | Press Create while empty | Four errors, one beside each field | First field (`main.ts:2638`) | Each "Type …"; "Correct the title card in step 3 to continue." / said | Typed values | Fill each | — | — | walked (en-sub 04) |
| S-42 | 43 | J2 | Submission filled | Fill all four | — | Unmoved | Values; the running-time line / none | Values | Create | — | — | walked (en-sub 05) |
| S-43 | 44 | J2 | Submission locked while running | S-42; Create | Fields locked | Cancel (J2 by keys) | "Locked while your video is being made." / none | Values | Wait | The ID box looked editable (V-03, check again) | — | walked (visual-checks step3-submission-locked) |
| S-44 | 45 | J1 | Internal use only, staff | Tick it | The result line grows | Unmoved | "The card says 'Internal use only' under the logo." / none | — | Choose | — | — | walked (en-staff 19) |
| S-45 | 46 | J2 | Internal use only, submission | Submission side | Ticked and locked | Unmoved | "Always on for a student submission."; under None, "Not used with None." / none | Staff box as it was | Understand why | — | — | walked (en-sub 06) |
| S-46 | 47 | — | Closing None | Choose None | Onset, colour and internal locked, each with a reason | Unmoved | "No University closing graphics will be added." / none | Other closing choices | Continue without | — | — | walked (en-staff 18) |
| S-47 | 48 | J1 | Cut, Fade or Slide; onset; colour | Each in turn | The result line says what the file will do | Unmoved | e.g. "Your last frame is held while the blue closing graphics slide in … Adds 5 seconds." / none | — | Choose | Long onset option at phone width (fits) | — | walked (closings *-step4) |
| S-48 | 14 | J1 | Running | S-15; Create | Steps 2–5 locked; bar, stage, job line, tab notice, Announce progress, Cancel | Cancel, if held on Create (`main.ts:2920`) | "Encoding video — 18%"; "This video: Staff video. Video language: English."; the tab notice / "Creating your video. Keep this tab visible …" | Choices | Wait; Cancel if needed | Live switches above, now marked as for the next video (V-05, VH-140) | — | walked (en-staff 23) |
| S-49 | 51 | J1 | Time left | S-48, 10 s into the encode | Its own line | Unmoved | "About 50 seconds left" / only with milestones | — | Wait | — | — | walked (en-staff 24) |
| S-50 | 14, + | J4 | Type and video language switched while running | S-48; choose Submission and ms-MY | The job keeps what it started with; the next-video line shows (`main.ts:2143`) | Stays on the radio | "Changes to the video type or video language apply to the next video you make." / none | Job, choices | Carry on | — | The job line beside the switches | walked (new step) |
| S-51 | 15 | — | Cancelling | S-48; Cancel | Bar hidden; Cancel disabled; title reset | Cancel disabled; focus noted for S-52 (`main.ts:3117`) | "Cancelling…"; "Locked while the job stops." / said | Choices | Wait | Late reports (V-14, now guarded) | — | walked (en-staff 25); about 9 ms, so the capture is timing-bound |
| S-52 | 16 | — | Cancelled | After S-51 | Locks lifted | Create, if held on Cancel (`main.ts:2993`, handed on at 3050) | "Cancelled. Nothing was saved, and your original file is unchanged." / said; title "Cancelled — …" | Choices | Create again | — | Required reassurance | walked (en-staff 26) |
| S-53 | 18 | J1 | Finished | S-48 to the end | Result with record, lifetime and Save filled; Create outlined | The result, if on Cancel (`main.ts:2947`); else unmoved | "Finished video — 286 MB"; "Made from …" / "Your video is ready." + notes; title "Ready — …" | Choices | Save | — | — | walked (en-staff 27) |
| S-54 | 49 | — | Finished, each closing | `closings` | The record names the closing as applied | As S-53 | e.g. "a cut to the blue closing card, marked 'Internal use only'" / said | — | Save | — | — | walked (closings *-finished) |
| S-55 | 50 | — | Closing changed: fell back | N4 with Fade (fell back to freeze); any file with Fade and F6a (fell back to cut) or F6b (not loaded) | A line beside the result | As S-53 | "Your video is shorter than the fade animation …"; "You chose Fade, but the animation could not be loaded, so this video cuts to …"; or "The closing graphics could not be loaded …" / said | — | Understand the file before saving | Fixed: now inside the kept result (V-11) | — | walked (new step), N4, F6a, F6b |
| S-56 | 29 | J3 | Failed | S-15; lower the quota after the verdict (F3); Create | Failure box; out of space comes back as a `failed` reply, so the locks clear at once (`main.ts:2996`, 3046–3052). The locks-held path is S-90 | The failure box, if on Cancel (`main.ts:2998`, handed on at 3050) | "This device ran out of working space part-way through. Free some space, or choose Smaller …" / "The video could not be created. …"; title "Not made — …" | Choices | Follow the cause | Stale furniture (V-14, now withdrawn) | — | walked, F3 (the pilot confirms the job runs out; else a worker fault); was source-only |
| S-57 | + | J3 | Retry after a failure | S-56; restore the quota; Create | New job; fresh bar (VH-150) | Cancel, if held on Create | As S-48 | Choices | Retry | — | — | walked, F3 |
| S-58 | 19 | J1 | Discard question | S-53 unsaved; Create | The question replaces the result | The question panel (`main.ts:2807`) | "This video is not saved yet — You have not saved …"; record; Discard (danger), Keep it / said once | Result | Decide | — | — | walked (en-staff 28) |
| S-59 | 19 | J2 | Keep it | S-58; Keep it | Result redrawn | The result heading, if held on Keep (`main.ts:2786`) | Result as S-53 / the question unsaid | Result | Save | — | — | walked (en-staff 29) |
| S-60 | + | J4 | Discard confirmed | S-58; Discard it and start again | Result released; new job | Cancel | As S-48 | Choices | Wait | — | — | walked (closings) |
| S-61 | 20 | J1 | Saving | S-53; Save (F4b) | Stop saving beneath; steps locked | Stop saving, if held on Save (`main.ts:3264`) | "Saving…" / said | Result | Wait | — | — | walked (en-staff 30) |
| S-62 | 21 | J1 | Saved | After S-61 | "Saved" disabled; lifetime line gone; Create outlined | The result, if held on Save or Stop (`main.ts:3350`) | "Saved. Open the saved file to check it, then upload it …" / said | Result, choices | Use the file, or choose another | V-12: focus noted before Stop saving goes (`main.ts:3286`) | — | walked (en-staff 31) |
| S-63 | 22 | J4 | Previous video | S-53 unsaved; choose `lecture-60s` | New verdict; "Previous video" with its record; Save filled; Create outlined | Stays on the chooser | "Previous video — 21.5 MB" / the new verdict said | Result | Save the previous, or create the new | Two files, by design | — | walked (en-staff 32) |
| S-64 | 22, 50 | J4 | The previous result's warnings | S-22 finished, unsaved; choose `lecture-60s` | The ended-early line stays with the previous result | Stays on the chooser | "The file you chose ends early …" inside "Previous video" / none new | Result | Understand before saving | — | — | walked (new step) |
| S-65 | 52 | J4 | Saving the previous while checking the next | S-63 during the check; Save (F4b) | Two lines, one for the save and one for the check (VH-135) | Stop saving | "Saving…" under the result; "Checking …" in step 6 / both said | Both | Follow two things | — | — | walked, F4b; was a Chrome-only check |
| S-66 | 53 | J3 | Save stopped | S-61; Stop saving | The save is aborted; an empty file is removed | Save, if held (`main.ts:3386`) | "Stopping the save…", then "Save stopped. The video is still here when you want it." / said | Result | Save again | — | — | walked, F4b |
| S-67 | 53 | — | Picker cancelled | Save (F4a) | Nothing written | Save, if held | "Not saved. The video is still here when you want it." / said | Result | Save again | — | — | walked, F4a |
| S-68 | 53 | J3 | Refused: the source file | Save (F4c) | Refused before writing | Save, if held | "That is the file you started with. Choose a different name or folder …" / said | Result, original | Choose elsewhere | — | — | walked, F4c |
| S-69 | 53 | J3 | Save failed | Save (F4e) | An error box above the save line | Save, if held | "The video could not be saved. It is still here to try again." / said | Result | Save again | — | — | walked, F4e |
| S-70 | 23, 53 | J1 (phone) | Download handed off; retry; download discard question | `phone-en-staff`; Save; Save again; Create | Lifetime becomes the delivered line and holds; Save stays live; the question is the download kind | Save, if held: after a download `saved` stays false (`main.ts:3386`); then S-58 | "Saving to your downloads folder — the browser may still be finishing it …"; "Your download may still be finishing. …" / said | Result | Check the download | — | — | walked (phone 09–11; new step): Save pressed again after 10, captured as the retry |
| S-71 | + | J4 | Type and video language switched beside a kept result | S-53; switch both | The record keeps its own language and kind; the next-video line shows | Stays on the radio | "Video language: …" in the record if not the page's; next-video line / none | Result | Carry on | — | — | walked (new step) |
| S-72 | + | J1 | Focus left where the person reads | S-48 by keys; move focus to Video properties; let the job finish; repeat for a save | Nothing moves focus (`main.ts:898`) | Stays on the summary | As S-53 and S-62 / said | All | Keep reading | — | — | walked (new step) |
| S-73 | + | — | Ready, storage unknown | F9: the worker's storage estimate rejects | Warn verdict | As S-15 | "This browser will not say how much free space there is …" / said | — | Create | — | — | walked, F9, its own record: the same warn verdict and panel as S-24, another reason line |
| S-74 | 05 | J3 | Errors captured | F8 | Panel revealed | Unmoved | Plain sentence; Technical details; Report this problem / "A problem was found. Use Report this problem …" (`main.ts:1036`) | All | Report it | Fixed: one name now (V-10, V-17) | — | walked (en-staff 45) |
| S-75 | 05, + | J3 | Report this problem | S-74; press it | The dialog opens with the details gathered | The message field (autofocus) | As S-76 | Draft | Write, then send | — | — | walked (new step) |
| S-76 | 04 | — | Feedback, empty | Press Send feedback | Modal dialog | The message field | Intro with the address; What will be sent; three buttons / dialog name | Draft through Close and reopen | Write, then Open email app | Two secondary buttons beside the primary | — | walked (en-staff 04) |
| S-77 | 54 | — | Feedback refused: empty | S-76; Open email app | Refused in place | The message field (`main.ts:3496`) | "Write a message first." / via `aria-invalid` and `describedby` | — | Write | — | — | walked (new step) |
| S-78 | 54 | — | Feedback filled; sent to the email app | Type; Open email app | `mailto:` followed | Unmoved | "Your email app should have opened …" / said | Draft | Send from the email app | — | — | walked; that the email app opened is the person's check |
| S-79 | 54 | — | Feedback oversized | Type past the mailto limit; Open email app. Then a message that fits with details that do not | Past the limit, no mailto; the copy carries every word (`main.ts:3531`). Details trimmed, the mailto opens as S-78 and the line adds that some did not fit (`main.ts:3540`) | Unmoved | "Your message is too long to hand to your email app. …"; or "Your email app should have opened …" then "Some details did not fit …", with "only in the copy" among the details / said | Draft | Copy | — | — | walked (new step) |
| S-80 | 54 | — | Copied; copy failed | Copy with F5 granted, then denied | Clipboard written or refused | Unmoved | "Copied. Paste it into an email to …" or "Could not copy. Open 'What will be sent with it' …" / said | Draft | Paste, or copy by hand | — | — | walked, F5 |
| S-81 | 55 | — | Accessibility statement open | Open its summary | Seven sub-headings | Stays on the summary | The statement / `aria-expanded` | — | Read, or write to someone | — | — | walked (en-staff 33) |
| S-82 | 56 | — | System check open | Open its summary | Six rows | Stays on the summary | "OK" and a value in words, e.g. "Ready in 340 ms" / none | — | Understand support | Long row labels at narrow widths (wish line) | — | walked (en-staff 34) |
| S-83 | 59, + | — | Footer | Scroll to the foot | — | — | Send feedback; "Fill in the feedback form (new tab)"; "Creators team on Teams (new tab)"; "Email the learning content team"; version / none | — | Write, or open the form | Three routes for help next to Send feedback | — | walked (new clip) |
| S-84 | 32 | — | Page language at narrow width | 320 px; S-03 | Switcher wraps under the logo (VH-154) | — | As S-03 / none | — | As S-04 | — | — | reuses S-03 at 320 px: the light matrix covers it |
| S-85 | 14 | — | Announce progress off | S-48; untick | Stages no longer spoken; the result still is | Stays on the box | As S-48 / outcome only | The setting, remembered | Wait | — | — | walked (new step) |
| S-86 | 64 | — | Remembered video language | Pick ms-MY on an English page; reload | The pick holds over the page language | Unmoved | As S-08 / none | Video language | Carry on | — | — | walked (new step): `remembered-language` extended with an ms-MY pick on the English page before the reload, read back from the store (`main.ts:507`) |
| S-87 | + | — | 4:3 | Choose `fourbythree-20s` | The plain ready verdict, priced like any other; no warning about the shape, by design (no such string in `en-GB.ts`) | As S-15 | "Ready to go — …"; Video properties shows "640 × 480" (`en-GB.ts:971`) / "Device check complete. Ready to go." | — | Create | — | — | walked (en-staff 42); the card frames are VH-143's spike, not a page state |
| S-88 | 19 | J4 | Discard question withdrawn by a change | S-58; choose Student submission (or change the video language, trim, preset, closing or card) | The question is retired and the result it interrupted is redrawn (`withdrawDiscardQuestion`, `main.ts:2160`; called at 627, 659, 701, 1664, 1877, 2665, 2695); a trim or preset change also re-checks | Stays on the control changed | Result as S-53; the question's line cleared (`main.ts:818`) / nothing new said | Result, choices | Carry on; Create asks afresh | — | — | walked (new step) |
| S-89 | + | J3 | Device check failed | S-14 with F10 | The failure in the verdict's place; Check again offered (`main.ts:1538`, 1620). The page's own deadline gives the same (`main.ts:1631–1639`) | Check again, if held on Stop (`main.ts:1625`, 1639) | "The device check did not finish. Press Check again to run the check once more. …" / said | Trim, choices | Check again | — | — | walked, F10; apart from S-35's stopped check |
| S-90 | 29 | J3 | Failed, locks held while the job stops | S-48 with F11 | The watchdog stops the job: failure box; the bar hidden, Cancel disabled, locks and the stopping notice held until the worker answers or 10 s pass; then the locks lift (`main.ts:3007–3044`, 3088) | The failure box, if on Cancel, once the locks lift (`main.ts:3018`, 3050) | "The job stopped reporting progress, so it was stopped." and "The job is stopping. Please wait before trying again." / both said; then the failure alone; title "Not made — …" | Choices | Wait, then retry | — | The failure line written again when the stop ends (`main.ts:3044`) | walked, F11; the behaviour the catalogue's row 29 describes |
| S-91 | 22, 50 | J4 | The previous result's other warnings | S-55's F6a job finished, unsaved; choose `lecture-60s` | The closing line and the output warnings stay inside "Previous video" (`renderResult`, `main.ts:3222`, 3229) | Stays on the chooser | "You chose Fade, but the animation could not be loaded, so this video cuts to …" inside "Previous video"; "Worth knowing about the finished video" with "The file’s title, author, and date could not be copied across" / none new | Result | Understand before saving | — | — | walked (new step), F6a; the warnings block source-only unless the pilot finds a source whose metadata cannot be carried (`metadata-lost`, the only output warning, `src/media/pipeline.ts:851`) |

## Every catalogue row mapped

01 → S-03 · 02 → S-09 · 03 → S-10, S-11 · 04 → S-76 · 05 → S-74, S-75 ·
06 → S-12, S-13 · 07 → S-14 · 08 → S-15 · 09 → S-17 · 10 → S-33 ·
11 → S-34 · 12 → S-35 · 13 → S-26 · 14 → S-48, S-50, S-85 · 15 → S-51 ·
16 → S-52 · 17 → S-18, S-19 · 18 → S-53 · 19 → S-58, S-59, S-88 · 20 → S-61 ·
21 → S-62 · 22 → S-63, S-64, S-91 · 23 → S-70 · 24 → S-28 · 25 → S-29, S-30 ·
26 → S-21 · 27 → S-20 · 28 → S-31 · 29 → S-56, S-90 · 30 → S-01 · 31 → S-02 ·
32 → S-04, S-84 · 33 → S-05 · 34 → S-07 · 35 → S-08 · 36 → S-36 ·
37 → S-37 · 38 → S-37 · 39 → S-38 · 40 → S-36, S-39 · 41 → S-40 ·
42 → S-41 · 43 → S-42 · 44 → S-43 · 45 → S-44 · 46 → S-45 · 47 → S-46 ·
48 → S-47 · 49 → S-54 · 50 → S-55, S-64, S-91 · 51 → S-49 · 52 → S-65 ·
53 → S-66, S-67, S-68, S-69, S-70 · 54 → S-77, S-78, S-79, S-80 · 55 → S-81 ·
56 → S-82 · 57 → S-16 · 58 → S-32 · 59 → S-83 · 60 → S-27 ·
61 → S-22, S-23 · 62 → S-24, S-25 · 63 → S-04 · 64 → S-06, S-86.

The plan's additions, beyond the rows:

- Startup pending and blocked: S-01 and S-02.
- Preview unavailable: S-32.
- Video properties and onset help open: S-16 and S-17.
- Captions lost: S-16.
- Cut-short file: S-22 and S-23.
- Quiet and loud audio: S-18 and S-19.
- Long job: S-24 and S-25.
- 4:3: S-87, its own record. `fourbythree-20s`, walked at `en-staff 42`, gives
  the plain ready state. The page says nothing about the shape, by design. The
  card frames are VH-143's spike, not a page state.
- No audio: S-20.
- Too short: S-21.
- The previous result's warnings: S-64 and S-91.
- Saving the previous while checking the next: S-65.
- Discard: S-58 to S-60, and the question withdrawn by a change, S-88.
- Save stopped, cancelled or failed: S-66, S-67 and S-69.
- Refusal to overwrite the source: S-68.
- Download hand-off and retry: S-70.
- Feedback empty, filled, oversized and refused: S-76 to S-79.
- Copy fails: S-80.
- Errors captured and Report this problem: S-74 and S-75.
- Video type and Video language while running and beside a kept result:
  S-50 and S-71. Page language is kept apart, in S-04.
- A remembered language: S-06 and S-86.
- Focus left where the person reads: S-72.
- System check, statement and footer: S-82, S-81 and S-83.

Found by the source check, beyond the plan: the device check failed (S-89,
"+") and the job failure with the locks held (S-90, row 29).

Not in this pass: the other drop refusals (several files, while saving, during
startup or blocked; `main.ts:1369–1381`), a card field that does not fit
(`refused.field/card`), the submission ID errors (design-walk `id-error`), and
the re-check after a preset change (`en-staff 21`).

## The finite list for the other modes

These run in dark, forced colours light and dark, enlargement, text spacing,
fallback faces, and landscape or short height:

| The plan's state | Scenario |
| --- | --- |
| Empty | S-03 |
| Ready with warnings | S-24 |
| An open disclosure | S-16 |
| An invalid submission | S-41 |
| Running | S-48 |
| Finished | S-53 |
| A previous result | S-63 |
| Discard | S-58 |
| A failure | S-56; S-29 as the fallback |
| The dialog | S-76 |
| The statement | S-81 |

"Ready with warnings" is read as the warn verdict, whose heading is "Ready,
with … things to know" (`en-GB.ts:577`). S-18 is "Ready to go" with sound
notes. S-73 gives the same verdict by F9 if N2 is not sized in time. "A
failure" is S-56, which rests on the F3 pilot; S-29 (unreadable) is certain,
so it stands in if the job does not run out.

## Keyboard route per journey

The keys-only route runs apart from setup. Choosing the file is setup
(`DOM.setFileInputFiles`), because the native chooser is the browser's own
(VH-168). So is each fault.

- **J1:** S-03 → S-12 → S-14 → S-15 → S-16 → S-17 → S-36 → S-37 → S-39 →
  S-44 → S-47 → S-48 → S-49 → S-72 → S-53 → S-58 → S-59 → S-61 → S-62.
  At 375 px the end is S-26 → … → S-70.
- **J2:** S-03 → S-07 → S-12 → S-14 → S-15 → S-40 → S-41 → S-42 → S-45 →
  S-48 → S-43 → S-53 → S-61 → S-62.
- **J3:**
  - S-02 (its own load);
  - then S-28 → S-29 → S-15;
  - then S-31 → S-35;
  - then S-56 → S-57 → S-53 → S-69 → S-62;
  - then S-74 → S-75 → S-77 → S-80.
- **J4:** S-53 → S-13 → S-63 → S-64 → S-65 → S-71 → S-30 → S-58 → S-60 →
  S-48 → S-50 → S-53.
