# Audit bundle — 20 October 2026

The three audits of 1 October 2026 run again on the live page, now that it
has translations, the Staff video / Student submission switch, Video
language, the title cards, the Internal use only closing, the decode-damage
warning, the accessibility statement, a save line of its own and a time
left. Backlog item VH-138. Self-contained: no chat history, temporary file
or download is needed to read or act on it.

## Files

| File | Role |
| --- | --- |
| `uon-video-helper-audit-2026-10-20.md` | The audit: the verdict, how it was done, 16 ranked findings (V-01 to V-16) each with what was seen, the standard, a direction and its evidence; what held up; what was set aside and why; what only a person can judge; the disposition into Phase 3. **Start here.** |
| `regression-2026-10-20.md` | Every 1 October finding (U-01 to U-25, A-01 to A-20) and every VH-124 state (01 to 29) marked holds, regressed, partly or superseded, with the evidence. |
| `states-2026-10-20.md` | The page state by state, VH-124's five columns, 56 states: the 29 of 1 October and the new surfaces. |
| `wcag-2026-10-20.md` | All 86 WCAG 2.2 criteria judged against the live page; what spec §9.3 should record; the accessibility statement's claims checked. |
| `codex-astra-audit-2026-10-20.md` | The source half, by Codex astra, blind from the same brief and kept as written: eight findings (C-01 to C-08), its own regression and state tables, its 86-criteria table and statement check. The audit maps each to a V-number. |
| `codex-astra-critique-2026-10-20.md` | Codex astra's adversarial check of this bundle before commit, kept as written; what was applied is in the decision. |
| `evidence/` | Screenshots named by finding (`v01-…`) and, for what held up, by state (`held-…`). Every frame is an ffmpeg fixture; no real recording's frame or name appears. |

## Baseline

Commit `d38ee79` on `origin/main`, 2026-10-20 (VH-136, Phase 2 closed). The
owner's OneDrive checkout was level with it and no item was in flight, so
the time estimate is as shipped. Verify the commit before applying a finding
to newer code — the Phase 3 items VH-139 to VH-142 are where each is acted
on.

## Provenance

Headless Chrome 155 driven over the DevTools protocol by a walker rebuilt
for this audit (the 1 October tooling was not kept), against this worktree's
Vite dev server, with the dev-only buttons hidden as production hides them.
Files were chosen through the real file input and dropped as a real drag;
keys and touches were real events; the system's save dialog was stood in
for by a `showSaveFilePicker` stub writing into OPFS, and removed for the
phone so the download route ran. Views: 1280 × 900; 390 × 844 with a mobile
user agent, touch and a coarse pointer; 320 px; 640 px at a device scale of
2 for 200% zoom; WCAG 1.4.12 text spacing injected; light, dark and emulated
forced colours. Walked in English, Simplified Chinese and Bahasa Malaysia,
on both sides of the switch, with a title card off and on, with every
closing to a finished file. The session's sandbox could neither start Chrome
nor bind a port, so Chrome, the walker and Codex ran in the owner's Terminal
panel; nothing else left the sandbox.

The saved file behind V-01, probed with ffprobe after the walk: video
34.000 s, 850 frames at 25 fps; audio 20.928 s. The fixture it was made
from declares 30.000 s for both and decodes 523 video frames and 20.84 s of
audio.

Codex astra ran as `codex exec -m gpt-6-astra -s read-only` from this
worktree, blind, with the brief the audit's "How it was done" describes;
then again on the finished bundle, briefed to argue with every finding, rank
and table against the standard.
