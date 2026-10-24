# Second design pass — 23 October 2026

PLAN-7 asked for a second whole-page pass on design, UX and
accessibility before the 0.2.0 cut, with Codex astra as a partner at
every stage. This is its report: backlog item VH-174, in Phase 7. It
joins Claude's draft findings (VH-173) and Codex astra's blind review
(VH-171) into one list, each of Codex's findings verified, and Codex
argued with the merged draft before it was committed. Its findings run
on from the 22 October pass (V-31 to V-39); two earlier IDs, V-18 and
V-33, come back as incomplete fixes, and the new ones are V-40 to V-47.

The owner's rule holds throughout: the app stays simple, with no new
control, checkbox or element, and the progress bar stays. It limits the
remedies, never the report.

## Verdict

The page holds together as one design, and the six fixes of 22 October
hold or hold in part; none regressed. Each state has at most one filled
action, and it is the right one; while a job runs there is none, and
Cancel is secondary. Every text element in 691 records sits on one of
seven drawn type roles. Text contrast passed in 44,919 rows and reflow
in all 691 records, in three languages, seven views and eight modes. The
keyboard routes, run in light mode, passed 238 of 242 steps; the other
four are a native popup the instrument cannot read.

What does not hold is narrow, and most of it is focus:

- **Focus is dropped when finished work takes a control away** (V-46).
  With focus on Announce progress when a job ends, on a setup field when
  a check blocks, or on Stop the check when a check settles during a
  save, DOM focus falls to the page's body. All three were confirmed
  live.
- **The file button's ring is clipped to a sliver** in every state that
  shows it, and under forced colours it keeps a brand colour where the
  page's rule asks for a system colour (V-40).
- **At a larger default font the trim handles lose their ring** (V-41),
  and **under a light contrast theme the language switcher's ring is lost
  against the next segment** (V-42).
- **The file button's own words are not in its accessible name** (V-43).
- **The frame-rate note says frames will be repeated when they will be
  dropped,** and it names a rate the Smaller preset does not use (V-47).
- **Step 4 has two names,** "Closing branding" and "closing graphics"
  (V-45).
- **Two incomplete fixes.** The first action is still below the first
  screen in Chinese and Malay and at 320 px (V-18), and the feedback
  message runs past the measure (V-33).
- **One rank 3 point:** no hover under forced colours (V-44).

10 findings: none at rank 1, 9 at rank 2 (two of them incomplete fixes
under their old IDs) and 1 at rank 3. None needs a new element. The
rank 2 findings go to VH-175 to be planned; V-18, V-43 and V-45 carry a
question for the owner, V-47's rank is a disagreement for the owner, and
V-44 goes to the owner as a proposal.

The WCAG judgement is scoped to what was measured and is not a
conformance claim. The focus failures (V-40 to V-42) are 2.4.13
failures; the other measured AAA checks passed, listed under What held
up. WCAG 1.4.8's width part is met by the mechanism WCAG names for it,
reflow as the window narrows; how the house measure counts lines that
mix Chinese and Latin is unresolved and the owner's.

## How it was done

Four stages, each with its own record in this folder:

- **Codex astra's blind review** (VH-171,
  [`codex-astra-blind-review-2026-10-22.md`](codex-astra-blind-review-2026-10-22.md)).
  It ran first, `codex exec -m gpt-6-astra -s read-only`, against a
  `git archive` export of `eae49ea` outside the checkout, from
  [`codex-astra-blind-brief-2026-10-22.md`](codex-astra-blind-brief-2026-10-22.md).
  Four findings, D-01 to D-04, and a source-only verdict on each of the
  six fixes.
- **The instruments** (VH-171,
  [`evidence/measurements/instruments-2026-10-22.md`](evidence/measurements/instruments-2026-10-22.md)).
  The walker in `evidence/measurements/walker/`, each instrument proved
  by a failing fixture and its passing twin, faults F1–F13 that change
  the browser around the app and never the app, and Codex astra's method
  check ([`codex-astra-method-check-2026-10-23.md`](codex-astra-method-check-2026-10-23.md)),
  its eight musts applied.
- **The evidence run** (VH-172,
  [`evidence/measurements/matrix-2026-10-23.md`](evidence/measurements/matrix-2026-10-23.md)).
  Headless Chrome 155 against the Vite dev build of `76994b8`, whose
  `src/` is `eae49ea`'s. Eleven instrument digests beside it.
- **The judgement** (VH-173,
  [`judged-2026-10-23.md`](judged-2026-10-23.md),
  [`wcag-2026-10-23.md`](wcag-2026-10-23.md)). The four journeys, Carbon,
  Nielsen's ten and the 86 WCAG criteria, with live spot checks.

**Coverage, from the manifest.** `PLANS.priority` ran in place of the
plan's full matrix, by VH-172's decision: 699 records, all whole, no
missing, failed, stale, duplicate or wrong-view record
(`matrix-manifest-2026-10-23.json`). It holds every walked scenario once
in its base cell, the language, width and mode variants where a check
depends on them, and the six-fix cells in full: en-GB 371, zh-Hans 179,
ms-MY 149; 1280 px 376, 375 px 76, 320 px 207, landscape 9, short 9, the
200% and 400% proxies 11 each; light 489, dark 25, forced-light 25,
forced-dark 25, text spacing 74, reduced motion 11, fallback faces 25,
the 32 px font 25. 691 of the 699 carry the per-record instruments. The
other 8 are keyboard routes, all in light mode: J1 in English at 1280
and 320 px and in Chinese and Malay at 1280; J2, J3, J4 and the dialog
in English at 1280.

**Unresolved, kept as such.** No verdict here extends to them:

- **821 cells of `PLANS.matrix` unrun,** listed by class with their
  reasons in the matrix file. Wish line VH-172.1.
- **245 file-button text readings "cannot determine"** in parts 1 to 3,
  by an instrument fault (a setup's click left the button hovered). The
  32 re-measured records pass, 12.38–21:1. Also VH-172.1.
- **The code role and a fact note** are drawn by no walked state, so
  VH-166's and VH-167's last clauses are unverified. Wish line VH-173.1.
- **953 target rows "cannot determine"** beside 19,166 that pass: the
  trim handles' disc, whose typed times and Set buttons are WCAG's
  equivalent-control exception, and the feedback field larger than the
  viewport at the 400% proxy (`digest-targets-2026-10-23.md`).
- **The manifest's own limits** (`unresolved.manual`): native select
  popups and the player's inner controls by keys; transient states,
  asserted before and after the instruments, never captured
  mid-transition; the dialog's entry, use and exit at enlargement, since
  the keys route runs at 1280 only; the range thumb and track by pixels;
  synthetic text-only enlargement, not run; the skip link's target and
  contrast when shown.

**What only a person can settle.** Chrome's own zoom (the protocol sets
proxies, not zoom), what a screen reader says, real phones, speech
input and real Windows contrast themes. The
[person checklist](person-checklist-2026-10-23.md) carries each as a
task, A to G, for Disability Support Services colleagues; it stays its
own file. Chinese and Malay read by native readers are not in it (task E
says testers need not judge the translations); that work stays with the
campus readers, VH-143.4 and the statement's review, VH-137.

**Live checks for this report.** Codex's D-01, D-03 and D-04 were checked
in headless Chrome 155 against the dev server at `localhost:5173`, on
`933404c`, whose `src/` and `index.html` are `eae49ea`'s, with the
walker's `Walk` class and its `MX_INIT` predicates. The script,
`vh174/live.mjs`, and its results, `live-results-2026-10-23.json`, are
in the session's scratchpad, not the checkout, as VH-173's were. Two
fixtures were made there for D-04 with ffmpeg: a 10 s test pattern at
120 fps and one at 45 fps. They read the page's DOM and source logic,
not an encoded output.

Codex astra's four, by number:

| Codex | Verified | Finding |
| --- | --- | --- |
| D-01, focus with no successor | All three cases live: the first by VH-173, the second and third here | V-46, its own |
| D-02, the feedback field's measure | In source, and rendered by VH-172 (6 records, 524–541 px) | Merged into V-33 |
| D-03, the chooser's forced-colour ring | In source; read live in both emulated palettes | Merged into V-40 |
| D-04, the frame-rate sentence | In source, and live with a 120 fps file | V-47, its own |

D-02 and D-03 are merged because one change answers both: D-02 is the
ground V-33 already holds, and D-03 is a second fault in the rule V-40
must change (`app.css:609`–`612`), each part verified apart. D-01 and
D-04 found what the draft did not, so each keeps its own number.

## Findings

### V-46 Focus is dropped when finished work takes a control away — rank 2

**Saw.** The page hands focus on when a transition removes the control
holding it, through `focusHeldBy` (`src/main.ts:898`), which notes
before the transition which controls it will take away. Three callers
name too few controls, and the helper focuses its target without asking
whether it can take focus. Each case was run live, focus placed by
script, and `document.activeElement` read after the transition:

- **A job ends with focus on Announce progress.** The ending captures
  Cancel alone (`:2947`, `:3008`); `setJobInFlight(false)` then hides the
  checkbox (`:2359`). Focus falls to the body (VH-173,
  `focusAfterEnd: body`).
- **A check blocks with focus in a setup field.** Steps 2 to 5 are shown
  before the check runs (`:1461`), so a person can Tab into Start time
  while it runs. A blocking verdict (here `prores-1080p.mov`) hides them
  (`:1580`), but the hand-off names only Stop the check (`:1535`,
  `:1592`). Focus on `#trim-start` before; the body after.
- **A check settles during a save, with focus on Stop the check.** A
  finished video, then another file chosen and the first saved while the
  second is checked (S-65, the save slowed to 3 s a chunk so that it was
  still running). The hand-off targets Create (`:1614`), which the save's
  lock has disabled (`:2412`); the blocked branch would target the file
  input, disabled too (`:2408`). Focus fell to the body, with Stop saving
  on screen.

DOM focus on the body is what was read; where the next Tab lands, the
scroll position and what a screen reader then reads were not. The
keyboard routes did not meet these cases, since none left focus on a
control that was about to go.

**Standard.** WCAG 2.4.3 Focus Order (A); UI-STANDARDS, Operable: a
transition that removes the focused control passes focus to the one that
continues the task, and leaves a reader elsewhere alone. Nielsen 3 and 9.
Rank 2: focus is lost, no work is.

**Direction.** Extend the existing hand-off, adding no element. The
ending names Announce progress with Cancel; the blocking verdict names
the setup steps it withdraws with Stop the check. Each caller keeps the
successor it chooses today: the result, a failure's explanation,
Continue anyway, Check again, Create or the chooser (`:1614`, `:1625`,
`:2960`, `:2998`–`:3002`, `:3050`). Only when that one is hidden or
disabled once the locks apply does the helper fall back to the next
visible, enabled control continuing the task, Stop saving while a save
runs. Its guards stay: focus is never taken from the dialog or from where
a person has gone to read. The fix's check repeats the three cases by
keys, in English at 1280.

**Source.** `src/main.ts:898`–`917` (the helper), `:1461`, `:1535`,
`:1580`, `:1592`, `:1614`, `:1625`, `:2359`, `:2395`–`:2412`, `:2947`,
`:2960`, `:2998`–`:3008`, `:3012`, `:3048`–`:3050`. **From:** Codex D-01,
verified live. **Evidence:** `judged-2026-10-23.md`, J1 (the first case);
the scratchpad's `vh174/live.mjs` cases `d01b` and `d01c2`.

### V-40 The file button's focus ring is clipped to a sliver, and keeps a brand colour under forced colours — rank 2

**Saw.** Two faults in one rule, `.file-input:focus-visible::file-selector-button`
(`app.css:609`–`612`):

- **Its size.** The ring is drawn on the native input's button, 2 px wide
  and 2 px out. The button fills the input's 44 px height, and Chrome
  clips the pseudo-element's outline to the input's own box, so only a
  sliver on the button's right shows. Rendered, 88 px² changes at 3:1
  against the 640 px² a 2 px perimeter of the button needs, and 152 of
  1,240 at the 32 px font. It fails in all 110 records that show the
  button, every view, mode and language, chosen or not
  (`digest-focus-2026-10-23.md`). A twin with 4 px of room inside the
  input passes at 744 px² (VH-171's fixture).
- **Its colour under forced colours.** The unchosen button opts out of
  the theme (`forced-color-adjust: none`, `:1668`) and is painted in
  Highlight. The system-colour ring the primary `.button` gets
  (`outline-color: CanvasText`, `:1675`) does not name the
  pseudo-element, and the closing `:focus-visible` rule (`:1816`)
  colours the input, whose outline is `none`. So the ring keeps
  `--focus`: read live, `rgb(16, 38, 59)`, the brand blue, in the light
  emulated palette, and white in the dark one. In both it still
  contrasts with Canvas; in a theme whose Canvas is not near white or
  black, it need not.

**Standard.** WCAG 2.4.13 Focus Appearance (AAA); UI-STANDARDS,
Operable (checked on the rendered control) and Perceivable (an opted-out
graphic paints itself in system colours). 2.4.7 holds, as the sliver is
visible and changes at 15:1. Rank 2: a 2.4.13 failure in every state,
and a breach of a named rule, as V-38 was, with no failing palette shown.

**Direction.** One rule changed, no new element, the chooser native
(VH-168). Give the ring room inside the input's own box by padding round
the button of the ring's width and offset, the arrangement VH-171's twin
showed passing. Drawing it inward instead is not enough alone: in light
mode the button's fill (`--interactive`) and the ring (`--focus`) are the
same brand blue (`tokens.brand.css:123`–`125`), so an inward ring needs
its own colour and area designed for the fill. Under forced colours give
the pseudo-element's ring CanvasText, as the primary button's is. Measure
the size and the colour apart, focused and keyboard-pressed, in light,
dark and both forced palettes.

**Source.** `src/styles/app.css:539`–`548` (`.file-input`), `:550`–`562`,
`:605`–`612` (the ring), `:1668`–`1673`, `:1675`–`1677`, `:1816`;
`src/styles/tokens.brand.css:123`–`125`, `:173`. **From:** VH-173, and
Codex D-03 verified in source and live. **Evidence:**
`digest-focus-2026-10-23.md` (110 records); the scratchpad's
`vh174/live.mjs` case `d03` and its captures.

### V-41 At a larger default font, the trim handles lose their focus ring — rank 2

**Saw.** Each handle is a 44 px thumb (`--target-min`, in px) whose dark
disc is a radial gradient with rem stops (`--spacing-04`). At Chrome's
32 px default font the stops double, the disc fills the thumb, and the
2 px ring inside its edge sits on the dark fill at 2.17:1. Rendered, 0
px² changes at 3:1 against 264 and 270 (`S-15__en-GB__w1280__font32`,
`S-15__zh-Hans__w1280__font32`, both handles). At the default size the
ring passes against the painted disc, 246–256 px² against 157, and 288
under forced-dark.

**Standard.** WCAG 2.4.13 (AAA) and 1.4.11 Non-text Contrast (AA);
1.4.4 asks that function survive resized text. UI-STANDARDS, Operable.

**Direction.** Size the disc from the thumb, not the root font: its
stops follow `--target-min`, so the clear band under the ring keeps its
width at any font size, and the same in the forced-colours rule. Measure
at the 32 px font, light and both forced palettes. No new element.

**Source.** `src/styles/app.css:1351`–`1364`, `:1395`–`1398`,
`:1738`–`1745`. **From:** VH-173. **Evidence:**
`digest-focus-2026-10-23.md`.

### V-42 Under a light contrast theme, the language switcher's ring is lost against the next segment — rank 2

**Saw.** Under forced colours the header band keeps its blue, and the
ring on a band segment stays the band's white (`app.css:1805`–`1813`,
on purpose). The chosen segment's right-hand neighbour takes ButtonFace,
white in a light palette, so the ring's right side is white on white:
416–480 px² at 3:1 against 498–520 (`S-03__{en-GB,zh-Hans}__w1280__forced-light`).
Forced-dark passes.

**Standard.** WCAG 2.4.13 (AAA); UI-STANDARDS, forced colours checked
on the rendered control.

**Direction.** Keep the band's ring clear of its neighbours, inside the
chosen face, and give it a system colour that contrasts with the face
it then lies on. Placement alone is not enough: the chosen face takes
Highlight, and a white ring on the dark palette's bright cyan Highlight
would fail in its turn (`:1771`–`1774`; the live reading,
`rgba(26, 235, 255, 0.8)`). Measure both palettes. No new element.

**Source.** `src/styles/app.css:1124`–`1128`, `:1764`–`1774`,
`:1805`–`1813`; `src/styles/tokens.brand.css:202`. **From:** VH-173.
**Evidence:** `digest-focus-2026-10-23.md` (2 records) and the captures
it names.

### V-43 The file button's own words are not in its accessible name — rank 2, the owner's

**Saw.** The button shows the browser's words, "Choose File" in an
English Chrome. Its accessible name is the step heading, "1. Choose a
video", with the value "No file chosen" (`ax`, every S-03 record). The
name does not contain the visible words, so a speech user who says
"Click Choose File" may not reach it, and on a Chinese or Malay page in
an English browser the two never meet. VH-168 chose the page's name on
purpose, for the page's language, and recorded the browser's words as a
limitation; it did not weigh Label in Name.

**Standard.** WCAG 2.5.3 Label in Name (A); UI-STANDARDS, Content and
form ("Visible label text must match the accessible name").

**Direction.** For the owner, since it reopens part of VH-168, not
because of the simplicity rule; no option adds an element.

- Recommended: test in Chrome a name that begins with the button's own
  words and then gives the step, by listing the input itself before the
  heading in its `aria-labelledby`. It is an experiment, not a known
  answer: only if Chrome computes it does the name carry both.
- Otherwise, extend VH-168's recorded limitation to 2.5.3, with the
  checklist's speech task (G) as its evidence.

**Source.** `index.html:123`–`130`; `project/decisions.md`, VH-168.
**From:** VH-173. **Evidence:** the `ax` summary in every S-03 record.

### V-47 The frame-rate note says frames will be repeated when they will be dropped — rank 2

**Saw.** Video properties raises a note when conforming the frame rate
changes the frame count by more than 10%, and the note always says
"The output will run at {rate}, so some frames will be repeated."
(`src/ui/source-panel.ts:126`–`128`; `src/i18n/en-GB.ts:178`). The model
defines a negative ratio as frames dropped (`src/media/framerate.ts:33`–`36`),
and a fast source conforms down: 120 fps to 60 (`:70`–`:85`). Read live:

- **120 fps:** "The output will run at 60 frames a second, so some
  frames will be repeated." Half the frames are dropped.
- **45 fps:** "… at 50 frames a second, so some frames will be
  repeated." True.
- **The Smaller preset** caps the output at 30 fps
  (`src/config/presets.ts:63`, `:221`), yet with it chosen both notes
  still name 60 and 50. The panel is built from the source report alone
  (`src/ui/source-panel.ts:114`–`127`), and a preset change re-runs the
  check without repainting it (`src/main.ts:1646`–`1667`).

Chinese and Malay say the same (`zh-Hans.ts:115`, `ms-MY.ts:126`).

**Standard.** Nielsen 1 and 2: the panel's own contract is to say
honestly what will happen to the video (`src/ui/source-panel.ts:4`).
Rank 2 in Claude's judgement: the words about the person's own output are
wrong, while the video itself is made correctly and nothing is lost.
Codex judges it rank 1, since it misleads; that is for the owner (below).

**Direction.** No new warning or control. Either one neutral sentence
that is true both ways and promises no rate, or a sentence chosen by the
sign of the change that names the rate the chosen output will use and is
repainted when the preset changes. The second needs a small renderer
change, the output shape passed to the panel, not strings alone. Either
way, three languages and their parity test, and a behavioural check of
a rate converted up and down under both presets.

**Source.** `src/ui/source-panel.ts:114`–`128`;
`src/media/framerate.ts:22`, `:33`–`:36`, `:70`–`:85`;
`src/config/presets.ts:55`–`:63`, `:220`–`:223`; `src/main.ts:1646`–`1667`;
`src/i18n/en-GB.ts:178`, `zh-Hans.ts:115`, `ms-MY.ts:126`. **From:** Codex
D-04, verified live. **Evidence:** the scratchpad's `vh174/live.mjs` case
`d04`, with the two fixtures it made.

### V-45 Step 4 is "Closing branding", and everything in it says "closing graphics" — rank 2

**Saw.** The step's heading and legend say "Closing branding"; its own
lines, choices and the record say "closing graphics" 33 times, and
"closing card" for the still end. Chinese and Malay split the same way.
The specification names the step "Closing branding" (§6).

**Standard.** Nielsen 4; UI-STANDARDS, Consistency ("Do not create
synonyms for existing concepts"). Rank 2: a breach of that named rule.

**Direction.** One name for the thing: "Closing graphics" in the heading
and legend, "closing card" kept for the still end it is part of, in
three languages. No new element. The specification names the step, and
`docs/` changes only with the owner's approval, so the wording is the
owner's; if the owner keeps "Closing branding", the step's own lines say
"closing branding" instead.

**Source.** `src/i18n/en-GB.ts:128`, `:307`, `:315`, `:356`;
`docs/01-specification.md:626`. **Evidence:** a count of the leaves.

### V-18 Above step 1, the first action is still below the first screen in Chinese and Malay, and at 320 px — rank 2, incomplete

**Saw.** VH-154 moved Page language into the header band, and in English
at 1280 × 900 the file button now sits at 844–888 px, inside the first
screen. In Chinese and Malay at 1280 the machine-translation notice
above the title lowers it to 994 and 1,081 px. At 320 × 568 the band's
switcher wraps under the logo (the band 223 px tall) and the button sits
at 1,185, 1,259 and 1,543 px in English, Chinese and Malay.

**Standard.** Nielsen 8; UI-STANDARDS, Minimalist design; VH-124's one
clear next action. Rank 2, as V-18 was, the same ground not yet closed.

**Direction.** The page's structure is the owner's, so no remedy is
prescribed. VH-173's draft proposal, the notice joining the lede as its
last line, is partial and its benefit unmeasured: both places are above
the chooser, so it saves no height by itself, and English has no notice,
so it cannot touch the 320 px case. V-18 stays open until an agreed
change covers the 320 px cases and the translated pages, or the owner
accepts what remains. What is left within the rule is fewer words above
the chooser (the lede, the notice) and the band's narrow layout; neither
switcher moves without the owner. Any proposal is measured at 1280 and
320 px in three languages before it is taken.

**Source.** `index.html:43`–`92`; `src/main.ts:3621`;
`src/ui/language-switcher.ts:126`, `:140`. **From:** VH-173.
**Evidence:** `judged-2026-10-23.md`, J1's table and V-18.

### V-33 The feedback message runs past the measure — rank 2, incomplete

**Saw.** VH-167's 28rem measure caps the card fields but not the feedback
dialog's message, a `.textarea` at `width: 100%`. The field is 574 px
wide at 1280 px in all three languages, and a long draft draws lines of
541 px in English and Chinese and 524 in Malay, against 448 (6 records,
`S-79a`, `S-79b`). The character count stays under 80 (76–77), so 1.4.8
holds; the house measure does not.

**Standard.** UI-STANDARDS, Perceivable: running text, editable text
included, stops at `--measure` (VH-167's "the text fields").

**Direction.** The feedback message takes the measure the card fields
have, yielding to a narrower dialog as they do. The dialog and its
buttons stay. The stylesheet test's selector list grows with it, and the
fix is checked rendered with a long draft, at the 32 px font and with
fallback faces, as D-02 asked.

**Source.** `index.html:823`–`829`; `src/styles/app.css:1435`–`1439`,
`:1498`–`1501`; `test/stylesheet.test.ts:343`. **From:** Codex D-02,
confirmed rendered by VH-172. **Evidence:** the six records' `measure`
rows.

### V-44 Under forced colours, a filled or danger button does not change on hover — rank 3

**Saw.** Under both forced palettes the primary and danger buttons and
the unchosen file button look the same hovered as at rest; the press
does change them (`digest-pressed`, 24 forced rows). The source says so
on purpose: "hover cannot change them" (VH-169), since the theme fixes
the pair.

**Standard.** Carbon's interaction states; Nielsen 1. Rank 3: the
evidence shows rest and hover alike, but no adopted rule asks for a
distinct authored hover inside a forced palette, where VH-169 adapted the
states on purpose; Carbon's state list in the digest is a checklist for a
new control. Not a WCAG requirement.

**Direction.** The owner's judgement: a hover that changes only the
border, in a second system colour, leaving the fill and the press.

**Source.** `src/styles/app.css:1664`–`1692`; `project/digests/carbon.md:40`.
**Evidence:** `digest-pressed-2026-10-23.md`.

## The six fixes

Codex's verdicts are from source at `eae49ea`; it could not run the page,
so its "unverified" is a limit of the method, not a doubt raised. VH-172
measured each clause of the plan's six-fix contract
([`six-fix-verification-2026-10-23.md`](evidence/measurements/six-fix-verification-2026-10-23.md)).
A difference of fact is settled by that evidence, both views kept.

| Fix | Codex, blind | VH-172, measured | Settled | The difference |
| --- | --- | --- | --- | --- |
| VH-164 / V-31, feedback | Unverified | Holds, all five clauses | Holds | Scope only: the empty refusal, the `mailto:` prepared (not an email app seen opening), copy, the form link and kept values, in 3 languages (S-77 to S-80, S-78k) |
| VH-165 / V-34, V-38, long text and thumb rings | Unverified | Holds (147 long-text records); partial, the forced-light thumb reading left to VH-173 | Holds | VH-173 read the thumbs against their painted disc, 256 px² against 157. V-41, the 32 px font, is new ground outside the contract |
| VH-166 / V-32, V-36, V-37, type and spacing | Unverified | Partial: the code role drawn nowhere | Partial | Agreed; VH-173.1 |
| VH-167 / V-33, the measure | Partial: D-02; raw counts | Holds for raw counts, choice details and the toggletip; fact notes unverified | Partial | D-02 confirmed rendered (V-33). Raw counts kept with their text; how mixed lines are counted is unresolved and the owner's (below). Fact notes VH-173.1 |
| VH-168 / V-35, the native chooser | Holds | Holds | Holds | Agreed, for its contract: the limitation and the translated name. V-43 is a further issue, 2.5.3 |
| VH-169 / V-39, pressed states | Partial: D-03 leaves the keyboard-focus part incomplete | Holds, all six clauses | Partial | Settled by evidence for Codex. The pressed fills hold in 54 enabled observations across 28 records, in light, dark and both forced palettes. But the keyboard clause's ring check reads the declared style (`:focus-visible` and an outline), not the ring's pixels (`walker/qualify.mjs:827`–`836`), and the file button's ring, pressed or not, is V-40's clipped, brand-coloured one |

## The journeys

Judged in full in [`judged-2026-10-23.md`](judged-2026-10-23.md), "The
journeys", with each state's page height against 20 October. In short:

- **J1, a staff video.** At most one filled action per state, the right
  one; nothing to decide before Create; DOM order the visual order. The
  first screen holds the file button only in English at 1280 (V-18).
  Focus is dropped when a job ends on Announce progress (V-46).
- **J2, a student submission.** The card's rule comes before Create can
  refuse; the four errors sit beside their fields, focus on the first;
  values survive the type switch and the dialog.
- **J3, recovery.** Each failure names its one next step, and the button
  it names is on screen; values are kept through every failure. A
  blocked check drops focus held in a setup field (V-46).
- **J4, a second video beside a kept result.** Save on the previous
  video stays filled and Create steps down; at most two decisions; the
  record keeps its own language and kind. A check settling during a save
  drops focus held on Stop the check (V-46).

## Nielsen and WCAG

**Nielsen's ten** are judged in `judged-2026-10-23.md`, "UX, Nielsen's
ten". The merge changes two rows: 1 (status) and 2 (the real world)
each hold with one exception, V-47; 3 (control) and 9 (recovery) carry
V-46. 4 holds with V-43 to V-45 as exceptions, and 8 with V-18.

**The 86 WCAG criteria** are judged in
[`wcag-2026-10-23.md`](wcag-2026-10-23.md): 40 met, 11 met in source,
17 n-a, and 18 gaps, of which 4 are defects (1.4.11, V-41; 2.4.3, V-46;
2.4.13, V-40 to V-42; 2.5.3, V-43), 10 accepted limitations and 4
missing evidence. The table's D-01 is V-46, now confirmed in all three
cases. V-40's colour part adds no WCAG failure in the emulated palettes;
a real theme is the checklist's task D. 1.4.8 stays met, on the
mechanism below, not on a count. V-47, V-45 and V-33 are not WCAG
failures.

### 1.4.8's width, and lines that mix Chinese and Latin

VH-172 kept every rendered line with its text. 86 records hold mixed
lines the instrument would not judge, worst lines of 41 to 58
characters with 6 to 24 CJK glyphs each (`judged-2026-10-23.md`, "The
mixed-script lines"). At the default font each is at most 448 px, 28 CJK
glyph widths; at the 32 px font the language notice's line reaches 758 of
896 px. VH-173 read them weighted, each CJK glyph two characters and
every other one, against 80: all pass, the worst at 66. Read strictly,
every character against 40, all 86 fail.

**What WCAG says, and what it does not.** The criterion asks that a
mechanism be available to achieve a width of no more than 80 characters
or glyphs, 40 if CJK. Its Understanding document explains the 40: CJK
characters are "approximately twice as wide as non-CJK characters", so
their limit is half (w3c/wcag, `understanding/20/visual-presentation.html`,
read 23 October). That settles a line of CJK text. It gives no
arithmetic for a line holding both scripts, so neither the weighted nor
the strict count is the standard's for these 86 lines.

**The reading adopted.** 1.4.8's width part is met by mechanism, not by
either count. The techniques WCAG lists as sufficient for the width
requirement are G204, not interfering with the user agent's reflow as
the window is narrowed, and C20, relative column widths (w3c/wcag,
`understanding/understanding.11tydata.js`). The page does not interfere:
the measure is `28rem` and yields to its container, and reflow passed in
all 691 records, 206 of them at 320 px, so a reader can narrow the
window until a line is as short as they need. The verdict in the WCAG
table stands, on this ground rather than on the weighted count.

**What stays unresolved.** The house rule is stricter than WCAG: running
text stops at the measure, "under 80 characters and 40 CJK glyphs,
counted" (`UI-STANDARDS.md:209`–`211`). For a mixed line the record does
not say which count it means. Both counts are kept, the 86 records are
neither passes nor failures of the house rule, and the counting policy
is the owner's below.

## What held up

- **One design.** At most one filled action leads each state, and it is
  the right one; while a job runs there is none, and Cancel is
  secondary. One notification anatomy for verdicts, warnings, failures
  and the result; field errors beside their fields.
- **The type roles.** 4,159 look rows in 691 records, every one on a
  role; seven roles drawn, each one look; with the brand faces withheld,
  Georgia, Arial and PingFang SC on their roles (25 of 25).
- **The measure.** Every running-text block within 448 px, and 896 px at
  the 32 px font, in every record but the feedback field (V-33); the
  widest Latin line 79 characters.
- **Measured, in scope.** 1.4.3 and 1.4.6: 44,919 text rows, none under
  its ratio, every mode and view, with the file button's text unread in
  245 records. 2.5.5 and 2.5.8: 19,166 target rows pass and none fail,
  953 "cannot determine" as above. 1.4.10: 691 records, no sideways
  scroll, long names and the 100-digit ID broken inside their boxes (147
  records). 1.4.12: 74 spacing records clean. Keys: 238 of 242 steps in
  the eight light-mode routes, the other four a native popup. 2.4.11 and
  2.4.12: no focus obscured. Focus appearance is the exception: 2.4.13
  fails on three controls (V-40 to V-42).
- **The six fixes.** VH-164, VH-165 and VH-168 hold; VH-166, VH-167 and
  VH-169 hold in part; none regressed.
- **Codex's What held up,** checked against the run: saving has its own
  status and stop; the previous video is named and keeps its warnings;
  None's lock is explained once.
- **The progress bar.** It stays, essential (spec §9).

## Set aside, with reasons

- **The switchers' place and the page's structure.** The owner's. V-18
  prescribes no move.
- **The statement's words.** VH-137's, in the owner's review.
- **The native chooser's words.** VH-168's limitation; V-40 and V-43
  style and name the native control, never replace it.
- **The ID field's own scroll at 320 px with spacing.** The text stays
  in a scrollable, resizable field, which 1.4.12 allows.
- **The thumbs against their 44 px box.** The ring is that box's own
  perimeter by construction; the visible component is the disc, so the
  disc is the reference (VH-173; Codex agrees). V-41 fails against
  either.
- **A screen-reader walk, real zoom, phones and themes.** Not run by the
  instruments; the checklist carries them, and nothing here is claimed
  for them.
- **Full conformance or release approval.** Neither follows from this
  report.

## For the owner

Disagreements of judgement between Claude and Codex astra, each with
both positions, for VH-175's ask. The approved work goes on; only the
contested point waits.

1. **How the house measure counts a line that mixes Chinese and Latin.**
   *Claude:* weight each character by the Understanding's ratio, a CJK
   glyph two against 80; all 86 records pass. *Codex:* count raw against
   40 for Chinese prose holding embedded Latin text; all 86 fail. Both
   agree WCAG gives no mixed-line arithmetic, and the WCAG verdict rests
   on reflow either way; the choice sets the house rule and what a fix
   item must count.
2. **V-47's rank.** *Claude:* rank 2; the words about the output are
   wrong, but the video is made correctly and nothing is lost. *Codex:*
   rank 1; it demonstrably misleads about the output the person is
   choosing, revising its own blind rank 2. Either way it goes to
   VH-175.

The owner's questions, with no disagreement behind them:

- **V-18.** Accept the 320 px and translated-page cases as they stand, or
  allow fewer words above the chooser or a change to the band's narrow
  layout, each measured first.
- **V-43.** Test a name that starts with the button's words, or extend
  VH-168's limitation to 2.5.3.
- **V-45.** "Closing graphics" as the step's name, with the
  specification changed to match, or "Closing branding" kept and the
  step's own lines brought to it.
- **V-44.** Whether a forced-colour hover border is worth having.

## After Codex astra's critique

Codex astra argued with the merged draft before commit
([`codex-astra-report-critique-2026-10-23.md`](codex-astra-report-critique-2026-10-23.md),
kept as written, from
[`codex-astra-report-brief-2026-10-23.md`](codex-astra-report-brief-2026-10-23.md)).
Its verdict: "Commit after the musts below". Seven points, all musts.

- **R-01, the weighted count is not WCAG's method. Applied, by the
  route it named.** The draft's claim that the weighted count is "the
  standard's own" is withdrawn: the Understanding settles a CJK line,
  not a mixed one. Codex asked that 1.4.8 become an evidence gap unless
  another mechanism were shown; WCAG's own sufficient technique for the
  width requirement, G204, is shown, with reflow measured in 691
  records, so 1.4.8 stays met and the counts are unchanged. The mixed
  lines are now unresolved against the house rule, both counts kept, and
  the counting policy is the owner's.
- **R-02, the disagreement ledger. Applied.** VH-169 is now partial: the
  keyboard clause's ring check reads the declared style, not its pixels,
  which `qualify.mjs` confirms, and the live check confirms D-03's
  colour rather than refuting it. "54 controls in every palette" is now
  54 enabled observations across 28 records. The V-43 disagreement is
  withdrawn: Codex's blind verdict was an evidence limit, and it now
  accepts V-43 at rank 2. With VH-169 partial, the scope question Codex
  sent to the owner is settled and leaves that list.
- **R-03, the focus directions. Applied.** V-46 keeps each caller's own
  successor and falls back only when it is hidden or disabled; V-40
  recommends the padding its twin proved, since an inward ring would sit
  brand blue on brand blue; V-42 requires a contrasting system colour on
  the chosen face, since white on the dark palette's cyan Highlight
  would fail. V-46 says "DOM focus falls to the body", what was read.
- **R-04, V-47's direction. Applied; its rank is for the owner.** The
  direction allows the small renderer change a correct rate needs, or a
  neutral sentence with no rate, and asks for behavioural checks both
  ways under both presets. "No choice turns on it" is withdrawn as a
  fact. Codex's rank 1 against Claude's rank 2 is listed for the owner.
- **R-05, coverage and the summary. Applied.** The blanket "AAA held"
  sentence is replaced by the named measurements with 2.4.13 as the
  exception; keyboard coverage is stated apart, light mode only; "at
  most one filled action"; the manifest's own limits and the 953
  indeterminate target rows are listed; native-reader work is named
  apart from the checklist; the mixed lines' width is given at the 32 px
  font too. VH-172.1 and VH-173.1 stand.
- **R-06, V-18's remedy. Applied.** The notice's move is labelled
  partial, its benefit unmeasured, and shown to save no height by itself;
  V-18 stays open until its cases are covered or the owner accepts them,
  and the remedy is the owner's question.
- **R-07, rank 3 against a named standard. Applied to V-45, refused for
  V-44.** V-45 breaches UI-STANDARDS' synonym rule, so it is rank 2 and
  goes to VH-175, its specification wording the owner's. V-44 stays rank
  3: as Codex itself allowed, the evidence shows rest and hover alike but
  no adopted rule asks for an authored hover inside a forced palette,
  where VH-169 adapted the states on purpose. Codex's rank question on
  V-45 is settled by taking its rank, so it leaves the owner's list.

The findings now number 10: none at rank 1, 9 at rank 2 and 1 at
rank 3, where the draft had 8 at rank 2 and 2 at rank 3.

## Disposition

| Finding | Rank | Disposition |
| --- | --- | --- |
| V-46 | 2 | VH-178: fixed; each case's successor reached in three languages and four colour modes, verified in [`vh178-focus-2026-10-23.md`](evidence/measurements/vh178-focus-2026-10-23.md) |
| V-40 | 2 | VH-179: fixed; the ring drawn whole in room inside the input, CanvasText under forced colours, the button unmoved, verified in [`vh179-rings-2026-10-23.md`](evidence/measurements/vh179-rings-2026-10-23.md) |
| V-41 | 2 | VH-179: fixed; the disc sized in px tokens, both rings pass at the 32 px font, verified in [`vh179-rings-2026-10-23.md`](evidence/measurements/vh179-rings-2026-10-23.md) |
| V-42 | 2 | VH-179: fixed; the band's ring inside the focused face in HighlightText under forced colours, verified in [`vh179-rings-2026-10-23.md`](evidence/measurements/vh179-rings-2026-10-23.md) |
| V-43 | 2 | VH-168's limitation extended to 2.5.3, on the owner's standing instruction; wording to VH-137 (VH-175.2) |
| V-47 | 2 | VH-180: fixed; one neutral sentence that names no rate, true conformed up and down under both presets, in three languages, verified in [`vh180-words-2026-10-23.md`](evidence/measurements/vh180-words-2026-10-23.md); ranked 2 on the owner's standing instruction |
| V-45 | 2 | VH-181, on the owner's ruling (VH-175.3): fixed; "Closing graphics" as the step's one name, the noun its lines use in three languages, spec §6 to match, verified in [`vh181-name-2026-10-23.md`](evidence/measurements/vh181-name-2026-10-23.md) |
| V-18 | 2 | Accepted on the owner's standing instruction; a shorter native wording is wish line VH-175.1 |
| V-33 | 2 | VH-179: fixed; the feedback message capped at the measure, verified in [`vh179-rings-2026-10-23.md`](evidence/measurements/vh179-rings-2026-10-23.md); the mixed-line count recorded in UI-STANDARDS |
| V-44 | 3 | VH-179, on the owner's ruling (VH-174.1): a border-only hover in HighlightText under forced colours, verified in [`vh179-rings-2026-10-23.md`](evidence/measurements/vh179-rings-2026-10-23.md) |
