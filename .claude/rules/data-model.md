# Project Rule: Data Model

- Keep content models normalized with minimal duplication.
- Core collections: `users`, `services`, `requests`, `events`, `notices`, `moderationActions`, `rankings`.
- Use explicit parent-child subcollections only when required (e.g., `events/{eventId}/rsvps`).
- Include `createdAt`, `updatedAt`, `status`, `authorId`, `location` where needed.
- Schema docs should be separate from rules (in `docs/`).
