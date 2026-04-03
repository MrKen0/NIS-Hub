"use client";

/**
 * AdminGuard — protects admin/moderator pages
 * ---------------------------------------------
 * Extends AuthGuard behaviour with an extra role check.
 *
 * Behaviour:
 * - Not signed in → redirect to /auth/sign-in
 * - Not onboarded → redirect to /onboarding
 * - Not admin / moderator / contributor → redirect to / (home)
 * - Allowed role → show the children
 *
 * Role access:
 *   admin       — full access
 *   moderator   — full content moderation access; no role/team assignment controls
 *   contributor — transitional alias for moderator (backward compat, not newly assigned)
 *
 * Usage:
 *   <AdminGuard>
 *     <AdminDashboard />
 *   </AdminGuard>
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import type { ReactNode } from "react";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  // Transitional: contributor included alongside moderator for backward compat.
  const canAccessAdmin =
    profile?.role === 'admin' ||
    profile?.role === 'moderator' ||
    profile?.role === 'contributor';

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/sign-in");
    } else if (!profile || !profile.onboardingComplete) {
      router.replace("/onboarding");
    } else if (!canAccessAdmin) {
      router.replace("/");
    }
  }, [user, profile, loading, router, canAccessAdmin]);

  if (loading || !user || !profile?.onboardingComplete || !canAccessAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="w-8 h-8 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
