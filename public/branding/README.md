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
`/spike-alpha.html`. It reports pass/fail per asset.

**Chrome 151, Safari 26.5.2 and Firefox 152 all pass** (2026-08-25), including
through the app's own loader — so all three closing modes work in every
supported browser.

The same run found something that matters more. Compositing the onset over
white via `drawImage` returns **202 in Chrome and Safari** but **255 in
Firefox**: the engines disagree about whether a decoded frame's colour is
premultiplied. 255 is correct, so Firefox happens to be right — but no
`drawImage` call is portable, which is why `src/media/composite.ts` does the
blend on the CPU instead of on the GPU.

## The opening placeholders (still in use)

Only the `opening-*` files remain, and only because opening sequences are
deferred (VH-23) — no real opening assets exist. The closing placeholders were
deleted once the real assets replaced them.

**These are placeholders.** They exist so the pipeline can be built and tested
before approved opening sequences are rendered.

| File | Variant | Duration |
| --- | --- | --- |
| `opening-1080p25.mp4` | 1920×1080, 25 fps | 5 s |
| `opening-1080p30.mp4` | 1920×1080, 30 fps | 5 s |
| `opening-2160p25.mp4` | 3840×2160, 25 fps | 5 s |
| `opening-2160p30.mp4` | 3840×2160, 30 fps | 5 s |

## When real opening assets arrive

Do NOT follow the closing pattern blindly, and do not assume this section is
still right — it describes the model the closings were expected to use, and the
real closings did not use it. Re-measure first.

What the closings actually turned out to need, and openings probably will too:

- **A build-time transcode**, because After Effects masters are `qtrle`/`argb`
  and no browser decodes that. `scripts/build-branding.mjs` is the pattern.
- **One master, scaled at runtime**, rather than a rendered variant per
  resolution and frame rate. Only one was ever delivered for the closings.
- **The premultiplied composite**, if the opening has a transparent build. See
  `src/media/composite.ts`; canvas `drawImage` gets this wrong.
- **No audio bed.** Spec §4.4 requires one mastered at −16 LUFS; the real
  closings have no audio at all, which the maintainer confirms is intended.
  The opening placeholders still carry a bed, measuring −15.99.

Opening durations are open decision D2 (5 s, unconfirmed). If that changes,
update `BRANDING_DURATIONS` in `src/config/branding.ts` — nothing else
hard-codes it.

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
