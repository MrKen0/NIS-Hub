# Project Rule: Firebase Security

- Firestore rules enforce role-based read/write for all collections.
- Use request.auth.uid and custom claims (`role`) consistently.
- Moderation actions allowed only for moderator/admin.
- Write operations are scoped by ownership or explicit admin perm.
- No direct access to user data except own profile fields.
- Storage rules mirror Firestore roles: `content/{uid}` and `public/{resource}`.
