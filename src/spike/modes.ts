/**
 * VH-22 spike: do the three closing modes produce the timelines they promise?
 *
 * `hard-cut` and `over-picture` both add the 4 s card; only `over-freeze` adds
 * a second on top, because it holds a frame under the build. Getting this
 * wrong is invisible in a unit test — the arithmetic lives in `pipeline.ts`
 * around a real encode — so it is checked against an actual output file.
 *
 * Dev-only; not part of the production build.
 */

import { PRESETS, outputShapeFor } from '../config/presets'
import { CLOSING_TAIL_SECONDS, type BrandingMode } from '../config/branding'
import { buildFixture } from '../acceptance/fixtures'
import { inspectFile, openInput } from '../media/inspect'
import { OpfsWorkspace } from '../media/opfs'
import { runPipeline } from '../media/pipeline'

const log = document.getElementById('log') as HTMLPreElement
const lines: string[] = []
function say(text: string): void {
  lines.push(text)
  log.textContent = lines.join('\n')
}

const SOURCE_SECONDS = 4

async function run(mode: BrandingMode, expected: number): Promise<void> {
  const jobId = `spike-${mode}`
  let workspace: OpfsWorkspace | null = null
  try {
    const fixture = await buildFixture({
      width: 640,
      height: 360,
      seconds: SOURCE_SECONDS,
      frameRate: 25,
      audio: { startPeakDbfs: -20 },
    })
    const report = await inspectFile(fixture)
    const preset = PRESETS.best
    const shape = outputShapeFor(preset, {
      width: report.video.displayWidth,
      height: report.video.displayHeight,
      frameRate: report.video.conform.frameRate,
    })
    workspace = await OpfsWorkspace.open(jobId)
    const result = await runPipeline({
      input: openInput(fixture),
      shape,
      preset,
      durationSeconds: report.durationSeconds,
      workspace,
      branding: { opening: false, closing: true, mode },
      backgroundColour: '#000000',
    })

    const produced = await inspectFile(result.file)
    const delta = produced.durationSeconds - report.durationSeconds
    const ok = Math.abs(delta - expected) < 0.15
    say(
      `  ${mode.padEnd(13)} source ${report.durationSeconds.toFixed(2)}s ` +
        `-> output ${produced.durationSeconds.toFixed(2)}s ` +
        `(added ${delta.toFixed(2)}s, expected ${expected.toFixed(2)}s)  ` +
        (ok ? 'PASS' : 'FAIL'),
    )
  } catch (error) {
    say(`  ${mode.padEnd(13)} ERROR — ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    await workspace?.dispose()
  }
}

say('mode           result')
await run('hard-cut', CLOSING_TAIL_SECONDS)
await run('over-picture', CLOSING_TAIL_SECONDS)
await run('over-freeze', CLOSING_TAIL_SECONDS + 1)
say('\ndone')
