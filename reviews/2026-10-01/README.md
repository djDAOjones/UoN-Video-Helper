# UX review bundle — 1 October 2026

VH-104: the whole page walked as a first-time member of staff would, Choose to
Save, in Chrome at desktop and phone width. Self-contained: no chat history,
temporary file or download is needed to read or act on it.

## Files

| File | Role |
| --- | --- |
| `uon-video-helper-ux-review-2026-10-01.md` | The review: 25 ranked findings (U-01 to U-25), each with what was seen, the standard, a direction and where it went; what held up; what was set aside and why; the evidence for VH-97; what only a person can judge. **Start here.** |
| `codex-astra-source-review-2026-10-01.md` | The source half, by Codex astra, kept as written: sixteen findings (F01 to F16), a copy audit and a view on VH-97. The review maps each to a U-number. |
| `evidence/` | Screenshots the findings cite, named by finding (`u01-…`). Cropped so no frame of a real recording and no real file name appears. |

## Baseline

Commit `46f5b42` on `codex/repository-review-remediation`. Verify the branch,
commit and worktree before applying a finding to newer code — the backlog items
VH-106 to VH-114 are where each one is acted on.

## Provenance

The walkthrough drove Chrome 154 headlessly over the DevTools protocol, with
real file-input, drag and key events; only the system save dialog was stubbed.
The material was the maintainer's `samples/` (never committed) and fixtures
made with ffmpeg in a scratch directory. The two Teams-recording measurements
in U-01 come from the app itself and from `/spike-real.html`.
