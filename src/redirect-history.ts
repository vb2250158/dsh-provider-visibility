/** 从已记录的路由通知与实际回复来源重建重定向尾注。 */
import { z } from 'zod'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'
import { sameRoute } from './redirect-rules.ts'

export const REDIRECT_PRODUCER = 'dsh-provider-visibility'
const routeSchema = z.object({ provider: z.string().min(1), model: z.string().min(1) })
export const redirectRecordSchema = z.object({ version: z.literal(1), from: routeSchema, to: routeSchema })
export type RedirectRecord = z.infer<typeof redirectRecordSchema>
const historySchema = z.record(z.string(), redirectRecordSchema)
const stateSchema = z.object({ current: redirectRecordSchema.nullable(), messages: historySchema })
export type RedirectHistoryState = z.infer<typeof stateSchema>
const runningSchema = z.object({ turn: z.number(), step: z.number(), record: redirectRecordSchema.nullable() }).nullable()
type RunningRedirect = z.infer<typeof runningSchema>

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionStateMap { modelRedirects: RedirectHistoryState }
  interface SessionProjectionMap { modelRedirects: RedirectHistoryState['messages'] }
  interface SessionProjectionStateMap { runningModelRedirect: RunningRedirect }
  interface SessionProjectionMap { runningModelRedirect: RunningRedirect }
}

/** 只给来源与路由通知一致的实际模型回复添加尾注，失败请求不产生回复记录。 */
export function foldRedirectHistory(state: RedirectHistoryState, event: SessionEvent): RedirectHistoryState {
  if (event.type === 'step/start') return { ...state, current: null }
  if (event.type === 'user/message' && event.data.source.kind === 'plugin'
    && event.data.source.plugin === REDIRECT_PRODUCER) {
    const block = event.data.content[0]
    if (block?.type !== 'text') return state
    let value: unknown
    try { value = JSON.parse(block.text) } catch { return state }
    const parsed = redirectRecordSchema.safeParse(value)
    return parsed.success ? { ...state, current: parsed.data } : state
  }
  if (event.type !== 'assistant/message' || state.current === null) return state
  const source = event.data.message.source
  if (source.kind !== 'model' || !sameRoute(source, state.current.to)) return state
  return { ...state, messages: { ...state.messages, [event.data.message.id]: state.current } }
}

/** 投影只读取会话记录；修改规则不会重算已有回复的路由。 */
export const redirectHistoryProjection = {
  key: 'modelRedirects', stateSchema, stateVersion: 1,
  init: () => ({ current: null, messages: {} }),
  apply: foldRedirectHistory,
  wire: { viewSchema: historySchema, view: state => state.messages },
} satisfies ProjectionDefinition<'modelRedirects', RedirectHistoryState>

/** 当前请求的重定向通知按轮次和步骤定位，下一步开始即清除旧通知。 */
export const runningRedirectProjection = {
  key: 'runningModelRedirect', stateSchema: runningSchema, stateVersion: 1,
  init: () => null,
  apply: (state, event) => {
    if (event.type === 'step/start') return { turn: event.data.turn, step: event.data.step, record: null }
    if (state === null) return null
    const folded = foldRedirectHistory({ current: state.record, messages: {} }, event)
    return folded.current === state.record ? state : { ...state, record: folded.current }
  },
  wire: { viewSchema: runningSchema, view: state => state },
} satisfies ProjectionDefinition<'runningModelRedirect', RunningRedirect>
