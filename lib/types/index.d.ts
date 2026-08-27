/** Host half of the provider-display policy and its user-settings namespace. */
import { Context, Service } from '@deepseek-ai/cordis';
import type { SettingsScope } from '@deepseek-ai/dsh-settings';
import { Config, type ProviderVisibilitySettings } from './provider-visibility.ts';
export { Config, DEFAULT_HIDDEN_PROVIDERS, normalizeHiddenProviders, PROVIDER_VISIBILITY_SETTINGS_NAMESPACE, ProviderVisibilitySettingsSchema, type ProviderVisibilitySettings, } from './provider-visibility.ts';
/** Public host face consumed by the API gateway at catalog-build time. */
export interface ProviderVisibility {
    /** Whether a provider is omitted from model catalogs. */
    isHidden(provider: string): boolean;
    /** Current hidden provider ids, detached for callers. */
    hiddenProviders(): readonly string[];
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** Provider-display policy; absent when the optional plugin is not mounted. */
        providerVisibility: ProviderVisibility;
    }
}
/** Host service that owns the resolved provider-display policy. */
export declare class ProviderVisibilityService extends Service implements ProviderVisibility {
    private readonly fallback;
    private settings;
    constructor(ctx: Context, config?: Config);
    /** Attach the settings owner once the settings provider is available.
     * @param scope - Settings scope that owns the durable provider-display value.
     */
    attachSettings(scope: SettingsScope<ProviderVisibilitySettings>): void;
    isHidden(provider: string): boolean;
    hiddenProviders(): readonly string[];
}
/** Register the policy service and the durable user setting. */
export declare function apply(ctx: Context, config?: Config): void;
//# sourceMappingURL=index.d.ts.map
