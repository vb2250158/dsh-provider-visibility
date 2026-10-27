import assert from 'node:assert/strict'
import test from 'node:test'
import { Context, Service } from '@deepseek-ai/cordis'
import { installDirectoryVisibilityPolicy } from '../src/client/directory-policy.ts'

test('real Cordis callers survive policy unload and a second plugin generation', async () => {
  const root = new Context()
  const originalState = { groups: [{ id: 'visible' }, { id: 'hidden' }], failures: [], status: 'ready' }
  let state = structuredClone(originalState)
  const directory = { store: { update(fn) { fn(state) } }, async load() { state = structuredClone(originalState); return state } }
  let caller
  class Resolver extends Service {
    constructor(ctx) { super(ctx, 'modelDirectories') }
    directoryFor() { caller = this.ctx.fiber; return directory }
  }
  try {
    await root.plugin(Resolver)
    let consumer
    await root.plugin({ inject: ['modelDirectories'], apply(ctx) { consumer = ctx } })
    const target = root.get('modelDirectories')
    const original = Object.getPrototypeOf(target).directoryFor
    const load = directory.load
    for (const hidden of ['hidden', 'visible']) {
      const fiber = await root.plugin({
        inject: ['modelDirectories'],
        apply(ctx) { ctx.effect(() => installDirectoryVisibilityPolicy(ctx.modelDirectories, () => new Set([hidden]))) },
      })
      const resolved = consumer.modelDirectories.directoryFor('fixture')
      assert.equal(caller, consumer.fiber, 'resolver must run in its current caller, not the policy plugin')
      assert.deepEqual((await resolved.load()).groups.map(x => x.id), ['visible', 'hidden'].filter(x => x !== hidden))
      await fiber.dispose()
      assert.equal(Object.hasOwn(target, 'directoryFor'), false)
      assert.equal(Object.getPrototypeOf(target).directoryFor, original)
      assert.equal(directory.load, load)
      assert.deepEqual(state.groups, originalState.groups)
      assert.equal(consumer.modelDirectories.directoryFor('fixture'), directory)
      assert.equal(caller, consumer.fiber)
    }
  } finally { await root.fiber.dispose() }
})

test('a load finishing after disposal leaves its complete catalog intact', async () => {
  let finish
  const pending = new Promise(resolve => { finish = resolve })
  const directory = { store: { update() { assert.fail('Disposed policy must not write') } }, load: () => pending }
  const resolver = { directoryFor: () => directory }
  const dispose = installDirectoryVisibilityPolicy(resolver, () => new Set(['hidden']))
  const result = resolver.directoryFor('fixture').load()
  dispose()
  const catalog = { groups: [{ id: 'hidden' }], failures: [] }
  finish(catalog)
  assert.equal(await result, catalog)
})
