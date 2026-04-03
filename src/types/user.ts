/**
 * User / Member Types for NIS Hub
 * --------------------------------
 * These types define who a member is, what they can do, and their current status.
 */

// What the member does in the community
// 'moderator' is the formal role for content reviewers going forward.
// 'contributor' is retained as a transitional alias — existing holders keep full access.
// New moderation appointments should use 'moderator' only.
export type UserRole = "member" | "provider" | "contributor" | "moderator" | "admin";

// Where they are in the approval pipeline
export type UserStatus = "pending" | "approved" | "paused" | "archived";

// What they picked during onboarding as their intended use.
// "member" is the base identity — always present.
// "provider" and "contributor" are optional additions.
export type IntendedUse = "member" | "provider" | "contributor";

// The full member profile stored in Firestore at users/{uid}
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone: string;              // empty string if not provided
  area: string;               // e.g. "Old Town", "Pin Green", "Bedwell", or free text if "Other"
  role: UserRole;
  status: UserStatus;
  intendedUses: IntendedUse[]; // always contains at least "member"
  rulesAccepted: boolean;
  rulesAcceptedAt: Date | null;
  onboardingComplete: boolean;
  team?: string;          // primary team assignment (single team — multi-team deferred)
  teamRole?: 'Lead' | 'Member';
  createdAt: Date;
  updatedAt: Date;
}

// The shape of data collected during the onboarding form
export interface OnboardingData {
  displayName: string;
  phone: string;
  area: string;
  intendedUses: IntendedUse[]; // always contains at least "member"
  rulesAccepted: boolean;
}
