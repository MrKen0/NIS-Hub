import { test, expect } from '@playwright/test';
import { loginAsUser, createRequest } from './helpers';

/**
 * My Requests — E2E Tests
 * =======================
 *
 * ENVIRONMENT VARIABLES REQUIRED:
 *   TEST_USER_EMAIL    — email for a normal user who has completed onboarding
 *   TEST_USER_PASSWORD — password for that user
 *
 * FIRESTORE SEED DATA:
 *   The "My Requests" describe block creates its own request data — no pre-seeded
 *   requests needed.
 *
 *   The "Request pre-submit preview" describe block requires two seeded services:
 *     - [TEST] Approved Cleaner  (category: Home & Property, areas: [Old Town], status: approved)
 *     - [TEST] Old Town Movers   (category: Transport & Delivery, areas: [Old Town, Town Centre], status: approved)
 *   Run `node scripts/seed-test-data.mjs` before executing preview tests.
 *   These listings are NOT consumed (no status change), so no re-seed is needed
 *   between preview test runs. Run preview tests BEFORE moderation tests — moderation
 *   tests pause/archive [TEST] Approved Cleaner, which would reduce the match count.
 *
 * NOTES:
 *   - The "Invalid request ID" test navigates to a fabricated document ID.
 *     It tests the not-found UI only — it does NOT test owner-based access control
 *     (that would require a second authenticated user).
 *   - The existing "My Requests" tests use category 'Childcare' (routes to
 *     Education & Tutoring only). No seeded Education & Tutoring services exist,
 *     so the pre-submit preview is skipped and createRequest() sees the success
 *     screen as expected.
 */

// ---------------------------------------------------------------------------
// My Requests
// ---------------------------------------------------------------------------

test.describe('My Requests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('My Requests list shows a request the user created', async ({ page }) => {
    // Step 1: Create a request so there is at least one in the list.
    // Category 'Childcare' routes to Education & Tutoring — no seeded services
    // match, so the pre-submit preview is skipped and createRequest() reaches
    // the success screen normally.
    await createRequest(page, {
      text: 'Need someone to fix a leaky tap in my kitchen',
      category: 'Childcare',
      location: 'Old Town',
      whatsapp: '+447000000000',
    });

    // Step 2: Navigate to My Requests.
    await page.goto('/requests');

    // Step 3: Wait for the page heading.
    await expect(page.getByRole('heading', { name: 'My Requests' })).toBeVisible();

    // Step 4: At least one request card should be visible.
    const cards = page.getByTestId('request-card');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });

    // Step 5: The card we just created should appear in the list.
    // Filter by specific text instead of .first() — parallel test workers
    // create their own requests simultaneously and .first() is non-deterministic.
    const ourCard = cards.filter({ hasText: 'leaky tap' }).first();
    await expect(ourCard).toBeVisible({ timeout: 10_000 });
  });

  test('Request detail is accessible from the list', async ({ page }) => {
    // Step 1: Create a request with distinctive text.
    // Category 'Childcare' routes to Education & Tutoring — no seeded services
    // match, so the pre-submit preview is skipped and createRequest() reaches
    // the success screen normally.
    await createRequest(page, {
      text: 'Looking for a plumber to check the boiler before winter',
      category: 'Childcare',
      location: 'Broadwater',
      whatsapp: '+447000000000',
    });

    // Step 2: Navigate to My Requests.
    await page.goto('/requests');
    await expect(page.getByRole('heading', { name: 'My Requests' })).toBeVisible();

    // Step 3: Wait for cards and click the first one containing our text.
    // Use .first() because multiple test runs may accumulate cards with
    // the same text (requests are not cleaned up between runs).
    const card = page.getByTestId('request-card').filter({ hasText: 'boiler before winter' }).first();
    await expect(card).toBeVisible({ timeout: 10_000 });
    await card.click();

    // Step 4: The detail view should load.
    await expect(page.getByTestId('request-detail')).toBeVisible({ timeout: 10_000 });

    // Step 5: The full request text should be visible on the detail page.
    await expect(page.getByTestId('request-detail')).toContainText(
      'Looking for a plumber to check the boiler before winter',
    );

    // Step 6: Key metadata should be visible.
    await expect(page.getByTestId('request-detail')).toContainText('Broadwater');
  });

  test('Invalid request ID shows not-found message', async ({ page }) => {
    // Navigate to a fabricated request ID that does not exist.
    await page.goto('/requests/FAKE_ID_DOES_NOT_EXIST_12345');

    // The not-found state should appear with the expected message.
    const status = page.getByRole('status');
    await expect(status).toBeVisible({ timeout: 10_000 });
    await expect(status).toContainText('Request not found');
  });
});

// ---------------------------------------------------------------------------
// Request pre-submit preview
// ---------------------------------------------------------------------------
// Trigger combo: category 'Looking for a Service' + location 'Old Town'
//   REQUEST_MATCH_ROUTING → { target: 'services', categories: 'any' }
//   Eligibility filter    → categories: 'any' passes all; location gate passes
//                           any service with 'Old Town' in serviceAreas
//   Seeded matches        → [TEST] Approved Cleaner + [TEST] Old Town Movers
//   Result                → findMatchesForRequest returns ≥ 1 result → preview shown
// ---------------------------------------------------------------------------

test.describe('Request pre-submit preview', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/create/request');
  });

  test('preview screen appears when seeded matches exist', async ({ page }) => {
    // Fill all fields required to trigger the preview path
    await page.getByLabel('What do you need?').fill('Looking for cleaning or moving help in Old Town');
    await page.getByLabel('Category').selectOption('Looking for a Service');
    await page.getByLabel('Location').selectOption('Old Town');
    await page.getByLabel('WhatsApp Number').fill('+447000000000');

    await page.getByRole('button', { name: /post request/i }).click();

    // Preview screen should appear (Firestore round-trip — allow 15s)
    await expect(page.getByTestId('post-anyway-btn')).toBeVisible({ timeout: 15_000 });

    // Heading and at least one match card must be present
    await expect(
      page.getByRole('heading', { name: /services that might help you/i }),
    ).toBeVisible();
    await expect(page.getByTestId('match-card').first()).toBeVisible();

    // Both action buttons must be present
    await expect(page.getByTestId('edit-request-btn')).toBeVisible();
  });

  test('"Edit my request" returns to form with all values restored', async ({ page }) => {
    const requestText = 'Need help finding a cleaner in Old Town area';

    // Fill and submit to reach the preview screen
    await page.getByLabel('What do you need?').fill(requestText);
    await page.getByLabel('Category').selectOption('Looking for a Service');
    await page.getByLabel('Location').selectOption('Old Town');
    await page.getByLabel('WhatsApp Number').fill('+447000000000');
    await page.getByRole('button', { name: /post request/i }).click();

    // Wait for preview screen
    await expect(page.getByTestId('edit-request-btn')).toBeVisible({ timeout: 15_000 });

    // Click "Edit my request"
    await page.getByTestId('edit-request-btn').click();

    // The form submit button should be visible again
    await expect(page.getByRole('button', { name: /post request/i })).toBeVisible();

    // Every previously entered field must be restored
    await expect(page.getByLabel('What do you need?')).toHaveValue(requestText);
    await expect(page.getByLabel('Category')).toHaveValue('Looking for a Service');
    await expect(page.getByLabel('Location')).toHaveValue('Old Town');
  });

  test('"Post my request anyway" creates the request and shows success', async ({ page }) => {
    // Fill and submit to reach the preview screen
    await page.getByLabel('What do you need?').fill('Looking for a cleaner or mover near me');
    await page.getByLabel('Category').selectOption('Looking for a Service');
    await page.getByLabel('Location').selectOption('Old Town');
    await page.getByLabel('WhatsApp Number').fill('+447000000000');
    await page.getByRole('button', { name: /post request/i }).click();

    // Wait for preview screen
    await expect(page.getByTestId('post-anyway-btn')).toBeVisible({ timeout: 15_000 });

    // Confirm and post
    await page.getByTestId('post-anyway-btn').click();

    // Success screen must appear (one Firestore write in-flight — allow 15s)
    await expect(page.getByTestId('see-matches-btn')).toBeVisible({ timeout: 15_000 });
  });

  test('product-routed category skips preview and posts directly', async ({ page }) => {
    // 'Need a Product' → REQUEST_MATCH_ROUTING target: 'products'
    // → routesToProducts = true → canPreview = false → direct post, no preview screen
    await page.getByLabel('What do you need?').fill('Looking to buy some Nigerian spices');
    await page.getByLabel('Category').selectOption('Need a Product');
    await page.getByLabel('Location').selectOption('Old Town');
    await page.getByLabel('WhatsApp Number').fill('+447000000000');
    await page.getByRole('button', { name: /post request/i }).click();

    // Success screen must appear directly — no preview step
    await expect(page.getByTestId('see-matches-btn')).toBeVisible({ timeout: 15_000 });

    // Confirm the preview screen was never shown
    await expect(page.getByTestId('post-anyway-btn')).not.toBeVisible();
  });
});
