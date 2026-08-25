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
 * ORIGIN-wide, so `ifAvailable` fails for a lock held anywhere in the origin,
 * including this same context. `opfs.test.ts` pins the selection rule in Node;
 * this pins the browser behaviour the rule depends on. Dev-only; not built.
 *
 * Run it in all three: `node scripts/run-in-engines.mjs /spike-opfs.html`.
 */

import { OpfsWorkspace, ROOT_DIRECTORY, sweepOrphanedJobs } from '../media/opfs'

const log = document.getElementById('log') as HTMLPreElement
const lines: string[] = []
let failures = 0

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
  // Created but never finished, on purpose. `finish()` hands the writable to
  // the caller expecting a Mediabunny `Output` to close it during `finalize()`,
  // and there is no Output here — so this is the CANCEL path, which is the one
  // that matters: an open handle blocks removal, and a workspace that cannot be
  // removed on cancel is what spec criterion 8 forbids.
  await workspace.createFile('scratch.bin')
  const before = await jobDirectories()
  const mine = before.filter((name) => name.endsWith('-spike-live'))
  check(mine.length === 1, `the live job has exactly one directory (${mine.join(', ') || 'none'})`)

  // This is the whole ticket: the sweep another tab runs at boot, with the job
  // still going. Same context here, which is the point — the lock is
  // origin-wide, so it blocks this sweep exactly as it blocks another tab's.
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

say('\n=== a disposed job no longer holds its claim')
{
  // A released lock must let the NEXT sweep through, or disposal would leak a
  // directory for the lifetime of the tab.
  const root = await navigator.storage.getDirectory()
  const jobs = await root.getDirectoryHandle(ROOT_DIRECTORY, { create: true })
  const workspace = await OpfsWorkspace.open('spike-released')
  await workspace.dispose()
  // Re-create the directory by hand: dispose removed it, and what is being
  // tested is the claim, not the removal.
  const name = (await jobDirectories()).find((entry) => entry.endsWith('-spike-released'))
  check(name === undefined, 'dispose removed the directory')
  await jobs.getDirectoryHandle('spike-released-relic', { create: true })
  await sweepOrphanedJobs()
  check(
    !(await jobDirectories()).includes('spike-released-relic'),
    'a relic under a released claim is sweepable',
  )
}

say(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAILURE(S)`}`)
say('\ndone')
