/**
 * VH-107 / spec gap review A-05: the finished video's record, in words; and
 * VH-140 (audit V-02, V-05): which card opens it, the language of its words
 * when not the page's, and the running job's own type and language.
 */

import { afterEach, describe, expect, it } from 'vitest'

import { CLOSING_CONTROL_DEFAULTS, type ClosingControls } from '../config/branding'
import { TITLE_CARD_SECONDS } from '../config/cards'
import { LANGUAGE_NAMES, LANGUAGES_OFFERED } from '../config/languages'
import { closingWords, setLanguage } from '../i18n'
import type { EndedEarly } from '../media/ends-early'
import {
  closingOutcomeText,
  endedEarlyText,
  jobSummaryText,
  keptPartText,
  recordPassage,
  runningJobText,
  type JobRecord,
} from './result-summary'

const whole: JobRecord = {
  sourceName: 'Lecture 3.mp4',
  keptRange: null,
  durationSeconds: 252,
  presetId: 'best',
  closing: CLOSING_CONTROL_DEFAULTS,
  wordsLanguage: 'en-GB',
  videoKind: 'staff',
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
    // VH-140 names which card: this one is a staff video's.
    expect(jobSummaryText({ ...whole, titleCard: true })).toBe(
      'Made from Lecture 3.mp4: a 5-second staff title card, then the whole video (4 minutes 12 seconds), Larger / better, a cut to the blue closing card.',
    )
  })

  it('says nothing of a card when there is none', () => {
    expect(jobSummaryText(whole)).not.toContain('title card')
  })
})

describe('the record names the card and the words’ language (VH-140, audit V-02)', () => {
  afterEach(() => setLanguage('en-GB'))

  const marked = { ...CLOSING_CONTROL_DEFAULTS, internal: true }
  const submission: JobRecord = { ...whole, videoKind: 'submission', titleCard: true, closing: marked }

  it('happy path: a submission’s card is named as one', () => {
    expect(jobSummaryText(submission)).toBe(
      'Made from Lecture 3.mp4: a 5-second submission card, then the whole video (4 minutes 12 seconds), Larger / better, a cut to the blue closing card, marked “Internal use only”.',
    )
  })

  it('regression: a staff card and a submission’s card of one recording read differently', () => {
    const staff = jobSummaryText({ ...submission, videoKind: 'staff' })
    expect(staff).toContain('a 5-second staff title card')
    expect(staff).not.toBe(jobSummaryText(submission))
  })

  it('takes the card’s length from config, never a figure of its own', () => {
    for (const videoKind of ['staff', 'submission'] as const) {
      expect(jobSummaryText({ ...whole, videoKind, titleCard: true })).toContain(`a ${TITLE_CARD_SECONDS}-second `)
    }
  })

  it('names the words’ language when it is not the page’s, as the choice names it', () => {
    expect(jobSummaryText({ ...submission, wordsLanguage: 'zh-Hans' })).toBe(
      'Made from Lecture 3.mp4: a 5-second submission card, then the whole video (4 minutes 12 seconds), Larger / better, a cut to the blue closing card, marked “仅供内部使用”. Video language: 简体中文.',
    )
    // A video with no card and no words is named too: the choice is the job's.
    expect(jobSummaryText({ ...whole, wordsLanguage: 'ms-MY' })).toMatch(/ Video language: Bahasa Malaysia\.$/)
  })

  it('regression: two video languages with no closing words read differently', () => {
    const none = { ...submission, closing: { ...marked, type: 'none' as const } }
    expect(jobSummaryText({ ...none, wordsLanguage: 'zh-Hans' })).not.toBe(jobSummaryText(none))
  })

  it('says nothing of the language when it is the page’s, in every language', () => {
    for (const tag of LANGUAGES_OFFERED) {
      setLanguage(tag)
      const text = jobSummaryText({ ...submission, wordsLanguage: tag })
      expect(text, tag).not.toContain(LANGUAGE_NAMES[tag])
    }
  })

  it('follows a change of the page’s language: the same record names it, or stops', () => {
    const english = { ...submission, wordsLanguage: 'en-GB' as const }
    setLanguage('zh-Hans')
    const chinese = jobSummaryText(english)
    expect(chinese.startsWith(`由 Lecture 3.mp4 构成：${TITLE_CARD_SECONDS} 秒的学生提交作品卡，随后是`)).toBe(true)
    // Joined as Chinese joins sentences, with no gap.
    expect(chinese.endsWith('“Internal use only”。视频语言：English。')).toBe(true)
    setLanguage('en-GB')
    expect(jobSummaryText(english)).not.toContain('Video language')
  })

  it('names the card and the language in Malay too', () => {
    setLanguage('ms-MY')
    const text = jobSummaryText({ ...submission, wordsLanguage: 'zh-Hans' })
    expect(text).toMatch(/^Dibuat daripada Lecture 3\.mp4: kad serahan 5 saat, kemudian /)
    expect(text).toMatch(/ Bahasa video: 简体中文\.$/)
  })

  it('never carries the card’s words: the record has none to carry', () => {
    expect(Object.keys(submission).sort()).toEqual(
      ['closing', 'durationSeconds', 'keptRange', 'presetId', 'sourceName', 'titleCard', 'videoKind', 'wordsLanguage'].sort(),
    )
  })

  it('carries the card and the language into the question before the video is discarded', () => {
    const passage = recordPassage({ ...submission, wordsLanguage: 'zh-Hans' }, { applied: true, mode: 'hard-cut' })
    expect(passage).toContain('a 5-second submission card')
    expect(passage).toMatch(/Video language: 简体中文\.$/)
  })
})

describe('the running job’s own type and language, with its progress (VH-140, audit V-05)', () => {
  afterEach(() => setLanguage('en-GB'))

  it('names the type and the language the job started with', () => {
    expect(runningJobText(whole)).toBe('This video: Staff video. Video language: English.')
    expect(runningJobText({ ...whole, videoKind: 'submission', wordsLanguage: 'zh-Hans' })).toBe(
      'This video: Student submission. Video language: 简体中文.',
    )
  })

  it('names them in the page’s words, the language by its own name, in every language', () => {
    for (const page of LANGUAGES_OFFERED) {
      setLanguage(page)
      for (const tag of LANGUAGES_OFFERED) {
        const text = runningJobText({ ...whole, videoKind: 'submission', wordsLanguage: tag })
        expect(text, `${page} ${tag}`).toContain(LANGUAGE_NAMES[tag])
        expect(text, `${page} ${tag}`).not.toContain('{')
        // The type, never the closing's words.
        expect(text, `${page} ${tag}`).not.toContain(closingWords(tag))
      }
    }
    setLanguage('zh-Hans')
    expect(runningJobText(whole)).toBe('此视频：教职员工视频。视频语言：English。')
    setLanguage('ms-MY')
    expect(runningJobText(whole)).toBe('Video ini: Video staf. Bahasa video: English.')
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
