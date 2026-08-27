/** Durable provider-display settings shared by the Host and browser halves. */

import z from '@deepseek-ai/schemastery'
import { DEFAULT_HIDDEN_PROVIDERS, PROVIDER_VISIBILITY_SETTINGS_NAMESPACE } from './provider-visibility-shared.ts'

export { DEFAULT_HIDDEN_PROVIDERS, PROVIDER_VISIBILITY_SETTINGS_NAMESPACE } from './provider-visibility-shared.ts'

/** User-editable provider-display settings. */
export interface ProviderVisibilitySettings {
  /** Provider route ids omitted from model catalogs. */
  hiddenProviders: string[]
}

/** Host plugin configuration, used as the composition layer for the setting. */
export interface Config {
  /** Provider route ids hidden until the user changes the setting. */
  hiddenProviders?: string[]
}

/** Durable settings schema and browser wire contract. */
export const ProviderVisibilitySettingsSchema: z<ProviderVisibilitySettings> = z.object({
  hiddenProviders: z.array(z.string()).default([...DEFAULT_HIDDEN_PROVIDERS]),
})

/** Loader configuration schema. */
export const Config: z<Config> = z.object({
  hiddenProviders: z.array(z.string()).default([...DEFAULT_HIDDEN_PROVIDERS]),
})

/** Remove duplicate and empty ids before they become policy state. */
export function normalizeHiddenProviders(providers: readonly string[]): string[] {
  return [...new Set(providers.filter(provider => provider.length > 0))]
}
