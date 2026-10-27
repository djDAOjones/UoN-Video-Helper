<!-- markdownlint-disable -->
<!-- Claude's fix plan for VH-202 (2026-10-27), saved as vh202-claude-plan.md in the orchestrator's notes before Codex astra's blind fix items were briefed or ran, verbatim. Its `steps 2–4 (and 5 unless a result stands)` for V-46 is the setup steps by an old count: they are steps 2 to 5, and step 6 unless a result stands (`index.html:124–565`). -->

# VH-202 — Claude's fix plan, frozen before Codex astra's blind fix items

VH-202 #1, 27 October 2026, at `f012bc9`. Saved before Codex's brief was written and before its answer; not edited after. Source read for sizing: `src/media/audio-plan.ts:99–125`, `:335–350`; `src/workers/job.worker.ts:520–560`; `src/audio/warnings.ts:1–40`, `:80–92`; `src/ui/warning-text.ts:55–70`; `src/i18n/*.ts` `noAudio`, the trim's labels; `src/main.ts:905–950`, `:1470–1505`, `:1580–1610`, `:1744–1775`, `:3068–3082`, `:3275–3335`, `:3485–3500`; `src/ui/announce.ts:30–50`; `src/styles/app.css:180–220`, `:1084–1130`; `index.html:460–472`; `docs/01-specification.md` §5.4.

## The items

Five fix items, VH-206 to VH-210, in Phase 8 between VH-202 and VH-203. Each is one session's work and carries VH-203's stage rule whole in its criteria (below).

### VH-206 — V-51 (rank 1): a kept part with too little audio is told so, in the owner's words

- **Mechanics (buildable now).** The silent keep `keptSilence()` (`audio-plan.ts:124`, reached from `keptTooLittleSound()` at `:120`, a trimmed range only) is told apart from a source with no audio track. The worker (`job.worker.ts:535`) carries the reason from `measured` (`'silent' in measured`) to `detectSourceWarnings` (`warnings.ts:92`): the existing `no-audio` warning gains the reason (a `detail` field, or a second code; the build chooses and says why), and `warning-text.ts:69` picks the words. `ends-early` and `cut-short` keep their precedence. No control; the threshold is `BLOCK_SECONDS`, unchanged; `loudness.ts` untouched, so the EBU harness is not re-run unless it is touched.
- **Words (the owner's).** Genuinely absent audio keeps today's `noAudio` words. The kept-part case takes the owner's approved words in three string tables, a translator note in `src/i18n/sheet.ts`, and the tests that quote them. A trimmed keep with no decoded frames at all takes the kept-part words too (the file has a track; keeping more is the recovery) — flagged for the critique.
- **Tests.** `sub-block-sound.test.ts` (the 50 ms and 390 ms cases) reach the new reason; a source with no audio track keeps `noAudio`; `warnings.test.ts` / `warning-text` tests pin both.
- **Check.** S-99 (N8a, the 21.3 ms of priming) and S-100; VH-201.2's kept sliver of audible sound (N14, sound from 3.71 s, kept to 0:04.0) walked with the output's tracks read; a no-track source keeps today's words; three languages, light/dark/forced, the warning panel's text at 320 and 1280 px.
- **WCAG:** 3.3.3, 3.1.5 (reading level, AAA), 4.1.3 (the spoken heading), 2.4.6. Nielsen 1, 2, 9. Digest rules: nielsen "errors say what next"; wcag-2.2-aaa 4.1.3.
- **Docs.** Spec §5.4's "No audio track" row ("Source has no audio stream") does not name the kept-part case VH-185 made: a wish line drafted for the owner (a row, or the condition widened).
- **Blocked** on the owner's words.

### VH-207 — V-46 (rank 2, regressed): focus handed on when an unreadable file withdraws the setup steps

- Both read-failure paths (`main.ts:1486` the failed reply, `:1500` the exception) reach `clearTrim('unreadable')` (`:1756`), which hides steps 2–4 (and 5 unless a result stands) with no capture. Capture `focusHeldBy(stepsWithdrawnBy({ setup: false, create: resultStanding }))` before `revealLaterSteps` and hand to `fileInput` — once, inside `clearTrim`'s unreadable branch, or at both callers; the build says which. Focus elsewhere, a reader's and the feedback dialog's, stays (`focus-hand-on.ts`'s guards).
- **Check.** S-149's three languages; the J4 case (a finished video standing, focus in step 3 or the trim, an unreadable file chosen beside it: steps 2–4 withdrawn, step 5's Save stays, focus to the file chooser; focus on Save stays) declared as a walker variant and kept for VH-203; the exception path (a reply that never comes, by the walker's fault) as its own variant; focus held outside the withdrawn steps unchanged. After-state ring read in three languages and four modes; where the successor is the file input its ring is read as it is.
- **WCAG:** 2.4.3, 2.4.7, 2.4.11, 2.4.13. Nielsen 3. Digest: wcag-2.2-aaa 2.4.3, spec §9.3's successor rule (`docs/01-specification.md:717`).
- A unit test where the hand-on's call can be reached (`focus-hand-on.test.ts` holds the rule); otherwise the walker's variants are the proof, said at close.

### VH-208 — V-52 (rank 2): the finished video's warnings before the player and Save, and spoken with the completion

- Move the existing `resultWarnings` (`main.ts:3287`) into the finished card's reading order before the player (`:3285`) and Save (`:3494–3497`), in one notification treatment (VH-150: never one notification nested in another; no second rail). DOM order and visual order agree. No new element; no new words.
- The completion line (`main.ts:3073–3078`, `warningsSpoken`, `announce.ts:40–46`) carries the heavy-limiting warning's existing listening sentence: its detail spoken, or the existing detail split into its sentences in the three string tables with the words unchanged.
- VH-193 stands: first among the warnings, word for word, unchanged after a save (the owner's 1A and 2A); Save stays available; VH-192's player leaves after a save as now.
- **Check.** S-135 to S-138, S-151, S-131 (the save), and F15b (S-152), where the player cannot play and the warning stands: its state recorded, and the guidance there decided by the owner's answer (the failed-playback question). Three languages, four modes, 320 and 1280 px; the accessibility tree's order and the live region's write.
- **WCAG:** 1.3.2, 2.4.3, 4.1.3, 1.3.1, 3.2.4 (the warning's words unchanged). Nielsen 5, 6, 1. Digest: nielsen "status visible and announced"; carbon "one primary per state"; wcag-2.2-aaa 4.1.3.

### VH-209 — V-50 (rank 3, contested 3 or 2; only if the owner takes it): the page held to the column at a 32 px font on a phone width

- Every offender in S-113's six records kept inside the column with the existing tokens: the page switcher's and Video language's "Bahasa Malaysia", Video type's student-submission choice, Set start here and Set end here, the closing colour "White", the Malay statement heading. CSS only (`src/styles/app.css`, `test/stylesheet.test.ts`), no element, no move of the switchers, no rewording. Step 4's selects stay wish VH-189.1.
- **Check.** S-113 ×6 at the 32 px font, plus the default font at 320, 401 and 1280 px to show nothing else moves; three languages, four modes; V-18's six first-screen cases on the painted button, none lower.
- **WCAG:** 1.4.4, 1.4.10, 1.4.8, 2.4.13 (rings of the wrapped controls). Digest: wcag-2.2-aaa "every exception recorded"; carbon "our own code".
- **Blocked** on the owner's answer; not taken becomes a wish line.

### VH-210 — V-48 and V-49 (rank 2): two focus rings drawn whole

- **V-48.** Locate the 4 px² the onset "?"'s ring loses in `S-113__ms-MY__w320__font32` (the viewport's sideways scroll, a clipping ancestor, or the label's glyphs), then give the ring room with the existing focus tokens (`--focus-width`, `--focus-offset`, `--focus-room`). After VH-209 when that is taken, since the record is one of V-50's six.
- **V-49.** `.footer-help-list`'s links (`app.css:209–214`): a wrapped link's ring clears the next link's text, by spacing the list's items with an existing token (`--focus-room` or a spacing token) or by the ring inside the link's box under forced colours. CSS only. A real Windows theme stays the checklist's task D.
- **Check.** V-48's record and its neighbours at the 32 px font; S-83 and S-145 ×8 in forced light and dark; the other footer links and every other ring unchanged in three languages and four modes; the 44 px target of each footer link kept (2.5.5).
- **WCAG:** 2.4.13, 2.4.7, 2.4.11, 2.5.5, 1.4.11. Digest: wcag-2.2-aaa 2.4.13, "focus appearance"; carbon "two token systems, never collapsed".

## The order, and why

1. **VH-206 first** — the one rank 1, the finding that misleads; strings and the data path, no CSS, so its words are not moved by what follows. If its words are not approved when the plan starts, VH-207 leads and VH-206 follows the approval.
2. **VH-207** — the one WCAG level A failure (2.4.3) and a regression; behaviour in `main.ts` and the walker's variants, walked by keys before any CSS moves.
3. **VH-208** — a reading-order change in the finished card and the completion line, in `main.ts`; after VH-207 so both `main.ts` changes are walked on one another.
4. **VH-209** (if taken) — CSS that can move layout and the first screen; before VH-210 because V-48's one record is in V-50's overflow.
5. **VH-210 last** — two rings, CSS only, measured on the final DOM and CSS.

Then VH-203's after-run and integrated check, then VH-195.

## Not a fix item

- **V-18:** accepted in Phase 7 (VH-175.4); the ask asks whether that stands; read at HEAD in VH-203's after-run (VH-201.2). Recommendation: it stands; no content above the button moved; VH-175.4's native wording is the route.
- **The failed-playback guidance (F15b):** Claude, not a finding; V-52's check records the state. If the owner rules it a finding, the guidance there is words he approves, in VH-208.
- **The statement's media limitation:** Claude, not a finding of this pass; it stays VH-192.1 for VH-137, no new ID.

## VH-203's stage rule, carried whole into each item

- before and after measured with the pass's walker, in three languages (en-GB, zh-Hans, ms-MY) and light, dark and forced colours (forced light and forced dark), with WCAG re-checked for what it touched (the item's named criteria);
- our own CSS on the two token files (`tokens.carbon.css`, `tokens.brand.css`), never collapsed; no control, checkbox or element added; the progress bar kept;
- UI-STANDARDS updated where a rule changes, within its 2,400 words or with the owner asked; a change to `docs/` drafted as a wish line for the owner;
- the gate (`npm run check`, then `node tools/check.mjs`) green with no test deleted or skipped, and the digest rule it applied named (rule 8);
- Codex astra's check before commit, of the final candidate diff with its base and evidence, from a brief; a failing point repaired and re-checked, with the follow-up verdict kept, or, if Claude disagrees, the item left open and the point put to the owner; the commit carries `Checked: gpt-6-astra — <verdict as given> — <scope>`;
- the fix linked to its finding and its verification in the report's Disposition table.

## The owner's ask, in outline

1. The plan and its order. 2. V-51's words (drafted at VH-202, three languages) and the 400 ms rule (stays). 3. V-50: take it (recommended, CSS only, shares V-48's record) or a wish line. 4. F15b: not a finding (recommended). 5. V-18: the acceptance stands (recommended). 6. The statement: VH-192.1 for VH-137 (recommended). 7. The spec §5.4 wish line for V-51. 8. No remedy adds a control, checkbox or element; keeping sub-400 ms sound unlevelled, or a control to keep it, is recommended against.
