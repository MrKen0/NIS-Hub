"use client";

/**
 * Onboarding Page
 * ----------------
 * Shown once after first sign-up. Collects:
 * - Display name
 * - Phone (optional)
 * - Area in Stevenage ("Other" reveals a free-text input)
 * - Participation intent — multi-select checkboxes
 *   "member" is always on (base identity); "provider" and "contributor" are optional additions
 * - Acceptance of community rules
 *
 * Creates the Firestore user profile on submit.
 */

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { createUserProfile } from "@/services/userProfile";
import { useRouter } from "next/navigation";
import { STEVENAGE_AREAS } from "@/types/content";
import type { IntendedUse } from "@/types/user";

// Optional participation intents the user can add on top of the base "member" identity
const OPTIONAL_INTENTS: { value: Exclude<IntendedUse, "member">; label: string; desc: string }[] = [
  {
    value: "provider",
    label: "Service Provider / Seller",
    desc: "List your business, skills, or products for the community",
  },
  {
    value: "contributor",
    label: "Contributor",
    desc: "Organise events, post notices, or help moderate content",
  },
];

export default function OnboardingPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [areaOther, setAreaOther] = useState("");
  // "member" is always included — users can additionally select provider / contributor
  const [optionalIntents, setOptionalIntents] = useState<Set<Exclude<IntendedUse, "member">>>(new Set());
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

  function toggleIntent(value: Exclude<IntendedUse, "member">) {
    setOptionalIntents((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  // The area value actually stored: custom text if "Other" was selected, otherwise the dropdown value
  function resolvedArea(): string {
    if (area === "Other") {
      return areaOther.trim() || "Other";
    }
    return area;
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
    if (area === "Other" && !areaOther.trim()) {
      setError("Please describe your area.");
      return;
    }
    if (!rulesAccepted) {
      setError("You must accept the community rules to continue.");
      return;
    }
    if (!user) return;

    setSubmitting(true);

    const intendedUses: IntendedUse[] = ["member", ...Array.from(optionalIntents)];

    try {
      await createUserProfile(user.uid, user.email ?? "", {
        displayName: displayName.trim(),
        phone: phone.trim(),
        area: resolvedArea(),
        intendedUses,
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
              onChange={(e) => { setArea(e.target.value); setAreaOther(""); }}
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

            {/* Reveal free-text input when "Other" is selected */}
            {area === "Other" && (
              <input
                id="areaOther"
                type="text"
                required
                autoComplete="off"
                value={areaOther}
                onChange={(e) => setAreaOther(e.target.value)}
                placeholder="Describe your area (e.g. Martins Wood)"
                className="mt-2 w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
              />
            )}
          </div>

          {/* Participation intent */}
          <fieldset>
            <legend className="block text-sm font-medium text-[var(--text)] mb-1">
              How will you use NIS Hub?
            </legend>
            <p className="text-xs text-[var(--muted)] mb-3">
              All members can browse, attend events, and post requests. Tick anything extra that applies to you.
            </p>

            {/* "Member" — always on, not removable */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-[var(--brand-primary)] bg-blue-50 mb-2 opacity-80">
              <input
                type="checkbox"
                checked
                readOnly
                aria-label="Community Member — always included"
                className="mt-0.5 w-4 h-4 accent-[var(--brand-primary)]"
              />
              <div>
                <div className="font-medium text-sm text-[var(--text)]">Community Member</div>
                <div className="text-xs text-[var(--muted)]">Browse services, attend events, stay connected</div>
              </div>
            </div>

            {/* Optional intents */}
            <div className="space-y-2">
              {OPTIONAL_INTENTS.map((opt) => {
                const checked = optionalIntents.has(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      checked
                        ? "border-[var(--brand-primary)] bg-blue-50"
                        : "border-[var(--border)] bg-[var(--surface)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleIntent(opt.value)}
                      className="mt-0.5 w-4 h-4 accent-[var(--brand-primary)]"
                    />
                    <div>
                      <div className="font-medium text-sm text-[var(--text)]">{opt.label}</div>
                      <div className="text-xs text-[var(--muted)]">{opt.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Privacy notice */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--muted)] space-y-1">
            <p className="font-semibold text-[var(--text)]">Your data and privacy</p>
            <p>
              When you join NIS Hub, we store your name, email address, phone number, and area
              in Google Firebase (cloud-hosted, EU region). This information is used to run the
              community, enable moderation, and connect you with local services.
            </p>
            <p>
              Community moderators and admins can see your profile. Other members can see your
              display name on content you post. Your phone number is only shared when you choose
              to contact a service provider directly.
            </p>
            <p>
              To request deletion of your data, email{" "}
              <a
                href="mailto:mrkeno@gmail.com"
                className="underline hover:no-underline"
              >
                mrkeno@gmail.com
              </a>
              . By continuing you confirm you are 16 or over.
            </p>
          </div>

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
