/** 使用已安装的 DSH 声明或指定源码生成本插件的 Host/Client 声明。 */
import ts from 'typescript'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(root, 'src')
for (const face of ['host', 'client']) {
  let options = {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext,
    strict: true, jsx: ts.JsxEmit.ReactJSX, skipLibCheck: true,
  }
  if (process.env.DSH_SOURCE_ROOT) {
    const path = resolve(process.env.DSH_SOURCE_ROOT, face === 'host' ? 'tsconfig.base.json' : 'tsconfig.base.client.json')
    const config = ts.readConfigFile(path, ts.sys.readFile)
    options = { ...options, ...ts.parseJsonConfigFileContent(config.config, ts.sys, dirname(path)).options }
  }
  options = { ...options, declaration: true, emitDeclarationOnly: true, noEmit: false, noEmitOnError: false,
    declarationMap: false, sourceMap: false, composite: false, incremental: false, rootDir: undefined,
    outDir: resolve(root, 'lib/types'), noUnusedLocals: false, noUnusedParameters: false }
  const files = face === 'host' ? [resolve(source, 'index.ts'), resolve(source, 'invariant.ts')]
    : [resolve(source, 'client/index.ts'), resolve(source, 'client/css-modules.d.ts')]
  const program = ts.createProgram(files, options)
  const isOwn = file => !relative(source, file).startsWith('..')
  const errors = ts.getPreEmitDiagnostics(program).filter(diagnostic => diagnostic.file && isOwn(diagnostic.file.fileName))
  if (errors.length) throw new Error(ts.formatDiagnostics(errors, { getCanonicalFileName: value => value, getCurrentDirectory: () => root, getNewLine: () => '\n' }))
  const writes = []
  program.emit(undefined, (_name, text, _bom, _error, sourceFiles) => {
    const file = sourceFiles?.[0]
    if (!file || !isOwn(file.fileName)) return
    const output = resolve(root, 'lib/types', relative(source, file.fileName).replace(/\.tsx?$/, '.d.ts'))
    writes.push(mkdir(dirname(output), { recursive: true }).then(() => writeFile(output, text)))
  })
  await Promise.all(writes)
}
