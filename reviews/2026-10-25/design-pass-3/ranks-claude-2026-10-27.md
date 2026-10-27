<!-- markdownlint-disable -->
<!-- Claude's merge and ranks for VH-201 (2026-10-27), saved as vh201-claude-ranks.md before Codex astra's blind ranking ran, verbatim. -->

# VH-201 — Claude's merge and ranks, saved before Codex astra's blind ranking

VH-201 #1, 2026-10-27. Written from VH-200's judged file, the contract, the matrix, the digests, the run records under `E` and the source at HEAD `86b1200` (whose `src/` is `a3039c3`'s but for VH-205's stylesheet). Nothing here was shown to Codex astra.

## The merge: Codex astra's blind review (`codex-astra-blind-review-2026-10-25.md`) against VH-200's draft

| Codex | Verified | Merge |
| --- | --- | --- |
| D-05, VH-185 calls omitted sound "no audio" (rank 1) | In source at HEAD: `keptTooLittleSound` (`src/media/audio-plan.ts:115–121`) counts decoded frames, sound and never gap-fill (`:103`); the unit tests make 50 ms of generated PCM sound kept to 1.5 s a silent keep (`src/media/sub-block-sound.test.ts:61–70`), and 390 ms as asked silent, 410 ms on frames levelled (`:97–110`). The notice's words: `src/i18n/en-GB.ts:670–674`. In the run: S-99 ×31 shows "This video has no audio" and its detail before Create (S-99 en-GB w1280 light, ax nodes 538–539), but on N8a, whose kept sliver is 21.3 ms of encoder priming, not real sound; S-100 ×6 finishes with no plan. A kept sliver of real sound under 400 ms was not walked: the branch is the same (`silent: true` → `noAudio`) | Kept as its own: **V-51**, rank 1 |
| D-06, VH-193's advice after the action (rank 2) | In source at HEAD: the card holds its lines, the player and the lifetime line (`src/main.ts:3285`), then Save in its actions row (`:3494–3497`); the warnings follow the card (`:3327`); the completion line speaks titles only (`src/ui/announce.ts:42–46`, called at `main.ts:3077`). In the run: S-135 en-GB w1280 light (run-04) reads, in the accessibility tree, the region "Finished video — 7.5 MB", its lines, the Video, the lifetime line, "Save the video", then the region "Worth knowing about the finished video" with "The loudest moments were held down hard" and its detail; the completion line was "Your video is ready. Worth knowing about the finished video: The loudest moments were held down hard." | Kept as its own: **V-52**, rank 2 |
| V-46 / VH-178, incomplete (rank 2; originally D-01, no new number) | Live in the run: S-149 ×3 (light, three languages): a Video language radio focused, `notvideo.mp4` chosen, the read fails, `trimHidden` and `titleHidden` true, focus `body`, no moves. Source: `clearTrim('unreadable')` (`src/main.ts:1486`, `1500`) withdraws with no `focusHeldBy`; the blocking branch has it (`:1595`) | Merged into **V-46**, regressed, rank 2 |

No D-nn is set aside. Codex's "What only a browser or a person can settle" names no finding; its failed-playback case is read under F15b (S-132, S-152 ×12: the host named "Unable to play media.", the warning standing) and stays a person's check.

## The findings and Claude's ranks

| ID | From | Rank | Why this rank |
| --- | --- | --- | --- |
| V-51 (D-05) | Codex D-05; VH-200 | 1 | Misled: a person who hears sound in the preview is told the recording has none, and the new video drops it. Not silent loss, since the notice comes before Create |
| V-52 (D-06) | Codex D-06; VH-200 | 2 | Real friction: the precaution is read after the player and Save, and is not spoken; a save then removes the player |
| V-46 | Codex V-46; VH-200; S-149 | 2, regressed | 2.4.3: focus lost to the page; no work lost |
| V-48 | VH-200, Codex's attribution | 2 | 2.4.13 at the larger default font UI-STANDARDS names: 460 of 464 px², author-styled box, rectangular reference right |
| V-49 | VH-200, Codex's attribution | 2 | 2.4.13 in a forced palette, as V-42 was |
| V-18 | Phase 7, incomplete | 2, incomplete | Same ground as Phase 7, narrowed. Phase 7's disposition was "accepted on the owner's standing instruction", with wish VH-175.4; whether that acceptance stands for Malay at 1280 and for 320 px is the owner's |
| V-50 | VH-200, Codex's close check must 2 | 3 | Real friction, but no adopted rule asks for it (1.4.10 at the default size; 1.4.4 allows scrolling) |

Not findings: the 32 px radio ring (box reference, disc passes), S-81's wrapped statement link (enclosing-box reference), S-127's player rings (background unread), F15b's host name (Chrome's, true of the state). Each instrument reading is missing evidence for VH-203's after-run (wish VH-200.1).

Totals: 7 findings, 1 at rank 1, 5 at rank 2 (two under old IDs), 1 at rank 3. None needs a new control, checkbox or element. V-51's words are the owner's to approve.
