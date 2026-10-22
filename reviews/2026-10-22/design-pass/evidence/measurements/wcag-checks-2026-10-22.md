<!-- markdownlint-disable -->

# WCAG 2.2 AAA checks — current page (VH-163, 2026-10-22)

Measured with `walker/wcag-checks.mjs` (walk.mjs's Walk and __audit helpers plus its own in-page instruments), headless Chrome 155, Vite dev build, staff video type, en-GB / zh-Hans / ms-MY, states empty → ready (lecture-60s read) → finished. Views: 1280×900 desktop; 375×812 mobile emulation (targets); 320×568 (reflow, walk.mjs `reflow320`); 640×450 at DPR 2 (what 200 % zoom of a 1280 window lays out as, walk.mjs `zoom200`). Re-run: `FIX=… OUT_ROOT=… EVIDENCE=… node wcag-checks.mjs` then `node wcag-checks.mjs --report <scratch>/wcag <this file>`.

## 1. 1.4.6 Contrast (enhanced) — PASS

1122 text-run measurements (light + dark, 3 languages × 3 states). Under target: **0** distinct element/colour pairs on enabled content; 0 more on disabled controls (exempt as inactive components). Band runs (header/footer blue): 216, lowest 10.32:1 (fieldset#language-switcher.segmented.language-switcher > legend.label). Lowest light: 7.42:1 (fieldset#video-kind.segmented.video-kind > legend.label); lowest dark: 7.6:1 (div.actions > button#trim-clear.button.button--secondary). Text over a background image or gradient: 0 runs (ratio taken against the colour behind it).

_none_


## 2. 2.5.5 Target size (enhanced) — PASS

516 target measurements at 1280 and 375. Under 44×44 (a radio or checkbox counts by its label box): **0** distinct non-exempt targets; 0 exempt (inline links in a sentence, or the browser's own video controls).

_none_


## 3. 1.4.10 Reflow (320) and 1.4.4 Resize text (640 = 200 % of 1280)

PASS — page sideways scroll or content outside the viewport in **0** of 27 view/state measurements. "Outside parent" lists boxes poking past their parent's border box by more than 1.5 px (often harmless: a ring, a -1 px seam, a native control).

| lang | state | view | h-scroll (scrollWidth/clientWidth) | outside viewport | outside parent | own sideways scroller |
|---|---|---|---|---|---|---|
| en | empty | reflow320 | no (320/320) |  |  |  |
| en | empty | zoom200 | no (640/640) |  |  |  |
| en | empty | 1280 | no (1280/1280) |  |  |  |
| en | ready | reflow320 | no (320/320) |  |  |  |
| en | ready | zoom200 | no (640/640) |  |  |  |
| en | ready | 1280 | no (1280/1280) |  |  |  |
| en | finished | reflow320 | no (320/320) |  |  |  |
| en | finished | zoom200 | no (640/640) |  |  |  |
| en | finished | 1280 | no (1280/1280) |  |  |  |
| ms | empty | reflow320 | no (320/320) |  |  |  |
| ms | empty | zoom200 | no (640/640) |  |  |  |
| ms | empty | 1280 | no (1280/1280) |  |  |  |
| ms | ready | reflow320 | no (320/320) |  |  |  |
| ms | ready | zoom200 | no (640/640) |  |  |  |
| ms | ready | 1280 | no (1280/1280) |  |  |  |
| ms | finished | reflow320 | no (320/320) |  |  |  |
| ms | finished | zoom200 | no (640/640) |  |  |  |
| ms | finished | 1280 | no (1280/1280) |  |  |  |
| zh | empty | reflow320 | no (320/320) |  |  |  |
| zh | empty | zoom200 | no (640/640) |  |  |  |
| zh | empty | 1280 | no (1280/1280) |  |  |  |
| zh | ready | reflow320 | no (320/320) |  |  |  |
| zh | ready | zoom200 | no (640/640) |  |  |  |
| zh | ready | 1280 | no (1280/1280) |  |  |  |
| zh | finished | reflow320 | no (320/320) |  |  |  |
| zh | finished | zoom200 | no (640/640) |  |  |  |
| zh | finished | 1280 | no (1280/1280) |  |  |  |


## 4. 1.4.12 Text spacing — PASS

walk.mjs's sheet injected as !important (line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em, p margin-bottom 2em). Clipped = a box with overflow other than visible whose content is larger than it, or a form control whose text is taller than it; overlap = glyph boxes of two unrelated elements intersecting by more than 2×2 px; spill = text taller than a visible-overflow box (not clipped, listed for review). Measurements with clipping or overlap: **0** of 18.

| lang | state | width | clipped | overlap | spill (review) |
|---|---|---|---|---|---|
| en | empty | 1280 | none | none |  |
| en | empty | 320 | none | none |  |
| en | ready | 1280 | none | none |  |
| en | ready | 320 | none | none |  |
| en | finished | 1280 | none | none |  |
| en | finished | 320 | none | none |  |
| ms | empty | 1280 | none | none |  |
| ms | empty | 320 | none | none |  |
| ms | ready | 1280 | none | none |  |
| ms | ready | 320 | none | none |  |
| ms | finished | 1280 | none | none |  |
| ms | finished | 320 | none | none |  |
| zh | empty | 1280 | none | none |  |
| zh | empty | 320 | none | none |  |
| zh | ready | 1280 | none | none |  |
| zh | ready | 320 | none | none |  |
| zh | finished | 1280 | none | none |  |
| zh | finished | 320 | none | none |  |


## 5. 2.4.13 Focus appearance / 2.4.12 Focus not obscured (enhanced) — en, 1280

PASS — stops with a problem: **0** of 111. Fixed or sticky elements on the page: none. In forced colours the contrast column is what Chrome computes before the user's palette, so it is listed but not judged.

Header Page language segment under forced colours: ring solid 2px +2 rgb(255, 255, 255) on rgb(16, 38, 59) (15.41:1), face segment-face — white, as --focus.

| state | theme | stop | ring on | style | colour | vs adjacent bg | vs inner | verdict |
|---|---|---|---|---|---|---|---|---|
| empty | light | a.skip-link "Skip to main content" | self | solid 2px +2 | rgb(16, 38, 59) | 14:1 on rgb(243, 244, 245) | 1:1 | ok |
| empty | light | input[radio language=en-GB] "English" | segment-face | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 1.08:1 | ok |
| empty | light | input[radio video-kind=staff] "Staff video" | segment-face | solid 2px +2 | rgb(16, 38, 59) | 14:1 on rgb(243, 244, 245) | 1:1 | ok |
| empty | light | input[radio video-language=en-GB] "English" | segment-face | solid 2px +2 | rgb(16, 38, 59) | 14:1 on rgb(243, 244, 245) | 1:1 | ok |
| empty | light | input#file-input.file-input[file] "1. Choose a video" | ::file-selector-button | solid 2px +2 | rgb(16, 38, 59) | 14.31:1 on rgb(250, 246, 239) | 14.31:1 | ok |
| empty | light | summary.disclosure-summary "System check — all passed" | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 13.34:1 | ok |
| empty | light | summary.disclosure-summary "Accessibility statement" | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 13.34:1 | ok |
| empty | light | button#feedback-open.button.button--secondary[button] "Send  | self | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 15.41:1 | ok |
| empty | light | a#feedback-form-link.footer-contact-link "Fill in the feedba | self | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 15.41:1 | ok |
| empty | light | a#contact-creators.footer-contact-link "Creators team on Tea | self | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 15.41:1 | ok |
| empty | light | a#contact-learning-content.footer-contact-link "Email the le | self | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 15.41:1 | ok |
| empty | dark | a.skip-link "Skip to main content" | self | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 1.08:1 | ok |
| empty | dark | input[radio language=en-GB] "English" | segment-face | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 1.08:1 | ok |
| empty | dark | input[radio video-kind=staff] "Staff video" | segment-face | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 1.08:1 | ok |
| empty | dark | input[radio video-language=en-GB] "English" | segment-face | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 1.08:1 | ok |
| empty | dark | input#file-input.file-input[file] "1. Choose a video" | ::file-selector-button | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 13.34:1 | ok |
| empty | dark | summary.disclosure-summary "System check — all passed" | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 13.34:1 | ok |
| empty | dark | summary.disclosure-summary "Accessibility statement" | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 13.34:1 | ok |
| empty | dark | button#feedback-open.button.button--secondary[button] "Send  | self | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 15.41:1 | ok |
| empty | dark | a#feedback-form-link.footer-contact-link "Fill in the feedba | self | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 15.41:1 | ok |
| empty | dark | a#contact-creators.footer-contact-link "Creators team on Tea | self | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 15.41:1 | ok |
| empty | dark | a#contact-learning-content.footer-contact-link "Email the le | self | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 15.41:1 | ok |
| empty | forced | a.skip-link "Skip to main content" | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| empty | forced | input[radio language=en-GB] "English" | segment-face | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 2.12:1 | ok |
| empty | forced | input[radio video-kind=staff] "Staff video" | segment-face | solid 2px +2 | rgb(255, 255, 255) | 21:1 on rgb(0, 0, 0) | 2.31:1 | ok |
| empty | forced | input[radio video-language=en-GB] "English" | segment-face | solid 2px +2 | rgb(255, 255, 255) | 21:1 on rgb(0, 0, 0) | 2.31:1 | ok |
| empty | forced | input#file-input.file-input[file] "1. Choose a video" | ::file-selector-button | solid 2px +2 | rgb(255, 255, 255) | 21:1 on rgb(0, 0, 0) | 21:1 | ok |
| empty | forced | summary.disclosure-summary "System check — all passed" | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| empty | forced | summary.disclosure-summary "Accessibility statement" | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| empty | forced | button#feedback-open.button.button--secondary[button] "Send  | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| empty | forced | a#feedback-form-link.footer-contact-link "Fill in the feedba | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| empty | forced | a#contact-creators.footer-contact-link "Creators team on Tea | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| empty | forced | a#contact-learning-content.footer-contact-link "Email the le | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| ready | light | a.skip-link "Skip to main content" | self | solid 2px +2 | rgb(16, 38, 59) | 14:1 on rgb(243, 244, 245) | 1:1 | ok |
| ready | light | input[radio language=en-GB] "English" | segment-face | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 1.08:1 | ok |
| ready | light | input[radio video-kind=staff] "Staff video" | segment-face | solid 2px +2 | rgb(16, 38, 59) | 14:1 on rgb(243, 244, 245) | 1:1 | ok |
| ready | light | input[radio video-language=en-GB] "English" | segment-face | solid 2px +2 | rgb(16, 38, 59) | 14:1 on rgb(243, 244, 245) | 1:1 | ok |
| ready | light | input#file-input.file-input.file-input--chosen[file] "1. Cho | ::file-selector-button | solid 2px +2 | rgb(16, 38, 59) | 14.31:1 on rgb(250, 246, 239) | 14.31:1 | ok |
| ready | light | summary.disclosure-summary "Video properties" | self | solid 2px +2 | rgb(16, 38, 59) | 14.31:1 on rgb(250, 246, 239) | 14.31:1 | ok |
| ready | light | video#trim-preview.trim-preview "" | self | solid 2px +2 | rgb(16, 38, 59) | 14.31:1 on rgb(250, 246, 239) | 1:1 | ok |
| ready | light | input#trim-start-range.range-input[range] "Start" | ::-webkit-slider-thumb (rule .range-input:focus-visible::-webkit-slider-thumb, 44px thumb) | solid 2px +-2 | rgb(16, 38, 59) | 14.31:1 on rgb(250, 246, 239) |  | ok |
| ready | light | input#trim-end-range.range-input[range] "End" | ::-webkit-slider-thumb (rule .range-input:focus-visible::-webkit-slider-thumb, 44px thumb) | solid 2px +-2 | rgb(16, 38, 59) | 14.31:1 on rgb(250, 246, 239) |  | ok |
| ready | light | input#trim-start.text-input[text] "Start time" | self | solid 2px +2 | rgb(16, 38, 59) | 14.31:1 on rgb(250, 246, 239) | 14:1 | ok |
| ready | light | button#trim-set-start.button.button--secondary[button] "Set  | self | solid 2px +2 | rgb(16, 38, 59) | 14.31:1 on rgb(250, 246, 239) | 14.31:1 | ok |
| ready | light | input#trim-end.text-input[text] "End time" | self | solid 2px +2 | rgb(16, 38, 59) | 14.31:1 on rgb(250, 246, 239) | 14:1 | ok |
| ready | light | button#trim-set-end.button.button--secondary[button] "Set en | self | solid 2px +2 | rgb(16, 38, 59) | 14.31:1 on rgb(250, 246, 239) | 14.31:1 | ok |
| ready | light | input#title-card-on[checkbox] "Add a title card" | self | solid 2px +2 | rgb(16, 38, 59) | 14.31:1 on rgb(250, 246, 239) | 14.31:1 | ok |
| ready | light | select#closing-type.select[select-one] "Animation type" | self | solid 2px +2 | rgb(16, 38, 59) | 14.31:1 on rgb(250, 246, 239) | 14:1 | ok |
| ready | light | button#onset-help-button.button.button--secondary.help-butto | self | solid 2px +2 | rgb(16, 38, 59) | 14.31:1 on rgb(250, 246, 239) | 14.31:1 | ok |
| ready | light | input[radio closing-colour=blue] "Blue" | segment-face | solid 2px +2 | rgb(16, 38, 59) | 14.31:1 on rgb(250, 246, 239) | 1:1 | ok |
| ready | light | input#closing-internal[checkbox] "Internal use only" | self | solid 2px +2 | rgb(16, 38, 59) | 14.31:1 on rgb(250, 246, 239) | 14.31:1 | ok |
| ready | light | input[radio preset=best] "Larger / better For EchoVideo or Y | self | solid 2px +2 | rgb(16, 38, 59) | 14.31:1 on rgb(250, 246, 239) | 14.31:1 | ok |
| ready | light | button.button[button] "Create the video" | self | solid 2px +2 | rgb(16, 38, 59) | 14.31:1 on rgb(250, 246, 239) | 1:1 | ok |
| ready | light | summary.disclosure-summary "System check — all passed" | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 13.34:1 | ok |
| ready | light | summary.disclosure-summary "Accessibility statement" | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 13.34:1 | ok |
| ready | light | button#feedback-open.button.button--secondary[button] "Send  | self | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 15.41:1 | ok |
| ready | light | a#feedback-form-link.footer-contact-link "Fill in the feedba | self | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 15.41:1 | ok |
| ready | light | a#contact-creators.footer-contact-link "Creators team on Tea | self | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 15.41:1 | ok |
| ready | light | a#contact-learning-content.footer-contact-link "Email the le | self | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 15.41:1 | ok |
| ready | dark | a.skip-link "Skip to main content" | self | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 1.08:1 | ok |
| ready | dark | input[radio language=en-GB] "English" | segment-face | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 1.08:1 | ok |
| ready | dark | input[radio video-kind=staff] "Staff video" | segment-face | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 1.08:1 | ok |
| ready | dark | input[radio video-language=en-GB] "English" | segment-face | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 1.08:1 | ok |
| ready | dark | input#file-input.file-input.file-input--chosen[file] "1. Cho | ::file-selector-button | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 13.34:1 | ok |
| ready | dark | summary.disclosure-summary "Video properties" | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 13.34:1 | ok |
| ready | dark | video#trim-preview.trim-preview "" | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 15.41:1 | ok |
| ready | dark | input#trim-start-range.range-input[range] "Start" | ::-webkit-slider-thumb (rule .range-input:focus-visible::-webkit-slider-thumb, 44px thumb) | solid 2px +-2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) |  | ok |
| ready | dark | input#trim-end-range.range-input[range] "End" | ::-webkit-slider-thumb (rule .range-input:focus-visible::-webkit-slider-thumb, 44px thumb) | solid 2px +-2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) |  | ok |
| ready | dark | input#trim-start.text-input[text] "Start time" | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 15.41:1 | ok |
| ready | dark | button#trim-set-start.button.button--secondary[button] "Set  | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 13.34:1 | ok |
| ready | dark | input#trim-end.text-input[text] "End time" | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 15.41:1 | ok |
| ready | dark | button#trim-set-end.button.button--secondary[button] "Set en | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 13.34:1 | ok |
| ready | dark | input#title-card-on[checkbox] "Add a title card" | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 13.34:1 | ok |
| ready | dark | select#closing-type.select[select-one] "Animation type" | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 15.41:1 | ok |
| ready | dark | button#onset-help-button.button.button--secondary.help-butto | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 13.34:1 | ok |
| ready | dark | input[radio closing-colour=blue] "Blue" | segment-face | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 1.08:1 | ok |
| ready | dark | input#closing-internal[checkbox] "Internal use only" | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 13.34:1 | ok |
| ready | dark | input[radio preset=best] "Larger / better For EchoVideo or Y | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 13.34:1 | ok |
| ready | dark | button.button[button] "Create the video" | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 1.08:1 | ok |
| ready | dark | summary.disclosure-summary "System check — all passed" | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 13.34:1 | ok |
| ready | dark | summary.disclosure-summary "Accessibility statement" | self | solid 2px +2 | rgb(255, 255, 255) | 13.34:1 on rgb(28, 49, 69) | 13.34:1 | ok |
| ready | dark | button#feedback-open.button.button--secondary[button] "Send  | self | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 15.41:1 | ok |
| ready | dark | a#feedback-form-link.footer-contact-link "Fill in the feedba | self | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 15.41:1 | ok |
| ready | dark | a#contact-creators.footer-contact-link "Creators team on Tea | self | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 15.41:1 | ok |
| ready | dark | a#contact-learning-content.footer-contact-link "Email the le | self | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 15.41:1 | ok |
| ready | forced | a.skip-link "Skip to main content" | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| ready | forced | input[radio language=en-GB] "English" | segment-face | solid 2px +2 | rgb(255, 255, 255) | 15.41:1 on rgb(16, 38, 59) | 2.12:1 | ok |
| ready | forced | input[radio video-kind=staff] "Staff video" | segment-face | solid 2px +2 | rgb(255, 255, 255) | 21:1 on rgb(0, 0, 0) | 2.31:1 | ok |
| ready | forced | input[radio video-language=en-GB] "English" | segment-face | solid 2px +2 | rgb(255, 255, 255) | 21:1 on rgb(0, 0, 0) | 2.31:1 | ok |
| ready | forced | input#file-input.file-input.file-input--chosen[file] "1. Cho | ::file-selector-button | solid 2px +2 | rgb(255, 255, 255) | 21:1 on rgb(0, 0, 0) | 21:1 | ok |
| ready | forced | summary.disclosure-summary "Video properties" | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| ready | forced | video#trim-preview.trim-preview "" | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| ready | forced | input#trim-start-range.range-input[range] "Start" | ::-webkit-slider-thumb (rule .range-input:focus-visible::-webkit-slider-thumb, 44px thumb) | solid 2px +-2 | rgb(255, 255, 255) | 21:1 on rgb(0, 0, 0) |  | ok |
| ready | forced | input#trim-end-range.range-input[range] "End" | ::-webkit-slider-thumb (rule .range-input:focus-visible::-webkit-slider-thumb, 44px thumb) | solid 2px +-2 | rgb(255, 255, 255) | 21:1 on rgb(0, 0, 0) |  | ok |
| ready | forced | input#trim-start.text-input[text] "Start time" | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| ready | forced | button#trim-set-start.button.button--secondary[button] "Set  | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| ready | forced | input#trim-end.text-input[text] "End time" | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| ready | forced | button#trim-set-end.button.button--secondary[button] "Set en | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| ready | forced | input#title-card-on[checkbox] "Add a title card" | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| ready | forced | select#closing-type.select[select-one] "Animation type" | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| ready | forced | button#onset-help-button.button.button--secondary.help-butto | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| ready | forced | input[radio closing-colour=blue] "Blue" | segment-face | solid 2px +2 | rgb(255, 255, 255) | 21:1 on rgb(0, 0, 0) | 2.31:1 | ok |
| ready | forced | input#closing-internal[checkbox] "Internal use only" | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| ready | forced | input[radio preset=best] "Larger / better For EchoVideo or Y | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| ready | forced | button.button[button] "Create the video" | self | solid 2px +2 | rgb(255, 255, 255) | 21:1 on rgb(0, 0, 0) | 2.31:1 | ok |
| ready | forced | summary.disclosure-summary "System check — all passed" | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| ready | forced | summary.disclosure-summary "Accessibility statement" | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| ready | forced | button#feedback-open.button.button--secondary[button] "Send  | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| ready | forced | a#feedback-form-link.footer-contact-link "Fill in the feedba | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| ready | forced | a#contact-creators.footer-contact-link "Creators team on Tea | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |
| ready | forced | a#contact-learning-content.footer-contact-link "Email the le | self | solid 2px +2 | rgba(26, 235, 255, 0.8) | 14.37:1 on rgb(0, 0, 0) | 14.37:1 | ok |


## 6. 1.4.8 Line length (1280, running text: p, li, dd, .helper, .notification-body)

Per rendered line, via a Range per character grouped by line. en/ms count characters with spaces; zh counts glyphs without spaces (lines that hold any CJK). Lines are de-duplicated across the three states. Limit: 80 characters, 40 CJK glyphs.

| lang | font px | lines | max | p95 | CJK lines in full-width equivalents (max / p95; Latin = ½) | over limit | longest line |
|---|---|---|---|---|---|---|---|
| en | 16 | 21 | 70 | 70 |  | 0 | p.step-intro "Optional. Cut unwanted material from the start or the end. L" |
| en | 14 | 21 | 73 | 68 |  | 0 | p.notification-body "It is not saved yet. It stays here until you start another v" |
| zh | 16 | 17 | 40 | 40 | 40 / 40 | 0 | p.step-intro "可选。您可以剪掉开头或结尾不需要的内容。如果不进行任何操作，则会保留整个视频。预" |
| zh | 14 | 19 | 46 | 46 | 40 / 40 | **1** (46 glyphs in p.notification-body) | p#version-line.version "v0.1.0 · v0.1.0+20261022.5e3de2b · development" |
| ms | 16 | 22 | 69 | 66 |  | 0 | p#browser-note "Alat ini direka bentuk dan dibina untuk Chrome, dan pelayar " |
| ms | 14 | 26 | 67 | 65 |  | 0 | p.notification-body "Dibuat daripada lecture-60s.mp4: keseluruhan video (1 minit)" |

## Notes (hand-written after the run)

- **Range thumbs (2.4.13).** The trim handles' ring is on `::-webkit-slider-thumb`, which `getComputedStyle` cannot read. The script takes it from the author rule (`app.css` `.range-input:focus-visible::-webkit-slider-thumb`: 2px solid `--focus`, offset −2px, inset on the 44px thumb), and screenshots in light, dark and forced colours (scratch `out/wcag-en-desktop/thumb-focus-*.png`) show a visible circle round the focused handle.
- **Forced-colours thumb rule is dropped by Chrome.** The forced-colours rule near `app.css:1653` lists `.range-input:focus-visible::-webkit-slider-thumb, .range-input:focus-visible::-moz-range-thumb` together. Chrome does not know `::-moz-range-thumb`, so it throws away the whole rule: the stylesheet Chrome loaded holds only the plain `::-webkit-slider-thumb` focus rule. Under forced colours the thumb ring therefore keeps `var(--focus)`, not `CanvasText`. With the emulated dark forced palette that renders white on black, so nothing fails here, but it is a latent bug. The plain rules at `app.css:1414` and `1419` are written separately and are fine.
- **1.4.8, zh 14px.** The one line over 40 is a notification body that holds a file name (`由 lecture-60s.mp4 构成：…`): 46 characters counted one for one, 40 when a Latin letter counts as half a CJK glyph.
- **No `wcag-*.png` failure screenshots.** No failure needed one.
