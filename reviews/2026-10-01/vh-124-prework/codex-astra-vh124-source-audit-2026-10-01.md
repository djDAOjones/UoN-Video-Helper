# Codex astra source audit for VH-124 — 1 October 2026

The independent, source-only half of VH-124's pre-work, kept as written.
Codex CLI with `gpt-6-astra`, read-only sandbox, briefed with the ticket and
asked to inventory every state and every visible string with path:line; it
ran while Claude measured the live page. The checkout moved under it — VH-111
landed as `fcd6d11` and VH-112 was in flight (it landed as `3fa0b0e`) — so
its `src/main.ts` and `src/styles/app.css` line numbers come from that moving
tree and may be off by a few lines; citations into files nobody was editing
held when spot-checked. Which findings were verified, and how, is in
[the pre-work README](README.md). Only formatting changed: a top-level heading
was added.

---

Source review only: no files changed, and no app or tests run.

The checkout changed during this review. VH-111 is now committed as `fcd6d11`; additional uncommitted work changes `src/main.ts`, `src/styles/app.css`, `src/styles/tokens.carbon.css` and `UI-STANDARDS.md`. The review below uses those later reads. In particular, **Create now becomes secondary beside a result; steps now explain their locks; `70ch` measure, revised swatches and forced-colour rules now exist**. Those are no longer findings of absence. Their rendered effectiveness remains **unverified**. Sources: `src/main.ts:1820`, `src/main.ts:1697`, `src/styles/app.css:35`, `src/styles/app.css:938`, `src/styles/app.css:1263`.

## 1. State inventory

### How to read the inventory

The page has independently changing regions, not one mutually exclusive state enum. To describe the **whole page** without repeating the privacy sentence dozens of times, the verbatim blocks below are composed explicitly in the state table.

- **B** = persistent heading, introduction and footer.
- **C** = Choose step.
- **S** = successfully read source report.
- **T / L / Q** = Trim, Closing branding and File size / quality.
- **J** = Create step and its current status/actions.
- **V / W / F / R** = verdict, warnings, failure and retained result.
- **E / D** = captured-errors panel and feedback dialog.

Braces identify runtime substitutions, not literal braces shown by the application. Filenames, durations, dimensions, browser-generated controls, exception messages and diagnostic data cannot have one predetermined verbatim value. Their renderers and templates are cited instead. Native browser wording is **unverified**.

Disclosures contribute their contents only when open. Closed selects show their selected option; their complete option lists are recorded below.

### B — persistent page

| Surface | Verbatim text | Source |
| --- | --- | --- |
| Focused skip link | “Skip to main content” | `index.html:13` |
| Logo alternative | “University of Nottingham” — alternative text, not an additional visible caption | `src/ui/brand-assets.ts:52` |
| Title | “UoN Video Helper” | `index.html:30` |
| Introduction | “This tool does the following to your video:” | `index.html:39` |
| Promise 1 | “adds approved branding” | `index.html:41` |
| Promise 2 | “ensures consistent audio levels” | `index.html:42` |
| Promise 3 | “outputs an optimised file type and size” | `index.html:43` |
| Privacy | “Your video is processed on your device, it is never uploaded, and the original file does not change.” | `index.html:46` |
| Browser, pending | “This app is designed and built for Chrome, other browsers may not work.” | `index.html:49`; `src/ui/system-check.ts:72` |
| Browser, checks passed | “This app is designed and built for Chrome, and this browser has passed the checks for it.” | `src/ui/system-check.ts:77` |
| Browser, failed or warning | “This app is designed and built for Chrome, and this browser has not passed all of its checks. The system check at the foot of the page says what is missing.” | `src/ui/system-check.ts:75` |
| Footer disclosure | “System check — checking”; “System check — all passed”; “System check — 1 problem”; “System check — {n} problems”; “System check — 1 warning”; “System check — {n} warnings” | `src/main.ts:409`; `src/ui/system-check.ts:41` |
| Footer action | “Send feedback” | `index.html:393` |
| Version | Initially “Loading…”; then `{BUILD_ID}`, or `{APP_VERSION} · {BUILD_ID} · development` | `index.html:396`; `src/main.ts:367` |

When **System check** is open, add every row below. Its failure count can cause it to open automatically; a warning alone does not use that same automatic-opening condition. Sources: `src/main.ts:395`, `src/main.ts:552`.

| Row label | Possible visible value |
| --- | --- |
| “Secure connection (needed for storage access)” | “checking”; “available”; “not available” |
| “Video processing in the browser (WebCodecs)” | “checking”; “supported”; “not supported” |
| “Video format the tool makes (H.264)” | “checking”; “supported”; “not supported” |
| “Sound format the tool makes (AAC)” | “checking”; “supported”; “not supported”; “not supported — a video with sound cannot be made here” |
| “Private working storage” | “checking”; “available”; “not available” |
| “Background processing” | “checking”; “ready in {ms} ms”; “failed to start”; “no response” |

Each row also displays its mark: “OK”, “No”, “!”, or “…”. Sources: `src/main.ts:372`, `src/main.ts:552`, `src/main.ts:617`, `src/main.ts:745`, `src/main.ts:762`, `src/main.ts:807`.

**Whole-page attention:** the title, three promise lines, privacy sentence, browser sentence, boxed steps and blue footer remain present during later tasks. The footer and persistent browser reassurance are therefore part of every state’s attention budget, not merely the empty state’s. Sources: `index.html:21`, `index.html:38`, `index.html:376`; `src/styles/app.css:92`, `src/styles/app.css:180`.

### C — Choose step, reading, drop and startup variants

Always within C:

- “1. Choose a video” — `index.html:63`.
- “Video file” — `index.html:69`.
- Native file-picker button and filename/empty-selection wording — `index.html:70`; **unverified browser wording**.
- “Or drop a video file here.” — `index.html:77`.

The source-status line is one of:

| Condition | Verbatim text | Source |
| --- | --- | --- |
| Ready, no file | “Choose a video to begin.” | `src/main.ts:801` |
| Reading | “Reading the video…” | `src/main.ts:862` |
| Read | “Video read. {duration}, {resolution}{optional ‘, variable frame rate’}, {channels in lower case / ‘no sound’}.” | `src/ui/source-panel.ts:215` |
| Failed read | “That file could not be read.” | `src/main.ts:923`, `src/main.ts:942` |
| Blocked | “This video cannot be processed in this browser.” followed visibly by the entire spoken verdict: its heading and reason sentences | `src/main.ts:1030`; `src/ui/preflight-panel.ts:283` |

Drop overlays, from `dropProblem()`:

- Drag held: “Let go to read this video.” — replaces the normal hint, `src/ui/drop-zone.ts:87`.
- Making: “A video is being made. Cancel it, or wait for it to finish, before choosing another.” — `src/ui/drop-zone.ts:67`.
- Saving: “A video is being saved. Stop the save, or wait for it to finish, before choosing another.” — `src/ui/drop-zone.ts:70`.
- Starting: “The tool is still getting ready. Drop the video again in a moment.” — `src/ui/drop-zone.ts:73`.
- Unavailable: “This browser cannot run the tool, so no video can be read here. The sentence above says what to do.” — `src/ui/drop-zone.ts:76`.
- Empty drop: “Nothing was dropped that could be read. Drop a video file.” — `src/ui/drop-zone.ts:78`.
- Multiple files: “That was {n} files. Drop one video at a time.” — `src/ui/drop-zone.ts:79`.
- Wrong type: “That is not a video file. Drop a video — a file whose name ends .mp4 or .mov, say — or choose one above.” — `src/ui/drop-zone.ts:81`.

The unavailable-drop instruction points **above**, but the detailed startup failure is in `source-status` **below** the drop zone. That is a source-confirmed positional mismatch. Sources: `index.html:78`, `index.html:85`; `src/main.ts:801`.

Startup failure replaces the source-status line with the first applicable sentence:

- “This page needs a secure connection before it can work with your video. Open it at an address that starts https://.” — `src/ui/failure-text.ts:123`.
- “This browser cannot process video, so the tool cannot run here. {browser remedy}” — `src/ui/failure-text.ts:125`.
- “This browser cannot create the video format this tool needs, so the tool cannot run here. {browser remedy}” — `src/ui/failure-text.ts:127`.
- “This browser gives the tool no working space to build a video in. If you are browsing privately, an ordinary window usually works. {browser remedy}” — `src/ui/failure-text.ts:130`.
- “The part of the tool that does the work did not start. Reload the page. If it happens again, report it with the Send feedback button.” — `src/ui/failure-text.ts:133`.

The browser remedy is exactly one of:

- “Chrome on a computer is the browser this tool is built for — try it there.” — `src/ui/preflight-panel.ts:70`.
- “This copy of Chrome may be out of date, or a setting on this computer may have turned the feature off. Update Chrome, or ask whoever manages the computer.” — `src/ui/preflight-panel.ts:72`.

### S — source report, including losses and open properties

The closed source report contains “Video properties”, plus any loss notices. Sources: `src/ui/source-panel.ts:232`, `src/ui/source-panel.ts:272`.

If losses exist, add “Not carried into the new file” and the applicable entries:

| Title | Detail |
| --- | --- |
| “This file has {1 more video track / n more video tracks}{optional ‘ and ’}{1 more sound track / n more sound tracks}” | “The new file keeps one picture and one sound track — the ones listed under Video properties. The others will not be carried over, and one of them may hold an alternative, such as another language or an audio description. If you need them, keep the original alongside.” |
| “Caption and chapter tracks could not be checked” | “This kind of file cannot be checked for them. If yours has them, they will not be carried over.” |
| “Found {1 caption track / n caption tracks}{optional ‘ and ’}{1 chapter list / n chapter lists}” | Applicable caption/chapter sentences below, followed by “If you need the originals, keep this file alongside.” |

Sources: `src/ui/source-panel.ts:50`, `src/ui/source-panel.ts:61`, `src/ui/source-panel.ts:78`, `src/ui/source-panel.ts:102`, `src/ui/source-panel.ts:114`.

Applicable sentences:

- “The new file will have no caption track, so wherever you publish it must supply captions. EchoVideo makes its own after upload — check them. A file sent directly needs captions added by you. Captions drawn into the picture stay.” — `src/ui/source-panel.ts:95`.
- “The chapters will not be in the new file.” — `src/ui/source-panel.ts:99`.
- “If you need the originals, keep this file alongside.” — `src/ui/source-panel.ts:101`.

When **Video properties** is open, add:

| Label | Value and conditional helper |
| --- | --- |
| “Duration” | `{formatted duration}` |
| “Video format” | `{formatted codec}`; optionally “This browser cannot read this video format.” |
| “File size” | `{formatted file size}` |
| “Resolution” | `{width} × {height}`; optionally “Rotated {degrees}°. The output will be upright.” |
| “Frame rate” | “{rate} frames a second”, optionally “ on average, but it varies” |
| — | “Recordings from Teams, Zoom and screen capture often vary. The output will use a steady frame rate, which keeps sound and picture in step.” |
| — | “The output will run at {rate} frames a second, so some frames will be repeated.” |
| “Sound format” | `{formatted codec}`; optionally “This browser cannot read this audio format.” |
| “Sound channels” | “Mono (one channel)”; “Stereo (two channels)”; “5.1 surround”; “7.1 surround”; or “{n} channels” |
| “Sound sample rate” | “{kHz} kHz — {sample rate} samples a second” |
| “Sound”, when no audio | “No sound track found”; “Levelling needs sound. The rest of the job still runs.” |
| “Captions” | “Could not be checked in this kind of file”; “Found {track counts}”; or “None found in this file” |
| “File type” | `{container name}` |

Sources: `src/ui/source-panel.ts:131`, `src/ui/source-panel.ts:153`, `src/ui/source-panel.ts:179`, `src/ui/source-panel.ts:202`; `src/ui/format.ts:119`.

Formatting also supplies “unknown”, “less than a second”, “a few seconds”, `{n} bytes`, and units `kB`, `MB`, `GB`, `TB`; codec names include H.264, H.265, VP8, VP9, AV1, ProRes, AAC, Opus, MP3, Vorbis, FLAC, Dolby Digital and Dolby Digital Plus. Sources: `src/ui/format.ts:15`, `src/ui/format.ts:45`, `src/ui/format.ts:62`, `src/ui/format.ts:97`.

### T — Trim

The whole T block is:

- “2. Trim” — `index.html:102`.
- “Optional. Cut unwanted material from the start or the end. Left alone, the whole video is kept. The preview plays your original as it is now: the sound is levelled and the closing added when the video is made.” — `index.html:104`.
- Native video preview controls, timing and browser error presentation — **unverified browser wording**, `index.html:108`.
- “Start”; “End” — `index.html:114`.
- “Start time”; “Set start here” — `index.html:125`, `index.html:137`.
- “End time”; “Set end here” — `index.html:142`, `index.html:154`.
- Current time-field values, formatted by `formatTrimTime()` — `src/ui/trim.ts:20`.
- “Minutes and seconds, like 1:05.5.” — `index.html:159`.
- Either “Keeping the whole video, {duration}.” or “Keeping {kept duration} of {duration}.” — `src/ui/trim.ts:95`.
- “Use the whole video” — `index.html:169`.

Conditional additions/replacements:

| Condition | Verbatim text | Source |
| --- | --- | --- |
| Preview unavailable | “A preview is not available for this file. You can still set the times.” | `index.html:110`; `src/main.ts:1367` |
| Reading another file | Result line becomes “Reading the video…” | `src/main.ts:883`, `src/main.ts:1209` |
| Unreadable replacement | “There is no video to trim: that file could not be read.” | `src/main.ts:1134` |
| Too short | Summary gains “It is shorter than 3 seconds, so it cannot be trimmed.” | `src/main.ts:1244`; `src/config/trim.ts:17` |
| Invalid start/end syntax | “Write the start time as minutes and seconds, like 1:05.5.” / “Write the end time as minutes and seconds, like 1:05.5.” | `src/ui/trim.ts:62` |
| Beyond duration | “The start time is after the end of the video, which is {time} long.” / corresponding “end time” | `src/ui/trim.ts:72` |
| Invalid range | “The start or end of the video is not a time.”; “The start is after the end of the video.”; “The end must come after the start.”; “Keep at least 3 seconds of the video.” | `src/media/kept-range.ts:53`, `:63`, `:66`, `:69` |
| Making/saving | “Locked while your video is being made.” / “Locked while your video is being saved.”, immediately after the step heading | `src/main.ts:200`, `src/main.ts:1697` |

Multiple field errors are joined with a space in one shared error paragraph. Source: `src/main.ts:1236`.

### L — Closing branding

The whole L block is:

- “3. Closing branding” — `index.html:175`.
- “Animation type”: “Cut”, “Fade”, “Slide”, “None” — `index.html:192`.
- “Animation onset”: “Over existing”, “Over generated freeze frame” — `index.html:201`.
- “?” help button; accessible name “About animation onset” — `index.html:214`.
- “Colour”: “Blue”, “White” — `index.html:241`.
- The applicable closing-result sentence below — `src/ui/closing-choice.ts:36`.

Disabled explanations:

- “Not used with Cut.” — onset when Cut is selected.
- “Not used with None.” — onset and colour when None is selected.

Sources: `src/ui/closing-choice.ts:64`, `src/ui/closing-choice.ts:69`.

Result variants:

- “No University closing will be added.”
- “Your video cuts to the blue closing card. Adds 4 seconds.”
- “Your video cuts to the white closing card. Adds 4 seconds.”
- “Your last frame is held while the {blue/white} closing {slides/fades} in, so nothing is covered. Adds 5 seconds.”
- “The {blue/white} closing {slides/fades} in over your last second of video, covering it as it builds. Adds 4 seconds.”

Sources: `src/ui/closing-choice.ts:37`, `:45`, `:49`, `:50`; durations from `src/config/branding.ts:49`.

When help is open:

- “Over existing — the closing plays over the last second of your video. It covers that second as it builds.”
- “Over generated freeze frame — your last frame is held for one extra second. The closing plays over that, so nothing in your video is covered.”

Sources: `index.html:229`, `index.html:233`.

Making/saving adds the same lock sentence recorded for T. Sources: `src/main.ts:200`, `src/main.ts:1697`.

### Q — File size / quality

- “4. File size / quality” — `index.html:269`.
- “Larger / better” — `index.html:279`.
- “For EchoVideo or YouTube etc.” — `index.html:280`.
- “Smaller / reduced” — `index.html:286`.
- “For messaging or email etc.” — `index.html:287`.
- Making/saving adds the relevant lock sentence — `src/main.ts:1697`.

There is **no separate result line** in this step. The selected native radio carries its state. Sources: `index.html:268`, `index.html:290`.

### J and V — Create, checking and verdicts

J’s fixed heading is “5. Create” — `index.html:297`.

Its possible controls and helper are:

- “Create the video” — `src/main.ts:1514`.
- “I understand — carry on anyway” — `src/main.ts:1534`.
- “Stop the check”; “Check again”; “Stop saving” — `src/main.ts:1559`.
- “Cancel” — `src/main.ts:1519`.
- “The finished video is kept here until you save it or close this tab.” — `index.html:304`.

Checking/status strings:

- “Checking this video against your device…” — `src/main.ts:973`.
- “Device check complete.” — `src/ui/preflight-panel.ts:292`.
- “Put the start and end times right in step 2 to continue.” — `src/main.ts:969`.
- “The device check did not finish.” — `src/main.ts:1065`.
- “Check stopped. The video can be created once it has been checked.” — `src/main.ts:1595`.

Verdict headings:

- “Ready to go”.
- “Ready, with one thing to know”.
- “Ready, with {two/three/four/five/six/n} things to know”.
- “This will work, but it will be slow”.
- “This cannot run here”.

Sources: `src/ui/preflight-panel.ts:55`, `src/ui/preflight-panel.ts:63`.

For non-blocking verdicts, applicable reason sentences are followed by:

- “This should take a few seconds.” or “This should take about {approximate duration}.” — omitted when a reason already states time, `src/ui/preflight-panel.ts:181`.
- “Estimated size up to {size}.” — `src/ui/preflight-panel.ts:198`.
- If capped and untrimmed: “Your video is already compressed as far as this setting would take it, so the new file will be about the same size.” — `src/ui/preflight-panel.ts:214`.
- Otherwise, when Smaller / reduced classified the picture as screen content: “This looks like slides or a screen recording, so the file is made smaller still. If it is mostly camera footage, choose Larger / better instead.” — `src/ui/preflight-panel.ts:226`.

All verdict reason sentences:

| Reason | Verbatim text |
| --- | --- |
| Video APIs absent | “This browser cannot process video. {browser remedy}” |
| Sound encoder absent, Chrome | “This browser cannot add sound to a video file. {Chrome remedy}” |
| Sound encoder absent, elsewhere | “This browser cannot add sound to a video file. {try-Chrome remedy} Firefox can play video but cannot create the sound this needs.” |
| Video encoder absent | “This browser cannot create the video format this tool needs. {browser remedy}” |
| Cannot decode, Chrome | “This browser cannot read the picture or sound inside this file. It was probably saved in a format made for editing software. Export it again as an MP4 — a file whose name ends .mp4 — and choose that file instead.” |
| Cannot decode, elsewhere | “This browser cannot read the picture or sound inside this file. {try-Chrome remedy} If it will not open there either, the file was probably saved in a format made for editing software. Export it again as an MP4 — a file whose name ends .mp4.” |
| Working storage absent, Chrome | “This browser will not give the tool the working space it needs to build your video. If you are browsing privately, an ordinary window usually works; otherwise a setting on this computer may be blocking site storage — ask whoever manages it.” |
| Working storage absent, elsewhere | “This browser will not give the tool the working space it needs to build your video. {try-Chrome remedy} If you are browsing privately, an ordinary window usually works.” |
| Insecure page | “This page needs a secure connection before it can work with your video. Open it at an https:// address, or at localhost if you are running it yourself.” |
| Insufficient storage | “There is not enough free space on this device. This job needs about {size} of working space.” Then either “Free some space and try again, keep less of the video, or choose Smaller / reduced.” or “Free some space and try again.” |
| Unknown storage | “This browser will not say how much free space there is. If it runs out part-way, the job stops and nothing is saved — your original file is not affected.” |
| Very long | “This will take about {estimate / ‘a long time’}. You can carry on, but a desktop computer would be considerably faster.” |
| Long | “This will take about {estimate / ‘a while’}. Keep this tab open while it runs — closing it stops the job.” |
| Mobile | “Phones and tablets are much slower at this than a computer, and are more likely to stop part-way. Use a computer if you can.” |
| Estimate unavailable | “We could not work out how long this will take on this device. You can still continue.” |

Sources: `src/ui/preflight-panel.ts:74`, `:80`, `:86`, `:90`, `:98`, `:102`, `:107`, `:111`, `:117`, `:119`, `:121`, `:123`, `:125`. Browser-remedy expansions are recorded under C.

### W — sound and output warnings

Headings are “Worth knowing about the sound” or “Worth knowing about the finished video”. Sources: `src/main.ts:1039`, `src/main.ts:1919`.

| Warning title | Verbatim detail |
| --- | --- |
| “This video has no sound” | “There is no sound to level, so the rest of the job runs without it. If you expected sound, check the recording before publishing.” |
| “The sound may be distorted in places” | “The recording often reaches its maximum level, so some of it may be clipped. That usually means the microphone was set too high. Levelling still runs, but distortion already in the recording cannot be removed.” |
| “This recording is very quiet” | “It is well below a comfortable listening level. Levelling will bring it up — but turning up quiet speech turns up whatever else was in the room too.” |
| “The volume varies a lot” | “The loudest and quietest parts are far apart. Levelling corrects slow drifts gradually, too slowly to hear, but sudden differences between sentences will remain.” |
| “There may be background noise” | “Even the quietest moments carry some sound — a fan, air conditioning, or a noisy room. This tool does not remove noise, and making the speech louder will make the background louder with it.” |
| “There is a long silent stretch” | “About {duration} of near-silence in one continuous run. If that is deliberate, nothing is wrong. If not, it is worth checking the recording before you publish it.” |
| “The finished sound is not quite at the usual level” | “The video is fine to use; it may just sound slightly quieter or louder than other videos levelled with this tool.” |
| “The file’s title and date could not be copied across” | “The picture and sound are unaffected. If your original carried a title, author or date, the new file will not have them — you can still add them wherever you upload it.” |

Sources: `src/ui/warning-text.ts:29`, `:36`, `:43`, `:49`, `:55`, `:62`, `:68`, `:73`.

The optional reassurance is:

> “None of these stop you continuing. Your original file is not changed either way.”

Source: `src/ui/warning-text.ts:126`.

The target-missed wording exists, but the current production pipeline’s caller was not found; treat that particular screen as **unverified reachability**, not an established screenshot state. Sources: `src/audio/warnings.ts:152`; `src/ui/warning-text.ts:68`; `src/media/pipeline.ts:759`.

### F — failure panel

Every rendered failure comprises:

1. Its `what` sentence below.
2. “Your original file has not been changed.”
3. Its `next` sentence below.

Sources: `src/ui/failure-text.ts:26`, `src/ui/source-panel.ts:305`.

| Failure | `what` | `next` |
| --- | --- | --- |
| Unreadable | “This file could not be read as a video.”, or one of the worker sentences below | “Choose a different file, or save this one again from the app that made it, as a file whose name ends .mp4.” |
| Bad trim | “The start and end times could not be used.”, or the actual range error | “Put the start and end times right in step 2 and try again.” |
| Unlevellable | “The sound of this recording cannot be brought to the usual level, so the video was not made.” | “Report it with the Send feedback button — the details it adds will help.” |
| Output loudness | “The finished sound did not come out at the usual level, so the video was not kept.” | Retry/report sentence below |
| Output peak | “The finished sound came out louder at its peaks than allowed, so the video was not kept.” | Retry/report sentence |
| Output unreadable | “The finished video could not be read back, so it was not kept.” | Retry/report sentence |
| Out of space | “This device ran out of working space part-way through.” | “Free some space, or choose Smaller / reduced, and try again.” |
| Encoder refused | “This browser stopped encoding the video part-way through.” | “Try the other output under File size / quality. If it happens again, report it with the Send feedback button — the details it adds will help.” |
| Check failed | “The device check did not finish.” | “Press Check again to run it once more. If it fails again, report it with the Send feedback button.” |
| Timed out | “The job stopped reporting progress, so it was stopped.” | Retry/report sentence |
| Unknown | “Something went wrong while creating the video.” | Retry/report sentence |

The retry/report sentence is:

> “Try again. If it happens again, report it with the Send feedback button — the details it adds will help.”

Sources: `src/ui/failure-text.ts:28`, `:36`.

Worker/read-time alternatives:

- “This file could not be read as a video. It needs to be a video file — one whose name ends .mp4, .mov, .mkv or .webm — and it may be damaged.” — `src/media/inspect.ts:204`.
- “This file has sound but no video. This tool adds branding to a video, so it needs a file with a picture.” — `src/media/inspect.ts:236`.
- “No video or sound was found in this file. It may be incomplete, or it may have been saved incorrectly.” — `src/media/inspect.ts:237`.
- “Something went wrong reading this file. It may be damaged, or in a format this tool cannot read.” — `src/workers/job.worker.ts:379`.
- “Reading this file took longer than expected, or the tool ran into a problem.” — `src/main.ts:939`.

Development can append underlying failure details; those are runtime data, not a finite copy inventory. Sources: `src/main.ts:520`; `src/workers/job.worker.ts:582`.

### Running and cancellation text

In addition to the still-visible B, C, S, T, L, Q and J:

- Four steps gain “Locked while your video is being made.” — `src/main.ts:200`, `src/main.ts:1700`.
- “Announce progress” — `index.html:322`.
- “Says each stage out loud for a screen reader as the video is made. The result is always announced.” — `index.html:325`.
- “Keep this tab visible and your computer awake while the video is made. Closing the tab ends the job.” — `src/ui/progress.ts:126`.
- Initial status: “Creating your video. Keep this tab visible and your computer awake while the video is made. Closing the tab ends the job.” — `src/main.ts:1876`.
- Stage text: “Getting ready”; “Analysing audio”; “Encoding video — {percent}%”; “Finishing the file”; “Checking the file” — `src/ui/progress.ts:25`, `src/ui/progress.ts:82`.
- The separate status line can show “Encoding video”, “Encoding video — a quarter done”, “Encoding video — half done”, or “Encoding video — three quarters done”, while the adjacent progress text shows the current percentage — `src/ui/progress.ts:37`, `src/ui/progress.ts:91`; `src/main.ts:1404`.
- Cancelling: “Cancelling…” — `src/main.ts:2025`.
- Cancelled: “Cancelled. Nothing was saved, and your original file is unchanged.” — `src/main.ts:1942`.
- Failed: “The video could not be created.” plus F — `src/main.ts:1950`.

“Creating your video” is also the initially hidden progress label; stage updates replace it with the stage text while its visually-hidden class remains. Sources: `index.html:338`; `src/main.ts:1411`.

### R — finished, previous, saved and discard

Result content:

- “Finished video — {size}.” or “Previous video — {size}.” — `src/main.ts:2076`.
- “Made from {filename}: {kept part}, {preset label}, {closing choice}.” — `src/ui/result-summary.ts:97`.
- “It is kept here only until you save it or close this tab.” — `src/main.ts:2107`.
- “Save the video” — `src/main.ts:2122`.
- Completion status: “Your video is ready.” — `src/main.ts:1927`.

`{kept part}` is exactly:

- “the whole video ({duration})”; or
- “{kept duration} of {duration}, from {start time} to {end time}”.

`{closing choice}` is exactly:

- “no University closing”;
- “a cut to the {colour} closing card”;
- “the {colour} closing {sliding/fading} in over a held last frame”;
- “the {colour} closing {sliding/fading} in over the picture”.

Sources: `src/ui/result-summary.ts:43`, `src/ui/result-summary.ts:52`.

When the actual closing differs, add one of:

- “The closing could not be loaded, so it is not in this video. Everything else was applied as asked.”
- “You chose {Fade/Slide}, but the animation could not be loaded, so this video cuts to the {colour} closing card instead.”
- “Your video is shorter than the {fade/slide} animation, so the {colour} closing {fades/slides} in over a held last frame rather than over the picture.”
- “The {colour} closing {fades/slides} in over the picture, not over a held last frame as chosen.”

Sources: `src/ui/result-summary.ts:75`, `:83`, `:89`, `:93`. The last is defensive wording; its production reachability is **unverified** and its test explicitly describes it as not currently expected: `src/ui/result-summary.test.ts:73`.

Saving/status variants:

| Condition | Verbatim text | Source |
| --- | --- | --- |
| Saving | “Saving…” | `src/main.ts:2135` |
| Stopping | “Stopping the save…” | `src/main.ts:1614` |
| Explicit stop | “Save stopped. Nothing was kept where you were saving it, and the video is still here when you want it.” | `src/main.ts:2161` |
| Picker cancelled | “Not saved. The video is still here when you want it.” | `src/main.ts:2162` |
| Original refused | “That is the file you started with. Choose a different name or folder — this tool never changes your original.” | `src/main.ts:2168` |
| Browser download | “Saving to your downloads — the browser may still be finishing it. Once it is there, upload it where it is going, or choose another video in step 1. The video stays here until you start another one.” | `src/main.ts:2189` |
| Saved | “Saved. Check it where you saved it, then upload it where it is going — or choose another video in step 1.” | `src/main.ts:2194` |
| Save failed | “The video could not be saved. It is still here to try again.” | `src/main.ts:2223` |

Saving adds four “Locked while your video is being saved.” lines. A successful direct save changes the button to “Saved” and removes the result’s lifetime sentence. Sources: `src/main.ts:1702`, `src/main.ts:2210`.

The native save dialog adds browser/system wording, suggested filename `{source basename} ({branded/levelled/converted}).mp4`, and type description “MP4 video (.mp4)”. Browser wording is **unverified**. Sources: `src/media/save.ts:129`, `src/media/save.ts:214`.

The **discard question** replaces R’s normal content with:

- “You have not saved the video you just made. Starting again will discard it.”; or
- “Your download may still be finishing. Starting again will discard the video you just made.”
- The immutable “Made from …” summary, with any closing-outcome difference appended.
- “Discard it and start again”.
- “Keep it”.
- Separate status: “Your video is not saved yet.”

Sources: `src/main.ts:1748`, `src/main.ts:1756`, `src/main.ts:1766`, `src/main.ts:1771`, `src/main.ts:1785`, `src/main.ts:1796`.

### E — errors captured

Any underlying page state can gain:

- “Errors captured” — `index.html:355`.
- “Something in the tool went wrong. A video being made may not finish; your original file is not affected. Report it with the Send feedback button, which adds these details.” — `src/ui/failure-text.ts:140`.
- “Technical details” — `index.html:361`.
- “Report this problem” — `index.html:367`.

Open technical details add:

- “{origin} on the {thread} thread — {message}”.
- `{stack}`, if present.
- Further captured entries, as accumulated.

Sources: `src/main.ts:528`, `src/main.ts:536`, `src/main.ts:542`.

### D — feedback

D is a modal over the complete current page, which remains visible through the backdrop:

- “Send feedback” — `index.html:405`.
- “Your message goes to <joe.bell@nottingham.ac.uk> from your own email app. You will see the email before it is sent.” — `index.html:407`; `src/config/feedback.ts:14`.
- “Your message” — `index.html:411`.
- Current user-entered draft — `index.html:412`.
- “What will be sent with it” — `index.html:424`.
- “Open email app”; “Copy message and details”; “Close” — `index.html:433`, `:435`, `:437`.

Open disclosure adds:

> “Details that help find a problem: the app's version, your browser, how far you got, and your video's length, picture size and format. These details never include the video, its name, or anything in it.”

Source: `index.html:426`.

It also displays the actual diagnostics lines:

- `App: {buildId}`
- `Browser: {browser} on {system}`
- `Stage: {stage / unknown}`
- `Choices: output {preset}, closing {type} {onset} {colour}`
- `Device check: {outcome}{optional reasons and picture class}`
- `Video: {seconds} s, {width}x{height}, {rate} frames a second, {optional variable frame rate}, {codec}, {container}`
- `Audio: {codec}, {channels} ch, {sample rate} Hz`, or `Audio: none`
- `Error ({thread / ?}): {message / no message}`
- `Recent log:`
- `{level} {scope}: {message}{optional JSON data}`

Only applicable fields appear. Sources: `src/ui/feedback.ts:110`, `:139`, `:160`, `:174`, `:180`.

If details overflow the email allowance, add:

> `Too long for the email, so only in "Copy message and details":`

Source: `src/ui/feedback.ts:246`.

Feedback substates add:

- Empty message: “Write a message first.” — `index.html:420`.
- Too long: `Your message is too long to hand to your email app in one go. Choose "Copy message and details" and paste them into an email to <joe.bell@nottingham.ac.uk>.` — `src/main.ts:2367`.
- Mail launch: `Your email app should have opened with your message ready to send. If it did not, choose "Copy message and details" and paste them into an email to <joe.bell@nottingham.ac.uk>.` — `src/main.ts:2377`.
- Details truncated: “Some details did not fit in the email; the copy has them all.” — `src/main.ts:2380`.
- Copied: “Copied. Paste it into an email to <joe.bell@nottingham.ac.uk>.” — `src/main.ts:2389`.
- Copy failed: `Could not copy. Open "What will be sent with it", select the details, and copy them with your message.` — `src/main.ts:2394`.

### Complete state compositions and action audit

In this table, **B always includes the persistent introduction and footer above**. “Open disclosures” means their complete catalogued contents are additionally visible. A retained previous result can coexist with reading, checking, blocking and errors; it is not a replacement for them.

| State and reach | Whole visible page | Intended next action | Competition, repetition and unnecessary text |
| --- | --- | --- | --- |
| **Startup pending** — module setup and boot checks, `src/main.ts:552`, `:788` | B(pending) + C with disabled picker, normally empty source status; system rows if opened | Wait | No nearby plain waiting sentence at the disabled picker. Footer “checking” carries the explanation. Startup has no stop action. |
| **Empty** — `settleStartup()`, `src/main.ts:788` | B(settled) + C with “Choose a video to begin.” | Choose a file | “Choose a video” heading and “Choose a video to begin.” repeat. “Video file” is a necessary label, not expendable merely because related. Drop hint explains an alternative interaction. Cut the redundant status first. |
| **Reading, first file** — file change, `src/main.ts:852` | B + C(reading); no T/L/Q/J yet | Wait, or choose a replacement | No explicit Stop reading. The footer and lede remain. Reading is stated once on this first-file path. |
| **Reading, later file** — same handler, `src/main.ts:868`, `:883`, `:894` | B + C(reading) + previously revealed T(reading) + L + Q + J; add R(previous) if retained | Wait for this file; Save previous remains available | “Reading the video…” appears in C and T. Old selections remain visible. If R exists, checking the new file and saving the previous file are competing tasks that need clear separation. |
| **Read** — inspected reply, `src/main.ts:906` | B + C(read summary) + S + T + L + Q + J; immediately enters checking | Inspect desired choices, then follow verdict | Not a durable resting state: `runPreflight()` follows immediately. Duration, dimensions and channels repeat open properties; most read-summary technical facts are unnecessary on the main path. |
| **Checking** — `runPreflight()`, `src/main.ts:963` | B + C(read) + S + T + L + Q + J(“Checking…”, “Stop the check”); optional R(previous) | Wait; Stop the check if abandoning it | Sound checking and five open steps compete visually. Old failure/block content is not uniformly cleared on all entry paths; see below. |
| **Ready** — preflighted/proceed, `src/main.ts:1035` | B + C(read) + S + T + L + Q + J(V ready, possible W, Create, lifetime helper, “Device check complete.”); optional R(previous) | Create, after any optional choices | “Ready to go” and “Device check complete.” overlap. Estimate and size are useful; source resolution/channels are not needed to act. With R present, Create is now secondary. |
| **Warned** — preflighted/warn, same branch | Same complete page, V warning reasons and applicable W | Read consequence, then Create | Verdict reasons and sound warnings are separate stacked panels. “None of these stop you continuing” repeats the enabled action/ready verdict; retain actual consequences. |
| **Discouraged** — `showProcessControls()`, `src/main.ts:2040` | Same complete page, V discouraged; acknowledgement shown in place of Create; lifetime helper | Decide whether to continue despite the stated risk | “This will work” overpromises beside mobile/unknown-storage risk. Acknowledgement is visually secondary despite being the current continuation. Its long label is difficult to scan. |
| **Discouragement acknowledged** — acknowledgement handler, `src/main.ts:1535` | Same complete page and same V/W; acknowledgement replaced by Create | Create | Verdict remains discouraging without marking the acknowledgement as an additional result. That is preferable to another repetitive paragraph. |
| **Browser/file block** — block branch, `src/main.ts:1014` | B + C(block summary **and full verdict text**) + S + V(block in C); T/L/Q hidden; J only if R(previous) must remain available | Follow the specific remedy or choose another file | Full reason text is printed twice: source status and block panel. Generic “cannot … in this browser” is inaccurate for a storage-only block. |
| **Storage block** — `setupStepsResolve()`, `src/ui/preflight-panel.ts:40`; `src/main.ts:1028` | B + C(block) + S + V(block) + T + L + Q + J without Create; optional R(previous) | Shorten the kept range, choose Smaller / reduced, or free storage | Three remedies compete; trimming/output are actionable locally. “Free some space and try again” has no explicit retry action in this branch. Same-file re-selection behaviour is **unverified**. |
| **Rechecking after a block** — trim/preset change, `src/main.ts:1085`, `:1261` | Checking composition, potentially with stale C block text and source-block panel | Wait for replacement verdict | Source block is cleared only on successful non-block reply, and source-status is not restored there. **Unverified runtime consequence:** a recovered storage check can retain “This video cannot be processed…” above a ready verdict. `src/main.ts:1030`, `:1035`. |
| **Check failed** — failed reply/catch, `src/main.ts:1060`, `:1072` | B + C + S + T + L + Q + J(F check failure, identical status, Check again); optional R | Check again | “The device check did not finish.” appears in both F and status. Full reassurance/action need not be visibly repeated as a second failure block. |
| **Check stopped** — Stop handler, `src/main.ts:1589` | B + C + S + T + L + Q + J(check-stopped status, Check again); optional R | Check again when ready | “The video can be created once it has been checked” restates why Check again exists. A prior failed panel can persist after retry/stop: **unverified runtime**, because retry enters `runPreflight()` without clearing that panel. `src/main.ts:973`, `:1601`. |
| **Trim invalid** — field/range commit, `src/main.ts:1261` | B + C + S + T(error and current range summary) + L + Q + J(“Put … right…”); optional R | Correct the named time | Error is shared beneath both fields, not beside each field. Create status repeats the instruction at a distance. The old kept-range summary can describe the last accepted range while typed input is invalid. |
| **Too short to trim** — `renderTrim()`, `src/main.ts:1244` | Normal read/check/ready composition with T disabled and short-video explanation | Leave whole video and continue | Correctly explained; the full optional-trim tutorial and unavailable trim controls still consume space. Do not hide the whole step merely to satisfy uniformity. |
| **Preview unavailable** — preview error, `src/main.ts:1367` | Normal composition + T’s unavailable sentence; “Set … here” disabled | Type times, or keep whole video | Meaningful fallback exists. The asynchronous preview failure has no explicit live announcement at that handler. |
| **Unreadable source** — inspection failure, `src/main.ts:919`, `:933` | B + C(failed status + F). On later selections, retained T(no-video notice), L, Q, J and optional R also remain | Choose another/exported file | “That file could not be read.” repeats F. The later-selection trim notice repeats it again. Catch path omits the spoken-only detailed failure used by the ordinary failed reply. `src/main.ts:923`, `:942`. |
| **Running, initial** — `beginJob()`, `src/main.ts:1829` | B + C + S + locked T/L/Q + J, existing V/W, disabled Create, Cancel, announcement option/helper, lifetime helper, job notice, initial status | Wait; Cancel if abandoning | Initial status repeats the entire job notice verbatim. Preflight V/W still occupy the attention area. Four new lock lines are justified locally but should be quiet. |
| **Running, stages** — `onStage()`, `src/main.ts:1397` | Same whole running page; progress bar/text and stage/milestone status replace initial progress | Wait; Cancel if abandoning | Two visible progress descriptions can disagree in granularity: percentage versus last milestone. With announcements off, the initial visible status can remain while current progress changes. |
| **Cancelling** — cancel handler, `src/main.ts:2020` | Same running page; Cancel disabled; status “Cancelling…” | Wait for cleanup | Stage messages still use the same status writer. A late stage replacing “Cancelling…” is **unverified runtime**, but the writers are not separated. `src/main.ts:1404`, `:2025`. |
| **Cancelled** — cancelled reply, `src/main.ts:1940` | B + C + S + T + L + Q + J(Create, lifetime helper, cancelled status); progress/locks gone; no R | Create again or alter choices | Original-safety text repeats the persistent privacy promise; this repetition is required reassurance, not a reason to delete either indiscriminately. |
| **Creation failed** — reply/catch, `src/main.ts:1946`, `:1956` | B + C + S + T + L + Q + J(Create, lifetime helper, failed status, F); optional E | Follow the specific F remedy | Generic failure status overlaps F’s “what”; Create can be wrong next action for unlevellable/report-only failure. |
| **Failure while worker settles** — catch/finally, `src/main.ts:1956`, `:1978` | Failure composition can temporarily retain running locks/notice/progress while settlement is awaited | Wait for cleanup, then remedy | “Could not be created” beside running presentation is a source-traced **unverified runtime** intermediate state. |
| **Finished** — processed reply, `src/main.ts:1903`; `renderResult()`, `:2062` | B + C + S + T + L + Q + J(secondary Create, original pre-create lifetime helper, ready status, R, optional output W) | Save | Two lifetime sentences remain: `index.html:304` and `src/main.ts:2107`. Result summary properly records immutable choices; current controls are not a substitute. |
| **Finished with altered closing / metadata loss** — `src/main.ts:2094`, `:1919` | Finished composition + actual-outcome sentence and/or output W | Read difference, then Save | These are consequential warnings, not optional implementation facts. “Made from …” states requested choices; outcome sentence must remain adjacent. |
| **Saving: native picker / streaming** — Save handler, `src/main.ts:2125` | Finished composition with locked steps, Save disabled, “Saving…”, Stop saving; native picker overlays when applicable | Choose destination, then wait | Native picker supplies its own Cancel. On-page Stop saving cannot be used while that modal picker owns interaction. Focus handoff to Stop saving is not immediate in this handler. |
| **Stopping save** — `src/main.ts:1609` | Saving composition; Stop saving disabled; “Stopping the save…” | Wait | Honest intermediate state, but distinguish it from the post-delivery cleanup state below. |
| **Save stopped / picker cancelled / original refused / save failed** — `src/main.ts:2158`, `:2166`, `:2222` | B + C + S + T + L + Q + J(secondary Create, R with enabled Save, corresponding status); locks/Stop removed | Save again, choosing a suitable destination | Recovery is available. “Nothing was kept” overclaims when deletion of a newly created empty destination is unavailable or fails. `src/media/save.ts:165`. |
| **Saved, cleanup pending** — `src/main.ts:2194`–`:2216` | Saved status, disabled “Saved”, no R lifetime; still locked with Stop saving until `finally` | No save action remains; wait for cleanup | **Unverified runtime contradiction:** Stop saving may still be offered after “Saved”, and pressing it can replace success with “Stopping the save…”. |
| **Saved** — save `finally`, `src/main.ts:2227` | B + C + S + T + L + Q + J(secondary Create, saved status, R summary and disabled Saved); pre-create lifetime helper remains | Check/upload the saved file, or choose next recording | Pre-create lifetime helper is now stale or at least about a different possible future output. “Saved” button and success sentence are useful state reinforcement, not harmful duplication by themselves. |
| **Download handed off** — `src/main.ts:2172` | Finished composition with downloadable R retained, Save enabled again, long download status | Check browser download, then use the file | Correctly avoids claiming delivery. R lifetime text and “stays here until you start another one” need one consistent account. |
| **Previous video** — choose another file, `src/main.ts:894`; identity test `:2075` | The entire new-file state + R headed “Previous video” | Save previous before replacing it, or continue new-file setup | Two files are in view. The explicit heading and immutable summary are essential. A new check and a previous save share the status region; overlapping updates are **unverified runtime**. |
| **Discard question** — `confirmDiscardThenStart()`, `src/main.ts:1748` | B + C + S + T + L + Q + J(current verdict where present, secondary Create, discard question/summary/actions, unsaved status); normal R replaced | Decide Keep or Discard | “Your video is not saved yet” repeats the question. Destructive Discard is primary and receives unconditional initial focus. `src/main.ts:1797`. |
| **Captured errors** — `showError()`, `src/main.ts:528` | Entire underlying composition + E | Report the problem when relevant | Competes with any existing F and footer Send feedback. Technical detail is already disclosed; keep it there. E’s introduction is not itself a live region. |
| **Feedback** — `openFeedback()`, `src/main.ts:2302` | Entire underlying page behind backdrop + D | Write message, then Open email app | Copy and Close are secondary. Disclosure is long but optional. Main-page live updates may continue beneath the dialog; actual announcement interaction is **unverified**. |
| **Feedback invalid / too long / mail opened / copied / copy failed** — `src/main.ts:2359`, `:2383` | Same entire modal composition + corresponding message above | Correct message; use email app; or copy/paste as instructed | Error and instructions are near the task. Copy operation has no pending status or stop action; do not add machinery solely to satisfy the brief literally. |
| **Drag held / rejected** — `src/ui/drop-zone.ts:120` | Any complete underlying state + changed hint or drop error | Drop one acceptable file, or follow busy remedy | Rejection is an alert. Busy-drop text repeats existing lock/status information but is a response to an attempted action. |
| **Help / disclosure open** — `src/main.ts:343`; native details | Any corresponding complete state + the exact open contents above | Read, then return to choice | Closing help repeats the effect described in the closing result; this is optional explanatory repetition, not a main-path duplicate. |

Additional exceptional surfaces:

- **Module/worker-construction failure:** `new Worker()` is at top level, before later startup settlement and feedback-handler registration. A synchronous constructor exception could leave partially initialized HTML, disabled-state inconsistencies and inert feedback. This is **unverified**, not a reproduced startup defect. Sources: `src/main.ts:636`, `src/main.ts:788`, `src/main.ts:2403`.
- **No script/module load:** static HTML remains, including “Loading…” and initially enabled native file input, but there is no functional processing path or dedicated explanatory fallback in this document. Reachability and browser presentation **unverified**. Sources: `index.html:70`, `index.html:396`.
- **Leaving with work at risk:** browser-owned confirmation may appear; exact strings are **unverified** and cannot be authored by this UI. Source: `src/main.ts:1635`.
- **Development only:** “Copy diagnostics”, “Trigger test error (main)”, “Trigger test error (worker)”; copy reports “Copied a redacted diagnostics bundle to the clipboard.” or “Could not copy the diagnostics bundle. Check the console.” These overwrite source status. Sources: `src/main.ts:2412`, `:2422`, `:2430`, `:2440`.

## 2. Text form

**Definite form changes**, followed by cases where the brief needs an exception:

| Current line | Corrected form | Pin |
| --- | --- | --- |
| “adds approved branding” — `index.html:41` | **“Adds approved branding.”** | Exact `test/screen-text.test.ts:58` |
| “ensures consistent audio levels” — `index.html:42` | **“Ensures consistent audio levels.”** | Exact `test/screen-text.test.ts:59` |
| “outputs an optimised file type and size” — `index.html:43` | **“Outputs an optimised file type and size.”** | Exact `test/screen-text.test.ts:60` |
| Standalone check values “checking”, “available”, “not available”, “supported”, “not supported”, “ready in {ms} ms”, “failed to start”, “no response” — `src/main.ts:552`, `:563`, `:572`, `:621`, `:762`, `:807` | “Checking”, “Available”, “Not available”, “Supported”, “Not supported”, “Ready in {ms} ms”, “Failed to start”, “No response” | Not directly pinned by screen-text |
| “not supported — a video with sound cannot be made here” — `src/main.ts:627` | “Not supported — a video with sound cannot be made here” as a result label; or a separately punctuated explanation | Not screen-text |
| Standalone formatter fallback “unknown” — `src/ui/format.ts:16`, `:63`, `:82` | “Unknown” **at standalone display sites** | Not screen-text; formatter tests apply |
| Standalone duration “less than a second” — `src/ui/format.ts:18` | “Less than a second” **at standalone display sites** | Not screen-text; avoid changing embedded “Video read. …” mechanically |
| “Use the whole video” — `index.html:169` | “Keep whole video” | No exact screen-text wording pin found; trim behaviour tests apply |
| “I understand — carry on anyway” — `src/main.ts:1534` | “Continue anyway” | Not screen-text |
| “Discard it and start again” — `src/main.ts:1771` | “Discard and restart” | Not screen-text |
| “Copy message and details” — `index.html:435` | “Copy feedback” | Not screen-text; update its quoted references at `src/main.ts:2368`, `:2379`; `src/ui/feedback.ts:246` |
| “What will be sent with it” — `index.html:424` | “Included details” | Not screen-text; update copy-failure instruction at `src/main.ts:2395` |
| “Trigger test error (main)” / “Trigger test error (worker)” — `src/main.ts:2433`, `:2443` | “Test main error” / “Test worker error” | Not screen-text; development only |

**Long labels whose correction changes meaning or a settled term:**

| Current line | Proposed handling | Evidence |
| --- | --- | --- |
| “Over generated freeze frame” | **Do not silently shorten.** Four-word option conflicts with the literal three-word limit but is specified terminology. Flag the exception. | `index.html:210`; `docs/01-specification.md:141`; screen-text exact options at `test/screen-text.test.ts:175` |
| “Secure connection (needed for storage access)” | Label “Secure connection”; keep the storage explanation as optional explanation if needed | `src/main.ts:552`; not screen-text |
| “Video processing in the browser (WebCodecs)” | Label “Video processing”; retain/define WebCodecs within disclosed diagnostic detail if needed | `src/main.ts:553`; not screen-text |
| “Video format the tool makes (H.264)” | Label “Output video format”; value “H.264” with any required explanation | `src/main.ts:554`; not screen-text |
| “Sound format the tool makes (AAC)” | Label “Output sound format”; value “AAC” with any required explanation | `src/main.ts:555`; not screen-text |
| “Skip to main content” | Keep. It is a conventional navigation instruction; shortening it to meet a form-label rule is not useful | `index.html:13`; `UI-STANDARDS.md:111` says “where practical” |

**Punctuation/role decisions requiring consistency:**

- “Finished video — {size}.” and “Previous video — {size}.” read as result headings, though implemented as paragraphs. If retained as headings, use **“Finished video — {size}”** and **“Previous video — {size}”**. Source: `src/main.ts:2067`; not screen-text.
- “This tool does the following to your video:” is an introductory sentence, **not a colon-ended form label**. The rule does not mechanically prohibit it. It is nevertheless dispensable above the three promise lines. Source: `index.html:39`.
- “For EchoVideo or YouTube etc.” and “For messaging or email etc.” are helper fragments, not malformed labels. Clearer complete helpers would be **“Use this for EchoVideo or YouTube.”** and **“Use this for messaging or email.”** The fixed preset names remain unchanged. Sources: `index.html:280`, `:287`; screen-text pins the names, not these helpers, at `test/screen-text.test.ts:89`.
- Warning titles, verdict titles and loss titles are headings even where their element is a paragraph. They correctly omit stops. Do not add punctuation simply because the renderer creates a `p`. Sources: `src/ui/warning-text.ts:80`; `src/ui/preflight-panel.ts:235`; `src/ui/source-panel.ts:244`.
- “Getting ready”, “Analysing audio”, “Encoding video”, “Finishing the file”, “Checking the file”, “Saving…” and “Cancelling…” are status labels. Their lack of full stops is appropriate; ellipses are not sentence-case defects. Sources: `src/ui/progress.ts:25`; `src/main.ts:2135`, `:2025`.

**Diagnostic text is a literal exception to “no label colons”.** `App:`, `Browser:`, `Stage:`, `Choices:`, `Device check:`, `Video:`, `Audio:`, `Error (…) :`, “Recent log:” and the overflow notice all contain colons; log entries can begin lowercase. Reformatting their visible presentation into label/value rows would meet the literal rule, but changing diagnostic payload conventions merely for prose uniformity is unwarranted. Sources: `src/ui/feedback.ts:114`, `:128`, `:139`, `:160`, `:174`, `:180`, `:246`.

There are no additional fixed production button labels ending in full stops, nor ordinary form labels ending in colons, in the examined markup. Native control text, filenames, codec identifiers and arbitrary error/log data require explicit exclusion from a universal capitalisation rule. Sources: `index.html:69`, `:125`, `:192`, `:411`; `src/main.ts:536`; `src/ui/format.ts:97`.

**Pin limitations:** screen-text reads static markup; it does not validate all assembled runtime screens. Readability extracts strings rather than every fully composed rendered sentence. Neither is evidence that the state combinations above are visually or linguistically correct. Sources: `test/screen-text.test.ts:34`; `test/readability.test.ts:43`, `:65`, `:70`.

## 3. Tokens and layout

### Untokenised design values

All references in this subsection are to the later `src/styles/app.css`.

| Value | Locations | Treatment |
| --- | --- | --- |
| Body line height `1.5` | `:30` | Correct value, but outside tokens |
| Title line height `1.25` | `:137` | Move to an appropriate typography token |
| Shell width `60rem` | `:99`, `:159` | Shared layout token |
| Lede width `46rem` | `:166` | Reconcile with the now-present measure token |
| Status/icon-column size `1.5rem` | `:229`, `:327` | Separate semantic tokens if their roles differ |
| Error details max-height `12rem` | `:350` | Disclosure/detail height token |
| Facts label minimum `8rem` | `:462` | Layout token |
| Responsive breakpoint `34rem` | `:491` | Breakpoint token or documented stylesheet-level exception |
| Native checkbox/radio dimensions `1.25rem` | `:609`, `:610`, `:645`, `:646` | Control-size token |
| Radio alignment offset `0.15rem` | `:664` | Ad hoc alignment; use a defined control/text alignment |
| Field flex bases `12rem`, `20rem` | `:775`, `:782` | Layout tokens |
| Preview cap `60vh` | `:979` | Preview-size token |
| Development log cap `18rem` | `:1180` | Detail-height token if retained |
| Dialog width `40rem` | `:1195` | Modal-size token |
| Textarea minimum `8rem` | `:1220` | Textarea-size token |
| Feedback details cap `14rem` | `:1249` | Detail-height token |
| Border width `1px` | `:107`, `:111`, `:181`, `:233`, `:278`, `:393`, `:406`, `:440`, `:791`, `:806`, `:884`, `:942`, `:1116`, `:1183`, `:1198`, `:1222` | Shared border-width token |
| Swatch outline `1px` | `:943` | Shared thin-outline token |
| Notification/rail width `4px` | `:335`, `:486`, `:507`, `:833`, `:1145` | Shared notification-rail token |
| Focus width `2px`; offset `2px` | `:82`, `:83`, `:745`, `:746`, `:904`, `:905` | Focus tokens, with rendered verification |
| Drag/focus width `2px`; inset offset `-2px` | `:448`, `:449`, `:1091`, `:1092`, `:1096`, `:1097` | Separate inset-focus treatment where necessary |
| Invalid border `2px` | `:1124`, `:1232` | Error-border token |
| Thumb-gradient edge adjustments `1px` | `:1053`, `:1055`, `:1069`, `:1104`, `:1281`, `:1283`, `:1288`, `:1292` | Tokenise the edge treatment, not every arithmetic operator |
| Progress duration `1.8s` | `:574` | Motion token |
| Reduced-motion durations `0.01ms` | `:369`, `:371` | Reduced-motion token or deliberate structural exception |
| Backdrop mixture `60%` | `:1205` | Backdrop role token; it is a new derived colour despite using a palette input |

The new `--measure: 70ch` is correctly in `src/styles/tokens.carbon.css:51` and applied to `p`, `li`, `dd` at `src/styles/app.css:35`. The earlier absence of a reading measure is fixed in source.

### Structural literals that also fall outside a literal “every value” rule

These are present, but most should **not** become a collection of meaningless design tokens:

- Viewport/fill geometry: `100vh` at `:24`, `:1196`; `100vw` at `:1195`; `100%` widths/heights at `:98`, `:158`, `:390`, `:539`, `:788`, `:870`, `:871`, `:978`, `:1033`, `:1034`, `:1042`, `:1112`, `:1219`; hidden skip position `-100%` at `:69`.
- Visually-hidden technique: `1px`, `1px`, `-1px`, `inset(50%)` at `:356`–`:361`.
- Circular thumbs: `border-radius: 50%` at `:1050`, `:1066`.
- Slider geometry: `50%`, `-50%`, division by `2`, `100%`, normalised `0`/`1` at `:1012`, `:1014`, `:1019`, `:1020`, `:1025`, `:1026`.
- Chevron geometry: `-45deg`, `45deg` at `:715`, `:720`; negative spacing multiplier `-1` at `:729`.
- Progress geometry: `90deg`, stops `0%`, `40%`, `50%`, `60%`, `100%` at `:566`–`:571`; `250% 100%` at `:573`; positions `100% 0` and `0 0` at `:587`, `:590`.
- Flex/grid factors: `1`, `1.6`, `1fr`, `auto`, `max-content` at `:157`, `:229`, `:462`, `:493`, `:775`, `:782`, `:818`, `:864`, `:1128`.
- Reset/layout zeroes appear in margins, padding, borders, insets and minimum widths at `:25`, `:100`, `:134`, `:146`, `:150`, `:160`, `:165`, `:171`, `:175`, `:188`, `:205`, `:211`, `:221`, `:222`, `:237`, `:238`, `:346`, `:359`, `:429`, `:455`, `:464`, `:473`, `:484`, `:494`, `:525`, `:530`, `:543`, `:611`, `:619`, `:626`, `:627`, `:628`, `:632`, `:740`, `:776`, `:777`, `:819`, `:826`, `:831`, `:839`, `:852`–`:855`, `:869`, `:872`, `:890`, `:928`, `:960`, `:967`, `:991`, `:1000`, `:1032`, `:1035`, `:1049`, `:1065`, `:1113`, `:1136`, `:1150`, `:1157`, `:1158`, `:1164`, `:1170`, `:1178`, `:1209`, `:1214`, `:1236`, `:1242`.

Colour keywords outside tokens:

- `transparent`: `:278`, `:291`, `:407`, `:578`, `:582`, `:805`, `:918`, `:1036`, `:1043`, thumb gradients at `:1055`, `:1070`, `:1105`, backdrop `:1205`, forced-colour gradients `:1283`, `:1288`, `:1292`.
- `currentColor`: chevrons `:713`, `:714`; swatch outline `:943`.
- System colours: `CanvasText`, `Highlight`, `Canvas`, `GrayText`, `ButtonText`, `ButtonFace`, `HighlightText` at `:1271`–`:1332`. **These are intentional accessibility values**, now expressly required outside brand tokens by `UI-STANDARDS.md:207`.

TypeScript/inline values:

- `heading.style.margin = '0'` — `src/main.ts:534`; presentation belongs in a class, though zero itself is a reset.
- `--start-fraction` / `--end-fraction` assigned `0` or calculated fractions — `src/main.ts:1211`, `:1221`. These are media-dependent data, not design tokens.
- `'#000000'` fallback in `brandBackground()` — `src/main.ts:276`; it feeds output-media padding, not page CSS. This is outside the requested page styling surface but worth separating from any claim that the page has a hard-coded black colour.
- `rows="6"` affects the textarea’s intrinsic sizing — `index.html:415`.
- No literal `style` attribute is used in the examined page markup.

### Font sizes used once

- `--type-heading-04`, `1.75rem`, is used only for the page title: `src/styles/app.css:135`; token at `src/styles/tokens.carbon.css:47`.
- `--type-heading-compact` has one declaration use, warnings heading at `src/styles/app.css:1151`, but its **actual size is 1rem**, also the body size. It is not a unique numeric font size.
- The body token is inherited throughout the page; one explicit declaration does not mean one visible use. Sources: `src/styles/app.css:29`; `src/styles/tokens.carbon.css:43`.

The singleton title size is legitimate hierarchy. The brief’s blanket ban is addressed in section 7.

### Step spacing and anatomy

**The outer step gap is consistent:** every `.panel` has `margin-bottom: var(--spacing-06)`, and each step is a panel. No separate step-to-step margin discrepancy was found. Sources: `src/styles/app.css:180`; `index.html:62`, `:101`, `:174`, `:268`, `:296`.

Internal anatomy differs:

| Step | Actual sequence / spacing difference |
| --- | --- |
| Choose | Heading → optional lock note → nested padded drop zone → source status → losses/properties → block verdict. Its status is **not last**. `index.html:63`, `:85`, `:86`, `:91`; `src/styles/app.css:438`. |
| Trim | Heading → lock note → introduction → preview → ranges → time fields → format helper → shared error → result → reset action. Result is **before** the final control. `index.html:102`, `:159`, `:166`, `:167`. |
| Closing | Heading → lock note → controls, helper/reasons → result. Closest match to the proposed anatomy. `index.html:175`, `:192`, `:264`. |
| File size / quality | Heading → lock note → two described radios; **no result line**. `index.html:269`, `:279`, `:287`. |
| Create | Verdict → warnings → action/helper → status/stop → announcement controls → job notice → progress → result. The result itself ends in Save; status is separate and earlier. `index.html:298`, `:312`, `:319`, `:338`, `:351`; `src/main.ts:2245`. |

Within-step gaps mix field bottom spacing 16px, status top 12px, helper top 8px, actions top 24px, result top 16px, verdict/warnings top 24px and disclosure top 16px. Those values are mostly tokenised; the problem is **inconsistent role placement**, not random outer gaps. Sources: `src/styles/app.css:214`, `:267`, `:377`, `:428`, `:504`, `:681`, `:959`, `:1135`, `:1142`.

Actual collapsed margins and visual gap measurements remain **unverified**.

### Reading width, phone width and enlargement

| Finding | Evidence / assessment |
| --- | --- |
| New running-text measure is present | `p`, `li`, `dd` are capped at `70ch`; do not report this as absent. `src/styles/app.css:35`. |
| Not every text container is covered | Labels, radio-detail spans, check-row spans, headings and `pre` are outside that selector. Some are short by design; long diagnostics already wrap. `src/styles/app.css:261`, `:674`, `:1241`. |
| Paragraph spacing | `.lede p { margin: 0 }` and toggletip paragraphs with 8px separation do not implement the specification’s stated 1.5× paragraph spacing by default. Whether a sufficient user mechanism meets 1.4.8 is **unverified**; surviving a 1.4.12 override is a separate question. `src/styles/app.css:170`, `:838`; `docs/01-specification.md:597`. |
| Nested file-input width | At 320px, shell padding, panel padding, drop-zone padding and input padding leave little space for native picker text and filename. Actual clipping **unverified**. `src/styles/app.css:161`, `:183`, `:392`, `:439`. |
| Trim input/action row | `.control-with-help` does not wrap; its button cannot shrink, while the time field can. A field reduced to an unusable sliver is **unverified**. `src/styles/app.css:812`, `:1113`, `:1127`, `:1131`. |
| Long onset option plus help | Native select is allowed to shrink beside a fixed 44px help button. Full selected option visibility at 320px/200% is **unverified**. `src/styles/app.css:817`, `:823`; `index.html:210`. |
| Colour segments | Two segments do not wrap; each contains padding, an enlarged 32px swatch, gap and label. Text enlargement and translated labels can force overflow. **Unverified.** `src/styles/app.css:858`, `:877`, `:938`. |
| Fieldset minimum | `.choice` does not reset native fieldset minimum width; `.segmented` does. Long contents may retain a min-content constraint. **Unverified.** `src/styles/app.css:625`, `:851`. |
| Footer checks | Three-column grid retains an `auto` result column and has no corresponding narrow-layout change. The AAC failure is especially long. **Unverified.** `src/styles/app.css:227`; `src/main.ts:627`. |
| Long filename/result | “Made from {filename}…” has no dedicated overflow-wrap treatment. Long unbroken filenames may overflow even within `70ch`. **Unverified.** `src/ui/result-summary.ts:99`; `src/styles/app.css:529`. |
| Preview movement | Width and maximum height are set, but no aspect ratio/reserved height is declared before metadata arrives. Layout movement **unverified**. `src/styles/app.css:976`; `src/main.ts:1184`. |
| Logo | Height is reserved, which is good. Its intrinsic width has no max-width safeguard; actual 320px fit depends on the asset. **Unverified.** `src/styles/app.css:120`, `:126`. |
| Dialog | At narrow widths, 32px internal padding reduces message/action width; actions wrap, but the long copy label remains a stress case. **Unverified.** `src/styles/app.css:1194`, `:267`; `index.html:435`. |

The earlier review’s successful 320/390px and text-spacing observations are useful prior evidence, **not validation of these newer styles**. Source: `reviews/2026-10-01/uon-video-helper-ux-review-2026-10-01.md:607`.

## 4. Controls against VH-112

The criterion references below distinguish requirements from source findings. Relevant normative guidance: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [target size, enhanced](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html), [focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html), [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

| Control/surface | Source finding | Rule and remaining assessment |
| --- | --- | --- |
| **Choose file** | Native input; native selector button has 44px minimum height and outlined styling. Disabled picker button receives distinct colours. `index.html:70`; `src/styles/app.css:388`, `:400`, `:421`. | Native-first satisfied in source. Exact target width, clipping and focus drawing **unverified**. 2.5.5, 2.4.7, 2.4.13. |
| **Drop zone** | Alternative to picker, with held text and alert refusal. Whole zone is not a general click target. `src/ui/drop-zone.ts:87`, `:120`; `index.html:78`. | Keyboard alternative exists; no need to turn the whole zone into another custom button. 2.1.1, 2.5.7. Busy/error direction wording needs correction. |
| **Native preview** | Browser controls; no autoplay. `index.html:108`; `test/screen-text.test.ts:334`. | Keep documented browser-control target exception. Do not require replacement custom controls to meet literal 44px. `docs/01-specification.md:613`. |
| **Two range handles** | Native inputs; 44px thumb boxes; custom painted tracks/thumbs; keyboard handler adds movement rules. `index.html:119`; `src/styles/app.css:1046`, `:1062`; `src/main.ts:1314`. | Alternatives to dragging exist. Pointer overlap, focus-ring area and rendered changed-pixel contrast **unverified**. 2.1.1, 2.5.5, 2.5.7, 2.4.13. |
| **Time fields** | Visible labels, described format/error/result, invalid border, 44px minimum height. `index.html:125`, `:134`, `:142`; `src/styles/app.css:1110`. | Good source structure. Shared error location, field shrinkage and decimal-keyboard colon availability remain risks. 3.3.1, 3.3.2, 1.4.10; phone keyboard belongs with VH-113. |
| **Set start/end here** | Secondary native buttons, disabled when no preview. `index.html:136`, `:153`; `src/main.ts:1720`. | Preview-unavailable sentence explains why, but its asynchronous appearance is not announced explicitly. 4.1.3; 2.5.5 verification still rendered. |
| **Keep whole video action** | Secondary; disabled at whole range; click moves focus to start handle. `index.html:168`; `src/main.ts:1356`. | State explanation comes from range summary. Preserve purposeful handoff; do not introduce a custom reset widget. |
| **Animation selects** | Native selects; visible labels; Cut/None reason; revised dashed disabled edges and transparent fill. `index.html:192`, `:201`; `src/ui/closing-choice.ts:64`; `src/styles/app.css:803`. | Previous enabled-looking disabled-select defect addressed in source. Disabled text uses secondary text on panel surface; rendered distinction **unverified**. Project 7:1 requirement is stricter than WCAG’s inactive-control exemption. |
| **Onset help** | Native button, 44px width/minimum height; accessible name and expanded state. Escape/outside click close it. `index.html:214`; `src/main.ts:343`; `src/styles/app.css:823`. | Text-only help remains open on Tab; Carbon departure. Focus/name usability **unverified**, not a proven 2.5.3 violation: “?” is symbolic rather than a conflicting word label. |
| **Colour radios** | Native radio semantics under segment faces; full-face input target. New wide swatches preserve actual colours and no longer use square checkbox-like chips. `index.html:240`; `src/styles/app.css:867`, `:938`. | Preserve these new changes. Disabled selected state retains principally font weight; whether selection remains obvious is **unverified**. 1.4.1, 1.4.11, 4.1.2. |
| **Preset radios** | Native radio group, visible purpose helpers, 44px label rows. `index.html:268`; `src/styles/app.css:635`. | Native-first satisfied. Disabled text styling exists; native radio disabled rendering is browser-dependent and **unverified**. |
| **Create / Save** | `syncCreateEmphasis()` makes Create secondary beside unsaved or same-source saved results. `src/main.ts:1820`, `:2249`. | Earlier two-primary finding is addressed in source. Verify all previous-result, download, saved and new-file branches; do not “fix” by removing Save. Carbon primary-action hierarchy; `UI-STANDARDS.md:226`. |
| **Discouragement acknowledgement** | Secondary-styled button replaces Create until accepted. `src/main.ts:1531`. | Only continuation is visually secondary. Decide deliberate warning hierarchy rather than blindly promoting a risky action. Carbon button hierarchy. |
| **Cancel / Stop check / Stop saving / Check again** | Secondary buttons; Stop becomes disabled while stopping. `src/main.ts:1516`, `:1559`, `:1614`. | Clear action names. Cancelled/stopped progress must not be overwritten by later status writes. Stop saving must disappear when delivery finishes, before scratch cleanup. |
| **Discard / Keep** | Discard primary, Keep secondary; Discard gets unconditional initial focus. `src/main.ts:1770`, `:1782`, `:1797`. | Confirmation exists, but destructive emphasis/default focus deserves review. Carbon danger-action guidance; 3.3.6 error prevention, 2.4.3 focus order. Do not add a new dialog solely for style. |
| **Announce progress** | Actual native checkbox; 44px label row; saved preference; stages/milestones only. `index.html:319`; `src/styles/app.css:599`; `src/ui/progress.ts:133`. | Preserve suppression and meaningful outcome announcements. It is an accessibility preference, not forbidden codec/settings creep. 2.2.4, 4.1.3. |
| **Progress bar** | Native progress semantics, measured only for encoding; custom paint. Name changes with stage and percentage. `src/main.ts:1397`; `src/styles/app.css:537`. | No invented percentage on unmeasured stages: good. Duplicate visible status and unstable accessible name remain. Forced-colour block does not address custom progress paint; actual visibility **unverified**. 1.4.11, 4.1.2, 4.1.3. |
| **Disclosures** | Native `details/summary`; 44px summary height; border chevron; explicit focus. `src/styles/app.css:685`, `:707`, `:744`. | Good base. Focus ring may meet colour-token checks without proving rendered area/changed pixels. Verify dark footer and forced colours. |
| **Feedback/report buttons** | Secondary main-page entries; ordinary native buttons. `index.html:367`, `:393`. | Correctly quieter than Create/Save. Both appear when E is open; intentional local/global access, not two primary actions. |
| **Feedback textarea** | Visible label, native textarea, minimum 8rem height; error and invalid border. `index.html:411`; `src/styles/app.css:1217`. | Focus/error association and modal reflow need browser confirmation; no source evidence of a target-size problem. |
| **Feedback actions** | Open email app primary; Copy and Close secondary. `index.html:433`. | One primary within the modal. Carbon modal action ordering differs; long Copy label affects narrow layouts. |
| **Dev diagnostics** | Text buttons, not the icon-button-with-tooltip pattern specified locally. `src/main.ts:2412`; `UI-STANDARDS.md:285`. | Development-only pattern deviation; low priority for VH-124. |

**Global focus and forced colours:**

- General focus is a 2px outline with 2px offset; thumb focus removes the input outline and paints the thumb instead. This is not enough to certify the rendered 2.4.13 area and pixel-change tests. Sources: `src/styles/app.css:81`, `:1085`; `test/contrast.test.ts:118`.
- New forced-colour rules exist for slider, segments and swatches. Do not repeat the earlier “none exist” finding. Sources: `src/styles/app.css:1263`.
- The slider opt-out applies to the entire `.range-slider`, including its labels, while explicit system colours target its track/thumbs. Verify label contrast under custom Windows palettes; failure is **unverified**. Sources: `src/styles/app.css:1264`, `:1270`; `index.html:112`.
- Disabled Firefox thumbs have no corresponding `::-moz-range-thumb` disabled rule, either ordinarily or in the forced-colour block. Native disabled behaviour still applies, but visual differentiation is **unverified**. Sources: `src/styles/app.css:1062`, `:1100`, `:1287`, `:1291`.
- Swatch colour preservation is intentional; its outline and surrounding state still need contrast verification in light, dark, selected, disabled and forced-colour states. Sources: `src/styles/app.css:938`, `:1319`.
- The contrast tests cover token pairs, not all custom paint, native controls, target hit areas or focus geometry. Sources: `test/contrast.test.ts:95`, `:114`, `:184`.

**Build on VH-111:**

Keep `focusHeldBy()`, its protection against stealing focus from a user who moved elsewhere, and the visible-message/spoken-tail split. Sources: `src/main.ts:425`, `:442`, `:459`.

Extend that established approach to:

1. Block verdicts currently concatenated into visible source status — `src/main.ts:1030`.
2. Read-failure catch lacking the detailed spoken tail — `src/main.ts:942`.
3. Save-stop completion’s unconditional `save.focus()` — `src/main.ts:2236`.
4. Async preview/captured-error updates whose announcement treatment remains incomplete — `src/main.ts:1367`, `:528`.

Those are follow-through points, not reasons to reverse VH-111.

## 5. Carbon pattern check

| Component | Carbon reference and departure |
| --- | --- |
| **File uploader/drop zone** | Carbon [file uploader](https://www.carbondesignsystem.com/building-blocks/core/components/file-uploader/guidelines): identifiable action, instructions, selected-file state and errors. Here a nested native picker carries the selected filename while the dashed zone persists and report/error content appears outside it. This is a reasonable native-first adaptation, but its double border/padding and dispersed status need a deliberate anatomy. `index.html:68`, `:85`; `src/styles/app.css:388`, `:438`. |
| **Two-handle slider** | Carbon [slider](https://www.carbondesignsystem.com/building-blocks/core/components/slider/guidelines): labelled range, handles and numeric entry. The project has suitable typed-time alternatives, but track pointer events are disabled, so clicking the track does not provide Carbon’s nearest-handle movement. Enlarged overlapping hit boxes and separate label/field rows are adaptations to verify. `src/styles/app.css:1030`; `index.html:112`, `:123`. |
| **Select** | Carbon [select](https://carbondesignsystem.com/components/select/usage/): native select, label/helper/error structure. Native implementation is correct; the all-round border, 44px floor and adjacent help are local adaptations. Do not replace the two-option onset select merely because Carbon generally favours other controls for very short lists; this task excludes new controls and the options are specified. `index.html:201`; `src/styles/app.css:785`. |
| **Preset radio group** | Carbon [radio button](https://www.carbondesignsystem.com/building-blocks/core/components/radio-button/guidelines): circular choices with labels, grouped and usually vertical. Source follows this. Helpers are stacked within each label; custom `0.15rem` alignment is the spacing departure. `index.html:273`; `src/styles/app.css:657`. |
| **Segmented colour choice** | Treat as a **radio group with colour samples**, not Carbon [content switcher](https://www.carbondesignsystem.com/building-blocks/core/components/content-switcher/guidelines), which changes views. Native radios are right. Rectangular swatches now avoid checkbox-like chips; disabled selection emphasis and forced colours still require inspection. `index.html:240`; `src/styles/app.css:851`, `:938`. |
| **Toggletip** | Carbon [toggletip](https://carbondesignsystem.com/components/toggletip/usage/) and [accessibility behaviour](https://carbondesignsystem.com/components/toggletip/accessibility/): triggered contextual content, restrained width, dismissal rules. This is an in-flow, full-width, left-bordered block without the usual anchored bubble/caret; it does not close on Tab as text-only Carbon help does. Record an intentional adaptation or align it. `src/styles/app.css:830`; `src/main.ts:343`. |
| **Progress bar** | Carbon [progress bar](https://carbondesignsystem.com/components/progress-bar/usage/): stable task label, bar, optional helper/status; determinate versus indeterminate selected honestly. The latter is done well. Here the accessible label changes with percentage and two visible progress lines coexist. Use one coherent visible presentation with controlled live announcements. `src/main.ts:1397`; `src/styles/app.css:537`. |
| **Inline notifications/warnings** | Carbon [notification](https://carbondesignsystem.com/components/notification/usage/): recognizable status anatomy, concise title/body and appropriate action. Current variants use different custom left-rail boxes, mostly without status icons, with long bodies and repeated generic status lines. Do not hide loss/risk consequences just to shorten them. `src/styles/app.css:483`, `:504`, `:1142`; `src/ui/warning-text.ts:80`. |
| **Disclosure** | Carbon [accordion](https://www.carbondesignsystem.com/building-blocks/core/components/accordion/guidelines): clear header/toggle and associated body. Native details preserve semantics. “Video properties” is a minimal disclosure; system check is a boxed full-width accordion-like row. The two need consistent trigger anatomy, not necessarily identical containment. `src/ui/source-panel.ts:272`; `src/styles/app.css:685`, `:728`. |
| **Dialog** | Carbon [modal](https://www.carbondesignsystem.com/building-blocks/core/components/modal/guidelines): header/body/footer, predictable dismissal and action hierarchy. Native dialog is appropriate. Current footer has primary first rather than the usual right-side modal primary, three actions, and only a footer Close. This is a pattern departure, not proof of an accessibility failure. `index.html:403`, `:432`; `src/styles/app.css:1194`. |
| **Buttons** | Carbon [button](https://www.carbondesignsystem.com/building-blocks/core/components/button/guidelines): one primary, clear lower-emphasis actions, danger treatment for consequential destruction. `.button--secondary` visually resembles Carbon’s outlined tertiary rather than filled secondary; internal class name is not itself a product defect. Discard is ordinary primary. Create/Save hierarchy now has explicit state handling. `src/styles/app.css:290`; `src/main.ts:1770`, `:1820`. |
| **Footer system check** | Best understood as accordion/disclosure containing a status list, not a second workflow step. Its prominent boxed blue-band placement, six long labels and three-column results are heavier than its supporting role. Automatic opening on failure is useful; retain the summary and explanation path. `index.html:383`; `src/main.ts:395`; `src/styles/app.css:227`, `:728`. |

## 6. Ranked change list

Ranked by what a first-time member of staff encounters, rather than implementation severity.

| Rank | States | Change, in words | Rule and affected pins |
| --- | --- | --- | --- |
| **1** | Empty and every later state | Capitalise/punctuate the three promises. Remove the redundant introductory lead and “Choose a video to begin.” Keep the visible file label, privacy sentence and a concise discoverable browser statement. | VH-124 text economy/form. `index.html:39`, `:41`; `src/main.ts:801`. Exact bullet pins `test/screen-text.test.ts:55`; preserve privacy/browser pins `:34`, `:64`. |
| **2** | Read/checking/ready | Reduce the visible read summary to confirmation useful for choosing the next action; keep resolution, frame rate and channels in existing Video properties. Give verdict and Create the strongest local grouping. | Main-path simplicity. `src/ui/source-panel.ts:215`; `src/main.ts:1037`. Source-panel/preflight tests; no exact runtime screen-text pin. |
| **3** | Blocked/recovered/check failed/retry | Use VH-111’s spoken-only tail for detailed block announcements; show reasons once. Clear obsolete error/block content when its replacement check starts, and restore source status after recovery. | Honest current state; no repeated visible reasons. `src/main.ts:973`, `:1030`, `:1035`, `:1065`. Preflight, failure-text and announce tests; add meaningful transition coverage rather than static text-only assertions. |
| **4** | All revealed steps | Make internal spacing and result placement deliberate: Trim’s summary after its reset action; consistent control/helper/result gaps; retain native radio state instead of inventing a repetitive Q result sentence. | Consistent anatomy without pointless copy. `index.html:166`, `:167`, `:268`; `src/styles/app.css:214`, `:267`. Screen-text step/order pins `test/screen-text.test.ts:225`, `:275`; stylesheet checks. |
| **5** | Phone/enlarged states | Resolve narrow nested uploader, non-wrapping time/action rows, colour segments and footer check columns. Ensure long filenames and selected onset text remain usable. | Reflow/text spacing. `src/styles/app.css:388`, `:812`, `:858`, `:227`; `src/ui/result-summary.ts:99`. Existing CSS tests do not prove rendered fit; browser evidence required. Coordinate VH-113. |
| **6** | Closing/disabled/running/saving | Preserve newer swatches, dashed disabled controls and lock messages; finish verification in all colour contexts. Narrow forced-colour opt-outs if descendant text or progress paint fails. | VH-112, 1.4.11, 2.4.13. `src/styles/app.css:803`, `:938`, `:1263`. Contrast/stylesheet tests plus rendered evidence. |
| **7** | Warned/discouraged | Replace the guarantee “This will work” with honest risk wording. Shorten acknowledgement to “Continue anyway”. Keep consequential warnings visible; remove only generic repeated reassurance. | Truthful status and concise controls. `src/ui/preflight-panel.ts:55`; `src/main.ts:1534`; `src/ui/warning-text.ts:126`. Preflight/warning tests; not static screen-text. |
| **8** | Running/cancelling | Withdraw the obsolete ready verdict. Use one visible progress account; retain controlled spoken stages/milestones independently. State the keep-awake/tab warning once. Preserve “Cancelling…” until cancellation settles. | One focal task; honest status; VH-111/VH-109 continuity. `src/main.ts:1404`, `:1876`, `:2025`; `src/ui/progress.ts:126`. Progress/announce tests; screen-text status/progress order pins. |
| **9** | Finished/previous | Retain immutable result identity and actual closing outcome. Remove the pre-create lifetime helper once the result’s lifetime sentence is present. Keep Create secondary as the newer code now does. | One primary; no duplicate lifetime message; source/result distinction. `index.html:304`; `src/main.ts:2076`, `:2107`, `:1820`. Result-summary tests; relevant static structure pins only. |
| **10** | Saving/saved/stopped | End the saving UI when delivery completes, before scratch cleanup. Remove stale lifetime text after success. Avoid claiming no destination file remains unless cleanup actually established that. | Honest status; bounded promise. `src/main.ts:2194`, `:2216`, `:2232`; `src/media/save.ts:165`. Save tests and failure/transition cases, not screen-text. |
| **11** | Failures and captured errors | One visible “what happened / original safe / what next” treatment. Keep full detail in announcements and disclosures. Make report-only remedies visually clearer than an indiscriminate retry button. | Error recovery and VH-111. `src/ui/failure-text.ts:36`; `src/main.ts:942`, `:1950`, `:528`. Failure-text/announce tests. |
| **12** | Discard question | Shorten action labels; remove the duplicate unsaved-status sentence; review safe initial focus and destructive styling while retaining confirmation. | Error prevention and Carbon hierarchy. `src/main.ts:1756`, `:1771`, `:1796`. Runtime transition verification; no exact screen-text pin. |
| **13** | Feedback/footer/help | Shorten long functional labels, align toggletip dismissal, simplify system-check labels, and settle modal action ordering. Keep diagnostics optional and feedback available in every state. | Carbon patterns and readable supporting UI. `index.html:424`, `:435`; `src/main.ts:552`, `:343`. Feedback/system-check tests; accessibility structure pins. |
| **14** | All | Centralise the genuine design constants listed in section 3. Exempt structural arithmetic, normalised media data and system colours explicitly. | Token discipline without obscuring CSS. `src/styles/app.css:30`, `:99`, `:574`, `:1205`; `src/styles/tokens.carbon.css:25`. Stylesheet/contrast tests; do not treat their current limited checks as full token enforcement. |

### Out of scope, noted

- Folding completed steps: VH-97 remains unbuilt and outside this task. `pm_skills/project/backlog.md:297`; `pm_skills/project/tickets/VH-124.md:123`.
- Changing the five-step order or fixed names Cut/Fade/Slide/None, Larger / better, Smaller / reduced, or rewriting the privacy sentence. `pm_skills/project/tickets/VH-124.md:124`.
- New settings, new preview/editor controls, caption authoring or new output choices. `pm_skills/project/tickets/VH-124.md:123`; `docs/01-specification.md:559`.
- Worker-side device classification, actual mobile background behaviour and native phone save destinations remain VH-113 work; this review flags their visible wording/layout intersections only. `pm_skills/project/backlog.md:131`.
- Translation implementation and native-language acceptance remain VH-105. `pm_skills/project/backlog.md:147`.
- Real staff comprehension, actual assistive-technology behaviour and managed-device usability cannot be signed off by this source review or screenshots alone. `reviews/2026-10-01/uon-video-helper-ux-review-2026-10-01.md:674`.

## 7. Where the brief is wrong

| Brief instruction | Conflict or harm if literal | Required interpretation |
| --- | --- | --- |
| “Every sentence … is said once”; no repeated visible line | Spec requires persistent privacy and original-safety reassurance in failures, plus result-lifetime explanation before Create and beside the result. `pm_skills/project/tickets/VH-124.md:38`; `docs/01-specification.md:449`, `:567`, `:571`. | Remove simultaneous redundant implementations, not contextually necessary reassurance. |
| Empty page is “the file control and the three-line promise” | Browser statement, persistent privacy and always-available feedback are also required. `pm_skills/project/tickets/VH-124.md:31`; `docs/01-specification.md:571`, `:574`, `:637`. | Treat this as visual priority, not permission to delete required content. |
| “Live regions for what the user did not cause and nothing else” | A user causes Save, Cancel and Check again, but their asynchronous outcomes still need announcements. Spec and local standards explicitly require consequential statuses/validation. `pm_skills/project/tickets/VH-124.md:93`; `docs/01-specification.md:602`; `UI-STANDARDS.md:119`. | Suppress echoes of a control’s own value change; announce consequential asynchronous results. Preserve VH-111. |
| Every wait “can be stopped” | Startup, reading, clipboard operations and native picker interaction differ. Adding a stop control for every promise would conflict with “no new controls” and could worsen the page. `pm_skills/project/tickets/VH-124.md:85`, `:123`; `src/main.ts:788`, `:2388`. | Require meaningful abandonment/recovery for substantial waits; record exceptions rather than inventing controls. |
| No unit or implementation word on main path | Spec names stages such as “Analysing audio” and “Encoding video”; time and estimated size are useful consequences, not settings. `pm_skills/project/tickets/VH-124.md:99`; `docs/01-specification.md:559`; `src/ui/preflight-panel.ts:190`, `:198`. | Remove unexplained internals. Keep useful quantities and required stage meaning. Flag naming changes against the spec before acting. |
| Labels strictly one–three words | Local standard says “where practical”; specified “Over generated freeze frame” is four words. `pm_skills/project/tickets/VH-124.md:57`; `UI-STANDARDS.md:111`; `docs/01-specification.md:141`. | Permit clear, established exceptions. Do not sacrifice meaning or silently change specified wording. |
| No font size used once | A single page title naturally uses one title size. It already comes from the defined scale. `pm_skills/project/tickets/VH-124.md:59`; `src/styles/app.css:135`; `src/styles/tokens.carbon.css:47`. | Ban arbitrary off-scale sizes, not semantic hierarchy. |
| Identical anatomy with a result line in every step | Q’s selected radio already expresses the result; adding “You selected…” repeats it. Choose’s loss warnings and Create’s retained result need richer structures. `pm_skills/project/tickets/VH-124.md:64`; `index.html:268`; `src/ui/source-panel.ts:232`. | Consistent rhythm and hierarchy, with justified anatomy differences. |
| “Nothing moves … reveal below the fold” | New errors/results need to appear where relevant and be discoverable. “Below the fold” is viewport-dependent and can hide the next action. `pm_skills/project/tickets/VH-124.md:72`; `UI-STANDARDS.md:152`, `:156`. | Avoid avoidable jumps; reserve predictable regions and use announcements/focus appropriately. Do not force consequential content offscreen. |
| Every control at least 44×44, without qualification | Spec records a native-video-controls exception. `pm_skills/project/tickets/VH-124.md:78`; `docs/01-specification.md:613`. | Preserve the documented exception. |
| Every colour value comes from the two token files | Newly added standards explicitly require system colours in forced-colour CSS, outside brand tokens. `pm_skills/project/tickets/VH-124.md:107`; `UI-STANDARDS.md:207`. | Explicitly exempt system colours, `currentColor`, transparency and structural geometry. |
| “One … action at every moment” | Waiting and successful completion need not always present a new primary button; forcing one can make Cancel or destruction overly prominent. `pm_skills/project/tickets/VH-124.md:29`; `src/main.ts:1942`, `:2194`. | One clear next **course of action**, which may be waiting or using the saved file. |
| Capital at start of every line | Simplified Chinese has no uppercase/lowercase distinction; runtime filenames and diagnostic identifiers should not be altered. `pm_skills/project/tickets/VH-124.md:52`; `pm_skills/project/backlog.md:147`; `src/ui/result-summary.ts:99`. | Apply language-appropriate editorial rules to authored prose, not data. |

Two further standards/pin discrepancies deserve explicit decisions:

- `test/readability.test.ts:115` exempts abbreviations/format identifiers that the specification says do not yet have accepted exceptions. A passing readability test is not ratification of those exemptions. Source: `docs/01-specification.md:627`.
- The new `UI-STANDARDS.md:205` describes paragraph spacing primarily as surviving overrides, while `docs/01-specification.md:597` states a paragraph-spacing requirement. Clarify the mechanism and acceptance evidence rather than treating 1.4.12 text-spacing survival as the whole of 1.4.8. See [WCAG visual presentation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html).

## 8. Notes for VH-105

| Source | Translation consequence |
| --- | --- |
| `index.html:41`; `src/ui/system-check.ts:70` | Static initial text and dynamic replacement text need the same message catalogue. Otherwise browser language changes after checks finish. |
| `src/main.ts:425`, `:442`; `src/ui/announce.ts:49` | Keep visible and spoken-only variants associated by message identity. Do not translate the visible short sentence while leaving the detailed announced tail in English. |
| `src/ui/source-panel.ts:61`, `:114` | Hand-built singular/plural track counts and `' and '` joins encode English grammar. Use complete plural-aware messages/list formatting. |
| `src/ui/source-panel.ts:215` | “Video read. …” concatenates formatted facts and lowercases channel descriptions. Lowercasing a translated standalone label is not a safe sentence-building strategy. |
| `src/ui/preflight-panel.ts:63` | Number words “two” through “six”, then numerals, are hard-coded English editorial choices. |
| `src/ui/preflight-panel.ts:74` | Browser remedies are appended to many different sentences. Translate complete contextual messages or ensure fragments have explicit grammatical contracts. |
| `src/ui/preflight-panel.ts:214`, `:226` | Sentences are split across string literals; readability extraction can inspect pieces instead of the assembled sentence. Store whole messages. |
| `src/ui/closing-choice.ts:30`, `:42` | Manual “second/seconds” pluralisation. |
| `src/ui/closing-choice.ts:45`, `:49`, `:50` | Colour, verb and closing type are inserted into fixed English word order. Full variants are safer than translating isolated “slides”, “fades”, “blue”, “white”. |
| `src/ui/result-summary.ts:43`, `:52`, `:99` | “Made from …: …, …, …” combines filename, duration clause, preset and closing fragments. Use a complete result-summary message with named placeholders; preserve immutable requested/applied distinction. |
| `src/ui/result-summary.ts:83`, `:89` | Animation labels and lowercase animation nouns are related but not interchangeable translation keys. |
| `src/ui/trim.ts:20`, `:36`, `:62` | Display format, parser and instructions are coupled to ASCII colon/decimal point. Decide accepted input forms separately from display locale; retain exact examples appropriate to the keyboard. |
| `src/ui/format.ts:15`, `:45`, `:62` | Manual duration plurals, approximate quantities and byte units need locale-aware formatting. `{1} bytes` is also an existing English edge case. |
| `src/ui/source-panel.ts:187` | `toLocaleString('en-GB')` is explicitly fixed; it will not follow the chosen UI language. |
| `src/ui/failure-text.ts:97` | `what + original-safe + next` is a useful semantic structure, but sentence ordering and punctuation must be locale-owned. |
| `src/main.ts:1700`, `:1702` | New lock messages must enter the translation inventory; they are not in static HTML. |
| `index.html:435`; `src/main.ts:2368`, `:2379`, `:2395`; `src/ui/feedback.ts:246` | Button/disclosure names are quoted inside other messages. Shortening them now helps, but later translations must reference the actual localized action name consistently. |
| `src/ui/feedback.ts:114` | Decide deliberately which diagnostics remain English under VH-105’s support convention. Translate surrounding explanation, not raw codes opportunistically. |
| `src/main.ts:367`; `src/ui/feedback.ts:43` | “development”, browser/platform fallbacks and version presentation are additional non-HTML text. |
| `src/ui/drop-zone.ts:76`, `:81` | Positional references “above” are both layout-sensitive and harder to translate robustly. Prefer naming the relevant instruction/control. |
| `index.html:192`, `:210`, `:279`, `:286`; `test/screen-text.test.ts:157` | Fixed English names currently have exact pins. Preserve canonical semantics while making locale-specific visible text and accessible names agree. |
| `src/styles/tokens.carbon.css:51`; `src/styles/app.css:858` | CJK needs the planned 40-glyph measure; Malay expansion stresses non-wrapping segments, onset select and action rows. The current 70ch measure does not settle either language’s layout. |
| `test/readability.test.ts:21`, `:43` | English readability scoring cannot certify Chinese or Malay. Keep English checks scoped to English and use the language-specific/native-review acceptance required by VH-105. `pm_skills/project/backlog.md:147`. |

The most valuable preparation for VH-105 is to settle complete English messages now, retain named semantic placeholders, and avoid further prose assembled from independently translated fragments. No translation, visual sign-off or accessibility pass is claimed by this source audit.
