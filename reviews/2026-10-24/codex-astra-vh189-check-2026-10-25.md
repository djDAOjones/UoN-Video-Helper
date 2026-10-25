# Codex astra check — VH-189, step 4's labels, 2026-10-25

Model gpt-6-astra, read-only, on the brief `codex-astra-vh189-brief-2026-10-24.md`. Its reply, verbatim but for its file links, kept as code:

Commit after the musts below

1. **Must — 200% text remains unverified.** `labels-189.mjs:98` hard-codes 400 px, but `25rem` becomes 800 px with a 32 px default font. Use `matchMedia('(max-width: 25rem)').matches` and record the requested enlarged-text check using the existing `font32` mode. The default modes omit it. `W3C unit rules`.

2. **Must — finish AC5’s close.** Replace `CODEX_VERDICT` in `decisions.md:25` and `CODEX_SHORT` in `trajectory.md:19`. Include `Checked:` and the reported green gate in `Verify:`. No test deletion or new skip appears in the diff; browser evidence remains outside this review.

3. **May — AC1 met; retain the wording.** `en-GB.ts:307` matches B7 exactly. Result, record and fallback sentences are unchanged. No obsolete onset label or standalone visible “None” remains in the searched product files.

4. **May — retain the layout.** `app.css:1055` correctly places the wrapper’s children in the grid. Specificities hold; the existing flex declarations become irrelevant there. Forced-colour rules remain compatible; no unapproved dimensional literal, control, element or token is added. The plain wrapper carries no accessibility semantics to lose. Select → help preserves their logical relationship under `2.4.3`. AC2’s label associations are met in source; measured fit remains external evidence.

5. **May — AC3 met.** `01-specification.md:190` matches S11–S16 word for word, allowing rewrapping. Independently counted: **8,032 words**.

6. **May — AC4 met on source and generation checks.** `VH-105-strings-filled.csv:153`: exactly ten rows changed; all touched metadata matches `sheetRows()`, both tables regenerate identically, changed translations are marked drafts, and no keys disappeared. No wrong sense found. Malay “akhir” versus “terakhir” is a terminology variation, but the shortened label preserves meaning.

7. **May — tidy two descriptions.** `sheet.ts:346` should request consistent “closing graphics” terminology, since the reason no longer repeats the complete option name. `closing-choice.test.ts:62` still describes “None” as the current visible label.

Read-only review; neither walker nor gate run. Digests applied: Carbon tokens, Nielsen 2/4, and WCAG label, reflow and keyboard rules.
