# UoN Video Helper — spec gaps for UX and accessibility, 1 October 2026

The maintainer's question, the same afternoon as VH-104: Band 6 is a UX pass —
what does the specification still miss or get wrong, if the aim is excellent
UX and WCAG 2.2 AAA wherever it can be met? And do the Band 6 tickets
(VH-105 to VH-114) already own each gap?

This review is of the documents, not the running app: [`docs/01-specification.md`](../../docs/01-specification.md)
(chiefly §7, §8, §9, §10 and §13), [`UI-STANDARDS.md`](../../UI-STANDARDS.md)
and the Band 6 section of the backlog, read against every WCAG 2.2 success
criterion and against what a first-time member of staff needs. Source is cited
where it shows whether a rule is already met, unmet, or merely unstated. No
screen reader, phone or running app was exercised; where a claim needs one it
says so. Nothing in VH-104's twenty-five findings is re-reported.

**Verdict.** The rulebook is right and the spec is behind it: `AGENTS.md`,
`UI-STANDARDS.md` and D6 all say AAA by default with each exception argued and
recorded, and §9.3 says "AA minimum, AAA where achievable" and names four Level
A and AA checks. Nothing in §13 makes accessibility a condition of done. Below
that headline, the spec is silent about the moments that cost a novice most:
what keeps a job alive, what survives a reload, what happens after Save, how a
second video relates to an unsaved first, and what the page may announce. The
Band 6 tickets fix the instances VH-104 saw; nine of them need a clause each
so the fix lands on the rule, not just the symptom. This is a requirements
review with proposals and open acceptance work; it does not establish WCAG
conformance.

20 findings: 2 at rank 1, 13 at rank 2, 5 at rank 3. Each becomes a doc-delta
line (the spec is protected; the maintainer signs each edit), a clause on a
Band 6 ticket or VH-M4, or both. The disposition table is at the end.

| Baseline | |
| --- | --- |
| Commit | `1b2fb92`, branch `codex/repository-review-remediation` |
| Claude | Read the spec, the standards and the tickets against WCAG 2.2 A–AAA, then every claim in source |
| Codex astra | `gpt-6-astra`, read-only and independent, same brief; its pass is kept as written: [codex-astra-spec-gap-review-2026-10-01.md](codex-astra-spec-gap-review-2026-10-01.md), including its table of all 86 criteria |
| Then | Codex astra checked the merged draft adversarially: 35 corrections, kept as written in [codex-astra-critique-2026-10-01.md](codex-astra-critique-2026-10-01.md), every one verified against source and applied here before commit — seven ranks it argued back up, two findings it added (A-19, A-20), and the wrong lines and over-claims it found |

**Ranks.** **1** — a novice is blocked, misled, or could lose work or trust.
**2** — a named standard is breached, or real friction. **3** — polish, or a
rule that is met in source and should be written down before it drifts.

## Findings

### A-01 §9.3 promises less than the rulebook, and names only Level A and AA checks — rank 2

**Says.** §9.3: "WCAG 2.2 AA minimum, AAA where achievable. Full keyboard
operation, visible focus, screen-reader-announced progress via a polite live
region, no colour-only status indication." Against it: `AGENTS.md` → Hard
rules ("WCAG 2.2 AAA by default"), `UI-STANDARDS.md` → Accessibility ("Target
WCAG 2.2 AAA for all applicable UI. Document exceptions explicitly"), and D6
("AA is the floor, AAA is the goal… an AAA exception has to be argued for, and
is recorded").

**Gap.** The authoritative document is the weakest of the four, and "where
achievable" carries none of the exception discipline the others settled. Its
four checks are all A or AA; the AAA criteria that decide this page — 1.4.6,
1.4.8, 2.2.4, 2.4.13, 2.5.5, 3.1.3–3.1.5 — are unnamed, and the live-region
sentence leaves announcement frequency unspecified (U-08 is what that
silence allowed).

**Correction.** §9.3 adopts the rulebook's sentence — every applicable AAA
criterion by default; each exception recorded here with the criterion, the
reason, the user impact, the mitigation and the maintainer's decision; an
accepted exception is a recorded limitation, never a passed criterion — and
names the measurable commitments: 7:1 text and 3:1 non-text contrast in
light, dark and forced colours; 44 × 44 CSS px targets; a focus indicator
meeting 2.4.13's area and changed-pixel contrast; 200% text enlargement and,
separately, reflow at 320 CSS px; text spacing; reduced motion; what a live
region may announce (A-06); a lower-secondary reading level (3.1.5); page and
part language. The exceptions this review already knows go in the same list
(A-10, A-15).

**Source.** `docs/01-specification.md:528-532`; `AGENTS.md` → Hard rules;
`UI-STANDARDS.md:185-186`; `docs/03-open-decisions.md` → D6. **From:** both.
**Goes to:** doc-delta §9.3.

### A-02 §13 has no accessibility acceptance criterion — rank 2

**Says.** Nine criteria, all about the pipeline and the media; criterion 7
("reads clearly to a non-technical reader") is the only reader-facing one and
is about copy.

**Gap.** Nothing makes a keyboard-only or screen-reader walk a condition of
"v1 is complete". VH-M4 lists screen readers, phones, speech input and a
Windows contrast theme in its intent, but its "Done when" asks only for three
staff observed — the other checks have no completion or deferral. The test
corpus paragraph lists media gaps and no assistive-technology gap.

**Correction.** Criterion 10: every applicable criterion has evidence or a
recorded limitation across the whole workflow — Choose to Save, and the
error, cancel, retry, kept-result and feedback states — keyboard-only, with
NVDA + Chrome and VoiceOver + Safari, in a Windows contrast theme, at 200%
enlargement and at 320 px, in each language the page offers; the phone and
speech-input checks are each completed or explicitly deferred. The corpus
paragraph names the assistive-technology set.

**Source.** `docs/01-specification.md:582-619`;
`pm_skills/project/backlog.md` → VH-M4. **From:** both. **Goes to:** doc-delta
§13; VH-M4's "Done when" gains the walk until the delta is signed.

### A-03 Nothing says what keeps a job alive or what survives a reload — rank 1

**Says.** §7.5: a Screen Wake Lock during processing, a `beforeunload` warning
while a job is running, a worker. §7.3: a "keep-this-tab-open notice" in the
Warn band only (20–60 min). §9.1 and §9.2: nothing about a finished video's
lifetime.

**Gap.** Three things the spec leaves to chance. (a) The wake lock holds only
while the page is visible, subject to browser policy: `src/core/keep-awake.ts:36-44`
re-acquires on `visibilitychange` because the browser releases it whenever
the tab is hidden; a refusal is logged at debug level (`:88-90`) and a release
is not logged at all (`:80-82`); nothing reaches the screen. So a job in a
hidden tab runs with no lock and the sleep timer may stop it — at five
minutes as surely as at fifty. "Keep this tab open" is the wrong instruction;
"keep this tab visible and the computer awake" is the right one, for every
job. (b) A finished, unsaved video lives in OPFS under a Web Lock; the lock
dies with the tab and the boot sweep removes what is unlocked (`AGENTS.md` →
OPFS checklist 4–5; `src/media/opfs.ts:190-205`). The leave warning does
cover an unsaved result and a streaming save (`src/core/keep-awake.ts:123-131`)
and catches an ordinary reload; it cannot catch a browser crash, Chrome
discarding a hidden tab, or a managed laptop's forced restart, each of which
destroys minutes of work. (c) Nothing tells the user either fact before it
costs them.

**Correction.** §7.5 states the user-facing rule: every job says once, at
start, to keep this tab visible and the computer awake, and that closing the
tab ends the job; the Warn row of §7.3 adds only the estimate's weight. §9.1
step 5 decides the result's lifetime. No recovery is the defensible default
under the OPFS checklist, and it is a disclosed loss risk, not a safe one:
the page says before Create and beside the result that the video is not kept
if the tab closes, keeps the leave warnings, and treats a download as
unconfirmed until it can be checked (A-04). A recoverable result — a
"finished" marker the sweep respects and a next-boot offer to save — is a
design option for the maintainer.

**Source.** `docs/01-specification.md:419-422`, `:431-435`;
`src/core/keep-awake.ts:36-44`, `:80-90`, `:123-131`;
`src/media/opfs.ts:190-205`. **From:** both. **Goes to:** doc-delta §7.3,
§7.5 and §9.1; VH-109 (the line at start), VH-107 (the result's sentence),
VH-113 (backgrounding, a released lock and return-to-tab seen on devices).

### A-04 After Save the spec stops, and the two save routes end differently — rank 2

**Says.** §9.1 step 5 ends at "'Save the video' when it is done". §3.1 names
the routes: File System Access API where available, else a blob download.

**Gap.** `src/media/save.ts:21` has four outcomes. The picker route ends in
"Saved." (`src/main.ts:1589`); the download route — every phone, and Safari —
ends in "Saving to your downloads. The video stays here until you start
another one." (`:1586`). That is honest about hand-off; it is not retrieval
guidance: on an iPhone the file lands in Files → Downloads, which the page
could name, and nothing on any route says to check the file or that
publishing is a separate step the user now takes. VH-114's "one sentence of
what next after Saved" never reaches the download branch. Starting again
during an unconfirmed download already warns (`src/main.ts:1309-1312`).

**Correction.** §9.1 step 5 continues: after a save the page gives only the
destination it knows — the chosen location, or the browser's downloads (Files
→ Downloads on an iPhone) — distinguishes a completed write from a download
handed to the browser, and says what next: check it, upload it, or choose
another video in step 1.

**Source.** `src/media/save.ts:21`, `:126-153`; `src/main.ts:1309-1312`,
`:1558-1590`. **From:** both (Codex ranked it 1; 2 here because the hand-off
sentence does not claim a completed delivery — the retrieval wording is the
defect, and Codex accepted that reason). **Goes to:** doc-delta §9.1; VH-114
(both routes); VH-113 (where the file lands, on the devices); VH-107 (picker
success, cancel and failure, fallback retry, and starting again during an
unconfirmed download, each exercised).

### A-05 A kept result needs its own choices, not only its file's name — rank 1

**Says.** VH-107's "Done when": "a kept result names its file as the previous
video".

**Gap.** Two outputs of the same recording can differ in trim, output and
closing. The retained result (`src/main.ts:1121-1138`, `:1527-1530`) holds
the source file and the requested and applied closing, not the trim or the
preset. Named by file alone, the wrong version is still saved and published
by someone making several in a row — which is this review's rank-1
definition, so Codex's rank stands.

**Correction.** The result and the discard question carry a one-line summary
of the job — file, part kept, output, closing as requested and as applied —
fixed when the job ends and never relabelled by the controls for the next
one; choosing another file resets trim to the whole video and says so. §9.1
gains the sentence.

**Source.** `src/main.ts:1121-1138`, `:1309-1312`, `:1505`, `:1527-1530`;
`pm_skills/project/backlog.md` → VH-107. **From:** Codex. **Goes to:**
doc-delta §9.1; VH-107.

### A-06 Three live regions can speak at once, and 2.2.4 is about consent — rank 2

**Says.** §9.3: "progress via a polite live region". VH-109: "the live region
announces stages and a few milestones".

**Gap.** `index.html` has seven polite regions. Two more than the status line
are rewritten on every keystroke: `#trim-result` (`:157`) on each arrow press
of a handle (`src/main.ts:1001-1013` → `commitTrim` → `:940`), while the
handle's own `aria-valuetext` (`:919-920`) carries the time — two
announcement paths for one press, to be verified with a screen reader; and
`#closing-result` (`:253`, `src/main.ts:262`) on each arrow through a select.
WCAG 2.2.4 (AAA) asks that interruptions can be postponed or suppressed by
the user; fewer milestones reduce frequency without giving that control. §9.2
bans codec, bitrate and loudness settings and says every exposed control is
a decision a novice must make; it does not name accessibility controls.

**Correction.** §9.3 says what a live region is for — a change the user did
not cause or cannot see, and validation or consequential status — and that a
control's own result line is read on demand through `aria-describedby`, not
on the keystroke that produced it. For the job, two readings, and the
maintainer picks one: announce stage changes and the outcome only, on the
reading that the user requested them by pressing Create, recorded under §9.3
as the 2.2.4 position; or a way to postpone routine announcements while the
progress bar stays inspectable — one more control. The default built is the
first.

**Source.** `index.html:85`, `:154`, `:157`, `:217`, `:253`, `:296`, `:394`;
`src/main.ts:262`, `:919-920`, `:940`, `:1001-1013`;
`docs/01-specification.md:518-519`. **From:** both — the regions from Claude,
the consent reading from Codex. **Goes to:** doc-delta §9.3; VH-109.

### A-07 Focus must be handed on, and never taken — rank 2

**Says.** VH-111: "focus moves to Cancel on start, back to Create on cancel,
and to the result on finish or 'Keep it'".

**Gap.** Finish is asynchronous. A screen-reader user reading the sound notes
or the properties disclosure when a three-minute job ends would have focus
pulled to the result — 3.2.5 (AAA) allows a change of context only on
request, or with a way to turn automatic changes off. Hand-ons after an
explicit press are on request; the one at finish is not, and focus resting on
the body is no proof that moving it is welcome. The feedback dialog is modal
(`src/main.ts:1679`, `showModal()`), so it is protected by the browser, not by
the ticket. Separately, U-09's class has more members than the ticket names:
"Use the whole video" disables itself and already hands focus to the start
handle (`src/main.ts:1043-1050`); Save disables itself (`:1541`, `:1614`) and
relabels (`:1603`).

**Correction.** VH-111: on finish, move focus only when the transition
displaced it — it was on a control the job removed — and otherwise announce
and leave it, with the modal untouched. Name every control that removes or
disables itself — Create, Cancel, Keep it, Discard, Use the whole video,
Save — with its hand-on. Announce what the ticket's intent lists and its
"Done when" does not: pre-flight sound notes, output warnings, a missing or
substituted closing, and each save outcome.

**Source.** `src/main.ts:1043-1050`, `:1227-1279`, `:1497`, `:1541`, `:1603`,
`:1614`, `:1679`; `pm_skills/project/backlog.md` → VH-111. **From:** Codex
(the condition, the announcements), Claude (the list). **Goes to:** VH-111.

### A-08 Running text is long, and nothing checks enlargement or reflow — rank 2

**Says.** §9.4: "Responsive and fully readable on phones and tablets."
UI-STANDARDS → Perceivable: contrast, colour, links, headings; nothing on
measure, spacing or enlargement.

**Gap.** WCAG 1.4.8 (AAA) names five things: user-selectable foreground and
background colours, no more than 80 characters a line (40 glyphs for CJK),
no justification, line spacing at least 1.5 with paragraph spacing 1.5× that,
and 200% text enlargement without horizontal scroll — mechanisms the user
agent may supply, if verified. Line height is 1.5 (`src/styles/app.css:30`);
only the `.lede` is bounded (`:158`, 46 rem), and step intros, helper text,
verdict bodies, sound notes and errors run the panel's width inside the 60 rem
column (`:151`) — on the order of 100 and 120 characters of 16 px Arial,
estimated from the rem widths, not measured. VH-104 checked 320 px reflow and
text spacing once, by hand; no test or acceptance clause holds either, or 200%
enlargement — a separate check — across states and languages.

**Correction.** UI-STANDARDS → Perceivable gains 1.4.8's five measures, and
§9.3 cites them (A-01); a measure token of about 70 characters bounds every
run of body text, with the CJK limit stated for VH-105; enlargement, reflow
and spacing join A-02's walk, in every language.

**Source.** `src/styles/app.css:30`, `:151`, `:158`. **From:** both.
**Goes to:** doc-delta §9.3 (with A-01); VH-112 (the token and the rule);
VH-M4 (the checks); VH-105 (CJK).

### A-09 Focus appearance has no written rule, and the test does not measure it — rank 2

**Says.** UI-STANDARDS → Operable: "Focus indicators must be visible and not
obscured by sticky headers or overlays."

**Gap.** 2.4.13 (AAA) is quantitative: an indicator area at least a 2 CSS px
perimeter, and 3:1 between the same pixels focused and unfocused. The ring is
`outline: 2px solid var(--focus); outline-offset: 2px` (`src/styles/app.css:74`,
`:683`, `:837`), inset on the slider thumbs (`:1002-1008`), and its colour
against each layer is tested as a token pair (`test/contrast.test.ts:118-121`,
`:135-136`) — which establishes neither the rendered area nor the changed
pixels of any one control. It likely passes; nothing shows it. VH-112's
`forced-colors` block will redraw these rings with no rule to meet.

**Correction.** UI-STANDARDS → Operable states the rule; VH-112 verifies the
rendered indicators — buttons, segments, thumbs, dialog controls — in every
colour context including forced colours, where a `Highlight` ring is a
starting point, not proof.

**Source.** `src/styles/app.css:74`, `:683`, `:837`, `:1002-1008`;
`test/contrast.test.ts:118-121`, `:135-136`; `UI-STANDARDS.md:201-202`.
**From:** both. **Goes to:** VH-112.

### A-10 "Plain language" has no measure, and the words the spec keeps have no definitions — rank 2

**Says.** §9.2: "Plain language throughout." VH-114 pins names, not
readability.

**Gap.** 3.1.5 (AAA): lower-secondary reading level, or simpler supporting
content. 3.1.3: a mechanism for words used in an unusual way — §4.3 fixes
"Animation onset", "Over existing", "Over generated freeze frame", Cut, Fade,
Slide and None; §6 fixes "Larger / better" and "Smaller / reduced"; the
properties disclosure says "Container" (`src/ui/source-panel.ts:194`), "kHz"
(`:172`) and "Mono" (`src/ui/format.ts:99-102`) — a closed disclosure is
still page content. Only onset has a "?" (`index.html:205-222`). 3.1.4: HDR,
fps, MB and GB have expansions and need them, or plainer words; MP4, MOV, MKV
and WebM are format identifiers to treat one by one, and any left unexpanded
is a recorded limitation. Approved labels are not readability exemptions —
simpler supporting text is allowed beside them.

**Correction.** §9.2 names the level and the check: a readability pass over
every string the page can show — the static markup, the message tables in
`src/ui/*.ts`, and the strings in `src/main.ts`, `src/config/` and the
worker's error paths — in the gate, with simpler supporting text where a
fixed term fails it; every kept term of art and abbreviation has an in-place
meaning (helper text or a toggletip; the result line under the closing
controls serves the type/onset pair); what is left unexpanded is listed under
§9.3.

**Source.** `index.html:205-222`; `src/ui/source-panel.ts:172`, `:194`;
`src/ui/format.ts:99-102`; `test/screen-text.test.ts`. **From:** both.
**Goes to:** doc-delta §9.2 and §9.3; VH-114.

### A-11 Every trim change re-runs the audio analysis, and nothing bounds it — rank 3

**Says.** §7.1: the sound is priced from "pre-flight's own analysis pass over
the kept part, which is timed rather than sampled". §9.1: the user may move
the handles freely.

**Gap.** Each committed trim change schedules `runPreflight` after 500 ms
(`src/main.ts:971-977`), and the worker's pre-flight decodes and measures the
whole kept audio again (`src/workers/job.worker.ts:473-507`) — which it must,
since the §5.4 warnings, whether the kept part has sound, and the AAC check
all follow from it. From VH-100's table (planning PHIL's 374 s in 15.7 s for
about twelve passes) one pass over a half-hour recording is of the order of
six seconds, plus the 3 s video probe's own work — derived, not timed. So a
nudge of a handle on a long recording costs seconds of "Checking this video
against your device…" with Create gone, every time, with no progress and no
stop.

**Correction.** §7.1 says the re-check shows progress and can be cancelled
(U-18), and bounds what it repeats. Time it on the Teams recording before the
clause is written; rank 3 pending that timing.

**Source.** `src/main.ts:971-977`; `src/workers/job.worker.ts:473-507`;
`pm_skills/project/decision-log.md` → VH-100's table. **From:** Claude.
**Goes to:** doc-delta §7.1; VH-108 (the re-checking state), VH-110 (its
cancel).

### A-12 The browser line promises what the check cannot — rank 2

**Says.** §7.3 Block: "name Chrome as the one that will work". §10: "every
block it raises for the browser names Chrome as the one that will work"
(`docs/01-specification.md:555-558`), and "This app is designed and built for
Chrome, other browsers may not work", before anything is chosen.

**Gap.** `src/ui/preflight-panel.ts:27`, `:41` say "Chrome on a computer will
work" for the WebCodecs and working-storage blocks — the latter can be a
managed device's policy or a private window, which the message does mention
— and say it to someone already in Chrome (U-05, which VH-108 fixes for the
decode block only; the storage-space block at `:46-47` already says to free
space). A blocked user sent to the browser they are in is misled, which is
rank 2. A separate question, not established by source: if University managed
Windows laptops open in Edge, which is Chromium and runs when the check
passes, those staff read "may not work" from a page that has just found it
does — whether a passed check may soften the line is the maintainer's call,
and VH-98 chose the line.

**Correction.** §7.3 and §10 — revising VH-98's "names Chrome alone as the
browser that will work" — name Chrome on a computer as the supported
recommendation, not a guarantee, and give each block the recovery that fits
its cause, including when the user is already in Chrome or cannot change
browser. §10's introductory line stays unless the maintainer says otherwise.

**Source.** `src/ui/preflight-panel.ts:27-47`; `docs/01-specification.md:421`,
`:555-558`; `pm_skills/project/decision-log.md` → VH-98. **From:** both
(Codex: the promise; Claude: Edge). **Goes to:** doc-delta §7.3 and §10;
VH-108 and VH-110 (every block, not the decode one).

### A-13 The feedback route is absent from the spec, and promises a reply — rank 3

**Says.** §9 and §11: nothing. The page: "Send feedback" on every state
(`index.html:346`), "Report this problem" under errors (`:320`), a dialog
(`:357-395`) that leaves through the user's email app carrying an allow-list
of facts (VH-93), and says "a reply will come to you".

**Gap.** The page's help mechanism exists only in source; §11 Privacy does
not cover what feedback sends; and no response commitment appears in the
reviewed records. Rank 3 because the route works and is documented in the
decision log — this is writing it into the contract, and one sentence.

**Correction.** §9.2 adds the principle — help and feedback in one place on
every state, including blocked and running, leaving through the user's own
email app with named facts and never media or a file name in the details,
with a copy route when email fails — and §11 names it. The dialog promises
only what the maintainer will honour.

**Source.** `index.html:320`, `:346`, `:357-395`; `src/ui/feedback.ts`;
`src/main.ts:1676-1778`. **From:** both. **Goes to:** doc-delta §9.2 and §11;
VH-114 (the reply sentence); VH-M4 (feedback exercised in blocked and
running states, modal focus return, a kept draft, no email handler, a failed
clipboard, and the translated help understood).

### A-14 The caption warning stops short of the consequence — rank 2

**Says.** §8.3 step 3: warn before processing when an embedded caption track
will not be carried through. §8.2: EchoVideo generates captions after upload.
The page: "If you need them, keep the original alongside."
(`src/ui/source-panel.ts:72-89`; extra audio and video tracks, which may hold
alternatives, at `:55-68`.)

**Gap.** Keeping the original does not make the new file accessible to its
viewers, and the "Smaller / reduced" output goes to messaging and email,
where no EchoVideo writes captions — and EchoVideo's own need checking.
Captions already drawn into the picture survive, subject to the trim and to
the over-picture closing's last second (`src/media/pipeline.ts:558-569`). A
warned loss is not a hidden one, so not rank 1; but a warning that omits what
the user must now do leaves viewers excluded, which is more than polish.

**Correction.** §8.3 step 3: the warning says the new file carries no
separate caption track, that the destination must supply captions — EchoVideo
after upload, to be checked; a file sent directly, by the user — and that
other tracks dropped may have held alternatives; §8.1 adds that captions
drawn into the picture remain, trimmed and overlaid like the rest.

**Source.** `src/ui/source-panel.ts:55-68`, `:72-89`;
`src/media/pipeline.ts:539-541`, `:558-569`. **From:** Codex. **Goes to:**
doc-delta §8.1 and §8.3; VH-114 (the words), VH-111 (announced).

### A-15 The preview is content the page does not control, and a claim must say so — rank 2

**Says.** §9.1 step 2: "a preview in the browser's own player". Nothing in
§9.3 about it.

**Gap.** WCAG's media criteria (1.2.x, 2.3.x) apply to prerecorded media on
the page, and the user's own recording is one; a conformance claim cannot
exclude it, and a statement of partial conformance for third-party content
acknowledges non-conformance rather than converting it. Nothing autoplays
(`index.html:102`) and the controls are the user agent's, so there is no
defect to fix — there is a claim to get right, which needs the uncontrolled
content identified precisely and the rest of the page's level substantiated.

**Correction.** §9.3's exception list records the preview as user-supplied
content under a statement of partial conformance, with the flash and
non-interference limitation stated; any app-supplied instructional media
would need alternatives of its own.

**Source.** `index.html:102`; `src/main.ts:886-889`. **From:** Codex.
**Goes to:** doc-delta §9.3 (with A-01); VH-M4 (the claim's evidence).

### A-16 §9.2 says what an error says and not where — rank 3

**Says.** §9.2: "Every error states what happened, whether the original file
is affected (it never is), and what to do next."

**Gap.** U-05 — a file blocked at step 5 for a reason known at step 1 — is
the symptom; VH-108 fixes the instance; the principle that would have
prevented it is in UI-STANDARDS ("linked to the relevant control";
`UI-STANDARDS.md:149-150`, `:214`) and not in the spec.

**Correction.** §9.2 adds: an input error sits beside, and is programmatically
tied to, the control it concerns; a job or device failure sits in the step it
affects, with its recovery. VH-108 and VH-110 implement the two halves.

**Source.** `src/main.ts:674`; `src/ui/preflight-panel.ts:39`;
`UI-STANDARDS.md:149-150`, `:214`. **From:** Claude. **Goes to:** doc-delta
§9.2.

### A-17 The language switch is a state transition, and VH-105 specifies half of it — rank 2

**Says.** VH-105: one table per language, the page `lang` changes, the video,
trim and running job survive, the choice is remembered, a native reviewer per
language, signed off.

**Gap.** 3.1.2: each switcher option, labelled in its own language, carries
its own `lang`, and the switcher exposes its selected state to keyboard,
touch and speech; passages kept in English are marked, with the exceptions
for proper names and technical terms honoured rather than marking every file
name. Switching must keep focus, a pending trim error, every job choice, an
unsaved result and a feedback draft, and announce its own change. The
`<title>`, `aria-valuetext`, the suggested file name and every live-region
string are in the table. A displayed time ("1:05.5") must still parse when
typed back in that language (`src/ui/trim.ts:20-45`). No CJK face is
explicitly chosen in `--font-body` (`src/styles/tokens.brand.css:77-78`), so
Chinese wrapping and the 40-glyph measure need verifying; the preference
store can fail; `Intl.DurationFormat` needs feature handling where §10 lets
the page run; "sentence case" is an English rule. Losing state or
misidentifying a language is not polish.

**Correction.** VH-105's "Done when" names each; its existing clauses stand.

**Source.** `index.html:2`; `src/ui/trim.ts:20-45`;
`src/styles/tokens.brand.css:77-78`; `pm_skills/project/backlog.md` → VH-105.
**From:** both. **Goes to:** VH-105.

### A-18 The trim keys do not scale with the video — rank 3

**Says.** `src/config/trim.ts:30-34`: arrow 1 s, Page 10 s;
`src/ui/trim.ts:114-134` adds Home and End to the bounds.

**Gap.** 360 Page presses to cross an hour by key alone. Home, End and the
typed fields give direct access, so 2.1.3 holds; a Page step of
max(10 s, 1% of the duration) would make the slider itself usable on a long
recording. Not config-only: `trimKeyTarget` has no duration argument.

**Source.** `src/config/trim.ts:30-34`; `src/ui/trim.ts:114-134`. **From:**
Claude. **Goes to:** wish-list.

### A-19 Trim previews the original, and nothing says so — rank 2

**Says.** §9.1 step 2: "a preview in the browser's own player". The preview is
the source file on an object URL (`src/main.ts:886-889`).

**Gap.** The sound the user hears is the recording as it is, not as it will
be levelled; a very quiet source previews near-silent, and the picture
previews without the closing. Neither pass gave this a contract, and a novice
who hears nothing may conclude the tool has failed, or that the output will
be inaudible. No preview of the output is wanted (VH-78 is iceboxed); a
sentence is.

**Correction.** §9.1 step 2: the preview plays the original; the new file's
sound is levelled and its closing added when it is made.

**Source.** `src/main.ts:886-889`. **From:** Codex's check of the draft.
**Goes to:** doc-delta §9.1; VH-114 (the sentence).

### A-20 The feedback dialog's "size" reads as file size, which is not sent — rank 3

**Says.** `index.html:381-383`: "your video's length, size and format".

**Gap.** The allow-list sends length, display size, frame rate, codec and
container and keeps file size behind (`src/ui/feedback.ts:145-168`; the VH-93
decision: "Everything else stays behind — file size"). "Size" to a reader is
the file's. The user's own message text is theirs and is sent as written
(`:193-194`), so "never a file name" is a promise about the details, not the
message.

**Correction.** "its length, picture size and format"; and "never the video,
its name, or anything in it" scoped to the details the app adds.

**Source.** `index.html:381-383`; `src/ui/feedback.ts:145-168`, `:193-194`;
`pm_skills/project/decision-log.md` → VH-93. **From:** Codex's check of the
draft. **Goes to:** VH-114.

## WCAG 2.2, criterion by criterion

Codex astra's table of all 86 criteria, with a verdict and a source line for
each, is in its report:
[codex-astra-spec-gap-review-2026-10-01.md](codex-astra-spec-gap-review-2026-10-01.md)
→ "WCAG 2.2 criterion table". Its verdicts are adopted here. Its 1.2.x and
2.3.x "gap" rows are A-15's partial-conformance statement; its 2.2.4 row is
A-06's open choice; its 3.1.4 row stays a gap until A-10's expansions are
done and what remains is listed.

## Exceptions to record under §9.3

Each with its criterion, reason, impact, mitigation and the maintainer's
decision, per A-01:

- The preview player's content: user-supplied, under a statement of partial
  conformance (A-15; 1.2.x, 2.3.x).
- Any format identifier left unexpanded after A-10 (3.1.4), one by one.
- The native `<video>` controls: user-agent, exempt from 2.5.5.
- The logo: a logotype, exempt from 1.4.9.
- The 2.2.4 reading A-06 settles on, if it is the stage-only one.

## What only a person can judge

Unchanged from VH-104's list, with two additions: the keep-visible line and
the unsaved-result sentence (A-03) read aloud to someone who has never used
the tool, to hear whether they frighten or inform; and the duplicate
announcement A-06 describes, confirmed or cleared with a screen reader.

## Disposition

| Finding | Rank | Doc-delta | Ticket |
| --- | --- | --- | --- |
| A-01 | 2 | §9.3 | — |
| A-02 | 2 | §13 | VH-M4 |
| A-03 | 1 | §7.3, §7.5, §9.1 | VH-109, VH-107, VH-113 |
| A-04 | 2 | §9.1 | VH-114, VH-113, VH-107 |
| A-05 | 1 | §9.1 | VH-107 |
| A-06 | 2 | §9.3 | VH-109 |
| A-07 | 2 | — | VH-111 |
| A-08 | 2 | §9.3 | VH-112, VH-M4, VH-105 |
| A-09 | 2 | — | VH-112 |
| A-10 | 2 | §9.2, §9.3 | VH-114 |
| A-11 | 3 | §7.1 | VH-108, VH-110 |
| A-12 | 2 | §7.3, §10 | VH-108, VH-110 |
| A-13 | 3 | §9.2, §11 | VH-114, VH-M4 |
| A-14 | 2 | §8.1, §8.3 | VH-114, VH-111 |
| A-15 | 2 | §9.3 | VH-M4 |
| A-16 | 3 | §9.2 | — |
| A-17 | 2 | — | VH-105 |
| A-18 | 3 | — | wish-list |
| A-19 | 2 | §9.1 | VH-114 |
| A-20 | 3 | — | VH-114 |

Codex's pass, by number — S-01 → A-01 and A-02; S-02 → A-08; S-03 → A-09;
S-04 → A-06 and A-07; S-05 → A-04; S-06 → A-03; S-07 → A-05; S-08 → A-10;
S-09 → A-17; S-10 → A-14; S-11 → A-15; S-12 → A-12; S-13 → A-13. T-01 → VH-M4
(A-02); T-02 → VH-112 and VH-M4 (A-08, A-09); T-03 → VH-109 (A-06); T-04 →
VH-111 (A-07); T-05 → VH-107 (A-05); T-06 → VH-107, VH-113, VH-114 (A-04);
T-07 → VH-109, VH-107, VH-113 (A-03); T-08 → VH-114 (A-10); T-09 → VH-105
(A-17); T-10 → VH-114, VH-111, VH-M4 (A-14, A-15); T-11 → VH-108, VH-110
(A-12); T-12 → VH-M4, VH-114 (A-13). Ranks changed from its pass, with the
reason in the finding: S-05 and S-13 down, accepted by its check; S-10 down
to 2, reasoned in A-14.
