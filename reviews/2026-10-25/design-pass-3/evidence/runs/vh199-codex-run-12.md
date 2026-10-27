<!-- markdownlint-disable -->
<!-- VH-199: Codex astra's blind attribution of run-12 (codex exec -m gpt-6-astra -s read-only), from vh199-codex-run-12-brief.md; the reply, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

1. **Whole: yes.** Frozen `parts.mjs` `RUNS` and `run.json` match exactly: J2 3, J3 3, J4 3, K-dialog 3, K-player 4. **16 declared, 16 written, 16 ok, 0 failed; 0 superseded attempts and 0 resumes.** Every record uses `2e7b0c044ce11f2b`; the frozen walker’s hashes match that revision. The manifest pins source `a3039c3` and Chrome 156.0.8078.48. No ok record lacks declared evidence: each requires `keys`, and its `expects` step count matches both the frozen route and recorded steps—22/45/28/18/16 respectively.

2. **Attribution:** all **403 route steps**, including documented setup/wait entries, pass. Recursive inspection of every record’s `instruments` found **no failed or “cannot determine” outcome**. The raw false readings and alarming log lines are accounted for:
   
   - **J3, all three records:** 15 `focusVisible:false` readings are the five documented reload/setup steps per record, leaving focus on `body`. Expected setup behaviour, not an app finding or instrument fault.
   - **K-dialog, all three records:** three `focusVisible:false` readings occur at step 7, the permitted browser-controls stop represented as `body`. Subsequent steps return inside the dialog; Escape restores opener focus. Expected native-dialog behaviour under `IN_DIALOG_OR_OUT`.
   - **K-player, all four records:** 28 `focusVisible:false` readings occur inside the native player, including the seek setup. `qualify.mjs` probes the `<video>` host’s `:focus-visible`; the frozen route explicitly uses `noFocusRing` and accessibility-node/state assertions for native controls. Those assertions pass. This is the declared measurement boundary: native ring judgments belong to S-127/`phase8.mjs` and the player proof.
   - **J3’s save-error, uncaught-error and clipboard-warning logs:** deliberately induced by F4e, F8 and F5 respectively. F8 dispatches the “Deliberate audit error”; it is not evidence of an unplanned crash. Recovery assertions pass.

   Evidence read: manifest, declaration, digest, all 16 records’ instruments, both run logs, all 16 group logs, relevant frozen plan/route/validation/fault code and player proof. All 32 capture hashes and seven fixture hashes also match their ledgers. Applied the WCAG digest’s keyboard/no-trap rules, 2.1.3 and 2.1.2, without treating the host probe as a rendered 2.4.13 measurement.

3. **Stop: none identified.** No trust-invalidating instrument fault, coverage reduction, or evidenced rank 1 app problem in this run. The supplied grouping/resume and other scenario-specific gaps do not arise here.

**Fit**