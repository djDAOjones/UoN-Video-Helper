<!-- markdownlint-disable -->
<!-- VH-199: Codex astra's blind attribution of run-09-part (codex exec -m gpt-6-astra -s read-only), from vh199-codex-run-09-part-brief.md; the reply, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

1. **Whole:** The part is whole: **252 declared, 252 current records, 252 ok, 0 failed**. Its declaration exactly matches frozen `RUNS` filtered to the 17 scenario IDs, including required instruments and expected subjects. All records use revision `2e7b0c044ce11f2b`; no ok record lacks a subject its `expects` declares. Its 47 superseded files are additional failed attempts, excluded from coverage.

2. **Reconciliation:**

| Directory | Declared | Current records | Ok | Failed | Unwritten |
|---|---:|---:|---:|---:|---:|
| First | 330 | 136 | 123 | 13 | 194 |
| Part | 252 | 252 | 252 | 0 | 0 |

The part supersedes **62 first-directory records**: S-119’s 31 written cells and all 31 S-120 cells, comprising 49 ok and 13 failed records. The first directory contributes **74 retained ok records**: S-99 (31), S-100 (4), S-102 (1), S-109 (31), S-123 (4), S-130 (3).

Thus **74 + 252 + 4 held = 330**, each declared key accounted for once. Held, unwritten records are S-133 in light mode: en-GB/w1280, en-GB/w320, zh-Hans/w1280 and ms-MY/w1280. No unexplained omission, double-counting or failed attempt contributes to the 326 ok records.

3. **Attribution**, including nested rows hidden by aggregate verdicts:

- **S-120: all 47 part superseded attempts**, covering 19 keys, are the known grouping pattern. Setup establishes checkbox focus; `matrix.mjs` blurs after measurement, so subsequent modes fail the focus predicate with `active: body`. Five resumes recover everything. The first directory’s 19 superseded attempts and 13 remaining failures share this cause.
- **S-152: four records**, each with metadata-load and host-name failures plus “cannot determine” control inventory: intended **F15b** playback failure. Chrome reports MediaError 4 and “Unable to play media.” All five save/warning subresults pass per record, including a 7,469,454-byte saved file. No unexpected app finding.
- **Native scrubber target failures:** 24 part rows (S-63-LW/S-68), plus 38 retained-first rows (S-100/S-109/S-130): recorded **2.5.5 user-agent exceptions**, supported by the player proof.
- **S-81’s six inline-link target failures:** recorded **2.5.5 inline exceptions**, all in spacing mode.
- **Thumb target uncertainty:** 358 part rows and 148 retained-first rows: known circular-target interpretation.
- **Thumb/track contrast uncertainty:** the same row counts: declared pixel/person checks.
- **S-15’s 16 focus uncertainties:** known painted-disc versus 44 px reference interpretation under **2.4.13**.
- **Mixed-script measure uncertainty:** 53 part rows and 16 retained-first rows, with corresponding nested line readings: known **1.4.8** interpretation for VH-200.
- **S-109’s 13 finish+1s failures:** known instrument gap; the later scenario step detaches the player. Keep that measurement **unverified**.
- **S-102’s recorded loudness refusal:** known app outcome, VH-185.1; its assertion explicitly records without judging.

Evidence read: both declarations, all current/superseded JSON and nested instruments, manifest/digest, four logs, group logs, frozen walker code, player proof and app leave-warning/player code. All **2,799 indexed artifacts** match their recorded sizes and hashes.

4. **Stop:** No additional stop condition found: no unexplained instrument fault, coverage reduction beyond S-133’s ruled hold, or newly evidenced rank-1 app problem.

**Fit with a named gap — S-133’s four held beforeunload records; S-109’s finish+1s player measurement remains unverified.**