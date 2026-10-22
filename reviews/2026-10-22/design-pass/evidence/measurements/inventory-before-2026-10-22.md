<!-- markdownlint-disable -->

# Design inventory — before (VH-163, 2026-10-22)

**How to run again.** With the Vite dev server on :5173 and a headless Chrome on :9222
(`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --remote-debugging-port=9222 --user-data-dir=<scratch>/chrome-profile --no-first-run about:blank`),
from `measurements/walker/`: `zsh fixtures.sh <scratch>/fixtures`, then
`FIX=<scratch>/fixtures OUT_ROOT=<scratch>/out EVIDENCE=<bundle>/evidence PREFIX=after node design-walk.mjs`
(runs en/zh/ms × 1280/375 × empty, ready, running, finished, the 1280 en dark and forced-colours empty/ready, and the en extras),
then `node inventory.mjs <scratch>/styles <bundle>/evidence/measurements/inventory-after-<date>`.
Diff the two `.json` files. All values are CSS px from `getComputedStyle` / `getBoundingClientRect` in Chrome 155; 375 runs use mobile emulation (375×812, DPR 2, touch).
Type, measure, grid and spacing tables count the **light-theme** captures only (dark and forced colours change colour, not geometry).

Captures: 33 (29 light). States: 1280-en-01-empty, 1280-en-02-ready, 1280-en-03-running, 1280-en-04-finished, 1280-en-05-title-card, 1280-en-06-trim-invalid, 1280-en-07-closing-none-disabled, 1280-en-08-system-check-open, 1280-en-09-statement-open, 1280-en-dark-01-empty, 1280-en-dark-02-ready, 1280-en-forced-01-empty, 1280-en-forced-02-ready, 1280-ms-01-empty, 1280-ms-02-ready, 1280-ms-03-running, 1280-ms-04-finished, 1280-zh-01-empty, 1280-zh-02-ready, 1280-zh-03-running, 1280-zh-04-finished, 375-en-01-empty, 375-en-02-ready, 375-en-03-running, 375-en-04-finished, 375-ms-01-empty, 375-ms-02-ready, 375-ms-03-running, 375-ms-04-finished, 375-zh-01-empty, 375-zh-02-ready, 375-zh-03-running, 375-zh-04-finished.
Spacing scale (`tokens.carbon.css`): --spacing-01 2px, --spacing-02 4px, --spacing-03 8px, --spacing-04 12px, --spacing-05 16px, --spacing-06 24px, --spacing-07 32px, --spacing-08 40px, --spacing-09 48px.
Brand lengths (`tokens.brand.css`): --uon-logo-height 62px, --uon-logo-clear 12px, --uon-logo-inset 20px.
Other shape tokens (`tokens.carbon.css`): --type-body-compact 0.875rem, --type-body 1rem, --type-heading-compact 1rem, --type-heading-03 1.25rem, --type-heading-04 1.75rem, --measure 55ch, --measure-cjk 40em, --layout-width 60rem, --field-min-width 12rem, --field-wide-min-width 20rem, --facts-term-width 8rem, --dialog-width 40rem, --detail-max-height 14rem, --log-max-height 18rem, --textarea-min-height 8rem, --border-width 1px, --border-width-emphasis 2px, --rail-width 4px, --focus-width 2px, --focus-offset 2px, --control-size 1.25rem, --mark-width 1.5rem, --target-min 44px.

## 1. Type

Elements that directly hold non-whitespace text. Style = first family / font-size / line-height / weight / letter-spacing. **16 distinct text styles overall.**

| style | n | langs | states | representative (tag.class × occurrences) |
|---|---|---|---|---|
| Lora / 28 / 35 / 700 / normal | 21 | en ms | 13 of 29 | h1.page-title×21 |
| Lora (+CJK stack) / 28 / 35 / 700 / normal | 8 | zh | 8 of 29 | h1.page-title×8 |
| Lora / 20 / 30 / 700 / normal | 212 | en ms | 13 of 29 | span.step-number×106, h2 > span×106 |
| Lora (+CJK stack) / 20 / 30 / 700 / normal | 76 | zh | 8 of 29 | span.step-number×38, h2 > span×38 |
| Arial / 16 / 24 / 400 / normal | 284 | en ms | 13 of 29 | ul > li×79, a.footer-contact-link×63, div.lede > p×42, p.step-intro×34, p#browser-note×21, p.footer-contacts-intro×21, div.statement-body > p×9, li.check > span×6 |
| Arial (+CJK stack) / 16 / 24 / 400 / normal | 92 | zh | 8 of 29 | ul > li×24, a.footer-contact-link×24, div.lede > p×16, p.step-intro×12, p#browser-note×8, p.footer-contacts-intro×8 |
| Arial / 16 / 24 / 700 / normal | 63 | en ms | 13 of 29 | legend.label×63 |
| Arial / 16 / 24 / 600 / normal | 62 | en ms | 13 of 29 | h2#system-check-summary×21, h2#statement-heading×21, p.notification-title×20 |
| Arial (+CJK stack) / 16 / 24 / 600 / normal | 28 | zh | 8 of 29 | p.notification-title×12, h2#system-check-summary×8, h2#statement-heading×8 |
| Arial (+CJK stack) / 16 / 24 / 700 / normal | 24 | zh | 8 of 29 | legend.label×24 |
| Arial / 16 / 20 / 700 / normal | 7 | en | 1 of 29 | div.statement-body > h3×7 |
| Arial / 14 / 21 / 400 / normal | 705 | en ms | 13 of 29 | label.label×106, p.helper×83, button.button.button--secondary×82, span.segment-face×63, span.helper-line×63, label.checkbox > span×38, span.radio-label > span×34, span.radio-detail×34 |
| Arial (+CJK stack) / 14 / 21 / 400 / normal | 323 | en ms zh | 13 of 29 | span.segment-face×82, label.label×36, p.helper×32, button.button.button--secondary×31, span.helper-line×22, p.notification-body×17, label.checkbox > span×14, span.radio-label > span×12 |
| Arial / 14 / 21 / 600 / normal | 97 | en ms | 13 of 29 | span.segment-face×63, button.button.button--secondary×17, span.segment-face > span×17 |
| Arial (+CJK stack) / 14 / 21 / 600 / normal | 36 | zh | 8 of 29 | span.segment-face×24, button.button.button--secondary×6, span.segment-face > span×6 |
| Arial / 14 / 21 / 700 / normal | 6 | en | 1 of 29 | span.mark×6 |


### 1.en — page language en: 10 distinct styles

| style | n | representative |
|---|---|---|
| Lora / 28 / 35 / 700 / normal | 13 | h1.page-title×13 |
| Lora / 20 / 30 / 700 / normal | 136 | span.step-number×68, h2 > span×68 |
| Arial / 16 / 24 / 400 / normal | 192 | ul > li×55, a.footer-contact-link×39, div.lede > p×26, p.step-intro×22, p#browser-note×13, p.footer-contacts-intro×13 |
| Arial / 16 / 24 / 700 / normal | 39 | legend.label×39 |
| Arial / 16 / 24 / 600 / normal | 34 | h2#system-check-summary×13, h2#statement-heading×13, p.notification-title×8 |
| Arial / 16 / 20 / 700 / normal | 7 | div.statement-body > h3×7 |
| Arial / 14 / 21 / 400 / normal | 440 | label.label×70, p.helper×51, button.button.button--secondary×51, span.helper-line×41, span.segment-face×39, label.checkbox > span×24 |
| Arial / 14 / 21 / 600 / normal | 61 | span.segment-face×39, button.button.button--secondary×11, span.segment-face > span×11 |
| Arial (+CJK stack) / 14 / 21 / 400 / normal | 26 | span.segment-face×26 |
| Arial / 14 / 21 / 700 / normal | 6 | span.mark×6 |


### 1.zh — page language zh: 7 distinct styles

| style | n | representative |
|---|---|---|
| Lora (+CJK stack) / 28 / 35 / 700 / normal | 8 | h1.page-title×8 |
| Lora (+CJK stack) / 20 / 30 / 700 / normal | 76 | span.step-number×38, h2 > span×38 |
| Arial (+CJK stack) / 16 / 24 / 400 / normal | 92 | ul > li×24, a.footer-contact-link×24, div.lede > p×16, p.step-intro×12, p#browser-note×8, p.footer-contacts-intro×8 |
| Arial (+CJK stack) / 16 / 24 / 600 / normal | 28 | p.notification-title×12, h2#system-check-summary×8, h2#statement-heading×8 |
| Arial (+CJK stack) / 16 / 24 / 700 / normal | 24 | legend.label×24 |
| Arial (+CJK stack) / 14 / 21 / 400 / normal | 281 | span.segment-face×40, label.label×36, p.helper×32, button.button.button--secondary×31, span.helper-line×22, p.notification-body×17 |
| Arial (+CJK stack) / 14 / 21 / 600 / normal | 36 | span.segment-face×24, button.button.button--secondary×6, span.segment-face > span×6 |


### 1.ms — page language ms: 8 distinct styles

| style | n | representative |
|---|---|---|
| Lora / 28 / 35 / 700 / normal | 8 | h1.page-title×8 |
| Lora / 20 / 30 / 700 / normal | 76 | span.step-number×38, h2 > span×38 |
| Arial / 16 / 24 / 400 / normal | 92 | ul > li×24, a.footer-contact-link×24, div.lede > p×16, p.step-intro×12, p#browser-note×8, p.footer-contacts-intro×8 |
| Arial / 16 / 24 / 600 / normal | 28 | p.notification-title×12, h2#system-check-summary×8, h2#statement-heading×8 |
| Arial / 16 / 24 / 700 / normal | 24 | legend.label×24 |
| Arial / 14 / 21 / 400 / normal | 265 | label.label×36, p.helper×32, button.button.button--secondary×31, span.segment-face×24, span.helper-line×22, p.notification-body×17 |
| Arial / 14 / 21 / 600 / normal | 36 | span.segment-face×24, button.button.button--secondary×6, span.segment-face > span×6 |
| Arial (+CJK stack) / 14 / 21 / 400 / normal | 16 | span.segment-face×16 |


### 1.stacks — full font-family stacks in use, by page language

- en :: Arial, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif — 779
- zh :: Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", "Source Han Sans SC", sans-serif — 461
- ms :: Arial, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif — 445
- en :: Lora, Georgia, "Times New Roman", serif — 149
- ms :: Lora, Georgia, "Times New Roman", serif — 84
- zh :: Lora, Georgia, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", "Source Han Sans SC", sans-serif — 84
- en :: Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", "Source Han Sans SC", sans-serif — 26
- ms :: Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", "Source Han Sans SC", sans-serif — 16


### 1.headings — same tag or role, different style

Includes headings whose words sit in a child span (the step headings). Family is the first family only, so a Chinese page's CJK fallback does not count as a difference. More than one row per kind = inconsistency.

| kind | style | n | langs | widths | where |
|---|---|---|---|---|---|
| .notification-title | Arial / 16 / 24 / 600 / normal | 32 | en ms zh | 1280 375 | p#language-notice-title-1.notification-title, p#notification-title-3.notification-title, p#notification-title-2.notification-title |
| h1 | Lora / 28 / 35 / 700 / normal | 29 | en ms zh | 1280 375 | h1.page-title |
| h2 **(2 styles)** | Lora / 20 / 30 / 700 / normal | 144 | en ms zh | 1280 375 | h2#choose-heading, h2#trim-heading, h2#title-heading, h2#closing-heading |
| h2 **(2 styles)** | Arial / 16 / 24 / 600 / normal | 58 | en ms zh | 1280 375 | h2#system-check-summary, h2#statement-heading |
| h3 | Arial / 16 / 20 / 700 / normal | 7 | en | 1280 | h3 |
| legend **(2 styles)** | Arial / 16 / 24 / 700 / normal | 87 | en ms zh | 1280 375 | fieldset#language-switcher.segmented.language-switcher > legend.label, fieldset#video-kind.segmented.video-kind > legend.label, fieldset#video-language.segmented.video-language > legend.label |
| legend **(2 styles)** | Arial / 14 / 21 / 400 / normal | 23 | en ms zh | 1280 375 | fieldset#closing-colour.field.segmented > legend.label |
| summary | Arial / 14 / 21 / 400 / normal | 23 | en ms zh | 1280 375 | details.disclosure > summary.disclosure-summary |


## 2. Measure

Elements holding ≥30 characters of running text (p, li, dd, helper lines, notification bodies, labels, statement text). `max` = computed max-width (px); `w` = rendered box width; `line` = widest rendered line. Grouped at 1280 px by page language and kind.


### 2.1280

| lang | kind | n | font px | max-width px (×n) | rendered w (×n) | widest line | who |
|---|---|---|---|---|---|---|---|
| en | footer | 9 | 14 | 428.2×9 | 428×9 | 310 | p.version |
| en | helper | 57 | 14 | none×30, 428.2×27 | 428×57 | 423 | span.helper-line, p.helper |
| en | lede | 45 | 16 | 489.4×45 | 489×45 | 488 | div.lede > p, ul > li, p#browser-note |
| en | notification | 7 | 14 | 428.2×7 | 428×7 | 422 | p.notification-body |
| en | p | 1 | 14 | 428.2 | 419 | 383 | p.field-error |
| en | span | 8 | 14 | none×8 | 359×8 | 359 | span.radio-detail |
| en | statement | 27 | 16 | 489.4×27 | 489×27 | 489 | ul > li, div.statement-body > p, p#statement-contact |
| en | status/reason line | 13 | 14 | 428.2×13 | 428×13 | 325 | p.trim-result, p.lock-note, p.status |
| en | step-intro | 16 | 16 | 489.4×16 | 489×16 | 487 | p.step-intro |
| en | system-check | 4 | 16 | none×4 | 377×3, 385 | 336 | li.check > span |
| zh | footer | 4 | 14 | 560×4 | 560×4 | 310 | p.version |
| zh | helper | 3 | 14 | 560×3 | 560×3 | 560 | p.helper |
| zh | lede | 8 | 16 | 640×8 | 640×8 | 594 | div.lede > p, p#browser-note |
| zh | notification | 2 | 14 | 560×2 | 560×2 | 519 | p.notification-body |
| zh | span | 3 | 14 | none×3 | 390×3 | 390 | span.radio-detail |
| zh | step-intro | 3 | 16 | 640×3 | 640×3 | 640 | p.step-intro |
| ms | footer | 8 | 16/14 | 489.4×4, 428.2×4 | 489×4, 428×4 | 310 | p.footer-contacts-intro, p.version |
| ms | helper | 27 | 14 | 428.2×16, none×11 | 428×24, 369×3 | 419 | p.helper, span.helper-line |
| ms | lede | 24 | 16 | 489.4×24 | 489×24 | 484 | ul > li, div.lede > p, p#browser-note |
| ms | notification | 8 | 14 | 428.2×8 | 428×8 | 423 | p.notification-body |
| ms | span | 6 | 14 | none×6 | 220×3, 458×3 | 458 | span.radio-detail |
| ms | status/reason line | 8 | 14 | 428.2×8 | 428×8 | 267 | p.lock-note, p.trim-result |
| ms | step-intro | 6 | 16 | 489.4×6 | 489×6 | 470 | p.step-intro |


### 2.375

| lang | kind | n | font px | max-width px (×n) | rendered w (×n) | widest line | who |
|---|---|---|---|---|---|---|---|
| en | footer | 4 | 14 | 428.2×4 | 327×4 | 310 | p.version |
| en | helper | 24 | 14 | 428.2×13, none×11 | 327×14, 277×10 | 316 | p.helper, span.helper-line |
| en | lede | 20 | 16 | 489.4×20 | 327×12, 303×8 | 320 | div.lede > p, ul > li, p#browser-note |
| en | notification | 5 | 16/14 | 428.2×4, 489.4 | 240×5 | 239 | p.notification-body, p.notification-title |
| en | span | 3 | 14 | none×3 | 245×3 | 203 | span.radio-detail |
| en | status/reason line | 8 | 14 | 428.2×8 | 277×8 | 244 | p.lock-note, p.trim-result |
| en | step-intro | 6 | 16 | 489.4×6 | 277×6 | 273 | p.step-intro |
| zh | footer | 4 | 14 | 560×4 | 327×4 | 310 | p.version |
| zh | helper | 3 | 14 | 560×3 | 277×3 | 266 | p.helper |
| zh | lede | 8 | 16 | 640×8 | 327×8 | 322 | div.lede > p, p#browser-note |
| zh | notification | 3 | 14 | 560×3 | 240×3 | 238 | p.notification-body |
| zh | span | 3 | 14 | none×3 | 245×3 | 236 | span.radio-detail |
| zh | step-intro | 3 | 16 | 640×3 | 277×3 | 272 | p.step-intro |
| ms | footer | 8 | 16/14 | 489.4×4, 428.2×4 | 327×8 | 310 | p.footer-contacts-intro, p.version |
| ms | helper | 27 | 14 | 428.2×16, none×11 | 327×14, 277×13 | 324 | p.helper, span.helper-line |
| ms | lede | 24 | 16 | 489.4×24 | 327×12, 303×12 | 324 | ul > li, div.lede > p, p#browser-note |
| ms | notification | 10 | 14/16 | 428.2×9, 489.4 | 240×6, 290×4 | 274 | p.notification-body, p.notification-title |
| ms | span | 6 | 14 | none×6 | 220×3, 245×3 | 220 | span.radio-detail |
| ms | status/reason line | 8 | 14 | 428.2×8 | 277×8 | 267 | p.lock-note, p.trim-result |
| ms | step-intro | 6 | 16 | 489.4×6 | 277×6 | 272 | p.step-intro |


### 2.short — how far helper and notification text stops short of body text (1280, max-width px, median)

| lang | body max | helper max | helper short by | notification max | notification short by | reason/status max |
|---|---|---|---|---|---|---|
| en | 489.4 | 428.2 | 61.2 | 428.2 | 61.2 | 428.2 |
| zh | 640 | 560 | 80 | 560 | 80 | NaN |
| ms | 489.4 | 428.2 | 61.2 | 428.2 | 61.2 | 428.2 |


Main column content width at 1280: en 912px, zh 912px, ms 912px.


## 3. Grid and left edges

| width | lang | state | main content left / width | h1 text left | header inner left–right | logo left | switcher left–right | footer inner left / width | footer min text left | h-scroll |
|---|---|---|---|---|---|---|---|---|---|---|
| 1280 | en | ready | 184 / 912 | 184 | 20–1260 | 20 (w 169.6) | 816.4–1260 | 184 / 912 | 184 | no |
| 1280 | en | statement-open | 184 / 912 | 184 | 20–1260 | 20 (w 169.6) | 816.4–1260 | 184 / 912 | 184 | no |
| 1280 | ms | ready | 184 / 912 | 184 | 20–1260 | 20 (w 169.6) | 803.1–1260 | 184 / 912 | 184 | no |
| 1280 | zh | ready | 184 / 912 | 184 | 20–1260 | 20 (w 169.6) | 865.4–1260 | 184 / 912 | 184 | no |
| 375 | en | ready | 24 / 327 | 24 | 20–355 | 20 (w 169.6) | 20–338.6 | 24 / 327 | 24 | no |
| 375 | ms | ready | 24 / 327 | 24 | 20–355 | 20 (w 169.6) | 20–338.6 | 24 / 327 | 24 | no |
| 375 | zh | ready | 24 / 327 | 24 | 20–355 | 20 (w 169.6) | 20–338.6 | 24 / 327 | 24 | no |


### 3.edges — distinct left edges of text inside each panel (text start x, px)

Per panel: `edge: what sits there (×n)`. Panels are the nearest section / details / fieldset (else the nearest .lede/.notification/header/footer). Inline elements that continue a line (a link or date inside a sentence, the words after a step number) are left out.


#### before-1280-en-02-ready

- **fieldset#language-switcher.segmented.language-switcher** — 4 edges: 816: legend.label · 958: span.segment-face · 1042: span.segment-face · 1134: span.segment-face
- **main** — 1 edges: 184: h1.page-title
- **div.lede** — 2 edges: 184: div.lede > p×2, p#browser-note · 208: ul > li×3
- **fieldset#video-kind.segmented.video-kind** — 3 edges: 184: legend.label, p.helper · 201: span.segment-face · 311: span.segment-face
- **fieldset#video-language.segmented.video-language** — 4 edges: 184: span.helper-line×2, legend.label · 201: span.segment-face · 285: span.segment-face · 376: span.segment-face
- **section#step-choose.panel.step** — 2 edges: 209: span.step-number, p.status · 226: p.helper.drop-hint
- **details.disclosure** — 1 edges: 237: summary.disclosure-summary
- **section#step-trim.panel.step** — 6 edges: 209: label.label×2, span.step-number, p.step-intro, p.helper · 234: button.button.button--secondary · 519: button.button.button--secondary · 652: label.label · 966: button.button.button--secondary · 1046: label.label
- **section#step-title.panel.step** — 1 edges: 209: span.step-number
- **fieldset#title-card-choice.choice** — 2 edges: 209: p.step-intro · 241: label.checkbox > span
- **section#step-closing.panel.step** — 1 edges: 209: span.step-number
- **fieldset#branding-choice.choice** — 7 edges: 209: label.label, span.helper-line · 241: label.checkbox > span · 456: label.label, p.helper · 798: button.button.button--secondary · 848: legend.label · 909: span.segment-face > span · 1017: span.segment-face > span
- **section#step-preset.panel.step** — 1 edges: 209: span.step-number
- **fieldset#preset-choice.choice** — 1 edges: 241: span.radio-label > span×2, span.radio-detail×2
- **section#step-create.panel.step** — 2 edges: 209: span.step-number, p.helper · 234: button.button
- **section.notification** — 1 edges: 229: p.notification-body×2, p.notification-title
- **details#system-check.panel.system-check** — 1 edges: 237: h2#system-check-summary
- **details#accessibility-statement.panel.statement** — 1 edges: 237: h2#statement-heading
- **footer.band.band--footer** — 2 edges: 184: a.footer-contact-link×3, p.footer-contacts-intro, p.version · 209: button.button.button--secondary


#### before-1280-en-04-finished

- **fieldset#language-switcher.segmented.language-switcher** — 4 edges: 816: legend.label · 958: span.segment-face · 1042: span.segment-face · 1134: span.segment-face
- **main** — 1 edges: 184: h1.page-title
- **div.lede** — 2 edges: 184: div.lede > p×2, p#browser-note · 208: ul > li×3
- **fieldset#video-kind.segmented.video-kind** — 3 edges: 184: legend.label, p.helper · 201: span.segment-face · 311: span.segment-face
- **fieldset#video-language.segmented.video-language** — 4 edges: 184: span.helper-line×2, legend.label, p.helper · 201: span.segment-face · 285: span.segment-face · 376: span.segment-face
- **section#step-choose.panel.step** — 2 edges: 209: span.step-number, p.status · 226: p.helper.drop-hint
- **details.disclosure** — 1 edges: 237: summary.disclosure-summary
- **section#step-trim.panel.step** — 6 edges: 209: label.label×2, span.step-number, p.step-intro, p.helper · 234: button.button.button--secondary · 519: button.button.button--secondary · 652: label.label · 966: button.button.button--secondary · 1046: label.label
- **section#step-title.panel.step** — 1 edges: 209: span.step-number
- **fieldset#title-card-choice.choice** — 2 edges: 209: p.step-intro · 241: label.checkbox > span
- **section#step-closing.panel.step** — 1 edges: 209: span.step-number
- **fieldset#branding-choice.choice** — 7 edges: 209: label.label, span.helper-line · 241: label.checkbox > span · 456: label.label, p.helper · 798: button.button.button--secondary · 848: legend.label · 909: span.segment-face > span · 1017: span.segment-face > span
- **section#step-preset.panel.step** — 1 edges: 209: span.step-number
- **fieldset#preset-choice.choice** — 1 edges: 241: span.radio-label > span×2, span.radio-detail×2
- **section#step-create.panel.step** — 2 edges: 209: span.step-number · 234: button.button.button--secondary
- **section.notification** — 2 edges: 229: p.notification-body×2, p.notification-title · 254: button.button
- **details#system-check.panel.system-check** — 1 edges: 237: h2#system-check-summary
- **details#accessibility-statement.panel.statement** — 1 edges: 237: h2#statement-heading
- **footer.band.band--footer** — 2 edges: 184: a.footer-contact-link×3, p.footer-contacts-intro, p.version · 209: button.button.button--secondary


#### before-1280-en-05-title-card

- **fieldset#language-switcher.segmented.language-switcher** — 4 edges: 816: legend.label · 958: span.segment-face · 1042: span.segment-face · 1134: span.segment-face
- **main** — 1 edges: 184: h1.page-title
- **div.lede** — 2 edges: 184: div.lede > p×2, p#browser-note · 208: ul > li×3
- **fieldset#video-kind.segmented.video-kind** — 3 edges: 184: legend.label, p.helper · 201: span.segment-face · 311: span.segment-face
- **fieldset#video-language.segmented.video-language** — 4 edges: 184: span.helper-line×2, legend.label · 201: span.segment-face · 285: span.segment-face · 376: span.segment-face
- **section#step-choose.panel.step** — 2 edges: 209: span.step-number, p.status · 226: p.helper.drop-hint
- **details.disclosure** — 1 edges: 237: summary.disclosure-summary
- **section#step-trim.panel.step** — 6 edges: 209: label.label×2, span.step-number, p.step-intro, p.helper · 234: button.button.button--secondary · 519: button.button.button--secondary · 652: label.label · 966: button.button.button--secondary · 1046: label.label
- **section#step-title.panel.step** — 1 edges: 209: span.step-number
- **fieldset#title-card-choice.choice** — 2 edges: 209: span.helper-line×4, label.label×4, p.step-intro · 241: label.checkbox > span
- **section#step-closing.panel.step** — 1 edges: 209: span.step-number
- **fieldset#branding-choice.choice** — 7 edges: 209: label.label, span.helper-line · 241: label.checkbox > span · 456: label.label, p.helper · 798: button.button.button--secondary · 848: legend.label · 909: span.segment-face > span · 1017: span.segment-face > span
- **section#step-preset.panel.step** — 1 edges: 209: span.step-number
- **fieldset#preset-choice.choice** — 1 edges: 241: span.radio-label > span×2, span.radio-detail×2
- **section#step-create.panel.step** — 2 edges: 209: span.step-number, p.helper · 234: button.button
- **section.notification** — 1 edges: 229: p.notification-body×2, p.notification-title
- **details#system-check.panel.system-check** — 1 edges: 237: h2#system-check-summary
- **details#accessibility-statement.panel.statement** — 1 edges: 237: h2#statement-heading
- **footer.band.band--footer** — 2 edges: 184: a.footer-contact-link×3, p.footer-contacts-intro, p.version · 209: button.button.button--secondary


#### before-1280-en-08-system-check-open

- **fieldset#language-switcher.segmented.language-switcher** — 4 edges: 816: legend.label · 958: span.segment-face · 1042: span.segment-face · 1134: span.segment-face
- **main** — 1 edges: 184: h1.page-title
- **div.lede** — 2 edges: 184: div.lede > p×2, p#browser-note · 208: ul > li×3
- **fieldset#video-kind.segmented.video-kind** — 3 edges: 184: legend.label, p.helper · 201: span.segment-face · 311: span.segment-face
- **fieldset#video-language.segmented.video-language** — 4 edges: 184: span.helper-line×2, legend.label · 201: span.segment-face · 285: span.segment-face · 376: span.segment-face
- **section#step-choose.panel.step** — 2 edges: 209: span.step-number, p.status · 226: p.helper.drop-hint
- **details.disclosure** — 1 edges: 237: summary.disclosure-summary
- **section#step-trim.panel.step** — 6 edges: 209: label.label×2, span.step-number, p.step-intro, p.helper · 234: button.button.button--secondary · 519: button.button.button--secondary · 652: label.label · 966: button.button.button--secondary · 1046: label.label
- **section#step-title.panel.step** — 1 edges: 209: span.step-number
- **fieldset#title-card-choice.choice** — 2 edges: 209: p.step-intro · 241: label.checkbox > span
- **section#step-closing.panel.step** — 1 edges: 209: span.step-number
- **fieldset#branding-choice.choice** — 7 edges: 209: label.label, span.helper-line · 241: label.checkbox > span · 456: label.label, p.helper · 798: button.button.button--secondary · 848: legend.label · 909: span.segment-face > span · 1017: span.segment-face > span
- **section#step-preset.panel.step** — 1 edges: 209: span.step-number
- **fieldset#preset-choice.choice** — 1 edges: 241: span.radio-label > span×2, span.radio-detail×2
- **section#step-create.panel.step** — 2 edges: 209: span.step-number, p.helper · 234: button.button
- **section.notification** — 1 edges: 229: p.notification-body×2, p.notification-title
- **details#system-check.panel.system-check** — 6 edges: 209: span.mark×6 · 237: h2#system-check-summary · 245: li.check > span×6 · 601: span.value · 634: span.value×3 · 642: span.value×2
- **details#accessibility-statement.panel.statement** — 1 edges: 237: h2#statement-heading
- **footer.band.band--footer** — 2 edges: 184: a.footer-contact-link×3, p.footer-contacts-intro, p.version · 209: button.button.button--secondary


#### before-1280-en-09-statement-open

- **fieldset#language-switcher.segmented.language-switcher** — 4 edges: 816: legend.label · 958: span.segment-face · 1042: span.segment-face · 1134: span.segment-face
- **main** — 1 edges: 184: h1.page-title
- **div.lede** — 2 edges: 184: div.lede > p×2, p#browser-note · 208: ul > li×3
- **fieldset#video-kind.segmented.video-kind** — 3 edges: 184: legend.label, p.helper · 201: span.segment-face · 311: span.segment-face
- **fieldset#video-language.segmented.video-language** — 4 edges: 184: span.helper-line×2, legend.label · 201: span.segment-face · 285: span.segment-face · 376: span.segment-face
- **section#step-choose.panel.step** — 2 edges: 209: span.step-number, p.status · 226: p.helper.drop-hint
- **details.disclosure** — 1 edges: 237: summary.disclosure-summary
- **section#step-trim.panel.step** — 6 edges: 209: label.label×2, span.step-number, p.step-intro, p.helper · 234: button.button.button--secondary · 519: button.button.button--secondary · 652: label.label · 966: button.button.button--secondary · 1046: label.label
- **section#step-title.panel.step** — 1 edges: 209: span.step-number
- **fieldset#title-card-choice.choice** — 2 edges: 209: p.step-intro · 241: label.checkbox > span
- **section#step-closing.panel.step** — 1 edges: 209: span.step-number
- **fieldset#branding-choice.choice** — 7 edges: 209: label.label, span.helper-line · 241: label.checkbox > span · 456: label.label, p.helper · 798: button.button.button--secondary · 848: legend.label · 909: span.segment-face > span · 1017: span.segment-face > span
- **section#step-preset.panel.step** — 1 edges: 209: span.step-number
- **fieldset#preset-choice.choice** — 1 edges: 241: span.radio-label > span×2, span.radio-detail×2
- **section#step-create.panel.step** — 2 edges: 209: span.step-number, p.helper · 234: button.button
- **section.notification** — 1 edges: 229: p.notification-body×2, p.notification-title
- **details#system-check.panel.system-check** — 1 edges: 237: h2#system-check-summary
- **details#accessibility-statement.panel.statement** — 3 edges: 209: div.statement-body > p×9, div.statement-body > h3×7, p#statement-contact, p#statement-enforcement · 233: ul > li×16 · 237: h2#statement-heading
- **footer.band.band--footer** — 2 edges: 184: a.footer-contact-link×3, p.footer-contacts-intro, p.version · 209: button.button.button--secondary


#### before-1280-ms-02-ready (edge counts only)

- fieldset#language-switcher.segmented.language-switcher: 4 edges (803, 961, 1042, 1131)
- section#language-notice.notification.language-notice: 1 edges (204)
- main: 1 edges (184)
- div.lede: 2 edges (184, 208)
- fieldset#video-kind.segmented.video-kind: 3 edges (184, 201, 303)
- fieldset#video-language.segmented.video-language: 4 edges (184, 203, 285, 374)
- section#step-choose.panel.step: 2 edges (209, 226)
- details.disclosure: 1 edges (237)
- section#step-trim.panel.step: 6 edges (209, 234, 437, 652, 904, 1033)
- section#step-title.panel.step: 1 edges (209)
- fieldset#title-card-choice.choice: 2 edges (209, 241)
- section#step-closing.panel.step: 1 edges (209)
- fieldset#branding-choice.choice: 7 edges (209, 241, 456, 798, 848, 910, 1019)
- section#step-preset.panel.step: 1 edges (209)
- fieldset#preset-choice.choice: 1 edges (241)
- section#step-create.panel.step: 2 edges (209, 234)
- section.notification: 1 edges (229)
- details#system-check.panel.system-check: 1 edges (237)
- details#accessibility-statement.panel.statement: 1 edges (237)
- footer.band.band--footer: 2 edges (184, 209)


#### before-1280-zh-02-ready (edge counts only)

- fieldset#language-switcher.segmented.language-switcher: 4 edges (865, 961, 1042, 1134)
- section#language-notice.notification.language-notice: 1 edges (204)
- main: 1 edges (184)
- div.lede: 2 edges (184, 208)
- fieldset#video-kind.segmented.video-kind: 3 edges (184, 201, 318)
- fieldset#video-language.segmented.video-language: 4 edges (184, 203, 285, 376)
- section#step-choose.panel.step: 2 edges (209, 226)
- details.disclosure: 1 edges (237)
- section#step-trim.panel.step: 6 edges (209, 234, 505, 652, 948, 1043)
- section#step-title.panel.step: 1 edges (209)
- fieldset#title-card-choice.choice: 2 edges (209, 241)
- section#step-closing.panel.step: 1 edges (209)
- fieldset#branding-choice.choice: 7 edges (209, 241, 456, 798, 848, 905, 1016)
- section#step-preset.panel.step: 1 edges (209)
- fieldset#preset-choice.choice: 1 edges (241)
- section#step-create.panel.step: 2 edges (209, 234)
- section.notification: 1 edges (229)
- details#system-check.panel.system-check: 1 edges (237)
- details#accessibility-statement.panel.statement: 1 edges (237)
- footer.band.band--footer: 2 edges (184, 209)


#### before-375-en-02-ready (edge counts only)

- fieldset#language-switcher.segmented.language-switcher: 4 edges (20, 37, 121, 212)
- main: 1 edges (24)
- div.lede: 2 edges (24, 48)
- fieldset#video-kind.segmented.video-kind: 3 edges (24, 41, 151)
- fieldset#video-language.segmented.video-language: 4 edges (24, 41, 125, 216)
- section#step-choose.panel.step: 1 edges (49)
- details.disclosure: 1 edges (77)
- section#step-trim.panel.step: 3 edges (49, 74, 301)
- section#step-title.panel.step: 1 edges (49)
- fieldset#title-card-choice.choice: 2 edges (49, 81)
- section#step-closing.panel.step: 1 edges (49)
- fieldset#branding-choice.choice: 5 edges (49, 81, 123, 258, 300)
- section#step-preset.panel.step: 1 edges (49)
- fieldset#preset-choice.choice: 1 edges (81)
- section#step-create.panel.step: 2 edges (49, 74)
- section.notification: 1 edges (69)
- details#system-check.panel.system-check: 1 edges (77)
- details#accessibility-statement.panel.statement: 1 edges (77)
- footer.band.band--footer: 2 edges (24, 49)


#### before-375-en-04-finished (edge counts only)

- fieldset#language-switcher.segmented.language-switcher: 4 edges (20, 37, 121, 212)
- main: 1 edges (24)
- div.lede: 2 edges (24, 48)
- fieldset#video-kind.segmented.video-kind: 3 edges (24, 41, 151)
- fieldset#video-language.segmented.video-language: 4 edges (24, 41, 125, 216)
- section#step-choose.panel.step: 1 edges (49)
- details.disclosure: 1 edges (77)
- section#step-trim.panel.step: 3 edges (49, 74, 301)
- section#step-title.panel.step: 1 edges (49)
- fieldset#title-card-choice.choice: 2 edges (49, 81)
- section#step-closing.panel.step: 1 edges (49)
- fieldset#branding-choice.choice: 5 edges (49, 81, 123, 258, 300)
- section#step-preset.panel.step: 1 edges (49)
- fieldset#preset-choice.choice: 1 edges (81)
- section#step-create.panel.step: 2 edges (49, 74)
- section.notification: 2 edges (69, 94)
- details#system-check.panel.system-check: 1 edges (77)
- details#accessibility-statement.panel.statement: 1 edges (77)
- footer.band.band--footer: 2 edges (24, 49)


#### before-375-ms-02-ready (edge counts only)

- fieldset#language-switcher.segmented.language-switcher: 4 edges (20, 39, 121, 210)
- section#language-notice.notification.language-notice: 1 edges (44)
- main: 1 edges (24)
- div.lede: 2 edges (24, 48)
- fieldset#video-kind.segmented.video-kind: 3 edges (24, 41, 143)
- fieldset#video-language.segmented.video-language: 4 edges (24, 43, 125, 214)
- section#step-choose.panel.step: 1 edges (49)
- details.disclosure: 1 edges (77)
- section#step-trim.panel.step: 3 edges (49, 74, 288)
- section#step-title.panel.step: 1 edges (49)
- fieldset#title-card-choice.choice: 2 edges (49, 81)
- section#step-closing.panel.step: 1 edges (49)
- fieldset#branding-choice.choice: 5 edges (49, 81, 124, 260, 300)
- section#step-preset.panel.step: 1 edges (49)
- fieldset#preset-choice.choice: 1 edges (81)
- section#step-create.panel.step: 2 edges (49, 74)
- section.notification: 1 edges (69)
- details#system-check.panel.system-check: 1 edges (77)
- details#accessibility-statement.panel.statement: 1 edges (77)
- footer.band.band--footer: 2 edges (24, 49)


#### before-375-zh-02-ready (edge counts only)

- fieldset#language-switcher.segmented.language-switcher: 4 edges (20, 39, 121, 212)
- section#language-notice.notification.language-notice: 1 edges (44)
- main: 1 edges (24)
- div.lede: 2 edges (24, 48)
- fieldset#video-kind.segmented.video-kind: 3 edges (24, 41, 158)
- fieldset#video-language.segmented.video-language: 4 edges (24, 43, 125, 216)
- section#step-choose.panel.step: 1 edges (49)
- details.disclosure: 1 edges (77)
- section#step-trim.panel.step: 3 edges (49, 74, 298)
- section#step-title.panel.step: 1 edges (49)
- fieldset#title-card-choice.choice: 2 edges (49, 81)
- section#step-closing.panel.step: 1 edges (49)
- fieldset#branding-choice.choice: 5 edges (49, 81, 117, 255, 300)
- section#step-preset.panel.step: 1 edges (49)
- fieldset#preset-choice.choice: 1 edges (81)
- section#step-create.panel.step: 2 edges (49, 74)
- section.notification: 1 edges (69)
- details#system-check.panel.system-check: 1 edges (77)
- details#accessibility-statement.panel.statement: 1 edges (77)
- footer.band.band--footer: 2 edges (24, 49)


### 3.steps — distinct text left edges per whole step (descendant fieldsets and notifications merged), ready state

| width | lang | step / block | edges | x (px) |
|---|---|---|---|---|
| 1280 | en | div.lede | 2 | 184, 208 |
| 1280 | en | fieldset#video-kind.segmented.video-kind | 3 | 184, 201, 311 |
| 1280 | en | fieldset#video-language.segmented.video-language | 4 | 184, 201, 285, 376 |
| 1280 | en | section#step-choose | 3 | 209, 226, 237 |
| 1280 | en | section#step-trim | 6 | 209, 234, 519, 652, 966, 1046 |
| 1280 | en | section#step-title | 2 | 209, 241 |
| 1280 | en | section#step-closing | 7 | 209, 241, 456, 798, 848, 909, 1017 |
| 1280 | en | section#step-preset | 2 | 209, 241 |
| 1280 | en | section#step-create | 3 | 209, 229, 234 |
| 1280 | en | details#system-check | 1 | 237 |
| 1280 | en | details#accessibility-statement | 1 | 237 |
| 1280 | en | footer.band.band--footer | 2 | 184, 209 |
| 1280 | ms | div.lede | 2 | 184, 208 |
| 1280 | ms | fieldset#video-kind.segmented.video-kind | 3 | 184, 201, 303 |
| 1280 | ms | fieldset#video-language.segmented.video-language | 4 | 184, 203, 285, 374 |
| 1280 | ms | section#step-choose | 3 | 209, 226, 237 |
| 1280 | ms | section#step-trim | 6 | 209, 234, 437, 652, 904, 1033 |
| 1280 | ms | section#step-title | 2 | 209, 241 |
| 1280 | ms | section#step-closing | 7 | 209, 241, 456, 798, 848, 910, 1019 |
| 1280 | ms | section#step-preset | 2 | 209, 241 |
| 1280 | ms | section#step-create | 3 | 209, 229, 234 |
| 1280 | ms | details#system-check | 1 | 237 |
| 1280 | ms | details#accessibility-statement | 1 | 237 |
| 1280 | ms | footer.band.band--footer | 2 | 184, 209 |
| 1280 | zh | div.lede | 2 | 184, 208 |
| 1280 | zh | fieldset#video-kind.segmented.video-kind | 3 | 184, 201, 318 |
| 1280 | zh | fieldset#video-language.segmented.video-language | 4 | 184, 203, 285, 376 |
| 1280 | zh | section#step-choose | 3 | 209, 226, 237 |
| 1280 | zh | section#step-trim | 6 | 209, 234, 505, 652, 948, 1043 |
| 1280 | zh | section#step-title | 2 | 209, 241 |
| 1280 | zh | section#step-closing | 7 | 209, 241, 456, 798, 848, 905, 1016 |
| 1280 | zh | section#step-preset | 2 | 209, 241 |
| 1280 | zh | section#step-create | 3 | 209, 229, 234 |
| 1280 | zh | details#system-check | 1 | 237 |
| 1280 | zh | details#accessibility-statement | 1 | 237 |
| 1280 | zh | footer.band.band--footer | 2 | 184, 209 |
| 375 | en | div.lede | 2 | 24, 48 |
| 375 | en | fieldset#video-kind.segmented.video-kind | 3 | 24, 41, 151 |
| 375 | en | fieldset#video-language.segmented.video-language | 4 | 24, 41, 125, 216 |
| 375 | en | section#step-choose | 2 | 49, 77 |
| 375 | en | section#step-trim | 3 | 49, 74, 301 |
| 375 | en | section#step-title | 2 | 49, 81 |
| 375 | en | section#step-closing | 5 | 49, 81, 123, 258, 300 |
| 375 | en | section#step-preset | 2 | 49, 81 |
| 375 | en | section#step-create | 3 | 49, 69, 74 |
| 375 | en | details#system-check | 1 | 77 |
| 375 | en | details#accessibility-statement | 1 | 77 |
| 375 | en | footer.band.band--footer | 2 | 24, 49 |
| 375 | ms | div.lede | 2 | 24, 48 |
| 375 | ms | fieldset#video-kind.segmented.video-kind | 3 | 24, 41, 143 |
| 375 | ms | fieldset#video-language.segmented.video-language | 4 | 24, 43, 125, 214 |
| 375 | ms | section#step-choose | 2 | 49, 77 |
| 375 | ms | section#step-trim | 3 | 49, 74, 288 |
| 375 | ms | section#step-title | 2 | 49, 81 |
| 375 | ms | section#step-closing | 5 | 49, 81, 124, 260, 300 |
| 375 | ms | section#step-preset | 2 | 49, 81 |
| 375 | ms | section#step-create | 3 | 49, 69, 74 |
| 375 | ms | details#system-check | 1 | 77 |
| 375 | ms | details#accessibility-statement | 1 | 77 |
| 375 | ms | footer.band.band--footer | 2 | 24, 49 |
| 375 | zh | div.lede | 2 | 24, 48 |
| 375 | zh | fieldset#video-kind.segmented.video-kind | 3 | 24, 41, 158 |
| 375 | zh | fieldset#video-language.segmented.video-language | 4 | 24, 43, 125, 216 |
| 375 | zh | section#step-choose | 2 | 49, 77 |
| 375 | zh | section#step-trim | 3 | 49, 74, 298 |
| 375 | zh | section#step-title | 2 | 49, 81 |
| 375 | zh | section#step-closing | 5 | 49, 81, 117, 255, 300 |
| 375 | zh | section#step-preset | 2 | 49, 81 |
| 375 | zh | section#step-create | 3 | 49, 69, 74 |
| 375 | zh | details#system-check | 1 | 77 |
| 375 | zh | details#accessibility-statement | 1 | 77 |
| 375 | zh | footer.band.band--footer | 2 | 24, 49 |


## 4. Spacing

Non-zero margin / padding / row-gap / column-gap on visible elements, light captures. On-scale values (×occurrences): 2px --spacing-01 ×138, 4px --spacing-02 ×92, 8px --spacing-03 ×1690, 12px --spacing-04 ×868, 16px --spacing-05 ×1726, 24px --spacing-06 ×1812, 32px --spacing-07 ×123, 40px --spacing-08 ×46, 48px --spacing-09 ×29.

**Off-scale: 1 distinct px values, 1 value/property/selector rows, 145 occurrences.** By value: -1px ×145.

The rule is the last matching author rule in source order that sets the longhand (a cascade approximation: a more specific earlier rule can win; check the line).

| px | property | element | n | where | rule → declared value @ file:line |
|---|---|---|---|---|---|
| -1 | margin-left | label.segment | 145 | en1280 ms1280 zh1280 en375 ms375 zh375 | .language-switcher .segment + .segment, .video-kind .segment + .segmen… → `calc(-1 * var(--border-width))` @ src/styles/app.css:1211 |


Not on the spacing scale but explained (auto centring, or a brand token from `tokens.brand.css`):

| px | property | element | n | kind | rule |
|---|---|---|---|---|---|
| 20 | padding-right | div.band-inner | 29 | brand token --uon-logo-inset | .band--header .band-inner → `var(--uon-logo-clear) var(--uon-logo-inset)` @ src/styles/app.css:151 |
| 20 | padding-left | div.band-inner | 29 | brand token --uon-logo-inset | .band--header .band-inner → `var(--uon-logo-clear) var(--uon-logo-inset)` @ src/styles/app.css:151 |
| 160 | margin-right | main.main | 17 | auto (centring) | .main → `auto` @ src/styles/app.css:228 |
| 160 | margin-left | main.main | 17 | auto (centring) | .main → `auto` @ src/styles/app.css:228 |
| 160 | margin-right | div.band-inner | 17 | auto (centring) | .band-inner → `auto` @ src/styles/app.css:125 |
| 160 | margin-left | div.band-inner | 17 | auto (centring) | .band-inner → `auto` @ src/styles/app.css:125 |


### 4.rhythm — rendered vertical gaps

`box` = next box top − previous box bottom; `ink` = first text top − previous text bottom (glyph boxes, so half-leading excluded).


#### heading→next block — distinct box gaps: 8, 16, 28 · ink gaps: 13, 21, 22, 25, 35, 36, 39, 90

| box | ink | pair | where |
|---|---|---|---|
| 8 | 13 | h3 in div.statement-body → div.statement-body > p | en1280 |
| 8 | 13 | h3 in div.statement-body → p#statement-contact | en1280 |
| 8 | 13 | h3 in div.statement-body → p#statement-enforcement | en1280 |
| 8 | 13 | h3 in div.statement-body → p#statement-wave | en1280 |
| 8 | 13 | h3 in div.statement-body → p#statement-about | en1280 |
| 16 | 90 | h2#choose-heading → div.field.drop-zone#drop-zone | en1280 ms1280 zh1280 |
| 16 | 22 | h2#trim-heading → p.step-intro | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 16 | 22 | h2#title-heading → fieldset.choice#title-card-choice | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 16 | 21 | h2#closing-heading → fieldset.choice#branding-choice | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 16 | 25 | h2#preset-heading → fieldset.choice#preset-choice | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 16 | 39 | h2#create-heading → div.step-lead#preflight-report | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 16 | 21 | h2#choose-heading → p.lock-note | en1280 ms1280 zh1280 |
| 16 | 21 | h2#trim-heading → p.lock-note | en1280 ms1280 zh1280 |
| 16 | 21 | h2#title-heading → p.lock-note | en1280 ms1280 zh1280 |
| 16 | 21 | h2#closing-heading → p.lock-note | en1280 ms1280 zh1280 |
| 16 | 21 | h2#preset-heading → p.lock-note | en1280 ms1280 zh1280 |
| 16 |  | h2#create-heading → div.step-lead#preflight-report | en1280 ms1280 zh1280 |
| 16 |  | h2#choose-heading → div.field.drop-zone#drop-zone | en375 ms375 zh375 |
| 28 | 36 | h2#system-check-summary → ul.checks#checks | en1280 |
| 28 | 35 | h2#statement-heading → div.statement-body | en1280 |


#### label→control — distinct box gaps: 0, 8

| box | ink | pair | where |
|---|---|---|---|
| 0 |  | label.label → input.range-input#trim-start-range | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 8 |  | label.label → input.text-input#trim-start | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 8 |  | label.label → input.text-input#trim-end | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 8 |  | label.label → select.select#closing-type | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 8 |  | label.label → select.select#closing-onset | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 8 |  | label.label → input.text-input#title-card-title | en1280 |
| 8 |  | label.label → input.text-input#title-card-department | en1280 |
| 8 |  | label.label → input.text-input#title-card-authors | en1280 |
| 8 |  | label.label → input.text-input#title-card-date | en1280 |


#### control→helper — distinct box gaps: 0, 8, 16

| box | ink | pair | where |
|---|---|---|---|
| 0 |  | p.helper.progress-text#process-progress-text → p.helper.progress-time-left#process-time-left | en1280 ms1280 zh1280 |
| 8 |  | span.segment-face → p.helper#video-kind-result | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 8 |  | span.segment-face → p.helper#video-language-helper | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 8 |  | input.file-input#file-input → p.helper.drop-hint#drop-hint | en1280 ms1280 zh1280 |
| 8 |  | input.file-input.file-input--chosen#file-input → p.helper.drop-hint#drop-hint | en1280 ms1280 zh1280 |
| 8 |  | div.field > div → p.helper#trim-format | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 8 |  | button.button.button--secondary#onset-help-button → p.helper#closing-onset-reason | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 8 |  | button.button → p.helper#create-note | en1280 ms1280 zh1280 |
| 8 |  | span.helper-line → p.helper#video-next | en1280 ms1280 zh1280 |
| 8 |  | progress.progress#process-progress → p.helper.progress-text#process-progress-text | en1280 ms1280 zh1280 |
| 8 |  | p.helper.progress-time-left#process-time-left → p.helper#process-job | en1280 ms1280 zh1280 |
| 8 |  | p.helper#process-job → p.helper#job-notice | en1280 ms1280 zh1280 |
| 8 |  | label.checkbox → p.helper#announce-help | en1280 ms1280 zh1280 |
| 8 |  | label.checkbox → p.helper#title-card-rule | en1280 |
| 8 |  | input.text-input#title-card-date → p.helper#title-card-date-helper | en1280 |
| 8 |  | p.field-error#trim-start-error → p.helper#trim-format | en1280 |
| 8 |  | button.button.button--secondary → p.helper#create-note | en375 ms375 zh375 |
| 16 |  | label.checkbox → p.helper#closing-none-reason | en1280 |


#### label→helper (field label to its helper) — distinct box gaps: 8, 16, 60, 110, 112, 131 · ink gaps: 24.5, 32.5, 65, 66, 115, 116, 117, 137

| box | ink | pair | where |
|---|---|---|---|
| 8 | 24.5 | label.checkbox → p.helper#announce-help | en1280 ms1280 zh1280 |
| 8 | 24.5 | label.checkbox → p.helper#title-card-rule | en1280 |
| 16 | 32.5 | label.checkbox → p.helper#closing-none-reason | en1280 |
| 60 | 66 | legend.label → p.helper#video-kind-result | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 60 | 66 | legend.label → p.helper#video-language-helper | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 60 | 65 | label.label → p.helper#trim-format | en1280 ms1280 zh1280 |
| 60 | 65 | label.label → p.helper#closing-onset-reason | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 60 | 65 | label.label → p.helper#title-card-date-helper | en1280 |
| 110 | 116 | legend.label → p.helper#video-next | en1280 zh1280 |
| 110 | 115 | label.label → p.helper#trim-format | en1280 |
| 112 | 117 | label.label → p.helper#trim-format | en375 ms375 zh375 |
| 131 | 137 | legend.label → p.helper#video-next | ms1280 |


#### panel→panel (main) — distinct box gaps: 16, 24, 32

| box | ink | pair | where |
|---|---|---|---|
| 16 |  | h1.page-title → div.lede | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 24 |  | section#step-choose.panel.step → section#step-trim.panel.step | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 24 |  | section#step-trim.panel.step → section#step-title.panel.step | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 24 |  | section#step-title.panel.step → section#step-closing.panel.step | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 24 |  | section#step-closing.panel.step → section#step-preset.panel.step | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 24 |  | section#step-preset.panel.step → section#step-create.panel.step | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 24 |  | section#language-notice.notification.language-notice → h1.page-title | ms1280 zh1280 ms375 zh375 |
| 32 |  | div.lede → fieldset#video-kind.segmented.video-kind | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 32 |  | fieldset#video-kind.segmented.video-kind → fieldset#video-language.segmented.video-language | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 32 |  | fieldset#video-language.segmented.video-language → section#step-choose.panel.step | en1280 ms1280 zh1280 en375 ms375 zh375 |


#### block→block (footer) — distinct box gaps: 16

| box | ink | pair | where |
|---|---|---|---|
| 16 |  | details#system-check.panel.system-check → details#accessibility-statement.panel.statement | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 16 |  | details#accessibility-statement.panel.statement → p.feedback-entry | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 16 |  | p.feedback-entry → p.feedback-form-entry | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 16 |  | p.feedback-form-entry → div.footer-contacts | en1280 ms1280 zh1280 en375 ms375 zh375 |
| 16 |  | div.footer-contacts → p#version-line.version | en1280 ms1280 zh1280 en375 ms375 zh375 |


## 5. Overflow

- before-1280-en-01-empty: no sideways scroll
- before-1280-en-02-ready: no sideways scroll
- before-1280-en-03-running: no sideways scroll
- before-1280-en-04-finished: no sideways scroll
- before-1280-en-05-title-card: no sideways scroll
- before-1280-en-06-trim-invalid: no sideways scroll
- before-1280-en-07-closing-none-disabled: no sideways scroll
- before-1280-en-08-system-check-open: no sideways scroll
- before-1280-en-09-statement-open: no sideways scroll
- before-1280-en-dark-01-empty: no sideways scroll
- before-1280-en-dark-02-ready: no sideways scroll
- before-1280-en-forced-01-empty: no sideways scroll
- before-1280-en-forced-02-ready: no sideways scroll
- before-1280-ms-01-empty: no sideways scroll
- before-1280-ms-02-ready: no sideways scroll
- before-1280-ms-03-running: no sideways scroll
- before-1280-ms-04-finished: no sideways scroll
- before-1280-zh-01-empty: no sideways scroll
- before-1280-zh-02-ready: no sideways scroll
- before-1280-zh-03-running: no sideways scroll
- before-1280-zh-04-finished: no sideways scroll
- before-375-en-01-empty: no sideways scroll
- before-375-en-02-ready: no sideways scroll
- before-375-en-03-running: no sideways scroll
- before-375-en-04-finished: no sideways scroll
- before-375-ms-01-empty: no sideways scroll
- before-375-ms-02-ready: no sideways scroll
- before-375-ms-03-running: no sideways scroll
- before-375-ms-04-finished: no sideways scroll
- before-375-zh-01-empty: no sideways scroll
- before-375-zh-02-ready: no sideways scroll
- before-375-zh-03-running: no sideways scroll
- before-375-zh-04-finished: no sideways scroll
