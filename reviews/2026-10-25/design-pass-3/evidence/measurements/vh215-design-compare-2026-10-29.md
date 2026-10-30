<!-- markdownlint-disable -->

# VH-215 — the design compare, Claude's reading against Codex astra's blind design check, 29 October 2026

- Claude's reading, `vh215-claude-design.md`, saved 2026-10-29T00:38:50Z (sha1 `2f61b098bf86efdec682c71ead2368bd5811edb6`).
- Codex astra's blind check, `vh215-codex-design.md`, from `vh215-codex-design-brief.md` (sha1 `2555c76abf9c1ebc16c4076200c306549f73df5d`), started 00:36:33Z (PID 17798), written 00:48:57Z, opened 00:49:11Z, after Claude's reading was saved (sha1 `827a2c74ad59d0f75f456d07a9b8bfed1485b18a`). Its verdict, as given: "Verdict: fits the item with the musts above". No `Owner:` line.
- Saved: this compare, 2026-10-29T00:52Z.

## Agreed

- **The route's frame:** the sound's end from pre-flight's existing pass (A); the picture's end by a read of packets, never a whole decode (D); computed in pre-flight, carried in `PreflightSummary`, bound to the current ready verdict, and used by all three consumers on the page: the card's request (`main.ts:3011`), the `#submission-card-filled` line (`:2686`) and the page's fit (`:2629`). §7.1's estimate and line 128's meaning unchanged; calibration, `keptSeconds`, warnings and other callers untouched; no element, control, listener, remux or full decode.
- **The release guard:** needed; compares the card's printed clock time (`formatClockTime`) with the encode's own span before the file is retained or offered; a mismatch disposes of the working output and fails, never offers the file with a warning; the existing `failure.unknown` words; specific words need the owner.
- **A closing on:** "made" is the source span carried, ending at the later decoded track, excluding the card, the closing and the held last picture; the cut MP4 says `0:21` with the closing on and off, as the record line already does.
- **The line's `{running}` value** following the length made is a data correction, not new wording; replacing the sentence or adding "estimated" or a pending phrase would be a word change.
- **S-22:** no walker change; the MP4 cut is covered outside the walk with S-22's recipe; S-23's unchanged `0:20` is not evidence of the correction, and the table says so.
- **The matrix:** 96 cells a side; no before cell from VH-199 (Staff at the ready verdict, other source and instrument); every before cell walked on the base with the qualified walker.
- **The job's time beside VH-199's:** "Not measured — Staff ready verdict only; no job run" in VH-199's column, beside the base and candidate job times; never `setupMs` or `recordMs` relabelled.
- **WCAG and digests:** 1.3.1, 2.4.6, 3.1.5 and 4.1.3 checked as the item names them; house "Fail loudly on data loss" (the guard) and "Streaming everywhere" (the read); nielsen 1.
- **The largest fixture's figures** (probe-5 and probe-6), as given.

## Codex only (adopted)

- **The largest fixture is the 4.55 GB whole file;** the 2.81 GB cut is the additional truncation timing, not a substitute. Adopted (Claude had named both without ranking them).
- **The margin (Codex's point 4):** the card and the guard use the raw span from the tracks' ends, independent of `endedEarly`'s 1 s threshold (29.49 s prints `0:29`, 30 s `0:30`); `endedEarly` and its callers unchanged. Adopted; Claude's reading (the card follows `made ?? kept`, the margin included) is withdrawn. Consequence, recorded: in the margin zone the card can print a second less than the record line's "the whole video (30 seconds)"; the record is not touched.
- **No candidate, no card (point 3):** where no finite span can be established, the Submission job fails before the draw, never falling back to the declared length. Adopted; Claude's fallback to the kept length is withdrawn. (When the job can run at all, a span exists: a track pre-flight cannot read already blocks the job.)
- **The re-check (point 6):** the old span is invalidated at once when the trim changes, the line withdrawn until a current result arrives, the duration-dependent fit settled only then; no stale reply, language repaint or preset change restores old data. Adopted; Claude's "the trim's arithmetic under Checking…" is withdrawn. No element is added; the existing line is hidden and shown again.
- **The tests (point 7):** "read from the output" read literally, in Chrome: the output made, a frame of its opening card decoded, its running time read from those pixels (against reference renders of the expected and the declared time; no OCR dependency); the cut MP4 (`truncated-30s.mp4`'s recipe) whole and trimmed × `best` and `smaller` × closing on and off (eight), a whole-file control, and a keep ending before the damage; Node tests beside it for the reader and the composition, with a sibling helper muxing a packet-only picture track beside PCM. Adopted; Claude's Node-only card tests are widened to this. It runs as a recorded browser proof under the lock.
- **The cut WebM (point 8):** VH-158's named T90 of `a-vp9opus.webm` (10 s, 25 fps, VP9/Opus, known sizes, Duration, end-placed Cues, first 90 % of its bytes), its inspected and surviving extents measured before expectations are set. Adopted; Claude's 30 s, 70 % recipe is withdrawn.
- **S-23's coverage kept:** Submission variants added beside S-23's Staff-ready scenario, never replacing it; the preset and the closing pinned (`#closing-type` `cut` and `none`).
- **The walk reads the burned card,** not the page line as its proxy; where one job serves several colour modes (or widths), the cells link to that one job and say so. Adopted; it cuts the jobs per side from 96 to as few as 12 (2 fixtures × 2 closings × 3 languages).
- **Exposure, not speech:** browser exposure checks recorded apart from screen-reader or native-language checks.

## Claude only

- **Two wish lines at the close:** specific words for the guard's refusal (both agree they need the owner; Claude names the line); and S-22 read as Student submission in VH-203's after-run (Codex sees no need; decided at the close).

## Disagreed

- **The picture's read: B or C.** Claude's reading took B (the index, a bisection and a walk in decode order: 1–42 reads, ≤ 13 ms). Codex's must takes C for every file (one sequential streamed read of the kept picture packets), because B's bisection "needs additional qualification around presentation/decode ordering".
- **Settled design, on the evidence:** C's sequential read wherever the index says the last declared packet's bytes are missing (a cut file), so B's bisection and key-packet walk, Codex's concern, are dropped; and, where the last declared packet arrived (every whole file and every Matroska file), the index's one read that the encode's own `declaredExtent` already makes.
- **Why the whole-file half departs from Codex's must:**
  - the one read equals C and D on both whole files measured, the largest among them (754.68 s, probe-5);
  - C on every file adds a streamed read of every kept picture byte to every check and re-check: 2,880 ms on the largest file (probe-5), against 2 ms. That is for every user, on every trim or output change, and grows with the file. Spec §7.1's last paragraph says the re-check's cost "grows with the kept audio", so making it grow with the kept picture on every file risks changing what §7.1 says, which is a stop;
  - the guard verifies every card against the encode's own span before release, so a whole file the one read misjudged is refused, never released false.
- **Held for the orchestrator's word:** whether this departure is settled by that evidence, or goes to a Codex re-check of the settled design, or to the owner. On a cut file the check does read the kept picture's arrived bytes (1,440 ms on the 2.81 GB cut, probe-6). That file is already warned before Create, and §7.1's estimate arithmetic is unchanged. Claude reads neither as a change to §7.1's estimate or to line 128's meaning.

## Stops

- No misfit: both readings find that the route fits the item's 45k.
- No spec change, no word change, and no walker change beyond the criteria: S-22 is untouched; the cut WebM's fixture, the Submission variants and the reading of the output's card are the walker changes the criteria name.
- **One point is open:** the B/C departure above, for the orchestrator's word.

## Re-check (VH-215 #3)

- **The brief:** `vh215-codex-design-recheck-brief.md`, saved 2026-10-29T01:22:21Z (sha1 `9914ce8b6b3d5d117d0a47bf1bf37342db3827f1`), not blind: the "Disagreed" section above, probe-4 to probe-6 with their conditions, the release guard, and spec §7.1's last paragraph, verbatim, with three questions.
- **Claude's reading** for this re-check is the settled design above, saved 2026-10-29T00:52Z, before the run started; no new reading was written.
- **The run:** Codex astra (`gpt-6-astra`, read-only), started 01:22:35Z (PID 20199, held awake by `caffeinate`, PID 20200), ended ~01:28:06Z. Its answer, `vh215-codex-design-recheck.md` (sha1 `03bc1e5cf99a6202f03e0a7f7f99e6ddb0024521`), was written 01:28:06Z and opened 01:28:18Z. Its log is `vh215-codex-design-recheck.log` (sha1 `33c5559f4617392a55137054f051fb774d8222a6`).
- **Its verdict, as given:** "Verdict: accept". It adds no must ("Must: none added; no change to the settled design"), and no `Owner:` line.

### Point by point

1. **The settled read fits the item; C on every file withdrawn as a must.** Codex's reasons: the settled design removes B's bisection and decode-order walk, which were its concern; the branch is the actual `lastPacketArrived` result, not a container-based assumption; both branches stream (metadata and one packet read, or one sequential pass keeping a scalar end); and "never knowingly false" rests on the guard for either route, since packet arrival is not decode. **Claude agrees.** The branch is `declaredExtent`'s own `lastPacketArrived`: "whole file" and "Matroska" in the settled design name what the evidence showed, never a predicate. The build branches on `lastPacketArrived` alone.
2. **C everywhere would broaden the re-check's routine cost** (4,517,514,152 picture bytes in 2,880 ms against 2 ms, the same 754.68 s) without a measured correctness gain on the whole files. §7.1 does not say "only" kept audio, so Codex finds no formal contradiction, but it would not keep universal C as a necessary, spec-neutral requirement. The missing-tail fallback's cost is measured and within the item's streamed-picture route; neither the estimate arithmetic nor line 128's meaning changes. **Claude agrees.** No spec wish line is owed.
3. **A hypothetical case, not a measured one:** a malformed sample table could leave an earlier packet unreadable while the final packet reads. C would then get the shorter end and the one read would overstate it. The guard refuses a card whose printed time differs, before release; where both print the same, the card states nothing false. **Claude agrees.** The guard stays essential; that is the settled design's must 4.

### Codex's should, adopted

- "retain the already-requested readable-final-packet/shorter-decode guard regression" (its earlier answer, line 25: "a decoder stopping before the last arrived packet"). **Adopted for the build (step 4) as a test:** a regression where the last declared packet arrived but the encode's span is shorter in printed time, so the guard refuses. It verifies the settled design without changing it.

### Outcome

The held point is settled: the picture's read is `declaredExtent`'s one read where `lastPacketArrived` is true, and C's one sequential streamed read where it is false, with the release guard behind both. Nothing goes to the owner, and there is no check-in (b).
