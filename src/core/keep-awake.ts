/**
 * Keeping a long job alive, per spec section 7.5.
 *
 * Two hazards, both of which end with an hour of work gone and nothing to show
 * for it: the device sleeps mid-encode, and the tab is closed or reloaded by
 * someone who did not realise anything was happening. Neither had any
 * treatment at all (VH-63 / review R-12).
 *
 * Both degrade quietly. The Screen Wake Lock API is absent in Firefox on some
 * platforms and can be refused outright — a refused lock is a job that may be
 * interrupted, not a job that must not start — and `beforeunload` is honoured
 * differently everywhere. Neither is load-bearing for correctness; both are
 * worth asking for.
 */

import { log } from './logger'

/** The bit of `navigator.wakeLock` this needs, since the DOM lib may not have it. */
interface WakeLockLike {
  request(type: 'screen'): Promise<WakeLockSentinelLike>
}
interface WakeLockSentinelLike {
  release(): Promise<void>
  addEventListener(type: 'release', listener: () => void): void
  readonly released: boolean
}

function wakeLockApi(): WakeLockLike | null {
  const api = (navigator as unknown as { wakeLock?: WakeLockLike }).wakeLock
  return api && typeof api.request === 'function' ? api : null
}

/**
 * Holds a screen wake lock, and takes it back when the tab returns to view.
 *
 * The re-acquisition is not optional politeness: the browser releases the lock
 * whenever the document is hidden, so a user who switches tabs during a
 * forty-minute encode comes back to a machine that is free to sleep.
 */
export class KeepAwake {
  private sentinel: WakeLockSentinelLike | null = null
  private wanted = false
  private readonly onVisible = (): void => {
    if (this.wanted && document.visibilityState === 'visible') void this.acquire()
  }

  /** Whether a lock is held right now. False is a normal outcome, not a failure. */
  get held(): boolean {
    return this.sentinel !== null && !this.sentinel.released
  }

  async start(): Promise<void> {
    if (this.wanted) return
    this.wanted = true
    document.addEventListener('visibilitychange', this.onVisible)
    await this.acquire()
  }

  async stop(): Promise<void> {
    this.wanted = false
    document.removeEventListener('visibilitychange', this.onVisible)
    const sentinel = this.sentinel
    this.sentinel = null
    if (!sentinel) return
    try {
      await sentinel.release()
    } catch {
      // Already gone. Releasing a released lock is not a problem worth a line.
    }
  }

  private async acquire(): Promise<void> {
    const api = wakeLockApi()
    if (!api || this.held) return
    try {
      const sentinel = await api.request('screen')
      // Reacquired on the next visibility change rather than here: the release
      // event fires when the document is hidden, and asking again while hidden
      // is refused.
      sentinel.addEventListener('release', () => {
        if (this.sentinel === sentinel) this.sentinel = null
      })
      this.sentinel = sentinel
      log.debug('keep-awake', 'screen wake lock held', {})
    } catch (cause) {
      // Refused, unsupported, or the document was hidden. All the same to the
      // job: it runs, and the device may sleep.
      log.debug('keep-awake', 'no screen wake lock', {
        reason: cause instanceof Error ? cause.name : String(cause),
      })
    }
  }
}

/**
 * Warns before the page is closed while there is something to lose.
 *
 * Kept as a function returning its own remover rather than a class, because
 * the one thing that must never happen is the handler outliving the reason for
 * it — a page that always warns is a page whose warning is ignored.
 */
export function warnBeforeLeaving(): () => void {
  const handler = (event: BeforeUnloadEvent): void => {
    // Both, deliberately: `preventDefault` is the modern spelling and
    // `returnValue` is what older engines still read.
    event.preventDefault()
    event.returnValue = ''
  }
  window.addEventListener('beforeunload', handler)
  return () => {
    window.removeEventListener('beforeunload', handler)
  }
}

/**
 * Whether there is anything to lose by leaving right now.
 *
 * Separated from the DOM so the rule can be tested: the suite runs in Node,
 * and the rule is the part worth protecting. Both ways of getting it wrong are
 * real — a page that always warns trains people to dismiss the warning, and a
 * page that never warns loses an hour of encoding to a stray reload.
 */
export function shouldWarnBeforeLeaving(state: {
  /** A job is encoding. */
  readonly jobInFlight: boolean
  /** A save is streaming out of OPFS. */
  readonly saveInFlight: boolean
  /** A finished file the user has not put anywhere yet. */
  readonly hasUnsavedResult: boolean
}): boolean {
  return state.jobInFlight || state.saveInFlight || state.hasUnsavedResult
}
