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

## Archived: 5 entries, 2026-09-21 → 2026-09-30 — see archive/decision-log-0004-2026-09-21-to-2026-09-30.md

## Archived: 30 entries, 2026-08-27 → 2026-08-28 — see archive/decision-log-0003-2026-08-27-to-2026-08-28.md

## Archived: 25 entries, 2026-08-25 → 2026-08-27 — see archive/decision-log-0002-2026-08-25-to-2026-08-27.md

## Archived: 12 earlier entries — see archive/decision-log-0001-2026-08-25.md
