<!-- markdownlint-disable -->

# VH-208 — Codex astra's blind design check (brief)

You are Codex astra, the project's read-only reviewer. Read only the repository you are run in, at its HEAD, `a87e0f520f52cd5920f826cbceadec6ef852ffc2`. Read nothing outside it: no notes folder, no other checkout, no network. Change nothing.

## The item

`project/items/VH-208.md` is the contract. Read it in full first. In short: the finished video's card must give its warnings before its player, its lifetime line and Save, in DOM and visual order alike, in one notification treatment (never one notification nested in another, never two rails, VH-150), and the completion's live-region write must carry the heavy-limiting warning's existing detail whole after its heading, from the existing strings. No element, control, checkbox or string may be added, and no string split. The item's line numbers predate two commits; the anchors at HEAD are below.

## Where to read (at HEAD)

- `src/main.ts`: the completion write, about `:3122–3129` (`warningsSpoken(t().warnings.finishedHeading, outputWarnings)`); `renderResult`, about `:3301–3549` (the player and the lifetime line about `:3335`, `resultWarnings` at `:3338`, `paint` about `:3348–3378` with `processResult.replaceChildren(heading, resultWarnings)` at `:3377`, Save's actions row about `:3544–3547`). The pre-flight sound panel is `renderWarnings`'s other caller, about `:1659`.
- `src/ui/warning-text.ts` (`renderWarnings`, `:113`) and `src/ui/announce.ts` (`warningsSpoken`, `:40`).
- `src/i18n/en-GB.ts`, the `warnings` block (heavy limiting about `:725–729`), and the `warnings.spoken` templates in `src/i18n/zh-Hans.ts` and `src/i18n/ms-MY.ts`.
- `test/screen-text.test.ts` about `:310–315` (VH-150's pin) and `src/ui/announce.test.ts` about `:31–35`.
- `src/styles/` (the two token files and our own CSS) for what a change of place would cost in tokens.
- `UI-STANDARDS.md`: notifications, warnings, live regions and reading order. `project/digests/carbon.md`, `nielsen.md`, `wcag-2.2-aaa.md`.
- `docs/01-specification.md` §9.1 and §9.3 (read only).
- The pass's walker, `reviews/2026-10-25/design-pass-3/evidence/measurements/walker/`: `phase8.mjs` (`warnBox` about `:59`, the completion check about `:833–848`), `prove-8.mjs` (fixtures about `:141–175`), and `scenarios.mjs`, for the selectors and asserts that read the card, its player, Save and the warnings.
- VH-150, VH-192 and VH-193's item files and decisions, for what must be kept.

## What to answer

1. **The options.** Name every layout of the card that could meet the first acceptance criterion, as DOM order and painted order, and say for each how it keeps one notification treatment and one rail.
2. **For each option:** what it costs in elements, classes and tokens; what it does to the accessibility tree (regions, names, the card's focus target); what it does to Save as the one primary and to the notification's actions row (Carbon); what it does to the other caller of `renderWarnings`; and which walker selectors and asserts in `phase8.mjs`, `prove-8.mjs` and `scenarios.mjs` it breaks or needs qualified, by file and line. Say which of those the item's criteria already name as changes and which they don't.
3. **The completion line.** How the write should carry heavy limiting's detail whole after its heading, from the existing strings, in en-GB, zh-Hans and ms-MY, and where the change belongs (`warningsSpoken`, its caller, or elsewhere); confirm the other warnings stay heading-only and that Announce progress off writes the same line (S-151). Name the pre-flight caller's effect, if any.
4. **Paint and the other states.** How the chosen order holds for a "Previous video", after "Keep it", after a save (the player leaves, VH-192) and after a page-language change (`paint`).
5. **Your pick,** with its reason, and anything the item cannot meet as written under any option, with the evidence.
6. **Risks** to VH-193 (the warning first among the warnings, word for word, before and after a save) and VH-192.

Cite file and line for every claim. Keep the answer under 1,200 words. Write it as your final message; it is saved verbatim.
