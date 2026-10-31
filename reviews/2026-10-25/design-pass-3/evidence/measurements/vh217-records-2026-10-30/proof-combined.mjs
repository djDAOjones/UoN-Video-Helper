// VH-217 #1: the combined 32 px cells qualified (the item's criterion), outside the walker. Part A, no browser: `setMode` sends byte-the-same protocol calls
// for the eight existing modes on the qualified walker as on the base's. Part B, in Chrome: each of dark-font32, forced-light-font32 and forced-dark-font32
// reaches its media and a 32 px root in each language at 1280 and 320 px, `assertReached` passes it, and refuses the wrong one: a page at 16 px asserted as
// combined, and a combined page asserted as another. Prints PASS or FAIL per line; exit 1 on any FAIL.
//   WALKER=<new> WALKER_BASE=<base copy> CDP_PORT=… APP_URL=… OUT_ROOT=… RUN_ROOT=… node proof-combined.mjs
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'
const imp = (d, f) => import(pathToFileURL(join(d, f)).href)
const WALKER = process.env.WALKER, BASE = process.env.WALKER_BASE
const Q = await imp(WALKER, 'qualify.mjs'), Q0 = await imp(BASE, 'qualify.mjs')
let bad = 0; const say = (ok, what) => { if (!ok) bad++; console.log(`${ok ? 'PASS' : 'FAIL'} ${what}`) }
const wire = async (q, mode) => { const calls = []; const w = { page: { send: async (m, p) => { calls.push([m, p]) } }, media: { pointer: 'fine' }, spacing: async (on) => { calls.push(['spacing', on]) } }; await q.setMode(w, mode); return JSON.stringify(calls) }
for (const mode of ['light', 'dark', 'forced-light', 'forced-dark', 'reduced-motion', 'spacing', 'fallback', 'font32']) say(await wire(Q, mode) === await wire(Q0, mode), `A wire unchanged: ${mode}`)
say(!(await wire(Q, 'dark')).includes('"standard":32') && (await wire(Q, 'dark-font32')).includes('"standard":32'), 'A dark is 16 px; dark-font32 is 32 px')
const { connectBrowser } = await imp(WALKER, 'cdp.mjs'); const { Walk, sleep } = await imp(WALKER, 'walk.mjs'); const { MX_INIT, LANG_VALUE } = await imp(WALKER, 'scenarios.mjs')
const browser = await connectBrowser()
const WANT = { 'dark-font32': [true, false], 'forced-light-font32': [false, true], 'forced-dark-font32': [true, true] }
for (const lang of ['en-GB', 'zh-Hans', 'ms-MY']) for (const view of ['w1280', 'w320']) for (const [mode, [dark, forced]] of Object.entries(WANT)) {
  const w = new Walk(browser, `proof-combined/${lang}-${view}-${mode}`)
  try {
    await w.open(); await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: Q.QUAL_INIT }); await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
    await Q.setViewport(w, view); await Q.setMode(w, mode); await w.goto(); if (lang !== 'en-GB') await w.chooseLanguage(LANG_VALUE[lang]); await sleep(400)
    const seen = await w.evaluate(`({ root: parseFloat(getComputedStyle(document.documentElement).fontSize), dark: matchMedia('(prefers-color-scheme: dark)').matches, forced: matchMedia('(forced-colors: active)').matches })`)
    say(seen.root === 32 && seen.dark === dark && seen.forced === forced, `B reached ${lang} ${view} ${mode}: ${JSON.stringify(seen)}`)
    say((await Q.assertReached(w, { lang, mode })).outcome === 'pass', `B assertReached passes ${lang} ${view} ${mode}`)
    const other = mode === 'dark-font32' ? 'forced-dark-font32' : 'dark-font32'
    const refused = await Q.assertReached(w, { lang, mode: other })
    say(refused.outcome !== 'pass', `B refuses ${mode} asserted as ${other}: ${(refused.problems ?? []).join('; ').slice(0, 80)}`)
    const plain = mode.replace('-font32', '')
    await Q.setMode(w, plain); const r16 = await Q.assertReached(w, { lang, mode }); say(r16.outcome !== 'pass' && (r16.problems ?? []).some((p) => /root font/.test(p)), `B refuses a 16 px page asserted as ${mode}: ${(r16.problems ?? []).join('; ').slice(0, 80)}`)
    await Q.setMode(w, mode); await sleep(200); say((await Q.assertReached(w, { lang, mode })).outcome === 'pass', `B back to ${mode}`)
  } catch (e) { say(false, `B ${lang} ${view} ${mode} error ${String(e.message ?? e).slice(0, 160)}`) } finally { await w.close().catch(() => undefined) }
}
await Q.closeAnalysis()
browser.close()
console.log(bad ? `${bad} FAILED` : 'ALL PASS')
process.exit(bad ? 1 : 0)
