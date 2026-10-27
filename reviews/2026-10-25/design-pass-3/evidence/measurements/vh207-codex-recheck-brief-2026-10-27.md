<!-- markdownlint-disable -->

# VH-207 — Codex astra's re-check of its blind check's musts, the brief, 27 October 2026

You are Codex astra, read-only; read nothing outside this repository. Your blind check of VH-207 (`reviews/2026-10-25/design-pass-3/evidence/measurements/vh207-codex-blind-2026-10-27.md.txt`) gave "Commit after the musts below". Claude's compare and its answers are now in `vh207-codex-compare-2026-10-27.md` beside it; Claude's verdict is `vh207-claude-verdict-2026-10-27.md`. The candidate is still the uncommitted working tree against `5893d9d` (`git diff 5893d9d` plus `git status --porcelain`).

Re-check only these, and anything added since your check:
1. Must 1: `#trim-clear` now in the choosing's capture (`src/main.ts`, the `fromChoosing` list), and its proof: `vh207-records-2026-10-27/vh207-probe-trimclear.mjs.txt`, `probe-trimclear-before.json`, `probe-trimclear-after.json`, and the table's section 2a (`vh207-focus-2026-10-27.md`).
2. Must 2 ("by keys"): Claude did not re-walk; read its answer in the compare and judge it on the evidence (`walker/qualify.mjs` `focusByKeyboard`, S-149's own `READ_FAILURE_SUB`, the routes).
3. Must 3 (the next Tab after the ring instrument): Claude did not re-walk; read its answer, and check its counts in the records (`after-S-149*.json`, `before-S-149*.json`: `"back"` and "focus on the body: no ring to read") and the probe's untouched Tab.
4. Must 4: `vh207-records-2026-10-27/before-source-check.json`, and the table's provenance row.
5. Must 5 stays close work (the gate on the frozen candidate).
The ledger edits are now made (`project/`, the report's Disposition row); a separate close check will review the complete close diff, so don't review them here beyond noting a defect you see.

Answer in under 400 words: for each of musts 1–4, "resolved" or "still a must", with one line why. End with one line: `Verdict: <Commit | Commit after the musts below | Do not commit>`.
