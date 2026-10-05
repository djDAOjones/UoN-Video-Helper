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
- The planner can tell before the encode that a job will not land (`converged: false` at the pass cap); say so at Create instead of after three minutes of encoding (canon provenance: 2026-10-01 VH-106, for VH-110) — (from: INTAKE, 2026-10-01)
- Cut the lede's lead-in sentence ("This tool does the following to your video:") and let the three promises stand under the title (canon provenance: 2026-10-01 VH-124, Codex astra critique rank 1) — (from: INTAKE, 2026-10-01)
- A previous video's save and the next file's check share one status line, so one can overwrite the other's message (canon provenance: 2026-10-01 VH-124, Codex astra critique row 22) — (from: INTAKE, 2026-10-01)
- Shorter System check row labels ("Secure connection", "Output video format") with the explanation in the value (canon provenance: 2026-10-01 VH-124, astra audit §2) — (from: INTAKE, 2026-10-01)
- The onset toggletip's dismissal on Tab, and its rail reading like a warning's (canon provenance: 2026-10-01 VH-124, critique row 09) — (from: INTAKE, 2026-10-01)
- Standalone values from `format.ts` ("unknown", "less than a second") start lower-case where shown alone in Video properties (canon provenance: 2026-10-01 VH-124) — (from: INTAKE, 2026-10-01)
- Spec sign-off debt, carried from doc-deltas: 2026-10-01 SPEC §9.3 — "Format identifiers (3.1.4): none accepted yet", while `test/readability.test.ts` records the codec names (H.264, AAC, …) and the size units as exceptions since VH-114; the list belongs in §9.3 with the four fields (source: VH-124 pre-work) — (from: INTAKE, 2026-10-01)
- Spec sign-off debt, carried from doc-deltas: 2026-10-01 SPEC §9.3 — "paragraph spacing 1.5× that": the page now sets one blank line between paragraphs (`--paragraph-gap`, 2.5× the font size top to top, the Understanding document's figure) and lets the user's overrides win; state the mechanism and the figure (source: VH-124) — (from: INTAKE, 2026-10-01)
- Spec sign-off debt, carried from doc-deltas: 2026-10-01 spec §9.3 — exceptions recorded one by one for 3.1.4: units of file size (kB, MB, GB, TB) as every device's own screens show them; the product name UoN, whose logo beside it reads University of Nottingham; and the codec names the Video properties disclosure shows as read-only facts (H.264, H.265, VP8, VP9, AV1, ProRes, AAC, Opus, MP3, Vorbis, FLAC, Dolby Digital), each with the four fields; the gate's `test/readability.test.ts` mirrors the list (source: VH-114) — (from: INTAKE, 2026-10-01)
- Spec sign-off debt, carried from doc-deltas: 2026-10-01 spec §9.2 — the named stages are five: "Getting ready", "Analysing audio", "Encoding video", "Finishing the file", "Checking the file" (the output check is a stage of its own, and 100% is said only when the video is ready); "Adding branding" is not a stage — branding joins inside the encode (source: VH-109) — (from: INTAKE, 2026-10-01)
- Retire the canon framework copies under pm_skills/ (prompts, integrations, templates, scaffold) and the check:memory gate step, whose warnings now target a frozen record, on the owner's word; pm_skills/project stays pinned by the inventory — (from: INTAKE, 2026-10-02)
- Bring the rules file's Always section under its 400-word guideline (433 words on 2026-10-05); the owner approves rules edits — (from: V3-CONFIRM, 2026-10-05)
- Confirm or correct the profile's "Prose: en-GB [guess]", the last intake guess the owner has not addressed; V3-CONFIRM closes with it — (from: V3-CONFIRM, 2026-10-05)
