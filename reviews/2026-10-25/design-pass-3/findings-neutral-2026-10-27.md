<!-- markdownlint-disable -->
<!-- The neutral sheet Codex astra ranked from blind in VH-201 (2026-10-27), verbatim: the observations of each finding VH-200 drafted, and four other readings, with no rank, verdict, direction, standard or disposition. Saved as vh201-findings-neutral.md in the orchestrator's notes before Codex ran. -->

# Pass 3's draft findings — the observations, for a blind ranking (VH-201)

VH-201 #1, 2026-10-27. For each finding VH-200 drafted, this sheet gives what was seen and the measurements, copied from the run's records and the source. It holds no rank, verdict, direction, standard or disposition: those are for you to make.

**Where the numbers come from.** VH-199's evidence run: 3,207 records and 48 transitions on source `a3039c3`, headless-visible Chrome 156.0.8078.48, served by Vite. The raw records are in `/Users/joe/UoN-Video-Helper-evidence/pass3-vh199/runs/<run>/<key>.json` (a key is `scenario__language__view__mode`; `w320` is a 320 px window; `font32` a 32 px default font; `forced-light` and `forced-dark` the emulated forced palettes). The source in the repository at HEAD, `86b1200`, is `a3039c3`'s but for VH-205's stylesheet (`src/styles/app.css`, `src/styles/tokens.carbon.css`). Focus-ring rows are the walker's: `areaAt3to1` is the ring's pixels at 3:1 or more against the unfocused capture, `perimeter2px` the reference it is compared with, `changedAny` every pixel that changed, `controlPx` the control's box in CSS px. For ordinary controls the walker's reference is the box's `4(w + h) − 16`; for the trim thumbs it is a disc's `4π(r − 1)` (quoted from the walker's `qualify.mjs:760–766`).

## D-05 — a kept part with under 400 ms of decoded sound

- **The rule.** `keptTooLittleSound` (`src/media/audio-plan.ts:115–121`): `return range !== null && traversal.decodedFrames / sampleRate < BLOCK_SECONDS`. `decodedFrames` is "Frames decoded from the source and kept: sound, never gap-fill (VH-185)" (`:103`). `BLOCK_SECONDS` is the loudness meter's 400 ms gating block (`src/audio/loudness.ts`). A silent keep plans no audio and the job writes the video without an audio track (`src/media/audio-plan.ts:347`).
- **The tests.** `src/media/sub-block-sound.test.ts:61–70`: 50 ms of generated PCM sound before a cut at 1.5 s is a silent keep; exactly 400 ms is levelled. `:97–110`: sound from 3.71 s kept to 4.10 s, 390 ms as asked, is a silent keep; placed on the 25 fps frame edge, 410 ms, it is levelled.
- **What the page says.** `src/i18n/en-GB.ts:670–674`: heading "This video has no audio"; detail "There is no audio to level, so the rest of the job runs without it. If you expected audio, check the recording before publishing." Chinese at `src/i18n/zh-Hans.ts:551`, Malay at `src/i18n/ms-MY.ts:590`.
- **What the run read.** S-99, ×31 records (three languages, views and modes): fixture N8a, `late-sound-10s.mp4`, 10 s of picture with AAC sound from 4 s, whose first packet, the encoder's priming, starts at 3.978667 s and lasts 21.3 ms; End time set to `0:04`. Before Create, the status line read "Device check complete. Ready to go. … Worth knowing about the audio: This video has no audio." and the panel showed "This video has no audio" and the detail above (S-99 en-GB w1280 light, run-09, `captures/…__ax.json` nodes 305, 538, 539). S-100, ×6: Create run to the end; the card's record reads 0:00.0 to 0:04.0 kept; the plan count is 0. S-101 (sound from 3.4 s, 0.6 s kept) is levelled with no notice.
- **Not read.** No record walked a kept part of real, audible sound under 400 ms; the output file's tracks were not read.

## D-06 — the heavy-limiting warning and the finished card

- **The words.** `src/i18n/en-GB.ts:719–723`: heading "The loudest moments were held down hard"; detail "To reach the usual level, the tool had to hold down the loudest moments of this recording hard. That can make a voice sound flat or squashed, so play the new video before you save it. Next time, try adjusting how you record the sound."
- **The order in source.** `src/main.ts:3285`: the card gets the player, then the lifetime line; `:3494–3497`: Save in the card's actions row; `:3288` and `:3327`: the warnings' container follows the card, `processResult.replaceChildren(heading, resultWarnings)`. The completion line (`:3073–3078`) includes `warningsSpoken`, which maps each warning to its heading only (`src/ui/announce.ts:40–46`).
- **What the run read.** S-135 en-GB w1280 light (run-04), fixture N6 `clicks-20s`, Create to the end; measured bite 20.13 LU against a threshold of 3. The accessibility tree, in order: region "Finished video — 7.5 MB" → its lines → Video "Finished video — 7.5 MB" → "It is not saved yet. It stays here until you start another video or close this tab." → button "Save the video" → region "Worth knowing about the finished video" → "The loudest moments were held down hard" → its detail. The completion line spoken: "Your video is ready. Worth knowing about the finished video: The loudest moments were held down hard." S-135 to S-138 and S-151 read the warning first among the card's warnings and word for word, before and after a save; a completed save removes the player from the card (S-131 ×6).

## V-46 — focus when an unreadable file follows a readable one

- **What was seen.** S-149, light, w1280, en-GB, zh-Hans and ms-MY (×3, run-04): `lecture-30s.mp4` read; focus placed on a Video language radio (`input[name=video-language]=en-GB`) in step 3, shown; `notvideo.mp4` chosen; the read fails (`unreadable: true`, `trimHidden: true`, `titleHidden: true`). Afterwards `document.activeElement` is `body`, no focus moves recorded. The status: "This browser cannot read the picture or audio inside this file. …".
- **Source.** Both read-failure paths call `clearTrim('unreadable')` (`src/main.ts:1486`, `1500`), which hides the setup steps (`revealLaterSteps({ setup: false, … })`) with no `focusHeldBy` call. The blocking branch calls `focusHeldBy([stopCheckButton, ...stepsWithdrawnBy(shown)], …)` before `revealLaterSteps` (`:1590–1596`). Video language sat outside the steps at `ec26c49` (`index.html:88`, beside Video type); commit `3c20550` moved it into `#step-title`.
- **Not read.** The same transition with a finished video standing (no scenario).

## V-48 — the onset "?" at a 32 px default font

- **What was seen.** `#onset-help-button` (step 4's "?", author-styled), `S-113__ms-MY__w320__font32` (one record): `controlPx` 44 × 76, `areaAt3to1` 460, `perimeter2px` 464, `changedAny` 528, best ratio 14.31. In that record the page scrolls sideways (V-50). There is no reading of this control in this condition before pass 3. The control is `index.html:463–470`, styled by `.help-button` (`src/styles/app.css:1086`).

## V-49 — the "Creators team" link in the forced palettes

- **What was seen.** `#contact-creators` (VH-182's footer group; `index.html:822–843`), ×8: S-83 and S-145, en-GB w320 and ms-MY w1280, forced-light and forced-dark. At w320: `controlPx` 272 × 48, `areaAt3to1` 1,108, `perimeter2px` 1,264. At ms-MY w1280: 448 × 48, 1,595 of 1,968. In these records the link wraps onto two lines inside its `inline-flex` box (`src/styles/app.css:210–215`). The run's reader saw the ring's lower edge cross the next link's text, a system colour in the forced palettes. In light, dark and on one line it reads at or above its reference.

## V-18 — the first action and the first screen

- **What was seen.** The file button's painted top and bottom, taken for VH-199's close on `a3039c3`:
  - 1280 × 900: en-GB 650–694 px, zh-Hans 800–844, ms-MY 890–934;
  - 320 × 568: en-GB 950–994, zh-Hans 1,045–1,089, ms-MY 1,287–1,331.
  Phase 7's after-run (1280 × 900 and 320 × 568) read each of these lower on the page. Above the button: the band, the language switcher, the heading, the lede's five promises with the format "?", and the browser note when a check has not passed (`index.html:26–137`; the file input at `:137`).

## V-50 — the page at a 32 px default font in narrow windows

- **What was seen.** S-113 at `font32`, six records, w320 and w401 in three languages (S-113 sets step 4 at 1280, 640, 401 and 320 px). The page scrolls sideways:
  - en-GB w320 and ms-MY w320: to 520 of 320; offenders the radio `language=ms-MY` "Bahasa Malaysia" [47..337] and the radio `video-kind=submission` "Student submission";
  - en-GB w401: to 520 of 401; offender the radio `closing-colour=white` "White" [304..520];
  - zh-Hans w401: to 444 of 401; offender `closing-colour=white` "白色的" [271..444];
  - zh-Hans w320: to 444 of 320; offenders `language=ms-MY` and `#trim-set-start`;
  - ms-MY w401: to 528 of 401; offenders `#trim-set-start` [97..528] and `#trim-set-end`.
  All other 3,177 of 3,183 page records do not scroll sideways, the 32 px font at 1280 px included. S-113 also records step 4's two selects clipped at 401 px and below.

## Other readings VH-200 also judged

Judge each the same way: a finding or not, and if a finding, its rank.

- **O-1, the output radio at the 32 px font.** `#preset-choice input:checked`, ×10 (S-15 ×3, S-24, S-108 ×3, S-110 ×3, all w1280 font32): `controlPx` 40 × 40, `areaAt3to1` 284, `perimeter2px` 304, `changedAny` 416. The control is a native radio sized by `--control-size` (`src/styles/app.css:798–803`). S-24 en-GB w1280 font32 read at or above its reference in Phase 7's after-run.
- **O-2, the statement's contact link.** `#accessibility-statement a`, S-81 ×11 (en-GB w1280 in every mode but spacing, plus landscape, short height and the 200% proxy; ms-MY w1280 light): `controlPx` 429 × 41, `areaAt3to1` 1,361, `perimeter2px` 1,865, `changedAny` 1,363, best ratio 13.34 (2,644 of 3,754 at the 32 px font). The link is inline and wraps across a line end; the line is "…email the learning content team at UI-Learning-Content@nottingham.ac.uk" (`src/i18n/en-GB.ts:912`). At w375 it also takes two lines and reads at or above its reference (1,278 against 1,215).
- **O-3, the finished player's inner controls.** S-127 ×39, by keys: each control takes focus in turn and the route leaves for Save and back to the output radio. Ring pixels at 3:1 against the reference, e.g. Play 90 of 368, volume 102 of 384, mute 99 of 368; an author `outline: none` on each control's pseudo-element removed part of its ring; the player's background is author-set (`.trim-preview, .result-player { background: var(--uon-brand-bg) }`, `src/styles/app.css:1358–1364`), and the walker read the host's backdrop, not the background behind each ring. Whether a value change reaches assistive technology is not observed (39 rows); the overflow button's ring is drawn by a pseudo-element no author style reaches.
- **O-4, the player under a playback fault.** With fault F15b (playback broken on purpose), S-132 ×6 and S-152 ×6: the host's accessible name reads "Unable to play media." while `aria-labelledby` points at the card's title (`src/main.ts:2882`); the card's warning stands (S-152).

## The rank rule

1: a novice is blocked, misled, or could lose work or trust. 2: real friction, or a breach of a named standard. 3: polish.
