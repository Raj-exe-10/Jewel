import { defineConfig, devices } from '@playwright/test'

// End-to-end smoke tests (Phase 4/US3 T043, T052) run against a locally
// built/served app pointed at the Firebase Emulator Suite — see
// specs/001-amore-jewelry-catalogue/quickstart.md for the manual setup this
// mirrors in CI-less local development.
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
})
