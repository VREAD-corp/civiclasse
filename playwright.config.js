// Local: BASE_URL defaults to the built dist/ served by scripts/serve.mjs. Live: BASE_URL=https://outils.vread.fr/civiclasse/
import { defineConfig } from '@playwright/test';
const BASE_URL = process.env.BASE_URL || 'http://localhost:4174/civiclasse/';
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  use: { baseURL: BASE_URL, locale: 'fr-FR' },
  webServer: process.env.BASE_URL ? undefined : { command: 'PORT=4174 node scripts/serve.mjs', url: 'http://localhost:4174/civiclasse/', reuseExistingServer: true },
});
