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

export default function CreateProductPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [success, setSuccess] = useState(false);

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
            <ProductForm
              defaultValues={{
                sellerName: profile?.displayName ?? '',
                whatsapp: profile?.phone ?? '',
                location: profile?.area ?? '',
              }}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
