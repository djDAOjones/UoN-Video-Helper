# VH-124 pre-work — 1 October 2026

Read-only groundwork for [VH-124](../../../pm_skills/project/tickets/VH-124.md)
(the page, made excellent) and VH-105 (the page in Chinese and Bahasa
Malaysia), done in one session while another chat finished VH-111 and VH-112,
then handed to a fresh session to build. No product file was changed for it.
It is evidence and direction, not the audit the ticket asks for: that audit,
with before-and-after screenshots of every state, is written by the session
that implements VH-124.

## Files

| File | Role |
| --- | --- |
| `README.md` | This file: what was measured, what was confirmed in source, the maintainer's decisions, and the direction proposed. **Start here.** |
| `codex-astra-vh124-source-audit-2026-10-01.md` | Codex astra's independent source audit: every state, every visible string with path:line, text form, tokens, controls, Carbon patterns, a ranked change list, and where the brief should be read rather than followed literally. Kept as written. |
| `codex-astra-vh105-groundwork-2026-10-01.md` | Codex astra's groundwork for VH-105: where every string comes from, `Intl` formatting, architecture options, the switcher, CJK type, the gate, and copy rules for VH-124. Kept as written. |
| `handoff-prompt.md` | The prompt that started the fresh session, kept so the run can be traced to its instructions. |

## Baseline

Started at `aaed557` with VH-111 uncommitted; VH-111 landed as `fcd6d11` and
VH-112 as `3fa0b0e` during the work, and `3fa0b0e` was pushed to `main` after
`npm run check` passed on it (941 tests, 1 skipped as before). Both astra
reports read that moving tree, so their `src/main.ts` and `src/styles/app.css`
line numbers can be a few lines out; re-check before citing. Citations into
files nobody was editing were spot-checked and held.

## The maintainer's decisions, 1 October 2026

- Free rein: the implementing session runs without stopping at the task
  gates, stating each decision in one line. The `[sign-off]` walk-through stays
  the maintainer's.
- Push to `main` as soon as each piece is green.
- VH-124 is completed in a fresh session; VH-105 follows it.
- Codex astra is the coding partner.

## Measured on the live page

Headless Chrome 154 against the dev server, empty state:

- Lines of running text held 89–100 characters at 1280 px before VH-112. With
  VH-112's `--measure: 70ch` they hold 88–91: in Arial a `ch` is the width of a
  zero, about 1.28 average characters, so `70ch` is about 90 characters. Spec
  §9.3 caps running text at 80; about `55ch` gives the ~70 the ticket asks for.
- WCAG 1.4.8 itself is met by a user-agent mechanism — reflow works, so the
  user can narrow lines — which makes the 80-character cap and the paragraph
  spacing the spec's own commitments, not WCAG failures. Paragraph spacing per
  W3C's Understanding document is about one blank line between paragraphs
  (top-to-top 250% of single spacing); the lede's paragraphs have none.
- No horizontal scroll at 390 or 320 px. The empty page is about 1,000 px tall
  at desktop.
- Step 1's one action, "Choose file", is an outlined button inside a bordered
  input inside a dashed drop zone inside the panel: four nested boxes, and
  nothing on the empty page reads as the primary action.

## Confirmed in source, to reproduce and fix

Each was read in the code; none has been reproduced in a browser yet.

1. **A block is printed twice.** `setSourceStatus` is given the shown and the
   spoken text as one visible string, so the whole verdict appears in step 1's
   status line and again in the verdict box beneath it. Pass the verdict as
   the spoken-only argument.
2. **A recovered storage block keeps its text.** The non-block path clears the
   block panel but never resets step 1's status, so "This video cannot be
   processed in this browser." stays above a new, ready verdict. That sentence
   is also wrong for a storage block, which is not the browser's fault.
3. **"Check again" runs under the old failure.** `runPreflight` does not clear
   the previous failure block, which stays above "Checking this video…".
4. **"Saved." can be replaced by "Stopping the save…".** After the save
   completes, the scratch clean-up is awaited (up to 10 s) before the `finally`
   hides "Stop saving", and the button still works in that window.
5. **The drop refusal points the wrong way.** "The sentence above says what to
   do." — the start-up sentence is in the status line below the drop zone.
6. **Discard is the default.** "Discard it and start again" is the primary
   button and takes focus unconditionally when the question appears.
7. **"Cancelling…" can be overwritten.** Stage reports are written while the
   job is in flight, which it still is until the cancel is answered.

## Said twice in view

- Step 1: the heading, the label "Video file", the hint "Or drop a video file
  here." and the status "Choose a video to begin."
- The before-Create note ("The finished video is kept here until you save it
  or close this tab.") stays on screen beside the result's own "It is kept here
  only until you save it or close this tab." — spec §9.1 wants both, but never
  both at once.
- The job notice, in the status line at the start of a job and in its own
  paragraph for the whole job — all of it, when progress announcements are off.
- The progress text ("Encoding video — 57%") beside the status line's
  milestone ("Encoding video — half done").
- A failed check: "The device check did not finish." in the failure block and
  in the status line.
- The discard question beside the status "Your video is not saved yet."
- An unreadable file: "That file could not be read." beside the failure block.
- "Device check complete." under "Ready to go" — kept by VH-114's decision the
  same day; revisit only if the walk shows it competing.

## Direction proposed

For the implementing session to confirm or overturn in its audit:

- Empty state: the file chooser as the one primary action, un-nested; the
  heading or one short label names the input; no resting status line; the drop
  hint shorter, and hidden on a coarse pointer (VH-113's surface).
- The lede: the three bullets gain capitals and full stops (the ticket says so;
  update the pin), and the paragraphs gain spacing.
- Step 5: while running, the progress and Cancel lead; when finished, the
  result — heading, record, a changed closing, output warnings, lifetime — then
  Save. VH-112 already makes Create secondary beside a result; the before-Create
  note goes once the result's own line is there.
- One Carbon inline-notification component for the verdict, the sound and
  output warnings, the losses and the failures, in place of five treatments.
- Tokens for line height, the measure, the column width, the notification
  rail and focus widths, and a stylesheet test that fails on a literal length
  or colour outside the token files, with structural geometry and forced-colour
  system colours exempt.
- "Discard" styled as Carbon's danger action, with focus on the question
  rather than on the destructive button.
- The blue swatch on a blue band, which VH-112 left reading as a frame.

The brief's literal wording should be read as astra's audit §7 reads it:
required reassurance (the privacy sentence, "your original file has not been
changed" in a failure) is not a repeat; "one thing to do" can be a wait; an
established four-word option such as "Over generated freeze frame" stays;
forced-colour system colours sit outside the token files by design.

## Copy rules for VH-105, applied in VH-124

From the groundwork's §7, wherever VH-124 writes or rewrites a sentence:
whole sentences with named values, never assembled from fragments; nothing
branches on displayed words; no new hand-built plurals, English "and" joins or
case changes in code; an inline sentence stays whole around a bold word or an
address; any time example is one the parser accepts; every layout wraps.
Restructuring how strings are stored is VH-105's work, not VH-124's.

## Gaps to record as doc-deltas at close

- Spec §9.3 says no format identifier is accepted as a 3.1.4 exception yet;
  `test/readability.test.ts` says the codec names are recorded there.
- `UI-STANDARDS.md` (VH-112) leaves paragraph spacing to the user's overrides;
  spec §9.3 sets 1.5× line spacing.

## Scratch tooling

Left in the pre-work session's scratch directory, disposable, and easy to
rebuild from the memory notes on headless checks: a dependency-free CDP driver,
a walker that holds one Chrome session behind a local HTTP port with a stubbed
save picker, and an ffmpeg script making synthetic fixtures — a test-pattern
lecture with tone bursts, and silent, clipping, quiet, captioned, two-track,
ProRes, too-short and not-a-video files. Synthetic fixtures keep every
screenshot free of real recordings and their names.
