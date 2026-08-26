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
  audioBitrateFor,
  outputSizeGuidanceBytes,
  outputShapeFor,
  projectedOutputBytes,
  videoEncoderConfigFor,
  type ContentClass,
  type PresetId,
} from '../config/presets'
import { detectOutputWarning, detectSourceWarnings, type AudioWarning } from '../audio/warnings'
import { TARGET_INTEGRATED_LUFS } from '../config/audio'
import {
  CLOSING_ONSET_SECONDS,
  CLOSING_TAIL_SECONDS,
  type BrandingChoice,
} from '../config/branding'
import { UnsupportedAudioTimelineError, analyseSourceAudio } from '../media/audio-plan'
import { canEncodeAudio, checkEncodeSupport, inspectCapabilities } from '../media/capability'
import { measureContentClass } from '../media/content-class'
import { UnreadableFileError, inspectSource, openInput } from '../media/inspect'
import { OpfsWorkspace, sweepOrphanedJobs } from '../media/opfs'
import {
  classifyOutputVerification,
  measureFinishedOutputAudio,
  type OutputVerification,
} from '../media/output-verification'
import { CancelledError, runPipeline, throwIfAborted } from '../media/pipeline'
import { preflightVerdict, type PreflightSummary } from '../media/preflight'
import { InvalidVttError } from '../media/vtt'
import { calibrationProbe, PROBE_NOT_RUN } from '../media/probe'
import { LatestRequest } from './latest-request'
import { OutputIntegrityError, requireReadableOutputVideo } from './output-integrity'
import type { WorkerOutbound, WorkerRequest } from './protocol'
import { releaseWorkspace } from './workspace-release'

type ProcessTerminal = Extract<WorkerOutbound, { kind: 'processed' | 'cancelled' | 'failed' }>

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
      scheduleCheck(request.id, (controller) => handleInspect(request.id, request.file, controller))
      break

    case 'preflight':
      scheduleCheck(request.id, (controller) =>
        handlePreflight(
          request.id,
          request.file,
          request.presetId,
          request.selectionGeneration,
          controller,
        ),
      )
      break

    case 'process':
      void handleProcess(request.id, request)
      break

    case 'cancel':
      running.get(request.cancelId)?.abort()
      checking.cancel(request.cancelId)
      break

    case 'discard':
      void handleDiscard(request.id, request.jobId)
      break
  }
})

/** In-flight jobs, so `cancel` can reach the right one. */
const running = new Map<number, AbortController>()
/** Inspection and pre-flight share one latest-only lane. */
const checking = new LatestRequest()
/**
 * Mediabunny inspection does not accept an AbortSignal. Keep one physical
 * inspection/pre-flight traversal active while newer requests synchronously
 * invalidate older results and wait their turn.
 */
let checkingTail: Promise<void> = Promise.resolve()
/** Last successful pre-flight's derived picture type, keyed to Start authority. */
let acceptedContentClass: {
  readonly selectionGeneration: number
  readonly presetId: PresetId
  readonly value: ContentClass
} | null = null
/** Finished jobs whose scratch still holds a file the main thread may read. */
const finished = new Map<string, OpfsWorkspace>()

function scheduleCheck(id: number, task: (controller: AbortController) => Promise<void>): void {
  const controller = checking.begin(id)
  const scheduled = checkingTail.then(() => task(controller))
  checkingTail = scheduled.catch((cause: unknown) => {
    // Both handlers own their correlated terminal response. This guard keeps
    // an unexpected implementation error from permanently rejecting the lane.
    log.error('worker', 'serialized device check escaped its handler', {
      reason: cause instanceof Error ? cause.message : String(cause),
    })
  })
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

async function handleProcess(
  id: number,
  options: {
    readonly file: Blob
    readonly presetId: PresetId
    readonly selectionGeneration: number
    readonly metadataReadFailureDisclosed: boolean
    readonly branding: BrandingChoice
    readonly backgroundColour: string
    readonly subtitleVtt?: string
  },
): Promise<void> {
  const { file, presetId } = options
  const controller = new AbortController()
  // Register synchronously, before the first await, so a cancel queued directly
  // after `process` cannot arrive while this request is still unreachable.
  running.set(id, controller)
  const jobId = `job-${id}`
  let workspace: OpfsWorkspace | null = null
  let terminalSent = false
  const postTerminal = (message: ProcessTerminal): void => {
    if (terminalSent) return
    post(message)
    terminalSent = true
  }

  try {
    // A retained File reads from its OPFS workspace. Starting another job must
    // never delete that workspace, and retaining two full outputs is forbidden;
    // the main thread normally prevents both cases, while this is the boundary
    // that preserves ownership if a stale or duplicate command gets through.
    if (finished.size > 0) {
      postTerminal({
        kind: 'failed',
        id,
        message: 'Save or discard the existing result before creating another video.',
      })
      return
    }
    if (running.size > 1) {
      postTerminal({
        kind: 'failed',
        id,
        message: 'A video is already being created. Wait for it to finish or cancel it first.',
      })
      return
    }

    log.info('worker', 'processing accepted selection', {
      selectionGeneration: options.selectionGeneration,
      presetId,
    })

    // Said BEFORE the inspection rather than after it. Reading the structure of
    // a multi-gigabyte file is slow, and since VH-38 made silence the signal
    // that a worker is wedged, a job that says nothing until the first frame is
    // encoded is a job that can be cancelled for being slow (VH-51).
    post({ kind: 'stage', id, stage: 'preparing', fraction: 0 })
    const inspected = await inspectSource(file)
    const { report } = inspected
    throwIfAborted(controller.signal)
    const preset = PRESETS[presetId]
    const contentClass =
      presetId === 'smaller' &&
      acceptedContentClass?.selectionGeneration === options.selectionGeneration &&
      acceptedContentClass.presetId === presetId
        ? acceptedContentClass.value
        : 'unknown'
    const shape = outputShapeFor(
      preset,
      {
        width: report.video.displayWidth,
        height: report.video.displayHeight,
        frameRate: report.video.conform.frameRate,
        videoBitrateBps: report.video.averageBitrateBps,
        // The rate the source ACTUALLY runs at, which is what its bitrate was
        // spread over. Conforming can move the rate (40 fps conforms to 30), and
        // dividing by the conformed one would misread the source's density.
        sourceFrameRate: report.video.conform.sourceFrameRate,
        audioChannelCount: report.audio?.channelCount ?? null,
      },
      contentClass,
    )
    log.info('worker', 'output shape selected', {
      contentClass,
      videoBitrateBps: shape.videoBitrateBps,
      bitrateBasis: shape.bitrateBasis,
    })

    workspace = await OpfsWorkspace.open(jobId)
    throwIfAborted(controller.signal)
    const result = await runPipeline({
      input: inspected.input,
      processingTracks: inspected.processingTracks,
      shape,
      preset,
      sourceTimeline: report.timeline,
      // Only the report the user actually saw may authorise lossy continuation.
      // This process-time inspection is hidden and cannot disclose a new loss.
      knownMetadataReadFailure: options.metadataReadFailureDisclosed,
      workspace,
      branding: options.branding,
      backgroundColour: options.backgroundColour,
      ...(options.subtitleVtt ? { subtitleVtt: options.subtitleVtt } : {}),
      signal: controller.signal,
      onProgress: ({ stage, fraction }) => post({ kind: 'stage', id, stage, fraction }),
    })
    throwIfAborted(controller.signal)

    // Spec 5.4's last row: did the output actually land on target? It is the
    // only warning that cannot be known in advance, and the only honest way to
    // answer it is to measure the finished file rather than trust the plan.
    const outputWarnings: AudioWarning[] = []
    const check = openInput(result.file)
    await requireReadableOutputVideo(check, controller.signal)
    throwIfAborted(controller.signal)
    let outputVerification: OutputVerification = report.audio
      ? { status: 'unverified', reason: 'measurement-failed' }
      : { status: 'not-applicable', reason: 'no-audio' }
    if (report.audio) {
      try {
        // Another window the encode loop's progress does not cover: this walks
        // the whole finished file (VH-51).
        post({ kind: 'stage', id, stage: 'finishing', fraction: 1 })
        const checkTrack = await check.getPrimaryAudioTrack()
        throwIfAborted(controller.signal)
        if (!checkTrack) {
          outputVerification = { status: 'unverified', reason: 'missing-audio-track' }
          log.warn('worker', 'finished output audio track is missing')
        } else {
          const measured = await measureFinishedOutputAudio(checkTrack, controller.signal)
          throwIfAborted(controller.signal)
          outputVerification = classifyOutputVerification(measured)

          // Kept deliberately separate from strict verification: spec 5.4's
          // user advisory fires only beyond 1 LU, while acceptance is +/-0.5.
          const missed = detectOutputWarning(measured.integratedLufs, TARGET_INTEGRATED_LUFS)
          if (missed) outputWarnings.push(missed)

          const details = {
            status: outputVerification.status,
            integratedLufs: Number.isFinite(measured.integratedLufs)
              ? Math.round(measured.integratedLufs * 100) / 100
              : null,
            truePeakDbtp: Number.isFinite(measured.truePeakDbtp)
              ? Math.round(measured.truePeakDbtp * 100) / 100
              : null,
          }
          if (outputVerification.status === 'passed') {
            log.info('worker', 'finished output audio verified', details)
          } else {
            log.warn('worker', 'finished output audio did not verify', details)
          }
        }
      } catch (cause) {
        if (cause instanceof CancelledError || controller.signal.aborted) {
          throw new CancelledError()
        }
        outputVerification = { status: 'unverified', reason: 'measurement-failed' }
        // A check that fails costs an explicit unverified result, never the file.
        log.warn('worker', 'could not verify the output', {
          reason: cause instanceof Error ? cause.message : String(cause),
        })
      }
    }

    throwIfAborted(controller.signal)
    // The guards above and the one-process worker contract make this a
    // single-entry map. Never replace or dispose an earlier retained result.
    finished.set(jobId, workspace)
    postTerminal({
      kind: 'processed',
      id,
      jobId,
      file: result.file,
      brandingApplied: result.brandingApplied,
      brandingRequested: options.branding,
      subtitleCues: result.subtitleCues,
      outputWarnings,
      outputVerification,
    })
  } catch (cause) {
    let cleanupFailure: unknown = null
    if (workspace && !finished.has(jobId)) {
      try {
        await workspace.dispose()
      } catch (disposeCause) {
        cleanupFailure = disposeCause
        // Disposal is explicitly retryable. Keep the exact workspace under
        // worker ownership and expose its id with the terminal response.
        finished.set(jobId, workspace)
      }
    }

    if (cleanupFailure !== null) {
      log.error('worker', 'temporary job files could not be removed', {
        reason:
          cleanupFailure instanceof Error
            ? cleanupFailure.message
            : typeof cleanupFailure === 'string'
              ? cleanupFailure
              : 'unknown cleanup failure',
      })
      postTerminal({
        kind: 'failed',
        id,
        retainedJobId: jobId,
        message: controller.signal.aborted
          ? 'The job stopped, but its temporary working files could not be removed. Try discarding them again before creating another video.'
          : 'The video could not be completed, and its temporary working files could not be removed. Try discarding them again before creating another video. Your original file has not been changed.',
      })
      return
    }

    if (cause instanceof CancelledError || controller.signal.aborted) {
      postTerminal({ kind: 'cancelled', id })
      return
    }
    const reason = cause instanceof Error ? cause.message : String(cause)
    log.warn('worker', 'processing failed', { reason })
    postTerminal({
      kind: 'failed',
      id,
      message:
        // A bad sidecar names itself. `offsetVtt` throws here and nowhere else
        // — `pipeline.ts` is the only caller — yet this was the one handler
        // that did not check for it, so "your subtitle file is not valid
        // WebVTT" reached the user as "something went wrong" (VH-37).
        cause instanceof InvalidVttError || cause instanceof UnreadableFileError
          ? cause.message
          : cause instanceof OutputIntegrityError
            ? 'The new video could not be verified, so it was not offered for saving. Your original file has not been changed.'
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
  try {
    await releaseWorkspace(finished, jobId)
    post({ kind: 'discarded', id })
  } catch (cause) {
    log.warn('worker', 'temporary result could not be discarded', {
      reason: cause instanceof Error ? cause.message : String(cause),
    })
    post({
      kind: 'failed',
      id,
      retainedJobId: jobId,
      message:
        'The temporary result could not be removed. It is still available; try discarding it again.',
    })
  }
}

/**
 * Reading a file the user chose is the one place a failure is expected rather
 * than exceptional — people do pick the wrong file. An unreadable file is
 * answered with a `failed` message the UI can show, not an uncaught throw.
 */
async function handleInspect(id: number, file: Blob, controller: AbortController): Promise<void> {
  try {
    // A request can be superseded while it waits behind a non-abortable
    // Mediabunny inspection. Do not start another traversal for stale work.
    throwIfAborted(controller.signal)
    const inspected = await inspectSource(file)
    throwIfAborted(controller.signal)
    post({ kind: 'inspected', id, report: inspected.report })
  } catch (cause) {
    if (controller.signal.aborted) {
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
  } finally {
    checking.finish(id, controller)
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
  selectionGeneration: number,
  controller: AbortController,
): Promise<void> {
  try {
    throwIfAborted(controller.signal)
    const inspected = await inspectSource(file)
    throwIfAborted(controller.signal)
    const { report, processingTracks } = inspected
    const preset = PRESETS[presetId]
    const sourceShape = {
      width: report.video.displayWidth,
      height: report.video.displayHeight,
      frameRate: report.video.conform.frameRate,
      videoBitrateBps: report.video.averageBitrateBps,
      // The rate the source ACTUALLY runs at, which is what its bitrate was
      // spread over. Conforming can move the rate (40 fps conforms to 30), and
      // dividing by the conformed one would misread the source's density.
      sourceFrameRate: report.video.conform.sourceFrameRate,
      audioChannelCount: report.audio?.channelCount ?? null,
    }

    const capabilityPromise = inspectCapabilities()
    // A silent source asks nothing of the audio encoder, so it cannot be
    // blocked by one. Everything else asks for the exact configuration the
    // job will use, at the source's own channel count — the figure differs
    // between mono and stereo, and so might the answer.
    const canEncodeAacPromise = report.audio
      ? canEncodeAudio({
          codec: 'mp4a.40.2',
          sampleRate: OUTPUT_SAMPLE_RATE,
          numberOfChannels: report.audio.channelCount,
          bitrate: audioBitrateFor(preset, report.audio.channelCount),
        })
      : Promise.resolve(true)
    const [capability, canEncodeAac] = await Promise.all([capabilityPromise, canEncodeAacPromise])
    throwIfAborted(controller.signal)

    const canMeasureContent =
      presetId === 'smaller' &&
      capability.isSecureContext &&
      capability.hasWebCodecs &&
      capability.canUseOpfs &&
      report.video.canDecode &&
      (report.audio?.canDecode ?? true) &&
      canEncodeAac &&
      processingTracks.video !== null
    const contentClass = canMeasureContent
      ? await measureContentClass(processingTracks.video, {
          firstTimestampSeconds: report.video.firstTimestampSeconds,
          endTimestampSeconds: report.video.endTimestampSeconds,
          width: report.video.displayWidth,
          height: report.video.displayHeight,
          sourceFrameRate: report.video.conform.sourceFrameRate,
          sourceBitrateBps: report.video.averageBitrateBps,
          signal: controller.signal,
        })
      : 'unknown'
    throwIfAborted(controller.signal)

    // The calibration probe must encode the exact bitrate the final job will
    // use, so the measured class precedes both shape and encoder support.
    const shape = outputShapeFor(preset, sourceShape, contentClass)
    // Pre-flight does not re-run when the user changes finishing touches. Use
    // the longest existing closing timeline so both figures remain cautious
    // whether closing is later unchecked or an overlay mode returns in VH-32.
    const planningDurationSeconds =
      report.durationSeconds + CLOSING_ONSET_SECONDS + CLOSING_TAIL_SECONDS
    const storageProjection = projectedOutputBytes(shape, planningDurationSeconds)
    const outputSizeGuidance = outputSizeGuidanceBytes(shape, planningDurationSeconds)

    const encode = await checkEncodeSupport(videoEncoderConfigFor(shape))
    throwIfAborted(controller.signal)

    const canRunMediaChecks =
      capability.isSecureContext &&
      capability.hasWebCodecs &&
      capability.canUseOpfs &&
      report.video.canDecode &&
      (report.audio?.canDecode ?? true) &&
      canEncodeAac

    // Spec 5.4: derived from the analysis pass and shown BEFORE processing.
    // A lecturer who is told their recording is inaudible only after waiting
    // forty minutes has been told too late.
    const audioWarnings = report.audio
      ? canRunMediaChecks && processingTracks.audio
        ? detectSourceWarnings(
            await analyseSourceAudio(processingTracks.audio, report.timeline, controller.signal),
          )
        : []
      : detectSourceWarnings(null)
    throwIfAborted(controller.signal)

    const probe = canRunMediaChecks
      ? await calibrationProbe({
          processingTracks,
          shape,
          videoWorkSeconds: Math.max(
            0,
            report.video.endTimestampSeconds - report.video.firstTimestampSeconds,
          ),
          signal: controller.signal,
        })
      : PROBE_NOT_RUN
    throwIfAborted(controller.signal)

    const summary: PreflightSummary = {
      presetId,
      contentClass,
      capability,
      encode,
      probe,
      shape,
      outputSizeGuidanceBytes: outputSizeGuidance,
      audioWarnings,
      verdict: preflightVerdict({
        isSecureContext: capability.isSecureContext,
        hasWebCodecs: capability.hasWebCodecs,
        canUseOpfs: capability.canUseOpfs,
        canDecodeVideo: report.video.canDecode,
        canDecodeAudio: report.audio?.canDecode ?? true,
        videoProbeStatus: probe.videoSupport,
        probeFailureStage: probe.failureStage,
        canEncodeAac,
        availableStorageBytes: capability.storage.availableBytes,
        projectedOutputBytes: storageProjection,
        isMobileDevice: capability.deviceClass === 'mobile',
        estimatedSeconds: probe.estimatedSeconds,
      }),
    }
    acceptedContentClass = { selectionGeneration, presetId, value: contentClass }
    post({ kind: 'preflighted', id, summary })
  } catch (cause) {
    if (controller.signal.aborted) {
      post({ kind: 'cancelled', id })
      return
    }
    const message =
      cause instanceof UnreadableFileError || cause instanceof UnsupportedAudioTimelineError
        ? cause.message
        : 'Something went wrong checking this file against your device.'
    log.warn('worker', 'preflight failed', {
      reason: cause instanceof Error ? cause.message : String(cause),
    })
    post({ kind: 'failed', id, message })
  } finally {
    checking.finish(id, controller)
  }
}
