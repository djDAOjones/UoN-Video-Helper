# Doc-deltas

<!-- Capture-only ledger of pending protected-doc reconciliations. Append one
     line per delta; the edit detail is derived fresh at sync time. -->
<!-- Cold tier. Agents NEVER auto-read this file beyond the open-count line
     surfaced at session start. Read it in full only during a doc-sync pass
     (memory-maintenance.md → Doc-sync) or when the size check flags it.
     See AGENTS.md → "Before every task". -->
<!-- What belongs here: a protected doc (SPEC, ADR, or its kin — edit-on-request
     only) no longer describes current behaviour, and reconciling it needs
     explicit maintainer sign-off. This is sign-off DEBT, not work to pick —
     never mix it into backlog.md (the backlog/wish-list boundary precedent). -->
<!-- Capture, don't rewrite: append ONE line naming the doc and the delta; do
     NOT write edit instructions here. Inventories balloon when they hold the
     fix (the DOC-1 lesson) — the fix is regenerated from the source entry when
     the doc-sync pass runs. ADR status closures (Proposed → Accepted) are a
     first-class delta type. -->
<!-- Format: one checkbox line, oldest at the top. Tick (`[x]`) when the
     doc-sync pass applies the edit; delete ticked lines at the next prune.
     Example:
     - [ ] 2026-07-16 SPEC §6 — entity model is 11 not 9 (source: PERF-1e) -->
<!-- Threshold: WARN past ~10 open or oldest > 30 days → propose a doc-sync
     pass. See pm_skills/memory-policy.md. -->

## Open

- [x] 2026-08-25 SPEC §9.1 — workflow step 4 still offers "Toggle opening
      animation", which §4.1's closing-only v1 withdrew (source: copy-edit
      review of the 2026-08-25 doc-sync; pairs with VH-33)
- [x] 2026-08-25 SPEC §8.1/§8.3 — the subtitle timing problem is framed
      wholly on the opening animation, so the sidecar cue offset is always
      zero in a closing-only v1 (source: copy-edit review of the 2026-08-25
      doc-sync; UI-copy twin already on the wish-list)
- [x] 2026-08-25 SPEC §4.1 — "the user's choice of boundary mode" describes a
      control withdrawn by VH-45; the modes remain in the pipeline, not the UI
- [x] 2026-08-25 SPEC §6.1 — the "best quality" bitrate is a fixed
      ~0.12 bits/pixel/frame, which never looks at the source; VH-47 makes it
      a source-relative band (source: VH-41 review)
- [x] 2026-08-25 RATIONALE §4.3 — stream copy is rejected partly because VFR
      sources "are common here"; VH-24 measured the corpus as effectively CFR,
      so half the rejection no longer holds (source: VH-48)
- [x] 2026-08-25 DECISIONS D10 — still listed as deferred with an unmet
      revisit trigger; the trigger fired and it is now VH-48 (source: VH-48)
- [x] 2026-08-26 SPEC §6.2 — its prose presents consulting the source as the
      SMALLER preset's distinguishing property; since VH-47 both presets do,
      one capped at the source and one anchored to it (source: VH-47)
- [x] 2026-08-27 DECISIONS D4/D5/D6/D7/D12 — all five answered 2026-08-27 and
      still listed as open: D4 signed off, D5 is a UoN-hosted app, D6 is
      AA-floor/AAA-goal, D7 closed as a residual risk, D12 deferred to the
      handover (source: maintainer)
- [x] 2026-08-27 DECISIONS D10 — VH-48 was cut 2026-08-27; D10's icebox entry
      should record that the revisit happened and the answer was no
      (source: VH-48)
- [x] 2026-08-27 SPEC §10 — Firefox desktop 130+ is listed "Supported", and
      since VH-49 it is blocked for any source WITH audio; only silent sources
      run. D4's browser-support claim inherits the same correction
      (source: VH-49)
- [x] 2026-08-27 SPEC §5.2 step 6 — the limiter's ceiling is stated as
      −2.0 dBTP, which is now the ceiling of the FILE; the limiter itself
      targets 1.0 dB below it because AAC raises true peak after it
      (source: VH-50)
- [x] 2026-08-27 DECISIONS D1 — answered 2026-08-27: Nottingham Blue #10263B,
      verified against the shipped closing tail; the entry still reads as open
      with black as the interim (source: D1)
- [x] 2026-08-27 SPEC §5.2 step 3 — the freeze is listed once, and the
      implementation needs it twice: on the raw correction and on the
      finished envelope, because the smoothing window is centred
      (source: VH-61)
- [x] 2026-09-30 SPEC §6.1 — headed "Best quality — for EchoVideo or
      YouTube"; on screen it is "Larger / better", "For EchoVideo or YouTube
      etc.", under the question "File size / quality" (source: VH-85)
- [x] 2026-09-30 SPEC §6.2 — headed "Smaller file — for OneDrive, SharePoint
      or email"; on screen it is "Smaller / reduced", "For messaging or email
      etc." (source: VH-85)
- [x] 2026-09-30 SPEC §9.1 — step 6 reads 'Choose "Best quality" or "Smaller
      file"'; the choice is now named as above (source: VH-85)
- [x] 2026-09-30 SPEC §8.3 — step 2 (offset and embed a user-supplied `.vtt`)
      is withdrawn: no caption file is taken. The closing paragraph's
      "preservation therefore applies only to a sidecar the user supplies"
      goes with it; steps 1, 3 and 4 stand (source: VH-86)
- [x] 2026-09-30 SPEC §8.1 — the refined rule "always offset subtitle timing
      to match inserted branding" now has nothing to apply to; and the screen
      says "caption" throughout, where §8 says "subtitle" (source: VH-86)
- [x] 2026-09-30 SPEC §4.1, §4.3 — the boundary mode is described as the
      user's one choice among three; on screen it is three controls — animation
      type, onset, colour — that map onto the same three modes, plus "None"
      for no closing at all (source: VH-90)
- [x] 2026-09-30 SPEC §5.2 steps 5–6 — the single gain is solved to land the
      DELIVERED file on −16 LUFS, allowing for the AAC encode's measured
      loudness cost, not to land the encoder's input on it; and the limiter's
      working ceiling is at least 1.0 dB below −2.0 dBTP and lower when that
      job's encode is measured to overshoot by more (source: VH-83)
- [x] 2026-09-30 SPEC §10 — the table lists Chrome, Edge, Firefox and Safari
      26+ as supported; the page now tells users the app "is designed and
      built for Chrome, other browsers may not work" (maintainer's choice over
      certifying the others), and every browser block now names Chrome alone
      as the browser that will work (source: VH-98)
- [x] 2026-09-30 SPEC §12 — "Trimming, cutting, or any editing of picture
      content" is out of scope; the maintainer signed off trimming the two
      ends (a conveyor with one cut). Proposed: "Cutting from the middle,
      joining, reordering, or any other editing of picture content —
      trimming the start and end is in scope (VH-30)" (source: VH-30)
- [x] 2026-10-01 SPEC §9.1 — the workflow has an optional Trim step after
      the file is read: a preview with start and end handles, time fields and
      "Set start here" / "Set end here"; left alone it keeps the whole video
      (source: VH-96)
- [ ] 2026-10-01 DECISIONS D2 — reads as open, proposing a 5 s opening and a
      4 s closing; the delivered masters settled it (a 1.00 s onset, a 4.00 s
      tail) and v1 has no opening (source: doc-sync 2026-10-01; VH-12, VH-23)
- [ ] 2026-10-01 DECISIONS D3 — weighs a crossfade or ducking against a
      branding audio bed that spec §4.4 struck; the branding is silent and the
      100 ms fade is built (source: doc-sync 2026-10-01; `BOUNDARY_FADE_MS`)
- [ ] 2026-10-01 SPEC §4.4 — picture fades at the branding boundary are "not
      yet specified"; VH-25 cut them on 2026-08-27 (source: VH-25)
