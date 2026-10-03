/**
 * What a failure says: what happened, that the original is safe, and what to
 * do next — spec 9.2, once each (VH-110, U-06).
 *
 * The worker names the failure (`workers/failure.ts`) and, for an unreadable
 * file or a refused trim, why; this turns the name into words in the page's
 * language (VH-105). The reassurance is one sentence, said here and nowhere
 * else in the message, and the next step fits the cause: a recording that
 * cannot be levelled is not fixed by choosing a different file, and a device
 * that ran out of room is not fixed by trying again.
 *
 * Pure, so every sentence is tested in Node and read by the gate.
 */

import { t } from '../i18n'
import type { FailureCode, FailureReason } from '../workers/failure'
import { keptRangeProblemText } from './trim'

export interface FailureText {
  /** What happened. */
  readonly what: string
  /** What to do now. */
  readonly next: string
}

/** What an unreadable file's reason says happened. */
function unreadableWhat(reason: FailureReason | undefined): string {
  const { unreadable } = t().failure
  switch (reason) {
    case 'not-a-video':
      return unreadable.notAVideo
    case 'sound-only':
      return unreadable.soundOnly
    case 'no-tracks':
      return unreadable.noTracks
    case 'read-error':
      return unreadable.readError
    case 'took-too-long':
      return unreadable.tookTooLong
    default:
      return unreadable.what
  }
}

/**
 * The sentences for a failure.
 *
 * @param reason - Why, for the failures that carry one: an unreadable source
 *   or a trim that cannot be honoured.
 */
export function failureText(code: FailureCode, reason?: FailureReason): FailureText {
  const { failure } = t()
  switch (code) {
    case 'unreadable-source':
      return { what: unreadableWhat(reason), next: failure.unreadable.next }
    case 'bad-trim':
      return {
        what:
          reason === 'not-a-time' ||
          reason === 'start-after-end' ||
          reason === 'end-before-start' ||
          reason === 'too-short'
            ? keptRangeProblemText(reason)
            : failure.badTrim.what,
        next: failure.badTrim.next,
      }
    case 'unlevellable':
      return failure.unlevellable
    case 'output-loudness':
      return { what: failure.outputLoudness.what, next: failure.tryAgain }
    case 'output-peak':
      return { what: failure.outputPeak.what, next: failure.tryAgain }
    case 'output-unreadable':
      return { what: failure.outputUnreadable.what, next: failure.tryAgain }
    case 'out-of-space':
      return { what: failure.outOfSpace.what, next: failure.outOfSpace.next({ smaller: t().preset.labels.smaller }) }
    case 'encoder-refused':
      return failure.encoderRefused
    case 'check-failed':
      return failure.checkFailed
    case 'timed-out':
      return { what: failure.timedOut.what, next: failure.tryAgain }
    case 'unknown':
      return { what: failure.unknown.what, next: failure.tryAgain }
  }
}

/** The failure as one paragraph: what, the reassurance, what next. */
export function failureSentence(text: FailureText): string {
  return t().failure.sentence(text)
}

/** What the browser's support check found missing, as the load-time check reports it. */
export interface StartupFlags {
  readonly secureContext: boolean
  readonly webCodecs: boolean
  readonly h264: boolean
  readonly workingStore: boolean
  readonly workerStarted: boolean
}

/**
 * A start-up failure, said at Choose in words (U-06): what the tool cannot
 * do here and what to do about it, naming Chrome only where the browser is
 * the cause and the user is not already in it. `null` when nothing blocks.
 */
export function startupFailureText(
  flags: StartupFlags,
  context: { readonly chromeOnComputer: boolean },
): string | null {
  // The block panel's own sentences, so a start-up block and a file's block
  // name the remedy the same way (A-12).
  const { preflight, failure } = t()
  const remedy = context.chromeOnComputer ? preflight.chromeLacks : preflight.tryChrome
  if (!flags.secureContext) return failure.startup.insecure
  if (!flags.webCodecs) return failure.startup.noWebCodecs({ remedy })
  if (!flags.h264) return failure.startup.noH264({ remedy })
  if (!flags.workingStore) return failure.startup.noWorkingStore({ remedy })
  if (!flags.workerStarted) return failure.startup.workerNotStarted
  return null
}
