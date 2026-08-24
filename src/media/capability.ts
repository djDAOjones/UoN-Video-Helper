/**
 * "Can this device do this job?", spec section 7.2.
 *
 * Every check is asked against the **exact** configuration the job will use,
 * not a generic capability flag. Codec support in WebCodecs is
 * per-configuration: a browser that encodes 720p H.264 may refuse 4K, and
 * discovering that forty minutes in is the failure this whole module exists
 * to prevent.
 */

import { log } from '../core/logger'

export interface EncodeSupport {
  readonly supported: boolean
  /** The configuration actually asked about, so a failure can be reported precisely. */
  readonly config: VideoEncoderConfig
  /** Whether the browser promised hardware acceleration, when it says. */
  readonly hardwareAccelerated: boolean | null
}

export interface StorageReport {
  /** Free bytes, or `null` when the browser declines to say. */
  readonly availableBytes: number | null
  readonly quotaBytes: number | null
  readonly usageBytes: number | null
}

export interface CapabilityReport {
  readonly hasWebCodecs: boolean
  readonly hasOpfs: boolean
  readonly isSecureContext: boolean
  readonly deviceClass: 'desktop' | 'mobile'
  readonly hardwareConcurrency: number | null
  readonly storage: StorageReport
}

/** `navigator.userAgentData` is not in TypeScript's DOM lib yet. */
interface UserAgentDataLike {
  readonly mobile?: boolean
}

export function hasWebCodecs(): boolean {
  return (
    typeof globalThis.VideoEncoder !== 'undefined' &&
    typeof globalThis.VideoDecoder !== 'undefined' &&
    typeof globalThis.AudioEncoder !== 'undefined' &&
    typeof globalThis.AudioDecoder !== 'undefined'
  )
}

export function hasOpfs(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.storage?.getDirectory === 'function'
}

/**
 * Whether this is a phone or tablet.
 *
 * Spec section 7.3 discourages rather than blocks on mobile, and section 9.4
 * requires the app stay usable there — so a wrong answer costs a needless
 * warning, not a broken app. `userAgentData.mobile` is the honest signal where
 * it exists; the fallback pairs a coarse pointer with a touch screen, which
 * avoids classifying a touchscreen laptop as a phone.
 */
export function detectDeviceClass(): 'desktop' | 'mobile' {
  const data = (navigator as Navigator & { userAgentData?: UserAgentDataLike }).userAgentData
  if (typeof data?.mobile === 'boolean') return data.mobile ? 'mobile' : 'desktop'

  const coarsePointer =
    typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
  const touchPoints = navigator.maxTouchPoints ?? 0
  return coarsePointer && touchPoints > 1 ? 'mobile' : 'desktop'
}

/** Asks the browser about the exact encoder configuration this job needs. */
export async function checkEncodeSupport(config: VideoEncoderConfig): Promise<EncodeSupport> {
  if (typeof globalThis.VideoEncoder === 'undefined') {
    return { supported: false, config, hardwareAccelerated: null }
  }
  try {
    const result = await VideoEncoder.isConfigSupported(config)
    const supported = result.supported === true
    log.info('capability', 'encode support checked', {
      supported,
      codec: config.codec,
      width: config.width,
      height: config.height,
      bitrate: config.bitrate,
    })
    return {
      supported,
      config,
      hardwareAccelerated:
        result.config?.hardwareAcceleration === undefined
          ? null
          : result.config.hardwareAcceleration === 'prefer-hardware',
    }
  } catch (cause) {
    // A throw means "no" as surely as a false does, and is more common than
    // the spec suggests for unusual dimensions.
    log.warn('capability', 'encode support check threw', {
      reason: cause instanceof Error ? cause.message : String(cause),
    })
    return { supported: false, config, hardwareAccelerated: null }
  }
}

/**
 * Free storage, per `navigator.storage.estimate()`.
 *
 * Returns `null` availability rather than a guess when the browser declines.
 * Firefox in particular reports a quota that has little to do with free disk,
 * so this figure is treated as advisory throughout — see `preflight.ts`, where
 * an unknown quota warns rather than blocks.
 */
export async function checkStorage(): Promise<StorageReport> {
  if (typeof navigator === 'undefined' || typeof navigator.storage?.estimate !== 'function') {
    return { availableBytes: null, quotaBytes: null, usageBytes: null }
  }
  try {
    const { quota, usage } = await navigator.storage.estimate()
    if (quota === undefined) return { availableBytes: null, quotaBytes: null, usageBytes: usage ?? null }
    return {
      availableBytes: Math.max(0, quota - (usage ?? 0)),
      quotaBytes: quota,
      usageBytes: usage ?? null,
    }
  } catch (cause) {
    log.warn('capability', 'storage estimate failed', {
      reason: cause instanceof Error ? cause.message : String(cause),
    })
    return { availableBytes: null, quotaBytes: null, usageBytes: null }
  }
}

/** Everything that can be known before touching the user's file. */
export async function inspectCapabilities(): Promise<CapabilityReport> {
  const storage = await checkStorage()
  const report: CapabilityReport = {
    hasWebCodecs: hasWebCodecs(),
    hasOpfs: hasOpfs(),
    isSecureContext: typeof isSecureContext === 'boolean' ? isSecureContext : false,
    deviceClass: detectDeviceClass(),
    hardwareConcurrency: navigator.hardwareConcurrency ?? null,
    storage,
  }
  log.info('capability', 'device capabilities inspected', {
    hasWebCodecs: report.hasWebCodecs,
    hasOpfs: report.hasOpfs,
    deviceClass: report.deviceClass,
    hardwareConcurrency: report.hardwareConcurrency,
    quotaBytes: storage.quotaBytes,
    availableBytes: storage.availableBytes,
  })
  return report
}
