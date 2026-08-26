# Project Brief

<!-- Hot whole-file read. See pm_skills/memory-policy.md for limits. -->

The authoritative specification is [`docs/01-specification.md`](../../docs/01-specification.md).
This brief is the summary agents read every task; the spec is the detail
they read when the task touches it. Where they disagree, the spec wins —
and this file is wrong and should be corrected.

| Document | Purpose |
| --- | --- |
| [`docs/01-specification.md`](../../docs/01-specification.md) | The specification. Authoritative. |
| [`docs/02-technical-rationale.md`](../../docs/02-technical-rationale.md) | Why each decision was made, with evidence. Read before re-opening a settled question. |
| [`docs/03-open-decisions.md`](../../docs/03-open-decisions.md) | What still needs a human decision (D1–D13). |
| [`docs/00-original-brief.md`](../../docs/00-original-brief.md) | The original brief, verbatim. Historical record only. |

## What are we building?

A static, browser-only web app that takes a staff member's recorded
educational video and produces a consistent, correctly-levelled,
correctly-branded MP4 — in one pass, with no software to install, no
upload, and no media leaving the device. It adds approved UoN opening and
closing branding, normalises audio to −16 LUFS integrated with a −2.0 dBTP
true-peak ceiling, and exports H.264/MP4 in one of two purpose-named
variants. All processing runs on the user's own machine through the
WebCodecs API.

It is **not** a video editor. No trimming, no cutting, no caption
authoring, and no exposed codec, bitrate or loudness settings.

It solves three problems at once: inconsistent branding, inconsistent
audio, and the technical burden of expecting academics to learn FFmpeg.

## Who is it for?

University of Nottingham academic and professional-services staff.
Novice level, on managed or personal laptops. They arrive with a Teams or
Zoom recording, a screen-recorded PowerPoint, a webcam talking head, or a
screen capture — typically 720p–1080p, 25–30 fps, frequently variable
frame rate — and they are publishing to EchoVideo (primary, including
Moodle embeds), OneDrive/SharePoint, or occasionally YouTube.

The destination mix defines the two outputs: EchoVideo and YouTube
re-encode on ingest, so files sent there favour quality; OneDrive and
SharePoint files are downloaded as-is, so those favour size.

## Platform and deployment

Static files served over HTTPS. No server-side processing, no build
requirement beyond a bundler, no special response headers (this is one
reason WebCodecs was chosen over ffmpeg.wasm — see rationale §1.3). Must
work offline after first load, except for branding assets, which are
cached.

An unadvertised public pilot runs on GitHub Pages while the permanent
University-owned location remains open under D5. `main` is the automatic
stable deployment; the current experimental branch is deployed manually and
can be rolled back by dispatching the same workflow from `main`.

## Core features (v1)

- **Branding** — independent opening and closing toggles, prepended and
  appended (not overlaid), conformed to the source's resolution and frame
  rate, with the branding's own audio bed passed through unprocessed.
- **Loudness normalisation** — BS.1770-4 measurement, then a bespoke
  chain: high-pass, conditional macro-levelling (only when LRA > 9 LU,
  slew-limited to 1 dB/s), gentle compression, a single linear gain to
  −16 LUFS, and a true-peak limiter at −2.0 dBTP.
- **Two outputs by purpose** — "Best quality" for EchoVideo/YouTube, and
  "Smaller file" for OneDrive/SharePoint. The smaller preset **preserves
  resolution** and takes the saving from bitrate, because slide legibility
  depends on resolution.
- **Device pre-flight** — no fixed size or duration cap. A 3-second
  calibration probe on the user's actual file and device produces a real
  time estimate, plus capability, storage and device-class checks.
- **Track pass-through** — subtitle, chapter and metadata tracks are
  carried through, with cue timings offset by the opening-branding
  duration so they stay in sync. Content is never altered.
- **A workflow a novice can complete** — plain language, named progress
  stages, always-available cancel, and errors that say what happened and
  what to do next.

## Constraints

- **WebCodecs, not ffmpeg.wasm.** Load-bearing and settled. ffmpeg.wasm
  fails this brief on four independent counts — a ~2 GB write ceiling in
  wasm memory, GPL/x264 plus AVC patent-pool exposure, the COOP/COEP
  headers a static University host may not allow, and no path to hardware
  encoders. See rationale §1. Do not re-open without new evidence.
- **One runtime dependency: Mediabunny** (MPL-2.0), for MP4 demux and
  mux. WebCodecs handles codecs but not containers. Anything beyond this
  needs explicit approval.
- **Privacy is a hard requirement.** No media egress, verifiable by
  inspecting network activity. No analytics carrying filenames or media
  characteristics.
- **Licensing.** All dependencies permissive (MPL-2.0 or better). No GPL
  components shipped. UoN assumes no codec patent obligation.
- **Accessibility.** WCAG 2.2 AAA is the target, AA the documented floor;
  every AAA exception is recorded explicitly. Carbon productive design
  language, implemented in our own code, with a separate UoN brand token
  layer. See `UI-STANDARDS.md`.
- **Browser support** excludes Safari below 26 and Firefox on Android. Desktop
  Firefox supports silent sources only: audio-bearing sources are blocked in
  pre-flight because Firefox cannot encode the AAC track required by the MP4
  output. Every exclusion names a browser that works rather than failing
  during processing.
- **The loudness meter must validate against EBU Tech 3341** reference
  values within ±0.1 LU before anything is built on top of it. This is an
  acceptance criterion, not an optional extra.

## Out of scope (for now)

Per spec §12: trimming, cutting or any picture editing; creating, editing
or transcribing captions; batch processing; exposed WebM output (the muxer
supports it, the UI does not); pumping detection on pre-existing audio
processing; noise reduction or de-reverberation; custom or per-department
branding variants.

Deferred within v1: the stream-copy fast path for the "best quality"
output (D10) — it fails unpredictably on variable-frame-rate sources,
which are common here.

## Open questions

The live list is [`docs/03-open-decisions.md`](../../docs/03-open-decisions.md).
Four block work and are being **built around**, not answered by guesswork:

| ID | Question | Working assumption |
| --- | --- | --- |
| D1 | UoN brand background colour | A single named token, `#000000` interim, referenced in one place |
| D2 | Branding durations | 5 s opening / 4 s closing, parameterised — never hard-coded |
| D3 | Boundary audio treatment | Hard cut with a 100 ms fade each side |
| D4 | Safari-below-26 exclusion, unsigned by UoN IT | Holds. Tracked as a standing risk, since reversing it is architectural |

Real branding assets do not exist yet. Placeholder clips matching the
§4.2 master format stand in, so the real renders drop in unchanged.
