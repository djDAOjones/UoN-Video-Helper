<!-- markdownlint-disable -->

# Codex astra — VH-177 check brief, 24 October 2026

You are checking Phase 7's close, VH-177, in the UoN Video Helper repository (your cwd), read-only. You are a full partner in this pass. Be critical. Mark each point **must** (the close is wrong or incomplete without it) or **may** (an improvement), and end with one verdict line: "Close", "Close after the musts below", or "Do not close".

## What to read

- `AGENTS.md` (rule 11 is the phase close; rules 5 and 6), `project/profile.md`, `verbs/recall.md`.
- `project/items/VH-177.md`: its criteria are what you check against.
- The PLAN-7 entries in `project/decisions.md`: 2026-10-22 "A second design, UX and accessibility pass…" with its **Items:** line, the fix plan of 2026-10-23, and "The owner decides the four wish lines".
- The candidate is the working tree against HEAD (`5a5b3df`, VH-176). Run `git diff HEAD` and `git status`. It touches only the record and the bundle: the backlog, the trajectory, the decisions (the new entry `2026-10-24 — VH-177 — Phase 7 closes…`, with one older entry moved by `tools/archive.mjs` into `project/decisions-2026-10.md`), the wish list, the item files, the report's Disposition table and the person checklist. No app code changes, and nothing in `docs/` changes.
- The evidence: `reviews/2026-10-22/design-pass-2/evidence/measurements/after-run-2026-10-24.md`, `codex-astra-integrated-check-2026-10-24.md` and `codex-astra-integrated-recheck-2026-10-24.md`.

## What to check

1. **Reconciled.** Has every item on PLAN-7's Items lines (VH-170 to VH-177, VH-178 to VH-181) shipped, with a trajectory line and a commit (`git log --oneline`), no backlog line, and a Now that says shipped? Was nothing dropped silently (rule 5)?
2. **The Disposition table is final.** Does each finding (V-18, V-33, V-40 to V-47) name its item and evidence, a wish line, or a reason?
3. **The record is up to date.**
   - Does UI-STANDARDS name each rule the fixes changed? A gap goes to wish line VH-177.5.
   - Are the spec's needs drafted as wish lines (VH-177.1 to .4) and kept out of `docs/`?
   - Are the statement's needs added to VH-137 as Notes only, with no criterion added?
   - Was any wish line retired? Is it right that none was, given VH-150.2, VH-150.3 and VH-153.1?
4. **The person checklist** (`person-checklist-2026-10-23.md`). Does it say what each check settles in VH-137, VH-113, VH-M4 and spec §13 criterion 10? Does it avoid claiming criterion 10 or full conformance?
5. **Rule 11.**
   - Is Phase 7 marked CLOSED in the backlog?
   - Was only the Phase 7 block lifted from VH-162? It is now `[!]`, blocked on the owner's call about VH-137's review of 18 November, as its own Now says. Is that the right reading, or a re-scope?
   - Is Phase 6 still open?
   - Is the next item named with a reason?
   - Is the recall in the trajectory line and decision supported by the record as it stood before the close edits? Are the answers right, and is it labelled local?
6. **Shape.** Do the decision's Decision line and Deferred line follow the ledger's grammar? Are the trajectory lines in the right form and place? Does `node tools/check.mjs` report 0 failures? (You may run it read-only.)
