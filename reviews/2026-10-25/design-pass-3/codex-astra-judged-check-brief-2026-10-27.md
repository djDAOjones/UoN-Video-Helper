<!-- markdownlint-disable -->
<!-- The brief Codex astra was given for its close check of the judged files, findings and checklist in the third design pass (VH-200, 2026-10-27), verbatim. It ran with `codex exec -m gpt-6-astra -s read-only` in the repository's working tree at 25b6ccb, outside any commit of VH-200's. -->

You are Codex astra, checking VH-200 (Pass 3 judged) before its commit, in the UoN Video Helper repository (read-only). Do not run anything, and do not open any file over 1 MB.

## What VH-200 must do
`project/items/VH-200.md`: its acceptance criteria and Notes.

## What it wrote
The untracked files in `reviews/2026-10-25/design-pass-3/`:
- `judged-2026-10-27.md`
- `wcag-2026-10-27.md`
- `person-checklist-2026-10-27.md`
- `attrib-claude-2026-10-27.md` and `attrib-compare-2026-10-27.md`
- `vh205-claude-2026-10-27.md` and `vh205-compare-2026-10-27.md`
- `wcag-compare-2026-10-27.md`
- your own four answers and their briefs, `codex-astra-*-2026-10-27.md`, among the new ones (`git status`).

## The evidence
`reviews/2026-10-25/design-pass-3/evidence/measurements/` (digests, contract and matrix); Phase 7's files in `reviews/2026-10-22/design-pass-2/`; the source.

## Check
1. **Each acceptance criterion:** met or not, with the place.
2. **The routed rows each have a verdict, a finding or a stated reason:**
   - the blind review's D-05, D-06 and V-46;
   - the pilot readings S-15 and T-46.1;
   - S-149;
   - the contract's "Held for VH-200";
   - the matrix's "Seen for VH-200";
   - S-113's 32 px sideways scroll;
   - the format "?" (before, and VH-205's fix, labelled);
   - the finish+1s player class (823 rows, counted as neither).
3. **The findings.** Are they correct on the evidence, ranked consistently (1: a novice is blocked, misled, or could lose work or trust; 2: real friction or a breach of a named standard; 3: polish), not duplicates of V-01 to V-47, with a regression under its old ID? Does any direction add a control, checkbox or element without being marked for the owner?
4. **The WCAG table.** Is each verdict consistent with its evidence and with the table's own rules (a verdict covers the run's records; "c-d" is never a pass)? Are the Counts arithmetic and the "Against 23 October" section consistent with the rows?
5. **The three compare files.** Is each disagreement settled on the evidence, with a reason, or held for the owner where the evidence can't settle it?
6. **The person checklist.** Plain words; the build link, test clips, tasks and expected outcomes, a report form, and the feedback address from `src/config/feedback.ts`; and the Phase 8 additions the plan names (`plan-2026-10-25.md`, lines 369–422).

Give each point as **must** (blocks the commit), **should** or **may**, with file:line. End with one verdict line: "Commit", "Commit after the musts below", or "Revise". Keep it under 1,200 words.
