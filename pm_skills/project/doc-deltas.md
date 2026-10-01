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

- [ ] 2026-10-01 SPEC §6.5 — calls colour handling untested and phone HDR
      unsafe; VH-26 (2026-08-27) measured Chrome tone-mapping the HLG and
      Dolby Vision samples to SDR within two levels (source: VH-104, which set
      the HDR clip's "Ready to go" aside on that evidence)
- [ ] 2026-10-01 SPEC §6.3/§6.5 — carry corpus evidence inline, though the
      spec's header puts evidence in `02-technical-rationale.md`; moving it
      would lose no sentence (source: wish-list triage 2026-10-01)
- [ ] 2026-10-01 SPEC §9.3 — says "AA minimum, AAA where achievable" and
      names four A/AA checks; the rulebook and D6 say AAA by default with each
      exception recorded (criterion, reason, impact, mitigation, decision);
      the AAA criteria that decide the page, 1.4.8's measures and what a live
      region may announce go unnamed; the exception list (preview as third-
      party content, unexpanded format names, the 2.2.4 reading) has no home
      (source: spec gap review A-01, A-06, A-08, A-10, A-15)
- [ ] 2026-10-01 SPEC §13 — no acceptance criterion makes a keyboard-
      only, screen-reader, contrast-theme, 200% and 320 px walk across every
      state and language a condition of done; the corpus paragraph names no
      assistive-technology gap (source: A-02)
- [ ] 2026-10-01 SPEC §7.3, §7.5 — the keep-this-tab-open notice is tied
      to the Warn band and says "open" where the wake lock needs "visible";
      nothing says closing the tab ends the job (source: A-03)
- [ ] 2026-10-01 SPEC §9.1 step 5 — silent on a finished video's
      lifetime (not kept past the tab, today, and said nowhere), on what
      follows Save on each route (the destination actually known, a write
      distinguished from a download hand-off, what next), and on a kept result
      carrying its own job summary (source: A-03, A-04, A-05)
- [ ] 2026-10-01 SPEC §9.1 step 2 — the preview plays the original,
      unlevelled and without the closing, and nothing says so (source: A-19)
- [ ] 2026-10-01 SPEC §9.2 — "plain language" has no reading-level
      measure or check in the gate, and the terms and abbreviations the page
      keeps have no definition or expansion rule (source: A-10)
- [ ] 2026-10-01 SPEC §9.2 — says what an error says and not where: an
      input error beside its control, a job or device failure in the step it
      affects (source: A-16)
- [ ] 2026-10-01 SPEC §9.2, §11 — the feedback route (VH-93) is absent:
      help on every state, leaving by the user's email app with named facts
      and never media; the dialog promises a reply nobody has committed to
      (source: A-13)
- [ ] 2026-10-01 SPEC §7.1 — the timed audio pass re-runs on every trim
      change with no progress, no cancel and no bound (source: A-11; time it
      on the Teams recording first)
- [ ] 2026-10-01 SPEC §7.3, §10 — "name Chrome as the one that will
      work" is a promise the per-configuration check cannot make, said to
      users already in Chrome; each block needs the recovery that fits its
      cause — revises VH-98's wording, not its Chrome recommendation. And
      §10's one fixed sentence is now three: the load-time check tests H.264
      and AAC encoding as §7.2 and §10 already describe, and the sentence
      reports what it found — "other browsers may not work" only until the
      checks land, "has passed the checks for it" after, "has not passed all
      of its checks" with a pointer to the System check otherwise (maintainer
      2026-10-01: do not turn people away unnecessarily; source: A-12, VH-121)
- [ ] 2026-10-01 SPEC §8.1, §8.3 — the caption warning stops at the
      loss: the new file carries no separate caption track and the destination
      must supply captions (EchoVideo after upload, checked; a file sent
      directly, by the user); other dropped tracks may hold alternatives;
      captions drawn into the picture remain, trimmed and overlaid (source:
      A-14)
