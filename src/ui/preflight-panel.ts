/**
 * Renders the pre-flight verdict.
 *
 * Spec section 9.2: every message says what happened, whether the original
 * file is affected (it never is), and what to do next. A block in particular
 * must name a browser that will work — an app that says "unsupported" and
 * stops has told the user nothing they can act on. The browser it names is
 * Chrome alone, because Chrome is the one the app is built and checked in, and
 * the page says so (VH-98). Naming another would send the user to a second
 * unchecked browser.
 */

import { PRESETS, bitrateWasCappedToSource } from '../config/presets'
import type { PreflightOutcome, PreflightReasonCode, PreflightSummary } from '../media/preflight'
import { formatDuration, formatFileSize } from './format'

const OUTCOME_HEADING: Record<PreflightOutcome, string> = {
  proceed: 'Ready to go',
  warn: 'Ready, with one thing to know',
  discourage: 'This will work, but it will be slow',
  block: 'This cannot run here',
}

function reasonText(code: PreflightReasonCode, summary: PreflightSummary): string {
  const estimate = summary.probe.estimatedSeconds
  switch (code) {
    case 'no-webcodecs':
      return 'This browser cannot process video. Chrome on a computer will work.'
    case 'no-aac-encode':
      // Names the browser that will work, as every block here must. Firefox
      // encodes the picture fine and refuses the sound, which is why the
      // message is about sound rather than about video (VH-49).
      return 'This browser cannot add sound to a video file. Chrome on a computer will work. Firefox can play video but cannot create the audio this needs.'
    case 'no-h264-encode':
      return 'This browser cannot create the video format this tool needs. Chrome on a computer will work.'
    case 'no-source-decode':
      // The source panel promises that full guidance arrives here, so it has
      // to actually arrive (VH-60).
      return 'This browser cannot read the picture or sound inside this file. Chrome on a computer will open more formats. If it still will not open, the file may have been saved in an unusual format — re-exporting it as an MP4 usually fixes it.'
    case 'no-opfs':
      return 'This browser will not give the tool the working space it needs to build your video. Chrome on a computer will work. If you are browsing privately, an ordinary window usually works.'
    case 'insecure-context':
      // The one block the user can fix by changing the address, so it says so
      // first and names nothing else.
      return 'This page needs a secure connection before it can work with your video. Open it at an https:// address, or at localhost if you are running it yourself.'
    case 'insufficient-storage':
      return `There is not enough free space on this device. This job needs about ${formatFileSize(summary.verdict.requiredStorageBytes)} of working space. Free some space and try again.`
    case 'storage-unknown':
      return 'This browser will not say how much free space there is. If it runs out part-way, the job stops and nothing is saved — your original file is not affected.'
    case 'very-long-job':
      return `This will take about ${estimate === null ? 'a long time' : formatDuration(estimate)}. You can carry on, but a desktop computer would be considerably faster.`
    case 'long-job':
      return `This will take about ${estimate === null ? 'a while' : formatDuration(estimate)}. Keep this tab open while it runs — closing it stops the job.`
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
export function verdictText(summary: PreflightSummary): VerdictText {
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
    lines.push(reasonText(reason.code, summary))
  }

  if (!blocked) {
    const timeAlreadySaid = verdict.reasons.some((reason) =>
      REASONS_STATING_THE_TIME.includes(reason.code),
    )
    if (!timeAlreadySaid && probe.estimatedSeconds !== null) {
      const time = formatDuration(probe.estimatedSeconds)
      // "About less than a second" is what a very short clip used to be told.
      lines.push(
        time.startsWith('less than') ? `This should take ${time}.` : `This should take about ${time}.`,
      )
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
    // size, not encoding.
    if (bitrateWasCappedToSource(shape)) {
      lines.push(
        'Your video is already compressed as far as this setting would take it, so it will come ' +
          'out about the same size. The branding and sound levelling are still applied.',
      )
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

  return { heading: OUTCOME_HEADING[verdict.outcome], lines }
}

/** Replaces `container` with the rendered verdict. */
export function renderPreflight(container: HTMLElement, summary: PreflightSummary): void {
  container.replaceChildren()

  const text = verdictText(summary)
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
  /** Shown and spoken: the outcome, in the verdict's own heading. */
  readonly shown: string
  /**
   * Spoken only: the rest of the verdict. The status line sits directly under
   * the verdict (VH-88), so showing these sentences again would put them on
   * screen twice — but the verdict itself is not a live region, and a
   * screen-reader user who hears only "Ready, with one thing to know" has
   * been told there is something and not what.
   */
  readonly spokenOnly: string
}

/**
 * The status line for a finished device check.
 *
 * Everything the verdict says reaches the live region; only the outcome is
 * repeated visibly.
 */
export function preflightAnnouncement(summary: PreflightSummary): PreflightAnnouncement {
  const { lines } = verdictText(summary)
  return {
    shown:
      summary.verdict.outcome === 'block'
        ? 'This video cannot be processed in this browser.'
        : `Device check complete. ${OUTCOME_HEADING[summary.verdict.outcome]}.`,
    spokenOnly: lines.join(' '),
  }
}
