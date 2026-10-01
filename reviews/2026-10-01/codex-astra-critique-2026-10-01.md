# Codex astra — adversarial check of the merged spec gap review, 1 October 2026

Codex astra (`gpt-6-astra`, read-only) checking the merged draft of
[spec-ux-accessibility-gaps-2026-10-01.md](spec-ux-accessibility-gaps-2026-10-01.md)
before it was committed: every path and line, every rank, every proposed
correction and every ticket owner, plus what both passes missed. Kept as
written. Each of its 35 points was verified against source and applied to the
report; the two gaps it added are A-19 and A-20. Its line numbers refer to
the draft, not the committed report.

---

1. A-01 — retain rank 2: the policy mismatch is real, and doc-delta §9.3 is the right destination. Restore S-01’s mitigation and maintainer-disposition fields; distinguish accepted limitations from achieved conformance. D6 already requires argued, recorded exceptions (`docs/03-open-decisions.md:106–110`).

2. A-01 — make the replacement technically precise: 44 × 44 CSS px targets, focus-indicator area and changed-pixel contrast, and separate enlargement/reflow checks. Remove the unsupported assertion that the polite-live-region sentence *caused* U-08; it leaves announcement frequency unspecified (`docs/01-specification.md:530–532`).

3. A-02 — retain rank 2, with §13/VH-M4 ownership. The proposed successful Choose-to-Save walk does not restore T-01’s complete assessment: require criterion-level evidence or limitations across errors, cancellation, retries, retained results, feedback and translated states, plus explicit completion/deferral of phone and speech-input checks (`backlog.md:290–299`).

4. A-03 — retain rank 1, but correct the lifecycle claims. Ordinary reload can trigger `beforeunload`; crashes and forced termination cannot be relied upon to do so. Wake protection depends on visibility and browser policy, not universally on being the frontmost window; sleep need not permanently destroy the job. See [beforeunload guidance](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event) and `keep-awake.ts:43–44`.

5. A-03 — correct `keep-awake.ts:83–87`: refusal is logged at **88–90**, while release at **80–82** is not logged. `:123` starts the predicate; **123–131** establishes unsaved-result protection. `opfs.ts:177` starts its documentation; **190–205** implements the sweep.

6. A-03 — “save it now” is not sufficient protection. No recovery is a defensible current architectural default, consistent with `AGENTS.md:486–504`, but remains a disclosed loss risk: explain reload/closure before Create and beside the result, preserve leave warnings and streaming-save protection, and require download completion checks. Restore S-06/T-07; add VH-113 lifecycle verification alongside VH-109/VH-107 and VH-110’s save work.

7. A-04 — I accept S-05’s rank 1 → 2 reduction because the existing hand-off wording avoids claiming completed delivery, **not** because iPhones lack Downloads: they have a Downloads folder in Files. Correct `src/main.ts:1584` to **1586**. Give only destination information actually known, with tested retrieval guidance. [Apple’s instructions](https://support.apple.com/en-gb/102440).

8. A-04 — restore T-06’s omitted acceptance cases: picker success/cancellation/failure, fallback retry, locating the correct output, and starting again during an unconfirmed download. Keep VH-114/VH-113, but restore **VH-107** ownership of result retention/discard; the existing consequence warning is at `src/main.ts:1309–1312`.

9. A-05 — restore rank **1**: S-07 was lowered without explanation, although publishing the wrong version meets the report’s rank-1 definition. VH-107 is correct, but restore identity in the discard question, requested/applied closing, retained-choice clarity and new-source trim reset. Cite the record at `src/main.ts:1121–1138,1527–1530`, rather than `:1141` alone; add the omitted §9.1 contract.

10. A-06 — retain rank 2, but reject the claimed closure of 2.2.4. Pressing Create does not establish user control over every later interruption; stage-only delivery reduces frequency without establishing suppression/postponement. Section 9.2 bans codec, bitrate and loudness settings, **not accessibility controls** (`docs/01-specification.md:518–519`). Restore S-04/T-03 under VH-109. [W3C 2.2.4](https://www.w3.org/WAI/WCAG22/Understanding/interruptions.html).

11. A-06 — replace “each press is heard twice” with “two announcement paths exist; verify duplication with AT”. The seven cited regions exist, but source cannot establish what is spoken. Nor should the correction prohibit every immediate control-result announcement: validation and consequential status still need accessible exposure. Restore T-03’s separate updating-presentation check. [W3C status-message guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

12. A-07 — retain rank 2/VH-111, but `activeElement === body` is not proof that moving focus is welcome: a screen-reader user may be reading. Restore focus only when the transition displaced it, with explicit modal protection. The feedback example is overstated: `src/main.ts:1679` uses `showModal()`, which makes outside content inert. [Modal behaviour](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal).

13. A-07 — 3.2.5 also permits a mechanism to disable automatic context changes; the report omits that alternative. Restore T-04’s dropped announcement checks for pre-flight sound warnings, output warnings, missing/substituted branding and save outcomes (`backlog.md:173–179`). Save is disabled at `main.ts:1541,1614`; `:1603` changes its label. [W3C 3.2.5](https://www.w3.org/WAI/WCAG22/Understanding/change-on-request.html).

14. A-08 — retain rank 2, but restore S-02/T-02’s omitted user-selected colours, paragraph spacing, accessibility overrides and **40-glyph CJK limit**. A 70ch token alone cannot close 1.4.8: the criterion requires available presentation mechanisms, which may be supplied by a verified user agent. VH-112/VH-M4 should coordinate with VH-105/VH-113. [W3C 1.4.8](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html).

15. A-08 — label “100/120 characters” as estimates, not measured defects: `app.css:151,158` gives rem widths, not character counts, and panel padding reduces usable width. Cite or remove the unsourced Carbon “60–80” attribution. Separate 200% enlargement from 320 CSS-pixel reflow; neither substitutes for the other.

16. A-09 — retain rank 2 as an acceptance gap; withdraw “passes today”. Token-pair tests (`test/contrast.test.ts:118–121,135–136`) do not establish every rendered indicator’s area and changed pixels. The thumb’s negative offset is not automatically a failure either. Restore S-03/T-02 verification under VH-112; prescribing `Highlight` alone does not prove contrast. [W3C focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html).

17. A-10 — retain rank 2/VH-114, but reject the blanket abbreviation exception: **HDR, fps, MB and GB have expansions**. File-format identifiers need individual treatment, not a collective exemption because they are familiar names. Restore S-08/T-08’s meanings/expansions requirement; any deliberate unmet criterion remains a limitation. [W3C 3.1.4](https://www.w3.org/WAI/WCAG22/Understanding/abbreviations.html).

18. A-10 — the copy inventory omits strings in `src/main.ts`, configuration and worker/error paths; static markup plus `src/ui/*.ts` is incomplete. Approved labels are not automatically readability exemptions; simpler supporting content is permitted. Correct citations: **Container `source-panel.ts:194`; kHz `:172`; Mono `src/ui/format.ts:99–102`**. [W3C reading level](https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html).

19. A-11 — retain rank 3 **pending timing**, but remove the assumption that analysis rate is invariant under trimming. Re-analysis also determines warnings and whether the kept part contains sound, affecting AAC gating (`job.worker.ts:473–507`); §5.4 warnings are not optional. The probe contains three seconds of source video, not necessarily three seconds of elapsed work. Keep VH-108 for stale/rechecking state and add VH-110 for cancellation.

20. A-12 — restore rank **2**: S-12’s reduction has no stated reason, and misleading blocked users is real friction. Narrow the evidence: the OPFS promise is at `preflight-panel.ts:41`, outside **27–40**; insufficient-storage advice at **46–47 already says to free space**. Neither University-wide Edge defaults nor “passes every check” is established by the cited source.

21. A-12 — VH-108/VH-110 are appropriate, but the correction must amend **§10’s guarantee at `docs/01-specification.md:555–558`**, not merely §7.3. Explicitly identify that wording as revising VH-98 (`decision-log.md:600–605`). Keep the settled Chrome recommendation; softening the introductory browser line remains a separate maintainer decision.

22. A-13 — I accept S-13’s rank 2 → 3 reduction for documenting an existing, functioning route, but the merge supplies no reason: add one. Replace “a service commitment nobody has made” with “no response commitment found in the reviewed records”. VH-114 owns that wording; §9.2/§11 are appropriate contract destinations.

23. A-13 — T-12 is substantially dropped without explanation. Restore an acceptance owner, preferably VH-M4 coordinating VH-105/VH-111: feedback during blocked/running states, modal focus return, retained drafts, disclosed details, absent email handler, clipboard failure and understandable translated help. These are not covered by assigning only the reply sentence to VH-114 (`main.ts:1676–1778`).

24. A-14 — restore rank **1**: S-10 was lowered to 3 without a reason, although lost accessibility alternatives can exclude viewers. “The new file has no captions” and burned-in captions “are unaffected” are both too broad: separate tracks are lost; picture captions remain subject to trimming and overlay. Restore extra-track alternatives, scan limitations and publication checks under VH-114, with VH-111 announcements.

25. A-14 — correct the warning citation from `source-panel.ts:183–200` to **72–89**, adding **55–68** for discarded audio/video tracks. `pipeline.ts:539–541` establishes ranged reads; **558–569** establishes overlay. EchoVideo’s stated workflow does not establish that every destination supplies suitable captions or that generated captions need no checking.

26. A-15 — restore rank **2**. The stated reason for lowering S-11 is invalid: a partial-conformance statement acknowledges nonconformance; it does not turn missing media evidence into a pass. Identify the uncontrolled preview precisely and substantiate the remaining page’s level before making that statement. Preserve flash/non-interference limitations and app-supplied-media requirements from S-11/T-10; assign acceptance to VH-M4. [WCAG conformance requirements](https://www.w3.org/TR/WCAG22/#conformance).

27. A-16 — retain rank 3: this documents an existing standards principle. Qualify the correction: put input errors beside and programmatically associate them with the relevant control; put job/device failures in the affected step with accessible recovery advice. Not every error was caused by a choice. Keep doc-delta §9.2 and explicitly link implementation to VH-108/VH-110 (`UI-STANDARDS.md:149–150,214`).

28. A-17 — restore rank **2**: S-09’s reduction is unexplained, and losing state or misidentifying language is not polish. VH-105 is correct, but restore S-09/T-09’s selected-state semantics, keyboard/touch/speech operation, all job choices, pending input, preference-storage failure and screen-reader language-change checks. Preserve its existing sign-off and native-review requirements (`backlog.md:215–242`).

29. A-17 — do not indiscriminately mark filenames as English: proper names, technical terms and indeterminate-language text have exceptions. The font stack includes system fallbacks; the defensible claim is “no explicitly verified CJK choice”, not “no CJK glyphs”. Require verified wrapping and `Intl.DurationFormat` feature handling rather than prescribing unproven CSS fixes. [W3C language-of-parts exceptions](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html).

30. A-18 — retain rank 3/wish-list, but remove “a slider nobody can use”: **Home/End already jump to bounds**, and typed times provide direct access (`src/ui/trim.ts:114–134`). A duration-dependent Page step is not config-only: the function lacks a duration argument. Correct the key-constant citation to `src/config/trim.ts:30–34`; `:33–36` omits the arrow step.

31. Exact quotations — A-01’s UI-STANDARDS quotation splices a heading into prose: the text is “Target WCAG 2.2 AAA for all applicable UI. Document exceptions explicitly” (`:185–186`). A-09 truncates its quotation without an ellipsis: the sentence continues “by sticky headers or overlays” (`:201–202`). The other cited paths resolve; substantive citation defects are identified above.

32. Disposition — restore the missing §9.3 delta for A-08 and reconcile A-10’s §9.3 proposal with its §9.2-only table entry. Preserve VH-105’s existing §9 doc-delta. Add explicit S-/T-item dispositions: the current S-only mapping hides the omissions above, while adopting the independent matrix contradicts A-10’s claimed closure of its 3.1.4 gap.

33. Additional gap — specify that Trim previews the **original source**, not the processed sound or branded output; neither pass gives this an explicit contract. `src/main.ts:886–889` assigns the source object URL directly. Add a brief clarification through §9.1/VH-114, rank 2; no new preview feature is required.

34. Additional A-13 accuracy issue — `index.html:381–383` says feedback includes video file size, while the approved allow-list expressly excludes it (`decision-log.md:535–541`; `feedback.ts:145–168`). Also scope “never a filename” to app-generated details: user-authored message text is preserved (`feedback.ts:193–194`). Assign these wording corrections to VH-114, rank 3.

35. Provenance and totals — the baseline commit/branch is correct, but the merged report’s line 34 falsely says this check’s corrections **are applied**. Mark them pending until incorporated and rechecked. No finding from my pass was raised; seven were lowered. With the rankings above, the original eighteen become **3 rank-1, 11 rank-2 and 4 rank-3 findings**.

The report is **not fit to commit as written**. After these corrections, it would be fit to commit as a source-grounded requirements review with explicit proposals and unresolved acceptance work; it would not establish WCAG conformance. I made no edits or commits and performed no running-app/assistive-technology tests; the write-requiring quality gate was not run.
