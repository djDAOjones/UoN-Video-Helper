# File Map

<!-- One line per source file: `path` — its role. Map roles, not history
     (move batch notes, dates, and test counts to decision-log.md). -->
<!-- Skeleton is generator-owned: run `node pm_skills/scaffold/gen-file-map.mjs`
     after adds/renames/deletes. It groups paths by top-level directory
     into `## <dir>` sections, preserves existing role text by path, marks
     new files `(role needed)`, and flags paths no longer on disk — you
     only write the role text. Sections below are a starting scaffold;
     the generator replaces them with directory-based ones on first run. -->
<!-- Hot read is SECTIONAL: read the index block + the sections matching
     the task's directories; read whole only for cross-cutting work
     (renames, conventions, upgrades). See AGENTS.md "Before every task".
     Size budget derives from the file count in the index — see
     pm_skills/memory-policy.md. -->

<!-- file-map-index -->
<!-- 196 file(s) across 8 section(s); regenerate with pm_skills/scaffold/gen-file-map.mjs -->
- `(root)` — 20 file(s)
- `.claude` — 1 file(s)
- `.github` — 1 file(s)
- `docs` — 5 file(s)
- `public` — 17 file(s)
- `scripts` — 9 file(s)
- `src` — 137 file(s)
- `test` — 6 file(s)
<!-- /file-map-index -->

## (root)

- `AGENTS.md` — Permanent behavioural contract for agents: invariants, data model, subsystems, protected paths.
- `DEV-INFRASTRUCTURE.md` — Build, dev server, runtime lifecycle, diagnostics, quality gate, versioning, security.
- `README.md` — Entry point for a human: what this is, how to run it, the invariants, the gotchas.
- `UI-STANDARDS.md` — UI, usability and accessibility rules. Two token systems; the AAA design-review gate.
- `acceptance.html` — Maintainer page for the acceptance run. Excluded from the production build.
- `check-links.mjs` — Scaffolded internal Markdown link checker. Runs in `check`.
- `eslint.config.js` — Flat ESLint config. Strict on correctness, silent on taste; formatting is Prettier's job.
- `index.html` — The single page. Landmarks, skip link, and the polite live region the app announces into.
- `package.json` — Scripts, the one runtime dependency, and the product version.
- `spike-alpha.html` — Maintainer page: does this browser decode transparent video? Excluded from the build.
- `spike-codecs.html` — Maintainer page: which encoder configurations does this engine actually accept, video AND audio?
- `spike-egress.html` — Maintainer page for protocol-level no-media-egress evidence and its deliberate negative controls.
- `spike-framerate.html` — Maintainer page: does the app measure the frame rate or trust the header?
- `spike-modes.html` — Maintainer page: do the three closing modes produce the timelines they promise?
- `spike-opfs.html` — Maintainer page: does a sweep leave a live job's scratch alone in this engine?
- `spike-preflight-audio.html` — Maintainer page: does pre-flight refuse exactly what the audio encoder will refuse?
- `spike-real.html` — Maintainer page: runs a non-sensitive development fixture end to end and reports what came out; real staff media uses the normal app's development-only file picker.
- `spike-shapes.html` — Maintainer page: do the corpus's odd shapes — 852x480, 4:3, 16:10, mono, 44.1 kHz, silent — reach a correct output?
- `tsconfig.json` — Strict TypeScript. `noUncheckedIndexedAccess` matters here — this codebase indexes buffers.
- `vite.config.ts` — Build config and the build-identity injection (`__APP_VERSION__`, `__BUILD_ID__`).

## .claude

- `.claude/launch.json` — Dev-server definition so the preview tooling can boot the app by name.

## .github

- `.github/workflows/deploy-pages.yml` — Automatic main-branch and manual-dispatch Pages deploy; gates and builds before publishing `dist`.

## docs

- `docs/00-original-brief.md` — The original brief, verbatim. Historical record; never rewritten.
- `docs/01-specification.md` — The specification. Authoritative — where this and project memory disagree, this wins.
- `docs/02-technical-rationale.md` — Why each decision was made, with evidence. Read before re-opening a settled question.
- `docs/03-open-decisions.md` — D1-D13: what still needs a human. The four blocking ones shape config, not code.
- `docs/04-init-prompt.md` — The prompt that seeded this project's PM Skills run. Historical record.

## public

- `public/branding/README.md` — What the real assets are, how they are built, and which placeholders remain.
- `public/branding/closing-onset-fade-blue-1080p.webm` — Real closing onset, fade blue at 1080p: the 1.00 s premultiplied-alpha build. VP9+alpha WebM; used only by the compositing modes.
- `public/branding/closing-onset-fade-blue-2160p.webm` — Real closing onset, fade blue at 2160p: the 1.00 s premultiplied-alpha build. VP9+alpha WebM; used only by the compositing modes.
- `public/branding/closing-onset-fade-white-1080p.webm` — Real closing onset, fade white at 1080p: the 1.00 s premultiplied-alpha build. VP9+alpha WebM; used only by the compositing modes.
- `public/branding/closing-onset-fade-white-2160p.webm` — Real closing onset, fade white at 2160p: the 1.00 s premultiplied-alpha build. VP9+alpha WebM; used only by the compositing modes.
- `public/branding/closing-onset-slide-blue-1080p.webm` — Real closing onset, slide blue at 1080p: the 1.00 s premultiplied-alpha build. VP9+alpha WebM; used only by the compositing modes.
- `public/branding/closing-onset-slide-blue-2160p.webm` — Real closing onset, slide blue at 2160p: the 1.00 s premultiplied-alpha build. VP9+alpha WebM; used only by the compositing modes.
- `public/branding/closing-onset-slide-white-1080p.webm` — Real closing onset, slide white at 1080p: the 1.00 s premultiplied-alpha build. VP9+alpha WebM; used only by the compositing modes.
- `public/branding/closing-onset-slide-white-2160p.webm` — Real closing onset, slide white at 2160p: the 1.00 s premultiplied-alpha build. VP9+alpha WebM; used only by the compositing modes.
- `public/branding/closing-tail-blue-1080p.mp4` — Real closing tail, blue at 1080p: the 4.00 s opaque card. H.264 so hard cut works without alpha decode.
- `public/branding/closing-tail-blue-2160p.mp4` — Real closing tail, blue at 2160p: the 4.00 s opaque card. H.264 so hard cut works without alpha decode.
- `public/branding/closing-tail-white-1080p.mp4` — Real closing tail, white at 1080p: the 4.00 s opaque card. H.264 so hard cut works without alpha decode.
- `public/branding/closing-tail-white-2160p.mp4` — Real closing tail, white at 2160p: the 4.00 s opaque card. H.264 so hard cut works without alpha decode.
- `public/branding/opening-1080p25.mp4` — Placeholder opening master, 1080p25. Replaced by the real AE render; see the README beside it.
- `public/branding/opening-1080p30.mp4` — Placeholder opening master, 1080p30. Replaced by the real AE render; see the README beside it.
- `public/branding/opening-2160p25.mp4` — Placeholder opening master, 2160p25. Replaced by the real AE render; see the README beside it.
- `public/branding/opening-2160p30.mp4` — Placeholder opening master, 2160p30. Replaced by the real AE render; see the README beside it.

## scripts

- `scripts/build-branding.mjs` — Converts the UoN masters into the shipped onset/tail assets. Run by hand, not by `build`.
- `scripts/check-build.mjs` — Runs Vite into a disposable temporary directory so the quality gate stays non-mutating.
- `scripts/check-placeholders.mjs` — Tier 0 gate: exact public allowlist/hash/symlink guard plus template and key-shape scans.
- `scripts/gen-placeholder-branding.mjs` — Generates the placeholder masters with a local ffmpeg. Authoring tool only.
- `scripts/public-inventory.d.mts` — Type declarations for the public-asset inventory helper used by tests and the gate.
- `scripts/public-inventory.mjs` — Recursively verifies the exact allowlisted public files, hashes and regular-file boundaries.
- `scripts/run-in-engines-lib.d.mts` — Type declarations for cross-engine results and redacted protocol-egress records.
- `scripts/run-in-engines-lib.mjs` — Pure runner accounting plus redaction, negative-control and egress-assessment helpers.
- `scripts/run-in-engines.mjs` — Drives maintainer pages through each engine's automation protocol, optionally observing egress; never part of `check`.

## src

- `src/acceptance/fixtures.ts` — Synthesised sources for the acceptance run, including paired A/V sync markers.
- `src/acceptance/main.ts` — Entry point for the acceptance page. Development only; never built.
- `src/acceptance/measure.test.ts` — Pins the drift estimator — an endpoint difference read the trend backwards.
- `src/acceptance/measure.ts` — Sync by marker, loudness by region, and two independent egress instruments.
- `src/acceptance/run.test.ts` — Pins OPFS/cancellation evidence and retained-worker cleanup plus known AAC-gap classification.
- `src/acceptance/run.ts` — The spec 13 run, including a cross-engine silent production-worker proof and acknowledged cleanup.
- `src/acceptance/verdicts.test.ts` — Proves missing, non-finite or truncated loudness evidence fails the corpus verdict.
- `src/acceptance/verdicts.ts` — Fail-closed loudness, true-peak and decoded-coverage classification for acceptance.
- `src/audio/analyse.test.ts` — Proves the facade measures the same thing the components do separately.
- `src/audio/analyse.ts` — The analysis pass: loudness and true peak over one traversal of source audio only.
- `src/audio/biquad.ts` — Second-order IIR section, Direct Form II transposed, Float64 state to resist hour-long drift.
- `src/audio/chain.test.ts` — Acceptance criteria 2 and 4 — target loudness, ceiling, and no pumping the chain caused.
- `src/audio/chain.ts` — Assembles spec 5.2 steps 2-6 in order; two shapes, one for measuring and one for applying.
- `src/audio/compressor.test.ts` — Pins the static curve, the knee, and that the stereo image never shifts.
- `src/audio/compressor.ts` — Gentle 2:1 compression. RMS detection, because sample peaks are the limiter's job.
- `src/audio/highpass.test.ts` — Checks the -3 dB cutoff, rumble rejection, and that channels stay independent.
- `src/audio/highpass.ts` — 60 Hz Butterworth high-pass: rumble out, speech untouched.
- `src/audio/kweighting.test.ts` — Asserts the derivation reproduces the standard's published 48 kHz coefficients.
- `src/audio/kweighting.ts` — BS.1770-4 K-weighting, derived at the source's real sample rate rather than resampling to a table.
- `src/audio/limiter.test.ts` — The ceiling promise, including a signal that reaches full scale between samples.
- `src/audio/limiter.ts` — True-peak limiter sharing the meter's oversampling, so detection and limiting agree.
- `src/audio/loudness.test.ts` — Meter behaviour, with every expected value derived from BS.1770-4's equations.
- `src/audio/loudness.ts` — Gated integrated loudness, momentary and short-term curves, and LRA. Streaming.
- `src/audio/macrolevel.test.ts` — Each anti-pumping property tested alone — conditional, window, slew, freeze.
- `src/audio/macrolevel.ts` — Conditional macro-levelling: the four properties that separate it from an AGC.
- `src/audio/truepeak.test.ts` — Proves it finds inter-sample peaks and never reads below sample peak.
- `src/audio/truepeak.ts` — 4x oversampled true peak. Polyphase FIR with exact pruning, so quiet passages cost little.
- `src/audio/warnings.test.ts` — Triggers every 5.4 row deliberately, including the gapless false-positive guard.
- `src/audio/warnings.ts` — Detects the spec 5.4 audio-quality conditions; thresholds live with the numbers.
- `src/config/audio.ts` — Project audio choices — targets, thresholds, chain constants. Standard-defined values live in src/audio/.
- `src/config/branding.test.ts` — Pins master selection: frame rate first, resolution second, never upscaled.
- `src/config/branding.ts` — Closing style/colour/mode, the 1 s/4 s split and per-mode duration; opening placeholders.
- `src/config/presets.test.ts` — Pins the preset rules, including that the smaller preset preserves resolution.
- `src/config/presets.ts` — The two output presets and the encoder config they imply. Purpose-named, never technique-named.
- `src/config/thresholds.ts` — Pre-flight, probe and conservative picture-class thresholds — measured defaults D8 can replace.
- `src/core/diagnostics.test.ts` — Pins durable diagnostic context and redaction of accidental media-identifying fields.
- `src/core/diagnostics.ts` — Global error capture on both threads, plus the redacted copy-diagnostics bundle.
- `src/core/logger.test.ts` — Proves the log buffer is bounded — a one-hour encode must not grow it without limit.
- `src/core/logger.ts` — The single structured logger. Console plus a bounded ring buffer; no DOM, so the worker shares it.
- `src/core/process-interlock.test.ts` — Pins Start and lifecycle protection until a watchdog-cancelled worker answers terminally.
- `src/core/process-interlock.ts` — Owns worker work that outlives the normal progress UI after a silence timeout.
- `src/core/processing-guard.test.ts` — Pins wake-lock, visibility, unload and retained-result lifecycle ownership.
- `src/core/processing-guard.ts` — Owns screen-wake and unload protection across processing, saving and retained-result lifetimes.
- `src/core/redact.test.ts` — Proves the bundle carries media characteristics but never the media, its name, or its path.
- `src/core/redact.ts` — Redaction. This app's sensitive asset is the user's media and filename, not a token.
- `src/core/result-authority.test.ts` — Proves one result remains owned until durable save or acknowledged discard.
- `src/core/result-authority.ts` — Identity-based state machine for the one retained, saving or discarding result.
- `src/core/selection-authority.test.ts` — Proves stale file/preset checks can never restore Start authority.
- `src/core/selection-authority.ts` — Monotonic immutable selection and readiness authority for the Start command.
- `src/core/version.ts` — Reads the injected product version and build identity.
- `src/core/watchdog.test.ts` — Pins the silence watchdog, including that a late sign of life cannot resurrect a request already given up on.
- `src/core/watchdog.ts` — A timer that measures SILENCE rather than elapsed time, so a long job is never mistaken for a stuck one.
- `src/main.ts` — Installs diagnostics, renders the UI and coordinates selection, worker, save and discard lifecycles.
- `src/media/audio-frames.ts` — AudioSample to planar Float32 and back, shared by the chain and branding.
- `src/media/audio-gain-solver.test.ts` — Pins convergence, limiter feedback, bounded exits and silence handling through the real chain.
- `src/media/audio-gain-solver.ts` — Bounded scalar feedback solve for one gain measured through the complete streaming chain.
- `src/media/audio-ownership.test.ts` — Proves pending audio samples close without materialising a failed stream's tail.
- `src/media/audio-plan.test.ts` — Pins shared-clock gap fill, overlap rejection, bounded streaming, cancellation and EOF accounting.
- `src/media/audio-plan.ts` — Streams source analysis, envelope derivation, iterative chain solving and final encode application with bounded gap fill.
- `src/media/branding-fade.test.ts` — Pins what "hard cut with a 100 ms fade" means at sample level (D3).
- `src/media/branding-ownership.test.ts` — Proves branding samples yielded at cancellation remain closed by their consumer.
- `src/media/branding-timeline.test.ts` — Pins where branding sits on the timeline: boundaries measured against the picture, never the longer track.
- `src/media/branding.ts` — Conform and concatenate the opaque parts; load the real closing tail; the boundary fade.
- `src/media/capability.test.ts` — Pins the fail-closed locked OPFS create/write/close/delete canary and cleanup paths.
- `src/media/capability.ts` — Device checks asked against the exact target config, not a generic capability flag.
- `src/media/composite.test.ts` — Pins `compositePremultiplied` against the straight-alpha mistake that looks plausible and double-darkens.
- `src/media/composite.ts` — Premultiplied-alpha compositing. `out = brand + source×(1−a)`; the straight form double-darkens.
- `src/media/conform.test.ts` — Proves fit/pad never distorts, across 4:3, vertical and ultrawide sources.
- `src/media/conform.ts` — Scale-to-fit and pad geometry, and the reusable frame scaler the pipeline and probe share.
- `src/media/content-class.test.ts` — Pins decisive screen/motion boundaries, uncertainty and the high-density camera guard.
- `src/media/content-class.ts` — Sparse timeline-wide luma measurement that classifies picture type conservatively for Smaller.
- `src/media/encoder-delay.ts` — Measures actual AAC round-trip presentation delay for the pipeline's timeline compensation.
- `src/media/encoding.test.ts` — Pins the shared mono/stereo bitrate decision used by the Mediabunny audio encoder configuration.
- `src/media/encoding.ts` — Derives the exact Mediabunny audio and video encoder configurations from the output shape.
- `src/media/framerate.test.ts` — Proves the rounding rule and that timestamps derive from the index so error cannot accumulate.
- `src/media/framerate.ts` — CFR conform decisions: nearest standard rate, what conforming costs, and the timestamp grid.
- `src/media/freeze.test.ts` — Pins the freeze frame on the last CLEAN frame, not simply the last decoded one.
- `src/media/freeze.ts` — Picks the frame `over freeze frame` holds: walks back past defects, keeps a deliberate fade.
- `src/media/inspect.test.ts` — Pins readable metadata reporting and visible fail-closed disclosure when tag reads fail.
- `src/media/inspect.ts` — Inspects selected primary tracks into a SourceReport with shared timing, multiplicity and metadata disclosure.
- `src/media/isobmff.test.ts` — Synthetic boxes covering subtitle handlers, chapters, moov-at-end and non-ISOBMFF.
- `src/media/isobmff.ts` — A minimal box walk for the handler types Mediabunny cannot see at all.
- `src/media/lanes.test.ts` — Pins how the two feed lanes fail together: survivor stopped, cause reported over the cancellation it caused.
- `src/media/opfs.test.ts` — Pins lock-before-create, public output finalisation, both writer paths and retryable cleanup.
- `src/media/opfs.ts` — Lifetime-locked OPFS storage with project-owned raw-writer cleanup, safe sweeping and positioned writes.
- `src/media/output-verification.test.ts` — Pins strict output limits, unverified states and EOF true-peak drainage.
- `src/media/output-verification.ts` — Streams finished audio into independent loudness/true-peak measurement and fail-closed classification.
- `src/media/pipeline.ts` — Decode to encode to mux, streaming to OPFS, with progress and cancellation.
- `src/media/preflight.test.ts` — Triggers all four spec 7.3 outcomes deliberately — acceptance criterion 7.
- `src/media/preflight.ts` — The pure verdict: given what was measured, proceed / warn / discourage / block.
- `src/media/probe.test.ts` — Pins video-only duration estimates and the explicit unavailable estimate for multi-pass audio jobs.
- `src/media/probe.ts` — The 3-second calibration probe: real decode and encode on the real file and device.
- `src/media/save.test.ts` — Pins names, same-entry refusal, close-before-success, picker cancellation and fallback retention.
- `src/media/save.ts` — Streams into app-named files in a selected directory, refuses uncertain writes and retains fallback results.
- `src/media/source-picker.test.ts` — Pins read-only selection, cancellation and the complete locked-directory capability gate.
- `src/media/source-picker.ts` — Selects a handle-backed source only when locked directory saving and identity checks are available.
- `src/media/source-timeline.test.ts` — Pins aligned, delayed and negative selected-track origins on one source clock.
- `src/media/source-timeline.ts` — Maps selected audio and video timestamps onto one immutable non-negative timeline.
- `src/media/track-selection.test.ts` — Pins primary-track reuse, missing-audio handling, multiplicity and metadata copy.
- `src/media/track-selection.ts` — Selects Mediabunny primary tracks once and reads their preservable output metadata.
- `src/media/vtt.test.ts` — Proves cue text, settings, comments and line endings survive byte for byte.
- `src/media/vtt.ts` — Offsets WebVTT timings by rewriting only timestamp lines; never touches the words.
- `src/spike/alpha.ts` — VH-12 spike: decodes each branding onset and reads back pixel alpha. Dev-only, not built.
- `src/spike/codecs.ts` — Probes VideoEncoder and AudioEncoder support per preset and shape. How the Firefox AAC gap was found.
- `src/spike/egress.ts` — Dev-only clean-job and synthetic-control driver for the browser-protocol egress watcher.
- `src/spike/egress.worker.ts` — Dedicated-worker request-body control proving worker traffic reaches the egress observer.
- `src/spike/framerate.ts` — VH-24 spike: reads a real PowerPoint export and reports measured vs declared rate.
- `src/spike/modes.ts` — VH-22 spike: runs a fixture through all three closing modes and checks output length.
- `src/spike/opfs-context.worker.ts` — Independent holder/sweeper context for real-browser OPFS lock and crash recovery evidence.
- `src/spike/opfs.ts` — Drives real fallback/sync writers, cross-context locks and forced-worker OPFS recovery. Dev-only; not built.
- `src/spike/preflight-audio.ts` — Checks the no-aac-encode block fires where the encoder refuses, and nowhere else.
- `src/spike/real.ts` — Runs a non-sensitive fixture from `public/spike/` through the pipeline; real staff media stays outside `public/` and uses `/?source-picker=file-input`.
- `src/spike/shapes.ts` — Runs the corpus's awkward properties through the pipeline, synthesised so it runs on any machine.
- `src/styles/app.css` — App shell styles. Carbon productive language at AAA.
- `src/styles/tokens.brand.css` — UoN brand tokens. Holds the D1 placeholder and nothing invented.
- `src/styles/tokens.carbon.css` — Carbon structural tokens. Every pair is contrast-asserted by test/contrast.test.ts.
- `src/ui/branding-preview.test.ts` — Pins approved local asset selection and reduced-motion autoplay policy.
- `src/ui/branding-preview.ts` — Selects the accurate local hard-cut closing-card preview without exposing hidden transition modes.
- `src/ui/format.test.ts` — Pins the wording, so phrasing is tested rather than reviewed by opinion.
- `src/ui/format.ts` — Technical facts as plain language — durations, sizes, codecs, channel layouts and picture class.
- `src/ui/preflight-panel.ts` — Renders the verdict, including Smaller's picture class and a working browser when blocked.
- `src/ui/source-panel.test.ts` — Pins visible extra-track and unreadable-metadata warnings before processing.
- `src/ui/source-panel.ts` — Renders a SourceReport, including the standing caveat about tracks we cannot see.
- `src/ui/warning-text.test.ts` — Mechanical half of "reads clearly": no jargon, no blame, always a next step.
- `src/ui/warning-text.ts` — The 5.4 warnings in words, and their rendering. Possibilities, never verdicts.
- `src/ui/workflow.test.ts` — Pins current, complete and upcoming conveyor states, including failure return and result completion.
- `src/ui/workflow.ts` — Pure presentation rules for the four-stage conveyor; processing authorities remain elsewhere.
- `src/vite-env.d.ts` — Ambient types: the injected build globals and the File System Access API surface.
- `src/workers/job.worker.test.ts` — Proves non-abortable inspection is serialized and stale queued work is skipped.
- `src/workers/job.worker.ts` — Owns serialized readiness, processing, cancellation, verification and retained workspaces.
- `src/workers/latest-request.test.ts` — Pins synchronous supersession without letting an old finalizer clear a newer request.
- `src/workers/latest-request.ts` — Tracks the newest readiness request and marks superseded work aborted.
- `src/workers/output-integrity.test.ts` — Proves finished output needs one real picture sample and closes it on every path.
- `src/workers/output-integrity.ts` — Refuses a saveable result until its primary picture decodes at least one sample.
- `src/workers/protocol.ts` — The typed message contract across the worker boundary.
- `src/workers/workspace-release.test.ts` — Pins retryable workspace ownership when disposal fails.
- `src/workers/workspace-release.ts` — Removes retained-workspace ownership only after disposal succeeds.

## test

- `test/check-placeholders.test.ts` — Pins exact public inventory, reviewed hashes and rejection of symlinks or stray files.
- `test/contrast.test.ts` — Makes the AAA contrast claim mechanical: every rendered pair >= 7:1 in both themes.
- `test/ebu3341/signals.ts` — EBU Tech 3341 Table 1 signals, synthesised from their published definitions.
- `test/ebu3341/tech3341.test.ts` — The compliance gate: Table 1 cases 1-23 against the meter, inside `npm run check`.
- `test/helpers/signals.ts` — Synthesised tones and silence shared by the meter tests and the EBU harness.
- `test/run-in-engines.test.ts` — Pins runner accounting, protocol redaction, egress controls and fail-closed assessment.
