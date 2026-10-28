<!-- markdownlint-disable -->

# VH-212 — Codex astra's blind design check (brief)

You are Codex astra, the project's read-only reviewer. You are run from the repository at its HEAD, `b4ec37a162f1a650f44c3dd4adcadea9485071eb` (VH-214), which is also origin/main; its working tree is clean. Change nothing. No network.

**What you may read:** the repository you are run in, at HEAD; and, read only, the eight VH-199 record files named under "The matrix" below, in `/Users/joe/UoN-Video-Helper-evidence/pass3-vh199/runs/`. **Read nothing else outside the repository:** no other checkout, no other folder in `/Users/joe/UoN-Video-Helper-side/`, and never any folder under `/Users/joe/Library/Application Support/Claude/side-session-notes/`. Read large files by line range or search, never whole.

## The item

`project/items/VH-212.md` (40 lines) is the contract: read it in full first. Every acceptance criterion in it holds. Its line numbers for the three strings (`:722`, `:603`, `:643`) are stale: at HEAD the detail `warnings.heavyLimiting.detail` is `src/i18n/en-GB.ts:734`, `src/i18n/zh-Hans.ts:613` and `src/i18n/ms-MY.ts:653`. VH-211's plan is the PLAN-8 entry of 2026-10-27 in `project/decisions.md` (search "The owner's old issues planned"). The owner's scope (2026-10-27 14:51:20Z, `project/decisions.md`, search "yes to the question mark"), verbatim: "yes to the question mark, and A and B. ensure everything passes UX / design / Accessibility".

## The owner's words, verbatim with their source

His answer is not yet in the repository; this is its record, copied from the coordinator's notes:

- 2026-10-27 ~16:18Z, the owner in the "Backlog review" chat, typed by him, verbatim: "help me resolve VH-212, VH-213, and VH-216". Backlog review put each to him as a multiple-choice question with previews, and for VH-212 (F15b, VH-211's ask, point 2) he chose, as the tool returned it: ""before you use it" (Recommended)". The words, as recorded there:
  - en-GB: "so play the new video before you save it" becomes "so play the new video before you use it"; the rest of the heavy-limiting detail is unchanged;
  - zh-Hans (machine): "所以请在保存之前播放新视频" → "所以请在使用之前播放新视频";
  - ms-MY (machine): "sebelum anda menyimpannya" → "sebelum anda menggunakannya";
  - not taken: "before you publish or submit it".
- 2026-10-27 ~18:06Z, Backlog review's clarification in the same chat: he was never shown VH-211's ask's longer wording ("so play the new video here and listen. If it will not play here, save it and play the saved file before you share it."). His answer to point 2 is "so play the new video before you use it". The ask's recommendation (`reviews/2026-10-25/design-pass-3/vh211-owner-ask-2026-10-27.md`, point 2) is not what he chose; his choice stands.

Nothing beyond these three replacements is settled by him: any other wording, punctuation or spacing change, or a doubt about his words, is a question for the owner, not a design choice.

## Where to read (at HEAD)

- **The strings:** the three lines above, and `warnings.heavyLimiting` round `src/i18n/en-GB.ts:731`.
- **The sheet:** `src/i18n/sheet.ts` (`NOTES` from `:341`; VH-206's and VH-213's notes at `:449–456`; `sheetRows` at `:544`); the filled sheet `reviews/2026-10-18/VH-105-strings-filled.csv`, its heading `:1`, VH-206's and VH-213's rows `:344–347`, and the detail's row `:367` (its `notes` cell is empty; its last cell, "changed by the agent", reads "VH-193: Chinese and Malay drafted by the agent"); `scripts/strings-table.mjs` (`:1–14`), which writes `zh-Hans.ts` and `ms-MY.ts` from the filled sheet; `src/i18n/tables.test.ts:215–230`. VH-206's sheet change is the model: `git show 5893d9d -- src/i18n/sheet.ts reviews/2026-10-18/VH-105-strings-filled.csv`.
- **The tests:** `src/ui/warning-text.test.ts` (round `:230–241`), `src/ui/announce.test.ts` (round `:32–66`), and any other: search `src` and `test` for "before you save it", "menyimpannya", "保存之前" and `heavyLimiting`.
- **The spoken line:** `warningsSpoken` and its callers (search `src/`), and VH-208's decision of 2026-10-28 in `project/decisions.md`.
- **The walker:** `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/` (`$W` below). Search it for `heavyLimiting.detail`, "before you save it", "menyimpannya" and "保存之前": at HEAD, `phase8.mjs:791` (in `LIMIT_READ`, `:787–799`, used by `limitingRows` from `:826`), `scenarios.mjs:2641` (S-137), `prove-8.mjs:54` (`WARN_WORDS`), `:146` and `:161`, and `heavy-193.mjs:82`. How the walker gets a message's words: `scenarios.mjs:25–48` (`MX_INIT`, `M.msg`) and `phase8.mjs:101` (`WORDS`, `W`). The scenarios: S-131 `scenarios.mjs:2525`, S-132 `:2547`, S-135 `:2615`, S-136 `:2623`, S-137 `:2632`, S-138 `:2645`, S-151 `:2851`, S-152 `:2863`; their shared reads `:1705–1707`. `prove-fixtures-8.mjs:80` is a further match for the heading.
- **VH-208's table,** the model for the stage rule's measure: `reviews/2026-10-25/design-pass-3/evidence/measurements/vh208-warnings-2026-10-28.md`, §1 and §2 (`:12–48`), §4.3 (`:106–117`), §10 (`:219–227`); its records in `vh208-records-2026-10-28/`.
- **VH-199's matrix:** `reviews/2026-10-25/design-pass-3/evidence/measurements/matrix-2026-10-27.md` (`:1–31`): its source, instrument revision and power mode per run. Its records stay outside the repository.
- **The standards:** `UI-STANDARDS.md` (`:112–135`, `:156–163`, `:261–276`); `project/digests/nielsen.md` (`:15–48`), `wcag-2.2-aaa.md` (`:38–44`, `:53–67`); `project/rules.md`; `docs/01-specification.md:325`, read only (no `docs/` edit is approved).

## The matrix

The stage rule's cells: S-131, S-132, S-135, S-136, S-137, S-138, S-151 and S-152, at 1280 and 320 px, in en-GB, zh-Hans and ms-MY, in light, dark, forced light and forced dark (192 cells). The VH-199 records you may read, one per scenario, each `instruments.measure.items[]` holding a `p.notification-body "To reach the usual level…` item (read by a short script, not whole):

- `run-04-2026-10-26T17-47-08-808Z-d32f0f/S-135__en-GB__w1280__light.json`, `…/S-135__zh-Hans__w1280__light.json`, `…/S-135__ms-MY__w1280__light.json`, `…/S-135__en-GB__w320__light.json`, `…/S-135__zh-Hans__w320__light.json`, `…/S-135__ms-MY__w320__light.json`;
- `run-04-2026-10-26T17-47-08-808Z-d32f0f/S-131__*` and `run-09-part-2026-10-27T05-04-47-007Z-e6d366/S-152__*` (list the folder by name to find them).

## What to answer

1. **The change, exactly.** Each of the three replacements found once at HEAD, and the full new detail in each language. Every file and line the change touches: `en-GB.ts`; the filled sheet's row `:367`, cell by cell (English, `notes`, Chinese, Malay, "changed by the agent"); a translator note in `sheet.ts`'s `NOTES`, as VH-206's are written, mirrored in the row's `notes` cell; `zh-Hans.ts` and `ms-MY.ts` regenerated, never hand-edited. Propose the note's text and the "changed by the agent" cell's text, following VH-206's and VH-213's rows. Say whether anything else changes.
2. **The tests.** Which assertions pin the clause today, what each becomes, and how "the warning and table tests pin the new clause in each language" is met; none deleted or skipped.
3. **The spoken line.** Confirm from the code that VH-208's completion write carries the new detail whole, unchanged, with no second announcement, Announce progress on or off, and that nothing else speaks it.
4. **The walker.** Class each search match as (a) a predicate of S-131, S-132, S-135 to S-138, S-151 or S-152 that reads this detail, (b) a proof fixture of such a predicate, or (c) neither. For each, say whether it needs a diff to read the new words, and why; how each change, or each no-change, is proved before the after-read; and whether anything you would change lies outside the predicates the criteria name.
5. **The matrix.** Which before cells, if any, can come from VH-199's records under the item's condition (the same commit, instrument revision and power mode), and which must be walked on `b4ec37a`. What each cell should read: the warning's words; its height and line count beside VH-199's; the completion line's write (S-151's with Announce progress off); S-152's state. Do VH-199's records hold the warning's height at all? If not, how should the table state height beside VH-199's?
6. **The owner's words in their sentences.** Read each new detail whole. Is each "true whether or not the video plays here"? Does each translation read rightly in its sentence, with its punctuation and spacing unchanged? Name any doubt: it goes to the owner, not into the design.
7. **WCAG re-check:** what 1.4.8, 1.4.10, 2.4.6, 3.1.5 and 4.1.3 each need read, before and after.
8. **Risks,** and anything the item cannot meet as written, with the evidence.

Cite file and line for every claim. Keep the answer under 1,200 words. Write it as your final message; it is saved verbatim.
