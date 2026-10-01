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

### Band 6 — Review, then translate

<!-- Maintainer request, 2026-10-01. Agent work. VH-104's review shipped the
     same day and its findings are VH-106 to VH-114 — cite the U-number in
     `reviews/2026-10-01/uon-video-helper-ux-review-2026-10-01.md` rather than
     restating the evidence here. Ordered: the defect first; then the two
     rank-1 result problems; then what the page says, does and announces over
     time; then controls, the phone path and the words; then VH-105
     translates the settled copy, so nothing is translated twice.
     Maintainer 2026-10-01, after VH-108 shipped: VH-114 (shipped), then VH-115
     (Band 7, closed as a spike → VH-122), then VH-109 and VH-110 (shipped) and the rest in order (VH-106 to VH-108 and VH-114
     shipped the same day): the spec gap review
     (`reviews/2026-10-01/spec-ux-accessibility-gaps-2026-10-01.md`) added a
     clause to each item's "Done when", the maintainer signed off every spec
     correction and the spec now carries them (doc-sync 2026-10-01), so each
     item builds to the spec as written. Band 4 closed with VH-97's sign-off
     as not built (Icebox). -->

- [ ] **VH-123 Two review leftovers from the Band 6 run** (2026-10-01)
      Intent: Codex sol on VH-108's follow-up: the storage block's "keep less
      of the video, or choose Smaller / reduced" is also said when another
      block hides those steps — make it conditional on the setup steps staying.
      On VH-114's follow-up: `suggestedFileName` marks a silent, closing-less
      job "(converted)" even if an opening were applied — moot while openings
      are withdrawn (VH-23), but pass the applied branding rather than
      `closing` alone when VH-23 returns. Also rerun codex sol on 8c57e57
      (VH-109); its review had not landed when the session paused.
      Done when: both wordings depend on what is actually on screen and in the
      file, and the VH-109 review is read.

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
      Spec gap review 2026-10-01 (A-07, A-14): on finish, focus moves only
      when the transition displaced it, never from where a user is reading or
      out of the modal; every self-removing control — Create, Cancel, Keep it,
      Discard, Use the whole video, Save — has a named hand-on; pre-flight
      sound notes, output warnings, a missing or substituted closing, the
      caption consequence and each save outcome are announced.

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
      Spec gap review 2026-10-01 (A-08, A-09): a measure token bounds every
      run of body text at about 70 characters and `UI-STANDARDS.md` →
      Perceivable carries 1.4.8's five measures; `UI-STANDARDS.md` → Operable
      states 2.4.13, and the rendered focus indicator of every control —
      buttons, segments, thumbs, dialog — is checked for area and changed-
      pixel contrast in each colour context, forced colours included.

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
      Spec gap review 2026-10-01 (A-03, A-04): the download route's sentence
      names where the file lands (Files → Downloads on an iPhone), checked on
      the devices; backgrounding, a released wake lock and returning to the
      tab are seen through on both.

- [ ] **VH-105 The page in Chinese and Bahasa Malaysia** (2026-10-01)
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
      Signed off 2026-10-01: a content switcher at the top of the page, each
      option labelled in its own language and script (Carbon's Tabs separate
      different content; the same content in another form is its content
      switcher). The native-speaking reviewers are the maintainer's to source.
      Done when: a test fails if any table lacks a key
      English has; switching re-renders the page and its `lang` without
      losing the video, the trim or a running job; the choice is remembered
      per browser and nothing about it leaves the device; each language is
      signed off by its reviewer; spec §9 is amended through a doc-delta;
      verified in Chrome at desktop and phone width.
      Spec gap review 2026-10-01 (A-17): each switcher option carries its own
      `lang` and the switcher exposes its selected state to keyboard, touch
      and speech; passages kept in English are marked, names and technical
      terms excepted; switching keeps focus, a pending trim error, every
      choice, an unsaved result and a feedback draft, and announces itself;
      the `<title>`, `aria-valuetext`, the suggested file name and every live-
      region string are in the table; a displayed time parses when typed back;
      Chinese wrapping and the 40-glyph measure are verified with a chosen CJK
      face; the preference store failing is handled, as is a missing
      `Intl.DurationFormat`; the sentence-case rule is stated per language.


### Band 7 — Measured, not yet fixed

<!-- Wish-list triage, 2026-10-01: two problems VH-99 and VH-100 measured and
     parked. Agent work that touches no page, so neither waits on Band 6's
     copy; ordered by what a user would notice first. -->

- [ ] **VH-122 Decode damage is silenced and said** (2026-10-01)
      Intent: VH-115's finding. CULT2011 decodes bursts far above full scale
      (+58 dBTP, 2,177 clipped samples; 568 remain after the one at 82.4 s is
      cut out). They read as +28 LUFS integrated and LRA 40, so pre-flight
      says the microphone was too high and the volume varies — both untrue —
      macro-levelling switches on and clamps at +6 dB, and the output carries
      a 60 ms blast at −5 dBFS with a 4 LU dip for two seconds after it. See
      decision-log 2026-10-01.
      Done when: samples a decoder cannot have produced from a real recording
      are detected (threshold in `src/config/audio.ts`), silenced before
      analysis and processing, and announced in a warning of their own with
      the time; the §5.4 row lands through a doc-delta; CULT2011's clipping
      and highly-variable warnings no longer fire and its output has no blast
      or dip; the EBU harness runs if a protected file changes.
- [ ] **VH-116 A video estimate that holds still** (2026-10-01)
      Intent: the 3 s video probe is now the time estimate's main error —
      PHIL read 104 fps on one run and 187 on another, and real encodes ran at
      0.5–1.8× the probe's figure (VH-100's table). VH-31 refused a longer
      probe; a warm-up before timing, or a correction from the job's own early
      frames, are untried. VH-13's published limits read through this
      estimate, and VH-109's rounding hides the swing without narrowing it.
      Done when: both remedies are measured against VH-100's recordings
      without lengthening pre-flight, and the chosen one narrows the spread,
      or the reason neither does is recorded.

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
      Spec gap review 2026-10-01 (A-02, A-08, A-13, A-15): until spec §13's
      criterion 10 is signed, this item owns the walk — every state Choose to
      Save, keyboard-only, NVDA + Chrome, VoiceOver + Safari, a Windows
      contrast theme, 200% and 320 px, each language — with each AAA exception
      recorded under §9.3, the preview's partial-conformance statement
      evidenced, feedback exercised in blocked and running states (modal focus
      return, a kept draft, no email handler, a failed clipboard), and the
      phone and speech-input checks each completed or deferred in writing.
      Maintainer 2026-10-01: the GUI check is wider than WCAG — it also judges
      design and layout against Carbon's productive patterns, clarity of
      language and of the process (does a first-time user know what to do next
      at every step), the word count (every sentence earns its place), and
      distraction (nothing on screen competes with the one thing to do now);
      each judged by a person, with what fails filed as backlog items.


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
      Triage 2026-10-01: the branding clips are fetched per job with no cache
      today, so they are most of what offline-after-first-load has to hold;
      the worker is 116 kB gzipped and needs no splitting for it.
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

- [ ] **VH-97 Fold the finished stages** [detail](tickets/VH-97.md)
      (2026-09-30)
      Intent: choose, set up, create, save — one stage open at a time, a
      finished one folding to a line that says what was chosen, advancing only
      on something the user did or is waiting for. Prior art on the archive
      tag (`src/ui/workflow.ts`); VH-32 declined it for the single screen.
      Signed off 2026-10-01 as **not built**: VH-104 found the page fails in
      time, not length, and folding would hide that. Revisit after VH-107,
      VH-108 and VH-111 and the pilot session (VH-M4), if staff are seen
      hunting for Create or Save.
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
      same gating behaviour. Fetch the EBU's signal files for cases 20-23 in
      the same pass: they are separate true-peak signals, and they pass today
      on a reading of "continuous in phase at both sides of the single period"
      that Table 1 does not define (triage 2026-10-01).
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
- [ ] **VH-117 The 4K branding path's cost** (2026-10-01)
      Intent: every closing-tail frame is redrawn through a canvas to pad it
      in brand colour, and the onset is blended on the CPU. Fine at 1080p;
      the 2160p masters have landed, and VH-M2 measures only to 1080p.
      Revisit when a 4K source reaches the pilot, or branding shows in a
      profile — measure before proposing a change.
- [ ] **VH-118 `BEST_SOURCE_BLEND` has nothing measured behind it**
      (2026-10-01)
      Intent: the one number in VH-47's bitrate rule that was set, not
      measured (0.5, `src/config/presets.ts`). Settling it is a video
      experiment — encode the probe sample at a spread of blends and score
      each — and was parked on VH-83 by mistake.
      Revisit when "Best quality" sizes draw a complaint, or a scoring tool is
      to hand.
- [ ] **VH-119 Skip true peak in the B and B′ planning passes**
      (2026-10-01)
      Intent: they read only integrated loudness, and the detector is 9% of
      planning (measured 2026-10-01, VH-99). Means reshaping `traverse` in
      `audio-plan.ts`; warnings, gain and output must not move on the real
      corpus.
      Revisit when planning time on long recordings draws a complaint.
- [ ] **VH-120 A gain-solve step that anticipates the limiter**
      (2026-10-01)
      Intent: five of six real recordings pay all three refinement passes, at
      17–21 s an hour each (VH-99). A step that anticipates the limiter's
      take-back could save one; it moves the solver's convergence, so it is a
      design item, not a tweak.
      Revisit after VH-106, which may reshape the solver first.

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
