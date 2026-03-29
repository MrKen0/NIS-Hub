/**
 * User / Member Types for NIS Hub
 * --------------------------------
 * These types define who a member is, what they can do, and their current status.
 */

// What the member does in the community
export type UserRole = "member" | "provider" | "contributor" | "admin";

// Where they are in the approval pipeline
export type UserStatus = "pending" | "approved" | "paused" | "archived";

// What they picked during onboarding as their intended use
export type IntendedUse = "member" | "provider" | "contributor";

// The full member profile stored in Firestore at users/{uid}
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone: string;              // empty string if not provided
  area: string;               // e.g. "Old Town", "Pin Green", "Bedwell"
  role: UserRole;
  status: UserStatus;
  intendedUse: IntendedUse;
  rulesAccepted: boolean;
  rulesAcceptedAt: Date | null;
  onboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// The shape of data collected during the onboarding form
export interface OnboardingData {
  displayName: string;
  phone: string;
  area: string;
  intendedUse: IntendedUse;
  rulesAccepted: boolean;
}
