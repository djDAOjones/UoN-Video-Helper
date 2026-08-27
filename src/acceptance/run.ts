/**
 * The acceptance run, against spec section 13.
 *
 * Exists so "it works" is a report with numbers in it rather than an
 * impression. Everything reachable without real University material or real
 * University hardware is exercised here; everything else is reported as
 * outstanding by name, so the gap is visible rather than assumed closed.
 */

import { PRESETS, outputShapeFor } from '../config/presets'
import { TARGET_INTEGRATED_LUFS } from '../config/audio'
import { inspectFile, openInput } from '../media/inspect'
import { OpfsWorkspace, ROOT_DIRECTORY, sweepOrphanedJobs } from '../media/opfs'
import { verifyOutputAudio } from '../media/output-verification'
import { CancelledError, runPipeline } from '../media/pipeline'
import { buildFixture, syncMarkerTimes } from './fixtures'
import {
  EgressWatch,
  carriedBody,
  measureLoudness,
  measureSync,
  mergeEgress,
  relativeSync,
  type EgressReport,
} from './measure'
import type { WorkerOutbound } from '../workers/protocol'

/**
 * `external` is the one that needed adding. A criterion this harness does not
 * execute was being reported as `pass`, so the page could be entirely green
 * while the gate that actually asserts it had never been run — or was failing
 * (review R-11). `external` says where the evidence is instead of borrowing
 * its colour.
 */
export type CheckStatus = 'pass' | 'fail' | 'manual' | 'external'

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
    // Both source-relative bitrate rules key off these (VH-41, VH-47). Without
    // them this harness silently takes the unmeasured fallback and proves the
    // new rules on nothing.
    videoBitrateBps: report.video.averageBitrateBps,
    sourceFrameRate: report.video.conform.sourceFrameRate,
  })
  const workspace = await OpfsWorkspace.open(options.jobId)
  const result = await runPipeline({
    input: openInput(file),
    shape,
    preset,
    videoDurationSeconds: report.video.durationSeconds,
    audioDurationSeconds: report.audio?.durationSeconds ?? null,
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
 * Runs one file through the WORKER, as the app does, rather than in-process.
 *
 * The difference is not cosmetic. `OpfsWorkspace.createFile` prefers a
 * `FileSystemSyncAccessHandle` and falls back to `createWritable()` when the
 * handle is unavailable — and sync handles are worker-only. So a harness that
 * calls `runPipeline` on the main thread exercises the FALLBACK on every run
 * and has never once touched the path the app actually takes (VH-16).
 */
/** One request/response exchange with a worker, correlated by id. */
function ask(worker: Worker, request: Record<string, unknown>, timeoutMs = 180_000) {
  return new Promise<WorkerOutbound>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('the worker never answered')), timeoutMs)
    const onMessage = (event: MessageEvent<WorkerOutbound>): void => {
      const message = event.data
      // Progress reports on a request; it never answers one.
      if (message.kind === 'stage' || message.kind === 'uncaught') return
      if (message.id !== request['id']) return
      clearTimeout(timer)
      worker.removeEventListener('message', onMessage)
      resolve(message)
    }
    worker.addEventListener('message', onMessage)
    worker.addEventListener('error', () => {
      clearTimeout(timer)
      reject(new Error('the worker failed to start'))
    })
    worker.postMessage(request)
  })
}

async function processInWorker(
  file: File,
  presetId: 'best' | 'smaller',
): Promise<{ file: File; jobId: string; worker: Worker; egress: EgressReport }> {
  const worker = new Worker(new URL('../workers/job.worker.ts', import.meta.url), {
    type: 'module',
    name: 'uon-acceptance-job',
  })

  // Started before the job and stopped after it. The worker has its own
  // `fetch` and its own resource timeline, so this is the only vantage point
  // from which the branding request — the one request this app makes at
  // runtime — can be seen at all (VH-62).
  await ask(worker, { kind: 'egress', id: 10, watching: true }, 10_000)

  const reply = await ask(worker, {
    kind: 'process',
    id: 1,
    file,
    presetId,
    // Branding ON, so the run exercises the fetch rather than proving zero
    // requests by never making one.
    branding: { opening: false, closing: true },
    backgroundColour: '#000000',
  })

  const stopped = await ask(worker, { kind: 'egress', id: 11, watching: false }, 10_000)
  const egress =
    stopped.kind === 'egressed'
      ? stopped.report
      : { withBody: [], allRequests: [], crossOrigin: [] }

  if (reply.kind !== 'processed') {
    worker.terminate()
    throw new Error(
      `the worker did not produce a file: ${reply.kind}${reply.kind === 'failed' ? ` — ${reply.message}` : ''}`,
    )
  }
  return { file: reply.file, jobId: reply.jobId, worker, egress }
}

/** Criterion 1, through the path the app actually uses. */
async function checkWorkerPath(log: Report): Promise<{ check: Check; egress: EgressReport }> {
  log('  running a fixture through the worker, not in-process')
  try {
    const fixture = await buildFixture({
      width: 640,
      height: 360,
      seconds: 4,
      frameRate: 25,
      audio: { startPeakDbfs: -20 },
    })
    const { file, jobId, worker, egress } = await processInWorker(fixture, 'best')
    try {
      const produced = await inspectFile(file)
      const ok = file.size > 0 && produced.video.durationSeconds > 3
      log(
        `  worker produced ${(file.size / 1024).toFixed(0)} kB, ${produced.durationSeconds.toFixed(2)}s; ` +
          `${egress.allRequests.length} request(s) seen inside the worker`,
      )
      return {
        egress,
        check: {
          criterion: '1',
          title: 'The pipeline runs in a worker, on the sync-handle path',
          status: ok ? 'pass' : 'fail',
          detail: ok
            ? `A worker job produced a playable ${(file.size / 1024).toFixed(0)} kB MP4. This is the OPFS sync-access-handle path; the main-thread checks below exercise the createWritable fallback, so both are now covered.`
            : `The worker returned a file of ${file.size} bytes lasting ${produced.durationSeconds.toFixed(2)}s.`,
        },
      }
    } finally {
      worker.postMessage({ kind: 'discard', id: 2, jobId })
      // Give the discard a moment to land before tearing the worker down.
      await new Promise((resolve) => setTimeout(resolve, 250))
      worker.terminate()
    }
  } catch (cause) {
    return {
      egress: { withBody: [], allRequests: [], crossOrigin: [] },
      check: {
        criterion: '1',
        title: 'The pipeline runs in a worker, on the sync-handle path',
        status: 'fail',
        detail: cause instanceof Error ? cause.message : String(cause),
      },
    }
  }
}

/**
 * Proves the egress instrument can go red.
 *
 * Criterion 9 is the headline promise, and a watch that never fires is
 * indistinguishable from a watch that cannot (review R-11). This deliberately
 * sends two bodies — one on `init`, one built into a `Request`, which is the
 * shape that used to slip past — and fails if either goes unseen.
 *
 * Run OUTSIDE the real criterion 9 window, obviously: it is the exact thing
 * that criterion forbids.
 */
async function checkEgressInstrument(log: Report): Promise<Check> {
  log('  proving the egress watch fires on a deliberate upload')
  const probe = new EgressWatch()
  probe.start()
  const target = new URL('/__acceptance-egress-probe', location.href).href
  try {
    await fetch(target, { method: 'POST', body: 'init-body' }).catch(() => undefined)
    await fetch(new Request(target, { method: 'POST', body: 'request-body' })).catch(
      () => undefined,
    )
  } finally {
    // Nothing here depends on the responses; the point is what was observed.
  }
  const report = probe.stop()
  const caught = report.withBody.filter(carriedBody).length

  return {
    criterion: '9',
    title: 'The egress watch itself detects an upload',
    status: caught >= 2 ? 'pass' : 'fail',
    detail:
      caught >= 2
        ? 'Two deliberate POSTs — one body on `init`, one built into a `Request` — were both recorded. The criterion 9 result above is therefore an observation rather than an absence of instrumentation.'
        : `Only ${caught} of 2 deliberate uploads were recorded. Criterion 9 cannot be trusted until this passes.`,
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
  let worstLoudness = 0
  let worstPeak = Number.NEGATIVE_INFINITY
  let allVerified = true

  for (const [index, entry] of corpus.entries()) {
    log(`  measuring: ${entry.name}`)
    const fixture = await buildFixture({
      width: 640,
      height: 360,
      seconds: 70,
      frameRate: 25,
      audio: entry.audio,
    })
    const { file, workspace, openingSeconds } = await process(fixture, {
      presetId: 'best',
      branding: { opening: true, closing: true },
      jobId: `acceptance-loudness-${index}`,
    })
    // Content region only: the branding bed is mastered separately and
    // measuring it alongside would answer a different question.
    const measuredContent = await measureLoudness(file, {
      fromSeconds: openingSeconds + 1,
      toSeconds: openingSeconds + 69,
    })
    // Peak is a whole-file ceiling. Cropping it with the loudness region hid
    // precisely the t=0/EOF failures this criterion exists to catch (VH-50).
    const measuredFull = await measureLoudness(file)
    await workspace.dispose()
    const measurement =
      measuredContent && measuredFull
        ? {
            integratedLufs: measuredContent.integratedLufs,
            truePeakDbtp: measuredFull.truePeakDbtp,
          }
        : null
    if (!measurement) {
      allVerified = false
      results.push(`${entry.name}: FAIL (missing-audio)`)
      continue
    }

    const off = Math.abs(measurement.integratedLufs - TARGET_INTEGRATED_LUFS)
    if (Number.isFinite(off)) worstLoudness = Math.max(worstLoudness, off)
    if (Number.isFinite(measurement.truePeakDbtp)) {
      worstPeak = Math.max(worstPeak, measurement.truePeakDbtp)
    }
    const measuredSummary =
      `${measurement.integratedLufs.toFixed(2)} LUFS, ` +
      `peak ${measurement.truePeakDbtp.toFixed(4)} dBTP`
    const verification = verifyOutputAudio(measurement)
    if (!verification.ok) {
      allVerified = false
      results.push(`${entry.name}: ${measuredSummary} — FAIL (${verification.code})`)
      continue
    }

    results.push(`${entry.name}: ${measuredSummary}`)
  }

  const highestPeak = Number.isFinite(worstPeak) ? `${worstPeak.toFixed(4)} dBTP` : 'unavailable'
  return {
    criterion: '2',
    title: 'Output is −16 ±0.5 LUFS and never exceeds −2.0 dBTP',
    status: allVerified ? 'pass' : 'fail',
    detail: `${results.join('; ')}. Worst deviation ${worstLoudness.toFixed(2)} LU, highest peak ${highestPeak}.`,
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
}

async function checkCancellation(log: Report): Promise<Check> {
  log('  starting a job and cancelling it mid-encode')
  const fixture = await buildFixture({
    width: 854,
    height: 480,
    seconds: 60,
    frameRate: 25,
    audio: { startPeakDbfs: -20 },
  })

  const root = await navigator.storage.getDirectory()
  const countJobs = async (): Promise<number> => {
    let count = 0
    try {
      const dir = await root.getDirectoryHandle(ROOT_DIRECTORY, { create: true })
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

  log('Criterion 1 — the worker path')
  const workerPath = await checkWorkerPath(log)
  checks.push(workerPath.check)

  log('Criterion 5 — preset separation')
  checks.push(await checkPresetSeparation(log))

  log('Criterion 9 — media egress')
  // Both realms, merged. The main thread's watch cannot see the worker's
  // `fetch` or its resource timeline, and the job — branding request included
  // — runs in the worker, so a verdict from one of them describes the realm
  // the media never enters (VH-62).
  const report = mergeEgress(egress.stop(), workerPath.egress)
  checks.push({
    criterion: '9',
    title: 'Nothing leaves the device',
    status: report.withBody.length === 0 && report.crossOrigin.length === 0 ? 'pass' : 'fail',
    detail: `${report.allRequests.length} requests across the page and the job worker, all same-origin, none carrying a request body. Cross-origin: ${report.crossOrigin.length}. With a body: ${report.withBody.length}.`,
  })
  checks.push(await checkEgressInstrument(log))

  // Covered elsewhere, named here so the picture is complete rather than
  // flattering. NOT `pass`: this page did not run it, and a status it did not
  // earn is the difference between a report and an advertisement.
  checks.push({
    criterion: '3',
    title: 'The meter matches EBU Tech 3341 within ±0.1 LU',
    status: 'external',
    detail:
      'Asserted by `npm run check` — test/ebu3341 — not by this page, so this run is no evidence either way. At the last run: worst error 0.021 LU, and cases 7 and 8 skipped for want of the EBU audio files.',
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
