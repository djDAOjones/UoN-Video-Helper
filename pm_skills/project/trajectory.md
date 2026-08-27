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

## Archived: the review remediation and Band 1's close — see archive/trajectory/trajectory-0003-review-remediation-and-band-1-close.md

### VH-76 — the gate stopped writing

- VH-76 — Shipped 2026-08-27. `check` builds to a temp directory, so a green
  run leaves `dist/` byte-identical instead of replacing the artifact it had
  just certified. See decision-log.

### VH-32, VH-61 — closed on the maintainer's judgement

- VH-32 — Closed 2026-08-27. No redesign wanted: the simplicity is the design,
  and only a trim function would justify a second screen. See decision-log.
- VH-61 — Closed 2026-08-27 as accepted behaviour. The LRA blind spot
  under-reports, which keeps macro-levelling off — the safe direction.
- VH-17 — Reframed 2026-08-27: EchoVideo re-encodes on ingest, so this is a
  secondary-path question rather than a headline one.

### VH-31 — the estimate is a bound, and says so

- VH-31 — Closed 2026-08-27. The projection now covers the whole output rather
  than the source alone, and the panel says "at most". The content-derived
  estimator stays unbuilt; its refuters' findings moved to VH-19, which rides
  the same probe. See decision-log.

### Seven decisions closed

- VH-15 — Closed 2026-08-27. UoN IT signed off the Safari-below-26 exclusion
  (D4). VH-48 — Cut: re-encoding is the reliable option. VH-M3 — Won't do;
  the OneDrive hazard is permanent and documented. D5, D6, D7, D12 answered.
  See decision-log.

### VH-46b — the closing is one question again

- VH-46b — Shipped 2026-08-27. The closing is a four-way radio (clean cut,
  over the picture, over a freeze frame, none), Animation appears only where
  it can change anything, and every mode was verified end to end across both
  styles and both colours. See decision-log.

### VH-25, VH-23 — two features decided away

- VH-25 — Cut 2026-08-27. No picture fades at the branding boundary, either
  direction: no benefit in a lecture viewing context. The 100 ms audio fade
  stays — it prevents a click, not a fade. See decision-log.
- VH-23 — Iceboxed 2026-08-27. Openings are dormant rather than deleted, and
  the four placeholder assets no longer ship. See decision-log.

### VH-49 — Firefox is told to switch

- VH-49 — Closed 2026-08-27. The block stands as the answer: Firefox users are
  told to use a browser that works rather than served a different format. A
  pathway is iceboxed as VH-69. See decision-log.

### D1 — the padding has a brand colour

- D1 — Answered 2026-08-27. `--uon-brand-bg` is Nottingham Blue #10263B,
  confirmed against the shipped closing tail's own pixels. See decision-log.

### VH-66 — the documents and the code agree again

- VH-66 — Shipped 2026-08-27. Production shows the build identity its own
  documentation promised, the Deployment section says that `main` publishes,
  `architecture.md` names modules that exist, and the placeholder generator
  stopped emitting closings the app does not fetch. Two spec deltas captured
  rather than edited. See decision-log.

### VH-64 — progress says what it is, and a slow job is agreed to

- VH-64 — Shipped 2026-08-27. The progress bar carries an accessible name that
  follows the stage, and a discouraged verdict withholds Start until the user
  acknowledges it. See decision-log.

### VH-60 — the screen and the Start button describe one job

- VH-60 — Shipped 2026-08-27. Every asynchronous answer carries the selection
  it was asked for and a stale one is dropped; secure context, OPFS and
  source-decode became pre-flight blocks; and the H.264 level is derived from
  the shape rather than declared 5.1 for everything. See decision-log.

### VH-61 (part), VH-67 — the envelope holds, the meter keeps less

- VH-67 — Shipped 2026-08-27. Gating blocks are stored pre-weighted, which is
  the same arithmetic at half the size, and the momentary curve is kept only
  for callers that ask. A stereo hour: ~1.4 MB to ~580 kB. See decision-log.
- VH-61 — Partly shipped 2026-08-27. The pause freeze now holds the finished
  envelope, so a centred window can no longer reach into a pause and undo it.
  The LRA end-of-file half is left alone on purpose. See decision-log.

### VH-65 — least privilege where publishing happens

- VH-65 — Shipped 2026-08-27. Deploy credentials belong to the deploy job
  alone, every action is pinned to a commit SHA with its version named, and the
  publishable-media guard allows what git tracks rather than what directory a
  file sits in. See decision-log.

### VH-63 — a long job survives a tab switch

- VH-63 — Shipped 2026-08-27. A screen wake lock is held for the length of a
  job and re-taken when the tab returns to view, and `beforeunload` is attached
  while a job runs, a save streams, or a finished file is still unsaved. See
  decision-log.

### VH-68 — four faults too small to schedule

- VH-68 — Shipped 2026-08-27. The limiter's sample counter no longer wraps at
  12.4 hours, two config values that nothing read now drive the code that
  duplicated them, an entirely silent track can raise the silence warning, and
  the cross-engine tally counts completed, skipped and failed apart. See
  decision-log.

### VH-62 (part) — the harness stops flattering itself

- VH-62 — Partly shipped 2026-08-27. Criterion 3 reports `external` rather than
  a pass it did not run, the sync meter uses one clock for both tracks
  (unblocking VH-55), the worker's realm is watched and merged into criterion 9,
  and a negative control proves the egress instrument can fire. See
  decision-log.

### VH-59 — the track that is inspected is the track that is encoded

- VH-59 — Shipped 2026-08-27. Inspection and production now call the same
  primary-track API, extra video and sound tracks are named before Start, and
  metadata that fails to copy reports rather than only logging. See
  decision-log.

### VH-55 (part) — the onset loss is no longer silent

- VH-55 — Partly shipped 2026-08-27. An unmeasurable encoder delay is now
  distinguishable from a zero one, and audio discarded by delay compensation
  raises a warning above −50 dBFS. Preserving it needs the video lane re-timed
  and a sync meter that can prove it. See decision-log.

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

