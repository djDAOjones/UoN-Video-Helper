<!-- markdownlint-disable -->
<!-- VH-211's compare of Claude's plan with Codex astra's blind fix items (VH-211 #2, 2026-10-27), written as vh211-plan-compare.md in the orchestrator's notes and updated after Codex's critique and close check, verbatim. -->

# VH-211 — Claude's plan beside Codex astra's blind fix items (VH-211 #2, 2026-10-27)

At `51a7201`. Claude's plan: `vh211-claude-plan.md` (saved first, by VH-211 #1). Codex astra's: `vh211-codex-fixitems.md`, from `vh211-codex-fixitems-brief.md`, which left Claude's plan out. Codex's provisional IDs (its VH-212 to VH-228) are not the record's; the merged IDs are in `vh211-plan.md`.

## Agreed (stands)

1. **The "?"'s gap is set by `margin-left: var(--spacing-04)`, 12 px, plus the collapsed space** (`src/styles/app.css:1124`, `tokens.carbon.css:35`, `index.html:54–56`); the centred 44 px `::after` reaches 12 px each side of the 20 px square, so a true 8 px gap puts the target about 4 px over the end of "format.".
2. **The open state** takes the chosen segment's tokens (`--interactive`, `--text-on-interactive`), holds them on hover and press over `.button--secondary`'s hover, and in forced colours takes Highlight/HighlightText with an explicit opt-out; `aria-expanded` and the shown tip keep it from being colour alone; the onset "?" changes with it. Contrast pinned in `test/contrast.test.ts`.
3. **V-18 needs a rise spacing cannot give at 320 × 568** (about 406/501/743 px after VH-205's unmeasured 20 px; `design-pass-3-2026-10-27.md:405–417`); no element is needed; CSS `order` is not the route (2.4.3, 1.3.2); the remedy goes to the owner first.
4. **F15b:** "play the new video before you save it" (`src/i18n/en-GB.ts:722`, `zh-Hans.ts:603`, `ms-MY.ts:643`) gives an action F15b's state can't take; the fix is words, no element; the owner approves them first.
5. **VH-193.3:** verify before repairing; S-140 and S-140n already refuse a QuickTime file before Create (`walker/scenarios.mjs:2361–2380`); a repair only if the stall reproduces, in existing words.
6. **VH-186.1:** the value goes beneath its label when the row can't hold both; the label breaks only between words; words and DOM order unchanged.
7. **VH-189.1 is CSS**, never a smaller font, and a residue is measured, not assumed away; VH-209's "Out of scope" line moves to the new item.
8. **B stands apart from VH-203.** VH-203's after-run (3,219 records and 48 transitions, the fix variants, the "?" captures, the integrated check) already exceeds one worker; adding B only adds sessions.
9. **VH-172.1's 214 keys** are assigned by an exclusive rule on view and mode, with a scripted reconciliation: pairwise disjoint, union equal to `stillUnrun`, one accepted record per key.
10. **Order principles:** VH-206 first; behaviour and words before CSS; the rings (VH-210) last of the fixes on the final geometry; the checks after the fixes, on the final build; a `[!]` item doesn't hold its successor.

## Codex only

1. **S-102 already measures VH-185.1's case:** the untrimmed sub-400 ms sound reaches the loudness refusal (`evidence/measurements/matrix-2026-10-27.md:105`). **Taken:** it is the item's before; the wish's "unmeasured" is answered in part.
2. **Codex's remedy for VH-185.1, an early refusal before Create.** **Held for the owner** (after Codex's critique, point 4; first written as "refused, on the record", which overstated it: the owner's point 3 covered a trimmed keep only). Claude recommends the same rule: the owner kept the 400 ms rule with the sound dropped and true words (VH-202 close, point 3); VH-185's rule for a trimmed keep is a silent job warned before Create, which `project/rules.md` ("warns before processing starts") allows; a refusal costs the person their video for under half a second of sound. The ask carries the choice, the whole-video words and spec §5.4's row, Codex's refusal as the alternative.
3. **V-18: move the switch and the translation notice too, not only the promises**, and the spec's "Above them, a switch" (`docs/01-specification.md:585`) then needs a wish line. **Taken as the measured fallback:** the item moves the promises first and the switch and notice only if the six cases still miss; a moved switch is a `docs/` wish for the owner, so the ask names it.
4. **V-18 at "the narrow layout" only, with 1280 Malay by a 24 px spacing cut** (`app.css:228/234`). **Refused as recommendation, kept as the alternative in the ask:** a DOM order that differs by width needs script that moves nodes on a media query, which the page has no precedent for (`src/main.ts:3722` moves the notice once at boot), or CSS `order`, refused under 2.4.3 and 1.3.2. One order at every width solves both cases; the owner chooses.
5. **The 8 px gap and the centred target are incompatible, so about 12 px (`--spacing-03`) to the owner.** **Refused, on the record:** what the owner approved was the gap "to about 8 px (the 44 px `::after` target may then overlap the end of "format.")" and "neither touches the target" (`project/items/VH-211.md`, criteria; the relay in #14's notes says "perhaps overlapping"). So the item builds about 8 px with the target untouched, measures the overlap (expected about 4 px over the full stop's box at 16 px, none at 32 px) and reports it; VH-203's captures already go to him, and a change he asks for becomes a fix item. Claude's own "move the `::after` right" is dropped for the same reason.
6. **VH-139.5 as two 45k items: a decoded-extent pre-pass, then the card.** **Merged, not taken whole:** one item that finds and bounds the route first. Corrected by Codex's critique (point 2): the card's time is computed on the page before the job (`src/main.ts:2956–2961`, `src/ui/title-card-step.ts:306–319`), the length made depends on both tracks (`ends-early.ts:158–166`), and the picture's end is found only in the encode (`pipeline.ts:840–842`), so the sound's early end alone does not answer it. If the route doesn't fit, the trace and timings close the item and the build becomes its own fix item before VH-203. A `docs/` change (spec line 128, "the part kept after trimming"; §7.1's probe if decode time grows) is drafted as a wish and stops.
7. **VH-153.1: a row whose sentence no longer exists** (the browser sentence, now `src/system-check.ts:71–73`) is recorded as retired with its source, not walked. **Taken.**
8. **The save dialog's file kind: a stub is not native-dialog evidence.** **Taken:** the record reads `showSaveFilePicker`'s argument; the native dialog is named person-only (`project/rules.md`, Environment) on the pass's person checklist.
9. **Updates to VH-208 (link the F15b item), VH-210 (after all geometry), VH-203 (the dependencies).** **Taken.**
10. **VH-228: extract VH-203's walker qualification (VH-199.1, VH-200.1, VH-205.1) into its own item so VH-203 fits one worker.** **Refused for this plan:** those wishes are already VH-203's work (its notes), so it is not E, as Codex's critique says (point 7); but dividing VH-203 is re-scoping an item this plan didn't make (AGENTS.md rule 2). The record's precedent is VH-199, which ran its matrix across about eight workers under one ID. How VH-203's run is divided among workers is the orchestrator's sizing, not the owner's question; it goes to #14 in the report, and VH-203's Now names it. *After Codex's close check (point 2), which did not accept this: held for the owner, the ask's point 4.*
11. **V-18 at 800 × 600 and 375 × 812 too.** **Refused:** V-18 is defined by its six cases; the after-run reads the rest of the matrix.

## Claude only

1. **VH-186.1 and VH-189.1 as one item.** **Withdrawn for Codex's split** (25k and 40k): together they pass the 50k envelope.
2. **F15b's sentence shown only when the player reports an error.** **Withdrawn for Codex's static wording:** words true in both states need no listener or new state.
3. **Two matrix batches (108 and 106), not five.** **Kept:** VH-199 ran 3,207 records across about eight workers, about 400 each; five batches pay the 75k fixed overhead five times for about 40 keys each.
4. **B in four check groups: VH-150.3 with VH-158.1; VH-153.1; VH-155.2 with VH-156.1.** **Merged:** VH-158.1's cut-short warning is the same ends-early state as VH-155.2's ends-early lines and VH-156.1's ends-early record, so those three go together (Codex's grouping); VH-150.3 and VH-153.1 stay apart, against Codex's one 45k item, since VH-150.3 needs two new faults and VH-153.1 nine row groups in two languages.
5. **VH-185.1's item follows VH-206 directly, before VH-207.** **Withdrawn for Codex's:** the owner approved VH-206 to VH-208's run "as reccomended"; the new items follow VH-208 and still come after VH-206's reason code.

## Disagreed, settled on the evidence

- **Where V-18 sits:** Claude before the "?" and VH-209; Codex after VH-209 and the "?". **Claude's:** V-18 moves the DOM; VH-202's order rule puts structure before CSS, and VH-209's own Next step reads V-18's cases before its CSS.
- **Where the "?" sits:** Claude before VH-209; Codex after VH-214's selects. **Claude's:** VH-209 and VH-210 then read their overflow and rings on the final "?".
- **Where F15b sits:** Claude after VH-208; Codex after VH-139.5. **Claude's:** VH-208 speaks heavy-limiting's detail, the sentence F15b rewords.

## Held for the owner

VH-185.1's route (the same rule, or Codex's refusal), with its words and spec row. The ask's other points are the owner's by the scope: V-18's remedy (Codex's narrow-only route the alternative) and F15b's words.
