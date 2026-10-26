import assert from 'node:assert/strict'
import test from 'node:test'
import { createServer } from 'node:http'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'

const root = process.env.DSH_SOURCE_ROOT
assert.ok(root, 'DSH_SOURCE_ROOT is required')
await mkdir('.tmp-tests', { recursive: true })
const outfile = resolve('.tmp-tests/model-sync.mjs')
await build({ stdin: { contents: `export * from './src/model-sync.ts'; export { ProviderVisibilitySettingsSchema } from './src/provider-visibility.ts'; export { fetchApiModels } from './src/api-models.ts';`, resolveDir: process.cwd(), loader: 'ts' },
  outfile, bundle: true, platform: 'node', format: 'esm', target: 'es2022', tsconfig: resolve(root, 'tsconfig.base.json') })
const { ModelCatalogSync, syncModelRows, ProviderVisibilitySettingsSchema, fetchApiModels } = await import(pathToFileURL(outfile))
const target = { settingsNs: 'llm-pi-ai', provider: 'openai' }
const config = { targets: [target], intervalMs: 1000, timeoutMs: 500 }
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done }); return { promise, resolve } }

function harness(discover, options = {}) {
  let revision = 7
  let profile = { baseURL: 'https://api.invalid/v1', api: 'openai-responses', models: [{ id: 'old', maxTokens: 99, reasoningEfforts: ['high'] }], headers: { 'x-test': 'retained' } }
  let active = config
  const writes = [], reports = [], backups = []
  const ports = {
    read: () => ({ revision, profile: structuredClone(profile) }), discover,
    backup: async (target, previous) => { backups.push(structuredClone(previous)); await options.backup?.() },
    write: async (target, models, expected) => { assert.equal(expected, revision); writes.push(models); profile = { ...profile, models }; revision++ },
    report: (...args) => reports.push(args),
  }
  return { sync: new ModelCatalogSync(() => active, ports), ports, writes, reports, backups,
    get profile() { return profile }, set profile(value) { profile = value; revision++ }, disable() { active = undefined } }
}

test('schema leaves sync disabled by default and rejects unsafe timing', () => {
  assert.deepEqual(ProviderVisibilitySettingsSchema({}).modelSync.targets, [])
  assert.throws(() => ProviderVisibilitySettingsSchema({ modelSync: { intervalMs: 0 } }))
  assert.throws(() => ProviderVisibilitySettingsSchema({ modelSync: { timeoutMs: -1 } }))
  assert.deepEqual(ProviderVisibilitySettingsSchema({ modelSync: { targets: [target] } }).modelSync,
    { targets: [target], intervalMs: 300000, timeoutMs: 10000 })
})

test('endpoint membership preserves manual parameters and adopts disclosed metadata', () => {
  const old = { id: 'old', name: 'My name', maxTokens: 99, input: ['text', 'image'], reasoningEfforts: ['high'] }
  assert.deepEqual(syncModelRows([old, { id: 'removed' }], [{ id: 'old', name: 'API name', maxTokens: 999 }, { id: 'new', contextWindow: 1000, inputModalities: ['text'] }]),
    [{ id: 'new', contextWindow: 1000, input: ['text'] }, old])
  assert.throws(() => syncModelRows({}, [{ id: 'new' }]))
})

test('writes only changed model rows after backup and verifies settings readback', async () => {
  const h = harness(async () => [{ id: 'new' }, { id: 'old' }])
  const untouched = h.profile.headers
  await h.sync.refresh()
  assert.equal(h.backups.length, 1)
  assert.deepEqual(h.backups[0], [{ id: 'old', maxTokens: 99, reasoningEfforts: ['high'] }])
  assert.equal(h.writes.length, 1)
  assert.deepEqual(h.profile.headers, untouched)
  await h.sync.refresh()
  assert.equal(h.writes.length, 1, 'unchanged results do not rewrite settings')
})

test('empty results and failures retain the previous catalog and later recover', async () => {
  let mode = 'empty'
  const h = harness(async () => { if (mode === 'failed') throw new Error('secret URL must not be logged'); return mode === 'empty' ? [] : [{ id: 'new' }] })
  await h.sync.refresh(); mode = 'failed'; await h.sync.refresh()
  assert.equal(h.writes.length, 0)
  assert.deepEqual(h.reports.map(row => row[1]), ['empty', 'failed'])
  mode = 'ok'; await h.sync.refresh()
  assert.equal(h.writes.length, 1)
})

test('concurrent refreshes share discovery; edits during discovery are preserved', async () => {
  const pending = deferred(); let calls = 0
  const h = harness(async () => { calls++; return pending.promise })
  const a = h.sync.refresh(), b = h.sync.refresh()
  assert.equal(a, b)
  h.profile = { ...h.profile, models: [{ id: 'human-choice' }] }
  pending.resolve([{ id: 'new' }]); await a
  assert.equal(calls, 1); assert.equal(h.writes.length, 0)
  assert.equal(h.profile.models[0].id, 'human-choice')
})

test('edits during backup and disabling sync prevent the stale write', async () => {
  for (const change of ['edit', 'disable', 'dispose']) {
    const pending = deferred(), entered = deferred()
    const h = harness(async () => [{ id: 'new' }], { backup: async () => { entered.resolve(); await pending.promise } })
    const refresh = h.sync.refresh(); await entered.promise
    if (change === 'edit') h.profile = { ...h.profile, api: 'openai-completions' }
    if (change === 'disable') h.disable()
    if (change === 'dispose') h.sync.dispose()
    pending.resolve(); await refresh
    assert.equal(h.writes.length, 0, change)
  }
})

test('a failed route does not prevent another selected route from refreshing', async () => {
  const other = { ...target, provider: 'other-api' }
  const h = harness(async route => { if (route.provider === target.provider) throw new Error('offline'); return [{ id: 'other' }] })
  const sync = new ModelCatalogSync(() => ({ ...config, targets: [target, other, other] }), h.ports)
  await sync.refresh()
  assert.equal(h.writes.length, 1)
  assert.deepEqual(h.reports.map(row => row[1]), ['failed', 'updated'])
})

test('a route named openai queries its real endpoint with configured auth; hung refresh keeps the saved list readable', async () => {
  let hang = false, calls = 0
  const requests = []
  const server = createServer((request, response) => {
    calls++; requests.push({ url: request.url, auth: request.headers.authorization, custom: request.headers['x-test'] })
    if (hang) return
    response.setHeader('content-type', 'application/json')
    response.end(JSON.stringify({ data: [{ id: 'old' }, { id: 'new-live' }, { id: 'new-live' }] }))
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const h = harness((_route, profile, signal) => fetchApiModels({ baseURL: profile.baseURL, api: profile.api,
    signal, headers: profile.headers, apiKey: 'synthetic-test-key' }))
  h.profile = { ...h.profile, baseURL: `http://127.0.0.1:${server.address().port}/v1` }
  try {
    await h.sync.refresh()
    assert.equal(calls, 1)
    assert.deepEqual(requests[0], { url: '/v1/models', auth: 'Bearer synthetic-test-key', custom: 'retained' })
    assert.deepEqual(h.profile.models.map(row => row.id), ['new-live', 'old'])
    assert.equal(h.profile.models.find(row => row.id === 'old').maxTokens, 99)
    hang = true
    const refresh = h.sync.refresh()
    assert.deepEqual(h.ports.read(target).profile.models.map(row => row.id), ['new-live', 'old'])
    await refresh
    assert.equal(h.writes.length, 1)
    assert.equal(h.reports.at(-1)[1], 'failed')
  } finally { h.sync.dispose(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)) }
})

test('partial, oversized or invalid listings are rejected; enriched maps preserve endpoint aliases', async () => {
  let payload = { models: { alias: { id: 'canonical', display_name: 'Gateway model', context_window: 1200, input: ['text', 'image'] } } }
  let status = 200
  const server = createServer((_request, response) => { response.writeHead(status, { 'content-type': 'application/json' }); response.end(JSON.stringify(payload)) })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const request = { baseURL: `http://127.0.0.1:${server.address().port}/v1`, api: 'openai-responses', signal: AbortSignal.timeout(5000) }
  try {
    assert.deepEqual(await fetchApiModels(request), [{ id: 'alias', name: 'Gateway model', contextWindow: 1200, inputModalities: ['text', 'image'] }])
    for (const invalid of [{ data: [{ id: '' }] }, { data: [{ id: 'partial' }], has_more: true }, { data: [{ id: 'partial' }], next_page: 'next' }, {}, { data: [{ id: 'large', name: 'x'.repeat(2 * 1024 * 1024) }] }]) {
      payload = invalid
      await assert.rejects(fetchApiModels(request))
    }
    payload = { data: [] }; assert.deepEqual(await fetchApiModels(request), [])
    status = 401; await assert.rejects(fetchApiModels(request), /HTTP 401/)
    await assert.rejects(fetchApiModels({ ...request, api: 'unsupported' }), /protocol/)
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)) }
})
