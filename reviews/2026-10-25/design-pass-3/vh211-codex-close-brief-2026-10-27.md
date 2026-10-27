<!-- markdownlint-disable -->
<!-- The brief Codex astra was given for its check of VH-211's close diff (2026-10-27), verbatim. -->

You are Codex astra, checking VH-211's close diff before its commit, in the UoN Video Helper repository, read-only. HEAD is `51a7201`; the candidate is the working tree's uncommitted changes. You critiqued the merged plan earlier ("Revise before recording the plan; retain its overall scope, grouping and build order"); this checks the record that came of it.

## Read

- `git status` and `git diff` (the changes to `project/backlog.md`, `project/wish-list.md`, `project/decisions.md`, `project/decisions-2026-10.md`, `project/archive-index.md`, `project/trajectory.md`, `project/items/VH-203.md`, `VH-208.md`, `VH-209.md`, `VH-210.md`, `VH-211.md`, and the report `reviews/2026-10-25/design-pass-3/design-pass-3-2026-10-27.md`'s Disposition).
- The new files: `project/items/VH-212.md` to `VH-224.md`; in `reviews/2026-10-25/design-pass-3/`, every `vh211-*` file (the plans, the compare, your two answers, the briefs, the ask).
- The dispositions of your critique's points: `vh211-plan-2026-10-27.md`, "After Codex astra's critique".
- The contract `AGENTS.md`, `project/items/_schema.md`, `verbs/plan.md`, `project/items/VH-203.md` (the stage rule).

Do not run the app, the tests, the walker or a browser. Change no file. You may run read-only commands (`git diff`, `node tools/check.mjs`, `node tools/view.mjs --help` is not needed).

## Judge

1. **Your critique applied:** each point applied as the plan says, or refused with a reason you accept or not.
2. **The items:** each of VH-212 to VH-224 carries VH-203's stage rule whole and the criteria the merged plan gives it; file and line claims right at HEAD; IDs, order and marks the same in the backlog, the decision and the item files.
3. **The record:** the PLAN-8 entry (the owner's scope verbatim with its source; C, D and E untaken; the Items line cumulative for Phase 8; the Supersedes line); the wish-list's nine promotions and three narrowings, nothing dropped (the commit body will carry a trace line for each: "ORIGIN.N — promoted to ITEM — reason"); the backlog lines shortened losslessly (every shortened title whole in its item file); VH-211's trajectory line; the updates to VH-203, VH-208, VH-209, VH-210 and the Disposition.
4. **The ask** (`vh211-owner-ask-2026-10-27.md`): true to the items, at most 300 words, each point's recommendation first.
5. **Anything** that would make a later worker misread an item.

## Format

Markdown to standard output, nothing else. A numbered list of points, each **must** (fix before commit), **should** or **note**, with file and line and the change. Then one verdict line, either "Commit" or "Commit after the musts below" or "Do not commit". Under 900 words.
