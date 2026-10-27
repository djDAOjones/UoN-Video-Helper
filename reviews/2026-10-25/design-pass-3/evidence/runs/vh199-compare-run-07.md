<!-- markdownlint-disable -->
<!-- VH-199: the comparison of Claude's and Codex astra's readings of run-07, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-07 — Claude and Codex astra compared (VH-199 #5)

Claude: `vh199-claude-run-07.md`, written before Codex was briefed. Codex astra: `vh199-codex-run-07.md`, session `01a17b46-1027-7520-88a8-72f0d39c55fe`, run beside run-08's walk.

## Agreed

- **Whole:** 355/355 ok, keys `514a0f59c9a0833f` both ways, every record (superseded attempts included) at `2e7b0c044ce11f2b`, source `a3039c3`, Chrome 156.0.8078.48, no flag missing.
- **S-96 (47 attempts, 19 keys) and S-150 (18 attempts, 9 keys)** are the grouping pattern, all recovered.
- **S-93's "exactly one check after the last press"** fails on all 4 records. It is the named check-count gap (`STATUS_SINCE`; `phase8.mjs` drops identical text).
- **S-83's `#contact-creators` ring in both forced palettes** at en-GB w320 and ms-MY w1280 (1,108 of 1,264 and 1,595 of 1,968 px²) is an app finding for VH-200 under 2.4.13. It is not rank 1: the ring stays visible.
- **The 39 S-127 overflow-button rows** are exempt under 2.4.13's first exception, per the player proof.
- **The native scrubber's target rows** are exempt under 2.5.5's user-agent exception.
- No stop, no coverage reduction, no instrument fault, no app rank 1 problem.

## Codex only

- **S-62's three w375 records** have a focus row "cannot determine: focus did not land on the control". The control is Save, which S-62's own state declares disabled after the save (`M.saveBtn().disabled`, `scenarios.mjs:783`). This is a declared limitation, not a fault. Confirmed on the record.
- Codex recomputed the keys and walker hash independently, and checked all 2,995 artifacts by size and hash.

## Claude only

- **The S-83 capture's cause:** the ring's lower edge runs over the next link's text, "Students: …", whose forced colour is not 3:1 from the ring's. The same wrapped link passes outside forced colours, and passes in forced colours on one line.
- **The plan's S-93 count** is 4 in run-07 and 2 in run-10, not 5 and 3 as hand-over 9 said.

## Disagreed

- **The scrubber row count:** Claude's 158 against Codex's 119. **Settled for Codex on the records.**
  - There are 119 scrubber target rows, one per record.
  - Claude's S-127 figure of 78 counted that scenario's 39 overflow-button rows a second time.
  - So 158 is 119 scrubber rows plus 39 overflow-button rows.
- **The verdict's wording:** Claude said "Fit" and Codex "Fit with a named gap (S-93's check counter)". **Settled as Codex's wording.** The check-count gap is already held for the owner, and naming it costs nothing.

**Run-07's verdict: fit, with S-93's check counter the named gap. S-83's forced-colour footer ring goes to VH-200 as a new finding.**
