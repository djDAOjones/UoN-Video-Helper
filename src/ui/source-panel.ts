/**
 * Renders a {@link SourceReport} as something a lecturer can read.
 *
 * Two rules shape this file. Plain language, per spec section 9.2 — the reader
 * wants to know whether their video is going to be fine. And honesty about
 * what was not examined: Mediabunny cannot see subtitle or chapter tracks, so
 * this never says "no subtitles", only what it did find.
 */

import type { SourceReport } from '../media/inspect'
import {
  formatChannels,
  formatCodec,
  formatDuration,
  formatFileSize,
  formatFrameRate,
  formatResolution,
} from './format'

interface Row {
  readonly term: string
  readonly detail: string
  /** Advisory note shown beneath the value, for things worth knowing but not alarming. */
  readonly note?: string
}

export interface AdditionalTrackWarning {
  readonly detail: string
  readonly note: string
}

/** Describes file-level details that cannot be promised in the new container. */
export function describeMetadataRisk(readable: boolean): AdditionalTrackWarning | null {
  if (readable) return null
  return {
    detail: 'Some file details could not be read',
    note: 'Creation, title or other file details may not be carried into the new video. Keep the original alongside if those details matter.',
  }
}

/**
 * Describes A/V tracks that cannot be carried into the one-way output.
 *
 * The app deliberately does not expose track selection. It therefore has to
 * say before Start when Mediabunny selected one primary track from several.
 */
export function describeAdditionalTracks(
  videoTrackCount: number,
  audioTrackCount: number,
): AdditionalTrackWarning | null {
  const found: string[] = []
  if (videoTrackCount > 1) {
    found.push(`${videoTrackCount} picture tracks`)
  }
  if (audioTrackCount > 1) {
    found.push(`${audioTrackCount} sound tracks`)
  }
  if (found.length === 0) return null
  const selectedDescription =
    videoTrackCount > 1 && audioTrackCount > 1
      ? 'main picture and main sound'
      : videoTrackCount > 1
        ? 'main picture'
        : 'main sound'

  return {
    detail: `Found ${found.join(' and ')}`,
    note: `Only the ${selectedDescription} described above will be used. The other tracks cannot be carried into the new file. Check that the summary matches what you expect before continuing.`,
  }
}

function buildRows(report: SourceReport): Row[] {
  const rows: Row[] = [
    { term: 'Length', detail: formatDuration(report.durationSeconds) },
    { term: 'File size', detail: formatFileSize(report.fileSizeBytes) },
  ]

  const { video, audio } = report

  {
    rows.push({
      term: 'Picture',
      detail: `${formatResolution(video.displayWidth, video.displayHeight)}, ${formatCodec(video.codec)}`,
      ...(video.rotation !== 0
        ? { note: `Rotated ${video.rotation}°. The output will be upright.` }
        : {}),
    })

    const rateDetail = video.isVariableFrameRate
      ? `${formatFrameRate(video.frameRate.bestGuess)} on average, but it varies`
      : formatFrameRate(video.frameRate.bestGuess)

    const notes: string[] = []
    if (video.isVariableFrameRate) {
      notes.push(
        'Recordings from Teams, Zoom and screen capture often vary. The output will use a steady frame rate, which keeps sound and picture in step.',
      )
    }
    // Only worth raising when conforming would meaningfully change the frame
    // count — an NTSC source shifts by a tenth of a percent and nobody cares.
    if (Math.abs(video.conform.frameDeltaRatio) > 0.1) {
      notes.push(
        `The output will run at ${formatFrameRate(video.conform.frameRate)}, so some frames will be repeated.`,
      )
    }
    rows.push({
      term: 'Frame rate',
      detail: rateDetail,
      ...(notes.length > 0 ? { note: notes.join(' ') } : {}),
    })

    if (!video.canDecode) {
      rows.push({
        term: 'Picture support',
        detail: 'This browser cannot read this video format',
        note: 'Full guidance on what to do arrives with the pre-flight checks.',
      })
    }
  }

  if (audio) {
    rows.push({
      term: 'Sound',
      detail: `${formatChannels(audio.channelCount)}, ${formatCodec(audio.codec)}, ${Math.round(audio.sampleRate / 100) / 10} kHz`,
    })
    if (!audio.canDecode) {
      rows.push({
        term: 'Sound support',
        detail: 'This browser cannot read this audio format',
      })
    }
  } else {
    rows.push({
      term: 'Sound',
      detail: 'No audio track found',
      note: 'Levelling needs sound. Branding and re-encoding will still work.',
    })
  }

  const additionalTracks = describeAdditionalTracks(report.videoTrackCount, report.audioTrackCount)
  if (additionalTracks) {
    rows.push({ term: 'Additional tracks', ...additionalTracks })
  }

  const metadataRisk = describeMetadataRisk(report.metadata.readable)
  if (metadataRisk) rows.push({ term: 'File details', ...metadataRisk })

  const { tracks } = report
  if (tracks.scanned) {
    const found: string[] = []
    if (tracks.subtitleTracks > 0) {
      found.push(
        tracks.subtitleTracks === 1
          ? '1 subtitle track'
          : `${tracks.subtitleTracks} subtitle tracks`,
      )
    }
    if (tracks.chapterTracks > 0) {
      found.push(
        tracks.chapterTracks === 1 ? '1 chapter track' : `${tracks.chapterTracks} chapter tracks`,
      )
    }

    rows.push(
      found.length > 0
        ? {
            term: 'Subtitles',
            detail: `Found ${found.join(' and ')}`,
            // Said before processing, not after: this is the one thing that
            // cannot be carried over, and finding out afterwards is too late.
            note: 'These cannot be carried into the new file. If you need them, keep the original alongside, or add a subtitle file below and it will be timed to match.',
          }
        : { term: 'Subtitles', detail: 'None found in this file' },
    )
  }

  rows.push({ term: 'Container', detail: report.container })
  return rows
}

/** A one-line summary suitable for announcing into a live region. */
export function summarise(report: SourceReport): string {
  const parts = [
    formatDuration(report.durationSeconds),
    formatResolution(report.video.displayWidth, report.video.displayHeight),
  ]
  if (report.video.isVariableFrameRate) parts.push('variable frame rate')
  parts.push(report.audio ? formatChannels(report.audio.channelCount).toLowerCase() : 'no sound')
  return `Video read. ${parts.join(', ')}.`
}

/** Replaces `container`'s contents with the rendered report. */
export function renderSourceReport(container: HTMLElement, report: SourceReport): void {
  container.replaceChildren()

  const list = document.createElement('dl')
  list.className = 'facts'

  for (const row of buildRows(report)) {
    const term = document.createElement('dt')
    term.textContent = row.term

    const detail = document.createElement('dd')
    detail.textContent = row.detail

    if (row.note) {
      const note = document.createElement('span')
      note.className = 'fact-note'
      note.textContent = row.note
      detail.append(note)
    }

    list.append(term, detail)
  }

  container.append(list)

  // Only for containers the handler scan cannot read. Saying "no subtitles"
  // about a file we never checked would be worse than admitting we did not.
  if (!report.tracks.scanned) {
    const caveat = document.createElement('p')
    caveat.className = 'fact-caveat'
    caveat.textContent =
      'Subtitle and chapter tracks could not be checked in this kind of file. If yours has them, they will not be carried over.'
    container.append(caveat)
  }
}

/** Replaces `container`'s contents with a readable failure. */
export function renderSourceError(container: HTMLElement, message: string): void {
  container.replaceChildren()
  const paragraph = document.createElement('p')
  paragraph.className = 'fact-error'
  paragraph.textContent = message
  const reassurance = document.createElement('span')
  reassurance.className = 'fact-note'
  reassurance.textContent =
    'Your original file has not been changed. You can choose a different one.'
  paragraph.append(reassurance)
  container.append(paragraph)
}
