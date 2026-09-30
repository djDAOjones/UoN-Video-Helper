/**
 * The logger's invariant is that it is *bounded*. A one-hour encode must not
 * be able to grow the diagnostics buffer without limit.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import {
  LOG_BUFFER_CAPACITY,
  adoptLogRecords,
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

  it("adopts the worker's records once, however many times they are handed over", () => {
    // `drainLogs` answers with a copy of the worker's whole buffer each time
    // (VH-93: a second feedback report showed every worker line twice).
    log.info('main', 'on the main thread')
    const worker = [
      { ts: 1, level: 'info' as const, scope: 'worker', message: 'one' },
      { ts: 2, level: 'info' as const, scope: 'worker', message: 'two' },
    ]
    adoptLogRecords(worker)
    adoptLogRecords([...worker, { ts: 3, level: 'info' as const, scope: 'worker', message: 'three' }])
    expect(getLogRecords().map((entry) => entry.message)).toEqual(['one', 'two', 'three', 'on the main thread'])
  })
})
