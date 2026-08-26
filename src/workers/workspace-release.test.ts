import { describe, expect, it, vi } from 'vitest'

import { releaseWorkspace, type DisposableWorkspace } from './workspace-release'

describe('releaseWorkspace', () => {
  it('deletes ownership only after disposal succeeds', async () => {
    const workspace: DisposableWorkspace = { dispose: vi.fn(() => Promise.resolve()) }
    const owned = new Map([['job-1', workspace]])

    await releaseWorkspace(owned, 'job-1')
    expect(owned.has('job-1')).toBe(false)
  })

  it('retains ownership when disposal rejects so the user can retry', async () => {
    const failure = new Error('entry is still busy')
    const workspace: DisposableWorkspace = { dispose: vi.fn(() => Promise.reject(failure)) }
    const owned = new Map([['job-1', workspace]])

    await expect(releaseWorkspace(owned, 'job-1')).rejects.toBe(failure)
    expect(owned.get('job-1')).toBe(workspace)
  })
})
