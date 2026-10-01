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

### Band 5 — The overnight run

<!-- Promoted from the wish-list by the maintainer on 2026-10-01, for the
     gateless run that starts at 02:02, and to be taken in this order. Agent
     work, unblocked. Listed first because it is the only agent work in
     Active that is free to start: Band 3 waits on the maintainer, and
     Band 4's VH-97 is [sign-off] with "not built" as its default. -->

- [ ] **VH-100 A time estimate that counts every stage** (2026-10-01)
      Intent: the pre-flight estimate extrapolates the probe's decode and
      encode, and leaves out the audio chain and the branding conform, so it
      under-reports (from VH-5). VH-99 makes the analysis share a measured
      figure rather than a guess.
      Done when: the estimate includes the audio passes and the branding, a
      test pins each stage's share, and the estimate and the measured job
      time are recorded side by side on at least two real recordings.
- [ ] **VH-101 Drop a video onto the page** (2026-10-01)
      Intent: spec §9.1 step 1 has always asked for "file picker or
      drag-and-drop", and only the picker was built. The 2026-10-01 doc-sync
      kept it in the spec.
      Done when: a video dropped on the Choose step is read exactly as a
      chosen one is (same path, same reset of Trim and the verdict); the file
      input stays the primary, keyboard route; the target follows Carbon's
      file-uploader drop zone, with AAA contrast and a visible drag-over
      state; a non-video or several files are refused in words; a file
      dropped anywhere else never navigates the page away, above all during
      a job; nothing is uploaded; verified in Chrome.
- [ ] **VH-102 One verdict line per spike page** (2026-10-01)
      Intent: `run-in-engines.mjs` reads verdict words in prose, which a
      contrived source file name can fool into a false failure (VH-26
      review). Give every spike page one machine-readable closing line —
      `ALL PASS` or `N FAILURE(S)`, errors counted — and have the runner read
      only that.
      Done when: all eleven spike pages emit the line; the runner exits 1 on
      a failure line and on a page that ends without one; a source named
      "lecture FAIL — retake.mp4" passes; `DEV-INFRASTRUCTURE.md` →
      "Cross-engine verification" says what the line is.
- [ ] **VH-103 Script the rest of the Xerte package** (2026-10-01)
      Intent: `npm run build:xerte` makes the flat build, but
      `README-HOSTING.txt` and the zip named for its build id are still made
      by hand. The recipe is in `DEV-INFRASTRUCTURE.md` → "Xerte package".
      Done when: one command produces the zip, named for the build id,
      holding the flat build and `README-HOSTING.txt`; `check:build` still
      never writes `dist/`; no new dependency without asking.

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
      Open: whether it is wanted at all. Default: not built. Trim shipped
      2026-10-01, so the page is five panels now; decide after using it.
      Done when: signed off; then focus lands on the next control at every
      transition, each is announced, every folded stage can be reopened, and
      nothing folds while it shows an error.

### Band 6 — Review, then translate

<!-- Maintainer request, 2026-10-01. Agent work. Starts once Band 5 has
     landed — VH-101 changes the Choose step, and a review of the page before
     it would review a page about to change. Ordered: the review settles the
     copy, then VH-105 translates it, so nothing is translated twice. -->

- [ ] **VH-104 A UX review of the whole page** (2026-10-01)
      Intent: the page was built item by item — the interface pass, Trim, the
      drop zone — and nobody has walked it end to end as a novice would. Take
      it as one flow: a first-time staff user with a real recording, Choose to
      Save, in Chrome at desktop and phone width, judged against Carbon's
      productive patterns, `UI-STANDARDS.md`, WCAG 2.2 AAA and spec §9.2
      (plain language, named stages, errors that say what to do next). Its
      findings are also the evidence VH-97's open question waits on.
      Done when: a findings report sits in `reviews/<date>/` beside the
      2026-08-26 review, each finding ranked and showing what it saw; every
      finding is a backlog item or set aside with a reason; and what only a
      person can judge — a session with pilot staff — is named for the
      maintainer, not claimed.
- [ ] **VH-105 The page in Chinese and Bahasa Malaysia** (2026-10-01)
      [sign-off]
      Intent: staff at the Ningbo and Malaysia campuses use the same tool.
      Offer the page in Simplified Chinese (zh-Hans, read at both) and Bahasa
      Malaysia (ms-MY) beside English, chosen on the page — the request floats
      tabbed views. Every string the page can show — labels, stage names,
      live-region announcements, warnings, errors, the browser block — comes
      from one table per language, with no new dependency; the browser's own
      `Intl` formats numbers, sizes and durations. Waits on VH-104.
      Scope: the page only. The closing card is approved University media and
      stays as issued (a language variant is D12's governance question); logs
      and the diagnostics bundle stay English, for the maintainer.
      Risks: machine-translated plain language reads as machine translation —
      each language needs a native-speaking reviewer from its campus, whom the
      maintainer sources. `--font-body` and `--font-heading` carry no CJK
      glyphs, so Chinese falls back to whatever the OS picks until a token
      names one. Longer Malay and denser Chinese both test phone width.
      Open: the form of the switch. Carbon's Tabs separate different content;
      the same content in another form is its content switcher. Default: a
      content switcher at the top of the page, each option labelled in its own
      language and script.
      Done when: signed off; then a test fails if any table lacks a key
      English has; switching re-renders the page and its `lang` without
      losing the video, the trim or a running job; the choice is remembered
      per browser and nothing about it leaves the device; each language is
      signed off by its reviewer; spec §9 is amended through a doc-delta;
      verified in Chrome at desktop and phone width.

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
