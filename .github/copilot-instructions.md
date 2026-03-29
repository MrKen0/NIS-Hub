# CoPilot Workspace Instructions

This is a Next.js + TypeScript + App Router + Tailwind CSS scaffold.

## Primary goal
- Assist developers by writing, refactoring, and reviewing code in `src/`.
- Keep the project minimal and production-ready.

## What to do first
1. Keep `package.json`, `tsconfig.json`, `next.config.js`, and `tailwind.config.ts` in sync with Next.js best practices.
2. Keep node modules install instructions under `npm install` and `npm run dev`.

## Conventions
- `src/app` is the App Router entry.
- Avoid old pages router files (`pages/`).
- Use the existing `globals.css` and Tailwind utilities.
- Keep components in `src/components` (create as needed).

## Linting / formatting
- Run `npm run lint` after code changes.
- Prefer ESLint + TypeScript rules from `.eslintrc.json`.

## Do not
- Do not add Firebase until explicitly requested.
- Do not add business logic before architecture plan.
- Do not scaffold duplicate project structure if present.

## When asked to bootstrap new features
- Ask for scope (API routes, auth, DB, UI states).
- Confirm major dependencies (Firebase, Prisma, Supabase) before install.

## Useful commands
- `npm install`
- `npm run dev`
- `npm run lint`
- `npm run build`

## Optional follow-up agent tasks
- `/create-agent: styleguide` (UI component conventions, e.g., atomic components)
- `/create-agent: tests` (unit and integration test scaffolding)
- `/create-agent: ci-cd` (GitHub Actions workflow for lint/build/test)
