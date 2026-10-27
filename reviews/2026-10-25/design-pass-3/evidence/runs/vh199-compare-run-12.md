<!-- markdownlint-disable -->
<!-- VH-199: the comparison of Claude's and Codex astra's readings of run-12, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-12 — Claude and Codex astra compared (VH-199 #7)

- **Claude:** `vh199-claude-run-12.md`, written before Codex was briefed.
- **Codex astra:** `vh199-codex-run-12.md`, session `01a17cc7-98b8-70b2-b488-bdc174e435a9`, 09:53:37–09:57:29Z.
  - Briefed blind with `vh199-codex-run-12-brief.md`: the run, its logs, the frozen walker and the known classes, but not Claude's reading.
  - It ran after the walk ended, with no walk beside it.

## Agreed

- **Whole:** 16 declared (J2 3, J3 3, J4 3, K-dialog 3, K-player 4) by `run.json` and `parts.mjs` `RUNS`. 16 written, all ok, at `2e7b0c044ce11f2b`, source `a3039c3`, Chrome 156.0.8078.48. No resume, nothing superseded.
- **Step counts:** each record's steps match its declaration: 22, 45, 28, 18 and 16.
- **No failed or "cannot determine" outcome** anywhere in the records' instruments. The counts are the same reading: Codex counts the 403 route steps, and Claude's 419 outcomes are those 403 plus the 16 record-level `keys` outcomes.
- **`focusVisible: false` on passing steps, each as declared:**
  - J3's reload and setup steps, with focus on the body;
  - K-dialog's browser-controls branch, focus reaching `body`, after which focus returns inside the dialog;
  - K-player's 7 steps per record on the `<video>` host. The native ring is outside this route's judgment and is S-127's and the player proof's.
- **J3's console lines** come from its injected faults, and its recovery steps pass.
- **Stop: none.**

## Codex only

- **J3's console lines, traced to their faults:**
  - the save error is F4e;
  - the uncaught error is F8's "Deliberate audit error", not an unplanned crash;
  - the clipboard warning is F5.

  Claude had not traced the uncaught error. Codex's tracing stands.
- **Hashes:** all 32 capture hashes and 7 fixture hashes match their ledgers.
- **The WCAG rules applied:** 2.1.2 and 2.1.3 for the keyboard routes, without treating the host probe as a 2.4.13 measurement.

## Claude only

- **Power and load:** the run was on AC with macOS High Power mode on (`powermode 2`), at a load of 13–16, with Codex's run-11 check beside it.

## Disagreed

- **J3's `focusVisible: false` count.** Claude wrote "3 setup steps each"; Codex counted 5 per record, 15 in all.
  - **Settled for Codex on the records:** each J3 record has 40 of 45 steps with focus visible, so 5 without. Claude's listing was cut to its first three by the query.
  - All 5 are reload or setup steps, and all pass. The attribution is unchanged.

**Run-12's verdict: whole, 16/16 ok. Codex astra: "Fit".** No message needed.
