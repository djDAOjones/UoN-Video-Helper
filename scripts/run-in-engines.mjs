#!/usr/bin/env node
/**
 * Runs one of the maintainer spike pages in Chrome, Firefox and Safari, and
 * prints what each engine reported, side by side.
 *
 * `conventions.md` says browser-only checks are verified by hand and recorded.
 * Recording a check nobody can re-run is weak, and three browsers driven by
 * hand is exactly the chore that stops getting done — VH-34 found the closing
 * composite broken in Firefox only because all three were finally measured
 * together. This is that measurement, made repeatable.
 *
 * The terminal contract is a `<pre id="log">` ending with
 * `result: pass|fail|informational` and then a line of exactly `done`. Legacy
 * assertion markers are recognised while existing pages migrate; a visible
 * FAIL is never counted as a completed engine run.
 *
 * Each engine needs a different protocol, and the differences are not
 * negotiable:
 *
 *   Chrome   CDP.               `/json/version` gives the WebSocket URL.
 *   Firefox  WebDriver BiDi.    CDP was dropped; `/json/version` 404s.
 *   Safari   WebDriver classic. Plain HTTP, via `safaridriver`.
 *
 * Safari also needs a one-time human step: Settings -> Advanced -> "Show
 * features for web developers", then Develop -> "Allow Remote Automation".
 * Without it `safaridriver` refuses the session and says so.
 *
 * NOT part of `npm run check`, and it must not become part of it. Three
 * browsers saturate the machine, and the DSP suite then fails on timeout
 * rather than on merit — `chain.test.ts` took 540 s and failed a test the one
 * time they overlapped, against ~4 s idle.
 *
 * Usage, with the dev server already running:
 *
 *   node scripts/run-in-engines.mjs /spike-alpha.html
 *   node scripts/run-in-engines.mjs /spike-modes.html --base http://localhost:5173
 *   node scripts/run-in-engines.mjs /spike-alpha.html --engines chrome,firefox
 *   node scripts/run-in-engines.mjs /spike-alpha.html --require-all
 *   node scripts/run-in-engines.mjs --watch-egress --engines chrome,firefox --require-all
 */

import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  assessEgress,
  classifyEgressWebSocketControl,
  EGRESS_CONTROL_IDS,
  EGRESS_RUN_QUERY,
  formatEngineSummary,
  isExactViteHmr,
  normalizeBidiRequest,
  normalizeCdpExtraHeaders,
  normalizeCdpRequest,
  normalizeCdpWebSocketFrame,
  normalizeCdpWebSocketHandshake,
  normalizeCdpWebSocketMetadata,
  parsePageTerminal,
  parseRunnerArgs,
  protocolReplyError,
  summarizeEngineResults,
} from './run-in-engines-lib.mjs'

/** Where each engine lives, and how it is started. macOS paths. */
const ENGINES = {
  chrome: {
    label: 'Chrome',
    binary: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    port: 9333,
  },
  firefox: {
    label: 'Firefox',
    binary: '/Applications/Firefox.app/Contents/MacOS/firefox',
    port: 9222,
  },
  safari: { label: 'Safari', binary: '/usr/bin/safaridriver', port: 9515 },
}

/** How long to wait for a page to reach its `done` sentinel. A 4K alpha decode
 *  is seconds, not milliseconds, and a cold browser start adds its own. */
const PAGE_TIMEOUT_MS = 120_000
/** The full acceptance corpus encodes several long fixtures in sequence. */
const EGRESS_PAGE_TIMEOUT_MS = 900_000
const POLL_MS = 500
/** How long a freshly spawned browser gets to open its automation port. Generous
 *  on purpose: a cold Chrome under load has taken well over 20 s here, and a
 *  timeout reads as "the browser is broken" when it only means "the machine is
 *  busy". */
const START_TIMEOUT_MS = 60_000
/** Bounds every automation protocol round-trip, including setup before page polling. */
const PROTOCOL_TIMEOUT_MS = 30_000
/** Negative controls must arrive promptly after the long clean phase completes. */
const EGRESS_SETTLE_TIMEOUT_MS = 10_000
const EGRESS_SETTLE_POLL_MS = 50
const EGRESS_QUIET_MS = 250
const FIREFOX_UNSUPPORTED_EGRESS_CONTROLS = ['websocket-frame']

const children = []
const scratchDirs = []

function cleanUp() {
  for (const child of children.splice(0)) {
    try {
      child.kill('SIGTERM')
    } catch {
      // Already gone. Nothing to do, and nothing worth saying.
    }
  }
  for (const dir of scratchDirs.splice(0)) {
    try {
      // A browser keeps writing to its profile for a moment after SIGTERM, so
      // a plain rm races it and throws ENOTEMPTY. Retry briefly, then let it
      // go — a stranded temp directory is not worth failing a run over, and
      // the OS reaps it.
      rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 })
    } catch {
      // Deliberately silent. See above.
    }
  }
}

process.on('exit', cleanUp)
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    cleanUp()
    process.exit(130)
  })
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Spawns a browser detached from this script's stdio, and remembers it for cleanup. */
function launch(binary, args) {
  const child = spawn(binary, args, { stdio: 'ignore' })
  children.push(child)
  return child
}

function scratch(prefix) {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  scratchDirs.push(dir)
  return dir
}

/** Polls a URL until it answers anything at all, so we drive a browser that is actually up. */
async function waitForPort(url) {
  const deadline = Date.now() + START_TIMEOUT_MS
  while (Date.now() < deadline) {
    try {
      await fetch(url, { signal: AbortSignal.timeout(1000) })
      return true
    } catch {
      await sleep(250)
    }
  }
  return false
}

/**
 * A request/response WebSocket client shared by CDP and BiDi.
 *
 * Both protocols are the same shape — an incrementing `id`, a `method`, and a
 * reply carrying that id — so one client serves both and only the message
 * bodies differ.
 */
async function connect(url) {
  const socket = new WebSocket(url)
  const pending = new Map()
  const eventListeners = new Set()
  const failPending = (cause) => {
    for (const { reject, timer } of pending.values()) {
      globalThis.clearTimeout(timer)
      reject(cause)
    }
    pending.clear()
  }
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    const call = message.id !== undefined ? pending.get(message.id) : undefined
    if (call) {
      pending.delete(message.id)
      globalThis.clearTimeout(call.timer)
      const protocolError = protocolReplyError(message, call.method)
      if (protocolError) call.reject(protocolError)
      else call.resolve(message)
      return
    }
    if (message.id === undefined) {
      for (const listener of eventListeners) listener(message)
    }
  })
  socket.addEventListener('close', () => {
    failPending(new Error(`automation socket closed: ${url}`))
  })
  socket.addEventListener('error', () => {
    failPending(new Error(`automation socket failed: ${url}`))
  })
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.close()
      reject(new Error(`automation socket did not open within ${PROTOCOL_TIMEOUT_MS} ms`))
    }, PROTOCOL_TIMEOUT_MS)
    socket.addEventListener(
      'open',
      () => {
        globalThis.clearTimeout(timer)
        resolve()
      },
      { once: true },
    )
    socket.addEventListener(
      'error',
      () => {
        globalThis.clearTimeout(timer)
        reject(new Error(`could not connect to ${url}`))
      },
      { once: true },
    )
    socket.addEventListener(
      'close',
      () => {
        globalThis.clearTimeout(timer)
        reject(new Error(`automation socket closed before opening: ${url}`))
      },
      { once: true },
    )
  })

  let nextId = 1
  return {
    send(method, params, extra = {}) {
      return new Promise((resolve, reject) => {
        const id = nextId++
        const timer = setTimeout(() => {
          pending.delete(id)
          reject(new Error(`${method} did not answer within ${PROTOCOL_TIMEOUT_MS} ms`))
        }, PROTOCOL_TIMEOUT_MS)
        pending.set(id, { resolve, reject, timer, method })
        try {
          socket.send(JSON.stringify({ id, method, params, ...extra }))
        } catch (cause) {
          globalThis.clearTimeout(timer)
          pending.delete(id)
          reject(cause)
        }
      })
    },
    onEvent(listener) {
      eventListeners.add(listener)
      return () => eventListeners.delete(listener)
    },
    close: () => socket.close(),
  }
}

/**
 * Polls the page's `#log` until it ends with an exact terminal result and `done`.
 *
 * @param read - Evaluates an expression in the page and returns its value.
 * @returns The log text, plus whether the page finished or the wait timed out.
 */
async function readUntilDone(read, timeoutMs = PAGE_TIMEOUT_MS) {
  const deadline = Date.now() + timeoutMs
  let text = ''
  while (Date.now() < deadline) {
    text = String((await read("document.getElementById('log')?.textContent ?? ''")) ?? '')
    const terminal = parsePageTerminal(text)
    if (terminal.finished) return { text, ...terminal }
    await sleep(POLL_MS)
  }
  return { text, finished: false, result: null }
}

function targetSource(type) {
  if (String(type).includes('worker')) return 'worker'
  if (type === 'page' || type === 'iframe') return 'page'
  return 'unknown'
}

function socketKey(sessionId, requestId) {
  return `${sessionId ?? '<browser>'}:${requestId}`
}

function controlsMissingForCoverage(assessment, coverage) {
  return assessment.missingControls.filter(
    (control) => coverage === 'full' || !FIREFOX_UNSUPPORTED_EGRESS_CONTROLS.includes(control),
  )
}

/** Waits for all observable controls and a short event-quiet interval, within a hard bound. */
async function waitForEgressAssessment(records, coverage, revision) {
  const deadline = Date.now() + EGRESS_SETTLE_TIMEOUT_MS
  let stableRevision = -1
  let stableSince = 0

  while (Date.now() < deadline) {
    const assessment = assessEgress(records)
    const ready =
      assessment.findings.length === 0 &&
      controlsMissingForCoverage(assessment, coverage).length === 0
    const currentRevision = revision()

    if (ready) {
      if (currentRevision !== stableRevision) {
        stableRevision = currentRevision
        stableSince = Date.now()
      } else if (Date.now() - stableSince >= EGRESS_QUIET_MS) {
        return assessment
      }
    } else {
      stableRevision = currentRevision
      stableSince = 0
    }
    await sleep(EGRESS_SETTLE_POLL_MS)
  }

  return assessEgress(records)
}

/**
 * Correlates CDP's ordinary and raw-header events without retaining either raw
 * event. Either half may arrive first, including repeated request ids on redirects.
 */
function createCdpHeaderCorrelator(records, changed) {
  const states = new Map()
  const stateFor = (key) => {
    let state = states.get(key)
    if (!state) {
      state = { waitingRecords: [], waitingExtras: [] }
      states.set(key, state)
    }
    return state
  }
  const merge = (record, extra) => {
    record.sensitiveHeader = record.sensitiveHeader || extra.sensitiveHeader
    record.wireHeaders = true
    changed()
  }

  return {
    addRecord(key, record) {
      const state = stateFor(key)
      const queued = state.waitingExtras.shift()
      if (queued) {
        const sensitiveHeader = queued.extra.sensitiveHeader || record.sensitiveHeader
        if (!queued.record) {
          Object.assign(record, { sensitiveHeader, wireHeaders: true })
          records.push(record)
          changed()
          return record
        }
        Object.assign(queued.record, record, { sensitiveHeader, wireHeaders: true })
        changed()
        return queued.record
      }

      records.push(record)
      state.waitingRecords.push(record)
      changed()
      return record
    },
    addExtra(key, extra, source) {
      const state = stateFor(key)
      const record = state.waitingRecords.shift()
      if (record) {
        merge(record, extra)
        return
      }

      // Safe unmatched raw-header events carry no finding and remain only as
      // booleans until their ordinary request arrives. A sensitive unmatched
      // event is retained as a redacted fail-closed placeholder.
      const placeholder = extra.sensitiveHeader
        ? {
            kind: 'request',
            method: 'UNKNOWN',
            origin: null,
            route: '<redacted>',
            body: 'unknown',
            crossOrigin: true,
            control: null,
            sensitiveUrl: false,
            sensitiveHeader: true,
            wireHeaders: true,
            source,
            devInfrastructure: false,
          }
        : null
      if (placeholder) records.push(placeholder)
      state.waitingExtras.push({ extra, record: placeholder })
      changed()
    },
  }
}

async function runChrome(url, watchEgress = false, probeNonce = null) {
  const { binary, port } = ENGINES.chrome
  launch(binary, [
    '--headless=new',
    `--user-data-dir=${scratch('vh-chrome-')}`,
    `--remote-debugging-port=${port}`,
    '--no-first-run',
    '--no-default-browser-check',
  ])
  if (!(await waitForPort(`http://127.0.0.1:${port}/json/version`))) {
    throw new Error(`Chrome did not open port ${port} within ${START_TIMEOUT_MS / 1000}s`)
  }

  const version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()
  const client = await connect(version.webSocketDebuggerUrl)
  let stopEvents = () => {}
  try {
    const target = await client.send('Target.createTarget', { url: 'about:blank' })
    const attached = await client.send('Target.attachToTarget', {
      targetId: target.result.targetId,
      flatten: true,
    })
    const sessionId = attached.result.sessionId
    const records = []
    let egressRevision = 0
    const changed = () => egressRevision++
    const headerCorrelator = createCdpHeaderCorrelator(records, changed)
    const targetSources = new Map([[sessionId, 'page']])
    const socketMetadata = new Map()
    const targetSetups = new Set()
    const setupErrors = []

    if (watchEgress) {
      stopEvents = client.onEvent((message) => {
        const eventSessionId = message.sessionId ?? sessionId
        const source = targetSources.get(eventSessionId) ?? 'unknown'

        if (message.method === 'Network.requestWillBeSent') {
          headerCorrelator.addRecord(
            socketKey(eventSessionId, message.params?.requestId),
            normalizeCdpRequest(message.params, { baseUrl: url, source, probeNonce }),
          )
          return
        }

        if (message.method === 'Network.requestWillBeSentExtraInfo') {
          headerCorrelator.addExtra(
            socketKey(eventSessionId, message.params?.requestId),
            normalizeCdpExtraHeaders(message.params),
            source,
          )
          return
        }

        if (message.method === 'Target.attachedToTarget') {
          const childSessionId = message.params?.sessionId
          if (!childSessionId) return
          targetSources.set(childSessionId, targetSource(message.params?.targetInfo?.type))

          let setup
          setup = (async () => {
            await client.send(
              'Target.setAutoAttach',
              { autoAttach: true, waitForDebuggerOnStart: true, flatten: true },
              { sessionId: childSessionId },
            )
            await client.send('Network.enable', {}, { sessionId: childSessionId })
            await client.send('Runtime.runIfWaitingForDebugger', {}, { sessionId: childSessionId })
          })()
            .catch((error) => setupErrors.push(error))
            .finally(() => targetSetups.delete(setup))
          targetSetups.add(setup)
          return
        }

        if (message.method === 'Network.webSocketCreated') {
          const key = socketKey(eventSessionId, message.params?.requestId)
          const metadata = normalizeCdpWebSocketMetadata(String(message.params?.url ?? ''), {
            baseUrl: url,
            source,
            probeNonce,
          })
          const record = headerCorrelator.addRecord(key, normalizeCdpWebSocketHandshake(metadata))
          socketMetadata.set(key, { metadata, record })
          return
        }

        if (message.method === 'Network.webSocketWillSendHandshakeRequest') {
          const key = socketKey(eventSessionId, message.params?.requestId)
          const socket = socketMetadata.get(key)
          if (socket) {
            const headers = message.params?.request?.headers
            socket.record.sensitiveHeader =
              socket.record.sensitiveHeader ||
              normalizeCdpWebSocketHandshake(socket.metadata, headers).sensitiveHeader
            socket.record.wireHeaders = true
            socket.record.devInfrastructure = isExactViteHmr(socket.metadata, headers)
            socket.metadata.devInfrastructure = socket.record.devInfrastructure
            changed()
          } else {
            const metadata = normalizeCdpWebSocketMetadata('', {
              baseUrl: url,
              source,
              probeNonce,
            })
            headerCorrelator.addRecord(
              key,
              normalizeCdpWebSocketHandshake(metadata, message.params?.request?.headers),
            )
          }
          return
        }

        if (message.method === 'Network.webSocketFrameSent') {
          const socket = socketMetadata.get(socketKey(eventSessionId, message.params?.requestId))
          const payload = message.params?.response?.payloadData
          records.push(
            normalizeCdpWebSocketFrame(typeof payload === 'string' ? payload.length : 0, {
              origin: socket?.record.origin,
              crossOrigin: socket?.record.crossOrigin,
              source: socket?.record.source,
              devInfrastructure: socket?.record.devInfrastructure,
              control: classifyEgressWebSocketControl(payload, probeNonce),
            }),
          )
          changed()
        }
      })

      await client.send('Network.enable', {}, { sessionId })
      await client.send(
        'Target.setAutoAttach',
        { autoAttach: true, waitForDebuggerOnStart: true, flatten: true },
        { sessionId },
      )
    }

    await client.send('Page.enable', {}, { sessionId })
    await client.send('Runtime.enable', {}, { sessionId })
    await client.send('Page.navigate', { url }, { sessionId })
    const terminal = await readUntilDone(
      async (expression) => {
        const reply = await client.send(
          'Runtime.evaluate',
          { expression, returnByValue: true },
          { sessionId },
        )
        return reply.result?.result?.value
      },
      watchEgress ? EGRESS_PAGE_TIMEOUT_MS : PAGE_TIMEOUT_MS,
    )

    if (!watchEgress) return { ...terminal, egress: null, egressCoverage: null }
    await Promise.all(targetSetups)
    if (setupErrors.length > 0) {
      const first = setupErrors[0]
      throw first instanceof Error ? first : new Error(String(first))
    }
    const egress = await waitForEgressAssessment(records, 'full', () => egressRevision)
    return { ...terminal, egress, egressCoverage: 'full' }
  } finally {
    stopEvents()
    client.close()
  }
}

async function runFirefox(url, watchEgress = false, probeNonce = null) {
  const { binary, port } = ENGINES.firefox
  launch(binary, [
    '--headless',
    '--profile',
    scratch('vh-firefox-'),
    '--remote-debugging-port',
    String(port),
    'about:blank',
  ])
  // The BiDi endpoint rejects a GET with a body and a POST outright, so there
  // is nothing to probe but the socket itself.
  const deadline = Date.now() + START_TIMEOUT_MS
  let client = null
  while (!client && Date.now() < deadline) {
    try {
      client = await connect(`ws://127.0.0.1:${port}/session`)
    } catch {
      await sleep(500)
    }
  }
  if (!client)
    throw new Error(`Firefox did not open port ${port} within ${START_TIMEOUT_MS / 1000}s`)

  try {
    await client.send('session.new', { capabilities: {} })
    const records = []
    let egressRevision = 0
    const stopEvents = watchEgress
      ? client.onEvent((message) => {
          if (message.method !== 'network.beforeRequestSent') return
          records.push(normalizeBidiRequest(message.params, { baseUrl: url, probeNonce }))
          egressRevision++
        })
      : () => {}
    if (watchEgress) {
      await client.send('session.subscribe', { events: ['network.beforeRequestSent'] })
    }
    const tree = await client.send('browsingContext.getTree', {})
    const context = tree.result?.contexts?.[0]?.context
    if (!context) throw new Error('Firefox reported no browsing context')
    await client.send('browsingContext.navigate', { context, url, wait: 'complete' })
    try {
      const terminal = await readUntilDone(
        async (expression) => {
          const reply = await client.send('script.evaluate', {
            expression,
            target: { context },
            awaitPromise: false,
          })
          return reply.result?.result?.value
        },
        watchEgress ? EGRESS_PAGE_TIMEOUT_MS : PAGE_TIMEOUT_MS,
      )
      if (!watchEgress) return { ...terminal, egress: null, egressCoverage: null }
      const egress = await waitForEgressAssessment(records, 'partial', () => egressRevision)
      return { ...terminal, egress, egressCoverage: 'partial' }
    } finally {
      stopEvents()
    }
  } finally {
    client.close()
  }
}

async function runSafari(url) {
  const { binary, port } = ENGINES.safari
  launch(binary, ['-p', String(port)])
  const base = `http://127.0.0.1:${port}`
  await waitForPort(base)

  const post = async (path, body) => {
    const response = await fetch(base + path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(PROTOCOL_TIMEOUT_MS),
    })
    return response.json()
  }

  const created = await post('/session', {
    capabilities: { alwaysMatch: { browserName: 'safari' } },
  })
  const sessionId = created.value?.sessionId
  if (!sessionId) {
    throw new Error(created.value?.message ?? 'safaridriver refused the session')
  }

  try {
    await post(`/session/${sessionId}/url`, { url })
    return await readUntilDone(async (expression) => {
      const reply = await post(`/session/${sessionId}/execute/sync`, {
        script: `return ${expression}`,
        args: [],
      })
      return reply.value
    })
  } finally {
    await fetch(`${base}/session/${sessionId}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(PROTOCOL_TIMEOUT_MS),
    }).catch(() => {})
  }
}

const RUNNERS = { chrome: runChrome, firefox: runFirefox, safari: runSafari }

const { positional, options } = parseRunnerArgs(process.argv.slice(2))
const watchEgress = options['watch-egress'] === true || options['watch-egress'] === 'true'
const page = positional[0] ?? (watchEgress ? '/spike-egress.html' : '/spike-alpha.html')
const base = options.base ?? 'http://localhost:5173'
const wanted = (options.engines ?? 'chrome,firefox,safari').split(',').map((name) => name.trim())
const requireAll = options['require-all'] === true || options['require-all'] === 'true'
const pageUrl = new URL(page, base)
const probeNonce = watchEgress ? randomUUID() : null
if (probeNonce) pageUrl.searchParams.set(EGRESS_RUN_QUERY, probeNonce)
const url = pageUrl.href

if (typeof WebSocket === 'undefined') {
  console.error('run-in-engines: needs a Node with a global WebSocket (Node 22+).')
  process.exit(2)
}

const unknown = wanted.filter((name) => !RUNNERS[name])
if (unknown.length) {
  console.error(`run-in-engines: unknown engine(s) ${unknown.join(', ')}`)
  process.exit(2)
}

if (!(await waitForPort(url))) {
  console.error(`run-in-engines: nothing is serving ${url} — start the dev server first.`)
  process.exit(2)
}

console.log(`run-in-engines: ${pageUrl.origin}${pageUrl.pathname}`)
const results = []

for (const name of wanted) {
  const engine = ENGINES[name]
  console.log(`\n${'='.repeat(72)}\n${engine.label}\n${'='.repeat(72)}`)

  if (watchEgress && name === 'safari') {
    console.log(
      '  FAILED — Safari protocol egress evidence is unsupported: the current safaridriver/WebDriver Classic path exposes no usable request-event stream.',
    )
    results.push('failed')
    continue
  }

  if (!existsSync(engine.binary)) {
    console.log(`  SKIPPED — ${engine.binary} is not installed`)
    results.push('skipped')
    continue
  }

  try {
    const { text, finished, result, egress, egressCoverage } = await RUNNERS[name](
      url,
      watchEgress,
      probeNonce,
    )
    console.log(text.trim() || '  (the page reported nothing)')
    if (watchEgress && egress) {
      if (egressCoverage === 'partial') {
        const missingObservable = egress.missingControls.filter(
          (control) => !FIREFOX_UNSUPPORTED_EGRESS_CONTROLS.includes(control),
        )
        const observablePassed = egress.findings.length === 0 && missingObservable.length === 0
        console.log(
          `\n  EGRESS PARTIAL — ${egress.cleanRecordCount} clean records, ${egress.probeRecordCount} observable probe records`,
        )
        console.log(
          `    REQUEST-LIFECYCLE CONTROLS ${observablePassed ? 'PASS' : 'FAIL'} — ${EGRESS_CONTROL_IDS.length - FIREFOX_UNSUPPORTED_EGRESS_CONTROLS.length} observable controls`,
        )
        console.log(
          '    UNSUPPORTED — Firefox BiDi exposes the WebSocket handshake request but no outgoing frame event.',
        )
      } else {
        console.log(
          `\n  EGRESS ${egress.passed ? 'PASS' : 'FAIL'} — ${egress.cleanRecordCount} clean records, ${egress.probeRecordCount} probe records`,
        )
      }
      for (const finding of egress.findings) console.log(`    FINDING — ${finding}`)
      for (const control of egress.missingControls) {
        if (egressCoverage === 'partial' && FIREFOX_UNSUPPORTED_EGRESS_CONTROLS.includes(control)) {
          continue
        }
        console.log(`    MISSING CONTROL — ${control}`)
      }
    }
    if (!finished) {
      const timeoutMs = watchEgress ? EGRESS_PAGE_TIMEOUT_MS : PAGE_TIMEOUT_MS
      console.log(`\n  INCOMPLETE — no "done" after ${timeoutMs / 1000}s; output is partial`)
      results.push('failed')
    } else if (result === 'fail') {
      console.log('\n  FAILED — the page reported a failing terminal result')
      results.push('failed')
    } else if (watchEgress && (!egress || egressCoverage !== 'full' || !egress.passed)) {
      console.log('\n  FAILED — protocol egress evidence or its negative controls did not pass')
      results.push('failed')
    } else {
      console.log(`\n  RESULT — ${result}`)
      results.push('completed')
    }
  } catch (error) {
    console.log(`  FAILED — ${error instanceof Error ? error.message : String(error)}`)
    results.push('failed')
  } finally {
    cleanUp()
  }
}

const summary = summarizeEngineResults(results, requireAll)
console.log(`\nrun-in-engines: ${formatEngineSummary(summary)}.`)
if (requireAll && summary.skipped > 0) {
  console.log('run-in-engines: strict matrix requested; skipped engines make this run fail.')
}
process.exit(summary.exitCode)
