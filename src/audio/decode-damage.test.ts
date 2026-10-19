/**
 * VH-122: decode damage is silenced block by block, with a block either side,
 * and the analysis then measures the recording rather than the burst — the
 * measurement VH-115 found wrecked by one corrupt frame.
 */

import { describe, expect, it } from 'vitest'

import { DECODE_DAMAGE } from '../config/audio'
import { dbfsToAmplitude, speechLike } from '../../test/helpers/signals'
import { AudioAnalyser, type AudioAnalysis } from './analyse'
import { DecodeDamageGate, type TimedBlock } from './decode-damage'

const SAMPLE_RATE = 44100
/** One AAC frame, as a decoder hands them over. */
const FRAMES = 1024
const LIMIT = dbfsToAmplitude(DECODE_DAMAGE.aboveDbfs)

const at = (index: number): number => (index * FRAMES) / SAMPLE_RATE

/** Steady stereo sound at `level`, the `index`th block of the stream. */
function block(index: number, level = 0.1): TimedBlock {
  return {
    planar: [new Float32Array(FRAMES).fill(level), new Float32Array(FRAMES).fill(-level)],
    timestampSeconds: at(index),
  }
}

/** Clean blocks, with one sample of each listed block set to `value`. */
function stream(length: number, damage: Readonly<Record<number, number>>): TimedBlock[] {
  return Array.from({ length }, (_v, index) => {
    const made = block(index)
    const value = damage[index]
    if (value !== undefined) made.planar[1]![FRAMES / 2] = value
    return made
  })
}

/** Every block through one gate, in order, flushed. */
function gated(blocks: readonly TimedBlock[]): { out: TimedBlock[]; gate: DecodeDamageGate } {
  const gate = new DecodeDamageGate()
  const out: TimedBlock[] = []
  for (const each of blocks) {
    const released = gate.push(each)
    if (released) out.push(released)
  }
  const last = gate.flush()
  if (last) out.push(last)
  return { out, gate }
}

/** Which blocks came out silent, by position. */
const silenced = (out: readonly TimedBlock[]): number[] =>
  out.flatMap((each, index) =>
    each.planar.every((channel) => channel.every((v) => v === 0)) ? [index] : [],
  )

describe('DecodeDamageGate', () => {
  it('gives every clean block back untouched, in order, one behind', () => {
    const blocks = stream(3, {})
    const gate = new DecodeDamageGate()
    expect(gate.push(blocks[0]!)).toBeNull()
    expect(gate.push(blocks[1]!)).toBe(blocks[0])
    expect(gate.push(blocks[2]!)).toBe(blocks[1])
    expect(gate.flush()).toBe(blocks[2])
    expect(silenced(blocks)).toEqual([])
    expect(gate.silencedAtSeconds).toEqual([])
  })

  it('has nothing to give back from an empty stream', () => {
    const gate = new DecodeDamageGate()
    expect(gate.flush()).toBeNull()
    expect(gate.silencedAtSeconds).toEqual([])
  })

  it('leaves a hot recording alone, and takes a sample just beyond the threshold as damage', () => {
    // The corpus's hottest real decode peaks at +0.96 dBFS.
    expect(silenced(gated(stream(3, { 1: dbfsToAmplitude(0.96) })).out)).toEqual([])
    expect(silenced(gated(stream(3, { 1: LIMIT * 0.99 })).out)).toEqual([])
    expect(silenced(gated(stream(3, { 1: LIMIT * 1.01 })).out)).toEqual([0, 1, 2])
  })

  it('silences the damaged block and one either side, and nothing further', () => {
    const { out, gate } = gated(stream(7, { 3: 700 }))
    expect(silenced(out)).toEqual([2, 3, 4])
    expect(out.map((each) => each.timestampSeconds)).toEqual([0, 1, 2, 3, 4, 5, 6].map(at))
    expect(gate.silencedAtSeconds).toEqual([at(2)])
  })

  it('takes the weak edge of a two-block burst with the strong one', () => {
    // One corrupt frame overlap-adds into two blocks; the earlier rises from
    // nothing under the window and here stays under the threshold (VH-115's
    // first burst rose from -24 to +13 dBFS before reaching +57).
    const { out, gate } = gated(stream(8, { 3: dbfsToAmplitude(4), 4: 700 }))
    // The weak edge is not damage itself, so nothing before it goes.
    expect(silenced(out)).toEqual([3, 4, 5])
    expect(gate.silencedAtSeconds).toEqual([at(3)])
  })

  it('says each separate stretch once, and joins stretches that touch', () => {
    expect(gated(stream(12, { 2: -900, 8: 50 })).gate.silencedAtSeconds).toEqual([at(1), at(7)])
    const joined = gated(stream(8, { 2: 50, 4: 50 }))
    expect(silenced(joined.out)).toEqual([1, 2, 3, 4, 5])
    expect(joined.gate.silencedAtSeconds).toEqual([at(1)])
  })

  it('handles damage in the first block and in the last', () => {
    const first = gated(stream(4, { 0: 50 }))
    expect(silenced(first.out)).toEqual([0, 1])
    expect(first.gate.silencedAtSeconds).toEqual([0])
    expect(silenced(gated(stream(4, { 3: 50 })).out)).toEqual([2, 3])
  })

  it('takes a sample that is not a number as damage', () => {
    expect(silenced(gated(stream(3, { 1: Number.NaN })).out)).toEqual([0, 1, 2])
    expect(silenced(gated(stream(3, { 1: Number.NEGATIVE_INFINITY })).out)).toEqual([0, 1, 2])
  })
})

describe('the analysis behind the gate (VH-115 regression)', () => {
  const seconds = 30
  /** Speech-like sound at -20 dBFS, in decoder-sized blocks, a burst at 12 s like CULT2011's. */
  function lecture(withBurst: boolean): TimedBlock[] {
    const planar = speechLike({
      sampleRate: SAMPLE_RATE,
      seconds,
      channelCount: 2,
      startPeakDbfs: -20,
      pauseSeconds: 0.5,
      pauseEverySeconds: 4,
    })
    const blocks: TimedBlock[] = []
    for (let start = 0, index = 0; start < planar[0]!.length; start += FRAMES, index++) {
      blocks.push({
        planar: planar.map((channel) => channel.slice(start, start + FRAMES)),
        timestampSeconds: at(index),
      })
    }
    if (withBurst) {
      // A rising edge to +13 dBFS, then +57 dBFS of noise: two blocks, as measured.
      const first = Math.round((12 * SAMPLE_RATE) / FRAMES)
      for (let i = 0; i < FRAMES; i++) {
        const rising = dbfsToAmplitude(-24 + (37 * i) / FRAMES)
        const burst = dbfsToAmplitude(57) * Math.sin(i * 1.7) * Math.cos(i * 0.31)
        for (const channel of blocks[first]!.planar) channel[i] = rising
        for (const channel of blocks[first + 1]!.planar) channel[i] = burst
      }
    }
    return blocks
  }

  function measure(blocks: readonly TimedBlock[]): AudioAnalysis {
    const analyser = new AudioAnalyser({ sampleRate: SAMPLE_RATE, channelCount: 2 })
    for (const each of blocks) analyser.addFrames(each.planar)
    return analyser.finish()
  }

  it('measures the recording, not the burst, once the damage is silenced', () => {
    const clean = measure(lecture(false))
    const ungated = measure(lecture(true))
    const { out, gate } = gated(lecture(true))
    const healed = measure(out)

    // What VH-115 found: the burst owns the measurement.
    expect(ungated.integratedLufs - clean.integratedLufs).toBeGreaterThan(10)
    expect(ungated.truePeakDbtp).toBeGreaterThan(40)

    expect(healed.integratedLufs).toBeCloseTo(clean.integratedLufs, 0)
    expect(Math.abs(healed.loudnessRangeLu - clean.loudnessRangeLu)).toBeLessThan(1)
    expect(healed.truePeakDbtp).toBeLessThanOrEqual(clean.truePeakDbtp + 0.1)
    expect(gate.silencedAtSeconds).toHaveLength(1)
    expect(gate.silencedAtSeconds[0]).toBeCloseTo(12, 1)
  })
})
