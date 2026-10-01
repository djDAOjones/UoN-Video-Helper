# Codex astra groundwork for VH-105 — 1 October 2026

Read-only groundwork for translating the page into Simplified Chinese and
Bahasa Malaysia, kept as written. Codex CLI with `gpt-6-astra`, briefed to
produce what survives VH-124 rewriting the copy first: where every string
comes from, formatting through `Intl`, architecture options, the switcher,
CJK type, the gate, and constraints VH-124 should honour now. Its
`src/main.ts` line numbers come from the moving tree described in
[the pre-work README](README.md); four citations were spot-checked and held.
Only formatting changed: bold lines that served as headings are headings.

---

Read-only audit completed. I changed no files and ran neither the app nor tests. Other-session changes landed during the audit; references below use the latest readings, including VH-111 and subsequent page changes. Browser rendering, font selection and assistive-technology behaviour are **unverified**.

## 1. String-site inventory

Counts below count **source sites**, not eventual translation keys: a lookup table or conditional expression counts as one site unless its entries are listed separately. Repeated messages remain separate sites. HTML counts individual non-empty text nodes and relevant attribute values.

Flags: **F** fragments or fixed sentence order; **N** interpolated numbers; **P** English plural/agreement; **L** English list joining; **C** case conversion; **D** deliberately English diagnostics. These require more than replacing literals.

| Module | Count | Sites and content |
| --- | ---: | --- |
| `index.html` | **76** text/attribute chunks | Exhaustive breakdown immediately below. |
| `src/main.ts` | **93** copy/assembly groups; **6** additional technical-error origins; **15** logger calls | Breakdown below. Counts distinguish authored presentation expressions from logger calls; do not sum them into translation-key estimates. |
| `src/ui/format.ts` | **37** | Unknown/under-one-second `:16,18`; duration plural and composition `:24,28,29,33,34,36` **F/N/P**; unknown/“a few seconds” `:46,47`; size unknown/bytes/unit lookup/assembly `:63,64,65,72` **N/P**; resolution `:77` **N**; rate unknown/value `:82,86` **N/P**; 13 codec names `:98–110`; codec unknown/uppercase fallback `:114,115` **C**; mono/stereo/5.1/7.1/other channels `:122,124,126,128,130` **N/P**. |
| `src/ui/trim.ts` | **10** | Editable time formatting `:25,27,28` **N/F**; invalid-time and past-end messages `:62,72` **F/N**, including raw `start`/`end`; forwarded range error `:89`; whole/partial summaries `:96,97` **F/N**; handle beginning/end `:102,103`. |
| `src/ui/closing-choice.ts` | **15** | Cut/Fade/Slide/None `:24–27`; seconds plural `:30` **N/P**; no-closing `:37`; added-duration fragment `:42`; colour phrase `:43`; cut sentence `:45`; verb selection `:47`; freeze/picture sentences `:49,50`; initial uppercase `:54`; two disabled reasons `:64,69`. **F/P/C throughout composition; raw English colour enum leaks.** |
| `src/ui/result-summary.ts` | **18** | Whole/partial/from–to fragments `:44,46,47`; no/cut/sliding/fading/freeze/picture closing fragments `:53,54,55,57,58`; missing closing `:75`; label/verb choices `:79,80`; fallback sentences split at `:83,84,89,90`; picture fallback `:93`; final job-summary assembly `:99,100`. **F/N/C**, particularly `.toLowerCase()` at `:89`. |
| `src/ui/progress.ts` | **14** | Five stage names `:26–30`; milestone-word lookup `:37`; product title `:44`; stage–percentage `:82`; stage–milestone `:91`; running title `:102`; ready/failed/cancelled titles `:111,113,115`; running notice `:127`. **F/N**. |
| `src/ui/announce.ts` | **8** | Count-word lookup `:21`; numeric fallback `:22`; is/are `:31`; loss-count sentence `:33`; title/detail assembly `:34`; space join `:35`; warning headings joined with English punctuation `:45`; general space join `:50`. **F/N/P/L**. This includes landing VH-111 work. |
| `src/ui/source-panel.ts` | **42** | Full breakdown below. |
| `src/ui/preflight-panel.ts` | **36** | Four outcome headings `:56–59`; count words/template `:65,66` **N/P**; Chrome advice `:70,72`; reason branches `:80,81,86,87,90,91,98,99,102,103,107,111,113,114,117,119,121,123,125`; time estimate `:190`; size bound `:198`; source-size cap sentence `:214,215`; screen-content/preset advice `:226,227`; blocked/completed announcement and assembly `:291–293`. **F/N/L**. At `:190`, behaviour depends on equality with English `"a few seconds"`. |
| `src/ui/failure-text.ts` | **31** | Original unchanged/report advice `:26,28`; eleven failure pairs `:40,41,45,46,50,51,55,56,60,61,65,66,70,71,75,76,80,81,85,86,90,91`; assembled announcement `:98`; five startup blocks `:123,125,127,130,133`; captured-error introduction `:140`. **F**, including interpolated preset label and repeated report-advice fragments. |
| `src/ui/warning-text.ts` | **17** | Heading/detail pairs for no audio `:29,31`, clipping `:36,38`, quiet `:43,44`, variable level `:49,50`, noise `:55,57`, silence `:62,63`, target missed `:68,69`, metadata lost `:73,74`; reassurance `:126`. Silence duration is **F/N**. |
| `src/ui/system-check.ts` | **8** | Problem count `:45`, warning count `:48` **N/P**; checking/all passed `:51,53`; browser-note lead `:70` and three suffix constructions `:72,75,77` **F**. |
| `src/ui/drop-zone.ts` | **10** | Seven refusal messages `:67,70,73,76,78,79,81`; held hint `:87`; cached original hint `:115`; restoration/selection `:122`. File count `:79` is **N/P**. The cached hint will restore English after a language switch unless changed. |
| `src/ui/brand-assets.ts` | **1** | Logo `alt="University of Nottingham"` at `:52`; a proper name governed by the logo rule, not ordinary translated prose. |
| `src/ui/feedback.ts` | **36** | Browser/system labels and assembly `:46,48,50,52,53,55,57,59,61,63,65,66,67`; clipping `:72`; diagnostic lines/composition `:114,117,121,126,128,139,140,141,153,154,155,156,160,166,167,174,180,183,185`; clipboard separator `:194`; English-heading comparison `:227`; overflow disclosure guidance `:246`. Mostly **D/F/N/L**; `:246` is user guidance mixed into diagnostics and needs localisation. |
| `src/config/presets.ts` | **4** fields | Labels `:45,56`; descriptions `:46,57`. Labels have production consumers; descriptions are not the same as the short HTML descriptions at `index.html:280,287`. |
| `src/config/feedback.ts` | **2** | Address `:14`—opaque, preserve; email subject `:17`—scope decision required. |
| `src/config/branding.ts` | **0** prose messages | Internal type/onset/colour values at `:98–100` become English words through closing-summary interpolation. Keep IDs stable; translate their presentation. |
| `src/config/audio.ts`, `src/config/thresholds.ts`, `src/config/trim.ts` | **0** authored page messages | Their numeric values feed presentation, notably estimate rounding through `src/ui/format.ts:48` and minimum trim duration through `src/media/kept-range.ts:69`. |
| `src/workers/protocol.ts` | **0** authored English messages | Carries reports, summaries, warnings, raw failure messages, uncaught errors and stage/progress data at `:119,120,141,153,162,169`. The raw `message: string` contract at `:154` is the localisation hazard. |
| `src/workers/job.worker.ts` | **6** message/error sites, plus **10** logger calls | Generic inspection error `:379`; dev wrappers `:342,586`; deliberate error `:72`; output-read failure `:262`; verification failure `:283`. Unreadable-file/trim prose is forwarded at `:339,377,583`. |
| `src/media/inspect.ts` | **4** production presentation origins | Library container name at `:201`; unreadable-video error `:204`; sound-only/no-tracks errors `:236,237`. |
| `src/media/kept-range.ts` | **4** | Not a time `:53`; start after end `:63`; end before start `:66`; minimum duration `:69` **N/P**. These reach both the main-thread trim UI and worker failures. |
| `src/media/save.ts` | **4** | Picker type description `:129`; fallback stem `"video"` `:217`; branded/levelled/converted mark `:218`; filename template `:219` **F**. |
| `src/core/keep-awake.ts` | **0** custom unload strings; **2** logger calls | `beforeunload` requests a browser warning using `preventDefault()` and an empty `returnValue`, `:102–109`. |
| `src/core/version.ts` | **2** opaque identity values | Product version `:9`, build identity `:12`; preserve, rather than translate embedded dates or punctuation. |
| `src/styles/*.css` | **0** authored words | Generated `content` is empty at `src/styles/app.css:708,1010`; step numbers are HTML text, explicitly explained at `src/styles/app.css:193`. |

The **76 HTML chunks**, exhaustively:

| Area | `index.html` sites |
| --- | --- |
| Head and introduction | `<title>` `:6`; meta-description element `:7`; skip link `:13`; h1 `:30`; introductory sentence `:39`; three bullets `:41,42,43`; privacy `:45`; browser note `:49`. |
| Choose | Step number and heading `:63`—two chunks; file label `:69`; drop hint `:77`. |
| Trim | Number and heading `:102`—two; explanatory paragraph `:103`; unavailable-preview text `:109`; range labels `:114,115`; time-field labels `:125,142`; set-here buttons `:136,153`; format example `:159`; whole-video button `:168`. |
| Closing | Number and heading `:175`—two; hidden legend `:179`; type label `:192`; four options `:194–197`; onset label `:201`; options `:209,210`; help button `aria-label` on element `:214`; visible `?` `:221`; disabled reason `:225`; two help paragraphs, each split into bold label and following sentence, `:229,233`—four chunks **F**; colour legend `:241`; Blue/White `:249,255`. |
| Output | Number and heading `:269`—two; hidden legend `:271`; labels `:279,286`; descriptions `:280,287`. |
| Create | Number and heading `:297`—two; result-retention note `:303`; progress checkbox label `:322`; helper `:324`; accessible progress label `:338`. |
| Errors/footer | Errors heading `:355`; technical disclosure `:361`; report button `:366`; system-check summary `:385`; feedback button `:392`; loading version placeholder `:396`. |
| Feedback | Dialog heading `:405`; sentence split around injected address `:406,407` **F**; message label `:411`; validation message `:419`; details heading `:424`; disclosure explanation `:425`; email/copy/close buttons `:433,434,437`. |

There are no literal `title`, `alt`, `placeholder` or `aria-valuetext` attributes in the inspected HTML. Logo alt is installed by `src/ui/brand-assets.ts:52`; trim `aria-valuetext` is set by `src/main.ts:1217,1218`. `aria-labelledby`/`aria-describedby` values are ID relationships, not translatable words—for example `index.html:102,125`.

The **main-thread presentation sites**, grouped without omitting repeated copies:

| Area | `src/main.ts` sites |
| --- | --- |
| Version/check assembly | Development version `:367`; marks lookup `:372`; system summary `:409`; spoken-only space prefixes `:432,447`; appended developer failure `:523`; error heading/message assembly `:536,537`. **F/D**. |
| Boot checks | Six initial label/checking pairs `:552–557`; secure label/value `:561,563`; WebCodecs `:570,572`; storage `:578,580`; unsupported video/audio `:595,596`; encode labels/results `:619,621,625,627`; worker error `:755`; failed-start row `:759`; ready-in-milliseconds row `:768` **N**; choose prompt `:801`; no-response row `:807`. |
| Read/check states | Reading `:862,883`; unreadable `:923,942`; read-timeout prose `:939`; correct-trim instruction `:969`; checking `:973`; shown/spoken concatenation `:1030` **F**; sound-warning heading `:1039,1045`; check failure `:1065,1077`. |
| Trim | No-trim notice `:1134`; error space join `:1236` **L**; minimum-duration append `:1249` **F/N/P**; repeated correction/checking statuses `:1278,1281`. |
| Actions/locks | Create/Cancel/acknowledge `:1514,1519,1534`; stop check/check again/stop save `:1559–1561`; stopped-check status `:1595`; stopping-save status `:1614`; made/saved lock explanations `:1699–1703`. |
| Discard | Delivered-versus-unsaved question `:1756`; summary/outcome join `:1766` **F**; discard/keep `:1771,1785`; unsaved status `:1796`. |
| Processing | Start notice assembly `:1876` **F**; finished-warning heading `:1919,1934`; Ready `:1924`; ready status `:1928`; cancelled `:1942`; creation failures `:1950,1964`; cancelling `:2025`. |
| Result/save | Previous/finished + size `:2076` **F/N**; retention sentence `:2107`; save button `:2122`; saving status `:2135`; stopped/not-saved branches `:2160`; source-overwrite refusal `:2168`; download handoff `:2189`; completed save `:2194`; Saved button `:2210`; save failure `:2223`. |
| Feedback | Subject + build `:2278` **F/D**; too-long message `:2368`; mail-open result `:2378`; optional omitted-details suffix `:2380`; copied result `:2389`; copy failure `:2395`. **F**, with address and quoted control names embedded. |
| Development controls | Copy diagnostics `:2415`; copy success/failure `:2424,2425`; main error button `:2433`; deliberate error `:2436`; worker error button `:2443`. |
| Additional technical errors | Missing element `:132`; timeout/silence `:691,692`; unexpected ping/inspect/preflight replies `:765,932,1071`. **D**, potentially surfaced through captured-error handling. |

The **42 source-panel sites**:

- Extra video/audio count branches `src/ui/source-panel.ts:61,64`; found-track list `:67`; loss consequence `:69`; uncheckable-track heading/detail `:78,80`; caption/chapter/original-retention consequences `:95,99,101`; combined loss `:102`; caption/chapter plurals `:114,118`. **F/N/P/L**.
- Variable rate/detail `:135`; VFR explanation `:141`; output-rate consequence `:148`; row labels Duration/Video format/File size/Resolution/Frame rate at `:153,155,161,163,170`; decode note `:159`; rotation note `:166`; rate-note join `:172`. **F/N/L**.
- Sound format/decode/channels/sample-rate at `:179,181,183,185,187`; no-sound label/detail/consequence `:194–196`; captions label/uncheckable/found/none `:202,204,206,207`; file-type row `:210`.
- Spoken VFR fragment `:220`; lowercased channel description/no-sound `:221`; comma-joined summary `:222`; losses heading `:244`; properties disclosure `:272`; failure reassurance assembly `:312`. **F/L/C**.

**English diagnostics still have visible origins.** The feedback disclosure displays recent logger messages and arbitrary captured errors, so excluding those modules from the inventory would miss a screen-text route. They remain English under the signed scope, but need an English-language container. The route is `src/ui/feedback.ts:171–185` → `src/main.ts:2291`; captured errors also render directly at `src/main.ts:528–545`. Scope: `pm_skills/project/backlog.md:139–141`.

| Diagnostic-origin module | Logger sites | Additional authored error/marker sites |
| --- | --- | --- |
| `src/main.ts` | **15:** `:126,138,769,859,944,994,1079,1968,2000,2218,2224,2315,2374,2391,2453` | Technical errors and development message listed above. |
| `src/workers/job.worker.ts` | **10:** `:60,92,216,276,286,292,328,380,387,588` | Six message/error sites listed above. |
| `src/workers/retained.ts` | **2:** `:69,104` | — |
| `src/core/keep-awake.ts` | **2:** `:84,88` | Browser-owned unload prompt, not logger prose. |
| `src/core/diagnostics.ts` | **4:** `:96,152,191,194` | **3** fallback/pass-through sites: `"Unknown error"` `:134`; arbitrary rejection text `:145`; environment `"unknown"` `:159`. JSON identity/date/environment/context/errors/logs at `:172–178` are diagnostic data. |
| `src/core/redact.ts` | **0** | **10** marker expressions: `:52,63,64,65,66,84,90,95,99,115`; includes byte counts, truncated text and omitted-item counts. **D/N/F**. |
| `src/media/save.ts` | **7:** `:149,157,169,174,180,183,197` | — |
| `src/media/inspect.ts` | **2:** `:168,343` | Production-readable errors listed above. |
| `src/media/track-metadata.ts` | **1:** `:76` | — |
| `src/media/content-class.ts` | **2:** `:235,249` | — |
| `src/media/opfs.ts` | **9:** `:85,96,126,166,206,209,265,381,383` | **1:** disposed workspace `:278`. |
| `src/media/codec-probe.ts` | **4:** `:210,262,325,336` | — |
| `src/media/capability.ts` | **6:** `:93,101,116,134,162,180` | — |
| `src/media/encoder-delay.ts` | **3:** `:117,123,131` | — |
| `src/media/pipeline.ts` | **9:** `:241,285,305,346,380,418,463,470,742` | **3:** cancelled `:160`; missing source video `:266`; predicted loudness `:351`. |
| `src/media/probe.ts` | **3:** `:223,249,266` | — |
| `src/media/branding.ts` | **3:** `:269,272,307` | **3:** canvas `:75`; HTTP `:260`; missing video `:266`. |
| `src/media/audio-plan.ts` | **3:** `:171,238,352` | — |
| `src/media/output-integrity.ts` | **0** | **2:** unreadable/no samples `:50,63`. |
| `src/media/framerate.ts` | **0** | **2:** invalid rates `:42,72`. |
| `src/media/freeze.ts` | **0** | **2:** no candidate frames/canvas `:80,115`. |
| `src/media/composite.ts` | **0** | **2:** mismatched byte lengths `:64`; canvas `:230`. |
| `src/audio/kweighting.ts` | **0** | **1:** invalid sample rate `:69`. |
| `src/audio/loudness.ts` | **0** | **4:** sample rate/channel count/channel mismatch/chunk lengths `:201,204,231,237`. |
| `src/audio/truepeak.ts` | **0** | **3:** channel count/finished interpolator/channel mismatch `:207,216,219`. |

Those diagnostic templates contain English joins, plural assumptions and raw numbers; retaining English is intentional. Browser/library exception prose is an **open-ended external source**, not a finite translation inventory (`src/core/diagnostics.ts:145`; `src/workers/job.worker.ts:324`). Translate the user-facing explanation by error code; retain the raw reason in the English diagnostic passage.

**Browser-owned and user-owned strings:**

| Surface | Origin and localisation boundary |
| --- | --- |
| File input button, “No file chosen”, selected filename and file picker | Native input at `index.html:70`; wording belongs to browser/OS. Selected filename belongs to the user. Actual language under an app-only switch is **unverified**. |
| Video controls | `<video controls>` at `index.html:108`: play/pause, time, volume, fullscreen and other available controls belong to the browser. Native controls are recognised in `docs/01-specification.md:613`. |
| Native select/range/progress semantics | Options are app strings, while popup/role/value speech can be browser/AT generated: `index.html:192,201,114,338`; app range descriptions are overridden at `src/main.ts:1217`. Actual speech is **unverified**. |
| Validation bubbles | Current trim errors are custom (`src/ui/trim.ts:62`); feedback form is `novalidate` (`index.html:404`). Do not assume adding HTML validation later yields table-controlled messages. Browser bubble presentation is **unverified**. |
| Unload confirmation | Requested at `src/core/keep-awake.ts:102`; only a generic browser-controlled message is available, not a custom translation. [MDN beforeunload](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event). |
| Save picker/download UI | App supplies type description and suggested name at `src/media/save.ts:127–131`; remaining picker, overwrite and download wording belongs to browser/OS. |
| Email/clipboard interaction | External email UI follows the user’s email application; app feedback statuses remain translatable (`src/main.ts:2363–2395`). |
| Source filename and feedback draft | Preserve exactly; neither is translation copy (`src/ui/result-summary.ts:99`; `src/ui/feedback.ts:194`). |

## 2. Formatting sites

These are proposed replacements, **unverified until implemented**. Preserve the existing precision and estimation policy; changing language must not silently change the meaning or confidence of a number.

| Quantity | Current presentation and consumers | Replacement |
| --- | --- | --- |
| Duration | Rounded to whole seconds; hours omit seconds; minutes include remaining seconds; manual English plurals. `src/ui/format.ts:15–36`. Used by source facts/announcement `src/ui/source-panel.ts:153,217`, trim summaries/handles `src/ui/trim.ts:96–104`, result summary `src/ui/result-summary.ts:44,46`, silence warning `src/ui/warning-text.ts:63`. | `Intl.DurationFormat(locale, {style:'long'})` over the deliberately selected components; table keys for unknown and under-one-second cases. |
| Estimated processing time | “A few seconds” or rounded bands, `src/ui/format.ts:45–52`; thresholds in `src/config/thresholds.ts:171`; inserted at `src/ui/preflight-panel.ts:119,121,190`. | Preserve bands, then duration formatter. Return a semantic estimate kind; remove the English-string comparison at `src/ui/preflight-panel.ts:190`. |
| File/working/output size | Decimal powers of 1000; whole bytes; one decimal below 100 scaled units, otherwise integer, `src/ui/format.ts:62–72`. Source `src/ui/source-panel.ts:161`; storage/output estimates `src/ui/preflight-panel.ts:111,198`; result `src/main.ts:2076`. | `Intl.NumberFormat` with `style:'unit'`, byte/kilobyte/megabyte/gigabyte/terabyte and explicit fraction policy. Do scaling separately. |
| Picture dimensions | Rounded integers joined by ` × `, `src/ui/format.ts:77`; source summary `src/ui/source-panel.ts:218`. | Two `NumberFormat` values; locale-owned dimension pattern. No need to invent a “pixel” unit supported by `Intl`. |
| Frame rates | Two decimals at most, then “frames a second”, `src/ui/format.ts:83–86`; average/output notes `src/ui/source-panel.ts:135,148`. | `NumberFormat` plus a complete table message. Keep frames-per-second meaning explicit. |
| Audio sample rate | kHz rounded to one decimal; samples/second hard-coded to `en-GB`, `src/ui/source-panel.ts:187`. | Locale `NumberFormat` for both values; complete message for unit/explanation and their order. Remove fixed `en-GB`. |
| Rotation | Number + degree sign + upright explanation, `src/ui/source-panel.ts:166`. | `NumberFormat` plus table pattern; preserve the actual rotation value. |
| Channels | Named mono/stereo, literal “5.1”/“7.1”, otherwise `${count} channels`, `src/ui/format.ts:119–130`. | Named labels in tables; other counts through `NumberFormat`/`PluralRules`. Treat 5.1/7.1 as audio-layout identifiers, not ordinary decimal quantities. |
| Track counts | Hand-built singular/plural video/audio/caption/chapter phrases, `src/ui/source-panel.ts:61,64,114,118`. | Full count templates, `NumberFormat`, and `PluralRules` where the language needs grammatical variants. |
| Warning/problem counts | English count-word arrays and singular/plural branches, `src/ui/preflight-panel.ts:65`; `src/ui/announce.ts:21–33`; `src/ui/system-check.ts:45,48`. | Locale-owned count messages. `PluralRules` selects grammatical categories; it does not supply nouns, Chinese classifiers or Malay phrasing. |
| Dropped-file count | Raw `${files.length}`, `src/ui/drop-zone.ts:79`. | Locale count message and `NumberFormat`. |
| Added/minimum seconds | Manual “second(s)” in `src/ui/closing-choice.ts:30`; minimum seconds in `src/media/kept-range.ts:69` and `src/main.ts:1249`. | Duration/unit formatter inside whole messages; error code plus raw numeric parameter across worker boundary. |
| Progress percentage | Rounded/clamped integer + `%`, `src/ui/progress.ts:81,82`; accessible progress text at `src/main.ts:1411`. | `NumberFormat({style:'percent', maximumFractionDigits:0})` given a fraction, retaining current clamping. Do not feed it an already multiplied percentage. |
| Progress milestones | Literal quarter/half/three-quarters words, `src/ui/progress.ts:37,91`. | Whole locale messages for the three milestones. |
| Worker startup time | Rounded milliseconds + `ms`, `src/main.ts:766–768`. | `NumberFormat` with millisecond unit, or English diagnostic presentation if this row is explicitly classified that way. Currently it is ordinary page text. |
| Step numbers/references | Visible `1.`–`5.` in `index.html:63,102,175,269,297`; “step 2” and “step 1” embedded in `src/main.ts:969,2194`; `src/ui/failure-text.ts:46`. | Locale-owned step-heading/reference patterns with stable step IDs. Numbers must not become the only link between instructions and controls. |
| Lists | “and” joins `src/ui/source-panel.ts:67,102,206`; comma join `:222`; semicolon/space joins `src/ui/announce.ts:35,45,50`. | `Intl.ListFormat` for genuine noun lists. Complete templates or explicitly ordered message blocks for sentences; do not apply list formatting indiscriminately to paragraphs. |
| Editable trim times | ASCII `m:ss.s`/`h:mm:ss.s`, tenths and zero padding, `src/ui/trim.ts:20–28`; ASCII parser `:36–43`; values written at `src/main.ts:1226`. | Dedicated reversible formatter/parser; **not** general prose `DurationFormat`. |
| Result time range | Duration plus editable-style start/end values, `src/ui/result-summary.ts:44–47`. | Complete locale summary; reuse deliberate time formatting, without reconstructing English “of/from/to” fragments. |
| Dates | No ordinary page date formatter found. Build date is part of an opaque identity, `src/core/version.ts:12`; diagnostic capture date is ISO, `src/core/diagnostics.ts:174`. | Keep those machine identities unchanged. If a human-readable date is later exposed, use `Intl.DateTimeFormat`. |
| Diagnostic numeric output | Seconds, dimensions, rates, channel/sample counts `src/ui/feedback.ts:153–166`; binary/count markers `src/core/redact.ts:63–65,99`; DSP error values `src/media/pipeline.ts:351`; logger measurements `src/media/content-class.ts:238,243`. | Remain stable English/machine-format diagnostics under the signed exception. Do not run the entire diagnostic payload through page-locale formatting. |

`Intl.NumberFormat` supplies locale-aware numeric/unit formatting; formatting policy still needs explicit precision and grouping choices. [MDN NumberFormat options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat).

**DurationFormat fallback.** Compatibility data records support from Chrome 129, Firefox 136 and Safari 16.4; this is source verification, not testing those browsers here. Still feature-detect the constructor and supported locale, because A-17 explicitly requires the absence path. [Browser compatibility data](https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/builtins/Intl/DurationFormat.json); `pm_skills/project/backlog.md:164–166`.

Fallback: keep the same rounded components; format each through `NumberFormat` with hour/minute/second units, then `ListFormat` with unit-list semantics. Keep a small table-driven fallback if a required unit/list capability is missing. Do not import a polyfill or make a formatting feature a media-capability blocker. The first part is an **unverified implementation recommendation** derived from the no-dependency requirement at `pm_skills/project/backlog.md:136` and browser policy at `docs/01-specification.md:637`.

**Trim round trip.** `DurationFormat` has formatting methods, not a parse operation. [MDN DurationFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat).

Recommended, **unverified design**:

- Keep editable times explicitly **Latin digits, no grouping, colon separators and decimal point** in all three languages; translate the accompanying explanation. This preserves the existing parser contract and avoids guessing a user’s decimal convention (`src/ui/trim.ts:20–43`; `index.html:159`).
- Alternatively, localise digits/separators **only with a paired parser**: derive digits and decimal separator through `NumberFormat.formatToParts()`, define accepted time separators, normalise deliberately, then validate components. Do not assume `Number()` parses localised text or that Malay should inherit an Indonesian convention.
- Specify whether full-width Chinese-input forms such as `１：０５．５` are accepted. Supporting them requires explicit normalisation; current `\d`, `:` and `.` matching rejects them (`src/ui/trim.ts:37,38`).
- Preserve a field’s unfinished text and composition state during switching; do not reinterpret it under another grammar midway through editing (`src/main.ts:1124,1226,1334`).
- Preserve the existing rounded-end exception: a displayed end rounded slightly beyond the exact duration maps back to the actual endpoint (`src/ui/trim.ts:65–70`). “Round trip” here means retaining the intended displayed time and endpoint semantics, not recovering arbitrary sub-tenth precision from text.

## 3. Architecture options

All three are **unverified design proposals**. The recommendation is **A: stable HTML and targeted text/attribute updates**.

| Option | Shape | Trade-off and current obstacle |
| --- | --- | --- |
| **A. Marked HTML, stable dynamic nodes — recommended** | Tables at proposed `src/i18n/en-GB.ts`, `zh-Hans.ts`, `ms-MY.ts`; typed schema/formatters beside them. Static leaf elements/attributes carry bindings; TypeScript fills them. Dynamic views retain nodes and update presentation only. | Smallest disruption to existing IDs, listeners and native media elements. Requires separating stored semantic state from English strings and making current destructive renderers safe for presentation refresh. Current coupling: `src/main.ts:130–194,1124,2062`. |
| **B. Render the shell once from TypeScript, then patch it** | Same tables; TypeScript creates all static copy/markup once before current initialization. Subsequent switches patch stable nodes. | Removes duplicate HTML/table copy, but broadens the migration and weakens the existing English HTML fallback unless explicitly rebuilt. `required()` lookups happen during module initialization (`src/main.ts:130–194`); raw-markup tests assume literal HTML (`test/screen-text.test.ts:22–32`). |
| **C. Rebuild translated page/subtrees from a view model** | Same tables plus a full presentation model; reconcile or reconstruct views after switching. | Most architectural work and greatest state-loss risk without a rendering library. Current result reconstruction resets discard/save state (`src/main.ts:2063,2064,2124`); preview reset revokes/replaces resources (`src/main.ts:1153,1184`). Not recommended for this task. |

**Table contract.** Use semantic keys such as `trim.error.afterEnd`, `source.loss.captionTracks`, `save.downloadStarted`; avoid English text as keys and avoid sharing a key merely because two English labels happen to match. Full-message functions with named, typed parameters are sufficient—no new message-language engine is required. Current fragment-heavy examples are `src/ui/closing-choice.ts:42–50` and `src/ui/result-summary.ts:99–100`.

Keep preset/closing/stage/error IDs independent of translated labels. Move display labels out of operational config consumption, or give config a stable message key; never change `JobSpec` enum values with the locale (`src/config/presets.ts:45,56`; `src/config/branding.ts:98–100`; `src/workers/protocol.ts:169`).

A completeness gate should compare each locale’s **recursive key set** with English, reject missing/empty entries, and type-check parameter signatures. Derive a widened message schema from English or declare an explicit schema; avoid types that accidentally require the literal English value. Runtime English fallback should remain possible for unexpected failure, but must not make a missing-key test pass. Requirement: `pm_skills/project/backlog.md:151`.

**State-preserving switching needs these separations:**

| State to retain | Required change; current hazard |
| --- | --- |
| Source and preview | Retain the actual `File`, raw `SourceReport`, video element, object URL, playback position and paused state. Do not call selection/reset flows on locale change: `beginSelection` cancels/increments selection state (`src/main.ts:241`); `resetTrim` resets the range (`:1184`). |
| Source/preflight explanations | Retain raw reports and reason codes, then regenerate words. Source and preflight renderers replace their contents (`src/ui/source-panel.ts:232`; `src/ui/preflight-panel.ts:241`), potentially losing disclosure/focus state. Patch stable nodes or explicitly preserve that presentation state. |
| Trim and pending errors | Retain exact numeric range, each raw field draft, error code/parameters and which field owns it. Current errors and notices are stored as English strings (`src/main.ts:1124,1133`); `renderTrim` overwrites otherwise-valid draft values (`:1226`). |
| Running job | Retain worker, request IDs, cancellation state and job specification. Locale switching must not call `beginSelection`, `setJobInFlight` or dispatch a synthetic control change (`src/main.ts:241,636,1656`). |
| Progress | Retain latest raw stage **and fraction**, separately from announcement history. `progressMemo` holds stage/milestone; `onStage` both formats and consumes announcements (`src/main.ts:1379,1397`; `src/ui/progress.ts:84–103`). A language repaint must not replay completed milestones. |
| Choices and acknowledgement | Keep selected values, progress-announcement preference, disabled state and slow-job acknowledgement. `showProcessControls` rewrites acknowledgement/start visibility (`src/main.ts:2040–2052`). |
| Unsaved/saving/saved result | Retain immutable job record, actual outcome, OPFS lease, active save controller, delivered-versus-saved distinction and completed-save state. **Do not call `renderResult` to translate:** it replaces nodes, clears `discardAsked`, and creates a new `saved=false` closure (`src/main.ts:2063,2064,2124`). The newer `savedResultFor` state also needs preservation (`:1816,2203`). |
| Discard confirmation | Patch its existing question/buttons; retain pending confirmation and focus. Current state is separate from the result (`src/main.ts:1488,1756`). |
| Feedback | Preserve textarea contents, selection/caret, validation, disclosure, current feedback status and dialog-open state. Do not reopen the dialog merely to translate; `openFeedback` clears status and initiates diagnostic collection (`src/main.ts:2302`). |
| Focus and live regions | Preserve active element and disclosure state; update accessible names in place. Use VH-111’s focus discipline (`src/main.ts:459`). Announce the completed language change once in the new language; avoid replaying every translated live-region message. Exact screen-reader timing is **unverified**. |

Async completions should resolve messages using the **current** locale when they reach the UI, rather than retaining English strings captured before an `await`. Store descriptors such as `{key, parameters}`, not translated strings, for persistent statuses. This addresses the current string-only status setters and error map (`src/main.ts:425,442,1124`).

**Language and storage:**

- Set `document.documentElement.lang` to the selected tag; proposed English tag is `en-GB`. Mark retained English diagnostic passages `lang="en-GB"`. Proper names, filenames and technical identifiers do not need blanket language overrides—A-17 explicitly grants those exceptions (`pm_skills/project/backlog.md:157–163`).
- Translate static leaf text and attributes without replacing their parent controls or inserting translated HTML. The inline help/address sentences need structured bindings that allow translated order (`index.html:229,233,406`).
- Use a whitelisted local preference value; guard access, read and write. Current progress preference provides a useful storage-failure pattern (`src/main.ts:1385`; `src/ui/progress.ts:133–147`).
- On missing/invalid/unavailable storage, use a defined default and retain this session’s choice in memory. **Proposed default, unverified:** English; no automatic browser-language negotiation unless explicitly added to scope.
- “Per browser” should mean **per origin/browser profile**, not globally across every installation. Cross-tab switching behaviour is unspecified; recommendation: do not force another active tab to change language while someone edits. The current preference is already origin storage (`src/main.ts:1385`); the requirement is `pm_skills/project/backlog.md:153,154`.

## 4. The switcher

**Recommended position, unverified design:** below the logo header band, immediately **after the h1 and before the lede**, inside `main`. This preserves the current logo-only band and h1-first structure (`index.html:21,25,30,38`), including the existing structural assertion (`test/screen-text.test.ts:309`).

Use the signed-off Carbon content switcher, with options labelled in their own languages:

| Label | Element language |
| --- | --- |
| English | `en-GB` |
| 简体中文 | `zh-Hans` |
| Bahasa Malaysia | `ms-MY` |

Exact native labels remain subject to the named reviewers; the own-language/script requirement is signed off at `pm_skills/project/backlog.md:147–150`.

**Role: `tablist`, containing `tab` buttons, is appropriate here.** Carbon’s content-switcher accessibility implementation uses those roles with `aria-selected` and roving `tabindex`. It switches the language presentation of the page. The colour control instead chooses a **job form value** and correctly remains a radio group (`index.html:242–244`). A similar segmented appearance does not require identical semantics. [Carbon content-switcher accessibility](https://carbondesignsystem.com/components/content-switcher/accessibility/).

Proposed interaction, **unverified in this app**:

- Named tablist; each option has its own `lang`.
- Exactly one `aria-selected="true"`; selected tab is in the normal Tab sequence.
- Arrow keys move among tabs; Home/End reach endpoints; Enter/Space activate. Manual activation avoids relabelling the whole page merely while exploring options.
- Click/tap activates; selected styling uses more than colour.
- Associate tabs with the permanent translated content panel using `aria-controls`; update the panel’s labelling to the selected tab. Reuse the content DOM—do not keep three live copies of the app.
- Retain focus on the activated tab and announce the language change once.

These follow the tab pattern; a shared, reused panel and the resulting screen-reader experience still need real verification. [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). A-17 additionally requires touch/speech exposure and preserved focus (`pm_skills/project/backlog.md:157–161`).

## 5. Typography

Current tokens are exactly:

- `--font-body: Arial, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
- `--font-heading: 'Lora', Georgia, 'Times New Roman', serif`

Source: `src/styles/tokens.brand.css:77,78`. Lora is loaded through `src/ui/brand-assets.ts:60`; the bundled face is described as a Latin subset in `assets/README.md:11`.

The backlog’s “carry no CJK glyphs” wording is too absolute. The verifiable problem is **no explicitly selected CJK face**, as A-17 says; generic/system fallback can still supply glyphs (`pm_skills/project/backlog.md:144–146`; `reviews/2026-10-01/spec-ux-accessibility-gaps-2026-10-01.md:493–495`).

**Proposed token system, unverified design:** add `--font-body-cjk` and `--font-heading-cjk`; map the effective body/heading roles under `:lang(zh-Hans)`. A conservative body candidate is:

`'PingFang SC', 'Microsoft YaHei', 'Noto Sans CJK SC', 'Noto Sans SC', sans-serif`

Choose the heading face explicitly with the reviewer; using the same known CJK sans face initially avoids silently pairing Lora with an arbitrary CJK serif. Apply language-sensitive font rules to the Chinese switcher option even while the page is English. Do not download a web font without approval. Existing font ownership is `UI-STANDARDS.md:40`; current stacks are `src/styles/tokens.brand.css:77`.

| OS | Relevant system-font evidence and limit |
| --- | --- |
| macOS/iOS | Apple lists PingFang SC weights as system fonts. Actual selected face on target devices remains **unverified**. [Apple system fonts](https://developer.apple.com/fonts/system-fonts/). |
| Windows 11 | Microsoft lists Microsoft YaHei/YaHei UI and SimSun/NSimSun. Some other Chinese faces are supplemental; do not assume optional fonts are installed. [Windows font list](https://learn.microsoft.com/en-us/typography/fonts/windows_11_font_list). |
| Android | AOSP config includes Noto CJK with language-sensitive fallback. OEM installation and CSS family-name resolution remain **unverified**; retain generic fallback and correct `lang`. [AOSP font configuration](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/data/fonts/fonts.xml). |
| ChromeOS | ChromiumOS includes a Noto CJK font package; exact shipping-device availability is **unverified**. [ChromiumOS font packages](https://chromium.googlesource.com/chromiumos/overlays/chromiumos-overlay/+/74e089d7c14fd0c6b11c9ff1afd35ae0ff01b170/media-fonts/). |
| Linux | No single distribution-wide installed face can be guaranteed here; installed CJK fonts are **unverified**. Keep generic fallback and verify the chosen deployment devices. |

**Chinese measure and spacing.** Current body line-height is `1.5`, h1 is `1.25`, prose measure is `70ch`, main width `60rem`, and lede width `46rem` (`src/styles/app.css:30,137,159,166`; `src/styles/tokens.carbon.css:51`). None independently proves the required 40-CJK-glyph measure (`docs/01-specification.md:590`; `pm_skills/project/backlog.md:164`).

Proposed, **unverified**: a Chinese measure token using `40ic`, with a `40em` fallback and `max-inline-size:100%`; verify actual lines using the selected font, mixed Latin text and punctuation. `40ch` measures the Latin zero, so it is not a reliable 40-Chinese-glyph limit. Keep at least the required line spacing and verify paragraph spacing; do not add spaces between Chinese characters or use `word-break:keep-all` for prose. Relevant existing ownership: `src/styles/app.css:33–38`; requirement: `docs/01-specification.md:590–611`.

**Malay phone-width risks—all actual overflow unverified:**

| Area | Concrete pressure point |
| --- | --- |
| Buttons | Action rows wrap, but button padding/minimum dimensions remain; long translated save/acknowledge/copy labels need wrapping checks (`src/styles/app.css:267–277`; `src/main.ts:1534`; `index.html:434`). |
| Trim input/button pair | Horizontal flex plus non-shrinking button can squeeze the time input (`src/styles/app.css:812,1127,1131`). |
| Closing grids | Fields wrap with 12rem/20rem bases; onset already has the longest option and a help button (`src/styles/app.css:767–782`; `index.html:210`). Native select text clipping needs browser verification. |
| Segmented controls | Current segments form a non-wrapping flex row with padded faces (`src/styles/app.css:858,877`). The three-language switcher needs its own phone treatment; copying the two-colour layout is insufficient. |
| Step headings | Number and title share the h2; verify wrapping keeps the number associated with the heading (`index.html:175`; `src/styles/app.css:187–199`). |
| Footer | Check grid has mark / flexible label / auto-width result columns; long result prose can compete with labels (`src/styles/app.css:227–264`; `src/main.ts:627`). Build identity is an unbroken identifier (`src/main.ts:367`). |
| Feedback | Dialog viewport width minus margins, plus substantial internal padding, reduces room for the longest controls (`src/styles/app.css:1194–1201`). |

## 6. The gate

`test/screen-text.test.ts` currently pins English both intentionally and incidentally:

- Reads raw HTML, strips head/tags for its visible-text corpus; therefore that corpus misses title/meta/accessible attributes (`:22–32`).
- Exact privacy wording, count and placement (`:37,44,48`).
- Exact introductory bullets/browser note (`:58–60,71,73`).
- English preset/closing controls and descriptions (`:93,170,176,177,193–210`).
- A markup regex incorporating ASCII step numbers and literal heading text (`:229,243–249`).
- Exact h1-first structure and English trim instructions/labels (`:309,328,337–342`).

**Proposed per-language gate, unverified implementation:**

1. Retain locale-independent structural assertions: stable IDs, label associations, step order, default values, native controls, hidden states and focus targets.
2. Exercise translated bindings and all message branches for each locale, including title/meta/alt/accessible names/`aria-valuetext`/live regions/filename.
3. Verify language-table completeness and parameter compatibility.
4. Preserve independently approved wording/meaning assertions for critical promises; do not make every test tautologically compare the rendered string with the same table entry that produced it.
5. Test locale changes in all A-17 states, especially typed-but-uncommitted trim, pending trim error, saving, already-saved result, discard confirmation and feedback draft.
6. Test storage exceptions and missing `DurationFormat`; verify trim formatting/parsing round trips and rounding boundaries in every supported representation.

These cover gaps in the current extraction and directly implement `pm_skills/project/backlog.md:151–166`.

`test/readability.test.ts` is specifically an English measure:

- Corpus is a file allowlist plus UI-module glob (`:28–40`).
- HTML head/attributes are excluded (`:44–55`).
- TS strings are regex-extracted; interpolation is replaced by `9`; punctuation/code heuristics discard some strings (`:62–71`). This is not a composed-message inventory.
- English vowel/suffix heuristics estimate syllables (`:77–85`); words require Latin letters and sentences use English punctuation (`:89–94`).
- Prose under eight whitespace-separated words is skipped; grade limit is 10 (`:21,23,144`).
- Abbreviation “beside it” currently means anywhere in the same file (`:155–162`).
- English technical-term bans and exact English spec sentences are pinned (`:170,182,185,188,189`).

**Recommendation:** keep Flesch–Kincaid **English-only**, run it over fully composed English message examples after VH-124, and improve inventory coverage. Applying it to Chinese can produce no grade; applying English syllable rules to Malay would produce an unjustified score. No validated replacement measure is established in the inspected code—replacement formula suitability is **unverified**. Require the signed native reviewers to assess plain language in context, including warnings and recovery actions; automated key/placeholder/terminology checks supplement that review (`pm_skills/project/backlog.md:142–155`; `test/readability.test.ts:77–94`).

**Sentence-case policy—proposed wording, reviewer confirmation unverified:**

| Language | Rule |
| --- | --- |
| English | Sentence case; capitalise sentence starts and proper names; preserve approved acronyms. Complete sentences take sentence punctuation; labels/headings do not acquire unnecessary final stops. |
| Bahasa Malaysia | Sentence case for Latin-script prose and labels, with Malay proper-name/acronym conventions reviewed natively; no automatic title-casing or English-derived lowercasing. |
| Simplified Chinese | No upper/lowercase rule for Han characters. Require appropriate Chinese sentence punctuation and consistent treatment of embedded Latin names/acronyms; do not manufacture a “capital first character” test. |

Current universal rule: `UI-STANDARDS.md:108`; VH-124’s copy rules: `pm_skills/project/tickets/VH-124.md:50–61`; A-17 requires language-specific treatment: `pm_skills/project/backlog.md:166`.

One existing governance mismatch needs reconciliation: the readability test says its format-name exceptions were considered/recorded (`test/readability.test.ts:109–120`), while the specification says **none accepted yet** (`docs/01-specification.md:627`). Do not silently treat a test allowlist as ratified multilingual terminology.

## 7. Constraints VH-124 should honour now

These are concrete copy/implementation constraints; proposed changes remain **unverified until adopted**.

- Write **complete messages**, with named parameters; do not build sentences from colour nouns, verbs, prefixes or appended English suffixes. Existing counterexamples: `src/ui/closing-choice.ts:42–50`; `src/ui/result-summary.ts:99–100`.
- Keep semantic states/codes independent of words. Never branch on translated text; replace the current `"a few seconds"` comparison with a semantic condition (`src/ui/preflight-panel.ts:190`).
- Keep the meaning of **estimate**, **upper bound**, **download handed off**, **saved**, **requested closing** and **actual closing** explicit. These distinctions already exist at `src/ui/preflight-panel.ts:198`; `src/main.ts:2189,2194`; `src/ui/result-summary.ts:72`.
- Avoid manual plurals, English “and” joins and programmatic case changes. Existing sites: `src/ui/source-panel.ts:114,118,206,221`; `src/ui/closing-choice.ts:54`.
- Use stable control terminology and quote the actual translated control label where instructions name it. Current embedded names appear in `src/ui/failure-text.ts:76,81` and `src/main.ts:2368`.
- Give visible copy, accessible labels, live announcements, title and suggested filename explicit inventory ownership. Do not treat them as separate last-minute translation work (`pm_skills/project/backlog.md:162,163`).
- Keep each inline sentence translatable as a unit, even around a bold label or address. Current split sites: `index.html:229,233,406`.
- Keep editable time notation separate from prose duration formatting; any example must be accepted by the parser (`index.html:159`; `src/ui/trim.ts:36–43`).
- Permit wrapping and content-driven height. Avoid layouts that depend on English button width or a one-line label (`src/styles/app.css:267,767,858,1131`).
- Preserve semantic source data and drafts when revising renderers; do not make future language switching depend on rerunning a check/job or rebuilding save controls (`src/main.ts:1124,1397,2062`).
- Treat capitals/full stops as English copy rules now, not universal string transformations later (`pm_skills/project/tickets/VH-124.md:50`; `src/ui/result-summary.ts:89`).

## 8. Risks and underspecified points

| Priority | Finding |
| --- | --- |
| **High** | **“Every string … one table” needs an explicit boundary.** Browser-owned file/video/unload/save UI cannot be supplied from the app tables. User filenames/drafts and raw third-party errors also require different treatment. Current sources: `index.html:70,108`; `src/core/keep-awake.ts:102`; `src/core/diagnostics.ts:145`. |
| **High** | **A translation repaint is currently capable of changing operational state.** Result rendering resets discard/save state; trim rendering overwrites drafts; progress rendering consumes announcement history. These are confirmed source hazards, not observed runtime failures: `src/main.ts:2063,2064,2124,1226,1397`. |
| **High** | **Worker errors are only partly structured.** Unreadable-file and trim prose cross the boundary as English strings. Add stable subcodes/parameters; translate on the main thread. Do not translate raw diagnostic exceptions. `src/workers/protocol.ts:154`; `src/workers/job.worker.ts:339,377,583`. |
| **High** | **Active save and already-saved state need explicit acceptance cases.** “Unsaved result survives” alone misses the save closure, downloaded-but-retained state and newer saved-result identity. `src/main.ts:2124,2178,2203`; requirement `pm_skills/project/backlog.md:160,161`. |
| **Medium** | **The top switcher is inaccessible while a modal feedback dialog is open.** Exact user journey is underspecified. Proposed acceptance: close → switch → reopen preserves draft; programmatic locale refresh also preserves an open dialog. Do not break modal focus containment to reach the top switcher. Current dialog flow: `src/main.ts:2302`; preservation requirement: `pm_skills/project/backlog.md:161`. Behaviour remains **unverified**. |
| **Medium** | **Default language, browser-language negotiation, origin scope and cross-tab behaviour are unspecified.** Define them; storage failure alone is not the whole preference contract. `pm_skills/project/backlog.md:153,165`; existing storage pattern `src/main.ts:1385`. |
| **Medium** | **Filename localisation needs a rule.** Translate the fallback stem/mark/template, preserve the source stem and `.mp4`, retain actual-outcome semantics, and define length/invalid-character handling. Proposed locale moment: when Save is invoked; never rename a download already handed off. `src/media/save.ts:217–219`; `src/main.ts:2149`. This policy is **unverified**. |
| **Medium** | **English diagnostic scope includes visible UI.** Mark diagnostic passages English, but translate the surrounding disclosure guidance. The current overflow instruction is embedded inside diagnostic text (`src/ui/feedback.ts:246`). Email subject/separator language also needs an explicit decision (`src/config/feedback.ts:17`; `src/ui/feedback.ts:194`). |
| **Medium** | **“Nothing about the choice leaves the device” needs a narrow, testable definition.** The diagnostics bundle already includes `navigator.language`, independently of the new preference (`src/core/diagnostics.ts:161`). Do not add selected app locale to diagnostics/feedback without resolving the signed local-only promise (`pm_skills/project/backlog.md:154`). |
| **Medium** | **Chrome-only acceptance is narrower than the permitted runtime surface.** At least exercise formatting fallback and language interaction on supported Safari/Firefox paths; full media certification is a separate issue. `pm_skills/project/backlog.md:156`; `docs/01-specification.md:637–665`. Cross-browser behaviour here is **unverified**. |
| **Medium** | **CJK font/measure acceptance needs named devices and faces.** A stack alone does not prove which font rendered or whether 40 glyphs fit. The backlog overstates missing glyphs; A-17 correctly identifies missing explicit selection. `pm_skills/project/backlog.md:144–146,164`; review `:493–495`. |
| **Medium** | **Missing-key checks cannot prove complete translation.** They miss unbound literals, incorrect parameters, English fallback fragments, stale cached hints and language-dependent branches. Concrete examples: `src/ui/drop-zone.ts:115`; `src/ui/preflight-panel.ts:190`; `src/ui/feedback.ts:227`. |
| **Low** | **Dependency wording is stale.** VH-105 still says it waits on VH-107–VH-114 (`pm_skills/project/backlog.md:137`), while VH-124 explicitly says VH-105 waits on it (`:92`). Use the latter ordering. |
| **Boundary retained** | Approved closing media stays unchanged; page localisation does not authorise translated branding assets. `pm_skills/project/backlog.md:139–141`. |

No translation, implementation, visual sign-off or quality-gate result is claimed. This report is the read-only groundwork for VH-105 after VH-124.
