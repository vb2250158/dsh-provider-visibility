/** Settings page that controls provider visibility in model selectors. */

import * as React from 'react'
import type { ReactNode } from 'react'
import type { InjectFace, PropsRenderSlots } from '@deepseek-ai/dsh-client-ui-slots'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import { Button, Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import { DEFAULT_HIDDEN_PROVIDERS } from '../provider-visibility-shared.ts'
import type { ProviderVisibilitySettings } from '../provider-visibility.ts'
import type { ProviderVisibilityStore } from './store.ts'
import type { ProviderVisibilityKey } from './locales.ts'
import styles from './ProviderVisibilitySection.module.css'
import { RedirectRules } from './RedirectRules.tsx'
import type { RedirectRule } from '../redirect-rules.ts'

/** Injected dependencies for the settings section. */
export interface ProviderVisibilitySectionInjected {
  controller: ProviderVisibilityStore
  hooks: {
    /** Provider directory snapshot bound by the platform renderer. */
    snapshot: ProviderVisibilityStore['store']
  }
  /** Durable visibility settings for this settings page. */
  settings: ConfigForm<ProviderVisibilitySettings>
  setProviderVisible: (provider: string, visible: boolean) => Promise<void>
  saveRedirects: (rules: RedirectRule[]) => Promise<void>
  t: (key: ProviderVisibilityKey) => string
}

/** Slot props delivered by the settings shell. */
export type ProviderVisibilitySectionProps = Partial<InjectFace<ProviderVisibilitySectionInjected>> & PropsRenderSlots<'settings.model-redirect.picker'>

type ProviderVisibilitySectionFace = InjectFace<ProviderVisibilitySectionInjected> & PropsRenderSlots<'settings.model-redirect.picker'>

function format(template: string, provider: string): string {
  return template.replace('{provider}', () => provider)
}

/** Render the provider visibility settings page. */
export function ProviderVisibilitySection(props: ProviderVisibilitySectionProps): ReactNode {
  const { controller, useSnapshot, settings, setProviderVisible, saveRedirects, renderSlot, t } = props
  if (controller === undefined || useSnapshot === undefined || settings === undefined
    || setProviderVisible === undefined || saveRedirects === undefined || t === undefined) return null
  return <Loaded injected={{ controller, useSnapshot, settings, setProviderVisible, saveRedirects, renderSlot, t }} />
}

function Loaded({ injected }: { injected: ProviderVisibilitySectionFace }): ReactNode {
  const { controller, setProviderVisible, t } = injected
  const state = injected.useSnapshot(snapshot => snapshot)
  const settings = React.useSyncExternalStore(
    listener => injected.settings.subscribe(listener), () => injected.settings.getSnapshot(),
  )
  const [pending, setPending] = React.useState<string | undefined>(undefined)
  const [feedback, setFeedback] = React.useState<string | null>(null)
  const [saveError, setSaveError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (state.status === 'idle') void controller.load()
  }, [controller, state.status])

  if (state.status === 'error') {
    return (
      <div className={styles['section']}>
        <p className={styles['error']}>{`${t('loadFailed')}: ${state.error ?? ''}`}</p>
        <Button variant="outline" size="sm" onClick={() => { void controller.load() }}>
          {t('retry')}
        </Button>
      </div>
    )
  }

  const hidden = new Set(settings.value?.hiddenProviders ?? DEFAULT_HIDDEN_PROVIDERS)
  const writable = settings.status === 'ready' && settings.writable
  const settingsNotice = settings.status === 'loading'
    ? t('loading')
    : settings.status === 'unavailable'
    ? t('unavailable')
    : settings.status === 'ready' && !settings.writable
      ? t('readOnly')
      : undefined

  return (
    <div className={styles['section']} data-provider-visibility-settings>
      <h2 className={styles['title']}>{t('title')}</h2>
      {settingsNotice === undefined ? null : <p role="status" className={styles['notice']}>{settingsNotice}</p>}
      <RedirectRules groups={state.groups} rules={settings.value?.redirects ?? []} writable={writable}
        save={injected.saveRedirects} renderSlot={injected.renderSlot} t={t} />
      <section className={styles['panel']} aria-label={t('providerTitle')}>
      <h3 className={styles['title']}>{t('providerTitle')}</h3>
      <p className={styles['intro']}>{t('intro')}</p>
      <p className={styles['hint']}>{t('hiddenHint')}</p>
      {state.status === 'loading' || state.status === 'idle' ? <p role="status" className={styles['hint']}>{t('loadingProviders')}</p> : null}
      <ul className={styles['rows']}>
        {(settings.value === undefined ? [] : state.providers).map((provider) => {
          const visible = !hidden.has(provider.provider)
          return (
            <li key={provider.provider} className={styles['row']}>
              <span className={styles['identity']}>
                <span className={styles['name']}>{provider.displayName}</span>
                <span className={styles['meta']}>{format(t('providerId'), provider.provider)}</span>
              </span>
              <label className={styles['action']}>
                <span>{pending === provider.provider ? t('saving') : visible ? t('show') : t('hide')}</span>
                <Switch
                  checked={visible}
                  disabled={!writable || pending !== undefined}
                  label={format(visible ? t('hideProvider') : t('showProvider'), provider.displayName)}
                  title={settingsNotice}
                  onChange={() => {
                    setPending(provider.provider)
                    setFeedback(null)
                    setSaveError(null)
                    void setProviderVisible(provider.provider, !visible)
                      .then(() => { setFeedback(t('saved')) })
                      .catch((error: unknown) => { setSaveError(error instanceof Error ? error.message : t('saveFailed')) })
                      .finally(() => { setPending(undefined) })
                  }}
                />
              </label>
            </li>
          )
        })}
      </ul>
      {feedback === null ? null : <p role="status" className={styles['feedback']}>{feedback}</p>}
      {saveError === null ? null : <p role="alert" className={styles['error']}>{saveError}</p>}
      {state.status === 'ready' && state.providers.length === 0 ? <p className={styles['hint']}>{t('empty')}</p> : null}
      </section>
    </div>
  )
}
