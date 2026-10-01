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

1. **Inconsistent branding** — an approved closing exists but is not applied
   consistently.
2. **Inconsistent audio** — some recordings are inaudible, some are hot.
3. **Technical burden** — staff should not have to learn FFmpeg or Handbrake.

## 2. Users and context

- **Primary user:** UoN academic and professional-services staff, novice
  level, on a managed or personal laptop.
- **Typical source material:** Teams/Zoom recordings, PowerPoint
  screen-recorded presentations, webcam talking-heads, screen captures.
  Predominantly 720p–1080p at 25–30 fps. Variable frame rate was expected;
  the measured corpus has none, and odd but stable rates are what arrive
  (§6.3).
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

**v1 is closing-only.** No approved opening asset exists, and the
maintainer's position is that opening sequences suit external video while
this tool is primarily internal, where a closing is the norm. The opening
path remains in the code against future assets but carries no user control:
the two-toggle end state — opening and closing, all four combinations — is
deferred, not withdrawn.

The closing sequence is **appended**. Whether there is one, and how it meets
the picture, is the user's choice: three controls on screen, which §4.3 maps
onto its three boundary modes.

### 4.2 Master assets, as delivered

The four-variant matrix this section originally specified **does not exist**.
What was delivered is one 3840×2160 25 fps master per style and colour,
rendered from After Effects as `qtrle`/`argb` — a codec no browser can decode
— opening with a 1.00 s premultiplied-alpha build over a 4.00 s opaque card.

**Four style variants are delivered, which this specification did not
anticipate:** Fade and Slide, each in Blue and White. **Fade Blue is the
default.** Who owns the set, and who approves any future variant, waits for
the app's handover to the maintainer's central department, which would then
own that governance (D12).

A build step converts the masters into what the browser actually fetches:

| Part | Format | Count | Why |
| --- | --- | --- | --- |
| Onset, 0.00–1.00 s | VP9 + alpha, WebM | 8 (style × colour × 1080p/2160p) | Alpha is needed only where the build composites |
| Tail, 1.00–5.00 s | H.264, MP4 | 4 (colour × 1080p/2160p) | Fade and Slide are byte-identical after the build, within a colour |

Twelve files, 0.74 MB in total. The tails are H.264 deliberately: the default
boundary mode uses the tail alone, so branding still works in a browser that
cannot decode transparency.

Frame-rate variants went with the matrix. One 25 fps master serves every
source, converted at runtime.

### 4.3 Conforming to the source, and the three boundary modes

1. Scale to **fit** the output frame, preserving the branding's aspect ratio.
2. Pad any remainder with the UoN brand background colour, Nottingham Blue
   `#10263B` (D1), so 4:3, 16:10 and vertical sources are handled correctly.
3. Convert to the output frame rate. With one master rate this always runs;
   source and branding frames pair **by timestamp, never by frame index**.
4. Re-encode the branding frames with the same encoder settings as the main
   content, so the whole file is a single consistent stream.

**Concatenation is not the whole operation.** The masters open with a 1.00 s
alpha build intended for compositing, so what sits *under* that build is an
editorial choice. Three modes, named with the conventional edit terms, where
`T` is the duration kept — the whole source unless it is trimmed (§9.1):

| Mode | Output length | Composites |
| --- | --- | --- |
| **hard cut** (default) | `T + 4.00` | nothing — the build is discarded |
| **over picture** | `T + 4.00` | the build over the closing second of content |
| **over freeze frame** | `T + 5.00` | the build over a held final *clean* frame |

`hard cut` is both the default and the fallback: it is the only mode needing
no alpha decode, so branding survives a browser without transparency support.
The freeze holds the last frame that resembles its neighbours, not simply the
last decoded one — a torn or black-flashed final frame would otherwise be
held full-screen for a second.

**On screen the modes are three controls, not one choice** (VH-90).
*Animation type* is Cut, Fade, Slide or None; *Animation onset* is Over
existing or Over generated freeze frame, and means something only for Fade
and Slide; *Colour* is Blue or White.

| Type | Onset | Result |
| --- | --- | --- |
| Cut | — | hard cut |
| Fade or Slide | Over existing | over picture |
| Fade or Slide | Over generated freeze frame | over freeze frame |
| None | — | no closing |

A control that cannot change the result — onset under Cut or None, colour
under None — is disabled, with its reason in visible text. One line beneath
the controls says what the current selection will do, taken from the same
mapping the job uses, so it cannot promise a different file.

**The alpha is premultiplied**, matted with black — measured on the masters,
not assumed. The composite is therefore

    out = brand + source × (1 − a)

and **not** the straight-alpha form, which multiplies by alpha twice and
leaves a dark fringe on every edge. Canvas `drawImage` cannot perform it: the
supported engines disagree over whether a decoded frame is premultiplied, so
the blend is done on the CPU, where the answer is ours rather than the
engine's.

### 4.4 Branding audio

**The branding is silent.** The delivered masters carry no audio track, and
the maintainer confirms this is deliberate — silent graphics are more native
to this material. The audio bed this section originally required, and the
rule that it be mastered at the target loudness, are **struck**.

Source audio therefore runs to `T` in every mode and the remainder of the
output is silence: 4.00 s for hard cut and over picture, 5.00 s for over
freeze frame.

**Critical (unchanged):** loudness analysis in Section 5 runs on the *source
content only*, never on the concatenated timeline. The original reason was a
music sting biasing the integrated measurement; the rule still holds, because
measuring appended silence would drag the gated figure the other way.

Apply a 100 ms audio fade at each branding/content boundary to prevent
discontinuity clicks. No picture fade is applied at those boundaries; one was
considered and cut (VH-25).

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

1. **Analysis pass** over source audio only — the part kept, when the video
   is trimmed (§9.1):
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
     pauses and room tone are never amplified. The freeze applies twice:
     to the raw correction, so a pause's enormous demand never enters the
     smoother, and to the finished envelope, because the smoothing window
     is centred and speech on either side would otherwise reach into the
     pause and move a gain that should be frozen. It holds the gain where
     it is rather than setting it, so it never makes a step the slew limit
     forbids.

   The slew limit and the pause freeze are what prevent pumping. A single
   fixed window applied unconditionally is what causes it.
4. **Gentle compression** — ratio 2:1, threshold −18 dBFS, attack 20 ms,
   release 200 ms, soft knee.
5. **Single linear gain** to land the *delivered file* on −16 LUFS
   integrated. One constant gain across the file: fully transparent, no
   dynamic artefacts. It is solved against the chain that actually runs,
   limiter included, and allows for what the AAC encode then costs in
   loudness — up to 0.38 LU on a corpus lecture, three quarters of the
   tolerance. That cost is measured per job: windows spread through the
   chain's own output are encoded at the job's exact audio settings,
   decoded and measured again.
6. **True-peak limiter** — 5 ms look-ahead, 50 ms release. −2.0 dBTP is
   the ceiling of the *file*, not of the limiter: AAC raises true peak
   after the limiter, so the limiter works at least 1.0 dB below it. When
   the same probe measures that job's encode overshooting by more than
   0.5 dB, the limiter holds the measured overshoot plus 0.5 dB below it
   instead, up to 3 dB.

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

Presented to the user by purpose, not by technique, under the question
"File size / quality" (VH-85). The headings below are the names on screen;
the code's ids, and older references in these documents, call them "best
quality" (`best`) and "smaller file" (`smaller`).

### 6.1 "Larger / better" — for EchoVideo or YouTube

For destinations that re-encode on ingest ("For EchoVideo or YouTube etc." on
screen). Preserves source resolution, aspect ratio, and frame rate.

| Setting | Value |
| --- | --- |
| Codec / container | H.264 High profile, MP4 |
| Resolution | Source, unchanged |
| Frame rate | Source, conformed to constant frame rate |
| Bitrate | Anchored to the source, between 0.03 and ~0.12 bits/pixel/frame (≈7.5 Mbps at 1080p30) — see below |
| Keyframe interval | 2 seconds |
| Audio | AAC-LC, 192 kbps, 48 kHz |

**Anchored to the source, never above the anchor** (VH-47). The figure is the
geometric mean of ~0.12 bits/pixel/frame and the source's own measured
density, held between 0.03 and 0.12. A figure from pixel count alone never
looked at the source, and asked a 1.0 Mbps Teams recording for four times its
bitrate. The headroom pays for the first encoder's artefacts, which the
second must spend bits preserving, so it should shrink as the source
approaches transparency, and the geometric mean does that. It is not capped
at the source: re-encoding at exactly the source bitrate is worse than the
source. Nor is it raised above the anchor for a pristine master. Tried at
0.18, that added up to 933 MB per file for +0.60 VMAF, and the destination
re-encodes on ingest anyway. So the figure can only fall. The floor keeps it
above what "Smaller / reduced" asks of slides.

### 6.2 "Smaller / reduced" — for messaging or email

For files that are sent and downloaded as they are, which students may
download directly: messaging and email ("For messaging or email etc." on
screen), OneDrive and SharePoint.

| Setting | Value |
| --- | --- |
| Codec / container | H.264 High profile, MP4 |
| Resolution | Preserved up to 1080p; downscaled to 1080p only if larger |
| Frame rate | Source, capped at 30 fps |
| Bitrate | Content-adaptive: ~1.5 Mbps for slides/screen, ~2.5 Mbps for camera/motion at 1080p30 — **never above the source's own video bitrate** |
| Keyframe interval | 2 seconds |
| Audio | AAC-LC, 128 kbps stereo / 96 kbps mono, 48 kHz |

**Resolution is preserved rather than reduced.** Slide and diagram
legibility depends far more on resolution than on bitrate; dropping 1080p
to 720p to save space is the single most damaging thing that could be done
to this content. Save the space in bitrate instead.

**Never exceed the source.** The figures above are targets for material that
needs them, not floors. A Teams recording carries 1.006 Mbps of video at
1920×1080; requesting 2.5 Mbps of it would make the output named "smaller"
larger than what went in. The requested bitrate is capped at the source's
measured video bitrate. Both outputs consult the source, for opposite
reasons: this one is *capped* at it, because it promises a smaller file;
"Larger / better" is *anchored* to it with headroom (§6.1), because its
destination re-encodes.

### 6.3 Frame-rate handling

Output is always conformed to **constant frame rate**, which is what ensures
MP4 compatibility, correct A/V sync and a clean branding conform. Two rules
govern the rate it is conformed *to*, and the real corpus revised both — the
measurements are in rationale §4.4.

**Measure the rate; never trust the declared one.** The rate is taken from
packet timestamps; the corpus's declared rates are wrong by enough to matter
(rationale §4.4).

**Do not round upward.** The original rule — nearest standard value from
24/25/30/50/60 — is withdrawn below the lowest standard value: a stable rate
under 24 fps is conformed to its own measured rate, since snapping it up
duplicates frames for no visible benefit.

Variable frame rate, which this specification once assumed common in screen
and meeting recordings, does not occur in the corpus; *odd but stable* is the
real pattern (rationale §4.4).

### 6.4 WebM

Not implemented in v1, not exposed in the UI. The Mediabunny muxer supports
WebM, so adding it later is a configuration change rather than a redesign —
which satisfies the brief's intent without carrying the cost now.

### 6.5 Colour and dynamic range

**Inherited from the browser, and measured.** The pipeline applies no
colour-space, transfer-characteristic or tone-map handling of its own: a
decoded frame is drawn through a canvas and encoded as 8-bit SDR H.264 (High
profile). Any conversion between the two is the browser's.

For the corpus, which is SDR screen and camera capture, no tone-mapping is
needed. For phone footage — every iPhone since the 12 records HDR 10-bit by
default, as do recent Android flagships — the feared failure did not
reproduce in Chrome: on the HDR samples tested, the browser tone-mapped as it
decoded and the output matched the source (VH-26, 2026-08-27; the samples,
the measure and its limits are in rationale §4.5). Phone sources therefore
run in Chrome, with the per-file decode check still standing. The behaviour
is correct by inheritance rather than by design, which is worth knowing: an
engine that does not tone-map would produce a washed-out or crushed picture
that still plays, the worst available failure, and the measurement is
repeated before another engine is certified.

## 7. Limits and device pre-flight

**No arbitrary file-size or duration cap.** Fixed numbers guessed in advance
are either needlessly restrictive on a fast machine or misleadingly
permissive on a slow one. Instead:

### 7.1 Calibration probe

Before processing, the app decodes and re-encodes **3 seconds of the actual
source file's video** — of the part kept, when it is trimmed — on the actual
device, measures throughput, and extrapolates the kept video and the
closing's frames from it. The sound is priced from pre-flight's own analysis
pass over the kept part, which is timed rather than sampled: audio planning,
processing and the output check are each a multiple of that pass (VH-100).
Together these are a real time estimate, which directly satisfies the brief's
requirement to "assess the selected file and the user's device before
processing begins."

A change to the trim re-runs the check over the newly kept part, because the
§5.4 warnings and the sound's presence follow from it. The re-check shows
progress and can be cancelled like the first. Its cost grows with the kept
audio; the bound on what it repeats is set from a timing on the longest
corpus recording, which has not yet been taken — until it is, this sentence
records the requirement and not the figure.

### 7.2 Pre-flight checks

- WebCodecs availability and H.264 encode support (`isConfigSupported`)
- Source resolution, duration, frame rate, codec, audio presence
- OPFS quota via `navigator.storage.estimate()` — require **2.5×** the
  estimated output size
- Device class (phone/tablet detection)
- Measured video throughput from the calibration probe, and a timed analysis
  pass over the kept audio

### 7.3 Thresholds

| Outcome | Condition | Behaviour |
| --- | --- | --- |
| **Proceed** | Estimate < 20 min, checks pass | Start, show estimate |
| **Warn** | Estimate 20–60 min | Show the estimate with its weight; allow continue (the keep-alive rule in §7.5 applies to every job) |
| **Block** | The browser lacks WebCodecs, H.264 encode, AAC encode (for a video with sound), a decoder for the source, or working storage; or there is not enough storage | Explain, with the recovery that fits the cause. Where the browser is the cause, recommend Chrome on a computer — a recommendation, not a guarantee — and say something else when the user is already in Chrome or cannot change browser |
| **Discourage** | Estimate > 60 min, or phone/tablet | Recommend a desktop; allow continue after acknowledgement |

### 7.4 Validated envelope for v1

Test and document performance across: 5 / 20 / 60 minutes, at 720p and
1080p, on a managed University laptop, a modern MacBook, and a low-spec
Windows device. **Published limits are set from these measurements, not
from assumption.**

### 7.5 Keeping the job alive

- Request a **Screen Wake Lock** during processing and while a save
  streams. The browser releases it whenever the tab is hidden and may refuse
  it, so it is re-acquired when the tab is shown again and never relied on.
- Say so, once, at the start of every job: keep this tab visible and the
  computer awake, and closing the tab ends the job. The notice is not tied to
  the estimate — a five-minute job dies with its tab as surely as a
  fifty-minute one.
- Register a `beforeunload` warning while a job is running, while a save
  streams, and while a finished video is unsaved.
- A finished, unsaved video is not kept past the tab, and the page says so
  before Create and beside the result (§9.1 step 5). The leave warning
  catches a reload; it cannot catch a crash, a discarded tab or a forced
  restart, which is why the sentence is there.
- Run all processing in a Web Worker so the UI stays responsive

## 8. Subtitles, captions and metadata

On screen these are called captions throughout (VH-86). "Subtitle" is the
container term, ISOBMFF's and WebVTT's, and survives in identifiers.

### 8.1 The timing problem

**Anything that moves the picture's timeline moves every caption with it.**
An opening animation shifts every later timestamp forward by its length, and
trimming the start (§9.1) shifts every one back. A caption track carried
unmodified against either is out of sync for its entire length, so carrying
one *requires* re-timing.

**Resolution:** re-timing cues is not "editing" the captions — the words
are untouched — and is mandatory for correctness. The brief's rule is
refined to: *never alter caption **content**; always re-time caption
**timing** to match the output — inserted branding and trimmed material
alike.*

**In v1 the rule has nothing to apply to.** No opening is inserted (§4.1),
an embedded caption track cannot be read, and no caption file is taken
(§8.3), so no separate caption track reaches the output. The rule binds
whichever of those returns first. Captions already drawn into the picture are
picture content: they survive, trimmed and overlaid like the rest of it.

### 8.2 Practical priority

This is lower risk than it appears: in the confirmed workflow, captions are
generated by **EchoVideo after upload**, not embedded in the staff member's
source file. Embedded subtitle tracks will be rare.

### 8.3 Behaviour

1. Detect subtitle, chapter, and metadata tracks during demux. Subtitle
   tracks are found by an ISOBMFF handler scan, which sees tracks the demuxer
   reports as absent.
2. ~~Offset every cue of a user-supplied sidecar `.vtt` by the opening
   duration and embed it.~~ **Withdrawn** (VH-86): no caption file is taken.
   With no opening its offset was always zero, so it embedded a file the
   user already had, and EchoVideo writes its own captions after upload
   (§8.2).
3. **Warn clearly before processing** when an embedded caption or chapter
   track is detected, since it will not be carried through — and say what
   follows: the new file carries no separate caption track, so its
   destination must supply captions (EchoVideo writes its own after upload,
   which still want checking; a file sent directly has no separate caption
   track unless the user adds one), and any other dropped track may have
   held an alternative.
4. Preserve language tags, track labels and creation metadata where the
   muxer supports them.

**Embedded subtitle tracks cannot be read.** Mediabunny does not expose
subtitle tracks at all, so the original steps 2 and 3 — re-embed where
preservable, export a sidecar where not — had no reachable branch: there is
nothing to re-embed, and nothing to export. Reading their samples would need a
bespoke MP4 box walker for `tx3g` / `wvtt` / `stpp`, which §8.2's rarity
finding does not justify. Detection is enough to tell the user honestly, and
with no caption file taken either (step 2), no separate caption track passes
through v1 — captions drawn into the picture do (§8.1).

## 9. User experience

### 9.1 Workflow

The screen is five numbered steps (VH-91, VH-96). Step 1 is there from the
start; steps 2–5 appear once a video has been read, and each holds a safe
default, so a user who changes nothing keeps the whole video and gets a
clean-cut blue closing and the larger file.

1. **Choose a video** — file picker or drag-and-drop. The app reads the file
   and says what it found, including anything that cannot be carried into
   the new file (§8.3).
2. **Trim** (optional) — a preview in the browser's own player, a start and
   an end handle on one track, "Start time" and "End time" fields, and
   "Set start here" / "Set end here" to take the preview's position. Left
   alone, the whole video is kept, and "Use the whole video" puts it back.
   The part kept must be at least 3 s. The preview plays the original — the
   sound not yet levelled, the closing not yet added — and the step says so.
3. **Closing branding** — animation type, onset and colour (§4.3).
4. **File size / quality** — "Larger / better" or "Smaller / reduced"
   (§6).
5. **Create** — the device check's verdict for this video, the part kept
   and the file size chosen, calibration probe included (§7); any
   audio-quality warnings (§5.4); then "Create the video", with named
   progress and a cancel button, and "Save the video" when it is done.

   The finished video carries a one-line summary of its job — file, part
   kept, output, closing as requested and as applied — fixed when the job
   ends and never relabelled by the controls for the next one; the question
   asked before it is discarded carries the same summary. It is not kept
   past the tab, and the page says so before Create and beside the result;
   it is kept until it is saved or discarded, and choosing another file
   resets the trim to the whole video, says so, and leaves the result
   alone. Starting again with it unsaved asks first — and a download handed
   to the browser is not yet a save for that purpose.

   After a save the page says only what it knows: the chosen location, or
   the browser's downloads (Files → Downloads on an iPhone) — a completed
   write distinguished from a download handed to the browser, which may
   still be finishing — and what next: check the file, upload it, or choose
   another video in step 1.

### 9.2 Principles

- No codec, bitrate, or loudness setting is exposed. Not in an "advanced"
  panel either — every exposed control is a decision a novice must make.
- Plain language throughout, at a lower-secondary reading level (WCAG
  3.1.5), checked in the quality gate over every string the page can show.
  Every term of art the page keeps and every abbreviation it uses has an
  in-place meaning, bar the exceptions §9.3 names one by one; where a fixed
  label fails the level, simpler supporting text sits beside it. Named stages ("Analysing audio", "Adding branding",
  "Encoding video") rather than a single opaque bar.
- Every error states what happened, whether the original file is affected
  (it never is), and what to do next — and sits where it belongs: an input
  error beside the control it concerns, and tied to it; a job or device
  failure in the step it affects, with its recovery.
- Persistent reassurance that the source file is never modified and never
  leaves the device.
- Cancel is always available and leaves no partial file.
- Help and feedback in one place on every state, blocked and running
  included. Feedback is prepared as an email the user sends from their own
  email app, seeing every word first; the details the app adds are named
  facts about the app and the job, never the media or its name, while the
  user's own message goes as written. A copy route stands in when email
  cannot. The page promises only the response the maintainer will honour.

### 9.3 Accessibility

**WCAG 2.2 AAA by default** (D6). Every applicable criterion is required;
each exception is recorded here with the criterion, the reason, the user
impact, the mitigation and the maintainer's decision, and an accepted
exception is a recorded limitation, never a passed criterion. The measurable
commitments, checked in the gate where a test can reach them and in §13's
walk where only a person can:

- Contrast 7:1 for text and 3:1 for interface components and meaningful
  graphics, in light, dark and forced colours; no colour-only meaning.
- Pointer targets 44 × 44 CSS px; a focus indicator meeting 2.4.13's area
  and change of contrast on every control; nothing sticky to obscure it.
- Full keyboard operation with no exception; no drag-only route.
- Text enlargement to 200% without horizontal scrolling and, separately,
  reflow at 320 CSS px; text spacing overrides survive; running text no
  wider than 80 characters (40 glyphs for CJK); line spacing 1.5 and
  paragraph spacing 1.5× that; no justification; the user's own foreground
  and background colours not overridden; reduced motion honoured.
- A lower-secondary reading level, and a meaning for every kept term (§9.2).
- Page and part language declared, and changed when the page is (VH-105).
- A live region announces what the user did not cause or cannot see —
  stage changes, outcomes, validation, consequential status — never a
  control's own result on the keystroke that produced it, which is read on
  demand. Routine progress announcements can be postponed by the user
  (2.2.4); if that control cannot be made plain enough for a novice, stage
  changes and the outcome alone are announced and that reading is recorded
  below as the exception.
- Focus is handed on, never taken: a control that removes or disables
  itself names its successor; a job's end moves focus only if the job
  displaced it.

Exemptions WCAG itself grants, noted so they are not mistaken for
exceptions: the native `<video>` controls are the user agent's (2.5.5); the
logo is a logotype (1.4.9).

Exceptions recorded:

- **The preview's content** (1.2.1–1.2.8, 2.3.1–2.3.2). *Reason:* it is the
  user's own recording, outside the page's control. *Impact:* its captions,
  descriptions and flash safety are whatever the recording has; a statement
  of partial conformance for third-party content acknowledges that
  non-conformance rather than excusing it. *Mitigation:* nothing autoplays,
  and the controls are the user agent's; any media the app itself supplied
  would need alternatives of its own. *Decision:* accepted, maintainer,
  2026-10-01.
- **Format identifiers** (3.1.4): none accepted yet. Each left unexpanded
  after being considered is added here by name, with the same four fields.

### 9.4 Mobile

Responsive and fully readable on phones and tablets. Processing is
**discouraged with a clear warning**, not blocked, on mobile devices.

## 10. Browser support

**The app is designed and built for Chrome, and says so** before anything is
chosen — and says what the load-time support check found, so a browser that
has passed is not turned away (VH-98, 2026-09-30; revised 2026-10-01,
VH-121). One sentence in three forms: "This app is designed and built for
Chrome, other browsers may not work" until the checks land; "…and this
browser has passed the checks for it" when every check passes; "…and this
browser has not passed all of its checks. The system check at the foot of
the page says what is missing" otherwise. The load-time check asks for a
secure context, WebCodecs, the H.264 encoder at a 1080p25 "Larger / better"
configuration, the AAC encoder in stereo and mono, the presence of the
private storage API (whether it can be written, and how much, is pre-flight's
question) and the worker; a refused AAC encoder is a warning rather than a block, since a
silent video still runs, and the sentence treats it as not passed.

| Browser | Status |
| --- | --- |
| Chrome (desktop) | Supported — the browser the app is built and checked in |
| Edge (desktop), Safari (macOS/iOS) 26+ | Not certified. Not refused: runs if the support check passes, and the page says so when it does |
| Firefox (desktop) | Refused for any video with sound — it cannot create AAC audio (VH-49). A silent video runs |
| Safari below 26 | Not supported — clear message |
| Firefox on Android | Not supported — WebCodecs not exposed |
| Any browser without WebCodecs | Not supported — clear message |

No browser is refused by name. The support check tests what the browser can
do, at load and again against the specific source file, since codec support
is per-configuration. Every block it raises fits its remedy to its cause;
where the browser is the cause it recommends Chrome on a computer, as a
recommendation rather than a guarantee, and says something else to a user
who is already there or cannot change browser.

## 11. Non-functional requirements

- **Privacy:** no media leaves the device. No analytics carrying filenames
  or media characteristics. Verifiable by inspecting network activity. The
  one outbound route is feedback (§9.2): an email the user sends from their
  own app, whose app-added details are named, allow-listed facts they see
  first.
- **Deployment:** static files only. No server-side processing, no build
  requirement beyond a bundler, no special response headers.
- **Licensing:** all dependencies permissive (MPL-2.0 or better). No GPL
  components shipped. No codec patent obligation assumed by UoN.
- **Offline:** must work after first load with no network, except for
  branding assets, which are cached.

## 12. Out of scope for v1

- Cutting from the middle, joining files, reordering, or any other editing
  of picture content. Trimming the start and the end is in scope (§9.1).
- Creating, editing or transcribing captions
- Batch processing of multiple files
- WebM output (implemented in the muxer layer, not exposed)
- Pumping detection on pre-existing audio processing
- Noise reduction or de-reverberation
- Custom or per-department branding variants

## 13. Acceptance criteria

v1 is complete when:

1. A 1080p source with the closing animation produces a valid MP4 that plays
   in VLC, QuickTime, Chrome, and after upload to EchoVideo. (Originally
   "both animations"; v1 is closing-only per §4.1.)
2. Measured integrated loudness of the output content is **−16 ±0.5 LUFS**
   and true peak never exceeds −2.0 dBTP, across the full test corpus. On a
   trimmed job the content measured is the part kept, levelled on that part
   alone.
3. The loudness meter matches **EBU Tech 3341** reference values within
   ±0.1 LU.
4. No audible pumping on a deliberately variable-level test recording,
   confirmed by listening and by short-term loudness plot.
5. Slide text in the "Smaller / reduced" output remains legible at 100% zoom
   against the source.
6. A screen recording on a non-standard frame-rate grid — 16.000 or
   30.303 fps — produces output with correct A/V sync across the full
   duration. (Originally "variable-frame-rate"; no corpus file classifies as
   variable, so the criterion tests the defect that actually arrives.) A
   trimmed job holds the same sync from its cut, which moves by at most one
   frame.
7. Every pre-flight block and warning has been triggered deliberately and
   reads clearly to a non-technical reader.
8. Cancelling mid-process leaves no partial file and no orphaned OPFS data.
9. Network inspection during a full job shows zero media egress.
10. The interface passes a person's walk of every state, Choose to Save and
    the error, cancel, retry, kept-result and feedback states, keyboard-only,
    with NVDA + Chrome and VoiceOver + Safari, in a Windows contrast theme,
    at 200% enlargement, at 320 px and under text-spacing overrides, in each
    language the page offers.
    Every applicable WCAG 2.2 criterion has evidence or a limitation recorded
    under §9.3; the phone and speech-input checks are each completed or
    deferred in writing. The same walk is the wider GUI review, beyond
    WCAG: design and layout against Carbon's productive patterns, clarity of
    language and of process — does a first-time user know what to do next at
    every step — the word count, and distraction, with what fails filed as
    work.

### Test corpus

Representative real material, per the original brief: webcam recordings,
PowerPoint presentations, screen recordings with fine text, talking heads,
mixed speech and music, and — added — a Teams recording, a 4:3 legacy
recording, and a recording with badly inconsistent levels.

Twenty-two files were supplied and measured, and five phone recordings were
taken for colour (§6.5). The corpus contains no true variable-frame-rate
source, no phone footage measured for levels, and nothing approaching the
60-minute case §7.4 publishes limits for; those remain gaps. Criterion 10's
assistive-technology set — NVDA, VoiceOver, a Windows contrast theme, real
phones, speech input — is the maintainer's to arrange (VH-M4).
