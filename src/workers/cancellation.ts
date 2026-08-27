/**
 * The worker's cancellation registry.
 *
 * Separated from `job.worker.ts` so the rule can be tested: importing the
 * worker runs its boot — a message listener, an OPFS sweep — and the rule
 * itself is plain control flow that deserves to be provable in Node.
 *
 * The rule is one sentence: a request is cancellable from before its first
 * await. `handleProcess` used to register its controller after
 * `await releaseFinished()`, so a Cancel pressed during cleanup found nothing
 * to abort and was dropped in silence (review R-07) — and cleanup can now wait
 * on a save lease, which makes that window as long as a save.
 */

export class CancellationRegistry {
  private readonly running = new Map<number, AbortController>()

  /**
   * Runs `work` under a signal that `cancel(id)` can abort.
   *
   * The controller is registered before `work` is called, so the registry is
   * populated by the time `work` reaches its first suspension point — whatever
   * that turns out to be.
   *
   * @returns Whatever `work` resolves to, after deregistering.
   */
  run<T>(id: number, work: (signal: AbortSignal) => Promise<T>): Promise<T> {
    const controller = new AbortController()
    this.running.set(id, controller)
    return work(controller.signal).finally(() => {
      this.running.delete(id)
    })
  }

  /**
   * Aborts the request registered under `id`.
   *
   * @returns Whether there was one. A `false` is worth logging: it means a
   *   cancel arrived for something already finished, or for something that
   *   never registered — and the second is the defect this class exists for.
   */
  cancel(id: number): boolean {
    const controller = this.running.get(id)
    controller?.abort()
    return controller !== undefined
  }

  /** How many requests are cancellable right now. */
  get size(): number {
    return this.running.size
  }
}
