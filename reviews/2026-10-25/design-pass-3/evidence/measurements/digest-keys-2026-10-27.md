<!-- markdownlint-disable -->
# keys — VH-199's evidence run (2026-10-27)

The keyboard routes J1–J4, keys only after setup: each step its focus before and after, the state asserted, a native popup "cannot determine".

Runs `run-01-2026-10-26T12-20-53-837Z-5f97fb`, `run-02-2026-10-26T13-43-03-102Z-5e74aa`, `run-03-2026-10-26T17-08-32-217Z-c5fa9f`, `run-04-2026-10-26T17-47-08-808Z-d32f0f`, `run-05-2026-10-26T20-47-32-904Z-541edc`, `run-06-2026-10-27T00-08-59-773Z-753cf3`, `run-07-2026-10-27T01-23-38-939Z-41d41a`, `run-08-2026-10-27T02-49-02-205Z-c2d97d`, `run-09-2026-10-27T03-48-28-340Z-6d6b18`, `run-09-part-2026-10-27T05-04-47-007Z-e6d366`, `run-10-2026-10-27T05-45-03-929Z-0d1d37`, `run-11-part-2026-10-27T09-12-14-585Z-f0fb63`, `run-12-2026-10-27T09-45-16-049Z-a8fe58`, merged as `matrix-2026-10-27.md` says. 24 records carry it, of 3207 observed.

| | pass | fail | cannot determine | not applicable | exempt |
| --- | --- | --- | --- | --- | --- |
| records | 20 | 0 | 4 | 0 | — |
| rows | 716 | 0 | 4 | 0 | 0 |

Records by mode, view and language (pass / fail / cannot determine / not applicable):

| mode | light 20 / 0 / 4 / 0 |
| --- | --- |
| view | w1280 15 / 0 / 3 / 0 · w320 5 / 0 / 1 / 0 |
| language | en-GB 10 / 0 / 2 / 0 · zh-Hans 5 / 0 / 1 / 0 · ms-MY 5 / 0 / 1 / 0 |

The cannot-determine rows are J1's native select, 4 steps, in OUTCOME4's four cells, as in Phase 7: a native interaction the walker cannot drive stays unverified.

## Beside Phase 7's after-run

On VH-176's 699 keys, steps went from 238 pass / 4 cannot-determine to 313 / 4. The 75 new steps are Phase 8's new stops on the four journeys (the format "?", the footer group's routes and the finished video's player), and all of them pass. The four cannot-determine steps are the same native select.

## Not passing

1 groups, by subject and reason, failures first.

| subject | outcome | measurement | reason | records |
| --- | --- | --- | --- | --- |
| S-47: ArrowDown on Animation type (native select) | cannot-determine | ArrowDown: select#closing-type.select[select-one] " → select#closing-type.select[select-one] " |  | 4: J1 en-GB w1280 light; J1 zh-Hans w1280 light; J1 ms-MY w1280 light; J1 en-GB w320 light |

