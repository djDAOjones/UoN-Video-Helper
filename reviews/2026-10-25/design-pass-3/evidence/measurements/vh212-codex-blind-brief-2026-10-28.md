<!-- markdownlint-disable -->

# VH-212 — Codex astra's blind check, the brief, 28 October 2026

You are Codex astra, checking VH-212 read-only and blind. Claude Code built it. Its own verdict, its readings and any compare are deliberately kept from you: don't look for them. Judge from the evidence below alone. Never write or change any file.

## What you may read
- **This repository** (your working directory), tracked and untracked, and `git` read-only.
- **Outside it, only:** `/Users/joe/UoN-Video-Helper-side/vh212-walk/` (the walk's driver, scripts, fixtures' log, the before and after records, the proof, the compares and tallies; the raw records are about 23 MB a side, so read them by `grep`, `head` and line ranges; skip `chrome-profile/`), and `/Users/joe/UoN-Video-Helper-side/plan8-owner-words.md` lines 283–284 and 292–298 only (`sed -n '283,284p;292,298p'`), the source of the owner's words.
- **Nothing else** in `/Users/joe/UoN-Video-Helper-side/`: no other `vh212-*` file (no brief, hand-over, progress note, design reading, verdict or compare), and no other item's files. **Never read any folder under `/Users/joe/Library/Application Support/Claude/side-session-notes/`.**

## What VH-212 is
`project/items/VH-212.md` is the contract: read it in full; every acceptance criterion holds, read with the owner's answer below. It fixes F15b's advice (pass 3's report, `reviews/2026-10-25/design-pass-3/design-pass-3-2026-10-27.md`, its Disposition row "The failed-playback guidance"). Heavy limiting's detail, `warnings.heavyLimiting.detail`, said "…so play the new video before you save it", which a person whose player cannot play the new video (S-152) cannot do. Only that clause changes, to words true whether or not the video plays here: no listener, no new state, no element. The item's line numbers (`:722`, `:603`, `:643`) are stale; the detail is at `src/i18n/en-GB.ts:734`, `zh-Hans.ts:613`, `ms-MY.ts:653`.

## The owner's answer, with its source (`plan8-owner-words.md`, lines 283–284 and 292–298)
- 2026-10-27 ~16:18Z, in the "Backlog review" chat, typed by him, verbatim: "help me resolve VH-212, VH-213, and VH-216". Backlog review put each to him as a multiple-choice question with previews; for VH-212 (F15b, VH-211's ask point 2) he chose, as the tool returned it: ""before you use it" (Recommended)". The words: en-GB "so play the new video before you save it" becomes "so play the new video before you use it", the rest of the detail unchanged; zh-Hans (machine) "所以请在保存之前播放新视频" → "所以请在使用之前播放新视频"; ms-MY (machine) "sebelum anda menyimpannya" → "sebelum anda menggunakannya"; not taken: "before you publish or submit it".
- 2026-10-27 ~18:06Z, the clarification in the same chat: he was never shown VH-211's ask's longer wording (`reviews/2026-10-25/design-pass-3/vh211-owner-ask-2026-10-27.md`, point 2); his answer is "so play the new video before you use it". His choice stands over the ask's recommendation.
- **His answer is not yet in the repository** (the item's `Open question:`, its Now and the backlog's `[!]` still wait for it). The ledger records it at the close, with the gate, the Disposition row and a separate Codex close check. Judge those as "at the close", not as unmet.

## What was ruled (settled; don't reopen either; the orchestrator, at the design's check)
> 1. **`prove-8.mjs:54`'s `WARN_WORDS`: leave it unchanged.** It is the walker's own self-test page: it renders its words and checks those same words, so its proof holds either way. VH-212's criteria name only the predicates of S-131, S-132, S-135 to S-138, S-151 and S-152 that read the detail, and this literal is none of them. Changing it would be a walker change beyond the criteria, which needs the owner; leaving it is the default his standing rule sets. Codex's preference is settled by that rule, not left open. Record it as one wish line for VH-203 (rule 5), and record the ruling and its reason in your compare.
> 2. **The stale comments at `announce.ts:40–43` and in the warnings file: change them to match his words.** They describe the clause this item replaces, and changing them alters no behaviour, element or string, so they are inside the item.

And on the before walk's load: "Your load judgement stands under the Load rule: a re-run is owed only where readings could depend on timing, and static reads that came out identical in all 24 cells of each scenario don't. Record it in the table's notes as you have it."

## The settled design, in one paragraph
The three replacements only, punctuation and spacing unchanged; `en-GB.ts` by hand; the filled sheet `reviews/2026-10-18/VH-105-strings-filled.csv`'s row for the key (English, Chinese, Malay, its `notes` and "changed by the agent" cells); a translator note in `src/i18n/sheet.ts`'s `NOTES`; `zh-Hans.ts` and `ms-MY.ts` regenerated from the sheet (`node scripts/strings-table.mjs`), one line each; the ruling's two comments; the tests pinning the new clause in each language and rejecting the old (1,600 → 1,607 passed, 1 skipped). **No walker diff:** the predicates read the served `/src/i18n/<tag>.ts` tables, so they move with the words, and the instrument revision (`runner.mjs:234–237` hashes every walker `.mjs` and `.sh`) is `198cfe660331f1bf` before, in the proof and after.

## The candidate
- **The tracked diff:** the uncommitted working tree against its base `b4ec37a` (HEAD and origin/main), `git diff b4ec37a`, ten files: `src/i18n/en-GB.ts`, `zh-Hans.ts`, `ms-MY.ts`, `sheet.ts`, `tables.test.ts`; `src/ui/announce.ts`, `announce.test.ts`, `warning-text.test.ts`; `src/audio/warnings.ts`; `reviews/2026-10-18/VH-105-strings-filled.csv` (CRLF).
- **The untracked evidence:** the table `reviews/2026-10-25/design-pass-3/evidence/measurements/vh212-playback-advice-2026-10-28.md`, and its records in `vh212-records-2026-10-28/` beside it (49 copies and `sources.txt`, which gives each copy's sha1 and source in `vh212-walk/`), the proof's among them.
- **Run so far:** `npm run typecheck` exit 0; eslint `--max-warnings 0` on the ten files exit 0; `npm run test` 83 files, 1,607 passed, 1 skipped (the pre-existing EBU skip). **Not run yet:** `npm run check`, the gate, at the close. Don't run anything that writes.

## What to check
1. **Each acceptance criterion:** met, not met, not shown, or at the close, with the evidence (file and line, or record).
2. **The words.** Exactly the owner's three replacements, verbatim, each once, the old nowhere; nothing else in any table, message or heading changed; punctuation and spacing round the clause; whether each reads correctly in its sentence and is true whether or not the new video plays here.
3. **The sheet and tables.** The filled row, its note and "changed by the agent" cell (the Chinese and Malay marked machine-translated, as earlier rows mark theirs); `NOTES`; the tables equal to the regenerated sheet (`tables.test.ts`, the "regenerated" test).
4. **The comments** against ruling 2: those words only.
5. **The tests.** Each pins the new clause and rejects the old in each language; none deleted, skipped or weakened; any TypeScript or lint risk; a test that doesn't pin what it claims.
6. **Spoken as VH-208 left it.** The completion line (`warningsSpoken`, `src/ui/announce.ts`) carries the new detail unchanged, with no second announcement; the table's §4.2.
7. **The walker.** No diff under `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/`; that the predicates of S-131, S-132, S-135 to S-138, S-151 and S-152 read the served tables; the proof and probe (§7) before the after.
8. **The measurement.** The 192 cells before and after (S-131, S-132, S-135 to S-138, S-151, S-152 × 1280 and 320 px × three languages × four colour modes), the before on the clean base; power and load against the table's §2; the readings (§3, §4: the words, height and line count beside VH-199's, the live write, S-152's state); §5, the S-138 `player` row that moved in 12 cells: is reading it as the walker's known timing (VH-208's table §7, wish VH-199.1 in `project/wish-list.md`) supported, or does it need a line or a re-run?; the WCAG re-check §6 (1.4.8, 1.4.10, 2.4.6, 3.1.5, 4.1.3), with what only a person can check recorded as a limitation, never as passed (`docs/01-specification.md` §9.3); whether every number the table cites matches its records.
9. **Tokens.** No CSS, `src/config/` or element change; no literal outside `src/config/` or a token; no control or checkbox; the progress bar kept.
10. **Scope and record.** Anything built beyond the criteria, or missing; whether a rule in `UI-STANDARDS.md` changes; whether `docs/` needs a correction (the spec's heavy-limiting row, `docs/01-specification.md:325`), which would be a wish line for the owner, never an edit; any follow-up the evidence shows, which must become a wish-list or backlog line.
11. **The digest rules the close names** (AGENTS.md rule 8): nielsen 9, "errors say what next" (`project/digests/nielsen.md`); wcag-2.2-aaa, 3.1.5 and 4.1.3. Say whether each is applied.

## Answer
Under 900 words. List each must (a defect or an unmet criterion that blocks a commit) and each should, separately. End with one line: `Verdict: <Commit | Commit after the musts below | Do not commit>`.
