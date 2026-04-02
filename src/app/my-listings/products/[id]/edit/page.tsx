"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import AuthGuard from '@/components/AuthGuard';
import ProductForm, { type ProductFormData } from '@/components/ProductForm';
import StateMessage from '@/components/StateMessage';
import { useAuth } from '@/lib/auth/AuthContext';
import { getProductById } from '@/services/browseService';
import { updateProductListing } from '@/services/productListingService';
import type { ProductListing, ProductCategory } from '@/types/content';

export default function EditProductPage() {
  return (
    <AuthGuard>
      <AppShell>
        <EditProductContent />
      </AppShell>
    </AuthGuard>
  );
}

function EditProductContent() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';

  const [listing, setListing] = useState<ProductListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [success, setSuccess] = useState(false);

  // Tracks which existing image URLs the user still wants to keep
  const [retainedUrls, setRetainedUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!id || !user) return;

    getProductById(id)
      .then((prod) => {
        if (!prod || prod.authorId !== user.uid) {
          setNotFound(true);
        } else {
          setListing(prod);
          setRetainedUrls(prod.imageUrls ?? []);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleSubmit = async (data: ProductFormData) => {
    if (!id || !user) return;
    await updateProductListing(
      id,
      {
        title:             data.title,
        description:       data.description,
        category:          data.category as ProductCategory,
        priceText:         data.priceOnRequest ? '' : data.priceText,
        priceOnRequest:    data.priceOnRequest,
        sellerName:        data.sellerName,
        whatsapp:          data.whatsapp,
        location:          data.location,
        deliveryAvailable: data.deliveryAvailable,
        expiresAt:         data.expiresAt,
      },
      data.images,     // new File uploads
      retainedUrls,    // existing URLs to keep
      user.uid,
    );
    setSuccess(true);
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-lg mx-auto">
        <StateMessage
          type="error"
          title="Not found"
          message="This listing doesn't exist or you don't have permission to edit it."
          action={
            <button
              onClick={() => router.push('/my-listings')}
              className="text-sm font-semibold underline"
              style={{ color: 'var(--color-primary)' }}
            >
              ← Back to My Listings
            </button>
          }
        />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <StateMessage
          type="success"
          title="Changes saved"
          message="Your listing is back in review and will reappear in browse once approved."
          action={
            <button
              onClick={() => router.push('/my-listings')}
              className="text-sm font-semibold underline"
              style={{ color: 'var(--color-primary)' }}
            >
              ← Back to My Listings
            </button>
          }
        />
      </div>
    );
  }

  if (!listing) return null;

  // Map ProductListing → ProductFormData for pre-fill (images: [] — handled via initialImageUrls)
  const defaultValues: Partial<ProductFormData> = {
    title:             listing.title,
    description:       listing.description,
    category:          listing.category,
    priceText:         listing.priceText,
    priceOnRequest:    listing.priceOnRequest,
    sellerName:        listing.sellerName,
    whatsapp:          listing.whatsapp,
    location:          listing.location,
    deliveryAvailable: listing.deliveryAvailable,
    expiresAt:         listing.expiresAt,
    images:            [],  // new uploads only; existing shown via initialImageUrls
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/my-listings')}
          className="text-sm mb-4 inline-block"
          style={{ color: 'var(--color-muted)' }}
        >
          ← My Listings
        </button>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Edit Product
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
          Saving will send this listing back for moderator review.
        </p>
      </div>

      <ProductForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        initialImageUrls={retainedUrls}
        onInitialImageUrlsChange={setRetainedUrls}
      />
    </div>
  );
}
