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

- [ ] 2026-08-25 SPEC §9.1 — workflow step 4 still offers "Toggle opening
      animation", which §4.1's closing-only v1 withdrew (source: copy-edit
      review of the 2026-08-25 doc-sync; pairs with VH-33)
- [ ] 2026-08-25 SPEC §8.1/§8.3 — the subtitle timing problem is framed
      wholly on the opening animation, so the sidecar cue offset is always
      zero in a closing-only v1 (source: copy-edit review of the 2026-08-25
      doc-sync; UI-copy twin already on the wish-list)
- [ ] 2026-08-25 SPEC §4.1 — "the user's choice of boundary mode" describes a
      control withdrawn by VH-45; the modes remain in the pipeline, not the UI
- [ ] 2026-08-25 SPEC §6.1 — the "best quality" bitrate is a fixed
      ~0.12 bits/pixel/frame, which never looks at the source; VH-47 makes it
      a source-relative band (source: VH-41 review)
- [ ] 2026-08-25 RATIONALE §4.3 — stream copy is rejected partly because VFR
      sources "are common here"; VH-24 measured the corpus as effectively CFR,
      so half the rejection no longer holds (source: VH-48)
- [ ] 2026-08-25 DECISIONS D10 — still listed as deferred with an unmet
      revisit trigger; the trigger fired and it is now VH-48 (source: VH-48)
- [ ] 2026-08-26 SPEC §6.2 — its prose presents consulting the source as the
      SMALLER preset's distinguishing property; since VH-47 both presets do,
      one capped at the source and one anchored to it (source: VH-47)
- [ ] 2026-08-27 SPEC §10 — Firefox desktop 130+ is listed "Supported", and
      since VH-49 it is blocked for any source WITH audio; only silent sources
      run. D4's browser-support claim inherits the same correction
      (source: VH-49)
- [ ] 2026-08-27 SPEC §5.2 step 6 — the limiter's ceiling is stated as
      −2.0 dBTP, which is now the ceiling of the FILE; the limiter itself
      targets 1.0 dB below it because AAC raises true peak after it
      (source: VH-50)
- [ ] 2026-08-27 DECISIONS D1 — answered 2026-08-27: Nottingham Blue #10263B,
      verified against the shipped closing tail; the entry still reads as open
      with black as the interim (source: D1)
- [ ] 2026-08-27 SPEC §5.2 step 3 — the freeze is listed once, and the
      implementation needs it twice: on the raw correction and on the
      finished envelope, because the smoothing window is centred
      (source: VH-61)
