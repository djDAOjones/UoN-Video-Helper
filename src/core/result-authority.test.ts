import { describe, expect, it } from 'vitest'

import { ResultAuthority } from './result-authority'

describe('ResultAuthority', () => {
  it('never replaces an existing unsaved result', () => {
    const authority = new ResultAuthority<object>()
    const first = {}

    expect(authority.retain(first)).toBe(true)
    expect(authority.retain({})).toBe(false)
    expect(authority.active).toEqual({ value: first, status: 'ready' })
  })

  it('keeps ownership throughout a save and restores it after cancellation', () => {
    const authority = new ResultAuthority<object>()
    const result = {}
    authority.retain(result)

    expect(authority.beginSave(result)).toBe(true)
    expect(authority.active?.status).toBe('saving')
    expect(authority.retainAfterSave(result)).toBe(true)
    expect(authority.active).toEqual({ value: result, status: 'ready' })
  })

  it('treats a fallback download as retained rather than completed', () => {
    const authority = new ResultAuthority<object>()
    const result = {}
    authority.retain(result)
    authority.beginSave(result)

    expect(authority.markDownloadStarted(result)).toBe(true)
    expect(authority.active).toEqual({ value: result, status: 'download-started' })
    expect(authority.beginSave(result)).toBe(true)
    expect(authority.retainAfterSave(result)).toBe(true)
    expect(authority.active?.status).toBe('download-started')
  })

  it('releases only after discard begins and completion is confirmed', () => {
    const authority = new ResultAuthority<object>()
    const result = {}
    authority.retain(result)

    expect(authority.release(result)).toBe(false)
    expect(authority.beginDiscard(result)).toBe(true)
    expect(authority.active?.status).toBe('discarding')
    expect(authority.release(result)).toBe(true)
    expect(authority.active).toBeNull()
  })

  it('keeps a durably saved result until workspace disposal is confirmed', () => {
    const authority = new ResultAuthority<object>()
    const result = {}
    authority.retain(result)
    authority.beginSave(result)

    expect(authority.beginDiscard(result)).toBe(true)
    expect(authority.active).toEqual({ value: result, status: 'discarding' })
    expect(authority.release(result)).toBe(true)
  })

  it('retains a result when workspace disposal fails', () => {
    const authority = new ResultAuthority<object>()
    const result = {}
    authority.retain(result)
    authority.beginDiscard(result)

    expect(authority.retainAfterDiscardFailure(result)).toBe(true)
    expect(authority.active).toEqual({ value: result, status: 'ready' })
  })

  it('ignores late operations for a different result', () => {
    const authority = new ResultAuthority<object>()
    const current = {}
    const stale = {}
    authority.retain(current)

    expect(authority.beginSave(stale)).toBe(false)
    expect(authority.beginDiscard(stale)).toBe(false)
    expect(authority.release(stale)).toBe(false)
    expect(authority.active?.value).toBe(current)
  })
})
