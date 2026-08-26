/**
 * P1-11: protocol-level evidence that the app sends no media off-device.
 *
 * The clean phase first requires a small silent job through the production
 * worker and an acknowledged discard. The broader AAC acceptance run remains
 * supplemental evidence because Firefox cannot currently encode AAC-LC. Only
 * after both do deliberate, harmless canaries run. `run-in-engines.mjs
 * --watch-egress` excludes those reserved control URLs from the clean finding
 * set but refuses to pass unless it sees every one through the browser
 * protocol.
 *
 * Dev-only; `vite.config.ts` builds `index.html` alone.
 */

import {
  isKnownAacEncoderUnsupported,
  runAcceptance,
  runSilentWorkerProof,
} from '../acceptance/run'
import type { EgressWorkerRequest, EgressWorkerResponse } from './egress.worker'

const CONTROL_QUERY = 'vh-egress-control'
const RUN_QUERY = 'vh-egress-run'
const PROBE_PATH = '/__vh_egress_probe__'
const CONTROL_TIMEOUT_MS = 10_000
const log = document.getElementById('log') as HTMLPreElement
const lines: string[] = []
const runNonce = new URL(location.href).searchParams.get(RUN_QUERY)

function say(message: string): void {
  lines.push(message)
  log.textContent = lines.join('\n')
}

function endpoint(control: string, origin = location.origin): URL {
  if (!runNonce) throw new Error('the protocol runner did not provide a probe nonce')
  const url = new URL(PROBE_PATH, origin)
  url.searchParams.set(CONTROL_QUERY, control)
  url.searchParams.set(RUN_QUERY, runNonce)
  return url
}

/** Attempts one fetch within the control deadline and always clears its timer. */
async function issueFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<void> {
  const controller = new AbortController()
  const timer = setTimeout(
    () => controller.abort(new DOMException('egress control timed out', 'TimeoutError')),
    CONTROL_TIMEOUT_MS,
  )
  try {
    await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/** Resolves after XHR has attempted the request, regardless of the probe response status. */
function issueXhr(url: URL, body: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    const cleanup = (): void => {
      request.onloadend = null
      request.onerror = null
      request.ontimeout = null
      request.onabort = null
    }
    const finish = (outcome: () => void): void => {
      cleanup()
      outcome()
    }
    request.open('POST', url)
    request.timeout = CONTROL_TIMEOUT_MS
    request.onloadend = () => finish(resolve)
    request.onerror = () => finish(resolve)
    request.ontimeout = () =>
      finish(() => reject(new Error(`XHR did not finish within ${CONTROL_TIMEOUT_MS} ms`)))
    request.onabort = () => finish(() => reject(new Error('XHR control was aborted')))
    try {
      request.send(body)
    } catch (cause) {
      finish(() => reject(cause instanceof Error ? cause : new Error(String(cause))))
    }
  })
}

/** Resolves only after the dedicated worker has completed its synthetic POST. */
function issueWorker(url: URL, body: string): Promise<void> {
  const worker = new Worker(new URL('./egress.worker.ts', import.meta.url), {
    type: 'module',
    name: 'uon-egress-negative-control',
  })
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      finish()
      reject(new Error(`worker fetch did not finish within ${CONTROL_TIMEOUT_MS} ms`))
    }, CONTROL_TIMEOUT_MS)
    const finish = (): void => {
      clearTimeout(timer)
      worker.terminate()
    }
    worker.addEventListener('error', (event) => {
      finish()
      reject(new Error(event.message || 'egress probe worker failed'))
    })
    worker.addEventListener('message', (event: MessageEvent<EgressWorkerResponse>) => {
      finish()
      if (event.data.kind === 'failed') reject(new Error(event.data.message))
      else resolve()
    })
    worker.postMessage({ url: url.href, body } satisfies EgressWorkerRequest)
  })
}

/** Queues one handshake and keeps the socket bounded while the protocol observer settles. */
function issueWebSocket(url: URL, protocol: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let socket: WebSocket
    let cleaned = false
    const cleanup = (): void => {
      if (cleaned) return
      cleaned = true
      clearTimeout(timer)
      socket.onopen = null
      socket.onerror = null
      socket.onclose = null
      if (socket.readyState === WebSocket.OPEN) socket.close()
    }
    const timer = setTimeout(cleanup, CONTROL_TIMEOUT_MS)

    try {
      socket = new WebSocket(url, protocol)
      socket.onopen = cleanup
      // A non-upgrading Vite route is expected; failure still proves the
      // outgoing handshake reached the browser network stack.
      socket.onerror = cleanup
      socket.onclose = cleanup
      resolve()
    } catch (cause) {
      clearTimeout(timer)
      reject(cause instanceof Error ? cause : new Error(String(cause)))
    }
  })
}

/** The alternate loopback spelling is local but still a genuinely different origin. */
function alternateLoopbackOrigin(): string {
  const url = new URL(location.href)
  url.hostname = url.hostname === '127.0.0.1' ? 'localhost' : '127.0.0.1'
  return url.origin
}

async function run(): Promise<void> {
  let failures = 0
  if (!runNonce) {
    failures++
    say('FAIL — this page must be launched by run-in-engines.mjs --watch-egress')
  }
  say('=== required clean phase: silent production-worker job')
  try {
    const proof = await runSilentWorkerProof()
    say(
      `  PASS — produced ${(proof.bytes / 1024).toFixed(0)} kB over ${proof.durationSeconds.toFixed(2)}s and acknowledged discard`,
    )
  } catch (cause) {
    failures++
    say(
      `  FAIL — silent production-worker proof did not complete and discard: ${cause instanceof Error ? cause.message : String(cause)}`,
    )
  }

  say('\n=== supplemental clean phase: full AAC acceptance run')
  try {
    const report = await runAcceptance((message) => say(`  ${message}`))
    const failed = report.checks.filter((check) => check.status === 'fail').length
    failures += failed
    say(
      `  supplemental acceptance finished: ${report.checks.length - failed} non-failing, ${failed} unrelated criterion failure(s)`,
    )
  } catch (cause) {
    if (isKnownAacEncoderUnsupported(cause)) {
      say(
        '  KNOWN LIMITATION — AAC-LC encoding is unsupported in this browser; the required silent production-worker proof remains valid',
      )
    } else {
      failures++
      say(
        `  FAIL — unrelated supplemental acceptance error: ${cause instanceof Error ? cause.message : String(cause)}`,
      )
    }
  }

  say('\n=== negative controls: synthetic data only')
  const canary = `vh-egress-${crypto.randomUUID()}`
  const controls: ReadonlyArray<{ readonly id: string; readonly run: () => Promise<void> }> = [
    {
      id: 'request-body',
      run: async () => {
        const request = new Request(endpoint('request-body'), {
          method: 'POST',
          body: `request:${canary}`,
        })
        await issueFetch(request)
      },
    },
    {
      id: 'page-fetch',
      run: async () => {
        await issueFetch(endpoint('page-fetch'), {
          method: 'POST',
          body: `fetch:${canary}`,
        })
      },
    },
    {
      id: 'xhr',
      run: () => issueXhr(endpoint('xhr'), `xhr:${canary}`),
    },
    {
      id: 'worker-fetch',
      run: () => issueWorker(endpoint('worker-fetch'), `worker:${canary}`),
    },
    {
      id: 'beacon',
      run: () => {
        if (!navigator.sendBeacon(endpoint('beacon'), `beacon:${canary}`)) {
          return Promise.reject(new Error('sendBeacon refused the synthetic request'))
        }
        return Promise.resolve()
      },
    },
    {
      id: 'cross-origin',
      run: async () => {
        await issueFetch(endpoint('cross-origin', alternateLoopbackOrigin()), {
          mode: 'no-cors',
        }).catch(() => undefined)
      },
    },
    {
      id: 'url-canary',
      run: async () => {
        const url = endpoint('url-canary')
        url.searchParams.set('vh-media-filename', `${canary}.mp4`)
        url.searchParams.set('vh-media-width', '3840')
        await issueFetch(url)
      },
    },
    {
      id: 'header-canary',
      run: async () => {
        await issueFetch(endpoint('header-canary'), {
          headers: {
            'X-VH-Media-Filename': `${canary}.mp4`,
            'X-VH-Media-Width': '3840',
          },
        })
      },
    },
    {
      id: 'raw-header-canary',
      run: async () => {
        const cookieName = 'vh-egress-raw-header'
        const cookieValue = `${canary}.mp4`
        document.cookie = `${cookieName}=${cookieValue}; Path=/; SameSite=Strict`
        if (!document.cookie.includes(`${cookieName}=${cookieValue}`)) {
          throw new Error('the raw-header canary cookie was not accepted')
        }
        try {
          await issueFetch(endpoint('raw-header-canary'))
        } finally {
          document.cookie = `${cookieName}=; Path=/; Max-Age=0; SameSite=Strict`
        }
      },
    },
    {
      id: 'websocket-handshake',
      run: async () => {
        const url = endpoint('websocket-handshake')
        url.searchParams.set('vh-media-filename', `${canary}.mp4`)
        url.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
        await issueWebSocket(url, `${canary}.mp4`)
      },
    },
    {
      id: 'websocket-frame',
      run: () => {
        if (!import.meta.hot) {
          return Promise.reject(new Error('Vite HMR socket is unavailable'))
        }
        import.meta.hot.send(CONTROL_QUERY, {
          control: 'websocket-frame',
          run: runNonce,
          canary,
        })
        return Promise.resolve()
      },
    },
  ]

  for (const control of controls) {
    try {
      await control.run()
      say(`  issued ${control.id}`)
    } catch (cause) {
      failures++
      say(
        `  FAIL — ${control.id} was not issued: ${cause instanceof Error ? cause.message : String(cause)}`,
      )
    }
  }

  say(`\nresult: ${failures === 0 ? 'pass' : 'fail'}`)
  say('done')
}

void run()
