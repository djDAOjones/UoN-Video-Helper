<!-- markdownlint-disable -->

# VH-215 — Claude's design reading, 29 October 2026

Written by VH-215 #2 while Codex astra's blind design check ran, before its answer was opened. Base `7750acb852a81979511ea481e6c2b18dcdda5ee4`. The route's trace and timings are VH-215 #1's (probe-4 to probe-6, AC, power mode 2, load below 8 for every figure used); nothing here re-traces or re-times them.

## 1. The largest fixture

Two files answer "timed on the largest fixture", and the table gives both:

- **The largest file**, "Menopause Testimonials 4a - Audio.mp4" (4.55 GB, 3840×2160, 754.7 s), timed whole: its `moov` is at the end, so no byte-cut copy of it is readable, and only the whole-file path can be timed on it. Route B: 1 read, 2 ms (A 2,527 ms; C 2,880 ms; D 37,290 ms).
- **The largest cut-short fixture**, the first 70 % of the second-largest file (a 2.81 GB cut MP4 declared 524.6 s, made 355.08 s), the case the route serves: B 34 reads, 13 ms (probe-6, load below 8; A 1,618 ms; C 1,440 ms; D 23,472 ms), answers identical to probe-5's.

The walker's fixtures are kilobytes to megabytes and say nothing about cost; they say the route is right (B equals D on all five files).

## 2. The route

**The sound's end from pre-flight's existing pass (A); the picture's end from the index (B); both joined in pre-flight by the encode's own `endedEarly`, and the made range carried to the page with the ready verdict.**

- B reads the index and at most a few dozen packets (bisection over presentation time, a read past the cut returning `null`, then a walk in decode order from the key packet to the first missing packet); it never reads or holds the file, so it keeps streaming. It gives exactly the decode's picture end on every file measured. C (every video byte, 1.4–2.9 s) and D (a second whole decode, 23–37 s, a new pre-pass) cost far more for the same answer.
- A is already paid: pre-flight decodes the whole kept sound before Create, and re-runs on every trim change and output change (spec §7.1's last paragraph), so its made range always belongs to the range and preset the job will use.
- The card cannot be drawn "once both are known" inside the one encode: it is the output's first frames, and the muxer refuses an earlier timestamp after a later GOP (`muxer.js:36–40`).

**The change, and nothing else:**

1. `src/media/ends-early.ts`: one function, the picture's arrived end in the part kept (route B), clamped to the kept range's end as the encode clamps its frames (`pipeline.ts:645–646`); a whole track answers from `declaredExtent` with its one read.
2. `src/workers/job.worker.ts`, `handlePreflight`: after the sound's analysis, the picture's arrived end by B, then `endedEarly` exactly as `pipeline.ts:840–843` calls it (each track's `declaredExtent` over the kept range, the sound's `decodedEndSeconds` from the pass already run), and its `made` (a range or `null`) into the summary. `src/media/preflight.ts`: `PreflightSummary` gains that one field.
3. `src/main.ts`: the pre-flight reply's made range kept beside `jobKeptRange` (`showProcessControls`), set and cleared where it is; the card's running time `made ?? kept` (`:3011`), and `keptSecondsNow()` the same while the trim is the one checked, so the `#submission-card-filled` line (`:2686`) and the page's fit of the card (`:2629`) say what the card will say.
4. The guard (section 3): the submission card's request carries the seconds its time was formatted from; after `runPipeline`, if the encode's own `made ?? kept` formats to a different clock time, the job throws and the file is never released.

No element, control, checkbox, listener or string; one page variable, bounded as above; no CSS. §7.1's estimate is untouched (the probe and the estimate keep the kept length, as today); line 128's meaning is unchanged ("the part kept after trimming, without the card or the closing" is, for a cut-short file, what is made, as the item's intent says). **It fits the item:** five source files touched in a few dozen lines, the tests and the walker changes beside them, inside the 45k sizing.

## 3. Never knowingly false

- **Before the draw**, the card states `made ?? kept`, from the same function, the same declared extents and the same decoded sound end as the encode's record line (`jobSummaryText(record, made ?? null)`), with the picture's end from the index, which equals the decode's on every file measured. When pre-flight can't say (a track it cannot read; no sound to decode), `made` is `null` and the card keeps the kept length, as the record does.
- **After the encode**, a card known to differ is never released: a guard compares the clock time the card printed with the clock time of the encode's `made ?? kept`. It can only part where the decode stops before the last arrived packet without failing, or where sub-frame differences cross a half-second rounding edge. On a mismatch the job fails before anything is offered, with the existing `failure.unknown` words ("Something went wrong while creating the video." and "Your original file has not been changed."), a `log.warn` with the two clock times (numbers only), and the existing clean-up of the job's working files. No new string; the existing failure is honest but not specific, so **specific words for that refusal are a wish line for the owner** (rule 5), never written now.
- **The margin.** `endedEarly` gives `made` as `null` when the shortfall is within 1 s (`ENDS_EARLY_MARGIN_SECONDS`): by the app's own rule that file is whole, and the warnings and the record say so. The card follows the same rule, so the card, the record and the warnings never disagree. I do not read that as "known to differ"; it is a judgement, held for the compare.
- **A closing on.** With a closing, the picture holds its last frame from where it stopped until the closing. The held frame is not part of the source kept, so "the length made, without the card or the closing" is still `made`; the card's time is the same with the closing on and off, as the record line's is today.

## 4. The `#submission-card-filled` line

Its words are unchanged; only the `{running}` value it already fills follows the made length once the trim has been checked, so the line never says something different from the card at Create. I read that as no new or changed string: the value is computed, as it already is on every trim change. While a re-check after a trim change runs, the line shows the trim's arithmetic, as today, under "Checking…"; Create is not offered until the check settles, and then the line, the fit and the card agree. If the compare reads the value change as a changed string, that is a stop for the owner.

## 5. The tests

Vitest runs in Node with no video decoder, but route B needs none: it reads the index and packets.

- **A test helper** builds an MP4 with an encoded picture track (opaque packets, key packets at a fixed interval) and the existing PCM sound track, beside `test/helpers/pcm-mp4.ts`; `cutShort` cuts it as `fixtures.sh:39–41` cuts S-22's file. `test/fixtures/` is never touched.
- **B on it**, against the cut: the arrived picture end equals what a decode in decode order can reach; a whole file gives its declared end in one read; a trim ending before the cut gives the trim's end; a trim ending past it, the cut.
- **The card's time** (`submissionCardText` with pre-flight's `made ?? kept`): the cut-short file trimmed and whole gives the length made; a whole file's card unchanged; both outputs (`best` and `smaller`) give the same time, since the made range is the source's, not the output's; a closing on and off gives the same time.
- **"Read from the output"** in the browser is the after walk's (section 6): the time the job's card request carries, against the made range the job returns, in every cell.
- **The guard**: a request whose card time differs from the made range fails with `unknown` and releases nothing.

No test deleted or skipped.

## 6. The walker, S-22 and the matrix

- **The walker changes the criteria name, declared and proved before any after-read:** (a) the cut WebM: a 30 s VP9/Opus WebM made as `fixtures.sh` makes S-23's MKV, cut to 70 % of its bytes so its Segment runs past the end (VH-158's "said" case), as `cut-short-30s.webm`; (b) S-23 and the cut WebM read as Student submission (`submissionFill`), with `#closing-type` on (the default closing) and `none`, each running the job; (c) each cell reads the page's `#submission-card-filled` line, the time the job's card request carries, the job's made range from its result, and the job's time (Create to the result). Each is proved on the base before the before walk.
- **S-22 is not needed** to meet the criteria. The defect shows on an MP4 cut, which the walk's Matroska fixtures don't exercise; the tests cover it with S-22's recipe made in memory. The table says so plainly, and that S-23 (and the cut WebM, if so) shows no before/after change in the card's time, since Mediabunny reads a Matroska cut only as far as its clusters. A walk of S-22 as Student submission is beyond the criteria: a wish line for the owner, for VH-203's after-run, and no stop now.
- **The matrix:** 2 fixtures × closing on and off × 1280 and 320 px × en-GB, zh-Hans and ms-MY × light, dark, forced light and forced dark = 96 cells a side. **No before cell comes from VH-199:** its S-23 records are Staff at the ready verdict, light only, with no submission card and no job, at source `a3039c3` and instrument `2e7b0c044ce11f2b`; none matches. Every before cell is walked on the base (a `git archive` export with the candidate walker overlaid).
- **The job's time beside VH-199's:** VH-199 recorded no job's time for these scenarios (only `setupMs` and `recordMs` at the ready verdict). The table gives the before and after job times per cell, and beside them "VH-199: none recorded", with the reason, never a figure from another scenario.

## 7. WCAG and the digest rules

- **1.3.1:** no structure changes; the card's fields and the line keep their elements and relationships. **2.4.6:** no heading or label changes. **3.1.5:** no new words. **4.1.3:** the line is not a status message and is not announced, as today; the check's own status is announced as today; the guard's failure is announced as every failure is.
- **Named at close:** house-conventions, "Fail loudly on data loss" (the card never known to differ; the guard) and "Streaming everywhere" (B reads packets, never the file); nielsen 1, "status visible and announced" (the card and the line state what is made).
- **Tokens and documents:** no CSS, so no token change; the progress bar kept; no UI-STANDARDS rule changes; no `docs/` edit.

## 8. For the owner

Nothing blocks the build. Two wish lines are owed at the close: specific words for the guard's refusal, and S-22 read as Student submission in VH-203's after-run.
