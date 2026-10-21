# Overnight run — hand-off note 01, 2026-10-21 01:20 BST

The first session of the overnight run (`reviews/2026-10-20/overnight-prompt-2026-10-21.md`) ended at its first commit: the session sensor reported its context past the profile's 200k Session line while it was still reading the record and the bundle, before any product change. Nothing is in flight.

## Where the run is

- Branch `claude/overnight-design-and-phases`, worktree `.claude/worktrees/overnight` under the OneDrive checkout, from `5f23af6` (VH-138's close, PLAN-3 recorded). Work only there.
- Done in this session: the overnight prompt committed verbatim; the owner's instruction recorded in `project/decisions.md` (2026-10-21 — VH-143); VH-143 opened under `### Design pass` in the backlog with `project/items/VH-143.md`; the Mac asked to stay awake; `npm ci` run in the worktree.
- VH-139's branch, `claude/vh-139-ends-early-817f88`, is local only (another session's worktree) and still at `5f23af6`: no `VH-139:` commit yet, and it is not on origin. `git fetch` before each item, as the prompt says.
- VH-143 and PLAN-4 were free on every branch; use them.

## What is next

1. VH-143, the design pass, exactly as the prompt's section 1 says: rebuild the walker, walk, sweep tokens and strings, Codex astra blind then critiquing, write `design-pass-2026-10-21.md`, extend the Disposition table and README, plan Phase 4 as PLAN-4, close VH-143.
2. Then Phase 3 (VH-140, VH-141, VH-142; VH-139 merged when its branch carries its close), then Phase 4, then the morning report.

## What this session learned about the tools

- The sandbox cannot bind a port (`EPERM` on `listen`) and does not have `codex` on its PATH. `codex` is at `~/.local/bin/codex`, and the project's settings exclude `codex *` from the sandbox, so run it as a plain `codex exec …` command with the brief inline, as the 20 October audit did. `gh *` is excluded the same way.
- Chrome is at `/Applications/Google Chrome.app`; `ffmpeg` and `ffprobe` at `/opt/homebrew/bin`. The 20 October audit ran Chrome (`--headless --remote-debugging-port=9222`), the Vite dev server and the walker in the owner's Terminal panel, outside the sandbox; the Terminal tools (`run_in_terminal`, `read_terminal`) are the way to do that again. Serve this worktree, not the OneDrive checkout, and read the port Vite prints (`APP_URL` for the walker). Never time anything in the built-in browser pane.
- The walker is `reviews/2026-10-20/evidence/measurements/walker/` (`walk.mjs`, `cdp.mjs`, `digest.mjs`, `fixtures.sh`). It expects `fixtures/` and `out/` beside its own directory's parent (`SCRATCH = dirname(HERE)`), so copy the four files into `<scratch>/walker/` and run `fixtures.sh <scratch>/fixtures`. `fixtures.sh` does not make `lecture-360s.mp4`, which the `desktop-en-staff` scenario uses; add a 360 s, 1920 × 1080 line on the pattern of the 130 s one.
- Rule 1's set, UI-STANDARDS.md, the three digests, the architecture, the house conventions, spec §9 and §13, the audit, the states table and the walker have all been read once; the next session reads them again (rule 1) — that reading is what cost this session its context, so read the long files in parts and the tables through scripts where a sweep will do.
- Time at this note: 01:20 BST. No new item starts after 07:00 UK time.
