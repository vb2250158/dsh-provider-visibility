/** Browser half of the provider-display settings plugin. */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { SessionModels } from '@deepseek-ai/dsh-api-remotes/client'
import type { ModelDirectory, ModelDirectoryResolver } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-model-selection/client'
import { PROVIDER_VISIBILITY_SETTINGS_NAMESPACE } from '../provider-visibility-shared.ts'
import type { ProviderVisibilitySettings } from '../provider-visibility.ts'
import { ProviderVisibilitySection, type ProviderVisibilitySectionInjected } from './ProviderVisibilitySection.tsx'
import { en, zh, type ProviderVisibilityKey } from './locales.ts'
import { ProviderVisibilityStore } from './store.ts'

export type { ProviderVisibilitySectionInjected, ProviderVisibilitySectionProps } from './ProviderVisibilitySection.tsx'
export type { ProviderVisibilityState } from './store.ts'
export type { ProviderVisibilityKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Provider visibility settings copy. */
    'settings.providerVisibility': ProviderVisibilityKey
  }
}

const NS = 'settings.providerVisibility'

/** Browser services required by this plugin. */
export const inject = ['slots', 'locale', 'modelDirectories', 'remote', 'sessions', 'settingsScope']

function hiddenProvidersOf(value: ProviderVisibilitySettings | undefined): Set<string> {
  return new Set(value?.hiddenProviders ?? [])
}

function filterDirectory(
  directory: SessionModels,
  hidden: ReadonlySet<string>,
): SessionModels {
  return {
    ...directory,
    groups: directory.groups.filter(group => !hidden.has(group.id)),
    failures: directory.failures.filter(failure => !hidden.has(failure.id)),
  }
}

function filterModelDirectory(
  directory: ModelDirectory,
  hiddenProviders: () => ReadonlySet<string>,
  patched: WeakSet<ModelDirectory>,
  unfilteredDirectories: WeakMap<ModelDirectory, SessionModels>,
): ModelDirectory {
  if (patched.has(directory)) return directory
  patched.add(directory)
  const load = directory.load.bind(directory)
  directory.load = async () => {
    const loaded = await load()
    unfilteredDirectories.set(directory, loaded)
    const filtered = filterDirectory(loaded, hiddenProviders())
    directory.store.update((state) => {
      state.groups = [...filtered.groups]
      state.failures = [...filtered.failures]
    })
    return filtered
  }
  return directory
}

/** Register the Model list page and keep its provider directory current. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-provider-visibility: copy dictionaries')
  const directories = ctx.modelDirectories as ModelDirectoryResolver
  const patched = new WeakSet<ModelDirectory>()
  const unfilteredDirectories = new WeakMap<ModelDirectory, SessionModels>()
  const scope = ctx.settingsScope.bind<ProviderVisibilitySettings>({
    namespace: PROVIDER_VISIBILITY_SETTINGS_NAMESPACE,
  })
  const hiddenProviders = (): ReadonlySet<string> => hiddenProvidersOf(scope.getSnapshot().value)
  const directoryFor = directories.directoryFor.bind(directories)
  directories.directoryFor = (sessionId) => filterModelDirectory(
    directoryFor(sessionId), hiddenProviders, patched, unfilteredDirectories,
  )
  const controller = new ProviderVisibilityStore(
    sessionId => directories.directoryFor(sessionId),
    directory => unfilteredDirectories.get(directory),
    () => ctx.sessions.list.getSnapshot().current,
  )
  const setProviderVisible = async (provider: string, visible: boolean): Promise<void> => {
    const current = scope.getSnapshot().value
    if (current === undefined) return
    const hidden = hiddenProvidersOf(current)
    if (visible) hidden.delete(provider)
    else hidden.add(provider)
    await scope.set('hiddenProviders', [...hidden].sort())
  }
  const t = ctx.locale.bind(NS) as ProviderVisibilitySectionInjected['t']
  const injected = (): ProviderVisibilitySectionInjected => ({
    controller,
    hooks: { snapshot: controller.store },
    settings: scope,
    setProviderVisible,
    t,
  })

  ctx.effect(() => {
    const refresh = (): void => {
      if (controller.store.getSnapshot().status !== 'idle') void controller.load()
    }
    const disposers = [
      ctx.sessions.list.subscribe(refresh),
      scope.subscribe(refresh),
      ctx.remote.$on('llm/adapters-updated', refresh),
      ctx.remote.$on('settings/document-updated', refresh),
      ctx.on('connection/reset', refresh),
    ]
    return () => { for (const dispose of disposers) dispose() }
  }, 'ui-provider-visibility: provider directory invalidations')

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'model-list',
    order: 15,
    label: () => t('nav'),
    inject: injected,
  }, ProviderVisibilitySection))
}
