"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import StateMessage from '@/components/StateMessage';
import { getApprovedServices } from '@/services/browseService';
import { SERVICE_CATEGORIES, STEVENAGE_AREAS } from '@/types/content';
import type { ServiceListing, ServiceCategory, StevenageArea } from '@/types/content';

const SERVICE_CATEGORY_KEYS = Object.keys(SERVICE_CATEGORIES) as ServiceCategory[];

const selectClass = [
  'w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900',
  'transition-colors focus:outline-none focus:ring-2',
  'focus:border-[#008753] focus:ring-[#008753]/20 min-h-[44px]',
].join(' ');

export default function ServicesBrowsePage() {
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [category, setCategory] = useState<ServiceCategory | ''>('');
  const [area, setArea] = useState<StevenageArea | ''>('');
  const [keyword, setKeyword] = useState('');

  const hasFilters = category !== '' || area !== '' || keyword !== '';

  function clearFilters() {
    setCategory('');
    setArea('');
    setKeyword('');
  }

  useEffect(() => {
    getApprovedServices()
      .then(setServices)
      .catch(() => setError('Failed to load services.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!hasFilters) return services;
    const kw = keyword.toLowerCase().trim();
    return services.filter((s) => {
      if (category && s.category !== category) return false;
      if (area && !s.serviceAreas.includes(area)) return false;
      if (kw) {
        const haystack = `${s.businessName} ${s.description} ${s.subcategory} ${s.category}`.toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      return true;
    });
  }, [services, category, area, keyword, hasFilters]);

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
                Services
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Skills and services from the community
              </p>
            </div>
            <Link
              href="/create/service"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors min-h-[44px] flex items-center"
              style={{ background: 'var(--color-primary)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-primary-dark)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-primary)';
              }}
            >
              + List a Service
            </Link>
          </div>

          {/* ── Filters ── */}
          {!loading && !error && services.length > 0 && (
            <div className="space-y-2 mb-5">
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ServiceCategory | '')}
                  className={selectClass}
                  style={{ borderColor: 'var(--color-border)' }}
                  aria-label="Filter by category"
                >
                  <option value="">All categories</option>
                  {SERVICE_CATEGORY_KEYS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value as StevenageArea | '')}
                  className={selectClass}
                  style={{ borderColor: 'var(--color-border)' }}
                  aria-label="Filter by area"
                >
                  <option value="">All areas</option>
                  {STEVENAGE_AREAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search services…"
                  className={`flex-1 ${selectClass}`}
                  style={{ borderColor: 'var(--color-border)' }}
                  aria-label="Search services"
                />
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="rounded-xl border px-4 py-2.5 text-sm font-semibold transition min-h-[44px]"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

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

          {!loading && !error && services.length === 0 && (
            <StateMessage
              type="empty"
              title="No services yet"
              message="Be the first to list a service for the community."
              action={
                <Link
                  href="/create/service"
                  className="text-sm font-semibold underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  List a service
                </Link>
              }
            />
          )}

          {!loading && !error && services.length > 0 && filtered.length === 0 && (
            <StateMessage
              type="empty"
              title="No services match your filters"
              message="Try broadening your search or clearing the filters."
              action={
                <button
                  onClick={clearFilters}
                  className="text-sm font-semibold underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Clear filters
                </button>
              }
            />
          )}

          {/* ── Service cards ── */}
          {!loading && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${s.id}`}
                  className="block rounded-2xl bg-white p-5 transition-all"
                  style={{
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,135,83,0.35)';
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'var(--shadow-raise)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'var(--shadow-card)';
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 line-clamp-1">{s.businessName}</h3>
                    <span
                      className="flex-shrink-0 text-xs font-medium rounded-full px-2.5 py-1"
                      style={{ background: 'var(--color-primary-surface)', color: 'var(--color-primary)' }}
                    >
                      {s.category}
                    </span>
                  </div>
                  {s.subcategory && s.subcategory !== 'Other' && (
                    <p
                      className="text-xs font-semibold mb-1"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {s.subcategory}
                    </p>
                  )}
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                    {s.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.serviceAreas.slice(0, 3).map((a) => (
                      <span
                        key={a}
                        className="rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{ background: '#F3F4F6', color: '#374151' }}
                      >
                        {a}
                      </span>
                    ))}
                    {s.serviceAreas.length > 3 && (
                      <span className="text-xs py-1" style={{ color: 'var(--color-muted)' }}>
                        +{s.serviceAreas.length - 3} more
                      </span>
                    )}
                    <span
                      className="ml-auto rounded-full px-2.5 py-1 text-xs font-medium capitalize"
                      style={{ background: '#F3F4F6', color: '#374151' }}
                    >
                      {s.availabilityType}
                    </span>
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
