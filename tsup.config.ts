import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  target: 'es2020',
  format: ['cjs'],
  shims: false,
  dts: false,
  external: [
    // 'vscode',
  ],
})
