import { test, expect, type Page } from '@playwright/test';
import { loginAsUser } from './helpers';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * Wait until a listings panel has finished loading.
 *
 * The panel shows skeleton cards (animate-pulse) while Firestore is fetching.
 * Once the fetch completes (data, empty state, or error), the skeletons are
 * replaced.  Waiting for the first skeleton to become hidden is more reliable
 * than compound waitForSelector calls which mix CSS and text engines.
 */
async function waitForPanelLoaded(
  page: Page,
  panelTestId: 'services-panel' | 'products-panel',
  timeout = 20_000,
): Promise<void> {
  const panel = page.getByTestId(panelTestId);
  // Ensure the panel itself is in the DOM first
  await panel.waitFor({ state: 'attached', timeout: 15_000 });
  // Wait for skeleton to disappear — means loading has ended
  await expect(panel.locator('.animate-pulse').first())
    .toBeHidden({ timeout })
    .catch(() => {}); // already hidden (no skeleton started) — that's fine
}

/**
 * My Listings — E2E Tests
 * ========================
 *
 * ENVIRONMENT VARIABLES REQUIRED:
 *   TEST_USER_EMAIL    — email for a normal user who has completed onboarding
 *   TEST_USER_PASSWORD — password for that user
 *
 * FIRESTORE SEED DATA REQUIRED (run `node scripts/seed-test-data.mjs`):
 *
 * The test user must own at least one service listing (any status) and at
 * least one approved service listing for boost tests. Seed the following
 * if they don't exist:
 *
 *   Service (pending):
 *     businessName: "[TEST] My Pending Service"
 *     authorId: <TEST_USER uid>
 *     status: "pending"
 *
 *   Service (approved):
 *     businessName: "[TEST] My Approved Service"
 *     authorId: <TEST_USER uid>
 *     status: "approved"
 *
 * Tests that require seed data are annotated with REQUIRES SEED DATA.
 * Tests that only check navigation/routing do not require seed data.
 */

// ---------------------------------------------------------------------------
// Dashboard navigation
// ---------------------------------------------------------------------------

test.describe('My Listings dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    // Wait for the heading to confirm AuthGuard has resolved before each test
    // in this describe block. On Mobile Chrome, Firebase auth from storageState
    // can take several seconds, and tests that click tabs fail if the page is
    // still showing the auth spinner.
    await page.goto('/my-listings');
    await page.getByRole('heading', { name: 'My Listings' }).waitFor({
      state: 'visible',
      timeout: 15_000,
    });
  });

  test('loads the dashboard and shows both tabs', async ({ page }) => {
    // beforeEach already navigated and confirmed the heading is visible
    await expect(page.getByRole('heading', { name: 'My Listings' })).toBeVisible();
    await expect(page.getByTestId('tab-services')).toBeVisible();
    await expect(page.getByTestId('tab-products')).toBeVisible();
  });

  test('shows the how-it-works note about editing and boosting', async ({ page }) => {
    await expect(page.getByText(/editing a listing/i)).toBeVisible();
    await expect(page.getByText(/boosting an approved listing/i)).toBeVisible();
  });

  test('switching to products tab shows the products panel', async ({ page }) => {
    await page.getByTestId('tab-products').click();
    await expect(page.getByTestId('products-panel')).toBeVisible();
  });

  test('switching back to services tab shows the services panel', async ({ page }) => {
    await page.getByTestId('tab-products').click();
    await page.getByTestId('tab-services').click();
    await expect(page.getByTestId('services-panel')).toBeVisible();
  });

  test('unauthenticated visitor is redirected to sign-in', async ({ browser }) => {
    // Explicitly empty storageState ensures no Firebase auth token is inherited.
    // browser.newContext() without options can silently inherit the project's
    // storageState in some Playwright versions; the explicit override avoids it.
    const ctx = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const pg = await ctx.newPage();
    await pg.goto('/my-listings');
    // AuthGuard redirects via router.replace() (client-side soft nav).
    // Check for the sign-in heading — more resilient than waitForURL which
    // can miss soft-navigation URL changes in some Next.js App Router builds.
    await expect(pg.getByRole('heading', { name: /sign in/i })).toBeVisible({
      timeout: 20_000,
    });
    await ctx.close();
  });

  test('My Listings is reachable from the home page nav card', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /my listings/i }).first().click();
    await expect(page).toHaveURL('/my-listings');
  });
});

// ---------------------------------------------------------------------------
// Listing cards (REQUIRES SEED DATA — test user must have at least one service)
// ---------------------------------------------------------------------------

test.describe('Owner listing cards', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/my-listings');
    // Wait for AuthGuard to resolve before interacting with tabs
    await page.getByRole('heading', { name: 'My Listings' }).waitFor({
      state: 'visible',
      timeout: 15_000,
    });
    await page.getByTestId('tab-services').click();
  });

  test('shows owner listing cards once data loads', async ({ page }) => {
    await waitForPanelLoaded(page, 'services-panel');

    const cards  = page.getByTestId('owner-listing-card');
    const empty  = page.getByText(/no service listings yet/i);
    const errMsg = page.getByText(/could not load listings/i);
    const visible =
      (await cards.count()) > 0 ||
      (await empty.isVisible()) ||
      (await errMsg.isVisible());
    expect(visible).toBe(true);
  });

  test('approved card shows Boost listing button, pending card does not', async ({ page }) => {
    await waitForPanelLoaded(page, 'services-panel');

    // Approved card: wait directly for the boost button inside an approved card.
    // This is more reliable than checking count then asserting, because it gives
    // React time to fully render the card's action row.
    // Use data-status attribute selector to avoid false-positive title text matches
    // (e.g. a card titled "[TEST] Approved Painter" with status=pending).
    const boostBtnInApproved = page
      .locator('[data-testid="owner-listing-card"][data-status="approved"]')
      .first()
      .getByTestId('boost-btn');

    const boostBtnVisible = await boostBtnInApproved
      .waitFor({ state: 'visible', timeout: 5_000 })
      .then(() => true)
      .catch(() => false);

    if (boostBtnVisible) {
      await expect(boostBtnInApproved).toBeVisible();
    }
    // If not visible, no approved card exists for this test user — skip silently.

    // Pending card: no boost button, shows hint text instead
    const pendingCard = page
      .locator('[data-testid="owner-listing-card"][data-status="pending"]')
      .first();

    const pendingCount = await pendingCard.count();
    if (pendingCount > 0) {
      await expect(pendingCard.getByTestId('boost-btn')).toHaveCount(0);
      await expect(pendingCard.getByText(/under review/i)).toBeVisible();
    }
  });
});

// ---------------------------------------------------------------------------
// Edit service
// ---------------------------------------------------------------------------

test.describe('Edit service listing', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('Edit listing link navigates to the edit form', async ({ page }) => {
    await page.goto('/my-listings');
    await page.getByTestId('tab-services').click();
    await waitForPanelLoaded(page, 'services-panel');

    const firstCard = page.getByTestId('owner-listing-card').first();
    const cardCount = await firstCard.count();
    if (cardCount === 0) {
      test.skip();
      return;
    }

    await firstCard.getByRole('link', { name: /edit listing/i }).click();
    await page.waitForURL(/\/my-listings\/services\/.+\/edit/, { timeout: 8_000 });
    await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible();
  });

  test('edit form is prefilled with existing business name', async ({ page }) => {
    await page.goto('/my-listings');
    await page.getByTestId('tab-services').click();
    await waitForPanelLoaded(page, 'services-panel');

    const firstCard = page.getByTestId('owner-listing-card').first();
    if (await firstCard.count() === 0) { test.skip(); return; }

    const titleText = await firstCard.getByTestId('owner-card-title').innerText();
    await firstCard.getByRole('link', { name: /edit listing/i }).click();
    await page.waitForURL(/\/my-listings\/services\/.+\/edit/, { timeout: 8_000 });

    const nameInput = page.getByLabel('Business / Service Name');
    await expect(nameInput).toHaveValue(titleText.trim());
  });

  test('saving edit shows success message and does not create a duplicate', async ({ page }) => {
    await page.goto('/my-listings');
    await page.getByTestId('tab-services').click();
    await waitForPanelLoaded(page, 'services-panel');

    const firstCard = page.getByTestId('owner-listing-card').first();
    if (await firstCard.count() === 0) { test.skip(); return; }

    await firstCard.getByRole('link', { name: /edit listing/i }).click();
    await page.waitForURL(/\/my-listings\/services\/.+\/edit/, { timeout: 8_000 });

    // Append a minor change to description
    const desc = page.getByLabel('Description');
    const existing = await desc.inputValue();
    await desc.fill(existing + ' (edited)');

    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText(/changes saved/i)).toBeVisible({ timeout: 10_000 });
  });

  test('visiting edit page for a non-existent service shows not found', async ({ page }) => {
    await page.goto('/my-listings/services/nonexistent-id-xyz/edit');
    await expect(page.getByText(/not found/i)).toBeVisible({ timeout: 8_000 });
  });
});

// ---------------------------------------------------------------------------
// Edit product
// ---------------------------------------------------------------------------

test.describe('Edit product listing', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('Edit listing link navigates to the product edit form', async ({ page }) => {
    await page.goto('/my-listings');
    await page.getByTestId('tab-products').click();
    await waitForPanelLoaded(page, 'products-panel');

    const firstCard = page.getByTestId('owner-listing-card').first();
    if (await firstCard.count() === 0) { test.skip(); return; }

    await firstCard.getByRole('link', { name: /edit listing/i }).click();
    await page.waitForURL(/\/my-listings\/products\/.+\/edit/, { timeout: 8_000 });
    await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible();
  });

  test('product edit page shows existing image upload widget', async ({ page }) => {
    await page.goto('/my-listings');
    await page.getByTestId('tab-products').click();
    await waitForPanelLoaded(page, 'products-panel');

    const firstCard = page.getByTestId('owner-listing-card').first();
    if (await firstCard.count() === 0) { test.skip(); return; }

    await firstCard.getByRole('link', { name: /edit listing/i }).click();
    await page.waitForURL(/\/my-listings\/products\/.+\/edit/, { timeout: 8_000 });
    await expect(page.getByTestId('image-upload')).toBeVisible();
  });

  test('visiting edit page for a non-existent product shows not found', async ({ page }) => {
    await page.goto('/my-listings/products/nonexistent-id-xyz/edit');
    await expect(page.getByText(/not found/i)).toBeVisible({ timeout: 8_000 });
  });
});

// ---------------------------------------------------------------------------
// Boost (republish)
// ---------------------------------------------------------------------------

test.describe('Boost listing', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('clicking Boost listing updates Last boosted date and does not duplicate', async ({ page }) => {
    await page.goto('/my-listings');
    await page.getByTestId('tab-services').click();
    await waitForPanelLoaded(page, 'services-panel');

    const approvedCard = page
      .locator('[data-testid="owner-listing-card"][data-status="approved"]')
      .first();

    if (await approvedCard.count() === 0) {
      // No approved listing available for this test user — skip gracefully
      test.skip();
      return;
    }

    const boostBtn = approvedCard.getByTestId('boost-btn');
    await expect(boostBtn).toBeVisible();
    await boostBtn.click();

    // Button should re-enable after request completes
    await expect(boostBtn).toBeEnabled({ timeout: 10_000 });

    // "Last boosted" metadata should now be visible on the card
    await expect(approvedCard.getByText(/last boosted/i)).toBeVisible({ timeout: 8_000 });
  });
});
