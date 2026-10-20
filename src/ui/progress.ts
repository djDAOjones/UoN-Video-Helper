/**
 * What a job's progress says — on screen, out loud, and in the tab title.
 *
 * Three rules, from VH-109 (U-07, U-08, U-22, A-06):
 *
 *  - A stage with no measured progress shows no percentage. Only the encode
 *    counts frames; the analysis, the finishing and the final check are
 *    traversals whose length is not reported, and "0%" for their whole
 *    duration read as a hung page on a long recording.
 *  - The live region hears stage changes and a few milestones, never every
 *    percent: on a three-minute job the status line changed every second or
 *    two, and the polite region offered each change to a screen reader (WCAG
 *    2.2.4). The percentage stays visible beside the bar, which carries it
 *    for anyone who asks.
 *  - The tab title carries the stage, so someone in another tab can see
 *    where the job is, and "Ready" when it is done.
 *
 * And one from VH-136: once the encode has run long enough for its own rate
 * to be trusted, the time left shows on a line of its own under the stage
 * line, and the milestones say it too; nothing else does.
 *
 * Pure, so every sentence and every milestone is tested in Node.
 */

import { PROGRESS_MILESTONE_FRACTIONS, TIME_LEFT_AFTER_ENCODING_SECONDS } from '../config/thresholds'
import { locale, t } from '../i18n'
import { percentFormatter } from '../i18n/intl'
import type { PipelineStage } from '../media/pipeline'
import { approximateDuration, formatDuration } from './format'

/** Spec 9.2: named stages, not one opaque bar. */
export function stageWord(stage: PipelineStage): string {
  return t().progress.stages[stage]
}

/** The stages whose fraction is a measurement rather than a placeholder. */
const MEASURED: ReadonlySet<PipelineStage> = new Set<PipelineStage>(['encoding'])

/** A report as it reached the page: when, on one clock in milliseconds, and how far the stage was. */
export interface ProgressMark {
  readonly atMs: number
  readonly fraction: number
}

/** What the last report left behind, so the next knows what is new. */
export interface ProgressMemo {
  readonly stage: PipelineStage | null
  /** Index into {@link PROGRESS_MILESTONE_FRACTIONS} of the last milestone announced, or -1. */
  readonly milestone: number
  /** The encode's first report, which the time left is clocked from (VH-136); `null` outside the encode. */
  readonly encodeFrom: ProgressMark | null
}

export const NO_PROGRESS: ProgressMemo = { stage: null, milestone: -1, encodeFrom: null }

/**
 * Seconds left in the encode, from its own rate (VH-136): the time since its
 * first report, over the share of frames encoded since, times the share
 * still to go. VH-116 measured this reading within 4% of the real time once
 * the encode had run {@link TIME_LEFT_AFTER_ENCODING_SECONDS}, so before
 * then it is `null`, as it is while no frame has been counted since.
 *
 * The share to go runs to the encode's end, the closing's frames included,
 * as the pipeline counts them. Finishing and checking the file come after
 * and are not counted: a few seconds of a job, said by their own stages.
 */
export function encodeSecondsLeft(from: ProgressMark, now: ProgressMark): number | null {
  const elapsedSeconds = (now.atMs - from.atMs) / 1000
  const shareDone = now.fraction - from.fraction
  if (elapsedSeconds < TIME_LEFT_AFTER_ENCODING_SECONDS || shareDone <= 0) return null
  return (elapsedSeconds * Math.max(0, 1 - now.fraction)) / shareDone
}

/**
 * The time left in words, rounded as pre-flight's estimate is (U-22): "About
 * 2 minutes left", or "A few seconds left", never "about a few seconds".
 */
function timeLeftWords(seconds: number): string | null {
  const { progress } = t()
  const left = approximateDuration(seconds)
  if (left.kind === 'about') return progress.timeLeft({ time: formatDuration(left.seconds) })
  return left.kind === 'few-seconds' ? progress.fewSecondsLeft : null
}

export interface ProgressView {
  /** Beside the bar, always: the stage, with the percentage where it is measured. */
  readonly shown: string
  /**
   * On its own line under {@link shown}: the encode's time left once its rate
   * is known (VH-136), else `null`.
   */
  readonly timeLeft: string | null
  /** For the live region, or `null` when nothing new is worth saying. */
  readonly announce: string | null
  /** Whether the bar should show no value at all. */
  readonly indeterminate: boolean
  /** The tab title while this stage runs. */
  readonly title: string
  readonly memo: ProgressMemo
}

/**
 * The view for one progress report.
 *
 * @param announceProgress - The user's setting: whether routine progress
 *   is announced at all. The outcome is announced elsewhere regardless.
 * @param atMs - When the report reached the page, on the clock of every
 *   other report (`performance.now()`): the time left is timed from it.
 */
export function progressView(
  stage: PipelineStage,
  fraction: number,
  memo: ProgressMemo,
  announceProgress: boolean,
  atMs: number,
): ProgressView {
  const { progress } = t()
  const word = stageWord(stage)
  const measured = MEASURED.has(stage)
  const clamped = Math.max(0, Math.min(1, fraction))
  const stageChanged = memo.stage !== stage

  // The only measured stage is the encode, and its clock starts at its first
  // report, after the encoder's start-up and any title card (VH-136).
  const encodeFrom = !measured
    ? null
    : stageChanged || memo.encodeFrom === null
      ? { atMs, fraction: clamped }
      : memo.encodeFrom
  const secondsLeft = encodeFrom ? encodeSecondsLeft(encodeFrom, { atMs, fraction: clamped }) : null
  const timeLeft = secondsLeft === null ? null : timeLeftWords(secondsLeft)

  const shown = measured
    ? progress.stagePercent({ stage: word, percent: percentFormatter(locale())(clamped) })
    : word

  let milestone = stageChanged ? -1 : memo.milestone
  let announce: string | null = stageChanged ? word : null
  if (measured) {
    // The highest milestone passed, said once. A jump over two says the later.
    for (let index = PROGRESS_MILESTONE_FRACTIONS.length - 1; index > milestone; index--) {
      if (fraction >= PROGRESS_MILESTONE_FRACTIONS[index]!) {
        // The time left is heard here and nowhere else: three times an
        // encode at most, and not before it is known (VH-136).
        if (!stageChanged) {
          const said = progress.stageMilestone({ stage: word, milestone: progress.milestones[index]! })
          announce = timeLeft === null ? said : progress.withTimeLeft({ progress: said, left: timeLeft })
        }
        milestone = index
        break
      }
    }
  }

  return {
    shown,
    timeLeft,
    announce: announceProgress ? announce : null,
    indeterminate: !measured,
    title: progress.title.stage({ stage: word, app: t().app.title }),
    memo: { stage, milestone, encodeFrom },
  }
}

/** The tab title once the job has ended, or with no job. */
export function outcomeTitle(outcome: 'ready' | 'failed' | 'cancelled' | 'none'): string {
  const app = t().app.title
  const { title } = t().progress
  switch (outcome) {
    case 'ready':
      return title.ready({ app })
    case 'failed':
      return title.failed({ app })
    case 'cancelled':
      return title.cancelled({ app })
    case 'none':
      return app
  }
}

/** Where the announce-progress setting is remembered. Nothing about it leaves the device. */
export const ANNOUNCE_PROGRESS_KEY = 'uon-video-helper:announce-progress'

/** Reads the remembered setting; `true` when nothing is remembered or storage is unavailable. */
export function readAnnounceProgress(storage: Pick<Storage, 'getItem'> | null): boolean {
  try {
    return storage?.getItem(ANNOUNCE_PROGRESS_KEY) !== 'off'
  } catch {
    return true
  }
}

/** Remembers the setting; a storage that refuses is ignored. */
export function writeAnnounceProgress(storage: Pick<Storage, 'setItem'> | null, on: boolean): void {
  try {
    storage?.setItem(ANNOUNCE_PROGRESS_KEY, on ? 'on' : 'off')
  } catch {
    // Private windows and full stores refuse; the page works without it.
  }
}
