import { useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { RedirectRules } from '../src/client/RedirectRules.tsx'
import { zh } from '../src/client/locales.ts'

afterEach(cleanup)
const groups = [{ id: 'subscription', name: 'Subscription', models: [{ id: 'a', name: 'Model A' }] }, { id: 'api', name: 'API', models: [{ id: 'b', name: 'Model B' }] }]
const picker = (_name, props) => <button disabled={props.locked} onClick={() => props.select(props.current === null ? { provider: 'subscription', model: 'a' } : { provider: 'api', model: 'b' })}>{props.current?.model ?? 'pick'}</button>

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
