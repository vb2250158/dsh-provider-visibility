import { useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { RedirectRules } from '../src/client/RedirectRules.tsx'
import { zh } from '../src/client/locales.ts'
import { ProviderVisibilitySection } from '../src/client/ProviderVisibilitySection.tsx'
import { decodeProviderVisibility } from '../src/provider-visibility-shared.ts'

afterEach(cleanup)

it('已解析的可写设置启用提供商勾选和模型下拉，保存回读后可再次切换', async () => {
  let snapshot = { status: 'ready', writable: true, value: decodeProviderVisibility({ hiddenProviders: ['api'], redirects: [] }) }
  const listeners = new Set<() => void>()
  const setProviderVisible = vi.fn(async (provider, visible) => {
    snapshot = { ...snapshot, value: { ...snapshot.value!, hiddenProviders: visible ? [] : [provider] } }
    for (const listener of listeners) listener()
  })
  render(<ProviderVisibilitySection controller={{ load: async () => {} } as never}
    useSnapshot={select => select({ status: 'ready', providers: [{ provider: 'api', displayName: 'API' }], groups, error: null })}
    settings={{ getSnapshot: () => snapshot, subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) } } as never}
    setProviderVisible={setProviderVisible} saveRedirects={async () => {}} renderSlot={picker as never} t={key => zh[key]} />)
  const checkbox = screen.getByRole('switch', { name: '显示 API' }) as HTMLButtonElement
  expect(checkbox.disabled).toBe(false)
  expect(checkbox.getAttribute('aria-checked')).toBe('false')
  expect((screen.getAllByText('pick')[0] as HTMLButtonElement).disabled).toBe(false)
  fireEvent.click(checkbox)
  await waitFor(() => { expect(checkbox.getAttribute('aria-checked')).toBe('true'); expect(checkbox.disabled).toBe(false) })
  fireEvent.click(checkbox)
  await waitFor(() => { expect(checkbox.getAttribute('aria-checked')).toBe('false'); expect(checkbox.disabled).toBe(false) })
  expect(setProviderVisible.mock.calls).toEqual([['api', true], ['api', false]])
})
const groups = [{ id: 'subscription', name: 'Subscription', models: [{ id: 'a', name: 'Model A' }] }, { id: 'api', name: 'API', models: [{ id: 'b', name: 'Model B' }] }]
const picker = (_name, props) => <button disabled={props.locked} onClick={() => props.select(props.current === null ? { provider: 'subscription', model: 'a' } : { provider: 'api', model: 'b' })}>{props.current?.model ?? 'pick'}</button>

it('设置加载时说明禁用原因，不把未读取的隐藏列表显示为全部开启', () => {
  const snapshot = { status: 'loading', writable: false, value: undefined }
  render(<ProviderVisibilitySection controller={{ load: async () => {} } as never}
    useSnapshot={select => select({ status: 'ready', providers: [{ provider: 'api', displayName: 'API' }], groups, error: null })}
    settings={{ getSnapshot: () => snapshot, subscribe: () => () => {} } as never}
    setProviderVisible={async () => {}} saveRedirects={async () => {}} renderSlot={picker as never} t={key => zh[key]} />)
  expect(screen.getByRole('status').textContent).toBe(zh.loading)
  expect(screen.queryByRole('switch', { name: '隐藏 API' })).toBeNull()
  expect((screen.getAllByText('pick')[0] as HTMLButtonElement).disabled).toBe(true)
})

it('提供商保存失败显示错误，解除忙碌状态并保留原值', async () => {
  const snapshot = { status: 'ready', writable: true, value: { hiddenProviders: [], redirects: [] } }
  render(<ProviderVisibilitySection controller={{ load: async () => {} } as never}
    useSnapshot={select => select({ status: 'ready', providers: [{ provider: 'api', displayName: 'API' }], groups, error: null })}
    settings={{ getSnapshot: () => snapshot, subscribe: () => () => {} } as never}
    setProviderVisible={async () => { throw new Error(zh.saveFailed) }} saveRedirects={async () => {}} renderSlot={picker as never} t={key => zh[key]} />)
  const toggle = screen.getByRole('switch', { name: '隐藏 API' }) as HTMLButtonElement
  fireEvent.click(toggle)
  await waitFor(() => { expect(screen.getByRole('alert').textContent).toBe(zh.saveFailed); expect(toggle.disabled).toBe(false) })
  expect(toggle.getAttribute('aria-checked')).toBe('true')
  expect(screen.queryByText(zh.saved)).toBeNull()
})

it('添加提供商规则后回读显示，移除恢复空列表', async () => {
  const saved = vi.fn()
  function Editor() {
    const [rules, setRules] = useState([])
    return <RedirectRules groups={groups} rules={rules} writable t={key => zh[key]}
      save={async next => { saved(next); setRules(next) }} renderSlot={picker} />
  }
  render(<Editor />)
  fireEvent.click(screen.getAllByText('pick')[0])
  fireEvent.click(screen.getByText('pick'))
  fireEvent.click(screen.getAllByText('a')[1])
  fireEvent.click(screen.getByRole('switch'))
  fireEvent.click(screen.getByRole('button', { name: '添加规则' }))
  await waitFor(() => expect(saved).toHaveBeenCalledWith([{ sourceProvider: 'subscription', targetProvider: 'api', targetModel: 'b' }]))
  expect(screen.getByText('→ Model B · API')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: '移除' }))
  await waitFor(() => expect(saved).toHaveBeenLastCalledWith([]))
  expect(screen.getByText('尚未设置重定向规则。')).toBeTruthy()
})

it('保存失败显示错误并保留来源与目标草稿', async () => {
  render(<RedirectRules groups={groups} rules={[]} writable t={key => zh[key]}
    save={async () => { throw new Error('write rejected') }} renderSlot={picker} />)
  fireEvent.click(screen.getAllByText('pick')[0])
  fireEvent.click(screen.getByText('pick'))
  fireEvent.click(screen.getAllByText('a')[1])
  fireEvent.click(screen.getByRole('button', { name: '添加规则' }))
  await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('write rejected'))
  expect(screen.getByText('a')).toBeTruthy()
  expect(screen.getByText('b')).toBeTruthy()
})
