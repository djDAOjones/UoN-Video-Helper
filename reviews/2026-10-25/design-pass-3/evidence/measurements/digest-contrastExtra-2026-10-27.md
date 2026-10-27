<!-- markdownlint-disable -->
# contrastExtra — VH-199's evidence run (2026-10-27)

Contrast beyond text nodes: input values, placeholders, graphics, range paint, and the file button by glyph pixels (M-02).

Runs `run-01-2026-10-26T12-20-53-837Z-5f97fb`, `run-02-2026-10-26T13-43-03-102Z-5e74aa`, `run-03-2026-10-26T17-08-32-217Z-c5fa9f`, `run-04-2026-10-26T17-47-08-808Z-d32f0f`, `run-05-2026-10-26T20-47-32-904Z-541edc`, `run-06-2026-10-27T00-08-59-773Z-753cf3`, `run-07-2026-10-27T01-23-38-939Z-41d41a`, `run-08-2026-10-27T02-49-02-205Z-c2d97d`, `run-09-2026-10-27T03-48-28-340Z-6d6b18`, `run-09-part-2026-10-27T05-04-47-007Z-e6d366`, `run-10-2026-10-27T05-45-03-929Z-0d1d37`, `run-11-part-2026-10-27T09-12-14-585Z-f0fb63`, `run-12-2026-10-27T09-45-16-049Z-a8fe58`, merged as `matrix-2026-10-27.md` says. 3183 records carry it, of 3207 observed.

| | pass | fail | cannot determine | not applicable | exempt |
| --- | --- | --- | --- | --- | --- |
| records | 705 | 0 | 2478 | 0 | — |
| rows | 27290 | 0 | 4962 | 0 | 4073 |

Records by mode, view and language (pass / fail / cannot determine / not applicable):

| mode | light 331 / 0 / 1166 / 0 · dark 63 / 0 / 226 / 0 · forced-light 63 / 0 / 226 / 0 · forced-dark 63 / 0 / 226 / 0 · spacing 78 / 0 / 245 / 0 · reduced-motion 14 / 0 / 56 / 0 · fallback 45 / 0 / 159 / 0 · font32 48 / 0 / 174 / 0 |
| --- | --- |
| view | w1280 363 / 0 / 1330 / 0 · w375 98 / 0 / 339 / 0 · w320 213 / 0 / 727 / 0 · landscape 5 / 0 / 11 / 0 · short 5 / 0 / 11 / 0 · zoom200proxy 9 / 0 / 23 / 0 · zoom400proxy 9 / 0 / 25 / 0 · w640 0 / 0 / 3 / 0 · w401 0 / 0 / 6 / 0 · w400 0 / 0 / 3 / 0 · w800 3 / 0 / 0 / 0 |
| language | en-GB 286 / 0 / 1023 / 0 · zh-Hans 212 / 0 / 729 / 0 · ms-MY 207 / 0 / 726 / 0 |

The cannot-determine rows are the declared glyph-pixel and person checks: the trim thumbs and the forced palettes' system colours.

## Beside Phase 7's after-run

On VH-176's 699 keys: 179 pass → pass, 511 cannot-determine → cannot-determine, and one pass → cannot-determine. That one is S-86 en-GB w1280 light, the same two range thumbs as targets, after S-86's file read (a scenario change). Rows went from exempt 940 / pass 5,802 / cannot-determine 1,026 to 939 / 5,815 / 1,024: no Phase 8 subject class carries a row here, and the net change is 10 rows.

## Not passing

7 groups, by subject and reason, failures first.

| subject | outcome | measurement | reason | records |
| --- | --- | --- | --- | --- |
| input#trim-start-range.range-input[range] "Start" — range thumb and track | cannot-determine |  | painted pseudo-elements: non-text contrast needs a pixel reading (person check) | 1023: S-08 en-GB w1280 light; S-14 en-GB w1280 light; S-17 en-GB w1280 light; S-19 en-GB w1280 light; S-22 en-GB w1280 light; S-26b en-GB w375 light; +1017 more |
| input#trim-end-range.range-input[range] "End" — range thumb and track | cannot-determine |  | painted pseudo-elements: non-text contrast needs a pixel reading (person check) | 1023: S-08 en-GB w1280 light; S-14 en-GB w1280 light; S-17 en-GB w1280 light; S-19 en-GB w1280 light; S-22 en-GB w1280 light; S-26b en-GB w375 light; +1017 more |
| input#trim-start-range.range-input[range] "开始" — range thumb and track | cannot-determine |  | painted pseudo-elements: non-text contrast needs a pixel reading (person check) | 729: S-41 zh-Hans w1280 light; S-41 zh-Hans w375 light; S-41 zh-Hans w320 light; S-48 zh-Hans w1280 light; S-53 zh-Hans w1280 light; S-53 zh-Hans w375 light; +723 more |
| input#trim-end-range.range-input[range] "结尾" — range thumb and track | cannot-determine |  | painted pseudo-elements: non-text contrast needs a pixel reading (person check) | 729: S-41 zh-Hans w1280 light; S-41 zh-Hans w375 light; S-41 zh-Hans w320 light; S-48 zh-Hans w1280 light; S-53 zh-Hans w1280 light; S-53 zh-Hans w375 light; +723 more |
| input#trim-start-range.range-input[range] "Mula" — range thumb and track | cannot-determine |  | painted pseudo-elements: non-text contrast needs a pixel reading (person check) | 726: S-41 ms-MY w1280 light; S-41 ms-MY w375 light; S-41 ms-MY w320 light; S-48 ms-MY w320 light; S-53 ms-MY w1280 light; S-53 ms-MY w375 light; +720 more |
| input#trim-end-range.range-input[range] "Tamat" — range thumb and track | cannot-determine |  | painted pseudo-elements: non-text contrast needs a pixel reading (person check) | 726: S-41 ms-MY w1280 light; S-41 ms-MY w375 light; S-41 ms-MY w320 light; S-48 ms-MY w320 light; S-53 ms-MY w1280 light; S-53 ms-MY w375 light; +720 more |
| #file-input — file button text (pixels) | cannot-determine | 14.3079:1, need 4.5 | changed pixels lie outside the button's content box: not glyphs alone | 6: S-113 en-GB w401 font32; S-113 en-GB w320 font32; S-113 zh-Hans w401 font32; S-113 zh-Hans w320 font32; S-113 ms-MY w401 font32; S-113 ms-MY w320 font32 |

