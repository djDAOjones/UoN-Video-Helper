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
     uncancellable job, a wrong boundary, a brand risk — so they lead. VH-24,
     VH-41, VH-31 and VH-19 are then ONE visit to the output shape and what we
     claim about it, not a queue; VH-43 proves odd sources survive it. VH-32 is
     LAST because it must lay out what everything above it decides.
     VH-34..VH-40 came from an external code review, 2026-08-25; its findings
     were verified against the source before being written up. -->

- [ ] **VH-44 The closing transitions are wrong in Firefox**
      [detail](tickets/VH-44.md) (2026-08-25)
      Intent: VH-34 measured it and the answer was yes — moving the blend to the
      CPU did not escape the engines' disagreement, it moved it one step later,
      to `compose()`'s `getImageData` readback. In Firefox the blue onset comes
      back 3.7x too bright and the white one OVERFLOWS AND WRAPS, so a white
      closing over dark picture inverts rather than glowing. Neither alternative
      route is portable either: `VideoSample.copyTo` is correct in Chrome and
      Firefox but returns the luma plane in Safari, which ignores the requested
      format silently. Numbers are in the ticket and in decision-log
      2026-08-25 "VH-34 spike".
      Done when: the branding pixels reach `compositePremultiplied` unchanged in
      all three engines — probed at startup against a known branding frame, the
      shape `capability.ts` already uses, refusing the overlay modes loudly if
      no route matches — and a regression test pins the expected RGBA per route.
      Note: the live exposure is closed. VH-45 withdrew both controls on
      2026-08-25 and the push deployed itself, verified on the deployed site —
      no mode or style inputs remain in the DOM, so every job takes the hard
      cut. That is a holding action, not the fix: restoring the two modes to
      the UI is part of this item, and spec §4.1 carries a doc-delta until it
      happens.

- [ ] **VH-42 The closing keys off the wrong duration** (2026-08-25)
      Intent: split from VH-24. `pipeline.ts:289` derives `overlayFrom` from
      `durationSeconds`, which `inspect.ts:287` sets to `max(video, audio)`. So
      audio running more than a second past the picture silently composites no
      build at all — `sourceTime` never reaches the overlay point — and the same
      figure opens a video gap before the closing. A source shorter than the
      1.00 s build computes a negative start (inherited from VH-22 on its close).
      Both are the same defect: a branding boundary measured against a duration
      that is not the picture's.
      Done when: the boundary keys off the video duration, a source shorter than
      the build degrades to `over-freeze` and says so rather than erroring, and
      an audio-longer-than-video fixture proves the build still composites.

- [ ] **VH-31 The size estimate is ~3.6x too high** [detail](tickets/VH-31.md)
      (2026-08-25)
      Intent: the app said 27.7 MB and produced 7.5 MB on the first real file
      anyone ran. `projectedOutputBytes` assumes the encoder spends its whole
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

- [ ] **VH-43 Odd source shapes reach a correct output**
      [detail](tickets/VH-43.md) (2026-08-25)
      Intent: split from VH-24, and mostly verification rather than known
      breakage. The ticket file is the corpus characterisation the whole VH-24
      family rests on; it kept its content and took this item's name when VH-24
      shipped, because VH-43 is the open item still standing on it. The corpus carries one mono
      source, one PCM `.mov`, sample rates split nine/nine between 44.1 and
      48 kHz, three files at 852×480 (not 854, awkward for chroma subsampling),
      one at 640×480, and one 3840×2400 — 16:10, not 16:9, which the branding
      composite has never been fed.
      Done when: each reaches a correct output without distortion or resampling
      artefacts, and each is pinned by a named fixture.
      Note: a mono source plus an opening also mixes channel counts into one
      track — the encoder is configured from the source (`pipeline.ts:235`) while
      `feedBrandingAudio` emits at the clip's own count, and the opening
      placeholders are stereo. Latent only: VH-33 removes the control and the
      real masters are silent by decision, so fix it here or record it as closed.

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

- [ ] **VH-16 Extend the acceptance harness** (2026-08-25)
      Intent: the harness from VH-11 covers what it covers; two gaps are known.
      Done when: it runs the pipeline in a worker as well as on the main thread
      (today it exercises the `createWritable` path, not the sync-handle path
      the app actually uses), preset comparison is done on camera-like motion,
      where the two presets can actually differ, and the loudness window stops
      deriving its offset from `BRANDING_DURATIONS.openingSeconds`
      (`run.ts:66`) — the pipeline insists on the clip's *actual* duration, and
      the two agree only because the placeholder happens to be exactly 5.000 s.

- [ ] **VH-20 Flush the audio chain's tail**
      Intent: the limiter delays by its 5 ms look-ahead, and the streaming path
      never flushes it, so the output loses roughly 5 ms from the end of the
      audio. Inaudible on a lecture that ends in silence; still undocumented
      behaviour rather than a decision.
      Done when: either the tail is emitted as a final sample, or the loss is
      measured, judged acceptable, and recorded in the spec-facing notes.

- [ ] **VH-17 Evaluate `fastStart: 'reserve'` for the smaller preset**
      Intent: the "smaller file" preset goes to OneDrive and SharePoint, where
      students may stream it. `fastStart: false` puts the moov box at the end,
      which can force a full download before playback starts.
      Done when: either `'reserve'` is adopted with a packet count derived from
      the CFR grid plus a safe margin and verified on a real SharePoint upload,
      or the current behaviour is confirmed adequate and the reason recorded.
      Scope: `'in-memory'` is not an option — it reinstates the memory ceiling.

- [ ] **VH-37 Failures report themselves dishonestly** (2026-08-25)
      Intent: two small defects that turn a known cause into "Something went
      wrong". `InvalidVttError` is special-cased in `handleInspect` and
      `handlePreflight`, neither of which touches VTT, and is missing from
      `handleProcess` where `offsetVtt` actually throws — so a malformed sidecar
      surfaces as the generic message. And `Promise.all([feedVideo(), feedAudio()])`
      (`pipeline.ts:431`) has no mutual abort, so when one lane throws the other
      keeps pushing into a cancelling `Output`; its later rejection is unhandled,
      and `diagnostics.ts` hooks `unhandledrejection`, so the user gets the real
      error plus a spurious entry in the errors panel.
      Done when: a bad sidecar names itself, and one lane failing settles the
      other instead of producing a second error.

- [ ] **VH-38 The one-hour ceiling nobody decided** (2026-08-25)
      Intent: the `process` request carries a 3,600,000 ms client timeout
      (`main.ts:516`) that rejects **without** sending `cancel`. Preflight only
      *discourages* jobs it estimates above an hour, so one can start. The worker
      then keeps encoding, its result lands in the `finished` map and is never
      released, and the user is told the job did not finish. Spec §7 opens with
      "no arbitrary file-size or duration cap"; this is one, by the back door.
      Done when: a long job either completes or is cancelled for a stated reason,
      and nothing is retained after a client-side give-up. How likely this is
      remains unknown until VH-M2 measures the slow devices — at the one
      measured figure (6.3× real time) an hour of source takes ten minutes, but
      a device at 0.5× real time would trip it on a 30-minute lecture.

- [ ] **VH-39 Stale claims in code and docs** (2026-08-25)
      Intent: `README.md` — the public front door of a deployed app — still says
      "Foundation set, build not started". `branding.ts:5` says the transition
      modes are "not built yet (VH-22)"; they are built. `presets.ts:147`
      comments `avc1.640033` as "level 4.2"; `0x33` is 51, so it is level 5.1 —
      the code is right and covers 4K, and 4.2 would not.
      Done when: each reads true. `public/branding/README.md`'s browser-support
      claim is VH-34's to settle, not this item's.

- [ ] **VH-40 Build and publish hygiene** (2026-08-25)
      Intent: three things the pilot ships without having decided to. `npm run
      check` runs `build` **before** `check:placeholders`, so the spike-fixture
      guard — the single best safeguard for the no-egress invariant — fires only
      after `dist/` already contains the recording, and a bare `npm run build` is
      unguarded entirely. `dist/` publishes `branding/README.md` (maintainer
      notes and ticket IDs) and full sourcemaps. And the worker never calls
      `setMinimumLogLevel('info')` — only `main.ts:32` does — so worker debug
      lines reach a production console.
      Checked against the live site 2026-08-25: the spike pages do NOT ship —
      `rollupOptions.input` names `index.html` alone, and every `spike-*.html`
      404s, so that third claim was wrong. `branding/README.md` and
      `assets/app-*.js.map` both return 200; those two hold.
      Done when: the guard runs before anything is written, what ships is what
      was meant to ship, and both threads log at the same level.

### Band 3 — New capability, or waiting on material

<!-- Not committed, and none of it can start today: two wait on assets that
     do not exist, one on a scoping pass. -->

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
