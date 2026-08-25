# Decision Log

<!-- Append new decisions at the top. Don't edit old entries. -->
<!-- Use this during the design phase of each task to record what you chose and why. -->
<!-- Hot sectional. Agents scan the latest 10 HEADINGS by default and
     open only the bodies relevant to the task. -->
<!-- Keep each entry tight: Decision / Rationale / Alternatives, not an essay.
     The live log is budgeted by WORDS as well as entry count (see
     pm_skills/memory-policy.md), so verbose entries trip a prune sooner. -->
<!-- This is the home of the WHY. The backlog/trajectory only point here;
     never paste an entry's prose into those files. -->
<!-- Append-only: when archiving, move entries verbatim. Never rewrite. -->

## 2026-08-25 — VH-24 and VH-41: one visit to the output shape

**Decision:** Two rules the spec already carried and the code did not.
`conformedFrameRate` stops rounding upward below the lowest standard rate, and
`outputShapeFor` caps the smaller preset's request at the source's measured
video bitrate. `inspect` gained `averageBitrateBps` from
`computePacketStats`, and `OutputShape` gained `requestedVideoBitrateBps` so
the cap can be seen rather than inferred.

**Rationale:** the doc-sync put both corrected rules in the spec on 2026-08-25
and deliberately let the spec lead the code by one band. This is that band.
Measuring the bitrate rather than reading the container's declared figure is
the same discipline the frame rate already follows, and for the same reason —
the corpus contains files whose headers say things that are not true.

**The asymmetry is deliberate:** the cap applies to "Smaller file" and not to
"Best quality". Only one of them promises a smaller file; the other goes to
EchoVideo and YouTube, which re-encode on ingest, where headroom above the
source is what keeps a second generation from showing.

**A pinned test was rewritten, not deleted.** `framerate.test.ts` asserted
`conformCost(15).frameRate === 24` with a 0.6 delta ratio — it pinned the
defect. It now pins the rule, with a comment saying so, because a reader
finding the change in `git log` should not have to wonder whether coverage was
quietly dropped to make something pass.

**Found while verifying:** on a silent source the estimate charges 128 kbps for
an audio track the output will not have — 64 kB of an 82 kB figure on a 4 s
fixture. Recorded against VH-31 rather than fixed here; it is that item's
subject and deserves its own test.

**Link:** spec §6.2, §6.3; `src/media/framerate.ts`, `src/config/presets.ts`,
`src/media/inspect.ts`, `src/ui/preflight-panel.ts`.

## 2026-08-25 — VH-33: helper text is not a safeguard

**Decision:** Remove the opening checkbox and its helper paragraph from
`index.html`; pass `opening: false` in the job spec. The pipeline's opening
path, the config and the placeholder assets are all left alone.

**Rationale:** The control was already defaulted off and captioned "Not yet
available… leave this off unless you are testing." That is an instruction, not
a constraint, and what it guards is a published video carrying an unapproved
University graphic. Same reasoning as VH-45 hours earlier, and the same shape:
remove the control, keep the capability, restore it when there is something
approved to restore (VH-23).

**Checked rather than assumed:** the placeholder assets stay in `public/` and
keep being served. `gen-placeholder-branding.mjs` draws the literal text
"PLACEHOLDER — opening — 1080p25" and no University branding, so a public URL
serving one is not a brand risk — the risk was only ever compositing it into
someone's video, which is now unreachable.

**Link:** `index.html`, `src/main.ts`, doc-deltas SPEC §9.1 (already open), VH-23.

## 2026-08-25 — VH-36: one flag, and buttons that outlive the render

**Decision:** Build Start and Cancel once at module scope and never replace
them; hold the job's request id in `jobCancelId`; gate the screen on a single
`setJobInFlight` that disables the file, subtitle, preset and branding controls.

**Rationale:** The bug was not that the wrong controls were disabled, it was
that the controls were being REBUILT — `showProcessControls` ran
`processActions.replaceChildren()` on every preflight, so changing the preset
mid-job detached the running job's Cancel and appended a fresh, enabled Start.
Guarding each call site would have left the rebuild in place for the next
caller to trip over. Long-lived nodes remove the failure rather than defend
against it, and they are also why the cancel listener can be bound once
instead of once per Start click.

One flag with one applier, because VH-32 inherits this: the alternative — each
control deciding for itself — is what VH-36 was.

**A second defect, found by looking:** disabling was already happening to Start
and did nothing visible. `.button` sets its own background and colour, so the
browser's native greying never applied, and a disabled file input still drew a
live blue `::file-selector-button`. A lock nobody can see is not a lock. The
disabled look drops the solid fill rather than washing out the text, so it uses
`--text-secondary` on `--layer-02` — a pair `test/contrast.test.ts` already
pins at AAA — instead of taking WCAG's exemption for inactive controls.

**Verified in the browser**, since none of this is testable in Node: a preset
change leaves both button nodes identical (`dataset` markers survive); during a
job the file, subtitle, preset, branding and Start are all disabled and Cancel
is the only live control; three extra Start clicks do nothing; a cancel at
"Encoding video — 15%" settles as cancelled and restores every control.
Computed styles confirm the disabled Start is `--layer-02` / `--text-secondary`
at `not-allowed` against a live blue idle state.

**Link:** `src/main.ts`, `src/styles/app.css`, backlog VH-32.

## 2026-08-25 — VH-35: Web Locks, not job ids, protect another tab's scratch

**Decision:** A live `OpfsWorkspace` holds an exclusive Web Lock named for its
directory until `dispose`, and `sweepOrphanedJobs` removes a directory only
when that lock is free. Directory names gained a per-tab session prefix.

**Rationale:** The ticket proposed passing the live job ids to the sweep. That
fixes nothing: the sweep runs at worker BOOT, when this context has no jobs, and
the directories at risk belong to another tab whose ids it cannot see. Web Locks
are origin-scoped, so they cross tabs, and the browser releases them when the
holder dies — which is the exact case the sweep exists for. No heartbeat, no
staleness threshold, no window in which a live job looks dead. The session
prefix fixes a second defect found on the way: `job-${id}` is a per-worker
counter, so two tabs both opened `job-1` and wrote into one directory.

**Alternatives:** a heartbeat file needs a tuned threshold and tolerates clock
weirdness badly. Namespacing per session without a sweep rule means a crashed
tab's scratch is never reclaimed, which is what the sweep is for.

**Found by measuring:** `/spike-opfs.html` run in all three engines caught two
things the unit test could not. One undeletable directory threw out of the
removal loop and abandoned every orphan after it (Firefox) — now per-entry.
And the spike's own first draft called `finish()` with no Mediabunny `Output`
to close the writable, which is not a real sequence; rewritten to exercise
the cancel path, which is the one criterion 8 cares about.

**Testing:** the selection rule is pure and unit-tested in Node
(`selectSweepable`); OPFS and Web Locks do not exist there, so the browser half
is `/spike-opfs.html`, ALL PASS in Chrome 151, Firefox 154 and Safari 26.5.2.

**Link:** `src/media/opfs.ts`, `src/spike/opfs.ts`, `src/workers/job.worker.ts`.

## 2026-08-25 — VH-46: make the three-engine check repeatable

**Decision:** Promoted the ad-hoc VH-34 harness to `scripts/run-in-engines.mjs`
and deleted its wish-list line. It runs any spike page in Chrome, Firefox and
Safari and prints all three, keying off the `<pre id="log">` … `done` contract
every spike page already shares.

**Rationale:** `conventions.md` requires browser-only checks to be verified in a
real browser and recorded, and VH-34 found a shipped defect only because all
three engines were finally measured together — by hand, which is the chore that
stops getting done. VH-44's regression test has to hold in three engines, so
this is its dependency rather than speculative tooling.

**Alternatives:** Playwright would bring a dev dependency and its own browser
downloads to replace ~300 lines using protocols already on the machine.
Firefox's `--screenshot` was tried and rejected: it fires at load, long before
an async decode finishes.

**Gate surface:** `eslint.config.js` gained four Node globals — `fetch`,
`setTimeout`, `AbortSignal`, `WebSocket` — in the existing `**/*.mjs` block. No
rule was weakened; the block already listed three globals by hand, and a
`globals` package would be a dependency for a lookup table.

**Watch:** it must never join `npm run check`. Three browsers saturate the
machine and the DSP suite fails on timeout rather than on merit —
`chain.test.ts` took 540 s and failed a test the one time they overlapped,
against ~4 s idle. Recorded in the script header and in DEV-INFRASTRUCTURE.

**Link:** `DEV-INFRASTRUCTURE.md` → "Cross-engine verification",
`tickets/VH-44.md`.

## 2026-08-25 — Pruned project memory: the first trajectory split

**Decision:** Moved Phase 1 (Band 0 MVP, 76 lines / 722 words) verbatim to
`archive/trajectory/trajectory-0001-band-0-mvp.md`, left a one-line pointer in
its place, and created `archive/INDEX.md`. Trajectory 2,069 → 1,358 words
against a 2,000 budget and a 1,400 prune-to target.

**Rationale:** The previous prune predicted this ("the next shipped item trips
it") and VH-45 was that item. Phase 1 is the natural boundary: a closed
milestone whose items are all shipped, none of which any live item still
reasons about. Everything after it — the corpus, the real branding assets, the
deploy, the engine divergence — is still being argued with.

**Alternatives:** compressing Phase 1 in place was rejected; trajectory lines
are already one-per-item outcomes, so compression means deleting outcomes, and
an archive keeps them greppable at no cost to the live read.

**Deviation:** the Prune procedure says to add new archive files to
`file-map.md` under an "Archive" section. Not done, deliberately — that file is
generator-owned and `gen-file-map.mjs` ignores `^pm_skills/`, so a hand-written
section would be dropped on its next run. `archive/INDEX.md` is the map of cold
storage and carries the row instead.

**Verify:** three `diff` runs against the intact original proved the split
lossless — archived slice, kept header, kept tail, all byte-identical.

**Link:** `pm_skills/project/archive/INDEX.md`.

## 2026-08-25 — VH-45: withdraw the transition controls rather than wait

**Decision:** Delete the "How the logo arrives" and "Animation" fieldsets from
`index.html` and their wiring in `main.ts`. The pipeline keeps all three modes;
`chosenBranding` already fell back to `CLOSING_DEFAULTS`, so removing the radios
is the whole change.

**Rationale:** VH-34 found `over-picture` and `over-freeze` wrong in Firefox
hours after the site went live, and both were offered as radio buttons. The
exposure is a user choosing a broken closing today; VH-44's fix is a startup
probe with a regression test, which is not a today-sized piece of work. VH-33
set the precedent — a control that should not be chosen is removed, not
defaulted off — and removal costs nothing to reverse when VH-44 lands. Animation
went with the modes because Fade and Slide differ only during the build a hard
cut discards: `syncBrandingOptions` was already disabling it on every default
job, and a permanently-disabled control is exactly what VH-32 objects to.

**Alternatives:** hiding the modes in Firefox alone was rejected — engine
sniffing is what VH-44's ticket rejects for the fix, and it would make the
control set depend on the browser. Leaving them with a warning was rejected:
spec §9.2 says every exposed control is a decision a novice is forced to make,
and this one has a wrong answer.

**Link:** `index.html`, `src/main.ts`, backlog VH-44, doc-deltas SPEC §4.1.

## 2026-08-25 — VH-34 spike: the composite is engine-dependent after all

**Question:** `composite.ts` moved the blend to the CPU because the engines
disagree over whether a decoded frame is premultiplied. `compose()` still reads
the branding frame back through `getImageData`, which un-premultiplies by
specification. Does the disagreement reappear at the readback? Timebox: one
session.

**Method:** `spike-alpha.html` gained the measurement, run headlessly in all
three engines — Firefox over WebDriver BiDi, Chrome over CDP, Safari over
`safaridriver`. Ground truth came from ffmpeg decoding the onsets straight from
the WebM: the frame at t=0.40 s is uniform, white `(73,73,73,75)` and blue
`(4,10,17,75)`, premultiplied. Measured on the real `compose()` over a black
picture, the maximum-error case and the one a real closing over dark footage
would show.

**Finding — yes, and every alternative route is broken somewhere too:**

| Route | Chrome 151 | Firefox 154 | Safari 26.5.2 |
| --- | --- | --- | --- |
| `draw` then `getImageData` (today) | correct | un-premultiplied | correct |
| `new VideoFrame(canvas).copyTo` | double-premultiplied | correct | BGRA |
| `VideoSample.copyTo` (no canvas) | correct | correct | luma plane |

In Firefox blue returns 3.7x too bright — `5 x 255/69 = 18.5`, exact on all
three channels — and white overflows and WRAPS rather than clamping:
`74 x 255/69 = 273`, reported as 17. So the white closing over dark picture
does not glow, it inverts. Safari's two failures are one cause: it ignores
`VideoFrameCopyToOptions.format` silently. Blue caught it and white would have
hidden it — `(17,10,7)` is `(4,10,17)` reversed, invisible on grey. Firefox
also expands the alpha plane as limited range (75 becomes 69), which is what
pushes the white case over 255 in the first place.

**Recommendation:** no single route is portable, so the fix is a startup probe
against a known branding frame that picks a working route and refuses the
overlay modes if none matches — the shape `capability.ts` already uses, and
consistent with failing loudly rather than silently. Raised as VH-44, which
inherits this entry's numbers as its expected values. Not attempted here: a
spike's code does not merge.

**Alternatives:** correcting Firefox's readback arithmetically was rejected —
the overflow wrap destroys the value, and it survives only because Firefox's
alpha rescaling breaks the `RGB <= alpha` invariant the correction would rely
on. Re-tagging the assets full-range would remove the wrap but not the
un-premultiply, so it fixes the symptom that is easiest to see and leaves the
error.

**Scope note:** the measurement stayed in `src/spike/alpha.ts` rather than a
scratch directory, matching how VH-12's alpha check is kept — dev-only, never
built, and re-runnable as one URL. A spike normally leaves nothing behind; a
verification that cannot be re-run is not a verification.

**Link:** `src/media/composite.ts`, `src/spike/alpha.ts`,
`public/branding/README.md`, backlog VH-44.

## 2026-08-25 — Pruned project memory

**Decision:** Swept the 12 doc-deltas ticked by the same session's doc-sync, and
deleted two dead wish-list lines. No file was archived — nothing was over an
archivable budget.

**Rationale:** The ledger shrinks by ticking-then-sweeping, so the sweep was due
the moment doc-sync ticked; the audit trail it held now lives in this log and in
git. The two wish-list lines were not deferrals but errors: the TypeScript 7 pin
duplicated Icebox item VH-28 verbatim and should have been deleted when VH-28 was
minted (the wish-list is pre-triage, the Icebox post-triage — an item cannot sit
in both), and the `bestGuessFrameRate` concern was answered by VH-24's
verification that `inspect.ts` reads the rate from `computeFrameRateMetrics()`,
measured from packets, and never from `bestGuessFrameRate`.

Backlog Active stays over its word budget (2,479 / 1,500) by standing decision —
the inline detail is doing real work and the open-item count is well within
budget. `tickets/VH-24.md` and `VH-25.md` are over their soft budgets for the
same reason. The P3 backup was deleted after verification: both files were
byte-identical to what git already held, so committing them into the tracked
archive would have been duplication, not history.

**Watch:** `trajectory.md` is at 1,972 of 2,000 words. The next shipped item
trips it, and the prune-to target is 70% — so the first archive split is due
then, not now.

**Link:** `pm_skills/project/doc-deltas.md`, `wish-list.md`.

## 2026-08-25 — Doc-sync: the specification meets the real assets

**Decision:** Reconcile `docs/01-specification.md` against all 12 open
doc-deltas in one signed-off batch, plus 3 consequential edits derived from
the same sources that the ledger had not captured. 15 edits, 0 deferred.
Spec grows 2,761 → 3,772 words (3,841 before a follow-on copy-edit pass
tightened §4.1, §4.3, §6.3 and §8.3 without dropping a fact).

**Rationale:**

- **Ten deltas were the spec going stale.** Reality differed and the code was
  already right: the branding is silent (§4.4 bed struck), one 4K25 master
  exists rather than a four-variant matrix (§4.2), four style variants exist
  that the spec never anticipated, the alpha is premultiplied and the
  operation is compositing rather than concatenation (§4.3), v1 is
  closing-only (§4.1), embedded subtitle tracks cannot be read at all so two
  of §8.3's four steps had no reachable branch, the frame rate is measured
  rather than declared (§6.3), and colour/HDR was specified nowhere (new
  §6.5, which states the behaviour is undefined rather than inventing one).
- **Two were the opposite** — the code faithfully implements the spec and the
  spec's rule is the defect: §6.2's bitrate targets with no never-exceed-source
  cap, and §6.3's round-to-nearest-standard, which snaps Teams' 16.000 fps to
  24. Both are written as the corrected rule, so the spec leads the code by one
  band; VH-24 in Band 1 closes the gap, and §13 is where "is it built" is
  tracked.
- **Three edits went beyond the ledger.** §13.1 required "both animations",
  impossible in a closing-only v1; §13.6 and the corpus note required a
  variable-frame-rate test source, and no corpus file classifies as variable.
  The ledger captures where drift was *noticed*; the edit is derived from the
  source and reaches wherever that source reaches.

**Alternatives:** Holding the two rule-defects until VH-24 ships was rejected —
it would have built VH-24 against a spec still asserting the rule it exists to
overturn. Pending-markers in the body were rejected as duplicating §13.

**Link:** `pm_skills/project/doc-deltas.md` (12 ticked); spec §§4.1–4.4, 6.2,
6.3, 6.5, 8.3, 13.

## 2026-08-25 — Band 1: what the pilot owes its first real users

**Decision:** Open the gate the post-Band-0 bucket was holding. Band 1 is
**VH-33, VH-24, VH-31, VH-19, VH-25, VH-32**, in that order. Band 2 (VH-16,
VH-20, VH-17) and Band 3 (VH-26, VH-23, VH-30) are recorded but not committed.
Maintainer work (VH-M2, VH-M3, VH-14, VH-15) is listed apart from the bands so
it cannot read as waiting on one. Alongside it: **VH-22 closes** (shipped),
**VH-21 is cut** (premise gone), and **VH-23 is split**, with the live risk
pulled forward as VH-33.

**Rationale:**

- **The band question changed when the app went live.** Band 0 asked "does it
  work?" Every item found since was found by real material or a real run, so
  Band 1 asks "is what it produces right, and does it read right?" That is what
  sorts the sixteen: the four things a staff member currently meets that are
  wrong or misleading go in; the rest wait.
- **Order is dependency, not ID.** VH-24 settles the output shape, so VH-31's
  estimate and VH-19's content class both key off it, and all three land on
  `outputShapeFor` and the same three-second probe. Touching that function
  three times in three bands would be the expensive way to do one piece of work.
- **VH-32 goes last on purpose.** The redesign has to lay out the estimate
  wording, the content class and the fade toggles that the four items above
  decide. Running the design pass first means running it twice.
- **VH-33 goes first because it is a live brand risk, not a feature.** The
  deployed site still offers "Add the opening sequence" over a stand-in UoN
  graphic, held back only by helper text. Removing a control is small; leaving
  it queued behind engineering work was the actual mistake.
- **VH-22 was already done.** All three modes, the default, the alpha-decode
  fallback and the clean-frame freeze are in the code and verified in all three
  engines. Its two unmet clauses belonged to other items and moved there.
- **VH-21 lost its premise.** It asks to preserve a branding audio bed when the
  source is silent; the masters are silent by design and the bed is struck from
  spec §4.4 (doc-delta, 2026-08-25). There is nothing to preserve.

**Alternatives:** Putting VH-32 first — the maintainer's most recent request —
was rejected on the rework it forces. One undifferentiated band of everything
found after Band 0 was rejected as a holding pen with a new name: it carries no
ordering signal and no gate.

**Link:** `pm_skills/project/backlog.md`; VH-22's outcome in `trajectory.md`.

## 2026-08-25 — Branding: real assets, four styles, and a shared tail

**Decision:** Build VH-12 in full (approved by the maintainer 2026-08-25).
Ship all four 2025 closing styles; **Fade Blue is the default**; retire
`UoN Logo Exit Animation JB 2023`. Treat the shared 4 s tail as a guaranteed
property, not a coincidence.

**Rationale:**

- **The masters are not a file swap.** `qtrle`/`argb` is undecodable by
  WebCodecs, the 1.00 s alpha onset is meant for compositing rather than
  concatenation, and one 4K25 master must serve sources from 640×480 to 4K at
  16–50 fps. That is a converter, a compositor and a resizer, not a copy.
- **The shared tail is deliberate.** The maintainer authored the assets by
  duplicating one After Effects composition and varying the onset animation
  and the colour, so frames after t=1.00 s are byte-identical *within a
  colour*. Confirmed by frame hashes before asking. This is safe to build on:
  ship **two tails** (Blue, White) and **four onsets**, which cuts the
  alpha-carrying material to 4 seconds total and the download substantially.
- **Alpha decode is the risk, so it is verified first.** Browser support for
  transparent video is thinner than for ordinary video. If it fails, "clean
  cut" still works — that mode never composites — so branding ships either
  way, with fewer modes.

**Alternatives:** Asking for re-exports in a browser-ready format was
rejected — the master format is correct for a master, and converting at build
time keeps the authoring tool free to change. Collapsing the tail to a still
image was rejected on measurement: it is animated throughout.

## 2026-08-25 — Band 0 MVP: stack, scope, and the decisions that shaped it

**Decision:** Build the first milestone as a static TypeScript app on
WebCodecs with Mediabunny as the only runtime dependency, scoped to Band 0
(local, no deploy), and treat the specification set in `docs/` as
authoritative throughout.

**Rationale:**

- **Stack.** TypeScript 6.0.3 + Vite + Vitest. TypeScript 7 is released but
  typescript-eslint caps at `<6.1.0`, and adopting 7 would have cost the
  correctness lint the quality gate depends on — a worse trade than being one
  major behind.
- **The meter first.** VH-2 and VH-3 were moved ahead of the pipeline. The
  loudness meter is the highest-risk component and has no dependencies, so
  proving it against EBU Tech 3341 before anything consumed it meant a failure
  would cost one item rather than six. It passed at 0.021 LU worst error.
- **Three audio passes, not an estimate.** The single linear gain must land the
  *output* on −16 LUFS, and steps 2–4 of the chain change loudness on the way.
  Measuring what they leave (pass B) rather than estimating it is why a
  −46.83 LUFS source lands at −16.03.
- **The chain runs in the pipeline's feed loop, not the encoder's transform
  hook.** That hook sees every sample including the branding bed, which is
  mastered at target and must pass through unprocessed (spec §4.4). This is
  spec §4.4 expressed as an architectural constraint, and it only became
  visible when branding arrived.
- **Audio timeline shifted by the measured encoder delay.** AAC adds 44 ms of
  priming; the conventional fix is an edit list, which Mediabunny does not
  write. Measured rather than assumed, because it belongs to whichever encoder
  the browser provides.
- **Verification against reference material, not self-consistency.** The EBU
  signals and the acceptance harness each found defects that 29 and 245
  passing tests respectively had not: a 5.0 channel-weight gap, a 100 ms
  update grid too coarse for EBU tests 10–14, cancellation escaping cleanup,
  and two faults in my own measuring instruments.

**Assumptions made** (all recorded against open decisions, none invented):
D1 brand colour is a single token, verified as a one-line change; D2 durations
are config-only; D3 boundary treatment is a hard cut with a 100 ms fade; D4's
Safari-below-26 exclusion holds pending UoN IT.

**Alternatives considered:** ffmpeg.wasm was rejected before this run and not
revisited — rationale §1 stands. `fastStart: 'reserve'` for the smaller preset
was deferred to VH-17 rather than guessed at, since it needs a measured packet
count and a real SharePoint upload to settle.

**Known open:** acceptance criteria 1, 4, 5 and 7 need real material and a
person (VH-M1); published limits need real hardware (VH-M2). Three protected-doc
deltas await sign-off in `doc-deltas.md`, of which spec §6.3's frame-rate
rounding is the one that changes behaviour.
