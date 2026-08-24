# PM Skills Initialisation Prompt

Paste the block below into a fresh agent session opened in this repository.

It runs `pm_skills/integrations/init-mvp.md` — the greenfield
guided-then-autonomous path — pre-loaded with everything already settled, so
the run spends its gates on the things that genuinely still need your
judgement rather than re-interviewing you about decisions already made.

**Two gates will stop and wait for you:** the foundation sign-off and the
scope-band sign-off. After the second, it builds to the band ceiling.

---

## The prompt

```text
Run pm_skills/integrations/init-mvp.md in agent mode.

CONTEXT
This is the UoN Video Helper: a static, browser-only web app that lets
University of Nottingham staff add approved branding to an educational
video, normalise its audio loudness, and export a correctly encoded MP4 —
with no upload, no server, and no media leaving their device.

The PM Skills framework (v4.6.0) is already installed at pm_skills/.
This IS a git repository with a remote (github.com/djDAOjones/UoN-Video-Helper,
branch main). Treat commits as the rollback checkpoints.

SPECIFICATIONS — read these before anything else
- docs/01-specification.md   the specification. Authoritative.
- docs/02-technical-rationale.md   why each decision was made, with evidence.
- docs/03-open-decisions.md   what is still genuinely undecided.
- docs/00-original-brief.md   the original brief, historical record only.

These replace the Phase A step 3 interview. Do not re-derive the product
from scratch — read the interpretation back to me for confirmation as
step 3 requires, but base it on these documents.

ALREADY DECIDED — do not re-open without new evidence
- Engine: WebCodecs. NOT ffmpeg.wasm. Rationale doc section 1 explains why
  ffmpeg.wasm fails this brief on memory, licensing, hosting headers and
  speed. This is load-bearing.
- Container layer: Mediabunny (MPL-2.0). The only runtime dependency.
- Working storage: OPFS. Save via File System Access API where available.
- Loudness: -16 LUFS integrated, -2.0 dBTP true peak, ITU-R BS.1770-4.
- Loudness DSP is bespoke JavaScript in a Web Worker, validated against
  EBU Tech 3341 reference signals. That validation is an acceptance
  criterion, not an optional extra.
- Two outputs, named by purpose: "Best quality" (for EchoVideo/YouTube) and
  "Smaller file" (for OneDrive/SharePoint). Compressed output preserves
  resolution and saves bitrate instead — slide legibility depends on
  resolution.
- No fixed file-size or duration cap. A 3-second calibration probe on the
  user's actual file and device produces a real estimate instead.
- Browser support excludes Safari below 26 and Firefox on Android.

PROPOSED MVP SCOPE — first milestone, confirm or correct
1. Static app skeleton, build tooling, Web Worker scaffolding, structured
   logging and global error capture.
2. File selection and inspection: demux via Mediabunny, report resolution,
   duration, frame rate, codecs, audio presence, VFR detection.
3. Pre-flight: WebCodecs and H.264 encode support, OPFS quota, device
   class, and the calibration probe with time estimate.
4. Video pipeline: decode to encode to mux, both presets, CFR conform,
   streaming to OPFS.
5. Loudness meter: BS.1770-4 integrated, short-term, LRA, true peak.
   Validate against EBU Tech 3341 before building anything on top of it.
6. Audio chain: high-pass, conditional macro-levelling with slew limiting,
   gentle compression, single linear gain, true-peak limiter.
7. Branding conform and concatenation, using placeholder assets.
8. UI workflow, warnings, named progress stages, cancel, save.

Build 5 before 6, and verify 5 against the EBU signals before continuing —
everything downstream depends on the meter being correct.

BLOCKING UNKNOWNS — build around these, do not invent answers
Per docs/03-open-decisions.md, these are not yet answered:
- D1 UoN brand background colour. Use a clearly-marked placeholder token.
- D2 Branding durations. Assume 5s opening / 4s closing, parameterised.
- D3 Boundary audio treatment. Assume hard cut with 100ms fade.
- D4 Safari-below-26 exclusion is not yet signed off by UoN IT.
Real branding assets do not exist yet. Use generated placeholder clips that
match the specified master format so the real assets drop in unchanged.

ACCESSIBILITY
WCAG 2.2 AA minimum, AAA where achievable, per specification section 9.3.
The audience is novice users on managed University devices.

SCOPE BAND
I intend Band 0 (local MVP, no deploy) — hosting is not yet decided (D5).
Present the bands as the workflow requires and I will confirm.

Start with Phase A step 1.
```

---

## If you only want the project memory populated, not code

Replace the first line with:

```text
Run pm_skills/init.md in agent mode, and stop after the Step 10 readiness
check. Do not write application code.
```

Everything else in the prompt still applies. This gives you the populated
`pm_skills/project/` memory, `AGENTS.md`, `UI-STANDARDS.md` and
`DEV-INFRASTRUCTURE.md`, and a backlog — then hands back before the build.
