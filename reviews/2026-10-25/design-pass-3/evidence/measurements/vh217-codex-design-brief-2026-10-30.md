<!-- markdownlint-disable -->

# VH-217 — the brief of Codex's blind design check

You are Codex astra, giving a blind design check, read-only, for one item of a static browser app. Edit nothing. No browser or walk. Answer first with a verdict ("Proceed", "Proceed with the points below", or "Do not proceed"), then numbered points, each must, should or could, with file:line evidence. Then a table of the design you would build, so it can be compared with another designer's.

The repository is the current directory. Read: `AGENTS.md`, `project/items/VH-217.md` (the contract: every criterion), `project/digests/carbon.md`, `project/digests/wcag-2.2-aaa.md`, `UI-STANDARDS.md`, `src/styles/app.css`, `src/styles/tokens.carbon.css`, `src/styles/tokens.brand.css`, `index.html`, `src/main.ts` (the toggletip wiring), `src/ui/toggletip.ts`, `test/stylesheet.test.ts`, `test/contrast.test.ts`, the walker at `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/` (`qualify.mjs`, `matrix.mjs`, `scenarios.mjs`, `phase8.mjs`, `tip-196.mjs`, `tip-184.mjs`), and in `/Users/joe/UoN-Video-Helper-side/` only `plan8-owner-words.md` lines 271 and 275. Read no folder under `side-session-notes/`, and in that side folder no file named `vh217-claude-*`, `vh217-*compare*`, `vh217-progress.md`, `vh217-handover-*` or any `vh217-*brief*` but this one.

The owner's words, verbatim: "I accept everything, but even old issues should be solved for. we also need to make sure that question mark about file formats looks good"; "yes to the question mark, and A and B. ensure everything passes UX / design / Accessibility". He approved two changes: the gap before the format "?" to about 8 px; a dark filled open state like the chosen segment, which the onset "?" takes through the shared `.help-button`.

Answer each:
1. The exact CSS for the gap and for the open state with hover and pressed, forced colours included: selectors, specificity against `.button--secondary:hover`, `.button--secondary:active:not(:disabled)` and the forced block's rules; how the disabled rule still wins; the border; the focus ring on the fill in every palette (1.4.11, 2.4.7, 2.4.13).
2. Carbon's "one primary per state": is a filled "?" a second primary? Say why or why not, looking at what else is on screen when each "?" is open.
3. The item's walks: its stage rule names S-17, S-95 to S-98, S-113 and S-141 to S-144, each "?" in five states, at six widths, two fonts, three languages and four colour modes. What does that mean as a list of cells, how would you read the five states, and what must be read for the target overlap with "format." and for 2.5.5? Does it need anything the walker lacks?
4. The criterion "the combined cells qualified here": what is the smallest walker change that declares and qualifies the 32 px font in dark, forced light and forced dark, what must be proved, and what could it disturb for the existing modes?
5. Tests: what do the two named test files need so each rule is pinned?
6. What could go wrong that the item doesn't name: at the 32 px font, in zh-Hans or ms-MY, at 320 px, when the "?" wraps to the next line, when it's disabled, on touch, and on the `::after` target over other content.
