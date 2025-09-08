/**
 * @file Vitest 配置：使用 jsdom 环境
 */
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.tsx']
  },
  optimizeDeps: {
    exclude: ['vitarx']
  }
})
