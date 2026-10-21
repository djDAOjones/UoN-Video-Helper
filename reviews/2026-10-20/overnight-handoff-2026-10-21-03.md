# Overnight run — hand-off note 03, 2026-10-21

The third session of the overnight run
(`reviews/2026-10-20/overnight-prompt-2026-10-21.md`) finished and closed
VH-143, the design pass. It passed the profile's 200k Session line while
it worked, so VH-143's close is its last.

The owner then said "resume", twice:

- in this session's chat, on switching it to Claude Opus 5.5 after the
  Fable usage limit;
- at 09:04 BST in their own session, which relayed it.

The run therefore goes on past the 07:00 line, and the next session
carries it. Nothing is half-written.

## Where the run is

- **Branch and worktree.** Branch `claude/overnight-design-and-phases`,
  worktree `.claude/worktrees/overnight`. Work only there.
- **VH-143 closed.** The close is `9cb11a8`. The follow-up carrying Codex
  astra's review, the `Checked:` line and this note is the commit after
  it. Both are pushed.
- **PLAN-4 recorded.** Phase 4 is VH-144, VH-145 and VH-146, each with a
  file, signed off gateless.
- **Phase 3 items amended.** VH-140, VH-141 and VH-142 each gained a
  dated note and a criterion line carrying the design findings on their
  lines: V-29, then V-21 and V-22, then V-27 and V-28.
- **The owner's words recorded.** Both are in `project/decisions.md`: 01:46
  BST ("resume! you have permission for everything …") and 09:04 BST
  ("resume", the run goes on past 07:00).
- **VH-139 not merged.** It closed in its own session on
  `claude/vh-139-ends-early-817f88` at `b3b7c2b`, pushed. Its backlog line
  here is still open (`[ ]`).
- **Nothing running.** Chrome on 9222 was stopped, and Vite on 5174 had
  already gone.

## What is next, in order

1. **Merge VH-139.** `git fetch`, then merge
   `origin/claude/vh-139-ends-early-817f88` into this branch.
   - Keep both sides' ledger lines (backlog, trajectory, decisions,
     archive).
   - VH-139's side strikes its own backlog line and adds its trajectory
     line and decisions.
   - Run `node tools/check.mjs` and `npm run check`. Above 45 live
     decisions, run `tools/archive.mjs` and fix its two whitespace slips
     (below).
2. **Phase 3.** VH-140, VH-141, VH-142, in order, by `verbs/plan.md` Step
   5 and `verbs/close.md`.
   - Each item's file now carries the design findings on its lines.
     Read the notes dated 2026-10-21.
   - Close each with `codex exec review --commit <sha> -m gpt-6-astra` and
     a `Checked:` line, and push after each close.
   - Close the phase as rule 11 says.
3. **Phase 4.** VH-144, VH-145, VH-146, the same way. VH-146 re-runs
   `spike-cards.html` through the walker's `cards` scenario.
4. **The morning report.** `reviews/2026-10-20/overnight-report-2026-10-21.md`,
   as the prompt's last section says.
   - This session's draft is in the shared folder:
     `overnight-report-draft-from-session-03.md`. Its design-pass table
     and VH-139's Chinese and Malay strings can be reused. Update the
     table for the critique: V-25 and V-30 narrowed, V-26 now the
     owner's. Rewrite the rest for what the run then did.

## Checking an item in Chrome

The walker is `reviews/2026-10-20/evidence/measurements/walker/`
(`walk.mjs`, `cdp.mjs`, `digest.mjs`, `fixtures.sh`, `tokens.mjs`,
`words.mjs`, `sidebyside.sh`). Run the browsers from your own Terminal
tab; the sandbox cannot start Chrome or bind a port.

1. **Fixtures.** The ffmpeg fixtures are built in the shared folder's
   `fixtures/`.
2. **Vite.** Run `npm run dev -- --port 5174 --strictPort`. Never use port
   5173, which is another checkout's.
3. **Chrome.** Start headless Chrome with `--remote-debugging-port=9222`
   and its profile in the shared folder's `chrome/`, as hand-off note 02
   says.
4. **The walk.** Run `APP_URL=http://localhost:5174/ node walk.mjs
   <scenario …>` from the walker's directory, writing into the shared
   folder's `out/`.
5. **Clean up.** Kill both by port before `npm run check`.

The shared folder:
`/Users/joe/Library/Application Support/Claude/side-session-notes/local_3331bb49-3560-45e7-ae16-85335657ed8e/`.

## What this session learned

- **The keep-awake hold.** The Mac's sleep, not an app quit, killed the
  Terminal tabs overnight. Ask for `request_keep_awake` until
  session_idle at the start of every session.
- **Model limits.** The Fable usage limit stopped five subagents at once,
  mid-task. Name a model on a subagent (`model: "opus"`) when the parent's
  is limited. Each subagent that read measurements or captures saved
  about 100k tokens of this session's context.
- **Timings.**
  - The full walk, all thirteen scenarios, takes about 13 minutes.
  - `npm run check` takes about 30 s on this Mac.
  - A Codex critique of a long draft takes 15–20 minutes.
- **Two archive slips.** `tools/archive.mjs` leaves a trailing blank line
  in `project/decisions.md` (MD012) and no blank line before the first
  appended entry in `project/archive/decisions-2026-10.md` (MD022). Fix
  both after it runs, then run `npm run docs:lint`.
- **Decisions budget.** The latest ten entries' heading, Decision and
  Deferred lines must stay under 1,000 words. Keep each Decision line to
  one sentence of what and why, and put the rest in the Rationale.
- **The token sweep.** It checks whether a value is on the scale, not
  where it came from. Trace each reported value to its rule by hand.
- **The digests' false alarms.** "Over the limit" on `p#status` and
  `p#source-status` is the spoken-only tail being measured. That is an
  artefact, not a finding.
