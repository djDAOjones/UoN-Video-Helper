<!-- markdownlint-disable -->

# VH-216 — the design's compare, Claude's reading against Codex astra's

**When each was saved.** Codex's brief saved and Codex started 2026-10-30T09:59:41Z. Claude's reading (`vh216-claude-design.md`) saved 10:01:10Z, with Codex still running. Codex's run ended by 10:05:55Z; its answer (`vh216-codex-design.md`, verdict "Viable") was opened only after that.

## Agreed

- **The promises leave `.lede`:** `div.lede` keeps the privacy line and the browser note; the `ul` takes `class="promises"`; the same reasons (the note's state, VH-207's selector, and detached-paragraph CSS on the other option).
- **The CSS:** `.lede ul` → `.promises`, declarations unchanged; `.lede ul + p` removed as dead; no new token, breakpoint, `order` or script.
- **No string is made false;** `en-GB.ts:155`, `:159` keep their referents. A string change would be a stop.
- **The sheet and the filled sheet follow;** the words and translations don't change. `lede` splits so the privacy line keeps "Under the page heading".
- **The instruments:** `rings-179.mjs v18` for the six; 120 cells by `matrix.mjs` unchanged on a plan in memory, S-144 one run per mode; a separate Tab reading, W1 being incomplete.
- **Expected to fail after:** S-03's "Tab from the top…" and "the owner's five promises, in order". No walker row edited. S-142 and J1 go to VH-203's wish line.
- **No stop found.**

## Codex only, and what Claude does with each

1. **`screen-text.test.ts:89` goes vacuous** if the regex at `:71` starts at the list, since it looks for a lead-in paragraph before the `<ul>` inside the capture. Claude missed this. **Taken:** `:89` reads the markup before `<ul class="promises">`.
2. **`:96`'s fourth-promise read scoped within the list.** **Taken.**
3. **The order assertion checks uniqueness and containment,** not only `indexOf`. **Taken:** each id once; `class="promises"` in `main`, outside every `section` and `fieldset`.
4. **Filled-sheet metadata equality:** `tables.test.ts:137` tests non-empty and `:226` the translations, so neither proves the where-cells. **Taken:** for the rows that change, the filled sheet's "where it shows" equals `sheetRows()`'s.
5. **Comments:** `app.css:1109` and `main.ts:707` too. **Taken,** with `src/ui/toggletip.ts:3`: "the lede's fourth promise" is false once `.lede` doesn't hold it. `app.css:231` ("The promise…: a headline") stays: it now names the privacy line, which it fits. Test titles stay.
6. **Reverse Tab and Space in the traversal.** **Taken:** a Shift+Tab route from the footer's first stop back to the top, and Space as well as Enter on the "?".
7. **Order and Tab read in all five states, and mutual exclusion with the onset tip.** **Not taken.** They need a chosen file and fixtures; S-03 and S-144 declare none, and the brief's grid is the empty page, its gap stated. No script moves these nodes, the markup is one static order, and the whole order is pinned by test 3. `toggletip.ts` isn't changed. The table states this gap, and no later item is claimed to fill it unless checked.
8. **The "44 x 44" box-based row already fails** (`scenarios.mjs:2932`; `phase8.mjs:634`; `project/wish-list.md:57`). **Taken as an expectation:** same before and after, to be read in the before walk.
9. **The promises may sound like confirmations** just after a blocked, silent or finished video. **Taken as a stated risk:** the table says so; no word may change, and both placements carry it.

## Claude only

- The explicit reading of the risk that a person who doesn't scroll on a phone sees no account of what the tool does, and that the switch may fall below the fold (Codex: "Nielsen 6 risks explaining capabilities too late": the same point, more briefly).
- The note that the heading sequence should be identical before and after, read by the probe.
- `#dev-actions` stays last.

## Disagreed: one point, settled on the evidence

**Promises before `#page-announcer` and `#errors-panel` (Codex), or after `#errors-panel` (Claude).** The owner's words name no errors panel, and neither the spec nor UI-STANDARDS places it (`grep` of both for "Errors captured": no line).

- Codex's reasons: "general capabilities stay separate from outcomes, and that pair remains adjacent". **Both hold under either placement:** the announcer and the panel stay adjacent, and the list stays outside every step and notification.
- What differs is measurable. **The panel's place against the work is unchanged by Claude's placement and worsened by Codex's:** with the list before it, every state with Errors captured showing has the five promises between step 6, or on a page where the checks failed the switch (`scenarios.mjs:224`), and the panel. UI-STANDARDS `:161` asks for errors "linked to the relevant control"; it speaks to a message and its control, not this panel, so it leans this way and no more.
- For Codex's side: his order, as shown, has only steps 2–6 between the switch and the promises. Under Claude's, Errors captured stands between them too **when it shows.** He was shown no errors state, and nothing he named is displaced.

**Settled for Claude's placement:** `#page-announcer`, `#errors-panel`, `ul.promises`, `#dev-actions`. It goes to Codex's blind verdict as a point, and to #31 in check-in (b).
