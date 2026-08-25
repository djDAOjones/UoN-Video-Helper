/**
 * Runs a REAL recording end to end and reports what came out.
 *
 * The acceptance harness works from synthesised fixtures, which prove the
 * mechanics but not the outcome — several §13 criteria are recorded as
 * "needs a person and real material" for exactly that reason (VH-M1). This
 * closes part of that gap for anything sitting in `public/spike/`.
 *
 * Dev-only; not built. Fixtures are gitignored and the placeholder check
 * refuses to build while any remain, because they are real lectures.
 */

import { TARGET_INTEGRATED_LUFS, TRUE_PEAK_CEILING_DBTP } from '../config/audio'
import { PRESETS, outputShapeFor } from '../config/presets'
import { measureLoudness } from '../acceptance/measure'
import { inspectFile, openInput } from '../media/inspect'
import { OpfsWorkspace } from '../media/opfs'
import { runPipeline } from '../media/pipeline'

const log = document.getElementById('log') as HTMLPreElement
const lines: string[] = []
function say(text: string): void {
  lines.push(text)
  log.textContent = lines.join('\n')
}

const name = new URLSearchParams(location.search).get('file') ?? 'mac-powerpoint-600tb.mp4'
const mb = (bytes: number): string => `${(bytes / 1048576).toFixed(1)} MB`

let workspace: OpfsWorkspace | null = null
try {
  say(`file: ${name}`)
  const response = await fetch(`/spike/${name}`)
  if (!response.ok) throw new Error(`HTTP ${response.status} — is the fixture in public/spike/?`)
  const file = new File([await response.blob()], name, { type: 'video/mp4' })

  const report = await inspectFile(file)
  say(
    `in:   ${report.video.displayWidth}x${report.video.displayHeight} · ` +
      `${report.video.conform.sourceFrameRate.toFixed(3)} fps -> ${report.video.conform.frameRate} · ` +
      `${report.durationSeconds.toFixed(1)}s · ${mb(file.size)}`,
  )

  const before = await measureLoudness(file)
  say(
    before
      ? `      loudness ${before.integratedLufs.toFixed(2)} LUFS, peak ${before.truePeakDbtp.toFixed(2)} dBTP`
      : '      no audio track',
  )

  const preset = PRESETS.best
  const shape = outputShapeFor(preset, {
    width: report.video.displayWidth,
    height: report.video.displayHeight,
    frameRate: report.video.conform.frameRate,
  })
  workspace = await OpfsWorkspace.open('spike-real')

  const startedAt = performance.now()
  const result = await runPipeline({
    input: openInput(file),
    shape,
    preset,
    durationSeconds: report.durationSeconds,
    workspace,
    branding: { opening: false, closing: true },
    backgroundColour: '#000000',
    onProgress: ({ stage, fraction }) => {
      log.textContent = `${lines.join('\n')}\n… ${stage} ${(fraction * 100).toFixed(0)}%`
    },
  })
  const tookSeconds = (performance.now() - startedAt) / 1000

  const produced = await inspectFile(result.file)
  say(
    `out:  ${produced.video.displayWidth}x${produced.video.displayHeight} · ` +
      `${produced.durationSeconds.toFixed(1)}s · ${mb(result.file.size)}`,
  )

  const after = await measureLoudness(result.file)
  if (after) {
    const onTarget = Math.abs(after.integratedLufs - TARGET_INTEGRATED_LUFS) <= 0.5
    const peakOk = after.truePeakDbtp <= TRUE_PEAK_CEILING_DBTP
    say(
      `      loudness ${after.integratedLufs.toFixed(2)} LUFS ` +
        `(target ${TARGET_INTEGRATED_LUFS} ±0.5) ${onTarget ? 'PASS' : 'FAIL'}`,
    )
    say(
      `      true peak ${after.truePeakDbtp.toFixed(2)} dBTP ` +
        `(ceiling ${TRUE_PEAK_CEILING_DBTP}) ${peakOk ? 'PASS' : 'FAIL'}`,
    )
  }

  say(`      branding applied: closing=${result.brandingApplied.closing}`)
  say('')
  say(
    `took ${tookSeconds.toFixed(1)}s for ${report.durationSeconds.toFixed(0)}s of video ` +
      `(${(report.durationSeconds / tookSeconds).toFixed(1)}x real time)`,
  )
} catch (error) {
  say(`ERROR — ${error instanceof Error ? error.message : String(error)}`)
} finally {
  await workspace?.dispose()
}
say('\ndone')
