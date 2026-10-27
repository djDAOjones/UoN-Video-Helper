<!-- markdownlint-disable -->

# VH-207 — Claude's reading of the open design choice (saved before Codex's)

Saved 2026-10-27, VH-207 #2, before Codex's blind answer was asked for or read. Base 5893d9d.

## The question
At the choosing (`src/main.ts:1397–1446`), a standing unsaved result is re-rendered (`renderResult`, :1443), which replaces the card (`heading`, tabIndex -1, where focus lands at a job's end, "Keep it" and a spent Save), its Save, or the "discard it?" question (its panel, tabIndex -1, Discard, Keep), and moves its player (`resultPlayerFor` reuses the same `<video>` for the same job, :2870–2882, but `heading.append` moves it into the detached new card, so focus on it drops to the body). With no unsaved result, `clearResult()` (:852) takes a saved card away. Which control takes focus held on each?

## Claude's reading
The rule the criteria use: **the same logical control where the re-render makes one; otherwise the chooser** ("Focus on a standing result's Save lands on the re-rendered Save, the same logical control"; the Intent: "hands displaced focus to the file chooser"; spec §9.3: "a transition that removes or disables the focused control names its successor"; UI-STANDARDS: "focus passes to the one that continues the task").
- **Save → the re-rendered Save** (the criterion).
- **The player → the player.** It is the same element, put back in the re-rendered card: the same logical control, and the person's place in it (time, volume) is the element's own, so nothing is lost.
- **The card → the re-rendered card** (`renderResult`'s return): the same logical box, as "Keep it" (:2833) and a job's end hand to it.
- **The question (its panel, Discard, Keep) → the file input.** The re-render retires the question; nothing of it is re-rendered, so there is no same logical control. The chooser is the control the person just used and the one that continues the task: the new file is read at step 1. Not the card: "Keep it" hands to the card because keeping is that person's own choice to return to the result; here they chose another file. Not Save: it would put a primary action under a keystroke the person did not aim at it.
- **A saved result cleared (`clearResult`) → the file input.** Nothing of it stays.
- One capture, `focusHeldBy([processResult])`, before anything changes; the successor chosen by what held focus; called after the re-render or the clear. Separately, the reading lock's six trim controls → the file input. No element, no words, no other caller: `renderResult`, `clearResult`, "Keep it" and `withdrawDiscardQuestion` are unchanged.

## Scope
The criterion's "they" is `clearTrim('reading')` and the result's re-render. The handler also hides Create's row (`processActions.hidden`, :1422), the check's Stop / Check again (`offerStop(null)`, :1413), the read summary and its disclosure (`clear(sourceReport)`, :1416), the block panel and the verdict (`withdrawVerdict`, :1419), all before `clearTrim('reading')`. Those are outside the item's named controls and no variant walks them: one wish line, for the owner and VH-203, not built here. Every one is reachable only with focus off the chooser at the choosing (a dropped file, or assistive technology), as (a), (b) and (e) are.
