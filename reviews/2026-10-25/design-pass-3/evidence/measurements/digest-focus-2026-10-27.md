<!-- markdownlint-disable -->
# focus — VH-199's evidence run (2026-10-27)

Rendered focus: the area changing by 3:1 between focused and unfocused pixels against a 2 px perimeter of the control or its painted sub-component (2.4.13).

Runs `run-01-2026-10-26T12-20-53-837Z-5f97fb`, `run-02-2026-10-26T13-43-03-102Z-5e74aa`, `run-03-2026-10-26T17-08-32-217Z-c5fa9f`, `run-04-2026-10-26T17-47-08-808Z-d32f0f`, `run-05-2026-10-26T20-47-32-904Z-541edc`, `run-06-2026-10-27T00-08-59-773Z-753cf3`, `run-07-2026-10-27T01-23-38-939Z-41d41a`, `run-08-2026-10-27T02-49-02-205Z-c2d97d`, `run-09-2026-10-27T03-48-28-340Z-6d6b18`, `run-09-part-2026-10-27T05-04-47-007Z-e6d366`, `run-10-2026-10-27T05-45-03-929Z-0d1d37`, `run-11-part-2026-10-27T09-12-14-585Z-f0fb63`, `run-12-2026-10-27T09-45-16-049Z-a8fe58`, merged as `matrix-2026-10-27.md` says. 3183 records carry it, of 3207 observed.

| | pass | fail | cannot determine | not applicable | exempt |
| --- | --- | --- | --- | --- | --- |
| records | 3080 | 30 | 73 | 0 | — |
| rows | 5501 | 30 | 122 | 0 | 0 |

Records by mode, view and language (pass / fail / cannot determine / not applicable):

| mode | light 1447 / 5 / 45 / 0 · dark 287 / 1 / 1 / 0 · forced-light 275 / 5 / 9 / 0 · forced-dark 283 / 5 / 1 / 0 · spacing 317 / 0 / 6 / 0 · reduced-motion 67 / 1 / 2 / 0 · fallback 197 / 1 / 6 / 0 · font32 207 / 12 / 3 / 0 |
| --- | --- |
| view | w1280 1633 / 22 / 38 / 0 · w375 425 / 0 / 12 / 0 · w320 912 / 5 / 23 / 0 · landscape 15 / 1 / 0 / 0 · short 15 / 1 / 0 / 0 · zoom200proxy 31 / 1 / 0 / 0 · zoom400proxy 34 / 0 / 0 / 0 · w640 3 / 0 / 0 / 0 · w401 6 / 0 / 0 / 0 · w400 3 / 0 / 0 / 0 · w800 3 / 0 / 0 / 0 |
| language | en-GB 1260 / 18 / 31 / 0 · zh-Hans 917 / 3 / 21 / 0 · ms-MY 903 / 9 / 21 / 0 |

Thirty records fail, in four groups. (1) S-81's `#accessibility-statement a` ×11. (2) The 32 px ring on `#preset-choice input:checked`, 284 of 304 px² ×10 (S-15 ×3, S-24, S-108 ×3 and S-110 ×3, all at font32). (3) `#contact-creators` ×8 in forced palettes, where the link wraps (`matrix-2026-10-27.md`, "Seen for VH-200"). (4) `#onset-help-button` ×1, 460 of 464 at S-113 ms-MY w320 font32. In the cannot-determine rows, the trim thumbs read VH-173's way (they pass against the painted disc and fail against the 44 px circle). S-62's and S-21's rows are "focus did not land on the control": S-21 targets a disabled control, an applicability note on the walker-change wish line. S-140's are "no element".

## Beside Phase 7's after-run

On VH-176's 699 keys: 657 pass → pass, 20 cannot-determine → cannot-determine, 12 pass → fail and 2 cannot-determine → fail. **S-81 `#accessibility-statement a` ×11:** en-GB w1280 in every mode but spacing, plus landscape, short height, the 200% proxy and ms-MY w1280 light; zh-Hans does not fail. It reads 1,361 of 1,865 px² (2,644 of 3,754 at font32). The link's box is now 429 × 41 px, so it wraps onto two lines: changedAny 1,363 is all that is drawn, and bestRatio is 13.34. The likely cause is VH-182's longer contact line and address ("…email the learning content team at UI-Learning-Content@nottingham.ac.uk"), which wraps the link where Phase 7's line did not. It is the same wrapped-link geometry as `#contact-creators`. The contract table settles the item verdict (`contract-2026-10-27.md`). **The 32 px ring, ×3 on these keys** (S-24 en-GB, S-15 en-GB and zh-Hans, all w1280 font32), on `#preset-choice input:checked`, 284 of 304 px²: VH-176 read these as passing or cannot-determine. The candidates are the 2.4.13 revision VH-198 made (ring pixels counted at 3:1 against unfocused) and VH-188's step 5 at 32 px. That is attribution unresolved here, and VH-200 attributes it blind. Rows went from pass 1,333 / cannot-determine 34 to 1,309 / fail 14 / cannot-determine 34. Phase 8's footer group (26 rows) and Video language (3) pass.

## Not passing

9 groups, by subject and reason, failures first.

| subject | outcome | measurement | reason | records |
| --- | --- | --- | --- | --- |
| #accessibility-statement a | fail | 1360–2644 px² at 3:1 of 1571–3754 |  | 11: S-81 en-GB w1280 light; S-81 ms-MY w1280 light; S-81 en-GB w1280 dark; S-81 en-GB w1280 forced-light; S-81 en-GB w1280 forced-dark; S-81 en-GB w1280 reduced-motion; +5 more |
| #preset-choice input:checked | fail | 284 px² at 3:1 of 304 |  | 10: S-24 en-GB w1280 font32; S-15 en-GB w1280 font32; S-15 zh-Hans w1280 font32; S-15 ms-MY w1280 font32; S-110 en-GB w1280 font32; S-110 zh-Hans w1280 font32; +4 more |
| #contact-creators | fail | 1108–1595 px² at 3:1 of 1264–1968 |  | 8: S-83 ms-MY w1280 forced-light; S-83 ms-MY w1280 forced-dark; S-83 en-GB w320 forced-light; S-83 en-GB w320 forced-dark; S-145 ms-MY w1280 forced-light; S-145 ms-MY w1280 forced-dark; +2 more |
| #onset-help-button | fail | 460 px² at 3:1 of 464 |  | 1: S-113 ms-MY w320 font32 |
| #trim-start-range (thumb) | cannot-determine | 230–256 px² at 3:1 of 264 | passes against the painted disc, fails against the 44 px circular reference: the reading is VH-173's | 53: S-15 en-GB w1280 light; S-15 en-GB w320 light; S-15 zh-Hans w1280 light; S-15 zh-Hans w320 light; S-15 ms-MY w1280 light; S-15 ms-MY w320 light; +47 more |
| #trim-end-range (thumb) | cannot-determine | 230–256 px² at 3:1 of 270 | passes against the painted disc, fails against the 44 px circular reference: the reading is VH-173's | 46: S-15 en-GB w1280 light; S-15 en-GB w320 light; S-15 zh-Hans w1280 light; S-15 zh-Hans w320 light; S-15 ms-MY w1280 light; S-15 ms-MY w320 light; +40 more |
| #process-result > .notification[data-kind="success"] .actions > button.button | cannot-determine | px² at 3:1 of | focus did not land on the control | 12: S-62 en-GB w1280 light; S-62 en-GB w320 light; S-62 zh-Hans w1280 light; S-62 zh-Hans w320 light; S-62 ms-MY w1280 light; S-62 ms-MY w320 light; +6 more |
| #trim-clear | cannot-determine | px² at 3:1 of | focus did not land on the control | 9: S-21 en-GB w1280 light; S-21 en-GB w375 light; S-21 en-GB w320 light; S-21 zh-Hans w1280 light; S-21 zh-Hans w375 light; S-21 zh-Hans w320 light; +3 more |
| #process-result > .notification | cannot-determine | px² at 3:1 of | no element | 2: S-140 en-GB w1280 light; S-140n en-GB w1280 light |

