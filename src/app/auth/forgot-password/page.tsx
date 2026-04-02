"use client";

/**
 * Forgot Password Page
 * --------------------
 * Sends a Firebase password-reset email.
 *
 * Security: the success response is always generic — we never reveal
 * whether an account exists for a given email address.
 * auth/user-not-found is treated identically to a successful send.
 */

import { useState, type FormEvent } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";

      // Always show the generic success state — never reveal whether the email exists
      if (message.includes("user-not-found")) {
        setSent(true);
        return;
      }

      // Surface only validation / rate-limit errors
      if (message.includes("invalid-email")) {
        setError("Please enter a valid email address.");
      } else if (message.includes("too-many-requests")) {
        setError("Too many attempts. Please wait before trying again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      {sent ? (
        /* ── Success state ────────────────────────────── */
        <div className="text-center space-y-3 py-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto text-white text-lg font-bold"
            style={{ backgroundColor: 'var(--color-primary)' }}
            aria-hidden="true"
          >
            ✓
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            Check your email
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            If an account exists for that email, a reset link has been sent.
          </p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Didn&apos;t receive it? Check your spam folder.
          </p>
          <div className="pt-3">
            <Link
              href="/auth/sign-in"
              className="text-sm font-medium hover:underline"
              style={{ color: 'var(--color-primary)' }}
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      ) : (
        /* ── Request form ─────────────────────────────── */
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
              Reset your password
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

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
              <label
                htmlFor="resetEmail"
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--color-text)' }}
              >
                Email address
              </label>
              <input
                id="resetEmail"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[var(--brand-primary)] text-[var(--brand-on-primary)] font-semibold text-base min-h-[48px] hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: 'var(--color-muted)' }}>
            <Link
              href="/auth/sign-in"
              className="font-medium hover:underline"
              style={{ color: 'var(--color-primary)' }}
            >
              ← Back to sign in
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
