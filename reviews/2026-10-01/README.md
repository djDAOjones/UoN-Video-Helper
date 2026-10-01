# UX review bundle — 1 October 2026

Two reviews from the same day. VH-104: the whole page walked as a first-time
member of staff would, Choose to Save, in Chrome at desktop and phone width.
Then, the same afternoon, the specification itself read for the UX and
accessibility gaps Band 6 would otherwise leave, against every WCAG 2.2
criterion. Self-contained: no chat history, temporary file or download is
needed to read or act on it.

## Files

| File | Role |
| --- | --- |
| `uon-video-helper-ux-review-2026-10-01.md` | The review: 25 ranked findings (U-01 to U-25), each with what was seen, the standard, a direction and where it went; what held up; what was set aside and why; the evidence for VH-97; what only a person can judge. **Start here.** |
| `codex-astra-source-review-2026-10-01.md` | The source half, by Codex astra, kept as written: sixteen findings (F01 to F16), a copy audit and a view on VH-97. The review maps each to a U-number. |
| `spec-ux-accessibility-gaps-2026-10-01.md` | The spec review: 18 findings (A-01 to A-18), each a proposed spec correction, a Band 6 ticket clause, or both; the exceptions to record under §9.3; a disposition table. The spec is protected, so its corrections are doc-delta lines awaiting the maintainer's sign-off. |
| `codex-astra-spec-gap-review-2026-10-01.md` | The independent half of the spec review, by Codex astra, kept as written: thirteen findings, twelve ticket clauses, and a table of all 86 WCAG 2.2 criteria with a verdict each. |
| `codex-astra-critique-2026-10-01.md` | Codex astra's adversarial check of the merged spec review before commit: 35 corrections, all applied; kept as written. |
| `evidence/` | Screenshots the findings cite, named by finding (`u01-…`). Cropped so no frame of a real recording and no real file name appears. |
| `vh-124-prework/` | Read-only groundwork for VH-124 and VH-105 from the same evening: two Codex astra passes, measurements of the live page, defects confirmed in source, and the prompt that handed the work to a fresh session. Start at its README. |

## Baseline

Commit `46f5b42` on `codex/repository-review-remediation` for the UX review;
`1b2fb92` on the same branch for the spec review. Verify the branch, commit and
worktree before applying a finding to newer code — the backlog items VH-106 to
VH-114 are where each one is acted on, and `pm_skills/project/doc-deltas.md`
holds the spec corrections until they are signed.

## Provenance

The walkthrough drove Chrome 154 headlessly over the DevTools protocol, with
real file-input, drag and key events; only the system save dialog was stubbed.
The material was the maintainer's `samples/` (never committed) and fixtures
made with ffmpeg in a scratch directory. The two Teams-recording measurements
in U-01 come from the app itself and from `/spike-real.html`.
