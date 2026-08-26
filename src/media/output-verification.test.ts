import { describe, expect, it } from 'vitest'

import { TruePeakDetector } from '../audio/truepeak'
import {
  FinishedOutputAudioAnalyser,
  classifyOutputVerification,
  type OutputAudioMeasurement,
} from './output-verification'

const measurement = (integratedLufs: number, truePeakDbtp: number): OutputAudioMeasurement => ({
  integratedLufs,
  truePeakDbtp,
  durationSeconds: 1,
})

describe('classifyOutputVerification', () => {
  it('passes only when both inclusive acceptance limits hold', () => {
    expect(classifyOutputVerification(measurement(-15.5, -2))).toEqual({
      status: 'passed',
      integratedLufs: -15.5,
      truePeakDbtp: -2,
      loudnessWithinTolerance: true,
      truePeakWithinCeiling: true,
    })
  })

  it('fails a loudness miss inside the separate 1 LU advisory band', () => {
    expect(classifyOutputVerification(measurement(-15.49, -2))).toMatchObject({
      status: 'failed',
      loudnessWithinTolerance: false,
      truePeakWithinCeiling: true,
    })
  })

  it('fails a true peak above the ceiling even when loudness is on target', () => {
    expect(classifyOutputVerification(measurement(-16, -1.99))).toMatchObject({
      status: 'failed',
      loudnessWithinTolerance: true,
      truePeakWithinCeiling: false,
    })
  })

  it('treats an invalid decoded measurement as unverified, never passed', () => {
    expect(classifyOutputVerification(measurement(Number.NaN, -2))).toEqual({
      status: 'unverified',
      reason: 'invalid-measurement',
    })
  })

  it('treats a measured silent track as a failed target, not a missing measurement', () => {
    expect(
      classifyOutputVerification(measurement(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY)),
    ).toMatchObject({
      status: 'failed',
      loudnessWithinTolerance: false,
      truePeakWithinCeiling: true,
    })
  })
})

describe('FinishedOutputAudioAnalyser', () => {
  it('drains a final true-peak impulse without adding synthetic duration', () => {
    const sampleRate = 48_000
    const undrained = new TruePeakDetector(1)
    undrained.addFrames([Float32Array.of(1)])

    const analyser = new FinishedOutputAudioAnalyser({ sampleRate, channelCount: 1 })
    analyser.addFrames([Float32Array.of(1)])

    const result = analyser.finish()
    expect(undrained.peakDbtp).toBeLessThan(-20)
    expect(result.truePeakDbtp).toBeCloseTo(0, 12)
    expect(result.durationSeconds).toBeCloseTo(1 / sampleRate, 12)
  })
})
