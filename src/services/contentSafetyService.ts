/**
 * Content Safety Service — SERVER ONLY
 * ---------------------------------------
 * Checks submission text against keyword policy lists stored in the
 * contentPolicies Firestore collection.
 *
 * IMPORTANT: Import this file only from API routes (Node.js server context).
 * It uses the Admin SDK and must never be bundled into the browser.
 *
 * Caching: keyword lists are cached in-process for 5 minutes to avoid
 * a Firestore read on every submission. Cache is rebuilt automatically
 * on the first call after the TTL expires.
 */

import { adminDb } from '@/lib/firebase/admin';
import type { SafetyCheckResult } from '@/types/contentPolicy';

let blockedKeywords: string[] = [];
let flaggedKeywords: string[] = [];
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function loadPolicies(): Promise<void> {
  if (Date.now() < cacheExpiresAt) return; // cache still fresh

  const snap = await adminDb
    .collection('contentPolicies')
    .where('enabled', '==', true)
    .get();

  const blocked: string[] = [];
  const flagged: string[] = [];

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    if (data.type === 'blocked' && Array.isArray(data.keywords)) {
      blocked.push(...(data.keywords as string[]));
    } else if (data.type === 'flagged' && Array.isArray(data.keywords)) {
      flagged.push(...(data.keywords as string[]));
    }
  }

  blockedKeywords = blocked;
  flaggedKeywords = flagged;
  cacheExpiresAt = Date.now() + CACHE_TTL_MS;
}

/**
 * Check whether text contains any blocked or flagged keywords.
 *
 * Blocked  → must not be saved; throw / return 400 to the client.
 * Flagged  → save with flagged:true, flagReason:'keyword_policy'; no client error.
 *
 * The matched keyword is intentionally NOT included in the result — it must
 * never be returned to the client or stored in content documents.
 */
export async function checkContentSafety(text: string): Promise<SafetyCheckResult> {
  await loadPolicies();

  const norm = text.toLowerCase();

  // Blocked check first — short-circuits before flagged check
  for (const kw of blockedKeywords) {
    if (norm.includes(kw.toLowerCase())) {
      return { blocked: true, flagged: false };
    }
  }

  for (const kw of flaggedKeywords) {
    if (norm.includes(kw.toLowerCase())) {
      return { blocked: false, flagged: true };
    }
  }

  return { blocked: false, flagged: false };
}
