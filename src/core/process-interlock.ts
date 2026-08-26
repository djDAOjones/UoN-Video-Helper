/**
 * Keeps process ownership truthful across a silence-watchdog cancellation.
 *
 * The UI stops calling a timed-out request "running" immediately, but the
 * worker still owns that job until it sends a terminal acknowledgement. This
 * interlock preserves the one fact shared by lifecycle protection and Start:
 * worker work is still outstanding even though the normal progress UI ended.
 */
export class ProcessInterlock {
  private running = false
  private readonly awaitingTerminal = new Set<number>()

  /** Records whether the normal, user-visible process request is running. */
  public setRunning(running: boolean): void {
    this.running = running
  }

  /** Transfers a timed-out request into cancellation-awaiting ownership. */
  public markTimedOut(requestId: number): void {
    this.awaitingTerminal.add(requestId)
  }

  /** Identifies progress or a terminal reply for a request the UI timed out. */
  public hasTimedOut(requestId: number): boolean {
    return this.awaitingTerminal.has(requestId)
  }

  /** Releases timeout ownership only when the worker has answered terminally. */
  public acknowledgeTimedOut(requestId: number): boolean {
    return this.awaitingTerminal.delete(requestId)
  }

  /** A terminated worker cannot retain live work, so its pending ids are obsolete. */
  public clearTimedOut(): void {
    this.awaitingTerminal.clear()
  }

  /** Blocks a new process and keeps lifecycle protection while any work is unconfirmed. */
  public get locked(): boolean {
    return this.running || this.awaitingTerminal.size > 0
  }
}
