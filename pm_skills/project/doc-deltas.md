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
      15-20 fps under load (source: VH-4)
- [ ] 2026-08-24 SPEC §8.3.3 — the sidecar `.vtt` fallback for non-preservable
      subtitle tracks is unachievable: Mediabunny cannot read subtitle tracks
      at all, so there is nothing to export (source: VH-4, Phase A verification)
- [ ] 2026-08-24 SPEC §8.3.2 — "where present and preservable, re-embed" has no
      reachable branch for embedded tracks for the same reason; preservation
      applies only to a user-supplied sidecar (source: Phase A verification)
