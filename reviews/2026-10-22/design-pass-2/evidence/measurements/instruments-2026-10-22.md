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
the state it is for (`faults-check-2026-10-22.json`). F4 gains **e** (no
picker and `URL.createObjectURL` throws: the only way `saveFile` throws,
for S-69); F4d gives S-70's download hand-off, not a failure. F6 is two
variants: **a**, the onset only (a cut); **b**, every closing (not
loaded). **F9** rewrites the worker's entry module so its storage
estimate rejects (S-73). **F3** is a worker prelude too: the estimate
reports a set quota (S-31), because `Storage.overrideQuotaForOrigin`
changes nothing in the isolated browser context each walk opens (probed:
10.7 GB before and after). S-56, running out part-way, needs a write that
fails, not yet written. A first check caught F4e's throw failing the
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

## Still open before VH-172

- Codex astra's method check.
