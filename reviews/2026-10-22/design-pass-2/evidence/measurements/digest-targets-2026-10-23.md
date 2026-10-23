<!-- markdownlint-disable -->
# targets — VH-172's priority run (2026-10-23)

The clickable area of every control against 44 × 44 px (2.5.5), wrapped labels included; exempt rows (inline, disabled, off-page) kept with their reason.

Runs `priority-1-2026-10-23T12-47-49-793Z-0d4cac`, `priority-2-2026-10-23T13-16-30-886Z-48f1bc`, `priority-3-2026-10-23T13-56-31-192Z-b76894`, `priority-4-2026-10-23T14-33-32-479Z-b3e805`, `priority-part-2026-10-23T15-04-06-332Z-bbe3f1`. 691 records carry it, of 699 observed.

| | pass | fail | cannot determine | not applicable | exempt |
| --- | --- | --- | --- | --- | --- |
| records | 214 | 0 | 477 | 0 | — |
| rows | 19166 | 0 | 953 | 0 | 2053 |

Records by mode and by view (pass / fail / cannot determine / not applicable):

| mode | light 165 / 0 / 316 / 0 · dark 7 / 0 / 18 / 0 · forced-light 7 / 0 / 18 / 0 · forced-dark 7 / 0 / 18 / 0 · spacing 4 / 0 / 70 / 0 · reduced-motion 4 / 0 / 7 / 0 · fallback 10 / 0 / 15 / 0 · font32 10 / 0 / 15 / 0 |
| --- | --- |
| view | w1280 129 / 0 / 240 / 0 · w375 13 / 0 / 63 / 0 · w320 60 / 0 / 146 / 0 · landscape 3 / 0 / 6 / 0 · short 3 / 0 / 6 / 0 · zoom200proxy 3 / 0 / 8 / 0 · zoom400proxy 3 / 0 / 8 / 0 |
| language | en-GB 109 / 0 / 256 / 0 · zh-Hans 60 / 0 / 118 / 0 · ms-MY 45 / 0 / 103 / 0 |

Not passing: 7 groups, by subject and reason, failures first.

| subject | outcome | measurement | reason | records |
| --- | --- | --- | --- | --- |
| input#trim-start-range.range-input[range] "Start" | cannot-determine | hit 44 × 44 px | a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's | 255: S-04 en-GB w1280 light; S-08 en-GB w1280 light; S-14 en-GB w1280 light; S-15 en-GB w1280 light; S-16 en-GB w1280 light; S-17 en-GB w1280 light; +249 more |
| input#trim-end-range.range-input[range] "End" | cannot-determine | hit 44 × 44 px | a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's | 255: S-04 en-GB w1280 light; S-08 en-GB w1280 light; S-14 en-GB w1280 light; S-15 en-GB w1280 light; S-16 en-GB w1280 light; S-17 en-GB w1280 light; +249 more |
| input#trim-start-range.range-input[range] "开始" | cannot-determine | hit 44 × 44 px | a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's | 118: S-24 zh-Hans w1280 light; S-16 zh-Hans w1280 light; S-16 zh-Hans w375 light; S-16 zh-Hans w320 light; S-41 zh-Hans w1280 light; S-41 zh-Hans w375 light; +112 more |
| input#trim-end-range.range-input[range] "结尾" | cannot-determine | hit 44 × 44 px | a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's | 118: S-24 zh-Hans w1280 light; S-16 zh-Hans w1280 light; S-16 zh-Hans w375 light; S-16 zh-Hans w320 light; S-41 zh-Hans w1280 light; S-41 zh-Hans w375 light; +112 more |
| input#trim-start-range.range-input[range] "Mula" | cannot-determine | hit 44 × 44 px | a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's | 103: S-24 ms-MY w320 light; S-16 ms-MY w1280 light; S-16 ms-MY w375 light; S-16 ms-MY w320 light; S-41 ms-MY w1280 light; S-41 ms-MY w375 light; +97 more |
| input#trim-end-range.range-input[range] "Tamat" | cannot-determine | hit 44 × 44 px | a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's | 103: S-24 ms-MY w320 light; S-16 ms-MY w1280 light; S-16 ms-MY w375 light; S-16 ms-MY w320 light; S-41 ms-MY w1280 light; S-41 ms-MY w375 light; +97 more |
| textarea#feedback-message.textarea[textarea] "Your message" | cannot-determine | hit × px | larger than the viewport or clipped | 1: S-76 en-GB zoom400proxy light |

