<!-- markdownlint-disable -->
<!-- VH-199: Claude's own reading of run-09, saved before Codex's, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-09 — Claude's reading (VH-199 #5, Opus 5.5)

Formed from the records at 04:46–05:05Z on 2026-10-27, before Codex astra was briefed on run-09.

Run: `$V/runs/run-09-2026-10-27T03-48-28-340Z-6d6b18`.

## Whole

**No: held at 123/330 ok** for Orchestrator #9's ruling. There is no `manifest.json`: the walker writes it only at a run's end, and both walks were stopped by hand.
- 136 records are written: 123 `ok` and 13 `failed`, all at revision `2e7b0c044ce11f2b`. 194 records are not yet walked.
- `superseded/` holds 19 attempts over 19 keys.

Timeline:
- **The walk:** 03:48:28Z (AC 100%, Low Power off, load 47.5). It **stalled** at 04:13:14Z and was stopped at 04:29:03Z (exit 143, 136 records).
- **Resume 1:** 04:29Z on a fresh Chrome (AC 100%, Low Power off, load 46.5), with +6. It **stalled again** at 04:30:36Z and was stopped at 04:45:54Z (exit 143, 123 ok).
- Both stalls were in the same place: S-133 en-GB w1280's setup, just after its first Save click. The load was 32–47 throughout, from OneDrive and `fileproviderd`. S-24 is not in this run.

## Attribution

- **The stall is an instrument fault in S-133's setup**, deterministic: it is not the machine and not the app.
  - S-133, "A cancelled or failed save keeps the player", makes four saves on four page loads (F4a, F4b, F4c, F4e). After each unsaved result, the next reload raises the app's designed "Leave site?" (`beforeunload`, `src/main.ts:2372-2383`).
  - The frozen walker's `goto` (`walk.mjs:297`) awaits `Page.loadEventFired` with no timeout and no dialog handler, so it waits forever. S-132 and S-134 install their own handlers; S-133 does not. This is VH-198.1's missing stall guard, made certain.
  - My read-only probe (`vh199-5-probe-s133.mjs`, en-GB w1280) saw three `beforeunload` dialogs and reached "setup done" only by accepting each.
  - No earlier S-133 walk exists: S-133 runs only in run-09.
- **The 194 records not walked:** S-133's 4 records, then 190 records of the 16 scenarios after it in plan order (S-146, S-152, S-03, S-15, S-40, S-47a, S-48, S-58, S-63-LW, S-77, S-45b, S-79a, S-81, S-50, S-68, S-119). They are unmeasured, not failed. Every resume would stall at S-133 first.
- **The 13 failed records and 19 superseded attempts are S-120,** "Video language, the card on". This is a new grouping-type scenario: the first record of each group is ok, and the later modes fail the state predicate on focus. Resume 1 recovered 6 of the 19, and the other 13 would recover on later resumes once S-133 no longer blocks them.
- **S-109, "The record names each output": 13 records fail the player row "paused a second after the card appeared"** (`player: false` at finish+1s), while its three asserts pass. This is the class of S-88's rows, expected for VH-200, with S-138 (run-08) beside it.
- **38 native-scrubber target rows** (S-109 31, S-100 4, S-130 3), each with `uaException`. They are expected, under 2.5.5's user-agent exception.
- **No other failing measurement** on the 123 ok records: no focus, assert, overflow or contrast fail.

## Stop?

**Yes, for this run: the S-133 stall is an instrument fault, and I sent it to Orchestrator #8 at about 04:55Z,** with options (a) to (c):
- (a) Hold S-133's 4 records as an instrument gap, and walk the other 190 (with S-120) as a second dir.
- (b) A harness sidecar that accepts `beforeunload`.
- (c) Hold all 194 for the walker-fix batch.

My recommendation is (a). There is no app rank 1 problem, no walker change, and HEAD and the tree did not move. The records already written are trustworthy: the fault blocks walking, it does not corrupt what was measured.

## Verdict

**Not whole; held at 123/330, with S-133's stall the named instrument fault.** The 123 ok records are fit as evidence. The run is not, until #9 rules and the 207 records not ok (194 unwalked, 13 failed) are walked or named.
