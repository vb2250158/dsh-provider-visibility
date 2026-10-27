import type { ModelDirectoryResolver } from '@deepseek-ai/dsh-client-ui-model-selection/client';
/**
 * Filter model directories while preserving Cordis's calling context and restore every owned method on disposal.
 * @param resolver - Traceable model-directory service.
 * @param hiddenProviders - Current visibility policy.
 * @returns Disposer for this generation's resolver and directory-load methods.
 */
export declare function installDirectoryVisibilityPolicy(resolver: ModelDirectoryResolver, hiddenProviders: () => ReadonlySet<string>): () => void;
