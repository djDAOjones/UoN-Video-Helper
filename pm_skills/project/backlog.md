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
     Standing. Why these bands: decision-log 2026-08-25 "Band 1". -->

### Band 1 — Honest output on real files (signed off 2026-08-25)

<!-- Committed. What a staff member meets on the deployed site today that is
     wrong, misleading, or a risk. The order is load-bearing. VH-34..VH-33 are
     small, severe and independent — a false published claim, data loss, an
     uncancellable job, a wrong boundary, a brand risk — so they lead. VH-47,
     VH-31 and VH-19 are then ONE visit to the output shape and what we claim
     about it, not a queue; VH-43 proves odd sources survive it. VH-32 is
     LAST because it must lay out what everything above it decides.
     VH-34..VH-40 came from an external code review, 2026-08-25; its findings
     were verified against the source before being written up. -->

- [ ] **VH-49 Firefox cannot make the audio, and is not told so** [sign-off]
      [detail](tickets/VH-49.md) (2026-08-26)
      Intent: Firefox 154 has the `AudioEncoder` class and REFUSES `mp4a.40.2`
      at every bitrate and channel count — 64k to 256k, mono and stereo —
      while accepting Opus and every video configuration the app asks for.
      Measured headless and in a normal window. So every lecture with sound
      failed mid-job in a browser spec §10 lists as supported, after showing a
      progress bar, with "Something went wrong".
      Half is fixed and shipped: `capability.ts` now asks
      `AudioEncoder.isConfigSupported` for the exact configuration the job will
      use, and pre-flight blocks with `no-aac-encode` before anything starts,
      naming a browser that works. Verified in all three engines.
      What is NOT decided is what Firefox users should get, and it needs a
      person: block them (honest, and excludes a supported browser from a
      University tool), ship WebM/Opus to Firefox (spec §6.4 has WebM behind
      D11 and §6.1 says MP4), or drop audio (never). A silent source is
      unaffected and still works there.
      Done when: the choice is made and the browser-support claim in spec §10,
      `README.md` and `docs/03-open-decisions.md` D4 matches it.

- [ ] **VH-46b Restore the closing transition controls** (2026-08-26)
      Intent: VH-45 withdrew "over the picture" and "over a freeze frame" from
      the interface because they were wrong in Firefox. VH-44 fixed that on
      2026-08-26 and it is verified in all three engines, so the reason the
      controls came out no longer exists. Putting user-facing controls back on a
      live site is a decision rather than a fix, which is why it did not ride
      along with VH-44.
      Done when: the two radios are back in `index.html` (the markup is in the
      VH-45 comment there, and the pipeline never lost the modes), or the
      decision is taken to leave them out and VH-32 lays out what replaces them.
      Note: VH-25's picture fades interact — its Done-when says the fade-out is
      for hard cut ONLY, because in the overlay modes the build IS the
      transition.

- [ ] **VH-50 Real material misses the loudness invariant, and the harness
      says it does not** (2026-08-26)
      Intent: `AMCS3059` — 852×480, 130 s, the same file VH-31 was measured on —
      comes out at **−16.75 LUFS** against a −16 ±0.5 target and **−1.98 dBTP**
      against a ceiling of −2.00. Both miss. `conventions.md` lists that pair as
      invariant 2 and spec §13 criterion 2 requires it, so this is the project's
      second-most-protected property failing on the first real file anyone
      checked it against.
      Not a regression: re-run on `de0b94f`, before the 2026-08-26 session, and
      the figures are identical to the hundredth. It has always done this.
      The worse half is that the acceptance harness PASSES criterion 2. Its
      corpus is synthesised, and whatever real speech does — most likely the
      limiter engaging on a source already peaking at −1.86 dBTP and pulling the
      integrated figure down with it — the fixtures do not reproduce. A harness
      that passes the invariant the product misses is worse than no harness.
      Done when: the cause is identified rather than guessed at, the output
      meets both figures on real material, and the harness gains a case that
      would have caught it. Whether the fix is in the gain staging, the
      limiter's interaction with it, or a second gain pass is the open question.
      Note: measured with `/spike-real.html?file=…`, which needs a real
      recording in `public/spike/` — the guard refuses a build while one is
      there, so remove it afterwards.

- [ ] **VH-31 The size estimate is ~1.7x too high** [detail](tickets/VH-31.md)
      (2026-08-25)
      Intent: the app said 27.7 MB and produced 7.5 MB on the first real file
      anyone ran. **That was 3.6x; it is 1.7x now** — VH-47 shipped on
      2026-08-26 and more than halved it without touching this code, and the
      same measurement pass found that the over-estimate is NOT the safety
      margin this item assumed: at "Smaller file" the projection already falls
      BELOW the produced file on 4 of 23 real jobs. The ticket carries the
      measurements and the objections that stopped a design shipping. `projectedOutputBytes` assumes the encoder spends its whole
      bitrate budget; VBR undershoots badly on slide content. It is shown
      before the user commits, so it is the number they decide on — someone
      watching a OneDrive limit may pick "Smaller file" they did not need. It
      also feeds VH-13's published limits, which would inherit the error.
      Done when: the estimate is grounded in the real content — the calibration
      probe already decodes three seconds and could encode them — or is
      presented honestly as an upper bound.
      One concrete contributor, measured 2026-08-25 while verifying VH-41:
      `projectedOutputBytes` adds `shape.audioBitrateBps` unconditionally, so a
      source with NO audio track is charged 128 kbps of stereo AAC for an audio
      track the output will not contain. On a silent 4 s fixture that was 64 kB
      of an 82 kB estimate; on the 215 s silent slide deck it is ~3.4 MB. The
      call sites know (`report.audio !== null`), the function does not.
      VH-24's frame-rate rule and VH-41's bitrate cap shipped 2026-08-25, so
      what remains of that shared visit to `outputShapeFor` is this item and
      VH-19.

- [ ] **VH-19 Content-adaptive bitrate for the smaller preset**
      Intent: spec §6.2 sets ~1.5 Mbps for slides/screen and ~2.5 Mbps for
      camera/motion. `ContentClass` exists but nothing sets it, so every job
      currently uses the higher figure.
      Done when: screen-like and camera-like content are distinguished — the
      calibration probe already decodes three seconds and is the natural place
      to measure inter-frame difference — and the chosen class is visible to
      the user in plain language rather than applied silently. Sequenced after
      VH-31 because it rides the same probe machinery; if VH-31 lands real
      measurement, this may reduce to naming the class rather than choosing on it.

- [ ] **VH-25 Boundary fades** [detail](tickets/VH-25.md) (2026-08-25)
      Intent: sources cut hard into the branding, and the two ends differ.
      21 of 21 end on a bright frame so the picture always needs a fade-out,
      but 0 of 19 end above −69 dBFS so the audio has already stopped. Four
      start mid-speech. No picture fade exists anywhere in `src/` today;
      `BOUNDARY_FADE_MS = 100` is D3's AUDIO fade at the branding join.
      Done when: picture fade-out defaults ON silently **for hard cut only** —
      in the two overlay modes the build IS the transition and a fade would
      double up (clause inherited from VH-22 on its close) — picture fade-in is
      offered and defaults OFF, and the modal is reserved for the
      audio-starts-mid-speech case. A notice that fires every time is not a
      notice. Lengths live in `src/config/`; D3's 100 ms fade is reconciled
      with them.

- [ ] **VH-32 Interface quality pass** [sign-off] [detail](tickets/VH-32.md) (2026-08-25)
      Intent: maintainer request after using the deployed app — a deliberate
      design pass, not a bug list. The screen accretes rather than progresses
      (the finished state looks like the working state with more underneath),
      speaks in codecs rather than outcomes, disables controls that still look
      live, and never shows moving picture despite being a video tool. The
      plain-language framing and the never-uploaded reassurance are already
      right and should survive.
      Done when: a considered redesign is agreed and implemented, reviewed
      against `UI-STANDARDS.md` §6. Last in the band by design: it must lay out
      the estimate wording, the content class and the fade toggles that the
      four items above decide.

### Band 2 — The edges hold

<!-- Not committed. Known gaps not currently biting anyone. VH-16 earns
     promotion into Band 1 if Band 1's pipeline changes turn out large: a
     harness that misses the path the app actually uses matters far more when
     the pipeline is moving. -->

- [ ] **VH-52 The DSP timeout cannot mean what it looks like it means**
      (2026-08-26)
      Intent: raised by a parallel session reviewing this backlog, which noticed
      `testTimeout: 30_000` was reached here (79355f0) for CI slowness — a ~1.5x
      runner against a ~3.9 s slowest test — while the same constant in another
      project was set as a STARVATION bound with ~34x headroom over a 889 ms
      test. Same number, very different cover: 30 s over 3.9 s is ~7.7x.
      Both premises verified against this repo. What changes the conclusion is a
      measurement taken here on 2026-08-26: `chain.test.ts` ran **540 s and
      failed a test** with three headless browsers encoding alongside it, which
      is ~138x. So deriving the timeout from measured duration times a starvation
      factor — the shape suggested — produces a bound of minutes, and a
      genuinely hung test would then take minutes to fail. The constant is doing
      the CI job correctly and cannot do the starvation job at all.
      The operational half is already done: DEV-INFRASTRUCTURE's quality-gate
      section now carries the measurement and the "gate on a settled machine"
      rule, which previously existed only in the other project.
      Done when: a DSP timeout failure is LEGIBLE as contention rather than
      looking like a real failure — the cheapest form is vitest reporting the
      file duration beside the failure and a line in the gate output saying what
      an unusually long run means — or the current bound is confirmed adequate
      for CI and the starvation case is accepted as an operating rule only.
      Note: this is why `scripts/run-in-engines.mjs` carries "never run it
      alongside `npm run check`" in its header.

- [ ] **VH-17 Evaluate `fastStart: 'reserve'` for the smaller preset**
      Intent: the "smaller file" preset goes to OneDrive and SharePoint, where
      students may stream it. `fastStart: false` puts the moov box at the end,
      which can force a full download before playback starts.
      Done when: either `'reserve'` is adopted with a packet count derived from
      the CFR grid plus a safe margin and verified on a real SharePoint upload,
      or the current behaviour is confirmed adequate and the reason recorded.
      Scope: `'in-memory'` is not an option — it reinstates the memory ceiling.

### Band 3 — New capability, or waiting on material

<!-- Not committed, and none of it can start today: two wait on assets that
     do not exist, two on a scoping pass. -->

- [ ] **VH-26 Mobile phone sources** [detail](tickets/VH-26.md) (2026-08-25)
      Intent: staff may upload phone footage and none is in the corpus. Rotation
      was traced end to end and is correct — recorded so it is not
      re-investigated. The real gap is colour: `src/` has no colour-space or
      tone-map handling at all, and phones record HDR 10-bit by default, so the
      picture is silently washed out or crushed depending on the browser. It
      always plays, so nothing surfaces as an error.
      Done when: phone footage is in `samples/`, the colour path has a decided
      and tested behaviour, and portrait branding composition is specified.

- [ ] **VH-23 Opening graphics** (2026-08-25) [blocked: no assets]
      Intent: there are no opening assets and the maintainer's position is that
      there should not be yet — brand-recognition-first openings suit external
      video, while this tool is primarily internal, where a closing is the norm.
      So the MVP is CLOSING-ONLY, which contradicts spec §4.1's two independent
      toggles (recorded in doc-deltas). The user-facing risk was split out as
      VH-33; what remains here is the feature itself.
      Done when: opening assets exist. They will need the same three boundary
      modes as VH-22, mirrored — the onset ramp runs the other way.
      Inherited from VH-43 on its close (2026-08-26): a mono source plus an
      opening mixes channel counts into one audio track — the encoder is
      configured from the source while `feedBrandingAudio` emits at the clip's
      own count, and the opening placeholders are stereo. Unreachable today
      because the opening control is gone and the closings are silent, so it
      was closed by condition; restoring openings revives it.

- [ ] **VH-30 Trim the source** [detail](tickets/VH-30.md) (2026-08-25) [sign-off]
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

- [ ] **VH-48 Stream-copy fast path for "best quality"**
      [detail](tickets/VH-48.md) (2026-08-25) [sign-off]
      Intent: promoted from icebox D10. Leave the source video untouched and
      encode only the branding: the content region becomes generationally
      lossless rather than merely good, and the job near-instant rather than
      the 6.3x real time VH-M2 measured. Rationale §4.3 rejected it on two
      grounds and only ONE has fallen — VH-24 measured the corpus as
      effectively CFR, which was D10's stated revisit trigger, but byte-exact
      codec parameter matching between copied source and encoded branding
      still stands, with silent A/V drift after publication as its failure.
      Done when: scoped and signed off. The deliverable is a `canStreamCopy`
      predicate — already CFR, hard cut, no picture fade, parameters matched —
      not a switch, because VH-25's fades and VH-44's overlay modes each remove
      the conditions that make it safe.

### Standing — maintainer-owned, never band-gated

<!-- Human work, not agent work. It is listed apart from the bands precisely
     so it cannot be read as waiting on one. -->

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

- [ ] **VH-M2 Measure the device envelope** [maintainer] (2026-08-24)
      Intent: spec §7.4 — published limits come from measurement, and this
      is what closes D8.
      Done when: 5 / 20 / 60 minute jobs at 720p and 1080p are timed on a
      managed University laptop, a modern MacBook and a low-spec Windows
      device, and the numbers are recorded.
      First real figure (2026-08-25, this MacBook, via `/spike-real.html`):
      1080p, 215 s of slides with no audio, "best quality" — 34.2 s, or
      **6.3× real time**. Extrapolated, an hour of that material is ~10
      minutes. One device, one content type; the envelope still needs the
      others.
      Note (2026-08-25): the Teams recording is 29.25 minutes, which covers the
      20 minute case. The 60 minute case still needs material as well as a
      device.

- [ ] **VH-14 Deployment** [maintainer] (2026-08-24)
      Intent: GitHub Pages is technically viable and the build is ready for it
      — the app needs no COOP/COEP headers (nothing uses SharedArrayBuffer),
      which is the usual thing that rules Pages out, and asset URLs now derive
      from `import.meta.env.BASE_URL` so a `/<repo>/` subpath works. The
      workflow lives at `.github/workflows/deploy-pages.yml`.
      What is NOT settled is whether it should be published there: a Pages site
      on a personal account is public, it would serve UoN branding from
      `djdaojones.github.io`, and D5 asked for a hosting decision from UoN IT.
      Confirmed 2026-08-25: the deployed site loads and works on a University
      machine, so `github.io` is not filtered. Public hosting accepted for an
      unadvertised pilot; the intended home is an internal server.
      **Every push to `main` deploys** — the workflow carries
      `push: branches: [main]` as well as `workflow_dispatch`, added by the
      session that accepted public hosting. This item said the opposite until
      2026-08-25; nothing here is a separate act of publishing.
      Done when: the move to internal hosting is planned, and the cache
      strategy for offline-after-first-load is in place.

- [ ] **VH-15 Confirm the browser exclusion** [maintainer] [blocked: D4] (2026-08-24)
      Sign-off from UoN IT that Safari below 26 may be excluded. The one
      open decision that would be expensive to reverse.

### Launch milestone

- [ ] **VH-13 Published limits copy** [blocked: VH-M2] (2026-08-24)
      Turn the measured envelope into the user-facing wording. Closes D8.
      Now also waits on VH-31: publishing figures derived from an estimate
      that overstates by 3.6x would publish the same error.

### Icebox

<!-- Post-triage. Deferred deliberately; each has a revisit trigger in
     docs/03-open-decisions.md. -->

- [ ] **D9 Pumping detection on pre-existing audio** — unreliable to
      measure; a false accusation is worse than silence. Revisit if staff
      report a gap the current warnings miss.
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
