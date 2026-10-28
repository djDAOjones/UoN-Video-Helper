<!-- markdownlint-disable -->

# VH-208 — Codex astra's blind check, the brief, 28 October 2026

You are Codex astra, checking VH-208 read-only and blind. Claude Code built it. Its own verdict and any compare are deliberately kept from you: they are not in this repository, so don't look for them, and don't read anything outside this repository. Judge from the evidence below alone.

## What VH-208 is
`project/items/VH-208.md` is the contract: read it in full, since every acceptance criterion holds. It fixes pass 3's V-52 (`reviews/2026-10-25/design-pass-3/design-pass-3-2026-10-27.md`). The heavy-limiting warning's advice, "…so play the new video before you save it", came after the player and Save in the finished card, and the completion's live-region write gave only the warnings' titles.

## The candidate
- **The tracked diff:** the uncommitted working tree against its base `a87e0f5`, `git diff a87e0f5`, nine files.
  - The build: `src/main.ts`, `src/ui/warning-text.ts`, `src/ui/announce.ts`, `src/styles/app.css`, `src/ui/announce.test.ts`, `test/screen-text.test.ts`.
  - The walker: `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/phase8.mjs`, `prove-8.mjs`, `scenarios.mjs`.
- **The untracked evidence** (`git status --porcelain`):
  - the table, `reviews/2026-10-25/design-pass-3/evidence/measurements/vh208-warnings-2026-10-28.md`;
  - its records in `vh208-records-2026-10-28/` beside it: per run and scenario one cell per line, `provenance.json`, the nine record-by-record compares, the tallies (`tab-6.out.txt`, `tab-6.diff.txt`, `summ-5.out.txt`, `loadmap-5.out.txt`), each run's conditions and load log, and the scripts as `.txt`.
- **Not run yet:** `npm run check`, the gate, runs at the close. The table's section 11 gives the build's earlier unit-test run.

## What the owner approved, and what was ruled
- **The plan.** The owner approved VH-202's plan "as reccomended". It covers what VH-208's criteria declare: the order and completion-line behaviour, their tests, and the walker changes the criteria name (`warnBox`; the completion check and its `prove-8.mjs` fixture).
- **The ruling.** His ruling "Yes, all three" changed two walker asserts, S-136 (`scenarios.mjs:2453`) and S-91 (`:2845`), from "beside the card, not inside it" to "no notification nested in the card", keeping the order check. With the criteria's own changes, these are the only walker changes approved.
- **The design.** The warnings go inside the finished card, as its own content after its lines and before the player, with no notification of their own. It was settled in an earlier, separate design check.
- **S-138.** The orchestrator's ruling, verbatim: "S-138's timing-dependent player row goes in VH-208's table as such. If it is a walker defect, it is a wish line under rule 5 at VH-208's close, not a walker fix in VH-208 (no walker change beyond its criteria)."

## What to check
1. **Each acceptance criterion:** met, not met, or not shown, with the evidence (file and line, or record).
2. **The code.**
   - `renderWarnings`'s `contentOnly` path and what it does to the box.
   - The card's new order in `renderResult` and `paint`, including "Previous video", after a save, after "Keep it" and after a page-language change.
   - `warningsSpoken`'s added detail: chosen by code; no string new or split; heavy limiting's detail only; the sentence gap.
   - That no other caller of `renderWarnings` or `warningsSpoken` changes behaviour. The warnings before Create keep their notification and reassurance.
   - The CSS against the token rules: our own CSS, no literal outside `src/config/` or a token, no element or control added.
   - Any defect: a stale reference, ordering, TypeScript or lint risk, or a test that no longer pins what it claims.
3. **The tests.**
   - VH-150's pin in `test/screen-text.test.ts`: rewritten, not deleted or skipped, and still forbidding one notification nested in another.
   - `src/ui/announce.test.ts`.
4. **The walker.** The three files' changes against the criteria and the ruling, and nothing beyond them.
5. **The measurement.**
   - Before and after whole for every cell the stage rule lists. The provenance: the before was walked on a `git archive` export, so say if that is a problem.
   - Power and load against the table's rules.
   - The readings: the accessibility tree's order, the live write, the painted order, the card's height and the first screen at 320 px.
   - The table's sections 6 and 7: the focus instrument's change in 32 cells, and S-138's row.
   - The WCAG re-check: 1.3.1, 1.3.2, 2.4.3, 2.4.6, 4.1.3, 1.4.8, 1.4.10, 1.4.12, and 2.4.13 for the player and Save. What only a person can check must be recorded as a limitation, never as passed (`docs/01-specification.md` §9.3).
   - S-152's state.
   - Whether every number the table cites matches its records.
6. **Scope and record.**
   - Anything built beyond the criteria, or anything they ask for that is missing.
   - Whether a rule in `UI-STANDARDS.md` changes, so that it must be updated, or whether a `docs/` correction is needed. A `docs/` correction would be a wish line for the owner, never an edit.
   - Any follow-up the evidence shows, which must become a wish-list or backlog line, never a sentence alone.
7. **The digest rules the close names** (AGENTS.md rule 8): nielsen 1, "status visible and announced", 5 and 6 (`project/digests/nielsen.md`); carbon, "one primary per state"; wcag-2.2-aaa, 4.1.3. Say whether each is applied.

## Answer
Under 900 words. List each must (a defect or an unmet criterion that blocks a commit) and each should, separately. End with one line: `Verdict: <Commit | Commit after the musts below | Do not commit>`.
