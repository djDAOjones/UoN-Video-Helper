// VH-215 (wish VH-139.5): the submission card's running time read from the
// finished video itself, never from the page's line or the job's request as
// its proxy. A frame of the output's opening card is decoded by the browser
// (a detached <video> on the result player's own source, seeked into the
// card), and matched against reference renders of every running time from
// 0:00 up. The references are drawn by the app's own `drawTitleCardFrame`
// and `formatClockTime`, in a module worker of the walk's own, from the card
// request the page posted with the job. That request is kept by a read-only
// wrap of Worker.prototype.postMessage, which passes every message on
// unchanged, and only the running time is varied. The decoded frame is
// scored where the references differ, which is the running time's glyphs.
// The time read is the reference it matches best; the rest of the card,
// where every reference agrees, says how well the frame is the card at all.
// No OCR and no dependency.
//
//   await w.evaluate(KEEP_REQUEST)        in the page, before Create
//   await readBurnedCard(w, { maxSeconds })   after the job: { time, clear, scores, ... }
//
// Its one side effect on the page: a worker of its own, started and ended
// within the read (phase8.mjs watchWorkers counts it, and judges nothing by
// that count).

/** In the page: keep each card request posted with a job (`kind: 'process'`), by value. */
export const KEEP_REQUEST = String.raw`(() => {
  const K = (window.__vh215 = window.__vh215 || { requests: [] });
  if (!K.wrapped) {
    const post = Worker.prototype.postMessage;
    Worker.prototype.postMessage = function (message, ...rest) {
      try {
        if (message && message.kind === 'process' && message.titleCard) K.requests.push({ t: Date.now(), titleCard: structuredClone(message.titleCard) });
      } catch (e) { K.error = String((e && e.message) || e).slice(0, 160); }
      return post.call(this, message, ...rest);
    };
    K.wrapped = true;
  }
  return K.requests.length;
})()`

// The worker: every candidate drawn at the decoded frame's size, as the job
// draws its card (src/workers/job.worker.ts, drawTitleCardFrame at the
// output's size), then scored on luma.
const WORKER_BODY = String.raw`
self.onmessage = async (e) => {
  const { request, width, height, decoded, maxSeconds, threshold } = e.data;
  try {
    const n = width * height;
    const luma = (d) => { const o = new Uint8Array(n); for (let i = 0, j = 0; i < n; i++, j += 4) o[i] = (d[j] * 54 + d[j + 1] * 183 + d[j + 2] * 19) >> 8; return o; };
    const D = luma(new Uint8ClampedArray(decoded));
    const times = [...new Set(Array.from({ length: maxSeconds + 1 }, (_, s) => formatClockTime(s)))];
    const refs = [];
    for (const t of times) {
      const canvas = await drawTitleCardFrame({ ...request, text: { ...request.text, runningTime: t } }, { widthPx: width, heightPx: height });
      refs.push({ t, L: luma(canvas.getContext('2d').getImageData(0, 0, width, height).data) });
    }
    const inMask = new Uint8Array(n);
    let maskPixels = 0;
    for (let i = 0; i < n; i++) { let lo = 255, hi = 0; for (const r of refs) { const v = r.L[i]; if (v < lo) lo = v; if (v > hi) hi = v; } if (hi - lo > threshold) { inMask[i] = 1; maskPixels++; } }
    const scoreOf = (L) => { let s = 0; for (let i = 0; i < n; i++) if (inMask[i]) s += Math.abs(D[i] - L[i]); return maskPixels ? s / maskPixels : null; };
    const scores = refs.map((r) => ({ time: r.t, score: scoreOf(r.L) })).sort((a, b) => a.score - b.score);
    const bestL = refs.find((r) => r.t === scores[0].time).L;
    let rs = 0, rn = 0;
    for (let i = 0; i < n; i += 3) if (!inMask[i]) { rs += Math.abs(D[i] - bestL[i]); rn++; }
    // The best and the runner-up told apart where their own references differ (the union mask above dilutes
    // two neighbouring times to one digit's pixels).
    let pair = null;
    if (scores.length > 1) {
      const secondL = refs.find((r) => r.t === scores[1].time).L;
      let pn = 0, pa = 0, pb = 0;
      for (let i = 0; i < n; i++) if (Math.abs(bestL[i] - secondL[i]) > threshold) { pn++; pa += Math.abs(D[i] - bestL[i]); pb += Math.abs(D[i] - secondL[i]); }
      pair = pn ? { pixels: pn, best: pa / pn, second: pb / pn } : null;
    }
    self.postMessage({ ok: true, times: times.length, maskPixels, scores, restScore: rn ? rs / rn : null, pair });
  } catch (err) {
    self.postMessage({ ok: false, error: String((err && err.message) || err).slice(0, 200) });
  }
};`

/**
 * After the job: the running time the output's opening card shows.
 *
 * @param maxSeconds - The candidates run from 0:00 to this many seconds (past
 *   the declared length, so a card that states it is read too).
 * @param atSeconds - Where in the card the frame is taken; the card's middle
 *   by default (TITLE_CARD_SECONDS / 2, from the app's own config).
 * @param threshold - Luma levels by which the references must disagree for a
 *   pixel to be scored.
 * @returns The time read (`time`), whether it is clear of the runner-up
 *   (`clear`: on the pixels where the two references differ, the runner-up's
 *   mean difference from the frame exceeds the best's by 10 levels and half
 *   as much again; `pair` holds both), every candidate's score,
 *   the requested time (what the page asked the worker to draw, kept beside,
 *   never the reading), the frame's size and the source's duration.
 */
export async function readBurnedCard(w, { maxSeconds = 40, atSeconds = null, threshold = 64 } = {}) {
  const t0 = Date.now()
  const r = await w.evaluate(String.raw`(async () => {
    const K = window.__vh215 || {};
    const req = K.requests && K.requests[K.requests.length - 1];
    if (!req) return { error: 'no card request kept' + (K.error ? ': ' + K.error : '') };
    const player = document.querySelector('video.result-player');
    const src = player && player.getAttribute('src');
    if (!src) return { error: 'no result player source' };
    const { TITLE_CARD_SECONDS } = await import('/src/config/cards.ts');
    const at = ${atSeconds === null ? 'TITLE_CARD_SECONDS / 2' : Number(atSeconds)};
    const v = document.createElement('video');
    v.muted = true; v.preload = 'auto';
    const once = (ev, ms) => new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error(ev + ' timed out')), ms);
      v.addEventListener(ev, () => { clearTimeout(t); res(); }, { once: true });
      v.addEventListener('error', () => { clearTimeout(t); rej(new Error('video error ' + (v.error && v.error.code))); }, { once: true });
    });
    let decoded, width, height, duration;
    try {
      v.src = src;
      await once('loadeddata', 30000);
      v.currentTime = at;
      await once('seeked', 30000);
      width = v.videoWidth; height = v.videoHeight; duration = v.duration;
      const ctx = new OffscreenCanvas(width, height).getContext('2d', { willReadFrequently: true });
      ctx.drawImage(v, 0, 0, width, height);
      decoded = ctx.getImageData(0, 0, width, height).data;
    } catch (e) {
      return { error: 'decode: ' + String((e && e.message) || e).slice(0, 160) };
    } finally {
      v.removeAttribute('src'); v.load();
    }
    // Vite's dev server gives a module worker its defines (__BRANDING_DIR__ among them) by importing /@vite/env
    // first, as it does for the app's own job worker; this worker is a blob, so it imports it itself.
    const code = "import '" + location.origin + "/@vite/env';\n" +
      "import { drawTitleCardFrame } from '" + location.origin + "/src/media/title-card-frame.ts';\n" +
      "import { formatClockTime } from '" + location.origin + "/src/ui/format.ts';\n" + ${JSON.stringify(WORKER_BODY)};
    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    const worker = new Worker(url, { type: 'module' });
    try {
      const out = await new Promise((res, rej) => {
        const t = setTimeout(() => rej(new Error('references timed out')), 120000);
        worker.onmessage = (e) => { clearTimeout(t); res(e.data); };
        worker.onerror = (e) => { clearTimeout(t); rej(new Error('worker: ' + (e.message || 'error'))); };
        worker.postMessage({ request: req.titleCard, width, height, decoded: decoded.buffer, maxSeconds: ${Number(maxSeconds)}, threshold: ${Number(threshold)} }, [decoded.buffer]);
      });
      return { ...out, at, width, height, duration, requested: req.titleCard.text && req.titleCard.text.runningTime, layout: req.titleCard.layout, requests: K.requests.length };
    } catch (e) {
      return { error: String((e && e.message) || e).slice(0, 200) };
    } finally {
      worker.terminate(); URL.revokeObjectURL(url);
    }
  })()`)
  if (!r || r.error || !r.ok) return { error: r?.error ?? 'no reading', readMs: Date.now() - t0, ...(r ?? {}) }
  const [best, second] = r.scores
  const round = (x) => (x === null ? null : Math.round(x * 100) / 100)
  return {
    time: best.time,
    clear: second ? !!r.pair && r.pair.second - r.pair.best >= 10 && r.pair.second >= 1.5 * r.pair.best : true,
    pair: r.pair ? { pixels: r.pair.pixels, best: round(r.pair.best), second: round(r.pair.second) } : null,
    best: { time: best.time, score: round(best.score) },
    second: second ? { time: second.time, score: round(second.score) } : null,
    scores: Object.fromEntries(r.scores.map((s) => [s.time, round(s.score)])),
    restScore: round(r.restScore),
    maskPixels: r.maskPixels,
    candidates: r.times,
    requested: r.requested,
    layout: r.layout,
    requests: r.requests,
    frame: { at: r.at, width: r.width, height: r.height },
    duration: r.duration,
    readMs: Date.now() - t0,
  }
}
