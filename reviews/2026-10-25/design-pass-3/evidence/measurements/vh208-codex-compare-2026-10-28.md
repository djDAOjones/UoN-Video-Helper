<!-- markdownlint-disable -->

# VH-208 — compare: Claude's verdict and Codex astra's blind check, 28 October 2026

Written by VH-208 #6, after both were saved. Operational; the item file governs.

## When each was saved
- Codex's brief, `vh208-codex-blind-brief.md` (sha1 7bcd183f…): written from the item, the diff, the table and the records only. It names no reading of Claude's and confines Codex to the repository. Run started 15:09:30Z (`codex exec -m gpt-6-astra -s read-only`, PID 90023).
- Claude's verdict, `vh208-claude-verdict.md`: saved 15:11:45Z, sha1 31017cf98f8143235c5cb4bd88e9aa721392ea9a. The sha1 was confirmed unchanged at 15:20:18Z, before Codex's answer was opened.
- Codex's answer, `vh208-codex-blind.md`: saved 15:20:08Z, opened 15:20:18Z. Before that, #6 read only the run's PID state and the log's byte count.
- **Codex's verdict, as given:** "Verdict: Commit after the musts below".

## Agreed
- The product change is correct and in scope: the order (DOM, tree, painted), `paint`'s paths, and one treatment with no nesting.
- The completion line holds heavy's detail by code, whole, with the sentence gap. Other warnings keep their title, no string is new, and S-151 is the same.
- VH-193 and VH-192 are kept, F15b is recorded, tokens and documents are met, and no UI-STANDARDS rule or spec correction is needed.
- The digest rules are applied: nielsen 1, 5 and 6; carbon's one primary; wcag 4.1.3 as exposure.
- The 32 card-ring cells rightly stay cannot-determine, a limitation.
- **The before's provenance needs a content check** (Codex must 1; Claude should 2). Codex adds that the before's diff hash `2cc1c371db104eb5` is the walker's hash of "unread" (`walker/runner.mjs:247–253`), so it fingerprints nothing. The check is ready (`before-source-check.txt`, in the scratchpad): only the three walker files differ, each identical to the candidate's.
- **The close's musts** (Codex must 5; Claude's musts):
  - the gate and the checker;
  - V-52's Disposition row with its evidence link, and the ledger;
  - a wish line for `heavy-193.mjs:78`;
  - a line for the card's ring;
  - S-138's defect as a line. Codex: route it to the existing wish VH-199.1 rather than a new one, to be checked at the close.

## Codex only
- **Must 3, the load accounting: confirmed, and a walk is owed.** `loadmap-5.mjs:16` lists only cells present in every run given, so it missed cells walked by after-1 or after-2 alone.
  - My `vh208-walk/loadcheck-6.mjs`, over every walked cell, gives 21 after cells with no read below 8 after after-3, then 11 after after-4, then 4 after after-5. Codex's counts are right; the table's 17, 7 and 0 are wrong.
  - The four still lacking one: S-135 zh-Hans w320 spacing (8.24), and S-53 en-GB w1280 light, dark and forced-light (8.22).
  - The brief's rule makes this a gap. It needs a walk of those 4 cells on AC at power mode 2, at load below 8, into `after-6-lowload/`, compared with `compare-4.mjs`.
  - The before's list is wider too: 39 cells have no AC read below 8, all four of S-131's zh-Hans w320 modes among them. The table's §8 must say so. No re-walk is owed for before cells by the brief's rule, and every one of them is identical to before-1 but for S-138's row.
- **Must 2, the qualification results in the bundle: agreed.** VH-208 #3's proofs (W1 to W3, 85 of 85; S-136 and S-91, 14 of 14, at `a3a4267ad47d8bd5`) are under `vh208-walk/proof-3-w123-136-91/` and `assert-136-91/`. They go into the records folder.
- **Must 1's second half: agreed, to check.** after-1's stopped job b has no manifest. Its commit and diff identity must be shown from its own pinned files (its `run.json` matched the grep), not asserted.
- **Must 4, the player's 2.4.13: accepted.** The item names "2.4.13 for … the player"; my verdict leaned on unchanged CSS, which does not measure it.
  - The repair is a read-only probe that runs the walker's own player key and ring rows (`playerKeys`, `PLAYER_KEY_ROWS`, `phase8.mjs:487`, `:935`) on the moved player in warned cells, before and after.
  - It is not a walker change: it follows VH-207's `vh207-probe-trimclear.mjs` precedent. It runs under the lock as a walk, and person-only limitations stay.
- **Should, S-138's mechanism: agreed, and the table is wrong.** F4d is a download, and a download keeps the player (`main.ts:3452–3475`, `lifetimeOf = 'delivered'`). What takes it away is the discard question that the walker's next step (Create) draws, which replaces the card (`main.ts:2899`). So the 1 s sample races the walker's own next step, not a save. Correct §7 and the wish line's wording.
- **Should, 2.4.3: agreed.** Say it is supported by source order, not proved by Save's focus rows.

## Claude only
- **Should 1:** rewrap the long comment line in `renderResult` (`main.ts:3320`).
- **Corrections of earlier notes:** VH-208 #4's missed focus change, and #5's first-screen cells.

## Disagreed
- None held. Must 4 was a difference of reading (Claude: unchanged by inspection; Codex: not re-checked). I take Codex's, on the item's words.

## Repairs to make, then a Codex re-check of them
1. Write `before-source-check.txt` into the records, with a line in table §1 that the before's diff hash is the walker's "unread" placeholder. Show after-1 job b's identity from its own pinned files.
2. Copy #3's proof results into the records, and cite them in the table's opening.
3. Walk the 4 cells (`after-6-lowload/`; `walk-6.sh` and `go-6.sh` per brief §1) and compare them. Correct §8: the counts are 21, 11 and 4, then 0 after after-6; the before's 39; and `loadcheck-6.mjs` with its output in the records.
4. Run the player's 2.4.13 probe, before and after, and record it in §9.
5. Correct §7's mechanism and §9's 2.4.3 wording; take should 1.
6. Then Codex's re-check of the repaired points (`vh208-codex-recheck*`), then check-in (b).
