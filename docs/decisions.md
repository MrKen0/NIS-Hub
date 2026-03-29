# Architecture Decisions

## AD-001: Stack chosen
- Next.js App Router, TypeScript, Tailwind
- Firebase Auth, Firestore, Storage
- PWA-Ready (service worker + manifest)

## AD-002: Mobile-first
- UI built for 320-480px first, then responsive to 1024px.

## AD-003: Role model
- `user`, `moderator`, `admin` via custom claims and Firestore mapping.

## AD-004: Data and security rules
- Firestore rules are authoritative for all data access.
- Every write path requires role check.

## AD-005: Search and ranking
- use precomputed score threads and collections for endpoint performance.

## AD-006: No real-time chat
- WhatsApp for live chat; this app is structured and curated.
