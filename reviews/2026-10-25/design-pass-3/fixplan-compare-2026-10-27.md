<!-- markdownlint-disable -->
<!-- VH-202's compare of Claude's fix plan with Codex astra's blind fix items (2026-10-27), written as vh202-plan-compare.md in the orchestrator's notes, verbatim. -->

# VH-202 — the fix plan: Claude's against Codex astra's blind fix items

VH-202 #1, 2026-10-27. **Claude's** plan (`claude-fixplan-2026-10-27.md`, from `vh202-claude-plan.md`) was saved before Codex's brief was written and is kept as it stood. **Codex** drafted its fix items blind, from the report, the source, the item schema and VH-203's stage rule, with none of Claude's grouping, order or remedies: brief `codex-astra-fixitems-brief-2026-10-27.md`, answer `codex-astra-fixitems-2026-10-27.md`, verbatim (session `01a17d92-6772-7d63-8b55-e1759ca721a1`, exit 0; its log shows every file search excluding `*vh202*`). Each difference of fact is settled on the evidence; each of judgement goes to the owner's ask with both positions.

## Agreed

- **The findings and their items.** V-51, V-46 and V-52 each an item of its own; V-48 and V-49 together, CSS only; V-18 no fix item; V-50 a proposal, built only if the owner takes it. Neither needs a control, checkbox or element.
- **The order.** V-51 first, as the one rank 1; V-46 next, the keyboard regression; V-52 third, the result card's structure; the CSS last. If V-51's words wait, V-46 leads.
- **V-51's mechanics.** The reason carried from the silent keep through the worker to `warningText`, through the single `no-audio` path; the 400 ms threshold, frame placement and `ends-early`'s precedence kept; the output's tracks read, not inferred. Audio really absent keeps today's words. A trimmed keep with no decoded sound at all goes with the kept-part case, unless declared sound never arrives, which stays `ends-early` (`src/audio/warnings.ts:90–92`). Spec §5.4's row (`docs/01-specification.md:324`) names only an absent stream: a wish line for the owner.
- **V-46's remedy.** Both read-failure paths, the existing `focusHeldBy` / `stepsWithdrawnBy` pattern, focus to the chooser, the guards kept (focus elsewhere, the dialog, a result's surviving controls); the J4 case walked.
- **V-52's remedy.** The existing warnings before the player and Save in one notification shell; order, wording, Save and the unchanged-after-save decision kept; the completion carries the listening sentence with Announce progress off too. Both lean to speaking heavy-limiting's existing detail whole, which needs no new translation. F15b's state recorded without calling its guidance resolved.
- **V-48** is located before any rule is chosen; **V-49** spaced with existing tokens; a real Windows theme stays a person's check.
- **VH-203's stage rule** carried in every item, with the commit's `Checked:` line naming the finding.
- **The owner's questions:** V-51's words; the threshold kept (both recommend); V-18's acceptance pending HEAD's measurement and a native reader, nothing moved; no remedy that adds a control.

## Codex only — each settled

1. **A typed reason, not a numeric `detail`.** `AudioWarning.detail` holds "Measured values, so the wording can be specific" (`src/audio/warnings.ts:33–34`, `Record<string, number>`); a reason is not a measurement. **Taken:** VH-206 carries a typed reason (or a second code), never a number in `detail`.
2. **Capture before `clearTrim` changes anything.** `clearTrim` runs `applyControlLock()` (`src/main.ts:1765`) before `revealLaterSteps` (`:1767`), so a capture inside the unreadable branch after the lock may find focus already moved. **Taken:** VH-207 captures before `clearTrim`'s first change; the next Tab is read as well as the focused element; 2.1.1 re-checked.
3. **VH-208 meets a test and the walker that pin the old order.** `test/screen-text.test.ts:310–314` asserts `processResult.replaceChildren(heading, resultWarnings)` and forbids `heading.append(resultWarnings)` (VH-150's regression); the walker finds the warnings as the card's next siblings (`walker/phase8.mjs:59`, `warnBox`). **Taken:** VH-208 rewrites that test to the new order, still forbidding a nested notification, never deleting it; and qualifies `warnBox` against both layouts before its after-run. VH-208 is the largest item.
4. **More scenarios.** VH-206: S-20 (no audio track), S-101 (0.6 s kept, the levelled control), S-153 (390 ms asked, 410 ms placed) and an exact-block case. VH-208: S-53 (no warning), download, Keep it, a replacement file. VH-210: S-112's narrow cases, 1280/640/401/400/375/320 px at both fonts. **Taken**, each confirmed in `scenarios-2026-10-25.md` (`:69`, `:141`, `:152`, `:193`).
5. **More checks and rules.** 1.4.12 for every item that changes text or wrapping; house conventions' "Fail loudly on data loss" (`project/digests/house-conventions.md:57`) for V-51. **Taken.**
6. **A trailing "Open question" for VH-208 on F15b.** **Refused:** VH-208's approved scope does not depend on F15b, and every fix item starts after VH-202's close, by which time the answer is in; if the owner rules F15b a finding, the close adds its words to VH-208.

## Claude only — kept

- **V-50 its own item (VH-209)**, before the rings, with V-18's six first-screen cases guarded; V-48 re-read after it. (Codex folds V-50 into the rings item: see Disagreed, 1.)
- A translator note in `src/i18n/sheet.ts` and `src/i18n/tables.test.ts` for V-51's words; a unit test for V-46's capture where reachable; the exception path by its own variant; focus on a standing Save kept; S-131 (the save) for V-52; spec §9.1 and §9.3 read for the card's order; each footer link's 44 px target kept.
- 2.4.12 for the focus items; 3.3.1 and 3.3.3 for V-51.

## Disagreed

1. **V-50's place, if the owner takes it.** *Claude:* its own item, VH-209, before the rings: it is contested, so a refusal retires one line; its six records and six offenders are a session's measuring on their own; and V-48's record is re-read after it. *Codex:* inside the rings item, so one stylesheet pass and one check read every CSS change. **Settled for Claude's on size and disposition**, a planning call; the ask names Codex's grouping under V-50.
2. **V-51's words.** *Claude:* "The part you kept has too little audio to level" / "The new video will have no audio. If you want the audio, move the start or end time to keep more of the video where there is audio." *Codex:* "This part has too little sound" / "There is too little sound in the part you kept to level it. The new video will have no sound. To keep sound, choose a part with more of the recording's sound." **Settled on evidence where it can be:** the page's noun is "audio" (43 uses in `en-GB.ts` against 12 of "sound", most of them other senses), its sibling heading says "audio", and UI-STANDARDS forbids "synonyms for existing concepts" (`UI-STANDARDS.md:153`); the trim's own field names are "Start time" and "End time" (`en-GB.ts:221–222`), and the Malay page says "simpan" for keep (`ms-MY.ts:180`, `:196`), not "kekalkan". The rest is wording, and the words are the owner's: Claude's go to him as proposed, Codex's beside them.
3. **The failed-playback guidance (F15b).** *Claude:* not a finding. *Codex:* rank 2, with a recovery in the warning's existing text. Judgement: in the ask.
4. **V-50's rank.** *Claude:* 3. *Codex:* 2. Judgement: in the ask.
5. **The statement's media limitation.** *Claude:* not a finding of this pass. *Codex:* rank 2 debt under VH-192.1. Judgement: in the ask.

None of these asks for a control, checkbox or element.
