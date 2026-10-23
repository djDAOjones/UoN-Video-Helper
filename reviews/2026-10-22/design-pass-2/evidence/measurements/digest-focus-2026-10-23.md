<!-- markdownlint-disable -->
# focus — VH-172's priority run (2026-10-23)

Rendered focus: the area changing by 3:1 between focused and unfocused pixels against a 2 px perimeter of the control or its painted sub-component (2.4.13).

Runs `priority-1-2026-10-23T12-47-49-793Z-0d4cac`, `priority-2-2026-10-23T13-16-30-886Z-48f1bc`, `priority-3-2026-10-23T13-56-31-192Z-b76894`, `priority-4-2026-10-23T14-33-32-479Z-b3e805`, `priority-part-2026-10-23T15-04-06-332Z-bbe3f1`. 691 records carry it, of 699 observed.

| | pass | fail | cannot determine | not applicable | exempt |
| --- | --- | --- | --- | --- | --- |
| records | 559 | 112 | 20 | 0 | — |
| rows | 1221 | 116 | 30 | 0 | 0 |

Records by mode and by view (pass / fail / cannot determine / not applicable):

| mode | light 398 / 69 / 14 / 0 · dark 19 / 5 / 1 / 0 · forced-light 18 / 5 / 2 / 0 · forced-dark 19 / 5 / 1 / 0 · spacing 54 / 20 / 0 / 0 · reduced-motion 9 / 2 / 0 / 0 · fallback 21 / 2 / 2 / 0 · font32 21 / 4 / 0 / 0 |
| --- | --- |
| view | w1280 306 / 50 / 13 / 0 · w375 57 / 18 / 1 / 0 · w320 164 / 36 / 6 / 0 · landscape 7 / 2 / 0 / 0 · short 7 / 2 / 0 / 0 · zoom200proxy 9 / 2 / 0 / 0 · zoom400proxy 9 / 2 / 0 / 0 |
| language | en-GB 298 / 56 / 11 / 0 · zh-Hans 143 / 30 / 5 / 0 · ms-MY 118 / 26 / 4 / 0 |

The file button's ring is read against its painted button (VH-171); the range thumbs against their 44 px box and painted disc, "cannot determine" where the two disagree.

Not passing: 8 groups, by subject and reason, failures first.

| subject | outcome | measurement | reason | records |
| --- | --- | --- | --- | --- |
| #file-input (file-button) | fail | 88–152 px² at 3:1 of 640–1240 |  | 110: S-03 en-GB w1280 light; S-09 en-GB w1280 light; S-10 en-GB w1280 light; S-28 en-GB w1280 light; S-29 en-GB w1280 light; S-30 en-GB w1280 light; +104 more |
| #language-switcher input:checked | fail | 416–480 px² at 3:1 of 498–520 |  | 2: S-03 en-GB w1280 forced-light; S-03 zh-Hans w1280 forced-light |
| #trim-start-range (thumb) | fail | 0 px² at 3:1 of 264 |  | 2: S-15 en-GB w1280 font32; S-15 zh-Hans w1280 font32 |
| #trim-end-range (thumb) | fail | 0 px² at 3:1 of 270 |  | 2: S-15 en-GB w1280 font32; S-15 zh-Hans w1280 font32 |
| #trim-start-range (thumb) | cannot-determine | 246–256 px² at 3:1 of 264 | passes against the painted disc, fails against the 44 px circular reference: the reading is VH-173's | 10: S-15 en-GB w1280 light; S-15 en-GB w320 light; S-15 zh-Hans w1280 light; S-15 zh-Hans w320 light; S-15 ms-MY w1280 light; S-15 ms-MY w320 light; +4 more |
| #trim-end-range (thumb) | cannot-determine | 246–256 px² at 3:1 of 270 | passes against the painted disc, fails against the 44 px circular reference: the reading is VH-173's | 10: S-15 en-GB w1280 light; S-15 en-GB w320 light; S-15 zh-Hans w1280 light; S-15 zh-Hans w320 light; S-15 ms-MY w1280 light; S-15 ms-MY w320 light; +4 more |
| #process-result > .notification[data-kind="success"] .actions > button.button | cannot-determine | px² at 3:1 of | focus did not land on the control | 9: S-62 en-GB w1280 light; S-62 en-GB w320 light; S-62 zh-Hans w1280 light; S-62 zh-Hans w320 light; S-62 ms-MY w1280 light; S-62 ms-MY w320 light; +3 more |
| #trim-clear | cannot-determine | px² at 3:1 of | focus did not land on the control | 1: S-21 en-GB w1280 light |

