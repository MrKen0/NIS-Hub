"use client";

/**
 * AdminGuard — protects admin-only pages
 * ----------------------------------------
 * Extends AuthGuard behaviour with an extra role check.
 *
 * Behaviour:
 * - Not signed in → redirect to /auth/sign-in
 * - Not onboarded → redirect to /onboarding
 * - Not admin → redirect to / (home)
 * - Admin → show the children
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

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/sign-in");
    } else if (!profile || !profile.onboardingComplete) {
      router.replace("/onboarding");
    } else if (profile.role !== "admin") {
      router.replace("/");
    }
  }, [user, profile, loading, router]);

  if (loading || !user || !profile?.onboardingComplete || profile.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="w-8 h-8 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
