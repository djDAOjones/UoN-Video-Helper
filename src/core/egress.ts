/**
 * Watching what leaves a realm.
 *
 * Lives in `core/` rather than with the acceptance harness because criterion
 * 9's instruments are per-global and the job runs in a worker: the harness
 * cannot observe the realm the media is actually in, so the worker has to run
 * a watch of its own. Development only in practice — the acceptance page is
 * not built — but it is imported by the worker, which is production code.
 */

export interface EgressRecord {
  readonly url: string
  readonly method: string
  /**
   * Bytes sent in the request body, which is what "media egress" would mean.
   *
   * `-1` means a body was present but is not measurable without consuming the
   * stream — a `Request` built with one. Unknown size, known presence, and
   * presence is the finding.
   */
  readonly bodyBytes: number
}

/** A body was sent, whether or not its size could be counted. */
export function carriedBody(record: EgressRecord): boolean {
  return record.bodyBytes !== 0
}

/**
 * Joins the main thread's observations with a worker's.
 *
 * Neither realm can see the other's requests, and a verdict drawn from one of
 * them is a verdict about half the app.
 */
export function mergeEgress(...reports: readonly EgressReport[]): EgressReport {
  const allRequests = reports.flatMap((report) => report.allRequests)
  return {
    withBody: reports.flatMap((report) => report.withBody),
    allRequests,
    crossOrigin: reports.flatMap((report) => report.crossOrigin),
  }
}

export interface EgressReport {
  /** Requests that carried an outbound body. Any entry here is a finding. */
  readonly withBody: readonly EgressRecord[]
  /** Every request the page made, from the browser's own resource timeline. */
  readonly allRequests: readonly string[]
  /** Requests to an origin other than this one. */
  readonly crossOrigin: readonly string[]
}

/**
 * Watches for any data leaving one global.
 *
 * Spec section 13, criterion 9: zero media egress. Two instruments, because
 * neither is sufficient alone.
 *
 * `fetch` and `sendBeacon` are wrapped to catch request BODIES, which is what
 * an upload actually is and which no passive observer reports. Separately, the
 * browser's own resource timeline is read, which catches every request however
 * it was made — including by code that does not exist yet and would not think
 * to use the wrapped paths. Neither XHR nor any other API can hide from the
 * second, which is why the first does not need to cover them.
 *
 * ONE GLOBAL is the load-bearing word. Both instruments are per-realm: a
 * worker has its own `fetch` and its own resource timeline, and the job —
 * including the only fetch this app actually makes at runtime, for branding —
 * runs in a worker. So criterion 9 was reading a timeline that contained none
 * of the app's real requests and calling it a pass (review R-11). The worker
 * runs its own watch and reports back; {@link mergeEgress} joins them.
 */
export class EgressWatch {
  private readonly records: EgressRecord[] = []
  private restore: (() => void)[] = []
  private startedAt = 0

  start(): void {
    this.startedAt = performance.now()
    const records = this.records

    const originalFetch = globalThis.fetch
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      const method = init?.method ?? (input instanceof Request ? input.method : 'GET')
      // A body can arrive two ways. `fetch(url, { body })` is the obvious one;
      // `fetch(new Request(url, { body }))` puts it on the Request, where
      // reading `init.body` finds nothing and the upload sails past (R-11).
      const requestBody = input instanceof Request && input.body !== null
      records.push({
        url,
        method,
        bodyBytes: requestBody ? -1 : bodySize(init?.body),
      })
      return originalFetch(input, init)
    }
    this.restore.push(() => {
      globalThis.fetch = originalFetch
    })

    if (typeof navigator.sendBeacon === 'function') {
      const originalBeacon = navigator.sendBeacon.bind(navigator)
      navigator.sendBeacon = (url: string | URL, data?: BodyInit | null) => {
        records.push({ url: String(url), method: 'beacon', bodyBytes: bodySize(data) })
        return originalBeacon(url, data)
      }
      this.restore.push(() => {
        navigator.sendBeacon = originalBeacon
      })
    }
  }

  stop(): EgressReport {
    for (const undo of this.restore) undo()
    this.restore = []

    const since = this.startedAt
    const entries = performance
      .getEntriesByType('resource')
      .filter((entry) => entry.startTime >= since)
      .map((entry) => entry.name)

    return {
      withBody: this.records.filter(carriedBody),
      allRequests: entries,
      crossOrigin: entries.filter((url) => {
        try {
          return new URL(url, location.href).origin !== location.origin
        } catch {
          return true
        }
      }),
    }
  }
}

function bodySize(body: unknown): number {
  if (typeof body === 'string') return body.length
  if (body instanceof Blob) return body.size
  if (body instanceof ArrayBuffer) return body.byteLength
  if (ArrayBuffer.isView(body)) return body.byteLength
  if (body instanceof FormData || body instanceof URLSearchParams) return 1
  return 0
}
