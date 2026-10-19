/**
 * The finished video's own record, in one line.
 *
 * Two outputs of one recording can differ in trim, output and closing, and a
 * result named by its file alone was still the wrong version saved by someone
 * making several in a row (VH-107, spec gap review A-05). So the result — and
 * the question asked before it is discarded — carries what the job was: file,
 * part kept, output, closing as chosen and as applied. Fixed when the job
 * ends; never relabelled by the controls for the next one.
 *
 * Pure, so every combination's sentence is tested in Node.
 */

import {
  closingModeFor,
  closingTypeUsesInternal,
  type BrandingMode,
  type ClosingControls,
} from '../config/branding'
import type { LanguageTag } from '../config/languages'
import type { PresetId } from '../config/presets'
import { closingWords, t } from '../i18n'
import type { KeptRange } from '../media/kept-range'
import { formatDuration } from './format'
import { formatTrimTime } from './trim'

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

/** The one-line record: "Made from NAME: PART, OUTPUT, CLOSING." */
export function jobSummaryText(record: JobRecord): string {
  return t().result.summary({
    name: record.sourceName,
    part: keptPartText(record.keptRange, record.durationSeconds),
    output: t().preset.labels[record.presetId],
    closing: closingChoiceText(record.closing, record.wordsLanguage),
  })
}
