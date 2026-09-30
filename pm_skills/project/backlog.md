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
     implementation branch; VH-71 was their umbrella and closed with VH-19
     on 2026-09-30, and VH-78 waits in the Icebox. Band 2 closed the same day
     with VH-83.
     Both sets were re-verified against source before banding, and where a
     review's own remedy was shown unsafe the item says so. -->

### Band 3 — Blocked on the maintainer

<!-- Agent work that cannot start until something arrives from outside the
     repository: a corpus, a test result, a sign-off. Listed apart from the
     agent bands so nothing here reads as available to pick up, and apart from Standing
     because the WORK is mine — only the unblocking is not. This band replaces
     the old Band 1b, which existed for maintainer DECISIONS and emptied on
     2026-08-27 when VH-49, VH-46b, VH-31, VH-25 and VH-32 all closed. -->

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

### Band 4 — The interface pass

<!-- Maintainer request, 2026-09-30: one list of interface changes, split so
     each item ships alone. Agent work, unblocked except where flagged. The
     ORDER is proposed, not committed — as is whether the band runs ahead of
     Band 2's VH-83: the defect first; then words and disclosures, which
     disturb no structure; then the closing controls; then the layout they sit
     in; then the restyle, once, over the finished structure; then the two
     capabilities. VH-83 shipped 2026-09-30, so VH-95 now has
     `planAudio` to itself.
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

- [ ] **VH-97 Fold the finished stages** [detail](tickets/VH-97.md)
      (2026-09-30) [sign-off]
      Intent: the expanding and contracting the request floated, done where it
      is safe — between STAGES, not between choices. Choose, set up, create,
      save: one open at a time, a finished one folding to a line that says
      what was chosen. It advances only on something the user did or is
      waiting for — a video read, Create pressed, the job finished — never on
      a changed control.
      Prior art: the archived branch built and tested exactly this
      (`src/ui/workflow.ts`, `focusNextWorkflowControl`); VH-32 declined it on
      2026-08-27 in favour of the single screen. VH-91 shipped the panels it
      would fold, 2026-09-30.
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
