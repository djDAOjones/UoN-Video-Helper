/**
 * What the live regions say beyond what the screen already shows (VH-111,
 * U-10, A-14).
 *
 * Caption loss, the sound notes, a closing that did not land as chosen and
 * the output warnings were on screen only: the read announcement said "Video
 * read. …" and nothing about what would not be carried over. These build the
 * spoken half of each announcement — `setStatus`'s `spokenOnly` — so the
 * visible line stays short and a screen-reader user hears what a sighted one
 * sees in the panels beside it.
 *
 * Pure, so every sentence is tested in Node and read by the gate.
 */

import type { AudioWarning } from '../audio/warnings'
import type { Loss } from './source-panel'
import { warningText } from './warning-text'

/** "One thing" / "Two things": counted in words, as the verdict heading is. */
function countThings(count: number): string {
  const words = ['One thing', 'Two things', 'Three things', 'Four things']
  return words[count - 1] ?? `${count} things`
}

/**
 * The losses a read file will suffer, said with their consequences — the
 * caption one included (A-14). Empty when nothing is lost.
 */
export function lossesSpoken(losses: readonly Loss[]): string {
  if (losses.length === 0) return ''
  // Counted, not asserted: one of them can be a file that could not be
  // checked, which is not a loss anyone knows of (Codex review).
  return [
    `${countThings(losses.length)} to know about what goes into the new file.`,
    ...losses.map((loss) => `${loss.title}. ${loss.detail}`),
  ].join(' ')
}

/**
 * Warnings under their panel heading: each one's title, which says the
 * thing; its detail sits in the panel for whoever wants it. Empty when there
 * are none.
 */
export function warningsSpoken(heading: string, warnings: readonly AudioWarning[]): string {
  if (warnings.length === 0) return ''
  return `${heading}: ${warnings.map((warning) => warningText(warning).heading).join('; ')}.`
}

/** Joins the parts of a spoken announcement that have something to say. */
export function spoken(...parts: readonly (string | null)[]): string {
  return parts.filter((part): part is string => part !== null && part.length > 0).join(' ')
}
