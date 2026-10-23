# The instruments qualified and the pilot — VH-171, 22 October 2026 (third checkpoint)

The walker is copied from HEAD (`eae49ea`; its files last changed in
`01cc8d8`) into `walker/`; the old bundle is untouched. Added:
`qualify.mjs` (the state assertion, Chrome's accessibility tree, the
keys-only route, rendered focus by pixels, hit-tested targets, contrast
beyond text nodes, raw rendered-line counts, motion, views and modes),
`runner.mjs` (declared records, a fresh run directory, verify, the
manifest), `prove.mjs` (the failing fixtures) and `matrix.mjs` (scenarios,
routes and plans; the pilot). Every instrument answers pass, fail or
cannot-determine.

## Proved to detect

`prove-2026-10-22.json`: 24 of 24 proved. Each instrument failed its own
fixture and passed its twin, written to the scratchpad, never `src/`:
overflow (2,024 px on a 1,280 px page); rendered focus (a 1 px dotted
grey ring, 152 px² changed at 3:1 against a 592 px² 2 px perimeter; the
good ring 640), and the same with the control scrolled 2,400 px down;
the tree's names (a button with only a hidden icon, an unlabelled field);
the modal's background (an `aria-modal` div leaves "Open" exposed); target
area (20 × 20); placeholder contrast (1.71:1); rendered lines (142 Latin
letters and 77 CJK glyphs a line; a visually hidden status line not
counted); the keys-only route (a `div` Tab never reaches). The runner
failed a run with a missing, a duplicate, a stale, an undeclared and a
failed record, and passed a whole one. After the pilot, `qualify.mjs`'s
CJK character class was rewritten as escapes for the lint, so the
pilot manifest's instrument hash predates it; the proofs were re-run on
the final file, 24 of 24.

## The pilot

Run `pilot-2026-10-22T21-30-27-132Z-20fe06`: S-03 (Empty), S-15 (Ready)
and S-76 (Feedback, empty) in English at 1280 × 900, light, dark and
emulated forced colours (light), and the route K-dialog. Coverage 10 of
10, whole; the manifest is `pilot-manifest-2026-10-22.json`.

The first pilot caught four faults in the instruments, fixed before this
run: the focus clip was taken in viewport coordinates, so a scrolled
control compared two shots of the page's top (now document coordinates,
and the scrolled fixture added to the proofs); the line count included a
visually hidden status line (now character by character, hidden text left
out); the file button's contrast was read against the input's background,
not the button's; targets behind the open modal dialog were counted (now
"inert", exempt).

| Record | overflow | ax | targets | contrastText | contrastExtra | measure | focus | keys |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| K-dialog__en-GB__w1280__light | — | — | — | — | — | — | — | fail |
| S-03__en-GB__w1280__dark | pass | pass | pass | pass | pass | pass | fail | — |
| S-03__en-GB__w1280__forced-light | pass | pass | pass | pass | fail | pass | fail | — |
| S-03__en-GB__w1280__light | pass | pass | pass | pass | pass | pass | fail | — |
| S-15__en-GB__w1280__dark | pass | pass | cannot-determine | pass | pass | pass | fail | — |
| S-15__en-GB__w1280__forced-light | pass | pass | cannot-determine | pass | pass | pass | fail | — |
| S-15__en-GB__w1280__light | pass | pass | cannot-determine | pass | pass | pass | fail | — |
| S-76__en-GB__w1280__dark | pass | pass | pass | pass | pass | pass | pass | — |
| S-76__en-GB__w1280__forced-light | pass | pass | pass | pass | fail | pass | pass | — |
| S-76__en-GB__w1280__light | pass | pass | pass | pass | pass | pass | pass | — |

Not passing, per record (first items):

- K-dialog__en-GB__w1280__light — keys fail: Tab → body; Shift+Tab → body
- S-03__en-GB__w1280__dark — focus fail: #file-input 88 px² of 3488
- S-03__en-GB__w1280__forced-light — contrastExtra fail: input#file-input.file-input[file] "1. Choose a video" 1/7
- S-03__en-GB__w1280__forced-light — focus fail: #file-input 88 px² of 3488; #language-switcher input:checked 480 px² of 514
- S-03__en-GB__w1280__light — focus fail: #file-input 88 px² of 3488
- S-15__en-GB__w1280__dark — targets cannot-determine: input#trim-start-range.range-input[range] "Start" the thumb is a pseudo-element; a hit test reaches only the input box; input#trim-end-range.range-input[range] "End" the thumb is a pseudo-element; a hit test reaches only the input box
- S-15__en-GB__w1280__dark — focus fail: #trim-start-range 288 px² of 3624; #trim-end-range 288 px² of 3624
- S-15__en-GB__w1280__forced-light — targets cannot-determine: input#trim-start-range.range-input[range] "Start" the thumb is a pseudo-element; a hit test reaches only the input box; input#trim-end-range.range-input[range] "End" the thumb is a pseudo-element; a hit test reaches only the input box
- S-15__en-GB__w1280__forced-light — focus fail: #trim-start-range 256 px² of 3624; #trim-end-range 256 px² of 3624
- S-15__en-GB__w1280__light — targets cannot-determine: input#trim-start-range.range-input[range] "Start" the thumb is a pseudo-element; a hit test reaches only the input box; input#trim-end-range.range-input[range] "End" the thumb is a pseudo-element; a hit test reaches only the input box
- S-15__en-GB__w1280__light — focus fail: #trim-start-range 246 px² of 3624; #trim-end-range 246 px² of 3624
- S-76__en-GB__w1280__forced-light — contrastExtra fail: input#file-input.file-input[file] "1. Choose a video" 1/7

## The four instrument questions, settled (second chat)

Each settlement has its own failing fixture and passing twin;
`prove-2026-10-22.json` now holds 35 of 35 proved (the first chat's 24,
plus 11).

- **The reference a ring is measured against.** Where the ring is drawn
  on a pseudo-element, the 2 px perimeter is the sub-component's, never
  the whole input's. Its painted box is found by drawing the clip with
  and without it. The file chooser's button paints 130 × 44 in the
  fixture. A range thumb is read two ways: its 44 px box, and its
  painted disc (30 px in the app). When the ring passes one reading and
  fails the other, the outcome is "cannot determine" with both kept; that
  reading is VH-173's. The perimeter is now the band's exact area: a box
  is 4(w + h) − 16 and a disc is 4π(r − 1). The pilot's 4(w + h)
  overstated it by 16.
- **The dialog route.** A native modal dialog in Chrome lets Tab past
  its last control leave for the browser's own controls (focus reads
  `body`), then come back to its first. The route now allows "inside the
  dialog, or out to the browser" and fails only when focus reaches the
  page behind it. It is proved on a non-modal `show()` dialog (fails)
  and a `showModal()` one (passes).
- **The file button's text by pixels.** Its painted box is found as
  above. The commonest colour in it is the fill; the pixel furthest
  from that in luminance is the ink. This reading counts. The computed
  reading is kept beside it as "superseded", not counted. Proved: 2.51:1
  fails and 7.79:1 passes.
- **The thumbs' target area.** A probe settled it. The input is
  `pointer-events: none` and its thumb is `auto`, so a hit test over the
  thumb reaches the input: 22 hits at 2 px along each axis. Targets are
  now hit-tested over the thumb's box. Chrome hit-tests the disc, not
  the square: a 44 px disc gives a 44 × 44 hit box with 1,600 px² hit,
  and no 44 px square fits inside it. That case is "cannot determine",
  with both readings, for VH-173. Proved three ways: a 20 px thumb
  fails, a 44 px square passes, and a 44 px disc reads "cannot
  determine".

## Seen in the pilot, for VH-173 (findings, not instrument faults)

- The file chooser's focus ring is clipped by the input's own box. In
  the app and in a fixture built like it, the ring on
  `::file-selector-button` (2 px, offset 2 px) shows only as a 2 px
  sliver on the button's right edge: 88 px² changed at 3:1 against the
  680 px² band of a 130 × 44 button. The button fills the input's
  44 px height, so the ring above, below and to its left falls outside
  the box Chrome clips it to. A twin with 4 px of room inside the input
  passes (744 px²). This bears on 2.4.7 and 2.4.13 and on Codex's D-03;
  VH-173 ranks it. The plan's rank-1 rule applies if it ranks 1.

## Pilot 2

`pilot2-digest-2026-10-22.md` gives every record. `pilot2-manifest-2026-10-22.json`
holds 43 declared and 43 observed. The run is not whole: the three
fallback records failed. Once the "lang" assertion and the dialog route
were settled, K-dialog passes. Two findings are confirmed for VH-173:

- The file chooser's ring reads 88 px² against its button's 640 px² in
  every view, mode, language and proxy (152 of 1,240 at the 32 px
  font).
- Under forced-light, the language switcher's ring reads 480 of 498 px².
  VH-173 judges this near miss.

The thumbs stand at 246–256 px² against 264 for the box reading and 157
for the painted one, so "cannot determine" holds everywhere except
forced-dark and dark, which pass.

## Pilot 2's three instrument faults, fixed (third chat)

Each fix has a failing fixture and a passing twin; `prove-2026-10-22.json`
holds 40 of 40 proved (the second chat's 35, plus 5).

- **Fallback faces.** Vite serves a font's `?url` import as a module
  script whose URL ends in `.woff2`, so blocking `*.woff2` by URL failed
  the module graph and the boot never finished. Fonts are now failed by
  resource type (`Fetch`, `resourceType: 'Font'`), never by URL. Proved: a
  page whose face fails and whose script named `face.woff2.js` still runs
  passes; the same page with the face allowed fails. In the app, only
  `lora-bold.woff2` is failed, Lora reads `error`, and the boot completes.
- **The file button behind the modal.** With the feedback dialog open, the
  button is inert and dimmed by the backdrop; the pixel reading is now
  "inert" and exempt, as targets are. The "paints nothing" readings at
  320 px, the 32 px font and both proxies were the same case: the dialog
  covers the button. Proved on a file input behind a `showModal()` dialog.
- **Thumbs at the 32 px font.** The thumb's box is found by hit test, at
  1 px around where its value puts it, never from the input's height,
  which grows with the default font. Proved: in an 88 px tall input, a
  20 px thumb fails and a 44 px square passes.

Fonts, the closings and the worker share one request router
(`faults.mjs`, `route`), because `Fetch.enable` replaces its patterns on
every call.

## The faults and fixtures the scenarios need (third chat)

`walker/faults.mjs` holds F1–F9, each a switch around the app, never a
change to it; `node faults.mjs check` applies each to the app and asserts
the state it is for (now `faults-check-2026-10-23.json`). F4 gains **e** (no
picker and `URL.createObjectURL` throws: the only way `saveFile` throws,
for S-69); F4d gives S-70's download hand-off, not a failure. F6 is two
variants: **a**, the onset only (a cut); **b**, every closing (not
loaded). **F9** rewrites the worker's entry module so its storage
estimate rejects (S-73). **F3** is a worker prelude too: the estimate
reports a set quota (S-31), because `Storage.overrideQuotaForOrigin`
changes nothing in the isolated browser context each walk opens (probed:
10.7 GB before and after). S-56, running out part-way, is F12 (below). A first check caught F4e's throw failing the
preview's own object URL, as the subagent that applied the scenario check
predicted; the chosen file is now spared. `walker/fixtures.sh` gains N1 (a cut-short MKV),
N2 (two long 1080p stills, their lengths set by `LONG_WARN_S` and
`LONG_SLOW_S`), N3 (float PCM with a burst at about +8.5 dBFS at 0:12)
and N4 (a 0.8 s clip, under the closing's 1 s onset).

## Pilot 2, re-run whole

`pilot2-digest-2026-10-22.md` and `pilot2-manifest-2026-10-22.json` are
the re-run on the final instruments: 43 declared, 43 observed, whole.
Seen for VH-173 (findings, not instrument faults):

- The file chooser's ring reads 88 px² against its button's 640 in every
  view, mode and language, the fallback included (152 of 1,240 at the
  32 px font).
- Under forced-light, the language switcher's ring reads 480 of 498 px².
- **At the 32 px default font, the trim thumbs' ring is lost.** The
  thumb's fill is drawn by rem-based stops (`--spacing-04`, 0.75rem), so
  at 32 px its dark disc fills the whole 44 px thumb; the 2 px ring, drawn
  inside it in `--focus`, sits on that fill at 2.17:1. 0 px² changed at
  3:1, 102 px² changed at all (`S-15__w1280__font32__focus-2`). The clip
  holds the thumb: its box is 44 × 44 and its painted disc 43 × 44.
- The thumbs elsewhere stand at 246–256 px² against 264 for the box and
  157 for the painted disc: "cannot determine", VH-173's reading.

## F10 to F12, and N2 sized (fourth chat, 23 October)

`walker/faults.mjs` gains three worker preludes, by F9's route:

- **F10**, for S-89: the worker's `navigator.hardwareConcurrency` throws.
  `inspectCapabilities` reads it once inside the pre-flight's `try`
  (`src/media/capability.ts:190`); the calls before it catch their own
  errors, so it is the first that reaches `check-failed`.
- **F11**, for S-90: the worker's first `stage` message passes, then every
  message is dropped, the cancel's answer included; the watchdog stops
  the job after 120 s and the locks hold 10 s more.
- **F12**, for S-56 and S-57: the worker's
  `FileSystemSyncAccessHandle.write` throws `QuotaExceededError` once a job
  has written 256 KiB, once only, so the retry runs. F3 stays the
  storage block (S-31); S-56 no longer rests on it.

`node faults.mjs check` asserts each state: F10 says "The device check
did not finish" with Check again shown; F11 says "The job stopped
reporting progress" and "The job is stopping", the chooser locked, and
the locks lift; F12 says "ran out of working space part-way" and the
retry finishes. 17 of 17 faults reach their state
(`faults-check-2026-10-23.json`, which replaces the 22 October file).

N2 was sized by a probe (choose the still, read the pre-flight's
sentence) on this Mac: 3,600 s estimated about 15 minutes, "Ready to
go"; 10,800 s about 40 minutes, "Ready, with one thing to know … Keep
this tab open"; 21,600 s is chosen for the slow band by that rate (about 0.22 of the length, so about 80 minutes) and probed before VH-172 runs. `fixtures.sh` now makes 10,800 s and 21,600 s by
default. The estimate is timed on the device, so a slower machine moves
both; the matrix asserts the verdict it reached, never the length.

## Codex astra's method check, applied (23 October)

The check is `codex-astra-method-check-2026-10-23.md`. M-06 (the scenarios)
and M-07's S-19 fixture and N2 probe are applied apart. The files of
22 October named above (`prove-`, `pilot2-manifest-`, `pilot2-digest-`) are
replaced by those of 23 October.

- **M-01, applied.** `aggregate` (now in `runner.mjs`) never passes an empty
  list ("cannot determine") or one with nothing counted ("not applicable");
  exempt rows (inert, off-page, inactive, superseded, disabled, inline)
  stay with their reason. The inline exception is justified: a link
  displayed inline that shares its line with text outside it. That retired
  the old heuristic's silent exemption of the off-page skip link. Each
  declared record names its required instruments and view. The runner fails
  a record missing one, an instrument passing on nothing, a wrong width,
  height or scale, a broken identity, or a state that no longer holds once
  the instruments have run (re-asserted after them). Completeness
  (`coverage`) is kept apart from measurements (`measurements`). Proved: an
  empty measurement, a wrong view, a missing instrument, an expired state
  and a missing variant (`S-80~denied`). Record keys take an optional
  variant.
- **M-02, applied; one limit.** The file button's text is read from glyph
  pixels only: the pixels that change when its text alone turns transparent,
  with every other paint pinned (forced colours included). They must lie
  inside the content box from its computed border and padding, or the
  reading is "cannot determine". Proved on a black-bordered white button
  with grey text (2.07:1 fails) and its dark-text twin. Ratios are compared
  unrounded (6.998 fails 7). The large-text threshold applies to all
  readers. A new `contrastText` returns "cannot determine" for unparsed
  colour, background images and opacity, filter or blend on an ancestor.
  Under forced colours it reads `color`, because Chrome's computed
  `-webkit-text-fill-color` keeps the unforced author colour (probed). Range
  paint is "cannot determine" (limit: a person reads thumb and track
  contrast). The SVG loop reads every shape's fill and stroke. Limit: the
  pilot's S-15 landscape reading was "cannot determine" because pixels
  beside the button repainted between shots.
- **M-03, applied.** Every rendered line is kept with its text. Rendered
  spaces count; leading and trailing spaces at a wrap do not; inline runs
  join on vertical overlap. Input values, placeholders and textareas are
  laid out in a copy of the field. Each block's widest line is read against
  28rem. Proved: 81 and 79 characters, mixed scripts each way, and a
  textarea each way.
- **M-04, applied in part.** The overflow verdict fails on text cut by a
  clipping ancestor, text spilling from a box held at a set height, and
  offenders carrying text or a control. Proved: a clipped box and a spilling
  box, neither widening the page, and the clipped box's twin. The manifest
  names four categories: reflow, proxy (real zoom unresolved), the 32 px
  default font, and synthetic text-only "not run". Limit: operating a dialog
  at enlargement (entry, use, exit) is not run by keys; it is on the
  manifest's manual list.
- **M-05, applied.** Each record persists its full AX rows and a
  timestamped DOM log (live-region text and attributes, ARIA and state
  attributes, nodes), labelled exposure, not speech. Live regions carry
  their text. Modal leakage covers all exposed content. Each keys step keeps
  the focused element's identity, value and status text before and after;
  routes can type. `holdKey` and `pressedAppearance` read a held key. Motion
  is watched by `getAnimations()` while the focus measurements drive the
  page. Spatial movement fails; colour or opacity change, and changes of
  10 ms or less, are not counted; the progress bar is essential. Proved: a
  triggered slide (fails) and its reduced-motion twin, colour only,
  essential, pressed each way, an asynchronous keys route each way, and
  live exposure each way.
- **M-07 (F1, F4b, fault evidence, file focus), applied.** F1 asserts
  pending with the chooser locked, then, held past 5 s, "The part of the
  tool that does the work did not start", still locked. F4b requires
  Saving with Stop saving offered, presses it, and asserts "Save stopped".
  Every fault result keeps the matched text in a window around the match.
  A file-focus pair with an identical 2 px ring differs only in 4 px of
  room: 88 px² of 680 fails, 744 passes.
- **M-08, applied.** Every capture and persisted reading is written under
  `captures/` in the unique run directory. It is named with the full record
  key and subject, and an existing file throws (proved). Walk logs sit
  under the run id. The manifest lists expected and observed keys, every
  fixture a setup chose (hashed), and the artifact list's hash
  (`artifacts.json` holds each file's hash). Its unresolved entries are
  derived from the measurements, each marked a missing measurement or an
  interpretation for VH-173, beside the manual limits.

Totals: `prove-2026-10-23.json` holds 77 of 77 proved (the third chat's 40,
plus 37). `faults-check-2026-10-23.json`: 17 of 17 faults reach their state.
Pilot 2, re-run (`pilot2-2026-10-23T08-41-27-215Z-432dfe`,
`pilot2-manifest-2026-10-23.json`, `pilot2-digest-2026-10-23.md`): 43 declared,
43 observed, whole, with 500 captures.

Seen for VH-173 (observations, not instrument faults):

- The file ring is unchanged at 88 of 640 px².
- The language switcher reads 480 of 498 under forced-light.
- The thumbs read 0 px² at the 32 px font.
- The disc readings remain open.
- The file button's glyph text reads 14.3–15.4:1, 11.3:1 under
  forced-light and 9.1:1 under forced-dark.
- With spaces counted, no line exceeds 80. One Chinese notification line,
  `发送电子邮件至 joe.bell@nottingham.ac.uk…`, holds 41 mixed characters:
  "cannot determine" in all three Chinese records.
- No text is clipped or spilled in any view.
- Under reduced motion, only instant outline transitions run.
- The feedback textarea outgrows the 400% proxy viewport.

## VH-172's setups merged, and the smoke plan (23 October)

- **Merged.** VH-172's scenario setups (`walker/scenarios.mjs`, with M-06's
  variants) are merged into this walker; `matrix.mjs` imports SCENARIOS,
  ROUTES and PLANS from it. Every M-0x fix above is kept; route steps gain
  `setup`, `text`, `untilState` and `waitFor`, and faults that can be undone
  gain a `release`.
- **N5**, `clipped-30s.mp4` (S-19): a 440 Hz sine at 1.6, hard-clipped at full
  scale, stereo, 30 s, +0.7 dBTP.
- **N2 and S-25.** The 21,600 s still never settled (whole-audio pre-flight),
  and CDP CPU throttling does not reach the job's worker ("only supported for
  pages"); throttling the page left the estimate at 45 minutes. A new fault,
  **F13**, runs the worker's clock at twice real time: with the 10,800 s still
  the page says "This will work, but it will be slow", about 1 h 25 min, and
  Continue anyway, settling in about 80 s; F13 passes its fault check.
  `fixtures.sh` builds the 3,600 s and 10,800 s stills; `LONG_SLOW_S` is
  optional. S-24's estimate is load-sensitive: 45 minutes idle, 65 under load.
- **Smoke**, `smoke-2026-10-23.json`: 119 of 119 records, whole across a full
  run and a part run of its six failures. Those six were instrument faults,
  fixed: the phone view's device signal (S-26), S-31's setup waiting for a
  state the storage block never reaches, the encode wait under load (S-43,
  S-48, S-49), S-74's error behind a closed disclosure, S-79b's message too
  long for the email link, and `cdp.mjs` failing calls on a closed socket
  instead of exiting silently.
- **Seen for VH-173**: the file button's focus area fails in every state
  that shows it (nine records); the range thumbs' target and focus readings;
  focus not reaching `#trim-clear` (S-21) or the result's Save (S-62); a
  mixed-script line's length (S-05); J1's native select by keys.
