<!-- markdownlint-disable -->
# Pilot 2 — VH-171, 22 October 2026, record by record

Run `pilot2-2026-10-22T21-45-48-836Z-6c1737`, the plan `pilot2` in `walker/matrix.mjs`: S-03, S-15 and S-76
in every mode at 1280 px, S-03 and S-15 in every view and enlargement proxy,
S-76 enlarged, all three in Chinese, and K-dialog. 43 declared, 43 observed,
not whole: the three `fallback` records failed at setup. The manifest is
`pilot2-manifest-2026-10-22.json`. An earlier attempt was aborted when the
dev server stopped mid-run. The runner failed 27 records on "lang en,
expected en-GB" (Chrome's error page) rather than passing them.

| Record | overflow | ax | targets | contrastText | contrastExtra | measure | focus | motion | keys |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| K-dialog__en-GB__w1280__light | — | — | — | — | — | — | — | — | pass |
| S-03__en-GB__landscape__light | pass | pass | pass | pass | pass | pass | fail | — | — |
| S-03__en-GB__short__light | pass | pass | pass | pass | pass | pass | fail | — | — |
| S-03__en-GB__w1280__dark | pass | pass | pass | pass | pass | pass | fail | — | — |
| S-03__en-GB__w1280__fallback | failed: setup: timeout waiting for boot | | | | | | | | |
| S-03__en-GB__w1280__font32 | pass | pass | pass | pass | pass | pass | fail | — | — |
| S-03__en-GB__w1280__forced-dark | pass | pass | pass | pass | pass | pass | fail | — | — |
| S-03__en-GB__w1280__forced-light | pass | pass | pass | pass | pass | pass | fail | — | — |
| S-03__en-GB__w1280__light | pass | pass | pass | pass | pass | pass | fail | — | — |
| S-03__en-GB__w1280__reduced-motion | pass | pass | pass | pass | pass | pass | fail | pass | — |
| S-03__en-GB__w1280__spacing | pass | pass | pass | pass | pass | pass | fail | — | — |
| S-03__en-GB__w320__light | pass | pass | pass | pass | pass | pass | fail | — | — |
| S-03__en-GB__w375__light | pass | pass | pass | pass | pass | pass | fail | — | — |
| S-03__en-GB__zoom200proxy__light | pass | pass | pass | pass | pass | pass | fail | — | — |
| S-03__en-GB__zoom400proxy__light | pass | pass | pass | pass | pass | pass | fail | — | — |
| S-03__zh-Hans__w1280__light | pass | pass | pass | pass | pass | pass | fail | — | — |
| S-15__en-GB__landscape__light | pass | pass | cannot-determine | pass | pass | pass | cannot-determine | — | — |
| S-15__en-GB__short__light | pass | pass | cannot-determine | pass | pass | pass | cannot-determine | — | — |
| S-15__en-GB__w1280__dark | pass | pass | cannot-determine | pass | pass | pass | pass | — | — |
| S-15__en-GB__w1280__fallback | failed: setup: timeout waiting for boot | | | | | | | | |
| S-15__en-GB__w1280__font32 | pass | pass | cannot-determine | pass | pass | pass | fail | — | — |
| S-15__en-GB__w1280__forced-dark | pass | pass | cannot-determine | pass | pass | pass | pass | — | — |
| S-15__en-GB__w1280__forced-light | pass | pass | cannot-determine | pass | pass | pass | cannot-determine | — | — |
| S-15__en-GB__w1280__light | pass | pass | cannot-determine | pass | pass | pass | cannot-determine | — | — |
| S-15__en-GB__w1280__reduced-motion | pass | pass | cannot-determine | pass | pass | pass | cannot-determine | pass | — |
| S-15__en-GB__w1280__spacing | pass | pass | cannot-determine | pass | pass | pass | cannot-determine | — | — |
| S-15__en-GB__w320__light | pass | pass | cannot-determine | pass | pass | pass | cannot-determine | — | — |
| S-15__en-GB__w375__light | pass | pass | cannot-determine | pass | pass | pass | cannot-determine | — | — |
| S-15__en-GB__zoom200proxy__light | pass | pass | cannot-determine | pass | pass | pass | cannot-determine | — | — |
| S-15__en-GB__zoom400proxy__light | pass | pass | cannot-determine | pass | pass | pass | cannot-determine | — | — |
| S-15__zh-Hans__w1280__light | pass | pass | cannot-determine | pass | pass | pass | cannot-determine | — | — |
| S-76__en-GB__w1280__dark | pass | pass | pass | pass | fail | pass | pass | — | — |
| S-76__en-GB__w1280__fallback | failed: setup: timeout waiting for boot | | | | | | | | |
| S-76__en-GB__w1280__font32 | pass | pass | pass | pass | cannot-determine | pass | pass | — | — |
| S-76__en-GB__w1280__forced-dark | pass | pass | pass | pass | fail | pass | pass | — | — |
| S-76__en-GB__w1280__forced-light | pass | pass | pass | pass | fail | pass | pass | — | — |
| S-76__en-GB__w1280__light | pass | pass | pass | pass | fail | pass | pass | — | — |
| S-76__en-GB__w1280__reduced-motion | pass | pass | pass | pass | fail | pass | pass | pass | — |
| S-76__en-GB__w1280__spacing | pass | pass | pass | pass | fail | pass | pass | — | — |
| S-76__en-GB__w320__light | pass | pass | pass | pass | cannot-determine | pass | pass | — | — |
| S-76__en-GB__zoom200proxy__light | pass | pass | pass | pass | cannot-determine | pass | pass | — | — |
| S-76__en-GB__zoom400proxy__light | pass | pass | cannot-determine | pass | cannot-determine | pass | pass | — | — |
| S-76__zh-Hans__w1280__light | pass | pass | pass | pass | fail | pass | pass | — | — |

- S-03__en-GB__landscape__light — focus fail: #file-input 88 of 640 px²
- S-03__en-GB__short__light — focus fail: #file-input 88 of 640 px²
- S-03__en-GB__w1280__dark — focus fail: #file-input 88 of 640 px²
- S-03__en-GB__w1280__font32 — focus fail: #file-input 152 of 1240 px²
- S-03__en-GB__w1280__forced-dark — focus fail: #file-input 88 of 640 px²
- S-03__en-GB__w1280__forced-light — focus fail: #file-input 88 of 640 px²; #language-switcher input:checked 480 of 498 px²
- S-03__en-GB__w1280__light — focus fail: #file-input 88 of 640 px²
- S-03__en-GB__w1280__reduced-motion — focus fail: #file-input 88 of 640 px²
- S-03__en-GB__w1280__spacing — focus fail: #file-input 88 of 640 px²
- S-03__en-GB__w320__light — focus fail: #file-input 88 of 640 px²
- S-03__en-GB__w375__light — focus fail: #file-input 88 of 640 px²
- S-03__en-GB__zoom200proxy__light — focus fail: #file-input 88 of 640 px²
- S-03__en-GB__zoom400proxy__light — focus fail: #file-input 88 of 640 px²
- S-03__zh-Hans__w1280__light — focus fail: #file-input 88 of 640 px²
- S-15__en-GB__landscape__light — targets cannot-determine: input#trim-start-range.range-input[range] "Start" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's; input#trim-end-range.range-input[range] "End" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's
- S-15__en-GB__landscape__light — focus cannot-determine: #trim-start-range 250 of 264 px² (painted 157); #trim-end-range 250 of 264 px² (painted 157)
- S-15__en-GB__short__light — targets cannot-determine: input#trim-start-range.range-input[range] "Start" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's; input#trim-end-range.range-input[range] "End" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's
- S-15__en-GB__short__light — focus cannot-determine: #trim-start-range 248 of 264 px² (painted 157); #trim-end-range 248 of 264 px² (painted 157)
- S-15__en-GB__w1280__dark — targets cannot-determine: input#trim-start-range.range-input[range] "Start" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's; input#trim-end-range.range-input[range] "End" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's
- S-15__en-GB__w1280__font32 — targets cannot-determine: input#trim-start-range.range-input[range] "Start" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's; input#trim-end-range.range-input[range] "End" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's
- S-15__en-GB__w1280__font32 — focus fail: #trim-start-range 0 of 264 px² (painted 264); #trim-end-range 0 of 264 px² (painted 264)
- S-15__en-GB__w1280__forced-dark — targets cannot-determine: input#trim-start-range.range-input[range] "Start" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's; input#trim-end-range.range-input[range] "End" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's
- S-15__en-GB__w1280__forced-light — targets cannot-determine: input#trim-start-range.range-input[range] "Start" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's; input#trim-end-range.range-input[range] "End" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's
- S-15__en-GB__w1280__forced-light — focus cannot-determine: #trim-start-range 256 of 264 px² (painted 157); #trim-end-range 256 of 264 px² (painted 157)
- S-15__en-GB__w1280__light — targets cannot-determine: input#trim-start-range.range-input[range] "Start" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's; input#trim-end-range.range-input[range] "End" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's
- S-15__en-GB__w1280__light — focus cannot-determine: #trim-start-range 246 of 264 px² (painted 157); #trim-end-range 246 of 264 px² (painted 157)
- S-15__en-GB__w1280__reduced-motion — targets cannot-determine: input#trim-start-range.range-input[range] "Start" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's; input#trim-end-range.range-input[range] "End" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's
- S-15__en-GB__w1280__reduced-motion — focus cannot-determine: #trim-start-range 246 of 264 px² (painted 157); #trim-end-range 246 of 264 px² (painted 157)
- S-15__en-GB__w1280__spacing — targets cannot-determine: input#trim-start-range.range-input[range] "Start" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's; input#trim-end-range.range-input[range] "End" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's
- S-15__en-GB__w1280__spacing — focus cannot-determine: #trim-start-range 246 of 264 px² (painted 157); #trim-end-range 246 of 264 px² (painted 157)
- S-15__en-GB__w320__light — targets cannot-determine: input#trim-start-range.range-input[range] "Start" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's; input#trim-end-range.range-input[range] "End" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's
- S-15__en-GB__w320__light — focus cannot-determine: #trim-start-range 248 of 264 px² (painted 157); #trim-end-range 248 of 264 px² (painted 157)
- S-15__en-GB__w375__light — targets cannot-determine: input#trim-start-range.range-input[range] "Start" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's; input#trim-end-range.range-input[range] "End" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's
- S-15__en-GB__w375__light — focus cannot-determine: #trim-start-range 250 of 264 px² (painted 157); #trim-end-range 250 of 264 px² (painted 157)
- S-15__en-GB__zoom200proxy__light — targets cannot-determine: input#trim-start-range.range-input[range] "Start" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's; input#trim-end-range.range-input[range] "End" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's
- S-15__en-GB__zoom200proxy__light — focus cannot-determine: #trim-start-range 251 of 264 px² (painted 157); #trim-end-range 251 of 264 px² (painted 157)
- S-15__en-GB__zoom400proxy__light — targets cannot-determine: input#trim-start-range.range-input[range] "Start" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's; input#trim-end-range.range-input[range] "End" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's
- S-15__en-GB__zoom400proxy__light — focus cannot-determine: #trim-start-range 249 of 264 px² (painted 157); #trim-end-range 249 of 264 px² (painted 157)
- S-15__zh-Hans__w1280__light — targets cannot-determine: input#trim-start-range.range-input[range] "开始" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's; input#trim-end-range.range-input[range] "结尾" a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's
- S-15__zh-Hans__w1280__light — focus cannot-determine: #trim-start-range 248 of 264 px² (painted 157); #trim-end-range 248 of 264 px² (painted 157)
- S-76__en-GB__w1280__dark — contrastExtra fail: #file-input 3.47:1
- S-76__en-GB__w1280__font32 — contrastExtra cannot-determine: #file-input the button paints nothing to measure
- S-76__en-GB__w1280__forced-dark — contrastExtra fail: #file-input 2.14:1
- S-76__en-GB__w1280__forced-light — contrastExtra fail: #file-input 2.19:1
- S-76__en-GB__w1280__light — contrastExtra fail: #file-input 3.66:1
- S-76__en-GB__w1280__reduced-motion — contrastExtra fail: #file-input 3.66:1
- S-76__en-GB__w1280__spacing — contrastExtra fail: #file-input 3.66:1
- S-76__en-GB__w320__light — contrastExtra cannot-determine: #file-input the button paints nothing to measure
- S-76__en-GB__zoom200proxy__light — contrastExtra cannot-determine: #file-input the button paints nothing to measure
- S-76__en-GB__zoom400proxy__light — targets cannot-determine: textarea#feedback-message.textarea[textarea] "Your message" larger than the viewport or clipped
- S-76__en-GB__zoom400proxy__light — contrastExtra cannot-determine: #file-input the button paints nothing to measure
- S-76__zh-Hans__w1280__light — contrastExtra fail: #file-input 3.66:1
