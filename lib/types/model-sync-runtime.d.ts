import type { Context } from '@deepseek-ai/cordis';
import type { ModelSyncPolicy } from './model-sync-config.ts';
/** Install one scoped refresh loop; no config means no network or settings writes.
 * @param ctx - Child context with LLM discovery and settings services available.
 * @param config - Current optional synchronization policy.
 */
export declare function installModelSync(ctx: Context, config: () => ModelSyncPolicy | undefined): void;
