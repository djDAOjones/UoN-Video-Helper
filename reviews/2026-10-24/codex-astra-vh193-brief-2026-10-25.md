# Codex astra brief — VH-193, a warning after the job when levelling needed heavy limiting, 2026-10-25

You are checking one Phase 8 item's candidate diff in this repository, read-only. The base is commit cdb37ba. The candidate is the working tree against HEAD: `git diff`, plus the new walker `reviews/2026-10-22/design-pass-2/evidence/measurements/walker/heavy-193.mjs`. Do not run the walker or the gate; both run outside your check, and their results go in the commit.

The item is `project/items/VH-193.md`: read its acceptance criteria in full. Its words are the Phase 8 wording sheet's row B11 and corrections S25 and S32 (`reviews/2026-10-24/phase-8-wording-sheet-2026-10-24.md`). The owner approved them, so they are final; do not propose rewording them. Phase 8's rule is that the app stays simple: no new control or element. The owner settled two open points, verbatim: "1A and 2A: heavy limiting first, before the metadata warning; after a save the warning stays as it is, with no new words".

What the candidate does, in outline:

- `src/media/audio-plan.ts`: `AudioPlan.limiterBiteLu`, unrounded: `solution.unlimitedLufs + solution.gainDb − chainLufs`, where `chainLufs` is the last limited pass's loudness before the codec. It is `null` when that figure or the unlimited one is not finite. The 'chain planned' log carries it rounded, beside `limitedLufs`.
- `src/config/audio.ts`: `HEAVY_LIMITING_LU = 3`.
- `src/audio/warnings.ts`: the `'heavy-limiting'` code, and `detectProductionWarnings({ limiterBiteLu, metadataCarried })`, which returns the post-processing warnings in the owner's order: heavy limiting over 3 LU, then `metadata-lost`.
- `src/media/pipeline.ts`: `outputWarnings` comes from that function in place of the inline metadata push. It travels through the worker, `protocol.ts` and `main.ts` unchanged, as the metadata warning does.
- `src/ui/warning-text.ts`: the code maps to `warnings.heavyLimiting`. `src/i18n/en-GB.ts` holds B11; the zh-Hans and ms-MY rows are agent drafts, through the filled sheet and `scripts/strings-table.mjs`.
- `docs/01-specification.md` §5.4: S25 and S32.
- Tests: `src/audio/warnings.test.ts` (threshold, null, NaN, order), `src/ui/warning-text.test.ts` (B11's words), `src/media/sub-block-sound.test.ts` (the plan's bite matches the logged figures), and a fixture line in `src/media/audio-plan.test.ts`.

Check, giving file:line:

1. Each acceptance criterion: met or not, and why.
2. The bite. Is the last limited pass always run at `solution.gainDb` (`src/audio/gain-solve.ts`)? Consider the converged return, the last-pass break, a non-finite pass, and the probe's re-measure under a lowered ceiling. Is `chainLufs` ever stale or from a different gain? Is the codec cost rightly left out? Can the bite be negative, or misleading when macro-levelling is on?
3. The order and the after-save state. Is heavy limiting always shown and spoken before the metadata warning? Does anything after a save, download, language change, "Keep it" or "Previous video" change or drop the warning?
4. Anything else built on `outputWarnings` or `AudioWarningCode`: the diagnostics bundle, the record, an exhaustive switch, the announcement's count. Does the bite in `detail` reach any log, bundle or URL that the no-egress rule forbids?
5. The spec: exactly S25 and S32, words unchanged? Is anything else in the spec, `UI-STANDARDS.md`, `project/architecture.md` or the statement now false?
6. The translations: does either draft change the meaning, the advisory tone, or add blame?
7. The walker and the tests: any check that would pass when the behaviour is wrong?

Give a verdict line first: "Commit", "Commit after the musts below", or "Do not commit". Then give numbered points, each marked Must, Should or May.
