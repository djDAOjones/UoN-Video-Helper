import { describe, expect, it, vi } from 'vitest'

import { ProcessInterlock } from './process-interlock'
import { ProcessingGuard, type ProcessingGuardEnvironment } from './processing-guard'

class FakeVisibility extends EventTarget {
  public readonly visibilityState: DocumentVisibilityState = 'visible'
}

class FakeWakeLock extends EventTarget {
  public readonly release = vi.fn(() => Promise.resolve())
}

function beforeUnloadEvent(): Event {
  const event = new Event('beforeunload', { cancelable: true })
  Object.defineProperty(event, 'returnValue', { configurable: true, value: false, writable: true })
  return event
}

describe('ProcessInterlock', () => {
  it('keeps Start and lifecycle protection locked until a timed-out worker answers', async () => {
    const interlock = new ProcessInterlock()
    const visibility = new FakeVisibility()
    const unload = new EventTarget()
    const wakeLock = new FakeWakeLock()
    const environment: ProcessingGuardEnvironment = {
      visibility,
      unload,
      requestWakeLock: vi.fn(() => Promise.resolve(wakeLock)),
    }
    const guard = new ProcessingGuard(environment)
    const applyOwnership = async (): Promise<void> => {
      if (interlock.locked) guard.start()
      else await guard.stop()
    }

    interlock.setRunning(true)
    await applyOwnership()
    interlock.markTimedOut(17)
    interlock.setRunning(false)
    await applyOwnership()

    expect(interlock.locked).toBe(true)
    expect(wakeLock.release).not.toHaveBeenCalled()
    const awaitingTerminal = beforeUnloadEvent()
    unload.dispatchEvent(awaitingTerminal)
    expect(awaitingTerminal.defaultPrevented).toBe(true)

    expect(interlock.acknowledgeTimedOut(17)).toBe(true)
    await applyOwnership()

    expect(interlock.locked).toBe(false)
    expect(wakeLock.release).toHaveBeenCalledOnce()
    const acknowledged = beforeUnloadEvent()
    unload.dispatchEvent(acknowledged)
    expect(acknowledged.defaultPrevented).toBe(false)
  })

  it('drops pending ids only when worker termination proves no live work remains', () => {
    const interlock = new ProcessInterlock()
    interlock.markTimedOut(3)
    interlock.markTimedOut(4)

    expect(interlock.hasTimedOut(3)).toBe(true)
    expect(interlock.acknowledgeTimedOut(99)).toBe(false)
    expect(interlock.locked).toBe(true)

    interlock.clearTimedOut()
    expect(interlock.locked).toBe(false)
  })
})
