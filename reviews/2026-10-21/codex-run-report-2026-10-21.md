# Codex run report — 21 October 2026

The authorised run is complete. VH-148 also closes VH-124; Phases 3 and 4 are reconciled against their plans and closed. Each close is committed and pushed to `claude/overnight-design-and-phases` and `main`, publishing the pilot.

| Close | Outcome | Commit | Gate |
| --- | --- | --- | --- |
| VH-148 / VH-124 | All thirteen owner changes, including footer destinations, read outcome, trim hatch, headings and helpers. | `30ad5dd` | 1,389 passed |
| VH-141 | Retained results, save feedback/focus, announcements, startup, locks and stale-progress fixes; Show progress control. | `a89dd6f` | 1,391 passed |
| VH-142 | Approved save, damage, feedback, punctuation and terminology corrections. | `0b1a37e` | 1,398 passed |
| Phase 3 | VH-139–142 reconciled; local recall 8/8; VH-144 named next with its reason. | `992fa2d` | 1,398 passed |
| VH-144 | One None reason with three accessible references; trim fields retain 12 rem and buttons wrap. | `02aa964` | 1,401 passed |
| VH-145 | Explicit spacing/defaults, named type roles and monospace face, grouped duplicate rules. | `0d67fba` | 1,404 passed |
| VH-146 | Whole generated date and caveat; typed staff dates still wrap. | `30a6f22` | 1,408 passed |
| Phase 4 and report | VH-144–146 reconciled; local recall 8/8; further phase selection needs owner direction. | This close | 1,408 passed |

Every gate was `npm run check`: 79 passing suites, one unchanged pre-existing EBU skip, no test removed or newly skipped. Every close also ran `node tools/check.mjs` with zero structural or budget failures. Its missing CULT2011 warning and the frozen-canon warnings retain their existing follow-ups. Both milestone audits found zero runtime vulnerabilities and 14 development findings, covered by the existing audit wish; dependencies did not change.

Chrome checks covered English, Chinese and Malay at 1280/375 px in light, dark and forced colours for each item. VH-144 extended to 320/640 px and 144 layout states; VH-145 compared 72 states with 24 baseline captures at 1280/390/375/320 px. VH-141 used real codecs and OPFS with controlled failure/reply timing. [VH-146’s card log](vh146-cards/cards-log.txt) reports ALL PASS for 37 retained clips, including worst-case fields and 4K equivalence; every size remains at the 28 pt floor or above. Browser measurements are in the adjacent `vh148-browser.json`, `vh141-browser.json`, `vh142-browser.json`, `vh144-browser.json`, `vh145-browser.json` and `vh146-browser.json`.

Taken gateless under the handoff: the conservative native-select/forced-colour treatments, separate Show progress control for WCAG 2.2.2, the specified wording and token repairs, atomic generated date phrases, and continuation through compaction to finish the expressly authorised run. Each decision names its applied digest rules. No second-model check is claimed. Protected specification edits are proposed in the wish-list. The separate writing review’s 24 proposals remain unimplemented.

Human checks remain recorded: NVDA/VoiceOver announcements and focus, real Windows contrast themes and browser zoom, full-size card viewing, the University-authenticated Teams link, real recording corpus/listening, and campus colleagues’ translation judgement. Chinese/Malay changes are agent drafts in the [filled strings sheet](../2026-10-18/VH-105-strings-filled.csv); [the changed-key list](codex-run-translation-keys-2026-10-21.md) identifies them for review. These limitations are not claimed as human acceptance.
