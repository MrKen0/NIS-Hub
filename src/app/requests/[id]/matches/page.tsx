"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import StateMessage from '@/components/StateMessage';
import MatchResultCard from '@/components/MatchResultCard';
import Button from '@/components/Button';
import { getRequestById } from '@/services/browseService';
import { findMatchesForRequest, type MatchOutcome } from '@/services/matchingService';
import type { HelpRequest } from '@/types/content';

export default function RequestMatchesPage() {
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [outcome, setOutcome] = useState<MatchOutcome | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');

      try {
        const req = await getRequestById(requestId);
        if (!req) {
          setError('Request not found.');
          setLoading(false);
          return;
        }
        setRequest(req);

        const result = await findMatchesForRequest(req);
        setOutcome(result);
      } catch {
        setError('Something went wrong loading matches.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [requestId]);

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Matching Services
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            {request
              ? `Based on your request: "${request.text.length > 60 ? request.text.slice(0, 60) + '...' : request.text}"`
              : 'Finding the best matches for your request...'}
          </p>

          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse"
                >
                  <div className="h-5 w-2/3 bg-slate-200 rounded mb-3" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded mb-2" />
                  <div className="h-4 w-3/4 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <StateMessage
              type="error"
              title="Could not load matches"
              message={error}
              action={
                <Link href="/" className="text-sm font-medium text-red-700 underline">
                  Go home
                </Link>
              }
            />
          )}

          {/* Product placeholder */}
          {!loading && !error && outcome?.type === 'products-placeholder' && (
            <div data-testid="product-placeholder">
              <StateMessage
                type="empty"
                title="Product matching coming soon"
                message="We can't match product requests automatically yet. Browse the marketplace to find what you need."
                action={
                  <Link href="/products">
                    <Button variant="secondary" size="sm">Browse products</Button>
                  </Link>
                }
              />
            </div>
          )}

          {/* No matches */}
          {!loading && !error && outcome?.type === 'no-matches' && (
            <div data-testid="no-matches">
              <StateMessage
                type="empty"
                title="No matching services found"
                message={`We couldn't find services${outcome.location ? ` in ${outcome.location}` : ''}${outcome.category ? ` for "${outcome.category}"` : ''} right now. New services are added regularly — try browsing the full directory.`}
                action={
                  <Link data-testid="browse-services-link" href="/services">
                    <Button variant="secondary" size="sm">Browse all services</Button>
                  </Link>
                }
              />
            </div>
          )}

          {/* Match results */}
          {!loading && !error && outcome?.type === 'services' && outcome.results.length > 0 && (
            <div data-testid="match-results" className="space-y-3">
              {outcome.results.map((result, i) => (
                <MatchResultCard
                  key={result.service.id}
                  result={result}
                  rank={i + 1}
                  preferredContact={request?.preferredContact ?? 'either'}
                />
              ))}

              <div className="pt-4 text-center">
                <p className="text-sm text-slate-500 mb-2">
                  Not what you&apos;re looking for?
                </p>
                <Link data-testid="browse-services-link" href="/services">
                  <Button variant="secondary" size="sm">Browse all services</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
