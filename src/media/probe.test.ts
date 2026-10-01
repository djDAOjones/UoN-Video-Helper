/**
 * The estimate's arithmetic: what pre-flight measured, turned into a time.
 *
 * The invariants are that the estimate counts every stage a job runs, prices
 * each from the measurement that belongs to it, and stays finite. It used to
 * count the video and two audio passes, and a job makes six or seven (VH-100).
 */

import { describe, expect, it } from 'vitest'

import { GAIN_SOLVE } from '../config/audio'
import { AUDIO_STAGE_PASSES } from '../config/thresholds'
import { jobTimeEstimate } from './probe'

// 300 frames a second measured; 60 s kept at 25 fps is 1,500 frames.
const base = {
  videoFrames: 75,
  videoSeconds: 0.25,
  frameRate: 25,
  durationSeconds: 60,
  closingSeconds: 5,
}

describe('jobTimeEstimate', () => {
  it('prices the video and the closing at the rate the probe measured', () => {
    const estimate = jobTimeEstimate({ ...base, analysisSeconds: 2 })
    expect(estimate.videoSeconds).toBe(5)
    // The closing's 125 frames go through the same decode, conform and encode.
    expect(estimate.brandingSeconds).toBeCloseTo(125 / 300, 12)
  })

  it('prices every audio stage in analysis passes, the refinements at their limit', () => {
    const estimate = jobTimeEstimate({ ...base, analysisSeconds: 2 })
    // Passes A and B, every refinement the solver may spend, and the probe.
    const planningPasses =
      1 +
      AUDIO_STAGE_PASSES.chain * (1 + GAIN_SOLVE.maximumRefinementPasses) +
      AUDIO_STAGE_PASSES.codecProbe
    expect(estimate.audioPlanningSeconds).toBeCloseTo(2 * planningPasses, 12)
    // Pass C is one more trip through the chain.
    expect(estimate.audioProcessingSeconds).toBeCloseTo(2 * AUDIO_STAGE_PASSES.chain, 12)
    // The check reads the finished file's audio once; the closings are silent.
    expect(estimate.verificationSeconds).toBe(2)
    // Six or seven traversals at least: never the two the estimate once counted.
    expect(estimate.audioPlanningSeconds / 2).toBeGreaterThanOrEqual(6)
  })

  it('is the sum of its stages', () => {
    const estimate = jobTimeEstimate({ ...base, analysisSeconds: 2 })
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
    const slow = jobTimeEstimate({ ...base, analysisSeconds: 4 })
    const fast = jobTimeEstimate({ ...base, analysisSeconds: 2 })
    expect(slow.videoSeconds).toBe(fast.videoSeconds)
    expect(slow.brandingSeconds).toBe(fast.brandingSeconds)
    expect(slow.audioPlanningSeconds).toBeCloseTo(2 * fast.audioPlanningSeconds, 12)
    expect(slow.audioProcessingSeconds).toBeCloseTo(2 * fast.audioProcessingSeconds, 12)
    expect(slow.verificationSeconds).toBeCloseTo(2 * fast.verificationSeconds, 12)
  })

  it('counts no audio stage for a job with no sound', () => {
    // A silent source, or a kept part with no sound in it (VH-95): there is no
    // pass to time, and nothing to plan, process or check.
    const estimate = jobTimeEstimate({ ...base, analysisSeconds: null })
    expect(estimate.audioPlanningSeconds).toBe(0)
    expect(estimate.audioProcessingSeconds).toBe(0)
    expect(estimate.verificationSeconds).toBe(0)
    expect(estimate.totalSeconds).toBeCloseTo(5 + 125 / 300, 12)
  })

  it('stays finite for a pass too quick to time', () => {
    // Found on VH-95's review: audio the probe window never reached divided by
    // zero and called the job "very long". The pass is timed over the whole
    // kept part now, but a reading of zero must still mean "cheap".
    const estimate = jobTimeEstimate({ ...base, analysisSeconds: 0 })
    expect(Number.isFinite(estimate.totalSeconds)).toBe(true)
    expect(estimate.totalSeconds).toBeCloseTo(5 + 125 / 300, 12)
  })
})
