# Branding assets

Two generations of asset live here.

## The real closing assets (VH-12)

Built from the After Effects masters by `scripts/build-branding.mjs`, which runs
on a maintainer's machine — not during `npm run build` — because the masters are
`qtrle`/`argb` QuickTime files that no browser can decode. **Do not hand-edit
these; re-run the script.**

Each 5 s master splits at exactly 1.00 s, where the alpha ramp completes:

| Part | Files | Format | Why |
| --- | --- | --- | --- |
| `closing-onset-{style}-{colour}-{height}p.webm` | 8 | VP9 + alpha in WebM | The 1 s build needs transparency. Used only by the "over picture" and "over freeze frame" modes. |
| `closing-tail-{colour}-{height}p.mp4` | 4 | H.264 High, CRF 18 | Fully opaque. Deliberately the most universally decodable format, so "hard cut" works even where alpha decode does not. |

Styles are `fade` and `slide`; colours are `blue` and `white`; heights are
`1080p` and `2160p`. **Fade Blue is the default.** There are only two tails
because Fade and Slide are byte-identical after the onset within a colour —
confirmed by the maintainer as deliberate, not an export artefact.

Total 0.74 MB for all twelve. The tails measure PSNR 63 dB / SSIM 0.9999
against the masters, so CRF 18 is visually lossless on this content.

Verify alpha decode in a browser by serving the app and opening
`/spike-alpha.html`. It reports pass/fail per asset. Chromium passes; Safari
and Firefox are unverified.

## The placeholders (still in use)

**The app still loads these**, because the code that selects and composites the
new two-part assets is not written yet. They stay until that lands, so the
build never references a file that is not there.

**These are placeholders.** They exist so the pipeline can be built and tested
before the approved UoN sequences are rendered, and so those renders drop in
without any code change.

| File | Variant | Duration |
| --- | --- | --- |
| `opening-1080p25.mp4` | 1920×1080, 25 fps | 5 s |
| `opening-1080p30.mp4` | 1920×1080, 30 fps | 5 s |
| `opening-2160p25.mp4` | 3840×2160, 25 fps | 5 s |
| `opening-2160p30.mp4` | 3840×2160, 30 fps | 5 s |
| `closing-*` | as above | 4 s |

## Replacing them with the real thing

Render from the After Effects source to the four variants in spec §4.2 —
H.264 MP4, High profile, visually lossless, ~20 Mbps — keep these filenames,
and overwrite. Nothing else changes.

Two requirements that are easy to miss:

- **The audio bed must be mastered at −16 LUFS integrated**, because it passes
  through the app **unprocessed** (spec §4.4). Whatever level the file carries
  is the level the viewer hears next to the levelled speech. The placeholders
  measure −15.99 (opening) and −15.61 (closing).
- **Both frame rates are rendered from the source**, not converted from one
  another. That is the whole reason there are four files rather than two: a
  frame-rate conversion would judder on motion.

Durations are open decision D2 (5 s / 4 s, unconfirmed). If they change, update
`BRANDING_DURATIONS` in `src/config/branding.ts` — nothing else hard-codes them.

## Regenerating the placeholders

```bash
node scripts/gen-placeholder-branding.mjs
```

Needs `ffmpeg` on PATH. That is worth a word, because this project deliberately
does **not** use FFmpeg: see `docs/02-technical-rationale.md` §1. That decision
governs what the app ships and runs — no GPL code in the bundle, no AVC patent
obligation. None of it is engaged by using a local ffmpeg as an authoring tool
to make stand-in files. It is not a build or runtime dependency, and running
the script is optional because its output is committed.
