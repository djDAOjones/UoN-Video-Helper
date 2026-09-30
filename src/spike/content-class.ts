/**
 * What does the classifier say each recording is, and from what numbers?
 *
 * VH-19. The smaller output's bitrate depends on whether the picture is
 * mostly slides or mostly camera (spec 6.2), and mistaking camera for slides
 * cuts 40% from the content that most needs the bits. The thresholds were set
 * on another corpus; this runs the product's own `measureContentClass` over
 * ours so each file's class can be held against what a person sees in it.
 *
 * Dev-only; not built. One file at a time, because a recording is read whole
 * before it is opened here.
 */

import { measureContentClass } from '../media/content-class'
import { inspectFile, openInput } from '../media/inspect'

const log = document.getElementById('log') as HTMLPreElement
const lines: string[] = []
function say(text: string): void {
  lines.push(text)
  log.textContent = lines.join('\n')
}

const paths = (new URLSearchParams(location.search).get('files') ?? '')
  .split('|')
  .map((path) => path.trim())
  .filter((path) => path.length > 0)

say('class     max diff   density   ms     windows (mean luma change)            file')
for (const path of paths) {
  const name = decodeURIComponent(path.split('/').pop() ?? path).slice(0, 44)
  try {
    const response = await fetch(path)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const file = new File([await response.blob()], 'source')
    const report = await inspectFile(file)
    const track = await openInput(file).getPrimaryVideoTrack()
    if (!track) throw new Error('no video track')

    const startedAt = performance.now()
    const { contentClass, measurement } = await measureContentClass(track, {
      width: report.video.displayWidth,
      height: report.video.displayHeight,
      sourceFrameRate: report.video.conform.sourceFrameRate,
      sourceBitrateBps: report.video.averageBitrateBps,
    })
    const took = Math.round(performance.now() - startedAt)
    const windows = measurement?.windowMeanDifferences ?? []
    const density = measurement?.sourceBitsPerPixelPerFrame ?? null
    say(
      `${contentClass.padEnd(9)} ` +
        `${(windows.length > 0 ? Math.max(...windows).toFixed(5) : '—').padStart(8)}   ` +
        `${(density === null ? '—' : density.toFixed(4)).padStart(7)}  ${String(took).padStart(5)}   ` +
        `${windows.map((value) => value.toFixed(5)).join(' ').padEnd(40)}  ${name}` +
        (measurement && !measurement.complete ? '  [incomplete]' : ''),
    )
  } catch (error) {
    say(`ERROR     ${error instanceof Error ? error.message : String(error)}  ${name}`)
  }
}
say('\ndone')
