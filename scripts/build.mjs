import { build } from 'esbuild'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(repositoryRoot, 'src/client/index.ts')
const output = resolve(repositoryRoot, 'lib/client.js')
const moduleId = 'dsh-provider-visibility'
const styleId = `${moduleId}/ProviderVisibilitySection.module.css`

const result = await build({
  entryPoints: [source],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  write: false,
  outdir: resolve(repositoryRoot, '.tmp-provider-visibility-build'),
  sourcemap: false,
  legalComments: 'none',
  loader: { '.css': 'local-css' },
  external: ['react', 'react/jsx-runtime', '@deepseek-ai/*'],
  logLevel: 'silent',
})

const javascript = result.outputFiles.find(file => file.path.endsWith('.js'))
const stylesheet = result.outputFiles.find(file => file.path.endsWith('.css'))
if (javascript === undefined || stylesheet === undefined) throw new Error('Provider visibility bundle did not produce JavaScript and CSS')
const artifact = `window.__ModuleLoader__.load({\n  id: ${JSON.stringify(moduleId)},\n  factory: (require) => {\n    if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css=${JSON.stringify(styleId)}]') === null) {\n      const tag = document.createElement('style')\n      tag.dataset.plugin = ${JSON.stringify(moduleId)}\n      tag.dataset.pluginCss = ${JSON.stringify(styleId)}\n      tag.textContent = ${JSON.stringify(stylesheet.text)}\n      document.head.appendChild(tag)\n    }\n    var module = { exports: {} }\n    var exports = module.exports\n${javascript.text}\n    return module.exports\n  },\n})\n`

await mkdir(dirname(output), { recursive: true })
await writeFile(output, artifact)
console.log(`Built ${output}`)
