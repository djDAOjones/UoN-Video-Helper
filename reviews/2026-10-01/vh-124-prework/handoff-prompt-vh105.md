# Hand-off prompt — VH-105, the page in Chinese and Bahasa Malaysia

The prompt that starts the fresh session for VH-105, kept so the run traces
to its instructions. Written at the close of VH-124 on 2026-10-01.

---

You are continuing UoN Video Helper in a fresh session, on VH-105 only.

- Repo: `/Users/joe/Library/CloudStorage/OneDrive-TheUniversityofNottingham/_Joe Bell UoN Files/2_Projects/2026-08-24 UoN Video Helper`
- Branch: `codex/repository-review-remediation`, level with `origin/main`, at or after the commit "VH-124 the walk: …". Check `git status`, `git log -5 --oneline` and `git rev-list --left-right --count origin/main...HEAD` first.

Load project context as `AGENTS.md` and `CLAUDE.md` prescribe. Then read, in order: the VH-105 item in `pm_skills/project/backlog.md` (its Done-when and the spec gap clause A-17), `reviews/2026-10-01/vh-124-prework/codex-astra-vh105-groundwork-2026-10-01.md` (the groundwork — string-site inventory, formatting, architecture A, the switcher, typography, the gate, copy rules), `reviews/2026-10-01/vh-124/README.md` (the page as it now is), and the decision-log entries "VH-124" and "VH-113". Re-check every `src/main.ts` line number the groundwork cites: VH-124 reordered step 5 and moved the result into `src/ui/notification.ts`.

## Already decided by the maintainer — do not re-ask

- **Free rein.** Run `pm_skills/integrations/task.md` gateless (`auto-jazz`): at each gate make the conservative decision, state it in one line, carry on. Stop only for a genuinely blocking ambiguity or a hard prohibition (a new runtime dependency — no i18n library, no web font download; a protected or never-edit file; weakening a test; anything destructive).
- **Hit `main` as soon as each piece is green**: `git push origin HEAD:main` after every green commit (it deploys to GitHub Pages). Never force-push or rewrite pushed history. Run `npm run check` before each commit, with no headless browser running beside it.
- **Codex astra (`gpt-6-astra`) is the coding partner**, as memory `codex-astra-partner` describes: `codex exec -m gpt-6-astra -s read-only -o <out.md> - < brief.md` for independent passes in the background (tell it to put the whole answer in its final message), an adversarial critique of your merged design before the closing commit, and `codex exec review --commit <sha> -m gpt-6-astra` on each commit (run from the repo directory; no `-C`, no `--color`), findings fixed as follow-up commits.
- **Architecture A** from the groundwork §3: marked HTML with stable nodes, tables under `src/i18n/` (`en-GB.ts`, `zh-Hans.ts`, `ms-MY.ts`) of whole messages with named, typed parameters; semantic keys; a completeness test that fails if any table lacks a key English has or a parameter signature differs; switching re-renders text in place without losing the video, the trim (including a typed-but-uncommitted field and a pending error), every choice, a running job, an unsaved or saved result, the discard question or a feedback draft; `document.documentElement.lang` and each switcher option's own `lang`; passages kept in English (diagnostics) marked `lang="en-GB"`; the choice remembered per origin in `localStorage` with the same guarded read/write `ui/progress.ts` uses, and nothing about it leaving the device.
- **The switcher**: a Carbon content switcher after the `h1` and before the lede, `role="tablist"` with `tab` buttons, each labelled in its own language and script (English, 简体中文, Bahasa Malaysia), `aria-selected`, roving `tabindex`, arrow keys, Home/End, Enter/Space and click; focus stays on the activated tab; the change is announced once in the new language.
- **`Intl` formatting with fallbacks**: `NumberFormat` (sizes with explicit precision, percentages from a fraction, rates, sample rates, counts), `ListFormat` for genuine noun lists, `DurationFormat` where present with a `NumberFormat`+`ListFormat` fallback when the constructor or locale is missing (A-17 requires the absence path); editable trim times stay Latin digits with a colon and a decimal point in every language, and the parser accepts exactly what the helper's examples show.
- **A CJK system-font token** (`--font-body-cjk`, `--font-heading-cjk`: `'PingFang SC', 'Microsoft YaHei', 'Noto Sans CJK SC', 'Noto Sans SC', sans-serif`) applied under `:lang(zh-Hans)`, and a `--measure-cjk: 40ic` (fallback `40em`) measure for Chinese running text; the sentence-case rule stated per language in the table file's header.
- **The readability check stays English-only** (`test/readability.test.ts` reads the English table and `index.html`); Chinese and Malay are judged by their native reviewers.
- **Both translations drafted twice**: draft each yourself, have Codex astra draft each independently from the same English table, and write the list of where the two disagree — key, both renderings, the question for the reviewer — into `reviews/2026-10-01/vh-105/README.md` for the native reviewers, whom the maintainer sources.
- **Default, stated as your assumption**: every push deploys, and each language needs its campus reviewer's sign-off, so ship the switcher with Chinese and Malay **turned off in production** by a constant in `src/config/` (`LANGUAGES_OFFERED`, say — on in development, `import.meta.env.DEV`) until the maintainer turns them on after review. Spec §9's amendment (the switcher, the per-language rules, the kept-English passages) goes in as one `pm_skills/project/doc-deltas.md` line, never an edit to `docs/`.
- VH-124 is built and awaits the maintainer's walk-through; VH-113's code shipped and its real-phone checks are the maintainer's. Do not reopen either; translate the page as it is.

## Build, in reviewable commits, each green and pushed

1. The tables and the gate: `src/i18n/` with the English table extracted from `index.html`, `src/main.ts`, `src/ui/*.ts`, `src/config/presets.ts` and `src/config/branding.ts` labels, `src/media/kept-range.ts`, `src/media/inspect.ts` and `src/workers/job.worker.ts` user-facing sentences (the groundwork §1 inventory), the `Intl` formatters with their fallbacks, the completeness test, and the English page rendering exactly as before (every pin in `test/screen-text.test.ts` and `test/readability.test.ts` still green — update a pin only where the markup gains a binding, never weaken one).
2. The switcher and the state-preserving switch, the `lang` attributes, the CJK tokens, the remembered choice, the production gate constant; verified in headless Chrome at desktop and phone width in every state A-17 names (the scratch walker from VH-124 is in that session's scratchpad and easy to rebuild from `reviews/2026-10-01/vh-124/README.md`'s provenance notes and memory `headless-engine-checks`).
3. The two translations (yours), then Codex astra's two, the disagreement list, and the Chinese measure and wrapping checked with the chosen face at desktop and 390 px.

Close per `pm_skills/prompts/end-of-task.md`: decision log, trajectory, file map, the doc-delta for spec §9, VH-105 left open as awaiting the reviewers and the maintainer's switch-on, and say so.

## Machine and repo notes

- Other Claude sessions may run on this Mac. Kill headless browsers before `npm run check` (memory `headless-engine-checks`); never time anything in the built-in browser pane; stage explicit paths only. Shared PM files are released when `git status` is clean on them.
- A Vite dev server may already be listening on :5173; reuse it (`.claude/launch.json` names it `uon-video-helper`).
- `samples/` is mostly dataless on OneDrive and is never needed here; synthetic fixtures (ffmpeg test patterns) are enough for the state walk.

## Report at the end

What shipped (commits, the SHA on `main`), the disagreement list's link, what is left for the maintainer (the reviewers, switching the languages on, VH-124's walk-through, VH-113's phones), and anything parked in the wish-list.
