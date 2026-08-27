/** Host half of the provider-display policy and its user-settings namespace. */

import { Context, Service } from '@deepseek-ai/cordis'
import type { SettingsScope } from '@deepseek-ai/dsh-settings'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import {
  Config,
  DEFAULT_HIDDEN_PROVIDERS,
  normalizeHiddenProviders,
  PROVIDER_VISIBILITY_SETTINGS_NAMESPACE,
  ProviderVisibilitySettingsSchema,
  type ProviderVisibilitySettings,
} from './provider-visibility.ts'

export {
  Config,
  DEFAULT_HIDDEN_PROVIDERS,
  normalizeHiddenProviders,
  PROVIDER_VISIBILITY_SETTINGS_NAMESPACE,
  ProviderVisibilitySettingsSchema,
  type ProviderVisibilitySettings,
} from './provider-visibility.ts'

const SETTINGS_NAMESPACE = settingsNamespace(PROVIDER_VISIBILITY_SETTINGS_NAMESPACE)

/** Public host face consumed by the API gateway at catalog-build time. */
export interface ProviderVisibility {
  /** Whether a provider is omitted from model catalogs. */
  isHidden(provider: string): boolean
  /** Current hidden provider ids, detached for callers. */
  hiddenProviders(): readonly string[]
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Provider-display policy; absent when the optional plugin is not mounted. */
    providerVisibility: ProviderVisibility
  }
}

/** Host service that owns the resolved provider-display policy. */
export class ProviderVisibilityService extends Service implements ProviderVisibility {
  private readonly fallback: readonly string[]
  private settings: SettingsScope<ProviderVisibilitySettings> | undefined

  constructor(ctx: Context, config: Config = {}) {
    super(ctx, 'providerVisibility')
    this.fallback = normalizeHiddenProviders(config.hiddenProviders ?? DEFAULT_HIDDEN_PROVIDERS)
  }

  /** Attach the settings owner once the settings provider is available. */
  attachSettings(scope: SettingsScope<ProviderVisibilitySettings>): void {
    this.settings = scope
  }

  isHidden(provider: string): boolean {
    return this.hiddenProviders().includes(provider)
  }

  hiddenProviders(): readonly string[] {
    const value = this.settings?.get()
    return Object.freeze(normalizeHiddenProviders(value?.hiddenProviders ?? this.fallback))
  }
}

/** Register the policy service and the durable user setting. */
export function apply(ctx: Context, config: Config = {}): void {
  const service = new ProviderVisibilityService(ctx, config)
  ctx.inject(['settings'], (settingsCtx) => {
    const scope = settingsCtx.settings.register(SETTINGS_NAMESPACE, ProviderVisibilitySettingsSchema, {
      base: { hiddenProviders: normalizeHiddenProviders(config.hiddenProviders ?? DEFAULT_HIDDEN_PROVIDERS) },
    })
    service.attachSettings(scope)
  })
}
