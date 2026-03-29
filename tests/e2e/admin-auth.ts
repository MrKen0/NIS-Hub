import { type Page } from '@playwright/test';

/**
 * Log in as the admin user via the sign-in page.
 *
 * Reads credentials from environment variables:
 *   ADMIN_EMAIL    — admin account email
 *   ADMIN_PASSWORD — admin account password
 *
 * Usage in a test:
 *   import { loginAsAdmin } from './admin-auth';
 *   test.beforeEach(async ({ page }) => { await loginAsAdmin(page); });
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variables');
  }

  await page.goto('/auth/sign-in');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for redirect away from sign-in page
  await page.waitForURL((url) => !url.pathname.includes('/auth/sign-in'));
}
