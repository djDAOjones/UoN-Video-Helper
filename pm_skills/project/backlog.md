# Backlog

<!-- OPEN WORK ONLY. Status: [ ] todo  [~] in progress  [-] cut. -->
<!-- Shipped work does NOT stay here. On ship: add one line to
     trajectory.md (the outcome) + an entry to decision-log.md (the why),
     then remove the item from this file. There is no Completed section. -->
<!-- Hot sectional. Agents read the Active section only by default. -->

## Active

<!-- BANDS. Band 0 (VH-1..VH-11, VH-18, VH-12, VH-22, VH-M1) shipped
     2026-08-25 and the app went live as an unadvertised pilot. Bands are
     ordered; within a band, order is dependency-driven, not by ID, and each
     item says what it waits on. Maintainer work is never band-gated — see
     Standing. Why these bands: decision-log 2026-08-25 "Band 1".
     Two provenance groups, and they cite different sources.
     VH-54..VH-68 came from an external repository review (2026-08-26) and its
     two critiques, all three in `reviews/2026-08-26/` — cite the R-number
     rather than restating the evidence here.
     VH-71..VH-78 came from the 2026-08-27 cross-check of the archived
     implementation branch; `tickets/VH-71.md` is their detail source and
     VH-71 is their umbrella — cite the work package.
     Both sets were re-verified against source before banding, and where a
     review's own remedy was shown unsafe the item says so. -->

### Band 2 — The edges hold

<!-- Not committed, and all of it is agent work. Ordered by dependency rather
     than by ID. VH-76 shipped first, 2026-08-27, so everything below it is
     now judged by a gate that does not rewrite `dist/`, and VH-72 and VH-73
     shipped with it, and VH-75 after them. VH-75 groups four verified holes of
     one shape. VH-62 is LAST because its
     remaining half is harness work whose value depends on what Band 1a does
     to the pipeline — and Band 1a is about to move it, so VH-62 earns
     promotion the moment VH-55/VH-74 turn out large. -->

- [ ] **VH-71 Reconcile the archived implementation branch** [detail](tickets/VH-71.md) (2026-08-27)
      Intent: umbrella and detail source for the 2026-08-27 feature-by-feature
      cross-check of tag `archive/repository-review-implementation` against
      HEAD. Children: VH-74 (Band 1a, with VH-55), VH-72, VH-73, VH-75,
      VH-76, VH-77 below, VH-78 (Icebox), VH-19's adoption note, and the
      VH-62/VH-70 amendments. The ticket holds per-package detail, execution
      order, and the decided-not-to-reconcile list.
      Done when: every child is shipped or explicitly cut; then delete the
      ticket.

- [ ] **VH-81 The ISOBMFF tail fallback never finds a trailing moov** (2026-08-28)
      Intent: `file.slice(tailStart)` starts at an arbitrary offset, so
      `readBoxes` from position 0 parses mid-`mdat`. It fails safe — reports
      "not ISOBMFF", so track counts go unreported rather than wrong — but it
      does not do its job, and a `fastStart: false` source is exactly the shape
      it exists for.
      Done when: a file whose `moov` is at the end has its subtitle and chapter
      tracks counted, proved by a fixture built that way.

- [ ] **VH-82 `inspectFile` runs three times per job** (2026-08-28)
      Intent: inspect, preflight and process each re-probe frame-rate metrics
      and re-run `scanTrackHandlers`, which slices up to 64 MB — 128 MB when the
      head misses and the tail fallback fires. The external review's most real
      efficiency finding.
      Done when: a job inspects once and the later stages are handed the report,
      with the worker protocol carrying it rather than re-deriving it.

- [ ] **VH-83 Measure the codec's cost instead of carrying corpus constants** (2026-08-28)
      Intent: three constants stand in for a measurement the calibration probe
      could take on the user's own file — `BEST_SOURCE_BLEND` (0.5, the only
      value in VH-47's rule with no number behind it),
      `ENCODE_TRUE_PEAK_HEADROOM_DB` (1.0 dB from four lectures ranging
      0.02-0.44), and the integrated-loudness AAC costs that nothing models
      (0.02-0.41 LU on the same four, worst on the most limited material — up to
      80% of the ±0.5 budget spent on the codec).
      Done when: each is either derived per job from a probe round trip or
      confirmed adequate as a constant with the measurement recorded.
      Scope: one probe round trip serves all three; do not add a second pass.

- [ ] **VH-84 Criterion 9's passive timeline is not a census** (2026-08-28)
      Intent: resource-timing entries are added when a request COMPLETES, so
      `EgressWatch.stop()` can miss one still in flight — a HEAD to a branding
      asset did not appear during a direct test. The body-wrapping instrument is
      unaffected, so the no-egress claim stands; the request COUNT does not.
      Done when: the check says which half of it is a census and which is a
      sample, or the timeline is drained before it is read.

### Band 3 — Blocked on the maintainer

<!-- Agent work that cannot start until something arrives from outside the
     repository: a corpus, a test result, a sign-off. Listed apart from Band 2
     so nothing here reads as available to pick up, and apart from Standing
     because the WORK is mine — only the unblocking is not. This band replaces
     the old Band 1b, which existed for maintainer DECISIONS and emptied on
     2026-08-27 when VH-49, VH-46b, VH-31, VH-25 and VH-32 all closed. -->

- [ ] **VH-19 Content-adaptive bitrate for the smaller preset**
      Intent: spec §6.2 sets ~1.5 Mbps for slides and ~2.5 Mbps for camera.
      `ContentClass` exists and `outputShapeFor` already takes it; nothing sets
      it, so every job uses the higher figure.
      Was blocked 2026-08-27 by a measurement; unblocked the same day by the
      recovered implementation (note below). The evidence stands: mean absolute
      inter-frame difference on a 64x36 luma, four points through five real
      lectures:

      | File | 0% | 25% | 50% | 75% |
      | --- | ---: | ---: | ---: | ---: |
      | AMCS3059 | 0.00 | 0.25 | 0.00 | 0.00 |
      | CULT1027 | 0.00 | 1.86 | 1.35 | 1.58 |
      | MLAC 3139 | 0.00 | 0.01 | 0.02 | 0.32 |
      | AMCS2007 | 0.00 | 0.00 | 0.00 | 0.68 |
      | Engineering Placements | 0.01 | 0.09 | 0.30 | 0.00 |

      Camera content separates cleanly from slides — 1.35–1.86 against
      ≤0.68 — but **every file reads 0.00 at the start**, because a lecture
      opens on a title card. The calibration probe samples exactly there, so
      classifying from its existing window would call every source "screen",
      including the one that is plainly camera. That is the 40% bitrate cut
      applied to the content that most needs the bits, decided silently.
      Done when: the class comes from a sample that is representative — several
      points through the file, in a pass separate from the timed probe so it
      cannot re-calibrate `videoFramesPerSecond` — the threshold is set from
      more than five files, and the chosen class is stated in plain language.
      Note: mis-classifying camera as screen costs picture quality; the reverse
      costs only file size. The threshold must be biased accordingly.
      Recovered 2026-08-27: the archived implementation branch built exactly
      this — five spread windows in a separate pass, asymmetric thresholds
      with a density guard, plain-language result (tag
      `archive/repository-review-implementation`, evidence: 23 recordings).
      Adopt via [VH-71 WP5](tickets/VH-71.md) and re-verify the thresholds on
      our own corpus rather than redesign.

- [ ] **VH-17 Evaluate `fastStart: 'reserve'` for the smaller preset**
      Intent: the "smaller file" preset goes to OneDrive and SharePoint, where
      students may stream it. `fastStart: false` puts the moov box at the end,
      which can force a full download before playback starts.
      Done when: `'reserve'` is adopted with a packet count derived from the
      CFR grid plus a margin and verified on a real SharePoint upload, or the
      current behaviour is confirmed adequate and the reason recorded.
      Scope: `'in-memory'` is not an option — it reinstates the memory ceiling.
      Maintainer 2026-08-27: **EchoVideo (Engage) is the key platform**, and it
      re-encodes on ingest — so the moov position cannot reach a viewer there
      at all, on either preset. That removes the stakes from the path most
      videos take and leaves this a secondary-path question about OneDrive and
      SharePoint only. Still worth the upload test he can run within the week;
      no longer worth designing around before it.
      Note: it also means most jobs should be taking "Best quality", which is
      already the default and already what §6.1 names for EchoVideo.

- [ ] **VH-26 Mobile phone sources** [detail](tickets/VH-26.md) (2026-08-25)
      Intent: staff may upload phone footage and none was in the corpus.
      Rotation was traced end to end and is correct.
      Material acquired 2026-08-27 — five samples in `samples/phone/`, covering
      HLG 1080p, Dolby Vision 4K60, 8-bit 4K30 and a legacy 3GP.
      The central fear did NOT reproduce: HLG and Dolby Vision both round-trip
      in Chrome with luma percentiles within two units of the source, because
      the browser tone-maps on decode and the pipeline encodes what it is
      given. Chrome decodes HEVC Main 10 at 1080p and 4K60.
      Done when: Firefox is checked — the question there is whether an
      undecodable HEVC source hits VH-60's `no-source-decode` block cleanly,
      not whether the colour is right — and portrait branding composition is
      specified against a portrait sample, which the corpus still lacks.

- [ ] **VH-30 Trim the source** [detail](tickets/VH-30.md) (2026-08-25)
      [sign-off]
      Intent: maintainer request. Recordings carry material nobody wants and
      today the only fix is another tool first, which defeats a one-step app.
      Ranged reads are native to Mediabunny; the work is the interactions. The
      one that matters most: loudness must measure the TRIMMED region, or
      leading silence drags the gated figure.
      Done when: scoped and signed off — recorded rather than scheduled.

### Standing — maintainer-owned, never band-gated

<!-- Human work, not agent work. Listed apart from the bands precisely so it
     cannot be read as waiting on one. -->

- [ ] **VH-M2 Measure the device envelope** [maintainer] (2026-08-24)
      Intent: spec §7.4 — published limits come from measurement, and this
      closes D8.
      Done when: 5 / 20 / 60 minute jobs at 720p and 1080p are timed on a
      managed University laptop, a modern MacBook and a low-spec Windows
      device.
      Maintainer 2026-08-27: a 60-minute recording within the week; the
      three-device timings in about six weeks.
      First figure (2026-08-25, this MacBook): 1080p, 215 s of silent slides,
      "best quality" — 34.2 s, or **6.3x real time**. The 29.25-minute Teams
      recording covers the 20-minute case; 60 minutes needs material as well as
      a device.

- [ ] **VH-14 Deployment** [maintainer] (2026-08-24)
      Maintainer 2026-08-27: the intended home is a UoN-hosted web app in the
      shape of <https://xerte.nottingham.ac.uk/play_56450> — a University
      server, University URL, no public GitHub Pages. D5 answered in principle;
      what remains is who provisions it.
      Intent: Pages is viable — no COOP/COEP needed, and asset URLs derive from
      `import.meta.env.BASE_URL`. What is unsettled is whether it should stay
      there: a Pages site on a personal account is public and serves UoN
      branding from `djdaojones.github.io`. Public hosting was accepted for an
      unadvertised pilot; the intended home is an internal server.
      **Every push to `main` deploys** — there is no separate act of
      publishing. VH-65 hardens that boundary.
      Done when: the move to internal hosting is planned and the cache strategy
      for offline-after-first-load is in place.

### Launch milestone

- [ ] **VH-13 Published limits copy** [blocked: VH-M2] (2026-08-24)
      Turn the measured envelope into user-facing wording. Closes D8. Also
      waits on VH-31: publishing figures derived from an estimate that
      overstates would publish the same error.

### Icebox

<!-- Post-triage. Deferred deliberately; each has a revisit trigger in
     docs/03-open-decisions.md. -->

- [ ] **D9 Pumping detection on pre-existing audio** — unreliable to
      measure; a false accusation is worse than silence. Revisit if staff
      report a gap the current warnings miss.
- [ ] **D11 WebM output** — supported by the muxer, not exposed. Revisit if
      a destination platform requires it. VH-49 decided AGAINST it for Firefox
      on 2026-08-27; VH-69 is the pathway if that is ever reopened.
- [ ] **VH-23 Opening graphics** (2026-08-25)
      Intent: the MVP is closing-only. Cut to the icebox 2026-08-27 — the
      maintainer's position is that openings are for external, brand-
      recognition-first video, and this tool is internal, where a closing is
      the norm. Not to be addressed until far later in the product's life.
      The pipeline path is dormant rather than deleted: `loadBrandingClip`
      refuses an opening and returns `null`, the generated placeholders are
      gone from `public/branding/`, and the timeline still speaks in terms of
      an opening duration that is currently zero.
      Revisit when approved opening assets exist AND there is a reason to want
      them. They need VH-22's three boundary modes mirrored, and a mono source
      plus a stereo opening mixes channel counts into one audio track (VH-43).
- [ ] **VH-69 A pathway for Firefox users** (2026-08-27)
      Intent: VH-49 blocks Firefox for any source with audio and names a
      browser that works, which is honest but excludes a supported browser from
      a University tool. A pathway would be WebM/Opus (D11) or an Opus-in-MP4
      variant, either of which is a second output contract to specify, test and
      explain. Low priority: the block is correct today and the message is
      clear.
      Revisit if staff report being stuck on Firefox, or if D11 opens for
      another reason.
- [ ] **VH-70 The manual gates nobody has run** (2026-08-27) [maintainer]
      Intent: six checks no automated harness can reach — a job running while
      the device sleeps and wakes, the progress bar under a screen reader, a
      throttled multi-gigabyte fallback download completing, an output
      accepted by EchoVideo's ingest, an independent external true-peak meter
      run against one produced MP4 (VH-50's numbers come from our own meter),
      and a multi-tab OPFS boot/start stress in real engines. Each covers
      something already built and believed to work; none has been confirmed by
      a person.
      Revisit when there is a real pilot user, or before VH-13's published
      limits go out.
- [ ] **VH-78 Show the closing card being chosen** (2026-08-27) [maintainer]
      Intent: the blue/white closing choice is made blind; the archived branch
      has a small preview (`branding-preview.ts`, recoverable from the
      archive tag). Post-VH-32 ("the simplicity is the design") this is a
      deliberate-simplicity call, not default work.
      Revisit when the maintainer wants the choice visible, or a pilot user
      asks what the options look like.
- [ ] **D12 Custom or per-department branding** — needs a governance answer
      for who approves a variant before it needs an implementation.
- [ ] **D13 Batch processing** — the most likely first request from anyone
      with a module's worth of recordings. Revisit when v1 is in use.
- [ ] **VH-27 EBU Tech 3341 cases 7 and 8** — the authentic-programme segments,
      which the EBU distributes as audio and cannot be synthesised. Would need
      the files checked in as gitignored fixtures. Cases 3-5 already cover the
      same gating behaviour.
- [ ] **VH-28 TypeScript 7** — blocked on typescript-eslint supporting `>=6.1.0`.
      A one-line change to the pin when it does.
- [ ] **VH-29 Full embedded-subtitle extraction** — would need a bespoke MP4 box
      walker for `tx3g` / `wvtt` / `stpp` samples, since Mediabunny cannot
      read subtitle tracks. Revisit only if embedded tracks turn out to be
      common in practice; spec §8.2 says they will not be.

<!-- Ticket grammar (CANONICAL COPY — prompts and workflows point here,
     they do not restate it): quick items stay one line. Non-trivial or
     sign-off items add two lines so intent survives compression:
       - **ID Short title** [flags]
         Intent: the outcome wanted.
         Done when: the acceptance condition.
     Flags: [sign-off] (scope sign-off first → full mode), [blocked: X],
     [spike] (timeboxed investigation → spike mode in task.md),
     [detail] (has a ticket file — write the flag as a Markdown link
     targeting `tickets/<ID>.md`, one hop), [maintainer] (human-owned,
     not agent work), [security] (live exposure — a leaked credential
     or open auth hole; nothing weaker).
     Standing items — [maintainer], [sign-off], or [blocked] work that
     waits across sessions — carry their creation date (YYYY-MM-DD).
     Add optional Scope:/Risks: lines only for sign-off items. -->
