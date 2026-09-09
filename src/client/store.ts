/** Browser-side projection of the current session's model selector directory. */

import type { ModelCatalog } from '@deepseek-ai/dsh-api-remotes/client'
import { createSnapshotStore, type SnapshotStore } from '@deepseek-ai/dsh-client-store'

/** Page load state. */
export interface ProviderVisibilityState {
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
  /** Provider entries currently rendered by the model selector. */
  providers: readonly ProviderVisibilityProvider[]
}

/** One provider projected from a model selector group. */
export interface ProviderVisibilityProvider {
  /** Provider route id used by model selections. */
  provider: string
  /** Provider name shown by the model selector. */
  displayName: string
}

/** Convert a rejected wire value into user-visible text.
   * @param error - Rejection value returned by the transport or host.
   * @returns A readable error message.
   */
export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** Directory loader used by the settings page. */
export class ProviderVisibilityStore {
  /** Snapshot store consumed by the settings section. */
  readonly store: SnapshotStore<ProviderVisibilityState> = createSnapshotStore<ProviderVisibilityState>({
    status: 'idle', error: null, providers: [],
  })

  private generation = 0

  constructor(private readonly loadCatalog: () => Promise<ModelCatalog>) {}

  /** Load the same provider groups rendered by the current session's model selector. */
  async load(): Promise<void> {
    const generation = ++this.generation
    this.store.update((state) => { state.status = 'loading'; state.error = null })
    try {
      const models = await this.loadCatalog()
      if (generation !== this.generation) return
      this.store.update((state) => {
        state.status = 'ready'
        state.error = null
        state.providers = models.groups.map(group => ({
          provider: group.id,
          displayName: group.name,
        }))
      })
    } catch (error) {
      if (generation !== this.generation) return
      this.store.update((state) => {
        state.status = 'error'
        state.error = messageOf(error)
      })
    }
  }
}
