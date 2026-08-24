/**
 * The OPFS working store.
 *
 * Scratch space, not a database — but it outlives a reload, so it follows the
 * checklist in `AGENTS.md` -> "OPFS working-store checklist": one directory
 * per job, cleanup on every exit path including cancel, handles closed before
 * files are removed, and orphans swept at start.
 *
 * Writes go through a `FileSystemSyncAccessHandle` wrapped as a
 * `WritableStream`, not `createWritable()`. Both satisfy Mediabunny's
 * `StreamTarget`, but `createWritable()` stages through a temporary file and
 * copies on close — at multi-gigabyte output that is a second full write of
 * the whole file. Sync access handles write in place. They are worker-only and
 * synchronous, which is exactly right here: the worker has nothing else to do.
 */

import { StreamTarget, type StreamTargetChunk } from 'mediabunny'

import { log } from '../core/logger'

/** Every job's scratch lives under this one directory, so a sweep knows where to look. */
const ROOT_DIRECTORY = 'uon-video-helper-jobs'

async function jobsRoot(): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory()
  return root.getDirectoryHandle(ROOT_DIRECTORY, { create: true })
}

/**
 * Removes scratch left behind by a crashed or force-closed tab.
 *
 * @param keepJobIds - Jobs currently running, which must not be swept.
 * @returns How many orphaned directories were removed.
 */
export async function sweepOrphanedJobs(keepJobIds: readonly string[] = []): Promise<number> {
  let removed = 0
  try {
    const root = await jobsRoot()
    const keep = new Set(keepJobIds)
    // `keys()` is an async iterator on the directory handle; the DOM lib does
    // not type it yet.
    const directory = root as FileSystemDirectoryHandle & {
      keys(): AsyncIterableIterator<string>
    }
    for await (const name of directory.keys()) {
      if (keep.has(name)) continue
      await root.removeEntry(name, { recursive: true })
      removed++
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

/** A file being written, and the means to finish or abandon it. */
export interface OpfsOutputFile {
  /** Hand this to a Mediabunny `Output`. */
  readonly target: StreamTarget
  /** Closes the handle and returns the finished bytes. */
  finish(): Promise<File>
}

export class OpfsWorkspace {
  private readonly openHandles = new Set<FileSystemSyncAccessHandle>()
  private disposed = false

  private constructor(
    readonly jobId: string,
    private readonly directory: FileSystemDirectoryHandle,
  ) {}

  static async open(jobId: string): Promise<OpfsWorkspace> {
    const root = await jobsRoot()
    const directory = await root.getDirectoryHandle(jobId, { create: true })
    log.debug('opfs', 'workspace opened', { jobId })
    return new OpfsWorkspace(jobId, directory)
  }

  /** Creates a file in this job's directory and a target that streams into it. */
  async createFile(name: string): Promise<OpfsOutputFile> {
    if (this.disposed) throw new Error('Workspace has already been disposed')

    const fileHandle = await this.directory.getFileHandle(name, { create: true })
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

    try {
      const root = await jobsRoot()
      await root.removeEntry(this.jobId, { recursive: true })
      log.debug('opfs', 'workspace disposed', { jobId: this.jobId })
    } catch (cause) {
      log.warn('opfs', 'could not remove workspace', {
        jobId: this.jobId,
        reason: cause instanceof Error ? cause.message : String(cause),
      })
    }
  }
}
