# Architecture

<!-- Hot whole-file read. See pm_skills/memory-policy.md for limits. -->
<!-- Describe current structure only. Move historical batch notes to decision-log.md. -->

Rationale for the settled choices below lives in
[`docs/02-technical-rationale.md`](../../docs/02-technical-rationale.md).
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

```
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

```
src/
  main.ts                  entry — mounts the shell, installs diagnostics
  config/                  ALL tuneable values. No magic numbers elsewhere.
    presets.ts             the two output presets (spec §6.1, §6.2)
    audio.ts               loudness targets + every chain constant (§5.1, §5.2)
    branding.ts            durations (D2), master variant table (§4.2)
    thresholds.ts          pre-flight bands (§7.3), warning triggers (§5.4)
  core/
    logger.ts              structured logger + bounded ring buffer
    diagnostics.ts         global error/unhandledrejection capture, redacted bundle
    bus.ts                 tiny typed pub-sub (main thread only)
    store.ts               app state, observable
  media/
    inspect.ts             Mediabunny demux → SourceReport
    capability.ts          WebCodecs + canEncodeVideo + OPFS quota + device class
    probe.ts               3-second calibration probe → throughput + estimate
    conform.ts             CFR conform, scale-to-fit, pad maths
    pipeline.ts            pass 1 / pass 2 orchestration
    opfs.ts                working store + a seekable Mediabunny target
    save.ts                File System Access API, blob fallback
    sidecar.ts             subtitle detection, WebVTT parse/offset/emit, metadata carry
  audio/
    kweighting.ts          BS.1770-4 pre-filter + RLB biquads
    loudness.ts            gated integrated, short-term, LRA
    truepeak.ts            4x oversampled true peak
    highpass.ts            60 Hz
    macrolevel.ts          conditional envelope, 15 s smoothing, 1 dB/s slew, pause freeze
    compressor.ts          2:1, -18 dBFS, 20 ms / 200 ms, soft knee
    limiter.ts             5 ms look-ahead, 50 ms release, -2.0 dBTP
    chain.ts               the ordered chain, assembled
  branding/
    assets.ts              variant selection (§4.2), fetch + cache
    placeholder.ts         generated stand-in clips matching the master format
  workers/
    job.worker.ts          the whole job
    protocol.ts            typed messages across the boundary
  ui/
    shell.ts               app shell, landmarks, live region
    components/            Carbon-spec'd controls, our own code
    views/                 select / inspect / options / progress / done / blocked
  styles/
    tokens.brand.css       UoN palette — the D1 token lives here, once
    tokens.carbon.css      Carbon structural tokens (spacing, type, layer, state)
test/
  ebu3341/                 signal synthesis + published expected values
  fixtures/                synthesised video/audio fixtures (generated, not committed)
samples/                   YOUR real recordings. Gitignored. Never committed.
```

## Key modules

| Module | Responsibility |
| --- | --- |
| `media/inspect.ts` | Turn a `File` into a `SourceReport`: resolution, duration, codecs, rotation, audio presence, and a VFR verdict from `computeFrameRateMetrics()`. |
| `media/capability.ts` | Answer "can this device do this job?" — `canEncodeVideo()` for the exact target config, `navigator.storage.estimate()` against 2.5x the projected output, device class. |
| `media/probe.ts` | Decode+encode 3 s of the *actual* file, measure throughput, extrapolate. Turns spec §7.3's thresholds from guesses into measurements. |
| `media/conform.ts` | All the geometry and timing maths: CFR timestamp generation at the rounded average rate, scale-to-fit, pad rectangle. Pure functions, heavily unit-tested. |
| `media/opfs.ts` | The working store: a job-scoped OPFS directory, `createWritable()` handles wrapped for `StreamTarget`, and the orphan sweep at app start. Output lands in OPFS first and is copied to the user's destination only on success — writing straight to their chosen file would leave a partial on cancel, breaking spec §13 criterion 8. |
| `audio/loudness.ts` | The meter. Everything downstream trusts it, so it is built and validated first. |
| `audio/chain.ts` | Assembles steps 2-6 in order and applies them to a stream of `Float32Array` blocks. Each step is a separate, independently testable module. |
| `branding/assets.ts` | Picks the master variant nearest the output frame rate and resolution class, fetches, caches. Falls back to `placeholder.ts` until real assets exist. |
| `workers/job.worker.ts` | Owns the job lifecycle: pass 1, pass 2, progress reporting, cancellation, OPFS cleanup. |

## Communication patterns

- **Across the worker boundary** — a typed request/response + progress-event
  protocol in `workers/protocol.ts`. The main thread sends one `start` with
  the job spec and receives `stage`, `progress`, `warning`, `done`, `error`.
  Cancellation is an `AbortController` signal mirrored by a `cancel`
  message. No shared mutable state; transfer `ArrayBuffer`s, never copy.
- **Within the worker** — direct imports and plain function composition.
  The pipeline is a pipeline; it does not need an event bus.
- **Within the main thread** — a small observable `store.ts` for app state,
  and `bus.ts` for cross-cutting notices (a warning raised, a stage
  changed). Views subscribe; they never reach into each other.

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

Design tokens follow `UI-STANDARDS.md`: two systems side by side, UoN brand
palette and Carbon structural tokens, never collapsed into one.

## Dev workflow

| Action | Command | Result |
| --- | --- | --- |
| Install | `npm install` | |
| Dev | `npm run dev` | http://localhost:5173 |
| Build | `npm run build` | static files in `dist/` |
| Preview build | `npm run preview` | http://localhost:4173 |
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
  `media/sidecar.ts` and is the whole of VH-9's detection half.
- **Subtitle writing works.** `addSubtitleTrack` +
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
