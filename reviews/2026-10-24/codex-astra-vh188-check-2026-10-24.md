# Codex astra check — VH-188, the preset names, 2026-10-24

Model gpt-6-astra, read-only, on the brief `codex-astra-vh188-brief-2026-10-24.md`. Its reply, verbatim but for its file links, kept as code:

Commit after the musts below

1. **must — Correct the stale comment:** `index.html:514` still says “size, then quality”. The names now give quality or size, then purpose. The other naming comments and sheet notes remain accurate.

2. **may — Retain AC1–2’s implementation:** `src/i18n/en-GB.ts:367` matches B6 exactly, including the unchanged legend; config labels agree. All four sentence callers use `inSentence`, and the record uses `inRecord`. Old labels and prose “etc.” are gone. The sole literal `etc.` match is the unchanged `/etc.clientlibs/` asset path at `src/assets/README.md:17`; preserve it.

3. **may — Keep the shortened record:** `src/ui/result-summary.ts:172`. Dropping purpose avoids an extra comma-list item and is expressly allowed by B6:56. “A smaller file” describes the result; “the smaller file” identifies the choice. No confusion.

4. **may — AC3 met:** `docs/01-specification.md:332`. The complete spec diff equals S1–S10 word for word, ignoring wrapping, with no other changes: **8,020 words**.

5. **may — AC4’s content and provenance met:** `VH-105-strings-filled.csv:185`. Exactly 15 relevant rows changed; their metadata matches `sheetRows()`, both tables match regeneration, and no keys were removed. Draft markings are present. No new sense or terminology errors found; “请选择高质量” and “pilih fail yang lebih kecil” compose naturally.

6. **may — Stage rule met:** `index.html:518`. HTML tags and attributes are unchanged; no control, element or design token was added. Applied digest rules: Nielsen 2/4/8—familiar words, consistency and minimalism.

7. **must — Complete AC5 at close:** `project/items/VH-188.md:13`. Chrome evidence remains outside this review; record it, the digest rule and the commit’s `Verify:`/`Checked:` lines. Gate result accepted as reported: 1,543 passed, one pre-existing skip; no test deleted or newly skipped in the diff. I ran neither gate nor walker and changed no files.
