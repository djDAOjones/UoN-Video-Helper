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
import { DECODE_DAMAGE } from '../config/audio'
import { t } from '../i18n'
import type { Shortfall } from '../media/ends-early'
import { formatClockTime, formatDuration } from './format'
import { notification } from './notification'

export interface WarningText {
  readonly heading: string
  readonly detail: string
}

/**
 * Decode damage's times, as the trim's fields show a time (VH-122): each
 * floored, so seeking to it lands just before the damage rather than after,
 * a time said once however many stretches share its second, and past
 * {@link DECODE_DAMAGE}'s limit the rest counted instead of listed.
 */
export function damageTimes(atSeconds: readonly number[]): string[] {
  const times = [...new Set(atSeconds.map((seconds) => formatClockTime(Math.floor(seconds))))]
  const listed = times.slice(0, DECODE_DAMAGE.timesSaid)
  const rest = times.length - listed.length
  return rest > 0 ? [...listed, t().warnings.decodeDamage.more({ count: rest })] : listed
}

/**
 * Where a track stops and where it should have reached, as the trim's fields
 * show a time (VH-139): the stop floored, as decode damage's times are, so
 * seeking to it lands while there is still something to see or hear; the end
 * to the nearest second, as the read file's length is said.
 */
export function shortfallTimes(short: Shortfall): { readonly stops: string; readonly end: string } {
  return {
    stops: formatClockTime(Math.floor(short.stopsAtSeconds)),
    end: formatClockTime(short.endSeconds),
  }
}

export function warningText(warning: AudioWarning): WarningText {
  const { warnings } = t()
  switch (warning.code) {
    case 'cut-short':
      return warnings.cutShort
    case 'ends-early':
      return {
        heading: warnings.endsEarly.heading,
        detail: warnings.endsEarly.detail(
          shortfallTimes({
            stopsAtSeconds: warning.detail['stopsAtSeconds'] ?? 0,
            endSeconds: warning.detail['endSeconds'] ?? 0,
          }),
        ),
      }
    case 'no-audio':
      // The cause, and so the way forward: keep more, or check the recording (VH-206).
      return warning.reason === 'kept-too-little' ? warnings.keptTooLittleAudio : warnings.noAudio
    case 'decode-damage': {
      const count = warning.atSeconds?.length ?? 0
      return {
        heading: warnings.decodeDamage.heading({ count }),
        detail: warnings.decodeDamage.detail({
          count,
          times: damageTimes(warning.atSeconds ?? []),
        }),
      }
    }
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
    case 'heavy-limiting':
      return warnings.heavyLimiting
  }
}

/**
 * Renders warnings into `container`. Nothing is rendered when there are none.
 *
 * @param options.reassure - Whether to end on "None of these stop you
 *   continuing". True before Create; false under a finished video, where
 *   there is nothing left to continue (VH-150).
 */
export function renderWarnings(
  container: HTMLElement,
  warnings: readonly AudioWarning[],
  options: { readonly heading: string; readonly reassure?: boolean },
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
      ...(options.reassure === false ? {} : { tail: [t().warnings.reassurance] }),
    }),
  )
}
