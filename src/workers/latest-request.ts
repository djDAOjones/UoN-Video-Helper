/** Keeps worker-side inspection/pre-flight work latest-only. */
export class LatestRequest {
  private current: { readonly id: number; readonly controller: AbortController } | null = null

  /** Aborts the previous check and registers this one before its first await. */
  begin(id: number): AbortController {
    this.current?.controller.abort()
    const controller = new AbortController()
    this.current = { id, controller }
    return controller
  }

  cancel(id: number): void {
    if (this.current?.id === id) this.current.controller.abort()
  }

  finish(id: number, controller: AbortController): void {
    if (this.current?.id === id && this.current.controller === controller) {
      this.current = null
    }
  }
}
