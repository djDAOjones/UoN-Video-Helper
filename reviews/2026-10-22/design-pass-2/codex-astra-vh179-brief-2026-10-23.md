# Codex astra brief — VH-179, three focus rings drawn whole, the feedback message to the measure, a forced-colour hover (V-40, V-41, V-42, V-33, V-44), 2026-10-23

You are checking one fix item's candidate diff in this repository, read-only. Base: commit 7f3ea6e. The candidate is the working tree against HEAD: `git diff` plus the new files `reviews/2026-10-22/design-pass-2/evidence/measurements/walker/rings-179.mjs`, `reviews/2026-10-22/design-pass-2/evidence/measurements/vh179-rings-2026-10-23.md` and the ten `vh179-*.png` captures beside it. Do not run the walker or the gate; their results are in the evidence file.

The item is `project/items/VH-179.md`; read its acceptance criteria in full, and `project/items/VH-176.md` for the stage rule every fix keeps. The findings are V-40, V-41, V-42, V-33 and V-44 in `reviews/2026-10-22/design-pass-2/design-pass-2-2026-10-23.md` (and their Disposition rows); your blind review's D-02 and D-03 are in `codex-astra-blind-review-2026-10-22.md`, and your fix-plan critique's F-01, F-02 and F-04 in `codex-astra-fixplan-critique-2026-10-23.md`. The owner's ruling that added V-44 is the newest entry of `project/decisions.md` but one ("The owner decides the four wish lines").

What the candidate does, in brief:

- `src/styles/tokens.carbon.css`: `--focus-room` (`--focus-width` + `--focus-offset`); `--thumb-disc: 12px` and `--thumb-halo: 2px` beside `--target-min`; a line on the house's weighted CJK count in the measure's comment.
- `src/styles/app.css`: `.file-input` pads its button by `--focus-room` inside its own box and gives it back with an equal negative margin, its width `calc(100% + 2 * var(--focus-room))` (V-40); the six thumb gradients take the px tokens (V-41); `#feedback-message` joins the card fields' `max-width: var(--measure)` list (V-33); under forced colours, the chooser's ring takes CanvasText in both looks (V-40), a filled or danger button and the unchosen chooser take a HighlightText border on hover, before the press rule (V-44), and the band's ring is drawn 3 px inside the focused face's border in ButtonText, HighlightText on the chosen face (V-42).
- `test/stylesheet.test.ts`: the measure list grows with `#feedback-message`; a new describe pins the room, the forced ring, the thumb tokens, the band ring and the hover's order; one test is renamed ("where hover changes only the border").
- `UI-STANDARDS.md`: the measure line states the owner's ruling (a CJK glyph counted as two against 80, mixed lines too; 1.4.8 met apart by G204's reflow), and the forced-colours line says the ring is in system colours and hover changes a filled button's border alone; words traded in the Carbon-first bullets to stay at 2,400.
- The walker: `PLANS.vh179` in `scenarios.mjs`; `pressedVsHover` also returns hover against rest (`qualify.mjs`), not counted in its verdict; `rings-179.mjs` reads V-18's painted button, the rings' computed colours and the chooser's ring while Space holds it.
- The report's five Disposition rows; the item's Now and Notes.

Check, with file:line:

1. Each acceptance criterion: met, or not, and why. In particular: does the room leave the painted button where it was and the step no taller (V-18's six readings); is the ring whole focused and keyboard-pressed, chosen and unchosen, at both font sizes; is every thumb rule (WebKit, Firefox, disabled, the three forced) on the px tokens; is the band ring's colour right on both forced palettes' Highlight, and its placement clear of the neighbours; is the measure a cap that yields; does the press still win over the new hover, and is nothing changed outside forced colours.
2. V-41: the after reads 230 px² against the thumb's 44 px box (264, 270) and passes against the painted disc (157), as the default size does. Is that the criterion's "pass against the painted disc", or does the criterion require more?
3. V-42: the ring is 3 px inside, not the 2 px the token gives, so its area makes 2.4.13's perimeter. Is that a fair reading of the rule, and is the offset arithmetic right?
4. Is the evidence sound: the walker's plan covers the 110 records and the touched ones in three languages and four colour modes; `rings-179.mjs held` counts only pixels outside the painted button; the held before was taken on the base's `app.css` put back in the working tree.
5. The stage rule: no control or element added, the progress bar kept, our own CSS on the two token files, `docs/` untouched, numbers in tokens, UI-STANDARDS within 2,400 words, the digest rules named.

Reply with a verdict line first ("Commit", "Commit after the musts below", or "Do not commit"), then numbered points, each marked must or may, each with file:line. Be brief.
