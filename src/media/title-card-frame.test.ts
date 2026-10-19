/**
 * The title card as the job's frames (VH-127): how long it holds on the
 * output's grid, what it moves on the timeline, the silence under it, what
 * pre-flight allows for it, and that its text never reaches a log. The real
 * encode, with the WebCodecs encoders, is checked in Chrome (slice (d)); none
 * is mocked here.
 */

import { describe, expect, it } from 'vitest'

import { GAP_SILENCE_BLOCK_SECONDS } from '../config/audio'
import { CLOSING_ONSET_SECONDS, LONGEST_CLOSING_SECONDS, type BrandingMode } from '../config/branding'
import { TITLE_CARD_SECONDS } from '../config/cards'
import { clearLogRecords, getLogRecords } from '../core/logger'
import { JobFailureError, classifyFailure } from '../workers/failure'
import { closingTimeline } from './branding'
import type { CardFonts, FrameSize, StaffCardText, SubmissionCardText } from './title-card'
import { brandingAllowanceSeconds, cardSilence, fitTitleCardForJob, titleCardSpan } from './title-card-frame'

const NTSC = 30000 / 1001
const RATES = [23.976, 24, 25, 29.97, NTSC, 30, 50, 59.94, 60]

/** As `title-card.test.ts`'s: a space a quarter of the size wide, anything else a half. */
function fakeMeasure(font: string, text: string): number {
  const px = Number(/([\d.]+)px/u.exec(font)![1])
  let width = 0
  for (const character of text) width += /\s/u.test(character) ? px / 4 : px / 2
  return width
}

const FONTS: CardFonts = { families: { heading: 'Heading', body: 'Body' }, measure: fakeMeasure }
const HD: FrameSize = { widthPx: 1920, heightPx: 1080 }

describe('titleCardSpan, the card in whole frames', () => {
  it.each([
    [25, 125, 5],
    [30, 150, 5],
    [29.97, 150, 150 / 29.97],
    [NTSC, 150, 5.005],
  ])('holds %s fps for %i frames, %s s', (frameRate, frames, seconds) => {
    const span = titleCardSpan(frameRate)
    expect(span.frames).toBe(frames)
    expect(span.durationSeconds).toBeCloseTo(seconds, 9)
  })

  it.each(RATES)('puts the content offset on the frame grid at %s fps, within half a frame of the nominal length', (frameRate) => {
    const span = titleCardSpan(frameRate)
    expect(Number.isInteger(span.frames)).toBe(true)
    expect(span.durationSeconds * frameRate).toBeCloseTo(span.frames, 9)
    expect(Math.abs(span.durationSeconds - TITLE_CARD_SECONDS)).toBeLessThanOrEqual(0.5 / frameRate)
  })
})

describe('the timeline, with and without a card', () => {
  // A trim reaches the timeline as the kept span, measured from the cut: a
  // 60 s source whole, and its 12.5 to 42.5 s kept.
  const cases: ReadonlyArray<readonly [string, number, number | null, BrandingMode]> = [
    ['whole, hard cut', 60, 60, 'hard-cut'],
    ['whole, audio outrunning the picture', 60, 61.2, 'over-picture'],
    ['trimmed, hard cut', 30, 30, 'hard-cut'],
    ['trimmed, over the freeze', 30, 30, 'over-freeze'],
    ['trimmed, silent', 30, null, 'over-picture'],
  ]

  it.each(cases)(
    '%s: the content, the closing and the end move by the card; nothing in source time moves',
    (_label, videoDurationSeconds, audioDurationSeconds, mode) => {
      const card = titleCardSpan(NTSC).durationSeconds
      const at = (openingSeconds: number) =>
        closingTimeline({
          videoDurationSeconds,
          audioDurationSeconds,
          mode,
          openingSeconds,
          closingSeconds: 4,
          onsetSeconds: CLOSING_ONSET_SECONDS,
          closingHasAudio: false,
        })
      const without = at(0)
      const withCard = at(card)

      expect(without.contentOffsetSeconds).toBe(0)
      expect(withCard.contentOffsetSeconds).toBe(card)
      expect(withCard.closingOffsetSeconds - without.closingOffsetSeconds).toBeCloseTo(card, 12)
      expect(withCard.timelineSeconds - without.timelineSeconds).toBeCloseTo(card, 12)
      // Measured in source time, so a hard cut before the source changes none of them.
      expect(withCard.overlayFromSeconds).toBe(without.overlayFromSeconds)
      expect(withCard.audioEndsAtSeconds).toBe(without.audioEndsAtSeconds)
      expect(withCard.mode).toBe(without.mode)
      expect(withCard.downgradedForShortSource).toBe(without.downgradedForShortSource)
    },
  )
})

describe('cardSilence, under the card', () => {
  const collect = (...args: Parameters<typeof cardSilence>) => [...cardSilence(...args)]
  const frameCount = (blocks: ReturnType<typeof collect>): number =>
    blocks.reduce((sum, block) => sum + block.channels[0]!.length, 0)

  it('fills the card from 0 to the content offset, contiguous, silent, in blocks of at most a second', () => {
    const offsetSeconds = titleCardSpan(NTSC).durationSeconds
    const blocks = collect(0, offsetSeconds, 48000, 2)
    expect(frameCount(blocks)).toBe(Math.round(offsetSeconds * 48000))
    let done = 0
    for (const block of blocks) {
      expect(block.channels).toHaveLength(2)
      expect(block.channels[0]!.length).toBeLessThanOrEqual(48000 * GAP_SILENCE_BLOCK_SECONDS)
      expect(block.timestampSeconds).toBeCloseTo(done / 48000, 12)
      for (const channel of block.channels) expect(channel.every((value) => value === 0)).toBe(true)
      done += block.channels[0]!.length
    }
  })

  it("at the source plan's own rate and channel count, from where an opening clip ends", () => {
    const blocks = collect(3, 8, 44100, 1)
    expect(blocks[0]!.timestampSeconds).toBe(3)
    expect(blocks.every((block) => block.channels.length === 1)).toBe(true)
    expect(frameCount(blocks)).toBe(5 * 44100)
  })

  it('makes nothing for an empty or backwards span', () => {
    expect(collect(5, 5, 48000, 2)).toHaveLength(0)
    expect(collect(5, 4, 48000, 2)).toHaveLength(0)
  })

  it('gives a fresh block each time, so a chain processing one in place cannot touch the next', () => {
    const [first, second] = collect(0, 2, 48000, 1)
    expect(first!.channels[0]).not.toBe(second!.channels[0])
  })
})

describe("brandingAllowanceSeconds, the estimates' upper bound", () => {
  it.each(RATES)('at %s fps covers the longest closing and the card as it is really held', (frameRate) => {
    const allowance = brandingAllowanceSeconds(frameRate)
    // The nominal five seconds alone would fall short at 29.97, where the card holds 5.005.
    expect(allowance).toBeGreaterThanOrEqual(LONGEST_CLOSING_SECONDS + titleCardSpan(frameRate).durationSeconds)
    expect(allowance - LONGEST_CLOSING_SECONDS).toBeLessThanOrEqual(TITLE_CARD_SECONDS + 0.5 / frameRate)
  })
})

describe("the card's text, kept out of the logs", () => {
  const SECRET = /Zqxj|Wvkp|Confidential/u

  it('no log record and no failure message carries it, on a fit or on a refusal', () => {
    clearLogRecords()
    const typed: StaffCardText = {
      title: 'Zqxj Confidential Module Wvkp',
      department: 'School of Zqxj',
      authors: 'Dr Wvkp',
      date: '19 October 2026',
    }
    expect(fitTitleCardForJob({ layout: 'staff', text: typed }, HD, FONTS).refused).toBeNull()

    const refused: unknown[] = []
    const tooWide: StaffCardText = { ...typed, title: `Zqxj${'W'.repeat(400)}` }
    const empty: StaffCardText = { title: ' ', department: '', authors: '', date: '' }
    for (const text of [tooWide, empty]) {
      try {
        fitTitleCardForJob({ layout: 'staff', text }, HD, FONTS)
      } catch (cause) {
        refused.push(cause)
      }
    }

    expect(refused).toHaveLength(2)
    for (const cause of refused) {
      expect(cause).toBeInstanceOf(JobFailureError)
      expect(classifyFailure(cause)).toBe('title-card-refused')
      // `handleProcess` logs the message as the failure's reason.
      expect((cause as Error).message).not.toMatch(SECRET)
    }
    expect(JSON.stringify(getLogRecords())).not.toMatch(SECRET)
  })

  it("nor Submission's: the convenor's name and the ID numbers, on a fit or on a refusal (VH-128)", () => {
    clearLogRecords()
    const IDS = /20412345|20412346/u
    const submission: SubmissionCardText = {
      assignment: 'Zqxj Essay',
      module: 'ZQXJ1001 Wvkp',
      convenor: 'Dr Confidential',
      ids: ['20412345', '20412346'],
      runningTime: '12:34',
      made: '19 October 2026 — not the submission date',
      labels: { module: 'Module', convenor: 'Convenor or tutor', ids: 'Student ID numbers', running: 'Running time', made: 'Card made' },
    }
    expect(fitTitleCardForJob({ layout: 'submission', text: submission }, HD, FONTS).refused).toBeNull()

    let refused: unknown = null
    try {
      fitTitleCardForJob({ layout: 'submission', text: { ...submission, convenor: `Zqxj${'W'.repeat(400)}` } }, HD, FONTS)
    } catch (cause) {
      refused = cause
    }
    expect(classifyFailure(refused)).toBe('title-card-refused')
    expect((refused as Error).message).not.toMatch(SECRET)
    expect((refused as Error).message).not.toMatch(IDS)
    expect(JSON.stringify(getLogRecords())).not.toMatch(SECRET)
    expect(JSON.stringify(getLogRecords())).not.toMatch(IDS)
  })
})
