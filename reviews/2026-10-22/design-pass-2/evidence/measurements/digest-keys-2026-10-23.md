<!-- markdownlint-disable -->
# keys — VH-172's priority run (2026-10-23)

The keyboard routes J1–J4, keys only after setup: each step its focus before and after, the state asserted, a native popup "cannot determine".

Runs `priority-1-2026-10-23T12-47-49-793Z-0d4cac`, `priority-2-2026-10-23T13-16-30-886Z-48f1bc`, `priority-3-2026-10-23T13-56-31-192Z-b76894`, `priority-4-2026-10-23T14-33-32-479Z-b3e805`, `priority-part-2026-10-23T15-04-06-332Z-bbe3f1`. 8 records carry it, of 699 observed.

| | pass | fail | cannot determine | not applicable | exempt |
| --- | --- | --- | --- | --- | --- |
| records | 4 | 0 | 4 | 0 | — |
| rows | 238 | 0 | 4 | 0 | 0 |

Records by mode and by view (pass / fail / cannot determine / not applicable):

| mode | light 4 / 0 / 4 / 0 |
| --- | --- |
| view | w1280 4 / 0 / 3 / 0 · w320 0 / 0 / 1 / 0 |
| language | en-GB 4 / 0 / 2 / 0 · zh-Hans 0 / 0 / 1 / 0 · ms-MY 0 / 0 / 1 / 0 |

Not passing: 1 groups, by subject and reason, failures first.

| subject | outcome | measurement | reason | records |
| --- | --- | --- | --- | --- |
| S-47: ArrowDown on Animation type (native select) | cannot-determine | ArrowDown: select#closing-type.select[select-one] " → select#closing-type.select[select-one] " |  | 4: J1 en-GB w1280 light; J1 zh-Hans w1280 light; J1 ms-MY w1280 light; J1 en-GB w320 light |

