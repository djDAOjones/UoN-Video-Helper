# Updated critique of the UoN Video Helper comprehensive review

**Review date:** 26 August 2026  
**Repository baseline:** `66227e51dc0905c1853d79fb927d8f009be80ad4`  
**Current checkout at durable integration:** `fad65f1c4e298b563a68f21f3de8d2f6a18dd5a8`  
**Reviewed branch:** `codex/repository-review-remediation`  
**Scope:** read-only verification of the three documents in
`reviews/2026-08-26/`

## 1. Executive verdict

The comprehensive review is directionally reliable. Its central warning is
supported: the current application can report success despite an output that
misses the audio contract, loses source audio, processes a job different from
the one preflighted, or does not stop authoritatively when cancelled. Those are
not speculative architecture concerns; several were reproduced against the
real modules.

The review should nevertheless not be used as an implementation plan without
correction. Eight findings stand substantially as written. Eight are right in
substance but combine claims of different evidentiary strength, contain stale
details, prescribe an unsafe remedy, or misstate effort and dependencies. No
R-series finding is wholly rejected, but several subclaims are.

- **Agree:** R-02, R-03, R-05, R-07, R-09, R-12, R-13 and R-14.
- **Partly agree:** R-01, R-04, R-06, R-08, R-10, R-11, R-15 and R-16.
- **Disagree as a whole finding:** none. The disagreements concern particular
  mechanisms, remedies, scope statements and priorities.

The most consequential corrections are:

1. R-01 is independent of R-02 as a root cause. R-02 should still land before
   final R-01 calibration because the finished detector and limiter are inputs
   to that sign-off, not because EOF samples cause the gain-loop error.
2. The 1 LU `targetMissedByLu` threshold is the specification's advisory
   warning threshold, not the ±0.5 LU acceptance tolerance. It should not
   simply be tightened. A separate fail-closed postcondition is required.
3. R-02 needs a 12-input-frame FIR drain, not the six-frame explanation in the
   first critique. A six-frame delay exposes the exact-sample centre, but a
   49-tap, four-phase FIR needs 12 input frames for its complete tail response.
4. EBU Tech 3342 v4 explicitly requires at least 1.5 seconds of trailing
   silence for file LRA. The first critique was wrong to reject that procedure.
   It was right that using the resulting value directly as the macro-levelling
   switch can make processing worse. Reporting and processing eligibility need
   separate, standards-aware semantics.
5. R-06's AAC criticism is stale, while its video issue is deeper than probe
   drift: the fixed probe and Mediabunny's present AVC level selection can both
   choose Level 5.1 for 3840×2160 at 60 fps even though that rate needs Level
   5.2.
6. R-04 is not one homogeneous confirmed defect. Result/save lifetime and the
   ability to overwrite the source are code-proven; actual fallback corruption
   and an OPFS short write remain browser-dependent. Ignoring the write count is
   nevertheless a standards-defined integrity gap and a cheap fix.
7. R-08 is a real race. The comprehensive review overstates implementation
   risk, but the first critique understates the repair as a two-line reorder.
   Lock acquisition must fail closed before directory creation/use, and the
   sweep deletion must occur inside the lock callback.
8. The comprehensive consolidation omitted six useful earlier findings, not
   five. It also dropped the finding that the supposedly measured duration
   estimate omits substantial production work.

The current green quality gate does not contradict these conclusions. Its
acceptance layer crops the positions that expose R-02/R-03, can pass when no
output audio was measured, and does not exercise the worker cancellation path.
It cannot currently refute the product defects its UI says passed.

## 2. Repository baseline and drift

The investigation ran against the reviewed source commit:

```text
reviewed source  66227e51dc0905c1853d79fb927d8f009be80ad4
current HEAD     fad65f1c4e298b563a68f21f3de8d2f6a18dd5a8
branch           codex/repository-review-remediation
```

While this critique was being made durable, the branch advanced by one commit,
`fad65f1` (`VH-53: share project context across coding agents`). Its six
changed paths are root/project documentation only: `.gitignore`, `CLAUDE.md`,
`README.md`, `decision-log.md`, `file-map.md` and `trajectory.md`.
Local and remote `main` remain at `66227e5`; the remote remediation branch
matches `fad65f1`. No `src/`, test, configuration, workflow or media path
changed. There is therefore documentation drift but no product-source drift:
none of R-01 through R-16 has been fixed or invalidated.

The pre-existing worktree state was preserved:

```text
 M .markdownlint-cli2.jsonc
?? pm_skills/project/code-review-2026-08-26.md
?? reviews/
```

The modified lint configuration only ignores the 929-line comprehensive
review. The existing review bundle and earlier review file were not altered
during the investigation; after explicit approval, this updated critique and
its index entry were added as the only durable-integration changes. The real
recordings under `samples/` remain untracked and were treated as read-only
local evidence. Corpus observations in this critique are therefore
observations of the present local corpus, not facts carried by commit
`66227e5`.

## 3. Method and limitations

The following were read in full or by the repository's prescribed sectioning:

- all three review documents and the review-bundle index;
- the hot project context and relevant backlog, decision-log and file-map
  sections;
- the specification, technical rationale, open decisions, infrastructure and
  UI standards;
- the source, tests and dependency code implicated by every R-series finding;
- the relevant primary standards and platform documentation.

Material claims were classified as code-proven, experimentally reproduced,
standards/product-contract mismatches, unguarded invariants, browser-dependent
risks, or hardening recommendations. Small test media and harnesses lived only
under temporary directories and were removed. No mocked WebCodecs result was
used as capability evidence.

Primary references used for external claims include:

- [ITU-R BS.1770-4](https://www.itu.int/dms_pubrec/itu-r/rec/bs/R-REC-BS.1770-4-201510-S!!PDF-E.pdf)
  for true-peak measurement;
- [EBU Tech 3342 v4](https://tech.ebu.ch/docs/tech/tech3342.pdf) for file-LRA
  measurement and its cautions around short material and silence;
- the [File System Standard](https://fs.spec.whatwg.org/) for synchronous write
  counts and file snapshots;
- the [Web Locks specification](https://w3c.github.io/web-locks/) for callback
  lifetime;
- [WebCodecs](https://www.w3.org/TR/webcodecs/) and
  [ITU-T H.264](https://www.itu.int/rec/t-rec-h.264) for exact configuration and
  AVC level constraints;
- the [Screen Wake Lock specification](https://www.w3.org/TR/screen-wake-lock/)
  for lifecycle behaviour;
- GitHub's [workflow-permission syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
  and [secure-use guidance](https://docs.github.com/en/actions/reference/security/secure-use)
  for R-13;
- WCAG's [Name, Role, Value explanation](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)
  and [failure F68](https://www.w3.org/WAI/WCAG22/Techniques/failures/F68)
  for R-14.

Limitations remain important. No real OPFS short write, failed large fallback
download, live workspace deletion, source overwrite, sleep interruption or
cross-engine 4K60 outcome was observed. Those claims are not promoted beyond
their evidence. Real AAC/resampler behaviour after candidate DSP repairs,
Safari/Firefox differences, subjective audio quality and production CI policy
were also not tested.

## 4. Finding-by-finding conclusions

| ID | Conclusion | Evidence class | Correct decision significance |
| --- | --- | --- | --- |
| R-01 | **Partly agree** | Experimentally reproduced product-contract defect | Pilot and release blocker. Preserve the 1 LU advisory; add a separate finite, audio-present, ±0.5 LU and ≤−2 dBTP hard postcondition. Use a bounded full-chain solver with infeasibility handling. |
| R-02 | **Agree** | Experimentally reproduced DSP defect | Pilot and release blocker. Drain all 12 FIR input frames and clock limiter gain through its look-ahead while emitting only original-duration audio. It is independent of R-01's cause but should precede final calibration. |
| R-03 | **Agree** | Code-proven and current-corpus exposure | Pilot and release blocker. Audio timestamps and gaps collapse, then leading samples can be deleted. Four local sources, not three, have meaningful first-44 ms energy. |
| R-04 | **Partly agree** | Mixed: code-proven defects, unguarded invariant and browser-dependent risks | Result ownership/save completion is a pilot and release blocker. Short-write checking is immediate cheap prevention, but actual short writes and fallback corruption were not observed. |
| R-05 | **Agree** | Code-proven asynchronous race | Pilot and release blocker. The enabled Start control can refer to a stale file/preset combination. |
| R-06 | **Partly agree** | Code-proven missing gates plus standards/config mismatch | Pilot and release blocker unless the pilot is constrained to an exact tested job/device path. AAC is fixed; decode, OPFS and secure-context gates are absent; 4K60 AVC level selection remains invalid. |
| R-07 | **Agree** | Code-proven cancellation and ownership defects; browser warning observed previously | Pilot and release blocker. Cancellation can be lost or followed by success, and yielded native samples can escape their closing `finally`. |
| R-08 | **Partly agree** | Code-proven TOCTOU; destructive browser interleaving not observed | General-release blocker; pilot blocker unless concurrent tabs are credibly excluded. Small code change, low-to-medium implementation risk, medium verification effort. |
| R-09 | **Agree** | Experimentally reproduced track-selection mismatch and code-proven silent loss | Release blocker under the no-silent-loss invariant. A controlled pilot may proceed only after a fail-closed single-track gate or explicit loss acknowledgement. |
| R-10 | **Partly agree** | Standards mismatch and experimentally reproduced processing hazard | Release blocker for trusted audio; pilot blocker unless macro processing is conservatively gated. The standards tail is correct, but the report-LRA value is not automatically a safe processing trigger. Pause freeze is a definite contract mismatch. |
| R-11 | **Partly agree** | Code-proven false-pass routes | Acceptance-evidence blocker. Criterion 3's omission is disclosed, not concealed. Add negative controls now and update success expectations after product fixes. |
| R-12 | **Agree** | Code-proven specification omission | Pilot blocker if long-file reliability is promised; general-release blocker otherwise. Actual platform rejection/reacquisition behaviour remains manual evidence. |
| R-13 | **Agree** | Strongly supported release-boundary risk; no current leak | Public-release hardening, not proof of a present compromise. The public-media allowlist is an immediate cheap prevention. |
| R-14 | **Agree** | Code-proven UI/spec defects | General-release accessibility/error-prevention blocker under the project's AAA policy; both fixes are small. |
| R-15 | **Partly agree** | Confirmed documentation/implementation drift with one browser-dependent outcome | Split into deployment, offline, version, diagnostics and gate-integrity items. Do not mislabel absent opening branding as a v1 feature gap. |
| R-16 | **Partly agree** | Arithmetic/code-proven duration-linear retention | Ordinary low-priority performance defect, not whole-media buffering. Distinguish traversal peak from retained encoding state; there is no specified one-hour cap. |

## 5. Detailed corrections and qualifications

### R-01 — close the actual gain loop, not the warning threshold

`src/media/audio-plan.ts:88-135` measures pass B through `AudioChain` with
`gainDb: null`. In `src/audio/chain.ts:41-48`, that also means no limiter. Pass
C then adds the calculated gain and a nonlinear limiter. The system measured to
choose gain is therefore not the system rendered. Final verification in
`src/workers/job.worker.ts:174-211` checks only an advisory loudness warning,
logs true peak without enforcing it, swallows verification exceptions and can
still publish `processed`.

The comprehensive review is right about the failure and the need to calibrate
the complete path. The first critique's threshold recommendation is wrong.
Specification §5.4 intentionally warns only when the target is missed by more
than 1 LU (`docs/01-specification.md:221-233`); formal acceptance is ±0.5 LU
and ≤−2 dBTP (`docs/01-specification.md:484-496`). These are two different
surfaces. Keep the advisory threshold unless the protected specification is
changed, and introduce a separate hard postcondition using
`INTEGRATED_TOLERANCE_LU`.

A naive repeated correction is unsafe. A real-module synthetic trial gave:

| Corpus | Initial output | Behaviour of repeated correction |
| --- | ---: | --- |
| 0.1 s hot burst per second | −16.2536 LUFS | Bounded iterations converged through −16.1446, −16.0824 and −16.0466 LUFS. |
| Sparse full-scale impulses | −41.6363 LUFS | Naive gain rose from +23.70 to +121.38 dB while output remained around −38 LUFS. |

The sparse case is not representative speech; it proves that peak-constrained
material needs maximum gain, convergence/monotonicity checks and a visible
infeasible outcome. A pre-encode solver also cannot guarantee the result after
resampling and AAC. Decoded-output verification, calibrated headroom or a
bounded re-encode policy remains necessary.

R-01 does not depend on R-02 causally. Its design can proceed in parallel. The
R-02 finalization repair should nevertheless land before R-01's final corpus
calibration because otherwise both the limiter and the verifying meter have
incorrect EOF semantics.

### R-02 — the first critique's six-sample explanation is incomplete

The core reproduction stands. A full-scale sample at the final frame was read
as −64.0536 dBTP by the current detector and emerged from the current limiter
at 0 dBFS rather than the −2 dBTP ceiling.

The polyphase FIR has 49 taps and 13 taps per phase. Six subsequent samples are
enough for the phase-0 centre to see the exact final sample, which explains the
first critique's offset table. Twelve input frames are needed to drain the
complete FIR response. The safe semantic is therefore an idempotent detector
finalization over `PHASE_TAPS - 1` virtual zero frames, not a magic six-sample
pad.

The limiter must clock zeros through the ordinary detector/envelope path for
its look-ahead duration and return only delayed original frames. A 50-signal
temporary boundary corpus covering lengths 1–1000 and chunk sizes 1, 7, 239,
240 and 4096 produced exact lengths, bit-identical results across chunking and
a worst peak of −1.9999996 dBTP with that candidate mechanic. Still unresolved
are `clippedSampleCount` semantics for virtual samples and decoded-MP4/AAC
confirmation.

### R-03 — the mechanism is stronger, and the corpus count is four

`src/media/audio-plan.ts:147-189` assigns timestamps from emitted frame count
and does not use the decoded sample timestamp. Initial offsets and internal
gaps therefore collapse. `src/media/encoder-delay.ts:127-165` then closes or
slices leading samples during AAC delay compensation, while video preserves
source-relative time in `src/media/pipeline.ts:420-434`.

The acceptance harness repeats the blind spot: audio time is reconstructed
from cumulative frames (`src/acceptance/measure.ts:119-139`), and its sync
markers start at one second (`src/acceptance/fixtures.ts:74-78`). A green sync
criterion does not establish source-timeline conservation.

The first critique's corpus scan was case-sensitive and omitted `C0413.MP4`.
The corrected present-corpus result is:

```text
−26.4 dBFS  LIBA2002 …
−27.0 dBFS  Pelvis …
−32.2 dBFS  C0413.MP4
−47.8 dBFS  CULT1027 …
```

The exact audible result still needs real-engine tests using t=0 content, a
non-zero audio start and an internal gap. The timestamp destruction itself is
code-proven and violates the project's silent-data-loss rule.

### R-04 — split integrity checks from browser manifestations

Four different issues should not share one evidence label or estimate.

1. `src/media/opfs.ts:304-307` ignores the synchronous `write()` byte count.
   The File System Standard defines that count so partial writes can be
   detected and handled. This is a confirmed unguarded invariant; no actual
   OPFS short write or quota-induced truncation was observed. A write-all loop
   is small and should land immediately.
2. Post-output verification checks only primary audio and catches exceptions
   before publishing success. Missing/corrupt expected output is therefore a
   code-proven false-success path.
3. Picker saving waits for `pipeTo()`, but a second job can release the prior
   workspace while the save is reading. Fallback saving returns immediately
   after `anchor.click()` and main then discards the backing workspace. That
   lifetime race is code-proven; actual failed consumption by a particular
   engine is browser-dependent.
4. The source is selected as a `File`, while the save picker returns only a
   destination handle. The current design therefore has no source handle for
   `isSameEntry()`. The app can overwrite the original if the user selects it;
   that destructive capability is code-proven, although the OS dialogue and
   user choice are preconditions.

Estimate separately: write-count handling is small; result leasing and blocking
a competing process are small-to-medium; reliable fallback retention requires
cross-engine work; source identity is medium and may need a supporting-browser
open-picker path plus a defined fallback policy.

### R-05 and R-06 — bind one exact, executable job

R-05 is confirmed without qualification. `src/main.ts:390-490` launches
uncancelled asynchronous inspection/preflight chains. Any late response can
call `showProcessControls(file)`. Start then combines mutable `jobFile` with
the currently selected preset rather than the tuple that passed. Request IDs
correlate replies but do not protect current UI state. A deterministic
deferred-response test should prove stale results cannot re-enable Start.

R-06 contains one stale claim and one understated problem:

- AAC probing now uses the exact runtime AAC-LC sample rate, channel count and
  preset bitrate. VH-49 shipped that correction; do not redo it.
- OPFS, secure-context and per-track decode support are recorded but omitted
  from the blocking preflight verdict. Probe failure can degrade to an
  “estimate unavailable” warning. Those are current code defects.
- The video probe fixes `avc1.640033`, while runtime supplies Mediabunny with
  abstract `avc`. More importantly, Mediabunny's present H.264 level selector
  considers frame size and bitrate but not frame rate. At 3840×2160×60, the
  rate is 1,944,000 macroblocks/s: over Level 5.1's 983,040 and within Level
  5.2's 2,073,600. Reusing the current runtime-generated candidate would not
  alone repair 4K60; candidate generation itself must account for MaxMBPS.

One immutable accepted-job value should bind file identity, processing tracks,
preset, exact encoder candidates, capability verdict and selection epoch. It
should be reused by the UI, worker, diagnostics and tests. That is a targeted
boundary object, not an invitation to add a general state-machine framework.

### R-07 — cancellation must own every phase and every yielded sample

The controller is placed in the `running` map only after
`await releaseFinished()` (`src/workers/job.worker.ts:106-136`), so an early
cancel is lost. Inspect and preflight have no controllers. The last pipeline
abort check occurs before finalization; finalization and verification can still
end in `processed`. Several loops check abort before entering the
`try`/`finally` that owns a yielded `AudioSample` or `VideoSample`, so an abort
at that boundary can leak the native sample.

The comprehensive review's High impact is proportionate. Its “R-04 first”
dependency is too rigid: establish explicit result ownership jointly, but
register controllers before the first await, place sample ownership inside
`finally`, and add post-commit abort checks independently.

The acceptance cancel case calls the main-thread pipeline directly. It does
not exercise the worker protocol, prior-result release, sync-handle cleanup,
finalization or worker verification. Required barriers are: before the first
await, immediately after iterator yield, during finalize, during verification
and during old-result release. Every case should emit exactly one `cancelled`,
never `processed`, close each native sample once, and return OPFS to baseline.

### R-08 — a small repair, but not a two-line reorder

`src/media/opfs.ts:58-81` requests a candidate lock with `ifAvailable`, returns
a boolean from the callback, and therefore releases the lock before deletion.
Selection occurs separately from deletion. `openWorkspace()` creates the job
directory before requesting its long-lived lock and continues even if the
claim fails.

This admits the review's interleaving: A creates; B briefly acquires/releases
and classifies; A claims; B deletes outside the lock. The browser need not
integrate Web Locks with OPFS automatically—the application must keep the
critical section inside the callback.

The fix is likely small, with low-to-medium code risk, but validation is not
trivial. Claim before directory creation/use and fail closed if unavailable;
perform orphan deletion within the successful sweep callback; test open-wins
and sweep-wins barriers with a deterministic lock scheduler, then stress two
tabs. The first critique's “two-line change” misses the fail-closed ownership
contract and testing work.

### R-09 — reproduced, not merely inferred

Inspection uses array element zero (`src/media/inspect.ts:189-200`), while
processing asks Mediabunny for primary tracks (`src/media/pipeline.ts:224-227`).
Mediabunny ranks default/pairability/bitrate properties when selecting a
primary. Output then writes exactly one video and one audio track, and the UI
does not warn about extra A/V tracks.

A temporary MP4 with two video and two audio tracks, with the second pair
marked default, reproduced the mismatch:

```text
first video track   1    primary video track   2
first audio track   3    primary audio track   4
```

All 28 present sample files have one video and at most one audio track, so this
is not current-corpus exposure. A fail-closed multiplicity check is small and
unblocks a controlled single-track pilot. Full preservation requires a product
decision about alternate audio, loudness processing and branding; do not hide
that decision inside the implementation.

### R-10 — standards-correct reporting can still be unsafe processing

The comprehensive review is right that the current file analyser stops before
the short-term/LRA window reaches EOF. The first critique is wrong to use a
mid-file event as the authority for rejecting padding. EBU Tech 3342 v4
explicitly requires at least 1.5 seconds of silence after a file signal before
final LRA. It also cautions that leading/trailing silence and short or isolated
material can produce misleading LRA.

The first critique's experiment remains valuable because this product uses LRA
as a control input. Examples from the real loudness module were:

| Tail event | Current EOF | LRA-only +1.5 s tail | Same event mid-file |
| --- | ---: | ---: | ---: |
| 1 s loud passage | 0.00 | 10.61 | 10.80 |
| 2 s loud passage | 8.81 | 12.95 | 13.18 |
| 3 s loud passage | 12.43 | 13.97 | 14.02 |
| 5 s quiet passage | 3.79 | 15.32 | 6.51 |

The standards tail repairs EOF under-measurement, but the quiet-ending result
crosses the app's `LRA > 9` macro switch. Directly adding ordinary silence also
changed integrated loudness by as much as +0.458 LU. Finalization must advance
only the LRA/short-term state, not duration, integrated loudness or the
source-aligned curve. More importantly, the application needs either a
qualified processing-eligibility metric or a deliberate separation between
standards-report LRA and macro activation. Because the protected specification
currently says LRA triggers macro mode, this may need a product decision and
doc delta.

Pause freeze is a separate definite mismatch. The specification orders
smoothing, clamp, slew and then pause hold. The code freezes raw correction
before smoothing, and the final envelope can move during the pause. In a
30-second loud / 20-second pause / 30-second quiet case, applied gain moved from
−5.0000 to −0.0331 dB across the pause. Simply overwriting the final array held
the pause but caused a 5.0331 dB resume jump, violating the 1 dB/s slew limit.
The safe design must hold the prior applied gain during every paused sample and
resume by slewing from that value, while still excluding pause values from the
smoothing input.

No production R-10 remedy is yet proved safe. Required tests include leading,
middle and trailing pauses; opposite corrections on either side; constant
applied gain throughout pause; ≤0.1 dB change per 100 ms at both boundaries;
chunk invariance; and no pre-onset room-tone boost.

### R-11 — fix the harness both before and after the product

The review correctly identifies false-pass routes:

- criterion 2 crops the first and last content seconds and uses the crop for
  true peak;
- missing audio returns `null`, is skipped, and leaves default aggregates of
  zero deviation and `-Infinity` peak, which pass;
- the audio-through-worker criterion asserts size/video duration but not the
  expected output audio track;
- cancellation bypasses the worker path;
- egress wrapping covers main-global `fetch`/`sendBeacon`, not Request-object
  bodies, XHR bodies or worker-context requests;
- criterion 3 inserts a static pass while authentic EBU cases 7/8 remain
  skipped and peak cases 20–23 are a declared local interpretation.

The comprehensive report should not imply current egress: static inspection
found none. It should also say criterion 3's limitation is disclosed in its
detail string, although displaying `pass` is still misleading.

The sequence “tighten only after product corrections” is too late. Add
fail-closed result counts, expected-audio assertions, EOF/t=0 negative controls,
worker cancellation and egress negative controls immediately so fixes cannot
be falsely certified. Rebaseline successful-output values after the product
changes. EBU Tech 3341 itself describes its cases as minimum evidence, not a
universal proof of meter accuracy.

### R-12 through R-14 — confirmed, with boundary-specific labels

R-12 is a confirmed implementation absence against specification §7.5:
neither wake lock nor conditional unload protection exists. Wake locks are
advisory and can be released on visibility/activity changes, so real support
needs rejection handling and visibility reacquisition rather than one acquire
call. `beforeunload` must exist only while processing or holding an unsaved
result. Actual mobile unload behaviour remains manual evidence.

R-13 is correctly labelled a strongly supported risk, not a current breach.
The build job inherits workflow-wide Pages/OIDC writes, actions use mutable
major tags, and the guard scans only `public/spike`. A temporary
`public/lecture-copy.mp4` negative control still returned
`check-placeholders: clean`. Current `public/` contains only expected branding
assets. Narrow job permissions, pin actions by full SHA with an update policy,
and reject every unapproved public media file before the next public release.

R-14 contains two small confirmed defects: `index.html:107` has an unnamed
native progress control, and every non-block preflight reveals Start despite
the specification requiring acknowledgement for `discourage`. Accessible-tree,
keyboard and screen-reader rehearsal remain needed after the code fix.

### R-15 — split the drift, and correct the v1 branding claim

The following drift is confirmed:

- infrastructure documentation says deployment is undecided/local-only while
  the workflow deploys every push to `main`;
- offline-after-first-load is promised, but there is no service-worker/cache
  implementation; actual browser HTTP-cache/offline navigation was not tested;
- the infrastructure contract says both product and build identity are exposed
  in production, while main hides `BUILD_ID` outside development (diagnostics
  do carry it);
- diagnostics lack explicit redacted SourceReport, accepted-job, capability
  and current-view fields, although some facts appear incidentally in logs;
- the documented non-mutating `check` runs Vite build and creates `dist/` in a
  clean archive;
- architecture documentation names modules and protocol shapes that do not
  exist.

One additional comprehensive-review statement is wrong. Its accessibility
assessment says absent opening/closing choices make the final three-choice
workflow incomplete. Specification §4.1 explicitly makes v1 closing-only; an
opening toggle is not a v1 blocker. The closing boundary mode remains a real
missing user choice, and the closing choice itself exists. Correct the feature
inventory rather than treating future opening branding as unfinished v1 work.

### R-16 — real linear state, wrong scope and lifetime wording

For one hour of stereo at 48 kHz, one completed analyser holds:

```text
momentary                 359,961
short-term                359,701
block loudness             35,997
block mean squares         71,994
total                     827,653 numbers
minimum numeric payload   6,621,224 bytes before array overhead
```

The comprehensive arithmetic is accurate and the “few hundred kilobytes”
comment is false. Its lifetime wording is imprecise. `finish()` returns only
momentary and short-term arrays, so 719,662 numbers remain in the completed
report; block arrays become collectable. Up to roughly 35,971 macro-envelope
values can also be retained. Peak traversal memory can be higher than the
review says because pass B runs while pass A's report/envelope remains live:
roughly 1.55–1.58 million duration-linear numbers can coexist.

This is not PCM/frame buffering and does not invalidate the streaming
architecture. It is an ordinary memory/performance defect. The first critique
and comprehensive review both lean on a “one-hour envelope”, but the
authoritative specification says there is no arbitrary duration cap
(`docs/01-specification.md:329`). At 12.4 hours the omitted limiter-index defect
also becomes reachable. Retention should therefore be profiled and bounded,
not dismissed as outside a fictional product limit.

## 6. Reproduction and verification record

### Baseline commands

```sh
git status --short --branch
git rev-parse HEAD
git branch --show-current
git rev-parse main origin/main origin/codex/repository-review-remediation
```

### Canonical gate

```sh
npm run check
```

Result at the reviewed baseline:

- 32 test files;
- 355 tests passed and 1 skipped;
- production build passed;
- Markdown and link checks passed, covering 68 files with zero broken links;
- memory validation reported zero structural failures and five budget
  warnings.

The warnings are reports, not a reason to alter protected/project memory in
this read-only task. The green gate does not cover the reproductions below.

### Focused existing tests

```sh
npm exec vitest -- run src/media/opfs.test.ts src/media/save.test.ts src/media/lanes.test.ts
npm exec vitest -- run src/audio/warnings.test.ts src/media/preflight.test.ts test/ebu3341/tech3341.test.ts
```

Results:

- storage/save/lane group: 3 files, 19 tests passed;
- warnings/preflight/EBU group: 3 files, 56 passed and 1 skipped.

### DSP boundary harness

The temporary Vitest configuration imported the production detector, limiter,
chain, analyser and macro-leveller directly. It was removed after execution.

```sh
npm exec vitest -- run --config /tmp/uon-vitest.config.ts --reporter=verbose --disable-console-intercept
npm exec vitest -- run --config /tmp/uon-vitest.config.ts --reporter=verbose --disable-console-intercept -t 'holds the post-rolled ceiling|shows the final envelope'
```

Five synthetic tests and two focused property tests passed. The important
observations were:

```text
final full-scale impulse, current detector      -64.0535920905 dBTP
same detector with 12-frame postroll              0.0000000000 dBTP
current limiter output                            0.0000000000 dBTP
clocked candidate limiter                        -2.0000002404 dBTP

middle-pause gain variation                       4.9669 dB
naive post-array freeze resume jump               5.0331 dB / 100 ms
```

### Media and harness reproductions

- **Onset scan:** every read-only sample selected with case-insensitive media
  extensions was measured over its first 44 ms using ffmpeg `volumedetect`.
  Four files were above the meaningful-noise cutoff; the first critique's
  extension filter missed uppercase `.MP4`.
- **Multi-track:** a temporary MP4 containing two video and two audio tracks
  marked the second track of each type as default. Mediabunny returned first
  IDs 1/3 but primary IDs 2/4. The file was removed.
- **Public media:** in an isolated temporary archive,
  `public/lecture-copy.mp4` was added and
  `node scripts/check-placeholders.mjs` returned clean, exit 0.
- **Silent warning:** 31 seconds of zero PCM passed through the production
  `AudioAnalyser`; warnings were `[]`, reproducing the missing all-silent
  warning.
- **Engine tally:** an isolated copy pointed all three engine paths at absent
  executables. The script printed three `SKIPPED`, then
  `3/3 engine(s) reported a complete run`, exit 0.
- **Limiter index:** a guarded temporary test seeded `SlidingMinimum` near
  2³¹ and reproduced the signed wrap at position 2,147,483,648.
- **Check mutation:** a clean archive had no `dist/`; `npm run build` created
  the complete output directory, confirming the documentation contradiction.

All temporary media/configuration files were removed.

## 7. Findings omitted by the comprehensive consolidation

### O-01 — limiter position wraps after about 12.4 hours

**Confirmed Low ordinary boundary defect.** `SlidingMinimum` stores an
indefinitely increasing position in `Int32Array`. At 48 kHz, 2³¹ samples is
44,739.24 seconds, or 12.428 hours. The wrap can break expiry ordering. The
first critique calls this outside a one-hour envelope, but the specification
sets no arbitrary duration cap. Use safe-number or 64-bit-capable indices and
add a near-wrap regression; no 12-hour media fixture is needed.

### O-02 — an ordinary new job destroys an unsaved result

**Confirmed Medium lifecycle defect.** New selection removes the Save UI;
starting again removes it and `releaseFinished()` disposes the workspace before
the replacement job succeeds. This is distinct from R-04's concurrent-save
race. Model `ready-unsaved → saving | discarded`, require an explicit
save/discard/start-over transition, and retain the old result until that choice
is complete.

### O-03 — declared configuration is dead and runtime numbers bypass config

**Confirmed Low maintainability/invariant defect.** Repository-wide search
finds `WARNING_THRESHOLDS.clippingDbtp` and `COMPRESSOR.softKnee` only at their
declarations. Runtime instead defaults the true-peak detector to −0.1 dBTP and
uses a fixed 6 dB compressor knee. Other tuneable project choices also remain
outside `src/config/`. This violates a project invariant, but is not itself a
user-harm release blocker. Wire the declared values or remove/replace them only
as part of an approved config cleanup.

### O-04 — an all-silent source cannot emit extended-silence warning

**Experimentally reproduced Low user-warning defect.** Extended-silence logic
is nested inside `audible.length > 0`; an entirely silent curve is all
`-Infinity` and cannot enter. Evaluate silence independently of finite audible
windows and cover actual analyser output, not just hand-built curve arrays.

### O-05 — skipped engines are reported as completed

**Experimentally reproduced Medium acceptance-harness defect.** The script
increments failures but not skips when calculating the final count. Report
completed, skipped and failed independently; an explicitly requested but
unavailable engine must prevent a complete-run claim.

### O-06 — the measured duration estimate omits material production work

**Confirmed Medium estimate-accuracy defect.** The earlier internal review's
P2-04 does not materially appear among R-01 through R-16. `probe.ts` uses a
`NullTarget`, omits OPFS write/backpressure, compositing, detailed DSP/encoding,
branding, finalize and the full verification traversal, and arithmetically
counts only two audio passes. R-06 mentions failed probes and future estimate
refinement, but that does not preserve this claim. Validate bounded samples of
the actual stages and report audio/video components separately; keep it
distinct from the output-size estimate.

## 8. Provenance and evidentiary quality

The three reports should carry a clearer evidence map.

1. The AMCS3059 result of approximately −16.75 LUFS and −1.98 dBTP was already
   recorded in the active VH-50 backlog entry before the comprehensive review.
   The review acknowledges that later, but its executive summary presents the
   numbers without provenance. Its new contribution is the useful pass-B
   decomposition (approximately −22.47 LUFS, +6.47 dB selected gain and −16.41
   LUFS before encode), not discovery of the headline miss.
2. The comprehensive review says its isolated checkout came from
   `git archive HEAD`. `samples/` is gitignored, `git ls-files samples` is
   empty, and the archive contains no `samples/` entries. A real-source run in
   that checkout required a separate copy, mount or selection step that is not
   described. This is a reproducibility/provenance gap, not evidence that the
   result was fabricated.
3. The comprehensive R-series maps closely to the earlier internal P findings
   and says that file was used as a lead index. A source-to-consolidated mapping
   would make inherited, reproduced and newly discovered evidence explicit.
4. The consolidation dropped six findings, including duration-estimate
   accuracy. The first critique correctly recovered five but made its own
   case-sensitive corpus error and gave an incomplete six-sample R-02 model.
5. Evidence labels should remain local to subclaims. For example, R-04 contains
   code-proven ownership defects, a standards-defined but unobserved short-write
   risk, and browser-dependent consumption behaviour. Calling the bundle simply
   “confirmed” hides the distinction.

The strongest new comprehensive-review evidence remains the pass-B R-01
decomposition, duration-linear R-16 arithmetic and broad cross-cutting source
inventory. The strongest independent reproductions are the R-02 EOF matrix,
R-10 pause/LRA boundary corpus, R-09 multi-track file and negative harness
controls.

## 9. Corrected order of work

One numerical list would mix impact, ease and verification cost. The safer plan
uses workstreams with explicit release gates.

### Immediate cheap risk reductions

1. **R-08:** acquire the live workspace lock before directory creation/use,
   fail closed, and delete orphans inside the successful sweep callback.
2. **R-04:** check/loop on synchronous write counts and make missing/unreadable
   expected tracks fail verification.
3. **R-09:** fail closed on unsupported extra A/V tracks until the preservation
   policy is decided.
4. **R-07:** register cancellation before the first await and move yielded
   sample ownership inside `try`/`finally`.
5. **R-14:** name the progress control and require explicit acknowledgement of
   a discourage verdict.
6. **R-11/O-05/R-13:** add missing-audio/result-count/EOF negative controls,
   correct the engine tally, and enforce an exact public-media allowlist.

These are small, independently reviewable changes. They should not be bundled
into one OPFS/DSP/UI commit.

### Release-blocking correctness work

1. **R-02:** land explicit detector finalization and clocked limiter drain with
   the 12-frame FIR boundary matrix, exact-length/chunk-invariance properties,
   protected EBU harness and decoded-output check.
2. **R-01:** in parallel, design a bounded full-chain solver and fail-closed
   decoded-output postconditions. Final calibration/sign-off follows R-02; the
   mechanism is not otherwise dependent on it.
3. **R-03:** preserve source timestamps, offsets, gaps and onset through AAC
   delay handling. Prove sample/timeline conservation in real engines.
4. **R-05/R-06:** bind one immutable accepted job and make secure context, OPFS,
   decode support and a frame-rate-valid exact encoder candidate hard gates.
5. **R-09:** retain the fail-closed pilot policy or approve explicit
   multi-track semantics before general release.
6. **R-10:** implement standards-compliant LRA finalization without altering
   integrated/source-curve state, decide the safe relationship between report
   LRA and macro eligibility, and implement stateful final pause hold plus
   resume slew.

### Transactional and lifecycle work

1. **R-04 plus O-02:** introduce explicit result states and read leases; keep
   the backing workspace until save consumption completes; block competing
   processing while saving; require deliberate discard/start-over; define
   source same-entry policy and browser fallback.
2. **R-07:** extend authoritative cancellation through inspection, preflight,
   finalization, verification and old-result cleanup, with exactly one terminal
   response.
3. **R-12:** acquire/reacquire wake lock while processing and attach unload
   protection only during processing or an unsaved-result state.

### Test-harness repair

1. Add fail-closed negative controls now for missing audio, t=0/EOF peaks,
   stale preflight, worker cancel, lock barriers, Request/XHR/worker egress and
   skipped engines.
2. Add each regression with its product fix; do not rely on the current green
   criterion as proof.
3. After R-01/R-02/R-03/R-10, rebaseline decoded-output acceptance and run real
   Chrome/Safari paths plus the constrained Firefox path.
4. Report authentic EBU execution, local interpretations and manual checks as
   separate states; never render an unexecuted criterion as passed.

### Medium-term hardening and documentation

- **R-13:** complete least-privilege jobs, immutable action refs, action-update
  policy, deployed inventory and licence/branding provenance.
- **R-15:** reconcile deployment, offline, version, diagnostics, architecture
  and check-mutation contracts through the protected-doc process where needed.
- **R-16/O-01:** profile peak and retained analysis memory, reduce state after
  correctness stabilises, and replace the wrapping limiter index.
- **O-03/O-04/O-06:** restore config authority, repair all-silent warning and
  calibrate honest duration estimates.

## 10. Pilot and release gates

For a narrowly supervised, single-track pilot, the minimum unresolved blockers
are R-01, R-02, R-03, the result-lifetime parts of R-04, R-05 and R-07. R-06
also blocks unless the exact input/device/preset path is preflighted fail-closed.
R-09 requires a single-track gate. R-10 requires either boundary-proved macro
semantics or a conservative approved way not to activate uncertain macro
processing. R-12 blocks any pilot that promises unattended long-file
reliability.

General release additionally requires R-08, full R-09 policy, repaired R-11
release evidence, R-12 lifecycle protection, R-14 accessibility/error
prevention and R-13 public-release hardening. R-15's user-facing promises must
either be implemented or reconciled through protected documentation. R-16 and
the low omitted defects are ordinary follow-up work unless capacity testing
shows a supported-device failure.

This is not permission to bypass blockers procedurally. A pilot exception must
be explicit, narrow, observable and unable to turn silent loss into success.

## 11. What remains unverified

- Real AAC/resampler output and browser-engine differences after any DSP repair.
- A bounded R-01 solver over representative real speech, including its visible
  infeasible-case UX and encoded-output strategy.
- Authentic Tech 3342/BS.2217-style LRA material and the correct relationship
  between standards-report LRA and macro eligibility.
- `clippedSampleCount` semantics after virtual detector/limiter tail clocking.
- Full decoded-MP4 proof of exact duration, chunk invariance, loudness and true
  peak after the candidate R-02 mechanic.
- Subjective pumping, room-tone and boundary listening tests.
- Actual OPFS partial-write/quota behaviour and byte-for-byte large-output
  recovery in each supported engine.
- Large fallback download consumption after OPFS removal and object-URL revoke.
- Source/destination same-entry behaviour under supporting and fallback picker
  paths.
- A deterministic live R-08 workspace deletion and repeated two-tab stress.
- Real rapid file/preset selection behaviour after a candidate R-05 fix.
- Chrome/Safari/Firefox acceptance of the exact final AVC/AAC candidates,
  especially 4K60 and unusual channel layouts.
- Platform-specific wake-lock rejection/reacquisition, laptop sleep and mobile
  unload behaviour.
- Accessibility-tree and VoiceOver/NVDA/TalkBack behaviour.
- Live GitHub repository/environment permissions, deployed response headers,
  deployed public inventory and offline navigation/cache behaviour.
- Heap profiles for 5-, 20-, 60-minute and very-long inputs on supported
  devices.

## 12. Integrity statement

The investigation itself did not alter any repository file, protected
document, project-memory file, sample, branch, commit, remote or deployment.
Temporary harness files and generated media were isolated outside the
repository and removed. After explicit approval, the completed critique was
copied into the existing untracked review bundle and its bundle index was
updated. No product source, protected document, project memory or sample was
changed by that durable-integration step.
