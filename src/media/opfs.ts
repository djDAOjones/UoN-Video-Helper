/**
 * The OPFS working store.
 *
 * Scratch space, not a database — but it outlives a reload, so it follows the
 * checklist in `AGENTS.md` -> "OPFS working-store checklist": one directory
 * per job, cleanup on every exit path including cancel, handles closed before
 * files are removed, and orphans swept at start.
 *
 * Writes prefer a `FileSystemSyncAccessHandle` wrapped as a `WritableStream`
 * over `createWritable()`. Both satisfy Mediabunny's `StreamTarget`, but
 * `createWritable()` stages through a temporary file and copies on close — at
 * multi-gigabyte output that is a second full write of the whole file. Sync
 * access handles write in place.
 *
 * They are also worker-only, which is where the job runs and so is normally
 * fine. `createWritable()` is kept as a fallback rather than letting this
 * module be silently unusable anywhere else: the acceptance harness drives the
 * same pipeline from the main thread, and a storage layer that works in only
 * one context is a storage layer that cannot be tested from the other.
 */

import { StreamTarget, type StreamTargetChunk } from 'mediabunny'

import { log } from '../core/logger'

/** Every job's scratch lives under this one directory, so a sweep knows where to look. */
export const ROOT_DIRECTORY = 'uon-video-helper-jobs'

/**
 * This context's share of the directory namespace.
 *
 * OPFS is ORIGIN-scoped, so every tab sees the same root. Job ids come from a
 * per-worker counter, which means two tabs both open `job-1` and write into the
 * same directory. The prefix makes that impossible. It is deliberately not
 * derived from anything persistent — a reload is a new session and its old
 * scratch is genuinely orphaned.
 */
const SESSION = `s${crypto.randomUUID().slice(0, 8)}`

/** The directory a job writes into. Distinct per tab; see {@link SESSION}. */
function directoryFor(jobId: string): string {
  return `${SESSION}-${jobId}`
}

/**
 * The lock a live job holds for as long as its directory must survive.
 *
 * Web Locks are origin-scoped, so they cross tabs, and the browser releases
 * them when the holder goes away — including a crash or a force-close, which
 * is precisely the case the sweep exists to clean up after. That is why this
 * is a lock rather than a heartbeat file or a timestamp: there is no threshold
 * to tune and no window in which a live job looks dead.
 */
function lockFor(directoryName: string): string {
  return `opfs-job:${directoryName}`
}

/** Whether some tab — this one included — still needs that directory. */
async function isClaimed(directoryName: string): Promise<boolean> {
  if (!navigator.locks) {
    // Every supported browser has Web Locks (Safari 15.4, Firefox 96), so this
    // is a should-not-happen. If it does, keep everything: leaking scratch
    // costs disk, and deleting another tab's finished output costs the user
    // their work.
    log.warn('opfs', 'no Web Locks; sweeping nothing rather than guessing', {})
    return true
  }
  try {
    return await navigator.locks.request(
      lockFor(directoryName),
      { ifAvailable: true },
      (lock) => lock === null,
    )
  } catch (cause) {
    log.warn('opfs', 'could not test job claim; keeping the directory', {
      directoryName,
      reason: cause instanceof Error ? cause.message : String(cause),
    })
    return true
  }
}

/**
 * Chooses which job directories a sweep may remove.
 *
 * Split out from {@link sweepOrphanedJobs} so the rule can be tested without a
 * browser: OPFS and Web Locks do not exist in Node, and the rule — never
 * remove anything still claimed, and never remove anything we failed to ask
 * about — is the part worth pinning.
 *
 * @param names - Directory names found under the jobs root.
 * @param claimed - Answers whether a directory is still in use. A rejection is
 *   treated as "claimed": uncertainty must not delete a user's output.
 * @returns The names safe to remove, in the order given.
 */
export async function selectSweepable(
  names: readonly string[],
  claimed: (name: string) => Promise<boolean>,
): Promise<string[]> {
  const sweepable: string[] = []
  for (const name of names) {
    // `true` on both the claimed answer and the rejection: the only way into
    // the removal list is an explicit, successful "nobody wants this".
    const keep = await claimed(name).catch(() => true)
    if (!keep) sweepable.push(name)
  }
  return sweepable
}

/**
 * Removes scratch left behind by a crashed or force-closed tab.
 *
 * Runs at worker boot, when this context has no jobs of its own — so the
 * directories it finds belong to OTHER TABS, and it cannot see their job ids.
 * Sweeping on directory name alone is what made a second tab destroy the
 * first tab's in-flight scratch and its finished-but-unsaved output (VH-35).
 * A directory is removed only when nobody holds its lock.
 *
 * @param keepJobIds - This context's own live jobs. Redundant while they hold
 *   their locks, and kept as belt and braces for the ones that do not.
 * @returns How many orphaned directories were removed.
 */
export async function sweepOrphanedJobs(keepJobIds: readonly string[] = []): Promise<number> {
  let removed = 0
  try {
    const root = await jobsRoot()
    const keep = new Set(keepJobIds.map(directoryFor))
    // `keys()` is an async iterator on the directory handle; the DOM lib does
    // not type it yet.
    const directory = root as FileSystemDirectoryHandle & {
      keys(): AsyncIterableIterator<string>
    }
    const names: string[] = []
    for await (const name of directory.keys()) if (!keep.has(name)) names.push(name)

    for (const name of await selectSweepable(names, isClaimed)) {
      try {
        await root.removeEntry(name, { recursive: true })
        removed++
      } catch (cause) {
        // Per entry, not per sweep. A directory can be undeletable — a handle
        // somewhere still holds a file open — and letting that throw abandoned
        // every orphan after it in the list. Found in Firefox, VH-35.
        log.warn('opfs', 'could not remove an orphaned job directory', {
          name,
          reason: cause instanceof Error ? cause.message : String(cause),
        })
      }
    }
    if (removed > 0) log.info('opfs', 'swept orphaned job directories', { removed })
  } catch (cause) {
    // A failed sweep costs disk, not correctness. Never let it stop a job.
    log.warn('opfs', 'orphan sweep failed', {
      reason: cause instanceof Error ? cause.message : String(cause),
    })
  }
  return removed
}

async function jobsRoot(): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory()
  return root.getDirectoryHandle(ROOT_DIRECTORY, { create: true })
}

/** A file being written, and the means to finish or abandon it. */
export interface OpfsOutputFile {
  /** Hand this to a Mediabunny `Output`. */
  readonly target: StreamTarget
  /** Closes the handle and returns the finished bytes. */
  finish(): Promise<File>
}

export class OpfsWorkspace {
  private readonly openHandles = new Set<FileSystemSyncAccessHandle>()
  /**
   * Anything else holding a file open. An unreleased handle blocks removal,
   * and removal failing is precisely what acceptance criterion 8 forbids — so
   * every path that opens something registers how to let go of it.
   */
  private readonly releases = new Set<() => Promise<void>>()
  private disposed = false
  /** Drops this job's claim. Set while the lock is held; see {@link lockFor}. */
  private releaseClaim: (() => void) | null = null

  private constructor(
    readonly jobId: string,
    private readonly directoryName: string,
    private readonly directory: FileSystemDirectoryHandle,
  ) {}

  static async open(jobId: string): Promise<OpfsWorkspace> {
    const root = await jobsRoot()
    const directoryName = directoryFor(jobId)
    const directory = await root.getDirectoryHandle(directoryName, { create: true })
    const workspace = new OpfsWorkspace(jobId, directoryName, directory)
    await workspace.claim()
    log.debug('opfs', 'workspace opened', { jobId, directoryName })
    return workspace
  }

  /**
   * Takes this directory's lock and holds it until {@link dispose}.
   *
   * The lock is what tells another tab's sweep that the directory is still
   * wanted. Resolving happens on GRANT, not on release: the held promise
   * outlives this call by design.
   */
  private async claim(): Promise<void> {
    if (!navigator.locks) return
    try {
      await new Promise<void>((granted, failed) => {
        void navigator.locks
          .request(
            lockFor(this.directoryName),
            { ifAvailable: true },
            (lock) =>
              new Promise<void>((release) => {
                if (!lock) {
                  // The session prefix should make this unreachable. If it is
                  // not, say so — an unheld lock is a directory another tab
                  // may sweep out from under a running job.
                  log.warn('opfs', 'job directory was already claimed', {
                    directoryName: this.directoryName,
                  })
                  release()
                  granted()
                  return
                }
                this.releaseClaim = release
                granted()
              }),
          )
          .catch(failed)
      })
    } catch (cause) {
      log.warn('opfs', 'could not claim the job directory', {
        directoryName: this.directoryName,
        reason: cause instanceof Error ? cause.message : String(cause),
      })
    }
  }

  /** Creates a file in this job's directory and a target that streams into it. */
  async createFile(name: string): Promise<OpfsOutputFile> {
    if (this.disposed) throw new Error('Workspace has already been disposed')

    const fileHandle = await this.directory.getFileHandle(name, { create: true })

    const supportsSyncHandles =
      typeof (fileHandle as { createSyncAccessHandle?: unknown }).createSyncAccessHandle ===
      'function'

    if (!supportsSyncHandles) {
      // Main thread. `createWritable()` already speaks the shape StreamTarget
      // wants — positioned writes — so no adapter is needed, only the slower
      // staging behaviour.
      const writable = await fileHandle.createWritable()

      // Not closed by `finish`. `StreamTarget` takes a writer on the stream,
      // which locks it, and closes it itself during `finalize()`. Closing it
      // again from this side throws on a locked stream — the sync-handle path
      // below differs only because the handle is ours rather than the target's.
      //
      // It IS closed by `dispose`, though. On the cancel path `finalize` never
      // runs, so nothing else would release it, and the directory could not
      // then be removed.
      const release = async (): Promise<void> => {
        try {
          await writable.abort()
        } catch {
          // Already closed or locked by a writer that is itself gone.
        }
      }
      this.releases.add(release)

      const finish = async (): Promise<File> => {
        this.releases.delete(release)
        return fileHandle.getFile()
      }
      return {
        // No adapter: `FileSystemWritableFileStream` already accepts the
        // positioned-write chunks StreamTarget produces.
        target: new StreamTarget(writable, { chunked: true }),
        finish,
      }
    }

    const handle = await fileHandle.createSyncAccessHandle()
    handle.truncate(0)
    this.openHandles.add(handle)

    let closed = false
    const closeHandle = (): void => {
      if (closed) return
      closed = true
      try {
        handle.flush()
      } finally {
        handle.close()
        this.openHandles.delete(handle)
      }
    }

    const writable = new WritableStream<StreamTargetChunk>({
      write: (chunk) => {
        handle.write(chunk.data, { at: chunk.position })
      },
      close: closeHandle,
      abort: closeHandle,
    })

    return {
      target: new StreamTarget(writable, { chunked: true }),
      finish: async () => {
        closeHandle()
        return fileHandle.getFile()
      },
    }
  }

  /**
   * Releases every handle and removes this job's directory.
   *
   * Safe to call more than once, and safe to call on the cancel path — which
   * is the path that matters, because an open handle blocks deletion and a
   * half-written file left in OPFS is exactly what acceptance criterion 8
   * forbids.
   */
  async dispose(): Promise<void> {
    if (this.disposed) return
    this.disposed = true

    for (const handle of this.openHandles) {
      try {
        handle.close()
      } catch {
        // Already closed. Nothing to recover.
      }
    }
    this.openHandles.clear()

    for (const release of this.releases) await release()
    this.releases.clear()

    try {
      const root = await jobsRoot()
      await root.removeEntry(this.directoryName, { recursive: true })
      log.debug('opfs', 'workspace disposed', { jobId: this.jobId })
    } catch (cause) {
      log.warn('opfs', 'could not remove workspace', {
        jobId: this.jobId,
        reason: cause instanceof Error ? cause.message : String(cause),
      })
    } finally {
      // Last, and unconditionally: while this is held, every other tab's sweep
      // treats the directory as live. Releasing before the removal would open
      // a window where a sweep could race the removal for the same entry.
      this.releaseClaim?.()
      this.releaseClaim = null
    }
  }
}
