/**
 * Offsetting a WebVTT sidecar to match inserted branding.
 *
 * Spec section 8.1 is the one place the original brief contradicted itself:
 * it required captions be preserved unaltered, and it required an opening
 * animation. Both cannot hold literally — inserting five seconds at the head
 * shifts every subsequent frame, and a caption track that is not shifted with
 * it is five seconds early for the whole recording, which is worse than having
 * no captions at all. The spec resolves it as: never alter caption CONTENT,
 * always offset caption TIMING.
 *
 * This module takes that literally. It does not parse the file into cues and
 * write it back out — it rewrites the timestamps on `-->` lines and leaves
 * every other byte exactly as it found it. Identifiers, cue settings, styling
 * blocks, comments, blank lines and line endings survive untouched, because
 * they are never read in the first place. A parse-and-reserialise pass would
 * be tidier and would have far more ways to quietly change someone's words.
 */

/** `HH:MM:SS.mmm` or `MM:SS.mmm`, per the WebVTT grammar. */
const TIMESTAMP = /(?:(\d+):)?(\d{2}):(\d{2})\.(\d{3})/g

/** A line carrying a cue's timing, identified by the required `-->`. */
const TIMING_LINE = /^[^\r\n]*-->[^\r\n]*$/gm

export interface VttOffsetResult {
  readonly text: string
  /** Cues whose timing was shifted. */
  readonly cueCount: number
}

export class InvalidVttError extends Error {
  override readonly name = 'InvalidVttError'
}

function toSeconds(hours: string | undefined, minutes: string, seconds: string, millis: string): number {
  return (
    Number(hours ?? 0) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(millis) / 1000
  )
}

/** Always emits hours, which stays unambiguous once an offset pushes past 60 minutes. */
function format(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds)
  const millis = Math.round(clamped * 1000)
  const hours = Math.floor(millis / 3_600_000)
  const minutes = Math.floor((millis % 3_600_000) / 60_000)
  const seconds = Math.floor((millis % 60_000) / 1000)
  const remainder = millis % 1000
  const pad = (value: number, width = 2) => String(value).padStart(width, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(remainder, 3)}`
}

/**
 * Shifts every cue's timing by `offsetSeconds`.
 *
 * @param text - The sidecar file, as the user supplied it.
 * @param offsetSeconds - Usually the opening sequence's duration.
 * @throws {InvalidVttError} When the file does not begin with the WEBVTT
 *   signature, which is the one thing the format actually requires.
 */
export function offsetVtt(text: string, offsetSeconds: number): VttOffsetResult {
  // The signature may carry a BOM and may be followed by a description.
  // \uFEFF rather than a literal byte order mark, which is invisible in a diff.
  if (!/^\uFEFF?WEBVTT(\s|$)/.test(text)) {
    throw new InvalidVttError(
      'This does not look like a WebVTT subtitle file. It should begin with the word WEBVTT.',
    )
  }

  let cueCount = 0
  const result = text.replace(TIMING_LINE, (line) => {
    let replaced = 0
    const shifted = line.replace(TIMESTAMP, (match, hours, minutes, seconds, millis) => {
      // Only the two timestamps that make up the timing pair. Cue settings
      // follow on the same line and must not be touched.
      if (replaced >= 2) return match
      replaced++
      return format(toSeconds(hours as string | undefined, minutes as string, seconds as string, millis as string) + offsetSeconds)
    })
    if (replaced > 0) cueCount++
    return shifted
  })

  return { text: result, cueCount }
}

/**
 * Cue count without modifying anything, for reporting before processing.
 *
 * Counts only lines that carry an actual timestamp pair, matching what
 * {@link offsetVtt} will rewrite. The WebVTT grammar forbids `-->` inside cue
 * text, but a file that breaks that rule should be miscounted rather than
 * mangled, and both functions agreeing is what guarantees it.
 */
export function countCues(text: string): number {
  let count = 0
  for (const line of text.match(TIMING_LINE) ?? []) {
    TIMESTAMP.lastIndex = 0
    if (TIMESTAMP.test(line)) count++
  }
  TIMESTAMP.lastIndex = 0
  return count
}
