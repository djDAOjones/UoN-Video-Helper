# The instruments re-proved and the pilot — VH-198, 25 October 2026

The walker is Phase 7's, copied into `walker/` from
`reviews/2026-10-22/design-pass-2/evidence/measurements/walker/` at
`4ec3d31` (`walker/SOURCE.md`); the old bundle is untouched.
`git diff 4ec3d31 -- reviews/2026-10-25/design-pass-3/evidence/measurements/walker/`
is the instrument diff. The pilot, the routes and transitions walked
before VH-199, the faults' check and the three proof suites below ran at
one instrument revision, **`6ed245d297623aec`** (`runner.mjs`
`instrumentRevision()`: a hash over each `.mjs` and `.sh` file's hash in
`walker/`), from commit `083a545`, with `src/` and `index.html` as
`e226410` (VH-193) left them. Every part VH-199 walks must run at it;
a change to the walker after a part has run reruns that part (the plan,
"Running it").

The browser was Chrome 156.0.8078.48, `--headless=new`, on macOS
(darwin 25.6.0, arm64), driven over the DevTools protocol on its own
port, against a Vite dev server of this checkout on port 5181. The
fixtures are the scratchpad's, made by `walker/fixtures.sh` and
`walker/fixtures-8.sh` (N6 to N14), each hashed in the manifest; nothing
was written to `samples/`, `src/` or `test/`.

## What Phase 8 added to the walker

VH-198's first agent (commits `877f3ab` to `d43a7f5`) added, by the
plan's "The walker gains what Phase 8 added":

- **`phase8.mjs`**, six instruments in every scenario record, each
  "not applicable" where its element is absent, never a silent pass:
  `player` (the native player in the finished card: present while
  unsaved, gone once saved, named by the card's title, controls,
  `preload` metadata, no autoplay, its controls' inventory, names and
  targets apart from the host), `playerKeys` (active, P-06: the route by
  the focused accessibility node, play/pause and seek proved apart, each
  ring by pixels on a held frame), `formatTip` (active: "About the video
  format" by Tab, Shift+Tab, Escape and a click, its edge and gap),
  `footer` (one `h2`, three `h3`, levels from the tree, Report a problem
  in its group), `limiting` (present above `HEAVY_LIMITING_LU` by the
  bite the worker logged, absent below, first on the card and in the
  line spoken, read inside the completion's interval only), and
  `videoLanguage` (its place, its lock, the next-video line under Video
  type alone); and `asserts`, each scenario's own.
- **`M.says`** (`scenarios.mjs` MX_INIT): composed wording pinned with
  its substituted names, where Phase 7's `M.matches` passed S-31 falsely.
- **Faults F15a, F15b, F16, F17, F18 and F19**, and F4e revised (it
  spares the first object URL per Blob, so the player keeps its URL),
  each reporting the branch it reached.
- **Fixtures N6 to N14** (`fixtures-proof-2026-10-25.json`, 8 of 9: N11
  reads as 10 seconds, so S-104 is source-only by its own contingency).
- **S-92 to S-153** in `SCENARIOS`, with S-140n and S-144p (63 walked
  ids; S-104 and S-154 source-only), the carried scenarios Phase 8
  changed amended so no assertion passes on Phase 7's text, and the
  route K-player.

This agent added:

- **`parts.mjs`**: the five parts and twelve runs (below), runnable by
  name: `node matrix.mjs part3`, `node matrix.mjs run-04`,
  `node transitions.mjs --plan run-03`; `node parts.mjs check` holds them
  to the sizing script before any part or run starts or resumes.
- **`transitions.mjs`** runs a declared plan in a fresh directory, fails
  a run with a transition missing, in error or undeclared, resumes in
  place, and writes a manifest with the revision and the keys' hashes.
- **`runner.mjs`**: `instrumentRevision()`, `expectedKeysSha256` and
  `observedKeysSha256` in every manifest (as VH-172's and VH-176's), and
  Chrome's flags read from the browser process (below).
- **J1 to J4 revised whole** for the Phase 8 page, by the scenarios
  file's chains ("Keyboard route per journey"): J1 walks S-141 and S-142
  (the format "?" opened by Enter and closed by Tab on Video type),
  S-92's Page step (0, 10, 20, 10, 0 on `lecture-360s`), S-119 (Video
  language one stop, then the title card box), S-17, S-95 and S-97 (the
  onset "?" closed by Tab on the Blue radio, then by Escape), S-123
  (Video language disabled while the job runs), S-126 and S-127 (the
  player, its controls, then Save, and Shift+Tab out to the control
  before the card, never the card) and S-114 ("Create the video again");
  J2 walks S-121 and S-122 (Video language by two arrows, then the
  fields); J3 walks S-106 (F17), S-132 (F15a in place) and S-148 (the
  two report buttons); J4 asserts S-116, S-129, S-71's free Video
  language and next-video line, and S-123 while the job runs.
- **K-player by Chrome's own inventory**: the controls between play and
  the time slider are the ones Chrome shows at the width, each stop kept
  in the step's `stops`. At 1280 px: volume, un-mute, full screen, more
  controls, the time slider. At 320 px full screen goes into More, which
  the first route, fixed to the 1280 px list, failed on.
- **`PLANS.pilot3`**, and each record's timing (its group's setup, then
  its own seconds), for the calibration.

## The visible-page method change

Headless Chrome treats every page but its first as hidden unless told
otherwise: timers throttle to 1 s and media loading is deferred (a probe
read twenty 100 ms timers at 19.7–20.0 s in the second and third pages,
2.0 s in the first; `phase8-app-proof-2026-10-25.json`). Phase 7's
matrix opened its analysis page early, so its later walk pages ran
hidden. Pass 3's Chrome runs with
`--disable-background-timer-throttling`, `--disable-renderer-backgrounding`
and `--disable-backgrounding-occluded-windows`, and the walker enforces
it rather than trusting it: `qualify.mjs` `assertReached` fails a record
whose page is not `visible`, and `transitions.mjs` fails a transition
the same way.

`Browser.getBrowserCommandLine` answers only under `--enable-automation`,
so the walker's first manifest read the flags as "unread".
`runner.mjs` `browserCommandLine()` now reads the browser process's own
arguments from the OS by its pid (`SystemInfo.getProcessInfo`, then
`ps`), and each manifest names any visible-page flag missing. The
pilot's manifest has all three, none missing.

## The parts

`parts.mjs` restates `sizing-2026-10-25.mjs`'s recipes, since that
script only prints counts, and holds the two together:

- **counts**: `node sizing-2026-10-25.mjs <the new walker>` is run as the
  plan names it, and each part's declared records plus the records of a
  source-only scenario the script still counts must equal the script's;
- **keys**: the script's own key sets, read by running its source with
  its last line keeping them, must equal each part's set exactly;
- **estimates**: the script's estimate on its own records must equal the
  one `parts.mjs` computes;
- **floors**: no part may be smaller than the plan's count except by a
  source-only scenario with a recorded contingency (S-104's, scenarios
  file line 144);
- **identity**: part 1's keys hash to `7a700694a512de97`, VH-172's and
  VH-176's; every key is in one part, every part's records in one run of
  that part, every scenario's records of a part in one run; the split is
  frozen (`RUNS_SHA` `05493ee20ebbfc06`).

The check was proved to fail on three mutations in scratch copies: S-92
narrowed to English (the script narrows too, so the counts agree, and
the floor fails part 3: 2,113 against 2,162); `S-03` dropped from the
recipe's carried looks (keys and count differ from the script's); S-103
made source-only with no contingency.

| Part | What it walks | Plan | Script, new walker | Declared | Script's estimate | Calibrated |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | `PLANS.priority`, carried | 699 | 699 | 699 | 8,600 s | 7,304 s |
| 2 | the fix plans' keys beyond part 1, and VH-178's transitions | 205 | 157 + 48 | 157 + 48 | 2,202 s | 2,117 s |
| 3 | Phase 8 in full | 2,162 | 2,162 | 2,131 | 22,721 s | 18,078 s |
| 3b | every other walked scenario in the nine light cells | 184 | 216 | 216 | 6,645 s | 5,705 s |
| 4 | the routes whole, less part 1's | 16 | 16 | 16 | 885 s | 413 s |
| | **Total** | **3,266** | **3,298** | **3,267** | 41,053 s, 11.4 h | 9.3 h |

The declared records' own estimate differs from the script's by the
union press lists (+10 s in part 1, +32 s in part 2: 3 s a press) and
S-104's records (−196 s in part 3).

**The runs**, each of whole scenarios of one part, by the script's
estimate to about an hour (largest scenario first, to the lightest run):

| Run | Part | Records | Scenarios | Script's estimate | Calibrated |
| --- | --- | ---: | ---: | ---: | ---: |
| run-01 | 1 | 369 | 60 | 4,303 s | 3,755 s |
| run-02 | 1 | 330 | 60 | 4,307 s | 3,548 s |
| run-03 | 2 | 157 + 48 transitions | 15 | 2,234 s | 2,117 s |
| run-04 | 3 | 358 | 23 | 3,757 s | 3,115 s |
| run-05 | 3 | 383 | 24 | 3,742 s | 2,587 s |
| run-06 | 3 | 338 | 24 | 3,758 s | 3,059 s |
| run-07 | 3 | 355 | 24 | 3,756 s | 3,135 s |
| run-08 | 3 | 367 | 24 | 3,756 s | 3,082 s |
| run-09 | 3 | 330 | 24 | 3,757 s | 3,099 s |
| run-10 | 3b | 103 | 25 | 3,323 s | 2,830 s |
| run-11 | 3b | 113 | 23 | 3,322 s | 2,874 s |
| run-12 | 4 | 16 | 5 | 885 s | 413 s |

Part 2's run is two commands, `node matrix.mjs run-03` for its 157
records and `node transitions.mjs --plan run-03` for its 48 transitions.
Each resumes in place: `node matrix.mjs --resume <dir>`,
`node transitions.mjs --resume <dir>`, refused if the walker now declares
other records than the run did.

## The reconciliation

| Part | Plan | Declared | Difference | Which records |
| --- | ---: | ---: | ---: | --- |
| 1 | 699 | 699 | 0 | VH-172's keys, `7a700694a512de97`. Five keys part 2's plans also hold are walked once, here, with the union of the press lists, as VH-176 re-ran them with VH-179's wider list: S-03 at 1280 px in Chinese (light, dark, forced-light, forced-dark) and Malay (light), each pressing `#file-input` |
| 2 | 205 | 157 + 48 | 0 | `PLANS.vh179` 39, `vh180` 46, `vh181` 23, and 49 keys more than one plan holds, each once (`vh180`+`vh181` 40, `vh179`+`vh180`+`vh181` 6, `vh179`+`vh180` 3); 15 carry a press list. The transitions are VH-176's two sets, all twelve in English at 1280 px, light, and T-46.1 to T-46.3 in three languages and four colour modes: T-46.1, T-46.2 and T-46.3 in English, light, are in both sets, as they were in VH-176's 48, so the 48 records are 45 distinct transition cells |
| 3 | 2,162 | 2,131 | −31 | S-104, source-only by its contingency (scenarios file line 144; N11 reads as 10 seconds): its FULL recipe's 31 cells, 13 English, 9 Chinese, 9 Malay. By reason the part is new 1,209 (1,240 less S-104's 31), look 561, words 188, state 115, finite 58 |
| 3b | 184 | 216 | +32 | The plan's 184 was counted on Phase 7's walker, which has no S-92 to S-153. On the new walker: **S-113**'s six light cells (three languages at 1280 and 320 px: its views are 1280, 640, 401 and 320 px and its part 3 recipe is the 32 px font alone), and **13 production outcomes** at 320 px in Chinese and Malay, light, two each: S-93, S-100, S-115, S-118, S-123, S-124, S-131, S-132, S-133, S-136, S-138, S-151, S-152 (26). They declare 1280 and 320 px; part 3's OUTCOME4 holds their three 1280 px cells and English at 320 px, and the script's `HEAVY` set, which gives a production outcome OUTCOME4's cells in 3b, lists only carried scenarios, so these take their two other light cells |
| 4 | 16 | 16 | 0 | J2 to J4 and K-dialog in Chinese and Malay at 1280 px and English at 320 px, and K-player in all four cells |
| | **3,266** | **3,267** | **+1** | +32 − 31 |

**Nothing is double-counted.** `parts.mjs check` asserts every key in
one part only, every part's records in exactly one of its runs, and each
part's key set equal to the script's. The only repeat is the three
transition cells above, which the plan's 48 counts twice because VH-176
measured them in both runs; they are kept, so part 2 re-verifies VH-178
to VH-181 exactly as VH-176 measured them.

**For the owner, not a reduction:** by the plan's words a production
outcome in 3b takes OUTCOME4's cells, which part 3 already holds, so the
13 new production outcomes would add nothing there; the script, which
the plan names as the count, adds 26 real encodes (about 1,600 s of the
script's estimate). They are declared as the script counts them. Taking
them out would need the recipe changed by decision; it is not proposed.

## Proved to detect, again

Every Phase 7 proof suite was rerun on the copy at `6ed245d297623aec`, its
failing fixtures and mutated pages written to the scratchpad only:

| Suite | Results | File |
| --- | --- | --- |
| The instruments (`prove.mjs`, VH-171 and Codex astra's method check) | 77 of 77 proved; every fixture's outcome as in `prove-2026-10-23.json` | `prove-2026-10-25.json` |
| `pressed` and `type` (`prove-172.mjs`, VH-172) | 8 of 8 | `prove-172-2026-10-25.json` |
| Phase 8's instruments (`prove-8.mjs`) | 31 of 31; outcomes as the first agent's run | `prove-8-2026-10-25.json` |
| Every fault (`faults.mjs check`): Phase 7's F1 to F14 on the Phase 8 page, and F15 to F19 and F4e revised, each reporting the branch it reached | 27 of 27 reach their state | `faults-check-2026-10-25.json` (the first agent's file held the nine new ones alone) |
| N6 to N14 | 8 of 9, N11 the exception (the first agent's run, at `20440da`'s walker; no fixture changed since) | `fixtures-proof-2026-10-25.json` |

The checks the plan names each have a failing case and a passing twin:

- **VH-171's three**: an overflow (`overflow-bad`, 2,024 px on a
  1,280 px page, and `overflow-good`), a focus ring too small
  (`focus-bad`, a 1 px dotted grey ring, and `focus-good`), a control with
  no accessible name (`name-bad`, a button with only a hidden icon and an
  unlabelled field, and `name-good`); with the clipped, scrolled,
  file-button and thumb variants Phase 7 added (`prove.mjs`).
- **Composed wording with its substituted names**:
  `composed-old-name-bad` (the page mutated back to the old output name,
  where `M.matches` passed S-31) fails; `composed-new-name-good` passes
  (`prove-8.mjs`).
- **Heading levels from the tree**: `footer-h2-at-level-3-bad` (the
  footer's `h2` re-levelled to 3) fails, `footer-app-good` passes, and
  `footer-button-moved-bad` fails.
- **The warning scoped to the transition's interval**:
  `warning-said-in-an-earlier-job-bad` (the warning spoken at an earlier
  completion, which the whole history would pass) fails,
  `warning-said-at-this-completion-good` passes; and the warning by the
  bite, above and below `HEAVY_LIMITING_LU`, both ways.
- **The player, its two checks apart**: a host with no name and a
  control out of reach, each with a passing twin, each fixture read by
  both checks; a saved card's player present fails.
- **The format "?"**: closing on Tab, its edge; **Video language**: its
  place, its lock, the next-video line.
- **The runner**: missing, duplicate, stale, undeclared, failed,
  empty-pass, wrong-view, missing-instrument, expired-state and
  missing-variant records each fail a run; a capture is never
  overwritten; a whole run passes.

## The pilot

`PLANS.pilot3`, 77 records: Phase 7's second pilot (`PLANS.pilot2`, 43:
S-03, S-15 and S-76 in English at 1280 px in all eight modes; S-03 and
S-15 at 375 and 320 px, landscape, short and both proxies; S-76 at
320 px and both proxies; the three in Chinese; K-dialog) with Phase 8's
states, 34: S-126 (the player), S-127 (its controls by keys), S-17 and
S-141 (both "?"), S-145 (the footer's headings), S-135 (the limiting
warning), S-119 (Video language), S-114 (Create's "again" label) and
S-140n in English at 1280 px; S-126 and S-141 in dark, both forced
palettes and reduced motion; S-145 with the 32 px font and fallback
faces; S-126, S-127, S-141, S-145 and K-player at 320 px; S-141 and
S-135 with spacing at 320 px; S-126, S-135, S-119, S-114 and S-145 in
Chinese; S-141 and S-145 in Malay; K-player at 1280 px. Every
instrument ran on every scenario record.

Run `pilot3-2026-10-25T22-24-36-920Z-6a19fb`: **77 declared, 77 observed, whole**: no missing, duplicate, stale, undeclared, failed, state-expired or wrong-view record, every required instrument present, none passing on nothing (`runner.mjs` `verify`). Every page was visible, and the manifest reads Chrome's flags from the browser process (ps, pid 15773), none of the three missing. It took 557 s; 746 captures (34.2 MB), each hashed; `observedKeysSha256` `fdc4e3dd17ebc634`. By class: English 67, Chinese 8, Malay 2; seven views (1280, 375 and 320 px, landscape, short, both proxies) and all eight modes.

Records by instrument (the routes' `keys` rows are K-dialog's and K-player's):

| Instrument | Pass | Fail | Cannot determine | Not applicable |
| --- | ---: | ---: | ---: | ---: |
| `overflow` | 74 | 0 | 0 | 0 |
| `ax` | 74 | 0 | 0 | 0 |
| `targets` | 50 | 0 | 24 | 0 |
| `contrastText` | 74 | 0 | 0 | 0 |
| `contrastExtra` | 42 | 0 | 32 | 0 |
| `measure` | 66 | 0 | 8 | 0 |
| `type` | 74 | 0 | 0 | 0 |
| `focus` | 60 | 1 | 13 | 0 |
| `player` | 0 | 0 | 14 | 60 |
| `formatTip` | 23 | 0 | 0 | 51 |
| `footer` | 62 | 0 | 0 | 12 |
| `limiting` | 14 | 0 | 0 | 60 |
| `videoLanguage` | 74 | 0 | 0 | 0 |
| `asserts` | 71 | 0 | 0 | 3 |
| `motion` | 5 | 0 | 0 | 0 |
| `keys` | 3 | 0 | 0 | 0 |

The one failing record is S-15 at the 32 px font (below). Two earlier pilots, on revision `f37a3c13a26ca902` (75 records, before K-player and S-127 at 320 px joined) and on `410b9be3ca3b6234` (77), read the same: whole, the one failure, the same unresolved groups. Every Phase 8 instrument passed or was "not applicable" where its element was absent: the player wherever there was no finished card, `formatTip` outside the scenarios that own it, `limiting` without a finished card. The player's 14 "cannot determine" records are the volume slider's empty box at rest, below.

The manifest is `pilot-manifest-2026-10-25.json`, in Phase 7's form:
source commit, the instrument revision and every file's hash, browser,
its flags and the OS, each view's actual viewport and root font, the
scaling method, the four enlargement categories kept apart, every
fixture by hash, expected and observed keys and their hashes, the
measurements, every capture by hash, and what stayed unresolved; with
the parts' check, the reconciliation, the calibration, the proofs and
the routes' runs beside it.

### The routes, walked whole before VH-199

At the same revision, part 1's seven route cells and part 4 whole, and
part 2's transitions, each in a fresh run directory:

| Run | Records | Whole | Outcome | Measured |
| --- | ---: | --- | --- | ---: |
| `part1-part-2026-10-25T22-33-54-171Z-c68558`: J1 in Chinese, Malay and English at 1280 px and English at 320 px; J2, J3 and J4 in English at 1280 px | 7 | yes | J2 to J4 pass; each J1 "cannot determine" on one step alone, ArrowDown on the native Animation type select (Chrome opens its popup rather than step the value, as Phase 7 recorded); 295 of 299 steps pass | 353 s |
| `part4-2026-10-25T22-39-48-171Z-1844bf`: part 4, J2 to J4 and K-dialog in Chinese and Malay at 1280 px and English at 320 px, K-player in its four cells | 16 | yes | 16 pass, 403 of 403 steps | 382 s |
| `transitions-run-03-2026-10-25T22-46-10-562Z`: part 2's 48 transitions (`--plan run-03`) | 48 | yes | 48 pass | 1,272 s |

These are qualification runs, kept in the scratchpad; VH-199 walks every
part afresh. Two readings in them are for VH-200, not instrument faults:
T-46.1's focused card now runs past the window (292 to 990 px of 900 in
English, 255 to 953 px in Chinese and Malay), where VH-176 read it inside
(292 to 518 px), since the player made the card taller; and K-player at
320 px finds full screen under More, the controls Chrome shows at that
width.

### The calibration

Each pilot record's measured seconds (its group's setup on the first
record, then its own), against the sizing script's estimate for the same
records:

| Class | Records | Measured | Script's estimate | Ratio |
| --- | ---: | ---: | ---: | ---: |
| carried scenarios (the pilot) | 43 | 288 s | 327 s | 0.881 |
| Phase 8's scenarios (the pilot) | 30 | 235 s | 297 s | 0.79 |
| K-dialog and K-player (the pilot and part 4) | 10 | 94 s | 238 s | 0.396 |
| J1 to J4 (the route runs) | 16 | 671 s | 1,370 s | 0.489 |
| S-140n (the pilot) | 1 | 4 s | 86 s | 0.041 |

Applied by class to each part's records, the matrix comes to about **9.3 h** against the script's 11.4 h; the twelve runs to between 6 and 62 minutes.

J1 to J4, which the pilot does not hold, are calibrated from the route
runs above; part 2's transitions keep VH-176's measured 1,250 s, which
part 2's run measured again at 1,272 s; S-140 and S-140n block at read
in about 3 s, so their 900 s and 120 s allowances fall to the read. The calibration is a
sample: its carried scenarios are the cheap S-03, S-15 and S-76, and the
slow setups (the hour-long still, the real encodes of S-93, S-123,
S-124, S-133) are not in it, so their estimates are scaled by the
nearest class. The script's 11.4 h stays the upper bound to plan by.

## S-140 and N13: a block at read, by design

The sample `samples/UoN Closing Logo Fade Blue 2025.mov` is fully on
this device: `ls -lO` shows no `dataless` flag and `stat` 154,096 blocks
of 512 bytes for its 78,894,855 bytes. N13 (`qtrle-5s.mov`) is in the
scratchpad, outside OneDrive. Neither is a OneDrive placeholder or a
sandbox refusal: the page reads both (`fixtures-proof-2026-10-25.json`,
N13 and the sample read just before it; S-140n again in this pilot),
finds a QuickTime Animation (`qtrle`; the sample is 3840 × 2160, ARGB,
by `ffprobe`) video track that Chrome cannot decode, and
blocks at step 1 with `failure.reasons.noSourceDecodeHere`, "This
browser cannot read the picture or audio inside this file. It was
probably saved in a format made for editing software. Export it again
as an MP4…", in about 2 to 3 s. Create is never offered. S-140 and
S-140n record that block as their outcome, as the scenarios file's
"its outcome recorded either way" allows; their focus target (the
result) is "cannot determine: no element", since no card is made. The
owner need not act on the files. Wish VH-193.3's question (VH-193's
corpus walk stood ten minutes with no result) is answered for this
build: the page refuses the asset before any job.

## What stays "cannot determine", for the person list

From the pilot's measurements (the manifest's `unresolved`):

- **The trim thumbs' painted disc**: non-text contrast needs a pixel
  reading of the pseudo-elements (`contrastExtra`, 32 records); their
  target is a 44 px disc in which no 44 px square fits, and their ring
  passes against the painted disc but not the 44 px circular reference
  (`targets` 23, `focus` 13): VH-173's readings, carried.
- **The player's volume slider at rest**: its box is empty (0 × 48)
  until focused or hovered (`player`, 14 records); the user agent's rings
  on the player's inner controls, visible but under 2.4.13's area, and
  the time slider's 24 px height, are the user agent's exceptions
  (`player-proof-2026-10-25.json`).
- **Mixed-script lines** in Chinese, where a per-character and a
  CJK-plus-Latin count disagree (`measure`, 8 records): VH-173's reading.
- **One-off readings**: the file button's glyph pixels at the landscape
  view (S-15, the device scale's one-pixel flip VH-176 saw), and S-76's
  target at the 400 % proxy (larger than the viewport).

And by method, unchanged from Phase 7 unless said: Chrome's own page zoom
at 200 % and 400 % (the proxies stand in); what a screen reader says (the
tree and the DOM log are exposure only); native select popups by keys;
the player's controls a person's Chrome shows at each width (at 320 px
full screen is under More); S-134's back-forward cache in a person's
Chrome; F16 against a production build, which bundles the worker; the
dialog's entry and exit at enlargement; transient states mid-transition;
synthetic text-only enlargement, not run.

## Seen in the pilot, for VH-200 (a finding, not an instrument fault)

- **S-15 at the 32 px default font: step 5's checked output's ring reads
  284 of 304 px²** (2.4.13), so the record's focus fails; in VH-176's
  after-run the same record's focus was "cannot determine" from the
  thumbs alone. VH-188 changed step 5's names and details. Not judged
  here; no rank 1 defect was seen.

## Left for VH-198

- Codex astra's method check of the instrument diff, the scenario list,
  the manifest and the pilot, saved verbatim with its brief, each point
  applied or refused before VH-199 starts.
- VH-193.2's non-finite and lowered-ceiling paths (the plan: verified in
  VH-198).
