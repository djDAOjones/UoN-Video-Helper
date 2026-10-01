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

## 2026-10-01 — VH-100: the estimate counts every stage, and the video probe is the error left

**Decision:** the pre-flight time estimate is five stages (`jobTimeEstimate`).
The video at the probe's rate, as before; the closing's frames at the same
rate, for the longest closing, since pre-flight runs before it is chosen (as
for the size); and three audio stages priced in analysis passes — the pass
pre-flight already runs over the kept part for the §5.4 warnings, now timed.
Planning is 1 + 2 × (1 + 3) + 3 = 12 passes (A; B and three refinements at
two each; the codec probe at three), pass C two, the output check one. The
multiples are `AUDIO_STAGE_PASSES`. The probe's three-second audio sample is
gone, so VH-95's divide-by-zero cannot recur; its three tests pinned the
two-pass arithmetic this retires and were replaced, the finite case kept.

**Rationale:** the estimate counted two audio passes at a cold 3 s rate; a job
makes six or seven and a codec probe. Timing a pass pre-flight already makes
adds nothing under its 180 s deadline — VH-31's objection to a longer probe.

**Measured (headless Chrome, this MacBook):**

| Job | Estimate: total (video / planning) | Real: total (encoding / planning) |
| --- | --- | --- |
| AMCS3059 130 s 480p, best, fade | 26 s (19.1 / 4.7) | 32.4 s (26.7 / 3.9) |
| CULT2011 335 s 1080p, best, fade | 58 s (44.5 / 10.3) | 58.0 s (46.4 / 10.0) |
| PHIL 374 s 1080p, best, fade | 111 s (90.2 / 15.7) | 60.9 s (43.5 / 15.7) |
| AMCS3059, smaller, cut | 24 s (17.8 / 4.3) | 36.9 s (32.3 / 3.8) |
| CULT2011, smaller, cut | 59 s (45.3 / 10.6) | 83.0 s (71.2 / 10.0) |

Planning now lands within 0.8 s every time. The video does not: the probe
read PHIL at 104 fps here and 187 minutes before, and real encodes ran at
0.5–1.8× its figure — the error that dominates now, older than this item, and
parked on the wish-list. (The table predates the check dropping the silent
closing from its length, which moves no figure by 0.1 s.)

**Gates assumed (auto-jazz):** scope — the stages the item names, not the
video probe; option — time the existing pass rather than lengthen the probe.

**Link:** VH-100; `src/media/probe.ts`, `src/config/thresholds.ts`,
`src/workers/job.worker.ts`; doc-delta §7.1.

## 2026-10-01 — VH-99: true peak skips a span at a time, and planning nearly halves

**Decision:** every per-frame decision in the true-peak detector and the
limiter is kept exactly, behind a cheaper exact test: one scan bounds all the
windows ending in a 32-frame span (`SPAN_FRAMES`), and a span that clears it
is done. Windows are read from a history buffer (`InterpolatorHistory`)
rather than shifted through a delay line, and the four-phase convolution is
one function both share. The compressor skips its `log10` below the knee's
lower edge, less a 1e-9 margin, where the curve is the identity. Output is
bit-identical. `SPAN_FRAMES` and `KNEE_EDGE_MARGIN` stay out of `config/`:
they change speed, never output. The item's other cheap win rode along:
`detectSourceWarnings` sorts the short-term curve once, as a typed array,
not twice with a comparator — 260 → 30 ms for an hour.

**Rationale:** a CPU profile of the planning passes over a real 374 s lecture
put half the time in the detector's and limiter's window scans and shifts,
the convolution they guard under 1%, and the compressor's `log10` and `pow`
at a fifth. The ticket's guess — the skip rarely holds, so the convolution
runs every sample — was the reverse; and the shift alone was not it (a ring
buffer gained nothing). The skip had to get cheaper.

**Measured (this MacBook, old and new interleaved):** per stage on that
lecture, limiter 1,352 → 411 ms, compressor 679 → 368, true peak 805 → 117
on the source and 832 → 140 limited; loudness untouched. Planning in headless
Chrome, decode and codec probe included: AMCS3059 (130 s) 7.35 → 3.88 s,
CULT2011 (335 s) 17.9 → 10.5 s, medians of three. An hour now plans in
103–138 s (was 190–215); pass A 10–12.5 s, a whole-chain pass 17–21 s, decode
5–7 s. The "3.6 s" comments quote these now, and `GAIN_SOLVE` says what the
corpus shows: five of six real recordings pay all three refinement passes.

**Verified:** pass-C output hash, gain, delivered LUFS and dBTP, source peak
and clip count identical on six real recordings; EBU Tech 3341 unchanged and
green. New tests hold the detector and limiter to exhaustive no-skip oracles
bit for bit at chunk sizes around 12, 13 and 32, and the compressor to a
full-curve oracle at the knee; each fails under its mutations. A bound
missing a window's oldest sample is invisible by construction — its taps are
0 or 5e-34.

**Gates assumed (auto-jazz):** scope — the three DSP modules and the stale
comments; option — exact skips, because bit-identity makes both of the
maintainer's conditions checkable.

**Dropped:** a `pow` skip (exact, 1–3%); comparison wraps for `%` in the
limiter (6% of the limiter). Parked on the wish-list: true peak in the B and
B′ passes (9%), a better solver step, and CULT2011's corrupt AAC burst.

**Link:** VH-99; `src/audio/truepeak.ts`, `limiter.ts`, `compressor.ts`,
`warnings.ts`, their tests, `test/helpers/signals.ts`.

## 2026-10-01 — Pruned project memory: room for the overnight run

**Decision:** split `decision-log.md` at the latest 10 entries; the 11 older
ones, all 2026-09-30 (VH-26's close back to VH-87), went verbatim to
`archive/decision-log-0005-2026-09-30.md`. Decision-log 21 → 10 entries (11
with this one). Maintainer-approved as a lossless move.

**Rationale:** the doc-sync entry took the log to 21 against a budget of 20,
and the gateless run starting 02:02 adds an entry per item and per review fix.
Keeping 14 (the 70% target) would re-fire by morning; 10 is the read-tier
floor and leaves the run its room. Backlog Active over its soft word budget is
reported, not compressed — the maintainer's standing call.

**Verified:** `diff` per slice against the intact original before the swap —
archived, kept and pointer slices byte-identical; 10 + 11 = 21 reconciled.

**Link:** `pm_skills/project/archive/INDEX.md`.

## 2026-10-01 — Doc-sync: the specification meets the trim, and six answers

**Decision:** reconcile all 23 open doc-deltas in one signed-off batch across
three docs — `01-specification.md` (25 edits), `02-technical-rationale.md` (5),
`03-open-decisions.md` (8). 23 applied, 0 deferred. The ledger said two docs;
four of its lines targeted the third.

**Rationale:**

- **22 were the spec going stale**, the code already right: the five-step
  workflow with Trim (§9.1, §12), the three closing controls (§4.1, §4.3), the
  screen's names for the two outputs (§6), VH-47's source-anchored bitrate
  (§6.1, §6.2), the gain aimed through the codec and the ceiling as the file's
  (§5.2 steps 5–6), the freeze applied twice (step 3), no caption file (§8.3),
  built for Chrome with Firefox refused for sound (§10), and D1, D4–D7, D10 and
  D12 answered. Three of them — §6.1, §5.2 steps 3 and 6 — began as rule
  defects the code has since corrected.
- **One was the rule itself.** §8.1 re-timed captions "to match inserted
  branding"; a trimmed start moves every cue the other way. It now re-times to
  match the output. It leads no code: v1 carries no caption at all.
- **Edits went past the ledger where a source did:** trim reaches `T` (§4.3),
  §5.2 step 1, §7.1 and §13 criteria 2 and 6 (where the harness files its trim
  cases, so no criterion 10); VH-49/VH-98 reach §7.3's Block row and rationale
  §2.1; VH-24 reaches spec §2 and rationale §4.2.
- **Numbering kept.** §8.3 step 2 is struck through in place because code cites
  "spec 8.3.4" and "8.3 step 2". Answered decisions moved to a new Answered
  section of `03-open-decisions.md`, with their numbers intact.

**Found, not applied:** D2, D3 and §4.4's picture fades are stale too — three
new ledger lines. Drag-and-drop (§9.1) was never built or decided; kept in the
spec, parked on the wish-list. `brief.md` corrected to match.

**Link:** `pm_skills/project/doc-deltas.md` (23 ticked, 3 opened); spec §§2,
4.1–4.3, 5.2, 6, 7.1, 7.3, 8, 9.1, 10, 12, 13; rationale §§2.1, 4.2, 4.3, 6.

## 2026-10-01 — VH-96: the Trim step, and VH-30 closed

**Decision:** Trim is step 2 of five (Choose, Trim, Closing branding, File
size, Create), revealed with the others once a video is read and reset to the
whole video for each new one. It holds the browser's own `<video controls>`
on a local object URL (no request, no autoplay, paused when a job starts);
Carbon's range slider built from two native range inputs on one track, each
labelled ("Start", "End") with its place in words as `aria-valuetext`;
"Start time" / "End time" fields (`m:ss.s`, tenths shown, exact value kept)
beside "Set start here" / "Set end here"; the kept part in words; and "Use
the whole video". Arrow keys move a handle 1 s and Page keys 10 s
(`TRIM_KEY_STEP_SECONDS`, `TRIM_PAGE_STEP_SECONDS`). The handles cannot cross
or come closer than the 3 s minimum — a constraint on the slider; a typed or
"here" time that breaks the rules is refused beside the fields in the
worker's own words, never clamped, and Start comes down until it is put
right. Every committed change stops what is in flight and re-runs the device
check after 500 ms of stillness (`TRIM_RECHECK_DELAY_MS`), and the job takes
the range its verdict was checked for. Untouched, no range is sent. A video
shorter than 3 s cannot be trimmed and says so; a file the player cannot
show keeps working fields and says the preview is unavailable. After the
Codex review: a typed time past the video's end is refused with its length
rather than moved to the end (the end exactly as the fields show it, rounded
to a tenth, is the one exception, so what the page shows can be typed back); a re-check waiting to run is cancelled when
the file or the output changes; and a new file empties the step — "Reading
the video…", then either its times or "There is no video to trim: that file
could not be read." — so nothing of the last video is shown.

**Rationale:** WCAG 2.5.7 decided the shape — never drag-only, so three
routes to each end. Validating with the worker's own `normaliseKeptRange`
means the page and the job cannot disagree about a range. Trim sits second
because the user watches the video before deciding how it closes and how
big it is. VH-30 closes with it: both children shipped, and the identity
change was signed off on 2026-09-30.

**Verified:** Chrome, dev build. A real 130 s recording: five arrow presses
and Page Up put the start at 15 s, Start came down and came back with the
verdict for the kept part (13.8 → 12.3 MB); "1:40" typed; "abc" refused
beside the field with the page saying to put it right; a start after the end
refused in the worker's words on both fields; "Set start here" at 20.37 s
kept the exact value. A trimmed job ran to 83.7 s (79.6 s kept plus the 4 s
closing). On a generated video with a moving box, trimmed 12.3–47.7 s, the
finished file's first frame matched the preview at 12.3 s better than its
neighbours (4.2 against 6.0–9.7) and its last frames matched the preview at
the out-point. Mouse drags on both handles; handles cannot cross; phone
width stacks the fields with no sideways scroll; dark theme. A `blob:`
preview is not egress: criterion 9 already runs across a check that loads
one. Tests: time reading and writing, the range check, the summary and
valuetext wording, key steps, and the step's markup.

**Link:** VH-96, VH-30, VH-95; `src/ui/trim.ts`, `src/config/trim.ts`,
`src/main.ts`, `index.html`, doc-deltas §9.1 and §12.

## 2026-09-30 — VH-95: the trim engine, with each cut on a frame edge

**Decision:** `preflight` and `process` take an optional `keptRange`
(`{ startSeconds, endSeconds }`, source seconds). The worker validates it
once (`normaliseKeptRange`): a range equal to the file is no range, and takes
exactly the untrimmed path; a start after the end or a keep under
`KEPT_MIN_SECONDS` (3 s, the short-term window) is refused in a sentence,
never clamped. The pipeline then moves each cut to the edge of the frame it
falls in — in-point back to the start of the frame showing there, out-point
on to its end — from packet metadata, before anything reads the source. The
in-point becomes the shared origin of both lanes; every audio pass (A, B, B′
and C) reads the same range and slices each decoded block to it with one
function (`clipAudioBlock`); spans end at the out-point; a cut mid-sound
fades whatever adjoins it. Pre-flight's warnings, size, time and picture
class, and the calibration probe, all describe the kept part.

**Rationale:** loudness is the one interaction that produces a wrong file
rather than a wrong duration, so it is measured on the kept part only, and
the same slice in every pass keeps the envelope indexed against the stream it
is applied to (VH-74). The frame snap was not in the ticket; the harness
found it. A cut half-way through a 25 fps frame started the sound at the cut
and the picture on the next frame boundary: a constant 24 ms offset at every
marker, against a 10 ms limit, where the same file untrimmed reads 4.0 ms.
Picture is whole frames and sound is samples, so only a frame edge is an
instant both can share; it moves a cut by at most one frame, and keeps the
frames showing at the chosen points. On the variable-rate fixture the same
error had surfaced only as 13 ms of fitted "drift" in the grid's scatter,
which is why the trimmed sync case uses a constant-rate source and compares
against the same file untrimmed.

Three follow-ups from the Codex review, each reproduced first. A hole in the
audio that spans the in-point is silence from the cut: the gap filler is
anchored at the cut (or at the track's own start, if later) in every pass,
where before the first kept sound was placed at the cut, seconds ahead of
its picture. A keep with no sound in it — the track starts after the
out-point, or the cut sits inside a hole — is a silent job: `planAudio` and
`analyseSourceAudio` return `null`, no audio track is added, and the worker
verifies audio only when the pipeline reports it included some; before, the
job failed. And the whole of a file shorter than the 3 s minimum is no cut,
checked before the minimum, so untouched handles never refuse a short file.
A second review round: gap silence is now made lazily in one-second blocks
(`GAP_SILENCE_BLOCK_SECONDS`) on every path, mid-track holes included —
whole, a 30-minute hole was about 690 MB; pre-flight asks for the AAC
encoder only when the kept part has sound, so Firefox no longer blocks a
silent keep; and the probe counts audio its window never reached as
unmeasured — it was dividing by zero, and every such file, trimmed or late-
starting, was called a "very long job". A third round: each silence block
reports liveness and hears a cancel during analysis, and the encode checks
for a cancel before making the next block rather than after, so none is
made and left unclosed; a cancel mid-hole leaves the whole analysis pass.

**Verified:** acceptance harness, 13 passed, 0 failed. Trimmed loudness: a
source drifting from −4 to −34 dBFS, kept 40–70 s — −16.12 LUFS on the kept
content, −4.54 dBTP, picture 34.00 s. Trimmed sync: seven markers, 4.0 ms at
each, identical to the untrimmed file (added 0.0 ms, limit 1), picture moved
20 ms (limit one frame). Audio joining at 8 s, kept from 5 s: sound starts at
3.00 s; kept from 10 s: at 0.00 s. A trimmed job cancelled mid-write leaves
nothing. Worker pre-flight on a real 130 s recording kept 30–90 s: probe
measured from the in-point, estimate 19 → 9 s, size 13.8 → 6.6 MB; a 1 s keep
refused with its sentence. Node: range validation, block slicing that tiles a
range frame for frame, the ranged origin, the ranged processor, the snap.
`src/audio/` untouched, so EBU Tech 3341 stands without a re-run.

**Link:** VH-95, VH-30, VH-96, VH-74; `src/media/kept-range.ts`,
`src/config/trim.ts`, `src/media/pipeline.ts`, `src/media/audio-plan.ts`,
`src/acceptance/run.ts`.

## 2026-09-30 — VH-30 signed off: a conveyor with one cut

**Decision:** trimming the two ends is in the product. The identity in
`AGENTS.md` and the brief now reads "a one-way conveyor with one cut": the
user may drop unwanted material from the start and the end, and left alone
the whole video is kept. Cutting from the middle, joining files and
reordering stay out, in those words, so the next request has something to be
measured against. Spec §12 is a doc-delta. VH-95 (the engine) and VH-96 (the
preview and handles) are unblocked; VH-30 closes when they ship.

**Rationale:** the maintainer's sign-off of 2026-09-30, on the ticket's case:
lecture recordings routinely open on a meeting that has not started and end
on the fumble for the stop button, and the only fix today is another tool
first. It reverses the original "no trimming", recorded when the app had no
preview; it is cheap in mechanism (ranged reads are native, and every job
re-encodes, so a cut lands on the frame asked for) and expensive only in the
interactions the ticket lists, which is why the engine goes first and alone.

**Link:** VH-30, VH-95, VH-96; `AGENTS.md` → Product identity, `brief.md`,
doc-delta §12.

## 2026-09-30 — VH-93: feedback through the user's own email app

**Decision:** a "Send feedback" button in the footer band, and "Report this
problem" in the errors panel, open a native modal dialog: a required message
box, a "What will be sent with it" disclosure showing every line, and "Open
email app", "Copy message and details" and "Close". Open email app follows a
`mailto:` link to `FEEDBACK_ADDRESS` with the build identity in the subject;
the dialog then says the app "should have opened", never "Sent". The option
the maintainer signed off (A); no relay endpoint.

**Redaction review (production).** This is the diagnostics bundle's first
reader beyond the maintainer's machine, so it has its own profile,
narrower than the bundle's. It starts from the already-redacted bundle and
keeps only named facts: build id; browser as "Chrome 142 on macOS" (the full
user agent is itself redacted, having slashes); stage; preset and closing
choices; the device check's outcome, reason codes and picture class; the
video's length, display size, frame rate, codec and container; audio codec,
channels and rate; the last two captured errors; the last eight log lines,
each cut to 140 characters. Everything else stays behind — file size, output
projection, language, core count, stacks. On top of `redact()`, every line
has the chosen files' names removed, whole or without the extension, in any
case: the logs never carry one by rule, and this is the check that does not
depend on the rule being kept. The user reads it all before anything goes,
and sends it themselves. The full bundle stays dev-only.

**Rationale:** the app is static files and cannot send mail, and "no media
egress" forbids a request carrying media characteristics. A `mailto:` link
makes no request at all, so the invariant, criterion 9 and the egress watch
are untouched. The message is never cut to fit the link's 1,800-character
cap; details are dropped from the end, and Copy carries them all. Two
follow-ups from the Codex review: a message too long for the link on its own
now opens no link at all and says to use Copy (a client that cuts a long link
cuts the message with it), and the disclosure is recomputed as the message is
typed, listing the lines the email carries and marking the rest as only in
the copy — so what the user reviews is what is sent.

Chrome treats a followed `mailto:` link as leaving the page: with the leave
warning armed it raised "Leave site?" (measured, headless Chrome 154), though
the page stays. So the warning is lifted for the click and re-armed after
`FEEDBACK_LEAVE_WARNING_PAUSE_MS`. Opening the dialog asks the worker for its
log lines with a one-second bound, since a hung job — the thing most worth
reporting — may never answer. `adoptLogRecords` now skips records it already
holds: the worker answers with its whole buffer, so a second report showed
every worker line twice.

**Verified:** Chrome, dev build, mid-job on a real recording: warning removed
at the click and re-armed 1,001 ms later, the encode went on to finish, the
file's name in neither the details nor the link (1,733 characters). An empty
message is refused beside the field with focus on it; Escape closes; focus
returns to the opener; Tab stays in the dialog; phone width and dark theme
checked. Inside a same-origin iframe (the Xerte case): the hand-off fires
`beforeunload` in the frame only, the host page's own handler never ran, and
the app stayed loaded. Tests: the profile's allow-list, the name scrub, the
link's cap and CRLF body, the browser summary, and single adoption of worker
records.

**Link:** VH-93; `src/ui/feedback.ts`, `src/config/feedback.ts`, `src/main.ts`,
`src/core/logger.ts`, `UI-STANDARDS.md` → Diagnostics affordance.

## 2026-09-30 — VH-98: the logo as the website draws it, and "built for Chrome"

**Decision:** the header band holds the University's white logo alone,
top-left against the window edge, as nottingham.ac.uk's header does — the
site's own `UoN-Logo-Dark.svg`, byte for byte, 62 px high, 12 px clear above
and below, 20 px in. The page title moves out of the band into the content,
in Lora, on the same left edge as the text beneath it. Lora Bold (latin, from
`@fontsource/lora`, 21 KB) and its OFL licence are in `src/assets/`. The
intro's bullets are square and lower-case, and a sentence follows the privacy
promise: "This app is designed and built for Chrome, other browsers may not
work."

**Rationale:** the maintainer's answers of 2026-09-30, which reverse two
defaults VH-92 set: the logo comes from the website rather than the brand
library, and its size and clear space are the website's rather than the print
guide's narrowest tier and half-height exclusion zone. The website is the
brand team's own reading of its rules. With the logo in the band the title
could not also sit there and stay aligned with the body text — at common
widths the two collide — so the title went where the University's pages put
theirs, at the head of the content. The browser sentence is the maintainer's
choice between making Edge, Firefox and Safari work and saying plainly what the
app is built for; it says so before anything is chosen, which is when it is
useful. The device check's block messages follow it (Codex review): each now
names Chrome alone as the browser that will work, since sending a blocked user
to Edge or Safari would promise what the page has just declined to.

**Verified:** Chrome, dev build: logo 170 x 62 at 20 px from the edge, 12 px
above; title and intro both at 24 px; Lora loaded for 700; bullets square.
Tests hold the title's place, the three items' wording, the browser sentence's
position above the file input, and the logo's tokens.

**Link:** VH-98, VH-92; `index.html`, `src/assets/`, `src/styles/tokens.brand.css`,
doc-delta §10.

## 2026-09-30 — Pruned project memory: one day's interface pass outgrew the log

**Decision:** Split `decision-log.md` at the 70% prune-to target — the latest
14 entries stay live, all from 2026-09-30 (VH-87 onward); 30 went verbatim to
`archive/decision-log-0003-2026-08-27-to-2026-08-28.md` and 5 to
`archive/decision-log-0004-2026-09-21-to-2026-09-30.md` — and moved the August
sections of `trajectory.md` (VH-56 through VH-26's portrait fix) to
`archive/trajectory/trajectory-0004-review-close-and-band-1a.md`.
Decision-log 49 → 14 entries (15 with this one); trajectory 2,364 → 740 words.

**Rationale:** 2026-09-30 alone wrote 17 entries, which is the log doing its
job, not bloat. Archiving August alone would have left 19 live — one under
budget, re-firing at the next close — so the split also takes September's
oldest five. The trajectory splits on the three-week gap between 2026-08-28
and 2026-09-21, leaving only September live. Doc-sync was deliberately NOT
run: 20 open deltas, the oldest 2026-08-25, wait for their own sign-off
session per the protected-doc rule. Backlog Active (2,726 words against a soft
1,500) is reported, not compressed — the maintainer's standing call.

**Verified:** `diff` per slice against the intact original — every archived
and kept slice byte-identical before the swap, and each file reassembles
byte-for-byte from its pieces; 14 + 5 + 30 = 49 entries reconciled; live-file
hashes unchanged immediately before the swap; trajectory pointer integrity
re-checked after the split.

**Link:** `pm_skills/project/archive/INDEX.md`.

## 2026-09-30 — VH-19: the smaller output spends less on slides, and says so

**Decision:** pre-flight for the smaller output measures what the picture is
mostly made of — `screen`, `camera`, or `unknown` — and builds the shape from
it, so spec 6.2's ~1.5 Mbps slides budget is finally used; everything else
keeps ~2.5 Mbps. The class travels back with the job request, so the file is
encoded as its verdict described, and the verdict says, when it applies:
"This looks like slides or a screen recording, so the file is made smaller
still. If it is mostly camera footage, choose Larger / better instead."

**Adopted, not redesigned** (VH-71 WP5): `content-class.ts` and its thresholds
come from tag `archive/repository-review-implementation` unchanged — five
one-second windows spread through the file, in a pass separate from the timed
probe; `screen` only if every window changes by at most 0.001 AND the source
is thin (≤0.08 bits per pixel per frame); `camera` from 0.003; `unknown`, the
camera budget, in between. The port reads the track's own timestamps and
returns the measurement with the class.

**Re-verified on our corpus** (`/spike-content-class.html`, against a contact
sheet of each): 21 recordings. Seven slide decks read `screen`, three of them
with a webcam inset. Every camera source reads `camera` — five phone clips, a
studio talking head, a keynote filmed in a lecture theatre, and a 29-minute
Teams webcam recording at 0.03 bits per pixel, as thin as the slides. That last one's FIRST window reads 0.0003,
inside the screen band: the reason the rule takes the loudest of five spread
windows, and why the old evidence found every file static at 0%. Three slide
decks read `camera` for one animated transition each, and an animated map
reads `unknown` — the safe direction, costing only size. The loudest window of
the quietest camera recording is 14x the screen ceiling. The corpus is now a
table in `content-class.test.ts`.

**Why the verdict names it:** the one wrong answer — camera taken for slides
— costs picture quality, and only the person looking can tell; a 40% cut
decided silently is what VH-19 was opened to prevent. The sentence is shown
only when the class changed the file: not for camera or unknown, not on the
larger output, and not when VH-41's cap to the source bitrate decided the
size instead.

**Verified:** MLAC3139 at the smaller output: verdict "up to 4.7 MB" with the
sentence; delivered 4.49 MB from 8.40 MB, luma PSNR 42.3–48.8 dB against the
source at three moments. An iPhone clip: `camera`, no sentence, job completes.
Acceptance harness 10 passed, 0 failed. The classification pass takes
0.2–0.9 s at 1080p and ~2.3 s at 4K, once per smaller-output check.

**Link:** VH-19, VH-71 (closed with it); `src/media/content-class.ts`,
`src/config/thresholds.ts`, `src/workers/job.worker.ts`, `src/ui/preflight-panel.ts`.

## 2026-09-30 — VH-26 review: a check that cannot fail is not a check

**Decision:** `scripts/run-in-engines.mjs` exits 1 when a page that ran to
`done` reports its own failure — a line beginning `ERROR`, or a closing
`N FAILURE(S)`.

**Rationale:** from the Codex review of VH-26. The runner's contract was
"navigate, wait for `done`, print", and it treated reaching `done` as success.
I had recorded `run-in-engines /spike-phone.html --engines firefox` as the
verification of VH-26, and that command would have exited 0 with the sample
missing, the worker hung, or every assertion failing. The two patterns are
the ones the spike pages already use, so nothing else had to change; an engine
that merely behaves differently is still a finding to read, not a failure.

**Verified:** Firefox, the iPhone file: `ALL PASS`, exit 0. Firefox, a path
that does not exist: `2 FAILURE(S)`, "REPORTED A FAILURE", exit 1.

**Follow-up, same day (second Codex pass):** the first version recognised only
a left-margin `ERROR` and a closing `N FAILURE(S)` — the phone spike's
spellings — and the older spikes say it differently: indented `FAIL —`, a row
ending `FAIL`, `ERROR —` after a mode name. `spike-real` with a bad path still
exited 0. A third pass then showed the fix too broad: any `FAIL` as a word
also failed a run whose source was named `FAIL-test.mp4`. The rule is now the
word in a verdict position — first on its line, ending a row, or before an em
dash — which is where every spike puts it and where a file name does not go;
one line in `spike-alpha` was reworded to fit. Checked against fifteen sample
outputs, file names included, and live: `spike-real` with a bad path exits 1,
the phone spike exits 0. A fourth pass found a name contrived to sit in a
verdict position ("lecture FAIL — retake.mp4"). Left, deliberately: it is a
false failure, the loud direction, and closing it for good means a structured
verdict line on all eleven spike pages — parked on the wish-list.

**Link:** VH-26; `scripts/run-in-engines.mjs`, `DEV-INFRASTRUCTURE.md` →
"Cross-engine verification".

## 2026-09-30 — VH-83 review: measure again under the ceiling that will be used

**Decision:** when the probe lowers the limiter ceiling, the pass that probed
is measured again under the new ceiling before the solver sees a figure. And a
probe whose traversal throws is cancelled before the error propagates.

**Rationale:** both from the Codex review of VH-83. The probe runs on the first
limited pass and the ceiling it derives applies from then on — but that pass's
own loudness was measured under the OLD ceiling. Had it been inside tolerance
the solver would have accepted the gain on the strength of a chain the job
does not run, and a lower ceiling limits harder: `AGENTS.md`'s rule that the
gain is solved against the chain that actually runs, broken in exactly the
case the ceiling rule was added for. One extra traversal, only when the
ceiling moves. The second: the worker outlives a failed job, so an encoder
left open by a throw is leaked until collection.

**Verified:** CULT1027 at the smaller output, the one corpus job whose ceiling
moves: −16.072 LUFS, −2.28 dBTP (−16.093 before the fix). AMCS3059 at the
larger, whose ceiling does not: −16.051, unchanged.

**Link:** VH-83; `src/media/audio-plan.ts`.

## Archived: 11 entries, 2026-09-30 — see archive/decision-log-0005-2026-09-30.md

## Archived: 5 entries, 2026-09-21 → 2026-09-30 — see archive/decision-log-0004-2026-09-21-to-2026-09-30.md

## Archived: 30 entries, 2026-08-27 → 2026-08-28 — see archive/decision-log-0003-2026-08-27-to-2026-08-28.md

## Archived: 25 entries, 2026-08-25 → 2026-08-27 — see archive/decision-log-0002-2026-08-25-to-2026-08-27.md

## Archived: 12 earlier entries — see archive/decision-log-0001-2026-08-25.md
