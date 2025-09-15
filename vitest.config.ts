/**
 * @file Vitest 配置：使用 jsdom 环境
 */
import { defineConfig } from 'vitest/config'

export default defineConfig({
  define: { __VERSION__: JSON.stringify(process.env.npm_package_version) },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.{ts,tsx}']
  },
  optimizeDeps: {
    exclude: ['vitarx']
  }
})
