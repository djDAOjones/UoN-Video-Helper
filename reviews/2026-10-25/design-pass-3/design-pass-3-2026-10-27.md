# Third design pass — 27 October 2026

PLAN-8 asked for a third whole-page pass on design, UX and accessibility
before Phase 8 closes, "as thorough as before", with Codex astra as a
partner at every stage. This is its report: backlog item VH-201, in
Phase 8. It joins VH-200's draft findings with Codex astra's blind review
(VH-198) into one list, each of Codex's findings verified. Codex then
ranked the findings blind, from the observations alone, and argued with
the merged draft before it was committed. Its findings run on from
Phase 7's (V-40 to V-47). Two earlier IDs come back: V-46, regressed,
and V-18, still incomplete. The new ones are V-48 to V-52.

The owner's rule holds throughout: the app stays simple, with no new
control, checkbox or element, and the progress bar stays. It limits the
remedies, never the report.

## Verdict

The Phase 8 page holds together as one design and one journey. At most
one filled action leads each state, and it is the right one; while a job
runs there is none, and Cancel is secondary. Every text
element is on a type role (19,138 rows in 3,183 records, none failing),
and every Phase 8 string matches the approved sheet. The run read 3,207
records and 48 transitions in three languages, eleven views and eight
modes. Of the Phase 8 contract's eighteen rows, 12 hold, 5 are partial
with their gap named, and one regressed (VH-191). Phase 7's fixes hold,
but for V-46 on new ground.

Phase 8 made the page taller where it added something to read or use:
the steps by about 158 px for Video language, the finished card by about
472 px for its player, and the statement by about 288 px (VH-137's
update and VH-182's contact line, not separable). The empty page is
78 px shorter: about 194 px came off above the file button, the lede
(VH-187, VH-196) and Video language leaving the top (VH-191), not
separable, and the footer's group added about 116 px below it, by
subtraction.

What does not hold is narrow: one misleading notice, a warning placed
after the action it informs, a focus loss, two small focus rings, the
first action still below the first screen in places, and, at rank 3, a
sideways scroll at a large font on a phone width.

- **The no-audio notice is untrue for a kept part with a little real
  sound** (V-51, from Codex's D-05, rank 1). A kept part with under
  400 ms of decoded sound is told "This video has no audio", and the new
  video leaves that sound out. The notice comes before Create, so the
  loss is not silent, but the cause it states is false.
- **The heavy-limiting advice comes after the player and Save** (V-52,
  from Codex's D-06), and the completion line speaks only its heading.
- **Focus is dropped when an unreadable file withdraws the step that
  holds it** (V-46, regressed). VH-191 moved Video language into that
  step; the hand-on was VH-178's omission (S-149 ×3).
- **Two focus rings fall short:** the onset "?" at a 32 px default font
  (V-48), and the wrapped "Creators team" link in the forced palettes
  (V-49).
- **The first action** is now inside the first screen at 1280 × 900 in
  English and Chinese, but not in Malay or at 320 px (V-18, incomplete).
- **One rank 3 point:** at a 32 px default font in a phone-width window,
  controls and one heading push the page sideways (V-50).

7 findings: 1 at rank 1, 5 at rank 2 (two of them under their old IDs)
and 1 at rank 3. None needs a new control, checkbox or element. V-51's
words are the owner's to approve, and VH-202 puts them to him. Codex
astra, ranking blind from the observations alone, gave the same rank to
six of the seven; V-50's rank, and whether the warning's guidance when
the finished video cannot play is a finding, are for the owner.

The WCAG judgement is scoped to what was measured, and it is not a
conformance claim: 35 met, 10 met in source, 17 n-a, 2 defects (2.4.3,
2.4.13), 11 accepted limitations and 11 missing evidence. The missing
evidence is named below and carried to VH-203's after-run unchanged.

## How it was done

Five stages, each with its own record in this folder:

- **Codex astra's blind review** (VH-198,
  [`codex-astra-blind-review-2026-10-25.md`](codex-astra-blind-review-2026-10-25.md)).
  It ran first, `codex exec -m gpt-6-astra -s read-only`, against a
  `git archive` export of `099949c` outside the checkout, from
  [`codex-astra-blind-brief-2026-10-25.md`](codex-astra-blind-brief-2026-10-25.md).
  Two new findings, D-05 and D-06, and V-46's incomplete fix, with
  source-only verdicts on Nielsen, the contract and WCAG.
- **The instruments** (VH-198,
  [`evidence/measurements/instruments-2026-10-25.md`](evidence/measurements/instruments-2026-10-25.md)).
  The walker extended for Phase 8's player, second "?", footer headings,
  limiting warning and Video language, re-proved and qualified at
  revision `2e7b0c044ce11f2b`, with Codex astra's method check and three
  re-checks, the last "Fit for VH-199".
- **The evidence run** (VH-199,
  [`evidence/measurements/matrix-2026-10-27.md`](evidence/measurements/matrix-2026-10-27.md)).
  Twelve runs on `a3039c3` in Chrome 156.0.8078.48, Vite at
  `localhost:5181`, every page walked visible. Eighteen digests and the
  contract table
  ([`contract-2026-10-27.md`](evidence/measurements/contract-2026-10-27.md)),
  which Codex drafted blind and Claude compared
  ([`contract-compare-2026-10-27.md`](contract-compare-2026-10-27.md)).
- **The judgement** (VH-200,
  [`judged-2026-10-27.md`](judged-2026-10-27.md),
  [`wcag-2026-10-27.md`](wcag-2026-10-27.md)). The four journeys, Carbon,
  Nielsen's ten and the 86 WCAG criteria, from the run's evidence. Codex
  gave blind attributions of the held rows, blind verdicts on VH-205's
  "?" and blind WCAG and finding verdicts, each compared
  ([`attrib-compare-2026-10-27.md`](attrib-compare-2026-10-27.md),
  [`vh205-compare-2026-10-27.md`](vh205-compare-2026-10-27.md),
  [`wcag-compare-2026-10-27.md`](wcag-compare-2026-10-27.md)).
- **The merge** (VH-201, this file). Each of Codex's findings verified;
  Codex's blind ranking from a neutral sheet, compared; Codex's critique
  of the draft.

**Coverage, from the manifest.** 3,207 of 3,219 records are whole, and
48 of 48 transitions (`matrix-coverage-2026-10-27.json`): 3,255
observed of the 3,267 VH-198 declared, which is at least the 3,266
VH-197 approved, so the plan was not reduced; the 12 missing are the
accepted gaps. Every counted record carries revision `2e7b0c044ce11f2b`,
source `a3039c3` and Chrome 156.0.8078.48. By class, observed of
expected:

- languages: en-GB 1,321 of 1,325, zh-Hans 947 of 951, ms-MY 939 of 943;
- views: 1280 px 1,711 of 1,720, 375 px 437, 320 px 946 of 949,
  landscape 16, short height 16, the 200% proxy 32, the 400% proxy 34,
  and 640, 401, 400 and 800 px 3, 6, 3 and 3;
- modes: light 1,521 of 1,527, dark 289, forced-light 289, forced-dark
  289, text spacing 323, reduced motion 70, fallback faces 204 of 210,
  the 32 px font 222.

The 24 route records carry only keys (and motion where declared), so the
page instruments count 3,183 records. Against Phase 7's 699, every class
holds or grows.

**Unresolved, kept as such.** No verdict here extends to them. Each is
carried unchanged to VH-203's after-run, on the walker fixed by wishes
VH-199.1, VH-205.1 and VH-200.1:

- **The four gaps the owner accepted,** 12 records and one assert:
  S-107 `fallback` ×3; S-55c `fallback` ×3; S-92 and S-93's check count
  (×31 and ×6, the walker's counter); S-133 ×6, not recorded. The
  owner's rulings are quoted in VH-199's decision.
- **The finish+1s player row,** all 823 rows, 769 nominal passes
  included: neither pass nor fail.
- **VH-200.1's three readings:** the 32 px radio's ring against its
  disc, not its box; S-81's wrapped statement link by its fragments'
  perimeter; each player control's ring (S-127) against its actual
  background.
- **VH-205's "?"**, built after the run on the owner's word: its target
  and ring (VH-205.1). Its verdicts keep their labels: "manually checked
  in VH-205" for 2.4.7, 1.4.4 and 1.4.10 in the stated conditions;
  "missing" for 1.4.12 and forced colours; for 2.5.5 and 2.5.8, "manually
  checked in VH-205", two hit points at 1024 px in light, and "to be
  measured in VH-203's after-run"; for 2.4.13, "to be measured in
  VH-203's after-run".
- **1.4.3 and 1.4.6:** the file button's words at the 32 px font,
  S-113 ×6, whose changed pixels are not glyphs alone
  (`digest-contrastExtra-2026-10-27.md:38`). VH-203's after-run re-reads
  S-113 for these and for V-50.
- **VH-185's output tracks,** unread: "no audio track" is inferred from
  the empty plan. And a kept sliver of audible sound under 400 ms, which
  no scenario walked (V-51).
- **V-46's J4 case,** with a finished video standing: no scenario.
- **V-18 at HEAD:** the file button's place after VH-205, unmeasured.
- The additions to VH-203's after-run (a kept sliver of audible sound
  with the output's tracks read, V-46's J4 case, S-113 re-read, V-18 at
  HEAD) are wish VH-201.2.
- **The player by keys and a screen reader:** S-127's 39 focus-visible
  and 39 change-notification rows; F15b's 12 intended failures.
- **17 target rows "cannot determine"** with no exception established
  (S-113's 16 at the 32 px font; S-76's field at the 400% proxy), none
  read under 44 px.
- **214 cells of `PLANS.matrix`** still unrun, by class in the matrix
  file: wish VH-172.1, narrowed.
- **Create's place in the ready state** was not read.
- **Read in VH-200 as missing, not re-read here** (`judged-2026-10-27.md`):
  the per-relation gap inventory, so a gap Phase 8 moved, Video
  language's and the player's included (`:354–359`); a tally per type
  role, so whether each drawn role still appears and whether the code
  role is drawn at all (`:407–410`, wish VH-173.1); the chosen and
  unchosen segments' widths (`:468–470`); the player's brand-blue
  letterbox under forced colours (`:505–508`); the heavy-limiting
  warning's own position (`:200–203`); the 21 px English ready states
  carry over Chinese and Malay, unattributed (`:109`); and the widest
  Latin line's count (`:434–435`).
- **The run's conditions** (`matrix-2026-10-27.md`, "Conditions"): run-01
  on battery in Low Power, run-11's later records and run-12 in High
  Power, and other projects' load; the visible-page method, a change
  against VH-176's hidden pages. A timing, readiness or paint difference
  from VH-176 is "attribution unresolved"; static geometry stands. Kept
  from Phase 7: real zoom (the proxies stand in), speech (exposure only),
  native popups by keys, the range paint, and the 375 px view read as a
  computer by the page's own signal.

**What only a person can settle.** Chrome's own zoom (the protocol sets
proxies), what a screen reader says, real phones, speech input, real
Windows contrast themes, text spacing by a person's own tool, and Chinese
and Malay read by native readers. The
[person checklist](person-checklist-2026-10-27.md) carries each as a
task, A to N; it stays its own file. Its task N names V-51 and V-52 by
their draft IDs, D-05 and D-06.

**Checks for this report.** No page was walked and no probe run. Codex's
D-05 and D-06 were verified in source at `86b1200`, whose `src/` is
`a3039c3`'s but for VH-205's stylesheet, and in the run's own records
under `/Users/joe/UoN-Video-Helper-evidence/pass3-vh199/runs/`: S-135's
accessibility tree and completion line for D-06, and S-99's tree for
D-05.

Codex astra's three, by number:

| Codex | Verified | Finding |
| --- | --- | --- |
| D-05, VH-185 calls omitted sound "no audio" | In source and by the unit tests (`src/media/audio-plan.ts:115–121`; `src/media/sub-block-sound.test.ts:61–70`, `:97–110`); the notice read in the run (S-99 ×31), on N8a's sliver of encoder priming. A kept sliver of audible sound was not walked | V-51, its own |
| D-06, VH-193's advice after the action | In source (`src/main.ts:3285`, `3327`, `3494–3497`; `src/ui/announce.ts:40–46`), and in S-135's records: the tree's order and the completion line | V-52, its own |
| V-46 / VH-178, unreadable replacements withdraw focused controls | Live in the run (S-149 ×3), and in source (`src/main.ts:1486`, `1500` against `:1590–1596`) | V-46, regressed |

D-05 and D-06 found what VH-200's own reading did not, so each keeps its
own number, as D-01 and D-04 did in Phase 7. Codex's V-46 is the
regression VH-199 measured, merged under the old ID. None is set aside.
Codex's "What only a browser or a person can settle" names no finding;
its points stay with the checklist and the after-run.

## Findings

### V-51 A kept part with a little real sound is told "This video has no audio" — rank 1

**Saw.** VH-185's rule makes a trimmed part a silent keep when its
decoded sound lasts under one 400 ms gating block:
`traversal.decodedFrames / sampleRate < BLOCK_SECONDS`
(`src/media/audio-plan.ts:120`), where decoded frames are sound, never
gap-fill (`:103`). The job then writes no audio track. Before Create,
the page says "This video has no audio" and "There is no audio to level,
so the rest of the job runs without it. If you expected audio, check the
recording before publishing." (`src/i18n/en-GB.ts:670–674`;
`zh-Hans.ts:551`, `ms-MY.ts:590`).

- The rule counts any decoded sound, not only an encoder's priming. The
  unit tests make 50 ms of generated sound a silent keep
  (`src/media/sub-block-sound.test.ts:61–70`), and 390 ms as asked
  (`:97–110`).
- So a person who hears sound in the preview is told the recording has
  none, and the advice to check the recording sends them to the wrong
  place.
- The run reached the notice ×31 (S-99) and finished the job silent
  (S-100 ×6, 0:00.0 to 0:04.0 kept, no plan). S-99's fixture keeps 21.3 ms
  of encoder priming, VH-185's own case. A kept sliver of audible sound
  was not walked; it takes the same branch. The output's tracks were not
  read.
- The source stays safe, and the notice comes before processing, so this
  is not silent loss.

**Standard.** Nielsen 1, 2 and 9; UI-STANDARDS, Error prevention and
recovery ("Error messages must say what happened and what to do next").
VH-185's own criterion asks for the owner's words if the sentence is
untrue for this case (`project/items/VH-185.md:9`). Rank 1: misled.

**Direction.** Words, which the owner approves, that tell a kept part
with under 400 ms of sound apart from audio that is really absent. For
this branch only, the existing notice must carry three things: the
cause, that the part kept holds too little sound to level; the
consequence, that the new video leaves it out; and a recovery that
applies. Keeping more of the original is that recovery only where it
keeps more of the file's sound, since the rule counts decoded sound, not
kept time (`src/media/audio-plan.ts:104–120`). Genuinely absent audio
keeps today's words.

- Today the worker reduces every silent result to no analysis
  (`src/workers/job.worker.ts:535`), and the warning builder gives both
  cases one `no-audio` code (`src/audio/warnings.ts:92`). One string
  cannot tell them apart, so the fix carries the omission's reason into
  the existing warning: the smallest code change, with no new element.
- No control is added, and the 400 ms threshold stays unless the owner
  changes it (For the owner, 1).
- The owner has approved no wording yet. VH-202 puts the words to him, in
  three languages, and this report does not draft them.
- S-102, an untrimmed file under 400 ms, stays wish VH-185.1.

**Source.** `src/media/audio-plan.ts:103`, `115–121`, `347`;
`src/media/sub-block-sound.test.ts:61`, `97`; `src/i18n/en-GB.ts:670–674`.
**From:** Codex D-05, verified in source and by the tests. **Evidence:**
S-99 en-GB w1280 light (run-09), the tree's nodes 538–539; S-100's
asserts; the contract's VH-185 row.

### V-52 The heavy-limiting warning's advice comes after the action it informs — rank 2

**Saw.** B11's warning ends "…so play the new video before you save it."
(`src/i18n/en-GB.ts:722`). The finished card holds its lines, the player
and the lifetime line (`src/main.ts:3285`), then Save in its actions row
(`:3494–3497`); the warnings follow the whole card
(`processResult.replaceChildren(heading, resultWarnings)`, `:3327`).

- In S-135's records (en-GB w1280 light, run-04), the accessibility tree
  reads the region "Finished video — 7.5 MB", its lines, the Video, "It is
  not saved yet…", "Save the video", and only then the region "Worth
  knowing about the finished video" with "The loudest moments were held
  down hard" and its detail.
- The completion's live-region write contained "Your video is ready.
  Worth knowing about the finished video: The loudest moments were held
  down hard." This is exposure, not speech; what a screen reader says is
  the checklist's task A. `warningsSpoken` gives each warning's heading only
  (`src/ui/announce.ts:40–46`).
- A save then removes the player (VH-192; S-131 ×6), so the advice to
  play the video in the page can no longer be taken.
- The warning is first among the warnings and word for word, before and
  after a save, with Announce progress off (S-135 to S-138, S-151).

**Standard.** Nielsen 5 and 6; UI-STANDARDS, Recognition over recall.
Not a 3.3.3 failure, since this is an output advisory. Rank 2.

**Direction.** The existing warnings come before the player and Save in
the card's reading order, in one notification treatment. The completion
line includes the existing listening sentence. Save stays available, and
VH-193's unchanged-after-save decision (the owner's 1A and 2A) stands. No
new element. The fix's check includes F15b's state, where the player
cannot play and the warning stands (S-152), since Codex's blind ranking
asks for its guidance there (For the owner, 3).

**Source.** `src/main.ts:3073–3078`, `3285`, `3288`, `3327`,
`3494–3497`; `src/ui/announce.ts:40–46`; `src/i18n/en-GB.ts:719–723`.
**From:** Codex D-06, verified in source and in S-135's records.

### V-46 Focus is dropped when an unreadable file withdraws the step that holds it — rank 2, regressed

**Saw.** With focus on a Video language radio, choosing an unreadable
file after a readable one leaves focus on `body` (S-149's light records,
×3, three languages: `trimHidden` and `titleHidden` true, no focus move).

- Both read-failure paths call `clearTrim('unreadable')`
  (`src/main.ts:1486`, `1500`), which withdraws the setup steps with no
  `focusHeldBy` capture and no successor. The blocking branch has both
  (`:1590–1596`).
- VH-191 (`3c20550`) moved Video language into `#step-title`; before
  it, the radios sat beside Video type, outside the steps (`index.html:88`
  at `ec26c49`). The contract reports this as VH-191's regression.
- The omission itself is VH-178's: its hand-on was never applied to the
  read-failure paths, as Codex's blind review found in source before the
  run.
- The title-card fields and any focused control in steps 2 to 5 share
  the path. The blind review's J4 case, with a result standing, has no
  scenario: missing evidence.

**Standard.** WCAG 2.4.3; spec §9.3's rule that a transition removing
the focused control names its successor (`docs/01-specification.md:717`).
Rank 2: focus is lost, no work is.

**Direction.** Apply the existing `focusHeldBy` / `stepsWithdrawnBy`
pattern before both read-failure withdrawals, the failed reply and the
exception, and hand displaced focus to the file chooser. Focus held
elsewhere, and in the feedback dialog, stays where it is. The fix's check
covers the J4 case. No new element.

**Source.** `src/main.ts:1486`, `1500`, `1590–1596`; `src/ui/focus-hand-on.ts`.
**From:** Codex V-46 (originally D-01), live in the run. **Evidence:**
`digest-subresults-2026-10-27.md:32`; the contract's VH-191 row.

### V-48 At a 32 px default font, the onset "?"'s ring falls short — rank 2

**Saw.** `#onset-help-button`, an author-styled button (`index.html:463–470`,
`.help-button`, `src/styles/app.css:1086`), draws 460 of the 464 px² its
44 × 76 box needs at 3:1, with 528 px changed, in one record:
`S-113__ms-MY__w320__font32` (`digest-focus-2026-10-27.md:35`). There is
no earlier reading in that condition.

- Where the 4 px² goes is not located. The record is one where S-113's
  page already scrolls sideways (V-50).
- The 32 px output radio's reading (284 of 304 px², ×10) is not part of
  this finding: its reference is a box where the control is a disc (Set
  aside, below).

**Standard.** WCAG 2.4.13, at the larger default font UI-STANDARDS names
among its conditions (VH-194). Rank 2, as Phase 7 ranked every 2.4.13
failure (V-40 to V-42).

**Direction.** The fix plan finds where the pixels go, clipped by the
sideways overflow or crossing the label's glyphs, and gives the ring room
with the existing focus tokens. No new element. VH-203's after-run
re-reads it.

**Source.** `digest-focus-2026-10-27.md:35`; the contract's VH-189 row.
**From:** VH-200, with Codex astra's blind attribution (`attrib-compare-2026-10-27.md`).

### V-49 In a forced palette, the wrapped "Creators team" link's ring is lost over the next link — rank 2

**Saw.** `#contact-creators` (VH-182's footer group) wraps inside its
`inline-flex` box (`src/styles/app.css:210–215`) in the forced palettes:
S-83 and S-145, en-GB w320 and ms-MY w1280, forced light and dark, ×8.
Its ring draws 1,108 of 1,264 px² (272 × 48) and 1,595 of 1,968
(448 × 48) at 3:1. The ring's lower edge runs over the next link's text,
which under a forced palette is a system colour not 3:1 from the ring
(`vh199-compare-run-07.md:25`). Outside forced colours, and on one line,
it passes. There is no earlier reading on these keys.

**Standard.** WCAG 2.4.13 under forced colours. Rank 2, as V-42 was.

**Direction.** The footer group's links are spaced by the existing
spacing tokens so that a ring clears the next link's text, or the ring
sits inside the link's box. Either is CSS only, with no new element. Real
Windows themes stay a person's check (task D).

**Source.** `digest-focus-2026-10-27.md:34`; the contract's VH-182 row.
**From:** VH-200, with Codex astra's blind attribution.

### V-18 The first action is inside the first screen in English and Chinese at 1280, and still not in Malay or at 320 px — rank 2, incomplete

**Saw.** The file button's painted top and bottom
(`readings-2026-10-27/rings-179-v18.json`; the contract's VH-179 row):

- **1280 × 900:** 650–694 px in English, 800–844 in Chinese, 890–934 in
  Malay. Malay crosses the 900 px fold by 34 px.
- **320 × 568:** 950–994, 1,045–1,089 and 1,287–1,331 px. All three are
  below the first screen.

Each is higher than VH-176's after-run (844–888, 994–1,038 and
1,081–1,125 at 1280; 1,185–1,229, 1,259–1,303 and 1,543–1,587 at 320).
VH-187 and VH-196 lifted it, though the five promises are longer than
the three they replaced. These readings are at `a3039c3`, before VH-205,
which took the fourth promise's row from 44 to 24 px by its manual
readings. At HEAD the button sits about 20 px higher, by subtraction and
unmeasured, so Malay at 1280 × 900 would still cross the fold by about
14 px. VH-203's after-run reads it at HEAD (Codex's blind ranking).

**Standard.** Nielsen 8; UI-STANDARDS, Minimalist design. Rank 2, as
V-18 was, since this is the same ground, narrowed and not yet closed.

**Direction.** The owner accepted V-18 in Phase 7 on his standing
instruction, with a shorter native wording above step 1 as its route
(wish VH-175.4). The page's structure is his. No new element.

**Source.** The contract's VH-179 row; `judged-2026-10-27.md`, "Page
height per state". **From:** Phase 7 (`../../2026-10-22/design-pass-2/design-pass-2-2026-10-23.md`).

### V-50 At a 32 px default font in a phone-width window, the page scrolls sideways — rank 3

**Saw.** S-113 at the 32 px font scrolls sideways in all six of its 320
and 401 px records, in all three languages, to 444–528 px
(`digest-overflow-2026-10-27.md:20`, `:32–36`). The records' own
offender lists name more than the digest's grouped rows (Codex's
critique, R-03):

- the page language switcher's "Bahasa Malaysia" and Video language's
  "Bahasa Malaysia", at 320 px in all three languages;
- Video type's student-submission choice, at 320 px in English and Malay;
- the trim's **Set start here** and **Set end here**, at 320 px in all
  three languages and at 401 px in Malay, where the page reaches 528 px;
- the closing colour "White", at 401 px in all three languages and at
  320 px in Chinese;
- the statement's heading, "Kenyataan kebolehcapaian", at 401 px in
  Malay, to 448 px.

Its scenario expects step 4's two selects to clip at 401 px and below
(wish VH-189.1), not these controls. Nothing else scrolls: 3,177 of
3,183 page records pass, the 32 px font at 1280 px among them. V-48's
one record is among the six.

**Standard.** No WCAG failure is established: 1.4.10's condition is
320 CSS px at the default text size; 1.4.4 allows scrolling; 1.4.8 (e) is
read on a full-screen window; spec §9.3 names text enlargement and reflow
at 320 px separately (`docs/01-specification.md:703–704`); UI-STANDARDS
names the larger default font for 2.4.13 alone. Rank 3 in VH-200's draft
and Claude's ranks, as V-44 was in Phase 7; Codex's blind ranking gives
rank 2 for real friction. The rank is the owner's (For the owner, 2).

**Direction.** Every affected control and heading keeps its text inside
the column at that font, across all six records, with the existing
tokens. CSS only, no new element; neither moving the switchers nor
rewording the statement follows. Step 4's selects stay with wish
VH-189.1. VH-203's after-run re-reads S-113.

**Source.** `digest-overflow-2026-10-27.md:20`, `:32–36`; wish VH-189.1.
**From:** VH-200, on Codex astra's close check (its must 2).

## The Phase 8 contract

Measured in VH-199
([`contract-2026-10-27.md`](evidence/measurements/contract-2026-10-27.md)):
12 hold, 5 partial, 1 regressed, none unverified. Codex drafted the table
blind; seven verdicts differed and each was settled on the evidence
([`contract-compare-2026-10-27.md`](contract-compare-2026-10-27.md)).
VH-200 judged every row the contract held for it; the last column says
where each went.

| Item | VH-199 | Held for VH-200, and where it went |
| --- | --- | --- |
| VH-182, the footer's routes | Partial | S-81's wrapped statement link: the instrument's box, missing evidence (VH-200.1). `#contact-creators` in the forced palettes: V-49 |
| VH-183, the trim's Page step | Partial | The one-check rule: the walker's counter, an accepted gap (VH-199.1) |
| VH-184, the onset tip | Holds | — |
| VH-185, a kept sliver as no sound | Partial | The output's tracks unread: missing evidence. Codex's D-05: V-51, rank 1 |
| VH-186, the System check's labels | Holds | — |
| VH-187, the top of the page | Holds | S-107 `fallback` ×3, an accepted gap |
| VH-188, the outputs' names | Partial | The 32 px radio ring: the instrument's box, missing evidence (VH-200.1) |
| VH-189, step 4's labels | Holds | The onset "?" at 460 of 464: V-48. S-113's selects: VH-189.1 |
| VH-190, "Create the video again" | Holds | — |
| VH-191, Video language at the top of step 3 | Regressed | S-149's read-failure branch: V-46, regressed |
| VH-192, the player in the card | Partial | The finish+1s rows, S-133 ×6 and S-127's controls: missing evidence (VH-199.1, VH-200.1). F15b's host name: no finding |
| VH-193, the heavy-limiting warning | Holds | Its place against the player and Save: V-52, from source and S-135's tree |
| VH-194, spec §9.3 and UI-STANDARDS | Holds | — |
| VH-196, the lede's promises and "?" | Holds | The format "?" at 44 px, the owner's own finding, fixed by VH-205 |
| VH-178 / V-46 | Holds | VH-178's own cases, 48 of 48 transitions. S-149 is VH-191's row |
| VH-179 / V-40 to V-42, V-33, V-44, V-18 | Holds | V-18 narrowed, still incomplete |
| VH-180 / V-47 | Holds | — |
| VH-181 / V-45 | Holds | — |

## The journeys

Judged in full in [`judged-2026-10-27.md`](judged-2026-10-27.md), "The
journeys", with each state's page height against VH-176's after-run. In
short:

- **J1, a staff video.** At most one filled action per state, the right
  one, and none while a job runs; nothing to decide before Create; DOM order the visual order. The first
  action is in the first screen at 1280 in English and Chinese (V-18).
  The finished card is 698 px tall with its player, so Save sits below
  the first screen at 1280 × 900. A kept sliver of real sound is told
  "no audio" (V-51), and the heavy-limiting advice follows Save (V-52).
- **J2, a student submission.** The card's rule comes before Create can
  refuse; four required fields, each named; values survive the type
  switch and the dialog; step 3 reads heading, lock note, Video language,
  then the card.
- **J3, recovery.** Each failure names its one next step, the button it
  names on screen, and two Report a problem buttons open one dialog. By
  keys J3 passes. An unreadable file chosen from Video language drops
  focus to the page (V-46).
- **J4, a second video beside a kept result.** Save on the previous video
  stays the one filled action; at most two decisions; the previous video
  keeps its own warnings and player. V-46's J4 case is not in the
  evidence.

## Nielsen and WCAG

**Nielsen's ten** are judged in `judged-2026-10-27.md`, "UX, Nielsen's
ten": five partial (1, 2, 5, 6 and 9) and five holding, 8 with V-18 as
its exception. The merge changes no verdict. 1 (status) and 2 (the real
world) carry V-51; 5 (prevention) and 6 (recognition) carry V-52; 9
(recovery) carries V-46 and V-51. Codex's blind review had six partial;
the one departure is 3, where V-46 takes no way out away and is counted
under 9 and 2.4.3, as Phase 7 counted D-01.

**The 86 WCAG criteria** are judged in
[`wcag-2026-10-27.md`](wcag-2026-10-27.md): 35 met, 10 met in source, 17
n-a, and 24 gaps. 2 are defects: 2.4.3 (V-46, regressed) and 2.4.13
(V-48, V-49, with a missing-evidence part for the player). 11 are
accepted limitations: 1.2.1–1.2.3 and 1.2.5–1.2.8, 2.3.1, 2.3.2, 2.5.3
(V-43) and 3.1.4. 11 are missing evidence: 1.4.3, 1.4.6, 1.4.11, 2.1.1,
2.1.3, 2.4.7, 2.5.5, 2.5.8, 3.1.3, 3.1.5 and 4.1.2.

- Against 23 October, 1.4.3, 1.4.6, 2.4.7, 4.1.2, 2.5.5 and 2.5.8 went
  from met to missing evidence. None is a regression of the page; each
  rests on a reading the run could not take.
- 1.4.11 went from a defect to missing evidence: V-41 holds, and V-49 is
  judged at 2.4.13.
- V-51, V-52 and V-50 are not WCAG failures.

**1.4.8** stays met on the reading stated, part by part
(`judged-2026-10-27.md`, "1.4.8, the five parts"; the WCAG table's rows
80 to 85). Its width part rests, as in Phase 7, on G204: the `28rem`
measure yields to its container, and reflow passes in 3,177 of 3,183
records. The house's weighted count, recorded in UI-STANDARDS since
VH-179, passes every line; read strictly, the 721 mixed-script rows fail,
and that reading stays unresolved.

## What held up

- **One design.** At most one filled action leads each state, and it is
  the right one; while a job runs there is none, and Cancel is secondary.
  One notification anatomy for verdicts, warnings, failures
  and the result. The two "?" share one look, and their sizes follow
  their places by the owner's word.
- **The type roles.** 19,138 rows in 3,183 records, every one on a role,
  none failing, with the brand faces withheld (204 records), at the
  32 px font (222) and under text spacing (323). Phase 8's new text
  reuses the roles.
- **The words.** Every Phase 8 string matches the approved sheet; each
  table has 521 string leaves with the same keys and placeholders; step
  4's one name and the outputs' names hold, with old names in none of
  the 3,207 records.
- **The Phase 8 items.** VH-184, VH-186, VH-187, VH-189, VH-190, VH-193,
  VH-194 and VH-196 hold against their contract musts, VH-189 and VH-193
  with V-48 and V-52 beside them as new ground; VH-182, VH-183, VH-185,
  VH-188 and VH-192 hold where read, with their gaps named.
- **Phase 7's fixes.** V-40 to V-42, V-33, V-44, V-45 and V-47 hold, and
  V-46 holds in VH-178's own cases (48 of 48 transitions).
- **Measured, in scope.** Reflow: 3,177 of 3,183 page records with no
  sideways scroll, the six the V-50 records. Keys, in light mode only:
  716 route steps pass, 4 "cannot determine" at the native select. 2.4.11 and 2.4.12: no focus
  obscured, the 698 px finished card included. The player: paused, no
  autoplay (S-126 ×39), one object URL (S-129 ×31), revoked on a save
  (S-131 ×6), named by the card's title.
- **Codex's What held up,** checked against the run: the footer's
  hierarchy, the shared toggletips, the moved Video language control, the
  result's identity and the languages' parity hold, but for V-46.
- **The progress bar.** It stays, essential (spec §9).

## Set aside, with reasons

- **The 32 px output radio's ring** (284 of 304 px², ×10). The walker's
  reference is the box's `4(w + h) − 16`; the control is a native radio,
  a 40 px disc whose 2 px perimeter is about 239 px², so the ring passes
  against what it rings. Missing evidence until the disc is read
  (VH-200.1). Codex's attribution, taken on the source.
- **S-81's wrapped statement link** (1,361 of 1,865 px², ×11). 2.4.13's
  perimeter follows the link's fragments, not their enclosing box, and
  every pixel the ring draws is at 3:1. Missing evidence (VH-200.1).
- **S-127's player rings.** The first exception does not hold for the
  inner controls, since author CSS reaches them; the second is neither
  shown nor disproved, because the walker read the host's backdrop, not
  the background behind each ring. Missing evidence (VH-200.1), and a
  person's check (task I).
- **F15b's host named "Unable to play media."** Chrome's own name for a
  media element that failed under the fault; the app's `aria-labelledby`
  is right (`src/main.ts:2882`). A failed finished playback outside the
  fault is a person's check (task I).
- **The format "?" (VH-196 → VH-205).** The owner's own finding, the
  before in this run, fixed on his word; VH-202 plans nothing for it, so
  it keeps no V-number. Its labelled verdicts are in
  `vh205-compare-2026-10-27.md`.
- **The finished card past the window** (T-46.1, 862 × 698 px at
  1280 × 900). No author content covers it, so it does not fail 2.4.11 or
  2.4.12.
- **Step 4's selects at the 32 px font,** clipped at 401 px and below:
  VH-189's recorded limitation, wish VH-189.1.
- **"Adds opening and closing graphics."** The owner's own words (VH-196).
- **The Malay "?" label** that does not echo its field: for the native
  readers, wish VH-143.4.
- **What the blind review set aside,** kept so: earlier defects keep
  their identities; reserved owner decisions stay reserved; the
  statement's words are VH-137's; existing follow-ups (VH-186.1, VH-189.1,
  VH-185.1, VH-193.3) are not rediscovered; accepted limitations are not
  passes.
- **Full conformance or release approval.** Neither follows from this
  report.

## Beside Codex astra's blind ranking

Claude saved its merge and ranks first
([`ranks-claude-2026-10-27.md`](ranks-claude-2026-10-27.md)). Codex then
ranked every finding from a neutral sheet
([`findings-neutral-2026-10-27.md`](findings-neutral-2026-10-27.md)):
what was seen and the measurements, with no rank, verdict, direction,
standard or disposition. It could read only that sheet, its own blind
review, the raw run records and the source
([`codex-astra-ranks-brief-2026-10-27.md`](codex-astra-ranks-brief-2026-10-27.md),
answer [`codex-astra-ranks-2026-10-27.md`](codex-astra-ranks-2026-10-27.md),
compared in [`ranks-compare-2026-10-27.md`](ranks-compare-2026-10-27.md)).

- **Agreed:** the merge of D-05, D-06 and V-46; V-51 at rank 1; V-52,
  V-46, V-48, V-49 and V-18 at rank 2, each on the same standard; the
  32 px radio, S-81's link and S-127's rings not findings of the page.
- **Codex only, settled for Codex:** S-113's Malay record at 320 px
  reaches 528 px, not 520; V-18's readings are VH-205's before, so its
  place at HEAD is unmeasured (V-18, above).
- **Disagreed, for the owner:** V-50's rank; whether the warning's
  guidance in a failed-playback state is a finding; and whether the
  statement's media limitation, which names only the preview, is a
  finding (below, 2, 3 and 5).

## For the owner

*Answered at VH-202's close, 27 October (the VH-202 close decision); kept as it was asked.*

Disagreements of judgement between Claude and Codex astra, each with
both positions, and the owner's questions, for VH-202's ask (wish
VH-201.1). The approved work goes on; only the contested point waits.

1. **V-51's words, and its threshold.** The words that tell a kept part
   with under 400 ms of sound apart from audio that is really absent are
   the owner's, in three languages; none is approved yet, and VH-202 puts
   them to him. *Codex* also asks whether the 400 ms rule should stay with
   true words or the sound be kept. *Claude:* keep the rule: under one
   gating block the part has no measurable loudness, so it cannot be
   levelled, and VH-185 set that rule; only the words change. The rank 1
   stands either way.
2. **V-50's rank.** *Claude:* rank 3; spec §9.3 names text enlargement and
   reflow at 320 px separately (`docs/01-specification.md:703–704`), each
   holds, and step 4's selects in the same condition are a recorded
   limitation (wish VH-189.1). *Codex:* rank 2, on the rank rule's "real
   friction": a person with a 32 px font on a phone scrolls sideways to
   read the choices and reach Set. The remedy is CSS only either way; at
   rank 3 VH-202 proposes it, at rank 2 it plans it.
3. **The warning when the finished video cannot play.** *Claude:* no
   finding. F15b breaks playback on purpose, the host's name is Chrome's
   and true of the state, the card and Save stay, and nothing shows a
   video the page made failing to play outside the fault. *Codex:* rank 2,
   Nielsen 9: "play the new video before you save it" stands while
   playback is unavailable (S-152), with no recovery in the player
   (`src/main.ts:2870`). V-52's fix checks this state either way.
4. **V-18.** The owner accepted it in Phase 7, with a shorter native
   wording as its route (wish VH-175.4). Does the acceptance stand for
   what remains, Malay at 1280 × 900 and every language at 320 × 568, or
   may some content above the button move or shorten, measured at HEAD
   first? *Codex* asks the same, with HEAD's geometry confirmed first.
5. **The statement's media limitation.** It names only the preview
   (`src/i18n/en-GB.ts:904`), where spec §9.3's exception covers both
   players (`docs/01-specification.md:740–746`); that much is agreed.
   *Claude:* not a finding of this pass: it is wish VH-192.1, routed to
   VH-137, whose words are the owner's, and Codex's blind review set it
   aside on that ground (`codex-astra-blind-review-2026-10-25.md:284`).
   *Codex:* rank 2 documentation debt, owned by VH-192.1 with no new ID
   and no drafted words, as its blind ranking gave it.

## After Codex astra's critique

Codex astra argued with the merged draft before commit
([`codex-astra-report-critique-2026-10-27.md`](codex-astra-report-critique-2026-10-27.md),
kept as written, from
[`codex-astra-report-brief-2026-10-27.md`](codex-astra-report-brief-2026-10-27.md)).
Its verdict: "Commit after the musts below". Five points, all musts, all
applied; none refused.

- **R-01, success claims within their evidence. Applied.** "Each state
  keeps one filled action" is now "at most one", with no filled action
  while a job runs and Cancel secondary, in the Verdict, J1 and What
  held up. V-52's completion line is the live region's write, exposure
  and not speech. The Phase 8 items hold "against their contract musts",
  VH-189 and VH-193 beside V-48 and V-52. The empty page's −78 px is
  split as VH-200 split it: the lede and Video language's move above the
  button, the footer's group below.
- **R-02, V-51's remedy through the data path. Applied.** The direction
  names what the owner's words must carry (cause, consequence, a recovery
  that applies) without drafting them. Keeping more of the original is
  offered only where it keeps more sound, since the rule counts decoded
  sound. The fix carries the omission's reason into the existing warning,
  because the worker reduces both cases to one `no-audio` code
  (`src/workers/job.worker.ts:535`, `src/audio/warnings.ts:92`). The
  threshold stays unless the owner changes it.
- **R-03, V-50's elements. Applied,** from the six records' own offender
  lists: the page language switcher, Video language, Video type, both Set
  buttons at 320 px in all three languages, the closing colour, and the
  Malay statement heading at 401 px. The direction contains every
  affected element across the six records, CSS only, with no move of the
  switchers and no rewording of the statement.
- **R-04, a later judgement not settled by an earlier one. Applied.** The
  statement's media limitation is now for the owner with both positions
  (5), not set aside, with no new ID either way. V-50's "no named standard
  is breached" is narrowed to "no WCAG failure is established", and its
  rank stays contested (2). The compare file says the same.
- **R-05, the remaining gaps and the run's limits. Applied.** The
  unresolved list adds the readings VH-200 recorded as missing and the
  run's conditions; coverage reads 3,255 observed of 3,267 declared;
  keys are light mode only; VH-205's 2.5.5 and 2.5.8 keep "manually
  checked in VH-205", two hit points at 1024 px in light, beside "to be
  measured".

Codex's own "For the owner" holds three positions: V-50 at rank 2, the
failed-playback guidance at rank 2, and the statement's limitation as
rank 2 debt under VH-192.1. Each is listed above with Claude's. The
findings still number 7: 1 at rank 1, 5 at rank 2 and 1 at rank 3.

## Disposition

At VH-201, 27 October; updated at VH-202's close the same day, on the owner's answer to its ask (the VH-202 close decision), and at VH-211's close, on the owner's scope (the PLAN-8 entry of that date); VH-195 makes it final at Phase 8's close.

| Finding | Rank | Disposition |
| --- | --- | --- |
| V-51 (D-05) | 1 | VH-206, in the words the owner approved in three languages (point 2); the 400 ms rule kept (point 3), no control; spec §5.4's row corrected there (point 8, wish VH-202.1). VH-203's after-run walks a kept sliver of audible sound and reads the output's tracks (VH-201.2) |
| V-52 (D-06) | 2 | VH-208: the warnings before the player and Save, the listening sentence spoken; its check includes F15b's state |
| V-46 | 2, regressed | VH-207: the hand-on at the choosing and on both read-failure paths; its check covers the J4 case (VH-201.2) |
| V-48 | 2 | VH-210, CSS only; VH-203's after-run re-reads S-113 |
| V-49 | 2 | VH-210, CSS only; a real Windows theme is the checklist's task D |
| V-18 | 2, incomplete | The Phase 7 acceptance (VH-175.4) stood at the owner's answer (point 6), and the owner's addition, that old issues be solved, amends it: [VH-216](../../../project/items/VH-216.md), both cases, its remedy to the owner first (VH-211's ask, point 1); its six cases read before and after there, and in VH-203's after-run (VH-201.2) |
| V-50 | 3 | VH-209, taken by the owner at rank 3 (point 4); CSS only |
| The failed-playback guidance | — | Not a finding (point 5); VH-208 records the state. The owner's scope (group A) supersedes that ruling: [VH-212](../../../project/items/VH-212.md), its words to the owner first (VH-211's ask, point 2) |
| The owner's old issues (VH-211) | — | Group A: [VH-213](../../../project/items/VH-213.md) (VH-185.1, its route to the owner, point 3), [VH-214](../../../project/items/VH-214.md) (VH-193.3), [VH-215](../../../project/items/VH-215.md) (VH-139.5), [VH-218](../../../project/items/VH-218.md) (VH-186.1), [VH-219](../../../project/items/VH-219.md) (VH-189.1); the format "?", [VH-217](../../../project/items/VH-217.md); group B's checks, [VH-220](../../../project/items/VH-220.md) to [VH-224](../../../project/items/VH-224.md). Each links its evidence file here at its close |
| The statement's media limitation | — | Left to VH-137, with no new item (point 7); its words stay VH-137's, wish VH-192.1. The owner's scope leaves it out (group D) |
