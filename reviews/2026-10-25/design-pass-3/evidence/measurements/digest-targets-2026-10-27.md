<!-- markdownlint-disable -->
# targets — VH-199's evidence run (2026-10-27)

The clickable area of every control against 44 × 44 px (2.5.5), wrapped labels included; exempt rows (inline, disabled, off-page) kept with their reason.

Runs `run-01-2026-10-26T12-20-53-837Z-5f97fb`, `run-02-2026-10-26T13-43-03-102Z-5e74aa`, `run-03-2026-10-26T17-08-32-217Z-c5fa9f`, `run-04-2026-10-26T17-47-08-808Z-d32f0f`, `run-05-2026-10-26T20-47-32-904Z-541edc`, `run-06-2026-10-27T00-08-59-773Z-753cf3`, `run-07-2026-10-27T01-23-38-939Z-41d41a`, `run-08-2026-10-27T02-49-02-205Z-c2d97d`, `run-09-2026-10-27T03-48-28-340Z-6d6b18`, `run-09-part-2026-10-27T05-04-47-007Z-e6d366`, `run-10-2026-10-27T05-45-03-929Z-0d1d37`, `run-11-part-2026-10-27T09-12-14-585Z-f0fb63`, `run-12-2026-10-27T09-45-16-049Z-a8fe58`, merged as `matrix-2026-10-27.md` says. 3183 records carry it, of 3207 observed.

| | pass | fail | cannot determine | not applicable | exempt |
| --- | --- | --- | --- | --- | --- |
| records | 976 | 0 | 2207 | 0 | — |
| rows | 93553 | 0 | 4429 | 0 | 7773 |

Records by mode, view and language (pass / fail / cannot determine / not applicable):

| mode | light 482 / 0 / 1015 / 0 · dark 84 / 0 / 205 / 0 · forced-light 84 / 0 / 205 / 0 · forced-dark 84 / 0 / 205 / 0 · spacing 97 / 0 / 226 / 0 · reduced-motion 20 / 0 / 50 / 0 · fallback 61 / 0 / 143 / 0 · font32 64 / 0 / 158 / 0 |
| --- | --- |
| view | w1280 514 / 0 / 1179 / 0 · w375 125 / 0 / 312 / 0 · w320 290 / 0 / 650 / 0 · landscape 7 / 0 / 9 / 0 · short 7 / 0 / 9 / 0 · zoom200proxy 15 / 0 / 17 / 0 · zoom400proxy 15 / 0 / 19 / 0 · w640 0 / 0 / 3 / 0 · w401 0 / 0 / 6 / 0 · w400 0 / 0 / 3 / 0 · w800 3 / 0 / 0 / 0 |
| language | en-GB 404 / 0 / 905 / 0 · zh-Hans 288 / 0 / 653 / 0 · ms-MY 284 / 0 / 649 / 0 |

The cannot-determine rows are declared person checks: the trim thumbs, the native player's controls, and the colour choice in forced palettes. The player's scrubber rows are exempt under the user agent's own size (2.5.5) and are kept with that reason.

## Beside Phase 7's after-run

On VH-176's 699 keys: 213 pass → pass, 477 cannot-determine → cannot-determine, and one pass → cannot-determine. That one is S-86 en-GB w1280 light, where both range thumbs are now drawn and are declared person checks. S-86 now reads a file and reloads, as VH-191's scenario row sets it ("The pick is made in step 3, so it needs a file read"). That is a scenario change, not an app change. Rows moved from exempt 2,053 / pass 19,166 / cannot-determine 953 to 1,929 / 19,645 / 955, a net 357 more rows. VH-176 kept only tallies, not its rows, so the change is attributed by subject, not row by row. On the same keys, Phase 8's new or changed subjects carry 4,158 rows: the format "?" 691 (new, VH-196), the player 184 (new, VH-192), the footer's "Help and feedback" group 1,747 (VH-182) and Video language 1,536 (moved, VH-191). VH-182 retired `#contact-learning-content` and the `mailto:` link, which takes rows away. Every Phase 8 subject's counted row passes.

## Not passing

18 groups, by subject and reason, failures first.

| subject | outcome | measurement | reason | records |
| --- | --- | --- | --- | --- |
| input#trim-start-range.range-input[range] "Start" | cannot-determine | hit 44 × 44 px | a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's | 904: S-08 en-GB w1280 light; S-14 en-GB w1280 light; S-17 en-GB w1280 light; S-19 en-GB w1280 light; S-22 en-GB w1280 light; S-26b en-GB w375 light; +898 more |
| input#trim-end-range.range-input[range] "End" | cannot-determine | hit 44–46 × 44 px | a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's | 904: S-08 en-GB w1280 light; S-14 en-GB w1280 light; S-17 en-GB w1280 light; S-19 en-GB w1280 light; S-22 en-GB w1280 light; S-26b en-GB w375 light; +898 more |
| input#trim-start-range.range-input[range] "开始" | cannot-determine | hit 44 × 44 px | a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's | 653: S-41 zh-Hans w1280 light; S-41 zh-Hans w375 light; S-41 zh-Hans w320 light; S-53 zh-Hans w1280 light; S-53 zh-Hans w375 light; S-53 zh-Hans w320 light; +647 more |
| input#trim-end-range.range-input[range] "结尾" | cannot-determine | hit 44–46 × 44 px | a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's | 653: S-41 zh-Hans w1280 light; S-41 zh-Hans w375 light; S-41 zh-Hans w320 light; S-53 zh-Hans w1280 light; S-53 zh-Hans w375 light; S-53 zh-Hans w320 light; +647 more |
| input#trim-start-range.range-input[range] "Mula" | cannot-determine | hit 44 × 44 px | a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's | 649: S-41 ms-MY w1280 light; S-41 ms-MY w375 light; S-41 ms-MY w320 light; S-53 ms-MY w1280 light; S-53 ms-MY w375 light; S-53 ms-MY w320 light; +643 more |
| input#trim-end-range.range-input[range] "Tamat" | cannot-determine | hit 44–46 × 44 px | a disc: its hit box is 44 x 44, no 44 px square fits inside; the reading is VH-173's | 649: S-41 ms-MY w1280 light; S-41 ms-MY w375 light; S-41 ms-MY w320 light; S-53 ms-MY w1280 light; S-53 ms-MY w375 light; S-53 ms-MY w320 light; +643 more |
| input[radio language=ms-MY] "Bahasa Malaysia" | cannot-determine | hit × px | larger than the viewport or clipped | 3: S-113 en-GB w320 font32; S-113 zh-Hans w320 font32; S-113 ms-MY w320 font32 |
| input[radio closing-colour=white] "White" | cannot-determine | hit × px | larger than the viewport or clipped | 2: S-113 en-GB w401 font32; S-113 en-GB w320 font32 |
| button#trim-set-start.button.button--secondary[button] "Teta | cannot-determine | hit × px | larger than the viewport or clipped | 2: S-113 ms-MY w401 font32; S-113 ms-MY w320 font32 |
| input[radio preset=smaller] "Fail lebih kecil, untuk tugasan | cannot-determine | hit × px | larger than the viewport or clipped | 2: S-113 ms-MY w401 font32; S-113 ms-MY w320 font32 |
| textarea#feedback-message.textarea[textarea] "Your message" | cannot-determine | hit × px | larger than the viewport or clipped | 1: S-76 en-GB zoom400proxy light |
| input[radio video-kind=submission] "Student submission" | cannot-determine | hit × px | larger than the viewport or clipped | 1: S-113 en-GB w320 font32 |
| input[radio video-language=ms-MY] "Bahasa Malaysia" | cannot-determine | hit × px | larger than the viewport or clipped | 1: S-113 en-GB w320 font32 |
| input[radio preset=best] "High quality, for publishing For E | cannot-determine | hit × px | larger than the viewport or clipped | 1: S-113 en-GB w320 font32 |
| input[radio preset=smaller] "Smaller file, for assignments a | cannot-determine | hit × px | larger than the viewport or clipped | 1: S-113 en-GB w320 font32 |
| input[radio preset=smaller] "较小的文件，用于作业和分享 适用于 Moodle 作业上传、电 | cannot-determine | hit × px | larger than the viewport or clipped | 1: S-113 zh-Hans w320 font32 |
| button#trim-set-end.button.button--secondary[button] "Tetapk | cannot-determine | hit × px | larger than the viewport or clipped | 1: S-113 ms-MY w320 font32 |
| input[radio preset=best] "Kualiti tinggi, untuk penerbitan U | cannot-determine | hit × px | larger than the viewport or clipped | 1: S-113 ms-MY w320 font32 |

