# Decision Log

<!-- Append new decisions at the top. Don't edit old entries. -->
<!-- Use this during the design phase of each task to record what you chose and why. -->
<!-- Hot sectional. Agents scan the latest 10 HEADINGS by default and
     open only the bodies relevant to the task. -->
<!-- Keep each entry tight: Decision / Rationale / Alternatives, not an essay.
     The live log is budgeted by WORDS as well as entry count (see
     pm_skills/memory-policy.md), so verbose entries trip a prune sooner. -->
<!-- This is the home of the WHY. The backlog/trajectory only point here;
     never paste an entry's prose into those files. -->
<!-- Append-only: when archiving, move entries verbatim. Never rewrite. -->

## 2026-08-25 — Band 0 MVP: stack, scope, and the decisions that shaped it

**Decision:** Build the first milestone as a static TypeScript app on
WebCodecs with Mediabunny as the only runtime dependency, scoped to Band 0
(local, no deploy), and treat the specification set in `docs/` as
authoritative throughout.

**Rationale:**

- **Stack.** TypeScript 6.0.3 + Vite + Vitest. TypeScript 7 is released but
  typescript-eslint caps at `<6.1.0`, and adopting 7 would have cost the
  correctness lint the quality gate depends on — a worse trade than being one
  major behind.
- **The meter first.** VH-2 and VH-3 were moved ahead of the pipeline. The
  loudness meter is the highest-risk component and has no dependencies, so
  proving it against EBU Tech 3341 before anything consumed it meant a failure
  would cost one item rather than six. It passed at 0.021 LU worst error.
- **Three audio passes, not an estimate.** The single linear gain must land the
  *output* on −16 LUFS, and steps 2–4 of the chain change loudness on the way.
  Measuring what they leave (pass B) rather than estimating it is why a
  −46.83 LUFS source lands at −16.03.
- **The chain runs in the pipeline's feed loop, not the encoder's transform
  hook.** That hook sees every sample including the branding bed, which is
  mastered at target and must pass through unprocessed (spec §4.4). This is
  spec §4.4 expressed as an architectural constraint, and it only became
  visible when branding arrived.
- **Audio timeline shifted by the measured encoder delay.** AAC adds 44 ms of
  priming; the conventional fix is an edit list, which Mediabunny does not
  write. Measured rather than assumed, because it belongs to whichever encoder
  the browser provides.
- **Verification against reference material, not self-consistency.** The EBU
  signals and the acceptance harness each found defects that 29 and 245
  passing tests respectively had not: a 5.0 channel-weight gap, a 100 ms
  update grid too coarse for EBU tests 10–14, cancellation escaping cleanup,
  and two faults in my own measuring instruments.

**Assumptions made** (all recorded against open decisions, none invented):
D1 brand colour is a single token, verified as a one-line change; D2 durations
are config-only; D3 boundary treatment is a hard cut with a 100 ms fade; D4's
Safari-below-26 exclusion holds pending UoN IT.

**Alternatives considered:** ffmpeg.wasm was rejected before this run and not
revisited — rationale §1 stands. `fastStart: 'reserve'` for the smaller preset
was deferred to VH-17 rather than guessed at, since it needs a measured packet
count and a real SharePoint upload to settle.

**Known open:** acceptance criteria 1, 4, 5 and 7 need real material and a
person (VH-M1); published limits need real hardware (VH-M2). Three protected-doc
deltas await sign-off in `doc-deltas.md`, of which spec §6.3's frame-rate
rounding is the one that changes behaviour.
