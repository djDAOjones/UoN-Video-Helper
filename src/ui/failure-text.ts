/**
 * What a failure says: what happened, that the original is safe, and what to
 * do next — spec 9.2, once each (VH-110, U-06).
 *
 * The worker names the failure (`workers/failure.ts`); this turns the name
 * into words. The reassurance is one sentence, said here and nowhere else in
 * the message, and the next step fits the cause: a recording that cannot be
 * levelled is not fixed by choosing a different file, and a device that ran
 * out of room is not fixed by trying again.
 *
 * Pure, so every sentence is tested in Node and read by the gate.
 */

import { PRESETS } from '../config/presets'
import type { FailureCode } from '../workers/failure'

export interface FailureText {
  /** What happened. */
  readonly what: string
  /** What to do now. */
  readonly next: string
}

/** Said once in every failure, between what happened and what to do. */
export const ORIGINAL_UNCHANGED = 'Your original file has not been changed.'

const REPORT_IT = 'If it happens again, report it with the Send feedback button — the details it adds will help.'

/**
 * The sentences for a failure.
 *
 * @param message - The worker's own sentence for the failures that carry one:
 *   an unreadable source or a trim that cannot be honoured.
 */
export function failureText(code: FailureCode, message?: string): FailureText {
  switch (code) {
    case 'unreadable-source':
      return {
        what: message ?? 'This file could not be read as a video.',
        next: 'Choose a different file, or export this one again as an MP4 — a file whose name ends .mp4.',
      }
    case 'bad-trim':
      return {
        what: message ?? 'The start and end times could not be used.',
        next: 'Put the start and end times right in step 2 and try again.',
      }
    case 'unlevellable':
      return {
        what: 'The sound of this recording cannot be brought to the usual level, so the video was not made.',
        next: 'Report it with the Send feedback button — the details it adds will help.',
      }
    case 'output-loudness':
      return {
        what: 'The finished sound did not come out at the usual level, so the video was not kept.',
        next: `Try again. ${REPORT_IT}`,
      }
    case 'output-peak':
      return {
        what: 'The finished sound came out louder at its peaks than allowed, so the video was not kept.',
        next: `Try again. ${REPORT_IT}`,
      }
    case 'output-unreadable':
      return {
        what: 'The finished video could not be read back, so it was not kept.',
        next: `Try again. ${REPORT_IT}`,
      }
    case 'out-of-space':
      return {
        what: 'This device ran out of working space part-way through.',
        next: `Free some space, or choose ${PRESETS.smaller.label}, and try again.`,
      }
    case 'encoder-refused':
      return {
        what: 'This browser stopped encoding the video part-way through.',
        next: `Try the other output under File size / quality. ${REPORT_IT}`,
      }
    case 'check-failed':
      return {
        what: message ?? 'The device check did not finish.',
        next: 'Choose the file again to check it once more. If it fails again, report it with the Send feedback button.',
      }
    case 'timed-out':
      return {
        what: 'The job stopped reporting progress, so it was stopped.',
        next: `Try again. ${REPORT_IT}`,
      }
    case 'unknown':
      return {
        what: message ?? 'Something went wrong while creating the video.',
        next: `Try again. ${REPORT_IT}`,
      }
  }
}

/** The failure as one paragraph: what, the reassurance, what next. */
export function failureSentence(text: FailureText): string {
  return `${text.what} ${ORIGINAL_UNCHANGED} ${text.next}`
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
  const tryChrome = context.chromeOnComputer
    ? 'This copy of Chrome may be out of date, or a setting on this computer may have turned the feature off. Update Chrome, or ask whoever manages the computer.'
    : 'Chrome on a computer is the browser this tool is built for — try it there.'
  if (!flags.secureContext) {
    return 'This page needs a secure connection before it can work with your video. Open it at an address that starts https://.'
  }
  if (!flags.webCodecs) return `This browser cannot process video, so the tool cannot run here. ${tryChrome}`
  if (!flags.h264) {
    return `This browser cannot create the video format this tool needs, so the tool cannot run here. ${tryChrome}`
  }
  if (!flags.workingStore) {
    return `This browser gives the tool no working space to build a video in. If you are browsing privately, an ordinary window usually works. ${tryChrome}`
  }
  if (!flags.workerStarted) {
    return 'The part of the tool that does the work did not start. Reload the page. If it happens again, report it with the Send feedback button.'
  }
  return null
}

/** The plain sentence over a captured error's technical details (U-06). */
export const CAPTURED_ERROR_SENTENCE =
  'Something in the tool went wrong. A video being made may not finish; your original file is not affected. Report it with the Send feedback button, which adds these details.'
