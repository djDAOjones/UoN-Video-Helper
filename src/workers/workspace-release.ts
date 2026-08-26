export interface DisposableWorkspace {
  dispose(): Promise<void>
}

/** Deletes ownership only after disposal succeeds, leaving failures retryable. */
export async function releaseWorkspace<T extends DisposableWorkspace>(
  owned: Map<string, T>,
  jobId: string,
): Promise<void> {
  const workspace = owned.get(jobId)
  if (!workspace) return
  await workspace.dispose()
  owned.delete(jobId)
}
