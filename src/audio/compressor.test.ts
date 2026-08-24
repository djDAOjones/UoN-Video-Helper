import { describe, expect, it } from 'vitest'

import { tone } from '../../test/helpers/signals'
import { Compressor } from './compressor'

const SAMPLE_RATE = 48000

/** Steady-state RMS in dBFS, after the envelope has settled. */
function settledRmsDb(data: Float32Array): number {
  const from = Math.floor(data.length * 0.7)
  let sum = 0
  for (let i = from; i < data.length; i++) sum += data[i]! * data[i]!
  return 10 * Math.log10(sum / (data.length - from))
}

/** A sine's RMS sits 3.01 dB below its peak. */
function compressRms(inputRmsDbfs: number): number {
  const channels = tone({
    sampleRate: SAMPLE_RATE, seconds: 2, frequency: 500,
    peakDbfs: inputRmsDbfs + 3.0103, channelCount: 1,
  })
  new Compressor({ sampleRate: SAMPLE_RATE }).process(channels)
  return settledRmsDb(channels[0]!)
}

describe('compressor', () => {
  it('leaves quiet material completely alone', () => {
    // Well below the -18 dBFS threshold and outside the knee.
    expect(compressRms(-30)).toBeCloseTo(-30, 1)
    expect(compressRms(-24)).toBeCloseTo(-24, 1)
  })

  it('applies 2:1 above the threshold', () => {
    // -6 dBFS RMS is 12 dB over; 2:1 should put it 6 dB over, so -12 dBFS.
    expect(compressRms(-6)).toBeCloseTo(-12, 0)
    // -12 dBFS is 6 dB over -> 3 dB over -> -15 dBFS.
    expect(compressRms(-12)).toBeCloseTo(-15, 0)
  })

  it('bends smoothly through the knee rather than cornering', () => {
    const levels = [-22, -21, -20, -19, -18, -17, -16, -15]
    const reductions = levels.map((level) => level - compressRms(level))
    // Reduction only ever increases, and never jumps.
    for (let i = 1; i < reductions.length; i++) {
      expect(reductions[i]!).toBeGreaterThanOrEqual(reductions[i - 1]! - 0.05)
      expect(reductions[i]! - reductions[i - 1]!).toBeLessThan(1)
    }
  })

  it('is gentle by design — never more than a few dB on speech', () => {
    // -6 dBFS RMS is a very hot recording; 6 dB is the most this should ever
    // be doing. It is not a loudness tool.
    expect(-6 - compressRms(-6)).toBeLessThan(7)
  })

  it('holds the stereo image by detecting on the louder channel', () => {
    const channels = tone({
      sampleRate: SAMPLE_RATE, seconds: 1, frequency: 500, peakDbfs: -6, channelCount: 2,
    })
    for (let i = 0; i < channels[1]!.length; i++) channels[1]![i]! *= 0.5
    const ratioBefore = channels[0]![1000]! / channels[1]![1000]!
    new Compressor({ sampleRate: SAMPLE_RATE }).process(channels)
    const late = channels[0]!.length - 1000
    expect(channels[0]![late]! / channels[1]![late]!).toBeCloseTo(ratioBefore, 4)
  })
})
