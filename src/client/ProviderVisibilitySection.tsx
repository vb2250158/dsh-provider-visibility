/** Settings page that controls provider visibility in model selectors. */

import * as React from 'react'
import type { ReactNode } from 'react'
import type { InjectFace } from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import { DEFAULT_HIDDEN_PROVIDERS } from '../provider-visibility-shared.ts'
import type { ProviderVisibilitySettings } from '../provider-visibility.ts'
import type { ProviderVisibilityStore } from './store.ts'
import type { ProviderVisibilityKey } from './locales.ts'
import styles from './ProviderVisibilitySection.module.css'

/** Injected dependencies for the settings section. */
export interface ProviderVisibilitySectionInjected {
  controller: ProviderVisibilityStore
  hooks: {
    /** Provider directory snapshot bound by the platform renderer. */
    snapshot: ProviderVisibilityStore['store']
  }
  /** Durable visibility settings for this settings page. */
  settings: SettingsScope<ProviderVisibilitySettings>
  setProviderVisible: (provider: string, visible: boolean) => Promise<void>
  t: (key: ProviderVisibilityKey) => string
}

/** Slot props delivered by the settings shell. */
export type ProviderVisibilitySectionProps = Partial<InjectFace<ProviderVisibilitySectionInjected>>

type ProviderVisibilitySectionFace = InjectFace<ProviderVisibilitySectionInjected>

function format(template: string, provider: string): string {
  return template.replace('{provider}', () => provider)
}

/** Render the provider visibility settings page. */
export function ProviderVisibilitySection(props: ProviderVisibilitySectionProps): ReactNode {
  const { controller, useSnapshot, settings, setProviderVisible, t } = props
  if (controller === undefined || useSnapshot === undefined || settings === undefined
    || setProviderVisible === undefined || t === undefined) return null
  return <Loaded injected={{ controller, useSnapshot, settings, setProviderVisible, t }} />
}

function Loaded({ injected }: { injected: ProviderVisibilitySectionFace }): ReactNode {
  const { controller, setProviderVisible, t } = injected
  const state = injected.useSnapshot(snapshot => snapshot)
  const settings = injected.settings.getSnapshot()
  const [pending, setPending] = React.useState<string | undefined>(undefined)

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
  const settingsNotice = settings.status === 'unavailable'
    ? t('unavailable')
    : settings.status === 'ready' && !settings.writable
      ? t('readOnly')
      : undefined

  return (
    <div className={styles['section']}>
      <h2 className={styles['title']}>{t('title')}</h2>
      <p className={styles['intro']}>{t('intro')}</p>
      <p className={styles['hint']}>{t('hiddenHint')}</p>
      {settingsNotice === undefined ? null : <p className={styles['notice']}>{settingsNotice}</p>}
      <ul className={styles['rows']}>
        {state.providers.map((provider) => {
          const visible = !hidden.has(provider.provider)
          return (
            <li key={provider.provider} className={styles['row']}>
              <span className={styles['identity']}>
                <span className={styles['name']}>{provider.displayName}</span>
                <span className={styles['meta']}>{format(t('providerId'), provider.provider)}</span>
              </span>
              <span className={styles['state']}>{t('active')}</span>
              <label className={styles['action']}>
                <span>{visible ? t('show') : t('hide')}</span>
                <input
                  type="checkbox"
                  className={styles['toggle']}
                  checked={visible}
                  disabled={!writable || pending !== undefined}
                  aria-label={format(visible ? t('hideProvider') : t('showProvider'), provider.displayName)}
                  onChange={() => {
                    setPending(provider.provider)
                    void setProviderVisible(provider.provider, !visible).finally(() => { setPending(undefined) })
                  }}
                />
              </label>
            </li>
          )
        })}
      </ul>
      {state.status === 'ready' && state.providers.length === 0 ? <p className={styles['hint']}>{t('empty')}</p> : null}
    </div>
  )
}
