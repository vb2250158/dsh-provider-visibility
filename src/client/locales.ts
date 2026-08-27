/** Copy for the provider-display settings page. */

export const en = {
  nav: 'Model list',
  title: 'Model list',
  intro: 'Choose which providers appear in the model selector.',
  hiddenHint: 'Hidden providers remain available to existing routes and direct model requests.',
  show: 'Show',
  hide: 'Hide',
  showProvider: 'Show {provider}',
  hideProvider: 'Hide {provider}',
  active: 'Available',
  inactive: 'Not configured',
  providerId: 'Provider ID: {provider}',
  readOnly: 'Provider display settings are read-only in this deployment.',
  unavailable: 'Provider display settings are unavailable.',
  loadFailed: 'Loading the provider list failed',
  retry: 'Retry',
  empty: 'No providers are registered.',
} as const

export type ProviderVisibilityKey = keyof typeof en

export const zh: { [Key in ProviderVisibilityKey]: string } = {
  nav: '模型列表',
  title: '模型列表',
  intro: '选择哪些提供方显示在模型选择器中。',
  hiddenHint: '隐藏提供方仍可供已有路由和直接指定模型使用。',
  show: '显示',
  hide: '隐藏',
  showProvider: '显示 {provider}',
  hideProvider: '隐藏 {provider}',
  active: '可用',
  inactive: '未配置',
  providerId: '提供方 ID：{provider}',
  readOnly: '当前部署的提供方显示设置为只读。',
  unavailable: '提供方显示设置不可用。',
  loadFailed: '加载提供方列表失败',
  retry: '重试',
  empty: '当前没有已注册的提供方。',
}
