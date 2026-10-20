/**
 * The estimate's arithmetic: what pre-flight measured, turned into a time.
 *
 * The invariants are that the estimate counts every stage a job runs, prices
 * each from the measurement that belongs to it, and stays finite. It used to
 * count the video and two audio passes, and a job makes six or seven (VH-100).
 */

import { describe, expect, it } from 'vitest'

import { CODEC_PROBE, GAIN_SOLVE } from '../config/audio'
import { AUDIO_STAGE_PASSES, CALIBRATION_PROBE_WARM_UP_FRACTION } from '../config/thresholds'
import { jobTimeEstimate, warmedUpTiming } from './probe'

// 300 frames a second measured; 60 s kept at 25 fps is 1,500 frames.
const base = {
  videoFrames: 75,
  videoSeconds: 0.25,
  frameRate: 25,
  durationSeconds: 60,
  closingSeconds: 5,
}

/** An analysis pass of `wallSeconds` over all 60 s of the kept part's sound. */
const pass = (wallSeconds: number) => ({ analysis: { wallSeconds, audioSeconds: 60 } })

describe('jobTimeEstimate', () => {
  it('prices the video and the closing at the rate the probe measured', () => {
    const estimate = jobTimeEstimate({ ...base, ...pass(2) })
    expect(estimate.videoSeconds).toBe(5)
    // The closing's 125 frames go through the same decode, conform and encode.
    expect(estimate.brandingSeconds).toBeCloseTo(125 / 300, 12)
  })

  it('prices every audio stage in analysis passes, the refinements at their limit', () => {
    const estimate = jobTimeEstimate({ ...base, ...pass(2) })
    // Passes A and B, every refinement the solver may spend, the re-measure,
    // and the probe — which covers all 60 s, being under its budget.
    const planningPasses =
      1 +
      AUDIO_STAGE_PASSES.chain * (2 + GAIN_SOLVE.maximumRefinementPasses) +
      AUDIO_STAGE_PASSES.codecProbe
    expect(estimate.audioPlanningSeconds).toBeCloseTo(2 * planningPasses, 12)
    // Pass C is one more trip through the chain.
    expect(estimate.audioProcessingSeconds).toBeCloseTo(2 * AUDIO_STAGE_PASSES.chain, 12)
    // The check reads the finished file's audio once; the closings are silent.
    expect(estimate.verificationSeconds).toBe(2)
    // Six or seven traversals at least: never the two the estimate once counted.
    expect(estimate.audioPlanningSeconds / 2).toBeGreaterThanOrEqual(6)
  })

  it('prices the codec probe by what it covers, which stops growing at its budget', () => {
    // The probe encodes at most CODEC_PROBE's windows, however long the
    // recording. Charged as passes over the whole kept part, an hour-long
    // lecture paid for work the job never does (Codex review).
    const budget = CODEC_PROBE.windowSeconds * CODEC_PROBE.maximumWindows
    const rate = 11 / 3600 // An analysis pass at 11 s an hour.
    const planning = (seconds: number): number =>
      jobTimeEstimate({
        ...base,
        durationSeconds: seconds,
        analysis: { wallSeconds: seconds * rate, audioSeconds: seconds },
      }).audioPlanningSeconds
    const perPass = (seconds: number): number => planning(seconds) / (seconds * rate)

    // Past the budget, more recording costs only the passes over all of it:
    // A, then B, every refinement and the re-measure through the chain.
    const fullLength = 1 + AUDIO_STAGE_PASSES.chain * (2 + GAIN_SOLVE.maximumRefinementPasses)
    expect(planning(3600) - planning(2 * budget)).toBeCloseTo(
      (3600 - 2 * budget) * rate * fullLength,
      9,
    )
    // So an hour pays less per pass than a short recording the probe covers whole.
    expect(perPass(3600)).toBeLessThan(perPass(budget))
    expect(perPass(budget / 2)).toBeCloseTo(perPass(budget), 9)
  })

  it('prices the codec probe by the sound it covers, not the picture', () => {
    // An hour of video with two minutes of sound: the probe encodes all two
    // minutes. Measured against the picture, it was charged a fifteenth of
    // that (Codex review).
    const sound = { analysis: { wallSeconds: 0.4, audioSeconds: 120 } }
    const hour = jobTimeEstimate({ ...base, durationSeconds: 3600, ...sound })
    const short = jobTimeEstimate({ ...base, durationSeconds: 120, ...sound })
    expect(hour.audioPlanningSeconds).toBeCloseTo(short.audioPlanningSeconds, 12)
  })

  it('is the sum of its stages', () => {
    const estimate = jobTimeEstimate({ ...base, ...pass(2) })
    expect(estimate.totalSeconds).toBeCloseTo(
      estimate.videoSeconds +
        estimate.brandingSeconds +
        estimate.audioPlanningSeconds +
        estimate.audioProcessingSeconds +
        estimate.verificationSeconds,
      12,
    )
  })

  it('scales the audio stages with the measured pass and leaves the video alone', () => {
    const slow = jobTimeEstimate({ ...base, ...pass(4) })
    const fast = jobTimeEstimate({ ...base, ...pass(2) })
    expect(slow.videoSeconds).toBe(fast.videoSeconds)
    expect(slow.brandingSeconds).toBe(fast.brandingSeconds)
    expect(slow.audioPlanningSeconds).toBeCloseTo(2 * fast.audioPlanningSeconds, 12)
    expect(slow.audioProcessingSeconds).toBeCloseTo(2 * fast.audioProcessingSeconds, 12)
    expect(slow.verificationSeconds).toBeCloseTo(2 * fast.verificationSeconds, 12)
  })

  it('counts no audio stage for a job with no sound', () => {
    // A silent source, or a kept part with no sound in it (VH-95): there is no
    // pass to time, and nothing to plan, process or check.
    const estimate = jobTimeEstimate({ ...base, analysis: null })
    expect(estimate.audioPlanningSeconds).toBe(0)
    expect(estimate.audioProcessingSeconds).toBe(0)
    expect(estimate.verificationSeconds).toBe(0)
    expect(estimate.totalSeconds).toBeCloseTo(5 + 125 / 300, 12)
  })

  it('stays finite for a pass too quick to time', () => {
    // Found on VH-95's review: audio the probe window never reached divided by
    // zero and called the job "very long". The pass is timed over the whole
    // kept part now, but a reading of zero must still mean "cheap".
    const estimate = jobTimeEstimate({ ...base, ...pass(0) })
    expect(Number.isFinite(estimate.totalSeconds)).toBe(true)
    expect(estimate.totalSeconds).toBeCloseTo(5 + 125 / 300, 12)
  })
})

/** A probe's acceptance times: `count` frames, each `stepSeconds` after the last, from `firstSeconds`. */
const steady = (count: number, firstSeconds: number, stepSeconds: number): number[] =>
  Array.from({ length: count }, (_, index) => firstSeconds + index * stepSeconds)

describe('warmedUpTiming', () => {
  it('starts the clock after the encoder’s start-up stall (regression: VH-116’s smoke run)', () => {
    // As the smoke run saw it: four frames by 0.10 s, the fifth at 0.63 s,
    // then 3 ms each, in a window of 0.98 s. Timed from the start, that
    // stall made the probe read 93 fps against the job's 453.
    const acceptedAtSeconds = [...steady(4, 0.1, 0), ...steady(87, 0.63, 0.003)]
    const timed = warmedUpTiming({ frames: 91, seconds: 0.98, acceptedAtSeconds })
    // A sixth of 91 is 15 frames skipped; the clock starts when the 15th was
    // accepted, at 0.66 s, well after the stall.
    expect(timed.frames).toBe(76)
    expect(timed.seconds).toBeCloseTo(0.98 - 0.66, 12)
    expect(timed.frames / timed.seconds).toBeGreaterThan((2 * 91) / 0.98)
  })

  it('skips the same share of a 25 fps and a 30 fps window', () => {
    const skipped = (frames: number): number =>
      frames - warmedUpTiming({ frames, seconds: 1, acceptedAtSeconds: steady(frames, 0.01, 0.005) }).frames
    expect(skipped(91)).toBe(Math.floor(91 * CALIBRATION_PROBE_WARM_UP_FRACTION))
    expect(skipped(91)).toBe(15)
    expect(skipped(75)).toBe(12)
  })

  it('times a steady encode at its own rate, the window unchanged', () => {
    // No stall: the warm-up neither speeds nor slows a rate that holds still,
    // and every frame was still encoded inside the same window.
    const acceptedAtSeconds = steady(90, 0.004, 0.004)
    const timed = warmedUpTiming({ frames: 90, seconds: 0.36, acceptedAtSeconds })
    expect(timed.frames / timed.seconds).toBeCloseTo(250, 6)
  })

  it('times a probe of fewer than six frames whole', () => {
    const timed = warmedUpTiming({ frames: 5, seconds: 0.5, acceptedAtSeconds: steady(5, 0.1, 0.1) })
    expect(timed).toEqual({ frames: 5, seconds: 0.5 })
  })

  it('returns nothing to time for an empty probe, without throwing', () => {
    expect(warmedUpTiming({ frames: 0, seconds: 0.2, acceptedAtSeconds: [] })).toEqual({
      frames: 0,
      seconds: 0.2,
    })
  })
})
