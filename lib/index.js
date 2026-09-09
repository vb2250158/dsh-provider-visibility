import { Service } from "@deepseek-ai/cordis";
import z from "@deepseek-ai/schemastery";
//#region lib/types/provider-visibility.js
/** Durable provider-display settings shared by the Host and browser halves. */
/** Settings namespace owned by the provider-display plugin. */
const PROVIDER_VISIBILITY_SETTINGS_NAMESPACE = "llm-provider-visibility";
/** Providers hidden in the default Web composition. */
const DEFAULT_HIDDEN_PROVIDERS = ["siliconflow"];
/** Durable settings schema and browser wire contract. */
const ProviderVisibilitySettingsSchema = z.object({ hiddenProviders: z.array(z.string()).default([...DEFAULT_HIDDEN_PROVIDERS]) });
/** Loader configuration schema. */
const Config = z.object({ hiddenProviders: z.array(z.string()).default([...DEFAULT_HIDDEN_PROVIDERS]) });
/** Remove duplicate and empty ids before they become policy state.
* @param providers - Provider route ids from composition or settings.
* @returns A detached list with empty and duplicate ids removed.
*/
function normalizeHiddenProviders(providers) {
	return [...new Set(providers.filter((provider) => provider.length > 0))];
}
//#endregion
//#region lib/types/index.js
/** Host half of the provider-display policy and its user-settings namespace. */
const SETTINGS_NAMESPACE = PROVIDER_VISIBILITY_SETTINGS_NAMESPACE;
/** Host service that owns the resolved provider-display policy. */
var ProviderVisibilityService = class extends Service {
	fallback;
	settings;
	constructor(ctx, config = {}) {
		super(ctx, "providerVisibility");
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
};
/** Register the policy service and the durable user setting. */
function apply(ctx, config = {}) {
	const service = new ProviderVisibilityService(ctx, config);
	ctx.inject(["settings"], (settingsCtx) => {
		const scope = settingsCtx.settings.register(SETTINGS_NAMESPACE, ProviderVisibilitySettingsSchema, { base: { hiddenProviders: normalizeHiddenProviders(config.hiddenProviders ?? DEFAULT_HIDDEN_PROVIDERS) } });
		service.attachSettings(scope);
	});
}
//#endregion
export { Config, DEFAULT_HIDDEN_PROVIDERS, PROVIDER_VISIBILITY_SETTINGS_NAMESPACE, ProviderVisibilityService, ProviderVisibilitySettingsSchema, apply, normalizeHiddenProviders };
