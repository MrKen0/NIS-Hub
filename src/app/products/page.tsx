"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import StateMessage from '@/components/StateMessage';
import { getApprovedProducts } from '@/services/browseService';
import { PRODUCT_CATEGORIES } from '@/types/content';
import type { ProductListing, ProductCategory } from '@/types/content';

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

// ─── Inline helper: product image / fallback panel ───────────────────────────
function ProductImagePanel({
  imageUrls,
  title,
  category,
}: {
  imageUrls: string[];
  title: string;
  category: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  if (imageUrls.length > 0 && !imgFailed) {
    return (
      <div className="h-36 w-full overflow-hidden rounded-t-xl bg-slate-100">
        <img
          src={imageUrls[0]}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  // Polished no-image fallback
  return (
    <div
      className="h-36 w-full rounded-t-xl flex flex-col items-center justify-center gap-1"
      style={{
        background: 'linear-gradient(135deg, var(--color-primary-surface) 0%, #d4ede1 100%)',
        borderBottom: '1px solid rgba(0,135,83,0.12)',
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,135,83,0.12)' }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--color-primary)' }}
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>
      <p className="text-xs font-medium" style={{ color: 'var(--color-primary-dark)', opacity: 0.7 }}>
        {category}
      </p>
    </div>
  );
}

// ─── Inline helper: featured product card ────────────────────────────────────
function FeaturedProductCard({ product }: { product: ProductListing }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="block rounded-xl overflow-hidden transition-all hover:shadow-md"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderTopWidth: '2px',
        borderTopColor: 'rgba(207,175,90,0.5)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <ProductImagePanel
        imageUrls={product.imageUrls}
        title={product.title}
        category={product.category}
      />
      <div className="p-3">
        <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-0.5">
          {product.title}
        </h3>
        <p
          className="text-base font-bold mb-1"
          style={{ color: 'var(--color-primary)' }}
        >
          {product.priceOnRequest ? 'Price on request' : product.priceText}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{product.category}</span>
          {product.deliveryAvailable && (
            <span
              className="text-xs font-medium rounded-full px-2 py-0.5"
              style={{
                backgroundColor: 'var(--color-primary-surface)',
                color: 'var(--color-primary-dark)',
              }}
            >
              Delivery
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProductsBrowsePage() {
  const [products, setProducts] = useState<ProductListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
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

  // Stats — always from the full unfiltered products array
  const stats = useMemo(() => ({
    total:      products.length,
    categories: new Set(products.map((p) => p.category)).size,
    locations:  new Set(products.map((p) => p.location)).size,
  }), [products]);

  // Featured — most recent 3 from the full products array, stable under filtering
  const featured = useMemo(() =>
    [...products]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 3),
    [products]
  );

  // Filtered list — logic unchanged
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
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
                  Products
                </h1>
                <p className="mt-1 text-sm" style={{ color: 'var(--color-primary-dark)', opacity: 0.8 }}>
                  Food, goods, and crafts made and sold by community members.
                </p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--color-primary-dark)', opacity: 0.6 }}>
                  Sell once. Stay visible. No weekly reposting needed.
                </p>
              </div>
              {/* Gold accent badge */}
              <span
                className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: 'rgba(207,175,90,0.18)',
                  color: '#7a5c1e',
                  border: '1px solid rgba(207,175,90,0.35)',
                }}
              >
                Community market
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/create/product"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 min-h-[44px] flex items-center"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                + List a Product
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
                Looking for something?
              </Link>
            </div>
          </section>

          {/* ── 2. Summary stats row ────────────────────────────────── */}
          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Products listed" value={stats.total} />
              <StatCard label="Categories"      value={stats.categories} />
              <StatCard label="Locations"       value={stats.locations} />
            </div>
          )}

          {/* ── 3. Featured products ────────────────────────────────── */}
          {!loading && !error && featured.length > 0 && (
            <section>
              <div className="mb-3">
                <h2 className="text-base font-bold text-slate-900">Featured products</h2>
                <p className="text-xs text-slate-500 mt-0.5">Recently listed by community members.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {featured.map((p) => (
                  <FeaturedProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* ── 4. Filter / search control bar ─────────────────────── */}
          {!loading && !error && products.length > 0 && (
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
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory | '')}
                  className="min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 min-h-[44px]"
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
                  placeholder="Search products..."
                  className="flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 min-h-[44px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  aria-label="Search products"
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
            </section>
          )}

          {/* ── Loading skeleton ─────────────────────────────────────── */}
          {loading && (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 animate-pulse">
                  <div className="h-28 w-full bg-slate-200 rounded-lg mb-2" />
                  <div className="h-4 w-3/4 bg-slate-200 rounded mb-1" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* ── Error ───────────────────────────────────────────────── */}
          {error && <StateMessage type="error" title="Error" message={error} />}

          {/* ── Empty (no products at all) ──────────────────────────── */}
          {!loading && !error && products.length === 0 && (
            <StateMessage
              type="empty"
              title="No products yet"
              message="Be the first to list a product for the community."
              action={
                <Link href="/create/product" className="text-sm font-medium text-blue-600 underline">
                  List a product
                </Link>
              }
            />
          )}

          {/* ── Filtered empty ──────────────────────────────────────── */}
          {!loading && !error && products.length > 0 && filtered.length === 0 && (
            <StateMessage
              type="empty"
              title="No products match your filters"
              message="Try broadening your search or clearing the filters."
              action={
                <button onClick={clearFilters} className="text-sm font-medium text-blue-600 underline">
                  Clear filters
                </button>
              }
            />
          )}

          {/* ── 5. All products grid ─────────────────────────────────── */}
          {!loading && filtered.length > 0 && (
            <section>
              <div className="mb-3">
                <h2 className="text-base font-bold text-slate-900">All products</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Browse every approved product currently available in the hub.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    data-testid="product-card"
                    className="rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:border-blue-300 transition-all card-lift"
                    style={{ backgroundColor: '#FEFDFB' }}
                  >
                    {/* Image or placeholder */}
                    <div className="h-28 bg-slate-100 flex items-center justify-center">
                      {p.imageUrls.length > 0 ? (
                        <img
                          src={p.imageUrls[0]}
                          alt={p.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML =
                              '<span class="text-3xl">📦</span>';
                          }}
                        />
                      ) : (
                        <span className="text-3xl">📦</span>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{p.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{p.category}</p>
                      <p className="text-sm font-bold text-blue-700 mt-1">
                        {p.priceOnRequest ? 'Price on request' : p.priceText}
                      </p>
                      {p.deliveryAvailable && (
                        <span className="text-xs text-green-600 font-medium">Delivery available</span>
                      )}
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
