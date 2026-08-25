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

## Phase 1 — Band 0 MVP (shipped 2026-08-25)

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

- VH-9 — Subtitle, chapter and metadata handling: an ISOBMFF handler scan finds
  the tracks Mediabunny reports as absent, a sidecar WebVTT is offset by the
  opening duration with its words untouched, and file-level metadata round-trips.
  On a subtitle-bearing MP4, Mediabunny saw 2 tracks and the scan saw 3; the
  muxed sidecar's sample boundaries landed at exactly 7 / 11.5 / 35 / 38.25 s
  against source cues at 2 / 6.5 / 30 / 33.25.

- VH-10 — UI workflow: the spec 5.4 warnings detected and worded, named
  progress stages, always-available cancel, streaming save through the File
  System Access API, and the finished file measured to answer 5.4's
  post-processing row. Absorbs VH-22. The AAA design review found one
  unlabelled section and a 32 px browser-drawn button; both fixed, and the
  audit then reported no target under 44x44 and no unlabelled landmark.

- VH-11 — Acceptance verification: a repeatable in-browser harness against
  spec 13. Four criteria pass, four need a person and are named as such, and
  one fails honestly — audio runs about 50 ms late, now VH-18. The harness
  found two real bugs on its first run: cancelling during the analysis pass
  escaped the pipeline's cleanup and leaked its scratch, and the main-thread
  OPFS path never released its writable.

- VH-18 — A/V sync: the 50 ms audio delay was the AAC encoder's own priming,
  uncompensated because Mediabunny writes no edit list. Measured in isolation
  at AAC 44.0 ms against Opus and PCM at 0. The audio timeline is now shifted
  by the measured delay, and the pipeline adds 0.0 ms at every marker on a
  constant-frame-rate source. Acceptance criterion 6 passes.

Outcome: a static browser-only app that takes a recorded lecture and returns a
branded, correctly-levelled, correctly-encoded MP4, with nothing leaving the
device. Acceptance run: 5 pass, 0 fail, 4 need real material and a person.
See decision-log 2026-08-25.

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
