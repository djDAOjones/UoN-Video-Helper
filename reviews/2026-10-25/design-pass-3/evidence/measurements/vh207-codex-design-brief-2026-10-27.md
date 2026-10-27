<!-- markdownlint-disable -->

# VH-207 — a design choice, Codex astra's own reading (blind)

You are checking one design choice for VH-207, read only, in the repository at its base commit 5893d9d (the working tree also carries walker additions under reviews/…/walker/; ignore them for this). Give your own reading. Claude has saved its reading separately; you are not given it, and must not look for it outside this repository.

Read: `project/items/VH-207.md` (the criteria); `src/main.ts` :1397–1508 (the file input's change handler), :845–860 (`clearResult`), :905–950 (`focusHeldBy`, `stepsWithdrawnBy`), :1756–1772 (`clearTrim`), :2188–2205 (`withdrawDiscardQuestion`), :2785–2850 (`confirmDiscardThenStart`, its Discard and Keep), :2860–2900 (`resultPlayerFor`), :3250–3345 and :3480–3500 (`renderResult`); `src/ui/focus-hand-on.ts`; `docs/01-specification.md` :717–719 (spec §9.3's successor rule); `UI-STANDARDS.md` :245–246.

## The question
VH-207's criterion "At the choosing" says a capture, before `clearTrim('reading')` and the result's re-render, notes focus on a control they disable or replace; it names two successors: a trim control the reading lock disables → the file input; a standing result's Save → the re-rendered Save, "the same logical control". The re-render (`renderResult(unsavedResult)`, :1443) also takes away other focusable things: the result card itself (tabIndex -1), its `<video>` player, and, when it is up, the "discard it?" question (its panel, tabIndex -1, and its Discard and Keep buttons). With no unsaved result, `clearResult()` takes a (saved) card away instead.

Constraints: the answer must add no element, change no words, change no other caller (`renderResult`, `clearResult`, "Keep it", `withdrawDiscardQuestion` and every other `focusHeldBy` caller keep their behaviour), and stay within the item's criteria and spec §9.3's successor rule.

## What to answer (short; under 500 words)
1. For each of these, held at the choosing, the successor you would hand focus to, with your reasons in one or two lines: (a) the card; (b) the player; (c) the question's panel, Discard or Keep; (d) a saved card that `clearResult` takes away.
2. Whether any control the change handler takes away before `clearTrim('reading')` (for example :1411–1422) falls within the criterion's scope, and what you would do about it within the approved scope.
3. Anything in the criteria that makes one of your answers out of scope.
End with one line: `Reading: <one sentence>`.
