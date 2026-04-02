"use client";

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import AuthGuard from '@/components/AuthGuard';
import OwnerListingCard from '@/components/OwnerListingCard';
import StateMessage from '@/components/StateMessage';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getMyServiceListings, republishServiceListing } from '@/services/serviceListingService';
import { getMyProductListings, republishProductListing } from '@/services/productListingService';
import type { ServiceListing, ProductListing } from '@/types/content';

type Tab = 'services' | 'products';

// Skeleton card placeholder
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-4 animate-pulse"
      style={{ backgroundColor: '#FEFDFB', border: '1px solid var(--color-border)' }}
    >
      <div className="h-4 w-2/3 rounded bg-slate-200 mb-2" />
      <div className="h-3 w-1/3 rounded bg-slate-100 mb-4" />
      <div className="h-3 w-1/2 rounded bg-slate-100" />
    </div>
  );
}

export default function MyListingsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <MyListingsContent />
      </AppShell>
    </AuthGuard>
  );
}

function MyListingsContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('services');
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [products, setProducts] = useState<ProductListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Track which listing ID is currently being boosted
  const [boostingId, setBoostingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError('');

    Promise.all([
      getMyServiceListings(user.uid),
      getMyProductListings(user.uid),
    ])
      .then(([svcs, prods]) => {
        setServices(svcs);
        setProducts(prods);
      })
      .catch(() => setError('Could not load your listings. Please try again.'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleBoostService = async (id: string) => {
    setBoostingId(id);
    try {
      await republishServiceListing(id);
      // Optimistically update the card's lastRepublishedAt in local state
      const now = new Date().toISOString();
      setServices((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, lastRepublishedAt: now, surfacedAt: now }
            : s,
        ),
      );
    } catch {
      // silent — the button re-enables and the user can try again
    } finally {
      setBoostingId(null);
    }
  };

  const handleBoostProduct = async (id: string) => {
    setBoostingId(id);
    try {
      await republishProductListing(id);
      const now = new Date().toISOString();
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, lastRepublishedAt: now, surfacedAt: now }
            : p,
        ),
      );
    } catch {
      // silent
    } finally {
      setBoostingId(null);
    }
  };

  const tabClass = (tab: Tab) =>
    `px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors min-h-[40px] ${
      activeTab === tab
        ? 'text-white'
        : 'bg-transparent hover:bg-slate-100'
    }`;

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* ── Header ──────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          My Listings
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
          Manage and boost your services and products.
        </p>
      </div>

      {/* ── How it works note ────────────────────────── */}
      <div
        className="rounded-xl px-4 py-3 text-xs leading-relaxed space-y-1"
        style={{
          backgroundColor: 'var(--color-primary-surface)',
          border: '1px solid rgba(0,135,83,0.18)',
          color: 'var(--color-primary-dark)',
        }}
      >
        <p>
          <strong>Editing a listing</strong> sends it back for moderator review before it reappears in browse.
        </p>
        <p>
          <strong>Boosting an approved listing</strong> moves it back to the top of the browse feed — no need to repost.
        </p>
      </div>

      {/* ── Tab bar ──────────────────────────────────── */}
      <div
        className="flex gap-1 p-1 rounded-2xl"
        style={{ backgroundColor: '#F1F5F9' }}
        role="tablist"
        aria-label="My listings tabs"
      >
        <button
          data-testid="tab-services"
          role="tab"
          aria-selected={activeTab === 'services'}
          onClick={() => setActiveTab('services')}
          className={tabClass('services')}
          style={
            activeTab === 'services'
              ? { backgroundColor: 'var(--color-primary)' }
              : { color: 'var(--color-muted)' }
          }
        >
          My Services
          {!loading && services.length > 0 && (
            <span className="ml-1.5 text-xs opacity-75">({services.length})</span>
          )}
        </button>
        <button
          data-testid="tab-products"
          role="tab"
          aria-selected={activeTab === 'products'}
          onClick={() => setActiveTab('products')}
          className={tabClass('products')}
          style={
            activeTab === 'products'
              ? { backgroundColor: 'var(--color-primary)' }
              : { color: 'var(--color-muted)' }
          }
        >
          My Products
          {!loading && products.length > 0 && (
            <span className="ml-1.5 text-xs opacity-75">({products.length})</span>
          )}
        </button>
      </div>

      {/* ── Error state ───────────────────────────────── */}
      {error && (
        <StateMessage type="error" title="Could not load listings" message={error} />
      )}

      {/* ── Services panel ───────────────────────────── */}
      {activeTab === 'services' && !error && (
        <div data-testid="services-panel" className="space-y-3">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : services.length === 0 ? (
            <StateMessage
              type="empty"
              title="No service listings yet"
              message="List a service so community members can find you."
              action={
                <Link
                  href="/create/service"
                  className="text-sm font-semibold underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  List a service →
                </Link>
              }
            />
          ) : (
            services.map((s) => (
              <OwnerListingCard
                key={s.id}
                type="service"
                id={s.id}
                title={s.businessName}
                category={s.category}
                status={s.status}
                expiresAt={s.expiresAt}
                createdAt={s.createdAt}
                lastRepublishedAt={s.lastRepublishedAt}
                onBoost={handleBoostService}
                boosting={boostingId === s.id}
              />
            ))
          )}
        </div>
      )}

      {/* ── Products panel ───────────────────────────── */}
      {activeTab === 'products' && !error && (
        <div data-testid="products-panel" className="space-y-3">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : products.length === 0 ? (
            <StateMessage
              type="empty"
              title="No product listings yet"
              message="List a product to start selling to the community."
              action={
                <Link
                  href="/create/product"
                  className="text-sm font-semibold underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  List a product →
                </Link>
              }
            />
          ) : (
            products.map((p) => (
              <OwnerListingCard
                key={p.id}
                type="product"
                id={p.id}
                title={p.title}
                category={p.category}
                status={p.status}
                expiresAt={p.expiresAt}
                createdAt={p.createdAt}
                lastRepublishedAt={p.lastRepublishedAt}
                imageUrl={p.imageUrls?.[0]}
                onBoost={handleBoostProduct}
                boosting={boostingId === p.id}
              />
            ))
          )}
        </div>
      )}

    </div>
  );
}
