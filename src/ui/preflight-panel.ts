/**
 * Renders the pre-flight verdict.
 *
 * Spec section 9.2: every message says what happened, whether the original
 * file is affected (it never is), and what to do next. A block in particular
 * must give the recovery that fits its cause (spec 7.3) — an app that says
 * "unsupported" and stops has told the user nothing they can act on. Where
 * the browser is the cause it recommends Chrome on a computer, the one the
 * app is built and checked in (VH-98): a recommendation, not a guarantee.
 * And it says something else to someone who is already there — a ProRes
 * master in desktop Chrome was told to use Chrome on a computer (U-05,
 * A-12), which is the browser they were in.
 */

import { bitrateWasCappedToSource } from '../config/presets'
import { t } from '../i18n'
import type { PreflightOutcome, PreflightReasonCode, PreflightSummary } from '../media/preflight'
import { approximateDuration, formatDuration, formatFileSize } from './format'
import { notification, type NotificationKind } from './notification'

/**
 * What the verdict's sentences may assume about the job and where the user is.
 *
 * `chromeOnComputer` is Chrome — or Edge, which is the same engine and the
 * default on a managed University laptop — on a desktop system: the browser
 * the generic remedy would otherwise send them to. `trimmed` is whether a
 * part was kept, so a claim about the file's size is made only when it is
 * true (U-24).
 */
export interface BlockContext {
  readonly chromeOnComputer: boolean
  readonly trimmed?: boolean
}

/**
 * Whether the setup steps can resolve a block, so they stay on the page: true
 * when every blocking reason is too little storage, which a shorter keep or
 * the smaller output answers (Codex review of VH-108). The page's choice of
 * what to show and the storage sentence's remedy read this one rule, so the
 * sentence never names a step the page has withdrawn (VH-123).
 */
export function setupStepsResolve(verdict: PreflightSummary['verdict']): boolean {
  return verdict.reasons.every(
    (reason) => reason.outcome !== 'block' || reason.code === 'insufficient-storage',
  )
}

/** Reads {@link BlockContext} from the user agent string. Pure, so it is tested. */
export function blockContextFor(userAgent: string, trimmed = false): BlockContext {
  const chromium = /Chrome\/\d+/.test(userAgent) && !/OPR\//.test(userAgent)
  const handheld = /Android|iPhone|iPad|Mobile/.test(userAgent)
  return { chromeOnComputer: chromium && !handheld, trimmed }
}

const ELSEWHERE: BlockContext = { chromeOnComputer: false }

/** The heading, counted: "one thing to know" over three things was untrue (U-24). */
function outcomeHeading(verdict: PreflightSummary['verdict']): string {
  const { outcome, reasons } = verdict
  const { headings } = t().preflight
  // A phone or tablet's heading leads with the risk, not with "this will
  // work": the browser there can end the job part-way to free memory, which
  // the body said under a heading that promised the opposite (VH-113, U-19).
  if (outcome === 'discourage' && reasons.some((reason) => reason.code === 'mobile-device')) {
    return headings.mobile
  }
  if (outcome === 'warn' && reasons.length > 1) return headings.warnSeveral({ count: reasons.length })
  return headings[outcome]
}

/** The remedy where the browser is the cause: try Chrome, or — already in Chrome — why it lacks the feature. */
export function remedyFor(context: { readonly chromeOnComputer: boolean }): string {
  return context.chromeOnComputer ? t().preflight.chromeLacks : t().preflight.tryChrome
}

function reasonText(code: PreflightReasonCode, summary: PreflightSummary, context: BlockContext): string {
  const estimate = summary.probe.estimatedSeconds
  const here = context.chromeOnComputer
  const remedy = remedyFor(context)
  const { reasons } = t().preflight
  switch (code) {
    case 'no-webcodecs':
      return reasons.noWebCodecs({ remedy })
    case 'no-aac-encode':
      // Firefox encodes the picture fine and refuses the sound, which is why
      // the message is about sound rather than about video (VH-49).
      return here ? reasons.noAacEncodeHere({ remedy }) : reasons.noAacEncodeElsewhere({ remedy })
    case 'no-h264-encode':
      return reasons.noH264Encode({ remedy })
    case 'no-source-decode':
      // The source panel promises that full guidance arrives here, so it has
      // to actually arrive (VH-60). In Chrome on a computer the remedy is the
      // file, not the browser: the formats Chrome opens are the ones this
      // tool can use.
      return here ? reasons.noSourceDecodeHere : reasons.noSourceDecodeElsewhere({ remedy })
    case 'no-opfs':
      return here ? reasons.noOpfsHere : reasons.noOpfsElsewhere({ remedy })
    case 'insecure-context':
      // The one block the user can fix by changing the address, so it says so
      // first and names nothing else.
      return reasons.insecureContext
    case 'insufficient-storage': {
      // The one block the setup steps can resolve, so it says how — unless
      // another block has taken those steps off the page (VH-123).
      const size = formatFileSize(summary.verdict.requiredStorageBytes)
      return setupStepsResolve(summary.verdict)
        ? reasons.insufficientStorageResolvable({ size, smaller: t().preset.labels.smaller })
        : reasons.insufficientStorage({ size })
    }
    case 'storage-unknown':
      return reasons.storageUnknown
    case 'very-long-job':
      return estimate === null
        ? reasons.veryLongJobUnknown
        : reasons.veryLongJob({ time: estimateWords(estimate) })
    case 'long-job':
      return estimate === null ? reasons.longJobUnknown : reasons.longJob({ time: estimateWords(estimate) })
    case 'mobile-device':
      return reasons.mobileDevice
    case 'estimate-unavailable':
      return reasons.estimateUnavailable
  }
}

/** An estimate for inside "about …": the rounded duration, or the few-seconds words. */
function estimateWords(seconds: number): string {
  const estimate = approximateDuration(seconds)
  if (estimate.kind === 'about') return formatDuration(estimate.seconds)
  return estimate.kind === 'few-seconds' ? t().format.fewSeconds : t().format.unknown
}

/**
 * Reasons whose own sentence already states how long the job will take.
 *
 * The time is said once (VH-89). `estimate-unavailable` is here because its
 * sentence is the time line for a job whose time is not known.
 */
const REASONS_STATING_THE_TIME: readonly PreflightReasonCode[] = [
  'long-job',
  'very-long-job',
  'estimate-unavailable',
]

/** What the verdict says: a heading, then one paragraph per line. */
export interface VerdictText {
  readonly heading: string
  readonly lines: readonly string[]
}

/**
 * The verdict in words — spec 7.3's outcome, then what the user needs in
 * order to decide.
 *
 * A `proceed` is three lines and nothing else: the heading, the time, the
 * size (VH-89). `warn` and `discourage` keep every reason and end on the same
 * two lines, with the time said once — so when a reason has already stated
 * it, the time line is left out rather than repeated. A `block` says only why
 * it is blocked: a job that cannot run takes no time and makes no file, and
 * advice about running it — "you can still continue", "you can carry on, but
 * a desktop would be faster" — contradicts the heading it sits under.
 *
 * The setting, the output shape and the measured speed used to be listed
 * here. They are what the tool decided, not what the user is deciding, and
 * they stay in the diagnostics log instead.
 *
 * Exported for tests. Rendering needs a DOM and the suite runs in Node, but
 * every decision about what is said is made here.
 */
export function verdictText(summary: PreflightSummary, context: BlockContext = ELSEWHERE): VerdictText {
  const { verdict, shape, probe } = summary
  const { preflight } = t()
  const blocked = verdict.outcome === 'block'
  const lines: string[] = []

  for (const reason of verdict.reasons) {
    // Under a block, only what blocks. The verdict collects every reason that
    // applies, and the lesser ones are all advice about running the job: an
    // unmeasured estimate arrives with every encode block (the probe does not
    // run), and a long job with too little storage arrived saying "you can
    // carry on" beside a Start button that is not there.
    if (blocked && reason.outcome !== 'block') continue
    lines.push(reasonText(reason.code, summary, context))
  }

  if (!blocked) {
    const timeAlreadySaid = verdict.reasons.some((reason) =>
      REASONS_STATING_THE_TIME.includes(reason.code),
    )
    if (!timeAlreadySaid && probe.estimatedSeconds !== null) {
      // Rounded (U-22): the probe differs by a quarter between loads of one
      // file, so "5 minutes 20 seconds" claimed a precision it did not have.
      // A very short clip is told "a few seconds", never "about a few
      // seconds" — decided by the estimate's kind, not by its words.
      const estimate = approximateDuration(probe.estimatedSeconds)
      lines.push(
        estimate.kind === 'about'
          ? preflight.shouldTake({ time: formatDuration(estimate.seconds) })
          : preflight.shouldTakeFewSeconds,
      )
    }

    // "Up to", not a bare figure. It is an upper bound by construction — it
    // assumes the encoder spends its whole bitrate budget and that the longest
    // closing is appended — and a bare number reads as a prediction, which is
    // what made a 27.7 MB label for a 7.5 MB file look like a defect rather
    // than a margin (VH-31). VH-89 shortened the words and kept the meaning.
    lines.push(preflight.sizeUpTo({ size: formatFileSize(summary.projectedOutputBytes) }))

    // Spec 6.2's never-exceed-source cap, said out loud (VH-41). Someone who
    // picked the smaller output to fit a storage limit has to know when it
    // will not make the file smaller — silently returning the same size is
    // the version of this that wastes their time. No bitrates: spec 9.2 keeps
    // those out of the interface, and the fact that matters here is about
    // size, not encoding. Not after a trim, where "about the same size" is
    // untrue, and no claim about what else is applied — that depends on
    // choices this verdict does not see (U-24).
    if (bitrateWasCappedToSource(shape)) {
      // Nothing is said after a trim — "about the same size" is then untrue
      // — and nothing about the slides either: the cap set the size, not the
      // classification (Codex review of VH-114).
      if (!context.trimmed) lines.push(preflight.sameSize)
    } else if (summary.presetId === 'smaller' && summary.contentClass === 'screen') {
      // Spec 6.2 spends less on slides than on camera, and a classifier
      // decides which this is. Said out loud, with the way out, because the
      // one way it can be wrong — camera taken for slides — costs picture
      // quality, and the person looking at the video is the one who can tell
      // (VH-19). Not when the cap above already decided the size: the class
      // changed nothing then, and claiming it did would be untrue.
      lines.push(preflight.slides({ best: t().preset.labels.best }))
    }
  }

  return { heading: outcomeHeading(verdict), lines }
}

/** Replaces `container` with the rendered verdict. */
export function renderPreflight(
  container: HTMLElement,
  summary: PreflightSummary,
  context: BlockContext = ELSEWHERE,
): void {
  container.replaceChildren()

  const text = verdictText(summary, context)
  container.append(
    notification({ kind: VERDICT_KIND[summary.verdict.outcome], title: text.heading, lines: text.lines }),
  )
}

/** Spec 7.3's outcomes on the notification's kinds: a block is an error, the rest a warning or a go. */
const VERDICT_KIND: Record<PreflightOutcome, NotificationKind> = {
  proceed: 'success',
  warn: 'warning',
  discourage: 'warning',
  block: 'error',
}

/** What the status line says when a device check lands. */
export interface PreflightAnnouncement {
  /**
   * Shown and spoken. Empty: the verdict box is directly beside the line,
   * and "Device check complete." under "Ready to go" was the line said twice
   * (VH-124); a block's old line, "cannot be processed in this browser", was
   * untrue of a block for too little storage.
   */
  readonly shown: string
  /**
   * Spoken only: that the check has landed, then the verdict itself, heading
   * and all. The verdict is not a live region, and a screen-reader user who
   * hears only that the check is complete has been told there is a verdict
   * and not what it is.
   */
  readonly spokenOnly: string
}

/**
 * The status line for a finished device check.
 *
 * Everything the verdict says reaches the live region; nothing the box
 * shows is shown twice.
 */
export function preflightAnnouncement(
  summary: PreflightSummary,
  context: BlockContext = ELSEWHERE,
): PreflightAnnouncement {
  const { heading, lines } = verdictText(summary, context)
  return { shown: '', spokenOnly: t().status.verdictSpoken({ heading, lines }) }
}
