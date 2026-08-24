# Technical Rationale

Why the decisions in [`01-specification.md`](01-specification.md) were made,
and the evidence behind them. Written so a future reader — or a future
agent — does not re-open settled questions without new information.

---

## 1. Why not FFmpeg/WebAssembly

ffmpeg.wasm is the obvious first choice for browser video processing and was
the assumption in the original brief. It fails this project on four
independent counts, any one of which would be disqualifying.

### 1.1 It cannot produce the required file sizes

ffmpeg.wasm's virtual filesystem (MEMFS) holds files in WebAssembly linear
memory. The practical ceiling is around 2 GB, and an `ArrayBuffer` larger
than 2 GB cannot be created from JavaScript at all.

`WORKERFS` mitigates this for **input** — it mounts a `File` object and
reads lazily, and has been used with files well over 10 GB. But **writing
still happens in memory.** A one-hour source-matched output at 8 Mbps is
roughly 3.6 GB, which cannot be written.

The brief's 4 GB / one-hour target is therefore unreachable on this
architecture, not merely difficult.

### 1.2 The licensing conflicts with the brief's own constraint

The brief requires dependencies "with licences that permit institutional
use, modification and redistribution" and asks to avoid "restrictive
processing components".

FFmpeg itself is LGPL-2.1, which would be fine. But H.264 **encoding**
requires x264, which is GPL and requires building FFmpeg with
`--enable-gpl` — at which point the entire binary becomes GPL. Separately,
x264's own licensing page states that use of x264 "will likely require
obtaining a patent license from MPEG-LA" (now Via LA) for the AVC pool.

Distributing a GPL H.264 encoder from a University web server, to produce
H.264 files, is a question that would need Legal Services to answer.
WebCodecs removes the question entirely: the encoder is the browser's, and
the patent licence is the browser vendor's.

### 1.3 It needs response headers a static University host may not allow

Multithreaded ffmpeg.wasm requires `SharedArrayBuffer`, which browsers only
expose to cross-origin-isolated pages. That requires two response headers on
every page load:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

On a static host that does not permit custom headers, the usual workaround
is a service worker acting as a proxy to inject them — which does not apply
on first load, complicates caching, and breaks third-party embeds. The
ffmpeg.wasm project's own documentation describes the multithreaded build as
unstable.

Single-threaded ffmpeg.wasm avoids this but is far slower again.

### 1.4 It cannot use hardware encoders

WebAssembly is sandboxed and has no path to the GPU or a dedicated media
engine. Every frame is encoded in software, in a single thread unless
cross-origin isolation is in place. For a one-hour 1080p video this is the
difference between minutes and hours.

## 2. Why WebCodecs

WebCodecs exposes the browser's own hardware-accelerated encoders and
decoders as a streaming API. Frames flow through one at a time, so memory
use is bounded by a few frames rather than by file size — which is what
makes long files possible.

It resolves all four objections above: no memory ceiling, no GPL or patent
exposure, no special headers, hardware acceleration.

### 2.1 The cost

Browser support is narrower. As of 2026: Chrome/Edge since 94, Firefox
desktop since 130 (not Android), and Safari reached full parity — including
audio — only in **Safari 26**. Coverage sits around 95% of active browsers,
with the shortfall almost entirely older Safari.

This is a real exclusion and is stated plainly in the spec rather than
hidden. The mitigation is a clear, non-technical message naming a browser
that will work — which is a better outcome than an app that appears to work
and then fails after forty minutes of processing.

### 2.2 Why Mediabunny

WebCodecs handles codecs but **not containers** — it will not read or write
an MP4 file. That layer must come from somewhere.

[Mediabunny](https://mediabunny.dev/) is pure TypeScript, zero-dependency,
tree-shakable, and built directly on WebCodecs. It is **MPL-2.0**, which
permits institutional use, modification and redistribution, with copyleft
scoped to modified Mediabunny files only — comfortably inside the brief's
constraint.

The alternative, mp4box.js, handles demuxing well but is a heavier fit for
the muxing side.

## 3. Audio: why the chain is shaped this way

### 3.1 Why −16 LUFS

−16 LUFS is the established target for speech-led programme material and
matches podcast delivery practice. It is comfortably audible on laptop and
phone speakers, which is where this content is consumed.

The alternatives were considered and rejected:

- **−23 LUFS (EBU R128)** is a broadcast target, calibrated for cinema-like
  listening environments. It is far too quiet for a student watching on a
  laptop in a shared space.
- **−14 LUFS** matches YouTube and Spotify, but is loud for a full hour of
  continuous speech and leaves less peak headroom.

Since EchoVideo — the primary destination — does not loudness-normalise on
ingest, our target *is* the delivered loudness. That makes getting it right
more important here than it would be for a YouTube-only workflow.

### 3.2 Why −2.0 dBTP rather than the brief's −3 dBTP

Loudness is set by the LUFS target, not by the peak ceiling, so a lower
ceiling does not make the video quieter — it makes the **limiter work
harder**. Speech normalised to −16 LUFS has a peak-to-loudness ratio of
roughly 10–14 dB, putting natural peaks around −2 to −6 dBTP. A −3 dBTP
ceiling would therefore engage the limiter on a meaningful proportion of
speech peaks for no benefit.

−2.0 dBTP still leaves roughly 1 dB of margin for the lossy-to-lossy
overshoot introduced when EchoVideo or YouTube re-encodes, while touching
the speech less. −1 dBTP, the streaming-platform norm, would not leave
enough for a double-encode chain.

### 3.3 What "windowed loudness normalisation" should actually mean

The brief's instinct is right and its concern about pumping is precisely
correct. The trap is that the obvious implementation *causes* the problem it
is trying to avoid.

Applying a moving-window loudness correction unconditionally, with a short
window and no rate limit, is a description of an aggressive automatic gain
control — audible pumping, amplified room tone in pauses, unnatural speech
dynamics. This is exactly what FFmpeg's `loudnorm` filter does in its
one-pass dynamic mode, and it is why that mode has a poor reputation.

Four properties turn the same idea into a transparent one, and all four are
in the spec:

1. **Conditional application.** Measure LRA first; if the recording is
   already consistent (LRA ≤ 9 LU), do nothing. Most single-speaker
   recordings fall here. Processing that is not needed is processing that
   can only do harm.
2. **A long window (15 s).** Long enough to track a speaker moving away
   from the microphone or a quiet section, far too slow to respond to
   individual syllables.
3. **A slew-rate limit (1 dB/s).** The single most important element. Even
   if the envelope demands a fast change, it cannot deliver one — and
   audible pumping is by definition a fast level change.
4. **A pause freeze (below −45 LUFS short-term).** Prevents the classic
   failure of turning silence up into a wash of room tone and air
   conditioning.

The final level match is then a **single constant gain** across the whole
file — the transparent equivalent of `loudnorm`'s two-pass linear mode —
so the macro-leveller only ever handles genuine long-term drift.

### 3.4 Why the meter must be validated against EBU Tech 3341

The loudness meter is bespoke JavaScript, because WebCodecs has no filter
graph and pulling in a wasm audio build would reintroduce the licensing
question for no real gain. Implementing BS.1770-4 is tractable —
K-weighting is two biquad filters, then gated mean-square blocks — but it
is also easy to get subtly wrong in ways that are invisible until real
content is mis-levelled.

The EBU publishes Tech 3341 compliance signals with known expected values.
Checking against them converts "the meter looks about right" into a pass/fail
test, which is why it appears in the acceptance criteria rather than as a
suggestion.

## 4. Video: two decisions worth defending

### 4.1 Preserve resolution in the compressed output

The instinct when shrinking a file is to reduce resolution. For this content
that is the wrong lever.

The material is dominated by PowerPoint slides, diagrams, and screen
recordings — high-contrast static detail. Legibility of small text is
governed almost entirely by resolution; halving it to 720p makes body text
on a slide unreadable regardless of bitrate. Static content, meanwhile,
compresses extremely efficiently, because successive frames are nearly
identical.

So the compressed preset holds resolution and takes the saving from bitrate,
where static slides barely notice it. Resolution is only reduced above
1080p, where there is genuine surplus.

### 4.2 Why constant frame rate output

Teams, Zoom, OBS and PowerPoint recordings are commonly variable frame rate.
VFR causes three problems here: it makes branding conform ambiguous, it
degrades A/V sync in some players, and it interacts badly with MP4 edit
lists.

Conforming to CFR at the source's average rate costs nothing perceptually
for this content and removes an entire class of sync bugs.

### 4.3 Why not stream-copy the source video

An attractive optimisation for the "best quality" output is to leave the
source video stream untouched and only re-encode the short branding
segments, concatenating the result. The main video would never be
re-encoded: fast, and generationally lossless.

It was rejected for v1 because it requires byte-exact codec parameter
matching (profile, level, SPS/PPS, pixel format, timebase) between branding
and source, and it degrades badly on VFR sources — which, per 4.2, are
common here. The failure mode is silent A/V drift discovered after
publication.

It remains a legitimate v2 optimisation, gated behind a strict "is this
source safe to copy" check with automatic fallback to full re-encode.

## 5. Why calibrate instead of setting a fixed limit

The brief proposed ~1 hour and ~4 GB, flagged as arbitrary — which they
were, and which is fine as a starting position.

The problem with any fixed number is that the binding constraint is not file
size, it is **time on this particular machine**. Once WebCodecs streams to
OPFS, memory stops being the limit; throughput takes over, and throughput
varies by an order of magnitude between a managed Windows laptop and an
Apple-silicon MacBook. A single limit is simultaneously too strict for one
and too permissive for the other.

Encoding three seconds of the user's actual file on the user's actual device
costs a second or two and produces a real estimate for that specific job.
It also satisfies the brief's own requirement to assess file and device
before processing, and it turns the warning thresholds in Section 7.3 from
guesses into measurements.

## 6. The subtitle timing problem

Worth restating because it is the one genuine internal contradiction in the
original brief.

The brief requires that subtitles be preserved and never altered. It also
requires an opening animation. These cannot both hold literally: inserting
five seconds at the head of a video shifts every subsequent frame, and a
caption track that is not shifted with it is five seconds early for the
entire duration — visibly broken, and worse than having no captions.

The resolution in the spec — never alter caption *content*, always offset
caption *timing* — preserves the intent of the rule while making it
achievable.

In practice the exposure is small, because in the confirmed workflow
captions are generated by EchoVideo after upload rather than embedded in
the source file. But it must be handled correctly for the cases where a
staff member has embedded a track, and it must be warned about clearly when
preservation is not possible.

---

## Sources

- [ffmpeg.wasm — 4GB memory support for large files (#876)](https://github.com/ffmpegwasm/ffmpeg.wasm/issues/876)
- [ffmpeg.wasm — Has anyone managed to work with large files? (#516)](https://github.com/ffmpegwasm/ffmpeg.wasm/discussions/516)
- [Emscripten — MEMFS does not support files >2gb (#20245)](https://github.com/emscripten-core/emscripten/issues/20245)
- [ffmpeg.wasm — SharedArrayBuffer / cross-origin isolation (#234)](https://github.com/ffmpegwasm/ffmpeg.wasm/issues/234)
- [x264 licensing](https://x264.org/licensing/)
- [ffmpeg.wasm-core LICENSE](https://github.com/ffmpegwasm/ffmpeg.wasm-core/blob/n4.3.1-wasm/LICENSE.md)
- [Mediabunny](https://mediabunny.dev/) and [source](https://github.com/Vanilagy/mediabunny)
- [WebCodecs vs ffmpeg.wasm](https://burnsub.com/blog/webcodecs-vs-ffmpeg-wasm/)
- [WebCodecs browser support](https://www.testmuai.com/learning-hub/webcodecs-browser-support/)
- [MDN — File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)
- [web.dev — The origin private file system](https://web.dev/articles/origin-private-file-system)
- [web.dev — WebAssembly threads](https://web.dev/articles/webassembly-threads)
