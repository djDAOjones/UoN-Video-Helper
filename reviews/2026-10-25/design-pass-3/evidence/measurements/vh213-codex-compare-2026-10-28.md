<!-- markdownlint-disable -->

# VH-213 — Claude's verdict and Codex astra's blind check, compared, 28 October 2026

Claude's verdict (`vh213-claude-verdict-2026-10-27.md`, VH-213 #3) was saved at 2026-10-27T23:25:18Z, its addendum included, before any Codex run. Codex astra ran blind from `vh213-codex-blind-brief-2026-10-28.md`, 2026-10-28 08:03:31–08:15:36Z, and its answer is `vh213-codex-blind-2026-10-28.md.txt`; it was opened only after it ended, with the worktree unchanged throughout. Claude: "meets VH-213". Codex: "Revise". Compared by VH-213 #4.

## Agreed

- The rule for an ordinary whole file: under one block of decoded sound, never gap-fill, gives a silent job that finishes, warned before Create, the source untouched; `loudness.ts` and `BLOCK_SECONDS` unchanged.
- The reason carried three ways, no track, kept part and whole video, from the worker to the words; `cut-short` and `ends-early` first, as before.
- The owner's words verbatim in three languages, machine translations marked; the notes, the CSV row and the tables agree.
- **The replaced test: sound.** The base's "leaves an untrimmed file as it was" pinned the behaviour the owner reversed; it is replaced in the same file by boundary, decoding and planning cases. Nothing else deleted, skipped or weakened.
- **whole-cut: sound for this fixture.** It failed after the encode at base; it now finishes with no audio track under its ends-early note, which reads true for sound that stops at 0.32 s.
- **The load judgement: sound** for the outcomes compared: every run on AC in power mode 2, the after re-walked whole at low load and reading the same.
- S-102's predicate the only walker change, proved before the after; the spec row 8,123 of 8,200, 77 free; no CSS, token, control or element; UI-STANDARDS unchanged. Codex re-hashed all 52 records, the diff and both trees: all match.

## Codex only

1. **Must 1: a partly decoded file that ends early.** When a whole file's decoded sound is under one block and the file also ends early, `detectSourceWarnings` (`src/audio/warnings.ts:115`) shows only `ends-early`. Its words say "After {stops}, the new video will be silent", with {stops} the end of the decoded sound (`src/media/ends-early.ts:135`). Take Codex's case: 160 ms decoded near 1 s and 160 ms near 5 s, with 10 s declared. The note promises silence after 0:05, but the output has no audio at all. Claude checked this against the code: the fact holds.
2. **Must 2: the none-decoded control is unmeasured.** The item's tests list "no track, none decoded, just under, exactly and just over one block", and its stage rule measures "the controls above as fixtures or faults". The walk has no track (S-20), just under (whole-390 and S-102), exactly (whole-400), just over (whole-410) and the cut file, but no fixture with an audio track that decodes nothing. Claude's verdict missed this.
3. **Should 3: the load account.** Table line 17 says the flagged before groups sat "in two cells whose other five groups gave the same outcome". whole-cut had only two unflagged groups. Two before groups straddled the line without a flag (S-99 ms-MY 320, 7.72 → 8.14; whole-cut en-GB 1280, 5.09 → 8.10), and the after's final reading of 19.07 has no raw flag.
4. Note: 3.1.5 is graded in en-GB only, as the table says.

## Claude only

- The notes that a trim keeping almost the whole video still gets the kept-part words, and that over 400 ms of decoded digital silence is the loudness path's, as before. Neither blocks the item.

## Disagreed, and what follows

- **Overall:** Claude "meets", Codex "Revise".
- **Must 2: Claude agrees,** so a repair is owed: an independently proved fixture or fault with an audio track that decodes nothing, declared and proved before the after, walked before (on a `git archive` export of `5893d9d`) and after, in 3 languages × 2 widths × 4 modes, with the output's tracks read.
- **Should 3: Claude agrees.** The table's load account is corrected when it is next revised. No re-walk is needed: Codex found that the low-load before groups reproduce the flagged outcomes.
- **Must 1: Claude agrees on the fact, not that it is VH-213's must.**
  - The same precedence has applied to a trimmed keep since VH-185, and VH-206's checks accepted it.
  - The owner chose "Same rule as a trim (Recommended)", and the item says a declared sound that never arrives "stays `ends-early`".
  - The sound left out of the warning is under 400 ms, the amount the owner judged too short to level.
  - Any repair changes VH-185's and VH-206's settled precedence, or makes the whole video and the trim differ. Both outgrow this item (an unconditional stop).
  - Claude would record it as a wish line for both paths. The evidence can't settle this, so it is **held for the owner** under the Codex word's point 4. VH-213 stays open.

## Re-check

Claude's reading of the re-check points (VH-213 #6) was saved at 2026-10-28T11:07:49Z, as a new section of Claude's verdict, before the re-check started. Codex astra re-checked from `vh213-codex-recheck-brief-2026-10-28.md`, 11:08:20–11:15:27Z, and its answer is `vh213-codex-recheck-2026-10-28.md.txt`. Its brief withheld Claude's verdict and this compare, and it says it left their copies unopened. The answer was read only after the run ended, and the worktree was unchanged throughout. Claude: "meets VH-213 for the re-checked points". Codex: "Commit", with no musts and no shoulds. Compared by VH-213 #6.

### Agreed

- **Must 2: repaired.** The fixture's "none decoded" is proved by ffprobe and ffmpeg alone and corroborated by the boxes read. The cell was walked before and after in 3 languages × 2 widths × 4 modes, with the output's tracks read. Before, there is no note and the job fails late (`missing-audio`). After, the whole video's note comes before Create, the job finishes and the file is 1v0a. The pair matches in power mode (battery, mode 2, above 50%), and its loads, straddle and end check are disclosed. The control is met.
- **Should 3: fixed.** §1 now states the whole-cut groups, the two straddles, the start-only flagging and the end check's 19.07 truly.
- **Must 1: disposed of truly.** §7 records the owner's "Yes, all three" and the close without repair. The wish line VH-213.1 covers both paths fairly. Nothing in the candidate depends on the repair.
- **Provenance:** the tracked diff is still `cd985a8d4dcf`; the 52 earlier and 15 new record hashes match; the links resolve. The §3 correction to 31 agrees with the records.
- **Owed at close:** the ledger (Notes, the backlog, the trajectory, the decision and wish VH-213.1), the gate, Codex's close check and the linkage.

### Codex only

1. Codex reproduced the AC before's recorded probe sha1 (`9b6ddbf7636c…`) by adding only `whole-none`'s declaration to the kept 27 October probe. So the probe's later change is the power gate and its logging, not a page read. The walk script's old bytes are gone, so its change can't be proved independently. The table says so, and the battery pair uses the kept versions.
2. At close: retire the wish the item pays off (VH-185.1, rule 6), and record the owner's authorised exception (must 1, option (a)).
3. At close: the item's sizing, its budget and hand-over accounting, is still unshown (item, "Sized").

### Claude only

- Nothing of substance; Claude's caveat that the AC before's script versions were not kept is Codex's note 1.

### Disagreed

- None. The re-check's verdict, "Commit", is kept as the follow-up verdict, and VH-213 goes on to the ledger and the close check.
