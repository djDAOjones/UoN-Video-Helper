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

## 2026-08-27 — VH-73: the finished file's picture is checked too

**Decision:** a job does not report `processed` until one frame decodes out of
the finished file's primary video track.

**Rationale:** `verifyOutputAudio` enforces spec §13 criterion 2 and looks only
at sound. Nothing looked at the picture, so a file whose video track decoded to
nothing would still reach "Your video is ready" — the exact shape of failure
this project calls the worst available, since the user is told the opposite of
what happened.

One frame, not a traversal. The failure being caught is a track that decodes to
nothing, not a subtly wrong one, and the finishing pass already walks the whole
output once for loudness — VH-51 made that window visible precisely because it
is long.

Ported from the archived branch (VH-71 WP1) but not verbatim. The original used
`AbortSignal.throwIfAborted`, which raises a `DOMException` named `AbortError`
— and `job.worker.ts` reports that as a FAILED job. Ours raises
`CancelledError`, which it reports as cancelled. VH-57 made every phase answer
Cancel honestly and this is a phase, so the port uses the project's own
`throwIfAborted`. A verbatim copy would have quietly regressed it.

**Verified:** six unit cases including cancel-reports-cancelled and
stops-after-one-frame, plus a real 12-second job in Chrome whose finished file
passes the check.

**Also, unblocking the gate:** a `field-report-*` export directory appeared
untracked while this was in flight, and broke both `docs:lint` (each export
concatenates several documents, so it has several H1s by construction) and
`docs:links` (211 links written relative to where the originals live). Both
tools now skip it. Not gitignored — whether that export belongs in the
repository is the maintainer's call, not a side effect of my needing a green
gate.

**Link:** VH-73, VH-71 WP1, VH-57; `src/media/output-integrity.ts`,
`src/workers/job.worker.ts`, `check-links.mjs`, `.markdownlint-cli2.jsonc`.

## 2026-08-27 — VH-72: one codec string, and a correction to VH-60

**Decision:** production passes pre-flight's own codec string to Mediabunny
through `fullCodecString`, so one string is validated and used.

**Rationale:** `videoEncodingConfigFor` handed Mediabunny the abstract
`codec: 'avc'` and let it derive the rest. Its `buildVideoCodecString` picks
the AVC level from macroblock count and bitrate and never looks at frame rate,
so 4K60 and 4K30 resolve identically — production asked for Level 5.1 where
pre-flight had derived 5.2.

**Correcting VH-60.** That entry says the fixed 5.1 string meant "a stream
declaring a level it exceeds, for a strict downstream decoder to reject after
publication". That is wrong, and it was inferred rather than measured — from
`isConfigSupported` accepting the config, which says nothing about the
bitstream. Measured directly on 2026-08-27, by reading the level byte out of
the `avcC` record the encoder emits:

| Asked for | Content | Encoder wrote |
| --- | --- | --- |
| `avc1.640033` (5.1) | 4K60 | `avc1.640034` (5.2) |
| `avc1.640034` (5.2) | 4K60 | `avc1.640034` (5.2) |
| `avc1.64002a` (4.2) | 852x480p30 | `avc1.64001f` (3.1) |

Chrome treats the requested level as a floor and writes what the content
actually needs. No malformed file was ever produced, and the level was never
the user-facing risk. This is append-only, so VH-60's entry stands as written
and this corrects it.

**What was actually wrong** is narrower and still worth fixing:
`isConfigSupported` vetted a configuration the encoder never received, so
pre-flight's "yes, this will encode" described something else. On a codebase
whose one live capability block exists because an engine's answer differed from
the obvious guess (Firefox and AAC, VH-49), checking the wrong configuration is
not a theoretical complaint.

**Link:** VH-72, VH-60, VH-71 WP1; `src/media/encoding.ts`.

## 2026-08-27 — VH-76: a gate that overwrote its own evidence

**Decision:** the quality gate builds to a temporary directory. `npm run build`
keeps writing `dist/` for deploys; `npm run check` no longer writes anything.

**Rationale:** `AGENTS.md` → "One-command quality gate" says check reports and
never writes, and `DEV-INFRASTRUCTURE.md` repeated the claim under the heading
"Non-mutating and CI-safe". It was not true: `check` ran `build`, which
rewrites `dist/`.

That is not a tidiness point. Every green run replaced the artifact it had just
certified, so the gate could never vouch for what was on disk — and `dist/` is
what a deploy publishes. Proven rather than argued: the fingerprint of `dist/`
before a gate run and after it differ.

Ported from the archived implementation branch (VH-71 WP4) rather than written
fresh, with one addition — the original removed its temp directory in a
`finally`, which does not run on SIGINT. A gate interrupted with Ctrl-C is an
ordinary event, so the handlers are explicit.

**Verified:** the `dist/` fingerprint is byte-identical either side of a green
`check`, and no temp directory survives the run. The documented gate command in
`DEV-INFRASTRUCTURE.md` matches `package.json` again, and says plainly that the
non-mutating claim preceded the behaviour.

**Link:** VH-76, VH-71 WP4; `scripts/check-build.mjs`, `package.json`,
`DEV-INFRASTRUCTURE.md`.

## 2026-08-27 — VH-71: the archived branch, cross-checked feature by feature

**Decision:** before letting the archived branch rest, reconcile it against
HEAD by evidence rather than memory: a module inventory (23 archive-only
modules, each traced to its HEAD equivalent or absence), a 30-finding
coverage audit of the 2026-08-26 internal review against HEAD code, and a
read of the branch's own decision record. The remainders became
`tickets/VH-71.md` — ordered work packages — and one-line amendments to
VH-55, VH-19, VH-62 and VH-70 pointing there.

**What the audit settled:** the mainline arc fixed 20 of 30 review findings
outright and independently built equivalents for most of the branch's
architecture (selection epochs, result leases, gain solve, save guard, OPFS
lock atomicity, wake/unload, egress negative controls). What it never
covered: P1-02's product-side collapse of source audio offsets and gaps —
the one uncovered P1, which escaped because the arc remediated the R-numbered
review and this is a P-number — plus the preflight/production encoder-config
divergence (P2-02 residual), an acceptance cancellation that never drives the
worker protocol (P2-07), a diagnostics bundle with no job context (P2-10),
config strays (P3-02), four absent lifecycle guards, a `check` gate that
rewrites `dist/`, and the branch's complete VH-19 classifier, which satisfies
the open item's own acceptance conditions.

**Rationale:** two agents remediated the same review in parallel; archiving
the loser without a diff would have silently discarded the fixes and the one
feature the winner never built. The two audit agents contradicted each other
on one claim — whether the wake lock covers saves — and the code settled it
(`setSaveInFlight` never touches `KeepAwake`), which is why the plan records
file:line evidence, not survey conclusions.

**Not reconciled, deliberately:** the conveyor UI (VH-32: the simplicity is
the design), picture fades (VH-25: cut), the archived size-ceiling copy
(mainline VH-31 shipped its own), the directory-save model, both authority
modules, and the ~900-line protocol-level egress apparatus — each superseded
by a recorded mainline decision, listed with reasons in the ticket.

**Link:** `tickets/VH-71.md`, itemised as VH-72..VH-78 plus the VH-19/VH-55/
VH-62/VH-70 amendments; tag `archive/repository-review-implementation`.

## 2026-08-27 — Stale branches archived as tags, not deleted

**Decision:** Resolve the two stale `codex/*` branches by tagging their tips
`archive/<branch-name>` and pushing the tags **before** deleting the branches.
`codex/repository-review-implementation` (10 commits) and
`codex/comprehensive-review-remediation` (1 commit) are gone from the branch
list; both tips stay reachable at `archive/repository-review-implementation`
(`d6c5edb`) and `archive/comprehensive-review-remediation` (`81c0012`). The
abandoned scratch worktree at
`/private/tmp/uon-video-helper-review-implementation-20260826` was removed —
clean, fully pushed, untouched since 2026-08-26.

**Rationale:** the implementation branch is the only copy of the road not
taken. It implements VH-19's content classifier, VH-25's softened boundaries,
VH-31's audio projection and VH-32's UI guidance — all four superseded on
2026-08-27 by decisions that went the other way (VH-19 blocked on the probe
sampling the title card, VH-25 cut, VH-31 reframed as an honest upper bound,
VH-32 closed differently). Deleting it outright would destroy working code that
becomes relevant again the moment VH-19 unblocks; keeping the branch leaves
stale refs that read as live work. A tag is the git equivalent of this
project's own memory archives — verbatim, permanently reachable, and clearly
not the live line. The second branch's content was byte-verified as already
living at `reviews/2026-08-26/uon-video-helper-internal-code-review-2026-08-26.md`
(one relative link differs), so its tag is completeness only.

**Verified:** both tags confirmed on `origin` with dereferenced `^{}` SHAs
matching the original branch tips before either deletion ran. Recover either
with `git checkout archive/<name>`.

**Link:** first tags in the repo; `archive/` namespace chosen so it cannot
collide with the `vMAJOR.MINOR.PATCH` product-version tags DEV-INFRASTRUCTURE
reserves.

## 2026-08-27 — Pruned project memory: the review batch outgrew the log again

**Decision:** Split `decision-log.md` at the 70% prune-to target — the latest
14 entries stay live, 25 went verbatim to
`archive/decision-log-0002-2026-08-25-to-2026-08-27.md` — and moved the
2026-08-26 remediation run plus Band 1's close on real material to
`archive/trajectory/trajectory-0003-review-remediation-and-band-1-close.md`.
Decision-log 39 → 14 entries; trajectory 3,010 → 1,303 words. The file map
also dropped the four deleted `opening-*.mp4` placeholder paths (gone since
VH-25/VH-23) via `gen-file-map.mjs` — 161 → 157 mapped files.

**Rationale:** the repository-review remediation wrote most of 29 entries in
two days, which is the log doing its job, not bloat; the split point keeps the
whole decision-closing day of 2026-08-27 live, which is what the next session
reaches for. Doc-sync was deliberately NOT run: 13 open deltas sit over the
10-line threshold and wait for their own sign-off session per the
protected-doc rule.

**Verified:** `diff` runs per file against the intact original — archived
slice and kept slice byte-identical before each swap; 14 + 25 = 39 entries
reconciled; trajectory pointer integrity re-checked after the split.

**Link:** `pm_skills/project/archive/INDEX.md`.

## 2026-08-27 — VH-26: the colour fear did not reproduce

**Decision:** take five phone samples into `samples/phone/`, and reduce VH-26
from "the picture is silently wrong" to two specific, smaller questions.

**Rationale:** the maintainer supplied a curated list of directly-downloadable
phone recordings. Five were taken — HLG 1080p, Dolby Vision 4K60, an 8-bit 4K30
pair and a legacy 3GP — and every one was classified with `ffprobe` rather than
from its filename, which turned out to matter: the two files published as "SDR"
and "HDR" are both plain 8-bit H.264 bt709. The supplied document warns about
exactly that and was right.

VH-26 has said since 2026-08-25 that phone HDR would come out "silently washed
out or crushed", because `src/` has no colour-space or tone-map handling at
all. Measured, it does not. One frame from each of the two genuinely-HDR files,
source against output, read through a `<video>` element so the numbers describe
what a viewer sees: the HLG 1080p file reads mean 110 / p05 5 / p50 109 / p95
219 at source and 110 / 5 / 108 / 219 out; the Dolby Vision 4K60 file reads
130 / 11 / 137 / 233 in and 131 / 13 / 139 / 233 out. Within two units
everywhere.

The reason is that the browser tone-maps HLG to SDR when it decodes, and the
pipeline encodes what it is handed. Having no colour handling of our own turns
out to be correct here rather than merely absent — though it is correct by
inheritance, which is worth knowing rather than relying on.

Two smaller questions survive. Firefox is untested, and the question there is
not colour but whether an undecodable HEVC source hits VH-60's
`no-source-decode` block cleanly instead of failing mid-job. And portrait is
still absent from the corpus, so portrait branding composition remains
unspecified.

**Incidental, and worth a note:** 4K60 encodes at about 1.3x real time on this
MacBook (16.5 s for 21.7 s), which is far better than feared — but a 4K60 phone
video comes out BIGGER than it went in, 139 MB to 154 MB, because "best
quality" anchors to a ~51 Mbps source (VH-47). Not a defect; a surprise, and
the smaller preset is the answer.

**Link:** VH-26, VH-60, VH-47; `samples/phone/`, `pm_skills/project/tickets/VH-26.md`.

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

## Archived: 25 entries, 2026-08-25 → 2026-08-27 — see archive/decision-log-0002-2026-08-25-to-2026-08-27.md

## Archived: 12 earlier entries — see archive/decision-log-0001-2026-08-25.md
