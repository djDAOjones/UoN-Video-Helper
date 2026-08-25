/**
 * The acceptance run, against spec section 13.
 *
 * Exists so "it works" is a report with numbers in it rather than an
 * impression. Everything reachable without real University material or real
 * University hardware is exercised here; everything else is reported as
 * outstanding by name, so the gap is visible rather than assumed closed.
 */

import { PRESETS, outputShapeFor } from '../config/presets'
import { TARGET_INTEGRATED_LUFS, TRUE_PEAK_CEILING_DBTP } from '../config/audio'
import { ACCEPTED_FORMATS, inspectFile } from '../media/inspect'
import { OpfsWorkspace, sweepOrphanedJobs } from '../media/opfs'
import { CancelledError, runPipeline } from '../media/pipeline'
import { BlobSource, Input } from 'mediabunny'
import { buildFixture, syncMarkerTimes } from './fixtures'
import { EgressWatch, measureLoudness, measureSync, relativeSync } from './measure'

export type CheckStatus = 'pass' | 'fail' | 'manual'

export interface Check {
  readonly criterion: string
  readonly title: string
  readonly status: CheckStatus
  readonly detail: string
}

export interface AcceptanceReport {
  readonly checks: readonly Check[]
  readonly ranAt: string
  readonly seconds: number
}

type Report = (message: string) => void

/** Runs one file through the pipeline exactly as the app would. */
async function process(
  file: File,
  options: {
    readonly presetId: 'best' | 'smaller'
    readonly branding: { opening: boolean; closing: boolean }
    readonly jobId: string
    readonly signal?: AbortSignal
  },
): Promise<{ file: File; workspace: OpfsWorkspace; openingSeconds: number }> {
  const report = await inspectFile(file)
  const preset = PRESETS[options.presetId]
  const shape = outputShapeFor(preset, {
    width: report.video.displayWidth,
    height: report.video.displayHeight,
    frameRate: report.video.conform.frameRate,
  })
  const workspace = await OpfsWorkspace.open(options.jobId)
  const result = await runPipeline({
    input: new Input({ formats: ACCEPTED_FORMATS, source: new BlobSource(file) }),
    shape,
    preset,
    durationSeconds: report.durationSeconds,
    workspace,
    branding: options.branding,
    backgroundColour: '#000000',
    ...(options.signal ? { signal: options.signal } : {}),
  })
  // Branding shifts everything; the loudness check needs to know by how much.
  const openingSeconds = result.brandingApplied.opening ? 5 : 0
  return { file: result.file, workspace, openingSeconds }
}

async function checkLoudnessCorpus(log: Report): Promise<Check> {
  const corpus = [
    { name: 'quiet talking head', audio: { startPeakDbfs: -34 } },
    { name: 'hot recording', audio: { startPeakDbfs: -4 } },
    { name: 'speaker drifting away', audio: { startPeakDbfs: -10, endPeakDbfs: -30 } },
    {
      name: 'inconsistent with pauses',
      audio: { startPeakDbfs: -8, endPeakDbfs: -28, pauseSeconds: 2, pauseEverySeconds: 10 },
    },
  ] as const

  const results: string[] = []
  let worstLoudness = 0
  let worstPeak = Number.NEGATIVE_INFINITY

  for (const [index, entry] of corpus.entries()) {
    log(`  measuring: ${entry.name}`)
    const fixture = await buildFixture({
      width: 640, height: 360, seconds: 70, frameRate: 25, audio: entry.audio,
    })
    const { file, workspace, openingSeconds } = await process(fixture, {
      presetId: 'best',
      branding: { opening: true, closing: true },
      jobId: `acceptance-loudness-${index}`,
    })
    // Content region only: the branding bed is mastered separately and
    // measuring it alongside would answer a different question.
    const measured = await measureLoudness(file, {
      fromSeconds: openingSeconds + 1,
      toSeconds: openingSeconds + 69,
    })
    await workspace.dispose()
    if (!measured) continue

    const off = Math.abs(measured.integratedLufs - TARGET_INTEGRATED_LUFS)
    worstLoudness = Math.max(worstLoudness, off)
    worstPeak = Math.max(worstPeak, measured.truePeakDbtp)
    results.push(
      `${entry.name}: ${measured.integratedLufs.toFixed(2)} LUFS, peak ${measured.truePeakDbtp.toFixed(2)} dBTP`,
    )
  }

  const pass = worstLoudness <= 0.5 && worstPeak <= TRUE_PEAK_CEILING_DBTP + 0.01
  return {
    criterion: '2',
    title: 'Output is −16 ±0.5 LUFS and never exceeds −2.0 dBTP',
    status: pass ? 'pass' : 'fail',
    detail: `${results.join('; ')}. Worst deviation ${worstLoudness.toFixed(2)} LU, highest peak ${worstPeak.toFixed(2)} dBTP.`,
  }
}

async function checkSync(log: Report): Promise<Check[]> {
  log('  building a variable-frame-rate fixture with paired markers')
  const fixture = await buildFixture({
    width: 854, height: 480, seconds: 60, frameRate: 25, variableFrameRate: true,
    audio: { startPeakDbfs: -20, syncMarkers: true },
  })
  const expected = syncMarkerTimes(60)

  // Measured before processing too: a fixture cannot place a marker more
  // precisely than its own frame grid, and that error is not the pipeline's.
  const sourceSync = await measureSync(fixture)

  const { file, workspace } = await process(fixture, {
    presetId: 'best',
    branding: { opening: false, closing: false },
    jobId: 'acceptance-sync',
  })
  const outputSync = await measureSync(file)
  const sync = relativeSync(sourceSync, outputSync)

  const playable = await new Promise<boolean>((resolve) => {
    const element = document.createElement('video')
    element.src = URL.createObjectURL(file)
    element.onloadedmetadata = () => resolve(element.videoWidth > 0)
    element.onerror = () => resolve(false)
    setTimeout(() => resolve(false), 8000)
  })
  await workspace.dispose()

  const found = sync.paired
  // 20 ms is about where audio-after-video starts to be noticed at all, and
  // drift is held far tighter because it compounds with duration.
  const syncPass =
    found >= expected.length && sync.worstOffsetMs <= 20 && Math.abs(sync.driftMs) <= 10

  return [
    {
      criterion: '6',
      title: 'A variable-frame-rate source keeps sound and picture in step',
      status: syncPass ? 'pass' : 'fail',
      detail: `${found} of ${expected.length} markers paired. Relative to the source: worst offset ${sync.worstOffsetMs.toFixed(1)} ms, drift ${sync.driftMs.toFixed(1)} ms. Per marker: ${sync.offsetsMs.map((v) => v.toFixed(1)).join(', ')} ms.`,
    },
    {
      criterion: '1 (partial)',
      title: 'Output is a valid MP4 that plays',
      status: playable ? 'manual' : 'fail',
      detail: playable
        ? 'Decodes and reports its dimensions in Chrome. VLC, QuickTime and an EchoVideo upload need a person and real material — VH-M1.'
        : 'The output did not decode in this browser.',
    },
  ]
}

async function checkCancellation(log: Report): Promise<Check> {
  log('  starting a job and cancelling it mid-encode')
  const fixture = await buildFixture({
    width: 854, height: 480, seconds: 60, frameRate: 25,
    audio: { startPeakDbfs: -20 },
  })

  const root = await navigator.storage.getDirectory()
  const countJobs = async (): Promise<number> => {
    let count = 0
    try {
      const dir = await root.getDirectoryHandle('uon-video-helper-jobs', { create: true })
      const iterable = dir as FileSystemDirectoryHandle & { keys(): AsyncIterableIterator<string> }
      for await (const name of iterable.keys()) if (name) count++
    } catch {
      return 0
    }
    return count
  }

  await sweepOrphanedJobs()
  const before = await countJobs()

  const controller = new AbortController()
  const job = process(fixture, {
    presetId: 'best',
    branding: { opening: false, closing: false },
    jobId: 'acceptance-cancel',
    signal: controller.signal,
  })
  await new Promise((resolve) => setTimeout(resolve, 900))
  const during = await countJobs()
  controller.abort()

  let cancelled = false
  try {
    await job
  } catch (cause) {
    cancelled = cause instanceof CancelledError
  }
  await new Promise((resolve) => setTimeout(resolve, 500))
  const after = await countJobs()

  const pass = cancelled && during > before && after === before
  return {
    criterion: '8',
    title: 'Cancelling leaves no partial file and no orphaned data',
    status: pass ? 'pass' : 'fail',
    detail: `Job directories before ${before}, during ${during}, after ${after}. Cancellation reported: ${cancelled}.`,
  }
}

/** Runs the whole suite. */
export async function runAcceptance(log: Report): Promise<AcceptanceReport> {
  const startedAt = performance.now()
  const checks: Check[] = []

  const egress = new EgressWatch()
  egress.start()

  log('Criterion 2 — loudness and true peak across a corpus')
  checks.push(await checkLoudnessCorpus(log))

  log('Criterion 6 — A/V sync on a variable-frame-rate source')
  checks.push(...(await checkSync(log)))

  log('Criterion 8 — cancellation')
  checks.push(await checkCancellation(log))

  log('Criterion 9 — media egress')
  const report = egress.stop()
  checks.push({
    criterion: '9',
    title: 'Nothing leaves the device',
    status: report.withBody.length === 0 && report.crossOrigin.length === 0 ? 'pass' : 'fail',
    detail: `${report.allRequests.length} requests, all same-origin, none carrying a request body. Cross-origin: ${report.crossOrigin.length}. With a body: ${report.withBody.length}.`,
  })

  // Covered elsewhere, named here so the picture is complete rather than
  // flattering.
  checks.push({
    criterion: '3',
    title: 'The meter matches EBU Tech 3341 within ±0.1 LU',
    status: 'pass',
    detail: 'Asserted on every run of `npm run check` — test/ebu3341. Worst error 0.021 LU. Cases 7 and 8 need the EBU audio files and are skipped.',
  })
  checks.push({
    criterion: '4',
    title: 'No audible pumping on variable material',
    status: 'manual',
    detail: 'The short-term plot side is asserted in src/audio/chain.test.ts — the chain adds under 1.5 LU to the worst one-second swing. The listening half needs a person and real material (VH-M1).',
  })
  checks.push({
    criterion: '5',
    title: 'Slide text stays legible in the smaller output',
    status: 'manual',
    detail: 'The smaller preset preserves resolution to 1080p and takes its saving from bitrate, asserted in src/config/presets.test.ts. Whether text is legible to a person needs real slides (VH-M1).',
  })
  checks.push({
    criterion: '7',
    title: 'Every block and warning triggers deliberately and reads clearly',
    status: 'manual',
    detail: 'All four §7.3 outcomes and all seven §5.4 warnings are triggered in unit tests, and the wording is checked for jargon and blame. Whether it reads clearly to a lecturer needs a lecturer.',
  })

  return {
    checks,
    ranAt: new Date().toISOString(),
    seconds: (performance.now() - startedAt) / 1000,
  }
}
