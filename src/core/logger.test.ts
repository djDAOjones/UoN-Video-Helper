/**
 * The logger's invariant is that it is *bounded*. A one-hour encode must not
 * be able to grow the diagnostics buffer without limit.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import {
  LOG_BUFFER_CAPACITY,
  clearLogRecords,
  getLogRecords,
  log,
  setMinimumLogLevel,
} from './logger'

describe('logger', () => {
  beforeEach(() => {
    clearLogRecords()
    setMinimumLogLevel('debug')
  })

  it('records scope, level and message', () => {
    log.info('pipeline', 'pass 1 complete', { integratedLufs: -18.2 })
    const [entry] = getLogRecords()
    expect(entry?.scope).toBe('pipeline')
    expect(entry?.level).toBe('info')
    expect(entry?.message).toBe('pass 1 complete')
    expect(entry?.data).toEqual({ integratedLufs: -18.2 })
  })

  it('drops the oldest records rather than growing without bound', () => {
    for (let i = 0; i < LOG_BUFFER_CAPACITY + 250; i++) log.debug('test', `record ${i}`)
    const records = getLogRecords()
    expect(records).toHaveLength(LOG_BUFFER_CAPACITY)
    expect(records[0]?.message).toBe('record 250')
    expect(records.at(-1)?.message).toBe(`record ${LOG_BUFFER_CAPACITY + 249}`)
  })

  it('honours the minimum level so debug never reaches a user console', () => {
    setMinimumLogLevel('info')
    log.debug('test', 'suppressed')
    log.warn('test', 'kept')
    const records = getLogRecords()
    expect(records).toHaveLength(1)
    expect(records[0]?.message).toBe('kept')
  })
})
