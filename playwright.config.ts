import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: 'list',
  timeout: 30000,

  webServer: {
    command: 'npx vite --port 4199 --host',
    port: 4199,
    timeout: 30000,
    reuseExistingServer: true,
    cwd: '.',
  },

  use: {
    baseURL: 'http://localhost:4199',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
