/** 在步骤准备前解析有效模型，保留用户选择和请求级通知。 */
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-agent-loop'
import { createUserMessage, boundContextSummary } from '@deepseek-ai/dsh-llm'
import { redirectHistoryProjection, runningRedirectProjection, REDIRECT_PRODUCER, type RedirectRecord } from './redirect-history.ts'
import { redirectRoute, sameRoute, validateRedirectRules, type RedirectRule } from './redirect-rules.ts'

/** 规则在工具和提示词装配前固定；用户的新选择留给下一步。 */
export async function installRedirects(ctx: Context, getRules: () => readonly RedirectRule[]): Promise<void> {
  if (ctx.agentLoop.modelResolutionVersion !== 1) throw new Error('Model redirects require a DSH driver with agent/resolve-model before step preparation')
  await ctx.sessionProjections.register(redirectHistoryProjection)
  await ctx.sessionProjections.register(runningRedirectProjection)
  const prepared = new WeakMap<Agent, RedirectRecord>()
  ctx.on('agent/resolve-model', async ({ agent, sourceSelection, signal }, next) => {
    const rules = [...getRules()]
    validateRedirectRules(rules)
    const selected = await next()
    signal.throwIfAborted()
    const from = { provider: selected.provider, model: selected.model }
    const to = redirectRoute(from, rules)
    if (sameRoute(from, to)) {
      prepared.delete(agent)
      return selected
    }
    const effective = { ...selected, ...to }
    // 在工具条件与提示词读取目标之前拒绝无效目标，不回退到来源。
    await ctx.llm.resolveCallConfig(effective, signal)
    signal.throwIfAborted()
    const current = agent.model.current()
    // 请求头记录有效目标；未使用的来源选择保留给下一步和规则删除。
    // 等待验证期间的新用户选择不能被旧步骤的来源覆盖。
    if (sameRoute(current, sourceSelection) && current?.reasoningEffort === sourceSelection.reasoningEffort) {
      agent.model.select(sourceSelection)
    }
    prepared.set(agent, { version: 1, from, to })
    return effective
  }, { prepend: true })
  ctx.on('agent/request', async ({ agent, signal }, next) => {
    const proposed = await next()
    signal.throwIfAborted()
    const record = prepared.get(agent)
    if (record === undefined) return proposed
    agent.session.append('user/message', createUserMessage({
      content: [{ type: 'text', text: JSON.stringify(record) }],
      source: { kind: `plugin:${REDIRECT_PRODUCER}`, form: 'notice',
        summary: boundContextSummary(`模型重定向：${record.from.provider}/${record.from.model} → ${record.to.provider}/${record.to.model}`) },
    }), { surfaceOp: 'append' })
    return proposed
  }, { prepend: true })
}
