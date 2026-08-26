/**
 * Browser lifecycle protection for processing and saving.
 *
 * Long local encodes must not silently pause with the display or disappear on
 * a casual reload. The guard owns those two browser policies for exactly the
 * interval while processing or a streamed save is active; unsupported or
 * denied wake locks degrade to unload protection rather than blocking either.
 */

import { log } from './logger'

interface WakeLockSentinelLike {
  release(): Promise<void>
  addEventListener(type: 'release', listener: EventListener): void
  removeEventListener(type: 'release', listener: EventListener): void
}

interface VisibilityTarget {
  readonly visibilityState: DocumentVisibilityState
  addEventListener(type: 'visibilitychange', listener: EventListener): void
  removeEventListener(type: 'visibilitychange', listener: EventListener): void
}

interface UnloadTarget {
  addEventListener(type: 'beforeunload', listener: EventListener): void
  removeEventListener(type: 'beforeunload', listener: EventListener): void
}

export interface ProcessingGuardEnvironment {
  readonly visibility: VisibilityTarget
  readonly unload: UnloadTarget
  readonly requestWakeLock?: () => Promise<WakeLockSentinelLike>
}

/** Creates the production browser bindings without making tests patch globals. */
export function browserProcessingGuardEnvironment(): ProcessingGuardEnvironment {
  const requestWakeLock =
    'wakeLock' in navigator && navigator.wakeLock !== undefined
      ? () => navigator.wakeLock.request('screen')
      : undefined

  return requestWakeLock === undefined
    ? { visibility: document, unload: window }
    : { visibility: document, unload: window, requestWakeLock }
}

export class ProcessingGuard {
  private active = false
  private saving = false
  private retainedResult = false
  private unloadProtected = false
  private wakeProtected = false
  private wakeLock: WakeLockSentinelLike | null = null
  private wakeLockReleaseListener: EventListener | null = null
  private wakeRequest: Promise<void> | null = null
  private reacquireAfterRequest = false

  private readonly onBeforeUnload: EventListener = (event) => {
    if (!this.active && !this.saving && !this.retainedResult) return
    event.preventDefault()
    event.returnValue = true
  }

  private readonly onVisibilityChange: EventListener = () => {
    if (!this.shouldKeepAwake()) return
    if (this.environment.visibility.visibilityState === 'visible') {
      this.acquireWakeLock()
    } else {
      void this.releaseWakeLock()
    }
  }

  public constructor(private readonly environment: ProcessingGuardEnvironment) {}

  /** Activates unload protection and requests a screen wake lock when possible. */
  public start(): void {
    if (this.active) return
    this.active = true
    this.syncUnloadProtection()
    void this.syncWakeProtection()
  }

  /** Releases processing's policies without interrupting an overlapping save. */
  public async stop(): Promise<void> {
    if (!this.active) return
    this.active = false
    this.syncUnloadProtection()
    await this.syncWakeProtection()
  }

  /** Extends wake and unload protection across a potentially long streamed save. */
  public async setSaving(saving: boolean): Promise<void> {
    if (this.saving === saving) return
    this.saving = saving
    this.syncUnloadProtection()
    await this.syncWakeProtection()
  }

  /** Extends reload protection while an output remains unsaved or undiscarded. */
  public setRetainedResult(retained: boolean): void {
    if (this.retainedResult === retained) return
    this.retainedResult = retained
    this.syncUnloadProtection()
  }

  private syncUnloadProtection(): void {
    const shouldProtect = this.active || this.saving || this.retainedResult
    if (shouldProtect === this.unloadProtected) return
    this.unloadProtected = shouldProtect
    if (shouldProtect) {
      this.environment.unload.addEventListener('beforeunload', this.onBeforeUnload)
    } else {
      this.environment.unload.removeEventListener('beforeunload', this.onBeforeUnload)
    }
  }

  /** Keeps one visibility listener and wake-lock lifetime across overlapping work. */
  private async syncWakeProtection(): Promise<void> {
    const shouldProtect = this.shouldKeepAwake()
    if (shouldProtect === this.wakeProtected) return
    this.wakeProtected = shouldProtect
    if (shouldProtect) {
      this.environment.visibility.addEventListener('visibilitychange', this.onVisibilityChange)
      this.acquireWakeLock()
      return
    }

    this.reacquireAfterRequest = false
    this.environment.visibility.removeEventListener('visibilitychange', this.onVisibilityChange)
    await this.releaseWakeLock()
  }

  private shouldKeepAwake(): boolean {
    return this.active || this.saving
  }

  private acquireWakeLock(): void {
    if (
      !this.shouldKeepAwake() ||
      this.environment.visibility.visibilityState !== 'visible' ||
      this.wakeLock !== null ||
      this.environment.requestWakeLock === undefined
    ) {
      return
    }

    // A request can still be awaiting release after the page became hidden or
    // work stopped. If work becomes eligible again in that window, remember
    // the request rather than losing it behind the in-flight guard.
    if (this.wakeRequest !== null) {
      this.reacquireAfterRequest = true
      return
    }

    this.wakeRequest = this.environment
      .requestWakeLock()
      .then(async (wakeLock) => {
        if (!this.shouldKeepAwake() || this.environment.visibility.visibilityState !== 'visible') {
          await wakeLock.release()
          return
        }
        this.attachWakeLock(wakeLock)
        log.info('lifecycle', 'screen wake lock acquired')
      })
      .catch((error: unknown) => {
        log.warn('lifecycle', 'screen wake lock unavailable', {
          reason: error instanceof Error ? error.message : String(error),
        })
      })
      .finally(() => {
        this.wakeRequest = null
        if (this.reacquireAfterRequest) {
          this.reacquireAfterRequest = false
          this.acquireWakeLock()
        }
      })
  }

  /** Tracks platform revocation without letting a stale sentinel clear its replacement. */
  private attachWakeLock(wakeLock: WakeLockSentinelLike): void {
    const onRelease: EventListener = () => {
      if (!this.detachWakeLock(wakeLock)) return
      log.info('lifecycle', 'screen wake lock released by the platform')
      if (!this.shouldKeepAwake() || this.environment.visibility.visibilityState !== 'visible')
        return

      // A platform is allowed to revoke immediately after resolving a request.
      // In that case the current request's `finally` has not cleared yet, so
      // remember the retry rather than losing it to the in-flight guard.
      if (this.wakeRequest !== null) this.reacquireAfterRequest = true
      else this.acquireWakeLock()
    }
    this.wakeLock = wakeLock
    this.wakeLockReleaseListener = onRelease
    wakeLock.addEventListener('release', onRelease)
  }

  /** Clears only `wakeLock`; a late event from an older sentinel is ignored. */
  private detachWakeLock(wakeLock: WakeLockSentinelLike): boolean {
    if (this.wakeLock !== wakeLock) return false
    if (this.wakeLockReleaseListener) {
      wakeLock.removeEventListener('release', this.wakeLockReleaseListener)
    }
    this.wakeLock = null
    this.wakeLockReleaseListener = null
    return true
  }

  private async releaseWakeLock(): Promise<void> {
    const wakeLock = this.wakeLock
    if (wakeLock === null) return
    this.detachWakeLock(wakeLock)

    try {
      await wakeLock.release()
      log.info('lifecycle', 'screen wake lock released')
    } catch (error: unknown) {
      log.warn('lifecycle', 'screen wake lock release failed', {
        reason: error instanceof Error ? error.message : String(error),
      })
    }
  }
}
