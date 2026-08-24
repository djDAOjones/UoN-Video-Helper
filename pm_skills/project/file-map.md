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
<!-- 60 file(s) across 6 section(s); regenerate with pm_skills/scaffold/gen-file-map.mjs -->
- `(root)` — 10 file(s)
- `.claude` — 1 file(s)
- `docs` — 5 file(s)
- `scripts` — 1 file(s)
- `src` — 39 file(s)
- `test` — 4 file(s)
<!-- /file-map-index -->

## (root)

- `AGENTS.md` — Permanent behavioural contract for agents: invariants, data model, subsystems, protected paths.
- `DEV-INFRASTRUCTURE.md` — Build, dev server, runtime lifecycle, diagnostics, quality gate, versioning, security.
- `README.md` — Entry point for a human: what this is, how to run it, the invariants, the gotchas.
- `UI-STANDARDS.md` — UI, usability and accessibility rules. Two token systems; the AAA design-review gate.
- `check-links.mjs` — Scaffolded internal Markdown link checker. Runs in `check`.
- `eslint.config.js` — Flat ESLint config. Strict on correctness, silent on taste; formatting is Prettier's job.
- `index.html` — The single page. Landmarks, skip link, and the polite live region the app announces into.
- `package.json` — Scripts, the one runtime dependency, and the product version.
- `tsconfig.json` — Strict TypeScript. `noUncheckedIndexedAccess` matters here — this codebase indexes buffers.
- `vite.config.ts` — Build config and the build-identity injection (`__APP_VERSION__`, `__BUILD_ID__`).

## .claude

- `.claude/launch.json` — Dev-server definition so the preview tooling can boot the app by name.

## docs

- `docs/00-original-brief.md` — The original brief, verbatim. Historical record; never rewritten.
- `docs/01-specification.md` — The specification. Authoritative — where this and project memory disagree, this wins.
- `docs/02-technical-rationale.md` — Why each decision was made, with evidence. Read before re-opening a settled question.
- `docs/03-open-decisions.md` — D1-D13: what still needs a human. The four blocking ones shape config, not code.
- `docs/04-init-prompt.md` — The prompt that seeded this project's PM Skills run. Historical record.

## scripts

- `scripts/check-placeholders.mjs` — Tier 0 of the gate: fails on stray template markers, reports key-shaped strings.

## src

- `src/audio/analyse.test.ts` — Proves the facade measures the same thing the components do separately.
- `src/audio/analyse.ts` — The analysis pass: loudness and true peak over one traversal of source audio only.
- `src/audio/biquad.ts` — Second-order IIR section, Direct Form II transposed, Float64 state to resist hour-long drift.
- `src/audio/kweighting.test.ts` — Asserts the derivation reproduces the standard's published 48 kHz coefficients.
- `src/audio/kweighting.ts` — BS.1770-4 K-weighting, derived at the source's real sample rate rather than resampling to a table.
- `src/audio/loudness.test.ts` — Meter behaviour, with every expected value derived from BS.1770-4's equations.
- `src/audio/loudness.ts` — Gated integrated loudness, momentary and short-term curves, and LRA. Streaming.
- `src/audio/truepeak.test.ts` — Proves it finds inter-sample peaks and never reads below sample peak.
- `src/audio/truepeak.ts` — 4x oversampled true peak. Polyphase FIR with exact pruning, so quiet passages cost little.
- `src/config/audio.ts` — Project audio choices — targets, thresholds, chain constants. Standard-defined values live in src/audio/.
- `src/config/presets.test.ts` — Pins the preset rules, including that the smaller preset preserves resolution.
- `src/config/presets.ts` — The two output presets and the encoder config they imply. Purpose-named, never technique-named.
- `src/config/thresholds.ts` — Pre-flight bands and probe constants — the numbers D8 will replace with measurements.
- `src/core/diagnostics.ts` — Global error capture on both threads, plus the redacted copy-diagnostics bundle.
- `src/core/logger.test.ts` — Proves the log buffer is bounded — a one-hour encode must not grow it without limit.
- `src/core/logger.ts` — The single structured logger. Console plus a bounded ring buffer; no DOM, so the worker shares it.
- `src/core/redact.test.ts` — Proves the bundle carries media characteristics but never the media, its name, or its path.
- `src/core/redact.ts` — Redaction. This app's sensitive asset is the user's media and filename, not a token.
- `src/core/version.ts` — Reads the injected product version and build identity.
- `src/main.ts` — App entry: installs diagnostics first, mounts the shell, runs the system check.
- `src/media/capability.ts` — Device checks asked against the exact target config, not a generic capability flag.
- `src/media/conform.test.ts` — Proves fit/pad never distorts, across 4:3, vertical and ultrawide sources.
- `src/media/conform.ts` — Scale-to-fit and pad geometry, and the reusable frame scaler the pipeline and probe share.
- `src/media/framerate.test.ts` — Proves the rounding rule and that timestamps derive from the index so error cannot accumulate.
- `src/media/framerate.ts` — CFR conform decisions: nearest standard rate, what conforming costs, and the timestamp grid.
- `src/media/inspect.ts` — Demuxes a chosen file into a SourceReport. Rejects files with no video track.
- `src/media/preflight.test.ts` — Triggers all four spec 7.3 outcomes deliberately — acceptance criterion 7.
- `src/media/preflight.ts` — The pure verdict: given what was measured, proceed / warn / discourage / block.
- `src/media/probe.ts` — The 3-second calibration probe: real decode and encode on the real file and device.
- `src/styles/app.css` — App shell styles. Carbon productive language at AAA.
- `src/styles/tokens.brand.css` — UoN brand tokens. Holds the D1 placeholder and nothing invented.
- `src/styles/tokens.carbon.css` — Carbon structural tokens. Every pair is contrast-asserted by test/contrast.test.ts.
- `src/ui/format.test.ts` — Pins the wording, so phrasing is tested rather than reviewed by opinion.
- `src/ui/format.ts` — Technical facts as plain language — durations, sizes, codecs, channel layouts.
- `src/ui/preflight-panel.ts` — Renders the verdict, naming a browser that works when the answer is no.
- `src/ui/source-panel.ts` — Renders a SourceReport, including the standing caveat about tracks we cannot see.
- `src/vite-env.d.ts` — Ambient types: the injected build globals and the File System Access API surface.
- `src/workers/job.worker.ts` — The job worker. Owns the pipeline when it lands; today proves the boundary and its error path.
- `src/workers/protocol.ts` — The typed message contract across the worker boundary.

## test

- `test/contrast.test.ts` — Makes the AAA contrast claim mechanical: every rendered pair >= 7:1 in both themes.
- `test/ebu3341/signals.ts` — EBU Tech 3341 Table 1 signals, synthesised from their published definitions.
- `test/ebu3341/tech3341.test.ts` — The compliance gate: Table 1 cases 1-23 against the meter, inside `npm run check`.
- `test/helpers/signals.ts` — Synthesised tones and silence shared by the meter tests and the EBU harness.
