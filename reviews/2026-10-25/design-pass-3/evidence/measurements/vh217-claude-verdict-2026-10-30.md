<!-- markdownlint-disable -->

# VH-217 — Claude's verdict, saved before Codex's blind check is opened

**Verdict: commit, once the gate is green.** Candidate `dd171e2a95f72247` on `bdf6b6d`.

## The criteria

- **The gap: met.** `margin-left: var(--spacing-02)`. Box to square 8.45 px in all three languages. Ink to square 9.85 px in en-GB and ms-MY, 18.37 px in zh-Hans, because that full stop's ink sits at the left of its wide box; its box gap is the same. "About 8 px" is true by the box, and by the ink for two languages of three. I report zh-Hans rather than treat it: a per-language margin is not what he approved, and the clip reads well.
- **The overlap: reported.** 2.15 px over the ink, 3 or 4 ink pixels on the middle line, against "about 4 px expected"; none at 32 px, none in zh-Hans. Target hit 100%, 3,600 readings. A click on the end of the full stop opens the tip; words are no control.
- **No sideways scroll at 320 px: met** at the default font. At 32 px it scrolls as before, the same 708 readings; VH-209's for its six records.
- **The open state: met, after the repair.** Both "?"s. Token pair and its hover and active pairs; holds over the secondary's rules at (0,3,0) and (0,4,0); disabled excluded. Forced colours Highlight and HighlightText.
- **Tests: met.** Both files; the repair pinned. The full suite is the gate's to prove.
- **The combined cells: met.** Qualified, proof 99 PASS, one revision each side.
- **The words: met.** The comment and the test description.
- **The stage rule:** all ten scenarios × 3 × 6 × 8, each side. **Tokens** on two files, no literal, no element. **UI-STANDARDS:** no rule changes, unless Codex finds one. **`docs/`:** none.

## The defect I found

The clips showed a grey open "?" on hover under forced colours. No number flagged it: the contrast passed. A token hover at (0,4,0) beat the forced rule at (0,3,0), and the opt-out let it show. Repaired by restating the fill. The same check for the other states: `:active` at (0,4,0) in the forced block comes later and sets all three; `:focus-visible` sets only the ring and no fill rule competes. None remains by my reading.

## The evidence, and where I am less sure

- **a to e on the first candidate.** Enough, in my reading: the repair is one declaration inside a forced `:hover`. It cannot move layout, order or a closed state. A walker row that hovers an open "?" in forced colours would read a different fill, and I have not proved none does. The contrast there is 13.76 or higher either way. VH-203 reads the final page.
- **Load.** Peaks to 74.68. Nothing timed; each reading is DOM, layout, colour or focus. The three moved cells all improved, and before-a's two were at load 12 to 30. I read them as flakes, not effects, without having re-run them on the base: a judgement.
- **108 unreached cells at w375, 32 px.** Alike on both sides, the walker's own window check. Not a reduction by this item; the probe reads those conditions. But the walker's coverage of that width and font is 12 of 120 cells, all zh-Hans, and no item covers it. Wish line.
- **Highlight's alpha.** The probe ignores it. By arithmetic the worst pair clears 7:1; not read composited.

## Does it look good

Yes, from en-GB, zh-Hans and ms-MY, rest and open, 1280 and 320 px, light, dark, forced and 32 px. The dark open "?" is the pale filled square that the chosen segment is. The small gap reads as belonging to its sentence.

## To report to the owner

zh-Hans's ink gap; the overlap; `type`'s "?" at 0.875rem / 1.25 / 600 on none of the eight roles, not this item's, every reached cell, alike (`--line-height-heading`, the conflict named at the design); the 108 cells.

## Wish lines

VH-217.1 the w375, 32 px cells. VH-217.2 the "?"'s type role.
