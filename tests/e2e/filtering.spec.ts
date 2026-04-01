import { test, expect } from '@playwright/test';
import { loginAsUser } from './helpers';

/**
 * Browse Filtering — E2E Tests
 * ============================
 *
 * ENVIRONMENT VARIABLES REQUIRED:
 *   TEST_USER_EMAIL    — email for a normal user who has completed onboarding
 *   TEST_USER_PASSWORD — password for that user
 *
 * FIRESTORE SEED DATA REQUIRED (run `node scripts/seed-test-data.mjs`):
 *
 * Service listings (approved):
 *   - [TEST] Approved Cleaner   — category: Home & Property, area: Old Town
 *   - [TEST] Approved Painter   — category: Home & Property, area: Broadwater
 *   - [TEST] Old Town Movers    — category: Transport & Delivery, areas: Old Town, Town Centre
 *
 * Product listings (approved):
 *   - [TEST] Jollof Rice Mix    — category: Food & Drinks, location: Old Town
 *
 * These tests assert against known seeded names/titles for stable,
 * readable failure messages. They do NOT consume seed data (no status
 * changes), so re-seeding between runs is not required.
 */

test.describe('Browse Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  // ------------------------------------------------------------------
  // Service filtering
  // ------------------------------------------------------------------

  test('Service category filter narrows results', async ({ page }) => {
    await page.goto('/services');
    await expect(page.getByRole('heading', { name: 'Services' })).toBeVisible();

    // Wait for cards to load.
    await expect(page.getByTestId('service-card').first()).toBeVisible({ timeout: 10_000 });

    // Filter by "Home & Property".
    await page.getByLabel('Filter by category').selectOption('Home & Property');

    // The seeded Home & Property services should be visible.
    await expect(page.getByTestId('service-card').filter({ hasText: '[TEST] Approved Cleaner' })).toBeVisible();
    await expect(page.getByTestId('service-card').filter({ hasText: '[TEST] Approved Painter' })).toBeVisible();

    // The Transport & Delivery mover should NOT be visible.
    await expect(page.getByTestId('service-card').filter({ hasText: '[TEST] Old Town Movers' })).not.toBeVisible();
  });

  test('Service area filter narrows results', async ({ page }) => {
    await page.goto('/services');
    await expect(page.getByRole('heading', { name: 'Services' })).toBeVisible();
    await expect(page.getByTestId('service-card').first()).toBeVisible({ timeout: 10_000 });

    // Filter by "Broadwater".
    await page.getByLabel('Filter by area').selectOption('Broadwater');

    // Only the Approved Painter is in Broadwater.
    await expect(page.getByTestId('service-card').filter({ hasText: '[TEST] Approved Painter' })).toBeVisible();

    // The Old Town services should NOT be visible.
    await expect(page.getByTestId('service-card').filter({ hasText: '[TEST] Approved Cleaner' })).not.toBeVisible();
    await expect(page.getByTestId('service-card').filter({ hasText: '[TEST] Old Town Movers' })).not.toBeVisible();
  });

  test('Service keyword search narrows results', async ({ page }) => {
    await page.goto('/services');
    await expect(page.getByRole('heading', { name: 'Services' })).toBeVisible();
    await expect(page.getByTestId('service-card').first()).toBeVisible({ timeout: 10_000 });

    // Type a keyword that matches only one seeded listing.
    await page.getByLabel('Search services').fill('Movers');

    // The mover should be visible.
    await expect(page.getByTestId('service-card').filter({ hasText: '[TEST] Old Town Movers' })).toBeVisible();

    // Other seeded services should NOT match.
    await expect(page.getByTestId('service-card').filter({ hasText: '[TEST] Approved Cleaner' })).not.toBeVisible();
    await expect(page.getByTestId('service-card').filter({ hasText: '[TEST] Approved Painter' })).not.toBeVisible();
  });

  // ------------------------------------------------------------------
  // Product filtering
  // ------------------------------------------------------------------

  test('Product category filter narrows results', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

    // Wait for cards to load.
    await expect(page.getByTestId('product-card').first()).toBeVisible({ timeout: 10_000 });

    // Filter by "Food & Drinks".
    await page.getByLabel('Filter by category').selectOption('Food & Drinks');

    // The seeded product should be visible.
    await expect(page.getByTestId('product-card').filter({ hasText: '[TEST] Jollof Rice Mix' })).toBeVisible();
  });

  // ------------------------------------------------------------------
  // Clear filters
  // ------------------------------------------------------------------

  test('Clear filters resets the full list', async ({ page }) => {
    await page.goto('/services');
    await expect(page.getByRole('heading', { name: 'Services' })).toBeVisible();
    await expect(page.getByTestId('service-card').first()).toBeVisible({ timeout: 10_000 });

    // Remember how many cards we started with.
    const initialCount = await page.getByTestId('service-card').count();

    // Apply a category filter that narrows the list.
    await page.getByLabel('Filter by category').selectOption('Transport & Delivery');

    // The filtered count should be fewer than the initial count
    // (assuming there are services in other categories too).
    await expect(page.getByTestId('service-card').filter({ hasText: '[TEST] Old Town Movers' })).toBeVisible();
    const filteredCount = await page.getByTestId('service-card').count();
    expect(filteredCount).toBeLessThan(initialCount);

    // Click "Clear" to reset.
    await page.getByRole('button', { name: 'Clear' }).click();

    // The full list should return.
    await expect(page.getByTestId('service-card')).toHaveCount(initialCount);
  });
});
