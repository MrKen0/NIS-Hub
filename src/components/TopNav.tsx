"use client";

/**
 * Top Navigation Bar
 * -------------------
 * Sticky header with brand name and sign-out button.
 * Shows the user's display name when signed in.
 */

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/AuthContext";

const navItems = [
  { id: "home", label: "Home", href: "/", enabled: true },
  { id: "services", label: "Services", href: "/services", enabled: true },
  { id: "products", label: "Products", href: "/products", enabled: true },
  { id: "events", label: "Events", href: "/events", enabled: true },
  { id: "notices", label: "Notices", href: "/notices", enabled: true },
  { id: "create", label: "Create", href: "/create", enabled: true },
];

export default function TopNav() {
  const { user, profile } = useAuth();

  async function handleSignOut() {
    await signOut(auth);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Brand */}
        <div>
          <p className="text-xs uppercase tracking-widest text-blue-600">NIS Hub</p>
          <h1 className="text-lg font-bold text-slate-900">Community in Stevenage</h1>
        </div>

        {/* Desktop nav + sign-out */}
        <div className="flex items-center gap-2">
          <div className="hidden gap-2 sm:flex">
            {navItems.map((item) =>
              item.enabled ? (
                <Link
                  key={item.id}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  key={item.id}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-400 cursor-not-allowed"
                  title="Coming soon"
                >
                  {item.label}
                </span>
              )
            )}
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Sign-out button — visible on all screen sizes */}
          {user && (
            <button
              onClick={handleSignOut}
              className="ml-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 min-h-[44px]"
              aria-label="Sign out"
            >
              <span className="hidden sm:inline">
                {profile?.displayName ? `${profile.displayName} · ` : ""}
              </span>
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
