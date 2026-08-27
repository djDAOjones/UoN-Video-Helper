# Trajectory

<!-- Shipped-work narrative. The story of what changed over time, in chunks. -->
<!-- Warm tier. Agents do NOT auto-read this every task. Read it on demand:
     during memory-maintenance.md (Refactor), release.md, or when
     reconstructing what already shipped. See AGENTS.md → "Before every task". -->
<!-- Compress on ship. One line per item: the outcome, not the implementation.
     The WHY lives in decision-log.md; the per-file roles live in file-map.md.
     Never paste a decision-log entry in here. A pointer is enough. -->
<!-- Keep every shipped ID individually greppable: start each line with the
     item ID. When one line covers a group of related sub-items, spell out
     each ID (e.g. WL-19a, WL-19b, ... WL-19h) rather than a range, so an
     ID-level reconcile can find them all. -->
<!-- Structure: newest phase/milestone at the top. Group items by the phase or
     milestone they belong to, with a one-line Outcome per phase. -->
<!-- Budget: see pm_skills/memory-policy.md. Over budget → memory-maintenance.md
     (Prune) moves the oldest phases to archive/trajectory/trajectory-NNNN-<range>.md
     and adds a row to archive/INDEX.md. Archives are append-only; never rewrite. -->

## Archived: Phase 1 — Band 0 MVP — see archive/trajectory/trajectory-0001-band-0-mvp.md

## Archived: real material and Band 1's first half — see archive/trajectory/trajectory-0002-real-material-and-band-1.md

### VH-57 — cancel is answered by every phase

- VH-57 — Shipped 2026-08-27. Every request registers its controller before it
  can await, inspection and pre-flight are cancellable, and the finished-file
  verification honours the signal — so Cancel no longer answers "your video is
  ready". See decision-log.

### VH-56, VH-58 — a finished file survives the user's next click

- VH-58 — Shipped 2026-08-27. A job claims its OPFS directory before creating
  it and the boot sweep deletes only inside a granted lock, closing both
  windows in which a live workspace could be swept. See decision-log.
- VH-56 — Shipped 2026-08-27. A finished result is retained until the user has
  it somewhere: a read lease blocks disposal while a save streams, starting
  again asks before discarding, a fallback download keeps its scratch and
  object URL, and a save destination that is the source is refused. See
  decision-log.

### VH-50, VH-54 — the output contract holds on real material

- VH-54 — Shipped 2026-08-27. The true-peak interpolator is drained at end of
  stream and the limiter clocks its tail out through the normal detection and
  gain path, so a transient in the final frames is measured and limited instead
  of reading −64 dBTP and leaving at 0. See decision-log.
- VH-50 — Shipped 2026-08-27. The step 5 gain is solved against the chain that
  limits, and the limiter holds 1.0 dB below the published ceiling for our own
  AAC encode. Four real lectures now meet −16 ±0.5 LUFS and −2.0 dBTP; before,
  none met both. The acceptance harness calls the product's own solver and
  carries a real-shaped crest-factor case. See decision-log.

### VH-52 — DSP timeout failures carry their operating context

- VH-52 — Shipped 2026-08-27. The 30-second test timeout remains the measured
  CI bound; test output now pairs Vitest's file/test durations with an explicit
  settled-machine rerun instruction, so contention is legible without turning
  a genuinely hung test into a minutes-long wait. See decision-log.

### VH-53 — one project contract for both coding agents

- VH-53 — Shipped 2026-08-26. Claude Desktop Code now imports the same root
  `AGENTS.md` that Codex loads; tool-managed memories remain local recall aids,
  not the shared project record. See decision-log.

### VH-42 — branding boundaries measured against the picture

- VH-42 — Shipped 2026-08-26. `PipelineOptions.durationSeconds` was
  `max(video, audio)` and every branding boundary keyed off it; it is replaced
  by `videoDurationSeconds` plus `audioDurationSeconds`, which made the compiler
  find all four call sites. The arithmetic moved out of the pipeline into a pure
  `closingTimeline()` so the defect is unit-testable at all — it needed WebCodecs
  to reach before. A source shorter than the build now degrades to `over-freeze`
  and logs why instead of computing a negative start, and trailing audio plays
  under the closing rather than opening a video gap ahead of it, unless the
  closing master carries a bed of its own. Both cases are synthesised fixtures in
  `/spike-modes.html`: audio two seconds past the picture produces 8.00 s where
  the old code gave 10.08 s, and a 0.5 s source produces 5.52 s via the freeze.

### VH-39 — three claims that had stopped being true

- VH-39 — Shipped 2026-08-26. `README.md` said "Foundation set, build not
  started" on the front page of a deployed app; it now says what the pilot is
  and names the two things withdrawn from it (VH-33, VH-44).
  `src/media/branding.ts` described the transition modes as not built; they
  shipped with VH-22. `presets.ts` commented `avc1.640033` as "level 4.2" where
  `0x33` is 51 — level 5.1 — and the comment was wrong in the direction that
  matters, since 4.2 tops out below the 4K sources spec §2 contains.

### VH-37 — failures that name themselves

- VH-37 — Shipped 2026-08-26. `InvalidVttError` was checked in `handleInspect`
  and `handlePreflight`, neither of which parses VTT, and not in
  `handleProcess`, which is the only path that reaches `offsetVtt` — so a
  malformed sidecar surfaced as "something went wrong". The check moved to
  where the throw is and the two dead ones are gone. And the two feed lanes now
  fail together: `Promise.all` left the survivor pushing into a cancelling
  `Output`, and its later rejection reached the user as a second, unexplained
  entry in the errors panel via `diagnostics.ts`'s `unhandledrejection` hook.
  `settleLanes` waits for both, aborts the survivor, and reports the cause
  rather than the cancellation it triggered — extracted so it is testable
  without WebCodecs.

### VH-40 — the guard runs before anything is written

- VH-40 — Shipped 2026-08-26. `check:placeholders` — the safeguard that stops a
  real lecture recording being copied into a deployed build — ran AFTER `build`
  in the gate, and not at all for a bare `npm run build`, which is what the
  deploy workflow calls. It is now a `prebuild` script, so nothing can write
  `dist/` without it. A small Vite plugin drops `branding/README.md` from the
  output, which the live site was serving with its ticket IDs. The worker now
  sets its own log level: it has a separate module scope, so `main.ts` never
  reached it and every debug line reached a production console.
- Two of the item's claims did not survive checking, and both are recorded
  rather than "fixed": the spike pages do not ship (every `spike-*.html` 404s),
  and the sourcemaps expose nothing, because the repository is public.

### VH-20 — the audio chain's tail is emitted

- VH-20 — Shipped 2026-08-26. `AudioChain.flush()` already existed and the
  encode path never called it, so every job lost the limiter's look-ahead window
  from the end of its audio. `createContentAudioProcessor` returns
  `{ process, flush }` and the pipeline emits the tail after the last sample.
  The inconsistency was sharper than the 5 ms suggests: the ANALYSIS pass
  already flushed, so loudness was being measured over audio the output did not
  contain. Pinned by a frame-conservation test — in equals out, flush included.

### VH-38 — the one-hour ceiling removed

- VH-38 — Shipped 2026-08-26. The `process` request carried a 3,600,000 ms
  deadline on the whole job — a duration cap of exactly the kind spec §7 opens
  by disclaiming — and it rejected WITHOUT telling the worker, so the job ran on,
  finished, and held its output in the `finished` map while the user was told it
  had not finished. The watchdog now measures SILENCE: `pipeline.ts` reports a
  stage every thirty frames, so a healthy job speaks several times a second
  however long it runs, and `WORKER_SILENCE_LIMIT_MS` (60 s) catches a wedged
  one. Giving up posts `cancel` first, so nothing is retained. Extracted as
  `createWatchdog` and pinned with fake timers, including that a late progress
  message cannot resurrect a request whose caller has already been told it
  failed.

### VH-16 — the harness covers the path the app takes

- VH-16 — Shipped 2026-08-26, all three gaps closed. The harness now runs a
  fixture through the WORKER, which is the only way to reach OPFS's
  sync-access-handle path — every previous run had exercised the
  `createWritable` fallback and never the real one. Preset comparison moved to a
  new camera-motion fixture, where the two presets land at 1223 kB and 468 kB
  (38%); on the screen-like default H.264 predicts nearly everything and the
  comparison measured nothing. And the loudness window takes its offset from
  `PipelineResult.contentOffsetSeconds` rather than
  `BRANDING_DURATIONS.openingSeconds` — the pipeline offsets by the clip's
  actual decoded duration, and the two agreed only because the placeholder is
  exactly 5.000 s.

### VH-43 — the odd shapes reach a correct output, and Firefox does not

- VH-43 — Shipped 2026-08-26. `/spike-shapes.html` runs the awkward properties
  the real corpus has — 852x480, 4:3, 16:10, mono, 44.1 kHz, and no audio —
  through the pipeline and checks each for distortion, dimension parity, sample
  rate conform and channel preservation. ALL PASS in Chrome and Safari.
  Synthesised rather than the real lectures so it runs anywhere rather than only
  on the maintainer's machine. The mono-plus-opening channel-count note is
  recorded as closed by condition: VH-33 removed the opening control and the
  real closings are silent, so nothing can mix counts until VH-23 restores
  openings, and it is named on that item.
- It also found something much larger. Firefox 154 refuses to encode AAC at any
  bitrate, so every lecture with sound failed mid-job in a browser spec §10
  lists as supported. `capability.ts` now asks
  `AudioEncoder.isConfigSupported` and pre-flight blocks with `no-aac-encode`
  before a job starts, naming a browser that works. What Firefox users should
  actually get is VH-49, and needs a person.

### VH-44 — the composite agrees in all three engines

- VH-44 — Shipped 2026-08-26. `compose()` now reads the branding pixels with
  whichever route the engine actually honours: `VideoSample.copyTo` where a
  request for RGBA is respected, the canvas readback where it is not. Firefox
  over black went from `(17,17,17)` and `(18,40,66)` — white inverted, blue
  3.7x too bright — to `(74,74,74)` and `(5,11,18)`, against a file holding
  `(73,73,73)` and `(4,10,17)`. Chrome and Safari unchanged and still correct.
- The engine is identified by a PROPERTY rather than a table or a pixel
  comparison: ask `allocationSize` for RGBA and check it equals `width x height
  x 4`. Safari answers 5,184,000 where the answer is 8,294,400, which is it
  saying it will not honour the format. No expected-colour constants, so
  re-rendering the masters cannot invalidate the check.
- `copyTo` returns the frame at its own resolution, so scaling moved out of the
  canvas into `compositeSampled` — bilinear, which is well-defined on
  premultiplied colour and is exactly why the decoder's own buffer is the right
  thing to interpolate.
- The controls stay withdrawn. The engineering is done and verified; putting
  them back in front of users is a decision, raised as VH-46b.

### VH-51 — the overnight run reviewed itself, and found a regression

- VH-51 — Shipped 2026-08-26. A 25-agent adversarial review of the night's 14
  commits confirmed 15 defects and refuted 3. The worst was mine: VH-38's
  60-second SILENCE watchdog rested on "the encode loop reports every thirty
  frames", which is true of the encode loop and of nothing else. Inspection,
  both audio-analysis traversals and the post-encode verification each emitted
  nothing and each scale with the source — so a long job could sit silent and be
  cancelled for being slow, which is the duration cap spec §7 disclaims,
  reintroduced at a lower threshold. All three now report; the bound is 120 s.
- Also fixed: a cancel arriving between the last checkpoint and the lane
  controller was lost outright, because a listener attached to an
  ALREADY-aborted signal never fires (reproduced in Node); `honoursRgbaReadback`
  compared `allocationSize` against CODED dimensions where it measures the
  VISIBLE rect, so a padded master would have failed closed onto the
  Firefox-broken path and quietly undone VH-44; `timelineSeconds` added the
  audio overrun on top of the closing instead of taking the later of the two
  tracks; and `compositeSampled` had dropped the opaque and transparent fast
  paths, costing ~133 M reads a frame at 4K.
- Three claims the run made were false and are corrected rather than quietly
  dropped: `Promise.all` does NOT leak an unhandled rejection (reproduced —
  zero events), so VH-37's recorded root cause was wrong; a test named for that
  mechanism could not fail and is replaced; and VH-39's "stale claims" sweep
  wrote a fresh stale claim that VH-44 falsified four commits later.
