# Continuation prompt — repository-review critique

Copy the text below into a new task opened at the UoN Video Helper repository
root.

---

Continue the independent, evidence-led review of the UoN Video Helper
repository begun on 26 August 2026.

## Start with these repository files

Read all three review documents completely:

1. `reviews/2026-08-26/uon-video-helper-comprehensive-review-2026-08-26.md`
   — the 929-line external comprehensive review being assessed.
2. `reviews/2026-08-26/uon-video-helper-review-critique-2026-08-26.md`
   — the independent critique and executable reproductions from the first
   continuation.
3. `reviews/2026-08-26/uon-video-helper-internal-code-review-2026-08-26.md`
   — the earlier in-repository code review that the comprehensive review
   appears to consolidate.

The review bundle is indexed by:

- `reviews/2026-08-26/README.md`

Do not rely on Downloads, chat attachments, temporary paths or prior
conversation history. The repository copies above are the durable sources.

## Purpose

Determine what the comprehensive external review gets right, what it gets
wrong or overstates, what it omits, and whether its evidence, severity
ratings, proposed remedies, dependencies and implementation order withstand
direct verification against the repository.

This task continues that process. Treat all three review documents as evidence,
not authority. Independently verify material claims before adopting them.

This is a **read-only review and investigation task**. Do not implement fixes,
edit project memory, alter protected documentation, update the backlog, commit,
push or deploy unless the user separately authorises that action.

## Baseline and checkout

The comprehensive review examined:

`66227e51dc0905c1853d79fb927d8f009be80ad4`

When the review bundle was added:

- `HEAD` was still `66227e5`.
- The checked-out branch was `codex/repository-review-remediation`.
- That branch and `main` pointed to the same commit.
- The pre-existing `pm_skills/project/code-review-2026-08-26.md` remained
  untracked and untouched.

Before relying on this baseline:

1. Run `git status --short --branch`.
2. Record `git rev-parse HEAD` and `git branch --show-current`.
3. Preserve unrelated and untracked files.
4. If the source has moved, distinguish findings that still apply from
   findings fixed or changed since `66227e5`.

## Required project context

Follow `AGENTS.md` and the repository's PM-Skills workflow. At minimum read:

- `README.md`
- `AGENTS.md`
- `pm_skills/project/brief.md`
- `pm_skills/project/architecture.md`
- `pm_skills/project/conventions.md`
- the Active section of `pm_skills/project/backlog.md`
- relevant entries in `pm_skills/project/decision-log.md`
- relevant sections of `pm_skills/project/file-map.md`

For product, DSP, infrastructure and UI claims, consult as applicable:

- `docs/01-specification.md` — authoritative specification
- `docs/02-technical-rationale.md` — settled rationale
- `docs/03-open-decisions.md`
- `DEV-INFRASTRUCTURE.md`
- `UI-STANDARDS.md`

Important protected paths include:

- `docs/*.md`
- `src/audio/kweighting.ts`
- `src/audio/loudness.ts`
- `src/audio/truepeak.ts`
- `test/ebu3341/`
- `src/config/`

Do not edit these during review. Any future DSP change must rerun the EBU
harness. Never modify, move or delete anything under `samples/`; real
recordings may be inspected read-only.

## Established conclusions to challenge, preserve or correct

The first critique classified the comprehensive review's 16 findings as:

### Confirmed substantially as written

- R-02
- R-03
- R-05
- R-07
- R-09
- R-12
- R-13
- R-14
- R-15
- R-16

### Correct in substance but requiring correction or qualification

- R-01
- R-06
- R-10
- R-11

### Overstated or materially mis-rated

- R-04
- R-08

Keep these conclusions open to correction if new source evidence contradicts
them, but do not discard the executable evidence below without reproducing or
refuting it.

## Key reproduced evidence

### R-02 — EOF true-peak failure

The first critique reproduced the defect against the real
`TruePeakDetector` and `TruePeakLimiter`.

For a 480-frame signal containing one full-scale sample at EOF:

```text
detector without post-roll   -64.05359209046344 dBTP
detector after zero pad        0                dBTP
limiter look-ahead           240 samples
peak from process() output     0
peak from flush() tail         1.0 = 0 dBFS
```

Moving the impulse backwards from EOF gave:

```text
0, 1 or 3 frames from EOF      0.00 dBFS
6, 7, 12 or 240 frames back   -2.00 dBFS
```

The causal polyphase FIR receives no post-roll for the final samples.
`AudioAnalyser.finish()` reads the detector immediately, while
`TruePeakLimiter.flush()` drains its delay using one frozen gain instead of
clocking silence through the normal detector and gain path.

This is both a limiter defect and a verifier defect: final decoded-output
verification uses the same incomplete true-peak detector.

### R-01 — real material misses the output contract

The existing real-source result tracked in VH-50 is:

- Source: approximately `-21.86 LUFS / -1.86 dBTP`
- Output: `-16.75 LUFS / -1.98 dBTP`
- Contract: `-16 ±0.5 LUFS` and no higher than `-2.0 dBTP`

The comprehensive review's useful additional decomposition was:

- Pass-B measurement: approximately `-22.47 LUFS`
- Selected gain: `+6.47 dB`
- Limited pre-encode output: approximately `-16.41 LUFS`
- Resampling and AAC moved it farther from target

R-01 does **not** depend on R-02. In `src/audio/chain.ts`, the measuring
pass uses `gainDb: null`, which also sets `this.limiter = null`. Gain is
solved against an unlimited chain and then used in a chain that does limit.
Fixing six unmeasured EOF samples does not close that gain loop.

Also verify:

- `WARNING_THRESHOLDS.targetMissedByLu` is 1 LU while the contract is
  ±0.5 LU.
- Final true peak is logged but not enforced.
- Verification exceptions may be swallowed.
- An out-of-contract result can still be reported as successful.

Do not sequence R-01 behind R-02 merely because the comprehensive review does.

### R-03 — source-onset loss

`AudioTimelineShift.apply()` deliberately drops AAC samples that would land
before timestamp zero during encoder-delay compensation.

The first critique measured the first 44 ms of the read-only real corpus.
Exactly three files contained energy meaningfully above the noise floor,
including two at approximately `-26.4` and `-27.0 dBFS` and one at
approximately `-47.8 dBFS`.

The shift preserves later synchronisation but can replace real source onset
with encoder-priming silence. Preserve the distinction between "sync is
correct" and "source content is conserved."

### R-10 — real defect, unsafe prescribed remedy

The review correctly identifies an EOF problem in LRA measurement, but its
proposed fix — append 1.5 seconds of silence before finalising LRA — was shown
to be unsafe.

| Tail event | At EOF | EOF + 1.5 s silence | Same event mid-file |
| --- | ---: | ---: | ---: |
| 1 s loud passage | 0.00 | 10.61 | 10.80 |
| 2 s loud passage | 8.81 | 12.95 | 13.18 |
| 3 s loud passage | 12.43 | 13.97 | 14.02 |
| 5 s quiet passage | 3.79 | 15.32 | 6.51 |

Conclusions:

- EOF suppression is genuine and can be severe.
- Blind zero-padding is not a generally correct remedy.
- On quiet endings, padding creates partially silent short-term windows that
  survive the relative gate and dramatically overstate LRA.
- This changes behaviour because `shouldApplyMacroLevelling()` activates the
  leveller when `LRA > 9`.
- The prescribed padding could enable macro-levelling solely because a
  recording ends in room tone.

Do not implement or recommend the 1.5-second padding remedy without a
standards-grounded and gate-aware design.

R-10's other sub-finding may be stronger than the review states:
specification §5.2 step 3 describes pause freeze after smoothing, clamping and
slew limiting so pauses and room tone are never amplified.
`src/audio/macrolevel.ts` freezes the raw correction before smoothing.
Verify whether the final applied envelope can still raise pauses.

### R-06 — only the video half still drifts

Previous verification found:

- Video config drift is real:
  `videoEncoderConfigFor()` probes `avc1.640033`, while
  `videoEncodingConfigFor()` gives Mediabunny abstract codec `avc`.
- The Level 5.1 throughput issue for 3840×2160 at 60 fps should be checked
  against authoritative H.264 limits.
- The AAC claim is stale: VH-49 changed preflight to probe the actual runtime
  sample rate, channel count and mono/stereo bitrate.

Do not recommend redoing the AAC half as though it remains unfixed.

### R-04 — mixed finding, classification overstated

Three sub-claims were considered strong:

- A fallback download can be treated as complete immediately after
  `anchor.click()`.
- Beginning another process may dispose the OPFS workspace while a save
  `pipeTo()` is still reading it.
- The save picker does not prevent the user selecting and overwriting the
  source file.

The claimed partial OPFS write defect was not demonstrated. The code ignores
the byte count returned by the sync write, and guarding it is sensible, but
the review explicitly did not test actual OPFS short writes or quota
exhaustion. Keep it classified as an unguarded invariant or supported risk
unless reproduced.

### R-08 — real race, poor effort/risk assessment

The OPFS/Web Lock race was judged real:

- A job directory is created before its lock is acquired.
- The sweeper determines lock availability in one callback and deletes later,
  outside the lock callback.

The apparent remedy is small: claim before creation and perform deletion while
the lock is held. Reassess implementation risk carefully, but do not let an
inflated estimate bury a cheap data-loss prevention change.

### R-11 — acceptance false-pass routes

Previous verification supported these concerns:

- Criterion 2 crops the output region and can exclude t=0 and EOF defects.
- Missing decoded measurements can leave an empty result set whose default
  aggregates still pass.
- Resource warnings may not fail the run.
- Request observation does not cover every context equally.

Qualification: criterion 3's detail text admits official EBU cases 7 and 8 are
skipped. Its status may be too flattering, but the omission is disclosed
rather than concealed.

## Findings omitted by the comprehensive consolidation

Recheck and preserve or reject each explicitly:

1. `SlidingMinimum` stores an indefinitely increasing position in an
   `Int32Array`; at 48 kHz it can wrap after roughly 12.4 hours. This is
   outside the one-hour envelope but is a real latent defect.
2. Beginning another job can silently destroy an unsaved result through
   `processResult.replaceChildren()` and `releaseFinished()`, even without
   a racing save.
3. Declared configuration values appear unused:
   `WARNING_THRESHOLDS.clippingDbtp` and `COMPRESSOR.softKnee`.
4. An entirely silent source may never trigger the extended-silence warning
   because the check is nested under `if (audible.length > 0)`.
5. `scripts/run-in-engines.mjs` may report a missing engine as skipped
   without representing that omission correctly in its final tally.

## Provenance concerns

Investigate and state clearly:

- The headline VH-50 measurement was already in
  `pm_skills/project/backlog.md` before the comprehensive review presented it
  in its executive summary. The review added useful pass-B measurements, but
  should distinguish existing from new evidence.
- The report says its isolated copy came from `git archive HEAD`, but
  `samples/` is gitignored and absent from that archive. A real-source run in
  the isolated copy required an additional transfer or mount step that is not
  described.
- This is a provenance gap, not by itself evidence that the measurement is
  fabricated.

## Strengths already supported

Do not make this a purely negative exercise. Previous inspection supported:

- Source media remains local and read-only.
- No production media, filenames or media characteristics were found leaving
  the device.
- Processing is streamed with backpressure.
- Mediabunny outputs explicitly use `fastStart: false`.
- Worker protocol and major data structures are typed and separated.
- The canonical suite passed at the baseline with 32 files, 355 tests passed
  and 1 skipped.
- Mediabunny remains the only runtime dependency.

## Required method

1. Read the complete comprehensive review, not only its executive summary.
2. Trace every material claim to source and tests.
3. Reproduce high-impact claims where practical with small, isolated,
   removable tests.
4. Do not modify the real sample corpus.
5. Remove scratch files after experiments.
6. Do not rely on mocked WebCodecs as evidence of browser capability.
7. For external technical claims, use authoritative primary documentation or
   standards and distinguish standards requirements from project choices.
8. Do not convert untested browser risks into confirmed defects.
9. Check whether findings changed since `66227e5`.
10. Run `npm run check` before closing if any local experiment or file change
    occurs.
11. Do not edit implementation, protected documentation, backlog, decision
    log or project memory without separate authorisation.
12. Preserve unrelated and untracked files.

Use precise classifications:

- confirmed defect;
- code-proven defect;
- experimentally reproduced defect;
- strongly supported risk;
- unguarded invariant;
- browser-dependent risk;
- standards or product-contract mismatch;
- hardening recommendation.

## Questions to answer

- Are there further factual errors, stale claims or unsafe remedies in the
  comprehensive review?
- Are severities and dependencies proportionate to demonstrated impact?
- Does the suggested change order minimise user harm and implementation risk?
- Which findings are release blockers, pilot blockers, ordinary defects,
  hardening work or documentation corrections?
- What evidence would move each supported risk into a confirmed defect?
- Did the first critique overlook anything in the 929-line review?
- Have findings been fixed or invalidated on the current branch?
- Can each proposed DSP remedy be shown not to introduce a worse result on a
  boundary corpus?
- Does the acceptance harness test the invariant its UI says passed?

## Deliverable

Produce an updated Markdown critique that is self-contained and suitable for
committing to this review bundle.

Include:

1. Executive verdict.
2. Current repository baseline and drift from `66227e5`.
3. Method and limitations.
4. A finding-by-finding table covering R-01 through R-16.
5. Detailed analysis of every disagreement or qualification.
6. Reproduction evidence with exact commands or concise experimental setup.
7. A section covering omitted findings.
8. A provenance and evidentiary-quality assessment.
9. A corrected priority order separating:
   - immediate cheap risk reductions;
   - release-blocking correctness work;
   - transactional/lifecycle work;
   - test-harness repair;
   - medium-term hardening and documentation.
10. Clear "agree", "partly agree" and "disagree" conclusions.
11. A final list of what remains unverified.
12. Confirmation that no repository or sample file was altered.

Write for a maintainer who owns product direction but does not want deep
implementation concepts explained unless they affect a decision. Lead with
outcomes, use exact evidence and avoid severity inflation.

Do not merely restate the first critique. Continue it: challenge its
assumptions, reproduce anything doubtful, and improve it where evidence
supports doing so.
