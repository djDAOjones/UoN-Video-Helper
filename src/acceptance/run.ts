/**
 * The acceptance run, against spec section 13.
 *
 * Exists so "it works" is a report with numbers in it rather than an
 * impression. Everything reachable without real University material or real
 * University hardware is exercised here; everything else is reported as
 * outstanding by name, so the gap is visible rather than assumed closed.
 */

import { PRESETS, outputShapeFor } from '../config/presets'
import {
  INTEGRATED_TOLERANCE_LU,
  TARGET_INTEGRATED_LUFS,
  TRUE_PEAK_CEILING_DBTP,
} from '../config/audio'
import { inspectFile, inspectSource } from '../media/inspect'
import { OpfsWorkspace, ROOT_DIRECTORY, sweepOrphanedJobs } from '../media/opfs'
import { runPipeline } from '../media/pipeline'
import { buildFixture, syncMarkerTimes } from './fixtures'
import {
  EgressWatch,
  measureLoudness,
  measureSync,
  relativeSync,
  type EgressReport,
} from './measure'
import { loudnessCorpusVerdict, type OutputLoudnessMeasurement } from './verdicts'
import type { WorkerOutbound, WorkerRequest } from '../workers/protocol'

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
  const inspected = await inspectSource(file)
  const { report } = inspected
  const preset = PRESETS[options.presetId]
  const shape = outputShapeFor(preset, {
    width: report.video.displayWidth,
    height: report.video.displayHeight,
    frameRate: report.video.conform.frameRate,
    // Both source-relative bitrate rules key off these (VH-41, VH-47). Without
    // them this harness silently takes the unmeasured fallback and proves the
    // new rules on nothing.
    videoBitrateBps: report.video.averageBitrateBps,
    sourceFrameRate: report.video.conform.sourceFrameRate,
  })
  const workspace = await OpfsWorkspace.open(options.jobId)
  const result = await runPipeline({
    input: inspected.input,
    processingTracks: inspected.processingTracks,
    shape,
    preset,
    sourceTimeline: report.timeline,
    workspace,
    branding: options.branding,
    backgroundColour: '#000000',
    ...(options.signal ? { signal: options.signal } : {}),
  })
  // Branding shifts everything; the loudness check needs to know by how much.
  // Taken from the RESULT rather than from config: the pipeline offsets by the
  // clip's actual decoded duration, and `BRANDING_DURATIONS.openingSeconds` is
  // what that duration is supposed to be. They agree only because the
  // placeholder is exactly 5.000 s — a real asset a few frames off would have
  // shifted every window measured here, silently (VH-16).
  return { file: result.file, workspace, openingSeconds: result.contentOffsetSeconds }
}

/**
 * Sends one acceptance-worker request and waits for its correlated terminal reply.
 * Listeners and the timer are removed on every outcome so a later request cannot
 * accidentally satisfy an earlier one.
 */
function requestWorker(
  worker: Worker,
  request: WorkerRequest,
  timeoutMs: number,
): Promise<WorkerOutbound> {
  return new Promise((resolve, reject) => {
    const cleanup = (): void => {
      clearTimeout(timer)
      worker.removeEventListener('message', onMessage)
      worker.removeEventListener('error', onError)
    }
    const finish = (reply: WorkerOutbound): void => {
      cleanup()
      resolve(reply)
    }
    const fail = (cause: unknown): void => {
      cleanup()
      reject(cause instanceof Error ? cause : new Error(String(cause)))
    }
    const onMessage = (event: MessageEvent<WorkerOutbound>): void => {
      const message = event.data
      if (message.kind === 'uncaught') {
        fail(new Error(`the worker threw: ${message.error.message}`))
        return
      }
      if (message.kind === 'stage' || message.id !== request.id) return
      finish(message)
    }
    const onError = (event: ErrorEvent): void => {
      fail(new Error(event.message || 'the worker failed'))
    }
    const timer = setTimeout(
      () => fail(new Error(`the worker did not answer ${request.kind}`)),
      timeoutMs,
    )

    worker.addEventListener('message', onMessage)
    worker.addEventListener('error', onError)
    try {
      worker.postMessage(request)
    } catch (cause) {
      fail(cause)
    }
  })
}

/**
 * Runs one file through the WORKER, as the app does, rather than in-process.
 *
 * The difference is not cosmetic: this proves module loading, structured
 * cloning, progress, processing and retained-result ownership in the same
 * dedicated-worker context the product uses. The selected OPFS writer is not
 * surfaced, so this check deliberately makes no claim about which one ran.
 */
async function processInWorker(
  file: File,
  presetId: 'best' | 'smaller',
): Promise<{ file: File; jobId: string; worker: Worker }> {
  const worker = new Worker(new URL('../workers/job.worker.ts', import.meta.url), {
    type: 'module',
    name: 'uon-acceptance-job',
  })
  const id = 1
  try {
    const reply = await requestWorker(
      worker,
      {
        kind: 'process',
        id,
        file,
        presetId,
        selectionGeneration: 1,
        metadataReadFailureDisclosed: false,
        branding: { opening: false, closing: false },
        backgroundColour: '#000000',
      },
      180_000,
    )
    if (reply.kind !== 'processed') {
      throw new Error(
        `the worker did not produce a file: ${reply.kind}${reply.kind === 'failed' ? ` — ${reply.message}` : ''}`,
      )
    }
    return { file: reply.file, jobId: reply.jobId, worker }
  } catch (cause) {
    worker.terminate()
    throw cause
  }
}

/** Waits until the worker proves that the retained OPFS result was removed. */
async function discardWorkerResult(worker: Worker, jobId: string): Promise<void> {
  const reply = await requestWorker(worker, { kind: 'discard', id: 2, jobId }, 30_000)
  if (reply.kind !== 'discarded') {
    throw new Error(`the worker did not discard its result: ${reply.kind}`)
  }
}

/** Criterion 1, through the path the app actually uses. */
async function checkWorkerPath(log: Report): Promise<Check> {
  log('  running a fixture through the worker, not in-process')
  try {
    const fixture = await buildFixture({
      width: 640,
      height: 360,
      seconds: 4,
      frameRate: 25,
      audio: { startPeakDbfs: -20 },
    })
    const { file, jobId, worker } = await processInWorker(fixture, 'best')
    try {
      const produced = await inspectFile(file)
      const ok = file.size > 0 && produced.video.durationSeconds > 3
      log(
        `  worker produced ${(file.size / 1024).toFixed(0)} kB, ${produced.durationSeconds.toFixed(2)}s`,
      )
      return {
        criterion: '1',
        title: 'The pipeline runs in the production worker context',
        status: ok ? 'pass' : 'fail',
        detail: ok
          ? `A worker job produced a playable ${(file.size / 1024).toFixed(0)} kB MP4 and retained it until an acknowledged discard. The worker's selected OPFS writer is not surfaced, so this does not claim sync-access-handle coverage.`
          : `The worker returned a file of ${file.size} bytes lasting ${produced.durationSeconds.toFixed(2)}s.`,
      }
    } finally {
      try {
        await discardWorkerResult(worker, jobId)
      } finally {
        worker.terminate()
      }
    }
  } catch (cause) {
    return {
      criterion: '1',
      title: 'The pipeline runs in the production worker context',
      status: 'fail',
      detail: cause instanceof Error ? cause.message : String(cause),
    }
  }
}

/** Loads the output through a real video element and always releases its blob URL. */
async function canLoadVideo(file: File): Promise<boolean> {
  const element = document.createElement('video')
  const objectUrl = URL.createObjectURL(file)

  try {
    return await new Promise<boolean>((resolve) => {
      const finish = (playable: boolean): void => {
        clearTimeout(timer)
        element.onloadedmetadata = null
        element.onerror = null
        resolve(playable)
      }
      const timer = setTimeout(() => finish(false), 8000)
      element.onloadedmetadata = () => finish(element.videoWidth > 0)
      element.onerror = () => finish(false)
      element.src = objectUrl
    })
  } finally {
    element.onloadedmetadata = null
    element.onerror = null
    element.removeAttribute('src')
    element.load()
    URL.revokeObjectURL(objectUrl)
  }
}

/** Criterion 5, on material where the two presets can actually differ. */
async function checkPresetSeparation(log: Report): Promise<Check> {
  log('  encoding camera-like motion at both presets')
  const workspaces: OpfsWorkspace[] = []
  try {
    // Camera-like on purpose. On the default screen-like fixture H.264 predicts
    // almost everything for free, both presets land within a few percent of
    // each other, and the comparison measures nothing.
    const fixture = await buildFixture({
      width: 1280,
      height: 720,
      seconds: 4,
      frameRate: 25,
      cameraMotion: true,
      audio: { startPeakDbfs: -20 },
    })
    const best = await process(fixture, {
      presetId: 'best',
      branding: { opening: false, closing: false },
      jobId: 'acceptance-preset-best',
    })
    workspaces.push(best.workspace)
    const smaller = await process(fixture, {
      presetId: 'smaller',
      branding: { opening: false, closing: false },
      jobId: 'acceptance-preset-smaller',
    })
    workspaces.push(smaller.workspace)

    const ratio = smaller.file.size / best.file.size
    log(
      `  best ${(best.file.size / 1024).toFixed(0)} kB, smaller ${(smaller.file.size / 1024).toFixed(0)} kB (${(ratio * 100).toFixed(0)}%)`,
    )
    const ok = smaller.file.size < best.file.size
    return {
      criterion: '5',
      title: 'The smaller preset is actually smaller on camera-like motion',
      status: ok ? 'pass' : 'fail',
      detail: ok
        ? `Smaller is ${(ratio * 100).toFixed(0)}% of best (${(smaller.file.size / 1024).toFixed(0)} kB against ${(best.file.size / 1024).toFixed(0)} kB) at the same resolution, which is where spec 6.2 says the saving must come from. Whether text stays legible still needs a person and real slides (VH-M1).`
        : `Smaller came out at ${(ratio * 100).toFixed(0)}% of best, which is not smaller.`,
    }
  } catch (cause) {
    return {
      criterion: '5',
      title: 'The smaller preset is actually smaller on camera-like motion',
      status: 'fail',
      detail: cause instanceof Error ? cause.message : String(cause),
    }
  } finally {
    for (const workspace of workspaces) await workspace.dispose()
  }
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
  const measurements: OutputLoudnessMeasurement[] = []
  const missing: string[] = []

  for (const [index, entry] of corpus.entries()) {
    log(`  measuring: ${entry.name}`)
    const fixture = await buildFixture({
      width: 640,
      height: 360,
      seconds: 70,
      frameRate: 25,
      audio: entry.audio,
    })
    const produced = await process(fixture, {
      presetId: 'best',
      branding: { opening: true, closing: true },
      jobId: `acceptance-loudness-${index}`,
    })
    try {
      // Integrated loudness is source content only; include its exact start and
      // end so boundary loss cannot hide behind a one-second crop. True peak is
      // measured over the complete finalized output, including both joins and
      // the final samples.
      const content = await measureLoudness(produced.file, {
        fromSeconds: produced.openingSeconds,
        toSeconds: produced.openingSeconds + 70,
      })
      const completeOutput = await measureLoudness(produced.file)
      if (!content || !content.coverage || !completeOutput) {
        missing.push(entry.name)
        continue
      }

      const measurement = {
        integratedLufs: content.integratedLufs,
        truePeakDbtp: completeOutput.truePeakDbtp,
        contentFrames: content.coverage.coveredFrames,
        expectedContentFrames: content.coverage.expectedFrames,
        contentCoverageComplete: content.coverage.complete,
      }
      measurements.push(measurement)
      results.push(
        `${entry.name}: ${measurement.integratedLufs.toFixed(2)} LUFS, peak ${measurement.truePeakDbtp.toFixed(2)} dBTP, content ${measurement.contentFrames}/${measurement.expectedContentFrames} frames${measurement.contentCoverageComplete ? '' : ' (incomplete)'}`,
      )
    } finally {
      await produced.workspace.dispose()
    }
  }

  const verdict = loudnessCorpusVerdict(
    measurements,
    corpus.length,
    TARGET_INTEGRATED_LUFS,
    INTEGRATED_TOLERANCE_LU,
    TRUE_PEAK_CEILING_DBTP,
  )
  const missingDetail = missing.length ? ` Missing decoded evidence: ${missing.join(', ')}.` : ''
  return {
    criterion: '2',
    title: 'Output is −16 ±0.5 LUFS and never exceeds −2.0 dBTP',
    status: verdict.pass ? 'pass' : 'fail',
    detail: `${verdict.measured}/${verdict.expected} decoded measurements and ${verdict.fullyCovered}/${verdict.expected} complete content regions. ${results.join('; ')}. Worst deviation ${verdict.worstDeviationLu.toFixed(2)} LU, highest peak ${Number.isFinite(verdict.highestPeakDbtp) ? verdict.highestPeakDbtp.toFixed(2) : 'not measured'} dBTP.${missingDetail}`,
  }
}

async function checkSync(log: Report): Promise<Check[]> {
  log('  building a variable-frame-rate fixture with paired markers')
  const fixture = await buildFixture({
    width: 854,
    height: 480,
    seconds: 60,
    frameRate: 25,
    variableFrameRate: true,
    audio: { startPeakDbfs: -20, syncMarkers: true },
  })
  const expected = syncMarkerTimes(60)

  // Measured before processing too: a fixture cannot place a marker more
  // precisely than its own frame grid, and that error is not the pipeline's.
  const sourceSync = await measureSync(fixture)

  const produced = await process(fixture, {
    presetId: 'best',
    branding: { opening: false, closing: false },
    jobId: 'acceptance-sync',
  })
  try {
    const outputSync = await measureSync(produced.file)
    const sync = relativeSync(sourceSync, outputSync)
    const playable = await canLoadVideo(produced.file)

    const found = sync.paired
    const mean = sync.offsetsMs.length
      ? sync.offsetsMs.reduce((total, value) => total + value, 0) / sync.offsetsMs.length
      : 0
    const spread = sync.worstOffsetMs

    // Two different things were conflated in the first version of this check,
    // and separating them is the point rather than a relaxation.
    //
    // The SYSTEMATIC offset — the mean — is what perception responds to, and
    // what an encoder can get wrong. ITU-R BT.1359 puts audio-after-video
    // detection near +45 ms; this holds it to 10, which is strict.
    //
    // The per-marker SPREAD is frame quantisation. A source frame can only be
    // shown when the output grid allows, so a marker lands within half a frame
    // period of its true time — +/-20 ms at 25 fps — and no amount of correct
    // encoding removes that. Asserting better than one frame would be asserting
    // something that cannot exist. On a constant-frame-rate source, where the
    // grids align, the same measurement reads 0.0 ms at every marker.
    //
    // Both are reported either way, so a regression in either is visible.
    const outputFramePeriodMs = 1000 / 25
    const syncPass =
      found >= expected.length &&
      Math.abs(mean) <= 10 &&
      Math.abs(sync.driftMs) <= 10 &&
      spread <= outputFramePeriodMs

    return [
      {
        criterion: '6',
        title: 'A variable-frame-rate source keeps sound and picture in step',
        status: syncPass ? 'pass' : 'fail',
        detail: `${found} of ${expected.length} markers paired. Systematic offset ${mean.toFixed(1)} ms (limit 10), drift ${sync.driftMs.toFixed(1)} ms (limit 10), spread ${spread.toFixed(1)} ms (bounded by the ${outputFramePeriodMs.toFixed(0)} ms output frame period). Per marker: ${sync.offsetsMs.map((v) => v.toFixed(1)).join(', ')} ms.`,
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
  } finally {
    await produced.workspace.dispose()
  }
}

export interface DirectoryKeySource {
  keys(): AsyncIterableIterator<string>
}

/** Counts observable entries and propagates enumeration failure as absent evidence. */
export async function countDirectoryEntries(directory: DirectoryKeySource): Promise<number> {
  let count = 0
  for await (const name of directory.keys()) if (name) count++
  return count
}

/** Encoding is the first stage that proves a partial output writer exists. */
export function cancellationStageHasPartialOutput(stage: string): boolean {
  return stage === 'encoding'
}

async function checkCancellation(log: Report): Promise<Check> {
  log('  starting a production-worker job and cancelling it during encoding')
  const fixture = await buildFixture({
    width: 854,
    height: 480,
    seconds: 60,
    frameRate: 25,
    audio: { startPeakDbfs: -20 },
  })

  const worker = new Worker(new URL('../workers/job.worker.ts', import.meta.url), {
    type: 'module',
    name: 'uon-acceptance-cancel',
  })
  const processId = 1
  let retainedJobId: string | null = null

  try {
    const root = await navigator.storage.getDirectory()
    const countJobs = async (): Promise<number> => {
      const directory = await root.getDirectoryHandle(ROOT_DIRECTORY, { create: true })
      return countDirectoryEntries(directory)
    }

    await sweepOrphanedJobs()
    const before = await countJobs()
    let during = before

    const terminal = await new Promise<WorkerOutbound>((resolve, reject) => {
      let cancelSent = false
      const cleanup = (): void => {
        clearTimeout(timer)
        worker.removeEventListener('message', onMessage)
        worker.removeEventListener('error', onError)
      }
      const fail = (cause: unknown): void => {
        cleanup()
        reject(cause instanceof Error ? cause : new Error(String(cause)))
      }
      const onMessage = (event: MessageEvent<WorkerOutbound>): void => {
        const message = event.data
        if (message.kind === 'uncaught') {
          fail(new Error(`the worker threw: ${message.error.message}`))
          return
        }
        if (message.id !== processId) return
        if (message.kind === 'stage') {
          if (!cancelSent && cancellationStageHasPartialOutput(message.stage)) {
            cancelSent = true
            void countJobs().then((count) => {
              during = count
              worker.postMessage({
                kind: 'cancel',
                id: 2,
                cancelId: processId,
              } satisfies WorkerRequest)
            }, fail)
          }
          return
        }
        cleanup()
        resolve(message)
      }
      const onError = (event: ErrorEvent): void => {
        fail(new Error(event.message || 'the worker failed'))
      }
      const timer = setTimeout(
        () => fail(new Error('the worker did not reach a cancellable stage and stop')),
        180_000,
      )

      worker.addEventListener('message', onMessage)
      worker.addEventListener('error', onError)
      worker.postMessage({
        kind: 'process',
        id: processId,
        file: fixture,
        presetId: 'best',
        selectionGeneration: 1,
        metadataReadFailureDisclosed: false,
        branding: { opening: false, closing: false },
        backgroundColour: '#000000',
      } satisfies WorkerRequest)
    })

    if (terminal.kind === 'processed') retainedJobId = terminal.jobId
    if (terminal.kind === 'failed' && terminal.retainedJobId) {
      retainedJobId = terminal.retainedJobId
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
    const after = await countJobs()

    const cancelled = terminal.kind === 'cancelled'
    const pass = cancelled && during > before && after === before
    return {
      criterion: '8',
      title: 'Cancelling leaves no partial file and no orphaned data',
      status: pass ? 'pass' : 'fail',
      detail: `Production-worker job directories before ${before}, during ${during}, after ${after}. Correlated worker cancellation reported: ${cancelled}. The worker's selected OPFS writer is not surfaced, so the sync-access-handle branch remains part of the real-device rehearsal.`,
    }
  } catch (cause) {
    return {
      criterion: '8',
      title: 'Cancelling leaves no partial file and no orphaned data',
      status: 'fail',
      detail: `Cleanup could not be proved because OPFS enumeration or recovery failed: ${cause instanceof Error ? cause.message : String(cause)}.`,
    }
  } finally {
    if (retainedJobId) {
      try {
        await discardWorkerResult(worker, retainedJobId)
      } catch {
        // The failed or incomplete cleanup is already reflected by criterion 8.
      }
    }
    worker.terminate()
  }
}

/** Runs the whole suite. */
export async function runAcceptance(log: Report): Promise<AcceptanceReport> {
  const startedAt = performance.now()
  const checks: Check[] = []

  const egress = new EgressWatch()
  let report: EgressReport
  try {
    egress.start()

    log('Criterion 2 — loudness and true peak across a corpus')
    checks.push(await checkLoudnessCorpus(log))

    log('Criterion 6 — A/V sync on a variable-frame-rate source')
    checks.push(...(await checkSync(log)))

    log('Criterion 8 — cancellation')
    checks.push(await checkCancellation(log))

    log('Criterion 1 — the worker path')
    checks.push(await checkWorkerPath(log))

    log('Criterion 5 — preset separation')
    checks.push(await checkPresetSeparation(log))
  } finally {
    report = egress.stop()
  }

  log('Criterion 9 — media egress')
  checks.push({
    criterion: '9',
    title: 'Nothing leaves the device',
    status: report.withBody.length === 0 && report.crossOrigin.length === 0 ? 'manual' : 'fail',
    detail: `${report.allRequests.length} observed requests. Cross-origin: ${report.crossOrigin.length}. With a body: ${report.withBody.length}. A clean main-thread observer is not proof of worker traffic; confirm criterion 9 in browser network tools for the same run.`,
  })

  // Covered elsewhere, named here so the picture is complete rather than
  // flattering.
  checks.push({
    criterion: '3',
    title: 'The meter matches EBU Tech 3341 within ±0.1 LU',
    status: 'manual',
    detail:
      'External evidence from `npm run check`, not a measurement made by this browser run. The latest gate reports a 0.021 LU worst error; cases 7 and 8 still require the EBU audio files and are skipped.',
  })
  checks.push({
    criterion: '4',
    title: 'No audible pumping on variable material',
    status: 'manual',
    detail:
      'The short-term plot side is asserted in src/audio/chain.test.ts — the chain adds under 1.5 LU to the worst one-second swing. The listening half needs a person and real material (VH-M1).',
  })
  checks.push({
    criterion: '5',
    title: 'Slide text stays legible in the smaller output',
    status: 'manual',
    detail:
      'The size half is now measured above, on camera-like motion. That resolution is preserved to 1080p is asserted in src/config/presets.test.ts. Whether text is legible to a person still needs real slides (VH-M1).',
  })
  checks.push({
    criterion: '7',
    title: 'Every block and warning triggers deliberately and reads clearly',
    status: 'manual',
    detail:
      'All four §7.3 outcomes and all seven §5.4 warnings are triggered in unit tests, and the wording is checked for jargon and blame. Whether it reads clearly to a lecturer needs a lecturer.',
  })

  return {
    checks,
    ranAt: new Date().toISOString(),
    seconds: (performance.now() - startedAt) / 1000,
  }
}
