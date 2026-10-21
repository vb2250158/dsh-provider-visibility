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
  const source = new ConfigFormController(ctx, { namespace: view.ns }, mirror, {
    rehydrate: wire => new Schema(wire),
    validate(schema, value) { try { schema(value) } catch (error) { return error.message } },
  })
  assert.equal(source.getSnapshot().status, 'loading')
  assert.equal('mode' in source.getSnapshot(), false)
  const projection = createVisibilityForm(source, mirror)
  assert.equal(projection.form.getSnapshot().status, 'ready')
  assert.equal(projection.form.getSnapshot().writable, true)
  assert.deepEqual(projection.form.getSnapshot().value.hiddenProviders, ['hidden'])
  assert.equal(await projection.form.set('hiddenProviders', []), true)
  assert.deepEqual(projection.form.getSnapshot().value.hiddenProviders, [])
  assert.equal(await projection.form.set('hiddenProviders', ['hidden']), true)
  assert.deepEqual(writes.map(write => write.revision), [7, 8])
  assert.deepEqual(projection.form.getSnapshot().value.hiddenProviders, ['hidden'])
  projection.dispose()
  await source.dispose()
  assert.equal(listeners.size, 0)
})

test('领域投影跟随 Host 权限、缺失命名空间、无效值和读取失败', async () => {
  const view = { ns: 'provider-visibility', revision: 3, base: {}, user: {}, value: { hiddenProviders: [], redirects: [] } }
  let snapshot = { error: null, view: undefined }
  const listeners = new Set()
  const mirror = {
    getSnapshot: () => snapshot,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
  }
  const source = new ConfigFormController({}, { namespace: view.ns, decode: decodeProviderVisibility }, mirror, {})
  const projection = createVisibilityForm(source, mirror)
  const publish = next => { snapshot = next; for (const listener of listeners) listener() }
  assert.equal(projection.form.getSnapshot().status, 'loading')
  assert.equal(projection.form.getSnapshot().writable, false)
  publish({ error: null, view: { writable: false, namespaces: [view] } })
  assert.equal(projection.form.getSnapshot().status, 'ready')
  assert.equal(projection.form.getSnapshot().writable, false)
  assert.deepEqual(projection.form.getSnapshot().value, view.value)
  assert.equal(projection.form.getSnapshot().revision, 3)
  assert.deepEqual(projection.form.getSnapshot().base, view.base)
  assert.deepEqual(projection.form.getSnapshot().user, view.user)
  publish({ error: null, view: { writable: true, namespaces: [view] } })
  assert.equal(projection.form.getSnapshot().writable, true)
  for (const namespaces of [[], [{ ...view, value: { hiddenProviders: [1] } }]]) {
    publish({ error: null, view: { writable: false, namespaces } })
    assert.equal(projection.form.getSnapshot().status, 'unavailable')
    assert.equal(projection.form.getSnapshot().value, undefined)
    assert.equal(projection.form.getSnapshot().writable, false)
  }
  publish({ error: 'offline', view: undefined })
  assert.equal(projection.form.getSnapshot().status, 'unavailable')
  publish({ error: null, view: { writable: true, namespaces: [view] } })
  assert.equal(projection.form.getSnapshot().status, 'ready')
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
  const scope = new ConfigFormController(ctx, { namespace: view.ns, decode: decodeProviderVisibility }, mirror, { rehydrate() { throw new Error('default wire decoder must not run') } })
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
