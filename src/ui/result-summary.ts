/**
 * The finished video's own record, in one line.
 *
 * Two outputs of one recording can differ in trim, output and closing, and a
 * result named by its file alone was still the wrong version saved by someone
 * making several in a row (VH-107, spec gap review A-05). So the result — and
 * the question asked before it is discarded — carries what the job was: file,
 * part kept, output, closing as chosen and as applied — and which title card
 * opens it and, when it is not the page's, the language of its words, since
 * a staff card and a submission's, or two video languages, read the same
 * otherwise (VH-140, audit V-02). Fixed when the job ends; never relabelled
 * by the controls for the next one.
 *
 * Pure, so every combination's sentence is tested in Node.
 */

import {
  closingModeFor,
  closingTypeUsesInternal,
  type BrandingMode,
  type ClosingControls,
} from '../config/branding'
import { TITLE_CARD_SECONDS } from '../config/cards'
import { LANGUAGE_NAMES, type LanguageTag } from '../config/languages'
import type { PresetId } from '../config/presets'
import type { VideoKind } from '../config/video-kind'
import { closingWords, language, sentenceGap, t } from '../i18n'
import type { EndedEarly } from '../media/ends-early'
import type { KeptRange } from '../media/kept-range'
import { formatDuration } from './format'
import { formatTrimTime } from './trim'
import { shortfallTimes } from './warning-text'

/** What a job was started with, read once so the record cannot drift from the job. */
export interface JobRecord {
  readonly sourceName: string
  /** `null` keeps the whole video. */
  readonly keptRange: KeptRange | null
  readonly durationSeconds: number
  readonly presetId: PresetId
  readonly closing: ClosingControls
  /** The language of the video's own text, which Internal use only's words are drawn in (VH-132). */
  readonly wordsLanguage: LanguageTag
  /** Staff video or Student submission, as the switch stood when the job started (VH-131, VH-140). */
  readonly videoKind: VideoKind
  /**
   * Whether a title card opens the video; never its words (VH-127). Its kind
   * is the video's: the staff card, or a submission's (VH-128).
   */
  readonly titleCard: boolean
}

/** What the finished file actually carries, which is not always what was asked for. */
export interface ClosingOutcome {
  /** False when the closing was asked for and could not be loaded at all. */
  readonly applied: boolean
  /** The mode the file has, or `null` with no closing in it. */
  readonly mode: BrandingMode | null
  /** Whether the file carries sound — a silent job levelled nothing. */
  readonly sound?: boolean
  /** Whether an opening landed; none can while openings are withdrawn (VH-23). */
  readonly opening?: boolean
  /** What the encode found short of the file's index, or `null` for a whole file (VH-139). */
  readonly endedEarly?: EndedEarly | null
}

/** "the whole video (4 minutes, 12 seconds)" or "2 minutes of 4 minutes, 12 seconds, from 0:30.0 to 2:30.0". */
export function keptPartText(range: KeptRange | null, durationSeconds: number): string {
  const duration = formatDuration(durationSeconds)
  if (!range) return t().result.keptWhole({ duration })
  return t().result.keptPart({
    kept: formatDuration(range.endSeconds - range.startSeconds),
    duration,
    from: formatTrimTime(range.startSeconds),
    to: formatTrimTime(range.endSeconds),
  })
}

/**
 * The closing as the controls describe it, in the result line's register,
 * with the words Internal use only drew in the video's language, which need
 * not be the page's.
 */
export function closingChoiceText(controls: ClosingControls, wordsLanguage: LanguageTag): string {
  const { result } = t()
  if (controls.type === 'none') return result.closingNone
  const { colour, type } = controls
  const closing =
    type === 'cut'
      ? result.closingCut[colour]
      : controls.onset === 'freeze'
        ? result.closingOverFreeze[colour][type]
        : result.closingOverPicture[colour][type]
  return controls.internal && closingTypeUsesInternal(type)
    ? result.closingInternal({ closing, words: closingWords(wordsLanguage) })
    : closing
}

/**
 * The sentence for a closing that is not the one chosen, or `null` when the
 * file has what was asked for.
 *
 * Compared mode against mode — what the controls map to against what the
 * file carries — so every fallback is covered, not one. A fade or slide whose
 * animation could not be loaded becomes a cut (VH-12), and used to be
 * reported as success with the fade still described above it (U-14); a
 * source shorter than the animation has it over a held last frame instead
 * of over the picture (`closingTimeline`, Codex review of VH-107).
 */
export function closingOutcomeText(controls: ClosingControls, outcome: ClosingOutcome): string | null {
  const { result } = t()
  if (controls.type === 'none') return null
  if (!outcome.applied) return result.notLoaded
  const wanted = closingModeFor(controls)
  if (outcome.mode === null || outcome.mode === wanted) return null
  const { colour } = controls
  const type = controls.type === 'slide' ? 'slide' : 'fade'
  if (outcome.mode === 'hard-cut') return result.fellBackToCut[colour][type]
  if (outcome.mode === 'over-freeze') return result.fellBackToFreeze[colour][type]
  return result.fellBackToPicture[colour][type]
}

/**
 * What stands beside the record when the file stopped before its index said
 * (VH-139), or `null` for a whole file: where each track stopped, that a
 * closing follows a held last picture, and the way out. Each track is said
 * against its own declared end; both share one sentence, and one time when
 * they stop within the same second.
 *
 * @param closingInFile - Whether the file carries a closing, which is what
 *   holds the last picture from where the picture stopped.
 */
export function endedEarlyText(ended: EndedEarly | null | undefined, closingInFile: boolean): string | null {
  if (!ended) return null
  const { endedEarly } = t().result
  const { picture, sound } = ended
  let facts: string
  if (picture && sound) {
    const end = Math.max(picture.endSeconds, sound.endSeconds)
    const seen = shortfallTimes({ ...picture, endSeconds: end })
    const heard = shortfallTimes({ ...sound, endSeconds: end })
    facts =
      seen.stops === heard.stops
        ? endedEarly.together(seen)
        : endedEarly.both({ picture: seen.stops, sound: heard.stops, end: seen.end })
  } else if (picture) {
    facts = endedEarly.picture(shortfallTimes(picture))
  } else if (sound) {
    facts = endedEarly.sound(shortfallTimes(sound))
  } else {
    return null
  }
  const held = picture && closingInFile ? endedEarly.held : null
  return [facts, held, endedEarly.next].filter((part): part is string => part !== null).join(sentenceGap())
}

/**
 * The one-line record: "Made from NAME: PART, OUTPUT, CLOSING.", with "a
 * 5-second staff title card, then" or "a 5-second submission card, then"
 * before PART when a card is on (VH-127, VH-140); then, when the video's
 * words are in another language than the page's, "Video language: NAME.",
 * named as the choice names it (VH-140). Never the card's words.
 *
 * @param made - The part of the source the file actually carries, when the
 *   source stopped short of the part kept (VH-139): the record then gives the
 *   length made, never the length the file promised.
 */
export function jobSummaryText(record: JobRecord, made: KeptRange | null = null): string {
  const parts = {
    name: record.sourceName,
    part: keptPartText(made ?? record.keptRange, record.durationSeconds),
    output: t().preset.inRecord[record.presetId],
    closing: closingChoiceText(record.closing, record.wordsLanguage),
  }
  const summary = record.titleCard
    ? t().result.summaryWithCard[record.videoKind]({ ...parts, seconds: TITLE_CARD_SECONDS })
    : t().result.summary(parts)
  // Read when painted, so a change of the page's language names it, or stops.
  if (record.wordsLanguage === language()) return summary
  return [summary, t().result.videoLanguage({ language: LANGUAGE_NAMES[record.wordsLanguage] })].join(
    sentenceGap(),
  )
}

/**
 * The line under the progress bar: the video being made, as it was started
 * — its type and its video language, named as their choices name them — since
 * the switch is never locked, and Video language, locked with step 3, still
 * follows the page's until picked, so either may say otherwise by now
 * (VH-140, VH-191, audit V-05).
 */
export function runningJobText(record: JobRecord): string {
  return t().progress.job({
    kind: t().videoKind.options[record.videoKind],
    language: LANGUAGE_NAMES[record.wordsLanguage],
  })
}

/**
 * The record and what stands beside it, as one passage: the discard question
 * names what would be lost in a paragraph (VH-107), so the length made and
 * why go with it, as the result shows them (VH-139).
 */
export function recordPassage(record: JobRecord, outcome: ClosingOutcome): string {
  return [
    jobSummaryText(record, outcome.endedEarly?.made ?? null),
    endedEarlyText(outcome.endedEarly, outcome.mode !== null),
    closingOutcomeText(record.closing, outcome),
  ]
    .filter((part): part is string => part !== null)
    .join(sentenceGap())
}
