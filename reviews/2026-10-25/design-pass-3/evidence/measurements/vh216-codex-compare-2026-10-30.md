<!-- markdownlint-disable -->

# VH-216 — Claude's verdict and Codex astra's blind check, compared, 30 October 2026

**When each was saved.** Codex's brief `vh216-codex-blind-brief.md` saved 11:30Z (sha1 `100742b4a36f`); Codex started 11:30:47Z (PID 5977). Claude's verdict `vh216-claude-verdict.md` saved 11:34:47Z (sha1 `e70b3621bcc1`), before Codex's answer was opened. Codex ended by 11:38:27Z; its answer `vh216-codex-blind.md` (6,494 bytes) was opened after that. Its log shows no read of a forbidden file.

**The verdicts.** Claude: "Commit, after one repair and the close's own record", one comment-only must and three shoulds. Codex: "Commit after the musts below", three musts, of which it marks the first "at the close", and three shoulds. It found "no product-code defect".

## Agreed

- **The owner's remedy:** one static order at every width, no CSS `order`, no script moving nodes; `main.ts`, `toggletip.ts` and `video-kind.ts` differ by comments alone.
- **The six cases:** both summaries reproduce the table; four inside, Chinese 159 px and Malay 260 px short at 320 × 568, a report, not a stop.
- **The measurement:** 120 cells a side, the same 116 reached, only W1 and W2 move, S-144 nothing; the provenance, the diff hash and revision `17727d3522f7270d`; the already-failing table; 60 Tab traversals a side, forward, reverse and tip.
- **The words and the sheet:** no string changed; 13 location cells and one note; CRLF kept; no positional string made false. Codex checked with comments stripped and the CSV parsed.
- **The promises after a refusal, a silent video or a finished one:** none is literally false; the place changes how one may be read, not what it says.
- **WCAG:** 1.3.1, 1.3.2, 2.4.3, 2.4.6 hold; 1.4.10 at default font and 320 px; 1.4.4 unchanged, not passed globally, its failures and the 4 unreached cells stated.
- **Tokens and elements:** existing declarations on existing tokens; no element, control or checkbox; the progress bar kept.
- **Documents:** exactly his substitutions; no other page-order sentence false in `docs/`; UI-STANDARDS no rule changes.
- **Point to judge 1, `ul.promises` after `#errors-panel`:** both accept it. Errors stay beside the work they report; his named parts keep their order; 1.3.2 and 2.4.3 don't require the list directly after step 6.
- **Point to judge 2, #32's load ruling:** both, no re-run; settled layout, DOM, focus and disclosure, no timing; it says nothing for a timing-sensitive gate, which waits for a settled machine.
- **The limits of §10:** populated states and the onset tip's exclusion are source-reviewed, not walked; speech and comprehension a person's. No further walk for this static move.
- **The digest rules:** wcag-2.2-aaa 1.3.2 and 2.4.3; nielsen 6 and 8, applied.
- **At the close:** the gate and checker, the ledger, the Disposition row, digest citations and the separate close check.

## Codex only

1. **The wish line for VH-203 must name more:** J4's and J2's Tab routes (`scenarios.mjs:1284`, retained by `:3170`; `:1186`), S-143's forward route (`:2741`), `tip-196.mjs:38,74`, `top-187.mjs:42–50`, `inventory.mjs:234`. **Taken at the close**, each re-read there and named as read, not walked; S-143 and `inventory.mjs` are new to the brief's list.
2. **Wish lines keep the 159 and 260 px shortfall and the 4 unreached cells,** the latter without attribution to VH-209. **Taken at the close:** wish VH-175.4 kept with the shortfall; one line for the 4 cells.
3. **Should: `src/ui/system-check.ts:56`, "The sentence under the promises".** Claude missed it, and it is the same class as Claude's must. **Repaired.**
4. **Should: the VH-216 sheet test sits in the heavy-limiting `describe`** (`tables.test.ts:423`). **Repaired:** its own `describe`.
5. **Should: the CSS test's title claims more than it proves.** **Repaired:** the title now says what it holds.
6. Codex records actual token spend as "not shown"; it judges scope only.

## Claude only

1. **Must: two comments the move makes false:** `src/config/video-kind.ts:2`, `src/styles/tokens.carbon.css:103–104`. Codex didn't name these. **Repaired,** with the one Codex found.
2. **Should: `test/readability.test.ts:116`, "the lede's format hint".** **Repaired,** those words only.
3. **Should: the heading outline.** On the empty page the last heading before the switch and the promises is H2 "1. Choose a video". 1.3.1 holds; a heading would be a new element and words. **One added line in the table's §10; one wish line at the close, for the owner.**
4. **Should: the digests' lists don't name 1.3.2 or 2.4.3;** the close names them as the item does. No edit.

## Disagreed

**Nothing the evidence can't settle.** One difference of grade: Claude calls a comment the move made false a must, Codex a should. Both repair it, so nothing turns on the grade.

## The repair and its re-check

**The repair,** 11:39Z: the diff hash moves from `7cd34e86be434481`, on which every walk stands, to `9c9e1908b82afe91`; the change is `repair-1.diff`, 44 changed lines, 16 modified files in all, with an added §10 bullet and §12 in the table, one added record and one added line in `sources.txt`. Typecheck 0, eslint 0, four test files 223 passed; `strings-proof-2.mjs` gives the same output.

**Claude's reading of it, saved before Codex's re-check was opened:** every changed line is a comment, a test's title or `describe` wrapping, or the sheet test moved verbatim (the diff shows the heavy-limiting block as moved, an artefact of the algorithm). No assertion, rendered byte, element, string, selector or declaration changed, so no re-walk is owed. Each new comment is true of the new order: the browser note is under the privacy line; the switch is below step 1; the "?" is in the fourth promise; the format hint is that promise's. Correction, before opening: the last grep, run after this reading was first saved, found one more false comment, `src/styles/app.css:1228`, "above the steps" of the switch. Claude owes it as the same must, in a second repair.

**Codex's re-check,** opened after that (verdict "Commit after the musts below"): the repair is as described and no re-walk is owed. **One must, which Claude takes:** §10's added bullet said "1.3.1 holds, since that `section` closes before them"; closing a section doesn't itself establish heading relationships. Claude's verdict made the same overclaim, and it stands as saved, with this correction. **Two shoulds,** both taken: `app.css:1228`, which Claude had found too, and `test/stylesheet.test.ts:272`'s `describe` title, which it hadn't.

**The second repair:** those three, to diff hash `23aedfe476a941e8`, the change `repair-2.diff`. Claude's reading, saved before the second re-check was opened: each true of the new order, no rendered byte or assertion moved, §10 no longer claims a cause.

**Codex's second re-check,** opened after that: "Verdict: Commit", covering the candidate as repaired, the ledger's close still to come. All three resolved; no re-walk owed. **Nothing is held for the owner on this compare.**
