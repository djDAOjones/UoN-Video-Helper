<!-- markdownlint-disable -->
<!-- VH-199: the comparison of Claude's and Codex astra's readings of run-09, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-09 — Claude and Codex astra compared (VH-199 #5)

Claude: `vh199-claude-run-09.md`, written before Codex was briefed. Codex astra: `vh199-codex-run-09.md`, session `01a17bb3-54c7-7c63-a6e2-97a1085c85de`, 04:51–04:56Z.
- Codex was briefed blind, as #9 ruled: the records, the stall logs and the S-133 probe's output. It was not given Claude's reading, the options or the ruling.
- A first launch without the probe output was stopped unread at about 04:51Z and replaced.

## Agreed

- **Not whole:** 330 declared, 136 written (123 ok, 13 failed), 194 unwritten, 19 superseded. Every written attempt is at `2e7b0c044ce11f2b`, and no ok record lacks a declared subject. There is no manifest.
- **S-133's attribution, which the compare file settles (#9's point 5): both stalls are one instrument fault, not the machine and not the app.**
  - The place: S-133 en-GB w1280's setup, at the first reload after F4a's cancelled save, at 04:13:14Z and 04:30:36Z.
  - The app rightly raises `beforeunload` on an unsaved result. S-133 installs no handler, and `goto`'s load wait has no deadline.
  - The probe's three dialogs (3, 32 and 55 s) and "setup done" once each is accepted confirm it.
  - No coverage reduction is justified, and there is no app rank 1 problem.
- **S-120's 13 failures and 19 superseded attempts** are the grouping pattern; the resume recovered one per group.
- **The 38 scrubber target rows** (S-109 31, S-100 4, S-130 3) are expected, under 2.5.5's user-agent exception.
- **S-109's 13 "paused a second after the card appeared" rows** are not an app failure.

## Codex only

- **S-109's mechanism:** the delayed DOM query samples while the discard question has detached the player. It records `player: false, paused: null` and attributes that to the restored player (`phase8.mjs:77`), and the saved mutations show the question in between. This is the same mechanism as run-08's S-138.
- **S-102 is an app observation for VH-200 / VH-185.1:** the untrimmed sub-400 ms sound fixture reaches the loudness refusal. It is marked `not-counted`. VH-185.1 is the existing wish line ("untrimmed files are out of scope"), so it is no new finding.
- One unwritten record entered setup and 193 were not attempted. Each group log's constructor overwrites the earlier one, so only resume 1's survives. All 851 artifact hashes match.

## Claude only

- The plan order behind the 194: S-133's 4, then 190 records of 16 ids. S-119 has 31 written ok and 8 behind S-133.
- S-133 is also in run-11 (2 records). Found by a static scan after this reading was written, and ruled by #9 as (ii).

## Disagreed

- **S-109's finish+1s row: Codex says "instrument fault … makes those player verdicts unreliable", and asks to correct and requalify the sampling before going on. Claude says it is the known observation class. Settled for Claude on the evidence, with Codex's mechanism adopted.**
  - The row errs only one way: it reads `fail` (`player: false`), never a false pass.
  - It touches no other row: the presence, metadata, no-autoplay and assert rows on the same records pass.
  - The orchestrator's brief already lists it as expected for VH-200 ("the player rows of S-88 and S-128"), and Codex's own run-08 check called it "a named gap", not a stop.
  - So the records stay trustworthy. VH-200 counts these rows as unverified, never as an app failure or an autoplay pass.
  - The sampling fix joins the walker-fix list (beside VH-198.1 and the `beforeunload` handler), and VH-203's after-run measures it. **Held for VH-200 and #9 to confirm.**
- **The verdict: Codex "Not fit"; Claude "not whole; held at 123/330".** They agree in substance: the run cannot be whole while S-133 blocks it.
  - #9's ruling (a) answers Codex's "complete the missing records": walk the 190 and S-120 as `run-09-part`, and hold S-133's records.
  - Codex's "handle the reload dialogs" is the walker fix that ruling holds for VH-203. A walker change now would move the revision and rerun every part already walked.
  - Escalated to the orchestrator as a "Not fit".

**Run-09's verdict: held at 123/330. S-133 is the named instrument gap, with the part to walk by #9's ruling (a). S-109's finish+1s row is the known observation class, held for VH-200. Codex: "Not fit".**
