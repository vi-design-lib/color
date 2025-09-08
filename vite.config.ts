import { defineConfig } from 'vite'

export default defineConfig({
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
