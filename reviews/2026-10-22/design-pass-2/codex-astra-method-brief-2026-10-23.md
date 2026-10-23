<!-- markdownlint-disable -->
<!-- The brief Codex astra was given for the method check of the second design pass (VH-171, touchpoint 3), 2026-10-23, verbatim; drafted in the shared notes and widened to the faults, the fault check, the fixtures and the scenario check. -->

You are Codex astra, checking the method of the UoN Video Helper's second design pass read-only. Your working directory is the repository's working tree. Do not change any file. Write a self-contained Markdown report to standard output; nothing else.

This is touchpoint 3 of PLAN-7, the method check, before the evidence run (VH-172) starts. The plan, reviews/2026-10-22/design-pass-2/plan-2026-10-22.md, says the instruments are qualified before the matrix runs, so that a bigger matrix does not repeat the last pass's overclaims. Your own critique of the plan (codex-astra-plan-critique-2026-10-22.md in the same folder, points P-02, P-03, P-04, P-05, P-06 and P-09) asked for this. Your blind review (codex-astra-blind-review-2026-10-22.md) is saved; do not repeat its findings here, but say if the method could not have caught one of them.

Read: the plan's "Scope", "The instruments", "Languages, views, modes and input" and "The six-fix contract"; project/items/VH-171.md (the acceptance criteria) and VH-172.md (what the matrix will do with these instruments); then, in reviews/2026-10-22/design-pass-2/:

- scenarios-2026-10-22.md: the scenarios S-01 onward, the catalogue mapping, the finite list for the other modes, the keyboard routes;
- evidence/measurements/instruments-2026-10-22.md: what the instruments are, how each was proved, the pilot, and how the four instrument questions were settled;
- evidence/measurements/walker/: the instruments. qualify.mjs, runner.mjs, prove.mjs and matrix.mjs are new in this pass; the rest is copied from reviews/2026-10-22/design-pass/evidence/measurements/walker/ (diff them to see what changed);
- evidence/measurements/prove-2026-10-22.json (every proof), pilot-manifest-2026-10-22.json and pilot2-manifest-2026-10-22.json (the two pilots' manifests), pilot2-digest-2026-10-22.md (the second pilot, record by record).
- evidence/measurements/walker/faults.mjs (the declared faults F1–F12, each a switch around the app, never a change to it) and evidence/measurements/faults-check-2026-10-23.json (each fault applied to the app and the state it is for asserted);
- evidence/measurements/walker/fixtures.sh (the fixtures, N1–N4 new; N2's two lengths sized by a probe, recorded in instruments-2026-10-22.md);
- scenario-check-2026-10-22.md (the scenario list checked against the source, and what was applied).

Check, and say for each whether it is fit for VH-172 as it stands:

1. No silent passes: does any instrument or the runner pass by measuring nothing, by measuring the wrong box, or by exempting too much (inert, inline, disabled, superseded)? Is "cannot determine" used where a measurement exists, or a pass given where one does not?
2. Proofs: does each proof's failing fixture fail for the reason the instrument claims to measure, and its twin pass for the right reason? Is any instrument used in the matrix without a proof? Does each declared fault reach the state it is for, and only by changing the browser around the app?
3. The four settled questions: the reference box for the file chooser's button and the range thumbs (the two thumb readings, box and painted disc); the dialog route's exit to the browser; the file button's text read by pixels; the thumbs' target area (the disc reading). Is each settlement sound against WCAG 2.2's text for 2.4.13, 1.4.6/1.4.11 and 2.5.5, or does it hide a judgement that belongs in VH-173?
4. Scenarios: is every catalogue row mapped, every addition the plan lists present, each setup feasible with the walker and the listed faults and fixtures, and the "source-only" ones justified? Is the finite list for the other modes the plan's list?
5. The enlargement records: are the four kept apart and is each honest about what it measured (the proxy views are not Chrome's own zoom)?
6. The manifest: does it carry what the plan requires (source commit, instrument revision, browser and OS, viewport, scaling method, fixture identity, expected and observed coverage, unresolved checks)?
7. Anything in the pilots that is a finding rather than an instrument fault (say so; VH-173 owns findings), and anything that is an instrument fault presented as a finding.

The owner's standing rule: the app stays simple; no new control, checkbox or element; the progress bar stays. It limits remedies, not the method.

Format: a one-line verdict ("Fit for VH-172", "Fit after the musts below" or "Not fit"); then points M-01 onward, each with a heading "M-nn Title — must | should | could", then what you saw (file:line), why it matters, and the smallest change; then "What held up"; then "Questions for the owner", if any (judgement only, not fact). A file and line for every claim. Prefer fewer, sharper points.
