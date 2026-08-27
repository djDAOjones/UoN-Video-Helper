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
<!-- 166 file(s) across 9 section(s); regenerate with pm_skills/scaffold/gen-file-map.mjs -->
- `(root)` — 20 file(s)
- `.claude` — 1 file(s)
- `.github` — 1 file(s)
- `docs` — 5 file(s)
- `public` — 13 file(s)
- `reviews` — 7 file(s)
- `scripts` — 5 file(s)
- `src` — 110 file(s)
- `test` — 4 file(s)
<!-- /file-map-index -->

## (root)

- `AGENTS.md` — Permanent behavioural contract for agents: invariants, data model, subsystems, protected paths.
- `CLAUDE.md` — Claude Desktop Code adapter: imports the canonical shared `AGENTS.md` and adds only tool-specific memory boundaries.
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
- `spike-framerate.html` — Maintainer page: does the app measure the frame rate or trust the header?
- `spike-modes.html` — Maintainer page: do the three closing modes produce the timelines they promise?
- `spike-opfs.html` — Maintainer page: does a sweep leave a live job's scratch alone in this engine?
- `spike-preflight-audio.html` — Maintainer page: does pre-flight refuse exactly what the audio encoder will refuse?
- `spike-real.html` — Maintainer page: runs a real recording end to end and reports what came out.
- `spike-shapes.html` — Maintainer page: do the corpus's odd shapes — 852x480, 4:3, 16:10, mono, 44.1 kHz, silent — reach a correct output?
- `tsconfig.json` — Strict TypeScript. `noUncheckedIndexedAccess` matters here — this codebase indexes buffers.
- `vite.config.ts` — Build config and the build-identity injection (`__APP_VERSION__`, `__BUILD_ID__`).

## .claude

- `.claude/launch.json` — Dev-server definition so the preview tooling can boot the app by name.

## .github

- `.github/workflows/deploy-pages.yml` — Manual GitHub Pages deploy. Runs the full gate, then publishes `dist`.

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

## reviews

- `reviews/2026-08-26/README.md` — Index, baseline and provenance for the self-contained repository-review evidence bundle.
- `reviews/2026-08-26/continuation-prompt.md` — Self-contained handoff prompt for continuing the evidence-led review on a newer checkout.
- `reviews/2026-08-26/uon-video-helper-comprehensive-review-2026-08-26.md` — Portable reading copy of the original external comprehensive review.
- `reviews/2026-08-26/uon-video-helper-comprehensive-review-2026-08-26.source.txt` — Byte-for-byte archive of the externally supplied review source.
- `reviews/2026-08-26/uon-video-helper-internal-code-review-2026-08-26.md` — Durable copy of the earlier in-repository review used as a lead source.
- `reviews/2026-08-26/uon-video-helper-review-critique-2026-08-26.md` — Independent critique, reproductions, disagreements and corrected priority order.
- `reviews/2026-08-26/uon-video-helper-updated-review-critique-2026-08-26.md` — Source-verified finding verdicts, omitted findings, provenance corrections and release gates.

## scripts

- `scripts/build-branding.mjs` — Converts the UoN masters into the shipped onset/tail assets. Run by hand, not by `build`.
- `scripts/check-build.mjs` — Builds the production bundle to a temp directory, so the gate can check it without writing dist/.
- `scripts/check-placeholders.mjs` — Tier 0 of the gate: fails on stray template markers, reports key-shaped strings.
- `scripts/gen-placeholder-branding.mjs` — Generates the placeholder masters with a local ffmpeg. Authoring tool only.
- `scripts/run-in-engines.mjs` — Runs a spike page in Chrome, Firefox and Safari and prints all three. Maintainer tool; never part of `check`.

## src

- `src/acceptance/fixtures.ts` — Synthesised sources for the acceptance run, including paired A/V sync markers.
- `src/acceptance/main.ts` — Entry point for the acceptance page. Development only; never built.
- `src/acceptance/measure.test.ts` — Pins the drift estimator — an endpoint difference read the trend backwards.
- `src/acceptance/measure.ts` — Sync by marker, loudness by region, and two independent egress instruments.
- `src/acceptance/run.ts` — The spec 13 run: what is checked, and what is reported as needing a person.
- `src/audio/analyse.test.ts` — Proves the facade measures the same thing the components do separately.
- `src/audio/analyse.ts` — The analysis pass: loudness and true peak over one traversal of source audio only.
- `src/audio/biquad.ts` — Second-order IIR section, Direct Form II transposed, Float64 state to resist hour-long drift.
- `src/audio/chain.test.ts` — Acceptance criteria 2 and 4, including material with a real lecture's crest factor.
- `src/audio/chain.ts` — Assembles spec 5.2 steps 2-6 in order; two shapes, one for measuring and one for applying.
- `src/audio/compressor.test.ts` — Pins the static curve, the knee, and that the stereo image never shifts.
- `src/audio/compressor.ts` — Gentle 2:1 compression. RMS detection, because sample peaks are the limiter's job.
- `src/audio/gain-solve.ts` — Solves spec 5.2 step 5's gain against the chain that limits, over an injected measurement.
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
- `src/audio/truepeak.ts` — 4x oversampled true peak. Polyphase FIR with exact pruning, drained at end of stream.
- `src/audio/warnings.test.ts` — Triggers every 5.4 row deliberately, including the gapless false-positive guard.
- `src/audio/warnings.ts` — Detects the spec 5.4 audio-quality conditions; thresholds live with the numbers.
- `src/config/audio.ts` — Project audio choices — targets, thresholds, chain constants. Standard-defined values live in src/audio/.
- `src/config/branding.test.ts` — Pins master selection: frame rate first, resolution second, never upscaled.
- `src/config/branding.ts` — Closing style/colour/mode, the 1 s/4 s split and per-mode duration; opening placeholders.
- `src/config/presets.test.ts` — Pins the preset rules, including that the smaller preset preserves resolution.
- `src/config/presets.ts` — The two output presets and the encoder config they imply. Purpose-named, never technique-named.
- `src/config/thresholds.ts` — Pre-flight bands and probe constants — the numbers D8 will replace with measurements.
- `src/core/diagnostics.test.ts` — Proves the bundle's job context carries what the file is and never which file.
- `src/core/diagnostics.ts` — Global error capture on both threads, plus the redacted copy-diagnostics bundle.
- `src/core/egress.test.ts` — Pins that a body is a finding however it was attached, and that both realms are counted.
- `src/core/egress.ts` — Watches what leaves ONE realm. Per-global, so the worker runs its own and the two are merged.
- `src/core/keep-awake.test.ts` — Pins when the leave warning is attached: both ways of getting it wrong cost the user.
- `src/core/keep-awake.ts` — Spec 7.5: a screen wake lock across a job, re-taken on visibility, and the unload warning rule.
- `src/core/logger.test.ts` — Proves the log buffer is bounded — a one-hour encode must not grow it without limit.
- `src/core/logger.ts` — The single structured logger. Console plus a bounded ring buffer; no DOM, so the worker shares it.
- `src/core/redact.test.ts` — Proves the bundle carries media characteristics but never the media, its name, or its path.
- `src/core/redact.ts` — Redaction. This app's sensitive asset is the user's media and filename, not a token.
- `src/core/version.ts` — Reads the injected product version and build identity.
- `src/core/watchdog.test.ts` — Pins the silence watchdog, including that a late sign of life cannot resurrect a request already given up on.
- `src/core/watchdog.ts` — A timer that measures SILENCE rather than elapsed time, so a long job is never mistaken for a stuck one.
- `src/main.ts` — App entry: installs diagnostics first, mounts the shell, runs the system check.
- `src/media/audio-frames.ts` — AudioSample to planar Float32 and back, shared by the chain and branding.
- `src/media/audio-plan.ts` — The three audio passes, and the per-sample hook the encoder calls.
- `src/media/branding-fade.test.ts` — Pins what "hard cut with a 100 ms fade" means at sample level (D3).
- `src/media/branding-timeline.test.ts` — Pins where branding sits on the timeline: boundaries measured against the picture, never the longer track.
- `src/media/branding.ts` — Conform and concatenate the opaque parts; load the real closing tail; the boundary fade.
- `src/media/capability.ts` — Device checks asked against the exact target config, not a generic capability flag.
- `src/media/composite.test.ts` — Pins `compositePremultiplied` against the straight-alpha mistake that looks plausible and double-darkens.
- `src/media/composite.ts` — Premultiplied-alpha compositing. `out = brand + source×(1−a)`; the straight form double-darkens.
- `src/media/conform.test.ts` — Proves fit/pad never distorts, across 4:3, vertical and ultrawide sources.
- `src/media/conform.ts` — Scale-to-fit and pad geometry, and the reusable frame scaler the pipeline and probe share.
- `src/media/encoder-delay.test.ts` — Pins that delay compensation measures the onset it discards, at the levels the corpus carries.
- `src/media/encoder-delay.ts` — Measures the audio encoder's own delay and shifts the timeline to cancel it.
- `src/media/encoding.test.ts` — Pins that pre-flight validates the same codec string production encodes with.
- `src/media/encoding.ts` — Mediabunny encoding configs derived from the presets; where VH-7's audio chain will hook in.
- `src/media/framerate.test.ts` — Proves the rounding rule and that timestamps derive from the index so error cannot accumulate.
- `src/media/framerate.ts` — CFR conform decisions: nearest standard rate, what conforming costs, and the timestamp grid.
- `src/media/freeze.test.ts` — Pins the freeze frame on the last CLEAN frame, not simply the last decoded one.
- `src/media/freeze.ts` — Picks the frame `over freeze frame` holds: walks back past defects, keeps a deliberate fade.
- `src/media/inspect.ts` — Demuxes a chosen file into a SourceReport. Rejects files with no video track.
- `src/media/isobmff.test.ts` — Synthetic boxes covering subtitle handlers, chapters, moov-at-end and non-ISOBMFF.
- `src/media/isobmff.ts` — A minimal box walk for the handler types Mediabunny cannot see at all.
- `src/media/lanes.test.ts` — Pins how the two feed lanes fail together: survivor stopped, cause reported over the cancellation it caused.
- `src/media/opfs.test.ts` — Pins the sweep rule: never remove a claimed directory, never remove one it could not ask about.
- `src/media/opfs.ts` — The OPFS working store: one directory per job, sync-handle writes, cleanup on every exit path.
- `src/media/output-integrity.test.ts` — Pins the empty-track case, and that a cancel reports as cancelled rather than as a broken file.
- `src/media/output-integrity.ts` — Requires the finished file to yield one decodable frame; the picture half of the output contract.
- `src/media/output-verification.test.ts` — Pins every decoded-output compliance boundary and each fail-closed result.
- `src/media/output-verification.ts` — Shared pure postcondition for finite, in-range output loudness and true peak.
- `src/media/pipeline.ts` — Decode to encode to mux, streaming to OPFS, with progress and cancellation.
- `src/media/preflight.test.ts` — Triggers all four spec 7.3 outcomes deliberately — acceptance criterion 7.
- `src/media/preflight.ts` — The pure verdict: given what was measured, proceed / warn / discourage / block.
- `src/media/probe.ts` — The 3-second calibration probe: real decode and encode on the real file and device.
- `src/media/save.test.ts` — Pins the suggested filename and the guard that refuses the source as a destination.
- `src/media/save.ts` — Streams the result to the user's chosen location, refuses the source, and hands back what to release.
- `src/media/track-metadata.test.ts` — Pins the carry rules: 'und' omitted, the lone track made default, a read failure reported not fatal.
- `src/media/track-metadata.ts` — Carries a source track's language, name and disposition onto the output track.
- `src/media/vtt.test.ts` — Proves cue text, settings, comments and line endings survive byte for byte.
- `src/media/vtt.ts` — Offsets WebVTT timings by rewriting only timestamp lines; never touches the words.
- `src/spike/alpha.ts` — VH-12 spike: decodes each branding onset and reads back pixel alpha. Dev-only, not built.
- `src/spike/codecs.ts` — Probes VideoEncoder and AudioEncoder support per preset and shape. How the Firefox AAC gap was found.
- `src/spike/framerate.ts` — VH-24 spike: reads a real PowerPoint export and reports measured vs declared rate.
- `src/spike/modes.ts` — VH-22 spike: runs a fixture through all three closing modes and checks output length.
- `src/spike/opfs.ts` — Drives the VH-35 sweep checks against real OPFS and real Web Locks. Dev-only; not built.
- `src/spike/preflight-audio.ts` — Checks the no-aac-encode block fires where the encoder refuses, and nowhere else.
- `src/spike/real.ts` — Runs a real recording from `public/spike/` through the pipeline; reports levels and speed.
- `src/spike/shapes.ts` — Runs the corpus's awkward properties through the pipeline, synthesised so it runs on any machine.
- `src/styles/app.css` — App shell styles. Carbon productive language at AAA.
- `src/styles/tokens.brand.css` — UoN brand tokens. Holds the D1 placeholder and nothing invented.
- `src/styles/tokens.carbon.css` — Carbon structural tokens. Every pair is contrast-asserted by test/contrast.test.ts.
- `src/ui/format.test.ts` — Pins the wording, so phrasing is tested rather than reviewed by opinion.
- `src/ui/format.ts` — Technical facts as plain language — durations, sizes, codecs, channel layouts.
- `src/ui/preflight-panel.ts` — Renders the verdict, naming a browser that works when the answer is no.
- `src/ui/source-panel.test.ts` — Pins which losses are named before processing: extra tracks, subtitles, and what is not guessed.
- `src/ui/source-panel.ts` — Renders a SourceReport, including the standing caveat about tracks we cannot see.
- `src/ui/warning-text.test.ts` — Mechanical half of "reads clearly": no jargon, no blame, always a next step.
- `src/ui/warning-text.ts` — The 5.4 warnings in words, and their rendering. Possibilities, never verdicts.
- `src/vite-env.d.ts` — Ambient types: the injected build globals and the File System Access API surface.
- `src/workers/cancellation.test.ts` — Pins the one rule: a request is cancellable from before its first await.
- `src/workers/cancellation.ts` — The worker's cancellation registry, kept apart from the worker so it can be tested in Node.
- `src/workers/job.worker.ts` — The job worker. Owns the pipeline when it lands; today proves the boundary and its error path.
- `src/workers/protocol.ts` — The typed message contract across the worker boundary.
- `src/workers/retained.test.ts` — Pins that a failed disposal is retryable and never fails the next job.
- `src/workers/retained.ts` — Finished jobs still held for the main thread, their read leases, and the release ordering.

## test

- `test/contrast.test.ts` — Makes the AAA contrast claim mechanical: every rendered pair >= 7:1 in both themes.
- `test/ebu3341/signals.ts` — EBU Tech 3341 Table 1 signals, synthesised from their published definitions.
- `test/ebu3341/tech3341.test.ts` — The compliance gate: Table 1 cases 1-23 against the meter, inside `npm run check`.
- `test/helpers/signals.ts` — Synthesised tones and silence shared by the meter tests and the EBU harness.
