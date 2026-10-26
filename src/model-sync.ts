/** Opt-in endpoint catalogs, adopted through revision-fenced settings edits. */
import { isDeepStrictEqual } from 'node:util'
import type { LlmDiscoveredModel } from '@deepseek-ai/dsh-llm'
import type { ModelSyncPolicy, ModelSyncTarget } from './model-sync-config.ts'

/** One live provider setting captured before discovery. */
export interface ModelSyncSnapshot { revision: number; profile: Record<string, unknown> }

/** Fixed diagnostic labels; no exception text or provider secrets. */
export interface ModelSyncFailure { phase: string; reason: 'conflict' | 'validation' | 'inactive' | 'other' }

/** Public service operations used by the synchronizer. Backups contain model rows only. */
export interface ModelSyncPorts {
  read(target: ModelSyncTarget): ModelSyncSnapshot
  discover(target: ModelSyncTarget, profile: Record<string, unknown>, signal: AbortSignal): Promise<readonly LlmDiscoveredModel[]>
  backup(target: ModelSyncTarget, previous: unknown): Promise<void>
  write(target: ModelSyncTarget, models: readonly object[], revision: number): Promise<void>
  report(target: ModelSyncTarget, outcome: 'updated' | 'empty' | 'changed' | 'failed', count?: number, failure?: ModelSyncFailure): void
}

/** Preserve configured metadata for surviving ids; new ids adopt only disclosed facts.
 * @param previous - Provider-owned configured rows.
 * @param discovered - Validated, deduplicated endpoint models from the LLM service.
 * @returns Endpoint membership in stable id order, retaining manual overrides.
 */
export function syncModelRows(previous: unknown, discovered: readonly LlmDiscoveredModel[]): object[] {
  const configured = new Map<string, Record<string, unknown>>()
  if (previous !== undefined && !Array.isArray(previous)) throw new Error('configured models must be an array')
  for (const row of previous ?? []) {
    if (row === null || typeof row !== 'object' || typeof row.id !== 'string') throw new Error('invalid configured model')
    configured.set(row.id, row)
  }
  return [...discovered].sort((a, b) => a.id.localeCompare(b.id)).map(model => {
    const existing = configured.get(model.id)
    if (existing !== undefined) return existing
    return {
      id: model.id,
      ...model.name === undefined ? {} : { name: model.name },
      ...model.contextWindow === undefined ? {} : { contextWindow: model.contextWindow },
      ...model.maxTokens === undefined ? {} : { maxTokens: model.maxTokens },
      ...model.inputModalities === undefined ? {} : { input: [...model.inputModalities] },
    }
  })
}

/** Serial refresh owner. Late results after disposal or a route edit cannot write. */
export class ModelCatalogSync {
  private inflight: Promise<void> | undefined
  private controller: AbortController | undefined
  private disposed = false

  /**
   * @param config - Current opt-in targets and pacing, or undefined when disabled.
   * @param ports - Settings owner, endpoint discovery, backup and diagnostics.
   */
  constructor(private readonly config: () => ModelSyncPolicy | undefined, private readonly ports: ModelSyncPorts) {}

  /** Refresh selected routes once, sharing concurrent callers.
   * @returns Completion of the current refresh, including isolated provider failures.
   */
  refresh(): Promise<void> {
    if (this.disposed) return Promise.resolve()
    if (this.inflight !== undefined) return this.inflight
    const operation = this.run().finally(() => { this.inflight = undefined })
    this.inflight = operation
    return operation
  }

  /** Cancel discovery and permanently prohibit further writes. */
  dispose(): void { this.disposed = true; this.controller?.abort() }

  private async run(): Promise<void> {
    const config = this.config()
    if (config === undefined) return
    const seen = new Set<string>()
    for (const target of config.targets) {
      const key = JSON.stringify([target.settingsNs, target.provider])
      if (seen.has(key)) continue
      seen.add(key)
      if (this.disposed) return
      const controller = new AbortController()
      this.controller = controller
      const timer = setTimeout(() => controller.abort(), config.timeoutMs)
      let phase = 'read'
      try {
        const before = this.ports.read(target)
        phase = 'fetch'
        const models = await this.ports.discover(target, before.profile, controller.signal)
        if (this.disposed || controller.signal.aborted) continue
        if (models.length === 0) { this.ports.report(target, 'empty'); continue }
        phase = 'merge'
        const rows = syncModelRows(before.profile.models, models)
        if (isDeepStrictEqual(rows, before.profile.models)) continue
        const enabled = (): boolean => this.config()?.targets.some(item => item.settingsNs === target.settingsNs && item.provider === target.provider) === true
        const unchanged = (snapshot: ModelSyncSnapshot): boolean => isDeepStrictEqual(snapshot.profile, before.profile)
        if (!enabled() || !unchanged(this.ports.read(target))) { this.ports.report(target, 'changed'); continue }
        phase = 'backup'
        await this.ports.backup(target, before.profile.models)
        if (this.disposed || controller.signal.aborted) continue
        const fresh = this.ports.read(target)
        if (!enabled() || !unchanged(fresh)) { this.ports.report(target, 'changed'); continue }
        phase = 'write'
        await this.ports.write(target, rows, fresh.revision)
        phase = 'verify'
        if (!isDeepStrictEqual(this.ports.read(target).profile.models, rows)) throw new Error('model catalog readback differs')
        this.ports.report(target, 'updated', rows.length)
      } catch (error) {
        // Diagnostics exclude provider URLs and credentials carried by network errors.
        const message = error instanceof Error ? error.message : ''
        const reason = /conflict|revision/i.test(message) ? 'conflict'
          : /validation|schema|not volatile|llm-pi-ai/i.test(message) ? 'validation'
            : /disposed|inactive|fiber|effect/i.test(message) ? 'inactive' : 'other'
        if (!this.disposed) this.ports.report(target, 'failed', undefined, { phase, reason })
      } finally { clearTimeout(timer); this.controller = undefined }
    }
  }
}
