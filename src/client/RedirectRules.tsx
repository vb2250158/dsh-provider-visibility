/** 重定向规则编辑器；模型下拉由模型选择插件提供。 */
import * as React from 'react'
import { Button, Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ModelCatalog, ModelSelection } from '@deepseek-ai/dsh-api-remotes/client'
import type { PropsRenderSlots } from '@deepseek-ai/dsh-client-ui-slots'
import { validateRedirectRules, type RedirectRule } from '../redirect-rules.ts'
import type { ProviderVisibilityKey } from './locales.ts'
import styles from './ProviderVisibilitySection.module.css'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    'settings.model-redirect.picker': {
      kind: 'single'; scope: 'root'
      owner: { groups: ModelCatalog['groups']; current: ModelSelection | null; locked: boolean; select: (selection: ModelSelection) => void }
    }
  }
}

interface Props extends PropsRenderSlots<'settings.model-redirect.picker'> {
  groups: ModelCatalog['groups']
  rules: readonly RedirectRule[]
  writable: boolean
  save: (rules: RedirectRule[]) => Promise<void>
  t: (key: ProviderVisibilityKey) => string
}

/** 以提供商和模型的目录显示名称呈现规则，缺失目录时保留 id。 */
export function routeName(groups: ModelCatalog['groups'], provider: string, model?: string): string {
  const group = groups.find(group => group.id === provider)
  return model === undefined ? group?.name ?? provider
    : `${group?.models.find(entry => entry.id === model)?.name ?? model} · ${group?.name ?? provider}`
}

/** 保存成功才清空草稿；移除只改规则，不改已有会话。 */
export function RedirectRules({ groups, rules, writable, save, t, renderSlot }: Props) {
  const [from, setFrom] = React.useState<ModelSelection | null>(null)
  const [to, setTo] = React.useState<ModelSelection | null>(null)
  const [allModels, setAllModels] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [feedback, setFeedback] = React.useState<string | null>(null)
  const hintId = React.useId()
  const persist = async (next: RedirectRule[], clear: boolean) => {
    setBusy(true); setError(null); setFeedback(null)
    try {
      validateRedirectRules(next)
      await save(next)
      if (clear) { setFrom(null); setTo(null); setAllModels(false) }
      setFeedback(t(clear ? 'redirect.saved' : 'redirect.removed'))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setError(message === 'redirect.duplicate' || message === 'redirect.self' || message === 'redirect.empty' ? t(message) : message)
    } finally { setBusy(false) }
  }
  return <section className={styles.panel} aria-label={t('redirect.title')} aria-busy={busy}>
    <h3 className={styles.title}>{t('redirect.title')}</h3>
    <p className={styles.hint}>{t('redirect.hint')}</p>
    <ul className={styles.rows}>{rules.map((rule, index) => <li className={styles.row} key={JSON.stringify([rule.sourceProvider, rule.sourceModel])}>
      <span className={styles.identity}>
        <span>{routeName(groups, rule.sourceProvider, rule.sourceModel)}{rule.sourceModel === undefined ? ` · ${t('redirect.all')}` : ''}</span>
        <span>→ {routeName(groups, rule.targetProvider, rule.targetModel)}</span>
      </span>
      <Button variant="outline" size="sm" disabled={!writable || busy} onClick={() => { void persist(rules.filter((_, position) => position !== index), false) }}>{t('redirect.remove')}</Button>
    </li>)}</ul>
    {rules.length === 0 && <p className={styles.hint}>{t('redirect.none')}</p>}
    <div className={styles.redirectForm}>
      <div><p>{t('redirect.from')}</p>{renderSlot('settings.model-redirect.picker', { groups, current: from, locked: !writable || busy, select: setFrom })}</div>
      <div><p>{t('redirect.to')}</p>{renderSlot('settings.model-redirect.picker', { groups, current: to, locked: !writable || busy, select: setTo })}</div>
    </div>
    <div className={styles.formFooter}>
    <label className={styles.scopeOption}><Switch checked={allModels} disabled={!writable || busy} onChange={setAllModels} label={t('redirect.all')} /><span>{t('redirect.all')}</span></label>
    <Button variant="primary" size="md" aria-describedby={hintId} disabled={!writable || busy || from === null || to === null} onClick={() => {
      if (from === null || to === null) return
      void persist([...rules, { sourceProvider: from.provider, ...(allModels ? {} : { sourceModel: from.model }), targetProvider: to.provider, targetModel: to.model }], true)
    }}>{t(busy ? 'saving' : 'redirect.add')}</Button>
    </div>
    <p id={hintId} className={styles.hint}>{t(from === null || to === null ? 'redirect.chooseHint' : allModels ? 'redirect.scopeHint' : 'redirect.exactHint')}</p>
    {feedback !== null && <p role="status" className={styles.feedback}>{feedback}</p>}
    {error !== null && <p role="alert" className={styles.error}>{error}</p>}
  </section>
}
