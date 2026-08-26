import { describe, expect, it, vi } from 'vitest'

import { ProcessingGuard, type ProcessingGuardEnvironment } from './processing-guard'

class FakeVisibility extends EventTarget {
  public visibilityState: DocumentVisibilityState = 'visible'

  public setVisibility(state: DocumentVisibilityState): void {
    this.visibilityState = state
    this.dispatchEvent(new Event('visibilitychange'))
  }
}

class FakeWakeLock extends EventTarget {
  public readonly release = vi.fn(() => {
    this.dispatchEvent(new Event('release'))
    return Promise.resolve()
  })

  /** Simulates the user agent revoking the sentinel without an explicit release call. */
  public revoke(): void {
    this.dispatchEvent(new Event('release'))
  }
}

function environment(requestWakeLock?: ProcessingGuardEnvironment['requestWakeLock']): {
  readonly value: ProcessingGuardEnvironment
  readonly visibility: FakeVisibility
  readonly unload: EventTarget
} {
  const visibility = new FakeVisibility()
  const unload = new EventTarget()
  const value =
    requestWakeLock === undefined
      ? { visibility, unload }
      : { visibility, unload, requestWakeLock }
  return { value, visibility, unload }
}

async function settle(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

function beforeUnloadEvent(): Event {
  const event = new Event('beforeunload', { cancelable: true })
  // Node's Event exposes a getter-only compatibility property; browsers expose
  // the writable BeforeUnloadEvent field exercised by the production binding.
  Object.defineProperty(event, 'returnValue', { configurable: true, value: false, writable: true })
  return event
}

describe('ProcessingGuard', () => {
  it('protects only the active processing interval from unload', async () => {
    const fixture = environment()
    const guard = new ProcessingGuard(fixture.value)

    const before = beforeUnloadEvent()
    fixture.unload.dispatchEvent(before)
    expect(before.defaultPrevented).toBe(false)

    guard.start()
    const during = beforeUnloadEvent()
    fixture.unload.dispatchEvent(during)
    expect(during.defaultPrevented).toBe(true)

    await guard.stop()
    const after = beforeUnloadEvent()
    fixture.unload.dispatchEvent(after)
    expect(after.defaultPrevented).toBe(false)
  })

  it('acquires, releases while hidden, and reacquires when visible', async () => {
    const locks = [new FakeWakeLock(), new FakeWakeLock()]
    let request = 0
    const requestWakeLock = vi.fn(() => Promise.resolve(locks[request++]!))
    const fixture = environment(requestWakeLock)
    const guard = new ProcessingGuard(fixture.value)

    guard.start()
    await settle()
    expect(requestWakeLock).toHaveBeenCalledTimes(1)

    fixture.visibility.setVisibility('hidden')
    await settle()
    expect(locks[0]!.release).toHaveBeenCalledTimes(1)

    fixture.visibility.setVisibility('visible')
    await settle()
    expect(requestWakeLock).toHaveBeenCalledTimes(2)

    await guard.stop()
    expect(locks[1]!.release).toHaveBeenCalledTimes(1)
  })

  it('releases a pending lock that arrives after processing stops', async () => {
    let resolveRequest: ((value: FakeWakeLock) => void) | undefined
    const wakeLock = new FakeWakeLock()
    const requestWakeLock = () =>
      new Promise<FakeWakeLock>((resolve) => {
        resolveRequest = resolve
      })
    const fixture = environment(requestWakeLock)
    const guard = new ProcessingGuard(fixture.value)

    guard.start()
    await guard.stop()
    resolveRequest?.(wakeLock)
    await settle()

    expect(wakeLock.release).toHaveBeenCalledTimes(1)
  })

  it('reacquires after platform revocation while visible but not after explicit stop', async () => {
    const locks = [new FakeWakeLock(), new FakeWakeLock()]
    let request = 0
    const requestWakeLock = vi.fn(() => Promise.resolve(locks[request++]!))
    const fixture = environment(requestWakeLock)
    const guard = new ProcessingGuard(fixture.value)

    guard.start()
    await settle()
    locks[0]!.revoke()
    await settle()

    expect(requestWakeLock).toHaveBeenCalledTimes(2)
    expect(locks[0]!.release).not.toHaveBeenCalled()

    await guard.stop()
    await settle()

    expect(locks[1]!.release).toHaveBeenCalledOnce()
    expect(requestWakeLock).toHaveBeenCalledTimes(2)
  })

  it('ignores a late release event from a sentinel that has already been replaced', async () => {
    const locks = [new FakeWakeLock(), new FakeWakeLock()]
    let request = 0
    const requestWakeLock = vi.fn(() => Promise.resolve(locks[request++]!))
    const fixture = environment(requestWakeLock)
    const guard = new ProcessingGuard(fixture.value)

    guard.start()
    await settle()
    fixture.visibility.setVisibility('hidden')
    await settle()
    fixture.visibility.setVisibility('visible')
    await settle()

    locks[0]!.revoke()
    await settle()

    expect(requestWakeLock).toHaveBeenCalledTimes(2)
    await guard.stop()
    expect(locks[1]!.release).toHaveBeenCalledOnce()
  })

  it('continues unload protection when the wake-lock request rejects', async () => {
    const fixture = environment(() =>
      Promise.reject(new DOMException('denied', 'NotAllowedError')),
    )
    const guard = new ProcessingGuard(fixture.value)

    guard.start()
    await settle()
    const event = beforeUnloadEvent()
    fixture.unload.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    await guard.stop()
  })

  it('keeps unload protection but not the wake lock for a retained result', async () => {
    const wakeLock = new FakeWakeLock()
    const requestWakeLock = vi.fn(() => Promise.resolve(wakeLock))
    const fixture = environment(requestWakeLock)
    const guard = new ProcessingGuard(fixture.value)

    guard.start()
    await settle()
    guard.setRetainedResult(true)
    await guard.stop()

    expect(wakeLock.release).toHaveBeenCalledOnce()
    const retained = beforeUnloadEvent()
    fixture.unload.dispatchEvent(retained)
    expect(retained.defaultPrevented).toBe(true)

    guard.setRetainedResult(false)
    const releasedResult = beforeUnloadEvent()
    fixture.unload.dispatchEvent(releasedResult)
    expect(releasedResult.defaultPrevented).toBe(false)
  })
})
