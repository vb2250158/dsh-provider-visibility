/** Endpoint-only discovery for custom routes, including routes named like built-in providers. */
import type { LlmDiscoveredModel } from '@deepseek-ai/dsh-llm'

/** Explicit inputs; credentials are operation-local and never returned. */
export interface ApiCatalogRequest {
  baseURL: string
  api: string
  headers?: Record<string, string>
  apiKey?: string
  signal: AbortSignal
}

/** Read an API listing without substituting an installed provider catalog.
 * @param request - Configured endpoint, protocol, headers and current credential.
 * @returns Deduplicated endpoint model ids and disclosed metadata.
 */
export async function fetchApiModels(request: ApiCatalogRequest): Promise<readonly LlmDiscoveredModel[]> {
  const base = request.baseURL.replace(/\/+$/, '')
  const anthropic = request.api === 'anthropic-messages'
  if (!anthropic && !['openai-completions', 'openai-responses', 'openai-codex-responses'].includes(request.api)) {
    throw new Error('API model synchronization does not support this protocol')
  }
  const headers = new Headers(request.headers)
  if (anthropic) headers.set('anthropic-version', '2023-06-01')
  if (request.apiKey !== undefined) headers.set(anthropic ? 'x-api-key' : 'authorization', anthropic ? request.apiKey : `Bearer ${request.apiKey}`)
  const root = anthropic && base.endsWith('/v1') ? base.slice(0, -3) : base
  const url = anthropic ? `${root}/v1/models?limit=1000` : `${base}/models`
  const response = await fetch(url, { headers, signal: request.signal, redirect: 'error' })
  if (!response.ok) { await response.body?.cancel(); throw new Error(`API model listing returned HTTP ${response.status}`) }
  if (response.body === null) throw new Error('API model listing has no body')
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let bytes = 0
  try {
    for (;;) {
      const part = await reader.read()
      if (part.done) break
      bytes += part.value.byteLength
      if (bytes > 2 * 1024 * 1024) throw new Error('API model listing exceeds 2 MiB')
      chunks.push(part.value)
    }
  } finally { await reader.cancel() }
  const body = new Uint8Array(bytes)
  let offset = 0
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength }
  const parsed: unknown = JSON.parse(new TextDecoder().decode(body))
  if (parsed === null || typeof parsed !== 'object') throw new Error('API model listing must be an object')
  const listing = parsed as Record<string, unknown>
  // Partial pages cannot remove models from the saved directory.
  if (listing.has_more === true || typeof listing.next_page === 'string' || typeof listing.next === 'string') throw new Error('API model listing is paginated')
  let rows: [string | undefined, unknown][]
  if (Array.isArray(listing.data)) rows = listing.data.map(row => [undefined, row])
  else if (listing.models !== null && typeof listing.models === 'object' && !Array.isArray(listing.models)) rows = Object.entries(listing.models)
  else throw new Error('API model listing has no data array or models map')
  const models = new Map<string, LlmDiscoveredModel>()
  for (const [key, value] of rows) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      if (Array.isArray(listing.data)) throw new Error('API model listing contains an invalid row')
      continue
    }
    const row = value as Record<string, unknown>
    const id = key || row.id
    if (typeof id !== 'string' || id.length === 0) throw new Error('API model listing contains an invalid model id')
    const name = row.name ?? row.display_name
    const context = row.contextWindow ?? row.context_window
    const output = row.maxTokens ?? row.max_output_tokens ?? row.max_tokens
    const input = row.input ?? row.input_modalities
    models.set(id, {
      id,
      ...typeof name !== 'string' ? {} : { name },
      ...typeof context !== 'number' || !Number.isSafeInteger(context) || context <= 0 ? {} : { contextWindow: context },
      ...typeof output !== 'number' || !Number.isSafeInteger(output) || output <= 0 ? {} : { maxTokens: output },
      ...!Array.isArray(input) || input.length === 0 || !input.every(item => item === 'text' || item === 'image') ? {} : { inputModalities: input },
    })
  }
  return [...models.values()]
}
