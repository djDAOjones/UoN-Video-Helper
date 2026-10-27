# VH-200 — WCAG verdicts and findings: Claude's against Codex astra's blind verdicts

VH-200 #2, 2026-10-27. **Claude's** table (`wcag-2026-10-27.md`) and findings (`judged-2026-10-27.md`) were drafted before Codex astra's run and kept out of the repository while it ran. **Codex** gave blind verdicts on the 19 criteria Claude changed from Phase 7, or judged partial or a gap, and on the six findings at rank 1 or 2: brief `codex-astra-wcag-brief-2026-10-27.md`, answer `codex-astra-wcag-2026-10-27.md.txt`, verbatim. Every disagreement is settled on the evidence; none is held for the owner.

## Agreed

- **Part A, the criteria.**
  - 1.4.4 and 1.4.10: met, as scoped (real zoom and the combined stress of S-113 left open).
  - 2.1.1, 2.1.3, 3.1.3 and 3.1.5: missing evidence, as Phase 7.
  - 2.4.3: defect, V-46 regressed.
  - 2.4.7 and 4.1.2: met, now missing evidence (the player's 39 + 39 rows).
  - 2.4.11 and 2.4.12: met.
  - 2.4.13: defect (V-48, V-49), with a missing-evidence part (the player undetermined).
  - 2.5.3: defect, now an accepted limitation (V-43).
  - 4.1.3: met, exposure only.
- **Part B, all six findings stand at the same rank:**
  - D-05, rank 1;
  - D-06, V-46 (regressed), the onset "?" ring (V-48), the Creators link (V-49) and V-18 (narrowed, incomplete), each rank 2.

## Codex only

- **1.4.4's limitation made explicit.** S-113's six records at the 32 px font and 320/401 px (VH-189.1) are a layout limitation, but sideways scrolling alone is not a 1.4.4 loss. The table's 1.4.4 row already names it.

## Claude only

- **Phase 8's ground per criterion.** The table's "Phase 8's changes, read where they touch" and "Phase 7's fixes in pass 3's evidence" sections; Codex was not asked for them.

## Disagreed, and settled

1. **1.4.2.** Claude: met. Codex: met-in-source.
   - **Settled: met.** S-126's own assert reads the player paused on arrival ×39 (the contract's VH-192 row). That assert is not the finish+1s row, and Codex cites it too.
   - The finish+1s rows stay unverified, in the row's Unresolved.
2. **1.4.11.** Claude: defect, V-49. Codex: missing evidence; a failure of the focus area does not establish an adjacent-colour failure.
   - **Settled for Codex.** V-49 is judged at 2.4.13. Under a forced palette, the adjacent colours are the user's theme's.
   - 1.4.11 is missing evidence (the range paint; real themes). V-41's defect no longer reproduces.
3. **1.4.12.** Claude: missing evidence, for VH-205's "?". Codex: met, on 323 spacing records that all pass.
   - **Settled for Codex,** by the table's own rule that a verdict covers the run's records.
   - VH-205 came after the run, so its "?" under spacing is missing, in the row's Unresolved, as in 2.5.5's row.
4. **2.5.5 and 2.5.8.** Claude: met. Codex: missing evidence.
   - **Settled for Codex,** by the rule that "c-d" is never a pass. 17 target rows are c-d with no exception established: S-113's 16 at the 32 px font, and S-76's field at the 400 % proxy, larger than the viewport or clipped (`digest-targets-2026-10-27.md:11`, `:38`). None reads under 44 px.
   - VH-205's "?" target is also unmeasured (VH-205.1).
   - Phase 7's trim discs were c-d too, but they had an exception, the equivalent controls. These rows have none.
