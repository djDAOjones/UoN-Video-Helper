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

- [ ] 2026-08-24 SPEC §6.3 — "nearest standard value (24/25/30/50/60)" snaps a
      15 fps source up to 24, adding 60% duplicate frames; Teams/Zoom drop to
      15-20 fps under load (source: VH-4). CONFIRMED 2026-08-25: the real Teams
      recording is 16.000 fps CFR and would snap to 24 (+50% duplicates)
- [ ] 2026-08-24 SPEC §8.3.3 — the sidecar `.vtt` fallback for non-preservable
      subtitle tracks is unachievable: Mediabunny cannot read subtitle tracks
      at all, so there is nothing to export (source: VH-4, Phase A verification)
- [ ] 2026-08-24 SPEC §8.3.2 — "where present and preservable, re-embed" has no
      reachable branch for embedded tracks for the same reason; preservation
      applies only to a user-supplied sidecar (source: Phase A verification)
- [ ] 2026-08-25 SPEC §4.1 — two independent branding toggles (opening and
      closing) assumes opening assets exist; there are none, and the maintainer
      scopes MVP as closing-only, opening as a later feature (source: VH-23)
- [ ] 2026-08-25 SPEC §4.4 — the branding audio bed does not exist and is not
      wanted: maintainer confirms silent graphics are "more native" (2026-08-25).
      Strike the bed and the −16 LUFS mastering rule that depends on it; this is
      a decision to record, not a gap to fill (source: VH-12)
- [ ] 2026-08-25 SPEC §4.2 — the four-variant master matrix (1080p/2160p ×
      25/30) does not exist; one 4K25 master is delivered, so branding must be
      scaled and frame-rate-converted per source (source: VH-12)
- [ ] 2026-08-25 SPEC §4 — no notion of a branding STYLE variant, but four are
      delivered (Fade/Slide × Blue/White); needs a default and an owner
      (source: VH-12)
- [ ] 2026-08-25 SPEC §4.3 — branding is specified as concatenated segments;
      the real assets open with a 1.00 s alpha ramp and are meant to be
      composited, which is a different operation (source: VH-22)
- [ ] 2026-08-25 SPEC §6.3 — the frame-rate rule reads the DECLARED rate;
      four corpus files declare a rate that disagrees with their actual one by
      ~1% (30/1 declared, 30.3028 actual) (source: VH-24)
- [ ] 2026-08-25 SPEC §4.3 — branding alpha is premultiplied (matted with
      black), so the composite is `brand + source×(1−a)`; the straight-alpha
      form the spec implies would double-darken the logo (source: VH-12)
- [ ] 2026-08-25 SPEC §6.2 — the "smaller file" bitrate targets (1.5/2.5 Mbps)
      exceed the Teams recording's own 1.0 Mbps, so the preset would inflate it;
      needs a never-exceed-source guard (source: VH-24)
- [ ] 2026-08-25 SPEC — no colour/HDR behaviour is specified anywhere, and
      phone sources are HDR 10-bit by default; the pipeline has no colour
      handling, so the result is whatever the browser's canvas does
      (source: VH-26)
