/** Durable provider-display settings shared by the Host and browser halves. */

import type { Volatile } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { validateRedirectRules, type RedirectRule } from './redirect-rules.ts'
import { DEFAULT_HIDDEN_PROVIDERS, PROVIDER_VISIBILITY_SETTINGS_NAMESPACE } from './provider-visibility-shared.ts'

export { DEFAULT_HIDDEN_PROVIDERS, PROVIDER_VISIBILITY_SETTINGS_NAMESPACE } from './provider-visibility-shared.ts'

/** User-editable provider-display settings. */
export interface ProviderVisibilitySettings {
  /** Provider route ids omitted from model catalogs. */
  hiddenProviders: string[]
  /** 仅影响后续请求；原会话模型选择保持不变。 */
  redirects: RedirectRule[]
}

/** Host plugin configuration, used as the composition layer for the setting. */
export type Config = Volatile<ProviderVisibilitySettings>

/** Durable settings schema and browser wire contract. */
export const ProviderVisibilitySettingsSchema: z<ProviderVisibilitySettings> = z.object({
  hiddenProviders: z.array(z.string()).default([...DEFAULT_HIDDEN_PROVIDERS]),
  redirects: z.transform(z.array(z.object({
    sourceProvider: z.string().required(),
    sourceModel: z.string(),
    targetProvider: z.string().required(),
    targetModel: z.string().required(),
  })) as z<RedirectRule[]>, validateRedirectRules, true).default([]),
})

/** Loader configuration schema. */
export const Config = ProviderVisibilitySettingsSchema.volatile()

/** Remove duplicate and empty ids before they become policy state. */
export function normalizeHiddenProviders(providers: readonly string[]): string[] {
  return [...new Set(providers.filter(provider => provider.length > 0))]
}
