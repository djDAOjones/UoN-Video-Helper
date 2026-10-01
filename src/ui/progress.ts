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
 * Pure, so every sentence and every milestone is tested in Node.
 */

import { PROGRESS_MILESTONE_FRACTIONS } from '../config/thresholds'
import type { PipelineStage } from '../media/pipeline'

/** Spec 9.2: named stages, not one opaque bar. */
export const STAGE_WORDS: Readonly<Record<PipelineStage, string>> = {
  preparing: 'Getting ready',
  analysing: 'Analysing audio',
  encoding: 'Encoding video',
  finishing: 'Finishing the file',
  checking: 'Checking the file',
}

/** The stages whose fraction is a measurement rather than a placeholder. */
const MEASURED: ReadonlySet<PipelineStage> = new Set<PipelineStage>(['encoding'])

/** The words for each of {@link PROGRESS_MILESTONE_FRACTIONS}, in its order. */
const MILESTONE_WORDS = ['a quarter done', 'half done', 'three quarters done'] as const

/** Fractions at which a measured stage is worth a word, and the word. */
const MILESTONES: ReadonlyArray<readonly [number, string]> = PROGRESS_MILESTONE_FRACTIONS.map(
  (fraction, index) => [fraction, MILESTONE_WORDS[index]!] as const,
)

export const APP_TITLE = 'UoN Video Helper'

/** What the last report left behind, so the next knows what is new. */
export interface ProgressMemo {
  readonly stage: PipelineStage | null
  /** Index into {@link MILESTONES} of the last milestone announced, or -1. */
  readonly milestone: number
}

export const NO_PROGRESS: ProgressMemo = { stage: null, milestone: -1 }

export interface ProgressView {
  /** Beside the bar, always: the stage, with the percentage where it is measured. */
  readonly shown: string
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
 */
export function progressView(
  stage: PipelineStage,
  fraction: number,
  memo: ProgressMemo,
  announceProgress: boolean,
): ProgressView {
  const word = STAGE_WORDS[stage]
  const measured = MEASURED.has(stage)
  const percent = Math.max(0, Math.min(100, Math.round(fraction * 100)))
  const shown = measured ? `${word} — ${percent}%` : word

  const stageChanged = memo.stage !== stage
  let milestone = stageChanged ? -1 : memo.milestone
  let announce: string | null = stageChanged ? word : null
  if (measured) {
    // The highest milestone passed, said once. A jump over two says the later.
    for (let index = MILESTONES.length - 1; index > milestone; index--) {
      if (fraction >= MILESTONES[index]![0]) {
        if (!stageChanged) announce = `${word} — ${MILESTONES[index]![1]}`
        milestone = index
        break
      }
    }
  }

  return {
    shown,
    announce: announceProgress ? announce : null,
    indeterminate: !measured,
    title: `${word} — ${APP_TITLE}`,
    memo: { stage, milestone },
  }
}

/** The tab title once the job has ended, or with no job. */
export function outcomeTitle(outcome: 'ready' | 'failed' | 'cancelled' | 'none'): string {
  switch (outcome) {
    case 'ready':
      return `Ready — ${APP_TITLE}`
    case 'failed':
      return `Not made — ${APP_TITLE}`
    case 'cancelled':
      return `Cancelled — ${APP_TITLE}`
    case 'none':
      return APP_TITLE
  }
}

/**
 * Spec 7.5, said once at the start of every job: what keeps it alive, and
 * what ends it. Not tied to the estimate — a five-minute job dies with its
 * tab as surely as a fifty-minute one (A-03).
 */
export const JOB_START_NOTICE =
  'Keep this tab visible and your computer awake while the video is made. Closing the tab ends the job.'

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
