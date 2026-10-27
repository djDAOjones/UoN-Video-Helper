<!-- markdownlint-disable -->
<!-- The brief Codex astra was given for its blind fix items (VH-202, 2026-10-27), verbatim. It ran with `codex exec -m gpt-6-astra -s read-only` in the repository's working tree at f012bc9, after Claude's plan (claude-fixplan-2026-10-27.md) was saved and before any plan-bearing edit. -->

You are Codex astra, drafting pass 3's fix items blind for VH-202 (the third design pass's fix plan) in the UoN Video Helper repository, read-only, at HEAD `f012bc9`. Claude has drafted its own fix plan and saved it outside the repository; you have not seen it, and you must not look for it. This is a comparison the owner asked for: "please also do everything in partnership with codex as a comparison. codex astra should be used liberally but you decide".

## What you may read

1. **The report**, `reviews/2026-10-25/design-pass-3/design-pass-3-2026-10-27.md`: its Findings (V-51, V-52, V-46, V-48, V-49, V-18, V-50), "Unresolved, kept as such", "For the owner" and "Disposition".
2. **The item schema**, `project/items/_schema.md`, and **VH-203's stage rule**, `project/items/VH-203.md`, "Acceptance criteria", first bullet and its five sub-bullets. Phase 7's fix items `project/items/VH-178.md`, `VH-179.md` and `VH-180.md` show how a fix item carried the same rule; read them for form only.
3. **The source and tests**: `src/`, `index.html`, `test/`; the walker and scenarios under `reviews/2026-10-25/design-pass-3/` (`scenarios-2026-10-25.md`, `evidence/measurements/walker/`) and the evidence digests there, as you need them.
4. **The standards**: `UI-STANDARDS.md`, `project/digests/*.md`, `docs/01-specification.md`, `project/profile.md`, `project/rules.md`.
5. The rest of the repository as you need it, but see below.

## What you must not read until your answer is written

- Anything under `/Users/joe/Library/Application Support/Claude/side-session-notes/`. Claude's plan is there.
- Any file whose name contains `vh202` or `VH-202-plan`, anywhere.

Do not run the app, the tests, the walker or a browser. Change no file.

## What is already established (constraints, not choices)

- **The findings to plan:** V-51 (rank 1); V-52, V-46, V-48 and V-49 (rank 2). V-18 (rank 2, incomplete) was accepted by the owner in Phase 7 (wish VH-175.4), and whether that acceptance stands is the owner's question. V-50 is rank 3, contested 3 or 2: at rank 3 it is a proposal to the owner, at rank 2 a fix item.
- **No new control, checkbox or element** in any remedy; the progress bar stays. A remedy that would need one goes to the owner, recommended against.
- **V-51:** its mechanics carry the omission's reason through the single `no-audio` code (`src/workers/job.worker.ts:535`, `src/audio/warnings.ts:92`). Its words are the owner's to approve, in en-GB with Simplified Chinese and Bahasa Malaysia as the app's machine translations; they tell a kept part with under 400 ms of sound apart from audio that is really absent, and carry the cause, the consequence and a recovery that applies. The 400 ms threshold stays unless the owner changes it.
- **V-52's** check includes F15b's state (S-152). **V-46** covers both read-failure paths and the J4 case. **V-48, V-49** and any approved V-50 remedy are CSS only.
- **VH-203's stage rule, in full, in every fix item's criteria:** walker measurements before and after across the three languages and the colour modes; the affected WCAG checks; the token constraints; the document routing (UI-STANDARDS within its 2,400 words; `docs/` only as a wish line for the owner); the gate and the digest rules applied; Codex's review of the final candidate, with its base and its evidence; a failed review point repaired and re-checked, or left as an open item for the owner.
- Each fix item is one session's work and goes in Phase 8 between VH-202 and VH-203. No product code changes in VH-202 itself.

## What to do

1. **Fix items.** Draft the fix items, to the item schema: for each, a working title, the findings it covers, an Intent, the files and lines it touches (from the source at HEAD), and Acceptance criteria, VH-203's stage rule carried whole, with the scenarios and records its before and after read, the languages, widths and colour modes, the WCAG criteria re-checked, and the digest rules it would name. Group findings into items as you judge best, and say why.
2. **The order**, with its reason.
3. **V-51's words.** Propose the en-GB heading and detail for the kept-part case (and say what the genuinely absent case says); add zh-Hans and ms-MY if you can. Say how the reason travels from the plan to the words, and whether a trimmed keep with no decoded sound at all goes with the kept-part case or the absent one.
4. **Each finding without a fix item**, and what happens to it.
5. **Risks**: anything in the source that would make an item larger than one session, cross another item's files, or need a `docs/` correction.
6. **For the owner**: any point you would put to the owner rather than settle, in a sentence each, with your recommendation.

## Format

Markdown to standard output, nothing else. A heading per part above. End with one summary table: item, findings, files, order. A file and line, or a record key, for every claim. Under 2,000 words.
