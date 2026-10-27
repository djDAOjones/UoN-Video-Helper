<!-- markdownlint-disable -->
<!-- VH-199: Claude's own reading of run-11-part, saved before Codex's, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-11's part — Claude's reading (VH-199 #7, Opus 5.5)

Formed from the records at 09:45–10:05Z on 2026-10-27, before Codex astra was briefed on run-11's part.

Part: `$V/runs/run-11-part-2026-10-27T09-12-14-585Z-f0fb63`. It was walked by `zsh $V/go.sh run-11-part matrix.mjs run-11 <22 ids>`, then `resume-until-whole.sh`, under #9's ruling (ii).

## Whole

**Yes: 111/111 ok,** `whole: true`, `problems: []`, keys `6a7b393d0a280ab1` (keysMatch), all at revision `2e7b0c044ce11f2b`, source `a3039c3` (not dirty), Chrome 156.0.8078.48, no visible-page flag missing (`check-run.mjs`).
- **The walk:** 09:12:14Z to 09:44:48Z, exit 0, 1,953 s, with all 111 ok on the first walk. The helper read `WHOLE after 0 resumes: 111 111`.
- No failed record, `superseded/` empty, no stall, no Chrome kill, HEAD unmoved.
- **The 645 artifacts** in `artifacts.json` all match their byte counts and SHA-256s, which I re-hashed.
- **Power:** AC throughout. At the start (09:11Z): AC 73%, Low Power off, `powermode 0`. At the end (09:44Z): AC 77%, `powermode 2`, which is macOS High Power mode, set on AC by someone other than me between 09:11Z and 09:42Z (`pmset -g custom`: battery 1, AC 2). Low Power stayed off throughout. No record was written on battery.
- **Load (1-min):** 42.1 at 09:11Z (the helper read 39.7 at 09:12Z), 17.6 at 09:42Z, 12.2 at the end.

## The reconcile (#9's ruling (ii))

- `parts.mjs` `RUNS` declares run-11 as 113 records over 23 ids.
- The part's `run.json` declares 111 over 22 ids. Each of its keys is in the plan, and each was written once.
- The plan's only keys not in the part are `S-133|zh-Hans|w320|light` and `S-133|ms-MY|w320|light`, at plan index 107–108: S-133's 2, held.
- **111 + 2 held = 113.** Nothing is missing, double-counted or counted from a failed attempt.

## Attribution

No record is not ok and none was superseded. These rows on ok records fail or read "cannot determine":
- **S-132 ×2 (ms-MY, zh-Hans w320): three player rows.**
  - "An object URL whose metadata loads" fails (`error 4`, `readyState 0`).
  - "Host named by the card's title" fails: the name is "Unable to play media.", while `aria-labelledby` points at the card's title.
  - "Control inventory" reads "cannot determine".

  S-132 injects F15b, so the failed playback is its intended state, the known class. Its asserts (F15a, F15b) and its 3 subresults (Save completes as S-62's) pass. The player instrument's `failing: 2` in the manifest is these two records. S-132 reloads twice with its own dialog handler, and nothing stalled.
- **S-138 ×2 (ms-MY, zh-Hans w320): the limiting row "first in the line spoken at completion…" reads "cannot determine"**, because "the page language changed since the completion" (`phase8.mjs:837`).
  - This is the declared row: every S-138 record in run-08 reads the same, and run-08's compare names it.
  - The finish+1s player row did **not** recur: both records' player instruments pass, 12 counted, 1 exempt. This is the known class, absent this time.
  - Its assert passes ("both, heavy first, through the download, Keep it and 'Previous video'").
- **S-138 ×2 and S-151 ×2: the player's "control target" row** (`slider "video time scrubber"`, a 161 × 24 px hit run). Each row carries `uaException` and is exempt, so the instrument passes. These are the native scrubber's target rows, expected under 2.5.5's user-agent exception.
- **S-06b ×8: the targets rows on two links in a sentence.** The links are the e-mail address and the Equality Advisory and Support Service link (40 px high, or 64–112 px where the line wraps). Each is exempt as "an inline link sharing its line with text outside it (2.5.5 inline exception)", so targets passes on all 8. Not counted; nothing for VH-200 beyond the exception.
- **The declared "cannot determine" readings, person-check and VH-173 classes:**
  - contrastExtra on 89 records (178 rows): the range thumb and track, painted pseudo-elements;
  - targets on 87 records: the trim discs `#trim-start-range` and `#trim-end-range`, VH-173's reading, which no 44 px square fits;
  - measure on 10 records: mixed scripts, VH-173's reading. These are S-06b's statement paragraph and the zh-Hans notification body with the e-mail address.
- **Two `[save] file picker failed; falling back to a download` console warnings,** at 09:44:05Z and 09:44:18Z, both in S-138. Headless Chrome has no picker, so the app takes its designed download path; run-08 logged 4. S-138's "through the download" assert passes. Not a fault.
- **No other failing row:**
  - `overflow`, `ax`, `contrastText`, `type`, `focus`, `footer` and `videoLanguage` pass on all 111;
  - `asserts` pass on 8 and do not apply on 103;
  - `limiting` passes on 4 (S-132, S-151), reads "cannot determine" on S-138's 2 and does not apply on 105;
  - `formatTip` does not apply on any.

No new grouping-type scenario and no new known class.

## Stop?

**No.**
- No instrument fault, no coverage reduction beyond the ruled hold, no app rank 1 problem, no walker change, no NO-PROGRESS stop. HEAD and the tree did not move.
- One between-runs change to a helper in `$V`. After the walk, `power.sh` learned to print `powermode 2` as "Low Power off, High Power on". Before, it printed "Low Power 2", which the helpers' AC check refuses. The original is kept as `$V/power.sh.bak-vh199-7`. Nothing in the repo or the walker changed.

## Verdict

**Whole, 111/111 ok; with S-133's 2 held, 111 + 2 = 113.** S-133's 2 are accepted by the owner as named gap S-133 ×6, with run-09's 4.
