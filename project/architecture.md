# Architecture — UoN Video Helper

Rationale for the settled choices below lives in
[`docs/02-technical-rationale.md`](../docs/02-technical-rationale.md).
Do not re-open WebCodecs, Mediabunny, OPFS, the loudness targets, or the
resolution-preserving compression without new evidence.

## Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Language | **TypeScript** (strict) | Mediabunny ships full types; the DSP carries numeric invariants that types catch cheaply; the `check` gate gets a real type check for free. |
| Build / dev server | **Vite** | First-class Web Worker bundling (`new Worker(new URL(...), { type: 'module' })`), static output, no config for what we need. |
| Tests | **Vitest** | Same toolchain as Vite. The EBU Tech 3341 harness is pure maths on `Float32Array` and runs in Node with no browser. |
| Video/audio codec | **WebCodecs** (`VideoDecoder`/`VideoEncoder`/`AudioDecoder`/`AudioEncoder`) | Browser built-in. Streams frame-by-frame, reaches hardware encoders, no GPL/patent exposure, no COOP/COEP headers. |
| Container demux/mux | **Mediabunny** 1.55.x, MPL-2.0 | The only runtime dependency. WebCodecs handles codecs but not containers. Zero runtime deps of its own (`@types/*` only). |
| Loudness DSP | **Bespoke TypeScript** in a Web Worker | No filter graph exists in a WebCodecs architecture, and a wasm audio build would reintroduce the licensing question for no gain. |
| Working storage | **OPFS**, written through Mediabunny's `StreamTarget` | `StreamTarget` takes a `WritableStream<{type,data,position}>` — positioned, seekable writes with backpressure that propagates back and throttles the encoders. An OPFS file handle's `createWritable()` produces exactly that shape, so no bespoke target is needed. |
| Save to disk | **File System Access API**, blob download fallback | Lets a multi-GB result stream straight to the user's chosen location. |
| UI | **Vanilla TS + our own components** | Carbon productive design language implemented in project code — never the Carbon packages. See `UI-STANDARDS.md`. |

No framework, no CSS library, no polyfills. If the browser cannot do it
natively, the browser is not supported (spec §10) and says so plainly.

## The shape of a job

The single most important structural fact: **the whole job runs in one
Web Worker.** The main thread renders UI and nothing else. A one-hour
encode that stutters the UI is indistinguishable from a hung tab, and
spec §7.5 requires the page stay responsive throughout.

The second most important: **audio is inherently two-pass, video is
one-pass.** The single linear gain in spec §5.2 step 5 cannot be known
until integrated loudness over the *whole* file has been measured. So:

```text
Pass 1  decode audio only ──▶ K-weighting ──▶ integrated / short-term / LRA / true peak
        (fast — audio-only decode of an hour takes seconds)
                                        │
                                        ▼
                            measurements + warnings + the gain figure
                                        │
Pass 2  decode video ─▶ conform (CFR, scale) ─▶ VideoEncoder ─┐
        decode audio ─▶ chain (§5.2 steps 2–6) ─▶ AudioEncoder┤─▶ Mediabunny Output ─▶ OPFS
        branding ────▶ re-encode to match, audio bed UNPROCESSED ┘
```

The third: **loudness is measured on source content only, never on the
concatenated timeline** (spec §4.4). The branding audio bed is mastered at
target and bypasses the chain entirely. Architecturally the audio path has
two lanes that meet only at the muxer.

## Project structure

```text
src/
  main.ts                  entry — the whole UI, worker client, job lifecycle
  config/                  ALL tuneable values. No magic numbers elsewhere.
    presets.ts             the two output presets, output shape, AVC level (§6.1, §6.2)
    audio.ts               loudness targets + every chain constant (§5.1, §5.2)
    branding.ts            durations (D2), closing defaults, controls -> job mapping (§4.2)
    thresholds.ts          pre-flight bands (§7.3), probe length, worker limits
  core/
    logger.ts              structured logger + bounded ring buffer
    diagnostics.ts         global error/unhandledrejection capture, redacted bundle
    redact.ts              what never leaves the machine, applied to the bundle
    egress.ts              per-realm watch on what leaves; the worker runs its own
    keep-awake.ts          screen wake lock + the unload-warning rule (§7.5)
    watchdog.ts            silence-based timeouts for worker requests
    version.ts             product version and build identity
  media/
    inspect.ts             Mediabunny demux → SourceReport, on the PRIMARY tracks
    isobmff.ts             handler-type scan for the tracks Mediabunny cannot see
    capability.ts          WebCodecs + canEncode* + OPFS quota + device class
    probe.ts               3-second calibration probe → throughput + estimate
    preflight.ts           the §7.3 verdict, pure
    framerate.ts           VFR verdict and conform cost
    conform.ts             CFR conform, scale-to-fit, pad maths
    pipeline.ts            pass 1 / pass 2 orchestration, both feed lanes
    audio-plan.ts          the gain solve and the content audio processor
    codec-probe.ts         what the AAC encode costs this job: loudness and true peak
    content-class.ts       slides or camera, from spread windows, for the smaller output
    audio-frames.ts        planar/interleaved conversion at the Mediabunny edge
    encoding.ts            the encoder configs Mediabunny is given
    encoder-delay.ts       measures the AAC encoder's own delay, and compensates
    branding.ts            variant selection, fetch, boundary fades, timeline
    composite.ts           the build over picture, for the overlay modes
    freeze.ts              picks the held final frame for `over-freeze`
    opfs.ts                job-scoped working store, Web Locks, orphan sweep
    save.ts                File System Access API, blob fallback, source guard
    output-verification.ts the §13 criterion 2 postcondition, pure
  audio/
    kweighting.ts          BS.1770-4 pre-filter + RLB biquads
    biquad.ts              the second-order section both filters are built from
    loudness.ts            gated integrated, short-term, LRA
    truepeak.ts            4x oversampled true peak, drained at end of stream
    analyse.ts             loudness + true peak over one traversal
    highpass.ts            60 Hz
    macrolevel.ts          conditional envelope, 15 s smoothing, slew, pause freeze
    compressor.ts          2:1, -18 dBFS, 20 ms / 200 ms, soft knee
    limiter.ts             5 ms look-ahead, 50 ms release, working ceiling
    chain.ts               the ordered chain, assembled
    gain-solve.ts          §5.2 step 5's gain, solved against the chain that limits
    warnings.ts            the §5.4 rows, plus what production cost the user
  workers/
    job.worker.ts          the whole job
    cancellation.ts        the registry that makes a request cancellable
    protocol.ts            typed messages across the boundary
  ui/
    source-panel.ts        what the file is, and what cannot be carried over
    preflight-panel.ts     the verdict, in plain language
    warning-text.ts        one sentence per warning code
    system-check.ts        the System check summary line, pure
    closing-choice.ts      the closing controls' result line and disabled reasons
    brand-assets.ts        installs the logo and heading font where their files exist
    format.ts             durations, sizes, rates
  acceptance/              the §13 harness. Dev-only; not built.
  spike/                   maintainer probes. Dev-only; not built.
  styles/
    tokens.brand.css       UoN palette, font stacks, and the colour roles assigned from them
    tokens.carbon.css      Carbon structural tokens (spacing, type, motion, status)
  assets/                  brand files that are wanted and optional at build time
test/
  ebu3341/                 signal synthesis + published expected values
  helpers/                 shared signal generators
samples/                   YOUR real recordings. Gitignored. Never committed.
```

## Key modules

| Module | Responsibility |
| --- | --- |
| `media/inspect.ts` | Turn a `File` into a `SourceReport`: resolution, duration, codecs, rotation, audio presence, and a VFR verdict from `computeFrameRateMetrics()`. |
| `media/capability.ts` | Answer "can this device do this job?" — `canEncodeVideo()` for the exact target config, `navigator.storage.estimate()` against 2.5x the projected output, device class. |
| `media/probe.ts` | Decode+encode 3 s of the *actual* file, measure throughput, extrapolate. Turns spec §7.3's thresholds from guesses into measurements. The audio stages are priced from pre-flight's own timed analysis pass instead (VH-100). |
| `media/conform.ts` | All the geometry and timing maths: CFR timestamp generation at the rounded average rate, scale-to-fit, pad rectangle. Pure functions, heavily unit-tested. |
| `media/opfs.ts` | The working store: a job-scoped OPFS directory, `createWritable()` handles wrapped for `StreamTarget`, and the orphan sweep at app start. Output lands in OPFS first and is copied to the user's destination only on success — writing straight to their chosen file would leave a partial on cancel, breaking spec §13 criterion 8. |
| `audio/loudness.ts` | The meter. Everything downstream trusts it, so it is built and validated first. |
| `audio/chain.ts` | Assembles steps 2-6 in order and applies them to a stream of `Float32Array` blocks. Each step is a separate, independently testable module. |
| `media/branding.ts` | Picks the master variant nearest the output frame rate and resolution class, fetches it, and owns the boundary fades and the output timeline. |
| `media/save.ts` | Streams the result to the user's chosen location, and refuses a destination that IS the source (VH-56). |
| `audio/gain-solve.ts` | Solves spec §5.2 step 5's gain against the chain that limits, over an injected measurement, so the harness and the product cannot diverge (VH-50). |
| `workers/cancellation.ts` | The registry that makes a request cancellable from before its first await (VH-57). |
| `workers/job.worker.ts` | Owns the job lifecycle: pass 1, pass 2, progress reporting, cancellation, OPFS cleanup. |

## Communication patterns

- **Across the worker boundary** — a typed request/response + progress-event
  protocol in `workers/protocol.ts`. The main thread sends `inspect`,
  `preflight`, `process`, `cancel`, `discard`, `lease` and `egress`, and
  receives `inspected`, `preflighted`, `stage`, `processed`, `cancelled`,
  `discarded`, `failed` and `uncaught`. Cancellation is an `AbortController`
  registered before the handler's first await (`workers/cancellation.ts`) and
  reached by a `cancel` message. No shared mutable state; transfer
  `ArrayBuffer`s, never copy.
- **Within the worker** — direct imports and plain function composition.
  The pipeline is a pipeline; it does not need an event bus.
- **Within the main thread** — `main.ts` holds the state directly: a
  selection epoch, the in-flight flags, and the retained result. There is no
  store and no bus, and adding either is a decision rather than a default —
  the surface is one screen with one job on it.

Exception worth naming: the progress path is deliberately one-way and
lossy. Dropping a progress frame is fine; dropping a `warning` or `error`
is not, so those are acknowledged.

## Dependency policy

**One runtime dependency: `mediabunny`.** That is the whole list, and it is
authorised by appearing here. Adding any other runtime dependency trips the
stop-and-ask rule in `AGENTS.md` — stop and ask, do not install.

Dev dependencies (`vite`, `vitest`, `typescript`, lint/format, the
markdownlint pair) are tooling, ship nothing to the user, and do not count
against that rule — but keep the set small and boring.

Licence floor: MPL-2.0 or more permissive. No GPL component ships, ever —
avoiding that exposure is one of the reasons this architecture exists.

## Configuration strategy

Every tuneable value lives in `src/config/`. Nothing in `media/`, `audio/`
or `ui/` may hard-code a threshold, target, duration, bitrate or colour.
This is not tidiness — it is how the four open decisions stay cheap:

| Open decision | Where it lands | Cost to answer |
| --- | --- | --- |
| D1 brand colour | `styles/tokens.brand.css`, one custom property | One line |
| D2 branding durations | `config/branding.ts` | One line each |
| D3 boundary treatment | `config/audio.ts` (fade length) + `audio/chain.ts` | One constant |
| D8 published limits | `config/thresholds.ts` | Three numbers |

Design tokens follow `UI-STANDARDS.md`: two systems side by side, never
collapsed into one. The brand file owns colour and typeface, including the
values of the colour roles; the Carbon file owns shape and status colour.

## Dev workflow

| Action | Command | Result |
| --- | --- | --- |
| Install | `npm install` | |
| Dev | `npm run dev` | <http://localhost:5173> |
| Build | `npm run build` | static files in `dist/` |
| Preview build | `npm run preview` | <http://localhost:4173> |
| Test | `npm test` | Vitest |
| Quality gate | `npm run check` | non-mutating: types, lint, tests, build, docs |

Full detail — runtime lifecycle, diagnostics, the gate's contents, version
identity, security baseline — is in `DEV-INFRASTRUCTURE.md`.

## Known constraints in the dependency

Verified against Mediabunny 1.55.2, not assumed:

- **Subtitle tracks are invisible, not merely unreadable.** Verified by
  round-trip: an MP4 written by Mediabunny *with* a WebVTT subtitle track
  reads back as `getTracks().length === 0`. `Input` exposes only
  `getTracks`, `getVideoTracks`, `getAudioTracks` and the two
  `getPrimary*` variants — there is no subtitle getter at all.
  **Consequence:** detecting an embedded subtitle or chapter track needs
  our own minimal ISOBMFF scan — walk `moov` → `trak` → `mdia` → `hdlr`
  and read the handler type (`sbtl` / `subt` / `text`), plus `tref`/`chap`
  for chapters. Handler types only; no sample parsing. That scan lives in
  `media/isobmff.ts` and is the whole of VH-9's detection half.
- **Subtitle writing works**, and the app no longer uses it (VH-86 withdrew
  the caption file field). `addSubtitleTrack` +
  `TextSubtitleSource('webvtt')`; `Mp4OutputFormat.getSupportedSubtitleCodecs()`
  returns `['webvtt']`. Verified by writing a valid subtitle-bearing MP4.
- **Metadata tags round-trip.** `Input.getMetadataTags()` /
  `Output.setMetadataTags()` both exist.
- **Metadata tags read and write** across MP4/QuickTime, so file-level
  metadata carry-through is available.
- **Chapters have no documented support** either direction.
- **`fastStart` must always be set explicitly.** The type is
  `false | 'in-memory' | 'reserve' | 'fragmented'`, and the docs state
  that when it is *not defined* Mediabunny picks `false` **or
  `'in-memory'`** automatically from the target type. `'in-memory'` holds
  every chunk until finalize — the exact ceiling this architecture exists
  to escape — so leaving the field undefined is a latent multi-gigabyte
  bug. Always name the value. `false` puts the moov at the end (fine for
  destinations that re-encode); `'reserve'` places it at the front with
  bounded memory but needs `maximumPacketCount` up front, which CFR
  conform makes computable.

## Carried from the canon AGENTS.md

The sections below were rules of the canon contract at 029ae1e; v3 keeps
them here as architecture, routed by the rules file's By-task table for
every code change, verbatim.

### Core data model

Four objects carry the job. They are plain data, created once and passed
down — never mutated in place by a consumer.

| Object | Created by | Holds |
| --- | --- | --- |
| `SourceReport` | `media/inspect.ts` | What the file *is*: dimensions, rotation, duration, average frame rate, VFR verdict, codecs, audio presence, non-A/V track counts. |
| `Capability` | `media/capability.ts` + `probe.ts` | What this *device* can do: encode support for the exact target config, OPFS headroom, device class, measured throughput, time estimate. |
| `LoudnessReport` | `audio/loudness.ts` | Integrated LUFS, short-term curve, LRA, true peak — measured on **source content only**, and only the kept part of it when trimmed. |
| `JobSpec` | the UI | What the user asked for: preset, opening on/off, closing on/off and the closing's mode, style and colour, and the kept range when the ends are trimmed — plus the picture class pre-flight measured, handed back so the job is encoded as its verdict said. The only object that crosses into the worker as a command. |

Forbidden: a single mutable "job state" blob that every module writes
into. The stages are a pipeline, and each stage's output is the next
stage's input.

### Subsystem: the loudness meter

Implements ITU-R BS.1770-4. K-weighting is a two-stage biquad (a shelving
pre-filter then an RLB high-pass), followed by mean-square blocks with
absolute and relative gating. Short-term loudness uses a 3 s window; LRA
comes from the 10th–95th percentile of the gated short-term distribution.
True peak is 4x oversampled.

The design contract: **every function is pure, operates on
`Float32Array`, and needs no browser API.** That is what lets the whole
meter be validated in Node against synthesised EBU Tech 3341 signals. Do
not introduce a dependency on `AudioContext`, `WebCodecs`, or the DOM
anywhere in `audio/`.

### Subsystem: the media pipeline

Two passes, and the reason is structural rather than stylistic: the single
linear gain in spec §5.2 step 5 cannot be known until integrated loudness
over the whole file has been measured.

1. **Pass 1** — decode audio only, measure, derive warnings and the gain.
2. **Pass 2** — decode video and audio, conform to CFR, run the audio
   chain with the known gain, encode both, mux to OPFS.

Branding is a third lane that joins at the muxer: re-encoded to match the
content's settings, with its audio bed passed through untouched.

The design contract: **the pipeline never holds more than a bounded window
of frames.** Backpressure is respected; if a stage cannot keep up, the
stage before it waits.

### Communication pattern

No global event bus. Three surfaces, each with its own rule:

- **Worker boundary** — a typed message protocol in
  `src/workers/protocol.ts`. Main thread sends `start` and `cancel`; the
  worker emits `stage`, `progress`, `warning`, `done`, `error`. Progress
  is fire-and-forget and may be dropped; `warning` and `error` are
  acknowledged and must not be.
- **Inside the worker** — direct imports and function composition. A
  pipeline does not need pub-sub.
- **Main thread** — an observable store (`core/store.ts`) for app state,
  and a small typed emitter (`core/bus.ts`) for cross-cutting notices.
  Views subscribe to the store; they never call into each other.

### OPFS working-store checklist

OPFS is scratch space, not a database — but it outlives a reload, so it
needs discipline. Every job that writes to it must:

1. Write under a single job-scoped directory named for the job id **and a
   per-tab session prefix**. OPFS is ORIGIN-scoped: without the prefix two
   tabs both open `job-1` and write into the same directory (VH-35).
2. Register cleanup on **all** exit paths: success, error, and cancel.
3. Close every writable stream (or sync access handle) before removing
   its file — an open handle blocks deletion, including on the cancel
   path, which is where it will actually bite.
4. Sweep orphaned job directories at app start. A crashed or force-closed
   tab leaves data behind, and the user's disk is not ours to fill.
5. **Hold a Web Lock on the directory for as long as the job needs it, and
   sweep only what is unlocked.** The sweep runs at boot, when it can see
   every tab's directories and knows none of their job ids — so a name is
   not evidence of anything. Locks are origin-scoped and the browser
   releases them when a tab dies, which is exactly the case the sweep
   exists for. Uncertainty keeps the directory: leaked scratch costs disk,
   a wrong deletion costs the user their output.
6. Remove orphans **one at a time, failing independently.** A directory
   that cannot be deleted must not abandon the ones after it.
7. Never write user media anywhere else — not `localStorage`, not
   IndexedDB, not a cache.
