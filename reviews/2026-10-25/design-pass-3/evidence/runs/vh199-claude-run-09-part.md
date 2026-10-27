<!-- markdownlint-disable -->
<!-- VH-199: Claude's own reading of run-09-part, saved before Codex's, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-09 part — Claude's reading (VH-199 #6, Opus 5.5)

Formed from the records at 05:44–05:55Z on 2026-10-27, before Codex astra was briefed on the part.

Part: `$V/runs/run-09-part-2026-10-27T05-04-47-007Z-e6d366` (`node matrix.mjs run-09 <17 ids>`, the walker's own subset mode, by Orchestrator #9's ruling (a)). First dir: `$V/runs/run-09-2026-10-27T03-48-28-340Z-6d6b18`.

## Whole

**Yes: the part is whole, 252/252 ok,** `whole: true`, `problems: []`, keys `94f7119f1f84c006` (keysMatch), all at revision `2e7b0c044ce11f2b`, source `a3039c3`, Chrome 156.0.8078.48, no visible-page flag missing (`check-run.mjs`).
- **The walk:** 05:04:47Z (AC 100%, Low Power off, load 79.5) to 05:40Z, 233 ok and 19 failed, all S-120.
- **Resumes 1–5:** 05:40–05:44:03Z, +6, +4, +4, +4, +1 (load 38.8–61.0); `WHOLE after 5 resumes: 252 252`. End: 05:44Z AC 100%, Low Power off, load 54.1.
- No stall, no Chrome kill, no power event, HEAD unmoved.

## The reconcile across the two dirs (#9's rule)

Run-09 declares 330 records over 24 ids (`run.json` and `parts.mjs` `RUNS`, the same set).
- **From the first dir:** 74 ok, the whole of S-99 (31), S-100 (4), S-102 (1), S-109 (31), S-123 (4) and S-130 (3).
- **From the part:** 252 ok, the whole of S-119 (39), S-120 (31), S-146 (31), S-152 (4), S-03 (8), S-15 (10), S-40 (30), S-47a (16), S-48 (1), S-58 (10), S-63-LW (16), S-77 (25), S-45b (11), S-79a (6), S-81 (3), S-50 (3), S-68 (8).
- **Superseded by the part:** the first dir's S-119 31 ok and S-120 18 ok and 13 failed.
- **Held, not walked:** S-133's 4 (en-GB, zh-Hans, ms-MY w1280; en-GB w320; all light), the named `beforeunload` instrument gap.
- **The sum:** 74 + 252 + 4 held = 330; no record counted twice, none missing.

## Attribution

- **The 19 failed records and the 47 superseded attempts are all S-120,** "Video language, the card on": the grouping-type pattern already named in run-09 (the first record of each group ok, later modes failing the state predicate; one recovered per group per resume). 19 + 13 + 9 + 5 + 1 = 47 attempts moved aside.
- **S-152 ×4, "A failed playback beside the limiting warning": three player rows each** ("an object URL whose metadata loads" fail, MediaError 4; "host named by the card's title" fail, name "Unable to play media."; "control inventory" cannot determine). S-152 injects F15b, so a failed playback is its intended state, the class of S-132's player rows. The scenario's own assert (the MediaError recorded, the warning first) and its subresults pass. Expected for VH-200, not a fault. The host's name reading Chrome's error text rather than the card's title is worth VH-200's look beside S-132's.
- **24 native-scrubber target rows** (S-63-LW 16, S-68 8), each with `uaException`: expected, under 2.5.5's user-agent exception.
- **The declared "cannot determine" readings:** targets ×175 (skip link positioned off the page until focused, a person check; the disc's hit box, VH-173's reading), measure ×44 (mixed scripts, VH-173's reading), focus ×8 (S-15, the disc against the 44 px circular reference, VH-173's reading), contrastExtra ×179 (range thumb and track). All are the person-check classes, not failures.
- **No other failing row** on the 252: every assert passes or does not apply (178, 74), `ax`, `overflow`, `type`, `contrastText`, `videoLanguage` pass on all 252; `footer`, `limiting`, `formatTip`, `motion` and `subresults` pass where they apply.

## Stop?

**No.** No instrument fault, no coverage reduction beyond S-133's ruled hold, no app rank 1 problem, no walker change. HEAD and the tree did not move.

## Verdict

**Whole, 252/252.** With the first dir's 74 and S-133's 4 held, run-09 counts as whole for the hand-back point under #9's rule: 326 measured + 4 held = 330.
