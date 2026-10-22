<!-- markdownlint-disable -->
<!-- VH-171, second chat: the scenario draft checked against the source at fc50023 by a Claude subagent, read-only. Corrections to apply to scenarios-2026-10-22.md before Codex astra's method check; not yet applied. -->

# Review of scenarios-2026-10-22.md against the source at fc50023

Read-only check. Paths are relative to the repo root. Rows and citations that
are not listed here checked out: line numbers within about two lines, wording
the same as en-GB.ts, focus as the code moves it.

## Corrections

| ID | Column | Draft says | Source says | Evidence |
| --- | --- | --- | --- | --- |
| (intro) | citation | `focusHeldBy` at `main.ts:898` | `focusHeldBy` is at 900 (898 is its doc comment). The other intro citations hold: 1749 is 1751, 948 is 950 | src/main.ts:900, 1751, 950 |
| S-04 | Status | "Page language: 简体中文。" once | It is said in the new language: "页面语言：简体中文。" (English only when switching to English) | src/i18n/zh-Hans.ts:32; src/main.ts:3665 |
| S-06 | citation | lang/title/side set before the repaint (`main.ts:3585`) | 3585–3589 only opens the statement for the fragment. `lang` is set when the module loads, at line 251 | src/main.ts:251, 3586 |
| S-08 | Walk | "walked (x-07)" | No step is called x-07. The ms-MY pick on an English page is `en-sub-07-video-language-changed` (languageSetup) | walk.mjs:887–888, 942–945 |
| S-13 | Walk | walked (design-walk previous-longname) | `previous-longname` is captured after `waitSettled`, which is the S-63 state. The read of the replacement is never captured, so this needs a new capture before settle | design-walk.mjs:256–259 |
| S-33 | Focus after | "Next field" | Tab from Start time goes to "Set start here", the next control in the DOM, not to End time | index.html:184–190 |
| S-34 | Status | "Checking…" | `status.checking`: "Checking this video against your device…" | src/main.ts:1886; en-GB.ts:404 |
| S-36 | Status | Intro; "Type a title, department, or authors … date is filled in for you." | With the box unticked the rule line is `null`. Only the intro shows. The rule appears only once the box is ticked (S-37/S-39) | src/ui/title-card-step.ts:123–126; src/main.ts:2606–2609 |
| S-37 | Walk | staff-card 01–04 | Step 02 is taken only if a date-only job *started*. Under VH-157 it is refused, so the date-only refusal is not captured. The walker needs a capture after that first Create | walk.mjs:150–159 |
| S-52 | Focus after | Create (`main.ts:2993`) | Create only if Cancel had focus when pressed: `handTo = startButton`, handed on by `fromCancel` in `finally` | src/main.ts:2995, 2949, 3044 |
| S-55 | Setup | `short-2s` with Fade falls back to freeze | Freeze is used only when the video is shorter than the 1 s onset (`videoDurationSeconds < onsetSeconds`). A 2 s file never falls back. Needs a fixture under 1 s (trim cannot shorten, min 3 s) | src/media/branding.ts:199–202; src/config/branding.ts:51 |
| S-55 | Setup | F6, "cut, or not loaded" | These are two variants. Blocking only `closing-onset-*.webm` gives `fellBackToCut`; blocking every closing URL gives `notLoaded`. Fetch is at branding.ts:260 | src/media/branding.ts:248, 260 |
| S-56 | Focus after | failure box, if on Cancel (`main.ts:3055`) | 3055 is the `resetProgress` doc comment. The box is `handTo = showFailure(...)` at 2999 (tabIndex -1 at 3003), handed on at 3044 | src/main.ts:2999–3003, 3044 |
| S-56 | Transition | "locks held until the worker settles" | Out-of-space comes back as a `failed` reply, so `finally` clears the locks at once. Holding the locks with "The job is stopping…" happens only on the `.catch` path (watchdog timed-out / unknown) | src/main.ts:2996–3004 vs 3007–3037; src/workers/failure.ts:88 |
| S-69 | Setup | F4d: `createWritable` rejects, which gives "could not be saved" | `saveFile` catches any non-Abort error and **falls back to a download** (outcome `downloaded`). F4d therefore gives S-70's hand-off, not a failure. See "Infeasible" | src/media/save.ts:155, 178–196 |
| S-70 | Focus after | As S-62 (the result) | After a download `saved` stays false, so `fromGone(saved ? heading : save)` hands focus back to **Save**, not to the result | src/main.ts:3388 |
| S-70 | Walk | walked (phone 09–11) | Phone 09–11 never press Save a second time. The retry needs a new step | walk.mjs:830–837 |
| S-79 | Transition | "No mailto" for both texts | Only `tooLong` withholds the mailto. "Some details did not fit …" (`someOmitted`) is said after the mailto **has** opened (the S-78 path with trimmed details) | src/main.ts:3523–3542 |
| S-86 | Walk | reuses S-06 (the same reload) | S-06's walk never picks a video language, so a pick that holds over the page language is not exercised. Needs its own reload step (cheap: extend `remembered-language`) | walk.mjs:987–1001; src/main.ts:509–516 |
| S-73 | Setup | `estimate` rejects (F3 variant) | `checkStorage` runs in the **worker** (`inspectCapabilities`). A page init script cannot reach it, and `overrideQuotaForOrigin` cannot make it reject. This needs new walker code: attach to the worker target, or rewrite the worker script with Fetch. The row also says "reuses S-24", which conflicts with its own setup | src/media/capability.ts:157–175, 184; src/workers/job.worker.ts:30 |

## Notes (not errors)

- **S-01:** the ping deadline is 5 s. If F1 holds the worker past that, the page turns to blocked (`workerNotStarted`) and Errors captured appears. Capture the pending state inside 5 s. Held on purpose, the same fault gives a second blocked variant. Evidence: src/main.ts:1155, 1262, 1324–1335.
- **Finite list, "Ready with warnings" → S-18:** S-18's heading is "Ready to go" with sound notes. If the plan means the warn verdict ("Ready, with one thing to know"), use S-24 or S-73, though both need new setup.
- **Finite list, "A failure" → S-56:** S-56 depends on the F3 pilot. Name S-29 (unreadable) as the fallback, since it is certain.
- **S-80:** in headless Chrome, `clipboard.writeText` can reject without document focus even when permission is granted. Pair F5 with `Emulation.setFocusEmulationEnabled`.

## Missing items

1. **4:3 has no scenario ID.** It sits only in the additions list as "reuses S-15". Give it a row (or a reuse row) with its own record: Video properties shows 640 × 480 and the verdict prices it, and the walk capture is `en-staff 42`. The plan names it among the pre-flight warnings. The source has no 4:3 warning (no such string in en-GB.ts), so the row should say "no warning, by design".
2. **The discard question withdrawn by a change.** A change to type, language, trim, preset, closing or card while the question shows retires it and restores the result (`withdrawDiscardQuestion`, src/main.ts:627, 659, 701, 1664, 1877, 2665, 2695). This is not in the table, though S-50/S-71 switch beside a kept result.
3. **The device check failed** (`check-failed`: "The device check did not finish." with Check again focused). This is a different state from S-35's stopped check (src/main.ts:1617–1645, 2287).
4. **The job failure with locks held** (the watchdog or unknown path, "The job is stopping. Please wait before trying again."). This is the behaviour S-56 wrongly claims (src/main.ts:3007–3037).
5. **The previous result's warnings, beyond ended-early.** S-64 covers only the ended-early line. The output warnings block and a closing-fallback line beside a "Previous video" are not covered. Both are in `renderResult` (src/main.ts:3215–3225).

Optional additions, absent but not required by the plan: the other drop refusals (several files, while saving, during startup or blocked; src/main.ts:1369–1381), a card field that does not fit (`refused.field/card`), the submission ID errors (design-walk `id-error` exists), and the re-check after a preset change (en-staff 21).

Mapping check: all 64 catalogue rows appear in "Every catalogue row mapped". Every plan addition is present except 4:3, which has no row (item 1). The finite list has all eleven states.

## Infeasible setups

- **S-69 (save failed):** F4d cannot reach it, because `saveFile` turns a non-Abort picker error into a download (save.ts:178–196). The `catch` at main.ts:3361 is reached only if `saveFile` throws. One fault that does that is no picker (or a picker that throws a non-Abort error) together with an init-script `URL.createObjectURL` that throws. That is a new fault. J3's route (…S-53 → S-69 → S-62) breaks here until one is added.
- **S-55 (fell back to freeze):** cannot be reached with `short-2s`. It needs a new fixture under 1 s. The F6 half needs two variants of the block (onset only, and all).
- **S-73 (storage unknown):** cannot be reached with the listed faults (the estimate runs in the worker). It needs new walker code to fault the worker, or keep it as a reuse with no setup.

Feasible but needing new walker code beyond a fault switch: F4b (a slow writable wrapper around the OPFS handle's `createWritable`), F4c (`getFile()` returning `fileInput.files[0]`; identity match at save.ts:149), F7 (`dispatchEvent(new Event('error'))` on `#trim-preview` works, since the handler checks only `previewUrl`, main.ts:1976), and new capture steps for S-13, S-37 (date-only refusal), S-70 (Save again) and S-86.
