# Codex astra brief — VH-184, the onset toggletip, 2026-10-24

You are checking one Phase 8 item's candidate diff in this repository, read-only. The base is commit 8c144ba. The candidate is the working tree against HEAD: `git diff`, plus new files `src/ui/toggletip.ts`, `src/ui/toggletip.test.ts`, `reviews/2026-10-22/design-pass-2/evidence/measurements/walker/tip-184.mjs`, and `reviews/2026-10-24/vh184-*` (the evidence file, its JSON readings and three captures). Do not run the walker or the gate; the gate runs alongside you and its result goes in the commit.

The item is `project/items/VH-184.md`: read its acceptance criteria in full. The app stays simple: no new control, element or token.

What the candidate does:

- `src/ui/toggletip.ts`: two pure rules. `focusClosesTip(target, button, tip)`: focus arriving outside both closes the tip; focus arriving nowhere (a click on its text) does not. `escapeFocusesButton(active, body, button, tip)`: Escape hands focus back to the "?" from the button, the tip's text or the body, never from a control elsewhere.
- `src/main.ts`: a document `focusin` listener closes the tip by the first rule; the Escape handler closes it and, by the second rule, focuses the "?". The click-outside handler is unchanged.
- `src/styles/app.css`: `.toggletip` loses the notification's 4 px left rail in `--border-strong` and takes a 1 px solid edge all round in `--border-subtle`, the existing neutral edge token.
- `tip-184.mjs` drove 36 cases (three languages, 1280/375/320 px, light, dark, forced-light, forced-dark), with a before on the base: see `reviews/2026-10-24/vh184-toggletip-2026-10-24.md`.

Check, giving file:line:

1. Each acceptance criterion: met, or not, and why. In particular: does focus go where it would have gone on Tab and Shift+Tab; does Escape still close it and return focus; does a pointer click outside still close it; is the edge's contrast 3:1 against both grounds in every mode; did anything a screen reader hears change?
2. Any path where the new `focusin` rule closes the tip wrongly (the "?" itself, Enter/Space toggling, the language switcher repainting, the closing type changing) or the Escape rule steals focus.
3. Does the new edge still read as a notification or a field, and is `--border-subtle` a fair "existing token for neutral information" under UI-STANDARDS and the Carbon digest?
4. The stage rule: no control, element or token added; UI-STANDARDS and docs untouched; digest rules to be named at close.

Reply with a verdict line first ("Commit", "Commit after the musts below", or "Do not commit"). Then numbered points, each marked must or may, each with file:line. Be brief.
