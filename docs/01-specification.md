# UoN Video Helper — Specification v2

Status: **draft for review**. Supersedes [`00-original-brief.md`](00-original-brief.md),
which is retained verbatim as the record of intent.

Rationale and evidence for the decisions below are in
[`02-technical-rationale.md`](02-technical-rationale.md). Items still needing
a human decision are in [`03-open-decisions.md`](03-open-decisions.md).

---

## 1. Purpose

A self-contained web app that lets non-technical University of Nottingham
staff take a recorded educational video and produce a consistent,
correctly-levelled, correctly-branded MP4 — without installing software,
without uploading media anywhere, and without understanding encoding.

It solves three problems in one pass:

1. **Inconsistent branding** — no approved opening/closing sequence.
2. **Inconsistent audio** — some recordings are inaudible, some are hot.
3. **Technical burden** — staff should not have to learn FFmpeg or Handbrake.

## 2. Users and context

- **Primary user:** UoN academic and professional-services staff, novice
  level, on a managed or personal laptop.
- **Typical source material:** Teams/Zoom recordings, PowerPoint
  screen-recorded presentations, webcam talking-heads, screen captures.
  Predominantly 720p–1080p, 25–30 fps, often variable frame rate.
- **Publishing destinations (confirmed):** EchoVideo (primary, including
  Moodle embeds via EchoVideo), OneDrive and SharePoint, occasionally
  YouTube.

**Consequence of the destination mix:** EchoVideo and YouTube both
re-encode on ingest, so files sent there should favour quality over size.
OneDrive/SharePoint files are frequently downloaded as-is, so those should
favour size. This defines the two outputs in Section 6.

## 3. Architecture decision (the constraint that drives everything)

**The app processes video with the WebCodecs API, not FFmpeg/WebAssembly.**

| Requirement from the brief | Why WebCodecs, not ffmpeg.wasm |
| --- | --- |
| Files up to ~1 hour / multi-GB | ffmpeg.wasm writes output into wasm memory (~2 GB ceiling). WebCodecs streams frame-by-frame to disk-backed storage. |
| Licences permitting institutional use and redistribution | H.264 encoding in ffmpeg.wasm requires GPL-licensed x264 plus, per x264's own licensing terms, an AVC patent-pool licence. WebCodecs uses the **browser's** already-licensed encoder — UoN ships no codec. |
| Deployable as a static University website | Multithreaded ffmpeg.wasm requires `COOP`/`COEP` response headers for `SharedArrayBuffer`. WebCodecs requires no special headers. |
| Usable processing speed | WebCodecs reaches hardware encoders; WebAssembly cannot. |

**Accepted cost:** browsers without WebCodecs are not supported (see
Section 10). These users are shown a clear explanation, not a broken app.

### 3.1 Stack

| Layer | Choice | Licence |
| --- | --- | --- |
| Video decode/encode | WebCodecs (`VideoDecoder`/`VideoEncoder`) | Browser built-in |
| Audio decode/encode | WebCodecs (`AudioDecoder`/`AudioEncoder`) | Browser built-in |
| MP4 demux/mux | [Mediabunny](https://mediabunny.dev/) | MPL-2.0 |
| Loudness DSP | Bespoke JS (see Section 5) | Project-owned |
| Working storage | OPFS (Origin Private File System) | Browser built-in |
| Save to disk | File System Access API where available, else blob download | Browser built-in |

No runtime dependency outside Mediabunny. No server. No network calls
carrying media.

## 4. Branding

### 4.1 Behaviour

Two independent toggles — opening animation and closing animation — giving
all four combinations (both / opening only / closing only / neither).
Sequences are **prepended and appended**, not overlaid.

### 4.2 Master asset requirements

Rendered from the existing After Effects source. Deliver as H.264 MP4
(High profile, visually lossless, ~20 Mbps):

| Variant | Resolution | Frame rate | Purpose |
| --- | --- | --- | --- |
| A | 1920×1080 | 25 fps | Default; UK-native and most screen recordings |
| B | 1920×1080 | 30 fps | 29.97/30 fps sources (Teams, US-configured tools) |
| C | 3840×2160 | 25 fps | Fetched only when source exceeds 1080p |
| D | 3840×2160 | 30 fps | As above |

Only the two variants matching the job are downloaded. Rendering both frame
rates from the AE source avoids frame-rate conversion judder entirely.

### 4.3 Conforming to the source

1. Choose the master whose frame rate is nearest the output frame rate.
2. Scale to **fit** the output frame, preserving the branding's aspect ratio.
3. Pad any remainder with the UoN brand background colour (hex TBC — see
   open decisions) so 4:3 and vertical sources are handled correctly.
4. Re-encode the branding frames with the same encoder settings as the main
   content, so the whole file is a single consistent stream.

### 4.4 Branding audio

The branding carries its own audio bed. It must be **mastered at the target
loudness and passed through unprocessed at runtime.**

**Critical:** loudness analysis in Section 5 runs on the *source content
only*, never on the concatenated timeline. Measuring a 5-second music sting
together with 50 minutes of speech biases the integrated measurement and
would mis-level the whole video.

Apply a 100 ms audio fade at each branding/content boundary to prevent
discontinuity clicks.

## 5. Audio processing

Implemented in JavaScript in a Web Worker. No FFmpeg filters are available
in a WebCodecs architecture, so the loudness chain is bespoke and specified
here in full.

### 5.1 Targets

| Parameter | Value | Note |
| --- | --- | --- |
| Integrated loudness | **−16 LUFS** | Confirmed. Speech/podcast standard; suits laptop and phone speakers. |
| True-peak ceiling | **−2.0 dBTP** | **Revised from −3 dBTP.** |
| Measurement standard | ITU-R BS.1770-4 / EBU R128 | Gated integrated loudness |

Why −2.0 dBTP rather than −3: the output is re-encoded again downstream by
EchoVideo and YouTube, and lossy transcoding can overshoot by roughly 1 dB.
−2.0 dBTP absorbs that while engaging the limiter less than −3 would, which
means less processing of the speech itself. −1 dBTP would not leave enough
margin for a lossy-to-lossy chain.

### 5.2 Processing chain (in order)

1. **Analysis pass** over source audio only:
   - Integrated loudness (gated, per BS.1770-4)
   - Loudness Range (LRA) from the short-term (3 s) distribution
   - Short-term loudness curve over time
   - True peak (4× oversampled)
2. **High-pass filter** at 60 Hz — removes rumble and handling noise.
3. **Macro-levelling (conditional).** *This is the "windowed loudness
   normalisation" the brief asks for.* Applied **only when LRA > 9 LU**;
   skipped entirely on already-consistent audio.
   - Derive a gain envelope from the short-term loudness curve
   - Smooth over a **15 s** window
   - Clamp to **±6 dB**
   - **Slew-rate limit to 1 dB/second**
   - Freeze the envelope where short-term loudness is below −45 LUFS, so
     pauses and room tone are never amplified

   The slew limit and the pause freeze are what prevent pumping. A single
   fixed window applied unconditionally is what causes it.
4. **Gentle compression** — ratio 2:1, threshold −18 dBFS, attack 20 ms,
   release 200 ms, soft knee.
5. **Single linear gain** to hit −16 LUFS integrated. One constant gain
   across the file: fully transparent, no dynamic artefacts.
6. **True-peak limiter** — 5 ms look-ahead, 50 ms release, ceiling
   −2.0 dBTP.

### 5.3 Validation

The loudness meter must be validated against the **EBU Tech 3341** test
signals, which have published expected LUFS values. This is a hard
acceptance criterion — a bespoke meter that has not been checked against
reference material cannot be trusted to level real content.

### 5.4 Audio-quality warnings

Derived from the Section 5.2 analysis pass and shown **before** processing.
All are advisory, phrased as possibilities, and never block processing.

| Condition | Trigger |
| --- | --- |
| Clipping / distortion | ≥10 samples at ≥ −0.1 dBTP, or sustained true peak > 0 dBTP |
| Very quiet | Integrated loudness < −35 LUFS |
| Highly variable levels | LRA > 15 LU |
| Likely background noise | Noise floor (10th-percentile short-term) > −50 LUFS |
| Extended silence | Any continuous span > 30 s below −60 LUFS |
| Target not reached | Post-processing integrated loudness differs from −16 LUFS by > 1 LU |
| No audio track | Source has no audio stream |

Pumping detection from *pre-existing* processing is **deferred from v1** —
it cannot be measured reliably enough to avoid false alarms. See open
decisions.

## 6. Video outputs

Presented to the user by purpose, not by technique.

### 6.1 "Best quality — for EchoVideo or YouTube"

For destinations that re-encode on ingest. Preserves source resolution,
aspect ratio, and frame rate.

| Setting | Value |
| --- | --- |
| Codec / container | H.264 High profile, MP4 |
| Resolution | Source, unchanged |
| Frame rate | Source, conformed to constant frame rate |
| Bitrate | ~0.12 bits/pixel/frame (≈8 Mbps at 1080p30) |
| Keyframe interval | 2 seconds |
| Audio | AAC-LC, 192 kbps, 48 kHz |

### 6.2 "Smaller file — for OneDrive, SharePoint or email"

For files students may download directly.

| Setting | Value |
| --- | --- |
| Codec / container | H.264 High profile, MP4 |
| Resolution | Preserved up to 1080p; downscaled to 1080p only if larger |
| Frame rate | Source, capped at 30 fps |
| Bitrate | Content-adaptive: ~1.5 Mbps for slides/screen, ~2.5 Mbps for camera/motion at 1080p30 |
| Keyframe interval | 2 seconds |
| Audio | AAC-LC, 128 kbps stereo / 96 kbps mono, 48 kHz |

**Resolution is preserved rather than reduced.** Slide and diagram
legibility depends far more on resolution than on bitrate; dropping 1080p
to 720p to save space is the single most damaging thing that could be done
to this content. Save the space in bitrate instead.

### 6.3 Frame-rate handling

Screen and meeting recordings are frequently variable frame rate. Output is
always conformed to **constant frame rate** at the source's average rate,
rounded to the nearest standard value (24/25/30/50/60). This ensures MP4
compatibility, correct A/V sync, and clean branding conform.

### 6.4 WebM

Not implemented in v1, not exposed in the UI. The Mediabunny muxer supports
WebM, so adding it later is a configuration change rather than a redesign —
which satisfies the brief's intent without carrying the cost now.

## 7. Limits and device pre-flight

**No arbitrary file-size or duration cap.** Fixed numbers guessed in advance
are either needlessly restrictive on a fast machine or misleadingly
permissive on a slow one. Instead:

### 7.1 Calibration probe

Before processing, the app decodes and re-encodes **3 seconds of the actual
source file** on the actual device, measures throughput, and extrapolates a
real time estimate. This directly satisfies the brief's requirement to
"assess the selected file and the user's device before processing begins."

### 7.2 Pre-flight checks

- WebCodecs availability and H.264 encode support (`isConfigSupported`)
- Source resolution, duration, frame rate, codec, audio presence
- OPFS quota via `navigator.storage.estimate()` — require **2.5×** the
  estimated output size
- Device class (phone/tablet detection)
- Measured throughput from the calibration probe

### 7.3 Thresholds

| Outcome | Condition | Behaviour |
| --- | --- | --- |
| **Proceed** | Estimate < 20 min, checks pass | Start, show estimate |
| **Warn** | Estimate 20–60 min | Show estimate and a keep-this-tab-open notice; allow continue |
| **Block** | No WebCodecs / no H.264 encode / insufficient storage | Explain, and name a browser that will work |
| **Discourage** | Estimate > 60 min, or phone/tablet | Recommend a desktop; allow continue after acknowledgement |

### 7.4 Validated envelope for v1

Test and document performance across: 5 / 20 / 60 minutes, at 720p and
1080p, on a managed University laptop, a modern MacBook, and a low-spec
Windows device. **Published limits are set from these measurements, not
from assumption.**

### 7.5 Keeping the job alive

- Request a **Screen Wake Lock** during processing
- Register a `beforeunload` warning while a job is running
- Run all processing in a Web Worker so the UI stays responsive

## 8. Subtitles, captions and metadata

### 8.1 The timing problem

**Adding an opening animation shifts every subsequent timestamp.** A
subtitle track preserved unmodified against a video with a 5-second intro is
5 seconds out of sync for its entire length. Preservation therefore
*requires* re-timing.

**Resolution:** offsetting all cue times by the opening-animation duration
is not "editing" the captions — the words are untouched — and is
mandatory for correctness. The brief's rule is refined to: *never alter
subtitle **content**; always offset subtitle **timing** to match inserted
branding.*

### 8.2 Practical priority

This is lower risk than it appears: in the confirmed workflow, captions are
generated by **EchoVideo after upload**, not embedded in the staff member's
source file. Embedded subtitle tracks will be rare.

### 8.3 Behaviour

1. Detect subtitle, chapter, and metadata tracks during demux.
2. Where present and preservable: offset all timings by the opening
   duration and re-embed.
3. Where present and not preservable: **warn clearly before processing**,
   and offer to export the track as a sidecar `.vtt` with corrected timings
   so nothing is lost.
4. Preserve language tags, track labels and creation metadata where the
   muxer supports them.

## 9. User experience

### 9.1 Workflow

1. Select a video (file picker or drag-and-drop)
2. App inspects the file and runs the calibration probe
3. Review any compatibility, capacity or audio-quality warnings
4. Toggle opening animation
5. Toggle closing animation
6. Choose "Best quality" or "Smaller file"
7. Process, with progress and a cancel button
8. Download the finished file

### 9.2 Principles

- No codec, bitrate, or loudness setting is exposed. Not in an "advanced"
  panel either — every exposed control is a decision a novice must make.
- Plain language throughout. Named stages ("Analysing audio", "Adding
  branding", "Encoding video — 34%") rather than a single opaque bar.
- Every error states what happened, whether the original file is affected
  (it never is), and what to do next.
- Persistent reassurance that the source file is never modified and never
  leaves the device.
- Cancel is always available and leaves no partial file.

### 9.3 Accessibility

WCAG 2.2 AA minimum, AAA where achievable. Full keyboard operation,
visible focus, screen-reader-announced progress via a polite live region,
no colour-only status indication.

### 9.4 Mobile

Responsive and fully readable on phones and tablets. Processing is
**discouraged with a clear warning**, not blocked, on mobile devices.

## 10. Browser support

| Browser | Status |
| --- | --- |
| Chrome / Edge (desktop) 94+ | Supported |
| Firefox (desktop) 130+ | Supported |
| Safari (macOS/iOS) 26+ | Supported |
| Safari below 26 | Not supported — clear message |
| Firefox on Android | Not supported — WebCodecs not exposed |
| Any browser without WebCodecs | Not supported — clear message |

Approximate coverage: ~95% of active browsers. The support check runs at
load and again against the specific source file, since codec support is
per-configuration.

## 11. Non-functional requirements

- **Privacy:** no media leaves the device. No analytics carrying filenames
  or media characteristics. Verifiable by inspecting network activity.
- **Deployment:** static files only. No server-side processing, no build
  requirement beyond a bundler, no special response headers.
- **Licensing:** all dependencies permissive (MPL-2.0 or better). No GPL
  components shipped. No codec patent obligation assumed by UoN.
- **Offline:** must work after first load with no network, except for
  branding assets, which are cached.

## 12. Out of scope for v1

- Trimming, cutting, or any editing of picture content
- Creating, editing or transcribing captions
- Batch processing of multiple files
- WebM output (implemented in the muxer layer, not exposed)
- Pumping detection on pre-existing audio processing
- Noise reduction or de-reverberation
- Custom or per-department branding variants

## 13. Acceptance criteria

v1 is complete when:

1. A 1080p source with both animations produces a valid MP4 that plays in
   VLC, QuickTime, Chrome, and after upload to EchoVideo.
2. Measured integrated loudness of the output content is **−16 ±0.5 LUFS**
   and true peak never exceeds −2.0 dBTP, across the full test corpus.
3. The loudness meter matches **EBU Tech 3341** reference values within
   ±0.1 LU.
4. No audible pumping on a deliberately variable-level test recording,
   confirmed by listening and by short-term loudness plot.
5. Slide text in the "Smaller file" output remains legible at 100% zoom
   against the source.
6. A variable-frame-rate screen recording produces output with correct A/V
   sync across the full duration.
7. Every pre-flight block and warning has been triggered deliberately and
   reads clearly to a non-technical reader.
8. Cancelling mid-process leaves no partial file and no orphaned OPFS data.
9. Network inspection during a full job shows zero media egress.

### Test corpus

Representative real material, per the original brief: webcam recordings,
PowerPoint presentations, screen recordings with fine text, talking heads,
mixed speech and music, and — added — a variable-frame-rate Teams
recording, a 4:3 legacy recording, and a recording with badly inconsistent
levels.
