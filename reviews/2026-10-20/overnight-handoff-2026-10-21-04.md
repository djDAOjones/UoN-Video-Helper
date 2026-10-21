# Overnight run — hand-off note 04, 2026-10-21

The fourth session of the overnight run, on Claude Opus 5.5, merged
VH-139 and built and closed VH-140. It reached the profile's 200k Session
line at VH-140's close, so that close is its last. The run goes on, on
the owner's 09:04 BST word ("resume"), recorded in `project/decisions.md`.

## Where the run is

- **Branch and worktree.** Branch `claude/overnight-design-and-phases`,
  worktree `.claude/worktrees/overnight`. Work only there.
- **VH-139 merged.** `0912544` merged `origin/claude/vh-139-ends-early-817f88`
  (`b3b7c2b`). The ledger kept both sides, and the gate was green.
- **VH-140 closed.** The close is `b05121a`. The commit after it carries
  Codex astra's review, the `Checked:` line and this note. All are pushed.
- **Next: VH-141**, then VH-142, then Phase 3's close (rule 11, with
  `verbs/recall.md`), then Phase 4 (VH-144, VH-145, VH-146), then the
  morning report.
- **Nothing running.** Vite on 5174 and Chrome on 9222 were stopped.

## How this session worked, and what to keep

- **A subagent per build.** An Opus subagent (`model: "opus"`) built
  VH-140 from a brief:
  - the rule-1 set and the routed UI documents;
  - the item file and its sources;
  - VH-139's commit as the pattern for strings, the sheet and the CSV;
  - no commit, no ledger and no browser;
  - the gate run, and a report under 400 words with the strings table.

  It used about 335k tokens of its own and about 10k of the session's.
  The session then:
  - reviewed the diff;
  - ran the Chrome check;
  - wrote the decision, the trajectory line, the backlog strike and the
    wish line;
  - committed and ran Codex.

  The same shape should fit VH-141 to VH-146.
- **The walker's item scenarios.** These are in the shared folder's
  `walker/walk.mjs`, a copy, not the repo's evidence copy.
  - `vh140-desktop-<tag>` and `phone-vh140-<tag>` were added above
    `main()`.
  - A standing result guards the page with a leave-site question, so
    the scenario accepts `Page.javascriptDialogOpening` before each
    `goto`.
  - The phone path needs the acknowledgement button clicked before
    Create.
  - The 30 s fixture encodes in about 3 s in headless Chrome, so a run
    to the result is quick.
- **Vite's tab can close by itself.** The 5174 tab vanished once
  mid-walk. Restart it and re-run what failed with
  `ERR_CONNECTION_REFUSED`.
- **The trajectory budget is tight.** The last four item lines must stay
  within 300 words; the four now total 299. Keep each new line under
  about 55 words. A line of 70 words fails the close.
- **The archive's two slips** recur on every run of `tools/archive.mjs`
  (no blank line before an appended entry; a trailing blank line in the
  decisions file). The fix is in the commit `0912544`'s method: strip the
  decisions file's trailing newlines and add a blank line before each
  `## ` that follows a `**Deferred:**` line in the archive, then run
  `npm run docs:lint`.

## For the morning report

- **VH-140's Chinese and Malay drafts.** Nine strings, in the decision
  of 2026-10-21 and the sheet: `videoLanguage.nextVideo`,
  `titleCard.fieldsRule`, `titleCard.submission.fieldsRule`,
  `titleCard.submission.idsHelper`, `titleCard.submission.idNotAnId`,
  `result.summaryWithCard.staff`, `result.summaryWithCard.submission`,
  `result.videoLanguage` and `progress.job`.
- **VH-140's gateless calls.** They are in the decision's Rationale.
- **VH-140's spec wish line.** One line for §9.1 and §9.2.
- **The draft report.** `overnight-report-draft-from-session-03.md` in
  the shared folder still holds the design-pass table.
