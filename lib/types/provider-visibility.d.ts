/** Durable provider-display settings shared by the Host and browser halves. */
import type { Volatile } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { type RedirectRule } from './redirect-rules.ts';
export { DEFAULT_HIDDEN_PROVIDERS, PROVIDER_VISIBILITY_SETTINGS_NAMESPACE } from './provider-visibility-shared.ts';
/** User-editable provider-display settings. */
export interface ProviderVisibilitySettings {
    /** Provider route ids omitted from model catalogs. */
    hiddenProviders: string[];
    /** 仅影响后续请求；原会话模型选择保持不变。 */
    redirects: RedirectRule[];
}
/** Host plugin configuration, used as the composition layer for the setting. */
export type Config = Volatile<ProviderVisibilitySettings>;
/** Durable settings schema and browser wire contract. */
export declare const ProviderVisibilitySettingsSchema: z<ProviderVisibilitySettings>;
/** Loader configuration schema. */
export declare const Config: z<NoInfer<ProviderVisibilitySettings>, NoInfer<ProviderVisibilitySettings>, "volatile">;
/** Remove duplicate and empty ids before they become policy state. */
export declare function normalizeHiddenProviders(providers: readonly string[]): string[];
