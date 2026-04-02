"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import StateMessage from '@/components/StateMessage';
import { getNoticeById } from '@/services/browseService';
import type { CommunityNotice } from '@/types/content';

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

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [notice, setNotice] = useState<CommunityNotice | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params.id || typeof params.id !== 'string') return;
    getNoticeById(params.id)
      .then((n) => {
        if (!n || n.status !== 'approved') {
          setNotFound(true);
        } else {
          setNotice(n);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

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
                <button onClick={() => router.push('/notices')} className="text-sm font-medium underline" style={{ color: 'var(--color-primary)' }}>
                  Back to notices
                </button>
              }
            />
          )}

          {notice && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {/* Header */}
              <div className="text-white p-6" style={{ background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)' }}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">{categoryIcon(notice.category)}</span>
                  <h1 className="text-2xl font-bold">{notice.title}</h1>
                </div>
                <p className="text-sm" style={{ color: '#A7F3D0' }}>
                  {notice.category} &middot; Posted {formatDateLong(notice.createdAt)}
                </p>
              </div>

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

                {/* Meta */}
                <div className="text-xs text-slate-400 pt-4 border-t">
                  Expires {formatDateLong(notice.expiresAt)}
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
