"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import StateMessage from '@/components/StateMessage';
import StatusChip from '@/components/StatusChip';
import { useAuth } from '@/lib/auth/AuthContext';
import { getMyRequests } from '@/services/browseService';
import type { HelpRequest } from '@/types/content';

function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isExpired(expiresAt: string): boolean {
  if (!expiresAt) return false;
  return expiresAt < new Date().toISOString().substring(0, 10);
}

const urgencyStyle: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export default function MyRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    getMyRequests(user.uid)
      .then(setRequests)
      .catch(() => setError('Failed to load your requests.'))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Requests</h1>
              <p className="text-sm text-slate-600">Your help requests and their status</p>
            </div>
            <Link
              href="/create/request"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors min-h-[44px] flex items-center"
            >
              + New Request
            </Link>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 animate-pulse">
                  <div className="h-5 w-2/3 bg-slate-200 rounded mb-2" />
                  <div className="h-4 w-1/3 bg-slate-100 rounded mb-3" />
                  <div className="h-4 w-full bg-slate-100 rounded mb-1" />
                  <div className="h-4 w-3/4 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && <StateMessage type="error" title="Error" message={error} />}

          {/* Empty state */}
          {!loading && !error && requests.length === 0 && (
            <StateMessage
              type="empty"
              title="No requests yet"
              message="You haven't posted any help requests. Ask the community for help, goods, or services."
              action={
                <Link href="/create/request" className="text-sm font-medium text-blue-600 underline">
                  Post a request
                </Link>
              }
            />
          )}

          {/* Request cards */}
          {!loading && requests.length > 0 && (
            <div className="space-y-3">
              {requests.map((r) => {
                const expired = isExpired(r.expiresAt);

                return (
                  <Link
                    key={r.id}
                    href={`/requests/${r.id}`}
                    className={`block rounded-xl border bg-white p-4 shadow-sm transition-all ${
                      expired
                        ? 'border-slate-200 opacity-75'
                        : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    {/* Top row: text preview + status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-slate-900 line-clamp-1 flex-1">
                        {r.text}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {expired && (
                          <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                            Expired
                          </span>
                        )}
                        <StatusChip status={r.status} />
                      </div>
                    </div>

                    {/* Details row */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
                      {r.category && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700 font-medium">
                          {r.category}
                        </span>
                      )}
                      <span>{r.location}</span>
                      <span>&middot;</span>
                      <span className={`rounded-full px-2 py-0.5 font-medium capitalize ${urgencyStyle[r.urgency] ?? ''}`}>
                        {r.urgency}
                      </span>
                      <span>&middot;</span>
                      <span>{formatDate(r.createdAt)}</span>
                    </div>

                    {/* Footer: matches link or expired note */}
                    {expired ? (
                      <p className="text-xs text-slate-400">
                        Expired — matches may no longer be accurate
                      </p>
                    ) : r.status === 'approved' ? (
                      <p className="text-xs text-blue-600 font-medium">
                        See matching services &rarr;
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        {r.status === 'pending' ? 'Pending review — matches available once approved' : ''}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
