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

## 2026-08-25 — Real material arrives

The maintainer supplied the test corpus (VH-M1) and the branding masters. Both
changed the picture rather than confirming it, so nothing was built this
session; the findings were recorded and the affected tickets reopened.

The corpus (26 files, 16 GB, 20 lecture sources) shows the awkward input is the
common case: 30.303 fps screen recordings, declared frame rates that disagree
with actual ones by ~1%, 16:10 geometry, mono and PCM audio, mixed sample
rates, and two files with no audio at all. VH-24 carries the detail.

The branding masters are `qtrle`/`argb` — a codec WebCodecs cannot decode —
carry a 1.00 s alpha ramp meant for compositing rather than concatenation,
have no audio bed, and ship as one 4K25 master in four styles rather than the
four resolution variants the spec anticipated. VH-12 was reopened as a
sign-off item; the boundary modes it implies are VH-22.

### Loudness meter verified at 16 kHz

The Teams recording's audio is 16 kHz mono — a third of the rate the meter was
validated at, and far enough outside EBU Tech 3341's 48 kHz signals that the
K-weighting derivation could plausibly have drifted. Checked against ffmpeg's
`ebur128` over the first 180 s:

| | integrated | LRA |
| --- | --- | --- |
| ffmpeg, native 16 kHz | −20.9 LUFS | 12.8 LU |
| ours, native 16 kHz | −20.88 LUFS | 12.8 LU |
| ffmpeg, resampled 48 kHz | −21.0 LUFS | 12.8 LU |
| ours, resampled 48 kHz | −20.97 LUFS | 12.8 LU |

0.02–0.03 LU from the reference at both rates, with LRA matching exactly.
Deriving the K-weighting coefficients analytically per sample rate, rather than
hardcoding the 48 kHz set, is what makes this hold — the choice made in
`kweighting.ts` during VH-3 paid off on material that did not exist yet.


### VH-12 — real branding, end to end

The masters were not the file swap the item assumed: `qtrle`/`argb`, which no
browser decodes; a 1.00 s premultiplied-alpha build meant for compositing
rather than concatenation; no audio bed; and one 4K25 master where the spec
expected a matrix of four.

What shipped instead: a build-time transcode (`scripts/build-branding.mjs`)
producing eight 1 s onsets as VP9+alpha WebM and four 4 s tails as H.264 —
twelve files, 0.74 MB, against the ~100 MB first estimated. Two tails rather
than four, because Fade and Slide are byte-identical after the build within a
colour, which the maintainer confirmed was deliberate. Tails are H.264 on
purpose: hard cut uses only the tail, so that mode survives anywhere alpha
decode does not.

Three findings were worth more than the code. The alpha is premultiplied, so
the composite is `brand + source×(1−a)` and the conventional straight-alpha
form double-darkens — measured, not reasoned: canvas `drawImage` returns 202
where 255 is correct, so the blend had to stay on the CPU. Source and build
frames pair by timestamp, never frame order, because the build is 25 fps and
sources are not. And the freeze must hold the last CLEAN frame, distinguishing
a defect from a deliberate fade — a trend needs two significant steps one way,
a flash is a single jump.

Verified in a browser at each step rather than by compiling: alpha survives
decode, all three modes produce their promised timelines (+3.97, +3.97, +4.97
against 4/4/5), and the build is fetched only for the modes that composite it —
duration alone would not have caught a silent fallback. Safari and Firefox
remain unverified; `/spike-alpha.html` exists so that check is one URL.

### Deployed, and verified in the browsers that mattered

The app went live at `djdaojones.github.io/UoN-Video-Helper/` on 2026-08-25 as
an unadvertised pilot; the intended home is an internal server. The WebCodecs
decision is what made GitHub Pages viable at all — no `SharedArrayBuffer`
means no COOP/COEP headers, which Pages cannot set.

Chrome 151 and Safari 26.5.2 both decode VP9 alpha, through the app's own
loader, so all three closing modes work in both. Firefox is still unchecked.
Both browsers independently return `drawImage -> R=202` on the premultiplied
onset, confirming that treating that colour as straight is standard canvas
behaviour rather than one engine's quirk — the CPU composite is necessary
everywhere, not a workaround for Chrome.

The first real job on the deployed site worked. It also exposed two things the
harness could not: the size estimate overstates by 3.6x (VH-31), and the
interface needs a deliberate design pass rather than tweaks (VH-32).

### All three engines verified — and they disagree

Firefox joined Chrome 151 and Safari 26.5.2 in decoding VP9 alpha through the
app's own loader. Decode is all that proved: VH-34 later measured the PIXELS
and found the two compositing modes wrong in Firefox (see below).

The same runs found something worth more than the pass. Compositing the onset
over white via `drawImage` returns 202 in Chrome and Safari but **255 in
Firefox**, on 152 and again on 154 two major versions later: the engines
genuinely disagree about whether a decoded frame's colour is premultiplied, and
it is not a regression on its way out. 255 is the correct answer, so Gecko is
the one in the right — but a composite that is correct in one engine and
double-darkened in the other two is unusable, and no `drawImage` call is
portable. Doing the blend on the CPU in `composite.ts` was chosen when only
Chrome had been measured, and it was right to move; it was not sufficient.

A smaller difference in the same output: asking for exactly t=0.40 s returned
the neighbouring frame in Firefox. Invisible at 40 ms, but a reminder not to
key logic off exact multiples of the frame period.

The deployed site was also confirmed working on a University machine, so
`github.io` is not filtered there — the last unknown in VH-14's technical half.

### VH-22 — the three boundary modes, closed

- VH-22 — Closing boundary modes shipped with VH-12 and closed on review
  2026-08-25: `hard-cut`, `over-picture` and `over-freeze` live in
  `config/branding.ts`, `pipeline.ts` and `freeze.ts`, hard cut is the default
  and the alpha-decode fallback, the freeze holds the last CLEAN frame rather
  than the last decoded one, and all three DECODED in Chrome 151, Safari 26.5.2
  and Firefox 152 — which is not the same as compositing correctly, as VH-34
  found. Two clauses outlived the code and moved rather than closing: the
  fade-out defaulting on for hard cut only went to VH-25, and the unguarded
  negative overlay start on a sub-1-second source went to VH-42.

### VH-45 — the transition controls withdrawn

- VH-45 — Shipped 2026-08-25, hours after VH-34 measured the defect: the "How
  the logo arrives" and "Animation" fieldsets are gone from `index.html`, so
  every job takes the hard cut that was already the default. Animation went
  with them — Fade and Slide differ only during the build a hard cut discards.
  `chosenBranding` already fell back to `CLOSING_DEFAULTS`, so the pipeline
  keeps all three modes for VH-44 and nothing else moved.

### VH-46 — the three-engine check, repeatable

- VH-46 — Shipped 2026-08-25: `scripts/run-in-engines.mjs` runs a spike page in
  Chrome (CDP), Firefox (WebDriver BiDi) and Safari (`safaridriver`) and prints
  all three. It knows only the `<pre id="log">` … `done` contract the spike
  pages share, so it works on any of them. Documented in DEV-INFRASTRUCTURE
  with the reason it must stay out of `npm run check`. The same run also
  cleared 15 missing file-map roles and the two glob lines the generator could
  not resolve.

### VH-35 — a second tab no longer deletes the first tab's work

- VH-35 — Shipped 2026-08-25. A live job now holds an origin-wide Web Lock on
  its scratch directory and the sweep removes only what nobody holds, so a
  second tab's boot sweep leaves an in-flight job and an unsaved result alone.
  Directory names gained a per-tab session prefix, which also stops two tabs
  both opening `job-1`. The three-engine check found two more: a sweep abandoned
  every remaining orphan after one undeletable directory (Firefox), and
  `dispose` on the cancel path was never exercised. Both fixed; all three
  engines pass `/spike-opfs.html`.

### VH-36 — the screen locks while a job runs

- VH-36 — Shipped 2026-08-25. Start and Cancel are built once at module scope
  and never replaced, so a preset change no longer detaches the running job's
  Cancel or hands back an enabled Start; the cancel listener is bound once
  rather than per Start click. One `setJobInFlight` flag disables the file,
  subtitle, preset and branding controls for the duration — the state model
  VH-32 inherits. Also fixed what made the lock invisible: `.button` set its own
  colours, so a disabled Start looked identical to a live one, and a disabled
  file input still drew a blue `::file-selector-button`.

### VH-33 — the opening control withdrawn

- VH-33 — Shipped 2026-08-25. The "Add the opening sequence" checkbox and its
  "leave this off" helper text are gone from `index.html`; the job spec passes
  `opening: false` and the pipeline's opening path is untouched for VH-23. The
  placeholder assets stay on disk and keep shipping, which is harmless: they
  render the words "PLACEHOLDER — opening — 1080p25" and carry no University
  branding, so the risk was only ever putting one INTO a video.

### VH-24, VH-41 — the output shape stops lying about the source

- VH-24 — Shipped 2026-08-25. `conformedFrameRate` withdraws the
  round-to-nearest-standard rule below 24 fps, so a Teams recording stays at its
  measured 16.000 instead of becoming 24 with half its frames duplicated. Above
  the floor nothing changes: a PowerPoint export at 30.303 still conforms to 30.
  The test that pinned the old behaviour was rewritten to pin the new rule
  rather than deleted.
- VH-41 — Shipped 2026-08-25. `inspect` now measures the source's real video
  bitrate from its packets, and the smaller preset's request is capped at it, so
  the preset named for making files smaller can no longer inflate one. The cap
  is stated in the preflight panel in plain language rather than applied
  silently. Deliberately not applied to "best quality" — that preset's
  destinations re-encode on ingest, where headroom is what prevents generation
  loss. Verified in the browser on a synthesised 16 fps source: output reads
  "640 × 360 at 16 fps" and the estimate falls from 324 kB to 82 kB.

### VH-47 — best quality stops ignoring the source

- VH-47 — Shipped 2026-08-26. The "best quality" bitrate is the geometric mean
  of spec 6.1's `pixelRate x 0.12` anchor and the source's own measured density,
  bounded below at 0.03 bits/pixel/frame and ABOVE AT THE ANCHOR — so the rule
  can only ever lower the figure, never raise it. Teams falls 3.98 to 2.00 Mbps
  (still 1.99x its source), the thinnest corpus file falls to a quarter of
  today, and a well-encoded master is left exactly where it is. Designed and
  adversarially verified by an eight-agent workflow which measured all 23 corpus
  sources with ffprobe and scored real encodes; two of three refuters returned
  blocking findings and the design shipped is the corrected one. Half the
  ticket's diagnosis was retired by measurement: raising a pristine master's
  bitrate buys +0.60 VMAF for up to 933 MB, below the perceptual threshold.
  `bitrateBasis` replaced the figure comparison that decided the pre-flight
  cap message, which would otherwise have announced "already compressed as far
  as this setting would take it" over outputs running at twice the source.

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
