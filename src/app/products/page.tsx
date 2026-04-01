"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import StateMessage from '@/components/StateMessage';
import { getApprovedProducts } from '@/services/browseService';
import { PRODUCT_CATEGORIES } from '@/types/content';
import type { ProductListing, ProductCategory } from '@/types/content';

const inputClass = [
  'rounded-xl border bg-white px-4 py-3 text-sm text-slate-900',
  'transition-colors focus:outline-none focus:ring-2',
  'focus:border-[#008753] focus:ring-[#008753]/20 min-h-[44px]',
].join(' ');

export default function ProductsBrowsePage() {
  const [products, setProducts] = useState<ProductListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [keyword, setKeyword] = useState('');

  const hasFilters = category !== '' || keyword !== '';

  function clearFilters() {
    setCategory('');
    setKeyword('');
  }

  useEffect(() => {
    getApprovedProducts()
      .then(setProducts)
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!hasFilters) return products;
    const kw = keyword.toLowerCase().trim();
    return products.filter((p) => {
      if (category && p.category !== category) return false;
      if (kw) {
        const haystack = `${p.title} ${p.description} ${p.category}`.toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      return true;
    });
  }, [products, category, keyword, hasFilters]);

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
                Products
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Food, goods, and crafts from the community
              </p>
            </div>
            <Link
              href="/create/product"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors min-h-[44px] flex items-center"
              style={{ background: 'var(--color-primary)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-primary-dark)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-primary)';
              }}
            >
              + List a Product
            </Link>
          </div>

          {/* ── Filters ── */}
          {!loading && !error && products.length > 0 && (
            <div className="flex gap-2 mb-5">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory | '')}
                className={inputClass}
                style={{ borderColor: 'var(--color-border)' }}
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search products…"
                className={`flex-1 min-w-0 ${inputClass}`}
                style={{ borderColor: 'var(--color-border)' }}
                aria-label="Search products"
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
          )}

          {/* ── Loading skeleton ── */}
          {loading && (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white overflow-hidden animate-pulse"
                  style={{ border: '1px solid var(--color-border)' }}
                >
                  <div className="h-28 w-full" style={{ background: 'var(--color-border)' }} />
                  <div className="p-3 space-y-2">
                    <div className="h-4 w-3/4 rounded-lg" style={{ background: '#F3F4F6' }} />
                    <div className="h-3 w-1/2 rounded-lg" style={{ background: '#F3F4F6' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <StateMessage type="error" title="Error" message={error} />}

          {!loading && !error && products.length === 0 && (
            <StateMessage
              type="empty"
              title="No products yet"
              message="Be the first to list a product for the community."
              action={
                <Link
                  href="/create/product"
                  className="text-sm font-semibold underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  List a product
                </Link>
              }
            />
          )}

          {!loading && !error && products.length > 0 && filtered.length === 0 && (
            <StateMessage
              type="empty"
              title="No products match your filters"
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

          {/* ── Product grid ── */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="rounded-2xl bg-white overflow-hidden transition-all"
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
                  {/* Image or placeholder */}
                  <div
                    className="h-28 flex items-center justify-center"
                    style={{ background: 'var(--color-primary-surface)' }}
                  >
                    {p.imageUrls.length > 0 ? (
                      <img
                        src={p.imageUrls[0]}
                        alt={p.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML =
                            '<span style="font-size:2rem">📦</span>';
                        }}
                      />
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 01-8 0" />
                      </svg>
                    )}
                  </div>
                  <div className="p-3">
                    <h3
                      className="font-bold text-sm line-clamp-1"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {p.title}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                      {p.category}
                    </p>
                    <p
                      className="text-sm font-bold mt-1"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {p.priceOnRequest ? 'Price on request' : p.priceText}
                    </p>
                    {p.deliveryAvailable && (
                      <span
                        className="text-xs font-semibold"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        Delivery available
                      </span>
                    )}
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
