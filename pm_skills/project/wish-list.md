# Wish-list

<!-- Capture inbox for unscoped ideas. Append one line; no structure required. -->
<!-- Cold tier. Agents NEVER auto-read this file. Read it only during an
     explicit triage pass — the next-batch pick (session-start.md Start B),
     or end-of-task.md / memory-maintenance.md when the size check flags
     it. See AGENTS.md → "Before every task". -->
<!-- Boundary: this is PRE-triage — raw, unjudged ideas. The backlog Icebox
     is POST-triage — ideas already judged worth keeping. Promote items INTO
     backlog.md (Current, Next, or Icebox); never treat this as a second backlog. -->
<!-- Triage = promote or cut. Promoting MOVES the item into backlog.md. Cutting
     DELETES the line. No history is kept here — survivors live in the backlog. -->
<!-- Format: one plain bullet per idea, optionally a source. Append at the
     bottom; triage from the top. Example:
     - Idea in one line — (from: 2026-05-30 task) -->
<!-- Soft cap ~25 open items. Over budget → end-of-task flags it and
     memory-maintenance.md (Prune) runs a forced triage pass (not an
     archive). See pm_skills/memory-policy.md. -->

## Open

- The short-term curve is still kept in full at 100 Hz — LRA needs the whole
  distribution, so it cannot simply be dropped. Worth revisiting only for a
  multi-hour recording. (from: VH-3, revised 2026-08-27 by VH-67)
- EBU Tech 3341 cases 20-23 pass on my reading of "continuous in phase at both
  sides of the single period", which Table 1 does not define. Confirm against
  the EBU's own signal files if they are ever downloaded. (from: VH-3)
- Worker bundle is now 404 kB. Spec §11 wants the app usable offline after
  first load, and first load is on a managed University network. Worth
  measuring gzipped and deciding whether it needs splitting before launch.
  (from: VH-6)
- Branding assets are fetched at runtime with no caching. Spec §11 wants them
  cached for offline-after-first-load. Belongs with the deploy decision (D5)
  but the caching itself is app-level. (from: VH-8)
- Every branding frame is redrawn through a canvas to get brand-colour padding.
  Fine at 1080p; at 4K that is 150 canvas compositions per sequence. Worth
  measuring before the real 4K masters land. (from: VH-8)
- Progress is emitted every 30 frames, which is invisible on short jobs.
  Revisit if the UI feels dead on short ones. (from: VH-6)
- Spec §6.3 and §6.5 carry corpus evidence inline, though the spec's header
  points at `02-technical-rationale.md` as where evidence lives. Moving it
  would clear the reference guideline without losing a sentence. Needs a
  doc-delta. (from: 2026-08-25 spec copy-edit)
- `BEST_SOURCE_BLEND` (0.5) is the one number in VH-47's bitrate rule with no
  measurement behind it. Settling it is a VIDEO experiment — encode the probe
  sample at a spread of multiples and score each — and was parked on VH-83 by
  mistake. (from: VH-83)
- Skip true peak in the B and B′ planning passes: they read only integrated
  loudness, and the detector there is 9% of planning (measured 2026-10-01).
  Means reshaping `traverse` in `audio-plan.ts`. (from: VH-99)
- A better gain-solve step: five of six real recordings pay all three
  refinement passes, at 17–21 s an hour each. A step that anticipates the
  limiter's take-back could save one; it moves the solver's convergence, so
  it is a design item. (from: VH-99)
- `samples/CULT2011.mp4` decodes a +57 dBFS burst at 82.4 s, in Chrome and
  ffmpeg alike (a corrupt AAC frame), measuring +28 LUFS. The solver still
  lands it at -16.02; check what the warnings say and what the output sounds
  like there. (from: VH-99)
- The 3 s video probe is now the time estimate's main error: PHIL read 104 fps
  on one run and 187 on another, and real encodes ran at 0.5–1.8× the probe's
  figure (VH-100's table). VH-31 refused a longer probe; a warm-up before
  timing, or a correction from the job's own early frames, are untried.
  (from: VH-100)
