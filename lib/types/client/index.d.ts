/** Browser half of the provider-display settings plugin. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type ProviderVisibilityKey } from './locales.ts';
export type { ProviderVisibilitySectionInjected, ProviderVisibilitySectionProps } from './ProviderVisibilitySection.tsx';
export type { ProviderVisibilityState } from './store.ts';
export type { ProviderVisibilityKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Provider visibility settings copy. */
        'settings.providerVisibility': ProviderVisibilityKey;
    }
}
/** Browser services required by this plugin. */
export declare const inject: string[];
/** Register the Model list page and keep its provider directory current. */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map
