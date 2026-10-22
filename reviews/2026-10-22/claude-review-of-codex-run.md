# Claude's review of Codex's 21 October run — 22 October 2026

Codex (gpt-6-astra) was the only writer of eight commits, `30ad5dd` to
`25a4a8f`. They cover VH-148 (closing VH-124), VH-141, VH-142, PLAN-3's
close, VH-144, VH-145, VH-146 and PLAN-4's close. All eight are on `main`
and live on the pilot. No second model checked them. This is that check,
made by Claude Opus 5.5 with three read-only reviewers, against each
item file's acceptance criteria, the hand-off Codex worked from
(`reviews/2026-10-21/codex-handoff-2026-10-21.md`) and its report.

## Verdict

The run did most of what it said. The gate is green at `25a4a8f`: 1,408
tests pass, the one existing EBU case is skipped, and
`node tools/check.mjs` reports no structural or budget failure.

- **The ledger is sound.** Every archived decision is a verbatim move, and
  every backlog strike and phase close is in place. The last four
  trajectory lines total 161 of 300 words. No `Checked:` line was claimed,
  and none of the writing review's 24 proposals was applied.
- **The live page matches the owner's sign-off.** Checked at 1280 and
  375 px, in light, dark and forced colours (build `20261021.25a4a8f`):
  - the Teams link opens a new tab with `noopener noreferrer`, and the
    learning content team's link is a mailto to its own address;
  - "Video read." stands alone with sound, and "**No sound.**" is added
    in bold without it, with Video properties keeping the figures;
  - the trim bar's cut parts are hatched, with a 1 px strong edge, and
    stay apart in forced colours;
  - the three switch headings are 16 px bold over 14 px semibold
    segments;
  - every disabled `.button` takes the dashed edge.

Five findings are rank 1. All of them are in VH-141's and VH-148's
changes, and VH-149 fixes them. There are 13 rank-2 findings and about
25 rank-3 ones for the owner. Two classes of slip recur:

- **A shared status line used as an announcer.** Two sentences overwrite
  the words already on step 1's line.
- **A word-for-word string replacement.** "Closing graphics" was put in
  without reading each translated sentence.

## How the live page was checked

Headless Chrome 155 over CDP drove `https://djdaojones.github.io/UoN-Video-Helper/`
at 1280 × 900 and 375 × 812, in light, dark and emulated forced colours.
It used two ffmpeg fixtures: 10 s with stereo sound, and 10 s with none.

The measurements are in `evidence/live-spot-check.json` and
`evidence/live-disabled-and-locked.json`, with captures beside them. The
trim captures are `trim-1280-light.png`, `trim-1280-forced.png` and
`trim-375-dark.png`. The others are `read-silent-1280-light.png`,
`footer-375-forced.png`, `switches-375-light.png` and
`locked-onset-375-*.png`.

Only a person can check three things:

- what NVDA and VoiceOver actually say;
- a real Windows contrast theme, where the emulation draws Highlight
  translucent;
- the Teams link behind a University sign-in.

## Rank 1 — fixed in VH-149

1. **VH-141: a captured error empties step 1's line, and with it a
   blocked start-up's reason.**
   - **The cause.** `showError` called
     `setSourceStatus('', () => t().errors.revealed)`, which replaces
     whatever step 1's line said.
   - **Who hits it.** When the worker never answers, `settleStartup(false, …)`
     writes the block's reason and remedy there, then the same failure
     reaches `showError` and wipes them. A blocked user sees no reason
     under the chooser that is shut.
   - **Reproduced on the live pilot** at both widths, with a stand-in
     worker that never answers: the line held only a visually hidden span
     (`evidence/vh149-live-before.json`).
   - **Other effects.** Any later uncaught error blanks "Reading the
     video…" or "Video read. No sound.", and a change of language speaks
     the sentence again.
   - **Rules broken.** Nielsen 9; UI-STANDARDS, System status ("never
     appear frozen", the failure says what next).
2. **VH-141: a preview the player refuses empties "Video read." and its
   bold "No sound."** The preview's `error` handler made the same call
   with `trim.noPreview`. For such a file, step 1's line stays blank for
   the file's lifetime, losing the signal the owner asked to be bold
   because "this could be an error that needs detecting". Reproduced live
   at both widths.
3. **VH-141 weakened a pin.** Taking `saveFailed` out of `saveMessages` in
   `test/screen-text.test.ts` dropped its half of the pair that says a
   save's message never goes to the job's line, through `setStatus`. Only
   the positive check was added back.
4. **VH-148's "closing graphics" broke two translations.**
   - **Chinese:** `trim.intro` now reads 剪掉开头或结尾图形不需要的内容,
     "cut unwanted material from the start or the closing graphics". There,
     结尾 meant the video's end.
   - **Malay:** five sentences now begin in lower case after a full stop
     (`closing.helpFreezeText` and four `result.fellBackToFreeze.*`
     strings, "… pudar. grafik penutup …").
5. **VH-148 rewrote the statement's kept sentence in Chinese and Malay.**
   The criterion was to drop "Joe Bell runs it…" with the rest unchanged.
   - **Malay:** "Kenyataan … iaitu halaman yang sedang anda gunakan"
     became "Pernyataan … halaman yang sedang anda lihat". It now names
     the statement with a word other than its heading's ("Kenyataan
     kebolehcapaian").
   - **Chinese:** the sentence was reordered.

### What VH-149 changed

- **One always-present announcer.** A visually hidden polite live region,
  `#page-announcer`, sits outside every step and the errors panel. It
  says Errors captured once, as the panel appears, and a refused preview
  once. It is emptied on a change of language. Step 1's line keeps its
  words.
- **The pin is restored.**
- **The strings are corrected through the sheet.**
  - Chinese: 剪掉开头或结尾不需要的内容.
  - Malay: "Grafik" ×5.
  - The two statement sentences are restored, exactly as before VH-148
    and less the dropped one.
- **Regression tests, by category.**
  - Markup: the announcer's position.
  - Source pins: neither handler touches step 1's line.
  - Every table: no sentence starts in lower case after a stop.
  - Chinese: the trim intro.
  - The statement's first sentence.
- **Checked in the browser.** In Chrome against the dev server, at 1280
  and 375 px (`evidence/vh149-after.json`):
  - the blocked start-up keeps "The part of the tool that does the work
    did not start. Reload the page…";
  - two captured errors and a refused preview leave "Video read. **No
    sound.**" in place;
  - a switch to Malay empties the announcer.

## Rank 2 — for the owner

1. **VH-141: after a watchdog failure, "The job is stopping" is never
   withdrawn.** The status keeps the stopping sentence as a spoken tail
   after `settled(id)` and Create return. Nothing says the stop is over,
   and a change of language speaks it again. Fix: replace it once
   settled.
2. **VH-141: re-ticking Show progress shows the last job's bar.**
   - **The cause.** Neither `beginJob` nor `hideProgress` resets
     `processProgress.value` or the progress text.
   - **The scenario.** Start a second job, then untick and re-tick Show
     progress before its first report. The page shows the first job's
     100% "Ready", or a failed job's last percentage.
3. **VH-141: two primary buttons.** Choosing an unreadable file while an
   unsaved result stands makes the chooser primary again
   (`clearTrim('unreadable')`) beside the result's primary Save. This
   breaks "one primary button per state". The criterion asked for the
   emphasis back, so this needs the owner's word.
4. **VH-141: the Show progress control.**
   - **Beyond the criterion.** The criterion asked for the 2.2.2 reading
     to be decided and recorded as a spec wish line, not for a new
     control.
   - **Hard to reach.** It sits in `#announce-field`, which is hidden
     outside a job, so it cannot be set before the motion starts.
   - **Not remembered,** while Announce progress beside it is.
   - **Stale words.** The markup comment still says "One plain control …
     remembered", and its help text leaves out the tab title.
   - The owner's call: keep, remember, or withdraw it.
5. **VH-141: most criteria have browser evidence and no pin.** V-03,
   V-04 and V-10 to V-15 rest on `vh141-browser.json` alone. Cheap source
   pins would hold:
   - `lifetimeOf` starting from `delivered`;
   - warnings surviving a redraw;
   - `saveError` cleared by `setSaveStatus`;
   - the `onStage` guard;
   - `clearTrim('unreadable')`;
   - `.textarea:disabled`.
6. **VH-148: a locked select's arrow still looks live.** The new
   `.select-wrap::after` takes the wrapper's `currentColor`, not the
   select's. Under None, the locked onset select has a dashed edge and
   secondary text, but a primary-colour arrow, and CanvasText against
   GrayText in forced colours (`locked-onset-375-*.png`). The native
   arrow it replaced followed the disabled state. Fix: colour the arrow
   from `.select-wrap:has(.select:disabled)`, and GrayText in the
   forced-colours block.
7. **VH-148: the English trim intro's verb no longer agrees.** It reads
   "the sound is levelled and the closing graphics added". It should say
   "are added".
8. **VH-148: the browser sentence's translations reworded the part all
   three sentences share.**
   - Chinese: 本应用 against its siblings' 此应用 … Chrome 浏览器.
   - Malay: "direka dan dibina … semakan" against its siblings' "direka
     bentuk … pemeriksaan".
9. **VH-148: "(opens in a new tab)" in the footer.** The page's own
   phrase, in the Equality Advisory link the hand-off named as the model
   and pinned in `accessibility-statement.test.ts`, is "(new tab)".
10. **VH-148 and VH-141: the sheet's notes are out of step with its
    cells.**
    - `source.readSummary` still explains `{facts}`.
    - `titleCard.submission.idsHelper` still explains `{max}`, which
      moved to `idsHelperNext`, and that row has no note.
    - The four new continuation rows say "Helper continuation on its own
      line" rather than where they show.
    - `sheet.ts`'s translator notes still say "the closing".
11. **VH-144: the trim field's floor can force sideways scrolling.** The
    rule `flex: 1 0 var(--field-min-width); min-width: var(--field-min-width)`
    never shrinks below 12 rem. At 320 px there are 30 px to spare.
    - **Where it would scroll.** By arithmetic, not reproduced: in a
      frame narrower than about 290 px (a Xerte frame), or at 320 px
      with an 18 px default font.
    - **Fix.** `min(var(--field-min-width), 100%)` on both, already
      exempt in the stylesheet test.
12. **VH-146: the unbreakable-date test does not guard Chinese.** A
    reviewer's mutation test made the date breakable again, and `zh-Hans`
    still passed. The fake measure makes the note the wider piece, so the
    refusal comes from the note, never the date. Fix: also assert that
    the date alone, one pixel short, is refused.
13. **VH-148: the read line's unit test pins a function the page no
    longer calls.** `main.ts` composes the read line in
    `setSourceReadStatus`, and `summarise()`, `closingResultText()` and
    `studentIdsHelperText()` are now called only by tests. Either test
    what the page draws, or retire the three.

## Rank 3 — for the owner

**Words.** Chinese and Malay are the agent's drafts.

- **Chinese, step 6.** The status lines still say 创建 under the 制作视频
  button (`正在创建视频`, `视频无法创建`); Malay's `couldNotCreate` says
  "dihasilkan" beside "Cipta".
- **Chinese spacing.** `此Chrome 浏览器`, `更新Chrome 浏览器` and
  `MP4 视频 （.mp4）` keep a space on one side only, or before a
  full-width bracket.
- **Chinese, stopped saves.** The stopped and cancelled saves say
  再次尝试保存 ("try saving again"), which reads as a failure where the
  user chose to stop. It is pinned by VH-142's test, the criterion's
  literal reading.
- **Chinese, `failure.captured`.** It says 报告此问题 twice. The English
  repetition waits on the writing review.
- **Chinese, `preset.details.smaller`.** It can read as uploading the
  messages too: 用于 Moodle 作业上传、即时消息或电子邮件等.
- **English, decode damage.** "Recording" names two things in the detail
  ("the original recording … your recording"). The owner's call.
- **English, Prettier slips.** `en-GB.ts` has double-quoted strings and a
  mis-indented `idsHelperNext`. The gate does not run Prettier.
- **Dead string.** `source.variableFrameRate` is now unused in all three
  tables. Variable frame rate stays in Video properties.

**Page.**

- **The disabled "Choose file" button.** The browser-drawn button keeps
  a solid edge while a job runs (`.file-input:disabled::file-selector-button`).
  Clause 11 named disabled buttons.
- **Two notifications, one inside the other.** A kept result's warnings
  are a full warning notification nested inside the success
  notification. That gives two rails and the tail "None of these stop
  you continuing" under a finished video.
- **Dead restore code.** The restore in `runPreflight` is now dead, and a
  storage re-check that still fails says "Video read." before the block
  again.
- **Small items.**
  - The `!cancelRequested` check is redundant.
  - `saveFailedWhat` and `saveFailedNext` duplicate `saveFailed` in three
    tables.
  - One sheet note repeats itself.
  - "Set end here" hands focus to the start field.
  - `.textarea[aria-invalid]` outranks the dashed disabled edge.

**Code and tests.**

- **VH-146 finds the date and caveat by matching the finished sentence.**
  An unmatched future template becomes one unbreakable piece, refused
  against the assignment field with an error no edit clears. It is safe
  for today's three tables, which are tested.
- **VH-144.** The three controls' `aria-describedby="closing-none-reason …"`
  has no markup pin. None's shared reason is keyed to the colour rule,
  not to `type === 'none'`.
- **VH-145, weight tokens.** VH-148's comment, "Productive group heading…",
  now sits over all three. `.check .mark` is a status glyph, not a
  heading, but takes the heading weight.
- **VH-145, the link rules.** Grouping them dropped the WCAG 2.5.5
  comment that said why `.notification-link` is 44 px.
- **VH-145, its pins.** Nothing checks the 400/600/700 values, the body
  rule, or a weight inside a `font:` shorthand.
- **VH-145, its decision.** It says colours were kept, but the errors
  intro moved to secondary text through `.step-intro`. That was asked
  for, and is AAA, but the record is inexact.
- **VH-146, little headroom.** The worst Chinese 4:3 card has 1 px per
  1080 to spare. Another machine's Chinese font could refuse it, never
  clip it.
- **The Creators team's JSDoc.** `CREATORS_TEAM_URL` calls it "The
  owner's Creators team". The item's notes say it is the learning
  content team's own team.
- **The footer test** checks the Teams host, not the address the
  hand-off gave.
- **The readability parser** now splits `radio-detail` and `helper-line`
  spans into passages, which let the Moodle helper's radio pass. That is
  defensible, as they are laid out as separate lines, but it is a
  measurement change the owner should know about.

**Ledger.**

- **Trajectory.** The Phase 3 and Phase 4 item lines are separated by
  blank lines, unlike every other phase.
- **Decision lines.** Several give "taken gateless" as their one-line
  why, for example VH-144, VH-145 and VH-146, rather than the reason.
- **PLAN-4.** It names no next phase's first item, saying the owner must
  direct. Rule 2 supports that, so the owner's direction is the next
  step.
- **VH-124's item file** is 1,588 words against a soft 600, and
  check-memory warns.

## Checked and sound

- **VH-148:**
  - Every bare English "closing" now says "closing graphics", with the
    verbs agreeing; "Closing branding" and "closing card" are untouched.
  - `index.html`'s static English matches en-GB for all 118 bindings.
  - The three tables have the same keys, and each changed row is marked
    as the agent's draft in the sheet.
  - The feedback dialog and the statement keep the owner's address.
  - The hatch's colours are pinned at 3:1 in all three contexts.
- **VH-141:** `jobEnding` and `cancelRequested` reset per job. No
  listener is bound twice, and focus hand-offs target connected
  elements. The failed-save notification is announced once.
- **VH-142:** every criterion is met, and no test was loosened. The only
  deleted test was the owner's-address stopgap, retired by its own
  comment.
- **VH-144:**
  - None's reason is hidden unless the type is None.
  - Every `aria-describedby` id exists.
  - Cut's own reason returns.
  - The wrap is scoped to the two trim rows and uses tokens only.
- **VH-145:**
  - All eleven weight sites keep their value, and no literal weight
    remains.
  - The grouped rules were identical, and `--font-mono` lives in the
    brand file.
  - No pin or exemption was loosened.
- **VH-146:** Submission's date is always generated, and the card's
  words are unchanged. The worker and the spike share
  `submissionCardBlocks`. A piece wider than its line is refused, never
  clipped.
