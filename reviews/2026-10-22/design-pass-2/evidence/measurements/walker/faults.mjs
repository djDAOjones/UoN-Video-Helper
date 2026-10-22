// PLAN-7 (VH-171): the declared faults F1–F9 the scenarios need, each a
// switch set before the page loads (or, for F5, F7 and F8, in place), kept
// apart from the keyboard route. A fault changes the browser around the app,
// never the app's source. `node faults.mjs check` applies each one to the
// app and asserts the state it is for; a fault without a pass there is not
// used in the matrix.
//
//   OUT_ROOT=<scratch>/out FIX=<scratch>/fixtures node faults.mjs check   (headless Chrome on :9222, Vite on :5173)
import { Buffer } from 'node:buffer'
import { fileURLToPath } from 'node:url'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------------------
// One request router per page: Fetch.enable replaces its patterns on every
// call, so the brand faces, the closings and the worker share one listener.
// A rule is { urlPattern, resourceType?, requestStage, match(p), handle(p) }.
export async function route(w, id, rule) {
  w.routes = w.routes ?? new Map()
  w.routes.set(id, rule)
  if (!w.offRoutes) {
    w.offRoutes = w.page.on('Fetch.requestPaused', (p) => {
      const stage = p.responseStatusCode === undefined && !p.responseErrorReason ? 'Request' : 'Response'
      for (const r of w.routes.values()) if (r.requestStage === stage && r.match(p)) return void r.handle(p).catch(() => undefined)
      w.page.send(stage === 'Request' ? 'Fetch.continueRequest' : 'Fetch.continueResponse', { requestId: p.requestId }).catch(() => undefined)
    })
  }
  await enableRoutes(w)
}
export async function unroute(w, id) {
  if (!w.routes?.delete(id)) return
  await enableRoutes(w)
}
async function enableRoutes(w) {
  if (!w.routes.size) return w.page.send('Fetch.disable')
  await w.page.send('Fetch.enable', { patterns: [...w.routes.values()].map(({ urlPattern, resourceType, requestStage }) => ({ urlPattern, resourceType, requestStage })) })
}
const fail = (w, p) => w.page.send('Fetch.failRequest', { requestId: p.requestId, errorReason: 'BlockedByClient' })

// The worker's entry module, rewritten with a prelude: what runs in the
// worker (the storage estimate, VH-171's S-73) a page init script cannot reach.
const WORKER = '*job.worker.ts*'
async function workerPrelude(w, id, code) {
  await route(w, id, {
    urlPattern: WORKER, requestStage: 'Response',
    match: (p) => /job\.worker\.ts\?worker_file/.test(p.request.url),
    handle: async (p) => {
      const { body, base64Encoded } = await w.page.send('Fetch.getResponseBody', { requestId: p.requestId })
      const src = base64Encoded ? Buffer.from(body, 'base64').toString('utf8') : body
      w.faultsSeen.push(id + ': worker rewritten')
      await w.page.send('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: 200, responseHeaders: p.responseHeaders, body: Buffer.from(code + '\n' + src).toString('base64') })
    },
  })
}

const init = (w, source) => w.page.send('Page.addScriptToEvaluateOnNewDocument', { source })

// ---------------------------------------------------------------------------
// The faults. `before` runs before navigation; `now` in place; `release`
// undoes what can be undone. Each says the state it is for.
export const FAULTS = {
  F1: {
    name: "the worker's script held",
    for: 'S-01 (pending, inside the 5 s ping deadline); held past it, the blocked workerNotStarted variant',
    before: (w) => route(w, 'F1', {
      urlPattern: WORKER, requestStage: 'Request',
      match: (p) => /job\.worker\.ts/.test(p.request.url),
      handle: async (p) => { (w.held = w.held ?? []).push(p.requestId); w.faultsSeen.push('F1: worker held') },
    }),
    release: async (w) => { await unroute(w, 'F1'); for (const requestId of w.held ?? []) await w.page.send('Fetch.continueRequest', { requestId }).catch(() => undefined); w.held = [] },
  },
  F2: {
    name: 'VideoEncoder removed from the page',
    for: 'S-02 (startup blocked)',
    before: (w) => init(w, 'delete globalThis.VideoEncoder;'),
  },
  F3: {
    name: "the worker's storage estimate reports a set quota",
    for: 'S-31 (storage block). Storage.overrideQuotaForOrigin does nothing in the isolated browser context each walk opens (VH-171, probed), so the estimate is rewritten instead; S-56 (out of space part-way) needs a write that fails, not yet written',
    // opts.bytes: the quota the estimate reports, with nothing used.
    before: (w, { bytes = 50 * 1024 * 1024 } = {}) => workerPrelude(w, 'F3', `navigator.storage.estimate = async () => ({ quota: ${Number(bytes)}, usage: 0 });`),
  },
  F4a: {
    name: 'the save picker cancelled',
    for: 'S-67',
    before: (w) => init(w, `window.showSaveFilePicker = async () => { throw new DOMException('The user aborted a request.', 'AbortError'); };`),
  },
  F4b: {
    name: 'a slow writable',
    for: 'S-61, S-65, S-66 (saving, and stopping it)',
    before: (w) => init(w, `(() => { const real = window.showSaveFilePicker; window.showSaveFilePicker = async (o) => { const h = await real(o);
      return { kind: 'file', name: h.name, getFile: () => h.getFile(), isSameEntry: (x) => h.isSameEntry(x), remove: () => h.remove(),
        createWritable: async () => { const out = await h.createWritable();
          return new WritableStream({ async write(c) { await new Promise((r) => setTimeout(r, 400)); await out.write(c); }, close: () => out.close(), abort: (r) => out.abort(r) }); } }; }; })();`),
  },
  F4c: {
    name: "the picker's file is the source",
    for: 'S-68 (refused: the source file)',
    before: (w) => init(w, `(() => { const real = window.showSaveFilePicker; window.showSaveFilePicker = async (o) => { const h = await real(o); const src = document.querySelector('#file-input').files[0];
      return { kind: 'file', name: src.name, getFile: async () => src, isSameEntry: (x) => h.isSameEntry(x), remove: () => h.remove(), createWritable: () => h.createWritable() }; }; })();`),
  },
  F4d: {
    name: 'createWritable rejects',
    for: "S-70's hand-off, not a failure: saveFile falls back to a download (src/media/save.ts:178-196)",
    before: (w) => init(w, `(() => { const real = window.showSaveFilePicker; window.showSaveFilePicker = async (o) => { const h = await real(o);
      return { kind: 'file', name: h.name, getFile: () => h.getFile(), isSameEntry: (x) => h.isSameEntry(x), remove: () => h.remove(), createWritable: async () => { throw new DOMException('Denied', 'NotAllowedError'); } }; }; })();`),
  },
  F4e: {
    name: 'no picker, and URL.createObjectURL throws',
    for: 'S-69 (save failed): the only way saveFile throws; the chosen file is spared, so the preview still loads',
    before: (w) => init(w, `window.showSaveFilePicker = undefined; (() => { const real = URL.createObjectURL; URL.createObjectURL = (b) => { if (b instanceof Blob && b.type.startsWith('video/') && b !== (document.querySelector('#file-input').files || [])[0]) throw new DOMException('fault F4e', 'NotReadableError'); return real(b); }; })();`),
  },
  F5: {
    name: 'clipboard permission granted or denied',
    for: 'S-80 (copied; copy failed)',
    // opts.setting: 'granted' or 'denied'. Headless Chrome also needs document focus to write.
    now: async (w, { setting = 'granted' } = {}) => {
      await w.page.send('Emulation.setFocusEmulationEnabled', { enabled: true })
      for (const name of ['clipboard-write', 'clipboard-sanitized-write']) await w.browser.send('Browser.setPermission', { permission: { name }, setting, origin: new URL(w.appUrl()).origin, browserContextId: w.page.contextId }).catch(() => undefined)
    },
  },
  F6a: {
    name: "the closing's onset blocked",
    for: 'S-55 (fell back to a cut)',
    before: (w) => route(w, 'F6', { urlPattern: '*closing-onset-*', requestStage: 'Request', match: (p) => /closing-onset-/.test(p.request.url), handle: async (p) => { w.faultsSeen.push('F6a: ' + p.request.url.replace(/^.*\//, '')); await fail(w, p) } }),
  },
  F6b: {
    name: 'every closing graphic blocked',
    for: 'S-55 (the closing not loaded)',
    before: (w) => route(w, 'F6', { urlPattern: '*closing-*', requestStage: 'Request', match: (p) => /closing-(onset|tail)-/.test(p.request.url), handle: async (p) => { w.faultsSeen.push('F6b: ' + p.request.url.replace(/^.*\//, '')); await fail(w, p) } }),
  },
  F7: {
    name: "the preview's error event",
    for: 'S-32 (preview unavailable): no fixture is known that the player refuses and the job accepts',
    now: (w) => w.evaluate(`document.querySelector('#trim-preview').dispatchEvent(new Event('error'))`),
  },
  F8: {
    name: 'an uncaught error',
    for: 'S-74 (errors captured)',
    now: (w) => w.evaluate(`window.dispatchEvent(new ErrorEvent('error', { message: 'Deliberate audit error', error: new Error('Deliberate audit error') }))`),
  },
  F9: {
    name: "the worker's storage estimate rejects",
    for: 'S-73 (ready, storage unknown)',
    before: (w) => workerPrelude(w, 'F9', `navigator.storage.estimate = () => Promise.reject(new Error('fault F9'));`),
  },
}

/** Set a fault on a walk before navigation; `now` faults run at once. */
export async function applyFault(w, id, opts) {
  const f = FAULTS[id]
  if (!f) throw new Error('no fault ' + id)
  w.faultsSeen = w.faultsSeen ?? []
  w.appUrl = w.appUrl ?? (() => process.env.APP_URL ?? 'http://localhost:5173/')
  w.faults = [...(w.faults ?? []), id]
  if (f.before) await f.before(w, opts)
  if (f.now) await f.now(w, opts)
}

/** Navigate without waiting for boot (F1 holds it). */
export async function gotoNoWait(w) {
  const loaded = w.page.once('Page.loadEventFired')
  await w.page.send('Page.navigate', { url: w.appUrl() })
  await loaded
  await sleep(500)
}

// ---------------------------------------------------------------------------
// The check: each fault applied to the app, and the state it is for asserted.
// Faults needing a finished job (F4*, F6*) are checked on S-53's setup.
async function check() {
  const { connectBrowser } = await import('./cdp.mjs')
  const { Walk, F } = await import('./walk.mjs')
  const browser = await connectBrowser()
  const results = []
  const status = `((document.getElementById('process-status')||{}).innerText||'') + ' | ' + ((document.getElementById('save-status')||{}).innerText||'')`
  const text = (w, sel) => w.evaluate(`(document.querySelector(${JSON.stringify(sel)})||{}).innerText||''`)
  const body = (w) => w.evaluate(`document.body.innerText`)
  const only = process.argv.slice(3)
  async function one(id, fn, opts = {}) {
    if (only.length && !only.includes(id)) return
    const w = new Walk(browser, 'fault-' + id, opts)
    await w.open()
    w.browser = browser
    const t0 = Date.now()
    try {
      const r = await fn(w)
      results.push({ fault: id, ...r, seen: w.faultsSeen, seconds: Math.round((Date.now() - t0) / 1000) })
    } catch (e) {
      results.push({ fault: id, outcome: 'fail', why: String(e.message ?? e).slice(0, 300), seen: w.faultsSeen })
    } finally { await w.close() }
    console.log(JSON.stringify(results.at(-1)).slice(0, 400))
  }
  const finished = async (w, file = 'lecture-30s.mp4') => { await w.goto(); await w.setFiles(F(file)); await w.waitSettled(); await w.click(w.createButton()); await w.waitFinished() }
  const has = (s, re) => ({ outcome: re.test(s) ? 'pass' : 'fail', saw: s.replace(/\s+/g, ' ').slice(0, 200) })

  await one('F1', async (w) => { await applyFault(w, 'F1'); await gotoNoWait(w); const pending = await text(w, '#system-check-summary'); const disabled = await w.evaluate(`document.querySelector('#file-input').disabled`); await FAULTS.F1.release(w); return { ...has(pending, /checking/i), disabled } })
  await one('F2', async (w) => { await applyFault(w, 'F2'); await w.goto(); return has(await body(w), /has not passed|not supported/i) })
  await one('F3', async (w) => { await applyFault(w, 'F3', { bytes: 5 * 1024 * 1024 }); await w.goto(); await w.setFiles(F('lecture-360s.mp4')); await w.waitFor(`/Keep less of the video|not enough free space/.test(document.body.innerText)`, { label: 'storage block', timeout: 60000 }).catch(() => undefined); return { ...has(await body(w), /Keep less of the video|not enough free space/) } })
  await one('F9', async (w) => { await applyFault(w, 'F9'); await w.goto(); await w.setFiles(F('lecture-30s.mp4')); await w.waitSettled(); return has(await body(w), /will not say how much free space/i) })
  await one('F7', async (w) => { await w.goto(); await w.setFiles(F('lecture-30s.mp4')); await w.waitSettled(); await applyFault(w, 'F7'); await sleep(300); return has(await body(w), /preview is not available/i) })
  await one('F8', async (w) => { await w.goto(); await applyFault(w, 'F8'); await sleep(500); return has(await body(w), /Report this problem/i) })
  await one('F5', async (w) => { await w.goto(); await applyFault(w, 'F5', { setting: 'granted' }); await w.click('#feedback-open'); await sleep(300); await w.type('#feedback-message', 'A test message.'); await w.click('#feedback-copy'); await sleep(500); const granted = await text(w, '#feedback-dialog'); await FAULTS.F5.now(w, { setting: 'denied' }); await w.click('#feedback-copy'); await sleep(500); const denied = await text(w, '#feedback-dialog'); const ok = /Copied/.test(granted) && /Could not copy/.test(denied); return { outcome: ok ? 'pass' : 'fail', saw: [granted, denied].map((s) => s.replace(/\s+/g, ' ').slice(-120)) } })
  for (const [id, re] of [['F4a', /Not saved/], ['F4b', /Saving|Saved/], ['F4c', /file you started with/], ['F4d', /downloads folder/i], ['F4e', /could not be saved/]]) {
    await one(id, async (w) => { await applyFault(w, id); await finished(w); await w.click(w.saveButton()); await sleep(id === 'F4b' ? 1500 : 2500); const s = await w.evaluate(status) + ' | ' + await body(w); const r = has(s, re); if (id === 'F4b') r.slow = /Stop saving/.test(s); return r })
  }
  for (const [id, re] of [['F6a', /animation could not be loaded, so this video cuts/], ['F6b', /closing graphics could not be loaded/]]) {
    await one(id, async (w) => { await applyFault(w, id); await w.goto(); await w.setFiles(F('lecture-30s.mp4')); await w.waitSettled(); await w.select('#closing-type', 'fade'); await w.waitSettled(); await w.click(w.createButton()); await w.waitFinished(); return has(await body(w), re) })
  }
  browser.close()
  const { writeFileSync } = await import('node:fs')
  const { join } = await import('node:path')
  writeFileSync(join(process.env.OUT_ROOT, 'faults-check.json'), JSON.stringify(results, null, 1))
  const bad = results.filter((r) => r.outcome !== 'pass')
  console.log(`${results.length - bad.length} of ${results.length} faults reach their state` + (bad.length ? '; not: ' + bad.map((r) => r.fault).join(', ') : ''))
  process.exit(bad.length ? 1 : 0)
}

if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv[2] === 'check') check().catch((e) => { console.error(e); process.exit(1) })
