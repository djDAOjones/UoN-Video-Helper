<!-- markdownlint-disable -->
<!-- The brief Codex astra was given for its re-check of VH-211's close (2026-10-27), verbatim. -->

You are Codex astra, re-checking the points your close check of VH-211 raised, in the UoN Video Helper repository, read-only. HEAD is `51a7201`; the candidate is the working tree's uncommitted changes. Your close check is `reviews/2026-10-25/design-pass-3/vh211-codex-close-2026-10-27.md` ("Commit after the musts below"); the dispositions are in `reviews/2026-10-25/design-pass-3/vh211-plan-2026-10-27.md`, "After Codex astra's close check".

## Check each repaired point

1. The PLAN-8 entry's Items line in `project/decisions.md` (cumulative for Phase 8).
2. VH-203's sizing: held for the owner in `project/items/VH-203.md` (Now), `project/backlog.md` (`[!]`), the PLAN-8 Rationale and Decision, VH-211's trajectory line, and the ask's point 4 (`reviews/2026-10-25/design-pass-3/vh211-owner-ask-2026-10-27.md`, at most 300 words).
3. The notice in `vh211-plan-2026-10-27.md` above "Each item's substance".
4. The sheet in `project/items/VH-212.md`, `VH-213.md` and `VH-216.md`.
5. The device-scale pointer in `project/items/VH-224.md` and `project/wish-list.md` (VH-172.1).

Then anything the repairs broke. Do not run the app, the tests, the walker or a browser. Change no file; read-only commands such as `git diff` and `node tools/check.mjs` are fine.

## Format

Markdown to standard output, nothing else. One line per point: repaired or not, with file and line. Then one verdict line, either "Commit" or "Commit after the musts below" or "Do not commit". Under 400 words.
