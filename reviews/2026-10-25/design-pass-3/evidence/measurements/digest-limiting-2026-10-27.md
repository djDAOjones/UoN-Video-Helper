<!-- markdownlint-disable -->
# limiting — VH-199's evidence run (2026-10-27)

VH-198's: the heavy-limiting warning (VH-193): where it shows, its words and place among the warnings, the spoken completion line, and that it blocks nothing; not applicable where no result stands.

Runs `run-01-2026-10-26T12-20-53-837Z-5f97fb`, `run-02-2026-10-26T13-43-03-102Z-5e74aa`, `run-03-2026-10-26T17-08-32-217Z-c5fa9f`, `run-04-2026-10-26T17-47-08-808Z-d32f0f`, `run-05-2026-10-26T20-47-32-904Z-541edc`, `run-06-2026-10-27T00-08-59-773Z-753cf3`, `run-07-2026-10-27T01-23-38-939Z-41d41a`, `run-08-2026-10-27T02-49-02-205Z-c2d97d`, `run-09-2026-10-27T03-48-28-340Z-6d6b18`, `run-09-part-2026-10-27T05-04-47-007Z-e6d366`, `run-10-2026-10-27T05-45-03-929Z-0d1d37`, `run-11-part-2026-10-27T09-12-14-585Z-f0fb63`, `run-12-2026-10-27T09-45-16-049Z-a8fe58`, merged as `matrix-2026-10-27.md` says. 3183 records carry it, of 3207 observed.

| | pass | fail | cannot determine | not applicable | exempt |
| --- | --- | --- | --- | --- | --- |
| records | 875 | 0 | 37 | 2271 | — |
| rows | 1157 | 0 | 68 | 0 | 2271 |

Records by mode, view and language (pass / fail / cannot determine / not applicable):

| mode | light 413 / 0 / 15 / 1069 · dark 80 / 0 / 4 / 205 · forced-light 80 / 0 / 4 / 205 · forced-dark 80 / 0 / 4 / 205 · spacing 92 / 0 / 3 / 228 · reduced-motion 19 / 0 / 1 / 50 · fallback 54 / 0 / 3 / 147 · font32 57 / 0 / 3 / 162 |
| --- | --- |
| view | w1280 469 / 0 / 22 / 1202 · w375 120 / 0 / 3 / 314 · w320 250 / 0 / 12 / 678 · landscape 5 / 0 / 0 / 11 · short 5 / 0 / 0 / 11 · zoom200proxy 13 / 0 / 0 / 19 · zoom400proxy 13 / 0 / 0 / 21 · w640 0 / 0 / 0 / 3 · w401 0 / 0 / 0 / 6 · w400 0 / 0 / 0 / 3 · w800 0 / 0 / 0 / 3 |
| language | en-GB 359 / 0 / 15 / 935 · zh-Hans 258 / 0 / 11 / 672 · ms-MY 258 / 0 / 11 / 664 |

The cannot-determine rows are S-137 ×31 and S-138 ×6. On "first in the line spoken at completion", the page language changed after the completion, so the card's titles are in another language now (S-137 and S-138 change the language on purpose). On "unchanged after a save" (S-137), there is no reading before the save in the same language. Both are the scenarios' own design: the expected cannot-determine rows that hand-over 12 lists.

## Beside Phase 7's after-run

New in VH-198 (VH-193's warning), so there is no Phase 7 reading to compare. The warning's presence and absence against `HEAVY_LIMITING_LU` passes in every record that carries it.

## Not passing

2 groups, by subject and reason, failures first.

| subject | outcome | measurement | reason | records |
| --- | --- | --- | --- | --- |
| first in the line spoken at completion, with every warning title in order | cannot-determine |  | the page language changed since the completion: the titles on the card are in another language now | 37: S-137 en-GB w1280 light; S-137 en-GB w375 light; S-137 en-GB w320 light; S-137 zh-Hans w1280 light; S-137 zh-Hans w375 light; S-137 zh-Hans w320 light; +31 more |
| unchanged after a save | cannot-determine |  | no reading before the save in the same language | 31: S-137 en-GB w1280 light; S-137 en-GB w375 light; S-137 en-GB w320 light; S-137 zh-Hans w1280 light; S-137 zh-Hans w375 light; S-137 zh-Hans w320 light; +25 more |

