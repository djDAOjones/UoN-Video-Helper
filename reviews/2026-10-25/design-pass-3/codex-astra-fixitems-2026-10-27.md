<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), its blind fix items for pass 3's findings, VH-202, 2026-10-27, run in the repository's working tree at f012bc9, session 01a17d92-6772-7d63-8b55-e1759ca721a1, exit 0, kept as written. Its brief is codex-astra-fixitems-brief-2026-10-27.md. -->

## 1. Fix items

Blind draft against `f012bc9`; no files changed, and no app, tests, walker or browser run.

Below, **R** means `reviews/2026-10-25/design-pass-3/design-pass-3-2026-10-27.md`; **W** means that directory’s `evidence/measurements/walker/`. IDs VH-206–209 are proposed. Each belongs between VH-202 and VH-203; VH-202 changes no product code. Item form follows `project/items/_schema.md:13`.

### VH-206 — Say why the kept sound will be omitted

**Findings:** V-51.

**Intent:** Before Create, distinguish sound omitted by the kept-range rule from a source without audio, so the user can make an informed choice (R:254).

**Context and files:** `src/media/audio-plan.ts:93,124,284,350`; `src/workers/job.worker.ts:534–555`; `src/audio/warnings.ts:31,78–92`; `src/ui/warning-text.ts:69`; language entries `src/i18n/en-GB.ts:670`, `zh-Hans.ts:551`, `ms-MY.ts:590`. Extend `src/media/sub-block-sound.test.ts:30`, `src/audio/warnings.test.ts:55`, and `src/ui/warning-text.test.ts:21`.

**Acceptance criteria:**

- Carry a typed omission reason through the existing `no-audio` code; use the owner-approved words in §3. Preserve the 400 ms threshold, frame placement and `ends-early` precedence (`audio-plan.ts:120`; `warnings.ts:90`).
- Before/after: S-20, S-99–101, S-153; add N14 kept to `0:04.0`, zero decoded sound, absent-track and exact-block cases. Read exported tracks, rather than infer silence from no plan (R:156; `sub-block-sound.test.ts:61–110`).
- Measure at 1280/320 px, including text spacing and fallback fonts; re-check 1.4.6/8/10/12, 3.1.5 and 4.1.3. Name Nielsen 1/2/9, house “Fail loudly on data loss”, and the applicable WCAG digest rules (`project/digests/nielsen.md:17`; `house-conventions.md:57`; `wcag-2.2-aaa.md:53`).
- **VH-203’s complete stage rule:** Walker measurements before and after in en-GB, zh-Hans and ms-MY, light, dark, forced-light and forced-dark; affected WCAG checks repeated. Own CSS uses the separate brand and Carbon token files; no control, checkbox or element added; progress bar kept. Update UI-STANDARDS where a rule changes, within 2,400 words or ask the owner; `docs/` corrections become owner wish lines. Gate and `node tools/check.mjs` green, no test deleted or skipped; name applied digest rules. Before commit, Codex astra reviews the final candidate diff from a brief, with its base and evidence. Repair failing points and re-check, retaining the follow-up verdict; if Claude disagrees, leave the item open for the owner. Commit carries `Checked: gpt-6-astra — <verdict as given> — V-51` (`project/items/VH-203.md:9–14`).

**Now:** Updated: 2026-10-27. Next step: capture missing baselines. Open question: Owner approval of words.

### VH-207 — Hand focus on after either read failure

**Findings:** V-46.

**Intent:** Keep keyboard users on the task when an unreadable replacement withdraws setup controls (R:319).

**Context and files:** `src/main.ts:1481–1500,1756`; reuse `focusHeldBy` and `stepsWithdrawnBy` at `:915,939`, with guards in `src/ui/focus-hand-on.ts:85–98`. Extend `W/scenarios.mjs:2518` and its read-failure subresults.

**Acceptance criteria:**

- Capture the controls actually withdrawn **before** `clearTrim` disables or hides them; handle both failed reply and exception. Hand displaced focus to the chooser, with the existing enabled-successor fallback. Preserve surviving result controls and focus elsewhere or in the dialog (`main.ts:1757–1767`; `focus-hand-on.ts:90`).
- Before/after: S-149’s read-failure subresults, both branches, Video language and title fields; add J4 with a retained result, plus focus elsewhere/dialog guards. Read focus and next Tab before instruments move focus. At 1280/320 px, re-check 2.1.1, 2.4.3/7/11/12/13. Apply Nielsen 3 and WCAG’s keyboard/focus checklist (`project/digests/nielsen.md:21`; `wcag-2.2-aaa.md:55`).
- **VH-203’s complete stage rule:** Walker measurements before and after in en-GB, zh-Hans and ms-MY, light, dark, forced-light and forced-dark; affected WCAG checks repeated. Own CSS uses the separate brand and Carbon token files; no control, checkbox or element added; progress bar kept. Update UI-STANDARDS where a rule changes, within 2,400 words or ask the owner; `docs/` corrections become owner wish lines. Gate and `node tools/check.mjs` green, no test deleted or skipped; name applied digest rules. Before commit, Codex astra reviews the final candidate diff from a brief, with its base and evidence. Repair failing points and re-check, retaining the follow-up verdict; if Claude disagrees, leave the item open for the owner. Commit carries `Checked: gpt-6-astra — <verdict as given> — V-46` (`project/items/VH-203.md:9–14`).

**Now:** Updated: 2026-10-27. Next step: specify both failure variants and J4. Open question: None.

### VH-208 — Put listening advice before playback and Save

**Findings:** V-52.

**Intent:** Present the output advisory before the actions it informs, visually and programmatically (R:307).

**Context and files:** `src/main.ts:3073,3285–3327`; `src/ui/warning-text.ts:112`; `src/ui/announce.ts:40`; `test/screen-text.test.ts:310,724`; `src/ui/announce.test.ts:28`; `W/phase8.mjs:59`, `W/scenarios.mjs:2710`, `W/prove-8.mjs:152`.

**Acceptance criteria:**

- Reuse existing warning content inside the result card before player and Save, with one notification shell. Preserve warning order, retained-result identity, language repaint, Save availability and unchanged-after-save wording. Completion includes the existing listening sentence, including with Announce progress off; emitting heavy-limiting’s full existing detail avoids a second translation (`main.ts:3325`; `announce.ts:42`).
- Before/after: S-135–138, S-151–152 and no-warning S-53; include save, download, Keep it, replacement and language change. F15b records playback failure and successful Save without calling its guidance resolved (R:674).
- At 1280/320 px, re-check 1.3.1/2, 1.4.8/10/12, 2.4.3/13 and 4.1.3; distinguish live-region exposure from speech. Apply Nielsen 5/6 and Carbon’s logical reading order (`project/digests/nielsen.md:25`; `carbon.md:29`).
- **VH-203’s complete stage rule:** Walker measurements before and after in en-GB, zh-Hans and ms-MY, light, dark, forced-light and forced-dark; affected WCAG checks repeated. Own CSS uses the separate brand and Carbon token files; no control, checkbox or element added; progress bar kept. Update UI-STANDARDS where a rule changes, within 2,400 words or ask the owner; `docs/` corrections become owner wish lines. Gate and `node tools/check.mjs` green, no test deleted or skipped; name applied digest rules. Before commit, Codex astra reviews the final candidate diff from a brief, with its base and evidence. Repair failing points and re-check, retaining the follow-up verdict; if Claude disagrees, leave the item open for the owner. Commit carries `Checked: gpt-6-astra — <verdict as given> — V-52` (`project/items/VH-203.md:9–14`).

**Now:** Updated: 2026-10-27. Next step: qualify warning detection against both layouts. Open question: Owner disposition of failed-playback guidance.

### VH-209 — Give the onset and footer rings clear space

**Findings:** V-48, V-49.

**Intent:** Restore complete focus indicators using CSS alone; these share the stylesheet, tokens and pixel measurements (R:353–395).

**Context and files:** `src/styles/app.css:203–215,1051–1089`; existing `src/styles/tokens.carbon.css:97–101`; `test/stylesheet.test.ts:417`. Token changes only if existing tokens cannot express the remedy.

**Acceptance criteria:**

- Locate V-48’s missing pixels before choosing token-based clearance; do not assume sideways overflow caused them. Space footer links using existing tokens so the ring clears following text. Preserve target size and keyboard order (R:361,392).
- Before/after: `S-113__ms-MY__w320__font32`, all S-113 languages, S-112 breakpoint cases, and S-83/S-145’s eight forced-colour failures. Measure 1280/640/401/400/375/320 px, default and 32 px fonts. Re-check 2.4.7/11/12/13, 2.5.5, 1.4.4/10/11/12; retain real Windows checks as person-only evidence. Apply Carbon spacing/tokens and WCAG focus appearance (`project/digests/carbon.md:25,36`; `wcag-2.2-aaa.md:27`).
- **VH-203’s complete stage rule:** Walker measurements before and after in en-GB, zh-Hans and ms-MY, light, dark, forced-light and forced-dark; affected WCAG checks repeated. Own CSS uses the separate brand and Carbon token files; no control, checkbox or element added; progress bar kept. Update UI-STANDARDS where a rule changes, within 2,400 words or ask the owner; `docs/` corrections become owner wish lines. Gate and `node tools/check.mjs` green, no test deleted or skipped; name applied digest rules. Before commit, Codex astra reviews the final candidate diff from a brief, with its base and evidence. Repair failing points and re-check, retaining the follow-up verdict; if Claude disagrees, leave the item open for the owner. Commit carries `Checked: gpt-6-astra — <verdict as given> — V-48, V-49` (`project/items/VH-203.md:9–14`).

**Now:** Updated: 2026-10-27. Next step: localise V-48’s shortfall. Open question: Owner approval to include V-50.

Each close links its finding to its verification in R’s Disposition (`project/items/VH-203.md:15`).

## 2. Order

VH-206 first for rank 1; VH-207 next for the keyboard regression; VH-208 then changes result structure; VH-209 consolidates CSS verification. Separating the three behavioural remedies limits each session; grouping both rings avoids repeated stylesheet ownership. If wording approval waits, VH-207 proceeds (R:657).

## 3. V-51’s words

**Proposed en-GB heading:** “This part has too little sound”

**Detail:** “There is too little sound in the part you kept to level it. The new video will have no sound. To keep sound, choose a part with more of the recording’s sound.”

**Machine translation drafts:**

- **zh-Hans:** “保留部分的音频太短” — “您保留部分的音频太短，无法调节音量。新视频将没有声音。要保留声音，请选择包含更多原录音的部分。”
- **ms-MY:** “Bahagian ini mengandungi terlalu sedikit audio” — “Audio dalam bahagian yang anda kekalkan terlalu sedikit untuk diratakan. Video baharu tidak akan mempunyai bunyi. Untuk mengekalkan bunyi, pilih bahagian yang mengandungi lebih banyak audio daripada rakaman asal.”

Genuinely absent audio retains “This video has no audio” and its existing detail: “There is no audio to level, so the rest of the job runs without it. If you expected audio, check the recording before publishing.” (`src/i18n/en-GB.ts:670–674`).

Carry `kept-under-block` from `KeptSilence`, through the worker and a typed reason on `AudioWarning`, to `warningText`; avoid encoding it in numeric `detail` (`warnings.ts:34`). A trimmed keep with **zero decoded sound belongs to the kept-part case**, except where declared-but-undelivered sound requires `ends-early` (`warnings.ts:90–92`).

## 4. Findings without a fix item

**V-18:** retain VH-175.4 pending the owner; measure HEAD before reconsidering acceptance (R:413–424).

**V-50:** currently a proposal. If approved, add to VH-209: constrain/wrap both language switches, Video type, Set buttons, closing colour and statement heading across all six S-113 records; preserve selects’ separate VH-189.1 limitation (`app.css:897,1179,1265,1293,1539`; R:437–464).

Other missing evidence remains VH-203’s: accepted gaps, 823 player rows, corrected ring references, VH-205, file-button contrast, tracks/J4 and V-18 geometry; none becomes a pass by inference (R:131–163).

## 5. Risks

VH-208 is largest: tests and walker explicitly require warnings outside the card; replace those assumptions while preserving coverage (`screen-text.test.ts:310`; `W/phase8.mjs:59`). Shared `main.ts`, `warning-text.ts` and walker edits require sequential ownership.

V-48’s cause remains unlocated; its acceptance cannot depend on approving V-50 (R:361).

Spec §5.4 describes only absent streams: propose a wish-line correction for kept-range omission (`docs/01-specification.md:324`). Threshold changes would exceed this plan.

## 6. For the owner

- Approve V-51’s three-language words; recommend retaining 400 ms (R:659).
- Give V-50 rank 2 and approve its CSS remedy within VH-209 (R:667).
- Treat S-152’s guidance as rank 2; approve recovery within existing warning text, saving then listening locally before publishing (R:674).
- Keep V-18’s acceptance pending HEAD measurements and native wording; recommend no structural move yet (R:681).
- Recognise media-statement debt under existing VH-192.1, with words remaining VH-137’s (R:686).
- Recommend against any remedy requiring another control or element (`project/items/VH-203.md:11`).

| Item | Findings | Files | Order |
|---|---|---|---|
| VH-206 | V-51 | Audio plan, worker, warnings, warning text, three locales; tests/walker above | 1 |
| VH-207 | V-46 | `main.ts`; walker failure variants | 2 |
| VH-208 | V-52 | `main.ts`, warning text, announcements; tests/walker above | 3 |
| VH-209 | V-48, V-49; V-50 only if approved | `app.css`, existing tokens if needed; stylesheet tests | 4 |