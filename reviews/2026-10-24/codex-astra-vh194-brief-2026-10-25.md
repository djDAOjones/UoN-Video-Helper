# Codex astra brief — VH-194, spec §9.3 and UI-STANDARDS take Phase 7's corrections, 2026-10-25

You are checking one Phase 8 item's candidate diff in this repository, read-only. The base is commit e226410. The candidate is the working tree against HEAD: `git diff`. Do not run the gate; it runs outside your check, and its result goes in the commit.

The item is `project/items/VH-194.md`: read its acceptance criteria in full. It changes documents only. Its words are the Phase 8 wording sheet's corrections S26 to S31, U1 and U2 (`reviews/2026-10-24/phase-8-wording-sheet-2026-10-24.md`, from the line "**S26**" to the line before "## Round 2"). The owner approved them, so they are final; do not propose rewording them. The sheet matches old text with its line wrapping ignored: words separated by any whitespace.

What the candidate does, in outline:

- `docs/01-specification.md` §9.3: S26 (the CJK measure), S27 (the Chinese 40-glyph measure leaves the person-only list), S28 (focus handed on by the transition), S29 (the slider thumbs' person-only check narrowed), S30 (the file chooser's exception), S31 (the announcement contingency resolved to "Announce progress"). Lines re-wrapped only where an edit fell.
- `UI-STANDARDS.md`, Operable: U1 (a larger default font among 2.4.13's conditions) and U2 (the focus hand-on rule shortened).
- The ledger close: the backlog line struck, the trajectory line, the decision, the item file's Now and Notes, two wish lines (VH-194.1 and VH-194.2), and `tools/archive.mjs` moving one old decision to `project/decisions-2026-10.md`.

Check, giving file:line:

1. Each acceptance criterion: met or not, and why. Is every new text present word for word, every old text gone, and nothing else in either document changed?
2. The counts, by the ledger's own counter (`tools/check.mjs`; it leaves out fenced blocks): is the spec at or under 8,100 and UI-STANDARDS at 2,393?
3. Does any new text now contradict anything else in the spec, `UI-STANDARDS.md`, `project/architecture.md`, `test/readability.test.ts`'s lists, or the accessibility statement (`src/i18n/en-GB.ts`, `statement`)? The item says a contradiction becomes a wish line, not an edit: are the two wish lines right, and is anything missed?
4. The ledger: is the decision's Decision line true to the diff, and is the archive move verbatim?

Give a verdict line first: "Commit", "Commit after the musts below", or "Do not commit". Then give numbered points, each marked Must, Should or May.
