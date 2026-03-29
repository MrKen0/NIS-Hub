"use client";

/**
 * Home Page
 * ----------
 * The main landing screen for signed-in users.
 * Protected by AuthGuard — unauthenticated users are redirected to sign-in.
 * Shows the user's profile summary and placeholder sections for future features.
 */

import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/lib/auth/AuthContext";

// Friendly labels for roles and statuses
const ROLE_LABELS: Record<string, string> = {
  member: "Community Member",
  provider: "Service Provider",
  contributor: "Contributor",
  admin: "Admin",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending approval",
  approved: "Approved",
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};

export default function Home() {
  return (
    <AuthGuard>
      <AppShell>
        <HomeContent />
      </AppShell>
    </AuthGuard>
  );
}

function HomeContent() {
  const { profile } = useAuth();

  if (!profile) return null;

  const isPending = profile.status === "pending";

  return (
    <div className="space-y-4">
      {/* Welcome card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Welcome, {profile.displayName}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {ROLE_LABELS[profile.role] ?? profile.role} · {profile.area}
        </p>

        {/* Status badge */}
        <div className="mt-3 flex items-center gap-2">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              isPending
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {STATUS_LABELS[profile.status] ?? profile.status}
          </span>
          {profile.intendedUse !== profile.role && (
            <span className="text-xs text-slate-400">
              Requested: {ROLE_LABELS[profile.intendedUse] ?? profile.intendedUse}
            </span>
          )}
        </div>
      </div>

      {/* Pending notice */}
      {isPending && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Your account is pending approval</p>
          <p className="mt-1 text-amber-700">
            An admin will review your profile shortly. You can browse the hub
            while you wait.
          </p>
        </div>
      )}

      {/* Placeholder sections — features will replace these */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            title: "Services & Products",
            desc: "Discover local businesses, skills, and products.",
          },
          {
            title: "Community Requests",
            desc: "Ask for help or offer support to neighbours.",
          },
          {
            title: "Events",
            desc: "Find and RSVP to community gatherings.",
          },
          {
            title: "Notices",
            desc: "Stay up to date with announcements and alerts.",
          },
        ].map((section) => (
          <div
            key={section.title}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h3 className="font-semibold text-slate-800">{section.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{section.desc}</p>
            <p className="mt-3 text-xs text-slate-400">Coming soon</p>
          </div>
        ))}
      </div>
    </div>
  );
}
