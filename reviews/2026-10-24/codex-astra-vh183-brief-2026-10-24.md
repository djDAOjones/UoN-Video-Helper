# Codex astra brief — VH-183, the keyboard trim's Page step, 2026-10-24

You are checking one Phase 8 item's candidate diff in this repository, read-only. The base is commit 4b93f6b. The candidate is the working tree against HEAD: `git diff`, plus two new files, `reviews/2026-10-22/design-pass-2/evidence/measurements/walker/page-183.mjs` and `reviews/2026-10-24/vh183-page-step-2026-10-24.md`. Do not run the walker or the gate: their results are in the evidence file and below.

The item is `project/items/VH-183.md`: read its acceptance criteria in full. The plan is the `project/decisions.md` entries headed "PLAN-8" (2026-10-24). The app stays simple: no new control or element, and numbers live in `src/config/`.

What the candidate does, in brief:

- `src/config/trim.ts`: `TRIM_PAGE_STEP_SECONDS` (10) is now the least a page moves; a new `TRIM_PAGE_STEP_FRACTION` (0.01) is the share of the video a page moves when that is more.
- `src/ui/trim.ts`: `trimKeyTarget` takes a fourth argument, `durationSeconds`, and pages by `max(TRIM_PAGE_STEP_SECONDS, durationSeconds × TRIM_PAGE_STEP_FRACTION)`. The arrows, Home and End are unchanged, and the clamp to the handle's bounds still applies to every key.
- `src/main.ts`: the one caller passes `trimDuration`.
- `src/ui/trim.test.ts`: every existing case passes the duration; new cases cover an hour (36 s page, arrows still 1 s), the 1,000 s crossover (10 s at 999 and 1,000, 20 s at 2,000) and the clamp at both ends of a long video, Home and End included.
- `trimHandleText` and the `aria-valuetext` it sets are untouched.
- `page-183.mjs` drives headless Chrome over CDP: a 130 s lecture and an hour-long still, three languages, 1280, 375 and 320 px, light, dark, forced-light and forced-dark (72 cases). It focuses each handle and presses Page Up, Page Down, End, Home and an arrow as real key events, reading the value and `aria-valuetext` after each.

The gate, `npm run check`, is green on this candidate: see the evidence file for the summary line. `node tools/check.mjs`: see the evidence file.

Check, giving file:line:

1. Each acceptance criterion: met, or not, and why. In particular:
   - Is the step exactly max(10 s, 1%) from `src/config/trim.ts`, with no literal elsewhere?
   - Do the arrows, Home and End keep their steps?
   - Do the tests cover a short video, an hour and the clamp at both ends, and would they fail on the base?
   - Is what a screen reader hears unchanged?
2. Any caller or test of `trimKeyTarget` missed, or any document (spec, UI-STANDARDS, README) that states the old 10 s page and now misleads.
3. Is the evidence sound: 72 cases, the expected values, `aria-valuetext` per language?
4. The stage rule: no control or element added; no CSS changed; UI-STANDARDS untouched.

Reply with a verdict line first ("Commit", "Commit after the musts below", or "Do not commit"). Then give numbered points, each marked must or may, each with file:line. Be brief.
