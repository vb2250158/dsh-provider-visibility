/** Durable provider-display settings shared by the Host and browser halves. */
import z from '@deepseek-ai/schemastery';
/** Settings namespace owned by the provider-display plugin. */
export declare const PROVIDER_VISIBILITY_SETTINGS_NAMESPACE = "llm-provider-visibility";
/** Providers hidden in the default Web composition. */
export declare const DEFAULT_HIDDEN_PROVIDERS: readonly ["siliconflow"];
/** User-editable provider-display settings. */
export interface ProviderVisibilitySettings {
    /** Provider route ids omitted from model catalogs. */
    hiddenProviders: string[];
}
/** Host plugin configuration, used as the composition layer for the setting. */
export interface Config {
    /** Provider route ids hidden until the user changes the setting. */
    hiddenProviders?: string[];
}
/** Durable settings schema and browser wire contract. */
export declare const ProviderVisibilitySettingsSchema: z<ProviderVisibilitySettings>;
/** Loader configuration schema. */
export declare const Config: z<Config>;
/** Remove duplicate and empty ids before they become policy state.
 * @param providers - Provider route ids from composition or settings.
 * @returns A detached list with empty and duplicate ids removed.
 */
export declare function normalizeHiddenProviders(providers: readonly string[]): string[];
//# sourceMappingURL=provider-visibility.d.ts.map
