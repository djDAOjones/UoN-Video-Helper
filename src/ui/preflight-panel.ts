/**
 * Renders the pre-flight verdict.
 *
 * Spec section 9.2: every message says what happened, whether the original
 * file is affected (it never is), and what to do next. A block in particular
 * must name a browser that will work — an app that says "unsupported" and
 * stops has told the user nothing they can act on.
 */

import { PRESETS, bitrateWasCappedToSource } from '../config/presets'
import type { PreflightOutcome, PreflightReasonCode, PreflightSummary } from '../media/preflight'
import { formatDuration, formatFileSize, formatFrameRate, formatResolution } from './format'

const OUTCOME_HEADING: Record<PreflightOutcome, string> = {
  proceed: 'Ready to go',
  warn: 'Ready, with one thing to know',
  discourage: 'This will work, but it will be slow',
  block: 'This cannot run here',
}

function reasonText(code: PreflightReasonCode, summary: PreflightSummary): string {
  const estimate = summary.probe.estimatedSeconds
  switch (code) {
    case 'insecure-context':
      return 'This page is not open from its secure HTTPS address, so the browser will not allow private video processing. Open the published HTTPS version in Chrome or Edge on a computer, or Safari 26 or later on a Mac.'
    case 'no-webcodecs':
      return 'This browser cannot process video. Chrome or Edge on a computer will work, as will Safari 26 or later on a Mac.'
    case 'working-storage-unavailable':
      return 'This browser cannot open the private working space this job needs. Try the published HTTPS version in Chrome or Edge on a computer, or Safari 26 or later on a Mac.'
    case 'video-decode-unsupported':
      return 'This browser cannot read the main picture track in this file. Try the file in Chrome or Edge on a computer, or export it as a standard H.264 MP4 first.'
    case 'audio-decode-unsupported':
      return 'This browser cannot read the main sound track in this file. Try the file in Chrome or Edge on a computer, or export it with AAC sound first.'
    case 'no-aac-encode':
      // Names the browser that will work, as every block here must. Firefox
      // encodes the picture fine and refuses the sound, which is why the
      // message is about sound rather than about video (VH-49).
      return 'This browser cannot add sound to a video file. Chrome or Edge on a computer will work, as will Safari 26 or later on a Mac. Firefox can play video but cannot create the audio this needs.'
    case 'no-h264-encode':
      return 'This browser cannot create the video format this tool needs. Chrome or Edge on a computer will work.'
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

export interface PreflightRenderOptions {
  /** Required before Start may appear for a discourage outcome. */
  readonly onDiscourageAcknowledgement?: (acknowledged: boolean) => void
}

/** Replaces `container` with the rendered verdict. */
export function renderPreflight(
  container: HTMLElement,
  summary: PreflightSummary,
  options: PreflightRenderOptions = {},
): void {
  container.replaceChildren()

  const { verdict, shape, probe } = summary
  const section = document.createElement('div')
  section.className = 'verdict'
  section.dataset['outcome'] = verdict.outcome

  const heading = document.createElement('p')
  heading.className = 'verdict-heading'
  heading.textContent = OUTCOME_HEADING[verdict.outcome]
  section.append(heading)

  if (verdict.outcome === 'proceed' && probe.estimatedSeconds !== null) {
    const estimate = document.createElement('p')
    estimate.className = 'verdict-detail'
    estimate.textContent = `This should take about ${formatDuration(probe.estimatedSeconds)}.`
    section.append(estimate)
  }

  for (const reason of verdict.reasons) {
    const paragraph = document.createElement('p')
    paragraph.className = 'verdict-detail'
    paragraph.textContent = reasonText(reason.code, summary)
    section.append(paragraph)
  }

  if (verdict.outcome === 'discourage') {
    const acknowledgement = document.createElement('label')
    acknowledgement.className = 'radio'
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    const text = document.createElement('span')
    text.textContent =
      'I understand this device may take a long time or stop the job, and I want to continue here.'
    checkbox.addEventListener('change', () => {
      options.onDiscourageAcknowledgement?.(checkbox.checked)
    })
    acknowledgement.append(checkbox, text)
    section.append(acknowledgement)
  }

  const output = document.createElement('dl')
  output.className = 'facts'
  const rows: ReadonlyArray<readonly [string, string]> = [
    ['Setting', PRESETS[summary.presetId].label],
    [
      'Output',
      `${formatResolution(shape.width, shape.height)} at ${formatFrameRate(shape.frameRate)}`,
    ],
    ['Estimated size', formatFileSize(summary.projectedOutputBytes)],
    [
      'Measured speed',
      probe.measured
        ? `${Math.round(probe.videoFramesPerSecond)} frames per second on this device`
        : 'not measured',
    ],
  ]
  for (const [term, detail] of rows) {
    const dt = document.createElement('dt')
    dt.textContent = term
    const dd = document.createElement('dd')
    dd.textContent = detail
    output.append(dt, dd)
  }
  section.append(output)

  // Spec 6.2's never-exceed-source cap, said out loud (VH-41). Someone who
  // picked "Smaller file" to fit a storage limit has to know when it will not
  // make the file smaller — silently returning the same size is the version of
  // this that wastes their time. No bitrates: spec 9.2 keeps those out of the
  // interface, and the fact that matters here is about size, not encoding.
  if (bitrateWasCappedToSource(shape)) {
    const capped = document.createElement('p')
    capped.className = 'verdict-detail'
    capped.textContent =
      'Your video is already compressed as far as this setting would take it, so it will come ' +
      'out about the same size. The branding and sound levelling are still applied.'
    section.append(capped)
  }

  container.append(section)
}

/** One line for the live region. */
export function summarisePreflight(summary: PreflightSummary): string {
  const estimate = summary.probe.estimatedSeconds
  if (summary.verdict.outcome === 'block') return 'This video cannot be processed in this browser.'
  return estimate === null
    ? 'Device check complete. The processing time could not be estimated.'
    : `Device check complete. This should take about ${formatDuration(estimate)}.`
}
