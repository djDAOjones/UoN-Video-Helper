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

- [ ] **VH-83 The AAC round trip costs loudness nobody is compensating** (2026-08-28)
      Intent: the chain solves for the target and the codec then moves it, and
      nothing models that. **Measured 2026-08-28 on `AMCS3059`:** the chain
      solved -16.06 LUFS (`limitedLufs`), the delivered file measures
      **-16.44** — 0.38 LU lost to AAC, 88% of the +/-0.5 budget spent after
      the only stage that aims. It passes, and it would not survive a slightly
      worse round trip.
      The same run shows the other half: true peak came out -2.969 dBTP against
      a -2.0 ceiling, so `ENCODE_TRUE_PEAK_HEADROOM_DB`'s full 1.0 dB was held
      and the file's actual overshoot was ~0.03 dB.
      Done when: the gain solve aims at a target corrected by the codec's
      measured cost — one encode/decode round trip of a short excerpt at the
      job's exact audio config gives both figures — and the four real corpus
      files land closer to -16.00 than they do now, with none worse.
      Risk: this changes the stage VH-50 fixed by measurement. Nothing ships
      without re-measuring all four real files, not just the synthetic corpus.
      Note: `BEST_SOURCE_BLEND` (0.5, the only value in VH-47's rule with no
      number behind it) is a VIDEO-bitrate question needing its own experiment;
      it was scoped in here by mistake and belongs on its own.

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
      Portrait found and FIXED 2026-08-28: every portrait phone upload died on
      `Video sample size must remain constant`, because the encoder's guard
      runs on the arriving sample, before the transform that would have
      normalised it. Guarded by acceptance criterion 1. See decision-log.
      Remaining, and the only part that needs a person: **Firefox**. The
      question there is whether an undecodable HEVC source hits VH-60's
      `no-source-decode` block cleanly, not whether the colour is right.
      Done when: an iPhone HEVC file is opened in Firefox and either decodes or
      is refused with the block's own wording rather than failing mid-job.

### Band 4 — The interface pass

<!-- Maintainer request, 2026-09-30: one list of interface changes, split so
     each item ships alone. Agent work, unblocked except where flagged. The
     ORDER is proposed, not committed — as is whether the band runs ahead of
     Band 2's VH-83: the defect first; then words and disclosures, which
     disturb no structure; then the closing controls; then the layout they sit
     in; then the restyle, once, over the finished structure; then the two
     capabilities. VH-83 and VH-95 both rework `planAudio` — in series, never
     side by side, VH-83 first.
     Four items reverse a recorded decision at the maintainer's word, and each
     names it so the older entry is not read as binding: VH-86 (spec §8's
     sidecar), VH-89 (VH-31), VH-90 (VH-46b), VH-30 (the identity's "no
     trimming").
     Four have prior art on tag `archive/repository-review-implementation`,
     left behind on 2026-08-27 with the conveyor UI it arrived in: VH-94,
     VH-88, VH-97 and VH-78. Recover with `git show <tag>:<path>`; do not
     redesign.
     "Open:" is a question for the maintainer with a working default — the
     default is what gets built if nobody answers. -->

- [ ] **VH-88 System check, collapsed — and the status line moves** (2026-09-30)
      Intent: the System check panel becomes a disclosure that starts closed.
      Risk: `#status` lives inside it, and is both the app's one live region
      and its only visible status text — "Reading the video…", "Encoding video
      — 34%", "Saved." Inside a closed `<details>` it is neither announced nor
      seen. It is badly placed already, 450 px below the button it reports on,
      and greets every user with "Ready for the next milestone" — a build
      note. It moves out, to sit with the controls it describes.
      And a FAILED check must not hide: the summary states the result in words
      ("System check — all passed" / "— 1 problem") and opens itself on any
      failure.
      Prior art: the archived branch did both halves — `<details class="panel
      system-check">`, the status line inside the workflow panel, "Choose a
      video to begin." as its resting text.
      Done when: closed on a healthy device, open on a failing one; the result
      readable from the summary without colour; status text visible without
      scrolling to the footer; a screen reader still hears "Video read…", the
      stage, and "Your video is ready."

- [ ] **VH-89 Ready to go, in three lines** (2026-09-30)
      Intent: a `proceed` verdict reads "Ready to go" / "This should take
      about 37 seconds." / "Estimated size 28.5 MB." The Setting, Output and
      Measured speed rows leave the screen and stay in the diagnostics log.
      Reverses VH-31, which added "at most" on purpose: the figure is an upper
      bound, and a bare number reads as a prediction — 27.7 MB was shown for a
      7.5 MB file then, and 13.8 MB for a 7.2 MB one on 2026-09-30.
      Open: "Estimated size 28.5 MB." as asked, or "Estimated size up to
      28.5 MB." Default: "up to" — two words, and the screen stays true.
      Scope: `warn` and `discourage` keep their reasons and end on the same
      two lines, the time stated once — today a `warn` for unknown storage
      shows no time at all. A `block` shows neither. The "already compressed,
      about the same size" note (VH-41) stays; the user acts on it.
      Done when: a `proceed` shows three lines and nothing else, and no other
      outcome loses a sentence it has today.

- [ ] **VH-90 Closing branding: type, onset, colour** [detail](tickets/VH-90.md)
      (2026-09-30)
      Intent: the four-way radio and its hidden options become three controls,
      always present: "Animation type" (Cut, Fade, Slide, None), "Animation
      onset" (Over existing, Over generated freeze frame, with a "?" that
      explains both), and a Blue / White colour toggle. Onset is disabled
      under Cut and None; colour under None. No pipeline change — a pure,
      tested mapping onto `BrandingChoice`.
      Reverses VH-46b twice at the maintainer's word: it rejected a select,
      and it hid Animation rather than disabling it.
      Risk: under "Animation type", "None" reads as "no animation" — which is
      what Cut is — and it removes the University closing altogether. One line
      under the controls states the result of the current selection in words,
      which also restores what the old options said: what happens to the last
      second, and how many seconds are added.
      Done when: every combination produces the job its old radio did;
      defaults unchanged (Cut, blue); the "?" works by click and keyboard,
      never hover alone; a disabled control says why in visible text.

- [ ] **VH-91 Steps that read as steps** [detail](tickets/VH-91.md)
      (2026-09-30)
      Intent: closing branding and file size / quality — and trim, when it
      lands — stop being fieldsets stacked in one panel headed "Choose a
      video" and become separate, numbered panels ending in Create. They stay
      open; whether finished STAGES fold is VH-97, which folds these panels,
      so nothing here is thrown away by it.
      The request floated sections that advance "when info was added". For
      these steps that is the wrong trigger: each holds a safe default, so
      nothing is "added"; a select or radio changes on every arrow key, so
      advancing on change would shut the section under a keyboard user
      mid-choice (WCAG 3.2.2); and a closed step hides its choice.
      Revisits VH-32 ("the simplicity is the design"), consistently — VH-32
      named trim as the one thing that would justify more structure.
      Done when: each step is a labelled region with a numbered heading; focus
      order follows visual order; Create holds the verdict, button, progress,
      status and result together; nothing moves focus or collapses unasked.

- [ ] **VH-92 Look like the University** [detail](tickets/VH-92.md)
      (2026-09-30)
      Intent: take the visual cues from <https://www.nottingham.ac.uk/> and
      its brand pages, read 2026-09-30 — a Nottingham Blue header and footer
      with the white logo top-left, Nottingham Blue text in place of black, a
      tinted ground rather than white, Lora headings.
      The brand's rules agree with this project's: it prefers AAA, and
      sentence case. The palette builds a whole AAA theme (measured, in the
      ticket) except for status — Jubilee Red is 6.4:1 on white, so error red
      stays Carbon's. Brand tokens own colour and typeface; Carbon keeps
      shape, spacing and states.
      Constraints: Circular, the brand's sans, is licensed and this repository
      is public, so it cannot be committed — the brand's own substitute is
      Arial. Lora is OFL and self-hosted; nothing is fetched from a third
      party. Every new file lands flat in the Xerte package.
      Open: the logo file. Default: the maintainer supplies it from the brand
      library; nothing is copied off the website. All else ships without it.
      Done when: `test/contrast.test.ts` covers the brand pairs in both
      themes; the logo keeps its exclusion zone and carries `alt="University
      of Nottingham"`; focus is visible on the blue band; `UI-STANDARDS.md`'s
      token section, which still calls D1 open, is corrected.

- [ ] **VH-93 A feedback button** [detail](tickets/VH-93.md) (2026-09-30)
      [sign-off]
      Intent: a button opens a text box and Send; the message and the usage
      logs reach `joe.bell@nottingham.ac.uk`.
      Two facts collide with it. The app is static files, so it cannot send
      mail. And "no media egress" forbids any call carrying filenames or media
      characteristics, while the logs usefully carry resolution, duration and
      codec.
      Open: how it is sent. Default, and the recommendation: a `mailto:` link
      — the user's own mail app opens with the message and a compact redacted
      log in it; they read every word and press send. No request leaves the
      app, so the invariant and criterion 9 stand. The alternative is a relay
      endpoint: one click, but the app's first outbound request with a body,
      at a URL that is either a credential in a public repository or a door
      anyone can post through.
      Done when: signed off; the user sees exactly what will be sent; opening
      the mail app neither trips the leave warning nor disturbs a running job;
      it works inside the Xerte frame; the production redaction review is
      recorded; the address lives in `src/config/`.

- [ ] **VH-30 Trim the source, with a preview** [detail](tickets/VH-30.md)
      (2026-08-25) [sign-off]
      Intent: maintainer request, renewed 2026-09-30 with a shape — a preview
      of the video with handles for the start and end, before export.
      Recordings carry material nobody wants, and today the only fix is
      another tool first, which defeats a one-step app.
      Feasible, and viable. No new dependency: ranged reads are native to
      Mediabunny and the probe already uses them. No egress: the preview is a
      `<video>` on a local object URL. Frame accuracy is free, because the
      pipeline re-encodes anyway. It is the largest item in the band, and it
      runs through the most recently stabilised part of the pipeline — the
      shared clock of VH-74 and VH-55.
      Reverses the product identity: "no trimming" is in `AGENTS.md`, the
      brief and spec §12. It stays a conveyor with one cut — no cutting
      mid-video, no joining — but all three have to say so; that is what the
      sign-off is for.
      Done when: signed off, the identity wording agreed, and its children —
      VH-95, then VH-96 — shipped or cut.

- [ ] **VH-95 Trim: the engine** [detail](tickets/VH-95.md) (2026-09-30)
      [blocked: VH-30]
      Intent: a kept range, in source time, carried by `preflight` and
      `process` and honoured by everything that reads the source — no UI.
      The part that produces a wrong file rather than a wrong duration is
      loudness: every audio pass must traverse the SAME range, or leading
      silence drags the gated figure and the envelope is indexed against a
      different stream from the one it is applied to. The ticket lists the
      other touchpoints. After VH-83, never beside it.
      Done when: the acceptance harness runs a trimmed job that passes
      criterion 2 (−16 ±0.5 LUFS, on the kept region) and criterion 6 (A/V
      sync); a job with no range takes exactly today's path; cancel still
      leaves nothing behind.

- [ ] **VH-96 Trim: the preview and handles** [detail](tickets/VH-96.md)
      (2026-09-30) [blocked: VH-95]
      Intent: a Trim step in VH-91's layout — the video, playable, with a
      start and an end handle beneath it. Left alone, it keeps the whole
      video, as today.
      Accessibility decides the shape: the handles are never drag-only (WCAG
      2.5.7). Each is a native range input on the arrow keys, paired with a
      time field and a "Set start here" / "Set end here" button that takes the
      preview's current position.
      Risk: what `<video>` can play is not what WebCodecs can decode. Where
      the preview cannot show, the fields still work and the step says so.
      Done when: a trim can be set, changed and cleared by keyboard alone; the
      verdict, time and size follow the kept range; the exported file's first
      and last frames are the ones the preview showed, across the corpus;
      criterion 9 still reads zero.

- [ ] **VH-97 Fold the finished stages** (2026-09-30) [sign-off]
      Intent: the expanding and contracting the request floated, done where it
      is safe — between STAGES, not between choices. Choose, set up, create,
      save: one open at a time, a finished one folding to a line that says
      what was chosen. It advances only on something the user did or is
      waiting for — a video read, Create pressed, the job finished — never on
      a changed control.
      Prior art: the archived branch built and tested exactly this
      (`src/ui/workflow.ts`, `focusNextWorkflowControl`); VH-32 declined it on
      2026-08-27 in favour of the single screen. Detail is in
      [VH-91's ticket](tickets/VH-91.md).
      Open: whether it is wanted at all. Default: not built. Decide after
      using VH-91's panels with trim in them; the page may be short enough.
      Done when: signed off; then focus lands on the next control at every
      transition, each is announced, every folded stage can be reopened, and
      nothing folds while it shows an error.

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
      2026-09-21: the maintainer is uploading it to Xerte by hand, as a flat,
      relocatable package from `npm run build:xerte` (DEV-INFRASTRUCTURE.md ->
      "Xerte package"); first zip `v0.1.0+20260921.899a448`. Making it found
      every closing 404'ing under a relative base — fixed, see decision-log.
      Still open: the cache strategy, and whether Pages stays up once Xerte is
      live.
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
- [ ] **VH-82 `inspectFile` runs three times per job** (2026-08-28)
      Measured out 2026-08-28, not done. The cost was the 64 MB slicing, and
      VH-81 removed it: an inspect is now 7-18 ms on 18-28 MB files and
      **34-57 ms on a 4.55 GB one**, so three of them cost ~130 ms of a job
      measured in minutes. What remains is a bounded 256-packet frame-rate
      probe, not something that scales with the file.
      Revisit if inspect ever appears in a profile, or if a stage needs the
      report for a reason other than speed.
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
