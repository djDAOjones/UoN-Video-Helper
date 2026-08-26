import { describe, expect, it } from 'vitest'

import { AudioAnalyser } from '../audio/analyse'
import { AudioChain } from '../audio/chain'
import { solveAudioGain } from './audio-gain-solver'

const SAMPLE_RATE = 48_000

function analyse(channels: readonly Float32Array[]): number {
  const analyser = new AudioAnalyser({ sampleRate: SAMPLE_RATE, channelCount: channels.length })
  analyser.addFrames(channels)
  return analyser.finish().integratedLufs
}

function throughCompleteChain(source: Float32Array, gainDb: number | null): Float32Array[] {
  const chain = new AudioChain({
    sampleRate: SAMPLE_RATE,
    channelCount: 1,
    envelope: { gainDb: new Float64Array(0), stepSeconds: 0.1 },
    gainDb,
  })
  const parts: Float32Array[] = []
  for (let offset = 0; offset < source.length; offset += 4_096) {
    const processed = chain.process([source.slice(offset, offset + 4_096)])[0]!
    parts.push(processed.slice())
  }
  parts.push(chain.flush()[0]!.slice())
  const frames = parts.reduce((total, part) => total + part.length, 0)
  const output = new Float32Array(frames)
  let offset = 0
  for (const part of parts) {
    output.set(part, offset)
    offset += part.length
  }
  return [output]
}

describe('solveAudioGain', () => {
  it('converges in one complete-chain traversal when the response is linear', async () => {
    const gains: number[] = []
    const result = await solveAudioGain(
      (gainDb) => {
        gains.push(gainDb)
        return Promise.resolve(-24 + gainDb)
      },
      { initialGainDb: 8 },
    )

    expect(result).toMatchObject({
      status: 'converged',
      gainDb: 8,
      measuredIntegratedLufs: -16,
      iterations: 1,
    })
    expect(gains).toEqual([8])
  })

  it('feeds limiter attenuation back into the one constant gain', async () => {
    // Above 6 dB, half of every additional dB is taken back by the limiter.
    // The old one-shot subtraction chose 8 dB and stopped at -17 LUFS.
    const response = (gainDb: number): number => -24 + gainDb - Math.max(0, gainDb - 6) * 0.5

    const result = await solveAudioGain((gainDb) => Promise.resolve(response(gainDb)), {
      initialGainDb: 8,
    })

    expect(result.status).toBe('converged')
    expect(result.iterations).toBeGreaterThan(1)
    expect(result.gainDb).toBeGreaterThan(8)
    expect(Math.abs(result.measuredIntegratedLufs! + 16)).toBeLessThanOrEqual(0.1)
  })

  it('measures every candidate through the real limiter and its flush', async () => {
    const source = new Float32Array(SAMPLE_RATE * 4)
    for (let frame = 0; frame < source.length; frame++) {
      const quiet = 0.012 * Math.sin((2 * Math.PI * 220 * frame) / SAMPLE_RATE)
      const burstFrame = frame % Math.round(SAMPLE_RATE * 0.25)
      const burst = burstFrame < 240 ? 0.9 * Math.sin((2 * Math.PI * 997 * frame) / SAMPLE_RATE) : 0
      source[frame] = quiet + burst
    }

    const beforeGain = analyse(throughCompleteChain(source, null))
    const initialGainDb = -16 - beforeGain
    const initialOutput = analyse(throughCompleteChain(source, initialGainDb))
    const result = await solveAudioGain(
      (gainDb) => Promise.resolve(analyse(throughCompleteChain(source, gainDb))),
      { initialGainDb },
    )

    expect(initialOutput).toBeLessThan(-16.1)
    expect(result.status).toBe('converged')
    expect(result.iterations).toBeGreaterThan(1)
    expect(Math.abs(result.measuredIntegratedLufs! + 16)).toBeLessThanOrEqual(0.1)
  })

  it('keeps digital silence at zero gain', async () => {
    const result = await solveAudioGain(() => Promise.resolve(Number.NEGATIVE_INFINITY), {
      initialGainDb: 60,
    })

    expect(result).toEqual({
      status: 'silence',
      gainDb: 0,
      measuredIntegratedLufs: Number.NEGATIVE_INFINITY,
      iterations: 1,
    })
  })

  it('reports a limiter plateau and returns the lowest-error measured gain', async () => {
    const result = await solveAudioGain((gainDb) => Promise.resolve(Math.min(-20, -30 + gainDb)), {
      initialGainDb: 14,
    })

    expect(result).toEqual({
      status: 'plateau',
      gainDb: 14,
      measuredIntegratedLufs: -20,
      iterations: 2,
    })
  })

  it('reports an infeasible target at the configured gain bound', async () => {
    const result = await solveAudioGain((gainDb) => Promise.resolve(-40 + gainDb), {
      initialGainDb: 20,
      maxAbsoluteGainDb: 10,
    })

    expect(result).toEqual({
      status: 'infeasible',
      gainDb: 10,
      measuredIntegratedLufs: -30,
      iterations: 1,
    })
  })

  it('never exceeds the configured complete-chain traversal bound', async () => {
    let traversals = 0
    const result = await solveAudioGain(
      (gainDb) => {
        traversals++
        return Promise.resolve(-30 + gainDb * 0.01)
      },
      { maxIterations: 3, plateauToleranceLu: 0 },
    )

    expect(result.status).toBe('iteration-limit')
    expect(result.iterations).toBe(3)
    expect(traversals).toBe(3)
  })
})
