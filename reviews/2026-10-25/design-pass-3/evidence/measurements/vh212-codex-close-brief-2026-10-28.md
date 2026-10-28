<!-- markdownlint-disable -->

# VH-212 — Codex astra's close check, the brief, 28 October 2026

You are Codex astra, read-only. This is the close check of VH-212 (F15b), a separate run from your blind design check, your blind check and your re-check. Read only this repository and, in the side folder `/Users/joe/UoN-Video-Helper-side/`, only: `vh212-frozen/`, `vh212-wip-5/unstaged.patch`, the ten sources of the copied files (`vh212-codex-design-brief.md`, `vh212-claude-design.md`, `vh212-design-compare.md`, `vh212-codex-blind-brief.md`, `vh212-claude-verdict.md`, `vh212-codex-compare.md`, `vh212-codex-recheck-brief.md`, `vh212-codex-design.md`, `vh212-codex-blind.md`, `vh212-codex-recheck.md`) and lines 283–298 of `plan8-owner-words.md`. Never read any folder under `/Users/joe/Library/Application Support/Claude/side-session-notes/`. Run nothing that writes.

## The candidate

The complete close is the uncommitted working tree against `b4ec37a` (HEAD and origin/main): `git diff b4ec37a` (18 modified files) plus the untracked files (`git ls-files --others --exclude-standard` lists 61), all in `reviews/2026-10-25/design-pass-3/evidence/measurements/`: the table `vh212-playback-advice-2026-10-28.md`, its 50 records in `vh212-records-2026-10-28/`, and ten design, blind and re-check files with their compares (`vh212-*-2026-10-28.md` and `.md.txt`). The candidate is frozen in `vh212-frozen/` (`tracked.patch`, `status.txt`, `untracked-sha1.txt`).

Since your re-check, the build's ten files (`src/`, the filled sheet `reviews/2026-10-18/VH-105-strings-filled.csv`) and the table and records are unchanged: `git diff --binary` of those ten files is byte-equal to `vh212-wip-5/unstaged.patch`, and the table's sha1 is `bfc73fe5bf89ee8624a2ff6827049a2d38e44b72`. What is new is the ledger close and the ten files copied in from the side folder: the three answers verbatim as `.md.txt`, and the briefs, Claude's design reading and verdict and the compares as `.md`, each sha1-equal to its source (each source already opened with the provenance header). Check that they read as the evidence they claim to be.

## The owner's answer and the rulings, not reopened

- The owner's answer, VH-211's ask point 2, is recorded verbatim with its source in `plan8-owner-words.md` (lines 283–284, 292–298): "Backlog review", 2026-10-27 ~16:18Z, his typed "help me resolve VH-212, VH-213, and VH-216", his selection ""before you use it" (Recommended)", the three replacements, and the ~18:06Z clarification that he was never shown the ask's longer recommendation. Check that the item's Notes, the decision and the commit message quote it faithfully, and say it is Backlog review's option, not the ask's.
- Orchestrator #22's ruling at #1's check-in: `walker/prove-8.mjs:54`'s `WARN_WORDS` stays unchanged (the walker's self-test, word-independent; a change would be a walker change beyond the criteria), recorded as one wish line for VH-203; the stale comments at `src/ui/announce.ts:40–43` and `src/audio/warnings.ts:217–219` change to his words.
- The load ruling (Orchestrator #22, #2's check-in): re-runs owed only where readings could depend on timing.

## What to check

1. **Your re-check's result** ("Remaining musts: none." "Remaining shoulds: none." "Verdict: Commit"): note only a regression.
2. **The ledger close.**
   - `project/decisions.md`: the new VH-212 close entry in the file's grammar (heading, Decision, Rationale, Supersedes, Deferred), each claim supported by the table and records.
   - `project/decisions-2026-10.md` and `project/archive-index.md`: `tools/archive.mjs`'s verbatim move of the oldest live entry (VH-178, 2026-10-23).
   - `project/backlog.md`: VH-212 struck, its `[!]` and blocker with it. `project/trajectory.md`: the new line.
   - `project/items/VH-212.md`: Now (Updated, Next step, `Open question: None.`) and the two Notes lines.
   - `reviews/2026-10-25/design-pass-3/design-pass-3-2026-10-27.md`: the row "The failed-playback guidance", with the evidence link, and the "updated at" sentence.
   - `project/wish-list.md`: VH-212.1 (`prove-8.mjs`'s `WARN_WORDS` at `:54` and its comment `:53`).
3. **Rules 5 and 6:** any deferral or follow-up named in the close (the decision, the item, the trajectory line, the table, the commit message) without a line in `project/wish-list.md` or `project/backlog.md` (S-138's row is put to the existing VH-199.1; the zh-Hans and ms-MY reading level to the existing VH-105.2); any open line the work paid off and left open.
4. **The gate** on exactly this tree, under the walk lock, started 23:17:45Z at load 5.68 on AC at 100%, power mode 2: 83 test files, 1,607 passed, 1 skipped (EBU cases 7 and 8, an `it.skip` from before, VH-27); markdownlint 485 files, 0 issues; 540 files, 0 broken links; check-memory 0 structural with the canon's 7 warnings; `node tools/check.mjs` 0 failures and 0 warnings. It runs again after your check, with this brief and your answer added as evidence, the one addition allowed.
5. **The commit message,** below, as drafted: accurate to the diff and the evidence. Its `Verify:` line is the gate re-run; its `Checked:` line takes your verdict as given.
6. **Anything else in the diff** that VH-212 doesn't explain, or any claim in the ledger that the evidence doesn't support.

## The commit message, as drafted

```text
VH-212: heavy limiting's advice in the owner's words, "so play the new video before you use it", true whether or not the new video plays here; that clause alone, in three languages, with its note, tables, tests and two comments; no walker diff; 192 cells before and after, 0 findings; VH-212 closes, VH-215 next

The owner's answer: in the "Backlog review" chat, 2026-10-27 ~16:18Z, typed by him: "help me resolve VH-212, VH-213, and VH-216". For VH-212 (VH-211's ask, point 2) he chose, as the tool returned it: ""before you use it" (Recommended)": en-GB "so play the new video before you save it" becomes "so play the new video before you use it", the rest of the heavy-limiting detail unchanged; zh-Hans (machine) "所以请在保存之前播放新视频" → "所以请在使用之前播放新视频"; ms-MY (machine) "sebelum anda menyimpannya" → "sebelum anda menggunakannya". Not taken: "before you publish or submit it". At ~18:06Z, Backlog review's clarification in the same chat: he was never shown VH-211's ask's longer wording ("so play the new video here and listen. If it will not play here, save it and play the saved file before you share it."); his answer to point 2 is "so play the new video before you use it". His words are Backlog review's option, not the ask's longer recommendation, and they stand (source: plan8-owner-words.md, its 2026-10-27 ~16:18Z and ~18:06Z entries).

The change: warnings.heavyLimiting.detail's clause in src/i18n/en-GB.ts by hand, with its row in the filled sheet (reviews/2026-10-18/VH-105-strings-filled.csv, the Chinese and Malay marked changed by the agent, machine-translated) and its translator note in src/i18n/sheet.ts; zh-Hans.ts and ms-MY.ts regenerated, one line each; the warning, table and announce tests pin the new clause in each language and the old one nowhere (1,600 to 1,607 passed). VH-208's completion line speaks the new detail once, as before. On Orchestrator #22's ruling, the stale comments in src/ui/announce.ts and src/audio/warnings.ts now match his words, and the walker's self-test words, prove-8.mjs:54's WARN_WORDS, stay unchanged (word-independent; wish VH-212.1). No element, state, listener, CSS, config, docs or walker change.

Built and measured by VH-212 #1 to #6: the design, with Codex astra's blind design check, compared; the walker's predicates read the served tables, so none needed a diff, and one instrument revision, 198cfe660331f1bf, read the before on b4ec37a and the after, 192 cells each (S-131, S-132, S-135 to S-138, S-151 and S-152; 1280 and 320 px; en-GB, zh-Hans and ms-MY; four colour modes), on AC, power mode 2: 0 findings, 0 notes; the proof and the served-table probe, 54 of 54. S-138's player row moved in 12 cells, both ways, the walker's timing: the existing wish VH-199.1. Claude's verdict, "Commit, after the close's own record", was saved before Codex astra's blind answer, "Commit after the musts below", was opened; its must, 3.1.5's reading level a person's to confirm (spec §9.3; in zh-Hans and ms-MY not shown, wish VH-105.2), and its should, the before's load median, were repaired in the table, and the re-check said "Commit". Evidence: reviews/2026-10-25/design-pass-3/evidence/measurements/vh212-playback-advice-2026-10-28.md and vh212-records-2026-10-28/.

New wish line: VH-212.1, prove-8.mjs's self-test words, for VH-203. S-138's row is VH-199.1's; the zh-Hans and ms-MY reading level is VH-105.2's.

Digest rules applied (rule 8): nielsen 9, "errors say what next"; wcag-2.2-aaa, 3.1.5 (a reading; the reading level a person's to confirm, in zh-Hans and ms-MY wish VH-105.2) and 4.1.3.

Verify: <the gate re-run after this check, on this content plus this brief and your answer>
Checked: gpt-6-astra — <your verdict, as given> — F15b

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

## Your answer

Markdown, under 400 words: a first line `Verdict: <Commit | Commit after the musts below | Revise>`, then numbered musts with file:line, then notes.
