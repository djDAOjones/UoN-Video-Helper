# Wish-list

<!-- Capture inbox, one line per idea, appended at the bottom:
       - {idea} — (from: ID, YYYY-MM-DD)
     Triage promotes a line into the backlog or deletes it. A deferral
     named in any entry, trajectory line or commit is also a line here
     or in the backlog (rule 5). Capture one line and keep working: do
     not act on it, scope it, estimate it or discuss it unless the owner
     asks; "park it" means append the idea and move on; this is the
     pre-triage inbox — raw, unjudged — and the backlog's Icebox is
     post-triage; promote into the backlog, never treat this as a
     second backlog. The lines below the first comment were
     carried verbatim from the canon wish-list at 029ae1e; the open
     doc-delta lines (spec sign-off debt the canon record kept apart)
     follow them, each marked, since v3 keeps one capture surface. -->

## Open

- A trim Page step that scales with the video (max(10 s, 1% of duration); `trimKeyTarget` would need the duration) so the slider is usable by keyboard on an hour (canon provenance: 2026-10-01 spec gap review A-18) — (from: INTAKE, 2026-10-01)
- Listen to the Teams recording's output: landing it on −16 LUFS costs about 8 LU of limiting on the loud talker, and only a person can say whether spec §5.2 as written sounds acceptable there (canon provenance: 2026-10-01 VH-106) — (from: INTAKE, 2026-10-01)
- A pre-flight note when landing the target will need the limiter to remove more than a few LU (the Teams case), so heavy processing is disclosed before Create rather than discovered by ear (canon provenance: 2026-10-01 VH-106) — (from: INTAKE, 2026-10-01)
- Cut the lede's lead-in sentence ("This tool does the following to your video:") and let the three promises stand under the title (canon provenance: 2026-10-01 VH-124, Codex astra critique rank 1) — (from: INTAKE, 2026-10-01)
- Shorter System check row labels ("Secure connection", "Output video format") with the explanation in the value (canon provenance: 2026-10-01 VH-124, astra audit §2) — (from: INTAKE, 2026-10-01)
- The onset toggletip's dismissal on Tab, and its rail reading like a warning's (canon provenance: 2026-10-01 VH-124, critique row 09) — (from: INTAKE, 2026-10-01)
- Standalone values from `format.ts` ("unknown", "less than a second") start lower-case where shown alone in Video properties (canon provenance: 2026-10-01 VH-124) — (from: INTAKE, 2026-10-01)
- Retire the canon framework copies under pm_skills/ (prompts, integrations, templates, scaffold) and the check:memory gate step, whose warnings now target a frozen record, on the owner's word; pm_skills/project stays pinned by the inventory — (from: INTAKE, 2026-10-02)
- Clear npm audit's dev-only findings; the runtime has none (`npm audit --omit=dev`). The owner counted 9, markdownlint-cli2's tree, all fixable without a major bump; this Mac's audit on 2026-10-05 found 21 (18 high, 3 moderate): those 9 plus 12 in the eslint and typescript-eslint tree through minimatch's brace-expansion, with npm reporting no fix available for the brace-expansion and braces advisories. Dependencies change only by decision — (from: V3-HARNESS, 2026-10-05)
- Check the language switcher and the machine-translation note in forced colours, the dark theme, NVDA and VoiceOver, at 200% zoom and 320 px reflow, and whether English shows for a moment before a remembered Chinese or Malay page paints — (from: VH-105, 2026-10-18)
- When a campus colleague has checked their language on the live page, apply the corrections through the filled sheet and `scripts/strings-table.mjs`, and take that language off `MACHINE_TRANSLATED` — (from: VH-105, 2026-10-18)
- A person checks VH-127's title card: Step 3 heard with a screen reader (the box, each field's note, "This field is full…", the refusals beside a field and on the status line), and a made card watched at full size on a real display in each language — (from: VH-127, 2026-10-19)
- A person checks VH-128's Submission card: Step 3 under a submission heard with a screen reader (the locked box's reason, the IDs' helper, the running-time line, each refusal beside its field and on the status line), and a made card, eight IDs and every field at its limit, watched at full size on a real display in each language — (from: VH-128, 2026-10-19)
- A person checks VH-122's warning: heard with a screen reader in each language (the heading, the times as read, and the status line's summary), and CULT2011's output listened to at 1:22 and 3:05 for a click or a gap that draws attention at the edges of the silence — (from: VH-122, 2026-10-20)
- A person checks VH-135 with a screen reader: "Saving…" and "Saved." heard from the save's line while the next file's verdict is heard from the step's, and the page browsed after a withdrawn discard question finding none of its words; and the three switchers seen in Windows high contrast, nothing moving on a choice — (from: VH-135, 2026-10-20)
- `project/structure.md` is stale: `node tools/structure.mjs` moves eleven counts and adds `src/i18n/` and `reviews/2026-10-18/` with no role written, so a regeneration needs those two roles first — (from: VH-116, 2026-10-20)
