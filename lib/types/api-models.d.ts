/** Endpoint-only discovery for custom routes, including routes named like built-in providers. */
import type { LlmDiscoveredModel } from '@deepseek-ai/dsh-llm';
/** Explicit inputs; credentials are operation-local and never returned. */
export interface ApiCatalogRequest {
    baseURL: string;
    api: string;
    headers?: Record<string, string>;
    apiKey?: string;
    signal: AbortSignal;
}
/** Read an API listing without substituting an installed provider catalog.
 * @param request - Configured endpoint, protocol, headers and current credential.
 * @returns Deduplicated endpoint model ids and disclosed metadata.
 */
export declare function fetchApiModels(request: ApiCatalogRequest): Promise<readonly LlmDiscoveredModel[]>;
