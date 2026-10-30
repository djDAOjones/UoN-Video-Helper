<!-- markdownlint-disable -->

# VH-216 — Claude's verdict on the candidate, 30 October 2026

VH-216 #3 (Claude Code), written while Codex astra's blind check ran (started 11:30:47Z) and saved before its answer was opened. The candidate: the uncommitted tree against `3741193`, 12 files, 160 insertions and 101 deletions, diff hash `7cd34e86be434481`, and the untracked table `vh216-first-action-2026-10-30.md` with its 88 records and `sources.txt`. Read for it: the whole code, sheet, test and `docs/` diff; the table whole; the proofs; the records, recomputed below; the design compare; the rules and digests; the spec's named lines; one after page capture (S-03, en-GB, w1280, light).

**Verdict: Commit, after one repair and the close's own record.** One must, comment-only; three shoulds. The owner's remedy is built as he chose it.

## The must

1. **Two comments the move makes false, in files the diff did not reach.** `src/config/video-kind.ts:2`, "the switch at the top of the page"; `src/styles/tokens.carbon.css:103–104`, "the "?" drawn inline in the lede's text". The diff repaired this same class elsewhere (`main.ts:499`, `:707`; `toggletip.ts:3`; `video-kind.ts:2`; `en-GB.ts:103`; `app.css:1108`), and the approved scope names "the comments". They are false statements in the code, so they are owed. **Repair:** those two comments, their words only. Neither reaches a rendered byte, so no re-walk is owed; the table gains a line with the new diff hash, adding and rewriting nothing.

## The shoulds

1. **`test/readability.test.ts:116`, "Or the lede's format hint".** Read as the key's namespace (`lede.formatHelp`) it holds, and the test is untouched by the diff. Change "the lede's" to "the fourth promise's" with the must, one word's worth; if Codex or the orchestrator would rather leave an unchanged test file, it is harmless.
2. **A heading outline, not in the table's limits.** The switch and the promises stand outside every section, and on the empty page the last heading before them is H2 "1. Choose a video"; at the base they followed H1. Their `section` closes before them, so 1.3.1 holds, and a heading would be a new element and new words, so nothing here can change it. Add the limit to the table's §10 by one added line and one wish line at the close (rule 5), for the owner: "what a heading reader takes them to belong to, a person's check".
3. **The digest names.** `project/digests/wcag-2.2-aaa.md`'s "Rules that bite here" lists neither 1.3.2 nor 2.4.3; `project/digests/carbon.md` has "logical reading order". The item names them under the standard, as earlier closes name criteria: the close names them as the item does. No edit.

## The acceptance criteria

| Criterion | Reading | Evidence |
| --- | --- | --- |
| The owner's remedy | **Met.** Title, `.lede` (privacy line, browser note), step 1, the switch, steps 2–6, announcer, errors, promises, dev. No `order` in the CSS and a new test holds that. No script: `main.ts` differs by two comment lines, `toggletip.ts` and `video-kind.ts` by comments. Heading and privacy line stay above. | diff; probe `order`, one in all 60 of S-03 |
| The six cases | **Reported.** Recomputed from both summaries: 630–674 → 336–380; 780–824 → 507–551; 870–914 → 528–572; 930–974 → 496–540; 1025–1069 → 683–727 (**short by 159**); 1267–1311 → 784–828 (**short by 260**). Each scrolled 0; arithmetic and "moved up" right. | `six-*.summary.json` |
| The order kept meaningful | **Met.** DOM, reading and Tab one order, forward and reverse; "?" reached in the 60 Tab cells, `tipOk` true. No words changed: strings-proof agrees with my reading of the diff (only the `en-GB.ts:103` comment; markup words, 124 keys, 337 elements). Sheet: 14 rows, 14 lines, CRLF kept on all 521; `sheet.ts`'s descriptions true of the new order; no "Above Step 1" left. | `strings-proof-2.txt`, `compare-tab.txt` |
| Measured before and after | **Met.** Recomputed from the outcome lines: S-03, only W1 and W2 move, pass to fail, 58 each; S-144, nothing moves. 58 of 60 reached each side of each scenario, the same; the unreached are en-GB and ms-MY, w375, font32. Diff hash and revision in the after's `conditions.txt` are the candidate's. 120 a side, no VH-199 record used. | `*.outcomes.jsonl`, `after-s03.conditions.txt` |
| WCAG | **Met as the table §8 has it.** 1.3.1, 1.3.2, 2.4.3, 2.4.6 hold; 1.4.4 unchanged by this item, its failures being V-50's condition; 1.4.10 holds at the criterion's width. Speech a limit, recorded as one (§10). | table §8, §10; should 2 |
| Tokens | **Met.** `.promises` keeps the declarations of `.lede ul`, on spacing tokens; `.lede ul + p` was dead once the list left. No element, control, checkbox or literal. Progress bar untouched. One primary, the file button, still alone; the page capture reads as designed, with the spacing `.panel`, `.video-kind` and `.promises` gave. | `app.css` diff, capture |
| Documents | **Met.** The three substitutions are his two sentences, verbatim. UI-STANDARDS needs no change: no rule names the page's order, and `:239` ("Focus order must be logical") holds. | `docs-word-diff-2.txt` |
| The gate; Codex; Linked | **At the close.** | — |
| Sized | **Met in scope:** nothing beyond the markup move, its CSS, tests, sheet, comments and `docs/` sentences. | diff |

## What the brief asked me to confirm

- **`en-GB.ts:155`, "The message below says what to do".** Set in `#drop-error`, in the drop zone, naming the blocked start's text in `#source-status` (`main.ts:1316–1319`), under it in step 1. Both stay inside step 1. **True.**
- **`en-GB.ts:159`, "or choose one above".** Under the input, in the same drop zone. **True.** Their Malay reads "di bawah", "di atas", the same places. The grep of place words over `en-GB.ts` finds no other that the move touches; `:100`, "the system check at the foot of the page", holds, the footer unmoved.
- **`docs/` `:779`,** "says so above step 1": `#browser-note` stays in `.lede`, above step 1. **True.** **`:592`,** "a line under the switch": `#video-next`, in the fieldset. **True.** The spec has no sentence on the promises' place (`grep -i promise`: three unrelated lines), so no wish line is owed for them.
- **UI-STANDARDS:** no change.
- **The digest rules:** wcag-2.2-aaa, 1.3.2 and 2.4.3, applied (should 3). Nielsen 6, applied: the first action is visible rather than to be found, in four of six cases, the two others reported; the promises are not an option to recall, and stay visible by scrolling, in every state. Nielsen 8, applied: nothing added, and the first screen leads with the one task.
- **`ul.promises` after `#errors-panel`: right.** His order shows only his named parts, and the panel is hidden on the empty page. It keeps Errors captured directly after the work it reports, with the general account last. Before it, five general sentences would stand between step 6 and the errors. His order holds in every state without the panel; 1.3.2 and 2.4.3 hold either way. The test pins it.
- **#32's load ruling: right; no re-run.** Every reading is layout, DOM or focus order, with no job or duration; the outcome lines match on each side apart from W1, W2 and the Tab order; high load can delay a focus reading but could not reorder the DOM, and the Tab groups' 120 readings have errors 0, reverse and tip true. after-tab's 146.98 is the highest and those readings are also the most checked: every traversal agrees with the static markup. The gate is another matter (at the close).
- **Design compare's 7, the five states and the onset tip, not walked.** Agreed as a stated limit (table §10): one static order, no script moving these nodes, test pins it, `toggletip.ts` a comment. By reading: the switch and the promises are in no locked fieldset or withdrawn step. No line beyond the table's statement is owed; VH-203's after-run isn't relied on.
- **Design compare's 9, confirmations after a blocked, silent or finished video.** No promise becomes false: each describes the tool in general, and "Evens out the audio level" after a silent video is the worst reading, general not specific. It reads differently, no more. Stated in §10; a person's check; no word may change. It belongs with VH-203's or the owner's walk only if checked there, so the close claims nothing of it.

## At the close, not now

The backlog line, the item's Now and Notes; the decision with his words and the shortfall; wish VH-175.4 kept; the wish line for VH-203, each claim re-checked; the Disposition row; the Codex files; the gate and the checker.
