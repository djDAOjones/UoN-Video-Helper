# Brief — UoN Video Helper

<!-- Owner-signed. Direction lives here and in the backlog; agents do
     not change it without a decision. Rule 1 reads Direction every
     session (under 150 words); the full brief is read at kick-off,
     after a substantial amendment, in the plan verb, and when
     Direction does not answer. The full brief below is the canon
     brief at 029ae1e, carried verbatim on 2026-10-01; the spec it
     names stays authoritative. -->

## Direction

A static, browser-only app that turns one recorded educational video
into a branded, loudness-normalised, correctly encoded MP4 for
University of Nottingham staff, in one pass, with no media leaving the
device. A conveyor with one cut, not an editor: trim the ends, choose a
closing, choose one of two purpose-named outputs, nothing else.
`docs/01-specification.md` is authoritative; `docs/02-technical-rationale.md`
settles WebCodecs over ffmpeg.wasm, the one runtime dependency and the
loudness targets, and none re-opens without new evidence. WCAG 2.2 AAA
and Carbon productive design in our own code; the EBU Tech 3341 meter
validation is an acceptance criterion. Live as an unadvertised pilot on
GitHub Pages; the intended home is a UoN Xerte upload.

## The specification set

The authoritative specification is [`docs/01-specification.md`](../docs/01-specification.md).
This brief is the summary agents read; the spec is the detail they read
when the task touches it. Where they disagree, the spec wins — and this
file is wrong and should be corrected.

| Document | Purpose |
| --- | --- |
| [`docs/01-specification.md`](../docs/01-specification.md) | The specification. Authoritative. |
| [`docs/02-technical-rationale.md`](../docs/02-technical-rationale.md) | Why each decision was made, with evidence. Read before re-opening a settled question. |
| [`docs/03-open-decisions.md`](../docs/03-open-decisions.md) | What still needs a human decision (D1–D13). |
| [`docs/00-original-brief.md`](../docs/00-original-brief.md) | The original brief, verbatim. Historical record only. |

## What we are building

A static, browser-only web app that takes a staff member's recorded
educational video and produces a consistent, correctly-levelled,
correctly-branded MP4 — in one pass, with no software to install, no
upload, and no media leaving the device. It adds approved UoN closing
branding, normalises audio to −16 LUFS integrated with a −2.0 dBTP
true-peak ceiling, and exports H.264/MP4 in one of two purpose-named
variants. All processing runs on the user's own machine through the
WebCodecs API.

It is **not** a video editor. It is a conveyor with one cut: the user may
trim unwanted material from the start and the end (VH-30), and left alone
the whole video is kept. No cutting from the middle, no joining or
reordering, no caption authoring, and no exposed codec, bitrate or loudness
settings.

It solves three problems at once: inconsistent branding, inconsistent
audio, and the technical burden of expecting academics to learn FFmpeg.

## Who it is for

University of Nottingham academic and professional-services staff.
Novice level, on managed or personal laptops. They arrive with a Teams or
Zoom recording, a screen-recorded PowerPoint, a webcam talking head, or a
screen capture — typically 720p–1080p at 25–30 fps (variable frame rate
was expected; the measured corpus has none, spec §6.3) — and they are
publishing to EchoVideo (primary, including
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

Hosting is answered in principle (D5): a UoN-hosted web app. Who provisions
it is open (VH-14); meanwhile the pilot runs on GitHub Pages and a flat Xerte
package is uploaded by hand.

## Core features (v1)

- **Branding** — a closing only (no approved opening exists, VH-23),
  appended and chosen by three controls — type, onset, colour — or none;
  conformed to the source's resolution and frame rate, padded in
  Nottingham Blue, and silent (spec §4).
- **Loudness normalisation** — BS.1770-4 measurement, then a bespoke
  chain: high-pass, conditional macro-levelling (only when LRA > 9 LU,
  slew-limited to 1 dB/s), gentle compression, a single linear gain that
  lands the delivered file on −16 LUFS, and a true-peak limiter held at
  least 1 dB under the file's −2.0 dBTP ceiling, because AAC raises peaks
  after it (spec §5.2).
- **Two outputs by purpose** — "Best quality" for EchoVideo/YouTube, and
  "Smaller file" for OneDrive/SharePoint; on screen since VH-85, "Larger /
  better" and "Smaller / reduced" under "File size / quality". The smaller preset **preserves
  resolution** and takes the saving from bitrate, because slide legibility
  depends on resolution.
- **Device pre-flight** — no fixed size or duration cap. A 3-second
  calibration probe on the user's actual file and device produces a real
  time estimate, plus capability, storage and device-class checks.
- **Track pass-through** — file-level tags and the primary tracks' own
  metadata are carried through. Caption and chapter tracks inside the
  source cannot be — the demuxer cannot read them — so they are detected
  and warned about before processing starts. No caption file is taken
  (VH-86): EchoVideo generates captions after upload.
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
- **Browser support** — built for Chrome, and the page says so (VH-98).
  Firefox is refused for any video with sound (VH-49); Safari below 26 and
  Firefox on Android lack what the app needs. Every block names Chrome, and
  none leaves a broken app (spec §10).
- **The loudness meter must validate against EBU Tech 3341** reference
  values within ±0.1 LU before anything is built on top of it. This is an
  acceptance criterion, not an optional extra.

## Out of scope

Per spec §12, amended by VH-30: cutting from the middle, joining,
reordering or any other picture editing (trimming the two ends is in);
creating, editing
or transcribing captions; batch processing; exposed WebM output (the muxer
supports it, the UI does not); pumping detection on pre-existing audio
processing; noise reduction or de-reverberation; custom or per-department
branding variants.

Cut: the stream-copy fast path for the larger output (D10, answered no on
2026-08-27) — re-encoding is slower and predictable.

## Open questions

The live list is [`docs/03-open-decisions.md`](../docs/03-open-decisions.md).
D1 (Nottingham Blue, `#10263B`), D4 (signed off), D6, D7 and D10 are
answered and sit under its Answered section. What remains is small:

| ID | Question | Working assumption |
| --- | --- | --- |
| D2 | Branding durations | Settled by the masters — a 1.00 s onset and a 4.00 s tail — and parameterised, never hard-coded |
| D3 | Boundary audio treatment | A 100 ms fade each side; the branding is silent |
| D5 | Hosting | A UoN-hosted web app; who provisions it is open (VH-14) |
| D8 | Published limits | Wait on the measured device envelope (VH-M2) |

The real closing masters shipped with VH-12: four styles, built into twelve
browser-ready files (spec §4.2). No approved opening exists.

## Signed

- Owner (delegated, not reviewed): Joe, 2026-10-01 — see the maintainer's instruction of 2026-10-01 to run V3-FIELD on this project (the lab's V3-FIELD-1); the owner's reviewed line is due within two weeks (3.8)
