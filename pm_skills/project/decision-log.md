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
the phone spike exits 0.

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

## 2026-09-30 — VH-26 closed: Firefox refuses an iPhone file cleanly

**Decision:** VH-26 is done. No code changed for it; the last open question
was measured, and the ticket's findings are folded in here.

**Measured:** `samples/phone/2020_iPhone12_FloreView_HEVC.MOV` (HEVC Main 10,
HLG, 1080p30) given to the real job worker in headless Firefox 154
(`scripts/run-in-engines.mjs /spike-phone.html --engines firefox`). Inspection
succeeds and says the picture cannot be decoded; pre-flight answers `block` in
284 ms with `no-source-decode`, in the block's own words — "Chrome or Edge on
a computer will open more formats" — and nothing invites the user to continue.
It is refused before the job, not part-way through one. Firefox's other block,
`no-aac-encode`, does not show: the verdict names the root cause only, and
the decode is it.

**Why this was filed as needing a person and did not:** the runner that
drives all three engines headlessly already existed. What was missing was a
page that asked the question; `spike-phone.html` is that page, and it takes
any file, so the next phone sample is one command.

**It depended on a fix made the same day.** Before the VH-87 review fixes,
pre-flight probed and analysed a source it had already been told it could not
decode; this check would have been slower and, for undecodable SOUND, would
have failed generically.

**From the ticket, kept because nothing else records it:** HLG and Dolby
Vision round-trip in Chrome with luma percentiles within two units of the
source (mean, p05, p50, p95; measured 2026-08-27) — the browser tone-maps on
decode and the pipeline encodes what it is handed. A 4K60 phone video comes
out BIGGER on the larger output (139 → 154 MB), by design: VH-47 anchors to a
~51 Mbps source; the smaller output is the answer. And published labels are
not evidence: the sample named "HDR" is 8-bit bt709. Classify by `ffprobe`.

**Link:** VH-26, VH-60, VH-49; `spike-phone.html`, `src/spike/phone.ts`.

## 2026-09-30 — VH-83: the gain aims through the codec, and so does the limiter

**Decision:** the first refinement pass of the gain solve also encodes a
sample of its own output at the job's exact audio config, decodes it and
measures both sides (`media/codec-probe.ts`). The loudness it lost is
subtracted from what every pass reports, so the solver lands the DELIVERED
file on −16 rather than the encoder's input. The true peak it gained sets the
limiter's ceiling: `ENCODE_TRUE_PEAK_HEADROOM_DB` is now the floor, and a
measured overshoot plus 0.5 dB replaces it when larger. `gain-solve.ts` is
untouched.

**Measured first** (`/spike-aac-cost.html`, whole-programme round trip,
"best"): AMCS3059 0.379 LU, AMCS2007 0.090, MLAC3139 0.078, CULT1027 0.042.
Real, and neither small nor constant. And it varies ALONG a file, which
decided the probe's shape: on AMCS3059 one contiguous 30 s excerpt said 0.25
at the start and 0.44 at the loudest part, and 5 s excerpts erred by up to
0.3 LU. Windows spread evenly and encoded as one stream were within 0.05. So
the probe is 48 x 5 s spread windows, or the whole programme when it is
shorter than that — a fixed four minutes of audio and under 6 MB of AAC,
whatever the file's length.

**Delivered loudness, production `runPipeline`, before → after:**

| File | Best | Smaller |
| --- | --- | --- |
| AMCS3059 | −16.440 → −16.051 | −16.459 → −16.048 |
| CULT1027 | −16.111 → −16.068 | −16.160 → −16.093 |
| MLAC3139 | −16.127 → −16.067 | → −16.064 |
| AMCS2007 | −16.182 → −16.026 | → −16.029 |
| 10-minute mix, windowed | −16.234 → −16.087 | |

Every file closer, none worse. The mix is three of the lectures joined twice,
built to exercise the windowed path: 240 of 620 s probed, 0.022 LU from the
whole-programme figure.

**The other half was a live defect.** The headroom was measured at 192 kbps
only. The smaller output encodes mono at 96 kbps, and there CULT1027
overshoots by 1.2–1.4 dB: limited to −3.0, the file measured −1.81 dBTP and
the job was REFUSED after the whole encode (`true-peak-exceeded`), on HEAD,
through the app. With the measured ceiling (−3.76 for that job) it delivers
−2.25 dBTP and completes. Every other measured job keeps −3.0: a measurement
can ask for more headroom, never for less.

**Alternatives:** probing every refinement pass — trebled the analysis stage
(5.8 s → 16.4 s on a 130 s lecture) for a figure that moved 0.005 LU; once
costs 1–3 s. A whole-programme round trip — exact, and 86 MB of AAC in memory
per hour. Correcting by a linear step after the solve — the limiter takes
back a third of added gain on the hottest file, so it lands 0.1 short.

**Verified:** the table above; the acceptance harness, 10 passed, 0 failed,
criterion 9 still zero bodies; Node tests for the window plan, the router and
the ceiling rule. Not covered: an hour-long real lecture — the longest run is
the ten-minute mix.

**Link:** VH-83, VH-50; `src/media/codec-probe.ts`, `src/media/audio-plan.ts`,
`src/config/audio.ts` (`CODEC_PROBE`), doc-delta §5.2.

## 2026-09-30 — VH-92: the University's colours, on Carbon's shapes

**Decision:** the brand token file takes over every colour role — surfaces,
text, borders, interactive, focus — assigned from the University's palette
for light, dark and a Nottingham Blue band. Nottingham Blue header and footer
bands, not sticky; System check and the version move into the footer.
Headings in `'Lora', Georgia`; body in Arial. Carbon keeps spacing, type
scale, motion, the 44 px floor and status colour.

**Rationale:** the maintainer's request, and the brand's own rules agree with
this project's — no black, no pure white ground, AAA preferred. The role
NAMES stay Carbon's and only their values moved, so no rule in `app.css`
changed meaning and none names a colour; the two systems are still two. A
band re-assigns the roles through `.on-brand-blue` rather than being styled by
hand, which is what makes everything inside it — System check, the focus ring
— light on blue without a second set of rules, and lets one test cover it.

**What the palette could not do:** status (Jubilee Red is 6.4:1 on white), so
that stays Carbon's. And the dark theme needs two raised surfaces on which the
20% tint still reads at 7:1; the brand's next step, 80%, gives 5.5. They are
95% and 90% tints — the brand's arithmetic at steps it does not publish.

**Shipped without two files, by design.** The logo is a trademark the
maintainer must supply; Lora is a download I did not make without being asked.
Each has a build-time slot: `import.meta.glob` finds `src/assets/
uon-logo-white.svg` and `lora-bold.woff2` if they exist and yields nothing if
they do not, so the page is complete either way and picks them up with no code
change. Until then headings are Georgia, the brand's own substitute. VH-98
tracks the files.

**Alternatives:** a static `<img>` and `@font-face` — a broken image and a
failed build until the files arrive. Circular, the brand's sans, is licensed
and this repository is public; Arial is the brand's stated substitute.

**Verified:** `test/contrast.test.ts`, 78 assertions across the three
contexts, mutation-checked (secondary text at the 60% tint fails three).
Chrome, light and dark: bands, panels, controls, a job; Tab into the footer
gives a white ring on blue. With placeholder files in the slots: the logo is
the header's first child, `alt="University of Nottingham"`, 50 px high, 25 px
clear on every side; the flat Xerte build emits both beside `index.html` with
no folder. Placeholders removed.

**Link:** VH-92; `src/styles/tokens.brand.css`, `src/ui/brand-assets.ts`,
`UI-STANDARDS.md` → "Token systems", `README.md` → "Licence and trademarks".

## 2026-09-30 — VH-89 review: a block says only why, and the estimate is still heard

**Decision:** under a `block`, the verdict lists only the reasons that block.
And the status line for a finished check shows the outcome and SPEAKS the rest
of the verdict — the time, the size, every reason — from a visually hidden
span inside the live region.

**Rationale:** both from the Codex review of VH-89. The first fix had dropped
one sentence, `estimate-unavailable`; but too little storage on a long job
still produced a block that said "you can carry on, but a desktop would be
faster". The rule is the outcome, not a list of codes: a lesser reason under a
block is advice about running a job that cannot run. The second was a
regression I made on purpose and should not have: taking the estimate out of
the status line stopped it being shown twice, and also stopped it being heard
at all, because the verdict is not a live region. Shown once and spoken once
is the answer to both; `spokenOnly` is built from `verdictText`, so the two
cannot drift.

**Verified:** Chrome: `proceed` shows "Device check complete. Ready to go."
and the live region's text also carries the time and size in a 1×1 span; an
AC-3 block carries its reason and what to do. Not verified with a real screen
reader — VH-70.

**Link:** VH-89; `src/ui/preflight-panel.ts` (`preflightAnnouncement`),
`src/main.ts` (`setStatus`).

## 2026-09-30 — VH-91: four numbered panels, and a status line each

**Decision:** the steps are separate panels with numbered headings — 1. Choose
a video, 2. Closing branding, 3. File size / quality, 4. Create — and they
stay open. Steps 2 to 4 appear when the first video has been read and then
stay for the session. Create holds the verdict, the sound warnings, the
button, the status line, the progress bar and the result. Step 1 has a status
line of its own.

**Rationale:** the request floated sections that advance "when info was
added". For these steps that is the wrong trigger: each holds a safe default,
so nothing is ever "added", and a select or radio changes on every arrow key,
so advancing on change shuts the step under a keyboard user mid-choice (WCAG
3.2.2). Folding between STAGES is VH-97, which folds these same panels.

**The second status line is forced, not chosen.** The item's default keeps
steps 2–4 off the page until a video is read, and its done-when puts the
status line in Create. Together those hide the only live region during
"Reading the video…" and "That file could not be read." — exactly when it has
most to say. So the FILE's status sits beside the file input, always on the
page, and the JOB's status sits in Create, revealed before anything is written
to it. Each is now beside the control it reports on, which is what VH-88
moved it for.

**Assumptions (gateless):** the steps are revealed once and not re-hidden per
file — they hold nothing a new file invalidates, and hiding them made the page
jump on every selection. That lets the preset be changed while a new file is
still being read, which would have cancelled the read; `inspectedFile` makes
that change a no-op, because the read's own continuation runs pre-flight with
whatever preset is chosen by then. The number is heading text ("1. Choose a
video"), not a CSS counter, so it is heard as well as seen.

**Verified:** Chrome, dev build. At load: step 1 only, "Choose a video to
begin." After a read: four panels, focus still on the file input. A second
file with the preset changed mid-read: the report and the verdict both arrive,
for the new preset. A job: Create reads verdict → button → status → result.
No horizontal overflow at 375 px. Node: the numbers are consecutive, each
region is labelled by its heading, Create's contents are in reading order.

**Link:** VH-91; `index.html`, `src/main.ts`, `src/styles/app.css`. VH-97's
detail moved to `tickets/VH-97.md`.

## 2026-09-30 — VH-90: closing branding is three controls, and one sentence

**Decision:** "Animation type" (Cut, Fade, Slide, None) and "Animation onset"
(Over existing, Over generated freeze frame) are native selects; colour is a
Blue / White segmented pair of native radios with swatches. All three are
always present. Onset is disabled under Cut and None, colour under None, each
with its reason in visible text. A "?" toggletip explains the two onsets, and
one line under the controls states what the current selection will do.
`brandingChoiceFor` maps the controls onto `BrandingChoice`; the pipeline is
untouched.

**Rationale:** the maintainer's shape, 2026-09-30, reversing VH-46b twice — it
rejected a select, and it hid Animation rather than disabling it. What VH-46b
was protecting still holds and moved: a control that cannot change anything
now says so, and the result line carries what the radios' descriptions did —
what happens to the last second, how many seconds are added. It is also what
stops "None" under "Animation type" reading as "no animation", which is Cut.
The line takes its seconds from the same mapping the job uses, so it cannot
promise a different file. Native controls throughout: a select is what Carbon's
Select is, and radios bring arrow keys and state; Carbon's content switcher is
a tablist, the wrong role for a form value.

**Assumptions (gateless):** onset defaults to "Over existing", first in the
list as asked; "None" is the option text, as asked. The toggletip opens by
click, Enter and Space only — hover was optional and needs 1.4.13's three
conditions for no gain. Its text sits in the page flow rather than floating,
so it cannot cover the control or a focus ring. The draft sentences each gained
a clause ("covering it as it builds" / "so nothing is covered").

**Verified:** Chrome, dev build, a 2.00 s source: Cut blue → 6.00 s; Fade over
existing → 6.00 s; Slide over freeze, white → 7.00 s; None → 2.09 s — each
matching its sentence. Disabled states and reasons as specified; 44 px
targets; the "?" by Enter, Space, click; closed by Escape and by a click
elsewhere, focus staying on the button. Node: all 16 control states, eleven
distinct jobs, unrecognised DOM values falling back field by field, and the
page's resting markup held to the config defaults.

**Link:** VH-90; `src/config/branding.ts`, `src/ui/closing-choice.ts`,
`index.html`, doc-delta §4.1/§4.3.

## 2026-09-30 — VH-88 review: the panel keeps its heading, and opens once

**Decision:** the summary's words are an `<h2>` inside the `<summary>`, and the
panel opens itself when the count of failed checks RISES, not whenever it is
above zero. `summariseChecks` returns that count in place of a flag.

**Rationale:** both found by the Codex review of VH-88. Replacing the
`<section>` and its `<h2>` with a bare `<details>` took System check out of
the list a screen-reader user navigates by, failure or no. And `if (failing)
open = true` ran on every row update, so a user who read a failure and closed
the panel had it thrown open again when the worker check landed —
`UI-STANDARDS.md` → "User control and freedom".

**Verified:** Chrome: the accessibility tree lists "heading: System check — 1
problem"; with `VideoEncoder` removed and the panel closed the instant it
opened, the worker check landing afterwards left it closed (opened once).

**Link:** VH-88; `index.html`, `src/ui/system-check.ts`, `src/main.ts`.

## 2026-09-30 — VH-89: ready to go, in three lines

**Decision:** a `proceed` reads "Ready to go" / "This should take about 37
seconds." / "Estimated size up to 28.5 MB." and nothing else. The Setting,
Output and Measured speed rows leave the screen for one `preflight verdict` log
line. `warn` and `discourage` keep every reason and end on the same two lines;
a `block` states neither. What is said is now a pure `verdictText`, tested.

**Rationale:** the three rows were the tool's decisions, not the user's, on
the one screen where a novice decides. Reverses VH-31's "at most" in wording
only: the figure is still an upper bound, and "up to" — the item's default,
nobody having answered — keeps the screen true in two words. "The time stated
once" is a rule over reasons: `long-job`, `very-long-job` and
`estimate-unavailable` already say it, so the time line yields to them.

**Found on the way:** every block said "You can still continue". The probe
does not run for a job that cannot, so a block always arrived with the
unmeasured-estimate reason and its invitation, under "This cannot run here".
A block now drops that one sentence; it is about time, and a block states
none. The done-when says no outcome loses a sentence — this is the one it
loses, deliberately.

**Assumption (gateless):** the live-region line became "Device check complete.
Ready to go." It used to carry the estimate, which was the only place a `warn`
stated one; the verdict now does, and since VH-88 the status line sits directly
under it, so the same sentence was on screen twice. A failed check also now
replaces "Checking this video…" rather than leaving it under the error.

**Verified:** Chrome, dev build: `proceed` three lines; the smaller output on
an already-compressed file adds VH-41's note as a fourth; a ProRes block is
heading plus one reason. `warn` and `discourage` wording is covered in Node
only — no sample here reaches them on this machine.

**Link:** VH-89; `src/ui/preflight-panel.ts`, `src/main.ts`.

## 2026-09-30 — VH-87 review: undecodable sound is blocked, not failed

**Decision:** pre-flight skips the audio analysis when inspection has already
said the browser cannot decode the track, so the `no-source-decode` verdict is
reached.

**Rationale:** found by the Codex review of VH-87 and reproduced with an AC-3
source. Analysis ran before the verdict and threw on a track it could not
decode, so the answer was "Something went wrong checking this file" — VH-60's
block, with its named browsers and its re-export advice, was unreachable for
sound. The old "Sound support" row had been covering for it in plain view, and
VH-87 folded that row into a closed disclosure. The defect is older than the
disclosure; the disclosure is what made it matter.

**Verified:** Chrome, H.264 + AC-3: before, the generic failure; after, "This
cannot run here" with the decode reason, no Start, and "Dolby Digital — this
browser cannot read this audio format" under Video properties. Browser-only:
the handler needs WebCodecs, so there is no Node test for it.

**Follow-up, same day (second Codex pass):** the calibration probe is skipped
too when either track cannot be decoded. It would encode three seconds, fail
on the track already ruled out and discard the estimate — work that only
delays the block, and on a slow device could outrun the pre-flight deadline
and put the generic failure back. The AC-3 block now lands in ~120 ms.

**Link:** VH-87, VH-60; `src/workers/job.worker.ts` (`handlePreflight`).

## 2026-09-30 — VH-88: the system check folds, and the status line leaves it

**Decision:** System check is a `<details>` panel, closed on a healthy device.
Its summary carries the result in words — "System check — all passed" / "— 1
problem" — from a pure `summariseChecks`, and `main.ts` opens it on any
failure and never shuts it. `#status` moves out, to sit between Create and the
progress bar. Its resting text is "Choose a video to begin."

**Rationale:** `#status` is the app's only live region and its only visible
status text, and inside a closed `<details>` it is neither seen nor announced
— every "Reading the video…", stage and "Your video is ready." would have gone
silent. It was badly placed already, 450 px below the button it reports on,
greeting every user with "Ready for the next milestone", a build note. A
failure is reported without waiting for pending rows: the worker answers last,
and holding the panel shut until it does would hide a missing API for ever if
it never does. Both halves follow the archived branch.

**Consequences taken, all from the status line now sitting beside what it
describes:** the progress bar's name is visually hidden — the status line
directly above already shows stage and percentage, and the name remains for
assistive technology (VH-64 holds). The result block is headed "Finished
video — 7.2 MB." rather than repeating "Your video is ready" an inch below it.

**Alternatives:** a second, visually hidden live region left inside the panel
— two sources of truth for one sentence.

**Verified:** Chrome, dev build. Healthy: closed, "all passed", status above
the fold. With `VideoEncoder` removed: opens itself, "1 problem", the row says
which, the status line points at it. A real job: the status line carried the
read, the check, all four stages and "Your video is ready.", in that order.
Not verified: an actual screen reader — VH-70's manual gate.

**Link:** VH-88; `index.html`, `src/ui/system-check.ts`, `src/main.ts`.

## 2026-09-30 — VH-87: the facts fold away, the losses do not

**Decision:** the source facts sit in a native `<details>` labelled "Video
properties", closed on every new file, with the ten rows in the agreed order.
What the new file will NOT carry is no longer a row at all: `buildLosses` is a
separate function, rendered above the disclosure in the `.warnings` block the
sound warnings already use. The shared disclosure style gains a chevron.

**Rationale:** three of the old rows were losses dressed as facts — extra
tracks, caption or chapter tracks, and "could not be checked". Closed by
default they would have been hidden before processing, which is the outcome
this project exists to refuse. Separating them by FUNCTION rather than by a
flag on a row is what makes that testable: a test asserts no row says
"carried", so the sentence cannot survive inside the disclosure if the loss is
ever dropped. A caption track appears in both — the row says what was found,
the loss says what happens to it.

**Assumptions (gateless):** "Video codec" rather than "Codec", as the item
proposed. A file with no sound gets one "Audio" row, not three. The two
"this browser cannot read…" rows became notes on the codec rows: VH-60's
block verdict already says it in view, with what to do. An unscannable
container gets "Captions — Could not be checked", never "None".

**Alternatives:** opening the disclosure automatically when there is a loss —
it hides nothing, but it makes the closed state mean "nothing to see", which
is a promise the next loss added to a row would break silently.

**Verified:** Chrome, dev build: closed on first file and on the next; summary
44 px; Tab reaches it with a visible ring and Enter opens it; the chevron
turns; a `mov_text` source shows "Not carried into the new file" above it.

**Link:** VH-87; `src/ui/source-panel.ts`, `src/styles/app.css`
(`--motion-fast` in `tokens.carbon.css`).

## 2026-09-30 — VH-86: captions, not subtitles, and no caption file

**Decision:** the screen says "caption" everywhere it said "subtitle", and the
"Subtitle file (optional)" field is gone — with its whole path, not just its
markup: `vtt.ts`, `subtitleVtt` across the worker boundary, `addSubtitleTrack`
in the pipeline, `subtitleCues` in the result. The warning for a caption or
chapter track INSIDE the source stays, and no longer offers the field as the
way out. Identifiers keep `subtitle`, the ISOBMFF and WebVTT term.

**Rationale:** the maintainer's word, 2026-09-30, reversing spec §8.3 step 2.
Little is lost: with no opening the cue offset was always zero (VH-80), so the
field embedded a file the user already had, and EchoVideo writes its own
captions after upload (§8.2). Deleted rather than left dormant as openings are
(VH-23), because a dormant sidecar is a liability with a date on it: trim
(VH-95) would have to re-time cues nobody can supply, or silently ship them
out of sync. Git keeps the code; `architecture.md` keeps the fact that
Mediabunny writes subtitle tracks.

**Alternatives:** dormant behind the missing field — rejected above. Pointing
the warning at EchoVideo's own captioning — true per §8.2, but a claim about
another system's behaviour in our interface; "keep the original alongside" is
the advice we can stand behind.

**Verified:** Chrome, dev build, a source with a `mov_text` track: "Captions —
Found 1 caption track", the warning shown before Start, one file input on the
page, no "subtitle" in the rendered text, and the job finishes. `vtt.test.ts`
went with the module it tested; `screen-text` and `source-panel` tests hold
the wording and the absence of the field.

**Link:** VH-86; `src/ui/source-panel.ts`, `src/media/pipeline.ts`,
`src/workers/protocol.ts`, doc-deltas §8.1 and §8.3.

## 2026-09-30 — VH-85: what the tool does, as a list, and the promise said once

**Decision:** the opening paragraph is a three-item list and the privacy
sentence is its own paragraph, above the file input; the helper that repeated
it under the input is gone with its `aria-describedby`. The output question is
"File size / quality", answered "Larger / better" and "Smaller / reduced".
`PRESETS` labels carry the same names; the ids stay `best` and `smaller`.

**Rationale:** the maintainer's wording, 2026-09-30. The one judgement was how
an option reads. "Larger / better for EchoVideo or YouTube etc." on one line
parses as "better for EchoVideo"; as a name with its destinations beneath — the
described-radio pattern the closing options already use — the name answers the
legend in the legend's own order and the words are unchanged.

**Alternatives:** keeping `aria-describedby` and pointing it at the new
paragraph. Declined as asked: the sentence is the last thing read before the
input, and a description read again on every focus is the repetition removed.

**Assumption (gateless):** "messaging or email" replaces "OneDrive, SharePoint
or email" on screen only. Nothing about the preset changed, and VH-17's
question about where that file is streamed from is unaffected.

**Verified:** Chrome, dev build: the list, the sentence once and still visible
with a job running, the legend and both options, no `#file-help`.
`test/screen-text.test.ts` holds the page's names to `PRESETS`.

**Link:** VH-85; `index.html`, `src/config/presets.ts`, doc-deltas §6.1, §6.2,
§9.1.

## 2026-09-30 — VH-94: `hidden` was losing to the stylesheet

**Decision:** `[hidden] { display: none !important }` in `app.css`, recovered
from tag `archive/repository-review-implementation`, and a stylesheet test that
fails without it.

**Rationale:** the browser's own rule for `hidden` has the lowest priority
there is, so `.actions { display: flex }` and `.progress { display: block }`
outranked it and every `element.hidden = true` on those two was a no-op. Start
was visible, enabled and inert before a file, under a block, and through the
recompute window R-05 took it down for. One rule rather than a fix per class:
the next class to set `display` would reopen it, and nothing would say so.

**Alternatives:** dropping `display` from the two classes fixes today's pair
and leaves the trap armed.

**Verified:** Chrome, dev build. At rest, and with a file being read: no Start,
no bar. `proceed`: Start shown. Preset changed: Start down until the new
verdict lands. Job running: bar and Cancel shown, Start disabled. Job finished:
bar gone. `block` (a ProRes source): no Start. The test cannot see computed
style — it reads the source — so the browser pass is the other half.

**Link:** VH-94; `src/styles/app.css`, `test/stylesheet.test.ts`.

## 2026-09-21 — VH-14: the Xerte package is one flat folder

**Decision:** the Xerte package has its own build, `npm run build:xerte`
(`vite build --mode xerte`): relocatable as before, and flat — every file
beside `index.html`, no folders — because that is how the maintainer uploads
it. `check:build` builds it and fails if it ever contains a folder.

**Rationale:** the layout is a property of the upload, not of the app, so it
is decided once in `vite.config.ts` and the app reads it: `__BRANDING_DIR__`
is `branding/` everywhere else and empty here. The masters are emitted by a
plugin rather than moved after Vite's `public/` copy, because `closeBundle`
hooks run in parallel and ordering a move against the README exclusion would
be luck; with `publicDir` off, nothing else from `public/` can ride along.

**Alternatives:** post-processing `dist/` (moving files, rewriting
`index.html`) leaves the bundle fetching branding from a folder that no longer
exists; moving `public/branding/` to the root for every build changes the URLs
Pages serves, for the sake of one host.

**Verified:** the harness in the entry below, on the build from `899a448`:
framed and direct, every request a file directly beside `index.html`, all 200;
output 16.04 s ending on the closing; dev-only controls hidden. The folder
check rejects the previous package (`assets/`, `branding/`).

**Link:** VH-14; `vite.config.ts`, `scripts/check-build.mjs`,
`src/config/branding.ts`.

## 2026-09-21 — VH-14: a worker resolves a relative URL against itself

**Decision:** the Xerte package is a relocatable build (`BASE_PATH=./`), and
the branding base is resolved against the page on the main thread and handed
to the worker in the `process` request, as `backgroundColour` already is.

**Rationale:** Xerte serves an upload from a folder whose path does not exist
until the upload does, so no absolute base can be baked in; Route Plotter's
live upload is already this shape. But `BASE_URL` then becomes `./`, and the
app's only runtime fetch — branding — runs in the worker, where
`./branding/…` resolves against `assets/job.worker-*.js`. Every closing 404'd,
and because a branding fetch degrades rather than fails, every job still
finished, with the result's own notice the only sign.

**Alternatives:** anchoring to the chunk (`new URL('../', import.meta.url)`) is
one file, but silently couples to `build.assetsDir`'s depth; copying
`branding/` into `assets/` is a packaging hack that fixes nothing for the next
host. Resolving where the document is costs one field and holds for any
layout.

**Verified:** headless Chrome, a real 12 s job, the app served from
`USER-FILES/…/media/` both directly and inside a same-origin frame. Unfixed:
404 on `media/assets/branding/closing-tail-blue-1080p.mp4`, output 12.10 s,
"The closing sequence could not be loaded". Fixed (`833636a`): tail and onset
200 from `media/branding/`, output 16.04 s ending on the closing card,
−16.0 LUFS; the dev server gives the same 16.04 s. Xerte itself serves `.js`
as `application/javascript`, with no CSP, framing or `Cache-Control` headers.

**Link:** VH-14; `src/config/branding.ts` (`resolveBrandingBase`),
`src/workers/protocol.ts`, `DEV-INFRASTRUCTURE.md` → "Xerte package".

## 2026-08-28 — VH-26: every portrait phone upload failed, and the guard hid it

Asking whether the phone samples had been obtained is what found this. Five
were, on 27 August, and all five are landscape — verified with `ffprobe`, none
carrying a rotation flag — so portrait was never once exercised.

**What happened.** Portrait phone video is landscape PIXELS plus a rotation
flag: an iPhone writes 1920x1080 coded with `rotation: 90`. Content samples
therefore arrive at 1920x1080 while the branding card is rendered at the
1080x1920 output shape. Mediabunny's constant-size guard runs on the sample as
it ARRIVES — before the `transform` that would have normalised both — so it
refused the job with `Video sample size must remain constant`. The closing card
is on by default, so this was every portrait upload rather than an edge case.

**Why nothing caught it.** Without branding the two lanes never disagree, so
the same source produced a perfectly good file. And a fixture that simply swaps
width and height does not reproduce it either — that is the case that always
worked. Only a genuine rotation flag combined with branding fails, which is a
corner no existing fixture occupied.

**The fix is one line**, and it is not a workaround: `sizeChangeBehavior:
'passThrough'` lifts the guard on the INPUT only, while the `transform` already
present continues to normalise every frame to exactly `shape`. What reaches the
encoder is one constant size either way — the invariant the guard existed to
protect. It is also the combination Mediabunny sanctions, since `fit` may not
be set alongside a `sizeChangeBehavior` of `deny`, `fill` or `contain`.

Notably the `transform` block already carried a comment about VH-26 and
rotation, and it was right — rotation was handled. The guard sitting upstream
of it was the part nobody had reason to suspect.

**Measured after the fix**, on the phone convention with branding: output
1080x1920 with rotation baked to 0, so a player that ignores the flag still
shows it upright. Content fills the frame edge to edge; the 16:9 card sits as a
centred band on the brand background across 31% of the height, against the
31.6% the arithmetic gives. That settles the composition question the ticket
raised, rather than only the crash.

**Guarded** by acceptance criterion 1, covering both conventions. The full run
is 10 passed, 0 failed, 133 s.

**Link:** VH-26; `src/media/encoding.ts`, `src/acceptance/fixtures.ts`,
`src/acceptance/run.ts`.

## 2026-08-28 — The codec spends most of the loudness budget, measured

Scoping VH-83 turned up a number worth recording on its own, because it is
about the app's headline audio promise and it was previously known only as a
range in a wish-list note.

On `AMCS3059`, a real corpus lecture, through the production pipeline:

| | |
| --- | ---: |
| Chain solved (`limitedLufs`, what the DSP really produced) | -16.06 LUFS |
| Delivered file, decoded and re-measured | **-16.44 LUFS** |
| Cost of the AAC round trip | **0.38 LU** |
| Error against target | -0.44 LU, against a +/-0.5 tolerance |
| Delivered true peak | -2.969 dBTP against a -2.0 ceiling |

Two things follow. The gain solve is doing its job — VH-50 made it solve
against the chain that actually runs, and it landed within 0.06 LU. Everything
after that is the codec, and nothing models it: 88% of the tolerance is spent
downstream of the only stage that aims.

And `ENCODE_TRUE_PEAK_HEADROOM_DB` held its full 1.0 dB while this file's
actual overshoot was around 0.03 dB. The constant is doing what it was set to
do; it is simply much larger than this file needed.

**Not fixed here, deliberately.** The fix is a probe round trip feeding a
corrected target into `solveChainGainDb`, and that is the stage VH-50 repaired
by measurement — the one place where a plausible change can quietly put every
output off target. It wants validation across all four real files, which is a
task rather than a corollary. VH-83 now carries the numbers and the acceptance
condition.

**Link:** VH-83, VH-50, VH-47, spec §13 criterion 2; measurement by the
production `runPipeline`, not a harness fixture.

## 2026-08-28 — VH-84: the request count was not the census it read as

Criterion 9 reported "N requests across the page and the job worker, all
same-origin". N came from the browser's resource timeline, and a
resource-timing entry is added when a request COMPLETES — so anything still in
flight when the watch stopped was simply absent. A HEAD to a branding asset
went unlisted during a direct test.

The no-egress VERDICT was never at risk: that rests on the wrapped `fetch` and
`sendBeacon`, which record at the moment of the call and cannot miss one. What
was wrong was the count, and the count is what a reader takes as the census.

Fixed by joining the two rather than by draining the timeline: `allRequests`
and `crossOrigin` are now the union of the timeline and the URLs the wrapper
saw, deduplicated by absolute URL. That closes the hole for everything routed
through `fetch` — which is everything this app does. A request made by some
other API AND still in flight would still be missed; the check now says so
rather than implying a completeness it does not have.

Two tests pin it, both using a `fetch` that never settles: the in-flight
request is listed and counted as cross-origin while still producing no finding,
and a request both instruments see is counted once.

**Link:** VH-84, VH-62, review R-11; `src/core/egress.ts`, `src/acceptance/run.ts`.

## 2026-08-28 — VH-81: the tail fallback that never once worked

`scanTrackHandlers` read the first 64 MB looking for `moov`, and if it was not
there read the LAST 64 MB instead. The second read starts at
`file.size - 64 MB` — an arbitrary offset, almost always mid-`mdat` — and then
parsed it from byte zero as though it were a box boundary. It found nothing,
concluded "not ISOBMFF", and reported no subtitle or chapter tracks.

It failed safe, which is why nobody noticed: the report says nothing rather
than something wrong. But a file with `moov` at the end is exactly the shape
the fallback exists for — a recorder that did not finalise for streaming — and
on any such file over 64 MB, a caption track would have gone unmentioned. Spec
§8.2 says that must never happen silently.

Replaced by a forward walk of top-level boxes: read a 16-byte header, jump by
the declared size, repeat. Only the `moov` is ever read whole, wherever it
sits. The 64 MB budget is gone because size no longer enters into it.

**Measured.** On a synthetic file with a 4 MB `mdat` before its `moov`, the old
scan read 4,000,152 bytes; the new one reads under 4,096. On three real corpus
files of 7, 18 and 28 MB: 50 kB, 98 kB and 17 kB, in 1-2 ms, with identical
results — including the QuickTime file's `tmcd` timecode track.

**The test is about bytes read, not bytes present.** Every existing case passed
on the broken code because each fixture is smaller than 64 MB and the head read
swallowed it whole; a fixture big enough to reach the bug would be a 64 MB
allocation in the suite. What the fix has to be is size-independent, so that is
what is asserted.

This also removes most of what VH-82 was about, which has been narrowed to the
frame-rate probe.

**Link:** VH-81, VH-82, spec §8.2; `src/media/isobmff.ts`.

## 2026-08-28 — VH-79 and VH-80: two things the interface said that were not true

**VH-79.** "Starting again will discard the video you just made" is raised with
the file that was current when it was asked, and its Discard button keeps that
file in a closure. `handleFileChange` deliberately leaves the result panel
alone when a result is unsaved (VH-56 — clearing it removed the only route to
a finished file), so choosing a different file left the QUESTION on screen
still bound to the old one. Clicking it processed the file the user had just
replaced.

Fixed by re-rendering rather than merely keeping: on a file change with an
unsaved result, the result panel is drawn again. That drops the stale question
and restores the Save button, which is what VH-56 wanted there in the first
place. Verified in Chrome — process A, press Start again to raise the question,
choose B: the question is gone, A's result and its Save button are back, and
the source panel describes B.

**VH-80.** The subtitle field said timings are "shifted to match the opening
sequence". Openings are dormant (VH-23), so the shift is always zero — the tool
was describing something it does not do, in the one place a user is deciding
whether to trust it with their transcript. It now says the file is carried into
the finished video, timed to the picture, with the words never changed. The
offset code is untouched; it is correct and it will matter again if VH-23 ever
returns.

**Link:** VH-79, VH-80, VH-56, VH-23; `src/main.ts`, `index.html`.

## 2026-08-28 — The compressor detects RMS, and the spec does not say so

Spec 5.2 step 4 gives the compressor a ratio, a threshold, an attack and a
release, and says nothing about what it measures. `compressor.ts` smooths mean
square and feeds that to the static curve — RMS detection, not peak.

Recorded because it is a choice made inside the spec's silence rather than a
departure from it, and because the two behave differently on speech: a peak
detector reacts to every plosive and would need a slower attack to stay
transparent, where RMS follows syllables. A 10 ms window is long enough to
ignore the waveform itself — a 100 Hz cycle is 10 ms, and anything below has
been high-passed away (spec 5.2 step 2) — and short enough to follow speech.

Carried from a VH-7 wish-list note that asked for exactly this entry, and now
tuneable as `COMPRESSOR.detectorMs` rather than a literal (VH-77).

**Link:** `src/audio/compressor.ts`, `src/config/audio.ts`, spec §5.2 step 4.

## 2026-08-28 — VH-62: the harness stops flattering itself, and is not slow

**Criterion 8 was testing the wrong thing.** It built an `AbortController`,
handed it to `runPipeline` on the MAIN thread, and aborted it. That proves the
pipeline unwinds. It says nothing about what Cancel actually does: post a
message to a worker that owns the job, and have that worker abort, release its
Web Lock, delete its scratch, and answer `cancelled`. Every one of those was
outside the check (P2-07). It now drives the real protocol, and waits for a job
directory to appear before cancelling — cancelling a job that has not started
writing proves nothing, and a fixed delay is how that becomes a flaky pass.

**Criterion 2 measured an average and called it correctness.** Loudness is
nearly blind to missing content: a file can hit -16 LUFS exactly having dropped
a third of its frames. It now also asks three separate questions — is the
source still all there, do the frames fill the span they claim, and are there
holes or pile-ups — because each can fail with the others intact.

Measured from PACKETS, not decoded frames. Timestamps and durations live in the
container, and decoding 1,850 frames per corpus entry to count them would have
made the run slower to fix a complaint about the run being slow. It costs
nothing measurable.

**Resource warnings now fail a run.** Mediabunny prints "An AudioSample was
garbage collected without first being closed" and nothing was reading it, so a
run could print a leak and still come out green. VH-75 found a real one this
way. Main-thread only — a worker has its own console — and the check says so
rather than implying coverage it does not have.

**A late-starting or gapped audio track now has an acceptance-level guard.**
The Node tests prove VH-74's arithmetic; this proves it survives a real encoder
round trip. Audio joining 8 s late comes out starting at 8.00 s, and a 6 s hole
comes out with its full 30 s span. On the old behaviour the first would start
at 0 and the second would span 24 s.

**And the run is not slow.** The backlog said over an hour, four minutes per
corpus entry. Measured per phase: build 6 s, pipeline 6-14 s, both loudness
measurements 2 s, coverage 0. A complete run — now ten executed checks — is
**114.5 s**. The earlier figure appears to have been taken while something else
was encoding: two tabs competing for the same hardware encoder turned 20 s into
three minutes, which I reproduced by accident and then eliminated. No
optimisation was needed; the record was wrong.

**Result: 9 passed, 0 failed, 4 need a person, 1 checked elsewhere.**

**Link:** VH-62, VH-71 WP4, review R-11 and P2-07; `src/acceptance/run.ts`,
`src/acceptance/measure.ts`, `src/acceptance/fixtures.ts`.

## 2026-08-28 — VH-74 + VH-55: one clock for both lanes, and nothing discarded

Executed together: they re-time the same four sites, and each one's fixtures
grade the other.

**VH-74, the source timeline.** The video lane preserved its offsets. The audio
lane timestamped from a running count of frames emitted and never read
`AudioSample.timestamp` at all. So a capture whose sound joins five seconds
late came out five seconds early against its picture, and a hole in the middle
pulled everything after it forward — silently, which `AGENTS.md` ranks as the
worst outcome available.

Both lanes now measure from one origin: the earlier of the two first
timestamps. Audio carries its own start offset instead of being packed from
zero, and a real hole becomes the silence it stands for. Three non-obvious
decisions inside that:

A late FIRST sample is never padded — it is an offset, not a gap, and padding
moves the track's end as well as its start. A NEGATIVE one is treated as
absent: measured on `CULT1027`, whose audio reports -21.3 ms, which is decoder
priming the edit list says to skip rather than sound anyone recorded. Delaying
the picture to "preserve" it would move the whole video to match samples nobody
is meant to hear.

Gap positions come from each sample's own timestamp against the frames
consumed, never from accumulated per-gap corrections, so error stays bounded at
half a frame for the file rather than growing with the gap count. A test walks
200 gaps to hold that.

Gaps are filled in EVERY pass. The analysis pass produces the short-term curve
the macro-level envelope is indexed by, and the encode pass applies it by
position — fill one and not the other and the envelope lands elsewhere.

**VH-55, the onset.** Cancelling the AAC encoder's ~44 ms delay by shifting
audio earlier discarded whatever fell before zero. The picture is delayed
instead: it arrives as late as the priming makes the audio arrive, and the two
are in step with no sound lost. `AudioTimelineShift` and the `onset-trimmed`
warning are gone — the warning existed to make that loss visible, and one that
can no longer fire is worse than none.

**The ticket's open question, answered:** Mediabunny's demuxer DOES report the
delayed video timestamps, so this is measurable rather than only believed —
every output below reads `videoFirst: 0.04`.

**Measured in Chrome, three synthesised sources plus a real lecture:**

| Case | Source | Output |
| --- | --- | --- |
| Burst inside the first 44 ms (WebM/Opus, no priming) | onsets 0.000, 2.000, 4.000 | 0.0441, 2.0441, 4.0441 — the first one survives |
| Audio joins 2 s late | audio starts 2.000 | audio starts 2.000; onsets 2.088, 4.088 against flashes 2.04, 4.04 |
| 2 s hole mid-file | marks 3.5 s apart | marks 3.5 s apart |
| `CULT1027`, audio at -21.3 ms | span 89.685 s | span 89.749 s, nothing lost |

A/V separation is unchanged in every case, within the 40 ms video frame grid.
That is the real invariant: the tool must not alter the relationship the source
recorded, only cancel the delay its own re-encode adds.

**Fixtures first, as the ticket required** — but as Node tests, not
acceptance-harness pages: a full harness run takes over an hour and is itself a
known false-pass route (VH-62). Four of the five fail on the old behaviour; the
fifth, an ordinary file with both lanes starting together, stays green.

**Link:** VH-74, VH-55, VH-71 WP2, review P1-02 and R-03;
`src/media/source-timeline.ts`, `src/media/audio-plan.ts`,
`src/media/pipeline.ts`, `src/media/encoder-delay.ts`.

## 2026-08-27 — VH-77: the four small debts

**Tuneables came home.** `MINIMUM_GAP_DEPTH_LU`, the compressor's detector
window, the macro-leveller's envelope step and the two selection deadlines were
literals in the modules that used them. Each is now in `src/config/` — the
first three in `audio.ts` beside the values they qualify, the deadlines in
`thresholds.ts` as `SELECTION_DEADLINE_MS`. No behaviour changed; what changed
is that tuning any of them is a one-line edit in the place `AGENTS.md` says to
look for it.

**The bundle now says what the app was doing.** A diagnostics bundle was a
stack trace and a user agent, and the first three questions anyone reading one
asks — what file, what did the device say, what had the user chosen — it
answered only by inference. `setDiagnosticsContext` records a stage, the
`SourceReport`, the pre-flight summary and the three choices; `resetDiagnosticsContext`
drops all of it when a new file is picked, so a bundle never describes the
file before this one.

The risk this adds is obvious: it is the largest new surface through which the
user's media could escape. Two lines of defence. Call sites pass already-safe
shapes — never a `File`, never subtitle text; and `subtitleVtt`, `vtt` and
`cues` joined the redactor's deny list, because a transcript is not path-like
and not name-like, so no heuristic was going to catch it. Verified in Chrome on
a real lecture: the bundle carries container, duration, codec strings, frame-rate
statistics and a `proceed` verdict, and contains neither the filename nor any
path. 12 kB — still something a person can paste.

**Track identity is carried.** `pipeline.ts` carried the file-level tags and
dropped the per-track ones, so a player offering "English" for the source
offered "Undetermined" for the output. `carryTrackMetadata` reads language,
name and disposition onto both output tracks. Two deliberate departures from a
straight copy: `'und'` is omitted rather than restated, and `default`/`primary`
are forced true — they describe standing among tracks of the same type, and the
output has exactly one of each, so a lone audio track marked non-default is one
some players will not select. A read failure is warned and surfaced as the
existing `metadata-lost` warning, never a failed job.

Measured, not assumed: an MP4 written with `eng`/"Main Presentation" and
`fra`/"Director Commentary" came back out of the pipeline with both intact.
The same measurement showed MP4 stores only `default` of the disposition flags
— `commentary` did not survive even a direct write-and-read — so the rest are
carried in hope of a container that keeps them, and the module says so.

**Rollback is written down.** DEV-INFRASTRUCTURE's deployment section gains the
recipe: there is no undo button because there is no deploy button, so a
rollback is a revert on `main` (never a force-push, which is the one move that
can lose another session's work), with `gh workflow run` only if the push does
not trigger, and a `buildId` check against the head SHA — because the version
identity exists so "exactly what code is live?" has an answer that does not
depend on trusting the deployment log.

**Link:** VH-77, VH-71 WP6; `src/config/audio.ts`, `src/config/thresholds.ts`,
`src/core/diagnostics.ts`, `src/media/track-metadata.ts`, `DEV-INFRASTRUCTURE.md`.

## 2026-08-27 — VH-75: four lifecycle guards, and the leak they exposed

**Decision:** cancel superseded analysis rather than merely ignoring it; hold
job ownership until the worker acknowledges an abandoned job; hold the wake
lock across a save; and dispose a retained workspace before forgetting it.

**Rationale, one by one.**

VH-60 made a stale ANSWER harmless. It did not make the work stop, so choosing
a two-hour file and then another left the first file's whole-audio analysis and
its encode probe running to completion, competing for the cores the user is
actually waiting on. `beginSelection` now cancels what it supersedes — the
registry, the message and the reply handling all existed already since VH-57.

The watchdog posts `cancel` and rejects in the same breath, so the job's promise
settles while the worker is still winding down. Start re-armed there, and the
next `process` begins by disposing every retained workspace — which is how a
finished file gets deleted out from under its own muxer. Ownership is now held
until the worker answers conclusively, bounded by
`WORKER_ACKNOWLEDGEMENT_LIMIT_MS` because a worker that never answers must not
lock the interface out of ever starting another job.

VH-63 tied the wake lock to a running JOB. A save streams a whole file out of
OPFS — pure sustained I/O, no keypress, no progress bar moving — so the one
phase during which a machine is most likely to sleep was the one phase the lock
did not cover.

And releasing a retained result deleted the map entry BEFORE disposing, so a
disposal that threw left nothing in the session able to retry. Worse, letting
the rejection escape would fail the NEXT job, because releasing is the first
thing a new job awaits: one undeletable directory would stop the user working
at all. The entry now survives a failure and the failure is contained — the
rule the orphan sweep already follows (VH-58). Those rules moved to
`workers/retained.ts` for the same reason `cancellation.ts` exists: importing
the worker runs its boot, and this is control flow worth proving in Node.

**The leak it exposed.** Verifying the supersede showed Mediabunny reporting
"An AudioSample was garbage collected without first being closed", exactly at
the cancel point — a wish-list note since 2026-08-25, now reproducible on
demand. Five loops checked `signal?.aborted` and broke BEFORE closing the
sample the iteration had just been handed. Fixed in `audio-plan.ts`, `probe.ts`
(twice) and `branding.ts` (twice); the same supersede now reports zero.

**Verified in Chrome:** the superseded file's pre-flight never reaches
`calibration complete` where the surviving one does; zero GC warnings after the
fix against one before; and a wake lock is requested for a save as well as for
a job. Plus 13 new unit cases over the retained-result and wake-lock rules.

**Link:** VH-75, VH-71 WP3, VH-57, VH-58, VH-60, VH-63;
`src/workers/retained.ts`, `src/main.ts`, `src/core/keep-awake.ts`.

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
