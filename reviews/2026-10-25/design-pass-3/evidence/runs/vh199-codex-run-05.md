<!-- markdownlint-disable -->
<!-- VH-199: Codex astra's blind attribution of run-05 (codex exec -m gpt-6-astra -s read-only), from vh199-codex-run-05-brief.md; the reply, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

**Whole: yes, structurally.** Independent verification found 383/383 records, all `status: ok`, with passing before/after state checks and no missing declared subjects. The frozen plan and declarations match; both recomputed key hashes are `fd518996af140300`. Every record uses revision `2e7b0c044ce11f2b`, which also matches the frozen files. Source is clean `a3039c3`; Chrome is 156.0.8078.48, with no required visibility flags missing.

The interruption accounts for 123 records: 104 ok and 19 failed attempts. Five resumes reach 383; the four retained S-121 records have the stated 21:00 timestamps.

I read the manifest, run declarations, all current and superseded JSON records, digest failures, both logs, frozen walker, relevant app code, VH-199 criteria and S-92 mutation captures.

- **All 47 superseded files, covering 19 S-92 keys: known grouping pattern.** Every failure is a later record within its group, with focus on `body` instead of `#trim-end-range`. There are 19/13/9/5/1 superseded attempts across attempts 1–5. Fresh setups recover every key; none counts as a pass.

- **S-92’s 31 failed assertions: instrument fault, distinct from grouping.** `lastPress` is recorded after the keys, while `STATUS_SINCE` counts only changes to the status text. The app announces Checking immediately in `commitTrim()`, then writes the same text when the delayed preflight begins. The observer suppresses that identical text, yielding zero despite a completed recheck. All 31 mutation captures show Checking followed by a settled verdict. An in-memory probe of the frozen observer reproduced the false zero. This counter cannot establish that exactly one check ran. Evidence: `scenarios.mjs:1521,1653–1655`, `phase8.mjs:85`, `src/main.ts:1534,1904–1912`.

- **S-132’s four light records: expected fault-injection pattern.** F15b deliberately revokes the player URL. Both failed rows—not just metadata loading—follow: `MediaError 4` and Chrome’s accessible name “Unable to play media.” replacing the card title; control inventory is consequently undetermined. Scenario assertions and all save subresults pass, including a 1,091,493-byte saved file. Evidence: `scenarios.mjs:2237–2261`, `faults.mjs:230–234`, raw player/subresult rows.

- **S-113’s six overflow failures: app findings for VH-200.** At font32, all three languages overflow at w320 and w401: scroll widths 520 px English, 528 px Malay and 444 px Chinese. Raw offender measurements identify switches, trim buttons and closing-colour controls.

- **Four focus failures: expected app measurements for VH-200.** S-110 font32 in all three languages measures 284/304 px²; S-113 Malay w320 font32 measures 460/464 px² on the onset help button. These apply the WCAG digest’s 2.4.13 area rule; they are not instrument faults.

**Stop:** S-92’s check-count instrument needs correction, requalification and replacement evidence before accepting this run as complete evidence. Structural completeness does not validate that assertion. No coverage reduction or app rank 1 problem is demonstrated; the other evidence remains usable.

**Not fit**