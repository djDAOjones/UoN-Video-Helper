import { describe, expect, it } from 'vitest'

import { deriveSourceTimeline, mapSourceTimestamp, type TrackTiming } from './source-timeline'

const timing = (firstTimestampSeconds: number, endTimestampSeconds: number): TrackTiming => ({
  firstTimestampSeconds,
  endTimestampSeconds,
})

describe('source timeline', () => {
  it('maps aligned positive starts to zero and transforms both ends', () => {
    const timeline = deriveSourceTimeline(timing(0.25, 10.25), timing(0.25, 10.75))

    expect(timeline).toEqual({
      originSeconds: 0.25,
      videoEndSeconds: 10,
      audioEndSeconds: 10.5,
    })
    expect(mapSourceTimestamp(timeline, 0.25)).toBe(0)
    expect(Object.isFrozen(timeline)).toBe(true)
  })

  it('uses a negative video origin while preserving later audio timing', () => {
    const timeline = deriveSourceTimeline(timing(-0.02, 9.98), timing(0.03, 10.03))

    expect(timeline.originSeconds).toBe(-0.02)
    expect(mapSourceTimestamp(timeline, -0.02)).toBe(0)
    expect(mapSourceTimestamp(timeline, 0.03)).toBeCloseTo(0.05, 12)
    expect(timeline.videoEndSeconds).toBe(10)
    expect(timeline.audioEndSeconds).toBeCloseTo(10.05, 12)
  })

  it('keeps a delayed audio track delayed relative to video', () => {
    const timeline = deriveSourceTimeline(timing(0.25, 10.25), timing(0.5, 10.5))

    expect(mapSourceTimestamp(timeline, 0.25)).toBe(0)
    expect(mapSourceTimestamp(timeline, 0.5)).toBe(0.25)
    expect(timeline.videoEndSeconds).toBe(10)
    expect(timeline.audioEndSeconds).toBe(10.25)
  })

  it('supports a source without audio', () => {
    const timeline = deriveSourceTimeline(timing(1.5, 6.5), null)

    expect(timeline).toEqual({
      originSeconds: 1.5,
      videoEndSeconds: 5,
      audioEndSeconds: null,
    })
  })

  it('clamps a timestamp before the shared origin to zero', () => {
    const timeline = deriveSourceTimeline(timing(0.25, 1.25), timing(0.5, 1.5))

    expect(mapSourceTimestamp(timeline, 0.249)).toBe(0)
  })

  it.each([
    ['non-finite video start', timing(Number.NaN, 1), null],
    ['non-finite video end', timing(0, Number.POSITIVE_INFINITY), null],
    ['video end before start', timing(2, 1), null],
    ['non-finite audio start', timing(0, 1), timing(Number.NEGATIVE_INFINITY, 1)],
    ['non-finite audio end', timing(0, 1), timing(0, Number.NaN)],
    ['audio end before start', timing(0, 1), timing(2, 1)],
  ])('rejects %s', (_label, video, audio) => {
    expect(() => deriveSourceTimeline(video, audio)).toThrow(RangeError)
  })

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'rejects a non-finite sample timestamp (%s)',
    (timestamp) => {
      const timeline = deriveSourceTimeline(timing(0, 1), null)
      expect(() => mapSourceTimestamp(timeline, timestamp)).toThrow(RangeError)
    },
  )
})
