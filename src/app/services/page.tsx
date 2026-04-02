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
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Services</h1>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Skills and services from the community</p>
            </div>
            <Link
              href="/create/service"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white min-h-[44px] flex items-center transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-primary)' }}
            >
              + List a Service
            </Link>
          </div>

          {/* Filters */}
          {!loading && !error && services.length > 0 && (
            <div className="space-y-2 mb-5">
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ServiceCategory | '')}
                  className="flex-1 min-w-0 rounded-xl bg-white px-3 py-2 text-sm min-h-[44px]"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
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
                  className="flex-1 min-w-0 rounded-xl bg-white px-3 py-2 text-sm min-h-[44px]"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
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
                  placeholder="Search services..."
                  className="flex-1 rounded-xl bg-white px-3 py-2 text-sm min-h-[44px] outline-none"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  aria-label="Search services"
                />
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="rounded-xl px-3 py-2 text-sm font-medium min-h-[44px] hover:opacity-80 transition-opacity"
                    style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

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

          {!loading && !error && services.length === 0 && (
            <StateMessage
              type="empty"
              title="No services yet"
              message="Be the first to list a service for the community."
              action={
                <Link href="/create/service" className="text-sm font-medium underline" style={{ color: 'var(--color-primary)' }}>
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
                <button onClick={clearFilters} className="text-sm font-medium underline" style={{ color: 'var(--color-primary)' }}>
                  Clear filters
                </button>
              }
            />
          )}

          {!loading && filtered.length > 0 && (
            <div className="space-y-3">
              {filtered.map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${s.id}`}
                  data-testid="service-card"
                  className="block rounded-xl bg-white p-4 card-lift"
                  style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold line-clamp-1" style={{ color: 'var(--color-text)' }}>{s.businessName}</h3>
                    <span className="text-xs whitespace-nowrap" style={{ color: 'var(--color-muted)' }}>{s.category}</span>
                  </div>
                  {s.subcategory && (
                    <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-primary)' }}>{s.subcategory}</p>
                  )}
                  <p className="text-sm line-clamp-2 mb-2" style={{ color: 'var(--color-muted)' }}>{s.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {s.serviceAreas.slice(0, 3).map((a) => (
                      <span
                        key={a}
                        className="rounded-full px-2 py-0.5 text-xs"
                        style={{ background: 'var(--color-bg)', color: 'var(--color-muted)' }}
                      >
                        {a}
                      </span>
                    ))}
                    {s.serviceAreas.length > 3 && (
                      <span className="text-xs" style={{ color: 'var(--color-muted)' }}>+{s.serviceAreas.length - 3} more</span>
                    )}
                    <span
                      className="ml-auto rounded-full px-2 py-0.5 text-xs capitalize"
                      style={{ background: 'var(--color-primary-surface)', color: 'var(--color-primary)' }}
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
