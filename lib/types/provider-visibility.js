/** Durable provider-display settings shared by the Host and browser halves. */
import z from '@deepseek-ai/schemastery';
/** Settings namespace owned by the provider-display plugin. */
export const PROVIDER_VISIBILITY_SETTINGS_NAMESPACE = 'llm-provider-visibility';
/** Providers hidden in the default Web composition. */
export const DEFAULT_HIDDEN_PROVIDERS = ['siliconflow'];
/** Durable settings schema and browser wire contract. */
export const ProviderVisibilitySettingsSchema = z.object({
    hiddenProviders: z.array(z.string()).default([...DEFAULT_HIDDEN_PROVIDERS]),
});
/** Loader configuration schema. */
export const Config = z.object({
    hiddenProviders: z.array(z.string()).default([...DEFAULT_HIDDEN_PROVIDERS]),
});
/** Remove duplicate and empty ids before they become policy state.
 * @param providers - Provider route ids from composition or settings.
 * @returns A detached list with empty and duplicate ids removed.
 */
export function normalizeHiddenProviders(providers) {
    return [...new Set(providers.filter(provider => provider.length > 0))];
}
//# sourceMappingURL=provider-visibility.js.map
