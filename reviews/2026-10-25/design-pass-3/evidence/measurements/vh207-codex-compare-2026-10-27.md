<!-- markdownlint-disable -->

# VH-207 — Claude's verdict and Codex astra's blind check, compared, 27 October 2026

Claude's verdict (`vh207-claude-verdict-2026-10-27.md`) was saved at 22:15:26Z, before Codex's answer was opened. Codex ran blind from `vh207-codex-blind-brief-2026-10-27.md`, started at 22:15:13Z; its answer, `vh207-codex-blind-2026-10-27.md.txt`, was saved at 22:20Z and opened after Claude's. Claude: "Commit". Codex: "Commit after the musts below".

## Agreed
- Both read-failure paths: one capture in `clearTrim('unreadable')`, before the lock and the hiding; whole-step containment.
- The guards and every other caller unchanged: `renderResult`, `clearResult`, "Keep it", `withdrawDiscardQuestion`; (f1) and (f2) held.
- Save → the re-rendered Save; F20 proved; the unit-test alternative; 176 records each side; the rings; the routes; no element, CSS, token, dependency or test changed; the digest rules.

## Codex only, and what was done
1. **"Use the whole video" (`#trim-clear`) missing from the choosing's capture** (must 1). Correct: `renderTrim()`, under the reading lock, disables it too. Repaired: added to the capture. Proved by a read-only probe from the walker's own modules, the (b) steps with that control placed, before (the base export) and after, in four colour modes at 1280 and 320 px (`probe-trimclear-*.json`).
2. **"By keys"** (must 2). Not repaired; answered on the evidence. `focusByKeyboard` is the pass's qualified instrument (VH-198), which S-149's own read-failure branch uses. The criterion names (a) as that branch. The eight routes walk real Tab and Shift+Tab traversal, and they are unchanged. The hand-on reads `document.activeElement`, which is the same however focus arrived, and the Shift press sets keyboard modality for `:focus-visible`. Put to Codex's re-check.
3. **The next Tab after the ring instrument** (must 3). Not re-walked; answered on the evidence. In every before cell of (a) to (e), and in every (f2) cell, focus was on the body, so no ring instrument ran before the Tab (`focus on the body: no ring to read`, ×144). In every cell where it ran, it put focus back on the same element (`ring.back` true, ×144 after and ×24 for (f1) before). The Tab therefore starts from the focused element itself, as it would untouched. The probe reads the Tab before any instrument. Put to Codex's re-check.
4. **The before's source identity** (must 4). Repaired with content evidence: `before-source-check.json`. 1,497 of the 1,499 blobs in `5893d9d`'s tree are byte-identical in the export (`git hash-object`); the two that differ are the overlaid walker files, and those equal the candidate walker (`diff -r` empty). Every `src/` file keeps the archive's commit time, 18:57:35Z, before the before walk began. No re-run is needed.
5. **The full gate** (must 5). It is close work, run at the close on the frozen candidate.
- **Shoulds.** The ring images are not kept: the criterion asks for the ring's pixels, and the numbers are kept, as in the before. The other successors (the player, the card, the question) stay proved by reading, as the table says. Walking them would need a walker change the owner has not approved.

## Claude only
- None.

## The re-check (`vh207-codex-recheck-brief-2026-10-27.md`, its answer `vh207-codex-recheck-2026-10-27.md.txt`, 22:35Z): "Commit after the musts below"
- Must 1 resolved; must 4 resolved; must 5 stays close work.
- **Disagreed, held for the owner:** must 2 ("by keys": Codex wants the starting controls reached by Tab and Shift+Tab, not `focusByKeyboard`) and must 3 (the next Tab read before the ring instrument; Codex accepts the counts but holds the explicit order, and notes S-149's own sub-result has no next-Tab reading). Claude reads both as met: the criterion says "with the pass's walker", whose qualified way of reaching a control by keys is `focusByKeyboard`, and the next-Tab readings are those of the untouched state (focus put back on the same element in every cell the instrument touched). The evidence can't settle which reading of the criterion holds, so VH-207 stays open (the Codex word, point 4). Codex's ledger note (the item marked closed) was right, and the draft close edits are withdrawn from the tree.

## The owner's answer (27 October 2026, about 22:57Z)
The owner, to Orchestrator #16, in his own turn, verbatim: "A: accept VH-207's readings as they stand (focus placed by the pass's focusByKeyboard; the next Tab read after the ring instrument, which restores focus) and close it."
- His ruling settles musts 2 and 3. The readings stand as walked, nothing is re-walked, and VH-207 closes on them (VH-207 #3, from VH-207 #2's hand-back).
- Codex's close check is told of the ruling and checks the close against it; it does not reopen musts 2 and 3.
