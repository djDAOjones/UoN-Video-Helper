# Codex astra brief — VH-185, a sliver of late sound in the part kept, 2026-10-24

You are checking one Phase 8 item's candidate diff in this repository, read-only. The base is commit b8a4063. The candidate is the working tree against HEAD: `git diff`, plus new files `src/media/sub-block-sound.test.ts` and `reviews/2026-10-22/design-pass-2/evidence/measurements/walker/sliver-185.mjs`. Do not run the walker or the gate; the gate runs after you and its result goes in the commit.

The item is `project/items/VH-185.md`: read its acceptance criteria in full. VH-139's record (`project/items/VH-139.md`, its 2026-10-21 note) is the case: a 10 s file whose sound starts at 4 s, kept 0:00–0:04, held 22 ms of AAC priming (decoded at 3.979 s); pre-flight let the job start and the output check refused it, "invalid-measurement", after the whole encode. The app stays simple: no new control, element, token or words.

What the candidate does:

- `src/audio/loudness.ts` (protected): `BLOCK_SECONDS` is exported, nothing else changes. The EBU harness (`test/ebu3341/`) runs in the gate.
- `src/media/audio-plan.ts`: `traverse` counts `decodedFrames`, the frames decoded from the source and kept (never gap-fill or flush; the existing `frames` counts those too). `keptTooLittleSound` is true when there is a range and `decodedFrames / sampleRate < BLOCK_SECONDS`; it replaces the old `range && frames === 0` guard in both `analyseSourceAudio` and `planAudio`. Both now return a `KeptSilence` (`{ silent: true, decodedEndSeconds }`) in place of `null`, because the first Chrome run showed that with `null` the ends-early check lost the decode's end: pre-flight said "The file ends early … Its audio stops at 0:00 of 0:04" in place of "This video has no audio", and the finished job would have said the same through `endedEarly`.
- `src/workers/job.worker.ts`: pre-flight treats a `KeptSilence` as no analysis (the no-audio warning, `keptHasSound` false) and passes its `decodedEndSeconds` to `shortfall`.
- `src/media/pipeline.ts`: a `KeptSilence` makes the job silent, as `null` did, and seeds `soundEndSeconds` with its decode end for `endedEarly`.
- `src/spike/*`: the two spikes follow the new return type.
- Untrimmed files are deliberately unchanged ("Untrimmed, unchanged", from an earlier Codex review); the builder records that as out of scope with a wish line.
- What the output carries for the sliver: no audio track at all (the job is silent), as for a part kept with no sound.

Check, giving file:line:

1. Each acceptance criterion: met, or not, and why. Is the block length the meter's own constant, with no second literal? Does a kept sound of exactly 400 ms or more still level (the comparison's edge, float error at 44.1 and 48 kHz)?
2. Every path that used to see `null` from `analyseSourceAudio` or `planAudio`: does each now handle `KeptSilence`, and is any truthiness check (`if (plan)`, `analysis?.x`) left that would now treat a silent keep as sound?
3. A truncated file (data declared in the part kept but nothing decoded) must still be told as ending early, before and after the job; a sliver that decoded whole must not. Is that so on both sides?
4. Does the decode-damage gate's silencing interact with `decodedFrames` (silenced blocks are still decoded frames — is counting them right)?
5. The stage rule: no control, element, token or words added; docs and UI-STANDARDS untouched; `test/ebu3341/` untouched.

Reply with a verdict line first ("Commit", "Commit after the musts below", or "Do not commit"). Then numbered points, each marked must or may, each with file:line. Be brief.
