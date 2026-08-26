/**
 * VH-35 spike: does a sweep leave a live job's scratch alone?
 *
 * OPFS is ORIGIN-scoped, so every tab of this app shares one root, and the
 * boot sweep used to remove every directory it found — destroying whatever
 * another tab was mid-way through, and any finished output not yet saved.
 * The fix makes a live job hold a Web Lock on its directory and the sweep skip
 * anything still locked.
 *
 * That rests on a claim about three engines: an exclusive Web Lock is
 * ORIGIN-wide, so `ifAvailable` fails for a lock held anywhere in the origin.
 * A pair of dedicated workers below proves that cross-context boundary, then
 * terminates the holder and proves its exact directory becomes sweepable.
 * `opfs.test.ts` pins the selection rule in Node; this pins the browser
 * behaviour the rule depends on. Dev-only; not built.
 *
 * Run it in all three: `node scripts/run-in-engines.mjs /spike-opfs.html`.
 */

import { Mp4OutputFormat, Output } from 'mediabunny'

import { OpfsWorkspace, ROOT_DIRECTORY, sweepOrphanedJobs } from '../media/opfs'
import type { OpfsContextResponse } from './opfs-context.worker'

const log = document.getElementById('log') as HTMLPreElement
const lines: string[] = []
let failures = 0
let nextContextRequestId = 1

/** Dev-harness bounds: a failed context must produce evidence, not hang the matrix. */
const CONTEXT_RPC_TIMEOUT_MS = 10_000
const TERMINATION_RELEASE_TIMEOUT_MS = 10_000
const TERMINATION_POLL_INTERVAL_MS = 50

function say(text: string): void {
  lines.push(text)
  log.textContent = lines.join('\n')
}

function check(passed: boolean, description: string): void {
  if (!passed) failures++
  say(`  ${passed ? 'PASS' : 'FAIL'} — ${description}`)
}

/** Directory names currently under the jobs root. */
async function jobDirectories(): Promise<string[]> {
  const root = await navigator.storage.getDirectory()
  const jobs = await root.getDirectoryHandle(ROOT_DIRECTORY, { create: true })
  const iterable = jobs as FileSystemDirectoryHandle & { keys(): AsyncIterableIterator<string> }
  const names: string[] = []
  for await (const name of iterable.keys()) names.push(name)
  return names.sort()
}

type OpfsContextCommand =
  { readonly kind: 'hold'; readonly jobId: string } | { readonly kind: 'sweep' }

/** Sends one correlated command to a spike worker. */
function askContext(
  worker: Worker,
  command: OpfsContextCommand,
): Promise<Exclude<OpfsContextResponse, { readonly kind: 'failed' }>> {
  const id = nextContextRequestId++
  return new Promise((resolve, reject) => {
    let timeout: ReturnType<typeof setTimeout> | null = null
    const cleanup = (): void => {
      if (timeout !== null) clearTimeout(timeout)
      worker.removeEventListener('message', onMessage)
      worker.removeEventListener('error', onError)
    }
    const onMessage = (event: MessageEvent<OpfsContextResponse>): void => {
      if (event.data.id !== id) return
      cleanup()
      if (event.data.kind === 'failed') reject(new Error(event.data.message))
      else resolve(event.data)
    }
    const onError = (event: ErrorEvent): void => {
      cleanup()
      reject(new Error(event.message || 'OPFS spike worker failed'))
    }
    timeout = setTimeout(() => {
      cleanup()
      reject(
        new Error(
          `OPFS spike worker did not answer ${command.kind} request ${id} within ${CONTEXT_RPC_TIMEOUT_MS} ms`,
        ),
      )
    }, CONTEXT_RPC_TIMEOUT_MS)
    worker.addEventListener('message', onMessage)
    worker.addEventListener('error', onError)
    worker.postMessage({ id, ...command })
  })
}

/** Yields before probing a claim deliberately released by normal disposal. */
function nextBrowserTurn(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

/** Repeats the exact sweep until worker teardown releases its origin-wide lock. */
async function sweepUntilDirectoryMissing(
  worker: Worker,
  directoryName: string,
): Promise<{ readonly gone: boolean; readonly attempts: number; readonly removed: number }> {
  const deadline = performance.now() + TERMINATION_RELEASE_TIMEOUT_MS
  let attempts = 0
  let removed = 0

  do {
    attempts++
    const response = await askContext(worker, { kind: 'sweep' })
    if (response.kind !== 'swept') throw new Error(`sweeper answered ${response.kind}`)
    removed += response.removed
    if (!(await jobDirectories()).includes(directoryName)) {
      return { gone: true, attempts, removed }
    }
    if (performance.now() >= deadline) break
    await new Promise((resolve) => setTimeout(resolve, TERMINATION_POLL_INTERVAL_MS))
  } while (performance.now() < deadline)

  return { gone: false, attempts, removed }
}

say(`userAgent: ${navigator.userAgent}`)
say(
  `Web Locks: ${navigator.locks ? 'available' : 'MISSING — the sweep will refuse to remove anything'}`,
)

say('\n=== a directory nobody holds is swept')
{
  // What a crashed tab leaves behind: a directory with no live claim on it.
  const root = await navigator.storage.getDirectory()
  const jobs = await root.getDirectoryHandle(ROOT_DIRECTORY, { create: true })
  await jobs.getDirectoryHandle('spike-dead-tab', { create: true })
  check((await jobDirectories()).includes('spike-dead-tab'), 'the abandoned directory exists')

  const removed = await sweepOrphanedJobs()
  say(`  sweep removed ${removed}`)
  check(!(await jobDirectories()).includes('spike-dead-tab'), 'the abandoned directory is gone')
}

say('\n=== a live job survives a sweep')
{
  const workspace = await OpfsWorkspace.open('spike-live')
  // Created but never started, on purpose. An error can land between file
  // creation and Output.start(), so disposal must own that pre-start boundary.
  const output = await workspace.createFile('scratch.bin')
  say(`  writer path: ${output.writerKind}`)
  const before = await jobDirectories()
  const mine = before.filter((name) => name.endsWith('-spike-live'))
  check(mine.length === 1, `the live job has exactly one directory (${mine.join(', ') || 'none'})`)

  // This first fast check uses one context. The worker-to-worker case below is
  // what proves the same exclusion across the production boundary.
  const removed = await sweepOrphanedJobs()
  say(`  sweep removed ${removed}`)
  const after = await jobDirectories()
  check(
    mine.every((name) => after.includes(name)),
    'the live job’s directory survived',
  )

  await workspace.dispose()
  check(
    !(await jobDirectories()).some((name) => name.endsWith('-spike-live')),
    'dispose removed it with a file still open, so nothing leaked',
  )
}

say('\n=== the fallback commits only through the public Output lifecycle')
{
  const workspace = await OpfsWorkspace.open('spike-fallback-lock')
  const outputFile = await workspace.createFile('scratch.mp4')
  say(`  writer path: ${outputFile.writerKind}`)
  check(
    outputFile.writerKind === 'create-writable-fallback',
    'the main-thread rehearsal selected the writable fallback',
  )

  try {
    // MP4 publicly permits zero tracks. This is therefore a complete, minimal
    // start/finalize sequence through Mediabunny without reaching into its
    // private StreamTarget fields or depending on a codec.
    const output = new Output({
      format: new Mp4OutputFormat({ fastStart: false }),
      target: outputFile.target,
    })
    let prematureFailure: unknown = null
    try {
      await outputFile.finish(output)
    } catch (cause) {
      prematureFailure = cause
    }
    check(
      prematureFailure instanceof Error &&
        prematureFailure.message.includes('must be successfully finalized'),
      'finish refuses to expose bytes before the raw fallback is committed',
    )

    await output.start()
    await output.finalize()
    const file = await outputFile.finish(output)
    check(output.state === 'finalized', 'Mediabunny finalized through its public lifecycle')
    check(file.size > 0, `the committed minimal MP4 contains bytes (${file.size})`)

    await workspace.dispose()
    check(
      !(await jobDirectories()).some((name) => name.endsWith('-spike-fallback-lock')),
      'disposal removed the committed fallback workspace',
    )
  } catch (cause) {
    check(
      false,
      `fallback cleanup completed (${cause instanceof Error ? cause.message : String(cause)})`,
    )
    try {
      await workspace.dispose()
    } catch (cleanupCause) {
      check(
        false,
        `fallback failure cleanup completed (${cleanupCause instanceof Error ? cleanupCause.message : String(cleanupCause)})`,
      )
    }
  }
}

say('\n=== a disposed job no longer holds its claim')
{
  // A released lock must let the NEXT sweep through, or disposal would leak a
  // directory for the lifetime of the tab.
  const root = await navigator.storage.getDirectory()
  const jobs = await root.getDirectoryHandle(ROOT_DIRECTORY, { create: true })
  const workspace = await OpfsWorkspace.open('spike-released')
  const held = (await jobDirectories()).filter((entry) => entry.endsWith('-spike-released'))
  const exactName = held.length === 1 ? (held[0] ?? null) : null
  check(exactName !== null, `captured the exact claimed directory (${exactName ?? 'none'})`)
  await workspace.dispose()
  check(
    exactName === null || !(await jobDirectories()).includes(exactName),
    'dispose removed the directory',
  )
  if (exactName !== null) {
    // Re-create the exact name. A different relic has a different lock and
    // cannot prove the disposed workspace released its own claim.
    await jobs.getDirectoryHandle(exactName, { create: true })
    await nextBrowserTurn()
    await sweepOrphanedJobs()
    check(!(await jobDirectories()).includes(exactName), 'the exact released claim is sweepable')
  }
}

say('\n=== a worker protects another context, then a crash releases it')
{
  const holder = new Worker(new URL('./opfs-context.worker.ts', import.meta.url), {
    type: 'module',
    name: 'uon-opfs-spike-holder',
  })
  const sweeper = new Worker(new URL('./opfs-context.worker.ts', import.meta.url), {
    type: 'module',
    name: 'uon-opfs-spike-sweeper',
  })
  const jobId = `spike-cross-${crypto.randomUUID()}`
  try {
    const held = await askContext(holder, { kind: 'hold', jobId })
    if (held.kind !== 'held') throw new Error(`holder answered ${held.kind}`)
    say(`  holder worker writer path: ${held.writerKind}`)
    if (held.writerKind === 'sync-access-handle') {
      check(
        held.bytes > 0,
        `the worker sync-access path finalized a public Output (${held.bytes} bytes)`,
      )
    } else if (!held.syncAccessAdvertised) {
      say('  SKIP — this engine/context did not provide a working sync access handle')
      check(
        held.bytes > 0,
        `the worker fallback path finalized a public Output (${held.bytes} bytes)`,
      )
    } else {
      check(
        false,
        'the worker advertised sync access handles but rejected them and used the fallback',
      )
    }

    const matches = (await jobDirectories()).filter((name) => name.endsWith(`-${jobId}`))
    const exactName = matches.length === 1 ? (matches[0] ?? null) : null
    check(exactName !== null, `the holder owns exactly one directory (${exactName ?? 'none'})`)

    const whileLive = await askContext(sweeper, { kind: 'sweep' })
    if (whileLive.kind !== 'swept') throw new Error(`sweeper answered ${whileLive.kind}`)
    say(`  cross-context sweep removed ${whileLive.removed}`)
    check(
      exactName !== null && (await jobDirectories()).includes(exactName),
      'another worker cannot sweep the live directory',
    )

    // Force-close without `dispose()`: the browser must release the worker's
    // Web Lock, which is the crash/reload recovery contract this sweep relies on.
    holder.terminate()
    if (exactName !== null) {
      const afterTermination = await sweepUntilDirectoryMissing(sweeper, exactName)
      say(
        `  post-termination sweeps: ${afterTermination.attempts}; removed ${afterTermination.removed}`,
      )
      check(
        afterTermination.gone,
        'terminating the holder makes its exact directory sweepable within the bound',
      )
    }
  } catch (cause) {
    check(
      false,
      `cross-context rehearsal completed (${cause instanceof Error ? cause.message : String(cause)})`,
    )
  } finally {
    holder.terminate()
    sweeper.terminate()
  }
}

say(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAILURE(S)`}`)
say(`result: ${failures === 0 ? 'pass' : 'fail'}`)
say('\ndone')
