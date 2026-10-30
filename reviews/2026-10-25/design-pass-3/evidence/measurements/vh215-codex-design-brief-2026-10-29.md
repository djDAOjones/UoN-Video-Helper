<!-- markdownlint-disable -->

# VH-215 — Codex astra's blind design check, the brief, 29 October 2026

You are Codex astra, checking VH-215's design read-only and blind, before anything is built. Claude Code is writing its own design reading at the same time; it, and any earlier worker's reading, are deliberately kept from you: don't look for them. Judge from the evidence below and the repository alone. Never write or change any file.

## What you may read

- **This repository** (your working directory), tracked files, and `git` read-only. The base is `7750acb852a81979511ea481e6c2b18dcdda5ee4` (VH-212's commit), HEAD and origin/main; the tree is clean.
- **Outside it, only these, in `/Users/joe/UoN-Video-Helper-side/`:**
  - `vh215-walk/probe-4/`, `vh215-walk/probe-5/` and `vh215-walk/probe-6/`: each one's `conditions.txt` and `results.jsonl` only (the route timings below);
  - `vh215-walk/fix/`: the three probe fixtures and `README.txt` (binary files: read their sizes or headers only, never print them);
  - `plan8-owner-words.md`: lines 275–277 and 345–347 only.
- **Nothing else** in `/Users/joe/UoN-Video-Helper-side/`: no other `vh215-*` file (no brief, hand-over, progress note, design reading or compare), no `vh215-walk/route-probe.mjs` or `probe.sh`, no other item's files. **Never read any folder under `/Users/joe/Library/Application Support/Claude/side-session-notes/`.**
- `samples/` in the repository is read only and large: never open a file in it; its sizes are given below.

## What VH-215 is

Read `project/items/VH-215.md` whole: it is the contract, and every acceptance criterion in it must hold. In short: the Submission card's running time is computed on the page from the trim and the file's index before the job starts, so a cut-short file (its index whole, its data stopping part-way) with no closing draws "30 seconds" on a 21-second video (wish VH-139.5). The item puts the length made on the card, by a route found first and bounded.

Also read: the PLAN-8 entry of 2026-10-27 in `project/decisions.md` (or `project/decisions-2026-10.md`; find it with `grep -n 'PLAN-8'`), Decision and Rationale; `reviews/2026-10-25/design-pass-3/vh211-plan-2026-10-27.md` (row 7: `grep -n '| 7 | VH-215'`; its entry: `grep -n 'VH-215 (VH-139.5)'`; and line 79) and `reviews/2026-10-25/design-pass-3/vh211-codex-critique-2026-10-27.md` (point 2, line 6). The item is sized at 45k of work under VH-211's sizing rule; "a remedy that outgrows it stops, the remainder becoming its own fix item before VH-203".

## The owner's words (verbatim, with their sources)

- His scope, 2026-10-27 14:51:20Z, typed by him in the "Backlog review" chat (`plan8-owner-words.md:275`; also quoted in the PLAN-8 entry's Rationale): "yes to the question mark, and A and B. ensure everything passes UX / design / Accessibility". Group A, in what he was shown (`:277`), holds VH-139.5.
- His latest, 2026-10-28 ~23:07Z, to the coordinating orchestrator (`:345`): "please spawn chats as needed as I'm going to bed - you have permission to proceed as reccomended". It lets the work proceed on recommendations within the standing rules; it widens no stop.
- There is no VH-215-specific owner answer, and none is owed (its `Open question:` is "None."). The plan put no new words to the owner for VH-215.

## The constraints (standing; not for you to relax)

- `project/rules.md`, Always: streaming, not buffering (no step holds the whole file); silent data loss the worst outcome; numbers in `src/config/` or a CSS token; protected paths (`docs/*.md` is changed only by a wish line the owner approves; `test/fixtures/` is generated).
- **Unconditional stops for the owner:** a coverage reduction; **a walker change beyond what the item's criteria name**; a new element, control or checkbox; a `docs/` edit; a protected path; a dependency change; a disagreement the evidence can't settle; a rank 1 problem that blocks the pass.
- **Also stops:** a new or changed user-facing string, in any language (the plan put no words to the owner for VH-215; the page's `#submission-card-filled` line is one such string); a route that changes §7.1's estimate (`docs/01-specification.md:447`) or line 128's meaning (`:128`), which is drafted as a wish line and stops the item; a change to another caller's behaviour the criteria don't name; a route that doesn't fit the item (more than its 45k, a new pre-pass or listener the criteria don't bound, a new element, or anything that breaks streaming).
- The walker changes the criteria name, and the only ones approved: S-23 (a cut-short Matroska file) and the cut WebM VH-158 checked, read as Student submission with a closing on and off, reading the submission card and the job's time.

## The evidence: the route's trace (at the base; re-check each line by `grep -n` before relying on it)

**Where the card's time comes from.**
- `src/main.ts:3005–3016`: the job's card request, `submissionCardText(typedSubmission(), ids, keptDurationSeconds(keptRange, trimDuration), new Date(), wordsLanguage)` (`:3011`), with `keptRange = jobKeptRange`, fixed from the pre-flight reply by `showProcessControls` (`:3284–3292`). `trimDuration` is the inspected duration (`:1836`), the index's. `keptDurationSeconds` (`src/media/kept-range.ts:148–150`) is `range.end − range.start`, or the whole duration.
- `src/ui/title-card-step.ts:306–330` (`submissionCardText`) formats it once, `runningTime: formatClockTime(keptSeconds)` (`src/ui/format.ts:58–64`: whole seconds, rounded); the request carries the formatted string to the worker.
- The page's line under the fields, `#submission-card-filled` (`index.html:418`), uses the same arithmetic live: `paintSubmissionFilled`, `formatClockTime(keptSecondsNow())` (`src/main.ts:2685–2690`; `keptSecondsNow` `:2572–2575`); its en-GB words `src/i18n/en-GB.ts:291–293`. The page's own fit of the card also calls `keptSecondsNow()` (`src/main.ts:2629`).
- The worker draws the card once, before anything is written: `handleProcess`, `src/workers/job.worker.ts:240–242`, then `runPipeline` (`:245–259`).

**Where each track's real end is known today.**
- The sound: pre-flight (`handlePreflight` in `src/workers/job.worker.ts`; `runPreflight`, `src/main.ts:1560`ff.), a separate worker request before Create, re-run on every trim change (spec §7.1's last paragraph), decodes the whole kept sound (`analyseSourceAudio`, `job.worker.ts:534`) and has its `decodedEndSeconds` (`:550`); `shortfall` gives the `ends-early` warning (`src/audio/warnings.ts`). Matroska: `matroskaCutShort` (`job.worker.ts:519`; `src/media/matroska-cut.ts`) reads a few bytes at each end (the `cut-short` warning). Neither reaches the job's request; the pre-flight summary (`PreflightSummary`, `src/media/preflight.ts:140`) carries no made length.
- The picture: only in the encode's picture lane, `pictureEndSeconds` (`src/media/pipeline.ts:553`, set per decoded frame at `:646`, clamped to the kept end), after the card has been drawn and encoded first. `endedEarly(...)` (`pipeline.ts:840–843`; `src/media/ends-early.ts:146–169`) gives `made`, from the later of the two tracks' decoded ends, or `null` when the declared end exceeds it by no more than `ENDS_EARLY_MARGIN_SECONDS` (1 s, `src/config/thresholds.ts:99`); it returns as `result.endedEarly`.
- After the job the page uses `made`: the record line, `jobSummaryText(record, outcome.endedEarly?.made ?? null)` (`src/main.ts:3364`; `src/ui/result-summary.ts`), and the ends-early sentences (`endedEarlyText`); with a closing, the picture holds its last frame from where it stopped until the closing (en-GB `result.endedEarly.held`).
- An index fact: `declaredExtent` (`ends-early.ts:95–118`) reads the last declared packet; for an MP4 cut short, Mediabunny answers a read of a packet whose bytes are missing with `null` (`lastPacketArrived` false). A Matroska cut has no such index: Mediabunny lists only the clusters it can read.
- The card is the output's first frames, encoded before the content; Mediabunny's muxer refuses a timestamp smaller than the previous GOP's largest (`node_modules/mediabunny/dist/modules/src/muxer.js:36–40`).
- The failure words that exist: `src/i18n/en-GB.ts`, `failure` (`grep -n '  failure: {'`), among them `unknown` ("Something went wrong while creating the video.") and the typed `JobFailureError` codes (`grep -rn 'new JobFailureError(' src`).
- The tests: Vitest runs in Node; `src/media/ends-early.test.ts` reads real in-memory MP4s built by `test/helpers/pcm-mp4.ts` (sound-only PCM; `cutShort` at `:77`), and says the picture's half "runs only in a browser, where its decoder is". `test/helpers/pcm-mkv.ts` builds Matroska. `src/ui/title-card-step.test.ts` (around `:365–415`) tests the card's text.

## The evidence: the route's timings (probes, read-only; you may read their `conditions.txt` and `results.jsonl`)

Every probe ran under the walk lock, on AC at 100 %, power mode 2, at the base with a clean tree, on the page's main thread in headless Chrome through the app's own modules (`inspectFile`, `analyseSourceAudio`, `declaredExtent`, `matroskaCutShort`) and Mediabunny's sinks. probe-1 to probe-3 were set aside for the probe's own faults (a second Mediabunny instance; a regex in a template literal); their results are not used.

The four routes timed:
- **A**, the sound's end: pre-flight's existing analysis pass.
- **B**, the picture's end from the index: `declaredExtent`, then a bisection on presentation time over packet reads (a read returns `null` past the cut), then a walk in decode order from the found packet's key packet to the first missing one.
- **C**, a streamed read of every video packet's bytes, no decode.
- **D**, a streamed decode of the whole picture track.

**probe-4** (2026-10-29 00:00Z, load1 5.09), the walker's fixtures (made by `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/fixtures.sh`'s recipes; copies in `vh215-walk/fix/`):

| file | declared | A | B | C | D |
| --- | --- | --- | --- | --- | --- |
| `cut-short-30s.mkv` (S-23's; `fixtures.sh:48–52`, a 30 s MKV cut to 70 % of its bytes) | 20 | 19.925, 164 ms | 20, 1 read, 4 ms | 20, 500 packets, 4 ms | 20, 500 frames, 179 ms |
| `truncated-30s.mp4` (S-22's; `fixtures.sh:39–41`, a 30 s MP4 cut to 70 %) | 30 | 20.843, 162 ms | 20.96, 42 reads, 3 ms | 20.96, 523, 3 ms | 20.96, 523, 134 ms |
| `lecture-30s.mp4` (whole) | 30 | 30.016, 224 ms | 30, 1 read, 1 ms | 30, 750, 4 ms | 30, 750, 197 ms |

For `cut-short-30s.mkv`, `inspectFile` gives a duration of 20 and `matroskaCutShort` is true.

**probe-5** (00:00:58Z, load1 4.40–5.89 in its log), the two largest files in `samples/`:

| file | declared | A | B | C | D |
| --- | --- | --- | --- | --- | --- |
| the largest, "Menopause Testimonials 4a - Audio.mp4", 4,547,962,918 B, 3840×2160 at 25 fps, 754.7 s, 18,867 frames, its `moov` at the end (so a byte-cut copy has no index and is unreadable): timed whole | 754.687 | 754.687, 2,527 ms | 754.68, 1 read, 2 ms | 754.68, 18,867 packets, 4,517,514,152 B, 2,880 ms | 754.68, 18,867 frames, 37,290 ms |
| the second, "07 What the religion and worldviews approach is not v2.mp4", 4,035,472,901 B, 3840×2160 at 25 fps, 524.56 s, `moov` at the start: its first 70 % of bytes by `Blob.slice` in the page (no copy; `samples/` untouched), a 2.81 GB cut MP4 | 524.587 | 354.816, 1,458 ms | 355.08, 34 reads, 9 ms | 355.08, 8,877, 1,714 ms | 355.08, 8,877, 22,859 ms (load1 10.79 at its end, so re-run) |

**probe-6** (00:03:04Z, load1 6.49–7.83, below 8 throughout), the 2.81 GB cut re-run: identical answers (A 354.816; B, C and D 355.08); A 1,618 ms; B 13 ms, 34 reads; C 1,440 ms; D 23,472 ms.

## The walker and VH-199's records (facts)

- The pass's walker is `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/` (`scenarios.mjs`, `matrix.mjs`, `fixtures.sh`, `fixtures-8.sh`). S-23 (`grep -n "'S-23': {" scenarios.mjs`) is Staff at the ready verdict, focus on Create, fixture `cut-short-30s.mkv`. S-22 ("File ends early (MP4)", `truncated-30s.mp4`) is likewise Staff at the ready verdict; S-64 also reads that fixture. The submission scenarios (S-40 to S-42 and the ID ones) use `lecture-60s.mp4` and `submissionFill`. The closing's select is `#closing-type` (`index.html:441–446`; `none` is "No closing graphics"); the outputs are the `preset` radios `best` and `smaller` (`index.html:546`, `:553`).
- **The walker has no cut WebM at the base** (`fixtures-8.sh` makes a whole `noduration-10s.webm` for S-104). VH-158's cut WebM: its decision (`grep -n '^## 2026-10-22 — VH-158' project/decisions-2026-10.md`), its research's fixture table and cut copies (`reviews/2026-10-22/vh158-matroska-cut-research.md:45–72`), and its commit `d17a46e`.
- **VH-199's records** stay outside the repository, as `reviews/2026-10-25/design-pass-3/evidence/measurements/matrix-2026-10-27.md` says (line 5; its run directories at lines 20–31). Their condition: source `a3039c3`, instrument revision `2e7b0c044ce11f2b`, run-01 on battery in Low Power. S-23 appears in 12 records only (run-02 and run-05: en-GB, zh-Hans and ms-MY, in light, at 1280, 320 and 375 px and the spacing mode at 320 px; no dark or forced mode), each Staff at the ready verdict, with no job and no submission card; each record's `timing` holds only `setupMs`, `recordMs` and `firstOfGroup`. No VH-199 record holds a job's time.
- VH-203's stage rule for VH-215 (the item's criteria): S-23 and the cut WebM, as Student submission with a closing on and off, the submission card at 1280 and 320 px, in en-GB, zh-Hans and ms-MY, in light, dark, forced light and forced dark — 2 × 2 × 2 × 3 × 4 = 96 cells a side, before and after; "the job's time beside VH-199's for the same scenarios"; the before from VH-199's records where the condition matches, every other before cell measured on the base before the change.

## The S-23 and S-22 fact

S-23's Matroska cut is read by Mediabunny only as far as its clusters go: `inspectFile` gives a duration of 20, and routes A to D give 20 (the sound 19.925). The cut WebM is Matroska too; nobody has measured it. The MP4 cut, S-22's `truncated-30s.mp4`, is declared 30 and made 20.96. Reading S-22 in the walk as Student submission is not among the walker changes the criteria name.

## The questions (answer each, with file:line evidence)

1. **The largest fixture.** Which of the timed files is the item's "largest fixture" ("The build says which route and why, timed on the largest fixture"), and why.
2. **The route.** Which route, or combination, gives the length made before the card is drawn, and where it is computed (in pre-flight, carried to the page with the ready verdict; in the job before the draw; or elsewhere). Does it keep streaming (no step holds the whole file)? Does it fit the item: its 45k; no new element, control, listener or pre-pass the criteria don't bound; §7.1's estimate and line 128's meaning unchanged? Name exactly the change, and nothing else.
3. **Never knowingly false.** What the card states when the length made can't be known before it is drawn. What happens after the encode if the encode's own `made` and the card's time differ in the whole seconds the card prints: is a guard needed, and what may it do without a new or changed string? Are there cases (rounding at half a second, the sound range on frame edges, a decode that stops before the last arrived packet) where the card and the encode could part?
4. **The margin.** `endedEarly` gives `made` as `null` when the shortfall is within 1 s. What does the card state then, and is that "known to differ"?
5. **A closing on.** With a closing, the picture holds its last frame from where it stopped until the closing. What is "the length made, without the card or the closing" then, and does the card's time differ with the closing on and off?
6. **The `#submission-card-filled` line** (and the page's fit of the card, `main.ts:2629`). Can it disagree with the card under the route? Does its `{running}` value following the length made count as a new or changed user-facing string, its words unchanged? What does it show while a re-check after a trim change is still running?
7. **The tests.** How is "A cut-short fixture's card read from the output: trimmed and whole, both outputs, a closing on and off; a whole file's card unchanged" met, given Vitest runs in Node without a video decoder? What can "read from the output" mean in a unit or integration test here, and what helper change (never `test/fixtures/`) would it need?
8. **The cut WebM.** How its fixture is made (which VH-158 layout and cut, by a recipe like `fixtures.sh`'s cut MKV), and the scenario that reads it, as Student submission with a closing on and off. Is that within the walker changes the criteria name?
9. **S-22.** Is S-22 needed? Constraint: a walker change beyond the criteria is an unconditional stop for the owner, and the owner is asleep. Can the "Tests" criterion be met with S-22's fixture (its recipe, `fixtures.sh:39–41`, or `cutShort`) in the unit or integration tests, with no walker change, while staying honest about where the defect shows?
10. **The matrix.** The 96 cells a side: what each reads (the page's card line, the output's card, the job's time), and where each before cell comes from (VH-199's records only where the condition matches: commit, instrument revision, power mode; else a walk on the base).
11. **The job's time beside VH-199's.** VH-199 holds S-23 at the ready verdict only, with no job time. How should the table state "the job's time beside VH-199's for the same scenarios"?
12. **WCAG and the digests.** For what the change touches: 1.3.1, 2.4.6, 3.1.5 and 4.1.3 (`project/digests/wcag-2.2-aaa.md` names none of them by number; `UI-STANDARDS.md` "System status", "Perceivable", "Understandable", "Robust"); house-conventions' "Fail loudly on data loss" and "Streaming everywhere" (`project/digests/house-conventions.md:57`, `:61`); nielsen 1, "status visible and announced". Anything the design must keep or check?

## Your answer

Number your answers 1 to 12. For each: your answer, its evidence (file:line), and whether it is a **must** (the design fails the item without it), a **should** or a **note**. Then a list of the musts. Then one last line, exactly one of: `Verdict: fits the item`, `Verdict: fits the item with the musts above`, or `Verdict: does not fit the item — <why, in one line>`; and, if any answer needs the owner (a walker change beyond the criteria, a spec change, a word change), say so on its own line beginning `Owner:`.
