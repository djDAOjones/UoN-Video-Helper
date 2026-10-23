# Codex astra brief — the owner's four decisions recorded (PLAN-7, 2026-10-23)

You are checking a ledger-only change in this repository, read-only. Base: commit 8576616. The candidate is the working tree's diff (`git diff` plus the new file `project/items/VH-181.md`).

The owner decided four wish lines on 2026-10-23. Their words, verbatim:

- "VH-175.3 (V-45, the step 4 name): use “Closing graphics” everywhere, with the specification’s §6 line changed to match. It’s what the step’s own lines already say, and having two names breaks the project’s “no synonyms” rule."
- "VH-174.1 (V-44, no hover change under forced colours): add a border-only hover change in a system colour. It’s cheap, it helps people who use Windows contrast themes, and it touches the same CSS area as VH-179."
- "VH-175.1 (V-18, the first action below the first screen): leave it as accepted. The only remaining fix is shorter Chinese and Malay wording, which needs a native reader, so wait for one."
- "VH-175.2 (the “Choose File” line for the accessibility statement): leave it for VH-137’s review of the statement, so that text is only edited once."

The recording the orchestrator asked for: one decision entry quoting the owner, with Supersedes and Deferred; VH-175.3 promoted to a new Phase 7 item (VH-181) placed before VH-176, step 4's name "Closing graphics" in all three languages and spec §6's line to match (spec budget 8,100, now 8,074); VH-174.1 folded into VH-179 as an added criterion (border-only hover in a system colour under forced colours for filled and danger buttons); VH-175.1 retired as accepted, with a wish line waiting for a native Chinese or Malay reader's shorter wording; VH-175.2 kept for VH-137, noting the owner chose to edit the statement once.

Read AGENTS.md (the contract), `project/decisions.md` (top entry), `project/backlog.md` (Phase 7), `project/wish-list.md`, `project/items/VH-179.md`, `project/items/VH-180.md`, `project/items/VH-181.md`, and, for the facts, `reviews/2026-10-22/design-pass-2/design-pass-2-2026-10-23.md` (V-18, V-44, V-45) and `src/i18n/*.ts`, `index.html`, `docs/01-specification.md` line 626.

Check: (1) the owner's words are quoted exactly and every one of the four is carried out as asked, no more; (2) VH-181's and VH-179's new criteria are checkable, complete (every place that names step 4) and add no control or element; (3) nothing contradicts an existing decision without saying so; (4) rule 5: every deferral is a line. Reply with a verdict line first ("Commit", "Commit after the musts below", or "Do not commit"), then numbered points, each marked must or may, each with file:line. Be brief.
