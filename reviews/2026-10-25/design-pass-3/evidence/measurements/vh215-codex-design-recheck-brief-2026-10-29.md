<!-- markdownlint-disable -->

# VH-215 — Codex astra's re-check of the held design point, the picture's read, the brief, 29 October 2026

You are Codex astra, re-checking one point of VH-215's settled design, read-only, before anything is built. **This check is not blind:** it puts to you the one point on which your blind design check (`vh215-codex-design.md`, your own earlier answer) and Claude's design reading disagreed, as the design compare settled it, with the evidence. Orchestrator #24 ruled that the point goes to you first, and to the owner only if this re-check leaves a disagreement the evidence can't settle. Never write or change any file.

## What you may read

- **This repository** (your working directory), tracked files, and `git` read-only. The base is `7750acb852a81979511ea481e6c2b18dcdda5ee4` (VH-212's commit), HEAD and origin/main. The worker's walker edits under `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/` may be under way while you run: wherever the working tree may differ from the base, read the base's version by `git show 7750acb852a81979511ea481e6c2b18dcdda5ee4:<path>`. Nothing under `src/`, `test/` or `docs/` is being changed.
- **Outside it, only these, in `/Users/joe/UoN-Video-Helper-side/`:**
  - `vh215-design-compare.md` (the design compare: Claude's reading against yours, and the settled design);
  - `vh215-codex-design.md` (your own earlier answer) and `vh215-codex-design-brief.md` (its brief);
  - `vh215-walk/probe-4/`, `vh215-walk/probe-5/` and `vh215-walk/probe-6/`: each one's `conditions.txt` and `results.jsonl` only;
  - `vh215-walk/fix/`: the three probe fixtures and `README.txt` (binary files: read their sizes or headers only, never print them).
- **Nothing else** in `/Users/joe/UoN-Video-Helper-side/`: no other `vh215-*` file (no brief, hand-over, progress note or Claude's design reading), no `vh215-walk/route-probe.mjs` or `probe.sh`, no other item's files. **Never read any folder under `/Users/joe/Library/Application Support/Claude/side-session-notes/`.**
- `samples/` in the repository is read only and large: never open a file in it.

## The item and its criteria

`project/items/VH-215.md` (wish VH-139.5): the submission card gives the length the new video has, not the length the file's index declares; a cut-short MP4 with no closing draws "30 seconds" on a 21-second video today. Read the item whole; the criteria that bear on this point:

- **"The route found first, and bounded."** The picture's real end known before the card is drawn "without holding the whole file (rules: streaming, not buffering)": "the sound's from pre-flight's pass, the picture's by a streamed read or decode, or the card drawn once both are known."
- **"Never knowingly false."** "The card states the length made, without the card or the closing; a card known to differ from what is made is never released, with or without a warning."
- **"No spec change expected."** "If the route changes the probe's estimate (§7.1) or line 128's meaning, it is drafted as a wish line for the owner and the item stops there."

`project/rules.md`, Always: "Streaming, not buffering: no step holds the whole file".

## The routes, as VH-215 #1 measured them

- **A** — the sound's end, from pre-flight's existing analysis pass (`analyseSourceAudio`, already paid).
- **B** — the picture's end from the index: `declaredExtent` (`src/media/ends-early.ts`) looks up the last declared packet in the kept part and asks whether its bytes arrived (one metadata read plus one packet read); where they didn't, a bisection over packet times and a walk in decode order.
- **C** — one sequential streamed read of the kept picture packets (Mediabunny's `EncodedPacketSink`), keeping only the last arrived packet's end: never holds the file, reads every kept picture byte.
- **D** — a full decode of the picture (a second encode-sized decode).

The encode already calls `declaredExtent` on each track after its decode (`src/media/pipeline.ts`, `:841–842`), and pre-flight on the sound (`src/workers/job.worker.ts`, `:551`).

## The evidence: the timings (VH-215 #1's probes, under the walk lock)

All at the base, porcelain 0, on AC at 100 %, powermode 2, in headless Chrome on the page's main thread through the app's own modules and Mediabunny's sinks. Each probe's `conditions.txt` and `results.jsonl` are yours to read.

- **probe-4** (load1 5.09), the fixtures in `vh215-walk/fix/`: `cut-short-30s.mkv` (S-23's cut Matroska) 20 by B, C and D (sound 19.925); `truncated-30s.mp4` (the MP4 cut) declared 30, A 20.843, B, C and D 20.96 (B in 42 reads, 3 ms); `lecture-30s.mp4` (whole) 30 by every route.
- **probe-5** (start 2026-10-29T00:00:58Z, load1 4.40 at its start, 4.40–5.89 through the whole file's runs, 10.79 at its end), **the largest fixture, whole, 4.55 GB, 3840×2160, 754.7 s, declared 754.687:** A 754.687 in 2,527 ms; **B 754.68 in 1 read, 2 ms; C 754.68, 18,867 packets, 4,517,514,152 bytes, 2,880 ms;** D 754.68, 18,867 frames, 37,290 ms.
- **probe-6** (start 00:03:04Z, load1 6.49–7.83, below 8 throughout), **the 2.81 GB cut MP4 (the first 70 % of a second file, declared 524.587), re-run at low load:** A 354.816 in 1,618 ms; **B 355.08 in 34 reads, 13 ms; C 355.08 in 1,440 ms;** D 355.08 in 23,472 ms. Identical answers to probe-5's run of the same file (whose D ended at load1 10.79).

## The release guard (the settled design's must 4, agreed by both readings)

A card whose printed `formatClockTime` differs from the encode's own raw, unthresholded span is never released: it compares `formatClockTime` of the card's seconds against the encode's span, runs before the file is retained or offered (`finished.retain` and the `processed` reply), disposes of the working output on a mismatch and fails the job with the existing `failure.unknown` words; the file is never offered with a warning. It is Submission only.

## The disagreed point, as the design compare records it (its "Disagreed" section, verbatim)


- **The picture's read: B or C.** Claude's reading took B (the index, a bisection and a walk in decode order: 1–42 reads, ≤ 13 ms). Codex's must takes C for every file (one sequential streamed read of the kept picture packets), because B's bisection "needs additional qualification around presentation/decode ordering".
- **Settled design, on the evidence:** C's sequential read wherever the index says the last declared packet's bytes are missing (a cut file), so B's bisection and key-packet walk, Codex's concern, are dropped; and, where the last declared packet arrived (every whole file and every Matroska file), the index's one read that the encode's own `declaredExtent` already makes.
- **Why the whole-file half departs from Codex's must:**
  - the one read equals C and D on both whole files measured, the largest among them (754.68 s, probe-5);
  - C on every file adds a streamed read of every kept picture byte to every check and re-check: 2,880 ms on the largest file (probe-5), against 2 ms. That is for every user, on every trim or output change, and grows with the file. Spec §7.1's last paragraph says the re-check's cost "grows with the kept audio", so making it grow with the kept picture on every file risks changing what §7.1 says, which is a stop;
  - the guard verifies every card against the encode's own span before release, so a whole file the one read misjudged is refused, never released false.
- **Held for the orchestrator's word:** whether this departure is settled by that evidence, or goes to a Codex re-check of the settled design, or to the owner. On a cut file the check does read the kept picture's arrived bytes (1,440 ms on the 2.81 GB cut, probe-6). That file is already warned before Create, and §7.1's estimate arithmetic is unchanged. Claude reads neither as a change to §7.1's estimate or to line 128's meaning.

## Spec §7.1's last paragraph, verbatim (`docs/01-specification.md`, `:461–466`)

> A change to the trim re-runs the check over the newly kept part, because the
> §5.4 warnings and the sound's presence follow from it. The re-check shows
> progress and can be cancelled like the first. Its cost grows with the kept
> audio; the bound on what it repeats is set from a timing on the longest
> corpus recording, which has not yet been taken — until it is, this sentence
> records the requirement and not the figure.

## The questions

1. Does the settled design's read fit the item and its criteria: **the index's one read** (`declaredExtent`'s, which the encode already makes) wherever the last declared picture packet arrived (every whole file and every Matroska file), **C's one sequential streamed read** wherever the index says the last declared packet's bytes are missing (a cut file; B's bisection and decode-order walk dropped), **and the release guard behind both**? Weigh "never knowingly false", "streaming, not buffering" and "the route found first, and bounded" in particular, and your earlier concern that B's bisection "needs additional qualification around presentation/decode ordering".
2. Would **C on every file**, your earlier must, change what §7.1 says, given its "Its cost grows with the kept audio" and the timings above (2,880 ms on the largest whole file, against 2 ms for the one read, on every check and re-check)?
3. Is there a case the settled design's read gets wrong that C on every file would get right, and if so, does the guard catch it before release?

## Your answer

The first line is exactly `Verdict: accept` or `Verdict: hold` (accept: the settled design's read fits the item, with nothing that would change the settled design). Then your reasons, point by point against the three questions, citing the evidence by file and line. Then any **must** (a change the design needs before the build) or **should**, each on its own line, saying whether it would change the settled design. Add an `Owner:` line only if a disagreement remains that the evidence can't settle.
