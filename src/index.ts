/** Host half of the provider-display policy and its user-settings namespace. */

import { Context, Service } from '@deepseek-ai/cordis'
import { installRedirects } from './redirect-runtime.ts'
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

const SETTINGS_NAMESPACE = PROVIDER_VISIBILITY_SETTINGS_NAMESPACE

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
  constructor(ctx: Context, private readonly config: Config) {
    super(ctx, 'providerVisibility')
  }

  isHidden(provider: string): boolean {
    return this.hiddenProviders().includes(provider)
  }

  hiddenProviders(): readonly string[] {
    return Object.freeze(normalizeHiddenProviders(this.config.get().hiddenProviders))
  }
}

/** Register the policy service and the durable user setting. */
export function apply(ctx: Context, config: Config): void {
  const service = new ProviderVisibilityService(ctx, config)
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.effect(() => settingsCtx.settings.configure({ auto: false }, ctx.fiber))
    settingsCtx.inject(['llm', 'sessionProjections'], runtimeCtx => {
      installRedirects(runtimeCtx, () => config.get().redirects)
    })
  })
}
