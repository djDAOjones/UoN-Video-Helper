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

const URL_UNDER_TEST = '/spike/declares-30-runs-30.303.mp4'

try {
  const response = await fetch(URL_UNDER_TEST)
  const file = new File([await response.blob()], 'declares-30-runs-30.303.mp4', {
    type: 'video/mp4',
  })
  const report = await inspectFile(file)

  const measured = report.video.frameRate
  say(`file:            ${URL_UNDER_TEST}`)
  say(`ffprobe says:    r_frame_rate 30/1 (declared), avg 30.3028 (actual)`)
  say('')
  say(`bestGuess:       ${measured.bestGuess ?? 'null'}`)
  say(`underlying:      ${measured.underlying ?? 'null'}`)
  say(`min / max:       ${measured.min ?? '?'} / ${measured.max ?? '?'}`)
  say(`conform ->       ${report.video.conform.frameRate} fps output`)
  say(`conform source:  ${report.video.conform.sourceFrameRate}`)
  say(`variable?        ${report.video.isVariableFrameRate}`)
  say('')

  const source = report.video.conform.sourceFrameRate
  const readTheHeader = Math.abs(source - 30) < 0.01
  const measuredIt = Math.abs(source - 30.303) < 0.05
  say(
    measuredIt
      ? 'PASS — the app measured the real rate; the declared 30/1 was not trusted'
      : readTheHeader
        ? 'FAIL — the app took the declared 30/1, which drifts ~1%'
        : `INCONCLUSIVE — source rate reported as ${source}`,
  )
  say('')
  say(`duration:        ${report.durationSeconds.toFixed(3)}s`)
  const drift = report.durationSeconds * (1 - 30 / 30.3028)
  say(`drift if 30/1 were trusted over this file: ${drift.toFixed(2)}s`)
} catch (error) {
  say(`ERROR — ${error instanceof Error ? error.message : String(error)}`)
}
say('\ndone')
