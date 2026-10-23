# Codex astra re-check brief — VH-180, a true frame-rate note (V-47), 2026-10-24

You checked VH-180's candidate from `codex-astra-vh180-brief-2026-10-24.md`; your reply is `codex-astra-vh180-check-2026-10-24.md` ("Commit after the musts below"). Read-only again; base 4e5be61, the candidate the working tree against HEAD. Do not run the walker or the gate.

What changed since:

- **Your must 1 (the digest rules).** `project/items/VH-180.md` gains a dated Notes line naming the digest rules applied: Nielsen 1, 2 and 4; WCAG 2.2 AAA 1.4.8, re-checked with 1.4.10, 1.4.6 and 3.1.5; Carbon, tokens untouched; house conventions' minimal change discipline and named test categories. The close note and the commit carry the same.
- **Your may 4 (the boundary test).** In `src/ui/source-panel.test.ts` the mislabelled test is now "boundary: a change of 10% or less raises no note, and just over it does": ratios 0.1, −0.1 and −0.01 give no note, 0.1001 and −0.1001 give the sentence.
- Nothing else changed. The gate is green again: 81 test files, 1,514 passed, 1 skipped (the existing EBU 3341 cases 7 and 8); docs:lint and links 0 issues; `node tools/check.mjs` 0 failures, 0 warnings.

Check, with file:line: are both points met, and does anything in your first reply now stand differently? Reply with a verdict line first ("Commit", "Commit after the musts below", or "Do not commit"), then numbered points, each marked must or may. Be brief.
