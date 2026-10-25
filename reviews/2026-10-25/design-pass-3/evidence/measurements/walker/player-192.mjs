// VH-192: the finished video plays in its card. In three languages, at 1280,
// 375 and 320 px, in light, dark and both forced-colour modes, after a job:
// the card holds one native player, after the card's lines and before the
// lifetime line and Save (the owner's 2A); it has the browser's controls,
// loads only its metadata, never autoplays, plays an object URL, and is named
// by the card's title; it fits the page and is no taller than the preview's
// cap; focus is on the card, as VH-178's rule sends it. Then, at 1280 in
// light per language, three flows:
//   keep: it plays; a page-language change renames it in place; "Keep it"
//     after the discard question puts back the same player and URL; another
//     file chosen leaves it on the "Previous video"; Discard revokes its URL,
//     and the next video gets a new one.
//   save: a slowed save completes while focus is on the player; the player
//     leaves the card (the owner's 1A), its URL is revoked, and focus is on
//     the card.
//   download: with no save dialog the page downloads; the player stays, with
//     the same URL, until Discard revokes it.
//
//   FIX=<fixtures> OUT_ROOT=<scratch>/out RUN_ROOT=<scratch>/runs \
//     node player-192.mjs [--langs …] [--views …] [--modes …] [--clips] [--no-flows] [--no-matrix]
//
//   (headless Chrome on :9222, Vite on :5173)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { connectBrowser } from './cdp.mjs'
import { Walk, F, sleep } from './walk.mjs'
import { QUAL_INIT, closeAnalysis, setViewport, setMode } from './qualify.mjs'
import { MX_INIT, ready } from './scenarios.mjs'

const RUN_ROOT = process.env.RUN_ROOT
if (!RUN_ROOT) throw new Error('set RUN_ROOT to a scratch directory')
const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1].split(',') : fallback }
const langs = opt('--langs', ['en-GB', 'zh-Hans', 'ms-MY'])
const views = opt('--views', ['w1280', 'w375', 'w320'])
const modes = opt('--modes', ['light', 'dark', 'forced-light', 'forced-dark'])
const clips = args.includes('--clips')
const flows = !args.includes('--no-flows')
const matrix = !args.includes('--no-matrix')
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const dir = join(RUN_ROOT, `player-192-${stamp}`)
mkdirSync(dir, { recursive: true })
const FILE = 'short-2s.mp4'
const OTHER = 'silent-10s.mp4'

const mx = (w, expr) => w.evaluate(`(() => { const M = window.__mx; return ${expr}; })()`)

// The card and its player as the page draws them.
const READ = `(async () => { const M = window.__mx; const doc = document.documentElement;
  const result = document.getElementById('process-result');
  const card = result.querySelector('section.notification[data-kind="success"]');
  const videos = [...result.querySelectorAll('video')];
  const v = card && card.querySelector('video.result-player');
  if (!card || !v) return { card: !!card, player: !!v, videos: videos.length };
  for (let i = 0; i < 40 && v.readyState < 1 && !v.error; i++) await new Promise((r) => setTimeout(r, 100));
  const ps = [...card.querySelectorAll(':scope > p')];
  const title = card.querySelector('.notification-title');
  const lifetime = ps.find((p) => p.textContent === M.msg('result.lifetime'));
  const actions = card.querySelector(':scope > .actions');
  const after = (a, b) => !!(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
  const linesBefore = ps.filter((p) => p !== lifetime && !p.hidden).every((p) => after(p, v));
  const r = v.getBoundingClientRect();
  return { card: true, player: true, videos: videos.length, src: v.getAttribute('src'), blob: (v.getAttribute('src') || '').startsWith('blob:'),
    controls: v.controls, preload: v.preload, autoplay: v.autoplay || v.hasAttribute('autoplay'), paused: v.paused, readyState: v.readyState,
    error: v.error ? v.error.code : null, duration: v.duration, sourceDuration: document.getElementById('trim-preview').duration, labelledBy: v.getAttribute('aria-labelledby'), titleId: title.id, title: title.textContent,
    linesBefore, beforeLifetime: after(v, lifetime), lifetimeShown: !!lifetime, beforeActions: after(v, actions),
    w: r.width, h: r.height, left: Math.round(r.left), right: Math.round(r.right), innerWidth: innerWidth, cap: innerHeight * 0.6,
    focusOnCard: document.activeElement === card, overflowX: doc.scrollWidth > doc.clientWidth, lang: doc.lang } })()`

async function axName(w) {
  const { root } = await w.page.send('DOM.getDocument', { depth: 0 })
  const { nodeId } = await w.page.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#process-result video.result-player' })
  if (!nodeId) return null
  const { nodes } = await w.page.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false })
  return nodes[0]?.name?.value ?? null
}

const judge = (r, { playing = false } = {}) => {
  const why = []
  if (!r.card || !r.player) return [`card ${r.card} player ${r.player}`]
  if (r.videos !== 1) why.push(`${r.videos} players`)
  if (!r.blob) why.push(`src ${r.src}`)
  if (!r.controls || r.preload !== 'metadata' || r.autoplay || r.paused === playing) why.push(`attrs ${r.controls}/${r.preload}/${r.autoplay}/${r.paused}`)
  if (r.error !== null || r.readyState < 1 || !(r.duration > 0)) why.push(`media ${r.error}/${r.readyState}/${r.duration}`)
  // The new video, not the original: the closing graphics make it seconds longer (Codex astra).
  if (!(Math.abs(r.duration - r.sourceDuration) > 1)) why.push(`plays ${r.duration} s, the original's ${r.sourceDuration} s`)
  if (r.labelledBy !== r.titleId || r.axName !== r.title) why.push(`name "${r.axName}" by ${r.labelledBy} (title ${r.titleId} "${r.title}")`)
  if (!r.linesBefore || !r.beforeLifetime || !r.lifetimeShown || !r.beforeActions) why.push(`place ${r.linesBefore}/${r.beforeLifetime}/${r.lifetimeShown}/${r.beforeActions}`)
  if (r.w <= 0 || r.h <= 0 || r.left < 0 || r.right > r.innerWidth || r.h > r.cap + 1) why.push(`box ${r.w} x ${r.h} at ${r.left}..${r.right} (cap ${r.cap})`)
  if (r.overflowX) why.push('overflowX')
  return why
}
const look = async (w, how) => {
  const r = await w.evaluate(READ)
  r.axName = await axName(w)
  r.why = judge(r, how)
  return r
}
// Whether an object URL still reads: a revoked one fails to fetch.
const reads = (w, url) => w.evaluate(`fetch(${JSON.stringify(url)}).then((r) => r.ok, () => false)`)

// Every object URL made and revoked, so a revocation is counted, not inferred.
const COUNT_URLS = `(() => { const U = window.__urls = { made: [], revoked: [] }; const make = URL.createObjectURL, revoke = URL.revokeObjectURL;
  URL.createObjectURL = (b) => { const u = make.call(URL, b); U.made.push(u); return u };
  URL.revokeObjectURL = (u) => { U.revoked.push(u); return revoke.call(URL, u) } })();`

const browser = await connectBrowser()
const out = []
const run = async (keyName, fn, { noPicker = false, init = [] } = {}) => {
  const w = new Walk(browser, `player-192-${stamp}/${keyName}`, { noPicker })
  try {
    await w.open()
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
    for (const source of init) await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source })
    await w.page.send('Accessibility.enable').catch(() => {})
    out.push({ key: keyName, ...(await fn(w)) })
  } catch (e) {
    out.push({ key: keyName, ok: false, error: String(e && e.message || e) })
  } finally {
    await w.close().catch(() => {})
  }
  const last = out.at(-1)
  console.log(JSON.stringify({ key: last.key, ok: last.ok, why: last.why, error: last.error }))
}
const make = async (w) => {
  if (await mx(w, 'M.ack()')) { await w.click(w.acknowledgeButton()); await sleep(200) }
  await w.click(w.createButton())
  await w.waitFinished()
}

if (matrix) for (const lang of langs) for (const view of views) for (const mode of modes) {
  await run(`matrix__${lang}__${view}__${mode}`, async (w) => {
    await setViewport(w, view)
    await setMode(w, mode)
    await ready(w, lang, FILE)
    await make(w)
    const r = await look(w)
    if (clips && (lang === 'en-GB' || view === 'w320')) await w.clip(`player192-${lang}-${view}-${mode}`, '#process-result', { pad: 8 })
    const why = [...r.why]
    if (!r.focusOnCard) why.push('focus not on the card')
    if (r.lang !== lang) why.push(`lang ${r.lang}`)
    return { lang, view, mode, r, why, ok: why.length === 0 }
  })
}

if (flows) for (const lang of langs) {
  const other = lang === 'en-GB' ? 'zh-Hans' : 'en-GB'
  await run(`keep__${lang}`, async (w) => {
    await setViewport(w, 'w1280')
    await setMode(w, 'light')
    await ready(w, lang, FILE)
    await make(w)
    const why = []
    const first = await look(w)
    why.push(...first.why.map((x) => `first: ${x}`))
    await w.evaluate(`window.__p0 = document.querySelector('#process-result video.result-player')`)
    // It plays: muted, so the browser's autoplay rule does not refuse a scripted press.
    // Left playing: the discard question below must stop it.
    const played = await w.evaluate(`(async () => { const v = window.__p0; v.muted = true; await v.play(); await new Promise((r) => setTimeout(r, 800)); return v.paused ? -1 : v.currentTime })()`)
    if (!(played > 0)) why.push(`did not play (${played})`)
    // A page-language change renames it in place, and it plays on.
    await w.chooseLanguage(other)
    const renamed = await look(w, { playing: true })
    const same1 = await w.evaluate(`document.querySelector('#process-result video.result-player') === window.__p0`)
    if (renamed.why.length || !same1 || renamed.axName === first.axName) why.push(`renamed ${same1} "${renamed.axName}" ${renamed.why}`)
    await w.chooseLanguage(lang)
    // The discard question, then Keep it: the same player and URL.
    await w.click(w.createButton())
    await sleep(300)
    const asked = await w.evaluate(`({ question: !!document.querySelector('#process-result .button--danger'), players: document.querySelectorAll('video.result-player').length, paused: window.__p0.paused })`)
    if (!asked.question || asked.players !== 0 || !asked.paused) why.push(`asked ${JSON.stringify(asked)}`)
    await w.click('#process-result .button--secondary')
    await sleep(300)
    const kept = await look(w)
    const same2 = await w.evaluate(`document.querySelector('#process-result video.result-player') === window.__p0`)
    if (kept.why.length || !same2 || kept.src !== first.src || !kept.focusOnCard) why.push(`kept ${same2} ${kept.src === first.src} ${kept.focusOnCard} ${kept.why}`)
    // Another file chosen: the same player on the "Previous video".
    await w.setFiles(F(OTHER))
    await w.waitSettled({ timeout: 300000 })
    await w.waitFor(`(() => { const M = window.__mx; return M.verdict() })()`, { label: 'a verdict', timeout: 300000 })
    await sleep(300)
    const previous = await look(w)
    const same3 = await w.evaluate(`document.querySelector('#process-result video.result-player') === window.__p0`)
    const prevTitle = await mx(w, `M.msg('result.previous').split('{size}')[0]`)
    if (previous.why.length || !same3 || previous.src !== first.src || !previous.title.startsWith(prevTitle)) why.push(`previous ${same3} "${previous.title}" ${previous.why}`)
    // Discard: its URL revoked, and the next video gets its own.
    const before = await reads(w, first.src)
    const revokedBefore = await w.evaluate(`window.__urls.revoked.filter((u) => u === ${JSON.stringify(first.src)}).length`)
    await w.click(w.createButton())
    await sleep(300)
    await w.click('#process-result .button--danger')
    await w.waitRunning()
    const revoked = !(await reads(w, first.src))
    const revokedOnce = await w.evaluate(`window.__urls.revoked.filter((u) => u === ${JSON.stringify(first.src)}).length === 1`)
    const gone = await w.evaluate(`!window.__p0.isConnected && !window.__p0.getAttribute('src')`)
    await w.waitFinished()
    const next = await look(w)
    if (!before || revokedBefore !== 0 || !revoked || !revokedOnce || !gone || next.why.length || next.src === first.src) why.push(`discard ${before}/${revokedBefore}/${revoked}/${revokedOnce}/${gone} ${next.src === first.src} ${next.why}`)
    return { lang, first, played, renamed, kept, previous, next, why, ok: why.length === 0 }
  }, { init: [COUNT_URLS] })

  // Each chunk of the save waits 1.5 s, so it completes with focus on the player.
  const slow = `(() => { const real = window.showSaveFilePicker; window.showSaveFilePicker = async (o) => { const h = await real(o);
    return { kind: 'file', name: h.name, getFile: () => h.getFile(), isSameEntry: (x) => h.isSameEntry(x), remove: () => h.remove(),
      createWritable: async () => { const out = await h.createWritable();
        return new WritableStream({ async write(c) { await new Promise((r) => setTimeout(r, 1500)); await out.write(c); }, close: () => out.close(), abort: (r) => out.abort(r) }); } }; }; })();`
  await run(`save__${lang}`, async (w) => {
    await setViewport(w, 'w1280')
    await setMode(w, 'light')
    await ready(w, lang, FILE)
    await make(w)
    const why = []
    const first = await look(w)
    why.push(...first.why.map((x) => `first: ${x}`))
    await w.click(w.saveButton())
    await sleep(200)
    await w.evaluate(`document.querySelector('#process-result video.result-player').focus()`)
    const focused = await w.evaluate(`document.activeElement && document.activeElement.matches('video.result-player')`)
    await w.waitSaved()
    await sleep(300)
    const after = await mx(w, `(() => { const card = document.querySelector('#process-result section.notification'); return {
      players: document.querySelectorAll('video').length - (document.getElementById('trim-preview') ? 1 : 0),
      focusOnCard: document.activeElement === card, saved: document.getElementById('save-status').textContent.startsWith(M.msg('status.saved').split('.')[0]),
      lifetime: [...card.querySelectorAll('p')].some((p) => p.textContent === M.msg('result.lifetime')) } })()`)
    const revoked = !(await reads(w, first.src))
    if (!focused || after.players !== 0 || !after.focusOnCard || !after.saved || after.lifetime || !revoked) why.push(`saved ${focused} ${JSON.stringify(after)} revoked ${revoked}`)
    return { lang, first, focused, after, revoked, why, ok: why.length === 0 }
  }, { init: [slow] })

  await run(`download__${lang}`, async (w) => {
    await setViewport(w, 'w1280')
    await setMode(w, 'light')
    await ready(w, lang, FILE)
    await make(w)
    const why = []
    const first = await look(w)
    why.push(...first.why.map((x) => `first: ${x}`))
    await w.click(w.saveButton())
    await w.waitSaved()
    await sleep(500)
    const delivered = await w.evaluate(`(() => { const v = document.querySelector('#process-result video.result-player'); return { there: !!v, src: v && v.getAttribute('src') } })()`)
    const lifetime = await mx(w, `[...document.querySelectorAll('#process-result p')].some((p) => p.textContent === M.msg('result.lifetimeDelivered'))`)
    const stillReads = await reads(w, first.src)
    if (!delivered.there || delivered.src !== first.src || !lifetime || !stillReads) why.push(`delivered ${JSON.stringify(delivered)} ${lifetime} ${stillReads}`)
    await w.click(w.createButton())
    await sleep(300)
    await w.click('#process-result .button--danger')
    await w.waitRunning()
    const revoked = !(await reads(w, first.src))
    if (!revoked) why.push('not revoked after Discard')
    await w.waitFinished()
    return { lang, first, delivered, lifetime, revoked, why, ok: why.length === 0 }
  }, { noPicker: true })
}
await closeAnalysis()
writeFileSync(join(dir, 'results.json'), JSON.stringify(out, null, 1))
const passed = out.filter((r) => r.ok).length
console.log(`${passed}/${out.length} ok — ${dir}`)
process.exit(passed === out.length ? 0 : 1)
