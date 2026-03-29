# Playwright E2E Testing

## Environment Variables

Create a `.env` file in the project root (or export these in your shell):

```
# Admin account — used by moderation tests
ADMIN_EMAIL=<admin user email>
ADMIN_PASSWORD=<admin user password>

# Normal user account — used by matching tests
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

---

## Firestore Seed Data

### Moderation tests (`tests/e2e/moderation.spec.ts`)

| Test | Required data |
|------|---------------|
| Approve pending service | At least one service listing with `status: "pending"` |
| Reject service with reason | At least one service listing with `status: "pending"` |
| Pause approved service | At least one service listing with `status: "approved"` |
| Approve pending member | At least one user with `status: "pending"` |
| Archive approved service | At least one service listing with `status: "approved"` |

All service listings are in the `serviceListings` collection. Each test consumes the item it acts on (changes its status), so run the tests in order or re-seed between runs.

### Matching tests (`tests/e2e/matching.spec.ts`)

| Test | Required data |
|------|---------------|
| Help Moving + Old Town | At least one approved, non-expired service with `category: "Transport & Delivery"` or `"Home & Property"` and `serviceAreas` including `"Old Town"`. Must have a non-empty `businessName` and `whatsapp`. |
| Need a Product | None — product placeholder is client-side only. |
| Childcare + Symonds Green (no-match) | **No** approved, non-expired service with `category: "Education & Tutoring"` and `serviceAreas` including `"Symonds Green"`. If such a service exists, this test will fail. |

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
- Same as above, but for the normal user account used by matching tests.

**Test times out waiting for a card or element**
- The required seed data is missing. Check the tables above for what each test needs in Firestore.
- The account may not have completed onboarding — the AuthGuard will redirect to `/onboarding` instead of showing the expected page.

**"No matching services found" when matches were expected (or vice versa)**
- The seed data doesn't match the test's category/location combination. Check `category`, `serviceAreas`, `status`, and `expiresAt` on the Firestore document.

**Firestore query fails with an index error**
- Composite indexes are needed for `status` + `expiresAt` queries on each collection. Firestore logs the exact index creation link in the browser console. Open the link to create the index, wait a few minutes, then re-run.

**Tests pass on Desktop Chrome but fail on Mobile Chrome (or vice versa)**
- Both projects run by default. Use `--project "Desktop Chrome"` to run only one:
  ```bash
  npx playwright test --project "Desktop Chrome"
  ```

**Form submission fails silently**
- The WhatsApp or phone field may be empty. The form requires at least one contact method. The `createRequest()` helper passes a WhatsApp number by default.
