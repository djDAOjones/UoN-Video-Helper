// VH-182: the footer's routes grouped by need. In three languages, at 1280,
// 375 and 320 px, in light, dark and both forced-colour modes: one "Help and
// feedback" heading (h2, the panel role), three questions (h3, the section
// role), then the routes in the sheet's order, each link's words its key's in
// the page's language, a new tab with no referrer, a 44 px target, inside the
// page, light on the band at 7:1 where colours are the page's; no landmark,
// no mailto link. Then the dialog: its heading, and the email it prepares,
// to the learning content team with the new subject; and the statement's
// contact line, naming that team, its link to the same address.
//
//   FIX=<fixtures> OUT_ROOT=<scratch>/out RUN_ROOT=<scratch>/runs \
//     node footer-182.mjs [--langs …] [--views …] [--modes …] [--only matrix|flows] [--clips]
//   (headless Chrome on :9222, Vite on :5173)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { connectBrowser } from './cdp.mjs'
import { Walk, sleep } from './walk.mjs'
import { QUAL_INIT, closeAnalysis, setViewport, setMode } from './qualify.mjs'
import { MX_INIT, LANG_VALUE } from './scenarios.mjs'

const RUN_ROOT = process.env.RUN_ROOT
if (!RUN_ROOT) throw new Error('set RUN_ROOT to a scratch directory')
const args = process.argv.slice(2)
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1].split(',') : fallback }
const langs = opt('--langs', ['en-GB', 'zh-Hans', 'ms-MY'])
const only = opt('--only', ['matrix', 'flows'])
const clips = args.includes('--clips')
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const dir = join(RUN_ROOT, `footer-182-${stamp}`)
mkdirSync(dir, { recursive: true })

// Every followed mailto: link is kept, not followed.
const MAILTO_INIT = `(() => { window.__mailtos = []; const real = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () { if (String(this.href).startsWith('mailto:')) { window.__mailtos.push(this.href); return } return real.call(this) } })();`

const ORDER = [
  ['H2', 'footer.heading'], ['H3', 'footer.groups.help'], ['A', 'footer.contact.creators', 'contact-creators'],
  ['A', 'footer.contact.selfService', 'contact-self-service'], ['H3', 'footer.groups.problem'],
  ['BUTTON', 'feedback.open', 'feedback-open'], ['H3', 'footer.groups.opinion'], ['A', 'footer.feedbackForm', 'feedback-form-link'],
]
// The approved destinations, whole: compared as resolved URLs, so any other
// team, path, query or host fails.
const HREF = {
  'contact-creators': 'https://teams.microsoft.com/l/team/19%3A14c7a4d2bf43456fa0c3c52c851fb097%40thread.tacv2/conversations?groupId=bd942b5f-5389-410c-abf2-9ba087360738&tenantId=67bda7ee-fd80-41ef-ac91-358418290a1e',
  'contact-self-service': 'https://selfservice.nottingham.ac.uk',
  'feedback-form-link': 'https://forms.cloud.microsoft/e/Meg347QQvs',
}

const READ = `(() => { const M = window.__mx; const doc = document.documentElement;
  const box = document.querySelector('.footer-help');
  const items = [...box.querySelectorAll('h2, h3, a, button')].map((el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    return { tag: el.tagName, id: el.id || null, text: el.textContent.replace(/\\s+/g, ' ').trim(), href: el.href || null, target: el.target || null, rel: el.rel || null,
      named: ['aria-label', 'aria-labelledby', 'title', 'role'].filter((n) => el.hasAttribute(n)),
      height: Math.round(r.height * 10) / 10, width: Math.round(r.width * 10) / 10, left: Math.round(r.left), right: Math.round(r.right), size: cs.fontSize, weight: cs.fontWeight, color: cs.color } })
  const role = (sel) => { const el = document.querySelector(sel); if (!el) return null; const cs = getComputedStyle(el); return { size: cs.fontSize, weight: cs.fontWeight } }
  const band = document.querySelector('.band--footer');
  const bg = getComputedStyle(band).backgroundColor;
  const lum = (c) => { const m = c.match(/[\\d.]+/g).slice(0, 3).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }); return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2] };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) };
  return { lang: doc.lang, items, bg, contrasts: items.filter((i) => i.tag !== 'BUTTON').map((i) => Math.round(ratio(i.color, bg) * 100) / 100),
    panelRole: role('.panel h2'), sectionRole: role('.statement-body h3'),
    msgs: Object.fromEntries(${JSON.stringify(ORDER.map((o) => o[1]))}.map((k) => [k, M.msg(k)])),
    landmarks: box.querySelectorAll('section, nav, aside, [role], [aria-label], [aria-labelledby]').length
      + (box.tagName !== 'DIV' || ['role', 'aria-label', 'aria-labelledby'].some((n) => box.hasAttribute(n)) ? 1 : 0), mailtoLinks: box.querySelectorAll('a[href^="mailto:"]').length,
    gone: !document.getElementById('contact-learning-content'),
    beforeVersion: !!(box.compareDocumentPosition(document.getElementById('version-line')) & Node.DOCUMENT_POSITION_FOLLOWING),
    afterStatement: !!(document.getElementById('accessibility-statement').compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING),
    innerWidth: window.innerWidth, overflowX: doc.scrollWidth > doc.clientWidth };
})()`

async function axName(w, sel) {
  const { root } = await w.page.send('DOM.getDocument', { depth: 0 })
  const { nodeId } = await w.page.send('DOM.querySelector', { nodeId: root.nodeId, selector: sel })
  const { nodes } = await w.page.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false })
  return nodes[0]?.name?.value ?? null
}

const judge = (r, mode) => {
  const why = []
  if (r.items.length !== ORDER.length) why.push(`items ${r.items.length}`)
  ORDER.forEach(([tag, key, id], i) => {
    const it = r.items[i]
    if (!it) return
    if (it.tag !== tag) why.push(`${i} tag ${it.tag}`)
    if (it.text !== r.msgs[key]) why.push(`${key} text "${it.text}"`)
    if (id && it.id !== id) why.push(`${i} id ${it.id}`)
    if (tag === 'A') {
      if (it.href !== new URL(HREF[id]).href) why.push(`${id} href ${it.href}`)
      if (it.target !== '_blank' || it.rel !== 'noopener noreferrer') why.push(`${id} tab ${it.target} ${it.rel}`)
    }
    if ((tag === 'A' || tag === 'BUTTON') && (it.height < 44 || it.width < 44)) why.push(`${id} target ${it.width} x ${it.height}`)
    // Nothing overrides the words as the name: no aria-label, labelledby, title or role.
    if (it.named.length) why.push(`${key} named by ${it.named}`)
    if (id && r.axNames[id] !== r.msgs[key]) why.push(`${id} accessible name "${r.axNames[id]}"`)
    if (it.left < 0 || it.right > r.innerWidth) why.push(`${key} off the page ${it.left}..${it.right}`)
    if (tag === 'H2' && (it.size !== r.panelRole.size || it.weight !== r.panelRole.weight)) why.push(`h2 role ${it.size}/${it.weight}`)
    if (tag === 'H3' && (it.size !== r.sectionRole.size || it.weight !== r.sectionRole.weight)) why.push(`h3 role ${it.size}/${it.weight}`)
  })
  if (!mode.startsWith('forced') && r.contrasts.some((c) => c < 7)) why.push(`contrast ${r.contrasts}`)
  if (r.landmarks) why.push('landmark')
  if (r.mailtoLinks) why.push('mailto link')
  if (!r.gone) why.push('learning content link')
  if (!r.beforeVersion || !r.afterStatement) why.push('place')
  if (r.overflowX) why.push('overflowX')
  return why
}

const browser = await connectBrowser()
const out = []
const run = async (keyName, fn) => {
  const w = new Walk(browser, `footer-182-${stamp}/${keyName}`)
  try {
    await w.open()
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: QUAL_INIT })
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MX_INIT })
    await w.page.send('Page.addScriptToEvaluateOnNewDocument', { source: MAILTO_INIT })
    out.push({ key: keyName, ...(await fn(w)) })
  } catch (e) {
    out.push({ key: keyName, ok: false, error: String(e && e.message || e) })
  } finally {
    await w.close().catch(() => {})
  }
  const last = out.at(-1)
  console.log(JSON.stringify({ key: last.key, ok: last.ok, why: last.why, error: last.error }))
}
const load = async (w, lang) => {
  await w.goto()
  if (lang !== 'en-GB') await w.chooseLanguage(LANG_VALUE[lang])
  await sleep(600)
}

if (only.includes('matrix')) for (const lang of langs) for (const view of opt('--views', ['w1280', 'w375', 'w320'])) for (const mode of opt('--modes', ['light', 'dark', 'forced-light', 'forced-dark'])) {
  await run(`matrix__${lang}__${view}__${mode}`, async (w) => {
    await setViewport(w, view)
    await setMode(w, mode)
    await load(w, lang)
    const r = { lang, view, mode, ...(await w.evaluate(READ)) }
    // The name each route is announced by, from the browser's own tree.
    await w.page.send('Accessibility.enable').catch(() => {})
    r.axNames = {}
    for (const [, , id] of ORDER) if (id) r.axNames[id] = await axName(w, `#${id}`)
    if (clips && (lang === 'en-GB' || view === 'w320')) await w.clip(`footer-${lang}-${view}-${mode}`, '.footer-help')
    r.why = judge(r, mode)
    r.ok = r.lang === lang && r.why.length === 0
    return r
  })
}

// The dialog's heading and its email, and the statement's contact line.
const FLOW = `(() => { const M = window.__mx; const h = document.getElementById('feedback-heading');
  const contact = document.getElementById('statement-contact'); const a = contact.querySelector('a');
  return { heading: h.textContent.trim(), headingMsg: M.msg('feedback.heading'), open: document.getElementById('feedback-dialog').open,
    mailtos: window.__mailtos, contactText: contact.textContent.replace(/\\s+/g, ' ').trim(), contactHref: a && a.getAttribute('href'),
    contactMsg: M.msg('statement.contact.text'), intro: document.getElementById('feedback-intro').textContent.replace(/\\s+/g, ' ').trim() } })()`
if (only.includes('flows')) for (const lang of langs) {
  await run(`flow__${lang}__w1280`, async (w) => {
    await setViewport(w, 'w1280')
    await load(w, lang)
    await w.click('#feedback-open')
    await sleep(400)
    await w.type('#feedback-message', 'VH-182 walker')
    await w.click('#feedback-form button[type="submit"]')
    await sleep(400)
    const r = { lang, ...(await w.evaluate(FLOW)) }
    const why = []
    if (!r.open || r.heading !== r.headingMsg) why.push(`heading ${r.heading}`)
    const m = r.mailtos[0] && new URL(r.mailtos[0])
    if (!m || m.pathname !== 'UI-Learning-Content@nottingham.ac.uk') why.push(`to ${m && m.pathname}`)
    if (!m || !String(m.searchParams.get('subject')).startsWith('UoN Video Helper problem report')) why.push(`subject ${m && m.searchParams.get('subject')}`)
    if (!r.intro.includes('UI-Learning-Content@nottingham.ac.uk')) why.push('intro address')
    const [before, after] = r.contactMsg.split('{address}')
    if (!r.contactText.startsWith(before.trim()) || !r.contactText.includes('UI-Learning-Content@nottingham.ac.uk') || !r.contactText.endsWith(after.trim())) why.push(`contact "${r.contactText}"`)
    if (r.contactHref !== 'mailto:UI-Learning-Content@nottingham.ac.uk') why.push(`contact href ${r.contactHref}`)
    r.why = why
    r.ok = why.length === 0
    return r
  })
}
await closeAnalysis()
writeFileSync(join(dir, 'results.json'), JSON.stringify(out, null, 1))
console.log(`${out.filter((r) => r.ok).length}/${out.length} ok — ${dir}`)
process.exit(out.every((r) => r.ok) ? 0 : 1)
