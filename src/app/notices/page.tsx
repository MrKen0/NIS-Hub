"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import StateMessage from '@/components/StateMessage';
import { useAuth } from '@/lib/auth/AuthContext';
import { getApprovedNotices } from '@/services/browseService';
import type { CommunityNotice } from '@/types/content';

// ─── Formatters ───────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function categoryIcon(cat: string) {
  switch (cat) {
    case 'Announcement': return '📢';
    case 'Alert':        return '⚠️';
    case 'Opportunity':  return '💡';
    default:             return '📋';
  }
}

// ─── Alert accent styles — only applied to Alert category cards ───────────────
function alertStyle(category: string): React.CSSProperties {
  if (category !== 'Alert') return {};
  return {
    borderLeftWidth: '3px',
    borderLeftColor: 'rgba(239,68,68,0.7)',
    backgroundColor: 'rgba(254,242,242,0.6)',
  };
}

// ─── Demo notices — shown only when no real notices exist ─────────────────────
const DEMO_NOTICES = [
  {
    id: 'demo-1',
    title: 'Welcome to NIS Hub!',
    body: 'The community platform for Naijas in Stevenage is now live. Browse services, find events, post requests, and connect with your community — all in one place.',
    category: 'Announcement',
    createdAt: '2026-04-01T10:00:00.000Z',
  },
  {
    id: 'demo-2',
    title: 'Free CV & Job Application Workshop',
    body: 'A local charity is offering free CV writing and job application support this Saturday. Open to all community members. Limited spaces — contact us to reserve a spot.',
    category: 'Opportunity',
    createdAt: '2026-04-01T09:00:00.000Z',
  },
  {
    id: 'demo-3',
    title: 'Community WhatsApp Guidelines',
    body: 'A reminder to keep the community WhatsApp group respectful and on-topic. No spam, no unsolicited advertising. Use NIS Hub to post your services and products instead.',
    category: 'General',
    createdAt: '2026-03-31T12:00:00.000Z',
  },
] as const;

// ─── Inline helper: compact stat card ────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-xl border p-3 text-center"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <p
        className="text-2xl font-bold leading-none"
        style={{ color: 'var(--color-primary)' }}
      >
        {value}
      </p>
      <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
        {label}
      </p>
    </div>
  );
}

// ─── Inline helper: category icon container ───────────────────────────────────
function CategoryIcon({ category }: { category: string }) {
  return (
    <div
      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
      style={{ backgroundColor: 'var(--color-primary-surface)' }}
    >
      {categoryIcon(category)}
    </div>
  );
}

// ─── Inline helper: latest (highlighted) notice card ─────────────────────────
function LatestNoticeCard({ notice }: { notice: CommunityNotice }) {
  return (
    <Link
      href={`/notices/${notice.id}`}
      className="block rounded-xl p-4 transition-all hover:shadow-md"
      style={{
        backgroundColor: notice.category === 'Alert' ? 'rgba(254,242,242,0.6)' : 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderTopWidth: '2px',
        borderTopColor: notice.category === 'Alert' ? 'rgba(239,68,68,0.4)' : 'var(--color-primary-surface)',
        borderLeftWidth: '3px',
        borderLeftColor: notice.category === 'Alert' ? 'rgba(239,68,68,0.7)' : 'var(--color-primary)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-start gap-3">
        <CategoryIcon category={notice.category} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="font-bold text-slate-900 line-clamp-1">{notice.title}</h3>
            <span
              className="shrink-0 text-xs font-medium rounded-full px-2 py-0.5"
              style={{
                backgroundColor: 'var(--color-primary-surface)',
                color: 'var(--color-primary-dark)',
              }}
            >
              {notice.category}
            </span>
          </div>
          <p className="text-sm text-slate-600 line-clamp-2 mb-1">{notice.body}</p>
          <p className="text-xs text-slate-400">{formatDate(notice.createdAt)}</p>
        </div>
      </div>
    </Link>
  );
}

// ─── Inline helper: standard list notice card ─────────────────────────────────
function NoticeListCard({ notice }: { notice: CommunityNotice }) {
  return (
    <Link
      href={`/notices/${notice.id}`}
      data-testid="notice-card"
      className="block rounded-xl border border-slate-200 p-4 shadow-sm hover:border-blue-300 transition-all card-lift"
      style={{ backgroundColor: '#FEFDFB', ...alertStyle(notice.category) }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{categoryIcon(notice.category)}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{notice.title}</h3>
          <p className="text-sm text-slate-600 line-clamp-2 mt-1">{notice.body}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-slate-400">{notice.category}</span>
            <span className="text-xs text-slate-400">&middot;</span>
            <span className="text-xs text-slate-400">{formatDate(notice.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Inline helper: demo notice card (non-clickable) ─────────────────────────
function DemoNoticeCard({ notice }: { notice: (typeof DEMO_NOTICES)[number] }) {
  return (
    <div
      className="block rounded-xl p-4 opacity-80"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{categoryIcon(notice.category)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="font-bold text-slate-900 line-clamp-1">{notice.title}</h3>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: 'rgba(207,175,90,0.18)',
                color: '#7a5c1e',
                border: '1px solid rgba(207,175,90,0.35)',
              }}
            >
              Example
            </span>
          </div>
          <p className="text-sm text-slate-600 line-clamp-2">{notice.body}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function NoticesBrowsePage() {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<CommunityNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Only contributors and admins can post notices
  const canPostNotice = profile?.role === 'contributor' || profile?.role === 'admin';

  useEffect(() => {
    getApprovedNotices()
      .then(setNotices)
      .catch(() => setError('Failed to load notices.'))
      .finally(() => setLoading(false));
  }, []);

  // Stats — from the full notices array
  const stats = useMemo(
    () => ({
      total:         notices.length,
      announcements: notices.filter((n) => n.category === 'Announcement').length,
      alerts:        notices.filter((n) => n.category === 'Alert').length,
    }),
    [notices]
  );

  // Latest — 3 most recently created notices
  const latest = useMemo(
    () =>
      [...notices]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 3),
    [notices]
  );

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-2xl mx-auto space-y-6 pb-8">

          {/* ── 1. Hero / Dashboard header ──────────────────────────── */}
          <section
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-surface) 0%, #d4ede1 100%)',
              border: '1px solid rgba(0,135,83,0.18)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
              Notices
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-primary-dark)', opacity: 0.8 }}>
              Community announcements, alerts, and opportunities.
            </p>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--color-primary-dark)', opacity: 0.6 }}>
              Important updates for the community, in one place.
            </p>
            {canPostNotice && (
              <div className="mt-4">
                <Link
                  href="/create/notice"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 min-h-[44px] inline-flex items-center"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  + Post Notice
                </Link>
              </div>
            )}
          </section>

          {/* ── 2. Summary stats ────────────────────────────────────── */}
          {!loading && !error && notices.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Total notices"  value={stats.total} />
              <StatCard label="Announcements"  value={stats.announcements} />
              <StatCard label="Active alerts"  value={stats.alerts} />
            </div>
          )}

          {/* ── 3. Latest notices ────────────────────────────────────── */}
          {!loading && !error && latest.length > 0 && (
            <section>
              <div className="mb-3">
                <h2 className="text-base font-bold text-slate-900">Latest</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  The most recently posted community notices.
                </p>
              </div>
              <div className="space-y-3">
                {latest.map((n) => (
                  <LatestNoticeCard key={n.id} notice={n} />
                ))}
              </div>
            </section>
          )}

          {/* ── Loading skeleton ─────────────────────────────────────── */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 animate-pulse">
                  <div className="h-5 w-2/3 bg-slate-200 rounded mb-2" />
                  <div className="h-4 w-full bg-slate-100 rounded mb-1" />
                  <div className="h-4 w-3/4 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* ── Error ───────────────────────────────────────────────── */}
          {error && <StateMessage type="error" title="Error" message={error} />}

          {/* ── Demo notices — shown only when no real notices exist ─── */}
          {!loading && !error && notices.length === 0 && (
            <section>
              <div
                className="rounded-xl p-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                style={{
                  backgroundColor: 'rgba(207,175,90,0.10)',
                  border: '1px solid rgba(207,175,90,0.35)',
                }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#7a5c1e' }}>
                    No notices yet — here&apos;s what they&apos;ll look like
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#7a5c1e', opacity: 0.8 }}>
                    Contributors and admins can post notices for the whole community to see.
                  </p>
                </div>
                {canPostNotice && (
                  <Link
                    href="/create/notice"
                    className="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 min-h-[44px] flex items-center"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    + Post the first notice
                  </Link>
                )}
              </div>
              <div className="space-y-3">
                {DEMO_NOTICES.map((n) => (
                  <DemoNoticeCard key={n.id} notice={n} />
                ))}
              </div>
            </section>
          )}

          {/* ── 4. All notices list ──────────────────────────────────── */}
          {!loading && notices.length > 0 && (
            <section>
              <div className="mb-3">
                <h2 className="text-base font-bold text-slate-900">All notices</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every active community notice, most recent first.
                </p>
              </div>
              <div className="space-y-3">
                {notices.map((n) => (
                  <NoticeListCard key={n.id} notice={n} />
                ))}
              </div>
            </section>
          )}

        </div>
      </AppShell>
    </AuthGuard>
  );
}
