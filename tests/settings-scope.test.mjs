import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.env.DSH_SOURCE_ROOT
assert.ok(root, 'DSH_SOURCE_ROOT is required for the real settings scope regression')
await mkdir('.tmp-tests', { recursive: true })
const outfile = resolve('.tmp-tests/settings-scope.mjs')
await build({ stdin: { contents: `export * from './src/provider-visibility-shared.ts'; export * from './src/client/settings-form.ts'; export { ProviderVisibilitySettingsSchema } from './src/provider-visibility.ts'; export { ConfigFormController } from '${root.replaceAll('\\', '/')}/packages/client/ui-settings/src/client/config-form.ts'; export { default as Schema } from '@deepseek-ai/schemastery';`, resolveDir: process.cwd(), loader: 'ts' },
  outfile, bundle: true, platform: 'node', format: 'esm', target: 'es2022', tsconfig: resolve(root, 'tsconfig.base.json') })
const { decodeProviderVisibility, createVisibilityForm, ProviderVisibilitySettingsSchema, ConfigFormController, Schema } = await import(pathToFileURL(outfile))

test('共享配置表单不能解析 Host transform 时，领域投影仍可编辑并沿用写入队列', async () => {
  const wire = JSON.parse(JSON.stringify(ProviderVisibilitySettingsSchema))
  for (const node of Object.values(wire.refs)) {
    if (node.type === 'transform') delete node.callback
  }
  let view = { ns: 'provider-visibility', revision: 7, value: { hiddenProviders: ['hidden'], redirects: [] }, schema: wire }
  assert.throws(() => new Schema(wire)(view.value), /callback/)
  const listeners = new Set()
  const mirror = {
    getSnapshot: () => ({ status: 'ready', error: null, view: { writable: true, namespaces: [view] } }),
    subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn) },
    acceptView(next) { view = next; for (const fn of listeners) fn() },
  }
  const writes = []
  const ctx = { remote: { settings: { async mutate(ns, ops, revision) {
    writes.push({ ns, ops, revision })
    return { ok: true, value: { ...view, revision: revision + 1, value: { ...view.value, [ops[0].path[0]]: ops[0].value } } }
  } } } }
  const source = new ConfigFormController(ctx, { namespace: view.ns }, mirror, 'host', {
    rehydrate: wire => new Schema(wire),
    validate(schema, value) { try { schema(value) } catch (error) { return error.message } },
  })
  assert.equal(source.getSnapshot().status, 'loading')
  const projection = createVisibilityForm(source, mirror)
  assert.equal(projection.form.getSnapshot().status, 'ready')
  assert.equal(projection.form.getSnapshot().writable, true)
  await projection.form.set('hiddenProviders', [])
  assert.deepEqual(projection.form.getSnapshot().value.hiddenProviders, [])
  await projection.form.set('hiddenProviders', ['hidden'])
  assert.deepEqual(writes.map(write => write.revision), [7, 8])
  assert.deepEqual(projection.form.getSnapshot().value.hiddenProviders, ['hidden'])
  projection.dispose()
  await source.dispose()
  assert.equal(listeners.size, 0)
})

test('真实设置 scope 解析传输值并支持取消和恢复勾选，不执行失去闭包的 schema', async () => {
  let view = { ns: 'llm-provider-visibility', revision: 1, value: { hiddenProviders: ['hidden'], redirects: [] }, schema: JSON.parse(JSON.stringify(ProviderVisibilitySettingsSchema)) }
  assert.deepEqual(new Schema(view.schema)(view.value), view.value)
  const listeners = new Set()
  const mirror = { getSnapshot: () => ({ view: { writable: true, namespaces: [view] } }), subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn) },
    acceptView(next) { view = next; for (const fn of listeners) fn() } }
  const writes = []
  const ctx = { remote: { settings: { async mutate(ns, ops, revision) { writes.push({ ns, ops, revision }); return { ok: true, value: { ...view, revision: revision + 1, value: { ...view.value, [ops[0].path[0]]: ops[0].value } } } } } } }
  const scope = new ConfigFormController(ctx, { namespace: view.ns, decode: decodeProviderVisibility }, mirror, 'host', { rehydrate() { throw new Error('default wire decoder must not run') } })
  assert.equal(scope.getSnapshot().status, 'ready')
  assert.equal(scope.getSnapshot().writable, true)
  assert.deepEqual(scope.getSnapshot().value.hiddenProviders, ['hidden'])
  await scope.set('hiddenProviders', [])
  assert.deepEqual(scope.getSnapshot().value.hiddenProviders, [])
  await scope.set('hiddenProviders', ['hidden'])
  assert.deepEqual(scope.getSnapshot().value.hiddenProviders, ['hidden'])
  assert.deepEqual(writes.map(w => w.revision), [1, 2])
  await scope.dispose()
})

test('解析拒绝无效字段、重复来源和自指规则，兼容没有重定向字段的旧设置', () => {
  assert.deepEqual(decodeProviderVisibility({ hiddenProviders: ['x'] }), { hiddenProviders: ['x'], redirects: [] })
  const rule = { sourceProvider: 'a', targetProvider: 'b', targetModel: 'm' }
  for (const value of [null, [], { hiddenProviders: [1] }, { hiddenProviders: [], redirects: [null] },
    { hiddenProviders: [], redirects: [rule, rule] }, { hiddenProviders: [], redirects: [{ ...rule, targetProvider: 'a' }] }]) {
    assert.equal(decodeProviderVisibility(value), undefined)
  }
})
