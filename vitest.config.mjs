import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: { alias: { '@deepseek-ai/dsh-client-ui-primitives': fileURLToPath(new URL('./tests/primitives.tsx', import.meta.url)) } },
  test: { include: ['tests/*.spec.tsx'], environment: 'jsdom' },
})
