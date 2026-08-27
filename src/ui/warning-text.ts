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

export interface WarningText {
  readonly heading: string
  readonly detail: string
}

const round = (value: number, places = 1): string =>
  Number.isFinite(value) ? value.toFixed(places) : '—'

export function warningText(warning: AudioWarning): WarningText {
  const detail = warning.detail
  switch (warning.code) {
    case 'no-audio':
      return {
        heading: 'This video has no sound',
        detail:
          'Branding will still be added and the video re-encoded, but there is no audio to even out. If you expected sound, check the recording before publishing.',
      }

    case 'clipping':
      return {
        heading: 'The sound may be distorted in places',
        detail:
          'The recording reaches its maximum level often enough that some of it may be clipped, which usually means the microphone input was set too high. Levels will still be evened out, but distortion already in the recording cannot be removed.',
      }

    case 'very-quiet':
      return {
        heading: 'This recording is very quiet',
        detail: `It measures about ${round(detail['integratedLufs'] ?? Number.NaN)} LUFS, well below a comfortable listening level. It will be brought up — but turning up quiet speech turns up whatever else was in the room too.`,
      }

    case 'highly-variable':
      return {
        heading: 'The volume varies a lot',
        detail: `The loudest and quietest parts differ by about ${round(detail['loudnessRangeLu'] ?? Number.NaN)} LU. Long-term changes will be evened out gradually, slowly enough not to be audible, but sudden differences between sentences will remain.`,
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
        detail: `It came out about ${round(detail['missedBy'] ?? Number.NaN)} LU away from the target. The video is fine to use; it may just sound slightly quieter or louder than other videos levelled with this tool.`,
      }
    case 'metadata-lost':
      return {
        heading: 'The file’s title and date could not be copied across',
        detail: 'The picture and sound are unaffected. If your original carried a title, author or date, the new file will not have them — you can still add them wherever you upload it.',
      }
    case 'onset-trimmed':
      return {
        heading: 'A moment of sound at the very start was removed',
        // Says what happened and what to do, not why the encoder needs it. The
        // number is tiny and the fix is entirely in the user's hands.
        detail: `About ${round(detail['milliseconds'] ?? Number.NaN, 0)} milliseconds had to come off the beginning to keep the sound in step with the picture, and there was something audible in it. The video is fine to use; if it starts mid-word, leave a moment of quiet before you begin next time.`,
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

  const section = document.createElement('section')
  section.className = 'warnings'

  const heading = document.createElement('h3')
  heading.className = 'warnings-heading'
  heading.textContent = options.heading
  // Named for assistive technology, like every other section on the page.
  // A landmark a screen reader announces as "section" and nothing else is
  // worse than no landmark at all.
  heading.id = `warnings-heading-${container.id || 'default'}`
  section.setAttribute('aria-labelledby', heading.id)
  section.append(heading)

  const list = document.createElement('ul')
  list.className = 'warning-list'
  for (const warning of warnings) {
    const { heading: title, detail } = warningText(warning)
    const item = document.createElement('li')
    item.className = 'warning'

    const strong = document.createElement('p')
    strong.className = 'warning-title'
    strong.textContent = title

    const body = document.createElement('p')
    body.className = 'warning-detail'
    body.textContent = detail

    item.append(strong, body)
    list.append(item)
  }
  section.append(list)

  // Advisory, always. Spec 5.4: none of these blocks anything, and saying so
  // is what stops a warning reading like a refusal.
  const reassurance = document.createElement('p')
  reassurance.className = 'warning-detail'
  reassurance.textContent =
    'None of these stop you continuing. Your original file is not changed either way.'
  section.append(reassurance)

  container.append(section)
}
