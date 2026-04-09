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

// ─── Inline helper: compact stat card ────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-xl border p-3 text-center"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <p
        className="text-2xl font-bold leading-none"
        style={{ color: 'var(--color-primary)' }}
      >
        {value}
      </p>
      <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
        {label}
      </p>
    </div>
  );
}

// ─── Inline helper: external-link icon (used in service cards) ───────────────
function ExternalLinkIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ─── Inline helper: featured service card ────────────────────────────────────
function FeaturedServiceCard({ service }: { service: ServiceListing }) {
  const hasImage = (service.imageUrls?.length ?? 0) > 0;
  return (
    <Link
      href={`/services/${service.id}`}
      className="block rounded-xl overflow-hidden transition-all hover:shadow-md"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderTopWidth: '2px',
        borderTopColor: 'var(--color-primary-surface)',
        borderLeftWidth: '3px',
        borderLeftColor: 'var(--color-primary)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Top image — only when the listing has photos */}
      {hasImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={service.imageUrls![0]}
          alt={service.businessName}
          className="h-32 w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="p-4">
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-1"
          style={{ color: 'var(--color-primary)' }}
        >
          {service.category}
        </p>
        <h3 className="font-bold text-slate-900 line-clamp-1 mb-1">{service.businessName}</h3>
        {service.subcategory && (
          <p className="text-xs font-medium text-slate-500 mb-2">{service.subcategory}</p>
        )}
        <p className="text-sm text-slate-600 line-clamp-2 mb-3">{service.description}</p>
        {service.linkUrl && (
          <p className="mb-2 flex items-center gap-1 text-xs text-blue-600">
            <ExternalLinkIcon />
            Has website
          </p>
        )}
        <div className="flex flex-wrap gap-1">
          {service.serviceAreas.slice(0, 2).map((a) => (
            <span
              key={a}
              className="rounded-full px-2 py-0.5 text-xs"
              style={{
                backgroundColor: 'var(--color-primary-surface)',
                color: 'var(--color-primary-dark)',
              }}
            >
              {a}
            </span>
          ))}
          {service.serviceAreas.length > 2 && (
            <span className="text-xs text-slate-400">+{service.serviceAreas.length - 2} more</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ServicesBrowsePage() {
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
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

  // Stats — always from the full unfiltered services array
  const stats = useMemo(() => ({
    total:      services.length,
    categories: new Set(services.map((s) => s.category)).size,
    areas:      new Set(services.flatMap((s) => s.serviceAreas)).size,
  }), [services]);

  // Featured — most recent 3 from the full services array, stable under filtering
  const featured = useMemo(() =>
    [...services]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 3),
    [services]
  );

  // Filtered list — logic unchanged
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
        <div className="max-w-2xl mx-auto space-y-6 pb-8">

          {/* ── 1. Hero / Dashboard header ──────────────────────────── */}
          <section
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-surface) 0%, #d4ede1 100%)',
              border: '1px solid rgba(0,135,83,0.18)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
              Services
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-primary-dark)', opacity: 0.8 }}>
              Find trusted local services shared by members of the community.
            </p>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--color-primary-dark)', opacity: 0.6 }}>
              No more weekly reposting. Stay visible to the community.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/create/service"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 min-h-[44px] flex items-center"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                + List a Service
              </Link>
              <Link
                href="/create/request"
                className="rounded-lg border px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80 min-h-[44px] flex items-center"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-primary)',
                }}
              >
                Need help instead?
              </Link>
            </div>
          </section>

          {/* ── 2. Summary stats row ────────────────────────────────── */}
          {!loading && !error && services.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Services listed" value={stats.total} />
              <StatCard label="Categories"      value={stats.categories} />
              <StatCard label="Areas covered"   value={stats.areas} />
            </div>
          )}

          {/* ── 3. Featured services ────────────────────────────────── */}
          {!loading && !error && featured.length > 0 && (
            <section>
              <div className="mb-3">
                <h2 className="text-base font-bold text-slate-900">Featured services</h2>
                <p className="text-xs text-slate-500 mt-0.5">Recently listed by community members.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {featured.map((s) => (
                  <FeaturedServiceCard key={s.id} service={s} />
                ))}
              </div>
            </section>
          )}

          {/* ── 4. Filter / search control bar ─────────────────────── */}
          {!loading && !error && services.length > 0 && (
            <section
              className="rounded-xl p-4"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Filter &amp; search
              </p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceCategory | '')}
                    className="flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 min-h-[44px]"
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
                    className="flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 min-h-[44px]"
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
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 min-h-[44px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    aria-label="Search services"
                  />
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition min-h-[44px]"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ── Loading skeleton ─────────────────────────────────────── */}
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

          {/* ── Error ───────────────────────────────────────────────── */}
          {error && <StateMessage type="error" title="Error" message={error} />}

          {/* ── Empty (no services at all) ──────────────────────────── */}
          {!loading && !error && services.length === 0 && (
            <StateMessage
              type="empty"
              title="No services yet"
              message="Be the first to list a service for the community."
              action={
                <Link href="/create/service" className="text-sm font-medium text-blue-600 underline">
                  List a service
                </Link>
              }
            />
          )}

          {/* ── Filtered empty ──────────────────────────────────────── */}
          {!loading && !error && services.length > 0 && filtered.length === 0 && (
            <StateMessage
              type="empty"
              title="No services match your filters"
              message="Try broadening your search or clearing the filters."
              action={
                <button onClick={clearFilters} className="text-sm font-medium text-blue-600 underline">
                  Clear filters
                </button>
              }
            />
          )}

          {/* ── 5. All services list ────────────────────────────────── */}
          {!loading && filtered.length > 0 && (
            <section>
              <div className="mb-3">
                <h2 className="text-base font-bold text-slate-900">All services</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Browse every approved service currently available in the hub.
                </p>
              </div>
              <div className="space-y-3">
                {filtered.map((s) => (
                  <Link
                    key={s.id}
                    href={`/services/${s.id}`}
                    data-testid="service-card"
                    className="block rounded-xl border border-slate-200 p-4 shadow-sm hover:border-blue-300 transition-all card-lift"
                    style={{ backgroundColor: '#FEFDFB' }}
                  >
                    <div className="flex gap-3">
                      {/* Conditional thumbnail — only rendered when the listing has photos */}
                      {s.imageUrls && s.imageUrls.length > 0 && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.imageUrls[0]}
                          alt={s.businessName}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0 self-start"
                          loading="lazy"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 line-clamp-1">{s.businessName}</h3>
                          <span className="text-xs text-slate-500 whitespace-nowrap">{s.category}</span>
                        </div>
                        {s.subcategory && (
                          <p className="text-xs text-blue-600 font-medium mb-1">{s.subcategory}</p>
                        )}
                        <p className="text-sm text-slate-600 line-clamp-2 mb-2">{s.description}</p>
                        <div className="flex flex-wrap gap-1 items-center">
                          {s.serviceAreas.slice(0, 3).map((a) => (
                            <span key={a} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                              {a}
                            </span>
                          ))}
                          {s.serviceAreas.length > 3 && (
                            <span className="text-xs text-slate-400">+{s.serviceAreas.length - 3} more</span>
                          )}
                          <span className="ml-auto rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 capitalize">
                            {s.availabilityType}
                          </span>
                          {s.linkUrl && (
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-blue-600 flex items-center gap-1">
                              <ExternalLinkIcon />
                              Website
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </AppShell>
    </AuthGuard>
  );
}
