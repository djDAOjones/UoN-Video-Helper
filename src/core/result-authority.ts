/** The lifecycle of the one output whose backing workspace is still retained. */
export type ResultStatus = 'ready' | 'saving' | 'download-started' | 'discarding'

/** A read-only view of the retained result and the operation currently owning it. */
export interface ActiveResult<T> {
  readonly value: T
  readonly status: ResultStatus
}

/**
 * Owns the single result that may still be saved or discarded.
 *
 * Busy operations transition by object identity, so a late save or discard
 * completion can never clear a different result. No transition implicitly
 * replaces an existing value.
 */
export class ResultAuthority<T extends object> {
  private activeResult: ActiveResult<T> | null = null
  private restingStatus: Extract<ResultStatus, 'ready' | 'download-started'> = 'ready'

  /** Retains a new result only when no earlier result still owns its workspace. */
  retain(value: T): boolean {
    if (this.activeResult) return false
    this.restingStatus = 'ready'
    this.activeResult = Object.freeze({ value, status: 'ready' })
    return true
  }

  /** Begins a save while preserving the state to restore on cancel or failure. */
  beginSave(value: T): boolean {
    const active = this.activeResult
    if (
      active?.value !== value ||
      (active.status !== 'ready' && active.status !== 'download-started')
    ) {
      return false
    }
    this.restingStatus = active.status
    this.setStatus(value, 'saving')
    return true
  }

  /** Keeps the result after a picker cancellation or save failure. */
  retainAfterSave(value: T): boolean {
    if (!this.matches(value, 'saving')) return false
    this.setStatus(value, this.restingStatus)
    return true
  }

  /** Records that a fallback download was requested, not that it completed. */
  markDownloadStarted(value: T): boolean {
    if (!this.matches(value, 'saving')) return false
    this.restingStatus = 'download-started'
    this.setStatus(value, 'download-started')
    return true
  }

  /** Begins explicit disposal, or disposal after a durable picker save. */
  beginDiscard(value: T): boolean {
    if (!this.activeResult || this.activeResult.value !== value) return false
    if (this.activeResult.status === 'discarding') return false
    if (this.activeResult.status !== 'saving') this.restingStatus = this.activeResult.status
    this.setStatus(value, 'discarding')
    return true
  }

  /** Restores a result whose backing workspace could not be discarded. */
  retainAfterDiscardFailure(value: T): boolean {
    if (!this.matches(value, 'discarding')) return false
    this.setStatus(value, this.restingStatus)
    return true
  }

  /** Clears ownership only after the worker confirms that disposal completed. */
  release(value: T): boolean {
    if (!this.matches(value, 'discarding')) return false
    this.activeResult = null
    this.restingStatus = 'ready'
    return true
  }

  /** Whether this exact result remains retained. */
  owns(value: T): boolean {
    return this.activeResult?.value === value
  }

  /** The retained result, if any. Its presence blocks another process. */
  get active(): ActiveResult<T> | null {
    return this.activeResult
  }

  private matches(value: T, status: ResultStatus): boolean {
    return this.activeResult?.value === value && this.activeResult.status === status
  }

  private setStatus(value: T, status: ResultStatus): void {
    this.activeResult = Object.freeze({ value, status })
  }
}
