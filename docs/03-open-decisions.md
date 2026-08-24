# Open Decisions

What [`01-specification.md`](01-specification.md) still needs from a human.
Everything not listed here has been decided and should not be re-opened
without new information.

Ordered by what blocks work soonest.

---

## Blocking — needed before or during the first build

### D1. UoN brand background colour

**Needed for:** padding non-16:9 sources around the branding (spec §4.3).

A hex value from the UoN brand guidelines. Black is a safe interim default
but is unlikely to be the approved answer.

**Owner:** Joe / UoN brand team.

### D2. Branding animation duration

**Needed for:** subtitle offset calculation, calibration estimates, UI copy.

Proposed: **5 s opening, 4 s closing.** Long enough to register, short
enough that staff do not resent it on a 6-minute video. Needs confirming
against whatever the approved sequences actually are.

**Owner:** Joe.

### D3. Branding audio treatment at the boundaries

Spec §4.4 assumes a **hard cut** with a 100 ms fade to prevent clicks. The
alternatives are a short crossfade between the branding bed and the content,
or ducking the branding bed under the opening words.

Hard cut is recommended: simplest, most predictable, and impossible to get
audibly wrong.

**Owner:** Joe.

### D4. Sign-off on the browser exclusion

The WebCodecs decision means **Safari below 26 is not supported.** If
managed University devices are pinned to an older macOS, this needs
checking with IT before the architecture is locked, since it is the one
decision that would be expensive to reverse later.

**Owner:** Joe, with UoN IT.

---

## Needed before launch, not before build

### D5. Hosting location and URL

Affects nothing architecturally — the app is static files with no header
requirements — but is needed for deployment, and for the offline/caching
strategy.

**Owner:** Joe, with UoN IT / web team.

### D6. Accessibility target: AA or AAA

Spec §9.3 proposes WCAG 2.2 AA as the floor with AAA where achievable. If
UoN policy mandates AAA outright, some colour and contrast decisions change.

**Owner:** Joe, with UoN accessibility team.

### D7. Legal sign-off on the licensing position

The WebCodecs architecture is specifically designed so that UoN ships no
codec and assumes no patent obligation. That reasoning is sound but is worth
a brief confirmation from Legal Services, since avoiding this exposure is
one of the main reasons the architecture was chosen.

**Owner:** Joe, with UoN Legal Services.

### D8. Published limits

Deliberately left open. Spec §7.4 sets them from measurement on real
devices rather than in advance. The decision to record here is what the
**user-facing** copy says once those numbers exist.

**Owner:** Joe, after test results.

---

## Deferred — decided as "not now", recorded so they are not lost

### D9. Pumping detection on pre-existing audio

Dropped from v1 (spec §5.4). Detecting whether *someone else's* compressor
was badly configured, from the finished audio alone, is unreliable, and a
false accusation is worse than silence. The "highly variable levels" warning
covers the cases that matter in practice.

**Revisit if:** staff report a recurring problem the current warnings miss.

### D10. Stream-copy fast path for "best quality"

Deferred to v2 (rationale §4.3). Would make source-matched output near
instant and generationally lossless, but fails unpredictably on
variable-frame-rate sources, which are common here.

**Revisit when:** v1 is stable and there is real data on how many sources
are CFR.

### D11. WebM output

Muxer-level support exists via Mediabunny; not exposed in v1 (spec §6.4).

**Revisit if:** a destination platform requires it. None currently does.

### D12. Custom or per-department branding

Out of scope for v1. Likely to be requested once the app exists.

**Revisit when:** asked for, and there is a governance answer for who
approves a variant.

### D13. Batch processing

Out of scope for v1. The most likely first feature request from anyone with
a module's worth of recordings.

**Revisit when:** v1 is in use.
