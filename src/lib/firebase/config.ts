/**
 * Firebase Configuration
 * ---------------------
 * Reads Firebase settings from environment variables.
 * NEXT_PUBLIC_ vars are safe for the browser — they are public project identifiers, not secrets.
 * The Admin SDK vars (without NEXT_PUBLIC_) stay on the server and are never sent to the browser.
 *
 * To set these up:
 * 1. Go to https://console.firebase.google.com
 * 2. Open your project → Project Settings
 * 3. Copy the values into your .env.local file (see .env.local.example)
 */

// --- Client-side config (safe to use in React components) ---
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// --- Server-side config (only used in API routes and server components) ---
export const firebaseAdminConfig = {
  // .trim() guards against trailing newlines that creep in when env vars are set
  // via `echo "value" | vercel env add` (echo appends \n) or copy-paste in dashboards.
  projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID?.trim(),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim(),
  // The private key comes as a string with literal "\n" — we convert to real newlines.
  // We do NOT trim the private key: leading/trailing newlines are part of PEM format.
  privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};
