/**
 * The codec probe's arithmetic: which frames of the programme are encoded.
 *
 * The encode and decode themselves are WebCodecs and are verified in a
 * browser, against real lectures (`/spike-aac-cost.html`). What can break
 * silently is the sampling — windows that overlap, run off the end, bunch at
 * one end of the file, or grow with its length — and a probe that samples the
 * wrong audio returns a confident, wrong number that moves the gain.
 */

import { describe, expect, it } from 'vitest'

import {
  CODEC_PROBE,
  ENCODE_TRUE_PEAK_HEADROOM_DB,
  LIMITER,
  TRUE_PEAK_CEILING_DBTP,
} from '../config/audio'
import {
  WindowRouter,
  limiterCeilingFor,
  planProbeWindows,
  type ProbeWindow,
} from './codec-probe'

const RATE = 48_000
const seconds = (value: number) => Math.round(value * RATE)
const budgetFrames = seconds(CODEC_PROBE.windowSeconds) * CODEC_PROBE.maximumWindows

describe('planProbeWindows (VH-83)', () => {
  it('probes a short programme whole, which is exact', () => {
    expect(planProbeWindows(seconds(90), RATE)).toEqual([{ start: 0, end: seconds(90) }])
  })

  it('probes whole right up to the budget, and samples just past it', () => {
    expect(planProbeWindows(budgetFrames, RATE)).toHaveLength(1)
    expect(planProbeWindows(budgetFrames + 1, RATE)).toHaveLength(CODEC_PROBE.maximumWindows)
  })

  it('holds the amount of audio fixed however long the source is', () => {
    // The streaming rule: nothing may scale with the file.
    for (const hours of [1, 3, 8]) {
      const windows = planProbeWindows(seconds(hours * 3600), RATE)
      const total = windows.reduce((sum, window) => sum + (window.end - window.start), 0)
      expect(total).toBe(budgetFrames)
    }
  })

  it('keeps every window inside the programme, in order, without overlap', () => {
    const total = seconds(3600)
    const windows = planProbeWindows(total, RATE)
    expect(windows[0]!.start).toBeGreaterThanOrEqual(0)
    expect(windows.at(-1)!.end).toBeLessThanOrEqual(total)
    for (let i = 1; i < windows.length; i++) {
      expect(windows[i]!.start).toBeGreaterThanOrEqual(windows[i - 1]!.end)
    }
  })

  it('spreads the windows through the whole programme', () => {
    // One contiguous excerpt mis-predicted a real lecture by 0.3 LU: the
    // codec's cost varies along a file. Each window sits in its own equal
    // share, so neither end of the file is left out or over-weighted.
    const total = seconds(3600)
    const windows = planProbeWindows(total, RATE)
    const share = total / windows.length
    windows.forEach((window, index) => {
      expect(window.start).toBeGreaterThanOrEqual(Math.floor(index * share))
      expect(window.end).toBeLessThanOrEqual(Math.ceil((index + 1) * share))
    })
    // And centred in it, so the first is not pinned to the title card.
    expect(windows[0]!.start).toBeGreaterThan(0)
  })

  it('returns nothing for a programme with no audio to probe', () => {
    expect(planProbeWindows(0, RATE)).toEqual([])
    expect(planProbeWindows(-5, RATE)).toEqual([])
    expect(planProbeWindows(Number.NaN, RATE)).toEqual([])
    expect(planProbeWindows(1000, 0)).toEqual([])
  })

  it('honours a different budget', () => {
    const windows = planProbeWindows(1000, 100, { windowSeconds: 1, maximumWindows: 4 })
    expect(windows).toEqual([
      { start: 75, end: 175 },
      { start: 325, end: 425 },
      { start: 575, end: 675 },
      { start: 825, end: 925 },
    ])
  })
})

describe('WindowRouter (VH-83)', () => {
  /** A stereo block whose left channel counts frames from `from`, so a slice says where it came from. */
  function block(from: number, frames: number): Float32Array[] {
    const left = Float32Array.from({ length: frames }, (_, index) => from + index)
    return [left, left.map((value) => -value)]
  }

  /** Routes a stream of `total` frames in blocks of the given sizes; returns the left channel routed. */
  function routed(windows: readonly ProbeWindow[], total: number, sizes: readonly number[]): number[] {
    const router = new WindowRouter(windows)
    const out: number[] = []
    let at = 0
    let turn = 0
    while (at < total) {
      const frames = Math.min(sizes[turn++ % sizes.length]!, total - at)
      for (const piece of router.route(block(at, frames))) out.push(...piece[0]!)
      at += frames
    }
    return out
  }

  const expected = (windows: readonly ProbeWindow[]) =>
    windows.flatMap((window) =>
      Array.from({ length: window.end - window.start }, (_, index) => window.start + index),
    )

  const windows: ProbeWindow[] = [
    { start: 10, end: 25 },
    { start: 40, end: 45 },
    { start: 90, end: 100 },
  ]

  it.each([
    ['one block for everything', [100]],
    ['blocks smaller than a window', [4]],
    ['blocks that straddle window edges', [7, 13]],
    ['single frames', [1]],
    ['blocks that hold two whole windows', [50]],
  ])('emits exactly the window frames, in order: %s', (_name, sizes) => {
    expect(routed(windows, 100, sizes)).toEqual(expected(windows))
  })

  it('never emits a frame twice, whatever the block size', () => {
    for (const size of [1, 2, 3, 5, 8, 13, 21, 34, 100]) {
      const frames = routed(windows, 100, [size])
      expect(new Set(frames).size).toBe(frames.length)
    }
  })

  it('carries every channel of a piece, cut at the same frames', () => {
    const router = new WindowRouter([{ start: 3, end: 6 }])
    const [piece] = router.route(block(0, 10))
    expect([...piece![0]!]).toEqual([3, 4, 5])
    expect([...piece![1]!]).toEqual([-3, -4, -5])
  })

  it('copies, so a block the chain reuses cannot change what was routed', () => {
    const router = new WindowRouter([{ start: 0, end: 4 }])
    const source = block(0, 4)
    const [piece] = router.route(source)
    source[0]!.fill(99)
    expect([...piece![0]!]).toEqual([0, 1, 2, 3])
  })

  it('emits nothing once the windows are spent, and nothing for none', () => {
    const router = new WindowRouter([{ start: 0, end: 2 }])
    expect(router.route(block(0, 5))).toHaveLength(1)
    expect(router.route(block(5, 5))).toEqual([])
    expect(new WindowRouter([]).route(block(0, 5))).toEqual([])
  })

  it('routes a planned hour exactly to the budget', () => {
    const total = seconds(3600)
    const planned = planProbeWindows(total, RATE)
    const router = new WindowRouter(planned)
    let got = 0
    // Decoder-sized blocks, without materialising an hour of samples at once.
    const size = 1024
    for (let at = 0; at < total; at += size) {
      const frames = Math.min(size, total - at)
      for (const piece of router.route([new Float32Array(frames)])) got += piece[0]!.length
    }
    expect(got).toBe(budgetFrames)
  })
})

describe('limiterCeilingFor (VH-83)', () => {
  // Spec 5.1's ceiling, -2.0 dBTP, is the FINISHED file's. What the limiter
  // must hold to deliver it depends on what the encode adds.

  it('holds the standing ceiling when nothing was measured', () => {
    expect(limiterCeilingFor(null)).toBe(LIMITER.ceilingDbtp)
    expect(limiterCeilingFor(Number.NaN)).toBe(LIMITER.ceilingDbtp)
    expect(limiterCeilingFor(Number.NEGATIVE_INFINITY)).toBe(LIMITER.ceilingDbtp)
  })

  it('never gives headroom back for a codec that overshoots little', () => {
    // 0.03 dB was measured at 192 kbps stereo. The allowance is a floor:
    // less headroom buys nothing, because loudness is solved after the
    // limiter, and too little is a job refused at the very end.
    for (const overshoot of [-0.2, 0, 0.03, 0.39, ENCODE_TRUE_PEAK_HEADROOM_DB - CODEC_PROBE.overshootMarginDb]) {
      expect(limiterCeilingFor(overshoot)).toBeCloseTo(LIMITER.ceilingDbtp, 10)
    }
  })

  it('lowers the ceiling for the mono lecture the smaller output refused', () => {
    // CULT1027 at 96 kbps mono: 1.19 and 1.41 dB measured. Limited to -3.0,
    // the file came out at -1.81 dBTP and the job failed verification.
    for (const overshoot of [1.19, 1.41]) {
      const ceiling = limiterCeilingFor(overshoot)
      expect(ceiling).toBeLessThan(LIMITER.ceilingDbtp)
      // Whatever the limiter holds, plus what the codec adds, stays under the
      // published ceiling with the margin to spare.
      expect(ceiling + overshoot).toBeCloseTo(
        TRUE_PEAK_CEILING_DBTP - CODEC_PROBE.overshootMarginDb,
        10,
      )
    }
  })

  it('caps the headroom, so a wild measurement cannot crush the programme', () => {
    expect(limiterCeilingFor(40)).toBe(TRUE_PEAK_CEILING_DBTP - CODEC_PROBE.maximumHeadroomDb)
    expect(limiterCeilingFor(Number.POSITIVE_INFINITY)).toBe(LIMITER.ceilingDbtp)
  })

  it('is never above the published ceiling', () => {
    for (const overshoot of [null, -5, 0, 0.5, 1, 2, 5, 50]) {
      expect(limiterCeilingFor(overshoot)).toBeLessThan(TRUE_PEAK_CEILING_DBTP)
    }
  })
})
