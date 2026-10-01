# Open Decisions

What [`01-specification.md`](01-specification.md) still needs from a human.
Everything not listed here, and everything under Answered, has been decided
and should not be re-opened without new information.

Ordered by what blocks work soonest.

---

## Needed before launch, not before build

### D5. Hosting location and URL

Affects nothing architecturally — the app is static files with no header
requirements — but is needed for deployment, and for the offline/caching
strategy.

**Answered in principle 2026-08-27:** a UoN-hosted web app, in the shape of
`xerte.nottingham.ac.uk` — a University server and URL, not public GitHub
Pages. What remains open is who provisions it (VH-14).

**Owner:** Joe, with UoN IT / web team.

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

### D11. WebM output

Muxer-level support exists via Mediabunny; not exposed in v1 (spec §6.4).

**Revisit if:** a destination platform requires it. None currently does.

### D12. Custom or per-department branding

Out of scope for v1, and a later possibility rather than a requirement
(2026-08-27). The plan is to build the app, show it around, and hand it to
the maintainer's central department, which would then own any variant
governance.

**Revisit when:** that handover happens.

### D13. Batch processing

Out of scope for v1. The most likely first feature request from anyone with
a module's worth of recordings.

**Revisit when:** v1 is in use.

---

## Answered — kept so the numbers still mean something

### D1. UoN brand background colour — answered 2026-08-27

**Nottingham Blue, `#10263B`**, the University's primary brand colour, from
the palette the branding masters were made from. Checked against the shipped
closing tail, which decodes to `#10263a` at its corners — one unit of
YUV-to-RGB rounding. Padding a non-16:9 source in the blue the closing card
ends on makes the output one field of colour rather than black bars around a
brand graphic (spec §4.3). It is one token, `--uon-brand-bg`, so black is one
line away if it reads worse on real material.

### D2. Branding animation duration — answered 2026-08-25

Settled by the delivered masters: a **1.00 s onset and a 4.00 s tail**. A
hard cut uses the tail alone; over picture and over freeze frame play the
onset first (spec §4.3). v1 has no opening (VH-23), so `openingSeconds` in
`src/config/branding.ts` is still a placeholder, to be set from the asset if
an opening is ever approved.

### D3. Branding audio treatment at the boundaries — answered 2026-08-27

**Hard cut**, with a 100 ms fade on the content's sound at the boundary to
prevent a click (`BOUNDARY_FADE_MS`). The alternatives, a crossfade or
ducking, needed a branding audio bed, and the delivered branding is silent
(spec §4.4). The fade is a click preventer rather than an aesthetic choice,
which is why VH-25 kept it when it cut picture fades.

### D4. Sign-off on the browser exclusion — signed off 2026-08-27

Safari below 26 may be excluded; this was the one decision flagged as
expensive to reverse. The exclusion has since grown. Firefox is refused for
any video with sound, because it cannot create AAC audio (VH-49), and the
app says it is built for Chrome rather than certifying other browsers
(VH-98). Spec §10 has the current table.

### D6. Accessibility target: AA or AAA — answered 2026-08-27

**AA is the floor, AAA is the goal**, which is what `UI-STANDARDS.md` already
implements. The ambition is deliberate rather than aspirational: an AAA
exception has to be argued for, and is recorded.

### D7. Legal sign-off on the licensing position — closed 2026-08-27

Legal Services will not engage, and there is nothing to escalate. The
sign-off was to confirm a position already believed sound, not to ask
permission: the app ships no codec, using the ones already in the user's
browser through WebCodecs, so UoN distributes no x264 binary and inherits
neither GPL obligations nor AVC patent-pool exposure (rationale §1.2). Its
absence is a small residual risk, not a blocker.

### D10. Stream-copy fast path for "best quality" — answered no, 2026-08-27

Revisited and cut: keep re-encoding (VH-48). The corpus retired one of
rationale §4.3's two grounds — it is effectively constant frame rate — and
the other stands: a copy needs byte-exact codec parameters between source and
branding, and when they differ the failure is silent A/V drift found after
publication. Asked for the most reliable option, the maintainer chose
re-encoding: slower, and predictable.
