<!-- markdownlint-disable -->

# VH-208 — Claude's verdict, 28 October 2026

Written by VH-208 #6 while Codex astra's blind check ran (started 15:09:30Z), before its answer was opened. It judges the candidate: the working tree against `a87e0f5` (nine files), the table `vh208-warnings-2026-10-28.md` and its records.

## The criteria

| Criterion | Verdict | Evidence |
| --- | --- | --- |
| Before the player and Save, DOM and visual alike | met | See below. |
| One notification treatment | met | See below. |
| Spoken with the completion | met | See below. |
| The pins moved, not dropped | met | See below. |
| VH-193 and VH-192 kept | met | See below. |
| F15b's state checked | met | S-152 (table §10): order, warning, `MediaError` and completion line recorded; no word changed (VH-212's). |
| Stage rule: measured before and after | met | See below. |
| Stage rule: WCAG re-checked | met, with limitations recorded | Table §9. See below. |
| Stage rule: tokens | met | See below. |
| Stage rule: documents | met | See below. |
| Stage rule: the gate | due at the close | `npm run check` has not run on the candidate. |
| Stage rule: Codex's check | running | This verdict is its blind partner. |
| Linked: the Disposition row for V-52 | due at the close | |

**Before the player and Save.**
- `main.ts` appends `resultWarnings` to the card after its title and lines and before `resultPlayerFor(…)`, the lifetime line and the actions row.
- The probe's painted order, after: title, warnings, player, lifetime, Save in S-135, S-136, S-151 and S-152. It is title, warnings, Save after a save (S-137), and title, warnings, player, Save under "Previous video" after Keep it and another file (S-138).
- The accessibility tree has the warnings region inside the card's region, before the Video and Save, in every warned cell.
- `paint` redraws the warnings into the same container on a page-language change. S-137 and S-138 change the language and keep the order.

**One notification treatment.**
- `renderWarnings`'s `contentOnly` path replaces the box's class with `result-warnings` and drops `data-kind`, so no `.notification` is nested in the card and there is no second rail.
- The probe reads `nestedNotification` false in all 198 cells, before and after.

**Spoken with the completion.**
- `warningsSpoken` keeps the existing line and joins heavy limiting's existing detail, chosen by its code, with the language's sentence gap. No string is new or split.
- The live write ends with the detail in every warned after cell (27, 27, 24, 24, 24, 24) and in none before.
- S-151 (Announce progress off) writes the same line. The metadata warning stays title-only (a unit test, and the S-136 and S-151 texts).

**The pins moved, not dropped.**
- VH-150's test is rewritten, not deleted or skipped. It pins the order and `replaceChildren(heading)`, and still forbids nesting through the `contentOnly` path.
- `warnBox` is qualified for both layouts, the completion check has its new detail row with a heading-only fixture that must fail, and `announce.test.ts` matches.
- VH-208 #3 proved them: 85 of 85 and 14 of 14, at `a3a4267ad47d8bd5`.

**VH-193 and VH-192 kept.**
- Heavy limiting is first and word for word in every warned cell, before and after, by the limiting rows.
- Save stays the actions row's one primary: its focus rows are identical, and no button is added.
- The player leaves after a save: S-131 is 24 of 24 identical, and S-137 has no player.

**Stage rule: measured before and after.**
- 198 cells before and 198 after (after-1 and after-2), whole, at one instrument revision. The before is a `git archive` export of `a87e0f5`.
- The before and after are in one power mode (AC, mode 2), and the load is judged by section 5's rule: every after cell has a read below 8 that matches its others, except S-138's row (the ruling).
- The tree's order, the live write, the painted order, the card's height and the first screen at 320 px are all read (table §4).

**Stage rule: WCAG re-checked, with limitations recorded.**
- 1.3.1, 1.3.2, 2.4.6, 1.4.10 and 1.4.12 hold by the walk.
- 2.4.3 and 4.1.3 hold as exposure, with real screen readers left as a limitation (task A).
- 1.4.8 is unchanged, with the browser's 200% left to a person.
- 2.4.13 holds for Save, unchanged.
- The player's 2.4.13 is unchanged by the diff and not re-read by pixels here. The card's own ring is cannot-determine in 32 cells (below).

**Stage rule: tokens.** One rule, `.result-warnings { margin-top: var(--spacing-05); }`, on an existing token. No literal, no element or control: the container `div` existed and only moved. The progress bar is untouched.

**Stage rule: documents.**
- UI-STANDARDS states no rule this changes. Its "one inline notification … titled items" already covers warnings as the card's titled content, and it stands at 2,399 words of 2,400, so nothing is added.
- Spec §9.1 and §9.3 state no order of the warnings against the player (VH-208 #1's reading), so no correction is needed.

## The code

- **Correct as built.**
  - The `contentOnly` default leaves the pre-Create sound panel (`main.ts:1659`) as it was, with its notification and reassurance.
  - `warningsSpoken`'s other caller (`main.ts:1666`, the sound heading) never holds `heavy-limiting`, which only `detectProductionWarnings` makes (`src/audio/warnings.ts:226`).
  - An empty result leaves an empty `div` with no class, so S-53's card height is unchanged (698 px), as the walk shows.
- **Should 1, minor.** A comment line in `renderResult` (`main.ts:3320`, "output's warnings, the lifetime, and Save as its action. Built once here, and its words written") is now about 100 characters, longer than its neighbours. Prettier leaves comments alone. Rewrap it to the block's width.
- **Note.** The screen-text pin is a source-text test, the project's existing form for VH-150's pin. The walk proves the behaviour (198 cells).

## The digest rules (rule 8)

- **nielsen 1, "status visible and announced":** the completion's write now carries the advice, and it is visible in the card before the player.
- **nielsen 5:** the advice comes before the Save that removes the player, so the listening step can still be taken.
- **nielsen 6:** what to do stands with the controls it concerns.
- **carbon, "one primary per state":** Save is still the only primary, and "Create the video again" is secondary and unchanged.
- **wcag-2.2-aaa, 4.1.3:** the status message is exposed programmatically. The speech is a person's to check.

All applied.

## The evidence: what I would add or record

- **Should 2: the before's source.** The table names the export but shows no content check. I ran one read-only: `git archive a87e0f5`, extracted, against `vh208-walk/base/`, with `diff -rq`, excluding `node_modules`, `dist` and `.vite`.
  - Only the three overlaid walker files differ, and each is byte-identical to the candidate walker.
  - Record it beside the records (`before-source-check.txt`) and in table §1.
- **Must, for the close (rule 5): the card's focus ring.** In 32 cells (S-151 all, S-137's en-GB and ms-MY at 320 px) focus sits on the card, now taller than the viewport, and the instrument reads cannot-determine ("the clip is cut by the viewport"). It is not a regression of the ring: its rule is unchanged, and it passes by the same 64 px² where the card fits.
  - It is a reading the item's change made unavailable. So it is a limitation in the table, as written, and a wish line: the card's ring read whole once the card outgrows the viewport (by scrolling the clip or a taller viewport) in VH-203's after-run or the walker.
  - Not a walker change in this item.
- **Must, for the close (rule 5, #21's ruling): S-138's player row.** It is a walker defect, a 1 s sample racing the walker's own save, so it is a wish line.
- **Must, for the close (rule 5): VH-203's after-run.** Two lines: S-91's changed assert walked there, and `heavy-193.mjs:78`'s selector, which won't match the content-only warnings.
- **The correction of VH-208 #4's account** (the focus change it missed) is made in the table. The two corrections of VH-208 #5's notes (the first-screen cells; S-138's counts) are made too.

## Verdict

Commit after the close's musts: the gate green, the three wish lines (or backlog lines), the Disposition row and the ledger. Should 1 and should 2 are taken before the close check. No point needs the owner.
