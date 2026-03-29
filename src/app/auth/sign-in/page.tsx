"use client";

/**
 * Sign-In Page
 * -------------
 * Email + password login. Links to sign-up for new users.
 * Redirects to home if already signed in, or to onboarding if profile is incomplete.
 */

import { useEffect, useState, type FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If already signed in, redirect appropriately
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (!profile || !profile.onboardingComplete) {
      router.replace("/onboarding");
    } else {
      router.replace("/");
    }
  }, [loading, user, profile, router]);

  // Show nothing while redirect is pending
  if (!loading && user) {
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // AuthContext will pick up the state change and trigger redirect above
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sign-in failed. Please try again.";
      // Make Firebase error messages friendlier
      if (message.includes("invalid-credential") || message.includes("wrong-password")) {
        setError("Incorrect email or password.");
      } else if (message.includes("user-not-found")) {
        setError("No account found with this email. Try signing up instead.");
      } else if (message.includes("too-many-requests")) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Show nothing while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="w-8 h-8 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--bg)]">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--text)]">Welcome back</h1>
          <p className="text-[var(--muted)] mt-1">Sign in to NIS Hub</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text)] mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-[var(--brand-primary)] text-[var(--brand-on-primary)] font-semibold text-base min-h-[48px] hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Link to sign up */}
        <p className="text-center text-sm text-[var(--muted)] mt-6">
          New to the community?{" "}
          <Link href="/auth/sign-up" className="text-[var(--brand-primary)] font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
