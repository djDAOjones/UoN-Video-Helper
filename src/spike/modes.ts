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

import { ALL_FORMATS, BlobSource, Input, VideoSampleSink } from 'mediabunny'

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

/** Mean frame luminance through a tiny readback; enough to prove the fade reached the output. */
async function meanLuminanceAt(file: Blob, seconds: number): Promise<number> {
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) })
  const track = await input.getPrimaryVideoTrack()
  if (!track) throw new Error('Fade measurement needs a picture track')
  const sample = await new VideoSampleSink(track).getSample(seconds)
  if (!sample) throw new Error(`No picture sample at ${seconds.toFixed(3)} s`)
  try {
    const size = 16
    const canvas = new OffscreenCanvas(size, size)
    const context = canvas.getContext('2d', { alpha: false })
    if (!context) throw new Error('Could not create fade measurement canvas')
    sample.draw(context, 0, 0, size, size)
    const { data } = context.getImageData(0, 0, size, size)
    let sum = 0
    for (let index = 0; index < data.length; index += 4) {
      sum += 0.2126 * data[index]! + 0.7152 * data[index + 1]! + 0.0722 * data[index + 2]!
    }
    return sum / (data.length / 4)
  } finally {
    sample.close()
  }
}

async function run(
  mode: BrandingMode,
  expected: number,
  variant: {
    readonly label?: string
    readonly seconds?: number
    readonly audioSeconds?: number
    readonly pictureFadeOut?: boolean
    readonly expectFadeOut?: boolean
    /** Absolute output length to check, when the added-seconds delta is not the point. */
    readonly expectedOutputSeconds?: number
  } = {},
): Promise<void> {
  const name = variant.label ?? mode
  const jobId = `spike-${name.replace(/\W+/g, '-')}`
  let workspace: OpfsWorkspace | null = null
  try {
    const fixture = await buildFixture({
      width: 640,
      height: 360,
      seconds: variant.seconds ?? SOURCE_SECONDS,
      ...(variant.audioSeconds === undefined ? {} : { audioSeconds: variant.audioSeconds }),
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
      sourceTimeline: report.timeline,
      workspace,
      branding: {
        opening: false,
        closing: true,
        mode,
        ...(variant.pictureFadeOut === undefined
          ? {}
          : { pictureFadeOut: variant.pictureFadeOut }),
      },
      backgroundColour: '#000000',
    })

    const produced = await inspectFile(result.file)
    const delta = produced.durationSeconds - report.durationSeconds
    const ok =
      variant.expectedOutputSeconds === undefined
        ? Math.abs(delta - expected) < 0.15
        : Math.abs(produced.durationSeconds - variant.expectedOutputSeconds) < 0.15
    const wanted = variant.expectedOutputSeconds ?? report.durationSeconds + expected
    say(
      `  ${name.padEnd(13)} source ${report.durationSeconds.toFixed(2)}s ` +
        `(picture ${report.video.durationSeconds.toFixed(2)}s) ` +
        `-> output ${produced.durationSeconds.toFixed(2)}s ` +
        `(wanted ${wanted.toFixed(2)}s)  ` +
        (ok ? 'PASS' : 'FAIL'),
    )
    if (variant.expectFadeOut !== undefined) {
      const sourceAt = Math.max(0, report.video.durationSeconds - 1 / shape.frameRate)
      const outputAt = result.contentOffsetSeconds + sourceAt
      const [sourceLuma, outputLuma] = await Promise.all([
        meanLuminanceAt(fixture, sourceAt),
        meanLuminanceAt(result.file, outputAt),
      ])
      const faded = outputLuma < sourceLuma * 0.3
      say(
        `    picture end source ${sourceLuma.toFixed(1)} -> output ${outputLuma.toFixed(1)}  ` +
          (faded === variant.expectFadeOut ? 'PASS' : 'FAIL'),
      )
    }
  } catch (error) {
    say(`  ${name.padEnd(13)} ERROR — ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    await workspace?.dispose()
  }
}

say('mode           result')
await run('hard-cut', CLOSING_TAIL_SECONDS, { expectFadeOut: true })
await run('hard-cut', CLOSING_TAIL_SECONDS, {
  label: 'hard cut raw',
  pictureFadeOut: false,
  expectFadeOut: false,
})
await run('over-picture', CLOSING_TAIL_SECONDS)
await run('over-freeze', CLOSING_TAIL_SECONDS + 1)
await run('over-picture', CLOSING_TAIL_SECONDS, {
  label: 'overlay fade',
  pictureFadeOut: true,
})
await run('over-freeze', CLOSING_TAIL_SECONDS + 1, {
  label: 'freeze fade',
  pictureFadeOut: true,
})

// VH-42. Neither shape exists in the corpus, so both are synthesised. The
// arithmetic is unit-tested in `branding-timeline.test.ts`; these prove the
// pipeline is actually wired to it, which no Node test can.
say('\nVH-42 — boundaries measured against the picture')

// Audio two seconds past the picture. Measured against max(video, audio) the
// closing landed at 6.00s, leaving two seconds of empty video timeline, and the
// composite point moved to 5.00s — past anything the picture reached — so the
// build silently never appeared.
await run('over-picture', CLOSING_TAIL_SECONDS, {
  label: 'audio +2s',
  audioSeconds: SOURCE_SECONDS + 2,
  expectedOutputSeconds: SOURCE_SECONDS + CLOSING_TAIL_SECONDS,
})

// Shorter than the 1.00s build, which used to compute a negative overlay start.
// It should degrade to over-freeze and say so: 0.50 + 1.00 freeze + the tail.
await run('over-picture', CLOSING_TAIL_SECONDS + 1, {
  label: 'source 0.5s',
  seconds: 0.5,
  expectedOutputSeconds: 0.5 + 1 + CLOSING_TAIL_SECONDS,
})

say('\ndone')
