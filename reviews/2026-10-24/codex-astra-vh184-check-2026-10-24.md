<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), check of VH-184, 2026-10-24, at main 8c144ba with the working-tree diff; brief: codex-astra-vh184-brief-2026-10-24.md. The reply, verbatim. -->

Commit after the musts below

1. **Must — AC4 close remains pending.** `project/items/VH-184.md:12`: record the alongside gate’s green result, complete the ledger close and include `Checked:`. Name Carbon’s “tokens, not literals”, WCAG’s keyboard/focus rules and Nielsen’s control/freedom and contextual-help rules. I did not run the walker or gate.

2. **May — AC1 met.** `src/main.ts:724`: Tab/Shift+Tab retain native destinations; the listener only hides the tip. Escape closes and restores button focus appropriately. The unchanged outside-click handler at `src/main.ts:736` still closes it. All 36 saved cases agree.

3. **May — no wrong closure or focus theft found.** `src/ui/toggletip.ts:24` excludes the button and tip; Enter/Space retain native button toggling. Escape’s guard at `src/ui/toggletip.ts:39` excludes other controls. Language repaint preserves the elements (`src/i18n/bind.ts:54`); changing closing type preserves the help button (`src/main.ts:596`). Moving to either external control correctly dismisses help.

4. **May — AC2 met.** `src/styles/app.css:1061`: the uniform hairline and explanatory paragraphs read as a help panel, without the notification rail or an editable-field affordance. `--border-subtle` is a fair existing neutral border role under `UI-STANDARDS.md:20` and `project/digests/carbon.md:36`. Recalculated tip/step contrast: light **4.08/3.91**, dark **4.71/5.53**, both forced modes **21/21**.

5. **May — AC3 met by source comparison.** `index.html:435` and `index.html:448`: accessible name, expanded state, live wrapper and opening text remain unchanged. Actual screen-reader speech was not tested, correctly disclosed at `reviews/2026-10-24/vh184-toggletip-2026-10-24.md:52`.

6. **May — stage rule met.** `src/styles/app.css:1058`, `src/main.ts:732`: no control, element or token added; UI-STANDARDS and docs untouched; no existing test deleted or skipped.

7. **May — strengthen the evidence runner.** `reviews/2026-10-22/design-pass-2/evidence/measurements/walker/tip-184.mjs:81` exempts forced-colour contrast from pass/fail; line 90 exits successfully for failed assertions. Current readings pass independently, so this does not block this candidate.
