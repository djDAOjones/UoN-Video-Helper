<!-- markdownlint-disable -->

# VH-199's close — Codex astra's check before the commit (brief from VH-199 close #3, 2026-10-27)

You are checking, read-only, the close of VH-199 (pass 3's evidence run) in UoN Video Helper before it is committed. Write nothing anywhere; answer in your final message only. Do not run the gate (`npm run check`), the walker, Vite or a browser; reading files, `git` and in-memory `node -e` reads are fine.

## What to read

- **The change:** `git status` and `git diff` in this working tree (HEAD `a3039c3`). New, untracked:
  - `reviews/2026-10-25/design-pass-3/`: `contract-claude-draft-2026-10-27.md`, `codex-astra-contract-brief-2026-10-27.md`, `codex-astra-contract-draft-2026-10-27.md` (your own earlier blind draft, verbatim), `contract-compare-2026-10-27.md`;
  - `reviews/2026-10-25/design-pass-3/evidence/measurements/`: `matrix-2026-10-27.md`, `matrix-coverage-2026-10-27.json`, `unrun-2026-10-27.json`, eighteen `digest-*-2026-10-27.md`, `contract-2026-10-27.md`, `contract-evidence-2026-10-27.json`, `readings-2026-10-27/`;
  - `reviews/2026-10-25/design-pass-3/evidence/runs/`: 36 per-run files, each a two-line header and then a verbatim copy of the same-named file in `/Users/joe/Library/Application Support/Claude/side-session-notes/local_d08b0de6-324a-4bf3-9a5a-49b08d8a4b4d/` (you may diff them).
  - Modified: `project/decisions.md` (the VH-199 entry; `tools/archive.mjs` moved the oldest entry to `project/decisions-2026-10.md` and `project/archive-index.md`), `project/wish-list.md` (VH-199.1 added, VH-172.1 narrowed, VH-192.2 removed as retired), `project/backlog.md`, `project/trajectory.md`, `project/items/VH-199.md`, `VH-200.md`, `VH-203.md`.
- **The rules:** `AGENTS.md` (the contract), `project/profile.md`, `project/items/VH-199.md` (the acceptance criteria), the Phase 8 contract `reviews/2026-10-25/design-pass-3/contract-2026-10-25.md`, and VH-172's close as the model (`reviews/2026-10-22/design-pass-2/evidence/measurements/matrix-2026-10-23.md`, `six-fix-verification-2026-10-23.md`).
- **The evidence:** `E=/Users/joe/UoN-Video-Helper-evidence/pass3-vh199/runs` (the twelve runs and the transitions) and the readings in `readings-2026-10-27/`. Claude's merge of E is in `C=/private/tmp/claude-501/-Users-joe-Library-CloudStorage-OneDrive-TheUniversityofNottingham--Joe-Bell-UoN-Files-2-Projects-2026-08-24-UoN-Video-Helper/c01fdf8f-2ac6-46c7-8503-4075d19104d4/scratchpad/close3/recs.json` (228 MB, one array of the 3,207 ok records), if you need it.
- The commit will carry `Verify:` (the gate's result) and `Checked: gpt-6-astra — <your verdict> — the close`. `CLOSE-CHECK` in the decision and the trajectory line is a placeholder for your verdict. Its body will also say "VH-192.2 — retired — …" and "VH-172.1 — narrowed — …" for the checker's trace rule.

## What to answer

1. **The criteria:** does the close meet each of VH-199's acceptance criteria? Name any that it does not.
2. **Support:** is any number, verdict or attribution in the decision, the contract table, the compare, the matrix account or the digests not supported by the evidence, or stated more strongly than it is? Check a sample of figures against E or the readings.
3. **The compare's settlements:** for each of the seven disagreements and each "Codex only" point, is the settlement sound? Say where you would still disagree, and whether it changes a verdict.
4. **The record:** rules 3 to 6 and 9 of `AGENTS.md`: the decision's form, every deferral a line, the trajectory line, the backlog strike, the retired and narrowed wish lines, the Notes; anything a later session would miss.
5. **Verdict:** one line, "Commit", "Commit after the musts below" or "Do not commit". List musts and mays, numbered, each one sentence with its file and line.

Keep the answer under 1,000 words.
