<!-- markdownlint-disable -->

# VH-207 — Claude's verdict, saved before Codex astra's blind answer was opened (VH-207 #2, 2026-10-27 ~22:17Z)

Verdict: **Commit** (the close edits still to make). Every acceptance criterion met:

1. **At the choosing** — met. One capture at the top of the change handler, before anything is withdrawn: the six trim controls the reading lock disables (and the check's Stop / Check again, the read, the verdict, Create's row, which the handler also withdraws) → the file input; focus in the result → the same control re-rendered (Save → Save, the player → the player, the card → the card), the question → the card it restores (as "Keep it"), a cleared saved card → the file input. (b): focus on the file input ×24 from the choosing; (e): the re-rendered Save ×24. A readable replacement and a block keep their behaviour: S-149's block ×24 and J1–J4 unchanged.
2. **Both read-failure paths** — met. Once, at the top of `clearTrim('unreadable')`, before `applyControlLock()`: `focusHeldBy(stepsWithdrawnBy({ setup: false, create: resultStanding }))`, the same `shown` passed to `revealLaterSteps`; hand-on `(fileInput, stopSaveButton)`. Once because both paths call it and are its only 'unreadable' callers. (a), (c) (the exception), (d): `#file-input` ×24 each; S-149's branch ×6.
3. **The guards** — met. (f1) the dialog ×24, (f2) the body ×24, unchanged; (e)'s Save stays through the failure (step 6 kept); no other `focusHeldBy` caller edited (15 read); the eight routes as before.
4. **The variants** — met: (a)–(f) declared (fixOnly), proved (pilot 7/7 reached), both timings.
5. **The exception path** — met: F20 proved (120 s → took-too-long; the twin's failed reply), walked by (c).
6. **Unit test** — not reachable from a `src/ui` module (the capture is in main.ts); the variants are its proof; the close says so.
7. **Stage rule** — met: 168 cells + 8 routes before (export of 5893d9d, said) and after, whole; rings pass in all four modes (file input 704/640 px², Save 648–840 px², read as it stands); WCAG 2.1.1, 2.4.3, 2.4.7, 2.4.11, 2.4.12, 2.4.13, 4.1.3 re-checked; tokens untouched, no element; UI-STANDARDS and docs/ unchanged (the rule already says this). Gate, Codex check and the Disposition row: at close.

Not walked, proved by reading only: the player, the card, the question, the cleared card and the handler's earlier withdrawals (no variant; the walker changes are fixed). Risk: low — the same guarded hand-on, each reached only with focus off the chooser at the choosing.
