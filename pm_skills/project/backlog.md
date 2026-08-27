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
     VH-54..VH-68 came from an external repository review (2026-08-26) and its
     two critiques. All three documents live in `reviews/2026-08-26/`, which is
     the detail source for those items — cite the R-number rather than
     restating the evidence here. Findings were re-verified against source
     before banding; where the review's own remedy was shown unsafe, the item
     says so. -->

### Band 1a — The output is what we say it is (signed off 2026-08-25)

<!-- Committed. Everything a staff member meets today that is wrong,
     misleading, or a risk. VH-54, VH-50 and VH-58 shipped 2026-08-27 and the
     output contract now holds on real material, and VH-56 shipped with it so
     a finished file survives the next click and VH-57 made every phase answer
     Cancel, and VH-55 made its onset loss visible. What remains is silent
     loss: VH-55's second half waits on VH-62's sync meter, and VH-59 is
     independent. -->

- [~] **VH-55 Source onset can be replaced by encoder priming** (2026-08-27)
      Intent: R-03. `AudioTimelineShift.apply()` drops AAC samples landing
      before timestamp zero. Sync survives; content does not — three files in
      the real corpus carry energy in their first 44 ms.
      Done 2026-08-27: the probe distinguishes an unmeasurable encoder from a
      zero-delay one, and a discarded onset above −50 dBFS now raises a visible
      `onset-trimmed` warning, so the loss is no longer silent.
      Remaining: stop discarding it. Delay the VIDEO by the encoder delay
      instead — Mediabunny writes the empty edit list — which is ~6 lines
      across four timestamp sites. Sequenced after VH-62 because the
      acceptance sync meter reads audio in decoded-sample time and video in
      presentation time, so it cannot yet prove the one axis this moves.
      Done when: no source sample is discarded, and a sync meter that measures
      both tracks on one clock says so.

- [ ] **VH-59 Multi-track sources lose tracks silently** (2026-08-27)
      Intent: R-09. Inspection and processing can pick different primary
      tracks, extra tracks are neither counted nor carried, and nothing warns.
      `Silent data loss is the worst available outcome` is an AGENTS.md
      invariant.
      Done when: inspection reports the tracks processing will use, all track
      counts are surfaced, and a lossy job is blocked or acknowledged first.

### Band 1b — Decisions the maintainer owns (signed off 2026-08-25)

<!-- Committed work that cannot proceed without a product call. Listed apart
     from 1a so agent work is never read as waiting on these. -->

- [ ] **VH-49 Firefox cannot make the audio, and is not told so** [sign-off]
      [detail](tickets/VH-49.md) (2026-08-26)
      Intent: Firefox 154 has `AudioEncoder` and refuses `mp4a.40.2` at every
      bitrate and channel count. Pre-flight now blocks with `no-aac-encode`
      before anything starts, so the failure is honest. Undecided is what
      Firefox users get: block them, ship WebM/Opus (D11), or drop audio
      (never).
      Done when: the choice is made and spec §10, `README.md` and D4 match it.

- [ ] **VH-46b Restore the closing transition controls** (2026-08-26)
      Intent: VH-45 withdrew "over the picture" and "over a freeze frame"
      because they were wrong in Firefox. VH-44 fixed that in all three
      engines, so the reason is gone — but returning controls to a live site is
      a decision, not a fix.
      Done when: the two radios are back in `index.html` (markup is in the
      VH-45 comment; the pipeline never lost the modes), or they stay out and
      VH-32 says what replaces them.
      Note: VH-25's picture fade-out is for hard cut ONLY — in the overlay
      modes the build IS the transition.

- [ ] **VH-31 The size estimate is ~1.7x too high** [detail](tickets/VH-31.md)
      (2026-08-25)
      Intent: it is shown before the user commits, so it is the number they
      decide on, and it feeds VH-13's published limits. It is not a safety
      margin — at "Smaller file" the projection already falls BELOW the
      produced file on 4 of 23 real jobs. One measured contributor:
      `projectedOutputBytes` charges 128 kbps of AAC to sources with no audio
      track, ~3.4 MB on a 215 s silent deck, and the call sites know.
      Done when: the estimate is grounded in real content — the calibration
      probe already decodes three seconds — or presented honestly as an upper
      bound.

- [ ] **VH-19 Content-adaptive bitrate for the smaller preset**
      Intent: spec §6.2 sets ~1.5 Mbps for slides and ~2.5 Mbps for camera.
      `ContentClass` exists but nothing sets it, so every job uses the higher
      figure.
      Done when: screen-like and camera-like content are distinguished by the
      calibration probe and the class is stated in plain language rather than
      applied silently. After VH-31 — same probe.

- [ ] **VH-25 Boundary fades** [detail](tickets/VH-25.md) (2026-08-25)
      Intent: sources cut hard into the branding and the two ends differ. 21 of
      21 end on a bright frame; 0 of 19 end above −69 dBFS. Four start
      mid-speech. No picture fade exists in `src/` today.
      Done when: picture fade-out defaults ON for hard cut only, fade-in is
      offered and defaults OFF, and the modal is reserved for the
      audio-starts-mid-speech case. Lengths live in `src/config/`.

- [ ] **VH-32 Interface quality pass** [sign-off] [detail](tickets/VH-32.md)
      (2026-08-25)
      Intent: maintainer request after using the deployed app — a design pass,
      not a bug list. The screen accretes rather than progresses, speaks in
      codecs rather than outcomes, disables controls that still look live, and
      never shows moving picture. The plain-language framing and the
      never-uploaded reassurance should survive.
      Done when: a considered redesign is agreed and implemented against
      `UI-STANDARDS.md` §6. Last in the band by design: it must lay out the
      estimate wording, the content class, the fade toggles and VH-64.

### Band 2 — The edges hold

<!-- Not committed. Known gaps not currently biting anyone, plus review
     findings that are real but not user-facing today. VH-62 earns promotion
     into Band 1a the moment Band 1a's pipeline changes turn out large: a
     harness with false-pass routes matters far more when the pipeline moves. -->

- [ ] **VH-68 Four small defects the review's consolidation dropped**
      (2026-08-27)
      Intent: one visit, four latent faults, no user-facing change. (a)
      `SlidingMinimum` stores an ever-increasing position in an `Int32Array`
      and wraps after ~12.4 h at 48 kHz. (b) `WARNING_THRESHOLDS.clippingDbtp`
      and `COMPRESSOR.softKnee` are declared and never read — and since VH-50
      made the output contract fail closed at 0.5 LU, `targetMissedByLu` (1 LU)
      and `detectOutputWarning` cannot fire either, while the worker builds
      `outputWarnings` empty and posts it. (c) an entirely
      silent source can never raise the extended-silence warning, because the
      check is nested under `if (audible.length > 0)`. (d)
      `scripts/run-in-engines.mjs` counts a missing engine as skipped without
      saying so in its tally.
      Done when: each is fixed or explicitly recorded as intended.

- [ ] **VH-62 The acceptance harness has false-pass routes** (2026-08-27)
      Intent: R-11. Criterion 2's missing-measurement and cropped-peak routes
      closed on 2026-08-27. Remaining: resource warnings do not fail a run,
      compliance status does not reflect which fixtures executed, and egress
      observation does not cover every request context.
      Done when: the harness cannot report green on an unexecuted or unmeasured
      invariant, and an injected defect turns it red.

- [ ] **VH-61 LRA and pause freeze are wrong at the boundaries** (2026-08-27)
      Intent: R-10, but NOT its remedy. EOF suppression of LRA is real; the
      prescribed 1.5 s of silence was tested and is unsafe — on a quiet ending
      it took a measured 3.79 LRA to 15.32, and `shouldApplyMacroLevelling()`
      fires above 9, so padding would switch on macro-levelling because a
      recording ends in room tone. The second half is likely stronger than the
      review states: spec §5.2 step 3 freezes pauses AFTER smoothing and slew
      limiting; `macrolevel.ts` freezes the raw correction before smoothing.
      Done when: LRA state alone advances over a tail without touching
      integrated loudness, duration, or the gate, the pause hold is reapplied
      to the final envelope, and neither worsens a boundary corpus. Protected
      DSP — re-run the EBU harness.

- [ ] **VH-60 Preflight does not bind to the job that runs** (2026-08-27)
      Intent: R-05 and R-06, one visit. Results are not tied to the selected
      file and preset, so a late response can approve a job the user has since
      changed; and the verdict omits secure context, OPFS and primary-track
      decode, flattens probe failure causes, and probes `avc1.640033` while
      Mediabunny is handed the abstract `avc`.
      Done when: one immutable accepted `JobSpec` per selection epoch, stale
      responses ignored, and the probed config derived from the same candidate
      the encoder receives.
      Note: the review's AAC half is stale — VH-49 already probes the runtime
      configuration. Check its Level 5.1 claim against the H.264 tables.

- [ ] **VH-63 Long jobs have no survival controls** (2026-08-27)
      Intent: R-12. A job can run for tens of minutes with no wake lock, so the
      device sleeps and the work is lost; `beforeunload` is not attached while
      processing or while an unsaved result exists.
      Done when: a wake lock is held during processing and re-acquired on
      visibility change, and `beforeunload` is attached only while there is
      something to lose. Both degrade quietly where unsupported.

- [ ] **VH-64 Progress and the discourage acknowledgement are incomplete**
      (2026-08-27)
      Intent: R-14. Progress has no stable accessible label or stage
      description, and a "discourage" preflight outcome has no acknowledge
      action, so consent is inferred from the user continuing.
      Done when: progress announces its stage, and a discouraged job requires a
      deliberate acknowledgement. Feeds VH-32.

- [ ] **VH-67 Loudness analysis retains one array per window** (2026-08-27)
      Intent: R-16. Retention grows linearly with duration, contradicting the
      "few hundred kilobytes" comment and the bounded-state contract. Not
      whole-file buffering, and not biting at one hour.
      Done when: the analyser keeps only what warnings and envelopes need and
      releases the curves once derived, with equivalence shown.

- [ ] **VH-65 The release boundary is not least-privilege** (2026-08-27)
      Intent: R-13. The Pages workflow grants more than the build needs,
      actions float rather than pin, and `check-placeholders.mjs` has no exact
      allowlist of what may be published from `public/`. VH-14 makes every push
      to `main` a publication, which is what raises the consequence.
      Done when: build has `contents: read`, Pages/OIDC is scoped to deploy,
      actions are SHA-pinned with a stated update route, and the publishable
      media set is an explicit allowlist.

- [ ] **VH-66 Operational and documentation contracts have drifted**
      (2026-08-27)
      Intent: R-15. Recovery, deployment, privacy, version and diagnostics
      statements no longer all match the code, and some of it is protected
      documentation.
      Done when: each drift is corrected in the implementation or captured in
      `doc-deltas.md` for the next doc-sync. Never narrow a published promise
      to make it true.

- [ ] **VH-17 Evaluate `fastStart: 'reserve'` for the smaller preset**
      Intent: the "smaller file" preset goes to OneDrive and SharePoint, where
      students may stream it. `fastStart: false` puts the moov box at the end,
      which can force a full download before playback starts.
      Done when: `'reserve'` is adopted with a packet count derived from the
      CFR grid plus a margin and verified on a real SharePoint upload, or the
      current behaviour is confirmed adequate and the reason recorded.
      Scope: `'in-memory'` is not an option — it reinstates the memory ceiling.

### Band 3 — New capability, or waiting on material

<!-- Not committed, and none of it can start today: two wait on assets that
     do not exist, two on a scoping pass. -->

- [ ] **VH-26 Mobile phone sources** [detail](tickets/VH-26.md) (2026-08-25)
      Intent: staff may upload phone footage and none is in the corpus.
      Rotation was traced end to end and is correct. The gap is colour: `src/`
      has no colour-space or tone-map handling and phones record HDR 10-bit by
      default, so the picture is silently washed out or crushed. It always
      plays, so nothing surfaces.
      Done when: phone footage is in `samples/`, the colour path has a decided
      and tested behaviour, and portrait branding composition is specified.

- [ ] **VH-23 Opening graphics** (2026-08-25) [blocked: no assets]
      Intent: there are no opening assets and the maintainer's position is that
      there should not be yet — the MVP is CLOSING-ONLY, contradicting spec
      §4.1 (recorded in doc-deltas). The user-facing risk was split out as
      VH-33.
      Done when: opening assets exist. They need VH-22's three boundary modes,
      mirrored.
      Inherited from VH-43: a mono source plus a stereo opening mixes channel
      counts into one audio track. Unreachable today; restoring openings
      revives it.

- [ ] **VH-30 Trim the source** [detail](tickets/VH-30.md) (2026-08-25)
      [sign-off]
      Intent: maintainer request. Recordings carry material nobody wants and
      today the only fix is another tool first, which defeats a one-step app.
      Ranged reads are native to Mediabunny; the work is the interactions. The
      one that matters most: loudness must measure the TRIMMED region, or
      leading silence drags the gated figure.
      Done when: scoped and signed off — recorded rather than scheduled.

- [ ] **VH-48 Stream-copy fast path for "best quality"**
      [detail](tickets/VH-48.md) (2026-08-25) [sign-off]
      Intent: promoted from icebox D10. Leave the source video untouched and
      encode only the branding. Of rationale §4.3's two objections only ONE has
      fallen — VH-24 measured the corpus as effectively CFR — while byte-exact
      parameter matching still stands, with silent A/V drift after publication
      as its failure.
      Done when: scoped and signed off. The deliverable is a `canStreamCopy`
      predicate, not a switch: VH-25's fades and VH-44's overlay modes each
      remove the conditions that make it safe.

### Standing — maintainer-owned, never band-gated

<!-- Human work, not agent work. Listed apart from the bands precisely so it
     cannot be read as waiting on one. -->

- [ ] **VH-M3 Stop OneDrive syncing this project** [maintainer] (2026-08-25)
      Intent: OneDrive Files-On-Demand dehydrated `node_modules` on 2026-08-25
      — 598 cloud-only files in the first 3000 — so every read became a network
      fetch, `readFileSync` returned `ETIMEDOUT` and `tsc` hung. `npm ci` fixes
      it in seconds; nothing stops it recurring. Pausing is time-boxed and
      reverts on its own.
      Done when: this folder is excluded from OneDrive sync, or marked "Always
      keep on this device". `.gitignore` has no effect — OneDrive does not read
      it.

- [ ] **VH-M2 Measure the device envelope** [maintainer] (2026-08-24)
      Intent: spec §7.4 — published limits come from measurement, and this
      closes D8.
      Done when: 5 / 20 / 60 minute jobs at 720p and 1080p are timed on a
      managed University laptop, a modern MacBook and a low-spec Windows
      device.
      First figure (2026-08-25, this MacBook): 1080p, 215 s of silent slides,
      "best quality" — 34.2 s, or **6.3x real time**. The 29.25-minute Teams
      recording covers the 20-minute case; 60 minutes needs material as well as
      a device.

- [ ] **VH-14 Deployment** [maintainer] (2026-08-24)
      Intent: Pages is viable — no COOP/COEP needed, and asset URLs derive from
      `import.meta.env.BASE_URL`. What is unsettled is whether it should stay
      there: a Pages site on a personal account is public and serves UoN
      branding from `djdaojones.github.io`. Public hosting was accepted for an
      unadvertised pilot; the intended home is an internal server.
      **Every push to `main` deploys** — there is no separate act of
      publishing. VH-65 hardens that boundary.
      Done when: the move to internal hosting is planned and the cache strategy
      for offline-after-first-load is in place.

- [ ] **VH-15 Confirm the browser exclusion** [maintainer] [blocked: D4]
      (2026-08-24)
      Sign-off from UoN IT that Safari below 26 may be excluded. The one open
      decision that would be expensive to reverse.

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
      a destination platform requires it, or if VH-49 chooses it for Firefox.
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
