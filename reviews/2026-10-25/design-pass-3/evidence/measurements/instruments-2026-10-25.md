# The instruments re-proved and the pilot — VH-198, 25 October 2026

The walker is Phase 7's, copied into `walker/` from
`reviews/2026-10-22/design-pass-2/evidence/measurements/walker/` at
`4ec3d31` (`walker/SOURCE.md`); the old bundle is untouched.
`git diff 4ec3d31 -- reviews/2026-10-25/design-pass-3/evidence/measurements/walker/`
is the instrument diff. After Codex astra's method check and its
re-check (their own sections, below), every proof, the pilot, and the
routes and transitions walked before VH-199 were run again on 26 October
at one instrument revision, **`2cbba731c59d8036`** (`runner.mjs:235–238`
`instrumentRevision()`: a hash over each `.mjs` and `.sh` file's hash in
`walker/`), the walker as this document's commit holds it, with `src/`
and `index.html` as `e226410` (VH-193) left them (source commit
`ddc3d15`, nothing uncommitted). Each run pinned that revision when it
was created, and every record carries it. The first proofs and pilot,
at `6ed245d297623aec`, stay in git at `d403a72`; those after the method
check, at `2d16e337abe51539`, at `ddc3d15`. Every part VH-199 walks must
run at `2cbba731c59d8036`; a change to the walker after a part has run
reruns that part (the plan, "Running it").

The browser was Chrome 156.0.8078.48, `--headless=new`, on macOS
(darwin 25.6.0, arm64), driven over the DevTools protocol on its own
port, against a Vite dev server of this checkout on port 5181, one run
at a time on a machine running nothing else of this work. The fixtures
are the scratchpad's, made by `walker/fixtures.sh` and
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
  ring by pixels on a held frame, read three ways since M-02), `formatTip`
  (active: "About the video format" by Tab, Shift+Tab, Escape and a
  click, its edge and gap), `footer` (one `h2`, three `h3`, levels from
  the tree, Report a problem in its group), `limiting` (present above
  `HEAVY_LIMITING_LU` by the bite the worker logged, absent below, first
  on the card and in the line spoken, read from the completion's own
  write since M-01), and
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

**For VH-199's comparison with VH-176's after-run (Codex astra's M-05).**
The visible-page method is a comparison-method change: VH-176 measured
its later pages hidden. A changed measurement of **timing, media
readiness or interaction-triggered paint** is labelled **"attribution
unresolved"** in the comparison ledger, unless a small matched baseline
probe (the same record on VH-176's build, its pages visible) settles
whether Phase 8 or the method made the difference. Static geometry
comparisons (sizes, positions, overflow, what is drawn at rest) stand.
"What VH-199 needs to know", at the end, repeats this.

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
| 1 | `PLANS.priority`, carried | 699 | 699 | 699 | 8,600 s | 7,646 s |
| 2 | the fix plans' keys beyond part 1, and VH-178's transitions | 205 | 157 + 48 | 157 + 48 | 2,202 s | 2,142 s |
| 3 | Phase 8 in full | 2,162 | 2,162 | 2,131 | 22,721 s | 19,235 s |
| 3b | every other walked scenario in the nine light cells | 184 | 216 | 216 | 6,645 s | 5,841 s |
| 4 | the routes whole, less part 1's | 16 | 16 | 16 | 885 s | 417 s |
| | **Total** | **3,266** | **3,298** | **3,267** | 41,053 s, 11.4 h | 9.8 h |

The declared records' own estimate differs from the script's by the
union press lists (+10 s in part 1, +32 s in part 2: 3 s a press) and
S-104's records (−196 s in part 3).

**The runs**, each of whole scenarios of one part, by the script's
estimate to about an hour (largest scenario first, to the lightest run):

| Run | Part | Records | Scenarios | Script's estimate | Calibrated |
| --- | --- | ---: | ---: | ---: | ---: |
| run-01 | 1 | 369 | 60 | 4,303 s | 3,941 s |
| run-02 | 1 | 330 | 60 | 4,307 s | 3,704 s |
| run-03 | 2 | 157 + 48 transitions | 15 | 2,234 s | 2,142 s |
| run-04 | 3 | 358 | 23 | 3,757 s | 3,339 s |
| run-05 | 3 | 383 | 24 | 3,742 s | 2,744 s |
| run-06 | 3 | 338 | 24 | 3,758 s | 3,201 s |
| run-07 | 3 | 355 | 24 | 3,756 s | 3,521 s |
| run-08 | 3 | 367 | 24 | 3,756 s | 3,265 s |
| run-09 | 3 | 330 | 24 | 3,757 s | 3,165 s |
| run-10 | 3b | 103 | 25 | 3,323 s | 2,897 s |
| run-11 | 3b | 113 | 23 | 3,322 s | 2,944 s |
| run-12 | 4 | 16 | 5 | 885 s | 417 s |

Part 2's run is two commands, `node matrix.mjs run-03` for its 157
records and `node transitions.mjs --plan run-03` for its 48 transitions.
Each resumes in place: `node matrix.mjs --resume <dir>`,
`node transitions.mjs --resume <dir>`, refused if the walker now declares
other records than the run did, or if the walker, the source or a
fixture differs from what the run pinned when it was created (M-03).

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

Every proof suite was run again on 26 October at `2cbba731c59d8036`,
after Codex astra's re-check, one at a time, its failing fixtures and
mutated pages written to the scratchpad only:

| Suite | Results | File |
| --- | --- | --- |
| The instruments (`prove.mjs`, VH-171, Phase 7's method check, M-01's runner cases and the re-check's real declarations) | 93 of 93 proved: the 77 before, each as in `prove-2026-10-23.json`, 8 of M-01 and 8 of the re-check | `prove-2026-10-25.json` |
| `pressed` and `type` (`prove-172.mjs`, VH-172) | 8 of 8 | `prove-172-2026-10-25.json` |
| Phase 8's instruments (`prove-8.mjs`, with M-01's, M-02's and the re-check's cases) | 72 of 72: the 31 before, 34 of M-01 and M-02, and 7 of the re-check | `prove-8-2026-10-25.json` |
| The player (P-06): `prove-8.mjs`'s 37 player checks, and S-126, S-127, S-131 and K-player on the app (`PLANS.vh198proof`) | 37 of 37; the app's records as "After Codex astra's method check", M-02, settles them, with 2.4.13's area the ring's own pixels ("After Codex astra's re-check") | `player-proof-2026-10-25.json` |
| Phase 8's instruments on the app (`node matrix.mjs vh198proof`, 11 records) | 11 of 11, whole, every record at the revision | `phase8-app-proof-2026-10-25.json` |
| Every fault (`faults.mjs check`): Phase 7's F1 to F14 on the Phase 8 page, and F15 to F19 and F4e revised, each reporting the branch it reached | 27 of 27 reach their state | `faults-check-2026-10-25.json` |
| N6 to N14 (`prove-fixtures-8.mjs`), N14 on its measured timing (M-04) | 8 of 9, N11 the exception: it reads as 10 seconds, so S-104 is source-only | `fixtures-proof-2026-10-25.json` |
| A resume refused on drift (`prove-resume.mjs`, M-03) | 12 of 12 | `prove-resume-2026-10-25.json` |
| The subresults (`prove-m04.mjs`, M-04) | 8 of 8 | `prove-m04-2026-10-25.json` |

`node parts.mjs check` passes on the same walker: 3,267 records (699;
157 + 48; 2,131; 216; 16) in twelve runs, `RUNS_SHA` `05493ee20ebbfc06`,
no problem.

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
- **Codex astra's four musts**: each gap with its failing case and
  passing twin, in "After Codex astra's method check", below; and its
  re-check's three, in "After Codex astra's re-check".

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
instrument ran on every scenario record, and S-76's four enlargement
records (320 px, both proxies, the 32 px font) ran their subresults
(M-04).

Run `pilot3-2026-10-26T08-23-14-752Z-26da6c`, at `2cbba731c59d8036`: **77 declared, 77 observed, whole**: no missing, duplicate, stale, undeclared, failed, state-expired or wrong-view record, every required instrument present with its evidence and every record holding the subjects its declaration expects, none passing on nothing (`runner.mjs:133–198` `verify`). The provenance pinned at creation held (no drift, no record off the revision). Every page was visible, and the manifest reads Chrome's flags from the browser process (ps, pid 42753), none of the three missing. It took 614 s (613 s at `2d16e337abe51539`, 557 s at `6ed245d297623aec`); 761 captures (35.3 MB), each hashed; `expectedKeysSha256` and `observedKeysSha256` both `fdc4e3dd17ebc634`. By class: English 67, Chinese 8, Malay 2; seven views (1280, 375 and 320 px, landscape, short, both proxies) and all eight modes.

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
| `player` | 12 | 0 | 2 | 60 |
| `formatTip` | 23 | 0 | 0 | 51 |
| `footer` | 62 | 0 | 0 | 12 |
| `limiting` | 14 | 0 | 0 | 60 |
| `videoLanguage` | 74 | 0 | 0 | 0 |
| `asserts` | 71 | 0 | 0 | 3 |
| `motion` | 5 | 0 | 0 | 0 |
| `keys` | 3 | 0 | 0 | 0 |
| `subresults` | 4 | 0 | 0 | 0 |

The one failing record is S-15 at the 32 px font (below), as at `2d16e337abe51539` and `6ed245d297623aec` and on two earlier revisions, `f37a3c13a26ca902` (75 records, before K-player and S-127 at 320 px joined) and `410b9be3ca3b6234` (77): whole, the one failure, the same unresolved groups but the player's. Every Phase 8 instrument passed or was "not applicable" where its element was absent: the player wherever there was no finished card, `formatTip` outside the scenarios that own it, `limiting` without a finished card. The player's 14 "cannot determine" records at `6ed245d297623aec` (the volume slider's empty box at rest) are gone: the slider is measured once disclosed (52 × 48, a 44 px square of hits, 49 of 49 points), so the twelve records with a finished player (S-126 in seven, S-135 in three, S-114 in two) pass. Its two "cannot determine" records are S-127's, at 1280 and 320 px, under M-02's settlement: whether a change is notified (4.1.2, not observed); the overflow button's 2.4.7 (no ring can be isolated); and the inner rings under 2.4.13's area, the second exception left to VH-200 (below). Against the pilot at `2d16e337abe51539`, record by record, no instrument's outcome changed; one row did: S-127's volume ring at 320 px, which passed 2.4.13 by the whole focus redraw (446 px against a 384 px perimeter, the slider's disclosure in it), is under the area by its own pixels (103) and "cannot determine" with the other inner rings (the player's rows: 221 pass, 13 "cannot determine", 76 exempt). S-135's three records pass on the completion's own write, bound to the mutation that drew the card and opening with the page's own "ready" sentence, in English and Chinese. S-76's four subresults pass: the dialog entered, used and left by keys at 320 px, both proxies and the 32 px font, focus back on its opener.

The manifest is `pilot-manifest-2026-10-25.json`, in Phase 7's form:
source commit, the instrument revision and every file's hash, the
provenance pinned when the run was created and whether it held, browser,
its flags and the OS, each view's actual viewport and root font, the
scaling method, the four enlargement categories kept apart, every
fixture by hash, expected and observed keys and their hashes, the
measurements, every capture by hash, and what stayed unresolved; with
the parts' check, the reconciliation, the calibration, the proofs and
the routes' runs beside it.

### The routes, walked whole before VH-199

At the same revision, part 4 whole, part 2's transitions and part 1's
seven route cells (for the journeys' calibration), and the subresults
the pilot does not hold, each in a fresh run directory that pinned the
revision when it was created and held it to the end:

| Run | Records | Whole | Outcome | Measured |
| --- | ---: | --- | --- | ---: |
| `part4-2026-10-26T08-34-34-929Z-5ae852`: part 4, J2 to J4 and K-dialog in Chinese and Malay at 1280 px and English at 320 px, K-player in its four cells | 16 | yes | 16 pass, 403 of 403 steps; `observedKeysSha256` `e7e9580dd4964937` | 384 s |
| `transitions-run-03-2026-10-26T08-41-20-101Z`: part 2's 48 transitions (`--plan run-03`) | 48 | yes | transitions 48 pass; rings 44 pass, 4 not read by design (T-46c and T-46d, save and watchdog: the successor is not a control whose ring is read); none unresolved; keys `c5ed7d541ac7f106`, expected and observed | 1,214 s |
| `part1-part-2026-10-26T09-01-57-182Z-e9247c`: J1 in Chinese, Malay and English at 1280 px and English at 320 px; J2, J3 and J4 in English at 1280 px | 7 | yes | J2 to J4 pass; each J1 "cannot determine" on one step alone, ArrowDown on the native Animation type select (Chrome opens its popup rather than step the value, as Phase 7 recorded); 295 of 299 steps pass | 357 s |
| `m04-small-2026-10-26T09-08-10-431Z-1c8425`: S-132 and S-152's save, S-76's dialog at the 32 px font, 320 px and the 400 % proxy, and S-149's read-failure branch, through `matrix.mjs` with nothing in the walker changed | 6 | yes | subresults: S-132, S-152 and S-76's three pass; S-149 reaches the branch and records focus on the body (a finding, below) | 79 s |

These are qualification runs, kept in the scratchpad; VH-199 walks every
part afresh. Each holds the same outcomes as at `2d16e337abe51539`, record
by record, and none stalled at `2cbba731c59d8036`. At
`2d16e337abe51539`, part 4's first attempt
(`part4-2026-10-26T01-14-34-078Z-4af3d1`) hung at J4 in Malay: after its last file was chosen (`lecture-360s.mp4`,
while it was checked) the page's renderer stopped answering the
protocol (`Runtime.evaluate` and `Page.enable` unanswered, no CPU), a
minute after the same steps passed in Chinese. The walker waits on the
page without a guard, so the run stood rather than failing the record.
It was stopped after 21 minutes, Chrome restarted with a fresh profile,
and part 4 run again whole, above. The cause was not found; a page
`chrome://settings/help` also opened in the browser's default context in
both Chromes, and again in this rerun's, outside the walker's own
contexts. VH-199 should watch for
a part that stops recording and resume it in place.

Readings in them for VH-200, not instrument faults: T-46.1's focused
card runs past the window (292 to 990 px of 900 in English, 255 to 953
px in Chinese and Malay), where VH-176 read it inside (292 to 518 px),
since the player made the card taller; in English forced-dark it read
292 to 676 px this time, as at `2d16e337abe51539` (990 px at
`6ed245d297623aec`), a geometry that
turns on the player's state at the moment of reading. K-player at 320 px
finds full screen under More, the controls Chrome shows at that width.

### The calibration

Each record's measured seconds (its group's setup on the first record,
then its own), against the sizing script's estimate for the same
records:

| Class | Records | Measured | Script's estimate | Ratio | Ratio, added costs apart |
| --- | ---: | ---: | ---: | ---: | ---: |
| carried scenarios (the pilot) | 43 | 313 s | 327 s | 0.957 | 0.902 |
| Phase 8's scenarios (the pilot) | 30 | 267 s | 297 s | 0.898 | 0.799 |
| K-dialog and K-player (the pilot and part 4) | 10 | 95 s | 238 s | 0.401 | 0.401 |
| J1 to J4 (the route runs) | 16 | 675 s | 1,370 s | 0.493 | 0.493 |
| S-140n (the pilot) | 1 | 4 s | 86 s | 0.042 | 0.042 |

Applied by class as the first calibration did, the matrix comes to about
10.3 h. That overstates it: the pilot holds the new costs in a larger
share than the parts do (S-76's four subresults among 43 carried
records, 14 finished players among 30 Phase 8 records), and the ratio
spreads them over every record of the class. Taken as their own, each
measured as the same pilot record's seconds here less at
`6ed245d297623aec`: a finished, unsaved player adds 1.6 s a record
(M-02's targets and author rules), S-127's keys 4.9 s (three readings at
each stop), S-76's dialog subresults 4.5 s (its own setup and the
dialog). Every other record moved 0.17 s (3 %). With the ratios taken
without those costs and the costs added back by count (about 495
records with a finished player, by their scenario's state; 39 of S-127;
8 of S-76's subresults), and S-132, S-152 and S-149's subresults from the
small run above (13.0 s, 8.9 s and 32.6 s a record: within the script's
allotment but S-149's three, 20 s more), the matrix comes to about
**9.8 h** against the script's 11.4 h, as at `2d16e337abe51539` (9.3 h at
`6ed245d297623aec`): about 17 minutes of added cost, 1 minute of it the
subresults, and the 3 % drift; the re-check's changes add no measurable
time. The twelve runs come to between 7 and 66 minutes.

J1 to J4, which the pilot does not hold, are calibrated from the route
runs above; part 2's transitions keep VH-176's measured 1,250 s, which
part 2's run measured again at 1,214 s; S-140 and S-140n block at read
in about 3 s, so their 900 s and 120 s allowances fall to the read. The
calibration is a sample: its carried scenarios are the cheap S-03, S-15
and S-76, and the slow setups (the hour-long still, the real encodes of
S-93, S-123, S-124, S-133) are not in it, so their estimates are scaled
by the nearest class. The script's 11.4 h stays the upper bound to plan
by. The manifest keeps both calibrations (`calibration`, and
`calibration.plainClassRatio`).

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
- **The player, as M-02 settles it** (`player`, S-127 at 1280 and 320
  px, 2 records; `player-proof-2026-10-25.json`):
  - whether play/pause and seek changes are notified to assistive
    technology (4.1.2): the exposed name and value are read from the
    tree around each and follow it; the notification is not observed;
  - the overflow button's 2.4.7: its `-internal-` pseudo-element takes
    no author style, so its ring cannot be isolated from the user
    agent's hover-and-focus highlight; whether that change alone is a
    visible indicator is VH-200's to read;
  - the inner rings under 2.4.13's area, read from each ring's own
    pixels (play, volume, mute, full screen and the time slider at
    1280 px; play, volume, mute and the time slider at 320 px, where
    the volume ring no longer passes on the slider's disclosure): the
    first exception does not hold, since the
    instrument's own author `outline: none` removes each ring; the
    second turns on whether the host's author backdrop
    (`.trim-preview, .result-player { background }`) is the indicator's
    background: VH-200's interpretation.

  Exempt with their reasons, never passes: the overflow button's ring,
  by 2.4.13's first exception (no author selector reaches it), and the
  time slider's 24 px height, by 2.5.5's user-agent exception (no author
  rule sets its size). The volume slider is no longer "cannot
  determine": measured once disclosed (52 × 48), it passes 2.5.5 by hit
  area.
- **Mixed-script lines** in Chinese, where a per-character and a
  CJK-plus-Latin count disagree (`measure`, 8 records): VH-173's reading.
- **One-off readings**: the file button's glyph pixels at the landscape
  view (S-15, the device scale's one-pixel flip VH-176 saw), S-76's
  target at the 400 % proxy (larger than the viewport), and S-140n's
  focus target (no card is made).

And by method, unchanged from Phase 7 unless said: Chrome's own page zoom
at 200 % and 400 % (the proxies stand in); what a screen reader says (the
tree and the DOM log are exposure only); native select popups by keys;
the player's controls a person's Chrome shows at each width (at 320 px
full screen is under More); S-134's back-forward cache in a person's
Chrome; F16 against a production build, which bundles the worker; dialogs
other than Report a problem's at enlargement (S-76's is operated by keys
at 320 px, both proxies and the 32 px font; the other dialog states are
measured there for overflow and clipping); the read failure's exception
path (`src/main.ts:1495–1500`, the inspection request itself failing:
S-149's subresults reach the failed reply, `:1481–1488`, and no fault
makes the request throw); transient states mid-transition; synthetic
text-only enlargement, not run.

## Seen in the pilot, for VH-200 (a finding, not an instrument fault)

- **S-15 at the 32 px default font: step 5's checked output's ring reads
  284 of 304 px²** (2.4.13), so the record's focus fails, at this
  revision as at `6ed245d297623aec`; in VH-176's after-run the same
  record's focus was "cannot determine" from the thumbs alone. VH-188
  changed step 5's names and details. Not judged here; no rank 1 defect
  was seen.
- **S-149's read-failure branch** (M-04's subresults, in the small run
  at this revision, Chinese at 1280 px, light): with focus on a Video
  language radio after a readable file, `notvideo.mp4` is chosen, the
  read fails and the setup steps are withdrawn, and focus goes to the
  body, not to the file input (2.4.3). This is V-46 and VH-178's
  observation, found again by the matrix as Codex astra asked; VH-199's
  S-149 light records will carry it as a failing subresult.

No other record failed in the pilot, the routes or the transitions.

## After Codex astra's method check

Codex astra's method check (`../../codex-astra-method-check-2026-10-25.md`)
found the instruments "Fit after the musts below": four musts and one
should. Each is applied; none was refused. The walker after them is
revision `2d16e337abe51539`; every proof below ran on it, and its
failing case and passing twin are in the files named.

### M-01: no pass on missing or weaker evidence (must)

**Asked.** The runner accepted a bare `{outcome: "pass"}` and a route
passing on `steps: []`, and `keysRoute` passed a route given no steps;
the limiting reader took a job with no plan log as a measured null bite,
read the spoken line from the job's start, and did not require every
title; the footer's measure estimated characters from widths.

**Changed.**

- `runner.mjs:153–187`: `verify` reads each instrument's evidence: rows,
  a route's steps (as many as it was given: `declared`, or the
  declaration's `expects[name].steps`), the document's widths, the
  tree's nodes. A pass needs a counted row passing and none failing; a
  declaration may name the subjects it expects (`expects[name].subjects`).
  `empty-pass`, `evidence` and `no-evidence` problems fail a run.
- `qualify.mjs:636–640`: a route with no steps is "cannot determine",
  and every route reports `declared`.
- `phase8.mjs:758–772` (`biteEvidence`): a logged null bite, a no-plan job
  established by the job's own "encode complete" record (`audioGainDb`
  null), and missing or unreadable evidence are three things; the last
  is "cannot determine", never a null bite.
- `phase8.mjs:714–732` (`spokenAtCompletion`): the completion's own
  write to the status line (the last at or before the finished card, or
  the first after it, within `COMPLETION_MS`, 1 s), never an earlier
  write in the job; `phase8.mjs:786–799`: that write must hold every
  title on the card, the heavy one first, in order. The re-check
  replaced the window with the card's own mutation ("After Codex
  astra's re-check").
- `qualify.mjs:282–284` exposes the qualified rendered-line reader as
  `Q.renderedLines`; `phase8.mjs:655–663` measures the footer by it, a
  mixed line "cannot determine" where the two counts disagree.

**Proved** (`prove-2026-10-25.json`, 85 of 85 at `2d16e337abe51539`: the 77 before and 8 new;
`prove-8-2026-10-25.json`): a bare pass, a route passing on `steps: []`,
`keysRoute` given no steps recorded as a pass, a route short of its
steps, a route with no count, a missing expected subject and a pass over
a failing row each fail a run, beside the whole run that passes;
`heavy-said-early-in-this-job-warning-free-completion-bad`,
`metadata-title-missing-from-the-completion-bad` and Codex astra's own
case (`early-heavy-warning-free-completion-metadata-missing-bad`) fail,
`every-title-in-the-completion-in-order-good` passes;
`no-plan-log-in-this-job-bad`, `unreadable-plan-log-bad` and
`planned-job-plan-log-unseen-bad` are "cannot determine",
`logged-null-bite-good` and `no-plan-job-established-good` pass;
`footer-heading-81-narrow-characters-bad` fails,
`footer-heading-79-wide-characters-good` passes. **Applied.**

### M-02: the player's focus settlement within its qualification (must)

**Asked.** Any changed pixel counted as a visible indicator; the 2.4.13
exception was a selector-text search; reverse traversal counted stops,
not identities; the volume slider stayed "cannot determine: no box";
4.1.2 rested on the media element's state.

**Changed** (`phase8.mjs`):

- `:127–232`: the player's shadow controls reached through the protocol
  (`DOM.describeNode` with pierce, `CSS.getMatchedStylesForNode`,
  `DOM.getNodeForLocation` with user-agent shadow trees, document
  coordinates); `authorRules` reads the author's rules on a control
  where the selector search stood.
- `:247–253` (`visibleVerdict`): 2.4.7 by the ring alone, isolated by an
  author `outline: none` on the control's `::-webkit-media-controls-*`
  pseudo-element, focus and disclosure unchanged; where no author style
  reaches the control (the overflow button's `-internal-` pseudo-element),
  or only a focus-only change other than a ring is left (the user agent's
  hover-and-focus highlight), "cannot determine", for VH-200.
- `:262–283` (`appearanceVerdict`): 2.4.13 by area; short of it, each
  exception by its own evidence: the first refuted where the
  instrument's own author style removed the ring, supported where no
  author selector reaches it; the second from the author's rules on the
  control and on the host's backdrop. The area was then the whole focus
  redraw; the re-check made it the ring's own pixels ("After Codex
  astra's re-check").
- `:284–290` (`occlusionVerdict`; `coverage`, `:209–225`): 2.4.11 and
  2.4.12 by an 8 × 8 hit test for author content over the control, apart
  from the ring.
- `:235–245`, `:179–208`, `:372–412` (`targetVerdict`, `hitArea`, the targets in `playerRows`): 2.5.5 by hit area,
  the volume slider measured once disclosed by hovering the mute button;
  unavailable geometry, an empty box never disclosed and unavailable hit
  evidence are three named "cannot determine"s; the user agent's size
  exception only where no author rule sets the control's size.
- `:291–312`, `:464–504` (`compareStops`, `exposedChange`): Shift+Tab's
  stops held to the inventory by identity; the exposed name (play/pause)
  and value (the time slider) read from the tree around each operation;
  whether a change is notified stays "cannot determine" (not observed).

**Proved** (`prove-8-2026-10-25.json`, 65 of 65 at `2d16e337abe51539`: the 31 before and 34
new, `player-proof-2026-10-25.json`): `player-rings-suppressed-bad` is
not settled as visible, `player-rings-native-good` passes;
`player-ring-restyled-bad` fails 2.4.13 with neither exception,
`player-ring-unmodified-good` and `player-internal-ring-good` take the
second and first exceptions; `player-occluded-bad` fails 2.4.12,
`player-unoccluded-good` passes; `exposed-name-unchanged-bad` and
`exposed-value-unchanged-bad` fail, `player-native-play-good` and
`player-native-seek-good` pass; `reverse-stops-repeat-one-miss-one-bad`
fails, `reverse-stops-native-good` passes; `player-target-author-sized-bad`
fails, `player-volume-disclosed-good` and `player-target-native-good` pass,
each also with the page scrolled. **Applied.** The settlement on this
copy is below ("What stays 'cannot determine'").

### M-03: provenance pinned before a run, transitions too (must)

**Asked.** The source and the instrument revision were computed when the
manifest was written; a resume kept older records unchecked and began
its fixture set again; the transitions' manifest lacked the source,
observed state, fixtures and unresolved readings, and reported rings
inside the transition's pass.

**Changed.**

- `runner.mjs:50–132`: `Run.create` pins the source (commit, uncommitted
  difference to `src/`, `index.html` and `public/` by hash), the
  instrument revision and the declared fixtures by hash in `run.json`;
  `fixtures.jsonl` hashes each fixture at first use and is kept across
  attempts; each record is stamped with its revision; `resume` refuses,
  before anything changes, a changed walker, source or fixture.
- `runner.mjs:241–334`, `:349–364`: `sourceIdentity`,
  `provenanceProblems`, `FixtureLedger`, `unresolvedFrom`; the manifest
  uses the pinned provenance and names drift and any record off the
  revision as problems, so the run is not whole.
- `transitions.mjs:20–30`, `:61–102`, `:122–176`, `:193–212`: the same
  provenance and ledger; the language, mode, viewport and a visible
  page asserted the moment each transition is over; both ring images
  kept by hash; transitions and rings tallied apart; every ring "cannot
  determine" accounted as unresolved.

**Proved** (`prove-resume-2026-10-25.json`, 12 of 12): for the matrix
(a run killed after its first record) and for the transitions, a changed
walker file, a new source commit, an uncommitted source change and a
changed fixture each refuse the resume with the run unchanged; the twin,
unchanged, resumes, keeps the ledger and ends whole. The real walker
refused a resume across a revision the same way during subagent B's
work. **Applied.**

### M-04: the checks the scenario record promises (must)

**Asked.** N14's timing was written as constants; S-132 and S-152 stopped
at the failed player, before the promised save; the dialog was not
operated at enlargement; S-149 could not reach the read-failure branch
behind V-46 and VH-178.

**Changed.**

- `prove-fixtures-8.mjs:45–74`, `:121–137` (`n14Timing`): N14 read from the
  file by `ffprobe` and `ffmpeg`: the first packet (3.688667 s), the
  priming (1,024 samples), the decoded start (3.71 s), each placed end
  on the frame grid as `src/media/kept-range.ts:138–143` snaps it, then
  held to the page's own behaviour (`fixtures-proof-2026-10-25.json`).
- `matrix.mjs:46–54`, `:129–139`, `:182–184`, `:223–224`: a scenario may
  declare `subresults`, run once its state is measured and kept, a
  required instrument where it applies, the record given its own setup.
- `scenarios.mjs:1538–1558`, `:2257–2258`, `:2557–2558`: S-132 and S-152,
  Save completes as S-62 after the failed player;
  `scenarios.mjs:1573–1616`, `:2687–2688`: S-76 at 320 px, both proxies
  and the 32 px font, the dialog entered by Enter, used, and left by
  Escape and by Close, focus back on its opener;
  `scenarios.mjs:1618–1640`, `:2524–2525`: S-149's light records add the
  read-failure branch (`notvideo.mp4` after a readable file, focus on
  Video language) and where focus goes. S-149 itself is unchanged.
- `scenarios.mjs:2247–2250`: S-132's second load leaves an unsaved
  result, so the app's leave warning (`src/main.ts:2372–2383`) raised
  "Leave site?" and the load never returned; the setup accepts that one
  dialog, as F19 does. It would have hung VH-199's S-132 records.

**Proved** (`prove-m04-2026-10-25.json`, 8 of 8): at the 400 % proxy,
`dialog-enlarged-clipped-bad` and `dialog-enlarged-focus-lost-bad` fail,
`dialog-enlarged-good` passes, and `dialog-font32-good` passes;
`save-after-failed-player-refused-bad` (F4e armed in place) fails,
`save-after-failed-player-good` passes; `read-failure-branch-reached`
reaches the branch and records where focus went, and its readable twin
leaves both rows "cannot determine", never a pass. N14 holds on its
measured timing (`fixtures-proof-2026-10-25.json`). **Applied.**

### M-05: visibility as a comparison-method change (should)

**Asked.** Keep the visible-page method, and record that VH-176 measured
timing, media readiness and interaction-triggered paint on later pages
that ran hidden, so a changed measurement is not attributed to Phase 8
by default.

**Changed.** This document only: the rule is in "The visible-page method
change" and in "What VH-199 needs to know". No instrument changed.
**Applied.**

## After Codex astra's re-check

Codex astra's re-check
(`../../codex-astra-method-recheck-2026-10-26.md`, from its brief
`../../codex-astra-method-recheck-brief-2026-10-26.md`) found the
instruments "Not fit": three musts, each rank 1, on M-01 and M-02. Each
is applied; none was refused. The walker after them is revision
`2cbba731c59d8036`; every proof, the pilot and the qualification runs
above ran again on it, and each must's failing cases and passing twin
are in the files named. Its two "may" points need no change: the other
repairs stand as M-01 to M-05 left them, and the stall guard stays with
VH-198.1 for a watched VH-199 run, by the procedure in "What VH-199
needs to know".

### The declarations' `expects` (must, M-01)

**Asked.** No real declaration set `expects`, so a record whose
instrument dropped a subject still passed `verify`; only the synthetic
proof supplied expectations. Wire them into the real declarations and
prove that a dropped subject fails.

**Changed.**

- `matrix.mjs:55–76` (`expectsFor`, `declareRecord`) and `:197`: every
  record a plan declares carries `expects`, read from its own
  declaration: a route's step count; a scenario's focus targets, the
  controls it presses, its own assertions, and its subresults'
  assertions where they apply; the player's seven rows by keys
  (`PLAYER_KEY_ROWS`, `phase8.mjs:887`) where the scenario opts into
  `playerKeys`, and the format "?"'s ten rows (`FORMAT_TIP_ROWS`,
  `phase8.mjs:888`) where it opts into `formatTip`. In the pilot, 74
  records expect their focus targets, 72 their assertions, 23 the "?"'s
  rows, 4 their subresults, 3 a route's steps and 2 the player's rows;
  part 4's 16 expect their steps.
- `runner.mjs:159–172` (`verify`) is unchanged: it already failed a
  record short of its `expects`, matched on a row's what, element,
  selector or control.

**Proved** (`prove-2026-10-25.json`, 93 of 93: the 85 before and 8 new):
from `PLANS.pilot3` and `PLANS.part4`'s own declarations, one record for
each kind of expectation (K-dialog's steps; S-03's focus targets,
assertions and "?" rows, in three of its records; S-76's subresults at
the 32 px font; S-127's player rows at 1280 px): a step or a subject
dropped from each fails the run, the subject named, and the same six
records whole pass (`prove.mjs:252–292`). The proof first took S-03 for
three kinds, and `Run.create` refuses a key declared twice; each kind
now takes a different record, the kind with the fewest records first
(`prove.mjs:258–265`). The pilot, part 4 and every qualification run
were whole with the expectations in place. **Applied.**

### The completion's write bound to the card's mutation (must, M-01)

**Asked.** The completion's write was still found by a one-second window
around the finished card: in memory, a status write 500 ms before the
card holding every title, with no write at the completion, passed every
limiting row. Bind the announcement to the completion's own mutation,
and add that case beside a passing twin.

**Changed.**

- `phase8.mjs:61–69` (`P8_INIT`): each write to the status line is
  recorded with `cardNew`, whether the same mutation batch drew a new
  finished card. The app writes the line in the same task as it draws
  the card (`src/main.ts:3038–3080`, the job's `.then`), so the write
  and the card arrive in one batch.
- `phase8.mjs:728–751` (`spokenAtCompletion`): the completion's write is
  the job's write marked `cardNew`, from the job's start to its finished
  tick, and it must open with the page's own `status.ready`; there is no
  time window (`COMPLETION_MS` is gone). A job whose card came with no
  such write has no completion write, and says why.
- `phase8.mjs:804–819` (`limitingRows`): only that write counts; none is
  a fail, since the app always makes it; a job whose start was not
  watched is "cannot determine".
- `scenarios.mjs:2546`: S-136's assertion reads the same write.

**Proved** (`prove-8-2026-10-25.json`, 72 of 72: the 65 before and 7
new): `prove-8.mjs:142–154` drives a job's last write in one task with
the card, as the app does;
`every-title-500-ms-early-no-completion-write-bad` (Codex astra's case)
and `completion-write-without-the-ready-sentence-bad` fail, and the
one-second window passed both (`windowReadingWouldPass`);
`every-title-in-the-completion-write-500-ms-after-another-good` passes;
M-01's earlier cases keep their outcomes. On the app, S-135's three
pilot records pass on the completion's own write, drawn with the card
(`cardNew`) and opening with the page's "ready" sentence, in English and
Chinese. **Applied.**

### 2.4.13's area: the ring's own pixels (must, M-02)

**Asked.** 2.4.13's area counted the whole focused-against-unfocused
redraw: in memory, an absent ring with enough disclosure redraw passed,
and the suppression proof checked only 2.4.7. Require established ring
pixels, or "cannot determine", and prove the difference. This applies
the WCAG digest's 2.4.13 rule.

**Changed.**

- `phase8.mjs:260–295` (`appearanceVerdict`): the area is `ringArea3`,
  the ring's own pixels at 3:1 (focused with the ring removed by the
  instrument's author `outline: none`, against focused, focus and
  disclosure unchanged), never the whole redraw, which holds the user
  agent's highlight and any disclosure. It passes only where the ring is
  isolated and its pixels reach the 2 px perimeter; where the ring
  cannot be isolated the area is "not established". The exceptions are
  read as M-02 left them.
- `phase8.mjs:558–562` (`playerKeys`): the row carries `areaAt3to1`, the
  ring's, and `redrawAt3to1`, the whole redraw, apart.

**Proved** (`prove-8-2026-10-25.json`): in memory, with an author
backdrop so neither exception settles it,
`appearance-no-ring-disclosure-redraw-bad` (no ring, a 900 px redraw
against a 176 px perimeter) and `appearance-ring-not-isolated-bad` are
"cannot determine", where the redraw reading passed both;
`appearance-ring-over-the-area-good` passes. On the page,
`player-rings-suppressed-2413-bad` (an author `outline: none` on the
player's controls) gives no 2.4.13 pass: each inner control's ring has 0
px of its own, or is not isolated (`prove-8.mjs:317–330`). In this
Chrome that page's redraw is under the area too, so the page case holds
the new reading and the in-memory cases tell it from the old. On the app
(the pilot and `PLANS.vh198proof`), S-127's rows keep their outcomes but
one. The host passes by its ring's own pixels (5,204 against a 5,140 px
perimeter at 1280 px; 1,204 against 1,140 at 320 px); the inner rings
are under the area by theirs (at 1280 px: play 90, volume 102, un-mute
99 and full screen 96, of 368 to 384; the time slider 1,783 of 3,380);
the overflow button's area is not established, and it stays exempt by
the first exception. The volume ring at 320 px, which passed by the
redraw (446 of 384, the slider's disclosure in it), is "cannot
determine" by its own pixels (103 of 384). **Applied.**

## What VH-199 needs to know

- **One revision across all twelve runs.** Every part and run walks at
  `2cbba731c59d8036`, the revision every proof, the pilot and the
  qualification runs above ran at, after Codex astra's re-check. The
  runner pins it with the source and the fixtures when a run is created
  (`runner.mjs:50–132`), stamps every record with it, and the manifest
  names any record off it as a problem, so the run is not whole
  (`runner.mjs:349–364`). A change to the walker after a part has run
  reruns that part.
- **A resume is refused on drift.** `node matrix.mjs --resume <dir>` and
  `node transitions.mjs --resume <dir>` refuse, before anything in the
  run changes, if the walker, the source (its commit or an uncommitted
  change to `src/`, `index.html` or `public/`) or a fixture differs from
  what the run pinned (`runner.mjs:95–130`; `transitions.mjs:59–71`;
  `prove-resume-2026-10-25.json`). The answer is to rerun the part, not
  to edit the run.
- **A record missing an expected subject is not whole.** Each declared
  record carries what it must hold, from its own declaration
  (`matrix.mjs:55–76`): a route's steps, a scenario's focus targets,
  pressed controls and assertions, its subresults' assertions, and the
  player's and the format "?"'s rows where it opts into them. A record
  whose instrument drops one is not whole, nor is its run
  (`runner.mjs:159–172`): find why the subject went missing before the
  part is run again, and never loosen the declaration to pass it.
- **A page that stops answering stalls a run.** The walker waits on the
  page without a guard, so a renderer that stops answering the protocol
  (part 4's first attempt here, "The routes, walked whole before
  VH-199") stalls the run instead of failing its record. Watch each run
  for records that stop arriving; stop it, restart Chrome, and resume
  it in place, which keeps the records already made at the same
  revision.
- **S-132's "Leave site?" is handled.** Its second load leaves an unsaved
  result, so the app's leave warning (`src/main.ts:2372–2383`) raised
  "Leave site?" and the load never returned; the setup now accepts that
  one dialog, as F19 does (`scenarios.mjs:2247–2250`). Without it every
  S-132 record would have hung.
- **S-149's read-failure branch is expected to fail on V-46.** Its light
  records' subresults reach the branch (`notvideo.mp4` after a readable
  file, focus on Video language) and record focus on the body: a
  finding for VH-200 (V-46, VH-178), not an instrument fault. Those
  records are whole with the failure named.
- **The comparison with VH-176's after-run (M-05).** Pass 3 runs every
  page visible; VH-176's later walk pages ran hidden (timers throttled
  to 1 s, media loading deferred). The visible-page method is a
  comparison-method change. Where a measurement of **timing, media
  readiness or interaction-triggered paint** differs from VH-176's, label
  it **"attribution unresolved"** in the comparison ledger, unless a
  small matched baseline probe (the same record on VH-176's build, with
  the pages visible) settles whether Phase 8 or the method made the
  difference. Static geometry comparisons (sizes, positions, overflow,
  contrast of what is drawn at rest) stand as they are.
