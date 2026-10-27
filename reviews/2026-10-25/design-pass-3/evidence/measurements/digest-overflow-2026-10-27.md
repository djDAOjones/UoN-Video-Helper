<!-- markdownlint-disable -->
# overflow — VH-199's evidence run (2026-10-27)

Document width, offenders carrying text or a control, text clipped by an ancestor and text spilling from a set height (M-04).

Runs `run-01-2026-10-26T12-20-53-837Z-5f97fb`, `run-02-2026-10-26T13-43-03-102Z-5e74aa`, `run-03-2026-10-26T17-08-32-217Z-c5fa9f`, `run-04-2026-10-26T17-47-08-808Z-d32f0f`, `run-05-2026-10-26T20-47-32-904Z-541edc`, `run-06-2026-10-27T00-08-59-773Z-753cf3`, `run-07-2026-10-27T01-23-38-939Z-41d41a`, `run-08-2026-10-27T02-49-02-205Z-c2d97d`, `run-09-2026-10-27T03-48-28-340Z-6d6b18`, `run-09-part-2026-10-27T05-04-47-007Z-e6d366`, `run-10-2026-10-27T05-45-03-929Z-0d1d37`, `run-11-part-2026-10-27T09-12-14-585Z-f0fb63`, `run-12-2026-10-27T09-45-16-049Z-a8fe58`, merged as `matrix-2026-10-27.md` says. 3183 records carry it, of 3207 observed.

| | pass | fail | cannot determine | not applicable | exempt |
| --- | --- | --- | --- | --- | --- |
| records | 3177 | 6 | 0 | 0 | — |
| rows | 0 | 0 | 0 | 0 | 0 |

Records by mode, view and language (pass / fail / cannot determine / not applicable):

| mode | light 1497 / 0 / 0 / 0 · dark 289 / 0 / 0 / 0 · forced-light 289 / 0 / 0 / 0 · forced-dark 289 / 0 / 0 / 0 · spacing 323 / 0 / 0 / 0 · reduced-motion 70 / 0 / 0 / 0 · fallback 204 / 0 / 0 / 0 · font32 216 / 6 / 0 / 0 |
| --- | --- |
| view | w1280 1693 / 0 / 0 / 0 · w375 437 / 0 / 0 / 0 · w320 937 / 3 / 0 / 0 · landscape 16 / 0 / 0 / 0 · short 16 / 0 / 0 / 0 · zoom200proxy 32 / 0 / 0 / 0 · zoom400proxy 34 / 0 / 0 / 0 · w640 3 / 0 / 0 / 0 · w401 3 / 3 / 0 / 0 · w400 3 / 0 / 0 / 0 · w800 3 / 0 / 0 / 0 |
| language | en-GB 1307 / 2 / 0 / 0 · zh-Hans 939 / 2 / 0 / 0 · ms-MY 931 / 2 / 0 / 0 |

All six failing records are S-113, a new scenario, at the 32 px font: w320 and w401 in all three languages scroll sideways to 444–528 px. The offenders are controls: the language and video-kind radios, the closing colour "White" and the trim's Set buttons. This is an app finding for VH-200 (hand-overs 9 and 11), not an instrument fault.

## Beside Phase 7's after-run

On VH-176's 699 keys, all 691 measured records pass in both runs (the other 8 are route records, which carry no overflow). There is no change. S-113 has no Phase 7 counterpart.

## Not passing

5 groups, by subject and reason, failures first.

| subject | outcome | measurement | reason | records |
| --- | --- | --- | --- | --- |
| the page | fail |  | scrolls to 520 of 320; offender input[radio language=ms-MY] "Bahasa Mala [47..337]; offender input[radio video-kind=submission] "Stud [47..3 | 2: S-113 en-GB w320 font32; S-113 ms-MY w320 font32 |
| the page | fail |  | scrolls to 520 of 401; offender input[radio closing-colour=white] "White [304..520]; offender span "White" [416..487] | 1: S-113 en-GB w401 font32 |
| the page | fail |  | scrolls to 444 of 401; offender input[radio closing-colour=white] "白色的" [271..444]; offender span "白色的" [383..411] | 1: S-113 zh-Hans w401 font32 |
| the page | fail |  | scrolls to 444 of 320; offender input[radio language=ms-MY] "Bahasa Mala [47..337]; offender button#trim-set-start.button.button--sec [97..3 | 1: S-113 zh-Hans w320 font32 |
| the page | fail |  | scrolls to 528 of 401; offender button#trim-set-start.button.button--sec [97..528]; offender button#trim-set-end.button.button--secon [97..4 | 1: S-113 ms-MY w401 font32 |

