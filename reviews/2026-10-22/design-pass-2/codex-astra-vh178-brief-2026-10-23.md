# Codex astra brief — VH-178, focus passes on when finished work takes its control away (V-46), 2026-10-23

You are checking one fix item's candidate diff in this repository, read-only. Base: commit 392077f. The candidate is the working tree against HEAD: `git diff` plus the new files `src/ui/focus-hand-on.ts`, `src/ui/focus-hand-on.test.ts`, `reviews/2026-10-22/design-pass-2/evidence/measurements/walker/transitions.mjs` and `reviews/2026-10-22/design-pass-2/evidence/measurements/vh178-focus-2026-10-23.md`. Do not run the walker or the gate; their results are in the evidence file.

The item is `project/items/VH-178.md`; read its acceptance criteria in full, and `project/items/VH-176.md` for the stage rule every fix keeps. The finding is V-46 in `reviews/2026-10-22/design-pass-2/design-pass-2-2026-10-23.md` (and its Disposition row); your own blind review's D-01 is `codex-astra-blind-review-2026-10-22.md`, and your critique of the fix plan, F-01 and F-03, is `codex-astra-fixplan-critique-2026-10-23.md`.

What the candidate does, in brief:

- `focusHeldBy`'s rule moves, unchanged in behaviour, from `src/main.ts` into `src/ui/focus-hand-on.ts`, tested in Node with stand-ins (`focus-hand-on.test.ts`); `main.ts` keeps a one-line wrapper of the same name. The hand-on now takes its successors in the caller's order and focuses the first that can take focus (connected, not hidden, not disabled, `checkVisibility()`); it exposes `held`.
- Both job endings capture Announce progress with Cancel; Cancel's click notes either as held.
- Only the blocking branch that withdraws steps captures their controls with Stop the check, carrying the shared capture's `held`; the shared capture at the check's settling stays Stop the check alone.
- The check's three settled branches (block, ready or discouraging, failed) name Stop saving after their own successor, so a save that has shut the chooser or Create hands focus to Stop saving.
- The walker gains `TRANSITIONS` in `scenarios.mjs` (the three cases and the variants (a) to (e)), a runner `transitions.mjs`, an F4b option for 3 s a chunk and a fault F14 that holds the pre-flight's answer so keys can reach Start time before a check settles.

Check, with file:line:

1. Each acceptance criterion: met, or not, and why. In particular: does any caller now choose a different successor where its old one could take focus; is every other caller (`main.ts` `:1633`, `:1980`, `:2786`, `:2845`, `:3247`, `:3271`, `:3286`, `:3362` at the base, shifted in the candidate) unchanged in behaviour; are the guards (the dialogue, a reader moved, focus on the body before the transition) kept; is the module move free of a behaviour change (note `active instanceof HTMLElement` became `active !== null`).
2. Does the blocking branch capture exactly the steps it withdraws, and leave a recoverable storage block, a ready verdict and a discouraging one alone?
3. Are the walker's transitions sound evidence: does each assert the transition ran as declared (focus placed before it, the check still running, the save still running at the check's settling, the dialogue open), and read focus before any instrument moves it? Is F14 a fair way to give keys time, or does it change what is measured?
4. The stage rule: no control or element added, the progress bar kept, our own CSS untouched, `docs/` untouched, numbers in config, the measurements in three languages and four colour modes.

Reply with a verdict line first ("Commit", "Commit after the musts below", or "Do not commit"), then numbered points, each marked must or may, each with file:line. Be brief.
