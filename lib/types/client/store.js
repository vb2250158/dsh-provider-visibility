/** Browser-side configured-provider directory controller. */
import { createSnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
/** Convert a rejected wire value into user-visible text.
   * @param error - Rejection value returned by the transport or host.
   * @returns A readable error message.
   */
export function messageOf(error) {
    return error instanceof Error ? error.message : String(error);
}
/** Directory loader used by the settings page. */
export class ProviderVisibilityStore {
    api;
    /** Snapshot store consumed by the settings section. */
    store = createSnapshotStore({
        status: 'idle', error: null, providers: [],
    });
    generation = 0;
    constructor(api) {
        this.api = api;
    }
    /** Load the same active provider directory shown by the model selector. */
    async load() {
        const generation = ++this.generation;
        this.store.update((state) => { state.status = 'loading'; state.error = null; });
        try {
            const providersResponse = await this.api.llm.providers({});
            const providersResult = providersResponse.result;
            if (!providersResult.ok)
                throw new Error(providersResult.error.message);
            if (generation !== this.generation)
                return;
            this.store.update((state) => {
                state.status = 'ready';
                state.error = null;
                state.providers = providersResult.value.providers;
            });
        }
        catch (error) {
            if (generation !== this.generation)
                return;
            this.store.update((state) => {
                state.status = 'error';
                state.error = messageOf(error);
            });
        }
    }
}
