/**
 * Renders a {@link SourceReport} as something a lecturer can read.
 *
 * Two rules shape this file. Plain language, per spec section 9.2 — the reader
 * wants to know whether their video is going to be fine. And honesty about
 * what was not examined: Mediabunny cannot see subtitle or chapter tracks, so
 * this never says "no captions", only what it did find.
 *
 * On screen they are "captions" — the word staff and EchoVideo use (VH-86).
 * In code they stay `subtitle`, which is the ISOBMFF and WebVTT term.
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

export interface Row {
  readonly term: string
  readonly detail: string
  /** Advisory note shown beneath the value, for things worth knowing but not alarming. */
  readonly note?: string
}

/** Something in the source that will NOT be in the new file. */
export interface Loss {
  readonly title: string
  readonly detail: string
}

/**
 * What the new file will not carry, said before processing starts.
 *
 * Separate from {@link buildRows} because the two are shown differently, and
 * the difference is the point (VH-87): the facts sit in a disclosure that
 * starts closed, and a loss inside a closed disclosure is a loss nobody was
 * told about — the outcome `AGENTS.md` ranks worst. The rule that sorts a
 * sentence into one or the other: what will not be in the new file is a loss;
 * what merely describes the file is a fact.
 *
 * Exported for tests. Rendering needs a DOM and the suite runs in Node, but
 * the decisions worth protecting are all here.
 */
export function buildLosses(report: SourceReport): Loss[] {
  const losses: Loss[] = []

  // The output carries one video and one audio track, so anything beyond that
  // is content the user loses (review R-09). Finding out afterwards is too
  // late.
  const extraVideo = Math.max(0, report.videoTrackCount - 1)
  const extraAudio = Math.max(0, report.audioTrackCount - 1)
  if (extraVideo > 0 || extraAudio > 0) {
    const found: string[] = []
    if (extraVideo > 0) {
      found.push(extraVideo === 1 ? '1 more video track' : `${extraVideo} more video tracks`)
    }
    if (extraAudio > 0) {
      found.push(extraAudio === 1 ? '1 more sound track' : `${extraAudio} more sound tracks`)
    }
    losses.push({
      title: `This file has ${found.join(' and ')}`,
      detail:
        'The new file keeps one picture and one sound track — the ones listed under Video properties. The others will not be carried over, and one of them may hold an alternative, such as another language or an audio description. If you need them, keep the original alongside.',
    })
  }

  const { tracks } = report
  if (!tracks.scanned) {
    // Only for containers the handler scan cannot read. Saying "no captions"
    // about a file we never checked would be worse than admitting we did not.
    losses.push({
      title: 'Caption and chapter tracks could not be checked',
      detail:
        'This kind of file cannot be checked for them. If yours has them, they will not be carried over.',
    })
  } else {
    const found = embeddedTextTracks(tracks)
    if (found.length > 0) {
      losses.push({
        title: `Found ${found.join(' and ')}`,
        // It used to offer a caption file field as the way out; that field is
        // gone (VH-86). Keeping the original does not make the new file
        // accessible to its viewers, so the warning says what follows (spec
        // 8.3 step 3, A-14): the place it is published must supply captions.
        detail:
          'The new file will have no caption track, so wherever you publish it must supply captions. EchoVideo makes its own after upload — check them. A file sent directly needs captions added by you. Captions drawn into the picture stay. If you need the originals, keep this file alongside.',
      })
    }
  }

  return losses
}

/** e.g. `['1 caption track', '2 chapter tracks']`; empty when there are none. */
function embeddedTextTracks(tracks: SourceReport['tracks']): string[] {
  const found: string[] = []
  if (tracks.subtitleTracks > 0) {
    found.push(
      tracks.subtitleTracks === 1 ? '1 caption track' : `${tracks.subtitleTracks} caption tracks`,
    )
  }
  if (tracks.chapterTracks > 0) {
    found.push(tracks.chapterTracks === 1 ? '1 chapter track' : `${tracks.chapterTracks} chapter tracks`)
  }
  return found
}

/**
 * Turns a report into the "Video properties" rows, in the order they are
 * shown.
 *
 * Facts only. Anything the new file will not carry is {@link buildLosses}'s,
 * and the same track may appear in both: the Captions row here says what was
 * found, the loss says what happens to it.
 */
export function buildRows(report: SourceReport): Row[] {
  const { video, audio, tracks } = report

  const rateDetail = video.isVariableFrameRate
    ? `${formatFrameRate(video.frameRate.bestGuess)} on average, but it varies`
    : formatFrameRate(video.frameRate.bestGuess)

  const rateNotes: string[] = []
  if (video.isVariableFrameRate) {
    rateNotes.push(
      'Recordings from Teams, Zoom and screen capture often vary. The output will use a steady frame rate, which keeps sound and picture in step.',
    )
  }
  // Only worth raising when conforming would meaningfully change the frame
  // count — an NTSC source shifts by a tenth of a percent and nobody cares.
  if (Math.abs(video.conform.frameDeltaRatio) > 0.1) {
    rateNotes.push(
      `The output will run at ${formatFrameRate(video.conform.frameRate)}, so some frames will be repeated.`,
    )
  }

  const rows: Row[] = [
    { term: 'Duration', detail: formatDuration(report.durationSeconds) },
    {
      term: 'Video format',
      detail: formatCodec(video.codec),
      // The verdict below says what to do about it, in view (VH-60). This is
      // the fact behind that verdict, for whoever opens the list.
      ...(video.canDecode ? {} : { note: 'This browser cannot read this video format.' }),
    },
    { term: 'File size', detail: formatFileSize(report.fileSizeBytes) },
    {
      term: 'Resolution',
      detail: formatResolution(video.displayWidth, video.displayHeight),
      ...(video.rotation !== 0
        ? { note: `Rotated ${video.rotation}°. The output will be upright.` }
        : {}),
    },
    {
      term: 'Frame rate',
      detail: rateDetail,
      ...(rateNotes.length > 0 ? { note: rateNotes.join(' ') } : {}),
    },
  ]

  if (audio) {
    rows.push(
      {
        term: 'Sound format',
        detail: formatCodec(audio.codec),
        ...(audio.canDecode ? {} : { note: 'This browser cannot read this audio format.' }),
      },
      { term: 'Sound channels', detail: formatChannels(audio.channelCount) },
      {
        term: 'Sound sample rate',
        // The figure, with its meaning beside it (spec 9.2).
        detail: `${Math.round(audio.sampleRate / 100) / 10} kHz — ${audio.sampleRate.toLocaleString('en-GB')} samples a second`,
      },
    )
  } else {
    // One row, not three: a codec, a channel count and a sample rate of
    // nothing are three ways of saying the same absence.
    rows.push({
      term: 'Sound',
      detail: 'No sound track found',
      note: 'Levelling needs sound. The rest of the job still runs.',
    })
  }

  const found = tracks.scanned ? embeddedTextTracks(tracks) : []
  rows.push({
    term: 'Captions',
    detail: !tracks.scanned
      ? 'Could not be checked in this kind of file'
      : found.length > 0
        ? `Found ${found.join(' and ')}`
        : 'None found in this file',
  })

  rows.push({ term: 'File type', detail: report.container })
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

/**
 * Replaces `container`'s contents with the rendered report.
 *
 * Losses first and always in view; then the facts, in a native disclosure
 * that starts closed (VH-87). Rebuilt on every call, so a new file always
 * starts with it closed rather than inheriting the last file's state.
 */
export function renderSourceReport(container: HTMLElement, report: SourceReport): void {
  container.replaceChildren()

  const losses = buildLosses(report)
  if (losses.length > 0) {
    // The same component the sound warnings use: one visual language for
    // "worth knowing before you start", whichever part of the file it is about.
    const section = document.createElement('section')
    section.className = 'warnings'

    const heading = document.createElement('h3')
    heading.className = 'warnings-heading'
    heading.textContent = 'Not carried into the new file'
    // Named for assistive technology, as the sound warnings' section is.
    heading.id = 'source-losses-heading'
    section.setAttribute('aria-labelledby', heading.id)
    section.append(heading)

    const list = document.createElement('ul')
    list.className = 'warning-list'
    for (const loss of losses) {
      const item = document.createElement('li')
      item.className = 'warning'
      const title = document.createElement('p')
      title.className = 'warning-title'
      title.textContent = loss.title
      const detail = document.createElement('p')
      detail.className = 'warning-detail'
      detail.textContent = loss.detail
      item.append(title, detail)
      list.append(item)
    }
    section.append(list)
    container.append(section)
  }

  const disclosure = document.createElement('details')
  disclosure.className = 'disclosure'
  const summary = document.createElement('summary')
  summary.className = 'disclosure-summary'
  summary.textContent = 'Video properties'
  disclosure.append(summary)

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

  disclosure.append(list)
  container.append(disclosure)
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
