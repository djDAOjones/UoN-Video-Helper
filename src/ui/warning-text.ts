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
import { formatDuration } from './format'
import { notification } from './notification'

export interface WarningText {
  readonly heading: string
  readonly detail: string
}

export function warningText(warning: AudioWarning): WarningText {
  const detail = warning.detail
  switch (warning.code) {
    case 'no-audio':
      return {
        heading: 'This video has no sound',
        detail:
          'There is no sound to level, so the rest of the job runs without it. If you expected sound, check the recording before publishing.',
      }

    case 'clipping':
      return {
        heading: 'The sound may be distorted in places',
        detail:
          'The recording often reaches its maximum level, so some of it may be clipped. That usually means the microphone was set too high. Levelling still runs, but distortion already in the recording cannot be removed.',
      }

    case 'very-quiet':
      return {
        heading: 'This recording is very quiet',
        detail: 'It is well below a comfortable listening level. Levelling will bring it up — but turning up quiet speech turns up whatever else was in the room too.',
      }

    case 'highly-variable':
      return {
        heading: 'The volume varies a lot',
        detail: 'The loudest and quietest parts are far apart. Levelling corrects slow drifts gradually, too slowly to hear, but sudden differences between sentences will remain.',
      }

    case 'noisy':
      return {
        heading: 'There may be background noise',
        detail:
          'Even the quietest moments carry some sound — a fan, air conditioning, or a noisy room. This tool does not remove noise, and making the speech louder will make the background louder with it.',
      }

    case 'extended-silence':
      return {
        heading: 'There is a long silent stretch',
        detail: `About ${formatDuration(detail['seconds'] ?? 0)} of near-silence in one continuous run. If that is deliberate, nothing is wrong. If not, it is worth checking the recording before you publish it.`,
      }

    case 'target-missed':
      return {
        heading: 'The finished sound is not quite at the usual level',
        detail: 'The video is fine to use; it may just sound slightly quieter or louder than other videos levelled with this tool.',
      }
    case 'metadata-lost':
      return {
        heading: 'The file’s title and date could not be copied across',
        detail: 'The picture and sound are unaffected. If your original carried a title, author or date, the new file will not have them — you can still add them wherever you upload it.',
      }
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
      tail: ['None of these stop you continuing. Your original file is not changed either way.'],
    }),
  )
}
