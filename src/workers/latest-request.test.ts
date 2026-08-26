import { describe, expect, it } from 'vitest'

import { LatestRequest } from './latest-request'

describe('LatestRequest', () => {
  it('aborts a superseded request synchronously', () => {
    const latest = new LatestRequest()
    const first = latest.begin(1)
    const second = latest.begin(2)

    expect(first.signal.aborted).toBe(true)
    expect(second.signal.aborted).toBe(false)
  })

  it('does not let an old finally clear the newer request', () => {
    const latest = new LatestRequest()
    const first = latest.begin(1)
    const second = latest.begin(2)
    latest.finish(1, first)
    latest.cancel(2)

    expect(second.signal.aborted).toBe(true)
  })
})
