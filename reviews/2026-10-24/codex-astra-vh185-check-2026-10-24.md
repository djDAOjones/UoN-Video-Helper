# Codex astra check — VH-185, 2026-10-24

`codex exec -m gpt-6-astra -s read-only` on `codex-astra-vh185-brief-2026-10-24.md`, against the candidate on b8a4063. Its reply, verbatim:

Commit after the musts below

1. **must — Align pre-flight and encoding ranges (AC1–2 not fully met).** `src/workers/job.worker.ts:523` measures the requested range; `src/media/pipeline.ts:302` first expands it to picture-frame edges. At 25 fps, keeping to 4.10 s with decoded audio starting at 3.71 s means **390 ms before Create, 410 ms during planning**: “no audio”, then an audio track. Confirmed using the existing clipping/snapping functions at both sample rates. Classify the same effective range on both sides and add this regression.

2. **may — Threshold arithmetic is correct.** `src/media/audio-plan.ts:112` uses the meter’s exported constant (`src/audio/loudness.ts:35`), without another literal. Exactly 17,640 frames at 44.1 kHz and 19,200 at 48 kHz divide to the same `0.4`; equality proceeds to levelling. Clipping rounds to integer samples. Strengthen `src/media/sub-block-sound.test.ts:58` with both rates, ±1 sample, and exact-block **planning**; the current planning test keeps 500 ms.

3. **may — Return-type handling passes.** All production/spike callers discriminate `KeptSilence`: `src/workers/job.worker.ts:525`, `src/media/pipeline.ts:360`, `src/spike/aac-cost.ts:132`, `src/spike/estimate.worker.ts:116`. Remaining plan truthiness checks operate on narrowed `AudioPlan | null`; optional decode-end reads are valid for both variants.

4. **may — Early-end handling passes, subject to the existing margin.** `src/workers/job.worker.ts:538` preserves the measured end; `src/media/pipeline.ts:545` seeds it and `:830` still compares the original audio track. Nothing decoded remains `null`, so declared-but-missing content still warns before and after; a wholly decoded sliver does not. `src/audio/warnings.ts:91` correctly prioritises ends-early over no-audio.

5. **may — Counting damage-silenced frames is correct.** `src/audio/decode-damage.ts:99` zeros samples without removing frames; `src/media/audio-plan.ts:194` therefore counts decoded duration correctly. Gap-fill and chain flush are excluded. The damage gate’s final held source block is correctly included through `:229`.

6. **may — Focal regression and stage rule pass inspection.** `src/media/sub-block-sound.test.ts:25` models the decoded priming sliver and its assertions reject the old result. The supplied Chrome record reports 42/42 passing (`reviews/2026-10-24/vh185-sliver-2026-10-24.md:18`). No controls, elements, tokens or user-facing words changed; `docs/`, `UI-STANDARDS.md` and `test/ebu3341/` are untouched.

7. **must — Complete AC3–5 at close.** `project/items/VH-185.md:11` still requires the unchanged EBU harness and green gate, plus the digest rule and `Checked:` line. Carry the explicit **no audio track; priming discarded** statement into the close (`reviews/2026-10-24/vh185-sliver-2026-10-24.md:26`). Nielsen **5, error prevention**, applies. I ran neither walker nor gate.

## What was done

- Must 1: `keptRangeOnFrames` (src/media/pipeline.ts) places the range on frame edges for both the job and pre-flight's sound pass (src/workers/job.worker.ts), so both judge the same sound; a regression test keeps 4.10 s of a 25 fps picture with sound from 3.71 s (390 ms asked, 410 ms placed). Re-checked in Chrome: 9 of 9 (three languages at 320 px in light, and the six jobs).
- May 2: exact-block planning tested; the ±1-sample and 44.1 kHz cases are not, since the PCM helper writes 48 kHz only, and the arithmetic divides exactly at both rates, as Codex confirmed.
- Must 7: this close — the gate green, the EBU harness unchanged, no audio track and the priming discarded, Nielsen 5 named.
