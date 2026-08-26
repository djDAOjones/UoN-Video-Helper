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

/** The narrow Web Locks surface used by the storage orchestration and its fakes. */
export type ExclusiveLockRequest = (
  name: string,
  callback: (available: boolean) => Promise<void>,
) => Promise<void>

/** Creates the real exclusive Web Lock request in queued or probe mode. */
function browserExclusiveLockRequest(mode: 'wait' | 'if-available'): ExclusiveLockRequest {
  if (!navigator.locks) {
    throw new Error('Web Locks are unavailable; refusing an unsafe OPFS operation')
  }
  const locks = navigator.locks
  if (mode === 'wait') {
    return async (name, callback) => {
      await locks.request(name, { mode: 'exclusive' }, async () => {
        await callback(true)
      })
    }
  }
  return async (name, callback) => {
    await locks.request(name, { ifAvailable: true, mode: 'exclusive' }, async (lock) => {
      await callback(lock !== null)
    })
  }
}

/** A resource initialised while its exclusive claim is held. */
export interface HeldClaim<T> {
  /** The resource created while the claim was held. */
  readonly value: T
  /** Ends the lifetime claim; safe to call more than once. */
  readonly release: () => void
}

/**
 * Initialises a resource only after taking its lock, then keeps that lock held.
 *
 * The caller receives the resource as soon as initialisation finishes; the
 * lock request itself stays pending until `release` is called. A missing,
 * rejected or unavailable claim rejects before `initialise` runs, so a job
 * directory can never exist without its lifetime lock already being held.
 *
 * @param requestLock - Web Lock request or deterministic test double.
 * @param lockName - The exclusive lock protecting the resource.
 * @param initialise - Creates or opens the resource under the granted lock.
 */
export function initialiseUnderHeldClaim<T>(
  requestLock: ExclusiveLockRequest,
  lockName: string,
  initialise: () => Promise<T>,
): Promise<HeldClaim<T>> {
  let resolveReady!: (claim: HeldClaim<T>) => void
  let rejectReady!: (cause: unknown) => void
  const ready = new Promise<HeldClaim<T>>((resolve, reject) => {
    resolveReady = resolve
    rejectReady = reject
  })

  void requestLock(lockName, async (available) => {
    if (!available) {
      rejectReady(new Error(`Exclusive lock is already held: ${lockName}`))
      return
    }

    let releaseHold!: () => void
    let released = false
    const hold = new Promise<void>((resolve) => {
      releaseHold = resolve
    })
    const release = (): void => {
      if (released) return
      released = true
      releaseHold()
    }

    try {
      const value = await initialise()
      resolveReady({ value, release })
      await hold
    } catch (cause) {
      release()
      rejectReady(cause)
    }
  }).catch(rejectReady)

  return ready
}

/**
 * Runs an operation only while an immediately available lock remains held.
 *
 * Lock refusal returns `false`. Lock-manager or operation errors reject, so
 * the caller can keep the entry and report the uncertainty independently.
 *
 * @param requestLock - Web Lock request or deterministic test double.
 * @param lockName - The exclusive lock protecting the operation.
 * @param operation - Mutation that must finish before the lock is released.
 * @returns Whether the claim was granted and the operation completed.
 */
export async function runWithAvailableClaim(
  requestLock: ExclusiveLockRequest,
  lockName: string,
  operation: () => Promise<void>,
): Promise<boolean> {
  let ran = false
  await requestLock(lockName, async (available) => {
    if (!available) return
    ran = true
    await operation()
  })
  return ran
}

/**
 * Attempts every orphan independently, so one locked or broken entry cannot
 * abandon the entries after it.
 *
 * @param names - Directory entries observed during this sweep.
 * @param remove - Atomically claims and removes one entry.
 * @param failed - Reports an entry failure without stopping the sweep.
 * @returns The number of entries successfully removed.
 */
export async function sweepEntries(
  names: readonly string[],
  remove: (name: string) => Promise<boolean>,
  failed: (name: string, cause: unknown) => void,
): Promise<number> {
  let removed = 0
  for (const name of names) {
    try {
      if (await remove(name)) removed++
    } catch (cause) {
      failed(name, cause)
    }
  }
  return removed
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
    const requestLock = browserExclusiveLockRequest('if-available')
    const keep = new Set(keepJobIds.map(directoryFor))
    // `keys()` is an async iterator on the directory handle; the DOM lib does
    // not type it yet.
    const directory = root as FileSystemDirectoryHandle & {
      keys(): AsyncIterableIterator<string>
    }
    const names: string[] = []
    for await (const name of directory.keys()) if (!keep.has(name)) names.push(name)

    removed = await sweepEntries(
      names,
      (name) =>
        runWithAvailableClaim(requestLock, lockFor(name), () =>
          root.removeEntry(name, { recursive: true }),
        ),
      (name, cause) => {
        // Per entry, not per sweep. A failed lock request or an undeletable
        // directory keeps that entry but must not abandon every orphan after
        // it in the list. The latter was found in Firefox, VH-35.
        log.warn('opfs', 'could not remove an orphaned job directory', {
          name,
          reason: cause instanceof Error ? cause.message : String(cause),
        })
      },
    )
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

type WritableSyncHandle = Pick<FileSystemSyncAccessHandle, 'write' | 'flush' | 'close'>

/** A stream adapter and its idempotent close operation. */
export interface SyncHandleSink {
  /** Positioned chunks consumed by Mediabunny's `StreamTarget`. */
  readonly writable: WritableStream<StreamTargetChunk>
  /** Flushes and closes the underlying handle once. */
  close(): void
}

/**
 * Adapts an OPFS synchronous handle without assuming a write consumed it all.
 *
 * `FileSystemSyncAccessHandle.write` returns the byte count rather than
 * promising an all-or-nothing write. Mediabunny has already applied its own
 * backpressure before this boundary, so a short count is a storage failure;
 * rejecting is safer than silently finalising a corrupt MP4.
 *
 * @param handle - The synchronous OPFS handle receiving positioned writes.
 * @param onClosed - Releases the workspace's handle bookkeeping.
 * @returns The writable adapter and its idempotent close operation.
 */
export function createSyncHandleSink(
  handle: WritableSyncHandle,
  onClosed: () => void,
): SyncHandleSink {
  let closed = false
  const close = (): void => {
    if (closed) return
    let flushFailure: Error | null = null
    try {
      handle.flush()
    } catch (cause) {
      flushFailure = cause instanceof Error ? cause : new Error(String(cause))
    }
    // Do not unregister or mark closed until close itself succeeds. A transient
    // close failure must leave the raw handle under workspace ownership so a
    // later disposal attempt can genuinely retry it.
    handle.close()
    closed = true
    onClosed()
    if (flushFailure !== null) throw flushFailure
  }

  return {
    writable: new WritableStream<StreamTargetChunk>({
      write: (chunk) => {
        const written = handle.write(chunk.data, { at: chunk.position })
        if (written !== chunk.data.byteLength) {
          throw new Error(
            `OPFS short write at byte ${chunk.position}: wrote ${written} of ${chunk.data.byteLength} bytes`,
          )
        }
      },
      close,
      abort: close,
    }),
    close,
  }
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
  /** One shared cleanup attempt; cleared after failure so a later call can retry. */
  private disposeAttempt: Promise<void> | null = null
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
    try {
      const claim = await initialiseUnderHeldClaim(
        browserExclusiveLockRequest('wait'),
        lockFor(directoryName),
        () => root.getDirectoryHandle(directoryName, { create: true }),
      )
      const workspace = new OpfsWorkspace(jobId, directoryName, claim.value)
      workspace.releaseClaim = claim.release
      log.debug('opfs', 'workspace opened', { jobId, directoryName })
      return workspace
    } catch (cause) {
      log.warn('opfs', 'could not claim the job directory; workspace not opened', {
        directoryName,
        reason: cause instanceof Error ? cause.message : String(cause),
      })
      throw cause
    }
  }

  /** Creates a file in this job's directory and a target that streams into it. */
  async createFile(name: string): Promise<OpfsOutputFile> {
    if (this.disposed) throw new Error('Workspace has already been disposed')

    const fileHandle = await this.directory.getFileHandle(name, { create: true })

    const supportsSyncHandles =
      typeof (fileHandle as { createSyncAccessHandle?: unknown }).createSyncAccessHandle ===
      'function'

    if (!supportsSyncHandles) return this.createWritableFile(fileHandle)

    let handle: FileSystemSyncAccessHandle
    try {
      handle = await fileHandle.createSyncAccessHandle()
    } catch (cause) {
      // Some engines expose the worker-only method but reject it under a
      // storage policy where createWritable still works. Pre-flight proves the
      // fallback lifecycle, so use that exact path rather than approving a job
      // which then fails solely because feature presence was misleading.
      log.warn('opfs', 'sync access handle unavailable; using writable fallback', {
        reason: cause instanceof Error ? cause.message : String(cause),
      })
      return this.createWritableFile(fileHandle)
    }

    this.openHandles.add(handle)
    try {
      handle.truncate(0)
    } catch (cause) {
      // A successfully opened handle remains ours even when initialisation
      // fails. Close it before propagating the storage error so disposal is
      // never asked to remove a file behind an untracked live handle.
      try {
        handle.close()
        this.openHandles.delete(handle)
      } catch {
        // Keep the handle registered so workspace disposal can retry closing it.
      }
      throw cause
    }

    const sink = createSyncHandleSink(handle, () => this.openHandles.delete(handle))

    return {
      target: new StreamTarget(sink.writable, { chunked: true }),
      finish: async () => {
        sink.close()
        return fileHandle.getFile()
      },
    }
  }

  /** Slower seekable writer used when a synchronous handle is genuinely unavailable. */
  private async createWritableFile(fileHandle: FileSystemFileHandle): Promise<OpfsOutputFile> {
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
      } catch (cause) {
        // An unlocked rejected stream is already closed/errored. A locked one
        // still has an owner and must remain retryable until Output releases it.
        if (writable.locked) throw cause
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

  /**
   * Releases every handle and removes this job's directory.
   *
   * Safe to call more than once, and safe to call on the cancel path — which
   * is the path that matters, because an open handle blocks deletion and a
   * half-written file left in OPFS is exactly what acceptance criterion 8
   * forbids.
   */
  dispose(): Promise<void> {
    if (this.disposed) return Promise.resolve()
    if (this.disposeAttempt) return this.disposeAttempt

    const attempt = this.disposeOnce()
    this.disposeAttempt = attempt
    void attempt.then(
      () => {
        if (this.disposeAttempt === attempt) this.disposeAttempt = null
      },
      () => {
        if (this.disposeAttempt === attempt) this.disposeAttempt = null
      },
    )
    return attempt
  }

  /** Performs one removal attempt while {@link dispose} owns caller joining. */
  private async disposeOnce(): Promise<void> {
    let releaseFailure: unknown = null
    for (const handle of [...this.openHandles]) {
      try {
        handle.close()
        this.openHandles.delete(handle)
      } catch (cause) {
        releaseFailure ??= cause
      }
    }

    for (const release of [...this.releases]) {
      try {
        await release()
        this.releases.delete(release)
      } catch (cause) {
        releaseFailure ??= cause
      }
    }

    if (releaseFailure !== null) {
      throw new Error('Temporary file handles could not be closed', { cause: releaseFailure })
    }

    const root = await jobsRoot()
    try {
      await root.removeEntry(this.directoryName, { recursive: true })
    } catch (cause) {
      log.warn('opfs', 'could not remove workspace', {
        jobId: this.jobId,
        reason: cause instanceof Error ? cause.message : String(cause),
      })
      // The directory and its lifetime claim remain live. Marking this
      // workspace disposed or dropping the claim here would make a retry lie
      // while allowing another tab's sweep to race the still-present entry.
      throw cause
    }

    // Only successful removal is disposal. A failed attempt remains retryable
    // and continues to exclude orphan sweeping until a later call succeeds.
    this.disposed = true
    this.releaseClaim?.()
    this.releaseClaim = null
    log.debug('opfs', 'workspace disposed', { jobId: this.jobId })
  }
}
