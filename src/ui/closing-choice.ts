/**
 * The closing controls, in words.
 *
 * Three controls replaced four described radios (VH-90), and what the radios
 * said went with them: what happens to the last second of the user's video,
 * and how many seconds are added. The result line here says it again, for
 * whatever is currently selected — and it is what stops "None" under
 * "Animation type" reading as "no animation", which is what Cut is.
 *
 * Pure, so every combination's sentence is tested in Node.
 */

import {
  closingAddedSeconds,
  closingModeFor,
  closingTypeUsesInternal,
  closingTypeUsesOnset,
  type ClosingControls,
  type ClosingType,
} from '../config/branding'
import type { LanguageTag } from '../config/languages'
import type { VideoKind } from '../config/video-kind'
import { closingWords, language, t } from '../i18n'

/** The option text of "Animation type", which the disabled reasons quote. */
export function closingTypeLabel(type: ClosingType): string {
  return t().closing.types[type]
}

/**
 * The current selection's result, one line each as the page draws them
 * (VH-148): what the viewer sees at the end and what it costs in seconds,
 * and, with Internal use only, a line that quotes the words the card will
 * carry, in the video's text language (VH-132), the page's unless another is
 * given.
 */
export function closingResultLines(controls: ClosingControls, wordsLanguage: LanguageTag = language()): string[] {
  const { closing } = t()
  const { result } = closing
  if (controls.type === 'none') return [result.none]

  // The mode, and so the seconds, come from the same mapping the job uses —
  // the sentence cannot promise a different file from the one that is made.
  const adds = result.adds({ count: closingAddedSeconds(closingModeFor(controls)) })
  const { colour } = controls

  const type = controls.type
  const sentence =
    type === 'cut'
      ? result.cut[colour]({ adds })
      : controls.onset === 'freeze'
        ? result.overFreeze[colour][type]({ adds })
        : result.overPicture[colour][type]({ adds })
  return controls.internal
    ? [sentence, result.internal({ words: closingWords(wordsLanguage) })]
    : [sentence]
}

/**
 * Why "Animation onset" cannot be changed, or `null` when it can.
 *
 * A disabled control leaves the tab order and cannot explain itself, so the
 * reason is visible text beside it.
 */
export function onsetDisabledReason(type: ClosingType): string | null {
  if (closingTypeUsesOnset(type)) return null
  // The types without an onset are the two the table has a reason for.
  return type === 'cut' || type === 'none' ? t().closing.notUsedWith[type] : null
}

/** Why the colour cannot be changed, or `null` when it can. */
export function colourDisabledReason(type: ClosingType): string | null {
  return type === 'none' ? t().closing.notUsedWith.none : null
}

/** Why "Internal use only" cannot be changed, or `null` when it can: there is no closing to mark. */
export function internalDisabledReason(type: ClosingType): string | null {
  return closingTypeUsesInternal(type) ? null : t().closing.notUsedWith.none
}

/** What the "Internal use only" checkbox shows: ticked or not, locked or not, and why. */
export interface InternalCheckboxState {
  readonly checked: boolean
  readonly disabled: boolean
  /** Visible beside the box whenever it is locked, because a disabled control cannot explain itself. */
  readonly reason: string | null
}

/**
 * The checkbox on each side of the switch (VH-131). A staff video's box holds
 * what the user last chose for a staff video, locked only under None. A
 * student submission's is ticked and locked, because any closing it has is
 * Internal use only; under None the reason is None's, as on a staff video,
 * since there is then no closing to mark.
 */
export function internalCheckboxState(
  kind: VideoKind,
  type: ClosingType,
  staffChecked: boolean,
): InternalCheckboxState {
  const noClosing = internalDisabledReason(type)
  if (kind === 'submission') {
    return { checked: true, disabled: true, reason: noClosing ?? t().closing.internalForSubmission }
  }
  return { checked: staffChecked, disabled: noClosing !== null, reason: noClosing }
}

/**
 * Visible reasons: None is shared once; other locks retain their own
 * explanation (VH-144). Keyed to None itself, not to the colour's rule, so a
 * colour lock added for another type cannot hide the others' reasons
 * (VH-152).
 */
export function visibleClosingReasons(type: ClosingType, internalReason: string | null): {
  readonly shared: string | null
  readonly onset: string | null
  readonly internal: string | null
} {
  if (type === 'none') return { shared: t().closing.notUsedWith.none, onset: null, internal: null }
  return { shared: null, onset: onsetDisabledReason(type), internal: internalReason }
}
