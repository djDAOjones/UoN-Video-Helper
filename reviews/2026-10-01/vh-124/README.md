# VH-124 audit — the page, judged as a page

Written before any product file was changed, on `339cf57` (VH-113's code,
level with `main`), from screenshots of every state in headless Chrome 154:
desktop 1280 × 900, a phone at 390 × 844 with mobile emulation, reflow at
320 px, dark, and forced colours. The screenshots are in `before/`, named
`<state>-<view>.png`; `after/` holds the same states on the finished page.
Fixtures are ffmpeg test patterns and tones; nothing from `samples/` is in
any frame or name. The dev-only buttons are hidden, as production hides
them. Each state's visible text is in `<view>-text.json` beside the images.

The standard is the ticket, read as the pre-work's astra audit §7 reads it:
required reassurance stays, the next action can be a wait, an established
long option stays, and system colours sit outside the token files.

## What a first-time member of staff sees, state by state

| # | State | On screen (beyond the frame) | Meant to do | Competes | Repeats | Change |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | Empty | Lede, three lower-case bullets, two sentences with no gap between them; step 1: heading, label "Video file", an outlined "Choose file" inside a bordered input inside a dashed zone; hint "Or drop a video file here."; status "Choose a video to begin." | Choose a file | Four nested boxes and nothing filled: no primary action on the page. The lede is secondary grey, so the headline promise reads as a footnote. | "Choose a video" ×4: heading, label, hint, status. | The heading names the input; the label goes; "Choose file" becomes the one filled button, un-nested; no resting status; hint "Or drop it here.", hidden on touch. Lede in primary text with paragraph spacing; bullets capitalised and stopped. |
| 02 | Drag held | Zone solid with a ring; hint "Let go to read this video." | Drop | — | — | Keep. |
| 03 | Drop refused | Alert under the zone: "That is not a video file. Drop a video — … — or choose one above." | Choose a file | — | "choose one above" points at the picker, which is above: right. The unavailable-browser refusal says "The sentence above" of a sentence below. | Fix the direction in the unavailable case. |
| 04 | Feedback | Dialog: intro, message, disclosure, three buttons. | Write, then Open email app | Two secondary buttons beside the primary; long labels. | — | Keep (Carbon modal); labels stay — they are quoted in two other sentences. |
| 05 | Errors captured | Panel: plain sentence, "Technical details", "Report this problem". | Report it | Competes with the footer's Send feedback; acceptable, it is local. | — | Same notification component as every other failure. |
| 06 | Reading | Status "Reading the video…"; steps 2–5 absent (first file). | Wait | — | — | Keep. |
| 07 | Checking | Read line; steps 2–5; step 5: "Checking this video against your device…" and Stop the check. | Wait | Five open steps at once; the preview at 60vh takes the eye. | Read line duplicates Video properties (acceptable: it is the confirmation). | Keep; the verdict box takes the eye once it lands. |
| 08 | Ready | Verdict box (heading, time, size); Create (filled); helper "The finished video is kept here…"; status "Device check complete." | Create | Two lines under Create ask for attention: the lifetime helper and "Device check complete." | "Ready to go" and "Device check complete." | The verdict is a notification; status says the verdict out loud only; the lifetime helper stays (spec 9.1) until a result's own line replaces it. |
| 09 | Help open | Toggletip under Animation onset. | Read, return | — | — | Keep the in-flow toggletip (decision below). |
| 10 | Trim invalid | Error "Write the start time as…" under both fields; result line empty; step 5: "Put the start and end times right in step 2 to continue." | Correct the start time | The error sits under the helper, between the two fields and the result line. | Step 5's instruction restates step 2's error at a distance; required: the user is at step 5 when the trim stops it. | Error beside the field it concerns (one per field; a range problem under End). Step 5's line stays. |
| 11 | Check after trim | "Checking…" and Stop the check. | Wait | — | — | Keep. |
| 12 | Check stopped | "Check stopped. The video can be created once it has been checked." and Check again. | Check again | — | The second sentence explains Check again, which is beside it. | "Check stopped." alone, with Check again. |
| 13 | Discouraged (phone) | Verdict "This may not finish on a phone or tablet" (VH-113); "I understand — carry on anyway" (outlined). | Decide | The only continuation is secondary; its label is long. | — | "Continue anyway", still secondary: the warning is the primary thing here (decision below). |
| 14 | Running | Four lock notes; verdict still up; Create (outlined, disabled) and Cancel; lifetime helper; status "Encoding video"; Announce progress and its helper; the tab notice; bar; "Encoding video — 14%". | Wait; Cancel if needed | Create is still on screen beside Cancel; the stale verdict above; the lifetime helper; two progress accounts. | Status "Encoding video" beside "Encoding video — 14%"; the job notice appears in the status at the start and as its own paragraph. | Reading order: bar and stage, then Cancel; Create hidden while running; the verdict withdrawn at start; status spoken-only for stages and the start notice; the lifetime helper hidden during a job. |
| 15 | Cancelling | "Cancelling…", Cancel disabled. | Wait | A stage report can overwrite "Cancelling…". | — | Stage writes ignored once Cancel is pressed. |
| 16 | Cancelled | "Cancelled. Nothing was saved, and your original file is unchanged."; Create. | Create again | — | Required reassurance. | Keep. |
| 17 | Ready, sound notes | Verdict; "Worth knowing about the sound" box with a title and detail each, and "None of these stop you continuing. Your original file is not changed either way." | Create | Two stacked boxes of different anatomy. | The reassurance repeats the verdict's "Ready". | One notification component for both; the reassurance line stays (spec 5.4: a warning must not read as a refusal). |
| 18 | Finished | Create (outlined); lifetime helper; status "Your video is ready."; "Finished video — 11.3 MB."; the record; "It is kept here only until…"; Save. | Save | The result is loose paragraphs under a helper that is about a different future video; Create sits above it. | Two lifetime sentences; "Your video is ready." and "Finished video". | The result is a success notification carrying the record, the outcome and its lifetime line, with Save as its action; the pre-Create helper hidden while a result shows; Create stays secondary. |
| 19 | Discard question | Question, the record, "Discard it and start again" (filled), "Keep it"; status "Your video is not saved yet." | Decide | Destructive Discard is the primary and takes focus. | Status repeats the question. | Discard as Carbon's danger button; focus on the question; status spoken-only. |
| 20 | Saving | "Saving…", Save disabled, Stop saving; four lock notes. | Wait | — | — | Keep. |
| 21 | Saved | "Saved. Check it where you saved it, then upload it…"; "Saved" (spent). | Use the file, or choose another | "Stop saving" can still be pressed in the clean-up window, and replaces "Saved." | — | Saving ends when delivery does; clean-up is silent. |
| 22 | Previous video | New file's read line and losses box; verdict; "Previous video — 11.3 MB." with Save. | Save the previous, or continue | Two files in view, by design (VH-56). | — | Same component as the result; heading says Previous. |
| 23 | Download handed off | Status "Saving to your downloads folder — …" (VH-113). | Check the download | — | — | Keep. |
| 24 | Blocked file | Status: "This video cannot be processed in this browser. This cannot run here. This browser cannot read the picture…" then the same verdict in a box. | Choose another file | — | The whole verdict twice (defect 1). | Status spoken-only; the box says it once. |
| 25 | Unreadable | Status "That file could not be read."; failure box: what, original safe, what next. | Choose another | — | Status repeats the box's first line. | Status spoken-only. |
| 26 | Too short | Trim controls disabled; "It is shorter than 3 seconds, so it cannot be trimmed." | Continue | — | — | Keep. |
| 27 | Silent | Verdict; "This video has no sound" note. | Create | — | — | Keep. |
| 28 | Storage block | Status with the whole verdict; box; steps 2–4 stay. | Keep less, or Smaller | — | Defect 1 again; the sentence "cannot be processed in this browser" is untrue for storage. | As 24; and the read line is restored when the re-check passes (defect 2). |
| 29 | Failed | Running furniture stays while the worker settles (up to 10 s), then: failure box; Create. | Try again | Locks and a stale percentage beside "could not be created". | Status and box both say the first line. | Honest intermediate; the box is the component; status spoken-only. |

Not reproduced: a device check that fails (needs the worker to throw), a
preview the browser's player cannot show, and a save that fails. Their
wording follows the same rules and is read in source.

## Across every state

- **Measure.** `70ch` holds 88–91 characters in Arial (the pre-work's
  figure, re-measured here: the privacy sentence wraps at 89). `55ch`
  holds about 70. The lede's own `46rem` cap goes.
- **Paragraph spacing.** The privacy and browser sentences touch. A
  `--paragraph-gap` token puts one blank line between paragraphs (2.5 × the
  font size top to top, the Understanding document's figure for 1.4.8).
- **Tokens.** `app.css` holds 40-odd literal lengths (border widths, the 4 px
  rail, 2 px rings, 60rem shell, 46rem lede, 60vh preview, 12/14/18rem
  caps, 1.25rem controls, 0.15rem offsets, 1.8s). Each becomes a token in
  the Carbon file or is removed; a stylesheet test fails on any literal
  length, colour or line height left in `app.css`, with the structural
  exemptions named in the test (0, percentages, the visually-hidden
  technique, the reduced-motion block, the forced-colours system colours).
- **Five treatments of "worth knowing".** Verdict (`.verdict`), sound and
  output warnings (`.warnings`), losses (`.warnings` again), failures
  (`.fact-error`), captured errors (`.error-item`): three anatomies, two
  rails, one with a heading element and four without. One Carbon inline
  notification — a rail in the status colour, a title, body lines, an
  optional action — replaces all five, and the result and the discard
  question use it too.
- **Forced colours.** The header band is forced to Canvas and the white
  logo vanishes with it; primary and secondary buttons draw alike. The
  band keeps its colours (a logo drawn as the University draws it), and the
  primary button takes `Highlight`.
- **Phone.** No horizontal scroll at 390 or 320. The drop hint hides on
  touch (VH-113). The time field and its button share a row down to 320
  px and still fit; the colour segments fit; the footer's rows wrap.
- **Status lines.** Where a panel says the thing, the status line says it
  only out loud (`spokenOnly`), as VH-111 set up. Visible status is for what
  no panel shows: reading, checking, stopped, cancelled, saving, saved.

## Readings of the brief, recorded for the decision log

- "Said once": the privacy sentence, "your original file has not been
  changed" in a failure, and the sound notes' "none of these stop you" are
  reassurance the spec requires; they stay. What goes is a line that
  restates another line in view.
- "One thing to do": during a job the one thing is to wait, and Cancel is
  the secondary way out; after a save, the one thing is to use the file.
- Labels of one to three words: "Over generated freeze frame", "Set start
  here", "Use the whole video" and "Copy message and details" are
  established names, quoted by other sentences, and stay.
- "No font size used once": the title's size is hierarchy, not a stray;
  every size is on the Carbon scale.
- The toggletip stays in flow rather than floating: it can never cover the
  control it explains or the ring beside it, which is the ticket's own rule
  about focus not being obscured.
- The acknowledgement under a discouraging verdict stays secondary: a
  filled button under "this may not finish" would be the page urging the
  risk it has just named.

## After

The same walk on the finished page, in `after/`: 29 states at desktop and
at phone width, and the empty, lecture and finish sections at 320 px, dark
and forced colours; `keyboard-walk-desktop.txt` and `keyboard-walk-phone.txt`
record a Tab through every control in the empty, ready and finished states
and the page operated by keys alone; `focus-start-handle-desktop.png` shows
the ring on a handle, which the recorder cannot read from a pseudo-element.

What a first-time member of staff now sees:

- **Empty:** the title, the three promises with their capitals and stops,
  the privacy and browser sentences a blank line apart, and step 1 — the
  heading over one filled Choose file in the dashed zone, "Or drop it
  here." beneath (hidden on touch). No label, no resting status. The page
  is 951 px tall at desktop (974 before).
- **Ready:** the verdict is a notification; Create is the one filled button
  in step 5 (the picker's button has stepped down to secondary); the
  lifetime line sits under Create; nothing else in the step.
- **Running:** the verdict is gone; the bar, its stage line, the tab
  notice, the announce control, then Cancel. Create is hidden. One account
  of progress; the status line only speaks.
- **Finished:** the result notification — title, record, lifetime — with
  Save inside it as the filled action, and Create outlined below. The
  pre-Create lifetime line has gone.
- **Discard:** a warning notification with the question, the record and
  two buttons, Discard in the danger colour; focus lands on the question.
- **Blocked, unreadable, failed, check failed:** one error notification
  each; the status line says nothing twice.
- **Storage block:** step 1's notification names the way out; step 5 says
  it again in one line with Check again, and is no longer an empty panel.
- **Phone:** one column, no horizontal scroll at 390 or 320, the mobile
  verdict leads with the risk, "Continue anyway" outlined under it.
- **Forced colours:** the logo keeps its band, the primary button and the
  bar take Highlight, the slider and segments draw as VH-112 left them.

Keyboard-only, from the recorded walks: every stop is in reading order,
every stop has a ring (the two "NO" rows are the range inputs, whose ring is
on the thumb pseudo-element the recorder cannot read — see the capture), no
target under 44 px (the one "20x20" is the native radio glyph inside a
44 px label row, which is the target). Space opens the onset help and Escape
closes it with focus kept; arrows move a handle by a second and the result
line follows; Enter on Create hides Create and hands focus to Cancel; the
finish hands focus to the result; Enter on Create with an unsaved result
hands focus to the question, not to Discard; Keep it hands it back to the
result. On the phone walk the first stop shows no ring because the recorder
focuses the skip link by script rather than by Tab.

Not changed, and why: the lede's lead-in sentence (the maintainer's
structure; parked), the toggletip's in-flow placement, the native video
controls (the user agent's, spec §9.3), the preset helpers' "etc."
