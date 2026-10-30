<!-- markdownlint-disable -->

# VH-216 — Codex astra's blind check, the brief, 30 October 2026

You are Codex astra, checking VH-216 read-only and blind. Claude Code built it. Its own verdict, its readings and any compare are deliberately kept from you: don't look for them. Judge from the evidence below alone. Never write or change any file.

## What you may read
- **This repository** (your working directory), tracked and untracked, and `git` read-only.
- **Outside it, only:** `/Users/joe/UoN-Video-Helper-side/vh216-walk/` (the walks' drivers, scripts, before and after records, compares and proofs; read raw records by `grep`, `head` and line ranges; skip `chrome-profile/`), and `/Users/joe/UoN-Video-Helper-side/plan8-owner-words.md`, only by `sed -n '275,276p;283,286p;288,289p;292,296p;345p;366,367p;372,373p'`, the source of the owner's words.
- **Nothing else in `/Users/joe/UoN-Video-Helper-side/`.** Forbidden there: every `vh216-claude-*`, `vh216-design-compare.md`, every `vh216-codex-design*`, `vh216-progress.md`, every `vh216-*brief*` other than this text, every `vh216-handover-*`, `vh216-wip-*`, and every other item's files. **Never read any folder under `/Users/joe/Library/Application Support/Claude/side-session-notes/`.**

## What VH-216 is
`project/items/VH-216.md` is the contract: read it in full; every acceptance criterion holds, read with the owner's words below. It answers pass 3's V-18 (`reviews/2026-10-25/design-pass-3/design-pass-3-2026-10-27.md`, `grep -n 'V-18'`): the file button stood below the first screen in Malay at 1280 × 900 and in all three languages at 320 × 568.

**Its `Now`, its `Open question` and the backlog's "blocked: the owner" are out of date.** The ledger records his answers at the close, with the gate, the Disposition row, the wish lines and a separate Codex close check. Judge those as "at the close", not as unmet.

## The owner's words, with their sources (`plan8-owner-words.md`, the lines above)
- His scope, 2026-10-27 14:51:20Z (`:275`): "yes to the question mark, and A and B. ensure everything passes UX / design / Accessibility".
- **The remedy,** ~16:18Z (`:283`, `:286`): typed "help me resolve VH-212, VH-213, and VH-216"; on VH-216 he chose, as the tool returned it, "Promises + switch (Recommended)": the five promises and the Staff/Student switch move below step 1, in one order at every width; no CSS order, no script, no words changed, nothing added. Order shown: header, title, privacy line, "1. Choose a video", the switch, then the promises, with steps 2–6 between them once a video is read. Not taken: "Also the translation notice", "Promises only".
- **The budget,** ~16:43Z (`:288`): "Yes: raise docs/01-specification.md's budget from 8,100 to 8,200 words, for the approved rows in VH-206, VH-213 and VH-216. Record it as a decision."
- **The `docs/` edit,** ~18:06Z (`:292`, `:294`–`:296`), his choice ""below step 1" (Recommended)": §2, "A switch above the steps, "Staff video" or "Student submission", says which;" becomes "A switch below step 1, "Staff video" or "Student submission", says which;"; §9.1, "Above them, a switch chooses "Staff video" or "Student submission" (VH-131)." becomes "Below step 1, a switch chooses "Staff video" or "Student submission" (VH-131, VH-216)." The item's "a change to `docs/` drafted as a wish line, never made" yields for these two sentences alone.
- ~23:07Z on 2026-10-28 (`:345`): "please spawn chats as needed as I'm going to bed - you have permission to proceed as reccomended". It widens no stop.
- **The walker,** 2026-10-30 ~10:08Z (`:366`), answering "Should the four walker checks that pin the old page order wait for VH-203?": "Yes, leave them". He was shown that the move fails S-03's Tab row, one `.lede` selector, S-142 and J1, that the default leaves them, reports the failing rows as expected and records a wish line for VH-203, and that it keeps one walker revision across the comparison. The edit itself stays his to approve at VH-203.
- **The load,** ~11:05Z (`:372`), answering "Shall I stop the two stray node loops?": "Leave them". It answers about two processes, not this item's.

## What was ruled (settled, unless a point below asks you to judge it)
- The six cases are a report, not a stop: "The six cases stay a report: the shortfall in px goes in the table, the decision and your "finished" report". No word shortened, no spacing tightened, the translation notice not moved, no remedy chosen for the shortfall.
- "The 4 w375 font32 cells: the table states them as not reached, before and after, window at 394 and 448 px, and claims no link to VH-209 unless you have checked it."
- Known and not this item's: V-50, the page scrolling sideways at a 32 px font in a phone-width window, is VH-209's. A font32 cell failing the same way before and after is reported, not fixed; one failing only after is a finding.

## Two points to judge
1. **The promises' place.** `ul.promises` stands after `#errors-panel` in `index.html`, so "Errors captured", when it shows, stands between step 6 and the promises. His words name no errors panel. Is that place right, against his order, 1.3.2, 2.4.3 and the job's states? Give your own reading.
2. **The load.** The ruling, verbatim: "No re-run. Your judgement stands: these readings are layout, DOM and focus order with no job or duration, and each side matches apart from W1, W2 and the Tab order. The table names each group's peak load, the samples above 8 and this ruling, and the blind check's brief names it as a point to judge." The peaks: before-s03 14.17 (4 of 12 samples at 8 or above); before-s144 and before-tab none; six-before and six-after none; after-s03 20.58 (5 of 12); after-s144 10.66 (5 of 9); after-tab 146.98 (9 of 10); all on AC, power mode 2, the load another process's. Is any reading in the table timing-dependent enough to need a re-run? Name it, or say none.

## The candidate
- **The tracked diff:** the uncommitted working tree against its base `3741193` (HEAD and origin/main), `git diff 3741193`, 12 files: `index.html`, `src/styles/app.css`, `src/main.ts`, `src/ui/toggletip.ts`, `src/ui/video-kind.ts`, `src/i18n/en-GB.ts`, `src/i18n/sheet.ts`, `src/i18n/tables.test.ts`, `test/screen-text.test.ts`, `test/stylesheet.test.ts`, `reviews/2026-10-18/VH-105-strings-filled.csv` (CRLF), `docs/01-specification.md`. The diff hash, `git diff --binary | shasum -a 1 | cut -c1-16`, is `7cd34e86be434481`.
- **The untracked evidence:** the table `reviews/2026-10-25/design-pass-3/evidence/measurements/vh216-first-action-2026-10-30.md` and its records in `vh216-records-2026-10-30/` beside it (88 files and `sources.txt`, which gives each copy's sha1 and source in `vh216-walk/`).
- **The proofs in `vh216-walk/`:** `strings-proof-2.txt`, `docs-word-diff-2.txt`, `compare-s03.txt`, `compare-s144.txt`, `compare-tab.txt`.
- **The walker,** `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/`, revision `17727d3522f7270d`, unchanged.
- **Run so far:** `npm run typecheck` exit 0; eslint on the changed files exit 0; `npm run test` 83 files, 1,626 passed, 1 skipped (base 1,623 and 1). **Not run yet:** `npm run check`, the gate, at the close. Don't run anything that writes.

## What to check
1. **Each acceptance criterion:** met, not met, not shown, or at the close, with the evidence (file and line, or record).
2. **The remedy.** The order in `index.html` against his, in one order at every width; no CSS `order`; no script that moves nodes; nothing beyond the markup move, the CSS it needs, the tests, the sheet's descriptions, the comments and the `docs/` sentences. Every changed line in `src/main.ts`, `toggletip.ts` and `video-kind.ts`: is it a comment, or does it change behaviour?
3. **The words.** No user-facing string changed in any language (`strings-proof-2.txt`; check it, don't trust it). Any string, in any language, that names a place ("above", "below", "under", "here", "next") and that the new order makes false is a must. The promises' own sentences read after a video has been refused, is silent or is finished: state whether any is now false, or only reads differently.
4. **The sheet.** The 14 filled rows' "where" or note cells and `src/i18n/sheet.ts`: is each description true of the new order; is any row that should have moved missing; no translated word changed; `tables.test.ts`.
5. **The documents.** The three substitutions in `docs/01-specification.md` are exactly the two approved sentences, nothing else (`docs-word-diff-2.txt`; check it). Any other sentence in `docs/` the new order makes false would be a wish line and a stop: read §2, §9.1 and whatever else names the page's order, and name any. Whether a rule in `UI-STANDARDS.md` changes.
6. **The CSS.** `.lede ul` to `.promises`, `.lede ul + p` removed: is anything left unstyled, any spacing wrong at any state, anything unused left behind; tokens only, no literal, two token systems uncollapsed; no element, control or checkbox added; the progress bar kept. Does the promises' block read correctly where it now stands, in `main` outside any section or fieldset, at every state: the empty page, a read video, a running job (the job lock), a finished video?
7. **The tests.** Each states the new order and can fail; none deleted, skipped or weakened; any TypeScript or lint risk; any test that doesn't pin what it claims.
8. **The measurement.** The six cases against the records (`six-before.summary.json`, `six-after.summary.json`). The 120 cells a side, 116 reached, the same 116; the two rows W1 and W2 the only moved rows (`compare-*.txt`; check against `*.outcomes.jsonl`); the "already failing" table; the before on the clean base; the after's diff hash equal to the candidate's; provenance; the instrument revision. The Tab traversal (`vh216-tab.mjs`, `compare-tab.txt`) and the table's §6 orders against DOM. Whether the promises and the format "?" are still reached, its tip opening and closing as VH-184 left it.
9. **WCAG** for what it touched: 1.3.1, 1.3.2, 1.4.4, 1.4.10, 2.4.3, 2.4.6, the table's §8. A person's check is a limit, never recorded as passed.
10. **The limits.** The table's §10 and §5: is each stated limit right, and does any need a walk, or a wish line, rather than a statement? Read the markup and `src/main.ts` for the states the cells don't walk: the order with a video read, with a job running, a refused file, a finished video, and the onset tip beside the format tip.
11. **Later items.** Anything the table or diff says or assumes a later item will measure: check by loading the plan (`cd` to the walker; `node --input-type=module -e "const {PLANS,ROUTES}=await import(process.cwd()+'/scenarios.mjs'); …"`, read-only; a record is `{id,lang,view,mode}`). Which walker rows, routes and stand-alone instruments pin the old order beyond W1 and W2: the owner was told S-142 and J1; name any other, as read, not walked.
12. **Scope and record.** Anything built beyond the criteria, or missing; any follow-up the evidence shows, which must become a wish-list or backlog line.
13. **The digest rules the close names** (AGENTS.md rule 8): wcag-2.2-aaa, 1.3.2 and 2.4.3; nielsen, 6 and 8 (`project/digests/`). Say whether each is applied.

## Answer
Under 1,000 words. List each must (a defect or an unmet criterion that blocks a commit) and each should, separately. Answer the two points to judge by number. End with one line: `Verdict: <Commit | Commit after the musts below | Do not commit>`.
