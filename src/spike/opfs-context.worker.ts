/**
 * A second browser context for the OPFS lock rehearsal.
 *
 * Production holds and sweeps from dedicated workers in different tabs. The
 * page-level spike coordinates two instances of this module so a same-thread
 * lock result cannot masquerade as cross-context evidence.
 */

import { Mp4OutputFormat, Output } from 'mediabunny'

import { OpfsWorkspace, sweepOrphanedJobs, type OpfsWriterKind } from '../media/opfs'

type OpfsContextRequest =
  | { readonly id: number; readonly kind: 'hold'; readonly jobId: string }
  | { readonly id: number; readonly kind: 'sweep' }

export type OpfsContextResponse =
  | {
      readonly id: number
      readonly kind: 'held'
      readonly writerKind: OpfsWriterKind
      readonly syncAccessAdvertised: boolean
      readonly bytes: number
    }
  | { readonly id: number; readonly kind: 'swept'; readonly removed: number }
  | { readonly id: number; readonly kind: 'failed'; readonly message: string }

let heldWorkspace: OpfsWorkspace | null = null

function post(message: OpfsContextResponse): void {
  self.postMessage(message)
}

self.addEventListener('message', (event: MessageEvent<OpfsContextRequest>) => {
  const request = event.data
  void (async () => {
    try {
      if (request.kind === 'sweep') {
        post({ id: request.id, kind: 'swept', removed: await sweepOrphanedJobs() })
        return
      }

      if (heldWorkspace !== null) throw new Error('This context already holds a workspace')
      const workspace = await OpfsWorkspace.open(request.jobId)
      try {
        const outputFile = await workspace.createFile('scratch.mp4')
        // MP4 publicly permits zero tracks, so this exercises the real writer,
        // flush and close lifecycle without involving a codec or media fixture.
        const output = new Output({
          format: new Mp4OutputFormat({ fastStart: false }),
          target: outputFile.target,
        })
        await output.start()
        await output.finalize()
        const file = await outputFile.finish(output)
        heldWorkspace = workspace
        post({
          id: request.id,
          kind: 'held',
          writerKind: outputFile.writerKind,
          syncAccessAdvertised: outputFile.syncAccessAdvertised,
          bytes: file.size,
        })
      } catch (cause) {
        await workspace.dispose().catch(() => undefined)
        throw cause
      }
    } catch (cause) {
      post({
        id: request.id,
        kind: 'failed',
        message: cause instanceof Error ? cause.message : String(cause),
      })
    }
  })()
})
