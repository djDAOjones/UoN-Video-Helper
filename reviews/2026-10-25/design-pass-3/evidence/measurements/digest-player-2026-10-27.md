<!-- markdownlint-disable -->
# player — VH-199's evidence run (2026-10-27)

VH-198's: the finished video's player (VH-192) in the states that hold one: one element in the card, its place, controls, preload and paused state, its blob: URL and duration, its name from the card's title, released when a save completes; the finish+1s row reads it a second after the card appears.

Runs `run-01-2026-10-26T12-20-53-837Z-5f97fb`, `run-02-2026-10-26T13-43-03-102Z-5e74aa`, `run-03-2026-10-26T17-08-32-217Z-c5fa9f`, `run-04-2026-10-26T17-47-08-808Z-d32f0f`, `run-05-2026-10-26T20-47-32-904Z-541edc`, `run-06-2026-10-27T00-08-59-773Z-753cf3`, `run-07-2026-10-27T01-23-38-939Z-41d41a`, `run-08-2026-10-27T02-49-02-205Z-c2d97d`, `run-09-2026-10-27T03-48-28-340Z-6d6b18`, `run-09-part-2026-10-27T05-04-47-007Z-e6d366`, `run-10-2026-10-27T05-45-03-929Z-0d1d37`, `run-11-part-2026-10-27T09-12-14-585Z-f0fb63`, `run-12-2026-10-27T09-45-16-049Z-a8fe58`, merged as `matrix-2026-10-27.md` says. 3183 records carry it, of 3207 observed.

| | pass | fail | cannot determine | not applicable | exempt |
| --- | --- | --- | --- | --- | --- |
| records | 807 | 66 | 39 | 2271 | — |
| rows | 11210 | 78 | 273 | 0 | 3129 |

Records by mode, view and language (pass / fail / cannot determine / not applicable):

| mode | light 374 / 37 / 17 / 1069 · dark 75 / 5 / 4 / 205 · forced-light 75 / 5 / 4 / 205 · forced-dark 75 / 5 / 4 / 205 · spacing 86 / 6 / 3 / 228 · reduced-motion 18 / 1 / 1 / 50 · fallback 50 / 4 / 3 / 147 · font32 54 / 3 / 3 / 162 |
| --- | --- |
| view | w1280 440 / 32 / 19 / 1202 · w375 114 / 6 / 3 / 314 · w320 225 / 28 / 9 / 678 · landscape 4 / 0 / 1 / 11 · short 4 / 0 / 1 / 11 · zoom200proxy 10 / 0 / 3 / 19 · zoom400proxy 10 / 0 / 3 / 21 · w640 0 / 0 / 0 / 3 · w401 0 / 0 / 0 / 6 · w400 0 / 0 / 0 / 3 · w800 0 / 0 / 0 / 3 |
| language | en-GB 331 / 26 / 17 / 935 · zh-Hans 239 / 19 / 11 / 672 · ms-MY 237 / 21 / 11 / 664 |

The fails fall into two classes. **The finish+1s row**, "paused a second after the card appeared" (`phase8.mjs:77`), is carried by 823 rows: 769 read pass and 54 fail (S-128 ×31, S-109 ×13, S-88 ×6, S-138 ×3 and S-59 ×1). Orchestrator #9 ruled it a known instrument class, so all 823 count as unverified, the nominal passes included, never as fails or passes. S-128 plays the video, so its row reads it playing. The sampling fix is on the walker-change wish line for VH-203's after-run. **F15b's intended state**, ×12 each for "an object URL whose metadata loads" and "host named by the card's title" (S-132 ×6 and S-152 ×6). F15b breaks playback on purpose (`faults.mjs:230–234`), and S-132 was withdrawn as a finding (`vh199-compare-run-05.md`). S-152's host is named "Unable to play media." rather than by the card's title while `aria-labelledby` points at the title: that goes to VH-200 as a look at the accessible name. In the cannot-determine rows, S-127's 183 focus-appearance (2.4.13) rows need 2.4.13's exceptions interpreted, not assumed: the ring's own pixels at 3:1 are under the area (Play 90 of 368), the user-agent-only exception does not hold (an author `outline: none` reaches the controls' pseudo-elements, so the author can adjust the ring), and the unmodified exception is undetermined (the host's backdrop is the author's). Its 39 focus-visible (2.4.7) rows, where the overflow button's ring cannot be isolated, and 39 change-notification (4.1.2) rows, where a change event's arrival is not observed, are measurement gaps; and S-132's and S-152's control inventory is "no focusable control under the host in the tree" (F15b).

## Beside Phase 7's after-run

New in VH-198, so there is no Phase 7 reading to compare. Under M-05, the finish+1s row is a timing and media-readiness reading, and it is attribution unresolved.

## Not passing

7 groups, by subject and reason, failures first.

| subject | outcome | measurement | reason | records |
| --- | --- | --- | --- | --- |
| paused a second after the card appeared | fail |  |  | 54: S-88 en-GB w1280 light; S-128 en-GB w1280 light; S-128 en-GB w375 light; S-128 en-GB w320 light; S-128 zh-Hans w1280 light; S-128 zh-Hans w375 light; +48 more |
| an object URL whose metadata loads | fail |  |  | 12: S-132 en-GB w1280 light; S-132 zh-Hans w1280 light; S-132 ms-MY w1280 light; S-132 en-GB w320 light; S-152 en-GB w1280 light; S-152 zh-Hans w1280 light; +6 more |
| host named by the card's title | fail |  |  | 12: S-132 en-GB w1280 light; S-132 zh-Hans w1280 light; S-132 ms-MY w1280 light; S-132 en-GB w320 light; S-152 en-GB w1280 light; S-152 zh-Hans w1280 light; +6 more |
| notification of these changes (4.1.2) | cannot-determine |  | the exposed name and value are read from the tree before and after; whether a change event reaches assistive technology is not observed | 39: S-127 en-GB w1280 light; S-127 en-GB w375 light; S-127 en-GB w320 light; S-127 zh-Hans w1280 light; S-127 zh-Hans w375 light; S-127 zh-Hans w320 light; +33 more |
| focus appearance (2.4.13) | cannot-determine |  | under 2.4.13's area: the ring's own pixels at 3:1 against unfocused are 90 of 368; the first exception does not hold (an author outline:none | 39: S-127 en-GB w1280 light; S-127 en-GB w375 light; S-127 en-GB w320 light; S-127 zh-Hans w1280 light; S-127 zh-Hans w375 light; S-127 zh-Hans w320 light; +33 more |
| focus visible (2.4.7) | cannot-determine |  | the ring cannot be isolated from the controls' other redraw: no author style reaches ::-internal-media-controls-overflow-button; focused aga | 39: S-127 en-GB w1280 light; S-127 en-GB w375 light; S-127 en-GB w320 light; S-127 zh-Hans w1280 light; S-127 zh-Hans w375 light; S-127 zh-Hans w320 light; +33 more |
| control inventory | cannot-determine |  | no focusable control under the host in the tree | 12: S-132 en-GB w1280 light; S-132 zh-Hans w1280 light; S-132 ms-MY w1280 light; S-132 en-GB w320 light; S-152 en-GB w1280 light; S-152 zh-Hans w1280 light; +6 more |

