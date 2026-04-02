"use client";

import Link from "next/link";
import { useEffect } from "react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/lib/auth/AuthContext";

const ROLE_LABELS: Record<string, string> = {
  member:      "Community Member",
  provider:    "Service Provider",
  contributor: "Contributor",
  admin:       "Admin",
};

const STATUS_LABELS: Record<string, string> = {
  pending:  "Pending approval",
  approved: "Active member",
  active:   "Active member",
  paused:   "Paused",
  archived: "Archived",
};

// ── Icon components ──────────────────────────────────────────
function IconServices() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
function IconProducts() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}
function IconRequests() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}
function IconPost() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}
function IconEvents() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function IconNotices() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}
function IconAdmin() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
// ─────────────────────────────────────────────────────────────

const NAV_CARDS = [
  {
    title: "Browse Services",
    desc:  "Find tradespeople, tutors, drivers and more from the community.",
    href:  "/services",
    Icon:  IconServices,
  },
  {
    title: "Browse Products",
    desc:  "Discover food, crafts, and goods available nearby.",
    href:  "/products",
    Icon:  IconProducts,
  },
  {
    title: "My Requests",
    desc:  "Track the help requests you've posted and their status.",
    href:  "/requests",
    Icon:  IconRequests,
  },
  {
    title: "Post a Request",
    desc:  "Ask the community for help, a service, or goods.",
    href:  "/create/request",
    Icon:  IconPost,
  },
  {
    title: "Events",
    desc:  "Find local gatherings, meetups and community events.",
    href:  "/events",
    Icon:  IconEvents,
  },
  {
    title: "Notices",
    desc:  "Stay up to date with community announcements.",
    href:  "/notices",
    Icon:  IconNotices,
  },
];

const HOW_IT_WORKS = [
  {
    step:  "1",
    title: "Browse or post",
    desc:  "Find a service you need, or post a request for help with anything.",
  },
  {
    step:  "2",
    title: "Get matched",
    desc:  "We surface the most relevant community services for your request.",
  },
  {
    step:  "3",
    title: "Connect directly",
    desc:  "Reach out via WhatsApp or phone — no middlemen, no fees.",
  },
];

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

  // Scroll-reveal: add .is-visible to elements as they enter the viewport
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-animate]');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (!profile) return null;

  const isPending = profile.status === "pending";

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Hero card ─────────────────────────────────── */}
      <section
        data-animate
        className="rounded-2xl text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0B3D2E 0%, #005C38 55%, #008753 100%)',
          padding: '2rem 1.5rem',
          minHeight: '240px',
        }}
      >
        {/* Gold hairline top border */}
        <div
          className="pointer-events-none absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{ background: 'var(--color-gold)', opacity: 0.7 }}
          aria-hidden="true"
        />
        {/* Large decorative ring — top right */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full"
          style={{ border: '50px solid #fff', opacity: 0.07 }}
          aria-hidden="true"
        />
        {/* Small gold ring — bottom left */}
        <div
          className="pointer-events-none absolute -bottom-10 -left-10 w-40 h-40 rounded-full"
          style={{ border: '28px solid var(--color-gold)', opacity: 0.08 }}
          aria-hidden="true"
        />

        <p
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: '#6EE7B7' }}
        >
          Welcome back
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
          {profile.displayName}
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#A7F3D0' }}>
          {ROLE_LABELS[profile.role] ?? profile.role}
          {profile.area ? ` · ${profile.area}` : ''}
        </p>

        {/* Status pill */}
        <div className="mt-4">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={
              isPending
                ? { background: 'rgba(251,191,36,0.2)', color: '#FDE68A', border: '1px solid rgba(251,191,36,0.3)' }
                : { background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }
            }
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: isPending ? '#FCD34D' : '#34D399' }}
            />
            {STATUS_LABELS[profile.status] ?? profile.status}
          </span>
        </div>

        {/* Primary CTAs */}
        <div className="mt-6 flex gap-3">
          <Link
            href="/services"
            className="flex-1 rounded-xl py-3 text-center text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: '#fff', color: 'var(--color-primary-dark)' }}
          >
            Browse Services
          </Link>
          <Link
            href="/create/request"
            className="flex-1 rounded-xl py-3 text-center text-sm font-bold transition-opacity hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
          >
            Post a Request
          </Link>
        </div>
      </section>

      {/* ── Pending notice ────────────────────────────── */}
      {isPending && (
        <div
          data-animate
          className="rounded-xl p-4 flex gap-3"
          style={{
            '--anim-delay': '80ms',
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
          } as React.CSSProperties}
        >
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{ background: '#FEF3C7', color: '#D97706' }}
          >
            ⏳
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#92400E' }}>
              Account pending approval
            </p>
            <p className="mt-0.5 text-xs leading-relaxed" style={{ color: '#B45309' }}>
              You can browse services, products, events and notices while you wait.
              Service and product listings require admin approval.
            </p>
          </div>
        </div>
      )}

      {/* ── Section label ─────────────────────────────── */}
      <div
        data-animate
        style={{ '--anim-delay': '120ms' } as React.CSSProperties}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: 'var(--color-muted)' }}
        >
          What would you like to do?
        </p>

        {/* ── Feature grid ──────────────────────────── */}
        <div className="grid gap-3 sm:grid-cols-2">
          {NAV_CARDS.map((card, i) => (
            <Link
              key={card.href}
              href={card.href}
              data-animate
              className="group flex items-start gap-4 rounded-2xl p-5 sm:p-6 card-lift"
              style={{
                '--anim-delay': `${140 + i * 40}ms`,
                background: '#FEFDFB',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              } as React.CSSProperties}
            >
              {/* Icon box */}
              <div
                className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--color-primary-surface)', color: 'var(--color-primary)' }}
              >
                <card.Icon />
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3
                  className="font-bold text-sm leading-snug"
                  style={{ color: 'var(--color-text)' }}
                >
                  {card.title}
                </h3>
                <p
                  className="mt-0.5 text-xs leading-relaxed"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {card.desc}
                </p>
              </div>
              {/* Chevron */}
              <span
                className="flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1"
                style={{ color: 'var(--color-border)' }}
              >
                <IconChevron />
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── How it works ──────────────────────────────── */}
      <section
        data-animate
        style={
          {
            '--anim-delay': '380ms',
            background: 'var(--color-primary-surface)',
            border: '1px solid rgba(0,135,83,0.12)',
            borderRadius: '16px',
            padding: '24px',
          } as React.CSSProperties
        }
      >
        <p
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: 'var(--color-gold)' }}
        >
          How NIS Hub works
        </p>
        <div className="space-y-4">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="flex gap-3 items-start">
              <span
                className="flex-shrink-0 w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center"
                style={{
                  background: 'var(--color-primary)',
                  boxShadow: '0 0 0 3px rgba(207,175,90,0.25)',
                }}
              >
                {item.step}
              </span>
              <div>
                <p
                  className="font-semibold text-sm"
                  style={{ color: 'var(--color-text)' }}
                >
                  {item.title}
                </p>
                <p
                  className="text-xs leading-relaxed mt-0.5"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Admin ─────────────────────────────────────── */}
      {profile.role === "admin" && (
        <div
          data-animate
          style={{ '--anim-delay': '420ms' } as React.CSSProperties}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: 'var(--color-muted)' }}
          >
            Administration
          </p>
          <Link
            href="/admin"
            className="group flex items-start gap-4 rounded-2xl p-5 sm:p-6 card-lift"
            style={{
              background: '#FEFDFB',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--color-primary-surface)', color: 'var(--color-primary)' }}
            >
              <IconAdmin />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                Admin Dashboard
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Review pending content and manage community members.
              </p>
            </div>
            <span
              className="flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1"
              style={{ color: 'var(--color-border)' }}
            >
              <IconChevron />
            </span>
          </Link>
        </div>
      )}

    </div>
  );
}
