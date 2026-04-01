/**
 * User Authentication Setup
 * -------------------------
 * Runs ONCE before the test suite. Signs in as the test user, then saves the
 * browser storage state (including Firebase auth tokens) to a file on disk.
 *
 * All user-facing test projects load this saved state via `storageState` in
 * playwright.config.ts, so individual tests never need to call
 * signInWithEmailAndPassword — the Firebase SDK re-authenticates from the
 * cached token. This avoids the Firebase password-verification quota limits
 * that occur when many tests sign in in parallel.
 */

import { test as setup } from '@playwright/test';
import path from 'path';
import { loginAsUser } from '../helpers';

export const USER_AUTH_FILE = path.join(
  __dirname,
  '../../../playwright/.auth/user.json',
);

// Give the setup step a generous timeout — it must complete a full sign-in
// round-trip to Firebase (auth + Firestore profile fetch) before saving state.
setup.setTimeout(60_000);

setup('sign in as test user', async ({ page }) => {
  // loginAsUser already handles form-scoped error detection and the
  // waitForURL race, so we don't need to duplicate that logic here.
  await loginAsUser(page);

  // Persist the auth state (localStorage + cookies) so test projects can
  // start already signed in without another password-verification round-trip.
  await page.context().storageState({ path: USER_AUTH_FILE });
});
