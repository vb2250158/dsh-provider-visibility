/** Host half of the provider-display policy and its user-settings namespace. */
import { Service } from '@deepseek-ai/cordis';
import { settingsNamespace } from '@deepseek-ai/dsh-settings';
import { DEFAULT_HIDDEN_PROVIDERS, normalizeHiddenProviders, PROVIDER_VISIBILITY_SETTINGS_NAMESPACE, ProviderVisibilitySettingsSchema, } from "./provider-visibility.js";
export { Config, DEFAULT_HIDDEN_PROVIDERS, normalizeHiddenProviders, PROVIDER_VISIBILITY_SETTINGS_NAMESPACE, ProviderVisibilitySettingsSchema, } from "./provider-visibility.js";
const SETTINGS_NAMESPACE = settingsNamespace(PROVIDER_VISIBILITY_SETTINGS_NAMESPACE);
/** Host service that owns the resolved provider-display policy. */
export class ProviderVisibilityService extends Service {
    fallback;
    settings;
    constructor(ctx, config = {}) {
        super(ctx, 'providerVisibility');
        this.fallback = normalizeHiddenProviders(config.hiddenProviders ?? DEFAULT_HIDDEN_PROVIDERS);
    }
    /** Attach the settings owner once the settings provider is available.
     * @param scope - Settings scope that owns the durable provider-display value.
     */
    attachSettings(scope) {
        this.settings = scope;
    }
    isHidden(provider) {
        return this.hiddenProviders().includes(provider);
    }
    hiddenProviders() {
        const value = this.settings?.get();
        return Object.freeze(normalizeHiddenProviders(value?.hiddenProviders ?? this.fallback));
    }
}
//# sourceMappingURL=index.js.map
/** Register the policy service and the durable user setting. */
export function apply(ctx, config = {}) {
    const service = new ProviderVisibilityService(ctx, config);
    ctx.inject(['settings'], (settingsCtx) => {
        const scope = settingsCtx.settings.register(SETTINGS_NAMESPACE, ProviderVisibilitySettingsSchema, {
            base: { hiddenProviders: normalizeHiddenProviders(config.hiddenProviders ?? DEFAULT_HIDDEN_PROVIDERS) },
        });
        service.attachSettings(scope);
    });
}
