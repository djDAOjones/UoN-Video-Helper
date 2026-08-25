# Backlog

<!-- OPEN WORK ONLY. Status: [ ] todo  [~] in progress  [-] cut. -->
<!-- Shipped work does NOT stay here. On ship: add one line to
     trajectory.md (the outcome) + an entry to decision-log.md (the why),
     then remove the item from this file. There is no Completed section. -->
<!-- Hot sectional. Agents read the Active section only by default. -->

## Active

### Found after Band 0 — needs a new band before it is built

<!-- Band 0 (VH-1..VH-11, VH-M1, VH-M2) shipped 2026-08-25: a file goes in, a
     branded, correctly-levelled, correctly-encoded MP4 comes out. Everything
     in this section was found during or after that work and sits BEYOND the
     signed-off ceiling, so none of it is picked without a new sign-off.
     Maintainer-owned items ([maintainer]) are the exception — they are not
     agent work and are not gated. -->

- [ ] **VH-16 Extend the acceptance harness** (2026-08-25)
      Intent: the harness from VH-11 covers what it covers; two gaps are known.
      Done when: it runs the pipeline in a worker as well as on the main thread
      (today it exercises the `createWritable` path, not the sync-handle path
      the app actually uses), and preset comparison is done on camera-like
      motion, where the two presets can actually differ.

- [ ] **VH-M3 Stop OneDrive syncing this project** [maintainer] (2026-08-25)
      Intent: on 2026-08-25 the quality gate began failing with
      `ETIMEDOUT: connection timed out, read` from `readFileSync`, and `tsc`
      hung indefinitely. OneDrive Files-On-Demand had dehydrated
      `node_modules` — 598 cloud-only files in the first 3000 checked — so
      every read became a network fetch. `npm ci` rewrites them locally and
      fixes it in seconds, but nothing stops it recurring.
      Status: syncing was paused again on 2026-08-25, for an 8-hour window.
      Pausing is time-boxed and reverts on its own, so the item stays open.
      Done when: this folder is excluded from OneDrive sync, or marked "Always
      keep on this device". `AGENTS.md` already declares cloud-synced paths
      unsupported for project memory; this is the same hazard reaching the
      build.
      Note: `.gitignore` has no effect here — OneDrive does not read it.

- [ ] **VH-21 Keep the branding bed when the source has no audio**
      Intent: a screen recording made without a microphone has no audio track,
      which spec §5.4 treats as a warning rather than a failure. But the audio
      output is currently created only when the SOURCE has audio, so branding
      is added silently — the bed is dropped with it.
      Done when: a silent source with branding produces an output carrying the
      branding bed, with silence across the content region.
      Note (2026-08-25): the real closing masters have NO audio track at all,
      so on current assets there is no bed to keep and this is cosmetic. It
      becomes real again only if a future master carries audio. See VH-22.

- [ ] **VH-20 Flush the audio chain's tail**
      Intent: the limiter delays by its 5 ms look-ahead, and the streaming path
      never flushes it, so the output loses roughly 5 ms from the end of the
      audio. Inaudible on a lecture that ends in silence; still undocumented
      behaviour rather than a decision.
      Done when: either the tail is emitted as a final sample, or the loss is
      measured, judged acceptable, and recorded in the spec-facing notes.

- [ ] **VH-19 Content-adaptive bitrate for the smaller preset**
      Intent: spec §6.2 sets ~1.5 Mbps for slides/screen and ~2.5 Mbps for
      camera/motion. `ContentClass` exists but nothing sets it, so every job
      currently uses the higher figure.
      Done when: screen-like and camera-like content are distinguished — the
      calibration probe already decodes three seconds and is the natural place
      to measure inter-frame difference — and the chosen class is visible to
      the user in plain language rather than applied silently.

- [ ] **VH-17 Evaluate `fastStart: 'reserve'` for the smaller preset**
      Intent: the "smaller file" preset goes to OneDrive and SharePoint, where
      students may stream it. `fastStart: false` puts the moov box at the end,
      which can force a full download before playback starts.
      Done when: either `'reserve'` is adopted with a packet count derived from
      the CFR grid plus a safe margin and verified on a real SharePoint upload,
      or the current behaviour is confirmed adequate and the reason recorded.
      Scope: `'in-memory'` is not an option — it reinstates the memory ceiling.

- [ ] **VH-M2 Measure the device envelope** [maintainer] (2026-08-24)
      Intent: spec §7.4 — published limits come from measurement, and this
      is what closes D8.
      Done when: 5 / 20 / 60 minute jobs at 720p and 1080p are timed on a
      managed University laptop, a modern MacBook and a low-spec Windows
      device, and the numbers are recorded.
      Note (2026-08-25): the Teams recording is 29.25 minutes, which covers the
      20 minute case. The 60 minute case still needs material as well as a
      device.

- [ ] **VH-22 Branding boundary modes** [detail](tickets/VH-22.md) (2026-08-25)
      Intent: the closing graphic opens with a 1.00 s animated build over a
      4.00 s opaque card, so what sits UNDER the build is an editorial choice.
      Three modes, using the conventional edit terms: **hard cut** (discard the
      build, T+4.00, composites nothing), **over picture** (build plays over
      the closing second, T+4.00), **over freeze frame** (final frame sustains
      under the build, T+5.00).
      Done when: all three work, with **hard cut** the default (2026-08-25);
      the VH-25 fade-out defaults ON for hard cut only, since in the other two
      the build IS the transition; and over freeze frame holds the last CLEAN
      frame, not the last decoded one.

- [ ] **VH-23 Opening graphics** (2026-08-25)
      Intent: there are no opening assets and the maintainer's position is that
      there should not be yet — brand-recognition-first openings suit external
      video, while this tool is primarily internal, where a closing is the norm.
      So the MVP is CLOSING-ONLY, which contradicts spec §4.1's two independent
      toggles (recorded in doc-deltas).
      Done when: opening assets exist. They will need the same three boundary
      modes as VH-22, mirrored — the onset ramp runs the other way.

- [ ] **VH-25 Boundary fades** [detail](tickets/VH-25.md) (2026-08-25)
      Intent: sources cut hard into the branding, and the two ends differ.
      21 of 21 end on a bright frame so the picture always needs a fade-out,
      but 0 of 19 end above −69 dBFS so the audio has already stopped. Four
      start mid-speech.
      Done when: picture fade-out defaults ON silently, picture fade-in is
      offered and defaults OFF, and the modal is reserved for the
      audio-starts-mid-speech case — a notice that fires every time is not a
      notice. Lengths live in `src/config/`; D3's 100 ms fade is reconciled
      with them.

- [ ] **VH-30 Trim the source** [detail](tickets/VH-30.md) (2026-08-25)
      Intent: maintainer request. Recordings carry material nobody wants — the
      wait before people join, the fumble for the stop button — and today the
      only fix is another tool first, which defeats a one-step app. Ranged
      reads are native to Mediabunny, so the mechanics are cheap; the work is
      the interactions. The one that matters most: loudness must measure the
      TRIMMED region, or leading silence drags the gated figure and the single
      linear gain mis-levels what the viewer actually sees. The closing
      boundary, subtitle offsets, duration estimates and the calibration probe
      all key off the trim points too.
      Done when: scoped and signed off — this is a future feature, recorded
      rather than scheduled.

- [ ] **VH-26 Mobile phone sources** [detail](tickets/VH-26.md) (2026-08-25)
      Intent: staff may upload phone footage and none is in the corpus. Rotation
      was traced end to end and is correct — recorded so it is not
      re-investigated. The real gap is colour: `src/` has no colour-space or
      tone-map handling at all, and phones record HDR 10-bit by default, so the
      picture is silently washed out or crushed depending on the browser. It
      always plays, so nothing surfaces as an error.
      Done when: phone footage is in `samples/`, the colour path has a decided
      and tested behaviour, and portrait branding composition is specified.

- [ ] **VH-24 Survive real-world source properties** [detail](tickets/VH-24.md) (2026-08-25)
      Intent: awkward input is the common case. All eight frame-rate anomalies
      trace to one tool (PowerPoint, writing a nominal 30 fps as 1000/33), and
      Teams is 16.000 fps CFR, so neither produces the VFR the conform path was
      built for. Reading the rate is already correct — verified against a real
      file, the app measures 30.3030 and ignores the declared 30/1. What remains
      is the SNAPPING: 16 fps rounds up to 24, duplicating 50% of frames for no
      benefit (spec §6.3 delta). Plus two files with no audio, one mono, one
      PCM, mixed sample rates, and one at 16:10.
      Done when: low rates stop snapping upward; odd geometry survives without
      distortion; mono, PCM and 16/44.1 kHz sources all reach a correct output;
      and each is exercised by a named fixture.

### Next milestone

- [ ] **VH-13 Published limits copy** [blocked: VH-M2] (2026-08-24)
      Turn the measured envelope into the user-facing wording. Closes D8.

- [ ] **VH-14 Deployment** [blocked: D5] (2026-08-24)
      Static hosting, cache strategy for branding assets, offline-after-
      first-load. Needs a hosting decision from UoN IT / web team.

- [ ] **VH-15 Confirm the browser exclusion** [maintainer] [blocked: D4] (2026-08-24)
      Sign-off from UoN IT that Safari below 26 may be excluded. The one
      open decision that would be expensive to reverse.

### Icebox

<!-- Post-triage. Deferred deliberately; each has a revisit trigger in
     docs/03-open-decisions.md. -->

- [ ] **D9 Pumping detection on pre-existing audio** — unreliable to
      measure; a false accusation is worse than silence. Revisit if staff
      report a gap the current warnings miss.
- [ ] **D10 Stream-copy fast path for "best quality"** — near-instant and
      generationally lossless, but degrades badly on VFR sources, which are
      common here. Revisit when v1 is stable and there is CFR data.
- [ ] **D11 WebM output** — supported by the muxer, not exposed. Revisit if
      a destination platform requires it. None currently does.
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
