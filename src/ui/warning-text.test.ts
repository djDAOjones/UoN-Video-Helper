/**
 * Acceptance criterion 7 asks that every warning "reads clearly to a
 * non-technical reader". That is a human judgement, but some of it is
 * mechanical: no jargon, no blame, and always a next step.
 */

import { afterEach, describe, expect, it } from 'vitest'

import { detectSourceWarnings } from '../audio/warnings'
import type { AudioWarningCode, NoAudioReason } from '../audio/warnings'
import { DECODE_DAMAGE } from '../config/audio'
import { LANGUAGES_OFFERED } from '../config/languages'
import type { LanguageTag } from '../config/languages'
import { setLanguage, t } from '../i18n'
import { damageTimes, shortfallTimes, warningText } from './warning-text'

/**
 * Exhaustive by construction, not by hand. A `Record` keyed on the union makes
 * TypeScript refuse to compile when a code is added without words to go with
 * it — which is how a warning would otherwise ship untested.
 */
const ALL = Object.keys({
  'cut-short': true,
  'ends-early': true,
  'no-audio': true,
  'decode-damage': true,
  clipping: true,
  'very-quiet': true,
  'highly-variable': true,
  noisy: true,
  'extended-silence': true,
  'target-missed': true,
  'metadata-lost': true,
  'heavy-limiting': true,
} satisfies Record<AudioWarningCode, true>) as AudioWarningCode[]

const sample = (code: AudioWarningCode) =>
  warningText({
    code,
    detail: {
      integratedLufs: -42,
      loudnessRangeLu: 18.4,
      seconds: 95,
      missedBy: 2.5,
      milliseconds: 44,
      peakDbfs: -26.4,
      stopsAtSeconds: 20.84,
      endSeconds: 30,
    },
    atSeconds: [82.41, 185.34],
  })

describe('every warning has words', () => {
  it.each(ALL)('%s', (code) => {
    const { heading, detail } = sample(code)
    expect(heading.length).toBeGreaterThan(10)
    expect(detail.length).toBeGreaterThan(40)
  })

  it('never leaves a number unformatted', () => {
    for (const code of ALL) {
      const { heading, detail } = sample(code)
      expect(`${heading} ${detail}`).not.toMatch(/NaN|undefined|Infinity|\[object/)
    }
  })

  it('avoids implementation jargon', () => {
    // Spec 9.2: user language, not implementation terms. LUFS and LU used to
    // survive, for the meters people are told to check against; they went
    // with VH-114 — the sentences around them already said what mattered.
    const banned = /codec|bitrate|dBTP|dBFS|LUFS|\bLU\b|re-encod|demux|mux|WebCodecs|OPFS|percentile|K-weight/i
    for (const code of ALL) {
      const { heading, detail } = sample(code)
      expect(`${heading} ${detail}`, code).not.toMatch(banned)
    }
  })

  it('never blames the person who made the recording', () => {
    const blaming = /you should have|your mistake|incorrectly|badly|wrong setting|failed to/i
    for (const code of ALL) {
      expect(`${sample(code).heading} ${sample(code).detail}`, code).not.toMatch(blaming)
    }
  })

  it('states what happens next rather than only what is wrong', () => {
    // Each one has to leave the reader knowing whether to carry on.
    const forwardLooking = /will|can|worth|check|fine to use|still/i
    for (const code of ALL) {
      expect(sample(code).detail, code).toMatch(forwardLooking)
    }
  })

  it('phrases findings as possibilities, not verdicts', () => {
    for (const code of ['clipping', 'noisy'] as const) {
      expect(sample(code).heading, code).toMatch(/\bmay\b/)
    }
  })
})

describe('decode damage, said with its times (VH-122)', () => {
  const said = (atSeconds: number[]) =>
    warningText({ code: 'decode-damage', detail: { moments: atSeconds.length }, atSeconds })

  it('names one time, floored, so seeking to it lands before the damage', () => {
    const { heading, detail } = said([82.9])
    expect(heading).toBe('A damaged moment will be silenced')
    expect(detail).toMatch(/^At 1:22 in the original video, the file holds a burst of noise/)
  })

  it('lists several as the language lists them', () => {
    const { heading, detail } = said([82.41, 185.34])
    expect(heading).toBe('Damaged moments will be silenced')
    expect(detail).toMatch(/^At 1:22 and 3:05 in the original video, the file holds bursts of noise/)
  })

  it('says a time once, however many stretches share its second', () => {
    expect(damageTimes([82.1, 82.7, 185.3])).toEqual(['1:22', '3:05'])
  })

  it('counts the rest past the most it lists', () => {
    const atSeconds = Array.from({ length: DECODE_DAMAGE.timesSaid + 2 }, (_v, i) => 60 * (i + 1))
    expect(damageTimes(atSeconds)).toHaveLength(DECODE_DAMAGE.timesSaid + 1)
    expect(damageTimes(atSeconds).at(-1)).toBe('2 other moments')
    expect(said(atSeconds).detail).toContain('5:00 and 2 other moments')
    expect(damageTimes(atSeconds.slice(0, DECODE_DAMAGE.timesSaid))).not.toContain('other moments')
  })
})

describe('a file that ends early, said with where its sound stops (VH-139)', () => {
  const said = (stopsAtSeconds: number, endSeconds: number) =>
    warningText({ code: 'ends-early', detail: { stopsAtSeconds, endSeconds } })

  it('names the stop, floored, and the end the file declares', () => {
    const { heading, detail } = said(20.84, 30)
    expect(heading).toBe('The file ends early')
    expect(detail).toMatch(/^Its audio stops at 0:20 of 0:30\. /)
    expect(detail).toContain('After 0:20, the new video will be silent.')
  })

  it('gives times as the trim’s fields do, past a minute and an hour', () => {
    expect(said(2465.7, 3480).detail).toMatch(/^Its audio stops at 41:05 of 58:00\. /)
    expect(said(3725.2, 4000).detail).toMatch(/^Its audio stops at 1:02:05 of 1:06:40\. /)
  })

  it('times a stop and an end the same way wherever they are said', () => {
    expect(shortfallTimes({ stopsAtSeconds: 20.99, endSeconds: 29.6 })).toEqual({ stops: '0:20', end: '0:30' })
  })
})

describe('no audio, said by its cause (VH-206)', () => {
  afterEach(() => setLanguage('en-GB'))
  const said = (reason?: NoAudioReason) =>
    warningText({ code: 'no-audio', detail: {}, ...(reason ? { reason } : {}) })

  it('keeps a file with no audio track’s words as they were', () => {
    expect(said('no-track')).toEqual({
      heading: 'This video has no audio',
      detail:
        'There is no audio to level, so the rest of the job runs without it. If you expected audio, check the recording before publishing.',
    })
    // A warning with no reason is told as before.
    expect(said()).toEqual(said('no-track'))
  })

  it('says the part kept has too little, and to keep more, never to check the recording', () => {
    const { heading, detail } = said('kept-too-little')
    expect(heading).toBe('The part you kept has too little audio to level')
    expect(detail).toBe(
      'The new video will have no audio. If you want the audio, move the start or end time to keep more of the video where there is audio.',
    )
    expect(detail).not.toMatch(/check the recording/i)
  })

  it('says a whole video has too little, and that the original keeps its sound (VH-213)', () => {
    const { heading, detail } = said('whole-too-little')
    expect(heading).toBe('This video has too little audio to level')
    expect(detail).toBe(
      'It has less than half a second of sound, too short to level, so the new video will have no audio. Your original file keeps its sound.',
    )
    // Nothing was trimmed, so no time to move; and the recording has sound.
    expect(detail).not.toMatch(/start or end time|check the recording/i)
  })

  it.each(LANGUAGES_OFFERED)('words each cause from %s’s own table', (tag) => {
    setLanguage(tag)
    const { warnings } = t()
    expect(said('kept-too-little')).toEqual(warnings.keptTooLittleAudio)
    expect(said('whole-too-little')).toEqual(warnings.wholeTooLittleAudio)
    expect(said('no-track')).toEqual(warnings.noAudio)
    expect(warnings.keptTooLittleAudio.heading).not.toBe(warnings.noAudio.heading)
    expect(new Set([warnings.noAudio, warnings.keptTooLittleAudio, warnings.wholeTooLittleAudio].map((w) => w.heading)).size).toBe(3)
  })

  it.each(LANGUAGES_OFFERED)(
    'in %s, each cause found by detection is said in its own words',
    (tag) => {
      setLanguage(tag)
      const { warnings } = t()
      const headings = (...args: Parameters<typeof detectSourceWarnings>) =>
        detectSourceWarnings(...args).map((warning) => warningText(warning).heading)
      // No audio track: today's words.
      expect(headings(null)).toEqual([warnings.noAudio.heading])
      // Too little sound decoded in the part kept, or none: the kept-part words.
      expect(headings({ silent: true, decodedEndSeconds: 3.98 })).toEqual([
        warnings.keptTooLittleAudio.heading,
      ])
      expect(headings({ silent: true, decodedEndSeconds: null })).toEqual([
        warnings.keptTooLittleAudio.heading,
      ])
      // Sound the part declares and never delivers: the file ends early, not too little kept.
      expect(
        headings({ silent: true, decodedEndSeconds: null }, { stopsAtSeconds: 25, endSeconds: 30 }),
      ).toEqual([warnings.endsEarly.heading])
      // Too little in a whole video, nothing trimmed, or none decoded: its own words (VH-213).
      expect(headings({ silent: true, decodedEndSeconds: 10, whole: true })).toEqual([
        warnings.wholeTooLittleAudio.heading,
      ])
      expect(headings({ silent: true, decodedEndSeconds: null, whole: true })).toEqual([
        warnings.wholeTooLittleAudio.heading,
      ])
      // And a whole video's declared sound that never arrives still ends early.
      expect(
        headings(
          { silent: true, decodedEndSeconds: null, whole: true },
          { stopsAtSeconds: 0, endSeconds: 10 },
        ),
      ).toEqual([warnings.endsEarly.heading])
    },
  )
})

describe('heavy limiting, said with the finished video (VH-193)', () => {
  afterEach(() => setLanguage('en-GB'))
  const said = (limiterBiteLu: number) =>
    warningText({ code: 'heavy-limiting', detail: { limiterBiteLu } })

  it('says the sheet’s B11 words, whatever the bite', () => {
    expect(said(8.1).heading).toBe('The loudest moments were held down hard')
    expect(said(8.1).detail).toBe(
      'To reach the usual level, the tool had to hold down the loudest moments of this recording hard. That can make a voice sound flat or squashed, so play the new video before you use it. Next time, try adjusting how you record the sound.',
    )
    expect(said(3.2)).toEqual(said(8.1))
  })

  // VH-212 (F15b): the owner's clause, true whether or not the new video plays
  // here; the old one asked for a play before the save, which a player that
  // cannot play the new video rules out.
  const CLAUSE: Record<LanguageTag, { now: string; was: string }> = {
    'en-GB': { now: 'so play the new video before you use it', was: 'before you save it' },
    'zh-Hans': { now: '所以请在使用之前播放新视频', was: '保存之前' },
    'ms-MY': { now: 'sebelum anda menggunakannya', was: 'menyimpannya' },
  }

  it.each(LANGUAGES_OFFERED)(
    'in %s, asks for the new video to be played before it is used (VH-212)',
    (tag) => {
      setLanguage(tag)
      const { detail } = said(8.1)
      expect(detail).toBe(t().warnings.heavyLimiting.detail)
      expect(detail).toContain(CLAUSE[tag].now)
      expect(detail).not.toContain(CLAUSE[tag].was)
    },
  )
})
