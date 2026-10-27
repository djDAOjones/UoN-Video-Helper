<!-- markdownlint-disable -->
<!-- Codex astra's re-check of the points its close check of VH-211 raised (2026-10-27), from vh211-codex-recheck-brief-2026-10-27.md, run with codex exec -m gpt-6-astra -s read-only on the repaired candidate at 51a7201, verbatim. -->

1. **Repaired** — `project/decisions.md:29` lists all 43 Phase 8 items, without omissions or duplicates, preserving the planned execution order.
2. **Repaired** — VH-203’s sizing remains the owner’s decision in `project/items/VH-203.md:28`, `project/backlog.md:58`, PLAN-8’s Decision and Rationale (`project/decisions.md:23`, `:25`), and `project/trajectory.md:34`. Point 4 presents both options (`reviews/2026-10-25/design-pass-3/vh211-owner-ask-2026-10-27.md:26`); the ask is **298 words**, including its heading, excluding comments.
3. **Repaired** — `reviews/2026-10-25/design-pass-3/vh211-plan-2026-10-27.md:38` explicitly marks the substance summary historical, names its corrections and makes the corrected item files authoritative.
4. **Repaired** — Translator notes and the regenerated sheet are explicit in `project/items/VH-212.md:11` and `project/items/VH-213.md:14`; location-description updates are required by `project/items/VH-216.md:11`.
5. **Repaired** — `project/items/VH-224.md:12` and `project/wish-list.md:44` correctly point to `reviews/2026-10-22/design-pass-2/evidence/measurements/after-run-2026-10-24.md:77`; line 79 explains the device-scale uncertainty.
6. **No new blocking regression found** — `node tools/check.mjs` reports **0 structural/budget failures**, backlog **997 words**, and the same nine promotion-trace warnings. Retain the individual commit-body traces promised at `project/decisions.md:25`. `git diff --check` passes. No files changed; app, tests, walker and browser were not run.

Commit