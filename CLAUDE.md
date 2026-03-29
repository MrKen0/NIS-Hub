# NIS Hub (Naijas in Stevenage) — CLAUDE Project Brain

## Product purpose
- Build a mobile-first community hub for Naijas in Stevenage.
- Complement WhatsApp for live chat/announcements with structured, searchable data for services, side hustles, requests, events, notices, and admin moderation.
- Enable safe growth with role-based access and PWA-ready experience.

## MVP modules
1. Auth (Firebase Auth): sign-in with email, phone, social
2. Directory + services marketplace (listing/search)
3. Community requests (help, tasks, goods)
4. Events calendar + RSVPs
5. Notices + announcements feed
6. Admin dashboard (approval, moderation logs, bans)
7. Firestore schema + security rules + storage for media

## Non-negotiables
- mobile-first UI (1x viewport first)
- full offline/read-then-write behavior for core feeds (PWA)
- role model (member, moderator, admin)
- Firebase Auth + Firestore + Storage only for early MVP
- accessible components (WCAG 2.1 AA)
- metrics hooks and logging for governance

## Coding standards
- Next.js 14 App Router + TypeScript
- Tailwind CSS utility-first with design tokens in `src/styles`
- strict mode plus ESLint + TypeScript `noImplicitAny`
- no inline SQL or string interpolated rule logic
- split by domain: `src/app`, `src/components`, `src/lib`, `src/types`, `src/services`
- unit tests for all data transformation + critical UI
- integration tests for major workflow (auth -> CRUD -> moderation)

## Auth and role model
- `user` (verified community member)
- `moderator` (content review, approve/decline requests/events)
- `admin` (manage users, rules, system config)
- plus soft roles: `guest` and `read-only` for public visitors
- session/session claims in Firebase Auth; role as a Firestore custom claim + role map document.

## Ranking policy principles
- Freshness (newer content is higher)
- Trust (verified author, higher role, completed reputation)
- Engagement (comments, likes, RSVPs) as secondary scoring
- Relevance (text match + geo proximity to Stevenage)
- Safety (auto-demote flagged content, moderators override)

## Mobile-first UI requirements
- touch target >= 44x44px
- skeleton loading states for all list screens
- adaptive layouts (single column mobile, 2-col tablet)
- sticky header/bottom action toolbar for key workflows
- swipe-to-refresh and invisible keyboard handling

## Testing expectations
- Jest + React Testing Library for components
- Playwright for end-to-end scenarios
- Firebase unit tests for security rules and Firestore model
- code coverage 80% minimum on critical modules

## Security rules
- strict `allow read, write` checks per role in Firestore
- service listings mutable by owner/moderator/admin only
- event add/update by organizer and moderator/admin
- request offer/demand prevents escalation and self-approval
- user profile updates require auth + role check
- storage with private `content/{uid}/*`, public posters in `public/{resource}/*`

## Use of Claude Code skills and subagents
- `plan-slice`: break an epic into small deliverables and acceptance tests
- `ui-polish`: generate accessible Tailwind-friendly component markup
- `ranking-policy`: iterate algorithm rules and test dataset scoring
- `firestore-guard`: derive Firestore rules from schema and threat model
- `release-check`: publish-ready checklist and postmortem template
- `planner` subagent: owns roadmap scopes and sprint plans
- `ui-critic` subagent: checks UI drafts vs mobile-first and accessibility rules
- `data-architect` subagent: validates schema, indexes, and query patterns
- `reviewer` subagent: final code and docs review before merge
