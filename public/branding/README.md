# Branding assets

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
