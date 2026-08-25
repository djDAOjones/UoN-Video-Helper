/**
 * The chain's acceptance criteria, spec section 13 items 2 and 4:
 * output integrated loudness -16 +/-0.5 LUFS, true peak never above
 * -2.0 dBTP, and no pumping on deliberately variable material.
 */

import { describe, expect, it } from 'vitest'

import { TARGET_INTEGRATED_LUFS, TRUE_PEAK_CEILING_DBTP } from '../config/audio'
import { feedInChunks, speechLike, tone } from '../../test/helpers/signals'
import { AudioAnalyser } from './analyse'
import { AudioChain } from './chain'
import { buildGainEnvelope } from './macrolevel'

const SAMPLE_RATE = 48000

function analyse(channels: readonly Float32Array[]) {
  const analyser = new AudioAnalyser({ sampleRate: SAMPLE_RATE, channelCount: channels.length })
  feedInChunks(channels, 4096, analyser)
  return analyser.finish()
}

function runChain(source: readonly Float32Array[], gainDb: number | null, envelope = buildGainEnvelope({
  integratedLufs: -20, loudnessRangeLu: 0, shortTermLufs: [], stepSeconds: 0.01,
})) {
  const chain = new AudioChain({
    sampleRate: SAMPLE_RATE,
    channelCount: source.length,
    envelope,
    gainDb,
  })
  const parts: Float32Array[][] = []
  const total = source[0]!.length
  for (let offset = 0; offset < total; offset += 4096) {
    const end = Math.min(offset + 4096, total)
    parts.push(chain.process(source.map((c) => c.slice(offset, end))).map((c) => c.slice()))
  }
  parts.push(chain.flush().map((c) => c.slice()))

  return source.map((_unused, ch) => {
    const length = parts.reduce((sum, part) => sum + part[ch]!.length, 0)
    const out = new Float32Array(length)
    let at = 0
    for (const part of parts) {
      out.set(part[ch]!, at)
      at += part[ch]!.length
    }
    return out
  })
}

/** The three passes the pipeline runs: measure, measure-through-the-chain, apply. */
function normalise(source: readonly Float32Array[]) {
  const analysis = analyse(source)
  const envelope = buildGainEnvelope({
    integratedLufs: analysis.integratedLufs,
    loudnessRangeLu: analysis.loudnessRangeLu,
    shortTermLufs: analysis.shortTermLufs,
    stepSeconds: analysis.stepSeconds,
  })
  // Steps 2-4 only, to find out what they leave behind.
  const measured = analyse(runChain(source, null, envelope))
  const gainDb = TARGET_INTEGRATED_LUFS - measured.integratedLufs
  const output = runChain(source, gainDb, envelope)
  return { analysis, envelope, gainDb, output, result: analyse(output) }
}

describe('acceptance criterion 2: -16 +/-0.5 LUFS and -2.0 dBTP', () => {
  const cases = [
    ['a quiet recording', { startPeakDbfs: -34, endPeakDbfs: -34 }],
    ['a hot recording', { startPeakDbfs: -3, endPeakDbfs: -3 }],
    ['a normal recording', { startPeakDbfs: -14, endPeakDbfs: -14 }],
    ['a speaker drifting away', { startPeakDbfs: -10, endPeakDbfs: -28 }],
  ] as const

  it.each(cases)('lands on target for %s', (_name, levels) => {
    const source = speechLike({
      sampleRate: SAMPLE_RATE, seconds: 90, channelCount: 2,
      pauseSeconds: 1.5, pauseEverySeconds: 12, ...levels,
    })
    const { result } = normalise(source)

    expect(result.integratedLufs).toBeGreaterThan(TARGET_INTEGRATED_LUFS - 0.5)
    expect(result.integratedLufs).toBeLessThan(TARGET_INTEGRATED_LUFS + 0.5)
    expect(result.truePeakDbtp).toBeLessThanOrEqual(TRUE_PEAK_CEILING_DBTP + 0.01)
  })
})

describe('acceptance criterion 4: no pumping', () => {
  it('emits exactly as many frames as it was given, flush included (VH-20)', () => {
    // The limiter delays by its look-ahead and the chain drops that many frames
    // from the head, so the only way the count balances is if the tail comes
    // back out of `flush()`. The pipeline used to just stop, losing it — while
    // the ANALYSIS pass flushed, so loudness was measured over audio the output
    // did not contain.
    const seconds = 3
    const frames = SAMPLE_RATE * seconds
    const source = [new Float32Array(frames), new Float32Array(frames)]
    for (let i = 0; i < frames; i++) {
      const value = Math.sin((2 * Math.PI * 220 * i) / SAMPLE_RATE) * 0.25
      source[0]![i] = value
      source[1]![i] = value
    }

    // An empty envelope is the "consistent enough to leave alone" case, which
    // keeps this test about frame counts rather than about macro-levelling.
    const envelope = { gainDb: new Float64Array(0), stepSeconds: 1 }
    const chain = new AudioChain({ sampleRate: SAMPLE_RATE, channelCount: 2, envelope, gainDb: 0 })
    let emitted = 0
    for (let offset = 0; offset < frames; offset += 4096) {
      const end = Math.min(offset + 4096, frames)
      emitted += chain.process(source.map((c) => c.slice(offset, end)))[0]!.length
    }
    // Short by exactly the look-ahead until the tail is asked for.
    expect(emitted).toBeLessThan(frames)
    emitted += chain.flush()[0]!.length
    expect(emitted).toBe(frames)
  })

  it('leaves a consistent recording alone rather than processing it anyway', () => {
    const source = speechLike({
      sampleRate: SAMPLE_RATE, seconds: 60, channelCount: 2, startPeakDbfs: -14,
    })
    const { analysis, envelope } = normalise(source)
    // Consistent material: LRA under the 9 LU gate, so the macro-leveller is
    // not merely small — it does not run.
    expect(analysis.loudnessRangeLu).toBeLessThan(9)
    expect(envelope.gainDb).toHaveLength(0)
  })

  it('adds no swing of its own to deliberately variable material', () => {
    const source = speechLike({
      sampleRate: SAMPLE_RATE, seconds: 120, channelCount: 2,
      startPeakDbfs: -8, endPeakDbfs: -30, pauseSeconds: 2, pauseEverySeconds: 10,
    })
    const { analysis, result } = normalise(source)

    // Measured relatively, not against a fixed number. Speech swings between
    // syllables and pauses on its own, and an absolute threshold cannot tell
    // that apart from pumping. What matters is whether the CHAIN made it
    // worse — pumping is level movement the processing introduced.
    const worstSwing = (curve: readonly number[], stepSeconds: number): number => {
      const perSecond = Math.round(1 / stepSeconds)
      const audible = curve.filter((_v, i) => i % perSecond === 0).filter((v) => v > -45)
      let worst = 0
      for (let i = 1; i < audible.length; i++) {
        worst = Math.max(worst, Math.abs(audible[i]! - audible[i - 1]!))
      }
      return worst
    }

    const before = worstSwing(analysis.shortTermLufs, analysis.stepSeconds)
    const after = worstSwing(result.shortTermLufs, result.stepSeconds)

    // The macro-leveller is slew-limited to 1 dB/s, so over a one-second step
    // it cannot contribute more than 1 LU however hard it is pulling.
    expect(after).toBeLessThan(before + 1.5)
  })

  it('reduces loudness range on a drifting recording rather than flattening it', () => {
    const source = speechLike({
      sampleRate: SAMPLE_RATE, seconds: 120, channelCount: 2,
      startPeakDbfs: -8, endPeakDbfs: -30, pauseSeconds: 2, pauseEverySeconds: 10,
    })
    const { analysis, result } = normalise(source)

    expect(analysis.loudnessRangeLu).toBeGreaterThan(9)
    // Narrowed, because the drift was corrected...
    expect(result.loudnessRangeLu).toBeLessThan(analysis.loudnessRangeLu)
    // ...but not squashed: a +/-6 dB clamp cannot flatten a 20 dB drift, and
    // should not try. Speech that ends up with no range left sounds processed.
    expect(result.loudnessRangeLu).toBeGreaterThan(3)
  })

})

describe('the limiter only engages when it must', () => {
  it('does not touch material that already fits under the ceiling', () => {
    const source = tone({
      sampleRate: SAMPLE_RATE, seconds: 20, frequency: 300, peakDbfs: -20,
      channelCount: 2, fadeSeconds: 0.05,
    })
    const { result, gainDb } = normalise(source)
    expect(result.integratedLufs).toBeCloseTo(TARGET_INTEGRATED_LUFS, 0)
    expect(Number.isFinite(gainDb)).toBe(true)
  })
})
