# Hand-off prompt — VH-113, VH-124 and VH-105

The prompt that started the fresh session, as given.

---

You are continuing UoN Video Helper in a fresh session.

- Repo: `/Users/joe/Library/CloudStorage/OneDrive-TheUniversityofNottingham/_Joe Bell UoN Files/2_Projects/2026-08-24 UoN Video Helper`
- Branch: `codex/repository-review-remediation`, at the commit "VH-124: pre-work for a fresh session…" or later, level with `origin/main`. Check `git status`, `git log -3` and `git rev-list --left-right --count origin/main...HEAD` first.

Load project context as `AGENTS.md` and `CLAUDE.md` prescribe. Then read, in order: `pm_skills/project/tickets/VH-124.md` (the maintainer's brief — your standard), `reviews/2026-10-01/vh-124-prework/README.md` (measurements, defects confirmed in source, lines said twice, proposed direction), and the two Codex astra reports beside it. Build on that pre-work rather than redoing it; re-check any `src/main.ts` line number before citing it.

## Already decided by the maintainer — do not re-ask

- **Free rein.** Run `pm_skills/integrations/task.md` gateless: at each gate make the conservative decision, state it in one line, and carry on. Stop only for a genuinely blocking ambiguity or a hard prohibition (a new runtime dependency, a protected or never-edit file, weakening a test, anything destructive).
- **Hit `main` as soon as things are ready**: after each green commit, `git push origin HEAD:main`, which deploys to GitHub Pages. Never force-push or rewrite pushed history.
- **Codex astra (`gpt-6-astra`) is the coding partner**, as memory `codex-astra-partner` describes: independent read-only passes in the background, an adversarial critique of the merged audit before the closing commit, and `codex exec review --commit <sha> -m gpt-6-astra` on each commit, with findings fixed as follow-up commits.
- **Order: VH-113's code, then VH-124, then VH-105.** VH-124 reaches VH-113's surfaces and VH-105 waits on both, so the phone path is settled before the page is walked.

## 1. VH-113 — the phone path, code only

Its backlog item has the Done-when: the device class decided on the main thread and passed to the worker; the mobile verdict leading with the risk of stopping part-way; the drop hint hidden on a coarse pointer; a time helper and parser that agree on something a phone keyboard can type; the download sentence naming where the file lands (Files → Downloads on an iPhone). The real-phone checks are the maintainer's: leave VH-113 open with only those remaining, and say so.

## 2. VH-124 — the page, made excellent (the main piece)

- **Before.** Screenshot every state — the ticket's list plus the ones astra's audit adds — in headless Chrome over CDP: desktop 1280 × 900; phone 390 × 844 with mobile emulation; 320 px reflow; dark; forced colours. Take them from the HEAD you start VH-124 on, with synthetic fixtures (ffmpeg test patterns and tones), never frames or names from `samples/`. Hide the dev-only buttons, as production does.
- **Audit.** Write the one-page audit in `reviews/<date>/` beside those screenshots, as the ticket's Method sets out.
- **Build**, in reviewable commits, each green and pushed:
  1. Foundation: a measure near `55ch` (VH-112's `70ch` measured 88–91 characters a line in Arial — re-measure), paragraph spacing, line-height and layout-width tokens, one Carbon inline-notification component for the verdict, warnings, losses and failures, and a stylesheet test that fails on a literal length or colour outside the token files (structural geometry and forced-colour system colours exempt).
  2. Text and choreography: every defect and repeat the pre-work README lists; step 1 without its four echoes, with the file chooser as the empty state's one primary action; the lede's bullets with capitals and full stops (update the pin to the new form); step 5 in reading order while running (progress, then Cancel) and when finished (the result and its warnings, then Save); Discard as a danger action that does not take default focus; the blue swatch on a blue band.
  3. The walk: after screenshots of every state beside the befores, keyboard-only and phone-width walks recorded, and `npm run check` green with every pin updated and none weakened.
- **Interpret the brief** as astra's audit §7 does — required reassurance stays, the next action can be a wait, established long labels stay, system colours sit outside the tokens — and record those readings in the decision log.
- **Close** per `pm_skills/prompts/end-of-task.md`: decision log, trajectory, file map, and doc-deltas for the two gaps the pre-work README names (plus the browser sentence, if its punctuation changes). Close VH-112's and VH-113's surfaces with evidence where VH-124 reaches them. **The `[sign-off]` is the maintainer's:** meet everything else in the Done-when, then leave VH-124 open as awaiting the maintainer's walk-through, and say so.

## 3. VH-105 — the page in Chinese and Bahasa Malaysia

After VH-124 is on `main`. Start from the groundwork report: architecture A (marked HTML and stable nodes, tables under `src/i18n/`), a tablist switcher after the `h1`, `Intl` formatting with fallbacks, a CJK system-font token with a `40ic` measure, and the readability check kept English-only. Write VH-124's new copy translation-ready (the groundwork's §7) so this step is mostly mechanical. Draft both translations, have Codex astra draft each independently, and list where the two disagree for the native reviewers. **Default — state it as your assumption:** every push deploys and each language needs its campus reviewer's sign-off, so ship the switcher with Chinese and Malay turned off in production by a `src/config/` constant (on in development) until the maintainer turns them on after review. Spec §9's amendment goes in as a doc-delta. If your context is heavy by then, hand VH-105 to a fresh session as memory `fresh-chat-handoff` describes.

## Machine and repo notes

- Other Claude sessions run on this Mac. Kill your headless browsers before `npm run check` (memory `headless-engine-checks`), never time anything in the built-in browser pane, and stage explicit paths only.
- A Vite dev server may already be listening on :5173; reuse it.
- Scratch tooling from the pre-work session, disposable — rebuild it if it has gone: `/private/tmp/claude-501/-Users-joe-Library-CloudStorage-OneDrive-TheUniversityofNottingham--Joe-Bell-UoN-Files-2-Projects-2026-08-24-UoN-Video-Helper/e6c030d6-0653-4152-8b46-666aae67b51a/scratchpad/` holds `cdp.mjs`, `walker.mjs` (one CDP session behind a local HTTP port, with a stubbed save picker), `make-fixtures.sh` and `fixtures/`.
- `samples/` is mostly dataless on OneDrive (memory `driving-the-app-with-real-samples`).

## Report at the end

What shipped (commits, the SHA on `main`, the deploy run), the audit's link, what is left for the maintainer (the VH-124 walk and sign-off, VH-113 on real phones, VH-105's reviewers and switching the languages on), and anything parked in the wish-list.
