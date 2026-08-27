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
 * Every spike page follows the same contract: a `<pre id="log">` that the page
 * appends to, ending with a line of exactly `done`. Nothing here knows what a
 * page measures — it navigates, waits for that sentinel, and prints the text.
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
 */

import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

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
const POLL_MS = 500
/** How long a freshly spawned browser gets to open its automation port. Generous
 *  on purpose: a cold Chrome under load has taken well over 20 s here, and a
 *  timeout reads as "the browser is broken" when it only means "the machine is
 *  busy". */
const START_TIMEOUT_MS = 60_000

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
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    const resolve = message.id !== undefined ? pending.get(message.id) : undefined
    if (resolve) {
      pending.delete(message.id)
      resolve(message)
    }
  })
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', () => reject(new Error(`could not connect to ${url}`)), {
      once: true,
    })
  })

  let nextId = 1
  return {
    send(method, params, extra = {}) {
      return new Promise((resolve) => {
        const id = nextId++
        pending.set(id, resolve)
        socket.send(JSON.stringify({ id, method, params, ...extra }))
      })
    },
    close: () => socket.close(),
  }
}

/**
 * Polls the page's `#log` until it ends with the `done` sentinel.
 *
 * @param read - Evaluates an expression in the page and returns its value.
 * @returns The log text, plus whether the page finished or the wait timed out.
 */
async function readUntilDone(read) {
  const deadline = Date.now() + PAGE_TIMEOUT_MS
  let text = ''
  while (Date.now() < deadline) {
    text = String((await read("document.getElementById('log')?.textContent ?? ''")) ?? '')
    if (text.trimEnd().endsWith('done')) return { text, finished: true }
    await sleep(POLL_MS)
  }
  return { text, finished: false }
}

async function runChrome(url) {
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
  try {
    const target = await client.send('Target.createTarget', { url: 'about:blank' })
    const attached = await client.send('Target.attachToTarget', {
      targetId: target.result.targetId,
      flatten: true,
    })
    const sessionId = attached.result.sessionId
    await client.send('Page.enable', {}, { sessionId })
    await client.send('Runtime.enable', {}, { sessionId })
    await client.send('Page.navigate', { url }, { sessionId })
    return await readUntilDone(async (expression) => {
      const reply = await client.send(
        'Runtime.evaluate',
        { expression, returnByValue: true },
        { sessionId },
      )
      return reply.result?.result?.value
    })
  } finally {
    client.close()
  }
}

async function runFirefox(url) {
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
    const tree = await client.send('browsingContext.getTree', {})
    const context = tree.result?.contexts?.[0]?.context
    if (!context) throw new Error('Firefox reported no browsing context')
    await client.send('browsingContext.navigate', { context, url, wait: 'complete' })
    return await readUntilDone(async (expression) => {
      const reply = await client.send('script.evaluate', {
        expression,
        target: { context },
        awaitPromise: false,
      })
      return reply.result?.result?.value
    })
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
    await fetch(`${base}/session/${sessionId}`, { method: 'DELETE' }).catch(() => {})
  }
}

const RUNNERS = { chrome: runChrome, firefox: runFirefox, safari: runSafari }

function parseArgs(argv) {
  const positional = []
  const options = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg.startsWith('--')) {
      const [name, inline] = arg.slice(2).split('=')
      options[name] = inline ?? argv[++i]
    } else {
      positional.push(arg)
    }
  }
  return { positional, options }
}

const { positional, options } = parseArgs(process.argv.slice(2))
const page = positional[0] ?? '/spike-alpha.html'
const base = options.base ?? 'http://localhost:5173'
const wanted = (options.engines ?? 'chrome,firefox,safari').split(',').map((name) => name.trim())
const url = new URL(page, base).href

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

console.log(`run-in-engines: ${url}`)
// Named explicitly means required. Defaulting to all three means "whatever is
// installed", so a missing engine there is a gap in coverage to report, not a
// failure to stop on (VH-68).
const enginesRequired = options.engines !== undefined
// Three independent counters. Deriving one from the others is what let a
// skipped engine be reported as a complete run (VH-68).
let completed = 0
let skipped = 0
let failed = 0

for (const name of wanted) {
  const engine = ENGINES[name]
  console.log(`\n${'='.repeat(72)}\n${engine.label}\n${'='.repeat(72)}`)

  if (!existsSync(engine.binary)) {
    console.log(`  SKIPPED — ${engine.binary} is not installed`)
    skipped++
    continue
  }

  try {
    const { text, finished } = await RUNNERS[name](url)
    console.log(text.trim() || '  (the page reported nothing)')
    if (finished) {
      completed++
    } else {
      console.log(`\n  INCOMPLETE — no "done" after ${PAGE_TIMEOUT_MS / 1000}s; output is partial`)
      failed++
    }
  } catch (error) {
    console.log(`  FAILED — ${error instanceof Error ? error.message : String(error)}`)
    failed++
  } finally {
    cleanUp()
  }
}

console.log(
  `\nrun-in-engines: ${completed} completed, ${skipped} skipped, ${failed} failed, ` +
    `of ${wanted.length} requested.` +
    (skipped
      ? enginesRequired
        ? ' A skipped engine was named explicitly, so this run did not cover what it was asked to.'
        : ' Skipped engines are not installed and were not required.'
      : ''),
)
// A skip only fails the run when the engine was asked for by name. Defaulting
// to all three means "whatever is installed"; naming one means "this one".
process.exit(failed || (enginesRequired && skipped) ? 1 : 0)
