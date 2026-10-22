# VH-158 research — can a cut-short MKV / WebM be told apart?

Date: 2026-10-22. Read-only on the repo. Everything made lives in
`/private/tmp/claude-501/-Users-joe-Library-CloudStorage-OneDrive-TheUniversityofNottingham--Joe-Bell-UoN-Files-2-Projects-2026-08-24-UoN-Video-Helper/e8bdbd9c-e6ad-43ba-99b5-0f3efb8de672/scratchpad/vh158/`
(scripts `make-fixtures.sh`, `mr-like.mjs`, `boundary-cuts.mjs`, `ebml.mjs`, `analyse.mjs`, `table.mjs`;
fixtures in `fx/` and `fx-chrome/`; raw output `results.json`, `chrome.json`, `branding.json`).
mediabunny 1.55.2 (the repo's `node_modules`), ffmpeg 9.0.2, Node 24.21, Chrome 152 (built-in browser pane).

## 1. How VH-139 detects "ends early" today, and why it is blind to Matroska

- `src/media/ends-early.ts:95-112` `declaredExtent()` takes the track's `computeDuration()` as the declared end,
  looks up the last packet with `metadataOnly`, then asks for that packet's bytes: `lastPacketArrived`.
  An MP4's `moov` index declares packets the file no longer holds, so the bytes read comes back `null`.
- `shortfall()` / `endedEarly()` (same file) compare that with where the decode really stopped.
  Wired in at `src/workers/job.worker.ts:523-537` (pre-flight sound → `detectSourceWarnings` →
  `ends-early` warning, `src/audio/warnings.ts:80`, painted by `src/ui/warning-text.ts:57-66`, heading
  "The file ends early", `src/i18n/en-GB.ts:645-649`) and `src/media/pipeline.ts:817-819` (the encode's
  picture + sound → `outcome.endedEarly` → `src/main.ts:3211-3220`, `result-summary.ts` `endedEarlyText`).
- **Measured: on every truncated MKV/WebM fixture, `lastPacketArrived` is `true` and the decode reaches
  `computeDuration()`, so VH-139 never fires for Matroska.** mediabunny builds the Matroska packet list from the
  clusters it can actually read; there is no up-front index of packets, so nothing is "declared but missing".
  `computeDuration()` itself shrinks to the truncated length, and the source panel then reports the short length
  as the file's length.

## 2. What mediabunny does with a cut-short Matroska file (source read)

`node_modules/mediabunny/src/matroska/matroska-demuxer.ts`, `src/reader.ts`, `src/matroska/ebml.ts`:

- It never throws on a short file (0 errors over 52 fixtures). `Reader.requestSlice` returns `null` for any range
  that runs past the file's size (`reader.ts:38`).
- `readCluster` (`matroska-demuxer.ts:605-737`) requests the whole cluster in one slice; when the cluster's declared
  (or, for unknown size, searched) end is past EOF the slice is `null` and **the whole last cluster is silently
  dropped**, including the complete blocks inside it. Measured loss: 0.4–0.9 s on 1 s clusters, 2.9 s on a Chrome
  single-blob recording (T99-e2: walk reaches 9.83 s, mediabunny 6.89 s).
- Segment size: kept internally as `segment.elementEndPos` (`null` for unknown size, `readSegment` 403-430). Not public.
- `Info/Duration`: exposed publicly as `track.getDurationFromMetadata()` / `input.getDurationFromMetadata()`
  (`getDurationFromMetadata`, 2011-2021: Duration + first packet timestamp; `null` when Duration absent).
- Cues / SeekHead: parsed internally, not exposed. A cue pointing past EOF is handled ("the cue point lied",
  2435-2443) by falling back to earlier cues — harmless.
- Size VINTs: only the 1-byte `0xFF` and the 8-byte `0x01FFFFFFFFFFFFFF` are treated as unknown
  (`ebml.ts:603-622`). Chrome writes the 8-byte form (verified below).

## 3. Fixtures

Intact (10 s, 25 fps testsrc2 + 440 Hz sine, unless noted):

| name | what |
| --- | --- |
| a-vp9opus.webm | VP9/Opus WebM, known sizes, SeekHead, Duration, Cues at the end |
| a2-vp9opus-cuesfront.webm | same, `-cues_to_front 1` |
| b-h264aac.mkv | H.264/AAC MKV, Cues at the end |
| b2-h264aac-reserved.mkv | same, `-reserve_index_space 8192` (Cues at the front) |
| c0-pipe.webm | ffmpeg to a pipe: **unknown Segment size**, known Cluster sizes, no Cues, Duration present |
| c1-live.webm | ffmpeg `-live 1`: unknown Segment size, known Cluster sizes, no Cues, **no Duration** |
| c-mrlike.webm | c0 rewritten (`mr-like.mjs`) to Chrome's layout: 8-byte unknown Segment AND Cluster sizes, no SeekHead/Cues/Duration |
| e-chrome-ts1000.webm | **real Chrome 152 MediaRecorder**, `start(1000)` timeslice, canvas + oscillator, 10 s |
| e2-chrome-single.webm | real Chrome 152 MediaRecorder, no timeslice (one blob) |
| d-crashed.mkv / d2-crashed.webm | ffmpeg recording in real time (`-re -flush_packets 1`), `kill -9` after 6.3 s (a crashed recorder) |
| public/branding/*.webm | the repo's own 8 closing-onset WebMs (read only), as extra intact controls |

Verified real-Chrome layout: `e-chrome-ts1000` has Segment and every Cluster size `01 ff ff ff ff ff ff ff`,
Info = TimestampScale + MuxingApp + WritingApp only (no Duration), no SeekHead, no Cues — i.e. `c-mrlike` is a
faithful model. **`e2-chrome-single` (no timeslice) is different: known Segment size, Duration and Cues** —
Chrome 152 finalises a single-blob recording. Each timeslice chunk boundary fell **one byte into a SimpleBlock**
(the chunk ends with the block's `A3` ID byte).

ffmpeg's matroska muxer writes an unknown Segment-size placeholder while recording and buffers each cluster whole,
so a killed recording ends exactly on a cluster boundary with no Duration — structurally identical to an intact
live file.

Cut copies: `T50/T90/T99-` = `head -c` at 50/90/99 % (arbitrary byte); `TB-` = exactly at the start of a middle
Cluster; `TK-` = exactly at the start of end-placed Cues (every frame present, only the index lost);
`TL-` = exactly between two blocks inside an unknown-size cluster; `TC-` = the first 6 of 10 Chrome timeslice
chunks concatenated (a tab that died mid-recording, chunks saved so far).

## 4. Signals measured

- **S1** Segment size known and `segmentDataStart + size > file.size`.
- **S2** `Info/Duration` present and `Duration − input.computeDuration() > 1 s` (ENDS_EARLY_MARGIN_SECONDS),
  using mediabunny's public API only.
- **S3a** a CueClusterPosition at/after EOF. **S3b** a SeekHead entry at/after EOF.
- **S4** the last element runs past EOF: a known-size Cluster whose end is past EOF, or (walking an unknown-size
  cluster's children) a block whose end is past EOF, or non-zero bytes at EOF too short to make a whole element
  header (Chrome's chunk cut). Zero padding at EOF is ignored.

Results (FIRE = signal raised; `.` = silent). Full table: `node table.mjs < results.json`.

| fixture | S1 | S2 | S3a | S3b | S4 | true state |
| --- | --- | --- | --- | --- | --- | --- |
| all 19 intact (a, a2, b, b2, c0, c1, c-mrlike, e, e2, d, d2, 8 branding) | . | . | . | . | . | whole |
| T50/T90/T99 of a, b (Cues end) | FIRE | FIRE | . | FIRE | FIRE | cut |
| T50/T90 of a2, b2 (Cues front) | FIRE | FIRE | FIRE | . | FIRE | cut |
| T99 of a2, b2 | FIRE | FIRE | . | . | FIRE | cut |
| T50/T90/T99 of e2 (Chrome single blob) | FIRE | FIRE | . | FIRE | FIRE | cut |
| T50/T90 of c0 (pipe, Duration) | . | FIRE | . | . | FIRE | cut |
| T99 of c0 | . | . (0.45 s gap) | . | . | FIRE | cut |
| T50/T90/T99 of c1, c-mrlike, e (no Duration) | . | . | . | . | FIRE | cut |
| TC-e (Chrome chunks 1–6) | . | . | . | . | FIRE (partial header) | cut |
| TB of a, a2, b, b2, e2 (cluster boundary, known Segment) | FIRE | FIRE | a2/b2 only | a/b/e2 | . | cut |
| TB of c0 | . | FIRE | . | . | . | cut |
| TB of c-mrlike, e; TL of c-mrlike, e | . | . | . | . | . | cut — **undetectable** |
| TK of a, b, e2 (only end Cues lost) | FIRE | . | . | FIRE | . | frames whole, index lost |

## 5. Verdict per signal

| signal | fires on every cut? | silent on every intact (incl. unknown size)? | misses |
| --- | --- | --- | --- |
| S1 Segment size > file | **Yes for every known-size file**, at any cut point including element boundaries | **Yes** (unknown size is never compared) | every unknown-size file: Chrome timeslice MediaRecorder, `-live`, pipes, crashed recorders. Over-fires (content-wise) on TK: only the trailing Cues/Tags lost, every frame present |
| S2 Duration vs computeDuration | when Duration exists and loss > 1 s | Yes on all 19 | no Duration (Chrome timeslice, `-live`); losses under the margin (T99-c0). Theoretical false positive: an intact file whose Duration overstates its last packet by > 1 s (a tool that trimmed without rewriting Info). Must be compared file-wide (`input.*`), never per track: Duration is segment-wide and a track may end early legitimately |
| S3a Cues past EOF | only when Cues are at the front and the cut is before the last indexed cluster | Yes | Cues at the end (lost with the cut), T99, unknown-size files |
| S3b SeekHead past EOF | only when SeekHead lists an element at the end | Yes | Cues at the front, unknown-size files. Subsumed by S1 |
| S4 last element past EOF | **every arbitrary-byte cut, in every family** (21/21 T50-99 + TC) | **Yes** | a cut that lands exactly on an element boundary: TB/TL. For known size S1 covers those; for unknown size they are undetectable (and a crashed ffmpeg/OBS recorder always ends on a cluster boundary) |

## 6. Recommendation

**Reliable: `S1 OR S4`**, computed from the file's own bytes (Blob.slice), no new dependency.
Zero false positives on all 19 intact files; catches 33 of the 38 cut files that lost frames (34 with S2 added:
TB-c0 has Duration). The four left are unknown-size files with no Duration cut exactly on an element boundary
(TB/TL of c-mrlike and real Chrome), for which there is **no reliable signal at all** (nothing in such a file
promises more than it holds). The 3 TK files (only the end index lost) also fire S1; see the next point.

- S1 costs one ~64-byte read at the start (EBML header + Segment header: ID, size VINT, compare with `file.size`).
  It is exact for every file written to a seekable destination (ffmpeg/OBS remux/HandBrake/mkvmerge MKVs, Chrome
  single-blob WebM).
- S4 costs reading the tail: for known-size clusters, hop cluster headers (one small read per cluster); for
  unknown-size clusters, find the last Cluster by scanning a tail window backwards for `1F 43 B6 75` + a size VINT
  (`01 FF FF FF FF FF FF FF` for Chrome) + `E7` (Cluster Timestamp) — a ≥ 13-byte pattern no compressed payload
  plausibly forges — then walk its block headers to EOF. Grow the window (e.g. 4 MB, doubling) when no Cluster is
  found. A walk of every block from the start also works but reads the whole file.
- Avoid the TK false alarm (content whole, only the end index lost): when S1 fires alone, S4 is silent and Duration
  is present, check S2 — if `Duration − computeDuration ≤ margin` every frame is there; say nothing (or a softer
  line). So: **say "shorter than expected" when S4, or when S1 and (S2 or no Duration)**.
- Times for the line: with Duration present, "stops at {computeDuration} of {Duration}" fits VH-139's
  `endsEarly` strings. Without Duration (Chrome timeslice), there is no "of" time — the message can only say the file
  stops part-way through, at `computeDuration`. Note that mediabunny drops the whole partial last cluster, so the
  stop time it gives can be up to one cluster (seconds) earlier than the last bytes present.

**mediabunny-only fallback (no byte parsing): S2** — public `input.getDurationFromMetadata()` vs
`input.computeDuration()`. Catches cut files that carry Duration with > 1 s lost (every known-size fixture,
and the pipe one); silent for every Chrome-timeslice / live recording, cut or not. Not enough alone for
MediaRecorder WebMs. S1 needs the Segment size, which mediabunny keeps private (`segment.elementEndPos`);
reaching into the demuxer would be fragile, and reading 64 bytes with `file.slice(0, 64).arrayBuffer()` is simpler.

The tables measure the research walk; the shipped module, `src/media/matroska-cut.ts`, reads a tail window instead and was run on the same 60 files with the same verdicts (VH-158).

## 7. Where it would hook in

- File-level, at inspection: `src/media/inspect.ts:201-206` (container known as `format.name` = `Matroska`/`WebM`)
  and the report built at `src/media/inspect.ts:338-341` (`durationSeconds` from `computeDuration` at :271/:324).
  A new field (e.g. `endsEarly: { stopsAtSeconds, endSeconds | null } | null`) computed from `file` + `input` there,
  so the source panel's length is not presented as whole.
- Said where VH-139 says it: the pre-flight warning list — `src/workers/job.worker.ts:523-537` builds `soundShort`
  and passes it to `detectSourceWarnings` (`src/audio/warnings.ts:80`), shown by `src/ui/warning-text.ts:57-66`
  as "The file ends early". A Matroska shortfall can feed the same `ends-early` warning (or a sibling code whose
  detail has no `{end}` when Duration is absent; the current `en-GB.ts:648` detail names audio, so a picture/file
  wording is needed).
- In the result record: `src/media/pipeline.ts:817-819` (`endedEarly` from `declaredExtent`) →
  `outcome.endedEarly` → `src/main.ts:3211-3220`. Do not graft this into `declaredExtent`'s per-track
  `lastPacketArrived`: Matroska's Duration is file-wide, and a per-track compare would flag a sound track that
  legitimately stops early.

## 8. Side findings worth a line

- VH-139 is silent for every cut MKV/WebM today (section 1); the app presents the cut length as the whole length.
- mediabunny discards the complete blocks of a partial last cluster (up to ~3 s measured; up to a cluster's length
  in general, ffmpeg's default is 5 s / 5 MB).
- Chrome 152 MediaRecorder: timeslice recordings are unknown-size with no Duration/Cues; single-blob recordings are
  finalised (known size, Duration, Cues). Timeslice chunks split one byte into a SimpleBlock.
