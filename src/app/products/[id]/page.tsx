"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import StateMessage from '@/components/StateMessage';
import { getProductById } from '@/services/browseService';
import type { ProductListing } from '@/types/content';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params.id || typeof params.id !== 'string') return;
    getProductById(params.id)
      .then((p) => {
        if (!p || p.status !== 'approved') {
          setNotFound(true);
        } else {
          setProduct(p);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  const whatsappLink = product
    ? `https://wa.me/${product.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Hi! I'm interested in "${product.title}" listed on NIS Hub.`
      )}`
    : '';

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-2xl mx-auto">
          {loading && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 animate-pulse">
              <div className="h-48 w-full bg-slate-200 rounded-lg mb-4" />
              <div className="h-7 w-2/3 bg-slate-200 rounded mb-3" />
              <div className="h-4 w-1/3 bg-slate-100 rounded mb-4" />
              <div className="h-4 w-full bg-slate-100 rounded" />
            </div>
          )}

          {notFound && (
            <StateMessage
              type="empty"
              title="Product not found"
              message="This listing may have been removed or is not yet approved."
              action={
                <button onClick={() => router.push('/products')} className="text-sm font-medium underline" style={{ color: 'var(--color-primary)' }}>
                  Back to products
                </button>
              }
            />
          )}

          {product && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {/* Image gallery */}
              {product.imageUrls.length > 0 ? (
                <div className="h-64 bg-slate-100 overflow-hidden">
                  <img
                    src={product.imageUrls[0]}
                    alt={product.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML =
                        '<div class="h-full flex items-center justify-center"><span class="text-5xl">📦</span><p class="text-sm text-slate-400 mt-2">Image unavailable</p></div>';
                    }}
                  />
                </div>
              ) : (
                <div className="h-48 bg-slate-100 flex flex-col items-center justify-center">
                  <span className="text-5xl">📦</span>
                  <p className="text-sm text-slate-400 mt-2">No photo</p>
                </div>
              )}

              <div className="p-6 space-y-5">
                {/* Title + price */}
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">{product.title}</h1>
                  <p className="text-lg font-bold" style={{ color: 'var(--color-primary-dark)' }}>
                    {product.priceOnRequest ? 'Price on request' : product.priceText}
                  </p>
                </div>

                {/* Details */}
                <div>
                  <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</h2>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Category</span>
                    <p className="font-medium text-slate-900">{product.category}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Seller</span>
                    <p className="font-medium text-slate-900">{product.sellerName}</p>
                  </div>
                  {product.location && (
                    <div>
                      <span className="text-slate-500">Location</span>
                      <p className="font-medium text-slate-900">{product.location}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500">Delivery</span>
                    <p className="font-medium text-slate-900">{product.deliveryAvailable ? 'Available' : 'Collection only'}</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="pt-4 border-t">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors min-h-[44px]"
                  >
                    Contact Seller via WhatsApp
                  </a>
                </div>

                <button
                  onClick={() => router.push('/products')}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  &larr; Back to products
                </button>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
