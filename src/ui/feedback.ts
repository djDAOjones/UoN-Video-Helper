/**
 * The feedback email: what goes in it, and how it becomes a `mailto:` link
 * (VH-93).
 *
 * The app is static files, so it cannot send mail, and "no media egress"
 * forbids a request carrying media characteristics anyway. So the user's own
 * email app sends it: they see every word before it goes, and send it as
 * themselves. Nothing here makes a request.
 *
 * This is the diagnostics bundle's first production reader, so it has its own
 * redaction profile, deliberately narrower than the bundle's: it starts from
 * the already-redacted bundle (`core/redact.ts` has removed filenames, paths,
 * titles and caption text) and then keeps only a short list of named facts.
 * Nothing it does not name gets through. Over-redaction is the safe direction.
 *
 * Pure, so what a report contains is tested in Node.
 */

import type { DiagnosticsBundle } from '../core/diagnostics'
import { REDACTED } from '../core/redact'
import {
  FEEDBACK_LOG_LINE_MAX_CHARACTERS,
  FEEDBACK_RECENT_LOG_LINES,
} from '../config/feedback'

type Loose = Record<string, unknown> | undefined

const record = (value: unknown): Loose =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
const text = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined
const number = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined

/**
 * A browser and platform in a few words, from a user-agent string.
 *
 * The full string is long and fingerprint-shaped; a report needs only which
 * engine, which major version, and which system.
 */
export function describeBrowser(userAgent: string): string {
  const version = (pattern: RegExp) => pattern.exec(userAgent)?.[1]
  const browser = version(/Edg\/(\d+)/)
    ? `Edge ${version(/Edg\/(\d+)/)}`
    : version(/Firefox\/(\d+)/)
      ? `Firefox ${version(/Firefox\/(\d+)/)}`
      : version(/Chrome\/(\d+)/)
        ? `Chrome ${version(/Chrome\/(\d+)/)}`
        : version(/Version\/(\d+)[^ ]* .*Safari/)
          ? `Safari ${version(/Version\/(\d+)[^ ]* .*Safari/)}`
          : 'an unrecognised browser'
  const system = /iPhone|iPad/.test(userAgent)
    ? 'iOS'
    : /Android/.test(userAgent)
      ? 'Android'
      : /CrOS/.test(userAgent)
        ? 'ChromeOS'
        : /Mac OS X|Macintosh/.test(userAgent)
          ? 'macOS'
          : /Windows/.test(userAgent)
            ? 'Windows'
            : /Linux/.test(userAgent)
              ? 'Linux'
              : 'an unrecognised system'
  return `${browser} on ${system}`
}

function clip(line: string): string {
  return line.length > FEEDBACK_LOG_LINE_MAX_CHARACTERS
    ? `${line.slice(0, FEEDBACK_LOG_LINE_MAX_CHARACTERS - 1)}…`
    : line
}

/**
 * Removes the chosen file's name from a line, whole or without its extension.
 *
 * `redact()` catches a path or a string ending `.mp4`, but not a name inside a
 * sentence. The logs never carry one by rule; this is the check that does not
 * depend on the rule being kept. A stem shorter than four characters is left,
 * since removing "a" from every line would destroy the report.
 */
function withoutFileNames(line: string, fileNames: readonly string[]): string {
  const needles = fileNames
    .flatMap((name) => [name, name.replace(/\.[^.]*$/, '')])
    .filter((needle) => needle.length >= 4)
  let out = line
  for (const needle of needles) {
    // Case-insensitive, because an error message may have changed the case.
    out = out.replace(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), REDACTED)
  }
  return out
}

/**
 * The details that go with a message, one fact per line.
 *
 * Only these facts, by name: the build; the browser in a few words; how far
 * the user got; the choices they made; the device check's outcome and reason
 * codes; what the video is (length, size, frame rate, codecs — never which
 * video); the last errors; the most recent log lines, already redacted.
 *
 * @param bundle - The redacted diagnostics bundle. Its user agent is itself
 *   redacted (it contains slashes), so the browser arrives separately.
 * @param options.browser - {@link describeBrowser}'s few words.
 * @param options.fileNames - The names of files the user has chosen, removed
 *   from every line wherever they appear.
 */
export function feedbackDetails(
  bundle: DiagnosticsBundle,
  options: { readonly browser: string; readonly fileNames: readonly string[] },
): string[] {
  const lines = [`App: ${bundle.buildId}`, `Browser: ${options.browser}`]

  const context = record(bundle.context)
  lines.push(`Stage: ${text(context?.['stage']) ?? 'unknown'}`)

  const job = record(context?.['job'])
  if (job) {
    const parts = [text(job['presetId']) && `output ${text(job['presetId'])}`]
    const type = text(job['closingType'])
    if (type) {
      const onset = text(job['closingOnset'])
      const colour = text(job['closingColour'])
      parts.push(`closing ${[type, onset, colour].filter(Boolean).join(' ')}`)
    }
    lines.push(`Choices: ${parts.filter(Boolean).join(', ')}`)
  }

  const capability = record(context?.['capability'])
  const verdict = record(capability?.['verdict'])
  if (verdict) {
    const reasons = Array.isArray(verdict['reasons'])
      ? verdict['reasons'].map((reason) => text(record(reason)?.['code'])).filter(Boolean)
      : []
    const picture = text(capability?.['contentClass'])
    lines.push(
      `Device check: ${text(verdict['outcome']) ?? 'unknown'}` +
        (reasons.length > 0 ? ` (${reasons.join(', ')})` : '') +
        (picture && picture !== 'unknown' ? `, picture ${picture}` : ''),
    )
  }

  const source = record(context?.['source'])
  const video = record(source?.['video'])
  if (video) {
    const seconds = number(source?.['durationSeconds'])
    const width = number(video['displayWidth'])
    const height = number(video['displayHeight'])
    const rate = number(record(video['frameRate'])?.['bestGuess'])
    const facts = [
      seconds !== undefined && `${Math.round(seconds)} s`,
      width !== undefined && height !== undefined && `${width}x${height}`,
      rate !== undefined && `${Math.round(rate * 100) / 100} fps`,
      video['isVariableFrameRate'] === true && 'variable frame rate',
      text(video['codec']),
      text(source?.['container']),
    ]
    lines.push(`Video: ${facts.filter(Boolean).join(', ')}`)
    const audio = record(source?.['audio'])
    const channels = number(audio?.['channelCount'])
    const sampleRate = number(audio?.['sampleRate'])
    lines.push(
      audio
        ? `Audio: ${[text(audio['codec']), channels !== undefined && `${channels} ch`, sampleRate !== undefined && `${sampleRate} Hz`].filter(Boolean).join(', ')}`
        : 'Audio: none',
    )
  }

  for (const error of bundle.errors.slice(-2)) {
    const captured = record(error)
    lines.push(
      clip(`Error (${text(captured?.['thread']) ?? '?'}): ${text(captured?.['message']) ?? 'no message'}`),
    )
  }

  const recent = bundle.logs.slice(-FEEDBACK_RECENT_LOG_LINES)
  if (recent.length > 0) {
    lines.push('Recent log:')
    for (const entry of recent) {
      const logged = record(entry)
      const data = logged?.['data'] === undefined ? '' : ` ${JSON.stringify(logged['data'])}`
      lines.push(
        clip(`  ${text(logged?.['level']) ?? ''} ${text(logged?.['scope']) ?? ''}: ${text(logged?.['message']) ?? ''}${data}`),
      )
    }
  }
  return lines.map((line) => withoutFileNames(line, options.fileNames))
}

/** The message and its details as one piece of text, for the clipboard. */
export function feedbackText(message: string, details: readonly string[]): string {
  return `${message.trim()}\n\n--- Details from the app ---\n${details.join('\n')}\n`
}

/**
 * A `mailto:` link no longer than `maxCharacters`, or none.
 *
 * The details are dropped from the end — recent log lines first — until the
 * link fits. The user's own words are never cut: if they alone are too long,
 * there is no link, because a mail client that cuts a long link cuts the
 * message with it. The copy route carries everything instead.
 *
 * @returns `url` null when even the message alone does not fit; and how many
 *   of `details`, from the start, the link carries — which is what the dialog
 *   must show as sent.
 */
export function feedbackMailto(options: {
  readonly address: string
  readonly subject: string
  readonly message: string
  readonly details: readonly string[]
  readonly maxCharacters: number
}): { readonly url: string | null; readonly keptDetails: number } {
  // RFC 6068 §5: a line break in a mailto body is CRLF.
  const body = (details: readonly string[]) =>
    (details.length > 0 ? feedbackText(options.message, details) : `${options.message.trim()}\n`)
      .replace(/\r?\n/g, '\r\n')
  const build = (details: readonly string[]) =>
    `mailto:${options.address}?subject=${encodeURIComponent(options.subject)}` +
    `&body=${encodeURIComponent(body(details))}`

  for (let count = options.details.length; count >= 0; count--) {
    const first = options.details.slice(0, count)
    // A heading with nothing under it says nothing.
    const kept = first.at(-1) === 'Recent log:' ? first.slice(0, -1) : first
    const url = build(kept)
    if (url.length <= options.maxCharacters) return { url, keptDetails: kept.length }
  }
  return { url: null, keptDetails: 0 }
}

/**
 * What the dialog shows as sent: the lines the link carries, then any it could
 * not, marked as travelling only in the copy. The user reviews what the email
 * will actually contain, not a longer list than it has.
 */
export function feedbackDisclosure(details: readonly string[], keptDetails: number): string {
  const sent = details.slice(0, keptDetails)
  const left = details.slice(keptDetails)
  if (left.length === 0) return sent.join('\n')
  return [
    ...sent,
    ...(sent.length > 0 ? [''] : []),
    'Too long for the email, so only in "Copy message and details":',
    ...left,
  ].join('\n')
}
