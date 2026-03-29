import { test, expect } from '@playwright/test';
import { loginAsUser, createRequest } from './helpers';

/**
 * Request Matching — E2E Tests
 * ============================
 *
 * ENVIRONMENT VARIABLES REQUIRED:
 *   TEST_USER_EMAIL    — email for a normal user who has completed onboarding
 *   TEST_USER_PASSWORD — password for that user
 *
 * FIRESTORE SEED DATA ASSUMPTIONS:
 *
 * Test 1 ("Help Moving" + "Old Town") requires at least ONE approved,
 * non-expired service listing with:
 *   - status: "approved"
 *   - expiresAt: a future date (e.g. "2026-12-31")
 *   - category: "Transport & Delivery" OR "Home & Property"
 *   - serviceAreas: must include "Old Town"
 *   - businessName: non-empty
 *   - whatsapp: non-empty
 *
 * Test 2 ("Need a Product") requires NO seeded data. Product routing
 * is pure client-side logic — no Firestore query is made.
 *
 * Test 3 ("Childcare" + "Symonds Green") expects ZERO matching services.
 * This test will FAIL if an approved, non-expired service exists with:
 *   - category: "Education & Tutoring"
 *   - serviceAreas: includes "Symonds Green"
 * If such a service is later seeded, update this test's category/location
 * combination to one that has no eligible services.
 */

test.describe('Request Matching', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('User can create a Help Moving request and see matching services', async ({ page }) => {
    // -------------------------------------------------------
    // PREREQUISITE: At least one approved, non-expired service
    // listing in category "Transport & Delivery" or "Home & Property"
    // with serviceAreas including "Old Town" must exist in Firestore.
    // -------------------------------------------------------

    // Step 1: Create a Help Moving request in Old Town.
    await createRequest(page, {
      text: 'Need help moving furniture to my new flat',
      category: 'Help Moving',
      location: 'Old Town',
      whatsapp: '+447000000000',
    });

    // Step 2: Click "See matching services" to go to the matches page.
    await page.getByTestId('see-matches-btn').click();

    // Step 3: Wait for the matches page to finish loading.
    // The page heading should be visible once loaded.
    await expect(page.getByRole('heading', { name: 'Matching Services' })).toBeVisible();

    // Step 4: Assert the match results section is visible
    // (meaning at least one service was found).
    const results = page.getByTestId('match-results');
    await expect(results).toBeVisible({ timeout: 15_000 });

    // Step 5: Assert at least one match card is shown.
    const cards = page.getByTestId('match-card');
    await expect(cards.first()).toBeVisible();

    // Step 6: The first card (rank 1) should show the
    // "Why this matched" explanation section.
    const firstCard = cards.first();
    const explanation = firstCard.getByTestId('match-explanation');
    await expect(explanation).toBeVisible();

    // Step 7: The explanation should contain honest,
    // plain-language reasons.
    await expect(explanation).toContainText('Serves your area');
    await expect(explanation).toContainText('Matches the kind of help you requested');
  });

  test('Need a Product request shows product matching placeholder', async ({ page }) => {
    // -------------------------------------------------------
    // NO SEEDED DATA REQUIRED.
    // Product routing is client-side only — no Firestore query.
    // -------------------------------------------------------

    // Step 1: Create a "Need a Product" request.
    await createRequest(page, {
      text: 'Looking for Nigerian spices and seasoning',
      category: 'Need a Product',
      location: 'Town Centre',
      whatsapp: '+447000000000',
    });

    // Step 2: Navigate to the matches page.
    await page.getByTestId('see-matches-btn').click();

    // Step 3: Wait for the page heading.
    await expect(page.getByRole('heading', { name: 'Matching Services' })).toBeVisible();

    // Step 4: The product placeholder state should be visible
    // instead of match results.
    const placeholder = page.getByTestId('product-placeholder');
    await expect(placeholder).toBeVisible({ timeout: 15_000 });

    // Step 5: The placeholder should explain that product
    // matching is not available yet.
    await expect(placeholder).toContainText('Product matching coming soon');

    // Step 6: A link to browse products manually should be visible.
    await expect(placeholder.getByRole('link', { name: /browse products/i })).toBeVisible();
  });

  test('No eligible services shows no-match fallback', async ({ page }) => {
    // -------------------------------------------------------
    // DATA ASSUMPTION: This test expects ZERO results.
    //
    // It uses category "Childcare" (routes to "Education & Tutoring")
    // with location "Symonds Green".
    //
    // This test will FAIL if there is an approved, non-expired
    // service listing in Firestore with:
    //   category: "Education & Tutoring"
    //   serviceAreas: includes "Symonds Green"
    //
    // If such a service is later seeded for other tests, change
    // the category/location combination here to one that has
    // no eligible services.
    // -------------------------------------------------------

    // Step 1: Create a Childcare request in Symonds Green.
    await createRequest(page, {
      text: 'Looking for after-school childcare near Symonds Green',
      category: 'Childcare',
      location: 'Symonds Green',
      whatsapp: '+447000000000',
    });

    // Step 2: Navigate to the matches page.
    await page.getByTestId('see-matches-btn').click();

    // Step 3: Wait for the page heading.
    await expect(page.getByRole('heading', { name: 'Matching Services' })).toBeVisible();

    // Step 4: The no-match fallback state should be visible.
    const noMatches = page.getByTestId('no-matches');
    await expect(noMatches).toBeVisible({ timeout: 15_000 });

    // Step 5: The fallback message should mention the area
    // so the user understands why no results were found.
    await expect(noMatches).toContainText('Symonds Green');

    // Step 6: A "Browse all services" link should be visible
    // so the user can explore manually.
    await expect(page.getByTestId('browse-services-link')).toBeVisible();
  });
});
