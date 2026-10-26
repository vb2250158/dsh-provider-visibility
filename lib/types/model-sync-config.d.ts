/** Browser-safe configuration for opt-in API model synchronization. */
import z from '@deepseek-ai/schemastery';
/** One explicitly selected API route; subscription catalogs keep their own owner. */
export interface ModelSyncTarget {
    settingsNs: string;
    provider: string;
}
/** Pacing and request bounds for automatic model discovery. */
export interface ModelSyncConfig {
    targets: ModelSyncTarget[];
    intervalMs: number;
    timeoutMs: number;
}
/** Read-only configuration snapshot supplied by Cordis volatile settings. */
export type ModelSyncPolicy = Readonly<Omit<ModelSyncConfig, 'targets'>> & {
    readonly targets: readonly ModelSyncTarget[];
};
/** No targets by default means no discovery requests or catalog writes. */
export declare const ModelSyncSchema: z<ModelSyncConfig>;
