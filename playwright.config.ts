import { defineConfig, devices } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load .env.local into process.env so Playwright tests can read credentials.
// Next.js does this automatically for the app, but Playwright runs in a
// separate Node.js process that doesn't benefit from Next.js env loading.
const envFile = resolve(__dirname, '.env.local');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !(key in process.env)) process.env[key] = val;
  }
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    // ----------------------------------------------------------------
    // Auth setup projects — each runs ONCE to save a Firebase auth
    // token to disk, avoiding per-test password-verification calls
    // that exhaust the Firebase Spark plan quota.
    // ----------------------------------------------------------------
    {
      name: 'user-setup',
      testMatch: '**/setup/user.setup.ts',
    },
    {
      name: 'admin-setup',
      testMatch: '**/setup/admin.setup.ts',
    },

    // ----------------------------------------------------------------
    // User-facing test projects (filtering / matching / requests).
    // Load the pre-authenticated storage state from the setup step.
    // Moderation tests are intentionally excluded — they sign in as
    // admin and must NOT inherit the user storage state.
    // ----------------------------------------------------------------
    {
      name: 'Desktop Chrome',
      testMatch: ['**/filtering.spec.ts', '**/matching.spec.ts', '**/requests.spec.ts', '**/my-listings.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['user-setup'],
    },
    {
      name: 'Mobile Chrome',
      testMatch: ['**/filtering.spec.ts', '**/matching.spec.ts', '**/requests.spec.ts', '**/my-listings.spec.ts'],
      use: {
        ...devices['Pixel 5'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['user-setup'],
    },

    // ----------------------------------------------------------------
    // Admin test project — moderation tests only.
    // No storage state: loginAsAdmin() signs in fresh each test so
    // the admin Firebase session is cleanly scoped.
    // Requires ADMIN_EMAIL + ADMIN_PASSWORD in .env.local to run.
    //
    // Depends on admin-setup (for storageState) and on Desktop/Mobile Chrome
    // so it runs AFTER all user-facing tests — admin tests mutate seed data
    // (approve/reject/pause/archive) and must not race with tests that assert
    // on that same data. Use --no-deps to run admin tests in isolation.
    // ----------------------------------------------------------------
    {
      name: 'Admin Chrome',
      testMatch: ['**/moderation.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['admin-setup', 'Desktop Chrome', 'Mobile Chrome'],
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
