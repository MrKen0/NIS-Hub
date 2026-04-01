/**
 * User Profile Service
 * ---------------------
 * Handles reading and writing member profiles in Firestore.
 * All profiles live in the "users" collection, keyed by Firebase Auth UID.
 *
 * Usage:
 *   import { createUserProfile, getUserProfile } from "@/services/userProfile";
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { UserProfile, OnboardingData } from "@/types/user";

// Reference to a user's document in Firestore
function userRef(uid: string) {
  return doc(db, "users", uid);
}

/**
 * Fetch a member's profile from Firestore.
 * Returns null if the profile doesn't exist yet (new user, pre-onboarding).
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userRef(uid));
  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName,
    phone: data.phone ?? "",
    area: data.area ?? "",
    role: data.role,
    status: data.status,
    // Backward-compat: old docs have intendedUse (string), new docs have intendedUses (array).
    // Invariant: "member" is always present; no duplicates.
    // old "provider"     → ["member", "provider"]
    // old "contributor"  → ["member", "contributor"]
    // old "member"       → ["member"]
    // new array missing "member" → "member" prepended
    intendedUses: Array.from(new Set<import("@/types/user").IntendedUse>([
      "member",
      ...(Array.isArray(data.intendedUses)
        ? (data.intendedUses as import("@/types/user").IntendedUse[])
        : typeof data.intendedUse === "string" && data.intendedUse !== "member"
          ? [data.intendedUse as import("@/types/user").IntendedUse]
          : []),
    ])),
    rulesAccepted: data.rulesAccepted ?? false,
    rulesAcceptedAt: data.rulesAcceptedAt?.toDate() ?? null,
    onboardingComplete: data.onboardingComplete ?? false,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  };
}

/**
 * Create the initial profile after onboarding.
 * Called once when a new user completes the onboarding form.
 *
 * SECURITY:
 * - Role is always "member" — intendedUse stores what they requested.
 *   An admin must manually promote users to provider/contributor/admin.
 * - Refuses to overwrite if a profile already exists (prevents re-onboarding
 *   from resetting an admin-promoted role back to "member").
 */
export async function createUserProfile(
  uid: string,
  email: string,
  onboarding: OnboardingData
): Promise<void> {
  // Guard: do not overwrite an existing profile
  const existing = await getDoc(userRef(uid));
  if (existing.exists()) {
    throw new Error("Profile already exists. Cannot re-onboard.");
  }

  await setDoc(userRef(uid), {
    uid,
    email,
    displayName: onboarding.displayName,
    phone: onboarding.phone || "",
    area: onboarding.area,
    // Everyone starts as "member" — intendedUse is a request, not a grant
    role: "member",
    // All new users start as pending until an admin approves
    status: "pending",
    intendedUses: onboarding.intendedUses,
    rulesAccepted: onboarding.rulesAccepted,
    rulesAcceptedAt: serverTimestamp(),
    onboardingComplete: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update specific fields on an existing profile.
 * Used for future profile edits (not onboarding).
 */
export async function updateUserProfile(
  uid: string,
  fields: Partial<Pick<UserProfile, "displayName" | "phone" | "area">>
): Promise<void> {
  await updateDoc(userRef(uid), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}
