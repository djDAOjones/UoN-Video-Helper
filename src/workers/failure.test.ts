/**
 * VH-110: the worker names a failure from what it knows about it.
 */

import { describe, expect, it } from 'vitest'

import { KeptRangeError } from '../media/kept-range'
import { UnreadableFileError } from '../media/inspect'
import { JobFailureError, classifyFailure } from './failure'

describe('classifyFailure', () => {
  it('carries a named failure through', () => {
    expect(classifyFailure(new JobFailureError('output-loudness', 'x'))).toBe('output-loudness')
    expect(classifyFailure(new JobFailureError('unlevellable', 'x'))).toBe('unlevellable')
  })

  it('reads the errors that already name themselves', () => {
    expect(classifyFailure(new UnreadableFileError('not-a-video', 'no'))).toBe('unreadable-source')
    expect(classifyFailure(new KeptRangeError('too-short', 'no'))).toBe('bad-trim')
  })

  it('reads the browser\'s own names for a full store and a refused encode', () => {
    const quota = Object.assign(new Error('The quota has been exceeded.'), { name: 'QuotaExceededError' })
    expect(classifyFailure(quota)).toBe('out-of-space')
    const refused = Object.assign(new Error('Unsupported configuration'), { name: 'NotSupportedError' })
    expect(classifyFailure(refused)).toBe('encoder-refused')
    const broken = Object.assign(new Error('Decoding error'), { name: 'EncodingError' })
    expect(classifyFailure(broken)).toBe('encoder-refused')
  })

  it('calls anything else unknown rather than guessing', () => {
    expect(classifyFailure(new Error('boom'))).toBe('unknown')
    expect(classifyFailure('boom')).toBe('unknown')
    expect(classifyFailure(null)).toBe('unknown')
  })
})
