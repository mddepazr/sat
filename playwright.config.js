import { defineConfig } from '@playwright/test';
import fs from 'node:fs';

const installedChromium = '/snap/chromium/current/usr/lib/chromium-browser/chrome';
export default defineConfig({
  testDir: './tests',
  testIgnore: '**/responsive.spec.js',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30000,
  expect: { timeout: 6000 },
  reporter: [['list'], ['json', { outputFile: 'evidencias/playwright-results.json' }]],
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 20000,
  },
  use: {
    baseURL: 'http://127.0.0.1:5173',
    browserName: 'chromium',
    headless: true,
    reducedMotion: 'reduce',
    locale: 'es-GT',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH || (fs.existsSync(installedChromium) ? installedChromium : undefined),
      args: ['--no-sandbox'],
    },
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1520, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
