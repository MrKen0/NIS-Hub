"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import StateMessage from '@/components/StateMessage';
import { getNoticeById } from '@/services/browseService';
import type { CommunityNotice } from '@/types/content';
import ImageCarousel from '@/components/ImageCarousel';

// ─── Demo notices ─────────────────────────────────────────────────────────────
// These mirror the DEMO_NOTICES in notices/page.tsx. Duplicated locally to avoid
// a shared-module dependency between two independent route segments.
// All required CommunityNotice fields are filled with safe placeholder values.
const DEMO_NOTICES: CommunityNotice[] = [
  {
    id: 'demo-1',
    title: 'Welcome to NIS Hub!',
    body: 'The community platform for Naijas in Stevenage is now live. Browse services, find events, post requests, and connect with your community — all in one place.',
    category: 'Announcement',
    expiresAt: '2099-12-31',
    linkUrl: null,
    imageUrls: null,
    status: 'approved',
    authorId: 'demo',
    createdAt: '2026-04-01T10:00:00.000Z',
    updatedAt: '2026-04-01T10:00:00.000Z',
  },
  {
    id: 'demo-2',
    title: 'Free CV & Job Application Workshop',
    body: 'A local charity is offering free CV writing and job application support this Saturday. Open to all community members. Limited spaces — contact us to reserve a spot.',
    category: 'Opportunity',
    expiresAt: '2099-12-31',
    linkUrl: null,
    imageUrls: null,
    status: 'approved',
    authorId: 'demo',
    createdAt: '2026-04-01T09:00:00.000Z',
    updatedAt: '2026-04-01T09:00:00.000Z',
  },
  {
    id: 'demo-3',
    title: 'Community WhatsApp Guidelines',
    body: 'A reminder to keep the community WhatsApp group respectful and on-topic. No spam, no unsolicited advertising. Use NIS Hub to post your services and products instead.',
    category: 'General',
    expiresAt: '2099-12-31',
    linkUrl: null,
    imageUrls: null,
    status: 'approved',
    authorId: 'demo',
    createdAt: '2026-03-31T12:00:00.000Z',
    updatedAt: '2026-03-31T12:00:00.000Z',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateLong(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function categoryIcon(cat: string) {
  switch (cat) {
    case 'Announcement': return '📢';
    case 'Alert': return '⚠️';
    case 'Opportunity': return '💡';
    default: return '📋';
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();

  const routeId = typeof params.id === 'string' ? params.id : '';

  // Resolve demo IDs synchronously — no loading state, no Firestore call.
  const demoNotice = DEMO_NOTICES.find((n) => n.id === routeId) ?? null;

  const [notice, setNotice] = useState<CommunityNotice | null>(demoNotice);
  // If a demo notice resolved, skip the loading skeleton entirely.
  const [loading, setLoading] = useState(demoNotice === null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!routeId) return;
    // Demo IDs are already resolved in initial state — skip Firestore.
    if (DEMO_NOTICES.some((n) => n.id === routeId)) return;

    getNoticeById(routeId)
      .then((n) => {
        if (!n || n.status !== 'approved') {
          setNotFound(true);
        } else {
          setNotice(n);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [routeId]);

  const isDemo = demoNotice !== null;
  // Demo notices use expiresAt: '2099-12-31' — they will never show as expired.
  const isExpired = notice ? new Date(notice.expiresAt) < new Date() : false;

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-2xl mx-auto">
          {loading && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 animate-pulse">
              <div className="h-7 w-2/3 bg-slate-200 rounded mb-3" />
              <div className="h-4 w-1/3 bg-slate-100 rounded mb-6" />
              <div className="h-4 w-full bg-slate-100 rounded mb-2" />
              <div className="h-4 w-full bg-slate-100 rounded mb-2" />
              <div className="h-4 w-3/4 bg-slate-100 rounded" />
            </div>
          )}

          {notFound && (
            <StateMessage
              type="empty"
              title="Notice not found"
              message="This notice may have been removed or is not yet approved."
              action={
                <button onClick={() => router.push('/notices')} className="text-sm font-medium text-blue-600 underline">
                  Back to notices
                </button>
              }
            />
          )}

          {notice && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
                <div className="flex items-start gap-3 mb-1">
                  <span className="text-2xl flex-shrink-0">{categoryIcon(notice.category)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h1 className="text-2xl font-bold">{notice.title}</h1>
                      {/* Example badge — only shown for demo content */}
                      {isDemo && (
                        <span
                          className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold self-start mt-1"
                          style={{
                            backgroundColor: 'rgba(207,175,90,0.25)',
                            color: '#f5d87a',
                            border: '1px solid rgba(207,175,90,0.5)',
                          }}
                        >
                          Example
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-purple-100 text-sm">
                  {notice.category} &middot; Posted {formatDateLong(notice.createdAt)}
                </p>
              </div>

              {/* Image carousel — only rendered when the notice has photos */}
              {(notice.imageUrls?.length ?? 0) > 0 && (
                <ImageCarousel
                  imageUrls={notice.imageUrls!}
                  alt={notice.title}
                  heightClass="h-64"
                  fit="contain"
                />
              )}

              <div className="p-6 space-y-5">
                {isExpired && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 font-medium">
                    This notice has expired.
                  </div>
                )}

                {/* Body */}
                <div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{notice.body}</p>
                </div>

                {/* Related link */}
                {notice.linkUrl && (
                  <div className="pt-2">
                    <a
                      href={notice.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
                    >
                      Related link ↗
                    </a>
                  </div>
                )}

                {/* Meta */}
                <div className="text-xs text-slate-400 pt-4 border-t">
                  {isDemo
                    ? 'This is an example notice.'
                    : `Expires ${formatDateLong(notice.expiresAt)}`}
                </div>

                <button
                  onClick={() => router.push('/notices')}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  &larr; Back to notices
                </button>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
