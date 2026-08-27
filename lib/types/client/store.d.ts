/** Browser-side configured-provider directory controller. */
import type { ConfigurableProviderView, IApiClient } from '@deepseek-ai/dsh-api-remotes/client';
import { type SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
/** Page load state. */
export interface ProviderVisibilityState {
    status: 'idle' | 'loading' | 'ready' | 'error';
    error: string | null;
    /** Provider entries currently available to the model selector. */
    providers: readonly ConfigurableProviderView[];
}
/** Convert a rejected wire value into user-visible text.
   * @param error - Rejection value returned by the transport or host.
   * @returns A readable error message.
   */
export declare function messageOf(error: unknown): string;
type ProviderDirectoryApi = Pick<IApiClient['llm'], 'providers'>;
/** Directory loader used by the settings page. */
export declare class ProviderVisibilityStore {
    private readonly api;
    /** Snapshot store consumed by the settings section. */
    readonly store: SnapshotStore<ProviderVisibilityState>;
    private generation;
    constructor(api: {
        llm: ProviderDirectoryApi;
    });
    /** Load the same active provider directory shown by the model selector. */
    load(): Promise<void>;
}
export {};
//# sourceMappingURL=store.d.ts.map
