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

- Momentary and short-term curves are kept in full at 100 Hz — about 5.8 MB per
  hour of audio. Fine at v1 scope; worth revisiting if anyone points this at a
  multi-hour recording. (from: VH-3)
- EBU Tech 3341 cases 20-23 pass on my reading of "continuous in phase at both
  sides of the single period", which Table 1 does not define. Confirm against
  the EBU's own signal files if they are ever downloaded. (from: VH-3)
- Worker bundle is now 404 kB — demux, decode, encode and mux paths. Spec §11
  wants the app usable offline after first load, and first load is on a managed
  University network. Worth measuring gzipped and deciding whether it needs
  splitting before launch. (from: VH-6)
- The time estimate covers decode, encode and audio analysis. It does not yet
  include the audio chain (VH-7) or branding conform (VH-8), so it will
  under-report once those land. Revisit the extrapolation then. (from: VH-5)
- Mediabunny's `bestGuessFrameRate` read 32.25 fps on a fixture whose frames
  averaged 21.96 fps, and we round the conform target from that. Worth checking
  which of its frame-rate figures best matches real Teams and Zoom captures
  before D8 fixes the published limits. (from: VH-6)
- The macro-levelling envelope is indexed by frame count from the start of the
  audio, which assumes the track begins at t=0 and has no gaps. True for
  everything seen so far; would misalign on a source with a delayed or
  discontinuous audio track. (from: VH-7)
- The compressor detects RMS where the spec says only "attack 20 ms, release
  200 ms". That is a choice inside the spec rather than a departure from it,
  but it is a choice, and it belongs in the decision log at close. (from: VH-7)
- `npm run check` now takes ~27 s, up from ~2 s: the chain tests process
  minutes of synthesised audio each, and LRA needs 60 s of material to settle
  (Tech 3342). Still fine to run on every change, but worth watching — the gate
  earns its keep only if people actually run it. (from: VH-7)
- Progress is emitted every 30 frames, which is invisible on short jobs. Fine
  for an hour of video; revisit if the UI feels dead on short ones. (from: VH-6)
- TypeScript 7 is released but typescript-eslint caps at <6.1.0. Revisit the
  pin when the linter catches up. (from: VH-1)
