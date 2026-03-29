# NIS Hub

Mobile-first community hub for Naijas in Stevenage.

## What it is
- structured community platform for services, side hustles, requests, events, notices
- WhatsApp remains live announcements layer; NIS Hub is structured, searchable, and role-governed
- stack: Next.js + TypeScript + Tailwind + Firebase + PWA

## How to run
1. `npm install`
2. `npm run lint`
3. `npm run dev`
4. Open `http://localhost:3000`

## Project docs
- `CLAUDE.md` (project brain)
- `docs/prd.md`
- `docs/ranking-policy.md`
- `docs/ux-principles.md`
- `docs/launch-checklist.md`
- `docs/decisions.md`

## Architecture guidance
- App Router in `src/app`
- `src/components` for shared UI
- `src/types` for model definitions
- `src/services` for Firebase wrappers

## Safety disclaimer
Do not add business logic or Firebase config until core planning documents are reviewed and the first epic is approved.
