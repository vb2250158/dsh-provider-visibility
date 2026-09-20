/** Browser-safe provider visibility defaults shared by the Host and browser plugin. */
import { validateRedirectRules, type RedirectRule } from './redirect-rules.ts'
import type { ProviderVisibilitySettings } from './provider-visibility.ts'

/** Settings namespace owned by the provider-display plugin. */
export const PROVIDER_VISIBILITY_SETTINGS_NAMESPACE = 'llm-provider-visibility'

/** Providers hidden only after the user chooses them. */
export const DEFAULT_HIDDEN_PROVIDERS = [] as const

/** 解析主机返回的设置值，不执行序列化 schema 中丢失闭包的转换函数。
 * @param value - 设置接口返回的命名空间值。
 * @returns 有效设置；字段或规则无效时返回 undefined。
 */
export function decodeProviderVisibility(value: unknown): ProviderVisibilitySettings | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  const section = value as Record<string, unknown>
  if (!Array.isArray(section.hiddenProviders) || !section.hiddenProviders.every(id => typeof id === 'string')) return undefined
  const entries = section.redirects ?? []
  if (!Array.isArray(entries)) return undefined
  const redirects: RedirectRule[] = []
  for (const entry of entries) {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return undefined
    const rule = entry as Record<string, unknown>
    if (typeof rule.sourceProvider !== 'string' || typeof rule.targetProvider !== 'string' || typeof rule.targetModel !== 'string'
      || rule.sourceModel !== undefined && typeof rule.sourceModel !== 'string') return undefined
    redirects.push({ sourceProvider: rule.sourceProvider, targetProvider: rule.targetProvider, targetModel: rule.targetModel,
      ...(rule.sourceModel === undefined ? {} : { sourceModel: rule.sourceModel }) })
  }
  try { validateRedirectRules(redirects) } catch { return undefined }
  return { hiddenProviders: section.hiddenProviders, redirects }
}
