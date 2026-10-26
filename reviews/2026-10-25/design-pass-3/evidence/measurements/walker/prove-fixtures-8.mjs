// VH-198: pass 3's fixtures N6 to N14 (fixtures-8.sh) proved on the app,
// each by the state it is made for, before a scenario rests on it. N11, N12
// and N14 were "to be proved": a scenario that needs one walks only if it
// holds here (S-104, S-110, S-153); otherwise it is source-only.
// Codex astra's method check, M-04: N14 is qualified on its measured timing
// (ffprobe and ffmpeg on the PATH), not on constants: the decoded start and
// each placed end are read from the file, then held to the page's behaviour.
//
//   FIX=<fixtures> OUT_ROOT=<scratch>/out APP_URL=http://localhost:5181/ CDP_PORT=9231 \
//     node prove-fixtures-8.mjs [N6 N7 …]       (headless Chrome, a Vite dev server)
import { writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
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
const endRange = (w) => w.evaluate(`document.getElementById('trim-end-range').valueAsNumber`)
/**
 * N14's timing, measured (M-04). The decoded start: the first audio packet's
 * time plus the encoder's priming, its first packet (one AAC frame), read by
 * ffprobe; held to the second packet's time and to the decoded samples'
 * onset (the first above a tenth of the peak, counted from the first packet,
 * the decode shown to begin there by its length). Each end the page holds is
 * placed on the frame it falls in, by the picture's packets, as
 * keptRangeOnFrames does (src/media/kept-range.ts:138–143).
 */
function n14Timing(file) {
  const probe = (...a) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', ...a, '-of', 'json', file], { encoding: 'utf8' }))
  const audio = probe('-select_streams', 'a:0', '-show_entries', 'packet=pts_time,duration_time', '-read_intervals', '%+#2').packets.map((p) => ({ t: +p.pts_time, d: +p.duration_time }))
  const stream = probe('-select_streams', 'a:0', '-show_entries', 'stream=sample_rate,duration').streams[0]
  const rate = +stream.sample_rate
  const pcm = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-map', '0:a:0', '-ac', '1', '-f', 'f32le', '-'], { maxBuffer: 1 << 26 })
  const n = pcm.length / 4
  let peak = 0
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(pcm.readFloatLE(i * 4)))
  let k = 0
  while (k < n && Math.abs(pcm.readFloatLE(k * 4)) <= peak / 10) k++
  const video = probe('-select_streams', 'v:0', '-show_entries', 'packet=pts_time,duration_time', '-read_intervals', '3.8%4.4').packets.map((p) => ({ t: +p.pts_time, d: +p.duration_time })).sort((a, b) => a.t - b.t)
  const first = audio[0]
  const decodedStart = first.t + first.d
  return {
    source: 'ffprobe (packets) and ffmpeg (decoded samples)',
    firstPacketS: first.t, primingS: first.d, primingSamples: Math.round(first.d * rate), secondPacketS: audio[1]?.t ?? null, decodedStartS: Math.round(decodedStart * 1e6) / 1e6,
    decodedSamples: n, decodeFromFirstPacket: Math.abs(n / rate - +stream.duration) < 2 / rate, onsetSample: k, onsetS: Math.round((first.t + k / rate) * 1e6) / 1e6, peak: Math.round(peak * 1e4) / 1e4,
    frames: video.filter((p) => p.t >= 4 && p.t <= 4.16).map((p) => [p.t, Math.round((p.t + p.d) * 1e6) / 1e6]),
    placed: (end) => { const f = video.find((p) => p.t < end - 1e-9 && p.t + p.d > end + 1e-9); return f ? Math.round((f.t + f.d) * 1e6) / 1e6 : end },
  }
}
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
  const T = n14Timing(F('late-sound-3.71s-25fps-10s.mp4'))
  // Each on a fresh read: the End field shows one decimal, so 0:04.08 then 0:04.1 would be no change.
  await ready(w, 'en-GB', 'late-sound-3.71s-25fps-10s.mp4'); await endAt(w, '0:04.08'); const at408 = { askedS: await endRange(w), noAudio: await noAudio(w) }
  await ready(w, 'en-GB', 'late-sound-3.71s-25fps-10s.mp4'); await endAt(w, '0:04.1'); const at410 = { askedS: await endRange(w), noAudio: await noAudio(w) }
  const ms = (s) => Math.round(s * 1e4) / 10
  for (const x of [at408, at410]) Object.assign(x, { placedS: T.placed(x.askedS), askedMs: ms(x.askedS - T.decodedStartS), keptMs: ms(T.placed(x.askedS) - T.decodedStartS), keptFromFirstPacketMs: ms(T.placed(x.askedS) - T.firstPacketS) })
  // The timing holds together: the priming is the first packet, the second starts where it ends, and the decoded sound begins there (within 1 ms).
  const measured = T.decodeFromFirstPacket && T.secondPacketS !== null && Math.abs(T.secondPacketS - T.decodedStartS) < 1e-6 && Math.abs(T.onsetS - T.decodedStartS) < 0.001
  // The ranges, from that start: on a frame's edge (4.08 s) under 400 ms, the priming counted or not; asked to 4.10 s under 400 ms, placed on 4.12 s over it, the priming counted or not.
  const ranges = at408.placedS === at408.askedS && at408.keptMs < 400 && at408.keptFromFirstPacketMs < 400 && at410.placedS > at410.askedS && at410.askedMs < 400 && at410.keptMs > 400 && at410.keptFromFirstPacketMs > 400
  const page = at408.noAudio === true && at410.noAudio === false
  const held = measured && ranges && page
  const timing = { ...T }
  delete timing.placed
  return { outcome: held ? 'pass' : 'fail', timing, measured, ranges, page, at408, at410, consequence: held ? 'S-153 walked' : 'N14 not qualified: reported; S-153\'s source-only contingency not applied here, since it changes the record count' }
})
browser.close()
writeFileSync(join(OUT_ROOT, 'fixtures-proof-8.json'), JSON.stringify(results, null, 1))
console.log(`${results.filter((r) => r.outcome === 'pass').length} of ${results.length} fixtures hold`)
