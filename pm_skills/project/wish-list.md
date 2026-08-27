# Wish-list

<!-- Capture inbox for unscoped ideas. Append one line; no structure required. -->
<!-- Cold tier. Agents NEVER auto-read this file. Read it only during an
     explicit triage pass — the next-batch pick (session-start.md Start B),
     or end-of-task.md / memory-maintenance.md when the size check flags
     it. See AGENTS.md → "Before every task". -->
<!-- Boundary: this is PRE-triage — raw, unjudged ideas. The backlog Icebox
     is POST-triage — ideas already judged worth keeping. Promote items INTO
     backlog.md (Current, Next, or Icebox); never treat this as a second backlog. -->
<!-- Triage = promote or cut. Promoting MOVES the item into backlog.md. Cutting
     DELETES the line. No history is kept here — survivors live in the backlog. -->
<!-- Format: one plain bullet per idea, optionally a source. Append at the
     bottom; triage from the top. Example:
     - Idea in one line — (from: 2026-05-30 task) -->
<!-- Soft cap ~25 open items. Over budget → end-of-task flags it and
     memory-maintenance.md (Prune) runs a forced triage pass (not an
     archive). See pm_skills/memory-policy.md. -->

## Open

- Momentary and short-term curves are kept in full at 100 Hz — about 5.8 MB per
  hour of audio. Fine at v1 scope; worth revisiting if anyone points this at a
  multi-hour recording. (from: VH-3)
- EBU Tech 3341 cases 20-23 pass on my reading of "continuous in phase at both
  sides of the single period", which Table 1 does not define. Confirm against
  the EBU's own signal files if they are ever downloaded. (from: VH-3)
- Worker bundle is now 404 kB — demux, decode, encode and mux paths. Spec §11
  wants the app usable offline after first load, and first load is on a managed
  University network. Worth measuring gzipped and deciding whether it needs
  splitting before launch. (from: VH-6)
- The time estimate covers decode, encode and audio analysis. It does not yet
  include the audio chain (VH-7) or branding conform (VH-8), so it will
  under-report once those land. Revisit the extrapolation then. (from: VH-5)
- The macro-levelling envelope is indexed by frame count from the start of the
  audio, which assumes the track begins at t=0 and has no gaps. True for
  everything seen so far; would misalign on a source with a delayed or
  discontinuous audio track. (from: VH-7)
- The compressor detects RMS where the spec says only "attack 20 ms, release
  200 ms". That is a choice inside the spec rather than a departure from it,
  but it is a choice, and it belongs in the decision log at close. (from: VH-7)
- Branding assets are fetched at runtime with no caching. Spec §11 wants the
  app usable offline after first load "except for branding assets, which are
  cached" — nothing caches them yet. Belongs with the deploy decision (D5) but
  the caching itself is app-level. (from: VH-8)
- Every branding frame is redrawn through a canvas to get brand-colour padding.
  Fine at 1080p; at 4K that is 150 canvas compositions per sequence. Worth
  measuring before the real 4K masters land. (from: VH-8)
- The acceptance run takes ~94 s, mostly building fixtures. Fine as a
  maintainer tool; too slow to fold into `npm run check`. (from: VH-11)
- `npm run check` now takes ~27 s, up from ~2 s: the chain tests process
  minutes of synthesised audio each, and LRA needs 60 s of material to settle
  (Tech 3342). Still fine to run on every change, but worth watching — the gate
  earns its keep only if people actually run it. (from: VH-7)
- Progress is emitted every 30 frames, which is invisible on short jobs. Fine
  for an hour of video; revisit if the UI feels dead on short ones. (from: VH-6)
- `inspectFile` runs three times per job (inspect, preflight, process), each
  re-probing frame-rate metrics and re-running `scanTrackHandlers`, which
  slices up to 64 MB — 128 MB when the head misses and the tail fallback
  fires. The most real of the review's efficiency findings. (from: 2026-08-25
  external review)
- The ISOBMFF tail fallback rarely works: `file.slice(tailStart)` starts at an
  arbitrary offset, so `readBoxes` from position 0 parses mid-`mdat`. It fails
  safe — reports "not ISOBMFF" — but does not do its job. Walking top-level box
  headers forward with 16-byte slices would find a trailing `moov` for
  kilobytes. (from: 2026-08-25 external review)
- Preflight is uncancellable: `handlePreflight` never registers in `running`
  and passes no signal into `analyseSourceAudio`, so a user who picks a
  two-hour file waits out a full audio decode with no way out. (from:
  2026-08-25 external review)
- Audio is traversed four to five times per job. Declined as premature — the
  measured cost is 3.6 s + 8.8 s per hour against a video path at 6.3× real
  time — but `audio-plan.ts:70`'s preflight duplicate is the one that is pure
  waste, and caching pass A against the file would remove it. Revisit if the
  audio path ever shows up in a profile. (from: 2026-08-25 external review)
- `detectSourceWarnings` calls `percentile()` twice, each copying and sorting
  the full short-term curve — 720k values on a two-hour file. One sort would
  do. (from: 2026-08-25 external review)
- The `TruePeakLimiter` and `TruePeakDetector` hot loops shift a 13-element
  window per sample per channel; a ring buffer removes ~13 writes per sample.
  The largest single win in the audio path, and still not a bottleneck.
  (from: 2026-08-25 external review)
- `loudness.ts`'s module header still says "a handful of running sums plus one
  value per 100 ms" — true before the hop dropped to 10 ms for the EBU tests.
  Pairs with the existing 5.8 MB/hour note above. (from: 2026-08-25 external
  review)
- The subtitle helper text promises timings are "shifted to match the opening
  sequence", but the opening is off by default and VH-33 removes it, so the
  offset is usually zero. Revisit as part of VH-32's copy pass. (from:
  2026-08-25 external review)
- Spec §6.3 and §6.5 now carry corpus evidence inline, though the spec's own
  header points at `02-technical-rationale.md` as where evidence lives (2,008
  words, room to spare). Moving it there would clear the 3,500-word reference
  guideline without losing a sentence. (from: 2026-08-25 spec copy-edit)
- Two "A VideoSample was garbage collected without first being closed" warnings
  land in the console on every inspect+preflight. Our own loops close every
  sample (`probe.ts:76-84` uses try/finally), so this looks like Mediabunny
  decoding ahead of the `samples(0, CALIBRATION_PROBE_SECONDS)` range and
  dropping what it does not need. No user impact — `diagnostics.ts` hooks
  `error` and `unhandledrejection`, not `console.error`, so it never reaches the
  errors panel — but it is noise in every diagnostics bundle and it would mask a
  real leak of ours. (from: 2026-08-25, seen while verifying VH-33)
- Measure `BEST_SOURCE_BLEND` instead of judging it. VH-47 shipped with 0.5 —
  the geometric mean, i.e. "no basis to trust the source estimate over the shape
  estimate" — and it is the only constant in that rule not backed by a number.
  The experiment is bounded and the machinery exists: the calibration probe
  already decodes `CALIBRATION_PROBE_SECONDS` of the real file, so encode that
  same sample at source x{1.0, 1.25, 1.5, 2.0, 3.0}, put each through a second
  encode standing in for the destination's ingest, and score against the first
  decode. Two corpus files at widely separated densities determine it; a third
  validates. It matters most on the Teams file: at 0.6 its figure falls from
  2.00 to about 1.6 Mbps. (from: 2026-08-26 VH-47)
- Measure the AAC true-peak overshoot per job rather than carrying a corpus
  constant. `ENCODE_TRUE_PEAK_HEADROOM_DB` is 1.0 dB because four real
  lectures ranged 0.02-0.44; the calibration probe already decodes
  `CALIBRATION_PROBE_SECONDS` of the real file, so encoding and decoding that
  same excerpt at the job's exact audio config would give the actual figure and
  let the limiter stop holding headroom nobody's file needs.
  (from: 2026-08-27 VH-50)
- AAC costs integrated loudness as well as peak, and nothing models it. The
  same four files lost 0.02-0.41 LU between the limiter's output and the
  decoded file, worst on the most heavily limited material, so a job can sit at
  -16.4 while the chain solved -16.0 — 80% of the +/-0.5 budget spent on the
  codec. Measurable by the same probe round-trip as the item above.
  (from: 2026-08-27 VH-50)
