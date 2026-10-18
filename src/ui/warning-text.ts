/**
 * The spec 5.4 warnings, in words.
 *
 * Kept apart from detection so the thresholds can live with the numbers and
 * the sentences can be reviewed as writing. Three rules shape all of them:
 *
 *  - Phrased as possibilities. "May be distorted", not "is distorted". These
 *    are heuristics on a heuristic, and the reader knows their own recording
 *    better than we do.
 *  - Say what happens next. A warning that leaves someone unsure whether to
 *    carry on has cost them more than it saved.
 *  - Never imply blame. The person reading this recorded a lecture, not a
 *    studio album.
 */

import type { AudioWarning } from '../audio/warnings'
import { t } from '../i18n'
import { formatDuration } from './format'
import { notification } from './notification'

export interface WarningText {
  readonly heading: string
  readonly detail: string
}

export function warningText(warning: AudioWarning): WarningText {
  const { warnings } = t()
  switch (warning.code) {
    case 'no-audio':
      return warnings.noAudio
    case 'clipping':
      return warnings.clipping
    case 'very-quiet':
      return warnings.veryQuiet
    case 'highly-variable':
      return warnings.highlyVariable
    case 'noisy':
      return warnings.noisy
    case 'extended-silence':
      return {
        heading: warnings.extendedSilence.heading,
        detail: warnings.extendedSilence.detail({
          duration: formatDuration(warning.detail['seconds'] ?? 0),
        }),
      }
    case 'target-missed':
      return warnings.targetMissed
    case 'metadata-lost':
      return warnings.metadataLost
  }
}

/** Renders warnings into `container`. Nothing is rendered when there are none. */
export function renderWarnings(
  container: HTMLElement,
  warnings: readonly AudioWarning[],
  options: { readonly heading: string },
): void {
  container.replaceChildren()
  if (warnings.length === 0) return
  container.append(
    notification({
      kind: 'warning',
      title: options.heading,
      items: warnings.map((warning) => {
        const { heading, detail } = warningText(warning)
        return { title: heading, detail }
      }),
      // Advisory, always. Spec 5.4: none of these blocks anything, and
      // saying so is what stops a warning reading like a refusal.
      tail: [t().warnings.reassurance],
    }),
  )
}
