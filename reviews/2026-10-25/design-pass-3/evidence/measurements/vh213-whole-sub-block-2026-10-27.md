<!-- markdownlint-disable -->
# VH-213's before and after — a whole video with less than 400 ms of sound, 27 October 2026

This is [VH-213](../../../../../project/items/VH-213.md)'s stage-rule measure: S-102's strengthened predicate declared and proved, then every cell measured before and after. The records are in [`vh213-records-2026-10-27/`](vh213-records-2026-10-27/). The none-decoded control, `whole-none`, was added on 28 October after Codex astra's blind check (section 6); its records are in [`vh213-records-2026-10-28/`](vh213-records-2026-10-28/). Section 7 lists what changed here after that check.

## 1. Provenance

| | Before | After |
| --- | --- | --- |
| Source | `5893d9d`, a `git archive` export (the worktree was not at base), labelled `5893d9d-archive` | the worktree `side/vh213` at `5893d9d` plus the candidate's unstaged diff, 16 files, `git diff --binary` sha1 `cd985a8d4dcf…`, labelled `5893d9d+vh213-cd985a8d4dcf` |
| App `src/` / walker tree (sha256/16) | `9c47759f40f4020b` / `50ca03e0540b29a3` | `f6f370581d326565` / `bfa144b6c464ad6f` (only `scenarios.mjs` differs) |
| Serving | Vite 8.2.2, 127.0.0.1:5181 `--strictPort`; headless Chrome 156.0.8078.48, CDP 9251, own profile; Node v24.21.0 | the same |
| Main run | 22:12:24–22:20:54Z; AC, power mode 2; 1-minute load 3.73–9.72; 5 groups flagged above 8 (8.10–9.72: S-101 en-GB 1280, whole-cut en-GB 320, zh-Hans 1280 and 320, ms-MY 1280) | 22:21:19–22:30:02Z; AC, power mode 2; load 6.66–19.07; 45 of 54 groups flagged above 8 (8.07–14.4 at their start; 19.07 at the end check, which carries no raw flag, since the probe flags a group's starting load only) |
| Low-load re-run | not re-run (see the load judgement) | the whole after, 23:15:58–23:24:40Z; AC, power mode 2; every group at 3.11–7.67, no flag; headless Chrome had updated to 156.0.8078.74. All 54 groups read the same as the main run, load stripped (`after-rerun-*.json`, `rerun-summary.md.txt`), so neither the load nor the browser patch changed an outcome |
| Predicate proof | — | 22:21:13–22:21:19Z; AC, power mode 2; load 6.78 → 7.32 |

**The load judgement.** The after's main run started 45 of its 54 groups above the probe's own flag line (1-minute load 8), the before 5, so the after was re-walked whole at low load, as VH-206 re-ran its high-load groups. The before's five flagged groups started at 8.10–9.72, near the line (VH-206's own low-load re-run accepted 8.03): one in S-101, whose other five groups gave the same outcome, and four in whole-cut, whose two unflagged groups (en-GB 1280 and ms-MY 320) gave the same outcome. Because the probe reads the load at a group's start, two before groups straddled the line without a flag: S-99 ms-MY 320 (7.72 at its start, 8.14 at the next reading) and whole-cut en-GB 1280 (5.09, then 8.10). So whole-cut's only group wholly under 8 is ms-MY 320 (7.97, then 7.57). They were not re-walked: in each cell every before group gave the same outcome whatever its load, and the outcomes compared are qualitative, not timings. Before and after ran in the same power mode, on AC. *Corrected on 28 October (Codex astra's should 3): this paragraph first said the flagged groups sat "in two cells whose other five groups gave the same outcome", and it missed the two straddling groups and the end check's 19.07.*

**Fixtures:** the walker's own recipe lines, verbatim (`fixtures-vh213.sh`), and four whole-video controls on the same picture and tone. Each was proved by ffprobe and ffmpeg alone, with no app code (`prove-fixtures-213.mjs`, `fixtures-proof.json`): all nine PROVED. The re-run's fixtures were rebuilt with the candidate's walker and proved again, identical but for their timestamps (`fixtures-proof.vh213-3.json`). On 28 October a tenth was added for the none-decoded control, with its own predicate. The nine earlier fixtures rebuilt byte-identical, and all ten were PROVED (`fixtures-proof.vh213-5.json`, in `vh213-records-2026-10-28/`; section 6).

| Fixture (sha256/16) | Cell | What decodes |
| --- | --- | --- |
| `late-sound-9.7s-10s.mp4` 80c9e7776e345639 | S-102 | AAC from 9.68 s of 10 s, untrimmed: 16,384 samples, 341 ms |
| `whole-pcm-390ms-10s.mov` 5dd09b602ef6537c | whole-390 | 16-bit PCM from 9.61 s: 18,720 samples, 390 ms |
| `whole-pcm-400ms-10s.mov` 8dbef979864fa16b | whole-400 | from 9.60 s: 19,200 samples, 400 ms, exactly one block |
| `whole-pcm-410ms-10s.mov` cbaf30849097c58a | whole-410 | from 9.59 s: 19,680 samples, 410 ms |
| `whole-pcm-cut-10s.mov` cd0277b392eb0fe6 | whole-cut | tone from 0, the file cut at 196,622 bytes: 15,360 samples, 320 ms, 10 video frames, of the 10 s its index declares |
| `whole-aac-empty-10s.mp4` ae7306f0e0fdd1a8 | whole-none (section 6) | nothing: an AAC track that holds no sample, 0 packets indexed, 0 samples decoded; 250 video frames, 10 s |
| `silent-10s.mp4` 300cc12d64341acc | S-20 | no audio track |
| `late-sound-10s.mp4` 7c57a6ad93218f3c, `late-sound-3.4s-10s.mp4` 1d6c169c1705fe9e, `late-sound-3.71s-25fps-10s.mp4` cd20254060f8d292 | S-99, S-101, S-153 | VH-206's trimmed cells |

**Cells:** S-102, S-101, S-153 and the four whole-video controls run as jobs; S-20 and S-99 are pre-flight only. Each in en-GB, zh-Hans and ms-MY, at 1280 and 320 px, each group reading light, dark, forced light and forced dark: 54 groups each side. `whole-none`, a job, was walked on its own, 6 groups each side (section 6). The before used the base export's walker, the after the candidate's (`whole-213-probe.mjs`, `walk-213.sh`).

## 2. S-102's predicate, declared and proved

The approved walker change, S-102 only (`scenarios.mjs`): its state was `M.finished() || M.res() === 'failure'`, an outcome recorded, not judged. It is now `M.finished()`, the owner's chosen outcome required, and three assertions are added: before Create, the whole video's note and no other no-audio note or ends-early (`WHOLE_NOTE`); no plan to level; the finished file's tracks read, one video and no audio (`outputTracks(w)`, ffprobe on the bytes the card's player holds, nothing saved).

The proof (`predicate-proof-213.mjs`, `after-predicate-proof.json`, `proof.log`) ran on the candidate page before any after read, in each language. The note expression is true for the whole video's heading alone, and false for the no-track, part-kept, ends-early and empty states. The state expression is true for a finished result on both walkers, and for a failure on the base walker only. The tracks read gives 1v0a on `silent-10s.mp4` and 1v1a on `late-sound-3.4s-10s.mp4`, and each assertion fails its control. Outcome: "as expected".

## 3. Before and after, per cell

| Cell | Before (all six groups) | After (all six groups) |
| --- | --- | --- |
| S-102 | pre-flight: no note; the job fails late, `loudness-out-of-range`, −36.7 LUFS; no file | "This video has too little audio to level", alone; the job finishes silent; 1v0a; its three assertions pass |
| whole-390 | no note; fails late, `loudness-out-of-range`, −35.7 LUFS | the whole video's note, alone; finishes silent; 1v0a |
| whole-400 | no note; levelled, −16.31 LUFS, 1v1a | unchanged |
| whole-410 | no note; levelled, −16.21 LUFS, 1v1a | unchanged |
| whole-cut | "The file ends early"; fails late, `invalid-measurement` | "The file ends early", unchanged; finishes silent; 1v0a |
| whole-none (section 6) | no note; fails late, `missing-audio`; no file | the whole video's note, alone; finishes silent; 1v0a |
| S-20 | "This video has no audio" | unchanged |
| S-99 | "The part you kept has too little audio to level" | unchanged |
| S-101, S-153 | no note; levelled, 1v1a | unchanged |

Every group read the same in all four modes; every reached state passed; no console or page error in any group. The full diff is `compare-before-after.json`: only S-102, whole-390 and whole-cut differ. whole-none, walked apart, differs too (section 6).

### The words (after, every mode and width)

| | Heading | Detail |
| --- | --- | --- |
| en-GB | This video has too little audio to level | It has less than half a second of sound, too short to level, so the new video will have no audio. Your original file keeps its sound. |
| zh-Hans (machine-translated) | 此视频的音频太少，无法调节音量 | 它的声音不到半秒，太短，无法调节音量，因此新视频将没有音频。您的原始文件仍保留声音。 |
| ms-MY (machine-translated) | Video ini mempunyai terlalu sedikit audio untuk diratakan | Bunyinya kurang daripada setengah saat, terlalu pendek untuk diratakan, jadi video baharu tidak akan mempunyai audio. Fail asal anda masih mengekalkan bunyinya. |

These are the item's drafts verbatim. The panel title stays "Worth knowing about the audio" (值得了解的音频特性, Perlu diketahui tentang audionya), with its tail "None of these stop you continuing. Your original file is not changed either way."

whole-cut's note, before and after, is VH-139's: "The file ends early", "Its audio stops at 0:00 of 0:10. The file was probably cut off while it was copied or recorded. After 0:00, the new video will be silent. If you have a complete copy, choose that one instead." (and its zh-Hans and ms-MY forms).

### Lines and measure (S-102, whole-390 and whole-none, identical)

| | 1280 px: lines (heading + detail); longest line | 320 px: lines; longest line |
| --- | --- | --- |
| en-GB | 1 + 2; 71 characters | 2 + 5; 31 (corrected from 33 on 28 October; section 7) |
| zh-Hans | 1 + 2; 32 CJK (weighted 32) | 2 + 4; 13 |
| ms-MY | 1 + 3; 66 characters | 3 + 7; 29 |

No overflow and no horizontal scroll in any group; the walker's reader passes every line.

### Jobs (after; the same at both widths in each language)

| Cell | Output check (worker) | Output file tracks (ffprobe: start, duration) | Plan; gain |
| --- | --- | --- | --- |
| S-102, whole-390, whole-cut, whole-none | verified, `{"audio":"none-in-kept-range"}` | 1: video h264 (0, 14 s); **no audio track** | 0 planned; silent |
| whole-400 | verified, −16.31 LUFS, −13.9 dBTP, on target | 2: h264 (0.04, 14 s), aac (9.6, 0.469333 s) | 1; 19.3 dB |
| whole-410 | verified, −16.21 LUFS, −13.9 dBTP, on target | 2: h264 (0.04, 14 s), aac (9.59, 0.490667 s) | 1; 19.3 dB |
| S-101 | verified, −16.24 LUFS, −13.67 dBTP, on target | 2: h264 (0.04, 8 s), aac (3.378667, 0.704 s) | 1; 19 dB |
| S-153 | verified, −16.47 LUFS, −13.46 dBTP, on target | 2: h264 (0.04, 8.12 s), aac (3.688667, 0.512 s) | 1; 19.3 dB |

The before's S-102, whole-390, whole-cut and whole-none failed the output check after the whole encode, with "The finished audio did not come out at the usual level, so the video was not kept." Every after job finished and announced "Your video is ready." (您的视频已准备就绪。 / Video anda sudah siap.).

## 4. WCAG re-checked for what changed

| Criterion | The after's evidence | Result |
| --- | --- | --- |
| 4.1.3 Status Messages | `#status` announces the panel title and the new heading, "Worth knowing about the audio: This video has too little audio to level.", in every language, mode and width; at the end, "Your video is ready." | met |
| 2.4.6 Headings and Labels | The heading names its topic and its cause, distinct from the no-track heading ("This video has no audio") and the part-kept one ("The part you kept has too little audio to level"), in the same element | met |
| 3.1.5 Reading Level | `grade-213.mjs`, with [`test/readability.test.ts`](../../../../../test/readability.test.ts)'s own `readingGrade` (Flesch–Kincaid, limit grade 10): the heading (8 words, 1 sentence) 5.2, the detail (27 words, 2 sentences) 5.0. zh-Hans and ms-MY are machine-translated and not graded | met (en-GB) |
| 1.4.8 Visual Presentation | Longest line 71 (en-GB) and 66 (ms-MY) characters at 1280 px, against 80; zh-Hans weighted (CJK 1, Latin ½) 32 at 1280 and 13 at 320, against 40 | met |
| 1.4.10 Reflow (read, not listed) | At 320 px, no element past the viewport or clipped, no horizontal scroll, in all four modes | met |

**Tokens and elements:** no CSS changed and no element added; the note uses the existing warning panel.

## 5. Records

[`vh213-records-2026-10-27/`](vh213-records-2026-10-27/) holds 52 files (4.8 MB): the before, the main after and its low-load re-run (`after-rerun-*`), the proof, the fixture proofs, the reading grades, the full compare, the three summaries and the scripts. The JSON records and the summaries carry scratch paths that include the local user name, so the summaries and the proof log are kept as `.md.txt`. The saved videos were not kept.

| File | sha256 |
| --- | --- |
| after-S-101.json | 3e49b823cee945dd56bcaf3da575ad56bcd72b3fcbd2e0f4a126492d6b386849 |
| after-S-102.json | 5130dc9b660f95d5dfd76ff55724053c9c2721ee25c7042be508909d3e8a9532 |
| after-S-153.json | 22a9d9941668ca66fa3a27138c4c6e2724b6254768cd81132f9055e1eccebbc9 |
| after-S-20.json | cf74a30d3e1e6edde39feb2c6cc69acfbee78d6dc20f47d8157ec46fd6c028ef |
| after-S-99.json | b0611686b30ea8b89706e2fbbf4942f984f8bd6adfecb5d946fccc99fc4ed5fc |
| after-predicate-proof.json | ec2f2b311a8293b3850e4df42c25843ec27773b20740d71a05a4953402334977 |
| after-predicate-proof.md.txt | d0d81b6aa80012df3d2f950359762a8a7506eff8edf42a2e10754d2d98d915fe |
| after-rerun-S-101.json | b953a9e87f210cbf41c2cde9f98001fda4a396cea17841b6b612a2279660cd39 |
| after-rerun-S-102.json | 1dec6f0a10c324c85a60e7db9131c580bb35d60d135d880099fe5e9d8da72bed |
| after-rerun-S-153.json | 4ddb718c5c4f9aa35cf894f2430b43522116ec3ed3fe7dc29361838f6c569b79 |
| after-rerun-S-20.json | 8a3055b4d7a6906eafe64339041673cbd92de1cdc479de6b10872dc328cebede |
| after-rerun-S-99.json | 0fcd7203c38fb2e6b8769e79b1cce3ac38f556d6d1e9fe651aa7f4d4d404b790 |
| after-rerun-run.json | 3f0bdc32542340a02db11dd835bb595b0115de42bfadfba05e084d962f63a448 |
| after-rerun-whole-390.json | 4ef68c1d016de2356c19d56850c0bec6777bd698398b43102d74dab33b0b0d80 |
| after-rerun-whole-400.json | d1aaa391c439e779229b395fae6da7d55959c00437fd47307dcf9e889c1c9441 |
| after-rerun-whole-410.json | 6cc5302c2da0781860e550176de494379e360c239b888e22f527793f60e4413a |
| after-rerun-whole-cut.json | 66ebfef23ebf0f467a4d7d4846294b87fba93cb988d2c37f1566e5bc70970bb9 |
| after-run.json | 8f16131233f0c0e8d346e0e114635690bf3c0f4d76d5267060d0a1c9aa22018e |
| after-summary.md.txt | 99644d903adfa4ae110faa1277f06bb787b623f1302c1b0769cfd7528c221f11 |
| after-whole-390.json | b896f124296e3ed69e120d32ab03c3754a37dedc22cc50a48731b364b805d00b |
| after-whole-400.json | 1e1f8dc8ad2081d8b7334ce580f6257703f77df984b8709083c4dc3c126aa3fe |
| after-whole-410.json | 6d44b45f77be569123ab5ff12d0de61f531c276ac63a3b65ba6982f0a9940eb4 |
| after-whole-cut.json | 17dbd42b397e9e574e85430e5cdb175fb7d63f3c62135eb8538e0907c7be6105 |
| before-S-101.json | 73bfe5ada843356ebbdaa5ae61b6138d389174f81d859b1880c84d3a9d1a8792 |
| before-S-102.json | 35a03673192e0ec345019254bcc2abfca08dadbcbedf43fe1d10801c2b092e6e |
| before-S-153.json | 356abfc577967606da95ef0317a564a69c6a8a962cf494d3aa75912fc7314dd3 |
| before-S-20.json | c48637468b3cd7ba5e847c36d727fb0ecd09b85c3d827192c41b1062d1465b71 |
| before-S-99.json | ba9a0188887b5ed20b7c5f92bdc96e7ac53376f066e2e9cda5229e2c4160f4dd |
| before-run.json | 8db236a5b53723f471a4eb6e517accdc615c39e7f652c73bcbc6483fd1ba5b5c |
| before-summary.md.txt | f4df6146956a20e5ce12f7ea55abc0594132343af1ea9c28b24aa8b9d6b8e9b0 |
| before-whole-390.json | 9d788a693a8d978818f327a428bc5e387d79db79a4013ce886e27cbb6b9d4b61 |
| before-whole-400.json | 2fa715dec396e7e3ed725b3cdbe5aa1d6fb38d239eaab11cd1a89bc309d25211 |
| before-whole-410.json | c897f3c4a1c410c0f75eaf11c14127935a28952fcfe509de23bc559f4e09d163 |
| before-whole-cut.json | 33eb5ac7e75e3428b9341b443f7c1d094d535800cb9feeac909ffe60ad118f83 |
| compare-213.mjs.txt | 5812eb6e64b65ef979bb8528834c8d35de73400bbb77b93af9298c93b491ab09 |
| compare-before-after.json | 843ddd39649ce2fed6817f9a12347dfd5b0dc114e6d7a20c0e59daba2625aae1 |
| extract-213.mjs.txt | 77b539b78217253c9b1df5d75bd08135e370dd1c17efe89b94e33270d9ee8b72 |
| fixtures-proof.json | ec18f2e65982da372ebe7ecba916161bc402b339e6412d05ee39e46554209e03 |
| fixtures-proof.vh213-1.json | db4f9bf1c5e9f9260c0a3749e3ef551daf576396978330e1c0e6244e8afec8f0 |
| fixtures-proof.vh213-3.json | 597b39172adcc09d6a21c10ae09d9bcd7961cb87a8c65f559c7994cbc01660a0 |
| fixtures-vh213.sh.txt | 44f182800aef2279b80391e4cedfe3cc07b56efe0cb2154e3b80f9211ce7ff88 |
| grade-213.jsonl | eb08dba74afca54548ec1a365f45feb656037cd35ea49e506e8aeecb00c27d01 |
| grade-213.mjs.txt | bbfb07c5db68fa4a047f9e205c9dcd4a15b12212e39a943cde338237bd0cdcc2 |
| predicate-proof-213.mjs.txt | 0f817ce69dc008bdfb2d7454d7c489fab26c1428f1ebae02e8c766a70905e201 |
| prove-fixtures-213.mjs.txt | 816803d08a0a3dff70fb904d7fc467084a3351318f6f41b35d8f097c9c3e9cfb |
| rerun-213.sh.txt | 014ccb532bafc399878d830725d015a4d41699d68d12e4b1af3c1f3eb184cccd |
| rerun-summary.md.txt | 3fee262fa28b10f6ff82bb909a55bbab24ad140ead83b1a56baa923a11d3ffb3 |
| servers.sh.txt | 5891a88cfed84787d320a95946947d0d2187bb1e4c0498a834accff77310e9db |
| summarise-213.mjs.txt | 8eb58aaa46247eaa9e95daefa6f10d6e0d6c10b475f733463ec94963da607928 |
| take-lock.sh.txt | 5e2ab7245004c27f14ab7d01b0216197baa67c5ae51bd55ec89e705e8cdc3e34 |
| walk-213.sh.txt | ecd730644a2434eb889584fbc7ff7f206ff8ed04342b094ee31188a0c6652a5d |
| whole-213-probe.mjs.txt | 5ead8068bcd71029dcf7856d841d45fd9be41121833036c75b495cd03ec04449 |

## 6. The none-decoded control, `whole-none` (added 28 October)

Codex astra's blind check (its must 2) found the item's "none decoded" control unmeasured. The cells had no track (S-20), just under (whole-390, S-102), exactly (whole-400), just over (whole-410) and a cut file, but no audio track that decodes nothing. VH-213 #5 added that control, declared and proved before any after read.

**The fixture.** `whole-aac-empty-10s.mp4` (sha256 `ae7306f0e0fdd1a8…`, 3,174,124 B) is the walker's 10 s picture with an AAC track that holds no sample: a fragmented MP4 (`empty_moov`), from `anullsrc` with `d=0`, with `negative_cts_offsets` keeping the picture at 0–10 s. Its recipe is in `fixtures-vh213.sh` (sha1 `d71e448457a4`). Two builds were byte-identical, and the nine earlier fixtures rebuilt byte-identical to section 1's.

**Its proof, by ffprobe and ffmpeg alone,** is a new predicate in `prove-fixtures-213.mjs` (sha1 `49e6a33deb79`; the same edit reads an absent packet list as empty). It requires an AAC track present, 0 audio packets indexed, 0 samples decoded, 2 streams, 250 video frames decoded, and the video declared at 9.99 s or more. All ten fixtures were PROVED (`fixtures-proof.vh213-5.json`). A read of the file's boxes (`boxes-213.py`, `whole-aac-empty-boxes.txt`) agrees: the moov declares track 2 (`soun`) with 0 samples and duration 0, and the one fragment carries track 1 only, with 250 samples. ffprobe's declared 10 s for the audio is its own fill from the format.

**The cell.** `whole-none` is a job in the probe's cells (`whole-213-probe.mjs`), with a `what:` that declares it. It ran in 3 languages × 2 widths, each group reading light, dark, forced light and forced dark, with the output file's tracks read by ffprobe on the saved bytes.

**The runs.** `walk-none-213.sh before|after` waits for a load under 8, takes the lock afresh and checks power by the contract's Power test. It checks the ports after the lock, walks `--cells whole-none` and stops its servers by PID.

| Run | When (Z, 28 October) | App | Power | 1-minute load at each group's start, then the end check | Outcome, all 6 groups × 4 modes alike |
| --- | --- | --- | --- | --- | --- |
| `before-none` | 09:22:32–09:23:33 | base, the `5893d9d` export | AC 100%, mode 2 | 6.19, 8.28, 7.55, 7.08, 6.14, 5.50; 5.18. Flagged: en-GB 320 (8.28). Straddled without a flag: en-GB 1280 (6.19, then 8.28) | "Ready to go", no note; the job fails after the encode, "The finished audio did not come out at the usual level, so the video was not kept." `[dev: Output audio failed verification: missing-audio]`; no file |
| `before-none-batt` | 10:32:16–10:33:16 | the same | battery 97 → 96%, mode 2 | 5.55, 6.66, 9.50, 12.77, 13.25, 14.09; 14.45. Flagged: zh-Hans 1280 and 320, ms-MY 1280 and 320. Straddled without a flag: en-GB 320 (6.66, then 9.50); the end check is unflagged | the same as `before-none` |
| `after-none-batt` | 10:36:18–10:37:22 | the candidate, `5893d9d+vh213-cd985a8d4dcf` | battery 96 → 95%, mode 2 | 6.20, 6.98, 6.37, 5.62, 5.07, 4.60; 4.36. None flagged, none straddled | "Ready to go" with "This video has too little audio to level" alone, before Create, in each language; the job finishes silent and announces "Your video is ready." (您的视频已准备就绪。 / Video anda sudah siap.); output check verified, `{"audio":"none-in-kept-range"}`; the file has 1 video track (h264, 0, 14 s, 350 frames) and **no audio track**, 3,664,983 B; 0 planned |

**The pair is `before-none-batt` with `after-none-batt`:** both on battery, power mode 2, above 50%, under the contract's Power test. The Mac had moved to battery by 10:31Z, so the before was re-walked there to match the after's mode. `before-none`, on AC, stays as an earlier reading of the same outcome.

**The load account.** The battery before's load rose during its run, so 4 of its 6 groups started above 8 (9.50–14.09), one more straddled the line, and its end check read 14.45 with no raw flag. Their outcome equals that of its own first group, wholly under 8 (5.55, then 6.66), and of all six groups of the AC before, which started at 5.50–8.28. The after has no flag and no straddle. The outcomes compared are qualitative, not timings.

**The instrument between the runs.** Between the AC before and the battery pair only the power gate changed. The probe and the walk script took the contract's Power test (on AC, or on battery above 50% and not in Low Power) in place of AC only. Their sha1s at the AC before are in `probe-script-sha1-at-ac-before.txt` (`whole-213-probe.mjs` `9b6ddbf7636c`, `walk-none-213.sh` `6210149cba01`); at the pair they were `15bc666e285c` and `e3c41719a928`, the copies kept here. The AC before's two versions themselves were not kept, only their sha1s; VH-213 #5 recorded that the probe's reads did not change. The walker was `50ca03e0540b29a3` (base) and `bfa144b6c464ad6f` (candidate), and the app `src/` `9c47759f40f4020b` and `f6f370581d326565`, as in section 1; headless Chrome 156.0.8078.74.

**Words, lines and WCAG.** The after's note is section 3's words verbatim in each language, with the same lines and longest lines as S-102 and whole-390. In pre-flight, `#status` announces "Worth knowing about the audio: This video has too little audio to level." (in each language). Every group had no overflow, no horizontal scroll and no console or page error, and every reached state passed. Section 4's results hold for it.

**Records.** [`vh213-records-2026-10-28/`](vh213-records-2026-10-28/) holds 15 files (532 KB): the three runs, the fixture proof, the boxes read and the scripts as VH-213 #5 ran them (as `.txt`). `servers.sh` is unchanged from `vh213-records-2026-10-27/servers.sh.txt`. The JSON records carry scratch paths that include the local user name. The saved after videos were not kept. Their sha256/16s are in `after-none-batt-whole-none.json`.

| File | sha256 |
| --- | --- |
| after-none-batt-run.json | db807cf41c1e46704cb25da6be7d4f810f88fd6135e1ff6e29dafc6dbf5ad2f5 |
| after-none-batt-whole-none.json | b75e9b022f8bed313035cc4385693bc6dd578a66edf5e432b187ee9f5bb81944 |
| before-none-batt-run.json | 620beca1cd03efd471f9cc527baf940e755b5b50fda96946e03472dd6e4a054e |
| before-none-batt-whole-none.json | 8a92c2a98d73bfc9d97dd07449e2a48d1e66365e9452763bcd89eb9dfaf3717f |
| before-none-run.json | c48732f7303974ca7bd92ef784e03d7862bf0b7cd7f242f79661aef838eca1cd |
| before-none-whole-none.json | d4ab8be5c03c5b35efb724a4e8a3174ec5da301801eafbbb65fdee954a9679be |
| boxes-213.py.txt | b77f5c06f046e543b3970b30355d8fa9c5317ec907b8e57e11c5d0179f863231 |
| fixtures-proof.vh213-5.json | d71eb2ca595b488c5457b781e36e15dcbf3ffe21d219661b41f94d910fcb61b7 |
| fixtures-vh213.sh.txt | edb2708bc30e486a3d2313a4a7b2d1776f0d9adf0b0c60e04af8baf700dd6228 |
| probe-script-sha1-at-ac-before.txt | 700438ec03d7fb7f71979ef687c8a757338604cd495a1c70d1f858bf1531417b |
| prove-fixtures-213.mjs.txt | 5774f1dd857eefbae4205d61bd9962ae593effcf2e12be1ccd119251b4303741 |
| take-lock.sh.txt | 328a1d7dd2673680d45a46ce7a0137de8afdba940075296246acbb956fddc144 |
| walk-none-213.sh.txt | 5588bfe2a50b3947f84dab4c13dd5983bf39a3d358416933c7ba9640e7f684b3 |
| whole-213-probe.mjs.txt | 47126f0077c7008cd5f7d332265bcd064bc84b35a213532739a9621b0d2239bb |
| whole-aac-empty-boxes.txt | 32d3d8a0a49f4b1a98a1f1819a11bd2c7be19bd6f4f15f6f6b294ea26230605e |

## 7. After Codex astra's blind check (28 October)

- **Must 2, the none-decoded control:** measured, in section 6.
- **Should 3, the load account:** section 1's load judgement is corrected, and the Main run row notes the end check's unflagged 19.07.
- **Must 1, a partly decoded file that ends early:** the owner answered on 2026-10-28 at about 09:57Z, in his own turn to Orchestrator #19. Verbatim: "Yes, all three". He was answering "Go ahead on all three as recommended?", whose first point was VH-213's must 1, option (a): a wish line for both paths, and VH-213 closes without the repair. So nothing measured here changes for it. Wish VH-213.1 records it for a kept part and a whole video alike: when a job will be silent and the file ends early, the note says the whole new video has no audio.
- **A slip corrected:** section 3 gave the en-GB longest line at 320 px as 33 characters. The records (`after-S-102.json`, `after-rerun-S-102.json`, `after-whole-390.json`) and whole-none's read 31.

## 8. Landing (28 October)

VH-213 was rebased from `5893d9d` onto `39a56bc`, past VH-207, VH-208 and VH-225's PLAN-8 entry. The rebase changed none of VH-213's code, tests or walker lines: for each of its files outside `project/`, the lines it adds and removes are the same before and after the rebase. `scenarios.mjs` and `src/ui/warning-text.ts` merged without conflict beside VH-208's lines. So no cell is re-walked, and the evidence above stands as measured on `5893d9d`, the owner's accepted trade-off; VH-203's after-run measures the combination.
