# Codex astra brief — VH-137, the statement's 0.2.0 edits, 2026-10-24

You are checking one item's candidate diff in this repository, read-only. The base is commit 452334e. The candidate is the working tree against HEAD: `git diff`, plus this brief. Do not run the gate: its result is given below.

The item is `project/items/VH-137.md`: read its acceptance criteria and its 2026-10-24 notes. The owner's call and the approved words are in the new `project/decisions.md` entry "2026-10-24 — VH-137". The owner approved three drafts:

- B1, a new last item in `statement.limits.items`: "The Choose File button belongs to your browser. On the Chinese and Malay pages, its words are in your browser's language. To use it by voice, say the step's name, “Choose a video”." (curly quotes, as the tables use).
- B2, a new line in `statement.testing` after `manual`. The approved draft said "went through every part of the page"; the orchestrator amended it, on the owner's leave to push back, to "went through the page's main states", because VH-172 ran a prioritised matrix (699 records whole, 821 unrun; VH-172.1 keeps 641 never re-read). The amended English: "In October 2026, an automated check in Chrome went through the page’s main states in all three languages, at computer and phone widths, in light and dark colours, in Chrome’s imitation of high contrast mode, and with larger text. This was not a test by a person."
- B3, `statement.about.dates`: "This statement was written on {date} and updated on {updatedDate}. Joe Bell reviewed it. We will review it again by {reviewDate}." with a new `STATEMENT_UPDATED_DATE` in `src/config/accessibility.ts`, written through `Intl` like the other dates. `STATEMENT_PREPARED_DATE` stays 2026-10-18 and `STATEMENT_NEXT_REVIEW_DATE` stays 2026-11-18.

Hard rules: the app stays simple, so no new control, checkbox or element beyond the statement's one list item and one paragraph; "partially compliant", the four "not yet run" tests, the two optional tests and the machine-translation item are unchanged.

What the candidate does:

- `src/i18n/en-GB.ts`: B1 as `statement.limits.items[5]`, B2 as `statement.testing.walk`, B3.
- `reviews/2026-10-18/VH-105-strings-filled.csv`: two new rows and `statement.about.dates` with Chinese and Malay drafted by the agent; `statement.limits.intro`'s note says six lines. `scripts/strings-table.mjs` regenerated `src/i18n/zh-Hans.ts` and `src/i18n/ms-MY.ts`. Other rows are left as the translator was sent them.
- `src/i18n/sheet.ts`: the `updatedDate` placeholder's description, the notes for the two new keys, "six lines".
- `index.html`: the two fallbacks.
- `src/config/accessibility.ts`, `src/ui/accessibility-statement.ts`: the new date and its slot.
- `src/ui/accessibility-statement.test.ts`: the slot test names `updatedDate`; the dates test orders written ≤ updated < review.
- `project/items/VH-137.md` (Now, a note), `project/decisions.md` (the entry), `project/wish-list.md` (VH-175.2 retired, since B1 pays it).

Gate: `npm run check` — green (81 files, 1523 passed, 1 skipped: the existing EBU 3341 skipIf, as at HEAD); `node tools/check.mjs` 0 failures. Its two warnings were 46 live decisions, since cleared by `tools/archive.mjs` (the oldest entry moved verbatim to `project/decisions-2026-10.md`), and VH-175.2 removed without a trace, which the commit body carries as "VH-175.2 — retired — …".

Please judge, with file:line references:

1. Do the English strings match B1, the amended B2 and B3 exactly (curly apostrophes and quotes aside)?
2. Are the Chinese and Malay drafts faithful to the English, in each table's established wording (the step's name as `steps.choose` gives it; "Chinese and Malay pages" as `statement.limits.items.1` says it)? Flag any sense error.
3. Does the date wiring hold in all three languages (each slot exactly once, the `<time>` element, `Intl`)?
4. Does anything overclaim — v1, full conformance, a person's test — or change what must stay unchanged?
5. Is VH-175.2 fully paid by B1, so its retirement is right?
6. Anything else that should block the commit.

Reply with a one-line verdict first ("Commit", "Commit after the musts below" or "Do not commit"), then numbered points, each marked must, should or may.
