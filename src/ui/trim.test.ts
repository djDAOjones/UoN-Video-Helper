/**
 * The trim step's words and numbers (VH-96).
 *
 * The invariants: a typed time is read exactly or refused, never guessed; the
 * page accepts precisely the ranges the worker does; and the handles move by
 * a known step and never past the other handle's limit.
 */

import { describe, expect, it } from 'vitest'

import { KEPT_MIN_SECONDS } from '../config/trim'
import {
  formatTrimTime,
  parseTrimTime,
  trimHandleText,
  trimKeyTarget,
  trimRangeFor,
  trimSummary,
} from './trim'

describe('times in the fields', () => {
  it.each([
    [0, '0:00.0'],
    [5.04, '0:05.0'],
    [75.46, '1:15.5'],
    [599.96, '10:00.0'],
    [3723.4, '1:02:03.4'],
  ])('shows %s s as %s', (seconds, text) => {
    expect(formatTrimTime(seconds)).toBe(text)
  })

  it.each([
    ['75', 75],
    [' 75.5 ', 75.5],
    ['1:15', 75],
    ['1:15.5', 75.5],
    ['1:02:03.4', 3723.4],
    ['0:00', 0],
  ])('reads %j as %s s', (text, seconds) => {
    expect(parseTrimTime(text)).toBeCloseTo(seconds, 9)
  })

  it.each(['', 'abc', '1:75', '-5', '1.5:00', '1:2:3:4', '1:', ':30', '1,5'])(
    'refuses %j rather than guessing',
    (text) => {
      expect(parseTrimTime(text)).toBeNull()
    },
  )

  it('reads back what it shows', () => {
    for (const seconds of [0, 12.3, 59.9, 61, 3599.9, 3600]) {
      expect(parseTrimTime(formatTrimTime(seconds))).toBeCloseTo(seconds, 6)
    }
  })
})

describe('whether a range can be used', () => {
  it('is the whole video when nothing is cut, so no range is sent', () => {
    expect(trimRangeFor(0, 130, 130)).toEqual({ range: null })
  })

  it('is a range when an end is cut', () => {
    expect(trimRangeFor(12.3, 130, 130)).toEqual({ range: { startSeconds: 12.3, endSeconds: 130 } })
  })

  it('says why, in the worker’s own words, when it cannot be used', () => {
    expect(trimRangeFor(50, 40, 130)).toEqual({ problem: 'The end must come after the start.' })
    expect(trimRangeFor(50, 50 + KEPT_MIN_SECONDS - 1, 130)).toEqual({
      problem: `Keep at least ${KEPT_MIN_SECONDS} seconds of the video.`,
    })
  })
})

describe('what the step says', () => {
  it('says the whole video is kept when it is', () => {
    expect(trimSummary(null, 130)).toBe('Keeping the whole video, 2 minutes 10 seconds.')
  })

  it('says how much of how much is kept', () => {
    expect(trimSummary({ startSeconds: 12, endSeconds: 124 }, 130)).toBe(
      'Keeping 1 minute 52 seconds of 2 minutes 10 seconds.',
    )
  })

  it('gives each handle a place in words', () => {
    expect(trimHandleText(0, 130)).toBe('the beginning')
    expect(trimHandleText(130, 130)).toBe('the end')
    expect(trimHandleText(65, 130)).toBe('1 minute 5 seconds')
  })
})

describe('the handles on the keyboard', () => {
  const bounds = { min: 0, max: 127 }

  it('moves one second per arrow and ten per page', () => {
    expect(trimKeyTarget('ArrowRight', 10, bounds)).toBe(11)
    expect(trimKeyTarget('ArrowUp', 10, bounds)).toBe(11)
    expect(trimKeyTarget('ArrowLeft', 10, bounds)).toBe(9)
    expect(trimKeyTarget('ArrowDown', 10, bounds)).toBe(9)
    expect(trimKeyTarget('PageUp', 10, bounds)).toBe(20)
    expect(trimKeyTarget('PageDown', 10, bounds)).toBe(0)
  })

  it('goes to either limit on Home and End, and never past one', () => {
    expect(trimKeyTarget('Home', 50, bounds)).toBe(0)
    expect(trimKeyTarget('End', 50, bounds)).toBe(127)
    expect(trimKeyTarget('ArrowRight', 126.5, bounds)).toBe(127)
    expect(trimKeyTarget('PageDown', 3, bounds)).toBe(0)
  })

  it('leaves every other key to the browser', () => {
    expect(trimKeyTarget('Tab', 10, bounds)).toBeNull()
    expect(trimKeyTarget('a', 10, bounds)).toBeNull()
  })
})
