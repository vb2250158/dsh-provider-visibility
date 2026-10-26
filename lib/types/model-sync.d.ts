import type { LlmDiscoveredModel } from '@deepseek-ai/dsh-llm';
import type { ModelSyncPolicy, ModelSyncTarget } from './model-sync-config.ts';
/** One live provider setting captured before discovery. */
export interface ModelSyncSnapshot {
    revision: number;
    profile: Record<string, unknown>;
}
/** Public service operations used by the synchronizer. Backups contain model rows only. */
export interface ModelSyncPorts {
    read(target: ModelSyncTarget): ModelSyncSnapshot;
    discover(target: ModelSyncTarget, profile: Record<string, unknown>, signal: AbortSignal): Promise<readonly LlmDiscoveredModel[]>;
    backup(target: ModelSyncTarget, previous: unknown): Promise<void>;
    write(target: ModelSyncTarget, models: readonly object[], revision: number): Promise<void>;
    report(target: ModelSyncTarget, outcome: 'updated' | 'empty' | 'changed' | 'failed', count?: number): void;
}
/** Preserve configured metadata for surviving ids; new ids adopt only disclosed facts.
 * @param previous - Provider-owned configured rows.
 * @param discovered - Validated, deduplicated endpoint models from the LLM service.
 * @returns Endpoint membership in stable id order, retaining manual overrides.
 */
export declare function syncModelRows(previous: unknown, discovered: readonly LlmDiscoveredModel[]): object[];
/** Serial refresh owner. Late results after disposal or a route edit cannot write. */
export declare class ModelCatalogSync {
    private readonly config;
    private readonly ports;
    private inflight;
    private controller;
    private disposed;
    /**
     * @param config - Current opt-in targets and pacing, or undefined when disabled.
     * @param ports - Settings owner, endpoint discovery, backup and diagnostics.
     */
    constructor(config: () => ModelSyncPolicy | undefined, ports: ModelSyncPorts);
    /** Refresh selected routes once, sharing concurrent callers.
     * @returns Completion of the current refresh, including isolated provider failures.
     */
    refresh(): Promise<void>;
    /** Cancel discovery and permanently prohibit further writes. */
    dispose(): void;
    private run;
}
