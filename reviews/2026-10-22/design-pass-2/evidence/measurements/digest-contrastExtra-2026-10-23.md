<!-- markdownlint-disable -->
# contrastExtra — VH-172's priority run (2026-10-23)

Contrast beyond text nodes: input values, placeholders, graphics, range paint, and the file button by glyph pixels (M-02).

Runs `priority-1-2026-10-23T12-47-49-793Z-0d4cac`, `priority-2-2026-10-23T13-16-30-886Z-48f1bc`, `priority-3-2026-10-23T13-56-31-192Z-b76894`, `priority-4-2026-10-23T14-33-32-479Z-b3e805`, `priority-part-2026-10-23T15-04-06-332Z-bbe3f1`. 691 records carry it, of 699 observed.

| | pass | fail | cannot determine | not applicable | exempt |
| --- | --- | --- | --- | --- | --- |
| records | 174 | 0 | 517 | 0 | — |
| rows | 5562 | 0 | 1267 | 0 | 939 |

Records by mode and by view (pass / fail / cannot determine / not applicable):

| mode | light 132 / 0 / 349 / 0 · dark 6 / 0 / 19 / 0 · forced-light 6 / 0 / 19 / 0 · forced-dark 6 / 0 / 19 / 0 · spacing 3 / 0 / 71 / 0 · reduced-motion 3 / 0 / 8 / 0 · fallback 9 / 0 / 16 / 0 · font32 9 / 0 / 16 / 0 |
| --- | --- |
| view | w1280 100 / 0 / 269 / 0 · w375 13 / 0 / 63 / 0 · w320 49 / 0 / 157 / 0 · landscape 3 / 0 / 6 / 0 · short 3 / 0 / 6 / 0 · zoom200proxy 3 / 0 / 8 / 0 · zoom400proxy 3 / 0 / 8 / 0 |
| language | en-GB 83 / 0 / 282 / 0 · zh-Hans 53 / 0 / 125 / 0 · ms-MY 38 / 0 / 110 / 0 |

Instrument fault, fixed between parts: a setup's last click could leave the file button painted hovered, so every pixel of it changed when its text went transparent and the glyph reading was "cannot determine" ("outside the content box"). `fileButtonInk` now moves the mouse off first (qualify.mjs). Parts 1 to 3 ran before the fix; S-53 and S-07 were measured again in every cell (`priority-part`, 32 records, all pass: 14.31:1 chosen, 15.41:1 unchosen, 12.38:1 dark, 21:1 forced); the 245 records left "cannot determine" below are that fault, never a pass, and a later run fills them.

Not passing: 7 groups, by subject and reason, failures first.

| subject | outcome | measurement | reason | records |
| --- | --- | --- | --- | --- |
| input#trim-start-range.range-input[range] "Start" — range thumb and track | cannot-determine |  | painted pseudo-elements: non-text contrast needs a pixel reading (person check) | 280: S-04 en-GB w1280 light; S-08 en-GB w1280 light; S-11 en-GB w1280 light; S-14 en-GB w1280 light; S-15 en-GB w1280 light; S-16 en-GB w1280 light; +274 more |
| input#trim-end-range.range-input[range] "End" — range thumb and track | cannot-determine |  | painted pseudo-elements: non-text contrast needs a pixel reading (person check) | 280: S-04 en-GB w1280 light; S-08 en-GB w1280 light; S-11 en-GB w1280 light; S-14 en-GB w1280 light; S-15 en-GB w1280 light; S-16 en-GB w1280 light; +274 more |
| #file-input — file button text (pixels) | cannot-determine | 12.2717–21:1, need 4.5–7 | changed pixels lie outside the button's content box: not glyphs alone | 245: S-08 en-GB w1280 light; S-16 en-GB w1280 light; S-17 en-GB w1280 light; S-25b en-GB w1280 light; S-30 en-GB w1280 light; S-33 en-GB w1280 light; +239 more |
| input#trim-start-range.range-input[range] "开始" — range thumb and track | cannot-determine |  | painted pseudo-elements: non-text contrast needs a pixel reading (person check) | 123: S-24 zh-Hans w1280 light; S-16 zh-Hans w1280 light; S-16 zh-Hans w375 light; S-16 zh-Hans w320 light; S-41 zh-Hans w1280 light; S-41 zh-Hans w375 light; +117 more |
| input#trim-end-range.range-input[range] "结尾" — range thumb and track | cannot-determine |  | painted pseudo-elements: non-text contrast needs a pixel reading (person check) | 123: S-24 zh-Hans w1280 light; S-16 zh-Hans w1280 light; S-16 zh-Hans w375 light; S-16 zh-Hans w320 light; S-41 zh-Hans w1280 light; S-41 zh-Hans w375 light; +117 more |
| input#trim-start-range.range-input[range] "Mula" — range thumb and track | cannot-determine |  | painted pseudo-elements: non-text contrast needs a pixel reading (person check) | 108: S-24 ms-MY w320 light; S-16 ms-MY w1280 light; S-16 ms-MY w375 light; S-16 ms-MY w320 light; S-41 ms-MY w1280 light; S-41 ms-MY w375 light; +102 more |
| input#trim-end-range.range-input[range] "Tamat" — range thumb and track | cannot-determine |  | painted pseudo-elements: non-text contrast needs a pixel reading (person check) | 108: S-24 ms-MY w320 light; S-16 ms-MY w1280 light; S-16 ms-MY w375 light; S-16 ms-MY w320 light; S-41 ms-MY w1280 light; S-41 ms-MY w375 light; +102 more |

