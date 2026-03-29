"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import StateMessage from '@/components/StateMessage';
import { getApprovedProducts } from '@/services/browseService';
import { PRODUCT_CATEGORIES } from '@/types/content';
import type { ProductListing, ProductCategory } from '@/types/content';

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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Products</h1>
              <p className="text-sm text-slate-600">Food, goods, and crafts from the community</p>
            </div>
            <Link
              href="/create/product"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors min-h-[44px] flex items-center"
            >
              + List a Product
            </Link>
          </div>

          {/* Filters */}
          {!loading && !error && products.length > 0 && (
            <div className="flex gap-2 mb-4">
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
          )}

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

          {error && <StateMessage type="error" title="Error" message={error} />}

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

          {/* Filtered empty state */}
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

          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
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
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
