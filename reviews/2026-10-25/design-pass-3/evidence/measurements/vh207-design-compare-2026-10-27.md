<!-- markdownlint-disable -->

# VH-207 — the design choice: Claude's reading and Codex astra's, compared

Claude's reading saved 20:41:28Z (`vh207-claude-design-2026-10-27.md`); Codex's brief started 20:42Z, blind to it; its answer saved 20:43Z (`vh207-codex-design-2026-10-27.md.txt`) and opened after Claude's was saved, at about 21:00Z.

## Agreed
- Save → the re-rendered Save (the criterion).
- The player → the same player, put back in the re-rendered card.
- The card → the re-rendered card.
- A saved card `clearResult` takes away → the file input.
- One local capture in the change handler, with the existing guarded hand-on; no element, no words, no other caller.

## Disagreed, and settled on the evidence
1. **The "discard it?" question (its panel, Discard, Keep).** Claude: the file input. Codex: the restored card. **Settled for Codex.** The re-render here has the same outcome as "Keep it": the question goes and the result it interrupted is restored (main.ts's own comment on the re-render, VH-79). The code already names a successor for that outcome, the card (`fromKeep(renderResult(unsavedResult))`, :2833). Claude's distinction (keeping is the person's own choice) is one of intent, not of what is on the page, so it does not outweigh the existing successor.
2. **The handler's earlier withdrawals** (Stop the check and Check again, `offerStop(null)`; the read summary and its disclosure, `clear(sourceReport)`; the block panel and the verdict, `clear(sourceBlock)`, `withdrawVerdict()`; Create's row, `processActions.hidden`). Claude: outside the criterion's "they", so a wish line. Codex: inside "At the choosing", captured before the first of them. **Settled for Codex.** The item's Intent says "Choosing the file is itself part of the transition"; spec §9.3 says "a transition that removes or disables the focused control names its successor"; the brief reads the criterion as covering "controls the choosing disables or replaces"; and Codex finds the named successors are cases, not an exhaustive list. A wish line may defer work only where every criterion is met, which this reading does not allow. They are built: captured at the top of the handler, before anything is withdrawn, each container that is emptied or hidden (not a surviving step), handed to the file input. No variant walks them (the walker changes are fixed at (a) to (f)); they are proved by reading and by the eight routes, and the close says so.

## Codex only / Claude only
- None beyond the above.

No disagreement is left for the owner.
