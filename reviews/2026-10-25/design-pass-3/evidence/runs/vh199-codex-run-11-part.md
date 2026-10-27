<!-- markdownlint-disable -->
<!-- VH-199: Codex astra's blind attribution of run-11-part (codex exec -m gpt-6-astra -s read-only), from vh199-codex-run-11-part-brief.md; the reply, copied verbatim from the orchestrator's notes folder at the close, 2026-10-27. -->

1. **Whole: yes.** The frozen run-11 plan filtered to the 22 IDs and the part’s `run.json` both declare **111 records**; their complete declarations match. Written: **111; ok: 111; failed: 0**. All are attempt 1, revision `2e7b0c044ce11f2b`. No missing required instruments or expected subjects, expired states, or identity discrepancies. The frozen runner’s read-only verification returns whole, without problems.

2. **Reconcile: 113/113 accounted for exactly once.** Run-11 declares 113 records: 111 walked plus these two held, **not passed**:

   - `S-133__zh-Hans__w320__light`
   - `S-133__ms-MY__w320__light`

   Nothing else is missing, duplicated or supplied by a failed attempt. There is no `superseded/` directory; the helper confirms zero resumes.

3. **Attribution.** I read every record’s instrument contents, the manifest/declaration/digest, both logs and all 111 group logs; checked the relevant frozen walker code, player proof and app save code. All 645 listed artifacts match their sizes/hashes; record references and the artifact/fixture ledgers reconcile.

   - **S-132, both languages, w320/light:** four failed player rows—metadata loading and accessible host name—and two “cannot determine” control inventories are **expected F15b effects**, not new app faults. Both records capture MediaError 4; all six save-subresult assertions pass, including writing 1,091,493 bytes each.
   - **S-138, both languages, w320/light:** two unresolved completion-warning measurements are an **instrument limitation under the intended language-changing setup**: completion occurred in English, then the page changed language (`scenarios.mjs:2342–2347`, `phase8.mjs:837`). Retained-warning assertions pass. These rows remain unverified for VH-200.
   - **S-138 and S-151, both languages:** four failed native-scrubber target rows carry the documented **2.5.5 user-agent exception**. Their player aggregates correctly pass. S-138’s finish+1s rows have `player:true`, paused at zero; the known detached-player timing fault does **not** occur here.
   - **All eight S-06b records:** 16 failed target rows concern the email/EASS links and carry the **2.5.5 inline exception**. Applied the WCAG digest’s stated target exceptions.
   - **Trim targets:** 174 unresolved rows across 87 records concern circular 44×44 hit areas—**known interpretation work for VH-200**. Four additional such rows in S-132 are explicitly exempt because disabled.
   - **Trim contrast:** 178 unresolved thumb/track rows across 89 records are the **declared pixel/person check**.
   - **Mixed-script measure:** 11 unresolved rows across ten zh-Hans/w1280/light records—S-06b, S-09, S-25a/b, S-32, S-35, S-39, S-44, S-87, S-ID2—are **1.4.8 interpretation work**, not instrument corruption.
   - **Logs:** the only warnings are S-138’s two deliberate F4d save-to-download fallbacks. S-25a/b’s long pauses accompany the 10,800-second fixture/F13 setups; all complete. No grouping failures or retries occur. Load and power-mode changes qualify timing comparisons.

4. **Stop: none evidenced.** No corrupting instrument fault, additional coverage reduction, or rank-1 app problem appears.

**Fit with a named gap — S-133’s two records held because the frozen setup lacks beforeunload handling.**