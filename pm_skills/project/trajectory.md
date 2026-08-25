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
