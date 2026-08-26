import { describe, expect, it } from 'vitest'

import { SelectionAuthority } from './selection-authority'

describe('SelectionAuthority', () => {
  it('accepts only the current selection as an immutable ready job', () => {
    const authority = new SelectionAuthority<object, 'best' | 'smaller'>()
    const file = {}
    const selection = authority.begin(file, 'best')

    const ready = authority.accept(selection)

    expect(ready).toEqual({ generation: 1, file, presetId: 'best' })
    expect(Object.isFrozen(ready)).toBe(true)
    expect(authority.readyJob).toBe(ready)
  })

  it('invalidates a ready job immediately when a different file is selected', () => {
    const authority = new SelectionAuthority<object, 'best'>()
    const first = authority.begin({}, 'best')
    authority.accept(first)

    const second = authority.begin({}, 'best')

    expect(authority.readyJob).toBeNull()
    expect(authority.isCurrent(first)).toBe(false)
    expect(authority.accept(first)).toBeNull()
    expect(authority.accept(second)?.generation).toBe(2)
  })

  it('invalidates a ready job when the preset changes for the same file', () => {
    const authority = new SelectionAuthority<object, 'best' | 'smaller'>()
    const file = {}
    const best = authority.begin(file, 'best')
    authority.accept(best)

    const smaller = authority.begin(file, 'smaller')

    expect(authority.readyJob).toBeNull()
    expect(authority.accept(best)).toBeNull()
    expect(authority.accept(smaller)?.presetId).toBe('smaller')
  })

  it('does not replace the current ready job when an older response arrives late', () => {
    const authority = new SelectionAuthority<object, 'best' | 'smaller'>()
    const file = {}
    const stale = authority.begin(file, 'best')
    const current = authority.begin(file, 'smaller')
    const ready = authority.accept(current)

    expect(authority.accept(stale)).toBeNull()
    expect(authority.readyJob).toBe(ready)
  })

  it('rejects stale work after the file selection is cleared', () => {
    const authority = new SelectionAuthority<object, 'best'>()
    const pending = authority.begin({}, 'best')

    authority.invalidate()

    expect(authority.readyJob).toBeNull()
    expect(authority.isCurrent(pending)).toBe(false)
    expect(authority.accept(pending)).toBeNull()
  })

  it('revokes Start authority while keeping the checked selection current', () => {
    const authority = new SelectionAuthority<object, 'best'>()
    const selection = authority.begin({}, 'best')
    authority.accept(selection)

    expect(authority.revoke(selection)).toBe(true)
    expect(authority.readyJob).toBeNull()
    expect(authority.isCurrent(selection)).toBe(true)
    expect(authority.accept(selection)?.generation).toBe(1)
  })
})
