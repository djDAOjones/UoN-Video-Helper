# The instruments qualified and the pilot — VH-171, 22 October 2026 (checkpoint)

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

## Open before VH-172 (instrument questions, not findings)

- Rendered focus takes the whole control's box as the 2 px perimeter's
  reference. For the file input (828 px wide, its button a pseudo-element)
  and the range inputs (the ring is on the thumb) the reference must be
  the button or thumb; until then those three are not findings.
- K-dialog: Tab past the dialog's last control leaves the document
  (focus reads `body`), as a native modal dialog does in Chrome; the
  route must say where focus may go, not fail on it.
- The file button's text under emulated forced colours reads 1:1 from
  computed style; a pixel check must settle it before it is reported.
- Range thumbs' target area: cannot-determine by hit test; to be measured
  from the thumb's size or by pointer.
- Not yet run: the other languages, 375 / 320 / landscape / short views,
  the forced-dark palette, the enlargement records (320 px reflow, the
  200% and 400% proxy views, the 32 px default font), text spacing,
  reduced motion, fallback faces; the scenario draft's faults F1–F8 and
  fixtures N1–N3.
