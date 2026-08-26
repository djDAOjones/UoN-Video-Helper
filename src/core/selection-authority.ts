/**
 * A file-and-preset selection whose asynchronous checks are still in flight.
 *
 * The generation is monotonic within this page load. It lets callers reject a
 * late inspection or pre-flight response without comparing `File` objects or
 * mutable DOM state.
 */
export interface SelectionAttempt<TFile, TPreset> {
  readonly generation: number
  readonly file: TFile
  readonly presetId: TPreset
}

/** The immutable file-and-preset pair that passed pre-flight. */
export interface ReadyJob<TFile, TPreset> {
  readonly generation: number
  readonly file: TFile
  readonly presetId: TPreset
}

/**
 * Owns the single selection that may become runnable.
 *
 * Beginning or invalidating a selection clears the previous ready job
 * synchronously, before any asynchronous inspection can complete. Only the
 * exact current attempt can be accepted.
 */
export class SelectionAuthority<TFile, TPreset> {
  private generation = 0
  private current: SelectionAttempt<TFile, TPreset> | null = null
  private ready: ReadyJob<TFile, TPreset> | null = null

  /** Starts checking a new file-and-preset pair and invalidates the old one. */
  begin(file: TFile, presetId: TPreset): SelectionAttempt<TFile, TPreset> {
    const selection = Object.freeze({
      generation: ++this.generation,
      file,
      presetId,
    })
    this.current = selection
    this.ready = null
    return selection
  }

  /** Invalidates all outstanding checks when there is no replacement selection. */
  invalidate(): void {
    this.generation++
    this.current = null
    this.ready = null
  }

  /** Returns whether a response still belongs to the selected file and preset. */
  isCurrent(selection: SelectionAttempt<TFile, TPreset>): boolean {
    return selection === this.current
  }

  /**
   * Accepts a checked selection as the sole Start-button authority.
   *
   * @returns The immutable ready job, or `null` when the response is stale.
   */
  accept(selection: SelectionAttempt<TFile, TPreset>): ReadyJob<TFile, TPreset> | null {
    if (!this.isCurrent(selection)) return null
    const ready = Object.freeze({
      generation: selection.generation,
      file: selection.file,
      presetId: selection.presetId,
    })
    this.ready = ready
    return ready
  }

  /** Revokes Start authority without discarding the still-current inspection. */
  revoke(selection: SelectionAttempt<TFile, TPreset>): boolean {
    if (!this.isCurrent(selection)) return false
    this.ready = null
    return true
  }

  /** The only file-and-preset pair Start may process. */
  get readyJob(): ReadyJob<TFile, TPreset> | null {
    return this.ready
  }
}
