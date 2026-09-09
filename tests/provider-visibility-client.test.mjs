import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const clientBundleFile = new URL('../lib/client.js', import.meta.url)
const clientBundleUrl = clientBundleFile.href

async function loadClientBundle() {
  let loaded
  const styles = []
  const previousWindow = globalThis.window
  const previousDocument = globalThis.document
  globalThis.window = { __ModuleLoader__: { load: value => { loaded = value } } }
  globalThis.document = {
    querySelector: () => null,
    createElement: () => ({ dataset: {}, textContent: '' }),
    head: { appendChild: tag => { styles.push(tag) } },
  }
  try {
    await import(`${clientBundleUrl}?test=${Date.now()}-${Math.random()}`)
    assert.equal(loaded?.id, 'dsh-provider-visibility')
    const client = loaded.factory(id => {
      if (id === 'react') return {}
      if (id === 'react/jsx-runtime') return { jsx: () => null, jsxs: () => null }
      if (id === '@deepseek-ai/dsh-client-ui-primitives') return { Button: 'DshButton' }
      if (id === '@deepseek-ai/dsh-client-store') return {}
      throw new Error(`Unexpected provider visibility client dependency: ${id}`)
    })
    return { client, styles }
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
    if (previousDocument === undefined) delete globalThis.document
    else globalThis.document = previousDocument
  }
}

test('模型下拉设置浏览器模块只请求 DSH 浏览器平台依赖，并加载官方 Button 与自身样式表', async () => {
  const { client, styles } = await loadClientBundle()
  assert.deepEqual(client.inject, ['slots', 'locale', 'modelDirectories', 'remote', 'remote.session', 'sessions', 'settingsScope'])
  assert.doesNotMatch(await readFile(clientBundleFile, 'utf8'), /@deepseek-ai\/schemastery/)
  assert.equal(styles.length, 1)
  assert.match(styles[0].dataset.pluginCss, /ProviderVisibilitySection\.module\.css/)
  assert.match(styles[0].textContent, /border-radius: 12px/)
  const bundle = await readFile(clientBundleFile, 'utf8')
  assert.doesNotMatch(bundle, /llm\.providers/)
  assert.doesNotMatch(bundle, /useSettingsSnapshot/)
  assert.match(bundle, /var React = __toESM\(require\("react"\), 1\)/)
  assert.match(bundle, /hooks: \{ snapshot: controller\.store \},\r?\n\s*settings: scope/)
  assert.match(bundle, /directories\.directoryFor = \(sessionId\) => filterModelDirectory/)
  assert.match(bundle, /await ctx\.remote\.session\.modelCatalog\(\)/)
  assert.match(bundle, /groups: directory\.groups\.filter/)
  assert.match(bundle, /const models = await this\.loadCatalog\(\)/)
})
