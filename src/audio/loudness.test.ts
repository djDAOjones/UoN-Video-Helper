/**
 * Meter behaviour, derived rather than trusted.
 *
 * Every expected value here is worked out from BS.1770-4's own equations
 * (see the comment on each), so a passing test means the implementation
 * agrees with the arithmetic — not that it agrees with whatever it happened
 * to produce first. The EBU Tech 3341 compliance cases are VH-3.
 */

import { describe, expect, it } from 'vitest'

import { concat, feedInChunks, silence, tone } from '../../test/helpers/signals'
import { LoudnessAnalyser, channelWeights } from './loudness'

const SAMPLE_RATE = 48000

function measure(channels: Float32Array[], channelCount: number, chunkFrames = 4096) {
  const analyser = new LoudnessAnalyser({ sampleRate: SAMPLE_RATE, channelCount })
  feedInChunks(channels, chunkFrames, analyser)
  return analyser.finish()
}

describe('integrated loudness', () => {
  // For a stereo sine of peak amplitude A:
  //   L = -0.691 + 10log10(2 * (A^2/2) * g) = 20log10(A) + 0.0067
  // where g is K-weighting's power gain at 1 kHz. So the reading tracks the
  // sine's PEAK level in dBFS, not its RMS.
  it('reads a stereo 1 kHz sine at its peak dBFS level', () => {
    const report = measure(
      tone({
        sampleRate: SAMPLE_RATE,
        seconds: 10,
        frequency: 1000,
        peakDbfs: -23,
        channelCount: 2,
      }),
      2,
    )
    expect(report.integratedLufs).toBeCloseTo(-23, 1)
  })

  it('tracks level changes one-for-one', () => {
    const report = measure(
      tone({
        sampleRate: SAMPLE_RATE,
        seconds: 10,
        frequency: 1000,
        peakDbfs: -33,
        channelCount: 2,
      }),
      2,
    )
    expect(report.integratedLufs).toBeCloseTo(-33, 1)
  })

  // One channel carries half the energy of two, so mono reads 3.01 dB lower
  // for the same per-channel amplitude.
  it('reads mono 3.01 LU below the equivalent stereo', () => {
    const report = measure(
      tone({
        sampleRate: SAMPLE_RATE,
        seconds: 10,
        frequency: 1000,
        peakDbfs: -23,
        channelCount: 1,
      }),
      1,
    )
    expect(report.integratedLufs).toBeCloseTo(-26.01, 1)
  })

  it('returns -Infinity for digital silence', () => {
    expect(measure(silence(SAMPLE_RATE, 5, 2), 2).integratedLufs).toBe(Number.NEGATIVE_INFINITY)
  })

  it('returns -Infinity when there is less than one 400 ms block', () => {
    const report = measure(
      tone({
        sampleRate: SAMPLE_RATE,
        seconds: 0.2,
        frequency: 1000,
        peakDbfs: -23,
        channelCount: 2,
      }),
      2,
    )
    expect(report.integratedLufs).toBe(Number.NEGATIVE_INFINITY)
  })
})

describe('gating', () => {
  // Ten seconds of tone then ten of silence. The expected drop is derived,
  // not guessed:
  //
  //   - 97 blocks sit entirely inside the tone.
  //   - Blocks are 400 ms stepping 100 ms, so the three starting at hops
  //     97/98/99 straddle the boundary and hold 3/4, 2/4, 1/4 of a block of
  //     tone. They are well above the relative gate, so they legitimately
  //     participate at reduced energy.
  //   - Every fully-silent block falls below the -70 LUFS absolute gate and
  //     is discarded.
  //
  //   drop = -10log10((97 + 0.75 + 0.5 + 0.25) / 100) = 0.0656 LU
  //
  // Without a working absolute gate the silence would halve the mean energy
  // and cost 3.01 LU, so this asserts both that the gate fires and that the
  // straddling blocks are handled correctly.
  it('excludes silence via the absolute gate, keeping straddling blocks', () => {
    const toneOnly = tone({
      sampleRate: SAMPLE_RATE,
      seconds: 10,
      frequency: 1000,
      peakDbfs: -23,
      channelCount: 2,
    })
    const withSilence = concat(toneOnly, silence(SAMPLE_RATE, 10, 2))

    const drop = measure(toneOnly, 2).integratedLufs - measure(withSilence, 2).integratedLufs
    expect(drop).toBeCloseTo(0.0656, 3)
  })

  // The relative gate sits 10 LU below the ungated mean, so a passage 20 LU
  // down is excluded and barely moves the result.
  it('excludes a passage far below the relative gate', () => {
    const loud = tone({
      sampleRate: SAMPLE_RATE,
      seconds: 20,
      frequency: 1000,
      peakDbfs: -23,
      channelCount: 2,
    })
    const quiet = tone({
      sampleRate: SAMPLE_RATE,
      seconds: 20,
      frequency: 1000,
      peakDbfs: -50,
      channelCount: 2,
    })

    const gated = measure(concat(loud, quiet), 2).integratedLufs
    expect(gated).toBeCloseTo(-23, 0)
  })
})

describe('streaming', () => {
  // The meter is fed whatever chunk sizes the decoder produces, none of which
  // align to the 100 ms hop grid. The reading must not depend on that.
  it('gives an identical result regardless of chunk size', () => {
    const signal = tone({
      sampleRate: SAMPLE_RATE,
      seconds: 12,
      frequency: 1000,
      peakDbfs: -20,
      channelCount: 2,
    })
    const readings = [1, 999, 4096, 65536, signal[0]!.length].map(
      (chunk) => measure(signal, 2, chunk).integratedLufs,
    )
    for (const reading of readings) expect(reading).toBeCloseTo(readings[0]!, 10)
  })
})

describe('sample rate independence', () => {
  it('reads the same tone alike at 44.1 kHz and 48 kHz', () => {
    const readings = [44100, 48000].map((rate) => {
      const analyser = new LoudnessAnalyser({ sampleRate: rate, channelCount: 2 })
      analyser.addFrames(
        tone({ sampleRate: rate, seconds: 10, frequency: 1000, peakDbfs: -23, channelCount: 2 }),
      )
      return analyser.finish().integratedLufs
    })
    expect(readings[0]!).toBeCloseTo(readings[1]!, 2)
  })
})

describe('channel weighting', () => {
  it('applies BS.1770-4 Table 3 weights and excludes LFE', () => {
    expect(channelWeights(1)).toEqual([1])
    expect(channelWeights(2)).toEqual([1, 1])
    expect(channelWeights(6)).toEqual([1, 1, 1, 0, 1.41, 1.41])
  })

  it('ignores content in the LFE channel entirely', () => {
    const frontsOnly = tone({
      sampleRate: SAMPLE_RATE,
      seconds: 10,
      frequency: 1000,
      peakDbfs: -23,
      channelCount: 6,
      silentChannels: [2, 3, 4, 5],
    })
    const withLfe = frontsOnly.map((channel, ch) => {
      if (ch !== 3) return channel
      const loud = tone({
        sampleRate: SAMPLE_RATE,
        seconds: 10,
        frequency: 60,
        peakDbfs: -6,
        channelCount: 1,
      })
      return loud[0]!
    })

    expect(measure(withLfe, 6).integratedLufs).toBeCloseTo(measure(frontsOnly, 6).integratedLufs, 6)
  })
})

describe('loudness range', () => {
  it('is near zero for a steady tone', () => {
    const report = measure(
      tone({
        sampleRate: SAMPLE_RATE,
        seconds: 30,
        frequency: 1000,
        peakDbfs: -23,
        channelCount: 2,
      }),
      2,
    )
    expect(report.loudnessRangeLu).toBeLessThan(1)
  })

  it('reports the spread of a two-level signal', () => {
    const signal = concat(
      tone({
        sampleRate: SAMPLE_RATE,
        seconds: 30,
        frequency: 1000,
        peakDbfs: -18,
        channelCount: 2,
      }),
      tone({
        sampleRate: SAMPLE_RATE,
        seconds: 30,
        frequency: 1000,
        peakDbfs: -28,
        channelCount: 2,
      }),
    )
    expect(measure(signal, 2).loudnessRangeLu).toBeCloseTo(10, 0)
  })
})

describe('curves', () => {
  it('emits momentary and short-term values on the 10 ms grid', () => {
    const report = measure(
      tone({
        sampleRate: SAMPLE_RATE,
        seconds: 10,
        frequency: 1000,
        peakDbfs: -23,
        channelCount: 2,
      }),
      2,
    )
    // 10 ms rather than BS.1770-4's 100 ms block hop, so EBU Tech 3341 tests
    // 10-14 — which offset tones by i*20 ms and i*150 ms — land on a hop.
    expect(report.stepSeconds).toBe(0.01)

    // 10 s = 1000 hops. Momentary needs 40 hops of history, short-term 300.
    expect(report.momentaryLufs).toHaveLength(1000 - 40 + 1)
    expect(report.shortTermLufs).toHaveLength(1000 - 300 + 1)
    expect(report.durationSeconds).toBeCloseTo(10, 6)
  })

  it('keeps gating blocks on the standard 100 ms grid despite the finer curves', () => {
    // The finer accumulator must not change the integrated measurement:
    // BS.1770-4 mandates 400 ms blocks at 75% overlap, and that is derived by
    // stepping ten 10 ms hops, not by measuring more often.
    //
    // 20 s of tone then 20 s of silence. The gated blocks are the 197 sitting
    // wholly inside the tone plus the three straddling the boundary at 3/4,
    // 2/4 and 1/4 energy:
    //   drop = -10log10((197 + 1.5) / 200) = 0.0327 LU
    // A finer block grid would admit more straddling blocks and shift this.
    const toneOnly = tone({
      sampleRate: SAMPLE_RATE,
      seconds: 20,
      frequency: 1000,
      peakDbfs: -23,
      channelCount: 2,
    })
    const withSilence = concat(toneOnly, silence(SAMPLE_RATE, 20, 2))

    const drop = measure(toneOnly, 2).integratedLufs - measure(withSilence, 2).integratedLufs
    expect(drop).toBeCloseTo(0.0327, 3)
  })
})
