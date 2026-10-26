/** Wire automatic API catalogs to the public discovery and settings services. */
import { createHash, randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { isDeepStrictEqual } from 'node:util'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-settings'
import type {} from '@deepseek-ai/dsh-llm'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import { ModelCatalogSync } from './model-sync.ts'
import type { ModelSyncPolicy } from './model-sync-config.ts'
import { fetchApiModels } from './api-models.ts'

/** Install one scoped refresh loop; no config means no network or settings writes.
 * @param ctx - Child context with LLM discovery and settings services available.
 * @param config - Current optional synchronization policy.
 */
export function installModelSync(ctx: Context, config: () => ModelSyncPolicy | undefined): void {
  const sync = new ModelCatalogSync(config, {
    read(target) {
      const section = ctx.settings.describe().find(entry => entry.ns === target.settingsNs)
      const value = section?.value as { providers?: Record<string, unknown> } | undefined
      const profile = value?.providers?.[target.provider]
      if (section === undefined || profile === null || typeof profile !== 'object' || Array.isArray(profile)) {
        throw new Error('model sync target is not a configured provider')
      }
      return { revision: section.revision, profile: structuredClone(profile) as Record<string, unknown> }
    },
    discover: async (_target, profile, signal) => {
      if (typeof profile.baseURL !== 'string' || profile.baseURL.length === 0 || typeof profile.api !== 'string') {
        throw new Error('automatic API discovery requires an explicit endpoint and protocol')
      }
      let apiKey: string | undefined
      if (typeof profile.apiKeyEnv === 'string') {
        apiKey = (await ctx.credentials.resolve(credentialRef(profile.apiKeyEnv)))?.value
        if (apiKey === undefined || apiKey.length === 0) throw new Error('API model synchronization credential is unavailable')
      }
      return fetchApiModels({ baseURL: profile.baseURL, api: profile.api, signal,
        ...apiKey === undefined ? {} : { apiKey },
        ...profile.headers === undefined ? {} : { headers: profile.headers as Record<string, string> },
      })
    },
    async backup(target, previous) {
      const root = join(dirname(ctx.settings.documentPath), '.model-catalog-backups')
      await mkdir(root, { recursive: true })
      const key = createHash('sha256').update(JSON.stringify(target)).digest('hex').slice(0, 16)
      await writeFile(join(root, `${key}-${randomUUID()}.json`), JSON.stringify({ ...target, models: previous ?? null }, null, 2) + '\n', { flag: 'wx' })
    },
    write: (target, models, revision) => ctx.settings.mutate(target.settingsNs, [
      { op: 'set', path: ['providers', target.provider, 'models'], value: models },
    ], revision),
    report(target, outcome, count) {
      const message = `API model sync ${target.provider}: ${outcome}${count === undefined ? '' : ` (${count} models)`}`
      if (outcome === 'updated') ctx.logger.info(message)
      else ctx.logger.warn(message)
    },
  })
  let stopped = false
  let running = false
  let lastPolicy = config()
  let timer: ReturnType<typeof setTimeout> | undefined
  const tick = async (): Promise<void> => {
    if (stopped || running) return
    running = true
    clearTimeout(timer)
    await sync.refresh()
    running = false
    const interval = config()?.intervalMs
    if (!stopped && interval !== undefined) timer = setTimeout(() => { void tick() }, interval)
  }
  ctx.on('loader/volatile-update', () => {
    const next = config()
    if (isDeepStrictEqual(next, lastPolicy)) return
    lastPolicy = next
    void tick()
  })
  ctx.effect(() => {
    void tick()
    return () => { stopped = true; clearTimeout(timer); sync.dispose() }
  })
}
