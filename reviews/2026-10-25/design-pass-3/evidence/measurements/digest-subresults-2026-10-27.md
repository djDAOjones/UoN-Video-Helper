<!-- markdownlint-disable -->
# subresults — VH-199's evidence run (2026-10-27)

A scenario's declared sub-results after its main reading (a second state in the same setup), each with its own asserts and focus.

Runs `run-01-2026-10-26T12-20-53-837Z-5f97fb`, `run-02-2026-10-26T13-43-03-102Z-5e74aa`, `run-03-2026-10-26T17-08-32-217Z-c5fa9f`, `run-04-2026-10-26T17-47-08-808Z-d32f0f`, `run-05-2026-10-26T20-47-32-904Z-541edc`, `run-06-2026-10-27T00-08-59-773Z-753cf3`, `run-07-2026-10-27T01-23-38-939Z-41d41a`, `run-08-2026-10-27T02-49-02-205Z-c2d97d`, `run-09-2026-10-27T03-48-28-340Z-6d6b18`, `run-09-part-2026-10-27T05-04-47-007Z-e6d366`, `run-10-2026-10-27T05-45-03-929Z-0d1d37`, `run-11-part-2026-10-27T09-12-14-585Z-f0fb63`, `run-12-2026-10-27T09-45-16-049Z-a8fe58`, merged as `matrix-2026-10-27.md` says. 23 records carry it, of 3207 observed.

| | pass | fail | cannot determine | not applicable | exempt |
| --- | --- | --- | --- | --- | --- |
| records | 20 | 3 | 0 | 0 | — |
| rows | 99 | 3 | 0 | 0 | 0 |

Records by mode, view and language (pass / fail / cannot determine / not applicable):

| mode | light 17 / 3 / 0 / 0 · font32 3 / 0 / 0 / 0 |
| --- | --- |
| view | w320 9 / 0 / 0 / 0 · w1280 9 / 3 / 0 / 0 · zoom200proxy 1 / 0 / 0 / 0 · zoom400proxy 1 / 0 / 0 / 0 |
| language | en-GB 8 / 1 / 0 / 0 · zh-Hans 6 / 1 / 0 / 0 · ms-MY 6 / 1 / 0 / 0 |

The three fails are S-149's light records, which reach the read-failure branch and leave focus on the body. That is V-46's read-failure branch, not an instrument fault: the contract reports it as VH-191's regression, since VH-191 moved Video language into the step that branch withdraws (`contract-2026-10-27.md`), and VH-200 judges it (in its Notes).

## Beside Phase 7's after-run

New in VH-198, so there is no Phase 7 reading to compare. V-46 was Phase 7's own finding, merged in VH-174.

## Not passing

1 groups, by subject and reason, failures first.

| subject | outcome | measurement | reason | records |
| --- | --- | --- | --- | --- |
| focus handed to the file input, the chooser that stays, never lost to the page (2.4.3; the | fail |  |  | 3: S-149 en-GB w1280 light; S-149 zh-Hans w1280 light; S-149 ms-MY w1280 light |

