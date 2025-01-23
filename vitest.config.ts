import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['vitest-dynamodb-lite', 'test/setup.ts'],
  },
})
