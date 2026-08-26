/** Extensions mirrored by the accessible file-input fallback in `index.html`. */
export const SOURCE_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.m4v', '.mkv', '.webm'] as const

interface OpenFilePickerOptions {
  readonly multiple?: boolean
  readonly excludeAcceptAllOption?: boolean
  readonly types?: ReadonlyArray<{
    readonly description?: string
    readonly accept: Readonly<Record<string, readonly string[]>>
  }>
}

export type SourceOpenPicker = (
  options?: OpenFilePickerOptions,
) => Promise<readonly FileSystemFileHandle[]>

/** The source file together with the read-only handle needed for identity checks. */
export interface HandleBackedSource {
  readonly file: File
  readonly handle: FileSystemFileHandle
}

export type SourcePickOutcome =
  | { readonly kind: 'selected'; readonly source: HandleBackedSource }
  | { readonly kind: 'cancelled' }

/** Injectable capability surface used by the UI decision and its Node tests. */
export interface SourcePickerCapabilities {
  readonly openPicker?: SourceOpenPicker
  readonly savePicker?: unknown
  readonly sameEntrySupported?: boolean
}

type SourcePickerGlobal = typeof globalThis & {
  readonly showOpenFilePicker?: SourceOpenPicker
  readonly FileSystemHandle?: {
    readonly prototype?: { readonly isSameEntry?: unknown }
  }
}

/** Reads the browser surface without assuming this optional API exists. */
function browserCapabilities(): SourcePickerCapabilities {
  const scope = globalThis as SourcePickerGlobal
  return {
    ...(scope.showOpenFilePicker ? { openPicker: scope.showOpenFilePicker } : {}),
    ...(typeof globalThis.showSaveFilePicker === 'function'
      ? { savePicker: globalThis.showSaveFilePicker }
      : {}),
    sameEntrySupported: typeof scope.FileSystemHandle?.prototype?.isSameEntry === 'function',
  }
}

/**
 * Whether the app can choose a handle-backed source and compare it at save.
 *
 * All three capabilities are required. A file input plus a save picker cannot
 * prove identity and therefore must use the download fallback instead.
 */
export function sourceHandlePickerAvailable(
  capabilities: SourcePickerCapabilities = browserCapabilities(),
): boolean {
  return (
    typeof capabilities.openPicker === 'function' &&
    typeof capabilities.savePicker === 'function' &&
    capabilities.sameEntrySupported === true
  )
}

/**
 * Opens the browser picker and reads the chosen source without requesting
 * write access. The returned handle is retained solely for `isSameEntry`.
 */
export async function pickSourceFile(
  openPicker: SourceOpenPicker | undefined = browserCapabilities().openPicker,
): Promise<SourcePickOutcome> {
  if (!openPicker) throw new Error('The handle-backed source picker is not available')

  try {
    const handles = await openPicker({
      multiple: false,
      excludeAcceptAllOption: false,
      types: [
        {
          description: 'Video files',
          accept: { 'video/*': SOURCE_VIDEO_EXTENSIONS },
        },
      ],
    })
    const handle = handles[0]
    if (!handle) return { kind: 'cancelled' }
    const file = await handle.getFile()
    return { kind: 'selected', source: Object.freeze({ file, handle }) }
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      return { kind: 'cancelled' }
    }
    throw cause
  }
}
