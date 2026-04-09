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

---

## Phase 3C — Manual Verification Checklist

These steps are performed manually against the deployed app (or local dev server) after Phase 3C is deployed. No new Playwright tests are added for Phase 3C — existing moderation tests (which run as admin) must continue to pass.

### Pre-requisites

- Admin account (`ADMIN_EMAIL`) must be available.
- A second Firebase Auth account to promote to `moderator` (any approved member will do).

### Moderator role assignment

1. Sign in as admin. Go to `/admin` → Members tab.
2. Find the test member. Confirm the role dropdown shows **Member**, **Provider**, **Moderator** — and does **not** show Admin or Contributor.
3. Select **Moderator** from the dropdown. Confirm the confirmation dialog appears.
4. Confirm the action. Verify `users/{uid}.role === 'moderator'` in Firestore.
5. Verify a `moderationActions` document exists with `fieldChanged: 'role'`, `newValue: 'moderator'`.

### Moderator access — can do

6. Sign in as the newly promoted moderator.
7. Navigate to `/admin`. Confirm the dashboard loads (not redirected to home).
8. Confirm all content tabs are visible (Services, Products, Events, Notices, Requests).
9. Approve or reject a pending listing. Confirm the action succeeds.
10. Navigate to the Members tab. Confirm member cards are visible.
11. Navigate to `/create/notice`. Confirm the notice form loads (not the "Access restricted" message).
12. Navigate to the History tab. Confirm moderation history is visible.

### Moderator access — cannot do

13. On member cards: confirm the **role dropdown is not rendered** for the moderator.
14. On member cards: confirm the **"Assign team" / "Change team" button is not rendered** for the moderator.
15. In the browser console, attempt `fetch('/api/admin/...')` or a direct Firestore read of `contentPolicies` — confirm Firestore returns `permission-denied`.

### Contributor backward compatibility

16. If a member with `role: 'contributor'` exists, sign in as them.
17. Confirm they can access `/admin`, moderate content, and access `/create/notice`.
18. Sign in as admin. Confirm the contributor's role chip displays "Contributor" correctly on their member card.
19. Confirm the role dropdown on their card does **not** include a Contributor option (only Member, Provider, Moderator).

### Team assignment (admin-only)

20. Sign in as admin. Go to `/admin` → Members tab.
21. On any approved member card (not own account), confirm the **"Assign team"** button is visible.
22. Click **"Assign team"**. Confirm the modal opens with heading "Assign team" and the member's name.
23. Select a team (e.g. "Community Management Team") and a role (e.g. "Lead"). Click Confirm.
24. Verify `users/{uid}.team === 'Community Management Team'` and `teamRole === 'Lead'` in Firestore.
25. Verify a `moderationActions` document with `actionType: 'team_assignment'`, `fieldChanged: 'team_assignment'`, `newValue: 'Community Management Team (Lead)'`.
26. Return to the Members tab. Confirm the member card now shows the team row: **Team: Community Management Team (Lead)**.
27. Click **"Change team"**. Select "No team". Confirm.
28. Verify `team` and `teamRole` are `null` in Firestore. Verify `moderationActions` with `newValue: 'none'`.
29. Confirm the team row no longer appears on the member card.

### Regression — existing Playwright tests

```bash
node scripts/seed-test-data.mjs --clean
node scripts/seed-test-data.mjs
npx playwright test
```

All existing tests must pass. The moderation tests run as admin (`ADMIN_EMAIL`) which retains full access under `canModerate()`.

---

## Phase 4 — Manual Verification Checklist

### Bulk Actions (all 5 content panels)

- [ ] Sign in as admin or moderator → navigate to `/admin`
- [ ] Go to Services tab → filter: Pending → checkboxes appear on every card
- [ ] Check one card → card gets emerald ring highlight
- [ ] Check "Select all (n)" → all cards highlighted, count badge shows correctly
- [ ] Uncheck "Select all" → all deselected (label reverts to "Select all (n)")
- [ ] Select 2+ items → bulk bar appears above cards with action buttons and "{n} selected"
- [ ] Click "Approve N" → confirmation dialog shows correct count and description
- [ ] Confirm → success message "N items updated." displayed, selection cleared, cards refresh
- [ ] Select items → change filter tab → selection clears automatically
- [ ] With "Archived" filter active → bulk bar is NOT shown (archived is terminal)
- [ ] Simulate partial failure (disconnect one doc mid-run) → "{succeeded} updated, {failed} failed." shown
- [ ] Repeat full check on Products, Events, Notices, Requests tabs

**Action button visibility by filter:**
- [ ] Pending filter → shows: Approve, Reject, Archive
- [ ] Approved filter → shows: Pause, Archive
- [ ] Paused filter → shows: Approve, Archive
- [ ] Rejected filter → shows: Approve, Archive
- [ ] All / undefined filter → shows: Archive only
- [ ] Archived filter → bulk bar hidden entirely

### Home Dashboard Live Strips

- [ ] Sign in as approved user → events strip appears below hero card, above nav grid
- [ ] Notices strip appears below events strip
- [ ] Sign in as **pending** user → both strips still visible
- [ ] Each event card displays: date (day+month), title, location, "View →"
- [ ] Clicking an event card navigates to `/events/{id}`
- [ ] Each notice card displays: category pill, title, date, "View →"
- [ ] Clicking a notice card navigates to `/notices/{id}`
- [ ] With no approved events in Firestore → events strip (including "Upcoming Events" label) is hidden entirely
- [ ] With no approved notices in Firestore → notices strip (including "Community Notices" label) is hidden entirely
- [ ] On slow network → skeleton cards visible briefly during load
- [ ] Strips show max 5 items each (not the full collection)

### TypeScript + Lint

- [ ] `npx tsc --noEmit` → zero errors
- [ ] `npx eslint src/components/admin/AdminBulkActionBar.tsx src/components/admin/AdminContentCard.tsx src/components/admin/AdminServicePanel.tsx src/components/admin/AdminProductPanel.tsx src/components/admin/AdminEventPanel.tsx src/components/admin/AdminRequestPanel.tsx src/components/admin/AdminNoticePanel.tsx src/components/HomeEventStrip.tsx src/components/HomeNoticeStrip.tsx src/app/page.tsx --max-warnings 0` → zero warnings

### MVP Limitations Retained

- Bulk actions operate on currently-visible items only (the current filtered page)
- AdminNoticePanel uses one-time fetch (not real-time); list refreshes after each bulk action
- Home strips show up to 5 items each, ordered by `expiresAt` ascending (soonest first)
- Home strips use client-side fetch on mount; no real-time subscription

---

## Phase 5 — Fix + URL Fields + Image Expansion

### A. Product posting error surfacing

- [ ] Submit a product listing with all required fields but no images → error should read "Please add at least one product photo." (not generic)
- [ ] Intentionally break `checkContentSafety` (e.g. rename `contentPolicies` collection in emulator) → product/service/event/notice submissions each show a generic "Something went wrong" message without crashing or exposing internals
- [ ] Submit with an expired or missing auth token → error reads "Authentication error — please sign in again."
- [ ] Submit a product listing that triggers CONTENT_BLOCKED → "Your content could not be posted. Please review and try again." still shows

### B. linkUrl field (all 4 content types)

- [ ] Product: leave linkUrl blank → submits and Firestore `linkUrl` field is `null`
- [ ] Product: enter `https://example.com` → submits, `linkUrl` stored correctly
- [ ] Product: enter `ftp://example.com` → inline error "Link must start with http:// or https://"
- [ ] Product: enter `http://example.com` → accepted
- [ ] Repeat blank / valid / invalid for service, event, and notice
- [ ] Label check: Product = "Website or product link", Service = "Website or booking link", Event = "Event link", Notice = "Related link"
- [ ] Server-side: API rejects a crafted request with `linkUrl: "not-a-url"` → returns 400 with message "Link must start with http:// or https://"

### C. Image upload — events and notices

- [ ] Post an event with 1 image → image uploads to `content/{uid}/events/`, `events/{id}.imageUrls` has one URL
- [ ] Post an event with 6 images → all 6 URLs stored in Firestore
- [ ] Post an event with 7 images → ImageUpload component prevents the 7th from being added
- [ ] Post an event with no images → succeeds, `imageUrls` is `[]`
- [ ] Post a notice with 1 image → image uploads to `content/{uid}/notices/`
- [ ] Post a notice with no images → succeeds
- [ ] Upload an image >5 MB in the event form → inline error "Each image must be under 5MB."
- [ ] Upload a non-image file in the event form → inline error "Only JPEG, PNG, and WebP images are allowed."

### D. Products: max images raised to 6

- [ ] Product form shows "Photos (up to 6)" in the ImageUpload area
- [ ] Add 6 images to a product → "+ Add photo" button disappears
- [ ] Submit product with 6 images → all 6 URLs stored in `productListings/{id}.imageUrls`

### TypeScript + Lint

```bash
npx tsc --noEmit       # must pass with zero errors
npx eslint src         # zero new warnings in touched files
```

### Regression

```bash
node scripts/seed-test-data.mjs
npx playwright test
```

All pre-existing tests must continue to pass.

### MVP limitations retained

- Image uploads for products require at least one photo (server-enforced)
- Images for events and notices are optional
- `linkUrl` is optional for all content types and stored as `null` when blank
- Services do not support image upload (URL field only)

---

## Phase 5B — Service image upload

- [ ] Service form shows "Photos (up to 6)"
- [ ] Service can be submitted with zero images → succeeds, status `pending`
- [ ] Service can be submitted with 1 image → `serviceListings/{id}.imageUrls` has one URL
- [ ] Service can be submitted with up to 6 images → all 6 URLs stored
- [ ] Adding a 7th image is blocked in the ImageUpload component UI
- [ ] Oversized image (>5 MB) shows inline error "Each image must be under 5MB."
- [ ] Non-image file shows inline error "Only JPEG, PNG, and WebP images are allowed."
- [ ] Moderation status remains `pending` with and without images
- [ ] Thursday rule still applies (non-elevated users cannot post on other days)
- [ ] Valid linkUrl still saves correctly
- [ ] Blank linkUrl saves as `null` in Firestore

---

## Phase 6 — Listing Presentation

### A. Image carousel (ImageCarousel component)

- [ ] `ImageCarousel` returns nothing (no DOM node) when `imageUrls` is empty
- [ ] Single image: rendered, no dot indicators shown
- [ ] Two or more images: dot indicators appear at bottom of carousel
- [ ] Swiping left on mobile scrolls to next image (scroll-snap)
- [ ] Scrollbar is hidden on all browsers (Chrome, Firefox, Safari)

### B. Services browse page (`/services`)

- [ ] Featured service card with photos: top image (`h-32`) appears above card content
- [ ] Featured service card without photos: no empty placeholder — card shows text-only as before
- [ ] Featured service card with `linkUrl` set: "Has website" chip appears below description
- [ ] Featured service card without `linkUrl`: no chip shown
- [ ] Regular service list card with photos: `w-16 h-16` thumbnail shown on left
- [ ] Regular service list card without photos: no empty square — layout is text-only as before
- [ ] Regular service list card with `linkUrl` set: "Website" chip appears in the area row
- [ ] Regular service list card without `linkUrl`: no chip shown
- [ ] Clicking any service card (featured or list) navigates to `/services/{id}`

### C. Services detail page (`/services/{id}`)

- [ ] Service with photos: `ImageCarousel` at `h-64` appears between header and body
- [ ] Service without photos: no image section rendered
- [ ] Service with `linkUrl`: "Visit website ↗" button appears below WhatsApp/phone CTAs; opens in new tab with `rel="noopener noreferrer"`
- [ ] Service without `linkUrl`: no "Visit website" button

### D. Products browse page (`/products`)

- [ ] Featured product card with multiple images: `ImageCarousel` at `h-36`; dot indicators visible; swipeable
- [ ] Featured product card with single image: carousel renders, no dots
- [ ] Featured product card with no images: gradient fallback panel shown (no carousel)
- [ ] Grid product card: first image only shown (no carousel); behaviour unchanged

### E. Products detail page (`/products/{id}`)

- [ ] Product with images: `ImageCarousel` at `h-64`; swipeable; dots appear for multiple images
- [ ] Product with no images: `📦` no-photo fallback shown
- [ ] Product with `linkUrl`: "Shop link ↗" button appears below WhatsApp CTA; opens in new tab with `rel="noopener noreferrer"`
- [ ] Product without `linkUrl`: no "Shop link" button

### F. Events detail page (`/events/{id}`)

- [ ] Event with images: `ImageCarousel` at `h-64` appears between header and info grid
- [ ] Event without images: no image section rendered
- [ ] Event with `linkUrl`: "Event link ↗" button appears in CTA area; opens in new tab with `rel="noopener noreferrer"`
- [ ] Event without `linkUrl`: no "Event link" button
- [ ] Past event: "Event link ↗" still visible if `linkUrl` set (RSVP button hidden, link button shown)

### G. Notices detail page (`/notices/{id}`)

- [ ] Notice with images: `ImageCarousel` at `h-64` appears between header and body
- [ ] Notice without images: no image section rendered
- [ ] Notice with `linkUrl`: "Related link ↗" button appears below body text; opens in new tab with `rel="noopener noreferrer"`
- [ ] Notice without `linkUrl`: no "Related link" button

### H. My Listings — approved click-through

- [ ] Approved service card: "View listing →" link appears alongside Edit and Boost buttons
- [ ] Approved service "View listing →" navigates to `/services/{id}` (the correct live listing)
- [ ] Approved product card: "View listing →" link appears alongside Edit and Boost buttons
- [ ] Approved product "View listing →" navigates to `/products/{id}`
- [ ] Pending, rejected, paused, archived cards: no "View listing →" link shown
- [ ] Edit listing and Boost listing controls are unchanged and still functional

### TypeScript + Lint

```bash
npx tsc --noEmit       # must pass with zero errors
npx eslint src         # zero new warnings in touched files
```

### Regression

```bash
node scripts/seed-test-data.mjs
npx playwright test
```

All pre-existing tests must continue to pass.

### MVP limitations retained

- All `linkUrl` buttons use `target="_blank"` + `rel="noopener noreferrer"` (security hardened)
- `ImageCarousel` dot indicators are static (no active-slide tracking) — sufficient for mobile swipe UX
- Browse grid cards (products) remain first-image-only for scan speed; carousel only on detail and featured slots
- Service regular list cards show thumbnail only when photos exist; no forced empty placeholder
