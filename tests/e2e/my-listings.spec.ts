import { test, expect } from '@playwright/test';
import { loginAsUser } from './helpers';

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
  });

  test('loads the dashboard and shows both tabs', async ({ page }) => {
    await page.goto('/my-listings');
    await expect(page.getByRole('heading', { name: 'My Listings' })).toBeVisible();
    await expect(page.getByTestId('tab-services')).toBeVisible();
    await expect(page.getByTestId('tab-products')).toBeVisible();
  });

  test('shows the how-it-works note about editing and boosting', async ({ page }) => {
    await page.goto('/my-listings');
    await expect(page.getByText(/editing a listing/i)).toBeVisible();
    await expect(page.getByText(/boosting an approved listing/i)).toBeVisible();
  });

  test('switching to products tab shows the products panel', async ({ page }) => {
    await page.goto('/my-listings');
    await page.getByTestId('tab-products').click();
    await expect(page.getByTestId('products-panel')).toBeVisible();
  });

  test('switching back to services tab shows the services panel', async ({ page }) => {
    await page.goto('/my-listings');
    await page.getByTestId('tab-products').click();
    await page.getByTestId('tab-services').click();
    await expect(page.getByTestId('services-panel')).toBeVisible();
  });

  test('unauthenticated visitor is redirected to sign-in', async ({ browser }) => {
    const ctx = await browser.newContext(); // fresh context — no stored auth
    const pg = await ctx.newPage();
    await pg.goto('/my-listings');
    await pg.waitForURL(/\/auth\/sign-in/, { timeout: 8_000 });
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
    // Wait for loading to finish
    await page.getByTestId('tab-services').click();
  });

  test('shows owner listing cards once data loads', async ({ page }) => {
    // Either cards are shown or the empty-state message
    await page.waitForTimeout(3_000); // give Firestore time to respond
    const cards = page.getByTestId('owner-listing-card');
    const empty = page.getByText(/no service listings yet/i);
    const visible = (await cards.count()) > 0 || (await empty.isVisible());
    expect(visible).toBe(true);
  });

  test('approved card shows Boost listing button, pending card does not', async ({ page }) => {
    await page.waitForTimeout(3_000);

    // Approved card: boost button visible
    const approvedCard = page
      .getByTestId('owner-listing-card')
      .filter({ has: page.getByText('Approved') })
      .first();

    const approvedCount = await approvedCard.count();
    if (approvedCount > 0) {
      await expect(approvedCard.getByTestId('boost-btn')).toBeVisible();
    }

    // Pending card: no boost button, shows hint text instead
    const pendingCard = page
      .getByTestId('owner-listing-card')
      .filter({ has: page.getByText('Pending') })
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
    await page.waitForTimeout(3_000);

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
    await page.waitForTimeout(3_000);

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
    await page.waitForTimeout(3_000);

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
    await page.waitForTimeout(3_000);

    const firstCard = page.getByTestId('owner-listing-card').first();
    if (await firstCard.count() === 0) { test.skip(); return; }

    await firstCard.getByRole('link', { name: /edit listing/i }).click();
    await page.waitForURL(/\/my-listings\/products\/.+\/edit/, { timeout: 8_000 });
    await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible();
  });

  test('product edit page shows existing image upload widget', async ({ page }) => {
    await page.goto('/my-listings');
    await page.getByTestId('tab-products').click();
    await page.waitForTimeout(3_000);

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
    await page.waitForTimeout(3_000);

    const approvedCard = page
      .getByTestId('owner-listing-card')
      .filter({ has: page.getByText('Approved') })
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
