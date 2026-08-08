import { defineConfig } from 'vitest/config'

// Separate config for security-rule / Firebase Emulator integration tests:
// these run in Node (not jsdom) and talk to local emulators, so they are
// kept out of the fast unit/component test loop (vitest.config.ts).
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/rules/**/*.spec.ts'],
    testTimeout: 20000,
    hookTimeout: 20000,
  },
})
