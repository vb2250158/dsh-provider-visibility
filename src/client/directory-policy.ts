/** Provider filtering owned by one client plugin generation. */
import { symbols } from '@deepseek-ai/cordis'
import type { ModelDirectory, ModelDirectoryResolver, ModelDirectoryState } from '@deepseek-ai/dsh-client-ui-model-selection/client'

interface PatchedDirectory {
  readonly descriptor: PropertyDescriptor | undefined
  readonly load: ModelDirectory['load']
  latest?: ModelDirectoryState
}

/**
 * Filter model directories while preserving Cordis's calling context and restore every owned method on disposal.
 * @param resolver - Traceable model-directory service.
 * @param hiddenProviders - Current visibility policy.
 * @returns Disposer for this generation's resolver and directory-load methods.
 */
export function installDirectoryVisibilityPolicy(
  resolver: ModelDirectoryResolver,
  hiddenProviders: () => ReadonlySet<string>,
): () => void {
  const target = (resolver as ModelDirectoryResolver & { [symbols.original]?: ModelDirectoryResolver })[symbols.original] ?? resolver
  const descriptor = Object.getOwnPropertyDescriptor(target, 'directoryFor')
  const original = target.directoryFor
  const patched = new WeakMap<ModelDirectory, PatchedDirectory>()
  const directories = new Set<WeakRef<ModelDirectory>>()
  const collected = new FinalizationRegistry<WeakRef<ModelDirectory>>(ref => directories.delete(ref))
  let active = true

  function directoryFor(this: ModelDirectoryResolver, sessionId: Parameters<ModelDirectoryResolver['directoryFor']>[0]): ModelDirectory {
    const directory = original.call(this, sessionId)
    if (!active || patched.has(directory)) return directory
    const originalLoad = directory.load
    const entry: PatchedDirectory = {
      descriptor: Object.getOwnPropertyDescriptor(directory, 'load'),
      async load(this: ModelDirectory) {
        const loaded = await originalLoad.call(this)
        if (!active) return loaded
        entry.latest = { ...loaded, groups: [...loaded.groups], failures: [...loaded.failures] }
        const hidden = hiddenProviders()
        const filtered = {
          ...loaded,
          groups: loaded.groups.filter(group => !hidden.has(group.id)),
          failures: loaded.failures.filter(failure => !hidden.has(failure.id)),
        }
        directory.store.update(state => {
          state.groups = [...filtered.groups]
          state.failures = [...filtered.failures]
        })
        return filtered
      },
    }
    patched.set(directory, entry)
    const ref = new WeakRef(directory)
    directories.add(ref)
    collected.register(directory, ref, ref)
    directory.load = entry.load
    return directory
  }

  target.directoryFor = directoryFor
  return () => {
    active = false
    if (target.directoryFor === directoryFor) {
      if (descriptor === undefined) Reflect.deleteProperty(target, 'directoryFor')
      else Object.defineProperty(target, 'directoryFor', descriptor)
    }
    for (const ref of directories) {
      collected.unregister(ref)
      const directory = ref.deref()
      if (directory === undefined) continue
      const entry = patched.get(directory)
      if (entry === undefined || directory.load !== entry.load) continue
      if (entry.descriptor === undefined) Reflect.deleteProperty(directory, 'load')
      else Object.defineProperty(directory, 'load', entry.descriptor)
      const latest = entry.latest
      if (latest !== undefined) directory.store.update(state => {
        state.groups = [...latest.groups]
        state.failures = [...latest.failures]
      })
    }
    directories.clear()
  }
}
