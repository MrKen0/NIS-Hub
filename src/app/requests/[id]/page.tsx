"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import StateMessage from '@/components/StateMessage';
import StatusChip from '@/components/StatusChip';
import { useAuth } from '@/lib/auth/AuthContext';
import { getRequestById } from '@/services/browseService';
import type { HelpRequest } from '@/types/content';

function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isExpired(expiresAt: string): boolean {
  if (!expiresAt) return false;
  return expiresAt < new Date().toISOString().substring(0, 10);
}

const urgencyLabel: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const urgencyStyle: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const requestId = params.id as string;

  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Wait for auth to finish before fetching
    if (authLoading) return;
    if (!user) return;

    getRequestById(requestId)
      .then((r) => {
        if (!r || r.authorId !== user.uid) {
          setNotFound(true);
        } else {
          setRequest(r);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [requestId, user, authLoading]);

  const expired = request ? isExpired(request.expiresAt) : false;

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-2xl mx-auto">
          {/* Loading */}
          {(loading || authLoading) && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 animate-pulse">
              <div className="h-7 w-2/3 bg-slate-200 rounded mb-3" />
              <div className="h-4 w-1/3 bg-slate-100 rounded mb-4" />
              <div className="h-4 w-full bg-slate-100 rounded mb-2" />
              <div className="h-4 w-full bg-slate-100 rounded mb-2" />
              <div className="h-4 w-3/4 bg-slate-100 rounded" />
            </div>
          )}

          {/* Not found / not owner */}
          {!loading && !authLoading && notFound && (
            <StateMessage
              type="empty"
              title="Request not found"
              message="This request doesn't exist or you don't have access to view it."
              action={
                <button
                  onClick={() => router.push('/requests')}
                  className="text-sm font-medium text-blue-600 underline"
                >
                  Back to my requests
                </button>
              }
            />
          )}

          {/* Request detail */}
          {request && (
            <div data-testid="request-detail" className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <h1 className="text-xl font-bold mb-2 leading-snug">
                  {request.text.length > 80
                    ? request.text.slice(0, 80) + '...'
                    : request.text}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusChip status={request.status} />
                  {expired && (
                    <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white">
                      Expired
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Expired banner */}
                {expired && (
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                    <p className="text-sm text-slate-600">
                      This request expired on <strong>{formatDate(request.expiresAt)}</strong>.
                      Match results may no longer be accurate.
                    </p>
                  </div>
                )}

                {/* Full request text */}
                <div>
                  <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    What you asked for
                  </h2>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {request.text}
                  </p>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {request.category && (
                    <div>
                      <h3 className="font-semibold text-slate-500 mb-1">Category</h3>
                      <p className="text-slate-700">{request.category}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-500 mb-1">Location</h3>
                    <p className="text-slate-700">{request.location}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-500 mb-1">Urgency</h3>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${urgencyStyle[request.urgency] ?? ''}`}>
                      {urgencyLabel[request.urgency] ?? request.urgency}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-500 mb-1">Preferred contact</h3>
                    <p className="text-slate-700 capitalize">{request.preferredContact}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-500 mb-1">Posted</h3>
                    <p className="text-slate-700">{formatDate(request.createdAt)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-500 mb-1">Expires</h3>
                    <p className={expired ? 'text-red-600 font-medium' : 'text-slate-700'}>
                      {formatDate(request.expiresAt)}
                    </p>
                  </div>
                </div>

                {/* Matches action */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {expired ? (
                    <>
                      <Link
                        href={`/requests/${request.id}/matches`}
                        className="flex items-center justify-center w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors min-h-[44px]"
                      >
                        View past matches
                      </Link>
                      <p className="text-xs text-slate-400 text-center">
                        This request has expired. Match results may no longer be accurate.
                      </p>
                    </>
                  ) : request.status === 'approved' ? (
                    <Link
                      href={`/requests/${request.id}/matches`}
                      className="flex items-center justify-center w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors min-h-[44px]"
                    >
                      See matching services
                    </Link>
                  ) : (
                    <div className="rounded-lg bg-slate-50 p-3 text-center">
                      <p className="text-sm text-slate-500">
                        {request.status === 'pending'
                          ? 'Your request is pending review. Matches will be available once approved.'
                          : `This request is ${request.status}. Matching is not available.`}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => router.push('/requests')}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  &larr; Back to my requests
                </button>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
