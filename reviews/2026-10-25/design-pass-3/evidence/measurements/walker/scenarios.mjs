// PLAN-7 (VH-172): the matrix's declarations, kept apart from its runner so
// the repo walker can take them while matrix.mjs, qualify.mjs and runner.mjs
// change underneath: every walked scenario (setup, state predicate, focus
// list), the keyboard routes J1-J4 and K-dialog, the plans, and the gaps.
// matrix.mjs imports SCENARIOS, ROUTES, PLANS, MX_INIT and GAPS from here.
import { Buffer } from 'node:buffer'
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { F, sleep } from './walk.mjs'
import { IN_DIALOG, IN_DIALOG_OR_OUT, focusByKeyboard, key } from './qualify.mjs'
// VH-207 (V-46): the ring read where a variant's focus lands, as the focus instrument reads one.
import { focusArea } from './qualify.mjs'
import { FAULTS, applyFault, releaseFault, releaseAll, gotoNoWait } from './faults.mjs'
import { spokenAtCompletion } from './phase8.mjs'

// VH-198: S-140 reads the closing asset from samples/ (never written there).
const APP_ROOT = process.env.APP_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../..')
const SAMPLE_QTRLE = join(APP_ROOT, 'samples', 'UoN Closing Logo Fade Blue 2025.mov')

// ---------------------------------------------------------------------------
// In-page helpers for the state predicates (VH-172). Language-independent: a
// state is read from the page's structure (ids, hidden flags, aria and data
// attributes, the notification's data-kind), and where only words tell two
// states apart, from the page's own message table in the page's current
// language (`/src/i18n/<lang>.ts`, the modules the app itself loads), never
// from English text. A table not loaded makes every such test false.
export const MX_INIT = String.raw`
(() => {
  const M = (window.__mx = { tables: {} });
  if (/^https?:/.test(location.protocol)) for (const tag of ['en-GB', 'zh-Hans', 'ms-MY'])
    import('/src/i18n/' + tag + '.ts').then((m) => { const t = Object.values(m).find((v) => v && v.meta && v.meta.locale === tag); if (t) M.tables[tag] = t; }).catch(() => {});
  M.msg = (path, lang) => { let v = M.tables[lang || document.documentElement.lang]; for (const k of path.split('.')) v = v == null ? v : v[k]; return v; };
  const leaves = (v) => (v == null ? [] : typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(leaves) : Object.values(v).flatMap(leaves));
  const norm = (s) => String(s).replace(/\s+/g, ' ');
  // A message is in a text when every literal part between its placeholders is.
  M.matches = (text, path) => { const tx = norm(text); return leaves(M.msg(path)).some((s) => { const parts = s.split(/\{[^}]+\}/).map((p) => norm(p).trim()).filter((p) => p.length >= 2); return parts.length > 0 && parts.every((p) => tx.includes(p)); }); };
  // VH-198 (P-05): composed wording pinned with its substituted names. M.matches
  // checks only the literal parts, so it passed S-31 with the old output name
  // (Phase 7, scenarios.mjs:26, :449). A value is a literal, or { msg: path } for
  // another message in the page's language; the whole sentence must be there.
  M.compose = (path, vars = {}) => { const t = M.msg(path); if (typeof t !== 'string') return null; return t.replace(/\{([^}]+)\}/g, (m, k) => { const v = vars[k]; if (v == null) return m; if (typeof v === 'object' && v.msg) { const x = M.msg(v.msg); return typeof x === 'string' ? x : m; } return String(v); }); };
  M.says = (path, vars, sel = 'body') => { const c = M.compose(path, vars); return !!c && !/\{[^}]+\}/.test(c) && norm(M.text(sel)).includes(norm(c).trim()); };
  M.el = (sel) => (typeof sel === 'string' ? document.querySelector(sel) : sel);
  M.text = (sel) => { const el = M.el(sel); return el ? el.textContent || '' : ''; };
  M.has = (path, sel = 'body') => M.matches(M.text(sel), path);
  M.is = (path, sel) => { const t = norm(M.text(sel)).trim(); return leaves(M.msg(path)).some((s) => norm(s).trim() === t); };
  M.vis = (sel) => { const el = M.el(sel); return !!el && !!window.__audit && window.__audit.visible(el); };
  M.shown = (el) => !!el && !el.hidden && M.vis(el);
  M.kindIn = (sel) => { const n = document.querySelector(sel + ' .notification'); return n && M.vis(n) ? n.dataset.kind : null; };
  // What step 6's result area holds: none, a result, the discard question or a failure.
  M.res = () => { const r = document.getElementById('process-result'); if (!r || !r.children.length || !M.vis(r)) return 'none'; if (r.querySelector('.button--danger')) return 'question'; const n = r.querySelector(':scope > .notification'); return !n ? 'other' : n.dataset.kind === 'success' ? 'result' : n.dataset.kind === 'error' ? 'failure' : n.dataset.kind; };
  M.resultTitle = () => M.text('#process-result > .notification[data-kind="success"] > .notification-title');
  M.previous = () => M.res() === 'result' && M.matches(M.resultTitle(), 'result.previous');
  M.finished = () => M.res() === 'result' && M.matches(M.resultTitle(), 'result.finished');
  M.saveBtn = () => document.querySelector('#process-result > .notification[data-kind="success"] .actions > button.button');
  M.lifetime = (path) => [...document.querySelectorAll('#process-result > .notification[data-kind="success"] > p')].some((p) => M.is(path, p));
  M.btn = (n) => document.querySelector('#process-actions > button:nth-child(' + n + ')');
  M.create = () => M.vis('#process-actions') && M.shown(M.btn(2));
  M.ack = () => M.vis('#process-actions') && M.shown(M.btn(1));
  M.running = () => M.vis('#process-progress') && M.shown(M.btn(3)) && !M.btn(3).disabled;
  M.idle = () => !M.vis('#process-progress') && !M.shown(M.btn(3));
  M.verdict = () => M.kindIn('#preflight-report');
  M.heading = (path) => M.is(path, '#preflight-report .notification-title');
  // The page's own device class (src/media/capability.ts:72): on a phone every verdict is the mobile one.
  // As the page decides: userAgentData.mobile where it is a boolean, false included (VH-172: a false fell through to the touch fallback), else a coarse pointer with touch.
  M.phone = () => { const d = navigator.userAgentData; return d && typeof d.mobile === 'boolean' ? d.mobile : matchMedia('(pointer: coarse)').matches && navigator.maxTouchPoints > 1; };
  M.proceed = () => (M.phone() ? M.heading('preflight.headings.mobile') : M.verdict() === 'success' && M.heading('preflight.headings.proceed'));
  M.checking = () => M.vis('#stop-actions') && M.shown(document.querySelector('#stop-actions > button:nth-child(1)'));
  M.checkAgain = () => M.vis('#stop-actions') && M.shown(document.querySelector('#stop-actions > button:nth-child(2)'));
  M.saving = () => M.vis('#save-actions');
  M.chosen = () => !!(document.getElementById('file-input') || {}).files?.length;
  M.checked = (name) => { const el = document.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : null; };
  M.focused = (sel) => { const el = M.el(sel); return !!el && document.activeElement === el; };
  M.fields = (ids) => ids.map((id) => document.getElementById(id));
  M.SUB = ['submission-card-assignment', 'submission-card-module', 'submission-card-convenor', 'submission-card-ids'];
  // VH-172 (VH-164's contract): a mailto: link the page follows is logged as prepared (recipient, subject and body present, length), then followed as before.
  M.mailto = [];
  const click0 = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () { if (/^mailto:/i.test(this.href)) { const u = this.href, q = u.indexOf('?'); M.mailto.push({ t: Math.round(performance.now()), chars: u.length, to: decodeURIComponent(u.slice(7, q > 0 ? q : undefined)), subject: /[?&]subject=/.test(u), subjectText: q > 0 ? new URLSearchParams(u.slice(q + 1)).get('subject') : null, body: /[?&]body=/.test(u) }); } return click0.call(this); };
})();
`

// VH-172: readings beside the instruments, for the six-fix contract: not
// verdicts. Segment widths with which is chosen (VH-166's reserved width),
// the header band's inset against the column (V-36), the footer's panels,
// gap and headings (V-37, wrapped headings), the toggletip's paragraph gap
// (VH-167), the feedback hand-off and the form link (VH-164), and what a
// person had chosen and typed (VH-164: kept).
export const READINGS = String.raw`(() => {
  const M = window.__mx; const q = (s) => document.querySelector(s);
  const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return r.width || r.height ? { x: Math.round(r.left * 10) / 10, y: Math.round((r.top + scrollY) * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 } : null; };
  const font = (el) => { const c = getComputedStyle(el); return c.fontFamily.split(',')[0].replace(/["']/g, '') + ' ' + c.fontSize + '/' + c.lineHeight + ' ' + c.fontWeight; };
  const segments = [...document.querySelectorAll('fieldset.segmented')].filter((f) => box(f)).map((f) => ({ id: f.id, segments: [...f.querySelectorAll('.segment')].map((s) => ({ text: s.textContent.trim().slice(0, 24), chosen: !!s.querySelector('input:checked'), w: box(s) && box(s).w, face: box(s.querySelector('.segment-face')) && box(s.querySelector('.segment-face')).w, weight: s.querySelector('.segment-face') && getComputedStyle(s.querySelector('.segment-face')).fontWeight })) }));
  const logo = q('#brand-header') && q('#brand-header').firstElementChild;
  const panels = [...document.querySelectorAll('.band--footer .system-check, .band--footer .statement')].map(box);
  const heads = ['#system-check-summary', '#statement-heading'].map((s) => { const el = q(s); const b = box(el); if (!b) return { sel: s, shown: false }; const lh = parseFloat(getComputedStyle(el).lineHeight); return { sel: s, h: b.h, lines: lh ? Math.round(b.h / lh) : null, font: font(el) }; });
  const tip = q('#onset-help'); const ps = tip && M.vis(tip) ? [...tip.querySelectorAll('p')].filter((p) => M.vis(p)) : [];
  const fb = q('#feedback-message');
  return {
    viewport: innerWidth,
    segments,
    inset: { logoLeft: box(logo) && box(logo).x, columnLeft: box(q('#main .panel')) && box(q('#main .panel')).x },
    footer: { panels, gap: panels.length === 2 && panels[0] && panels[1] ? Math.round((panels[1].y - (panels[0].y + panels[0].h)) * 10) / 10 : null, headings: heads },
    toggletip: ps.length ? { paragraphs: ps.length, gaps: ps.slice(1).map((p, i) => Math.round((box(p).y - (box(ps[i]).y + box(ps[i]).h)) * 10) / 10), marginTop: ps.slice(1).map((p) => getComputedStyle(p).marginTop) } : null,
    handoff: { mailto: M.mailto || [], formLink: q('#feedback-form-link') ? { href: !!q('#feedback-form-link').getAttribute('href'), target: q('#feedback-form-link').target, rel: q('#feedback-form-link').rel, idsUnique: document.querySelectorAll('#feedback-form-link').length === 1 && document.querySelectorAll('#feedback-form').length === 1 } : null },
    kept: { chosen: M.chosen(), kind: M.checked('video-kind'), videoLanguage: M.checked('video-language'), fields: M.SUB.map((id) => (q('#' + id) ? q('#' + id).value.length : null)), draft: fb ? fb.value.length : null, dialogOpen: !!q('dialog[open]') },
  };
})()`

// ---------------------------------------------------------------------------
// Scenarios: setup, the state predicate the record must reach, and the
// controls whose rendered focus is measured in it. `hold` is what must still
// be true after the instruments (default: the state), so a record whose state
// went while it was measured fails rather than passing for another state.
// `langs` and `views` narrow where a scenario exists, each with its reason.
export const LANG_VALUE = { 'en-GB': 'en-GB', 'zh-Hans': 'zh-Hans', 'ms-MY': 'ms-MY' }
export async function fresh(w, lang) {
  await w.goto()
  if (lang !== 'en-GB') await w.chooseLanguage(LANG_VALUE[lang])
}
const otherVideoLanguage = (lang) => (lang === 'ms-MY' ? 'en-GB' : 'ms-MY')
const OTHER_VIDEO_LANGUAGE = `(document.documentElement.lang === 'ms-MY' ? 'en-GB' : 'ms-MY')`
const mx = (w, expr) => w.evaluate(`(() => { const M = window.__mx; return ${expr}; })()`)
const until = (w, expr, label, timeout = 120000) => w.waitFor(`(() => { const M = window.__mx; try { return !!(${expr}); } catch (e) { return false; } })()`, { label, timeout })

export async function ready(w, lang, file = 'lecture-60s.mp4', { timeout = 300000 } = {}) {
  await fresh(w, lang)
  await w.setFiles(file.startsWith('/') ? file : F(file))
  await w.waitSettled({ timeout })
  await until(w, 'M.verdict() || M.kindIn("#source-block") || M.kindIn("#source-report") === "error"', 'a verdict', timeout)
}
/**
 * A phone by the page's own first signal (src/media/capability.ts:72):
 * navigator.userAgentData.mobile. The w375 view's metrics and touch alone
 * leave it false in Chrome, so the page stays a computer (VH-172's smoke);
 * the UA and its metadata are set as walk.mjs's phone view sets them.
 */
async function asPhone(w) {
  await w.page.send('Emulation.setUserAgentOverride', {
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    userAgentMetadata: { brands: [{ brand: 'Chromium', version: '155' }, { brand: 'Google Chrome', version: '155' }], fullVersionList: [{ brand: 'Chromium', version: '155.0.8059.85' }, { brand: 'Google Chrome', version: '155.0.8059.85' }], platform: 'Android', platformVersion: '14', architecture: '', model: 'Pixel 8', mobile: true },
  })
}
/** Create, by click; on a phone the discouraging verdict's Continue anyway first (src/main.ts:2204). */
async function create(w) {
  if (await mx(w, 'M.ack()')) { await w.click(w.acknowledgeButton()); await sleep(200) }
  await w.click(w.createButton())
}
/** Encoding under way (progress past 3%), bounded at 5 minutes: walk.mjs's 2-minute bound timed out on a loaded machine (VH-172's smoke). */
const encoding = (w) => w.waitFor(`(() => { const p = document.getElementById('process-progress'); return p && !p.hidden && p.value > 0.03; })()`, { label: 'encoding', timeout: 300000, interval: 500 })
async function running(w, lang, file = 'still-3600s.mp4') {
  await ready(w, lang, file)
  await create(w)
  await w.waitRunning()
  await encoding(w)
}
async function finished(w, lang, file = 'lecture-30s.mp4', before) {
  await ready(w, lang, file)
  if (before) await before()
  await create(w)
  await w.waitRunning()
  await w.waitFinished()
}
async function question(w) {
  await w.click(w.createButton())
  await until(w, 'M.res() === "question"', 'discard question', 10000)
  await sleep(300)
}
async function saveWith(w) {
  await w.click(w.saveButton())
}
async function feedbackOpen(w, lang) {
  await fresh(w, lang)
  await w.click('#feedback-open')
  await sleep(300)
}
const CANCEL = '#process-actions > button:nth-child(3)'
const STOP_CHECK_SEL = '#stop-actions > button:nth-child(1)'
const STOP_SAVE_SEL = '#save-actions > button'
const CREATE = '#process-actions > button:nth-child(2)'
const SAVE = '#process-result > .notification[data-kind="success"] .actions > button.button'
const RESULT = '#process-result > .notification'
const RADIO_KIND = '#video-kind input:checked'
const RADIO_VLANG = '#video-language input:checked'
const RADIO_LANG = '#language-switcher input:checked'
const FILE = { sel: '#file-input', ref: 'file-button' }
const SUBMIT = '#feedback-form button[type="submit"]'
const LONG_W = 'W'.repeat(100) + '.mp4'
const LONG_UNDERSCORES = 'Lecture_Week_3_Introduction_to_Biochemistry_v2.mp4'
const submissionFill = async (w, { ids = '12345678 23456789' } = {}) => {
  await w.type('#submission-card-assignment', 'Assignment 2: audit')
  await w.type('#submission-card-module', 'AUD1001 Auditing the page')
  await w.type('#submission-card-convenor', 'Dr A. Convenor')
  await w.type('#submission-card-ids', ids)
  await w.press('Tab')
  await sleep(300)
}
const staffFill = async (w) => {
  await w.type('#title-card-title', 'Introduction to the module')
  await w.type('#title-card-department', 'School of Audits')
  await w.type('#title-card-authors', 'A. Author')
  await w.press('Tab')
  await sleep(300)
}

export const SCENARIOS = {
  'S-01': {
    name: 'Startup pending',
    // F1 holds the worker's script; the ping's deadline is 5 s (src/main.ts:1155), so the
    // record and its instruments run inside it, and `hold` fails the record if it turned blocked.
    state: `M.el('#file-input').disabled && M.has('choose.starting', '#source-status') && M.el('#check-worker')?.dataset.state === 'pending' && M.el('#errors-panel').hidden`,
    setup: async (w, lang) => { await fresh(w, lang); await w.page.send('Network.setCacheDisabled', { cacheDisabled: true }); await applyFault(w, 'F1'); await gotoNoWait(w) },
    focus: [RADIO_LANG],
    faults: ['F1'], fixtures: [],
  },
  'S-01b': {
    name: 'Startup blocked: the worker did not start',
    // F1 held past the ping's 5 s deadline: the blocked workerNotStarted variant, Errors captured shown (src/main.ts:1324-1335).
    state: `M.el('#file-input').disabled && M.el('#check-worker')?.dataset.state === 'fail' && M.vis('#errors-panel') && M.text('#source-status').trim().length > 0`,
    setup: async (w, lang) => { await fresh(w, lang); await w.page.send('Network.setCacheDisabled', { cacheDisabled: true }); await applyFault(w, 'F1'); await gotoNoWait(w); await until(w, `M.el('#check-worker')?.dataset.state === 'fail'`, 'worker not started', 20000); await sleep(500) },
    focus: ['#feedback-report', '#system-check summary'],
    faults: ['F1'], fixtures: [],
  },
  'S-02': {
    name: 'Startup blocked',
    state: `M.el('#file-input').disabled && M.el('#check-webcodecs')?.dataset.state === 'fail' && M.el('#system-check').open && M.text('#source-status').trim().length > 0`,
    setup: async (w, lang) => { await fresh(w, lang); await applyFault(w, 'F2'); await w.goto() },
    focus: ['#system-check summary', RADIO_LANG, '#feedback-open'],
    faults: ['F2'], fixtures: [],
  },
  'S-03': {
    name: 'Empty',
    state: `!M.chosen() && !document.querySelector('dialog[open]') && !M.el('#file-input').disabled && M.el('#step-trim').hidden`,
    setup: async (w, lang) => fresh(w, lang),
    focus: [FILE, '#video-kind input:checked', '#feedback-open', '#language-switcher input:checked'],
    fixtures: [],
  },
  'S-04': {
    name: 'Page language switched',
    // Reached from another language with a video read, so the kept values show; the switch's own line is said in the language chosen.
    state: `M.has('language.switched', '#language-status') && M.chosen() && !!M.verdict()`,
    setup: async (w, lang) => { await fresh(w, lang === 'en-GB' ? 'zh-Hans' : 'en-GB'); await w.setFiles(F('lecture-60s.mp4')); await w.waitSettled(); await w.chooseLanguage(lang) },
    focus: [RADIO_LANG],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-05': {
    name: 'Machine-translation notice',
    langs: ['zh-Hans', 'ms-MY'], langsWhy: 'the notice is never shown on the English page (src/ui/language-switcher.ts:140)',
    state: `M.vis('#language-notice') && M.has('language.machine.title', '#language-notice')`,
    setup: async (w, lang) => fresh(w, lang),
    focus: ['#language-notice a'],
    fixtures: [],
  },
  'S-06a': {
    name: 'Remembered language and side, after a reload',
    state: `window.__audit.boot.langAtDCL === document.documentElement.lang && M.checked('video-kind') === 'submission' && !M.el('#accessibility-statement').open && !M.chosen()`,
    setup: async (w, lang) => { await fresh(w, lang); await w.chooseKind('submission'); await w.goto() },
    focus: [RADIO_KIND, RADIO_LANG],
    fixtures: [],
  },
  'S-06b': {
    name: 'The statement opened by its address',
    state: `window.__audit.boot.langAtDCL === document.documentElement.lang && M.el('#accessibility-statement').open && location.hash === '#accessibility-statement'`,
    setup: async (w, lang) => { await fresh(w, lang); await w.page.send('Page.navigate', { url: 'about:blank' }); await sleep(300); await w.goto('#accessibility-statement'); await sleep(300) },
    focus: ['#accessibility-statement summary'],
    fixtures: [],
  },
  'S-07': {
    name: 'Video type: Student submission',
    state: `M.checked('video-kind') === 'submission' && !M.chosen() && M.has('videoKind.result.submission', '#video-kind-result')`,
    setup: async (w, lang) => { await fresh(w, lang); await w.chooseKind('submission') },
    focus: [RADIO_KIND, RADIO_VLANG],
    fixtures: [],
  },
  'S-08': {
    name: 'Video language other than the page',
    state: `M.checked('video-language') === ${OTHER_VIDEO_LANGUAGE} && M.chosen() && !!M.verdict() && M.el('#video-language-helper').textContent.trim().length > 0`,
    setup: async (w, lang) => { await ready(w, lang); await w.click(`#video-language input[value="${otherVideoLanguage(lang)}"]`); await sleep(300) },
    focus: [RADIO_VLANG, '#closing-type'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-09': {
    name: 'Drag held',
    state: `M.el('#drop-zone').classList.contains('is-drag-over') && M.has('choose.dropHeld', '#drop-hint') && !M.chosen()`,
    setup: async (w, lang) => { await fresh(w, lang); await w.drag(F('lecture-60s.mp4'), '#drop-zone', { drop: false }) },
    focus: [FILE],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-10': {
    name: 'Drop refused: not a video',
    // A .srt dropped: notvideo.mp4 has a video file's name, so the drop takes it and the read refuses it (S-29).
    state: `M.has('choose.drop.notVideo', '#drop-error') && !M.chosen()`,
    setup: async (w, lang) => { await fresh(w, lang); await w.drag(F('caps.srt'), '#drop-zone', { mime: 'text/plain' }); await sleep(600) },
    focus: [FILE],
    fixtures: ['caps.srt'],
  },
  'S-11': {
    name: 'Drop refused while busy',
    state: `M.running() && M.has('choose.drop.making', '#drop-error')`,
    setup: async (w, lang) => { await running(w, lang); await w.drag(F('lecture-60s.mp4'), '#drop-zone'); await sleep(600) },
    focus: [CANCEL],
    fixtures: ['still-3600s.mp4', 'lecture-60s.mp4'],
  },
  'S-14': {
    name: 'Checking',
    state: `M.checking() && M.has('status.checking', '#status') && !M.verdict() && !M.el('#step-trim').hidden`,
    setup: async (w, lang) => { await fresh(w, lang); await w.setFiles(F('still-10800s.mp4')); await until(w, 'M.checking()', 'checking', 300000) },
    focus: [STOP_CHECK_SEL, '#trim-start'],
    fixtures: ['still-10800s.mp4'],
  },
  'S-15': {
    name: 'Ready',
    state: `M.proceed() && M.create() && M.res() === 'none' && !M.kindIn('#audio-warnings') && !M.checking()`,
    setup: async (w, lang) => { await ready(w, lang); if (await mx(w, 'M.ack()')) { await w.click(w.acknowledgeButton()); await sleep(300) } },
    focus: [CREATE, '#trim-start', { sel: '#trim-start-range', ref: 'thumb' }, { sel: '#trim-end-range', ref: 'thumb' }, '#preset-choice input:checked', '#closing-type'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-16': {
    name: 'Video properties open; losses',
    state: `!!M.el('#source-report details[open]') && M.kindIn('#source-report') === 'warning'`,
    setup: async (w, lang) => { await ready(w, lang, 'captioned-12s.mp4'); await w.click('#source-report summary'); await sleep(300) },
    focus: ['#source-report summary'],
    fixtures: ['captioned-12s.mp4'],
  },
  // VH-180 (V-47): Video properties open on a source the frame-rate note is
  // raised for; 45 fps conforms up to 50, 120 fps down to 60. Kept out of the
  // pass's own plans (`fixOnly`), walked by PLANS.vh180.
  'S-16-45': {
    name: 'Video properties open; the frame-rate note, a 45 fps source',
    state: `!!M.el('#source-report details[open]') && M.has('source.outputRate', '#source-report')`,
    setup: async (w, lang) => { await ready(w, lang, 'hfr-45fps-10s.mp4'); await w.click('#source-report summary'); await sleep(300) },
    focus: ['#source-report summary'],
    fixtures: ['hfr-45fps-10s.mp4'], fixOnly: true,
  },
  'S-16-120': {
    name: 'Video properties open; the frame-rate note, a 120 fps source',
    state: `!!M.el('#source-report details[open]') && M.has('source.outputRate', '#source-report')`,
    setup: async (w, lang) => { await ready(w, lang, 'hfr-120fps-10s.mp4'); await w.click('#source-report summary'); await sleep(300) },
    focus: ['#source-report summary'],
    fixtures: ['hfr-120fps-10s.mp4'], fixOnly: true,
  },
  'S-17': {
    name: 'Onset help open',
    state: `M.vis('#onset-help') && M.el('#onset-help-button').getAttribute('aria-expanded') === 'true'`,
    setup: async (w, lang) => { await ready(w, lang); await w.click('#onset-help-button'); await sleep(200) },
    focus: ['#onset-help-button'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-18': {
    name: 'Sound notes: quiet',
    state: `!!M.verdict() && M.kindIn('#audio-warnings') === 'warning' && M.has('warnings.veryQuiet.heading', '#audio-warnings')`,
    setup: async (w, lang) => ready(w, lang, 'quiet-30s.mp4'),
    focus: [CREATE],
    fixtures: ['quiet-30s.mp4'],
  },
  'S-19': {
    name: 'Sound notes: loud (clipped)',
    // clipped-30s.mp4 (VH-172): a 440 Hz sine driven to 1.6 and hard-clipped at full scale; loud-30s does not clip.
    state: `!!M.verdict() && M.kindIn('#audio-warnings') === 'warning' && M.has('warnings.clipping.heading', '#audio-warnings')`,
    setup: async (w, lang) => ready(w, lang, 'clipped-30s.mp4'),
    focus: [CREATE],
    fixtures: ['clipped-30s.mp4'],
  },
  'S-20': {
    name: 'No audio',
    state: `!!M.verdict() && !!M.el('#source-status strong') && M.has('source.noSound', '#source-status') && M.has('warnings.noAudio.heading', '#audio-warnings')`,
    setup: async (w, lang) => ready(w, lang, 'silent-10s.mp4'),
    focus: [CREATE],
    fixtures: ['silent-10s.mp4'],
  },
  'S-21': {
    name: 'Too short to trim',
    state: `!!M.verdict() && M.el('#trim-start-range').disabled && M.el('#trim-start').disabled && M.idle() && M.has('trim.tooShort', '#step-trim')`,
    setup: async (w, lang) => ready(w, lang, 'short-2s.mp4'),
    focus: [CREATE, '#trim-clear'],
    fixtures: ['short-2s.mp4'],
  },
  'S-22': {
    name: 'File ends early (MP4)',
    state: `!!M.verdict() && M.has('warnings.endsEarly.heading', '#audio-warnings')`,
    setup: async (w, lang) => ready(w, lang, 'truncated-30s.mp4'),
    focus: [CREATE],
    fixtures: ['truncated-30s.mp4'],
  },
  'S-23': {
    name: 'Cut-short MKV',
    // Said first among the warnings (VH-158).
    state: `!!M.verdict() && M.is('warnings.cutShort.heading', '#audio-warnings .notification-item-title')`,
    setup: async (w, lang) => ready(w, lang, 'cut-short-30s.mkv'),
    focus: [CREATE],
    fixtures: ['cut-short-30s.mkv'],
  },
  'S-24': {
    name: 'Long job, 20–60 min',
    state: `M.verdict() === 'warning' && M.has('preflight.reasons.longJob', '#preflight-report') && !M.has('preflight.reasons.veryLongJob', '#preflight-report')`,
    setup: async (w, lang) => ready(w, lang, 'still-10800s.mp4'),
    focus: [CREATE, '#preset-choice input:checked'],
    fixtures: ['still-10800s.mp4'],
  },
  // S-25: the 10,800 s still (S-24's warn band, about 45 minutes here) with
  // the job worker's clock at twice real time (F13), so the estimate passes
  // 60 minutes (VH-172, probed: about 1 hour 25 minutes, settled in 79 s).
  // CDP CPU throttling cannot reach the worker (faults.mjs F13).
  'S-25a': {
    name: 'Very long job: discouraged, Continue anyway in Create\'s place',
    state: `M.verdict() === 'warning' && M.has('preflight.reasons.veryLongJob', '#preflight-report') && M.ack() && !M.create()`,
    setup: async (w, lang) => { await applyFault(w, 'F13'); await ready(w, lang, 'still-10800s.mp4') },
    focus: ['#process-actions > button:nth-child(1)'],
    faults: ['F13'], fixtures: ['still-10800s.mp4'],
  },
  'S-25b': {
    name: 'Very long job: acknowledged, Create shown',
    state: `M.verdict() === 'warning' && M.has('preflight.reasons.veryLongJob', '#preflight-report') && M.create() && !M.ack()`,
    setup: async (w, lang) => { await applyFault(w, 'F13'); await ready(w, lang, 'still-10800s.mp4'); await until(w, 'M.ack()', 'Continue anyway', 5000); await w.click(w.acknowledgeButton()); await sleep(300) },
    focus: [CREATE],
    faults: ['F13'], fixtures: ['still-10800s.mp4'],
  },
  'S-26a': {
    name: 'Phone discouraged',
    views: ['w375'], viewsWhy: 'the mobile-device verdict needs the phone view (userAgentData.mobile, set by asPhone, src/media/capability.ts:72); at 1280 and 320 px the page is a computer',
    state: `M.phone() && M.verdict() === 'warning' && M.heading('preflight.headings.mobile') && M.ack() && !M.create()`,
    setup: async (w, lang) => { await asPhone(w); await ready(w, lang) },
    focus: ['#process-actions > button:nth-child(1)'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-26b': {
    name: 'Phone discouraged: acknowledged, Create shown',
    views: ['w375'], viewsWhy: 'the mobile-device verdict needs the phone view (userAgentData.mobile, set by asPhone, src/media/capability.ts:72); at 1280 and 320 px the page is a computer',
    state: `M.phone() && M.heading('preflight.headings.mobile') && M.create() && !M.ack() && M.res() === 'none'`,
    setup: async (w, lang) => { await asPhone(w); await ready(w, lang); await until(w, 'M.ack()', 'Continue anyway', 5000); await w.click(w.acknowledgeButton()); await sleep(300) },
    focus: [CREATE],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-27': {
    name: 'Decode damage',
    state: `!!M.verdict() && M.has('warnings.decodeDamage.heading', '#audio-warnings')`,
    setup: async (w, lang) => ready(w, lang, 'burst-float-30s.mov'),
    focus: [CREATE],
    fixtures: ['burst-float-30s.mov'],
  },
  'S-28': {
    name: 'Blocked file',
    state: `M.kindIn('#source-block') === 'error' && M.el('#step-trim').hidden && M.el('#step-create').hidden`,
    setup: async (w, lang) => ready(w, lang, 'prores-1080p.mov'),
    focus: [FILE],
    fixtures: ['prores-1080p.mov'],
  },
  'S-29': {
    name: 'Unreadable, no result',
    state: `M.kindIn('#source-report') === 'error' && M.el('#step-trim').hidden && M.res() === 'none' && !M.kindIn('#source-block')`,
    setup: async (w, lang) => { await ready(w, lang, 'prores-1080p.mov'); await w.setFiles(F('notvideo.mp4')); await w.waitSettled(); await until(w, 'M.kindIn("#source-report") === "error"', 'unreadable') },
    focus: [FILE],
    fixtures: ['prores-1080p.mov', 'notvideo.mp4'],
  },
  'S-30': {
    name: 'Unreadable beside a kept result',
    state: `M.kindIn('#source-report') === 'error' && M.el('#step-trim').hidden && !M.el('#step-create').hidden && M.res() === 'result' && !M.saveBtn().disabled`,
    setup: async (w, lang) => { await finished(w, lang); await w.setFiles(F('notvideo.mp4')); await w.waitSettled(); await until(w, 'M.kindIn("#source-report") === "error"', 'unreadable') },
    focus: [FILE, SAVE],
    fixtures: ['lecture-30s.mp4', 'notvideo.mp4'],
  },
  'S-31': {
    name: 'Storage block',
    state: `M.kindIn('#source-block') === 'error' && !M.el('#step-trim').hidden && M.checkAgain() && M.has('status.storageWayOut', '#status')`,
    // Not ready(): its settle waits for no stop-row button, and the block offers Check again there (VH-172's smoke).
    setup: async (w, lang) => { await applyFault(w, 'F3', { bytes: 5 * 1024 * 1024 }); await fresh(w, lang); await w.setFiles(F('lecture-360s.mp4')); await until(w, "M.kindIn('#source-block') === 'error' && M.checkAgain()", 'storage block', 120000); await sleep(300) },
    focus: ['#stop-actions > button:nth-child(2)', '#trim-start', '#preset-choice input:checked'],
    faults: ['F3'], fixtures: ['lecture-360s.mp4'],
  },
  'S-32': {
    name: 'Preview unavailable',
    state: `M.vis('#trim-preview-note') && M.el('#trim-set-start').disabled && M.el('#trim-set-end').disabled && !M.el('#trim-start').disabled`,
    setup: async (w, lang) => { await ready(w, lang); await applyFault(w, 'F7'); await sleep(300) },
    focus: ['#trim-start', '#trim-end'],
    faults: ['F7'], fixtures: ['lecture-60s.mp4'],
  },
  'S-33': {
    name: 'Trim invalid',
    state: `M.vis('#trim-start-error') && M.el('#trim-start').getAttribute('aria-invalid') === 'true' && !M.verdict() && !M.create() && M.has('trim.correctToContinue', '#status')`,
    setup: async (w, lang) => { await ready(w, lang); await w.type('#trim-start', 'abc'); await w.press('Tab'); await sleep(400) },
    focus: ['#trim-start', '#trim-set-start'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-35': {
    name: 'Check stopped (Check again offered)',
    // Check again pressed re-runs the check, a transient state: see GAPS.
    state: `M.checkAgain() && !M.checking() && M.has('status.checkStopped', '#status') && !M.verdict()`,
    setup: async (w, lang) => { await fresh(w, lang); await w.setFiles(F('lecture-360s.mp4')); await until(w, 'M.checking()', 'checking', 60000); await w.click('#stop-actions > button:nth-child(1)'); await sleep(400) },
    focus: ['#stop-actions > button:nth-child(2)'],
    fixtures: ['lecture-360s.mp4'],
  },
  'S-36': {
    name: 'Staff card off, typed values kept',
    state: `M.checked('video-kind') === 'staff' && !M.el('#title-card-on').checked && M.el('#title-card-fields').hidden && M.el('#title-card-rule').hidden && M.el('#title-card-title').value.length > 0`,
    setup: async (w, lang) => { await ready(w, lang); await w.click('#title-card-on'); await sleep(200); await w.type('#title-card-title', 'Introduction to the module'); await w.click('#title-card-on'); await sleep(300) },
    focus: ['#title-card-on'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-37a': {
    name: 'Staff card on; refused with the date only',
    state: `M.el('#title-card-on').checked && M.vis('#title-card-empty-error') && M.el('#title-card-title').getAttribute('aria-invalid') === 'true' && M.el('#title-card-date').value.length > 0 && M.has('titleCard.correctToContinue', '#status')`,
    setup: async (w, lang) => { await ready(w, lang); await w.click('#title-card-on'); await sleep(300); await create(w); await sleep(600) },
    focus: ['#title-card-title', '#title-card-on'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-37b': {
    name: 'Staff card on; refused empty (date cleared)',
    state: `M.el('#title-card-on').checked && M.vis('#title-card-empty-error') && M.el('#title-card-title').getAttribute('aria-invalid') === 'true' && M.el('#title-card-date').value === '' && M.has('titleCard.correctToContinue', '#status')`,
    setup: async (w, lang) => { await ready(w, lang); await w.click('#title-card-on'); await sleep(300); await w.evaluate(`(() => { const el = document.getElementById('title-card-date'); el.focus(); el.select(); })()`); await w.press('Backspace'); await w.press('Tab'); await sleep(300); await create(w); await sleep(600) },
    focus: ['#title-card-title', '#title-card-date'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-38': {
    name: 'Staff field full',
    state: `M.el('#title-card-on').checked && M.vis('#title-card-title-error') && M.is('titleCard.full', '#title-card-title-error')`,
    setup: async (w, lang) => { await ready(w, lang); await w.click('#title-card-on'); await sleep(300); await w.type('#title-card-title', 'A title typed long enough to run past the limit the card can hold at its smallest size, and then some more words to be sure it is cut off here'); await sleep(300) },
    focus: ['#title-card-title'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-39': {
    name: 'Staff card filled',
    state: `M.el('#title-card-on').checked && ['title-card-title', 'title-card-department', 'title-card-authors'].every((id) => M.el('#' + id).value.length > 0 && !M.el('#' + id).getAttribute('aria-invalid')) && !M.vis('#title-card-empty-error') && M.create()`,
    setup: async (w, lang) => { await ready(w, lang); await w.click('#title-card-on'); await sleep(300); await staffFill(w) },
    focus: ['#title-card-title', '#title-card-department', '#title-card-authors', '#title-card-date'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-40': {
    name: 'Submission, empty',
    state: `M.checked('video-kind') === 'submission' && M.vis('#submission-card-fields') && M.el('#title-card-on').checked && M.el('#title-card-on').disabled && M.fields(M.SUB).every((f) => f.value === '' && !f.getAttribute('aria-invalid'))`,
    setup: async (w, lang) => { await ready(w, lang); await w.chooseKind('submission') },
    focus: M_SUB_FOCUS(),
    fixtures: ['lecture-60s.mp4'],
  },
  'S-41': {
    name: 'Submission refused',
    state: `M.checked('video-kind') === 'submission' && M.fields(M.SUB).every((f) => f.getAttribute('aria-invalid') === 'true') && M.has('titleCard.correctToContinue', '#status')`,
    setup: async (w, lang) => { await ready(w, lang); await w.chooseKind('submission'); await create(w); await sleep(600) },
    focus: M_SUB_FOCUS(),
    fixtures: ['lecture-60s.mp4'],
  },
  'S-42': {
    name: 'Submission filled',
    state: `M.checked('video-kind') === 'submission' && M.fields(M.SUB).every((f) => f.value.length > 0 && !f.getAttribute('aria-invalid')) && M.create() && M.idle()`,
    setup: async (w, lang) => { await ready(w, lang); await w.chooseKind('submission'); await submissionFill(w) },
    focus: [...M_SUB_FOCUS(), CREATE],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-ID1': {
    name: 'Submission ID refused: not an ID',
    // VH-165's id-error (design-walk.mjs): a 100-digit "number" in the ID box, Create pressed.
    state: `M.checked('video-kind') === 'submission' && M.el('#submission-card-ids').getAttribute('aria-invalid') === 'true' && M.vis('#submission-card-ids-error') && M.has('titleCard.submission.idNotAnId', '#submission-card-ids-error')`,
    setup: async (w, lang) => { await ready(w, lang); await w.chooseKind('submission'); await submissionFill(w, { ids: '9'.repeat(100) }); await create(w); await sleep(600) },
    focus: ['#submission-card-ids'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-ID2': {
    name: 'Submission ID refused: a number twice',
    state: `M.checked('video-kind') === 'submission' && M.el('#submission-card-ids').getAttribute('aria-invalid') === 'true' && M.has('titleCard.submission.idTwice', '#submission-card-ids-error')`,
    setup: async (w, lang) => { await ready(w, lang); await w.chooseKind('submission'); await submissionFill(w, { ids: '12345678 12345678' }); await create(w); await sleep(600) },
    focus: ['#submission-card-ids'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-ID3': {
    name: 'Submission ID refused: too many numbers',
    state: `M.checked('video-kind') === 'submission' && M.el('#submission-card-ids').getAttribute('aria-invalid') === 'true' && M.has('titleCard.submission.idsTooMany', '#submission-card-ids-error')`,
    setup: async (w, lang) => { await ready(w, lang); await w.chooseKind('submission'); await submissionFill(w, { ids: Array.from({ length: 9 }, (_, i) => String(12345670 + i)).join(' ') }); await create(w); await sleep(600) },
    focus: ['#submission-card-ids'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-43': {
    name: 'Submission locked while running',
    state: `M.running() && M.checked('video-kind') === 'submission' && M.el('#title-card-choice').disabled && M.fields(M.SUB).every((f) => f.value.length > 0)`,
    setup: async (w, lang) => { await ready(w, lang, 'still-3600s.mp4'); await w.chooseKind('submission'); await submissionFill(w); await create(w); await w.waitRunning(); await encoding(w) },
    focus: [CANCEL],
    fixtures: ['still-3600s.mp4'],
  },
  'S-44': {
    name: 'Internal use only, staff',
    state: `M.checked('video-kind') === 'staff' && M.el('#closing-internal').checked && !M.el('#closing-internal').disabled && M.has('closing.result.internal', '#closing-result')`,
    setup: async (w, lang) => { await ready(w, lang); await w.click('#closing-internal'); await sleep(300) },
    focus: ['#closing-internal'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-45a': {
    name: 'Internal use only, submission: always on',
    // The same page as S-40, read at step 4: the box ticked and locked, with its reason.
    state: `M.checked('video-kind') === 'submission' && M.el('#closing-type').value !== 'none' && M.el('#closing-internal').checked && M.el('#closing-internal').disabled && M.vis('#closing-internal-reason') && M.has('closing.internalForSubmission', '#closing-internal-reason')`,
    setup: async (w, lang) => { await ready(w, lang); await w.chooseKind('submission') },
    focus: ['#closing-type', '#closing-colour input:checked'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-45b': {
    name: 'Internal use only, submission under None',
    state: `M.checked('video-kind') === 'submission' && M.el('#closing-type').value === 'none' && M.el('#closing-internal').disabled && M.has('closing.notUsedWith.none', '#step-closing')`,
    setup: async (w, lang) => { await ready(w, lang); await w.chooseKind('submission'); await w.select('#closing-type', 'none'); await sleep(300) },
    focus: ['#closing-type'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-46': {
    name: 'Closing None',
    state: `M.el('#closing-type').value === 'none' && M.el('#closing-onset').disabled && M.el('#closing-internal').disabled && M.vis('#closing-none-reason') && M.has('closing.result.none', '#closing-result')`,
    setup: async (w, lang) => { await ready(w, lang); await w.select('#closing-type', 'none'); await sleep(300) },
    focus: ['#closing-type'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-47a': {
    name: 'Cut, white',
    state: `M.el('#closing-type').value === 'cut' && M.el('#closing-onset').disabled && M.checked('closing-colour') === 'white' && M.has('closing.result.cut.white', '#closing-result')`,
    setup: async (w, lang) => { await ready(w, lang); await w.click('#closing-colour input[value="white"]'); await sleep(300) },
    focus: ['#closing-type', '#closing-colour input:checked'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-47b': {
    name: 'Fade over the picture, blue',
    state: `M.el('#closing-type').value === 'fade' && M.el('#closing-onset').value === 'existing' && M.checked('closing-colour') === 'blue' && M.has('closing.result.overPicture.blue.fade', '#closing-result')`,
    setup: async (w, lang) => { await ready(w, lang); await w.select('#closing-type', 'fade'); await sleep(300) },
    focus: ['#closing-type', '#closing-onset', '#onset-help-button'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-47c': {
    name: 'Slide over a freeze frame, white',
    state: `M.el('#closing-type').value === 'slide' && M.el('#closing-onset').value === 'freeze' && M.checked('closing-colour') === 'white' && M.has('closing.result.overFreeze.white.slide', '#closing-result')`,
    setup: async (w, lang) => { await ready(w, lang); await w.select('#closing-type', 'slide'); await w.select('#closing-onset', 'freeze'); await w.click('#closing-colour input[value="white"]'); await sleep(300) },
    focus: ['#closing-type', '#closing-onset', '#closing-colour input:checked'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-48': {
    name: 'Running',
    state: `M.running() && M.vis('#process-job') && M.vis('#job-notice') && M.vis('#announce-field') && M.res() === 'none'`,
    setup: async (w, lang) => running(w, lang),
    focus: [CANCEL, '#announce-progress'],
    fixtures: ['still-3600s.mp4'],
  },
  'S-49': {
    name: 'Time left',
    state: `M.running() && M.vis('#process-time-left') && M.text('#process-time-left').trim().length > 0`,
    setup: async (w, lang) => { await running(w, lang); await until(w, 'M.vis("#process-time-left") && M.text("#process-time-left").trim().length > 0', 'time left', 90000) },
    focus: [CANCEL],
    fixtures: ['still-3600s.mp4'],
  },
  'S-50': {
    name: 'Type and video language switched while running',
    state: `M.running() && M.checked('video-kind') === 'submission' && M.checked('video-language') === ${OTHER_VIDEO_LANGUAGE} && M.vis('#video-next') && M.has('videoLanguage.nextVideo', '#video-next') && M.has('videoKind.options.staff', '#process-job')`,
    setup: async (w, lang) => { await running(w, lang); await w.chooseKind('submission'); await w.click(`#video-language input[value="${otherVideoLanguage(lang)}"]`); await sleep(300) },
    focus: [RADIO_KIND, RADIO_VLANG],
    fixtures: ['still-3600s.mp4'],
  },
  'S-52': {
    name: 'Cancelled',
    state: `M.idle() && M.has('status.cancelled', '#status') && M.create() && M.res() === 'none'`,
    setup: async (w, lang) => { await running(w, lang, 'lecture-360s.mp4'); await w.click(CANCEL); await until(w, 'M.idle() && M.create()', 'cancelled', 30000); await sleep(400) },
    focus: [CREATE],
    fixtures: ['lecture-360s.mp4'],
  },
  'S-53': {
    name: 'Finished',
    state: `M.finished() && !M.saveBtn().disabled && M.lifetime('result.lifetime') && M.text('#save-status').trim() === '' && M.has('status.ready', '#status')`,
    setup: async (w, lang) => finished(w, lang),
    focus: [SAVE, CREATE],
    fixtures: ['lecture-30s.mp4'],
  },
  'S-53-W': {
    name: 'Finished, a 100-character file name',
    // VH-165's long names (design-walk.mjs), a six-fix contract case: here, S-58-W and S-63-W, with the underscored name beside them.
    state: `M.finished() && M.text('#process-result').includes('W'.repeat(100))`,
    setup: async (w, lang) => finished(w, lang, LONG_W),
    focus: [SAVE],
    fixtures: [LONG_W],
  },
  'S-53-LW': {
    name: 'Finished, an underscored file name',
    state: `M.finished() && M.text('#process-result').includes(${JSON.stringify(LONG_UNDERSCORES)})`,
    setup: async (w, lang) => finished(w, lang, LONG_UNDERSCORES),
    focus: [SAVE],
    fixtures: [LONG_UNDERSCORES],
  },
  'S-54a': {
    name: 'Finished: cut, marked internal',
    state: `M.finished() && M.has('result.closingCut.blue', '#process-result') && M.has('result.closingInternal', '#process-result')`,
    setup: async (w, lang) => finished(w, lang, 'lecture-30s.mp4', async () => { await w.click('#closing-internal'); await sleep(300) }),
    focus: [SAVE],
    fixtures: ['lecture-30s.mp4'],
  },
  'S-54b': {
    name: 'Finished: fade over the picture',
    state: `M.finished() && M.has('result.closingOverPicture.blue.fade', '#process-result')`,
    setup: async (w, lang) => finished(w, lang, 'lecture-30s.mp4', async () => { await w.select('#closing-type', 'fade'); await sleep(300) }),
    focus: [SAVE],
    fixtures: ['lecture-30s.mp4'],
  },
  'S-54c': {
    name: 'Finished: slide over a held last frame, white',
    state: `M.finished() && M.has('result.closingOverFreeze.white.slide', '#process-result')`,
    setup: async (w, lang) => finished(w, lang, 'lecture-30s.mp4', async () => { await w.select('#closing-type', 'slide'); await w.select('#closing-onset', 'freeze'); await w.click('#closing-colour input[value="white"]'); await sleep(300) }),
    focus: [SAVE],
    fixtures: ['lecture-30s.mp4'],
  },
  'S-54d': {
    name: 'Finished: no closing',
    state: `M.finished() && M.has('result.closingNone', '#process-result')`,
    setup: async (w, lang) => finished(w, lang, 'lecture-30s.mp4', async () => { await w.select('#closing-type', 'none'); await sleep(300) }),
    focus: [SAVE],
    fixtures: ['lecture-30s.mp4'],
  },
  'S-55a': {
    name: 'Closing fell back to a freeze (N4, Fade)',
    state: `M.finished() && M.has('result.fellBackToFreeze.blue.fade', '#process-result')`,
    setup: async (w, lang) => finished(w, lang, 'short-0.8s.mp4', async () => { await w.select('#closing-type', 'fade'); await w.waitSettled() }),
    focus: [SAVE],
    fixtures: ['short-0.8s.mp4'],
  },
  'S-55b': {
    name: 'Closing fell back to a cut (F6a, Fade)',
    state: `M.finished() && M.has('result.fellBackToCut.blue.fade', '#process-result')`,
    setup: async (w, lang) => { await applyFault(w, 'F6a'); await finished(w, lang, 'lecture-30s.mp4', async () => { await w.select('#closing-type', 'fade'); await w.waitSettled() }) },
    focus: [SAVE],
    faults: ['F6a'], fixtures: ['lecture-30s.mp4'],
  },
  'S-55c': {
    name: 'Closing not loaded (F6b, Fade)',
    state: `M.finished() && M.has('result.notLoaded', '#process-result')`,
    setup: async (w, lang) => { await applyFault(w, 'F6b'); await finished(w, lang, 'lecture-30s.mp4', async () => { await w.select('#closing-type', 'fade'); await w.waitSettled() }) },
    focus: [SAVE],
    faults: ['F6b'], fixtures: ['lecture-30s.mp4'],
  },
  'S-56': {
    name: 'Failed: out of space part-way',
    state: `M.res() === 'failure' && M.has('failure.outOfSpace.what', '#process-result') && M.idle() && M.create() && !M.el('#file-input').disabled`,
    setup: async (w, lang) => { await applyFault(w, 'F12'); await ready(w, lang, 'lecture-30s.mp4'); await create(w); await w.waitFailed() },
    focus: [RESULT, CREATE],
    faults: ['F12'], fixtures: ['lecture-30s.mp4'],
  },
  'S-57': {
    name: 'Retry after a failure',
    state: `M.running() && M.res() === 'none' && M.vis('#process-job')`,
    setup: async (w, lang) => { await applyFault(w, 'F12'); await ready(w, lang, 'still-3600s.mp4'); await create(w); await w.waitFailed(); await create(w); await w.waitRunning(); await encoding(w) },
    focus: [CANCEL],
    faults: ['F12'], fixtures: ['still-3600s.mp4'],
  },
  'S-58': {
    name: 'Discard question',
    state: `M.res() === 'question' && M.vis('#process-result .button--danger') && M.vis('#process-result .button--secondary')`,
    setup: async (w, lang) => { await finished(w, lang); await question(w) },
    focus: ['#process-result .button--danger', '#process-result .button--secondary'],
    fixtures: ['lecture-30s.mp4'],
  },
  'S-58-W': {
    name: 'Discard question, a 100-character file name',
    state: `M.res() === 'question' && M.text('#process-result').includes('W'.repeat(100))`,
    setup: async (w, lang) => { await finished(w, lang, LONG_W); await question(w) },
    focus: ['#process-result .button--danger', '#process-result .button--secondary'],
    fixtures: [LONG_W],
  },
  'S-58-LW': {
    name: 'Discard question, an underscored file name',
    state: `M.res() === 'question' && M.text('#process-result').includes(${JSON.stringify(LONG_UNDERSCORES)})`,
    setup: async (w, lang) => { await finished(w, lang, LONG_UNDERSCORES); await question(w) },
    focus: ['#process-result .button--danger', '#process-result .button--secondary'],
    fixtures: [LONG_UNDERSCORES],
  },
  'S-59': {
    name: 'Keep it',
    // As S-53, but the status line no longer says "ready": the question's words were taken off it (src/main.ts:818).
    state: `M.finished() && !M.saveBtn().disabled && M.text('#status').trim() === ''`,
    setup: async (w, lang) => { await finished(w, lang); await question(w); await w.click('#process-result .button--secondary'); await sleep(400) },
    focus: [SAVE],
    fixtures: ['lecture-30s.mp4'],
  },
  'S-60': {
    name: 'Discard confirmed; new job',
    state: `M.running() && M.res() === 'none'`,
    setup: async (w, lang) => { await finished(w, lang, 'lecture-360s.mp4'); await question(w); await w.click('#process-result .button--danger'); await w.waitRunning(); await encoding(w) },
    focus: [CANCEL],
    fixtures: ['lecture-360s.mp4'],
  },
  'S-61': {
    name: 'Saving',
    state: `M.saving() && M.has('status.saving', '#save-status') && M.saveBtn().disabled`,
    setup: async (w, lang) => { await applyFault(w, 'F4b'); await finished(w, lang, 'lecture-360s.mp4'); await saveWith(w); await until(w, 'M.saving()', 'saving', 10000) },
    focus: ['#save-actions > button'],
    faults: ['F4b'], fixtures: ['lecture-360s.mp4'],
  },
  'S-62': {
    name: 'Saved',
    state: `M.res() === 'result' && M.saveBtn().disabled && !M.saving() && M.has('status.saved', '#save-status') && !M.lifetime('result.lifetime')`,
    setup: async (w, lang) => { await finished(w, lang); await saveWith(w); await w.waitSaved() },
    focus: [CREATE, SAVE],
    fixtures: ['lecture-30s.mp4'],
  },
  'S-63': {
    name: 'Previous video',
    state: `M.previous() && !!M.verdict() && !M.saveBtn().disabled && M.create()`,
    setup: async (w, lang) => { await finished(w, lang); await w.setFiles(F('lecture-60s.mp4')); await w.waitSettled(); await until(w, 'M.verdict()', 'next verdict') ; if (await mx(w, 'M.ack()')) { await w.click(w.acknowledgeButton()); await sleep(300) } },
    focus: [SAVE, CREATE, FILE],
    fixtures: ['lecture-30s.mp4', 'lecture-60s.mp4'],
  },
  'S-63-W': {
    name: 'Previous video, a 100-character file name, beside the underscored one',
    state: `M.previous() && !!M.verdict() && M.text('#process-result').includes('W'.repeat(100))`,
    setup: async (w, lang) => { await finished(w, lang, LONG_W); await w.setFiles(F(LONG_UNDERSCORES)); await w.waitSettled(); await until(w, 'M.verdict()', 'next verdict') },
    focus: [SAVE, FILE],
    fixtures: [LONG_W, LONG_UNDERSCORES],
  },
  'S-63-LW': {
    name: 'Previous video, an underscored file name, beside the 100-character one',
    state: `M.previous() && !!M.verdict() && M.text('#process-result').includes(${JSON.stringify(LONG_UNDERSCORES)})`,
    setup: async (w, lang) => { await finished(w, lang, LONG_UNDERSCORES); await w.setFiles(F(LONG_W)); await w.waitSettled(); await until(w, 'M.verdict()', 'next verdict') },
    focus: [SAVE, FILE],
    fixtures: [LONG_W, LONG_UNDERSCORES],
  },
  'S-64': {
    name: "The previous result's ended-early line",
    state: `M.previous() && M.has('result.endedEarly', '#process-result > .notification[data-kind="success"]')`,
    setup: async (w, lang) => { await finished(w, lang, 'truncated-30s.mp4'); await w.setFiles(F('lecture-60s.mp4')); await w.waitSettled(); await until(w, 'M.verdict()', 'next verdict') },
    focus: [SAVE],
    fixtures: ['truncated-30s.mp4', 'lecture-60s.mp4'],
  },
  'S-65': {
    name: 'Saving the previous while checking the next',
    state: `M.previous() && M.saving() && M.has('status.saving', '#save-status') && M.checking() && M.has('status.checking', '#status')`,
    setup: async (w, lang) => { await applyFault(w, 'F4b'); await finished(w, lang, 'lecture-360s.mp4'); await w.setFiles(F('still-10800s.mp4')); await until(w, 'M.checking()', 'checking', 300000); await saveWith(w); await until(w, 'M.saving()', 'saving', 10000) },
    focus: [STOP_SAVE_SEL, STOP_CHECK_SEL],
    faults: ['F4b'], fixtures: ['lecture-360s.mp4', 'still-10800s.mp4'],
  },
  'S-66': {
    name: 'Save stopped',
    state: `M.res() === 'result' && !M.saving() && M.has('status.saveStopped', '#save-status') && !M.saveBtn().disabled`,
    setup: async (w, lang) => { await applyFault(w, 'F4b'); await finished(w, lang, 'lecture-360s.mp4'); await saveWith(w); await until(w, 'M.saving()', 'saving', 10000); await sleep(500); await w.click('#save-actions > button'); await until(w, 'M.has("status.saveStopped", "#save-status")', 'save stopped', 60000) },
    focus: [SAVE],
    faults: ['F4b'], fixtures: ['lecture-360s.mp4'],
  },
  'S-67': {
    name: 'Picker cancelled',
    state: `M.res() === 'result' && M.has('status.notSaved', '#save-status') && !M.saveBtn().disabled`,
    setup: async (w, lang) => { await applyFault(w, 'F4a'); await finished(w, lang); await saveWith(w); await w.waitSaved() },
    focus: [SAVE],
    faults: ['F4a'], fixtures: ['lecture-30s.mp4'],
  },
  'S-68': {
    name: 'Refused: the source file',
    state: `M.res() === 'result' && M.has('status.refusedSource', '#save-status') && !M.saveBtn().disabled`,
    setup: async (w, lang) => { await applyFault(w, 'F4c'); await finished(w, lang); await saveWith(w); await w.waitSaved() },
    focus: [SAVE],
    faults: ['F4c'], fixtures: ['lecture-30s.mp4'],
  },
  'S-69': {
    name: 'Save failed',
    state: `M.res() === 'result' && M.kindIn('#save-error') === 'error' && M.has('status.saveFailedWhat', '#save-error') && !M.saveBtn().disabled`,
    setup: async (w, lang) => { await applyFault(w, 'F4e'); await finished(w, lang); await saveWith(w); await until(w, 'M.kindIn("#save-error") === "error"', 'save failed', 30000); await sleep(300) },
    focus: [SAVE],
    faults: ['F4e'], fixtures: ['lecture-30s.mp4'],
  },
  'S-70a': {
    name: 'Download handed off',
    // F4d: the picker's writable rejects, so saveFile hands off to a download (src/media/save.ts:178-196). One picker call so far.
    state: `M.res() === 'result' && M.has('save.download', '#save-status') && !M.saveBtn().disabled && M.lifetime('result.lifetimeDelivered') && window.__audit.saves.length === 1`,
    setup: async (w, lang) => { await applyFault(w, 'F4d'); await finished(w, lang); await saveWith(w); await w.waitSaved() },
    focus: [SAVE, CREATE],
    faults: ['F4d'], fixtures: ['lecture-30s.mp4'],
  },
  'S-70b': {
    name: 'Download retried (Save pressed again)',
    state: `M.res() === 'result' && M.has('save.download', '#save-status') && !M.saveBtn().disabled && M.lifetime('result.lifetimeDelivered') && window.__audit.saves.length === 2`,
    setup: async (w, lang) => { await applyFault(w, 'F4d'); await finished(w, lang); await saveWith(w); await w.waitSaved(); await sleep(500); await saveWith(w); await until(w, 'window.__audit.saves.length === 2', 'second save', 10000); await sleep(300); await w.waitSaved() },
    focus: [SAVE],
    faults: ['F4d'], fixtures: ['lecture-30s.mp4'],
  },
  'S-70c': {
    name: 'The download kind of discard question',
    state: `M.res() === 'question' && M.has('discard.delivered', '#process-result')`,
    setup: async (w, lang) => { await applyFault(w, 'F4d'); await finished(w, lang); await saveWith(w); await w.waitSaved(); await question(w) },
    focus: ['#process-result .button--danger', '#process-result .button--secondary'],
    faults: ['F4d'], fixtures: ['lecture-30s.mp4'],
  },
  'S-71': {
    name: 'Type and video language switched beside a kept result',
    state: `M.finished() && M.checked('video-kind') === 'submission' && M.checked('video-language') === ${OTHER_VIDEO_LANGUAGE} && M.vis('#video-next') && M.idle()`,
    setup: async (w, lang) => { await finished(w, lang); await w.chooseKind('submission'); await w.click(`#video-language input[value="${otherVideoLanguage(lang)}"]`); await sleep(300) },
    focus: [RADIO_KIND, RADIO_VLANG],
    fixtures: ['lecture-30s.mp4'],
  },
  'S-72a': {
    name: 'Focus left where the person reads: a job finishes',
    // Focus put on Video properties by a key event while the job runs; the job finishes; focus has not moved.
    state: `M.finished() && document.activeElement === M.el('#source-report summary')`,
    hold: `M.finished()`,
    setup: async (w, lang) => { await ready(w, lang, 'lecture-360s.mp4'); await create(w); await w.waitRunning(); await focusByKeyboard(w, '#source-report summary'); await w.waitFinished() },
    focus: ['#source-report summary'],
    fixtures: ['lecture-360s.mp4'],
  },
  'S-72b': {
    name: 'Focus left where the person reads: a save finishes',
    // F4b slows the save; focus put on Video properties while it streams; saved; focus has not moved.
    state: `M.res() === 'result' && M.has('status.saved', '#save-status') && document.activeElement === M.el('#source-report summary')`,
    hold: `M.res() === 'result' && M.has('status.saved', '#save-status')`,
    setup: async (w, lang) => { await applyFault(w, 'F4b'); await finished(w, lang); await saveWith(w); await until(w, 'M.saving()', 'saving', 10000); await focusByKeyboard(w, '#source-report summary'); await until(w, `M.has('status.saved', '#save-status')`, 'saved', 300000); await sleep(300) },
    focus: ['#source-report summary'],
    faults: ['F4b'], fixtures: ['lecture-30s.mp4'],
  },
  'S-73': {
    name: 'Ready, storage unknown',
    state: `M.verdict() === 'warning' && M.has('preflight.reasons.storageUnknown', '#preflight-report')`,
    setup: async (w, lang) => { await applyFault(w, 'F9'); await ready(w, lang, 'lecture-30s.mp4') },
    focus: [CREATE],
    faults: ['F9'], fixtures: ['lecture-30s.mp4'],
  },
  'S-74': {
    name: 'Errors captured',
    // The captured error sits in #errors behind the panel's closed disclosure, so it is read present, not visible (VH-172's smoke).
    state: `M.vis('#errors-panel') && (document.querySelector('#errors > .notification') || {}).dataset?.kind === 'error' && !document.querySelector('dialog[open]')`,
    setup: async (w, lang) => { await fresh(w, lang); await applyFault(w, 'F8'); await sleep(500) },
    focus: ['#feedback-report', '#errors-panel summary'],
    faults: ['F8'], fixtures: [],
  },
  'S-75': {
    name: 'Report this problem',
    state: `!!document.querySelector('dialog#feedback-dialog[open]') && M.vis('#errors-panel') && M.el('#feedback-message').value === ''`,
    setup: async (w, lang) => { await fresh(w, lang); await applyFault(w, 'F8'); await sleep(500); await w.click('#feedback-report'); await sleep(300) },
    focus: ['#feedback-message', '#feedback-close', '#feedback-copy'],
    faults: ['F8'], fixtures: [],
  },
  'S-76': {
    name: 'Feedback dialog, empty',
    state: `!!document.querySelector('dialog#feedback-dialog[open]') && M.el('#errors-panel').hidden && M.el('#feedback-message').value === '' && M.el('#feedback-message-error').hidden && M.text('#feedback-status').trim() === ''`,
    setup: async (w, lang) => feedbackOpen(w, lang),
    focus: ['#feedback-message', '#feedback-close', '#feedback-copy'],
    fixtures: [],
  },
  'S-77': {
    name: 'Feedback refused: empty',
    state: `!!document.querySelector('dialog#feedback-dialog[open]') && M.el('#feedback-message').getAttribute('aria-invalid') === 'true' && M.vis('#feedback-message-error')`,
    setup: async (w, lang) => { await feedbackOpen(w, lang); await w.click(SUBMIT); await sleep(300) },
    focus: ['#feedback-message', SUBMIT],
    fixtures: [],
  },
  'S-78': {
    name: 'Feedback sent to the email app',
    state: `!!document.querySelector('dialog#feedback-dialog[open]') && M.el('#feedback-message').value.length > 0 && M.has('feedback.opened', '#feedback-status') && !M.has('feedback.someOmitted', '#feedback-status')`,
    setup: async (w, lang) => { await feedbackOpen(w, lang); await w.type('#feedback-message', 'The page worked well for me.'); await w.click(SUBMIT); await sleep(500) },
    focus: ['#feedback-message', SUBMIT],
    fixtures: [],
  },
  'S-78k': {
    name: 'Feedback handed off beside a chosen video and a filled card; closed and opened again',
    // VH-172 (VH-164's contract): the chosen video, the choices and the draft kept. The state asks only
    // that the dialog is open again over a chosen video; what was kept is read (READINGS.kept), not assumed.
    state: `!!document.querySelector('dialog#feedback-dialog[open]') && M.chosen() && !!M.verdict()`,
    setup: async (w, lang) => {
      await ready(w, lang); await w.chooseKind('submission'); await submissionFill(w)
      await w.click('#feedback-open'); await sleep(300); await w.type('#feedback-message', 'The page worked well for me.'); await w.click(SUBMIT); await sleep(500)
      await w.click('#feedback-close'); await sleep(300); await w.click('#feedback-open'); await sleep(300)
    },
    focus: ['#feedback-message', SUBMIT],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-79a': {
    name: 'Feedback oversized: no mailto',
    state: `!!document.querySelector('dialog#feedback-dialog[open]') && M.has('feedback.tooLong', '#feedback-status')`,
    setup: async (w, lang) => { await feedbackOpen(w, lang); await w.type('#feedback-message', 'This message runs past what an email link can carry. '.repeat(40)); await w.click(SUBMIT); await sleep(500) },
    focus: ['#feedback-message', '#feedback-copy'],
    fixtures: [],
  },
  'S-79b': {
    name: 'Feedback fits, its details do not',
    // A message that fits the mailto with room for few details (src/main.ts:3540): opened, and some details only in the copy.
    // 30 repeats, about 1,080 encoded characters of FEEDBACK_MAILTO_MAX_CHARACTERS' 1,800; 50 passed the limit (VH-172's smoke).
    state: `!!document.querySelector('dialog#feedback-dialog[open]') && M.has('feedback.opened', '#feedback-status') && M.has('feedback.someOmitted', '#feedback-status') && M.has('feedback.onlyInCopy', '#feedback-details')`,
    setup: async (w, lang) => { await feedbackOpen(w, lang); await sleep(1500); await w.type('#feedback-message', 'Long but under the limit. '.repeat(30)); await w.click(SUBMIT); await sleep(500) },
    focus: ['#feedback-message', SUBMIT],
    fixtures: [],
  },
  'S-80a': {
    name: 'Copied (F5 granted)',
    state: `!!document.querySelector('dialog#feedback-dialog[open]') && M.has('feedback.copied', '#feedback-status')`,
    setup: async (w, lang) => { await feedbackOpen(w, lang); await applyFault(w, 'F5', { setting: 'granted' }); await w.type('#feedback-message', 'A test message.'); await w.click('#feedback-copy'); await sleep(600) },
    focus: ['#feedback-copy'],
    faults: ['F5'], fixtures: [],
  },
  'S-80b': {
    name: 'Copy failed (F5 denied)',
    state: `!!document.querySelector('dialog#feedback-dialog[open]') && M.has('feedback.couldNotCopy', '#feedback-status')`,
    setup: async (w, lang) => { await feedbackOpen(w, lang); await applyFault(w, 'F5', { setting: 'denied' }); await w.type('#feedback-message', 'A test message.'); await w.click('#feedback-copy'); await sleep(600) },
    focus: ['#feedback-copy'],
    faults: ['F5'], fixtures: [],
  },
  'S-81': {
    name: 'Accessibility statement open',
    state: `M.el('#accessibility-statement').open && M.vis('#statement-heading') && !M.chosen()`,
    setup: async (w, lang) => { await fresh(w, lang); await w.click('#accessibility-statement summary'); await sleep(300) },
    focus: ['#accessibility-statement summary', '#accessibility-statement a'],
    fixtures: [],
  },
  'S-82': {
    name: 'System check open',
    state: `M.el('#system-check').open && document.querySelectorAll('#checks .check').length === 6 && ![...document.querySelectorAll('#checks .check')].some((r) => r.dataset.state === 'pending')`,
    setup: async (w, lang) => { await fresh(w, lang); await w.click('#system-check summary'); await sleep(300) },
    focus: ['#system-check summary'],
    fixtures: [],
  },
  'S-83': {
    name: 'Footer',
    // The empty page scrolled to its foot; the scroll is the setup's, so `hold` keeps the page state only.
    state: `!M.chosen() && !document.querySelector('dialog[open]') && Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 2`,
    hold: `!M.chosen() && !document.querySelector('dialog[open]')`,
    setup: async (w, lang) => { await fresh(w, lang); await w.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)'); await sleep(300) },
    // VH-172: a mode that changes the page's height (the 32 px font) moves the foot; scrolled again after each mode.
    afterMode: async (w) => { await w.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)'); await sleep(300) },
    focus: ['#feedback-open', '#feedback-form-link', '#contact-creators', '#contact-learning-content'],
    fixtures: [],
  },
  // S-84 (page language at narrow width) reuses S-03 at 320 px: the light matrix covers it.
  'S-85': {
    name: 'Announce progress off',
    state: `M.running() && M.vis('#announce-field') && !M.el('#announce-progress').checked`,
    setup: async (w, lang) => { await running(w, lang); await w.click('#announce-progress'); await sleep(300) },
    focus: ['#announce-progress', CANCEL],
    fixtures: ['still-3600s.mp4'],
  },
  'S-86': {
    name: 'Remembered video language',
    state: `M.checked('video-language') === ${OTHER_VIDEO_LANGUAGE} && !M.chosen() && window.__audit.boot.langAtDCL === document.documentElement.lang`,
    setup: async (w, lang) => { await fresh(w, lang); await w.click(`#video-language input[value="${otherVideoLanguage(lang)}"]`); await sleep(300); await w.goto() },
    focus: [RADIO_VLANG],
    fixtures: [],
  },
  'S-87': {
    name: '4:3',
    state: `M.proceed() && /640\\D{1,5}480/.test(M.text('#source-report dl'))`,
    setup: async (w, lang) => ready(w, lang, 'fourbythree-20s.mp4'),
    focus: [CREATE, '#source-report summary'],
    fixtures: ['fourbythree-20s.mp4'],
  },
  'S-88': {
    name: 'Discard question withdrawn by a change',
    // A closing change, so the state stands apart from S-71's switches and S-59's Keep it.
    state: `M.finished() && M.el('#closing-type').value === 'fade' && M.checked('video-kind') === 'staff' && M.text('#status').trim() === ''`,
    setup: async (w, lang) => { await finished(w, lang); await question(w); await w.select('#closing-type', 'fade'); await sleep(400) },
    focus: ['#closing-type', SAVE],
    fixtures: ['lecture-30s.mp4'],
  },
  'S-89': {
    name: 'Device check failed',
    state: `M.kindIn('#preflight-report') === 'error' && M.has('failure.checkFailed.what', '#preflight-report') && M.checkAgain()`,
    setup: async (w, lang) => { await applyFault(w, 'F10'); await fresh(w, lang); await w.setFiles(F('lecture-30s.mp4')); await until(w, 'M.kindIn("#preflight-report") === "error"', 'check failed', 60000); await sleep(300) },
    focus: ['#stop-actions > button:nth-child(2)'],
    faults: ['F10'], fixtures: ['lecture-30s.mp4'],
  },
  'S-90a': {
    name: 'Failed, locks held while the job stops',
    // F11: the watchdog stops the job after 120 s of silence; the locks then hold for 10 s
    // (src/main.ts:3088), so the record and its instruments run inside them, and `hold` fails it if they lifted.
    state: `M.res() === 'failure' && M.has('failure.timedOut.what', '#process-result') && M.el('#file-input').disabled && M.btn(3).disabled && M.has('status.stoppingAfterFailure', '#job-notice')`,
    setup: async (w, lang) => { await applyFault(w, 'F11'); await ready(w, lang, 'lecture-360s.mp4'); await create(w); await w.waitRunning(); await until(w, 'M.res() === "failure"', 'watchdog', 200000) },
    focus: [RESULT],
    faults: ['F11'], fixtures: ['lecture-360s.mp4'],
  },
  'S-90b': {
    name: 'Failed after the watchdog, locks lifted',
    state: `M.res() === 'failure' && M.has('failure.timedOut.what', '#process-result') && !M.el('#file-input').disabled && !M.shown(M.btn(3)) && M.create()`,
    setup: async (w, lang) => { await applyFault(w, 'F11'); await ready(w, lang, 'lecture-360s.mp4'); await create(w); await w.waitRunning(); await until(w, 'M.res() === "failure"', 'watchdog', 200000); await until(w, '!M.el("#file-input").disabled', 'locks lift', 30000); await sleep(300) },
    focus: [RESULT, CREATE],
    faults: ['F11'], fixtures: ['lecture-360s.mp4'],
  },
  'S-91': {
    name: "The previous result's closing line",
    state: `M.previous() && M.has('result.fellBackToCut.blue.fade', '#process-result > .notification[data-kind="success"]')`,
    setup: async (w, lang) => { await applyFault(w, 'F6a'); await finished(w, lang, 'lecture-30s.mp4', async () => { await w.select('#closing-type', 'fade'); await w.waitSettled() }); await w.setFiles(F('lecture-60s.mp4')); await w.waitSettled(); await until(w, 'M.verdict()', 'next verdict') },
    focus: [SAVE],
    faults: ['F6a'], fixtures: ['lecture-30s.mp4', 'lecture-60s.mp4'],
  },
}
function M_SUB_FOCUS() { return ['#submission-card-assignment', '#submission-card-module', '#submission-card-convenor', '#submission-card-ids'] }
// VH-198: Phase 7's scenarios, before pass 3's are added at the end of this
// module, so PLANS.priority stays the frozen 699 keys (the plan's part 1).
const PHASE7_IDS = new Set(Object.keys(SCENARIOS))

// Walked scenarios the matrix cannot hold as records, each with its reason:
// named gaps in the manifest, never a faked pass.
export const LEFT_OUT = {
  'S-12': 'Reading is over before the instruments finish, even for the 6-hour still (VH-172 smoke: the read line had become "Video read." by the re-check); no declared fault holds the read',
  'S-13': 'as S-12: the replacement\'s read is over before the instruments finish; the settled S-63 is measured instead',
  'S-34': 'the check after a trim lasts about as long as any check of a short file, well under the instruments\' run; S-14 holds the same checking state on the 6-hour still, so this one is not measured apart',
  'S-51': 'Cancelling lasts about 9 ms (scenario list), far under the instruments\' run, and no declared fault holds it',
}

// ---------------------------------------------------------------------------
// Keyboard routes: keys only after setup. A route is a record of its own.
// A native modal dialog in Chrome lets Tab past its last control leave the
// page for the browser's own controls (focus reads body), then come back to
// the dialog's first; it never reaches the page behind it (VH-171, settled:
// the route says where focus may go rather than failing on it).
// Choosing the file is setup inside the route (DOM.setFileInputFiles): the
// native chooser is the browser's own (VH-168), so the step Tabs to it by
// keys and then sets the file. So is each fault.
const FOCUS_ON = (sel) => `document.activeElement === document.querySelector(${JSON.stringify(sel)})`
const MX = (expr) => `(() => { const M = window.__mx; return ${expr}; })()`
const pick = (file) => ({ setup: async (w) => { await w.setFiles(F(file)) }, note: `setup: the file chooser is native (VH-168), so ${file} is set by DOM.setFileInputFiles` })
const SETTLED = MX(`!!M.verdict() || !!M.kindIn('#source-block') || M.kindIn('#source-report') === 'error'`)
const SUMMARY_OF = (id) => FOCUS_ON(`#${id} summary`)
const PROPS = '#source-report summary'
const QUESTION = '#process-result > .notification[data-kind="warning"]'
const STOP_CHECK = '#stop-actions > button:nth-child(1)'
const CHECK_AGAIN = '#stop-actions > button:nth-child(2)'
const STOP_SAVE = '#save-actions > button'
// A native select's popup is the browser's own: Chrome on macOS opens it on
// ArrowDown rather than stepping the value, so the step is "cannot
// determine" unless the value moved, never a pass by default.
const nativeSelect = (id, note) => [
  { key: 'Tab', shift: true, untilState: FOCUS_ON('#' + id), repeat: 12, note: 'Shift+Tab back to ' + id },
  { key: 'ArrowDown', native: true, state: MX(`M.el('#${id}').selectedIndex > 0`), note },
  { key: 'Escape', native: true, expect: id, note: 'Escape closes the popup if one opened; focus stays on the select' },
]

export const ROUTES = {
  'K-dialog': {
    name: 'The dialog entered and left by keys, focus returned',
    setup: async (w, lang) => fresh(w, lang),
    fixtures: [],
    steps: [
      { key: 'Tab', until: 'feedback-open', repeat: 80, note: 'Tab forward to Send feedback' },
      { key: 'Enter', state: `(() => { const d = document.querySelector('dialog[open]'); return !!d && d.contains(document.activeElement); })()`, note: 'Enter opens the dialog; focus moves inside' },
      ...Array.from({ length: 6 }, (_, i) => ({ key: 'Tab', state: IN_DIALOG_OR_OUT, note: 'Tab ' + (i + 1) + ' stays inside the dialog or leaves for the browser\'s own controls' })),
      { key: 'Tab', until: 'feedback-(?!open)', repeat: 8, state: IN_DIALOG, note: 'Tab comes back into the dialog, never to the page behind it' },
      ...Array.from({ length: 6 }, (_, i) => ({ key: 'Tab', shift: true, state: IN_DIALOG_OR_OUT, note: 'Shift+Tab ' + (i + 1) + ' stays inside or leaves for the browser' })),
      { key: 'Tab', until: 'feedback-(?!open)', repeat: 8, state: IN_DIALOG, note: 'and Tab comes back into the dialog' },
      { key: 'Escape', expect: 'feedback-open', state: `!document.querySelector('dialog[open]')`, note: 'Escape closes; focus returns to Send feedback' },
      { key: 'Tab', shift: true, expect: '.', note: 'Shift+Tab moves back from it' },
    ],
  },

  // J1, a staff video from the empty page to a saved file (scenarios list, "Keyboard route per journey").
  J1: {
    name: 'J1: staff video, empty to saved, by keys',
    setup: async (w, lang) => fresh(w, lang),
    fixtures: ['lecture-360s.mp4'],
    steps: [
      { key: 'Tab', until: 'file-input', repeat: 40, note: 'S-03: Tab to Choose file' },
      { ...pick('lecture-360s.mp4'), waitFor: SETTLED, timeout: 180000, expect: 'file-input', state: MX('M.proceed() && M.create()') },
      { wait: 0, expect: 'file-input', state: MX('M.proceed()'), note: 'S-12, S-14, S-15: read and checked; focus stays on the chooser (reading and checking pass in about a second, so only the outcome is asserted)' },
      { key: 'Tab', untilState: FOCUS_ON(PROPS), repeat: 10, note: 'Tab to Video properties' },
      { key: 'Enter', state: MX(`!!M.el('#source-report details[open]')`), expect: '^summary', note: 'S-16: Enter opens Video properties; focus stays on the summary' },
      { key: 'Tab', until: 'onset-help-button', repeat: 80, note: 'Tab past the preview, the trim and the card to About animation onset' },
      { key: 'Enter', state: MX(`M.vis('#onset-help') && M.el('#onset-help-button').getAttribute('aria-expanded') === 'true'`), expect: 'onset-help-button', note: 'S-17: Enter opens the toggletip; focus stays on the button' },
      { key: 'Escape', state: MX(`!M.vis('#onset-help')`), expect: 'onset-help-button', note: 'Escape closes it; focus stays' },
      { key: 'Tab', shift: true, until: 'title-card-on', repeat: 20, state: MX(`!M.el('#title-card-on').checked && M.el('#title-card-fields').hidden`), note: 'S-36: Shift+Tab back to Add a title card, unticked' },
      { key: 'Space', state: MX(`M.el('#title-card-on').checked && M.vis('#title-card-fields')`), expect: 'title-card-on', note: 'Space ticks it; the fields show' },
      { key: 'Tab', untilState: FOCUS_ON(CREATE), repeat: 40, note: 'Tab to Create' },
      { key: 'Enter', state: MX(`M.vis('#title-card-empty-error') && M.idle()`), expect: 'title-card-title', note: 'S-37: Create with the date only is refused; focus goes to Title' },
      { text: 'Introduction to the module', state: MX(`M.el('#title-card-title').value.length > 0`), note: 'S-39: Title typed' },
      { key: 'Tab', expect: 'title-card-department' },
      { text: 'School of Audits' },
      { key: 'Tab', expect: 'title-card-authors' },
      { text: 'A. Author', state: MX(`['title-card-title', 'title-card-department', 'title-card-authors'].every((id) => M.el('#' + id).value.length > 0) && !M.vis('#title-card-empty-error')`), note: 'S-39: the card filled; the refusal gone' },
      { key: 'Tab', until: 'closing-internal', repeat: 20, note: 'Tab to Internal use only' },
      { key: 'Space', state: MX(`M.el('#closing-internal').checked`), expect: 'closing-internal', note: 'S-44: Space ticks Internal use only' },
      { key: 'Tab', shift: true, until: 'closing-colour=', repeat: 6, note: 'Shift+Tab to the colour' },
      { key: 'ArrowRight', state: MX(`M.checked('closing-colour') === 'white'`), expect: 'closing-colour=white', note: 'S-47: an arrow chooses White' },
      ...nativeSelect('closing-type', 'S-47: ArrowDown on Animation type (native select)'),
      { key: 'Tab', untilState: FOCUS_ON(CREATE), repeat: 30, note: 'Tab to Create' },
      { key: 'Enter', waitFor: MX('M.running()'), timeout: 60000, state: FOCUS_ON(CANCEL), note: 'S-48: Enter on Create starts the job; Cancel takes focus' },
      { waitFor: MX(`M.running() && M.text('#process-time-left').trim().length > 0`), timeout: 90000, state: FOCUS_ON(CANCEL), note: 'S-49: the time left shows; focus unmoved' },
      { key: 'Tab', shift: true, untilState: FOCUS_ON(PROPS), repeat: 60, state: MX('M.running()'), note: 'S-72: Shift+Tab to Video properties while the job runs' },
      { waitFor: MX('M.finished()'), timeout: 600000, expect: '^summary', note: 'S-72, S-53: the job finishes; nothing moves focus from Video properties' },
      { key: 'Tab', untilState: FOCUS_ON(CREATE), repeat: 80, note: 'Tab to Create, now outlined beside the result' },
      { key: 'Enter', state: MX(`M.res() === 'question'`) + ' && ' + FOCUS_ON(QUESTION), note: 'S-58: Enter asks the discard question; the question takes focus' },
      { key: 'Tab', untilState: FOCUS_ON('#process-result .button--secondary'), repeat: 4, note: 'Tab past Discard to Keep it' },
      { key: 'Enter', state: MX('M.finished()') + ' && ' + FOCUS_ON(RESULT), note: 'S-59: Keep it redraws the result, which takes focus' },
      { key: 'Tab', untilState: FOCUS_ON(SAVE), repeat: 6, note: 'Tab to Save the video' },
      { key: 'Enter', waitFor: MX(`M.has('status.saved', '#save-status')`), timeout: 120000, state: MX('M.saveBtn().disabled') + ' && ' + FOCUS_ON(RESULT), note: 'S-61, S-62: Enter saves (Stop saving shows while it streams, for well under a second here); once saved the spent Save hands focus to the result' },
    ],
  },

  // J2, a student submission: the side, the four fields refused and filled, made and saved.
  J2: {
    name: 'J2: student submission, by keys',
    setup: async (w, lang) => fresh(w, lang),
    fixtures: ['lecture-60s.mp4'],
    steps: [
      { key: 'Tab', until: 'video-kind=', repeat: 20, note: 'Tab to Video type' },
      { key: 'ArrowRight', state: MX(`M.checked('video-kind') === 'submission'`), expect: 'video-kind=submission', note: 'S-07: an arrow chooses Student submission; focus stays on the radio' },
      { key: 'Tab', until: 'file-input', repeat: 20, note: 'Tab to Choose file' },
      { ...pick('lecture-60s.mp4'), waitFor: SETTLED, timeout: 120000, expect: 'file-input', state: MX('M.proceed()') },
      { key: 'Tab', until: 'submission-card-assignment', repeat: 60, state: MX(`M.fields(M.SUB).every((f) => f.value === '') && M.el('#title-card-on').disabled && M.el('#title-card-on').checked`), note: 'S-40: Tab to the first of the four fields; the box ticked and locked' },
      { key: 'Tab', untilState: FOCUS_ON(CREATE), repeat: 40, state: MX(`M.el('#closing-internal').checked && M.el('#closing-internal').disabled`), note: 'S-45: Tab on to Create; Internal use only is ticked and locked, so Tab passes it' },
      { key: 'Enter', state: MX(`M.fields(M.SUB).every((f) => f.getAttribute('aria-invalid') === 'true')`), expect: 'submission-card-assignment', note: 'S-41: Create refused; four errors; focus to the first field' },
      { text: 'Assignment 2: audit' },
      { key: 'Tab', expect: 'submission-card-module' },
      { text: 'AUD1001 Auditing the page' },
      { key: 'Tab', expect: 'submission-card-convenor' },
      { text: 'Dr A. Convenor' },
      { key: 'Tab', expect: 'submission-card-ids' },
      { text: '12345678 23456789', state: MX(`M.fields(M.SUB).every((f) => f.value.length > 0)`), note: 'S-42: the four fields filled' },
      { key: 'Tab', untilState: FOCUS_ON(CREATE), repeat: 40, state: MX(`M.fields(M.SUB).every((f) => !f.getAttribute('aria-invalid'))`), note: 'Tab to Create; no field is marked' },
      { key: 'Enter', waitFor: MX('M.running()'), timeout: 30000, state: FOCUS_ON(CANCEL) + ' && ' + MX(`M.el('#title-card-choice').disabled`), note: 'S-48, S-43: the job runs; the fields are locked; Cancel has focus' },
      { waitFor: MX('M.finished()'), timeout: 600000, state: FOCUS_ON(RESULT), note: 'S-53: finished; focus handed from Cancel to the result' },
      { key: 'Tab', untilState: FOCUS_ON(SAVE), repeat: 6, note: 'Tab to Save the video' },
      { key: 'Enter', waitFor: MX(`M.has('status.saved', '#save-status')`), timeout: 120000, state: MX('M.saveBtn().disabled') + ' && ' + FOCUS_ON(RESULT), note: 'S-61, S-62: saved; focus to the result' },
    ],
  },

  // J3, the failures. One page, reloaded between the parts, because each
  // fault is set for a whole page: a setup step releases the last part's
  // faults (faults.mjs `releaseFault`), sets the next part's, and reloads.
  J3: {
    name: 'J3: blocks, failures and recovery, by keys',
    setup: async (w, lang) => { await fresh(w, lang); await applyFault(w, 'F2'); await w.goto() },
    fixtures: ['prores-1080p.mov', 'notvideo.mp4', 'lecture-60s.mp4', 'lecture-360s.mp4', 'lecture-30s.mp4'],
    faults: ['F2', 'F3', 'F12', 'F4e', 'F8', 'F5'],
    steps: [
      // S-02, its own load (F2).
      { key: 'Tab', untilState: SUMMARY_OF('system-check'), repeat: 60, state: MX(`M.el('#file-input').disabled && M.el('#system-check').open && M.el('#check-webcodecs')?.dataset.state === 'fail'`), note: 'S-02: the chooser is shut, so Tab passes it to the open System check' },
      { key: 'Tab', until: 'feedback-open', repeat: 60, note: 'Follow the remedy: Tab on to Send feedback' },
      { setup: async (w) => { await releaseFault(w, 'F2'); await w.goto() }, note: 'setup: F2 released; the page reloaded' },
      // S-28, S-29, S-15.
      { key: 'Tab', until: 'file-input', repeat: 40, note: 'Tab to Choose file' },
      { ...pick('prores-1080p.mov'), waitFor: SETTLED, timeout: 120000, expect: 'file-input', state: MX(`M.kindIn('#source-block') === 'error' && M.el('#step-trim').hidden`) },
      { wait: 0, expect: 'file-input', note: 'S-28: blocked beside the chooser; focus stays on it' },
      { ...pick('notvideo.mp4'), waitFor: MX(`M.kindIn('#source-report') === 'error'`), timeout: 60000, expect: 'file-input', state: MX(`M.el('#step-trim').hidden && M.res() === 'none'`) },
      { wait: 0, expect: 'file-input', note: 'S-29: unreadable; the chooser leads again' },
      { ...pick('lecture-60s.mp4'), waitFor: MX('!!M.verdict()'), timeout: 120000, expect: 'file-input', state: MX('M.proceed()') },
      { wait: 0, expect: 'file-input', note: 'S-15: ready; focus still on the chooser' },
      { setup: async (w) => { await applyFault(w, 'F3', { bytes: 5 * 1024 * 1024 }); await w.goto() }, note: 'setup: F3 set (a 5 MB quota); the page reloaded' },
      // S-31, S-35 (F3).
      { key: 'Tab', until: 'file-input', repeat: 40, note: 'Tab to Choose file' },
      { ...pick('lecture-360s.mp4'), waitFor: MX(`M.kindIn('#source-block') === 'error' && M.checkAgain()`), timeout: 120000, expect: 'file-input' },
      { wait: 0, expect: 'file-input', state: MX(`!M.el('#step-trim').hidden`), note: 'S-31: the storage block at step 1; the trim and preset still usable; focus on the chooser' },
      { key: 'Tab', untilState: FOCUS_ON(CHECK_AGAIN), repeat: 80, note: 'Tab to Check again' },
      { key: 'Enter', state: FOCUS_ON(STOP_CHECK) + ' && ' + MX('M.checking()'), note: 'Check again runs the check; Stop the check takes focus (src/main.ts:2292)' },
      { key: 'Enter', state: FOCUS_ON(CHECK_AGAIN) + ' && ' + MX(`M.has('status.checkStopped', '#status')`), note: 'S-35: Stop the check; Check again takes focus (src/main.ts:2285)' },
      { setup: async (w) => { await releaseFault(w, 'F3'); await applyFault(w, 'F12'); await applyFault(w, 'F4e'); await w.goto() }, note: 'setup: F3 released, F12 and F4e set; the page reloaded' },
      // S-56, S-57, S-53, S-69, S-62 (F12, F4e).
      { key: 'Tab', until: 'file-input', repeat: 40, note: 'Tab to Choose file' },
      { ...pick('lecture-30s.mp4'), waitFor: MX('!!M.verdict() && M.create()'), timeout: 120000, expect: 'file-input' },
      { key: 'Tab', untilState: FOCUS_ON(CREATE), repeat: 80, note: 'Tab to Create' },
      { key: 'Enter', waitFor: MX(`M.res() === 'failure' && M.idle()`), timeout: 120000, state: MX(`M.has('failure.outOfSpace.what', '#process-result')`) + ' && ' + FOCUS_ON(RESULT), note: 'S-56: out of space part-way (F12); focus handed from Cancel to the failure' },
      { key: 'Tab', untilState: FOCUS_ON(CREATE), repeat: 10, note: 'Tab to Create' },
      { key: 'Enter', waitFor: MX('M.running() || M.finished()'), timeout: 60000, note: 'S-57: Create again starts a new job (F12 fails once)' },
      { waitFor: MX('M.finished()'), timeout: 300000, state: FOCUS_ON(RESULT), note: 'S-53: finished; focus to the result' },
      { key: 'Tab', untilState: FOCUS_ON(SAVE), repeat: 6, note: 'Tab to Save the video' },
      { key: 'Enter', waitFor: MX(`M.kindIn('#save-error') === 'error'`), timeout: 60000, state: FOCUS_ON(SAVE), note: 'S-69: the save fails (F4e); Save takes focus back' },
      { setup: async (w) => { await releaseFault(w, 'F4e') }, note: "setup: F4e released in place (the real URL.createObjectURL and the walk's picker stub back), so the next save can land" },
      { key: 'Enter', waitFor: MX(`M.has('status.saved', '#save-status')`), timeout: 120000, state: FOCUS_ON(RESULT) + ' && ' + MX(`!M.kindIn('#save-error')`), note: 'S-62: Enter on Save again; saved; focus to the result' },
      { setup: async (w) => { await releaseFault(w, 'F12'); await w.goto(); await applyFault(w, 'F8'); await applyFault(w, 'F5', { setting: 'denied' }); await sleep(500) }, note: 'setup: F12 released; the page reloaded; F8 and F5 (denied) set in place' },
      // S-74, S-75, S-77, S-80 (F8, F5 denied).
      { key: 'Tab', until: 'feedback-report', repeat: 80, state: MX(`M.vis('#errors-panel')`), note: 'S-74: Tab to Report this problem in Errors captured' },
      { key: 'Enter', expect: 'feedback-message', state: IN_DIALOG, note: 'S-75: the dialog opens on the message field' },
      { key: 'Tab', untilState: FOCUS_ON(SUBMIT), repeat: 8, state: IN_DIALOG, note: 'Tab to Open email app' },
      { key: 'Enter', expect: 'feedback-message', state: MX(`M.el('#feedback-message').getAttribute('aria-invalid') === 'true' && M.vis('#feedback-message-error')`), note: 'S-77: refused while empty; focus back on the message' },
      { text: 'A test message.' },
      { key: 'Tab', untilState: FOCUS_ON('#feedback-copy'), repeat: 8, state: IN_DIALOG, note: 'Tab to Copy message and details' },
      { key: 'Enter', state: MX(`M.has('feedback.couldNotCopy', '#feedback-status')`), expect: 'feedback-copy', note: 'S-80: the copy refused (F5 denied); said; focus unmoved' },
    ],
  },

  // J4, a kept result beside the next files: previous video, a save stopped, the switches, an unreadable file, discard.
  J4: {
    name: 'J4: a kept result and the next video, by keys',
    setup: async (w, lang) => { await applyFault(w, 'F4b'); await fresh(w, lang) },
    fixtures: ['truncated-30s.mp4', 'lecture-60s.mp4', 'lecture-360s.mp4', 'notvideo.mp4'],
    faults: ['F4b'],
    steps: [
      { key: 'Tab', until: 'file-input', repeat: 40, note: 'Tab to Choose file' },
      { ...pick('truncated-30s.mp4'), waitFor: MX('!!M.verdict() && M.create()'), timeout: 120000, expect: 'file-input' },
      { key: 'Tab', untilState: FOCUS_ON(CREATE), repeat: 80, note: 'Tab to Create' },
      { key: 'Enter', waitFor: MX('M.finished()'), timeout: 300000, state: FOCUS_ON(RESULT), note: 'S-53: finished; focus from Cancel to the result' },
      { key: 'Tab', shift: true, until: 'file-input', repeat: 120, note: 'Shift+Tab back to Choose file' },
      { ...pick('lecture-60s.mp4'), waitFor: MX('!!M.verdict()'), timeout: 120000, expect: 'file-input', state: MX(`M.previous() && M.has('result.endedEarly', '#process-result > .notification[data-kind="success"]')`) },
      { wait: 0, expect: 'file-input', note: 'S-13, S-63, S-64: the replacement read and checked beside "Previous video", its ended-early line kept; focus on the chooser (the read itself passes in well under a second)' },
      { ...pick('lecture-360s.mp4'), expect: 'file-input' },
      { key: 'Tab', untilState: FOCUS_ON(SAVE), repeat: 120, note: 'Tab to Save on the previous video while the next file is read and checked' },
      { key: 'Enter', waitFor: MX('M.saving()'), timeout: 10000, state: FOCUS_ON(STOP_SAVE), note: 'S-65: Saving under the result (F4b, slow) beside the next file\'s check; Stop saving takes focus' },
      { key: 'Enter', waitFor: MX(`M.has('status.saveStopped', '#save-status')`), timeout: 60000, state: FOCUS_ON(SAVE), note: 'S-66 by the way: Stop saving, so the result stays unsaved; Save takes focus back' },
      { key: 'Tab', shift: true, until: 'video-kind=', repeat: 120, note: 'Shift+Tab to Video type' },
      { key: 'ArrowRight', state: MX(`M.checked('video-kind') === 'submission' && M.vis('#video-next') && M.previous()`), expect: 'video-kind=submission', note: 'S-71: Student submission beside the kept result; the next-video line shows' },
      { key: 'Tab', until: 'video-language=', repeat: 4, note: 'Tab to Video language' },
      { key: 'ArrowRight', state: MX(`M.checked('video-language') !== document.documentElement.lang`), expect: 'video-language=', note: 'S-71: another video language' },
      { key: 'Tab', shift: true, until: 'video-kind=', repeat: 4, note: 'Shift+Tab back to Video type' },
      { key: 'ArrowLeft', state: MX(`M.checked('video-kind') === 'staff'`), expect: 'video-kind=staff', note: 'Back to Staff video, so Create needs no card' },
      { key: 'Tab', until: 'file-input', repeat: 10, note: 'Tab to Choose file' },
      { ...pick('notvideo.mp4'), waitFor: MX(`M.kindIn('#source-report') === 'error'`), timeout: 60000, expect: 'file-input', state: MX(`M.previous() && M.el('#step-trim').hidden && !M.el('#step-create').hidden`) },
      { wait: 0, expect: 'file-input', note: 'S-30: unreadable beside the kept result; steps 2-5 withdrawn, the result stays' },
      { ...pick('lecture-360s.mp4'), waitFor: MX('!!M.verdict() && M.create()'), timeout: 120000, expect: 'file-input' },
      { key: 'Tab', untilState: FOCUS_ON(CREATE), repeat: 80, note: 'Tab to Create' },
      { key: 'Enter', state: MX(`M.res() === 'question'`) + ' && ' + FOCUS_ON(QUESTION), note: 'S-58: the discard question takes focus' },
      { key: 'Tab', untilState: FOCUS_ON('#process-result .button--danger'), repeat: 3, note: 'Tab to Discard it and start again' },
      { key: 'Enter', waitFor: MX('M.running()'), timeout: 60000, state: FOCUS_ON(CANCEL), note: 'S-60, S-48: discarded; the new job runs; Cancel has focus' },
      { key: 'Tab', shift: true, until: 'video-kind=', repeat: 120, state: MX('M.running()'), note: 'Shift+Tab to Video type while the job runs' },
      { key: 'ArrowRight', state: MX(`M.running() && M.checked('video-kind') === 'submission' && M.vis('#video-next') && M.has('videoKind.options.staff', '#process-job')`), expect: 'video-kind=submission', note: 'S-50: switched while running; the job keeps Staff video' },
      { waitFor: MX('M.finished()'), timeout: 600000, expect: 'video-kind=', note: 'S-53: finished; focus stays on the radio, where the person is' },
    ],
  },
}

export const PLANS = {
  pilot: () => [
    ...['S-03', 'S-15', 'S-76'].flatMap((id) => ['light', 'dark', 'forced-light'].map((mode) => ({ id, lang: 'en-GB', view: 'w1280', mode }))),
    { id: 'K-dialog', lang: 'en-GB', view: 'w1280', mode: 'light' },
  ],
  // The pilot widened (VH-171's second chat): every mode at 1280, every view
  // and enlargement record, the dialog enlarged, and a second language.
  pilot2: () => [
    ...['S-03', 'S-15', 'S-76'].flatMap((id) => ['light', 'dark', 'forced-light', 'forced-dark', 'spacing', 'reduced-motion', 'fallback', 'font32'].map((mode) => ({ id, lang: 'en-GB', view: 'w1280', mode }))),
    ...['S-03', 'S-15'].flatMap((id) => ['w375', 'w320', 'landscape', 'short', 'zoom200proxy', 'zoom400proxy'].map((view) => ({ id, lang: 'en-GB', view, mode: 'light' }))),
    ...['w320', 'zoom200proxy', 'zoom400proxy'].map((view) => ({ id: 'S-76', lang: 'en-GB', view, mode: 'light' })),
    ...['S-03', 'S-15', 'S-76'].map((id) => ({ id, lang: 'zh-Hans', view: 'w1280', mode: 'light' })),
    { id: 'K-dialog', lang: 'en-GB', view: 'w1280', mode: 'light' },
  ],
}

// ---------------------------------------------------------------------------
const LANGS = ['en-GB', 'zh-Hans', 'ms-MY']
const LIGHT_VIEWS = ['w1280', 'w375', 'w320']
const FINITE = ['S-03', 'S-24', 'S-16', 'S-41', 'S-48', 'S-53', 'S-63', 'S-58', 'S-56', 'S-76', 'S-81']
const FINITE_MODES = ['dark', 'forced-light', 'forced-dark', 'spacing', 'reduced-motion', 'fallback', 'font32']
const FINITE_VIEWS = ['landscape', 'short', 'zoom200proxy', 'zoom400proxy']
// VH-165's long names (six-fix contract cases): also under 1.4.12's text spacing, at every light view.
const LONG_NAMES = ['S-53-W', 'S-53-LW', 'S-58-W', 'S-58-LW', 'S-63-W', 'S-63-LW']
const J = ['J1', 'J2', 'J3', 'J4']
const okLang = (id, lang) => !SCENARIOS[id].langs || SCENARIOS[id].langs.includes(lang)
const okView = (id, view) => !SCENARIOS[id].views || SCENARIOS[id].views.includes(view)
// VH-198: S-154 is in SOURCE_ONLY, not SCENARIOS, so it is never walked.
const scenarioIds = () => Object.keys(SCENARIOS).filter((id) => !SCENARIOS[id].fixOnly)

PLANS.matrix = () => [
  ...scenarioIds().flatMap((id) => LANGS.filter((lang) => okLang(id, lang)).flatMap((lang) => LIGHT_VIEWS.filter((view) => okView(id, view)).map((view) => ({ id, lang, view, mode: 'light' })))),
  ...FINITE.flatMap((id) => LANGS.flatMap((lang) => [
    ...FINITE_MODES.map((mode) => ({ id, lang, view: 'w1280', mode })),
    ...FINITE_VIEWS.map((view) => ({ id, lang, view, mode: 'light' })),
  ])),
  ...LONG_NAMES.flatMap((id) => LANGS.flatMap((lang) => LIGHT_VIEWS.map((view) => ({ id, lang, view, mode: 'spacing' })))),
  ...J.flatMap((id) => [...LANGS.map((lang) => ({ id, lang, view: 'w1280', mode: 'light' })), { id, lang: 'en-GB', view: 'w320', mode: 'light' }]),
  { id: 'K-dialog', lang: 'en-GB', view: 'w1280', mode: 'light' },
]
// Each scenario once (where it exists: S-05 in Chinese, S-26 at 375 px), and each route once.
PLANS.smoke = () => [
  ...scenarioIds().map((id) => ({ id, lang: okLang(id, 'en-GB') ? 'en-GB' : SCENARIOS[id].langs[0], view: okView(id, 'w1280') ? 'w1280' : SCENARIOS[id].views[0], mode: 'light' })),
  ...[...J, 'K-dialog'].map((id) => ({ id, lang: 'en-GB', view: 'w1280', mode: 'light' })),
]

// ---------------------------------------------------------------------------
// VH-172's reduction (evidence/measurements/matrix-2026-10-23.md): the
// priority plan, about three hours, in parts that resume. PLANS.matrix stays
// declared for a later run to fill what this leaves.
// Scenarios whose text is long or varies with the language: warnings,
// failures, the dialog, the statement and system check, the title and ID
// fields, results, the toggletip, choice details and the footer.
const TEXT = ['S-05', 'S-10', 'S-15', 'S-17', 'S-18', 'S-19', 'S-20', 'S-22', 'S-23', 'S-27', 'S-28', 'S-29', 'S-30', 'S-31', 'S-37a', 'S-38', 'S-45a', 'S-47b', 'S-54a', 'S-55a', 'S-55c', 'S-62', 'S-64', 'S-69', 'S-73', 'S-75', 'S-77', 'S-78', 'S-78k', 'S-79a', 'S-79b', 'S-80a', 'S-80b', 'S-82', 'S-83', 'S-89', 'S-91']
const BASE = ['en-GB', 'w1280']
const ALL_CELLS = LANGS.flatMap((lang) => LIGHT_VIEWS.map((view) => [lang, view])).filter(([l, v]) => l !== BASE[0] || v !== BASE[1])
// The phone view is left to the finite list and a few (PHONE): 320 px is the stricter reflow.
const TEXT_CELLS = ALL_CELLS.filter(([, v]) => v !== 'w375')
const PHONE = ['S-15', 'S-82', 'S-83']
// About two minutes a setup each (a long still's estimate, an encode under way): fewer cells.
const HEAVY = ['S-24', 'S-48']
const HEAVY_CELLS = [['zh-Hans', 'w1280'], ['ms-MY', 'w320'], ['en-GB', 'w320']]
const HEAVY_VIEWS = ['zoom400proxy']
// VH-169: the controls pressed, by scenario, at 1280 px; the modes and languages they are pressed in.
const PRESSED = {
  'S-03': ['#file-input', '#feedback-open'],
  'S-15': [CREATE, '#file-input', '#trim-set-start', '#trim-clear'],
  'S-53': [SAVE, CREATE],
  'S-58': ['#process-result .button--danger', '#process-result .button--secondary'],
  'S-62': [SAVE],
  'S-76': [SUBMIT, '#feedback-copy'],
}
const PRESSED_MODES = ['light', 'dark', 'forced-light', 'forced-dark']
const PRESSED_LANGS = { 'S-15': LANGS, 'S-58': LANGS }
// VH-166 and VH-167: type, measure and the footer with fallback faces and the 32 px default font.
const TYPE_SET = ['S-07', 'S-15', 'S-17', 'S-39', 'S-47b', 'S-82', 'S-83']
const rec = (id, lang, view, mode) => ({ id, lang, view, mode })
PLANS.priority = () => {
  const out = new Map()
  const add = (r) => { if (SCENARIOS[r.id] && (!okLang(r.id, r.lang) || !okView(r.id, r.view))) return; const k = [r.id, r.lang, r.view, r.mode].join('|'); if (!out.has(k)) out.set(k, r) }
  // Every scenario once in its base cell, as smoke: Phase 7's (VH-198 keeps part 1 frozen).
  for (const r of PLANS.smoke()) if (PHASE7_IDS.has(r.id) || ROUTES[r.id]) add(r)
  // Language and width for layout- and text-dependent scenarios, light.
  for (const id of FINITE) for (const [lang, view] of HEAVY.includes(id) ? HEAVY_CELLS : ALL_CELLS) add(rec(id, lang, view, 'light'))
  for (const id of TEXT) for (const [lang, view] of TEXT_CELLS) add(rec(id, lang, view, 'light'))
  for (const id of PHONE) add(rec(id, 'en-GB', 'w375', 'light'))
  // The finite list: every mode at 1280 in English; colour and focus in Chinese for five; the reflow views in English.
  for (const id of FINITE) for (const mode of FINITE_MODES) add(rec(id, 'en-GB', 'w1280', mode))
  for (const id of ['S-03', 'S-53', 'S-56', 'S-76', 'S-81']) for (const mode of ['dark', 'forced-light', 'forced-dark']) add(rec(id, 'zh-Hans', 'w1280', mode))
  for (const id of FINITE) for (const view of HEAVY.includes(id) ? HEAVY_VIEWS : FINITE_VIEWS) add(rec(id, 'en-GB', view, 'light'))
  // The six-fix cells. VH-165: the long names and the long ID in every language and light view, with and without spacing; colour at 320.
  for (const id of [...LONG_NAMES, 'S-ID1']) {
    for (const lang of LANGS) for (const view of LIGHT_VIEWS) for (const mode of ['light', 'spacing']) add(rec(id, lang, view, mode))
    for (const mode of ['dark', 'forced-light', 'forced-dark']) add(rec(id, 'en-GB', 'w320', mode))
  }
  // VH-165's thumb rings and VH-169's presses in both forced palettes and dark.
  for (const [id, langs] of Object.entries({ ...Object.fromEntries(Object.keys(PRESSED).map((id) => [id, ['en-GB']])), ...PRESSED_LANGS }))
    for (const lang of langs) for (const mode of lang === 'en-GB' ? PRESSED_MODES : ['light']) add(rec(id, lang, 'w1280', mode))
  // VH-166 and VH-167: fallback faces and the 32 px font in English and Chinese; the toggletip at 200 %; the footer wrapping at 375 px.
  for (const id of TYPE_SET) for (const lang of ['en-GB', 'zh-Hans']) for (const mode of ['fallback', 'font32']) add(rec(id, lang, 'w1280', mode))
  for (const lang of ['en-GB', 'zh-Hans']) add(rec('S-17', lang, 'zoom200proxy', 'light'))
  for (const lang of ['zh-Hans', 'ms-MY']) { add(rec('S-83', lang, 'w375', 'light')); add(rec('S-07', lang, 'w1280', 'light')); add(rec('S-07', lang, 'w320', 'light')) }
  // The keyboard routes: J1-J4 and the dialog in English at 1280; J1 in Chinese and Malay, and at 320.
  for (const id of [...J, 'K-dialog']) add(rec(id, 'en-GB', 'w1280', 'light'))
  for (const lang of ['zh-Hans', 'ms-MY']) add(rec('J1', lang, 'w1280', 'light'))
  add(rec('J1', 'en-GB', 'w320', 'light'))
  return [...out.values()].map((r) => (PRESSED[r.id] && r.view === 'w1280' && PRESSED_MODES.includes(r.mode) && (PRESSED_LANGS[r.id] ?? ['en-GB']).includes(r.lang) && (r.lang === 'en-GB' || r.mode === 'light') ? { ...r, pressed: PRESSED[r.id] } : r))
}
// The cost of a plan from smoke's timings (seconds): a setup per scenario,
// language, view and fonts; each further mode on it the instruments alone.
const SLOW = { 'S-11': 142, 'S-24': 115, 'S-25a': 140, 'S-25b': 138, 'S-43': 150, 'S-48': 150, 'S-49': 150, 'S-50': 129, 'S-57': 220, 'S-85': 133, 'S-90a': 130, 'S-90b': 141, 'S-52': 25, 'S-60': 68, 'S-61': 53, 'S-65': 55, 'S-66': 62, 'S-72a': 53, J1: 58, J2: 12, J3: 21, J4: 64 }
const groupKey = (r) => [r.id, r.variant ?? '', r.lang, r.view, r.mode === 'fallback'].join('|')
export function estimate(records) {
  const groups = new Map()
  for (const r of records) { const k = groupKey(r); groups.set(k, [...(groups.get(k) ?? []), r]) }
  let s = 0
  for (const recs of groups.values()) {
    const r = recs[0]; const dpr = ['w375', 'landscape', 'zoom200proxy', 'zoom400proxy'].includes(r.view) ? 1.4 : 1
    s += (SLOW[r.id] ?? 12) * dpr + (recs.length - 1) * 6 * dpr + recs.reduce((n, x) => n + (x.pressed?.length ?? 0) * 3, 0)
  }
  return Math.round(s)
}
// Four parts, each a whole set of scenarios, near equal by the estimate.
const PARTS = 4
const parts = () => {
  const all = PLANS.priority()
  const ids = [...new Set(all.map((r) => r.id))]
  const cost = Object.fromEntries(ids.map((id) => [id, estimate(all.filter((r) => r.id === id))]))
  const total = Object.values(cost).reduce((a, b) => a + b, 0)
  const out = Array.from({ length: PARTS }, () => [])
  let p = 0, acc = 0
  for (const id of ids) { if (acc >= (total / PARTS) * (p + 1) && p < PARTS - 1) p++; out[p].push(id); acc += cost[id] }
  return out.map((set) => all.filter((r) => set.includes(r.id)))
}
for (let i = 0; i < PARTS; i++) PLANS[`priority-${i + 1}`] = () => parts()[i]

// VH-179: the three rings, the feedback message's measure and the
// forced-colour hover (V-40, V-41, V-42, V-33, V-44). Every priority record
// of the nine scenarios that show the file button (the 110 its ring failed
// in, digest-focus), then the touched records in three languages and four
// colour modes: the empty page (the chooser, the band's ring), Ready (the
// handles, the chosen chooser, Create) with the 32 px font, the discard
// question (danger), and the feedback dialog's two long drafts with the
// 32 px font, the fallback faces and 320 px. Presses, rest and hover read
// on the primary, the danger button and both chooser looks in every mode.
const V40 = ['S-03', 'S-09', 'S-10', 'S-28', 'S-29', 'S-30', 'S-63', 'S-63-W', 'S-63-LW']
const COLOUR_MODES = ['light', 'dark', 'forced-light', 'forced-dark']
PLANS.vh179 = () => {
  const out = new Map()
  const add = (r) => { if (!okLang(r.id, r.lang) || !okView(r.id, r.view)) return; const k = [r.id, r.lang, r.view, r.mode].join('|'); if (!out.has(k)) out.set(k, r) }
  for (const r of PLANS.priority()) if (V40.includes(r.id)) add({ id: r.id, lang: r.lang, view: r.view, mode: r.mode })
  for (const lang of LANGS) {
    for (const mode of [...COLOUR_MODES, 'font32']) for (const id of ['S-03', 'S-15']) add(rec(id, lang, 'w1280', mode))
    for (const mode of COLOUR_MODES) add(rec('S-58', lang, 'w1280', mode))
    for (const id of ['S-79a', 'S-79b']) { for (const mode of [...COLOUR_MODES, 'font32', 'fallback']) add(rec(id, lang, 'w1280', mode)); add(rec(id, lang, 'w320', 'light')) }
  }
  const press = { 'S-03': ['#file-input'], 'S-15': [CREATE, '#file-input'], 'S-58': ['#process-result .button--danger'] }
  return [...out.values()].map((r) => (press[r.id] && r.view === 'w1280' && COLOUR_MODES.includes(r.mode) ? { ...r, pressed: press[r.id] } : r))
}

// VH-180: the frame-rate note (V-47). The two sources it is raised for, and
// the records the item names beside them: the empty page, the video type,
// Ready, Video properties, the closings and the finished result; three
// languages, the four colour modes at 1280 and light at 320 px.
const V47 = ['S-03', 'S-07', 'S-15', 'S-16', 'S-16-45', 'S-16-120', 'S-47a', 'S-47b', 'S-47c', 'S-53']
PLANS.vh180 = () => V47.flatMap((id) => LANGS.flatMap((lang) => [...COLOUR_MODES.map((mode) => rec(id, lang, 'w1280', mode)), rec(id, lang, 'w320', 'light')])).filter((r) => okLang(r.id, r.lang) && okView(r.id, r.view))

// VH-181: step 4's one name (V-45). The records that draw step 4's heading
// and legend: Ready, the onset help open, each closing (None, Cut, Fade,
// Slide) and the finished result; three languages, the four colour modes
// at 1280 and light at 320 px. No new scenario.
const V45 = ['S-15', 'S-17', 'S-46', 'S-47a', 'S-47b', 'S-47c', 'S-53']
PLANS.vh181 = () => V45.flatMap((id) => LANGS.flatMap((lang) => [...COLOUR_MODES.map((mode) => rec(id, lang, 'w1280', mode)), rec(id, lang, 'w320', 'light')])).filter((r) => okLang(r.id, r.lang) && okView(r.id, r.view))
// Codex astra's must (VH-181): every other scenario that draws step 4, the
// 82 whose VH-172 priority records hold the heading, once in each language,
// light, at 320 px (or the scenario's own view where it has one).
const V45_REST = ['S-04', 'S-08', 'S-11', 'S-14', 'S-16', 'S-18', 'S-19', 'S-20', 'S-21', 'S-22', 'S-23', 'S-24', 'S-25a', 'S-25b', 'S-26a', 'S-26b', 'S-27', 'S-31', 'S-32', 'S-33', 'S-35', 'S-36', 'S-37a', 'S-37b', 'S-38', 'S-39', 'S-40', 'S-41', 'S-42', 'S-43', 'S-44', 'S-45a', 'S-45b', 'S-48', 'S-49', 'S-50', 'S-52', 'S-53-LW', 'S-53-W', 'S-54a', 'S-54b', 'S-54c', 'S-54d', 'S-55a', 'S-55b', 'S-55c', 'S-56', 'S-57', 'S-58', 'S-58-LW', 'S-58-W', 'S-59', 'S-60', 'S-61', 'S-62', 'S-63', 'S-63-LW', 'S-63-W', 'S-64', 'S-65', 'S-66', 'S-67', 'S-68', 'S-69', 'S-70a', 'S-70b', 'S-70c', 'S-71', 'S-72a', 'S-72b', 'S-73', 'S-78k', 'S-85', 'S-87', 'S-88', 'S-89', 'S-90a', 'S-90b', 'S-91', 'S-ID1', 'S-ID2', 'S-ID3']
PLANS['vh181-rest'] = () => V45_REST.flatMap((id) => LANGS.map((lang) => rec(id, lang, SCENARIOS[id].views?.[0] ?? 'w320', 'light'))).filter((r) => okLang(r.id, r.lang) && okView(r.id, r.view))


// ---------------------------------------------------------------------------
// VH-198: pass 3's scenarios S-92 to S-153 (scenarios-2026-10-25.md, "New
// scenarios"), each with the setup, assertions and expectations its row gives.
// A record reaches one final state; a row that is a sequence (keys, faults, a
// flow) runs it in setup and keeps what it saw in `w.obs`, which `asserts`
// judge, so a sequence is evidence in the record and never a pass by default.
// `p8` names the active Phase 8 instruments (phase8.mjs) the record runs;
// the passive ones run in every record. S-154 is source-only (SOURCE_ONLY).
// Narrower languages and views follow the plan's recipes
// (sizing-2026-10-25.mjs): ONE, OUTCOME4, COLOUR12 and S-112's, S-113's,
// S-130's, S-140's and S-144's own.
const P8_CARD = '#process-result > .notification[data-kind="success"]'
const P8_PLAYER = P8_CARD + ' video.result-player'
const EN_1280 = { langs: ['en-GB'], langsWhy: 'the plan\'s recipe ONE: a slow setup, walked once (sizing-2026-10-25.mjs)', views: ['w1280'], viewsWhy: 'the plan\'s recipe ONE' }
const OUTCOME = { views: ['w1280', 'w320'], viewsWhy: 'the plan\'s recipe OUTCOME4: three languages at 1280 px and English at 320 px; a production outcome whose look S-53, S-126 and S-135 measure' }
const AT_1280 = { views: ['w1280'], viewsWhy: 'the plan\'s recipe COLOUR12: three languages at 1280 px in four colour modes' }
const LANG_CYCLE = ['en-GB', 'zh-Hans', 'ms-MY'] // src/config/languages.ts:35, the segments' order
const before = (lang) => LANG_CYCLE[(LANG_CYCLE.indexOf(lang) + 2) % 3] // ArrowRight from it picks `lang`
const anotherLang = (lang) => (lang === 'en-GB' ? 'zh-Hans' : 'en-GB')
const obsOf = (w) => (w.obs = w.obs ?? {})
const brief = (o) => JSON.parse(JSON.stringify(o, (k, v) => (typeof v === 'string' && v.length > 200 ? v.slice(0, 200) + '…' : v)))
/** An assertion on what the setup saw. */
const see = (what, test) => ({ what, fn: async (w) => { const o = obsOf(w); try { const r = await test(o, w); if (r && typeof r === 'object' && 'outcome' in r) return r; return { outcome: r ? 'pass' : 'fail', seen: brief(o) } } catch (e) { return { outcome: 'cannot-determine', why: String(e.message ?? e).slice(0, 160) } } } })
/** A reading kept beside the record, not judged. */
const found = (what, get) => ({ what, fn: async (w) => ({ outcome: 'not-counted', why: 'recorded as found, not judged here', found: brief(await get(obsOf(w), w)) }) })
const X = (what, expr) => ({ what, expr })
const playerSrc = (w) => w.evaluate(`(() => { const v = document.querySelector(${JSON.stringify(P8_PLAYER)}); return v ? v.getAttribute('src') : null })()`)
const fetches = (w, url) => (url ? w.evaluate(`fetch(${JSON.stringify(url)}).then((r) => r.ok, () => false)`) : Promise.resolve(false))
const markPlayer = (w) => w.evaluate(`(window.__p0 = document.querySelector(${JSON.stringify(P8_PLAYER)}), !!window.__p0)`)
const SAME_PLAYER = `!!window.__p0 && document.querySelector(${JSON.stringify(P8_PLAYER)}) === window.__p0`
const CREATE_READS = (path, secondary) => `M.is('${path}', '#process-actions > button:nth-child(2)') && M.btn(2).classList.contains('button--secondary') === ${secondary}`
const SAVED = `M.res() === 'result' && M.saveBtn().disabled && M.has('status.saved', '#save-status')`
const readHandle = (w, id) => w.evaluate(`(() => { const r = document.getElementById('${id}'); return { v: Math.round(r.valueAsNumber * 1000) / 1000, text: r.getAttribute('aria-valuetext'), focused: document.activeElement === r } })()`)
/** Keys on a trim handle, each reading kept; the first press's withdrawal read at once. */
async function handleKeys(w, id, keys) {
  await focusByKeyboard(w, '#' + id)
  const out = [{ key: 'start', ...(await readHandle(w, id)) }]
  for (const k of keys) {
    await w.press(k)
    const r = { key: k, ...(await readHandle(w, id)) }
    if (out.length === 1) r.atOnce = await mx(w, `({ verdict: !!M.verdict(), stop: M.checking() })`)
    out.push(r)
  }
  return out
}
const vals = (steps) => steps.map((s) => s.v)
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
/** The page language set by setup, without moving focus (a programmatic change, recorded as setup). */
const setPageLanguage = async (w, tag) => { await w.evaluate(`(() => { const r = document.querySelector('#language-switcher input[value="${tag}"]'); if (r.checked) return; r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); })()`); await sleep(400) }
const STATUS_SINCE = (t) => `(() => { const want = window.__mx.msg('status.checking'); return window.__p8.status.filter((s) => s.t > ${t} && s.text === want).length })()`
const focusIs = (sel) => `document.activeElement === document.querySelector(${JSON.stringify(sel)})`
const activeDesc = (w) => w.evaluate(`(() => { const a = document.activeElement; if (!a || a === document.body) return 'body'; return a.id ? '#' + a.id : a.tagName.toLowerCase() + (a.name ? '[name=' + a.name + ']' : '') + (a.type === 'radio' ? '=' + a.value : '') + (a.matches && a.matches(${JSON.stringify(P8_CARD)}) ? ' (the card)' : ''); })()`)
const tipState = (w, id) => w.evaluate(`(() => { const t = document.getElementById('${id}'); const b = document.getElementById('${id}-button'); return { open: !!t && !t.hidden, expanded: b && b.getAttribute('aria-expanded') }; })()`)
const fade = async (w) => { await w.select('#closing-type', 'fade'); await w.waitSettled() }
/** A finished job beside which the player stands, its element marked and its URL kept. */
async function finishedWithPlayer(w, lang, file = 'short-2s.mp4', beforeCreate) {
  await finished(w, lang, file, beforeCreate)
  await markPlayer(w)
  obsOf(w).src = await playerSrc(w)
}
async function untilDone(w, label, timeout = 600000) { await until(w, `M.finished() || M.res() === 'failure'`, label, timeout); await sleep(400) }
/**
 * VH-213: the finished video's tracks, from the bytes the card's player holds
 * (VH-192), read by ffprobe, so the card stays as found: nothing is saved.
 * `null` when no player stands, as beside a failure.
 */
export async function outputTracks(w) {
  const b64 = await w.evaluate(`(async () => { const v = document.querySelector(${JSON.stringify(P8_PLAYER)}); const src = v && v.getAttribute('src'); if (!src) return null; const b = new Uint8Array(await (await fetch(src)).arrayBuffer()); let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); })()`)
  if (!b64) return null
  const file = join(w.dir, 'output-tracks.mp4')
  writeFileSync(file, Buffer.from(b64, 'base64'))
  const kinds = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type', '-of', 'json', file], { encoding: 'utf8' })).streams.map((x) => x.codec_type)
  return { video: kinds.filter((k) => k === 'video').length, audio: kinds.filter((k) => k === 'audio').length, other: kinds.filter((k) => k !== 'video' && k !== 'audio').length }
}
/** VH-213: before Create, the whole video's too-little note, and no other no-audio note or ends-early. */
export const WHOLE_NOTE = `M.kindIn('#audio-warnings') === 'warning' && M.has('warnings.wholeTooLittleAudio.heading', '#audio-warnings') && !M.has('warnings.keptTooLittleAudio.heading', '#audio-warnings') && !M.has('warnings.noAudio.heading', '#audio-warnings') && !M.has('warnings.endsEarly.heading', '#audio-warnings')`
const HEAVY_TITLE = `M.msg('warnings.heavyLimiting.heading')`
const META_TITLE = `M.msg('warnings.metadataLost.heading')`
const WARN_TEXT = `(() => { const b = window.__p8.warnBox(); return b ? b.textContent.replace(/\\s+/g, ' ') : '' })()`

// ---------------------------------------------------------------------------
// Codex astra's method check, M-04: what a scenario promises after its state,
// run by matrix.mjs once that state is measured and kept, and recorded as the
// record's `subresults` instrument (`when` names the records it holds for).

/** S-132, S-152: once the failed player is measured, Save pressed and completed as S-62, the file written (its bytes read from the stub's store). */
async function saveAfterFailedPlayer(w) {
  const o = obsOf(w)
  const read = () => w.evaluate(`(async () => { const M = window.__mx; const v = document.querySelector(${JSON.stringify(P8_PLAYER)}); const s = window.__audit.saves.at(-1); let bytes = null; try { const d = await (await navigator.storage.getDirectory()).getDirectoryHandle('audit-saves'); bytes = (await (await d.getFileHandle(s.name)).getFile()).size } catch (e) { bytes = null } return { mediaError: v && v.error ? v.error.code : null, saveEnabled: !!M.saveBtn() && !M.saveBtn().disabled, saves: window.__audit.saves.length, name: s ? s.name : null, bytes, status: M.text('#save-status').replace(/\\s+/g, ' ').trim(), warn: ${WARN_TEXT} } })()`)
  o.beforeSave = await read()
  await saveWith(w)
  // Either outcome ends the wait (a refused save is S-69's error line); the assertions say which it was.
  await until(w, `(${SAVED} && !M.saving()) || M.kindIn('#save-error') === 'error'`, 'the save completed or failed', 300000)
  await sleep(400)
  o.afterSave = await read()
}
const SAVE_AFTER_FAILED_PLAYER = [
  see('the failed player stood when Save was pressed: its MediaError recorded, Save enabled', (o) => ({ outcome: o.beforeSave.mediaError && o.beforeSave.saveEnabled ? 'pass' : 'fail', mediaError: o.beforeSave.mediaError, saveEnabled: o.beforeSave.saveEnabled })),
  X('Save completes as S-62: "Saved.", Save disabled, not saving, no lifetime line', `M.res() === 'result' && M.saveBtn().disabled && !M.saving() && M.has('status.saved', '#save-status') && !M.lifetime('result.lifetime')`),
  see('the saved file written: one save more, its bytes over zero', (o) => ({ outcome: o.afterSave.saves === o.beforeSave.saves + 1 && o.afterSave.bytes > 0 ? 'pass' : 'fail', file: o.afterSave.name, bytes: o.afterSave.bytes, saves: [o.beforeSave.saves, o.afterSave.saves], status: o.afterSave.status })),
]
export const SAVE_AFTER_FAILED_PLAYER_SUB = { what: 'once the failed player is measured, Save completes as S-62 (scenarios file, S-132 and S-152)', run: saveAfterFailedPlayer, asserts: SAVE_AFTER_FAILED_PLAYER }

/** Where focus stands: inside the open dialog or not, its box in the window, and the middle of what shows uncovered (read where it is; the browser's own scroll on focus allowed). */
const FOCUS_SEEN = `(() => { const a = document.activeElement; if (!a || a === document.body) return { el: 'body', seen: false }; const r = a.getBoundingClientRect(); const x0 = Math.max(0, r.left), y0 = Math.max(0, r.top), x1 = Math.min(innerWidth, r.right), y1 = Math.min(innerHeight, r.bottom); const shows = x1 - x0 >= 1 && y1 - y0 >= 1; let covered = null; if (shows) { const e = document.elementFromPoint((x0 + x1) / 2, (y0 + y1) / 2); covered = !(e && (e === a || a.contains(e))); } return { el: window.__audit.desc(a).slice(0, 80), id: a.id || null, tag: a.tagName.toLowerCase(), type: a.type || null, inDialog: !!a.closest('dialog[open]'), box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], window: [innerWidth, innerHeight], shows, covered, seen: shows && covered === false }; })()`
const DIALOG_OPEN = `!!document.querySelector('dialog#feedback-dialog[open]')`
const DIALOG_TEXT = 'Checked at enlargement.'
/**
 * S-76 at enlargement: Report a problem's dialog left by Escape, its opener
 * reached by keys (Shift+Tab, Tab), entered by Enter, used (typed, each
 * control by Tab, the email handed off) and left by Close, by keys. Escape
 * leaves the dialog the record measured, behind which the instruments
 * scrolled the page to its top, and the HTML standard returns focus without
 * scrolling: so Escape is held to where focus went, and Close, after the
 * opener was reached by keys, to where it went and that it is in view.
 */
async function dialogByKeys(w) {
  const o = obsOf(w)
  const d = (o.dialog = {})
  const at = () => w.evaluate(FOCUS_SEEN)
  const open = () => w.evaluate(DIALOG_OPEN)
  await key(w, 'Escape'); await sleep(300)
  d.escape = { open: await open(), onOpener: await w.evaluate(FOCUS_ON('#feedback-open')), focus: await at() }
  await key(w, 'Tab', { shift: true }); await sleep(150); await key(w, 'Tab'); await sleep(250)
  d.opener = { onOpener: await w.evaluate(FOCUS_ON('#feedback-open')), focus: await at() }
  // Where focus was lost, the opener is focused for the steps that follow; the entry row has already failed.
  if (!d.opener.onOpener) await focusByKeyboard(w, '#feedback-open')
  await key(w, 'Enter'); await sleep(400)
  d.enter = { open: await open(), onMessage: await w.evaluate(FOCUS_ON('#feedback-message')), focus: await at() }
  await w.page.send('Input.insertText', { text: DIALOG_TEXT }); await sleep(150)
  d.typed = await w.evaluate(`document.getElementById('feedback-message').value`)
  d.stops = []
  for (let i = 0; i < 8; i++) { await key(w, 'Tab'); await sleep(150); const f = await at(); d.stops.push(f); if (f.id === 'feedback-close' || !f.inDialog) break }
  try {
    await tabUntil(w, FOCUS_ON(SUBMIT), { shift: true, max: 6 })
    const before = await mx(w, 'M.mailto.length')
    await key(w, 'Enter'); await sleep(600)
    d.handoff = { mailto: (await mx(w, 'M.mailto.length')) > before, opened: await mx(w, `M.has('feedback.opened', '#feedback-status')`), open: await open(), focus: await at() }
  } catch (e) { d.handoff = { error: String(e.message ?? e).slice(0, 160) } }
  try {
    await tabUntil(w, FOCUS_ON('#feedback-close'), { max: 6 })
    d.closeFocus = await at()
    await key(w, 'Enter'); await sleep(300)
    d.close = { open: await open(), onOpener: await w.evaluate(FOCUS_ON('#feedback-open')), focus: await at() }
  } catch (e) { d.closeFocus = { error: String(e.message ?? e).slice(0, 160) }; d.close = { open: await open(), focus: await at() } }
}
const STOPS = [['What will be sent', (f) => f.tag === 'summary'], ['Open email app', (f) => f.type === 'submit'], ['Copy message and details', (f) => f.id === 'feedback-copy'], ['Close', (f) => f.id === 'feedback-close']]
export const DIALOG_ENLARGED_SUB = {
  what: "Report a problem's dialog operated by keys where it stands enlarged: left by Escape, entered by Enter, used, left by Close (M-04; the plan's enlargement: content and function, dialogs included)",
  when: (r) => r.mode === 'font32' || (r.mode === 'light' && ['w320', 'zoom200proxy', 'zoom400proxy'].includes(r.view)),
  run: dialogByKeys,
  asserts: [
    see('exit by Escape: the dialog closes; focus back on Report a problem (where the page stands is the instruments\' scroll, so not judged here)', (o) => ({ outcome: !o.dialog.escape.open && o.dialog.escape.onOpener ? 'pass' : 'fail', ...o.dialog.escape })),
    see('entry by keys: Report a problem reached by Shift+Tab and Tab, in the window and uncovered; Enter opens the dialog; focus on the message field, inside it, in the window and uncovered', (o) => ({ outcome: o.dialog.opener.onOpener && o.dialog.opener.focus.seen && o.dialog.enter.open && o.dialog.enter.onMessage && o.dialog.enter.focus.inDialog && o.dialog.enter.focus.seen ? 'pass' : 'fail', opener: o.dialog.opener, ...o.dialog.enter })),
    see('use: the message typed where focus stood reads back', (o) => ({ outcome: o.dialog.typed === DIALOG_TEXT ? 'pass' : 'fail', typed: o.dialog.typed })),
    see('use: Tab reaches What will be sent, Open email app, Copy message and details and Close, each inside the dialog, in the window and uncovered', (o) => { const s = o.dialog.stops; const missing = STOPS.filter(([, is]) => !s.some(is)).map(([n]) => n); const bad = s.filter((f) => !f.inDialog || !f.seen); return { outcome: !missing.length && !bad.length ? 'pass' : 'fail', missing, notSeen: bad, stops: s.map((f) => `${f.el} ${JSON.stringify(f.box)} ${f.seen ? 'seen' : 'NOT SEEN'}`) } }),
    see('use: Open email app, by Enter, hands the message to the email app ("opened" said), the dialog still open', (o) => ({ outcome: o.dialog.handoff.mailto && o.dialog.handoff.opened && o.dialog.handoff.open ? 'pass' : 'fail', ...o.dialog.handoff })),
    see('exit by Close: Close in the window and uncovered; the dialog closes; focus back on Report a problem, in the window and uncovered', (o) => ({ outcome: o.dialog.closeFocus.seen && !o.dialog.close.open && o.dialog.close.onOpener && o.dialog.close.focus.seen ? 'pass' : 'fail', closeFocus: o.dialog.closeFocus, ...o.dialog.close })),
  ],
}

/** S-149's light records (V-46, VH-178): a readable file read, focus put on a Video language radio by keys, then an unreadable replacement chosen; where focus goes. */
export async function readFailureBranch(w, file = 'notvideo.mp4') {
  const o = obsOf(w)
  await w.setFiles(F('lecture-30s.mp4')); await w.waitSettled()
  await until(w, 'M.verdict()', 'a verdict on the readable file', 120000)
  await focusByKeyboard(w, RADIO_VLANG)
  const placedOn = await activeDesc(w)
  const shownBefore = await mx(w, `({ trim: !M.el('#step-trim').hidden, title: !M.el('#step-title').hidden })`)
  const mark = await focusMark(w)
  await w.setFiles(F(file)); await w.waitSettled()
  await until(w, `M.kindIn('#source-report') === 'error' || M.kindIn('#source-block') === 'error' || !!M.verdict()`, 'the replacement read', 120000); await sleep(400)
  const read = await mx(w, `({ unreadable: M.kindIn('#source-report') === 'error', block: M.kindIn('#source-block'), verdict: !!M.verdict(), trimHidden: M.el('#step-trim').hidden, titleHidden: M.el('#step-title').hidden })`)
  o.readFailure = { file, placedOn, shownBefore, read, branch: /video-language/.test(placedOn) && shownBefore.title && read.unreadable && read.trimHidden && read.titleHidden, focus: await readFocus(w, mark, '#file-input') }
}
export const READ_FAILURE_SUB = {
  what: "the read-failure branch (Codex astra's blind review V-46, VH-178): an unreadable replacement chosen while a Video language radio has focus; where focus goes",
  when: (r) => r.mode === 'light',
  run: (w) => readFailureBranch(w),
  asserts: [
    see('reached: lecture-30s.mp4 read, focus on a Video language radio in the shown step 3, notvideo.mp4 chosen; the read fails and the setup steps are withdrawn', (o) => ({ outcome: o.readFailure.branch ? 'pass' : 'cannot-determine', ...(o.readFailure.branch ? {} : { why: 'the read-failure branch was not reached' }), placedOn: o.readFailure.placedOn, shownBefore: o.readFailure.shownBefore, read: o.readFailure.read })),
    see('focus handed to the file input, the chooser that stays, never lost to the page (2.4.3; the hand-off S-149 asserts for a block)', (o) => (o.readFailure.branch ? { outcome: o.readFailure.focus.landed ? 'pass' : 'fail', focus: o.readFailure.focus.el, moves: o.readFailure.focus.moves, inView: o.readFailure.focus.inView } : { outcome: 'cannot-determine', why: 'the read-failure branch was not reached' })),
  ],
}

// ---------------------------------------------------------------------------
// VH-207 (V-46, WCAG 2.4.3): the read-failure branch's variants (a) to (f),
// declared, proved and kept for VH-203. Each is a scenario of its own,
// S-149a to S-149f, kept out of the pass's frozen plans (fixOnly: parts.mjs,
// PLANS.matrix and smoke) and walked by VH-207's own plan in every colour
// mode, unlike READ_FAILURE_SUB (S-149's, light only, as it is). Its setup is
// the empty page (F20 set first for (c)); its subresults, which run in each
// record's own mode once the page is measured (`when` holds for every record,
// so each has a setup of its own), walk the variant by keys and read where
// focus went before any instrument moves it.
const VH207_ON = `(() => { const a = document.activeElement; return !a || a === document.body ? 'body' : window.__audit.desc(a).slice(0, 80); })()`
const VH207_STEPS = MX(`({ trim: !M.el('#step-trim').hidden, title: !M.el('#step-title').hidden, create: !M.el('#step-create').hidden, result: M.res(), dialog: ${DIALOG_OPEN} })`)
const VH207_READ = MX(`({ unreadable: M.kindIn('#source-report') === 'error', tookTooLong: M.has('failure.unreadable.tookTooLong', '#source-report'), block: M.kindIn('#source-block'), verdict: !!M.verdict(), trimHidden: M.el('#step-trim').hidden, titleHidden: M.el('#step-title').hidden, createShown: !M.el('#step-create').hidden, result: M.res(), saveShown: !!M.saveBtn() && M.vis(M.saveBtn()), newSave: !!M.saveBtn() && M.saveBtn() !== window.__vh207was, dialog: ${DIALOG_OPEN} })`)
/** VH-207: a selector for the focused element, so its ring is read as the focus instrument reads one: its id, a radio by name and value, Save, or else a mark on it. */
const VH207_FOCUSED = `(() => { const a = document.activeElement; if (!a || a === document.body) return null; if (a.id) return '#' + CSS.escape(a.id); if (a.type === 'radio' && a.name) return 'input[name="' + a.name + '"][value="' + a.value + '"]'; if (a.matches(${JSON.stringify(SAVE)})) return ${JSON.stringify(SAVE)}; a.setAttribute('data-vh207-focus', ''); return '[data-vh207-focus]'; })()`
const VH207_LEDE = '.lede p[data-i18n="lede.privacy"]'
/**
 * VH-207: where focus stands once a variant's read has ended, read before any
 * instrument moves it: the element and its moves (2.4.3), what shows of it
 * (FOCUS_SEEN; 2.4.11, 2.4.12) and the source status line (4.1.3); then its
 * ring by pixels as the focus instrument reads one (focusArea, which blurs it
 * and puts focus back on it; 2.4.13); then one Tab, and where it lands.
 */
async function vh207FocusNow(w, mark, successor) {
  const r = { focus: await readFocus(w, mark, successor), seen: await w.evaluate(FOCUS_SEEN) }
  r.status = { text: String(await mx(w, `M.text('#source-status')`)).replace(/\s+/g, ' ').trim(), failure: await mx(w, `M.has('failure.unreadable', '#source-status')`), tookTooLong: await mx(w, `M.has('failure.unreadable.tookTooLong', '#source-status')`) }
  const sel = await w.evaluate(VH207_FOCUSED)
  if (sel) {
    const f = await focusArea(w, sel, sel === FILE.sel ? { ref: FILE.ref } : {})
    r.ring = { sel, outcome: f.outcome, why: f.why, focusVisible: f.focusVisible, areaAt3to1: f.areaAt3to1, perimeter2px: f.perimeter2px, bestRatio: f.bestRatio, changedAny: f.changedAny, controlPx: f.controlPx, paintedPx: f.paintedPx, back: await w.evaluate(`document.activeElement === document.querySelector(${JSON.stringify(sel)})`) }
  } else r.ring = { outcome: 'not-applicable', why: 'focus on the body: no ring to read' }
  await key(w, 'Tab'); await sleep(150)
  r.nextTab = await w.evaluate(FOCUS_SEEN)
  return r
}
/**
 * VH-207: a variant walked by keys: lecture-30s.mp4 read to a verdict (for
 * (d) and (e), its video then made), focus placed (`place`), notvideo.mp4
 * chosen, `pending` run while its read is under way, the read's end awaited,
 * and focus read at once. Without `pending`, the steps are readFailureBranch's.
 */
async function vh207Variant(w, v) {
  const o = obsOf(w)
  const ran = ((o.vh207 = o.vh207 ?? {})[v.key] = {})
  await w.setFiles(F('lecture-30s.mp4')); await w.waitSettled()
  await until(w, 'M.verdict()', 'a verdict on the readable file', 120000)
  if (v.made) { await create(w); await w.waitRunning(); await w.waitFinished(); ran.made = await mx(w, 'M.finished()') }
  ran.placed = (await v.place(w)) ?? null
  ran.placedOn = await activeDesc(w)
  ran.before = await w.evaluate(VH207_STEPS)
  // At the choosing: read in the change event as it bubbles to the document,
  // after the page's own handler on the chooser has run (clearTrim('reading'),
  // the result re-rendered) and before the inspection can answer, which for
  // notvideo.mp4 is within milliseconds.
  await w.evaluate(`(() => { window.__vh207was = document.activeElement; window.__vh207at = null; document.addEventListener('change', (e) => { if (window.__vh207at || !e.target || e.target.id !== 'file-input') return; window.__vh207at = { on: ${VH207_ON}, same: document.activeElement === window.__vh207was, wasConnected: !!window.__vh207was && window.__vh207was.isConnected, trimStartDisabled: document.getElementById('trim-start-range').disabled }; }); })()`)
  let mark = await focusMark(w)
  const t0 = Date.now()
  await w.setFiles(F('notvideo.mp4'))
  ran.atChoosing = await w.evaluate('window.__vh207at')
  if (v.pending) { ran.pending = await v.pending(w); mark = await focusMark(w) } else await w.waitSettled()
  await until(w, `M.kindIn('#source-report') === 'error' || M.kindIn('#source-block') === 'error' || !!M.verdict()`, 'the replacement read', v.pending ? 200000 : 120000); await sleep(400)
  ran.readMs = Date.now() - t0
  ran.read = await w.evaluate(VH207_READ)
  ran.f20 = (w.faultsSeen ?? []).filter((f) => f.startsWith('F20: withheld'))
  ran.after = await vh207FocusNow(w, mark, v.successor)
  ran.reached = !!v.reached(ran)
  ran.landed = v.landed ? !!v.landed(ran) : ran.after.focus.landed
}
const VH207_VARIANTS = {
  a: { key: 'a', successor: '#file-input', place: (w) => focusByKeyboard(w, RADIO_VLANG),
    reached: (r) => /video-language/.test(r.placedOn) && r.before.title && r.read.unreadable && !r.read.tookTooLong && r.read.trimHidden && r.read.titleHidden },
  b: { key: 'b', successor: '#file-input',
    place: async (w) => { await focusByKeyboard(w, '#trim-start-range'); return { enabled: !(await w.evaluate(`document.getElementById('trim-start-range').disabled`)) } },
    reached: (r) => /trim-start-range/.test(r.placedOn) && r.placed?.enabled && r.atChoosing?.trimStartDisabled && r.read.unreadable && !r.read.tookTooLong && r.read.trimHidden && r.read.titleHidden },
  c: { key: 'c', successor: '#file-input', place: (w) => focusByKeyboard(w, '#file-input'),
    pending: async (w) => {
      const now = () => mx(w, `({ reading: !M.kindIn('#source-report') && !M.kindIn('#source-block') && M.has('choose.reading', '#source-status'), title: !M.el('#step-title').hidden })`)
      const p = { before: await now() }
      try { p.presses = await tabUntil(w, FOCUS_ON(RADIO_VLANG), { max: 30 }) } catch (e) { p.error = String(e.message ?? e).slice(0, 160) }
      p.on = await activeDesc(w); p.after = await now()
      return p
    },
    reached: (r) => r.f20.length > 0 && r.placedOn === '#file-input' && r.pending.before.reading && r.pending.before.title && /video-language/.test(r.pending.on) && r.pending.after.reading && r.pending.after.title && r.read.unreadable && r.read.tookTooLong && r.read.trimHidden && r.read.titleHidden },
  d: { key: 'd', successor: '#file-input', made: true, place: (w) => focusByKeyboard(w, RADIO_VLANG),
    reached: (r) => r.made && /video-language/.test(r.placedOn) && r.before.title && r.read.unreadable && !r.read.tookTooLong && r.read.trimHidden && r.read.titleHidden && r.read.createShown && r.read.result === 'result' && r.read.saveShown },
  e: { key: 'e', successor: SAVE, made: true,
    place: async (w) => { await focusByKeyboard(w, SAVE); return { onSave: await w.evaluate(FOCUS_ON(SAVE)) } },
    reached: (r) => r.made && r.placed?.onSave && r.atChoosing?.wasConnected === false && r.read.unreadable && !r.read.tookTooLong && r.read.trimHidden && r.read.titleHidden && r.read.createShown && r.read.saveShown && r.read.newSave },
  f1: { key: 'f1', successor: 'dialog[open]',
    place: async (w) => { await focusByKeyboard(w, '#feedback-open'); await key(w, 'Enter'); await sleep(400); return w.evaluate(`({ open: ${DIALOG_OPEN}, onMessage: ${FOCUS_ON('#feedback-message')} })`) },
    reached: (r) => r.placed?.open && r.placed?.onMessage && r.read.unreadable && !r.read.tookTooLong && r.read.trimHidden && r.read.titleHidden && r.read.dialog },
  f2: { key: 'f2', successor: null,
    place: async (w) => { await focusByKeyboard(w, RADIO_VLANG); const from = await activeDesc(w); await w.click(VH207_LEDE); await sleep(200); return { from, onBody: await w.evaluate('document.activeElement === document.body') } },
    reached: (r) => /video-language/.test(r.placed?.from ?? '') && r.placed?.onBody && r.read.unreadable && !r.read.tookTooLong && r.read.trimHidden && r.read.titleHidden,
    landed: (r) => r.after.focus.el === 'body' },
}
const vh207Ran = (r) => ({ made: r.made, placedOn: r.placedOn, placed: r.placed, before: r.before, atChoosing: r.atChoosing, pending: r.pending, read: r.read, readMs: r.readMs, f20: r.f20 })
const vh207Focus = (r) => ({ focus: r.after.focus.el, visible: r.after.focus.visible, moves: r.after.focus.moves, inView: r.after.focus.inView, seen: r.after.seen, status: r.after.status, ring: r.after.ring, nextTab: r.after.nextTab })
const VH207_READS = '; read before any instrument moves it, with what shows of it (2.4.11, 2.4.12), the source status line (4.1.3), its ring (2.4.13) and the next Tab'
/** VH-207: a variant's two rows: reached (cannot determine unless the branch was reached, as READ_FAILURE_SUB's), and where focus went. */
const vh207Rows = (k, reached, focus) => [
  see(reached, (o) => { const r = o.vh207?.[k]; return r?.reached ? { outcome: 'pass', ...brief(vh207Ran(r)) } : { outcome: 'cannot-determine', why: r ? "the variant's branch was not reached" : 'the variant did not run', ...(r ? brief(vh207Ran(r)) : {}) } }),
  see(focus + VH207_READS, (o) => { const r = o.vh207?.[k]; return r?.reached ? { outcome: r.landed ? 'pass' : 'fail', ...brief(vh207Focus(r)) } : { outcome: 'cannot-determine', why: "the variant's branch was not reached" } }),
]
const vh207Sub = (what, run, asserts) => ({ what, when: () => true, run, asserts })
const VH207_SUB = {
  a: vh207Sub("VH-207 (a), S-149's read-failure branch in every colour mode: focus on a Video language radio when notvideo.mp4 is chosen; the failed reply", (w) => vh207Variant(w, VH207_VARIANTS.a),
    vh207Rows('a', 'reached: lecture-30s.mp4 read, focus on a Video language radio in the shown step 3 by keys, notvideo.mp4 chosen; the failed reply (not took-too-long) and the setup steps withdrawn', 'focus handed to the file input, never lost to the page (2.4.3)')),
  b: vh207Sub('VH-207 (b): focus on the trim start handle when notvideo.mp4 is chosen, which the reading lock disables', (w) => vh207Variant(w, VH207_VARIANTS.b),
    vh207Rows('b', 'reached: lecture-30s.mp4 read, focus on the trim start handle by keys, notvideo.mp4 chosen: the reading lock disables the handle at the choosing; the failed reply and the setup steps withdrawn', 'focus on the disabled handle handed to the file input, never lost to the page (2.4.3)')),
  c: vh207Sub('VH-207 (c), the exception path (F20): focus put on a Video language radio while the read is pending; the deadline ends it', (w) => vh207Variant(w, VH207_VARIANTS.c),
    vh207Rows('c', 'reached: F20 withheld the replacement\'s inspection; lecture-30s.mp4 read, focus on the file input, notvideo.mp4 chosen; while its read is pending (step 3 still shown) focus moved by Tab to a Video language radio; the deadline ends the read in the took-too-long failure and the setup steps withdrawn', 'focus taken while the read was pending handed to the file input, never lost to the page (2.4.3)')),
  d: vh207Sub("VH-207 (d), J4's case: a finished video standing, focus on a Video language radio in step 3 when notvideo.mp4 is chosen beside it", (w) => vh207Variant(w, VH207_VARIANTS.d),
    vh207Rows('d', "reached: a finished video standing unsaved (lecture-30s.mp4, Create); focus on a Video language radio in step 3 by keys, notvideo.mp4 chosen; the failed reply; steps 2 to 5 withdrawn, step 6's card and its Save kept", 'focus handed to the file input, never lost to the page (2.4.3)')),
  e: vh207Sub('VH-207 (e): a finished video standing, focus on its Save when notvideo.mp4 is chosen, which re-renders the result', (w) => vh207Variant(w, VH207_VARIANTS.e),
    vh207Rows('e', 'reached: a finished video standing unsaved; focus on its Save by keys, notvideo.mp4 chosen: the result re-rendered (the Save focused gone, another standing); the failed reply; steps 2 to 5 withdrawn, step 6 and its Save kept', 'focus on the re-rendered Save, the same logical control, never lost to the page (2.4.3)')),
  f: vh207Sub("VH-207 (f), the guards, two readings: (f1) focus in the feedback dialog, (f2) a reader on the body (a click on the lede's text), when notvideo.mp4 is chosen; the page reloaded between them",
    async (w, rec) => { await vh207Variant(w, VH207_VARIANTS.f1); await key(w, 'Escape'); await sleep(300); await fresh(w, rec.lang); await vh207Variant(w, VH207_VARIANTS.f2) },
    [...vh207Rows('f1', 'reached (f1): lecture-30s.mp4 read; Report a problem opened by keys (Enter), focus on its message field; notvideo.mp4 chosen; the failed reply and the setup steps withdrawn, the dialog still open', 'focus stays in the feedback dialog (the guard, src/ui/focus-hand-on.ts)'),
      ...vh207Rows('f2', "reached (f2): lecture-30s.mp4 read; focus on a Video language radio by keys, then a click on the lede's text, so focus is on the body (a reader's place); notvideo.mp4 chosen; the failed reply and the setup steps withdrawn", "focus stays on the body, not moved (the guard: a reader's place is never taken as displaced, src/ui/focus-hand-on.ts)")]),
}
const VH207_EMPTY = `!M.chosen() && !M.el('#file-input').disabled && M.el('#step-trim').hidden`
const vh207Scenario = (name, subresults, more = {}) => ({ name, fixOnly: true, state: VH207_EMPTY, setup: async (w, lang) => fresh(w, lang), subresults, focus: [FILE], fixtures: ['lecture-30s.mp4', 'notvideo.mp4'], ...more })
Object.assign(SCENARIOS, {
  'S-149a': vh207Scenario('VH-207 (a): an unreadable replacement with focus on Video language', VH207_SUB.a),
  'S-149b': vh207Scenario('VH-207 (b): an unreadable replacement with focus on the trim start handle', VH207_SUB.b),
  'S-149c': vh207Scenario('VH-207 (c): the exception path, focus put on Video language while the read is pending', VH207_SUB.c, { setup: async (w, lang) => { await applyFault(w, 'F20'); await fresh(w, lang) }, faults: ['F20'] }),
  'S-149d': vh207Scenario('VH-207 (d): an unreadable replacement beside a finished video, focus on Video language', VH207_SUB.d),
  'S-149e': vh207Scenario("VH-207 (e): an unreadable replacement beside a finished video, focus on its Save", VH207_SUB.e),
  'S-149f': vh207Scenario('VH-207 (f): the guards, focus in the feedback dialog and on a reader\'s place', VH207_SUB.f),
})

Object.assign(SCENARIOS, {
  // VH-183: the trim's Page step.
  'S-92': {
    name: 'Trim Page step, a short video',
    state: `M.proceed() && ${focusIs('#trim-end-range')}`,
    hold: `M.proceed()`,
    setup: async (w, lang) => {
      await ready(w, lang, 'lecture-130s.mp4')
      const o = obsOf(w)
      o.start = await handleKeys(w, 'trim-start-range', ['PageUp', 'PageUp', 'PageDown', 'ArrowRight', 'End', 'PageUp', 'Home', 'PageDown'])
      o.end = await handleKeys(w, 'trim-end-range', ['PageDown', 'PageUp', 'Home', 'PageDown', 'End'])
      o.lastPress = Date.now()
      await w.waitSettled(); await until(w, 'M.proceed()', 'the settled verdict')
      o.checksAfterLast = await w.evaluate(STATUS_SINCE(o.lastPress))
    },
    asserts: [
      see('start handle 0, 10, 20, 10, 11, 127, 127, 0, 0', (o) => same(vals(o.start), [0, 10, 20, 10, 11, 127, 127, 0, 0])),
      see('end handle 130, 120, 130, 3, 3, 130', (o) => same(vals(o.end), [130, 120, 130, 3, 3, 130])),
      see('each value said in words; focus stays on the handle', (o) => [...o.start, ...o.end].every((s) => s.text && s.focused)),
      see('the first press withdraws the verdict and offers Stop at once', (o) => !o.start[1].atOnce.verdict && o.start[1].atOnce.stop),
      see('one check after the keys settle', (o) => o.checksAfterLast === 1),
    ],
    focus: [{ sel: '#trim-start-range', ref: 'thumb' }, { sel: '#trim-end-range', ref: 'thumb' }],
    fixtures: ['lecture-130s.mp4'],
  },
  'S-93': {
    name: 'Trim Page step, an hour',
    ...OUTCOME,
    state: `M.proceed() && ${focusIs('#trim-end-range')}`,
    hold: `M.proceed()`,
    setup: async (w, lang) => {
      await ready(w, lang, 'still-3600s.mp4')
      const o = obsOf(w)
      o.start = await handleKeys(w, 'trim-start-range', ['PageUp', 'PageUp', 'PageDown', 'ArrowRight', 'End', 'PageUp', 'Home', 'PageDown'])
      o.end = await handleKeys(w, 'trim-end-range', ['PageDown', 'PageUp', 'Home', 'PageDown', 'End'])
      o.lastPress = Date.now()
      await w.waitSettled({ timeout: 300000 }); await until(w, 'M.proceed()', 'the settled verdict', 300000)
      o.checksAfterLast = await w.evaluate(STATUS_SINCE(o.lastPress))
    },
    asserts: [
      see('start handle 0, 36, 72, 36, 37, 3597, 3597, 0, 0', (o) => same(vals(o.start), [0, 36, 72, 36, 37, 3597, 3597, 0, 0])),
      see('end handle 3600, 3564, 3600, 3, 3, 3600', (o) => same(vals(o.end), [3600, 3564, 3600, 3, 3, 3600])),
      see('the words in English: 36 seconds, 1 minute 12 seconds, 59 minutes 57 seconds', (o, w) => w.evaluate('document.documentElement.lang').then((l) => (l !== 'en-GB' ? { outcome: 'not-applicable', why: 'the English words only' } : o.start[1].text === '36 seconds' && o.start[2].text === '1 minute 12 seconds' && o.start[5].text === '59 minutes 57 seconds'))),
      see('the first press withdraws the verdict and offers Stop at once', (o) => !o.start[1].atOnce.verdict && o.start[1].atOnce.stop),
      see('exactly one check after the last press', (o) => o.checksAfterLast === 1),
    ],
    focus: [{ sel: '#trim-start-range', ref: 'thumb' }],
    fixtures: ['still-3600s.mp4'],
  },
  'S-94': {
    name: 'Trim Page step at the 1% boundary',
    ...EN_1280,
    state: `M.proceed() && ${focusIs('#trim-start-range')}`,
    hold: `M.proceed()`,
    setup: async (w, lang) => {
      const o = obsOf(w)
      await ready(w, lang, 'still-1000s.mp4', { timeout: 600000 })
      o.s1000 = await handleKeys(w, 'trim-start-range', ['PageUp', 'PageDown'])
      await w.setFiles(F('still-1100s.mp4')); await w.waitSettled({ timeout: 600000 }); await until(w, 'M.proceed()', 'the 1,100 s verdict', 600000)
      o.s1100 = await handleKeys(w, 'trim-start-range', ['PageUp', 'PageDown'])
      await w.waitSettled({ timeout: 600000 }); await until(w, 'M.proceed()', 'settled', 600000)
    },
    asserts: [
      see('1,000 s: 0, 10, 0 (the floor and 1% agree)', (o) => same(vals(o.s1000), [0, 10, 0])),
      see('1,100 s: 0, 11, 0', (o) => same(vals(o.s1100), [0, 11, 0])),
      see('"10 seconds" and "11 seconds"', (o) => o.s1000[1].text === '10 seconds' && o.s1100[1].text === '11 seconds'),
      found('a fractional page (10.5 s at 1,050 s): untested in source and not walked', () => ({ absent: 'src/ui/trim.test.ts:163-168 covers only 999, 1,000 and 2,000 s' })),
    ],
    focus: [{ sel: '#trim-start-range', ref: 'thumb' }],
    fixtures: ['still-1000s.mp4', 'still-1100s.mp4'],
  },
  // VH-184: the onset "?" closed by focus.
  'S-95': {
    name: 'Onset help closed by Tab',
    state: `!M.vis('#onset-help') && M.el('#onset-help-button').getAttribute('aria-expanded') === 'false' && ${focusIs('#closing-colour input:checked')}`,
    hold: `!M.vis('#onset-help')`,
    setup: async (w, lang) => {
      await ready(w, lang); await fade(w)
      const o = obsOf(w)
      await focusByKeyboard(w, '#onset-help-button'); await key(w, 'Tab'); o.closedTab = await activeDesc(w)
      await focusByKeyboard(w, '#onset-help-button'); await key(w, 'Enter'); o.opened = await tipState(w, 'onset-help')
      await key(w, 'Tab'); o.openTab = await activeDesc(w); o.after = await tipState(w, 'onset-help')
    },
    asserts: [see('Enter opens it; Tab closes it and lands where it lands with it closed (the Blue colour)', (o) => o.opened.open && !o.after.open && o.after.expanded === 'false' && o.openTab === o.closedTab)],
    focus: ['#closing-colour input:checked'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-96': {
    name: 'Onset help closed by Shift+Tab',
    state: `!M.vis('#onset-help') && ${focusIs('#closing-onset')}`,
    hold: `!M.vis('#onset-help')`,
    setup: async (w, lang) => {
      await ready(w, lang); await fade(w)
      const o = obsOf(w)
      await focusByKeyboard(w, '#onset-help-button'); await key(w, 'Tab', { shift: true }); o.closedBack = await activeDesc(w)
      await focusByKeyboard(w, '#onset-help-button'); await key(w, 'Enter'); o.opened = await tipState(w, 'onset-help')
      await key(w, 'Tab', { shift: true }); o.openBack = await activeDesc(w); o.after = await tipState(w, 'onset-help')
    },
    asserts: [see('Shift+Tab closes it, focus on the "Plays over" select', (o) => o.opened.open && !o.after.open && o.openBack === o.closedBack && o.openBack === '#closing-onset')],
    focus: ['#closing-onset'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-97': {
    name: 'Onset help closed by Escape, or by a click elsewhere',
    state: `!M.vis('#onset-help') && M.el('#onset-help-button').getAttribute('aria-expanded') === 'false'`,
    setup: async (w, lang) => {
      await ready(w, lang); await fade(w)
      const o = obsOf(w)
      await focusByKeyboard(w, '#onset-help-button'); await key(w, 'Enter'); await key(w, 'Escape'); o.escape = { ...(await tipState(w, 'onset-help')), focus: await activeDesc(w) }
      await focusByKeyboard(w, '#onset-help-button'); await key(w, 'Enter'); await w.click('#onset-help p'); o.clickText = await tipState(w, 'onset-help')
      await key(w, 'Escape'); o.escapeAfterText = { ...(await tipState(w, 'onset-help')), focus: await activeDesc(w) }
      await focusByKeyboard(w, '#onset-help-button'); await key(w, 'Enter'); await w.click('#closing-colour legend'); o.clickElsewhere = { ...(await tipState(w, 'onset-help')), focus: await activeDesc(w) }
    },
    asserts: [
      see('Escape closes it; focus on the "?"', (o) => !o.escape.open && o.escape.focus === '#onset-help-button'),
      see('a click on its text keeps it open; Escape then closes it, focus on the "?"', (o) => o.clickText.open && !o.escapeAfterText.open && o.escapeAfterText.focus === '#onset-help-button'),
      see('a click elsewhere closes it', (o) => !o.clickElsewhere.open),
    ],
    focus: ['#onset-help-button'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-98': {
    name: "Onset help's edge",
    state: `M.vis('#onset-help') && M.el('#onset-help-button').getAttribute('aria-expanded') === 'true'`,
    setup: async (w, lang) => { await ready(w, lang); await w.click('#onset-help-button'); await sleep(200) },
    asserts: [
      X('1 px all round, solid, in --border-subtle (or the forced palette), not a rail', `(() => { const t = M.el('#onset-help'); const cs = getComputedStyle(t); const p = document.createElement('div'); p.style.borderTop = '1px solid var(--border-subtle)'; document.body.append(p); const tok = getComputedStyle(p).borderTopColor; p.remove(); const sides = ['Top', 'Right', 'Bottom', 'Left']; return sides.every((s) => cs['border' + s + 'Width'] === '1px' && cs['border' + s + 'Style'] === 'solid' && (matchMedia('(forced-colors: active)').matches || cs['border' + s + 'Color'] === tok)); })()`),
      found('the edge against the tip\'s ground and the step\'s (3:1 is 1.4.11\'s floor)', async (o, w) => w.evaluate(`(() => { const parse = (c) => (c.match(/[\\d.]+/g) || []).slice(0, 3).map(Number); const L = (c) => { const m = parse(c).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }); return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2] }; const K = (a, b) => { const x = L(a), y = L(b); return Math.round((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) * 100) / 100 }; const t = document.getElementById('onset-help'); const edge = getComputedStyle(t).borderTopColor; let g = t, bg = 'rgba(0, 0, 0, 0)'; while (g && /rgba\\(0, 0, 0, 0\\)|transparent/.test(bg)) { bg = getComputedStyle(g).backgroundColor; g = g.parentElement } let s = t.parentElement, sbg = 'rgba(0, 0, 0, 0)'; while (s && /rgba\\(0, 0, 0, 0\\)|transparent/.test(sbg)) { sbg = getComputedStyle(s).backgroundColor; s = s.parentElement } return { edge, tipGround: bg, stepGround: sbg, againstTip: K(edge, bg), againstStep: K(edge, sbg) }; })()`)),
    ],
    focus: ['#onset-help-button'],
    fixtures: ['lecture-60s.mp4'],
  },
  // VH-185: a sliver of late sound.
  'S-99': {
    name: 'A kept sliver of sound: no audio before Create',
    // VH-206: the kept-part words, not the absent-track words S-20 keeps.
    state: `M.kindIn('#audio-warnings') === 'warning' && M.has('warnings.keptTooLittleAudio.heading', '#audio-warnings') && !M.has('warnings.endsEarly.heading', '#audio-warnings')`,
    setup: async (w, lang) => { await ready(w, lang, 'late-sound-10s.mp4'); await w.type('#trim-end', '0:04'); await w.press('Tab'); obsOf(w).afterTab = await activeDesc(w); await w.waitSettled(); await until(w, `M.has('warnings.keptTooLittleAudio.heading', '#audio-warnings')`, 'the too-little-kept note', 60000) },
    asserts: [see('Tab from End time lands on "Set end here", where Tab puts it (S-34)', (o) => o.afterTab === '#trim-set-end')],
    focus: ['#trim-end', CREATE],
    fixtures: ['late-sound-10s.mp4'],
  },
  'S-100': {
    name: 'A kept sliver: the job finishes silent',
    ...OUTCOME,
    state: `M.finished() && !M.has('warnings.endsEarly.heading', '#process-result')`,
    setup: async (w, lang) => { await ready(w, lang, 'late-sound-10s.mp4'); await w.type('#trim-end', '0:04'); await w.press('Tab'); await w.waitSettled(); await create(w); await untilDone(w, 'finished') },
    asserts: [
      X('the record keeps 0:00.0 to 0:04.0 of the 10 s file', `M.text(${JSON.stringify(P8_CARD)}).includes('0:04.0')`),
      see('no plan, so no heavy-limiting warning (a silent job)', async (o, w) => ({ outcome: (w.p8planned?.planned ?? []).length === 0 && !(await mx(w, `${WARN_TEXT}.includes(${HEAVY_TITLE})`)) ? 'pass' : 'fail', planned: (w.p8planned?.planned ?? []).length })),
    ],
    focus: [SAVE],
    fixtures: ['late-sound-10s.mp4'],
  },
  'S-101': {
    name: 'The control: 0.6 s of sound kept',
    ...EN_1280,
    state: `M.finished()`,
    setup: async (w, lang) => { await ready(w, lang, 'late-sound-3.4s-10s.mp4'); await w.type('#trim-end', '0:04'); await w.press('Tab'); await w.waitSettled(); obsOf(w).noAudioBefore = await mx(w, `M.has('warnings.noAudio.heading', '#audio-warnings') || M.has('warnings.keptTooLittleAudio.heading', '#audio-warnings')`); await create(w); await untilDone(w, 'finished') },
    asserts: [
      see('no no-audio note before Create', (o) => o.noAudioBefore === false),
      see('levelled: the job planned its sound', (o, w) => (w.p8planned?.planned ?? []).length > 0),
    ],
    focus: [SAVE],
    fixtures: ['late-sound-3.4s-10s.mp4'],
  },
  'S-102': {
    name: 'An untrimmed file with under 400 ms of sound: told before Create, made silent (VH-213)',
    ...EN_1280,
    // VH-213, the owner's choice (VH-211's ask, point 3): the chosen outcome required, a finished video, never the loudness refusal.
    state: `M.finished()`,
    setup: async (w, lang) => { await ready(w, lang, 'late-sound-9.7s-10s.mp4'); const o = obsOf(w); o.verdictNotes = await mx(w, `M.text('#audio-warnings').replace(/\\s+/g, ' ').trim().slice(0, 300)`); o.wholeNote = await mx(w, WHOLE_NOTE); await create(w); await untilDone(w, 'an outcome'); o.tracks = await outputTracks(w) },
    asserts: [
      see('before Create, the whole video\'s too-little note, no other no-audio note and no ends-early', (o) => o.wholeNote === true),
      see('finished silent: no plan to level', (o, w) => (w.p8planned?.planned ?? []).length === 0),
      see('the finished file\'s tracks, read: one video, no audio', (o) => ({ outcome: o.tracks && o.tracks.video === 1 && o.tracks.audio === 0 && o.tracks.other === 0 ? 'pass' : 'fail', tracks: o.tracks ?? null })),
    ],
    focus: [RESULT],
    fixtures: ['late-sound-9.7s-10s.mp4'],
  },
  // VH-186: a fact said alone.
  'S-103': {
    name: '"Less than a second" alone',
    state: `!!M.el('#source-report details[open]') && [...document.querySelectorAll('#source-report dd')].some((d) => d.textContent.trim() === M.msg('format.alone.lessThanASecond'))`,
    setup: async (w, lang) => { await ready(w, lang, 'short-0.4s.mp4'); await w.click(PROPS); await sleep(300) },
    asserts: [X('the trim is locked, as S-21 (too short to trim)', `M.el('#trim-start').disabled || M.has('trim.tooShort', '#step-trim')`)],
    focus: [PROPS],
    fixtures: ['short-0.4s.mp4'],
  },
  'S-105': {
    name: 'The unchecked caption warning, completed',
    state: `M.has('source.losses.uncheckedTitle', '#source-report') || M.has('source.losses.uncheckedTitle')`,
    setup: async (w, lang) => ready(w, lang, 'lecture-30s.mkv'),
    asserts: [X('its detail goes on with the caption passage (B3)', `(() => { const t = document.body.textContent.replace(/\\s+/g, ' '); const d = M.msg('source.losses.uncheckedDetail'), c = M.msg('source.losses.captionsConsequence'); return t.includes(d.trim()) && t.includes(c.trim()) && t.indexOf(c.trim()) > t.indexOf(d.trim()); })()`)],
    focus: [FILE, CREATE],
    fixtures: ['lecture-30s.mkv'],
  },
  // VH-187: the browser note.
  'S-106': {
    name: 'The browser note on a warn',
    state: `M.el('#check-aac')?.dataset.state === 'warn' && [...document.querySelectorAll('#checks .check')].filter((r) => r.id !== 'check-aac').every((r) => r.dataset.state === 'pass') && !M.el('#browser-note').hidden && M.is('browserNote.notPassed', '#browser-note') && !M.el('#file-input').disabled`,
    setup: async (w, lang) => { await applyFault(w, 'F17'); await fresh(w, lang) },
    asserts: [X('System check says one warning, its aac row "Not supported — a video with audio cannot be made here"', `M.has('systemCheck.values.aacNotSupported', '#check-aac')`), X('the note is not a live region', `!M.el('#browser-note').closest('[aria-live],[role=status],[role=alert]')`)],
    focus: [FILE, '#system-check summary'],
    faults: ['F17'], fixtures: [],
  },
  'S-107': {
    name: 'The browser note beside a check still pending',
    state: `M.el('#check-worker')?.dataset.state === 'pending' && M.has('choose.starting', '#source-status') && !M.el('#browser-note').hidden && M.is('browserNote.notPassed', '#browser-note')`,
    // Two loads, each read inside the worker ping's 5 s deadline: F1 with F2 (kept), then F1 with F17 (the record).
    setup: async (w, lang) => {
      const o = obsOf(w)
      await fresh(w, lang); await w.page.send('Network.setCacheDisabled', { cacheDisabled: true })
      await applyFault(w, 'F1'); await applyFault(w, 'F2'); await gotoNoWait(w)
      o.withF2 = await mx(w, `({ worker: M.el('#check-worker')?.dataset.state, note: !M.el('#browser-note').hidden && M.is('browserNote.notPassed', '#browser-note'), starting: M.has('choose.starting', '#source-status') })`)
      await releaseFault(w, 'F1'); await releaseFault(w, 'F2')
      await applyFault(w, 'F1'); await applyFault(w, 'F17'); await gotoNoWait(w)
    },
    asserts: [see('with F2: still pending, the note shown above the starting line', (o) => o.withF2.worker === 'pending' && o.withF2.note && o.withF2.starting), found('a check settling after a file is chosen', () => ({ sourceOnly: 'Not in this pass (scenarios file)' }))],
    focus: [RADIO_LANG],
    faults: ['F1', 'F2', 'F17'], fixtures: [],
  },
  // VH-188: the outputs' names.
  'S-108': {
    name: "Step 5's names and details",
    state: `M.proceed() && M.create()`,
    setup: async (w, lang) => ready(w, lang, 'lecture-30s.mp4'),
    asserts: [
      X('B6\'s names and details', `['best', 'smaller'].every((id) => M.text('#preset-choice').includes(M.msg('preset.labels.' + id)) && M.text('#preset-choice').includes(M.msg('preset.details.' + id)))`),
      X('no old name or "etc."', `!/Larger \\/ better|Smaller \\/ reduced|\\betc\\.|等|\\bdll\\./.test(M.text('#preset-choice'))`),
      X('the legend "File size / quality"', `M.text('#preset-choice legend').trim() === M.msg('preset.legend')`),
    ],
    focus: ['#preset-choice input:checked'],
    fixtures: ['lecture-30s.mp4'],
  },
  'S-109': {
    name: 'The record names each output',
    state: `M.previous() && !!M.verdict()`,
    setup: async (w, lang) => {
      const o = obsOf(w)
      const record = () => mx(w, `M.text(${JSON.stringify(P8_CARD)} + ' > p:nth-of-type(2)') || M.text(${JSON.stringify(P8_CARD)})`)
      await ready(w, lang, 'short-2s.mp4'); await w.click('#preset-choice input[value="smaller"]'); await w.waitSettled(); await create(w); await untilDone(w, 'smaller made')
      o.smaller = await record()
      await w.click('#preset-choice input[value="best"]'); await w.waitSettled()
      await question(w); o.question = await mx(w, `M.text('#process-result')`)
      await w.click('#process-result .button--danger'); await untilDone(w, 'best made')
      o.best = await record()
      await question(w); o.questionBest = await mx(w, `M.text('#process-result')`)
      await w.click('#process-result .button--secondary'); await sleep(400); o.kept = await record()
      await w.setFiles(F('silent-10s.mp4')); await w.waitSettled(); await until(w, 'M.verdict()', 'next verdict'); o.previous = await record()
      o.words = await mx(w, `({ best: M.msg('preset.inRecord.best'), smaller: M.msg('preset.inRecord.smaller'), labels: [M.msg('preset.labels.best'), M.msg('preset.labels.smaller')] })`)
    },
    asserts: [
      see('the smaller output in its short form, without the purpose', (o) => o.smaller.includes(o.words.smaller) && !o.words.labels.some((l) => o.smaller.includes(l))),
      see('high quality in its short form, in the card, the question, after Keep it and under "Previous video"', (o) => [o.best, o.questionBest, o.kept, o.previous].every((t) => t.includes(o.words.best) && !o.words.labels.some((l) => t.includes(l)))),
      see('the question over the smaller file says its short form', (o) => o.question.includes(o.words.smaller)),
    ],
    focus: [SAVE, FILE],
    fixtures: ['short-2s.mp4', 'silent-10s.mp4'],
  },
  'S-110': {
    name: 'The slides sentence',
    state: `!!M.verdict() && M.checked('preset') === 'smaller' && M.says('preflight.slides', { best: { msg: 'preset.inSentence.best' } }, '#preflight-report')`,
    setup: async (w, lang) => { await ready(w, lang, 'slides-60s.mp4'); await w.click('#preset-choice input[value="smaller"]'); await w.waitSettled(); await until(w, 'M.verdict()', 'the verdict') },
    asserts: [X('the sentence word for word, its output named "high quality"', `M.says('preflight.slides', { best: { msg: 'preset.inSentence.best' } }, '#preflight-report')`)],
    focus: ['#preset-choice input:checked', CREATE],
    fixtures: ['slides-60s.mp4'],
  },
  // VH-189: step 4's labels.
  'S-111': {
    name: "Step 4's labels at a wide view",
    // The plan's recipe walks it in every cell (FULL); below the 25rem query the
    // "?" moves beside the label, which S-112 asserts, so this record's
    // placement assertion holds above it only.
    state: `M.proceed() && M.el('#closing-type').value === 'fade'`,
    setup: async (w, lang) => { await ready(w, lang); await fade(w) },
    asserts: [
      X('"Animation type" with Cut, Fade, Slide and "No closing graphics"', `['cut', 'fade', 'slide', 'none'].every((v) => [...M.el('#closing-type').options].some((o) => o.value === v && o.textContent.trim() === M.msg('closing.types.' + v)))`),
      X('"Plays over" with its two options', `['existing', 'freeze'].every((v) => [...M.el('#closing-onset').options].some((o) => o.value === v && o.textContent.trim() === M.msg('closing.onsets.' + v)))`),
      X('the "?" named "About what the graphics play over"', `M.el('#onset-help-button').getAttribute('aria-label') === M.msg('closing.helpLabel')`),
      { what: 'each label its select\'s accessible name', fn: async (w) => { const names = {}; const { root } = await w.page.send('DOM.getDocument', { depth: 0 }); for (const id of ['closing-type', 'closing-onset']) { const { nodeId } = await w.page.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#' + id }); const { nodes } = await w.page.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false }); names[id] = nodes[0]?.name?.value } const want = await mx(w, `({ type: M.text('label[for="closing-type"]').trim(), onset: M.msg('closing.onsetLabel') })`); return { outcome: names['closing-type'] === want.type && names['closing-onset'] === want.onset ? 'pass' : 'fail', names, want } } },
      X('every option inside its select\'s room', `['closing-type', 'closing-onset'].every((id) => { const s = M.el('#' + id); const c = document.createElement('canvas').getContext('2d'); c.font = getComputedStyle(s).font; const room = s.clientWidth - parseFloat(getComputedStyle(s).paddingLeft) - parseFloat(getComputedStyle(s).paddingRight); return [...s.options].every((o) => c.measureText(o.textContent.trim()).width <= room + 1); })`),
      { what: 'the "?" beside the select (above the 25rem query)', fn: async (w) => { const r = await w.evaluate(`(() => { const b = document.getElementById('onset-help-button').getBoundingClientRect(), s = document.getElementById('closing-onset').getBoundingClientRect(); return { narrow: matchMedia('(max-width: 25rem)').matches, beside: b.top < s.bottom && b.bottom > s.top && b.left >= s.right - 1 }; })()`); return r.narrow ? { outcome: 'not-applicable', why: 'below the 25rem query: S-112\'s' } : { outcome: r.beside ? 'pass' : 'fail', ...r } } },
    ],
    focus: ['#closing-type', '#closing-onset', '#onset-help-button'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-112': {
    name: 'Below about 400 px: the "?" beside "Plays over"',
    views: ['w401', 'w400', 'w375', 'w320'], viewsWhy: 'scenarios file: either side of the 25rem query',
    state: `M.proceed() && !M.vis('#onset-help') && ${focusIs('#onset-help-button')}`,
    hold: `M.proceed()`,
    setup: async (w, lang) => {
      await ready(w, lang); await fade(w)
      const o = obsOf(w)
      await focusByKeyboard(w, '#onset-help-button'); await key(w, 'Enter'); o.open = await tipState(w, 'onset-help')
      o.tipUnderSelect = await w.evaluate(`(() => { const t = document.getElementById('onset-help').getBoundingClientRect(), s = document.getElementById('closing-onset').getBoundingClientRect(); return t.top >= s.bottom - 1; })()`)
      await key(w, 'Tab'); o.tab = await activeDesc(w); o.afterTab = await tipState(w, 'onset-help')
      await focusByKeyboard(w, '#onset-help-button'); await key(w, 'Enter'); await key(w, 'Escape'); o.escape = { ...(await tipState(w, 'onset-help')), focus: await activeDesc(w) }
    },
    asserts: [
      X('at 401 px beside the select; at 400 px and below beside the label', `(() => { const b = M.el('#onset-help-button').getBoundingClientRect(), s = M.el('#closing-onset').getBoundingClientRect(), l = M.el('label[for="closing-onset"]').getBoundingClientRect(); const narrow = matchMedia('(max-width: 25rem)').matches; return narrow ? b.top < l.bottom && b.bottom > l.top && b.bottom <= s.top + 1 : b.top < s.bottom && b.bottom > s.top; })()`),
      X('the Tab order unchanged: the select, then the "?"', `(() => { const s = M.el('#closing-onset'), b = M.el('#onset-help-button'); return !!(s.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING); })()`),
      X('every option inside its select\'s room', `['closing-type', 'closing-onset'].every((id) => { const s = M.el('#' + id); const c = document.createElement('canvas').getContext('2d'); c.font = getComputedStyle(s).font; const room = s.clientWidth - parseFloat(getComputedStyle(s).paddingLeft) - parseFloat(getComputedStyle(s).paddingRight); return [...s.options].every((o) => c.measureText(o.textContent.trim()).width <= room + 1); })`),
      see('it opens under the select; Tab closes it; Escape returns focus to the "?"', (o) => o.open.open && o.tipUnderSelect && !o.afterTab.open && !o.escape.open && o.escape.focus === '#onset-help-button'),
    ],
    focus: ['#onset-help-button', '#closing-onset'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-113': {
    name: 'Step 4 at the 32 px font',
    views: ['w1280', 'w640', 'w401', 'w320'], viewsWhy: 'scenarios file: at 1280, 640, 401 and 320 px under the 32 px font',
    state: `M.proceed() && M.el('#closing-type').value === 'fade'`,
    setup: async (w, lang) => { await ready(w, lang); await fade(w) },
    asserts: [
      X('the 25rem query follows the text size: the "?" beside the select only above 800 px', `(() => { const b = M.el('#onset-help-button').getBoundingClientRect(), s = M.el('#closing-onset').getBoundingClientRect(); const beside = b.top < s.bottom && b.bottom > s.top; return beside === !matchMedia('(max-width: 25rem)').matches; })()`),
      found('the room in each select, and options clipped (wish VH-189.1, beyond 1.4.4 and 1.4.10)', (o, w) => w.evaluate(`['closing-type', 'closing-onset'].map((id) => { const s = document.getElementById(id); const c = document.createElement('canvas').getContext('2d'); c.font = getComputedStyle(s).font; const room = Math.round(s.clientWidth - parseFloat(getComputedStyle(s).paddingLeft) - parseFloat(getComputedStyle(s).paddingRight)); return { id, room, clipped: [...s.options].filter((o) => c.measureText(o.textContent.trim()).width > room + 1).map((o) => o.value) }; })`)),
    ],
    focus: ['#closing-onset', '#onset-help-button'],
    fixtures: ['lecture-60s.mp4'],
  },
  // VH-190: Create's label.
  'S-114': {
    name: 'Create again, unsaved',
    state: `M.finished() && !M.saveBtn().disabled && ${CREATE_READS('create.again', true)}`,
    setup: async (w, lang) => finished(w, lang),
    asserts: [X('its accessible name is its label: no aria-label', `!M.btn(2).hasAttribute('aria-label') && !M.btn(2).hasAttribute('aria-labelledby')`), X('not clipped', `M.btn(2).scrollWidth <= M.btn(2).clientWidth + 1 && M.btn(2).getBoundingClientRect().right <= document.documentElement.clientWidth + 0.5`)],
    focus: [CREATE, SAVE],
    fixtures: ['lecture-30s.mp4'],
  },
  'S-115': {
    name: 'Create again, saved',
    ...OUTCOME,
    state: `M.running() && M.res() === 'none' && ${focusIs(CANCEL)}`,
    hold: `M.running()`,
    setup: async (w, lang) => {
      const o = obsOf(w)
      await finished(w, lang, 'lecture-360s.mp4'); await saveWith(w); await w.waitSaved()
      o.before = await mx(w, `({ again: ${CREATE_READS('create.again', true)} })`)
      await w.click(w.createButton()); await sleep(150); o.asked = await mx(w, `M.res() === 'question'`)
      await w.waitRunning(); await encoding(w)
    },
    asserts: [see('before: "Create the video again", secondary', (o) => o.before.again), see('nothing unsaved, so no question', (o) => o.asked === false)],
    focus: [CANCEL],
    fixtures: ['lecture-360s.mp4'],
  },
  'S-116': {
    name: 'Create beside a Previous video',
    state: `M.previous() && M.saveBtn().disabled && ${CREATE_READS('create.create', false)}`,
    setup: async (w, lang) => {
      const o = obsOf(w)
      await finished(w, lang); await w.setFiles(F('lecture-60s.mp4')); await w.waitSettled(); await until(w, 'M.verdict()', 'next verdict')
      if (await mx(w, 'M.ack()')) { await w.click(w.acknowledgeButton()); await sleep(300) }
      o.unsaved = await mx(w, `M.previous() && ${CREATE_READS('create.create', true)}`)
      await saveWith(w); await w.waitSaved()
    },
    asserts: [see('unsaved beside it: "Create the video", secondary', (o) => o.unsaved === true)],
    focus: [CREATE, FILE],
    fixtures: ['lecture-30s.mp4', 'lecture-60s.mp4'],
  },
  'S-117': {
    name: "Create's label through a page-language change",
    state: `M.finished() && M.is('create.again', '#process-actions > button:nth-child(2)') && ${focusIs(CREATE)}`,
    hold: `M.finished() && M.is('create.again', '#process-actions > button:nth-child(2)')`,
    setup: async (w, lang) => {
      const o = obsOf(w)
      o.lang = lang
      // a: set by setup, focus on Create unmoved.
      await finished(w, anotherLang(lang))
      await focusByKeyboard(w, CREATE); await setPageLanguage(w, lang)
      o.a = await mx(w, `({ again: M.is('create.again', '#process-actions > button:nth-child(2)'), focus: document.activeElement === M.btn(2), lang: document.documentElement.lang })`)
      // b: by keys, from the language before this one: Shift+Tab to Page language, ArrowRight, Tab back to Create.
      await setPageLanguage(w, before(lang)); await focusByKeyboard(w, CREATE)
      let n = 0; while (n++ < 160 && !(await w.evaluate(`!!document.activeElement && document.activeElement.matches('#language-switcher input')`))) await key(w, 'Tab', { shift: true })
      o.bPresses = n; await key(w, 'ArrowRight'); await sleep(400)
      o.b = { onSwitcher: await w.evaluate(`!!document.activeElement.closest('#language-switcher')`), lang: await w.evaluate('document.documentElement.lang') }
      n = 0; while (n++ < 160 && !(await w.evaluate(`document.activeElement === document.querySelector('#process-actions > button:nth-child(2)')`))) await key(w, 'Tab')
      o.bBack = n
    },
    asserts: [
      see('a: set by setup, relabelled in place, focus kept on Create', (o) => o.a.again && o.a.focus),
      see('b: by keys, focus on Page language\'s radio after ArrowRight, the page in its language; Create relabelled when Tab returns (the state)', (o) => o.b.onSwitcher && o.b.lang === o.lang),
    ],
    focus: [CREATE],
    fixtures: ['lecture-30s.mp4'],
  },
  'S-118': {
    name: 'Made again, then cancelled or failed',
    ...OUTCOME,
    state: `M.res() === 'failure' && M.has('failure.outOfSpace.what', '#process-result') && ${CREATE_READS('create.create', false)}`,
    setup: async (w, lang) => {
      const o = obsOf(w)
      // F12 counts only the second job's writes: the first finishes, the made-again one fails part-way.
      await applyFault(w, 'F12', { job: 3 })
      await finished(w, lang, 'lecture-30s.mp4'); await saveWith(w); await w.waitSaved()
      await w.click(w.createButton()); await w.waitRunning(); await encoding(w); await w.click(CANCEL); await until(w, 'M.idle() && M.create()', 'cancelled', 60000); await sleep(300)
      o.cancelled = await mx(w, `({ create: ${CREATE_READS('create.create', false)}, none: M.res() === 'none', focus: document.activeElement === M.btn(2) })`)
      await w.click(w.createButton()); await w.waitFailed()
    },
    asserts: [see('after the cancel: "Create the video", primary, no result; focus on Create', (o) => o.cancelled.create && o.cancelled.none && o.cancelled.focus)],
    focus: [RESULT, CREATE],
    faults: ['F12'], fixtures: ['lecture-30s.mp4'],
  },
  // VH-191: Video language at the top of step 3.
  'S-119': {
    name: 'Video language at the top of step 3, the card off',
    state: `M.proceed() && M.checked('video-kind') === 'staff' && !M.el('#title-card-on').checked && M.checked('video-language') === document.documentElement.lang`,
    setup: async (w, lang) => ready(w, lang),
    asserts: [
      X('the legend and its two helper lines in the page\'s words', `M.text('#video-language legend').trim() === M.msg('videoLanguage.label') && M.text('#video-language-helper').replace(/\\s+/g, ' ').trim() === M.msg('videoLanguage.helper') + ' ' + M.msg('videoLanguage.typed')`),
      X('three segments, each in its own language', `[...document.querySelectorAll('#video-language .segment')].length === 3 && [...document.querySelectorAll('#video-language input')].every((i) => (i.closest('[lang]') || {}).lang === i.value)`),
      { what: 'the group named by its legend, described by its helper alone', fn: async (w) => { const { root } = await w.page.send('DOM.getDocument', { depth: 0 }); const { nodeId } = await w.page.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#video-language' }); const { nodes } = await w.page.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false }); const want = await mx(w, `({ name: M.msg('videoLanguage.label'), desc: M.text('#video-language-helper').replace(/\\s+/g, ' ').trim() })`); const n = nodes[0]; return { outcome: n?.name?.value === want.name && (n?.description?.value ?? '').replace(/\s+/g, ' ').trim() === want.desc ? 'pass' : 'fail', name: n?.name?.value, description: n?.description?.value } } },
    ],
    focus: [RADIO_VLANG, '#title-card-on'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-120': {
    name: 'Video language, the card on',
    state: `M.el('#title-card-on').checked && M.vis('#title-card-fields') && ${focusIs('#title-card-on')}`,
    hold: `M.el('#title-card-on').checked && M.vis('#title-card-fields')`,
    setup: async (w, lang) => { await ready(w, lang); await focusByKeyboard(w, '#title-card-on'); await key(w, 'Space'); await sleep(300) },
    asserts: [X('Video language above the fields, outside the card choice', `!M.el('#title-card-choice').contains(M.el('#video-language')) && !!(M.el('#video-language').compareDocumentPosition(M.el('#title-card-fields')) & Node.DOCUMENT_POSITION_FOLLOWING)`), X('the date filled in the video language', `M.el('#title-card-date').value.includes(new Intl.DateTimeFormat(M.checked('video-language'), { month: 'long' }).format(new Date())) || /\\d/.test(M.el('#title-card-date').value)`)],
    focus: ['#title-card-on', RADIO_VLANG],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-121': {
    name: 'Video language on a submission',
    state: `M.checked('video-kind') === 'submission' && M.vis('#submission-card-fields') && M.el('#title-card-on').checked && M.el('#title-card-on').disabled && M.vis('#video-language')`,
    setup: async (w, lang) => SCENARIOS['S-40'].setup(w, lang),
    asserts: [X('Video language above the ticked, locked box and its four fields', `!!(M.el('#video-language').compareDocumentPosition(M.el('#title-card-on')) & Node.DOCUMENT_POSITION_FOLLOWING) && !M.el('#title-card-choice').contains(M.el('#video-language'))`)],
    focus: [RADIO_VLANG, ...M_SUB_FOCUS().slice(0, 1)],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-122': {
    name: 'Video language picked by keys',
    state: `M.chosen() && !!M.verdict() && M.checked('video-language') === window.__p8pick && window.__audit.boot.langAtDCL === document.documentElement.lang`,
    setup: async (w, lang) => {
      const o = obsOf(w); o.lang = lang
      await ready(w, lang)
      await focusByKeyboard(w, RADIO_VLANG); await key(w, 'ArrowRight'); await sleep(300)
      o.pick = await mx(w, `M.checked('video-language')`); o.afterPick = await w.evaluate(`!!document.activeElement.closest('#video-language')`)
      await setPageLanguage(w, anotherLang(lang)); o.keptBySetup = await mx(w, `M.checked('video-language')`); o.focusAfterSetup = await activeDesc(w)
      await focusByKeyboard(w, RADIO_LANG)
      for (let i = 0; i < 3 && (await w.evaluate('document.documentElement.lang')) !== lang; i++) { await key(w, 'ArrowRight'); await sleep(400) }
      o.byKeys = { onSwitcher: await w.evaluate(`!!document.activeElement.closest('#language-switcher')`), kept: await mx(w, `M.checked('video-language')`) }
      await w.goto(); await w.setFiles(F('lecture-60s.mp4')); await w.waitSettled(); await until(w, 'M.verdict()', 'the verdict after reload')
      await w.evaluate(`window.__p8pick = ${JSON.stringify(o.pick)}`)
    },
    asserts: [
      see('an arrow picks the next language; focus on its radio', (o) => o.pick !== o.lang && o.afterPick),
      see('kept through a page-language change by setup and by keys (focus on Page language)', (o) => o.keptBySetup === o.pick && o.byKeys.kept === o.pick && o.byKeys.onSwitcher),
    ],
    focus: [RADIO_VLANG],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-123': {
    name: 'Video language locked while running',
    ...OUTCOME,
    state: `M.running() && M.el('#video-language').disabled && M.is('create.lockedMaking', '#step-title .lock-note') && !M.el('#video-kind').disabled && M.checked('video-language') === document.documentElement.lang`,
    hold: `M.running() && M.el('#video-language').disabled`,
    setup: async (w, lang) => {
      const o = obsOf(w)
      await running(w, anotherLang(lang)); o.jobLine = await mx(w, `M.text('#process-job')`)
      o.jobLanguageName = await w.evaluate(`(document.querySelector('#video-language input[value="${anotherLang(lang)}"]').closest('.segment') || {}).textContent.trim()`)
      await setPageLanguage(w, lang)
    },
    asserts: [
      X('the next-video line names the video type only', `!M.vis('#video-next') || M.is('videoKind.nextVideo', '#video-next')`),
      see('the job keeps the language it started with', async (o, w) => ({ outcome: (await mx(w, `M.text('#process-job')`)).includes(o.jobLanguageName) ? 'pass' : 'cannot-determine', jobLine: await mx(w, `M.text('#process-job')`), started: o.jobLanguageName })),
    ],
    focus: [CANCEL, RADIO_KIND],
    fixtures: ['still-3600s.mp4'],
  },
  'S-124': {
    name: 'Video language locked while saving, and freed',
    ...OUTCOME,
    state: `M.res() === 'failure' && !M.el('#video-language').disabled && M.idle()`,
    setup: async (w, lang) => {
      const o = obsOf(w)
      await applyFault(w, 'F4b', { ms: 3000 }); await applyFault(w, 'F12', { job: 3 })
      await finished(w, lang, 'lecture-30s.mp4'); await saveWith(w); await until(w, 'M.saving()', 'saving', 10000)
      o.saving = await mx(w, `({ locked: M.el('#video-language').disabled, note: M.is('create.lockedSaving', '#step-title .lock-note') })`)
      await w.click(STOP_SAVE_SEL); await until(w, 'M.has("status.saveStopped", "#save-status")', 'save stopped', 60000)
      o.afterSave = await mx(w, `!M.el('#video-language').disabled`)
      await question(w); await w.click('#process-result .button--danger'); await w.waitRunning(); await encoding(w); await w.click(CANCEL); await until(w, 'M.idle() && M.create()', 'cancelled', 60000); await sleep(300)
      o.afterCancel = await mx(w, `!M.el('#video-language').disabled`)
      await create(w); await w.waitFailed()
    },
    asserts: [
      see('saving: locked, "Locked while your video is being saved."', (o) => o.saving.locked && o.saving.note),
      see('free after the save stops and after a cancel (after the failure: the record\'s state)', (o) => o.afterSave && o.afterCancel),
    ],
    focus: [RESULT],
    faults: ['F4b', 'F12'], fixtures: ['lecture-30s.mp4'],
  },
  'S-125': {
    name: "Video language and the card's date",
    state: `M.el('#title-card-on').checked && M.vis('#title-card-fields') && M.el('#title-card-date').value.length > 0`,
    setup: async (w, lang) => {
      const o = obsOf(w)
      await ready(w, anotherLang(lang)); await w.click('#title-card-on'); await sleep(300)
      o.date0 = await mx(w, `M.el('#title-card-date').value`)
      // Nothing picked: a page-language change fills the untouched date again in the new language.
      await setPageLanguage(w, lang); o.date1 = await mx(w, `M.el('#title-card-date').value`)
      // A pick: the date follows the pick (ms-MY, or English on the Malay page).
      const pick = lang === 'ms-MY' ? 'en-GB' : 'ms-MY'
      await w.click(`#video-language input[value="${pick}"]`); await sleep(400)
      o.pick = pick; o.date2 = await mx(w, `M.el('#title-card-date').value`)
      o.month = { [lang]: await w.evaluate(`new Intl.DateTimeFormat(${JSON.stringify(lang)}, { month: 'long' }).format(new Date())`), [pick]: await w.evaluate(`new Intl.DateTimeFormat(${JSON.stringify(pick)}, { month: 'long' }).format(new Date())`) }
    },
    asserts: [
      see('nothing picked: the untouched date follows the page language', (o) => o.date1 !== o.date0 || o.date1.includes(o.month[Object.keys(o.month)[0]])),
      see('picked: the date in the picked language', (o) => o.date2.includes(o.month[o.pick]) || (o.pick === 'en-GB' && /\d/.test(o.date2) && o.date2 !== o.date1)),
    ],
    focus: [RADIO_VLANG, '#title-card-date'],
    fixtures: ['lecture-60s.mp4'],
  },
  // VH-192: the finished video's player.
  'S-126': {
    name: "The finished card's player",
    state: `M.finished() && document.querySelectorAll('video.result-player').length === 1 && !!document.querySelector(${JSON.stringify(P8_PLAYER)})`,
    setup: async (w, lang) => finished(w, lang, 'short-2s.mp4'),
    asserts: [
      X('the new video, not the original: 6.04 s against step 2\'s 2 s on short-2s', `(async () => { const v = document.querySelector(${JSON.stringify(P8_PLAYER)}); for (let i = 0; i < 100 && v.readyState < 1 && !v.error; i++) await new Promise((r) => setTimeout(r, 100)); return v.readyState >= 1 && Math.abs(v.duration - M.el('#trim-preview').duration) > 1; })()`),
      X('paused, and the card holds focus if it was handed on', `document.querySelector(${JSON.stringify(P8_PLAYER)}).paused`),
    ],
    focus: [SAVE, CREATE],
    fixtures: ['short-2s.mp4'],
  },
  'S-127': {
    name: "The player's controls by keys",
    state: `M.finished() && !!document.querySelector(${JSON.stringify(P8_PLAYER)})`,
    setup: async (w, lang) => finished(w, lang, 'short-2s.mp4'),
    p8: ['playerKeys'],
    focus: [SAVE],
    fixtures: ['short-2s.mp4'],
  },
  'S-128': {
    name: 'Played, then a language change, the question and Keep it',
    state: `M.finished() && ${SAME_PLAYER} && document.activeElement === document.querySelector(${JSON.stringify(P8_CARD)})`,
    hold: `M.finished() && ${SAME_PLAYER}`,
    setup: async (w, lang) => {
      const o = obsOf(w)
      await finishedWithPlayer(w, anotherLang(lang))
      o.name0 = await mx(w, `M.text(${JSON.stringify(P8_CARD)} + ' .notification-title')`)
      o.played = await w.evaluate(`(async () => { const v = window.__p0; v.muted = true; const t0 = v.currentTime; await v.play(); await new Promise((r) => setTimeout(r, 800)); return v.paused ? -1 : Math.round((v.currentTime - t0) * 100) / 100 })()`)
      await setPageLanguage(w, lang)
      o.renamed = await mx(w, `({ same: ${SAME_PLAYER}, playing: !window.__p0.paused, name: M.text(${JSON.stringify(P8_CARD)} + ' .notification-title') })`)
      await question(w); o.asked = await w.evaluate(`({ players: document.querySelectorAll('video.result-player').length, paused: window.__p0.paused })`)
      await w.click('#process-result .button--secondary'); await sleep(400)
      o.kept = { same: await mx(w, SAME_PLAYER), src: await playerSrc(w) }
    },
    asserts: [
      see('it plays: currentTime advancing about 0.76 s in 0.8 s', (o) => o.played > 0.5),
      see('renamed in the new language, the same element, playing on', (o) => o.renamed.same && o.renamed.playing && o.renamed.name !== o.name0),
      see('the question takes it off the page, paused', (o) => o.asked.players === 0 && o.asked.paused),
      see('Keep it puts back the same element and URL', (o) => o.kept.same && o.kept.src === o.src),
    ],
    focus: [SAVE],
    fixtures: ['short-2s.mp4'],
  },
  'S-129': {
    name: 'The player under a Previous video',
    state: `M.previous() && !!M.verdict() && ${SAME_PLAYER} && ${CREATE_READS('create.create', true)}`,
    setup: async (w, lang) => { await finishedWithPlayer(w, lang); await w.setFiles(F('silent-10s.mp4')); await w.waitSettled(); await until(w, 'M.verdict()', 'next verdict') },
    asserts: [see('the same URL', async (o, w) => (await playerSrc(w)) === o.src)],
    focus: [FILE, SAVE],
    fixtures: ['short-2s.mp4', 'silent-10s.mp4'],
  },
  'S-130': {
    name: 'The player through a download hand-off',
    views: ['w375'], viewsWhy: 'the plan\'s recipe: the phone, three languages (sizing-2026-10-25.mjs)',
    state: `M.res() === 'result' && M.has('save.download', '#save-status') && M.lifetime('result.lifetimeDelivered') && ${SAME_PLAYER}`,
    // The phone view has no save dialog, so the page hands off to a download; never with F15b.
    setup: async (w, lang) => { await applyFault(w, 'F4d'); await finishedWithPlayer(w, lang); await saveWith(w); await w.waitSaved(); await sleep(500) },
    asserts: [see('the same URL, which still fetches', async (o, w) => (await playerSrc(w)) === o.src && (await fetches(w, o.src)))],
    focus: [SAVE, CREATE],
    faults: ['F4d'], fixtures: ['short-2s.mp4'],
  },
  'S-131': {
    name: 'Saved: the player leaves',
    ...OUTCOME,
    state: `${SAVED} && document.querySelectorAll('video.result-player').length === 0 && !M.lifetime('result.lifetime')`,
    setup: async (w, lang) => {
      const o = obsOf(w)
      await applyFault(w, 'F4b', { ms: 3000 }); await finishedWithPlayer(w, lang, 'lecture-30s.mp4')
      await w.evaluate(`(async () => { const v = window.__p0; v.muted = true; await v.play() })()`)
      await saveWith(w); await until(w, 'M.saving()', 'saving', 10000)
      await focusByKeyboard(w, P8_PLAYER); o.during = await w.evaluate(`({ playing: !window.__p0.paused, focused: document.activeElement === window.__p0 })`)
      await until(w, `M.has('status.saved', '#save-status')`, 'saved', 300000); await sleep(400)
      o.after = await w.evaluate(`({ connected: window.__p0.isConnected, src: window.__p0.getAttribute('src'), paused: window.__p0.paused, focusCard: document.activeElement === document.querySelector(${JSON.stringify(P8_CARD)}) })`)
      o.fetchesAfter = await fetches(w, o.src)
    },
    asserts: [
      see('it plays while the save streams, with focus in it', (o) => o.during.playing && o.during.focused),
      see('saved: paused, its source dropped, its URL revoked, out of the card; focus on the card', (o) => !o.after.connected && !o.after.src && o.after.paused && !o.fetchesAfter && o.after.focusCard),
      X('Save reads "Saved", disabled', `M.saveBtn().textContent.trim() === M.msg('create.saved') && M.saveBtn().disabled`),
    ],
    focus: [RESULT],
    faults: ['F4b'], fixtures: ['lecture-30s.mp4'],
  },
  'S-132': {
    name: 'A failed playback',
    ...OUTCOME,
    state: `M.finished() && !M.saveBtn().disabled && !!document.querySelector(${JSON.stringify(P8_PLAYER)})?.error`,
    // F15a in place on one page (kept), then F15b for real on a second load (the record).
    setup: async (w, lang) => {
      const o = obsOf(w)
      await finishedWithPlayer(w, lang)
      o.before = await mx(w, `M.text('#process-result')`); await applyFault(w, 'F15a'); await sleep(600); o.afterF15a = await mx(w, `M.text('#process-result')`)
      o.f15aSaveEnabled = await mx(w, '!M.saveBtn().disabled')
      // The second load leaves an unsaved result, so the page's leave warning (src/main.ts:2372–2383)
      // raises "Leave site?", which held the load for good: accepted, as F19 accepts it, for this load only.
      const off = w.page.on('Page.javascriptDialogOpening', (d) => { if (d.type === 'beforeunload') { o.leaveWarning = true; w.page.send('Page.handleJavaScriptDialog', { accept: true }).catch(() => undefined) } })
      try { await applyFault(w, 'F15b'); await finished(w, lang, 'short-2s.mp4') } finally { off() }
      o.error = await w.evaluate(`(async () => { const v = document.querySelector(${JSON.stringify(P8_PLAYER)}); for (let i = 0; i < 80 && !v.error; i++) await new Promise((r) => setTimeout(r, 100)); return v.error ? v.error.code : null })()`)
    },
    asserts: [
      see('F15a: nothing listens; the card, record, warnings and Save unchanged', (o) => o.before === o.afterF15a && o.f15aSaveEnabled),
      see('F15b: the player\'s MediaError recorded', (o) => ({ outcome: o.error ? 'pass' : 'fail', mediaError: o.error })),
    ],
    // M-04: then Save completes as S-62, a subresult of the record.
    subresults: SAVE_AFTER_FAILED_PLAYER_SUB,
    focus: [SAVE],
    faults: ['F15a', 'F15b'], fixtures: ['short-2s.mp4'],
  },
  'S-133': {
    name: 'A cancelled or failed save keeps the player',
    ...OUTCOME,
    state: `M.res() === 'result' && M.kindIn('#save-error') === 'error' && !M.saveBtn().disabled && ${SAME_PLAYER}`,
    // F4a, F4b stopped and F4c on one load, each kept; then the revised F4e on its own load (the record).
    setup: async (w, lang) => {
      const o = obsOf(w)
      const still = async () => ({ same: await mx(w, SAME_PLAYER), src: (await playerSrc(w)) === o.src, loaded: await w.evaluate(`(document.querySelector(${JSON.stringify(P8_PLAYER)}) || {}).readyState >= 1`) })
      await applyFault(w, 'F4a'); await finishedWithPlayer(w, lang)
      await saveWith(w); await w.waitSaved(); o.f4a = await still()
      await releaseAll(w); await applyFault(w, 'F4b', { ms: 3000 }); await finishedWithPlayer(w, lang, 'lecture-30s.mp4')
      await saveWith(w); await until(w, 'M.saving()', 'saving', 10000); await w.click(STOP_SAVE_SEL); await until(w, 'M.has("status.saveStopped", "#save-status")', 'stopped', 60000); o.f4b = await still()
      await releaseAll(w); await applyFault(w, 'F4c'); await finishedWithPlayer(w, lang)
      await saveWith(w); await w.waitSaved(); o.f4c = await still()
      await releaseAll(w); await applyFault(w, 'F4e'); await finishedWithPlayer(w, lang)
      await saveWith(w); await until(w, 'M.kindIn("#save-error") === "error"', 'save failed', 30000); await sleep(300)
    },
    asserts: [
      see('F4a (cancelled): the same player and URL, loaded', (o) => o.f4a.same && o.f4a.src && o.f4a.loaded),
      see('F4b (stopped): the same player and URL, loaded', (o) => o.f4b.same && o.f4b.src && o.f4b.loaded),
      see('F4c (refused): the same player and URL, loaded', (o) => o.f4c.same && o.f4c.src && o.f4c.loaded),
      see('F4e revised (failed): the same player and URL', async (o, w) => (await playerSrc(w)) === o.src),
    ],
    focus: [SAVE],
    faults: ['F4a', 'F4b', 'F4c', 'F4e'], fixtures: ['short-2s.mp4', 'lecture-30s.mp4'],
  },
  'S-134': {
    name: 'A back-forward-cache restore',
    ...EN_1280,
    state: `(window.__f19 && window.__f19.shows.some((s) => s.persisted)) ? M.finished() && !!document.querySelector(${JSON.stringify(P8_PLAYER)}) : !M.chosen()`,
    setup: async (w, lang) => { await applyFault(w, 'F19'); await finishedWithPlayer(w, lang); await FAULTS.F19.leave(w) },
    asserts: [
      see('restored from the cache, or Chrome\'s reasons recorded ("cannot determine" when it loads afresh)', (o, w) => (w.f19?.restored ? { outcome: 'pass', restored: true } : { outcome: 'cannot-determine', why: 'Chrome loaded the page afresh: ' + (w.f19?.notUsed?.reasons ?? ['no reason given']).join('; ') })),
      see('restored: the same player, its URL still fetching, and it plays', async (o, w) => {
        if (!w.f19?.restored) return { outcome: 'not-applicable', why: 'not restored' }
        const played = await w.evaluate(`(async () => { const v = document.querySelector(${JSON.stringify(P8_PLAYER)}); v.muted = true; try { await v.play() } catch (e) { return -1 } await new Promise((r) => setTimeout(r, 600)); const t = v.currentTime; v.pause(); v.currentTime = 0; return t })()`)
        return { outcome: (await playerSrc(w)) === o.src && (await fetches(w, o.src)) && played > 0 ? 'pass' : 'fail', played }
      }),
    ],
    focus: [SAVE],
    faults: ['F19'], fixtures: ['short-2s.mp4'],
  },
  // VH-193: the heavy-limiting warning.
  'S-135': {
    name: 'The heavy-limiting warning',
    state: `M.finished() && ${WARN_TEXT}.includes(${HEAVY_TITLE}) && !M.saveBtn().disabled`,
    setup: async (w, lang) => finished(w, lang, 'clicks-20s.mp4'),
    asserts: [see('the bite read from the worker\'s "chain planned" line is over 3 LU', (o, w) => { const p = (w.p8planned?.planned ?? []).at(-1); return { outcome: p && p.limiterBiteLu > 3 ? 'pass' : 'fail', bite: p?.limiterBiteLu ?? null } })],
    focus: [SAVE],
    fixtures: ['clicks-20s.mp4'],
  },
  'S-136': {
    name: 'Both production warnings',
    ...OUTCOME,
    state: `M.finished() && ${WARN_TEXT}.includes(${HEAVY_TITLE}) && ${WARN_TEXT}.includes(${META_TITLE})`,
    setup: async (w, lang) => { await applyFault(w, 'F16'); await finished(w, lang, 'clicks-20s.mp4') },
    asserts: [X('heavy limiting first, the metadata second, and no notification nested in the card', `${WARN_TEXT}.indexOf(${HEAVY_TITLE}) < ${WARN_TEXT}.indexOf(${META_TITLE}) && !document.querySelector(${JSON.stringify(P8_CARD + ' .notification')})`)],
    focus: [SAVE],
    faults: ['F16'], fixtures: ['clicks-20s.mp4'],
  },
  'S-137': {
    name: 'The warning unchanged after a save',
    state: `${SAVED} && ${WARN_TEXT}.includes(${HEAVY_TITLE})`,
    setup: async (w, lang) => {
      const o = obsOf(w)
      await finished(w, anotherLang(lang), 'clicks-20s.mp4'); o.before = await mx(w, WARN_TEXT)
      await saveWith(w); await w.waitSaved(); o.afterSave = await mx(w, WARN_TEXT)
      await setPageLanguage(w, lang)
    },
    asserts: [see('word for word beside "Saved."', (o) => o.before === o.afterSave), X('then in the new language', `${WARN_TEXT}.includes(M.msg('warnings.heavyLimiting.detail'))`)],
    focus: [RESULT],
    fixtures: ['clicks-20s.mp4'],
  },
  'S-138': {
    name: 'Both warnings on a retained result',
    ...OUTCOME,
    state: `M.previous() && ${WARN_TEXT}.includes(${HEAVY_TITLE}) && ${WARN_TEXT}.includes(${META_TITLE}) && ${WARN_TEXT}.indexOf(${HEAVY_TITLE}) < ${WARN_TEXT}.indexOf(${META_TITLE})`,
    setup: async (w, lang) => {
      const o = obsOf(w)
      const both = () => mx(w, `${WARN_TEXT}.includes(${HEAVY_TITLE}) && ${WARN_TEXT}.includes(${META_TITLE}) && ${WARN_TEXT}.indexOf(${HEAVY_TITLE}) < ${WARN_TEXT}.indexOf(${META_TITLE})`)
      await applyFault(w, 'F16'); await applyFault(w, 'F4d'); await finished(w, anotherLang(lang), 'clicks-20s.mp4')
      await saveWith(w); await w.waitSaved(); o.download = await both()
      await question(w); await w.click('#process-result .button--secondary'); await sleep(400); o.keep = await both()
      await w.setFiles(F('lecture-60s.mp4')); await w.waitSettled(); await until(w, 'M.verdict()', 'next verdict'); o.previous = await both()
      await setPageLanguage(w, lang)
    },
    asserts: [see('both, heavy first, through the download, Keep it and "Previous video"', (o) => o.download && o.keep && o.previous)],
    focus: [SAVE, FILE],
    faults: ['F16', 'F4d'], fixtures: ['clicks-20s.mp4', 'lecture-60s.mp4'],
  },
  'S-139': {
    name: 'A level file does not warn',
    ...EN_1280,
    state: `M.finished() && !${WARN_TEXT}.includes(${HEAVY_TITLE})`,
    setup: async (w, lang) => finished(w, lang, 'lecture-30s.mp4'),
    asserts: [see('the bite logged under 3 LU (0.00 on lecture-30s)', (o, w) => { const p = (w.p8planned?.planned ?? []).at(-1); return { outcome: p && p.limiterBiteLu !== null && p.limiterBiteLu < 3 ? 'pass' : 'fail', bite: p?.limiterBiteLu ?? null } })],
    focus: [SAVE],
    fixtures: ['lecture-30s.mp4'],
  },
  'S-140': {
    name: 'A QuickTime Animation file with no audio (wish VH-193.3), the closing asset',
    ...EN_1280,
    state: `M.finished() || M.res() === 'failure' || M.running() || M.kindIn('#source-block') === 'error'`,
    // Read from samples/ (never written): walked with a 15-minute limit, its outcome recorded either way.
    // Blocked at read in Chrome 156 (fixtures-proof-2026-10-25.json, N13): a block is its outcome, and Create is not offered.
    setup: async (w, lang) => { await ready(w, lang, SAMPLE_QTRLE, { timeout: 300000 }); obsOf(w).t0 = Date.now(); if (await mx(w, `M.kindIn('#source-block') === 'error'`)) { obsOf(w).blocked = true; return } await create(w); await untilDone(w, 'an outcome within 15 minutes', 900000).catch(() => { obsOf(w).timedOut = true }) },
    asserts: [found('the outcome: a finished video, a failure and its code, or still running at the limit', async (o, w) => ({ seconds: Math.round((Date.now() - o.t0) / 1000), blocked: !!o.blocked, block: await mx(w, `M.text('#source-block').replace(/\\s+/g, ' ').trim().slice(0, 200)`), timedOut: !!o.timedOut, res: await mx(w, 'M.res()'), stage: await mx(w, `M.text('#process-progress-text')`), text: await mx(w, `M.text('#process-result').replace(/\\s+/g, ' ').slice(0, 300)`) }))],
    focus: [RESULT],
    fixtures: [SAMPLE_QTRLE],
  },
  'S-140n': {
    name: "A QuickTime Animation file with no audio, N13 (the closing asset's made twin)",
    ...EN_1280,
    state: `M.finished() || M.res() === 'failure' || M.running() || M.kindIn('#source-block') === 'error'`,
    // Blocked at read in Chrome 156 (fixtures-proof-2026-10-25.json, N13): a block is its outcome, and Create is not offered.
    setup: async (w, lang) => { await ready(w, lang, 'qtrle-5s.mov', { timeout: 300000 }); obsOf(w).t0 = Date.now(); if (await mx(w, `M.kindIn('#source-block') === 'error'`)) { obsOf(w).blocked = true; return } await create(w); await untilDone(w, 'an outcome within 15 minutes', 900000).catch(() => { obsOf(w).timedOut = true }) },
    asserts: [found('the outcome: a finished video, a failure and its code, or still running at the limit', async (o, w) => ({ seconds: Math.round((Date.now() - o.t0) / 1000), blocked: !!o.blocked, block: await mx(w, `M.text('#source-block').replace(/\\s+/g, ' ').trim().slice(0, 200)`), timedOut: !!o.timedOut, res: await mx(w, 'M.res()'), text: await mx(w, `M.text('#process-result').replace(/\\s+/g, ' ').slice(0, 300)`) }))],
    focus: [RESULT],
    fixtures: ['qtrle-5s.mov'],
  },
  // VH-196: "About the video format".
  'S-141': {
    name: '"About the video format" open',
    state: `!M.chosen() && M.vis('#format-help') && M.el('#format-help-button').getAttribute('aria-expanded') === 'true' && ${focusIs('#format-help-button')}`,
    hold: `M.vis('#format-help')`,
    setup: async (w, lang) => { await fresh(w, lang); await focusByKeyboard(w, '#format-help-button'); await key(w, 'Enter'); await sleep(200) },
    asserts: [
      X('the hint word for word', `M.text('#format-help').replace(/\\s+/g, ' ').trim() === M.msg('lede.formatHelp.text')`),
      X('the "?" 44 x 44 after its promise\'s text; the tip under it, in the item', `(() => { const b = M.el('#format-help-button').getBoundingClientRect(), t = M.el('#format-help').getBoundingClientRect(), li = M.el('#format-help-button').closest('li').getBoundingClientRect(); return b.width >= 44 && b.height >= 44 && t.top >= b.bottom - 0.5 && t.left >= li.left - 1 && t.right <= li.right + 1; })()`),
      X('said by its polite region', `M.el('#format-help').closest('[aria-live="polite"]') !== null`),
    ],
    p8: ['formatTip'],
    focus: ['#format-help-button'],
    fixtures: [],
  },
  'S-142': {
    name: '"About the video format" closed',
    state: `!M.chosen() && !M.vis('#format-help') && M.el('#format-help-button').getAttribute('aria-expanded') === 'false'`,
    setup: async (w, lang) => {
      const o = obsOf(w)
      await fresh(w, lang)
      await focusByKeyboard(w, '#format-help-button'); await key(w, 'Enter'); await key(w, 'Tab'); o.tab = { focus: await activeDesc(w), ...(await tipState(w, 'format-help')) }
      await focusByKeyboard(w, '#format-help-button'); await key(w, 'Enter'); await key(w, 'Tab', { shift: true }); o.shiftTab = { focus: await activeDesc(w), onSwitcher: await w.evaluate(`!!document.activeElement.closest('#language-switcher')`), onNotice: await w.evaluate(`!!document.activeElement.closest('#language-notice')`), ...(await tipState(w, 'format-help')) }
      await focusByKeyboard(w, '#format-help-button'); await key(w, 'Enter'); await key(w, 'Escape'); o.escape = { focus: await activeDesc(w), ...(await tipState(w, 'format-help')) }
      await focusByKeyboard(w, '#format-help-button'); await key(w, 'Enter'); await w.click('#format-help p'); o.clickText = await tipState(w, 'format-help'); await w.click('.page-title'); o.clickTitle = await tipState(w, 'format-help')
      o.expect = await w.evaluate(`({ kind: (() => { const r = document.querySelector('#video-kind input:checked'); return '#' + (r.id || '') })(), notice: !!document.querySelector('#language-notice a') && document.querySelector('#language-notice a').getClientRects().length > 0 })`)
    },
    asserts: [
      see('Tab: closed, focus on Video type\'s checked radio', (o) => !o.tab.open && /video-kind/.test(o.tab.focus)),
      see('Shift+Tab: closed, focus on Page language\'s radio in English, the notice\'s link in Chinese and Malay', (o) => !o.shiftTab.open && (o.expect.notice ? o.shiftTab.onNotice : o.shiftTab.onSwitcher)),
      see('Escape: closed, focus on the "?"', (o) => !o.escape.open && o.escape.focus === '#format-help-button'),
      see('a click on its text keeps it open; a click on the page title closes it', (o) => o.clickText.open && !o.clickTitle.open),
    ],
    p8: ['formatTip'],
    focus: ['#format-help-button'],
    fixtures: [],
  },
  'S-143': {
    name: 'Two toggletips',
    state: `M.chosen() && !M.vis('#format-help') && !M.vis('#onset-help') && ${focusIs('#format-help-button')}`,
    hold: `M.chosen() && !M.vis('#format-help') && !M.vis('#onset-help')`,
    setup: async (w, lang) => {
      const o = obsOf(w); const both = async () => ({ format: (await tipState(w, 'format-help')).open, onset: (await tipState(w, 'onset-help')).open })
      await ready(w, lang); await fade(w)
      await focusByKeyboard(w, '#format-help-button'); await key(w, 'Enter'); o.s1 = await both()
      let n = 0; while (n++ < 120 && !(await w.evaluate(`document.activeElement === document.getElementById('onset-help-button')`))) await key(w, 'Tab')
      o.s2 = await both(); await key(w, 'Enter'); o.s3 = await both()
      await w.click('#format-help-button'); o.s4 = await both()
      await key(w, 'Escape'); o.s5 = { ...(await both()), focus: await activeDesc(w) }
    },
    asserts: [see('never both open; each closes the other; Escape closes only the open one, focus on its own "?"', (o) => o.s1.format && !o.s2.format && o.s3.onset && !(o.s4.format && o.s4.onset) && o.s4.format && !o.s5.format && !o.s5.onset && o.s5.focus === '#format-help-button')],
    p8: ['formatTip'],
    focus: ['#format-help-button', '#onset-help-button'],
    fixtures: ['lecture-60s.mp4'],
  },
  'S-144': {
    name: 'The lede at 320 px with its tip open',
    langs: ['en-GB'], langsWhy: 'the plan\'s recipe: English at 320 px open; S-144p takes the three languages closed',
    views: ['w320'], viewsWhy: 'the plan\'s recipe',
    state: null, // S-141's, set below
    hold: `M.vis('#format-help')`,
    setup: async (w, lang) => SCENARIOS['S-141'].setup(w, lang),
    asserts: [X('nothing off the page with the tip open', `document.documentElement.scrollWidth <= document.documentElement.clientWidth && M.el('#format-help').getBoundingClientRect().right <= document.documentElement.clientWidth + 0.5`)],
    focus: ['#format-help-button'],
    fixtures: [],
  },
  'S-144p': {
    name: "The lede closed: the file button's place",
    views: ['w1280', 'w800', 'w375', 'w320'], viewsWhy: 'the plan\'s recipe: 1280 x 900, 800 x 600, 375 x 812 and 320 x 568',
    state: `!M.chosen() && !M.vis('#format-help')`,
    setup: async (w, lang) => fresh(w, lang),
    asserts: [
      { what: 'the file button never lower than VH-196\'s after-reading (top-187.mjs, rings-179.mjs v18)', fn: async (w) => { const r = await w.evaluate(`({ top: Math.round(document.getElementById('file-input').getBoundingClientRect().top + scrollY), w: innerWidth, h: innerHeight, lang: document.documentElement.lang })`); const after = { 1280: { 'en-GB': 804, 'zh-Hans': 954, 'ms-MY': 1065 }, 320: { 'en-GB': 1169, 'zh-Hans': 1243, 'ms-MY': 1527 } }[r.w]?.[r.lang]; return after === undefined ? { outcome: 'not-counted', why: 'recorded: no after-reading at this view', ...r } : { outcome: r.top <= after + 1 ? 'pass' : 'fail', afterReading: after, ...r } } },
      found('the first screen: whether the file button is in it (V-18)', (o, w) => w.evaluate(`({ top: Math.round(document.getElementById('file-input').getBoundingClientRect().top), innerHeight })`)),
    ],
    focus: [FILE],
    fixtures: [],
  },
  // VH-182: the footer and Report a problem.
  'S-145': {
    name: "The footer's headings, on either video type",
    state: `!M.chosen() && !document.querySelector('dialog[open]') && M.checked('video-kind') === 'staff'`,
    setup: async (w, lang) => {
      const o = obsOf(w)
      const routes = () => w.evaluate(`[...document.querySelectorAll('.footer-help a, .footer-help button')].map((a) => ({ id: a.id, text: a.textContent.trim(), href: a.href || null }))`)
      await fresh(w, lang); o.staff = await routes()
      await w.chooseKind('submission'); o.submission = await routes(); await w.chooseKind('staff')
      await w.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)'); await sleep(300)
    },
    afterMode: async (w) => { await w.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)'); await sleep(300) },
    asserts: [see('on Student submission both the staff and the student routes stay, the same words and addresses', (o) => o.staff.length === 4 && same(o.staff, o.submission))],
    focus: ['#contact-creators', '#contact-self-service', '#feedback-open', '#feedback-form-link'],
    fixtures: [],
  },
  'S-146': {
    name: "Report a problem's dialog and email",
    state: `!!document.querySelector('dialog#feedback-dialog[open]') && M.has('feedback.opened', '#feedback-status')`,
    setup: async (w, lang) => { await feedbackOpen(w, lang); await w.type('#feedback-message', 'The page worked well for me.'); await w.click(SUBMIT); await sleep(500) },
    asserts: [
      X('the dialog named "Report a problem"', `M.text('#feedback-dialog h2').trim() === M.msg('feedback.heading')`),
      X('the intro names the learning content team\'s address', `M.says('feedback.intro', { address: 'UI-Learning-Content@nottingham.ac.uk' }, '#feedback-dialog')`),
      X('the email to that address, its subject "UoN Video Helper problem report…"', `M.mailto.length > 0 && M.mailto.at(-1).to === 'UI-Learning-Content@nottingham.ac.uk' && /^UoN Video Helper problem report/.test(M.mailto.at(-1).subjectText || '')`),
    ],
    focus: ['#feedback-message', SUBMIT],
    fixtures: [],
  },
  'S-147': {
    name: 'The errors that name the button',
    state: `M.res() === 'failure' && M.has('failure.encoderRefused.what', '#process-result') && M.has('failure.encoderRefused.next', '#process-result')`,
    // F18 here; F1 held past 5 s, F10 and F11 are S-01b's, S-89's and S-90a's
    // records, whose assertions say the button's name (amended below), so the
    // watchdog's two minutes are not spent again in every cell.
    setup: async (w, lang) => { await applyFault(w, 'F18'); await ready(w, lang, 'lecture-30s.mp4'); await create(w); await w.waitFailed(); obsOf(w).fired = (w.p8planned?.faults ?? []).filter((f) => f.args[0] === 'fault F18').map((f) => f.args.slice(1)) },
    asserts: [
      X('failure.encoderRefused.next names Report a problem', `M.msg('failure.encoderRefused.next').includes(M.msg('feedback.open')) || document.documentElement.lang !== 'en-GB'`),
      see('the job\'s own encode refused, once (F18\'s branch)', (o) => ({ outcome: o.fired?.length === 1 ? 'pass' : 'fail', fired: o.fired })),
      found('failure.unlevellable.next', () => ({ sourceOnly: 'no fault is known that makes a recording unlevellable (src/ui/failure-text.test.ts)' })),
    ],
    focus: [RESULT, CREATE],
    faults: ['F18'], fixtures: ['lecture-30s.mp4'],
  },
  'S-148': {
    name: 'Two report buttons',
    state: `!!document.querySelector('dialog#feedback-dialog[open]') && M.vis('#errors-panel') && window.__p8opener === 'feedback-open'`,
    setup: async (w, lang) => {
      const o = obsOf(w)
      await fresh(w, lang); await applyFault(w, 'F8'); await sleep(500)
      await w.click('#feedback-report'); await sleep(300); o.firstOpen = await w.evaluate(`!!document.querySelector('dialog#feedback-dialog[open]')`)
      await key(w, 'Escape'); await sleep(200); o.afterEscape = await activeDesc(w)
      await w.click('#feedback-open'); await sleep(300); await w.evaluate(`window.__p8opener = 'feedback-open'`)
      o.panelKeeps = await mx(w, `M.text('#errors-panel').includes(M.text('#feedback-report').trim())`)
    },
    asserts: [see('Report this problem opens the dialog; Escape returns focus to it; Report a problem opens the same dialog', (o) => o.firstOpen && o.afterEscape === '#feedback-report' && o.panelKeeps)],
    focus: ['#feedback-message', '#feedback-close'],
    faults: ['F8'], fixtures: [],
  },
  'S-149': {
    name: 'Focus on Video language when a check blocks',
    ...AT_1280,
    state: `M.kindIn('#source-block') === 'error' && M.el('#step-trim').hidden && M.el('#step-title').hidden && ${focusIs('#file-input')}`,
    hold: `M.kindIn('#source-block') === 'error' && M.el('#step-title').hidden`,
    setup: async (w, lang) => { await applyFault(w, 'F14'); await ready(w, lang, 'lecture-30s.mp4'); await focusByKeyboard(w, RADIO_VLANG); await w.setFiles(F('prores-1080p.mov')); await until(w, `M.kindIn('#source-block') === 'error'`, 'the block', 120000); await sleep(400) },
    // M-04: the read-failure branch beside the block's, in the light records: S-149 itself unchanged.
    subresults: READ_FAILURE_SUB,
    focus: [FILE],
    faults: ['F14'], fixtures: ['lecture-30s.mp4', 'prores-1080p.mov', 'notvideo.mp4'],
  },
  'S-150': {
    name: 'A job made with focus on Announce progress',
    ...AT_1280,
    state: `M.finished() && document.activeElement === document.querySelector(${JSON.stringify(P8_CARD)}) && !!document.querySelector(${JSON.stringify(P8_PLAYER)})`,
    hold: `M.finished()`,
    setup: async (w, lang) => { await ready(w, lang, 'lecture-30s.mp4'); await create(w); await w.waitRunning(); await until(w, `M.vis('#announce-progress')`, 'Announce progress', 30000); await focusByKeyboard(w, '#announce-progress'); await w.waitFinished() },
    asserts: [X('the card, now taller with the player, holds focus', `document.querySelector(${JSON.stringify(P8_CARD)}).getBoundingClientRect().height > 200`)],
    focus: [RESULT],
    fixtures: ['lecture-30s.mp4'],
  },
  'S-151': {
    name: 'Completion with Announce progress off',
    ...OUTCOME,
    state: `M.finished() && ${WARN_TEXT}.includes(${HEAVY_TITLE}) && ${WARN_TEXT}.includes(${META_TITLE}) && !M.el('#announce-progress').checked`,
    setup: async (w, lang) => { await applyFault(w, 'F16'); await ready(w, lang, 'clicks-20s.mp4'); await create(w); await w.waitRunning(); await until(w, `M.vis('#announce-progress')`, 'Announce progress', 30000); await w.click('#announce-progress'); obsOf(w).unticked = await mx(w, `!M.el('#announce-progress').checked`); await w.waitFinished() },
    asserts: [
      see('unticked while the job ran (it shows only then)', (o) => o.unticked),
      { what: '#status at the completion\'s own write (the mutation that drew the card): "Your video is ready." then both titles, heavy first; earlier writes not counted', fn: async (w) => { const s = await spokenAtCompletion(w); if (!s) return { outcome: 'cannot-determine', why: 'no completion watched' }; if (!s.texts.length) return { outcome: s.from ? 'fail' : 'cannot-determine', why: s.why, earlier: s.earlier }; const words = await mx(w, `({ ready: M.msg('status.ready'), heavy: ${HEAVY_TITLE}, meta: ${META_TITLE} })`); const said = s.texts.find((t) => t.includes(words.ready) && t.includes(words.heavy)); return { outcome: said && said.indexOf(words.ready) < said.indexOf(words.heavy) && said.indexOf(words.heavy) < said.indexOf(words.meta) ? 'pass' : 'fail', job: [s.from, s.to], said: said ?? s.texts.slice(-3) } } },
    ],
    focus: [RESULT],
    faults: ['F16'], fixtures: ['clicks-20s.mp4'],
  },
  'S-152': {
    name: 'A failed playback beside the limiting warning',
    ...OUTCOME,
    state: `M.finished() && ${WARN_TEXT}.includes(${HEAVY_TITLE}) && !M.saveBtn().disabled && !!document.querySelector(${JSON.stringify(P8_PLAYER)})?.error`,
    setup: async (w, lang) => { await applyFault(w, 'F15b'); await finished(w, lang, 'clicks-20s.mp4'); obsOf(w).error = await w.evaluate(`(async () => { const v = document.querySelector(${JSON.stringify(P8_PLAYER)}); for (let i = 0; i < 80 && !v.error; i++) await new Promise((r) => setTimeout(r, 100)); return v.error ? v.error.code : null })()`) },
    asserts: [see('the player\'s MediaError recorded; the warning first and word for word', (o) => ({ outcome: o.error ? 'pass' : 'fail', mediaError: o.error }))],
    // M-04: then Save completes as S-62, the warning standing word for word beside "Saved.".
    subresults: { ...SAVE_AFTER_FAILED_PLAYER_SUB, asserts: [...SAVE_AFTER_FAILED_PLAYER, see('the heavy-limiting warning stands word for word beside "Saved."', (o) => ({ outcome: !!o.beforeSave.warn && o.afterSave.warn === o.beforeSave.warn ? 'pass' : 'fail', before: o.beforeSave.warn.slice(0, 160), after: o.afterSave.warn.slice(0, 160) })), X('its heading still in the result\'s warnings', `${WARN_TEXT}.includes(${HEAVY_TITLE})`)] },
    focus: [SAVE],
    faults: ['F15b'], fixtures: ['clicks-20s.mp4'],
  },
  'S-153': {
    name: 'A kept sound that frame placement takes over one block',
    ...EN_1280,
    state: `M.finished()`,
    setup: async (w, lang) => {
      const o = obsOf(w)
      await ready(w, lang, 'late-sound-3.71s-25fps-10s.mp4'); await w.type('#trim-end', '0:04.1'); await w.press('Tab'); await w.waitSettled(); await until(w, 'M.verdict()', 'the verdict')
      o.noAudioBefore = await mx(w, `M.has('warnings.noAudio.heading', '#audio-warnings') || M.has('warnings.keptTooLittleAudio.heading', '#audio-warnings')`)
      await create(w); await untilDone(w, 'an outcome')
    },
    asserts: [
      see('no "This video has no audio" or too-little-kept note for 3.71 to 4.10 s (390 ms asked, 410 ms on frames)', (o) => o.noAudioBefore === false),
      see('finished levelled: the job planned its sound', (o, w) => (w.p8planned?.planned ?? []).length > 0),
    ],
    focus: [SAVE],
    fixtures: ['late-sound-3.71s-25fps-10s.mp4'],
  },
})
SCENARIOS['S-144'].state = SCENARIOS['S-141'].state

// Source-only: never walked, each with its reason (scenarios-2026-10-25.md).
export const SOURCE_ONLY = {
  'S-104': '"Unknown" alone: walked only if N11 reads with no duration (scenarios file); it does not: the page reads noduration-10s.webm as "10 seconds" (fixtures-proof-2026-10-25.json, N11), and no other fixture is known that the page reads with a fact missing; src/ui/format.test.ts and src/ui/source-panel.test.ts',
  'S-154': 'VH-186\'s estimate with no time: no fixture gives a non-finite estimate; src/ui/preflight-panel.test.ts:175, and a fact not read beyond the duration by src/ui/format.test.ts:45 and :50 and src/ui/source-panel.test.ts:332 (P-03)',
}

// ---------------------------------------------------------------------------
// VH-198: the carried scenarios Phase 8 changed ("Carried scenarios Phase 8
// changed"), amended so no assertion passes on Phase 7's text, place or
// emphasis: assertions added, and the state, setup or focus list replaced
// where the change made the old one false or blind.
function amend(id, { asserts = [], p8 = [], ...rest }) {
  const sc = SCENARIOS[id]
  if (!sc) throw new Error('amend: no scenario ' + id)
  Object.assign(sc, rest)
  sc.asserts = [...(sc.asserts ?? []), ...asserts]
  if (p8.length) sc.p8 = [...new Set([...(sc.p8 ?? []), ...p8])]
}
const NOTE_HIDDEN = X('the browser note hidden and empty (VH-187)', `M.el('#browser-note').hidden && M.text('#browser-note').trim() === ''`)
const NOTE_SHOWN = X('the browser note says browserNote.notPassed (VH-187)', `!M.el('#browser-note').hidden && M.is('browserNote.notPassed', '#browser-note')`)
const NAMES_BUTTON = (path, sel = 'body') => X(`${path} names the Report a problem button`, `M.has('${path}', '${sel}') && M.msg('${path}').includes(M.msg('feedback.open'))`)
const AGAIN = X('Create reads "Create the video again" (VH-190)', `M.is('create.again', ${JSON.stringify(CREATE)})`)
const AGAIN_SECONDARY = X('Create reads "Create the video again", secondary (VH-190)', CREATE_READS('create.again', true))
const RECORD_SHORT = X('the record\'s output in its short form, without the purpose (VH-188)', `M.text('#process-result').includes(M.msg('preset.inRecord.best')) && !M.text('#process-result').includes(M.msg('preset.labels.best'))`)
const ONE_PLAYER = X('the card holds its player (VH-192)', `document.querySelectorAll('video.result-player').length === 1 && !!document.querySelector(${JSON.stringify(P8_PLAYER)})`)
const NO_PLAYER = X('no result player in the document (VH-192)', `document.querySelectorAll('video.result-player').length === 0`)
const TEAM = 'UI-Learning-Content@nottingham.ac.uk'
const TEAM_IN_DIALOG = X('the lines name the learning content team\'s address (VH-182)', `M.text('#feedback-dialog').includes('${TEAM}')`)

amend('S-01', { asserts: [NOTE_HIDDEN] })
amend('S-01b', { asserts: [NOTE_SHOWN, NAMES_BUTTON('failure.startup.workerNotStarted')] })
amend('S-02', { asserts: [NOTE_SHOWN, X('B1\'s labels: "Video processing (WebCodecs)" named, no bracketed explanation beyond the format and API names', `/WebCodecs/.test(M.text('#check-webcodecs'))`)] })
amend('S-03', {
  p8: ['formatTip'],
  asserts: [
    X('the owner\'s five promises, in order', `(() => { const items = [...document.querySelectorAll('.lede > ul > li')].map((li) => (li.querySelector('span') || li).textContent.replace(/\\s+/g, ' ').trim()); return items.length === 5 && items.every((t, i) => t === M.msg('lede.promises.' + i)); })()`),
    X('"About the video format" 44 x 44, collapsed, controlling #format-help', `(() => { const b = M.el('#format-help-button'); const r = b.getBoundingClientRect(); return r.width >= 44 && r.height >= 44 && b.getAttribute('aria-expanded') === 'false' && b.getAttribute('aria-controls') === 'format-help'; })()`),
    NOTE_HIDDEN,
    X('no Video language before step 1', `!(M.el('#video-language').compareDocumentPosition(M.el('#step-choose')) & Node.DOCUMENT_POSITION_FOLLOWING) || M.el('#step-title').hidden`),
    { what: 'Tab from the top: skip link, Page language, (the notice\'s link), About the video format, Video type, Choose file', fn: async (w) => {
      // The sequential-focus starting point put at the top: the body focused, as after a load.
      await w.evaluate(`(() => { window.scrollTo(0, 0); document.body.tabIndex = -1; document.body.focus(); document.body.removeAttribute('tabindex'); })()`)
      const stops = []
      for (let i = 0; i < 12; i++) { await key(w, 'Tab'); const s = await w.evaluate(`(() => { const a = document.activeElement; return a.closest('#language-switcher') ? 'page language' : a.closest('#language-notice') ? 'notice link' : a.id === 'format-help-button' ? 'format ?' : a.closest('#video-kind') ? 'video type' : a.id === 'file-input' ? 'choose file' : a.matches('a[href^="#"]') ? 'skip link' : (a.id || a.tagName.toLowerCase()); })()`); stops.push(s); if (s === 'choose file') break }
      await w.evaluate(`document.activeElement && document.activeElement.blur()`)
      const notice = await w.evaluate(`!!document.querySelector('#language-notice a') && document.querySelector('#language-notice a').getClientRects().length > 0`)
      const want = ['skip link', 'page language', ...(notice ? ['notice link'] : []), 'format ?', 'video type', 'choose file']
      return { outcome: same(stops, want) ? 'pass' : 'fail', stops, want }
    } },
    found('app.description, read as it stands for VH-200', (o, w) => w.evaluate(`(document.querySelector('meta[name="description"]') || {}).content || null`)),
  ],
})
amend('S-07', { focus: [RADIO_KIND], asserts: [X('#video-next inside #video-kind, hidden; the line under Video type unchanged', `M.el('#video-kind').contains(M.el('#video-next')) && !M.vis('#video-next')`)] })
amend('S-08', { asserts: [X('the helper is B9\'s two lines', `M.text('#video-language-helper').replace(/\\s+/g, ' ').trim() === M.msg('videoLanguage.helper') + ' ' + M.msg('videoLanguage.typed')`)] })
amend('S-15', { asserts: [X('Create reads "Create the video", primary', CREATE_READS('create.create', false)), X('"Plays over" labels the onset select', `M.text('label[for="closing-onset"]').trim() === M.msg('closing.onsetLabel')`)] })
amend('S-17', { asserts: [X('the "?" named "About what the graphics play over"; its terms renamed', `M.el('#onset-help-button').getAttribute('aria-label') === M.msg('closing.helpLabel') && M.text('#onset-help').includes(M.msg('closing.helpExistingTerm')) && M.text('#onset-help').includes(M.msg('closing.helpFreezeTerm'))`)] })
amend('S-24', { asserts: [X('Create reads "Create the video"', `M.is('create.create', ${JSON.stringify(CREATE)})`)] })
amend('S-30', { asserts: [X('Create reads "Create the video", secondary, beside the kept result', CREATE_READS('create.create', true)), ONE_PLAYER] })
amend('S-31', { asserts: [
  X('the way out pinned with its substituted name: "…choose the smaller file, or free some space…"', `M.says('status.storageWayOut', { smaller: { msg: 'preset.inSentence.smaller' } }, '#status')`),
  X('no old output name', `!/Smaller \\/ reduced/.test(document.body.textContent) && M.text('#source-block').includes(M.msg('preset.inSentence.smaller'))`),
] })
amend('S-45b', { asserts: [X('the reason "Not used without closing graphics."', `document.body.textContent.includes(M.msg('closing.notUsedWith.none'))`)] })
amend('S-48', { asserts: [X('the next-video line names the video type only', `!M.vis('#video-next') || M.is('videoKind.nextVideo', '#video-next')`)] })
amend('S-50', {
  name: 'Type switched while running (Video language now locks: S-123)',
  state: `M.running() && M.checked('video-kind') === 'submission' && M.vis('#video-next') && M.is('videoKind.nextVideo', '#video-next') && M.has('videoKind.options.staff', '#process-job') && M.el('#video-language').disabled`,
  setup: async (w, lang) => { await running(w, lang); await w.chooseKind('submission'); await sleep(300) },
  focus: [RADIO_KIND],
})
amend('S-52', { asserts: [X('Create reads "Create the video", primary', CREATE_READS('create.create', false))] })
amend('S-53', { asserts: [AGAIN_SECONDARY, RECORD_SHORT, ONE_PLAYER, X('no "Worth knowing about the finished video" on a level lecture', `!window.__p8.warnBox()`)] })
for (const id of ['S-53-W', 'S-53-LW', 'S-54a', 'S-54b', 'S-54c', 'S-54d', 'S-55a', 'S-55b', 'S-55c']) amend(id, { asserts: [AGAIN, RECORD_SHORT, ONE_PLAYER] })
amend('S-56', { asserts: [
  X('the next step pinned with its substituted name: "Free some space, or choose the smaller file, and try again."', `M.says('failure.outOfSpace.next', { smaller: { msg: 'preset.inSentence.smaller' } }, '#process-result')`),
  X('Create reads "Create the video"', `M.is('create.create', ${JSON.stringify(CREATE)})`),
] })
for (const id of ['S-58', 'S-58-W', 'S-58-LW']) {
  const file = id === 'S-58-W' ? LONG_W : id === 'S-58-LW' ? LONG_UNDERSCORES : 'lecture-30s.mp4'
  amend(id, {
    setup: async (w, lang) => { await finished(w, lang, file); obsOf(w).src = await playerSrc(w); await question(w) },
    asserts: [NO_PLAYER, AGAIN, see('its URL not revoked', async (o, w) => fetches(w, o.src))],
  })
}
amend('S-59', {
  setup: async (w, lang) => { await finishedWithPlayer(w, lang, 'lecture-30s.mp4'); await question(w); await w.click('#process-result .button--secondary'); await sleep(400) },
  asserts: [X('Keep it puts back the same player element', SAME_PLAYER), see('and the same URL', async (o, w) => (await playerSrc(w)) === o.src), RECORD_SHORT, AGAIN, X('focus on the card', `document.activeElement === document.querySelector(${JSON.stringify(P8_CARD)})`)],
})
amend('S-60', {
  setup: async (w, lang) => { await finishedWithPlayer(w, lang, 'lecture-360s.mp4'); await question(w); await w.click('#process-result .button--danger'); await w.waitRunning(); await encoding(w) },
  asserts: [X('the old player without a source', `!!window.__p0 && !window.__p0.getAttribute('src') && !window.__p0.isConnected`), see('its URL no longer fetching', async (o, w) => !(await fetches(w, o.src)))],
})
amend('S-61', { asserts: [ONE_PLAYER, AGAIN, X('Video language locked, "Locked while your video is being saved."', `M.el('#video-language').disabled && M.is('create.lockedSaving', '#step-title .lock-note')`)] })
amend('S-62', {
  setup: async (w, lang) => { await finishedWithPlayer(w, lang, 'lecture-30s.mp4'); await saveWith(w); await w.waitSaved() },
  asserts: [NO_PLAYER, AGAIN_SECONDARY, see('its URL no longer fetching', async (o, w) => !(await fetches(w, o.src)))],
})
for (const id of ['S-63', 'S-63-W', 'S-63-LW']) amend(id, { asserts: [ONE_PLAYER, X('Create reads "Create the video", secondary', CREATE_READS('create.create', true)), RECORD_SHORT] })
for (const id of ['S-64', 'S-65']) amend(id, { asserts: [ONE_PLAYER] })
for (const id of ['S-66', 'S-67', 'S-68', 'S-69']) amend(id, { asserts: [ONE_PLAYER, AGAIN] })
for (const id of ['S-70a', 'S-70b']) amend(id, { asserts: [ONE_PLAYER, AGAIN, RECORD_SHORT] })
amend('S-71', { asserts: [X('the next-video line names the video type only; no videoLanguage.nextVideo', `M.is('videoKind.nextVideo', '#video-next') && M.msg('videoLanguage.nextVideo') === undefined`), AGAIN] })
amend('S-72a', { asserts: [ONE_PLAYER, AGAIN] })
amend('S-72b', { asserts: [NO_PLAYER] })
amend('S-75', { asserts: [X('the dialog named "Report a problem"', `M.text('#feedback-dialog h2').trim() === M.msg('feedback.heading')`), X('the intro names the team\'s address', `M.says('feedback.intro', { address: '${TEAM}' }, '#feedback-dialog')`)] })
// M-04: at enlargement (320 px, both proxies, the 32 px font) the dialog is operated by keys too, as the record's subresults.
amend('S-76', { subresults: DIALOG_ENLARGED_SUB, asserts: [X('the dialog named "Report a problem"', `M.text('#feedback-dialog h2').trim() === M.msg('feedback.heading')`)] })
amend('S-78', { asserts: [X('the email to the team, subject "UoN Video Helper problem report…"', `M.mailto.length > 0 && M.mailto.at(-1).to === '${TEAM}' && /^UoN Video Helper problem report/.test(M.mailto.at(-1).subjectText || '')`), TEAM_IN_DIALOG] })
amend('S-78k', { asserts: [X('the email to the team', `M.mailto.length > 0 && M.mailto.at(-1).to === '${TEAM}'`)] })
for (const id of ['S-79a', 'S-79b', 'S-80a', 'S-80b']) amend(id, { asserts: [TEAM_IN_DIALOG] })
amend('S-81', { asserts: [X('the contact line names the learning content team, its link to the same address', `M.says('statement.contact.text', { address: '${TEAM}' }, '#accessibility-statement') && [...document.querySelectorAll('#accessibility-statement a[href^="mailto:"]')].some((a) => a.href.includes('${TEAM}'))`)] })
amend('S-83', {
  focus: ['#feedback-open', '#feedback-form-link', '#contact-creators', '#contact-self-service'],
  asserts: [X('"Email the learning content team" gone from the footer; no mailto: in it', `!document.getElementById('contact-learning-content') && !document.querySelector('.footer-help a[href^="mailto:"]')`)],
})
amend('S-86', {
  state: `M.chosen() && !!M.verdict() && M.checked('video-language') === ${OTHER_VIDEO_LANGUAGE} && window.__audit.boot.langAtDCL === document.documentElement.lang`,
  setup: async (w, lang) => { await ready(w, lang, 'lecture-30s.mp4'); await w.click(`#video-language input[value="${otherVideoLanguage(lang)}"]`); await sleep(300); await w.goto(); obsOf(w).hiddenAfterReload = await mx(w, `M.el('#step-title').hidden`); await w.setFiles(F('lecture-30s.mp4')); await w.waitSettled(); await until(w, 'M.verdict()', 'the verdict after reload') },
  fixtures: ['lecture-30s.mp4'],
  asserts: [see('after the reload step 3 is hidden until a video is read', (o) => o.hiddenAfterReload === true)],
})
amend('S-88', { asserts: [ONE_PLAYER, AGAIN] })
amend('S-89', { asserts: [NAMES_BUTTON('failure.checkFailed.next', '#preflight-report')] })
for (const id of ['S-90a', 'S-90b']) amend(id, { asserts: [NAMES_BUTTON('failure.tryAgain', '#process-result')] })
amend('S-90a', { asserts: [X('Video language held with the other locks', `M.el('#video-language').disabled`)] })
amend('S-91', {
  setup: async (w, lang) => { await applyFault(w, 'F6a'); await applyFault(w, 'F16'); await finished(w, lang, 'lecture-30s.mp4', async () => { await w.select('#closing-type', 'fade'); await w.waitSettled() }); await w.setFiles(F('lecture-60s.mp4')); await w.waitSettled(); await until(w, 'M.verdict()', 'next verdict') },
  faults: ['F6a', 'F16'],
  asserts: [X('the metadata warning with the card, and no notification nested in it', `!!window.__p8.warnBox() && window.__p8.warnBox().textContent.includes(M.msg('warnings.metadataLost.heading')) && !document.querySelector(${JSON.stringify(P8_CARD + ' .notification')})`), RECORD_SHORT],
})

// K-player (new): the player by keys, by the focused accessibility node,
// from the card the job's end focused. Chrome 156's inventory, as the pilot
// read it: play, volume, mute, full screen, more controls, the time slider.
// A control Tab does not reach is "cannot determine" (native), never a pass.
const PLAYER_ACTIVE = `document.activeElement === document.querySelector(${JSON.stringify(P8_PLAYER)})`
const UA_RING = 'the ring is drawn by the user agent inside the player\'s shadow tree, so this route does not judge it; S-127 (phase8.mjs playerKeys) reads it on a held frame: 2.4.7 by the ring isolated with an author outline:none where a style reaches the control, 2.4.13 by area and each exception\'s evidence, 2.4.11 and 2.4.12 by hit test'
ROUTES['K-player'] = {
  name: 'K-player: the finished video\'s player by keys, forward and back, and a save while focus is in it',
  setup: async (w, lang) => { await applyFault(w, 'F4b', { ms: 3000 }); await fresh(w, lang); await w.setFiles(F('short-2s.mp4')); await w.waitSettled(); await until(w, 'M.proceed() && M.create()', 'ready') },
  fixtures: ['short-2s.mp4'],
  faults: ['F4b'],
  steps: [
    { key: 'Tab', untilState: FOCUS_ON(CREATE), repeat: 80, note: 'Tab to Create' },
    { key: 'Enter', waitFor: MX('M.finished()'), timeout: 300000, state: FOCUS_ON(RESULT), note: 'S-53: the job finishes; focus handed from Cancel to the card' },
    { setup: async (w) => { await w.evaluate(`(() => { const v = document.querySelector(${JSON.stringify(P8_PLAYER)}); v.muted = true; })()`) }, note: 'setup: the player muted by script, so a key\'s play is never refused for sound' },
    { key: 'Tab', axExpect: '^Video ', state: PLAYER_ACTIVE, noFocusRing: true, note: 'the player itself, named by the card\'s title' },
    { key: 'Tab', axExpect: '^button "(play|pause)"', native: true, noFocusRing: true, note: 'play' },
    { key: 'Space', axExpect: '^button "pause"', native: true, noFocusRing: true, state: `!document.querySelector(${JSON.stringify(P8_PLAYER)}).paused`, wait: 600, note: 'Space plays (the control becomes pause)' },
    { key: 'Space', axExpect: '^button "play"', native: true, noFocusRing: true, state: `document.querySelector(${JSON.stringify(P8_PLAYER)}).paused`, note: 'Space again pauses' },
    // VH-198: the controls between play and the time slider are the ones Chrome shows at this width: at
    // 1280 px volume, mute ("un-mute" while muted), full screen and more controls; at 320 px full screen
    // goes into More. Each stop is kept in the step's `stops`; S-127's playerKeys judges the inventory.
    { key: 'Tab', axUntil: '^slider "video time scrubber"', repeat: 8, native: true, noFocusRing: true, note: 'Tab through the controls Chrome shows at this width to the time slider; ' + UA_RING },
    { setup: async (w) => { await w.evaluate(`window.__kpT = document.querySelector(${JSON.stringify(P8_PLAYER)}).currentTime`) }, note: 'setup: the time read before the seek' },
    { key: 'ArrowRight', axExpect: '^slider "video time scrubber"', native: true, noFocusRing: true, wait: 400, state: `(() => { const v = document.querySelector(${JSON.stringify(P8_PLAYER)}); return v.paused && v.currentTime > window.__kpT; })()`, note: 'seeking by keys, apart from play: the time moves, playback stays paused' },
    { key: 'Tab', state: FOCUS_ON(SAVE), note: 'the next Tab after the last control reaches Save the video' },
    { key: 'Tab', shift: true, untilState: `!(${PLAYER_ACTIVE})`, repeat: 12, noFocusRing: true, state: `(() => { const c = document.querySelector(${JSON.stringify(P8_CARD)}); const a = document.activeElement; return a !== c && a !== document.body && !!(c.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING); })()`, note: 'Shift+Tab back through the controls and out to the previous real stop, never the card (tabIndex -1, src/main.ts:3277)' },
    { key: 'Tab', untilState: FOCUS_ON(SAVE), repeat: 16, note: 'Tab forward again, through the player, to Save' },
    { key: 'Enter', waitFor: MX('M.saving()'), timeout: 10000, state: FOCUS_ON('#save-actions > button'), note: 'S-61: saving (F4b, 3 s a chunk); Stop saving takes focus' },
    { key: 'Tab', shift: true, untilState: PLAYER_ACTIVE, repeat: 10, noFocusRing: true, note: 'Shift+Tab passes the disabled Save into the player while it streams' },
    { waitFor: MX(`M.has('status.saved', '#save-status')`), timeout: 300000, state: `!document.querySelector('video.result-player') && ${FOCUS_ON(RESULT)}`, note: 'S-131: saved; the player leaves and focus is on the card' },
  ],
}

// Carried routes, revised whole for the Phase 8 page (scenarios-2026-10-25.md,
// "Keyboard route per journey"): each journey's chain of scenarios walked by
// keys, the Phase 8 stops asserted where the chain names them. Carried steps
// keep their keys and assertions; Tab counts allow for the format "?", the
// player's controls between the card and Save, and Video language in step 3.
const LANG_RING = `['en-GB', 'zh-Hans', 'ms-MY']` // src/config/languages.ts:35, the segments' order
const VLANG_AFTER = (n) => `${LANG_RING}[(${LANG_RING}.indexOf(document.documentElement.lang) + ${n}) % 3]`
const TIP_OPEN = (id) => MX(`M.vis('#${id}') && M.el('#${id}-button').getAttribute('aria-expanded') === 'true'`)
const TIP_SHUT = (id) => MX(`!M.vis('#${id}') && M.el('#${id}-button').getAttribute('aria-expanded') === 'false'`)
const START_AT = (v) => MX(`M.el('#trim-start-range').valueAsNumber === ${v}`)
const BEFORE_CARD = `(() => { const c = document.querySelector(${JSON.stringify(P8_CARD)}); const a = document.activeElement; return !!c && a !== c && a !== document.body && !!(c.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING); })()`
const ONE_PLAYER_NOW = `document.querySelectorAll('video.result-player').length === 1`
/** The steps of a carried route from the one whose note starts `from` to the one whose note starts `to`, both kept. */
const stepsOf = (id, from, to) => {
  const s = ROUTES[id].steps
  const i = s.findIndex((x) => x.note?.startsWith(from)), j = s.findIndex((x) => x.note?.startsWith(to))
  if (i < 0 || j < i) throw new Error(`${id}: no steps from "${from}" to "${to}"`)
  return s.slice(i, j + 1)
}
/** The carried step whose note starts `note`, with `over` merged. */
const stepOf = (id, note, over = {}) => {
  const x = ROUTES[id].steps.find((s) => s.note?.startsWith(note))
  if (!x) throw new Error(`${id}: no step "${note}"`)
  return { ...x, ...over }
}
const SAVE_TAB = { key: 'Tab', untilState: FOCUS_ON(SAVE), repeat: 16, note: "Tab to Save the video, through the player's controls (VH-192)" }

// J1: S-03 → S-141 → S-142 → S-12 → S-14 → S-15 → S-16 → S-92 → S-119 → S-17 →
// S-95 → S-97 → S-36 → S-37 → S-39 → S-44 → S-47 → S-48 → S-123 → S-49 → S-72 →
// S-53 → S-126 → S-127 → S-114 → S-58 → S-59 → S-61 → S-62.
const J1_PICK = ROUTES.J1.steps.findIndex((s) => s.setup && /lecture-360s/.test(s.note ?? ''))
ROUTES.J1.steps = [
  { key: 'Tab', until: 'format-help-button', repeat: 20, state: TIP_SHUT('format-help'), note: 'S-03, S-141: from the top, past Page language, Tab to "About the video format"' },
  { key: 'Enter', state: TIP_OPEN('format-help'), expect: 'format-help-button', note: 'S-141: Enter opens it; focus stays on the "?"' },
  { key: 'Tab', expect: 'video-kind=', state: TIP_SHUT('format-help'), note: 'S-142: Tab closes it on Video type' },
  { key: 'Tab', until: 'file-input', repeat: 10, note: 'Tab on to Choose file' },
  ROUTES.J1.steps[J1_PICK],
  ...stepsOf('J1', 'S-12, S-14, S-15', 'S-16: Enter opens Video properties'),
  { key: 'Tab', untilState: FOCUS_ON('#trim-start-range'), repeat: 20, note: "S-92: Tab past step 2's preview controls to the start handle" },
  { key: 'PageUp', state: START_AT(10), expect: 'trim-start-range', note: 'S-92: Page Up, 10 s (lecture-360s: max(10 s, 1% = 3.6 s))' },
  { key: 'PageUp', state: START_AT(20), expect: 'trim-start-range', note: 'S-92: Page Up, 20 s' },
  { key: 'PageDown', state: START_AT(10), expect: 'trim-start-range', note: 'S-92: Page Down, 10 s' },
  { key: 'Home', state: START_AT(0), expect: 'trim-start-range', waitFor: MX('M.proceed() && M.create()'), timeout: 120000, note: 'S-92: Home, 0: the whole video kept; the check settles again' },
  { key: 'Tab', until: 'video-language=', repeat: 20, state: MX(`document.activeElement.checked === true && M.checked('video-language') === document.documentElement.lang`), note: 'S-119: on through the trim to step 3: Video language, one stop, its checked radio' },
  { key: 'Tab', expect: 'title-card-on', state: MX(`!M.el('#title-card-on').checked`), note: 'S-119: then Add a title card, unticked' },
  { key: 'Tab', until: 'onset-help-button', repeat: 60, note: 'Tab on to step 4\'s "?" (About animation onset)' },
  stepOf('J1', 'S-17: Enter opens the toggletip'),
  { key: 'Tab', state: TIP_SHUT('onset-help') + ' && ' + FOCUS_ON('#closing-colour input:checked'), note: 'S-95: Tab closes it on the Blue radio' },
  { key: 'Tab', shift: true, expect: 'onset-help-button', note: 'S-97: Shift+Tab back to the "?"' },
  { key: 'Enter', state: TIP_OPEN('onset-help'), expect: 'onset-help-button', note: 'S-97: Enter opens it again' },
  stepOf('J1', 'Escape closes it; focus stays', { note: 'S-97: Escape closes it; focus stays on the "?"' }),
  ...stepsOf('J1', 'S-36: Shift+Tab back to Add a title card', 'S-49: the time left shows'),
  stepOf('J1', 'S-72: Shift+Tab to Video properties while the job runs', { state: MX(`M.running() && M.el('#video-language').disabled`), note: 'S-72, S-123: Shift+Tab to Video properties while the job runs, past the disabled Video language' }),
  stepOf('J1', 'S-72, S-53: the job finishes'),
  { key: 'Tab', untilState: PLAYER_ACTIVE, repeat: 80, axExpect: '^Video ', noFocusRing: true, note: "S-126: Tab on to the finished video's player, named by the card's title" },
  { key: 'Tab', untilState: FOCUS_ON(SAVE), repeat: 12, note: "S-127: Tab through the player's controls to Save the video" },
  { key: 'Tab', shift: true, untilState: `!(${PLAYER_ACTIVE}) && !(${FOCUS_ON(SAVE)})`, repeat: 14, state: BEFORE_CARD, note: 'S-127: Shift+Tab back through them and out to the control before the card, never the card (tabIndex -1, src/main.ts:3277)' },
  { key: 'Tab', untilState: FOCUS_ON(CREATE), repeat: 40, state: MX(CREATE_READS('create.again', true)), note: 'S-114: Tab to Create, which reads "Create the video again", secondary' },
  ...stepsOf('J1', 'S-58: Enter asks the discard question', 'S-59: Keep it redraws the result'),
  SAVE_TAB,
  stepOf('J1', 'S-61, S-62: Enter saves'),
]

// J2: S-03 → S-07 → S-12 → S-14 → S-15 → S-121 → S-122 → S-40 → S-41 → S-42 →
// S-45 → S-48 → S-43 → S-123 → S-53 → S-61 → S-62.
ROUTES.J2.steps = [
  ...ROUTES.J2.steps.slice(0, ROUTES.J2.steps.findIndex((s) => s.note?.startsWith('S-40'))),
  { key: 'Tab', until: 'video-language=', repeat: 60, state: MX(`document.activeElement.checked === true && M.el('#title-card-on').disabled && M.el('#title-card-on').checked`), note: 'S-121: Tab from the trim reaches Video language, the box below it ticked and locked' },
  { key: 'ArrowRight', state: MX(`M.checked('video-language') === ${VLANG_AFTER(1)} && !!document.activeElement.closest('#video-language')`), expect: 'video-language=', note: 'S-122: an arrow picks the next language (on the English page 中文); focus on its radio' },
  { key: 'ArrowRight', state: MX(`M.checked('video-language') === ${VLANG_AFTER(2)}`), expect: 'video-language=', note: 'S-122: a second picks the one after (on the English page Bahasa Melayu)' },
  stepOf('J2', 'S-40: Tab to the first of the four fields', { until: undefined, repeat: undefined, expect: 'submission-card-assignment', note: 'S-40: Tab on to the first of the four fields, the box being locked' }),
  ...stepsOf('J2', 'S-45: Tab on to Create', 'Tab to Create; no field is marked'),
  stepOf('J2', 'S-48, S-43: the job runs', { state: FOCUS_ON(CANCEL) + ' && ' + MX(`M.el('#title-card-choice').disabled && M.el('#video-language').disabled`), note: 'S-48, S-43, S-123: the job runs; the fields and Video language are locked; Cancel has focus' }),
  stepOf('J2', 'S-53: finished'),
  SAVE_TAB,
  stepOf('J2', 'S-61, S-62: saved'),
]

// J3: S-02; S-106 (F17); S-28 → S-29 → S-15; S-31 → S-35; S-56 → S-57 → S-53 →
// S-132 (F15a, in place) → S-69 (F4e revised) → S-62; S-74 → S-75 → S-77 →
// S-80 → S-148.
ROUTES.J3.steps = [
  stepOf('J3', 'S-02: the chooser is shut'),
  stepOf('J3', 'Follow the remedy', { note: 'Follow the remedy: Tab on to Report a problem' }),
  { setup: async (w) => { await releaseFault(w, 'F2'); await applyFault(w, 'F17'); await w.goto() }, note: 'setup: F2 released, F17 set; the page reloaded' },
  { key: 'Tab', until: 'file-input', repeat: 40, state: MX(`!M.el('#browser-note').hidden && M.is('browserNote.notPassed', '#browser-note') && M.el('#check-aac')?.dataset.state === 'warn' && !M.el('#file-input').disabled`), note: 'S-106: the browser note above step 1 on a warn (F17); Tab reaches Choose file, which is open' },
  { setup: async (w) => { await releaseFault(w, 'F17'); await w.goto() }, note: 'setup: F17 released; the page reloaded' },
  ...stepsOf('J3', 'Tab to Choose file', 'S-53: finished; focus to the result'),
  { setup: async (w) => { await w.evaluate(`window.__j3card = document.querySelector('#process-result').textContent`); await applyFault(w, 'F15a'); await sleep(600) }, note: 'setup: F15a in place, an error event on the result player' },
  { wait: 0, state: MX(`M.text('#process-result') === window.__j3card && !M.saveBtn().disabled && ${ONE_PLAYER_NOW}`) + ' && ' + FOCUS_ON(RESULT), note: 'S-132: nothing on the card changed; Save still offered; focus unmoved on the result' },
  SAVE_TAB,
  ...stepsOf('J3', 'S-69: the save fails (F4e)', 'S-80: the copy refused'),
  { key: 'Escape', expect: 'feedback-report', state: `!document.querySelector('dialog[open]')`, note: 'S-148: Escape closes the dialog; focus back on Report this problem' },
  { key: 'Tab', until: 'feedback-open', repeat: 80, note: "S-148: Tab on to the footer's Report a problem, past the System check's and the statement's summaries and the two help links" },
  { key: 'Enter', expect: 'feedback-message', state: IN_DIALOG, note: 'S-148: Enter opens the same dialog, focus on the message' },
  { key: 'Escape', expect: 'feedback-open', state: `!document.querySelector('dialog[open]')`, note: 'S-148: Escape returns focus to Report a problem' },
]

// J4: S-53 → S-13 → S-63 → S-116 → S-129 → S-64 → S-65 → S-71 → S-30 → S-58 →
// S-60 → S-48 → S-50 → S-123 → S-53.
const J4_NEXT = ROUTES.J4.steps.findIndex((s) => s.setup && /lecture-60s/.test(s.note ?? ''))
ROUTES.J4.steps = [
  ...ROUTES.J4.steps.slice(0, J4_NEXT),
  { ...ROUTES.J4.steps[J4_NEXT], state: MX(`M.previous() && M.has('result.endedEarly', '#process-result > .notification[data-kind="success"]') && ${CREATE_READS('create.create', true)} && ${ONE_PLAYER_NOW}`) },
  stepOf('J4', 'S-13, S-63, S-64', { note: 'S-13, S-63, S-116, S-129, S-64: the replacement read and checked beside "Previous video", its ended-early line and its player kept; Create reads "Create the video", secondary; focus on the chooser' }),
  ...ROUTES.J4.steps.slice(J4_NEXT + 2, ROUTES.J4.steps.findIndex((s) => s.note?.startsWith('S-71: Student submission beside the kept result')) + 1),
  { key: 'Tab', until: 'video-language=', repeat: 120, state: MX(`!M.el('#video-language').disabled`), note: 'S-71: Tab on to Video language in step 3, free beside the kept result' },
  stepOf('J4', 'S-71: another video language', { state: MX(`M.checked('video-language') !== document.documentElement.lang && M.is('videoKind.nextVideo', '#video-next')`), note: 'S-71: another video language; the next-video line names the video type only' }),
  stepOf('J4', 'Shift+Tab back to Video type', { repeat: 120 }),
  ...stepsOf('J4', 'Back to Staff video', 'Shift+Tab to Video type while the job runs'),
  stepOf('J4', 'S-50: switched while running', { state: MX(`M.running() && M.checked('video-kind') === 'submission' && M.vis('#video-next') && M.has('videoKind.options.staff', '#process-job') && M.el('#video-language').disabled`), note: 'S-50, S-123: switched while running; the job keeps Staff video; Video language locked' }),
  stepOf('J4', 'S-53: finished; focus stays on the radio'),
]

// The predicates read the page through window.__mx (MX_INIT), as `M`.
const wrap = (expr) => `(() => { const M = window.__mx; return (${expr}); })()`
for (const sc of Object.values(SCENARIOS)) { sc.hold = wrap(sc.hold ?? sc.state); sc.state = wrap(sc.state) }

/** Every fixture the records of these ids use, by name. */
export const fixturesFor = (ids) => [...new Set(ids.flatMap((id) => (ROUTES[id] ?? SCENARIOS[id])?.fixtures ?? []))].sort()

/** The named gaps for the manifest's `unresolved`: scenarios left out, and where a scenario exists only in part of the matrix. */
export const GAPS = [
  ...Object.entries(LEFT_OUT).map(([id, why]) => `${id} left out of the matrix: ${why}`),
  ...Object.entries(SOURCE_ONLY).map(([id, why]) => `${id} source-only, never walked: ${why}`),
  ...Object.entries(SCENARIOS).flatMap(([id, sc]) => [
    ...(sc.langs ? [`${id} (${sc.name}) only in ${sc.langs.join(', ')}: ${sc.langsWhy}`] : []),
    ...(sc.views ? [`${id} (${sc.name}) only at ${sc.views.join(', ')}: ${sc.viewsWhy}`] : []),
  ]),
  'S-84 (page language at narrow width) is S-03 at 320 px: the light matrix covers it',
]

// ---------------------------------------------------------------------------
// VH-178: the transitions that take the focused control away (V-46, WCAG
// 2.4.3), and the variants Codex astra's critique of the fix plan asked for
// (F-03), kept for VH-176's after-run. Each `run` reaches the moment by
// setup, places focus by keys, lets the transition happen and reads focus
// at once, before any instrument moves it. `ran` says the transition ran as
// declared (focus held up to it, the check still running, the save still
// running, the dialog open), and `asserts` names each condition the record
// must meet to pass (Codex astra's check, VH-178); `successor` is where
// focus must then be, or 'moved' for where the reader went. `inView` is read
// at the same moment: the focused control inside the window and not covered
// (2.4.11, 2.4.12), before any instrument scrolls. transitions.mjs walks them.
const ACK = '#process-actions > button:nth-child(1)'
const FAILURE = '#process-result > .notification[data-kind="error"]'
const ANNOUNCE = '#announce-progress'
/** Tab (Shift+Tab with `shift`) until a page expression holds: the keys a person presses. */
async function tabUntil(w, expr, { shift = false, max = 80 } = {}) {
  for (let n = 0; n <= max; n++) {
    if (await mx(w, expr)) return n
    if (n < max) await key(w, 'Tab', { shift })
  }
  throw new Error('focus never reached by keys: ' + expr.slice(0, 120))
}
const focusMark = (w) => w.evaluate('window.__audit.focus.length')
/**
 * Focus now, every element focus entered since `mark`, whether it is on
 * `successor` (or inside it), and `inView`: its box in the window, and how many
 * of five points inside it (the centre and four corners, 2 px in) another
 * element covers, read where it stands, nothing scrolled.
 */
const readFocus = (w, mark, successor) => w.evaluate(`(() => {
  const a = document.activeElement; const s = ${successor ? `document.querySelector(${JSON.stringify(successor)})` : 'null'};
  let view = null;
  if (a && a !== document.body) {
    const r = a.getBoundingClientRect(); const inside = r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth;
    const pts = [[r.left + r.width / 2, r.top + r.height / 2], [r.left + 2, r.top + 2], [r.right - 2, r.top + 2], [r.left + 2, r.bottom - 2], [r.right - 2, r.bottom - 2]].filter(([x, y]) => x >= 0 && y >= 0 && x < innerWidth && y < innerHeight);
    const covered = pts.filter(([x, y]) => { const e = document.elementFromPoint(x, y); return !!e && e !== a && !a.contains(e) && !e.contains(a); }).length;
    view = { top: Math.round(r.top), bottom: Math.round(r.bottom), inWindow: inside, sampled: pts.length, covered };
  }
  return { el: !a || a === document.body ? 'body' : window.__audit.desc(a).slice(0, 90), visible: !!a && a !== document.body && a.matches(':focus-visible'),
    landed: !!s && !!a && (a === s || s.contains(a)), moves: window.__audit.focus.slice(${mark}).map((f) => f.el.slice(0, 60)), inView: view };
})()`)
const on = (placed, id) => typeof placed === 'string' && placed.includes(id)
const seen = (w, ...ids) => ids.every((id) => (w.faultsSeen ?? []).some((f) => f.startsWith(id + ':')))
/** Create (Continue anyway first, under a discouraging verdict), by keys; Cancel takes focus. */
async function createByKeys(w) {
  if (await mx(w, 'M.ack()')) { await tabUntil(w, FOCUS_ON(ACK)); await key(w, 'Enter'); await sleep(200) }
  await tabUntil(w, FOCUS_ON(CREATE))
  await key(w, 'Enter')
  await w.waitRunning()
}
/** A job under way with focus moved by keys from Cancel to Announce progress. */
async function announceHeld(w, lang, file) {
  await ready(w, lang, file)
  await createByKeys(w)
  await tabUntil(w, FOCUS_ON(ANNOUNCE), { shift: true, max: 6 })
  return (await readFocus(w, 0, null)).el
}
/** A finished video, then Save by keys: Stop saving takes focus. */
async function savingByKeys(w, lang) {
  await applyFault(w, 'F4b', { ms: 3000 })
  await finished(w, lang)
  await tabUntil(w, FOCUS_ON(SAVE), { max: 10 })
  await key(w, 'Enter')
  await until(w, 'M.saving()', 'saving', 10000)
  return mx(w, FOCUS_ON(STOP_SAVE_SEL))
}
/** A file chosen through the native chooser (VH-168) with focus on it, by keys; then focus to Start time while the check runs. */
async function setupFieldWhileChecking(w, file) {
  await tabUntil(w, FOCUS_ON('#file-input'), { max: 40 })
  await w.setFiles(F(file))
  await until(w, 'M.checking() && !M.el("#step-trim").hidden', 'checking with the setup steps shown', 60000)
  await tabUntil(w, FOCUS_ON('#trim-start'), { max: 12 })
  return { checkingAtFocus: await mx(w, 'M.checking()'), placedOn: (await readFocus(w, 0, null)).el }
}

export const TRANSITIONS = {
  'T-46.1': {
    name: 'A job made with focus on Announce progress (V-46, main.ts:2947)',
    fixtures: ['lecture-30s.mp4'], successor: RESULT,
    run: async (w, lang) => {
      const placedOn = await announceHeld(w, lang, 'lecture-30s.mp4')
      const mark = await focusMark(w)
      await until(w, 'M.finished() && !M.vis("#announce-field")', 'job made', 300000)
      return { ...(await readFocus(w, mark, RESULT)), ran: { placedOn } }
    },
    asserts: (r) => ({ heldOnAnnounce: on(r.placedOn, '#announce-progress') }),
  },
  'T-46.2': {
    name: 'A check blocks with focus in Start time (V-46, main.ts:1580, :1592)',
    // F14 holds the check's answer 8 s: unheld it blocks about 20 ms after it starts, before any key could reach Start time.
    faults: ['F14'], fixtures: ['prores-1080p.mov'], successor: '#file-input', ring: FILE,
    run: async (w, lang) => {
      await applyFault(w, 'F14')
      await fresh(w, lang)
      const placed = await setupFieldWhileChecking(w, 'prores-1080p.mov')
      const mark = await focusMark(w)
      await until(w, 'M.kindIn("#source-block") === "error"', 'blocked', 120000)
      return { ...(await readFocus(w, mark, '#file-input')), ran: { ...placed, stepsWithdrawn: await mx(w, 'M.el("#step-trim").hidden'), held: seen(w, 'F14') } }
    },
    asserts: (r) => ({ inStartTime: on(r.placedOn, '#trim-start'), checkingAtFocus: r.checkingAtFocus, stepsWithdrawn: r.stepsWithdrawn, f14: r.held }),
  },
  'T-46.3': {
    name: '(a) S-65 slowed: a check settles during a save, focus on Stop the check (V-46, main.ts:1614)',
    // The next file is the hour-long still, whose check takes about 27 s; the 60 s video's save at 3 s a chunk outlasts it.
    faults: ['F4b'], fixtures: ['lecture-60s.mp4', 'still-3600s.mp4'], successor: STOP_SAVE_SEL,
    run: async (w, lang) => {
      await applyFault(w, 'F4b', { ms: 3000 })
      await finished(w, lang, 'lecture-60s.mp4')
      await tabUntil(w, FOCUS_ON('#file-input'), { shift: true, max: 120 })
      await w.setFiles(F('still-3600s.mp4'))
      await until(w, 'M.checking()', 'checking', 60000)
      await tabUntil(w, FOCUS_ON(SAVE), { max: 80 })
      await key(w, 'Enter')
      await until(w, 'M.saving()', 'saving', 10000)
      await tabUntil(w, FOCUS_ON(STOP_CHECK_SEL), { shift: true, max: 20 })
      const at = await mx(w, `({ checking: M.checking(), saving: M.saving(), onStopCheck: ${FOCUS_ON(STOP_CHECK_SEL)} })`)
      const placedOn = (await readFocus(w, 0, null)).el
      const mark = await focusMark(w)
      await w.waitFor(`(() => { const M = window.__mx; return !M.checking(); })()`, { label: 'check settled', timeout: 300000, interval: 50 })
      const savingAtSettle = await mx(w, 'M.saving()')
      return { ...(await readFocus(w, mark, STOP_SAVE_SEL)), ran: { placedOn, onStopCheck: at.onStopCheck, checkingAtFocus: at.checking, savingAtFocus: at.saving, savingAtSettle, verdict: await mx(w, 'M.verdict() || M.kindIn("#source-block")') } }
    },
    asserts: (r) => ({ onStopCheck: r.onStopCheck, checkingAtFocus: r.checkingAtFocus, savingAtFocus: r.savingAtFocus, savingAtSettle: r.savingAtSettle, ready: r.verdict === 'success' }),
  },
  // (b) Announce progress through the other endings.
  'T-46b-cancelled': {
    name: 'A job cancelled with focus on Announce progress (main.ts:2947)',
    // Cancel by its own click(), which moves no focus, as a mouse click in Safari does; keys cannot press it without focusing it.
    fixtures: ['lecture-360s.mp4'], successor: CREATE,
    run: async (w, lang) => {
      const placedOn = await announceHeld(w, lang, 'lecture-360s.mp4')
      const mark = await focusMark(w)
      await w.evaluate(`document.querySelector(${JSON.stringify(CANCEL)}).click()`)
      await until(w, 'M.idle() && M.create()', 'cancelled', 60000)
      return { ...(await readFocus(w, mark, CREATE)), ran: { placedOn, cancelled: await mx(w, 'M.has("status.cancelled", "#status")') } }
    },
    asserts: (r) => ({ heldOnAnnounce: on(r.placedOn, '#announce-progress'), cancelled: r.cancelled }),
  },
  'T-46b-failed': {
    name: 'A job failed by its reply with focus on Announce progress (main.ts:2947, F12)',
    faults: ['F12'], fixtures: ['lecture-360s.mp4'], successor: FAILURE,
    run: async (w, lang) => {
      await applyFault(w, 'F12', { bytes: 12 * 1024 * 1024 })
      const placedOn = await announceHeld(w, lang, 'lecture-360s.mp4')
      const runningAtFocus = await mx(w, 'M.running()')
      const mark = await focusMark(w)
      await until(w, 'M.res() === "failure" && M.idle()', 'failed', 300000)
      return { ...(await readFocus(w, mark, FAILURE)), ran: { placedOn, runningAtFocus, f12: seen(w, 'F12') } }
    },
    asserts: (r) => ({ heldOnAnnounce: on(r.placedOn, '#announce-progress'), runningAtFocus: r.runningAtFocus, f12: r.f12 }),
  },
  'T-46b-watchdog': {
    name: 'A job failed by the watchdog with focus on Announce progress (main.ts:3008-3050, F11)',
    faults: ['F11'], fixtures: ['lecture-360s.mp4'], successor: FAILURE,
    run: async (w, lang) => {
      await applyFault(w, 'F11')
      const placedOn = await announceHeld(w, lang, 'lecture-360s.mp4')
      const mark = await focusMark(w)
      await until(w, 'M.res() === "failure"', 'watchdog', 200000)
      const lockedAtFailure = await mx(w, 'M.el("#file-input").disabled')
      await until(w, '!M.el("#file-input").disabled', 'the stop settled', 30000)
      return { ...(await readFocus(w, mark, FAILURE)), ran: { placedOn, lockedAtFailure } }
    },
    asserts: (r) => ({ heldOnAnnounce: on(r.placedOn, '#announce-progress'), lockedAtFailure: r.lockedAtFailure }),
  },
  // (c) A reader moving focus between the capture and the hand-off.
  'T-46c-watchdog': {
    name: 'The watchdog branch: the reader moves while the job stops (main.ts:3008-3050, F11)',
    faults: ['F11'], fixtures: ['lecture-360s.mp4'], successor: 'moved',
    run: async (w, lang) => {
      await applyFault(w, 'F11')
      await announceHeld(w, lang, 'lecture-360s.mp4')
      await until(w, 'M.res() === "failure"', 'watchdog', 200000)
      await key(w, 'Tab', { shift: true })
      const movedTo = await readFocus(w, 0, null)
      const lockedAtMove = await mx(w, 'M.el("#file-input").disabled')
      const mark = await focusMark(w)
      await until(w, '!M.el("#file-input").disabled', 'the stop settled', 30000)
      const after = await readFocus(w, mark, null)
      return { ...after, landed: movedTo.el !== 'body' && after.el === movedTo.el, ran: { lockedAtMove, movedTo: movedTo.el } }
    },
    asserts: (r) => ({ movedWhileLocked: r.lockedAtMove }),
  },
  'T-46c-save': {
    name: 'A save stopped by keys: the reader moves before it settles (main.ts:3271-3374, F4b at 3 s)',
    faults: ['F4b'], fixtures: ['lecture-30s.mp4'], successor: 'moved',
    run: async (w, lang) => {
      const onStopSaving = await savingByKeys(w, lang)
      await key(w, 'Enter')
      await key(w, 'Tab', { shift: true })
      const movedTo = await readFocus(w, 0, null)
      const savingAtMove = await mx(w, 'M.saving()')
      const mark = await focusMark(w)
      await until(w, 'M.has("status.saveStopped", "#save-status") && !M.saving()', 'save stopped', 60000)
      const after = await readFocus(w, mark, null)
      return { ...after, landed: movedTo.el !== 'body' && after.el === movedTo.el, ran: { onStopSaving, savingAtMove, movedTo: movedTo.el } }
    },
    asserts: (r) => ({ stopSavingPressedWithFocus: r.onStopSaving, movedWhileSaving: r.savingAtMove }),
  },
  // (d) The feedback dialogue open at the transition.
  'T-46d-watchdog': {
    name: 'The watchdog branch with the feedback dialogue opened while the job stops (F11)',
    faults: ['F11'], fixtures: ['lecture-360s.mp4'], successor: 'dialog[open]',
    run: async (w, lang) => {
      await applyFault(w, 'F11')
      await announceHeld(w, lang, 'lecture-360s.mp4')
      await until(w, 'M.res() === "failure"', 'watchdog', 200000)
      await w.click('#feedback-open')
      await until(w, '!!document.querySelector("dialog[open]")', 'dialog open', 5000)
      const lockedAtOpen = await mx(w, 'M.el("#file-input").disabled')
      const mark = await focusMark(w)
      await until(w, '!M.el("#file-input").disabled', 'the stop settled', 30000)
      return { ...(await readFocus(w, mark, 'dialog[open]')), ran: { lockedAtOpen } }
    },
    asserts: (r) => ({ openedWhileLocked: r.lockedAtOpen }),
  },
  'T-46d-save': {
    name: 'A save stopped by keys with the feedback dialogue opened before it settles (F4b at 3 s)',
    faults: ['F4b'], fixtures: ['lecture-30s.mp4'], successor: 'dialog[open]',
    run: async (w, lang) => {
      const onStopSaving = await savingByKeys(w, lang)
      await key(w, 'Enter')
      await w.click('#feedback-open')
      const savingAtOpen = await mx(w, 'M.saving() && !!document.querySelector("dialog[open]")')
      const mark = await focusMark(w)
      await until(w, 'M.has("status.saveStopped", "#save-status") && !M.saving()', 'save stopped', 60000)
      return { ...(await readFocus(w, mark, 'dialog[open]')), ran: { onStopSaving, savingAtOpen } }
    },
    asserts: (r) => ({ stopSavingPressedWithFocus: r.onStopSaving, openedWhileSaving: r.savingAtOpen }),
  },
  // (e) Verdicts that withdraw nothing: focus in a setup field stays there.
  'T-46e-ready': {
    name: 'A ready verdict with focus in Start time (main.ts:1535, :1614)',
    faults: ['F14'], fixtures: ['lecture-60s.mp4'], successor: '#trim-start',
    run: async (w, lang) => {
      await applyFault(w, 'F14')
      await fresh(w, lang)
      const placed = await setupFieldWhileChecking(w, 'lecture-60s.mp4')
      const mark = await focusMark(w)
      await until(w, '!!M.verdict() && !M.checking()', 'a verdict', 120000)
      return { ...(await readFocus(w, mark, '#trim-start')), ran: { ...placed, verdict: await mx(w, 'M.verdict()'), f14: seen(w, 'F14') } }
    },
    asserts: (r) => ({ inStartTime: on(r.placedOn, '#trim-start'), checkingAtFocus: r.checkingAtFocus, ready: r.verdict === 'success', f14: r.f14 }),
  },
  'T-46e-storage': {
    name: 'A recoverable storage block with focus in Start time (main.ts:1579, setupStepsResolve; F3)',
    faults: ['F3', 'F14'], fixtures: ['lecture-360s.mp4'], successor: '#trim-start',
    run: async (w, lang) => {
      await applyFault(w, 'F3', { bytes: 5 * 1024 * 1024 })
      await applyFault(w, 'F14')
      await fresh(w, lang)
      const placed = await setupFieldWhileChecking(w, 'lecture-360s.mp4')
      const mark = await focusMark(w)
      await until(w, 'M.kindIn("#source-block") === "error" && M.checkAgain()', 'storage block', 120000)
      return { ...(await readFocus(w, mark, '#trim-start')), ran: { ...placed, stepsKept: await mx(w, '!M.el("#step-trim").hidden'), f3AndF14: seen(w, 'F3', 'F14') } }
    },
    asserts: (r) => ({ inStartTime: on(r.placedOn, '#trim-start'), checkingAtFocus: r.checkingAtFocus, stepsKept: r.stepsKept, f3AndF14: r.f3AndF14 }),
  },
}

// VH-198: the Phase 8 instruments proved on the real app (player-proof and
// the scenarios' own assertions), apart from the pilot, which is VH-198's
// next step: the player passive and by keys, K-player, both "?", the footer's
// headings, the limiting warning, Video language, a saved card.
PLANS.vh198proof = () => [
  ...['S-03', 'S-126', 'S-127', 'S-131', 'S-135', 'S-141', 'S-145', 'S-119', 'S-123'].map((id) => ({ id, lang: 'en-GB', view: 'w1280', mode: 'light' })),
  { id: 'S-142', lang: 'zh-Hans', view: 'w1280', mode: 'light' },
  { id: 'K-player', lang: 'en-GB', view: 'w1280', mode: 'light' },
]

// VH-198: pass 3's pilot, at Phase 7's second pilot's breadth (PLANS.pilot2:
// every mode, more views, a second language), with Phase 8's states added,
// each through every instrument: the player (S-126 passive, S-127 by keys,
// K-player), both "?" (S-17 the onset's, S-141 the format's), the footer's
// headings (S-145), the limiting warning (S-135), Video language (S-119),
// Create's "again" label (S-114), and the closing asset's twin (S-140n).
// The modes, views and languages the Phase 8 states take are a sample of
// the parts' recipes: colour, motion, spacing and both type modes, 320 px,
// Chinese and Malay.
PLANS.pilot3 = () => [
  ...PLANS.pilot2(),
  ...['S-126', 'S-127', 'S-17', 'S-141', 'S-145', 'S-135', 'S-119', 'S-114', 'S-140n'].map((id) => ({ id, lang: 'en-GB', view: 'w1280', mode: 'light' })),
  ...['S-126', 'S-141'].flatMap((id) => ['dark', 'forced-light', 'forced-dark', 'reduced-motion'].map((mode) => ({ id, lang: 'en-GB', view: 'w1280', mode }))),
  ...['S-145'].flatMap((id) => ['font32', 'fallback'].map((mode) => ({ id, lang: 'en-GB', view: 'w1280', mode }))),
  ...['S-126', 'S-127', 'S-141', 'S-145', 'K-player'].map((id) => ({ id, lang: 'en-GB', view: 'w320', mode: 'light' })),
  ...['S-141', 'S-135'].map((id) => ({ id, lang: 'en-GB', view: 'w320', mode: 'spacing' })),
  ...['S-126', 'S-135', 'S-119', 'S-114', 'S-145'].map((id) => ({ id, lang: 'zh-Hans', view: 'w1280', mode: 'light' })),
  ...['S-141', 'S-145'].map((id) => ({ id, lang: 'ms-MY', view: 'w1280', mode: 'light' })),
  { id: 'K-player', lang: 'en-GB', view: 'w1280', mode: 'light' },
]
