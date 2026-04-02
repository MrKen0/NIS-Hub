"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/AuthContext";

const navItems = [
  { id: "home",        label: "Home",        href: "/" },
  { id: "services",    label: "Services",    href: "/services" },
  { id: "products",    label: "Products",    href: "/products" },
  { id: "events",      label: "Events",      href: "/events" },
  { id: "notices",     label: "Notices",     href: "/notices" },
  { id: "create",      label: "Create",      href: "/create" },
  { id: "my-listings", label: "My Listings", href: "/my-listings" },
];

export default function TopNav() {
  const { user, profile } = useAuth();
  const pathname = usePathname();

  async function handleSignOut() {
    await signOut(auth);
  }

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        background: 'rgba(255,255,255,0.97)',
        borderColor: 'var(--color-border)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex-shrink-0 group" style={{ textDecoration: 'none' }}>
          <div className="flex items-center gap-2.5">
            {/* Logo mark */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="NIS Hub"
              width={36}
              height={36}
              className="w-9 h-9 flex-shrink-0 rounded-full"
              style={{ objectFit: 'cover' }}
            />
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest leading-none"
                style={{ color: 'var(--color-primary)' }}
              >
                NIS Hub
              </p>
              <p className="text-xs text-slate-500 leading-tight hidden sm:block">
                Naijas in Stevenage
              </p>
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden gap-1 sm:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.id}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                style={{
                  color: isActive ? 'var(--color-primary)' : '#4B5563',
                  background: isActive ? 'var(--color-primary-surface)' : 'transparent',
                }}
              >
                {item.label}
              </Link>
            );
          })}
          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              style={{ color: '#4B5563' }}
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Sign-out */}
        {user && (
          <button
            onClick={handleSignOut}
            className="flex-shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-50 min-h-[40px]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            aria-label="Sign out"
          >
            <span className="hidden sm:inline">
              {profile?.displayName ? `${profile.displayName} · ` : ""}
            </span>
            Sign out
          </button>
        )}
      </div>
    </header>
  );
}
