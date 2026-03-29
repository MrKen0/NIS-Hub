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
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./config";

// Only create one Firebase app — reuse it if it already exists
// (Next.js hot-reloads during development, so this prevents duplicates)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// --- Auth: handles sign-in, sign-out, and user sessions ---
export const auth = getAuth(app);

// --- Firestore: the main database for all NIS Hub data ---
export const db = getFirestore(app);

// --- Storage: for uploading images, files, etc. ---
export const storage = getStorage(app);

export default app;
