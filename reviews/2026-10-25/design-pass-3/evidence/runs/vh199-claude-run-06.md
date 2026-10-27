<!-- markdownlint-disable -->
<!-- VH-199: Claude's own reading of run-06, saved before Codex's, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

# VH-199 run-06 — Claude's reading (VH-199 #4, Opus 5.5)

Formed from the records at 01:20–01:30Z on 2026-10-27, before Codex astra was briefed on run-06.

Run: `$V/runs/run-06-2026-10-27T00-08-59-773Z-753cf3`.

## Whole

**No: 335/338, held at its count.** `check-run.mjs` reads:
- expected 338, observed 338, keys `a03ac8db01629e9b` (expected = observed);
- `whole: false`, with three `problems`, all `failed`;
- 335 `ok` and 3 `failed`, all 338 at revision `2e7b0c044ce11f2b`;
- source `a3039c3`, Chrome 156.0.8078.48, no visible-page flag missing.

Walked 00:08:59–01:07:55Z. Six resumes, 01:07–01:20:25Z, added +6, +4, +4, +4, +1 and +0; the last stopped NO-PROGRESS. Every start and resume was on AC with Low Power off. Load was 7.6 at resume 1 and 19.9 at resume 6, none of it ours.

## Attribution

- **47 attempts in `superseded/` over 19 S-95 keys:** a new grouping-type scenario ("Onset help closed by Tab"). In each group the first (light) record is ok. Later modes fail the state predicate: focus not on `#closing-colour input:checked`, with the help closed. Resumes recovered them one per group. All 19 are ok now.
- **S-55c__{en-GB,ms-MY,zh-Hans}__w1280__fallback** failed on the walk and on all six resumes, with 18 attempts in `superseded/`. Each reads "setup: timeout waiting for boot" at about 30.7 s. This is **the known `fallback` × Fetch-routed fault interaction, an instrument gap**, not an app finding:
  - `withholdFonts` puts the `fonts` route first (`qualify.mjs:1017`, `match: () => true`).
  - F6b's pattern `*closing-*` (`faults.mjs:167`) also pauses the app's module `/src/ui/closing-choice.ts`.
  - `fonts` takes that request and fails it, and the app never boots.
  - My read-only probe (`vh199-4-probe-s55c.mjs`) shows, per language: routes [fonts, F6], F6b saw nothing, and the only non-font request failed was `closing-choice.ts`.
  - The other S-55c modes, F6b included, are ok.
- **Measurement fails on ok records: none.** No instrument outcome on any of the 335 ok records reads `fail`, asserts included. `digest.md` has no "fail:" line. Its 657 "cannot determine" lines are the declared person-check and geometry kinds, for example the trim discs' 44 × 44 hit box and painted pseudo-elements.

## Stop?

Nothing that should stop the evidence run. No app rank 1 problem and no coverage reduction. The one instrument gap is of run-04's known kind, held for the owner's ruling, with Orchestrator #8 told at 01:22Z.

## Verdict

**Fit as evidence for VH-199, with the three S-55c fallback records named as a gap**, as run-04's S-107 was.
