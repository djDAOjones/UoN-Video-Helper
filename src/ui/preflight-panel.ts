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

import { PRESETS, bitrateWasCappedToSource } from '../config/presets'
import type { PreflightOutcome, PreflightReasonCode, PreflightSummary } from '../media/preflight'
import { formatApproximateDuration, formatFileSize } from './format'

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

/** Reads {@link BlockContext} from the user agent string. Pure, so it is tested. */
export function blockContextFor(userAgent: string, trimmed = false): BlockContext {
  const chromium = /Chrome\/\d+/.test(userAgent) && !/OPR\//.test(userAgent)
  const handheld = /Android|iPhone|iPad|Mobile/.test(userAgent)
  return { chromeOnComputer: chromium && !handheld, trimmed }
}

const ELSEWHERE: BlockContext = { chromeOnComputer: false }

const OUTCOME_HEADING: Record<PreflightOutcome, string> = {
  proceed: 'Ready to go',
  warn: 'Ready, with one thing to know',
  discourage: 'This will work, but it will be slow',
  block: 'This cannot run here',
}

/** The heading, counted: "one thing to know" over three things was untrue (U-24). */
function outcomeHeading(outcome: PreflightOutcome, things: number): string {
  if (outcome !== 'warn' || things <= 1) return OUTCOME_HEADING[outcome]
  const words = ['two', 'three', 'four', 'five', 'six']
  return `Ready, with ${words[things - 2] ?? String(things)} things to know`
}

/** The recommendation, where the browser is the cause and the user is not already in it. */
const TRY_CHROME = 'Chrome on a computer is the browser this tool is built for — try it there.'
/** Why Chrome itself would lack a feature it normally has. */
const CHROME_LACKS = 'This copy of Chrome may be out of date, or a setting on this computer may have turned the feature off. Update Chrome, or ask whoever manages the computer.'

function reasonText(code: PreflightReasonCode, summary: PreflightSummary, context: BlockContext): string {
  const estimate = summary.probe.estimatedSeconds
  const here = context.chromeOnComputer
  switch (code) {
    case 'no-webcodecs':
      return here
        ? `This browser cannot process video. ${CHROME_LACKS}`
        : `This browser cannot process video. ${TRY_CHROME}`
    case 'no-aac-encode':
      // Firefox encodes the picture fine and refuses the sound, which is why
      // the message is about sound rather than about video (VH-49).
      return here
        ? `This browser cannot add sound to a video file. ${CHROME_LACKS}`
        : `This browser cannot add sound to a video file. ${TRY_CHROME} Firefox can play video but cannot create the sound this needs.`
    case 'no-h264-encode':
      return here
        ? `This browser cannot create the video format this tool needs. ${CHROME_LACKS}`
        : `This browser cannot create the video format this tool needs. ${TRY_CHROME}`
    case 'no-source-decode':
      // The source panel promises that full guidance arrives here, so it has
      // to actually arrive (VH-60). In Chrome on a computer the remedy is the
      // file, not the browser: the formats Chrome opens are the ones this
      // tool can use.
      return here
        ? 'This browser cannot read the picture or sound inside this file. It was probably saved in a format made for editing software. Export it again as an MP4 — a file whose name ends .mp4 — and choose that file instead.'
        : `This browser cannot read the picture or sound inside this file. ${TRY_CHROME} If it will not open there either, the file was probably saved in a format made for editing software. Export it again as an MP4 — a file whose name ends .mp4.`
    case 'no-opfs':
      return here
        ? 'This browser will not give the tool the working space it needs to build your video. If you are browsing privately, an ordinary window usually works; otherwise a setting on this computer may be blocking site storage — ask whoever manages it.'
        : `This browser will not give the tool the working space it needs to build your video. ${TRY_CHROME} If you are browsing privately, an ordinary window usually works.`
    case 'insecure-context':
      // The one block the user can fix by changing the address, so it says so
      // first and names nothing else.
      return 'This page needs a secure connection before it can work with your video. Open it at an https:// address, or at localhost if you are running it yourself.'
    case 'insufficient-storage':
      // The one block the setup steps can resolve, so it says how.
      return `There is not enough free space on this device. This job needs about ${formatFileSize(summary.verdict.requiredStorageBytes)} of working space. Free some space and try again, keep less of the video, or choose ${PRESETS.smaller.label}.`
    case 'storage-unknown':
      return 'This browser will not say how much free space there is. If it runs out part-way, the job stops and nothing is saved — your original file is not affected.'
    case 'very-long-job':
      return `This will take about ${estimate === null ? 'a long time' : formatApproximateDuration(estimate)}. You can carry on, but a desktop computer would be considerably faster.`
    case 'long-job':
      return `This will take about ${estimate === null ? 'a while' : formatApproximateDuration(estimate)}. Keep this tab open while it runs — closing it stops the job.`
    case 'mobile-device':
      return 'Phones and tablets are much slower at this than a computer, and are more likely to stop part-way. Use a computer if you can.'
    case 'estimate-unavailable':
      return 'We could not work out how long this will take on this device. You can still continue.'
  }
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
      const time = formatApproximateDuration(probe.estimatedSeconds)
      // "About a few seconds" is what a very short clip would otherwise be told.
      lines.push(time === 'a few seconds' ? `This should take ${time}.` : `This should take about ${time}.`)
    }

    // "Up to", not a bare figure. It is an upper bound by construction — it
    // assumes the encoder spends its whole bitrate budget and that the longest
    // closing is appended — and a bare number reads as a prediction, which is
    // what made a 27.7 MB label for a 7.5 MB file look like a defect rather
    // than a margin (VH-31). VH-89 shortened the words and kept the meaning.
    lines.push(`Estimated size up to ${formatFileSize(summary.projectedOutputBytes)}.`)

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
      if (!context.trimmed) {
        lines.push(
          'Your video is already compressed as far as this setting would take it, so the new file ' +
            'will be about the same size.',
        )
      }
    } else if (summary.presetId === 'smaller' && summary.contentClass === 'screen') {
      // Spec 6.2 spends less on slides than on camera, and a classifier
      // decides which this is. Said out loud, with the way out, because the
      // one way it can be wrong — camera taken for slides — costs picture
      // quality, and the person looking at the video is the one who can tell
      // (VH-19). Not when the cap above already decided the size: the class
      // changed nothing then, and claiming it did would be untrue.
      lines.push(
        'This looks like slides or a screen recording, so the file is made smaller still. ' +
          `If it is mostly camera footage, choose ${PRESETS.best.label} instead.`,
      )
    }
  }

  return { heading: outcomeHeading(verdict.outcome, verdict.reasons.length), lines }
}

/** Replaces `container` with the rendered verdict. */
export function renderPreflight(
  container: HTMLElement,
  summary: PreflightSummary,
  context: BlockContext = ELSEWHERE,
): void {
  container.replaceChildren()

  const text = verdictText(summary, context)
  const section = document.createElement('div')
  section.className = 'verdict'
  section.dataset['outcome'] = summary.verdict.outcome

  const heading = document.createElement('p')
  heading.className = 'verdict-heading'
  heading.textContent = text.heading
  section.append(heading)

  for (const line of text.lines) {
    const paragraph = document.createElement('p')
    paragraph.className = 'verdict-detail'
    paragraph.textContent = line
    section.append(paragraph)
  }

  container.append(section)
}

/** What the status line says when a device check lands. */
export interface PreflightAnnouncement {
  /** Shown and spoken: that the check has landed. */
  readonly shown: string
  /**
   * Spoken only: the verdict itself, heading and all. The status line sits
   * directly under the verdict (VH-88), so showing it again would put it on
   * screen twice (U-25) — but the verdict is not a live region, and a
   * screen-reader user who hears only "Device check complete" has been told
   * there is a verdict and not what it is.
   */
  readonly spokenOnly: string
}

/**
 * The status line for a finished device check.
 *
 * Everything the verdict says reaches the live region; only what the box
 * does not show is shown.
 */
export function preflightAnnouncement(
  summary: PreflightSummary,
  context: BlockContext = ELSEWHERE,
): PreflightAnnouncement {
  const { heading, lines } = verdictText(summary, context)
  return {
    shown:
      summary.verdict.outcome === 'block'
        ? 'This video cannot be processed in this browser.'
        : 'Device check complete.',
    spokenOnly: [`${heading}.`, ...lines].join(' '),
  }
}
