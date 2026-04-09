/**
 * Firebase Client SDK — Browser / React Components
 * --------------------------------------------------
 * This file creates one shared Firebase app for the entire browser session.
 * It exports ready-to-use instances of Auth, Firestore, and Storage.
 *
 * Usage in any component or hook:
 *   import { auth, db, storage } from "@/lib/firebase/client";
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./config";

// Fail fast with a readable message if any client env vars are missing.
// Without this guard the Firebase SDK throws a cryptic auth/invalid-api-key
// error during Next.js prerender, which masks the real cause.
const missingClientVars = [
  ['NEXT_PUBLIC_FIREBASE_API_KEY',              firebaseConfig.apiKey],
  ['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',          firebaseConfig.authDomain],
  ['NEXT_PUBLIC_FIREBASE_PROJECT_ID',           firebaseConfig.projectId],
  ['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',       firebaseConfig.storageBucket],
  ['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',  firebaseConfig.messagingSenderId],
  ['NEXT_PUBLIC_FIREBASE_APP_ID',               firebaseConfig.appId],
].filter(([, value]) => !value).map(([name]) => name);

if (missingClientVars.length > 0) {
  throw new Error(
    `Missing Firebase client environment variables: ${missingClientVars.join(', ')}. ` +
    'Add them to your Vercel project (Production, Preview, and Development) or .env.local.',
  );
}

// Only create one Firebase app — reuse it if it already exists
// (Next.js hot-reloads during development, so this prevents duplicates)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// --- Auth: handles sign-in, sign-out, and user sessions ---
export const auth = getAuth(app);

// Use localStorage for auth persistence so Playwright storageState() can
// capture and replay auth tokens across test runs. Firebase 12+ defaults to
// IndexedDB which Playwright cannot serialize; localStorage works correctly.
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}

// --- Firestore: the main database for all NIS Hub data ---
export const db = getFirestore(app);

// --- Storage: for uploading images, files, etc. ---
export const storage = getStorage(app);

export default app;
