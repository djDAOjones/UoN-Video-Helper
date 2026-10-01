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

import { brandingChoiceFor, type BrandingMode, type ClosingControls } from '../config/branding'
import { PRESETS, type PresetId } from '../config/presets'
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
}

/** What the finished file actually carries, which is not always what was asked for. */
export interface ClosingOutcome {
  /** False when the closing was asked for and could not be loaded at all. */
  readonly applied: boolean
  /** The mode the file has, or `null` with no closing in it. */
  readonly mode: BrandingMode | null
  /** Whether the file carries sound — a silent job levelled nothing. */
  readonly sound?: boolean
}

/** "the whole video (4 minutes 12 seconds)" or "2 minutes of 4 minutes 12 seconds, from 0:30.0 to 2:30.0". */
export function keptPartText(range: KeptRange | null, durationSeconds: number): string {
  if (!range) return `the whole video (${formatDuration(durationSeconds)})`
  return (
    `${formatDuration(range.endSeconds - range.startSeconds)} of ${formatDuration(durationSeconds)}, ` +
    `from ${formatTrimTime(range.startSeconds)} to ${formatTrimTime(range.endSeconds)}`
  )
}

/** The closing as the three controls describe it, in the result line's register. */
export function closingChoiceText(controls: ClosingControls): string {
  if (controls.type === 'none') return 'no University closing'
  if (controls.type === 'cut') return `a cut to the ${controls.colour} closing card`
  const verb = controls.type === 'slide' ? 'sliding' : 'fading'
  return controls.onset === 'freeze'
    ? `the ${controls.colour} closing ${verb} in over a held last frame`
    : `the ${controls.colour} closing ${verb} in over the picture`
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
  if (controls.type === 'none') return null
  if (!outcome.applied) {
    return 'The closing could not be loaded, so it is not in this video. Everything else was applied as asked.'
  }
  const wanted = brandingChoiceFor(controls).mode as BrandingMode
  if (outcome.mode === null || outcome.mode === wanted) return null
  const label = controls.type === 'slide' ? 'Slide' : 'Fade'
  const verb = controls.type === 'slide' ? 'slides' : 'fades'
  if (outcome.mode === 'hard-cut') {
    return (
      `You chose ${label}, but the animation could not be loaded, ` +
      `so this video cuts to the ${controls.colour} closing card instead.`
    )
  }
  if (outcome.mode === 'over-freeze') {
    return (
      `Your video is shorter than the ${label.toLowerCase()} animation, so the ${controls.colour} closing ` +
      `${verb} in over a held last frame rather than over the picture.`
    )
  }
  return `The ${controls.colour} closing ${verb} in over the picture, not over a held last frame as chosen.`
}

/** The one-line record: "Made from NAME: PART, OUTPUT, CLOSING." */
export function jobSummaryText(record: JobRecord): string {
  return (
    `Made from ${record.sourceName}: ${keptPartText(record.keptRange, record.durationSeconds)}, ` +
    `${PRESETS[record.presetId].label}, ${closingChoiceText(record.closing)}.`
  )
}
