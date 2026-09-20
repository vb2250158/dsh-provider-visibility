/** 在模型请求准备前应用重定向，保留来源选择及请求级存档。 */
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { createUserMessage, boundContextSummary } from '@deepseek-ai/dsh-llm'
import type {} from '@deepseek-ai/dsh-api-session-controller'
import { redirectHistoryProjection, runningRedirectProjection, REDIRECT_PRODUCER, type RedirectRecord } from './redirect-history.ts'
import { redirectRoute, sameRoute, validateRedirectRules, type RedirectRule } from './redirect-rules.ts'

/** 规则与来源在提示词装配时固定；装配期间的设置变化留到下一步。 */
export function installRedirects(ctx: Context, getRules: () => readonly RedirectRule[]): void {
  ctx.effect(() => ctx.sessionProjections.register(redirectHistoryProjection))
  ctx.effect(() => ctx.sessionProjections.register(runningRedirectProjection))
  const prepared = new WeakMap<Agent, RedirectRecord>()
  ctx.on('system-prompt/assemble', async (_assembly, context, next) => {
    const agent = context.agent
    const pending = agent === undefined ? null : ctx.sessionProjections.stateOf(agent.session, 'modelSelection')?.pending
    const rules = [...getRules()]
    validateRedirectRules(rules)
    const assembled = await next()
    if (agent === undefined) return assembled
    const provider = pending?.provider ?? assembled.variables.provider
    const model = pending?.model ?? assembled.variables.model
    if (typeof provider !== 'string' || typeof model !== 'string') {
      prepared.delete(agent)
      return assembled
    }
    const from = { provider, model }
    const to = redirectRoute(from, rules)
    prepared.set(agent, { version: 1, from, to })
    return { ...assembled, variables: { ...assembled.variables, provider: to.provider, model: to.model } }
  }, { prepend: true })
  ctx.on('agent/request', async ({ agent, signal }, next) => {
    const proposed = await next()
    signal.throwIfAborted()
    const record = prepared.get(agent)
    if (record === undefined) return proposed
    const config = { ...proposed, ...record.to }
    if (sameRoute(record.from, record.to)) return config
    // 提前验证目标和档位，失败不会偷偷回退到来源提供商。
    await ctx.llm.resolveCallConfig(config, signal)
    signal.throwIfAborted()
    const pending = ctx.sessionProjections.stateOf(agent.session, 'modelSelection')?.pending
    if (pending == null) {
      agent.session.append('model/selection', {
        ...record.from,
        ...(proposed.reasoningEffort === undefined ? {} : { reasoningEffort: proposed.reasoningEffort }),
      })
    }
    agent.session.append('user/message', createUserMessage({
      content: [{ type: 'text', text: JSON.stringify(record) }],
      source: { kind: 'plugin', plugin: REDIRECT_PRODUCER, form: 'notice',
        summary: boundContextSummary(`模型重定向：${record.from.provider}/${record.from.model} → ${record.to.provider}/${record.to.model}`) },
    }), { surfaceOp: 'append' })
    return config
  }, { prepend: true })
}
