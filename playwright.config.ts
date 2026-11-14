import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  reporter: [['line'], ['json', { outputFile: 'test-results/browser-results.json' }]],
  timeout: 60_000,
  expect: { timeout: 30_000 },
  use: { baseURL: 'http://127.0.0.1:3000', channel: 'chrome', headless: true, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: 'npm run start -- --hostname 127.0.0.1', url: 'http://127.0.0.1:3000', reuseExistingServer: !process.env.CI, timeout: 60_000 },
});
