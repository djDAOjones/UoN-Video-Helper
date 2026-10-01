/**
 * VH-110: every known failure says what happened, that the original is safe
 * once, and what to do next — spec 9.2.
 */

import { describe, expect, it } from 'vitest'

import type { FailureCode } from '../workers/failure'
import { ORIGINAL_UNCHANGED, failureSentence, failureText, startupFailureText } from './failure-text'

const CODES: readonly FailureCode[] = [
  'unreadable-source',
  'bad-trim',
  'unlevellable',
  'output-loudness',
  'output-peak',
  'output-unreadable',
  'out-of-space',
  'encoder-refused',
  'check-failed',
  'timed-out',
  'unknown',
]

describe('failureText', () => {
  it.each(CODES)('%s has its own what and next, and says the original is safe once', (code) => {
    const text = failureText(code)
    expect(text.what.length).toBeGreaterThan(10)
    expect(text.next.length).toBeGreaterThan(10)
    const sentence = failureSentence(text)
    expect(sentence.match(/original file/g)).toHaveLength(1)
    expect(sentence).toContain(ORIGINAL_UNCHANGED)
    expect(sentence).not.toMatch(/Something went wrong.*Something went wrong/)
  })

  it('fits the next step to the cause', () => {
    expect(failureText('unlevellable').next).not.toMatch(/different file|try again/i)
    expect(failureText('out-of-space').next).toContain('Free some space')
    expect(failureText('encoder-refused').next).toContain('other output')
    expect(failureText('unreadable-source').next).toContain('Choose a different file')
    expect(failureText('bad-trim').next).toContain('step 2')
  })

  it('keeps the worker\'s own sentence for the failures that carry one', () => {
    expect(failureText('unreadable-source', 'This file has sound but no video.').what).toBe(
      'This file has sound but no video.',
    )
    expect(failureText('bad-trim', 'The end must come after the start.').what).toBe(
      'The end must come after the start.',
    )
  })

  it('never names a code word or a unit', () => {
    for (const code of CODES) {
      expect(failureSentence(failureText(code))).not.toMatch(/LUFS|dBTP|codec|OPFS|WebCodecs|verification/)
    }
  })
})

describe('startupFailureText', () => {
  const ok = { secureContext: true, webCodecs: true, h264: true, workingStore: true, workerStarted: true }
  const elsewhere = { chromeOnComputer: false }
  const here = { chromeOnComputer: true }

  it('is silent when nothing blocks', () => {
    expect(startupFailureText(ok, elsewhere)).toBeNull()
  })

  it('names the first cause in words, with the remedy that fits it', () => {
    expect(startupFailureText({ ...ok, secureContext: false }, elsewhere)).toContain('https://')
    expect(startupFailureText({ ...ok, webCodecs: false }, elsewhere)).toContain('Chrome on a computer')
    expect(startupFailureText({ ...ok, webCodecs: false }, here)).not.toContain('Chrome on a computer')
    expect(startupFailureText({ ...ok, webCodecs: false }, here)).toContain('Update Chrome')
    expect(startupFailureText({ ...ok, workingStore: false }, elsewhere)).toContain('ordinary window')
    expect(startupFailureText({ ...ok, workerStarted: false }, elsewhere)).toContain('Reload the page')
  })

  it('never says WebCodecs or secure context to a novice', () => {
    for (const flag of ['secureContext', 'webCodecs', 'h264', 'workingStore', 'workerStarted'] as const) {
      const text = startupFailureText({ ...ok, [flag]: false }, elsewhere)
      expect(text).not.toMatch(/WebCodecs|secure context|H\.264|OPFS|worker/i)
    }
  })
})
