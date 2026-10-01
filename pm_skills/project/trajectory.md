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

## Archived: the review's close and Band 1a — see archive/trajectory/trajectory-0004-review-close-and-band-1a.md

### Band 6 — review, then translate

- VH-115 — Spike closed 2026-10-01. CULT2011's corrupt bursts wreck the
  measurement (+28 LUFS, LRA 40), make pre-flight accuse the microphone,
  and leave a blast and a two-second dip in the output; the target still
  lands. Follow-up VH-122. See decision-log.
- VH-114 — Shipped 2026-10-01. Plain words, once: units and codec words off
  the main path, one name for levelling, claims that depend on the job, the
  status line showing only what the box does not, what next after both save
  routes, and a readability check in the gate over every string the page can
  show. See decision-log.
- VH-108 — Shipped 2026-10-01. The Create step says only what is still
  true: a superseded verdict and its sound notes are withdrawn, a block is
  said at step 1 with steps 2 to 5 withdrawn, every block's remedy fits its
  cause and the browser in use, and each trim field keeps its own error.
  See decision-log.
- VH-107 — Shipped 2026-10-01. The finished video carries its own record
  and keeps it: the discard question is retired by any change to the
  selection, Discard passes Create's gate, a fade that fell back to a cut
  says so, the previous video is named as such, and "Saved." stands. See
  decision-log.
- VH-106 — Shipped 2026-10-01. The Teams recording lands on −16 on both
  outputs: the gain solve sizes each correction by the chain's measured
  response to gain, so a limiter that holds most of the gain is reached in
  five passes instead of stopping 0.9 LU short after three. Pinned in Node
  (`chain.test.ts`) and as a documented headless run. See decision-log.
- VH-104 — Shipped 2026-10-01. The whole page walked as a first-time member
  of staff would, at desktop and phone width, with Codex astra reading the
  source: 25 ranked findings in `reviews/2026-10-01/`, filed as VH-106 to
  VH-114 or set aside, the person-only checks as VH-M4; VH-97 keeps its
  default. See decision-log.
- Spec gap review — 2026-10-01. The specification read against every WCAG
  2.2 criterion for the gaps Band 6 would leave, with Codex astra as the
  second reviewer and the adversary: 20 findings in `reviews/2026-10-01/`,
  eleven doc-deltas awaiting sign-off, clauses on nine Band 6 tickets and
  VH-M4. See decision-log.
- VH-121 — Shipped 2026-10-01. The load-time check now asks for the H.264
  and AAC encoders, and the intro's browser sentence reports what it found
  instead of telling every browser it "may not work"; a browser that fails a
  check is pointed at the System check, whose summary now names a warning.
  Seen in Chrome (passed) and headless Firefox (AAC warned). See decision-log.
- Doc-sync — 2026-10-01. Thirteen spec deltas applied in one signed-off
  pass, the review's open points decided (VH-97 not built, VH-105 on the
  content switcher), rationale §4.4 and §4.5 added. See decision-log.

### Band 5 — the overnight run

- VH-103 — Shipped 2026-10-01. `npm run package:xerte` makes the Xerte zip
  — the flat build and its hosting README, named for the build id the bundle
  carries — and refuses a dirty tree. Band 5 closed with it. See
  decision-log.
- VH-102 — Shipped 2026-10-01. Every spike page ends on one `ALL PASS` /
  `N FAILURE(S)` line and the cross-engine runner reads only that, so no file
  name can fail a run that passed. See decision-log.
- VH-101 — Shipped 2026-10-01. A video can be dropped on the Choose step and
  is read exactly as a chosen one; anything else is refused in words, and a
  file dropped elsewhere never navigates the page away. See decision-log.
- VH-100 — Shipped 2026-10-01. The pre-flight time estimate counts the
  closing and every audio stage, priced from pre-flight's own timed analysis
  pass; planning is now predicted within a second. The 3 s video probe's own
  noise is the error left. See decision-log.
- VH-99 — Shipped 2026-10-01. Audio planning takes about half the time, with
  bit-identical output: true peak and the limiter skip a span of frames at a
  time, the compressor skips its logarithm below the knee. An hour of audio
  plans in about two minutes, down from three and a half. See decision-log.

### VH-30, VH-95, VH-96 — trimming the ends

- VH-30 — Shipped 2026-10-01 with its two children. Signed off 2026-09-30 as
  a conveyor with one cut: the identity in `AGENTS.md` and the brief says
  trimming the ends is in and cutting from the middle is out.
- VH-96 — Shipped 2026-10-01. A Trim step, second of five: the video in the
  browser's own player, two handles on one track, time fields and "Set start
  here" / "Set end here"; the verdict follows the kept part. See
  decision-log.
- VH-95 — Shipped 2026-09-30. A kept range on `preflight` and `process`,
  honoured by every audio pass, both lanes, the probe and the picture
  check, with each cut on a frame edge; proved in the acceptance harness.
  See decision-log.

### VH-93 — a feedback button

- VH-93 — Shipped 2026-09-30. "Send feedback" in the footer, and "Report this
  problem" beside captured errors, open the user's own email app with their
  message and a short list of named facts. The page makes no request. See
  decision-log.

### VH-98 — the University's logo and heading face

- VH-98 — Shipped 2026-09-30. The website's white logo top-left on the blue
  band, the title in Lora on the content's edge, and an intro that says the
  app is built for Chrome. See decision-log.

### VH-19, VH-71 — slides cost less, and the archive is reconciled

- VH-19 — Shipped 2026-09-30. The smaller output measures slides against
  camera and spends less on slides, saying so in the verdict; verified on 21
  recordings with no camera source read as slides. See decision-log.
- VH-71 — Closed 2026-09-30. Its last work package was VH-19; every child of
  the archive reconciliation has shipped or been iceboxed.

### VH-26 — phone sources, closed

- VH-26 — Closed 2026-09-30. An iPhone HEVC file in Firefox is refused by the
  pre-flight block in its own words, before the job; measured headlessly with
  the real worker. See decision-log.

### VH-83 — the gain aims through the codec

- VH-83 — Shipped 2026-09-30. The gain solve allows for what the AAC encode
  costs in loudness, and the limiter for what it adds in true peak, both
  measured per job; four real lectures land within 0.1 LU, and a mono lecture
  the smaller output used to refuse now completes. See decision-log.

### Band 4 — the interface pass

- VH-92 — Shipped 2026-09-30. The page wears the University's palette in
  both themes, with blue header and footer bands and serif headings; slots
  wait for the logo and Lora (VH-98). See decision-log.
- VH-91 — Shipped 2026-09-30. Four numbered panels that stay open; Create
  holds everything about the job; the file and the job each have a status
  line beside them. See decision-log.
- VH-90 — Shipped 2026-09-30. Closing branding is three always-present
  controls — type, onset, colour — with a sentence stating the result; every
  combination makes the job its old radio did. See decision-log.
- VH-89 — Shipped 2026-09-30. A `proceed` verdict is three lines; other
  outcomes keep their reasons and gain the time and size; a block no longer
  says "you can still continue". See decision-log.
- VH-88 — Shipped 2026-09-30. System check is a disclosure that says its
  result in words and opens itself on a failure; the status line sits beside
  Create. See decision-log.
- VH-87 — Shipped 2026-09-30. Source facts fold into a closed "Video
  properties" disclosure; what will not be carried stays in view above it.
  See decision-log.
- VH-86 — Shipped 2026-09-30. The screen says "caption"; the caption file
  field and its worker path are deleted; a caption or chapter track inside
  the source is still warned about before processing. See decision-log.
- VH-85 — Shipped 2026-09-30. The page says what the tool does as a list and
  makes the privacy promise once; the output question is "File size /
  quality". See decision-log.
- VH-94 — Shipped 2026-09-30. `hidden` now hides: Start and the progress bar
  no longer show before a file, under a block, or after a job. See
  decision-log.

### VH-14 — the Xerte package

- Package half shipped 2026-09-21. `npm run build:xerte` makes a relocatable,
  flat package that runs from any folder; first zipped as
  `v0.1.0+20260921.899a448`. Making it found that the worker fetched branding
  relative to its own script, so under a relative base every job lost its
  closing; fixed. Caching and the fate of Pages remain. See decision-log.

