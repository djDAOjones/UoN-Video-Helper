<!-- markdownlint-disable -->
<!-- The brief Codex astra was given to critique the draft plan for the second design pass (VH-170, 2026-10-22), at main 6a207b3, verbatim; the draft plan follows the brief. -->

You are Codex astra, reviewing read-only from this checkout (UoN Video Helper, branch main at 6a207b3). Do not change any file. Write a self-contained Markdown critique to standard output; nothing else.

The owner asked: "lets design and run another full design / ux / accessibility pass. thorough planning and ticketed before execution". The owner wants you, Codex astra, as a full partner at every stage this time; in the last pass (VH-163) you did a blind review and critiqued the report, but checked none of its six fixes, VH-164 to VH-169. Claude Code has drafted the plan below. Critique it before the owner sees it.

Read as needed: AGENTS.md; project/profile.md; project/rules.md; project/backlog.md; project/items/_schema.md; verbs/plan.md; project/items/VH-163.md and VH-165.md to VH-169.md; project/decisions.md (the latest ten entries); UI-STANDARDS.md; project/digests/carbon.md, nielsen.md, wcag-2.2-aaa.md; reviews/2026-10-20/states-2026-10-20.md and wcag-2026-10-20.md; reviews/2026-10-22/design-pass/ (the report, your own brief, blind review and critique, evidence/measurements/ and its walker/); git log -12 for the fix commits.

Judge the plan on:
1. Coverage: does the scope (states, languages, views, modes, keyboard) and the four lenses cover "the whole page as one design and one journey"? What state, criterion or view is missing, and what is waste?
2. Method: will the measurements actually show what each lens claims (e.g. zoom proxies, text-only zoom, the accessibility tree, the keyboard journey, focus appearance area)? Where would the walker give a false pass?
3. The six fixes' verification: is it enough to know VH-164 to VH-169 hold, and are the cross-fix effects the right ones?
4. The partnership: are your touchpoints at the right moments, is the blind review really blind, is the disagreement rule workable, and is the per-commit check practical?
5. The stages and tickets: are they session-sized (a chat manages one or two items before a 200k-token limit), are the acceptance criteria checkable, and is the evidence kept small? Should any stage split or merge?
6. The owner's rule (simple: consolidate, no new control, checkbox or element; the progress bar stays) and the record's rules (pm-next v3.1: AGENTS.md, items schema, backlog budget 1,000 words, decisions slice 1,000 words).
7. The person checks for Disability Support Services: right, complete, plain enough?

Format: a one-paragraph verdict (approve, approve with changes, or revise); then numbered points P-01 onward, each "P-nn Title — must / should / could", with what is wrong, why (file:line or the rule), and the smallest change to the plan; then "What is right"; then anything you would ask the owner. Prefer fewer, sharper points.

The draft plan follows.

# Draft plan — the second design, UX and accessibility pass (PLAN-7)

Owner's words: "lets design and run another full design / ux / accessibility pass. thorough planning and ticketed before execution". The owner wants Codex astra as a full partner at every stage; in VH-163 it did a blind review and critiqued the report, but checked none of the six fixes (VH-164 to VH-169).

## What it builds on

- The 20 October audit (`reviews/2026-10-20/`): 64 page states (`states-2026-10-20.md`) and the 86 WCAG 2.2 criteria judged (`wcag-2026-10-20.md`), findings V-01 to V-17.
- The 21 October design pass (V-18 to V-30) and the 22 October design pass (`reviews/2026-10-22/design-pass/`, V-31 to V-39), its walker (`evidence/measurements/walker/`: walk.mjs, design-walk.mjs, inventory.mjs, wcag-checks.mjs, fixtures.sh) and its fix measurements (vh165 to vh169).
- No finding V-01 to V-39 is found again; this pass continues from V-40. Every VH-164 to VH-169 fix is re-verified.

## Scope

The whole page as one design and one journey, step by step and state by state.

- **States.** The 64-state catalogue of 20 October, updated for what shipped since (`d38ee79` to `6a207b3`), each marked walked or source-only with the reason. At least: first load (empty, translated notice), drag and a refused drop, reading and checking, ready with its verdict; the pre-flight warnings (captions lost, a cut-short file, quiet and loud audio, a long job, 4:3, no audio, too short); the title card off, on, refused and filled, the submission card and Internal use only; trim valid, invalid, by drag, by keys and typed; each closing, None disabled; each output; a running job (progress, time left, announce progress, Cancel, stopping); the result (save, save stopped or cancelled, discard, a second video); failures (not a video, an undecodable ProRes, a file cut short mid-run; storage full source-only); errors captured and Report this problem; the feedback dialog (empty, filled, refused); the system check; the accessibility statement; the footer; a language switched mid-task and a remembered language.
- **Languages.** English, Simplified Chinese, Bahasa Malaysia.
- **Views.** 1280 × 900; 375 × 812 with mobile emulation; 320 × 568. 200% and 400% zoom (a 640 px and a 320 px layout at DPR 2 and 4, named as proxies for browser zoom); text-only 200% (Chrome's default font size at 32 px), which a page-zoom proxy cannot show.
- **Modes.** Light, dark, emulated forced colours (a light and a dark system palette), WCAG 1.4.12 text spacing, prefers-reduced-motion.
- **Input.** Keyboard alone, the whole journey from load to a saved file and a second video, in each language at 1280 and in English at 320.

The automated matrix measures every state in every language at the three widths in light; dark, forced, the zooms, text-only zoom and spacing on the key states (empty, ready with warnings, running, finished, a failure, the dialog, the statement). Screenshots are taken for all but committed only where a finding or a verification cites them.

## Lenses

1. **Visual design — Carbon productive.** Hierarchy (one primary per state, the step heading leading), rhythm (one gap per relation), alignment (left edges as anatomy), density (page height per state against 20 October), the eight type roles held by every text element in every state (no element off its role; 13 styles), the one 28rem measure held by every running-text block, component states one look per kind (rest, hover, focus, pressed, disabled, invalid, locked, running, finished), dark and forced colours as designed states, not afterthoughts.
2. **UX — Nielsen's ten.** Each heuristic judged end to end with evidence; the conveyor's flow (what blocks Create, what the next action is in each state, the cost of a second video); error prevention and recovery per failure and per pre-flight warning; wording against UI-STANDARDS (sentence case, label equals accessible name, one name per thing across the page and the three languages, helper text only where it prevents an error); the three languages checked for parity and consistency, not fluency.
3. **Accessibility — WCAG 2.2 AAA.** The 86 criteria re-judged with a verdict each (met, met-in-source, gap, n-a), the 20 October table as the baseline and the change since noted; measured where it can be: 1.4.3/1.4.6 and 1.4.11 (control boundaries, the focus ring, the progress bar), 1.4.4 (text-only zoom), 1.4.8 (line counts, spacing), 1.4.10 at 320 and 400%, 1.4.12, 1.4.13 (the toggletip), 2.1.1/2.1.3 and 2.1.2 by the keyboard journey, 2.4.3 order, 2.4.6/2.4.10 headings, 2.4.7/2.4.11/2.4.12/2.4.13 (area and change of contrast, not only thickness), 2.5.5/2.5.8, 2.3.3 reduced motion, 3.1.2 parts' language, 3.1.5 the English reading level, 3.2.x no change of context, 3.3.x errors, 4.1.2 names, roles and states from Chrome's accessibility tree, 4.1.3 status messages from the live-region log. The walker is reused, copied into the new bundle and extended (states, views, the AX tree, the keyboard journey, text-only zoom, reduced motion); the old bundle keeps the walker as VH-163 ran it.
4. **The six fixes verified.** VH-164 to VH-169, each criterion re-checked at HEAD with a verdict (holds, partial, regressed) and the cross-fix effects looked for (the 28rem measure under text-only zoom and 400%, `overflow-wrap: anywhere` on Chinese, the type roles at 320, pressed fills in the band and forced colours).

## The Codex astra partnership

Run as `codex exec -m gpt-6-astra -s read-only`, a brief on stdin, the output kept verbatim in the bundle beside its brief.

1. **The plan** (this stage): Codex critiques this plan before the owner sees it.
2. **A blind review**, launched at the start of the review from a brief, before Claude writes any finding; from source, the record and the six fix diffs (it re-checks VH-164 to VH-169 itself, which it did not do last time). Claude's draft findings stay outside the checkout until the blind review is saved.
3. **A critique of the merged draft report.**
4. **A critique of the fix plan.**
5. **A check of every fix commit** before it closes: Codex reviews the item's diff and evidence; the commit carries `Checked: gpt-6-astra — <verdict> — <scope>`.
6. **A check of the fixes together** at the end of the fix stage: the diff from the pass's start, against the after-walk.

Disagreements. A disagreement of fact (what the page does) is settled by evidence, live or in source, and both views stay in the record. A disagreement of judgement (whether it is a defect, its rank, the remedy) is recorded with both positions in the report's "After Codex astra's critique" table; whatever remains goes to the owner in the fix-plan ask, and nothing contested is built until the owner answers. A fix check that fails is fixed before commit, or, if Claude disagrees, the item stays open and the point goes to the owner. The Checked line states the verdict as Codex gave it.

## What a person must still check

For Disability Support Services colleagues, whom the owner is asking; in plain words, one page, with how to report back (the feedback address). Their results feed VH-137's statement and spec §13 criterion 10; the pass does not wait for them.

- NVDA with Chrome on Windows: the whole journey, what is announced at each stage, the dialog, errors, the trim sliders, the language switch.
- VoiceOver with Chrome on a Mac: the same journey.
- Windows contrast themes (Aquatic, Desert, Dusk, Night sky): every control visible, focus visible, the progress bar and the trim handles drawn.
- Real phones: an Android phone with Chrome (and TalkBack if they use it) and an iPhone (with VoiceOver if they use it); links to VH-113.
- If time: browser zoom at 200% and 400% and Windows text size at 200% on a real screen; voice control (Voice Access or Dragon) saying the visible labels.

Outside DSS: a native reader of Chinese and Malay (the owner's colleagues), already open in VH-137.

## Stages — one ticket each

The owner's standing rule holds at every stage: the app stays simple; consolidate; no new control, checkbox or element; the progress bar stays. A remedy that would need a new element goes to the owner flagged, recommended against, as VH-168 did.

Evidence kept small: the report, Codex's files verbatim with their briefs, the walker, one short digest per instrument, and only the captures a finding or verification cites; the full run stays in the scratchpad. A new bundle, `reviews/<date>/design-pass-2/`.

Each item is about one session (each chat manages one or two items before its 200k line); each names its session plan in its Now.

- **VH-170 — The plan, with Codex astra's critique.** This session. Closes with the owner's approval in this commit.
- **VH-171 — The evidence and the six fixes verified.** Codex's blind review launched first (background). The walker copied and extended; the matrix run; one digest per instrument; the state catalogue updated (walked or source-only); VH-164 to VH-169 verified, the table kept outside the checkout until Codex's review is saved. Acceptance: the matrix as listed, digests committed, the blind review saved verbatim, no product change.
- **VH-172 — The review judged.** The three lenses from VH-171's evidence: visual, UX (Nielsen's ten table), WCAG (the 86-criterion table); draft findings from V-40 with saw, standard, direction, source, evidence and rank; the DSS checklist written. Acceptance: every heuristic and criterion has a row and a verdict; every finding an evidence line; no product change.
- **VH-173 — The report, with Codex astra's critique.** Claude's and Codex's findings merged, each Codex finding verified live or in source; the report in VH-163's format with "What held up", "Set aside", the fix verification table and the DSS checklist; Codex critiques it; applied or disagreed with reasons; the open disagreements listed for the owner.
- **VH-174 — The fix plan, with Codex astra's critique.** `verbs/plan.md`: rank 1 and 2 findings planned as items in Phase 7 ahead of VH-175, each with a file; rank 3 to the owner as proposals or wish lines; Codex critiques the plan; one ask to the owner: the plan, the open disagreements, the rank 3 proposals. Nothing is built before the owner approves. A rank 1 finding may be fixed at once on the owner's word, as VH-164 was.
- **VH-175 — The fixes, each checked by Codex astra.** The stage rule every fix item keeps (before and after measured with the walker; three languages and three modes; WCAG re-checked for what it touched; no new element; the gate green; Codex's check before commit and its Checked line), then, after the last fix: the whole matrix walked again as the pass's after-evidence and Codex's check of the fixes together. Closes when every fix item has shipped.
- **VH-176 — The close.** The phase reconciled against PLAN-7's Items; the report's disposition table final; UI-STANDARDS, the spec (as wish lines) and the statement (into VH-137) brought up to date; the DSS checklist handed to the owner with what it would settle; VH-162's block lifted; `verbs/recall.md` run.

## Order

A new Phase 7 after Phase 6 in the backlog: VH-171, VH-172, VH-173, VH-174, then the fix items, VH-175, VH-176. VH-162 gains "blocked: Phase 7" so the cut waits for the pass. VH-137 and VH-14 are unaffected.

Owner checkpoints: this plan; the fix plan (VH-174) with any disagreement; any rank 1 found mid-review; the close.
