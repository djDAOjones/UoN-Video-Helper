/**
 * The facade must not change what the components measure — it only runs them
 * over the same traversal. If these ever diverge, one of the two is being fed
 * different audio, which is the bug worth catching here.
 */

import { describe, expect, it } from 'vitest'

import { feedInChunks, tone } from '../../test/helpers/signals'
import { AudioAnalyser } from './analyse'
import { LoudnessAnalyser } from './loudness'
import { PHASE_TAPS, TruePeakDetector } from './truepeak'

const SAMPLE_RATE = 48000

describe('AudioAnalyser', () => {
  const signal = tone({
    sampleRate: SAMPLE_RATE,
    seconds: 8,
    frequency: 997,
    peakDbfs: -12,
    channelCount: 2,
    fadeSeconds: 0.01,
  })

  it('agrees with the components run separately', () => {
    const combined = new AudioAnalyser({ sampleRate: SAMPLE_RATE, channelCount: 2 })
    const loudness = new LoudnessAnalyser({ sampleRate: SAMPLE_RATE, channelCount: 2 })
    const truePeak = new TruePeakDetector(2)

    feedInChunks(signal, 1024, combined)
    feedInChunks(signal, 1024, loudness)
    feedInChunks(signal, 1024, truePeak)
    truePeak.addFrames(Array.from({ length: 2 }, () => new Float32Array(PHASE_TAPS - 1)))

    const report = combined.finish()
    expect(report.integratedLufs).toBe(loudness.finish().integratedLufs)
    expect(report.truePeakDbtp).toBe(truePeak.peakDbtp)
  })

  it('sees a true-peak transient in the final source frame without extending duration', () => {
    const analyser = new AudioAnalyser({ sampleRate: SAMPLE_RATE, channelCount: 1 })
    const finalImpulse = new Float32Array(480)
    finalImpulse[finalImpulse.length - 1] = 1

    analyser.addFrames([finalImpulse])
    const report = analyser.finish()

    expect(report.truePeakDbtp).toBeCloseTo(0, 12)
    expect(report.durationSeconds).toBeCloseTo(0.01, 12)
  })

  it('carries the stream shape into the report', () => {
    const analyser = new AudioAnalyser({ sampleRate: SAMPLE_RATE, channelCount: 2 })
    feedInChunks(signal, 1024, analyser)
    const report = analyser.finish()

    expect(report.sampleRate).toBe(SAMPLE_RATE)
    expect(report.channelCount).toBe(2)
    expect(report.durationSeconds).toBeCloseTo(8, 6)
    // True peak is measured unweighted, so a -12 dBFS tone reads about -12.
    expect(report.truePeakDbtp).toBeCloseTo(-12, 1)
    // Loudness is K-weighted and stereo-summed, so it tracks the peak level.
    expect(report.integratedLufs).toBeCloseTo(-12, 1)
  })
})
