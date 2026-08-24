/**
 * The job worker.
 *
 * Today it proves the boundary works and that a throw in here is legible on
 * the other side. The pipeline (VH-6) lands in this module; the main thread
 * never gains a decode or encode path.
 */

import { installGlobalErrorCapture, type CapturedError } from '../core/diagnostics'
import { getLogRecords, log } from '../core/logger'
import { UnreadableFileError, inspectFile } from '../media/inspect'
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
