<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), check of VH-162, 2026-10-24, at main d926bd3 with the working-tree diff; brief: codex-astra-vh162-brief-2026-10-24.md. The reply, verbatim. Its one must, the Supersedes line naming PLAN-6's timing condition, is applied in the VH-162 decision. -->

Commit after the musts below

1. **must — Correct the supersession record.** `project/decisions.md:27` says `Supersedes: none`, but PLAN-6 explicitly made the statement review a release prerequisite (`project/decisions.md:464`). Name **2026-10-22 — PLAN-6 — The public release: 0.2.0 on Xerte, Phase 5 then Phase 6, the feedback form beside what exists**, scoped to that timing condition. This is the rule 4 blocker.

2. **may — Accept the hosting edits.** A1–A5 match the approved wording, allowing Markdown line wrapping: `project/brief.md:23`, `:86`, `:178`; `project/profile.md:13`, `:26`. D5 gains the requested dated answer at `docs/03-open-decisions.md:23`. No other signed text changed.

3. **may — Accept the version diff.** Only the product-version fields change: `package.json:3`, `package-lock.json:3` and `package-lock.json:9`. The lockfile correctly carries both its top-level version and `packages[""].version`. No dependency or other manifest value changes. The diff cannot independently prove which command generated it.

4. **may — Accept the release’s qualification.** No new v1 or full-conformance claim appears. The partial-compliance statement and machine-translation limitation remain (`src/i18n/en-GB.ts:903`, `:884`). VH-137 stays open for **2026-11-18** (`project/backlog.md:33`; `src/config/accessibility.ts:24`).

5. **may — Accept the remaining ledger changes.** VH-162 has a newest-first Decision/Rationale entry; deferred VH-14 and VH-137 remain indexed; VH-162.1 records the infrastructure follow-up (`project/wish-list.md:67`). VH-162 leaves the backlog and gains the required trajectory line (`project/trajectory.md:38`). VH-146 moved verbatim into `project/decisions-2026-10.md:652`; the archive index correctly reports 64 entries. Rules 5–6 are satisfied by the candidate close.

6. **should — Keep release verification distinct from this review.** The “shipped” and “zip is built” wording (`project/items/VH-162.md:20`, `:37`) anticipates the specified post-commit steps. Confirm the tag push and successful package before reporting completion. Account for the currently untracked review brief: packaging rejects untracked files too (`scripts/package-xerte.mjs:125`). I made no changes and ran neither the gate nor a build; their results remain unverified here.