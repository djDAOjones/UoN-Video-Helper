<!-- markdownlint-disable -->

# VH-216 — Codex's design brief (blind)

You are Codex astra, the owner's comparison partner on VH-216 of the UoN Video Helper. Read-only. You run no walk, server or browser and write nothing but your answer. **Give your own design and your own reading.** Claude is writing its own at the same time and you will not see it; nothing here states its choice.

**May read:** this repository, at HEAD (working directory; base `3741193f34c546291248e814b0915d75f3dbf41c`, tree clean); `/Users/joe/UoN-Video-Helper-side/vh216-1-brief.md` sections 2, 5 and 6 only if needed; `/Users/joe/UoN-Video-Helper-side/vh216-walk/six-before/` (conditions and job log). **Must not read:** any folder under `/Users/joe/Library/Application Support/Claude/side-session-notes/`, `/Users/joe/UoN-Video-Helper-side/vh216-progress.md`, or any other `vh216-claude-*` file.

## The item

`project/items/VH-216.md` is the contract: read it whole. Its "Open question" and the backlog's "blocked: the owner" are out of date: the owner has answered, below. No change to `docs/` beyond the two sentences below is approved, and no walker change at all.

## The owner's words, verbatim, with their sources (`/Users/joe/UoN-Video-Helper-side/plan8-owner-words.md`)

- Scope, 2026-10-27 14:51:20Z (`:275`): "yes to the question mark, and A and B. ensure everything passes UX / design / Accessibility".
- The remedy, 2026-10-27 ~16:18Z, "Backlog review" chat (`:283`), typed by him: "help me resolve VH-212, VH-213, and VH-216"; on VH-216 he chose, as the tool returned it (`:286`), "Promises + switch (Recommended)": the five promises and the Staff/Student switch move below step 1, in one order at every width; no CSS order, no script, no words changed, nothing added. Order shown: header, title, privacy line, "1. Choose a video", the switch, then the promises, with steps 2–6 between them once a video is read. He was told it changes spec §9.1's "Above them, a switch…" line and needs his yes; choosing it is that yes. Not taken: "Also the translation notice", "Promises only".
- The budget, ~16:43Z (`:288`): "Yes: raise docs/01-specification.md's budget from 8,100 to 8,200 words, for the approved rows in VH-206, VH-213 and VH-216. Record it as a decision."
- The `docs/` edit, ~18:06Z (`:292`, `:294`–`:296`), his choice ""below step 1" (Recommended)":
  - §2: "A switch above the steps, "Staff video" or "Student submission", says which;" becomes "A switch below step 1, "Staff video" or "Student submission", says which;";
  - §9.1: "Above them, a switch chooses "Staff video" or "Student submission" (VH-131)." becomes "Below step 1, a switch chooses "Staff video" or "Student submission" (VH-131, VH-216).".

Backlog review's indicative DOM-move measurements left short: zh-Hans at 375×667 (1 px), ms-MY at 375×667, zh-Hans and ms-MY at 320×568. A case that misses after the remedy is reported in px, not closed by moving the translation notice, shortening a word or tightening spacing.

## The six cases at the base (evidence)

`rings-179.mjs v18`, unchanged, on the base, walker revision `17727d3522f7270d`, AC, powermode 2, load 4.7–6.0. The button's painted top–bottom against the fold:

| Language | 1280 × 900 | 320 × 568 |
| --- | --- | --- |
| en-GB | 630–674, inside | 930–974, short by 406 |
| zh-Hans | 780–824, inside | 1025–1069, short by 501 |
| ms-MY | 870–914, short by 14 | 1267–1311, short by 743 |

## The facts of the walker (`reviews/2026-10-25/design-pass-3/evidence/measurements/walker/`)

No walker change is approved. Editing a row below is a stop for the owner; failing rows are reported as the remedy's consequence, and VH-203 carries a wish line.

- **W1:** `scenarios.mjs:2935–2944`, S-03's "Tab from the top…": `want` is skip link, page language, (notice link), format ?, video type, choose file, and it breaks at the file chooser (`:2939`). After the remedy it fails in every S-03 cell by the owner's own choice, and it is not a whole Tab reading.
- **W2:** today the promises and the privacy line share `<div class="lede">`. With step 1 between them and no element added, one leaves it. `scenarios.mjs:2931` S-03's "the owner's five promises, in order" reads `.lede > ul > li`; `:1831` `VH207_LEDE` is `.lede p[data-i18n="lede.privacy"]`, clicked at `:1908` in a VH-207 variant. `tip-196.mjs` and `top-187.mjs` also read `.lede`.
- S-142's Tab and Shift+Tab neighbours (`:2724`, `:2725`) and J1's route (`:3095`–`:3096`) pin the old order, outside this item's cells.
- `matrix.mjs:203–207`: a language and width's modes share one setup; the instruments blur focus; S-144's state needs focus on the "?". `VIEWS` (`qualify.mjs:963–985`): w1280 is 1280×900, w640 640×900, w375 375×812, w320 320×568. A driver outside the walker may run `matrix.mjs` unchanged on a plan declared in memory, with a read-only probe. S-03 and S-144 at 1280, 640, 375 and 320 px, three languages, light, dark, forced-light, forced-dark, font32: 120 cells a side.

## Files to read for the design

`index.html` from `class="page-title"` to the end of `#step-choose`, and `#step-create`'s end to `</main>`; `src/styles/app.css` `:50–58`, `:231–250`, `:1094–1145`, `:1254–1258`; `test/screen-text.test.ts` `:71`, `:96`, `:656–660`; `test/stylesheet.test.ts:79`; `src/i18n/sheet.ts` `:46–75`, `:466`, `:531–545`; `src/i18n/tables.test.ts:131–137`, `:226`, `:426`; `reviews/2026-10-18/VH-105-strings-filled.csv` rows `lede.*`, `videoKind.*`; `src/i18n/en-GB.ts` `:103`, `:155`, `:159`; `src/main.ts:499`; `src/ui/video-kind.ts:2`; `docs/01-specification.md` `:29–34`, `:585–596`, `:779`; `UI-STANDARDS.md` "Minimalist design", "Perceivable", "Operable"; `project/rules.md`, Always; the walker lines above; `phase8.mjs:608–640`.

## What to answer

1. **The whole page order** in each state (empty; a video read; a video that can't be made; a job; a result), and **where the promises sit against `#page-announcer` and `#errors-panel`**, with your reason.
2. **Which element holds what, with no element added.** State the costs of each option (the promises leave `.lede`; or the privacy line and browser note leave it), in tests, CSS and walker rows, in states the cells don't walk too, and choose one.
3. **The CSS the move needs and no more,** on tokens. No CSS `order`, no script.
4. **The tests that change,** none deleted or skipped, and how each still bites; what new assertion, if any, pins the whole order.
5. **The sheet and the comments:** which `WHERE` rows and which filled-sheet cells follow; whether any string is made false by the new order (a string change is a stop); which comments go stale.
6. **The instruments:** how the six cases, the 120 cells, the DOM, heading and Tab orders, and the "?" tip's opening and closing as VH-184 left it are each read. Which rows you expect to fail after, by name, and whether any row other than W1's and W2's should move.
7. **WCAG** 1.3.1, 1.3.2, 1.4.4, 1.4.10, 2.4.3, 2.4.6; Nielsen 6 and 8: any risk in the new order, stated plainly. In particular what a person reading or tabbing the page meets, and whether the promises' position says something false about them in any state.
8. **Anything that stops:** a new element, a new or changed string, a `docs/` edit beyond the two, a walker change, or a remedy that outgrows "the markup move, the CSS it needs, the tests and the sheet".

Answer in plain sections numbered as above, with file and line for each claim, and end with one line: `Verdict: <your overall word>`. Under 900 words.
