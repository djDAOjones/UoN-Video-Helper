/**
 * VH-107 / spec gap review A-05: the finished video's record, in words.
 */

import { afterEach, describe, expect, it } from 'vitest'

import { CLOSING_CONTROL_DEFAULTS, type ClosingControls } from '../config/branding'
import { setLanguage } from '../i18n'
import type { EndedEarly } from '../media/ends-early'
import {
  closingOutcomeText,
  endedEarlyText,
  jobSummaryText,
  keptPartText,
  recordPassage,
  type JobRecord,
} from './result-summary'

const whole: JobRecord = {
  sourceName: 'Lecture 3.mp4',
  keptRange: null,
  durationSeconds: 252,
  presetId: 'best',
  closing: CLOSING_CONTROL_DEFAULTS,
  wordsLanguage: 'en-GB',
  titleCard: false,
}

describe('jobSummaryText', () => {
  it('names the file, the whole video, the output and the closing', () => {
    expect(jobSummaryText(whole)).toBe(
      'Made from Lecture 3.mp4: the whole video (4 minutes 12 seconds), Larger / better, a cut to the blue closing card.',
    )
  })

  it('says what part was kept, with its times, when the video was trimmed', () => {
    const trimmed: JobRecord = {
      ...whole,
      keptRange: { startSeconds: 30, endSeconds: 150 },
      presetId: 'smaller',
      closing: { type: 'fade', onset: 'freeze', colour: 'white', internal: false },
    }
    expect(jobSummaryText(trimmed)).toBe(
      'Made from Lecture 3.mp4: 2 minutes of 4 minutes 12 seconds, from 0:30.0 to 2:30.0, Smaller / reduced, the white closing fading in over a held last frame.',
    )
  })

  it('says when no closing was chosen', () => {
    expect(jobSummaryText({ ...whole, closing: { ...whole.closing, type: 'none' } })).toContain(
      'no University closing.',
    )
  })

  it('describes a slide over the picture', () => {
    expect(keptPartText(null, 61)).toBe('the whole video (1 minute 1 second)')
    expect(
      jobSummaryText({ ...whole, closing: { type: 'slide', onset: 'existing', colour: 'blue', internal: false } }),
    ).toContain('the blue closing sliding in over the picture.')
  })
})

describe('jobSummaryText with Internal use only (VH-126)', () => {
  const marked = { ...CLOSING_CONTROL_DEFAULTS, internal: true }

  it('says the card was marked, quoting the words', () => {
    expect(jobSummaryText({ ...whole, closing: marked })).toBe(
      'Made from Lecture 3.mp4: the whole video (4 minutes 12 seconds), Larger / better, a cut to the blue closing card, marked “Internal use only”.',
    )
  })

  it('quotes the words in the video’s language, which need not be the page’s', () => {
    expect(jobSummaryText({ ...whole, closing: marked, wordsLanguage: 'zh-Hans' })).toContain(
      'marked “仅供内部使用”.',
    )
  })

  it('marks nothing when there is no closing', () => {
    expect(jobSummaryText({ ...whole, closing: { ...marked, type: 'none' } })).toContain(
      'no University closing.',
    )
  })
})

describe('jobSummaryText with a title card (VH-127)', () => {
  it('says the card opens the video, before the part kept, and quotes none of its words', () => {
    expect(jobSummaryText({ ...whole, titleCard: true })).toBe(
      'Made from Lecture 3.mp4: a 5-second title card, then the whole video (4 minutes 12 seconds), Larger / better, a cut to the blue closing card.',
    )
  })

  it('says nothing of a card when there is none', () => {
    expect(jobSummaryText(whole)).not.toContain('title card')
  })
})

describe('closingOutcomeText', () => {
  const fade: ClosingControls = { type: 'fade', onset: 'existing', colour: 'blue', internal: false }

  it('is silent when the file has what was chosen', () => {
    expect(closingOutcomeText(fade, { applied: true, mode: 'over-picture' })).toBeNull()
    expect(closingOutcomeText(CLOSING_CONTROL_DEFAULTS, { applied: true, mode: 'hard-cut' })).toBeNull()
    expect(closingOutcomeText({ ...fade, type: 'none' }, { applied: false, mode: null })).toBeNull()
  })

  it('says when a fade or slide became a cut (U-14)', () => {
    expect(closingOutcomeText(fade, { applied: true, mode: 'hard-cut' })).toBe(
      'You chose Fade, but the animation could not be loaded, so this video cuts to the blue closing card instead.',
    )
    expect(closingOutcomeText({ ...fade, type: 'slide', colour: 'white' }, { applied: true, mode: 'hard-cut' })).toContain(
      'You chose Slide',
    )
  })

  it('says when a short source put the closing over a held frame instead (Codex review)', () => {
    expect(closingOutcomeText(fade, { applied: true, mode: 'over-freeze' })).toBe(
      'Your video is shorter than the fade animation. The blue closing fades in over a held last frame instead of over the picture.',
    )
    // The other way round cannot happen today, but a mode that differs is never silent.
    expect(closingOutcomeText({ ...fade, onset: 'freeze' }, { applied: true, mode: 'over-picture' })).toContain(
      'not over a held last frame as chosen',
    )
    // A cut is a cut, whatever the onset control held.
    expect(closingOutcomeText({ type: 'cut', onset: 'freeze', colour: 'white', internal: false }, { applied: true, mode: 'hard-cut' })).toBeNull()
  })

  it('says when the closing is missing altogether (VH-22)', () => {
    expect(closingOutcomeText(fade, { applied: false, mode: null })).toContain('not in this video')
  })
})

describe('a file that ends early, in the record (VH-139)', () => {
  afterEach(() => setLanguage('en-GB'))

  /** The file the audit found: 30 s declared, picture and sound decoded to about 21. */
  const audited: EndedEarly = {
    picture: { stopsAtSeconds: 20.92, endSeconds: 30 },
    sound: { stopsAtSeconds: 20.84, endSeconds: 30 },
    made: { startSeconds: 0, endSeconds: 20.92 },
  }
  const thirty: JobRecord = { ...whole, sourceName: 'truncated-30s.mp4', durationSeconds: 30 }

  it('gives the length made, never the length the file promised', () => {
    const text = jobSummaryText(thirty, audited.made)
    expect(text).toBe(
      'Made from truncated-30s.mp4: 21 seconds of 30 seconds, from 0:00.0 to 0:20.9, Larger / better, a cut to the blue closing card.',
    )
    expect(text).not.toContain('the whole video')
  })

  it('gives the length made from a trimmed file, from where the part kept starts', () => {
    const trimmed = { ...thirty, keptRange: { startSeconds: 5, endSeconds: 28 } }
    expect(jobSummaryText(trimmed, { startSeconds: 5, endSeconds: 20.92 })).toContain(
      '16 seconds of 30 seconds, from 0:05.0 to 0:20.9',
    )
  })

  it('stands as asked when nothing was made short', () => {
    expect(jobSummaryText(thirty, null)).toBe(jobSummaryText(thirty))
    expect(endedEarlyText(null, true)).toBeNull()
    expect(endedEarlyText(undefined, true)).toBeNull()
  })

  it('says where both stop, once when it is the same second, and that the closing follows a held picture', () => {
    expect(endedEarlyText(audited, true)).toBe(
      'The file you chose ends early: its picture and sound stop at 0:20 of 0:30. From there until the closing, the video holds its last picture. If you have a complete copy, create the video again from that one.',
    )
  })

  it('says nothing of a held picture with no closing to hold it for', () => {
    expect(endedEarlyText(audited, false)).not.toContain('holds its last picture')
  })

  it('names each stop when they differ', () => {
    const apart: EndedEarly = { ...audited, sound: { stopsAtSeconds: 12.5, endSeconds: 30 } }
    expect(endedEarlyText(apart, false)).toMatch(
      /^The file you chose ends early: its picture stops at 0:20 and its sound at 0:12, of 0:30\. /,
    )
  })

  it('names the one track that stopped', () => {
    const sound: EndedEarly = { picture: null, sound: { stopsAtSeconds: 20.84, endSeconds: 30 }, made: null }
    expect(endedEarlyText(sound, true)).toBe(
      'The file you chose ends early: its sound stops at 0:20 of 0:30. If you have a complete copy, create the video again from that one.',
    )
    const picture: EndedEarly = { picture: { stopsAtSeconds: 20.92, endSeconds: 30 }, sound: null, made: null }
    expect(endedEarlyText(picture, true)).toMatch(/^The file you chose ends early: its picture stops at 0:20 of 0:30\. From there/)
  })

  it('carries the length made and why into the question before the video is discarded', () => {
    const passage = recordPassage(thirty, { applied: true, mode: 'hard-cut', endedEarly: audited })
    expect(passage).toMatch(/^Made from truncated-30s\.mp4: 21 seconds of 30 seconds, /)
    expect(passage).toContain('The file you chose ends early')
    // A whole file's question is the record alone, as before.
    expect(recordPassage(thirty, { applied: true, mode: 'hard-cut' })).toBe(jobSummaryText(thirty))
  })

  it('is said in Chinese and Malay, every time filled', () => {
    setLanguage('zh-Hans')
    expect(endedEarlyText(audited, true)).toBe(
      '您选择的文件提前结束：画面和声音在0:20处停止，而全长应为0:30。从那里到结尾，视频会一直停留在最后一帧画面。如果您有完整的副本，请用它重新制作视频。',
    )
    setLanguage('ms-MY')
    expect(endedEarlyText(audited, false)).toBe(
      'Fail yang anda pilih berakhir lebih awal: gambar dan bunyinya berhenti pada 0:20 daripada 0:30. Jika anda mempunyai salinan yang lengkap, cipta video itu semula daripada salinan tersebut.',
    )
  })
})
