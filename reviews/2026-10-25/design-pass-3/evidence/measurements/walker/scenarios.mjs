// PLAN-7 (VH-172): the matrix's declarations, kept apart from its runner so
// the repo walker can take them while matrix.mjs, qualify.mjs and runner.mjs
// change underneath: every walked scenario (setup, state predicate, focus
// list), the keyboard routes J1-J4 and K-dialog, the plans, and the gaps.
// matrix.mjs imports SCENARIOS, ROUTES, PLANS, MX_INIT and GAPS from here.
import { F, sleep } from './walk.mjs'
import { IN_DIALOG, IN_DIALOG_OR_OUT, focusByKeyboard, key } from './qualify.mjs'
import { applyFault, releaseFault, gotoNoWait } from './faults.mjs'

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
  HTMLAnchorElement.prototype.click = function () { if (/^mailto:/i.test(this.href)) { const u = this.href, q = u.indexOf('?'); M.mailto.push({ t: Math.round(performance.now()), chars: u.length, to: decodeURIComponent(u.slice(7, q > 0 ? q : undefined)), subject: /[?&]subject=/.test(u), body: /[?&]body=/.test(u) }); } return click0.call(this); };
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
  await w.setFiles(F(file))
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
  // Every scenario once in its base cell, as smoke.
  for (const r of PLANS.smoke()) add(r)
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


// The predicates read the page through window.__mx (MX_INIT), as `M`.
const wrap = (expr) => `(() => { const M = window.__mx; return (${expr}); })()`
for (const sc of Object.values(SCENARIOS)) { sc.hold = wrap(sc.hold ?? sc.state); sc.state = wrap(sc.state) }

/** Every fixture the records of these ids use, by name. */
export const fixturesFor = (ids) => [...new Set(ids.flatMap((id) => (ROUTES[id] ?? SCENARIOS[id])?.fixtures ?? []))].sort()

/** The named gaps for the manifest's `unresolved`: scenarios left out, and where a scenario exists only in part of the matrix. */
export const GAPS = [
  ...Object.entries(LEFT_OUT).map(([id, why]) => `${id} left out of the matrix: ${why}`),
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
