<!-- markdownlint-disable -->

# VH-212 — Claude's verdict and Codex astra's blind check, compared, 28 October 2026

**When each was saved.** Codex's brief `vh212-codex-blind-brief.md` saved 22:28Z (sha1 `4c8273fe…`); Codex started 22:29:07Z (PID 24976). Claude's verdict `vh212-claude-verdict.md` saved 22:31:46Z (sha1 `6dcd859d…`), before Codex's answer was opened. Codex ended at 22:33Z; its answer `vh212-codex-blind.md` (sha1 `72ee4b57…`, 696 words) was opened at 22:33:40Z. Its log shows no read outside what its brief allowed (no other `vh212-*` file, nothing under `side-session-notes/`). This compare saved 22:35Z.

**The verdicts.** Claude: "Commit, after the close's own record", no must. Codex: "Commit after the musts below", one must and one should.

## Agreed
- **The owner's words:** exactly the three replacements, each once, the old nowhere; punctuation, spacing, cause, consequence and "Next time" unchanged; no other message or heading changed; each reads correctly in its sentence and holds whether or not the new video plays here. Codex checked each whole table against its base.
- **Spoken as VH-208 left it:** `warningsSpoken` appends the whole detail once; the new clause in all 144 warning completions, S-151 included; status-write totals equal before and after in all 192 cells. Actual speech is a person's limit.
- **The sheet:** row `:367` (CRLF kept), its translations, note and machine-translation mark; `sheet.ts:457–458`; the tables equal the regenerated sheet (Codex regenerated them in memory), held by `tables.test.ts:223`.
- **The tests:** the new clause pinned and the old rejected in each language; seven added, none deleted, skipped or weakened; no TypeScript or lint risk.
- **The walker:** no diff; the predicates read the served tables (`scenarios.mjs:31–34`, `phase8.mjs:791`); the proof and probe before the after. Codex recomputed the instrument revision, `198cfe660331f1bf`.
- **The measurement:** both 192-cell matrices whole; the before on the clean `b4ec37a`; the after's diff hash the candidate's; the clause counts, geometry, line counts, VH-199's column, the completion coverage and S-152's assert and five subresults agree with the records. Codex matched all 49 copies to their sources by sha1.
- **WCAG** 1.4.8 (its measured scope), 1.4.10, 2.4.6 and 4.1.3 as exposure, with enlargement and speech recorded as limits.
- **Tokens:** no CSS, configuration, literal, listener, state, element, control or checkbox; the progress bar kept.
- **Documents:** no UI-STANDARDS rule changes; the spec's row `:325` defines the threshold, not the words, so no `docs/` wish.
- **At the close:** the gate and the checker, the close check, the Disposition row, the ledger with the owner's answer, and the VH-203 wish line ruling 1 asks for.
- **S-138's row:** the walker's known timing, VH-208's table §7 and wish VH-199.1; no new line, no re-run.
- **The rulings:** both comment edits follow ruling 2; `WARN_WORDS` stays, per ruling 1.
- **The digest rules:** nielsen 9 and wcag-2.2-aaa 4.1.3 applied.

## Codex only
1. **Must: 3.1.5 recorded as "holds".** The table's §6 row reads "holds, a reading, not a measurement", but the spec reserves the reading level for a person: "the translated terms and reading level (3.1.3, 3.1.5)" are among the "Evidence only a person can supply, recorded as limitations, not failures" (`docs/01-specification.md:730–736`, §9.3). Claude's verdict accepted the row as a reading. **The evidence settles it for Codex**, so it is a point Claude's verdict missed: **repair** the row to keep the reading and record the reading level as a person's limit, with zh-Hans and ms-MY not shown until a colleague checks the language (wish VH-105.2: "When a campus colleague has checked their language on the live page, …"). Then re-check.
2. **Should: the before's load median.** The table's §2 gives "median 5.92"; the 34 samples of `before-1.load.log` give 5.955. Claude recomputed it: 5.955 (the after's 3.62 and the end loads, 2.73 and 3.63 from each run's `conditions.txt`, are right). **Repair** to 5.96; the load ruling is unaffected.
3. Codex adds that S-138's failing sample finds the player absent, not playing unexpectedly, which fits the race.
4. Codex records the sizing's token spend as "not shown"; it judges the scope only, as Claude did.

## Claude only
1. S-138's 12 cells move both ways (8 pass → fail, 4 fail → pass, each group's modes alike), which a change to one clause's words with identical geometry cannot plausibly cause.
2. The comments' sentences still read true after the edit (`announce.ts:41`'s reason; heavy limiting first in `detectProductionWarnings`).
3. Two nits, no change: `tables.test.ts` indexes `CLAUSE` by a cast where `warning-text.test.ts` types it by `LanguageTag`; §9 names the side folder by absolute path in prose, not as a link, as VH-208's table does.
4. Carbon: nothing touched.

## Disagreed
None. Codex's must is a point Claude's verdict missed, and the spec's own words settle it; the should is a number the records settle. Neither is held for the owner.

## The repair, then the re-check
The table changes only at those two points (brief §1: a point Claude's verdict, Codex's blind check or the close check fails): §6's 3.1.5 row and §2's before median. Codex re-checks them as `recheck`, and the follow-up verdict is kept below.

### Claude's reading of the repair (saved 22:35Z, before the re-check started at 22:35:34Z)
- The table `vh212-playback-advice-2026-10-28.md` changed at two lines only (sha1 `acceb257…` → `bfc73fe5bf89ee8624a2ff6827049a2d38e44b72`; `diff` against `vh212-wip-4/untracked/` shows `36c36` and `118c118`). Nothing else in the tree changed: the tracked diff is #3's, the records untouched.
- §2, `:36`: the before's median 5.92 → 5.96, which the 34 samples give (5.955); the peaks 20.65 and 23.01 and the windows re-read right.
- §6, `:118`: 3.1.5's reading is kept ("a reading, not a measurement: the change adds no difficulty"), and its result now records the reading level as a person's to confirm (spec §9.3), a limitation, with zh-Hans and ms-MY, machine-translated, not shown until a colleague checks the language on the live page (wish VH-105.2). That is what §9.3 asks, and no longer says "holds".
- My reading: both points repaired; nothing else owed. The digest naming at close (wcag-2.2-aaa 3.1.5) stands: the criterion is applied as far as an agent can, and its person's part is recorded as a limit.

### The re-check's follow-up verdict, kept
- Codex `recheck` ran 22:35:34–22:37:26Z from `vh212-codex-recheck-brief.md` (sha1 `62b5ef47…`); its answer `vh212-codex-recheck.md` (sha1 `1641cc0319a86fb57926d0174cbbcb910a2d4c40`, 176 words) was opened after Claude's reading above was saved. Its log shows reads only in `vh212-walk/` and the allowed `vh212-wip-4` copy of the table.
- **"Remaining musts: none." "Remaining shoulds: none." "Verdict: Commit".** The 3.1.5 row now records the reading level as a person's limit, zh-Hans and ms-MY not shown and linked to VH-105.2, as §9.3 requires, and fits §6 and §8; the median 5.955 (middle values 5.92 and 5.99) correctly 5.96; the table differs at `36c36` and `118c118` only; the 49 copies match `sources.txt`; status 12 lines; `node tools/check.mjs` zero failures, zero warnings.
- **Agreed** with Claude's reading of the repair on every point. Codex noted that the CSV's byte identity since its check rested on the brief's word; Claude confirmed it at 22:37:35Z: `git diff --binary` is byte-equal to `vh212-wip-4/unstaged.patch` (the ten files, the CSV among them), nothing staged, 12 status lines, 51 untracked files.
- **Result:** Claude "Commit, after the close's own record"; Codex "Commit". No point held for the owner. Step 6 is done; the close (step 7) carries the rest.
