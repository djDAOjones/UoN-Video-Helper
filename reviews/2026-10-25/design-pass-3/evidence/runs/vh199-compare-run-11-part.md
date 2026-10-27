<!-- markdownlint-disable -->
<!-- VH-199: the comparison of Claude's and Codex astra's readings of run-11-part, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-11's part — Claude and Codex astra compared (VH-199 #7)

- **Claude:** `vh199-claude-run-11-part.md`, written before Codex was briefed.
- **Codex astra:** `vh199-codex-run-11-part.md`, session `01a17cc2-44d9-7773-982b-909812907e96`, 09:47:48–09:52:41Z.
  - Briefed blind with `vh199-codex-run-11-part-brief.md`: the part, its logs, the frozen walker and the known classes, but not Claude's reading.
  - It ran beside run-12's walk, at a 1-min load of about 13.

## Agreed

- **Whole:** 111 declared by the part's `run.json` and by `parts.mjs` `RUNS` filtered to the 22 ids. 111 written, all ok, all attempt 1, at `2e7b0c044ce11f2b`. No missing subject, no resume, nothing superseded.
- **Reconcile:** 113 = 111 walked + 2 held, `S-133__zh-Hans__w320__light` and `S-133__ms-MY__w320__light`. Nothing is missing, duplicated or taken from a failed attempt.
- **Artifacts:** all 645 match their sizes and SHA-256s.
- **S-132 ×2:** the metadata and host-name player rows fail and the control inventory reads "cannot determine". This is F15b's intended state, and the save subresults pass.
- **S-138 ×2:** the completion-line limiting row reads "cannot determine" because the page language changed after the completion (`phase8.mjs:837`). It is declared, and unverified for VH-200.
- **S-138's finish+1s row did not recur:** `player: true`, so the known class is absent here.
- **S-138 and S-151:** the native scrubber's target rows, under 2.5.5's user-agent exception.
- **S-06b ×8:** the e-mail and EASS links' 16 target rows, exempt under 2.5.5's inline exception.
- **The declared "cannot determine" readings:**
  - the trim discs on 87 records (VH-173's reading);
  - the range thumb and track on 89 records (178 rows, a person check);
  - mixed-script measure on 10 zh-Hans w1280 records (11 rows).
- **Stop: none. Verdict: S-133's 2 held is the named gap.**

## Codex only

- **The trim-disc row count:** 174 rows on 87 records. Four more rows in S-132 are exempt as disabled.
- **S-132's saves:** 1,091,493 bytes each, with all six save-subresult assertions passing.
- **S-25a and S-25b:** their long pauses accompany the 10,800 s fixture and F13 setups, and all complete.
- **Timing:** the load and the power-mode change qualify timing comparisons. I agree: the High Power mode change goes in VH-200's "attribution unresolved" note, with the battery records.

## Claude only

- **`power.sh` was changed between runs** to print `powermode 2` as "Low Power off, High Power on". It is a helper in `$V`; the repo and the walker are untouched.

## Disagreed

- **The cause of S-138's two `[save] file picker failed; falling back to a download` warnings.**
  - Claude: headless Chrome has no picker.
  - Codex: the deliberate F4d fallback.
  - **Settled for Codex on the record:** S-138's `faults` are `["F16","F4d"]`. F4d ("createWritable rejects", `faults.mjs:122`) drives `saveFile` to its download fallback (`src/media/save.ts:178-196`) by design. Either way it is not a fault.

**Run-11's verdict: whole under #9's rule, 111/111 + 2 held = 113.** Codex astra: "Fit with a named gap — S-133's two records held because the frozen setup lacks beforeunload handling." That gap is accepted by the owner (S-133 ×6), so no message is needed.
