# Codex astra check — VH-186, 2026-10-24

`codex exec -m gpt-6-astra -s read-only` on `codex-astra-vh186-brief-2026-10-24.md`, against the candidate on b9dd97f. Its reply, verbatim, but that each "](" of its absolute file links is written "]\(" so the link checker reads them as text:

Commit after the musts below

1. **must — Complete verification and the close.** [VH-186.md:13]\(</Users/joe/Library/CloudStorage/OneDrive-TheUniversityofNottingham/_Joe Bell UoN Files/2_Projects/2026-08-24 UoN Video Helper/project/items/VH-186.md:13>): AC5 remains pending. Record the required Chrome matrix, green gate including `tables.test.ts`, decision, trajectory, digest rule and commit’s `Verify:`/`Checked:` lines. The backlog deletion alone is not a close. I ran neither walker nor gate, as instructed.

2. **must — Complete AC2’s call-site inventory.** [format.ts:88]\(</Users/joe/Library/CloudStorage/OneDrive-TheUniversityofNottingham/_Joe Bell UoN Files/2_Projects/2026-08-24 UoN Video Helper/src/ui/format.ts:88>): the list omits `formatApproximateDuration`, which directly reads `unknown` and `fewSeconds` and calls `formatDuration`. Record it as using the lowercase form, currently called only by tests. No other production caller was missing.

3. **may — AC1 and AC3 are met.** [en-GB.ts:802]\(</Users/joe/Library/CloudStorage/OneDrive-TheUniversityofNottingham/_Joe Bell UoN Files/2_Projects/2026-08-24 UoN Video Helper/src/i18n/en-GB.ts:802>) matches B1 exactly; opfs/worker remain unchanged. [source-panel.ts:80]\(</Users/joe/Library/CloudStorage/OneDrive-TheUniversityofNottingham/_Joe Bell UoN Files/2_Projects/2026-08-24 UoN Video Helper/src/ui/source-panel.ts:80>) appends the existing passage with `sentenceGap()`, introducing no sentence or element. The stage rule holds: no control/token added; docs and UI-STANDARDS untouched. Applied Nielsen’s plain language, consistency, minimalism and recovery rules.

4. **may — AC2’s implementation is sound; correct the comments.** [format.ts:32]\(</Users/joe/Library/CloudStorage/OneDrive-TheUniversityofNottingham/_Joe Bell UoN Files/2_Projects/2026-08-24 UoN Video Helper/src/ui/format.ts:32>) and `en-GB.ts:973` imply handles use capitals, contradicting the deliberate choice. Keeping `trimHandleText` lowercase is reasonable: it is spoken, outside the criterion’s named panels, and matches its siblings. `variesOnAverage` places `{rate}` first, technically sentence-initial, but inspection rejects invalid rates before rendering; no reachable lowercase “unknown” regression was found.

5. **may — AC4’s wording is met; test status awaits the gate.** [zh-Hans.ts:687]\(</Users/joe/Library/CloudStorage/OneDrive-TheUniversityofNottingham/_Joe Bell UoN Files/2_Projects/2026-08-24 UoN Video Helper/src/i18n/zh-Hans.ts:687>) and [ms-MY.ts:741]\(</Users/joe/Library/CloudStorage/OneDrive-TheUniversityofNottingham/_Joe Bell UoN Files/2_Projects/2026-08-24 UoN Video Helper/src/i18n/ms-MY.ts:741>): no wrong sense found; 输出/keluaran are appropriate. Draft markings and sheet/table changes agree; Chinese brackets remain full-width without preceding spaces. No keys or tests were removed. Minor formatting: the CSV mixes line endings; `git diff --check` flags line 495.

6. **may — Qualify the estimate claim.** [preflight-panel.ts:132]\(</Users/joe/Library/CloudStorage/OneDrive-TheUniversityofNottingham/_Joe Bell UoN Files/2_Projects/2026-08-24 UoN Video Helper/src/ui/preflight-panel.ts:132>): positive infinity reaches this fallback through `very-long-job`; the `long-job` infinity test uses an artificial reason/estimate pairing. Valid estimates and existing null handling stay unchanged. One incidental wording difference: the existing Chinese fallback at `zh-Hans.ts:506` changes 您 to 你, so the change is not strictly confined to the time phrase.

## What was done

- Must 1: this close — the gate green with `tables.test.ts`, the 72-case Chrome matrix (`vh186-words-2026-10-24.md`), the decision, the trajectory line, the digest rules named, and the `Verify:` and `Checked:` lines.
- Must 2: `formatApproximateDuration` is listed in the call sites, lower-case, called only by tests.
- May 4: the comments in `src/ui/format.ts` and `src/i18n/en-GB.ts` no longer say a handle takes the capital.
- May 5: the filled sheet is CRLF throughout again, as `toCsv` writes it.
- May 6: noted — the `long-job` case with an infinite estimate is constructed; `very-long-job` is the reachable path. The Chinese 您/你 difference between `longJob` and `longJobUnknown` is the existing table's, unchanged here.
