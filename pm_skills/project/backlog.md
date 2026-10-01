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
      VH-104's evidence (2026-10-01, the review's "VH-97" section): keep the
      default. Length is not where the page fails; time is — verdicts,
      questions and focus outliving their moment. Revisit after VH-107,
      VH-108 and VH-111 and a pilot session (VH-M4).
      Done when: signed off; then focus lands on the next control at every
      transition, each is announced, every folded stage can be reopened, and
      nothing folds while it shows an error.

### Band 6 — Review, then translate

<!-- Maintainer request, 2026-10-01. Agent work. VH-104's review shipped the
     same day and its findings are VH-106 to VH-114 — cite the U-number in
     `reviews/2026-10-01/uon-video-helper-ux-review-2026-10-01.md` rather than
     restating the evidence here. Ordered: the defect first; then the two
     rank-1 result problems; then what the page says, does and announces over
     time; then controls, the phone path and the words; then VH-105
     translates the settled copy, so nothing is translated twice. -->

- [ ] **VH-106 The Teams recording misses −16 LUFS** (2026-10-01)
      Intent: U-01, rank 1. The 29-minute Teams recording in `samples/` — the
      one VH-M2 timed, and the persona's input — fails output verification
      after the whole encode: delivered −16.857 LUFS against −16 ±0.5, true
      peak −2.92 dBTP (passes). Source −21.27 LUFS and −1.90 dBTP, loudness
      range about 21.9 LU, one silent stretch of 8 min 58 s. Reproduce with
      `/spike-real.html?file=/samples/<the recording>`: `1 FAILURE(S)` in
      234 s. The verification is right to refuse; the gain solve's aim does
      not survive to the file on this recording — the gap VH-83's codec probe
      exists to close.
      Scope: the protected DSP files may be involved; if so the EBU Tech 3341
      harness runs in the same task.
      Done when: this recording lands within tolerance on both outputs and is
      pinned as a real-material regression case; the recordings that pass
      today still pass.
- [ ] **VH-107 The finished video belongs to its own choices** (2026-10-01)
      Intent: U-02 and U-03 (rank 1), U-14 and U-15. The discard question
      outlives the choice it asked about — pressed with the trim in error, it
      threw away the unsaved video and started an untrimmed job with no Cancel
      on screen. A previous file's unsaved video sits under the next file,
      unnamed. A Fade or Slide that fell back to a cut reports success. A
      clean-up failure after a good save is announced as a failed save.
      Done when: any change to the selection retires the discard question and
      restores the result; Discard passes the same gate as Create, and every
      running job shows Cancel; a kept result names its file as the previous
      video; the result says when the closing is not the one chosen; "Saved."
      is never followed by "could not be saved" for the same file. Tested where
      the logic is pure, checked in Chrome otherwise.
- [ ] **VH-108 The Create step says only what is still true** (2026-10-01)
      Intent: U-04, U-05, U-17. "Ready to go", and the sound notes under it,
      stay when the trim is in error (and Create is hidden), after a changed
      preset, after the job, and after a failure. A file pre-flight blocks is
      "read" at step 1, offered steps 2–4, refused only at step 5 — telling a
      user in desktop Chrome to use Chrome — under a note that "None of these
      stop you continuing". A bad time in one trim field silently reverts when
      the other is edited, and Create comes back.
      Done when: a superseded verdict, and its sound notes, are withdrawn or
      marked until the re-check lands; after a job the step leads with the
      outcome; a block is said at step 1, and steps 2–4 do not invite work on
      a file that cannot be made; the decode block's remedy fits the browser
      in use; no "nothing stops you" line under a block; each trim field keeps
      its own pending text and error.
- [ ] **VH-110 Failures say what to do next** (2026-10-01)
      Intent: U-06, U-18. A failed job says "Something went wrong…", says the
      original is unchanged twice, then "You can choose a different one". A
      start-up failure points novices at "WebCodecs video encoding". Errors
      captured shows a stack trace. Cancel reaches only a running job, not a
      long device check or a streaming save.
      Done when: each known failure has its own sentence and a next step that
      fits it — what happened, that the original is safe (once), what to do
      (spec §9.2); a stack sits behind a disclosure under a plain sentence; a
      start-up failure is said at Choose; a long check or save can be
      cancelled and cleans up.
- [ ] **VH-109 Progress that neither freezes nor chatters** (2026-10-01)
      Intent: U-07, U-08, U-22. "Analysing audio — 0%" for the whole analysis;
      "Finishing the file — 100%" before the checks that can still fail
      (U-01); every percent written to the polite live region (WCAG 2.2.4,
      AAA); estimates to the second that differ by a quarter between loads of
      one file; a tab title that says nothing through a long job.
      Done when: a stage with no measured progress shows no percentage; the
      final check is a named stage and 100% means ready; the live region
      announces stages and a few milestones; estimates are rounded; the tab
      title carries the stage and "ready". Spec §9.2's stage names go through
      a doc-delta if they change.
- [ ] **VH-111 Focus and announcements follow the page** (2026-10-01)
      Intent: U-09, U-10. Focus falls to the page body at Create, Cancel,
      finish and "Keep it" — after Cancel the next Tab skips Create. Caption
      loss, the sound notes, a closing that could not load and a failure's
      advice are on screen only; the live line says "Video read. …" or "The
      video could not be created.".
      Done when: focus moves to Cancel on start, back to Create on cancel, and
      to the result on finish or "Keep it"; the read announcement counts what
      will not be carried over and a failure's carries its next step; checked
      with the keyboard and with VoiceOver.
- [ ] **VH-112 Controls look like what they are** (2026-10-01)
      Intent: U-11, U-12, U-13, U-21. Forced colours erase the trim slider and
      the colour choice — no `forced-colors` rule exists. The colour swatches
      read as checkboxes, and the chosen blue one vanishes into its own fill.
      A disabled select looks livelier than an enabled one. "Create the video"
      and "Save the video" are both primary once a video exists. Locked steps
      do not say why.
      Done when: a `forced-colors` block draws the track, handles and checked
      segment in system colours, and `UI-STANDARDS.md` says forced colours are
      checked; swatches show their colour in every state and nothing reads as
      a checkbox; disabled fields read as disabled with the AAA pair kept
      (`test/contrast.test.ts`); one primary action per state; locked steps
      say so.
- [ ] **VH-113 The phone path** (2026-10-01)
      Intent: U-16, U-19, U-20. On an iPhone or iPad the mobile warning can
      be skipped: without `userAgentData` the worker falls back to
      `matchMedia`, which a worker does not have, and calls it a desktop. The
      mobile verdict's heading promises "This will work" over a body saying it
      may stop part-way; the drop hint shows on touch; the time fields'
      decimal keyboard has no colon, while the helper asks for "1:05.5".
      Done when: the device class is decided on the main thread and passed
      in; the mobile verdict leads with the risk of stopping part-way; the drop
      hint hides on a coarse pointer; the time helper fits the keyboard; seen
      on a real Android phone and an iPhone (the maintainer's devices).
- [ ] **VH-114 Plain words, once** (2026-10-01)
      Intent: U-23, U-24, U-25 — the last copy pass before VH-105 translates
      it. "LU", "LUFS" and "re-encoded" in novice copy; four names for
      levelling; "(branded).mp4" whatever was chosen; "about the same size"
      after a trim and "branding still applied" under None; "Ready, with one
      thing to know" over several things; a status line that repeats the
      verdict box; nothing after "Saved.".
      Done when: no unit or codec word on the main path; one name for
      levelling; every claim depends on the job; the status line shows only
      what the box does not, still announcing it; one sentence of what next
      after Saved; `test/screen-text.test.ts` holds any name it pins.
- [ ] **VH-105 The page in Chinese and Bahasa Malaysia** (2026-10-01)
      [sign-off]
      Intent: staff at the Ningbo and Malaysia campuses use the same tool.
      Offer the page in Simplified Chinese (zh-Hans, read at both) and Bahasa
      Malaysia (ms-MY) beside English, chosen on the page — the request floats
      tabbed views. Every string the page can show — labels, stage names,
      live-region announcements, warnings, errors, the browser block — comes
      from one table per language, with no new dependency; the browser's own
      `Intl` formats numbers, sizes and durations. Waits on VH-107 to VH-114:
      each changes words the page shows.
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

- [ ] **VH-M4 Watch staff use it** [maintainer] (2026-10-01)
      Intent: what VH-104 could not judge, listed in the review's "What only a
      person can judge": a pilot session — three to five staff, their own
      recordings, unaided, Choose to Save, thinking aloud — plus screen
      readers, real phones, speech input, Windows high contrast and a managed
      University laptop. The pilot session answers VH-97, and whether "Cut" /
      "None" and "Larger / better" / "Smaller / reduced" mean to staff what
      they mean.
      Done when: at least three staff have been watched end to end, and what
      they stumbled on is filed as backlog items.

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
