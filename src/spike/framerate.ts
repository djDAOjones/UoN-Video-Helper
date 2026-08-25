/**
 * VH-24 spike: does the app read the MEASURED frame rate or the declared one?
 *
 * Eight corpus files carry a rate defect and three of them declare `30/1`
 * while actually running 30.3028 — a ~1% drift, about six seconds over a ten
 * minute lecture, which is audible desync. The code path looks correct on a
 * read (`computeFrameRateMetrics()` rather than the header) but that is the
 * kind of claim worth checking against a real file.
 *
 * Dev-only; not built. The fixture is gitignored because it is 8.8 MB of real
 * lecture — copy it in before running:
 *
 *     cp "samples/AMCS2007 MiaM.mp4" public/spike/declares-30-runs-30.303.mp4
 */

import { inspectFile } from '../media/inspect'

const log = document.getElementById('log') as HTMLPreElement
const lines: string[] = []
function say(text: string): void {
  lines.push(text)
  log.textContent = lines.join('\n')
}

/** Override with `?file=name.mp4` to check another fixture in public/spike/. */
const URL_UNDER_TEST = `/spike/${new URLSearchParams(location.search).get('file') ?? 'declares-30-runs-30.303.mp4'}`

try {
  const response = await fetch(URL_UNDER_TEST)
  const file = new File([await response.blob()], 'declares-30-runs-30.303.mp4', {
    type: 'video/mp4',
  })
  const report = await inspectFile(file)

  const measured = report.video.frameRate
  say(`file:            ${URL_UNDER_TEST}`)
  say('')
  say(`bestGuess:       ${measured.bestGuess ?? 'null'}`)
  say(`underlying:      ${measured.underlying ?? 'null'}`)
  say(`min / max:       ${measured.min ?? '?'} / ${measured.max ?? '?'}`)
  say(`conform ->       ${report.video.conform.frameRate} fps output`)
  say(`conform source:  ${report.video.conform.sourceFrameRate}`)
  say(`variable?        ${report.video.isVariableFrameRate}`)
  say('')

  const source = report.video.conform.sourceFrameRate
  const plausible = source > 1 && source < 121
  say(
    plausible
      ? `PASS — measured a plausible rate (${source.toFixed(3)}), not a declared timebase`
      : `FAIL — source rate reported as ${source}, which is a timebase not a frame rate`,
  )
  say('')
  say(`duration:        ${report.durationSeconds.toFixed(3)}s`)
  say(`frameDeltaRatio: ${(report.video.conform.frameDeltaRatio * 100).toFixed(2)}%`)
} catch (error) {
  say(`ERROR — ${error instanceof Error ? error.message : String(error)}`)
}
say('\ndone')
