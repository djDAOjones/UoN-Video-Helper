/**
 * True peak must find what sample peak cannot see. The headline case is a
 * sine at exactly a quarter of the sample rate, offset a quarter cycle: every
 * sample lands at +/-0.7071 (-3.01 dBFS) while the waveform itself reaches
 * full scale between them.
 */

import { describe, expect, it } from 'vitest'

import { concat, dbfsToAmplitude, feedInChunks, silence, tone } from '../../test/helpers/signals'
import { TruePeakDetector } from './truepeak'

const SAMPLE_RATE = 48000

function measure(channels: Float32Array[], chunkFrames = 4096): number {
  const detector = new TruePeakDetector(channels.length)
  feedInChunks(channels, chunkFrames, detector)
  detector.finish()
  return detector.peakDbtp
}

describe('true peak', () => {
  it('finds the inter-sample peak sample peak misses', () => {
    // sin(pi*i/2 + pi/4) samples at +/-0.7071 but peaks at 1.0 between them.
    const channels = tone({
      sampleRate: SAMPLE_RATE,
      seconds: 1,
      frequency: SAMPLE_RATE / 4,
      peakDbfs: 0,
      channelCount: 1,
      phase: Math.PI / 4,
      fadeSeconds: 0.01,
    })

    let samplePeak = 0
    for (const value of channels[0]!) samplePeak = Math.max(samplePeak, Math.abs(value))
    expect(20 * Math.log10(samplePeak)).toBeCloseTo(-3.01, 1)

    expect(measure(channels)).toBeCloseTo(0, 1)
  })

  it('measures a full-scale sample in the very last frame (VH-50)', () => {
    // The interpolator is causal, so without a drain the final PHASE_TAPS - 1
    // frames are never convolved at all. A file ending on a plosive read
    // -64.05 dBTP — silence — for a sample sitting at 0 dBFS, which is how a
    // 2 dB ceiling breach reached both the runtime verifier and the acceptance
    // harness looking safe.
    const frames = new Float32Array(480)
    frames[frames.length - 1] = 1
    expect(measure([frames])).toBeCloseTo(0, 6)
  })

  it('measures a transient in a stream shorter than the interpolator', () => {
    // Fewer frames than the delay line: the drain is the only thing that ever
    // convolves them.
    const frames = new Float32Array(4)
    frames[1] = 1
    expect(measure([frames])).toBeGreaterThanOrEqual(-1e-9)
  })

  it('refuses frames after the drain rather than splicing silence into them', () => {
    const detector = new TruePeakDetector(1)
    detector.addFrames([new Float32Array(64)])
    detector.finish()
    expect(() => detector.addFrames([new Float32Array(64)])).toThrow(RangeError)
    // Draining twice is a no-op, so a double finish() cannot move the reading.
    detector.finish()
  })

  it('never reads below sample peak', () => {
    // Phase 0 of the polyphase filter is an exact impulse, so every real
    // sample is considered as-is. A measurement below sample peak would mean
    // the interpolator was attenuating the signal.
    const channels = tone({
      sampleRate: SAMPLE_RATE,
      seconds: 1,
      frequency: 997,
      peakDbfs: -6,
      channelCount: 1,
      fadeSeconds: 0.01,
    })
    let samplePeak = 0
    for (const value of channels[0]!) samplePeak = Math.max(samplePeak, Math.abs(value))

    expect(measure(channels)).toBeGreaterThanOrEqual(20 * Math.log10(samplePeak) - 1e-9)
  })

  it('reads a low-frequency tone at close to its nominal level', () => {
    // At 100 Hz there is very little between samples to miss.
    const channels = tone({
      sampleRate: SAMPLE_RATE,
      seconds: 1,
      frequency: 100,
      peakDbfs: -6,
      channelCount: 1,
    })
    expect(measure(channels)).toBeCloseTo(-6, 1)
  })

  it('returns -Infinity for digital silence', () => {
    expect(measure(silence(SAMPLE_RATE, 1, 2))).toBe(Number.NEGATIVE_INFINITY)
  })

  it('reports the loudest channel', () => {
    const quiet = tone({
      sampleRate: SAMPLE_RATE,
      seconds: 1,
      frequency: 100,
      peakDbfs: -20,
      channelCount: 1,
    })
    const loud = tone({
      sampleRate: SAMPLE_RATE,
      seconds: 1,
      frequency: 100,
      peakDbfs: -6,
      channelCount: 1,
    })
    expect(measure([quiet[0]!, loud[0]!])).toBeCloseTo(-6, 1)
  })

  it('sees the overshoot of an abrupt onset', () => {
    // A tone that begins mid-cycle is a step from silence, and its
    // reconstruction really does exceed the sample values. A meter that
    // missed this would under-report exactly the transients that clip.
    const shared = {
      sampleRate: SAMPLE_RATE,
      seconds: 1,
      frequency: SAMPLE_RATE / 4,
      peakDbfs: -6,
      channelCount: 1,
      phase: Math.PI / 4,
    } as const

    const faded = measure(tone({ ...shared, fadeSeconds: 0.01 }))
    const abrupt = measure(tone(shared))

    expect(faded).toBeCloseTo(-6, 1)
    expect(abrupt).toBeGreaterThan(faded + 0.05)
  })

  it('gives an identical result regardless of chunk size', () => {
    // The delay line spans chunk boundaries; if the tail carry is wrong, a
    // peak straddling a boundary is missed or invented.
    const channels = concat(
      tone({
        sampleRate: SAMPLE_RATE,
        seconds: 0.5,
        frequency: 997,
        peakDbfs: -20,
        channelCount: 2,
      }),
      tone({
        sampleRate: SAMPLE_RATE,
        seconds: 0.5,
        frequency: SAMPLE_RATE / 4,
        peakDbfs: -1,
        channelCount: 2,
        phase: Math.PI / 4,
      }),
      tone({
        sampleRate: SAMPLE_RATE,
        seconds: 0.5,
        frequency: 997,
        peakDbfs: -20,
        channelCount: 2,
      }),
    )

    const readings = [1, 7, 512, 4096, channels[0]!.length].map((chunk) => measure(channels, chunk))
    for (const reading of readings) expect(reading).toBeCloseTo(readings[0]!, 10)
  })

  it('scales linearly with level', () => {
    for (const level of [-1, -6, -12, -23]) {
      const channels = tone({
        sampleRate: SAMPLE_RATE,
        seconds: 0.5,
        frequency: SAMPLE_RATE / 4,
        peakDbfs: level,
        channelCount: 1,
        phase: Math.PI / 4,
        fadeSeconds: 0.01,
      })
      expect(measure(channels)).toBeCloseTo(level, 1)
      expect(dbfsToAmplitude(level)).toBeGreaterThan(0)
    }
  })
})
