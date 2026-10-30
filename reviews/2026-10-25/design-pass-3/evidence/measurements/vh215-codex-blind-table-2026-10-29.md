<!-- markdownlint-disable -->
# VH-215's before and after: the submission card's running time, the length made, 29 October 2026

This is [VH-215](../../../../../project/items/VH-215.md)'s stage-rule measure for wish VH-139.5. The submission card's running time was the part kept, worked out on the page from the trim and the file's index before the job started, so a cut-short MP4 whose index declares 30 seconds drew "0:30" on a video 21 seconds long. VH-215 puts the length made on the card. Pre-flight measures it before Create, and the worker refuses a card known to differ from what is made (section 3).

**What the walk shows, and what it cannot show.** The stage rule names S-23 (a cut-short Matroska file) and the cut WebM VH-158 checked, walked as Student submission with a closing on and off. Neither fixture shows the defect. A Matroska-family file reads to its last whole cluster, so the page's inspected length is already the length that survives: 0:20 for S-23's `cut-short-30s.mkv` and 0:05 for the cut WebM. The defect shows only where an index declares more than arrived, as an MP4 cut does. So the 96 cells before and after show only that the burned card and the page's line stay right on these cut files in every cell, and the job's time. They are not evidence of the correction. The correction's evidence is the browser proof on the cut MP4, run on the base and on the candidate (section 4.3), and the Node tests (section 3).

Every cell was walked on the base and on the candidate. The records are in [`vh215-records-2026-10-29/`](vh215-records-2026-10-29/), with the scripts that made and read them, each run's conditions and load log, and the checks (section 8).

## 1. Provenance

| | Before | After |
| --- | --- | --- |
| Source | `export-6/`: a `git archive` of the base, `7750acb` (VH-212), with the walker's three changed files overlaid, sha1-checked; `node_modules` an APFS clone of the checkout's, its `.vite` removed. Its content check, [`before-source-check-6.txt`](vh215-records-2026-10-29/before-source-check-6.txt): against a fresh archive of the base only the three walker files differ, each identical to the checkout's, so the app is the base's byte for byte | `export-8-cand/`: a `git archive` of the base with all fifteen of the candidate's paths overlaid (twelve modified, three new), each sha1-checked. Its content check, [`cand-source-check-8.txt`](vh215-records-2026-10-29/cand-source-check-8.txt): byte-equal to the checkout's working tree outside `node_modules`, `dist` and `.vite` (1,889 paths: 0 missing, 0 differing, 0 extra), and against the base exactly the fifteen paths |
| Source identity | The export is not a checkout: `sourceIdentity()` reads `commit` and `dirty` as `unknown`, and its diff hash, `2cc1c371db104eb5`, is the walker's hash of "unread" | The same |
| Instrument | revision `17727d3522f7270d` (the base's is `198cfe660331f1bf`; section 3 gives the walker's change): `fixtures.sh` `1ea55993…`, `scenarios.mjs` `abef28de…`, `card-215.mjs` `058f4c39…` | The same revision and the same three sha1s, in every run's `conditions.txt` |
| Driver | the pass's runner, `matrix.mjs vh215 <scenarios>`, started by the launcher `walk6.sh` | the same runner, by `walk9.sh` (the after) and `walk10.sh` (the re-run), launchers on `walk6.sh`'s model; `walk10.sh` is `walk9.sh` changed only in its header, owner, profile and script-sha1 lines |
| Serving | Vite at :5181 from the export, outside the OneDrive checkout; headless Chrome on CDP :9251 with its own profile; 1280 and 320 CSS px | the same |
| Fixtures | `fix-4/`, made once by the walker's `fixtures.sh`, read only: `cut-short-30s.mkv` `bdc3dcb0…`, `cut-short-10s.webm` `261002a2…` | the same files, sha1-checked before each run |
| Coverage | 96 of 96 in the manifests (48 a run), whole, each cell once ([`cover-96-6.txt`](vh215-records-2026-10-29/cover-96-6.txt)) | 96 of 96, each once, none missing or extra ([`cover-96-9.txt`](vh215-records-2026-10-29/cover-96-9.txt)); the re-run's 72 records, 18 jobs, beside them |

**No before cell comes from VH-199.** VH-199's S-23 records are Staff at the ready verdict, in light only, with no submission card and no job, from source `a3039c3` at instrument `2e7b0c044ce11f2b`. All 96 before cells were walked on the base, after the walker's change was proved.

## 2. The runs, their power and their load

The cells are the item's stage rule: S-23s and S-23sn (S-23's `cut-short-30s.mkv`, closing `cut` and `none`), and S-23w and S-23wn (the cut WebM, `cut-short-10s.webm`, closing `cut` and `none`), as Student submission, in en-GB, zh-Hans and ms-MY at 1280 and 320 px, in light, dark, forced light and forced dark: 96 cells. One job serves the four colour modes of a scenario, language and width, so there are 24 jobs a side.

| Run | Side | When (UTC, 29 October) | Cells or cases | Power | Load (1 min): start / range in its log / end |
| --- | --- | --- | --- | --- | --- |
| probe-4 | the route, base | 00:00:34 | the three fixtures, routes A–D | AC, 100%, power mode 2 | 4.52 / — / 5.09 |
| probe-5 | the route, base | 00:00:58 | the largest whole file and the largest cut, routes A–D | AC, 100%, power mode 2 | 4.40 / 4.40–5.89 / 10.79 (after the cut's decode, re-run in probe-6) |
| probe-6 | the route, base | 00:03:04 | the largest cut, re-run at low load | AC, 100%, power mode 2 | 6.49 / 6.49–6.99 / 6.67 |
| walk-5b | before | 11:20:36–11:29:10 | S-23s, S-23sn: 48 of 48, 12 jobs | AC, 100%, power mode 2 | 5.13 / 2.69–6.68 / 2.68 |
| walk-6 | before | 11:30:23–11:38:33 | S-23w, S-23wn: 48 of 48, 12 jobs | AC, 100%, power mode 2 | 3.07 / 2.19–6.16 / 4.94 |
| proof-9-base | the proof, base | 13:44:38–13:46:15 | 10 of 10 cases | AC, 100%, power mode 2 | 6.04 / 6.04–36.63 / 42.97 |
| proof-9-cand | the proof, candidate | 13:49:50–13:51:27 | 10 of 10 cases | AC, 100%, power mode 2 | 4.79 / 4.79–7.36 / 7.81 |
| walk-9a | after | 13:55:48–14:04:15 | S-23s, S-23sn: 48 of 48, 12 jobs | AC, 100%, power mode 2 | 6.66 / 3.21–19.04 / 7.51 |
| walk-9b | after | 14:06:00–14:14:07 | S-23w, S-23wn: 48 of 48, 12 jobs | AC, 100%, power mode 2 | 4.93 / 4.93–12.54 / 11.59 |
| walk-10a | after, re-run | 14:58:24–15:02:39 | S-23sn: 24 of 24, 6 jobs | AC, 100%, power mode 2 | 2.82 / 2.82–4.04 / 3.82 |
| walk-10b | after, re-run | 15:02:59–15:07:03 | S-23w: 24 of 24, 6 jobs | AC, 100%, power mode 2 | 4.78 / 3.99–5.25 / 4.23 |
| walk-10c | after, re-run | 15:07:23–15:11:27 | S-23wn: 24 of 24, 6 jobs | AC, 100%, power mode 2 | 4.38 / 4.28–10.27 / 11.05 |

- **Power.** The owner's rule is a before and its after in one power mode. Every run here, the route's probes and both sides of the proof among them, ran on AC at 100%, power mode 2, in every sample of its load log.
- **Load, the before.** It never reached 8 in either group (2.19–6.68).
- **Load, the after.** Each group started below 8, then the load passed 8 partway through, from OneDrive's processes restoring deleted items into the checkout, not from the walk: in walk-9a after 14:01:19Z (peak 19.04), in walk-9b after 14:08:01Z (peak 12.54). The card and page-line readings and each record's outcome are predicates on decoded pixels and page state, with no timing in them, so they stand as walked. A job's time can depend on load, so the after walk's own reading of each record's time against its load log owed 14 jobs a low-load re-run (section 4.2). That re-run is walk-10a to walk-10c. Its readings (card, page line, outcome) came out identical to the after walk's in all 18 jobs, and the table uses its times for the 14 owed jobs ([`rerun-times-10.txt`](vh215-records-2026-10-29/rerun-times-10.txt)).
- **The re-run's one load note.** S-23wn ms-MY 320's re-run job, 15:11:01–15:11:02Z, had load 4.35 at 15:10:54Z, just before it, and 10.27 at 15:11:24Z, just after it. Orchestrator #26 ruled that its time, 1,059 ms, stands as a conservative reading. Load could only have slowed that job, and its time is within the before's range for S-23wn ms-MY at both widths (1,032–1,109 ms), the range the ruling and `rerun-times-10.txt` compare it with, and so within the scenario's six before jobs (1,032–1,141 ms, section 4.2). A further re-run could not change the conclusion; none was run. A fourth group, walk-10d, never started: at its start the ports check found six CLOSED sockets that the Claude desktop app held to :5181, so it released the lock and made no folder ([`walk-10d.launcher.log.txt`](vh215-records-2026-10-29/walk-10d.launcher.log.txt)). From then on, the ports check ignores CLOSED sockets held by that app and records them; any live state on either port still counts as busy.
- **Load, the proof's base side.** Load rose from 6.04 to 42.97 during proof-9-base, from OneDrive's processes (`fileproviderd`, with `rtcreportingd`), not the proof's. On Orchestrator #26's ruling it was not re-run. It started below 8, and its readings are decoded pixels and state predicates, with no timing in them. The candidate side ran at 4.79–7.81.
- **Every job finished and every run exited 0** (each run's `conditions.txt`). The start and the range come from each run's 30-second `load.log`, the end from its `conditions.txt`, read as the run ended.

## 3. What changed: the card's time, from the index to the length made

- **The length made, measured before Create.** Pre-flight already decodes the whole kept sound, so it knows the sound's end (route A, section 5). It now also finds the picture's end. Where the index says the last declared packet arrived (every whole file and every Matroska file), that is the index's one read, which the encode already makes. Where it did not arrive (a cut MP4), it is one streamed read of the kept picture packets, with no decode, ending at the first missing packet. The made span is the later of the two ends less the kept start, with no margin. It is set outside pre-flight's analysis timer (`src/media/ends-early.ts`: `pictureMadeEndSeconds`, `madeSpanSeconds`; `PreflightSummary.madeSeconds`).
- **The card states it.** On the page, the span is bound to the ready verdict and cleared with the kept range. The card request carries it, and the line under the fields, `#submission-card-filled`, shows it only while the trim on screen is the one checked. Until then the line is withdrawn: hidden and empty, its words unchanged. Its `{running}` value is now the length made, a data correction, not new wording.
- **Never knowingly false.** In the worker, for Student submission only, a job with no span is refused before the card is drawn. After the encode and before its checks, a release guard compares the card's time with the encode's own span (`PipelineResult.madeSeconds`, `cardTellsMade`). A card that differs is refused before the output is retained or handed back. Both refusals are the existing `failure.unknown`.
- **Moved, not changed.** `formatClockTime` moved verbatim to `src/ui/clock-time.ts` and is re-exported from `src/ui/format.ts`.
- **The Node tests.** A sibling helper, `test/helpers/picture-pcm-mp4.ts`, builds cut and whole MP4s. There are 15 tests in `src/media/ends-early.test.ts`: the reader, the span's composition, and the guard's regression, where the last declared packet arrived but the encode's span is shorter, so the guard refuses. There is one in `src/ui/title-card-step.test.ts`. `npm run test` gave 83 files, 1,623 passed and 1 skipped; the base gave 1,607 passed and 1 skipped. Typecheck and eslint were clean on the changed files.
- **Nothing else.** No element, control, checkbox, listener, CSS or string, and no dependency.
- **The walker's change, made and proved before the before walk** (revision `198cfe660331f1bf` to `17727d3522f7270d`, in `$M/walker/` only). Four scenarios, `S-23s`, `S-23sn`, `S-23w` and `S-23wn`, with their plan (`PLANS.vh215`: 96 records in 24 setups) and expectations (`VH215_EXPECT`). `card-215.mjs` reads the output's burned card: `readBurnedCard` decodes the opening-card frame and matches it against the app's own `drawTitleCardFrame` renders of every running time, with no OCR and no dependency. `fixtures.sh` makes the cut WebM, VH-158's T90 of `a-vp9opus.webm`. Each scenario's own `wrap` is applied, as for every other scenario. S-23's Staff-ready scenario is kept. S-22 is untouched.

## 4. The readings

### 4.1 The burned card and the page's line, in every cell

The burned card is read from the output's decoded opening-card frame. The page's line is `#submission-card-filled` after the ready verdict, and its assert must pass in every record. "Declared" is what the page inspects. For the cut WebM that is 5.121 s, not its Matroska Duration element's 10.008 s, which the page doesn't use (VH-158's S2 fires for that reason).

| Scenario | Fixture | Closing | Cells | Declared (page) | Made | Before: card / line | After: card / line | Records ok, before / after |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S-23s | `cut-short-30s.mkv` | `cut` | 24 | 0:20 | 0:20 | 0:20 / 0:20 in all 24 | 0:20 / 0:20 in all 24 | 24 / 24 |
| S-23sn | `cut-short-30s.mkv` | `none` | 24 | 0:20 | 0:20 | 0:20 / 0:20 in all 24 | 0:20 / 0:20 in all 24 | 24 / 24 |
| S-23w | `cut-short-10s.webm` | `cut` | 24 | 0:05 (5.121 s) | 0:05 | 0:05 / 0:05 in all 24 | 0:05 / 0:05 in all 24 | 24 / 24 |
| S-23wn | `cut-short-10s.webm` | `none` | 24 | 0:05 (5.121 s) | 0:05 | 0:05 / 0:05 in all 24 | 0:05 / 0:05 in all 24 | 24 / 24 |

Each scenario's 24 cells are en-GB, zh-Hans and ms-MY at 1280 and 320 px, in light, dark, forced light and forced dark. One line per cell is in the group checks ([`walk-5b.check-6.txt`](vh215-records-2026-10-29/walk-5b.check-6.txt), [`walk-6.check-6.txt`](vh215-records-2026-10-29/walk-6.check-6.txt), [`walk-9a.check-9.txt`](vh215-records-2026-10-29/walk-9a.check-9.txt), [`walk-9b.check-9.txt`](vh215-records-2026-10-29/walk-9b.check-9.txt)) and in the 96 check, before beside after ([`cover-96-9.txt`](vh215-records-2026-10-29/cover-96-9.txt): cells 96, unchanged 96). The re-run's 72 records read the same in every cell ([`walk-10a.check-10.txt`](vh215-records-2026-10-29/walk-10a.check-10.txt) to [`walk-10c.check-10.txt`](vh215-records-2026-10-29/walk-10c.check-10.txt)). The card is the length made in every cell, before and after. On these fixtures that is also the declared length, which is why the walk cannot show the correction.

### 4.2 The job's time, beside VH-199's

The job's time runs from Create to the verified result being available, the post-encode checks included (the record's `jobMs`, the same for a job's four cells). VH-199 ran no job for these scenarios, so its column reads "Not measured — Staff ready verdict only; no job run"; its `setupMs` and `recordMs` are not job times and are not used. The table uses the re-run's time for the 14 after jobs owed one, and the after walk's own time for the other ten. Each window's load is from its run's `load.log`, from the last sample at or before the job's start to the first at or after its finish.

| Scenario | Language | Width | VH-199 | Before, ms (load) | After, ms (load) | Re-run, ms (load) | Used, ms |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S-23s | en-GB | 1280 | Not measured — Staff ready verdict only; no job run | 3,049 | 2,740 | — | 2,740 (after) |
| S-23s | en-GB | 320 | Not measured — Staff ready verdict only; no job run | 3,071 | 2,746 | — | 2,746 (after) |
| S-23s | ms-MY | 1280 | Not measured — Staff ready verdict only; no job run | 2,996 | 2,685 | — | 2,685 (after) |
| S-23s | ms-MY | 320 | Not measured — Staff ready verdict only; no job run | 3,026 | 2,723 | — | 2,723 (after) |
| S-23s | zh-Hans | 1280 | Not measured — Staff ready verdict only; no job run | 3,050 | 2,804 | — | 2,804 (after) |
| S-23s | zh-Hans | 320 | Not measured — Staff ready verdict only; no job run | 3,034 | 2,831 | — | 2,831 (after) |
| S-23sn | en-GB | 1280 | Not measured — Staff ready verdict only; no job run | 2,776 (2.78–2.88) | 2,684 (3.21–3.42) | 2,569 (2.82–2.89) | 2,684 (after) |
| S-23sn | en-GB | 320 | Not measured — Staff ready verdict only; no job run | 2,856 (2.78–3.11) | 2,592 (3.89–5.12) | 2,586 (2.89–3.22) | 2,592 (after) |
| S-23sn | ms-MY | 1280 | Not measured — Staff ready verdict only; no job run | 2,819 (2.69–3.13) | 2,487 (10.11–13.96), owed | 2,541 (3.18–3.65) | 2,541 (re-run) |
| S-23sn | ms-MY | 320 | Not measured — Staff ready verdict only; no job run | 2,873 (2.74–2.87) | 2,450 (8.96–10.11), owed | 2,566 (3.20–3.99) | 2,566 (re-run) |
| S-23sn | zh-Hans | 1280 | Not measured — Staff ready verdict only; no job run | 2,838 (2.94–3.11) | 2,633 (5.12–19.04), owed | 2,542 (3.68–4.04) | 2,542 (re-run) |
| S-23sn | zh-Hans | 320 | Not measured — Staff ready verdict only; no job run | 2,849 (3.13–3.19) | 2,539 (13.96–18.44), owed | 2,604 (3.65–3.68) | 2,604 (re-run) |
| S-23w | en-GB | 1280 | Not measured — Staff ready verdict only; no job run | 1,343 (3.07–4.81) | 1,219 (4.93–5.91) | 1,241 (4.78–5.25) | 1,219 (after) |
| S-23w | en-GB | 320 | Not measured — Staff ready verdict only; no job run | 1,344 (4.07–4.81) | 1,230 (5.59–5.91) | 1,214 (4.61–5.25) | 1,230 (after) |
| S-23w | ms-MY | 1280 | Not measured — Staff ready verdict only; no job run | 1,335 (2.84–2.90) | 1,225 (8.26–8.71), owed | 1,239 (4.26–5.06) | 1,239 (re-run) |
| S-23w | ms-MY | 320 | Not measured — Staff ready verdict only; no job run | 1,356 (2.77–2.91) | 1,236 (11.97–12.47), owed | 1,233 (3.99–4.14) | 1,233 (re-run) |
| S-23w | zh-Hans | 1280 | Not measured — Staff ready verdict only; no job run | 1,303 (3.74–4.07) | 1,193 (5.59–5.60), owed | 1,192 (4.61–4.79) | 1,192 (re-run) |
| S-23w | zh-Hans | 320 | Not measured — Staff ready verdict only; no job run | 1,316 (2.90–3.29) | 1,216 (7.48–8.26), owed | 1,238 (5.03–5.06) | 1,238 (re-run) |
| S-23wn | en-GB | 1280 | Not measured — Staff ready verdict only; no job run | 1,111 (2.91–2.95) | 1,128 (10.18–11.97), owed | 1,038 (4.28–4.38) | 1,038 (re-run) |
| S-23wn | en-GB | 320 | Not measured — Staff ready verdict only; no job run | 1,135 (2.50–2.68) | 1,021 (7.82–10.18), owed | 1,024 (4.28–5.53) | 1,024 (re-run) |
| S-23wn | ms-MY | 1280 | Not measured — Staff ready verdict only; no job run | 1,109 (2.19–2.72) | 1,059 (8.02–8.95), owed | 1,063 (4.67–5.46) | 1,063 (re-run) |
| S-23wn | ms-MY | 320 | Not measured — Staff ready verdict only; no job run | 1,032 (5.30–6.16) | 1,065 (7.45–8.24), owed | 1,059 (4.35–10.27, section 2) | 1,059 (re-run, kept on Orchestrator #26's ruling) |
| S-23wn | zh-Hans | 1280 | Not measured — Staff ready verdict only; no job run | 1,099 (2.47–2.50) | 1,037 (7.82–12.54), owed | 1,053 (5.53–6.35) | 1,053 (re-run) |
| S-23wn | zh-Hans | 320 | Not measured — Staff ready verdict only; no job run | 1,141 (2.19–2.47) | 1,105 (8.95–10.64), owed | 1,066 (4.67–4.90) | 1,066 (re-run) |

- **The S-23s jobs** ran in walk-5b and walk-9a before either load rose (walk-5b 2.69–6.68; walk-9a 3.21–6.66 until about 14:01:19Z), so none was owed a re-run. Their per-job load windows are not in `rerun-times-10.txt`, which covers the re-run's 18 jobs.
- **Per scenario, before against the times used:** S-23s 2,996–3,071 against 2,685–2,831 ms; S-23sn 2,776–2,873 against 2,541–2,684; S-23w 1,303–1,356 against 1,192–1,239; S-23wn 1,032–1,141 against 1,024–1,066. Every time used is at or below its scenario's before range. Against its own job's before, 23 of 24 are lower; S-23wn ms-MY 320 is 27 ms higher (1,059 against 1,032), within its scenario's range, and is the job Orchestrator #26's ruling covers (section 2).
- **Which jobs were owed.** The 14 are the after walk's own reading, from the times each job's four records were written, against its load log: S-23sn zh-Hans and ms-MY at both widths, S-23w zh-Hans and ms-MY at both widths, and all six S-23wn. S-23w zh-Hans 1280's records were written 14:07:40–14:08:12Z, with 7.48 in that window and 8.26 at 14:08:31Z just after, a borderline the after walk treated as above 8. The windows in the table are `times-10.py`'s, from each job's own start and finish events, which come before its records are written. That job ran 14:07:27–14:07:28Z, so it shows 5.59–5.60 there. The same two samples, 7.48 and 8.26, bound zh-Hans 320's job (14:08:17–14:08:18Z), whose records, written 14:08:25–14:08:42Z, the after walk read as above 8. Both were owed and re-run, and the re-run's time is used for both, like every owed job's, so no time used changes.
- **Whether the re-run came out identical.** In its readings, yes, in all 18 jobs. In its times, no job matched the after to the millisecond: the re-run less the after ran from −115 to +116 ms. The four en-GB re-runs of S-23sn and S-23w are shown beside the after's own, which the table uses, since their after windows stayed below 8.
- **What the job's time does not measure.** The added read is in pre-flight, before Create, so the job's time doesn't include it. Its cost is the route's timing (section 5). The job's time shows that the job stayed within the before's range.

### 4.3 The MP4 cut: the correction, before and after (the browser proof)

The proof runs in headless Chrome (Chrome/156.0.8078.74) under the walk lock, on each side's export, with the walker's own modules loaded read-only at revision `17727d3522f7270d`: `proof-8.mjs` (sha1 `881037ab…`) by the launcher `proof9.sh` (`577d60de…`). Its fixtures are `truncated-30s.mp4` (`a9abdd49…`), a 30-second MP4 cut short so its index declares 30 s while 21 s arrived, and `lecture-30s.mp4` (`599d7cbc…`), whole. Each case reads the burned card's running time from the output's decoded opening-card pixels, against reference renders of the expected time and the other time, with no OCR and no new dependency. **The read point** is the same on both sides. First the kind, the fields, the closing and the preset are set. Then the trim is typed into `#trim-start` and `#trim-end`, each committed by Tab. Then the proof waits, up to 120 s, for the verdict to be shown and the check finished, with the page's line shown with a clock time. It reads the line, and only then presses Create. "Base" reads the base's `export-7/` (content check [`before-source-check-7.txt`](vh215-records-2026-10-29/before-source-check-7.txt)); "candidate" reads `export-8-cand/`.

| Case | File | Kept | Output | Closing | Declared | Made | Base: card / page line / request | Candidate: card / page line / request |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T1 | `truncated-30s.mp4` | whole | best | `cut` | 0:30 | 0:21 | **0:30** / 0:30 / 0:30 | **0:21** / 0:21 / 0:21 |
| T2 | `truncated-30s.mp4` | 0:05–0:25 | best | `cut` | 0:20 | 0:16 | **0:20** / 0:20 / 0:20 | **0:16** / 0:16 / 0:16 |
| T3 | `truncated-30s.mp4` | whole | best | `none` | 0:30 | 0:21 | **0:30** / 0:30 / 0:30 | **0:21** / 0:21 / 0:21 |
| T4 | `truncated-30s.mp4` | 0:05–0:25 | best | `none` | 0:20 | 0:16 | **0:20** / 0:20 / 0:20 | **0:16** / 0:16 / 0:16 |
| T5 | `truncated-30s.mp4` | whole | smaller | `cut` | 0:30 | 0:21 | **0:30** / 0:30 / 0:30 | **0:21** / 0:21 / 0:21 |
| T6 | `truncated-30s.mp4` | 0:05–0:25 | smaller | `cut` | 0:20 | 0:16 | **0:20** / 0:20 / 0:20 | **0:16** / 0:16 / 0:16 |
| T7 | `truncated-30s.mp4` | whole | smaller | `none` | 0:30 | 0:21 | **0:30** / 0:30 / 0:30 | **0:21** / 0:21 / 0:21 |
| T8 | `truncated-30s.mp4` | 0:05–0:25 | smaller | `none` | 0:20 | 0:16 | **0:20** / 0:20 / 0:20 | **0:16** / 0:16 / 0:16 |
| C1, a whole file | `lecture-30s.mp4` | whole | best | `cut` | 0:30 | 0:30 | 0:30 / 0:30 / 0:30 | 0:30 / 0:30 / 0:30 |
| E1, a keep that ends before the damage | `truncated-30s.mp4` | 0:02–0:12 | best | `cut` | 0:10 | 0:10 | 0:10 / 0:10 / 0:10 | 0:10 / 0:10 / 0:10 |

- **The base draws the declared length** on every cut case, T1 to T8, so the card says 0:30 on a 21-second video and 0:20 on a 16-second keep. **The candidate draws the length made** on every cut case, with the closing on and off, in both outputs, trimmed and whole. The whole file (C1) and the keep that ends before the damage (E1) are unchanged.
- **Each reading is clear.** The card's distance to the render of the time it read was 2.02–2.45 on the base and 2.02–2.40 on the candidate, against 16.73–21.77 and 16.75–21.77 to the other time's render: at least 10 apart wherever declared and made differ. Every case reached the read point, finished, and had its page line and its card request equal to the time it read. Cases 10, failures 0, on each side ([`proof-9-base.proof.jsonl`](vh215-records-2026-10-29/proof-9-base.proof.jsonl), [`proof-9-cand.proof.jsonl`](vh215-records-2026-10-29/proof-9-cand.proof.jsonl)).
- **The base side's load** rose to 42.97 from OneDrive's processes, not re-run, on Orchestrator #26's ruling (section 2).

## 5. The route, timed on the largest fixture

The route was traced and timed on the base before the design, through the app's own modules on the page's main thread in headless Chrome, under the walk lock, on AC at 100%, power mode 2 (probe-4 to probe-6; probe-1 to probe-3 were set aside for faults in the probe itself). The four candidates for each track's real end before the card is drawn: **A**, the sound's end from pre-flight's existing pass; **B**, the picture's end from the index (`declaredExtent`, then, for a cut MP4, a bisection over packet reads); **C**, the picture's end by one streamed read of every video packet's bytes, with no decode; **D**, a streamed decode of the whole picture track. "The card drawn once both are known" inside the one encode is not a route: the card is the output's first frames, and the muxer refuses a timestamp earlier than the previous group's, so the card cannot be encoded after the content.

| File | Declared, s | A: sound end | B: index | C: packets | D: decode |
| --- | --- | --- | --- | --- | --- |
| The largest, whole: 4.55 GB, 3840×2160, 25 fps (probe-5) | 754.687 | 754.687, 2,527 ms | 754.68, 1 read, 2 ms | 754.68, 18,867 packets, 4,517,514,152 B, 2,880 ms | 754.68, 18,867 frames, 37,290 ms |
| The additional truncation timing: the second largest's first 70%, a 2.81 GB cut MP4 (probe-6, at low load) | 524.587 | 354.816, 1,618 ms | 355.08, 34 reads, 13 ms | 355.08, 1,440 ms | 355.08, 23,472 ms |
| The same cut, probe-5 (load 10.79 at its end, so re-run as probe-6, with identical answers) | 524.587 | 354.816, 1,458 ms | 355.08, 34 reads, 9 ms | 355.08, 8,877 packets, 1,714 ms | 355.08, 8,877 frames, 22,859 ms |
| `cut-short-30s.mkv`, S-23's (probe-4) | 20 | 19.925, 164 ms | 20, 1 read, 4 ms | 20, 500 packets, 4 ms | 20, 500 frames, 179 ms |
| `truncated-30s.mp4` (probe-4) | 30 | 20.843, 162 ms | 20.96, 42 reads, 3 ms | 20.96, 523 packets, 3 ms | 20.96, 523 frames, 134 ms |
| `lecture-30s.mp4`, whole (probe-4) | 30 | 30.016, 224 ms | 30, 1 read, 1 ms | 30, 750 packets, 4 ms | 30, 750 frames, 197 ms |

- **The route the build takes, and why.** The sound's end is A, pre-flight's existing pass, already paid. The picture's end comes from the index's one read wherever the last declared packet arrived, which is every whole file and every Matroska file: 2 ms on the 4.55 GB whole file. It comes from C, one streamed read of the kept picture packets with no decode, wherever the last declared packet's bytes are missing, as on a cut MP4: 1,440 ms on the 2.81 GB cut at low load. The build branches on that one fact, never on the container. Nothing holds the file: C streams the packets and stops at the first missing one. D, a second encode-sized decode at 23–37 s, was not taken. On the large cut the picture outlasts the sound (355.08 s against 354.816 s), so the length made needs both tracks, the later end.
- **The picture's read, as built.** The build takes C, one streamed read of the kept picture packets, wherever the index shows the last declared packet's bytes missing, and the index's one read elsewhere, with the release guard behind both.
- **The power mode** was the same in every probe as in every walk and proof here (section 2).

## 6. WCAG, re-checked for what VH-215 touched

VH-215 touches one thing a person meets on the page: the value in the line under the submission card's fields, `#submission-card-filled`, and when that line is shown. Its words are unchanged. The readings below compare the before walk's 96 records with the after walk's 96, cell by cell ([`instr-13.txt`](vh215-records-2026-10-29/instr-13.txt), by [`instr-13.py.txt`](vh215-records-2026-10-29/instr-13.py.txt)), and the 24 job cells' exposure logs, before against after ([`exposure-13b.txt`](vh215-records-2026-10-29/exposure-13b.txt), by [`exposure-13b.py.txt`](vh215-records-2026-10-29/exposure-13b.py.txt)).

| Criterion | Reading | Result |
| --- | --- | --- |
| 1.3.1 Info and relationships | the line keeps its element and place: a `p.helper` in the card's fieldset, after the fields, outside every live region, with no role, label or relationship added or removed. While it is withdrawn it is `hidden` and empty, by the page's existing `paintLine`, so it leaves the accessibility tree as it leaves the screen. At the read point, after the ready verdict, it is shown with its clock time in all 96 records, before and after (section 4.1). `ax` passes in 96 of 96 cells before and after, with 0 problems on either side | holds |
| 2.4.6 Headings and labels | no heading, legend or label changes: the diff touches no markup and no language table. The card's title and fields are as before, and `ax` passes in 96 of 96 before and after | holds |
| 3.1.5 Reading level | no word changes, in any language. The line's words are the table's own; only its `{running}` value, the length made, differs, and only where the index declares more than arrived (section 4.3: 0:21 and 0:16 where the base said 0:30 and 0:20). The two new refusals use the existing `failure.unknown` words | nothing to re-read, since no wording changed. The reading level stays a person's to confirm (spec §9.3), a limitation, as before |
| 4.1.3 Status messages | the line is not a status message and sits in no live region, and VH-215 adds no live-region write. In the 24 job cells, every live-region text and node write is the same, in the same order, before and after (24 of 24). Two things differ. The line's own `hidden` is set once when it is withdrawn and removed once at the ready verdict in each job, outside any live region (with 128 re-sets to the value it already had, over the 24 jobs). And the nine card errors' `hidden`, inside their live regions, is re-set to the value it already had one time fewer per job, with no text written. At the read point the live regions are the same in 95 of 96 cells. In the 96th, S-23sn zh-Hans 1280 light, the video player's own `buffering` group is missing after: it shows only in the light cells, where the job runs and the player has just loaded, and the re-run's same cell has it, equal to the before. That is a timing reading in the player, not VH-215's. The two refusals reach the page as the existing `failure.unknown`, by the `JobFailureError` path the worker's other failures take; no walk cell or proof case refuses (sections 4.1 and 4.3), and the guard is proved by its Node regression (section 3) | holds as exposure; what a screen reader says is the person checklist's task A, a limitation |
| The other instruments (1.4.6, 1.4.8, 1.4.10 and the rest) | every instrument's outcome is the same in every cell, before and after. `overflow` passes in 48 of 48 cells at 320 px, with no horizontal scroll. `measure` gives 80 pass and 16 cannot-determine on each side, and `contrastText` passes in 96. `targets` and `type` fail in all 96 on each side: page-wide outcomes that VH-215 does not touch | unchanged |

**The tokens rule holds.** The diff touches no CSS, no token file, no markup and no language table. `tokens.carbon.css` and `tokens.brand.css` are unchanged and still apart. No element, control, checkbox or listener is added, and no line of the diff touches the progress bar. The new numbers in `src/` are zeros and one log field's rounding to the millisecond, `Math.round(x * 1000) / 1000`, the form the base's logs already use (`src/media/audio-plan.ts:247` and `src/media/pipeline.ts:340` at the base), not a threshold. The burned card is drawn by the unchanged `drawTitleCardFrame`: only its running time differs.

**Exposure, not speech.** The walker records what the page writes and exposes, not what a screen reader says. What a screen reader says is the person checklist's task A.

## 7. What these cells do not walk

- **The MP4 cut** is not one of the walk's fixtures. The criteria name S-23 and the cut WebM, and an MP4-cut walk scenario would be S-22's ground, which this item leaves untouched. The MP4 cut is covered by the browser proof (section 4.3) and the Node tests (section 3). S-23's and the cut WebM's unchanged cards are not evidence of the correction (section 4.1). S-22 read as Student submission is owed to VH-203's after-run.
- **The 200% enlargement, the `spacing` and `font32` modes and the 375 px view** are outside this item's matrix. VH-215 changes no layout rule, no CSS and no markup (section 6): the line under the card's fields keeps its element, its place and its words, and its value keeps its clock form (`formatClockTime`, moved verbatim, section 3).
- **The two refusals,** a job with no span and the release guard, are not walked: no walk cell or proof case refuses, and the guard is proved by its Node regression (sections 3 and 6).
- **What a screen reader says** is the person checklist's task A. The walker records what the page writes and exposes, not speech (section 6).

## 8. The records folder

- **The walks, one cell per line:** the group checks `walk-5b.check-6.txt` and `walk-6.check-6.txt` (before), `walk-9a.check-9.txt` and `walk-9b.check-9.txt` (after), and `walk-10a.check-10.txt` to `walk-10c.check-10.txt` (the re-run). Each gives the manifest's tally, one line per cell (status, asserts, the job's outcome and time, the card's read against made and declared, the page line's assert) and the group's records and jobs tallies. There are also the two 96 checks, `cover-96-6.txt` (the before) and `cover-96-9.txt` (after against before, cell by cell). The walker's own records, tens of MB a group with their captures, stay outside the repository in the side folder, `/Users/joe/UoN-Video-Helper-side/vh215-walk/`.
- **Provenance:** each walk group's `conditions.txt`, `.load.log.txt`, `.launcher.log.txt`, `manifest.json` and `run.json` (`walk-5b.conditions.txt` and on), and walk-10d's launcher log; the three content checks, `before-source-check-6.txt` (the before's export), `before-source-check-7.txt` (the proof's base export) and `cand-source-check-8.txt` (the candidate's export).
- **The comparison:** `rerun-times-10.txt` (by `times-10.py`): per job, the after's, the re-run's and the before's times with their load windows, the 14 owed, Orchestrator #26's ruling and the summary.
- **The proof:** `proof-9-base.*` and `proof-9-cand.*`: `conditions.txt`, `load.log.txt`, `launcher.log.txt` and `proof.jsonl` (one start line, ten case lines, one end line).
- **The route:** `probe-4.*` to `probe-6.*`: `conditions.txt`, `load.log.txt`, `launcher.log.txt` and `results.jsonl`.
- **The scripts,** each kept as `.txt`: the launchers `walk6.sh`, `walk9.sh` and `walk10.sh`; the readers `check6.py`, `check9.py`, `times-10.py` and `cover-10.py`; the proof's `proof-8.mjs` and its launcher `proof9.sh`; `export8.sh`, which made the proof's two exports; and the route's `probe.sh` and `route-probe.mjs`.
- **`sources.txt`** gives each file's sha1 and its source in the side folder; every copy matches its source.
