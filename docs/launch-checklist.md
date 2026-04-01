# NIS Hub — Controlled Testing Readiness Checklist

> **Scope:** This checklist covers the minimum required for a safe, credible controlled test
> with a small known group. It is not a full public launch checklist.
>
> **Project:** `nis-hub-10ac3` (Firebase)
> **Last updated:** check against current codebase state before each test session.

---

## 1. Firebase Deployment

| Item | Command / Action | Done |
|---|---|---|
| Logged in to Firebase CLI | `firebase login` | [ ] |
| Correct project selected | `firebase use nis-hub-10ac3` | [ ] |
| Firestore rules + indexes deployed | `firebase deploy --only firestore` | [ ] |
| Storage rules deployed | `firebase deploy --only storage` | [ ] |
| Rules timestamp verified in Firebase console | Firestore → Rules → check "Last deployed" | [ ] |
| All 14 indexes show "Enabled" in Firebase console | Firestore → Indexes (allow 2–5 min to build) | [ ] |

---

## 2. Firebase Project Configuration

| Item | Action | Done |
|---|---|---|
| Email/password Auth provider enabled | Firebase console → Authentication → Sign-in method | [ ] |
| At least one admin user exists | Firestore → `users/{uid}` → set `role: "admin"`, `status: "approved"` manually | [ ] |
| Admin user can access `/admin` | Sign in as admin, navigate to `/admin` — dashboard loads | [ ] |
| Firebase Storage bucket accessible | Try uploading a test image via the app or console | [ ] |

---

## 3. Build and Code Quality

| Item | Command | Done |
|---|---|---|
| Build passes with no errors | `npm run build` | [ ] |
| Lint passes (4 warnings on `next/image` are acceptable) | `npm run lint` | [ ] |

---

## 4. Test Data

| Item | Command / Action | Done |
|---|---|---|
| Old test data cleaned | `node scripts/seed-test-data.mjs --clean` | [ ] |
| Fresh test data seeded | `node scripts/seed-test-data.mjs` | [ ] |
| Seed confirmed in Firestore console | Verify 5 `[TEST]` service listings + 1 product listing present | [ ] |

---

## 5. E2E Test Suite

Run the full suite against the live Firebase project. All tests must pass before inviting testers.

| Spec file | Command | Result |
|---|---|---|
| Requests (My Requests + preview flow) | `npx playwright test tests/e2e/requests.spec.ts` | [ ] Pass / [ ] Fail |
| Filtering | `npx playwright test tests/e2e/filtering.spec.ts` | [ ] Pass / [ ] Fail |
| Matching | `npx playwright test tests/e2e/matching.spec.ts` | [ ] Pass / [ ] Fail |
| Moderation | `npx playwright test tests/e2e/moderation.spec.ts` | [ ] Pass / [ ] Fail |
| **Full suite** | `npx playwright test` | [ ] Pass / [ ] Fail |

> **Note:** Run requests and filtering tests before moderation tests.
> Moderation tests consume seed data — re-seed with `--clean` + `seed` before re-running.

---

## 6. Manual Smoke Test

Walk through each flow manually with a real browser session. See `docs/testing.md → Pre-Submit Match Preview` for the full preview flow steps.

| Flow | Description | Result |
|---|---|---|
| 1 | New user sign-up → onboarding → home (pending status shown) | [ ] Pass / [ ] Fail |
| 2 | Admin approves new member — real-time update, no refresh needed | [ ] Pass / [ ] Fail |
| 3 | Browse services with category / area / keyword filters | [ ] Pass / [ ] Fail |
| 4 | Create request → pre-submit preview → "Post anyway" → success | [ ] Pass / [ ] Fail |
| 4b | Create request with "Need a Product" → no preview, direct success | [ ] Pass / [ ] Fail |
| 5 | Admin approves and rejects seeded service listings | [ ] Pass / [ ] Fail |
| 5b | Admin history tab shows logged moderation actions | [ ] Pass / [ ] Fail |
| 6 | Test user views request detail → sees matching services → clicks WhatsApp | [ ] Pass / [ ] Fail |

---

## 7. Privacy and Legal (minimum for any real-user testing)

| Item | Status | Done |
|---|---|---|
| Privacy notice visible on onboarding page (above community rules) | Added to `src/app/onboarding/page.tsx` | [ ] |
| Privacy notice covers: data collected, storage location, who can see it, deletion contact | Verified in browser | [ ] |
| Community rules checkbox present and required | Verified — form rejects submit without it | [ ] |
| Age confirmation (16+) in privacy notice | Included in privacy notice text | [ ] |
| Deletion contact email available to users | Add admin contact email to privacy notice text | [ ] |

> **Action required:** Replace the placeholder deletion contact in the privacy notice with a real
> email address before inviting any testers.

---

## 8. Tester Onboarding (before inviting anyone)

| Item | Action | Done |
|---|---|---|
| Testers briefed on controlled-test purpose | Verbal or written | [ ] |
| Testers told the app is not yet public | Set expectations | [ ] |
| Admin contact shared for issues and data deletion requests | Share email/WhatsApp | [ ] |
| At least one admin available during the test session | Confirm availability | [ ] |

---

## 9. Known Gaps (do not block controlled testing on these)

These are documented, accepted gaps for this stage. Track separately.

| Gap | Impact | Target |
|---|---|---|
| No unit tests for service logic (`matchingService`, `moderationService`, etc.) | Low — covered by E2E and manual testing at this scale | Before public launch |
| Roles use Firestore reads (not custom claims) | Low latency overhead at small scale | Before scaling |
| No monitoring or error alerting | Silent failures not visible to admin | Before public launch |
| 4 × `<img>` ESLint warnings (should use `next/image`) | Minor LCP impact | Before public launch |
| Ranking algorithm not implemented (Cloud Functions) | Current ordering is `createdAt` desc — acceptable for testing | Post-MVP |
| No push or email notifications | Manual checks required | Post-MVP |

---

## Sign-off

| Role | Name | Date | Signature |
|---|---|---|---|
| Admin / community lead | | | |
| Technical lead | | | |
