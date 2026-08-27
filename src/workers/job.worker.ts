/**
 * The job worker.
 *
 * Today it proves the boundary works and that a throw in here is legible on
 * the other side. The pipeline (VH-6) lands in this module; the main thread
 * never gains a decode or encode path.
 */

import { installGlobalErrorCapture, type CapturedError } from '../core/diagnostics'
import { EgressWatch, type EgressReport } from '../core/egress'
import { getLogRecords, log, setMinimumLogLevel } from '../core/logger'
import {
  OUTPUT_SAMPLE_RATE,
  PRESETS,
  outputShapeFor,
  projectedOutputBytes,
  videoEncoderConfigFor,
  type PresetId,
} from '../config/presets'
import { SAVE_LEASE_LIMIT_MS } from '../config/thresholds'
import { detectSourceWarnings, type AudioWarning } from '../audio/warnings'
import { LONGEST_CLOSING_SECONDS, type BrandingChoice } from '../config/branding'
import { analyseSourceAudio } from '../media/audio-plan'
import { canEncodeAudio, checkEncodeSupport, inspectCapabilities } from '../media/capability'
import { UnreadableFileError, inspectFile, openInput } from '../media/inspect'
import { OpfsWorkspace, sweepOrphanedJobs } from '../media/opfs'
import { verifyOutputAudio } from '../media/output-verification'
import { CancelledError, runPipeline, throwIfAborted } from '../media/pipeline'
import { preflightVerdict, type PreflightSummary } from '../media/preflight'
import { InvalidVttError } from '../media/vtt'
import { calibrationProbe } from '../media/probe'
import { CancellationRegistry } from './cancellation'
import type { WorkerOutbound, WorkerRequest } from './protocol'

const bootAt = performance.now()

function post(message: WorkerOutbound): void {
  self.postMessage(message)
}

installGlobalErrorCapture('worker', (error: CapturedError) => {
  post({ kind: 'uncaught', error })
})

self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const request = event.data

  switch (request.kind) {
    case 'ping':
      log.debug('worker', 'ping received')
      post({ kind: 'pong', id: request.id, workerBootMs: Math.round(performance.now() - bootAt) })
      break

    case 'drainLogs':
      post({ kind: 'logs', id: request.id, records: getLogRecords() })
      break

    case 'throwTest':
      // Thrown asynchronously so it escapes this handler and reaches the
      // global hook — the same route a real pipeline failure would take.
      setTimeout(() => {
        throw new Error('Deliberate test error from inside the job worker')
      }, 0)
      break

    case 'inspect':
      void running.run(request.id, (signal) => handleInspect(request.id, request.file, signal))
      break

    case 'preflight':
      void running.run(request.id, (signal) =>
        handlePreflight(request.id, request.file, request.presetId, signal),
      )
      break

    case 'process':
      void running.run(request.id, (signal) => handleProcess(request.id, request, signal))
      break

    case 'cancel':
      if (!running.cancel(request.cancelId)) {
        log.debug('worker', 'cancel reached nothing', { cancelId: request.cancelId })
      }
      break

    case 'discard':
      void handleDiscard(request.id, request.jobId)
      break

    case 'lease':
      setLease(request.jobId, request.held)
      break

    case 'egress':
      post({ kind: 'egressed', id: request.id, report: setEgressWatch(request.watching) })
      break
  }
})

/**
 * In-flight requests, so `cancel` can reach the right one.
 *
 * Registration happens before the handler's first await — see
 * `cancellation.ts` for why that sentence is the whole point.
 */
const running = new CancellationRegistry()

/** Finished jobs whose scratch still holds a file the main thread may read. */
const finished = new Map<string, OpfsWorkspace>()

/**
 * The worker's own egress watch, for acceptance criterion 9.
 *
 * `fetch` and the resource timeline are per-realm, and the job runs here — so
 * the branding fetch, the only request this app makes at runtime, is invisible
 * to a watch on the main thread. The harness starts one here too and merges
 * the two (VH-62).
 */
let egressWatch: EgressWatch | null = null

const EMPTY_EGRESS = { withBody: [], allRequests: [], crossOrigin: [] } as const

function setEgressWatch(watching: boolean): EgressReport {
  if (watching) {
    egressWatch ??= new EgressWatch()
    egressWatch.start()
    return EMPTY_EGRESS
  }
  const report = egressWatch?.stop() ?? EMPTY_EGRESS
  egressWatch = null
  return report
}

// The worker has its own module scope, so `main.ts:32` does not reach it and
// every debug line the job emitted was reaching a production console (VH-40).
// The two threads share one diagnostics bundle, so they have to share a level
// or the bundle is half verbose and half not.
if (!import.meta.env.DEV) setMinimumLogLevel('info')

// A crashed or force-closed tab leaves scratch behind, and the user's disk is
// not ours to fill (AGENTS.md -> "OPFS working-store checklist").
//
// No argument, and that is now correct rather than an omission: OPFS is
// origin-scoped, so at boot this sees OTHER TABS' directories and knows none of
// their job ids. What protects them is the Web Lock each live job holds — see
// `sweepOrphanedJobs`. Passing this worker's own ids would be theatre; it has
// none yet (VH-35).
void sweepOrphanedJobs()

/**
 * Read leases on retained results, by job id.
 *
 * A save streams out of the job's scratch, and the scratch is what
 * {@link releaseFinished} disposes. Nothing stopped those overlapping, so a
 * second job could delete the file a `pipeTo()` was still reading (review
 * R-04). A lease is held for the length of a read and disposal waits for it.
 */
const leases = new Map<string, { readonly settled: Promise<void>; readonly release: () => void }>()

/**
 * Opens or closes a read lease on a finished job's scratch.
 *
 * The held promise is resolved by the matching release, or by
 * {@link SAVE_LEASE_LIMIT_MS} — a lease that outlives its reader must not
 * become a workspace nobody can ever dispose.
 */
function setLease(jobId: string, held: boolean): void {
  if (!held) {
    leases.get(jobId)?.release()
    leases.delete(jobId)
    return
  }
  if (leases.has(jobId)) return

  let release = (): void => {}
  const settled = new Promise<void>((resolve) => {
    const expiry = setTimeout(() => {
      log.warn('worker', 'save lease expired', { jobId })
      resolve()
    }, SAVE_LEASE_LIMIT_MS)
    release = () => {
      clearTimeout(expiry)
      resolve()
    }
  })
  leases.set(jobId, { settled, release })
}

/**
 * Releases every retained result, once nothing is reading it.
 *
 * A finished job's scratch is kept so the main thread can read the file out of
 * it, and `discard` normally releases it. But that depends on the UI getting
 * as far as saving, and a user who processes three files without saving any of
 * them would otherwise leave three full outputs on disk. Only the most recent
 * result can be saved, so only the most recent needs keeping.
 */
async function releaseFinished(): Promise<void> {
  const entries = [...finished.entries()]
  finished.clear()
  await Promise.all(
    entries.map(async ([jobId, workspace]) => {
      await leases.get(jobId)?.settled
      leases.delete(jobId)
      await workspace.dispose()
    }),
  )
}

async function handleProcess(
  id: number,
  options: {
    readonly file: Blob
    readonly presetId: PresetId
    readonly branding: BrandingChoice
    readonly backgroundColour: string
    readonly subtitleVtt?: string
  },
  signal: AbortSignal,
): Promise<void> {
  const { file, presetId } = options
  const jobId = `job-${id}`
  let workspace: OpfsWorkspace | null = null

  try {
    // Bound the retained set to one before adding to it. Inside the `try`, and
    // after the registry has registered the signal, because this can wait on
    // a save lease and a cancel during that wait used to vanish.
    await releaseFinished()
    throwIfAborted(signal)
    // Said BEFORE the inspection rather than after it. Reading the structure of
    // a multi-gigabyte file is slow, and since VH-38 made silence the signal
    // that a worker is wedged, a job that says nothing until the first frame is
    // encoded is a job that can be cancelled for being slow (VH-51).
    post({ kind: 'stage', id, stage: 'preparing', fraction: 0 })
    const report = await inspectFile(file, { signal })
    const preset = PRESETS[presetId]
    const shape = outputShapeFor(preset, {
      width: report.video.displayWidth,
      height: report.video.displayHeight,
      frameRate: report.video.conform.frameRate,
      videoBitrateBps: report.video.averageBitrateBps,
      // The rate the source ACTUALLY runs at, which is what its bitrate was
      // spread over. Conforming can move the rate (40 fps conforms to 30), and
      // dividing by the conformed one would misread the source's density.
      sourceFrameRate: report.video.conform.sourceFrameRate,
    })

    workspace = await OpfsWorkspace.open(jobId)
    const result = await runPipeline({
      input: openInput(file),
      shape,
      preset,
      videoDurationSeconds: report.video.durationSeconds,
      audioDurationSeconds: report.audio?.durationSeconds ?? null,
      workspace,
      branding: options.branding,
      backgroundColour: options.backgroundColour,
      ...(options.subtitleVtt ? { subtitleVtt: options.subtitleVtt } : {}),
      signal,
      onProgress: ({ stage, fraction }) => post({ kind: 'stage', id, stage, fraction }),
    })

    // The finished file is the only honest place to enforce criterion 2: the
    // limiter, resampler and AAC encoder all sit after the planning pass.
    // Anything the pipeline already knows it cost the user rides along.
    const outputWarnings: AudioWarning[] = [...result.outputWarnings]
    // Another window the encode loop's progress does not cover: this walks
    // the whole finished file (VH-51).
    post({ kind: 'stage', id, stage: 'finishing', fraction: 1 })
    // Cancel used to stop being heard the moment the pipeline returned, and
    // this walks the whole finished file again — long enough on an hour-long
    // lecture for the user to press Cancel and be told the video was ready.
    throwIfAborted(signal)
    const check = openInput(result.file)
    const checkTrack = await check.getPrimaryAudioTrack()
    if (report.audio) {
      const measured = checkTrack ? await analyseSourceAudio(checkTrack, signal) : null
      // A cancelled traversal stops early and returns a partial measurement,
      // which would then fail the contract and be reported as a broken output
      // rather than as the cancellation it is.
      throwIfAborted(signal)
      const verification = verifyOutputAudio(measured)
      if (!verification.ok) {
        log.warn('worker', 'output failed verification', {
          code: verification.code,
          integratedLufs: verification.integratedLufs,
          truePeakDbtp: verification.truePeakDbtp,
        })
        throw new Error(`Output audio failed verification: ${verification.code}`)
      }
      log.info('worker', 'output verified', {
        integratedLufs: Math.round(measured!.integratedLufs * 100) / 100,
        truePeakDbtp: Math.round(measured!.truePeakDbtp * 100) / 100,
        onTarget: true,
      })
    } else {
      log.info('worker', 'output verified', { audio: 'not-applicable' })
    }

    // The last commit boundary: after this the main thread owns a result and
    // the workspace behind it is retained rather than swept.
    throwIfAborted(signal)
    finished.set(jobId, workspace)
    post({
      kind: 'processed',
      id,
      jobId,
      file: result.file,
      brandingApplied: result.brandingApplied,
      brandingRequested: options.branding,
      subtitleCues: result.subtitleCues,
      outputWarnings,
    })
  } catch (cause) {
    // runPipeline disposes its own workspace on failure; this covers a failure
    // before it ever started, and a cancel landing between `finished.set` and
    // the post — where the main thread never learns the workspace exists, so
    // nothing would ever discard it.
    finished.delete(jobId)
    leases.delete(jobId)
    if (workspace) await workspace.dispose()

    if (cause instanceof CancelledError || signal.aborted) {
      post({ kind: 'cancelled', id })
      return
    }
    const reason = cause instanceof Error ? cause.message : String(cause)
    log.warn('worker', 'processing failed', { reason })
    post({
      kind: 'failed',
      id,
      message:
        // A bad sidecar names itself. `offsetVtt` throws here and nowhere else
        // — `pipeline.ts` is the only caller — yet this was the one handler
        // that did not check for it, so "your subtitle file is not valid
        // WebVTT" reached the user as "something went wrong" (VH-37).
        cause instanceof InvalidVttError || cause instanceof UnreadableFileError
          ? cause.message
          : // The user-facing sentence never changes. In development the
            // underlying reason is appended, because "something went wrong"
            // tells a maintainer nothing and this is the one place the real
            // cause is known.
            'Something went wrong while creating the video. Your original file has not been changed.' +
            (import.meta.env.DEV ? ` [dev: ${reason}]` : ''),
    })
  }
}

async function handleDiscard(id: number, jobId: string): Promise<void> {
  const workspace = finished.get(jobId)
  if (workspace) {
    // The caller normally discards only after its save has resolved, but a
    // lease is the thing that makes that a guarantee rather than an ordering.
    await leases.get(jobId)?.settled
    leases.delete(jobId)
    finished.delete(jobId)
    await workspace.dispose()
  }
  post({ kind: 'discarded', id })
}

/**
 * Reading a file the user chose is the one place a failure is expected rather
 * than exceptional — people do pick the wrong file. An unreadable file is
 * answered with a `failed` message the UI can show, not an uncaught throw.
 */
async function handleInspect(id: number, file: Blob, signal: AbortSignal): Promise<void> {
  try {
    const report = await inspectFile(file, { signal })
    // The commit boundary. A report for a file the user has moved on from is
    // not a result, it is a screen describing the wrong thing.
    throwIfAborted(signal)
    post({ kind: 'inspected', id, report })
  } catch (cause) {
    if (cause instanceof CancelledError || signal.aborted) {
      post({ kind: 'cancelled', id })
      return
    }
    const message =
      cause instanceof UnreadableFileError
        ? cause.message
        : 'Something went wrong reading this file. It may be corrupted, or in a format this tool cannot read.'
    log.warn('worker', 'inspection failed', {
      reason: cause instanceof Error ? cause.message : String(cause),
    })
    post({ kind: 'failed', id, message })
  }
}

log.info('worker', 'job worker ready')

/**
 * Checks the device against this exact job, then measures it.
 *
 * Order matters: capability first, because there is no point spending three
 * seconds probing an encoder the browser has already said it cannot provide.
 */
async function handlePreflight(
  id: number,
  file: Blob,
  presetId: PresetId,
  signal: AbortSignal,
): Promise<void> {
  try {
    const report = await inspectFile(file, { signal })
    const preset = PRESETS[presetId]
    const shape = outputShapeFor(preset, {
      width: report.video.displayWidth,
      height: report.video.displayHeight,
      frameRate: report.video.conform.frameRate,
      videoBitrateBps: report.video.averageBitrateBps,
      // The rate the source ACTUALLY runs at, which is what its bitrate was
      // spread over. Conforming can move the rate (40 fps conforms to 30), and
      // dividing by the conformed one would misread the source's density.
      sourceFrameRate: report.video.conform.sourceFrameRate,
    })
    // The SOURCE duration plus the longest closing. The output is longer than
    // the source by whatever branding is appended, and the estimate used to
    // multiply by the source alone — omitting the tail outright, about 3% on a
    // 130 s lecture, and part of why four real "Smaller file" jobs produced a
    // file bigger than the number the user had decided on. The mode is not
    // known here, so an upper bound assumes the longest (VH-31).
    const projected = projectedOutputBytes(
      shape,
      report.durationSeconds + LONGEST_CLOSING_SECONDS,
      report.audio !== null,
    )

    const [capability, encode, canEncodeAac] = await Promise.all([
      inspectCapabilities(),
      checkEncodeSupport(videoEncoderConfigFor(shape)),
      // A silent source asks nothing of the audio encoder, so it cannot be
      // blocked by one. Everything else asks for the exact configuration the
      // job will use, at the source's own channel count — the figure differs
      // between mono and stereo, and so might the answer.
      report.audio
        ? canEncodeAudio({
            codec: 'mp4a.40.2',
            sampleRate: OUTPUT_SAMPLE_RATE,
            numberOfChannels: report.audio.channelCount,
            bitrate:
              report.audio.channelCount <= 1
                ? preset.audioBitrateMonoBps
                : preset.audioBitrateStereoBps,
          })
        : Promise.resolve(true),
    ])

    // Spec 5.4: derived from the analysis pass and shown BEFORE processing.
    // A lecturer who is told their recording is inaudible only after waiting
    // forty minutes has been told too late.
    throwIfAborted(signal)
    const audioInput = openInput(file)
    const audioTrack = await audioInput.getPrimaryAudioTrack()
    const audioWarnings = detectSourceWarnings(
      audioTrack ? await analyseSourceAudio(audioTrack, signal) : null,
    )
    // `analyseSourceAudio` stops at the next sample rather than throwing, so
    // an aborted traversal returns a report of PART of the file. Warnings
    // derived from half a lecture are worse than none.
    throwIfAborted(signal)

    const probe =
      capability.hasWebCodecs && encode.supported
        ? await calibrationProbe({
            input: openInput(file),
            shape,
            durationSeconds: report.durationSeconds,
            signal,
          })
        : { measured: false, framesEncoded: 0, videoFramesPerSecond: 0, audioRealtimeFactor: null, estimatedSeconds: null }

    const summary: PreflightSummary = {
      presetId,
      capability,
      encode,
      probe,
      shape,
      projectedOutputBytes: projected,
      audioWarnings,
      verdict: preflightVerdict({
        hasWebCodecs: capability.hasWebCodecs,
        hasOpfs: capability.hasOpfs,
        isSecureContext: capability.isSecureContext,
        // Both tracks, and a silent source asks nothing of the audio decoder.
        // Measured during inspection and, until VH-60, never consulted again.
        canDecodeSource: report.video.canDecode && (report.audio?.canDecode ?? true),
        canEncodeH264: encode.supported,
        canEncodeAac,
        availableStorageBytes: capability.storage.availableBytes,
        projectedOutputBytes: projected,
        isMobileDevice: capability.deviceClass === 'mobile',
        estimatedSeconds: probe.estimatedSeconds,
      }),
    }
    throwIfAborted(signal)
    post({ kind: 'preflighted', id, summary })
  } catch (cause) {
    if (cause instanceof CancelledError || signal.aborted) {
      post({ kind: 'cancelled', id })
      return
    }
    const message =
      cause instanceof UnreadableFileError
        ? cause.message
        : 'Something went wrong checking this file against your device.'
    log.warn('worker', 'preflight failed', {
      reason: cause instanceof Error ? cause.message : String(cause),
    })
    post({ kind: 'failed', id, message })
  }
}
