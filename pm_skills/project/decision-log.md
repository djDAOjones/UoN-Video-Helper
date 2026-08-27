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

## 2026-08-27 — VH-32 closed, VH-61 closed, VH-17 reframed

**VH-32 — no redesign. The simplicity is the design.** The maintainer's answer
to the interface pass he asked for: he likes it as it is, and the only thing
that would justify a SECOND screen is a trim function. So the ticket closes on
"nothing to change" rather than on a delivered redesign, and the screen-count
question moves to VH-30, which is what would raise it.

That is a stronger outcome than it looks. The original complaint was that the
screen accretes rather than progresses and speaks in codecs rather than
outcomes. Most of it has since been answered piecemeal by items that were not
UI tickets — VH-64 gave the progress bar a name and a stage and made a
discouraged job ask before it proceeds; VH-56 gave the finished result an
owner, so the screen stops offering a Save for a file that is gone; VH-46b
collapsed the closing from a checkbox plus a hidden mode set into one question
with four plainly-worded answers; VH-31 made the size estimate say "at most"
instead of quoting a figure it beats by 3.6x. What is left of the original
complaint is largely what those fixed.

**VH-61 — leave it.** The maintainer accepted the recommendation. Loudness
range goes blind in the final second of a file, which under-reports, which
keeps the macro-leveller OFF — the safe direction, and the same judgement spec
§5.2 step 3 already makes. The review's remedy inverts it. Closed as accepted
behaviour with the evidence recorded rather than as a defect deferred.

**VH-17 — EchoVideo (Engage) is the key platform**, which changes the stakes
rather than the answer. EchoVideo re-encodes on ingest, so where the moov box
sits cannot reach a viewer there on either preset. That removes the question
from the path most videos take and leaves it a secondary concern for OneDrive
and SharePoint. Still worth the upload test; no longer worth designing around
beforehand.

It is also a useful confirmation elsewhere: if EchoVideo is where most videos
go, most jobs should be taking "Best quality", which is already the default and
already what spec §6.1 names for EchoVideo.

**Link:** VH-32, VH-61, VH-17, VH-30; spec §6.1, §5.2 step 3.

## 2026-08-27 — VH-19: the probe samples the one part that says nothing

**Decision:** do not classify content from the calibration probe's existing
window. VH-19 stays open, blocked by a measurement rather than by missing code.

**Rationale:** everything needed to ship this looked present — `ContentClass`
exists, `outputShapeFor` already takes it, and the probe already decodes three
seconds. So the obvious move was to measure inter-frame difference on those
frames and set the class. Measuring the real corpus first is what stopped it.

Mean absolute inter-frame difference on a 64x36 luma, sampled at four points
through five real lectures, separates camera from slides cleanly: CULT1027
reads 1.35 to 1.86, everything else 0.68 or below. But **every one of the five
reads 0.00 at the start**, because a lecture opens on a title card. The probe
samples exactly there. Classifying from it would have called every source
"screen" — including the one that is plainly camera — and "screen" cuts the
smaller preset from 2.5 Mbps to 1.5.

The error is asymmetric. Calling camera content "screen" takes 40% of the
bitrate off the material that most needs it, silently, on someone's lecture.
Calling slides "camera" costs only file size, on the preset whose entire
purpose is a smaller file. Any threshold has to be biased hard toward camera,
and five files is not enough to place one.

This is the same shape as the finding that stopped VH-31's estimator: where you
sample drives the answer more than how long you sample for. A representative
classification needs several points through the file, in a pass separate from
the timed probe so it cannot re-calibrate `videoFramesPerSecond`.

**Link:** VH-19, VH-31; spec §6.2; `src/config/presets.ts`, `src/media/probe.ts`.

## 2026-08-27 — VH-31: an upper bound that is actually one

**Decision:** keep the estimate as an upper bound, say so on screen, and fix
the one way it was not a bound. The content-derived estimator stays unbuilt.

**Rationale:** the maintainer chose the upper bound and asked for improvement
where it was cheap. Two things were cheap and one was not.

The projection multiplied by the SOURCE duration, while the output is longer
by whatever branding is appended — the tail was omitted outright, about 3% on
a 130 s lecture, and part of why four real "Smaller file" jobs produced a file
LARGER than the figure the user had decided on. A bound that can be exceeded
is not a bound. Pre-flight does not know the mode yet, so it assumes the
longest closing: over-stating by a second on a job that turns out to be a
clean cut is the safe direction.

And the panel said "Estimated size: 27.7 MB" for a file that came out at 7.5.
A bare figure reads as a prediction, so the margin read as a defect. "At most
27.7 MB" is the same number describing itself honestly, and costs nothing.

What stays unbuilt is the content-derived estimator, and the reason is in the
ticket rather than in taste: all three adversarial refuters returned blocking
findings. It raises `requiredStorageBytes` on 42 of 46 corpus combinations
into a hard block with no override; the longer probe it needs re-calibrates
`videoFramesPerSecond` by 34-66%, moving the estimate across spec 7.3's 20-
and 60-minute bands; and the wall budget withdraws the fix from exactly the
large files it exists to fix, on hardware only 1.8x slower than the machine it
was costed on. The ticket file goes, and those findings come with it into
VH-19's note, because VH-19 rides the same probe and would inherit the same
objections unanswered.

**Link:** VH-31, VH-19; `src/config/branding.ts`, `src/workers/job.worker.ts`,
`src/ui/preflight-panel.ts`.

## 2026-08-27 — Seven maintainer answers, recorded

**D4 / VH-15 — the browser exclusion is signed off.** Safari below 26 may be
excluded. This was the one decision flagged as expensive to reverse, and it is
now closed rather than standing. VH-15 is removed.

**D5 / VH-14 — the intended home is a UoN-hosted web app**, in the shape of
`xerte.nottingham.ac.uk`: University server, University URL, not public GitHub
Pages. Answered in principle; who provisions it is what remains, so VH-14
stays open with the target named. Pages continues as the unadvertised pilot in
the meantime.

**D6 — AA is the floor, AAA is the goal.** Which is what `UI-STANDARDS.md`
already implements. No change beyond recording that the ambition is deliberate
rather than aspirational, and that an AAA exception has to be argued for.

**D7 — Legal will not engage, and there is nothing to escalate.** Worth being
plain about what the question was: the app ships no codec. It uses the codecs
already in the user's browser through WebCodecs, which is why ffmpeg.wasm was
rejected — that would have meant UoN distributing an x264 binary and inheriting
both GPL obligations and AVC patent-pool exposure. The current architecture has
neither. The sign-off was a confirmation of a position already believed sound,
not a request for permission, so its absence is a small residual risk rather
than a blocker. Recorded and closed on that basis.

**D12 — per-department branding is a later possibility, not a requirement.**
The plan is to build it, show it around, and hand it to the maintainer's
central department, which would then own any variant governance. Stays
iceboxed; the revisit trigger is that handover.

**VH-48 — cut. Keep re-encoding.** The maintainer asked for the most reliable
option and that is the current one. Stream copy would leave the source video
untouched and encode only the branding, which is generationally lossless and
near-instant — but it requires the copied source and the encoded branding to
match byte-exactly in codec parameters, and when they do not the failure is
silent A/V drift discovered after publication. Rationale §4.3 rejected it on
two grounds; VH-24 removed one (the corpus is effectively CFR) and this one
still stands. Re-encoding is slower and predictable, and predictable wins.

**VH-M3 — the OneDrive exclusion will not happen.** So the hazard is
permanent, and the response is to make it legible rather than to keep asking.
The symptom is `ETIMEDOUT` from `readFileSync` or `tsc` hanging, the cause is
Files-On-Demand dehydrating `node_modules`, and the fix is `npm ci` — all three
are in `README.md` → Gotchas and in `AGENTS.md`'s hostile-filesystem rule. No
detector was built: nothing is dehydrated right now, so it could not be tested,
and an untested guard for a condition that cannot be reproduced is worse than
a documented one.

**Link:** D4, D5, D6, D7, D12; VH-15, VH-14, VH-48, VH-M3.

## 2026-08-27 — VH-46b: one question, four answers

**Decision:** the closing is a single four-way radio — Clean cut, Over the
picture, Over a freeze frame, No closing sequence — with Animation revealed
only for the two modes that play the build, and Colour whenever a closing is
chosen.

**Rationale:** the maintainer asked for all four options back plus a GUI
analysis of the best way to offer them. The analysis turns on three facts.

"None" is not a different KIND of answer from "clean cut" — it is a fourth
value of the same question. It had been a checkbox with the three modes behind
it as a separate group, so the user was asked twice about one thing, and the
second question looked optional when it was not. One radio group asks once.

Animation only means something for `over-picture` and `over-freeze`. A clean
cut discards the 1 s build entirely, so under it Fade and Slide differ by
nothing — precisely the control `AGENTS.md` names as the one never to expose.
It is hidden rather than disabled: a disabled control still says "there is a
decision here you may not make", and there is not one.

What separates the modes for a user is what happens to their last second and
how many seconds they gain, neither of which is guessable from a two-word
label. Each option carries a sentence saying both. Clean cut stays the default
— least to think about, and the only mode that composites nothing, so it works
even where alpha decode does not.

**On the processing being sound:** the compositing that VH-45 withdrew is
correct because of VH-44, which detects whether the engine honours an RGBA
`copyTo` and takes the canvas round-trip only where it does not. That is a
property test rather than a browser sniff, which is why it survives. Verified
end to end here in Chrome across five combinations — every mode, both styles,
both colours — and each produced the duration its configuration promises:
`hard-cut` and `over-picture` +3.99 s, `over-freeze` +4.99 s against nominal
4.00 and 5.00, the remainder being frame quantisation at 30 fps.

**Rejected:** keeping the checkbox and adding a separate mode group, which is
the shape that caused the problem; and a select, which hides three of four
options behind a click for no gain at this length.

**Link:** VH-46b, VH-44, VH-45; `index.html`, `src/main.ts`,
`src/styles/app.css`.

## 2026-08-27 — VH-25 cut, VH-23 iceboxed: less to decide, not more

**Decision (VH-25):** do not build picture fades at the branding boundary, in
either direction. The ticket is cut, not deferred.

**Rationale:** the maintainer's call, and it overrides the corpus evidence that
raised the ticket — 21 of 21 real recordings end on a bright frame, which is
what made a fade-out look obviously right. The objection is about the viewing
context rather than the frame: a lecture is watched by an audience who have
just been told something, a fade to the closing card adds nothing they need,
and it costs a second of attention at exactly the point the branding is trying
to land. No benefit, a possible negative, so it does not get offered.

Nothing is lost by cutting it, because nothing was built: there is no picture
fade anywhere in `src/`. What DOES exist and stays is the 100 ms audio fade at
the branding join (`BOUNDARY_FADE_MS`, open decision D3). That is not an
aesthetic fade — it is a click preventer. Two unrelated pieces of audio butted
together produce an audible click, and 100 ms is short enough that nobody
perceives it as a fade at all. Removing it would make every job click.

The ticket's third clause — a notice for the four corpus files that start
mid-speech — goes with it, and is already covered: VH-55's `onset-trimmed`
warning fires when audible content sits in the window that encoder-delay
compensation discards, which is that case.

**Decision (VH-23):** opening graphics to the icebox, low priority, not to be
addressed until far later in the product's life. The pipeline path is dormant,
not deleted.

**Rationale:** the maintainer's position, unchanged since 2026-08-25 and now
made permanent enough to move: openings suit external video where brand
recognition comes first, and this tool is internal, where a closing is the
norm. `loadBrandingClip` refuses an opening and returns `null` — the same
answer the pipeline already handles for branding that fails to load. The four
generated placeholder openings are removed from `public/branding/`, which is
the substantive part: they were shipping in every build, and an unapproved
University graphic reaching a published video is the risk VH-33 named.

The timeline maths stays. Every offset downstream — content start, subtitle
shift, closing position, the estimate — is written in terms of an opening
duration that is currently zero, and is tested that way. Deleting it would
cost more than it saves and would have to be rebuilt to bring the feature
back.

**Link:** VH-25, VH-23, VH-33, VH-55; D3; `src/media/branding.ts`,
`public/branding/`.

## 2026-08-27 — VH-49: Firefox is told to switch, not served a lesser file

**Decision:** Firefox stays blocked for any source with audio, with a message
naming a browser that works. No WebM/Opus path, no dropped audio.

**Rationale:** the maintainer's call. The three options were block, ship
WebM/Opus, or drop audio. Dropping audio was never real — a silent lecture is
not a lecture. WebM/Opus means a second output contract: spec §6.1 says MP4,
EchoVideo and OneDrive both take MP4 without question, and a Firefox-only
format would have to be specified, tested across the same corpus, and
explained to a user who did not ask for it. Blocking is honest, already built,
and already names the way out.

It does exclude a supported browser from a University tool, which is a real
cost and not one to pretend away. VH-69 is the pathway if it is ever worth
paying for, kept low because the block is correct today.

Spec §10 still lists Firefox desktop as "Supported" — a doc-delta, since only
silent sources run there now. `README.md` says what actually happens.

**Link:** VH-49, VH-69; D11; `README.md`, `pm_skills/project/doc-deltas.md`.

## 2026-08-27 — D1 answered: the padding is Nottingham Blue

**Decision:** `--uon-brand-bg` is Nottingham Blue `#10263B`, the University's
primary brand colour, aliased from a named `--uon-brand-blue`.

**Rationale:** the maintainer supplied
<https://www.nottingham.ac.uk/brand/visual/colour.aspx> as the palette the
branding masters were made from. Verified rather than taken on trust: the
shipped `closing-tail-blue-1080p.mp4` decodes to `#10263a` at its corners —
one unit off in the blue channel, which is YUV-to-RGB rounding in an H.264
encode. The asset is that colour.

Padding a non-16:9 source in the same blue the closing card ends on makes the
whole output one field of colour rather than black bars round a brand graphic.
Black remains one line away if that reads worse on real material.

The two neutrals are defined alongside it because the white closing variant and
the interface both need them. The nine accent colours are on that page and are
not invented into this file until something needs one.

**Also:** `gen-placeholder-branding.mjs` read the token with a regex that only
accepted a literal hex, so the alias broke it. It follows one `var()` hop now.

**Link:** D1; `src/styles/tokens.brand.css`,
`scripts/gen-placeholder-branding.mjs`.

## 2026-08-27 — VH-66: correct the code where the doc was right

**Decision:** fix the drift in whichever direction is true. Where the code had
fallen behind a published promise, change the code; where a document described
a project that no longer exists, change the document; where the document is
protected, capture a delta and change nothing.

**Rationale (review R-15):** four drifts, and they did not all point the same
way.

`DEV-INFRASTRUCTURE.md` said both the product version and the build identity
appear "in the UI's About/footer line". Production showed the product version
alone, and the diagnostics bundle that carries the build id is dev-only — so a
running production app could answer "what release is this?" and not "exactly
what code is live?", which is the whole point of having two. The document was
right; `main.ts` was wrong. Non-secret: this repository is public and the
commit is already in the shipped sourcemaps.

Its Deployment section said the MVP is "local only" and that "nothing deploys
until D5 is answered". Every push to `main` has published since 2026-08-25.
The document was wrong, and updating it is squarely within its ownership.

`architecture.md`'s source tree named `core/bus.ts`, `core/store.ts`,
`media/sidecar.ts`, `branding/assets.ts`, `ui/shell.ts`, `ui/components/` and
`ui/views/` — none of which exist — and described a store-and-bus main thread
that was never built. Replaced with what is on disk, and the communication
section now says the main thread holds its state directly and that adding a
store is a decision rather than a default.

`gen-placeholder-branding.mjs` still emitted a flat `closing-{label}.mp4`.
The real closings arrived with VH-12 and are built by `build-branding.mjs` as
`closing-tail-*` and `closing-onset-*`, so running the old generator dropped
four stale files beside the real ones. It builds openings only now — there are
still no approved opening assets, which is what it is for.

**Captured, not edited:** two spec deltas. §5.2 step 6 states the limiter's
ceiling as −2.0 dBTP, which is now the ceiling of the FILE while the limiter
targets 1.0 dB below it (VH-50); and §5.2 step 3 lists the pause freeze once
where the implementation needs it twice (VH-61). `docs/` is protected, so
those go to `doc-deltas.md` for a sign-off pass.

**Link:** VH-66; review R-15; `DEV-INFRASTRUCTURE.md`, `src/main.ts`,
`pm_skills/project/architecture.md`, `scripts/gen-placeholder-branding.mjs`.

## 2026-08-27 — VH-64: name the progress, and ask before the slow job

**Decision:** give the progress bar an accessible name that tracks the stage,
and withhold Start on a `discourage` verdict until the user says to carry on.

**Rationale:** a bare `<progress>` announces a percentage and nothing else, so
a screen-reader user heard "63%" with no way to know 63% of what — and the
stage is the half that carries the meaning. It is labelled by a visible line
that follows the stage, rather than by an `aria-label` nobody sighted can see,
so the two cannot drift.

Spec 7.3 allows a discouraged job to continue "after acknowledgement", and
there was no acknowledgement: Start appeared for every outcome short of a
block, so agreement was inferred from the user pressing the button they were
being warned about (review R-14). The acknowledgement is a deliberate second
act, per selection rather than per session — an acknowledgement is about one
job.

**Rejected:** a modal. `UI-STANDARDS.md` reserves those for something
irreversible the user did not initiate; this is a recommendation they may
disagree with, and it belongs beside the recommendation.

**Verified in Chrome, with the mobile device class emulated:** a discouraged
verdict shows the acknowledgement and hides Start; acknowledging reveals Start
and moves focus to it; a desktop `proceed` verdict shows Start immediately and
never the acknowledgement; and the bar announces "Analysing audio" rather than
nothing while it runs.

**Link:** VH-64; review R-14; spec 7.3; `index.html`, `src/main.ts`.

## 2026-08-27 — VH-60: an answer belongs to the question that asked it

**Decision:** stamp every selection with an epoch and drop any answer that
arrives for a superseded one; add secure context, OPFS and source-decode to the
pre-flight verdict as blocks; and derive the H.264 level from the shape instead
of fixing it.

**Rationale:** three separate ways the screen could describe one job while
Start submitted another (review R-05, R-06).

Nothing checked, on the way back, which selection an asynchronous answer was
about — so whichever finished LAST won. Choosing file A then file B could leave
B on screen with Start pointing at A, and a slow pre-flight for the old preset
could arm Start after the user had chosen a different one. `beginSelection()`
returns the test; inspection, pre-flight and the subtitle read all take it, and
a preset change additionally takes Start down for the interval, because the
verdict that revealed it described the other preset.

`hasOpfs`, `isSecureContext` and both tracks' `canDecode` were all measured and
then never consulted, so a job could reach a live Start button on a device that
could not finish it — and the source panel says in as many words that full
guidance arrives with pre-flight. All three are now required inputs rather than
optional ones, so a future call site cannot omit them by accident. They are
ordered by what the user can act on: an insecure context is fixable from the
address bar, so it is named before "install another browser".

The codec string declared level 5.1 for every shape. ITU-T H.264 Table A-1
caps 5.1 at 983,040 macroblocks a second; 3840x2160 at 60 fps needs 240 x 135
x 60 = 1,944,000. Chrome ACCEPTS the over-declaration, which makes this the bad
kind of bug: not a refusal, a stream declaring a level it exceeds, for a strict
downstream decoder to reject after publication. The level now comes from the
shape, which also drops 1080p to 4.2 — more widely hardware-accelerated than
5.1 and correct for everything up to 1080p60.

**Verified in Chrome:** picking A then B leaves B on screen AND submits B (the
produced file is 11.3 MB, B's size; A's is ~7 MB); a preset change hides Start
until the new verdict lands; `isConfigSupported` accepts the derived level at
720p30, 1080p30, 1080p60, 1440p30, 4K30 and 4K60; and a real job encodes and
verifies at level 4.2 with a byte-identical result.

**Link:** VH-60; review R-05, R-06; `src/main.ts`, `src/media/preflight.ts`,
`src/config/presets.ts`, `src/ui/preflight-panel.ts`.

## 2026-08-27 — VH-61 and VH-67: freeze the envelope, and keep less of the curve

**Decision:** apply the pause freeze to the FINISHED envelope as well as to the
raw correction; halve the meter's block store by pre-weighting; keep the
momentary curve only for callers that ask. Do NOT touch the LRA end-of-file
suppression.

**Rationale (VH-61):** spec 5.2 step 3 lists the freeze last — after smoothing,
clamping and slew limiting — and the code applied it first, to the raw
correction only. The smoothing window is CENTRED, so speech fifteen seconds
past a pause reached back into it and moved a gain that was supposed to be
frozen: measured at -5 dB entering a pause and -1.29 dB inside it, and +1.85 dB
in the silence before a recording's first word. The freeze now appears twice
and the two do different jobs — the first keeps a pause's enormous raw demand
out of the smoother, the second stops the smoother reaching into the pause.
Expressed as "do not advance the slew", so it can never introduce a step the
slew limit forbids.

**Rationale (VH-67):** `computeIntegrated` averaged per-channel mean squares
across the gated blocks and then applied channel weights. Those commute, so
weighting on the way in stores one number per block instead of one per channel
per block at an identical result — the EBU harness passes unchanged, which is
the equivalence proof. And nothing in the pipeline reads the momentary curve;
the envelope and the warnings both work from the short-term one, while the EBU
max-M cases need every value. It is retained on request, defaulting to on, and
the pipeline asks for off. A stereo hour goes from ~1.4 MB to ~580 kB, which is
what the module's comment always claimed.

**Not done, deliberately (VH-61's other half):** a loud passage in the final
second reads LRA 0.00 against 10.80 for the same event mid-file. Real, and
recorded. But the review's remedy — 1.5 s of silence before finalising LRA —
was measured and is worse: on a recording ending quietly it took LRA from 3.79
to 15.32 against a mid-file truth of 6.51. It cannot be fixed by inventing
audio, because the only audio there is to invent is silence, and silence in a
partial short-term window survives the relative gate.

The direction matters more than the magnitude. LRA gates macro-levelling at
9 LU. Suppression makes the meter UNDER-report, so the leveller stays off — the
safe failure, and the same judgement spec 5.2 step 3 already makes ("processing
that is not needed can only do harm"). Padding makes it OVER-report, switching
the leveller on because a recording ends in room tone. Correcting this needs a
standards-grounded design and a model of its effect on that gate, not a patch.

**Link:** VH-61, VH-67; review R-10, R-16; `src/audio/macrolevel.ts`,
`src/audio/loudness.ts`, `src/audio/analyse.ts`.

## 2026-08-27 — VH-65: the build job does not need to be able to publish

**Decision:** move `pages: write` and `id-token: write` off the top level and
onto the `deploy` job alone, pin every action to a commit SHA, and make the
publishable-media guard allow "committed to this repository" rather than a
directory.

**Rationale:** every push to `main` publishes (VH-14), so this workflow IS the
act of publishing and its blast radius is the University's pilot site.
Top-level permissions applied to both jobs, and `build` runs `npm ci` and the
whole test suite — a great deal of third-party code holding a token that can
deploy. It needs to read the repository and nothing else.

A major-version tag is mutable. `actions/checkout@v4` is whatever the tag
points at today, and whoever controls it can move it to any commit, which then
runs on every push to `main` with this workflow's permissions. SHAs resolved
deliberately and named with the version each is, so updating is a decision
rather than a drift.

The media guard scanned `public/spike/` only, so a recording copied anywhere
else under `public/` shipped. The fix is not a list of branding filenames — a
list has to be updated whenever an asset is added, and the day it is not is the
day the guard stops guarding. Git already knows: the branding assets are
tracked, a lecture copied in by hand is not, wherever it was put. Without a
checkout it falls back to the old directory rule rather than to trusting
everything.

**Verified:** an untracked MP4 placed in `public/assets/` — outside the only
directory the old guard looked at — now fails the gate with exit 1 and names
the file.

**Link:** VH-65; review R-13; `.github/workflows/deploy-pages.yml`,
`scripts/check-placeholders.mjs`.

## 2026-08-27 — VH-63: warn only when there is something to lose

**Decision:** hold a screen wake lock for the length of a job, re-taking it
when the tab returns to view, and attach `beforeunload` for exactly the
interval in which work could be lost — which includes an unsaved result, not
just a running job.

**Rationale:** spec 7.5 asks for both and neither existed anywhere in `src/`
(review R-12). A forty-minute encode on a laptop that sleeps is forty minutes
gone, and a reload during one discards it without a word.

Re-acquisition on `visibilitychange` is the part that is easy to leave out and
does most of the work: the browser releases a wake lock whenever the document
is hidden, so a user who switches tabs during a long encode returns to a
machine free to sleep — the exact case the lock was taken for.

The unload warning covers a wider interval than the review proposed. A job in
flight is obvious; a save still streaming out of OPFS is the same risk with a
different name; and a finished file the user has not put anywhere is an hour of
work sitting in scratch that a reload discards. All three, and nothing else —
a page that always warns trains people to dismiss the warning, and then it
protects nothing.

**Verified in Chrome:** no listener and no request while idle; one of each once
a job starts; the warning STAYS attached after the job finishes because the
result is unsaved; and it comes off when the file is saved. The lock itself was
refused with `NotAllowedError` because the pane is not visible — which is the
quiet-degradation path working. Whether a GRANTED lock prevents sleep needs a
visible window and a real sleep, and is not verified here.

**Link:** VH-63; review R-12; spec 7.5; `src/core/keep-awake.ts`,
`src/main.ts`.

## 2026-08-27 — VH-68: four faults that were nobody's ticket

**Decision:** fix all four in one visit — the sliding minimum's counter type,
two config values nothing read, the silence warning's misplaced guard, and the
cross-engine tally.

**Rationale:** the review's consolidation dropped these, and each is the kind
of fault that survives precisely because it is too small to schedule.

`SlidingMinimum.position` counts samples for the length of a file and never
resets, in an `Int32Array` that wraps past 2^31 — 12.4 hours at 48 kHz. After
the wrap the expiry comparison goes negative and the ring cycles forever. Well
outside this tool's envelope; a latent hang is still a latent hang. A
`Float64Array` holds every integer to 2^53 exactly.

`WARNING_THRESHOLDS.clippingDbtp` and `COMPRESSOR.softKnee` were declared and
never read, while `truepeak.ts` carried its own `-0.1` and `compressor.ts` its
own `6`. That is worse than a plain literal: a literal admits where the number
lives, whereas a config entry nobody reads invites someone to tune it and watch
nothing happen. `softKnee: true` also described the shape while a different
file decided the width, so it becomes `kneeDb: 6` — a soft knee is how wide it
is.

`extended-silence` sat inside a guard written for the NOISE test. That guard
exists so a recording with no pauses is not accused of background noise it may
not have — a judgement about noise, applied by accident to silence. An entirely
silent track has every short-term value at `-Infinity`, so the guard emptied and
the one warning that describes it could never fire.

And `run-in-engines.mjs` reported `wanted.length - failures` complete runs, so
"3/3" could mean one ran and two were not installed. Three independent counters
now, and a skip fails the run only when that engine was named explicitly —
defaulting to all three means "whatever is installed"; naming one means "this
one".

**Link:** VH-68; review's dropped findings; `src/audio/limiter.ts`,
`src/audio/truepeak.ts`, `src/audio/compressor.ts`, `src/audio/warnings.ts`,
`src/config/audio.ts`, `scripts/run-in-engines.mjs`.

## 2026-08-27 — VH-62: a status the harness did not earn

**Decision:** give the acceptance report an `external` status, measure both
tracks of the sync meter on one clock, watch the worker's realm as well as the
page's, and make the egress instrument prove it can fire.

**Rationale:** four ways the page could be green without having looked
(review R-11).

Criterion 3 was hard-coded `pass`. The meter conformance it describes is
asserted by `npm run check`, not by that page — so the page could be entirely
green while the gate had never run, or was failing. `external` says where the
evidence is instead of borrowing its colour, and the summary counts it
separately rather than folding it into "passed".

The sync meter read video markers as presentation timestamps and audio markers
as a running count of decoded frames. On a contiguous track starting at zero
those agree, which is why it went unnoticed — but they diverge on a track that
starts late, a gap mid-file, or an edit list, which is precisely the set of
cases the meter exists to judge. That is also why VH-55's second half was
sequenced behind this: it moves the audio start, and would have been graded by
a meter using two clocks.

Criterion 9's instruments are per-realm. A worker has its own `fetch` and its
own resource timeline, and the job runs in a worker — so the only request this
app makes at runtime, for branding, was invisible to a watch on the main
thread, and the criterion was reporting a clean timeline that contained none of
the app's real requests. The worker now runs a watch of its own and reports it
over the protocol; `mergeEgress` joins them, and criterion 1's fixture runs
WITH branding so the fetch actually happens.

And a watch that never fires is indistinguishable from a watch that cannot.
A new check deliberately uploads two bodies — one on `init`, one built into a
`Request`, the shape that used to slip past because only `init.body` was read —
and fails if either goes unseen.

**Note:** `EgressWatch` moved to `core/egress.ts`. The worker needs it, and
production code importing the acceptance harness is the wrong direction.

**Verified directly in Chrome:** both body shapes are caught, the
`Request`-carried one as "present, size unmeasurable". NOT verified: a complete
acceptance run. It takes over an hour in this browser — four minutes per
synthesised corpus entry — which is a finding of its own and is on the
wish-list.

**Link:** VH-62; review R-11; `src/core/egress.ts`, `src/acceptance/run.ts`,
`src/acceptance/measure.ts`, `src/workers/protocol.ts`.

## 2026-08-27 — VH-59: inspect the track that will be encoded

**Decision:** have inspection call `getPrimaryVideoTrack()` and
`getPrimaryAudioTrack()` — the same calls production makes — and say before
processing how many tracks a file holds that the output cannot keep.

**Rationale:** inspection read `getVideoTracks()[0]` and `getAudioTracks()[0]`
while the pipeline asks Mediabunny for its primary tracks, and those are not
the same selection. Mediabunny picks a primary by position, disposition,
bitrate — higher wins — and pairing with the primary video track. An OBS
recording with programme audio on track 0 and a higher-bitrate commentary mic
on track 1 would therefore be inspected against one and encoded from the other,
so the loudness plan, the audio warnings and the whole pre-flight would describe
sound the user will not hear (review R-09). Calling the same API in both places
makes divergence impossible rather than unlikely.

The output carries one video and one audio track by design, so anything beyond
that is content the user loses. `AGENTS.md` requires saying so before
processing, and the source panel already has the pattern — the subtitle notice
sits two rows below. Metadata that fails to copy now reports too, through the
`outputWarnings` channel VH-55 gave a first member.

**Note:** `TrackScan` also counts tracks, from a direct ISOBMFF handler walk.
That count exists to see what Mediabunny cannot — subtitles and chapters — and
is `scanned: false` for WebM. The new counts come from Mediabunny and work for
every container, so the two are complementary rather than duplicated.

**Verified:** a two-audio-track MP4, synthesised with ffmpeg because the real
corpus has none, is described as "This file has 1 more sound track" with the
note before Start is available, and processes to a correct single-track output.

**Link:** VH-59; review R-09; `src/media/inspect.ts`, `src/ui/source-panel.ts`,
`src/media/pipeline.ts`.

## 2026-08-27 — VH-55: measure the loss now, move the video later

**Decision:** make the encoder-delay probe report "unmeasurable" separately
from "zero", and make the onset the compensation discards a visible warning —
but do NOT re-time the video lane in the same task.

**Rationale:** compensating the AAC encoder's ~44 ms delay shifts the audio
timeline earlier and discards whatever lands before zero. Three files in the
real corpus carry energy there — two near -26 dBFS, one near -48 — so what goes
is sometimes the attack of a first word (review R-03). Two separate faults sat
on top of that. The probe returned 0 both for an encoder with genuinely no
delay (Opus, PCM) and for a probe that threw or found no impulse, so nothing
could tell an uncompensated job from a job that needed no compensation. And the
loss was silent, which `AGENTS.md` names as the worst outcome available.

Preserving the samples is possible and the mechanism is known: delay the VIDEO
by the encoder delay instead, which Mediabunny expresses as an empty edit list
(`isobmff-boxes.js` writes `edts` whenever a track's first timestamp is
positive — the module comment saying it writes no edit list is wrong, though
its conclusion stands, because an empty edit cannot express priming-skip
either). The edit itself is about six lines across four timestamp sites.

What is not six lines is proving it. The change moves A/V sync, and the
acceptance meter reads audio markers in decoded-sample time and video markers
in presentation time — so it would measure the one axis this change moves using
two different clocks, and could report either a false pass or a false 44 ms
failure. Making a sync change whose verification is known to be blind is how
silent drift reaches published video. VH-55 keeps the second half, sequenced
after VH-62.

**Rejected:** encoding at the source sample rate; leaving the delay
uncompensated (44 ms sits right on ITU-R BT.1359's detectability threshold);
and shifting the video by a whole number of frames, which would trade exact
sync for 22 ms of audio lead — tighter than the tolerance for audio leading.

**Link:** VH-55; review R-03; `src/media/encoder-delay.ts`,
`src/audio/warnings.ts`, `src/config/audio.ts`.

## 2026-08-27 — VH-57: cancellation is a property of every request

**Decision:** register a request's `AbortController` before its handler can
await, make inspection and pre-flight cancellable, and re-check the signal at
every boundary that commits a result.

**Rationale:** `Cancel leaves nothing behind` is an `AGENTS.md` invariant, and
three separate paths broke it (review R-07). `handleProcess` registered its
controller after `await releaseFinished()`, so a Cancel pressed during cleanup
found an empty map and vanished — a window VH-56 then widened, because cleanup
can now wait on a save lease. Only `process` registered at all, while `main.ts`
posts a `cancel` for any request that exceeds its bound, so a timed-out
inspection or pre-flight went on doing full analysis and probing for a screen
that had given up on it. And the signal stopped at `runPipeline`: the
finished-file verification walks the whole output again with no signal at all,
then posts `processed` unconditionally, so Cancel during the longest silent
phase of a long job answered "Your video is ready."

`analyseSourceAudio` is the subtle one. It stops at the next sample rather than
throwing, so an aborted traversal returns a measurement of PART of the file —
which would then fail the output contract and be reported as a broken video
rather than as the cancellation it was. Every caller now re-checks after it.

The registry moved to `workers/cancellation.ts` because the rule deserves a
test and importing the worker runs its boot. The invariant it pins is one
sentence: a request is cancellable from before its first await.

**Verified in Chrome on a real recording:** Cancel during preparing, analysing
and finishing each returns `cancelled`, leaves no Save control, and leaves the
OPFS jobs root empty. Finishing is the new one — the phase that used to answer
"ready".

**Link:** VH-57; review R-07; `src/workers/cancellation.ts`,
`src/workers/job.worker.ts`, `src/media/inspect.ts`, `src/media/pipeline.ts`.

## 2026-08-27 — VH-56: a finished result is owned, not merely displayed

**Decision:** hold a finished result until the user has it somewhere, protect
its scratch with a worker-side read lease as well as a UI lock, and refuse a
save destination that is the source file.

**Rationale:** the result was a `File` on the screen and nothing more. Four
ways it could be lost, all on ordinary paths (review R-04). A fallback download
was treated as complete the moment `anchor.click()` returned, and the caller
then discarded the OPFS scratch the object URL still reads from lazily.
Starting another job disposed that scratch while a picker save was streaming
out of it, because saving disabled only the Save button. Starting another job
also discarded an unsaved result outright, one click, no question. And the save
picker returns whatever the user selected, so selecting their own source was
allowed — which makes "the original file is never changed" falsifiable in the
interface that says it.

The lease is deliberately belt and braces. The UI lock alone would be enough if
the UI were always right, and VH-36 is what happens when it is not; the lease
makes disposal wait on the reader rather than on a convention. It expires after
{@link SAVE_LEASE_LIMIT_MS} because a lease that cannot expire is a user who
can never start another job.

`isSameEntry()` is the exact identity test and needs a handle for the source,
which the app does not have: the file arrives through `<input type="file">`.
Name, size and modification time together are conclusive enough — a different
file matching all three is the same file by any practical definition — and
`saveFile` uses `isSameEntry` instead whenever a handle is supplied, so
acquiring one later (a VH-32 question) upgrades the guard rather than
replacing it.

**Rejected:** a modal confirmation. The question belongs beside the result it
is about, and `UI-STANDARDS.md` reserves focus-stealing dialogues for something
irreversible the user did not initiate.

**Verified in Chrome on a real recording:** Start asks before discarding and
"Keep it" restores the result intact; a save that is the source is refused
without reaching `createWritable`; Start, the file input and Save are all
locked while a save streams and a programmatic Start click is inert; and the
worker disposes the workspace only after the lease comes back — the ordering
that would otherwise deadlock `discard`.

**Link:** VH-56; review R-04; `src/media/save.ts`, `src/main.ts`,
`src/workers/job.worker.ts`, `src/workers/protocol.ts`.

## 2026-08-27 — VH-50 and VH-54: the contract is measured on the file

**Decision:** solve the step 5 gain against the chain that actually runs, and
hold the limiter a measured 1.0 dB below the published true-peak ceiling.

**Rationale:** two independent reasons the delivered file missed spec §13
criterion 2 while every fixture passed.

The gain was solved against an unlimited chain (`gainDb: null` also sets
`limiter = null`) and then used in one that limits, so the limiter took back
whatever it took back. Invisible on synthesised speech — a ~7 dB crest factor
never reaches the limiter — and up to 2.4 LU on material shaped like a real
lecture. `solveChainGainDb` now measures the real chain and corrects, and the
harness calls that same function instead of re-implementing the rule, which is
what let the two diverge in the first place.

Separately, the limiter is not the last thing to touch the signal: AAC-LC is,
and an MDCT codec does not preserve peak level. Four real lectures, all limited
to exactly −2.0 dBTP, decoded at −1.98, −1.91, −1.90 and −1.61. Resampling was
ruled out — the worst is the one 48 kHz file, which is never resampled. The
limiter's working ceiling is therefore a config value below the published one.
1.0 dB rather than the 0.44 dB worst case because the trade is asymmetric: too
little headroom refuses the user's job, too much costs a decibel of gain
reduction on transients and nothing else.

VH-54 is the same promise one layer down: the oversampling FIR is causal and
had no post-roll, so a full-scale sample in the last frame measured −64 dBTP,
and `flush()` emitted its tail at one frozen gain — 0 dBTP out of a limiter
that guarantees −2.0.

**Measured (2026-08-27, `best` preset, `/spike-real.html`):**

| File | Source | Before | After |
| --- | --- | --- | --- |
| AMCS3059 | −21.86 LUFS / −1.86 dBTP | −16.75 / −1.98 | −16.41 / −2.98 |
| CULT1027 | −23.29 / −3.42 | −16.13 / −1.61 | −16.10 / −2.56 |
| MLAC3139 | −27.24 / −4.50 | −16.08 / −1.91 | −16.10 / −2.94 |
| AMCS2007 | −26.07 / −3.77 | −16.11 / −1.90 | −16.15 / −2.95 |

**Rejected:** encoding at the source sample rate to avoid resampling — spec
§6.1 and §6.2 require 48 kHz, and the measurement showed resampling was not the
cause. Also rejected: a re-encode when the postcondition fails, which would
double an hour-long job to fix a decibel.

**Link:** VH-50, VH-54; review R-01, R-02; `src/audio/gain-solve.ts`,
`src/config/audio.ts`, `src/audio/truepeak.ts`, `src/audio/limiter.ts`.

## 2026-08-27 — VH-31: audio presence is an estimator input

**Decision:** require every output-size projection call to state whether the
inspected source has audio, and charge the configured audio bitrate only when
the job will create an audio track.

**Rationale:** the worker already has the authoritative fact in `SourceReport`.
Making it explicit at the pure-function boundary prevents silent sources from
inflating both the displayed estimate and the storage gate, while leaving the
blocked content-estimator redesign untouched. A default was rejected because
it would preserve the original failure mode for future callers.

**Link:** VH-31; `src/config/presets.ts`, `src/workers/job.worker.ts`.

## 2026-08-26 — VH-53: one shared contract, two native entry points

**Decision:** keep `AGENTS.md` as the canonical shared behavioural contract and
add a short `CLAUDE.md` that imports it. Claude-specific text is limited to the
memory boundary: automatic memory is local recall, while durable facts and task
close-out stay in the repository locations assigned by `AGENTS.md`.

**Rationale:** Codex discovers `AGENTS.md` natively, while Claude Desktop Code
discovers `CLAUDE.md` and supports repository-relative imports. The adapter
therefore gives both tools the same mature invariants and tiered PM Skills read
policy without a second hand-maintained summary. A symlink was rejected because
it leaves no tool-specific layer and is less portable across Windows and synced
filesystems; an independent summary was rejected because it would drift.

**Unchanged:** `AGENTS.md`, application behaviour, the specification set, and
both tools' machine-local generated memory stores.

**Link:** `CLAUDE.md`, `README.md` → "AI project context".

## 2026-08-26 — VH-31: measured, designed, and deliberately not built

**Decision:** run the design workflow, record everything it measured on the
ticket, and DO NOT implement. All three adversarial refuters returned blocking
findings against the recommendation — the third reported after this entry was
first written and only strengthened the conclusion.

**Rationale:** the measurement was worth having and the design was not ready.
Building it at 4am, with no time left for the review pass that had just caught a
regression in work from midnight, would have repeated exactly the mistake that
review existed to find. A measured design plus its confirmed objections is a
better thing to hand over than a half-verified change to the number a lecturer
decides on.

**Two of the ticket's own premises turned out false**, which is the most useful
result and would not have surfaced without measuring:
- The 3.6x headline is stale. VH-47 shipped hours earlier and more than halved
  it — 1.70x now, which I verified by hand against the same file rather than
  taking the agent's figure.
- The over-estimate is not a safety margin. At "Smaller file" the projection
  already falls BELOW the produced file on 4 of 23 real jobs, because the
  encoder overspends its target while the 1.02 container constant is fully
  consumed by real overhead. So this is not "the number is too big" — it is too
  big at one preset and slightly too small at the other, and a fix that only
  shrinks it makes the second half worse.

**What the bake-off settled:** the first three seconds are useless as a sample
(0.049 of actual on one file), because a 3-second encode reproduces its
requested bitrate to ~99.8% and so says nothing about the file. The
source-byte ratio is worse (15.6x on a black lead-in). Only long concatenated
windows track, and even they are driven by WHERE the expensive content sits
rather than by how much is sampled.

**Why the recommendation was refused:** it raises `requiredStorageBytes` on 42
of 46 corpus combinations — a hard block with no override — while its own text
promises it does not; its longer probe moves `estimatedSeconds` across spec
7.3's bands; its wall budget is checked between windows and so cannot bound the
probe; and it puts its largest new cost inside a pre-flight exchange that
already runs against a hard 180 s deadline.

**What survived and should be kept when this is picked up:** two numbers rather
than one, with the shown estimate never reaching `PreflightInput`; a single
`audioBitrateFor` decision site (a refuter found a third caller the design
missed); and wording that states its own nature — but `requiredStorageBytes`
must round UP, or the block can ask for less space than the gate demands.

**Link:** `tickets/VH-31.md`, workflow `wf_e01102b9-014`.

## 2026-08-26 — VH-51: reviewing the unattended run was worth more than another item

**Decision:** run a 25-agent adversarial review over the night's 14 commits
before the maintainer woke, and fix what it confirmed. 15 findings confirmed,
3 refuted.

**Rationale:** `integrations/task.md` says to suggest `review.md` after a
gateless run, and ten items shipped unattended to a live pilot is the strongest
possible case for it. It found a regression that no test caught and that I would
have reported as a clean night's work.

**The regression.** VH-38 replaced a one-hour job deadline with a 60-second
SILENCE bound, justified by "the encode loop reports every thirty frames". True
— and true of the encode loop alone. `inspectFile`, both `planAudio`
traversals and the post-encode verification emit nothing, and all three scale
with the source. So the fix for a duration cap reintroduced one at a much lower
threshold, on exactly the long jobs the original item existed to protect. Three
lenses found it independently. All three phases report now and the bound is
120 s, matching what `main.ts` already allows a standalone inspection.

**The cancellation hole.** VH-37 moved both lanes onto a derived `AbortSignal`
wired with `addEventListener`. A listener attached to an already-aborted signal
never fires — reproduced in Node — so a cancel landing in the window between the
last `throwIfAborted` and that line was lost and the job encoded the whole file.
One line: check `aborted` after attaching.

**Three of my own claims were false**, and correcting them matters more than the
code fixes because they would have been believed:
- `Promise.all` does not leak an unhandled rejection. `PerformPromiseAll` calls
  `.then` on every element as it iterates. I reproduced it: zero events. The
  real defect is that it rejects early and leaves the loser RUNNING into an
  output being torn down — still worth fixing, but not for the stated reason.
- A test named "leaves no rejection unobserved" could not fail, because the
  detection mechanism does not exist in the test environment. Replaced with one
  that asserts the ordering property that actually matters.
- VH-39's "make three stale claims read true" sweep wrote a FOURTH, which VH-44
  falsified four commits later in the same session.

**What the review cleared** is worth recording too, because absence of findings
is only informative if someone looked: the VH-47 bitrate band's arithmetic and
guards, the VH-20 flush's interaction with the limiter's gain, VH-42's A/V sync,
the one-dependency and no-egress invariants, and VH-49's pre-flight config
matching what the job actually asks for.

**Link:** workflow `wf_c248dbde-11f`; `src/config/thresholds.ts`,
`src/media/pipeline.ts`, `src/media/composite.ts`, `src/media/branding.ts`.

## 2026-08-26 — Pruned project memory: the overnight run's own overflow

**Decision:** Split `decision-log.md` at its read-tier floor — the latest ten
entries stay live, twelve go verbatim to
`archive/decision-log-0001-2026-08-25.md` — and moved a second trajectory phase
to `archive/trajectory/trajectory-0002-real-material-and-band-1.md`.
Trajectory 3,321 → 1,423 words; decision-log 22 → 10 entries.

**Rationale:** both overruns were created by the same overnight run that is now
clearing them, which is the right order — leaving them would hand the next
session a mandatory prune before it could pick up any work. The split points are
the read tier itself for the log, and the end of Band 1's first half for the
trajectory, so what stays live is what a session tomorrow would actually reach
for.

**Verified:** three `diff` runs per file against the intact original — archived
slice, kept header, kept tail — all byte-identical before the swap.

**Link:** `pm_skills/project/archive/INDEX.md`.

## 2026-08-26 — VH-44: detect the property, not the engine

**Decision:** `compose()` reads the branding pixels through
`VideoSample.copyTo` when the engine honours a request for RGBA, and through
the canvas readback when it does not. Which is which is decided by asking
`allocationSize({ format: 'RGBA' })` whether it equals `width x height x 4`.

**Rationale:** the ticket proposed probing a known branding frame at startup and
comparing the returned RGBA against expected values. That works, and it ages
badly: the expected values are the ASSETS' values, so re-running
`build-branding.mjs` would silently invalidate the check that protects the
assets. Asking about the size instead tests the same thing — does this engine
mean RGBA when it says RGBA — and depends on nothing that can drift. Safari
answers 5,184,000 where four bytes per pixel is 8,294,400; Chrome and Firefox
answer exactly.

**The route table, measured rather than assumed:** `copyTo` is correct in
Chrome and Firefox and returns the luma plane in Safari; the canvas readback is
correct in Chrome and Safari and un-premultiplies in Firefox. Neither route is
portable, and their union is. The property check happens to select the correct
one in each — which is the point of choosing a property that describes the
actual failure.

**Scaling had to move.** `copyTo` hands back the frame at its own resolution,
so the canvas is no longer doing the fitting. `compositeSampled` interpolates
bilinearly — correct on PREMULTIPLIED colour, which is the space interpolation
is defined in, and another reason the decoder's own buffer is the right thing
to work from.

**Verified:** `compose()` over black — the maximum-error case — now returns
`(74,74,74)` / `(5,11,18)` in Firefox against a file holding `(73,73,73)` /
`(4,10,17)`, where it returned `(17,17,17)` / `(18,40,66)` before. Chrome and
Safari unchanged. Fifteen unit tests pin the sampler, including that it touches
nothing outside the fit rectangle and interpolates rather than steps.

**Deliberately NOT done:** restoring the two controls VH-45 withdrew. The
engineering is finished and verified, but putting controls back in front of
users on a live site is a decision, and VH-32's interface pass may present them
differently anyway. Raised as VH-46b.

**Link:** `src/media/composite.ts`, `src/spike/alpha.ts`, backlog VH-46b.

## 2026-08-26 — VH-43, and the Firefox audio gap it surfaced

**Decision:** verify the corpus's odd shapes with synthesised fixtures carrying
the same properties, in every engine. Then, on what that found: make
`capability.ts` ask `AudioEncoder.isConfigSupported` and let pre-flight block
with `no-aac-encode`.

**Rationale for synthesising:** `samples/` is gitignored and irreplaceable, so a
check that depends on it runs on exactly one machine. The properties are what
matter — 852x480 is interesting because 852 is not a multiple of 4, not because
of what the lecture is about — and those travel.

**What it found, which was not what it was looking for.** Firefox 154 has the
`AudioEncoder` class and refuses `mp4a.40.2` at every bitrate from 64k to 256k
and at both channel counts, while accepting Opus and every video configuration
we ask for. Measured headless and in a normal window, so not an artefact of
headless mode. `capability.ts` checked that the CLASS existed — a different
question — so a Firefox user passed pre-flight, watched a progress bar, and got
"Something went wrong" when the audio track reached the encoder. Every lecture
with sound, in a browser spec section 10 lists as supported.

**Why block rather than warn:** the alternative to blocking is what already
happened, which is the worst version available — the user spends the encode
time before being told. The message names a browser that works, as every block
in this app must.

**What is deliberately NOT decided:** what Firefox users should get. Blocking is
honest and excludes a supported browser from a University tool; WebM/Opus is
behind D11 and contradicts spec 6.1's MP4; dropping audio is not an option. That
is a product decision, so it is VH-49 with `[sign-off]` rather than something to
settle at 2am.

**A closed-by-condition note:** VH-43 carried a warning that a mono source plus
an opening mixes channel counts into one track. Unreachable — VH-33 removed the
opening control and the real closings are silent — so it is recorded against
VH-23, which is what would revive it.

**Link:** `src/spike/shapes.ts`, `src/spike/codecs.ts`,
`src/media/capability.ts`, `tickets/VH-49.md`.

## 2026-08-26 — VH-16: a harness that had never run the real path

**Decision:** the acceptance harness gains a worker-driven check, a
camera-motion fixture for preset comparison, and takes its loudness offset from
the pipeline's own reported figure.

**Rationale, and the one that matters most:** `OpfsWorkspace.createFile` prefers
a `FileSystemSyncAccessHandle` and falls back to `createWritable()` when one is
unavailable — and sync handles are worker-only. The harness called `runPipeline`
on the main thread, so every acceptance run this project has ever done exercised
the FALLBACK and never the path the app takes. That is the kind of gap that
makes a passing harness worse than none, because it is evidence pointing at the
wrong thing.

**Why camera motion:** on the screen-like default fixture — static background,
one moving box — H.264 predicts almost everything for free, both presets land
within a few percent, and comparing them measures nothing. On a field that
changes everywhere every frame they separate properly: 1223 kB against 468 kB,
38%. The fixture is deterministic rather than random, because a fixture that
differs between runs turns a size comparison into a coin toss.

**The offset was a latent trap.** The harness derived it from
`BRANDING_DURATIONS.openingSeconds` — what the opening is SUPPOSED to be — while
the pipeline uses the clip's actual decoded duration. They agree only because
the placeholder is exactly 5.000 s. A real asset a few frames off would have
shifted every loudness window the harness measured, and the harness would have
gone on passing. `PipelineResult` reports the truth now.

**Link:** `src/acceptance/run.ts`, `src/acceptance/fixtures.ts`,
`src/media/pipeline.ts`.

## 2026-08-26 — VH-38: measure silence, not duration

**Decision:** the `process` request's watchdog resets on every message the
worker sends about it, and gives up only after `WORKER_SILENCE_LIMIT_MS` of
quiet. Giving up posts `cancel` before rejecting.

**Rationale:** the old bound asked the wrong question. "Has this job been
running for more than an hour?" is a duration cap, and spec section 7 opens by
saying there is not one; it also gets slow devices exactly backwards, punishing
the machines that most need patience. "Has this job said anything in the last
minute?" is the question that actually separates a wedged worker from a busy
one, and it is answerable because `pipeline.ts` reports a stage every thirty
frames — so a healthy job speaks several times a second however long it runs.

**The retention half mattered as much.** Rejecting without telling the worker
left the job encoding, its result landing in `finished`, and nothing ever
releasing it. The user was told the job had failed while it quietly succeeded
and held its output for the tab's lifetime.

**Why 60 s:** it only has to exceed the longest gap a HEALTHY job can produce,
and the errors are asymmetric — too patient costs a wedged worker some seconds
nobody is watching, too impatient cancels real work. Recorded in
`thresholds.ts` with that reasoning rather than as a bare number.

**Extracted to be testable:** inline in `requestWithId` this needed a worker and
an hour. As `createWatchdog` it is seven assertions under fake timers, including
the one that is easy to miss — a late sign of life must not resurrect a request
whose caller has already been told it failed and whose worker has already been
sent a cancel.

**Link:** `src/core/watchdog.ts`, `src/config/thresholds.ts`, `src/main.ts`.

## 2026-08-26 — VH-20: emit the tail rather than document the loss

**Decision:** `createContentAudioProcessor` returns `{ process, flush }`, and
`feedAudio` emits the flush after the last source sample.

**Rationale:** the ticket offered a choice — emit the tail, or measure the loss
and record it as accepted. Emitting won on a fact that was not in the ticket:
`AudioChain.flush()` already existed and `analyseSourceAudio` already called it.
So the analysis pass measured the whole signal while the encode path dropped its
last look-ahead window, and the two things that are supposed to describe the
same audio disagreed. Documenting that as acceptable would have meant writing
down that the meter and the output measure different things, when the fix was to
call a method that was already there.

**Testing:** frame conservation — in equals out once the flush is included, and
strictly less before it. That is the invariant the pipeline was breaking, and it
holds without asserting anything about the audio's content.

**Link:** `src/media/audio-plan.ts`, `src/media/pipeline.ts`,
`src/audio/chain.test.ts`.

## 2026-08-26 — VH-40: two of three claims survived checking

**Decision:** `check:placeholders` becomes a `prebuild` script; a Vite plugin
removes `branding/README.md` from the output; the worker sets its own minimum
log level. Sourcemaps stay.

**Rationale for the ordering fix:** the guard exists to stop a real lecture
recording reaching a deployed build — the single most direct protection for the
no-egress invariant — and it ran after `build` in the gate and not at all for a
bare `npm run build`, which is exactly what `.github/workflows/deploy-pages.yml`
calls. A guard that fires after the thing it guards is decoration. As `prebuild`
npm runs it before `build` however `build` is invoked.

**Why the worker needed its own line:** it has a separate module scope, so
`main.ts:32` never reached it. The two threads share one diagnostics bundle, so
a bundle was half verbose and half not.

**Two claims did not survive, and this is the more useful half of the item.**
The spike pages do not ship — `rollupOptions.input` names `index.html` alone and
every `spike-*.html` returns 404 on the live site. And the sourcemaps expose
nothing: the repository is PUBLIC, so every line they reveal is already on
GitHub, while they are what turns a diagnostics bundle from a lecturer's machine
into real function names. Removing them would have cost real diagnostic value to
protect nothing. That decision rests on the repository's visibility, not on the
deploy, so the comment in `vite.config.ts` names the condition to revisit.

**Alternatives:** moving `public/branding/README.md` out of `public/` was
rejected — the notes describe the assets beside them and Vite offers no
per-file exclusion for `publicDir`, so deleting after the copy is the smaller
cost.

**Link:** `package.json`, `vite.config.ts`, `src/workers/job.worker.ts`.

## 2026-08-26 — VH-37: report the disease, not the symptom

**Decision:** Move the `InvalidVttError` case to `handleProcess` and delete it
from the two handlers that cannot raise it. Replace `Promise.all` over the feed
lanes with `settleLanes`, which waits for both, aborts the survivor, and
rethrows the original cause in preference to a `CancelledError`.

**Rationale:** both defects turned a known cause into "something went wrong",
which is the one thing `AGENTS.md` says an error must never do. The VTT check
was in two handlers by copy rather than by reason — `offsetVtt` is called from
exactly one place, `pipeline.ts:293`, which only `handleProcess` reaches. Keeping
the dead branches would have left the next reader believing inspection can
produce a subtitle error.

**The lane bug was two bugs.** `Promise.all` rejects on the first failure and
abandons the second promise, so the survivor kept feeding an `Output` that was
already cancelling and then rejected with nothing awaiting it — and because
`diagnostics.ts` hooks `unhandledrejection`, that reached the user as a second
error they had no way to interpret. The fix has to do both things: observe both
rejections, and stop the survivor rather than merely ignoring it.

**Why the cause is preferred over the cancellation:** when the video lane fails,
the audio lane's `CancelledError` is an EFFECT of that failure. Reporting it
would name the symptom. `settleLanes` picks the first non-cancellation cause and
falls back to cancellation only when that is genuinely all that happened — a
user pressing Cancel, where both lanes raise it and there is no truer cause.

**Extracted to be testable.** Inline in `encode()` this needed WebCodecs to
reach. As a pure function over promises it is seven assertions, including the
one that matters most: that no rejection is left unobserved when both lanes fail
independently.

**Link:** `src/media/pipeline.ts`, `src/workers/job.worker.ts`,
`src/media/lanes.test.ts`.

## 2026-08-26 — VH-42: split the duration that was doing two jobs

**Decision:** `PipelineOptions.durationSeconds` becomes `videoDurationSeconds`
and `audioDurationSeconds`. All branding boundaries key off the picture; the
arithmetic moves to a pure `closingTimeline()` in `branding.ts`.

**Rationale:** the bug was not a wrong sum, it was one name meaning two things.
`SourceReport.durationSeconds` is `max(video, audio)`, and the pipeline treated
it as "how long the picture runs". Splitting the field rather than adding one
made the type checker enumerate all four call sites, which is the difference
between fixing this and fixing it everywhere.

**Why the arithmetic moved out:** it sat inside `encode()`, which needs
WebCodecs, so neither failure was reachable from a Node test — and neither case
exists in the corpus, so nothing would have caught them by being run either. A
defect that no test can express is a defect that comes back. It is fourteen
assertions now.

**What trailing audio does.** It keeps playing under the closing rather than
being truncated at the picture's end. The real closing masters carry no audio,
so nothing collides, and cutting a lecturer's last words to match the picture is
the worse error. If a future master does carry a bed, two sources would write
the same stretch of one track — corruption, not a mix — so the content yields
and takes its fade at the boundary instead. That branch is pinned.

**Alternatives:** holding the last frame to cover the gap was rejected — it
invents a freeze the user did not ask for, where letting audio run under opaque
branding is ordinary. Truncating the audio was rejected as losing content.

**Verified:** unit tests for the arithmetic, plus two synthesised fixtures in
`/spike-modes.html`, since the corpus contains neither shape. Audio two seconds
past the picture yields 8.00 s (old code: 10.08 s, with two seconds of empty
video timeline); a 0.5 s source yields 5.52 s, proving the `over-freeze`
downgrade fired rather than a negative overlay start.

**Link:** `src/media/branding.ts`, `src/media/pipeline.ts`,
`src/media/branding-timeline.test.ts`.

## 2026-08-26 — VH-47: the band may only ever lower the figure

**Decision:** "Best quality" asks for the geometric mean of spec 6.1's anchor
and the source's measured bits-per-pixel-per-frame, clamped to
`[0.03, 0.12]` bpp — the upper bound being the anchor itself. `OutputShape`
gained `bitrateBasis`, and `bitrateWasCappedToSource` now reads it instead of
comparing two numbers.

**Rationale:** VH-41 exempted this preset from the never-exceed-source cap for a
sound reason, but the figure it exempted never looked at the source, so the
headroom was inverted — 4.0x for the file with nothing left to protect. A
geometric mean gives the ratio the shape it should have, `sqrt(anchor/sourceBpp)`,
which shrinks as the source approaches transparency.

**Method:** an eight-agent workflow — one scout, three independent designs, a
judge, three adversarial refuters. It was worth it. The scout found that the
change breaks a test I wrote the day before and that two harnesses
(`acceptance/run.ts`, `spike/real.ts`) never pass a source bitrate, so the rule
would have shipped having run on no real material. Two refuters returned
BLOCKING findings against the judge's own recommendation.

**What the refutation changed.** The judge proposed a 0.18 bpp ceiling, above
the 0.12 anchor. A refuter encoded the real files and scored them: that ceiling
adds 77-933 MB to 7 of 23 corpus files for +0.60 VMAF against a roughly
6-point JND, and raises required free storage by up to 50%, which can turn a job
that runs today into a hard `insufficient-storage` block. Setting the ceiling to
the anchor returns all 7 raises to exactly today's figure, leaves all 16
reductions untouched, and buys a property worth more than the bits: **the figure
can only fall**, so nothing that runs today can be refused tomorrow.

**Half the ticket was retired by measurement.** VH-47 argued two defects — over-
asking on thin sources and under-serving pristine masters. The first is real and
fixed. The second is not a defect: the destination re-encodes on ingest, so the
extra bits die there. The ticket's proposed 1.2x floor would have forbidden the
correct answer on 7 real files.

**Also corrected, found by the scout:** `MAC_EXPORT` in `presets.test.ts` carried
frame rate 25 where the file measures 1000/33 and conforms to 30 — my error from
2026-08-25. At 25 its assertion cleared the cap by 0.16%. And `sourceBpp` must
divide by the SOURCE's rate, not the conformed one; they differ by the conform
ratio, which reaches 15% on a 40 fps source.

**Verified independently:** I re-measured six corpus files with ffprobe rather
than trusting the agents. Teams 1,005,714, AMCS3068 484,914 and Nonreligion
19,105,327 match to the byte.

**Alternatives:** a ratio cap at 2.0x the source (the ticket's, and one
refuter's blocking finding) was NOT adopted. It is unmeasured, and the same
refuter that measured the reductions found today's cuts already visually
transparent; going further would act on argument over evidence. The absolute
50 Mbps backstop was dropped as out of scope — it would change behaviour on a
shape the corpus does not contain, and dropping it makes "never above today's
figure" true universally rather than nearly.

**Open, and deliberately not decided here:** `BEST_SOURCE_BLEND = 0.5` is the
one constant that is judgement. The calibration probe already decodes three
seconds of the real file, so encoding that sample at a spread of multiples and
scoring each through a second encode would measure it — two files at widely
separated densities determine it, a third validates. On the wish-list; the
ticket file was evicted on ship, so this entry is the record.

**Link:** spec §6.1 and §6.2 doc-deltas; `src/config/presets.ts`; workflow
`wf_00530dba-cb8`.

## 2026-08-27 — VH-52: keep the CI bound; explain contention at failure

**Decision:** Keep `testTimeout: 30_000` unchanged. `npm test` now prints one
settled-machine instruction immediately before Vitest, whose default failure
report already names the failing file and includes both file and test-case
durations. A timeout after an unusually long duration is a reason to rerun
idle before changing an assertion or extending the bound; it is not automatic
proof that the test is wrong.

**Rationale:** The 30-second value was measured for a roughly 1.5x CI runner,
whereas local browser contention has stretched a roughly four-second DSP file
to 540 seconds. Enlarging the timeout enough to cover that starvation would
make a genuinely hung test take minutes to report. A custom reporter, wrapper
script or verbose output would add machinery or noise without adding evidence
the built-in reporter lacks. Auto-jazz therefore chose the smallest reversible
quality-gate change and preserved the existing bound.

**Verification:** An intentional `--testTimeout=1` run failed
`chain.test.ts`, printed the new instruction, the 25.9-second file duration and
each case duration. The normal `npm run check` then passed 361 tests plus type,
lint, build, documentation and memory checks.

**Link:** `package.json`; `DEV-INFRASTRUCTURE.md` Quality gate.

## 2026-08-26 — VH-50: output compliance is a postcondition, not advice

**Decision:** A finalized MP4 is not reported as `processed` until its decoded
output audio passes one shared, pure postcondition: finite measurements,
integrated loudness within −16 ±0.5 LUFS, and true peak at or below −2 dBTP.
Missing or non-finite audio on an audio-bearing source is also a failure. The
worker disposes the output through its existing error path; the acceptance
harness calls the same verifier.

**Rationale:** Warning thresholds describe source material and cannot certify
the exported file. The old acceptance criterion measured a synthetic corpus
but defaulted missing measurements to passing values and never made an
out-of-range result fail. That let the harness pass the product's protected
invariant while real material missed it. Integrated loudness is still measured
over content, while true peak is measured over the whole output because the
ceiling applies to branding boundaries too.

**Limit:** This slice makes failure honest; it does not calibrate it away. The
Chromium corpus now reports the two synthetic misses as −1.9968 and −1.9989
dBTP rather than rounding both to a misleading −2.00, while the worker-path
fixture and four other browser criteria pass. A 0.0032 dB miss does not justify
guessing an AAC margin: R-02's confirmed FIR/limiter finalization repair comes
first and crosses protected DSP. VH-50 remains open until that repair lands,
the gain/limiter cause is measured on real material, both figures pass, and the
regression case is pinned.

**Link:** spec §13.2; `src/media/output-verification.ts`;
`src/workers/job.worker.ts`; `src/acceptance/run.ts`.

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

## Archived: 12 earlier entries — see archive/decision-log-0001-2026-08-25.md
