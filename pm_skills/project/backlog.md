# Backlog

<!-- OPEN WORK ONLY. Status: [ ] todo  [~] in progress  [-] cut. -->
<!-- Shipped work does NOT stay here. On ship: add one line to
     trajectory.md (the outcome) + an entry to decision-log.md (the why),
     then remove the item from this file. There is no Completed section. -->
<!-- Hot sectional. Agents read the Active section only by default. -->

## Active

### Current milestone — MVP (Band 0, local, no deploy)

<!-- A file goes in; a branded, correctly-levelled, correctly-encoded MP4
     comes out, through a UI a novice can finish. Built in this order:
     the meter is proved before anything depends on it. -->

- [ ] **VH-5 Pre-flight and calibration probe**
      Intent: answer "will this work on this machine, and how long?" with a
      measurement rather than a guess.
      Done when: WebCodecs presence and `canEncodeVideo()` are checked
      against the exact target config; OPFS quota is checked against 2.5x
      the projected output; device class is detected; a 3-second probe on
      the real file yields a throughput figure and a time estimate; and the
      four spec §7.3 outcomes (proceed / warn / block / discourage) each
      resolve correctly.

- [ ] **VH-6 Video pipeline**
      Intent: decode to encode to mux, streaming, with no memory ceiling.
      Done when: a source file produces a valid MP4 in both presets;
      output is conformed to constant frame rate at the rounded average
      rate; the "smaller file" preset preserves resolution up to 1080p and
      downscales only above it; output streams to OPFS through a seekable
      target with `fastStart` set explicitly (never `'in-memory'`, and never
      left undefined for the library to choose); cancel mid-job leaves
      no partial file and no orphaned OPFS data.

- [ ] **VH-7 Audio chain**
      Intent: the spec §5.2 chain, applied in order, transparently.
      Done when: high-pass, conditional macro-levelling (LRA > 9 LU only,
      15 s window, ±6 dB clamp, 1 dB/s slew, freeze below −45 LUFS), 2:1
      compression, a single linear gain and a −2.0 dBTP true-peak limiter
      are implemented as separate tested modules and integrated into pass 2;
      measured output loudness is −16 ±0.5 LUFS and true peak never exceeds
      −2.0 dBTP; a deliberately variable-level recording shows no audible
      pumping and a smooth short-term plot.

- [ ] **VH-8 Branding conform and concatenation**
      Intent: prepend and append approved branding that matches the content.
      Done when: placeholder masters are generated for all four §4.2
      variants; the nearest-frame-rate master is selected, scaled to fit,
      padded with the brand-background token, and re-encoded with the same
      settings as the content; branding audio passes through **unprocessed**
      and is excluded from loudness analysis; a 100 ms fade sits at each
      boundary; durations come from config, never hard-coded.

- [ ] **VH-9 Subtitle, chapter and metadata handling**
      Intent: carry non-A/V tracks through correctly, or fail loudly — never
      lose them silently.
      Done when: file-level metadata tags are read and re-written via
      `getMetadataTags()` / `setMetadataTags()`; a user-supplied sidecar
      `.vtt` is parsed, offset by the opening duration, and muxed in as a
      WebVTT subtitle track; a minimal ISOBMFF `hdlr` scan detects embedded
      subtitle (`sbtl` / `subt` / `text`) and chapter (`tref`/`chap`) tracks
      and warns clearly before processing, naming what the user should do
      instead; cue **content** is never altered.
      Scope: the `hdlr` scan is ours because Mediabunny cannot see subtitle
      tracks at all — verified by round-trip, a subtitle-bearing MP4 reads
      back as zero tracks. Handler types only, no sample parsing.

- [ ] **VH-10 UI workflow**
      Intent: a novice completes the whole job without being taught anything.
      Done when: the spec §9.1 flow works end to end; every §5.4 warning and
      §7.3 outcome renders in plain language; progress shows named stages,
      not one opaque bar; cancel is always available; the result saves via
      the File System Access API with a blob fallback; the AAA design-review
      gate in `UI-STANDARDS.md` passes, with any exception documented.

- [ ] **VH-11 Acceptance verification**
      Intent: prove the MVP against spec §13, not against a vibe.
      Done when: every acceptance criterion reachable without real hardware
      or real UoN material is exercised and recorded — including zero media
      egress under network inspection, clean cancellation, and correct A/V
      sync on a synthesised variable-frame-rate fixture — and the criteria
      that need VH-M1 / VH-M2 are named as outstanding. Carries two checks
      VH-4 could not make headlessly: a rotated source reports upright, and a
      normal-frame-rate source reports its true rate (the browser pane throttles
      timers, so only a degenerate ~1 fps fixture could be produced there).

- [ ] **VH-M1 Provide the real test corpus** [maintainer] (2026-08-24)
      Intent: acceptance criteria 1, 5 and 6 need real material; synthesised
      fixtures prove the mechanics but not the outcome.
      Done when: representative recordings are in `samples/` (gitignored) —
      webcam, PowerPoint screen recording with fine text, talking head,
      mixed speech and music, a variable-frame-rate Teams recording, a 4:3
      legacy recording, and one with badly inconsistent levels.

- [ ] **VH-16 Fixture generator**
      Intent: `npm run fixtures` — the synthetic corpus VH-11 verifies against
      and VH-4's unverified cases need. Named in `DEV-INFRASTRUCTURE.md` but
      not yet written.
      Done when: a script produces slide-like frames with fine text, a
      variable-level speech bed, a deliberately variable-frame-rate clip, a 4:3
      source, and a rotated source; output is gitignored and reproducible.

- [ ] **VH-M2 Measure the device envelope** [maintainer] (2026-08-24)
      Intent: spec §7.4 — published limits come from measurement, and this
      is what closes D8.
      Done when: 5 / 20 / 60 minute jobs at 720p and 1080p are timed on a
      managed University laptop, a modern MacBook and a low-spec Windows
      device, and the numbers are recorded.

### Next milestone

- [ ] **VH-12 Real branding assets** [blocked: D1, D2] (2026-08-24)
      Swap generated placeholders for the rendered After Effects masters
      once the brand colour and durations are confirmed. Placeholders match
      the §4.2 master format so this is a file swap, not a rebuild.

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
- [ ] **EBU Tech 3341 cases 7 and 8** — the authentic-programme segments,
      which the EBU distributes as audio and cannot be synthesised. Would need
      the files checked in as gitignored fixtures. Cases 3-5 already cover the
      same gating behaviour.
- [ ] **TypeScript 7** — blocked on typescript-eslint supporting `>=6.1.0`.
      A one-line change to the pin when it does.
- [ ] **Full embedded-subtitle extraction** — would need a bespoke MP4 box
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
