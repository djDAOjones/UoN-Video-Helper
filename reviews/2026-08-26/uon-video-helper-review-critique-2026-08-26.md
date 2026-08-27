# Critique of the UoN Video Helper Comprehensive Review

Subject: `uon-video-helper-comprehensive-review-2026-08-26.md`
Baseline: `66227e51dc0905c1853d79fb927d8f009be80ad4` (`main`, working tree clean)
Date: 26 August 2026

Every finding in the review was re-checked against the code at that commit. Its
central measurement was reproduced. Three further experiments were run that the
review did not run. No repository file was modified.

## 1. Verdict at a glance

| Verdict | Count | Findings |
| --- | ---: | --- |
| Confirmed as written | 10 | R-02, R-03, R-05, R-07, R-09, R-12, R-13, R-14, R-15, R-16 |
| Correct, but needs correcting | 4 | R-01, R-06, R-10, R-11 |
| Overstated or mis-rated | 2 | R-04, R-08 |
| Verified findings dropped | 5 | P1/P2/P3 items from the earlier in-repo review |

**Take it seriously.** It is a competent, largely accurate review, and its
headline finding is real — reproduced here to fourteen significant figures.

Four findings are correct in substance but carry a mistake in the fix, the
dependency order, or the characterisation. In one case the prescribed remedy
would introduce a worse defect than the one it removes. Two are
hardened-invariant recommendations dressed as confirmed defects.

The material weakness is not accuracy, it is **provenance and completeness**.
The review consolidates the untracked review already sitting in
`pm_skills/project/code-review-2026-08-26.md`, and in consolidating it silently
dropped five findings that took under a minute each to verify. It also opens by
presenting VH-50's existing measurement as a fresh browser result.

## 2. Method

Four things were executable, and all four were run:

- **Reproduced the EOF true-peak defect** against the real `TruePeakDetector`
  and `TruePeakLimiter` via a scratch Vitest file, since removed.
- **Ran the full suite** — 32 files, 355 passed, 1 skipped, 22.97 s. The
  review's figures are exact.
- **Measured onset energy** across the whole `samples/` corpus with ffmpeg, to
  test the one evidentiary claim in R-03 that cannot be read off the code.
- **Ran an LRA experiment** the review did not run, comparing an end-of-file
  level change against the same event mid-file, with and without the tail
  padding it prescribes.

The repository was unchanged: `git status` showed only the pre-existing
untracked review file.

## 3. Finding by finding

| ID | Claim | Verdict | What was found |
| --- | --- | --- | --- |
| R-02 | EOF true-peak blind spot | **Confirmed** | Reproduced exactly. Strongest finding in the report. |
| R-03 | Source onset and gaps deleted | **Confirmed** | Code-proven, and the onset-energy evidence was independently corroborated. |
| R-05 | Preflight not bound to file/preset | **Confirmed** | No epoch anywhere; `jobFile` is a mutable module variable set by whichever reply lands last. |
| R-07 | Cancellation not authoritative | **Confirmed** | Controller registered after `await releaseFinished()`; no abort check after `finalize()` or verification; inspect/preflight have no controller at all. |
| R-09 | Multi-track inconsistency | **Confirmed** | `inspect.ts` uses `videoTracks[0]`; `pipeline.ts` uses `getPrimaryVideoTrack()`. Different questions, same UI. |
| R-12 | No wake lock, no unload guard | **Confirmed** | Spec §7.5 requires both. Neither string appears anywhere in `src/`. |
| R-13 | CI privilege and public-media guard | **Confirmed** | Workflow-level `pages: write` + `id-token: write` reach the `npm ci` job. Guard scans only `public/spike/`. |
| R-14 | Progress name, discourage ack | **Confirmed** | Bare `<progress>`, no label. Any non-block verdict reveals Start directly. |
| R-15 | Documentation drift | **Confirmed** | All four sub-claims verified, including the deployment section still reading "Not yet defined — open decision D5". |
| R-16 | Analysis retention grows linearly | **Confirmed** | 828,000 numbers for one hour of stereo — the arithmetic is exactly right. Best new finding in the report. |
| R-01 | Output misses both audio limits | **Correct, wrong order** | Mechanism confirmed. But it does not depend on R-02, and the roadmap says it does. |
| R-06 | Preflight doesn't prove the real job | **Half right** | Video config drift is real. The AAC probe is already exact — that work shipped as VH-49. |
| R-10 | LRA tail and pause freeze | **Right, bad fix** | Both defects real. The prescribed 1.5 s pad over-states LRA by 8.8 LU on a file that ends quietly. |
| R-11 | Acceptance has false-pass paths | **Right, unfair** | The crop and the empty-corpus pass are real. Criterion 3 is disclosed in its own detail string, not concealed. |
| R-04 | Output not transactional | **Overstated** | Three of four sub-claims confirmed. The partial-write one is an unguarded invariant, not a demonstrated defect. |
| R-08 | OPFS Web Lock race | **Mis-rated** | Race is real and the review is honest about confidence. Effort "Medium / risk High" for a two-line reorder is wrong. |

## 4. The one to fix tomorrow — R-02, reproduced

The detector's polyphase FIR is causal, and phase 0 puts the exact impulse at
tap 6. A sample only reaches its own peak reading six input samples later — so
the final six samples of any stream are never evaluated at any interpolation
phase, and the limiter's `flush()` drains its look-ahead at one frozen gain
without clocking the detector at all.

```text
one full-scale sample at EOF, 480-frame stream
  detector, no post-roll   -64.05359209046344 dBTP
  detector, zero-padded      0                dBTP

limiter, same signal
  look-ahead                240 samples
  peak in process() output    0    (nothing emitted)
  peak in flush() tail        1.0  =  0 dBFS

same impulse, moved back from EOF
  0,1,3 frames    ->   0.00 dBFS   ungained
  6,7,12,240      ->  -2.00 dBFS   limited correctly
```

The review quoted −64.05 dBTP and "about −2.0 dBTP six frames earlier". Both are
right, to the digit. This is a genuine defect against BS.1770-4, it is cheap to
fix, and it silently corrupts the app's own output verifier as well as the meter.

One thing the review understates: the same blind spot sits in the pass that
*verifies* the finished MP4, so the number the worker logs as `truePeakDbtp` is
unreliable at precisely the file position where a ceiling breach is most likely.

## 5. Four corrections to make before acting

### R-10 — the prescribed LRA fix would break the gate it feeds

The review says the file analyser "does not append the 1.5 seconds of silence
prescribed for final file LRA", cites Tech 3342 without a clause, and reports
reproductions differing by 2.69 LU and 6.02 LU. That reproduction is circular:
it shows padding changes the number, not that the current number is wrong.

The honest test is the same level change at end-of-file versus mid-file, which
is the closest available ground truth:

| Tail event | At EOF | EOF + 1.5 s pad | Same event mid-file |
| --- | ---: | ---: | ---: |
| 1 s loud passage | 0.00 | 10.61 | 10.80 |
| 2 s loud passage | 8.81 | 12.95 | 13.18 |
| 3 s loud passage | 12.43 | 13.97 | 14.02 |
| 5 s quiet passage | 3.79 | **15.32** | 6.51 |

**The defect is real, and worse than the review shows.** A one-second loud
passage at the end of a file reads as **LRA 0.00** today; the identical event
mid-file reads 10.80. That is total suppression, not under-representation, and
the review never demonstrates it.

**The prescribed fix is wrong.** On a file that ends with five seconds of quiet,
padding drives LRA from 3.79 to **15.32** against a mid-file truth of 6.51 — it
more than doubles the error, in the other direction. Zero padding manufactures
short-term windows describing a mixture of content and silence, and those
windows still clear the −20 LU relative gate.

This matters more than a metering nicety, because LRA is not a display value
here. `shouldApplyMacroLevelling()` gates on `LRA > 9 LU`. Padding as
prescribed would switch macro-levelling *on* for a recording that merely ends
in room tone — which is the pumping risk the whole stage was designed around.

The second half of R-10 is **stronger** than the review credits. It rates
pause-freeze at "Medium confidence", but spec §5.2 step 3 lists the operations
in order and puts *freeze* last, after smoothing, clamping and slew-limiting.
The implementation applies it first, to the raw array. The spec's purpose clause
— "so pauses and room tone are never amplified" — is a guarantee about applied
gain, not an intermediate buffer. That is a plain ordering mismatch, not a
judgement call.

### R-01 — it does not depend on R-02, and the roadmap says it does

The review makes R-02 a prerequisite for R-01 and puts it first in the Immediate
table. The dependency does not exist.

R-01's root cause is visible in ten lines of `chain.ts`: pass B constructs the
chain with `gainDb: null`, and that constructor sets `this.limiter = null`.
The gain is therefore solved against an *unlimited* signal, then applied to a
chain that does limit. Limiting only attenuates, so the output lands below target
by however much the limiter engaged — which is exactly the direction VH-50
measured (−16.75 against −16.00).

Fixing the EOF blind spot changes the integrated measurement by six samples in
an hour. It has no bearing on closing the gain loop. Sequencing the launch
blocker behind the rarer defect delays the thing that already fails on the first
real file anyone tried.

One sharpening the review has but buries: `WARNING_THRESHOLDS.targetMissedByLu`
is **1**, while the contract is **±0.5**. The verifier is calibrated exactly
twice as loose as the invariant it exists to verify, which is why a 0.75 LU miss
produces a clean log line. True peak is measured, logged, and never compared to
anything.

### R-06 — the AAC probe is already exact, and that work shipped

R-06 says "manual support probing uses fixed AVC/AAC configurations that differ
from Mediabunny's runtime configuration." Half of that is right and half would
send someone to redo finished work.

The **video** side does drift: `videoEncoderConfigFor()` probes `avc1.640033`
while `videoEncodingConfigFor()` hands Mediabunny an abstract `codec: 'avc'`
and lets it choose. Real finding.

The **audio** side does not. `handlePreflight` calls `canEncodeAudio` with the
exact runtime tuple — `mp4a.40.2`, `OUTPUT_SAMPLE_RATE`, the source's own
channel count, the preset's mono or stereo bitrate. The code comment names why.
That is VH-49, and it is the reason Firefox is blocked correctly today.

The H.264 level arithmetic in the same finding *is* right and worth keeping:
Level 5.1 allows 983,040 macroblocks/s, and 3840×2160 at 60 fps needs 1,944,000.
The preset claims a shape its own probe string cannot represent.

### R-04 and R-08 — two severity calls that don't survive contact

**R-04's partial write.** Classified "Confirmed defect", High.
`handle.write(chunk.data, { at: chunk.position })` does discard the returned
byte count, and guarding it is cheap and correct. But no short write was
observed — the review's own "Not run" list includes "actual OPFS short writes",
and every engine in practice throws `QuotaExceededError` rather than
short-writing. That is an unguarded invariant, not a confirmed defect, and the
distinction decides whether it blocks a pilot.

The other three sub-claims in R-04 are solid and belong at High: the fallback
download returns the instant `anchor.click()` does, `releaseFinished()` will
dispose a workspace while a picker `pipeTo()` is still reading it, and nothing
stops the user pointing the save dialogue at their own source file.

**R-08's effort rating.** The race is real — `OpfsWorkspace.open()` creates the
directory on line 194 and claims the lock on line 196, and the sweep classifies
inside an `ifAvailable` callback then deletes outside it. But the fix is moving
the claim above the create and moving `removeEntry` inside the lock callback.
Rating that "Effort: Medium / Implementation risk: High" and scheduling it as
Near-term buries a two-line change that removes a data-loss class outright. It is
the cheapest item in the report.

## 6. Where the review's evidence held up better than expected

R-03 asserts that AAC priming compensation "deliberately discards approximately
44 ms from the start" and that "three real sources contained audible energy in
that interval." The mechanism is code-proven — `AudioTimelineShift.apply()`
closes and returns `null` for any sample landing before zero, with a comment
saying so.

The evidentiary half cannot be read off the code, so the first 44 ms of every
file in `samples/` was measured:

```text
ffmpeg volumedetect, first 44 ms, peak level

-26.4 dB   LIBA2002 Migration and Identity...
-27.0 dB   Pelvis Sculpting 1e Final Final
-47.8 dB   CULT1027 Producing Film and Television
-56.0 dB   Philosophy of Psychotherapy v3
-66.8 dB   AMCS3068 North American Film Adaptations
-84.3 dB   Paul Smith NSS 2026-01-21
-90.3 dB   ... eight further files at the dither floor
-91.0 dB   ... three more
```

Exactly three files carry energy meaningfully above the noise floor in that
window, two of them at around −27 dBFS — real signal, not room tone. "Three real
sources" is accurate. This claim was approached to challenge it and ended up
confirmed.

Worth stating plainly for whoever picks this up: the shift preserves *sync*
correctly. What it costs is content. Source audio at 44 ms lands at output 44 ms,
and the first 44 ms is replaced by encoder priming silence.

## 7. What went missing

The review says it used the untracked `pm_skills/project/code-review-2026-08-26.md`
"only as a lead index". Its sixteen findings map almost one-to-one onto that
document's P1/P2/P3 set. Consolidating is fine. Losing verified findings in the
process is not — each of these was re-checked against the tree in under a minute:

| Was | Finding | Status now |
| --- | --- | --- |
| P3-03 | `SlidingMinimum` stores an ever-growing sample position into an `Int32Array`; wraps after ~12.4 h at 48 kHz and the expiry loop can then cycle. | Verified in `limiter.ts`. Out of scope at one hour, but a real latent bug, and the report has no equivalent. |
| P2-06 | Starting a new job silently destroys an unsaved result — `processResult.replaceChildren()` plus `releaseFinished()`, no confirmation. | Verified. R-04 mentions the racing case but not the ordinary one. |
| P3-02 | Declared config that nothing reads: `WARNING_THRESHOLDS.clippingDbtp` and `COMPRESSOR.softKnee`. | Verified — both appear only in `src/config/audio.ts` and nowhere else. Dead knobs in a file whose whole purpose is tunability. |
| P3-01 | An entirely silent recording never triggers the extended-silence warning: the check sits inside `if (audible.length > 0)` and silence filters to empty. | Verified in `warnings.ts`. The worst case for the warning is the one case it cannot fire on. |
| P2-12 | `run-in-engines.mjs` counts a missing engine as skipped but subtracts only failures from its final tally. | Verified. The cross-engine matrix the review recommends is reported by a script that can pass with nothing run. |

## 8. Provenance

**The headline measurement is not new.** The executive summary reads: "In an
isolated Chrome run using a real repository sample, the source measured
−21.86 LUFS/−1.86 dBTP and the output measured −16.75 LUFS/−1.98 dBTP." Those
output figures, and the −1.86 dBTP source peak, are already in `backlog.md`
under VH-50, dated the same day, on the same file. R-01 credits VH-50 in its
last line; the summary does not. The genuinely new numbers are the pass-B
decomposition — −22.47 LUFS, +6.47 dB selected, −16.41 LUFS pre-encode — and
those are the useful part, because they isolate the cause.

**The isolation story and the sample run don't reconcile.** The environment
table says the isolated copy was populated from `git archive HEAD`.
`samples/` is gitignored and returns nothing from `git ls-files`, so it is
not in that archive. A real-sample browser run in that copy needs a step the
report never describes. The sample itself checks out — `AMCS3059` is 852×480,
44.1 kHz stereo AAC, exactly as claimed — so this is a reporting gap rather
than a fabrication, but a review that opens by asserting its own read-only
rigour should close it.

## 9. On the report as a document

929 lines, sixteen fixed fields per finding, and a large share of them carrying
no information. Every finding contains "Illustrative patch or implementation
outline: Not applied." Eleven of the sixteen say only that. The remediation
tables assign owners — DSP engineer, Browser storage engineer,
DevOps/security, technical writer — for a project with one maintainer.

The coverage matrix claims "Full" depth on nearly every component and the
introduction says "every material claim reported below was independently
checked". On the evidence of the finding set, the honest description is
*verification and consolidation of an existing review, plus new browser
evidence*. That is genuinely valuable, and it would read as more trustworthy
stated than implied.

Its best original contributions are R-16, which is arithmetically exact and
which the earlier review missed entirely, the licence and branding-provenance
gap, and the pass-B decomposition behind R-01.

## 10. Suggested order of work

| # | Item | Why here | Size |
| ---: | --- | --- | --- |
| 1 | **R-08** — claim before create, delete inside the lock | Removes a data-loss class for two lines. The review scheduled it Near-term. | Trivial |
| 2 | **R-01** — close the gain loop around the limiter | The launch blocker, failing on the first real file. Not gated on R-02. | Large |
| 3 | **R-02** — detector `finish()`, limiter flush through the gain path | Reproduced, cheap, and it also repairs the output verifier's own reading. | Medium |
| 4 | Tighten `targetMissedByLu` to the contract, enforce true peak | A one-line threshold and a missing comparison. Stops a green log line on an out-of-contract file. | Small |
| 5 | **R-04** — save lease, minus the partial-write blocker | Three real sub-claims. Guard the write count while you are there, but do not let it gate the release. | Large |
| 6 | **R-05** + **R-07** — selection epoch and controller ordering | One state model answers both. Register controllers before the first await. | Medium |
| 7 | **R-10** — pause freeze on the final envelope only | Do the spec-ordering half. **Do not** pad the LRA tail until the gate behaviour is modelled. | Medium |

R-11's acceptance hardening should follow the product fixes, as the review says —
but its criterion-2 crop should be widened first, because that crop is the
specific reason R-02 and R-01 both cleared a green harness.

---

Checked against `66227e5` on 26 August 2026. No repository file was modified;
the scratch Vitest file used for the R-02 and LRA reproductions was removed and
the suite re-run at 32 files / 355 passed / 1 skipped. Measurements from the
real corpus were taken read-only with ffmpeg. Nothing was added to the backlog
or the decision log.
