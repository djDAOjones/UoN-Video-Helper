<!-- markdownlint-disable -->

# VH-215 — Codex astra's close check, the brief, 30 October 2026

You are Codex astra, read-only. This is the close check of VH-215 (wish VH-139.5), a separate run from your blind design check (`design`), its re-check (`design-recheck`), your blind check of the verdict (`blind`) and your re-check (`recheck`). Read only this repository and, in the side folder `/Users/joe/UoN-Video-Helper-side/`, only: `vh215-frozen/`; `vh215-wip-20/unstaged.patch`; lines 29–81 of `vh215-progress.md` (the route's trace and timings); lines 275–277 of `plan8-owner-words.md` (the owner's scope); and the thirteen sources of the copied files: `vh215-codex-design-brief.md`, `vh215-design-compare.md`, `vh215-codex-design-recheck-brief.md`, `vh215-claude-design.md`, `vh215-codex-blind-brief.md`, `vh215-claude-verdict.md`, `vh215-codex-compare.md`, `vh215-codex-recheck-brief.md`, `vh215-codex-blind-table.md`, `vh215-codex-design.md`, `vh215-codex-design-recheck.md`, `vh215-codex-blind.md` and `vh215-codex-recheck.md`. Never read any folder under `/Users/joe/Library/Application Support/Claude/side-session-notes/`, and never read `/Users/joe/UoN-Video-Helper-side/vh227/`. Run nothing that writes: `git show`, `git diff`, `git log`, `grep`, `sed -n`, `cmp` and `shasum` are fine.

## The candidate

The complete close is the uncommitted working tree against `7750acb852a81979511ea481e6c2b18dcdda5ee4` (VH-212, HEAD), frozen in `vh215-frozen/`: `unstaged.patch` (`git diff --binary`, 20 modified files, sha1 `4212455c7189dc51f56775c600e2e6394857cf80`), `staged.patch` (empty), `status.txt` (38 lines), `untracked-sha1.txt` (103 untracked files, `sha1  path`) and `head-sha.txt`. The tree equals the freeze now. It holds:

- **The build** (ten tracked files under `src/`, plus the untracked `src/ui/clock-time.ts` and `test/helpers/picture-pcm-mp4.ts`) and **the walker's change** (`walker/fixtures.sh`, `walker/scenarios.mjs`, the untracked `walker/card-215.mjs`, under `reviews/2026-10-25/design-pass-3/evidence/measurements/`). This part of the diff is byte-equal to `vh215-wip-20/unstaged.patch` without `project/` and the report (sha1 `c5c3d0dbc873982b1616e12b97cd221b3f3c4d30`), unchanged since Claude's verdict, your blind check and your re-check read it.
- **The table** `vh215-card-length-2026-10-29.md` (sha1 `8473f38f7739ca2af207c0a81fbb441587ddc50f`, the repaired table your re-check read) and its 86 records in `vh215-records-2026-10-29/` (`sources.txt` gives each record's source), both in the measurements folder.
- **The ledger close** (eight tracked files: `project/backlog.md`, `project/decisions.md`, `project/decisions-2026-10.md`, `project/archive-index.md`, `project/items/VH-215.md`, `project/trajectory.md`, `project/wish-list.md`, and the report `reviews/2026-10-25/design-pass-3/design-pass-3-2026-10-27.md`). New since your re-check.
- **Thirteen files copied in** from the side folder, each sha1-equal to its source: nine as `vh215-…-2026-10-29.md` (the briefs, Claude's design reading and verdict, the two compares, and the blind table copy) and your four answers verbatim as `vh215-…-2026-10-29.md.txt`. The blind table copy goes too: it is what your blind check read and the committed blind brief names it. It differs from the table at line 147 (the design's history withheld to keep the check blind) and at the repair's lines 56 and 170. New since your re-check.

## The record, not reopened

- **The owner's scope,** 2026-10-27 14:51:20Z, typed by him in the "Backlog review" chat: "yes to the question mark, and A and B. ensure everything passes UX / design / Accessibility". Group A holds VH-139.5, which VH-211's plan (the PLAN-8 entry of 2026-10-27) made VH-215. No VH-215 answer of his was owed: the item's `Open question:` was "None." throughout.
- **The route** (`vh215-progress.md:29–81`). The sound's end comes from pre-flight's pass. The picture's end comes from the index (2 ms and one read on the 4.55 GB whole file) wherever the last declared packet arrived. Where it did not (a cut file), one sequential streamed read of the kept picture packets (1,440 ms on the 2.81 GB cut at low load). It branches on `lastPacketArrived` alone. The design's held point, the picture's read, was settled by your design re-check, "Verdict: accept".
- **Your blind answer**, "Verdict: Commit", "Musts: None", and its one should were adopted. The should said the guard's Node test is a predicate regression, not the worker's path. It became a two-line table repair and wish VH-215.3. Your re-check then said "Verdict: Commit". **Claude's verdict:** "Commit, after the close's own record".
- **The WebM finding.** Neither walk fixture shows the defect: a Matroska-family file reads to its last whole cluster. The correction's evidence is the Node tests and the Chrome browser proof on the cut MP4, base and candidate.

## What to check

1. **Your re-check's result** ("Remaining musts: None." "Verdict: Commit"): note only a regression.
2. **The ledger close.**
   - `project/decisions.md`: the new entry `## 2026-10-30 — VH-215 — Closes: …`, in the file's grammar (heading, Decision, Rationale, Supersedes, Deferred), each claim supported by the table, the records and the route's notes. Check that it quotes the owner's scope verbatim with its source.
   - `project/decisions-2026-10.md` and `project/archive-index.md`: `tools/archive.mjs`'s verbatim move of the oldest live entry (VH-179, 2026-10-23).
   - `project/backlog.md`: VH-215 struck. `project/trajectory.md`: the new line at the end of Phase 8.
   - `project/items/VH-215.md`: Now (`Updated: 2026-10-30`, Next step, `Open question: None.`) and the new Notes line.
   - The report's Disposition row "The owner's old issues (VH-211)", with VH-215's evidence link, and its "updated at" sentence.
   - `project/wish-list.md`: VH-215.1 (the guard's refusal words, for the owner), VH-215.2 (S-22 read as Student submission in VH-203's after-run) and VH-215.3 (a regression through the worker's refusal at `src/workers/job.worker.ts:278`).
3. **Rules 5 and 6.** Flag any deferral or follow-up named in the close without a line in `project/wish-list.md` or `project/backlog.md`: the decision, the item, the trajectory line, the table and the commit message. Flag any open line the work paid off and left open, VH-139.5 among them.
4. **The copies.** Check that each of the thirteen `$M` copies is sha1-equal to its side-folder source and reads as the evidence it claims to be. Check that the blind table copy's inclusion is explained where the record needs it.
5. **The gate** on exactly this tree, under the walk lock, started 03:50:26Z on AC, 80 %, power mode 2, load1 3.53 (3.53–4.25 across it), exit 0. It ran placeholders, `tsc --noEmit` and eslint (0 warnings). Vitest: 83 files, 1,623 passed, 1 skipped (EBU cases 7 and 8, an `it.skip` from before, VH-27). Then `check:build`, markdownlint (0 issues in 496 files), links (0 broken in 551 files) and check-memory (0 structural, the canon's 7 warnings). `node tools/check.mjs` gave 0 failures and 0 warnings. The gate runs again after your check, with this brief and your answer added as evidence, the one addition allowed.
6. **The commit message,** below, as drafted: check it is accurate to the diff and the evidence. Its `Verify:` line is the gate re-run; its `Checked:` line takes your verdict as given; the bracketed rebase sentence is filled in after the rebase.
7. **VH-227, beside your verdict.** origin/main is `267cb91d45e4d30831e54070947067849b6ff349` (VH-227; read it by `git show 267cb91`). It descends from the base, and VH-215's close rebases onto it. Judge whether VH-227 reaches any VH-215 evidence:
   - the Chinese name, 简体中文 at the base and 中文 at `267cb91`;
   - `src/config/languages.ts`, `src/i18n/sheet.ts` and `src/styles/tokens.brand.css`;
   - the zh-Hans cells of the before and after walks, and the browser proof.

   If it does, say which reading the renewal after the rebase must re-run (a walk group, a proof run, or a table or ledger line). Expect the rebase to conflict in the four ledger files VH-227 also edits (`project/decisions.md`, `project/decisions-2026-10.md`, `project/trajectory.md`, `project/archive-index.md`). Both closes' archive runs moved the same VH-179 entry. Say if anything there needs more than keeping both closes' lines once each.
8. **Anything else** in the diff that VH-215 doesn't explain, or any claim in the ledger that the evidence doesn't support.

## The commit message, as drafted

```text
VH-215: the submission card states the length the new video has, not the length its index declares; the index's one read where the last declared packet arrived, one streamed read of the kept picture where it did not (1,440 ms on a 2.81 GB cut), a release guard behind both; the cut MP4's card 0:21 where it said 0:30; no element, string or spec change; 96 cells before and after; VH-215 closes, VH-216 next in PLAN-8's order, waiting on the owner

The owner's scope: in the "Backlog review" chat, 2026-10-27 14:51:20Z, typed by him: "yes to the question mark, and A and B. ensure everything passes UX / design / Accessibility". Group A, as he was shown it, holds VH-139.5, which VH-211's plan made VH-215 with its criteria (the PLAN-8 entry of 2026-10-27); no VH-215 answer of his was owed (source: plan8-owner-words.md, its 2026-10-27 14:51:20Z entry).

The route, traced and timed first on the largest fixture: the sound's end from pre-flight's pass; the picture's from the index, which gave the decode's picture end on all five files probed, 2 ms and one read on the 4.55 GB whole file; where the index's last declared packet's bytes are missing (a cut file), one sequential streamed read of the kept picture packets, 1,440 ms on the 2.81 GB cut at low load. It branches on lastPacketArrived alone, never on the container. A streamed read on every file would read every kept picture byte, 2,880 ms on the largest, where spec §7.1 says the re-check's cost "grows with the kept audio"; Codex astra's re-check of that held point said "Verdict: accept".

The change: pictureMadeEndSeconds, madeSpanSeconds and cardTellsMade in src/media/ends-early.ts; pre-flight's summary carries madeSeconds, the length the job will make of the part kept, which Submission's card and the line under its fields print; the pipeline's result carries the encode's own madeSeconds; for Student submission the worker refuses a job whose length made cannot be known before the card is drawn, and after the encode a card that differs from its span (src/workers/job.worker.ts), nothing kept and the workspace disposed, in failure.unknown's existing words; the page's #submission-card-filled line gives the length made where known, its words unchanged; formatClockTime moved to src/ui/clock-time.ts; 16 Node tests, with the helper test/helpers/picture-pcm-mp4.ts (1,607 to 1,623 passed). The walker's four approved Student submission scenarios for S-23 and the cut WebM, a closing on and off (scenarios.mjs, fixtures.sh, card-215.mjs). No element, control, listener, CSS, string, config, dependency, docs or UI-STANDARDS change; S-22 untouched.

Built and measured by VH-215 #1 to #21: the design, with Codex astra's blind design check, compared; the walker's scenarios proved before the before walk (revision 17727d3522f7270d); the before, 96 cells on 7750acb, and the after, 96 cells (S-23's cut and the cut WebM as Student submission, a closing on and off, at 1280 and 320 px, in en-GB, zh-Hans and ms-MY, in four colour modes), on AC, power mode 2: the card and the page line 0:20 and 0:05 in every cell, before and after, since a Matroska-family file reads to its last whole cluster; the job's times beside the before's, the high-load ones re-run at low load. The correction shows where an index declares more than arrived, the cut MP4: 0:30 drawn on a 0:21 video at the base, 0:21 after (trimmed: 0:20 at the base, 0:16 after), both outputs, a closing on and off, proved by the Node tests and the Chrome browser proof, base and candidate. WCAG 1.3.1, 2.4.6, 3.1.5 and 4.1.3 re-checked. Claude's verdict, "Commit, after the close's own record", was saved before Codex astra's blind answer, "Verdict: Commit", was opened; its one should, that the guard's Node test is a predicate regression, not the worker's path, was adopted as a two-line table repair and wish VH-215.3, and the re-check said "Verdict: Commit". Evidence: reviews/2026-10-25/design-pass-3/evidence/measurements/vh215-card-length-2026-10-29.md and vh215-records-2026-10-29/, with the design, blind, re-check and close files beside them.

[After the rebase: rebased onto 267cb91 (VH-227, the one Chinese named 中文); what was renewed, if anything.]

New wish lines: VH-215.1, specific words for the release guard's refusals, for the owner; VH-215.2, S-22 read as Student submission in VH-203's after-run; VH-215.3, a regression through the worker's refusal at src/workers/job.worker.ts:278.

Digest rules applied (rule 8): house-conventions, "Fail loudly on data loss" and "Streaming everywhere"; nielsen 1, "status visible and announced".

Verify: <the gate re-run after this check, on this content plus this brief and your answer>
Checked: gpt-6-astra — <your verdict, as given> — VH-139.5

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

## Your answer

Markdown, under 450 words:
- a first line `Verdict: <Commit | Commit after the musts below | Revise>`;
- then numbered musts, each with file:line;
- then shoulds;
- then a line `VH-227: <reaches no VH-215 evidence | reaches: …>`, with the re-run it owes, if any;
- then notes.
