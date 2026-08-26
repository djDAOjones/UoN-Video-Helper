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
| Working storage | **OPFS**, exposed to Mediabunny as a `StreamTarget` | A worker-only sync access handle writes positioned chunks in place; `createWritable()` is the tested fallback. A Web Lock is acquired before the job directory exists and held until its result is durably saved or explicitly discarded. |
| Save to disk | **File System Access API**, retained blob-download fallback | A handle-backed source permits an identity check before opening the destination. Where identity cannot be proved, the app uses a download and retains the OPFS result until explicit discard. |
| UI | **Vanilla TS + our own components** | Carbon productive design language implemented in project code — never the Carbon packages. See `UI-STANDARDS.md`. |

No framework, no CSS library, no polyfills. If the browser cannot do it
natively, the browser is not supported (spec §10) and says so plainly.

## The shape of a job

The single most important structural fact: **the whole job runs in one
Web Worker.** The main thread coordinates UI, worker requests, result ownership
and saving; media inspection, pre-flight, encoding and verification stay in
the worker. A one-hour encode that stutters the UI is indistinguishable from a
hung tab, and spec §7.5 requires the page stay responsive throughout.

The second most important: **audio has a planning phase before its encode;
video is encoded once.** The single linear gain in spec §5.2 step 5 cannot be
known until integrated loudness over the *whole* file has been measured. The
planning phase may traverse audio more than once to measure the pre-gain chain
and solve through the non-linear limiter, but every traversal streams bounded
blocks and retains no decoded PCM. The protected meter still retains derived
loudness curves in memory; VH-53 keeps that separate performance change open
because it requires a coupled EBU-harness run. So:

```
Plan    source analysis ─▶ macro envelope ─▶ pre-gain measurement
                                   └──────▶ bounded complete-chain gain solve
                                                     │
Encode  video ─▶ shared source clock ─▶ CFR / scale ─▶ VideoEncoder ─┐
        audio ─▶ shared clock + bounded gap fill ─▶ chain ─▶ encoder ┤─▶ Output ─▶ OPFS
        branding ─────────▶ re-encode; audio bed UNPROCESSED ────────┘
                                                     │
Verify  reopen finished file ─▶ readable picture + strict sound measurement
```

The third: **loudness is measured on source content only, never on the
concatenated timeline** (spec §4.4). The branding audio bed is mastered at
target and bypasses the chain entirely. Architecturally the audio path has
two lanes that meet only at the muxer.

## Project structure

```
src/
  main.ts                  direct-DOM UI and worker request coordinator
  config/                  ALL tuneable values. No magic numbers elsewhere.
    presets.ts             the two output presets (spec §6.1, §6.2)
    audio.ts               loudness targets, warning thresholds and chain constants
    branding.ts            durations (D2), master variant table (§4.2)
    thresholds.ts          pre-flight bands, probe bounds and worker silence (§7)
  core/
    logger.ts              structured logger + bounded ring buffer
    diagnostics.ts         global error/unhandledrejection capture, redacted bundle
    selection-authority.ts immutable file/preset readiness generations
    result-authority.ts    one retained result and its save/discard transitions
    processing-guard.ts    wake-lock and unload protection lifetimes
    watchdog.ts            progress-silence watchdog
  media/
    inspect.ts             selected tracks + SourceReport + shared source timeline
    track-selection.ts     one primary-track choice for inspect/probe/encode
    source-timeline.ts     shared clock preserving selected-track offsets
    capability.ts          secure context, WebCodecs, OPFS/locks and storage
    probe.ts               real-path decode/encode probe + throughput estimate
    audio-plan.ts          streaming analysis, gap fill and chain planning
    audio-gain-solver.ts   bounded feedback solve through the complete chain
    encoder-delay.ts       AAC round-trip presentation-delay measurement
    pipeline.ts            concurrent bounded A/V and branding orchestration
    opfs.ts                locked job workspace + seekable output + orphan sweep
    source-picker.ts       read-only handle-backed source selection
    save.ts                same-entry guard, streamed picker save, retained fallback
    output-verification.ts finished-output loudness and EOF true-peak measurement
    isobmff.ts / vtt.ts    track-handler scan and WebVTT validation/offset
  audio/
    kweighting.ts          BS.1770-4 pre-filter + RLB biquads
    loudness.ts            gated integrated, short-term, LRA
    truepeak.ts            4x oversampled true peak
    highpass.ts            60 Hz
    macrolevel.ts          conditional envelope, 15 s smoothing, 1 dB/s slew, pause freeze
    compressor.ts          2:1, -18 dBFS, 20 ms / 200 ms, soft knee
    limiter.ts             5 ms look-ahead, 50 ms release, codec-headroom ceiling
    chain.ts               the ordered chain, assembled
  workers/
    job.worker.ts          latest checks, one job, retained workspace and cleanup
    protocol.ts            correlated requests/replies plus lossy progress events
    latest-request.ts      tracks and invalidates superseded readiness requests
    output-integrity.ts    proves a readable finished picture
  ui/
    source-panel.ts        source report and extra-track disclosure
    preflight-panel.ts     blocked/warn/discourage/proceed rendering
    warning-text.ts        user-facing audio warning mapping
  styles/
    tokens.brand.css       UoN palette — the D1 token lives here, once
    tokens.carbon.css      Carbon structural tokens (spacing, type, layer, state)
test/
  ebu3341/                 signal synthesis + published expected values
  fixtures/                synthesised video/audio fixtures (generated, not committed)
scripts/
  check-build.mjs          isolated, non-mutating production-build check
  check-placeholders.mjs   exact public-asset inventory and hash guard
  run-in-engines.mjs       fail/manual-aware cross-engine acceptance runner
samples/                   YOUR real recordings. Gitignored. Never committed.
```

## Key modules

| Module | Responsibility |
| --- | --- |
| `media/inspect.ts` + `track-selection.ts` | Choose Mediabunny's primary A/V tracks once, report multiplicity and timing, and carry those exact objects into probe and encode. |
| `media/source-timeline.ts` | Map both selected lanes from their container timestamps onto one non-negative clock without erasing their relative offset. |
| `media/capability.ts` + `probe.ts` | Prove the exact video/audio configurations and real decode/encode path, secure OPFS plus Web Locks, storage headroom and throughput before Start. |
| `media/conform.ts` | All the geometry and timing maths: CFR timestamp generation at the rounded average rate, scale-to-fit, pad rectangle. Pure functions, heavily unit-tested. |
| `media/opfs.ts` | Create each job directory only under its lifetime Web Lock, write through a seekable bounded target, retry disposal without dropping ownership, and sweep only unlocked orphans. |
| `audio/loudness.ts` | The meter. Everything downstream trusts it, so it is built and validated first. |
| `media/audio-plan.ts` + `audio-gain-solver.ts` | Preserve the shared timeline with bounded silence blocks, derive the envelope, and solve the complete chain without retaining PCM. |
| `media/output-verification.ts` | Decode the finished audio, drain an independent true-peak detector at EOF, and classify strict acceptance without changing protected meter code. |
| `core/selection-authority.ts` + `result-authority.ts` | Make stale pre-flight responses and implicit result replacement impossible by identity and monotonic generation. |
| `workers/job.worker.ts` | Own inspection, pre-flight, processing, cancellation, verification and every OPFS workspace until acknowledged release. |

## Communication patterns

- **Across the worker boundary** — correlated typed requests and replies in
  `workers/protocol.ts`: inspect, pre-flight, process, cancel and discard.
  Terminal replies carry success, cancellation or a user-legible failure;
  `stage` is the only unsolicited lossy progress event. A retained result is
  released only after an acknowledged `discard`.
- **Within the worker** — direct imports and plain function composition.
  The pipeline is a pipeline; it does not need an event bus.
- **Within the main thread** — `main.ts` owns the DOM and request table;
  focused authority objects own selection, retained-result and browser-lifecycle
  transitions. There is no global store or event bus.

Exception worth naming: dropping a progress frame is fine. Pre-flight warnings,
finished-output warnings and failures travel in correlated terminal replies,
where the main thread cannot mistake them for unrelated work.

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
  **Consequence:** `media/isobmff.ts` performs a minimal handler scan — it
  walks `moov` → `trak` → `mdia` → `hdlr` and reads handler types, plus
  `tref`/`chap` for chapters. It detects risk before processing but does not
  claim to preserve samples Mediabunny cannot expose.
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
