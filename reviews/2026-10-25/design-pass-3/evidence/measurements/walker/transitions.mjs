// VH-178: walks the focus hand-off's transitions (scenarios.mjs TRANSITIONS,
// V-46) in the languages and modes asked, at 1280 px. Each record: focus the
// moment the transition is over, whether it ran as declared, whether focus
// landed where it must, then the rendered ring on that control (2.4.13, the
// focus instrument: 3:1 over a 2 px perimeter). A record passes only when
// focus landed, every condition its transition `asserts` holds, and focus
// entered nothing on the way but where it ended (Codex astra's check,
// VH-178). Kept for VH-176.
//
//   FIX=<scratch>/fixtures OUT_ROOT=<scratch>/out RUN_ROOT=<scratch>/runs \
//     node transitions.mjs <ids|all> [--langs en-GB,zh-Hans,ms-MY] [--modes light,dark,forced-light,forced-dark] [--shots]
//   (headless Chrome on :9222, Vite on :5173)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { connectBrowser } from './cdp.mjs'
import { Walk } from './walk.mjs'
import { QUAL_INIT, focusArea, closeAnalysis, setViewport, setMode } from './qualify.mjs'
import { TRANSITIONS, MX_INIT } from './scenarios.mjs'

const RUN_ROOT = process.env.RUN_ROOT
if (!RUN_ROOT) throw new Error('set RUN_ROOT to a scratch directory')
const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1].split(',') : fallback }
const flags = new Set(['--langs', '--modes'])
const ids = args.filter((a, i) => !a.startsWith('--') && !flags.has(args[i - 1]))
const chosen = ids.includes('all') || !ids.length ? Object.keys(TRANSITIONS) : ids
const langs = opt('--langs', ['en-GB'])
const modes = opt('--modes', ['light'])
const shots = args.includes('--shots')
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const dir = join(RUN_ROOT, `transitions-${stamp}`)
mkdirSync(dir, { recursive: true })

const browser = await connectBrowser()
const out = []
for (const id of chosen) {
  const t = TRANSITIONS[id]
  if (!t) throw new Error('no transition ' + id)
  for (const lang of langs) for (const mode of modes) {
    const key = `${id}__${lang}__${mode}`
    const w = new Walk(browser, `transitions-${stamp}/${key}`)
    const started = Date.now()
    const rec = { id, name: t.name, lang, mode, view: 'w1280', successor: t.successor }
    try {
      await w.open()
      await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
      await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
      await setViewport(w, 'w1280')
      await setMode(w, mode)
      const r = await t.run(w, lang)
      Object.assign(rec, r, { faults: w.faults ?? [], faultsSeen: w.faultsSeen ?? [] })
      const asserted = { ...t.asserts(r.ran ?? {}), noDetour: (r.moves ?? []).every((m) => r.el.startsWith(m)) }
      rec.asserted = asserted
      rec.unmet = Object.keys(asserted).filter((k) => asserted[k] !== true)
      // The ring on the control focus reached: the successor, never the reader's own choice.
      const ring = t.ring ?? (t.successor !== 'moved' && t.successor !== 'dialog[open]' ? t.successor : null)
      if (ring && r.landed) {
        const sel = typeof ring === 'string' ? ring : ring.sel
        const f = await focusArea(w, sel, typeof ring === 'string' ? {} : { ref: ring.ref })
        const { on } = f
        const reading = { ...f }
        delete reading.off
        delete reading.on
        rec.ringReading = reading
        if (shots && on) { writeFileSync(join(dir, `${key}__ring-on.png`), on); rec.ringShot = `${key}__ring-on.png` }
      }
    } catch (e) {
      rec.error = String(e.stack ?? e).slice(0, 400)
    } finally {
      rec.seconds = Math.round((Date.now() - started) / 1000)
      await w.close().catch(() => undefined)
    }
    rec.outcome = rec.error ? 'error' : rec.landed && !rec.unmet.length ? 'pass' : 'fail'
    writeFileSync(join(dir, `${key}.json`), JSON.stringify(rec, null, 1))
    out.push(rec)
    console.log(`${rec.outcome.padEnd(5)} ${key}: ${rec.el ?? ''}${rec.unmet?.length ? ' unmet ' + rec.unmet.join(',') : ''} inView ${JSON.stringify(rec.inView)} ${rec.ringReading ? `ring ${rec.ringReading.outcome} ${rec.ringReading.areaAt3to1}/${rec.ringReading.perimeter2px}` : ''} ${JSON.stringify(rec.ran ?? {})} ${rec.error ? rec.error.split('\n')[0] : ''} (${rec.seconds} s)`)
  }
}
await closeAnalysis()
writeFileSync(join(dir, 'summary.json'), JSON.stringify(out, null, 1))
console.log('run dir: ' + dir)
browser.close()
process.exit(0)
