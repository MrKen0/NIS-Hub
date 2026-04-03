/**
 * Content Policy Types
 * ---------------------
 * Types for the contentPolicies Firestore collection.
 * This collection is admin-only and never readable from the client.
 * Policy documents are loaded server-side via the Admin SDK only.
 */

export type ContentPolicyType = 'blocked' | 'flagged';

export interface SafetyCheckResult {
  /** If true, the content must not be saved. */
  blocked: boolean;
  /** If true, the content may be saved but should be flagged for moderator review. */
  flagged: boolean;
  // The matched keyword is intentionally NOT included — never expose keyword
  // lists to callers or store matched terms in content documents.
}
