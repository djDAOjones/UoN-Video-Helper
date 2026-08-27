# Full code review — 2026-08-26

- **Baseline:** `66227e51dc0905c1853d79fb927d8f009be80ad4` (`main`, clean before review)
- **Review outcome:** **Needs changes — not ready for a real-user pilot**
- **Change boundary:** Report only. No application code, protected specification, backlog, ticket, or decision-log file was changed.

## Executive summary

The app has a disciplined architecture, unusually good invariant-oriented tests, explicit streaming mux configuration, one runtime dependency, and a green canonical quality gate. Those strengths do not yet make it safe to give real recordings to users.

The review found no P0 issue and no current evidence of media egress, a committed secret, or a vulnerable installed dependency. It did find several P1 paths that can produce an incorrect file, lose a finished file, process a different file from the one shown, approve a job that cannot run, or falsely certify a safety invariant. The most important novel defect was reproduced directly: a full-scale transient at the end of a file leaves the limiter at **0 dBTP** while the app's own verifier reports about **−64.05 dBTP**. That violates the required −2 dBTP ceiling and can make both runtime and acceptance evidence look safe when it is not.

The active backlog also already contains a separate launch-blocking result, VH-50: real material measured −16.75 LUFS and −1.98 dBTP while the synthetic harness passed. Taken together, the novel P1 findings and VH-50 mean the current build should be treated as an engineering prototype, not as a trustworthy pilot build.

## Scope and method

The review covered every mapped repository area:

- root configuration and launch files, `.github/`, scripts, public branding assets, and deployment controls;
- all `src/audio/`, `src/config/`, `src/core/`, `src/media/`, `src/ui/`, `src/workers/`, `src/acceptance/`, and `src/spike/` code and colocated tests;
- `test/`, including the EBU Tech 3341 harness;
- the authoritative specification and rationale, the UI and development standards, the active backlog, current decisions, architecture, conventions, and file map;
- the installed Mediabunny source where the app depends on primary-track selection, track metadata, or generated encoder configuration.

The review used source tracing, adversarial state/lifecycle analysis, narrow executable reproductions, targeted suites, static egress/secret/dependency checks, branding-asset inspection with `ffprobe`, and the complete project gate. Real user recordings in `samples/` were not modified or used for new output. A rendered browser snapshot stalled and was abandoned; browser-dependent cases are therefore identified explicitly below rather than presented as verified.

Severity means:

- **P0:** immediate catastrophic loss/exposure on an ordinary path.
- **P1:** can corrupt or lose user work, violate a headline invariant, run the wrong job, or falsely pass a release-safety check.
- **P2:** material reliability, compatibility, accessibility, security-hardening, or maintainability defect without the same immediate impact.
- **P3:** bounded edge case, drift, or lower-impact contract gap.

Evidence labels used below are **reproduced**, **code-proven** (the control/data flow is deterministic), and **browser-dependent risk** (the faulty race or lifecycle exists, but final browser behaviour still needs a real-engine regression).

## P1 findings

### P1-01 — A terminal transient bypasses both the true-peak limiter and verifier

**Status:** Novel. **Evidence:** Reproduced.

The causal 4× FIR detects an input sample several frames after it arrives, but [`TruePeakDetector`](../../src/audio/truepeak.ts#L139) has no finish/post-roll operation and [`AudioAnalyser.finish()`](../../src/audio/analyse.ts#L44) reads it immediately. Separately, [`TruePeakLimiter.flush()`](../../src/audio/limiter.ts#L159) drains its look-ahead buffer at one fixed gain instead of clocking silence through the ordinary detector/gain path.

A 480-frame stream with a single `1.0` sample at EOF produced:

```json
{"latency":240,"samplePeak":1,"truePeakWithoutPostroll":-64.05359209046344,"truePeakWithPostroll":0,"tailFinalSample":1}
```

The emitted final sample is therefore 0 dBTP, 2 dB above the ceiling, while the unfinalized verifier reports it as approximately −64.05 dBTP. Existing true-peak and limiter tests place energy away from EOF or repeat the same unfinalized measurement blind spot.

**Required change:** Add a detector finalization/post-roll path; make limiter flush advance normal detection and gain state while returning exactly the delayed source frames; add EOF-impulse and very-short-stream regressions; confirm one produced MP4 with an independent external true-peak meter.

### P1-02 — Source audio offsets and gaps are collapsed, causing A/V desynchronisation

**Status:** Novel. **Evidence:** Code-proven.

[`createContentAudioProcessor()`](../../src/media/audio-plan.ts#L147) generates timestamps from a contiguous `emittedFrames` counter and never reads the incoming [`AudioSample.timestamp`](../../src/media/audio-plan.ts#L186). The video lane, by contrast, preserves each frame's position relative to the first video timestamp in [`pipeline.ts`](../../src/media/pipeline.ts#L420).

An audio track that begins 500 ms after picture is moved to time zero; a genuine two-second midstream discontinuity is removed, making everything after it two seconds early. Analysis also concatenates the gap, so silence warnings and the macro envelope describe different timing from the source container. The acceptance sync meter has the same blind spot: audio markers use cumulative decoded frames in [`measure.ts`](../../src/acceptance/measure.ts#L119), while video markers use timestamps.

**Required change:** Establish one source timeline origin, retain audio timestamps, insert explicit silence for real gaps, and compensate only measured DSP/encoder latency. Add delayed-start and midstream-gap marker fixtures whose verifier also uses sample timestamps.

### P1-03 — Late inspection/preflight responses can arm Start for the wrong file or preset

**Status:** Novel. **Evidence:** Code-proven.

Every file change launches an uncancelled inspection followed by preflight in [`main.ts`](../../src/main.ts#L390). Preset changes launch another preflight in [`main.ts`](../../src/main.ts#L485). There is no selection epoch, current-request check, or atomic `{file, preset, verdict}` state. Any response that arrives last can call [`showProcessControls(file)`](../../src/main.ts#L641), even if the picker now displays another file. During a preset recheck, the old Start target also remains available.

Rapid A → B selection can therefore show B while Start still submits A. A slow old preset check can also approve Start after the user has chosen another preset. The subtitle reader has the same stale-completion shape in [`main.ts`](../../src/main.ts#L71).

**Required change:** Bind file, subtitle, preset, report, and verdict into one immutable selection generation; invalidate older request IDs; hide/disable Start while any relevant check is pending; ignore every stale response. Add deterministic deferred-promise tests for A → B and rapid preset changes.

### P1-04 — Preflight can approve a job whose input cannot decode or whose workspace cannot exist

**Status:** Novel. **Evidence:** Code-proven.

Inspection records exact video/audio decode support in [`inspect.ts`](../../src/media/inspect.ts#L213), and capability inspection records OPFS and secure-context support in [`capability.ts`](../../src/media/capability.ts#L28). None of those fields enter [`PreflightInput`](../../src/media/preflight.ts#L35) or the verdict assembled in [`job.worker.ts`](../../src/workers/job.worker.ts#L340). A decode failure during the calibration probe is also collapsed to “unmeasured” in [`probe.ts`](../../src/media/probe.ts#L189), which becomes only a warning.

An unsupported source codec, unavailable OPFS, or insecure context can therefore reach a visible Start button and fail only after expensive work begins. The source panel even promises that full guidance will arrive with preflight for video decode failure, but no such blocking reason exists.

**Required change:** Add exact audio/video decode, secure-context, and usable-OPFS gates; return structured probe failure causes so unsupported execution is a block and only an unreliable time estimate is a warning. Exercise each block in a real browser.

### P1-05 — The finished file's OPFS backing can be deleted before saving finishes

**Status:** Novel. **Evidence:** Browser-dependent risk supported by explicit local ownership contracts.

The fallback path clicks an object-URL download and returns immediately in [`save.ts`](../../src/media/save.ts#L59). The caller then discards the job workspace in [`main.ts`](../../src/main.ts#L681), although the worker protocol explicitly says the returned `File` becomes unreadable when that workspace is removed in [`protocol.ts`](../../src/workers/protocol.ts#L71). A multi-gigabyte Firefox/Safari download may still be reading after `anchor.click()` returns; the fixed 60-second URL lifetime is another unproved ceiling.

There is a second route to the same failure. Saving disables only the Save button, not job controls. Starting another encode calls [`releaseFinished()`](../../src/workers/job.worker.ts#L106), which can dispose the old workspace while a picker `pipeTo()` is still reading it.

**Required change:** Treat save as part of the job lifecycle. Keep the workspace until a streaming picker write has resolved; retain fallback downloads until an explicit later lifecycle point rather than a timer; prohibit a new job while save is active. Browser-test a throttled large download and a concurrent new-job attempt.

### P1-06 — The Save picker can overwrite the source despite the absolute “never modified” promise

**Status:** Novel. **Evidence:** Code-proven capability; destructive result requires a user to confirm the OS replacement prompt.

[`saveFile()`](../../src/media/save.ts#L33) accepts whatever handle the user chooses and immediately creates a writable stream. The app retains only the source filename, not its file-system handle, so it never uses `isSameEntry()` or another identity check. The test in [`save.test.ts`](../../src/media/save.test.ts#L27) proves only that the suggested string differs from the original; it does not prevent the user selecting the original file in the dialogue.

That makes the headline promise in the UI and [`README.md`](../../README.md#L80) false under an allowed application flow.

**Required change:** On supporting browsers, acquire and retain an input `FileSystemFileHandle` and reject a same-entry save; otherwise use a save path whose limitations are stated honestly. Add a fake-handle regression for `isSameEntry()` and a manual overwrite rehearsal.

### P1-07 — Cancel is not authoritative across the whole job

**Status:** Novel residual after VH-38/VH-51. **Evidence:** Code-proven.

The process controller is registered only after awaiting old-result cleanup in [`job.worker.ts`](../../src/workers/job.worker.ts#L121), while Cancel only looks in that map. A cancellation during slow cleanup is dropped. Later, the pipeline checks cancellation before `output.finalize()` but not after it in [`pipeline.ts`](../../src/media/pipeline.ts#L556). Finished-file verification then performs another full audio traversal without a signal and posts `processed` unconditionally in [`job.worker.ts`](../../src/workers/job.worker.ts#L174).

The user can press Cancel during cleanup, finalize, or verification and still receive “Your video is ready.” The current acceptance case cancels only during encode.

**Required change:** Register the controller before the first await, propagate the signal through fetch/finalize/verification where supported, and check it immediately before retaining or posting success. Test every named cancellation phase and assert both `cancelled` and an empty job directory.

### P1-08 — Additional A/V tracks and supported track metadata are silently lost

**Status:** Novel; embedded-subtitle extraction itself remains VH-29. **Evidence:** Code-proven.

Inspection describes the first video/audio entries in [`inspect.ts`](../../src/media/inspect.ts#L189), while production later chooses Mediabunny's primary tracks in [`pipeline.ts`](../../src/media/pipeline.ts#L224). Those are not guaranteed to be the same tracks. Only one output video and audio track is created, `reportedTrackCount` is unused as a gate, and language/name/disposition are not carried. File-metadata failure is logged but never shown to the user in [`pipeline.ts`](../../src/media/pipeline.ts#L321).

An OBS file with programme audio plus commentary can therefore be inspected against one track, processed from another, and silently lose the rest. This violates the explicit “warn before processing” rule for anything that cannot be carried.

**Required change:** Inspect the exact primary tracks the pipeline will use; enumerate every unsupported additional track before Start; carry language, name, disposition, and supported metadata; convert metadata-copy failure into a visible pre-processing warning where it is knowable. Add a multi-track fixture.

### P1-09 — OPFS orphan checking and deletion are not atomic

**Status:** Novel residual after shipped VH-35. **Evidence:** Code-proven race; needs a browser stress regression.

The sweep briefly asks for an available lock in [`opfs.ts`](../../src/media/opfs.ts#L58), releases it when the callback returns, and deletes the directory later in [`opfs.ts`](../../src/media/opfs.ts#L123). A new workspace creates its directory before claiming it in [`opfs.ts`](../../src/media/opfs.ts#L191); if the sweeper temporarily owns the lock, the claim logs a warning and continues unprotected.

A boot sweep can therefore classify a newly-created directory as free, release its test lock, allow the job to start, and then delete the live directory. The unit tests cover only selection, not lock/delete atomicity.

**Required change:** Acquire the job lock before creating/using the directory and perform orphan deletion while holding the same lock callback. Stress simultaneous tab boot/start in all supported engines.

### P1-10 — Long jobs have neither required wake protection nor unload protection

**Status:** Novel. **Evidence:** Code-proven absence.

The job lifecycle in [`main.ts`](../../src/main.ts#L551) only disables controls. There is no Screen Wake Lock or `beforeunload` handler anywhere in the runtime, despite both being explicit requirements in [spec §7.5](../../docs/01-specification.md#L361).

An accidental reload or a sleeping laptop can discard hours of work without warning.

**Required change:** Acquire/reacquire a screen wake lock while processing, release it on every exit path, and install/remove `beforeunload` for the exact in-flight interval. Test lifecycle cleanup and rehearse sleep/visibility/reload in real browsers.

### P1-11 — Acceptance criterion 9 can falsely certify “nothing leaves the device”

**Status:** Novel. **Evidence:** Code-proven safety-net gap; static scan found no current runtime upload.

[`EgressWatch`](../../src/acceptance/measure.ts#L200) wraps only main-global `fetch` and `sendBeacon`, while the actual job runs and fetches branding inside a Worker. It reads `init.body` but misses a body already stored in a `Request`, does not inspect XHR/WebSocket bodies, and treats same-origin requests as safe unless the wrapper saw a body. Resource timing reveals URLs, not payloads. [`run.ts`](../../src/acceptance/run.ts#L423) nevertheless turns those incomplete observations into a pass.

The current source scan found no runtime upload, analytics, beacon, XHR, or WebSocket path; the only runtime fetch is same-origin inbound branding. The defect is that a future regression could pass the headline release criterion.

**Required change:** Capture network activity at browser/protocol level for main thread and workers, fail on every outbound body regardless of origin, and separately reject filenames/media characteristics in URLs and headers. Add deliberate Request-body, worker-fetch, XHR, same-origin, and cross-origin negative controls that prove the harness fails.

## P2 findings

| ID | Finding | Evidence and required change |
| --- | --- | --- |
| P2-01 | Pause freeze is undone by centered smoothing | [`macrolevel.ts`](../../src/audio/macrolevel.ts#L72) freezes raw correction before a centred 15-second window, so future speech moves gain during a pause. Reproduction moved gain from −5 dB to −1.29 dB inside a middle pause and to +1.85 dB before leading-silence speech began. Freeze the final applied envelope during below-threshold regions and add leading/middle/trailing regressions. |
| P2-02 | Preflight does not validate the configuration production actually encodes | Preflight hard-codes `avc1.640033` in [`presets.ts`](../../src/config/presets.ts#L332), while production gives Mediabunny an abstract `codec: 'avc'` config in [`encoding.ts`](../../src/media/encoding.ts#L21). This can falsely block low shapes and miss a production-derived failure. It also promises 3840×2160@60 while Level 5.1 allows 983,040 macroblocks/s and that shape needs 1,944,000; the official [ITU-T H.264 Table A-1](https://www.itu.int/rec/dologin_pub.asp?id=T-REC-H.264-202408-I%21%21PDF-E&lang=e&type=items) requires Level 5.2's higher rate. Validate the exact final encoder config through one shared path and test 720p through 4K60 in real engines. |
| P2-03 | The runtime verifier does not enforce the true-peak ceiling | The worker measures `truePeakDbtp` but calls only the loudness warning and derives `onTarget` from loudness in [`job.worker.ts`](../../src/workers/job.worker.ts#L174). Verification failure is log-only. This reinforces active VH-50. Check both invariants, show a visible result warning if verification fails, and prevent a “verified” state when either measurement is unavailable. |
| P2-04 | The “measured” duration estimate omits substantial production work | [`probe.ts`](../../src/media/probe.ts#L135) uses a `NullTarget`, omits OPFS backpressure, compositing, DSP/encode detail, finalize, and the full output verification traversal, and arithmetically counts only two audio passes. Use bounded samples of the actual stages and separate audio/video durations. Keep separate from VH-31's size-estimate defect. |
| P2-05 | Fixed inspection/preflight deadlines do not actually cancel their work | [`main.ts`](../../src/main.ts#L250) posts cancel at 120/180 seconds, but [`job.worker.ts`](../../src/workers/job.worker.ts#L63) registers only process requests in the cancellable map. Timed-out inspection/preflight continues full analysis/probing and can overlap retries. Give all long worker requests an abort controller or selection-generation cancellation and move the tuneable limits into config. |
| P2-06 | Starting over silently destroys an unsaved result | The UI removes the old Save control when another job starts in [`main.ts`](../../src/main.ts#L562), and the worker disposes every retained result before the next process in [`job.worker.ts`](../../src/workers/job.worker.ts#L106). Require an explicit save/discard/start-over transition. |
| P2-07 | Cancellation acceptance bypasses the real product path | [`run.ts`](../../src/acceptance/run.ts#L348) cancels a main-thread pipeline helper, not the worker protocol or worker-only sync-handle path. Drive the real worker, post `cancel`, await `cancelled`, and inspect OPFS. |
| P2-08 | Acceptance criterion 3 is hard-coded green | [`run.ts`](../../src/acceptance/run.ts#L432) inserts a static historical pass for EBU conformance. The page can be green when the gate was not run or is failing. Execute the meter suite through a shared artifact/result, or report it as external/unverified rather than `pass`. |
| P2-09 | Production hides the traceable build identity | [`main.ts`](../../src/main.ts#L152) renders `BUILD_ID` only in development, contrary to [`DEV-INFRASTRUCTURE.md`](../../DEV-INFRASTRUCTURE.md#L355). Expose both product version and build identity in production. |
| P2-10 | Diagnostics omit required job context | [`diagnostics.ts`](../../src/core/diagnostics.ts#L22) has environment, errors, and logs but no redacted SourceReport shape, capability result, current view, or JobSpec. Add explicit snapshot inputs and redaction tests; never add filename or media payload. |
| P2-11 | Deployment credentials are granted to the dependency-running build job | Top-level `pages: write` and `id-token: write` in [`deploy-pages.yml`](../../.github/workflows/deploy-pages.yml#L19) apply to both jobs. Keep top-level/build at `contents: read` and grant Pages/OIDC only to `deploy`. |
| P2-12 | Cross-engine success counts include skipped engines | [`run-in-engines.mjs`](../../scripts/run-in-engines.mjs#L345) records missing engines as skipped, but its final count subtracts only failures. Report completed/skipped/failed independently and fail any workflow that explicitly required an unavailable engine. |
| P2-13 | A discouraged job needs no acknowledgement | Preflight shows Start for every non-block in [`main.ts`](../../src/main.ts#L452), while spec §7.3 says “allow continue after acknowledgement.” Add an explicit acknowledgement state for `discourage` outcomes without exposing technical settings. |
| P2-14 | The build guard can publish real media outside `public/spike/` | [`.gitignore`](../../.gitignore#L19) covers only `samples/`, MOV, and MKV, and [`check-placeholders.mjs`](../../scripts/check-placeholders.mjs#L73) scans only `public/spike/`. A copied MP4/WebM elsewhere under `public/` ships. Add an allow-list for known branding assets and reject every other media file in copied build inputs. |

## P3 findings

| ID | Finding | Evidence and required change |
| --- | --- | --- |
| P3-01 | Entirely silent audio does not trigger the extended-silence warning | [`warnings.ts`](../../src/audio/warnings.ts#L108) runs silence detection only when finite loudness exists; all-silence is all `-Infinity`. The three-second measurement window also understates a real gap. Evaluate silence outside the audible guard and test the actual analyser with 31-second and all-silent sources. |
| P3-02 | Tuneable values bypass `src/config/`, while declared config is dead | Examples include the clipping default in [`truepeak.ts`](../../src/audio/truepeak.ts#L100), noise-gap threshold in [`warnings.ts`](../../src/audio/warnings.ts#L16), detector/knee constants in [`compressor.ts`](../../src/audio/compressor.ts#L27), and envelope step in [`macrolevel.ts`](../../src/audio/macrolevel.ts#L30). `WARNING_THRESHOLDS.clippingDbtp` and `COMPRESSOR.softKnee` are not operative. Centralise project choices and test that config feeds runtime. |
| P3-03 | Limiter sample indices wrap on extremely long inputs | [`limiter.ts`](../../src/audio/limiter.ts#L29) stores an ever-growing sample position in `Int32Array`; it wraps after about 12.4 hours at 48 kHz and can make the expiry loop cycle forever. Use safe-number/`Float64Array` indices. |
| P3-04 | The native progress element has no accessible name | [`index.html`](../../index.html#L107) has neither a label nor `aria-label`/`aria-labelledby`. Associate it with the live stage/status text and verify name/value announcements with assistive technology. |
| P3-05 | Maintainer documentation and one generator have material drift | [`architecture.md`](../../pm_skills/project/architecture.md#L56) names nonexistent bus/store/sidecar/branding/UI modules and an obsolete protocol; [`DEV-INFRASTRUCTURE.md`](../../DEV-INFRASTRUCTURE.md#L377) says local-only while [`deploy-pages.yml`](../../.github/workflows/deploy-pages.yml#L14) deploys every push to `main`; [`gen-placeholder-branding.mjs`](../../scripts/gen-placeholder-branding.mjs#L38) still generates obsolete closing placeholders. Reconcile in the protected-doc/doc-sync workflow rather than silently editing here. |

## Already-tracked work confirmed by this review

These are not duplicate review findings and should keep their existing IDs:

| Item | Review conclusion |
| --- | --- |
| **VH-50** | Launch blocker. Real output already missed −16 LUFS and −2 dBTP while the synthetic harness passed. P2-03 and P1-01 reveal additional verifier blind spots, but do not replace the ticket's real-material result. |
| **VH-31** | Size estimates remain materially inaccurate; review additionally found a separate duration-estimate problem (P2-04). |
| **VH-49** | Exact AAC encode checking now blocks Firefox appropriately; supported-browser sign-off remains. |
| **VH-27** | Authentic EBU cases 7 and 8 remain explicitly skipped; the synthetic cases are not a substitute. |
| **VH-19** | Content-adaptive smaller-output bitrate remains required; no duplicate was opened. |
| **VH-25** | Picture boundary fades remain absent; audio boundary fades are present. |
| **VH-32 / VH-52** | The planned UI-quality and long-stage-legibility passes remain relevant. |
| **VH-17** | `fastStart: false` is explicit and safe from in-memory buffering; progressive-start reserve remains a measured follow-up. |
| **VH-23 / VH-46b** | Opening assets and hidden closing transitions remain deferred. Dormant paths should not be treated as user-ready. |
| **VH-26** | HDR/colour handling remains open. P2-02 adds a specific 4K60 AVC-level contradiction to consider in that compatibility work. |

## What is working well

- Every Mediabunny output sets `fastStart` explicitly; no runtime output path opts into whole-file in-memory muxing.
- The video/audio lanes are bounded, awaited for backpressure, mutually aborted, and disciplined about sample closure.
- Source-only loudness planning and branding-audio bypass are structurally separated.
- The loudness/DSP code is pure and Node-testable, with strong clause-level comments and good chunk-boundary coverage.
- Exact AAC configuration probing correctly catches Firefox's known refusal.
- CFR, shape, bitrate-basis, branding timeline, WebVTT offset, logger/redaction, and OPFS selection rules have meaningful invariant tests.
- The UI uses semantic labels/fieldsets, a skip link, a polite status region, visible word marks, tokenised focus treatment, and 44 px targets.
- User-derived UI content is written with `textContent`; the only `innerHTML` found is a fixed internal template.
- The runtime source scan found no analytics, upload, beacon, XHR, WebSocket, or media-characteristic egress. The one runtime fetch is same-origin inbound branding.
- There is one runtime dependency, `mediabunny`, as required.

## Verification record

### Canonical gate

`npm run check` passed at the reviewed baseline:

- placeholder/secret-shape guard: clean;
- TypeScript: passed;
- ESLint: passed with zero warnings;
- Vitest: **32 files; 355 passed, 1 skipped**;
- production build: passed;
- Markdown lint: passed;
- internal links: **62 files, 0 broken links**;
- memory structure: **0 structural failures**.

The memory checker reported five non-blocking warnings: backlog Active is over its word budget and VH-25, VH-31, VH-32, and VH-49 ticket files exceed their soft size guide. Those are maintenance signals, not reasons to prune review evidence automatically.

### Focused checks

- Audio/config/EBU: 13 files; **147 passed, 1 skipped**.
- Media: 12 files; **128 passed**.
- UI/core/acceptance-focused: 7 files; **80 passed**.
- Runtime dependency tree: only `mediabunny` plus its bundled type packages.
- `npm audit --omit=dev --json`: **0 vulnerabilities**.
- `npm audit --json`: **0 vulnerabilities across 243 installed dependencies**.
- `ffprobe`: all 16 shipped branding videos matched their wired codec, resolution, frame rate, and nominal duration; no asset mismatch was found.
- Git sanity: the reviewed baseline matched `origin/main`; no conflict artefact or pre-existing worktree change was present.

### Not verified in this pass

- A full rendered-browser walkthrough: the local browser DOM snapshot stalled and was interrupted.
- Safari/Firefox/Chrome completion of a real end-to-end source job.
- Large throttled fallback download completion.
- Multi-tab OPFS boot/start races.
- Sleep/wake, reload, and assistive-technology behaviour.
- Real-material loudness, sync, HDR/phone colour, slide legibility, and EchoVideo ingestion beyond the results already recorded in active tickets.

## Recommended remediation order

1. **Protect output correctness:** P1-01 terminal true peak, P1-02 audio timing, and VH-50. Do not call the output correctly levelled until independent real-file measurements pass.
2. **Make the selected job atomic:** P1-03 stale requests and P1-04 preflight blockers.
3. **Make result ownership safe:** P1-05/P1-06 saving, P1-07 cancellation, and P1-09 OPFS lock atomicity.
4. **Make data loss visible:** P1-08 multi-track/metadata handling.
5. **Protect long work and the safety case:** P1-10 wake/unload behaviour and P1-11 egress instrumentation.
6. **Then close P2/P3 gaps and existing compatibility/UI tickets**, rerun the full gate, and perform the named real-browser/manual checks on actual representative media.

The next pilot decision should be based on a new end-to-end evidence run after items 1–5, not on the current green unit/build gate alone.
