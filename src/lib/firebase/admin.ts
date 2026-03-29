/**
 * Firebase Admin SDK — Server Only
 * ----------------------------------
 * Used in API routes, server components, and server actions.
 * This runs on the server and has full access to Firebase (no security rules apply).
 *
 * IMPORTANT: Never import this file from a client component.
 * If you see "firebase-admin" in the browser bundle, something is wrong.
 *
 * Usage in a server file:
 *   import { adminAuth, adminDb, adminStorage } from "@/lib/firebase/admin";
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { firebaseAdminConfig } from "./config";

// Only initialise once — same hot-reload guard as the client SDK
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: firebaseAdminConfig.projectId,
      clientEmail: firebaseAdminConfig.clientEmail,
      privateKey: firebaseAdminConfig.privateKey,
    }),
  });
}

// --- Admin Auth: verify tokens, set custom claims (roles), manage users ---
export const adminAuth = getAuth();

// --- Admin Firestore: read/write any document without security rules ---
export const adminDb = getFirestore();

// --- Admin Storage: manage uploaded files ---
export const adminStorage = getStorage();
