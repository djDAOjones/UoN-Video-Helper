/**
 * A timer that measures SILENCE rather than elapsed time.
 *
 * Spec section 7 opens with "no arbitrary file-size or duration cap", and a
 * deadline on a whole job is exactly such a cap — the `process` request carried
 * a one-hour one, so a slow device on a long lecture would be told its job had
 * failed while the job ran happily on (VH-38).
 *
 * What actually distinguishes a wedged worker from a busy one is not how long
 * it has been working but how long it has been quiet. `pipeline.ts` reports a
 * stage every thirty frames, so a healthy job speaks several times a second
 * however long it runs, and a minute of nothing means something is stuck.
 */
export interface Watchdog {
  /** Restart the countdown. Called whenever the watched thing shows a sign of life. */
  reset(): void
  /** Stop watching. Safe to call more than once, and after it has already fired. */
  clear(): void
}

/**
 * @param limitMs - How long silence may last before `onSilence` runs.
 * @param onSilence - Called at most once, and never after {@link Watchdog.clear}.
 */
export function createWatchdog(limitMs: number, onSilence: () => void): Watchdog {
  let timer: ReturnType<typeof setTimeout> | null = null
  let fired = false

  const arm = (): void => {
    timer = setTimeout(() => {
      timer = null
      fired = true
      onSilence()
    }, limitMs)
  }

  const stop = (): void => {
    if (timer !== null) clearTimeout(timer)
    timer = null
  }

  arm()
  return {
    reset() {
      // Once it has fired the decision is made; a late sign of life must not
      // resurrect a request whose caller has already been told it failed.
      if (fired) return
      stop()
      arm()
    },
    clear() {
      fired = true
      stop()
    },
  }
}
