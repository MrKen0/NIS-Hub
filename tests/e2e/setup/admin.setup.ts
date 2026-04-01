/**
 * Admin Authentication Setup
 * --------------------------
 * Runs ONCE before the Admin Chrome project. Signs in as the admin user,
 * then saves storage state to disk so all 5 moderation tests can reuse
 * the Firebase auth token without additional password-verification calls.
 *
 * Without this, each test's beforeEach called loginAsAdmin() — 5 sign-ins
 * per suite run, which exhausts the Firebase Spark plan quota on back-to-back
 * runs. This mirrors the same pattern used for the test user in user.setup.ts.
 */

import { test as setup } from '@playwright/test';
import path from 'path';
import { loginAsAdmin } from '../admin-auth';

export const ADMIN_AUTH_FILE = path.join(
  __dirname,
  '../../../playwright/.auth/admin.json',
);

setup.setTimeout(60_000);

setup('sign in as admin', async ({ page }) => {
  await loginAsAdmin(page);
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});
