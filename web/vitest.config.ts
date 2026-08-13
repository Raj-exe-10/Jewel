import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/unit/setup.ts'],
    include: ['tests/unit/**/*.spec.ts'],
    // The public storefront route lazily pulls in a lot of components
    // (carousels, icon sets, video tiles); the first dynamic import in a cold
    // test run can exceed Vitest's default.
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['tests/**', 'src/main.ts', '**/*.d.ts'],
    },
  },
})
