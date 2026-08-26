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
  readonly hasWebLocks: boolean
  /** A locked OPFS canary was written, closed and completely removed. */
  readonly canUseOpfs: boolean
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
    typeof globalThis.VideoEncoder !== 'undefined' && typeof globalThis.VideoDecoder !== 'undefined'
  )
}

export function hasOpfs(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.storage?.getDirectory === 'function'
}

export function hasWebLocks(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.locks?.request === 'function'
}

export interface OpfsUsabilityEnvironment {
  readonly isSecureContext: boolean
  readonly hasWebLocks: boolean
  readonly getDirectory?: () => Promise<FileSystemDirectoryHandle>
  readonly requestLock?: (
    name: string,
    callback: (available: boolean) => Promise<void>,
  ) => Promise<void>
  readonly randomUUID?: () => string
}

const OPFS_CANARY_PREFIX = 'uon-video-helper-capability-'
const OPFS_CANARY_FILE = 'canary.bin'
const OPFS_CANARY_BYTES = new Uint8Array([0x55, 0x4f, 0x4e])

/** File-system absence means cleanup already reached the required state. */
function isNotFoundError(cause: unknown): boolean {
  return (
    typeof cause === 'object' && cause !== null && 'name' in cause && cause.name === 'NotFoundError'
  )
}

/** Keeps platform rejection values safe to rethrow after cleanup completes. */
function asError(cause: unknown): Error {
  return cause instanceof Error ? cause : new Error(String(cause))
}

/** The browser-backed environment, kept injectable so failure paths are hermetic. */
function browserOpfsUsabilityEnvironment(): OpfsUsabilityEnvironment {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined
  return {
    isSecureContext: globalThis.isSecureContext === true,
    hasWebLocks: hasWebLocks(),
    ...(typeof navigator !== 'undefined' && typeof navigator.storage?.getDirectory === 'function'
      ? { getDirectory: navigator.storage.getDirectory.bind(navigator.storage) }
      : {}),
    ...(locks
      ? {
          requestLock: async (name: string, callback: (available: boolean) => Promise<void>) => {
            await locks.request(name, { ifAvailable: true, mode: 'exclusive' }, async (lock) =>
              callback(lock !== null),
            )
          },
        }
      : {}),
    ...(typeof globalThis.crypto?.randomUUID === 'function'
      ? { randomUUID: globalThis.crypto.randomUUID.bind(globalThis.crypto) }
      : {}),
  }
}

/** Runs the canary only while its unique exclusive lock remains held. */
async function runUnderCanaryLock(
  requestLock: NonNullable<OpfsUsabilityEnvironment['requestLock']>,
  lockName: string,
  operation: () => Promise<void>,
): Promise<boolean> {
  let acquired = false
  await requestLock(lockName, async (available) => {
    if (!available) return
    acquired = true
    await operation()
  })
  return acquired
}

/**
 * Creates, writes, closes and removes one tiny uniquely named OPFS canary.
 *
 * Cleanup stays inside the canary lock. The explicit file removal proves the
 * writer released its handle; the non-recursive directory removal proves the
 * directory is empty. A recursive removal is the recovery path for every
 * earlier failure, including a rejected write or close.
 */
async function runOpfsCanary(
  root: FileSystemDirectoryHandle,
  directoryName: string,
): Promise<void> {
  let directory: FileSystemDirectoryHandle | null = null
  let writable: FileSystemWritableFileStream | null = null
  let directoryCreationAttempted = false
  let directoryRemoved = false
  let failure: Error | null = null

  try {
    directoryCreationAttempted = true
    directory = await root.getDirectoryHandle(directoryName, { create: true })
    const file = await directory.getFileHandle(OPFS_CANARY_FILE, { create: true })
    writable = await file.createWritable()
    await writable.write(OPFS_CANARY_BYTES)
    await writable.close()
    writable = null

    await directory.removeEntry(OPFS_CANARY_FILE)
    await root.removeEntry(directoryName)
    directoryRemoved = true
  } catch (cause) {
    failure = asError(cause)
  }

  if (writable) {
    try {
      await writable.abort()
    } catch (cause) {
      failure ??= asError(cause)
    }
  }

  if (directoryCreationAttempted && !directoryRemoved) {
    try {
      await root.removeEntry(directoryName, { recursive: true })
    } catch (recursiveCause) {
      if (!isNotFoundError(recursiveCause)) {
        // Some implementations reject recursive removal while an entry is
        // transitioning out of an aborted writable. Retry as the same explicit
        // file-then-empty-directory lifecycle used by the success path.
        try {
          if (directory) {
            await directory.removeEntry(OPFS_CANARY_FILE).catch(() => undefined)
          }
          await root.removeEntry(directoryName)
        } catch (cause) {
          if (!isNotFoundError(cause)) {
            failure ??= asError(cause)
            log.warn('capability', 'working storage canary cleanup failed', {
              reason: asError(cause).message,
            })
          }
        }
      }
    }
  }

  if (failure) throw failure
}

/**
 * Proves the complete scratch-storage lifecycle the pipeline needs.
 *
 * Presence or root-open checks miss permission, policy and private-mode
 * failures in locking, directory/file creation, writing, closing or deletion.
 * The canary contains three fixed non-media bytes and is removed before this
 * function resolves. Any uncertain stage fails closed.
 */
export async function checkOpfsUsable(
  environment: OpfsUsabilityEnvironment = browserOpfsUsabilityEnvironment(),
): Promise<boolean> {
  if (
    !environment.isSecureContext ||
    !environment.hasWebLocks ||
    !environment.getDirectory ||
    !environment.requestLock ||
    !environment.randomUUID
  ) {
    return false
  }

  try {
    const getDirectory = environment.getDirectory
    const requestLock = environment.requestLock
    const randomUUID = environment.randomUUID
    const directoryName = `${OPFS_CANARY_PREFIX}${randomUUID()}`
    const lockName = `opfs-capability:${directoryName}`
    return await runUnderCanaryLock(requestLock, lockName, async () => {
      const root = await getDirectory()
      await runOpfsCanary(root, directoryName)
    })
  } catch (cause) {
    log.warn('capability', 'working storage canary failed', {
      reason: cause instanceof Error ? cause.message : String(cause),
    })
    return false
  }
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

  const coarsePointer = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
  const touchPoints = navigator.maxTouchPoints ?? 0
  return coarsePointer && touchPoints > 1 ? 'mobile' : 'desktop'
}

/**
 * Asks the browser whether it will encode the AUDIO this job needs.
 *
 * It was never asked. `hasWebCodecs` checks that the `AudioEncoder` CLASS
 * exists, which is a different question — Firefox 154 has the class, refuses
 * `mp4a.40.2` at every bitrate and channel count, and accepts Opus and every
 * video configuration we ask for. So a Firefox user passed pre-flight, watched
 * the progress bar, and got "something went wrong" the moment the audio track
 * reached the encoder. Measured 2026-08-26 in headless AND normal Firefox.
 *
 * @returns `true` when the configuration is supported, `false` when it is
 *   refused or the class is missing. Never throws: a browser that cannot answer
 *   is treated as unable, because the alternative is failing mid-job.
 */
export async function canEncodeAudio(config: AudioEncoderConfig): Promise<boolean> {
  if (typeof globalThis.AudioEncoder === 'undefined') return false
  try {
    const result = await AudioEncoder.isConfigSupported(config)
    const supported = result.supported === true
    log.info('capability', 'audio encode support checked', {
      supported,
      codec: config.codec,
      numberOfChannels: config.numberOfChannels,
      bitrate: config.bitrate,
    })
    return supported
  } catch (cause) {
    log.warn('capability', 'audio encode support could not be determined', {
      reason: cause instanceof Error ? cause.message : String(cause),
    })
    return false
  }
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
    if (quota === undefined)
      return { availableBytes: null, quotaBytes: null, usageBytes: usage ?? null }
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
  const secureContext = globalThis.isSecureContext === true
  const [storage, canUseOpfs] = await Promise.all([checkStorage(), checkOpfsUsable()])
  const report: CapabilityReport = {
    hasWebCodecs: hasWebCodecs(),
    hasOpfs: hasOpfs(),
    hasWebLocks: hasWebLocks(),
    canUseOpfs,
    isSecureContext: secureContext,
    deviceClass: detectDeviceClass(),
    hardwareConcurrency: navigator.hardwareConcurrency ?? null,
    storage,
  }
  log.info('capability', 'device capabilities inspected', {
    hasWebCodecs: report.hasWebCodecs,
    hasOpfs: report.hasOpfs,
    hasWebLocks: report.hasWebLocks,
    canUseOpfs: report.canUseOpfs,
    isSecureContext: report.isSecureContext,
    deviceClass: report.deviceClass,
    hardwareConcurrency: report.hardwareConcurrency,
    quotaBytes: storage.quotaBytes,
    availableBytes: storage.availableBytes,
  })
  return report
}
