/**
 * Firebase Admin SDK — Server Only
 * ----------------------------------
 * Used in API routes, server components, and server actions.
 * This runs on the server and has full access to Firebase (no security rules apply).
 *
 * IMPORTANT: Never import this file from a client component.
 * If you see "firebase-admin" in the browser bundle, something is wrong.
 *
 * Lazy initialisation: the Admin SDK is NOT initialised at module import time.
 * This prevents build failures in environments where FIREBASE_ADMIN_* env vars
 * are absent (e.g. CI/CD `next build` steps). The app is created on the first
 * actual request that calls getAdminAuth() or getAdminDb().
 *
 * Usage in a server file:
 *   import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
 *   const auth = getAdminAuth();
 *   const db   = getAdminDb();
 */

import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { firebaseAdminConfig } from "./config";

function ensureInitialized(): void {
  if (getApps().length > 0) return;

  initializeApp({
    credential: cert({
      projectId:   firebaseAdminConfig.projectId,
      clientEmail: firebaseAdminConfig.clientEmail,
      privateKey:  firebaseAdminConfig.privateKey,
    }),
  });
}

// --- Lazy getters — only initialise the Admin SDK on first actual use ---

/** Returns the Admin Auth instance (initialises the Admin app on first call). */
export function getAdminAuth() {
  ensureInitialized();
  return getAuth();
}

/** Returns the Admin Firestore instance (initialises the Admin app on first call). */
export function getAdminDb() {
  ensureInitialized();
  return getFirestore();
}

/** Returns the Admin Storage instance (initialises the Admin app on first call). */
export function getAdminStorage() {
  ensureInitialized();
  return getStorage();
}

// Kept for any existing callers that import { adminAuth, adminDb, adminStorage }.
// These are now thin wrappers — property access triggers lazy initialisation.
// New code should prefer the getter functions above.
export const adminAuth    = { verifyIdToken: (...args: Parameters<ReturnType<typeof getAuth>['verifyIdToken']>) => getAdminAuth().verifyIdToken(...args) };
export const adminDb      = new Proxy({} as ReturnType<typeof getFirestore>, { get(_t, p) { return (getAdminDb() as unknown as Record<string | symbol, unknown>)[p]; } });
export const adminStorage = new Proxy({} as ReturnType<typeof getStorage>,   { get(_t, p) { return (getAdminStorage() as unknown as Record<string | symbol, unknown>)[p]; } });
