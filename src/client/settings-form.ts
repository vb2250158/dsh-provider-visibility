/** Domain decoding over the shared Host mirror; writes retain the platform queue. */
import type { ConfigForm, ConfigFormSnapshot, SettingsDescribeFace } from '@deepseek-ai/dsh-client-ui-settings/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import { decodeProviderVisibility, PROVIDER_VISIBILITY_SETTINGS_NAMESPACE } from '../provider-visibility-shared.ts'
import type { ProviderVisibilitySettings } from '../provider-visibility.ts'

/** Narrow plugin values without executing a serialized Host transform.
 * @param source - Shared form owning revision-fenced writes.
 * @param mirror - Shared, redacted configuration reader.
 * @returns Domain form and subscription disposer.
 */
export function createVisibilityForm(source: ConfigForm<ProviderVisibilitySettings>, mirror: SettingsDescribeFace) {
  const store = createSnapshotStore<ConfigFormSnapshot<ProviderVisibilitySettings>>(source.getSnapshot())
  const derive = (): void => {
    const mirrored = mirror.getSnapshot()
    const view = mirrored.view?.namespaces.find(entry => entry.ns === PROVIDER_VISIBILITY_SETTINGS_NAMESPACE)
    const value = view === undefined ? undefined : decodeProviderVisibility(view.value)
    store.update(snapshot => {
      snapshot.writable = mirrored.view?.writable === true
      snapshot.status = (mirrored.view === undefined && mirrored.error != null) || (mirrored.view !== undefined && value === undefined)
        ? 'unavailable' : value === undefined ? 'loading' : 'ready'
      snapshot.value = value
      snapshot.revision = view?.revision
      snapshot.base = view?.base
      snapshot.user = view?.user
    })
  }
  const dispose = mirror.subscribe(derive)
  derive()
  const form: ConfigForm<ProviderVisibilitySettings> = {
    getSnapshot: store.getSnapshot,
    subscribe: store.subscribe,
    set: source.set.bind(source),
    unset: source.unset.bind(source),
    mutate: source.mutate.bind(source),
  }
  return { form, dispose }
}
