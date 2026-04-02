# Playwright E2E Testing

## Environment Variables

Create a `.env` file in the project root (or export these in your shell):

```
# Admin account — used by moderation tests
ADMIN_EMAIL=<admin user email>
ADMIN_PASSWORD=<admin user password>

# Normal user account — used by matching tests and seed script
TEST_USER_EMAIL=<normal user email>
TEST_USER_PASSWORD=<normal user password>
```

### Account requirements

**Admin account** (`ADMIN_EMAIL`):
- Must exist in Firebase Auth
- Must have completed onboarding
- Must have `role: "admin"` in Firestore `users/{uid}`
- Must have `status: "approved"`

**Normal user account** (`TEST_USER_EMAIL`):
- Must exist in Firebase Auth
- Must have completed onboarding
- Any role (`member`, `provider`, etc.) is fine
- Must have `status: "approved"`

Both accounts must be created manually — the seed script does not create Firebase Auth accounts.

---

## Seeding Test Data

A seed script creates predictable `[TEST]`-prefixed service and product listings in Firestore for the E2E tests. This is a **local-development-only** tool — not a production seeding method.

### Seed

```bash
node scripts/seed-test-data.mjs
```

This creates 5 service listings in `serviceListings` and 1 product listing in `productListings`:

**Service listings:**

| businessName | status | category | areas |
|---|---|---|---|
| `[TEST] Pending Plumber` | `pending` | Home & Property | Old Town |
| `[TEST] Pending Electrician` | `pending` | Home & Property | Chells |
| `[TEST] Approved Cleaner` | `approved` | Home & Property | Old Town |
| `[TEST] Approved Painter` | `approved` | Home & Property | Broadwater |
| `[TEST] Old Town Movers` | `approved` | Transport & Delivery | Old Town, Town Centre |

**Product listings:**

| title | status | category | location |
|---|---|---|---|
| `[TEST] Jollof Rice Mix` | `approved` | Food & Drinks | Old Town |

The script is **idempotent** — running it multiple times will not create duplicates. It checks for existing `[TEST]` listings by `businessName` (services) or `title` (products) and skips any that already exist.

### Clean

```bash
node scripts/seed-test-data.mjs --clean
```

Removes all service listings whose `businessName` starts with `[TEST]` and all product listings whose `title` starts with `[TEST]`. Does not touch any other data.

### Re-seed after test runs

Moderation tests consume seed data (they change statuses). To reset for another run:

```bash
node scripts/seed-test-data.mjs --clean
node scripts/seed-test-data.mjs
```

---

## Assumptions That Remain Manual

The seed script does **not** cover everything. These assumptions still require manual setup:

| Test | Manual requirement |
|---|---|
| **Approve pending member** | Requires a real secondary Firebase Auth user with `status: "pending"` in Firestore. Create a new account via the sign-up flow — all new users start as pending. |
| **No-match fallback** (Childcare + Symonds Green) | Depends on **no** approved service existing with `category: "Education & Tutoring"` and `serviceAreas` including `"Symonds Green"`. This holds true by default. If conflicting data is added manually, this test will fail. A dedicated test Firebase project would eliminate this risk. |
| **Admin and test user accounts** | `ADMIN_EMAIL` / `TEST_USER_EMAIL` must be real Firebase Auth accounts with completed onboarding. One-time manual setup. |

---

## Which Tests Use Which Seed Data

### Moderation tests (`tests/e2e/moderation.spec.ts`)

| Test | Seed listing consumed |
|---|---|
| Approve pending service | `[TEST] Pending Plumber` |
| Reject service with reason | `[TEST] Pending Electrician` |
| Pause approved service | `[TEST] Approved Cleaner` |
| Archive approved service | `[TEST] Approved Painter` |
| Approve pending member | (manual — real pending user) |

Each moderation test changes the status of the listing it acts on, so seed data is consumed in order. Re-seed between full test runs.

### Matching tests (`tests/e2e/matching.spec.ts`)

| Test | Seed listing used |
|---|---|
| Help Moving + Old Town | `[TEST] Old Town Movers` (not consumed — status unchanged) |
| Need a Product | None — client-side only |
| Childcare + Symonds Green (no-match) | None — depends on absence of matching data |

### Requests tests (`tests/e2e/requests.spec.ts`)

This file covers two describe blocks.

#### My Requests (3 tests)

These tests create their own request data and do not rely on seeded listings.

| Test | Seed data |
|---|---|
| My Requests list shows a request the user created | None — creates its own request |
| Request detail is accessible from the list | None — creates its own request |
| Invalid request ID shows not-found message | None — navigates to a fabricated ID |

#### Request pre-submit preview (4 tests)

These tests require two seeded service listings to be present and **approved**. They do not consume the listings (no status change), but moderation tests do — run preview tests before moderation tests, or re-seed first.

| Test | Seed listings required |
|---|---|
| Preview screen appears when seeded matches exist | `[TEST] Approved Cleaner`, `[TEST] Old Town Movers` |
| "Edit my request" returns to form with all values restored | `[TEST] Approved Cleaner`, `[TEST] Old Town Movers` |
| "Post my request anyway" creates the request and shows success | `[TEST] Approved Cleaner`, `[TEST] Old Town Movers` |
| Product-routed category skips preview and posts directly | None — product routing bypass requires no seeded services |

**Trigger combo used:** category `"Looking for a Service"` + location `"Old Town"`. This maps to `{ target: 'services', categories: 'any' }`, which passes both seeded Old Town listings through the eligibility filter, causing `findMatchesForRequest` to return results and the preview screen to appear.

**⚠ Run order matters:** The moderation test suite pauses `[TEST] Approved Cleaner` and archives `[TEST] Approved Painter`. If moderation tests run first, the approved service count in Old Town drops, which may cause the preview tests to find zero matches and skip the preview screen. Always re-seed before running preview tests after a moderation run.

**Safe run sequence for `requests.spec.ts`:**

```bash
node scripts/seed-test-data.mjs --clean
node scripts/seed-test-data.mjs
npx playwright test tests/e2e/requests.spec.ts
```

### My Listings tests (`tests/e2e/my-listings.spec.ts`)

These tests cover the owner dashboard (`/my-listings`), edit flows, and manual boost. They run under the test user's storage state.

**Seed data requirements:**

The test user (`TEST_USER_EMAIL`) must own at least one service listing for edit/boost tests to be meaningful. Tests that require a listing are designed to `test.skip()` gracefully if none exist, so the suite will not fail — but coverage will be partial.

For full coverage, ensure the test user's Firestore documents include:

| Type | businessName / title | status |
|---|---|---|
| Service | `[TEST] My Pending Service` | `pending` |
| Service | `[TEST] My Approved Service` | `approved` |

These are owner-specific — they must have `authorId` set to the `TEST_USER_EMAIL` account's UID. The seed script does not yet generate owner-specific data; create them manually or extend `seed-test-data.mjs`.

**What these tests cover:**

| Test | Consumes data? |
|---|---|
| Dashboard loads with both tabs | No |
| How-it-works note is visible | No |
| Unauthenticated visitor redirected to sign-in | No |
| My Listings reachable from home page nav | No |
| Approved card shows Boost button; pending card does not | No |
| Edit link navigates to prefilled form | No |
| Edit form prefilled with existing business name | No |
| Saving edit shows success message, no duplicate | No (updates in-place) |
| Non-existent service/product ID shows not-found | No |
| Clicking Boost updates "Last boosted" date | No (updates in-place) |

**Running My Listings tests only:**

```bash
npx playwright test tests/e2e/my-listings.spec.ts
```

**Manual test steps (if Playwright setup is not available):**

1. Sign in as a user who has created at least one service.
2. Navigate to `/my-listings`. Confirm the dashboard loads with both tabs.
3. Click "My Services". Confirm the user's listings appear with correct status chips.
4. On an **approved** listing: confirm "Boost listing" button is visible.
5. Click "Boost listing". Confirm "Last boosted [date]" appears on the card.
6. Navigate to `/services` browse. Confirm the boosted listing appears near the top.
7. Click "Edit listing" on any card. Confirm the form pre-fills with existing data.
8. Change the description field. Click "Save changes". Confirm "Changes saved" success message.
9. Return to `/my-listings`. Confirm the card now shows `pending` status.
10. Sign in as a **different** user. Navigate directly to `my-listings/services/{id}/edit` using the first user's listing ID. Confirm "Not found" is shown (no access leak).

---

### Filtering tests (`tests/e2e/filtering.spec.ts`)

These tests rely on seeded data but **do not consume it** (no status changes). Re-seeding between runs is not required unless moderation tests have changed the seed data.

| Test | Seed listing used |
|---|---|
| Service category filter narrows results | `[TEST] Approved Cleaner`, `[TEST] Approved Painter`, `[TEST] Old Town Movers` |
| Service area filter narrows results | `[TEST] Approved Painter`, `[TEST] Approved Cleaner`, `[TEST] Old Town Movers` |
| Service keyword search narrows results | `[TEST] Old Town Movers`, `[TEST] Approved Cleaner`, `[TEST] Approved Painter` |
| Product category filter narrows results | `[TEST] Jollof Rice Mix` |
| Clear filters resets the full list | `[TEST] Old Town Movers` (any approved service suffices) |

---

## Running Tests

The dev server starts automatically (configured in `playwright.config.ts`). If it's already running on port 3000, Playwright reuses it.

### All tests

```bash
npx playwright test
```

### Moderation tests only

```bash
npx playwright test tests/e2e/moderation.spec.ts
```

### Matching tests only

```bash
npx playwright test tests/e2e/matching.spec.ts
```

### Requests tests only

The preview describe block requires seeded approved services. Re-seed first to guarantee a clean state:

```bash
node scripts/seed-test-data.mjs --clean
node scripts/seed-test-data.mjs
npx playwright test tests/e2e/requests.spec.ts
```

### Filtering tests only

```bash
npx playwright test tests/e2e/filtering.spec.ts
```

### Requests + filtering tests together

```bash
npx playwright test tests/e2e/requests.spec.ts tests/e2e/filtering.spec.ts
```

### UI mode (interactive browser)

```bash
npx playwright test --ui
```

### Headed mode (watch the browser)

```bash
npx playwright test --headed
```

### Single test by name

```bash
npx playwright test -g "Admin can approve a pending service listing"
```

### View last test report

```bash
npx playwright show-report
```

---

## Common Failure Causes

**"Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variables"**
- The env vars are not set. Export them or add them to `.env`.

**"Missing TEST_USER_EMAIL or TEST_USER_PASSWORD environment variables"**
- Same as above, but for the normal user account used by matching tests and the seed script.

**Test times out waiting for a card or element**
- The seed data is missing or consumed. Run `node scripts/seed-test-data.mjs --clean` then `node scripts/seed-test-data.mjs` to re-seed.
- The account may not have completed onboarding — the AuthGuard will redirect to `/onboarding` instead of showing the expected page.

**"No matching services found" when matches were expected (or vice versa)**
- The seed data doesn't match the test's category/location combination. Re-seed with `node scripts/seed-test-data.mjs`.
- Check `category`, `serviceAreas`, `status`, and `expiresAt` on the Firestore document.

**Firestore query fails with an index error**
- Composite indexes are needed for `status` + `expiresAt` queries on each collection. Firestore logs the exact index creation link in the browser console. Open the link to create the index, wait a few minutes, then re-run.

**Tests pass on Desktop Chrome but fail on Mobile Chrome (or vice versa)**
- Both projects run by default. Use `--project "Desktop Chrome"` to run only one:
  ```bash
  npx playwright test --project "Desktop Chrome"
  ```

**Form submission fails silently**
- The WhatsApp or phone field may be empty. The form requires at least one contact method. The `createRequest()` helper passes a WhatsApp number by default.

---

## Pre-Submit Match Preview

When a user submits a request, the creation flow may show a **"Services that might help you"** screen before writing anything to Firestore. This is a non-blocking discovery step — the user can always proceed to post.

### When preview is shown

All four conditions must be true:

1. **Category is selected** — the request has a non-empty category
2. **Location is selected** — the request has a non-empty location
3. **Category does not route to products** — categories like "Need a Product" skip the preview and post directly
4. **At least one matching service is found** — `findMatchesForRequest` returns one or more results for the given category and location combination

### When preview is skipped (posts directly)

Preview is skipped and the request is written to Firestore immediately when **any** of the following is true:

- No category selected
- No location selected
- Category routes to products (e.g. "Need a Product")
- No matching services found for the category + location
- The match query fails for any reason (network error, index missing) — the post is never blocked

### User choices on the preview screen

| Action | Behaviour |
|---|---|
| **Post my request anyway** | Writes the request to Firestore and proceeds to the success screen |
| **Edit my request** | Returns to the form with all previously entered fields restored |

### Seed data support

The existing seed data already supports manual testing of this flow. The combination of **category "Looking for a Service" + location "Old Town"** will match `[TEST] Approved Cleaner` and `[TEST] Old Town Movers`, triggering the preview screen. No additional seeding is required.

### Manual test steps

1. Sign in as `TEST_USER_EMAIL`. Ensure seed data is present (`node scripts/seed-test-data.mjs`).
2. Navigate to `/create/request`.
3. Fill in the form: set category to **"Looking for a Service"**, location to **"Old Town"**, add text and a contact number.
4. Click **"Post Request"**. Confirm the "Services that might help you" screen appears with at least two match cards.
5. Click **"Edit my request"**. Confirm the form is restored with all fields intact.
6. Click **"Post Request"** again and then **"Post my request anyway"**. Confirm the success screen appears.
7. Repeat from step 2, but set category to **"Need a Product"**. Confirm the preview screen is **not** shown — the success screen appears directly.
8. Repeat from step 2, but leave category empty. Confirm the preview screen is **not** shown.

### Playwright coverage

All four cases are now automated in `tests/e2e/requests.spec.ts` under the `"Request pre-submit preview"` describe block:

- Preview is shown when category + location match existing services ✓
- "Post my request anyway" creates the request and shows the success screen ✓
- "Edit my request" returns to the form with data preserved ✓
- Preview is skipped when category routes to products ✓

See the [Requests tests](#requests-tests-testse2erequestsspects) section above for seed data requirements and the safe run sequence.
