// The string sweep (VH-143): every leaf of the three language tables checked for form — capitals,
// stops, punctuation and quotation marks, en-GB spelling, one word for one thing, literal numbers,
// Chinese full-width punctuation and spacing, Malay consistency, and each language's terminal
// punctuation against the English. Form only: the verdict on meaning is the native speakers'.
// Usage: node strings-sweep.mjs [repo root]   (Node 24 strips the tables' types itself)
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const REPO = resolve(process.argv[2] ?? '.')
const load = async (file) => Object.values(await import(pathToFileURL(resolve(REPO, 'src/i18n', file)).href))[0]
const tables = { en: await load('en-GB.ts'), zh: await load('zh-Hans.ts'), ms: await load('ms-MY.ts') }

const flatten = (obj, prefix = '', out = []) => {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? prefix + '.' + k : k
    if (typeof v === 'string') out.push([key, v])
    else if (v && typeof v === 'object') flatten(v, key, out)
  }
  return out
}
const leaves = Object.fromEntries(Object.entries(tables).map(([k, t]) => [k, flatten(t).filter(([key]) => !key.startsWith('meta.'))]))
const byKey = (lang) => Object.fromEntries(leaves[lang])

const CJK_RANGE = String.fromCharCode(0x3000) + '-' + String.fromCharCode(0x9fff)
const cjkRe = (pattern, flags = '') => new RegExp(pattern.split('CJK').join(CJK_RANGE), flags)
const PH = /\{[A-Za-z][A-Za-z0-9]*\}/g
const strip = (s) => s.replace(PH, '')
const CJK = cjkRe('[CJK]')
const out = []
const say = (s = '') => out.push(s)
const section = (title) => { say(); say('## ' + title); say() }
const list = (title, rows, cap = 40) => {
  say(`### ${title} — ${rows.length}`)
  say()
  if (!rows.length) { say('None.'); say(); return }
  for (const [key, text, extra] of rows.slice(0, cap)) say(`- \`${key}\` — ${JSON.stringify(text.length > 140 ? text.slice(0, 137) + '…' : text)}${extra ? ' — ' + extra : ''}`)
  if (rows.length > cap) say(`- … ${rows.length - cap} more`)
  say()
}
const terminal = (s) => {
  const t = strip(s).trim().replace(/["'”’」』)]+$/, '')
  const c = t.slice(-1)
  if (/[.。]/.test(c)) return 'stop'
  if (/[?？]/.test(c)) return 'question'
  if (/[!！]/.test(c)) return 'exclamation'
  if (/[…]/.test(c) || t.endsWith('......') || t.endsWith('...')) return 'ellipsis'
  if (/[:：]/.test(c)) return 'colon'
  return 'none'
}
const words = (s) => strip(s).split(/\s+/).filter((w) => /[A-Za-z]/.test(w))
const count = (rows, re) => rows.reduce((n, [, t]) => n + (strip(t).match(re) ?? []).length, 0)

say('<!-- markdownlint-disable -->')
say('# String sweep — ' + new Date().toISOString().slice(0, 10))
say()
say(`Leaves (meta excluded): en-GB ${leaves.en.length}, zh-Hans ${leaves.zh.length}, ms-MY ${leaves.ms.length}. English words ${leaves.en.reduce((n, [, t]) => n + words(t).length, 0)}; Chinese CJK glyphs ${count(leaves.zh, cjkRe('[CJK]', 'g'))}; Malay words ${leaves.ms.reduce((n, [, t]) => n + words(t).length, 0)}.`)

// --- English ---------------------------------------------------------------
section('en-GB')
const en = leaves.en
const firstLetter = (s) => strip(s).replace(/^[\s"'“‘([]+/, '').charAt(0)
list('Starts lower-case', en.filter(([, t]) => /[a-z]/.test(firstLetter(t))))
list('Two or more sentences without a final stop', en.filter(([, t]) => /[.?!]\s+\S/.test(strip(t)) && terminal(t) === 'none'))
list('Eight or more words with no terminal punctuation (a label, or a sentence missing its stop)', en.filter(([, t]) => words(t).length >= 8 && terminal(t) === 'none'))
list('Ends with a colon', en.filter(([, t]) => terminal(t) === 'colon'))
list('Straight double quotes', en.filter(([, t]) => /"/.test(t)))
list('Straight single quote as a quotation mark (not an apostrophe)', en.filter(([, t]) => /(^|[\s(])'|'([\s.,;:!?)]|$)/.test(t)))
say(`Curly marks in use: “ ${count(en, /“/g)}, ” ${count(en, /”/g)}, ‘ ${count(en, /‘/g)}, ’ ${count(en, /’/g)}; straight ' ${count(en, /'/g)}, " ${count(en, /"/g)}.`)
say()
list('Double spaces, tabs, leading or trailing space, non-breaking space', en.filter(([, t]) => new RegExp(' {2}|\\t|^\\s|\\s$|' + String.fromCharCode(0xa0)).test(t)))
list('Spelling that is not en-GB', en.filter(([, t]) => /\b(color|colors|organi[sz]ation|organize|optimize[sd]?|center|analyze[sd]?|gray|license[sd]?\b(?! key)|program\b|favorite|behavior|catalog\b|labeled|canceled|traveled|fulfill|percent\b|dialog\b|meter\b|liter|fiber|modeling|normaliz|recogniz|minimiz|maximiz|customiz|summariz|apologize|judgment)\b/i.test(strip(t))).map(([k, t]) => [k, t, strip(t).match(/\b(color|colors|organize|optimize[sd]?|center|analyze[sd]?|gray|license[sd]?|program|favorite|behavior|catalog|labeled|canceled|traveled|fulfill|percent|dialog|meter|liter|fiber|modeling|normaliz\w*|recogniz\w*|minimiz\w*|maximiz\w*|customiz\w*|summariz\w*|apologize|judgment)\b/i)[0]]))
list('Three dots instead of an ellipsis, or a hyphen as a dash', en.filter(([, t]) => /\.\.\.| - | -- /.test(t)))
list('e.g., i.e., etc.', en.filter(([, t]) => /\b(e\.g\.|i\.e\.|etc\.?)/i.test(t)))
list('A literal number in the text (the Intl check: should it be a placeholder?)', en.filter(([, t]) => /\d/.test(strip(t))).map(([k, t]) => [k, t, (strip(t).match(/\d[\d.,:]*\s?\w*/g) ?? []).join(' · ')]), 80)
say('### One word for one thing — counts across the English table')
say()
const families = {
  'make / create / build (the job)': [/\bmak(e|es|ing|ade)\b/gi, /\bcreat(e|es|ing|ed)\b/gi, /\bbuil(d|ds|ding|t)\b/gi],
  'closing / closing card / closing branding / closing animation / closing tail': [/\bclosing\b(?! card| branding| animation| tail)/gi, /\bclosing card/gi, /\bclosing branding/gi, /\bclosing animation/gi, /\bclosing tail/gi],
  'title card / card / submission card': [/\btitle card/gi, /(?<!title |submission |closing )\bcard\b/gi, /\bsubmission card/gi],
  'video / recording / file / clip': [/\bvideo\b/gi, /\brecording\b/gi, /\bfile\b/gi, /\bclip\b/gi],
  'choose / select / pick': [/\bcho(o|)s(e|es|ing|en)\b/gi, /\bselect(ed|s|ing)?\b/gi, /\bpick(ed|s|ing)?\b/gi],
  'cancel / stop': [/\bcancel(led|s|ling)?\b/gi, /\bstop(ped|s|ping)?\b/gi],
  'device / computer / machine / phone': [/\bdevice\b/gi, /\bcomputer\b/gi, /\bmachine\b/gi, /\bphone\b/gi],
  'save / download / keep': [/\bsav(e|ed|es|ing)\b/gi, /\bdownload(ed|s|ing)?\b/gi, /\bke(ep|pt)\b/gi],
  'level / levelled / normalise / balance / loudness': [/\blevel(led|s|ling)?\b/gi, /\bnormalis(e|ed|es|ing)\b/gi, /\bbalanc(e|ed|es|ing)\b/gi, /\bloudness\b/gi],
  'tick / check (a box)': [/\btick(ed|s|ing)?\b/gi, /\bcheck(ed|s|ing)?\b/gi],
  'sound / audio': [/\bsound\b/gi, /\baudio\b/gi],
  'picture / video track / image': [/\bpicture\b/gi, /\bimage\b/gi],
  'Internal use only (quoted forms)': [/'Internal use only'/g, /‘Internal use only’/g, /"Internal use only"/g, /“Internal use only”/g, /Internal use only(?!['’"”])/g],
  'the tool / the app / this page / UoN Video Helper': [/\bthe tool\b/gi, /\bthe app\b/gi, /\bthis page\b/gi, /UoN Video Helper/g],
  'finished / ready / done / made': [/\bfinished\b/gi, /\bready\b/gi, /\bdone\b/gi, /\bmade\b/gi],
}
say('| family | counts |', '| --- | --- |')
for (const [name, res] of Object.entries(families)) say(`| ${name} | ${res.map((re) => `${re.source.slice(0, 28)}: ${count(en, re)}`).join('; ')} |`)
say()

// --- Chinese ---------------------------------------------------------------
section('zh-Hans')
const zh = leaves.zh
const enK = byKey('en')
list('ASCII punctuation after a CJK character (should be full-width)', zh.filter(([, t]) => cjkRe('[CJK][,.!?:;()]').test(t) || cjkRe('[,.!?:;()][CJK]').test(t)).map(([k, t]) => [k, t, (t.match(cjkRe('[CJK][,.!?:;()]|[,.!?:;()][CJK]', 'g')) ?? []).join(' ')]))
list('A space beside full-width punctuation', zh.filter(([, t]) => /[，。！？：；（）、] | [，。！？：；（）、]/.test(t)))
say(`Spacing between CJK and Latin or digits: with a space ${count(zh, cjkRe('[CJK] [A-Za-z0-9{]|[A-Za-z0-9}] [CJK]', 'g'))}, without ${count(zh, cjkRe('[CJK][A-Za-z0-9{]|[A-Za-z0-9}][CJK]', 'g'))} (the VH-122 decision says which is the house rule).`)
say()
list('Without a space between CJK and Latin or a digit', zh.filter(([, t]) => cjkRe('[CJK][A-Za-z0-9{]|[A-Za-z0-9}][CJK]').test(t)).map(([k, t]) => [k, t, (t.match(cjkRe('.?[CJK][A-Za-z0-9{].?|.?[A-Za-z0-9}][CJK].?', 'g')) ?? []).slice(0, 4).join(' · ')]))
list('With a space between CJK and Latin or a digit', zh.filter(([, t]) => cjkRe('[CJK] [A-Za-z0-9{]|[A-Za-z0-9}] [CJK]').test(t)).map(([k, t]) => [k, t, (t.match(cjkRe('.?[CJK] [A-Za-z0-9{].?|.?[A-Za-z0-9}] [CJK].?', 'g')) ?? []).slice(0, 4).join(' · ')]))
say(`Quotation marks: “ ${count(zh, /“/g)}, ” ${count(zh, /”/g)}, ‘ ${count(zh, /‘/g)}, ’ ${count(zh, /’/g)}, 「 ${count(zh, /「/g)}, 」 ${count(zh, /」/g)}, straight " ${count(zh, /"/g)}, straight ' ${count(zh, /'/g)}. Ellipses: … ${count(zh, /…(?!…)/g)}, …… ${count(zh, /……/g)}, ... ${count(zh, /\.\.\./g)}.`)
say()
list('Straight quotes', zh.filter(([, t]) => /["']/.test(t)))
list('Ends with an ASCII full stop', zh.filter(([, t]) => /\.\s*$/.test(strip(t))))
list('Terminal punctuation differs from the English', zh.filter(([k, t]) => enK[k] !== undefined && terminal(t) !== terminal(enK[k])).map(([k, t]) => [k, t, `zh ${terminal(t)}, en ${terminal(enK[k])}`]), 60)
const latinWords = new Map()
for (const [, t] of zh) for (const w of strip(t).match(/[A-Za-z][A-Za-z.-]+/g) ?? []) latinWords.set(w, (latinWords.get(w) ?? 0) + 1)
say('### Latin words inside the Chinese table (names, codes, or untranslated) — distinct ' + latinWords.size)
say()
say(Array.from(latinWords.entries()).sort((a, b) => b[1] - a[1]).map(([w, n]) => `${w} ${n}`).join(', '))
say()
list('A leaf with no CJK at all', zh.filter(([, t]) => !CJK.test(t)))

// --- Malay -----------------------------------------------------------------
section('ms-MY')
const ms = leaves.ms
list('Starts lower-case', ms.filter(([, t]) => /[a-z]/.test(firstLetter(t))))
list('Terminal punctuation differs from the English', ms.filter(([k, t]) => enK[k] !== undefined && terminal(t) !== terminal(enK[k])).map(([k, t]) => [k, t, `ms ${terminal(t)}, en ${terminal(enK[k])}`]), 60)
list('Straight quotes', ms.filter(([, t]) => /["']/.test(t)))
say(`Curly marks in use: “ ${count(ms, /“/g)}, ” ${count(ms, /”/g)}, ‘ ${count(ms, /‘/g)}, ’ ${count(ms, /’/g)}.`)
say()
list('Double spaces, tabs, leading or trailing space', ms.filter(([, t]) => new RegExp(' {2}|\\t|^\\s|\\s$|' + String.fromCharCode(0xa0)).test(t)))
list('Three dots, or a hyphen as a dash', ms.filter(([, t]) => /\.\.\.| - | -- /.test(t)))
say(`Anda ${count(ms, /\bAnda\b/g)} / anda ${count(ms, /\banda\b/g)}.`)
say()
const msFamilies = {
  'video / klip / rakaman / fail': [/\bvideo\b/gi, /\bklip\b/gi, /\brakaman\b/gi, /\bfail\b/gi],
  'simpan / muat turun': [/\bsimpan\b/gi, /\bmuat turun\b/gi],
  'pelayar / penyemak imbas': [/\bpelayar\b/gi, /\bpenyemak imbas\b/gi],
  'buat / cipta / hasilkan / jana (create)': [/\bbuat\b/gi, /\bcipta\b/gi, /\bhasilkan\b/gi, /\bjana\b/gi],
  'batal / henti / berhenti': [/\bbatal\w*\b/gi, /\bhenti\w*\b/gi, /\bberhenti\b/gi],
  'peranti / komputer / telefon': [/\bperanti\b/gi, /\bkomputer\b/gi, /\btelefon\b/gi],
  'kad tajuk / kad': [/\bkad tajuk\b/gi, /(?<!tajuk )\bkad\b/gi],
  'penutup / pengakhiran / penamat (closing)': [/\bpenutup\w*\b/gi, /\bpengakhiran\b/gi, /\bpenamat\b/gi],
  'bunyi / audio': [/\bbunyi\b/gi, /\baudio\b/gi],
  'pilih / tandakan (tick)': [/\bpilih\b/gi, /\btanda\w*\b/gi],
}
say('### One word for one thing — counts across the Malay table')
say()
say('| family | counts |', '| --- | --- |')
for (const [name, res] of Object.entries(msFamilies)) say(`| ${name} | ${res.map((re) => `${re.source.slice(0, 28)}: ${count(ms, re)}`).join('; ')} |`)
say()
list('English function words left in the Malay (untranslated fragments)', ms.filter(([, t]) => /\b(the|and|your|with|this|that|will|from)\b/.test(strip(t))).map(([k, t]) => [k, t, (strip(t).match(/\b(the|and|your|with|this|that|will|from)\b/g) ?? []).join(' ')]))

// --- across the three ---------------------------------------------------------
section('Across the tables')
const zhK = byKey('zh'), msK = byKey('ms')
list('A leaf identical to its English (not translated, or a name)', leaves.en.filter(([k, t]) => zhK[k] === t || msK[k] === t).map(([k, t]) => [k, t, `${zhK[k] === t ? 'zh ' : ''}${msK[k] === t ? 'ms' : ''}`]), 60)
console.log(out.join('\n'))
