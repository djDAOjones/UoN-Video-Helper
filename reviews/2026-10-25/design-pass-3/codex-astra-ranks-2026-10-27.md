<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), its blind ranking of pass 3's findings for VH-201, 2026-10-27, run in the repository's working tree at 86b1200, kept as written. Its brief is codex-astra-ranks-brief-2026-10-27.md; the sheet it ranked from is findings-neutral-2026-10-27.md, where its `vh201-findings-neutral.md` is the same file. -->

## 1. The merge

- **D-05: supported; merge into sheet D-05.** HEAD treats decoded audio below 400 ms as a silent keep and adds no audio track. The tests include generated sound, so this reaches beyond encoder priming (`src/media/audio-plan.ts:120`, `src/media/sub-block-sound.test.ts:61`, `src/media/pipeline.ts:536`). `S-99__en-GB__w1280__light` confirms the misleading warning, but does **not** demonstrate audible sound being removed; that part is established by source.
- **D-06: supported; merge into sheet D-06.** The finished card contains the player and Save before the warnings; the completion announcement contains warning headings only (`src/main.ts:3285`, `src/main.ts:3327`, `src/main.ts:3497`, `src/ui/announce.ts:42`). `S-135__en-GB__w1280__light` confirms that structure and announcement.
- **V-46: supported; merge into sheet V-46.** `S-149__en-GB__w1280__light` records focused Video language controls being withdrawn, leaving focus on `body`. Both failure paths still reach the withdrawal without a hand-off (`src/main.ts:1486`, `src/main.ts:1500`, `src/main.ts:1767`). The retained-result variant remains unobserved.

## 2. The ranks

**D-05 — page finding, rank 1.** The app can remove real sound while explaining that the recording has none, misidentifying the cause and undermining trust. Name Nielsen 1/2 and accurate recovery explanations (`project/digests/nielsen.md:17`, `UI-STANDARDS.md:160`; `src/i18n/en-GB.ts:671`, `src/media/sub-block-sound.test.ts:97`).

**D-06 — page finding, rank 2.** Advice needed before saving arrives after Save in reading order, while its announcement omits the listening instruction; successful saving also removes the in-page player. This is consequential friction under recognition and error prevention, without establishing an input-error WCAG failure (`UI-STANDARDS.md:166`, `project/digests/nielsen.md:25`; `src/main.ts:3441`, `src/i18n/en-GB.ts:722`; `S-135__en-GB__w1280__light`).

**V-46 — page finding, rank 2.** Losing the keyboard position creates a recovery burden and breaches the explicit successor requirement. Name WCAG 2.4.3 and the project’s focus hand-off rule (`docs/01-specification.md:717`; `S-149__en-GB__w1280__light`, `src/main.ts:1767`).

**V-48 — page finding, rank 2.** The rectangular authored button has 460 qualifying pixels against the recorded 464-pixel reference; 528 changed pixels do not all achieve the required contrast. The small deficit does not turn a named standard breach into polish: WCAG 2.4.13 (`UI-STANDARDS.md:241`; `S-113__ms-MY__w320__font32`, `src/styles/app.css:1086`).

**V-49 — page finding, rank 2.** The wrapped link is one rectangular `inline-flex` control, so its bounding-box reference is appropriate: 1,108 qualifying pixels fall below 1,264. Name WCAG 2.4.13; the sheet’s reported overlap supplies a plausible mechanism, although I did not inspect images (`S-83__en-GB__w320__forced-light`; `src/styles/app.css:210`; `vh201-findings-neutral.md:33`).

**V-18 — page finding, rank 2 for the recorded layout.** Requiring substantial scrolling before choosing a file is real starting friction under task-focused design and visible key controls (`UI-STANDARDS.md:166`, `UI-STANDARDS.md:177`; `vh201-findings-neutral.md:39`). Those coordinates are **not fresh HEAD measurements**: HEAD changes the lede help button’s geometry, and the sheet’s preceding-content inventory also omits the privacy paragraph and Video type (`src/styles/app.css:1115`, `index.html:78`, `index.html:93`).

**V-50 — page finding, rank 2.** Horizontal scrolling and clipped selected-option text create real friction; name the project’s enlargement commitment, while keeping combined narrow-window/enlarged-font evidence distinct from a conclusive standalone WCAG 1.4.10 test (`docs/01-specification.md:703`; `S-113__ms-MY__w320__font32`). **Correction:** that record reaches **528**, not 520 px; it also records overflowing trim buttons and Video language, and only 20 px of text room in each closing select (`instruments.overflow`, `instruments.asserts`; `src/styles/app.css:1016`, `src/styles/app.css:1265`, `src/styles/app.css:1539`).

**O-1 — no established page defect; instrument geometry issue.** The 304-pixel reference describes a square, whereas a 40-pixel circular radio’s circumference-based two-pixel reference is approximately 251 pixels, below the measured 284. I would not rank this as a WCAG 2.4.13 failure (`S-15__en-GB__w1280__font32`; `src/styles/app.css:799`).

**O-2 — instrument limit; no established page defect.** The union rectangle spans space between separate inline fragments; it is not evidence that the indicator must outline that entire rectangle. The record’s line measurements confirm the address splits across a line ending, so the 1,361/1,865 comparison needs a fragment-aware reference before a WCAG 2.4.13 verdict (`S-81__en-GB__w1280__light`, `instruments.measure`; `src/styles/app.css:75`, `src/styles/app.css:908`).

**O-3 — instrument limit and person’s check; unranked.** Actual indicator-background attribution remains unresolved, and exposed values do not prove delivery to assistive technology. **Clarification:** `outline: none` was an experimental probe of author adjustability, not a shipped suppression rule—the rows report empty `indicatorRules`; neither an automatic WCAG 2.4.13 failure nor a blanket native-control exemption follows (`S-127__en-GB__w1280__light`; `src/styles/app.css:1358`; `docs/01-specification.md:734`).

**O-4 — page finding, rank 2 for recovery guidance.** The error name alone is not an established naming violation: the enclosing region still identifies the finished video. However, the fault leaves “play … before you save” standing when playback is unavailable, with no corresponding recovery handling in the player constructor; name Nielsen 9 and actionable error explanations (`S-152__en-GB__w1280__light`, including its AX capture; `src/main.ts:2870`, `src/i18n/en-GB.ts:722`, `UI-STANDARDS.md:160`). This establishes a fault-state guidance problem, not ordinary output corruption.

## 3. Missing

**Incomplete accessibility-statement scope — rank 2.** The public limitation describes only the original preview, while the specification explicitly covers both players, including the finished video’s added cards. The existing statement should disclose that scope accurately; this is a documentation finding, not evidence of an additional media defect (`src/i18n/en-GB.ts:904`, `docs/01-specification.md:740`). Standard: the specification’s §9.3 limitation disclosure.

## 4. For the owner

- Decide whether D-05’s remedy should retain the 400 ms policy with truthful omission wording or reconsider sound preservation; the misleading explanation remains rank 1 either way (`src/media/audio-plan.ts:120`, `src/i18n/en-GB.ts:673`).
- Settle the existing warning’s placement and playback-failure wording together, so its listening advice remains achievable without another control (`src/main.ts:3327`, `src/i18n/en-GB.ts:722`).
- Decide which introductory content may move or shorten for V-18; confirm HEAD geometry before choosing the extent of that change (`index.html:48`, `index.html:93`, `src/styles/app.css:1115`).
- Keep O-3 unresolved until indicator-background evidence and real assistive-technology checks support a verdict (`S-127__en-GB__w1280__light`; `docs/01-specification.md:734`).

| Item | Finding or not | Rank | Standard |
|---|---|---:|---|
| D-05 | Yes | 1 | Nielsen 1/2; accurate explanations |
| D-06 | Yes | 2 | Nielsen 5/6; context at action |
| V-46 | Yes | 2 | WCAG 2.4.3; focus hand-off |
| V-48 | Yes | 2 | WCAG 2.4.13 |
| V-49 | Yes | 2 | WCAG 2.4.13 |
| V-18 | Yes; recorded layout | 2 | Visible controls; task-focused design |
| V-50 | Yes | 2 | Spec §9.3 enlargement commitment |
| O-1 | Instrument geometry issue | — | 2.4.13 failure not established |
| O-2 | Instrument limit | — | 2.4.13 unresolved |
| O-3 | Instrument/person check | — | 2.4.13 and 4.1.2 unresolved |
| O-4 | Yes: recovery guidance | 2 | Nielsen 9; actionable errors |
| Statement scope | Yes; missing from sheet | 2 | Spec §9.3 disclosure |