/**
 * The chain's acceptance criteria, spec section 13 items 2 and 4:
 * output integrated loudness -16 +/-0.5 LUFS, true peak never above
 * -2.0 dBTP, and no pumping on deliberately variable material.
 */

import { describe, expect, it } from 'vitest'

import { TARGET_INTEGRATED_LUFS, TRUE_PEAK_CEILING_DBTP } from '../config/audio'
import { feedInChunks, speechLike, tone, withTransients } from '../../test/helpers/signals'
import { AudioAnalyser } from './analyse'
import { AudioChain } from './chain'
import { solveChainGainDb } from './gain-solve'
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

/**
 * The passes the pipeline runs: measure, solve the gain, apply.
 *
 * The gain comes from the same `solveChainGainDb` the pipeline uses, not from
 * a local copy of the rule. This test used to re-implement it — and so proved
 * a gain rule the product did not have, which is half of why VH-50's real-file
 * miss survived a green harness.
 */
async function normalise(source: readonly Float32Array[]) {
  const analysis = analyse(source)
  const envelope = buildGainEnvelope({
    integratedLufs: analysis.integratedLufs,
    loudnessRangeLu: analysis.loudnessRangeLu,
    shortTermLufs: analysis.shortTermLufs,
    stepSeconds: analysis.stepSeconds,
  })
  const solution = await solveChainGainDb((gainDb) =>
    Promise.resolve(analyse(runChain(source, gainDb, envelope)).integratedLufs),
  )
  const output = runChain(source, solution.gainDb, envelope)
  return { analysis, envelope, gainDb: solution.gainDb, solution, output, result: analyse(output) }
}

describe('acceptance criterion 2: -16 +/-0.5 LUFS and -2.0 dBTP', () => {
  const cases = [
    ['a quiet recording', { startPeakDbfs: -34, endPeakDbfs: -34 }],
    ['a hot recording', { startPeakDbfs: -3, endPeakDbfs: -3 }],
    ['a normal recording', { startPeakDbfs: -14, endPeakDbfs: -14 }],
    ['a speaker drifting away', { startPeakDbfs: -10, endPeakDbfs: -28 }],
  ] as const

  it.each(cases)('lands on target for %s', async (_name, levels) => {
    const source = speechLike({
      sampleRate: SAMPLE_RATE, seconds: 90, channelCount: 2,
      pauseSeconds: 1.5, pauseEverySeconds: 12, ...levels,
    })
    const { result } = await normalise(source)

    expect(result.integratedLufs).toBeGreaterThan(TARGET_INTEGRATED_LUFS - 0.5)
    expect(result.integratedLufs).toBeLessThan(TARGET_INTEGRATED_LUFS + 0.5)
    expect(result.truePeakDbtp).toBeLessThanOrEqual(TRUE_PEAK_CEILING_DBTP + 0.01)
  })
})

/**
 * VH-50. The corpus above is synthesised speech with a ~7 dB crest factor, so
 * a normalising gain never drives it into the limiter and criterion 2 passes
 * without the limiter ever having an opinion. Real lectures are not like that:
 * `AMCS3059` measured -21.86 LUFS with peaks at -1.86 dBTP, a 20 dB crest
 * factor, and came out at -16.75 LUFS — outside the +/-0.5 contract the
 * harness was reporting green.
 */
describe('acceptance criterion 2 on real-shaped material (VH-50)', () => {
  const cases = [
    ['a lecture with plosives', -12],
    ['a quiet lecture with plosives', -16],
    ['a very quiet lecture with plosives', -20],
  ] as const

  it.each(cases)('lands on target for %s', async (_name, basePeakDbfs) => {
    const source = withTransients(
      speechLike({
        sampleRate: SAMPLE_RATE, seconds: 60, channelCount: 2,
        startPeakDbfs: basePeakDbfs, pauseSeconds: 1.5, pauseEverySeconds: 12,
      }),
      { sampleRate: SAMPLE_RATE, peakDbfs: -1, everySeconds: 6 },
    )
    const { analysis, result, solution } = await normalise(source)

    // The fixture's whole point is the crest factor. If a future edit tames it,
    // this fails here rather than silently going back to proving nothing.
    expect(analysis.truePeakDbtp).toBeGreaterThan(-2.5)
    expect(analysis.integratedLufs).toBeLessThan(-20)

    // ...and the limiter must actually bite, or the solver has nothing to fix.
    expect(solution.measuredLufs).not.toBeNull()
    expect(TARGET_INTEGRATED_LUFS - solution.unlimitedLufs).toBeGreaterThan(4)

    expect(result.integratedLufs).toBeGreaterThan(TARGET_INTEGRATED_LUFS - 0.5)
    expect(result.integratedLufs).toBeLessThan(TARGET_INTEGRATED_LUFS + 0.5)
    expect(result.truePeakDbtp).toBeLessThanOrEqual(TRUE_PEAK_CEILING_DBTP + 0.01)
  })

  it('reaches the target by correcting a measurement, not by predicting one', () => {
    // The proof that the loop is load-bearing rather than decorative: a chain
    // whose limiter costs 1.2 LU is solved to target, and the first estimate —
    // the value the product used before VH-50 — is not.
    const limiterCostLu = 1.2
    const measure = (gainDb: number | null): Promise<number> =>
      Promise.resolve(gainDb === null ? -30 : -30 + gainDb - limiterCostLu)

    return solveChainGainDb(measure).then((solution) => {
      expect(solution.converged).toBe(true)
      expect(solution.gainDb).toBeCloseTo(14 + limiterCostLu, 6)
      expect(solution.measuredLufs).toBeCloseTo(TARGET_INTEGRATED_LUFS, 6)
      expect(solution.refinementPasses).toBe(2)
    })
  })

  it('gives silence no gain at all', async () => {
    const solution = await solveChainGainDb(() => Promise.resolve(Number.NEGATIVE_INFINITY))
    expect(solution.gainDb).toBe(0)
    expect(solution.refinementPasses).toBe(0)
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

  it('leaves a consistent recording alone rather than processing it anyway', async () => {
    const source = speechLike({
      sampleRate: SAMPLE_RATE, seconds: 60, channelCount: 2, startPeakDbfs: -14,
    })
    const { analysis, envelope } = await normalise(source)
    // Consistent material: LRA under the 9 LU gate, so the macro-leveller is
    // not merely small — it does not run.
    expect(analysis.loudnessRangeLu).toBeLessThan(9)
    expect(envelope.gainDb).toHaveLength(0)
  })

  it('adds no swing of its own to deliberately variable material', async () => {
    const source = speechLike({
      sampleRate: SAMPLE_RATE, seconds: 120, channelCount: 2,
      startPeakDbfs: -8, endPeakDbfs: -30, pauseSeconds: 2, pauseEverySeconds: 10,
    })
    const { analysis, result } = await normalise(source)

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

  it('reduces loudness range on a drifting recording rather than flattening it', async () => {
    const source = speechLike({
      sampleRate: SAMPLE_RATE, seconds: 120, channelCount: 2,
      startPeakDbfs: -8, endPeakDbfs: -30, pauseSeconds: 2, pauseEverySeconds: 10,
    })
    const { analysis, result } = await normalise(source)

    expect(analysis.loudnessRangeLu).toBeGreaterThan(9)
    // Narrowed, because the drift was corrected...
    expect(result.loudnessRangeLu).toBeLessThan(analysis.loudnessRangeLu)
    // ...but not squashed: a +/-6 dB clamp cannot flatten a 20 dB drift, and
    // should not try. Speech that ends up with no range left sounds processed.
    expect(result.loudnessRangeLu).toBeGreaterThan(3)
  })

})

describe('the limiter only engages when it must', () => {
  it('does not touch material that already fits under the ceiling', async () => {
    const source = tone({
      sampleRate: SAMPLE_RATE, seconds: 20, frequency: 300, peakDbfs: -20,
      channelCount: 2, fadeSeconds: 0.05,
    })
    const { result, gainDb } = await normalise(source)
    expect(result.integratedLufs).toBeCloseTo(TARGET_INTEGRATED_LUFS, 0)
    expect(Number.isFinite(gainDb)).toBe(true)
  })
})
