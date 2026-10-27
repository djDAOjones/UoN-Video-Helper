<!-- markdownlint-disable -->
# asserts — VH-199's evidence run (2026-10-27)

Each scenario's own declared asserts on the state it reached: the contract's words, values and DOM conditions (expects.asserts).

Runs `run-01-2026-10-26T12-20-53-837Z-5f97fb`, `run-02-2026-10-26T13-43-03-102Z-5e74aa`, `run-03-2026-10-26T17-08-32-217Z-c5fa9f`, `run-04-2026-10-26T17-47-08-808Z-d32f0f`, `run-05-2026-10-26T20-47-32-904Z-541edc`, `run-06-2026-10-27T00-08-59-773Z-753cf3`, `run-07-2026-10-27T01-23-38-939Z-41d41a`, `run-08-2026-10-27T02-49-02-205Z-c2d97d`, `run-09-2026-10-27T03-48-28-340Z-6d6b18`, `run-09-part-2026-10-27T05-04-47-007Z-e6d366`, `run-10-2026-10-27T05-45-03-929Z-0d1d37`, `run-11-part-2026-10-27T09-12-14-585Z-f0fb63`, `run-12-2026-10-27T09-45-16-049Z-a8fe58`, merged as `matrix-2026-10-27.md` says. 3183 records carry it, of 3207 observed.

| | pass | fail | cannot determine | not applicable | exempt |
| --- | --- | --- | --- | --- | --- |
| records | 2336 | 46 | 0 | 801 | — |
| rows | 5021 | 46 | 0 | 0 | 974 |

Records by mode, view and language (pass / fail / cannot determine / not applicable):

| mode | light 987 / 24 / 0 / 486 · dark 228 / 4 / 0 / 57 · forced-light 228 / 4 / 0 / 57 · forced-dark 228 / 4 / 0 / 57 · spacing 264 / 3 / 0 / 56 · reduced-motion 57 / 1 / 0 / 12 · fallback 163 / 3 / 0 / 38 · font32 181 / 3 / 0 / 38 |
| --- | --- |
| view | w1280 1273 / 25 / 0 / 395 · w375 279 / 6 / 0 / 152 · w320 690 / 15 / 0 / 235 · landscape 13 / 0 / 0 / 3 · short 13 / 0 / 0 / 3 · zoom200proxy 27 / 0 / 0 / 5 · zoom400proxy 29 / 0 / 0 / 5 · w640 3 / 0 / 0 / 0 · w401 6 / 0 / 0 / 0 · w400 3 / 0 / 0 / 0 · w800 0 / 0 / 0 / 3 |
| language | en-GB 978 / 18 / 0 / 313 · zh-Hans 681 / 14 / 0 / 246 · ms-MY 677 / 14 / 0 / 242 |

Forty-six rows fail, in three owner-accepted or unresolved groups. **S-92's "one check after the keys settle" ×31 and S-93's "exactly one check after the last press" ×6** are an instrument fault (the check counter: `phase8.mjs:85`, `scenarios.mjs:1521`; `vh199-compare-run-05.md`), an accepted gap with the owner's ruling. Their records count as ok records with a failing assert, and VH-203's after-run measures them on the fixed walker. **S-59's "focus on the card" ×9**, in the nine light cells (run-04's eight, plus run-01's en-GB w1280), reads `document.activeElement` after the walker has blurred it (`matrix.mjs:123`, before the Phase 8 instruments and asserts), while each record's reached state has the card active. That is the walker's ordering, settled at the close against Codex astra's blind draft (`contract-compare-2026-10-27.md`), and on wish VH-199.1.

## Beside Phase 7's after-run

Scenario asserts are Phase 8's corrected expectations (the scenarios file). They are not compared with Phase 7's after-run.

## Not passing

3 groups, by subject and reason, failures first.

| subject | outcome | measurement | reason | records |
| --- | --- | --- | --- | --- |
| one check after the keys settle | fail |  |  | 31: S-92 en-GB w1280 light; S-92 en-GB w375 light; S-92 en-GB w320 light; S-92 zh-Hans w1280 light; S-92 zh-Hans w375 light; S-92 zh-Hans w320 light; +25 more |
| focus on the card | fail |  |  | 9: S-59 en-GB w1280 light; S-59 en-GB w375 light; S-59 en-GB w320 light; S-59 zh-Hans w1280 light; S-59 zh-Hans w375 light; S-59 zh-Hans w320 light; +3 more |
| exactly one check after the last press | fail |  |  | 6: S-93 en-GB w1280 light; S-93 zh-Hans w1280 light; S-93 ms-MY w1280 light; S-93 en-GB w320 light; S-93 zh-Hans w320 light; S-93 ms-MY w320 light |

