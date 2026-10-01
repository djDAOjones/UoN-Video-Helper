/**
 * Choosing a video by dropping it on the Choose step — spec 9.1 step 1's
 * "file picker or drag-and-drop" (VH-101).
 *
 * The file input stays the primary route, and the only keyboard one. A drop
 * is handed to that input and announced with the input's own `change` event,
 * so a dropped video is read by exactly the code a chosen one is: the same
 * reset of Trim and the verdict, the same request to the worker, and every
 * later reader of `input.files` — the preset change, the job — sees it too.
 * Nothing is uploaded; the `File` never leaves the page.
 *
 * The target is Carbon's file-uploader drop zone: a dashed container that
 * turns solid, with a focus-colour outline and different words, while a file
 * is held over it — never colour alone. A drop it cannot take is refused in
 * words beside the input.
 */

/**
 * What a drop is refused for while the page cannot start a new video.
 * `starting` is the start-up check still running, and `unavailable` a
 * browser it blocked; the picker is disabled for both (VH-110).
 */
export type DropBusy = 'making' | 'saving' | 'starting' | 'unavailable' | null

/** The parts of a dropped file the decision reads. */
export interface DroppedFile {
  readonly name: string
  readonly type: string
}

/**
 * Whether the input's `accept` list admits a file, by the rule the browser's
 * own picker applies: a MIME wildcard (`video/*`), an exact MIME type, or a
 * file extension. Read from the input rather than restated, so the two routes
 * cannot come to admit different files.
 *
 * An empty list admits anything, as an input without `accept` does.
 */
export function acceptsFile(accept: string, file: DroppedFile): boolean {
  const tokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter((token) => token.length > 0)
  if (tokens.length === 0) return true

  const type = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  return tokens.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token)
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1))
    return type === token
  })
}

/**
 * What is wrong with a drop, in words, or `null` when it can be read.
 *
 * Checked in the order the user can do something about: wait, then drop one,
 * then drop a video.
 */
export function dropProblem(
  files: readonly DroppedFile[],
  accept: string,
  busy: DropBusy,
): string | null {
  if (busy === 'making') {
    return 'A video is being made. Cancel it, or wait for it to finish, before choosing another.'
  }
  if (busy === 'saving') {
    return 'A video is being saved. Stop the save, or wait for it to finish, before choosing another.'
  }
  if (busy === 'starting') {
    return 'The tool is still getting ready. Drop the video again in a moment.'
  }
  if (busy === 'unavailable') {
    return 'This browser cannot run the tool, so no video can be read here. The message below says what to do.'
  }
  if (files.length === 0) return 'Nothing was dropped that could be read. Drop a video file.'
  if (files.length > 1) return `That was ${files.length} files. Drop one video at a time.`
  if (!acceptsFile(accept, files[0]!)) {
    return 'That is not a video file. Drop a video — a file whose name ends .mp4 or .mov, say — or choose one above.'
  }
  return null
}

/** The hint's words while a file is held over the zone. The page owns the resting words. */
const HELD_HINT = 'Let go to read this video.'

/** Whether a drag is carrying files rather than text or a link. */
function carriesFiles(event: DragEvent): boolean {
  return event.dataTransfer?.types.includes('Files') ?? false
}

/**
 * Makes `zone` a drop target that hands one video to `input`.
 *
 * Also stops a file dropped ANYWHERE on the page from replacing it. A browser
 * opens a file dropped outside a target, which navigates away — and during a
 * job, takes the job with it. Outside the zone the pointer shows that a drop
 * will do nothing.
 *
 * @param busy - Read at the moment of the drop, so a job or a save started
 *   since the drag began is respected.
 */
export function installDropZone(options: {
  readonly zone: HTMLElement
  readonly input: HTMLInputElement
  /** The line beneath the input that invites the drop, holding its resting words. */
  readonly hint: HTMLElement
  /** An always-present live region for the refusal; empty when there is none. */
  readonly message: HTMLElement
  readonly busy: () => DropBusy
}): void {
  const { zone, input, hint, message, busy } = options
  const restingHint = hint.textContent ?? ''

  // Counted, not flagged: `dragleave` fires for every child the pointer
  // crosses, and the zone is only left when the count returns to zero.
  let depth = 0
  const setHeld = (held: boolean): void => {
    zone.classList.toggle('is-drag-over', held)
    hint.textContent = held ? HELD_HINT : restingHint
  }

  zone.addEventListener('dragenter', (event) => {
    if (!carriesFiles(event)) return
    depth++
    // A new drag starts fresh: the last refusal described the last drop.
    message.textContent = ''
    if (busy() === null) setHeld(true)
  })
  zone.addEventListener('dragleave', (event) => {
    if (!carriesFiles(event)) return
    depth = Math.max(0, depth - 1)
    if (depth === 0) setHeld(false)
  })
  zone.addEventListener('dragover', (event) => {
    if (!carriesFiles(event) || !event.dataTransfer) return
    // Accepted even while busy, so the drop arrives and can be refused in
    // words; a "not allowed" pointer alone would not say why.
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  })
  zone.addEventListener('drop', (event) => {
    if (!carriesFiles(event) || !event.dataTransfer) return
    event.preventDefault()
    depth = 0
    setHeld(false)

    const files = Array.from(event.dataTransfer.files)
    const problem = dropProblem(files, input.accept, busy())
    message.textContent = problem ?? ''
    if (problem !== null) return

    const chosen = new DataTransfer()
    chosen.items.add(files[0]!)
    input.files = chosen.files
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })
  // A video chosen through the picker answers any refusal still showing.
  input.addEventListener('change', () => {
    if (input.files?.length) message.textContent = ''
  })

  window.addEventListener('dragover', (event) => {
    if (!carriesFiles(event) || !event.dataTransfer) return
    event.preventDefault()
    if (!zone.contains(event.target as Node)) event.dataTransfer.dropEffect = 'none'
  })
  window.addEventListener('drop', (event) => {
    if (!carriesFiles(event)) return
    event.preventDefault()
    depth = 0
    setHeld(false)
  })
}
