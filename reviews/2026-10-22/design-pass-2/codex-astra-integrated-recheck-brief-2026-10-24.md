# Codex astra brief — VH-176, re-check of the integrated check, 2026-10-24

You checked the second pass's fixes together and replied "Close after the musts below" (`reviews/2026-10-22/design-pass-2/codex-astra-integrated-check-2026-10-24.md`). Read-only, re-check only your points against the working tree (`git diff` on HEAD `ec26c49`). No app code has changed. Do not run the walker or the gate.

What was done:

1. **must 1, the remaining coverage.** `reviews/2026-10-22/design-pass-2/evidence/measurements/after-run-2026-10-24.md` now says 641 of VH-172's 821 cells have no after-reading: the fixes run reads 36 and VH-181's `vh181-rest` after-run 144. It lists the 641 by view and mode. `after-manifest-2026-10-24.json` gains `unrunAfter`, the 641 keys. The VH-172.1 line in `project/wish-list.md` now names 641, and drops the 245 file-button readings this run re-measured (4 remain at the landscape view, device scale 3).
2. **must 2, VH-181's criterion.** `project/items/VH-181.md` gains a dated Notes line that links its "Measured, before and after" criterion to VH-181's decision. It names the reduction, with S-26a and S-26b at 375 px. The criterion's own text is left as written, since the contract's rule 2 bars an agent from re-scoping an item. The after-run's stage-rule table says so too.
3. **may 5, wording.** The fixes comparison now says no outcome measured in both runs changed, and that 14 `pressed` outcomes are new. The three feedback-message readings in dark are named as not readings of the ring.
4. **Also:** the glyph row says 4 of VH-172's 245 "cannot determine" readings remain, all at the landscape view.

Check, giving file:line:

1. Is each must met? If must 2 needs the criterion's text itself changed, say so; that would go to the owner.
2. Are the new counts right (36, 144, 641, and the by-class list)?
3. Did anything else change that should not have?

Reply with a verdict line first ("Close", "Close after the musts below", or "Do not close"). Then numbered points, each marked must or may, with file:line. Be brief.
