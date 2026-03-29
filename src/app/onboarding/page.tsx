"use client";

/**
 * Onboarding Page
 * ----------------
 * Shown once after first sign-up. Collects:
 * - Display name
 * - Phone (optional)
 * - Area in Stevenage
 * - Intended use (member / provider / contributor)
 * - Acceptance of community rules
 *
 * Creates the Firestore user profile on submit.
 */

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { createUserProfile } from "@/services/userProfile";
import { useRouter } from "next/navigation";
import type { IntendedUse } from "@/types/user";

// Common areas in Stevenage for the dropdown
const STEVENAGE_AREAS = [
  "Bedwell",
  "Broadwater",
  "Chells",
  "Great Ashby",
  "Old Town",
  "Pin Green",
  "Shephall",
  "St Nicholas",
  "Symonds Green",
  "Woodfield",
  "Other",
];

// The three intended-use options
const INTENDED_USE_OPTIONS: { value: IntendedUse; label: string; desc: string }[] = [
  {
    value: "member",
    label: "Community Member",
    desc: "Browse services, attend events, stay connected",
  },
  {
    value: "provider",
    label: "Service Provider",
    desc: "List your business, skills, or products",
  },
  {
    value: "contributor",
    label: "Contributor",
    desc: "Request access to organise events, post notices, help moderate",
  },
];

export default function OnboardingPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [intendedUse, setIntendedUse] = useState<IntendedUse>("member");
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Not signed in → go to sign-in; already onboarded → go home
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/sign-in");
    } else if (profile?.onboardingComplete) {
      router.replace("/");
    }
  }, [loading, user, profile, router]);

  // Show nothing while redirect is pending
  if (!loading && (!user || profile?.onboardingComplete)) {
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!area) {
      setError("Please select your area.");
      return;
    }
    if (!rulesAccepted) {
      setError("You must accept the community rules to continue.");
      return;
    }
    if (!user) return;

    setSubmitting(true);

    try {
      await createUserProfile(user.uid, user.email ?? "", {
        displayName: displayName.trim(),
        phone: phone.trim(),
        area,
        intendedUse,
        rulesAccepted,
      });

      // Refresh the profile in AuthContext so route guards see it
      await refreshProfile();
      router.push("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="w-8 h-8 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 bg-[var(--bg)]">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--text)]">Welcome to NIS Hub</h1>
          <p className="text-[var(--muted)] mt-1">
            Tell us a little about yourself to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              {error}
            </div>
          )}

          {/* Display name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-[var(--text)] mb-1">
              Your name
            </label>
            <input
              id="displayName"
              type="text"
              required
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How should we call you?"
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
            />
          </div>

          {/* Phone (optional) */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[var(--text)] mb-1">
              Phone number <span className="text-[var(--muted)] font-normal">(optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+44 7123 456 789"
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
            />
          </div>

          {/* Email (read-only — comes from sign-up) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              readOnly
              value={user?.email ?? ""}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-gray-50 text-[var(--muted)] cursor-not-allowed"
            />
            <p className="text-xs text-[var(--muted)] mt-1">
              This is the email you signed up with
            </p>
          </div>

          {/* Area */}
          <div>
            <label htmlFor="area" className="block text-sm font-medium text-[var(--text)] mb-1">
              Area in Stevenage
            </label>
            <select
              id="area"
              required
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
            >
              <option value="" disabled>
                Select your area
              </option>
              {STEVENAGE_AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Intended use */}
          <fieldset>
            <legend className="block text-sm font-medium text-[var(--text)] mb-2">
              How will you use NIS Hub?
            </legend>
            <div className="space-y-2">
              {INTENDED_USE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    intendedUse === opt.value
                      ? "border-[var(--brand-primary)] bg-blue-50"
                      : "border-[var(--border)] bg-[var(--surface)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="intendedUse"
                    value={opt.value}
                    checked={intendedUse === opt.value}
                    onChange={() => setIntendedUse(opt.value)}
                    className="mt-0.5 accent-[var(--brand-primary)]"
                  />
                  <div>
                    <div className="font-medium text-sm text-[var(--text)]">{opt.label}</div>
                    <div className="text-xs text-[var(--muted)]">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Community rules */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <h3 className="font-medium text-sm text-[var(--text)] mb-2">Community Rules</h3>
            <ul className="text-xs text-[var(--muted)] space-y-1 mb-3 list-disc list-inside">
              <li>Be respectful to all community members</li>
              <li>No spam, scams, or misleading information</li>
              <li>Keep content relevant to the Stevenage Nigerian community</li>
              <li>Report concerns to moderators — do not escalate publicly</li>
              <li>Respect privacy — do not share others&apos; personal info</li>
            </ul>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rulesAccepted}
                onChange={(e) => setRulesAccepted(e.target.checked)}
                className="w-5 h-5 accent-[var(--brand-primary)] rounded"
              />
              <span className="text-sm text-[var(--text)]">
                I accept the community rules
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !rulesAccepted}
            className="w-full py-3 rounded-xl bg-[var(--brand-primary)] text-[var(--brand-on-primary)] font-semibold text-base min-h-[48px] hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {submitting ? "Setting up your profile..." : "Get started"}
          </button>
        </form>
      </div>
    </div>
  );
}
