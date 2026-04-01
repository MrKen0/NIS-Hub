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

const urgencyConfig: Record<string, { color: string; surface: string }> = {
  low:    { color: '#6B7280', surface: '#F3F4F6' },
  medium: { color: '#D97706', surface: '#FEF3C7' },
  high:   { color: '#DC2626', surface: '#FEE2E2' },
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

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1
                className="text-2xl font-bold leading-tight"
                style={{ color: 'var(--color-text)' }}
              >
                My Requests
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Your help requests and their status
              </p>
            </div>
            <Link
              href="/create/request"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors min-h-[44px] flex items-center"
              style={{ background: 'var(--color-primary)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-primary-dark)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-primary)';
              }}
            >
              + New Request
            </Link>
          </div>

          {/* ── Loading skeleton ── */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white p-5 animate-pulse"
                  style={{ border: '1px solid var(--color-border)' }}
                >
                  <div className="h-5 w-2/3 rounded-lg mb-2" style={{ background: 'var(--color-border)' }} />
                  <div className="h-4 w-1/3 rounded-lg mb-3" style={{ background: '#F3F4F6' }} />
                  <div className="h-4 w-full rounded-lg mb-1" style={{ background: '#F3F4F6' }} />
                  <div className="h-4 w-3/4 rounded-lg" style={{ background: '#F3F4F6' }} />
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
                <Link
                  href="/create/request"
                  className="text-sm font-semibold underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Post a request
                </Link>
              }
            />
          )}

          {/* ── Request cards ── */}
          {!loading && requests.length > 0 && (
            <div className="space-y-3">
              {requests.map((r) => {
                const expired = isExpired(r.expiresAt);
                const urg = urgencyConfig[r.urgency];

                return (
                  <Link
                    key={r.id}
                    href={`/requests/${r.id}`}
                    className="block rounded-2xl bg-white p-5 transition-all"
                    style={{
                      border: '1px solid var(--color-border)',
                      boxShadow: 'var(--shadow-card)',
                      opacity: expired ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!expired) {
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,135,83,0.35)';
                        (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'var(--shadow-raise)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'var(--shadow-card)';
                    }}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p
                        className="font-bold text-sm line-clamp-1 flex-1"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {r.text}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {expired && (
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                            style={{ background: '#F3F4F6', color: '#6B7280' }}
                          >
                            Expired
                          </span>
                        )}
                        <StatusChip status={r.status} />
                      </div>
                    </div>

                    {/* Details row */}
                    <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                      {r.category && (
                        <span
                          className="rounded-full px-2.5 py-1 font-medium"
                          style={{ background: 'var(--color-primary-surface)', color: 'var(--color-primary)' }}
                        >
                          {r.category}
                        </span>
                      )}
                      <span style={{ color: 'var(--color-muted)' }}>{r.location}</span>
                      <span style={{ color: 'var(--color-border)' }}>·</span>
                      {urg && (
                        <span
                          className="rounded-full px-2.5 py-1 font-semibold capitalize"
                          style={{ background: urg.surface, color: urg.color }}
                        >
                          {r.urgency}
                        </span>
                      )}
                      <span style={{ color: 'var(--color-border)' }}>·</span>
                      <span style={{ color: 'var(--color-muted)' }}>{formatDate(r.createdAt)}</span>
                    </div>

                    {/* Footer */}
                    {expired ? (
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        Expired — matches may no longer be accurate
                      </p>
                    ) : r.status === 'approved' ? (
                      <p className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                        See matching services →
                      </p>
                    ) : r.status === 'pending' ? (
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        Pending review — matches available once approved
                      </p>
                    ) : null}
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
