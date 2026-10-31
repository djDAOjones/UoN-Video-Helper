<!-- markdownlint-disable -->

# VH-217: blind check of the candidate

You are Codex astra, reviewing read-only. Say what you find, in your own reading. No other reviewer's reading is given to you.

**Read:** `project/items/VH-217.md`, every criterion; `git diff bdf6b6d2ab8a972b2d8420a558901167ffb0ddf9` in this checkout (the candidate: `src/styles/app.css`, `test/stylesheet.test.ts`, `test/contrast.test.ts`, `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/qualify.mjs`); the table `reviews/2026-10-25/design-pass-3/evidence/measurements/vh217-format-help-2026-10-30.md` and its records `vh217-records-2026-10-30/` beside it; `src/styles/tokens.carbon.css`, `tokens.brand.css`, `index.html`, `UI-STANDARDS.md`, `project/digests/carbon.md`, `project/digests/wcag-2.2-aaa.md`, `project/wish-list.md`, `project/items/VH-209.md`, `VH-210.md`, `VH-203.md`. In `/Users/joe/UoN-Video-Helper-side/vh217-walk/` you may read the clips under `after-states3/out/states/` and `before-states2/out/states/`, and the load logs.

**Do not read:** any folder under `side-session-notes/`; in `/Users/joe/UoN-Video-Helper-side/`, `vh217-claude-*`, `vh217-*compare*`, `vh217-progress.md`, `vh217-handover-*`, any `vh217-*brief*` but this one.

**The owner's words:** "I accept everything, but even old issues should be solved for. we also need to make sure that question mark about file formats looks good"; "yes to the question mark, and A and B. ensure everything passes UX / design / Accessibility". The overlap with "format." is reported to him and he sees it in VH-203's captures: it is no stop.

**Settled, do not reopen:** rows pinning the old page order fail alike (his "Yes, leave them", wish VH-216.1); the walker has one revision on his word and no change beyond the combined modes the item names.

**Answer each:**
1. Every acceptance criterion in the item: met, or how not, with file and line or record.
2. The CSS: specificity against `.button--secondary` hover and press, the disabled rule, and the forced-colours block. The first candidate had a forced-hover defect, repaired: is the repair right, and does any like defect remain, in any state or mode?
3. Carbon, "one primary per state": a state, as the chosen segment is, or a second primary?
4. WCAG 1.4.1, 1.4.6, 1.4.10, 1.4.11, 1.4.13, 2.4.7, 2.4.13, 2.5.5, 4.1.2, from the readings. Is any reading in the table not supported by its records?
5. The evidence. Groups a to e were walked on the first candidate and only the states probe on the repaired diff: enough, or must they be re-walked? Load peaked high in several groups (the table states each): does it make any reading unsafe, and must any re-run? The combined 32 px modes: qualified as the item asks? The 108 cells at w375, 32 px not reached on either side: is it stated rightly, and is it a coverage reduction?
6. Does it look good? Read the clips: both "?"s, rest and open, 1280 and 320 px, three languages, light, dark, forced, default and 32 px.

**Verdict:** one of "Commit", "Commit after the musts below", or "Do not commit". Musts, shoulds and notes apart, each with its evidence. Write nothing to the repository.
