/**
 * Dedicated-worker negative control for the protocol egress rehearsal.
 *
 * The payload is a generated test canary, never media or user data. Its only
 * purpose is to make a missing worker-network subscription fail visibly.
 */

export interface EgressWorkerRequest {
  readonly url: string
  readonly body: string
}

export type EgressWorkerResponse =
  { readonly kind: 'sent' } | { readonly kind: 'failed'; readonly message: string }

self.addEventListener('message', (event: MessageEvent<EgressWorkerRequest>) => {
  void fetch(event.data.url, {
    method: 'POST',
    headers: { 'content-type': 'text/plain' },
    body: event.data.body,
  }).then(
    () => self.postMessage({ kind: 'sent' } satisfies EgressWorkerResponse),
    (cause: unknown) =>
      self.postMessage({
        kind: 'failed',
        message: cause instanceof Error ? cause.message : String(cause),
      } satisfies EgressWorkerResponse),
  )
})
