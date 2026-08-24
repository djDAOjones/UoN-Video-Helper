/**
 * The job worker.
 *
 * Today it proves the boundary works and that a throw in here is legible on
 * the other side. The pipeline (VH-6) lands in this module; the main thread
 * never gains a decode or encode path.
 */

import { installGlobalErrorCapture, type CapturedError } from '../core/diagnostics'
import { getLogRecords, log } from '../core/logger'
import {
  PRESETS,
  outputShapeFor,
  projectedOutputBytes,
  videoEncoderConfigFor,
  type PresetId,
} from '../config/presets'
import { checkEncodeSupport, inspectCapabilities } from '../media/capability'
import { ACCEPTED_FORMATS, UnreadableFileError, inspectFile } from '../media/inspect'
import { preflightVerdict, type PreflightSummary } from '../media/preflight'
import { calibrationProbe } from '../media/probe'
import { BlobSource, Input } from 'mediabunny'
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
      void handlePreflight(request.id, request.file, request.presetId, request.backgroundColour)
      break
  }
})

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
  backgroundColour: string,
): Promise<void> {
  try {
    const report = await inspectFile(file)
    const preset = PRESETS[presetId]
    const shape = outputShapeFor(preset, {
      width: report.video.displayWidth,
      height: report.video.displayHeight,
      frameRate: report.video.conform.frameRate,
    })
    const projected = projectedOutputBytes(shape, report.durationSeconds)

    const [capability, encode] = await Promise.all([
      inspectCapabilities(),
      checkEncodeSupport(videoEncoderConfigFor(shape)),
    ])

    const probe =
      capability.hasWebCodecs && encode.supported
        ? await calibrationProbe({
            input: new Input({ formats: ACCEPTED_FORMATS, source: new BlobSource(file) }),
            shape,
            durationSeconds: report.durationSeconds,
            backgroundColour,
          })
        : { measured: false, framesEncoded: 0, videoFramesPerSecond: 0, audioRealtimeFactor: null, estimatedSeconds: null }

    const summary: PreflightSummary = {
      presetId,
      capability,
      encode,
      probe,
      shape,
      projectedOutputBytes: projected,
      verdict: preflightVerdict({
        hasWebCodecs: capability.hasWebCodecs,
        canEncodeH264: encode.supported,
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
