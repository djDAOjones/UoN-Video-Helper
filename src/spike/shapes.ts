/**
 * VH-43: do the corpus's odd shapes reach a correct output?
 *
 * Mostly verification rather than known breakage — which is exactly why it
 * needed doing, because "probably fine" is not a finding. Every case here is a
 * property a real lecture in `samples/` actually has, listed in
 * `tickets/VH-43.md`: three files at 852x480 (not 854, so the width is not a
 * multiple of 4 and chroma subsampling has to round it), one at 640x480, one at
 * 3840x2400 which is 16:10 rather than 16:9, one mono, three with no audio
 * track at all, and sample rates split nine/nine between 44.1 and 48 kHz.
 *
 * Synthesised rather than the real files, deliberately: `samples/` is
 * gitignored and irreplaceable, so a check that depends on it can only run on
 * one machine. These carry the same PROPERTIES and run anywhere.
 *
 * Dev-only; not built. Run in every engine:
 *   node scripts/run-in-engines.mjs /spike-shapes.html
 */

import { OUTPUT_SAMPLE_RATE, PRESETS, outputShapeFor } from '../config/presets'
import { buildFixture } from '../acceptance/fixtures'
import { canEncodeAudio } from '../media/capability'
import { inspectFile, openInput } from '../media/inspect'
import { OpfsWorkspace } from '../media/opfs'
import { runPipeline } from '../media/pipeline'

const log = document.getElementById('log') as HTMLPreElement
const lines: string[] = []
let failures = 0

function say(text: string): void {
  lines.push(text)
  log.textContent = lines.join('\n')
}

function check(passed: boolean, description: string): void {
  if (!passed) failures++
  say(`    ${passed ? 'PASS' : 'FAIL'} — ${description}`)
}

interface Case {
  readonly name: string
  readonly why: string
  readonly width: number
  readonly height: number
  readonly frameRate: number
  readonly audio: { readonly channels?: number; readonly sampleRate?: number } | null
}

const CASES: readonly Case[] = [
  {
    name: '852x480 stereo 48k',
    why: 'three PowerPoint exports. 852 is not a multiple of 4, so chroma subsampling has to round it',
    width: 852,
    height: 480,
    frameRate: 25,
    audio: {},
  },
  {
    name: '640x480 4:3',
    why: 'one lecture. 4:3 into a 16:9 branding composite',
    width: 640,
    height: 480,
    frameRate: 25,
    audio: {},
  },
  {
    name: '1280x800 16:10',
    why: 'stands in for the 3840x2400 master — 16:10, which the branding has never been fed. Quarter size so the check stays runnable',
    width: 1280,
    height: 800,
    frameRate: 25,
    audio: {},
  },
  {
    name: 'mono 48k',
    why: 'one lecture is single-channel',
    width: 640,
    height: 360,
    frameRate: 25,
    audio: { channels: 1 },
  },
  {
    name: 'stereo 44.1k',
    why: 'nine of eighteen audio files. Everything downstream is conformed to 48 kHz',
    width: 640,
    height: 360,
    frameRate: 25,
    audio: { sampleRate: 44100 },
  },
  {
    name: 'mono 44.1k',
    why: 'both awkward properties at once, which is where a resampler is most likely to be wrong',
    width: 640,
    height: 360,
    frameRate: 25,
    audio: { channels: 1, sampleRate: 44100 },
  },
  {
    name: 'no audio track',
    why: 'three corpus files are silent. The 5.4 warning path, and the one the size estimate over-charges',
    width: 640,
    height: 360,
    frameRate: 25,
    audio: null,
  },
]

say(`userAgent: ${navigator.userAgent}`)

// Firefox 154 has the AudioEncoder class and refuses AAC at every bitrate
// (VH-49), so every case with audio would fail here for a reason that has
// nothing to do with the shape being tested. Reported as skipped rather than
// failed — a red result for a known engine limitation trains people to ignore
// the whole page.
const canEncodeAac = await canEncodeAudio({
  codec: 'mp4a.40.2',
  sampleRate: OUTPUT_SAMPLE_RATE,
  numberOfChannels: 2,
  bitrate: PRESETS.best.audioBitrateStereoBps,
})
say(
  `this engine encodes AAC: ${canEncodeAac}${canEncodeAac ? '' : ' — audio cases will be SKIPPED (VH-49)'}\n`,
)

for (const testCase of CASES) {
  say(`=== ${testCase.name} — ${testCase.why}`)
  if (testCase.audio !== null && !canEncodeAac) {
    say('    SKIPPED — this engine cannot encode AAC, which pre-flight now blocks (VH-49)')
    continue
  }
  let workspace: OpfsWorkspace | null = null
  try {
    const fixture = await buildFixture({
      width: testCase.width,
      height: testCase.height,
      seconds: 3,
      frameRate: testCase.frameRate,
      ...(testCase.audio === null ? {} : { audio: { startPeakDbfs: -20, ...testCase.audio } }),
    })
    const report = await inspectFile(fixture)
    const preset = PRESETS.best
    const shape = outputShapeFor(preset, {
      width: report.video.displayWidth,
      height: report.video.displayHeight,
      frameRate: report.video.conform.frameRate,
      videoBitrateBps: report.video.averageBitrateBps,
      sourceFrameRate: report.video.conform.sourceFrameRate,
    })

    workspace = await OpfsWorkspace.open(`spike-shape-${testCase.name.replace(/\W+/g, '-')}`)
    const result = await runPipeline({
      input: openInput(fixture),
      shape,
      preset,
      sourceTimeline: report.timeline,
      workspace,
      // Closing on: 16:10 and 4:3 sources are exactly where the branding
      // conform has to letterbox rather than stretch.
      branding: { opening: false, closing: true },
      backgroundColour: '#000000',
    })

    const produced = await inspectFile(result.file)
    say(
      `    in  ${report.video.displayWidth}x${report.video.displayHeight}` +
        ` ${report.audio ? `${report.audio.channelCount}ch ${report.audio.sampleRate}Hz` : 'silent'}`,
    )
    say(
      `    out ${produced.video.displayWidth}x${produced.video.displayHeight}` +
        ` ${produced.audio ? `${produced.audio.channelCount}ch ${produced.audio.sampleRate}Hz` : 'silent'}` +
        ` ${(result.file.size / 1024).toFixed(0)} kB`,
    )

    // No distortion. The aspect ratio the lecturer recorded is the one they get
    // back — the saving comes from bitrate, never from geometry (spec 6.2).
    const sourceAspect = report.video.displayWidth / report.video.displayHeight
    const outputAspect = produced.video.displayWidth / produced.video.displayHeight
    check(
      Math.abs(sourceAspect - outputAspect) < 0.01,
      `aspect preserved (${sourceAspect.toFixed(3)} -> ${outputAspect.toFixed(3)})`,
    )
    check(
      produced.video.displayWidth % 2 === 0 && produced.video.displayHeight % 2 === 0,
      'both dimensions even, as H.264 chroma subsampling requires',
    )
    check(result.file.size > 0 && produced.video.durationSeconds > 2, 'a playable clip came out')

    if (report.audio) {
      check(
        produced.audio !== null && produced.audio.sampleRate === OUTPUT_SAMPLE_RATE,
        `audio conformed to ${OUTPUT_SAMPLE_RATE} Hz`,
      )
      check(
        produced.audio !== null && produced.audio.channelCount === report.audio.channelCount,
        'channel count preserved rather than silently up- or down-mixed',
      )
    } else {
      // The real closing masters carry no audio, so a silent source should
      // produce a silent output rather than an empty track nothing wrote to.
      check(produced.audio === null, 'a silent source stays silent, with no empty audio track')
    }
  } catch (error) {
    failures++
    say(`    FAIL — ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    await workspace?.dispose()
  }
}

say(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAILURE(S)`}`)
say('\ndone')
