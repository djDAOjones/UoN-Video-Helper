<!-- markdownlint-disable -->
<!-- Codex astra's blind design review for VH-163 (codex exec -m gpt-6-astra -s read-only, from codex-astra-design-brief-2026-10-22.md, at main 5e3de2b, 2026-10-22), kept as written. -->

The page needs consolidation rather than additional interface. At `main@5e3de2b`, the source supports five findings: one broken feedback action, inconsistent typography roles, inconsistent prose widths and paragraph spacing, uncontained user-supplied text, and mismatched frame spacing. The existing six-step workflow, shared notification component and progress bar provide a sound basis. This is a blind source review dated **22 October 2026**: dimensions attributed to the first survey are its measurements, not new browser observations; source-derived dimensions are identified below. Findings D-01–D-05 are candidates V-31–V-35 for the merged pass. The review applies VH-163’s consolidation brief and introduces no proposed control or element (`project/items/VH-163.md:5`, `:11`, `:23`).

### D-01 “Open email app” submits the wrong form path — rank 1

**Saw.** Two elements have the same ID:

```html
<a class="footer-contact-link" id="feedback-form" …>
<form id="feedback-form" novalidate>
```

The footer anchor comes first. `required()` uses `document.querySelector<T>(selector)`, so:

```ts
const feedbackForm = required<HTMLFormElement>('#feedback-form')
```

returns that anchor. The TypeScript generic does not check the element’s runtime type. Consequently, the `submit` listener containing `event.preventDefault()`, validation and `openMailto(url)` attaches to the anchor, not the dialog’s form.

The dialog’s **Open email app** button is `type="submit"`. Its actual form therefore follows native submission behaviour rather than opening the prepared email. With neither `action` nor `method`, that means navigation to the current document by GET. This can discard the feedback draft. A running job or unsaved result has a separate leave warning, but the feedback draft itself is absent from that warning’s conditions.

This is a source-established wiring error; the resulting navigation has not been reproduced in a browser during this review.

**Standard.** UI-STANDARDS → User control and freedom; Error prevention and recovery; Help and contextual guidance. Nielsen **3, user control**, **5, error prevention**, and **10, help** (`UI-STANDARDS.md:138`, `:150`, `:180`; `project/digests/nielsen.md:21`, `:25`, `:35`). This is a functional defect, not a WCAG 4.1.1 finding: that criterion was removed from WCAG 2.2 (`project/digests/wcag-2.2-aaa.md:14`).

**Direction.** Give the existing footer anchor a distinct ID, such as `feedback-form-link`, and update only its lookup. Keep `feedback-form` on the actual form. Verify empty-message validation, valid-message email opening, the copy route and the external footer link.

**A CSS-only fix cannot repair this.** It requires a narrowly scoped exception to the proposed fix-file boundary: two existing attributes/lookups, without adding an element. Carry that exception into the owner’s fix plan.

**Source.** `index.html:785`, `:812`, `:842`; `src/main.ts:225`, `:3405`, `:3523`, `:3544`, `:3592`; leave-warning conditions at `src/main.ts:2326`; fix boundary at `project/items/VH-163.md:25`.

### D-02 The stylesheet defines sizes, but not complete text roles — rank 2

**Saw.** A step heading specifies size and weight but inherits the body’s line height:

```css
.panel h2 {
  …
  font-size: var(--type-heading-03);
  font-weight: var(--type-weight-heading);
}
```

The footer’s same-level headings instead take their summary’s entire font:

```css
.system-check > .disclosure-summary h2,
.statement > .disclosure-summary h2 {
  …
  font: inherit;
}
```

A statement subsection combines the same 16 px size with a different weight and line height. Switcher legends combine it with a third treatment. These are independently assembled styles, despite all their values coming from tokens.

The source yields the following **ten distinct authored typography tuples** at a 16 px root. Size and line height are in CSS pixels; letter spacing is `normal` throughout.

| Family role | Size / line height | Weight | Uses and source |
|---|---:|---:|---|
| Heading | 28 / 35 | 700 | Page title — `app.css:169` |
| Heading | 20 / 30 | 700 | Six step headings, Errors captured, feedback heading — `app.css:259`, `:1510`; `index.html:114`, `:630`, `:813` |
| Body | 16 / 24 | 400 | Default prose, step/dialog introductions, ordinary links, fact values, text inputs and textareas — `app.css:19`, `:182`, `:662`, `:1434`, `:1515`, `:1519` |
| Body | 16 / 24 | 600 | Notification titles; system-check and accessibility-statement summaries — `app.css:460`, `:886`, `:900` |
| Body | 16 / 24 | 700 | Page-language, video-kind and video-language legends — `app.css:1167` |
| Body | 16 / 20 | 700 | Accessibility-statement subsection headings — `app.css:916` |
| Body | 14 / 21 | 400 | Version, check values, buttons, file input/button, status, notification bodies, labels, helpers, fact terms/notes, checkbox/radio text, radio descriptions, disclosures, selects, toggletip prose, unselected segments, lock notes, trim/closing results and field errors — `app.css:221`, `:341`, `:354`, `:417`, `:465`, `:530`, `:540`, `:609`, `:657`, `:666`, `:755`, `:791`, `:831`, `:842`, `:1013`, `:1061`, `:1112`, `:1251`, `:1281`, `:1537` |
| Body | 14 / 21 | 600 | Notification item titles, help button, selected segments and their hidden width reserves — `app.css:480`, `:1054`, `:1130`, `:1233` |
| Body | 14 / 21 | 700 | Status marks and semantic bold text within compact copy — `app.css:321`; `src/main.ts:870`; `index.html:454` |
| Monospace | 14 / 21 | 400 | Captured stacks, feedback diagnostics and log — `app.css:487`, `:1478`, `:1543`, `:1714` |

Here, **Heading** means the Lora/Georgia stack, **Body** the Arial/system stack, and **Monospace** the named technical stack (`src/styles/tokens.brand.css:81`). Chinese changes the heading and body fallback stacks to the named CJK faces; explicitly tagged Chinese passages reapply the body stack (`tokens.brand.css:93`, `:139`; `app.css:71`). Actual fallback faces depend on the device and glyph. Thus ten is the count of authored style combinations, not a claim that every device renders only ten physical font combinations.

The first survey found nine combinations on the empty page; diagnostics account for the additional monospace combination in the source inventory (`project/items/VH-163.md:48`; `app.css:1714`).

**Standard.** UI-STANDARDS → Carbon-first UI discipline and Consistency; Carbon digest → productive typography and layout (`UI-STANDARDS.md:18`, `:144`; `project/digests/carbon.md:20`, `:44`). VH-163 explicitly requires one named style per text role and consistent presentation of headings at the same level (`project/items/VH-163.md:13`).

**Direction.** Define complete role compositions, then group the existing selectors under them. A minimal consolidation can retain the established 16 px body and 14 px supporting text:

| Named role | Proposed local composition | Carbon reference |
|---|---|---|
| Page title | Heading 28/36, 700 | `heading-04` |
| Step/panel heading, including every `h2` | Heading 20/28, 700 | `heading-03` |
| Section heading, including statement subsections and notification titles | Body 16/24, 600 | Enlarged `heading-01`; equivalent geometry to `heading-02` |
| Label or legend | Body 14/21, 400 | Adapted `label-01` |
| Body prose, including notification paragraphs | Body 16/24, 400 | Enlarged `body-01` |
| Supporting text | Body 14/21, 400 | Adapted `helper-text-01` |
| Compact control text | Body 14/21, 400 | Adapted `body-compact-01` |
| Compact subordinate title | Body 14/21, 600 | Adapted `heading-compact-01` |
| Status mark | Body 14/21, 700 | Explicit glyph role based on the compact scale |
| Code | Monospace 14/21, 400 | Enlarged `code-01` |

These are **declared local adaptations**, not exact Carbon tokens. Carbon’s originals include `body-01` 14/20/400, `body-compact-01` 14/18/400, `label-01` and `helper-text-01` 12/16/400, `heading-compact-01` 14/18/600, `heading-03` 20/28/400 and `heading-04` 28/36/400. Carbon classifies `body-02` and `heading-02` as expressive. Its compact/body tracking is also explicit, whereas this stylesheet uses `normal`. [Carbon typography definitions](https://www.carbondesignsystem.com/building-blocks/foundations/typography/type-sets).

Keep the brand font stacks in `tokens.brand.css`. Reuse existing sizes and weights in `tokens.carbon.css`; add only the missing role aliases and heading line-height definitions. State the local tracking choice explicitly. Retaining the larger text is a readability choice; WCAG does not itself prescribe a 16 px minimum.

Apply the same panel-heading composition to steps, errors, system check, statement and feedback. Use semibold for subordinate titles, selected segments and semantic emphasis; keep bold for brand headings and status marks. Preserve the existing selected-state width reservation. Lora is loaded as weight 700, so changing those headings to an unsupported weight is not the smallest fix (`src/ui/brand-assets.ts:24`, `:55`).

**Source.** `src/styles/tokens.carbon.css:42`, `:49`, `:63`; `src/styles/tokens.brand.css:81`, `:139`; `src/styles/app.css:19`, `:63`, `:169`, `:259`, `:460`, `:886`, `:916`, `:1167`, `:1510`, `:1714`. This addresses complete role composition after the previous footer-size change; it does not re-find V-26’s former 14 px versus 16 px inversion (`reviews/2026-10-20/design-pass-2026-10-21.md:394`).

### D-03 Running text has no shared width or paragraph-spacing contract — rank 2

**Saw.**

```css
--measure: 55ch;
--measure-cjk: 40em;
```

These custom properties contain relative units. They resolve using the font of each element where they are consumed; defining them at the root does not freeze their physical width.

The first survey records:

| Language | 16 px running text | 14 px helper/notification text |
|---|---:|---:|
| English | 489 px | 428 px |
| Chinese | 640 px | 560 px |

Those figures come from `project/items/VH-163.md:48`. The source explains both differences: `p`, `li` and `dd` consume the measure, while helper and notification paragraphs change their font size (`app.css:36`, `:45`, `:465`, `:609`).

There is also an uncovered case:

```css
.fact-note {
  display: block;
  …
  font-size: var(--type-body-compact);
}
```

A fact note is a **span inside a `dd`**, not one of the elements receiving the measure. On a sufficiently wide Chinese layout, the 16 px `dd` can be 640 px wide and its 14 px note can use that entire width: approximately **45.7 full-width CJK glyphs**, rather than 40. The frame-rate explanation supplies a real long Chinese note, not merely hypothetical content (`src/ui/source-panel.ts:145`, `:238`; `src/i18n/zh-Hans.ts:113`).

Text-entry fields introduce another width: they always use `--measure`, without the Chinese override (`app.css:1454`). The main shell remains 60rem; it is the prose measure that expands when the language changes (`tokens.carbon.css:76`).

Paragraph rhythm also escapes the common rule:

```css
.toggletip p + p {
  margin-top: var(--spacing-03);
}
```

That is 8 px between two prose paragraphs, while the shared paragraph gap is 16 px. The onset explanation contains those adjacent paragraphs (`app.css:1073`; `index.html:453`, `:457`).

**Standard.** WCAG **1.4.8 Visual Presentation**, including the 40-CJK-glyph measure and paragraph spacing; UI-STANDARDS → Perceivable; VH-163’s single physical reading width (`project/digests/wcag-2.2-aaa.md:38`; `UI-STANDARDS.md:202`; `project/items/VH-163.md:14`).

**Direction.** Make `--measure` a root-relative physical width, shared by prose at every size. Make the Chinese measure the same width, sized for the **smallest prose style**, rather than widening smaller text to 40em at the body size.

For the proposed 14/16 px scale, **28rem is a reasonable starting value for browser verification**: 448 px at the default root, or 32 full-width glyphs at 14 px. It is a proposal, not a measured final optimum. Count actual lines in the three languages and fallback fonts before settling it.

Apply that common cap to existing prose spans such as `.fact-note` and `.radio-detail`, notification paragraphs and relevant text-entry fields. Allow every cap to yield to its container. Keep the wider panel and media layout.

Use `--paragraph-gap` between genuine prose paragraphs, including the toggletip; retain `--spacing-03` for the different relationship of a field to its helper. No new spacing token is needed.

The stylesheet test explicitly pins `55ch`; its expectation must change with the approved measure, with the behavioural width checks retained or strengthened rather than deleted (`test/stylesheet.test.ts:120`).

**Source.** `src/styles/tokens.carbon.css:63`, `:72`, `:76`; `src/styles/app.css:36`, `:45`, `:55`, `:465`, `:609`, `:650`, `:666`, `:831`, `:1073`, `:1454`; `src/ui/source-panel.ts:145`, `:238`; `src/i18n/zh-Hans.ts:113`.

### D-04 Long filenames and invalid ID text can escape their reading column — rank 2

**Saw.** The result record preserves the filename:

```ts
sourceName: file.name,
```

and inserts it into result and discard prose. The translated summaries all include `{name}` (`src/i18n/en-GB.ts:470`; `zh-Hans.ts:393`; `ms-MY.ts:417`).

However, `.notification-body` sets only margin, font size and colour. Its `max-width` limits the paragraph’s box, not an unbreakable word’s rendered width. There is no inherited emergency wrapping rule on the notification.

A filename containing 100 consecutive `W` characters followed by `.mp4` is a straightforward source-derived counterexample: the authored result paragraph cannot fit it on a phone and has no permitted break within that run.

The same exposure exists in field errors. Student-ID parsing splits on separators but does not shorten an invalid token; `idNotAnId` repeats that token in the error paragraph (`src/ui/title-card-step.ts:200`, `:291`). This affects all three translations (`en-GB.ts:291`; `zh-Hans.ts:221`; `ms-MY.ts:236`).

**Standard.** WCAG **1.4.10 Reflow**, with text-spacing overrides under **1.4.12** included in verification; UI-STANDARDS → specific, recoverable errors. The specification requires the full state walk at 320 px and under text-spacing overrides (`UI-STANDARDS.md:154`; `docs/01-specification.md:854`).

**Direction.** Add emergency wrapping, preferably `overflow-wrap: anywhere`, to the shared authored prose treatment, covering notification bodies and field errors. Preserve the full filename and invalid token. Avoid clipping, ellipsis or `word-break: break-all`, which would unnecessarily damage ordinary text.

Verify the long filename in finished, previous-result and discard states, plus a long invalid ID, at 320 px and with text-spacing overrides. This requires only CSS; the existing measure tokens can remain the width authority established by D-03.

**Source.** `src/main.ts:2879`, `:3215`, `:2799`; `src/ui/result-summary.ts:168`; `src/ui/notification.ts:77`; `src/styles/app.css:36`, `:465`, `:1537`. Existing emergency wrapping is limited to other surfaces, including `app.css:491`, `:913`, `:1550`. The previous pass’s native file-picker truncation exception concerns a different surface (`reviews/2026-10-20/design-pass-2026-10-21.md:616`).

### D-05 The bands use different frame spacing from the main content — rank 3

**Saw.**

```css
.band--header .band-inner {
  …
  padding: var(--uon-logo-clear) var(--uon-logo-inset);
}
```

The inset is 20 px. Main and footer gutters use `--spacing-06`, or 24 px. At 375 px this gives two competing outer edges, four pixels apart. The first survey records that discrepancy (`project/items/VH-163.md:48`).

The same panel-to-panel relationship also changes in the footer:

```css
.panel { … margin-bottom: var(--spacing-06); }

.band--footer .system-check,
.band--footer .statement {
  margin-bottom: var(--spacing-05);
}
```

Main panels therefore use 24 px separation and footer panels 16 px.

**Standard.** VH-163’s shared gutters and common panel rhythm; UI-STANDARDS → Consistency; Carbon’s spacing scale (`project/items/VH-163.md:15`, `:16`; `UI-STANDARDS.md:144`; `project/digests/carbon.md:25`).

**Direction.** At narrow widths, alias the existing brand inset to `--spacing-06`, aligning header, main and footer without moving the switcher or changing the logo. Let the footer panels retain the common `.panel` separation instead of overriding it to 16 px.

The desktop header deliberately places the logo against the window edge; changing that is an owner decision, as discussed below. Preserve the logo’s height and clear space.

**Source.** `src/styles/tokens.brand.css:100`, `:106`; `src/styles/tokens.carbon.css:36`; `src/styles/app.css:125`, `:151`, `:176`, `:228`, `:252`; existing desktop-placement test at `test/stylesheet.test.ts:62`.

## What held up

**The component and workflow foundations support consolidation.** All six steps already share `.panel`, and verdicts, warnings, errors and results share one notification anatomy. Field errors remain beside fields. The fix should preserve these distinctions (`index.html:114`, `:156`, `:237`, `:396`, `:510`, `:538`; `src/ui/notification.ts:43`; `src/main.ts:2631`).

The end-to-end Nielsen check produced this disposition:

| Heuristic | Source-supported assessment |
|---|---|
| **1. Visibility of system status** | Named stages, indeterminate/measured progress and restrained announcements are implemented. Keep the progress bar (`src/ui/progress.ts:110`, `:137`; `app.css:686`). |
| **2. Match with the real world** | Step 5 explains output choices through destinations such as EchoVideo, Moodle and email, in all three languages (`src/i18n/en-GB.ts:372`; `zh-Hans.ts:302`; `ms-MY.ts:322`). |
| **3. User control and freedom** | Cancel and Keep/Discard paths exist; D-01 breaks the feedback path (`src/main.ts:3115`, `:2767`, `:2781`). |
| **4. Consistency and standards** | Shared components hold; typography, measure and frame-spacing inconsistencies are D-02, D-03 and D-05 (`app.css:252`; `src/ui/notification.ts:43`). |
| **5. Error prevention** | Title-card refusal precedes processing and focuses the field needing correction. Running jobs lock mutable controls. D-01 remains an exception (`src/main.ts:2631`, `:2347`). |
| **6. Recognition rather than recall** | Results retain their source and choices; changes intended for the next video are identified (`src/ui/result-summary.ts:168`; `src/main.ts:2144`). |
| **7. Flexibility and efficiency** | Trim has typed times, Set here buttons and keyboard handling alongside dragging (`index.html:171`, `:190`, `:212`; `src/main.ts:1918`). |
| **8. Aesthetic and minimalist design** | The existing notification component and contextual closing help provide places for information without new interface. D-02 reduces visual competition (`src/ui/notification.ts:43`; `index.html:435`, `:452`). |
| **9. Error recognition and recovery** | Failure copy combines what happened, reassurance and a next action; field refusals identify their destination. D-04 protects their readability (`src/ui/failure-text.ts:93`; `src/main.ts:2631`). |
| **10. Help and documentation** | Contextual help, statement and contact routes exist. D-01 prevents one feedback action from fulfilling its promise (`index.html:452`, `:680`, `:775`, `:794`). |

The rules applied are the ten numbered digest rules at `project/digests/nielsen.md:17`.

**Control states mostly share an established treatment.**

| State | What the source establishes |
|---|---|
| Rest and hover | Primary, secondary and danger buttons have shared treatments; the file-selector button follows primary/secondary usage (`app.css:354`, `:366`, `:370`, `:380`, `:552`, `:573`). |
| Focus | A shared ring, a ring on the visible file button, and a ring on the selected segment’s face are explicit (`app.css:109`, `:604`, `:1136`). |
| Selected | Segments use fill and weight, with space reserved to prevent selection changing their width (`app.css:1130`, `:1233`). |
| Disabled and locked | Buttons, fields and segments retain readable text and use disabled styling; lock notes explain the condition (`app.css:402`, `:1033`, `:1149`, `:1251`). |
| Invalid | Text fields and textareas use an error edge plus written errors; invalid styling does not override the disabled treatment (`app.css:1447`, `:1533`, `:1537`). |
| Running | Cancel replaces Create, controls lock and status remains visible (`src/main.ts:2347`). |
| Finished | The result identifies the completed job and offers Save; Create steps down while a result stands (`src/main.ts:2829`, `:3156`, `:3196`). |

There is no dedicated authored `:active` treatment in the reviewed button and segment rules. That remains a rendered interaction-fidelity check, not evidence by itself of an accessibility failure (`app.css:354`, `:1112`).

**Spacing largely uses the intended scale.** Panel padding/separation is 24 px; step-heading-to-content spacing is 16 px; label/control and field/helper spacing is 8 px. The substantive divergences are identified in D-03 and D-05 (`app.css:252`, `:259`, `:530`, `:609`).

The non-spacing-token exceptions have identifiable purposes:

- Header padding uses named brand tokens: 12 px clear space and 20 px inset. The former coincides with Carbon’s scale; the latter follows the recorded University header geometry (`tokens.brand.css:100`).
- Adjacent segments overlap by one border width to avoid doubled borders (`app.css:1211`).
- The visually hidden technique uses a −1 px margin as a structural exception (`app.css:501`; `test/stylesheet.test.ts:82`).

**Accessibility has useful source protections, with limits.** Contrast tests enumerate text pairs at 7:1 in light, dark and blue-band contexts; target tokens specify 44 px; focus tokens specify a 2 px ring. These support **1.4.6**, **2.5.5** and **2.4.13**, but are not a fresh rendered conformance result (`test/contrast.test.ts:96`, `:130`; `tokens.carbon.css:94`, `:102`). The non-sticky-band assertion supports **2.4.12** without proving that every focused component is unobscured (`test/stylesheet.test.ts:32`).

## Set aside, with reasons

- **Previous findings V-18–V-30.** Their switcher placement, token omissions, repeated copy, save-error presentation, trim-field sizing, statement wording, class duplication, former footer inversion, marks, terminology, configuration and card-wrapping findings are not re-filed. D-02 concerns the remaining combinations after those changes (`reviews/2026-10-20/design-pass-2026-10-21.md:114`, `:158`, `:224`, `:245`, `:265`, `:292`, `:321`, `:354`, `:394`, `:416`, `:478`, `:508`, `:529`).

- **Desktop logo alignment.** The current window-edge placement is an explicit brand rule and test. Full gutter alignment at desktop would change that decision. D-05 proposes narrow-width alignment only; the desktop choice belongs in the owner’s review (`UI-STANDARDS.md:82`; `test/stylesheet.test.ts:62`; `project/items/VH-163.md:15`).

- **Four left edges do not automatically mean four competing columns.** The survey’s 184, 209, 226 and 237 px positions correspond to the main content, panel padding, drop-zone padding and disclosure marker/text anatomy. Borders, notification rails and disclosure markers need internal space. Preserve those meaningful insets while consolidating prose widths; removing them indiscriminately would weaken grouping (`project/items/VH-163.md:48`; `app.css:228`, `:252`, `:619`, `:842`, `:864`).

- **Page structure, switcher location and statement wording.** No relocation, additional step, checkbox or wording revision is proposed. Typography can be consolidated through the existing selectors (`index.html:35`, `:114`, `:664`, `:680`; `app.css:886`, `:916`, `:1167`).

- **Native media controls and exact physical font rendering.** These cannot be exhaustively judged from authored CSS. The specification expressly recognises native video controls and records device/browser evidence still required (`docs/01-specification.md:719`, `:728`).

- **Rendered AAA verification.** D-03 identifies a source-level CJK measure gap; D-04 identifies unbreakable-content exposure. Neither substitutes for the required 320 px, 200% enlargement, text-spacing, keyboard, screen-reader and forced-colour walks. In particular, the slider’s inset focus ring still requires rendered assessment under **2.4.13**, and unobscured focus under **2.4.12** must be checked through transitions (`app.css:1414`; `docs/01-specification.md:728`, `:854`).

- **Gate and item closure.** The stylesheet tests explicitly state that they inspect source rules rather than computed layout. This read-only blind report does not claim a new gate run, browser sweep or completion of VH-163’s wider evidence requirements (`test/stylesheet.test.ts:1`; `project/items/VH-163.md:12`, `:22`, `:26`).

| Blind finding | Candidate merged ID | Disposition |
|---|---|---|
| D-01 | V-31 | Rank 1; include the necessary non-CSS scope exception in the fix plan. |
| D-02 | V-32 | Rank 2; consolidate complete text roles and document local Carbon adaptations. |
| D-03 | V-33 | Rank 2; establish one physical prose measure and paragraph rhythm. |
| D-04 | V-34 | Rank 2; contain long user-supplied text without hiding it. |
| D-05 | V-35 | Rank 3; owner proposal for mobile gutters and footer panel rhythm. |