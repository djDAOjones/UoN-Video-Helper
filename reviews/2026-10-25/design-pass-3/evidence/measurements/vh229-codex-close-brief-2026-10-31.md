<!-- markdownlint-disable -->

# VH-229 — Codex's close check, brief

Read-only check of a complete candidate close in this repository, before its commit. Answer with one first word, "Commit" or "Hold", then each point. Do not edit anything.

**Candidate.** Base and origin/main `ff44a4f21fdd01d119b54ce3b5bace07e0f43428`; uncommitted in the working tree: tracked `git diff` against that base, and the untracked files `reviews/2026-10-25/design-pass-3/evidence/measurements/vh229-*`, including `vh229-records-2026-10-31/`.

**What you may read:** this repository; `AGENTS.md`, `project/`, `docs/`, `UI-STANDARDS.md`. In this repository the Codex and Claude files of this item are at `reviews/2026-10-25/design-pass-3/evidence/measurements/vh229-*-2026-10-31.md*`, and you may read them all now, since this is the check of the whole. Do not read any folder under `side-session-notes/`, nor `vh229-progress.md` or any `vh229-handover-*` outside this repository.

**The owner's words,** verbatim, as `project/items/VH-229.md`'s Notes quote them: "what about a question mark box after the app title, if clicked expands the promises follwoed by the "Your video is processed on your device, it is never uploaded, and the original file does not change." segment. users then aren't bother by text, the controls are self evident / self guiding, and novices can click the question mark"; "Hide both", having been told Claude recommended keeping the privacy line in view; "maybe it invades the current vh-217"; "schedule it at the most appripate point in the backlog"; "Approve both", to the §9.2 wording and the name "About this tool", his word covering the 8,200-word budget.

**What he approved,** and nothing else: one "?" button beside the title, one panel element holding today's promises and privacy line, a wrapper for the title row if the layout needs it, one new string (Chinese and Malay marked machine translations), and the one §9.2 line as wish VH-229.1 gave it. Any other element, string, `docs/` edit or walker change is a defect. `#browser-note` stays in view. VH-217's gap and open state stand. VH-216's "one order at every width" stands. Rows pinning the old order are reported, none edited.

**What earlier checks said.** The design's blind check and its compare: `vh229-codex-design-2026-10-31.md.txt`, `vh229-design-compare-2026-10-31.md`. The verdict's blind check: `vh229-codex-blind-2026-10-31.md.txt`, first word "Hold"; Claude's verdict `vh229-claude-verdict-2026-10-31.md` was saved before it; the compare `vh229-codex-compare-2026-10-31.md` says how each point was taken.

**Check each, naming file and line:**

1. Each blind-check point is settled as the compare says: `vh229-title-help-reconciled-2026-10-31.md` reproduces from the records by `vh229-records-2026-10-31/vh229-reconcile.mjs.txt` (run it: `node <that file copied to a .mjs> <records dir>` writes to stdout only, if your sandbox allows, else read it); the table stands unrewritten; the provenance of the before's re-walks is stated truly; "read well" is not claimed past the measure.
2. `project/items/VH-229.md`: each criterion true of the diff and evidence, no refinement below his words, Now and Open question true, Notes quote his answers.
3. Rule 5: `project/wish-list.md`: VH-229.1 gone and its trace in the decision; VH-216.1's redraw true at the line numbers it names in `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/scenarios.mjs`, and the walker itself unchanged; VH-216.3, VH-175.4, VH-217.4, VH-105.2 as edited; VH-229.2, .3 and .4 true, and each claim about a later item (VH-209, VH-225, VH-203) checked against its item or the walker. Nothing deferred without a line.
4. Rule 4 and 6: `project/decisions.md`'s new entry, its numbers against the records, its Supersedes scope; the archive move verbatim (`project/decisions-2026-10.md`, `project/archive-index.md`); the backlog line struck; one trajectory line, at the phase's end.
5. Rule 8: the digest rules named are the ones applied.
6. The Disposition row in `reviews/2026-10-25/design-pass-3/design-pass-3-2026-10-27.md`.
7. The evidence: every Codex answer verbatim, the copies complete; the renames in the records (`.mjs` to `.mjs.txt`, `vh229-table-notes.md` to `.md.txt`) as the reconciled page states, sha1s matching `vh229-records-2026-10-31/sources.txt`.
8. Rule 7: no test deleted, skipped or weakened in the diff (`test/screen-text.test.ts`, `src/i18n/tables.test.ts`); no dependency change; no protected path but the approved §9.2 line; `samples/` untouched; `project/rules.md` untouched.
9. The product diff, once more with fresh eyes: anything the owner's words do not approve, anything false, anything broken for a keyboard or a screen reader.

The gate's result, for your reading, not to re-run: `npm run check` exit 0 at load 7.55, AC, power mode 2, 83 files, 1,648 passed, 1 skipped; `node tools/check.mjs` 0 failures, 0 warnings. Commit message comes after you; judge the candidate.

Keep your answer under 700 words. First word "Commit" or "Hold".
