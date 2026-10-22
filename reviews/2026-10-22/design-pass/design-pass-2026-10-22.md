# Design pass — 22 October 2026

The owner saw "an [un]necessary variety of font styling, text section
width, etc." and asked for a pass that makes the page excellent for
design, UX and accessibility. This is that pass: backlog item VH-163, in
Phase 6 before the 0.2.0 cut. It judges the page as one design, step by
step and state by state, in three languages and three colour modes. It is
self-contained, as the last pass is. Its findings run on from the 21
October pass (V-18 to V-30), from V-31, and none of those is found again.

## Verdict

The owner is right, and the variety comes from how the tokens are
combined, not from where the values come from. Every value is a token,
as VH-145 made it, and every spacing value is on the scale. But the page
assembles its text from those tokens in more ways than it has jobs:

- **Type.** Ten authored text styles in source, nine in the walk, for
  fewer jobs. A
  second-level heading is Lora 20 px in the steps and Arial 16 px in the
  footer. The statement's subheading is set apart from its own heading
  only by line height. The switchers' legends take a third look (V-32).
- **Width.** Running text stops at four widths in one column: 489 px for
  body text and 428 px for helper text in English and Malay, and 640 and
  560 px in Chinese. The measure is written in `ch` and `em`, which follow
  each element's own font, so a smaller size stops sooner and a Chinese
  page widens by 151 px (V-33).
- **Long words.** A long file name or student ID has nowhere to break in
  the result and the field error, so on a phone the page scrolls sideways
  (V-34).
- **The first action in a translated page.** The file chooser says
  "Choose file" and "No file chosen" in the browser's language, not the
  page's (V-35).

The grid holds better than the first survey suggested. The main column
and the footer share one 184 px edge at desktop and 24 px on a phone;
the four left edges inside a panel are each component's own anatomy. The
header band keeps its own gutter by a recorded brand rule (V-36). The
footer's panels sit closer than the steps (V-37), one forced-colours rule
is dropped whole by Chrome (V-38), and a pressed button looks hovered
(V-39).

Where the walk measured, AAA held: 1.4.6 in 1,122 text runs, 2.5.5 in
516 targets, reflow at 320 px and text spacing with ordinary file names,
and 111 keyboard stops in English. Those are scoped measurements, listed
under What held up, not a conformance claim. The one live failure the pass
found, the feedback form's Open email app reloading the page (V-31), is
fixed and shipped as VH-164. V-34 is a 1.4.10 failure the walk's box
check could not see.

9 findings: 1 at rank 1, shipped; 6 at rank 2; 2 at rank 3. The rank 2
findings are planned as five Phase 6 items ahead of the cut (PLAN-6, this
date), for the owner to approve; one of them, the file chooser, waits on
the owner's ruling. The rank 3 findings go to the owner as proposals.

## How it was done

The walker of 21 October, rebuilt for this pass in
`evidence/measurements/walker/`:

- **The design walk** (`design-walk.mjs`). Headless Chrome 155 against
  the Vite dev build, ffmpeg fixtures only (`fixtures.sh`). English,
  Simplified Chinese and Bahasa Malaysia at 1280 × 900 and at 375 × 812
  with mobile emulation, each empty, ready, running and finished. English
  extras: a title card, an invalid trim, None's disabled closing, the
  system check and the statement open, dark and forced colours. 33
  captures, `evidence/before-*.png`.
- **The inventory** (`inventory.mjs`). Every element holding text, by
  computed family, size, line height, weight and tracking; every running
  text block's width and widest line; every panel's text left edges;
  every margin, padding and gap; the vertical gap for each relation.
  `evidence/measurements/inventory-before-2026-10-22.md` and `.json`; how
  to take it again is at the top of the `.md`, so each fix item can take
  an after.
- **The WCAG checks** (`wcag-checks.mjs`). 1.4.6, 2.5.5, 1.4.10 at 320 px,
  1.4.4 as a 640 px layout at DPR 2, 1.4.12, 2.4.13 and 2.4.12 by keyboard,
  and 1.4.8 line length counted per rendered line.
  `evidence/measurements/wcag-checks-2026-10-22.md`.
- **Codex astra's blind review.** It ran (`codex exec -m gpt-6-astra -s
  read-only`) from `codex-astra-design-brief-2026-10-22.md`, at `5e3de2b`,
  before it saw this draft. Its five findings were each verified in
  source, D-01 and D-04 live. Then it critiqued this draft. Both are kept
  as written.
- **Live checks for this draft.** V-34 and V-35 at 320 px and 1280 px in
  headless Chrome, and the pressed state of the buttons.

Codex astra's five, by number:

| Codex | Finding |
| --- | --- |
| D-01 | V-31 |
| D-02 | V-32 |
| D-03 | V-33 |
| D-04 | V-34 |
| D-05 | V-36 and V-37 |

## Findings

### V-31 The feedback form's Open email app reloaded the page — rank 1, shipped

**Saw.** VH-160's footer link took the ID `feedback-form`, which the
dialog's form already had. The form's lookup found the link first, so the
submit handler sat on the link. Open email app then submitted the form
natively: the page reloaded, and the feedback draft and the chosen video
were lost. Codex astra found it in source (D-01); it was confirmed
in Chrome.

**Standard.** Nielsen 3 (user control), 5 (error prevention) and 10
(help): the help route lost work. Rank 1: a user could lose work.

**Direction.** Done. VH-164 gave the link `feedback-form-link`, and a test
holds every ID in the page to one use (decisions, VH-164). The submit
wiring is repaired; the email app itself was not opened from the
browser.

**Source.** `index.html` (the link and the form); `src/main.ts` (the
form's lookup). **Evidence:** commit `04956b3`.

### V-32 A heading level has two looks, and one text job is set three ways — rank 2

**Saw.** The walk's inventory finds 16 rendered styles: nine tuples and
seven Chinese-stack twins. Codex's source count is ten, the nine plus the
diagnostics' monospace. The jobs they do are fewer:

- **Second-level headings.** The six steps, Errors captured and the
  feedback dialog draw `h2` in Lora 20/30/700. System check and
  Accessibility statement draw `h2` in Arial 16/24/600, because their
  heading takes the disclosure summary's whole font (`font: inherit`).
- **The step heading's line height.** It is 30 px, the body's 1.5. It
  never takes `--line-height-heading` (1.25), which the page title and the
  statement's subheading use.
- **The statement's subheading.** Arial 16/20/700, under an `h2` that is
  Arial 16/24/600. Where Arial itself draws them, the two weights are one
  face: Arial ships Regular and Bold, and CSS font matching takes Bold for
  600. So the two tuples differ only by leading; a fallback face may draw
  a true semibold.
- **Legends.** The switchers' legends above step 1 are 16/24/700. The
  Colour legend in step 4 is 14/21/400, as every other field label is.
- **A section-level title in three looks.** Notification titles are
  16/24/600, the statement's subheading 16/20/700, and the switchers'
  legends 16/24/700. All three name a group that follows.

**Standard.** VH-163's criterion, the owner's own for this pass: each
kind of text takes one named style, and headings of one level look the
same wherever they appear. That is a design rule the owner set, not a
WCAG rule; the 21 October critique rightly refused to make heading level
dictate size in general (V-26).
UI-STANDARDS → Consistency; the Carbon digest → productive type styles.
Nielsen 4.

**Direction.** Eight named roles, each with one size, weight and line
height, each a rule in `app.css` grouping the selectors that wear it.
The values are tokens that exist, so no token is added except role line
heights if the fix needs them. Each role is a declared local adaptation
of the Carbon style named: the brand's faces and the 16 and 14 px sizes
are kept, as VH-124 set. Two references, `body-02` and
`heading-compact-02`, are Carbon's expressive set; the page enlarges its
productive text to 16 px by its own choice, so those two rows are
enlarged productive roles that resemble them. Tracking stays `normal`,
the local choice, said once.

| Role | Look | Wears it | Carbon reference |
| --- | --- | --- | --- |
| Page title | heading face 28/35/700 | `h1` | `heading-04` (28/36/400) |
| Panel heading | heading face 20/28/700 | every `h2`: six steps, Errors captured, the feedback dialog; the footer's two, if the owner agrees | `heading-03` (20/28/400) |
| Section heading | body face 16/24/600 | notification titles, the statement's `h3`, the switchers' legends | `heading-compact-02` (16/22/600, expressive) |
| Body | body face 16/24/400 | intros, the lede, the statement, text fields and textareas | `body-02` (16/24/400, expressive) |
| Supporting | body face 14/21/400 | labels and legends in a step, helpers, buttons, selects, notification bodies, field errors | `body-compact-01` (14/18), `helper-text-01` (12/16) |
| Compact emphasis | body face 14/21/600 | a selected segment, a notification item's title, Help, `strong` in compact text | `heading-compact-01` (14/18/600) |
| Status mark | body face 14/21/700 | the system check's marks (VH-151) | local |
| Code | mono 14/21/400 | diagnostics, the captured stack | `code-01` (12/16/400) |

Links inherit the role of the text they sit in. Editable text stays at
16 px. The selected segment's reserved width stays. Ten authored styles
become eight, one per role. The panel heading takes Carbon's 28 px line,
not the body's 30; the page title keeps 35 from `--line-height-heading`,
a pixel from Carbon's 36. `UI-STANDARDS.md`
names the eight roles. It stands at 2,372 of its 2,400 words, so the
roles replace words there or the owner is asked to raise the budget.

The footer's two headings are the owner's question. VH-163 asks that
headings of one level look the same, so the recommendation is that they
take the panel heading look: the closed System check and Accessibility
statement bars then read in Lora 20, as the steps do. The alternative
keeps them as section headings and records why. Either answers V-26's
earlier reading for the owner.

**Source.** `src/styles/app.css:169` (page title), `:259` (`.panel h2`),
`:1434` and `:1519` (fields); `src/main.ts:870` and `index.html:454`
(`strong`); `app.css`
`:886`–`:904` (the footer's summaries and `h2`), `:916` (the statement's
`h3`), `:1167` (the switchers' legends), `:460` (notification title);
`src/styles/tokens.carbon.css:43`–`:64`. **From:** Codex D-02,
inventory. **Evidence:**
`inventory-before-2026-10-22.md` §1 and §1.headings;
`before-1280-en-08-system-check-open.png`,
`before-1280-en-09-statement-open.png`, `before-1280-en-02-ready.png`.

### V-33 Running text stops at four widths in one column — rank 2

**Saw.** Body and helper text sit side by side in every step and stop at
different places:

| Language | Body text (16 px) | Helper and notification text (14 px) |
| --- | --- | --- |
| English, Malay | 489 px | 428 px, 61 px short |
| Chinese | 640 px | 560 px, 80 px short |

The cause is the unit. `--measure: 55ch` and `--measure-cjk: 40em` are
relative units, so they resolve against each element's own font. A
14 px helper's `55ch` is 61 px narrower than a 16 px paragraph's; a
Chinese page's `40em` is 151 px wider than English. Three gaps follow:

- **Prose spans.** `.fact-note` is a span inside a `dd`, and
  `.radio-detail` a span in a label. Neither takes the measure. A Chinese
  fact note at 14 px can run the `dd`'s 640 px: about 46 glyphs, over
  1.4.8's 40.
- **Text fields.** They take `--measure` without the Chinese override, so
  in Chinese a field is narrower than the text above it.
- **The toggletip's paragraphs.** They sit 8 px apart, not the
  16 px paragraph gap every other pair of paragraphs takes.

1.4.8 holds where the walk measured it: English at most 70 characters at
16 px and 73 at 14 px, Malay 69 and 67, Chinese 40 glyphs. One Chinese
line reaches 46 counted one for one: a notification holding a file name.
The walker's half-width count for Latin letters makes it 40; that is a
width proxy, not WCAG's rule, so the raw count stands beside it. The fact
note's 46 glyphs is from source, not seen in the walk: the walk never
opened Video properties with the long frame-rate note.

**Standard.** WCAG 1.4.8 (80 characters, 40 CJK glyphs, a blank line
between paragraphs); VH-163's criterion: all running text in a language
stops at one width, whatever its size, without the column jumping when
the language changes. UI-STANDARDS → Perceivable. Nielsen 4.

**Direction.** One prose measure in `rem`, a physical width shared by
every size and language. The content column stays 912 px; only where
text stops changes.

- **`--measure: 28rem`** (448 px), a candidate to verify in the browser,
  not a proven optimum. Scaled from the walk's longest lines, about 64
  characters at 16 px and 76 at 14 px in English, 63 and 70 in Malay;
  Chinese 28 glyphs at 16 px and 32 at 14. These are estimates; the fix
  counts the rendered lines again. Body text loses 41 px in English and
  Malay and 192 px in Chinese; helper text gains 20 px in English and
  Malay and loses 112 px in Chinese.
- **Why not keep 489 px.** Scaled from the same 73-character sample, a
  14 px line would reach 80 characters near 469 px, so helper text at the
  body's width risks 1.4.8.
- **`--measure-cjk` retired**, with its `:lang(zh)` measure rule only;
  the Chinese faces stay. The column no longer jumps.
- **The measure on prose spans** (`.fact-note`, `.radio-detail`) and on
  text fields, so a field ends where its text ends. Every cap yields to
  its container on a phone.
- **`--paragraph-gap` between the toggletip's paragraphs.**

`test/stylesheet.test.ts:120` pins `55ch`. It changes with the fix, and a
behavioural check takes its place: the walker's measure table shows one
width for every running-text kind in each language. The value is the
owner's to approve.

**Source.** `src/styles/tokens.carbon.css:72`–`:73`;
`src/styles/app.css:36`–`:49`, `:666` (`.fact-note`), `:831`
(`.radio-detail`), `:1073` (the toggletip), `:1457` (text fields);
`test/stylesheet.test.ts:120`. **From:** Codex D-03, inventory, WCAG
checks. **Evidence:** `inventory-before-2026-10-22.md` §2 and §2.short;
`wcag-checks-2026-10-22.md` §6; `before-1280-en-02-ready.png` beside
`before-1280-zh-02-ready.png`.

### V-34 A long file name or student ID has nowhere to break — rank 2

**Saw.** Measured live at 320 × 568, with a file named 100 `W`s and
`.mp4`:

- **The finished result.** Its body, "Made from WWW….mp4: …", is a
  185 px column whose text runs to 1,425 px. The page scrolls sideways:
  1,425 px of document in a 320 px window. The previous result, kept when
  another file is chosen, does the same.
- **A student ID.** One 100-character token in the IDs field is repeated
  in its error after Create. The error's column is 222 px; its text runs to
  992 px, and the page scrolls sideways.
- **With 1.4.12's spacing.** Worse: 1,601 px and 1,163 px.

Neither `.notification-body` nor `.field-error` allows a break inside a
word: both compute `overflow-wrap: normal`. Measured live: the finished
and previous results and the ID error, with and without text spacing.
The discard question was not reached in that walk. A 100-letter name is a test
case, but an ordinary one breaks the same way: underscores are not break
points, so `Lecture_Week_3_Introduction_to_Biochemistry_v2.mp4` is one
50-character word in a 185 px column that holds about 28 characters.
The walk did not see it because it never fed a long name: its
document-width check would have. The missing piece was the fixture.

**Standard.** WCAG 1.4.10 Reflow, with 1.4.12's spacing applied; Nielsen
9: an error must be readable to be recovered from. Rank 2: the result is
there to be read, and on a phone its name runs off the screen.

**Direction.** `overflow-wrap: anywhere` on the shared running-text
rule (`app.css:36`), extended to the prose spans it misses, so a word
longer than its line breaks where it must and nowhere else; not on
controls. Every character stays: no clipping, no ellipsis, no
`word-break: break-all`. CSS only. The fix's walk adds the long-name and
long-ID fixtures to the design walk, keeps the document-width check, and
adds a text-range check for spill that does not widen the page; the
finished, previous-result and discard states at 320 px, with and without
text spacing. The walker is a browser check by hand, not part of
`npm run check`.

**Source.** `src/styles/app.css:465` (`.notification-body`), `:1537`
(`.field-error`); `src/ui/result-summary.ts:168`;
`src/ui/title-card-step.ts:200`, `:291`; `src/i18n/en-GB.ts:291`, `:470`.
Wrapping exists today only in the statement, the captured stack and the
diagnostics (`app.css:491`, `:913`, `:1550`). **From:** Codex D-04,
verified live. **Evidence:** `evidence/v34-320-en-finished-longname.png`,
`evidence/v34-320-en-id-error.png`.

### V-35 The file chooser speaks the browser's language, not the page's — rank 2

**Saw.** Measured live at 1280 px with the page in Chinese, then Malay,
in a browser whose language is English. Step 1's heading and drop hint
are translated: "1. 选择一个视频", "或者把它拖放到这里。". Between them, the
page's first and only filled button says "Choose file", and beside it
"No file chosen". Chrome draws both inside the native `input type=file`
in the browser's own language. The page styles the button through
`::file-selector-button` but cannot change its words. Anyone whose
browser's language differs from the page's sees it. The control's
accessible name is the translated heading (`aria-labelledby`), so what a
screen reader says is in the page's language.

**Standard.** VH-105: the page repaints every string when its language
changes. Nielsen 2 (the user's language) and 4 (consistency). Not a
demonstrated WCAG failure: the name is the page's, and how the browser's
own words are exposed is not shown.

**Direction.** Two ways, and the choice is the owner's. The page's rule
today is no new element, so the recommendation is the second unless the
owner makes an explicit exception:

- **The page draws the words.** The native input stays, visually hidden
  and still the focusable control. A `label` for it, styled as the
  existing button, says "Choose file" from the string tables. The chosen
  file's name, which only the native input shows today, joins step 1's
  existing read line ("Video read: {name}."), wrapping as V-34 sets. The
  user sees one button, as now, so no control is added; but a `label`
  element is, which the rule forbids without the owner's exception. It
  also needs: an accessible name that matches the visible words (the
  heading's `aria-labelledby` would override the label); the input's
  focus, disabled and forced-colour states on the label; the file's name
  shown from selection, not only once read, since reading can fail; and
  the live read line's announcement changed in three languages.
- **The chooser stays native**, the limitation recorded in a decision,
  and any statement wording routed through VH-137.

It is the page's first action, so the owner may judge the exception
worth it; the record does not presume it.

**Source.** `index.html:122`–`:130`; `src/styles/app.css:540`–`:606`
(`.file-input`, `::file-selector-button`); `src/i18n/en-GB.ts:155`
(`readSummary`). **From:** walkthrough, verified live. **Evidence:**
`evidence/v35-1280-zh-file-input.png`,
`evidence/v35-1280-ms-file-input.png`.

### V-39 Pressing a button looks the same as hovering it — rank 2

**Saw.** No rule in the stylesheets styles `:active`. Measured live with
the mouse held down: Choose file and Create show the hover fill
(`--interactive-hover`) whether pressed or not, and a secondary button
the same. Carbon's buttons have a distinct active fill.

**Standard.** Carbon's button specification defines an active state for
each variant; VH-163's controls-and-states criterion walks active. Rank 2,
a breach of the adopted standard. Nielsen 1 is context. Not a WCAG
failure.

**Direction.** A pressed state on each existing button kind adds no
control or element. First see whether an existing role gives a distinct
fill at 7:1 with its text; only then add an active role, in light, dark
and the blue band, with forced colours and disabled precedence kept. The
mouse-down measurements are kept with the fix's evidence.

**Source.** `src/styles/app.css:354`–`:402` (buttons), `:1112`
(segments); `src/styles/tokens.brand.css:121`–`:122`, `:164`–`:165`.
**From:** Codex's state table, verified live.

### V-36 The header band keeps its own gutter — rank 3, for the owner

**Saw.** At 1280 px the logo sits 20 px from the window and the page
language switcher ends 20 px from it, while the content column starts at
184 px. At 375 px the band's edge is 20 px in and the main column's 24
px, so the logo and the page title start 4 px apart. The 20 px is the
brand token `--uon-logo-inset`, measured from nottingham.ac.uk's header,
and UI-STANDARDS records it: "top-left against the window edge … 20 px
in". A stylesheet test holds the desktop placement.

**Standard.** VH-163's criterion: the band, the main column and the
footer share gutters at every width. Carbon digest → the 2x grid. The
brand rule, recorded and tested, sets the band apart on purpose.

**Direction.** Two questions for the owner, with a recommendation:

- **At desktop**, keep the logo at the window's edge, as the University's
  own site does. The band is the University's frame, not the tool's
  column.
- **On a phone**, take the band's inset to `--spacing-06` below the
  breakpoint where the column meets the window's gutters, so the logo and
  the title share one edge. That departs from the measured 20 px only
  where the website's desktop geometry was never measured.

**Source.** `src/styles/tokens.brand.css:98`–`:108`;
`src/styles/app.css:151`; `UI-STANDARDS.md:82`;
`test/stylesheet.test.ts:62`. **From:** Codex D-05, inventory.
**Evidence:** `inventory-before-2026-10-22.md` §3;
`before-375-en-01-empty.png`, `before-1280-en-01-empty.png`.

### V-37 One relation, several gaps — rank 3

**Saw.** The inventory's rhythm table:

- **Panel to panel.** 32 px between the blocks above step 1, 24 px
  between steps, 16 px between the footer's panels.
- **Heading to its text.** 16 px under a step heading, 8 px under the
  statement's subheading (with 32 above it), and 28 px from a footer
  summary to its body (the summary's 12 px padding and a 16 px margin).
- **Field to helper.** 8 px everywhere but one: 16 px above None's
  reason, which explains three controls, not the checkbox above it, so
  its wider gap marks a shared note (V-20's consolidation). It stays.

**Standard.** VH-163's criterion: one rhythm per relation. UI-STANDARDS →
Consistency; the Carbon digest's spacing scale.

**Direction.** The footer's panels take `.panel`'s 24 px. The rest stays,
each for a reason: the 32 px above step 1 sets the switchers apart from
the steps they shape (V-18); the subheading's 8 px puts a heading closer
to what it heads than to what precedes it; the footer summary's 28 px is
its 12 px target padding plus a 16 px heading gap, so the bar stays one
whole target; None's 16 px marks a note on three controls. The footer's
gap is polish in a separate band, so rank 3, recommended with V-32
because it is a panel rhythm.

**Source.** `src/styles/app.css:176` (the footer's 16 px), `:252`
(`.panel`), `:916` (the subheading), `:1196` (the switchers' 32 px).
**From:** Codex D-05, inventory. **Evidence:**
`inventory-before-2026-10-22.md` §4.rhythm.

### V-38 One forced-colours rule is dropped whole — rank 2

**Saw.** Under forced colours, one rule names
`.range-input:focus-visible::-webkit-slider-thumb` and
`.range-input:focus-visible::-moz-range-thumb` together. Chrome does not
know the second pseudo-element, so it discards the whole rule, and the
trim handles' focus ring never takes `CanvasText`. Today the ring still
draws white on black in the emulated palette, so nothing fails; a
palette where `--focus` lands near the user's Canvas could. The slider
opts out of automatic colour adjustment (`app.css:1566`), so this rule is
what gives the ring a system colour.

**Standard.** WCAG 2.4.13 Focus appearance; UI-STANDARDS → forced
colours take system colours. Rank 2: a breach of that named rule, even
with no failing palette shown.

**Direction.** Two rules, one per engine, as the plain rules at `:1414`
and `:1419` already are. An accessibility repair of its own, so it goes
with V-34's CSS repair, checked in a light and a dark forced palette.

**Source.** `src/styles/app.css:1653`–`:1654`. **From:** WCAG checks.
**Evidence:** `wcag-checks-2026-10-22.md`, Notes.

## What held up

- **Every value a token.** Every margin, padding and gap is on the
  spacing scale, a named brand token, automatic centring, or one of the
  stylesheet test's structural exemptions, such as the segments' −1 px
  overlap. VH-145's boundary holds.
- **One content column.** The main column and the footer share a 912 px
  column, 184 px in at desktop and 24 px on a phone, in all three
  languages. With ordinary file names no view scrolls sideways; V-34 is
  the exception.
- **The left edges are anatomy.** The 184, 209, 226 and 237 px edges the
  first survey counted, and the others the inventory lists, are the
  column, a panel's padding, the drop zone's padding, a disclosure's
  chevron and a checkbox. Each
  marks a component's inside, so they stay (Codex agrees).
- **The components.** One panel for six steps, one notification anatomy
  for the verdict, losses, warnings, failures and the result, field
  errors beside their fields, one segmented component, four button
  variants. One filled action leads each state that has one; while a job
  runs, the one action is Cancel, a secondary button.
- **Measured AAA, in scope.** 1.4.6: no run under 7:1 in 1,122, staff
  video, light and dark, the lowest 7.42:1. 2.5.5: no target under 44 px
  in 516 at 1280 and 375. 1.4.10 at 320 px and a 640 px layout at DPR 2,
  a proxy for 200%, not browser zoom: no sideways scroll in 27 views with
  ordinary names. 1.4.12: nothing clipped. 2.4.13 and 2.4.12: 111
  keyboard stops in English, empty and ready, at desktop, none obscured,
  the ring's thickness checked, not its changed area; the band's ring the
  `--focus` white under forced colours (VH-154).
- **Nielsen's ten, from source and the walk.** Codex's table, checked
  against the walk as far as it went, to Finished. Saved, discard,
  feedback, captured errors and the open help were not walked this time;
  the fix items walk them: named stages and a measured bar (1); outputs named by where they
  go (2); Cancel, Keep or discard (3; V-31 was the exception); shared
  components (4; V-32 and V-33 are where it slips); the card refused
  before processing (5); the result keeps its source and choices (6);
  typed trim times beside the drag (7); help in context (8); failures
  say what next (9; V-34 bears on it); help and the statement (10).
- **The progress bar.** It stays, as VH-150 kept it.

## Set aside, with reasons

- **The switchers' place and the page's structure.** The owner's, and
  VH-154 settled Page language. Nothing here moves them.
- **The segments' −1 px overlap.** It keeps one hairline between two
  segments, not two.
- **The statement's words.** VH-137's, in the owner's review.
- **The native video controls and the exact faces a device draws.** Not
  judged from CSS; spec §13 records what a person must check.
- **A screen-reader walk.** Not run here, and not by the 20 October
  audit either: it checked what is announced programmatically and
  recorded real screen readers as unverified. V-35's first option would
  change what is announced, so it would need that walk.
- **Fallback faces.** V-32's Arial claim and V-33's estimates assume
  Arial and the named CJK faces draw; the fix items check a fallback.

## After Codex astra's critique

Codex astra argued with every finding before commit
(`codex-astra-design-critique-2026-10-22.md`, kept as written). Applied:
the AAA, zoom, focus and screen-reader claims scoped to what was
measured; V-31's loss narrowed; V-32's inventory count, its Carbon
references with their sizes and the two expressive ones, the panel
heading at 20/28, fields, links and `strong` given roles, and the Arial
claim qualified; V-33's 28rem made a candidate, its arithmetic in three
languages, Chinese helper text's loss, the raw 46-glyph count and the
fact note's case marked from source; V-34's cause corrected to the
missing fixture and its rule placed; V-35's WCAG attribution removed and
its recommendation turned to the native chooser under the owner's rule;
V-37's None reason and disclosure gap kept with reasons; V-38 and V-39
raised to rank 2 as breaches of a named rule and planned. Refused:
raising V-37's footer gap to rank 2. The footer is a band of its own,
and a gap that misleads no one is polish, as the 21 October pass ranked
form slips.

## Disposition

| Finding | Rank | Disposition |
| --- | --- | --- |
| V-31 | 1 | Shipped, VH-164 |
| V-32 | 2 | Phase 6, VH-166; the footer's headings the owner's question |
| V-33 | 2 | Phase 6, VH-167; the measure's value the owner's to approve |
| V-34 | 2 | Phase 6, VH-165 |
| V-35 | 2 | Phase 6, VH-168, waiting on the owner's ruling on the label |
| V-36 | 3 | The owner's: the phone inset only, in VH-166 if taken; else a wish line |
| V-37 | 3 | The owner's: the footer's gap in VH-166 if taken; else a wish line |
| V-38 | 2 | Phase 6, VH-165 |
| V-39 | 2 | Phase 6, VH-169 |
