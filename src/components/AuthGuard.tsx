"use client";

/**
 * AuthGuard — protects pages that require a signed-in, onboarded user
 * --------------------------------------------------------------------
 * Wrap any page content with <AuthGuard> to enforce authentication.
 *
 * Behaviour:
 * - Not signed in → redirect to /auth/sign-in
 * - Signed in but not onboarded → redirect to /onboarding
 * - Signed in and onboarded → show the children
 *
 * Usage:
 *   <AuthGuard>
 *     <YourPageContent />
 *   </AuthGuard>
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import type { ReactNode } from "react";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/sign-in");
    } else if (!profile || !profile.onboardingComplete) {
      router.replace("/onboarding");
    }
  }, [user, profile, loading, router]);

  // Show spinner while checking
  if (loading || !user || !profile?.onboardingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="w-8 h-8 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
