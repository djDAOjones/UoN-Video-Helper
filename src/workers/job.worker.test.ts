import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import type { WorkerOutbound, WorkerRequest } from './protocol'

const inspectSource = vi.hoisted(() => vi.fn())
const postMessage = vi.hoisted(() => vi.fn())

vi.mock('../core/diagnostics', () => ({
  installGlobalErrorCapture: vi.fn(),
}))

vi.mock('../core/logger', () => ({
  getLogRecords: vi.fn(() => []),
  log: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  setMinimumLogLevel: vi.fn(),
}))

vi.mock('../media/inspect', () => ({
  UnreadableFileError: class UnreadableFileError extends Error {},
  inspectSource,
  openInput: vi.fn(),
}))

vi.mock('../media/opfs', () => ({
  OpfsWorkspace: class OpfsWorkspace {},
  sweepOrphanedJobs: vi.fn(() => Promise.resolve()),
}))

vi.mock('../media/pipeline', () => {
  class CancelledError extends Error {}
  return {
    CancelledError,
    runPipeline: vi.fn(),
    throwIfAborted: (signal: AbortSignal) => {
      if (signal.aborted) throw new CancelledError()
    },
  }
})

vi.mock('../media/probe', () => ({
  calibrationProbe: vi.fn(),
  PROBE_NOT_RUN: {
    videoSupport: 'not-run',
    failureStage: null,
    measured: false,
    framesEncoded: 0,
    videoFramesPerSecond: 0,
    audioRealtimeFactor: null,
    estimatedSeconds: null,
  },
}))

interface Deferred<T> {
  readonly promise: Promise<T>
  readonly resolve: (value: T) => void
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((settle) => {
    resolve = settle
  })
  return { promise, resolve }
}

describe('job worker inspection lane', () => {
  let onMessage: ((event: MessageEvent<WorkerRequest>) => void) | undefined

  beforeAll(async () => {
    vi.stubGlobal('self', {
      postMessage,
      addEventListener: (type: string, listener: (event: MessageEvent<WorkerRequest>) => void) => {
        if (type === 'message') onMessage = listener
      },
    })
    await import('./job.worker')
  })

  afterAll(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('serializes non-abortable inspection and skips superseded queued work', async () => {
    const first = deferred<{ readonly report: object }>()
    const latest = deferred<{ readonly report: object }>()
    inspectSource.mockReset()
    inspectSource.mockImplementationOnce(() => first.promise)
    inspectSource.mockImplementationOnce(() => latest.promise)
    postMessage.mockClear()

    const firstFile = new Blob(['first'])
    const supersededFile = new Blob(['superseded'])
    const latestFile = new Blob(['latest'])
    const dispatch = (data: WorkerRequest): void => {
      if (!onMessage) throw new Error('worker message listener was not installed')
      onMessage({ data } as MessageEvent<WorkerRequest>)
    }

    dispatch({ kind: 'inspect', id: 1, file: firstFile })
    await vi.waitFor(() => expect(inspectSource).toHaveBeenCalledTimes(1))

    // Pre-flight and inspection share one physical lane. The third request
    // makes the queued second one stale before either may overlap the first.
    dispatch({
      kind: 'preflight',
      id: 2,
      file: supersededFile,
      presetId: 'best',
      selectionGeneration: 1,
    })
    dispatch({ kind: 'inspect', id: 3, file: latestFile })
    await Promise.resolve()
    expect(inspectSource).toHaveBeenCalledTimes(1)

    first.resolve({ report: { source: 'first' } })
    await vi.waitFor(() => expect(inspectSource).toHaveBeenCalledTimes(2))
    expect(inspectSource).toHaveBeenLastCalledWith(latestFile)

    latest.resolve({ report: { source: 'latest' } })
    await vi.waitFor(() => {
      expect(postMessage).toHaveBeenCalledWith({
        kind: 'inspected',
        id: 3,
        report: { source: 'latest' },
      })
    })

    const correlated = postMessage.mock.calls
      .map(([message]) => message as WorkerOutbound)
      .filter((message) => 'id' in message && message.id >= 1 && message.id <= 3)
    expect(correlated).toEqual([
      { kind: 'cancelled', id: 1 },
      { kind: 'cancelled', id: 2 },
      { kind: 'inspected', id: 3, report: { source: 'latest' } },
    ])
  })
})
