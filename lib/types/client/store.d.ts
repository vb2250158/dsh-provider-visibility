/** Browser-side projection of the current session's model selector directory. */
import type { ModelCatalog } from '@deepseek-ai/dsh-api-remotes/client';
import { type SnapshotStore } from '@deepseek-ai/dsh-client-store';
/** Page load state. */
export interface ProviderVisibilityState {
    status: 'idle' | 'loading' | 'ready' | 'error';
    error: string | null;
    /** Provider entries currently rendered by the model selector. */
    providers: readonly ProviderVisibilityProvider[];
    groups: ModelCatalog['groups'];
}
/** One provider projected from a model selector group. */
export interface ProviderVisibilityProvider {
    /** Provider route id used by model selections. */
    provider: string;
    /** Provider name shown by the model selector. */
    displayName: string;
}
/** Convert a rejected wire value into user-visible text.
   * @param error - Rejection value returned by the transport or host.
   * @returns A readable error message.
   */
export declare function messageOf(error: unknown): string;
/** Directory loader used by the settings page. */
export declare class ProviderVisibilityStore {
    private readonly loadCatalog;
    /** Snapshot store consumed by the settings section. */
    readonly store: SnapshotStore<ProviderVisibilityState>;
    private generation;
    constructor(loadCatalog: () => Promise<ModelCatalog>);
    /** Load the same provider groups rendered by the current session's model selector. */
    load(): Promise<void>;
}
