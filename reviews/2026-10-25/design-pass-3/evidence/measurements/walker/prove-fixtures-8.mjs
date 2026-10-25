// VH-198: pass 3's fixtures N6 to N14 (fixtures-8.sh) proved on the app,
// each by the state it is made for, before a scenario rests on it. N11, N12
// and N14 were "to be proved": a scenario that needs one walks only if it
// holds here (S-104, S-110, S-153); otherwise it is source-only.
//
//   FIX=<fixtures> OUT_ROOT=<scratch>/out APP_URL=http://localhost:5181/ CDP_PORT=9231 \
//     node prove-fixtures-8.mjs [N6 N7 …]       (headless Chrome, a Vite dev server)
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectBrowser } from './cdp.mjs'
import { Walk, F, sleep, OUT_ROOT } from './walk.mjs'
import { QUAL_INIT, focusByKeyboard } from './qualify.mjs'
import { MX_INIT, ready } from './scenarios.mjs'
import { P8_INIT, watchWorkers } from './phase8.mjs'

const SAMPLE = join(process.env.APP_ROOT ?? join(dirname(fileURLToPath(import.meta.url)), '../../../../../..'), 'samples', 'UoN Closing Logo Fade Blue 2025.mov')
const browser = await connectBrowser()
const only = process.argv.slice(2)
const results = []
const mx = (w, expr) => w.evaluate(`(() => { const M = window.__mx; return ${expr}; })()`)
const until = (w, expr, label, timeout = 120000) => w.waitFor(`(() => { const M = window.__mx; try { return !!(${expr}); } catch (e) { return false; } })()`, { label, timeout })
async function one(id, what, fn) {
  if (only.length && !only.includes(id)) return
  const w = new Walk(browser, 'fixture-' + id)
  await w.open()
  w.browser = browser
  for (const source of [QUAL_INIT, MX_INIT, P8_INIT]) await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source })
  await watchWorkers(browser, w)
  const t0 = Date.now()
  try { results.push({ fixture: id, what, ...(await fn(w)), seconds: Math.round((Date.now() - t0) / 1000) }) } catch (e) { results.push({ fixture: id, what, outcome: 'fail', why: String(e.message ?? e).slice(0, 300) }) } finally { await w.close() }
  console.log(JSON.stringify(results.at(-1)).slice(0, 500))
}
const create = async (w) => { if (await mx(w, 'M.ack()')) { await w.click(w.acknowledgeButton()); await sleep(200) } await w.click(w.createButton()) }
const done = (w, timeout = 600000) => until(w, `M.finished() || M.res() === 'failure'`, 'an outcome', timeout)
const endAt = async (w, t) => { await w.type('#trim-end', t); await w.press('Tab'); await w.waitSettled(); await until(w, 'M.verdict() || M.kindIn("#audio-warnings")', 'the re-check', 60000); await sleep(300) }
const noAudio = (w) => mx(w, `M.has('warnings.noAudio.heading', '#audio-warnings')`)
const duration = (w) => w.evaluate(`(async () => { const s = document.querySelector('#source-report summary'); if (!s.closest('details').open) s.click(); await new Promise((r) => setTimeout(r, 300)); const dt = [...document.querySelectorAll('#source-report dt')].find((d) => d.textContent.trim() === window.__mx.msg('source.rows.duration')); return dt ? dt.nextElementSibling.textContent.trim() : null })()`)
const handle = async (w, keys) => { await focusByKeyboard(w, '#trim-start-range'); const out = []; for (const k of keys) { await w.press(k); out.push(await w.evaluate(`(() => { const r = document.getElementById('trim-start-range'); return { v: Math.round(r.valueAsNumber * 1000) / 1000, text: r.getAttribute('aria-valuetext') } })()`)) } return out }

await one('N6', 'clicks-20s.mp4: a bite over 3 LU by a clear margin (S-135 to S-138, S-151, S-152)', async (w) => {
  await ready(w, 'en-GB', 'clicks-20s.mp4'); await create(w); await done(w)
  const p = (w.p8planned?.planned ?? []).at(-1)
  const warned = await mx(w, `!!window.__p8.warnBox() && window.__p8.warnBox().textContent.includes(M.msg('warnings.heavyLimiting.heading'))`)
  return { outcome: p && p.limiterBiteLu > 3 + 5 && warned ? 'pass' : 'fail', bite: p?.limiterBiteLu ?? null, planned: p, warned, margin: 'over HEAVY_LIMITING_LU (3) by more than 5 LU' }
})
await one('N7', 'still-1000s.mp4 and still-1100s.mp4: the 1% boundary (S-94)', async (w) => {
  await ready(w, 'en-GB', 'still-1000s.mp4', { timeout: 600000 }); const a = await handle(w, ['PageUp', 'PageDown'])
  await w.setFiles(F('still-1100s.mp4')); await w.waitSettled({ timeout: 600000 }); await until(w, 'M.verdict()', 'verdict', 600000); const b = await handle(w, ['PageUp', 'PageDown'])
  return { outcome: a[0].v === 10 && a[1].v === 0 && b[0].v === 11 && b[1].v === 0 ? 'pass' : 'fail', s1000: a, s1100: b }
})
await one('N8', 'late sound: a, the sliver; b, the control; c, untrimmed (S-99 to S-102)', async (w) => {
  await ready(w, 'en-GB', 'late-sound-10s.mp4'); await endAt(w, '0:04'); const a = await noAudio(w)
  await ready(w, 'en-GB', 'late-sound-3.4s-10s.mp4'); await endAt(w, '0:04'); const b = await noAudio(w)
  await ready(w, 'en-GB', 'late-sound-9.7s-10s.mp4'); const c = await mx(w, `M.text('#audio-warnings').replace(/\\s+/g, ' ').trim().slice(0, 200)`)
  return { outcome: a === true && b === false ? 'pass' : 'fail', aNoAudio: a, bNoAudio: b, cVerdictNotes: c || null }
})
await one('N9', 'lecture-30s.mkv, whole: the unchecked caption warning (S-105)', async (w) => {
  await ready(w, 'en-GB', 'lecture-30s.mkv')
  const r = await mx(w, `({ title: document.body.textContent.includes(M.msg('source.losses.uncheckedTitle')), passage: document.body.textContent.replace(/\\s+/g, ' ').includes(M.msg('source.losses.captionsConsequence').trim()) })`)
  return { outcome: r.title && r.passage ? 'pass' : 'fail', ...r }
})
await one('N10', 'short-0.4s.mp4: "Less than a second" (S-103)', async (w) => {
  await ready(w, 'en-GB', 'short-0.4s.mp4'); const d = await duration(w)
  return { outcome: d === 'Less than a second' ? 'pass' : 'fail', duration: d }
})
await one('N11', 'noduration-10s.webm: a duration not written (S-104), to be proved', async (w) => {
  await ready(w, 'en-GB', 'noduration-10s.webm'); const d = await duration(w)
  return { outcome: d === 'Unknown' ? 'pass' : 'fail', duration: d, verdict: await mx(w, 'M.verdict()'), consequence: d === 'Unknown' ? 'S-104 walked' : 'S-104 source-only: the page reads this file\'s duration' }
})
await one('N12', 'slides-60s.mp4: classed as screen and not capped (S-110), to be proved', async (w) => {
  await ready(w, 'en-GB', 'slides-60s.mp4'); await w.click('#preset-choice input[value="smaller"]'); await w.waitSettled(); await until(w, 'M.verdict()', 'verdict')
  // Composed with its substituted name: "…choose {best} instead." (M.says).
  const slides = await mx(w, `M.says('preflight.slides', { best: { msg: 'preset.inSentence.best' } }, '#preflight-report')`)
  return { outcome: slides ? 'pass' : 'fail', slidesLine: slides, report: await mx(w, `M.text('#preflight-report').replace(/\\s+/g, ' ').slice(0, 300)`), consequence: slides ? 'S-110 walked' : 'S-110 source-only' }
})
await one('N13', 'qtrle-5s.mov: read and checked (S-140n; its job is S-140n\'s record)', async (w) => {
  // The closing asset it stands for, read only (samples/ is never written): how the page takes it, beside N13.
  await ready(w, 'en-GB', SAMPLE, { timeout: 300000 })
  const sample = await mx(w, `({ verdict: M.verdict(), block: M.kindIn('#source-block'), heading: M.text('#preflight-report .notification-title'), blockText: M.text('#source-block').replace(/\\s+/g, ' ').trim().slice(0, 160) })`)
  await ready(w, 'en-GB', 'qtrle-5s.mov', { timeout: 300000 })
  // Read either way; whether it stands for the closing asset is recorded: a block here is not the sample's ten-minute job.
  return { outcome: (await mx(w, '!!M.verdict() || !!M.kindIn("#source-block")')) ? 'pass' : 'fail', verdict: await mx(w, 'M.verdict()'), block: await mx(w, 'M.kindIn("#source-block")'), blockText: await mx(w, `M.text('#source-block').replace(/\\s+/g, ' ').trim().slice(0, 240)`), heading: await mx(w, `M.text('#preflight-report .notification-title')`), sample, twin: 'compared with the sample read just before' }
})
await one('N14', 'late-sound-3.71s-25fps-10s.mp4: the frame-snap case (S-153), to be proved', async (w) => {
  // Each on a fresh read: the End field shows one decimal, so 0:04.08 then 0:04.1 would be no change.
  await ready(w, 'en-GB', 'late-sound-3.71s-25fps-10s.mp4'); await endAt(w, '0:04.08'); const onEdge = await noAudio(w) // 370 ms, on a frame's edge: a sliver
  await ready(w, 'en-GB', 'late-sound-3.71s-25fps-10s.mp4'); await endAt(w, '0:04.1'); const inFrame = await noAudio(w) // 390 ms asked, 410 ms once placed on 4.12 s
  const range = await w.evaluate(`document.getElementById('trim-end-range').valueAsNumber`)
  return { outcome: onEdge === true && inFrame === false ? 'pass' : 'fail', at408: { noAudio: onEdge, keptMs: 370 }, at410: { noAudio: inFrame, askedMs: 390, placedMs: 410, endRange: range }, consequence: onEdge === true && inFrame === false ? 'S-153 walked' : 'S-153 source-only' }
})
browser.close()
writeFileSync(join(OUT_ROOT, 'fixtures-proof-8.json'), JSON.stringify(results, null, 1))
console.log(`${results.filter((r) => r.outcome === 'pass').length} of ${results.length} fixtures hold`)
