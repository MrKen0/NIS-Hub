"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import StateMessage from '@/components/StateMessage';
import { getApprovedNotices } from '@/services/browseService';
import type { CommunityNotice } from '@/types/content';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function categoryIcon(cat: string) {
  switch (cat) {
    case 'Announcement': return '📢';
    case 'Alert': return '⚠️';
    case 'Opportunity': return '💡';
    default: return '📋';
  }
}

export default function NoticesBrowsePage() {
  const [notices, setNotices] = useState<CommunityNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getApprovedNotices()
      .then(setNotices)
      .catch(() => setError('Failed to load notices.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Notices</h1>
            <p className="text-sm text-slate-600">Community announcements and updates</p>
          </div>

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

          {error && <StateMessage type="error" title="Error" message={error} />}

          {!loading && !error && notices.length === 0 && (
            <StateMessage
              type="empty"
              title="No notices yet"
              message="There are no community notices at this time."
            />
          )}

          {!loading && notices.length > 0 && (
            <div className="space-y-3">
              {notices.map((n) => (
                <Link
                  key={n.id}
                  href={`/notices/${n.id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{categoryIcon(n.category)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 line-clamp-1">{n.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2 mt-1">{n.body}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-400">{n.category}</span>
                        <span className="text-xs text-slate-400">&middot;</span>
                        <span className="text-xs text-slate-400">{formatDate(n.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
