import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { mkdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const output = resolve('.tmp-tests/redirect-runtime.mjs')
await mkdir('.tmp-tests', { recursive: true })
await build({
  stdin: { contents: `export * from './src/redirect-runtime.ts'; export * from './src/redirect-rules.ts'; export * from './src/redirect-history.ts'; export * from './src/provider-visibility.ts'; export { Session, default as SessionStore } from '@deepseek-ai/dsh-session'; export { createMessage, createUserMessage, LlmAdapter, default as LlmRuntime } from '@deepseek-ai/dsh-llm'; export { Context } from '@deepseek-ai/cordis'; export { default as SystemPrompt } from '@deepseek-ai/dsh-system-prompt'; export { default as ToolRuntime } from '@deepseek-ai/dsh-tools'; export { default as AgentRegistry } from '@deepseek-ai/dsh-agent'; export { default as AgentLoop } from '@deepseek-ai/dsh-agent-loop'; export { default as SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection'; export { AgentModel, modelSelectionProjectionDefinition } from '@deepseek-ai/dsh-agent'; export * as NativeExecutor from '@deepseek-ai/dsh-tool-executor-native'; export { defineTool } from '@deepseek-ai/dsh-tools';`, resolveDir: process.cwd(), loader: 'ts' },
  outfile: output, bundle: true, platform: 'node', format: 'esm', packages: 'bundle', target: 'es2022',
  ...(process.env.DSH_SOURCE_ROOT ? { tsconfig: resolve(process.env.DSH_SOURCE_ROOT, 'tsconfig.base.json') } : {}),
})
const { installRedirects, redirectRoute, validateRedirectRules, foldRedirectHistory, runningRedirectProjection, ProviderVisibilitySettingsSchema, Session, createMessage,
  AgentModel, modelSelectionProjectionDefinition, NativeExecutor, defineTool, Context, SessionStore, SystemPrompt, ToolRuntime, AgentRegistry, AgentLoop, SessionProjectionRegistry, LlmRuntime, LlmAdapter, createUserMessage,
} = await import(pathToFileURL(output))
const source = { provider: 'subscription', model: 'model-a' }
const target = { provider: 'api', model: 'model-b' }
const rule = { sourceProvider: source.provider, sourceModel: source.model, targetProvider: target.provider, targetModel: target.model }

test('运行中重定向记录绑定当前步骤，下一步清除旧通知', () => {
  const session = Session.create('running-redirect', [])
  session.append('step/start', { turn: 2, step: 1 })
  session.append('user/message', createUserMessage({ content: [{ type: 'text', text: JSON.stringify({ version: 1, from: source, to: target }) }], source: { kind: 'plugin:dsh-provider-visibility', form: 'notice', summary: 'redirect' } }), { surfaceOp: 'append' })
  let state = runningRedirectProjection.init()
  for (const event of eventsOf(session)) state = runningRedirectProjection.apply(state, event)
  assert.deepEqual(state, { turn: 2, step: 1, record: { version: 1, from: source, to: target } })
  session.append('step/start', { turn: 2, step: 2 })
  state = runningRedirectProjection.apply(state, session.eventAt(session.seq - 1))
  assert.deepEqual(state, { turn: 2, step: 2, record: null })
})

function eventsOf(session) { return Array.from({ length: session.seq }, (_, index) => session.eventAt(index)) }
async function fixture(seed = [], modelResolutionVersion = 1) {
  const session = Session.create('test-redirect', seed)
  const options = { ...source }
  const readSelection = () => eventsOf(session).reduce(modelSelectionProjectionDefinition.apply, modelSelectionProjectionDefinition.init())
  const agent = { session, model: new AgentModel(readSelection, session, options) }
  const handlers = new Map()
  let rules = [rule]
  let rejectTarget = false
  let resolving = async () => {}
  let preparedSelection
  const calls = []
  const ctx = {
    agentLoop: { modelResolutionVersion },
    on: (name, callback) => { handlers.set(name, callback); return () => handlers.delete(name) },
    sessionProjections: { register: async () => ({ dispose() {} }) },
    llm: { async resolveCallConfig(config) { calls.push(config); await resolving(); if (rejectTarget) throw new Error('unsupported effort'); return config } },
  }
  await installRedirects(ctx, () => rules)
  return { agent, session, handlers, calls, setRules(value) { rules = value }, reject() { rejectTarget = true }, onResolve(callback) { resolving = callback },
    async assemble(route = source) {
      for (const key of Object.keys(options)) delete options[key]
      Object.assign(options, route)
      const selection = agent.model.current()
      preparedSelection = await handlers.get('agent/resolve-model')({ agent, sourceSelection: selection, signal: new AbortController().signal }, async () => selection)
      return { variables: preparedSelection }
    },
    async request() {
      return handlers.get('agent/request')({ agent, signal: new AbortController().signal }, async () => preparedSelection)
    },
  }
}

test('精确模型优先；规则仅匹配一次；无匹配保留原模型', () => {
  const providerRule = { ...rule, sourceModel: undefined, targetModel: 'provider-default' }
  assert.deepEqual(redirectRoute(source, [providerRule, rule]), target)
  assert.deepEqual(redirectRoute({ ...source, model: 'other' }, [providerRule, rule]), { ...target, model: 'provider-default' })
  assert.deepEqual(redirectRoute(target, [rule]), target)
  assert.deepEqual(redirectRoute(source, [rule, { sourceProvider: 'api', sourceModel: 'model-b', targetProvider: 'third', targetModel: 'c' }]), target)
})

test('持久化解析拒绝重复、自指及空规则，兼容已有显示设置', () => {
  assert.throws(() => validateRedirectRules([rule, rule]), /duplicate/)
  assert.throws(() => ProviderVisibilitySettingsSchema({ redirects: [{ ...rule, targetModel: '' }] }), /empty/)
  assert.throws(() => ProviderVisibilitySettingsSchema({ redirects: [{ ...rule, targetProvider: source.provider, targetModel: source.model }] }), /self/)
  assert.deepEqual(ProviderVisibilitySettingsSchema({ hiddenProviders: [] }).redirects, [])
  assert.equal(ProviderVisibilitySettingsSchema({ redirects: [{ sourceProvider: 'subscription', targetProvider: 'api', targetModel: 'b' }] }).redirects.length, 1)
})

test('请求使用目标，原选择与路由通知经过真实 Session JSON 往返保留；删规则恢复来源', async () => {
  const f = await fixture()
  const assembly = await f.assemble({ ...source, reasoningEffort: 'high' })
  assert.deepEqual(assembly.variables, { ...target, reasoningEffort: 'high' })
  f.session.append('step/start', { turn: 1, step: 1 })
  assert.deepEqual(await f.request(), { ...target, reasoningEffort: 'high' })
  const saved = JSON.parse(JSON.stringify(eventsOf(f.session)))
  assert.deepEqual(saved.find(event => event.type === 'model/selection').data, { ...source, reasoningEffort: 'high' })
  const resumed = await fixture(saved)
  resumed.setRules([])
  assert.deepEqual((await resumed.assemble(target)).variables, { ...source, reasoningEffort: 'high' })
  assert.deepEqual(await resumed.request(), { ...source, reasoningEffort: 'high' })
})

test('装配后改规则不影响正在准备的请求；目标拒绝不会回退或写虚假成功记录', async () => {
  const f = await fixture()
  await f.assemble()
  f.setRules([])
  assert.deepEqual(await f.request(), target)
  const failure = await fixture()
  failure.reject()
  await assert.rejects(failure.assemble(), /unsupported effort/)
  assert.equal(eventsOf(failure.session).some(event => event.type === 'user/message'), false)
})

test('装配期间的新选择留给下一步，当前请求不覆盖新的持久化选择', async () => {
  const f = await fixture()
  await f.assemble()
  const future = { provider: 'future', model: 'future-model' }
  f.session.append('model/selection', future)
  assert.deepEqual(await f.request(), target)
  assert.deepEqual(eventsOf(f.session).filter(event => event.type === 'model/selection').at(-1).data, future)
  assert.deepEqual((await f.assemble(target)).variables, future)
})

test('历史尾注只标记实际返回的目标模型；改选择、重载与新一轮不改变旧记录', async () => {
  const f = await fixture()
  await f.assemble()
  f.session.append('step/start', { turn: 1, step: 1 })
  await f.request()
  const message = createMessage({ role: 'assistant', content: [{ type: 'text', text: 'answer' }], source: { kind: 'model', ...target } })
  f.session.append('assistant/message', { turn: 1, step: 1, stream: [], message }, { surfaceOp: 'append' })
  f.session.append('model/selection', { provider: 'another', model: 'next' })
  f.session.append('step/start', { turn: 2, step: 1 })
  const other = createMessage({ role: 'assistant', content: [{ type: 'text', text: 'next' }], source: { kind: 'model', ...source } })
  f.session.append('assistant/message', { turn: 2, step: 1, stream: [], message: other }, { surfaceOp: 'append' })
  const replay = Session.create('replayed', JSON.parse(JSON.stringify(eventsOf(f.session))))
  const history = eventsOf(replay).reduce(foldRedirectHistory, { current: null, messages: {} })
  assert.deepEqual(history.messages[message.id], { version: 1, from: source, to: target })
  assert.equal(history.messages[other.id], undefined)
  const snapshot = Object.values(history.messages).map(record => `${record.from.provider}/${record.from.model} → ${record.to.provider}/${record.to.model}`).join('\n') + '\n'
  assert.equal(snapshot, (await readFile(new URL('./fixtures/redirect-history.txt', import.meta.url), 'utf8')).replaceAll('\r\n', '\n'))
})

test('真实 rc3 ReactLoopAgent 的工具、提示词、请求头和回复使用同一有效选择', async (t) => {
  const requests = []
  class Adapter extends LlmAdapter {
    async resolveModel(provider, model) { return { provider, id: model, name: model } }
    async *stream(request) {
      requests.push(request)
      yield { type: 'block-start', index: 0, blockType: 'text' }
      yield { type: 'text-delta', index: 0, text: 'ok' }
      yield { type: 'block-end', index: 0, block: { type: 'text', text: 'ok' } }
      yield { type: 'finish', reason: { kind: 'stop' } }
    }
  }
  const ctx = new Context()
  t.after(() => ctx.fiber.dispose())
  for (const plugin of [LlmRuntime, SessionStore, SessionProjectionRegistry, SystemPrompt, ToolRuntime, AgentRegistry]) await ctx.plugin(plugin)
  await ctx.plugin(NativeExecutor)
  await ctx.plugin(AgentLoop, { agents: [] })
  ctx.llm.registerAdapter(['subscription', 'api'], new Adapter())
  let rules = [rule]
  await installRedirects(ctx, () => rules)
  const toolSelections = [], promptSelections = []
  ctx.tools.register(defineTool({ name: 'target_only', description: 'Target-only fixture tool', parameters: {},
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] }, execute: async () => 'ok',
  }), { when: ({ modelSelection }) => { toolSelections.push(modelSelection); return modelSelection.provider === target.provider } })
  ctx.on('system-prompt/assemble', async (_assembly, context, next) => { promptSelections.push(context.modelSelection); return next() })
  const agent = await ctx.agentLoop.create('loop-redirect', source)
  assert.equal(agent.constructor.name, 'ReactLoopAgent')
  const errors = []
  ctx.on('agent/error', ({ error }) => errors.push(error.message))
  const send = async () => {
    agent.followup(createUserMessage({ content: [{ type: 'text', text: 'hello' }], source: { kind: 'user' } }))
    await agent.whenIdle()
    assert.deepEqual(errors, [])
  }
  await send()
  assert.equal(requests.length, 1)
  assert.equal(requests[0].provider, 'api')
  assert.equal(requests[0].model, 'model-b')
  assert.deepEqual(agent.model.current(), source)
  assert.deepEqual(toolSelections[0], target)
  assert.deepEqual(promptSelections[0], target)
  assert.equal(requests[0].tools.some(tool => tool.name === 'target_only'), true)
  assert.deepEqual(agent.session.requestHeader().config, target)
  const first = eventsOf(agent.session).find(event => event.type === 'assistant/message')
  assert.equal(first.data.message.source.provider, 'api')
  const history = ctx.sessionProjections.stateOf(agent.session, 'modelRedirects')
  assert.deepEqual(history.messages[first.data.message.id], { version: 1, from: source, to: target })
  rules = []
  await send()
  assert.equal(requests[1].provider, 'subscription')
  assert.equal(requests[1].model, 'model-a')
  assert.deepEqual(agent.model.current(), source)
  assert.deepEqual(promptSelections[1], source)
  assert.deepEqual(requests[1].tools, undefined)
})

test('验证目标期间的未来用户选择保留，当前步骤仍用捕获的重定向', async () => {
  const f = await fixture()
  const future = { provider: 'future', model: 'future-model' }
  f.onResolve(async () => { f.agent.model.select(future) })
  assert.deepEqual((await f.assemble()).variables, target)
  assert.deepEqual(f.agent.model.current(), future)
  assert.deepEqual(await f.request(), target)
  assert.deepEqual(f.agent.model.current(), future)
})

test('缺少步骤模型解析能力时加载即拒绝，不静默跳过规则', async () => {
  await assert.rejects(fixture([], 0), /require a DSH driver with agent\/resolve-model/)
})
