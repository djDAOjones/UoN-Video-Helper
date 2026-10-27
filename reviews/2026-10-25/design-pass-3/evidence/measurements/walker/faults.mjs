// PLAN-7 (VH-171): the declared faults F1–F14 the scenarios need (VH-198 adds
// F15 to F19 and revises F4e for pass 3), each a
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
// VH-178: one route for every prelude, joined in the order set, so two faults
// on the worker (F3 with F14) compose; the first route to match took the
// response alone before (Codex astra's check of VH-178).
const WORKER = '*job.worker.ts*'
async function workerPrelude(w, id, code) {
  w.preludes = w.preludes ?? new Map()
  w.preludes.set(id, code)
  await route(w, 'worker-prelude', {
    urlPattern: WORKER, requestStage: 'Response',
    match: (p) => /job\.worker\.ts\?worker_file/.test(p.request.url),
    handle: async (p) => {
      const { body, base64Encoded } = await w.page.send('Fetch.getResponseBody', { requestId: p.requestId })
      const src = base64Encoded ? Buffer.from(body, 'base64').toString('utf8') : body
      for (const seen of w.preludes.keys()) w.faultsSeen.push(seen + ': worker rewritten')
      await w.page.send('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: 200, responseHeaders: p.responseHeaders, body: Buffer.from([...w.preludes.values(), src].join('\n')).toString('base64') })
    },
  })
}
/** Drops one prelude; the route goes with the last. */
async function dropPrelude(w, id) {
  w.preludes?.delete(id)
  if (!w.preludes?.size) await unroute(w, 'worker-prelude')
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
    before: async (w) => { w.scriptF2 = (await init(w, 'delete globalThis.VideoEncoder;')).identifier },
    // VH-172: released for a route's later loads; the next navigation has VideoEncoder again.
    release: async (w) => { if (w.scriptF2) await w.page.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: w.scriptF2 }); w.scriptF2 = null },
  },
  F3: {
    name: "the worker's storage estimate reports a set quota",
    for: 'S-31 (storage block). Storage.overrideQuotaForOrigin does nothing in the isolated browser context each walk opens (VH-171, probed), so the estimate is rewritten instead; S-56 (out of space part-way) is F12',
    // opts.bytes: the quota the estimate reports, with nothing used.
    before: (w, { bytes = 50 * 1024 * 1024 } = {}) => workerPrelude(w, 'F3', `navigator.storage.estimate = async () => ({ quota: ${Number(bytes)}, usage: 0 });`),
    // VH-172: released for a route's later loads (the worker module is no longer rewritten).
    release: (w) => dropPrelude(w, 'F3'),
  },
  F4a: {
    name: 'the save picker cancelled',
    for: 'S-67',
    before: async (w) => { w.scriptF4a = (await init(w, `window.showSaveFilePicker = async () => { throw new DOMException('The user aborted a request.', 'AbortError'); };`)).identifier },
    // VH-198: released for a later load in the same walk (S-133 runs four saves).
    release: async (w) => { if (w.scriptF4a) await w.page.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: w.scriptF4a }); w.scriptF4a = null },
  },
  F4b: {
    name: 'a slow writable',
    for: 'S-61, S-65, S-66 (saving, and stopping it): the check asserts Saving with Stop saving offered, then Save stopped; VH-178 slows it to 3 s a chunk so a check settles while it still runs',
    // opts.ms: the wait before each chunk is written (VH-178's variant: 3000).
    before: async (w, { ms = 400 } = {}) => { w.scriptF4b = (await init(w, `(() => { const real = window.showSaveFilePicker; window.showSaveFilePicker = async (o) => { const h = await real(o);
      return { kind: 'file', name: h.name, getFile: () => h.getFile(), isSameEntry: (x) => h.isSameEntry(x), remove: () => h.remove(),
        createWritable: async () => { const out = await h.createWritable();
          return new WritableStream({ async write(c) { await new Promise((r) => setTimeout(r, ${Number(ms)})); await out.write(c); }, close: () => out.close(), abort: (r) => out.abort(r) }); } }; }; })();`)).identifier },
    release: async (w) => { if (w.scriptF4b) await w.page.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: w.scriptF4b }); w.scriptF4b = null },
  },
  F4c: {
    name: "the picker's file is the source",
    for: 'S-68 (refused: the source file)',
    before: async (w) => { w.scriptF4c = (await init(w, `(() => { const real = window.showSaveFilePicker; window.showSaveFilePicker = async (o) => { const h = await real(o); const src = document.querySelector('#file-input').files[0];
      return { kind: 'file', name: src.name, getFile: async () => src, isSameEntry: (x) => h.isSameEntry(x), remove: () => h.remove(), createWritable: () => h.createWritable() }; }; })();`)).identifier },
    release: async (w) => { if (w.scriptF4c) await w.page.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: w.scriptF4c }); w.scriptF4c = null },
  },
  F4d: {
    name: 'createWritable rejects',
    for: "S-70's hand-off, not a failure: saveFile falls back to a download (src/media/save.ts:178-196)",
    before: async (w) => { w.scriptF4d = (await init(w, `(() => { const real = window.showSaveFilePicker; window.showSaveFilePicker = async (o) => { const h = await real(o);
      return { kind: 'file', name: h.name, getFile: () => h.getFile(), isSameEntry: (x) => h.isSameEntry(x), remove: () => h.remove(), createWritable: async () => { throw new DOMException('Denied', 'NotAllowedError'); } }; }; })();`)).identifier },
    release: async (w) => { if (w.scriptF4d) await w.page.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: w.scriptF4d }); w.scriptF4d = null },
  },
  F4e: {
    name: 'no picker, and URL.createObjectURL throws (revised, VH-198)',
    for: "S-69 and S-133 (save failed). Phase 7's F4e threw for any video Blob but the chosen file; since VH-192 the card makes an object URL for the job's working file when the job ends (src/main.ts:2878), so the throw landed in the job's outcome handler and the job read as failed. Revised: the first URL made for each Blob is spared (the card's player), so only the save's hand-off (src/media/save.ts:193, the same File) throws. opts.inPlace arms it in place once the card stands instead (the scenarios file's other way); the chosen file is spared, so the preview still loads",
    before: async (w, { inPlace = false } = {}) => {
      if (inPlace) return
      w.scriptF4e = (await init(w, `window.showSaveFilePicker = undefined; (() => { const real = URL.createObjectURL; window.__f4eRealCreateObjectURL = real; const spared = new WeakSet(); window.__f4e = { spared: 0, thrown: 0 };
        URL.createObjectURL = (b) => { if (b instanceof Blob && b.type.startsWith('video/') && b !== (document.querySelector('#file-input').files || [])[0]) { if (!spared.has(b)) { spared.add(b); window.__f4e.spared++; return real(b); } window.__f4e.thrown++; throw new DOMException('fault F4e', 'NotReadableError'); } return real(b); }; })();`)).identifier
    },
    now: async (w, { inPlace = false } = {}) => {
      if (!inPlace) return
      await w.evaluate(`(() => { window.showSaveFilePicker = undefined; const real = URL.createObjectURL; window.__f4eRealCreateObjectURL = real; window.__f4e = { spared: 0, thrown: 0, inPlace: true };
        URL.createObjectURL = (b) => { if (b instanceof Blob && b.type.startsWith('video/') && b !== (document.querySelector('#file-input').files || [])[0]) { window.__f4e.thrown++; throw new DOMException('fault F4e', 'NotReadableError'); } return real(b); }; })()`)
    },
    // VH-172: released in place (J3's save after S-69): the real URL.createObjectURL and the
    // walk's own picker stub (walk.mjs PAGE_INIT) put back, and the script dropped for later loads.
    release: async (w) => {
      if (w.scriptF4e) await w.page.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: w.scriptF4e })
      w.scriptF4e = null
      await w.evaluate(`(() => { if (window.__f4eRealCreateObjectURL) URL.createObjectURL = window.__f4eRealCreateObjectURL; window.showSaveFilePicker = async (options) => { const name = options && options.suggestedName ? options.suggestedName : 'video.mp4'; if (window.__audit) window.__audit.saves.push({ name }); const root = await navigator.storage.getDirectory(); const dir = await root.getDirectoryHandle('audit-saves', { create: true }); return dir.getFileHandle(name, { create: true }); }; })()`)
    },
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
  F10: {
    name: 'the pre-flight throws',
    for: "S-89 (device check failed): the worker's navigator.hardwareConcurrency, read once by inspectCapabilities (src/media/capability.ts:190) inside the pre-flight's try, throws an unclassified error, so the worker answers check-failed (job.worker.ts:620-625)",
    before: (w) => workerPrelude(w, 'F10', `Object.defineProperty(WorkerNavigator.prototype, 'hardwareConcurrency', { configurable: true, get() { throw new Error('fault F10'); } });`),
    release: (w) => dropPrelude(w, 'F10'),
  },
  F11: {
    name: "the job's messages dropped once it runs",
    for: "S-90 (failed, locks held while the job stops): the worker's first stage message reaches the page, then every message is dropped, the cancel's answer too, so the watchdog stops the job after WORKER_SILENCE_LIMIT_MS (120 s) and the locks hold 10 s more",
    before: (w) => workerPrelude(w, 'F11', `(() => { const real = self.postMessage.bind(self); let quiet = false; self.postMessage = (m, ...rest) => { if (quiet) return; if (m && m.kind === 'stage') quiet = true; return real(m, ...rest); }; })();`),
    release: (w) => dropPrelude(w, 'F11'),
  },
  F12: {
    name: 'a working-space write fails part-way',
    for: "S-56 (out of space part-way) and S-57 (retry): the worker's FileSystemSyncAccessHandle.write throws QuotaExceededError once a job has written opts.bytes, which the worker classifies as out-of-space (src/workers/failure.ts:88); only once, so the retry runs",
    // opts.bytes: what is written before the write fails. VH-198: opts.job, the
    // job (by the worker's 'process' messages, src/workers/job.worker.ts:99)
    // whose writes count, so a made-again video fails and the first does not
    // (S-118); unset, every write counts from the worker's start, as before.
    before: (w, { bytes = 256 * 1024, job = 0 } = {}) => workerPrelude(w, 'F12', `(() => { const real = FileSystemSyncAccessHandle.prototype.write; let written = 0, failed = false, jobs = 0; const only = ${Number(job)};
      if (only) self.addEventListener('message', (e) => { if (e.data && e.data.kind === 'process') { jobs++; written = 0; } });
      FileSystemSyncAccessHandle.prototype.write = function (data, o) { if (!failed && (!only || jobs === only)) { written += data.byteLength; if (written > ${Number(bytes)}) { failed = true; throw new DOMException('fault F12', 'QuotaExceededError'); } } return real.call(this, data, o); }; })();`),
    // VH-172: released for a route's later loads.
    release: (w) => dropPrelude(w, 'F12'),
  },
  F13: {
    name: "the job worker's clock runs fast",
    for: "S-25 (very long job, discouraged): the worker's performance.now runs at opts.rate (default 2) times real time, so the pre-flight's timed passes (job.worker.ts analysisPass; src/media/probe.ts jobTimeEstimate) read as on a device that much slower, and the 10,800 s still's 45-minute estimate passes 60 (src/config/thresholds.ts ESTIMATE_BANDS). CDP Emulation.setCPUThrottlingRate was tried first (VH-172, 23 October): on the worker's own session it is refused ('only supported for pages'), and on the page's it leaves the worker's estimate at 45 minutes",
    // opts.rate: how many times faster than real time the worker's clock runs.
    before: (w, { rate = 2 } = {}) => workerPrelude(w, 'F13', `(() => { const real = performance.now.bind(performance); const t0 = real(); performance.now = () => t0 + (real() - t0) * ${Number(rate)}; })();`),
    release: (w) => dropPrelude(w, 'F13'),
  },
  F14: {
    name: "the pre-flight's answer held",
    for: "VH-178's transitions by keys: prores-1080p.mov blocks about 20 ms after its check starts and a short file is ready in about a second, too soon for a person's keys to reach Start time (probed 23 October). The worker holds its `preflighted` reply opts.ms (default 8,000), well inside the page's 180 s deadline (SELECTION_DEADLINE_MS.preflight); the verdict is unchanged",
    // opts.ms: how long the reply is held.
    before: (w, { ms = 8000 } = {}) => workerPrelude(w, 'F14', `(() => { const real = self.postMessage.bind(self); self.postMessage = (m, ...rest) => { if (m && m.kind === 'preflighted') { setTimeout(() => real(m, ...rest), ${Number(ms)}); return; } return real(m, ...rest); }; })();`),
    release: (w) => dropPrelude(w, 'F14'),
  },
  // VH-198: pass 3's faults (scenarios-2026-10-25.md, "Faults and fixtures this
  // needs"). Each says, in its record, the branch it reached (P-05).
  F15a: {
    name: "the finished video's player's error event",
    for: 'S-132: the error event dispatched on the card\'s player in place, as F7 does for the preview. It proves only that nothing listens',
    now: async (w) => { const n = await w.evaluate(`(() => { const v = document.querySelector('#process-result video.result-player'); if (!v) return 0; v.dispatchEvent(new Event('error')); return 1; })()`); w.faultsSeen.push(n ? 'F15a: error dispatched on the result player' : 'F15a: no result player to dispatch on') },
  },
  F15b: {
    name: "the finished video's player refused for real",
    for: "S-132 and S-152: every object URL made for a Blob that is not the chosen file is revoked before it is returned, so the card's player cannot load it and video.error is set; the preview's URL (src/main.ts:1782) is spared. The download hand-off makes its URL the same way (src/media/save.ts:193), so F15b is never set with a download",
    before: async (w) => { w.scriptF15b = (await init(w, `(() => { const real = URL.createObjectURL; window.__f15b = { revoked: 0 }; URL.createObjectURL = (b) => { const u = real(b); if (b instanceof Blob && b !== (document.querySelector('#file-input').files || [])[0]) { URL.revokeObjectURL(u); window.__f15b.revoked++; } return u; }; })();`)).identifier },
    release: async (w) => { if (w.scriptF15b) await w.page.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: w.scriptF15b }); w.scriptF15b = null },
  },
  F16: {
    name: "the metadata's carry fails",
    for: "S-91, S-136, S-138, S-151: the prebundled mediabunny module, as the worker requests it from Vite (/node_modules/.vite/deps/mediabunny.js), rewritten at the Response stage with one line that makes Input.prototype.getMetadataTags reject, the class's local name read from the bundle's own export list. Only src/media/pipeline.ts:508 calls it, inside the try that sets metadataCarried = false (:517), so detectProductionWarnings adds metadata-lost (src/audio/warnings.ts:210). opts.workerSession also routes it on the worker's own session (auto-attached), if the page's does not see the worker's import",
    before: (w) => route(w, 'F16', {
      urlPattern: '*mediabunny.js*', requestStage: 'Response',
      match: (p) => /\/mediabunny\.js(\?|$)/.test(p.request.url),
      handle: async (p) => {
        const { body, base64Encoded } = await w.page.send('Fetch.getResponseBody', { requestId: p.requestId })
        const src = base64Encoded ? Buffer.from(body, 'base64').toString('utf8') : body
        const list = [...src.matchAll(/export\s*\{([^}]*)\}/g)].at(-1)?.[1] ?? ''
        const entry = list.split(',').map((x) => x.trim()).find((x) => x === 'Input' || / as Input$/.test(x))
        const local = entry ? entry.split(/\s+as\s+/)[0] : null
        w.faultsSeen.push(local ? `F16: mediabunny rewritten (${p.request.url.replace(/^.*\//, '')}, Input is ${local})` : 'F16: mediabunny seen, Input not in its export list')
        const line = local ? `\n;${local}.prototype.getMetadataTags = function () { return Promise.reject(new Error('fault F16')); };\n` : ''
        await w.page.send('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: 200, responseHeaders: p.responseHeaders.filter((h) => !/^content-length$/i.test(h.name)), body: Buffer.from(src + line).toString('base64') })
      },
    }),
    release: (w) => unroute(w, 'F16'),
  },
  F17: {
    name: 'the AAC encoder refused',
    for: "S-106 and S-107: VH-187's NO_AAC (walker/top-187.mjs:33-35), declared: AudioEncoder.isConfigSupported answers supported: false for any mp4a codec, so the System check's aac row warns (src/main.ts:1131) and the rest pass",
    before: async (w) => { w.scriptF17 = (await init(w, `(() => { const real = AudioEncoder.isConfigSupported.bind(AudioEncoder); window.__f17 = { asked: 0 }; AudioEncoder.isConfigSupported = async (c) => { if (String(c.codec).startsWith('mp4a')) { window.__f17.asked++; return { supported: false, config: c }; } return real(c); }; })();`)).identifier },
    release: async (w) => { if (w.scriptF17) await w.page.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: w.scriptF17 }); w.scriptF17 = null },
  },
  F18: {
    name: 'the encoder refuses part-way',
    for: "S-147: a worker prelude makes VideoEncoder.prototype.encode throw DOMException('fault F18', 'EncodingError') once opts.frames frames (default 60) have been fed, once only, which classifyFailure names encoder-refused (src/workers/failure.ts:89). opts.mode 'callback' instead calls the encoder's own error callback with that exception, as a real refusal does. The prelude logs the frame it fired at, so the record says it was the job's encode, not a probe's",
    // Only the job's own encode counts: frames are counted from the worker's
    // 'process' message on (src/workers/job.worker.ts:99), since the pre-flight's
    // timed pass encodes more than 60 frames itself (VH-198's first check fired there).
    before: (w, { frames = 60, mode = 'throw' } = {}) => workerPrelude(w, 'F18', `(() => { let armed = false, fed = 0, fired = false; self.addEventListener('message', (e) => { if (e.data && e.data.kind === 'process') { armed = true; fed = 0; } });
      const due = () => { if (!armed || fired) return false; fed++; if (fed > ${Number(frames)}) { fired = true; return true; } return false; };
      ` + (mode === 'callback'
      ? `const Real = VideoEncoder; self.VideoEncoder = class extends Real { constructor(init) { const onError = init.error; super({ ...init, error: (e) => onError(e) }); this.__onError = onError; } encode(f, o) { if (due()) { console.warn('fault F18', 'callback', fed); try { f.close(); } catch {} this.__onError(new DOMException('fault F18', 'EncodingError')); return; } return super.encode(f, o); } }; })();`
      : `const real = VideoEncoder.prototype.encode; VideoEncoder.prototype.encode = function (f, o) { if (due()) { console.warn('fault F18', 'throw', fed); throw new DOMException('fault F18', 'EncodingError'); } return real.call(this, f, o); }; })();`)),
    release: (w) => dropPrelude(w, 'F18'),
  },
  F19: {
    name: 'the page left and come back',
    for: "S-134: with an unsaved result the leave warning is set (src/main.ts:2372-2383), so Page.navigate to about:blank raises \"Leave site?\", accepted by Page.handleJavaScriptDialog; then Page.navigateToHistoryEntry goes back. An init script records pageshow's persisted, and Page.backForwardCacheNotUsed gives Chrome's reasons when it loads the page afresh",
    before: async (w) => {
      w.scriptF19 = (await init(w, `(() => { window.__f19 = { shows: [] }; addEventListener('pageshow', (e) => window.__f19.shows.push({ persisted: e.persisted, t: Date.now() })); })();`)).identifier
      w.f19 = { dialogs: [], notUsed: null }
      w.page.on('Page.javascriptDialogOpening', (d) => { w.f19.dialogs.push({ type: d.type, message: d.message }); w.page.send('Page.handleJavaScriptDialog', { accept: true }).catch(() => undefined) })
      w.page.on('Page.backForwardCacheNotUsed', (e) => { w.f19.notUsed = { reasons: (e.notRestoredExplanations ?? []).map((x) => `${x.type}: ${x.reason}`) } })
    },
    // The leave and the return: set by `before`; `leave` runs in place once the
    // unsaved result stands (not `now`, which applyFault would run at once).
    leave: async (w) => {
      if (!w.f19) throw new Error('F19 needs its before step')
      const left = w.page.once('Page.frameNavigated', (p) => !p.frame.parentId && p.frame.url === 'about:blank')
      await w.page.send('Page.navigate', { url: 'about:blank' }).catch((e) => w.f19.dialogs.push({ error: String(e.message ?? e) }))
      await Promise.race([left, sleep(8000)])
      const { currentIndex, entries } = await w.page.send('Page.getNavigationHistory')
      const back = entries[currentIndex - 1]
      const returned = w.page.once('Page.frameNavigated', (p) => !p.frame.parentId)
      await w.page.send('Page.navigateToHistoryEntry', { entryId: back.id })
      await Promise.race([returned, sleep(15000)])
      await sleep(1500)
      const shows = await w.evaluate(`(window.__f19 || { shows: [] }).shows`).catch(() => [])
      w.f19.shows = shows
      w.f19.restored = shows.some((s) => s.persisted)
      w.faultsSeen.push(`F19: left (${w.f19.dialogs.length} dialog(s)) and came back; ${w.f19.restored ? 'restored from the back-forward cache' : 'loaded afresh' + (w.f19.notUsed ? ': ' + w.f19.notUsed.reasons.slice(0, 4).join('; ') : '')}`)
    },
    release: async (w) => { if (w.scriptF19) await w.page.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: w.scriptF19 }); w.scriptF19 = null },
  },
  // VH-207 (V-46): the read failure's exception path, which no fault reached
  // before (matrix.mjs's unresolved list). A worker prelude, so it composes
  // with F14 through workerPrelude.
  F20: {
    name: "the inspection's answer withheld",
    for: "VH-207's variant (c), the read failure's exception path (src/main.ts:1495–1500): the worker notes the ids of the `inspect` requests it is sent (src/workers/job.worker.ts:89) and drops its answer, of any kind, to the opts.inspect-th (default 2: the first file reads, its replacement hangs), so the page's own deadline (SELECTION_DEADLINE_MS.inspect, 120 s, src/config/thresholds.ts:163; requestWithId's watchdog, src/main.ts:1192–1205) rejects and the catch shows unreadable-source, took-too-long. F14 holds only `preflighted` replies, which follow an inspection that has answered, and F11 drops messages only once a job's first stage is sent: neither reaches an inspection that never answers. The withheld inspection is said in faultsSeen from the worker's console, which watchWorkers (phase8.mjs) attaches",
    // opts.inspect: which inspection, counted from the worker's start, has its answer withheld.
    before: async (w, { inspect = 2 } = {}) => {
      w.offF20 = w.browser.on(w.page.sessionId, 'Target.attachedToTarget', ({ sessionId, targetInfo }) => {
        if (targetInfo.type === 'worker') w.browser.on(sessionId, 'Runtime.consoleAPICalled', (e) => { const a = (e.args ?? []).map((x) => x.value); if (a[0] === 'fault F20') w.faultsSeen.push(`F20: withheld the worker's answer (${a[4]}) to inspection ${a[2]}, request ${a[3]}`) })
      })
      await workerPrelude(w, 'F20', `(() => { const real = self.postMessage.bind(self); const at = ${Number(inspect)}; let n = 0, held = null;
        self.addEventListener('message', (e) => { if (e.data && e.data.kind === 'inspect' && ++n === at) held = e.data.id; });
        self.postMessage = (m, ...rest) => { if (held !== null && m && m.id === held) { console.warn('fault F20', 'withheld', at, m.id, m.kind); return; } return real(m, ...rest); }; })();`)
    },
    release: async (w) => { w.offF20?.(); w.offF20 = null; await dropPrelude(w, 'F20') },
  },
}

/** Set a fault on a walk before navigation; `now` faults run at once. */
export async function applyFault(w, id, opts) {
  const f = FAULTS[id]
  if (!f) throw new Error('no fault ' + id)
  w.faultsSeen = w.faultsSeen ?? []
  w.appUrl = w.appUrl ?? (() => process.env.APP_URL ?? 'http://localhost:5173/')
  w.faults = [...(w.faults ?? []), id]
  ;(w.activeFaults = w.activeFaults ?? new Set()).add(id)
  if (f.before) await f.before(w, opts)
  if (f.now) await f.now(w, opts)
}

/** Undo a fault where it can be undone (VH-172): a route's later loads run without it. */
export async function releaseFault(w, id) {
  const f = FAULTS[id]
  if (!f?.release) throw new Error('fault ' + id + ' has no release')
  await f.release(w)
  w.faultsReleased = [...(w.faultsReleased ?? []), id]
  w.activeFaults?.delete(id)
}

/** VH-198: every fault set on this walk and not yet released, released (a later load runs without them). */
export async function releaseAll(w) {
  for (const id of [...(w.activeFaults ?? [])]) if (FAULTS[id]?.release) await releaseFault(w, id)
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
  const { P8_INIT, watchWorkers } = await import('./phase8.mjs')
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
    // VH-198: the job's events on the wall clock, and the worker's console (a fault's prelude says where it fired).
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: P8_INIT })
    await watchWorkers(browser, w)
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
  const finishedOr = async (w, want) => { await w.goto(); await w.setFiles(F('lecture-30s.mp4')); await w.waitSettled(); await w.click(w.createButton()); await (want === 'failed' ? w.waitFailed() : w.waitFinished()) }
  // The matched text kept, with a window around it, never the page's first
  // characters (Codex astra's method check, M-07).
  const has = (s, re) => { const t = s.replace(/\s+/g, ' '); const m = t.match(re); return m ? { outcome: 'pass', matched: m[0], saw: t.slice(Math.max(0, m.index - 80), m.index + m[0].length + 120) } : { outcome: 'fail', saw: t.slice(0, 300) } }

  // F1, both states (M-07): pending inside the 5 s ping deadline, then, held past it, the blocked workerNotStarted state.
  await one('F1', async (w) => {
    await applyFault(w, 'F1'); await gotoNoWait(w)
    const pending = has(await text(w, '#system-check-summary'), /checking/i); pending.chooserLocked = await w.evaluate(`document.querySelector('#file-input').disabled`)
    await w.waitFor(`/did not start/.test(document.body.innerText)`, { label: 'workerNotStarted', timeout: 20000 }).catch(() => undefined)
    const blocked = has(await w.evaluate(status) + ' | ' + await text(w, '#source-status') + ' | ' + await body(w), /The part of the tool that does the work did not start/); blocked.chooserLocked = await w.evaluate(`document.querySelector('#file-input').disabled`)
    await FAULTS.F1.release(w)
    return { outcome: pending.outcome === 'pass' && pending.chooserLocked && blocked.outcome === 'pass' && blocked.chooserLocked ? 'pass' : 'fail', pending, blocked }
  })
  await one('F2', async (w) => { await applyFault(w, 'F2'); await w.goto(); return has(await body(w), /has not passed|not supported/i) })
  await one('F3', async (w) => { await applyFault(w, 'F3', { bytes: 5 * 1024 * 1024 }); await w.goto(); await w.setFiles(F('lecture-360s.mp4')); await w.waitFor(`/Keep less of the video|not enough free space/.test(document.body.innerText)`, { label: 'storage block', timeout: 60000 }).catch(() => undefined); return { ...has(await body(w), /Keep less of the video|not enough free space/) } })
  await one('F9', async (w) => { await applyFault(w, 'F9'); await w.goto(); await w.setFiles(F('lecture-30s.mp4')); await w.waitSettled(); return has(await body(w), /will not say how much free space/i) })
  await one('F7', async (w) => { await w.goto(); await w.setFiles(F('lecture-30s.mp4')); await w.waitSettled(); await applyFault(w, 'F7'); await sleep(300); return has(await body(w), /preview is not available/i) })
  await one('F8', async (w) => { await w.goto(); await applyFault(w, 'F8'); await sleep(500); return has(await body(w), /Report this problem/i) })
  await one('F5', async (w) => { await w.goto(); await applyFault(w, 'F5', { setting: 'granted' }); await w.click('#feedback-open'); await sleep(300); await w.type('#feedback-message', 'A test message.'); await w.click('#feedback-copy'); await sleep(500); const granted = await text(w, '#feedback-dialog'); await FAULTS.F5.now(w, { setting: 'denied' }); await w.click('#feedback-copy'); await sleep(500); const denied = await text(w, '#feedback-dialog'); const ok = /Copied/.test(granted) && /Could not copy/.test(denied); return { outcome: ok ? 'pass' : 'fail', saw: [granted, denied].map((s) => s.replace(/\s+/g, ' ').slice(-120)) } })
  await one('F10', async (w) => { await applyFault(w, 'F10'); await w.goto(); await w.setFiles(F('lecture-30s.mp4')); await w.waitFor(`/device check did not finish/i.test(document.body.innerText)`, { label: 'check failed', timeout: 60000 }).catch(() => undefined); const s = await body(w); const r = has(s, /device check did not finish/i); r.checkAgain = await w.evaluate(`[...document.querySelectorAll('button')].some((b) => !b.hidden && /Check again/.test(b.textContent))`); if (!r.checkAgain) r.outcome = 'fail'; return r })
  await one('F12', async (w) => { await applyFault(w, 'F12'); await finishedOr(w, 'failed'); const failed = has(await body(w), /ran out of working space part-way/); await w.click(w.createButton()); await w.waitFinished(); const retried = await w.evaluate(`!!document.querySelector(${JSON.stringify(w.saveButton())})`); return { ...failed, outcome: failed.outcome === 'pass' && retried ? 'pass' : 'fail', retried } })
  await one('F13', async (w) => { await applyFault(w, 'F13'); await w.goto(); await w.setFiles(F('still-10800s.mp4')); await w.waitFor(`/will work, but it will be slow/.test(document.body.innerText)`, { label: 'slow band', timeout: 240000 }).catch(() => undefined); const r = has(await body(w), /This will work, but it will be slow/); r.continueAnyway = await w.evaluate(`[...document.querySelectorAll('#process-actions button')].some((b) => !b.hidden && /Continue anyway/.test(b.textContent))`); if (!r.continueAnyway) r.outcome = 'fail'; return r })
  await one('F11', async (w) => { await applyFault(w, 'F11'); await w.goto(); await w.setFiles(F('lecture-360s.mp4')); await w.waitSettled(); await w.click(w.createButton()); await w.waitFor(`/stopped reporting progress/.test(document.body.innerText)`, { label: 'watchdog', timeout: 200000 }); const held = await body(w); const locked = await w.evaluate(`document.querySelector('#file-input').disabled`); await w.waitFor(`!/job is stopping/.test(document.body.innerText)`, { label: 'locks lift', timeout: 30000 }); const lifted = !(await w.evaluate(`document.querySelector('#file-input').disabled`)); const r = has(held, /job is stopping/); return { ...r, outcome: r.outcome === 'pass' && locked && lifted ? 'pass' : 'fail', locked, lifted } })
  for (const [id, re] of [['F4a', /Not saved/], ['F4c', /file you started with/], ['F4d', /downloads folder/i], ['F4e', /could not be saved/]]) {
    await one(id, async (w) => { await applyFault(w, id); await finished(w); await w.click(w.saveButton()); await sleep(2500); return has(await w.evaluate(status) + ' | ' + await body(w), re) })
  }
  // F4b (M-07): the save is slow (Saving, with Stop saving offered), and Stop saving stops it.
  await one('F4b', async (w) => {
    await applyFault(w, 'F4b'); await finished(w); await w.click(w.saveButton()); await sleep(1500)
    const slow = has(await w.evaluate(status) + ' | ' + await body(w), /Saving/)
    slow.stopOffered = await w.evaluate(`(() => { const b = [...document.querySelectorAll('button')].find((x) => !x.hidden && x.offsetParent && /^Stop saving$/.test(x.textContent.trim())); if (b) b.setAttribute('data-qual-stop', ''); return !!b; })()`)
    if (!slow.stopOffered) return { outcome: 'fail', slow }
    await w.click('[data-qual-stop]')
    await w.waitFor(`/Save stopped/.test(document.body.innerText)`, { label: 'save stopped', timeout: 30000 }).catch(() => undefined)
    const stopped = has(await w.evaluate(status) + ' | ' + await body(w), /Save stopped\. The video is still here/)
    return { outcome: slow.outcome === 'pass' && stopped.outcome === 'pass' ? 'pass' : 'fail', slow, stopped }
  })
  for (const [id, re] of [['F6a', /animation could not be loaded, so this video cuts/], ['F6b', /closing graphics could not be loaded/]]) {
    await one(id, async (w) => { await applyFault(w, id); await w.goto(); await w.setFiles(F('lecture-30s.mp4')); await w.waitSettled(); await w.select('#closing-type', 'fade'); await w.waitSettled(); await w.click(w.createButton()); await w.waitFinished(); return has(await body(w), re) })
  }
  // VH-198: pass 3's faults, each with the branch it reached (P-05).
  const PLAYER = '#process-result video.result-player'
  // The player as it stands once its metadata has loaded or failed (up to 8 s: a load can wait for the page to be drawn).
  const player = (w) => w.evaluate(`(async () => { const v = document.querySelector('${PLAYER}'); if (!v) return null; for (let i = 0; i < 80 && v.readyState < 1 && !v.error; i++) await new Promise((r) => setTimeout(r, 100)); return { src: v.getAttribute('src'), error: v.error ? v.error.code : null, readyState: v.readyState, paused: v.paused } })()`)
  const reads = (w, url) => w.evaluate(`fetch(${JSON.stringify(url)}).then((r) => r.ok, () => false)`)
  const saveEnabled = (w) => w.evaluate(`(() => { const b = document.querySelector(${JSON.stringify('#process-result button.button:not(.button--secondary):not(.button--danger)')}); return !!b && !b.disabled })()`)
  await one('F15a', async (w) => {
    await finished(w, 'short-2s.mp4'); const before = await player(w); const text0 = await body(w)
    await applyFault(w, 'F15a'); await sleep(800)
    const after = await player(w); const text1 = await body(w)
    const unchanged = text0 === text1 && !!after && after.src === before.src && (await saveEnabled(w))
    await w.click(w.saveButton()); await w.waitSaved(); const saved = has(await w.evaluate(status), /Saved\. Open the saved file/)
    return { outcome: unchanged && saved.outcome === 'pass' ? 'pass' : 'fail', branch: 'error event dispatched on the result player in place; nothing on the page changed; a save then completed', unchanged, before, after, saved }
  })
  await one('F15b', async (w) => {
    await applyFault(w, 'F15b'); await finished(w, 'short-2s.mp4'); await sleep(1500)
    const p = await player(w); const revoked = await w.evaluate(`(window.__f15b || {}).revoked`)
    const card = has(await body(w), /Finished video/)
    const enabled = await saveEnabled(w)
    await w.click(w.saveButton()); await w.waitSaved(); const saved = has(await w.evaluate(status), /Saved\. Open the saved file/)
    const reached = !!p && p.error !== null && revoked >= 1
    return { outcome: reached && card.outcome === 'pass' && enabled && saved.outcome === 'pass' ? 'pass' : 'fail', branch: reached ? `the player's own load refused: MediaError ${p.error}, ${revoked} object URL(s) revoked before use` : `not reached: ${revoked} URL(s) revoked, the player's error ${p?.error}, readyState ${p?.readyState}`, player: p, saveEnabled: enabled, saved }
  })
  await one('F16', async (w) => {
    await applyFault(w, 'F16'); await finished(w, 'lecture-30s.mp4')
    const r = has(await body(w), /title, author, and date could not be copied across/)
    const rewritten = w.faultsSeen.find((x) => /^F16: mediabunny rewritten/.test(x))
    return { ...r, outcome: r.outcome === 'pass' && rewritten ? 'pass' : 'fail', branch: rewritten ? `${rewritten}; the job's metadata carry rejected, so metadata-lost was added` : 'the mediabunny module was not seen by the page\'s Fetch route: undetermined until the pilot' }
  })
  await one('F17', async (w) => {
    await applyFault(w, 'F17'); await w.goto(); await sleep(1500)
    const rows = await w.evaluate(`[...document.querySelectorAll('#checks .check')].map((r) => ({ id: r.id, state: r.dataset.state }))`)
    const aac = rows.find((r) => r.id === 'check-aac'); const others = rows.filter((r) => r.id !== 'check-aac')
    const note = await w.evaluate(`(() => { const n = document.getElementById('browser-note'); return n && !n.hidden ? n.textContent.trim() : null })()`)
    const open = !(await w.evaluate(`document.querySelector('#file-input').disabled`))
    const asked = await w.evaluate(`(window.__f17 || {}).asked`)
    const ok = aac?.state === 'warn' && others.every((r) => r.state === 'pass') && /has not passed/.test(note ?? '') && open
    return { outcome: ok ? 'pass' : 'fail', branch: `isConfigSupported asked for mp4a ${asked} time(s) on the page; the aac row ${aac?.state}`, rows, note: note?.slice(0, 120), chooserOpen: open }
  })
  for (const mode of ['throw', 'callback']) {
    await one('F18' + (mode === 'callback' ? '-callback' : ''), async (w) => {
      await applyFault(w, 'F18', { mode }); await w.goto(); await w.setFiles(F('lecture-30s.mp4')); await w.waitSettled(); await w.click(w.createButton())
      await w.waitFailed().catch(() => undefined)
      const text = await body(w)
      const refused = has(text, /stopped encoding the video part-way through/)
      const fired = (w.p8planned?.faults ?? []).filter((f) => f.args[0] === 'fault F18')
      const events = await w.evaluate(`window.__p8.events`)
      const start = events.find((e) => e.kind === 'start')
      const inJob = fired.length > 0 && !!start && fired[0].t >= start.t - 500
      const shown = /failure|stopped|could not/i.test(text) ? (text.match(/[^.]*(stopped encoding|could not be made|went wrong)[^.]*\./i) || [''])[0].trim().slice(0, 160) : null
      return { outcome: refused.outcome === 'pass' && inJob ? 'pass' : 'fail', mode, branch: fired.length ? `fired at frame ${fired[0].args[2]} (${mode}), ${inJob ? 'after the job started: the job\'s encode' : 'before any job: a probe\'s encode'}; the page ${refused.outcome === 'pass' ? 'shows failure.encoderRefused' : 'does not show failure.encoderRefused: ' + JSON.stringify(shown)}` : 'the prelude never fired', refused, fired }
    })
  }
  await one('F19', async (w) => {
    await applyFault(w, 'F19'); await finished(w, 'short-2s.mp4'); const before = await player(w)
    await FAULTS.F19.leave(w)
    const f = w.f19
    const back = await w.evaluate(`location.href`).catch(() => null)
    let restoredPlayer = null
    if (f.restored) {
      const p = await player(w)
      const played = p ? await w.evaluate(`(async () => { const v = document.querySelector('${PLAYER}'); v.muted = true; try { await v.play() } catch (e) { return String(e) } await new Promise((r) => setTimeout(r, 600)); const t = v.currentTime; v.pause(); return t })()`) : null
      restoredPlayer = { same: !!p && p.src === before?.src, fetches: p ? await reads(w, p.src) : false, played }
    }
    const reached = f.dialogs.some((d) => d.type === 'beforeunload') && /localhost|127\.0\.0\.1/.test(back ?? '')
    return { outcome: reached ? 'pass' : 'fail', branch: `"Leave site?" ${f.dialogs.some((d) => d.type === 'beforeunload') ? 'raised and accepted' : 'not raised'}; back on the page; ${f.restored ? 'restored from the back-forward cache' : 'loaded afresh, Chrome\'s reasons: ' + (f.notUsed?.reasons ?? ['none given']).join('; ')}`, dialogs: f.dialogs, shows: f.shows, notUsed: f.notUsed, restoredPlayer }
  })
  await one('F4e-revised', async (w) => {
    await applyFault(w, 'F4e'); await finished(w, 'lecture-30s.mp4'); const before = await player(w)
    await w.click(w.saveButton()); await sleep(2500)
    const failed = has(await w.evaluate(status) + ' | ' + await body(w), /could not be saved/)
    const after = await player(w); const counts = await w.evaluate(`window.__f4e`)
    const stays = !!after && after.src === before?.src && after.error === null
    return { outcome: failed.outcome === 'pass' && stays && counts.spared === 1 && counts.thrown >= 1 ? 'pass' : 'fail', branch: `the job finished; the card's first object URL spared (${counts.spared}); the save's hand-off threw (${counts.thrown}); the player stays with its URL`, failed, before, after, counts }
  })
  await one('F4e-inPlace', async (w) => {
    await finished(w, 'lecture-30s.mp4'); const before = await player(w)
    await applyFault(w, 'F4e', { inPlace: true }); await w.click(w.saveButton()); await sleep(2500)
    const failed = has(await w.evaluate(status) + ' | ' + await body(w), /could not be saved/)
    const after = await player(w); const counts = await w.evaluate(`window.__f4e`)
    return { outcome: failed.outcome === 'pass' && !!after && after.src === before?.src ? 'pass' : 'fail', branch: `armed in place once the card stood; the save's hand-off threw (${counts.thrown})`, failed, counts }
  })
  // VH-207 (V-46): F20 and its twin without it. A readable file read, then
  // notvideo.mp4 chosen: with F20 its inspection never answers, so the page's
  // 120 s deadline ends the read in the took-too-long failure; without it the
  // worker's failed reply ends it, in that reply's failure.
  const replaced = async (w) => {
    await w.goto(); await w.setFiles(F('lecture-30s.mp4')); await w.waitSettled()
    const first = await w.evaluate(`!document.getElementById('step-trim').hidden && !document.querySelector('#source-report .notification[data-kind="error"]')`)
    const t0 = Date.now()
    await w.setFiles(F('notvideo.mp4'))
    await w.waitFor(`!!document.querySelector('#source-report .notification[data-kind="error"]')`, { label: 'the replacement read failed', timeout: 200000 })
    return { first, readMs: Date.now() - t0, report: await text(w, '#source-report') }
  }
  await one('F20', async (w) => {
    await applyFault(w, 'F20'); const r = await replaced(w)
    const long = has(r.report, /took longer than expected/)
    const withheld = w.faultsSeen.find((x) => /^F20: withheld/.test(x))
    return { ...long, outcome: long.outcome === 'pass' && r.first && !!withheld && r.readMs >= 110000 ? 'pass' : 'fail', branch: `${r.first ? 'lecture-30s.mp4 read' : 'the first file not read'}; ${withheld ?? 'nothing withheld'}; the replacement's read ended after ${Math.round(r.readMs / 1000)} s in ${long.outcome === 'pass' ? 'the took-too-long failure (the catch, main.ts:1495–1500)' : 'another failure'}`, firstRead: r.first, readMs: r.readMs }
  })
  await one('F20-twin', async (w) => {
    const r = await replaced(w)
    const failed = has(r.report, /could not be read as a video|went wrong reading this file|no video or audio|audio but no video/i)
    const long = /took longer than expected/.test(r.report)
    return { ...failed, outcome: failed.outcome === 'pass' && !long && r.first ? 'pass' : 'fail', branch: `F20 unset: the replacement's read ended after ${Math.round(r.readMs / 1000)} s in ${long ? 'the took-too-long failure' : "the worker's failed reply's failure (main.ts:1481–1486)"}`, firstRead: r.first, readMs: r.readMs }
  })
  browser.close()
  const { writeFileSync } = await import('node:fs')
  const { join } = await import('node:path')
  writeFileSync(join(process.env.OUT_ROOT, 'faults-check.json'), JSON.stringify(results, null, 1))
  const bad = results.filter((r) => r.outcome !== 'pass')
  console.log(`${results.length - bad.length} of ${results.length} faults reach their state` + (bad.length ? '; not: ' + bad.map((r) => r.fault).join(', ') : ''))
  process.exit(bad.length ? 1 : 0)
}

if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv[2] === 'check') check().catch((e) => { console.error(e); process.exit(1) })
