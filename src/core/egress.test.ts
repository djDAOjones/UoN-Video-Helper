/**
 * Criterion 9 is the headline promise — nothing leaves the device — so the
 * ways it could report green without having looked are worth pinning
 * (VH-62 / review R-11).
 */

import { describe, expect, it } from 'vitest'

import {
  EgressWatch,
  carriedBody,
  mergeEgress,
  type EgressRecord,
  type EgressReport,
} from './egress'

const record = (over: Partial<EgressRecord> = {}): EgressRecord => ({
  url: '/branding/closing-tail-blue-1080p.mp4',
  method: 'GET',
  bodyBytes: 0,
  ...over,
})

const report = (over: Partial<EgressReport> = {}): EgressReport => ({
  withBody: [],
  allRequests: [],
  crossOrigin: [],
  ...over,
})

describe('carriedBody', () => {
  it('is false for an ordinary inbound fetch', () => {
    expect(carriedBody(record())).toBe(false)
  })

  it('is true for a measured body', () => {
    expect(carriedBody(record({ bodyBytes: 1 }))).toBe(true)
  })

  it('is true for a body whose size could not be measured', () => {
    // `fetch(new Request(url, { body }))` puts the body on the Request, where
    // reading `init.body` finds nothing. Unknown size, known presence — and
    // presence is the finding.
    expect(carriedBody(record({ bodyBytes: -1 }))).toBe(true)
  })
})

describe('mergeEgress', () => {
  it('describes both realms, not whichever was asked first', () => {
    // The defect: the page's watch cannot see the worker's fetch or its
    // resource timeline, and the job runs in the worker.
    const page = report({ allRequests: ['/index.html'] })
    const worker = report({ allRequests: ['/branding/closing-tail-blue-1080p.mp4'] })
    expect(mergeEgress(page, worker).allRequests).toEqual([
      '/index.html',
      '/branding/closing-tail-blue-1080p.mp4',
    ])
  })

  it('keeps a finding from either realm', () => {
    const clean = report({ allRequests: ['/index.html'] })
    const leaking = report({ withBody: [record({ method: 'POST', bodyBytes: 4_000_000 })] })
    expect(mergeEgress(clean, leaking).withBody).toHaveLength(1)
    expect(mergeEgress(leaking, clean).withBody).toHaveLength(1)
  })

  it('keeps a cross-origin request from either realm', () => {
    const worker = report({ crossOrigin: ['https://example.com/upload'] })
    expect(mergeEgress(report(), worker).crossOrigin).toEqual(['https://example.com/upload'])
  })

  it('merging nothing with nothing is still nothing', () => {
    expect(mergeEgress(report(), report())).toEqual(report())
  })
})

describe('EgressWatch', () => {
  /**
   * VH-84. A resource-timing entry appears when a request COMPLETES, so
   * anything still in flight when the watch stops is absent from the timeline.
   * A HEAD to a branding asset went unlisted that way — the no-egress verdict
   * was unaffected, because that rests on the body wrapper, but the request
   * COUNT was reported as a census when it was not one.
   */
  it('lists a request the timeline has not finished, because the wrapper saw it', () => {
    const originalFetch = globalThis.fetch
    // Never settles: the request is still in flight when the watch stops,
    // which is exactly the case the timeline cannot report.
    globalThis.fetch = () => new Promise<Response>(() => {})

    try {
      const watch = new EgressWatch()
      watch.start()
      void globalThis.fetch('https://example.test/branding.mp4', { method: 'HEAD' })
      const report = watch.stop()

      expect(report.allRequests).toContain('https://example.test/branding.mp4')
      expect(report.crossOrigin).toContain('https://example.test/branding.mp4')
      // Still no finding: a HEAD carries no body, and that is what egress means.
      expect(report.withBody).toEqual([])
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('counts a request both instruments saw once, not twice', () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = () => new Promise<Response>(() => {})

    try {
      const watch = new EgressWatch()
      watch.start()
      void globalThis.fetch('https://example.test/a')
      void globalThis.fetch('https://example.test/a')
      const report = watch.stop()

      expect(report.allRequests.filter((url) => url === 'https://example.test/a')).toHaveLength(1)
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})
