<!-- markdownlint-disable -->
<!-- Codex astra (codex exec -m gpt-6-astra -s read-only), method check for the second design pass (VH-171), 2026-10-23, against the working tree after 687e2eb, kept as written. Its brief is codex-astra-method-brief-2026-10-23.md. -->

Fit after the musts below

Paths below are relative to the repository: `R/` means `reviews/2026-10-22/design-pass-2/`; `E/` means `R/evidence/measurements/`; `W/` means `E/walker/`. This review used the supplied records, source inspection and in-memory or streamed probes; it did not change files or rerun the browser matrix.

## M-01 A complete run can contain no usable measurements — must

**Saw.** `aggregate()` returns `pass` for an empty list or a list containing only exempt items. It also removes the exempt measurements, retaining only their count. A scenario with no `focus` declaration therefore passes focus; the supposedly retained “superseded” file-button reading is discarded. Disabled target failures become passes, and the inline-link exemption merely checks whether the parent contains additional text. (`W/matrix.mjs:91`, `:101`, `:104`, `:110`, `:119`; `W/qualify.mjs:99`; `E/instruments-2026-10-22.md:97`.)

The runner verifies filenames, run IDs and `status`, but not required instruments, sample coverage, record identity or state evidence. Its passing proof contains only `{status: 'ok'}`. Viewport dimensions are recorded but never supplied to the assertion; the route even passes `undefined` explicitly. State is checked before the instrument sequence, not after it. (`W/runner.mjs:47`; `W/prove.mjs:126`; `W/matrix.mjs:153`, `:157`; `W/qualify.mjs:206`.)

**Why it matters.** The no-silent-pass requirement is not satisfied. A missing measurement, an overbroad exemption or a state that expires during measurement can produce a structurally “whole” run. This particularly matters for the explicitly timing-bound S-51. (`R/plan-2026-10-22.md:112`; `R/scenarios-2026-10-22.md:160`.)

**Smallest change.** Declare required instruments, expected subjects and scenario variants alongside each record. Validate them, record identity and actual viewport/scale. Preserve exempt and superseded rows with reasons; use explicit “not applicable” or “cannot determine” when nothing eligible was measured. Replace the inline heuristic with justified exceptions. Assert state at capture time, using transition captures for transient states. Add negative runner proofs for an empty measurement, wrong view and missing variant. Keep **run completeness** distinct from **an app measurement failing**.

## M-02 Contrast can pass the wrong pixels and omit meaningful graphics — must

**Saw.** The file-button pixel reader calls the commonest colour “fill” and the most contrasting colour anywhere in the button box “ink”. That box includes the border. Its proof fixtures have transparent borders, so they do not challenge this assumption. (`W/qualify.mjs:379`, `:450`; `W/prove.mjs:22`, `:47`.)

An in-memory probe of that algorithm—a white button, black border and `rgb(180,180,180)` text—returns **21:1**, although the text contrast is **2.07:1**. The settlement therefore does not yet establish text contrast.

The ordinary text reader silently skips unparsed colours, ignores background images and ancestor opacity, and rounds before threshold comparison. `contrastExtra` checks a range input’s border, not its painted thumb/track; its SVG loop stops after one shape. The matrix has no proof for its ordinary `contrastText` reader, and the placeholder proof does not qualify meaningful-graphics coverage. (`W/walk.mjs:90`; `W/qualify.mjs:125`, `:131`, `:137`; `W/matrix.mjs:102`; `W/prove.mjs:86`.)

**Why it matters.** Text contrast under 1.4.6 and meaningful component/graphic contrast under 1.4.11 concern different colour pairs. A contrasting border cannot establish readable text. Threshold comparisons must also use unrounded ratios; large text has a different threshold. The file reader currently always requires 7:1. ([W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html), [non-text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html); `W/qualify.mjs:455`.)

**Smallest change.** Isolate glyph pixels independently of borders and other paint, or return “cannot determine”. Add the contrasting-border failing fixture and its corrected twin. Qualify ordinary text and each meaningful graphic class actually claimed; retain unsupported backgrounds/paint as unresolved. Compare unrounded values and apply the appropriate text-size threshold. Until then, the pixel-text settlement and the pilots’ blanket contrast passes are **not fit**.

## M-03 The “raw” line counts omit characters and editable text — must

**Saw.** The line reader skips every whitespace character, retains only the worst line per element and excludes inputs and textareas. It records box width but does not check the adopted 28rem measure. Its comment delegates near-limit space counting to VH-173, although the matrix has already assigned `pass`. (`W/qualify.mjs:151`, `:158`, `:169`, `:173`, `:177`.)

The proof uses comfortably overlong and comfortably short paragraphs; it cannot expose a boundary error caused by omitted spaces. (`W/prove.mjs:40`; `E/prove-2026-10-22.json:38`, `:260`.)

**Why it matters.** Fifty single-letter words contain 99 characters with their separating spaces, yet this reader counts 50. Restricting a later reread to within 15 of the limit does not repair that. The plan requires raw mixed-script counts and includes editable values in the six-fix contract. This method could not catch blind-review D-02. (`R/plan-2026-10-22.md:163`, `:177`; `R/codex-astra-blind-review-2026-10-22.md:34`.)

**Smallest change.** Preserve each rendered line’s text and counts, including rendered spaces; join inline runs belonging to the same visual line. Include editable text and an explicit house-measure reading. Add near-boundary Latin, mixed-script and textarea proofs. Keep the raw count separate from VH-173’s interpretation.

## M-04 Enlargement labels are honest; content and function checks are insufficient — must

**Saw.** Reflow, the two viewport/DPR proxies and the 32px default-font preference are distinctly configured. The manifest expressly leaves Chrome’s own zoom unresolved. Synthetic text-only enlargement is not implemented. These are appropriate distinctions, provided the fourth category is explicitly recorded as unrun. (`W/qualify.mjs:460`, `:497`; `E/pilot2-manifest-2026-10-22.json:246`; `R/plan-2026-10-22.md:83`.)

However, the overflow verdict depends only on document horizontal scrolling. Offenders do not affect it; nested clipping, overlap and lost functionality need not increase document width. The failing proof is simply a 2,000px-wide block. (`W/matrix.mjs:98`; `W/walk.mjs:104`; `W/prove.mjs:26`, `:88`.)

**Why it matters.** The plan expressly requires content and function, including dialogs, rather than document width alone. A proxy record can currently pass while text is clipped inside a fixed-height control or an action becomes unreachable. (`R/plan-2026-10-22.md:89`.)

**Smallest change.** Qualify checks for internal clipping/overlap and representative operations at enlargement and spacing settings, including dialog entry, use and exit. Add a failing fixture that loses content without widening the document. Report four separate categories: reflow; proxy evidence with real zoom unresolved; default-font preference; synthetic text-only **not run/unqualified**. No additional zoom mechanism is required merely to satisfy the conditional wording.

## M-05 Transition, accessibility-tree and motion evidence is too shallow — must

**Saw.** The matrix takes one accessibility-tree reading after setup. The reader constructs detailed nodes but returns a filtered summary: it drops ordinary static text and tree relationships, retains live-region names rather than their content, and checks modal leakage only for focusable nodes. The inherited DOM observer watches `hidden`, not live-region attribute changes, and the matrix never persists its mutation log. (`W/matrix.mjs:100`, `:159`; `W/qualify.mjs:223`, `:249`, `:254`; `W/walk.mjs:39`, `:55`.)

Keyboard steps retain destinations and Boolean outcomes, not the observed values/status supporting their predicates. Keydown is immediately followed by keyup, so the route cannot capture the six-fix contract’s held keyboard-pressed appearance. (`W/qualify.mjs:279`, `:313`, `:317`; `R/plan-2026-10-22.md:180`.)

Motion is a list of computed animation/transition declarations, converted directly to pass/fail. It neither establishes actual interaction-triggered movement nor distinguishes essential motion or colour-only transitions; no motion proof exists in the proof suite. (`W/qualify.mjs:180`; `W/matrix.mjs:108`; `W/prove.mjs:86`.) Those distinctions matter under [WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).

**Why it matters.** These instruments cannot substantiate the promised transition-level exposure evidence. The current scenario focus origins also do not exercise D-01’s three cases; measuring the final state would not repair that omission. (`R/plan-2026-10-22.md:123`; `R/scenarios-2026-10-22.md:157`, `:162`, `:174`, `:181`; `R/codex-astra-blind-review-2026-10-22.md:12`.)

**Smallest change.** Prove one complete asynchronous keyboard route with text entry, a disappearing focused control, retained values and before/after status evidence. Persist relevant AX subtrees and timestamped DOM/live-attribute changes; label these as exposure, not speech. Add separate keydown/capture/keyup support. Qualify motion using a triggered spatial-animation failure and corrected twin, with essential motion explicitly classified. The progress bar’s existing essential-content reading remains in force. (`R/plan-2026-10-22.md:167`.)

## M-06 The scenario contract still has omissions and broken journey links — must

**Saw.** All 64 catalogue rows are mapped, all listed additions now have scenarios, and the finite list contains the plan’s eleven states. But:

- Submission-ID errors are explicitly excluded despite the six-fix contract requiring the invalid ID. Both long-name fixtures exist, but the list does not declare their required finished/previous/discard combinations with spacing. (`R/scenarios-2026-10-22.md:250`; `R/plan-2026-10-22.md:176`; `W/fixtures.sh:43`.)
- The finite-mode introduction omits reduced motion, which VH-172 explicitly requires. (`R/scenarios-2026-10-22.md:257`; `project/items/VH-172.md:9`.)
- J3 moves from F4e’s save failure to successful saving without restoring the faulted service. F4e installs a persistent throwing object-URL wrapper. (`R/scenarios-2026-10-22.md:294`; `W/faults.mjs:108`.)
- J4 moves from an unreadable replacement to the discard question without restoring a valid job file. Selection clears `jobFile`; Create refuses before the discard question if there is no job file or the card is invalid. (`R/scenarios-2026-10-22.md:296`; `src/main.ts:1413`, `:2721`.)
- Compound rows such as S-37, S-55 and S-80 contain distinct outcomes, while record identity has no subcase dimension. (`R/scenarios-2026-10-22.md:146`, `:164`, `:189`; `W/runner.mjs:18`.)

**Why it matters.** Catalogue completeness is not executable coverage. One successful variant could satisfy a record that purports to cover several, and the six-fix verification could omit expressly required cases.

**Smallest change.** Restore the contract cases; declare variants or required subresults; add reduced motion to the finite-mode statement. Make J3’s service restoration and J4’s valid-file/card prerequisites explicit setup boundaries. Keep S-27 and S-91’s conditional source-only portions separately accounted for: a successful closing-fallback run must not count as metadata-loss evidence. (`R/scenarios-2026-10-22.md:136`, `:200`.)

## M-07 Qualification still overstates some fixture and fault coverage — must

**Saw.**

- S-19 expects a distortion warning, but `loud-30s` applies +12dB to FFmpeg’s sine source rather than producing clipping. A streamed 30-second AAC reproduction of that recipe measured **−4.3dB true peak**. The app’s clipping warning requires ceiling samples or a peak above full scale. (`R/scenarios-2026-10-22.md:128`; `W/fixtures.sh:28`; `src/config/audio.ts:245`; `src/audio/warnings.ts:105`.)
- N2’s 21,600-second slow fixture is extrapolated, not yet confirmed. The instrument narrative and current item acknowledge the outstanding probe; the fixture comment incorrectly describes the slow band as already probed. (`E/instruments-2026-10-22.md:228`; `project/items/VH-171.md:22`; `W/fixtures.sh:57`.)
- F1’s check proves pending, then releases the worker; it does not prove the declared deadline-expiry state. F4b’s test accepts either “Saving” or “Saved” and does not require its `slow` flag or exercise stopping. The saved run does show `slow: true`, so that observation itself is valid. (`W/faults.mjs:64`, `:215`, `:225`; `E/faults-check-2026-10-23.json:100`.)
- The file-focus proof changes both the ring and padding between twins. It proves rejection of that weak/clipped ring, but does not isolate the narrative’s claimed clipping of an otherwise identical 2px ring. (`W/prove.mjs:45`; `E/instruments-2026-10-22.md:114`.)

**Why it matters.** These are qualification gaps, not reasons to rewrite expected app behaviour. In particular, a quiet distortion-warning scenario could otherwise become a misleading pass.

**Smallest change.** Produce and assert an actually clipping S-19 fixture; finish the already-listed slow-band probe and correct its description. Assert both F1 states and F4b’s saving/stopped outcomes. Retain the matched state text in fault evidence rather than truncating the beginning of the whole page. Add a file-focus pair differing only in clipping room. Re-run these focused proofs before the matrix.

## M-08 Evidence files can overwrite one another, and unresolved checks are incomplete — must

**Saw.** Focus-image filenames omit language. Pilot 2 writes English and Chinese records for the same scenario/view/mode into the same run directory, so the later language overwrites the earlier images. Whole-page captures use a directory derived from plan/scenario/language/view without the unique run ID, allowing later runs to overwrite them too. (`W/matrix.mjs:82`, `:85`, `:113`, `:143`; `W/walk.mjs:206`, `:431`.)

The manifest carries the required source commit, instrument hashes, browser/OS, actual viewport, scaling description and fixture hash. Its coverage is nevertheless counts rather than expected/observed identities, and its unresolved list is hard-coded: it omits measured thumb uncertainties and the enlarged textarea uncertainty visible in the digest. Fixture collection is also hard-coded to `lecture-60s.mp4`. (`W/runner.mjs:84`; `W/matrix.mjs:175`, `:181`; `E/pilot2-digest-2026-10-22.md:72`, `:100`.)

**Why it matters.** Correct numeric JSON can point to another language’s image or a later run’s capture. “43 observed” and three generic unresolved entries do not provide the plan’s required evidence accounting. (`R/plan-2026-10-22.md:119`.)

**Smallest change.** Put every capture under the unique run directory and name it with the full record key, variant and subject; refuse overwrites. Include artifact hashes/links, expected and observed keys, and all used fixtures. Derive unresolved entries from measurement outcomes as well as manual limitations, distinguishing missing measurement from unresolved interpretation.

## What held up

The copied walker files retain their earlier behaviour; the substantive measurement changes are concentrated in the new qualification/runner/proof/matrix code, the new fault module and fixture additions. That makes the remaining defects traceable rather than a reason to restart the pass. (`E/instruments-2026-10-22.md:3`, `:167`; `W/fixtures.sh:47`.)

The saved proof outcomes match their configured expectations. The ordinary/scrolled focus, accessible-name, basic target, modal-background, keyboard-reachability and fallback-font pairs provide useful evidence within their stated scope. They do **not** qualify every matrix claim: ordinary text contrast and motion lack proofs, while line count and overflow proofs cover narrower behaviour than their reported labels suggest. (`W/prove.mjs:86`; `E/prove-2026-10-22.json:3`, `:248`, `:287`, `:326`, `:495`, `:559`.)

The fault mechanisms are environmental shims rather than product edits. Worker preludes preserve the original worker source after the injected API behaviour. F10–F12’s recorded checks include Check again, successful retry, and locks lifting; these materially improve the earlier scenario feasibility. F7 is honestly a synthetic preview-error event, not proof of a real decoder failure. (`W/faults.mjs:43`; `E/faults-check-2026-10-23.json:62`, `:72`, `:82`; `R/scenarios-2026-10-22.md:51`.)

The four settlements stand as follows:

| Settlement | Fitness for VH-172 |
|---|---|
| **File-button and thumb focus references** | The file button is a defensible subcomponent reference; measuring the entire input was wrong. Retaining both thumb readings exposes the remaining judgement. However, the reading named `box` actually uses a **circular** perimeter formula: label it as the 44px circular reference, not a rectangular band. The visible component must determine the reference, not merely where CSS happens to draw an outline. (`W/qualify.mjs:407`, `:425`; [W3C focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html).) |
| **Dialog exit to the browser** | Fit as a page-focus route: allowing departure while checking re-entry, no background focus, Escape and return is sound. `activeElement === body` establishes absence of element focus, not independently that browser chrome received it; describe that inference accurately. (`W/qualify.mjs:284`; `W/matrix.mjs:62`; `E/prove-2026-10-22.json:422`.) |
| **File-button text by pixels** | Not fit until M-02. The current proof validates its simple fixture colours, not identification of text pixels. (`W/prove.mjs:47`; `W/qualify.mjs:382`.) |
| **Thumb target disc** | Fit as retained geometry with adjudication explicitly outstanding. Hit dimensions/area are measured; “cannot determine” here means an unresolved interpretation, not absent measurement. Do not silently turn the instrument’s inscribed-square test into WCAG’s normative wording. Keep the hit geometry and any exception available to VH-173. (`W/qualify.mjs:108`; `E/instruments-2026-10-22.md:102`; [WCAG 2.5.5](https://www.w3.org/TR/WCAG22/#target-size-enhanced).) |

The catalogue mapping and the eleven-state finite list hold up. The source check’s corrections—including separate closing fallbacks, the save-failure mechanism and the additional failure states—are substantially applied; M-06 concerns the remaining executable contract, not missing catalogue rows. (`R/scenarios-2026-10-22.md:202`, `:218`, `:260`; `R/scenario-check-2026-10-22.md:24`, `:28`, `:42`.)

The pilot’s file-button focus-area deficit and the 32px-font thumb result belong in **VH-173 as candidate app findings**, with severity and criterion interpretation still to be judged. The forced-light 480/498 result also needs that judgement. The older whole-input references, Tab-to-body failure, computed file-text reading and fallback boot failure were instrument defects; the record correctly documents their replacement or repair. M-07 limits the claimed clipping proof without converting the observed deficit into an instrument fault. (`E/instruments-2026-10-22.md:62`, `:81`, `:141`, `:192`.)

Without repeating the blind findings: the method as written could miss **D-01** through untested focus origins and **D-02** through excluded editable text; **D-03’s** styling requirement is not established by pixel-area compliance alone; **D-04’s** relevant input branch is not exercised by the listed 25fps fixtures. Source and semantic review therefore remain necessary alongside the matrix. (`R/codex-astra-blind-review-2026-10-22.md:6`, `:34`, `:66`, `:100`; `W/qualify.mjs:151`, `:425`; `W/fixtures.sh:6`, `:62`; `R/scenarios-2026-10-22.md:125`.)