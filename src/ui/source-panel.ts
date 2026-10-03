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

import { locale, t } from '../i18n'
import { listFormatter } from '../i18n/intl'
import type { SourceReport } from '../media/inspect'
import type { FailureText } from './failure-text'
import { notification } from './notification'
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
  const { source } = t()

  // The output carries one video and one audio track, so anything beyond that
  // is content the user loses (review R-09). Finding out afterwards is too
  // late.
  const extraVideo = Math.max(0, report.videoTrackCount - 1)
  const extraAudio = Math.max(0, report.audioTrackCount - 1)
  if (extraVideo > 0 || extraAudio > 0) {
    const found: string[] = []
    if (extraVideo > 0) found.push(source.moreVideoTracks({ count: extraVideo }))
    if (extraAudio > 0) found.push(source.moreSoundTracks({ count: extraAudio }))
    losses.push({
      title: source.losses.extraTracksTitle({ found }),
      detail: source.losses.extraTracksDetail,
    })
  }

  const { tracks } = report
  if (!tracks.scanned) {
    // Only for containers the handler scan cannot read. Saying "no captions"
    // about a file we never checked would be worse than admitting we did not.
    losses.push({ title: source.losses.uncheckedTitle, detail: source.losses.uncheckedDetail })
  } else {
    const found = embeddedTextTracks(tracks)
    if (found.length > 0) {
      // It used to offer a caption file field as the way out; that field is
      // gone (VH-86). Keeping the original does not make the new file
      // accessible to its viewers, so the warning says what follows (spec
      // 8.3 step 3, A-14): the place it is published must supply captions.
      // Each kind of track found is named with its own consequence — a
      // chapter track found alone was told only about captions (Codex review
      // of VH-114).
      const consequences: string[] = []
      if (tracks.subtitleTracks > 0) consequences.push(source.losses.captionsConsequence)
      if (tracks.chapterTracks > 0) consequences.push(source.losses.chaptersConsequence)
      consequences.push(source.losses.keepOriginals)
      losses.push({ title: source.captionsFound({ found }), detail: consequences.join(' ') })
    }
  }

  return losses
}

/** e.g. `['1 caption track', '2 chapter tracks']`; empty when there are none. */
function embeddedTextTracks(tracks: SourceReport['tracks']): string[] {
  const found: string[] = []
  if (tracks.subtitleTracks > 0) found.push(t().source.captionTracks({ count: tracks.subtitleTracks }))
  if (tracks.chapterTracks > 0) found.push(t().source.chapterTracks({ count: tracks.chapterTracks }))
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
  const { source } = t()

  const rateDetail = video.isVariableFrameRate
    ? source.variesOnAverage({ rate: formatFrameRate(video.frameRate.bestGuess) })
    : formatFrameRate(video.frameRate.bestGuess)

  const rateNotes: string[] = []
  if (video.isVariableFrameRate) rateNotes.push(source.variesNote)
  // Only worth raising when conforming would meaningfully change the frame
  // count — an NTSC source shifts by a tenth of a percent and nobody cares.
  if (Math.abs(video.conform.frameDeltaRatio) > 0.1) {
    rateNotes.push(source.outputRate({ rate: formatFrameRate(video.conform.frameRate) }))
  }

  const rows: Row[] = [
    { term: source.rows.duration, detail: formatDuration(report.durationSeconds) },
    {
      term: source.rows.videoFormat,
      detail: formatCodec(video.codec),
      // The verdict below says what to do about it, in view (VH-60). This is
      // the fact behind that verdict, for whoever opens the list.
      ...(video.canDecode ? {} : { note: source.cannotDecodeVideo }),
    },
    { term: source.rows.fileSize, detail: formatFileSize(report.fileSizeBytes) },
    {
      term: source.rows.resolution,
      detail: formatResolution(video.displayWidth, video.displayHeight),
      ...(video.rotation !== 0 ? { note: source.rotated({ degrees: video.rotation }) } : {}),
    },
    {
      term: source.rows.frameRate,
      detail: rateDetail,
      ...(rateNotes.length > 0 ? { note: rateNotes.join(' ') } : {}),
    },
  ]

  if (audio) {
    rows.push(
      {
        term: source.rows.soundFormat,
        detail: formatCodec(audio.codec),
        ...(audio.canDecode ? {} : { note: source.cannotDecodeAudio }),
      },
      { term: source.rows.soundChannels, detail: formatChannels(audio.channelCount) },
      {
        term: source.rows.sampleRate,
        // The figure, with its meaning beside it (spec 9.2).
        detail: source.sampleRate({
          kilohertz: Math.round(audio.sampleRate / 100) / 10,
          hertz: audio.sampleRate,
        }),
      },
    )
  } else {
    // One row, not three: a codec, a channel count and a sample rate of
    // nothing are three ways of saying the same absence.
    rows.push({ term: source.rows.sound, detail: source.noSoundTrack, note: source.noSoundNote })
  }

  const found = tracks.scanned ? embeddedTextTracks(tracks) : []
  rows.push({
    term: source.rows.captions,
    detail: !tracks.scanned
      ? source.captionsUnchecked
      : found.length > 0
        ? source.captionsFound({ found })
        : source.captionsNone,
  })

  rows.push({ term: source.rows.fileType, detail: report.container })
  return rows
}

/** A one-line summary suitable for announcing into a live region. */
export function summarise(report: SourceReport): string {
  const { source } = t()
  const parts = [
    formatDuration(report.durationSeconds),
    formatResolution(report.video.displayWidth, report.video.displayHeight),
  ]
  if (report.video.isVariableFrameRate) parts.push(source.variableFrameRate)
  parts.push(
    report.audio ? formatChannels(report.audio.channelCount).toLocaleLowerCase(locale()) : source.noSound,
  )
  return source.readSummary({ parts })
}

/**
 * Replaces `container`'s contents with the rendered report.
 *
 * Losses first and always in view; then the facts, in a native disclosure
 * that starts closed (VH-87). Rebuilt on every call, so a new file always
 * starts with it closed rather than inheriting the last file's state — a
 * repaint for a change of language passes `open` to keep it as it was.
 */
export function renderSourceReport(
  container: HTMLElement,
  report: SourceReport,
  options: { readonly open?: boolean } = {},
): void {
  container.replaceChildren()

  const losses = buildLosses(report)
  if (losses.length > 0) {
    // The same component the sound warnings use: one visual language for
    // "worth knowing before you start", whichever part of the file it is about.
    container.append(notification({ kind: 'warning', title: t().source.lossesTitle, items: losses }))
  }

  const disclosure = document.createElement('details')
  disclosure.className = 'disclosure'
  disclosure.open = options.open ?? false
  const summary = document.createElement('summary')
  summary.className = 'disclosure-summary'
  summary.textContent = t().source.properties
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

/**
 * Replaces `container`'s contents with a readable failure: what happened,
 * then that the original is safe and what to do next — once each (VH-110,
 * spec 9.2). The sentences are `ui/failure-text.ts`'s, so the next step fits
 * the cause rather than always being "choose a different one".
 *
 * @returns The notification, so focus can be handed to it (VH-111).
 */
export function renderSourceError(container: HTMLElement, text: FailureText): HTMLElement {
  container.replaceChildren()
  const failure = notification({
    kind: 'error',
    title: text.what,
    lines: [`${t().failure.originalUnchanged} ${text.next}`],
  })
  container.append(failure)
  return failure
}

/** A noun list as the language joins it, for the callers that need one outside a table. */
export const joinNouns = (items: readonly string[]): string => listFormatter(locale())(items)
