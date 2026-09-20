/** Durable provider-display settings shared by the Host and browser halves. */

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
export interface Config {
  /** Provider route ids hidden until the user changes the setting. */
  hiddenProviders?: string[]
}

/** Durable settings schema and browser wire contract. */
export const ProviderVisibilitySettingsSchema: z<ProviderVisibilitySettings> = z.object({
  hiddenProviders: z.array(z.string()).default([...DEFAULT_HIDDEN_PROVIDERS]),
  redirects: z.transform(z.array(z.object({
    sourceProvider: z.string().required(),
    sourceModel: z.string(),
    targetProvider: z.string().required(),
    targetModel: z.string().required(),
  })), values => {
    const rules: RedirectRule[] = values.map(value => {
      if (typeof value.sourceProvider !== 'string' || typeof value.targetProvider !== 'string' || typeof value.targetModel !== 'string') throw new Error('redirect.empty')
      return {
      sourceProvider: value.sourceProvider,
      ...(value.sourceModel == null ? {} : { sourceModel: value.sourceModel }),
      targetProvider: value.targetProvider,
      targetModel: value.targetModel,
      }
    })
    validateRedirectRules(rules)
    return rules
  }).default([]),
})

/** Loader configuration schema. */
export const Config: z<Config> = z.object({
  hiddenProviders: z.array(z.string()).default([...DEFAULT_HIDDEN_PROVIDERS]),
})

/** Remove duplicate and empty ids before they become policy state. */
export function normalizeHiddenProviders(providers: readonly string[]): string[] {
  return [...new Set(providers.filter(provider => provider.length > 0))]
}
