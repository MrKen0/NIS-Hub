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

const urgencyStyle: Record<string, React.CSSProperties> = {
  low:    { background: 'var(--color-bg)', color: 'var(--color-muted)' },
  medium: { background: '#FEF3C7', color: '#92400E' },
  high:   { background: '#FEE2E2', color: '#991B1B' },
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
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>My Requests</h1>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Your help requests and their status</p>
            </div>
            <Link
              href="/create/request"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white min-h-[44px] flex items-center transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-primary)' }}
            >
              + New Request
            </Link>
          </div>

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white p-4 animate-pulse"
                  style={{ border: '1px solid var(--color-border)' }}
                >
                  <div className="h-5 w-2/3 bg-slate-200 rounded mb-2" />
                  <div className="h-4 w-1/3 bg-slate-100 rounded mb-3" />
                  <div className="h-4 w-full bg-slate-100 rounded mb-1" />
                  <div className="h-4 w-3/4 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          )}

          {error && <StateMessage type="error" title="Error" message={error} />}

          {!loading && !error && requests.length === 0 && (
            <StateMessage
              type="empty"
              title="No requests yet"
              message="You haven't posted any help requests. Ask the community for help, goods, or services."
              action={
                <Link href="/create/request" className="text-sm font-medium underline" style={{ color: 'var(--color-primary)' }}>
                  Post a request
                </Link>
              }
            />
          )}

          {!loading && requests.length > 0 && (
            <div className="space-y-3">
              {requests.map((r) => {
                const expired = isExpired(r.expiresAt);

                return (
                  <Link
                    key={r.id}
                    href={`/requests/${r.id}`}
                    data-testid="request-card"
                    className={`block rounded-xl bg-white p-4 transition-all ${expired ? 'opacity-75' : 'card-lift'}`}
                    style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-semibold line-clamp-1 flex-1" style={{ color: 'var(--color-text)' }}>
                        {r.text}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {expired && (
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                            style={{ background: 'var(--color-bg)', color: 'var(--color-muted)' }}
                          >
                            Expired
                          </span>
                        )}
                        <StatusChip status={r.status} />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs mb-2" style={{ color: 'var(--color-muted)' }}>
                      {r.category && (
                        <span
                          className="rounded-full px-2 py-0.5 font-medium"
                          style={{ background: 'var(--color-primary-surface)', color: 'var(--color-primary)' }}
                        >
                          {r.category}
                        </span>
                      )}
                      <span>{r.location}</span>
                      <span>&middot;</span>
                      <span
                        className="rounded-full px-2 py-0.5 font-medium capitalize"
                        style={urgencyStyle[r.urgency] ?? {}}
                      >
                        {r.urgency}
                      </span>
                      <span>&middot;</span>
                      <span>{formatDate(r.createdAt)}</span>
                    </div>

                    {expired ? (
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        Expired — matches may no longer be accurate
                      </p>
                    ) : r.status === 'approved' ? (
                      <p className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                        See matching services &rarr;
                      </p>
                    ) : (
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
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
