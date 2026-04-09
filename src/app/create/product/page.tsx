"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import ProductForm, { type ProductFormData } from '@/components/ProductForm';
import StateMessage from '@/components/StateMessage';
import { useAuth } from '@/lib/auth/AuthContext';
import { createProductListing } from '@/services/productListingService';
import type { ProductCategory } from '@/types/content';

/** Returns true if the current time is Thursday in the UK (Europe/London). */
function isThursdayUK(): boolean {
  return new Date().toLocaleDateString('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'long',
  }) === 'Thursday';
}

export default function CreateProductPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const isElevated = profile?.role === 'admin' || profile?.role === 'moderator' || profile?.role === 'contributor';
  const postingBlocked = !isThursdayUK() && !isElevated;

  const handleSubmit = async (data: ProductFormData) => {
    if (!user) return;

    await createProductListing(
      {
        title: data.title,
        description: data.description,
        category: data.category as ProductCategory,
        priceText: data.priceOnRequest ? '' : data.priceText,
        priceOnRequest: data.priceOnRequest,
        sellerName: data.sellerName,
        whatsapp: data.whatsapp,
        location: data.location,
        deliveryAvailable: data.deliveryAvailable,
        expiresAt: data.expiresAt,
        linkUrl: data.linkUrl.trim() || null,
        authorId: user.uid,
      },
      data.images,
      user.uid
    );

    setSuccess(true);
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">List a Product</h1>
          <p className="text-sm text-slate-600 mb-6">Sell food, goods, or crafts to the community.</p>

          {success ? (
            <StateMessage
              type="success"
              title="Product listed!"
              message="Your product listing is pending review and will be visible once approved."
              action={
                <div className="flex gap-2">
                  <button
                    onClick={() => setSuccess(false)}
                    className="text-sm font-medium text-emerald-700 underline"
                  >
                    List another
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="text-sm font-medium text-emerald-700 underline"
                  >
                    Go home
                  </button>
                </div>
              }
            />
          ) : (
            <>
              {postingBlocked && (
                <div
                  className="rounded-xl p-4 flex gap-3 mb-6"
                  style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
                >
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ background: '#FEF3C7', color: '#D97706' }}
                  >
                    📅
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#92400E' }}>
                      New listings open on Thursdays only
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed" style={{ color: '#B45309' }}>
                      To keep the community marketplace organised, new service and product listings
                      can only be submitted on Thursdays. You can browse the form and prepare your
                      details now — the submit button will be enabled again on Thursday.
                    </p>
                  </div>
                </div>
              )}

              <fieldset disabled={postingBlocked} className="contents">
                <ProductForm
                  defaultValues={{
                    sellerName: profile?.displayName ?? '',
                    whatsapp: profile?.phone ?? '',
                    location: profile?.area ?? '',
                  }}
                  onSubmit={handleSubmit}
                />
              </fieldset>
            </>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
