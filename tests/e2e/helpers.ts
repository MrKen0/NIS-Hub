import { expect, type Locator, type Page } from '@playwright/test';

// ---------- User auth helpers ----------

/**
 * Log in as a normal (non-admin) user via the sign-in page.
 *
 * Reads credentials from environment variables:
 *   TEST_USER_EMAIL    — user account email
 *   TEST_USER_PASSWORD — user account password
 *
 * The user must have completed onboarding.
 */
export async function loginAsUser(page: Page): Promise<void> {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing TEST_USER_EMAIL or TEST_USER_PASSWORD environment variables');
  }

  await page.goto('/auth/sign-in');

  // When storageState has a valid Firebase auth token, the client-side auth
  // guard redirects away from /auth/sign-in before the form is submitted.
  // Wait up to 4 s for that redirect to fire — if it does we're already
  // authenticated and can return without burning a password-verification call.
  const alreadyAuthed = await page
    .waitForURL((url) => !url.pathname.includes('/auth/sign-in'), { timeout: 4_000 })
    .then(() => true)
    .catch(() => false);

  if (alreadyAuthed) return;

  // No redirect yet — not authenticated via storageState; sign in with creds.
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Race between a successful redirect and an error alert appearing.
  // Failing fast on an error avoids hanging for the full 30 s timeout.
  //
  // NOTE: We scope the alert to *inside* the <form> to avoid matching the
  // Next.js App Router route-announcer, which is a page-level role="alert"
  // element that is always visible (but empty) for screen-reader navigation.
  const signInForm = page.locator('form');
  const errorAlert = signInForm.getByRole('alert');
  await Promise.race([
    page.waitForURL((url) => !url.pathname.includes('/auth/sign-in'), { timeout: 45_000 }),
    errorAlert.waitFor({ state: 'visible', timeout: 45_000 }).then(async () => {
      const msg = await errorAlert.textContent();
      throw new Error(`Sign-in failed: ${msg?.trim()}`);
    }),
  ]);
}

// ---------- Content creation helpers ----------

/** Navigate to the service creation form and fill required fields. */
export async function createTestService(_page: Page): Promise<void> {
  // TODO: go to /create/service, fill form, submit, wait for success
}

/** Navigate to the product creation form and fill required fields. */
export async function createTestProduct(_page: Page): Promise<void> {
  // TODO: go to /create/product, fill form, submit, wait for success
}

/** Navigate to the event creation form and fill required fields. */
export async function createTestEvent(_page: Page): Promise<void> {
  // TODO: go to /create/event, fill form, submit, wait for success
}

/**
 * Navigate to the request creation form, fill it, and submit.
 *
 * Returns after the success state is visible (the form is replaced
 * by the "Request posted!" message with the "See matching services" button).
 *
 * The caller must already be logged in.
 */
export async function createRequest(
  page: Page,
  opts: {
    text: string;
    category: string;
    location: string;
    whatsapp?: string;
  },
): Promise<void> {
  await page.goto('/create/request');

  // Fill description
  await page.getByLabel('What do you need?').fill(opts.text);

  // Select category
  await page.getByLabel('Category').selectOption(opts.category);

  // Select location
  await page.getByLabel('Location').selectOption(opts.location);

  // Fill WhatsApp number (required for form validation)
  if (opts.whatsapp) {
    await page.getByLabel('WhatsApp Number').fill(opts.whatsapp);
  }

  // Submit the form
  await page.getByRole('button', { name: /post request/i }).click();

  // If matching services exist the page shows a pre-submit preview screen
  // before the final success state.  Click "Post my request anyway" to
  // proceed whenever the preview appears, then fall through to the success
  // state check below.
  const postAnywayBtn = page.getByTestId('post-anyway-btn');
  const successBtn = page.getByTestId('see-matches-btn');

  // Race: preview or success — whichever arrives first
  await Promise.race([
    successBtn.waitFor({ state: 'visible', timeout: 15_000 }),
    postAnywayBtn.waitFor({ state: 'visible', timeout: 15_000 }).then(() =>
      postAnywayBtn.click(),
    ),
  ]);

  // Wait for the success state to appear (may already be visible)
  await expect(successBtn).toBeVisible({ timeout: 15_000 });
}

// ---------- Admin navigation helpers ----------

/** Navigate to the admin dashboard and click a specific tab. */
export async function goToAdminTab(
  page: Page,
  tab: 'services' | 'products' | 'events' | 'notices' | 'requests' | 'members',
): Promise<void> {
  await page.goto('/admin');
  await page.getByTestId(`tab-${tab}`).click();
}

// ---------- Status filter helpers ----------

/** Click a status filter pill within the current admin panel. */
export async function filterByStatus(
  page: Page,
  status: 'all' | 'pending' | 'approved' | 'rejected' | 'paused' | 'archived',
): Promise<void> {
  await page.getByTestId(`filter-${status}`).click();
}

// ---------- Card helpers ----------

/**
 * Navigate to the Services tab, filter to Pending,
 * wait for at least one card to appear, and return the first one.
 *
 * Throws a clear assertion error if no pending service listings exist.
 * The caller is responsible for being logged in as admin before calling this.
 */
export async function getFirstPendingCard(page: Page): Promise<Locator> {
  await goToAdminTab(page, 'services');
  await filterByStatus(page, 'pending');

  const cards = page.getByTestId('content-card');
  await expect(cards.first()).toBeVisible({
    timeout: 10_000,
  });

  return cards.first();
}

/**
 * Navigate to a given admin tab, apply a status filter,
 * wait for at least one content card, and return the first one.
 *
 * Use this for any tab that renders AdminContentCard (not Members).
 * Fails clearly if no matching items exist.
 */
export async function getFirstContentCard(
  page: Page,
  tab: 'services' | 'products' | 'events' | 'notices' | 'requests',
  status: 'all' | 'pending' | 'approved' | 'rejected' | 'paused' | 'archived',
): Promise<Locator> {
  await goToAdminTab(page, tab);
  await filterByStatus(page, status);

  const cards = page.getByTestId('content-card');
  await expect(cards.first()).toBeVisible({
    timeout: 10_000,
  });

  return cards.first();
}

/**
 * Navigate to the Members tab, apply a status filter,
 * wait for at least one member card, and return the first one.
 *
 * Members use data-testid="member-card" (not "content-card").
 * Fails clearly if no matching members exist.
 */
export async function getFirstMemberCard(
  page: Page,
  status: 'all' | 'pending' | 'approved' | 'paused' | 'archived',
): Promise<Locator> {
  await goToAdminTab(page, 'members');
  await filterByStatus(page, status);

  const cards = page.getByTestId('member-card');
  await expect(cards.first()).toBeVisible({
    timeout: 10_000,
  });

  return cards.first();
}
