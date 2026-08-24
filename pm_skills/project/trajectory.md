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

## Milestone 1 — MVP (in progress)

- VH-1 — Runnable skeleton: the app boots in dev and production, the job
  worker round-trips, and an uncaught throw on either thread is captured and
  surfaced with a stack. `npm run check` runs seven steps green.

- VH-2 — BS.1770-4 loudness meter: gated integrated loudness, momentary and
  short-term curves, LRA per Tech 3342, and 4x oversampled true peak. Pure
  arithmetic, no browser APIs, streaming, and chunk-size invariant. Projected
  3.6 s + 8.8 s for a one-hour stereo file.

- VH-3 — EBU Tech 3341 compliance gate: Table 1 cases 1-6, 9-23 synthesised
  from their published definitions and asserted inside `npm run check`. Worst
  loudness error 0.021 LU against a ±0.1 tolerance; worst true-peak error
  0.265 dB against +0.2/−0.4. Cases 7-8 need the EBU's authentic-programme
  audio and are not run.

- VH-4 — File inspection: Mediabunny demux in the worker reporting resolution,
  rotation, duration, frame-rate metrics, codecs and channels, with VFR taken
  from Mediabunny's own verdict. Files with no video track are rejected rather
  than described. Verified against a MediaRecorder-produced WebM.

- VH-5 — Pre-flight and calibration probe: capability checked against the exact
  encoder config, OPFS quota against 2.5x the projected output, device class,
  and a 3-second decode-and-encode of the real file on the real device. All four
  spec 7.3 outcomes tested. Measured 303 fps on a 720p25 fixture.

- VH-6 — Video pipeline: decode to encode to mux, streaming to OPFS through a
  sync-handle-backed StreamTarget, both presets, with progress and cancellation.
  A VFR source (min 10.4, max 55.6 fps) produced a CFR 30 fps output that plays
  in a real decoder; a 2560x1440 source downscaled to 1920x1080 on the smaller
  preset; cancelling removed the job's scratch entirely.

- VH-7 — Audio chain: high-pass, conditional macro-levelling, gentle
  compression, one linear gain and a true-peak limiter, planned over three
  audio passes so the gain is measured rather than estimated. End to end, a
  -46.83 LUFS source came out at -16.03; a drifting source with LRA 14.36 came
  out at -16.02 with LRA 8.01 and true peak exactly at the -2.0 ceiling.

- VH-8 — Branding conform and concatenation: eight placeholder masters covering
  the four spec 4.2 variants, master selection by frame rate then resolution,
  scale-to-fit with brand-colour padding, and the bed passed through
  unprocessed. A 4:3 source produced a 17.04 s timeline from 5 + 8 + 4, padding
  took a changed D1 token exactly, and the content still measured -15.88 LUFS.

<!-- Outcome line is written when the milestone closes. -->
