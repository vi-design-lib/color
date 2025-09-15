import { defineConfig } from 'vite'

export default defineConfig({
  define: { __VERSION__: JSON.stringify(process.env.npm_package_version) },
  build: {
    emptyOutDir: false,
    lib: {
      entry: 'src/index.ts',
      name: 'Color',
      fileName: (format) => `color.${format}.js`,
      formats: ['umd']
    }
  }
})
