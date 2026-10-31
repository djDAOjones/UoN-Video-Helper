<!-- markdownlint-disable -->

# VH-229 — Codex's design blind check, brief

You are checking a design question for a change not yet built, in this repository, read-only. Give your own design; there is no other design for you to read.

You may read the repository at HEAD: `project/items/VH-229.md`, `index.html`, `src/main.ts` (`wireToggletip`, about line 715), `src/ui/toggletip.ts`, `src/styles/app.css`, `src/i18n/`, `test/screen-text.test.ts`, `docs/01-specification.md` §9.2, `UI-STANDARDS.md`, `project/digests/`, `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/scenarios.mjs`, and `project/wish-list.md` (VH-229.1, VH-216.1, VH-216.3, VH-175.4). You may not read any folder under `side-session-notes/`; nor, in `/Users/joe/UoN-Video-Helper-side/`, any `vh229-claude-*`, `vh229-*compare*`, `vh229-progress.md`, `vh229-handover-*`, or any `vh229-*brief*` but this one.

The owner's words, verbatim: "what about a question mark box after the app title, if clicked expands the promises follwoed by the "Your video is processed on your device, it is never uploaded, and the original file does not change." segment. users then aren't bother by text, the controls are self evident / self guiding, and novices can click the question mark"; "Hide both" (told it was recommended to keep the privacy line in view; "Promises only" not taken); "Approve both" (the §9.2 wording in wish VH-229.1, the name "About this tool").

Approved and nothing else: one "?" button beside the title, one panel element holding today's promises and privacy line, a wrapper for the title row if the layout needs it, one new string "About this tool" (Chinese and Malay marked machine translations), one §9.2 line in `docs/`. `#browser-note` stays in view. No walker edit. VH-216's one order at every width and VH-217's gap and open state stand.

Answer each, with reasons from the files, short:

1. The markup: exact elements and order from the title to step 1. Where does the privacy line's and the promises' wrapper go, what happens to `.lede`, where does `#browser-note` go, and what do the walker's selectors then match?
2. The layout at 320 px, three languages, 32 px default font, today's name and "UoN Video Finisher": flex, inline, grid? How large is the "?" drawn, and why? What happens to the longest word?
3. The behaviour: what closes the panel? Exactly what does Escape do with: the format tip open; another tip open; focus on the "?"; focus inside the panel; nothing focused; focus on a control elsewhere; the problem report dialog open? What is the listener order problem, if any?
4. The words: the Chinese and Malay for "About this tool", against the page's own terms; what becomes false in comments, sheet cells and tests.
5. Risks: what could this break that the item's criteria do not name? Any point where the criteria are wrong or read below the owner's words?

Answer in at most 500 words.
