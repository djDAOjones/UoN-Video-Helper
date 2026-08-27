/**
 * Finished jobs whose OPFS scratch is still holding a file the main thread may
 * read, and the leases that stop it being deleted while it is being read.
 *
 * Separated from `job.worker.ts` for the same reason `cancellation.ts` was:
 * importing the worker runs its boot, and the rules here are ordinary control
 * flow that is worth proving in Node. Two of them cost a user their work if
 * they are wrong, and both were (VH-56, VH-75).
 */

import { SAVE_LEASE_LIMIT_MS } from '../config/thresholds'
import { log } from '../core/logger'

/** Only what this needs of an `OpfsWorkspace`, so a test can pass two lines. */
export interface Disposable {
  dispose(): Promise<void>
}

interface Lease {
  readonly settled: Promise<void>
  readonly release: () => void
}

export class RetainedResults {
  private readonly workspaces = new Map<string, Disposable>()
  private readonly leases = new Map<string, Lease>()

  /** How many results are still held. */
  get size(): number {
    return this.workspaces.size
  }

  has(jobId: string): boolean {
    return this.workspaces.has(jobId)
  }

  retain(jobId: string, workspace: Disposable): void {
    this.workspaces.set(jobId, workspace)
  }

  /**
   * Drops a result WITHOUT disposing it, for a caller that owns the workspace
   * itself — the failure path, where the job never handed it over.
   */
  forget(jobId: string): void {
    this.workspaces.delete(jobId)
    this.leases.get(jobId)?.release()
    this.leases.delete(jobId)
  }

  /**
   * Opens or closes a read lease.
   *
   * The held promise resolves on the matching release, or on
   * {@link SAVE_LEASE_LIMIT_MS} — a lease that outlives its reader must not
   * become a workspace nobody may ever dispose.
   */
  lease(jobId: string, held: boolean): void {
    if (!held) {
      this.leases.get(jobId)?.release()
      this.leases.delete(jobId)
      return
    }
    if (this.leases.has(jobId)) return

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
    this.leases.set(jobId, { settled, release })
  }

  /**
   * Disposes one result, and forgets it only once it is gone.
   *
   * Two orderings matter and both were wrong. Deleting the entry BEFORE
   * disposing meant a disposal that threw left nothing to retry — the boot
   * sweep would eventually collect the directory, but nothing in this session
   * would. And letting the rejection escape would fail the NEXT job, because
   * releasing is the first thing a new job awaits: one undeletable directory
   * would stop the user working at all.
   *
   * So the entry survives a failure and the failure is contained, which is the
   * rule the orphan sweep already follows (VH-58).
   *
   * @returns Whether the workspace is gone.
   */
  async release(jobId: string): Promise<boolean> {
    const workspace = this.workspaces.get(jobId)
    if (!workspace) return true

    // Settled, not resolved: a reader that threw has still stopped reading.
    await this.leases.get(jobId)?.settled.catch(() => undefined)
    try {
      await workspace.dispose()
    } catch (cause) {
      log.warn('worker', 'could not release a finished job; keeping it to retry', {
        jobId,
        reason: cause instanceof Error ? cause.message : String(cause),
      })
      return false
    }
    this.workspaces.delete(jobId)
    this.leases.delete(jobId)
    return true
  }

  /**
   * Releases everything, each independently.
   *
   * Only the most recent result can be saved, so only the most recent needs
   * keeping — a user who processes three files without saving any would
   * otherwise leave three full outputs on disk.
   */
  async releaseAll(): Promise<void> {
    await Promise.all([...this.workspaces.keys()].map((jobId) => this.release(jobId)))
  }
}
