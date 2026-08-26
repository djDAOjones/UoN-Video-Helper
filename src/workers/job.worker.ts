/**
 * The job worker.
 *
 * Today it proves the boundary works and that a throw in here is legible on
 * the other side. The pipeline (VH-6) lands in this module; the main thread
 * never gains a decode or encode path.
 */

import { installGlobalErrorCapture, type CapturedError } from '../core/diagnostics'
import { getLogRecords, log, setMinimumLogLevel } from '../core/logger'
import {
  OUTPUT_SAMPLE_RATE,
  PRESETS,
  outputShapeFor,
  projectedOutputBytes,
  videoEncoderConfigFor,
  type PresetId,
} from '../config/presets'
import { detectOutputWarning, detectSourceWarnings, type AudioWarning } from '../audio/warnings'
import { TARGET_INTEGRATED_LUFS } from '../config/audio'
import type { BrandingChoice } from '../config/branding'
import { analyseSourceAudio } from '../media/audio-plan'
import { canEncodeAudio, checkEncodeSupport, inspectCapabilities } from '../media/capability'
import { UnreadableFileError, inspectFile, openInput } from '../media/inspect'
import { OpfsWorkspace, sweepOrphanedJobs } from '../media/opfs'
import { CancelledError, runPipeline } from '../media/pipeline'
import { preflightVerdict, type PreflightSummary } from '../media/preflight'
import { InvalidVttError } from '../media/vtt'
import { calibrationProbe } from '../media/probe'
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
      void handleInspect(request.id, request.file)
      break

    case 'preflight':
      void handlePreflight(request.id, request.file, request.presetId)
      break

    case 'process':
      void handleProcess(request.id, request)
      break

    case 'cancel':
      running.get(request.cancelId)?.abort()
      break

    case 'discard':
      void handleDiscard(request.id, request.jobId)
      break
  }
})

/** In-flight jobs, so `cancel` can reach the right one. */
const running = new Map<number, AbortController>()
/** Finished jobs whose scratch still holds a file the main thread may read. */
const finished = new Map<string, OpfsWorkspace>()

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
 * Releases every retained result.
 *
 * A finished job's scratch is kept so the main thread can read the file out of
 * it, and `discard` normally releases it. But that depends on the UI getting
 * as far as saving, and a user who processes three files without saving any of
 * them would otherwise leave three full outputs on disk. Only the most recent
 * result can be saved, so only the most recent needs keeping.
 */
async function releaseFinished(): Promise<void> {
  const workspaces = [...finished.values()]
  finished.clear()
  await Promise.all(workspaces.map((workspace) => workspace.dispose()))
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
): Promise<void> {
  const { file, presetId } = options
  // Bound the retained set to one before adding to it.
  await releaseFinished()

  const controller = new AbortController()
  running.set(id, controller)
  const jobId = `job-${id}`
  let workspace: OpfsWorkspace | null = null

  try {
    const report = await inspectFile(file)
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
      signal: controller.signal,
      onProgress: ({ stage, fraction }) => post({ kind: 'stage', id, stage, fraction }),
    })

    // Spec 5.4's last row: did the output actually land on target? It is the
    // only warning that cannot be known in advance, and the only honest way to
    // answer it is to measure the finished file rather than trust the plan.
    const outputWarnings: AudioWarning[] = []
    try {
      const check = openInput(result.file)
      const checkTrack = await check.getPrimaryAudioTrack()
      if (checkTrack) {
        const measured = await analyseSourceAudio(checkTrack)
        const missed = detectOutputWarning(measured.integratedLufs, TARGET_INTEGRATED_LUFS)
        if (missed) outputWarnings.push(missed)
        log.info('worker', 'output verified', {
          integratedLufs: Math.round(measured.integratedLufs * 100) / 100,
          truePeakDbtp: Math.round(measured.truePeakDbtp * 100) / 100,
          onTarget: missed === null,
        })
      }
    } catch (cause) {
      // A check that fails costs a warning, never the result.
      log.warn('worker', 'could not verify the output', {
        reason: cause instanceof Error ? cause.message : String(cause),
      })
    }

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
    // before it ever started.
    if (workspace && !finished.has(jobId)) await workspace.dispose()

    if (cause instanceof CancelledError || controller.signal.aborted) {
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
  } finally {
    running.delete(id)
  }
}

async function handleDiscard(id: number, jobId: string): Promise<void> {
  const workspace = finished.get(jobId)
  if (workspace) {
    await workspace.dispose()
    finished.delete(jobId)
  }
  post({ kind: 'discarded', id })
}

/**
 * Reading a file the user chose is the one place a failure is expected rather
 * than exceptional — people do pick the wrong file. An unreadable file is
 * answered with a `failed` message the UI can show, not an uncaught throw.
 */
async function handleInspect(id: number, file: Blob): Promise<void> {
  try {
    post({ kind: 'inspected', id, report: await inspectFile(file) })
  } catch (cause) {
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
): Promise<void> {
  try {
    const report = await inspectFile(file)
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
    const projected = projectedOutputBytes(shape, report.durationSeconds)

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
    const audioInput = openInput(file)
    const audioTrack = await audioInput.getPrimaryAudioTrack()
    const audioWarnings = detectSourceWarnings(
      audioTrack ? await analyseSourceAudio(audioTrack) : null,
    )

    const probe =
      capability.hasWebCodecs && encode.supported
        ? await calibrationProbe({
            input: openInput(file),
            shape,
            durationSeconds: report.durationSeconds,
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
        canEncodeH264: encode.supported,
        canEncodeAac,
        availableStorageBytes: capability.storage.availableBytes,
        projectedOutputBytes: projected,
        isMobileDevice: capability.deviceClass === 'mobile',
        estimatedSeconds: probe.estimatedSeconds,
      }),
    }
    post({ kind: 'preflighted', id, summary })
  } catch (cause) {
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
