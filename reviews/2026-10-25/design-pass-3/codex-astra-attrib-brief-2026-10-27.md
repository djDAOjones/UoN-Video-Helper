<!-- markdownlint-disable -->
<!-- The brief Codex astra was given for its blind attribution of the unresolved rows in the third design pass (VH-200, 2026-10-27), verbatim. It ran with `codex exec -m gpt-6-astra -s read-only` in the repository's working tree at 25b6ccb, outside any commit of VH-200's. -->

You are Codex astra, giving a blind attribution for VH-200 (Pass 3 judged) in the UoN Video Helper repository (read-only). Claude has saved its own attribution elsewhere; you have not seen it, and you must not look for it. Work only from this repository.

## The evidence
VH-199's evidence run: 3,207 records on `a3039c3` (the page unchanged since `2bcb191`, and unchanged in `src/` at HEAD but for VH-205's lede "?" in `src/styles/app.css`), at instrument revision `2e7b0c044ce11f2b`, Chrome 156. Read:
- `reviews/2026-10-25/design-pass-3/evidence/measurements/`: `digest-focus-2026-10-27.md`, `digest-player-2026-10-27.md`, `digest-subresults-2026-10-27.md`, `digest-asserts-2026-10-27.md`, `digest-overflow-2026-10-27.md`, `contract-2026-10-27.md`, `matrix-2026-10-27.md` (its "Seen for VH-200" and "Counted" sections);
- the scenarios in `reviews/2026-10-25/design-pass-3/scenarios-2026-10-25.md`;
- the walker in `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/` (`phase8.mjs`, `matrix.mjs`, `qualify.mjs`);
- the run comparisons in `reviews/2026-10-25/design-pass-3/evidence/runs/`;
- the source in `src/` and `index.html`; `git log` and `git show` as you need them (VH-176's after-run passed S-24 at the 32 px font: `reviews/2026-10-22/design-pass-2/evidence/measurements/after-run-2026-10-24.md`).

Do not open any file over 1 MB, and do not run the app or the walker.

## The rows to attribute
For each row, give: the class (**app**, the page as built; **scenario**, what the scenario itself does; **instrument**, how the walker reads; or **unresolved**, the evidence cannot separate them), the reason with file:line citations, whether it is a finding, the WCAG criterion or heuristic if so, and a rank (1: a novice is blocked, misled, or could lose work or trust; 2: real friction or a breach of a named standard; 3: polish).
1. **S-88**: the finish+1s row "paused a second after the card appeared" reads `player: false` ×6.
2. **S-128**: the same row reads the video playing ×31.
3. **S-149**: three light records leave focus on `body` after an unreadable file is chosen with focus on a Video language radio.
4. **`#preset-choice input:checked` at the 32 px default font**: 284 of 304 px² at 3:1 ×10 (S-15 ×3, S-24, S-108 ×3, S-110 ×3). S-24 en-GB w1280 font32 passed in VH-176's after-run. Say what flipped it, if the evidence can show it, and whether the present reading is a 2.4.13 failure.
5. **`#onset-help-button`**: 460 of 464 px² ×1 (S-113 ms-MY w320 font32).
6. **`#contact-creators` in the forced palettes**: ×8, where it wraps (S-83, S-145), 1,108 of 1,264 and 1,595 of 1,968 px².
7. **S-81's `#accessibility-statement a`**: ×11, 1,361 of 1,865 px², with the link wrapped (box 429 × 41, changedAny 1,363). Say how 2.4.13's "perimeter of the unfocused component" applies to a link that wraps across two lines, and whether this is a failure.
8. **S-127's player controls**: 183 2.4.13 rows "cannot determine" (Play's ring 90 of 368 px² at 3:1). The walker says the first exception does not hold and the second is undetermined. Say whether either of 2.4.13's exceptions applies, and so whether these rows are a failure, n-a or undetermined. Do the same for the 39 2.4.7 rows and the 39 4.1.2 rows.
9. **S-152's and S-132's player host**: named "Unable to play media." under fault F15b while `aria-labelledby` points at the card's title.

End with a table: row, class, finding (yes/no), criterion, rank. Keep it under 1,500 words.
